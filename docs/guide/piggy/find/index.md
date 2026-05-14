# 🔍 Find API — DOM Query & Element Descriptors

Query the DOM, find elements by CSS, text, attributes, tags, roles, and traverse the tree. Every `find.*` command returns an **ElementDescriptor** with element metadata.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## What is an ElementDescriptor?

All `find.*` commands return an array of `ElementDescriptor` objects:

```ts
interface ElementDescriptor {
  tag: string;                      // element tag name (e.g., "div", "span", "button")
  id: string;                       // element id attribute (or empty string)
  cls: string;                      // element class attribute (or empty string)
  text: string;                     // innerText, first 400 chars
  html: string;                     // innerHTML, first 800 chars
  href: string;                     // href attribute (if any)
  src: string;                      // src attribute (if any)
  value: string;                    // value attribute (if any)
  attrs: Record<string, string>;    // all attributes as key-value pairs
}
```

---

## Find by CSS Selector

### `find.css(selector)`
**Returns:** `Promise<ElementDescriptor[]>` — all elements matching the CSS selector.

```ts
const prices = await piggy.site.find.css({ selector: ".price" });
// Returns: [
//   { tag: "span", cls: "price", text: "$29.99", ... },
//   { tag: "span", cls: "price", text: "$89.99", ... }
// ]
```

### `find.first(selector)`
**Returns:** `Promise<ElementDescriptor[]>` — first matching element (0 or 1 results).

```ts
const firstTitle = await piggy.site.find.first({ selector: ".title" });
// Returns: [{ tag: "h3", cls: "title", text: "Wireless Mouse", ... }]
```

### `find.all(selector)`
**Returns:** `Promise<ElementDescriptor[]>` — alias for `find.css()`.

---

## Find by Content

### `find.byText({ text, selector?, exact? })`
**Returns:** `Promise<ElementDescriptor[]>` — elements containing the specified text.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | **Required** | Text to search for |
| `selector` | `string` | `"*"` | Optional CSS selector to limit search |
| `exact` | `boolean` | `false` | If `true`, matches exact text (case-sensitive) |

```ts
// Find any element containing "Silent clicks"
const silent = await piggy.site.find.byText({ text: "Silent clicks" });
// Returns: [{ tag: "li", text: "Silent clicks", ... }]

// Find exact match (case-sensitive)
const addToCart = await piggy.site.find.byText({ text: "Add to Cart", exact: true });
// Returns: [{ tag: "button", text: "Add to Cart", ... }]

// Limit search to buttons only
const buttonsWithText = await piggy.site.find.byText({ 
  text: "Add", 
  selector: "button" 
});
```

---

## Find by Attribute

### `find.byAttr({ attr, value?, selector? })`
**Returns:** `Promise<ElementDescriptor[]>` — elements with a matching attribute.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `attr` | `string` | **Required** | Attribute name (e.g., "data-id", "class") |
| `value` | `string` | `undefined` | Optional attribute value to match |
| `selector` | `string` | `"*"` | Optional CSS selector to limit search |

```ts
// Find elements with data-id attribute (any value)
const withDataId = await piggy.site.find.byAttr({ attr: "data-id" });

// Find specific value
const product99 = await piggy.site.find.byAttr({ attr: "data-id", value: "99" });
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "99", class: "product-card" }, ... }]
```

---

## Find by Tag Name

### `find.byTag(tag)`
**Returns:** `Promise<ElementDescriptor[]>` — all elements with the given tag name.

```ts
const images = await piggy.site.find.byTag({ tag: "img" });
// Returns: [
//   { tag: "img", src: "/img/mouse.jpg", alt: "Wireless Mouse", ... },
//   { tag: "img", src: "/img/keyboard.jpg", alt: "Mechanical Keyboard", ... }
// ]

const buttons = await piggy.site.find.byTag({ tag: "button" });
```

---

## Find by Input Placeholder

### `find.byPlaceholder(text)`
**Returns:** `Promise<ElementDescriptor[]>` — input elements with matching placeholder text.

```ts
const emailInput = await piggy.site.find.byPlaceholder({ text: "Enter your email" });
// Returns: [{ tag: "input", attrs: { placeholder: "Enter your email", type: "email" }, ... }]
```

---

## Find by ARIA Role

