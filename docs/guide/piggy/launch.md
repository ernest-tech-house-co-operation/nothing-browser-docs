# Launch & Register

Configure the browser and register sites for scraping.

---

## Launch Options

```ts
import piggy from "nothing-browser";

await piggy.launch({
  mode: "tab",           // "tab" | "process"
  binary: "headless"     // "headless" | "headful" | "/custom/path/to/binary"
});
```

### `mode` — Tab vs Process

| Mode | Description | Use Case |
|------|-------------|----------|
| `"tab"` | Single browser instance, multiple tabs | Most scraping tasks |
| `"process"` | Separate browser process per site | Isolation, different profiles |

**Default:** `"tab"`

### `binary` — Headless, Headful, or Custom Path

| Value | Description |
|-------|-------------|
| `"headless"` | No visible window — looks in project root |
| `"headful"` | Visible browser window — looks in project root |
| Custom path (any string) | Raw path to binary (required for Windows) |

**Default:** `"headless"`

---

## Linux / macOS Users (Simple)

Just use the defaults:

```typescript
await piggy.launch({ binary: "headless" });
```

That's it. One file. No DLLs. No paths.

---

## Windows Users (Custom Path Required)

**Our recommendation:** Extract the zip to a `brow` folder in your project root:

```
C:\my-scraper\
├── brow\
│   └── nothing-browser-headless.exe
├── package.json
└── index.ts
```

Then:

```typescript
await piggy.launch({ 
  binary: "brow/nothing-browser-headless.exe" 
});
```

### Windows Path Examples

```typescript
// ✅ Our recommendation — clean and simple
binary: "brow/nothing-browser-headless.exe"

// ✅ Absolute path (also works)
binary: "C:\\my-scraper\\brow\\nothing-browser-headless.exe"

// ✅ Forward slashes work too
binary: "C:/my-scraper/brow/nothing-browser-headless.exe"

// ❌ Don't do this — missing .exe
binary: "brow/nothing-browser-headless"
```

### How Path Detection Works

| Input | Behavior |
|-------|----------|
| `"headless"` | Looks for `nothing-browser-headless` in cwd |
| `"headful"` | Looks for `nothing-browser-headful` in cwd |
| Any other string | Treats as raw path, checks existence |

---

## Register a Site

After launching, register sites to get a controllable object:

```ts
await piggy.register("books", "https://books.toscrape.com");
```

Now you can control it via `piggy.books`:

```ts
await piggy.books.navigate();
const title = await piggy.books.title();
```

### Register with Custom Binary (Per Site)

Override the global binary for a specific site:

```ts
// Global: headless
await piggy.launch({ binary: "headless" });

// This site runs headful (visible window)
await piggy.register("debug", "https://example.com", { binary: "headful" });

// Windows — custom path per site
await piggy.register("amazon", "https://amazon.com", { 
  binary: "brow/nothing-browser-headless.exe" 
});
```

### Register with Tab Pooling

```ts
// Pool of 3 tabs for concurrent requests
await piggy.register("amazon", "https://amazon.com", { pool: 3 });
```

---

## Complete Launch Example

```ts
import piggy from "nothing-browser";

// Linux / macOS
await piggy.launch({ mode: "tab", binary: "headless" });

// Windows — use custom path
// await piggy.launch({ mode: "tab", binary: "brow/nothing-browser-headless.exe" });

// Register multiple sites
await piggy.register("books", "https://books.toscrape.com");
await piggy.register("api", "https://api.example.com");

// Navigate and scrape
await piggy.books.navigate();
const title = await piggy.books.title();
console.log("Page title:", title);

await piggy.close();
```

---

## Process Mode (Isolated Browsers)

When you need complete isolation between sites:

```ts
await piggy.launch({ mode: "process" });

// Each site gets its own browser process
await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");

await piggy.site1.navigate();
await piggy.site2.navigate();
```

**When to use process mode:**
- Different proxy configurations per site
- Sites that conflict with each other
- Testing with different browser profiles

**When to use tab mode (default):**
- Most scraping tasks
- Lower resource usage
- Sharing cookies/session between sites

---

## Human Mode

Enable human-like behavior globally:

```ts
await piggy.launch();
piggy.actHuman(true);

await piggy.register("site", "https://example.com");
await piggy.site.click("button");        // Random delay before click
await piggy.site.type("#input", "hello"); // Simulated typing speed
```

Human mode affects:
- `click()` — random delay (100-500ms)
- `type()` — variable typing speed, occasional typos
- `hover()` — delay before hover
- `scroll.by()` — smooth, varied scrolling
- `wait()` — ±30% random variance

---

## Binary Detection

Check which binary would be used without launching:

```ts
import piggy from "nothing-browser";

const headlessPath = piggy.detect("headless");
const headfulPath = piggy.detect("headful");
const customPath = piggy.detect("brow/nothing-browser-headless.exe");

console.log("Headless:", headlessPath);
console.log("Headful:", headfulPath);
console.log("Custom:", customPath);
```

---

## Error Handling

```ts
try {
  await piggy.launch({ binary: "headless" });
} catch (error) {
  console.error("Failed to launch:", error.message);
}

try {
  await piggy.launch({ binary: "brow/nothing-browser-headless.exe" });
} catch (error) {
  console.error("Binary not found — double-check your path");
}

try {
  await piggy.register("site", "https://example.com");
} catch (error) {
  console.error("Registration failed — call launch() first");
}
```

---

## Quick Summary

| Platform | Launch Code |
|----------|-------------|
| **Linux / macOS** | `await piggy.launch({ binary: "headless" })` |
| **Windows** | `await piggy.launch({ binary: "brow/nothing-browser-headless.exe" })` |

---

## Next Steps

- [Navigation](./navigation) — Page navigation and waiting
- [Interactions](./interactions) — Click, type, hover, scroll
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
