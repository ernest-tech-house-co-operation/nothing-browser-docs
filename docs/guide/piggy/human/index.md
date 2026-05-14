# 🧠 Human API — Human-Like Behavior Control

Make your scraper behave like a real human. Configure typing speed, click delays, scroll behavior, and mouse movements. Perfect for bypassing behavioral detection.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Human API gives you fine-grained control over human-like behavior patterns.

| Method | Purpose | Use Case |
|--------|---------|----------|
| `human.set()` | Configure behavior profile | Set typing speed, click delay, etc. |
| `human.get()` | Get current profile | Check current settings |
| `human.type()` | Human-like typing | Type with variable speed and occasional typos |
| `human.click()` | Human-like click | Click with random delay and mouse movement |

> 💡 **Quick Enable:** For simple cases, use `piggy.actHuman(true)` to enable default human behavior globally.

---

## Default Behavior

When `piggy.actHuman(true)` is enabled, these defaults apply:

| Behavior | Default Effect |
|----------|----------------|
| `click()` | Random delay 100-500ms, curved mouse path |
| `type()` | 50-300ms per character, 5% typo rate |
| `hover()` | 50-200ms delay before hover |
| `scroll.by()` | Smooth easing over 500-1500ms |
| `wait()` | ±30% random variance |

---

## Configure Human Profile

### `human.set(opts, tabId?)`

Sets the human behavior profile for a specific tab.

```ts
// Set custom profile
await piggy.site.human.set({
  typingSpeed: "slow",    // "slow" | "normal" | "fast"
  clickDelay: "cautious", // "cautious" | "normal" | "fast"
  scrollSpeed: "slow",    // "slow" | "normal" | "fast"
  mouseWiggle: true       // Add small mouse movements
});
```

### Profile Options

| Option | Values | Description |
|--------|--------|-------------|
| `typingSpeed` | `"slow"` (150-300ms/char), `"normal"` (50-150ms/char), `"fast"` (20-50ms/char) | Speed of typing |
| `clickDelay` | `"cautious"` (300-600ms), `"normal"` (100-300ms), `"fast"` (30-100ms) | Delay before click |
| `scrollSpeed` | `"slow"` (800-1500ms), `"normal"` (400-800ms), `"fast"` (150-400ms) | Scroll animation duration |
| `mouseWiggle` | `true` / `false` | Add small random mouse movements |

### `human.get(tabId?)`

Returns the current human behavior profile.

```ts
const profile = await piggy.site.human.get();
console.log(profile);
// { typingSpeed: "normal", clickDelay: "normal", scrollSpeed: "normal", mouseWiggle: false }
```

---

## Human-Like Typing

### `human.type({ selector, text, clear?, speed? })`

Types text with human-like behavior (variable speed, occasional typos).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | **Required** | CSS selector of input element |
| `text` | `string` | **Required** | Text to type |
| `clear` | `boolean` | `false` | Clear field before typing |
| `speed` | `number` | `null` | Override profile speed (ms between keys) |

```ts
// Type with profile settings
await piggy.site.human.type({
  selector: "#search",
  text: "wireless headphones"
});

// Clear field first
await piggy.site.human.type({
  selector: "#email",
  text: "user@example.com",
  clear: true
});

// Override speed (100ms between keys)
await piggy.site.human.type({
  selector: "#comment",
  text: "This is a review.",
  speed: 100
});
```

---

## Human-Like Click

### `human.click({ selector, force?, delay? })`

Clicks an element with human-like delay and mouse movement.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | **Required** | CSS selector of element |
| `force` | `boolean` | `false` | Force click even if element is hidden |
| `delay` | `number` | `null` | Override profile delay (ms before click) |

```ts
// Click with profile settings
await piggy.site.human.click({ selector: ".buy-now" });

// Force click hidden element
await piggy.site.human.click({ 
  selector: ".hidden-button", 
  force: true 
});

// Override delay
await piggy.site.human.click({ 
  selector: "#submit", 
  delay: 800 
});
```

---

## Real-World Examples

### Example 1: Complete Human-Like Search Flow

