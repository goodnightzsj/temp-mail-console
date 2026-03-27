import PostalMime from "postal-mime";
import { getForwardingSettings, loadRules, loadWhitelist, saveEmail } from "./db.js";
import {
  MATCH_CONTEXT_RADIUS,
  MAX_CONTENT_SUMMARY_CHARS,
  MAX_MATCH_CONTENT_CHARS,
  MAX_RULE_MATCHES_PER_RULE,
  MAX_RULE_PATTERN_LENGTH,
  MAX_SENDER_PATTERN_LENGTH
} from "../utils/constants.js";
import { normalizeWhitespace, splitPatternList, stripHtml, summarizeText } from "../utils/utils.js";
import { applySiteParsers } from "../site-parsers/index.js";

const MATCH_SCOPE_LABELS = {
  subject: "Subject",
  text: "Text",
  htmlText: "HTML Text",
  rawHtml: "Raw HTML"
};

const SOURCE_PRIORITY = {
  site_parser: 300,
  builtin: 200,
  custom: 100
};

const KIND_PRIORITY = {
  invite: 40,
  link: 30,
  code: 20,
  notice: 10,
  unknown: 0
};

const REGEX_CACHE = new Map();
const PATTERN_LIST_CACHE = new Map();

const BUILTIN_RULES = [
  {
    key: "builtin_digits",
    source: "builtin",
    remark: "数字",
    pattern: "\\b\\d{4,8}\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["subject", "text", "htmlText"],
    description: "提取 4 到 8 位连续数字，适合大多数验证码与一次性口令。"
  },
  {
    key: "builtin_alpha_numeric",
    source: "builtin",
    remark: "英文+数字",
    pattern: "\\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\\d)[A-Za-z0-9]{6,24}\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["subject", "text", "htmlText"],
    description: "提取同时包含字母与数字的连续串，适合邀请码、设备码与会话标识。"
  },
  {
    key: "builtin_alpha_dash_numeric",
    source: "builtin",
    remark: "英文-数字",
    pattern: "\\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*\\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["subject", "text", "htmlText"],
    description: "提取连字符代码，例如 ZKI-123、ZKI-7RO、231-7RO 或更长的混合标识。"
  },
  {
    key: "builtin_link",
    source: "builtin",
    remark: "链接",
    pattern: "https?:\\/\\/[^\\s<>\"]+",
    flags: "gm",
    multiple: true,
    match_kind: "link",
    scopes: ["subject", "text", "htmlText", "rawHtml"],
    description: "提取 http 与 https 链接，适合激活、重置密码和邮箱验证场景。"
  },
  {
    key: "builtin_deactivation_notice",
    source: "builtin",
    remark: "封禁邮件",
    pattern: "(?:access\\s+deactivated|deactivating\\s+your\\s+access|not\\s+permitted\\s+under\\s+our\\s+policies|initiate\\s+an\\s+appeal|(?:account|access)\\s+(?:has\\s+been\\s+)?suspend(?:ed|ing)?)",
    flags: "im",
    multiple: false,
    match_kind: "notice",
    scopes: ["subject", "text", "htmlText"],
    description: "识别封禁、停用、申诉入口或风控停权通知，适合平台账号巡检。"
  }
];

export function getBuiltinRuleCatalog() {
  return BUILTIN_RULES.map((rule) => ({
    key: rule.key,
    source: rule.source,
    remark: rule.remark,
    pattern: rule.pattern,
    flags: rule.flags,
    multiple: Boolean(rule.multiple),
    match_kind: rule.match_kind || null,
    scopes: Array.isArray(rule.scopes) ? [...rule.scopes] : ["subject", "text", "htmlText"],
    description: rule.description || "",
    sender_filter: ""
  }));
}

function getCachedRegex(pattern, flags = "") {
  const key = `${flags}\u0000${pattern}`;
  if (!REGEX_CACHE.has(key)) {
    try {
      REGEX_CACHE.set(key, new RegExp(pattern, flags));
    } catch {
      REGEX_CACHE.set(key, null);
    }
  }
  const regex = REGEX_CACHE.get(key);
  if (regex) regex.lastIndex = 0;
  return regex;
}

