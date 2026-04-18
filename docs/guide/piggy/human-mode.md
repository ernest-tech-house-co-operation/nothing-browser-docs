# 🧠 Human Mode

Make your scraper behave like a real human. Random delays, natural typing patterns, smooth scrolling, and unpredictable mouse movements — all with one line of code.

---

## Overview

Human mode adds realistic behavior patterns to all interactions:

| Behavior | Effect | Bypasses |
|----------|--------|----------|
| **Random delays** | 100-500ms before actions | Bot timing detection |
| **Variable typing** | 50-300ms per character | Typing pattern analysis |
| **Typos + backspace** | Occasional mistakes corrected | Perfect typing detection |
| **Smooth scrolling** | Eased, varied scroll speeds | Instant scroll detection |
| **Mouse movement** | Curved paths, speed variation | Direct jump detection |
| **Wait variance** | ±30% random fluctuation | Predictable timing |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Enable human mode - ONE LINE
piggy.actHuman(true);

await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// All interactions now have human-like behavior
await piggy.site.click("button");        // Random delay 100-500ms
await piggy.site.type("#search", "books"); // Variable typing speed
await piggy.site.hover(".menu");          // Delay before hover
await piggy.site.scroll.by(400);          // Smooth, varied scrolling
await piggy.site.wait(1000);              // Actually 700-1300ms

// Disable human mode
piggy.actHuman(false);
```

---

## Human Mode Effects

### Click Behavior

```ts
// Without human mode
await piggy.site.click("#submit");
// Instant click - detectable as bot

// With human mode
piggy.actHuman(true);
await piggy.site.click("#submit");
// Random delay 100-500ms
// Moves mouse in curved path
// Small jitter before click
```

### Typing Behavior

```ts
// Without human mode
await piggy.site.type("#input", "Hello World");
// Types instantly - all characters at once

// With human mode
piggy.actHuman(true);
await piggy.site.type("#input", "Hello World");
// Types 50-300ms per character
// 5% chance of typo + backspace correction
// Random pauses between words
// Natural rhythm
```

### Scrolling Behavior

```ts
// Without human mode
await piggy.site.scroll.by(1000);
// Jumps instantly to position

// With human mode
piggy.actHuman(true);
await piggy.site.scroll.by(1000);
// Smooth easing over 500-1500ms
// Random speed variation
// Occasional pauses mid-scroll
// Natural acceleration/deceleration
```

### Wait Behavior

```ts
// Without human mode
await piggy.site.wait(1000);
// Exactly 1000ms

// With human mode
piggy.actHuman(true);
await piggy.site.wait(1000);
// Random between 700-1300ms (±30%)
```

---

## Real-World Examples

### 1. Human-Like Search Flow

```ts
await piggy.launch({ mode: "tab", binary: "headful" });
piggy.actHuman(true);

await piggy.register("search", "https://google.com");
await piggy.search.navigate();

// Natural search behavior
await piggy.search.wait(800);                    // Pause like human
await piggy.search.click("#search-input");       // Click with delay
await piggy.search.type("#search-input", "best laptops 2024"); // Typing
await piggy.search.wait(600);                    // Think time
await piggy.search.keyboard.press("Enter");      // Press enter
await piggy.search.waitForNavigation();

// Scroll through results naturally
for (let i = 0; i < 3; i++) {
  await piggy.search.wait(1200);                 // Read result
  await piggy.search.scroll.by(400);             // Smooth scroll
}

// Click result with human timing
await piggy.search.wait(800);
await piggy.search.click("h3");
```

### 2. Form Filling with Realistic Behavior

```ts
await piggy.launch({ mode: "tab" });
piggy.actHuman(true);

await piggy.register("form", "https://example.com/signup");
await piggy.form.navigate();

// Fill form naturally
await piggy.form.type("#first-name", "John");
await piggy.form.wait(200);                      // Pause between fields

await piggy.form.type("#last-name", "Doe");
await piggy.form.wait(200);

await piggy.form.type("#email", "john.doe@example.com");
await piggy.form.wait(200);

await piggy.form.type("#phone", "555-123-4567");

// Natural field navigation
await piggy.form.keyboard.press("Tab");
await piggy.form.wait(150);
await piggy.form.keyboard.press("Tab");

