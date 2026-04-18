# 📦 Local Cache Mode

Cache API responses, static assets, and entire web applications locally. Reduce bandwidth, improve performance, and enable offline operation.

---

## Overview

Piggy provides multiple caching strategies:

| Cache Type | Method | Use Case |
|------------|--------|----------|
| **API Cache** | `intercept.respond()` + TTL | Reduce API calls, faster responses |
| **Static Asset Cache** | `intercept.respond()` | Cache JS, CSS, images locally |
| **Full Page Cache** | `intercept.modifyResponse()` | Cache entire HTML responses |
| **Session Cache** | `session.export()`/`import()` | Persist login state |

---

## Basic API Caching

```ts
import piggy from "nothing-browser";

const apiCache = new Map();

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://api.example.com");

// Cache API responses
await piggy.app.intercept.respond("*/api/users*", async (request) => {
  const cacheKey = `${request.method}:${request.url}`;
  
  if (apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey);
    if (Date.now() < cached.expires) {
      console.log(`📦 Cache HIT: ${request.url}`);
      return {
        status: 200,
        contentType: "application/json",
        body: cached.data,
        headers: { "X-Cache": "HIT", "X-Cache-Age": String(Date.now() - cached.timestamp) }
      };
    }
  }
  
  // Cache miss - let request through
  console.log(`📡 Cache MISS: ${request.url}`);
  return null; // Passthrough to real API
});

// Cache the response after it comes back
await piggy.app.intercept.modifyResponse("*/api/users*", async (response) => {
  const cacheKey = `${response.method}:${response.url}`;
  const data = await response.json();
  
  apiCache.set(cacheKey, {
    data: JSON.stringify(data),
    timestamp: Date.now(),
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes TTL
  });
  
  return { body: JSON.stringify(data) };
});

await piggy.app.navigate("https://api.example.com/users");
// First request: cache MISS, hits real API
// Second request: cache HIT, returns cached data
```

---

## Static Asset Caching

Cache JS, CSS, and images locally for faster loading.

```ts
import { readFileSync, writeFileSync, existsSync } from "fs";

const assetCache = new Map();
const ASSET_DIR = "./cache/assets";

// Ensure cache directory exists
await fs.mkdir(ASSET_DIR, { recursive: true });

async function cacheStaticAssets(site: any) {
  // Cache JavaScript files
  await site.intercept.respond("*.js", async (request) => {
    const filename = request.url.split("/").pop() || "bundle.js";
    const cachePath = `${ASSET_DIR}/${filename}`;
    
    if (existsSync(cachePath)) {
      const content = readFileSync(cachePath, "utf-8");
      return {
        status: 200,
        contentType: "application/javascript",
        body: content,
        headers: { "X-Cache": "DISK", "X-Cached-At": new Date().toISOString() }
      };
    }
    
    // Cache miss - download and save
    return null; // Passthrough to network
  });
  
  // Cache CSS files
  await site.intercept.respond("*.css", async (request) => {
    const filename = request.url.split("/").pop() || "styles.css";
    const cachePath = `${ASSET_DIR}/${filename}`;
    
    if (existsSync(cachePath)) {
      const content = readFileSync(cachePath, "utf-8");
      return {
        status: 200,
        contentType: "text/css",
        body: content,
        headers: { "X-Cache": "DISK" }
      };
    }
    
    return null;
  });
  
  // Cache images
  await site.intercept.respond("*.{png,jpg,jpeg,gif,webp}", async (request) => {
    const filename = request.url.split("/").pop() || "image.png";
    const cachePath = `${ASSET_DIR}/${filename}`;
    
    if (existsSync(cachePath)) {
      const content = readFileSync(cachePath);
      return {
        status: 200,
        contentType: `image/${filename.split(".").pop()}`,
        body: content,
        headers: { "X-Cache": "DISK" }
      };
    }
    
    return null;
  });
  
  // Save assets after they load
  await site.intercept.modifyResponse("*.{js,css,png,jpg,jpeg,gif,webp}", async (response) => {
    const filename = response.url.split("/").pop() || "asset";
    const cachePath = `${ASSET_DIR}/${filename}`;
    
    if (!existsSync(cachePath)) {
      writeFileSync(cachePath, response.body);
      console.log(`💾 Cached asset: ${filename}`);
    }
    
    return null; // No modification, just cache
  });
}

// Usage
await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

await cacheStaticAssets(piggy.site);
await piggy.site.navigate();

// Second run will load from disk cache
```

---

## Complete Offline Cache

