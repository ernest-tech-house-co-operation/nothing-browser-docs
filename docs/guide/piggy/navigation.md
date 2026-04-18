# Navigation

Control page navigation, waiting, and getting page information.

## Basic Navigation

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Navigate to registered URL
await piggy.site.navigate();

// Navigate to a different URL
await piggy.site.navigate("https://example.org");

// Reload current page
await piggy.site.reload();

// Go back/forward
await piggy.site.goBack();
await piggy.site.goForward();
```

---

## Wait for Navigation

Wait for page to finish loading after an action:

```ts
// Click that triggers navigation
await piggy.site.click("a[href='/page2']");
await piggy.site.waitForNavigation();

console.log(await piggy.site.url()); // https://example.com/page2
```

---

## Get Page Information

```ts
// Page title
const title = await piggy.site.title();
console.log("Title:", title);

// Current URL
const url = await piggy.site.url();
console.log("URL:", url);

// Full page HTML
const html = await piggy.site.content();
console.log("HTML length:", html.length);
```

---

## Wait for Elements

Wait for specific elements to appear before proceeding:

```ts
// Wait for element to exist in DOM
await piggy.site.waitForSelector(".product-list");

// With custom timeout (default: 30000ms)
await piggy.site.waitForSelector(".slow-element", 10000); // 10 seconds

// Element appears after navigation
await piggy.site.click("#load-more");
await piggy.site.waitForSelector(".new-items");
```

---

## Wait for Network Responses

Wait for specific API calls to complete:

```ts
// Wait for API response
await piggy.site.click("#submit-form");
await piggy.site.waitForResponse("*/api/users*");

// With custom timeout
await piggy.site.waitForResponse("*/api/data*", 15000);
```

---

## Simple Delay

```ts
// Wait 1 second
await piggy.site.wait(1000);

// Human mode adds random variance (±30%)
piggy.actHuman(true);
await piggy.site.wait(1000); // Actually waits 700-1300ms
```

---

## Complete Navigation Example

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("shop", "https://books.toscrape.com");

// 1. Navigate to homepage
await piggy.shop.navigate();
await piggy.shop.waitForSelector(".product_pod");
console.log("Homepage loaded:", await piggy.shop.title());

// 2. Click a category link
await piggy.shop.click("a[href='catalogue/category/books/travel_2/index.html']");
await piggy.shop.waitForNavigation();
console.log("Category page:", await piggy.shop.url());

// 3. Wait for content
await piggy.shop.waitForSelector(".product_pod");
const count = await piggy.shop.evaluate(() => 
  document.querySelectorAll(".product_pod").length
);
console.log(`Found ${count} books`);

// 4. Go back to homepage
await piggy.shop.goBack();
await piggy.shop.waitForNavigation();
console.log("Back to:", await piggy.shop.title());

await piggy.close();
```

---

## Error Handling

```ts
try {
  await piggy.site.navigate("https://invalid-url-that-doesnt-exist.com");
} catch (error) {
  console.error("Navigation failed:", error.message);
}

try {
  // Timeout if element never appears
  await piggy.site.waitForSelector(".never-appears", 2000);
} catch (error) {
  console.error("Element not found within timeout");
}
```

---

## API Reference

| Method | Description | Timeout |
|--------|-------------|---------|
| `navigate(url?)` | Navigate to URL | 30s |
| `reload()` | Reload current page | 30s |
| `goBack()` | Go back in history | 30s |
| `goForward()` | Go forward in history | 30s |
| `waitForNavigation()` | Wait for page load | 30s |
| `waitForSelector(selector, timeout?)` | Wait for element | Custom |
| `waitForResponse(pattern, timeout?)` | Wait for network response | Custom |
| `wait(ms)` | Simple delay | N/A |
| `title()` | Get page title | N/A |
| `url()` | Get current URL | N/A |
| `content()` | Get full HTML | N/A |

---

## Next Steps

- [Interactions](./interactions) — Click, type, hover, scroll
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Data Extraction](./evaluate) — Extract data with evaluate()

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
