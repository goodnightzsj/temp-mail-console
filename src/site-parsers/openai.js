import {
  buildSiteParserResult,
  collectUrls,
  dedupeSiteParserResults,
  normalizeAlphaNumeric
} from "./shared.js";

const OPENAI_SUBJECT_PATTERNS = [
  /(?:your\s+chatgpt\s+code\s+(?:is|was)|你的\s*chatgpt\s*代码(?:为|是))[^0-9A-Za-z]{0,16}(\d{6})/i,
  /(?:verification\s*code|login\s*code|security\s*code|temporary\s+verification\s+code|验证码|校验码|驗證碼|代码)(?:\s+(?:is|are|was|为|是))?[^0-9A-Za-z]{0,16}(\d{6})/i,
  /\b(\d{6})\b/
];

const OPENAI_BODY_PATTERNS = [
  /(?:enter\s+this\s+temporary\s+verification\s+code\s+to\s+continue|输入此临时验证码以继续|输入临时验证码以继续)(?:\s+(?:is|are|was|为|是))?[^0-9A-Za-z]{0,32}(\d{6})/i,
  /(?:verification\s*code|login\s*code|security\s*code|one[-\s]*time\s*(?:code|password)|otp|验证码|校验码|驗證碼|输入验证码|输入此验证码|use\s+this\s+code|enter\s+(?:this\s+)?code)(?:\s+(?:is|are|was|为|是))?[^0-9A-Za-z]{0,24}(\d{6})/i,
  /\b(\d{6})\b[^0-9A-Za-z]{0,24}(?:is\s+your\s+(?:verification|login|security)\s*code|verification\s*code|login\s*code|security\s*code|one[-\s]*time\s*(?:code|password)|otp|验证码|校验码|驗證碼)/i
];

const OPENAI_OTP_CONTEXT = /(?:temporary\s+verification\s+code|verification\s*code|login\s*code|security\s*code|one[-\s]*time\s*(?:code|password)|otp|临时验证码|验证码|校验码|驗證碼|use\s+this\s+code|enter\s+(?:this\s+)?code)/i;

function extractOpenAiCode(subject, visibleText) {
  for (const pattern of OPENAI_SUBJECT_PATTERNS) {
    const match = pattern.exec(subject);
    if (match?.[1]) return match[1];
  }

  for (const pattern of OPENAI_BODY_PATTERNS) {
    const match = pattern.exec(visibleText);
    if (match?.[1]) return match[1];
  }

  if (!OPENAI_OTP_CONTEXT.test(visibleText)) return null;

  const candidates = Array.from(new Set((visibleText.match(/\b\d{6}\b/g) || []).map((item) => item.trim())));
  return candidates.length === 1 ? candidates[0] : null;
}

function extractVerifyLink(runtime) {
  const hrefMatch = /href="(https?:\/\/[^"]*verify[^"]*)"/i.exec(runtime.html);
  if (hrefMatch?.[1]) return hrefMatch[1];

  const urlMatch = collectUrls([runtime.html, runtime.text, runtime.subject].join("\n")).find((url) => (
    /chatgpt\.com|chat\.openai\.com/i.test(url) && /verify/i.test(url)
  ));
  return urlMatch || null;
}

function extractInviteLink(runtime) {
  return collectUrls([runtime.html, runtime.text, runtime.subject].join("\n")).find((url) => {
    if (!/chatgpt\.com|chat\.openai\.com/i.test(url)) return false;
    if (/(invite|invitation|join)/i.test(url)) return true;
    try {
      const parsed = new URL(url);
      const keys = new Set(Array.from(parsed.searchParams.keys()).map((item) => item.toLowerCase()));
      return parsed.pathname.toLowerCase().includes("/auth/login")
        && (keys.has("accept_wid") || (keys.has("inv_email") && keys.has("wid")));
    } catch {
      return false;
    }
  }) || null;
}

export default {
  key: "openai",
  site_key: "openai",
  display_name: "OpenAI / ChatGPT",
  description: "针对 OpenAI / ChatGPT 验证码、验证链接和 Team 邀请链接做语义提取。",
  sender_keywords: ["openai", "chatgpt", "verify"],
  verify_keywords: ["verification", "code", "otp", "验证码", "代码", "invite", "join"],
  platform_hints: ["openai", "chatgpt", "chat.openai.com", "chatgpt.com"],
  extract(runtime) {
    const outputs = [];
    const code = extractOpenAiCode(runtime.subject, runtime.htmlText || runtime.text);
    if (code) {
      outputs.push(buildSiteParserResult(this, runtime.matchContent, {
        kind: "code",
        remark: "OpenAI 验证码",
        value: normalizeAlphaNumeric(code)
      }));
    }

    const verifyLink = extractVerifyLink(runtime);
    if (verifyLink) {
      outputs.push(buildSiteParserResult(this, runtime.matchContent, {
        kind: "link",
        remark: "OpenAI 验证链接",
        value: verifyLink
      }));
    }

    const inviteLink = extractInviteLink(runtime);
    if (inviteLink) {
      outputs.push(buildSiteParserResult(this, runtime.matchContent, {
        kind: "invite",
        remark: "OpenAI Team 邀请链接",
        value: inviteLink
      }));
    }

    return dedupeSiteParserResults(outputs);
  }
};