Cache an entire web application for offline use.

```ts
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";

interface CacheEntry {
  data: string | Buffer;
  contentType: string;
  timestamp: number;
  expires: number;
}

class OfflineCache {
  private cache = new Map<string, CacheEntry>();
  private cacheDir: string;
  
  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
    mkdirSync(cacheDir, { recursive: true });
    this.loadFromDisk();
  }
  
  private loadFromDisk() {
    // Load existing cache from disk
    try {
      const indexPath = `${this.cacheDir}/index.json`;
      if (existsSync(indexPath)) {
        const index = JSON.parse(readFileSync(indexPath, "utf-8"));
        for (const [url, entry] of Object.entries(index)) {
          const filePath = `${this.cacheDir}/${entry.filename}`;
          if (existsSync(filePath)) {
            const data = readFileSync(filePath);
            this.cache.set(url, {
              data,
              contentType: entry.contentType,
              timestamp: entry.timestamp,
              expires: entry.expires
            });
          }
        }
        console.log(`📦 Loaded ${this.cache.size} cached items from disk`);
      }
    } catch (e) {
      console.log("No existing cache found");
    }
  }
  
  private saveToDisk(url: string, entry: CacheEntry) {
    const filename = Buffer.from(url).toString("base64").replace(/[+/=]/g, "_");
    const filePath = `${this.cacheDir}/${filename}`;
    
    writeFileSync(filePath, entry.data);
    
    // Update index
    const indexPath = `${this.cacheDir}/index.json`;
    let index: any = {};
    if (existsSync(indexPath)) {
      index = JSON.parse(readFileSync(indexPath, "utf-8"));
    }
    
    index[url] = {
      filename,
      contentType: entry.contentType,
      timestamp: entry.timestamp,
      expires: entry.expires
    };
    
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }
  
  async intercept(site: any, patterns: string[], ttl: number = 24 * 60 * 60 * 1000) {
    // Serve from cache if available
    for (const pattern of patterns) {
      await site.intercept.respond(pattern, async (request) => {
        const cached = this.cache.get(request.url);
        
        if (cached && Date.now() < cached.expires) {
          console.log(`📦 Cache HIT: ${request.url}`);
          return {
            status: 200,
            contentType: cached.contentType,
            body: cached.data,
            headers: {
              "X-Cache": "HIT",
              "X-Cache-Age": String(Date.now() - cached.timestamp)
            }
          };
        }
        
        return null; // Passthrough
      });
    }
    
    // Cache responses
    for (const pattern of patterns) {
      await site.intercept.modifyResponse(pattern, async (response) => {
        const entry: CacheEntry = {
          data: response.body,
          contentType: response.headers["content-type"] || "application/octet-stream",
          timestamp: Date.now(),
          expires: Date.now() + ttl
        };
        
        this.cache.set(response.url, entry);
        this.saveToDisk(response.url, entry);
        console.log(`💾 Cached: ${response.url}`);
        
        return null; // No modification
      });
    }
  }
  
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (now < entry.expires) valid++;
      else expired++;
    }
    
    return { total: this.cache.size, valid, expired };
  }
}

// Usage
const cache = new OfflineCache("./offline-cache");

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://my-web-app.com");

// Cache everything
await cache.intercept(piggy.app, [
  "*.html",
  "*.js", 
  "*.css",
  "*.png",
  "*.jpg",
  "*/api/*"
], 60 * 60 * 1000); // 1 hour TTL

await piggy.app.navigate();
console.log("Cache stats:", cache.getStats());
```

---

## TTL-Based Cache with Auto-Refresh

```ts
class TTLCache {
  private cache = new Map();
  
  async intercept(site: any, pattern: string, ttl: number, fetcher: () => Promise<any>) {
    await site.intercept.respond(pattern, async (request) => {
      const cached = this.cache.get(pattern);
      
      if (cached && Date.now() < cached.expires) {
        return {
          status: 200,
          contentType: "application/json",
          body: cached.data,
          headers: { "X-Cache": "HIT", "X-Expires-In": String(cached.expires - Date.now()) }
        };
      }
      
      // Fetch fresh data
      console.log(`🔄 Refreshing cache for ${pattern}`);
      const freshData = await fetcher();
      
      this.cache.set(pattern, {
        data: JSON.stringify(freshData),
        expires: Date.now() + ttl
      });
      
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(freshData),
        headers: { "X-Cache": "MISS" }
      };
    });
  }
}

// Usage
const productCache = new TTLCache();

await productCache.intercept(
  piggy.shop,
  "*/api/products*",
  30000, // 30 seconds
  async () => {
    // Fetch fresh products
    await piggy.shop.navigate("https://api.example.com/products");
    const products = await piggy.shop.evaluate(() => 
      Array.from(document.querySelectorAll(".product")).map(el => ({
        id: el.dataset.id,
        name: el.textContent
      }))
    );
    return { products, fetchedAt: Date.now() };
  }
);
```

