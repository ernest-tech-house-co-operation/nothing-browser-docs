# 🖼️ Iframe API — Cross-Frame DOM Operations

Interact with elements inside iframes. Execute JavaScript, click buttons, extract text, and wait for selectors — all within nested browsing contexts.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Iframe API provides full control over iframe content:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `iframe.list()` | List all iframes | Discover iframes on page |
| `iframe.evaluate()` | Run JS inside iframe | Execute custom logic |
| `iframe.click()` | Click element in iframe | Interact with iframe buttons |
| `iframe.type()` | Type text in iframe | Fill iframe forms |
| `iframe.text()` | Extract text from iframe | Get content from iframe |
| `iframe.html()` | Get iframe HTML | Capture full iframe content |
| `iframe.waitSel()` | Wait for selector in iframe | Wait for dynamic content |

---

## Identifying Iframes

### `iframe.list()`

Returns all iframes on the current page.

```ts
const iframes = await piggy.site.iframe.list();
// Returns: [
//   { index: 0, src: "https://payment.example.com", id: "pay-frame", name: "pay", width: 400, height: 300 },
//   { index: 1, src: "https://ads.example.com", id: "ad-frame", name: "", width: 300, height: 250 }
// ]
```

You can identify an iframe by:
- `index` — Position in DOM (0-based)
- `src` — URL of iframe content
- `id` — HTML id attribute
- `name` — HTML name attribute

---

## Execute JavaScript

### `iframe.evaluate({ frameIndex, js })`

Runs JavaScript code inside the specified iframe.

```ts
// Get iframe title
const title = await piggy.site.iframe.evaluate({ 
  frameIndex: 0, 
  js: "document.title" 
});
// Returns: "Payment Page"

// Get iframe URL
const url = await piggy.site.iframe.evaluate({ 
  frameIndex: 0, 
  js: "window.location.href" 
});

// Get element text
const text = await piggy.site.iframe.evaluate({ 
  frameIndex: 0, 
  js: "document.querySelector('.total').innerText" 
});
```

---

## Interact with Iframe Elements

### `iframe.click({ frameIndex, sel })`

Clicks an element inside the iframe.

```ts
await piggy.site.iframe.click({ 
  frameIndex: 0, 
  sel: "#submit-button" 
});

// With iframe ID
await piggy.site.iframe.click({ 
  id: "pay-frame", 
  sel: ".buy-now" 
});

// With iframe name
await piggy.site.iframe.click({ 
  name: "payment", 
  sel: "button[type='submit']" 
});
```

### `iframe.type({ frameIndex, sel, text })`

Types text into an input field inside the iframe.

```ts
await piggy.site.iframe.type({ 
  frameIndex: 0, 
  sel: "#card-number", 
  text: "4111111111111111" 
});

await piggy.site.iframe.type({ 
  frameIndex: 0, 
  sel: "#expiry", 
  text: "12/28" 
});

await piggy.site.iframe.type({ 
  frameIndex: 0, 
  sel: "#cvv", 
  text: "123" 
});
```

---

## Extract Content

### `iframe.text({ frameIndex, sel })`

Extracts text content from an element inside the iframe.

```ts
const total = await piggy.site.iframe.text({ 
  frameIndex: 0, 
  sel: ".total-price" 
});
console.log(`Total: ${total}`);

const error = await piggy.site.iframe.text({ 
  frameIndex: 0, 
  sel: ".error-message" 
});
```

### `iframe.html({ frameIndex })`

Extracts the full HTML content of the iframe.

```ts
const html = await piggy.site.iframe.html({ frameIndex: 0 });
console.log("Iframe HTML length:", html.length);
```

---

## Wait for Selector

### `iframe.waitSel({ frameIndex, sel, timeout? })`

Waits for an element to appear inside the iframe.

```ts
// Wait for payment form to load
await piggy.site.iframe.waitSel({ 
  frameIndex: 0, 
  sel: "#payment-form",
  timeout: 10000 
});

// Then interact
await piggy.site.iframe.type({ 
  frameIndex: 0, 
  sel: "#card-number", 
  text: "4111111111111111" 
});
```

---

## Real-World Examples

### Example 1: Complete Payment Flow

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("shop", "https://example.com/checkout");

const { shop } = usePiggy<"shop">();

await shop.navigate();

// Wait for payment iframe to load
await shop.iframe.waitSel({ 
  frameIndex: 0, 
  sel: "#payment-form",
  timeout: 15000 
});

