# 📊 Evaluate — Data Extraction

Execute JavaScript directly in the browser page and get results back to Node.js.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.21+

---

## Basic Evaluate

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// Simple evaluation
const title = await piggy.site.evaluate(() => document.title);
console.log("Page title:", title);

// Return objects
const data = await piggy.site.evaluate(() => ({
  url: window.location.href,
  userAgent: navigator.userAgent,
  screenWidth: screen.width,
  screenHeight: screen.height,
}));

console.log(data);
```

---

## Extract Multiple Elements

```ts
// Get all product data
const products = await piggy.site.evaluate(() => {
  return Array.from(document.querySelectorAll(".product")).map(el => ({
    name: el.querySelector(".name")?.textContent?.trim(),
    price: el.querySelector(".price")?.textContent?.trim(),
    image: el.querySelector("img")?.src,
    link: el.querySelector("a")?.href,
  }));
});

console.log(`Found ${products.length} products`);
```

---

## Pass Arguments to Evaluate

```ts
// Pass data from Node.js to browser
const selector = ".product-pod";
const minPrice = 20;

const items = await piggy.site.evaluate(
  (sel, min) => {
    return Array.from(document.querySelectorAll(sel))
      .filter(el => {
        const price = parseFloat(el.querySelector(".price")?.textContent?.replace("£", "") || "0");
        return price >= min;
      })
      .map(el => ({
        title: el.querySelector("h3 a")?.textContent,
        price: el.querySelector(".price")?.textContent,
      }));
  },
  selector,  // argument 1
  minPrice    // argument 2
);
```

---

## Real-World Examples

### 1. Scrape Product Listing

```ts
await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

const books = await piggy.shop.evaluate(() => {
  const ratingMap: Record<string, number> = {
    "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5
  };
  
  return Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
    rating: ratingMap[el.querySelector(".star-rating")?.className.replace("star-rating", "").trim() ?? ""] ?? 0,
    availability: el.querySelector(".availability")?.textContent?.trim() ?? "",
    inStock: (el.querySelector(".availability")?.textContent?.trim() || "").includes("In stock"),
    imageUrl: el.querySelector("img")?.src ?? "",
  }));
});

console.log(books);
```

### 2. Extract Table Data

```ts
const tableData = await piggy.site.evaluate(() => {
  const rows = document.querySelectorAll("table tbody tr");
  
  return Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      id: cells[0]?.textContent?.trim(),
      name: cells[1]?.textContent?.trim(),
      email: cells[2]?.textContent?.trim(),
      status: cells[3]?.textContent?.trim(),
    };
  });
});
```

### 3. Infinite Scroll Pagination

```ts
async function scrapeAllProducts() {
  let allProducts: any[] = [];
  let hasMore = true;
  
  while (hasMore) {
    // Get current products
    const products = await piggy.site.evaluate(() => {
      return Array.from(document.querySelectorAll(".product")).map(el => ({
        title: el.querySelector(".title")?.textContent,
        price: el.querySelector(".price")?.textContent,
      }));
    });
    
    allProducts.push(...products);
    
    // Check if "Load More" exists
    const hasLoadMore = await piggy.site.evaluate(() => {
      const btn = document.querySelector("#load-more");
      return btn !== null && btn instanceof HTMLElement && !btn.disabled;
    });
    
    if (!hasLoadMore) break;
    
    // Click load more and wait
    await piggy.site.click("#load-more");
    await piggy.site.wait(2000); // Wait for new content
  }
  
  return allProducts;
}

const allProducts = await scrapeAllProducts();
console.log(`Scraped ${allProducts.length} products`);
```

### 4. Monitor DOM Changes

```ts
// Start observing DOM changes
await piggy.site.evaluate(() => {
  window.__mutations = [];
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      window.__mutations.push({
        type: mutation.type,
        target: mutation.target.tagName,
        addedNodes: mutation.addedNodes.length,
        removedNodes: mutation.removedNodes.length,
        timestamp: Date.now()
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  window.__getMutations = () => [...window.__mutations];
  window.__clearMutations = () => { window.__mutations = []; };
});

// Later, get mutations
const mutations = await piggy.site.evaluate(() => window.__getMutations());
console.log(`Detected ${mutations.length} DOM changes`);
```

### 5. Form Data Extraction

```ts
const formData = await piggy.site.evaluate(() => {
  const form = document.querySelector("#checkout-form");
  if (!form) return null;
  
  const formData = new FormData(form as HTMLFormElement);
  const data: Record<string, any> = {};
  
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  return data;
});

console.log("Form data:", formData);
```

---

## Helper Methods

### fetchText

```ts
// Get text content of first matching element
const heading = await piggy.site.fetchText("h1");
console.log(heading); // "Welcome to our store"

// Get text from specific element
const price = await piggy.site.fetchText(".product-price");
```

### fetchLinks

```ts
// Get all links on page
const allLinks = await piggy.site.fetchLinks("a");
// Returns array of href strings

// Get links matching selector
const productLinks = await piggy.site.fetchLinks(".product a");
```

### fetchImages

```ts
// Get all image URLs
const allImages = await piggy.site.fetchImages("img");

// Get product images only
const productImages = await piggy.site.fetchImages(".product-img");
```

### search

```ts
// CSS selector search
const element = await piggy.site.search.css("#main-content");
const allDivs = await piggy.site.search.css("div.container");

// Get by ID
const header = await piggy.site.search.id("header");
```

---

## Performance Tips

```ts
// ❌ Bad: Multiple evaluate calls
for (const item of items) {
  const text = await piggy.site.evaluate((sel) => 
    document.querySelector(sel)?.textContent, 
    item.selector
  );
}

// ✅ Good: One evaluate call with batch processing
const texts = await piggy.site.evaluate((selectors) => {
  return selectors.map(sel => 
    document.querySelector(sel)?.textContent
  );
}, items.map(i => i.selector));
```

---

## Error Handling

```ts
try {
  const result = await piggy.site.evaluate(() => {
    // This will throw in browser
    return document.querySelector("#non-existent").textContent;
  });
} catch (error) {
  console.error("Evaluation failed:", error.message);
  // Error from browser JavaScript is propagated
}
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `evaluate(js, ...args)` | `js: string \| Function, ...args: any[]` | `Promise<any>` | Execute JavaScript, return result |
| `fetchText(selector)` | `selector: string` | `Promise<string \| null>` | Get text content of element |
| `fetchLinks(selector?)` | `selector?: string` | `Promise<string[]>` | Get all href attributes |
| `fetchImages(selector?)` | `selector?: string` | `Promise<string[]>` | Get all src attributes |
| `search.css(query)` | `query: string` | `Promise<any>` | Query CSS selector |
| `search.id(id)` | `id: string` | `Promise<any>` | Get element by ID |

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Request Interception](./interception) — Mock APIs, cache responses
- [Network Capture](./network-capture) — Capture HTTP/WebSocket traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*