# DEVTOOLS Tab

The main scrapper panel. **Always running** — capture starts the moment you navigate anywhere in the BROWSER tab.

---

## Overview

Unlike browser DevTools that you have to open manually, Nothing Browser's DEVTOOLS tab captures everything automatically from the first request.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DEVTOOLS  │  BROWSER  │  YOUTUBE  │  TECH HOUSE           │  PLUGINS      │
├─────────────────────────────────────────────────────────────────────────────┤
│  NETWORK [247]  │  WS [12]  │  COOKIES [38]  │  STORAGE [4]  │  EXPORT      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POST  200  Fetch  1.2k  https://api.example.com/v1/data                   │
│  GET   304  Script  -    https://cdn.example.com/app.js                    │
│  GET   200  Image   45k  https://cdn.example.com/logo.png                  │
│  WS    OPEN  -       -    wss://socket.example.com                         │
│                                                                             │
│  [COPY HEADERS] [COPY RESPONSE] [AS CURL] [AS PYTHON] [DOWNLOAD]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Sub-Tabs

| Tab | What It Shows | Live Count |
|-----|---------------|------------|
| **NETWORK** | All HTTP requests and responses | `NETWORK [247]` |
| **WS** | All WebSocket frames | `WS [12]` |
| **COOKIES** | All cookies with set-by request info | `COOKIES [38]` |
| **STORAGE** | All localStorage and sessionStorage writes | `STORAGE [4]` |
| **EXPORT** | Code generator for Python, cURL, JS, raw HTTP | — |

---

## NETWORK Tab

Captures every HTTP request and response in real time.

### What You See

| Column | Description |
|--------|-------------|
| **Method** | GET, POST, PUT, DELETE, PATCH |
| **Status** | 200, 304, 404, 500, etc. |
| **Type** | Fetch, XHR, Script, Doc, Img, WS |
| **Size** | Response size (bytes/KB) |
| **URL** | Request URL (truncated) |

### Detail Panel

Click any request to see:

- **Summary + Headers** — Firefox-style view with decoded query params
- **Response** — Full server response (JSON formatted)
- **Raw** — Raw HTTP/1.1 representation

### Live Counter

The tab label shows the number of captured requests:

```
NETWORK [247]   ← 247 requests captured so far
```

### Buttons

| Button | Action |
|--------|--------|
| **COPY HEADERS** | Copy request + response headers |
| **COPY RESPONSE** | Copy response body |
| **AS CURL** | Generate cURL command |
| **AS PYTHON** | Generate Python requests script |
| **DOWNLOAD** | Save full request/response to file |

### Filtering

| Filter | Example |
|--------|---------|
| URL search | `/api/v1` |
| Method | `POST` |
| Status | `200`, `404` |
| Type | `fetch`, `xhr`, `script` |

[Full Network Inspector documentation →](./network-inspector)

---

## WS Tab (WebSocket)

Captures all WebSocket frames in real time.

### What You See

| Column | Description |
|--------|-------------|
| **Time** | Timestamp |
| **Direction** | UP SENT (green) or DN RECV (blue) |
| **Type** | Text, Binary, Open, Close |
| **Size** | Frame size in bytes |
| **Preview** | First 50 characters |

### Frame Types

| Direction | Label | Color |
|-----------|-------|-------|
| Outgoing | `UP SENT` | 🟢 Green |
| Incoming | `DN RECV` | 🔵 Blue |
| Open | `OPEN` | 🟡 Yellow |
| Close | `CLOSED` | 🔴 Red |

### Detail Panel

Click any frame to see:

- **Formatted** — JSON pretty-printed (if applicable)
- **Hex dump** — For binary frames
- **Raw** — Raw text

### Binary Frames

Binary frames show a hex dump with ASCII preview:

```
0000  48 65 6c 6c 6f 20 57 6f  72 6c 64 0a 00 00 00 00  Hello Wo rld.....
0010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ........ ........
```

Click **DOWNLOAD** to save the raw binary frame.

[Full WebSocket Capture documentation →](./websocket-capture)

