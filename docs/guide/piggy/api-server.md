# 🚀 Built-in API Server

Turn your scraper into a REST API with one line of code. Automatically generate endpoints from your scraping logic with built-in caching, middleware support, and **auto-generated OpenAPI documentation**.

---

## Overview

The built-in API server turns Piggy sites into HTTP endpoints. Perfect for:

- Exposing scraped data as an API
- Building web dashboards
- Creating microservices from browser automation
- **Auto-generated API docs** (OpenAPI/Scalar UI)

| Feature | Description |
|---------|-------------|
| **Auto-routing** | Routes generated from `api()` calls |
| **Caching** | Built-in TTL cache for responses |
| **Middleware** | Auth, logging, rate limiting |
| **Auto-start** | Server starts with `serve()` |
| **OpenAPI** | Auto-generated interactive docs |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("books", "https://books.toscrape.com");

// Create an API endpoint
await piggy.books.api("/list", async (params, query) => {
  await piggy.books.navigate();
  await piggy.books.waitForSelector(".product_pod");
  
  const books = await piggy.books.evaluate(() => 
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent,
    }))
  );
  
  return { count: books.length, books };
}, { ttl: 30000 }); // Cache for 30 seconds

// Start the server
await piggy.serve(3000);
console.log("API running at http://localhost:3000");

// Keep the script running
await piggy.books.noclose();
```

Now you can call your API:

```bash
curl http://localhost:3000/books/list
```

Response:
```json
{
  "count": 20,
  "books": [
    { "title": "A Light in the Attic", "price": "£51.77" },
    { "title": "Tipping the Velvet", "price": "£53.74" }
  ]
}
```

---

## API Endpoint with Parameters

```ts
await piggy.books.api("/search", async (params, query) => {
  const searchTerm = query.q || "";
  const page = parseInt(query.page) || 1;
  
  const url = page === 1 
    ? `https://books.toscrape.com/catalogue/page-${page}.html`
    : `https://books.toscrape.com/catalogue/page-${page}.html`;
  
  await piggy.books.navigate(url);
  
  if (searchTerm) {
    await piggy.books.type("#search", searchTerm);
    await piggy.books.click("#search-button");
    await piggy.books.waitForSelector(".product_pod");
  }
  
  const results = await piggy.books.evaluate(() => 
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent,
    }))
  );
  
  return {
    page,
    search: searchTerm || null,
    count: results.length,
    results
  };
});

// Query: GET /books/search?q=mystery&page=2
```

---

## API Endpoint with URL Parameters

```ts
await piggy.books.api("/product/:id", async (params, query) => {
  const productId = params.id;
  
  await piggy.books.navigate(`https://books.toscrape.com/catalogue/product-${productId}.html`);
  await piggy.books.waitForSelector(".product_main");
  
  const product = await piggy.books.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    price: document.querySelector(".price_color")?.textContent,
    description: document.querySelector("#product_description")?.nextElementSibling?.textContent,
    availability: document.querySelector(".availability")?.textContent?.trim(),
    upc: document.querySelector("th:contains('UPC')")?.nextElementSibling?.textContent,
  }));
  
  return product;
});

// GET /books/product/123
```

---

## Caching with TTL

```ts
// Cache for 5 minutes (300,000 ms)
await piggy.books.api("/slow-endpoint", async () => {
  const data = await expensiveScrapingOperation();
  return data;
}, { ttl: 300000 });

// Cache for 1 hour
await piggy.books.api("/hourly-data", async () => {
  return await fetchFreshData();
}, { ttl: 3600000 });

// No cache (default)
await piggy.books.api("/live-data", async () => {
  return await getLiveData();
});
```

---

## HTTP Methods

```ts
// GET (default)
await piggy.books.api("/list", handler, { method: "GET" });

// POST
await piggy.books.api("/scrape", handler, { method: "POST" });

// PUT
await piggy.books.api("/update", handler, { method: "PUT" });

// DELETE
await piggy.books.api("/clear-cache", handler, { method: "DELETE" });
```

---

## Middleware

### Auth Middleware

```ts
const authMiddleware = async ({ headers, set }: any) => {
  const apiKey = headers["x-api-key"];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    set.status = 401;
    throw new Error("Unauthorized");
  }
};

await piggy.books.api("/protected-data", async () => {
  return { secret: "sensitive data" };
}, { before: [authMiddleware] });
```

### Logging Middleware

```ts
const loggingMiddleware = async ({ request, set }: any) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  
  // Store start time to use after handler
  (request as any).startTime = start;
};

