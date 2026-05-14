# 📡 Events API — Real-Time Notifications

Subscribe to browser events in real-time. Get notified when pages navigate, dialogs appear, CAPTCHAs are detected, proxies rotate, and more.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

Piggy emits events from the browser to your Node.js code. Subscribe to any event using `piggy.onEvent()` or site-specific handlers.

| Event Type | Description | Use Case |
|------------|-------------|----------|
| `navigate` | Page navigation occurred | Track URL changes, log activity |
| `captcha` | CAPTCHA detected | Trigger resolution |
| `captcha:resolved` | CAPTCHA solved | Continue scraping |
| `blocked` | Bot block detected | Rotate proxy, retry |
| `dialog` | JavaScript dialog appeared | Auto-handle alerts |
| `exposed_call` | Exposed function called from browser | RPC handling |
| `proxy:changed` | Proxy rotated | Log IP changes |
| `proxy:loaded` | Proxies loaded from file | Confirm load |
| `proxy:alive` | Proxy health check passed | Monitor pool |
| `proxy:dead` | Proxy health check failed | Remove from pool |
| `proxy:check:started` | Health check started | Show progress |
| `proxy:check:done` | Health check finished | Log results |
| `proxy:exhausted` | No alive proxies | Alert, load more |
| `proxy:fetch:failed` | Proxy fetch failed | Retry or alert |
| `proxy:ovpn:loaded` | OpenVPN loaded | Confirm connection |

---

## Basic Usage

### Global Events

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Subscribe to navigate events for a specific tab
piggy.onEvent("navigate", "default", (url) => {
  console.log(`Navigated to: ${url}`);
});

// Subscribe to all navigate events (any tab)
piggy.onEvent("navigate", "*", (data) => {
  console.log(`Tab ${data.tabId} navigated to ${data.url}`);
});

await piggy.site.navigate();
// Output: Navigated to: https://example.com
```

### Site-Specific Events

```ts
// Subscribe to navigate events on a specific site
piggy.site.on("navigate", (url) => {
  console.log(`Site navigated to: ${url}`);
});
```

---

## Navigation Events

### `navigate`

Triggered when the page navigates to a new URL.

```ts
// Tab-specific
piggy.onEvent("navigate", "default", (url) => {
  console.log(`Tab default → ${url}`);
});

// Any tab (wildcard)
piggy.onEvent("navigate", "*", (data) => {
  console.log(`Tab ${data.tabId} → ${data.url}`);
});

