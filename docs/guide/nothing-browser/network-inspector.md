# Network Inspector

The NETWORK sub-tab in DEVTOOLS captures every HTTP request and response automatically. No configuration. No filter needed upfront. Everything goes in.

---

## Overview

Unlike browser DevTools that you have to open at the right time, Nothing Browser captures **everything** from the first request.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NETWORK [247]                                                              │
├──────────┬────────┬──────────┬──────────┬──────────────────────────────────┤
│ Method   │ Status │ Type     │ Size     │ URL                              │
├──────────┼────────┼──────────┼──────────┼──────────────────────────────────┤
│ POST     │ 200    │ Fetch    │ 1.2 KB   │ https://api.example.com/v1/login │
│ GET      │ 304    │ Script   │ -        │ https://cdn.example.com/app.js   │
│ GET      │ 200    │ Image    │ 45 KB    │ https://cdn.example.com/logo.png │
│ GET      │ 404    │ XHR      │ 0 B      │ https://api.example.com/v1/missing│
│ WS       │ 101    │ WebSocket│ -        │ wss://socket.example.com         │
└──────────┴────────┴──────────┴──────────┴──────────────────────────────────┘
```

---

## What Gets Captured

| Field | Description | Example |
|-------|-------------|---------|
| **Method** | HTTP method | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |
| **Status code** | Response status | `200`, `304`, `404`, `500` |
| **Content type** | Response format | `application/json`, `text/html` |
| **Response size** | Size in bytes/KB | `1.2 KB`, `45 KB` |
| **Request headers** | All headers sent | `User-Agent`, `Authorization` |
| **Response headers** | All headers received | `Set-Cookie`, `Content-Type` |
| **Request body** | POST/PUT/PATCH body | JSON, form data, plain text |
| **Response body** | Full server response | JSON auto-formatted |
| **Timestamp** | Time of request | `14:30:25.123` |
| **Duration** | Time to complete | `234 ms` |

---

## How to Use It

### Step-by-Step

```
Step 1: Open Nothing Browser
              │
              ▼
Step 2: Go to BROWSER tab and navigate to any site
              │
              ▼
Step 3: Switch to DEVTOOLS → NETWORK
              │
              ▼
Step 4: All requests are already there (no need to pre-open)
```

### Detail Panel

Click any row to see the full detail in the right panel. Three sub-tabs:

| Sub-tab | Content |
| --- | --- |
| **Summary + Headers** | Firefox-style view with decoded query params, full URL, all headers |
| **Response** | The server response body — JSON formatted if applicable |
| **Raw** | Raw HTTP/1.1 representation |

### Summary + Headers View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Summary                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  URL: https://api.example.com/v1/users?page=2&limit=20                     │
│  Method: GET                                                                │
│  Status: 200 OK                                                             │
│  Type: application/json                                                     │
│  Size: 1.2 KB                                                               │
│  Duration: 234 ms                                                           │
│                                                                             │
│  Request Headers:                                                           │
│    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...               │
│    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...                           │
│    Accept: application/json                                                 │
│                                                                             │
│  Response Headers:                                                          │
│    Content-Type: application/json                                           │
│    Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure                 │
│    Cache-Control: no-cache                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Response View

```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "total": 2,
  "page": 1
}
```

### Raw View

```http
GET /v1/users?page=2&limit=20 HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure
Cache-Control: no-cache