const timingMiddleware = async ({ request, set }: any) => {
  const duration = Date.now() - (request as any).startTime;
  console.log(`  Completed in ${duration}ms`);
};

await piggy.books.api("/logged-endpoint", async () => {
  return { data: "something" };
}, { before: [loggingMiddleware, timingMiddleware] });
```

### Rate Limiting Middleware

```ts
const rateLimit = new Map();

const rateLimitMiddleware = async ({ headers, set, request }: any) => {
  const ip = headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter((ts: number) => now - ts < windowMs);
  
  if (requests.length >= maxRequests) {
    set.status = 429;
    throw new Error("Rate limit exceeded");
  }
  
  requests.push(now);
  rateLimit.set(ip, requests);
};

await piggy.books.api("/rate-limited", async () => {
  return { message: "You made it!" };
}, { before: [rateLimitMiddleware] });
```

### Multiple Middleware

```ts
await piggy.books.api("/secure-endpoint", async () => {
  return { data: "protected" };
}, { 
  before: [authMiddleware, loggingMiddleware, rateLimitMiddleware],
  ttl: 60000
});
```

---

## OpenAPI Documentation

Piggy automatically generates OpenAPI documentation for all your routes.

> **⚠️ Important:** The OpenAPI UI (`/openapi`) currently sends multiple requests when testing endpoints. Use `curl` for testing until Nothing UI is released. See [warning below](#-openapi-ui-warning) for details.

### Enable OpenAPI

```ts
await piggy.serve(3000, {
  title: "My Scraper API",
  version: "1.0.0",
  description: "Browser automation API powered by Nothing Browser",
});
```

### OpenAPI Endpoints

| URL | What it serves | Safe to use? |
|-----|----------------|---------------|
| `http://localhost:3000/openapi` | Scalar UI (interactive) | ⚠️ May spam requests |
| `http://localhost:3000/openapi/json` | Raw OpenAPI JSON spec | ✅ Fully safe |
| `http://localhost:3000/health` | Health check | ✅ Fully safe |

### Interactive Documentation

When you visit `/openapi`, you get a fully interactive API documentation UI where you can:

- Browse all endpoints
- See request/response schemas
- Try out endpoints directly from the browser
- Copy curl commands
- Download OpenAPI spec

**But be careful:** The UI may send multiple requests when testing. Use curl instead.

---

## Route Documentation with `detail`

Document your endpoints right in the code using the `detail` option. This metadata appears in the OpenAPI UI.

### Basic Detail

```ts
await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  // ... scraping logic
  return { products };
}, {
  detail: {
    summary: "Search Amazon products",
    description: "Scrapes product listings for a given keyword",
    tags: ["Amazon"]
  }
});
```

### Complete Detail with Parameters

```ts
await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  const pages = parseInt(query.pages) ?? 3;
  
  // ... scraping logic
  
  return { term, pages, products };
}, {
  ttl: 30000,
  detail: {
    tags: ["Amazon", "Products"],
    summary: "Search Amazon products",
    description: "Scrapes product listings for a given keyword across multiple pages",
    parameters: [
      {
        name: "q",
        in: "query",
        description: "Search term (e.g., laptop, headphones)",
        required: false,
        schema: { type: "string", default: "laptop" }
      },
      {
        name: "pages",
        in: "query",
        description: "Number of pages to scrape",
        required: false,
        schema: { type: "integer", default: 3, minimum: 1, maximum: 20 }
      }
    ],
    deprecated: false
  }
});
```

### Hide Route from Documentation

```ts
await amazon.api("/internal/health", async () => {
  return { status: "ok" };
}, {
  detail: { hide: true }  // Won't appear in OpenAPI UI
});
```

### Mark Route as Deprecated

```ts
await amazon.api("/old-endpoint", async () => {
  return { message: "Use /new-endpoint instead" };
}, {
  detail: { deprecated: true }
});
```

### Detail Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `tags` | `string[]` | Groups routes in the UI. Defaults to site name. |
| `summary` | `string` | Short one-line description shown in route list |
| `description` | `string` | Longer description shown when route is expanded |
| `parameters` | `RouteParameter[]` | Query/path params shown as input fields in UI |
| `deprecated` | `boolean` | Marks route as deprecated in the UI |
| `hide` | `boolean` | Hides route from the UI entirely |

### Parameter Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Parameter name — must match what you read from `query.name` |
| `in` | `"query" \| "path" \| "header" \| "cookie"` | Where the parameter is located |
| `description` | `string` | Shown as a hint in the UI |
| `required` | `boolean` | Marks parameter as required |
| `schema` | `object` | OpenAPI schema (type, default, minimum, maximum, format, etc.) |