```ts
await piggy.launch({ mode: "tab", binary: "headful" });

// Configure human profile
await piggy.site.human.set({
  typingSpeed: "normal",
  clickDelay: "cautious",
  scrollSpeed: "normal",
  mouseWiggle: true
});

await piggy.register("google", "https://google.com");
await piggy.google.navigate();

// Natural search behavior
await piggy.google.human.click({ selector: "textarea[name='q']" });
await piggy.google.human.type({ 
  selector: "textarea[name='q']", 
  text: "best laptops 2024",
  clear: true
});

await piggy.google.wait(600);  // Think time
await piggy.google.keyboard.press("Enter");
await piggy.google.waitForNavigation();

// Scroll through results naturally
for (let i = 0; i < 3; i++) {
  await piggy.google.wait(1200);
  await piggy.google.scroll.by(400);
}

// Click result with human timing
await piggy.google.wait(800);
await piggy.google.human.click({ selector: "h3" });
```

### Example 2: Natural Form Filling

```ts
await piggy.register("form", "https://example.com/signup");
await piggy.form.navigate();

await piggy.form.human.set({ typingSpeed: "slow", clickDelay: "cautious" });

// Fill form naturally
await piggy.form.human.type({ selector: "#first-name", text: "John", clear: true });
await piggy.form.wait(200);  // Pause between fields

await piggy.form.human.type({ selector: "#last-name", text: "Doe", clear: true });
await piggy.form.wait(200);

await piggy.form.human.type({ selector: "#email", text: "john.doe@example.com", clear: true });
await piggy.form.wait(200);

await piggy.form.human.type({ selector: "#phone", text: "555-123-4567", clear: true });

// Natural field navigation
await piggy.form.keyboard.press("Tab");
await piggy.form.wait(150);
await piggy.form.keyboard.press("Tab");

// Select dropdown with hesitation
await piggy.form.wait(500);
await piggy.form.human.click({ selector: "#country" });
await piggy.form.wait(400);
await piggy.form.select("#country", "US");

// Check checkbox naturally
await piggy.form.scroll.to("#terms");
await piggy.form.wait(300);
await piggy.form.human.click({ selector: "#terms" });

// Submit
await piggy.form.wait(500);
await piggy.form.human.click({ selector: "#submit" });
```

### Example 3: Shopping Cart with Human Timing

```ts
await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

await piggy.shop.human.set({ 
  typingSpeed: "normal", 
  clickDelay: "normal",
  mouseWiggle: true 
});

// Browse like a human
await piggy.shop.wait(1500);

// Hover over menu
await piggy.shop.hover(".nav-menu");
await piggy.shop.wait(400);
await piggy.shop.click("a:contains('Books')");

// Read products and add to cart
const products = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });

for (let i = 0; i < Math.min(3, products.length); i++) {
  await piggy.shop.human.click({ selector: `.product_pod:eq(${i}) h3 a` });
  await piggy.shop.waitForNavigation();
  
  // Read product page
  await piggy.shop.wait(2000);
  
  // Add to cart with hesitation (70% chance)
  if (Math.random() < 0.7) {
    await piggy.shop.wait(500);
    await piggy.shop.human.click({ selector: ".btn-add-to-basket" });
    await piggy.shop.wait(800);
    console.log(`Added product ${i + 1} to cart`);
  }
  
  await piggy.shop.goBack();
  await piggy.shop.wait(1000);
}

// Go to cart
await piggy.shop.human.click({ selector: ".cart-link" });
await piggy.shop.waitForNavigation();

// Review cart
await piggy.shop.wait(2000);
await piggy.shop.scroll.by(300);
await piggy.shop.wait(1000);
```

### Example 4: Custom Typing with Typos

```ts
// Human typing naturally includes occasional typos
await piggy.site.human.type({
  selector: "#search",
  text: "wireless headphones",
  clear: true
});
// Types: w i r e l e s s [pause] h e a d p h o n e s
// May include: w i r e l e s s [backspace] [backspace] s s

// For critical fields where typos are unacceptable, use normal type
await piggy.site.type("#email", "user@example.com");  // Perfect typing
```

### Example 5: Adaptive Profile by Site

