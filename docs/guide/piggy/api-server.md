# 🚀 Built-in API Server

Turn your scraper into a REST API with one line of code. Automatically generate endpoints from your scraping logic with built-in caching and middleware support.

---

## Overview

The built-in API server uses Elysia.js to turn Piggy sites into HTTP endpoints. Perfect for:

- Exposing scraped data as an API
- Building web dashboards
- Creating microservices from browser automation

| Feature | Description |
|---------|-------------|
| **Auto-routing** | Routes generated from `api()` calls |
| **Caching** | Built-in TTL cache for responses |
| **Middleware** | Auth, logging, rate limiting |
| **Auto-start** | Server starts with `serve()` |

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

## Real-World Examples

### 1. Product Search API

```ts
await piggy.register("shop", "https://books.toscrape.com");

await piggy.shop.api("/products", async (params, query) => {
  const category = query.category || "all";
  const sortBy = query.sort || "title";
  const limit = parseInt(query.limit) || 20;
  const page = parseInt(query.page) || 1;
  
  const url = category === "all"
    ? `https://books.toscrape.com/catalogue/page-${page}.html`
    : `https://books.toscrape.com/catalogue/category/books/${category}_${page}/index.html`;
  
  await piggy.shop.navigate(url);
  await piggy.shop.waitForSelector(".product_pod");
  
  let products = await piggy.shop.evaluate(() => 
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      id: el.querySelector("h3 a")?.getAttribute("href")?.match(/\d+/)?.[0],
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent,
      rating: el.querySelector(".star-rating")?.className.match(/star-rating (\w+)/)?.[1],
      inStock: (el.querySelector(".availability")?.textContent || "").includes("In stock")
    }))
  );
  
  // Sort
  if (sortBy === "price") {
    products.sort((a, b) => parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1)));
  } else if (sortBy === "title") {
    products.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }
  
  // Limit
  products = products.slice(0, limit);
  
  return {
    page,
    category,
    sortBy,
    count: products.length,
    products
  };
}, { ttl: 30000 });

// GET /shop/products?category=travel&sort=price&limit=10&page=2
```

### 2. Live Stock Checker API

```ts
await piggy.register("store", "https://example-store.com");

await piggy.store.api("/stock/:sku", async (params) => {
  const sku = params.sku;
  
  await piggy.store.navigate(`https://example-store.com/product/${sku}`);
  await piggy.store.waitForSelector(".product-info");
  
  const stockInfo = await piggy.store.evaluate(() => {
    const stockElement = document.querySelector(".stock-status");
    const priceElement = document.querySelector(".price");
    
    return {
      inStock: stockElement?.textContent?.includes("In Stock") || false,
      stockCount: parseInt(stockElement?.textContent?.match(/\d+/)?.[0] || "0"),
      price: priceElement?.textContent,
      lastChecked: Date.now()
    };
  });
  
  // Send alert if low stock
  if (stockInfo.inStock && stockInfo.stockCount < 10) {
    await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ sku, stock: stockInfo.stockCount })
    });
  }
  
  return stockInfo;
}, { ttl: 10000 }); // Check every 10 seconds max

// GET /store/stock/ABC123
```

### 3. Multi-Site Aggregator API

```ts
await piggy.launch({ mode: "process" });

await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("walmart", "https://www.walmart.com");

// Aggregate endpoint that searches all sites
await piggy.all([piggy.amazon, piggy.ebay, piggy.walmart]).api("/search/all", async (params, query) => {
  const searchTerm = query.q;
  
  const results = await Promise.all([
    searchSite(piggy.amazon, searchTerm),
    searchSite(piggy.ebay, searchTerm),
    searchSite(piggy.walmart, searchTerm)
  ]);
  
  return {
    query: searchTerm,
    timestamp: Date.now(),
    results: {
      amazon: results[0],
      ebay: results[1],
      walmart: results[2]
    }
  };
}, { ttl: 60000 });

async function searchSite(site: any, term: string) {
  await site.navigate(`https://${site._name}.com/search?q=${encodeURIComponent(term)}`);
  await site.waitForSelector(".search-results");
  
  return await site.evaluate(() => 
    Array.from(document.querySelectorAll(".product")).slice(0, 5).map(el => ({
      title: el.querySelector(".title")?.textContent,
      price: el.querySelector(".price")?.textContent
    }))
  );
}

// GET /search/all?q=laptop
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

### 5. Dashboard with Multiple Endpoints

