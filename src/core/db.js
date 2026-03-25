// ─── 数据库操作与状态管理 ───────────────────────────────────────────────────
/**
 * 格式化规则对象
 */
function mapRule(row) {
  return {
    id: Number(row.id),
    remark: row.remark ? String(row.remark) : "",
    sender_filter: row.sender_filter ? String(row.sender_filter) : "",
    pattern: String(row.pattern),
    created_at: row.created_at ? Number(row.created_at) : Date.now()
  };
}

/**
 * 格式化白名单对象
 */
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
    updated_at: row.updated_at ? Number(row.updated_at) : 0
  };
}

async function ensureSettingsRow(db) {
  await db.prepare(
    "INSERT OR IGNORE INTO settings (id, forwarding_mode, forward_to, updated_at) VALUES (1, 'env', NULL, ?)"
  ).bind(Date.now()).run();
}

/**
 * 获取所有解析规则 (供逻辑层使用)
 */
export async function loadRules(db) {
  const result = await db.prepare("SELECT id, remark, sender_filter, pattern FROM rules ORDER BY created_at DESC").all();
  return result.results.map(mapRule);
}

/**
 * 获取所有发件人白名单 (供逻辑层使用)
 */
export async function loadWhitelist(db) {
  const result = await db.prepare("SELECT id, sender_pattern FROM whitelist ORDER BY created_at DESC").all();
  return result.results.map(mapWhitelist);
}

/**
 * 获取针对特定收件地址的最新邮件记录
 */
export async function getLatestEmail(db, address) {
  const addr = String(address || "").trim().toLowerCase();
  return db.prepare(
    "SELECT from_address, to_address, extracted_json, received_at FROM emails WHERE instr(',' || to_address || ',', ',' || ? || ',') > 0 ORDER BY received_at DESC LIMIT 1"
  ).bind(addr).first();
}

/**
 * 分页获取邮件记录 (支持域名过滤)
 */
export async function getEmails(db, page, pageSize, domain = null, search = null) {
  const offset = (page - 1) * pageSize;
  let listQuery = "SELECT message_id, from_address, to_address, subject, extracted_json, received_at FROM emails";
  let countQuery = "SELECT COUNT(1) as total FROM emails";
  const filters = [];
  const bindParams = [];

  if (domain) {
    const domainPattern = `%@${domain}%`;
    filters.push("to_address LIKE ?");
    bindParams.push(domainPattern);
  }

  if (search) {
    const textPattern = `%${search}%`;
    filters.push("(subject LIKE ? OR from_address LIKE ? OR to_address LIKE ? OR extracted_json LIKE ?)");
    bindParams.push(textPattern, textPattern, textPattern, textPattern);
  }

  if (filters.length > 0) {
    const whereClause = ` WHERE ${filters.join(" AND ")}`;
    listQuery += whereClause;
    countQuery += whereClause;
  }

  listQuery += " ORDER BY received_at DESC LIMIT ? OFFSET ?";
  const params = [...bindParams, pageSize, offset];
  const countParams = [...bindParams];

  const [list, countRow] = await Promise.all([
    db.prepare(listQuery).bind(...params).all(),
    db.prepare(countQuery).bind(...countParams).first()
  ]);
  return { items: list.results, total: countRow?.total || 0 };
}

/**
 * 获取系统中出现过的所有唯一域名
 */
export async function getAvailableDomains(db) {
  const result = await db.prepare("SELECT to_address FROM emails").all();
  const domains = new Set();
  for (const row of result.results) {
    const addresses = row.to_address.split(",");
    for (const addr of addresses) {
      const parts = addr.trim().split("@");
      if (parts.length === 2) domains.add(parts[1]);
    }
  }
  return Array.from(domains).sort();
}

/**
 * 分页获取规则列表
 */
export async function getRulesPaged(db, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [list, countRow] = await Promise.all([
    db.prepare(
      "SELECT id, remark, sender_filter, pattern, created_at FROM rules ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(pageSize, offset).all(),
    db.prepare("SELECT COUNT(1) as total FROM rules").first()
  ]);
  return { items: list.results.map(mapRule), total: countRow?.total || 0 };
}

/**
 * 创建新规则
 */
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

/**
 * 删除规则
 */
export async function deleteRule(db, id) {
  return db.prepare("DELETE FROM rules WHERE id = ?").bind(id).run();
}

/**
 * 分页获取白名单
 */
export async function getWhitelistPaged(db, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [list, countRow] = await Promise.all([
    db.prepare(
      "SELECT id, sender_pattern, created_at FROM whitelist ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(pageSize, offset).all(),
    db.prepare("SELECT COUNT(1) as total FROM whitelist").first()
  ]);
  return { items: list.results.map(mapWhitelist), total: countRow?.total || 0 };
}

/**
 * 创建白名单项
 */
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

/**
 * 删除白名单项
 */
export async function deleteWhitelistEntry(db, id) {
  return db.prepare("DELETE FROM whitelist WHERE id = ?").bind(id).run();
}
/**
 * 存储处理过的邮件记录
 */
export async function saveEmail(db, data) {
  const { from, to, subject, matches } = data;
  return db.prepare(
    "INSERT INTO emails (message_id, from_address, to_address, subject, extracted_json, received_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    from,
    to.join(","),
    subject,
    JSON.stringify(matches),
    Date.now()
  ).run();
}

/**
 * 清理指定小时数之前的过期邮件
 */
export async function clearExpiredEmails(db, maxHours = 48) {
  const threshold = Date.now() - (maxHours * 60 * 60 * 1000);
  return db.prepare("DELETE FROM emails WHERE received_at < ?").bind(threshold).run();
}

export async function getForwardingSettings(db) {
  await ensureSettingsRow(db);
  const row = await db.prepare("SELECT forwarding_mode, forward_to, updated_at FROM settings WHERE id = 1").first();
  return row ? mapSettings(row) : { forwarding_mode: "env", forward_to: "", updated_at: 0 };
}

export async function updateForwardingSettings(db, { forwarding_mode, forward_to }) {
  await ensureSettingsRow(db);
  return db.prepare("UPDATE settings SET forwarding_mode = ?, forward_to = ?, updated_at = ? WHERE id = 1")
    .bind(forwarding_mode, forward_to || null, Date.now())
    .run();
}

export function resolveEffectiveForwardTarget(settings, envForwardTo = "") {
  const mode = String(settings?.forwarding_mode || "env");
  const customTarget = String(settings?.forward_to || "").trim().toLowerCase();
  const envTarget = String(envForwardTo || "").trim().toLowerCase();

  if (mode === "disabled") return "";
  if (mode === "custom") return customTarget;
  return envTarget;
}
