# 📊 Evaluate — Data Extraction

Execute JavaScript directly in the browser page and get results back to Node.js.

---

## Basic Evaluate

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
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

### Scrape Product Listing

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

### Extract Table Data

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

---

## Helper Methods

### fetchText

```ts
// Get text content of first matching element
const heading = await piggy.site.fetchText("h1");
console.log(heading);
```

### fetchLinks

```ts
// Get all links on page
const allLinks = await piggy.site.fetchLinks("a");
```

### fetchImages

```ts
// Get all image URLs
const allImages = await piggy.site.fetchImages("img");
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `evaluate(js, ...args)` | Execute JavaScript, return result |
| `fetchText(selector)` | Get text content of element |
| `fetchLinks(selector?)` | Get all href attributes |
| `fetchImages(selector?)` | Get all src attributes |

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Request Interception](./interception) — Mock APIs, cache responses
- [Network Capture](./network-capture) — Capture HTTP/WebSocket traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
