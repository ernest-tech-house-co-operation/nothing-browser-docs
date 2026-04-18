# 🕸️ Network Capture

Capture HTTP requests, WebSocket frames, cookies, and storage in real time. Perfect for debugging, analyzing API calls, and understanding how web apps work.

---

## Overview

Network capture runs in the background and records everything automatically. You can start/stop capture at any time and retrieve the captured data.

| Capture Type | What It Records |
|--------------|-----------------|
| **Requests** | HTTP method, URL, status, headers, body |
| **WebSocket** | Frames, direction (sent/received), data |
| **Cookies** | Name, value, domain, path, flags |
| **Storage** | localStorage and sessionStorage writes |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://books.toscrape.com");

// Start capturing
await piggy.site.capture.start();

// Navigate and interact
await piggy.site.navigate();
await piggy.site.click(".product_pod h3 a");

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

## Capture HTTP Requests

```ts
await piggy.site.capture.start();
await piggy.site.navigate("https://api.example.com/data");
await piggy.site.capture.stop();

const requests = await piggy.site.capture.requests();

// Analyze each request
for (const req of requests) {
  console.log(`${req.method} ${req.url} - ${req.status}`);
  console.log("  Headers:", req.requestHeaders);
  console.log("  Response headers:", req.responseHeaders);
  
  if (req.requestBody) {
    console.log("  Request body:", req.requestBody);
  }
  
  if (req.responseBody) {
    console.log("  Response body:", req.responseBody);
  }
}
```

### Request Object Structure

```ts
interface CapturedRequest {
  id: string;
  method: string;           // GET, POST, PUT, etc.
  url: string;
  status: number;           // 200, 404, 500, etc.
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  timestamp: number;        // Unix timestamp in ms
  duration: number;         // Request duration in ms
}
```

---

## Capture WebSocket Frames

```ts
await piggy.site.capture.start();

// Navigate to a site with WebSockets
await piggy.site.navigate("https://www.piesocket.com/websocket-tester");
await piggy.site.wait(3000); // Wait for WS connection

await piggy.site.capture.stop();

const frames = await piggy.site.capture.ws();

for (const frame of frames) {
  console.log(`${frame.direction} ${frame.type}`);
  console.log("  Data:", frame.data);
  console.log("  Timestamp:", new Date(frame.timestamp).toISOString());
}
```

### WebSocket Frame Object Structure

```ts
interface CapturedWebSocketFrame {
  id: string;
  direction: "sent" | "received";  // UP SENT or DN RECV
  type: "text" | "binary" | "open" | "close";
  data: string;                     // For text: the message, For binary: base64
  timestamp: number;
  size: number;                     // Size in bytes
}
```

---

## Capture Cookies

```ts
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com/login");
await piggy.site.type("#email", "user@example.com");
await piggy.site.type("#password", "password");
await piggy.site.click("#submit");
await piggy.site.capture.stop();

const cookies = await piggy.site.capture.cookies();

for (const cookie of cookies) {
  console.log(`${cookie.name}=${cookie.value}`);
  console.log(`  Domain: ${cookie.domain}, Path: ${cookie.path}`);
  console.log(`  HttpOnly: ${cookie.httpOnly}, Secure: ${cookie.secure}`);
}
```

### Cookie Object Structure

```ts
interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;         // Unix timestamp
  session: boolean;         // True if session cookie
  setByRequest: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
}
```

---

## Capture Storage (localStorage/sessionStorage)

```ts
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.capture.stop();

const storage = await piggy.site.capture.storage();

// localStorage entries
for (const item of storage.localStorage) {
  console.log(`localStorage[${item.key}] = ${item.value}`);
}

// sessionStorage entries
for (const item of storage.sessionStorage) {
  console.log(`sessionStorage[${item.key}] = ${item.value}`);
}
```

### Storage Object Structure

```ts
interface CapturedStorage {
  localStorage: Array<{
    key: string;
    value: string;
    timestamp: number;
  }>;
  sessionStorage: Array<{
    key: string;
    value: string;
    timestamp: number;
  }>;
}
```

---

## Real-World Examples

### 1. Capture API Authentication Flow

```ts
await piggy.register("app", "https://example.com");

await piggy.app.capture.start();

// Login flow
await piggy.app.navigate("https://example.com/login");
await piggy.app.type("#email", "user@example.com");
await piggy.app.type("#password", "password123");
await piggy.app.click("#login-btn");
await piggy.app.waitForNavigation();

// Extract auth token from captured requests
await piggy.app.capture.stop();

const requests = await piggy.app.capture.requests();

// Find the login request
const loginRequest = requests.find(req => 
  req.url.includes("/api/login") && req.method === "POST"
);

if (loginRequest?.responseBody) {
  const response = JSON.parse(loginRequest.responseBody);
  console.log("Auth token:", response.token);
  console.log("User ID:", response.userId);
}

// Find all API calls after login
const apiCalls = requests.filter(req => 
  req.url.includes("/api/") && req.timestamp > loginRequest.timestamp
);

console.log(`Found ${apiCalls.length} API calls after login`);
```