{"users":[{"id":1,"name":"John Doe","email":"john@example.com"}],"total":2,"page":1}
```

---

## Filtering

### Filter Bar

Use the filter bar to search by URL:

| Filter | Example |
|--------|---------|
| Text search | `/api/v1` |
| Exact match | `"https://api.example.com/login"` |
| Wildcard | `*users*` |

### Type Dropdown

Filter by request type:

| Type | Description |
|------|-------------|
| **XHR** | XMLHttpRequest (AJAX calls) |
| **Fetch** | Fetch API calls |
| **WS** | WebSocket connections |
| **Script** | JavaScript files |
| **Doc** | HTML documents |
| **Img** | Images |
| **CSS** | Stylesheets |
| **Font** | Font files |

### Combined Filtering

Filter by type AND search:

```
Type: XHR + Search: /api/users → Shows only user API calls
```

---

## Export from Network Tab

Select any row and click:

| Button | Action | Output |
|--------|--------|--------|
| **COPY HEADERS** | Copies summary + headers | Plain text |
| **COPY RESPONSE** | Copies response body | Raw text |
| **AS CURL** | Generates cURL command | Terminal command |
| **AS PYTHON** | Generates Python script | `requests` code |
| **DOWNLOAD** | Saves full request+response | `.txt` file |

### What's Included in Exports

| Component | Included? |
|-----------|-----------|
| URL | ✅ Yes |
| Method | ✅ Yes |
| Request headers | ✅ Yes |
| Request body | ✅ Yes |
| Response headers | ✅ Yes |
| Response body | ✅ Yes |
| Cookies | ✅ Yes (from Cookie Inspector) |

**Cookies from the Cookie Inspector are automatically included in exports.**

---

## Capture Method

HTTP capture uses **two layers** to ensure complete capture:

### Layer 1: Network Layer (C++)

`QWebEngineUrlRequestInterceptor` captures every request at the network layer:

```cpp
void Interceptor::interceptRequest(QWebEngineUrlRequestInfo &info) {
    // Captures request URL, method, headers
    // Can inject headers before request is sent
    // Happens before any JavaScript runs
}
```

**Captures:** URL, method, headers, timing

### Layer 2: JavaScript Layer

JavaScript injection patches `fetch` and `XMLHttpRequest`:

```javascript
// Patched fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
    // Capture request body BEFORE it's sent
    const requestBody = args[1]?.body;
    
    return originalFetch.apply(this, args).then(response => {
        // Capture response body
        return response;
    });
};
```

**Captures:** Request body (POST data), response body

### Why Two Layers?

| Layer | Captures | Misses |
|-------|----------|--------|
| **Network layer only** | Headers, timing | Request body, response body |
| **JS layer only** | Body | Headers, timing |
| **Both layers** | Everything | — |

**This dual approach is why request bodies (POST data) are captured correctly — the JS layer sees the body before it's sent.**

---

## Real-World Use Cases

### 1. Debugging API Calls

```text
1. Perform action in browser
2. Check NETWORK tab
3. Find the API call
4. Check request/response
5. See exactly what went wrong
```

### 2. Reverse Engineering Authentication

```text
1. Log in to site
2. Find POST request to /login
3. Check request body (username, password)
4. Check response (token, cookies)
5. Replicate in your code
```

### 3. Finding Hidden Endpoints

```text
1. Browse the site
2. Watch NETWORK tab
3. Look for API calls to /internal, /admin, /v2
4. Discover undocumented endpoints
```

### 4. Performance Analysis

```text
1. Load a slow page
2. Check NETWORK tab
3. Sort by duration
4. Find slowest requests
5. Optimize or cache
```

---

## Request Types Explained

| Type | Description | Common Use |
|------|-------------|------------|
| **XHR** | XMLHttpRequest | Legacy AJAX calls |
| **Fetch** | Fetch API | Modern AJAX calls |
| **WS** | WebSocket | Real-time data |
| **Script** | JavaScript files | Page functionality |
| **Doc** | HTML documents | Page navigation |
| **Img** | Images | Visual content |
| **CSS** | Stylesheets | Page styling |
| **Font** | Font files | Typography |
| **Media** | Audio/Video | Multimedia |

---

## Column Sorting

Click column headers to sort:

| Column | Sort Behavior |
|--------|---------------|
| Method | Alphabetical |
| Status | Numerical |
| Type | Alphabetical |
| Size | Numerical |
| URL | Alphabetical |
| Duration | Numerical |

---

## Live Counter

The tab label shows the number of captured requests:

```
NETWORK [247]   ← 247 requests captured so far
```

This updates in real time as requests are captured.

---

## Performance Notes

| Metric | Value |
|--------|-------|
| Max requests | Unlimited (memory permitting) |
| Max response size | 10MB (configurable) |
| Capture overhead | Minimal |
| Memory usage | Increases with capture size |

**Tip:** Click CLEAR periodically for long sessions.

---

## Troubleshooting

### No Requests Captured

**Solutions:**
- Check you're on the NETWORK sub-tab
- Navigate to a page (capture starts automatically)
- Check DEVTOOLS is open

### Request Body Empty

**Solutions:**
- Request may have no body (GET requests)
- Body may be too large (>10MB)
- Body may be binary/streaming

### Response Body Empty

**Solutions:**
- Response may be empty (204 No Content)
- Response may be streaming
- Try DOWNLOAD to save raw response

### Export Missing Cookies

**Solution:** Ensure cookies are captured in COOKIES tab and domain matches request URL.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus filter bar |
| `Ctrl+Shift+F` | Clear filter |
| `Ctrl+C` | Copy selected request (headers + body) |
| `Delete` | Clear all captured requests |

---

## Next Steps

- [One-Click Export](./export) — Turn requests into code
- [Cookie Inspector](./cookie-inspector) — Track cookies from responses
- [WebSocket Capture](./websocket-capture) — Real-time traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
