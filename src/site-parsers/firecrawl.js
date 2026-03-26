import { buildSiteParserResult, dedupeSiteParserResults, extractByPatterns } from "./shared.js";

const FIRECRAWL_VERIFY_PATTERNS = [
  "(https://(?:www\\.)?firecrawl\\.dev/agent-confirm\\?[^\\s\"'<>()\\[\\]]+)",
  "(https://(?:www\\.)?firecrawl\\.dev/[^\\s\"'<>()\\[\\]]*agent-confirm[^\\s\"'<>()\\[\\]]*)",
  "(https://[^\\s\"'<>()\\[\\]]*firecrawl[^\\s\"'<>()\\[\\]]*(?:verify|confirm|email)[^\\s\"'<>()\\[\\]]*)",
  "(https://[^\\s\"'<>()\\[\\]]*clerk[^\\s\"'<>()\\[\\]]*(?:verify|confirm)[^\\s\"'<>()\\[\\]]*)"
];

export default {
  key: "firecrawl",
  site_key: "firecrawl",
  display_name: "Firecrawl",
  description: "针对 Firecrawl 注册、Agent 确认和邮箱验证链接做定向提取。",
  sender_keywords: ["firecrawl"],
  verify_keywords: ["verify", "confirm", "signup", "activate", "agent"],
  platform_hints: ["firecrawl", "firecrawl.dev", "service.firecrawl.dev"],
  check_body_for_sender: true,
  extract(runtime) {
    const raw = [runtime.html, runtime.text, runtime.subject].join("\n");
    const value = extractByPatterns(raw, FIRECRAWL_VERIFY_PATTERNS);
    if (!value) return [];

    return dedupeSiteParserResults([
      buildSiteParserResult(this, runtime.matchContent, {
        kind: "link",
        remark: "Firecrawl 验证链接",
        value
      })
    ]);
  }
};
