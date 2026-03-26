import {
  PAGE_SIZE,
  RULES_PAGE_SIZE,
  MAX_RULE_PATTERN_LENGTH,
  MAX_RULE_REMARK_LENGTH,
  MAX_SENDER_FILTER_LENGTH,
  MAX_SENDER_PATTERN_LENGTH,
  MAX_FORWARD_ADDRESS_LENGTH,
  MAX_EMAIL_QUERY_LENGTH,
  MAX_REMARK_QUERY_LENGTH,
  DEFAULT_API_LIST_LIMIT,
  MAX_API_LIST_LIMIT
} from "../utils/constants.js";
import {
  json,
  jsonError,
  clampPage,
  safeParseJson,
  readJsonBody,
  normalizeText,
  isValidEmailAddress,
  isValidRegexPattern,
  splitPatternList,
  parseSinceValue,
  clampLimit
} from "../utils/utils.js";
import * as dbActions from "../core/db.js";
import { getBuiltinRuleCatalog } from "../core/logic.js";
import { getSiteParserCatalog } from "../site-parsers/index.js";

const FORWARDING_MODES = new Set(["env", "custom", "disabled"]);
const BUILTIN_RULE_MODES = new Set(["append", "builtin_only", "custom_only"]);
const FORWARD_PAYLOAD_MODES = new Set(["raw", "matched"]);

function hasDbChanges(result) {
  return Number(result?.meta?.changes || 0) > 0;
}

function hasInvalidPatternList(input) {
  return splitPatternList(input).some((pattern) => !isValidRegexPattern(pattern, "i"));
}

function parseApiEmailQuery(url, { defaultLimit = DEFAULT_API_LIST_LIMIT } = {}) {
  const address = String(url.searchParams.get("address") || "").trim();
  const sinceRaw = url.searchParams.get("since");
  const remark = normalizeText(url.searchParams.get("remark"), MAX_REMARK_QUERY_LENGTH);
  const limit = clampLimit(url.searchParams.get("limit"), defaultLimit, MAX_API_LIST_LIMIT);

  if (!address) return { error: "address is required" };

  const since = sinceRaw ? parseSinceValue(sinceRaw) : null;
  if (sinceRaw && since === null) return { error: "since must be a unix timestamp or ISO datetime" };

  return {
    address,
    since,
    remark: remark || null,
    limit
  };
}

function filterResultsByRemark(results, remark) {
  const items = Array.isArray(results) ? results : [];
  const normalizedRemark = String(remark || "").trim().toLowerCase();
  if (!normalizedRemark) return items;
  return items.filter((item) => String(item?.remark || "").trim().toLowerCase() === normalizedRemark);
}

function formatApiEmail(row, remark = null) {
  const results = filterResultsByRemark(safeParseJson(row.extracted_json) || [], remark);
  return {
    message_id: row.message_id,
    from_address: row.from_address,
    to_address: row.to_address,
    subject: row.subject || "",
    content_summary: row.content_summary || "",
    received_at: row.received_at,
    results
  };
}

export async function handleEmailsLatest(url, db) {
  const query = parseApiEmailQuery(url, { defaultLimit: 1 });
  if (query.error) return jsonError(query.error, 400);

  const row = await dbActions.getLatestEmail(db, query);
  if (!row) return jsonError("message not found", 404);

  return json(formatApiEmail(row, query.remark));
}

export async function handleEmailsList(url, db) {
  const query = parseApiEmailQuery(url, { defaultLimit: DEFAULT_API_LIST_LIMIT });
  if (query.error) return jsonError(query.error, 400);

  const { items, total } = await dbActions.listEmailsForApi(db, query);
  return json({
    address: query.address,
    since: query.since,
    remark: query.remark,
    limit: query.limit,
    total,
    items: items.map((row) => formatApiEmail(row, query.remark))
  });
}

export async function handleAdminEmails(url, db) {
  const page = clampPage(url.searchParams.get("page"));
  const domain = url.searchParams.get("domain") || null;
  const search = normalizeText(url.searchParams.get("q"), MAX_EMAIL_QUERY_LENGTH);
  const { items, total } = await dbActions.getEmails(db, page, PAGE_SIZE, domain, search || null);
  return json({ page, pageSize: PAGE_SIZE, total, items, q: search });
}

