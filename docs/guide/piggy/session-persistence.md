# 💾 Session Persistence — Save WebSocket Frames & Pings

Opt-in persistence for WebSocket frames and ping logs. Perfect for debugging, replaying WebSocket traffic, or analyzing connection stability.

---

## Overview

Piggy can save two types of session data to disk:

| File | Content | Enabled By Default |
|------|---------|-------------------|
| `cookies.json` | All browser cookies | ✅ Yes (auto) |
| `profile.json` | Browser settings (UA, GPU, etc.) | ✅ Yes (auto) |
| `identity.json` | Hardware fingerprint | ✅ Yes (auto) |
| `ws.json` | WebSocket frames (sent/received) | ❌ Opt-in |
| `pings.json` | Connection ping log | ❌ Opt-in |

> ⚠️ **Version Required:** Binary v0.1.12+ | Library v0.0.18+

---

## Quick Start

```typescript
import piggy from "nothing-browser";

await piggy.connect({
  host: "http://localhost:2005",
  key: "peaseernest..."
});

// Enable WebSocket frame saving
await piggy.sessionWsSave(true);

// Enable ping log saving
await piggy.sessionPingsSave(true);

// Now all WebSocket traffic and pings are saved to disk
// Files are in the same directory as your binary

// Get file paths
const paths = await piggy.sessionPaths();
console.log(paths);
// {
//   workDir: "/home/user/my-scraper",
//   cookies: "/home/user/my-scraper/cookies.json",
//   profile: "/home/user/my-scraper/profile.json",
//   ws: "/home/user/my-scraper/ws.json",
//   pings: "/home/user/my-scraper/pings.json"
// }

// Hot reload cookies/profile without restart
await piggy.sessionReload();
```

---

## File Locations

All files are saved in the **same directory as the binary** (your working directory).

```
/home/user/my-scraper/
├── nothing-browser-headless
├── identity.json          ← Hardware fingerprint (auto)
├── profile.json           ← Browser settings (auto)
├── cookies.json           ← Persistent cookies (auto)
├── ws.json                ← WebSocket frames (opt-in)
└── pings.json             ← Ping log (opt-in)
```

### Get File Paths

```typescript
// Get all paths at once
const paths = await piggy.sessionPaths();
console.log(paths.workDir);     // "/home/user/my-scraper"
console.log(paths.cookies);     // "/home/user/my-scraper/cookies.json"
console.log(paths.profile);     // "/home/user/my-scraper/profile.json"
console.log(paths.ws);          // "/home/user/my-scraper/ws.json"
console.log(paths.pings);       // "/home/user/my-scraper/pings.json"

// Get individual paths
const cookiesPath = await piggy.sessionCookiesPath();
const profilePath = await piggy.sessionProfilePath();
const wsPath = await piggy.sessionWsPath();
const pingsPath = await piggy.sessionPingsPath();
```

---

## WebSocket Frame Persistence (`ws.json`)

### Enable Saving

```typescript
// Start saving WebSocket frames
await piggy.sessionWsSave(true);

// All WebSocket traffic from now on is saved to ws.json
```

### Disable Saving

```typescript
// Stop saving WebSocket frames
await piggy.sessionWsSave(false);
```

### File Format (`ws.json`)

```json
[
  {
    "id": "ws_001",
    "direction": "sent",
    "type": "text",
    "data": "{\"type\":\"subscribe\",\"channel\":\"trades\"}",
    "timestamp": 1700000000000,
    "size": 42
  },
  {
    "id": "ws_002",
    "direction": "received",
    "type": "text",
    "data": "{\"type\":\"trade\",\"price\":50000,\"volume\":1.5}",
    "timestamp": 1700000000123,
    "size": 48
  },
  {
    "id": "ws_003",
    "direction": "received",
    "type": "close",
    "data": "",
    "timestamp": 1700000005000,
    "size": 0
  }
]
```

### Real-World Example: Capture WebSocket Trades

```typescript
// Enable WebSocket saving
await piggy.sessionWsSave(true);

await piggy.register("exchange", "https://tradingview.com");
await piggy.exchange.navigate();

// All WebSocket messages are automatically saved to ws.json

// Later, analyze the saved data
import { readFileSync } from "fs";
const wsFrames = JSON.parse(readFileSync("./ws.json", "utf-8"));

const trades = wsFrames.filter(f => 
  f.type === "text" && 
  f.data.includes("trade")
);
console.log(`Captured ${trades.length} trade messages`);
```

---

## Ping Persistence (`pings.json`)

### Enable Saving

```typescript
// Start saving ping logs
await piggy.sessionPingsSave(true);

// All pings are now saved to pings.json
```

### Disable Saving

```typescript
// Stop saving ping logs
await piggy.sessionPingsSave(false);
```

### File Format (`pings.json`)