// Fill payment details
await shop.iframe.type({ 
  frameIndex: 0, 
  sel: "#card-number", 
  text: "4111111111111111" 
});

await shop.iframe.type({ 
  frameIndex: 0, 
  sel: "#expiry", 
  text: "12/28" 
});

await shop.iframe.type({ 
  frameIndex: 0, 
  sel: "#cvv", 
  text: "123" 
});

await shop.iframe.type({ 
  frameIndex: 0, 
  sel: "#name", 
  text: "John Doe" 
});

// Submit payment
await shop.iframe.click({ 
  frameIndex: 0, 
  sel: "#submit-payment" 
});

// Wait for confirmation
await shop.wait.selector({ 
  selector: ".confirmation", 
  state: "visible" 
});

console.log("Payment complete!");
```

### Example 2: Extract Data from Embedded Form

```ts
// List all iframes
const iframes = await shop.iframe.list();
console.log(`Found ${iframes.length} iframes`);

for (const frame of iframes) {
  console.log(`Iframe ${frame.index}: src=${frame.src}, id=${frame.id}`);
  
  // Extract form data from each iframe
  try {
    const formData = await shop.iframe.evaluate({ 
      frameIndex: frame.index, 
      js: `
        const form = document.querySelector('form');
        if (!form) return null;
        const data = {};
        form.querySelectorAll('input, select, textarea').forEach(el => {
          if (el.name) data[el.name] = el.value;
        });
        return data;
      `
    });
    
    if (formData) {
      console.log(`Form data from iframe ${frame.index}:`, formData);
    }
  } catch (e) {
    console.log(`Could not access iframe ${frame.index}`);
  }
}
```

### Example 3: Social Media Embed Interaction

```ts
await piggy.register("blog", "https://example.com/article");
await piggy.blog.navigate();

// Find Twitter embed iframe
const iframes = await piggy.blog.iframe.list();
const twitterFrame = iframes.find(f => f.src.includes("twitter.com"));

if (twitterFrame) {
  console.log("Found Twitter embed");
  
  // Wait for tweet to load
  await piggy.blog.iframe.waitSel({ 
    frameIndex: twitterFrame.index, 
    sel: "[data-testid='tweet']",
    timeout: 10000 
  });
  
  // Extract tweet text
  const tweetText = await piggy.blog.iframe.text({ 
    frameIndex: twitterFrame.index, 
    sel: "[data-testid='tweetText']" 
  });
  
  console.log("Tweet:", tweetText);
  
  // Click like button
  await piggy.blog.iframe.click({ 
    frameIndex: twitterFrame.index, 
    sel: "[data-testid='like']" 
  });
}
```

### Example 4: Nested Iframes

```ts
// Some pages have iframes inside iframes
async function exploreIframes(site: any, frameIndex: number, depth: number = 0) {
  const indent = "  ".repeat(depth);
  
  try {
    const iframes = await site.iframe.list(frameIndex);
    
    for (const frame of iframes) {
      console.log(`${indent}Iframe ${frame.index}: ${frame.src || "no src"}`);
      
      // Recursively explore nested iframes
      if (frame.index !== undefined) {
        await exploreIframes(site, frame.index, depth + 1);
      }
    }
  } catch (e) {
    console.log(`${indent}Cannot access iframe (cross-origin?)`);
  }
}

// Start from main page (no frameIndex = main frame)
await exploreIframes(piggy.site);
```

### Example 5: Cross-Origin Iframe Limitations

```ts
// Cross-origin iframes have restrictions
try {
  await piggy.site.iframe.evaluate({ 
    frameIndex: 0, 
    js: "document.body.innerHTML" 
  });
} catch (error) {
  console.log("Cannot access cross-origin iframe content");
  console.log("Consider using proxy or different approach");
}

// You can still interact with cross-origin iframes via:
// - Clicking (user gesture simulation)
// - Typing into focused elements
// - Keyboard shortcuts
await piggy.site.iframe.click({ 
  frameIndex: 0, 
  sel: "button"  // Works even for cross-origin
});
```

### Example 6: Monitor Iframe Navigation

```ts
// Track iframe URL changes
let lastUrl = "";