```ts
// Different profiles for different sites
const profiles = {
  google: { typingSpeed: "fast", clickDelay: "fast", scrollSpeed: "fast", mouseWiggle: false },
  amazon: { typingSpeed: "normal", clickDelay: "normal", scrollSpeed: "normal", mouseWiggle: true },
  banking: { typingSpeed: "slow", clickDelay: "cautious", scrollSpeed: "slow", mouseWiggle: true }
};

await piggy.register("google", "https://google.com");
await piggy.register("amazon", "https://amazon.com");
await piggy.register("bank", "https://mybank.com");

await piggy.google.human.set(profiles.google);
await piggy.amazon.human.set(profiles.amazon);
await piggy.bank.human.set(profiles.banking);
```

### Example 6: Disable Human Mode for API

```ts
// Disable human mode for API endpoints (speed matters)
piggy.actHuman(false);

await piggy.site.api("/fast-search", async (_params, query) => {
  // Fast, predictable execution
  await piggy.site.navigate(`https://example.com/search?q=${query.q}`);
  const results = await piggy.site.provide.textAll({ selector: ".result" });
  return { count: results.length, results };
});

// Re-enable for user-facing scraping
piggy.actHuman(true);
```

### Example 7: Custom Human Scroll

```ts
async function humanScroll(site: any, targetY: number) {
  const currentY = await site.evaluate(() => window.scrollY);
  const distance = targetY - currentY;
  const duration = 500 + Math.random() * 1000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < duration) {
    const elapsed = Date.now() - startTime;
    const t = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const y = currentY + distance * ease;
    
    await site.scroll.to(Math.floor(y));
    await site.wait(16);
    
    // Random pause mid-scroll
    if (Math.random() < 0.1) {
      await site.wait(100 + Math.random() * 300);
    }
  }
  
  await site.scroll.to(targetY);
}

// Use with human profile
await piggy.site.human.set({ scrollSpeed: "slow" });
await humanScroll(piggy.site, 1000);
```

---

## Profile Presets

### Default (Normal)
```ts
{
  typingSpeed: "normal",
  clickDelay: "normal",
  scrollSpeed: "normal",
  mouseWiggle: false
}
```

### Cautious (Harder to Detect)
```ts
{
  typingSpeed: "slow",
  clickDelay: "cautious",
  scrollSpeed: "slow",
  mouseWiggle: true
}
```

### Fast (Development)
```ts
{
  typingSpeed: "fast",
  clickDelay: "fast",
  scrollSpeed: "fast",
  mouseWiggle: false
}
```

### Stealth (Maximum Anti-Detection)
```ts
{
  typingSpeed: "slow",
  clickDelay: "cautious",
  scrollSpeed: "slow",
  mouseWiggle: true
}
```

---

## API Reference

### Human Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `human.set(opts, tabId?)` | `{ typingSpeed?, clickDelay?, scrollSpeed?, mouseWiggle? }` | `Promise<HumanProfile>` | Set profile |
| `human.get(tabId?)` | — | `Promise<HumanProfile>` | Get profile |
| `human.type({ selector, text, clear?, speed? }, tabId?)` | `{ selector, text, clear?, speed? }` | `Promise<void>` | Human-like typing |
| `human.click({ selector, force?, delay? }, tabId?)` | `{ selector, force?, delay? }` | `Promise<boolean>` | Human-like click |

### Global Control

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `piggy.actHuman(enable)` | `enable: boolean` | `piggy` | Enable/disable default human mode |

---

## Type Definitions

```ts
type TypingSpeed = "slow" | "normal" | "fast";
type ClickDelay = "cautious" | "normal" | "fast";
type ScrollSpeed = "slow" | "normal" | "fast";

interface HumanProfile {
  typingSpeed: TypingSpeed;
  clickDelay: ClickDelay;
  scrollSpeed: ScrollSpeed;
  mouseWiggle: boolean;
}

interface HumanTypeOptions {
  selector: string;
  text: string;
  clear?: boolean;
  speed?: number;  // Override profile, ms between keys
}

interface HumanClickOptions {
  selector: string;
  force?: boolean;
  delay?: number;  // Override profile, ms before click
}
```

---

## Next Steps
- [Interactions API](../interactions) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*                     