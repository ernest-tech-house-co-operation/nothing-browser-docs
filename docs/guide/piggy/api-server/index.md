# 🚀 API Server — Turn Your Scraper into a REST API

One line of code. Zero configuration. Automatic OpenAPI documentation. Turn any Piggy scraper into a production-ready REST API.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The built-in API server uses Elysia.js to turn your Piggy sites into HTTP endpoints.

```ts
await piggy.site.api("/search", handler);
await piggy.serve(3000);
```

That's it. Your scraper is now an API.

| Feature | Description |
|---------|-------------|
| **Auto-routing** | Routes generated from `api()` calls |
| **OpenAPI docs** | Interactive docs at `/openapi` |
| **Caching** | Built-in TTL cache for responses |
| **Middleware** | Auth, logging, rate limiting |
| **Multi-site** | Run same operation on multiple sites |

---

## Quick Start

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

const { amazon } = usePiggy<"amazon">();

// Create an API endpoint
await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(term)}`);
  await amazon.wait.selector({ selector: "[data-asin]", state: "attached" });
  
  const products = await amazon.provide.attrAll({ 
    selector: "[data-asin]", 
    attr: "data-asin" 
  });
  
  return { term, count: products.length, products };
});

// Start the server
await piggy.serve(3000);

console.log("API running at http://localhost:3000");
console.log("OpenAPI docs at http://localhost:3000/openapi");
```

Now call your API:

```bash
curl "http://localhost:3000/amazon/search?q=laptop"
```

---

## Registering Routes

### `site.api(path, handler, opts?)`

Creates an HTTP endpoint at `/{siteName}{path}`.

```ts
await amazon.api("/search", async (params, query, body) => {
  // params — URL parameters like :id
  // query — query string parameters
  // body — request body (for POST/PUT)
  
  return { data: "response" };
});
```

### HTTP Methods

| Method | Default | Use |
|--------|---------|-----|
| `GET` | ✅ Yes | Read data |
| `POST` | ❌ | Create data |
| `PUT` | ❌ | Update data |
| `DELETE` | ❌ | Delete data |

```ts
// GET (default)
await amazon.api("/search", handler);

// POST
await amazon.api("/scrape", handler, { method: "POST" });

// PUT
await amazon.api("/update/:id", handler, { method: "PUT" });

// DELETE
await amazon.api("/delete/:id", handler, { method: "DELETE" });
```

### URL Parameters

```ts
await amazon.api("/product/:asin", async (params) => {
  const asin = params.asin;  // from URL path
  // ...
  return { asin, details };
});

// GET /amazon/product/B09X5Y8Z7W
```

---

## Caching

### TTL (Time-To-Live)

```ts
// Cache for 5 minutes (300,000 ms)
await amazon.api("/slow-endpoint", handler, { ttl: 300000 });

// No cache (default)
await amazon.api("/live-data", handler, { ttl: 0 });
```

Cached responses are stored in memory. Subsequent requests within TTL return instantly.

---

## Middleware

### `before` — Pre-request middleware

```ts
const authMiddleware = async ({ headers, set }: any) => {
  const apiKey = headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    set.status = 401;
    throw new Error("Unauthorized");
  }
};

const loggerMiddleware = async ({ request }: any) => {
  console.log(`${request.method} ${request.url}`);
};

await amazon.api("/protected", handler, { 
  before: [authMiddleware, loggerMiddleware] 
});
```

Middleware runs in order before your handler.

---

## OpenAPI Documentation

### Enable OpenAPI

```ts
await piggy.serve(3000, {
  title: "Amazon Scraper API",
  version: "1.0.0",
  description: "Product data API"
});
```

### Endpoints

| URL | Description |
|-----|-------------|
| `/openapi` | Interactive Scalar UI |
| `/openapi/json` | Raw OpenAPI spec |
| `/health` | Health check |

> ⚠️ **Known Issue:** The OpenAPI UI may send multiple requests when testing endpoints. Use `curl` for testing until Nothing UI is released.

### Document Your Routes

```ts
await amazon.api("/search", handler, {
  detail: {
    tags: ["Amazon", "Products"],
    summary: "Search Amazon products",
    description: "Scrapes product listings for a given keyword",
    parameters: [
      {
        name: "q",
        in: "query",
        description: "Search term",
        required: true,
        schema: { type: "string", example: "laptop" }
      },
      {
        name: "pages",
        in: "query",
        description: "Number of pages",
        required: false,
        schema: { type: "integer", default: 1, minimum: 1, maximum: 10 }
      }
    ]
  }
});
```

### Detail Fields

| Field | Type | Description |
|-------|------|-------------|
| `tags` | `string[]` | Groups routes in UI |
| `summary` | `string` | Short description |
| `description` | `string` | Long description |
| `parameters` | `RouteParameter[]` | Query/path/header params |
| `deprecated` | `boolean` | Mark as deprecated |
| `hide` | `boolean` | Hide from UI |

---

## Starting the Server

### `piggy.serve(port, opts?)`

```ts
// Basic
await piggy.serve(3000);

// With OpenAPI metadata
await piggy.serve(3000, {
  title: "My API",
  version: "1.0.0",
  description: "API description"
});

// Custom hostname (allow external connections)
await piggy.serve(3000, { 
  hostname: "0.0.0.0",
  title: "Public API",
  version: "1.0.0"
});
```