export async function handleAdminDomains(url, db) {
  const domains = await dbActions.getAvailableDomains(db);
  return json({ domains });
}

export async function handleAdminRulesGet(url, db) {
  const page = clampPage(url.searchParams.get("page"));
  const { items, total } = await dbActions.getRulesPaged(db, page, RULES_PAGE_SIZE);
  const builtinItems = getBuiltinRuleCatalog();
  const siteParserItems = getSiteParserCatalog();
  return json({
    page,
    pageSize: RULES_PAGE_SIZE,
    total,
    items,
    builtin_total: builtinItems.length,
    builtin_items: builtinItems,
    site_parser_total: siteParserItems.length,
    site_parser_items: siteParserItems
  });
}

export async function handleAdminRulesPost(request, db) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const body = parsed.data || {};
  const remark = String(body.remark || "").trim();
  const sender_filter = String(body.sender_filter || "").trim();
  const pattern = String(body.pattern || "").trim();
  if (!pattern) return jsonError("pattern is required", 400);
  if (pattern.length > MAX_RULE_PATTERN_LENGTH) return jsonError("pattern is too long", 400);
  if (remark.length > MAX_RULE_REMARK_LENGTH) return jsonError("remark is too long", 400);
  if (sender_filter.length > MAX_SENDER_FILTER_LENGTH) return jsonError("sender_filter is too long", 400);
  if (!isValidRegexPattern(pattern, "m")) return jsonError("pattern is not a valid regular expression", 400);
  if (hasInvalidPatternList(sender_filter)) return jsonError("sender_filter contains an invalid regular expression", 400);

  await dbActions.createRule(db, { remark, sender_filter, pattern });
  return json({ ok: true });
}

export async function handleAdminRulesPut(pathname, request, db) {
  const id = Number(pathname.replace("/admin/rules/", ""));
  if (!Number.isFinite(id)) return jsonError("invalid rule id", 400);

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const body = parsed.data || {};
  const remark = String(body.remark || "").trim();
  const sender_filter = String(body.sender_filter || "").trim();
  const pattern = String(body.pattern || "").trim();
  if (!pattern) return jsonError("pattern is required", 400);
  if (pattern.length > MAX_RULE_PATTERN_LENGTH) return jsonError("pattern is too long", 400);
  if (remark.length > MAX_RULE_REMARK_LENGTH) return jsonError("remark is too long", 400);
  if (sender_filter.length > MAX_SENDER_FILTER_LENGTH) return jsonError("sender_filter is too long", 400);
  if (!isValidRegexPattern(pattern, "m")) return jsonError("pattern is not a valid regular expression", 400);
  if (hasInvalidPatternList(sender_filter)) return jsonError("sender_filter contains an invalid regular expression", 400);

  const result = await dbActions.updateRule(db, id, { remark, sender_filter, pattern });
  if (!hasDbChanges(result)) return jsonError("rule not found", 404);
  return json({ ok: true });
}

export async function handleAdminRulesDelete(pathname, db) {
  const id = Number(pathname.replace("/admin/rules/", ""));
  if (!Number.isFinite(id)) return jsonError("invalid rule id", 400);
  const result = await dbActions.deleteRule(db, id);
  if (!hasDbChanges(result)) return jsonError("rule not found", 404);
  return json({ ok: true });
}

export async function handleAdminWhitelistGet(url, db) {
  const page = clampPage(url.searchParams.get("page"));
  const { items, total } = await dbActions.getWhitelistPaged(db, page, RULES_PAGE_SIZE);
  return json({ page, pageSize: RULES_PAGE_SIZE, total, items });
}

export async function handleAdminWhitelistPost(request, db) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const body = parsed.data || {};
  const senderPattern = String(body.sender_pattern || "").trim();
  if (!senderPattern) return jsonError("sender_pattern is required", 400);
  if (senderPattern.length > MAX_SENDER_PATTERN_LENGTH) return jsonError("sender_pattern is too long", 400);
  if (!isValidRegexPattern(senderPattern, "i")) return jsonError("sender_pattern is not a valid regular expression", 400);

  await dbActions.createWhitelistEntry(db, senderPattern);
  return json({ ok: true });
}

