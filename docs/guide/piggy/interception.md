# 📡 Request Interception

Block, redirect, modify headers, or serve custom responses to network requests. Perfect for mocking APIs, caching, and bypassing trackers.

---

## Overview

Piggy can intercept network requests at multiple levels:

| Type | Method | Use Case |
|------|--------|----------|
| **Block** | `intercept.block()` | Block ads, trackers, images |
| **Redirect** | `intercept.redirect()` | Point CDN to local mirror |
| **Headers** | `intercept.headers()` | Add/modify request headers |
| **Respond** | `intercept.respond()` | Serve custom response (mock API) |
| **Modify Response** | `intercept.modifyResponse()` | Change response body on the fly |

---

## Block Requests

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Block tracking domains
await piggy.site.intercept.block("*google-analytics.com*");
await piggy.site.intercept.block("*doubleclick.net*");
await piggy.site.intercept.block("*facebook.com/tr*");

// Block images by pattern
await piggy.site.intercept.block("*.png");
await piggy.site.intercept.block("*.jpg");

// Block specific API
await piggy.site.intercept.block("*/api/analytics*");

await piggy.site.navigate();
// All blocked requests will return empty responses
```

### Block Images Shortcut

```ts
// Quick way to block all images
await piggy.site.blockImages();

// Unblock images
await piggy.site.unblockImages();
```

---

## Redirect Requests

```ts
// Redirect CDN to local mirror
await piggy.site.intercept.redirect(
  "https://cdn.example.com/*",
  "http://localhost:8080/$1"
);

// Redirect API to mock server
await piggy.site.intercept.redirect(
  "*/api/v1/*",
  "https://mockapi.example.com/api/v1/$1"
);

// Redirect to different domain
await piggy.site.intercept.redirect(
  "https://old-site.com/*",
  "https://new-site.com/$1"
);
```

---

## Modify Request Headers

```ts
// Add custom headers to all requests
await piggy.site.intercept.headers("*", {
  "X-Scraped-By": "Nothing-Browser",
  "X-Request-ID": () => crypto.randomUUID()
});

// Override User-Agent for specific domain
await piggy.site.intercept.headers("*.twitter.com*", {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
});

// Add authentication header
await piggy.site.intercept.headers("*/api/*", {
  "Authorization": `Bearer ${process.env.API_TOKEN}`
});

// Modify multiple headers
await piggy.site.intercept.headers("*", {
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Not A(Brand";v="99", "Chromium";v="124"'
});
```

---

## Serve Custom Response (Mock API)

Complete control over responses. Return any status code, headers, and body.

```ts
// Mock API endpoint
await piggy.site.intercept.respond(
  "*/api/users*",
  async (request) => {
    return {
      status: 200,
      contentType: "application/json",
      headers: { "X-Cache": "HIT" },
      body: JSON.stringify({
        users: [
          { id: 1, name: "User One" },
          { id: 2, name: "User Two" }
        ]
      })
    };
  }
);

// Return 404 for specific endpoint
await piggy.site.intercept.respond(
  "*/api/secret/*",
  async () => ({
    status: 404,
    contentType: "application/json",
    body: JSON.stringify({ error: "Not found" })
  })
);

// Return HTML
await piggy.site.intercept.respond(
  "*/page/*",
  async () => ({
    status: 200,
    contentType: "text/html",
    body: "<html><body><h1>Mocked Page</h1></body></html>"
  })
);
```

### Dynamic Response Based on Request

```ts
await piggy.site.intercept.respond(
  "*/api/product/*",
  async (request) => {
    // Extract product ID from URL
    const productId = request.url.match(/\/product\/(\d+)/)?.[1];
    
    // Check local cache
    const cached = await db.products.find(productId);
    if (cached) {
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(cached),
        headers: { "X-Cache": "HIT" }
      };
    }
    
    // Let request through to real server
    return null;
  }
);
```

### Serve Static Files from Disk

```ts
import { readFileSync } from "fs";

await piggy.site.intercept.respond(
  "*/assets/bundle.js",
  async () => {
    const content = readFileSync("./cache/bundle.js", "utf-8");
    return {
      status: 200,
      contentType: "application/javascript",
      body: content,
      headers: { "X-Served-From": "local-cache" }
    };
  }
);
```

---

## Modify Existing Response

Change response body on the fly without replacing the entire response.

```ts
// Add data to API response
await piggy.site.intercept.modifyResponse(
  "*/api/feed*",
  async (response) => {
    const data = await response.json();
    
    // Inject custom field
    data.items = data.items.map(item => ({
      ...item,
      _scraped_at: Date.now(),
      _source: "nothing-browser"
    }));
    
    return {
      body: JSON.stringify(data),
      headers: { "X-Modified": "true" }
    };
  }
);

