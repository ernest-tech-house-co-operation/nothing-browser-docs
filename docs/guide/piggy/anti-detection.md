
# 🚫 Anti-Detection

Bypass bot detection systems like Cloudflare, DataDome, and PerimeterX. Piggy combines multiple techniques to appear as a real human user.

---

## Overview

Piggy provides several layers of anti-detection:

| Layer | Technique | Bypasses |
|-------|-----------|----------|
| **TLS** | Real BoringSSL (Chrome-identical) | JA3 fingerprinting |
| **Browser** | No automation flags | navigator.webdriver detection |
| **Fingerprint** | Spoofed canvas, audio, WebGL | Canvas fingerprinting |
| **Behavior** | Human-like timing, mouse movement | Behavioral analysis |
| **Headers** | Real Chrome headers | Header inspection |

---

## Quick Start

```ts
import piggy from "nothing-browser";

// Enable all anti-detection features
await piggy.launch({ 
  mode: "tab", 
  binary: "headful"  // Some sites detect headless
});

// Enable human behavior
piggy.actHuman(true);

await piggy.register("stealth", "https://example.com");

// Add anti-detection init scripts
await piggy.stealth.addInitScript(`
  // Remove automation traces
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  
  // Override permissions
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ||
    parameters.name === 'geolocation'
  ) ? Promise.resolve({ state: 'prompt', onchange: null }) 
    : originalQuery(parameters);
`);

// Block tracking domains
await piggy.stealth.intercept.block("*google-analytics.com*");
await piggy.stealth.intercept.block("*doubleclick.net*");

await piggy.stealth.navigate();
```

---

## Layer 1: TLS Fingerprint

Piggy uses real BoringSSL (same as Chrome), not a patched OpenSSL.

```ts
// This is automatic - nothing to configure
// The TLS ClientHello is identical to Chrome
```

**What this bypasses:**
- JA3/JA4 fingerprinting
- Cloudflare TLS checks
- Akamai HTTP/2 fingerprinting

**Comparison:**

| Tool | TLS Library | Cloudflare |
|------|-------------|------------|
| Piggy | BoringSSL (real Chrome) | ✅ Passes |
| Python requests | OpenSSL | ❌ Blocked |
| curl | OpenSSL/NSS | ❌ Blocked |
| Playwright | BoringSSL | ⚠️ JS leaks |

---

## Layer 2: Automation Flags

Piggy is a real browser, not an automation driver.

```ts
// These are naturally undefined in Piggy
// No need to override - they don't exist
await piggy.stealth.evaluate(() => {
  console.log(navigator.webdriver); // undefined ✅
  console.log(window.chrome?.runtime); // exists ✅
  console.log(navigator.plugins.length); // > 0 ✅
});
```

**What this bypasses:**
- `navigator.webdriver` detection
- Missing `chrome.runtime`
- Missing plugin list
- `navigator.automation` flag

---

## Layer 3: Fingerprint Spoofing

Override browser APIs that reveal automation.

### Complete Anti-Detection Script

```ts
await piggy.stealth.addInitScript(`
  // Remove CDP automation痕迹
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
  delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  
  // Override permissions API
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ||
    parameters.name === 'geolocation' ||
    parameters.name === 'camera' ||
    parameters.name === 'microphone'
  ) ? Promise.resolve({ state: 'prompt', onchange: null }) 
    : originalQuery(parameters);
  
  // Fake plugins (real Chrome has these)
  Object.defineProperty(navigator, 'plugins', {
    get: () => [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
      { name: 'Native Client', filename: 'internal-nacl-plugin' }
    ]
  });
  
  // Fake languages
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en']
  });
  
  // Override webdriver property (already undefined, but ensure)
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined
  });
  
  // WebGL vendor spoofing
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return 'Intel Inc.';
    if (parameter === 37446) return 'Intel Iris OpenGL Engine';
    return getParameter.call(this, parameter);
  };
  
  // Canvas fingerprint noise (added by Piggy automatically)
  // Audio fingerprint noise (added by Piggy automatically)
  
  console.log('[Anti-Detection] Scripts injected');
`);
```

---

## Layer 4: Human Behavior

Enable human-like interaction timing.