```ts
await piggy.register("dashboard", "https://analytics.example.com");

// Auth middleware for all dashboard endpoints
const auth = async ({ headers, set }: any) => {
  const token = headers.authorization?.replace("Bearer ", "");
  if (!token || token !== process.env.DASHBOARD_TOKEN) {
    set.status = 401;
    throw new Error("Unauthorized");
  }
};

// Stats endpoint
await piggy.dashboard.api("/stats", async () => {
  await piggy.dashboard.navigate("https://analytics.example.com/dashboard");
  await piggy.dashboard.waitForSelector(".stats");
  
  return await piggy.dashboard.evaluate(() => ({
    visitors: document.querySelector(".visitors")?.textContent,
    pageviews: document.querySelector(".pageviews")?.textContent,
    bounceRate: document.querySelector(".bounce-rate")?.textContent
  }));
}, { before: [auth], ttl: 30000 });

// Recent activity endpoint
await piggy.dashboard.api("/activity", async () => {
  await piggy.dashboard.navigate("https://analytics.example.com/recent");
  
  return await piggy.dashboard.evaluate(() => 
    Array.from(document.querySelectorAll(".activity-item")).slice(0, 20).map(el => ({
      user: el.querySelector(".user")?.textContent,
      action: el.querySelector(".action")?.textContent,
      time: el.querySelector(".time")?.textContent
    }))
  );
}, { before: [auth], ttl: 15000 });

// Export endpoint
await piggy.dashboard.api("/export/csv", async () => {
  await piggy.dashboard.navigate("https://analytics.example.com/export");
  const csvData = await piggy.dashboard.fetchText(".export-data");
  return { csv: csvData };
}, { before: [auth], ttl: 60000 });

// Start server
await piggy.serve(3000);
```

---

## Server Management

### Start Server

```ts
// Default: localhost:3000
await piggy.serve(3000);

// Custom hostname
await piggy.serve(3000, { hostname: "0.0.0.0" }); // Allow external connections
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
//   { site: "books", method: "GET", path: "/books/list", ttl: 30000, middlewareCount: 0 },
//   { site: "books", method: "GET", path: "/books/search", ttl: 0, middlewareCount: 2 },
//   { site: "shop", method: "GET", path: "/shop/products", ttl: 30000, middlewareCount: 0 }
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

## Cache Management

```bash
# List all cached items
GET /cache/keys

# Clear all cache
DELETE /cache
```

---

## Complete Example: Full API Service

```ts
import piggy from "nothing-browser";

// Launch browser
await piggy.launch({ mode: "tab" });
await piggy.register("scraper", "https://books.toscrape.com");

// Auth middleware
const requireAuth = async ({ headers, set }: any) => {
  const key = headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    set.status = 401;
    throw new Error("Invalid API key");
  }
};

// Search endpoint
await piggy.scraper.api("/search", async (params, query) => {
  const term = query.q;
  const page = parseInt(query.page) || 1;
  
  await piggy.scraper.navigate(`https://books.toscrape.com/catalogue/page-${page}.html`);
  
  if (term) {
    await piggy.scraper.type("#search", term);
    await piggy.scraper.click("#search-btn");
    await piggy.scraper.waitForSelector(".product_pod");
  }
  
  const results = await piggy.scraper.evaluate(() => 
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent
    }))
  );
  
  return { term, page, count: results.length, results };
}, { before: [requireAuth], ttl: 60000 });

// Product details endpoint
await piggy.scraper.api("/product/:id", async (params) => {
  const id = params.id;
  
  await piggy.scraper.navigate(`https://books.toscrape.com/catalogue/product-${id}.html`);
  await piggy.scraper.waitForSelector(".product_main");
  
  const product = await piggy.scraper.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    price: document.querySelector(".price_color")?.textContent,
    description: document.querySelector("#product_description")?.nextElementSibling?.textContent,
    upc: Array.from(document.querySelectorAll("th")).find(th => th.textContent === "UPC")?.nextElementSibling?.textContent
  }));
  
  return product;
}, { before: [requireAuth], ttl: 300000 }); // Cache for 5 minutes

// Screenshot endpoint
await piggy.scraper.api("/screenshot/:id", async (params) => {
  const id = params.id;
  
  await piggy.scraper.navigate(`https://books.toscrape.com/catalogue/product-${id}.html`);
  await piggy.scraper.wait(1000);
  
  const screenshot = await piggy.scraper.screenshot();
  return { id, screenshot };
}, { before: [requireAuth], ttl: 0 });

// Start server
await piggy.serve(process.env.PORT || 3000, { hostname: "0.0.0.0" });
console.log(`🚀 API server running on port ${process.env.PORT || 3000}`);
console.log(`📋 Routes:`, piggy.routes());

// Keep alive
await piggy.scraper.noclose();
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `site.api(path, handler, opts?)` | Create API endpoint |
| `piggy.serve(port, opts?)` | Start HTTP server |
| `piggy.stopServer()` | Stop HTTP server |
| `piggy.routes()` | List all registered routes |
| `site.noclose()` | Keep site alive when piggy closes |

### API Options

```ts
interface APIOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;                                 // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;       // Middleware functions
}
```

---

## Next Steps

- [Multi-Site Parallel](./multi-site) — Run multiple sites simultaneously
- [Middleware](./middleware) — Advanced middleware patterns
- [Full API Reference](./api-reference) — Complete API documentation

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
