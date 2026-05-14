# 🖱️ Interactions API — Click, Type, Hover, Scroll

Core interaction methods for controlling the browser. Click elements, type text, hover over items, use keyboard shortcuts, move the mouse, and scroll the page.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Interactions API provides all the methods you need to simulate user actions:

| Category | Methods | Use Case |
|----------|---------|----------|
| **Click** | `click()`, `doubleClick()` | Click buttons, links, checkboxes |
| **Type** | `type()`, `select()` | Fill forms, input text |
| **Hover** | `hover()` | Trigger dropdowns, tooltips |
| **Keyboard** | `keyboard.press()`, `keyboard.combo()` | Press keys, shortcuts |
| **Mouse** | `mouse.move()`, `mouse.drag()` | Precise mouse control |
| **Scroll** | `scroll.to()`, `scroll.by()` | Navigate page |

> 💡 **Human Mode:** Enable `piggy.actHuman(true)` for random delays and natural movements.

---

## Click

### `click(selector, opts?)`

Clicks an element on the page.

```ts
// Basic click
await piggy.site.click("#submit-button");

// Click with options
await piggy.site.click(".buy-now", { 
  retries: 3,      // Retry up to 3 times if element not found
  timeout: 5000    // Wait up to 5 seconds for element
});
```

### `doubleClick(selector)`

Double-clicks an element.

```ts
await piggy.site.doubleClick(".editable-item");
```

### Click Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retries` | `number` | `0` | Number of retries if element not found |
| `timeout` | `number` | `30000` | Maximum wait time for element |

---

## Type

### `type(selector, text, opts?)`

Types text into an input element.

```ts
// Basic type
await piggy.site.type("#username", "john_doe");

// Type with options
await piggy.site.type("#search", "wireless headphones", {
  delay: 50,       // ms between keystrokes
  clear: true,     // Clear field before typing
  retries: 2       // Retry if element not found
});
```

### `select(selector, value)`

Selects an option from a `<select>` dropdown.

```ts
// Select by value
await piggy.site.select("#country", "US");

// Select by visible text
await piggy.site.select("#country", "United States");

// Select multiple values
await piggy.site.select("#colors", ["red", "blue"]);
```

### Type Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | `number` | `0` | Milliseconds between keystrokes |
| `clear` | `boolean` | `false` | Clear field before typing |
| `retries` | `number` | `0` | Retry count if element not found |
| `speed` | `string` | `null` | "slow", "normal", "fast" (human mode only) |

---

## Hover

### `hover(selector)`

Hovers the mouse over an element. Useful for triggering dropdown menus or tooltips.

```ts
await piggy.site.hover(".dropdown-menu");
await piggy.site.wait(500);  // Wait for dropdown to appear
await piggy.site.click(".dropdown-item");
```

---

## Keyboard

### `keyboard.press(key)`

Presses a single keyboard key.

```ts
await piggy.site.keyboard.press("Enter");
await piggy.site.keyboard.press("Escape");
await piggy.site.keyboard.press("Tab");
await piggy.site.keyboard.press("Delete");
await piggy.site.keyboard.press("Backspace");
await piggy.site.keyboard.press("ArrowUp");
await piggy.site.keyboard.press("ArrowDown");
```

### `keyboard.combo(combo)`

Presses a key combination (shortcut).

```ts
// Windows/Linux
await piggy.site.keyboard.combo("Control+C");  // Copy
await piggy.site.keyboard.combo("Control+V");  // Paste
await piggy.site.keyboard.combo("Control+A");  // Select all
await piggy.site.keyboard.combo("Control+Shift+I");  // DevTools

// macOS
await piggy.site.keyboard.combo("Meta+C");  // Copy
await piggy.site.keyboard.combo("Meta+V");  // Paste
await piggy.site.keyboard.combo("Meta+A");  // Select all
```

---

## Mouse

### `mouse.move(x, y)`

