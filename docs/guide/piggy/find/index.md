# 🔍 Find API — DOM Query & Element Descriptors

Query the DOM, find elements by CSS, text, attributes, tags, roles, and traverse the tree. Every `find.*` command returns an **ElementDescriptor** with element metadata.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.21+

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

### Using ElementDescriptor Properties

| Property | What it contains | Use case |
|----------|------------------|----------|
| `tag` | Element tag name | Type checking |
| `id` | Element ID attribute | Direct reference |
| `cls` | Element class attribute | **Use for parent scoping** |
| `text` | First 400 chars of innerText | Quick text extraction |
| `html` | First 800 chars of innerHTML | HTML inspection |
| `attrs` | All attributes | Attribute access |

---

## Find by CSS Selector

### `find.css(selector, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — all elements matching the CSS selector.

```ts
const prices = await piggy.books.find.css(".price");
// Returns: [
//   { tag: "span", cls: "price", text: "$29.99", ... },
//   { tag: "span", cls: "price", text: "$89.99", ... }
// ]

// With tabId
const prices = await piggy.books.find.css(".price", "my-tab-id");
```

### `find.first(selector, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — first matching element (0 or 1 results).

```ts
const firstTitle = await piggy.books.find.first(".title");
// Returns: [{ tag: "h3", cls: "title", text: "Wireless Mouse", ... }]
```

### `find.all(selector, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — alias for `find.css()`.

---

## Find by Content

### `find.byText({ text, selector?, exact? }, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — elements containing the specified text.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | **Required** | Text to search for |
| `selector` | `string` | `"*"` | Optional CSS selector to limit search |
| `exact` | `boolean` | `false` | If `true`, matches exact text (case-sensitive) |

```ts
// Find any element containing "Silent clicks"
const silent = await piggy.books.find.byText({ text: "Silent clicks" });
// Returns: [{ tag: "li", text: "Silent clicks", ... }]

// Find exact match (case-sensitive)
const addToCart = await piggy.books.find.byText({ text: "Add to Cart", exact: true });
// Returns: [{ tag: "button", text: "Add to Cart", ... }]

// Limit search to buttons only
const buttonsWithText = await piggy.books.find.byText({ 
  text: "Add", 
  selector: "button" 
});
```

---

## Find by Attribute

### `find.byAttr({ attr, value?, selector? }, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — elements with a matching attribute.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `attr` | `string` | **Required** | Attribute name (e.g., "data-id", "class") |
| `value` | `string` | `undefined` | Optional attribute value to match |
| `selector` | `string` | `"*"` | Optional CSS selector to limit search |

```ts
// Find elements with data-id attribute (any value)
const withDataId = await piggy.books.find.byAttr({ attr: "data-id" });

// Find specific value
const product99 = await piggy.books.find.byAttr({ attr: "data-id", value: "99" });
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "99", class: "product-card" }, ... }]
```

---

## Find by Tag Name

### `find.byTag(tag, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — all elements with the given tag name.

```ts
const images = await piggy.books.find.byTag("img");
// Returns: [
//   { tag: "img", src: "/img/mouse.jpg", alt: "Wireless Mouse", ... },
//   { tag: "img", src: "/img/keyboard.jpg", alt: "Mechanical Keyboard", ... }
// ]

const buttons = await piggy.books.find.byTag("button");
```

---

## Find by Input Placeholder

### `find.byPlaceholder(text, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — input elements with matching placeholder text.

```ts
const emailInput = await piggy.books.find.byPlaceholder("Enter your email");
// Returns: [{ tag: "input", attrs: { placeholder: "Enter your email", type: "email" }, ... }]
```

---

## Find by ARIA Role

### `find.byRole({ role, name? }, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — elements with matching ARIA role.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `role` | `string` | **Required** | ARIA role (e.g., "button", "navigation", "dialog") |
| `name` | `string` | `undefined` | Optional accessible name to match |

```ts
// Find all buttons
const buttons = await piggy.books.find.byRole({ role: "button" });

// Find navigation landmark
const nav = await piggy.books.find.byRole({ role: "navigation" });

// Find button with specific name
const submitBtn = await piggy.books.find.byRole({ role: "button", name: "Submit" });
```

---

## DOM Traversal

### `find.closest({ selector, ancestor }, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — finds the closest ancestor matching the selector.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string` | Element to start from |
| `ancestor` | `string` | CSS selector for the ancestor to find |

```ts
// From a price, find the containing product card
const productCard = await piggy.books.find.closest({ 
  selector: ".price", 
  ancestor: ".product-card" 
});
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "42" }, ... }]
```

### `find.parent(selector, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — direct parent of the matching element.

```ts
const parentOfPrice = await piggy.books.find.parent(".price");
// Returns: [{ tag: "div", cls: "info", ... }]
```

### `find.children(selector, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — direct children of the matching element.

```ts
const features = await piggy.books.find.children(".features");
// Returns: [
//   { tag: "li", text: "Ergonomic", ... },
//   { tag: "li", text: "Rechargeable", ... },
//   { tag: "li", text: "Silent clicks", ... }
// ]
```

