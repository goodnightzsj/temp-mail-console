import { buildSiteParserResult, dedupeSiteParserResults } from "./shared.js";

const EXA_SUBJECT_CODE = /\b(\d{6})\b/;
const EXA_BODY_CODE = /(?<![A-Za-z@.])\b(\d{6})\b/;

export default {
  key: "exa",
  site_key: "exa",
  display_name: "Exa",
  description: "针对 Exa 验证邮件提取 6 位验证码。",
  sender_keywords: ["exa"],
  verify_keywords: ["verif", "verify", "code", "otp", "login"],
  platform_hints: ["exa", "exa.ai"],
  check_body_for_sender: true,
  extract(runtime) {
    const subjectMatch = EXA_SUBJECT_CODE.exec(runtime.subject);
    const bodyMatch = EXA_BODY_CODE.exec(runtime.htmlText || runtime.text);
    const code = subjectMatch?.[1] || bodyMatch?.[1] || "";
    if (!code) return [];

    return dedupeSiteParserResults([
      buildSiteParserResult(this, runtime.matchContent, {
        kind: "code",
        remark: "Exa 验证码",
        value: code
      })
    ]);
  }
};
