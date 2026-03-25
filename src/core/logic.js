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
import { normalizeWhitespace, stripHtml, summarizeText } from "../utils/utils.js";

const BUILTIN_RULES = [
  {
    key: "builtin_digits",
    source: "builtin",
    remark: "数字",
    pattern: "\\b\\d{4,8}\\b",
    flags: "gm",
    multiple: true,
    description: "提取 4 到 8 位连续数字，适合大多数验证码与一次性口令。"
  },
  {
    key: "builtin_alpha_numeric",
    source: "builtin",
    remark: "英文+数字",
    pattern: "\\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\\d)[A-Za-z0-9]{6,24}\\b",
    flags: "gm",
    multiple: true,
    description: "提取同时包含字母与数字的连续串，适合邀请码、设备码与会话标识。"
  },
  {
    key: "builtin_alpha_dash_numeric",
    source: "builtin",
    remark: "英文-数字",
    pattern: "\\b(?=[A-Za-z0-9-]*[A-Za-z])(?=[A-Za-z0-9-]*\\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\\b",
    flags: "gm",
    multiple: true,
    description: "提取连字符代码，例如 ZKI-123、ZKI-7RO、231-7RO 或更长的混合标识。"
  },
  {
    key: "builtin_link",
    source: "builtin",
    remark: "链接",
    pattern: "https?:\\/\\/[^\\s<>\"]+",
    flags: "gm",
    multiple: true,
    description: "提取 http 与 https 链接，适合激活、重置密码和邮箱验证场景。"
  },
  {
    key: "builtin_deactivation_notice",
    source: "builtin",
    remark: "封禁邮件",
    pattern: "(?:access\\s+deactivated|deactivating\\s+your\\s+access|not\\s+permitted\\s+under\\s+our\\s+policies|initiate\\s+an\\s+appeal|(?:account|access)\\s+(?:has\\s+been\\s+)?suspend(?:ed|ing)?)",
    flags: "im",
    multiple: false,
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
    description: rule.description || "",
    sender_filter: ""
  }));
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
    try { return new RegExp(pattern, "i").test(senderValue); } catch { return false; }
  });
}

function senderMatches(senderValue, filterValue) {
  const filter = String(filterValue || "").trim();
  if (!filter) return true;
  const parts = filter.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  return parts.length === 0 || parts.some((pattern) => {
    if (!pattern || pattern.length > MAX_SENDER_PATTERN_LENGTH) return false;
    try { return new RegExp(pattern, "i").test(senderValue); } catch { return false; }
  });
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
    multiple: false
  };
}

function selectRules(customRules, builtinRuleMode) {
  const normalizedCustom = customRules.map(normalizeCustomRule);
  const mode = String(builtinRuleMode || "append");
  if (mode === "builtin_only") return BUILTIN_RULES;
  if (mode === "custom_only") return normalizedCustom;
  return [...normalizedCustom, ...BUILTIN_RULES];
}

function applyRules(content, sender, rules) {
  const senderValue = String(sender || "").toLowerCase();
  const safeContent = String(content || "").slice(0, MAX_MATCH_CONTENT_CHARS);
  const outputs = [];

  for (const rule of rules) {
    if (!senderMatches(senderValue, rule.sender_filter)) continue;
    try {
      const pattern = String(rule.pattern || "");
      if (!pattern || pattern.length > MAX_RULE_PATTERN_LENGTH) continue;
      const baseFlags = String(rule.flags || "m");
      const regexFlags = rule.multiple && !baseFlags.includes("g") ? `${baseFlags}g` : baseFlags;
      const regex = new RegExp(pattern, regexFlags);
      const seenValues = new Set();
      let captured = 0;

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

  const matchContent = buildMatchContent(parsed);
  const contentSummary = buildContentSummary(parsed);
  const activeRules = selectRules(customRules, settings.builtin_rule_mode);
  const matches = applyRules(matchContent, parsed.from, activeRules);

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