---

## Redis Cache Backend

```ts
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function cacheWithRedis(site: any, pattern: string, ttl: number) {
  await site.intercept.respond(pattern, async (request) => {
    const cacheKey = `piggy:${request.method}:${request.url}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log(`📦 Redis HIT: ${request.url}`);
      return {
        status: 200,
        contentType: "application/json",
        body: cached,
        headers: { "X-Cache": "REDIS" }
      };
    }
    
    return null;
  });
  
  await site.intercept.modifyResponse(pattern, async (response) => {
    const cacheKey = `piggy:${response.method}:${response.url}`;
    await redis.setEx(cacheKey, ttl, response.body);
    console.log(`💾 Saved to Redis: ${response.url}`);
    return null;
  });
}

// Usage
await cacheWithRedis(piggy.app, "*/api/*", 300);
```

---

## Conditional Caching

```ts
async function smartCache(site: any) {
  await site.intercept.respond("*/api/*", async (request) => {
    // Don't cache POST requests
    if (request.method === "POST") return null;
    
    // Don't cache auth endpoints
    if (request.url.includes("/auth")) return null;
    
    // Check cache
    const cacheKey = `${request.method}:${request.url}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      // Return stale-while-revalidate
      if (Date.now() > cached.expires - 10000) {
        // Refresh in background
        setTimeout(() => refreshCache(request.url), 0);
      }
      
      return {
        status: 200,
        contentType: "application/json",
        body: cached.data,
        headers: { "X-Cache": "STALE" }
      };
    }
    
    return null;
  });
}

async function refreshCache(url: string) {
  console.log(`🔄 Background refresh: ${url}`);
  // Fetch and update cache
}
```

---

## Cache Invalidation

```ts
class CacheManager {
  private cache = new Map();
  
  async intercept(site: any) {
    await site.intercept.respond("*/api/*", async (request) => {
      const cached = this.cache.get(request.url);
      if (cached && Date.now() < cached.expires) {
        return {
          status: 200,
          contentType: "application/json",
          body: cached.data
        };
      }
      return null;
    });
  }
  
  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`🗑️ Invalidated: ${key}`);
      }
    }
  }
  
  invalidateAll() {
    this.cache.clear();
    console.log("🗑️ Cache cleared");
  }
  
  async refresh(pattern: string) {
    this.invalidate(pattern);
    // Trigger refresh on next request
    console.log(`🔄 Will refresh: ${pattern}`);
  }
}

// Usage
const cache = new CacheManager();
await cache.intercept(piggy.app);

// Invalidate when data changes
await piggy.app.click("#update-profile");
await cache.invalidate("*/api/user*");
```

---

## Performance Comparison

```ts
async function benchmarkCache(site: any) {
  // Without cache
  console.log("Testing without cache...");
  const startNoCache = Date.now();
  for (let i = 0; i < 10; i++) {
    await site.navigate("https://api.example.com/data");
    await site.capture.clear();
  }
  const noCacheTime = Date.now() - startNoCache;
  
  // Enable cache
  await setupCache(site);
  
  // With cache
  console.log("Testing with cache...");
  const startWithCache = Date.now();
  for (let i = 0; i < 10; i++) {
    await site.navigate("https://api.example.com/data");
  }
  const withCacheTime = Date.now() - startWithCache;
  
  console.log(`Without cache: ${noCacheTime}ms`);
  console.log(`With cache: ${withCacheTime}ms`);
  console.log(`Speedup: ${(noCacheTime / withCacheTime).toFixed(2)}x`);
}

// Example output:
// Without cache: 4523ms
// With cache: 234ms
// Speedup: 19.33x
```

---

## API Reference

| Pattern | Description |
|---------|-------------|
| `*.js` | All JavaScript files |
| `*.css` | All CSS files |
| `*.{png,jpg}` | Image files |
| `*/api/*` | API endpoints |
| `*.html` | HTML pages |

---

## Next Steps

- [Request Interception](./interception) — Advanced intercept patterns
- [Session Persistence](./session) — Cache login sessions
- [Network Capture](./network-capture) — Debug cache behavior

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
