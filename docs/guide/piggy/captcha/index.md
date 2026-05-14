# 🤖 Captcha & Block API — Anti-Bot Detection & Resolution

Detect CAPTCHAs and bot blocks, pause for manual resolution, auto-retry with proxy rotation, and get notified when detection occurs. Built for production scraping where anti-bot systems are present.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Captcha & Block API helps you detect and handle anti-bot measures:

| Feature | Method | Description |
|---------|--------|-------------|
| **Detect CAPTCHA** | `captcha.status()` | Check if CAPTCHA is present |
| **Detect block** | `captcha.blockStatus()` | Check if request was blocked |
| **Manual resolution** | `captcha.pause()` / `captcha.check()` | Pause for manual solve |
| **Auto-retry** | `captcha.setAutoRetry()` | Auto-retry with proxy rotation |
| **Events** | `captcha.onCaptcha()` / `captcha.onBlocked()` | Real-time notifications |
| **Wait** | `captcha.waitForResolution()` | Wait for manual solve |

---

## CAPTCHA Detection

### `captcha.status()`

Returns current CAPTCHA detection status.

```ts
const status = await piggy.site.captcha.status();
// Returns: { detected: true, paused: false, type: "cloudflare" }
```

### Captcha Types

| Type | Description |
|------|-------------|
| `"cloudflare"` | Cloudflare Challenge Page |
| `"recaptcha"` | Google reCAPTCHA (v2 or v3) |
| `"hcaptcha"` | hCaptcha |
| `"turnstile"` | Cloudflare Turnstile |
| `"generic"` | Other CAPTCHA type |

---

## Block Detection

### `captcha.blockStatus()`

Returns detection status for bot blocks.

```ts
const block = await piggy.site.captcha.blockStatus();
// Returns: { detected: true, type: "403" }
```

### Block Types

| Type | Description |
|------|-------------|
| `"403"` | HTTP 403 Forbidden |
| `"429"` | Rate limit exceeded |
| `"access-denied"` | Access denied page |
| `"firewall"` | Firewall block |
| `"rate-limit"` | Rate limiting |

---

## Manual Resolution

### `captcha.pause()`

Pauses the current tab's execution until manually resumed. Use this when you want to solve a CAPTCHA manually in the browser window.

```ts
// Detect CAPTCHA
const status = await piggy.site.captcha.status();

if (status.detected) {
  console.log("CAPTCHA detected! Pausing for manual solve...");
  
  // Pause execution — browser window stays open
  await piggy.site.captcha.pause();
  
  // User solves CAPTCHA manually in the browser
  // Then you can check if it was solved
  await piggy.site.captcha.check();
}
```

### `captcha.check()`

Verifies if a CAPTCHA has been resolved.

```ts
// After manual solve, check if resolved
const resolved = await piggy.site.captcha.check();

if (resolved) {
  console.log("CAPTCHA solved! Continuing...");
} else {
  console.log("CAPTCHA still present, waiting...");
}
```

---

## Auto-Retry

### `captcha.setAutoRetry(enabled)`

Enables automatic retry with proxy rotation when CAPTCHA or block is detected.

```ts
// Enable auto-retry
await piggy.site.captcha.setAutoRetry(true);

// Now when CAPTCHA or block is detected:
// 1. Rotates to next proxy
// 2. Reloads the page
// 3. Retries the operation

// Disable auto-retry
await piggy.site.captcha.setAutoRetry(false);
```

### `captcha.blockRetry()`

Manually retry after a block (rotates proxy and reloads).

```ts
const block = await piggy.site.captcha.blockStatus();

if (block.detected) {
  console.log("Block detected, retrying with next proxy...");
  await piggy.site.captcha.blockRetry();
  // Continue with retried operation
}
```

### `captcha.resolve()`

Attempts to resolve a CAPTCHA using built-in methods (if available).

```ts
await piggy.site.captcha.resolve();
```

---

## Waiting for Resolution

### `captcha.waitForResolution(timeout?)`