function getCompiledPatternList(input, flags = "i") {
  const normalized = String(input || "").trim();
  const key = `${flags}\u0000${normalized}`;
  if (!PATTERN_LIST_CACHE.has(key)) {
    const compiled = splitPatternList(normalized)
      .filter((pattern) => pattern.length > 0 && pattern.length <= MAX_SENDER_PATTERN_LENGTH)
      .map((pattern) => ({ pattern, regex: getCachedRegex(pattern, flags) }))
      .filter((item) => item.regex instanceof RegExp);
    PATTERN_LIST_CACHE.set(key, compiled);
  }
  return PATTERN_LIST_CACHE.get(key) || [];
}

function testRegex(regex, value) {
  if (!(regex instanceof RegExp)) return false;
  regex.lastIndex = 0;
  return regex.test(String(value || ""));
}

function senderMatchesCompiled(senderValue, compiledPatterns) {
  const items = Array.isArray(compiledPatterns) ? compiledPatterns : [];
  if (items.length === 0) return true;
  return items.some(({ regex }) => testRegex(regex, senderValue));
}

function inferCustomRuleKind(rule) {
  const pattern = String(rule?.pattern || "");
  const normalizedPattern = pattern.toLowerCase();
  const hint = [rule?.remark, pattern].map((item) => String(item || "").toLowerCase()).join(" ");
  if (!hint) return "unknown";
  if (/(invite|invitation|join|邀请)/.test(hint)) return "invite";
  if (/(https?:|href|url|link|链接|重置|验证链接|确认链接)/.test(hint)) return "link";
  if (
    /\\d\{\d+(?:,\d+)?\}/.test(normalizedPattern)
    || normalizedPattern.includes("[a-za-z0-9]")
    || normalizedPattern.includes("[a-z0-9]")
    || normalizedPattern.includes("(?:-")
  ) return "code";
  if (/(验证码|校验码|确认码|otp|one[-\s]*time|verification\s*code|login\s*code|security\s*code|code|token)/.test(hint)) return "code";
  if (/(封禁|停用|suspend|deactivat|appeal|policy)/.test(hint)) return "notice";
  return "unknown";
}

function inferCustomRuleScopes(rule) {
  const hint = [rule?.remark, rule?.pattern].map((item) => String(item || "").toLowerCase()).join(" ");
  const scopes = new Set(["subject", "text", "htmlText"]);
  if (/(https?:|href=|src=|<a|<div|<span|<\/|&quot;|&amp;|mailto:)/.test(hint)) {
    scopes.add("rawHtml");
  }
  return Array.from(scopes);
}

function buildMatchIdentity(match) {
  const value = String(match?.value || "").trim();
  if (!value) return "";
  const kind = String(match?.kind || "unknown").trim().toLowerCase() || "unknown";

  if (kind === "link" || kind === "invite") {
    return `${kind}::${value.replace(/[).,;"'<>]+$/g, "").trim()}`;
  }

  if (kind === "code") {
    return `${kind}::${value.replace(/\s+/g, "").toUpperCase()}`;
  }

  return `${kind}::${value.toLowerCase()}`;
}

function getMatchRank(match) {
  const source = String(match?.source || "").trim().toLowerCase();
  const kind = String(match?.kind || "unknown").trim().toLowerCase() || "unknown";
  let score = SOURCE_PRIORITY[source] || 0;
  score += KIND_PRIORITY[kind] || 0;
  if (source === "site_parser" && match?.plugin_key) score += 20;
  if (source === "builtin" && match?.rule_key) score += 10;
  if (kind !== "unknown") score += 5;
  if (String(match?.remark || "").trim()) score += 1;
  return score;
}

function mergeMatches(siteParserMatches, ruleMatches) {
  const consolidated = [];
  const grouped = new Map();

  for (const match of [
    ...(Array.isArray(siteParserMatches) ? siteParserMatches : []),
    ...(Array.isArray(ruleMatches) ? ruleMatches : [])
  ]) {
    const identity = buildMatchIdentity(match);
    if (!identity) {
      consolidated.push(match);
      continue;
    }

    const current = grouped.get(identity);
    if (!current || getMatchRank(match) > getMatchRank(current)) {
      grouped.set(identity, match);
    }
  }

  consolidated.push(...grouped.values());
  return consolidated.sort((left, right) => getMatchRank(right) - getMatchRank(left));
}

