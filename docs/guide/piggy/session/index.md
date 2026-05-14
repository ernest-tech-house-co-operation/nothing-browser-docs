# 💾 Session API — Persistence & Hot Reload

Save and restore browser state including cookies, localStorage, sessionStorage, and navigation history. Perfect for maintaining logged-in sessions across script runs.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Session API captures and restores everything needed to resume a browser session:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `session.export()` | Save current session | Persist login state |
| `session.import()` | Restore saved session | Resume previous session |
| `session.reload()` | Hot reload files | Apply edited cookies/profile |
| `session.paths()` | Get file locations | Find where data is stored |
| `session.setWsSave()` | Enable WebSocket saving | Capture WebSocket frames to disk |
| `session.setPingsSave()` | Enable ping saving | Monitor connection health |

---

## File Locations

All session files are saved in your **working directory** (where your script runs):

```
/home/user/my-scraper/
├── identity.json          ← Hardware fingerprint (auto)
├── profile.json           ← Browser settings (auto)
├── cookies.json           ← Persistent cookies (auto)
├── ws.json                ← WebSocket frames (opt-in)
└── pings.json             ← Ping log (opt-in)
```

### Get File Paths

```ts
const paths = await piggy.site.session.paths();
console.log(paths);
// {
//   workDir: "/home/user/my-scraper",
//   cookies: "/home/user/my-scraper/cookies.json",
//   profile: "/home/user/my-scraper/profile.json",
//   ws: "/home/user/my-scraper/ws.json",
//   pings: "/home/user/my-scraper/pings.json"
// }

// Get individual paths
const cookiesPath = await piggy.site.session.cookiesPath();
const profilePath = await piggy.site.session.profilePath();
const wsPath = await piggy.site.session.wsPath();
const pingsPath = await piggy.site.session.pingsPath();
```

---

## Export & Import Session

### `session.export()`

Exports current session state (cookies, storage, URL).

```ts
const session = await piggy.site.session.export();
console.log(session);
// {
//   url: "https://example.com/dashboard",
//   cookies: [...],
//   storage: { localStorage: [...], sessionStorage: [...] }
// }
```

### `session.import(data)`

Imports a saved session.

```ts
await piggy.site.session.import(sessionData);
// Cookies and storage restored
await piggy.site.navigate(); // Will be logged in
```

---

## Hot Reload

### `session.reload()`

Reloads `cookies.json` and `profile.json` from disk without restarting the browser.

```ts
// Edit cookies.json while scraper runs
// Then reload
await piggy.site.session.reload();
console.log("Cookies and profile reloaded!");
```

---

## WebSocket & Ping Persistence (Opt-In)

### `session.setWsSave(enabled)`

Enables or disables saving WebSocket frames to `ws.json`.

```ts
// Start saving WebSocket frames
await piggy.site.session.setWsSave(true);

// All WebSocket traffic saved to ws.json

// Stop saving
await piggy.site.session.setWsSave(false);
```

### `session.setPingsSave(enabled)`

Enables or disables saving ping logs to `pings.json`.

```ts
// Start saving ping logs
await piggy.site.session.setPingsSave(true);

// Stop saving
await piggy.site.session.setPingsSave(false);
```

---

## Auto-Saved Files (No Opt-In Needed)

### `cookies.json`

Automatically saved and loaded. Format:

```json
[
  {
    "name": "session_id",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "Lax",
    "expires": 1735689600
  }
]
```

### `profile.json`

Browser settings built from hardware identity:

```json
{
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/124.0.0.0",
  "sec_ch_ua": "\"Google Chrome\";v=\"124\", \"Chromium\";v=\"124\"",
  "platform": "Linux x86_64",
  "chrome_version": 124,
  "language": "en-US",
  "gpu_renderer": "ANGLE (Intel, Mesa Intel(R) HD Graphics 3000)",
  "gpu_vendor": "Google Inc. (Intel)",
  "timezone": "Africa/Nairobi"
}
```

### `identity.json`

Hardware fingerprint (DO NOT EDIT):

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

---

## Real-World Examples

### Example 1: Persistent Login Session

