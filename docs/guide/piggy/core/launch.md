# 🚀 Launch & Connect — Start the Browser

Launch the Nothing Browser binary locally or connect to a remote Piggy server. Control browser mode, binary selection, and tab pooling.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

Piggy supports two connection modes:

| Mode | Transport | Use Case |
|------|-----------|----------|
| **Local launch** | Unix socket / Windows pipe | Same-machine scraping, development |
| **Remote connect** | HTTP (port 2005) | VPS deployment, team access |

---

## Local Launch

### `piggy.launch(opts?)`

Spawns the Nothing Browser binary and connects over a local socket.

```ts
import piggy from "nothing-browser";

// Default: headless, tab mode
await piggy.launch();

// With options
await piggy.launch({ 
  mode: "tab",      // "tab" | "process"
  binary: "headless" // "headless" | "headful" | "/custom/path"
});
```

### Launch Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | `"tab" \| "process"` | `"tab"` | Tab mode: single browser, multiple tabs. Process mode: separate browser per site |
| `binary` | `"headless" \| "headful" \| string` | `"headless"` | Binary to use. Custom string = path to binary |

### Linux / macOS (Simple)

```ts
// Just works — binary in project root
await piggy.launch({ binary: "headless" });
```

### Windows (Custom Path Required)

Windows binaries require `.dll` files. Keep them together in a folder:

```
C:\my-scraper\
├── brow\
│   └── nothing-browser-headless.exe
└── index.ts
```

```ts
// Windows — full path to .exe
await piggy.launch({ 
  binary: "brow/nothing-browser-headless.exe" 
});
```

### Custom Binary Path (Any OS)

```ts
// Absolute path
await piggy.launch({ 
  binary: "/opt/browsers/nothing-browser-headless" 
});

// Relative path
await piggy.launch({ 
  binary: "./binaries/nothing-browser-headless" 
});

// Windows absolute
await piggy.launch({ 
  binary: "C:\\browsers\\nothing-browser-headless.exe" 
});
```

---

## Remote Connect

### `piggy.connect({ host, key })`

Connects to a running Piggy server over HTTP (port 2005). The server must be started separately with `./nothing-browser-headless` in HTTP mode.

```ts
await piggy.connect({
  host: "http://localhost:2005",
  key: "peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d"
});
```

### First-Time Server Setup (VPS)

```bash
# Upload binary to VPS, SSH in, run:
./nothing-browser-headless

# Choose HTTP mode, enter session name
Mode? (socket/http): http
Session name: my-server

# Copy the generated key (shown once)
Key: peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d

# Run in background
nohup ./nothing-browser-headless > piggy.log 2>&1 &
```

### Connect from Code

```ts
await piggy.connect({
  host: "http://your-vps-ip:2005",
  key: process.env.PIGGY_KEY  // Store in env variable
});
```

---

## Register a Site

### `piggy.register(name, url, opts?)`

Registers a site and attaches a `SiteObject` as `piggy[name]`.

```ts
await piggy.register("amazon", "https://www.amazon.com");

// Now use it
await piggy.amazon.navigate();
const title = await piggy.amazon.title();
```

### Register Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `binary` | `string` | Same as launch | Override binary for this site |
| `pool` | `number` | `1` | Number of tabs for concurrent requests |

### With Tab Pooling

```ts
// 4 concurrent requests to same site
await piggy.register("amazon", "https://www.amazon.com", { pool: 4 });
```

### With Custom Binary Per Site

```ts
await piggy.launch({ binary: "headless" });

// This one runs headful for debugging
await piggy.register("debug", "https://example.com", { 
  binary: "headful" 
});
```

---

## Close

### `piggy.close(opts?)`

Shuts down the browser and cleans up resources.

```ts
// Graceful close (waits for active operations)
await piggy.close();

// Force kill immediately
await piggy.close({ force: true });
```

### Keeping Sites Alive

Use `noclose()` to prevent a site from closing when `piggy.close()` is called.

```ts
await piggy.register("api", "https://api.example.com");
piggy.api.noclose();  // Won't close on piggy.close()

await piggy.close();  // api stays alive, others close
```

---

## Detect Binary

### `piggy.detect(binary)`

Checks if a binary exists without launching.

```ts
const headlessPath = piggy.detect("headless");
const headfulPath = piggy.detect("headful");
const customPath = piggy.detect("./brow/nothing-browser-headless.exe");

console.log("Headless found at:", headlessPath);
console.log("Headful found at:", headfulPath);
```

Returns `string` with full path, or `null` if not found.

---

## Human Mode

### `piggy.actHuman(enable)`

Enables human-like behavior (random delays, smooth scrolling, natural typing) for all interactions.

```ts
// Enable globally
piggy.actHuman(true);

await piggy.amazon.click("button");  // Has random delay
await piggy.amazon.type("#search", "laptop");  // Variable typing speed

// Disable
piggy.actHuman(false);
```