async function parseIncomingEmail(message) {
  const rawBuffer = await new Response(message.raw).arrayBuffer();
  const parsed = await new PostalMime().parse(rawBuffer);
  const toList = Array.isArray(parsed.to) ? parsed.to : [];

  return {
    from: parsed.from?.address || "",
    to: toList.map((item) => item.address).filter(Boolean),
    subject: parsed.subject || "",
    text: parsed.text || "",
    html: parsed.html || ""
  };
}

function buildContentSummary(parsed) {
  const preferred = String(parsed.text || "").trim() || stripHtml(parsed.html) || parsed.subject || "";
  return summarizeText(preferred, MAX_CONTENT_SUMMARY_CHARS);
}

function buildRuleInputs(parsed) {
  return {
    subject: String(parsed.subject || "").trim(),
    text: String(parsed.text || "").trim(),
    htmlText: stripHtml(parsed.html),
    rawHtml: String(parsed.html || "").trim()
  };
}

function buildMatchContent(parsed) {
  const candidates = [
    { label: "Subject", value: String(parsed.subject || "").trim() },
    { label: "Text", value: String(parsed.text || "").trim() },
    { label: "HTML Text", value: stripHtml(parsed.html) },
    { label: "Raw HTML", value: String(parsed.html || "").trim() }
  ];
  const seen = new Set();
  const parts = [];

  for (const item of candidates) {
    const normalized = normalizeWhitespace(item.value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    parts.push(`${item.label}:\n${item.value}`);
  }

  return parts.join("\n").slice(0, MAX_MATCH_CONTENT_CHARS);
}

function senderInWhitelist(sender, whitelist) {
  if (whitelist.length === 0) return true;
  const senderValue = String(sender || "").toLowerCase();
  return whitelist.some(({ sender_pattern }) => {
    const pattern = String(sender_pattern || "");
    if (!pattern || pattern.length > MAX_SENDER_PATTERN_LENGTH) return false;
    const regex = getCachedRegex(pattern, "i");
    return testRegex(regex, senderValue);
  });
}

function buildScopedMatchContent(contentByScope, scopes, contentCache) {
  const scopeList = Array.isArray(scopes) && scopes.length > 0 ? scopes : ["subject", "text", "htmlText"];
  const cacheKey = scopeList.join("|");
  if (contentCache.has(cacheKey)) return contentCache.get(cacheKey);

  const seen = new Set();
  const parts = [];
  for (const scope of scopeList) {
    const value = String(contentByScope?.[scope] || "");
    const normalized = normalizeWhitespace(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    parts.push(`${MATCH_SCOPE_LABELS[scope] || scope}:\n${value}`);
  }

  const joined = parts.join("\n").slice(0, MAX_MATCH_CONTENT_CHARS);
  contentCache.set(cacheKey, joined);
  return joined;
}

function buildSnippet(content, start, end) {
  return summarizeText(content.slice(start, end), MATCH_CONTEXT_RADIUS);
}

function buildMatchContext(content, index, value) {
  const safeContent = String(content || "");
  const start = Math.max(0, index - MATCH_CONTEXT_RADIUS);
  const end = Math.min(safeContent.length, index + String(value || "").length + MATCH_CONTEXT_RADIUS);
  return {
    before: buildSnippet(safeContent, start, index),
    after: buildSnippet(safeContent, index + String(value || "").length, end)
  };
}

function normalizeCustomRule(rule) {
  return {
    id: Number(rule.id),
    key: null,
    source: "custom",
    remark: rule.remark || null,
    sender_filter: rule.sender_filter || "",
    pattern: String(rule.pattern || ""),
    flags: "m",
    multiple: false,
    match_kind: inferCustomRuleKind(rule),
    scopes: inferCustomRuleScopes(rule)
  };
}

function compileRule(rule) {
  const pattern = String(rule.pattern || "");
  if (!pattern || pattern.length > MAX_RULE_PATTERN_LENGTH) return null;
  const baseFlags = String(rule.flags || "m");
  const regexFlags = rule.multiple && !baseFlags.includes("g") ? `${baseFlags}g` : baseFlags;
  const compiledRegex = getCachedRegex(pattern, regexFlags);
  if (!(compiledRegex instanceof RegExp)) return null;

  return {
    ...rule,
    compiled_regex: compiledRegex,
    compiled_sender_patterns: getCompiledPatternList(rule.sender_filter, "i"),
    match_kind: String(rule.match_kind || "unknown").trim().toLowerCase() || "unknown",
    scopes: Array.isArray(rule.scopes) && rule.scopes.length > 0 ? [...rule.scopes] : ["subject", "text", "htmlText"]
  };
}

function selectRules(customRules, builtinRuleMode) {
  const normalizedCustom = customRules.map(normalizeCustomRule).map(compileRule).filter(Boolean);
  const compiledBuiltin = BUILTIN_RULES.map(compileRule).filter(Boolean);
  const mode = String(builtinRuleMode || "append");
  if (mode === "builtin_only") return compiledBuiltin;
  if (mode === "custom_only") return normalizedCustom;
  return [...compiledBuiltin, ...normalizedCustom];
}

function collectSuppressedBuiltinKinds(siteParserMatches) {
  const suppressed = new Set();
  for (const match of Array.isArray(siteParserMatches) ? siteParserMatches : []) {
    const kind = String(match?.kind || "").trim().toLowerCase();
    if (kind === "code" || kind === "link" || kind === "invite") {
      suppressed.add(kind === "invite" ? "link" : kind);
    }
  }
  return suppressed;
}

function applyRules(contentByScope, sender, rules, options = {}) {
  const senderValue = String(sender || "").toLowerCase();
  const outputs = [];
  const contentCache = new Map();
  const suppressedBuiltinKinds = options.suppressedBuiltinKinds || new Set();

  for (const rule of rules) {
    if (!rule) continue;
    if (rule.source === "builtin" && suppressedBuiltinKinds.has(rule.match_kind)) continue;
    if (!senderMatchesCompiled(senderValue, rule.compiled_sender_patterns)) continue;
    try {
      const regex = rule.compiled_regex;
      if (!(regex instanceof RegExp)) continue;
      const safeContent = buildScopedMatchContent(contentByScope, rule.scopes, contentCache);
      if (!safeContent) continue;
      const seenValues = new Set();
      let captured = 0;
      regex.lastIndex = 0;

      while (captured < MAX_RULE_MATCHES_PER_RULE) {
        const match = regex.exec(safeContent);
        if (!match?.[0]) break;

        const value = String(match[0]);
        if (!seenValues.has(value)) {
          const context = buildMatchContext(safeContent, Number(match.index || 0), value);
          outputs.push({
            rule_id: Number.isFinite(rule.id) ? Number(rule.id) : null,
            rule_key: rule.key || null,
            source: rule.source || "custom",
            remark: rule.remark || null,
            kind: rule.match_kind || "unknown",
            value,
            match: value,
            before: context.before,
            after: context.after
          });
          seenValues.add(value);
          captured += 1;
        }

        if (!regexFlags.includes("g")) break;
        if (value.length === 0) regex.lastIndex += 1;
      }
    } catch {
      continue;
    }
  }

  return outputs;
}

export async function processIncomingEmail(message, env, ctx) {
  const parsed = await parseIncomingEmail(message);

  parsed.from = String(parsed.from || "").toLowerCase();
  parsed.to = Array.isArray(parsed.to) ? parsed.to.map((a) => String(a || "").toLowerCase()) : [];

  const whitelist = await loadWhitelist(env.DB);
  if (!senderInWhitelist(parsed.from, whitelist)) return null;

  const [customRules, settings] = await Promise.all([
    loadRules(env.DB),
    getForwardingSettings(env.DB).catch(() => ({ builtin_rule_mode: "append" }))
  ]);

  const contentByScope = buildRuleInputs(parsed);
  const matchContent = buildMatchContent(parsed);
  const contentSummary = buildContentSummary(parsed);
  const activeRules = selectRules(customRules, settings.builtin_rule_mode);
  const siteParserMatches = applySiteParsers(parsed, matchContent);
  const suppressedBuiltinKinds = collectSuppressedBuiltinKinds(siteParserMatches);
  const ruleMatches = applyRules(contentByScope, parsed.from, activeRules, { suppressedBuiltinKinds });
  const matches = mergeMatches(siteParserMatches, ruleMatches);

  ctx.waitUntil(saveEmail(env.DB, {
    ...parsed,
    content_summary: contentSummary,
    matches
  }));

  return {
    parsed,
    matches,
    content_summary: contentSummary
  };
}