### Stopping the Server

```ts
await piggy.stopServer();
```

---

## Multi-Site Operations

### `piggy.all(sites)` — Run in parallel

```ts
const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

// Get all titles in parallel
const titles = await piggy.all([amazon, ebay, walmart]).title();
// Returns: ["Amazon Title", "eBay Title", "Walmart Title"]
```

### `piggy.diff(sites)` — Map by site name

```ts
const titles = await piggy.diff([amazon, ebay, walmart]).title();
// Returns: {
//   amazon: "Amazon Title",
//   ebay: "eBay Title", 
//   walmart: "Walmart Title"
// }
```

---

## Complete Examples

### Example 1: Product Search API

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

const { amazon } = usePiggy<"amazon">();

await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  const limit = Math.min(parseInt(query.limit) ?? 20, 50);
  
  await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(term)}`);
  await amazon.wait.selector({ selector: "[data-asin]", state: "attached" });
  
  const products = await amazon.provide.attrAll({ 
    selector: "[data-asin]", 
    attr: "data-asin" 
  });
  
  const titles = await amazon.provide.textAll({ selector: ".title" });
  
  const results = products.slice(0, limit).map((asin, i) => ({
    asin,
    title: titles[i] || ""
  }));
  
  return { term, count: results.length, results };
}, {
  ttl: 60000,
  detail: {
    summary: "Search Amazon products",
    parameters: [
      { name: "q", in: "query", schema: { type: "string", default: "laptop" } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 50 } }
    ]
  }
});

await piggy.serve(3000, {
  title: "Amazon Scraper API",
  version: "1.0.0"
});

console.log("Server running at http://localhost:3000");
```

### Example 2: Multi-Site Price Comparison

```ts
await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("walmart", "https://www.walmart.com");

const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

async function searchSite(site: any, term: string) {
  await site.navigate(`https://${site._name}.com/search?q=${term}`);
  await site.wait.selector({ selector: ".product", state: "attached" });
  const prices = await site.provide.textAll({ selector: ".price" });
  return prices.slice(0, 5);
}

await amazon.api("/compare", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  const [amazonPrices, ebayPrices, walmartPrices] = await Promise.all([
    searchSite(amazon, term),
    searchSite(ebay, term),
    searchSite(walmart, term)
  ]);
  
  return {
    term,
    amazon: amazonPrices,
    ebay: ebayPrices,
    walmart: walmartPrices
  };
});

await piggy.serve(3000);
```

### Example 3: With Authentication

```ts
const authMiddleware = async ({ headers, set }: any) => {
  const key = headers["x-api-key"];
  if (!key || key !== process.env.API_KEY) {
    set.status = 401;
    throw new Error("Invalid API key");
  }
};

await amazon.api("/private/data", async () => {
  return { secret: "data" };
}, { before: [authMiddleware] });
```

### Example 4: Rate Limiting

```ts
const rateLimit = new Map();

const rateLimitMiddleware = async ({ headers, set }: any) => {
  const ip = headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 60;
  
  if (!rateLimit.has(ip)) rateLimit.set(ip, []);
  const requests = rateLimit.get(ip).filter((ts: number) => now - ts < windowMs);
  
  if (requests.length >= maxRequests) {
    set.status = 429;
    throw new Error("Rate limit exceeded");
  }
  
  requests.push(now);
  rateLimit.set(ip, requests);
};

await amazon.api("/search", handler, { 
  before: [rateLimitMiddleware],
  ttl: 30000 
});
```

---

## Listing Routes

### `piggy.routes()`

Returns all registered API routes.

```ts
const routes = piggy.routes();
console.log(routes);
// [
//   { site: "amazon", method: "GET", path: "/amazon/search", ttl: 60000, middlewareCount: 1 },
//   { site: "amazon", method: "GET", path: "/amazon/product/:asin", ttl: 0, middlewareCount: 0 }
// ]
```

---

## API Reference

### Site Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `api(path, handler, opts?)` | `path: string, handler: Function, opts?: ApiOptions` | `SiteObject` | Register endpoint |
| `noclose()` | — | `SiteObject` | Keep site alive |

### Global Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `serve(port, opts?)` | `port: number, opts?: ServeOptions` | `Promise<Elysia>` | Start HTTP server |
| `stopServer()` | — | `void` | Stop HTTP server |
| `routes()` | — | `RouteInfo[]` | List all routes |
| `all(sites)` | `sites: SiteObject[]` | `Proxy` | Parallel operations |
| `diff(sites)` | `sites: SiteObject[]` | `Proxy` | Named results |

### ApiOptions

```ts
interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;                                 // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;       // Middleware functions
  detail?: RouteDetail;                         // OpenAPI documentation
}
```

### ServeOptions

```ts
interface ServeOptions {
  hostname?: string;    // Default: "localhost"
  title?: string;       // API title for OpenAPI
  version?: string;     // API version for OpenAPI
  description?: string; // API description for OpenAPI
}
```

### RouteDetail

```ts
interface RouteDetail {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: RouteParameter[];
  deprecated?: boolean;
  hide?: boolean;
}
```

---

## Next Steps

- [Proxy API](./proxy) — Route traffic through proxies
- [Storage API](./storage) — Schema-based data persistence
- [Events API](./events) — Real-time events

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*