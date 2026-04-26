# 🛒 Amazon Scraper

Search Amazon products and get detailed information — all through a simple REST API.

---

## Features

- ✅ Search products by keyword
- ✅ Pagination support (1-20 pages)
- ✅ Product details by URL
- ✅ Built-in API server with OpenAPI docs
- ✅ Saves results to `amazon-{term}.json`

---

## Output Example

```json
{
  "asin": "B0DGNVSYX3",
  "title": "Intex 64449ED Dura-Beam Deluxe Plush Air Mattress with Headboard: Fiber-Tech - Queen Size - Built-in Electric Pump - 18in Bed Height - 600lb Weight Capacity",
  "price": "KES 11,631.21",
  "rating": "4.4 out of 5 stars",
  "image": "https://m.media-amazon.com/images/I/61dIljEKKIL._AC_UL320_.jpg",
  "url": "https://www.amazon.com/dp/B0DGNVSYX3"
}
```

---

## The Code

```typescript
import piggy, { usePiggy } from 'nothing-browser';
import { writeFileSync } from "fs";

await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("amazon", "https://www.amazon.com");

piggy.actHuman(true);

const { amazon } = usePiggy<"amazon">();

// Search endpoint
await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "mattress";
  const pages = Math.min(parseInt(query.pages) ?? 5, 20);
  const results = [];

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(term)}&page=${page}`;
    await amazon.navigate(url);
    await amazon.wait(3000);

    const pageResults = await amazon.evaluate(() => {
      return Array.from(document.querySelectorAll(".s-result-item[data-asin]"))
        .filter(el => el.getAttribute("data-asin"))
        .map(el => ({
          asin: el.getAttribute("data-asin"),
          title: el.querySelector("h2 span")?.textContent?.trim() ?? "",
          price: el.querySelector(".a-price .a-offscreen")?.textContent?.trim() || "",
          rating: el.querySelector(".a-icon-alt")?.textContent?.trim() ?? "",
          image: el.querySelector("img.s-image")?.getAttribute("src") ?? "",
          url: "https://www.amazon.com" + (el.querySelector("a.a-link-normal[href]")?.getAttribute("href") ?? ""),
        }));
    });

    console.log(`Page ${page} → ${pageResults.length} products`);
    results.push(...pageResults);
    await amazon.wait(2000);
  }

  writeFileSync(`./amazon-${term}.json`, JSON.stringify(results, null, 2));
  return { total: results.length, pages, term, products: results };
}, {
  detail: {
    tags: ["Amazon"],
    summary: "Search Amazon products",
    parameters: [
      { name: "q", in: "query", schema: { type: "string", default: "mattress" } },
      { name: "pages", in: "query", schema: { type: "integer", default: 5, minimum: 1, maximum: 20 } }
    ]
  }
});

// Product details endpoint
await amazon.api("/product", async (_params, query) => {
  if (!query.url) return { error: "url param required" };

  await amazon.navigate(query.url);
  await amazon.wait(3000);

  return await amazon.evaluate(() => ({
    title: document.querySelector("#productTitle")?.textContent?.trim() ?? "",
    price: document.querySelector(".a-price .a-offscreen")?.textContent?.trim() ?? "",
    rating: document.querySelector(".a-icon-alt")?.textContent?.trim() ?? "",
    image: document.querySelector("#landingImage")?.getAttribute("src") ?? "",
  }));
}, {
  ttl: 300000,
  detail: {
    tags: ["Amazon"],
    summary: "Get Amazon product details",
    parameters: [
      { name: "url", in: "query", required: true, schema: { type: "string", format: "uri" } }
    ]
  }
});

amazon.noclose();

await piggy.serve(3000, {
  title: "Amazon Scraper API",
  version: "1.0.0",
  description: "Product scraping API for Amazon using Nothing Browser"
});

console.log("\n🚀 API server running at http://localhost:3000");
console.log("📚 OpenAPI UI at http://localhost:3000/openapi");
console.log("\n📖 Endpoints:");
console.log("   GET /amazon/search?q=mattress&pages=3");
console.log("   GET /amazon/product?url=https://www.amazon.com/dp/ASIN");
```

---

## How to Run

```bash
# 1. Install Piggy
bun add nothing-browser

# 2. Download the binary from GitHub Releases
# Place nothing-browser-headless in your project root

# 3. Run the script
bun run amazon-scraper.ts

# 4. Test the API
curl "http://localhost:3000/amazon/search?q=mattress&pages=3"
```

---

## Selector Notes

Amazon changes its HTML structure frequently. If the script stops working, update these selectors:

| Field | Current Selector | Alternative |
|-------|------------------|-------------|
| Title | `h2 span` | `.a-text-normal` |
| Price | `.a-price .a-offscreen` | `.a-price-whole` |
| Rating | `.a-icon-alt` | `.a-icon-star` |
| Image | `img.s-image` | `img[data-image-latency]` |

---

## Requirements

- Binary: v0.1.12+
- Library: v0.0.18+

---

## Next Steps

- [Script Marketplace](./) — Browse more scripts
- [Remote Deployment](../guide/piggy/remote-deployment) — Run on a VPS
- [Proxy Support](../guide/piggy/proxy-support) — Rotate IPs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*