### Schema Options

```ts
schema: {
  type: "string",           // string, integer, number, boolean, array, object
  default: "laptop",        // Default value
  minimum: 1,               // For numbers/integers
  maximum: 100,             // For numbers/integers
  format: "email",          // email, uuid, date-time, etc.
  enum: ["asc", "desc"],    // Allowed values
  pattern: "^[a-z]+$"       // Regex pattern for strings
}
```

---

## ⚠️ OpenAPI UI Warning

The OpenAPI UI (available at `/openapi`) currently has a known issue: **it sends multiple requests to your endpoints** when you try them from the browser.

For example, if you test a paginated endpoint from the UI:
- It might request page 1, 2, 3, 4, 2, 3, 1, 3, 4, 5 in random order
- This can cause your scraper to navigate erratically and waste resources

### Current Workaround

**Don't use the interactive UI for testing.** Use `curl` or your API client instead:

```bash
# ✅ Good: Single request from curl
curl "http://localhost:3000/amazon/search?q=laptop&pages=3"

# ❌ Bad: May send multiple requests from OpenAPI UI
# http://localhost:3000/openapi - clicking "Try it out" may spam requests
```

### If the UI Starts Spamming Requests

```bash
# Stop the server immediately
# Press Ctrl+C in your terminal

# Restart and avoid using the UI
bun run your-script.ts

# Use curl for testing instead
curl "http://localhost:3000/your-endpoint"
```

### Coming Soon: Nothing UI

The issue will be fixed when we release **Nothing UI** — our own API documentation library designed specifically for Piggy.

- ✅ Single request per test
- ✅ No random pagination loops
- ✅ Proper request queueing
- ✅ Respects your scraper's state

**ETA:** Next major release

### For Now

| Do ✅ | Don't ❌ |
|------|---------|
| Use `curl` for testing | Use the OpenAPI UI "Try it out" button |
| Use Postman/Insomnia | Refresh the UI page multiple times |
| Write automated tests | Leave the UI page open while testing |

The OpenAPI spec JSON (`/openapi/json`) is still safe to use with other API clients.

---

## Real-World Examples

### 1. Complete Product API with Documentation

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

const { amazon } = usePiggy<"amazon">();

// Search endpoint with full documentation
await amazon.api("/products/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  const sort = query.sort ?? "relevance";
  const limit = Math.min(parseInt(query.limit) ?? 20, 50);
  
  await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(term)}`);
  await amazon.waitForSelector("[data-asin]");
  
  const products = await amazon.evaluate(() =>
    Array.from(document.querySelectorAll("[data-asin]")).slice(0, limit).map(el => ({
      asin: el.getAttribute("data-asin"),
      title: el.querySelector("h2 span")?.textContent,
      price: el.querySelector(".a-price-whole")?.textContent,
      rating: el.querySelector(".a-icon-alt")?.textContent
    }))
  );
  
  return { term, sort, limit, count: products.length, products };
}, {
  ttl: 30000,
  detail: {
    tags: ["Amazon", "Products"],
    summary: "Search Amazon products",
    description: "Search for products on Amazon by keyword. Returns product details including ASIN, title, price, and rating.",
    parameters: [
      {
        name: "q",
        in: "query",
        description: "Search term",
        required: true,
        schema: { type: "string", example: "wireless headphones" }
      },
      {
        name: "sort",
        in: "query",
        description: "Sort order",
        required: false,
        schema: { type: "string", enum: ["relevance", "price_asc", "price_desc"], default: "relevance" }
      },
      {
        name: "limit",
        in: "query",
        description: "Maximum number of results",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 50, default: 20 }
      }
    ]
  }
});

// Product details endpoint
await amazon.api("/products/:asin", async (params) => {
  const asin = params.asin;
  
  await amazon.navigate(`https://www.amazon.com/dp/${asin}`);
  await amazon.waitForSelector("#productTitle");
  
  const product = await amazon.evaluate(() => ({
    asin: window.location.pathname.match(/\/dp\/([A-Z0-9]+)/)?.[1],
    title: document.querySelector("#productTitle")?.textContent?.trim(),
    price: document.querySelector(".a-price-whole")?.textContent,
    description: document.querySelector("#productDescription")?.textContent?.trim(),
    features: Array.from(document.querySelectorAll("#feature-bullets li")).map(li => li.textContent?.trim())
  }));
  
  return product;
}, {
  ttl: 60000,
  detail: {
    tags: ["Amazon", "Products"],
    summary: "Get product details by ASIN",
    description: "Retrieve detailed information about a specific Amazon product using its ASIN.",
    parameters: [
      {
        name: "asin",
        in: "path",
        description: "Amazon Standard Identification Number",
        required: true,
        schema: { type: "string", pattern: "^[A-Z0-9]{10}$", example: "B09X5Y8Z7W" }
      }
    ]
  }
});

