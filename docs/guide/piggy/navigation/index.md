# 🧭 Navigation API — Page Navigation & Info

Control page navigation, get page information, and wait for page loads. Essential for moving around websites and capturing page state.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Navigation API provides methods for moving between pages and retrieving page metadata:

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

---

## Basic Navigation

### `navigate(url?, opts?)`

Navigates to a URL. If no URL is provided, uses the registered URL from `register()`.

```ts
// Navigate to registered URL
await piggy.site.navigate();

// Navigate to custom URL
await piggy.site.navigate("https://example.com/products");

// With retries
await piggy.site.navigate("https://example.com", { retries: 3 });
```

### Navigation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retries` | `number` | `0` | Number of retry attempts if navigation fails |

---

## History Navigation

### `reload()`

Reloads the current page.

```ts
await piggy.site.reload();
```

### `goBack()`

Goes back one page in history.

```ts
await piggy.site.goBack();
```

### `goForward()`

Goes forward one page in history.

```ts
await piggy.site.goForward();
```

---

## Page Information

### `title()`

Returns the current page title.

```ts
const title = await piggy.site.title();
console.log("Page title:", title);
// Output: "Product Page - Example.com"
```

### `url()`

Returns the current URL (cached, sync).

```ts
const url = piggy.site.url();  // Note: synchronous!
console.log("Current URL:", url);
// Output: "https://example.com/products"
```

### `content()`

Returns the full HTML content of the page.

```ts
const html = await piggy.site.content();
console.log("HTML length:", html.length);
console.log("First 200 chars:", html.substring(0, 200));
```

---

## Waiting for Navigation

### `waitForNavigation()`

Waits for the page to finish loading after an action that triggers navigation.

```ts
// Click that triggers navigation
await piggy.site.click("a[href='/about']");
await piggy.site.waitForNavigation();

console.log(await piggy.site.url());
// Output: "https://example.com/about"
```

---

## Complete Examples

### Example 1: Basic Page Navigation

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Navigate to homepage
await piggy.site.navigate();
console.log("Title:", await piggy.site.title());
console.log("URL:", piggy.site.url());

// Navigate to about page
await piggy.site.navigate("https://example.com/about");
console.log("Title:", await piggy.site.title());

// Go back to homepage
await piggy.site.goBack();
console.log("Back to:", piggy.site.url());

// Go forward to about page
await piggy.site.goForward();
console.log("Forward to:", piggy.site.url());

// Reload
await piggy.site.reload();
console.log("Reloaded:", await piggy.site.title());

await piggy.close();
```

### Example 2: Crawl Multiple Pages

```ts
await piggy.register("blog", "https://example.com/blog");

const urls = [
  "https://example.com/blog/post-1",
  "https://example.com/blog/post-2",
  "https://example.com/blog/post-3"
];

for (const url of urls) {
  console.log(`\nNavigating to: ${url}`);
  
  await piggy.blog.navigate(url);
  await piggy.blog.waitForNavigation();
  
  const title = await piggy.blog.title();
  const html = await piggy.blog.content();
  
  console.log(`  Title: ${title}`);
  console.log(`  HTML size: ${html.length} bytes`);
}
```

### Example 3: Form Submission with Navigation

```ts
await piggy.register("app", "https://example.com/login");

await piggy.app.navigate();
await piggy.app.type("#email", "user@example.com");
await piggy.app.type("#password", "password123");
await piggy.app.click("#login-btn");

// Wait for navigation to dashboard
await piggy.app.waitForNavigation();

// Verify we're on dashboard
const url = piggy.app.url();
if (url.includes("/dashboard")) {
  console.log("Login successful!");
  const title = await piggy.app.title();
  console.log("Dashboard:", title);
} else {
  console.log("Login failed, still on:", url);
}
```

### Example 4: Scrape Product Pages from Links

```ts
await piggy.register("shop", "https://books.toscrape.com");

// Get all product links
await piggy.shop.navigate();
const links = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });

console.log(`Found ${links.length} product links`);