```json
[
  {
    "timestamp": 1700000000000,
    "latencyMs": 45,
    "status": "success"
  },
  {
    "timestamp": 1700000030000,
    "latencyMs": 52,
    "status": "success"
  },
  {
    "timestamp": 1700000060000,
    "latencyMs": null,
    "status": "failed",
    "error": "timeout"
  }
]
```

### Real-World Example: Monitor Connection Stability

```typescript
// Enable ping saving
await piggy.sessionPingsSave(true);

// Run your scraper for hours
for (let i = 0; i < 1000; i++) {
  await piggy.site.navigate(`https://example.com/page/${i}`);
  await piggy.site.wait(5000);
}

// Analyze ping logs
import { readFileSync } from "fs";
const pings = JSON.parse(readFileSync("./pings.json", "utf-8"));

const failed = pings.filter(p => p.status === "failed");
const avgLatency = pings
  .filter(p => p.status === "success")
  .reduce((sum, p) => sum + p.latencyMs, 0) / pings.filter(p => p.status === "success").length;

console.log(`Pings: ${pings.length} total, ${failed.length} failed`);
console.log(`Average latency: ${avgLatency}ms`);

if (failed.length > pings.length * 0.1) {
  console.warn("⚠️ High failure rate, consider using proxies");
}
```

---

## Hot Reload — Edit Files While Running

You can edit `cookies.json` or `profile.json` while Piggy is running, and reload them without restarting the binary.

### Reload Cookies and Profile

```typescript
// After editing cookies.json or profile.json
await piggy.sessionReload();

// Changes take effect immediately
```

### Use Case: Update Cookies Mid-Session

```bash
# 1. While scraper is running, edit cookies.json
nano cookies.json

# 2. Add a new session cookie
{
  "name": "new_session",
  "value": "abc123",
  "domain": ".example.com",
  "path": "/"
}

# 3. Reload from TypeScript
await piggy.sessionReload();

# 4. New cookies are now in the browser without restart
```

### Use Case: Change User Agent Mid-Session

```bash
# 1. Edit profile.json
nano profile.json

# Change user_agent to something else
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0"
}

# 2. Reload
await piggy.sessionReload();

# 3. All new requests use the new User-Agent
```

---

## Auto-Generated Files (No Opt-in Needed)

### `identity.json` — Hardware Fingerprint

Generated on first run. Contains real hardware values:

```json
{
  "cpu_cores": 8,
  "ram_gb": 16,
  "screen_resolution": "1920x1080",
  "gpu_vendor": "Intel",
  "gpu_renderer": "ANGLE (Intel, Mesa Intel(R) HD Graphics 3000)",
  "timezone": "Africa/Nairobi",
  "canvas_seed": 123456789,
  "audio_seed": 987654321,
  "webgl_seed": 555555555,
  "font_seed": 111111111
}
```

**⚠️ Do NOT modify this file manually.** It ensures consistent fingerprint across restarts.

### `profile.json` — Browser Settings

Generated from `identity.json`. Contains browser configuration:

```json
{
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0.0.0",
  "sec_ch_ua": "\"Google Chrome\";v=\"124\", \"Chromium\";v=\"124\"",
  "platform": "Linux x86_64",
  "chrome_version": 124,
  "language": "en-US",
  "gpu_renderer": "ANGLE (Intel, Mesa Intel(R) HD Graphics 3000)",
  "gpu_vendor": "Google Inc. (Intel)",
  "timezone": "Africa/Nairobi"
}
```

**You CAN modify this file** — changes apply after `sessionReload()`.

### `cookies.json` — Persistent Cookies

Auto-saved, auto-loaded. Format:

```json
[
  {
    "name": "session_id",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "Lax",
    "expires": 1735689600
  }
]
```

**You CAN modify this file** — changes apply after `sessionReload()`.

---

## Complete Example: Persistent Session with All Features

```typescript
import piggy from "nothing-browser";
import { readFileSync, writeFileSync } from "fs";

await piggy.connect({
  host: "http://localhost:2005",
  key: process.env.PIGGY_KEY
});

// Enable WebSocket and ping persistence
await piggy.sessionWsSave(true);
await piggy.sessionPingsSave(true);

// Get file paths
const paths = await piggy.sessionPaths();
console.log("Working directory:", paths.workDir);
console.log("Cookies:", paths.cookies);
console.log("Profile:", paths.profile);
console.log("WebSocket log:", paths.ws);
console.log("Ping log:", paths.pings);

// Register site
await piggy.register("api", "https://api.example.com");

// Navigate (WebSocket connections will be logged to ws.json)
await piggy.api.navigate();

// Do stuff...
for (let i = 0; i < 100; i++) {
  await piggy.api.click("#refresh");
  await piggy.api.wait(1000);
}

// Check ping statistics
const pings = JSON.parse(readFileSync(paths.pings, "utf-8"));
const failed = pings.filter(p => p.status === "failed");
console.log(`Ping failures: ${failed.length}/${pings.length}`);

