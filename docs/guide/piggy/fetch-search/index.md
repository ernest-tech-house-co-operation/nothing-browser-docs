# 🔍 Fetch & Search API — Quick DOM Queries

Simple, legacy-friendly methods for extracting text, attributes, links, and images from the DOM. Perfect for quick scraping without the full power of `find.*` or `provide.*`.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Fetch & Search APIs are convenience methods for common DOM operations. They're simpler than `find.*` but less powerful.

| Method | Returns | Use Case |
|--------|---------|----------|
| `fetch.text()` | `string \| null` | Get text from first matching element |
| `fetch.textAll()` | `string[]` | Get text from all matching elements |
| `fetch.attr()` | `string \| null` | Get attribute from first match |
| `fetch.attrAll()` | `string[]` | Get attribute from all matches |
| `fetch.links()` | `string[]` | Get href attributes from links |
| `fetch.linksAll()` | `string[]` | Get all href attributes on page |
| `fetch.image()` | `string[]` | Get src attributes from images |
| `search.css()` | `any` | Full DOM snapshot via CSS selector |
| `search.id()` | `any` | DOM snapshot by element ID |

> 💡 **Tip:** For structured data extraction (tables, forms, JSON-LD), use [`provide.*`](../provide) instead. For element descriptors and traversal, use [`find.*`](../find).

---

## Fetch Methods

### `fetch.text(selector)`

Returns the text content of the first matching element.

```ts
const price = await piggy.site.fetch.text({ query: ".price" });
// Returns: "$29.99"

const heading = await piggy.site.fetch.text({ query: "h1" });
// Returns: "Product Page"
```

### `fetch.textAll(selector)`

Returns text content of all matching elements.