Waits for CAPTCHA to be resolved (either automatically or manually).

```ts
// Wait up to 60 seconds for CAPTCHA resolution
await piggy.site.captcha.waitForResolution(60000);
console.log("CAPTCHA resolved or timed out");
```

---

## Events

### `captcha.onCaptcha(tabId, handler)`

Triggered when a CAPTCHA is detected.

```ts
piggy.captcha.onCaptcha("default", (data) => {
  console.log(`CAPTCHA detected! Type: ${data.captchaType}`);
  console.log(`Tab ID: ${data.tabId}`);
  // Send notification, pause, etc.
});
```

### `captcha.onCaptchaResolved(tabId, handler)`

Triggered when a CAPTCHA is resolved.

```ts
piggy.captcha.onCaptchaResolved("default", (data) => {
  console.log(`CAPTCHA resolved on tab ${data.tabId}`);
});
```

### `captcha.onBlocked(tabId, handler)`

Triggered when a block is detected.

```ts
piggy.captcha.onBlocked("default", (data) => {
  console.log(`Block detected! Type: ${data.blockType}`);
  console.log(`Tab ID: ${data.tabId}`);
  // Auto-rotate proxy if enabled
});
```

### `captcha.onBlockRetry(tabId, handler)`

Triggered when a block retry occurs.

```ts
piggy.captcha.onBlockRetry("default", (data) => {
  console.log(`Retrying after block on tab ${data.tabId}`);
});
```

---

## Complete Example: Production Scraper with CAPTCHA Handling

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

// Load proxies for rotation
await piggy.proxy.load("./proxies.txt");

// Enable auto-retry on CAPTCHA/block
await piggy.site.captcha.setAutoRetry(true);

// Set up event handlers
piggy.captcha.onCaptcha("default", async (data) => {
  console.log(`⚠️ CAPTCHA detected: ${data.captchaType}`);
  console.log("Auto-retry enabled, rotating proxy...");
});

piggy.captcha.onBlocked("default", async (data) => {
  console.log(`🚫 Block detected: ${data.blockType}`);
  console.log("Rotating proxy and retrying...");
});

piggy.captcha.onCaptchaResolved("default", (data) => {
  console.log(`✅ CAPTCHA resolved on tab ${data.tabId}`);
});

const { amazon } = usePiggy<"amazon">();

await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  // Check for CAPTCHA before scraping
  const captchaStatus = await amazon.captcha.status();
  if (captchaStatus.detected) {
    // Wait for resolution (auto-retry will handle proxy rotation)
    await amazon.captcha.waitForResolution(30000);
  }
  
  // Check for block
  const blockStatus = await amazon.captcha.blockStatus();
  if (blockStatus.detected) {
    await amazon.captcha.blockRetry();
  }
  
  // Proceed with scraping
  await amazon.navigate(`https://www.amazon.com/s?k=${term}`);
  await amazon.wait.selector({ selector: "[data-asin]", state: "attached" });
  
  const products = await amazon.provide.attrAll({ 
    selector: "[data-asin]", 
    attr: "data-asin" 
  });
  
  return { term, count: products.length, products };
});

await piggy.serve(3000);
console.log("API server running with CAPTCHA handling");
```

---

## Example: Manual CAPTCHA Solving

For cases where auto-retry fails or you need manual intervention:

```ts
import piggy, { usePiggy } from "nothing-browser";
import open from "open";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

await piggy.launch({ mode: "tab", binary: "headful" });  // Headful for manual solve
await piggy.register("site", "https://example.com");

const { site } = usePiggy<"site">();

await site.navigate();

// Check for CAPTCHA
const status = await site.captcha.status();