### `find.byRole({ role, name? })`
**Returns:** `Promise<ElementDescriptor[]>` — elements with matching ARIA role.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `role` | `string` | **Required** | ARIA role (e.g., "button", "navigation", "dialog") |
| `name` | `string` | `undefined` | Optional accessible name to match |

```ts
// Find all buttons
const buttons = await piggy.site.find.byRole({ role: "button" });

// Find navigation landmark
const nav = await piggy.site.find.byRole({ role: "navigation" });

// Find button with specific name
const submitBtn = await piggy.site.find.byRole({ role: "button", name: "Submit" });
```

---

## DOM Traversal

### `find.closest({ selector, ancestor })`
**Returns:** `Promise<ElementDescriptor[]>` — finds the closest ancestor matching the selector.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string` | Element to start from |
| `ancestor` | `string` | CSS selector for the ancestor to find |

```ts
// From a price, find the containing product card
const productCard = await piggy.site.find.closest({ 
  selector: ".price", 
  ancestor: ".product-card" 
});
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "42" }, ... }]
```

### `find.parent(selector)`
**Returns:** `Promise<ElementDescriptor[]>` — direct parent of the matching element.

```ts
const parentOfPrice = await piggy.site.find.parent({ selector: ".price" });
// Returns: [{ tag: "div", cls: "info", ... }]
```

### `find.children(selector)`
**Returns:** `Promise<ElementDescriptor[]>` — direct children of the matching element.

```ts
const features = await piggy.site.find.children({ selector: ".features" });
// Returns: [
//   { tag: "li", text: "Ergonomic", ... },
//   { tag: "li", text: "Rechargeable", ... },
//   { tag: "li", text: "Silent clicks", ... }
// ]
```

---

## Filtering

### `find.filter({ selector, attr, value })`
**Returns:** `Promise<ElementDescriptor[]>` — filters elements by attribute value.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string` | CSS selector for elements to filter |
| `attr` | `string` | Attribute name to check |
| `value` | `string` | Value to match |

```ts
const product42 = await piggy.site.find.filter({ 
  selector: ".product-card", 
  attr: "data-id", 
  value: "42" 
});
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "42" }, ... }]
```

---

## Element State Checks

### `find.count(selector)`
**Returns:** `Promise<number>` — number of elements matching selector.

```ts
const count = await piggy.site.find.count({ selector: ".product-card" });
// Returns: 2
```

### `find.exists(selector)`
**Returns:** `Promise<boolean>` — whether at least one element exists.

```ts
const hasComparison = await piggy.site.find.exists({ selector: "#comparison" });
// Returns: true
```

### `find.visible(selector)`
**Returns:** `Promise<boolean>` — whether the first matching element is visible.

```ts
const isVisible = await piggy.site.find.visible({ selector: ".buy-link" });
// Returns: true
```

### `find.enabled(selector)`
**Returns:** `Promise<boolean>` — whether the first matching element is enabled (not disabled).

```ts
const isEnabled = await piggy.site.find.enabled({ selector: "button" });
// Returns: true
```

### `find.checked(selector)`
**Returns:** `Promise<boolean>` — whether the first matching checkbox/radio is checked.

```ts
const isChecked = await piggy.site.find.checked({ selector: "input[type='checkbox']" });
// Returns: false
```

---

## Complete Example

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("shop", "https://example.com/shop");

await piggy.shop.navigate();

// Wait for products to load
await piggy.shop.wait.selector({ selector: ".product-card", state: "attached" });

// Get all product cards
const products = await piggy.shop.find.css({ selector: ".product-card" });
console.log(`Found ${products.length} products`);

// Find the cheapest product (by price text)
const cheapProduct = await piggy.shop.find.byText({ text: "$29.99" });
console.log("Cheapest product:", cheapProduct[0]?.text);

// Get all images
const images = await piggy.shop.find.byTag({ tag: "img" });
for (const img of images) {
  console.log(`Image: ${img.src} (${img.attrs.alt || "no alt"})`);
}

// Check if buy links exist
const hasBuyLinks = await piggy.shop.find.exists({ selector: ".buy-link" });
console.log(`Buy links exist: ${hasBuyLinks}`);

