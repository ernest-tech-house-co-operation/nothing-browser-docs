# Launch & Register

Configure the browser and register sites for scraping.

## Launch Options

```ts
import piggy from "nothing-browser";

await piggy.launch({
  mode: "tab",      // "tab" | "process"
  binary: "headless" // "headless" | "headful"
});
```

### `mode` — Tab vs Process

| Mode | Description | Use Case |
|------|-------------|----------|
| `"tab"` | Single browser instance, multiple tabs | Most scraping tasks |
| `"process"` | Separate browser process per site | Isolation, different profiles |

**Default:** `"tab"`

### `binary` — Headless vs Headful

| Binary | Description | Use Case |
|--------|-------------|----------|
| `"headless"` | No visible window | Production, CI/CD, servers |
| `"headful"` | Visible browser window | Debugging, sites that detect headless |

**Default:** `"headless"`

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

### Register with Custom Binary

Override the global binary for a specific site:

```ts
// Global: headless
await piggy.launch({ binary: "headless" });

// This site runs headful (visible window)
await piggy.register("debug", "https://example.com", { binary: "headful" });
```

---

## Complete Launch Example

```ts
import piggy from "nothing-browser";

// Launch with options
await piggy.launch({
  mode: "tab",
  binary: "headless"
});

// Register multiple sites
await piggy.register("books", "https://books.toscrape.com");
await piggy.register("api", "https://api.example.com");
await piggy.register("dashboard", "https://dashboard.example.com", { binary: "headful" });

// Navigate and scrape
await piggy.books.navigate();
const title = await piggy.books.title();
console.log("Page title:", title);

await piggy.close();
```

---

## Process Mode (Isolated Browsers)

When you need complete isolation between sites (different IPs, profiles, or cookies don't mix):

```ts
await piggy.launch({ mode: "process" });

// Each site gets its own browser process
await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");

// They run completely independently
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
piggy.actHuman(true);  // All interactions now have random delays

await piggy.register("site", "https://example.com");
await piggy.site.click("button");     // Random delay before click
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

Check which binary would be used:

```ts
import piggy from "nothing-browser";

const headlessPath = piggy.detect("headless");
const headfulPath = piggy.detect("headful");

console.log("Headless:", headlessPath); // "/path/to/nothing-browser-headless"
console.log("Headful:", headfulPath);   // "/path/to/nothing-browser-headful"
```

---

## Error Handling

```ts
try {
  await piggy.launch({ binary: "headless" });
} catch (error) {
  console.error("Failed to launch:", error.message);
  // Binary not found, missing dependencies, etc.
}

try {
  await piggy.register("site", "https://example.com");
} catch (error) {
  console.error("Registration failed:", error.message);
  // Must call launch() first
}
```

---

## Complete Setup with Session Persistence

```ts
import piggy from "nothing-browser";
import { existsSync, readFileSync, writeFileSync } from "fs";

const SESSION_FILE = "./session.json";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Load saved session if exists
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.site.session.import(saved);
  console.log("Session restored");
}

await piggy.site.navigate();

// Save session on exit
process.on("SIGINT", async () => {
  const session = await piggy.site.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("Session saved");
  await piggy.close();
  process.exit(0);
});
```

---

## Next Steps

- [Navigation](./navigation) — Page navigation and waiting
- [Interactions](./interactions) — Click, type, hover, scroll
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