Moves the mouse to specific coordinates on the page.

```ts
await piggy.site.mouse.move(100, 200);
```

### `mouse.drag(from, to)`

Drags the mouse from one coordinate to another.

```ts
await piggy.site.mouse.drag(
  { x: 100, y: 100 },  // Start position
  { x: 300, y: 300 }   // End position
);
```

---

## Scroll

### `scroll.to(selector)`

Scrolls the page so the element becomes visible.

```ts
await piggy.site.scroll.to("#footer");
await piggy.site.scroll.to(".product-card:last-child");
```

### `scroll.by(px)`

Scrolls the page by a specific number of pixels.

```ts
await piggy.site.scroll.by(500);   // Scroll down 500px
await piggy.site.scroll.by(-200);  // Scroll up 200px
```

---

## Real-World Examples

### Example 1: Complete Form Submission

```ts
await piggy.site.navigate("https://example.com/register");

// Fill form
await piggy.site.type("#first-name", "John");
await piggy.site.type("#last-name", "Doe");
await piggy.site.type("#email", "john.doe@example.com");
await piggy.site.type("#password", "SecurePass123");
await piggy.site.select("#country", "US");

// Check terms
await piggy.site.click("#terms");

// Submit
await piggy.site.click("#register-btn");
await piggy.site.waitForNavigation();

// Verify success
const success = await piggy.site.fetch.text({ query: ".success-message" });
console.log("Registration:", success);
```

### Example 2: Shopping Cart Interaction

```ts
await piggy.shop.navigate("https://books.toscrape.com");

// Add items to cart
const books = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });

for (let i = 0; i < Math.min(3, books.length); i++) {
  await piggy.shop.click(`.product_pod:eq(${i}) .btn-add-to-basket`);
  await piggy.shop.wait(800);
}

// Go to cart
await piggy.shop.click(".cart-link");
await piggy.shop.waitForNavigation();

// Update quantity
await piggy.shop.type(".quantity-input", "2");
await piggy.shop.keyboard.press("Enter");

// Apply coupon
await piggy.shop.type("#coupon-code", "SAVE20");
await piggy.shop.click("#apply-coupon");

// Checkout
await piggy.shop.scroll.to("#checkout");
await piggy.shop.click("#checkout-btn");
```

### Example 3: Infinite Scroll with Scroll.by

```ts
await piggy.site.navigate("https://example.com/infinite-scroll");

let previousHeight = 0;
let sameHeightCount = 0;

while (sameHeightCount < 3) {
  // Scroll down
  await piggy.site.scroll.by(1000);
  await piggy.site.wait(1000);
  
  // Check if new content loaded
  const currentHeight = await piggy.site.evaluate(() => document.body.scrollHeight);
  
  if (currentHeight === previousHeight) {
    sameHeightCount++;
  } else {
    sameHeightCount = 0;
    previousHeight = currentHeight;
  }
  
  console.log(`Scrolled. Height: ${currentHeight}px`);
}

console.log("Reached bottom of page");
```

### Example 4: Drag and Drop

```ts
// Get element positions
const sourcePos = await piggy.site.evaluate(() => {
  const el = document.querySelector(".draggable");
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
});

const targetPos = await piggy.site.evaluate(() => {
  const el = document.querySelector(".dropzone");
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
});

// Drag from source to target
await piggy.site.mouse.drag(sourcePos, targetPos);
```

### Example 5: Keyboard Shortcuts for Navigation

```ts
// Open new tab with Ctrl+T
await piggy.site.keyboard.combo("Control+T");

// Switch tabs with Ctrl+Tab
await piggy.site.keyboard.combo("Control+Tab");

// Close tab with Ctrl+W
await piggy.site.keyboard.combo("Control+W");

// Refresh with Ctrl+R
await piggy.site.keyboard.combo("Control+R");

// DevTools with Ctrl+Shift+I
await piggy.site.keyboard.combo("Control+Shift+I");
```

