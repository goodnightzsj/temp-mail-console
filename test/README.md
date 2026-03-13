# 测试说明

本目录包含示例 `.eml` 文件与本地测试所需的 curl 命令。

## 1）启动本地服务

```bash
npx wrangler d1 execute temp-email-db --local --file schema.sql
npx wrangler dev --local --port 8787
```

## 2）发送测试邮件（触发 email handler）

```bash
curl -X POST "http://localhost:8787/cdn-cgi/handler/email?from=sender@example.com&to=demo@yourdomain.com" \
  --data-binary @./test/sample.eml
```

## 3）匹配规则说明（仅说明，不含创建接口）

测试邮件正文包含：

```
Your verification code is 123456.
```

对应的正则匹配（提取 6 位验证码）：

```
\b\d{6}\b
```

如果你只想匹配固定格式的句子，也可以使用：

```
Your verification code is \d{6}
```

### 发信人过滤规则（匹配域名）

如果要匹配某个域名的发信人，例如 `@example.com`：

```
.*@example\.com
```

如需同时匹配多个域名，可用逗号或换行分隔：

```
.*@example\.com
.*@demo\.com
```

## 4）按邮箱查询最新命中结果

```bash
curl "http://localhost:8787/api/hits/latest?address=demo@yourdomain.com" \
  -H "Authorization: Bearer dev-api-token"
```

## 注意事项

- 如有需要，请将 `demo@yourdomain.com` 替换为你的路由邮箱地址。
- 如果你修改了 `wrangler.toml` 中的 `ADMIN_TOKEN` / `API_TOKEN`，请同步替换命令中的 token。