export async function handleAdminWhitelistPut(pathname, request, db) {
  const id = Number(pathname.replace("/admin/whitelist/", ""));
  if (!Number.isFinite(id)) return jsonError("invalid whitelist id", 400);

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const body = parsed.data || {};
  const senderPattern = String(body.sender_pattern || "").trim();
  if (!senderPattern) return jsonError("sender_pattern is required", 400);
  if (senderPattern.length > MAX_SENDER_PATTERN_LENGTH) return jsonError("sender_pattern is too long", 400);
  if (!isValidRegexPattern(senderPattern, "i")) return jsonError("sender_pattern is not a valid regular expression", 400);

  const result = await dbActions.updateWhitelistEntry(db, id, senderPattern);
  if (!hasDbChanges(result)) return jsonError("whitelist entry not found", 404);
  return json({ ok: true });
}

export async function handleAdminWhitelistDelete(pathname, db) {
  const id = Number(pathname.replace("/admin/whitelist/", ""));
  if (!Number.isFinite(id)) return jsonError("invalid whitelist id", 400);
  const result = await dbActions.deleteWhitelistEntry(db, id);
  if (!hasDbChanges(result)) return jsonError("whitelist entry not found", 404);
  return json({ ok: true });
}

export async function handleAdminForwardingGet(db, envForwardTo, sendEmailBinding) {
  const settings = await dbActions.getForwardingSettings(db);
  const effectiveForwardTo = dbActions.resolveEffectiveForwardTarget(settings, envForwardTo);
  return json({
    forwarding_mode: settings.forwarding_mode,
    forward_to: settings.forward_to,
    builtin_rule_mode: settings.builtin_rule_mode,
    forward_payload_mode: settings.forward_payload_mode,
    env_forward_to: String(envForwardTo || ""),
    effective_forward_to: effectiveForwardTo,
    forwarding_active: Boolean(effectiveForwardTo),
    matched_forwarding_available: Boolean(sendEmailBinding?.send)
  });
}

export async function handleAdminForwardingPut(request, db, envForwardTo, sendEmailBinding) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const body = parsed.data || {};
  const forwardingMode = String(body.forwarding_mode || "").trim();
  const builtinRuleMode = String(body.builtin_rule_mode || "").trim();
  const forwardPayloadMode = String(body.forward_payload_mode || "").trim();
  const forwardTo = normalizeText(body.forward_to, MAX_FORWARD_ADDRESS_LENGTH).toLowerCase();

  if (!FORWARDING_MODES.has(forwardingMode)) return jsonError("forwarding_mode is invalid", 400);
  if (!BUILTIN_RULE_MODES.has(builtinRuleMode)) return jsonError("builtin_rule_mode is invalid", 400);
  if (!FORWARD_PAYLOAD_MODES.has(forwardPayloadMode)) return jsonError("forward_payload_mode is invalid", 400);
  if (forwardTo && !isValidEmailAddress(forwardTo)) return jsonError("forward_to must be a valid email address", 400);
  if (forwardingMode === "custom" && !forwardTo) return jsonError("forward_to is required when forwarding_mode=custom", 400);
  if (forwardPayloadMode === "matched" && !sendEmailBinding?.send) {
    return jsonError("forward_payload_mode=matched requires SEND_EMAIL binding", 400);
  }

  await dbActions.updateForwardingSettings(db, {
    forwarding_mode: forwardingMode,
    forward_to: forwardTo || null,
    builtin_rule_mode: builtinRuleMode,
    forward_payload_mode: forwardPayloadMode
  });

  const settings = await dbActions.getForwardingSettings(db);
  const effectiveForwardTo = dbActions.resolveEffectiveForwardTarget(settings, envForwardTo);
  return json({
    ok: true,
    forwarding_mode: settings.forwarding_mode,
    forward_to: settings.forward_to,
    builtin_rule_mode: settings.builtin_rule_mode,
    forward_payload_mode: settings.forward_payload_mode,
    env_forward_to: String(envForwardTo || ""),
    effective_forward_to: effectiveForwardTo,
    forwarding_active: Boolean(effectiveForwardTo),
    matched_forwarding_available: Boolean(sendEmailBinding?.send)
  });
}
