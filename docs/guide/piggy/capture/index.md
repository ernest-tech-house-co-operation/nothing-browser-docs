# 🕸️ Capture API — Network Traffic Recording

Capture HTTP requests, WebSocket frames, cookies, and storage in real time. Perfect for debugging, API reverse engineering, and understanding how web applications work.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

Network capture runs in the background and records everything automatically. Start capture, navigate, stop capture, and retrieve the data.

| Capture Type | Method | What It Records |
|--------------|--------|-----------------|
| **Requests** | `capture.requests()` | HTTP method, URL, status, headers, bodies |
| **WebSocket** | `capture.ws()` | Frames, direction (sent/received), data |
| **Cookies** | `capture.cookies()` | Name, value, domain, path, flags |
| **Storage** | `capture.storage()` | localStorage and sessionStorage writes |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Start capturing
await piggy.site.capture.start();

// Navigate and interact
await piggy.site.navigate();
await piggy.site.click("#load-data");

// Stop capturing
await piggy.site.capture.stop();

// Get captured data
const requests = await piggy.site.capture.requests();
const websockets = await piggy.site.capture.ws();
const cookies = await piggy.site.capture.cookies();
const storage = await piggy.site.capture.storage();

console.log(`Captured ${requests.length} requests`);
console.log(`Captured ${websockets.length} WebSocket frames`);
console.log(`Captured ${cookies.length} cookies`);
```

---

## Capture Lifecycle

### `capture.start()`
Starts recording network traffic. Buffers are cleared automatically.

```ts
await piggy.site.capture.start();
```

### `capture.stop()`
Stops recording. Data remains available for retrieval.

```ts
await piggy.site.capture.stop();
```

### `capture.clear()`
Clears all captured data from memory.

```ts
await piggy.site.capture.clear();
```

---

## HTTP Requests

### `capture.requests()`

Returns all captured HTTP requests with full details.

```ts
const requests = await piggy.site.capture.requests();

for (const req of requests) {
  console.log(`${req.method} ${req.url} — ${req.status}`);
  console.log("  Request headers:", req.reqHeaders);
  console.log("  Response headers:", req.resHeaders);
  if (req.reqBody) console.log("  Request body:", req.reqBody);
  if (req.resBody) console.log("  Response body:", req.resBody);
}
```

### CapturedRequest Object

```ts
interface CapturedRequest {
  method: string;      // GET, POST, PUT, DELETE
  url: string;         // Full request URL
  status: string;      // HTTP status code (e.g., "200")
  type: string;        // Resource type (document, xhr, fetch, etc.)
  mime: string;        // Content type (text/html, application/json)
  reqHeaders: string;  // Request headers as string
  reqBody: string;     // Request body (if any)
  resHeaders: string;  // Response headers as string
  resBody: string;     // Response body (if any)
  size: number;        // Response size in bytes
  timestamp: string;   // ISO timestamp
}
```

---

## WebSocket Frames

### `capture.ws()`

Returns all captured WebSocket frames.

```ts
const frames = await piggy.site.capture.ws();

for (const frame of frames) {
  console.log(`${frame.direction} ${frame.direction === "sent" ? "→" : "←"} ${frame.data}`);
  console.log(`  URL: ${frame.url}`);
  console.log(`  Binary: ${frame.binary}`);
}
```

### WebSocketFrame Object

```ts
interface WebSocketFrame {
  connectionId: string;   // Unique connection identifier
  url: string;            // WebSocket endpoint URL
  direction: "sent" | "received";  // Which direction
  data: string;           // Frame payload (text or base64)
  binary: boolean;        // Whether data is binary
  timestamp: string;      // ISO timestamp
}
```

---

## Cookies

### `capture.cookies()`

Returns all cookies captured during the session.

```ts
const cookies = await piggy.site.capture.cookies();

for (const cookie of cookies) {
  console.log(`${cookie.name}=${cookie.value}`);
  console.log(`  Domain: ${cookie.domain}, Path: ${cookie.path}`);
  console.log(`  HttpOnly: ${cookie.httpOnly}, Secure: ${cookie.secure}`);
  console.log(`  Expires: ${cookie.expires || "Session"}`);
}
```

### CapturedCookie Object

```ts
interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  expires: string;      // ISO timestamp or empty string for session
}
```

---

## Storage

### `capture.storage()`

Returns localStorage and sessionStorage entries as a flat array.

```ts
const storage = await piggy.site.capture.storage();

