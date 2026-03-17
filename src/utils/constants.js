// ─── 页面设置与全局常量 ───────────────────────────────────────────────────────

export const PAGE_SIZE = 20;
export const RULES_PAGE_SIZE = 12;

// Defensive limits (avoid excessive regex backtracking / huge payloads)
export const MAX_MATCH_CONTENT_CHARS = 20000;
export const MAX_RULE_PATTERN_LENGTH = 2000;
export const MAX_SENDER_PATTERN_LENGTH = 500;
export const MAX_SENDER_FILTER_LENGTH = 2000;
export const MAX_RULE_REMARK_LENGTH = 200;

export const SCHEMA_STATEMENTS = [
  "CREATE TABLE IF NOT EXISTS emails (id INTEGER PRIMARY KEY AUTOINCREMENT, message_id TEXT NOT NULL, from_address TEXT NOT NULL, to_address TEXT NOT NULL, subject TEXT NOT NULL, extracted_json TEXT NOT NULL, received_at INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails (received_at DESC)",
  "CREATE TABLE IF NOT EXISTS rules (id INTEGER PRIMARY KEY AUTOINCREMENT, remark TEXT, sender_filter TEXT, pattern TEXT NOT NULL, created_at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS whitelist (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_pattern TEXT NOT NULL, created_at INTEGER NOT NULL)"
];

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization"
};

export const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8" };
