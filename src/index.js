import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext/browser";
import {
  MAX_FORWARD_DIGEST_RESULTS,
  MAX_FORWARD_DIGEST_SECTION_CHARS,
  MAX_FORWARD_SUBJECT_CHARS,
  PAGE_SIZE,
  RULES_PAGE_SIZE,
  HTML_HEADERS,
  CORS_HEADERS
} from "./utils/constants.js";
import { jsonError, applyCors, isValidEmailAddress, summarizeText } from "./utils/utils.js";
import { isAdminAuthorized, isApiAuthorized } from "./core/auth.js";
import { clearExpiredEmails, getForwardingSettings, resolveEffectiveForwardTarget } from "./core/db.js";
import { processIncomingEmail } from "./core/logic.js";
import * as handlers from "./handlers/handlers.js";
import { renderAuthHtml, renderHtml } from "./ui/templates.js";

function apiOptionsResponse() {
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
}

function apiJsonError(message, status = 400) {
  return applyCors(jsonError(message, status), CORS_HEADERS);
}

function buildDigestSection(label, value) {
  const normalizedValue = summarizeText(value || "", MAX_FORWARD_DIGEST_SECTION_CHARS);
  return `${label}: ${normalizedValue || "（无）"}`;
}

function buildForwardDigestText(delivery, forwardTarget) {
  const parsed = delivery?.parsed || {};
  const matches = Array.isArray(delivery?.matches) ? delivery.matches.slice(0, MAX_FORWARD_DIGEST_RESULTS) : [];
  const lines = [
    "Temp Mail Console 命中摘要",
    "",
    buildDigestSection("Forward To", forwardTarget),
    buildDigestSection("From", parsed.from || ""),
    buildDigestSection("To", Array.isArray(parsed.to) ? parsed.to.join(", ") : ""),
    buildDigestSection("Subject", parsed.subject || ""),
    buildDigestSection("Content Summary", delivery?.content_summary || ""),
    "",
    "Matches:"
  ];

  if (matches.length === 0) {
    lines.push("- 当前邮件没有命中任何规则。");
    return lines.join("\n");
  }

  matches.forEach((item, index) => {
    const title = item?.remark || item?.rule_key || `命中 ${index + 1}`;
    const source = item?.source === "builtin" ? "内置规则" : "自定义规则";
    lines.push(`${index + 1}. ${title} [${source}]`);
    lines.push(`   Match: ${summarizeText(item?.match || item?.value || "", MAX_FORWARD_DIGEST_SECTION_CHARS)}`);
    if (item?.before) lines.push(`   Before: ${summarizeText(item.before, MAX_FORWARD_DIGEST_SECTION_CHARS)}`);
    if (item?.after) lines.push(`   After: ${summarizeText(item.after, MAX_FORWARD_DIGEST_SECTION_CHARS)}`);
    if (item?.rule_key) lines.push(`   Rule Key: ${item.rule_key}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

async function forwardMatchedDigest(message, env, delivery, forwardTarget) {
  if (!env.SEND_EMAIL?.send) {
    console.error("摘要转发失败: SEND_EMAIL binding 不存在");
    return;
  }

  const sender = String(delivery?.parsed?.to?.[0] || message.to || "").trim().toLowerCase();
  if (!sender || !isValidEmailAddress(sender)) {
    console.error("摘要转发失败: 无法确定有效的发件地址");
    return;
  }

  const mimeMessage = createMimeMessage();
  mimeMessage.setSender({ name: "Temp Mail Console", addr: sender });
  mimeMessage.setRecipient(forwardTarget);
  mimeMessage.setSubject(
    `[Temp Mail Console] 命中摘要 · ${summarizeText(delivery?.parsed?.subject || "New inbound email", MAX_FORWARD_SUBJECT_CHARS)}`
  );

  if (isValidEmailAddress(delivery?.parsed?.from)) {
    mimeMessage.setHeader("Reply-To", delivery.parsed.from);
  }

  mimeMessage.addMessage({
    contentType: "text/plain; charset=utf-8",
    data: buildForwardDigestText(delivery, forwardTarget)
  });

  await env.SEND_EMAIL.send(new EmailMessage(sender, forwardTarget, mimeMessage.asRaw()));
}

export default {
  /**
   * 处理入站邮件
   */
  async email(message, env, ctx) {
    const delivery = await processIncomingEmail(message, env, ctx);

    // 如果处理成功（通过白名单）且设置了全局转发
    if (delivery) {
      let forwardTarget = String(env.FORWARD_TO || "").trim();
      let settings = { forwarding_mode: "env", forward_payload_mode: "raw" };

      try {
        settings = await getForwardingSettings(env.DB);
        forwardTarget = resolveEffectiveForwardTarget(settings, env.FORWARD_TO);
      } catch (err) {
        console.error("加载转发设置失败，回退到默认配置:", err);
      }

      if (!forwardTarget) return;

      try {
        if (settings.forward_payload_mode === "matched") {
          await forwardMatchedDigest(message, env, delivery, forwardTarget);
        } else {
          await message.forward(forwardTarget);
        }
      } catch (err) {
        console.error("邮件转发失败:", err);
      }
    }
  },

  /**
   * 处理 HTTP 请求
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // 1. API 路由 (/api/...)
    if (
      pathname === "/api/emails/latest"
      || pathname === "/api/emails"
      || pathname === "/api/emails/raw/latest"
      || pathname === "/api/emails/raw"
    ) {
      if (method === "OPTIONS") return apiOptionsResponse();
      if (method !== "GET") return apiJsonError("Method Not Allowed", 405);
      if (!isApiAuthorized(request, env.API_TOKEN)) return apiJsonError("Unauthorized", 401);
      let res;
      if (pathname === "/api/emails/latest") {
        res = await handlers.handleEmailsLatest(url, env.DB);
      } else if (pathname === "/api/emails") {
        res = await handlers.handleEmailsList(url, env.DB);
      } else if (pathname === "/api/emails/raw/latest") {
        res = await handlers.handleEmailsRawLatest(url, env.DB);
      } else {
        res = await handlers.handleEmailsRawList(url, env.DB);
      }
      return applyCors(res, CORS_HEADERS);
    }

    // 2. 静态页面 (Dashboard)
    if (pathname === "/") {
      if (!isAdminAuthorized(request, env.ADMIN_TOKEN)) {
        return new Response(renderAuthHtml(), { headers: HTML_HEADERS });
      }
      return new Response(renderHtml(PAGE_SIZE, RULES_PAGE_SIZE), { headers: HTML_HEADERS });
    }

    // 3. 管理端路由 (/admin/...)
    if (pathname.startsWith("/admin/")) {
      if (!isAdminAuthorized(request, env.ADMIN_TOKEN)) return new Response("Unauthorized", { status: 401 });

      // 分发请求
      if (pathname === "/admin/domains" && method === "GET") return handlers.handleAdminDomains(url, env.DB);
      if (pathname === "/admin/emails" && method === "GET") return handlers.handleAdminEmails(url, env.DB);
      if (pathname === "/admin/rules" && method === "GET") return handlers.handleAdminRulesGet(url, env.DB);
      if (pathname === "/admin/rules" && method === "POST") return handlers.handleAdminRulesPost(request, env.DB);
      if (pathname.startsWith("/admin/rules/") && method === "PUT") return handlers.handleAdminRulesPut(pathname, request, env.DB);
      if (pathname.startsWith("/admin/rules/") && method === "DELETE") return handlers.handleAdminRulesDelete(pathname, env.DB);
      if (pathname === "/admin/whitelist" && method === "GET") return handlers.handleAdminWhitelistGet(url, env.DB);
      if (pathname === "/admin/whitelist" && method === "POST") return handlers.handleAdminWhitelistPost(request, env.DB);
      if (pathname.startsWith("/admin/whitelist/") && method === "PUT") return handlers.handleAdminWhitelistPut(pathname, request, env.DB);
      if (pathname.startsWith("/admin/whitelist/") && method === "DELETE") return handlers.handleAdminWhitelistDelete(pathname, env.DB);
      if (pathname === "/admin/settings/forwarding" && method === "GET") return handlers.handleAdminForwardingGet(env.DB, env.FORWARD_TO, env.SEND_EMAIL);
      if (pathname === "/admin/settings/forwarding" && method === "PUT") return handlers.handleAdminForwardingPut(request, env.DB, env.FORWARD_TO, env.SEND_EMAIL);
    }

    if (pathname.startsWith("/api/")) return apiJsonError("Not Found", 404);
    return new Response("Not Found", { status: 404 });
  },

  /**
   * 定时清理任务
   */
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      clearExpiredEmails(env.DB, 48)
        .then(() => console.log("[Cron] 自动清理完毕"))
        .catch(err => console.error("[Cron] 自动清理失败:", err))
    );
  }
};
