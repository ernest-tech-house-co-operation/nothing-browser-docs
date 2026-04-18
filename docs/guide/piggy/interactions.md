# Interactions

Click, type, hover, scroll, and control keyboard/mouse interactions.

## Basic Setup

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();
```

---

## Click

```ts
// Click by selector
await piggy.site.click("#submit-button");

// Click link by text
await piggy.site.click("a:contains('Login')");

// Click with human mode (random delay)
piggy.actHuman(true);
await piggy.site.click("button"); // 100-500ms delay

// Double click
await piggy.site.doubleClick(".editable-item");
```

---

## Type Text

```ts
// Type into input field
await piggy.site.type("#username", "myusername");
await piggy.site.type("#password", "secret123");

// Type with human mode (variable speed, occasional typos)
piggy.actHuman(true);
await piggy.site.type("#search", "books to read");
// Types at ~200-400ms per character with natural pauses

// Clear field before typing
await piggy.site.click("#input");
await piggy.site.keyboard.combo("Ctrl+A");
await piggy.site.keyboard.press("Delete");
await piggy.site.type("#input", "new text");
```

---

## Hover

```ts
// Hover over element (triggers CSS :hover, dropdowns)
await piggy.site.hover(".dropdown-menu");

// Hover with delay before action
await piggy.site.hover("#tooltip-trigger");
await piggy.site.wait(500); // Wait for tooltip to appear
```

---

## Scroll

```ts
// Scroll to specific element
await piggy.site.scroll.to("#footer");

// Scroll by pixels
await piggy.site.scroll.by(500);  // Down 500px
await piggy.site.scroll.by(-200); // Up 200px

// Smooth scroll with human mode
piggy.actHuman(true);
await piggy.site.scroll.by(400); // Smooth, varied scrolling
```

---

## Keyboard

```ts
// Press single key
await piggy.site.keyboard.press("Enter");
await piggy.site.keyboard.press("Escape");
await piggy.site.keyboard.press("Tab");

// Press key combinations
await piggy.site.keyboard.combo("Ctrl+A");   // Select all
await piggy.site.keyboard.combo("Ctrl+C");   // Copy
await piggy.site.keyboard.combo("Ctrl+V");   // Paste
await piggy.site.keyboard.combo("Ctrl+Shift+I"); // DevTools

// Common combos
await piggy.site.keyboard.combo("Alt+Tab");
await piggy.site.keyboard.combo("Cmd+W");    // macOS
await piggy.site.keyboard.combo("Ctrl+W");   // Windows/Linux
```

---

## Mouse

```ts
// Move mouse to coordinates
await piggy.site.mouse.move(100, 200);

// Drag from one point to another
await piggy.site.mouse.drag(
  { x: 100, y: 100 },  // Start position
  { x: 300, y: 300 }   // End position
);

// Drag with human-like motion
piggy.actHuman(true);
await piggy.site.mouse.drag({ x: 100, y: 100 }, { x: 300, y: 300 });
// Adds slight curve and speed variation
```

---

## Select Dropdown

```ts
// Select by value
await piggy.site.select("#country", "US");

// Select by visible text
await piggy.site.select("#country", "United States");

// Select multiple (for multi-select)
await piggy.site.select("#colors", ["red", "blue"]);
```

---

## Complete Example: Form Submission

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headful" }); // Visible for debugging
await piggy.register("app", "https://example.com/login");

// Enable human mode for natural interaction
piggy.actHuman(true);

await piggy.app.navigate();
await piggy.app.waitForSelector("#login-form");

// Fill form
await piggy.app.type("#email", "user@example.com");
await piggy.app.type("#password", "myPassword123");
await piggy.app.click("#remember-me");

// Submit
await piggy.app.click("#submit-button");
await piggy.app.waitForNavigation();

// Verify login success
const welcomeText = await piggy.app.fetchText(".welcome-message");
console.log("Logged in:", welcomeText);

// Scroll through dashboard
await piggy.app.scroll.to("#analytics");
await piggy.app.wait(1000);
await piggy.app.scroll.by(500);

// Logout
await piggy.app.hover("#user-menu");
await piggy.app.wait(500);
await piggy.app.click("#logout");

await piggy.close();
```

---

## Complete Example: Shopping Cart

```ts
await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

// Add items to cart
const books = await piggy.shop.fetchLinks(".product_pod h3 a");
for (let i = 0; i < Math.min(3, books.length); i++) {
  await piggy.shop.click(`.product_pod:eq(${i}) .btn-add-to-basket`);
  await piggy.shop.wait(800); // Wait between adds
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
await piggy.shop.waitForResponse("*/api/coupon*");

// Checkout
await piggy.shop.scroll.to("#checkout");
await piggy.shop.click("#checkout-btn");

await piggy.close();
```

---

## API Reference

### Click Methods

| Method | Description |
|--------|-------------|
| `click(selector)` | Click element |
| `doubleClick(selector)` | Double-click element |
| `hover(selector)` | Hover over element |

### Type Methods

| Method | Description |
|--------|-------------|
| `type(selector, text)` | Type text into input |
| `select(selector, value)` | Select dropdown option |

### Scroll Methods

| Method | Description |
|--------|-------------|
| `scroll.to(selector)` | Scroll to element |
| `scroll.by(pixels)` | Scroll by pixels |

### Keyboard Methods

| Method | Description |
|--------|-------------|
| `keyboard.press(key)` | Press single key |
| `keyboard.combo(combo)` | Press key combination |

### Mouse Methods

| Method | Description |
|--------|-------------|
| `mouse.move(x, y)` | Move mouse to coordinates |
| `mouse.drag(from, to)` | Drag from point to point |

---

## Human Mode Effects

When `piggy.actHuman(true)` is enabled:

| Action | Effect |
|--------|--------|
| `click()` | Random delay 100-500ms before click |
| `type()` | Variable speed (200-400ms per char), occasional typos + backspace |
| `hover()` | 50-200ms delay before hover |
| `scroll.by()` | Smooth easing, random speed variation |
| `wait()` | ±30% random variance |

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
```

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Data Extraction](./evaluate) — Extract data with evaluate()
- [Request Interception](./interception) — Mock APIs, block trackers

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
