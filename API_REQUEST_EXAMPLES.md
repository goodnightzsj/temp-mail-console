# API Request Examples

将下面的示例域名替换成你自己的 Worker 地址，例如 `https://<your-worker-domain>`。

## Authentication

所有 `/api/*` 请求都需要：

`Authorization: Bearer <API_TOKEN>`

## Quick Start

先设置环境变量：

```bash
export WORKER_URL="https://<your-worker-domain>"
export API_TOKEN="<你的 API_TOKEN>"
export ADDRESS="demo@yourdomain.com"
```

查询最新一条：

```bash
curl "$WORKER_URL/api/emails/latest?address=$ADDRESS" \
  -H "Authorization: Bearer $API_TOKEN"
```

按条件拉列表：

```bash
curl "$WORKER_URL/api/emails?address=$ADDRESS&remark=链接&since=2026-03-26T00:00:00.000Z&limit=20" \
  -H "Authorization: Bearer $API_TOKEN"
```

## Query Parameters

### GET /api/emails/latest
- `address`：必填，收件邮箱地址
- `since`：可选，支持 13 位毫秒时间戳或 ISO 日期时间
- `remark`：可选，按命中备注过滤

### GET /api/emails
- `address`：必填，收件邮箱地址
- `since`：可选
- `remark`：可选
- `limit`：可选，默认 `20`，最大 `50`

## cURL Examples

查询最新一条且只看“数字”命中：

```bash
curl --request GET \
  "$WORKER_URL/api/emails/latest?address=$ADDRESS&remark=数字" \
  --header "Authorization: Bearer $API_TOKEN"
```

查询某个时间点之后的邮件列表：

```bash
curl --request GET \
  "$WORKER_URL/api/emails?address=$ADDRESS&since=1742947200000&limit=10" \
  --header "Authorization: Bearer $API_TOKEN"
```

查询某个 remark 的链接类邮件：

```bash
curl --request GET \
  "$WORKER_URL/api/emails?address=$ADDRESS&remark=链接&since=2026-03-26T00:00:00.000Z" \
  --header "Authorization: Bearer $API_TOKEN"
```

筛选内置识别出的封禁 / 停用通知：

```bash
curl --request GET \
  "$WORKER_URL/api/emails/latest?address=$ADDRESS&remark=封禁邮件" \
  --header "Authorization: Bearer $API_TOKEN"
```

查询站点解析器识别出的 OpenAI 邀请链接：

```bash
curl --request GET \
  "$WORKER_URL/api/emails/latest?address=$ADDRESS&remark=OpenAI%20Team%20邀请链接" \
  --header "Authorization: Bearer $API_TOKEN"
```

## JavaScript fetch Example

```js
const workerUrl = "https://<your-worker-domain>";
const apiToken = "<API_TOKEN>";
const address = "demo@yourdomain.com";

const params = new URLSearchParams({
  address,
  remark: "数字",
  since: new Date("2026-03-26T00:00:00.000Z").toISOString(),
  limit: "20"
});

const response = await fetch(`${workerUrl}/api/emails?${params.toString()}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
});

const payload = await response.json();
console.log(response.status, payload);
```

## Python requests Example

```python
import requests

worker_url = "https://<your-worker-domain>"
api_token = "<API_TOKEN>"
address = "demo@yourdomain.com"

response = requests.get(
    f"{worker_url}/api/emails",
    params={
        "address": address,
        "remark": "链接",
        "since": "2026-03-26T00:00:00.000Z",
        "limit": 20,
    },
    headers={"Authorization": f"Bearer {api_token}"},
    timeout=15,
)

print(response.status_code)
print(response.json())
```

## Success Response Example

最新一条：

```json
{
  "code": 200,
  "data": {
    "message_id": "4f9c5a6d-0c64-4e61-bcc2-ec74b5f4cb4c",
    "from_address": "noreply@example.com",
    "to_address": "demo@yourdomain.com",
    "subject": "Your sign-in code",
    "content_summary": "Use code 123456 to continue. Visit https://example.com/verify if needed.",
    "received_at": 1741881600000,
    "results": [
      {
        "rule_id": null,
        "rule_key": null,
        "plugin_key": "openai",
        "site_key": "openai",
        "source": "site_parser",
        "remark": "OpenAI 验证码",
        "value": "123456",
        "match": "123456",
        "before": "Subject: Your ChatGPT code is",
        "after": "Text: Enter this temporary verification code to continue.",
        "kind": "code"
      }
    ]
  }
}
```

说明：
- `results` 是站点解析器与规则引擎收敛后的主结果，不保证把所有重复命中原样返回。
- 站点解析器结果会带 `plugin_key / site_key / kind`。
- 规则引擎结果仍可能带 `rule_key` 或 `rule_id`。
- 当同一个验证码、链接或邀请链接被多个来源同时命中时，默认优先保留 `site_parser > builtin > custom`。
- 规则引擎会按规则类型选择匹配字段；验证码类默认看 `subject / text / htmlText`，链接类才会额外看 `rawHtml`。

列表查询：

```json
{
  "code": 200,
  "data": {
    "address": "demo@yourdomain.com",
    "since": 1741881600000,
    "remark": "链接",
    "limit": 20,
    "total": 2,
    "items": [
      {
        "message_id": "4f9c5a6d-0c64-4e61-bcc2-ec74b5f4cb4c",
        "from_address": "noreply@example.com",
        "to_address": "demo@yourdomain.com",
        "subject": "Confirm your email",
        "content_summary": "Click https://example.com/verify to complete verification.",
        "received_at": 1741881600000,
        "results": [
          {
            "rule_id": null,
            "rule_key": null,
            "plugin_key": "tavily",
            "site_key": "tavily",
            "source": "site_parser",
            "remark": "Tavily 验证链接",
            "value": "https://auth.tavily.com/u/email-verification?ticket=demo",
            "match": "https://auth.tavily.com/u/email-verification?ticket=demo",
            "before": "Click",
            "after": "to complete verification.",
            "kind": "link"
          }
        ]
      }
    ]
  }
}
```

## Common Error Responses

未带令牌或令牌错误：

```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

未传 `address`：

```json
{
  "code": 400,
  "message": "address is required"
}
```

`since` 格式不合法：

```json
{
  "code": 400,
  "message": "since must be a unix timestamp or ISO datetime"
}
```

查询不到邮件：

```json
{
  "code": 404,
  "message": "message not found"
}
```