```ts
const prices = await piggy.site.fetch.textAll({ selector: ".price" });
// Returns: ["$29.99", "$89.99"]

const titles = await piggy.site.fetch.textAll({ selector: ".title" });
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

### `fetch.attr(selector, attr)`

Returns attribute value of the first matching element.

```ts
const productId = await piggy.site.fetch.attr({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: "42"

const imageSrc = await piggy.site.fetch.attr({ 
  selector: "img", 
  attr: "src" 
});
// Returns: "/img/mouse.jpg"
```

### `fetch.attrAll(selector, attr)`

Returns attribute values of all matching elements.

```ts
const allIds = await piggy.site.fetch.attrAll({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: ["42", "99"]

const allAltTexts = await piggy.site.fetch.attrAll({ 
  selector: "img", 
  attr: "alt" 
});
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

### `fetch.links(selector)`

Returns href attributes from links within the selector.

```ts
const productLinks = await piggy.site.fetch.links({ 
  query: ".product-card:first-child" 
});
// Returns: ["/buy/42"]

const navLinks = await piggy.site.fetch.links({ query: "nav a" });
```

### `fetch.linksAll()`

Returns all href attributes on the entire page.

```ts
const allLinks = await piggy.site.fetch.links.all();
// Returns: ["/buy/42", "/buy/99"]
```

### `fetch.image(selector)`

Returns src attributes from images within the selector.

```ts
const productImages = await piggy.site.fetch.image({ 
  query: ".product-card" 
});
// Returns: ["/img/mouse.jpg", "/img/keyboard.jpg"]
```

---

## Search Methods

### `search.css(query)`

Returns a full DOM snapshot for elements matching the CSS selector.

```ts
const products = await piggy.site.search.css({ query: ".product-card" });
// Returns large JSON object with DOM structure
```

### `search.id(query)`

Returns DOM snapshot for element with specific ID.

```ts
const productList = await piggy.site.search.id({ query: "product-list" });
// Returns: { tag: "div", id: "product-list", cls: "", text: "...", html: "...", ... }
```

---

## Real-World Examples

### Example 1: Extract Product Prices

```ts
await piggy.shop.navigate("https://example.com/products");
await piggy.shop.wait.selector({ selector: ".product-card", state: "attached" });

const prices = await piggy.shop.fetch.textAll({ selector: ".price" });
console.log("Prices:", prices);

const minPrice = Math.min(...prices.map(p => parseFloat(p.replace("$", ""))));
console.log(`Cheapest: $${minPrice}`);
```

### Example 2: Get All Product Links

```ts
const productLinks = await piggy.shop.fetch.links({ query: ".product-card a" });

for (const link of productLinks) {
  console.log(`Product URL: ${link}`);
  await piggy.shop.navigate(link);
  const title = await piggy.shop.fetch.text({ query: "h1" });
  console.log(`Title: ${title}`);
  await piggy.shop.goBack();
}
```

### Example 3: Extract Image Gallery

```ts
const images = await piggy.shop.fetch.image({ query: ".gallery img" });

for (const img of images) {
  console.log(`Image URL: ${img}`);
  // Download or process image
}
```

### Example 4: Form Data Extraction

```ts
const email = await piggy.site.fetch.attr({ 
  selector: "#email", 
  attr: "value" 
});

const checkboxChecked = await piggy.site.fetch.attr({ 
  selector: "#remember", 
  attr: "checked" 
});

console.log({ email, remember: !!checkboxChecked });
```

### Example 5: Get All External Links

```ts
const allLinks = await piggy.site.fetch.links.all();
const externalLinks = allLinks.filter(link => 
  link.startsWith("http") && !link.includes("example.com")
);

console.log(`Found ${externalLinks.length} external links`);
```

### Example 6: Monitor Dynamic Content

```ts
// Get initial product count
const initialProducts = await piggy.site.fetch.textAll({ selector: ".product-title" });

// Click load more
await piggy.site.click("#load-more");
await piggy.site.wait.selector({ selector: ".product-card:last-child", state: "attached" });

// Get new product count
const newProducts = await piggy.site.fetch.textAll({ selector: ".product-title" });
console.log(`Loaded ${newProducts.length - initialProducts.length} new products`);
```

### Example 7: Search by ID

```ts
const mainContent = await piggy.site.search.id({ query: "main" });
console.log("Main content HTML:", mainContent.html.substring(0, 200));

const footer = await piggy.site.search.id({ query: "footer" });
console.log("Footer text:", footer.text);
```

---

## Comparison with Find & Provide

| Task | Fetch | Find | Provide |
|------|-------|------|---------|
| Get text from first match | ✅ `fetch.text()` | ✅ `find.css()[0]?.text` | ✅ `provide.text()` |
| Get text from all matches | ✅ `fetch.textAll()` | ✅ `find.css().map(...)` | ✅ `provide.textAll()` |
| Get element structure | ❌ | ✅ `find.css()` | ✅ `provide.div()` |
| Extract table to JSON | ❌ | ❌ | ✅ `provide.table()` |
| Extract form data | ❌ | ❌ | ✅ `provide.form()` |
| DOM traversal | ❌ | ✅ `find.parent()`, `find.children()` | ❌ |
| Get attribute | ✅ `fetch.attr()` | ✅ `find.css()[0]?.attrs` | ✅ `provide.attr()` |

**When to use Fetch:**
- Quick, one-off extractions
- Simple text/attribute retrieval
- Legacy code migration

**When to use Find:**
- Need element metadata (tag, id, class, etc.)
- DOM traversal (parent, children, closest)
- State checks (visible, enabled, checked)

**When to use Provide:**
- Complex extraction (tables, forms, lists)
- Structured data (JSON-LD, meta tags)
- Full page metadata

---

## API Reference

### Fetch Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `fetch.text({ query })` | `query: string` | `Promise<string \| null>` | Text of first match |
| `fetch.textAll({ selector })` | `selector: string` | `Promise<string[]>` | Text of all matches |
| `fetch.attr({ selector, attr })` | `selector: string, attr: string` | `Promise<string \| null>` | Attribute of first match |
| `fetch.attrAll({ selector, attr })` | `selector: string, attr: string` | `Promise<string[]>` | Attribute of all matches |
| `fetch.links({ query })` | `query: string` | `Promise<string[]>` | Hrefs from links in selector |
| `fetch.links.all()` | — | `Promise<string[]>` | All hrefs on page |
| `fetch.image({ query })` | `query: string` | `Promise<string[]>` | Srcs from images in selector |

### Search Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `search.css({ query })` | `query: string` | `Promise<any>` | DOM snapshot by CSS |
| `search.id({ query })` | `query: string` | `Promise<any>` | DOM snapshot by ID |

---

## Type Definitions

```ts
interface FetchTextOptions {
  query: string;  // CSS selector (legacy name)
}

interface FetchTextAllOptions {
  selector: string;  // CSS selector
}

interface FetchAttrOptions {
  selector: string;
  attr: string;
}

interface FetchAttrAllOptions {
  selector: string;
  attr: string;
}

interface FetchLinksOptions {
  query: string;
}

interface FetchImageOptions {
  query: string;
}

interface SearchCssOptions {
  query: string;
}

interface SearchIdOptions {
  query: string;
}
```

---

## Next Steps

- [Find API](../find) — Full DOM query with element descriptors
- [Provide API](../provide) — Structured data extraction
- [Wait API](../wait) — Wait for elements before fetching

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*