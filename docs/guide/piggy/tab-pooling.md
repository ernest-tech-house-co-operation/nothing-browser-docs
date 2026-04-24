Here's the complete `tab-pooling.md`:

```markdown
# 🏊 Tab Pooling — Concurrent Requests

Handle multiple simultaneous requests to the same site without collisions. Perfect for API servers handling concurrent traffic.

---

## Overview

By default, each registered site gets **ONE tab**. If multiple API requests hit the same site simultaneously, they collide — one navigates while another is mid-scrape, causing race conditions and failed requests.

Tab pooling gives each site a pool of tabs. Concurrent requests each get their own tab. Requests beyond pool size queue and wait for a free tab.

```
Without Pooling (Default):        With Pooling (pool: 3):
─────────────────────            ─────────────────────
Request 1 ──► Tab 1               Request 1 ──► Tab 1
Request 2 ──► Tab 1 (collision!)  Request 2 ──► Tab 2
Request 3 ──► Tab 1 (collision!)  Request 3 ──► Tab 3
                                  Request 4 ──► Queue (waits)
```

---

## Basic Usage

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Single tab (default) — requests serialize
await piggy.register("amazon", "https://www.amazon.com");

// Pool of 3 tabs — 3 concurrent requests supported
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

// Pool of 5 tabs — for heavy traffic
await piggy.register("amazon", "https://www.amazon.com", { pool: 5 });
```

---

## Check Pool Status

Monitor your pool at runtime:

```ts
const { amazon } = usePiggy<"amazon">();

// Get current pool statistics
const stats = amazon.poolStats();
console.log(stats);
// { idle: 2, busy: 1, queued: 0, total: 3 }
```

### Pool Stats Object

| Field | Description |
|-------|-------------|
| `idle` | Free tabs ready for use |
| `busy` | Tabs currently handling requests |
| `queued` | Requests waiting for a free tab |
| `total` | Total pool size (idle + busy) |

### Real-time Monitoring

```ts
// Log pool status every 5 seconds
setInterval(() => {
  const stats = amazon.poolStats();
  console.log(`[Pool] ${stats.idle}/${stats.total} idle, ${stats.queued} queued`);
}, 5000);

// Alert if queue gets too long
setInterval(() => {
  const stats = amazon.poolStats();
  if (stats.queued > 10) {
    console.warn(`⚠️ Pool queue length: ${stats.queued}`);
  }
}, 10000);
```

---

## When to Use Pooling

| Scenario | Recommended Pool Size | Why |
|----------|----------------------|-----|
| **Single user, sequential scraping** | 1 (default) | No concurrency needed |
| **Local development** | 1 | Keep it simple |
| **API server, light traffic (<10 req/sec)** | 2–3 | Handle occasional concurrency |
| **API server, medium traffic (10-50 req/sec)** | 4–6 | Balance performance and memory |
| **API server, heavy traffic (>50 req/sec)** | 6–10 | High concurrency |
| **Production load** | 8+ | Maximum throughput |

### Performance Impact

| Pool Size | Memory Usage | Max Concurrent | Best For |
|-----------|--------------|----------------|----------|
| 1 | Low | 1 | Sequential tasks |
| 2-3 | Medium | 2-3 | Light API traffic |
| 4-6 | High | 4-6 | Production APIs |
| 8+ | Very High | 8+ | Heavy concurrent load |

> **Warning:** Each tab opens a real browser tab and consumes memory. Don't set pool sizes unnecessarily high. Start small and monitor.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Request                             │
│                    GET /amazon/search?q=laptop                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Tab Pool (size: 3)                         │
│                                                                 │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────────┐               │
│   │ Tab1 │  │ Tab2 │  │ Tab3 │  │ Queue (FIFO) │               │
│   │ BUSY │  │ IDLE │  │ IDLE │  │   Request 4  │               │
│   └──────┘  └──────┘  └──────┘  │   Request 5  │               │
│                                  └──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Request Execution                          │
│                                                                 │
│   1. Request arrives                                            │
│   2. Grab first idle tab (or queue if none)                     │
│   3. Execute navigation/scraping                                │
│   4. Release tab back to pool                                   │
│   5. Next queued request takes the tab                          │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Request arrives** at your API endpoint
2. **Pool checks for idle tab** - if available, grabs it immediately
3. **No idle tab available** - request goes to FIFO queue
4. **Tab completes work** - releases back to pool
5. **Queue processed** - next waiting request gets the freed tab

---

## Complete API Server Example

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });

// Register with pool of 4 tabs for concurrent requests
await piggy.register("amazon", "https://www.amazon.com", { pool: 4 });

const { amazon } = usePiggy<"amazon">();

// Enable human mode for all tabs
piggy.actHuman(true);

