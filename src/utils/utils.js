// ─── 通用工具函数 ─────────────────────────────────────────────────────────────

/**
 * 限制分页参数在合理范围内
 */
export function clampPage(value) {
  const page = Number(value);
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

/**
 * 安全解析 JSON 字符串
 */
export function safeParseJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

export function normalizeText(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function summarizeText(value, maxLength = 320) {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + "…";
}

export function stripHtml(value) {
  return normalizeWhitespace(
    String(value || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, "\"")
      .replace(/&#39;/gi, "'")
  );
}

export function isValidEmailAddress(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidRegexPattern(pattern, flags = "") {
  try {
    new RegExp(pattern, flags);
    return true;
  } catch {
    return false;
  }
}

export function splitPatternList(value) {
  return String(value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSinceValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{10,16}$/.test(raw)) {
    let parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    if (raw.length === 10) parsed *= 1000;
    return Math.floor(parsed);
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function clampLimit(value, defaultValue = 20, maxValue = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return Math.min(maxValue, Math.floor(parsed));
}

/**
 * 解析 JSON body。
 * 返回: { ok: true, data } 或 { ok: false, error }
 */
export async function readJsonBody(request) {
  try {
    const data = await request.json();
    return { ok: true, data };
  } catch {
    return { ok: false, error: "invalid JSON body" };
  }
}

/**
 * 为 Response 添加 CORS 响应头（原地修改）。
 */
export function applyCors(response, corsHeaders) {
  for (const [k, v] of Object.entries(corsHeaders || {})) response.headers.set(k, v);
  return response;
}

/**
 * 返回标准 JSON 响应
 */
export function json(data, status = 200) {
  return Response.json({ code: status, data }, { status });
}

/**
 * 返回 JSON 错误响应
 */
export function jsonError(message, status) {
  return Response.json({ code: status, message }, { status });
}
