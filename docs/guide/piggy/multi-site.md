# 🌐 Multi-Site Parallel

Control multiple browser tabs or processes simultaneously. Run operations in parallel, compare results across sites, and scale your scraping.

---

> **Related:** For concurrent requests to the **same** site, see [Tab Pooling](./tab-pooling) instead.

---

## Overview

Piggy supports two modes for multi-site operations:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Tab Mode** | Single browser, multiple tabs | Lightweight, shared cookies/session |
| **Process Mode** | Separate browser per site | Isolation, different profiles/proxies |

## Tab Pooling vs Multi-Site

| Need | Solution | Documentation |
|------|----------|---------------|
| Multiple **different** sites | Multi-Site (this doc) | [`piggy.all()`](#parallel-operations-with-all) |
| Multiple concurrent requests to **same** site | Tab Pooling | [Tab Pooling Guide](./tab-pooling) |

```ts
// Multiple different sites - use multi-site
await piggy.register("amazon", "...");
await piggy.register("ebay", "...");
await piggy.register("walmart", "...");

// Multiple requests to same site - use tab pooling
await piggy.register("amazon", "https://amazon.com", { pool: 4 });
```

---

## Tab Mode (Default)

Single browser instance with multiple tabs. Fast and efficient.

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" }); // Default

// Register multiple sites - each gets its own tab
await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("walmart", "https://www.walmart.com");

// Navigate independently
await piggy.amazon.navigate();
await piggy.ebay.navigate();
await piggy.walmart.navigate();

// Get titles in parallel
const titles = await Promise.all([
  piggy.amazon.title(),
  piggy.ebay.title(),
  piggy.walmart.title()
]);

console.log(titles);
```

---

## Process Mode

Each site gets its own browser process. Complete isolation.

```ts
await piggy.launch({ mode: "process" });

// Each site runs in its own browser process
await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");
await piggy.register("site3", "https://example.net");

// They run completely independently
await piggy.site1.navigate();
await piggy.site2.navigate();
await piggy.site3.navigate();
```

**When to use process mode:**
- Different proxy configurations per site
- Sites that conflict with each other (cookies, storage)
- Testing with different browser profiles
- Maximum isolation required

---

## Parallel Operations with `all()`

Run the same operation on multiple sites and get results as an array.

```ts
await piggy.launch({ mode: "tab" });
await piggy.register("site1", "https://example1.com");
await piggy.register("site2", "https://example2.com");
await piggy.register("site3", "https://example3.com");

await piggy.site1.navigate();
await piggy.site2.navigate();
await piggy.site3.navigate();

// Get all titles in parallel
const titles = await piggy.all([piggy.site1, piggy.site2, piggy.site3]).title();
console.log(titles); // ["Title 1", "Title 2", "Title 3"]

// Get all URLs
const urls = await piggy.all([piggy.site1, piggy.site2, piggy.site3]).url();

// Fetch text from all sites
const headings = await piggy.all([piggy.site1, piggy.site2, piggy.site3]).fetchText("h1");

// Take screenshots of all sites
const screenshots = await piggy.all([piggy.site1, piggy.site2, piggy.site3]).screenshot();
```

---

## Compare Results with `diff()`

Run the same operation and get results mapped to site names.

```ts
// Get titles with site names
const titles = await piggy.diff([piggy.site1, piggy.site2, piggy.site3]).title();
console.log(titles);
// {
//   site1: "Example Domain",
//   site2: "Example Org",
//   site3: "Example Net"
// }

// Fetch text with site names
const h1s = await piggy.diff([piggy.site1, piggy.site2, piggy.site3]).fetchText("h1");

// Check status across sites
const statuses = await piggy.diff([piggy.site1, piggy.site2, piggy.site3]).evaluate(() => ({
  ready: document.readyState,
  url: window.location.href
}));
```

---

## Real-World Examples

### 1. Price Comparison Scraper

```ts
await piggy.launch({ mode: "process" }); // Use process mode for isolation

await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("bestbuy", "https://www.bestbuy.com");

async function searchProduct(site: any, product: string) {
  await site.navigate();
  await site.type("#search", product);
  await site.click("#search-btn");
  await site.waitForSelector(".product");
  
  const results = await site.evaluate(() => 
    Array.from(document.querySelectorAll(".product")).slice(0, 3).map(el => ({
      title: el.querySelector(".title")?.textContent,
      price: el.querySelector(".price")?.textContent,
      seller: window.location.hostname
    }))
  );
  
  return results;
}

// Search same product across all sites
const product = "macbook pro";
const results = await Promise.all([
  searchProduct(piggy.amazon, product),
  searchProduct(piggy.ebay, product),
  searchProduct(piggy.bestbuy, product)
]);

const comparison = {
  product,
  timestamp: Date.now(),
  amazon: results[0],
  ebay: results[1],
  bestbuy: results[2]
};

console.log("Price comparison:", comparison);
```

### 2. SEO Monitoring Dashboard

```ts
await piggy.launch({ mode: "tab" });

const sites = [
  { name: "homepage", url: "https://example.com" },
  { name: "products", url: "https://example.com/products" },
  { name: "blog", url: "https://example.com/blog" },
  { name: "contact", url: "https://example.com/contact" }
];

// Register all sites
for (const site of sites) {
  await piggy.register(site.name, site.url);
}

// Collect SEO metrics in parallel
async function collectSEOMetrics(site: any, name: string) {
  await site.navigate();
  await site.wait(2000);
  
  return await site.evaluate(() => ({
    title: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content"),
    h1Count: document.querySelectorAll("h1").length,
    imageCount: document.querySelectorAll("img").length,
    linkCount: document.querySelectorAll("a").length,
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
  }));
}

// Run all SEO checks in parallel
const seoData = await piggy.all(Object.values(piggy).filter(p => p._name)).evaluate(
  async function() {
    // This runs in each site's context
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent,
      metaDesc: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href")
    };
  }
);