// Redact sensitive data
await piggy.site.intercept.modifyResponse(
  "*/api/user/*",
  async (response) => {
    const data = await response.json();
    
    // Remove sensitive fields
    delete data.ssn;
    delete data.credit_card;
    data.email = data.email.replace(/(.{2}).*(@.*)/, "$1***$2");
    
    return { body: JSON.stringify(data) };
  }
);

// Modify HTML response
await piggy.site.intercept.modifyResponse(
  "*.html",
  async (response) => {
    let html = response.body;
    // Remove popup scripts
    html = html.replace(/<script[^>]*popup[^>]*>.*?<\/script>/gi, "");
    return { body: html };
  }
);
```

---

## Complete Example: Local Cache Mode

```ts
import piggy from "nothing-browser";

const cache = new Map();

await piggy.launch({ mode: "tab" });
await piggy.register("spa", "https://your-spa.com");

// Cache all static assets
await piggy.spa.intercept.respond("*.js", async (req) => {
  if (!cache.has(req.url)) {
    const response = await fetch(req.url);
    cache.set(req.url, await response.text());
    console.log(`Cached: ${req.url}`);
  }
  return {
    contentType: "application/javascript",
    body: cache.get(req.url),
    headers: { "X-Cache": "HIT" }
  };
});

await piggy.spa.intercept.respond("*.css", async (req) => {
  if (!cache.has(req.url)) {
    const response = await fetch(req.url);
    cache.set(req.url, await response.text());
  }
  return {
    contentType: "text/css",
    body: cache.get(req.url)
  };
});

// Cache API responses with TTL
const apiCache = new Map();

await piggy.spa.intercept.respond("*/api/*", async (req) => {
  const cached = apiCache.get(req.url);
  if (cached && Date.now() < cached.expires) {
    return {
      contentType: "application/json",
      body: cached.data,
      headers: { "X-Cache": "HIT", "X-Cache-Age": String(Date.now() - cached.timestamp) }
    };
  }
  return null; // Passthrough to be cached by modifyResponse
});

await piggy.spa.intercept.modifyResponse("*/api/*", async (res) => {
  const data = await res.json();
  apiCache.set(res.url, {
    data: JSON.stringify(data),
    timestamp: Date.now(),
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  return { body: JSON.stringify(data) };
});

await piggy.spa.navigate();
console.log("App running with local cache!");
```

---

## Complete Example: Anti-Detection

```ts
await piggy.register("stealth", "https://example.com");

// Block tracking domains
await piggy.stealth.intercept.block("*google-analytics.com*");
await piggy.stealth.intercept.block("*doubleclick.net*");
await piggy.stealth.intercept.block("*facebook.com/tr*");
await piggy.stealth.intercept.block("*googletagmanager.com*");
await piggy.stealth.intercept.block("*amazon-adsystem.com*");

// Spoof headers
await piggy.stealth.intercept.headers("*", {
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Ch-Ua": '"Chromium";v="124", "Not A(Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1"
});

// Block WebRTC leak (modify response to strip STUN servers)
await piggy.stealth.intercept.modifyResponse(
  "*/v1/ice-config*",
  async (response) => {
    const data = await response.json();
    data.iceServers = data.iceServers.filter(
      (server: any) => !server.urls?.includes("stun:")
    );
    return { body: JSON.stringify(data) };
  }
);

await piggy.stealth.navigate();
```

---

## Clear Intercept Rules

```ts
// Clear all rules for this site
await piggy.site.intercept.clear();

// Clear specific types
await piggy.site.intercept.clear("block");
await piggy.site.intercept.clear("redirect");
await piggy.site.intercept.clear("respond");
await piggy.site.intercept.clear("modifyResponse");
await piggy.site.intercept.clear("headers");
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `intercept.block(pattern)` | Block matching requests |
| `intercept.redirect(pattern, url)` | Redirect to new URL |
| `intercept.headers(pattern, headers)` | Add/modify request headers |
| `intercept.respond(pattern, handler)` | Serve custom response |
| `intercept.modifyResponse(pattern, handler)` | Modify existing response |
| `intercept.clear(type?)` | Clear all rules |
| `blockImages()` | Block all images |
| `unblockImages()` | Unblock images |

### Response Handler (for `respond`)

```ts
interface Request {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface Response {
  status?: number;           // default: 200
  contentType?: string;      // default: auto-detect
  headers?: Record<string, string>;
  body: string | Buffer;
}
```

### Modify Response Handler (for `modifyResponse`)

```ts
interface OriginalResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  json: () => Promise<any>;
}

// Return null to passthrough unchanged
// Return { status?, headers?, body? } to modify
```

---

## Pattern Matching

Patterns support `*` wildcards:

| Pattern | Matches |
|---------|---------|
| `*google-analytics.com*` | Any URL containing the domain |
| `*.png` | Any PNG image |
| `*/api/v1/*` | Any API v1 endpoint |
| `https://example.com/*` | Any URL on example.com |

---

## Next Steps

- [Network Capture](./network-capture) — Capture requests without modifying
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Built-in API Server](./api-server) — Turn your scraper into an API

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
