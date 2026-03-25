// ─── 页面设置与全局常量 ───────────────────────────────────────────────────────

export const PAGE_SIZE = 20;
export const RULES_PAGE_SIZE = 12;

// Defensive limits (avoid excessive regex backtracking / huge payloads)
export const MAX_MATCH_CONTENT_CHARS = 20000;
export const MAX_RULE_PATTERN_LENGTH = 2000;
export const MAX_SENDER_PATTERN_LENGTH = 500;
export const MAX_SENDER_FILTER_LENGTH = 2000;
export const MAX_RULE_REMARK_LENGTH = 200;
export const MAX_FORWARD_ADDRESS_LENGTH = 254;
export const MAX_EMAIL_QUERY_LENGTH = 160;
export const MAX_REMARK_QUERY_LENGTH = 120;
export const DEFAULT_API_LIST_LIMIT = 20;
export const MAX_API_LIST_LIMIT = 50;
export const MAX_CONTENT_SUMMARY_CHARS = 320;
export const MATCH_CONTEXT_RADIUS = 84;
export const MAX_FORWARD_SUBJECT_CHARS = 120;
export const MAX_FORWARD_DIGEST_RESULTS = 8;
export const MAX_FORWARD_DIGEST_SECTION_CHARS = 180;
export const MAX_RULE_MATCHES_PER_RULE = 12;

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization"
};

export const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8" };
