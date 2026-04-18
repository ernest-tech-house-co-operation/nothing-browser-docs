# Cookie Inspector

The COOKIES tab captures every cookie the moment it is set — with the exact request that created it.

---

## Overview

Unlike browser DevTools that only show cookies, Nothing Browser shows you **which API call set each cookie**. This is critical for understanding authentication flows.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COOKIES [38]                                                               │
├───────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│ Name          │ Value           │ Domain          │ Expires                 │
├───────────────┼─────────────────┼─────────────────┼─────────────────────────┤
│ session_id    │ abc123def456... │ .example.com    │ 2026-01-15 14:30:00    │
│ csrf_token    │ xyz789...       │ .example.com    │ Session                 │
│ _ga           │ GA1.2.abc...    │ .example.com    │ 2027-01-01 00:00:00    │
│ user_pref     │ dark_mode       │ .example.com    │ 2026-12-31 23:59:59    │
└───────────────┴─────────────────┴─────────────────┴─────────────────────────┘
```

---

## What Gets Captured

| Column | Description | Special Indicator |
|--------|-------------|-------------------|
| **Name** | Cookie name | 🟠 Orange = HttpOnly |
| **Value** | Full cookie value | — |
| **Domain** | Domain the cookie belongs to | — |
| **Path** | Cookie path scope | — |
| **HttpOnly** | Yes/No | Cannot be accessed by JavaScript |
| **Secure** | Yes/No | Only sent over HTTPS |
| **Expires** | Expiry date or "Session" | Session = deleted on close |

### HttpOnly Indicator

| Color | Meaning |
|-------|---------|
| 🟠 **Orange** | HttpOnly flag set (cannot be read by JavaScript) |
| ⚪ **Normal** | Not HttpOnly (JavaScript can access) |

### Expiry Types

| Value | Meaning |
|-------|---------|
| `Session` | Cookie deleted when browser closes |
| `Date` | Cookie expires on that date |
| `(empty)` | Persistent with no expiry |

---

## Set-By Request Tab — The Killer Feature

Click any cookie to see the **exact request that set it**.

### What You See

| Field | Description |
|-------|-------------|
| **URL** | Full request URL |
| **Method** | GET, POST, PUT, etc. |
| **Headers** | All request headers |
| **Response Headers** | Set-Cookie header that created this cookie |

### Example

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Set-By Request                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  URL: https://api.example.com/auth/login                                    │
│  Method: POST                                                               │
│                                                                             │
│  Request Headers:                                                           │
│    Content-Type: application/json                                           │
│    User-Agent: Mozilla/5.0 ...                                              │
│                                                                             │
│  Response Headers:                                                          │
│    Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure                  │
│    Set-Cookie: csrf_token=xyz789; Path=/                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Matters

| Question | Without This | With This |
|----------|--------------|-----------|
| Which API set this cookie? | Guess | See exactly |
| What request body was sent? | Unknown | Full request shown |
| What headers were used? | Unknown | Full headers shown |
| Is it HttpOnly/Secure? | Check manually | Shown clearly |

**When you need to know which API call created an authentication cookie, you don't have to guess.**

---

## Copy All Cookies as JSON

The **COPY ALL JSON** button outputs all captured cookies as a JSON object:

```json
{
  "session_id": "abc123def456ghi789",
  "csrf_token": "xyz789uvw456",
  "_ga": "GA1.2.123456789.1234567890",
  "user_preferences": "{\"theme\":\"dark\",\"language\":\"en\"}"
}
```

### Use Cases

- **Session persistence** — Save cookies to file, restore later
- **API testing** — Import cookies into Postman/Insomnia
- **Scraping** — Use cookies in Python requests
- **Debugging** — Compare cookie values across sessions

---

## Cookies in Exports

When you export a request from the NETWORK or EXPORT tab, cookies are **automatically matched** to the request URL and included.

### Python Export

```python
import requests

cookies = {
    "session_id": "abc123def456",
    "csrf_token": "xyz789uvw456"
}

response = requests.get("https://api.example.com/data", cookies=cookies)
```

### cURL Export

```bash
curl -X GET 'https://api.example.com/data' \
  -H 'Cookie: session_id=abc123def456; csrf_token=xyz789uvw456'