if (status.detected) {
  console.log(`CAPTCHA detected: ${status.type}`);
  console.log("Browser window is open. Please solve the CAPTCHA manually.");
  
  // Pause execution
  await site.captcha.pause();
  
  // Wait for user to press Enter after solving
  await new Promise((resolve) => {
    rl.question("Press Enter after solving CAPTCHA...", resolve);
  });
  
  // Check if solved
  const resolved = await site.captcha.check();
  
  if (resolved) {
    console.log("CAPTCHA solved! Continuing...");
  } else {
    console.log("CAPTCHA not solved. Exiting.");
    process.exit(1);
  }
}

// Continue with scraping
const title = await site.title();
console.log(`Page title: ${title}`);

await piggy.close();
rl.close();
```

---

## Example: Custom CAPTCHA Service Integration

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

const { site } = usePiggy<"site">();

// Expose a function to solve CAPTCHA via external service
await site.exposeFunction("solveCaptcha", async (imageData) => {
  // Send to 2Captcha or other service
  const response = await fetch("https://2captcha.com/in.php", {
    method: "POST",
    body: new URLSearchParams({
      key: process.env.TWO_CAPTCHA_KEY,
      method: "base64",
      body: imageData
    })
  });
  
  const captchaId = await response.text();
  
  // Poll for solution
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const result = await fetch(`https://2captcha.com/res.php?key=${process.env.TWO_CAPTCHA_KEY}&action=get&id=${captchaId}`);
    const text = await result.text();
    
    if (text.includes("OK|")) {
      return text.split("|")[1];
    }
  }
  
  throw new Error("CAPTCHA solving timeout");
});

// Monitor CAPTCHA events
piggy.captcha.onCaptcha("default", async (data) => {
  console.log(`CAPTCHA detected: ${data.captchaType}`);
  
  // Get CAPTCHA image and solve
  const result = await site.evaluate(`
    const img = document.querySelector('.captcha-image');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    canvas.toDataURL().split(',')[1]
  `);
  
  const solution = await site.expose.solveCaptcha(result);
  
  // Enter solution
  await site.type("#captcha-input", solution);
  await site.click("#captcha-submit");
  
  console.log("CAPTCHA solved via external service");
});
```

---

## API Reference

### Captcha Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `captcha.status()` | — | `Promise<{ detected, paused, type }>` | Get CAPTCHA status |
| `captcha.resolve()` | — | `Promise<void>` | Attempt to resolve |
| `captcha.pause()` | — | `Promise<void>` | Pause for manual solve |
| `captcha.check()` | — | `Promise<boolean>` | Check if resolved |
| `captcha.setAutoRetry(enabled)` | `enabled: boolean` | `Promise<void>` | Enable/disable auto-retry |
| `captcha.blockStatus()` | — | `Promise<{ detected, type }>` | Get block status |
| `captcha.blockRetry()` | — | `Promise<void>` | Retry after block |
| `captcha.waitForResolution(timeout?)` | `timeout?: number` | `Promise<void>` | Wait for resolution |

### Event Handlers

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `captcha.onCaptcha(tabId, handler)` | `tabId: string, handler: (data) => void` | `() => void` | CAPTCHA detected |
| `captcha.onCaptchaResolved(tabId, handler)` | same | `() => void` | CAPTCHA resolved |
| `captcha.onBlocked(tabId, handler)` | same | `() => void` | Block detected |
| `captcha.onBlockRetry(tabId, handler)` | same | `() => void` | Block retry triggered |

---

## Type Definitions

```ts
interface CaptchaStatus {
  detected: boolean;
  paused: boolean;
  type: "cloudflare" | "recaptcha" | "hcaptcha" | "turnstile" | "generic" | null;
}

interface BlockStatus {
  detected: boolean;
  type: "403" | "429" | "access-denied" | "firewall" | "rate-limit" | null;
}

interface CaptchaEventData {
  tabId: string;
  captchaType: string;
}

interface BlockEventData {
  tabId: string;
  blockType: string;
}
```

---

## Next Steps

- [Proxy API](./proxy) — Rotate IPs to avoid blocks
- [Dialog API](./dialog) — Handle JavaScript dialogs
- [Human API](./human) — Human-like behavior to avoid detection

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*