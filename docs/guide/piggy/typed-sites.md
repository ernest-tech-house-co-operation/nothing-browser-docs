# 🏷️ Typed Sites with usePiggy

Get full TypeScript autocomplete for your registered sites. No more guessing what methods exist or what parameters they take.

---

## Overview

After calling `piggy.register()`, sites are dynamically added to the piggy object. `usePiggy<T>()` gives you type-safe access with full IDE autocomplete.

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch();
await piggy.register("amazon", "https://amazon.com");
await piggy.register("ebay", "https://ebay.com");

// Now get typed access
const { amazon, ebay } = usePiggy<"amazon" | "ebay">();

// IDE shows all SiteObject methods
await amazon.navigate();
await amazon.click("#search");
await amazon.type(".nav-input", "laptop");
```

---

## Optional: You Don't Have to Use usePiggy

`usePiggy` is **completely optional**. It exists to provide TypeScript autocomplete and type safety, but Piggy works perfectly fine without it.

### For JavaScript Users (No Types)

If you're writing plain JavaScript, just use `piggy` directly:

```js
import piggy from "nothing-browser";

await piggy.launch();
await piggy.register("amazon", "https://amazon.com");
await piggy.register("ebay", "https://ebay.com");

// Works fine - no types needed
await piggy.amazon.navigate();
await piggy.amazon.click("#search");
const title = await piggy.amazon.title();

console.log(title);
```

**No `usePiggy` import. No type parameters. Just works.**

### For TypeScript Users Who Don't Want Types

You can also skip `usePiggy` in TypeScript:

```ts
import piggy from "nothing-browser";

await piggy.launch();
await piggy.register("amazon", "https://amazon.com");

// This works, but piggy.amazon is type 'any'
// No autocomplete, but your code runs fine
await piggy.amazon.navigate();
const title = await piggy.amazon.title();
```

### When to Use usePiggy vs When to Skip

| Your Situation | Should you use usePiggy? |
|----------------|--------------------------|
| JavaScript developer | ❌ No - just use `piggy.siteName` directly |
| TypeScript, want quick prototyping | ❌ No - skip it, add types later |
| TypeScript, want full autocomplete | ✅ Yes - that's what it's for |
| TypeScript, building a large project | ✅ Yes - catches typos and errors |
| TypeScript API server with many endpoints | ✅ Yes - invaluable for maintenance |

### Three Ways to Use Piggy

```ts
// Way 1: Plain JavaScript (or TypeScript without types)
import piggy from "nothing-browser";
await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate(); // Works fine, no autocomplete

// Way 2: TypeScript with usePiggy (full autocomplete)
import piggy, { usePiggy } from "nothing-browser";
await piggy.register("amazon", "https://amazon.com");
const { amazon } = usePiggy<"amazon">();
await amazon.navigate(); // Full autocomplete + type safety

// Way 3: TypeScript, skip usePiggy (piggy.amazon is 'any')
import piggy from "nothing-browser";
await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate(); // No autocomplete, but types are optional
```

**Choose what works for you. Piggy doesn't force either approach.**

---

## Why usePiggy? (For Those Who Want Types)

| Without usePiggy | With usePiggy |
|------------------|---------------|
| `piggy.amazon` has type `any` | Full type safety |
| No autocomplete | All methods suggested |
| Typos cause runtime errors | Typos caught at compile time |
| Must check docs constantly | IDE shows everything |

---

## Basic Usage (TypeScript Users)

**Step 1: Register your sites**

```ts
import piggy from "nothing-browser";

await piggy.launch();
await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("walmart", "https://www.walmart.com");
```

**Step 2: Import `usePiggy` and call it**

```ts
import { usePiggy } from "nothing-browser";

// Must be called AFTER all register() calls
const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

// Now fully typed!
await amazon.navigate();
const title = await amazon.title();
await ebay.click(".search-button");
```

**Step 3: Use your sites**

```ts
// All SiteObject methods are available with full type inference
const products = await amazon.evaluate(() => {
  return Array.from(document.querySelectorAll(".product")).map(el => ({
    title: el.querySelector("h2")?.textContent,
    price: el.querySelector(".price")?.textContent,
  }));
});
```

---

## Type Safety in Action

### Autocomplete

When you type `amazon.`, your IDE shows:

```
amazon.
├── navigate()
├── click()
├── type()
├── evaluate()
├── screenshot()
├── capture.start()
├── cookies.list()
├── ... and all other SiteObject methods
```

### Type Checking

```ts
// ✅ Correct - TypeScript knows this method exists
await amazon.navigate("https://amazon.com");

// ❌ Compile error - method doesn't exist
await amazon.flyToMars();

