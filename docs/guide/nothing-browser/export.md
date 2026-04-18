# One-Click Export

Any captured request can be turned into runnable code in **one click**.

---

## Overview

Stop manually copying headers and cookies. Select a request, choose your format, and get ready-to-run code.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NETWORK [247]                         │  EXPORT                             │
├─────────────────────────────────────────┼─────────────────────────────────────┤
│  POST  200  /api/login                  │  Format: [Python (requests) ▼]     │
│  GET   200  /api/user                   │                                     │
│  POST  201  /api/data                   │  ┌───────────────────────────────┐ │
│  GET   304  /api/status                 │  │ import requests               │ │
│                                         │  │                               │ │
│  [Select a request first]               │  │ url = "https://api..."        │ │
│                                         │  │                               │ │
│                                         │  │ headers = {                   │ │
│                                         │  │     "Authorization": "..."    │ │
│                                         │  │ }                             │ │
│                                         │  │                               │ │
│                                         │  │ response = requests.get(...)  │ │
│                                         │  └───────────────────────────────┘ │
│                                         │                                     │
│                                         │  [COPY]  [DOWNLOAD]                 │
└─────────────────────────────────────────┴─────────────────────────────────────┘
```

---

## Supported Formats

| Format | Library | Use Case | TLS Fingerprint |
|--------|---------|----------|-----------------|
| **Python (requests)** | `requests` | Standard Python scraping | ❌ OpenSSL (detectable) |
| **Python (curl_cffi)** | `curl_cffi` | Python with Chrome TLS | ✅ Chrome-identical |
| **cURL** | `curl` | Terminal / shell scripts | ❌ Depends on build |
| **JavaScript** | `fetch` | Browser / Node.js | ❌ Browser default |
| **Raw HTTP** | — | Debugging | — |

---

## Format Details

### Python — requests

Standard Python `requests` library. Easy to use but uses OpenSSL (detectable by Cloudflare).

```python
import requests

url = "https://api.example.com/v1/data"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
    "Content-Type": "application/json"
}

cookies = {
    "session_id": "abc123def456",
    "csrf_token": "xyz789uvw456"
}

response = requests.post(url, headers=headers, cookies=cookies, json={"key": "value"})
print(response.status_code)
print(response.text[:2000])
```

**When to use:** Internal APIs, non-protected endpoints, quick testing.

---

### Python — curl_cffi

Same syntax as `requests` but uses `curl_cffi` with Chrome TLS impersonation. **Bypasses Cloudflare.**

```python
from curl_cffi import requests

url = "https://api.example.com/v1/data"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

cookies = {
    "session_id": "abc123def456"
}

# Chrome 124 TLS fingerprint
response = requests.post(url, headers=headers, cookies=cookies, impersonate="chrome124")

print(response.status_code)
print(response.json())
```

**Installation:**
```bash
pip install curl_cffi
```

**When to use:** Cloudflare-protected sites, production scraping.

---

### cURL

Terminal-friendly. Great for quick testing and shell scripts.

```bash
curl -X POST \
  'https://api.example.com/v1/data' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session_id=abc123def456; csrf_token=xyz789uvw456' \
  --data-raw '{"key": "value"}' \
  --compressed
```

**When to use:** Terminal testing, debugging, sharing with teammates.

---

### JavaScript fetch

Browser or Node.js native `fetch` API.

```javascript
const response = await fetch('https://api.example.com/v1/data', {
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({"key": "value"})
});

const data = await response.json();
console.log(data);
```

**When to use:** Browser automation, Node.js scripts, frontend testing.

---

### Raw HTTP

Raw HTTP/1.1 format for debugging.

```http
POST /v1/data HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Cookie: session_id=abc123def456
Content-Length: 16

{"key":"value"}
```

**When to use:** Understanding HTTP protocol, debugging, writing low-level clients.

---

## Using the EXPORT Tab

### Step-by-Step

```
Step 1: Select a request in the NETWORK tab
              │
              ▼
Step 2: Go to the EXPORT tab
              │
              ▼
Step 3: Choose your format from the dropdown
              │
              ▼