```ts
import { existsSync, readFileSync, writeFileSync } from "fs";

const SESSION_FILE = "./session.json";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Load previous session if exists
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.site.session.import(saved);
  console.log("✅ Session restored");
}

// Verify session still works
await piggy.site.navigate();
const isLoggedIn = await piggy.site.evaluate(() => {
  return document.querySelector(".user-menu") !== null;
});

if (!isLoggedIn) {
  console.log("🔐 Session expired, logging in...");
  await piggy.site.navigate("https://example.com/login");
  await piggy.site.type("#email", "user@example.com");
  await piggy.site.type("#password", "password");
  await piggy.site.click("#login-btn");
  await piggy.site.waitForNavigation();
}

// Save session before exit
process.on("SIGINT", async () => {
  const session = await piggy.site.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("💾 Session saved");
  await piggy.close();
  process.exit(0);
});
```

### Example 2: Enable WebSocket Capture

```ts
// Enable WebSocket saving before navigation
await piggy.site.session.setWsSave(true);

await piggy.site.navigate("https://tradingview.com");
await piggy.site.wait(30000); // Let WebSocket collect data

const paths = await piggy.site.session.paths();
console.log(`WebSocket frames saved to: ${paths.ws}`);

// Later, analyze the data
import { readFileSync } from "fs";
const wsFrames = JSON.parse(readFileSync(paths.ws, "utf-8"));
console.log(`Captured ${wsFrames.length} WebSocket frames`);
```

### Example 3: Monitor Connection Health with Pings

```ts
// Enable ping saving
await piggy.site.session.setPingsSave(true);

// Run your scraper
for (let i = 0; i < 100; i++) {
  await piggy.site.navigate(`https://example.com/page/${i}`);
  await piggy.site.wait(1000);
}

// Analyze ping logs
const paths = await piggy.site.session.paths();
const pings = JSON.parse(readFileSync(paths.pings, "utf-8"));

const failed = pings.filter(p => p.status === "failed");
const avgLatency = pings
  .filter(p => p.status === "success")
  .reduce((sum, p) => sum + p.latencyMs, 0) / pings.filter(p => p.status === "success").length;

console.log(`Pings: ${pings.length} total, ${failed.length} failed`);
console.log(`Average latency: ${avgLatency}ms`);
```

### Example 4: Hot Reload Cookies

```ts
// While scraper is running, edit cookies.json manually
// Then reload without restart
await piggy.site.session.reload();
console.log("Cookies reloaded from disk");

// Verify new cookies are applied
const cookies = await piggy.site.cookies.list();
console.log(`Now have ${cookies.length} cookies`);
```

### Example 5: Multi-Account Session Management

```ts
interface AccountSession {
  username: string;
  session: any;
}

async function saveAccountSession(site: any, username: string) {
  const session = await site.session.export();
  const sessionData = {
    username,
    session,
    savedAt: Date.now()
  };
  writeFileSync(`./sessions/${username}.json`, JSON.stringify(sessionData, null, 2));
  console.log(`💾 Saved session for ${username}`);
}

async function loadAccountSession(site: any, username: string): Promise<boolean> {
  const sessionFile = `./sessions/${username}.json`;
  
  if (!existsSync(sessionFile)) {
    return false;
  }
  
  const sessionData = JSON.parse(readFileSync(sessionFile, "utf8"));
  await site.session.import(sessionData.session);
  
  // Verify session
  await site.navigate("https://example.com/account");
  const isLoggedIn = await site.evaluate(() => {
    return document.querySelector(".logout-btn") !== null;
  });
  
  if (!isLoggedIn) {
    console.log(`⚠️ Session for ${username} expired`);
    return false;
  }
  
  console.log(`✅ Loaded session for ${username}`);
  return true;
}

// Usage with multiple accounts
await piggy.launch({ mode: "process" });

await piggy.register("account1", "https://example.com");
if (!await loadAccountSession(piggy.account1, "user1")) {
  // Perform login for user1
  await piggy.account1.navigate("https://example.com/login");
  await piggy.account1.type("#email", "user1@example.com");
  await piggy.account1.type("#password", "password1");
  await piggy.account1.click("#login");
  await piggy.account1.waitForNavigation();
  await saveAccountSession(piggy.account1, "user1");
}