// Site object
piggy.site.on("navigate", (url) => {
  console.log(`Site navigated: ${url}`);
});
```

---

## CAPTCHA & Block Events

### `captcha`

Triggered when a CAPTCHA is detected.

```ts
piggy.onEvent("captcha", "default", (data) => {
  console.log(`⚠️ CAPTCHA detected: ${data.captchaType}`);
  console.log(`Tab ID: ${data.tabId}`);
  
  // Trigger auto-resolution or notification
});
```

### `captcha:resolved`

Triggered when a CAPTCHA is successfully resolved.

```ts
piggy.onEvent("captcha:resolved", "default", (data) => {
  console.log(`✅ CAPTCHA resolved on tab ${data.tabId}`);
});
```

### `blocked`

Triggered when a bot block is detected (403, rate limit, etc.).

```ts
piggy.onEvent("blocked", "default", (data) => {
  console.log(`🚫 Block detected: ${data.blockType}`);
  
  // Auto-rotate proxy if available
  piggy.proxy.next();
});
```

---

## Dialog Events

### `dialog`

Triggered when a JavaScript dialog (alert, confirm, prompt) appears.

```ts
piggy.onEvent("dialog", "default", (data) => {
  console.log(`Dialog: ${data.dialogType}`);
  console.log(`Message: ${data.message}`);
  console.log(`Default value: ${data.defaultValue}`);
  
  // Auto-accept
  piggy.site.dialog.accept();
});
```

---

## Exposed Call Events

### `exposed_call`

Triggered when the browser calls an exposed function.

```ts
piggy.onEvent("exposed_call", "default", async (data) => {
  console.log(`Function called: ${data.name}`);
  console.log(`Call ID: ${data.callId}`);
  console.log(`Data: ${data.data}`);
  
  // Handle the call
  const result = await myHandler(JSON.parse(data.data));
  
  // Send result back
  await piggy.export.resolveExposed(data.callId, JSON.stringify(result));
});
```

---

## Proxy Events

### `proxy:changed`

Triggered when the active proxy rotates.

```ts
piggy.proxy.on("proxy:changed", (data) => {
  console.log(`Proxy changed → ${data.proxy}`);
  console.log(`Host: ${data.host}, Port: ${data.port}`);
  console.log(`Latency: ${data.latency}ms`);
});
```

### `proxy:loaded`

Triggered when proxies are loaded from file or URL.

```ts
piggy.proxy.on("proxy:loaded", (data) => {
  console.log(`Loaded ${data.count} proxies`);
});
```

### `proxy:fetch:failed`

Triggered when fetching proxies from a URL fails.

```ts
piggy.proxy.on("proxy:fetch:failed", (data) => {
  console.error(`Failed to fetch proxies: ${data.error}`);
});
```

### `proxy:check:started`

Triggered when health check begins.

```ts
piggy.proxy.on("proxy:check:started", (data) => {
  console.log(`Checking ${data.total} proxies...`);
});
```

### `proxy:alive`

Triggered when a proxy passes health check.

```ts
piggy.proxy.on("proxy:alive", (data) => {
  console.log(`✅ Proxy ${data.index} alive (${data.latency}ms)`);
});
```

### `proxy:dead`

Triggered when a proxy fails health check.

```ts
piggy.proxy.on("proxy:dead", (data) => {
  console.log(`❌ Proxy ${data.index} dead (${data.latency}ms)`);
});
```

### `proxy:check:done`

Triggered when health check completes.

```ts
piggy.proxy.on("proxy:check:done", (data) => {
  console.log(`Health check done: ${data.alive} alive, ${data.dead} dead`);
});
```

### `proxy:exhausted`

Triggered when no alive proxies remain.

```ts
piggy.proxy.on("proxy:exhausted", () => {
  console.error("No alive proxies remaining!");
  // Load more proxies or alert
  piggy.proxy.fetch("https://api.proxy-service.com/proxies.txt");
});
```

### `proxy:ovpn:loaded`

Triggered when OpenVPN configuration is loaded.

```ts
piggy.proxy.on("proxy:ovpn:loaded", (data) => {
  console.log(`VPN connected: ${data.remote}:${data.port}`);
});
```

---

## Unsubscribing

All event handlers return an unsubscribe function.

```ts
// Subscribe
const unsubscribe = piggy.onEvent("navigate", "default", (url) => {
  console.log(url);
});

// Later, unsubscribe
unsubscribe();

// Site events also return unsubscribe
const off = piggy.site.on("navigate", (url) => {
  console.log(url);
});