```ts
// Enable globally
piggy.actHuman(true);

// Now all interactions have natural delays
await piggy.stealth.click("button");      // Random delay 100-500ms
await piggy.stealth.type("#input", "text"); // Variable typing speed
await piggy.stealth.hover(".menu");       // Delay before hover
await piggy.stealth.scroll.by(400);       // Smooth, varied scrolling

// Custom human-like wait
await piggy.stealth.wait(1000); // Actually waits 700-1300ms (±30%)
```

### Custom Human Behavior

```ts
// Random mouse movements
async function humanMouseMove(site: any, targetX: number, targetY: number) {
  const steps = 10 + Math.random() * 20;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Easing curve for natural movement
    const ease = t * t * (3 - 2 * t);
    const x = targetX * ease + (await site.mouse.position()).x * (1 - ease);
    const y = targetY * ease + (await site.mouse.position()).y * (1 - ease);
    
    await site.mouse.move(Math.floor(x), Math.floor(y));
    await site.wait(5 + Math.random() * 15);
  }
}

// Random scroll patterns
async function humanScroll(site: any, targetY: number) {
  const currentY = await site.evaluate(() => window.scrollY);
  const distance = targetY - currentY;
  const steps = Math.max(5, Math.floor(Math.abs(distance) / 50));
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = 1 - Math.pow(1 - t, 3); // Cubic ease out
    const y = currentY + distance * ease;
    
    await site.scroll.to(y);
    await site.wait(20 + Math.random() * 40);
  }
}
```

---

## Layer 5: Request Headers

Add real Chrome headers to all requests.

```ts
// Add realistic headers
await piggy.stealth.intercept.headers("*", {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Chromium";v="124", "Not A(Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "max-age=0"
});
```

---

## Layer 6: Block Trackers

Prevent tracking scripts from loading.

```ts
// Block common tracking domains
await piggy.stealth.intercept.block("*google-analytics.com*");
await piggy.stealth.intercept.block("*googletagmanager.com*");
await piggy.stealth.intercept.block("*doubleclick.net*");
await piggy.stealth.intercept.block("*facebook.com/tr*");
await piggy.stealth.intercept.block("*amazon-adsystem.com*");
await piggy.stealth.intercept.block("*scorecardresearch.com*");
await piggy.stealth.intercept.block("*adsrvr.org*");
await piggy.stealth.intercept.block("*criteo.com*");
await piggy.stealth.intercept.block("*taboola.com*");
await piggy.stealth.intercept.block("*outbrain.com*");
```

---

## Complete Anti-Detection Setup

```ts
import piggy from "nothing-browser";

async function createStealthBrowser() {
  // Launch with headful (some sites detect headless)
  await piggy.launch({ 
    mode: "tab", 
    binary: "headful" 
  });
  
  // Enable human behavior
  piggy.actHuman(true);
  
  await piggy.register("stealth", "https://target-site.com");
  
  // Add anti-detection init script
  await piggy.stealth.addInitScript(`
    // Remove automation traces
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    
    // Override permissions
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = (params) => (
      ['notifications', 'geolocation', 'camera', 'microphone'].includes(params.name)
    ) ? Promise.resolve({ state: 'prompt', onchange: null }) : originalQuery(params);
    
    // Fake plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' }
      ]
    });
    
    // WebGL spoofing
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(p) {
      if (p === 37445) return 'Intel Inc.';
      if (p === 37446) return 'Intel Iris OpenGL Engine';
      return getParameter.call(this, p);
    };
    
    // Battery API (avoid fingerprinting)
    if (navigator.getBattery) {
      const originalGetBattery = navigator.getBattery;
      navigator.getBattery = () => originalGetBattery().then(battery => {
        Object.defineProperty(battery, 'level', { get: () => Math.random() * 0.4 + 0.6 });
        return battery;
      });
    }
  `);
  
  // Block tracking domains
  await piggy.stealth.intercept.block("*google-analytics.com*");
  await piggy.stealth.intercept.block("*doubleclick.net*");
  await piggy.stealth.intercept.block("*facebook.com/tr*");
  
  // Add realistic headers
  await piggy.stealth.intercept.headers("*", {
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Ch-Ua": '"Chromium";v="124", "Not A(Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"'
  });
  
  return piggy.stealth;
}

// Usage
const browser = await createStealthBrowser();
await browser.navigate("https://cloudflare-protected-site.com");
await browser.waitForSelector(".content");

// Should pass Cloudflare challenge
const passed = await browser.evaluate(() => {
  return !document.body.innerText.includes("Checking your browser");
});

console.log("Bypassed Cloudflare:", passed);
```