// Check WebSocket messages
const wsFrames = JSON.parse(readFileSync(paths.ws, "utf-8"));
const messages = wsFrames.filter(f => f.direction === "received");
console.log(`Received ${messages.length} WebSocket messages`);

// Hot reload new cookies if needed
writeFileSync(paths.cookies, JSON.stringify([
  { name: "token", value: "new_token", domain: ".api.example.com", path: "/" }
]));
await piggy.sessionReload();
console.log("Cookies hot-reloaded!");

await piggy.close();
```

---

## Performance Considerations

| Feature | Disk Usage | Performance Impact |
|---------|-----------|-------------------|
| `ws.json` | High (each frame saved) | Low (async write) |
| `pings.json` | Low (one entry per ping) | Negligible |
| `cookies.json` | Very low | None |
| `profile.json` | Very low | None |
| `identity.json` | Very low (one-time) | None |

### When to Enable WebSocket Saving

| Use Case | Enable? |
|----------|---------|
| Debugging WebSocket issues | ✅ Yes |
| Reverse engineering WebSocket APIs | ✅ Yes |
| Long-running production scraper | ❌ No (disk may fill) |
| High-frequency trading data | ⚠️ Maybe (monitor disk space) |

### Manage Disk Space

```typescript
// Rotate ws.json periodically
import { renameSync, existsSync } from "fs";

if (existsSync("./ws.json")) {
  const stats = await fs.stat("./ws.json");
  if (stats.size > 100 * 1024 * 1024) { // 100MB
    renameSync("./ws.json", `./ws-${Date.now()}.json`);
    await piggy.sessionWsSave(false);
    await piggy.sessionWsSave(true); // Restart with fresh file
  }
}
```

---

## API Reference

### Session Persistence Methods

| Method | Description |
|--------|-------------|
| `sessionWsSave(enabled)` | Enable/disable WebSocket frame saving to `ws.json` |
| `sessionPingsSave(enabled)` | Enable/disable ping log saving to `pings.json` |
| `sessionPaths()` | Get all file paths (workDir, cookies, profile, ws, pings) |
| `sessionCookiesPath()` | Get path to `cookies.json` |
| `sessionProfilePath()` | Get path to `profile.json` |
| `sessionWsPath()` | Get path to `ws.json` |
| `sessionPingsPath()` | Get path to `pings.json` |
| `sessionReload()` | Hot reload `cookies.json` and `profile.json` |

### Auto-Generated Methods (Always Available)

| Method | Description |
|--------|-------------|
| `sessionExport()` | Export current session (cookies + storage) |
| `sessionImport(data)` | Import saved session |

---

## File Format Specifications

### `ws.json` — WebSocket Frame

```typescript
interface WsFrame {
  id: string;                    // Unique frame ID
  direction: "sent" | "received";
  type: "text" | "binary" | "open" | "close";
  data: string;                  // For text: the message, for binary: base64
  timestamp: number;             // Unix timestamp in ms
  size: number;                  // Size in bytes
}
```

### `pings.json` — Ping Log

```typescript
interface PingEntry {
  timestamp: number;             // Unix timestamp in ms
  latencyMs: number | null;      // Latency in ms, null if failed
  status: "success" | "failed";
  error?: string;                // Only present if failed
}
```

### `cookies.json` — Cookie

```typescript
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;              // Unix timestamp
}
```

### `profile.json` — Browser Profile

```typescript
interface Profile {
  user_agent: string;
  sec_ch_ua: string;
  platform: string;
  chrome_version: number;
  language: string;
  gpu_renderer: string;
  gpu_vendor: string;
  timezone: string;
}
```

### `identity.json` — Hardware Fingerprint

```typescript
interface Identity {
  cpu_cores: number;
  ram_gb: number;
  screen_resolution: string;
  gpu_vendor: string;
  gpu_renderer: string;
  timezone: string;
  canvas_seed: number;
  audio_seed: number;
  webgl_seed: number;
  font_seed: number;
}
```

---

## Troubleshooting

### "ws.json not being created"

**Cause:** WebSocket saving not enabled

**Fix:**
```typescript
await piggy.sessionWsSave(true);
```

### "sessionReload() not working"

**Cause:** Binary version too old (< v0.1.12)

**Fix:** Update binary to v0.1.12+

### "Disk full"

**Cause:** `ws.json` grew too large

**Fix:**
```bash
# Disable WebSocket saving
await piggy.sessionWsSave(false);

# Rotate or delete the file
rm ws.json
```

### "Cookies not persisting across restarts"

**Cause:** `cookies.json` permissions issue

**Fix:**
```bash
chmod 644 cookies.json
```

---

## Next Steps

- [Identity & Profile](./identity-profile) — Understand fingerprint files in depth
- [Cookies Hot Reload](./cookies-hotreload) — Edit cookies while browser runs
- [Remote Deployment](./remote-deployment) — Run Piggy on a VPS

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
