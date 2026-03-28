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
const BODY_CODE_CONTEXT_RADIUS = 120;
const BODY_CODE_HINT_REGEX = /(?:verification\s*code|verification\s*codes?|confirm(?:ation)?\s*code|security\s*code|login\s*code|one[-\s]*time\s*(?:code|password)|otp|passcode|pin\s*code|enter\s+(?:the\s+)?code|use\s+(?:this|the)\s+code|verify\s+your\s+(?:email|account)|code\s+in\s+[A-Za-z][A-Za-z0-9 _-]{1,24}|验证码|校验码|驗證碼|确认码|確認碼|动态码|動態碼|授权码|授權碼|输入(?:下方|以下|收到的)?验证码|輸入(?:下方|以下|收到的)?驗證碼|验证您的(?:邮箱|郵箱|邮件|郵件|账户|帳戶|账号|帳號)|驗證您的(?:郵箱|郵件|賬戶|帳戶|賬號|帳號)|驗證碼|驗證您的郵箱|驗證您的帳戶|验证代码|驗證代碼)/i;
const BODY_PROTECTED_TOKEN_REGEX = /https?:\/\/[^\s"'<>]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gim;
const BODY_LINK_CONTEXT_RADIUS = 96;
const BODY_LINK_HINT_REGEX = /(?:verify(?:\s+your)?|verification|confirm|confirmation|activate|activation|reset|password\s+reset|magic\s+link|review|approve|accept|accept\s+invite|join|join\s+workspace|workspace|continue|open|launch|complete\s+signup|complete\s+registration|email\s+verification|click\s+(?:the|this)?\s*(?:button|link)?|use\s+(?:this|the)\s+link|验证|驗證|确认|確認|激活|啟用|重置|加入|加入工作空间|加入工作空間|接受邀请|接受邀請|继续|繼續|打开|開啟|完成注册|完成註冊|邮箱验证|郵箱驗證|邮件验证|郵件驗證|点击(?:下方|下面)?(?:按钮|按鈕|链接|鏈接)?|請點擊|请点击)/i;
const BODY_LINK_CTA_TEXT_REGEX = /(?:verify|verification|confirm|activate|reset|magic\s+link|accept|join|workspace|continue|open|review|approve|验证|驗證|确认|確認|激活|重置|加入|工作空间|工作空間|继续|繼續|点击|點擊|接受邀请|接受邀請)/i;
const BODY_LINK_NEGATIVE_TEXT_REGEX = /(?:help\s*center|help\b|support\b|faq\b|docs?\b|documentation|learn\s+more|contact\s+us|privacy|terms|帮助中心|帮助文档|幫助中心|幫助文件|文档中心|文件中心|客服|支持中心|說明中心|说明中心)/i;
const BODY_LINK_URL_HINT_REGEX = /(?:verify|verification|confirm|activate|reset|magic|invite|accept|join|auth|login|signup|register|callback|ticket|token|redeem|approve|workspace)/i;
const BODY_LINK_NEGATIVE_URL_REGEX = /(?:\/docs?(?:\/|$)|\/help(?:\/|$)|\/support(?:\/|$)|\/faq(?:\/|$)|\/learn(?:\/|$)|\/guide(?:\/|$)|\/kb(?:\/|$)|\/knowledge(?:\/|$)|docs?\.)/i;
const ANCHOR_LINK_REGEX = /<a\b([^>]*?)href=(["'])(https?:\/\/[^"'<>]+)\2([^>]*)>([\s\S]*?)<\/a>/gim;

const BUILTIN_RULES = [
  {
    key: "builtin_digits",
    source: "builtin",
    remark: "数字",
    pattern: "\\b\\d{4,8}\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["text", "htmlText"],
    extractor_key: "contextual_body_code",
    description: "只从正文提取 4 到 8 位连续数字，并要求周围出现中英文验证码语义。"
  },
  {
    key: "builtin_alpha_numeric",
    source: "builtin",
    remark: "英文+数字",
    pattern: "\\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\\d)[A-Za-z0-9]{6,24}\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["text", "htmlText"],
    extractor_key: "contextual_body_code",
    description: "只从正文提取同时包含字母与数字的候选码，并要求周围出现中英文验证码语义。"
  },
  {
    key: "builtin_alpha_dash_numeric",
    source: "builtin",
    remark: "英文-数字",
    pattern: "\\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*\\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\\b",
    flags: "gm",
    multiple: true,
    match_kind: "code",
    scopes: ["text", "htmlText"],
    extractor_key: "contextual_body_code",
    description: "只从正文提取连字符候选码，并要求周围出现中英文验证码语义。"
  },
  {
    key: "builtin_link",
    source: "builtin",
    remark: "链接",
    pattern: "https?:\\/\\/[^\\s<>\"]+",
    flags: "gm",
    multiple: true,
    match_kind: "link",
    scopes: ["text", "htmlText", "rawHtml"],
    extractor_key: "contextual_body_link",
    description: "只从正文提取验证动作链接，优先识别按钮/CTA 语法里的 href，再回退到带验证语义上下文的正文 URL。"
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

function buildBodyOnlyCodeContent(contentByScope) {
  const candidates = [
    String(contentByScope?.text || "").trim(),
    String(contentByScope?.htmlText || "").trim()
  ];
  const seen = new Set();
  const parts = [];

  for (const value of candidates) {
    const normalized = normalizeWhitespace(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    parts.push(value);
  }

  return parts.join("\n").slice(0, MAX_MATCH_CONTENT_CHARS);
}

function buildBodyTextContent(contentByScope) {
  const candidates = [
    String(contentByScope?.text || "").trim(),
    String(contentByScope?.htmlText || "").trim()
  ];
  const seen = new Set();
  const parts = [];

  for (const value of candidates) {
    const normalized = normalizeWhitespace(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    parts.push(value);
  }

  return parts.join("\n").slice(0, MAX_MATCH_CONTENT_CHARS);
}

function collectProtectedTokenRanges(content) {
  const ranges = [];
  const regex = getCachedRegex(BODY_PROTECTED_TOKEN_REGEX.source, BODY_PROTECTED_TOKEN_REGEX.flags);
  if (!(regex instanceof RegExp)) return ranges;
  const safeContent = String(content || "");
  regex.lastIndex = 0;
  let match;

  while ((match = regex.exec(safeContent)) !== null) {
    const value = String(match[0] || "");
    if (!value) {
      regex.lastIndex += 1;
      continue;
    }
    const start = Number(match.index || 0);
    ranges.push([start, start + value.length]);
  }

  return ranges;
}

function isProtectedTokenMatch(start, end, ranges) {
  return ranges.some(([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd);
}

function hasBodyCodeContext(content, index, valueLength) {
  const safeContent = String(content || "");
  const start = Math.max(0, index - BODY_CODE_CONTEXT_RADIUS);
  const end = Math.min(safeContent.length, index + Number(valueLength || 0) + BODY_CODE_CONTEXT_RADIUS);
  return BODY_CODE_HINT_REGEX.test(safeContent.slice(start, end));
}

function hasBodyLinkContext(content, index, valueLength) {
  const safeContent = String(content || "");
  const start = Math.max(0, index - BODY_LINK_CONTEXT_RADIUS);
  const end = Math.min(safeContent.length, index + Number(valueLength || 0) + BODY_LINK_CONTEXT_RADIUS);
  const snippet = safeContent.slice(start, end);
  return BODY_LINK_HINT_REGEX.test(snippet) && !BODY_LINK_NEGATIVE_TEXT_REGEX.test(snippet);
}

function buildInlineContext(content, index, valueLength) {
  const safeContent = String(content || "");
  const start = Number(index || 0);
  const end = start + Number(valueLength || 0);
  const lineStart = Math.max(
    safeContent.lastIndexOf("\n", start - 1),
    safeContent.lastIndexOf("\r", start - 1)
  );
  const lineEndCandidates = [
    safeContent.indexOf("\n", end),
    safeContent.indexOf("\r", end)
  ].filter((candidate) => candidate >= 0);
  const lineEnd = lineEndCandidates.length > 0 ? Math.min(...lineEndCandidates) : safeContent.length;
  return safeContent.slice(lineStart >= 0 ? lineStart + 1 : 0, lineEnd).trim();
}

function looksLikeActionLink(url) {
  const safeUrl = String(url || "").trim();
  if (!safeUrl || BODY_LINK_NEGATIVE_URL_REGEX.test(safeUrl)) return false;
  return BODY_LINK_URL_HINT_REGEX.test(safeUrl);
}

function isPositiveCtaText(text) {
  const safeText = normalizeWhitespace(String(text || ""));
  if (!safeText) return false;
  if (BODY_LINK_NEGATIVE_TEXT_REGEX.test(safeText)) return false;
  return BODY_LINK_CTA_TEXT_REGEX.test(safeText);
}

function shouldKeepBodyLink(content, index, valueLength, url) {
  const inlineContext = buildInlineContext(content, index, valueLength);
  if (BODY_LINK_NEGATIVE_TEXT_REGEX.test(inlineContext)) return false;
  if (looksLikeActionLink(url)) return true;
  return hasBodyLinkContext(content, index, valueLength);
}

function buildRuleMatchOutput(rule, content, index, value) {
  const context = buildMatchContext(content, index, value);
  return {
    rule_id: Number.isFinite(rule.id) ? Number(rule.id) : null,
    rule_key: rule.key || null,
    source: rule.source || "custom",
    remark: rule.remark || null,
    kind: rule.match_kind || "unknown",
    value,
    match: value,
    before: context.before,
    after: context.after
  };
}

function extractContextualBodyCodeMatches(rule, contentByScope) {
  const regex = rule?.compiled_regex;
  if (!(regex instanceof RegExp)) return [];

  const bodyContent = buildBodyOnlyCodeContent(contentByScope);
  if (!bodyContent) return [];

  const ranges = collectProtectedTokenRanges(bodyContent);
  const seenValues = new Set();
  const outputs = [];
  const candidateRegex = getCachedRegex(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
  if (!(candidateRegex instanceof RegExp)) return outputs;
  candidateRegex.lastIndex = 0;
  let match;

  while ((match = candidateRegex.exec(bodyContent)) !== null && outputs.length < MAX_RULE_MATCHES_PER_RULE) {
    const value = String(match[0] || "");
    if (!value) {
      candidateRegex.lastIndex += 1;
      continue;
    }

    const start = Number(match.index || 0);
    const end = start + value.length;
    if (isProtectedTokenMatch(start, end, ranges)) continue;
    if (!hasBodyCodeContext(bodyContent, start, value.length)) continue;
    if (seenValues.has(value)) continue;

    outputs.push(buildRuleMatchOutput(rule, bodyContent, start, value));
    seenValues.add(value);
  }

  return outputs;
}

function extractContextualBodyLinkMatches(rule, contentByScope) {
  const outputs = [];
  const seenValues = new Set();
  const rawHtml = String(contentByScope?.rawHtml || "").trim();
  const bodyText = buildBodyTextContent(contentByScope);

  const pushOutput = (content, index, value) => {
    const normalizedValue = String(value || "").replace(/[).,;"'<>]+$/g, "").trim();
    if (!normalizedValue || seenValues.has(normalizedValue) || outputs.length >= MAX_RULE_MATCHES_PER_RULE) return;
    outputs.push(buildRuleMatchOutput(rule, content, index, normalizedValue));
    seenValues.add(normalizedValue);
  };

  const anchorRegex = getCachedRegex(ANCHOR_LINK_REGEX.source, ANCHOR_LINK_REGEX.flags);
  if (anchorRegex instanceof RegExp && rawHtml) {
    anchorRegex.lastIndex = 0;
    let match;
    while ((match = anchorRegex.exec(rawHtml)) !== null && outputs.length < MAX_RULE_MATCHES_PER_RULE) {
      const url = String(match[3] || "");
      const innerText = stripHtml(match[5] || "");
      const htmlStart = Number(match.index || 0);
      const htmlSnippetStart = Math.max(0, htmlStart - BODY_LINK_CONTEXT_RADIUS);
      const htmlSnippetEnd = Math.min(rawHtml.length, htmlStart + String(match[0] || "").length + BODY_LINK_CONTEXT_RADIUS);
      const surroundingText = stripHtml(rawHtml.slice(htmlSnippetStart, htmlSnippetEnd));
      const hasPositiveAnchorText = isPositiveCtaText(innerText);
      const hasPositiveSurroundingText = hasBodyLinkContext(surroundingText, 0, surroundingText.length);
      if (!hasPositiveAnchorText && !(looksLikeActionLink(url) && hasPositiveSurroundingText)) continue;
      pushOutput(rawHtml, htmlStart + String(match[0] || "").indexOf(url), url);
    }
  }

  const urlRegex = getCachedRegex(rule.pattern, "gm");
  if (!(urlRegex instanceof RegExp) || !bodyText || outputs.length >= MAX_RULE_MATCHES_PER_RULE) return outputs;
  urlRegex.lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(bodyText)) !== null && outputs.length < MAX_RULE_MATCHES_PER_RULE) {
    const value = String(match[0] || "");
    if (!value) {
      urlRegex.lastIndex += 1;
      continue;
    }
    const start = Number(match.index || 0);
    if (!shouldKeepBodyLink(bodyText, start, value.length, value)) continue;
    pushOutput(bodyText, start, value);
  }

  return outputs;
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
    scopes: Array.isArray(rule.scopes) && rule.scopes.length > 0 ? [...rule.scopes] : ["subject", "text", "htmlText"],
    extractor:
      rule.extractor_key === "contextual_body_code"
        ? extractContextualBodyCodeMatches
        : rule.extractor_key === "contextual_body_link"
          ? extractContextualBodyLinkMatches
        : null
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
      if (typeof rule.extractor === "function") {
        outputs.push(...rule.extractor(rule, contentByScope));
        continue;
      }

      const regex = rule.compiled_regex;
      if (!(regex instanceof RegExp)) continue;
      const safeContent = buildScopedMatchContent(contentByScope, rule.scopes, contentCache);
      if (!safeContent) continue;
      const seenValues = new Set();
      let captured = 0;
      const isGlobal = regex.flags.includes("g");
      regex.lastIndex = 0;

      while (captured < MAX_RULE_MATCHES_PER_RULE) {
        const match = regex.exec(safeContent);
        if (!match?.[0]) break;

        const value = String(match[0]);
        if (!seenValues.has(value)) {
          outputs.push(buildRuleMatchOutput(rule, safeContent, Number(match.index || 0), value));
          seenValues.add(value);
          captured += 1;
        }

        if (!isGlobal) break;
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