### 2. Export Requests to HAR Format

```ts
async function exportToHAR(site: any) {
  const requests = await site.capture.requests();
  
  const har = {
    log: {
      version: "1.2",
      creator: { name: "Nothing Browser", version: "1.0" },
      entries: requests.map(req => ({
        request: {
          method: req.method,
          url: req.url,
          headers: Object.entries(req.requestHeaders).map(([name, value]) => ({ name, value })),
          bodySize: req.requestBody?.length || 0
        },
        response: {
          status: req.status,
          headers: Object.entries(req.responseHeaders).map(([name, value]) => ({ name, value })),
          bodySize: req.responseBody?.length || 0,
          content: { text: req.responseBody }
        },
        timings: { wait: req.duration },
        time: req.duration,
        startedDateTime: new Date(req.timestamp).toISOString()
      }))
    }
  };
  
  return har;
}

const har = await exportToHAR(piggy.site);
console.log(JSON.stringify(har, null, 2));
```

### 3. Monitor WebSocket Live Trading Data

```ts
await piggy.register("trading", "https://tradingview.com");

// Start capture before navigation
await piggy.trading.capture.start();
await piggy.trading.navigate();
await piggy.trading.wait(10000); // Let WebSocket collect data
await piggy.trading.capture.stop();

const frames = await piggy.trading.capture.ws();

// Filter trading messages
const trades = frames.filter(f => 
  f.type === "text" && f.data.includes("trade")
);

for (const trade of trades) {
  const data = JSON.parse(trade.data);
  console.log(`${trade.direction}: ${data.symbol} @ $${data.price}`);
}
```

### 4. Debug Request-Response Mismatch

```ts
await piggy.site.capture.start();
await piggy.site.click("#submit-form");
await piggy.site.waitForResponse("*/api/submit*");
await piggy.site.capture.stop();

const requests = await piggy.site.capture.requests();
const submitRequest = requests.find(r => r.url.includes("/api/submit"));

if (submitRequest) {
  console.log("Sent:", submitRequest.requestBody);
  console.log("Received:", submitRequest.responseBody);
  console.log("Status:", submitRequest.status);
  
  if (submitRequest.status !== 200) {
    console.error("Request failed!");
    console.log("Request headers:", submitRequest.requestHeaders);
    console.log("Response headers:", submitRequest.responseHeaders);
  }
}
```

### 5. Capture Session Setup

```ts
async function captureSessionSetup(site: any, loginUrl: string, credentials: any) {
  await site.capture.start();
  
  // Navigate to login
  await site.navigate(loginUrl);
  
  // Fill and submit
  await site.type("#username", credentials.username);
  await site.type("#password", credentials.password);
  await site.click("#login-btn");
  await site.waitForNavigation();
  
  // Navigate to dashboard
  await site.navigate("https://example.com/dashboard");
  await site.waitForSelector(".dashboard-content");
  
  await site.capture.stop();
  
  // Extract all session data
  const session = {
    requests: await site.capture.requests(),
    cookies: await site.capture.cookies(),
    storage: await site.capture.storage()
  };
  
  // Save for later use
  await site.session.import({
    cookies: session.cookies,
    storage: session.storage
  });
  
  return session;
}

const session = await captureSessionSetup(piggy.site, "https://example.com/login", {
  username: "user@example.com",
  password: "password123"
});

console.log(`Captured ${session.requests.length} requests during setup`);
console.log(`Saved ${session.cookies.length} cookies`);
```

---

## Clear Captured Data

```ts
// Clear all captured data for this site
await piggy.site.capture.clear();

// Start fresh capture
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.capture.stop();

const requests = await piggy.site.capture.requests(); // Only new requests
```

---

## Performance Considerations

```ts
// ❌ Bad: Capturing for too long
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.wait(60000); // 1 minute - memory usage grows
await piggy.site.capture.stop();

// ✅ Good: Capture only what you need
await piggy.site.capture.start();
await piggy.site.navigate("https://example.com");
await piggy.site.click("#target-action");
await piggy.site.waitForResponse("*/api/target*");
await piggy.site.capture.stop(); // Stop immediately after

// Clear between operations
await piggy.site.capture.start();
// ... operation 1 ...
await piggy.site.capture.stop();
const data1 = await piggy.site.capture.requests();

await piggy.site.capture.clear(); // Free memory
await piggy.site.capture.start();
// ... operation 2 ...
await piggy.site.capture.stop();
const data2 = await piggy.site.capture.requests();
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `capture.start()` | Start capturing network traffic |
| `capture.stop()` | Stop capturing |
| `capture.clear()` | Clear all captured data |
| `capture.requests()` | Get captured HTTP requests |
| `capture.ws()` | Get captured WebSocket frames |
| `capture.cookies()` | Get captured cookies |
| `capture.storage()` | Get localStorage/sessionStorage |

---

## Next Steps

- [Session Persistence](./session) — Save and restore sessions
- [Cookie Management](./cookies) — Manage cookies directly
- [Request Interception](./interception) — Modify requests on the fly

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
