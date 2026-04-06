# Cookie Inspector

The COOKIES tab captures every cookie the moment it is set.

## What Gets Captured

| Column | Description |
| --- | --- |
| Name | Cookie name (orange = HttpOnly) |
| Value | Full cookie value |
| Domain | Domain the cookie belongs to |
| Path | Cookie path scope |
| HttpOnly | Yes if the cookie is HttpOnly |
| Secure | Yes if Secure flag is set |
| Expires | Expiry date or Session |

## Set-By Request Tab

Click any cookie to see the request that set it. The **Set-By Request** sub-tab shows:

- The full HTTP request (method, path, host, headers)
- The complete URL

This is the most important feature of the Cookie Inspector. When you need to know which API call created an authentication cookie, you don't have to guess.

## Copy All Cookies as JSON

The **COPY ALL JSON** button outputs all captured cookies as a Python/JavaScript dictionary:

```json
{
  "session_id": "abc123...",
  "csrf_token": "xyz...",
  "_ga": "GA1.2..."
}
```

## Cookies in Exports

When you export a request from the NETWORK or EXPORT tab, cookies are automatically matched to the request URL and included in the export. Python exports get a `cookies={}` dict. cURL exports get a `-H 'Cookie: ...'` header.
