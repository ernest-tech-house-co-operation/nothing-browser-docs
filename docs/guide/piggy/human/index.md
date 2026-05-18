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

### `human.set(opts)`

Sets the human behavior profile for a tab. You can call it multiple times mid-session to switch between profiles — e.g. start cautious for login, then switch to fast for navigation.

```ts
// Cautious profile — slow typing, big click delays, mouse wiggle
// Good for login forms and sensitive interactions
await piggy.quotes.human.set({
  typingSpeed: "slow",
  clickDelay:  "cautious",
  scrollSpeed: "normal",
  mouseWiggle: true,
});

// Switch to fast profile later in the same session
await piggy.quotes.human.set({
  typingSpeed: "fast",
  clickDelay:  "fast",
  mouseWiggle: false,
});
```

### Profile Options

| Option | Values | Description |
|--------|--------|-------------|
| `typingSpeed` | `"slow"` (150-300ms/char), `"normal"` (50-150ms/char), `"fast"` (20-50ms/char) | Speed of typing |
| `clickDelay` | `"cautious"` (300-600ms), `"normal"` (100-300ms), `"fast"` (30-100ms) | Delay before click |
| `scrollSpeed` | `"slow"` (800-1500ms), `"normal"` (400-800ms), `"fast"` (150-400ms) | Scroll animation duration |
| `mouseWiggle` | `true` / `false` | Add small random mouse movements |

### `human.get()`

Returns the current human behavior profile. Useful to verify the profile was applied correctly after `human.set()`.

```ts
const profile = await piggy.quotes.human.get();
console.log(profile);
// {
//   clickDelay: "cautious",
//   mouseWiggle: true,
//   scrollSpeed: "normal",
//   typingSpeed: "slow",
// }
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
// Basic type — uses profile speed (slow = 150-300ms/char)
await piggy.quotes.human.type({ selector: "#username", text: "admin" });

// clear: true wipes the field before typing — use when re-entering a value
await piggy.quotes.human.type({ selector: "#password", text: "wrongpassword", clear: true });

// speed overrides the profile — 40ms between keys regardless of typingSpeed setting
await piggy.quotes.human.type({ selector: "#password", text: "admin", clear: true, speed: 40 });
```

---

## Human-Like Click

### `human.click({ selector, force? })`

Clicks an element with human-like delay and mouse movement.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | **Required** | CSS selector of element |
| `force` | `boolean` | `false` | Force click even if element is hidden |

```ts
// Standard human click — respects clickDelay from profile
// In demo: cautious profile = 300-600ms delay before click, took 615ms total
await piggy.quotes.human.click({ selector: "input[type='submit']" });

// force: true clicks even if the element isn't fully visible
// Used here for a pagination link that may be off-screen
await piggy.quotes.human.click({ selector: "li.next a", force: true });
```

---

## Full Example

```ts
import piggy from "nothing-browser"
import path from "path";

const binaryPath = path.resolve(import.meta.dir, "../a/nothing-browser-headful.exe");

await piggy.launch({ mode: "tab", binary: binaryPath });
await piggy.register("quotes", "https://quotes.toscrape.com");

// Enable global human mode
piggy.actHuman(true);

// Set human profile
await piggy.quotes.human.set({
  typingSpeed: "slow",
  clickDelay:  "cautious",
  scrollSpeed: "normal",
  mouseWiggle: true,
});

// Read profile back
const profile = await piggy.quotes.human.get();
console.log("Human profile:", profile);

// Navigate and interact
await piggy.quotes.navigate("https://quotes.toscrape.com/login");
await piggy.quotes.waitForSelector("#username");

await piggy.quotes.human.type({ selector: "#username", text: "admin" });
await piggy.quotes.human.type({ selector: "#password", text: "admin", clear: true, speed: 40 });

await piggy.quotes.human.click({ selector: "input[type='submit']" });
await piggy.quotes.waitForNavigation();

// Switch to fast profile
await piggy.quotes.human.set({
  typingSpeed: "fast",
  clickDelay:  "fast",
  mouseWiggle: false,
});

// Force click
await piggy.quotes.navigate("https://quotes.toscrape.com");
await piggy.quotes.waitForSelector(".quote");
await piggy.quotes.human.click({ selector: "li.next a", force: true });
await piggy.quotes.waitForNavigation();
console.log("Current URL:", piggy.quotes.url());

await piggy.close();
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `human.set(opts)` | `{ typingSpeed?, clickDelay?, scrollSpeed?, mouseWiggle? }` | `Promise<HumanProfile>` | Set profile |
| `human.get()` | — | `Promise<HumanProfile>` | Get profile |
| `human.type(opts)` | `{ selector, text, clear?, speed? }` | `Promise<void>` | Human-like typing |
| `human.click(opts)` | `{ selector, force? }` | `Promise<void>` | Human-like click |
| `piggy.actHuman(enable)` | `enable: boolean` | `piggy` | Enable/disable global human mode |

---

## Type Definitions

```ts
type TypingSpeed = "slow" | "normal" | "fast";
type ClickDelay  = "cautious" | "normal" | "fast";
type ScrollSpeed = "slow" | "normal" | "fast";

interface HumanProfile {
  typingSpeed: TypingSpeed;
  clickDelay:  ClickDelay;
  scrollSpeed: ScrollSpeed;
  mouseWiggle: boolean;
}

interface HumanTypeOptions {
  selector: string;
  text:     string;
  clear?:   boolean;
  speed?:   number;
}

interface HumanClickOptions {
  selector: string;
  force?:   boolean;
}
```

---

## Next Steps
- [Interactions API](../interactions) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*