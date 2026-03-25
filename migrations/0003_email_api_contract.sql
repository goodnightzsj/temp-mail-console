ALTER TABLE emails ADD COLUMN content_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE emails ADD COLUMN matched_remarks TEXT NOT NULL DEFAULT '';

ALTER TABLE settings ADD COLUMN builtin_rule_mode TEXT NOT NULL DEFAULT 'append';

UPDATE settings
SET builtin_rule_mode = 'append'
WHERE builtin_rule_mode IS NULL OR builtin_rule_mode = '';
