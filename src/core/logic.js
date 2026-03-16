import PostalMime from "postal-mime";
import { ensureSchema, loadRules, loadWhitelist, saveEmail } from "./db.js";

// ─── 核心业务逻辑 (Email Processing) ──────────────────────────────────────────

/**
 * 解析入站邮件的原始数据
 */
export async function parseIncomingEmail(message) {
  const rawBuffer = await new Response(message.raw).arrayBuffer();
  const parsed = await new PostalMime().parse(rawBuffer);
  const toList = Array.isArray(parsed.to) ? parsed.to : [];

  return {
    from: parsed.from?.address || "",
    to: toList.map((item) => item.address).filter(Boolean),
    subject: parsed.subject || "",
    text: parsed.text || "",
    html: parsed.html || ""
  };
}

/**
 * 对邮件内容应用解析规则
 */
export function applyRules(content, sender, rules) {
  const senderValue = String(sender || "").toLowerCase();
  const outputs = [];
  for (const rule of rules) {
    if (!senderMatches(senderValue, rule.sender_filter)) continue;
    try {
      const match = content.match(new RegExp(rule.pattern, "m"));
      if (match?.[0]) {
        outputs.push({ rule_id: rule.id, value: match[0], remark: rule.remark || null });
      }
    } catch { continue; }
  }
  return outputs;
}

/**
 * 检查发件人是否在白名单中
 */
export function senderInWhitelist(sender, whitelist) {
  if (whitelist.length === 0) return true;
  const senderValue = String(sender || "").toLowerCase();
  return whitelist.some(({ sender_pattern }) => {
    try { return new RegExp(sender_pattern, "i").test(senderValue); } catch { return false; }
  });
}

/**
 * 辅助函数：匹配发件人与过滤规则
 */
export function senderMatches(senderValue, filterValue) {
  const filter = String(filterValue || "").trim();
  if (!filter) return true;
  const parts = filter.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  return parts.length === 0 || parts.some((pattern) => {
    try { return new RegExp(pattern, "i").test(senderValue); } catch { return false; }
  });
}
/**
 * 集中处理入站邮件的完整流程 (解析 -> 过滤 -> 匹配 -> 存储)
 */
export async function processIncomingEmail(message, env, ctx) {
  await ensureSchema(env.DB);
  const parsed = await parseIncomingEmail(message);

  // 1. 白名单检查
  const whitelist = await loadWhitelist(env.DB);
  if (!senderInWhitelist(parsed.from, whitelist)) return null;

  // 2. 匹配规则提取内容
  const rules = await loadRules(env.DB);
  const content = parsed.text || parsed.html || "";
  const matches = applyRules(content, parsed.from, rules);

  // 3. 异步持久化存储
  ctx.waitUntil(saveEmail(env.DB, { ...parsed, matches }));

  return parsed;
}
