# 📊 Provide API — Structured Data Extraction

Extract structured data from web pages — text, attributes, tables, forms, lists, images, links, meta tags, JSON-LD, and full page metadata. One command, clean output.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

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

### `provide.text(selector)`
**Returns:** `Promise<string>` — visible text of first matching element, trimmed.

```ts
const price = await piggy.site.provide.text({ selector: ".price" });
// Returns: "$29.99"

const productCard = await piggy.site.provide.text({ selector: ".product-card" });
// Returns: "Wireless Mouse $29.99 Buy Now Ergonomic Rechargeable Silent clicks Black Add to Cart"
```

### `provide.textAll(selector)`
**Returns:** `Promise<string[]>` — visible text of **all** matching elements.

```ts
const allPrices = await piggy.site.provide.textAll({ selector: ".price" });
// Returns: ["$29.99", "$89.99"]

const titles = await piggy.site.provide.textAll({ selector: ".title" });
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

---

## HTML & Attributes

### `provide.html(selector)`
**Returns:** `Promise<string>` — raw inner HTML of first matching element.

```ts
const infoHtml = await piggy.site.provide.html({ selector: ".info" });
// Returns: `<h3 class="title">Wireless Mouse</h3>
//    <span class="price">$29.99</span>
//    <a href="/buy/42" class="buy-link">Buy Now</a>`
```

### `provide.attr({ selector, attr })`
**Returns:** `Promise<string>` — attribute value from first matching element.

```ts
const productId = await piggy.site.provide.attr({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: "42"

const imageSrc = await piggy.site.provide.attr({ selector: "img", attr: "src" });
// Returns: "/img/mouse.jpg"
```

### `provide.attrAll({ selector, attr })`
**Returns:** `Promise<string[]>` — attribute values from all matching elements.

```ts
const allProductIds = await piggy.site.provide.attrAll({ 
  selector: ".product-card", 
  attr: "data-id" 
});
// Returns: ["42", "99"]

const altTexts = await piggy.site.provide.attrAll({ selector: "img", attr: "alt" });
// Returns: ["Wireless Mouse", "Mechanical Keyboard"]
```

---

## Table Extraction

### `provide.table(selector)`
**Returns:** `Promise<{ headers: string[], rows: string[][] }>` — converts HTML table to JSON.

```ts
const comparison = await piggy.site.provide.table({ selector: "#comparison" });
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

### `provide.list({ selector, itemSel? })`
**Returns:** `Promise<string[]>` — extracts text from list items.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `selector` | **Required** | CSS selector for the list container |
| `itemSel` | `"li"` | Selector for individual items |

```ts
// Extract features from a <ul>
const features = await piggy.site.provide.list({ selector: ".features" });
// Returns: ["Ergonomic", "Rechargeable", "Silent clicks"]

// Extract product cards as list items
const products = await piggy.site.provide.list({ 
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

### `provide.links(selector?)`
**Returns:** `Promise<{ text: string, href: string, title: string }[]>` — all links.

```ts
// All links on page
const allLinks = await piggy.site.provide.links();
// Returns: [
//   { text: "Buy Now", href: "/buy/42", title: "" },
//   { text: "Buy Now", href: "/buy/99", title: "" }
// ]

// Links within a specific element
const productLinks = await piggy.site.provide.links({ 
  selector: ".product-card:first-child" 
});
// Returns: [{ text: "Buy Now", href: "/buy/42", title: "" }]
```

### `provide.images(selector?)`
**Returns:** `Promise<{ src: string, alt: string, width: number, height: number }[]>` — all images.

```ts
const allImages = await piggy.site.provide.images();
// Returns: [
//   { src: "/img/mouse.jpg", alt: "Wireless Mouse", width: 200, height: 200 },
//   { src: "/img/keyboard.jpg", alt: "Mechanical Keyboard", width: 300, height: 150 }
// ]

const productImages = await piggy.site.provide.images({ 
  selector: ".product-card" 
});
```

---

## Form Extraction

### `provide.form(selector)`
**Returns:** `Promise<Record<string, string>>` — form field name-value pairs.

```ts
const formData = await piggy.site.provide.form({ selector: ".add-to-cart" });
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
const page = await piggy.site.provide.page();
// Returns: {
//   title: "Product Page",
//   url: "https://example.com/products",
//   html: "<!DOCTYPE html>...",
//   text: "Product Page Wireless Mouse $29.99 Buy Now ..."
// }
```

---

## Element Structure

### `provide.div(selector)`
**Returns:** `Promise<DivDescriptor>` — element structure with **direct children only** (max 20). Not fully recursive — use `find.*` for deep traversal.

```ts
const productCard = await piggy.site.provide.div({ selector: ".product-card" });
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
const meta = await piggy.site.provide.meta();
// Returns: { "description": "Best wireless mice" }
```

Extracts `name` and `property` attributes as keys.

---

## Select Dropdown

### `provide.select(selector)`
**Returns:** `Promise<{ value: string, options: { text: string, value: string, selected: boolean }[] }>` — dropdown state.

```ts
const colorSelect = await piggy.site.provide.select({ selector: "select[name='color']" });
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

### `provide.json(selector?)`
**Returns:** `Promise<any>` — extracts embedded JSON (LD+JSON, Next.js, Nuxt, etc.).

```ts
const productJson = await piggy.site.provide.json();
// Returns: { "@type": "Product", "name": "Wireless Mouse", "price": "29.99" }

// Extract specific JSON block
const specificJson = await piggy.site.provide.json({ selector: "script[type='application/ld+json']" });
```

Finds `<script type="application/ld+json">`, `<script id="__NEXT_DATA__">`, or any `<script>` containing JSON.

---

## Complete Example

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("shop", "https://example.com/products");

await piggy.shop.navigate();
await piggy.shop.wait.selector({ selector: ".product-card", state: "attached" });

// Get page metadata
const page = await piggy.shop.provide.page();
console.log(`Page: ${page.title}`);

// Extract all products as text
const productNames = await piggy.shop.provide.textAll({ selector: ".title" });
console.log("Products:", productNames);

// Extract prices
const prices = await piggy.shop.provide.textAll({ selector: ".price" });
console.log("Prices:", prices);

// Extract table data
const comparison = await piggy.shop.provide.table({ selector: "#comparison" });
console.log("Comparison table:", comparison);

// Extract form data
const cartForm = await piggy.shop.provide.form({ selector: ".add-to-cart" });
console.log("Default cart:", cartForm);

// Extract all links
const links = await piggy.shop.provide.links();
console.log(`Found ${links.length} links`);

// Extract JSON-LD
const jsonLd = await piggy.shop.provide.json();
console.log("Structured data:", jsonLd);

await piggy.close();
```

---

## Response Samples

Based on the [sample HTML page](https://example.com/products):

### `provide.table("#comparison")`
```json
{
  "headers": ["Feature", "Mouse", "Keyboard"],
  "rows": [
    ["Wireless", "Yes", "No"],
    ["Backlit", "No", "Yes"]
  ]
}
```

### `provide.links()`
```json
[
  { "text": "Buy Now", "href": "/buy/42", "title": "" },
  { "text": "Buy Now", "href": "/buy/99", "title": "" }
]
```

### `provide.images()`
```json
[
  { "src": "/img/mouse.jpg", "alt": "Wireless Mouse", "width": 200, "height": 200 },
  { "src": "/img/keyboard.jpg", "alt": "Mechanical Keyboard", "width": 300, "height": 150 }
]
```

### `provide.form(".add-to-cart")`
```json
{ "product_id": "42", "color": "black" }
```

### `provide.meta()`
```json
{ "description": "Best wireless mice" }
```

### `provide.json()`
```json
{ "@type": "Product", "name": "Wireless Mouse", "price": "29.99" }
```

---

## API Reference

| Method | Parameters | Returns |
|--------|------------|---------|
| `provide.text(selector)` | `selector: string` | `Promise<string>` |
| `provide.textAll(selector)` | `selector: string` | `Promise<string[]>` |
| `provide.html(selector)` | `selector: string` | `Promise<string>` |
| `provide.attr({ selector, attr })` | `{ selector, attr }` | `Promise<string>` |
| `provide.attrAll({ selector, attr })` | `{ selector, attr }` | `Promise<string[]>` |
| `provide.table(selector)` | `selector: string` | `Promise<{ headers, rows }>` |
| `provide.list({ selector, itemSel? })` | `{ selector, itemSel? }` | `Promise<string[]>` |
| `provide.links(selector?)` | `selector?: string` | `Promise<LinkDescriptor[]>` |
| `provide.images(selector?)` | `selector?: string` | `Promise<ImageDescriptor[]>` |
| `provide.form(selector)` | `selector: string` | `Promise<Record<string, string>>` |
| `provide.page()` | — | `Promise<PageData>` |
| `provide.div(selector)` | `selector: string` | `Promise<DivDescriptor>` |
| `provide.meta()` | — | `Promise<Record<string, string>>` |
| `provide.select(selector)` | `selector: string` | `Promise<SelectData>` |
| `provide.json(selector?)` | `selector?: string` | `Promise<any>` |

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

- [Find API](./find) — Query DOM elements
- [Wait API](./wait) — Wait for elements to appear
- [Capture API](./capture) — Capture network traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
