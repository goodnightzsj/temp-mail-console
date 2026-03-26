import { buildSiteParserResult, dedupeSiteParserResults, extractByPatterns } from "./shared.js";

const TAVILY_VERIFY_PATTERNS = [
  "(https://auth\\.tavily\\.com/u/email-verification\\?ticket=[^\\s\"'<>]+)",
  "(https://app\\.tavily\\.com/[^\"']*verify[^\"']*)",
  "(https://[^\"']*tavily\\.com[^\"']*verify[^\"']*)"
];

export default {
  key: "tavily",
  site_key: "tavily",
  display_name: "Tavily",
  description: "针对 Tavily 邮件里的验证链接做定向提取。",
  sender_keywords: ["tavily"],
  verify_keywords: ["verif", "ticket", "confirm", "activate"],
  platform_hints: ["tavily", "auth.tavily.com", "app.tavily.com"],
  check_body_for_sender: true,
  extract(runtime) {
    const value = extractByPatterns([runtime.html, runtime.text, runtime.subject].join("\n"), TAVILY_VERIFY_PATTERNS)
      || extractByPatterns([runtime.html, runtime.text, runtime.subject].join("\n"), [
        "(https://[^\"']*tavily\\.com[^\"']*(?:verification|ticket)[^\"']*)"
      ]);

    if (!value) return [];
    return dedupeSiteParserResults([
      buildSiteParserResult(this, runtime.matchContent, {
        kind: "link",
        remark: "Tavily 验证链接",
        value
      })
    ]);
  }
};