Step 4: Click GENERATE
              │
              ▼
Step 5: Click COPY or DOWNLOAD
```

### What Gets Included

| Component | Included? | Source |
|-----------|-----------|--------|
| **URL** | ✅ Yes | Request URL |
| **Method** | ✅ Yes | GET/POST/PUT/DELETE |
| **Headers** | ✅ Yes | Request headers |
| **Cookies** | ✅ Yes | Matched from Cookie Inspector |
| **Body** | ✅ Yes | Request body (if any) |
| **Query params** | ✅ Yes | URL query string |

### Cookie Matching

Cookies are automatically resolved from the Cookie Inspector based on:

| Rule | Description |
|------|-------------|
| **Domain** | Cookie domain matches request URL |
| **Path** | Cookie path matches or is parent |
| **Secure** | HTTPS requests only get Secure cookies |

**You don't need to manually add cookies — they're included automatically.**

---

## Real-World Use Cases

### 1. Replicate API Call in Python

```text
1. Browse to site in Nothing Browser
2. Find API request in NETWORK tab
3. Select it
4. EXPORT → Python (curl_cffi)
5. COPY
6. Paste into your Python script
7. Run — it just works
```

### 2. Share cURL Command with Team

```text
1. Capture problematic request
2. EXPORT → cURL
3. COPY
4. Send to teammate
5. They can reproduce exactly
```

### 3. Debug with Raw HTTP

```text
1. Request not working as expected
2. EXPORT → Raw HTTP
3. See exact bytes being sent
4. Spot missing headers or formatting issues
```

### 4. Convert to JavaScript for Puppeteer/Playwright

```text
1. Capture authentication request
2. EXPORT → JavaScript fetch
3. Use in browser automation script
4. Maintains all headers and cookies
```

---

## Format Comparison

| Feature | Python (requests) | Python (curl_cffi) | cURL | JavaScript |
|---------|-------------------|---------------------|------|------------|
| **Cloudflare bypass** | ❌ | ✅ | ⚠️ | ❌ |
| **Easy to read** | ✅ | ✅ | ⚠️ | ✅ |
| **Copy-paste run** | ✅ | ✅ (pip install) | ✅ | ✅ |
| **Headers preserved** | ✅ | ✅ | ✅ | ✅ |
| **Cookies preserved** | ✅ | ✅ | ✅ | ✅ |
| **Body preserved** | ✅ | ✅ | ✅ | ✅ |

---

## curl_cffi vs requests

### Why curl_cffi?

| Aspect | requests | curl_cffi |
|--------|----------|-----------|
| **TLS library** | OpenSSL | BoringSSL |
| **JA3 fingerprint** | Python (detectable) | Chrome (undetectable) |
| **Cloudflare** | ❌ Blocked | ✅ Passes |
| **Syntax** | Standard | Same as requests |

### Migration Example

```python
# Before (requests)
import requests
response = requests.get(url, headers=headers)

# After (curl_cffi) - change ONE line
from curl_cffi import requests
response = requests.get(url, headers=headers, impersonate="chrome124")
```

---

## Troubleshooting

### Exported Code Doesn't Work

**Possible causes:**
- Session expired (cookies outdated)
- Request requires specific order of operations
- Missing dynamic values (timestamps, nonces)

**Solutions:**
- Re-capture fresh request
- Check if request has dynamic parameters
- Use session persistence to maintain login

### Cookies Missing in Export

**Solution:** Ensure cookie domain matches request URL. Check Cookie Inspector for the cookie.

### curl_cffi Not Installed

```bash
pip install curl_cffi
```

### Python Version Issues

`curl_cffi` requires Python 3.8+:

```bash
python --version
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Focus EXPORT tab (when request selected) |
| `Ctrl+G` | Generate code |
| `Ctrl+C` | Copy generated code |
| `Ctrl+S` | Download generated code |

---

## Next Steps

- [Network Inspector](./network-inspector) — Capture requests to export
- [Cookie Inspector](./cookie-inspector) — Understand cookie matching
- [DEVTOOLS Tab](./devtools) — Complete capture overview

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
