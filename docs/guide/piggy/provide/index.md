# 📊 Provide API — Structured Data Extraction

Extract structured data from web pages — text, attributes, tables, forms, lists, images, links, meta tags, JSON-LD, and full page metadata. One command, clean output.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.21+

---

## Overview

The `provide.*` API family extracts data from DOM elements in structured formats. Unlike raw DOM traversal, these methods return ready-to-use JavaScript objects.

| Method | Returns | Use Case |
|--------|---------|----------|
| `provide.text()` | `string` | Get text from first matching element |
| `provide.textAll()` | `string[]` | Get text from all matching elements |
| `provide.html()` | `string` | Get inner HTML |
| `provide.attr()` | `string` | Get single attribute value |
| `provide.attrAll()` | `string[]` | Get attribute values from all matches |
| `provide.table()` | `{ headers, rows }` | Convert HTML table to JSON |
| `provide.list()` | `string[]` | Extract list items |
| `provide.links()` | `{ text, href, title }[]` | Extract all links |
| `provide.images()` | `{ src, alt, width, height }[]` | Extract all images |
| `provide.form()` | `Record<string, string>` | Extract form field values |
| `provide.page()` | `{ title, url, html, text }` | Get full page metadata |
| `provide.div()` | `DivDescriptor` | Get element structure (with direct children) |
| `provide.meta()` | `Record<string, string>` | Extract meta tags |
| `provide.select()` | `{ value, options[] }` | Get select dropdown state |
| `provide.json()` | `any` | Extract embedded JSON-LD |

---

## Text Extraction

### `provide.text({ selector, parent? })`

**Returns:** `Promise<string>` — visible text of first matching element, trimmed.

```ts
const price = await piggy.books.provide.text({ selector: ".price" });
// Returns: "$29.99"

// With parent scoping
const productCards = await piggy.books.find.css(".product-card");
for (const card of productCards) {
  const price = await piggy.books.provide.text({
    selector: ".price",
    parent: card.cls  // Only search inside this card
  });
  console.log(price);
}
```

### `provide.textAll({ selector, parent? })`

**Returns:** `Promise<string[]>` — visible text of **all** matching elements.

