CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  forwarding_mode TEXT NOT NULL DEFAULT 'env' CHECK (forwarding_mode IN ('env', 'custom', 'disabled')),
  forward_to TEXT,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (id, forwarding_mode, forward_to, updated_at)
VALUES (1, 'env', NULL, CAST(strftime('%s', 'now') AS INTEGER) * 1000);