// ✅ Correct - evaluate returns Promise<T>
const title: string = await amazon.evaluate(() => document.title);

// ❌ Compile error - can't assign string to number
const count: number = await amazon.evaluate(() => document.title);
```

---

## With Dynamic Site Names

If you have many sites or dynamic names, define a type:

```ts
type SiteNames = "amazon" | "ebay" | "walmart" | "target" | "bestbuy";

const sites = usePiggy<SiteNames>();
// sites.amazon, sites.ebay, sites.walmart, etc. are all typed
```

Or use a helper type:

```ts
import piggy, { usePiggy, type SiteObject } from "nothing-browser";

// Get all registered site names
type RegisteredSites = keyof typeof piggy;

// Use them
const sites = usePiggy<RegisteredSites>();
```

---

## Complete Example: Price Comparison

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Register all sites
await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");
await piggy.register("walmart", "https://www.walmart.com");

// Typed access
const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

// Navigate all in parallel
await Promise.all([
  amazon.navigate("https://amazon.com/s?k=laptop"),
  ebay.navigate("https://ebay.com/sch/i.html?_nkw=laptop"),
  walmart.navigate("https://walmart.com/search?q=laptop"),
]);

// Wait for content
await Promise.all([
  amazon.waitForSelector(".s-result-item"),
  ebay.waitForSelector(".s-item"),
  walmart.waitForSelector("[data-item-id]"),
]);

// Extract prices with full type safety
const [amazonPrices, ebayPrices, walmartPrices] = await Promise.all([
  amazon.evaluate(() => 
    Array.from(document.querySelectorAll(".a-price-whole")).map(el => ({
      price: el.textContent,
      seller: "Amazon"
    }))
  ),
  ebay.evaluate(() =>
    Array.from(document.querySelectorAll(".s-item__price")).map(el => ({
      price: el.textContent,
      seller: "eBay"
    }))
  ),
  walmart.evaluate(() =>
    Array.from(document.querySelectorAll(".price-main")).map(el => ({
      price: el.textContent,
      seller: "Walmart"
    }))
  ),
]);

console.log("Price comparison:", {
  amazon: amazonPrices.slice(0, 5),
  ebay: ebayPrices.slice(0, 5),
  walmart: walmartPrices.slice(0, 5),
});

await piggy.close();
```

---

## With Multi-Site Operations

`usePiggy` works perfectly with `piggy.all()` and `piggy.diff()`:

```ts
const { amazon, ebay, walmart } = usePiggy<"amazon" | "ebay" | "walmart">();

// Get all titles with type safety
const titles = await piggy.all([amazon, ebay, walmart]).title();
// titles: string[] ✅

// Get diff with site names
const diff = await piggy.diff([amazon, ebay, walmart]).url();
// diff: { amazon: string; ebay: string; walmart: string } ✅

// TypeScript knows the structure
console.log(diff.amazon); // ✅
console.log(diff.amazonz); // ❌ Compile error
```

---

## With API Server (Typed Routes)

Combine `usePiggy` with the built-in API server:

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

const { amazon } = usePiggy<"amazon">();

await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  // amazon is fully typed here too!
  await amazon.navigate(`https://amazon.com/s?k=${term}`);
  await amazon.waitForSelector(".s-result-item");
  
  const products = await amazon.evaluate(() => 
    Array.from(document.querySelectorAll("[data-asin]")).map(el => ({
      asin: el.getAttribute("data-asin"),
      title: el.querySelector("h2 span")?.textContent,
    }))
  );
  
  return { term, count: products.length, products };
});

await piggy.serve(3000);
console.log("API running at http://localhost:3000");
```

---

## Important Rules

### 1. Call `usePiggy` AFTER all `register()` calls

```ts
// ✅ Correct
await piggy.register("amazon", "...");
await piggy.register("ebay", "...");
const { amazon, ebay } = usePiggy<"amazon" | "ebay">();

// ❌ Wrong - sites not registered yet
const { amazon } = usePiggy<"amazon">();
await piggy.register("amazon", "..."); // Too late
```

### 2. Type parameter must match registered names

```ts
// ✅ Matches
await piggy.register("amazon", "...");
const { amazon } = usePiggy<"amazon">();

// ⚠️ Missing type parameter - still works but no inference
const { amazon } = usePiggy();

// ❌ Wrong name - compile error
const { amazon } = usePiggy<"amazn">(); // Type '"amazn"' doesn't exist
```

### 3. Works in both Bun and Node.js

`usePiggy` is a pure TypeScript utility - it works identically in both runtimes:

```ts
// Bun (default)
import piggy, { usePiggy } from "nothing-browser";

// Node.js (same code!)
import piggy, { usePiggy } from "nothing-browser";