### Example 6: Hover to Reveal Hidden Menu

```ts
await piggy.site.navigate("https://example.com");

// Hover over main menu
await piggy.site.hover("#main-menu");
await piggy.site.wait(500);  // Wait for dropdown animation

// Click hidden submenu item
await piggy.site.click("#submenu-item");

// Hover over tooltip trigger
await piggy.site.hover(".info-icon");
await piggy.site.wait(300);

// Get tooltip text
const tooltip = await piggy.site.fetch.text({ query: ".tooltip" });
console.log("Tooltip:", tooltip);
```

### Example 7: Human-Like Typing with Delays

```ts
// Custom typing with realistic delays
const message = "Hello, this is a customer review.";

for (const char of message) {
  await piggy.site.type("#review", char);
  
  // Variable delay between keystrokes
  const delay = 50 + Math.random() * 150;
  await piggy.site.wait(delay);
  
  // Occasional pause at word boundaries
  if (char === ' ' && Math.random() < 0.3) {
    await piggy.site.wait(200 + Math.random() * 300);
  }
}

// Or just use human mode
piggy.actHuman(true);
await piggy.site.type("#review", message);
```

---

## Error Handling

```ts
try {
  await piggy.site.click("#non-existent-button");
} catch (error) {
  console.error("Click failed:", error.message);
  // Element not found or not visible
}

try {
  await piggy.site.type("#disabled-input", "text");
} catch (error) {
  console.error("Cannot type into disabled element");
}

// Use retries for flaky elements
const clicked = await piggy.site.click(".dynamic-button", { retries: 3 });
if (!clicked) {
  console.log("Button never appeared");
}
```

---

## Best Practices

### Use Specific Selectors

```ts
// ✅ Good
await piggy.site.click("#submit-btn");

// ❌ Avoid
await piggy.site.click("button");
```

### Add Delays Between Actions

```ts
await piggy.site.click("#load-more");
await piggy.site.wait(1000);  // Wait for content to load
await piggy.site.click(".new-item");
```

### Use Wait Before Interactions

```ts
await piggy.site.wait.selector({ selector: "#dynamic-button", state: "visible" });
await piggy.site.click("#dynamic-button");
```

### Human Mode for Production

```ts
// Enable for production scraping
if (process.env.NODE_ENV === "production") {
  piggy.actHuman(true);
}
```

---

## API Reference

### Click Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `click(selector, opts?)` | `selector: string, opts?: { retries?, timeout? }` | `Promise<boolean>` |
| `doubleClick(selector)` | `selector: string` | `Promise<boolean>` |
| `hover(selector)` | `selector: string` | `Promise<boolean>` |

### Type Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `type(selector, text, opts?)` | `selector, text, opts?: { delay?, clear?, retries? }` | `Promise<boolean>` |
| `select(selector, value)` | `selector: string, value: string \| string[]` | `Promise<boolean>` |

### Keyboard Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `keyboard.press(key)` | `key: string` | `Promise<boolean>` |
| `keyboard.combo(combo)` | `combo: string` | `Promise<boolean>` |

### Mouse Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `mouse.move(x, y)` | `x: number, y: number` | `Promise<boolean>` |
| `mouse.drag(from, to)` | `from: {x,y}, to: {x,y}` | `Promise<boolean>` |

### Scroll Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `scroll.to(selector)` | `selector: string` | `Promise<boolean>` |
| `scroll.by(px)` | `px: number` | `Promise<void>` |

---

## Type Definitions

```ts
interface ClickOptions {
  retries?: number;
  timeout?: number;
}

interface TypeOptions {
  delay?: number;
  clear?: boolean;
  retries?: number;
  speed?: "slow" | "normal" | "fast";
}
```

---

## Next Steps

- [Wait API](../wait) — Wait for elements before interactions
- [Find API](../find) — Query DOM elements
- [Human API](../human) — Human-like behavior configuration

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*