console.log("SEO Dashboard:", seoData);
```

### 3. Stock Availability Checker

```ts
await piggy.launch({ mode: "process" });

const products = [
  { sku: "ABC123", site: "amazon", url: "https://amazon.com/product/ABC123" },
  { sku: "ABC123", site: "ebay", url: "https://ebay.com/itm/ABC123" },
  { sku: "ABC123", site: "walmart", url: "https://walmart.com/ip/ABC123" }
];

// Register each product listing as a site
for (const product of products) {
  await piggy.register(`${product.site}_${product.sku}`, product.url);
}

async function checkStock(site: any, sku: string, retailer: string) {
  await site.navigate();
  await site.waitForSelector(".stock-status, .availability");
  
  const stockInfo = await site.evaluate(() => {
    const stockEl = document.querySelector(".stock-status, .availability");
    const priceEl = document.querySelector(".price");
    
    return {
      inStock: stockEl?.textContent?.toLowerCase().includes("in stock") || false,
      stockText: stockEl?.textContent,
      price: priceEl?.textContent,
      lastChecked: Date.now()
    };
  });
  
  return { sku, retailer, ...stockInfo };
}

// Check all sites in parallel
const stockStatuses = await Promise.all(
  Object.values(piggy).map(async (site: any) => {
    const [retailer, sku] = site._name.split("_");
    return checkStock(site, sku, retailer);
  })
);

// Filter in-stock items
const inStock = stockStatuses.filter(s => s.inStock);
console.log(`Found ${inStock.length} in-stock options:`, inStock);

// Send alert if any in stock
if (inStock.length > 0) {
  await fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({ alert: "Product in stock!", options: inStock })
  });
}
```

### 4. A/B Testing Comparator

```ts
await piggy.launch({ mode: "process" });

// Register A and B variants
await piggy.register("variant_a", "https://variant-a.example.com");
await piggy.register("variant_b", "https://variant-b.example.com");

async function analyzeVariant(site: any, name: string) {
  await site.navigate();
  await site.waitForSelector(".main-content");
  
  // Scroll through page
  await site.scroll.by(500);
  await site.wait(1000);
  await site.scroll.by(1000);
  
  return await site.evaluate(() => {
    // Measure user engagement metrics
    return {
      variant: window.location.hostname,
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      buttonVisibility: document.querySelector(".cta-button")?.getBoundingClientRect().top < window.innerHeight,
      formCompleteness: Array.from(document.querySelectorAll("input")).filter(i => i.value).length,
      clickableElements: document.querySelectorAll("a, button").length,
      imagesLoaded: Array.from(document.querySelectorAll("img")).filter(img => img.complete).length
    };
  });
}

// Run analysis in parallel
const [variantA, variantB] = await Promise.all([
  analyzeVariant(piggy.variant_a, "A"),
  analyzeVariant(piggy.variant_b, "B")
]);

console.log("A/B Test Results:", { variantA, variantB });

const winner = variantA.loadTime < variantB.loadTime ? "A" : "B";
console.log(`Winner: Variant ${winner} (${Math.abs(variantA.loadTime - variantB.loadTime)}ms faster)`);
```

### 5. Multi-Region Price Checker

```ts
await piggy.launch({ mode: "process" });

const regions = [
  { name: "us", url: "https://amazon.com/product/123", currency: "USD" },
  { name: "uk", url: "https://amazon.co.uk/product/123", currency: "GBP" },
  { name: "de", url: "https://amazon.de/product/123", currency: "EUR" },
  { name: "jp", url: "https://amazon.co.jp/product/123", currency: "JPY" }
];

// Register each region
for (const region of regions) {
  await piggy.register(`amazon_${region.name}`, region.url);
}

async function getPrice(site: any, currency: string) {
  await site.navigate();
  await site.waitForSelector(".price");
  
  const priceText = await site.fetchText(".price");
  const price = parseFloat(priceText.replace(/[^0-9.-]/g, ""));
  
  return { currency, price, priceText };
}