```ts
const allPrices = await piggy.books.provide.textAll({ selector: ".price" });
// Returns: ["$29.99", "$89.99"]

const titles = await piggy.books.provide.textAll({ selector: ".title" });
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

---

## HTML & Attributes

### `provide.html({ selector, parent? })`

**Returns:** `Promise<string>` — raw inner HTML of first matching element.

```ts
const infoHtml = await piggy.books.provide.html({ selector: ".info" });
// Returns: `<h3 class="title">Wireless Mouse</h3>
//    <span class="price">$29.99</span>
//    <a href="/buy/42" class="buy-link">Buy Now</a>`
```

### `provide.attr({ selector, attr, parent? })`

**Returns:** `Promise<string>` — attribute value from first matching element.

```ts
const productId = await piggy.books.provide.attr({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: "42"

const imageSrc = await piggy.books.provide.attr({ selector: "img", attr: "src" });
// Returns: "/img/mouse.jpg"
```

### `provide.attrAll({ selector, attr, parent? })`

**Returns:** `Promise<string[]>` — attribute values from all matching elements.

```ts
const allProductIds = await piggy.books.provide.attrAll({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: ["42", "99"]

const altTexts = await piggy.books.provide.attrAll({ selector: "img", attr: "alt" });
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

---

## Table Extraction

### `provide.table({ selector })`

**Returns:** `Promise<{ headers: string[], rows: string[][] }>` — converts HTML table to JSON.

```ts
const comparison = await piggy.books.provide.table({ selector: "#comparison" });
// Returns: {
//   headers: ["Feature", "Mouse", "Keyboard"],
//   rows: [
//     ["Wireless", "Yes", "No"],
//     ["Backlit", "No", "Yes"]
//   ]
// }
```

---

## List Extraction

### `provide.list({ selector, itemSel?, parent? })`

**Returns:** `Promise<string[]>` — extracts text from list items.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `selector` | **Required** | CSS selector for the list container |
| `itemSel` | `"li"` | Selector for individual items |

```ts
// Extract features from a <ul>
const features = await piggy.books.provide.list({ selector: ".features" });
// Returns: ["Ergonomic", "Rechargeable", "Silent clicks"]

// Extract product cards as list items
const products = await piggy.books.provide.list({ 
  selector: "#product-list", 
  itemSel: ".product-card" 
});
// Returns: [
//   "Wireless Mouse $29.99 Buy Now Ergonomic...",
//   "Mechanical Keyboard $89.99 Buy Now RGB..."
// ]
```

---

## Links & Images

### `provide.links({ selector?, parent? })`

**Returns:** `Promise<{ text: string, href: string, title: string }[]>` — all links.

```ts
// All links on page
const allLinks = await piggy.books.provide.links();
// Returns: [
//   { text: "Buy Now", href: "/buy/42", title: "" },
//   { text: "Buy Now", href: "/buy/99", title: "" }
// ]

// Links within a specific element
const productLinks = await piggy.books.provide.links({ 
  selector: ".product-card:first-child" 
});
// Returns: [{ text: "Buy Now", href: "/buy/42", title: "" }]
```

### `provide.images({ selector?, parent? })`

**Returns:** `Promise<{ src: string, alt: string, width: number, height: number }[]>` — all images.

```ts
const allImages = await piggy.books.provide.images();
// Returns: [
//   { src: "/img/mouse.jpg", alt: "Wireless Mouse", width: 200, height: 200 },
//   { src: "/img/keyboard.jpg", alt: "Mechanical Keyboard", width: 300, height: 150 }
// ]

const productImages = await piggy.books.provide.images({ 
  selector: ".product-card" 
});
```

---

## Form Extraction

### `provide.form({ selector })`

**Returns:** `Promise<Record<string, string>>` — form field name-value pairs.

```ts
const formData = await piggy.books.provide.form({ selector: ".add-to-cart" });
// Returns: { product_id: "42", color: "black" }
```

Works with:
- `<input>` (text, hidden, radio, checkbox — returns "on" if checked)
- `<select>` (returns selected value)
- `<textarea>`
- `<button>` (only if it has a name)

---

## Page Metadata

### `provide.page()`

**Returns:** `Promise<{ title: string, url: string, html: string, text: string }>` — full page info.

```ts
const page = await piggy.books.provide.page();
// Returns: {
//   title: "Product Page",
//   url: "https://example.com/products",
//   html: "<!DOCTYPE html>...",
//   text: "Product Page Wireless Mouse $29.99 Buy Now ..."
// }
```

---

## Element Structure

### `provide.div({ selector })`

**Returns:** `Promise<DivDescriptor>` — element structure with **direct children only** (max 20). Not fully recursive — use `find.*` for deep traversal.

```ts
const productCard = await piggy.books.provide.div({ selector: ".product-card" });
// Returns: {
//   tag: "div",
//   id: "",
//   cls: "product-card",
//   text: "Wireless Mouse $29.99 Buy Now ...",
//   html: "<img...><div class=\"info\">...",
//   children: [
//     { tag: "img", id: "", cls: "", text: "", html: "", src: "/img/mouse.jpg", alt: "Wireless Mouse" },
//     { tag: "div", id: "", cls: "info", text: "Wireless Mouse $29.99 Buy Now", html: "...", children: [...] },
//     { tag: "ul", children: [...] },
//     { tag: "form", children: [...] }
//   ]
// }
```

**DivDescriptor interface:**
```ts
interface DivDescriptor {
  tag: string;
  id: string;
  cls: string;
  text: string;
  html: string;
  children: DivDescriptor[];   // direct children only, max 20
}
```

---

## Meta Tags

### `provide.meta()`

**Returns:** `Promise<Record<string, string>>` — all `<meta>` tags.

```ts
const meta = await piggy.books.provide.meta();
// Returns: { "description": "Best wireless mice" }
```

Extracts `name` and `property` attributes as keys.

---

## Select Dropdown

### `provide.select({ selector })`

**Returns:** `Promise<{ value: string, options: { text: string, value: string, selected: boolean }[] }>` — dropdown state.

```ts
const colorSelect = await piggy.books.provide.select({ selector: "select[name='color']" });
// Returns: {
//   value: "black",
//   options: [
//     { text: "Black", value: "black", selected: true },
//     { text: "White", value: "white", selected: false }
//   ]
// }
```

---

## JSON-LD Extraction

### `provide.json({ selector? })`

**Returns:** `Promise<any>` — extracts embedded JSON (LD+JSON, Next.js, Nuxt, etc.).

```ts
const productJson = await piggy.books.provide.json();
// Returns: { "@type": "Product", "name": "Wireless Mouse", "price": "29.99" }

// Extract specific JSON block
const specificJson = await piggy.books.provide.json({ selector: "script[type='application/ld+json']" });
```

Finds `<script type="application/ld+json">`, `<script id="__NEXT_DATA__">`, or any `<script>` containing JSON.

---

## Working Example: Bulk Extraction

The cleanest way to extract data is using the bulk `textAll` and `attrAll` methods:

```typescript
// APPROACH 3: Provide API bulk methods
const titles         = await piggy.books.provide.textAll({ selector: ".product_pod h3 a" });
const prices         = await piggy.books.provide.textAll({ selector: ".price_color" });
const ratingClasses  = await piggy.books.provide.attrAll({ selector: ".star-rating", attr: "class" });
const ratings        = ratingClasses.map(r => r.replace("star-rating ", ""));
const availabilities = await piggy.books.provide.textAll({ selector: ".availability" });
const inStockStatus  = availabilities.map(a => a === "In stock");

// Combine into objects
const books = titles.map((title, i) => ({
  title,
  price:   prices[i]   ?? "",
  rating:  ratings[i]  ?? "",
  inStock: inStockStatus[i] ?? false,
}));

console.log(`Found ${books.length} books`);
```

---

## Parent Scoping with ElementDescriptor

When you have an element from `find.css()`, use its `cls` property for parent scoping:

```typescript
const productCards = await piggy.books.find.css(".product_pod");

for (const card of productCards) {
  const price = await piggy.books.provide.text({
    selector: ".price_color",
    parent: card.cls  // ← Scope search to this specific card
  });
  
  const ratingClass = await piggy.books.provide.attr({
    selector: ".star-rating",
    attr: "class",
    parent: card.cls,
  });
  
  console.log({ price, rating: ratingClass });
}
```

### Why `card.cls`?

The `ElementDescriptor` returned by `find.css()` contains:
- `cls`: The class attribute value (perfect for scoping)
- `id`: The ID attribute
- `tag`: The element tag name

Use `parent: card.cls` to restrict your selector to inside that specific element.

---

## API Reference

| Method | Parameters | Returns |
|--------|------------|---------|
| `provide.text({ selector, parent? })` | `{ selector, parent? }` | `Promise<string>` |
| `provide.textAll({ selector, parent? })` | `{ selector, parent? }` | `Promise<string[]>` |
| `provide.html({ selector, parent? })` | `{ selector, parent? }` | `Promise<string>` |
| `provide.attr({ selector, attr, parent? })` | `{ selector, attr, parent? }` | `Promise<string>` |
| `provide.attrAll({ selector, attr, parent? })` | `{ selector, attr, parent? }` | `Promise<string[]>` |
| `provide.table({ selector })` | `{ selector }` | `Promise<{ headers, rows }>` |
| `provide.list({ selector, itemSel?, parent? })` | `{ selector, itemSel?, parent? }` | `Promise<string[]>` |
| `provide.links({ selector?, parent? })` | `{ selector?, parent? }` | `Promise<LinkDescriptor[]>` |
| `provide.images({ selector?, parent? })` | `{ selector?, parent? }` | `Promise<ImageDescriptor[]>` |
| `provide.form({ selector })` | `{ selector }` | `Promise<Record<string, string>>` |
| `provide.page()` | — | `Promise<PageData>` |
| `provide.div({ selector })` | `{ selector }` | `Promise<DivDescriptor>` |
| `provide.meta()` | — | `Promise<Record<string, string>>` |
| `provide.select({ selector })` | `{ selector }` | `Promise<SelectData>` |
| `provide.json({ selector? })` | `{ selector? }` | `Promise<any>` |

---

## Type Definitions

```ts
interface LinkDescriptor {
  text: string;
  href: string;
  title: string;
}

interface ImageDescriptor {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface PageData {
  title: string;
  url: string;
  html: string;
  text: string;
}

interface DivDescriptor {
  tag: string;
  id: string;
  cls: string;
  text: string;
  html: string;
  children: DivDescriptor[];
}

interface SelectData {
  value: string;
  options: {
    text: string;
    value: string;
    selected: boolean;
  }[];
}

interface TableData {
  headers: string[];
  rows: string[][];
}
```

---

## Next Steps

- [Find API](../find) — Query DOM elements
- [Wait API](../wait) — Wait for elements before extraction
- [Capture API](../capture) — Capture network traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*