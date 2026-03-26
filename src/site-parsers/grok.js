import {
  buildSiteParserResult,
  dedupeSiteParserResults
} from "./shared.js";

const SUBJECT_PATTERNS = [
  /\b([A-Z0-9]{3}-[A-Z0-9]{3})\b\s+(?:xai|x\.ai|grok)\s+confirmation\s+code\b/i,
  /(?:xai|x\.ai|grok)\s+confirmation\s+code[^A-Z0-9]{0,16}\b([A-Z0-9]{3}-[A-Z0-9]{3})\b/i
];

const HYphen_CODE = /\b([A-Z0-9]{3}-[A-Z0-9]{3})\b/i;
const COMPACT_CODE = /\b([A-Z0-9]{6})\b/i;
const DIGIT_CODE = /\b(\d{6})\b/;

function extractGrokCode(text) {
  const raw = String(text || "");
  if (!raw) return null;

  for (const pattern of SUBJECT_PATTERNS) {
    const match = pattern.exec(raw);
    if (match?.[1]) return match[1].toUpperCase();
  }

  const hyphenMatch = HYphen_CODE.exec(raw);
  if (hyphenMatch?.[1]) return hyphenMatch[1].toUpperCase();

  const compactMatch = COMPACT_CODE.exec(raw);
  if (compactMatch?.[1]) return compactMatch[1].toUpperCase();

  const digitMatch = DIGIT_CODE.exec(raw);
  return digitMatch?.[1] || null;
}

export default {
  key: "grok",
  site_key: "grok",
  display_name: "xAI / Grok",
  description: "针对 xAI / Grok 的确认码做格式化提取，支持 3-3 字母数字和 6 位紧凑串。",
  sender_keywords: ["x.ai", "grok", "xai", "verify"],
  verify_keywords: ["verif", "verify", "code", "confirm", "chatgpt"],
  platform_hints: ["x.ai", "xai", "grok", "accounts.x.ai"],
  check_body_for_sender: true,
  extract(runtime) {
    const code = extractGrokCode(runtime.subject) || extractGrokCode(runtime.htmlText) || extractGrokCode(runtime.text);
    if (!code) return [];

    return dedupeSiteParserResults([
      buildSiteParserResult(this, runtime.matchContent, {
        kind: "code",
        remark: "Grok 确认码",
        value: code
      })
    ]);
  }
};
