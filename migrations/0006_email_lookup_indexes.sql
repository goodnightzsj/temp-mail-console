CREATE UNIQUE INDEX IF NOT EXISTS idx_emails_message_id ON emails (message_id);

CREATE TABLE IF NOT EXISTS email_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  address TEXT NOT NULL,
  received_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_recipients_message_address
  ON email_recipients (message_id, address);

CREATE INDEX IF NOT EXISTS idx_email_recipients_address_received_at
  ON email_recipients (address, received_at DESC);

CREATE TABLE IF NOT EXISTS email_match_remarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  remark TEXT NOT NULL,
  received_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_match_remarks_message_remark
  ON email_match_remarks (message_id, remark);

CREATE INDEX IF NOT EXISTS idx_email_match_remarks_remark_received_at
  ON email_match_remarks (remark, received_at DESC);

WITH RECURSIVE recipient_split(message_id, received_at, rest, address) AS (
  SELECT
    message_id,
    received_at,
    CASE
      WHEN trim(to_address) = '' THEN ''
      ELSE trim(to_address) || ','
    END,
    NULL
  FROM emails
  UNION ALL
  SELECT
    message_id,
    received_at,
    substr(rest, instr(rest, ',') + 1),
    trim(substr(rest, 1, instr(rest, ',') - 1))
  FROM recipient_split
  WHERE rest <> ''
)
INSERT OR IGNORE INTO email_recipients (message_id, address, received_at)
SELECT
  message_id,
  lower(address),
  received_at
FROM recipient_split
WHERE address IS NOT NULL AND address <> '';

WITH RECURSIVE remark_split(message_id, received_at, rest, remark) AS (
  SELECT
    message_id,
    received_at,
    CASE
      WHEN trim(matched_remarks, char(10)) = '' THEN ''
      ELSE trim(matched_remarks, char(10)) || char(10)
    END,
    NULL
  FROM emails
  UNION ALL
  SELECT
    message_id,
    received_at,
    substr(rest, instr(rest, char(10)) + 1),
    trim(substr(rest, 1, instr(rest, char(10)) - 1))
  FROM remark_split
  WHERE rest <> ''
)
INSERT OR IGNORE INTO email_match_remarks (message_id, remark, received_at)
SELECT
  message_id,
  lower(remark),
  received_at
FROM remark_split
WHERE remark IS NOT NULL AND remark <> '';