// No difference - usePiggy works everywhere
```

---

## Runtime Support

Nothing Browser Piggy supports **both Bun and Node.js** with identical APIs.

| Runtime | Support | Status |
|---------|---------|--------|
| **Bun** | ✅ Full support | Primary runtime, fastest performance |
| **Node.js** | ✅ Full support | Works with all features |

### Bun Examples (in docs)

Most examples in this documentation use Bun syntax (top-level await, `Bun.write`, etc.):

```ts
// Bun-specific
await Bun.write("./output.json", JSON.stringify(data));
```

### Node.js Equivalent

```ts
// Node.js equivalent
import fs from "fs/promises";
await fs.writeFile("./output.json", JSON.stringify(data));
```

### Using Piggy with Node.js

```ts
// Works exactly the same in Node.js
import piggy, { usePiggy } from "nothing-browser";

async function main() {
  await piggy.launch({ mode: "tab" });
  await piggy.register("site", "https://example.com");
  
  const { site } = usePiggy<"site">();
  await site.navigate();
  
  const title = await site.title();
  console.log(title);
  
  await piggy.close();
}

main();
```

> **Note:** Most code examples in this documentation use Bun syntax for brevity. For Node.js, replace Bun-specific functions (like `Bun.write`) with their Node.js equivalents (like `fs.promises.writeFile`). The core Piggy API is identical across both runtimes.

---

## Common Patterns

### Pattern 1: Direct destructuring

```ts
const { amazon, ebay } = usePiggy<"amazon" | "ebay">();
```

### Pattern 2: Store in variable

```ts
const sites = usePiggy<"amazon" | "ebay" | "walmart">();
await sites.amazon.navigate();
await sites.ebay.navigate();
```

### Pattern 3: Dynamic iteration

```ts
const sites = usePiggy<"amazon" | "ebay" | "walmart">();
const siteNames = Object.keys(sites) as Array<keyof typeof sites>;

for (const name of siteNames) {
  await sites[name].navigate();
  console.log(await sites[name].title());
}
```

### Pattern 4: With session persistence

```ts
import { readFileSync, writeFileSync, existsSync } from "fs";

const { site } = usePiggy<"site">();

if (existsSync("./session.json")) {
  const session = JSON.parse(readFileSync("./session.json", "utf8"));
  await site.session.import(session);
}

await site.navigate();

// ... do work ...

const session = await site.session.export();
writeFileSync("./session.json", JSON.stringify(session));
```

---

## Troubleshooting

### "Property 'amazon' does not exist on type..."

**Solution:** Make sure the type parameter matches the registered name exactly:

```ts
await piggy.register("amazon", "...");
const { amazon } = usePiggy<"amazon">(); // ✅
const { amazon } = usePiggy<"amzn">();   // ❌
```

### "usePiggy must be called after register"

**Solution:** Reorder your code:

```ts
// ❌ Wrong order
const { site } = usePiggy();
await piggy.register("site", "...");

// ✅ Correct order
await piggy.register("site", "...");
const { site } = usePiggy();
```

### No autocomplete in IDE

**Solution:** Make sure you have TypeScript 4.9+ and the types are installed:

```bash
bun add -D @types/node  # For Node.js projects
# Piggy includes its own types, no extra @types package needed
```

### "I don't want to use usePiggy at all"

**Solution:** Don't! Just use `piggy` directly:

```js
import piggy from "nothing-browser";
await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate(); // Works fine
```

---

## API Reference

| Function | Description | Required? |
|----------|-------------|-----------|
| `usePiggy<T>()` | Returns typed piggy object with sites of type T | ❌ Optional |
| `usePiggy()` | Returns untyped piggy object (no autocomplete) | ❌ Optional |
| `piggy.siteName` | Direct access (works for everyone) | ✅ Always available |

### Type Parameter (TypeScript only)

```ts
usePiggy<"amazon" | "ebay" | "walmart">()
```

The type parameter should be a union of literal strings matching your registered site names.

---

## Summary

| You want... | Do this... |
|-------------|-------------|
| **Just working code** (JavaScript or TypeScript) | `piggy.amazon.navigate()` |
| **TypeScript autocomplete** | `const { amazon } = usePiggy<"amazon">()` |
| **No types, no fuss** | Ignore `usePiggy`, use `piggy` directly |
| **Both Bun and Node.js** | Same code works everywhere |

**`usePiggy` is 100% optional. Choose what works for your project.**

---

## Next Steps

- [Multi-Site Parallel](./multi-site) — Run operations across multiple sites
- [Built-in API Server](./api-server) — Turn your sites into REST APIs
- [Tab Pooling](./tab-pooling) — Handle concurrent requests with pooled tabs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
