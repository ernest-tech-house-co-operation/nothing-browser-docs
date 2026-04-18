# 💾 Session Persistence

Save and restore browser state including cookies, localStorage, sessionStorage, and navigation history. Perfect for maintaining logged-in sessions across script runs.

---

## Overview

Session persistence captures everything needed to restore a browser to a previous state:

| What's Saved | Description |
|--------------|-------------|
| **Cookies** | All cookies with domain, path, flags |
| **localStorage** | Key-value data per origin |
| **sessionStorage** | Key-value data per origin |
| **URL** | Current page URL |

---

## Basic Usage

```ts
import piggy from "nothing-browser";
import { writeFileSync, readFileSync, existsSync } from "fs";

const SESSION_FILE = "./session.json";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Load previous session if exists
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.site.session.import(saved);
  console.log("✅ Session restored");
}

// Use the site (already logged in if session had cookies)
await piggy.site.navigate();
const user = await piggy.site.fetchText(".user-name");
console.log("Logged in as:", user);

// Save session before exit
process.on("SIGINT", async () => {
  const session = await piggy.site.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("💾 Session saved");
  await piggy.close();
  process.exit(0);
});
```

---

## Export Session

```ts
// Export current session state
const session = await piggy.site.session.export();

console.log("Cookies:", session.cookies.length);
console.log("localStorage items:", session.storage.localStorage.length);
console.log("sessionStorage items:", session.storage.sessionStorage.length);
console.log("Current URL:", session.url);

// Session object structure
{
  cookies: [
    {
      name: "session_id",
      value: "abc123...",
      domain: ".example.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: 1735689600  // Unix timestamp
    }
  ],
  storage: {
    localStorage: [
      { key: "theme", value: "dark", origin: "https://example.com" }
    ],
    sessionStorage: [
      { key: "cart", value: '{"items":2}', origin: "https://example.com" }
    ]
  },
  url: "https://example.com/dashboard"
}
```

---

## Import Session

```ts
// Import saved session
await piggy.site.session.import(sessionData);

// After import, cookies and storage are restored
await piggy.site.navigate();  // Will be logged in if cookies were valid
```

---

## Real-World Examples

### 1. Persistent Login Session

```ts
import { existsSync, readFileSync, writeFileSync } from "fs";

const SESSION_FILE = "./amazon-session.json";

await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("amazon", "https://www.amazon.com");

// Try to restore previous session
let hasValidSession = false;

if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.amazon.session.import(saved);
  
  // Verify session still works
  await piggy.amazon.navigate();
  await piggy.amazon.wait(2000);
  
  const isLoggedIn = await piggy.amazon.evaluate(() => {
    return document.querySelector("#nav-link-accountList")?.textContent?.includes("Hello");
  });
  
  if (isLoggedIn) {
    console.log("✅ Existing session valid");
    hasValidSession = true;
  }
}

// If no valid session, log in
if (!hasValidSession) {
  console.log("🔐 Need to log in...");
  await piggy.amazon.navigate("https://www.amazon.com/ap/signin");
  await piggy.amazon.type("#ap_email", process.env.AMAZON_EMAIL);
  await piggy.amazon.click("#continue");
  await piggy.amazon.wait(1000);
  await piggy.amazon.type("#ap_password", process.env.AMAZON_PASSWORD);
  await piggy.amazon.click("#signInSubmit");
  await piggy.amazon.waitForNavigation();
  
  // Save the new session
  const session = await piggy.amazon.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("💾 New session saved");
}

// Now scrape with logged-in session
const orders = await piggy.amazon.evaluate(() => {
  return Array.from(document.querySelectorAll(".order")).map(el => ({
    orderId: el.querySelector(".order-id")?.textContent,
    date: el.querySelector(".order-date")?.textContent,
    total: el.querySelector(".order-total")?.textContent
  }));
});

console.log("Orders:", orders);
```

### 2. Multi-Account Session Management

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
  
  // Check if session expired
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

// Usage
await piggy.launch({ mode: "process" }); // Each account gets its own process

// Account 1
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

// Account 2
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