// Start server with OpenAPI config
await piggy.serve(3000, {
  title: "Amazon Product API",
  version: "2.0.0",
  description: "Unofficial Amazon product data API. Scrapes product information in real-time."
});

console.log("📚 API Docs: http://localhost:3000/openapi");
console.log("⚠️ Use curl for testing - UI may send multiple requests");
console.log("📋 Raw Spec: http://localhost:3000/openapi/json");
```

### 2. Multi-Site API with Tags

```ts
await piggy.register("amazon", "https://amazon.com");
await piggy.register("ebay", "https://ebay.com");
await piggy.register("walmart", "https://walmart.com");

const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

// Each site's routes are grouped by the `tags` field
await amazon.api("/search", handler, {
  detail: { tags: ["Amazon"], summary: "Search Amazon" }
});

await ebay.api("/search", handler, {
  detail: { tags: ["eBay"], summary: "Search eBay" }
});

await walmart.api("/search", handler, {
  detail: { tags: ["Walmart"], summary: "Search Walmart" }
});

await piggy.serve(3000, {
  title: "Multi-Site Shopping API",
  version: "1.0.0",
  description: "Aggregated product search across Amazon, eBay, and Walmart"
});
```

### 3. API with Authentication (Documented)

```ts
const apiKeyAuth = async ({ headers, set }: any) => {
  const key = headers["x-api-key"];
  if (!key || key !== process.env.API_KEY) {
    set.status = 401;
    throw new Error("Invalid API key");
  }
};

await amazon.api("/protected/data", async () => {
  return { sensitive: "data" };
}, {
  before: [apiKeyAuth],
  detail: {
    summary: "Get protected data",
    description: "Requires API key in X-API-Key header",
    parameters: [
      {
        name: "X-API-Key",
        in: "header",
        description: "Your API key",
        required: true,
        schema: { type: "string" }
      }
    ]
  }
});
```

### 4. Screenshot API

```ts
await piggy.register("capture", "https://example.com");

await piggy.capture.api("/screenshot", async (params, query) => {
  const url = query.url;
  const fullPage = query.fullPage === "true";
  
  if (!url) {
    throw new Error("Missing url parameter");
  }
  
  await piggy.capture.navigate(url);
  await piggy.capture.wait(2000); // Wait for load
  
  let screenshot;
  if (fullPage) {
    // Full page screenshot (requires scrolling)
    screenshot = await captureFullPage(piggy.capture);
  } else {
    screenshot = await piggy.capture.screenshot();
  }
  
  return {
    url,
    fullPage,
    screenshot: screenshot, // base64
    capturedAt: Date.now()
  };
}, { ttl: 0 }); // No cache for live screenshots

// GET /capture/screenshot?url=https://example.com&fullPage=true
```

---

## Server Management

### Start Server with OpenAPI

```ts
// Basic
await piggy.serve(3000);

// With OpenAPI metadata
await piggy.serve(3000, {
  title: "My API",
  version: "1.0.0",
  description: "API description"
});

// Custom hostname
await piggy.serve(3000, { 
  hostname: "0.0.0.0",  // Allow external connections
  title: "Public API",
  version: "1.0.0"
});
```

### Serve Options

```ts
interface ServeOptions {
  hostname?: string;    // Default: "localhost"
  title?: string;       // API title for OpenAPI
  version?: string;     // API version for OpenAPI
  description?: string; // API description for OpenAPI
}
```

### Stop Server

```ts
await piggy.stopServer();
```

### List All Routes

```ts
const routes = piggy.routes();
console.log(routes);

// Output:
// [
//   { site: "amazon", method: "GET", path: "/amazon/search", ttl: 30000, middlewareCount: 0 },
//   { site: "amazon", method: "GET", path: "/amazon/products/:asin", ttl: 60000, middlewareCount: 0 }
// ]
```

### Keep Site Alive

```ts
// Without this, the site closes when piggy.close() is called
await piggy.books.noclose();