await piggy.register("account2", "https://example.com");
if (!await loadAccountSession(piggy.account2, "user2")) {
  // Login for user2
  await piggy.account2.navigate("https://example.com/login");
  await piggy.account2.type("#email", "user2@example.com");
  await piggy.account2.type("#password", "password2");
  await piggy.account2.click("#login");
  await piggy.account2.waitForNavigation();
  await saveAccountSession(piggy.account2, "user2");
}
```

### Example 6: Auto-Save on Changes

```ts
let sessionSaveTimer: Timer | null = null;

async function autoSaveSession(site: any, sessionFile: string) {
  if (sessionSaveTimer) clearTimeout(sessionSaveTimer);
  
  sessionSaveTimer = setTimeout(async () => {
    const session = await site.session.export();
    writeFileSync(sessionFile, JSON.stringify(session, null, 2));
    console.log("💾 Auto-saved session");
  }, 1000);
}

// Save after important actions
await piggy.site.navigate("https://example.com/dashboard");
await autoSaveSession(piggy.site, SESSION_FILE);

await piggy.site.click("#update-profile");
await piggy.site.waitForResponse("*/api/profile*");
await autoSaveSession(piggy.site, SESSION_FILE);
```

### Example 7: Session Export with Capture

```ts
async function captureAndSaveSession(site: any, sessionName: string) {
  // Start capture
  await site.capture.start();
  
  // Perform login
  await site.navigate("https://example.com/login");
  await site.type("#email", process.env.EMAIL);
  await site.type("#password", process.env.PASSWORD);
  await site.click("#login-btn");
  await site.waitForNavigation();
  
  await site.capture.stop();
  
  // Get captured requests
  const requests = await site.capture.requests();
  const loginResponse = requests.find(r => r.url.includes("/api/login"));
  
  // Export session
  const session = await site.session.export();
  
  const fullSession = {
    session,
    loginResponse: loginResponse?.resBody ? JSON.parse(loginResponse.resBody) : null,
    capturedAt: Date.now()
  };
  
  writeFileSync(`./sessions/${sessionName}.json`, JSON.stringify(fullSession, null, 2));
  
  return fullSession;
}
```

---

## File Format Specifications

### `ws.json` — WebSocket Frame

```ts
interface WsFrame {
  id: string;                    // Unique frame ID
  direction: "sent" | "received";
  type: "text" | "binary" | "open" | "close";
  data: string;                  // For text: the message, for binary: base64
  timestamp: number;
  size: number;
}
```

### `pings.json` — Ping Log

```ts
interface PingEntry {
  timestamp: number;
  latencyMs: number | null;
  status: "success" | "failed";
  error?: string;
}
```

---

## API Reference

### Session Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `session.export()` | — | `Promise<ExportedSession>` | Export current session |
| `session.import(data)` | `data: ExportedSession` | `Promise<void>` | Import saved session |
| `session.reload()` | — | `Promise<void>` | Hot reload cookies/profile |
| `session.paths()` | — | `Promise<SessionPaths>` | Get all file paths |
| `session.cookiesPath()` | — | `Promise<string>` | Get cookies.json path |
| `session.profilePath()` | — | `Promise<string>` | Get profile.json path |
| `session.wsPath()` | — | `Promise<string>` | Get ws.json path |
| `session.pingsPath()` | — | `Promise<string>` | Get pings.json path |
| `session.setWsSave(enabled)` | `enabled: boolean` | `Promise<void>` | Enable/disable WebSocket saving |
| `session.setPingsSave(enabled)` | `enabled: boolean` | `Promise<void>` | Enable/disable ping saving |

---

## Type Definitions

```ts
interface ExportedSession {
  url: string;
  cookies: Cookie[];
  storage: {
    localStorage: Array<{ key: string; value: string; origin: string }>;
    sessionStorage: Array<{ key: string; value: string; origin: string }>;
  };
}

interface SessionPaths {
  workDir: string;
  cookies: string;
  profile: string;
  ws: string;
  pings: string;
}

interface WsFrame {
  id: string;
  direction: "sent" | "received";
  type: "text" | "binary" | "open" | "close";
  data: string;
  timestamp: number;
  size: number;
}

interface PingEntry {
  timestamp: number;
  latencyMs: number | null;
  status: "success" | "failed";
  error?: string;
}
```

---

## Next Steps

- [Cookies API](../cookies) — Manage cookies directly
- [Capture API](../capture) — Capture network traffic
- [Identity & Profile](../identity-profile) — Understand fingerprint files

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*