// Both accounts are now logged in
const data1 = await piggy.account1.evaluate(() => ({ ... }));
const data2 = await piggy.account2.evaluate(() => ({ ... }));
```

### 3. Session with Request Capture

```ts
async function captureAndSaveSession(site: any, sessionName: string) {
  // Start capture to record all requests during login
  await site.capture.start();
  
  // Perform login
  await site.navigate("https://example.com/login");
  await site.type("#email", process.env.EMAIL);
  await site.type("#password", process.env.PASSWORD);
  await site.click("#login-btn");
  await site.waitForNavigation();
  
  // Wait for dashboard to load
  await site.waitForSelector(".dashboard");
  
  // Stop capture
  await site.capture.stop();
  
  // Get all requests
  const requests = await site.capture.requests();
  
  // Find auth token from login response
  const loginResponse = requests.find(r => r.url.includes("/api/login"));
  let authToken = null;
  
  if (loginResponse?.responseBody) {
    const data = JSON.parse(loginResponse.responseBody);
    authToken = data.token;
  }
  
  // Export session (cookies + storage)
  const session = await site.session.export();
  
  // Save everything
  const fullSession = {
    session,
    authToken,
    loginRequests: requests,
    capturedAt: Date.now()
  };
  
  writeFileSync(`./sessions/${sessionName}.json`, JSON.stringify(fullSession, null, 2));
  
  return fullSession;
}

// Load and verify session
async function loadAndVerifySession(site: any, sessionName: string): Promise<boolean> {
  const sessionFile = `./sessions/${sessionName}.json`;
  
  if (!existsSync(sessionFile)) {
    return false;
  }
  
  const fullSession = JSON.parse(readFileSync(sessionFile, "utf8"));
  
  // Import session
  await site.session.import(fullSession.session);
  
  // Verify by making an API call
  await site.navigate("https://example.com/api/me");
  const response = await site.capture.requests();
  const meRequest = response.find(r => r.url.includes("/api/me"));
  
  if (meRequest?.status === 200) {
    console.log("✅ Session valid");
    return true;
  }
  
  console.log("❌ Session expired");
  return false;
}
```

### 4. Auto-Save Session on Changes

```ts
let sessionSaveTimer: Timer | null = null;

async function autoSaveSession(site: any, sessionFile: string) {
  // Debounce saves to avoid too many writes
  if (sessionSaveTimer) clearTimeout(sessionSaveTimer);
  
  sessionSaveTimer = setTimeout(async () => {
    const session = await site.session.export();
    writeFileSync(sessionFile, JSON.stringify(session, null, 2));
    console.log("💾 Auto-saved session");
  }, 1000);
}

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Load existing session
const SESSION_FILE = "./app-session.json";
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.app.session.import(saved);
  console.log("✅ Session loaded");
}

// Save session after important actions
await piggy.app.navigate("https://example.com/dashboard");
await autoSaveSession(piggy.app, SESSION_FILE);

await piggy.app.click("#update-profile");
await piggy.app.waitForResponse("*/api/profile*");
await autoSaveSession(piggy.app, SESSION_FILE);

await piggy.app.click("#add-to-cart");
await autoSaveSession(piggy.app, SESSION_FILE);

// Save on exit
process.on("SIGINT", async () => {
  await autoSaveSession(piggy.app, SESSION_FILE);
  await piggy.close();
  process.exit(0);
});
```

---

## Session File Structure

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123def456",
      "domain": ".example.com",
      "path": "/",
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax",
      "expires": 1735689600
    }
  ],
  "storage": {
    "localStorage": [
      {
        "key": "user_preferences",
        "value": "{\"theme\":\"dark\"}",
        "origin": "https://example.com"
      }
    ],
    "sessionStorage": []
  },
  "url": "https://example.com/dashboard"
}
```

---

## Session Security Notes

```ts
// ⚠️ Don't commit session files to git
// Add to .gitignore:
//   *.session.json
//   sessions/

// ⚠️ Session files contain sensitive data
// Consider encrypting before saving:

import crypto from "crypto";

function encryptSession(session: any, password: string): string {
  const cipher = crypto.createCipher("aes-256-gcm", password);
  let encrypted = cipher.update(JSON.stringify(session), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decryptSession(encrypted: string, password: string): any {
  const decipher = crypto.createDecipher("aes-256-gcm", password);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

// Save encrypted session
const session = await piggy.site.session.export();
const encrypted = encryptSession(session, process.env.SESSION_PASSWORD);
writeFileSync("./session.enc", encrypted);

// Load encrypted session
const encryptedData = readFileSync("./session.enc", "utf8");
const session = decryptSession(encryptedData, process.env.SESSION_PASSWORD);
await piggy.site.session.import(session);
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `session.export()` | Export current session (cookies + storage + URL) |
| `session.import(data)` | Import saved session |

### Exported Session Structure

```ts
interface ExportedSession {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    expires?: number;
  }>;
  storage: {
    localStorage: Array<{
      key: string;
      value: string;
      origin: string;
    }>;
    sessionStorage: Array<{
      key: string;
      value: string;
      origin: string;
    }>;
  };
  url: string;
}
```

---

## Next Steps

- [Cookie Management](./cookies) — Manage cookies directly
- [Network Capture](./network-capture) — Capture requests during session
- [Built-in API Server](./api-server) — Turn session data into API

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