---

## Filtering

### `find.filter({ selector, attr, value }, tabId?)`

**Returns:** `Promise<ElementDescriptor[]>` — filters elements by attribute value.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string` | CSS selector for elements to filter |
| `attr` | `string` | Attribute name to check |
| `value` | `string` | Value to match |

```ts
const product42 = await piggy.books.find.filter({ 
  selector: ".product-card", 
  attr: "data-id", 
  value: "42" 
});
// Returns: [{ tag: "div", cls: "product-card", attrs: { "data-id": "42" }, ... }]
```

---

## Element State Checks

### `find.count(selector, tabId?)`

**Returns:** `Promise<number>` — number of elements matching selector.

```ts
const count = await piggy.books.find.count(".product-card");
// Returns: 2
```

### `find.exists(selector, tabId?)`

**Returns:** `Promise<boolean>` — whether at least one element exists.

```ts
const hasComparison = await piggy.books.find.exists("#comparison");
// Returns: true
```

### `find.visible(selector, tabId?)`

**Returns:** `Promise<boolean>` — whether the first matching element is visible.

```ts
const isVisible = await piggy.books.find.visible(".buy-link");
// Returns: true
```

### `find.enabled(selector, tabId?)`

**Returns:** `Promise<boolean>` — whether the first matching element is enabled (not disabled).

```ts
const isEnabled = await piggy.books.find.enabled("button");
// Returns: true
```

### `find.checked(selector, tabId?)`

**Returns:** `Promise<boolean>` — whether the first matching checkbox/radio is checked.

```ts
const isChecked = await piggy.books.find.checked("input[type='checkbox']");
// Returns: false
```

---

## Working Example: Extracting Book Data

Here's a complete example showing how to use `find.css()` with parent scoping:

```typescript
// Get all product cards
const productCards = await piggy.books.find.css(".product_pod");

// Iterate through each card
const booksDetailed = await Promise.all(
  productCards.slice(0, 5).map(async (card) => {
    // Use provide.text with parent scoping (card.cls)
    const price = await piggy.books.provide.text({
      selector: ".price_color",
      parent: card.cls,  // ← Scopes search to inside this card
    });

    const ratingClass = await piggy.books.provide.attr({
      selector: ".star-rating",
      attr: "class",
      parent: card.cls,
    });
    const rating = ratingClass?.replace("star-rating ", "") ?? "";

    const availability = await piggy.books.provide.text({
      selector: ".availability",
      parent: card.cls,
    });

    return {
      title:   card.text,  // card.text contains the element's text content
      price:   price ?? "",
      rating,
      inStock: availability === "In stock",
    };
  })
);
```

### Parent Scoping with `provide`

When using `provide.text()` or `provide.attr()` with a parent element, pass `parent: card.cls`:

```typescript
const price = await piggy.books.provide.text({
  selector: ".price_color",
  parent: card.cls,  // ← Scopes search to inside this card
});
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `find.css(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<ElementDescriptor[]>` | CSS selector |
| `find.first(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<ElementDescriptor[]>` | First match |
| `find.all(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<ElementDescriptor[]>` | Alias for `css` |
| `find.byText({ text, selector?, exact? }, tabId?)` | `{ text, selector?, exact? }` | `Promise<ElementDescriptor[]>` | By text content |
| `find.byAttr({ attr, value?, selector? }, tabId?)` | `{ attr, value?, selector? }` | `Promise<ElementDescriptor[]>` | By attribute |
| `find.byTag(tag, tabId?)` | `tag: string, tabId?: string` | `Promise<ElementDescriptor[]>` | By tag name |
| `find.byPlaceholder(text, tabId?)` | `text: string, tabId?: string` | `Promise<ElementDescriptor[]>` | By input placeholder |
| `find.byRole({ role, name? }, tabId?)` | `{ role, name? }` | `Promise<ElementDescriptor[]>` | By ARIA role |
| `find.closest({ selector, ancestor }, tabId?)` | `{ selector, ancestor }` | `Promise<ElementDescriptor[]>` | Closest ancestor |
| `find.parent(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<ElementDescriptor[]>` | Direct parent |
| `find.children(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<ElementDescriptor[]>` | Direct children |
| `find.filter({ selector, attr, value }, tabId?)` | `{ selector, attr, value }` | `Promise<ElementDescriptor[]>` | Filter by attribute |
| `find.count(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<number>` | Count matches |
| `find.exists(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<boolean>` | Check if exists |
| `find.visible(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<boolean>` | Check if visible |
| `find.enabled(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<boolean>` | Check if enabled |
| `find.checked(selector, tabId?)` | `selector: string, tabId?: string` | `Promise<boolean>` | Check if checked |

---

## Next Steps

- [Provide API](../provide) — Extract structured data from found elements
- [Wait API](../wait) — Wait for elements to appear
- [Interactions](../click) — Click, type, hover on found elements

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*