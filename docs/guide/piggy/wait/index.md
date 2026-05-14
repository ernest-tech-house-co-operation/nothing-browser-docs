# ⏱️ Wait API — Smart Waiting for DOM & Conditions

Wait for elements to appear, disappear, become visible, or for custom JavaScript conditions to return true. Essential for handling dynamic content, lazy loading, and single-page applications.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The `wait.*` API family gives you fine-grained control over waiting for page state changes. Unlike fixed delays (`setTimeout`), these methods poll efficiently and resolve exactly when your condition is met.

| Method | Purpose | Use Case |
|--------|---------|----------|
| `wait.selector()` | Wait for element state | Element appears, disappears, becomes visible/hidden |
| `wait.function()` | Wait for JS condition | Custom logic, data loaded, count >= N |

---

## Wait for Selector State

### `wait.selector({ selector, state?, timeout? })`
**Returns:** `Promise<void>` — resolves when element reaches target state, rejects on timeout.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | **Required** | CSS selector to wait for |
| `state` | `string` | `"attached"` | State to wait for (see table below) |
| `timeout` | `number` | `30000` | Maximum wait time in milliseconds |

### State Values

| State | Description |
|-------|-------------|
| `"attached"` | Element exists in DOM (default) |
| `"detached"` | Element removed from DOM |
| `"visible"` | Element is visible (not `display: none`, `visibility: hidden`, or zero dimensions) |
| `"hidden"` | Element is hidden (or doesn't exist) |

```ts
// Wait for element to exist (default)
await piggy.site.wait.selector({ selector: ".product-card" });

// Wait for element to be removed
await piggy.site.wait.selector({ 
  selector: ".loading-spinner", 
  state: "detached" 
});

// Wait for element to become visible (after animation/lazy load)
await piggy.site.wait.selector({ 
  selector: ".modal", 
  state: "visible", 
  timeout: 10000 
});

// Wait for element to become hidden (e.g., popup closes)
await piggy.site.wait.selector({ 
  selector: ".toast-notification", 
  state: "hidden" 
});
```

---

## Wait for Custom Function

### `wait.function({ js, timeout? })`
**Returns:** `Promise<void>` — resolves when the JavaScript function returns `true`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `js` | `string` | **Required** | JavaScript code that returns a boolean |
| `timeout` | `number` | `30000` | Maximum wait time in milliseconds |

```ts
// Wait for at least 2 product cards
await piggy.site.wait.function({ 
  js: "document.querySelectorAll('.product-card').length >= 2" 
});

// Wait for API data to load (checking window object)
await piggy.site.wait.function({ 
  js: "window.__DATA__ && window.__DATA__.loaded === true" 
});

// Wait for React component to mount
await piggy.site.wait.function({ 
  js: "document.querySelector('[data-reactroot]') !== null" 
});

// Wait for network idle (no pending requests > 2)
await piggy.site.wait.function({ 
  js: `
    const pending = performance.getEntriesByType('resource')
      .filter(r => !r.responseEnd && r.duration === 0);
    return pending.length === 0;
  `
});
```

---

## Real-World Examples

### Example 1: Wait for Lazy-Loaded Content

```ts
await piggy.site.navigate("https://example.com/infinite-scroll");

// Scroll to trigger lazy load
await piggy.site.scroll.by(1000);

// Wait for new content to appear
await piggy.site.wait.selector({ 
  selector: ".product-card:last-child", 
  state: "attached" 
});

console.log("New content loaded!");
```

### Example 2: Wait for Modal to Open and Close

```ts
// Click button that opens modal
await piggy.site.click("#show-modal");

// Wait for modal to become visible
await piggy.site.wait.selector({ 
  selector: ".modal", 
  state: "visible" 
});

console.log("Modal is open");

// Click close button
await piggy.site.click(".modal-close");

// Wait for modal to be removed
await piggy.site.wait.selector({ 
  selector: ".modal", 
  state: "detached" 
});

console.log("Modal is closed");
```

### Example 3: Wait for Form Validation

```ts
await piggy.site.type("#email", "invalid");
await piggy.site.click("#submit");

// Wait for error message to appear
await piggy.site.wait.selector({ 
  selector: ".error-message", 
  state: "visible" 
});

const errorText = await piggy.site.provide.text({ selector: ".error-message" });
console.log("Validation error:", errorText);
```

### Example 4: Wait for Data Fetch Completion

```ts
await piggy.site.click("#load-data");

// Wait for loading spinner to disappear
await piggy.site.wait.selector({ 
  selector: ".spinner", 
  state: "detached" 
});

// Wait for results container to have content
await piggy.site.wait.function({ 
  js: "document.querySelectorAll('.result-item').length > 0" 
});

const results = await piggy.site.provide.textAll({ selector: ".result-item" });
console.log(`Loaded ${results.length} results`);
```

### Example 5: Retry with Wait

```ts
async function waitForElementWithRetry(selector: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await piggy.site.wait.selector({ 
        selector, 
        state: "visible", 
        timeout: 5000 
      });
      return true;
    } catch {
      console.log(`Retry ${i + 1}/${maxRetries} for ${selector}`);
      await piggy.site.wait(1000);
    }
  }
  return false;
}

const found = await waitForElementWithRetry(".dynamic-content");
```

---

## Combining with Other APIs

### Wait + Find

```ts
// Wait for products, then find all prices
await piggy.site.wait.selector({ selector: ".product-card", state: "attached" });
const prices = await piggy.site.find.css({ selector: ".price" });
console.log(`Found ${prices.length} products`);
```

### Wait + Provide

```ts
// Wait for table to load, then extract data
await piggy.site.wait.selector({ selector: "#comparison", state: "attached" });
const tableData = await piggy.site.provide.table({ selector: "#comparison" });
```

### Wait + Click + Wait

```ts
// Typical interaction: click → wait for response → extract
await piggy.site.click("#load-more");
await piggy.site.wait.selector({ selector: ".product-card:last-child", state: "attached" });
const newProducts = await piggy.site.provide.list({ selector: "#product-list", itemSel: ".product-card" });
```

---

## Error Handling

```ts
try {
  await piggy.site.wait.selector({ 
    selector: ".never-appears", 
    timeout: 5000 
  });
} catch (error) {
  console.error("Element did not appear within 5 seconds");
  // Handle gracefully — maybe continue, retry, or exit
}

// With custom function
try {
  await piggy.site.wait.function({ 
    js: "window.data !== undefined", 
    timeout: 3000 
  });
} catch {
  console.log("Data never loaded, using fallback");
  const fallbackData = getFallbackData();
}
```

---

## Best Practices

### Prefer `wait.selector()` over `wait.function()` when possible

```ts
// ✅ Good — efficient, specific
await piggy.site.wait.selector({ selector: ".product-card", state: "attached" });

// ⚠️ Works but less efficient
await piggy.site.wait.function({ 
  js: "document.querySelector('.product-card') !== null" 
});
```

### Use specific selectors

```ts
// ✅ Good — specific
await piggy.site.wait.selector({ selector: "#product-list .product-card" });

// ❌ Avoid — too broad
await piggy.site.wait.selector({ selector: "div" });
```

### Set reasonable timeouts

```ts
// ✅ Good — 30 seconds for slow networks
await piggy.site.wait.selector({ selector: ".content", timeout: 30000 });

// ❌ Avoid — too short for real world
await piggy.site.wait.selector({ selector: ".content", timeout: 100 });

// ❌ Avoid — too long (user will give up)
await piggy.site.wait.selector({ selector: ".content", timeout: 120000 });
```

### Use `state: "detached"` instead of checking `!exists`

```ts
// ✅ Good — waits for removal
await piggy.site.wait.selector({ selector: ".spinner", state: "detached" });

// ❌ Works but inefficient
await piggy.site.wait.function({ 
  js: "document.querySelector('.spinner') === null" 
});
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `wait.selector({ selector, state?, timeout? })` | `selector: string, state?: "attached"\|"detached"\|"visible"\|"hidden", timeout?: number` | `Promise<void>` | Waits for element to reach target state |
| `wait.function({ js, timeout? })` | `js: string, timeout?: number` | `Promise<void>` | Waits for JavaScript to return `true` |

### Default Values

| Parameter | Default |
|-----------|---------|
| `state` | `"attached"` |
| `timeout` | `30000` (30 seconds) |

---

## Type Definitions

```ts
type WaitSelectorState = "attached" | "detached" | "visible" | "hidden";

interface WaitSelectorOptions {
  selector: string;
  state?: WaitSelectorState;
  timeout?: number;
}

interface WaitFunctionOptions {
  js: string;
  timeout?: number;
}
```

---

## Next Steps

- [Find API](../find) — Query DOM elements after waiting
- [Provide API](../provide) — Extract data after waiting
- [Interactions](../click) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