// Select dropdown - human hesitation
await piggy.form.wait(500);
await piggy.form.click("#country");
await piggy.form.wait(400);
await piggy.form.select("#country", "US");

// Check checkbox naturally
await piggy.form.scroll.to("#terms");
await piggy.form.wait(300);
await piggy.form.click("#terms");

// Submit
await piggy.form.wait(500);
await piggy.form.click("#submit");
```

### 3. Shopping Cart with Human Timing

```ts
await piggy.launch({ mode: "tab" });
piggy.actHuman(true);

await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

// Browse like a human
await piggy.shop.wait(1500);                     // Look at homepage

// Hover over menu
await piggy.shop.hover(".nav-menu");
await piggy.shop.wait(400);
await piggy.shop.click("a:contains('Books')");

// Read products
const products = await piggy.shop.fetchLinks(".product_pod h3 a");

for (let i = 0; i < Math.min(3, products.length); i++) {
  await piggy.shop.click(`.product_pod:eq(${i}) h3 a`);
  await piggy.shop.waitForNavigation();
  
  // Read product page
  await piggy.shop.wait(2000);
  
  // Maybe add to cart (70% chance)
  if (Math.random() < 0.7) {
    await piggy.shop.click(".btn-add-to-basket");
    await piggy.shop.wait(800);
    console.log(`Added product ${i + 1} to cart`);
  }
  
  await piggy.shop.goBack();
  await piggy.shop.wait(1000);
}

// Go to cart
await piggy.shop.click(".cart-link");
await piggy.shop.waitForNavigation();

// Review cart
await piggy.shop.wait(2000);
await piggy.shop.scroll.by(300);
await piggy.shop.wait(1000);
```

### 4. Social Media Scrolling

```ts
await piggy.launch({ mode: "tab", binary: "headful" });
piggy.actHuman(true);

await piggy.register("social", "https://twitter.com");
await piggy.social.navigate();

// Natural feed scrolling
for (let i = 0; i < 10; i++) {
  // Read current content
  await piggy.social.wait(3000 + Math.random() * 4000);
  
  // Random interaction (20% chance)
  if (Math.random() < 0.2) {
    const likeBtns = await piggy.social.fetchText(".like-button");
    if (likeBtns.length > 0) {
      const randomIndex = Math.floor(Math.random() * likeBtns.length);
      await piggy.social.click(`.like-button:eq(${randomIndex})`);
      await piggy.social.wait(500);
    }
  }
  
  // Scroll with natural variation
  const scrollAmount = 300 + Math.random() * 400;
  await piggy.social.scroll.by(scrollAmount);
  
  // Random pause mid-scroll
  if (Math.random() < 0.3) {
    await piggy.social.wait(500 + Math.random() * 1000);
    await piggy.social.scroll.by(100);
  }
}

// Occasionally scroll back up
await piggy.social.scroll.to(0);
await piggy.social.wait(2000);
```

### 5. Human Mouse Movements

```ts
// Custom human-like mouse movement
async function humanMouseMove(site: any, targetX: number, targetY: number) {
  // Get current position
  const current = await site.evaluate(() => ({
    x: window.mouseX || 0,
    y: window.mouseY || 0
  }));
  
  const steps = 20 + Math.floor(Math.random() * 30);
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic ease in-out for natural movement
    const ease = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Add random noise
    const noiseX = (Math.random() - 0.5) * 20 * (1 - t);
    const noiseY = (Math.random() - 0.5) * 20 * (1 - t);
    
    const x = current.x + (targetX - current.x) * ease + noiseX;
    const y = current.y + (targetY - current.y) * ease + noiseY;
    
    await site.mouse.move(Math.floor(x), Math.floor(y));
    await site.wait(10 + Math.random() * 20);
  }
}

// Track mouse position
await piggy.site.addInitScript(`
  document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
  });
`);

