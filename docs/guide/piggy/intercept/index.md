# 📡 Intercept API — Block, Redirect, Mock, Modify Requests

Intercept network requests before they leave the browser or modify responses as they come back. Perfect for mocking APIs, blocking trackers, caching responses, and debugging.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Intercept API gives you full control over network traffic:

| Action | Method | Use Case |
|--------|--------|----------|
| **Block** | `intercept.block()` | Block ads, trackers, images |
| **Redirect** | `intercept.redirect()` | Point CDN to local mirror |
| **Modify Headers** | `intercept.headers()` | Add auth tokens, spoof headers |
| **Mock Response** | `intercept.respond()` | Fake API responses (static or dynamic) |
| **Modify Response** | `intercept.modifyResponse()` | Inject data into real responses |

> ⚠️ **Important:** Pattern matching must match the URL **word for word** (except for `*` wildcards). Partial matches do NOT work.

---

## Pattern Matching Rules

| Pattern | Matches | Does NOT Match |
|---------|---------|----------------|
| `https://api.example.com/users` | Exactly that URL | `/users`, `api.example.com/users` |
| `https://api.example.com/users*` | `https://api.example.com/users/123`, `https://api.example.com/users?page=1` | `https://api.example.com/user` |
| `*api.example.com*` | Any URL containing `api.example.com` | URLs without that string |
| `/api/users` | `https://example.com/api/users` (relative path works) | `/api/user` |

```ts
// ✅ Exact match — works
await piggy.site.intercept.respond("/api/users", mockResponse);

// ❌ Partial match — will NOT match
// Request URL: https://api.example.com/users/123
// Pattern "/api/users" does NOT match "/api/users/123"

// ✅ Use wildcard for partial matching
await piggy.site.intercept.respond("/api/users*", mockResponse);
// Now matches /api/users, /api/users/123, /api/users?page=1
```

---

## Block Requests

### `intercept.block(pattern)`

Blocks requests matching the pattern. Useful for ads, trackers, and unnecessary resources.

```ts
// Block Google Analytics
await piggy.site.intercept.block("*google-analytics.com*");

// Block all images
await piggy.site.intercept.block("*.png");
await piggy.site.intercept.block("*.jpg");
await piggy.site.intercept.block("*.jpeg");
await piggy.site.intercept.block("*.gif");
await piggy.site.intercept.block("*.webp");

// Block specific API
await piggy.site.intercept.block("*/api/analytics*");

// Block tracking domains
await piggy.site.intercept.block("*doubleclick.net*");
await piggy.site.intercept.block("*facebook.com/tr*");
```

### Shortcut: Block Images

```ts
// Quick way to block all images
await piggy.site.blockImages();

// Unblock
await piggy.site.unblockImages();
```

---

## Redirect Requests

### `intercept.redirect(pattern, redirectUrl)`

Redirects matching requests to a different URL.

```ts
// Redirect CDN to local mirror
await piggy.site.intercept.redirect(
  "https://cdn.example.com/*",
  "http://localhost:8080/$1"
);

// Redirect old API to new API
await piggy.site.intercept.redirect(
  "*/api/v1/*",
  "https://api.example.com/v2/$1"
);
```

---

## Modify Headers

### `intercept.headers(pattern, headers)`

Adds or modifies request headers before they are sent.

```ts
// Add custom header to all requests
await piggy.site.intercept.headers("*", {
  "X-Scraped-By": "Nothing-Browser",
  "X-Request-ID": () => crypto.randomUUID()
});

// Override User-Agent for specific domain
await piggy.site.intercept.headers("*.twitter.com*", {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
});

// Add authentication header to API calls
await piggy.site.intercept.headers("*/api/*", {
  "Authorization": `Bearer ${process.env.API_TOKEN}`
});
```

---

## Mock Responses

### `intercept.respond(pattern, response)`

Serves a custom response instead of making the actual network request.

```ts
// Static response
await piggy.site.intercept.respond("/api/users", {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ users: [{ id: 1, name: "John" }] })
});

// Return 404 for specific endpoint
await piggy.site.intercept.respond("/api/secret/*", {
  status: 404,
  contentType: "application/json",
  body: JSON.stringify({ error: "Not found" })
});

// Dynamic response based on request
await piggy.site.intercept.respond("/api/product/*", async (request) => {
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
  
  // Return null to let request through to real server
  return null;
});
```

