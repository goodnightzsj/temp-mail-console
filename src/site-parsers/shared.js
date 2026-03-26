import { MATCH_CONTEXT_RADIUS, MAX_RULE_MATCHES_PER_RULE } from "../utils/constants.js";
import { normalizeWhitespace } from "../utils/utils.js";

function buildSnippet(content, start, end) {
  return normalizeWhitespace(String(content || "").slice(start, end));
}

export function buildMatchContext(content, value) {
  const safeContent = String(content || "");
  const safeValue = String(value || "");
  if (!safeContent || !safeValue) return { before: "", after: "" };

  const index = safeContent.toLowerCase().indexOf(safeValue.toLowerCase());
  if (index < 0) return { before: "", after: "" };

  const start = Math.max(0, index - MATCH_CONTEXT_RADIUS);
  const end = Math.min(safeContent.length, index + safeValue.length + MATCH_CONTEXT_RADIUS);
  return {
    before: buildSnippet(safeContent, start, index),
    after: buildSnippet(safeContent, index + safeValue.length, end)
  };
}

export function htmlToVisibleText(value) {
  return String(value || "")
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|tr|td|th|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function normalizeAlphaNumeric(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

export function hasAnyKeyword(haystacks, keywords) {
  const candidates = Array.isArray(haystacks) ? haystacks : [haystacks];
  const normalized = candidates.map((item) => String(item || "").toLowerCase()).filter(Boolean);
  return (keywords || []).some((keyword) => {
    const needle = String(keyword || "").trim().toLowerCase();
    return needle && normalized.some((haystack) => haystack.includes(needle));
  });
}

export function collectUrls(text) {
  const matches = [];
  const regex = /https?:\/\/[^\s"'<>]+/gim;
  const raw = String(text || "");
  let match;

  while ((match = regex.exec(raw)) !== null) {
    const url = String(match[0] || "").replace(/[).,;"'<>]+$/g, "");
    if (url) matches.push(url);
    if (!match[0]) regex.lastIndex += 1;
  }

  return matches;
}

export function extractByPatterns(text, patterns, flags = "i") {
  const raw = String(text || "");
  if (!raw) return null;

  for (const pattern of patterns || []) {
    try {
      const match = new RegExp(pattern, flags).exec(raw);
      if (!match) continue;
      return match[1] || match[0] || null;
    } catch {
      continue;
    }
  }

  return null;
}

export function buildSiteParserResult(parser, content, match) {
  const value = String(match?.value || "").trim();
  const context = buildMatchContext(content, value);

  return {
    rule_id: null,
    rule_key: null,
    plugin_key: parser.key,
    site_key: parser.site_key || parser.key,
    source: "site_parser",
    remark: match?.remark || parser.display_name || parser.key,
    value,
    match: value,
    before: context.before,
    after: context.after,
    kind: match?.kind || null
  };
}

export function dedupeSiteParserResults(results) {
  const outputs = [];
  const seen = new Set();

  for (const item of Array.isArray(results) ? results : []) {
    const key = [
      item?.source || "",
      item?.plugin_key || "",
      item?.remark || "",
      String(item?.value || "").toLowerCase()
    ].join("::");
    if (!item?.value || seen.has(key)) continue;
    seen.add(key);
    outputs.push(item);
    if (outputs.length >= MAX_RULE_MATCHES_PER_RULE * 2) break;
  }

  return outputs;
}

export function buildParserRuntime(parsed, matchContent) {
  const subject = String(parsed?.subject || "");
  const text = String(parsed?.text || "");
  const html = String(parsed?.html || "");
  const htmlText = htmlToVisibleText(html);
  const sender = String(parsed?.from || "").toLowerCase();
  const recipientList = Array.isArray(parsed?.to) ? parsed.to.map((item) => String(item || "").toLowerCase()) : [];

  return {
    parsed,
    sender,
    recipients: recipientList,
    subject,
    text,
    html,
    htmlText,
    matchContent: String(matchContent || ""),
    subjectLower: subject.toLowerCase(),
    textLower: text.toLowerCase(),
    htmlLower: html.toLowerCase(),
    htmlTextLower: htmlText.toLowerCase()
  };
}

export function matchesParserCandidate(parser, runtime) {
  if (typeof parser.matches === "function") {
    try {
      return Boolean(parser.matches(runtime));
    } catch {
      return false;
    }
  }

  const senderHaystacks = [runtime.sender, runtime.subjectLower];
  const verifyHaystacks = [runtime.subjectLower, runtime.textLower, runtime.htmlTextLower];
  const platformHaystacks = [runtime.sender, runtime.subjectLower, runtime.textLower, runtime.htmlTextLower, runtime.htmlLower];

  if (Array.isArray(parser.sender_keywords) && parser.sender_keywords.length > 0) {
    const senderMatched = hasAnyKeyword(
      parser.check_body_for_sender ? [...senderHaystacks, runtime.textLower, runtime.htmlTextLower] : senderHaystacks,
      parser.sender_keywords
    );
    if (!senderMatched) return false;
  }

  if (Array.isArray(parser.verify_keywords) && parser.verify_keywords.length > 0) {
    if (!hasAnyKeyword(verifyHaystacks, parser.verify_keywords)) return false;
  }

  if (Array.isArray(parser.platform_hints) && parser.platform_hints.length > 0) {
    if (!hasAnyKeyword(platformHaystacks, parser.platform_hints)) return false;
  }

  return true;
}