// API endpoint that uses the pool
await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  const pages = parseInt(query.pages) ?? 3;
  
  // This runs in its own tab from the pool
  // Multiple concurrent requests each get their own tab
  const results = [];
  
  for (let page = 1; page <= pages; page++) {
    await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(term)}&page=${page}`);
    await amazon.wait(2000);
    
    const pageResults = await amazon.evaluate(() =>
      Array.from(document.querySelectorAll("[data-asin]")).map(el => ({
        asin: el.getAttribute("data-asin"),
        title: el.querySelector("h2 span")?.textContent,
        price: el.querySelector(".a-price-whole")?.textContent,
      }))
    );
    
    results.push(...pageResults);
    await amazon.wait(1000);
  }
  
  // Log pool status after request
  console.log("Pool after request:", amazon.poolStats());
  
  return {
    term,
    pages,
    count: results.length,
    results,
    pool: amazon.poolStats() // Include in response for monitoring
  };
}, {
  ttl: 30000, // Cache for 30 seconds
  detail: {
    summary: "Search Amazon products",
    parameters: [
      { name: "q", in: "query", schema: { type: "string", default: "laptop" } },
      { name: "pages", in: "query", schema: { type: "integer", default: 3 } }
    ]
  }
});

// Health check endpoint with pool status
await amazon.api("/health", async () => {
  const stats = amazon.poolStats();
  return {
    status: "ok",
    timestamp: Date.now(),
    pool: stats,
    healthy: stats.queued < 10 // Alert if queue backing up
  };
});

// Start server
await piggy.serve(3000, {
  title: "Amazon Scraper API",
  version: "1.0.0",
  description: "Product search with concurrent tab pooling"
});

console.log("🚀 API running on http://localhost:3000");
console.log("📊 Pool size: 4 tabs");

// Keep site alive
amazon.noclose();
```

---

## Testing Concurrent Requests

Test your pool with simultaneous requests:

```ts
// Test script - run this separately
async function testConcurrency() {
  const requests = [];
  
  // Fire 10 concurrent requests
  for (let i = 0; i < 10; i++) {
    requests.push(
      fetch(`http://localhost:3000/amazon/search?q=laptop&pages=1`)
        .then(res => res.json())
        .then(data => ({ request: i + 1, count: data.count, pool: data.pool }))
    );
  }
  
  const results = await Promise.all(requests);
  console.table(results);
}

testConcurrency();
```

Expected output with pool size 4:
- First 4 requests execute immediately
- Requests 5-10 queue and wait
- All complete successfully without collisions

---

## Pool Management

### Dynamic Pool Resizing (Coming Soon)

```ts
// Future feature - resize pool at runtime
await amazon.resizePool(6); // Increase to 6 tabs
await amazon.resizePool(2); // Decrease to 2 tabs (busy tabs complete first)
```

### Graceful Tab Shutdown

```ts
// Wait for all busy tabs to complete before closing
await piggy.close(); // Waits for all pool tabs to finish

// Force close (kills all tabs immediately)
await piggy.close({ force: true });
```

### Per-Request Tab Timeout

```ts
// Set timeout for each request (prevents hung tabs)
await amazon.api("/slow-search", async () => {
  // This will timeout after 30 seconds
  // Tab is released back to pool
  await amazon.wait(60000); // Would timeout
}, { timeout: 30000 });
```

---

## Pool vs No Pool Comparison

### Without Pooling (Default)

```ts
await piggy.register("amazon", "https://amazon.com");

// 3 concurrent requests to /search
// Request 1: Uses tab
// Request 2: Waits for Request 1 to finish
// Request 3: Waits for Request 2 to finish
// Total time: ~9 seconds (3 * 3 seconds each)
```

### With Pooling (pool: 3)

```ts
await piggy.register("amazon", "https://amazon.com", { pool: 3 });

// 3 concurrent requests to /search
// Request 1: Uses tab 1
// Request 2: Uses tab 2
// Request 3: Uses tab 3
// Total time: ~3 seconds (all run in parallel)
```

**Speed improvement: 3x faster with pool size 3**

---

## Best Practices

### 1. Start Small, Monitor, Adjust

```ts
// Start with conservative pool size
await piggy.register("api", "https://example.com", { pool: 2 });

// Monitor memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log(`Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
}, 30000);

// Adjust based on metrics
```

### 2. Match Pool to API Traffic

```ts
// Low traffic API - small pool
await piggy.register("internal", "https://internal.com", { pool: 1 });

// External API with high traffic - larger pool
await piggy.register("amazon", "https://amazon.com", { pool: 6 });
```

### 3. Cache Aggressively to Reduce Pool Pressure

```ts
await amazon.api("/search", handler, { 
  ttl: 60000,  // Cache for 1 minute - fewer pool requests
  pool: 4 
});
```

### 4. Monitor Queue Length

```ts
setInterval(() => {
  const stats = amazon.poolStats();
  if (stats.queued > stats.total * 2) {
    console.error(`⚠️ Queue backlog: ${stats.queued} waiting`);
    // Alert your team or scale up
  }
}, 10000);
```

---

## Troubleshooting

### "Pool queue growing indefinitely"

**Symptoms:** `queued` keeps increasing, never decreases

**Solutions:**
- Increase pool size: `{ pool: 8 }`
- Check if requests are hanging (add timeouts)
- Check if you're releasing tabs properly

### High memory usage

**Symptoms:** Node.js memory keeps growing

**Solutions:**
- Decrease pool size
- Add `ttl` to cache responses
- Close idle tabs: `await amazon.closeIdleTabs()`

### "Tab crashed" errors

**Symptoms:** Random failures, tab stops responding

**Solutions:**
- Pool automatically recreates crashed tabs
- Check if site crashes headless browsers
- Try `binary: "headful"` to debug

---

## API Reference

| Method | Description |
|--------|-------------|
| `piggy.register(name, url, { pool: N })` | Register site with N-tab pool |
| `site.poolStats()` | Get pool statistics: `{ idle, busy, queued, total }` |

### Register Options

```ts
interface RegisterOptions {
  pool?: number;        // Number of tabs in pool (default: 1)
  binary?: "headless" | "headful";  // Override binary for this site
}
```

---

## Next Steps

- [Built-in API Server](./api-server) — Combine with API routes
- [Multi-Site Parallel](./multi-site) — Run multiple sites simultaneously
- [Data Storage](./data-storage) — Save scraped data with validation

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