### Response Object Structure

```ts
interface InterceptResponse {
  status?: number;           // default: 200
  contentType?: string;      // default: auto-detect
  headers?: Record<string, string>;
  body: string | Buffer;
}
```

---

## Modify Responses

### `intercept.modifyResponse(pattern, handler)`

Modifies an existing response after it's received from the server.

```ts
// Inject custom field into API response
await piggy.site.intercept.modifyResponse("*/api/users*", async (response) => {
  const data = await response.json();
  
  data._scraped_at = Date.now();
  data._source = "nothing-browser";
  
  return {
    body: JSON.stringify(data),
    headers: { "X-Modified": "true" }
  };
});

// Redact sensitive data
await piggy.site.intercept.modifyResponse("*/api/user/*", async (response) => {
  const data = await response.json();
  
  delete data.ssn;
  delete data.credit_card;
  data.email = data.email.replace(/(.{2}).*(@.*)/, "$1***$2");
  
  return { body: JSON.stringify(data) };
});

// Modify HTML response
await piggy.site.intercept.modifyResponse("*.html", async (response) => {
  let html = response.body;
  // Remove popup scripts
  html = html.replace(/<script[^>]*popup[^>]*>.*?<\/script>/gi, "");
  return { body: html };
});
```

### ModifyResponse Handler

```ts
interface ModifyResponse {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  json(): Promise<any>;
}

// Return null to passthrough unchanged
// Return { status?, headers?, body? } to modify
```

---

## Clear Rules

### `intercept.clear(type?)`

Clears all intercept rules.

```ts
// Clear all rules
await piggy.site.intercept.clear();

// Clear only block rules
await piggy.site.intercept.clear("block");

// Clear only redirect rules
await piggy.site.intercept.clear("redirect");

// Clear only respond rules
await piggy.site.intercept.clear("respond");

// Clear only modifyResponse rules
await piggy.site.intercept.clear("modifyResponse");

// Clear only headers rules
await piggy.site.intercept.clear("headers");
```

---

## Real-World Examples

### Example 1: Mock API for Testing

```ts
// Mock product list API
await piggy.site.intercept.respond("/api/products", {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({
    products: [
      { id: 1, name: "Mock Product 1", price: 29.99 },
      { id: 2, name: "Mock Product 2", price: 49.99 }
    ]
  })
});

// Mock specific product
await piggy.site.intercept.respond("/api/products/42", {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ id: 42, name: "Special Product", price: 99.99 })
});

// Mock error response
await piggy.site.intercept.respond("/api/error-endpoint", {
  status: 500,
  contentType: "application/json",
  body: JSON.stringify({ error: "Internal server error" })
});
```

### Example 2: Block All Trackers

```ts
// Block common tracking domains
const trackers = [
  "*google-analytics.com*",
  "*googletagmanager.com*",
  "*doubleclick.net*",
  "*facebook.com/tr*",
  "*amazon-adsystem.com*",
  "*scorecardresearch.com*",
  "*adsrvr.org*",
  "*criteo.com*",
  "*taboola.com*",
  "*outbrain.com*"
];

for (const tracker of trackers) {
  await piggy.site.intercept.block(tracker);
}

console.log(`${trackers.length} trackers blocked`);
```

### Example 3: Cache API Responses with TTL

```ts
const apiCache = new Map();

await piggy.site.intercept.respond("/api/products*", async (request) => {
  const cached = apiCache.get(request.url);
  
  if (cached && Date.now() < cached.expires) {
    return {
      status: 200,
      contentType: "application/json",
      body: cached.data,
      headers: { "X-Cache": "HIT", "X-Cache-Age": String(Date.now() - cached.timestamp) }
    };
  }
  
  return null; // Passthrough to be cached by modifyResponse
});

await piggy.site.intercept.modifyResponse("/api/products*", async (response) => {
  const data = await response.json();
  
  apiCache.set(response.url, {
    data: JSON.stringify(data),
    timestamp: Date.now(),
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  
  return null; // No modification, just cache
});
```

### Example 4: Add Authentication Headers