---

## Mode

### `piggy.mode(mode)`

Sets the default tab mode for subsequent `register()` calls.

```ts
// Each site gets its own browser process
piggy.mode("process");

await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");

// Back to tab mode
piggy.mode("tab");
```

| Mode | Description |
|------|-------------|
| `"tab"` | Single browser, multiple tabs (default) |
| `"process"` | Separate browser per site |

---

## Complete Examples

### Example 1: Local Development

```ts
import piggy from "nothing-browser";

// Launch browser
await piggy.launch({ mode: "tab", binary: "headless" });

// Enable human mode for realistic behavior
piggy.actHuman(true);

// Register sites
await piggy.register("amazon", "https://www.amazon.com");
await piggy.register("ebay", "https://www.ebay.com");

// Navigate
await piggy.amazon.navigate();
await piggy.amazon.wait.selector({ selector: "[data-asin]" });

const products = await piggy.amazon.provide.textAll({ selector: ".title" });
console.log(products);

await piggy.close();
```

### Example 2: Remote VPS Deployment

```ts
import piggy from "nothing-browser";

// Connect to remote server
await piggy.connect({
  host: process.env.PIGGY_HOST,
  key: process.env.PIGGY_KEY
});

// Register site
await piggy.register("amazon", "https://www.amazon.com");

// Scrape
await piggy.amazon.navigate();
const title = await piggy.amazon.title();
console.log(title);

// Don't close — server stays running
// await piggy.close();  // Only call when shutting down
```

### Example 3: Tab Pooling for High Concurrency

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });

// Pool of 4 tabs for concurrent API requests
await piggy.register("amazon", "https://www.amazon.com", { pool: 4 });

// API server with 4 concurrent scrapers
await piggy.amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  await piggy.amazon.navigate(`https://amazon.com/s?k=${term}`);
  // ... scraping logic
  return { term, products };
});

await piggy.serve(3000);
```

### Example 4: Multiple Processes (Isolation)

```ts
import piggy from "nothing-browser";

// Each site gets its own browser process
await piggy.launch({ mode: "process" });

await piggy.register("site1", "https://site1.com");
await piggy.register("site2", "https://site2.com");

// They run completely independently
await Promise.all([
  piggy.site1.navigate(),
  piggy.site2.navigate()
]);

const [title1, title2] = await Promise.all([
  piggy.site1.title(),
  piggy.site2.title()
]);

console.log({ title1, title2 });

await piggy.close();
```

---

## Error Handling

```ts
try {
  await piggy.launch({ binary: "headless" });
} catch (error) {
  console.error("Failed to launch:", error.message);
  // Check: binary exists? permissions? dependencies?
}

try {
  await piggy.connect({ host: "http://localhost:2005", key: "wrong-key" });
} catch (error) {
  console.error("Connection failed:", error.message);
  // Invalid key or server not running
}

try {
  await piggy.register("site", "https://example.com");
} catch (error) {
  console.error("Registration failed:", error.message);
  // Call launch() or connect() first
}
```

---

## Binary Detection Path Order

| Input | Search Locations |
|-------|------------------|
| `"headless"` | 1. `./nothing-browser-headless`<br>2. `./bin/nothing-browser-headless`<br>3. System PATH |
| `"headful"` | Same as above, with `-headful` suffix |
| Custom string | Exact path (no search) |

---

## API Reference

### Global Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `launch(opts?)` | `{ mode?, binary? }` | `Promise<piggy>` | Start local browser |
| `connect(opts)` | `{ host, key }` | `Promise<piggy>` | Connect to remote server |
| `register(name, url, opts?)` | `name, url, { binary?, pool? }` | `Promise<piggy>` | Register a site |
| `close(opts?)` | `{ force? }` | `Promise<void>` | Shutdown |
| `actHuman(enable)` | `enable: boolean` | `piggy` | Enable human mode |
| `mode(mode)` | `mode: "tab" \| "process"` | `piggy` | Set tab mode |
| `detect(binary)` | `binary: string` | `string \| null` | Check binary exists |

### Site Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `noclose()` | — | `SiteObject` | Prevent closing on `piggy.close()` |
| `poolStats()` | — | `{ idle, busy, queued, total }` | Pool statistics (if pool > 1) |
| `close()` | — | `Promise<void>` | Close this site only |

---

## Type Definitions

```ts
interface LaunchOptions {
  mode?: "tab" | "process";
  binary?: "headless" | "headful" | string;
}

interface ConnectOptions {
  host: string;
  key: string;
}

interface RegisterOptions {
  binary?: "headless" | "headful" | string;
  pool?: number;
}

interface PoolStats {
  idle: number;
  busy: number;
  queued: number;
  total: number;
}
```

---

## Next Steps

- [Navigation](./navigation) — Navigate, reload, back/forward
- [Interactions](./click) — Click, type, hover
- [Find API](./find) — Query DOM elements

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