for (let i = 0; i < Math.min(5, links.length); i++) {
  const link = links[i];
  console.log(`\n[${i + 1}] Navigating to: ${link}`);
  
  await piggy.shop.navigate(link);
  await piggy.shop.waitForNavigation();
  
  const title = await piggy.shop.title();
  const price = await piggy.shop.fetch.text({ query: ".price_color" });
  
  console.log(`  Title: ${title}`);
  console.log(`  Price: ${price}`);
  
  // Go back to product list
  await piggy.shop.goBack();
  await piggy.shop.waitForNavigation();
}
```

### Example 5: Handle Navigation Timeout

```ts
try {
  await piggy.site.navigate("https://very-slow-site.com");
  await piggy.site.waitForNavigation();
} catch (error) {
  console.error("Navigation timeout or failed:", error.message);
  // Try reload or fallback
  await piggy.site.reload();
}
```

### Example 6: Monitor Navigation Events

```ts
// Subscribe to navigation events
piggy.site.on("navigate", (url) => {
  console.log(`Site navigated to: ${url}`);
});

await piggy.site.navigate("https://example.com/page1");
await piggy.site.navigate("https://example.com/page2");
await piggy.site.goBack();

// Output:
// Site navigated to: https://example.com/page1
// Site navigated to: https://example.com/page2
// Site navigated to: https://example.com/page1
```

### Example 7: Retry on Navigation Failure

```ts
async function navigateWithRetry(site: any, url: string, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`Attempt ${i}/${maxRetries}: ${url}`);
      await site.navigate(url);
      await site.waitForNavigation();
      console.log("Navigation successful!");
      return true;
    } catch (error) {
      console.log(`Attempt ${i} failed:`, error.message);
      if (i === maxRetries) throw error;
      await site.wait(2000);  // Wait before retry
    }
  }
  return false;
}

await navigateWithRetry(piggy.site, "https://unstable-site.com");
```

### Example 8: Get Page Content for Analysis

```ts
await piggy.site.navigate("https://example.com/article");

const title = await piggy.site.title();
const url = piggy.site.url();
const html = await piggy.site.content();
const wordCount = html.split(/\s+/).length;

console.log(`
Article Analysis:
  Title: ${title}
  URL: ${url}
  HTML size: ${html.length} bytes
  Word count: ${wordCount}
`);
```

---

## Error Handling

```ts
try {
  await piggy.site.navigate("https://invalid-url-that-doesnt-exist.com");
  await piggy.site.waitForNavigation();
} catch (error) {
  console.error("Navigation failed:", error.message);
  // Handle: maybe retry or exit
}

try {
  await piggy.site.navigate("https://example.com");
  // Click that causes navigation
  await piggy.site.click("#redirect-btn");
  await piggy.site.waitForNavigation();
} catch (error) {
  console.error("Navigation after click failed:", error.message);
}
```

---

## Best Practices

### Always Wait for Navigation After Clicks

```ts
// ✅ Good
await piggy.site.click("a[href='/page2']");
await piggy.site.waitForNavigation();

// ❌ Bad — might try to interact before page loads
await piggy.site.click("a[href='/page2']");
const title = await piggy.site.title();  // May still be old page
```

### Use `url()` for Quick Checks

```ts
// url() is synchronous — use for quick checks
if (piggy.site.url().includes("/dashboard")) {
  console.log("On dashboard");
}

// For fresh URL after navigation, use waitForNavigation first
await piggy.site.click("#submit");
await piggy.site.waitForNavigation();
const newUrl = piggy.site.url();  // Now updated
```

### Extract Content After Navigation

```ts
await piggy.site.navigate("https://example.com");
await piggy.site.waitForNavigation();  // Ensure fully loaded

// Now safe to extract
const html = await piggy.site.content();
const title = await piggy.site.title();
```

---

## API Reference

### Navigation Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `navigate(url?, opts?)` | `url?: string, opts?: { retries?: number }` | `Promise<void>` | Navigate to URL |
| `reload()` | — | `Promise<void>` | Reload current page |
| `goBack()` | — | `Promise<void>` | Go back in history |
| `goForward()` | — | `Promise<void>` | Go forward in history |
| `waitForNavigation()` | — | `Promise<void>` | Wait for page load |

### Page Info Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `title()` | — | `Promise<string>` | Get page title |
| `url()` | — | `string` (sync) | Get current URL (cached) |
| `content()` | — | `Promise<string>` | Get full page HTML |

### Event

| Event | Data | Description |
|-------|------|-------------|
| `navigate` | `url: string` | Triggered on navigation |

---

## Type Definitions

```ts
interface NavigateOptions {
  retries?: number;
}
```

---

## Next Steps

- [Interactions API](./click) — Click, type, hover
- [Wait API](./wait) — Wait for elements
- [Find API](./find) — Query DOM elements

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*       