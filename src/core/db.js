// ─── 数据库操作与状态管理 ───────────────────────────────────────────────────

function mapRule(row) {
  return {
    id: Number(row.id),
    remark: row.remark ? String(row.remark) : "",
    sender_filter: row.sender_filter ? String(row.sender_filter) : "",
    pattern: String(row.pattern),
    created_at: row.created_at ? Number(row.created_at) : Date.now()
  };
}

function mapWhitelist(row) {
  return {
    id: Number(row.id),
    sender_pattern: String(row.sender_pattern),
    created_at: row.created_at ? Number(row.created_at) : Date.now()
  };
}

function mapSettings(row) {
  return {
    forwarding_mode: String(row.forwarding_mode || "env"),
    forward_to: row.forward_to ? String(row.forward_to) : "",
    builtin_rule_mode: String(row.builtin_rule_mode || "append"),
    forward_payload_mode: String(row.forward_payload_mode || "raw"),
    updated_at: row.updated_at ? Number(row.updated_at) : 0
  };
}

function mapEmailRow(row) {
  return {
    message_id: String(row.message_id),
    from_address: String(row.from_address),
    to_address: String(row.to_address),
    subject: String(row.subject || ""),
    content_summary: row.content_summary ? String(row.content_summary) : "",
    extracted_json: row.extracted_json ? String(row.extracted_json) : "[]",
    received_at: row.received_at ? Number(row.received_at) : 0
  };
}

function mapEmailRawRow(row) {
  return {
    ...mapEmailRow(row),
    text_content: row.text_content ? String(row.text_content) : "",
    html_content: row.html_content ? String(row.html_content) : ""
  };
}

function buildRemarkNeedle(remark) {
  const normalized = String(remark || "").trim().toLowerCase();
  return normalized ? `\n${normalized}\n` : "";
}