for (const entry of storage) {
  console.log(`${entry.key} = ${entry.value}`);
}

// Filter localStorage entries
const localStorageEntries = storage.filter(e => e.key.startsWith("localStorage:"));
```

### StorageEntry Object

```ts
interface StorageEntry {
  key: string;    // Storage key (prefixed with localStorage: or sessionStorage:)
  value: string;  // Storage value
}
```

Key format: `localStorage:https://example.com:keyName` or `sessionStorage:https://example.com:keyName`

---

## Real-World Examples

### Example 1: Capture API Authentication Flow

```ts
await piggy.site.capture.start();

// Login
await piggy.site.navigate("https://example.com/login");
await piggy.site.type("#email", "user@example.com");
await piggy.site.type("#password", "password123");
await piggy.site.click("#login-btn");
await piggy.site.waitForNavigation();

// Navigate to dashboard
await piggy.site.navigate("https://example.com/dashboard");

await piggy.site.capture.stop();

// Find the login request
const requests = await piggy.site.capture.requests();
const loginRequest = requests.find(r => r.url.includes("/api/login") && r.method === "POST");

if (loginRequest?.resBody) {
  const response = JSON.parse(loginRequest.resBody);
  console.log("Auth token:", response.token);
  console.log("User ID:", response.userId);
}

// Find all API calls after login
const apiCalls = requests.filter(r => 
  r.url.includes("/api/") && r.type === "fetch"
);
console.log(`Found ${apiCalls.length} API calls`);
```

### Example 2: Monitor WebSocket Messages

```ts
await piggy.site.capture.start();

await piggy.site.navigate("https://tradingview.com");
await piggy.site.wait(10000); // Let WebSocket collect data

await piggy.site.capture.stop();

const frames = await piggy.site.capture.ws();

// Filter trade messages
const trades = frames.filter(f => 
  f.type === "text" && f.data.includes("trade")
);

for (const trade of trades) {
  console.log(`${trade.direction}: ${trade.data}`);
}
```

### Example 3: Debug Request-Response Mismatch

```ts
await piggy.site.capture.start();

await piggy.site.click("#submit-form");
await piggy.site.waitForResponse("*/api/submit*");

await piggy.site.capture.stop();

const requests = await piggy.site.capture.requests();
const submitRequest = requests.find(r => r.url.includes("/api/submit"));

if (submitRequest) {
  console.log("Sent:", submitRequest.reqBody);
  console.log("Received:", submitRequest.resBody);
  console.log("Status:", submitRequest.status);
  
  if (submitRequest.status !== "200") {
    console.error("Request failed!");
    console.log("Request headers:", submitRequest.reqHeaders);
    console.log("Response headers:", submitRequest.resHeaders);
  }
}
```

### Example 4: Extract Session Setup

```ts
async function captureSessionSetup(site: any, loginUrl: string, credentials: any) {
  await site.capture.start();
  
  await site.navigate(loginUrl);
  await site.type("#username", credentials.username);
  await site.type("#password", credentials.password);
  await site.click("#login-btn");
  await site.waitForNavigation();
  
  await site.navigate("https://example.com/dashboard");
  await site.wait.selector({ selector: ".dashboard", state: "visible" });
  
  await site.capture.stop();
  
  const session = {
    requests: await site.capture.requests(),
    cookies: await site.capture.cookies(),
    storage: await site.capture.storage()
  };
  
  return session;
}

const session = await captureSessionSetup(piggy.site, "https://example.com/login", {
  username: "user@example.com",
  password: "password123"
});

console.log(`Captured ${session.requests.length} requests`);
console.log(`Saved ${session.cookies.length} cookies`);
```

### Example 5: Export to HAR Format

```ts
async function exportToHAR(site: any): Promise<object> {
  const requests = await site.capture.requests();
  
  return {
    log: {
      version: "1.2",
      creator: { name: "Piggy", version: "1.0" },
      entries: requests.map(req => ({
        request: {
          method: req.method,
          url: req.url,
          headers: parseHeaders(req.reqHeaders),
          bodySize: req.reqBody?.length || 0
        },
        response: {
          status: parseInt(req.status),
          headers: parseHeaders(req.resHeaders),
          bodySize: req.resBody?.length || 0,
          content: { text: req.resBody }
        },
        timings: { wait: 0 },
        time: 0,
        startedDateTime: req.timestamp
      }))
    }
  };
}

function parseHeaders(headerString: string): Array<{ name: string; value: string }> {
  const lines = headerString.split("\n");
  const headers = [];
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      headers.push({
        name: line.substring(0, colonIndex).trim(),
        value: line.substring(colonIndex + 1).trim()
      });
    }
  }
  return headers;
}

const har = await exportToHAR(piggy.site);
console.log(JSON.stringify(har, null, 2));
```