---

## Testing Your Setup

### 1. Check Automation Detection

```ts
const detectionResults = await piggy.stealth.evaluate(() => ({
  webdriver: navigator.webdriver,
  chromeRuntime: !!window.chrome?.runtime,
  plugins: navigator.plugins.length,
  languages: navigator.languages,
  webglVendor: document.createElement('canvas').getContext('webgl')?.getParameter(37445),
  permissions: await navigator.permissions.query({ name: 'notifications' }).then(p => p.state)
}));

console.log("Detection check:", detectionResults);
// Expected: webdriver: undefined, chromeRuntime: true, plugins: >0
```

### 2. Use Fingerprint Test Sites

```ts
// Test on fingerprinting sites
const testSites = [
  "https://bot.sannysoft.com/",
  "https://arh.antoinevastel.com/bots/",
  "https://deviceandbrowserinfo.com/are_you_a_bot",
  "https://www.creepjs.com/"
];

for (const url of testSites) {
  await piggy.stealth.navigate(url);
  await piggy.stealth.wait(3000);
  const screenshot = await piggy.stealth.screenshot();
  console.log(`Tested: ${url}`);
  // Review screenshot to see if detected
}
```

---

## Cloudflare-Specific Bypass

```ts
async function bypassCloudflare(site: any) {
  // Navigate to site
  await site.navigate();
  
  // Wait for Cloudflare challenge
  await site.wait(3000);
  
  // Check if challenge page is present
  const hasChallenge = await site.evaluate(() => {
    return document.body.innerText.includes("Checking your browser") ||
           document.querySelector("#challenge-running") !== null;
  });
  
  if (hasChallenge) {
    console.log("Cloudflare challenge detected, waiting...");
    
    // Wait for challenge to complete (usually 5-10 seconds)
    await site.waitForResponse("*cdn-cgi/challenge-platform*", 30000);
    await site.wait(2000);
    
    // Challenge should be solved
    const solved = await site.evaluate(() => {
      return !document.body.innerText.includes("Checking your browser");
    });
    
    if (solved) {
      console.log("✅ Cloudflare bypassed!");
      return true;
    }
  }
  
  return false;
}

// Usage
await bypassCloudflare(piggy.stealth);
```

---

## Common Detection Vectors

| Vector | Piggy Status | How It's Bypassed |
|--------|--------------|-------------------|
| `navigator.webdriver` | ✅ Undefined | Real browser, not automation |
| `navigator.plugins` | ✅ Present | Spoofed Chrome plugins |
| `window.chrome` | ✅ Present | Real Chrome object |
| `navigator.languages` | ✅ Present | Spoofed en-US,en |
| WebGL vendor | ✅ Spoofed | Overridden getParameter |
| Canvas fingerprint | ✅ Noised | xorshift per-pixel noise |
| Audio fingerprint | ✅ Noised | ±0.00000005 per sample |
| TLS JA3 | ✅ Chrome-identical | Real BoringSSL |
| Request headers | ✅ Chrome-like | Intercepted and modified |
| Behavioral patterns | ✅ Human-like | actHuman(true) |

---

## Limitations

```ts
// Some sites still detect headless mode
// Use headful binary for these:
await piggy.launch({ binary: "headful" });

// Some banking sites use advanced fingerprinting
// Not all can be bypassed

// Rate limiting still applies
// Add delays between requests
await piggy.site.wait(5000);
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `piggy.actHuman(true)` | Enable human-like behavior |
| `site.addInitScript(js)` | Inject anti-detection script |
| `site.intercept.block(pattern)` | Block tracking domains |
| `site.intercept.headers(pattern, headers)` | Spoof request headers |

---

## Next Steps

- [Human Mode](./human-mode) — Detailed human behavior settings
- [Fingerprint Spoofing](./fingerprint) — Deep dive into fingerprinting
- [TLS Fingerprint Report](../technical/tls-fingerprint) — Technical TLS details

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
