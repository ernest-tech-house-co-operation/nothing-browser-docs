# 🧭 Navigation API — Page Navigation & Info

Control page navigation, get page information, and wait for page loads. Essential for moving around websites and capturing page state.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.21+

---

## Overview

| Method | Purpose | Use Case |
|--------|---------|----------|
| `navigate()` | Go to a URL | Load a page |
| `reload()` | Refresh current page | Get fresh content |
| `goBack()` | Previous page | Browser history |
| `goForward()` | Next page | Browser history |
| `title()` | Get page title | Page identification |
| `url()` | Get current URL | Track location |
| `content()` | Get full HTML | Page analysis |
| `waitForNavigation()` | Wait for page load | After clicks/forms |
| `waitForSelector()` | Wait for element | Wait for content to load |

---

## Basic Navigation

### `navigate(url?)`

Navigates to a URL. If no URL is provided, uses the registered URL from `register()`.

```ts
// Navigate to registered URL
await piggy.books.navigate();

// Navigate to a different URL
await piggy.books.navigate("https://books.toscrape.com/catalogue/page-2.html");
await piggy.books.waitForSelector(".product_pod");
console.log("Page 2:", piggy.books.url());
// Page 2: https://books.toscrape.com/catalogue/page-2.html
```

### `reload()`

Reloads the current page.

```ts
await piggy.books.reload();
console.log("Reloaded:", await piggy.books.title());
// Reloaded: All products | Books to Scrape - Sandbox
```

### `goBack()`

Goes back one page in history.

```ts
await piggy.books.goBack();
console.log("Back to:", piggy.books.url());
// Back to: https://books.toscrape.com/
```

### `goForward()`

Goes forward one page in history.

```ts
await piggy.books.goForward();
console.log("Forward to:", piggy.books.url());
// Forward to: https://books.toscrape.com/catalogue/page-2.html
```

---

## Page Information

### `title()`

Returns the current page title. Async.

```ts
const title = await piggy.books.title();
console.log("Page title:", title);
// Page title: All products | Books to Scrape - Sandbox
```

### `url()`

Returns the current URL. Synchronous — no await needed.

```ts
console.log("Page 1:", piggy.books.url());
// Page 1: https://books.toscrape.com
```

### `content()`

Returns the full HTML of the page.

```ts
const html = await piggy.books.content();
console.log("HTML preview:", html.slice(0, 200));
// HTML preview: <!DOCTYPE html><!--[if lt IE 7]>...
```

---

## Waiting

### `waitForSelector(selector, timeout?)`

Waits for an element to appear in the DOM. Default timeout 10000ms.

```ts
await piggy.books.waitForSelector(".product_pod");
console.log("Products visible ✓");
```

### `waitForNavigation()`

Waits for the page to finish loading after an action that triggers navigation.

```ts
await piggy.books.click("a[href='/catalogue/page-2.html']");
await piggy.books.waitForNavigation();
console.log(piggy.books.url());
```

### Custom Wait with `evaluate()`

For complex conditions, use `evaluate()` with a Promise:

```ts
// Wait for exactly 20 products to load
await piggy.books.evaluate(() => {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (document.querySelectorAll(".product_pod").length >= 20) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
});
console.log("All 20 products loaded ✓");
```

---

## Full Example

```ts
import piggy from "nothing-browser";
import path from "path";

const binaryPath = path.resolve(import.meta.dir, "../a/nothing-browser-headful.exe");

await piggy.launch({ mode: "tab", binary: binaryPath });
await piggy.register("books", "https://books.toscrape.com");

// Navigate to registered URL
await piggy.books.navigate();
console.log("Page 1:", piggy.books.url());

// Navigate to a different URL
await piggy.books.navigate("https://books.toscrape.com/catalogue/page-2.html");
await piggy.books.waitForSelector(".product_pod");
console.log("Page 2:", piggy.books.url());

// Go back
await piggy.books.goBack();
console.log("Back to:", piggy.books.url());

// Go forward
await piggy.books.goForward();
console.log("Forward to:", piggy.books.url());

// Reload
await piggy.books.reload();
console.log("Reloaded:", await piggy.books.title());

// Wait for elements
await piggy.books.waitForSelector(".product_pod");
console.log("Products visible ✓");

// Custom JS condition
await piggy.books.evaluate(() => {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (document.querySelectorAll(".product_pod").length >= 20) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
});
console.log("All 20 products loaded ✓");

// Get full page HTML
const html = await piggy.books.content();
console.log("\nHTML preview:", html.slice(0, 200));

await piggy.close();
```

### Expected Output

```
Page 1: https://books.toscrape.com
Page 2: https://books.toscrape.com/catalogue/page-2.html
Back to: https://books.toscrape.com/
Forward to: https://books.toscrape.com/catalogue/page-2.html
Reloaded: All products | Books to Scrape - Sandbox
Products visible ✓
All 20 products loaded ✓

HTML preview: <!DOCTYPE html><!--[if lt IE 7]>      <html lang="en-us" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->...
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `navigate(url?)` | `url?: string` | `Promise<void>` | Navigate to URL |
| `reload()` | — | `Promise<void>` | Reload current page |
| `goBack()` | — | `Promise<void>` | Go back in history |
| `goForward()` | — | `Promise<void>` | Go forward in history |
| `waitForNavigation()` | — | `Promise<void>` | Wait for page load |
| `title()` | — | `Promise<string>` | Get page title |
| `url()` | — | `string` (sync) | Get current URL |
| `content()` | — | `Promise<string>` | Get full page HTML |
| `waitForSelector(selector, timeout?)` | `selector: string, timeout?: number` | `Promise<void>` | Wait for element |

---

## Next Steps

- [Interactions API](../interactions) — Click, type, hover
- [Find API](../find) — Query DOM elements

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*