setInterval(async () => {
  try {
    const currentUrl = await piggy.site.iframe.evaluate({ 
      frameIndex: 0, 
      js: "window.location.href" 
    });
    
    if (currentUrl !== lastUrl) {
      console.log(`Iframe navigated: ${lastUrl} → ${currentUrl}`);
      lastUrl = currentUrl;
      
      // Handle navigation (e.g., payment completed)
      if (currentUrl.includes("success")) {
        console.log("Payment successful!");
      }
    }
  } catch (e) {
    // Cross-origin iframe, can't read URL
  }
}, 1000);
```

### Example 7: Auto-Fill Iframe Form

```ts
async function fillIframeForm(site: any, frameIndex: number, formData: Record<string, string>) {
  // Wait for form to be ready
  await site.iframe.waitSel({ 
    frameIndex, 
    sel: "form",
    timeout: 10000 
  });
  
  for (const [field, value] of Object.entries(formData)) {
    try {
      await site.iframe.type({ 
        frameIndex, 
        sel: `#${field}`, 
        text: value 
      });
      console.log(`Filled ${field}`);
    } catch (e) {
      console.log(`Could not fill ${field}: ${e.message}`);
    }
  }
  
  // Submit
  await site.iframe.click({ 
    frameIndex, 
    sel: "button[type='submit']" 
  });
}

// Usage
await fillIframeForm(piggy.site, 0, {
  email: "user@example.com",
  password: "secret123",
  "confirm-password": "secret123"
});
```

---

## Identifying Iframes

| Method | Parameter | Example |
|--------|-----------|---------|
| By index | `frameIndex: 0` | First iframe on page |
| By id | `id: "payment-frame"` | Iframe with id="payment-frame" |
| By name | `name: "pay"` | Iframe with name="pay" |
| By src | `src: "https://pay.com"` | Iframe with matching src |

```ts
// All these work:
await piggy.site.iframe.click({ frameIndex: 0, sel: "#submit" });
await piggy.site.iframe.click({ id: "pay-frame", sel: "#submit" });
await piggy.site.iframe.click({ name: "payment", sel: "#submit" });
await piggy.site.iframe.click({ src: "https://pay.example.com", sel: "#submit" });
```

---

## API Reference

### Iframe Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `iframe.list(tabId?)` | — | `Promise<IframeDescriptor[]>` | List all iframes |
| `iframe.evaluate({ frameIndex \| id \| name \| src, js }, tabId?)` | `frameId: any, js: string` | `Promise<any>` | Execute JS in iframe |
| `iframe.click({ frameIndex \| id \| name \| src, sel }, tabId?)` | `frameId: any, sel: string` | `Promise<boolean>` | Click element in iframe |
| `iframe.type({ frameIndex \| id \| name \| src, sel, text }, tabId?)` | `frameId: any, sel: string, text: string` | `Promise<boolean>` | Type text in iframe |
| `iframe.text({ frameIndex \| id \| name \| src, sel }, tabId?)` | `frameId: any, sel: string` | `Promise<string>` | Get text from iframe |
| `iframe.html({ frameIndex \| id \| name \| src }, tabId?)` | `frameId: any` | `Promise<string>` | Get iframe HTML |
| `iframe.waitSel({ frameIndex \| id \| name \| src, sel, timeout? }, tabId?)` | `frameId: any, sel: string, timeout?: number` | `Promise<boolean>` | Wait for selector |

---

## Type Definitions

```ts
interface IframeDescriptor {
  index: number;
  src: string;
  id: string;
  name: string;
  width: number;
  height: number;
}

interface IframeEvaluateOptions {
  frameIndex?: number;
  id?: string;
  name?: string;
  src?: string;
  js: string;
}

interface IframeInteractionOptions {
  frameIndex?: number;
  id?: string;
  name?: string;
  src?: string;
  sel: string;
}

interface IframeTypeOptions extends IframeInteractionOptions {
  text: string;
}

interface IframeWaitOptions extends IframeInteractionOptions {
  timeout?: number;
}
```

---

## Limitations

| Limitation | Explanation |
|------------|-------------|
| **Cross-origin restrictions** | Cannot read DOM of cross-origin iframes (evaluate, text, html) |
| **Can still interact** | Click, type, and waitSel still work on cross-origin iframes |
| **Nested iframes** | Use recursive approach to access deeper iframes |
| **Dynamic iframes** | Iframe may be added after page load — use `waitSel` first |

---

## Next Steps

- [Find API](../find) — Query DOM elements
- [Provide API](../provide) — Extract structured data
- [Dialog API](../dialog) — Handle dialogs (may appear in iframes)

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*