```

### JavaScript Export

```javascript
fetch('https://api.example.com/data', {
  headers: {
    'Cookie': 'session_id=abc123def456; csrf_token=xyz789uvw456'
  }
})
```

### How Matching Works

| Rule | Description |
|------|-------------|
| **Domain match** | Cookie domain matches request URL |
| **Path match** | Cookie path matches or is parent |
| **Secure match** | HTTPS requests only get Secure cookies |
| **HttpOnly** | Included in exports (can't be read by JS anyway) |

---

## Real-World Use Cases

### 1. Reverse Engineering Authentication

```text
1. Log in to the site
2. Check COOKIES tab
3. Find the session cookie
4. Click "Set-By Request"
5. See exactly which API call created it
6. Replicate that API call in your scraper
```

### 2. Session Export for Scraping

```text
1. Log in manually in Nothing Browser
2. Click COPY ALL JSON
3. Save cookies to file
4. Use in Python scraper with requests
5. Session stays authenticated
```

### 3. Debugging Cookie Issues

```text
1. Site says "session expired"
2. Check COOKIES tab
3. See if cookie has expiry date
4. Check if Secure flag mismatches (HTTP vs HTTPS)
5. Check if Path is correct
```

### 4. Comparing Cookie Differences

```text
1. Log in with account A
2. Copy cookies to file A
3. Log in with account B
4. Copy cookies to file B
5. Compare differences
```

---

## Cookie Attributes Explained

| Attribute | Meaning | Security Impact |
|-----------|---------|-----------------|
| **HttpOnly** | Cannot be read by JavaScript | ✅ Prevents XSS theft |
| **Secure** | Only sent over HTTPS | ✅ Prevents MITM |
| **SameSite** | Controls cross-site sending | ✅ Prevents CSRF |
| **Domain** | Which domains receive the cookie | ⚠️ Wide domains = risk |
| **Path** | Which URL paths receive the cookie | Low impact |
| **Expires** | When cookie is deleted | Session = more secure |

---

## Filtering Cookies

Use the filter bar to find specific cookies:

| Filter | Example |
|--------|---------|
| By name | `session` |
| By domain | `.example.com` |
| By HttpOnly | `httponly:true` |
| By Secure | `secure:true` |
| By Session | `session:true` |

---

## Clearing Cookies

### Clear Single Cookie

Select cookie → Click **DELETE**

### Clear All Cookies

Click **CLEAR ALL** button

### Clear by Domain

Filter by domain → Select all → Delete

---

## Privacy Note

Cookies captured in DEVTOOLS are:

- ✅ Stored only in memory
- ✅ Cleared when you click CLEAR
- ✅ Not saved to disk (unless you export)
- ✅ Wiped when browser closes

---

## Troubleshooting

### Cookie Not Appearing

**Solutions:**
- Check DEVTOOLS is open
- Check you're on the COOKIES tab
- Refresh the page to trigger cookie setting
- Check if cookie was set via JavaScript (may appear later)

### Set-By Request Empty

**Possible causes:**
- Cookie was set by JavaScript, not HTTP response
- Cookie existed before capture started
- Cookie was modified after setting

### Cookie Value Truncated

**Solution:** Click the cookie to see full value in detail panel

### Exported Cookies Missing

**Solution:** Check domain/path matching — cookies must match the request URL

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus filter bar |
| `Delete` | Delete selected cookie |
| `Ctrl+A` | Select all cookies |
| `Ctrl+C` | Copy selected cookie as JSON |

---

## API Reference (for Developers)

The cookie data is available programmatically:

### Via Piggy

```ts
// Get all cookies
const cookies = await site.cookies.list();

// Get specific cookie
const session = await site.cookies.get("session_id");

// Set cookie
await site.cookies.set("name", "value", ".example.com", "/");
```

### Via C++ (Plugins)

```cpp
// Access captured cookies
QVector<CookieData> cookies = capture->cookies();
for (const auto& cookie : cookies) {
    qDebug() << cookie.name << cookie.value;
}
```

---

## Next Steps

- [Network Inspector](./network-inspector) — HTTP requests that set cookies
- [DEVTOOLS Tab](./devtools) — Complete capture overview
- [Session Management](./sessions) — Save cookies across sessions

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