function buildMatchedRemarksIndex(matches) {
  const uniqueRemarks = Array.from(
    new Set(
      (Array.isArray(matches) ? matches : [])
        .map((item) => String(item?.remark || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );
  return uniqueRemarks.length > 0 ? `\n${uniqueRemarks.join("\n")}\n` : "";
}

async function ensureSettingsRow(db) {
  await db.prepare(
    "INSERT OR IGNORE INTO settings (id, forwarding_mode, forward_to, builtin_rule_mode, forward_payload_mode, updated_at) VALUES (1, 'env', NULL, 'append', 'raw', ?)"
  ).bind(Date.now()).run();
}

function buildAddressFilter(address, filters, params) {
  const normalized = String(address || "").trim().toLowerCase();
  filters.push("instr(',' || to_address || ',', ',' || ? || ',') > 0");
  params.push(normalized);
}

function buildApiEmailFilters({ address, since = null, remark = null }) {
  const filters = [];
  const params = [];

  buildAddressFilter(address, filters, params);

  if (Number.isFinite(since) && since >= 0) {
    filters.push("received_at >= ?");
    params.push(Math.floor(since));
  }

  const remarkNeedle = buildRemarkNeedle(remark);
  if (remarkNeedle) {
    filters.push("matched_remarks LIKE ?");
    params.push(`%${remarkNeedle}%`);
  }

  return { filters, params };
}

export async function loadRules(db) {
  const result = await db.prepare("SELECT id, remark, sender_filter, pattern FROM rules ORDER BY created_at DESC").all();
  return result.results.map(mapRule);
}

export async function loadWhitelist(db) {
  const result = await db.prepare("SELECT id, sender_pattern FROM whitelist ORDER BY created_at DESC").all();
  return result.results.map(mapWhitelist);
}

export async function getLatestEmail(db, { address, since = null, remark = null }) {
  const { items } = await listEmailsForApi(db, { address, since, remark, limit: 1 });
  return items[0] || null;
}

export async function getLatestRawEmail(db, { address, since = null, remark = null }) {
  const { items } = await listRawEmailsForApi(db, { address, since, remark, limit: 1 });
  return items[0] || null;
}

export async function listEmailsForApi(db, { address, since = null, remark = null, limit = 20 }) {
  const { filters, params } = buildApiEmailFilters({ address, since, remark });
  const whereClause = ` WHERE ${filters.join(" AND ")}`;
  const listQuery = `
    SELECT message_id, from_address, to_address, subject, content_summary, extracted_json, received_at
    FROM emails
    ${whereClause}
    ORDER BY received_at DESC
    LIMIT ?
  `;
  const countQuery = `SELECT COUNT(1) AS total FROM emails${whereClause}`;

  const [list, countRow] = await Promise.all([
    db.prepare(listQuery).bind(...params, limit).all(),
    db.prepare(countQuery).bind(...params).first()
  ]);

  return {
    items: list.results.map(mapEmailRow),
    total: Number(countRow?.total || 0)
  };
}

export async function listRawEmailsForApi(db, { address, since = null, remark = null, limit = 20 }) {
  const { filters, params } = buildApiEmailFilters({ address, since, remark });
  const whereClause = ` WHERE ${filters.join(" AND ")}`;
  const listQuery = `
    SELECT message_id, from_address, to_address, subject, content_summary, text_content, html_content, extracted_json, received_at
    FROM emails
    ${whereClause}
    ORDER BY received_at DESC
    LIMIT ?
  `;
  const countQuery = `SELECT COUNT(1) AS total FROM emails${whereClause}`;

  const [list, countRow] = await Promise.all([
    db.prepare(listQuery).bind(...params, limit).all(),
    db.prepare(countQuery).bind(...params).first()
  ]);

  return {
    items: list.results.map(mapEmailRawRow),
    total: Number(countRow?.total || 0)
  };
}

export async function getEmails(db, page, pageSize, domain = null, search = null) {
  const offset = (page - 1) * pageSize;
  let listQuery = "SELECT message_id, from_address, to_address, subject, content_summary, extracted_json, received_at FROM emails";
  let countQuery = "SELECT COUNT(1) as total FROM emails";
  const filters = [];
  const bindParams = [];

  if (domain) {
    filters.push("to_address LIKE ?");
    bindParams.push(`%@${domain}%`);
  }

  if (search) {
    const textPattern = `%${search}%`;
    filters.push("(subject LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR content_summary LIKE ? OR extracted_json LIKE ? OR matched_remarks LIKE ?)");
    bindParams.push(textPattern, textPattern, textPattern, textPattern, textPattern, textPattern);
  }

  if (filters.length > 0) {
    const whereClause = ` WHERE ${filters.join(" AND ")}`;
    listQuery += whereClause;
    countQuery += whereClause;
  }

  listQuery += " ORDER BY received_at DESC LIMIT ? OFFSET ?";
  const params = [...bindParams, pageSize, offset];

  const [list, countRow] = await Promise.all([
    db.prepare(listQuery).bind(...params).all(),
    db.prepare(countQuery).bind(...bindParams).first()
  ]);

  return {
    items: list.results.map(mapEmailRow),
    total: Number(countRow?.total || 0)
  };
}

export async function getAvailableDomains(db) {
  const result = await db.prepare("SELECT to_address FROM emails").all();
  const domains = new Set();
  for (const row of result.results) {
    const addresses = String(row.to_address || "").split(",");
    for (const addr of addresses) {
      const parts = addr.trim().split("@");
      if (parts.length === 2 && parts[1]) domains.add(parts[1]);
    }
  }
  return Array.from(domains).sort();
}

export async function getRulesPaged(db, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [list, countRow] = await Promise.all([
    db.prepare(
      "SELECT id, remark, sender_filter, pattern, created_at FROM rules ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(pageSize, offset).all(),
    db.prepare("SELECT COUNT(1) as total FROM rules").first()
  ]);
  return { items: list.results.map(mapRule), total: Number(countRow?.total || 0) };
}

export async function createRule(db, { remark, sender_filter, pattern }) {
  return db.prepare("INSERT INTO rules (remark, sender_filter, pattern, created_at) VALUES (?, ?, ?, ?)")
    .bind(remark || null, sender_filter || null, pattern, Date.now())
    .run();
}

export async function updateRule(db, id, { remark, sender_filter, pattern }) {
  return db.prepare("UPDATE rules SET remark = ?, sender_filter = ?, pattern = ? WHERE id = ?")
    .bind(remark || null, sender_filter || null, pattern, id)
    .run();
}

export async function deleteRule(db, id) {
  return db.prepare("DELETE FROM rules WHERE id = ?").bind(id).run();
}

export async function getWhitelistPaged(db, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [list, countRow] = await Promise.all([
    db.prepare(
      "SELECT id, sender_pattern, created_at FROM whitelist ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(pageSize, offset).all(),
    db.prepare("SELECT COUNT(1) as total FROM whitelist").first()
  ]);
  return { items: list.results.map(mapWhitelist), total: Number(countRow?.total || 0) };
}

export async function createWhitelistEntry(db, pattern) {
  return db.prepare("INSERT INTO whitelist (sender_pattern, created_at) VALUES (?, ?)")
    .bind(pattern, Date.now())
    .run();
}

export async function updateWhitelistEntry(db, id, pattern) {
  return db.prepare("UPDATE whitelist SET sender_pattern = ? WHERE id = ?")
    .bind(pattern, id)
    .run();
}

export async function deleteWhitelistEntry(db, id) {
  return db.prepare("DELETE FROM whitelist WHERE id = ?").bind(id).run();
}

export async function saveEmail(db, data) {
  const { from, to, subject, text, html, content_summary, matches } = data;
  return db.prepare(
    "INSERT INTO emails (message_id, from_address, to_address, subject, text_content, html_content, content_summary, matched_remarks, extracted_json, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    from,
    to.join(","),
    subject,
    text || "",
    html || "",
    content_summary || "",
    buildMatchedRemarksIndex(matches),
    JSON.stringify(Array.isArray(matches) ? matches : []),
    Date.now()
  ).run();
}

export async function clearExpiredEmails(db, maxHours = 48) {
  const threshold = Date.now() - (maxHours * 60 * 60 * 1000);
  return db.prepare("DELETE FROM emails WHERE received_at < ?").bind(threshold).run();
}

export async function getForwardingSettings(db) {
  await ensureSettingsRow(db);
  const row = await db.prepare(
    "SELECT forwarding_mode, forward_to, builtin_rule_mode, forward_payload_mode, updated_at FROM settings WHERE id = 1"
  ).first();
  return row ? mapSettings(row) : {
    forwarding_mode: "env",
    forward_to: "",
    builtin_rule_mode: "append",
    forward_payload_mode: "raw",
    updated_at: 0
  };
}

export async function updateForwardingSettings(db, { forwarding_mode, forward_to, builtin_rule_mode, forward_payload_mode }) {
  await ensureSettingsRow(db);
  return db.prepare(
    "UPDATE settings SET forwarding_mode = ?, forward_to = ?, builtin_rule_mode = ?, forward_payload_mode = ?, updated_at = ? WHERE id = 1"
  ).bind(
    forwarding_mode,
    forward_to || null,
    builtin_rule_mode || "append",
    forward_payload_mode || "raw",
    Date.now()
  ).run();
}

export function resolveEffectiveForwardTarget(settings, envForwardTo = "") {
  const mode = String(settings?.forwarding_mode || "env");
  const customTarget = String(settings?.forward_to || "").trim().toLowerCase();
  const envTarget = String(envForwardTo || "").trim().toLowerCase();

  if (mode === "disabled") return "";
  if (mode === "custom") return customTarget;
  return envTarget;
}