```ts
// Add token to all API requests
await piggy.site.intercept.headers("*/api/*", {
  "Authorization": `Bearer ${process.env.API_TOKEN}`,
  "X-Client-Version": "2.0.0"
});

// Add specific headers for external API
await piggy.site.intercept.headers("*external-api.com*", {
  "X-API-Key": process.env.EXTERNAL_API_KEY,
  "Accept": "application/json"
});
```

### Example 5: Mock Slow Network (Dynamic Response)

```ts
await piggy.site.intercept.respond("/api/slow-endpoint", async () => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 3000));
  
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ message: "Slow response", latency: "3000ms" })
  };
});
```

### Example 6: Inject Data into Real Responses

```ts
await piggy.site.intercept.modifyResponse("*/api/feed*", async (response) => {
  const data = await response.json();
  
  // Inject analytics tracking
  data.items = data.items.map(item => ({
    ...item,
    _injected_at: Date.now(),
    _tracking_id: crypto.randomUUID()
  }));
  
  return { body: JSON.stringify(data) };
});
```

### Example 7: Redirect CDN to Local

```ts
// Redirect all CDN requests to local development server
await piggy.site.intercept.redirect(
  "https://cdn.example.com/assets/*",
  "http://localhost:3000/assets/$1"
);

// Redirect specific file
await piggy.site.intercept.redirect(
  "https://cdn.example.com/config.json",
  "http://localhost:3000/config.dev.json"
);
```

### Example 8: Conditional Mock Based on Request Body

```ts
await piggy.site.intercept.respond("/api/login", async (request) => {
  const body = JSON.parse(request.body || "{}");
  
  if (body.username === "admin" && body.password === "secret") {
    return {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "mock-jwt-token", role: "admin" })
    };
  }
  
  return {
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ error: "Invalid credentials" })
  };
});
```

---

## Pattern Matching Cheat Sheet

| Pattern | Matches |
|---------|---------|
| `/api/users` | Exactly `/api/users` |
| `/api/users*` | `/api/users`, `/api/users/123`, `/api/users?page=1` |
| `*api/users*` | Any URL containing `api/users` |
| `https://example.com/api/*` | Any URL starting with that base |
| `*.json` | Any URL ending with `.json` |
| `*` | Everything |

```ts
// ✅ Correct
await piggy.site.intercept.respond("/api/users*", mockResponse);

// ❌ Will NOT match /api/users/123
await piggy.site.intercept.respond("/api/users", mockResponse);

// ✅ Correct for domain matching
await piggy.site.intercept.block("*google-analytics.com*");

// ❌ Will NOT match subdomains
await piggy.site.intercept.block("google-analytics.com");
```

---

## API Reference

### Intercept Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `intercept.block(pattern)` | `pattern: string` | `Promise<void>` | Block matching requests |
| `intercept.redirect(pattern, redirectUrl)` | `pattern: string, redirectUrl: string` | `Promise<void>` | Redirect to new URL |
| `intercept.headers(pattern, headers)` | `pattern: string, headers: Record<string,string>` | `Promise<void>` | Add/modify request headers |
| `intercept.respond(pattern, response)` | `pattern: string, response: object \| Function` | `Promise<void>` | Serve custom response |
| `intercept.modifyResponse(pattern, handler)` | `pattern: string, handler: Function` | `Promise<void>` | Modify existing response |
| `intercept.clear(type?)` | `type?: "block" \| "redirect" \| "respond" \| "modifyResponse" \| "headers"` | `Promise<void>` | Clear rules |

### Shortcuts

| Method | Returns | Description |
|--------|---------|-------------|
| `blockImages()` | `Promise<void>` | Block all images |
| `unblockImages()` | `Promise<void>` | Unblock images |

---

## Type Definitions

```ts
interface InterceptRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface InterceptResponse {
  status?: number;
  contentType?: string;
  headers?: Record<string, string>;
  body: string | Buffer;
}

interface ModifyResponse {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  json(): Promise<any>;
}

interface ModifyResponseResult {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}
```

---

## Next Steps

- [Capture API](../capture) — Capture requests without modifying
- [Proxy API](../proxy) — Route traffic through proxies
- [Cookies API](../cookies) — Manage cookies

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*