---

## COOKIES Tab

Captures every cookie the moment it is set.

### What You See

| Column | Description |
|--------|-------------|
| **Name** | Cookie name (orange = HttpOnly) |
| **Value** | Full cookie value |
| **Domain** | Cookie domain |
| **Path** | Cookie path |
| **Expires** | Expiry date or "Session" |

### Set-By Request

Click any cookie → **Set-By Request** sub-tab shows:

- The exact HTTP request that set the cookie
- Full URL and headers

This is the most important feature — you see exactly which API call created the cookie.

### Copy All Cookies

Click **COPY ALL JSON** to export all cookies as JSON:

```json
{
  "session_id": "abc123...",
  "csrf_token": "xyz...",
  "_ga": "GA1.2..."
}
```

[Full Cookie Inspector documentation →](./cookie-inspector)

---

## STORAGE Tab

Shows every `localStorage.setItem()` and `sessionStorage.setItem()` call in real time.

### What You See

| Column | Description |
|--------|-------------|
| **Type** | localStorage (purple) or sessionStorage (blue) |
| **Origin** | Domain that set the item |
| **Key** | Storage key name |
| **Value** | Stored value (truncated) |

### Color Coding

| Storage Type | Color |
|--------------|-------|
| `localStorage` | 🟣 Purple |
| `sessionStorage` | 🔵 Blue |

### Detail Panel

Click any item to see:

- Full value (untruncated)
- Timestamp
- Origin details

---

## EXPORT Tab

Generate ready-to-run code from any captured request.

### How to Use

1. **Select a request** from the NETWORK tab
2. **Go to EXPORT tab**
3. **Choose format** from dropdown
4. **Click GENERATE**
5. **Click COPY or DOWNLOAD**

### Supported Formats

| Format | Library | Use Case |
|--------|---------|----------|
| **Python (requests)** | `requests` | Standard Python scraping |
| **Python (curl_cffi)** | `curl_cffi` | Chrome TLS fingerprint |
| **cURL** | `curl` | Terminal / shell scripts |
| **JavaScript** | `fetch` | Browser / Node.js |
| **Raw HTTP** | — | Debugging |

### Example Output (Python)

```python
import requests

url = "https://api.example.com/v1/data"

headers = {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
}

cookies = {
    "session_id": "abc123"
}

response = requests.get(url, headers=headers, cookies=cookies)
print(response.json())
```

[Full Export documentation →](./export)

---

## CLEAR Button

The **CLEAR** button in the NETWORK tab clears **all data across all sub-tabs simultaneously**.

| Sub-Tab | What Gets Cleared |
|---------|-------------------|
| NETWORK | All HTTP requests |
| WS | All WebSocket frames |
| COOKIES | All captured cookies |
| STORAGE | All storage writes |

**Use this to start a fresh capture session.**

---

## Live Counters

Each sub-tab shows a live counter of captured items:

| Tab | Counter Example | Meaning |
|-----|-----------------|---------|
| NETWORK | `[247]` | 247 HTTP requests |
| WS | `[12]` | 12 WebSocket frames |
| COOKIES | `[38]` | 38 cookies captured |
| STORAGE | `[4]` | 4 storage writes |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Switch to DEVTOOLS tab |
| `Ctrl+Shift+B` | Switch to BROWSER tab |
| `Ctrl+Shift+C` | Clear all captured data |
| `Ctrl+E` | Focus EXPORT tab (when a request is selected) |

---

## Performance Notes

| Metric | Value |
|--------|-------|
| Max requests | Unlimited (memory permitting) |
| Max WebSocket frames | Unlimited |
| Memory usage | Increases with capture size |
| Clear recommended | Every 1000 requests for long sessions |

---

## Next Steps

- [Network Inspector](./network-inspector) — Deep dive into HTTP capture
- [WebSocket Capture](./websocket-capture) — Deep dive into WS frames
- [Cookie Inspector](./cookie-inspector) — Deep dive into cookies
- [One-Click Export](./export) — Deep dive into code generation

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
