import { buildParserRuntime, dedupeSiteParserResults, matchesParserCandidate } from "./shared.js";
import openaiParser from "./openai.js";
import tavilyParser from "./tavily.js";
import grokParser from "./grok.js";
import exaParser from "./exa.js";
import firecrawlParser from "./firecrawl.js";

const SITE_PARSERS = [
  openaiParser,
  grokParser,
  tavilyParser,
  exaParser,
  firecrawlParser
];

export function getSiteParserCatalog() {
  return SITE_PARSERS.map((parser) => ({
    key: parser.key,
    site_key: parser.site_key || parser.key,
    display_name: parser.display_name || parser.key,
    description: parser.description || "",
    sender_keywords: Array.isArray(parser.sender_keywords) ? parser.sender_keywords : [],
    verify_keywords: Array.isArray(parser.verify_keywords) ? parser.verify_keywords : [],
    platform_hints: Array.isArray(parser.platform_hints) ? parser.platform_hints : []
  }));
}

export function applySiteParsers(parsed, matchContent) {
  const runtime = buildParserRuntime(parsed, matchContent);
  const outputs = [];

  for (const parser of SITE_PARSERS) {
    if (!matchesParserCandidate(parser, runtime)) continue;

    try {
      const matches = parser.extract(runtime);
      if (Array.isArray(matches) && matches.length > 0) {
        outputs.push(...matches);
      }
    } catch {
      continue;
    }
  }

  return dedupeSiteParserResults(outputs);
}