// Now piggy.close() won't close this site
await piggy.close(); // books stays alive
```

---

## Health Check

The server automatically provides a health check endpoint:

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1700000000000,
  "uptime": 123.456
}
```

---

## Complete Example: Full API Service with OpenAPI

```ts
import piggy, { usePiggy } from "nothing-browser";

// Launch browser
await piggy.launch({ mode: "tab", binary: "headless" });

// Register site with tab pooling
await piggy.register("scraper", "https://books.toscrape.com", { pool: 3 });

const { scraper } = usePiggy<"scraper">();

// Enable human mode
piggy.actHuman(true);

// Search endpoint
await scraper.api("/search", async (_params, query) => {
  const term = query.q ?? "";
  const page = parseInt(query.page) ?? 1;
  
  await scraper.navigate(`https://books.toscrape.com/catalogue/page-${page}.html`);
  
  if (term) {
    await scraper.type("#search", term);
    await scraper.click("#search-btn");
    await scraper.waitForSelector(".product_pod");
  }
  
  const results = await scraper.evaluate(() => 
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent
    }))
  );
  
  await scraper.store(results); // Save to storage
  
  return { term, page, count: results.length, results };
}, {
  ttl: 60000,
  detail: {
    tags: ["Books"],
    summary: "Search books",
    description: "Search for books by title or keyword",
    parameters: [
      { name: "q", in: "query", description: "Search term", schema: { type: "string" } },
      { name: "page", in: "query", description: "Page number", schema: { type: "integer", default: 1 } }
    ]
  }
});

// Product details endpoint
await scraper.api("/product/:id", async (params) => {
  const id = params.id;
  
  await scraper.navigate(`https://books.toscrape.com/catalogue/product-${id}.html`);
  await scraper.waitForSelector(".product_main");
  
  const product = await scraper.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    price: document.querySelector(".price_color")?.textContent,
    description: document.querySelector("#product_description")?.nextElementSibling?.textContent,
    upc: Array.from(document.querySelectorAll("th")).find(th => th.textContent === "UPC")?.nextElementSibling?.textContent
  }));
  
  return product;
}, {
  ttl: 300000,
  detail: {
    tags: ["Books"],
    summary: "Get book details",
    description: "Retrieve detailed information about a specific book",
    parameters: [
      { name: "id", in: "path", description: "Book ID", required: true, schema: { type: "integer" } }
    ]
  }
});

// Stats endpoint
await scraper.api("/stats", async () => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pool: scraper.poolStats(),
    timestamp: Date.now()
  };
}, {
  detail: {
    tags: ["System"],
    summary: "Get scraper statistics",
    description: "Returns uptime, memory usage, and pool status"
  }
});

// Start server with OpenAPI
await piggy.serve(process.env.PORT || 3000, {
  hostname: "0.0.0.0",
  title: "Books Scraper API",
  version: "2.0.0",
  description: "Unofficial Books to Scrape API - product search and details"
});

console.log(`🚀 API server running on port ${process.env.PORT || 3000}`);
console.log(`⚠️ OpenAPI UI available but may send multiple requests - use curl for testing`);
console.log(`✅ Safe OpenAPI spec: http://localhost:${process.env.PORT || 3000}/openapi/json`);
console.log(`✅ Use curl: curl http://localhost:${process.env.PORT || 3000}/scraper/search?q=books`);
console.log(`📋 Routes:`, piggy.routes());

// Keep alive
await scraper.noclose();
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `site.api(path, handler, opts?)` | Create API endpoint |
| `piggy.serve(port, opts?)` | Start HTTP server with OpenAPI |
| `piggy.stopServer()` | Stop HTTP server |
| `piggy.routes()` | List all registered routes |
| `site.noclose()` | Keep site alive when piggy closes |

### API Options

```ts
interface APIOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;                                 // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;       // Middleware functions
  detail?: RouteDetail;                         // OpenAPI documentation
  timeout?: number;                             // Request timeout in ms
}
```

### Serve Options

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

### RouteParameter

```ts
interface RouteParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  schema: {
    type: "string" | "integer" | "number" | "boolean" | "array" | "object";
    default?: any;
    minimum?: number;
    maximum?: number;
    format?: string;
    enum?: any[];
    pattern?: string;
    example?: any;
  };
}
```

---

## Next Steps

- [Multi-Site Parallel](./multi-site) — Run multiple sites simultaneously
- [Middleware](./middleware) — Advanced middleware patterns
- [Data Storage](./data-storage) — Save scraped data with validation
- [Tab Pooling](./tab-pooling) — Handle concurrent requests

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
