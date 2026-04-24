# Piggy Quick Start

## What run time should i use 
nothing browser(piggy) is bun focused mainly as thatis the runtime i only use for the speed but you can also use nodejs everything is node compatible so if you dont use bun then simply in bun command just put node soecifics 


Get your first scraper running in under 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0 installed (or Node.js ≥ 18)
- Nothing Browser binary in your project root

## Installation

```bash
bun add nothing-browser
```

## Download the Binary

Download the headless binary for your platform from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases) and place it in your project root.

| Platform | Binary Name |
|----------|-------------|
| Linux | `nothing-browser-headless` |
| Windows | `nothing-browser-headless.exe` |
| macOS | `nothing-browser-headless` |

Make it executable (Linux/macOS):

```bash
chmod +x nothing-browser-headless
```

---

## Your First Scraper

Create `scrape.ts`:

```ts
import piggy from "nothing-browser";

// Launch the browser
await piggy.launch({ mode: "tab" });

// Register a site
await piggy.register("books", "https://books.toscrape.com");

// Navigate to the page
await piggy.books.navigate();

// Wait for content to load
await piggy.books.waitForSelector(".product_pod");

// Extract data
const books = await piggy.books.evaluate(() =>
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
    rating: (() => {
      const ratingClass = el.querySelector(".star-rating")?.className ?? "";
      const ratingMap: Record<string, number> = {
        "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5,
      };
      const key = ratingClass.replace("star-rating", "").trim();
      return ratingMap[key] ?? 0;
    })(),
    availability: el.querySelector(".availability")?.textContent?.trim() ?? "",
  }))
);

// Print results
console.log(`Found ${books.length} books:`);
console.log(books.slice(0, 5));

// Close the browser
await piggy.close();
```

## Run It

```bash
bun run scrape.ts
```

You should see output like:

```
Found 20 books:
[
  {
    title: "A Light in the Attic",
    price: "£51.77",
    rating: 3,
    availability: "In stock"
  },
  {
    title: "Tipping the Velvet",
    price: "£53.74",
    rating: 1,
    availability: "In stock"
  },
  ...
]
```

---

## With Human Mode (Avoid Detection)

Add natural human-like behavior:

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Enable human mode globally
piggy.actHuman(true);

await piggy.register("books", "https://books.toscrape.com");
await piggy.books.navigate();

// These actions will have random delays and natural patterns
await piggy.books.wait(500);  // random between 300-800ms
await piggy.books.click(".product_pod h3 a");
await piggy.books.scroll.by(400);

const title = await piggy.books.title();
console.log("Current page:", title);

await piggy.close();
```

---

## With Session Persistence (Stay Logged In)

Save and restore cookies, storage, and state:

```ts
import piggy from "nothing-browser";
import { existsSync, readFileSync, writeFileSync } from "fs";

const SESSION_FILE = "./session.json";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Load previous session if exists
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.site.session.import(saved);
  console.log("Session restored");
}

await piggy.site.navigate();
await piggy.site.click("#login-button");
// ... do authenticated things ...

// Save session on exit
process.on("SIGINT", async () => {
  const session = await piggy.site.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("Session saved");
  await piggy.close();
  process.exit(0);
});
```

---

## With exposeFunction (RPC)

Call Node.js functions directly from browser JavaScript:

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Expose a Node.js function to the browser
await piggy.app.exposeFunction("saveToDatabase", async (data) => {
  console.log("Saving:", data);
  // Save to your database
  await db.users.insert(data);
  return { success: true, id: crypto.randomUUID() };
});

// Inject browser code that calls the exposed function
await piggy.app.evaluate(() => {
  document.querySelector("#submit").addEventListener("click", async () => {
    const result = await window.saveToDatabase({
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
    });
    console.log("Saved with ID:", result.id);
  });
});

await piggy.app.navigate();
```

---

## Production-Ready API Server (Complete Example)

This example combines **all** Piggy features into a single production-ready API:

- ✅ Tab pooling for concurrent requests
- ✅ Type safety with `usePiggy`
- ✅ Data persistence with `site.store()`
- ✅ OpenAPI documentation
- ✅ Human mode for anti-detection
- ✅ Error handling

### Step 1: Create Schema File

Create `piggy.store.json` in your project root:

```json
{
  "stores": [
    {
      "name": "products",
      "destination": "./data/products.json",
      "fields": {
        "title": { "type": "string" },
        "price": { "type": "string" },
        "rating": { "type": "number", "default": 0 },
        "availability": { "type": "string" },
        "scrapedAt": { "type": "number" }
      }
    }
  ]
}
```

### Step 2: Create API Server

Create `api.ts`:

```ts
import piggy, { usePiggy } from "nothing-browser";
import { existsSync, mkdirSync } from "fs";

// Ensure data directory exists
if (!existsSync("./data")) {
  mkdirSync("./data");
}

// Launch browser with headless mode
await piggy.launch({ mode: "tab", binary: "headless" });

// Register site with tab pooling (3 concurrent requests)
await piggy.register("scraper", "https://books.toscrape.com", { pool: 3 });

// Enable human mode for anti-detection
piggy.actHuman(true);

// Get typed access
const { scraper } = usePiggy<"scraper">();

// ============================================
// Search Endpoint
// ============================================
await scraper.api("/search", async (_params, query) => {
  const term = query.q ?? "";
  const page = parseInt(query.page) ?? 1;
  
  console.log(`🔍 Searching: "${term}" page ${page}`);
  
  // Navigate to search page
  if (term) {
    await scraper.navigate(`https://books.toscrape.com/catalogue/page-${page}.html`);
    await scraper.type("#search", term);
    await scraper.click("#search-btn");
  } else {
    await scraper.navigate(`https://books.toscrape.com/catalogue/page-${page}.html`);
  }
  
  await scraper.waitForSelector(".product_pod");
  
  // Extract data
  const results = await scraper.evaluate(() =>
    Array.from(document.querySelectorAll(".product_pod")).map(el => {
      const ratingClass = el.querySelector(".star-rating")?.className ?? "";
      const ratingMap: Record<string, number> = {
        "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5
      };
      const ratingKey = ratingClass.replace("star-rating", "").trim();
      
      return {
        title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
        price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
        rating: ratingMap[ratingKey] ?? 0,
        availability: el.querySelector(".availability")?.textContent?.trim() ?? "",
        scrapedAt: Date.now()
      };
    })
  );
  
  // Store data with validation
  const storeResult = await scraper.store(results);
  console.log(`💾 Stored ${storeResult.stored} products, skipped ${storeResult.skipped}`);
  
  return {
    term: term || "all",
    page,
    count: results.length,
    stored: storeResult.stored,
    results
  };
}, {
  ttl: 60000, // Cache for 1 minute
  detail: {
    tags: ["Products"],
    summary: "Search for books",
    description: "Search for books by keyword or browse all products",
    parameters: [
      {
        name: "q",
        in: "query",
        description: "Search term (leave empty for all products)",
        required: false,
        schema: { type: "string", example: "python" }
      },
      {
        name: "page",
        in: "query",
        description: "Page number",
        required: false,
        schema: { type: "integer", default: 1, minimum: 1 }
      }
    ]
  }
});

// ============================================
// Product Details Endpoint
// ============================================
await scraper.api("/product/:id", async (params) => {
  const id = params.id;
  
  console.log(`📖 Fetching product: ${id}`);
  
  await scraper.navigate(`https://books.toscrape.com/catalogue/product-${id}.html`);
  await scraper.waitForSelector(".product_main");
  
  const product = await scraper.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim() ?? "",
    price: document.querySelector(".price_color")?.textContent?.trim() ?? "",
    description: document.querySelector("#product_description")?.nextElementSibling?.textContent?.trim() ?? "",
    upc: (() => {
      const ths = Array.from(document.querySelectorAll("th"));
      const upcTh = ths.find(th => th.textContent === "UPC");
      return upcTh?.nextElementSibling?.textContent ?? "";
    })(),
    availability: document.querySelector(".availability")?.textContent?.trim() ?? "",
    scrapedAt: Date.now()
  }));
  
  // Store individual product
  await scraper.store([product]);
  
  return product;
}, {
  ttl: 300000, // Cache for 5 minutes
  detail: {
    tags: ["Products"],
    summary: "Get product details",
    description: "Retrieve detailed information about a specific book",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "Product ID",
        required: true,
        schema: { type: "integer", example: 1000 }
      }
    ]
  }
});

// ============================================
// Stats Endpoint
// ============================================
await scraper.api("/stats", async () => {
  const poolStats = scraper.poolStats();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    pool: poolStats,
    humanMode: true,
    timestamp: Date.now()
  };
}, {
  detail: {
    tags: ["System"],
    summary: "Get scraper statistics",
    description: "Returns uptime, memory usage, and pool status"
  }
});

// ============================================
// Health Check Endpoint
// ============================================
await scraper.api("/health", async () => {
  const poolStats = scraper.poolStats();
  const healthy = poolStats.queued < 10;
  
  return {
    status: healthy ? "ok" : "degraded",
    healthy,
    pool: poolStats,
    timestamp: Date.now()
  };
}, {
  detail: {
    tags: ["System"],
    summary: "Health check",
    description: "Check if the API is operational",
    hide: false
  }
});

// ============================================
// Start Server
// ============================================
const PORT = parseInt(process.env.PORT || "3000");

await piggy.serve(PORT, {
  hostname: "0.0.0.0",
  title: "Books Scraper API",
  version: "1.0.0",
  description: "Unofficial Books to Scrape API - Product search, details, and scraping"
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 Books Scraper API                      ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                  ║
║                                                              ║
║  Endpoints:                                                  ║
║  • GET  /scraper/search?q=keyword&page=1    Search books    ║
║  • GET  /scraper/product/:id                Product details ║
║  • GET  /scraper/stats                      Statistics      ║
║  • GET  /scraper/health                     Health check    ║
║                                                              ║
║  📚 OpenAPI UI:   http://localhost:${PORT}/openapi            ║
║  ⚠️  Use curl for testing - UI may send multiple requests    ║
║  📋 Raw Spec:     http://localhost:${PORT}/openapi/json       ║
║                                                              ║
║  💾 Data saved to: ./data/products.json                     ║
║  🏊 Pool size: 3 tabs                                       ║
║  🧠 Human mode: enabled                                     ║
╚══════════════════════════════════════════════════════════════╝
`);

// Keep the site alive
scraper.noclose();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await piggy.close();
  process.exit(0);
});
```

### Step 3: Run the API Server

```bash
bun run api.ts
```

### Step 4: Test the API

```bash
# Search for books
curl "http://localhost:3000/scraper/search?q=python&page=1"

# Get product details
curl "http://localhost:3000/scraper/product/1000"

# Check stats
curl "http://localhost:3000/scraper/stats"

# Health check
curl "http://localhost:3000/scraper/health"
```

### Step 5: View Saved Data

```bash
# Check stored products
cat ./data/products.json | jq '.'
```

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Deep dive into browser → Node.js calls
- [Request Interception](./interception) — Mock APIs, cache responses, block trackers
- [Multi-Site Parallel](./multi-site) — Scrape multiple sites simultaneously
- [Tab Pooling](./tab-pooling) — Handle concurrent requests with pooled tabs
- [Data Storage](./data-storage) — Schema-driven data persistence
- [Built-in API Server](./api-server) — Complete API server with OpenAPI

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