// Use human mouse movement
await humanMouseMove(piggy.site, 500, 300);
await piggy.site.click("#button");
```

---

## Custom Human Behavior Configuration

```ts
// Custom typing speed
async function humanType(site: any, selector: string, text: string) {
  await site.click(selector);
  
  for (const char of text) {
    // Variable delay between keystrokes
    const delay = 50 + Math.random() * 250;
    await site.wait(delay);
    
    // 5% chance of typo
    if (Math.random() < 0.05) {
      const typo = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
      await site.type(selector, typo);
      await site.wait(200);
      await site.keyboard.press("Backspace");
      await site.wait(100);
    }
    
    await site.type(selector, char);
    
    // Random pause at word boundaries
    if (char === ' ' && Math.random() < 0.3) {
      await site.wait(200 + Math.random() * 300);
    }
  }
}

// Custom scroll with random stops
async function humanScroll(site: any, targetY: number) {
  const currentY = await site.evaluate(() => window.scrollY);
  const distance = targetY - currentY;
  const duration = 500 + Math.random() * 1000;
  const startTime = Date.now();
  
  while (Date.now() - startTime < duration) {
    const elapsed = Date.now() - startTime;
    const t = Math.min(1, elapsed / duration);
    // Easing function
    const ease = 1 - Math.pow(1 - t, 3);
    const y = currentY + distance * ease;
    
    await site.scroll.to(Math.floor(y));
    await site.wait(16); // ~60fps
    
    // Random pause mid-scroll
    if (Math.random() < 0.1) {
      await site.wait(100 + Math.random() * 300);
    }
  }
  
  await site.scroll.to(targetY);
}

// Usage
await humanType(piggy.site, "#search", "hello world");
await humanScroll(piggy.site, 1000);
```

---

## Random Wait Patterns

```ts
// Natural waiting patterns
async function naturalWait(site: any, minMs: number, maxMs: number) {
  const patterns = [
    // Short pause
    () => Math.random() * 200 + 100,
    // Medium pause  
    () => Math.random() * 500 + 300,
    // Long pause with occasional longer
    () => Math.random() < 0.9 ? Math.random() * 800 + 500 : Math.random() * 3000 + 2000
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  let waitTime = pattern();
  
  // Clamp to range
  waitTime = Math.min(maxMs, Math.max(minMs, waitTime));
  
  await site.wait(waitTime);
}

// Think time before action
async function think(site: any) {
  const thinkTime = 300 + Math.random() * 1500;
  await site.wait(thinkTime);
}

// Usage
await piggy.site.click("#button");
await think(piggy.site);
await piggy.site.type("#input", "text");
```

---

## Behavioral Fingerprint Protection

```ts
// Randomize behavioral patterns per session
const behaviors = {
  typingSpeed: {
    slow: () => 150 + Math.random() * 200,
    medium: () => 80 + Math.random() * 100,
    fast: () => 40 + Math.random() * 50
  },
  clickDelay: {
    impatient: () => 50 + Math.random() * 100,
    normal: () => 150 + Math.random() * 200,
    cautious: () => 300 + Math.random() * 400
  },
  scrollSpeed: {
    slow: () => 800 + Math.random() * 500,
    normal: () => 500 + Math.random() * 300,
    fast: () => 300 + Math.random() * 200
  }
};

// Randomly select behavior profile
const profile = {
  typingSpeed: Object.values(behaviors.typingSpeed)[Math.floor(Math.random() * 3)],
  clickDelay: Object.values(behaviors.clickDelay)[Math.floor(Math.random() * 3)],
  scrollSpeed: Object.values(behaviors.scrollSpeed)[Math.floor(Math.random() * 3)]
};

console.log("Behavior profile:", profile);
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `piggy.actHuman(true\|false)` | Enable/disable human mode globally |

### Human Mode Effects Table

| Action | Normal Mode | Human Mode |
|--------|-------------|------------|
| `click()` | Instant | 100-500ms delay, curved mouse |
| `type()` | Instant | 50-300ms per char, 5% typos |
| `hover()` | Instant | 50-200ms delay |
| `scroll.by()` | Instant jump | Smooth 500-1500ms |
| `wait(ms)` | Exact ms | ±30% variance |

---

## Next Steps

- [Anti-Detection](./anti-detection) — Complete anti-detection guide
- [Fingerprint Spoofing](./fingerprint) — Browser fingerprint protection
- [Interactions](./interactions) — More interaction methods

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