await piggy.close();
```

---

## Response Samples

Based on the [sample HTML page](https://example.com/products), here's what each command returns:

### `find.css(".price")`
```json
[
  {
    "tag": "span",
    "id": "",
    "cls": "price",
    "text": "$29.99",
    "html": "$29.99",
    "href": "",
    "src": "",
    "value": "",
    "attrs": { "class": "price" }
  },
  {
    "tag": "span",
    "id": "",
    "cls": "price",
    "text": "$89.99",
    "html": "$89.99",
    "href": "",
    "src": "",
    "value": "",
    "attrs": { "class": "price" }
  }
]
```

### `find.byAttr({ attr: "data-id", value: "99" })`
```json
[
  {
    "tag": "div",
    "id": "",
    "cls": "product-card",
    "text": "Mechanical Keyboard $89.99 Buy Now RGB backlit Cherry MX switches US Add to Cart",
    "html": "<img src=\"/img/keyboard.jpg\" alt=\"Mechanical Keyboard\">...",
    "href": "",
    "src": "",
    "value": "",
    "attrs": {
      "class": "product-card",
      "data-id": "99"
    }
  }
]
```

### `find.children({ selector: ".features" })`
```json
[
  {
    "tag": "li",
    "id": "",
    "cls": "",
    "text": "Ergonomic",
    "html": "Ergonomic",
    "href": "",
    "src": "",
    "value": "",
    "attrs": {}
  },
  {
    "tag": "li",
    "id": "",
    "cls": "",
    "text": "Rechargeable",
    "html": "Rechargeable",
    "href": "",
    "src": "",
    "value": "",
    "attrs": {}
  },
  {
    "tag": "li",
    "id": "",
    "cls": "",
    "text": "Silent clicks",
    "html": "Silent clicks",
    "href": "",
    "src": "",
    "value": "",
    "attrs": {}
  }
]
```

---

## API Reference

| Method | Parameters | Returns |
|--------|------------|---------|
| `find.css(selector)` | `selector: string` | `Promise<ElementDescriptor[]>` |
| `find.first(selector)` | `selector: string` | `Promise<ElementDescriptor[]>` |
| `find.all(selector)` | `selector: string` | alias for `css` |
| `find.byText({ text, selector?, exact? })` | `{ text, selector?, exact? }` | `Promise<ElementDescriptor[]>` |
| `find.byAttr({ attr, value?, selector? })` | `{ attr, value?, selector? }` | `Promise<ElementDescriptor[]>` |
| `find.byTag(tag)` | `tag: string` | `Promise<ElementDescriptor[]>` |
| `find.byPlaceholder(text)` | `text: string` | `Promise<ElementDescriptor[]>` |
| `find.byRole({ role, name? })` | `{ role, name? }` | `Promise<ElementDescriptor[]>` |
| `find.closest({ selector, ancestor })` | `{ selector, ancestor }` | `Promise<ElementDescriptor[]>` |
| `find.parent(selector)` | `selector: string` | `Promise<ElementDescriptor[]>` |
| `find.children(selector)` | `selector: string` | `Promise<ElementDescriptor[]>` |
| `find.filter({ selector, attr, value })` | `{ selector, attr, value }` | `Promise<ElementDescriptor[]>` |
| `find.count(selector)` | `selector: string` | `Promise<number>` |
| `find.exists(selector)` | `selector: string` | `Promise<boolean>` |
| `find.visible(selector)` | `selector: string` | `Promise<boolean>` |
| `find.enabled(selector)` | `selector: string` | `Promise<boolean>` |
| `find.checked(selector)` | `selector: string` | `Promise<boolean>` |

---

## Type Definitions

```ts
interface ElementDescriptor {
  tag: string;
  id: string;
  cls: string;
  text: string;      // first 400 chars
  html: string;      // first 800 chars
  href: string;
  src: string;
  value: string;
  attrs: Record<string, string>;
}

interface FindByTextOptions {
  text: string;
  selector?: string;   // defaults to "*"
  exact?: boolean;     // defaults to false
}

interface FindByAttrOptions {
  attr: string;
  value?: string;
  selector?: string;   // defaults to "*"
}

interface FindByRoleOptions {
  role: string;
  name?: string;
}

interface FindClosestOptions {
  selector: string;
  ancestor: string;
}

interface FindFilterOptions {
  selector: string;
  attr: string;
  value: string;
}
```

---

## Next Steps

- [Provide API](../provide) — Extract data from elements
- [Wait API](../wait) — Wait for elements to appear
- [Interactions](../click) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*