off(); // Stop listening
```

---

## Real-World Examples

### Example 1: Production Scraper with Full Event Handling

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

// Load proxies
await piggy.proxy.load("./proxies.txt");

// ── Proxy Events ──────────────────────────────────────────
piggy.proxy.on("proxy:changed", (data) => {
  console.log(`🔄 Using proxy: ${data.proxy}`);
});

piggy.proxy.on("proxy:exhausted", async () => {
  console.error("⚠️ No proxies left! Fetching new list...");
  await piggy.proxy.fetch("https://api.proxy-service.com/proxies.txt");
  await piggy.proxy.test();
});

// ── CAPTCHA Events ────────────────────────────────────────
piggy.onEvent("captcha", "default", async (data) => {
  console.log(`🤖 CAPTCHA detected: ${data.captchaType}`);
  console.log("Rotating proxy...");
  await piggy.proxy.next();
  await piggy.site.reload();
});

piggy.onEvent("captcha:resolved", "default", (data) => {
  console.log(`✅ CAPTCHA resolved on tab ${data.tabId}`);
});

// ── Block Events ──────────────────────────────────────────
piggy.onEvent("blocked", "default", async (data) => {
  console.log(`🚫 Blocked: ${data.blockType}`);
  await piggy.proxy.next();
  await piggy.site.reload();
});

// ── Navigation Events ─────────────────────────────────────
piggy.onEvent("navigate", "*", (data) => {
  console.log(`📍 Navigated: ${data.url}`);
});

// ── Dialog Events ─────────────────────────────────────────
piggy.onEvent("dialog", "default", async (data) => {
  console.log(`💬 Dialog: ${data.dialogType} - ${data.message}`);
  await piggy.site.dialog.accept();
});

const { amazon } = usePiggy<"amazon">();

await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  await amazon.navigate(`https://www.amazon.com/s?k=${term}`);
  await amazon.wait.selector({ selector: "[data-asin]", state: "attached" });
  
  const products = await amazon.provide.attrAll({ 
    selector: "[data-asin]", 
    attr: "data-asin" 
  });
  
  return { term, count: products.length };
});

await piggy.serve(3000);
console.log("API server running with full event monitoring");
```

### Example 2: Log All Events to File

```ts
import { createWriteStream } from "fs";

const logStream = createWriteStream("./events.log", { flags: "a" });

function logEvent(event: string, data: any) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data
  };
  logStream.write(JSON.stringify(entry) + "\n");
}

// Log all navigate events
piggy.onEvent("navigate", "*", (data) => {
  logEvent("navigate", data);
});

// Log all proxy events
piggy.proxy.on("proxy:changed", (data) => {
  logEvent("proxy:changed", data);
});

piggy.proxy.on("proxy:alive", (data) => {
  logEvent("proxy:alive", data);
});

piggy.proxy.on("proxy:dead", (data) => {
  logEvent("proxy:dead", data);
});

// Log CAPTCHA events
piggy.onEvent("captcha", "*", (data) => {
  logEvent("captcha", data);
});

console.log("Event logging active → events.log");
```

### Example 3: Health Dashboard with Events

```ts
const stats = {
  navigations: 0,
  captchas: 0,
  blocks: 0,
  proxyChanges: 0,
  aliveProxies: 0,
  deadProxies: 0
};

// Track navigations
piggy.onEvent("navigate", "*", () => {
  stats.navigations++;
  updateDashboard();
});

// Track CAPTCHAs
piggy.onEvent("captcha", "*", () => {
  stats.captchas++;
  updateDashboard();
});

// Track blocks
piggy.onEvent("blocked", "*", () => {
  stats.blocks++;
  updateDashboard();
});

// Track proxy changes
piggy.proxy.on("proxy:changed", () => {
  stats.proxyChanges++;
  updateDashboard();
});

// Track proxy health
piggy.proxy.on("proxy:alive", () => {
  stats.aliveProxies++;
  updateDashboard();
});

piggy.proxy.on("proxy:dead", () => {
  stats.deadProxies++;
  updateDashboard();
});

function updateDashboard() {
  console.clear();
  console.log("=== Scraper Health Dashboard ===");
  console.log(`Navigations: ${stats.navigations}`);
  console.log(`CAPTCHAs: ${stats.captchas}`);
  console.log(`Blocks: ${stats.blocks}`);
  console.log(`Proxy changes: ${stats.proxyChanges}`);
  console.log(`Alive proxies: ${stats.aliveProxies}`);
  console.log(`Dead proxies: ${stats.deadProxies}`);
}

// Update every second
setInterval(updateDashboard, 1000);
```

### Example 4: Auto-Retry on Block with Event

```ts
let retryCount = 0;
const MAX_RETRIES = 3;