// Get prices from all regions in parallel
const prices = await Promise.all(
  regions.map(async (region) => {
    const site = piggy[`amazon_${region.name}`];
    return getPrice(site, region.currency);
  })
);

// Find best price
const bestPrice = prices.reduce((best, current) => 
  current.price < best.price ? current : best
);

console.log("Regional prices:", prices);
console.log(`Best price: ${bestPrice.priceText} (${bestPrice.currency})`);
```

### 6. Concurrent Form Submitter

```ts
await piggy.launch({ mode: "process" });

const forms = [
  { id: "form1", url: "https://example.com/form1", data: { name: "User1", email: "user1@test.com" } },
  { id: "form2", url: "https://example.com/form2", data: { name: "User2", email: "user2@test.com" } },
  { id: "form3", url: "https://example.com/form3", data: { name: "User3", email: "user3@test.com" } }
];

// Register each form as a site
for (const form of forms) {
  await piggy.register(`form_${form.id}`, form.url);
}

async function submitForm(site: any, formData: any, formId: string) {
  await site.navigate();
  await site.waitForSelector("form");
  
  // Fill form
  for (const [key, value] of Object.entries(formData)) {
    await site.type(`#${key}`, value as string);
  }
  
  await site.click("#submit");
  await site.waitForNavigation();
  
  const confirmation = await site.fetchText(".success-message");
  
  return {
    formId,
    submitted: true,
    confirmation,
    timestamp: Date.now()
  };
}

// Submit all forms in parallel
const results = await Promise.all(
  forms.map(async (form) => {
    const site = piggy[`form_${form.id}`];
    return submitForm(site, form.data, form.id);
  })
);

console.log("Form submission results:", results);
```

### 7. Screenshot Gallery Generator

```ts
await piggy.launch({ mode: "tab" });

const urls = [
  { name: "homepage", url: "https://example.com" },
  { name: "products", url: "https://example.com/products" },
  { name: "about", url: "https://example.com/about" },
  { name: "contact", url: "https://example.com/contact" },
  { name: "blog", url: "https://example.com/blog" }
];

// Register each page
for (const page of urls) {
  await piggy.register(page.name, page.url);
}

async function capturePage(site: any, name: string) {
  await site.navigate();
  await site.wait(2000); // Wait for dynamic content
  
  const title = await site.title();
  const screenshot = await site.screenshot();
  const size = await site.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  
  // Save screenshot to file
  await site.screenshot(`./gallery/${name}.png`);
  
  return { name, title, size, screenshot: `./gallery/${name}.png` };
}

// Capture all pages in parallel
const gallery = await piggy.all(Object.values(piggy)).capturePage(
  async function() {
    // This runs in each page
    return {
      title: document.title,
      url: window.location.href,
      wordCount: document.body.innerText.split(/\s+/).length
    };
  }
);

// Generate HTML gallery
const html = `
<!DOCTYPE html>
<html>
<head><title>Screenshot Gallery</title></head>
<body>
  <h1>Screenshot Gallery - ${new Date().toISOString()}</h1>
  ${gallery.map((item: any) => `
    <div>
      <h2>${item.name}</h2>
      <p>Title: ${item.title}</p>
      <p>URL: ${item.url}</p>
      <p>Words: ${item.wordCount}</p>
      <img src="${item.screenshot}" />
    </div>
  `).join('')}
</body>
</html>
`;

await Bun.write("./gallery/index.html", html);
console.log("📸 Gallery generated with", gallery.length, "screenshots");
```

---

## Performance Tips

```ts
// ✅ Good: Parallel operations
const results = await Promise.all([
  piggy.site1.evaluate(() => ({ ... })),
  piggy.site2.evaluate(() => ({ ... })),
  piggy.site3.evaluate(() => ({ ... }))
]);

// ✅ Good: Using all() helper
const titles = await piggy.all(sites).title();

// ❌ Bad: Sequential operations
for (const site of sites) {
  const title = await site.title(); // Waits for each
}

// ✅ Good: Limit concurrent operations
const chunkSize = 5;
for (let i = 0; i < sites.length; i += chunkSize) {
  const chunk = sites.slice(i, i + chunkSize);
  await Promise.all(chunk.map(site => site.evaluate(() => ({ ... }))));
}
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `piggy.all(sites).method()` | Run method on all sites, return array |
| `piggy.diff(sites).method()` | Run method on all sites, return object mapped by site name |
| `piggy.launch({ mode: "tab" })` | Single browser, multiple tabs (default) |
| `piggy.launch({ mode: "process" })` | Separate browser per site |

---

## Next Steps

- [Tab Pooling](./tab-pooling) — Handle concurrent requests to the same site
- [Built-in API Server](./api-server) — Turn multi-site scraping into API
- [Human Mode](./human-mode) — Add natural delays to multi-site operations
- [Full API Reference](./api-reference) — Complete API documentation

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