### Example 6: Capture and Save to File

```ts
import { writeFileSync } from "fs";

await piggy.site.capture.start();
await piggy.site.navigate("https://example.com/api/data");
await piggy.site.capture.stop();

const requests = await piggy.site.capture.requests();
const apiCalls = requests.filter(r => r.url.includes("/api/"));

writeFileSync("./api-calls.json", JSON.stringify(apiCalls, null, 2));
console.log(`Saved ${apiCalls.length} API calls to api-calls.json`);
```

---

## Performance Considerations

```ts
// ❌ Bad: Capturing for too long
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.wait(60000);  // 1 minute — memory grows
await piggy.site.capture.stop();

// ✅ Good: Capture only what you need
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.click("#target-action");
await piggy.site.waitForResponse("*/api/target*");
await piggy.site.capture.stop();  // Stop immediately after

// Clear between operations to free memory
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com/page1");
await piggy.site.capture.stop();
const data1 = await piggy.site.capture.requests();

await piggy.site.capture.clear();  // Free memory

await piggy.site.capture.start();
await piggy.site.navigate("https://example.com/page2");
await piggy.site.capture.stop();
const data2 = await piggy.site.capture.requests();
```

---

## Complete Example: API Reverse Engineering

```ts
import piggy, { usePiggy } from "nothing-browser";
import { writeFileSync } from "fs";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("app", "https://example.com");

const { app } = usePiggy<"app">();

// Start capture before navigation
await app.capture.start();

// Navigate and trigger API calls
await app.navigate();
await app.click("#load-products");
await app.wait.selector({ selector: ".product-list", state: "visible" });
await app.click("#load-more");
await app.wait.selector({ selector: ".product-card:last-child", state: "attached" });

// Stop capture
await app.capture.stop();

// Analyze captured requests
const requests = await app.capture.requests();

// Find all XHR/fetch requests
const apiCalls = requests.filter(r => r.type === "fetch" || r.type === "xhr");

console.log(`Found ${apiCalls.length} API calls`);

for (const call of apiCalls) {
  console.log(`\n${call.method} ${call.url}`);
  console.log(`  Status: ${call.status}`);
  console.log(`  Request: ${call.reqBody}`);
  console.log(`  Response: ${call.resBody?.slice(0, 200)}...`);
}

// Save to file for analysis
writeFileSync("./captured-api.json", JSON.stringify(apiCalls, null, 2));

// Check for WebSocket connections
const wsFrames = await app.capture.ws();
if (wsFrames.length > 0) {
  console.log(`\nWebSocket frames: ${wsFrames.length}`);
  writeFileSync("./websocket-frames.json", JSON.stringify(wsFrames, null, 2));
}

await piggy.close();
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `capture.start()` | — | `Promise<void>` | Start recording |
| `capture.stop()` | — | `Promise<void>` | Stop recording |
| `capture.clear()` | — | `Promise<void>` | Clear captured data |
| `capture.requests()` | — | `Promise<CapturedRequest[]>` | Get HTTP requests |
| `capture.ws()` | — | `Promise<WebSocketFrame[]>` | Get WebSocket frames |
| `capture.cookies()` | — | `Promise<CapturedCookie[]>` | Get captured cookies |
| `capture.storage()` | — | `Promise<StorageEntry[]>` | Get storage entries |

---

## Type Definitions

```ts
interface CapturedRequest {
  method: string;
  url: string;
  status: string;
  type: string;
  mime: string;
  reqHeaders: string;
  reqBody: string;
  resHeaders: string;
  resBody: string;
  size: number;
  timestamp: string;
}

interface WebSocketFrame {
  connectionId: string;
  url: string;
  direction: "sent" | "received";
  data: string;
  binary: boolean;
  timestamp: string;
}

interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  expires: string;
}

interface StorageEntry {
  key: string;
  value: string;
}
```

---

## Next Steps

- [Intercept API](./intercept) — Block, redirect, mock requests
- [Cookies API](./cookies) — Manage cookies directly
- [Proxy API](./proxy) — Route traffic through proxies

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*