piggy.onEvent("blocked", "default", async (data) => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Block detected, retry ${retryCount}/${MAX_RETRIES}`);
    
    // Rotate proxy
    await piggy.proxy.next();
    
    // Reload page
    await piggy.site.reload();
    await piggy.site.wait.selector({ selector: ".content", state: "visible" });
  } else {
    console.error("Max retries exceeded, stopping...");
    await piggy.close();
  }
});

piggy.onEvent("captcha:resolved", "default", () => {
  retryCount = 0;  // Reset counter on success
  console.log("CAPTCHA resolved, retry counter reset");
});
```

### Example 5: Real-Time Proxy Monitor

```ts
console.log("Proxy Monitor Started");

piggy.proxy.on("proxy:check:started", (data) => {
  console.log(`\n🔍 Checking ${data.total} proxies...`);
});

piggy.proxy.on("proxy:alive", (data) => {
  console.log(`  ✅ ${data.latency}ms - Proxy ${data.index}`);
});

piggy.proxy.on("proxy:dead", (data) => {
  console.log(`  ❌ ${data.latency}ms - Proxy ${data.index}`);
});

piggy.proxy.on("proxy:check:done", (data) => {
  console.log(`\n📊 Done: ${data.alive} alive, ${data.dead} dead`);
  
  if (data.alive === 0) {
    console.log("⚠️ WARNING: No alive proxies!");
  }
});

piggy.proxy.on("proxy:changed", (data) => {
  console.log(`\n🔄 Active proxy: ${data.proxy} (${data.latency}ms)`);
});

// Start health check
await piggy.proxy.test();
```

---

## API Reference

### Global Event Subscription

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `piggy.onEvent(eventName, tabId, handler)` | `eventName: string, tabId: string \| "*", handler: Function` | `() => void` | Subscribe to event |

### Site Event Subscription

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `site.on(eventName, handler)` | `eventName: "navigate", handler: (url: string) => void` | `() => void` | Subscribe to site event |

### Proxy Event Subscription

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `piggy.proxy.on(eventName, handler)` | `eventName: string, handler: Function` | `() => void` | Subscribe to proxy event |

---

## Event Reference

| Event | Data | Source |
|-------|------|--------|
| `navigate` | `{ url, tabId }` | Global / Site |
| `captcha` | `{ tabId, captchaType }` | Global |
| `captcha:resolved` | `{ tabId }` | Global |
| `blocked` | `{ tabId, blockType }` | Global |
| `dialog` | `{ tabId, dialogType, message, defaultValue }` | Global |
| `exposed_call` | `{ tabId, name, callId, data }` | Global |
| `proxy:changed` | `{ proxy, host, port, latency }` | Proxy |
| `proxy:loaded` | `{ count }` | Proxy |
| `proxy:fetch:failed` | `{ error }` | Proxy |
| `proxy:check:started` | `{ total }` | Proxy |
| `proxy:alive` | `{ index, latency }` | Proxy |
| `proxy:dead` | `{ index, latency }` | Proxy |
| `proxy:check:done` | `{ alive, dead }` | Proxy |
| `proxy:exhausted` | `{}` | Proxy |
| `proxy:ovpn:loaded` | `{ remote, port }` | Proxy |

---

## Type Definitions

```ts
interface NavigateEventData {
  tabId: string;
  url: string;
}

interface CaptchaEventData {
  tabId: string;
  captchaType: string;
}

interface BlockEventData {
  tabId: string;
  blockType: string;
}

interface DialogEventData {
  tabId: string;
  dialogType: "alert" | "confirm" | "prompt";
  message: string;
  defaultValue: string;
}

interface ExposedCallEventData {
  tabId: string;
  name: string;
  callId: string;
  data: string;
}

interface ProxyChangedEventData {
  proxy: string;
  host: string;
  port: number;
  latency: number;
}

interface ProxyLoadedEventData {
  count: number;
}

interface ProxyCheckEventData {
  total: number;
  alive: number;
  dead: number;
}

interface ProxyAliveDeadEventData {
  index: number;
  latency: number;
}
```

---

## Next Steps

- [Proxy API](./proxy) — Proxy pool management
- [Captcha API](./captcha) — CAPTCHA detection and resolution
- [Dialog API](./dialog) — Dialog handling

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*