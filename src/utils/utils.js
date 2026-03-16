import { JSON_HEADERS } from "./constants.js";

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

/**
 * 返回标准 JSON 响应
 */
export function json(data, status = 200) {
  return new Response(JSON.stringify({ code: status, data }), {
    status,
    headers: JSON_HEADERS
  });
}

/**
 * 返回 JSON 错误响应
 */
export function jsonError(message, status) {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: JSON_HEADERS
  });
}
