# 🍪 Cookies Hot Reload — Edit Cookies While Browser Runs

Edit `cookies.json` while Piggy is running — changes apply immediately without restart. Perfect for session rotation, testing different auth states, or debugging cookie-related issues.

---

## Overview

Piggy saves cookies to `cookies.json` in your working directory. Unlike traditional browsers that require restart to load new cookies, Piggy supports **hot reload** — edit the file and call `sessionReload()` to apply changes instantly.

| Feature | Traditional Browser | Piggy |
|---------|--------------------|-------|
| Cookies persist across restarts | ✅ Yes | ✅ Yes |
| Edit cookies while browser runs | ❌ No (need restart) | ✅ Yes (hot reload) |
| Drop new cookie file | ❌ No | ✅ Yes |
| Programmatic cookie updates | ✅ Via API | ✅ Via API + file |

> ⚠️ **Version Required:** Binary v0.1.12+ | Library v0.0.18+

---

## Quick Start

```typescript
import piggy from "nothing-browser";
import { writeFileSync, readFileSync } from "fs";

await piggy.connect({
  host: "http://localhost:2005",
  key: "peaseernest..."
});

// Get cookies file path
const cookiesPath = await piggy.sessionCookiesPath();
console.log("Cookies file:", cookiesPath);
// "/home/user/my-scraper/cookies.json"

// Read current cookies
const currentCookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));
console.log(`Loaded ${currentCookies.length} cookies`);

// Add a new cookie manually
const newCookies = [
  ...currentCookies,
  {
    name: "session_token",
    value: "abc123def456",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true,
    expires: Math.floor(Date.now() / 1000) + 86400  // 24 hours
  }
];
writeFileSync(cookiesPath, JSON.stringify(newCookies, null, 2));

// Hot reload — applies without restart!
await piggy.sessionReload();
console.log("✅ New cookie loaded, browser using it now");
```

---

## `cookies.json` File Format

```json
[
  {
    "name": "session_id",
    "value": "abc123def456",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true,
    "sameSite": "Lax",
    "expires": 1735689600
  },
  {
    "name": "user_pref",
    "value": "dark_mode",
    "domain": "example.com",
    "path": "/settings",
    "secure": false,
    "httpOnly": false,
    "expires": null
  }
]
```

### Cookie Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Cookie name |
| `value` | string | ✅ Yes | Cookie value |
| `domain` | string | ✅ Yes | Domain (e.g., `.example.com` for subdomains) |
| `path` | string | ✅ Yes | URL path (default: "/") |
| `secure` | boolean | ❌ No | HTTPS only |
| `httpOnly` | boolean | ❌ No | Not accessible via JavaScript |
| `sameSite` | string | ❌ No | `"Strict"`, `"Lax"`, or `"None"` |
| `expires` | number | ❌ No | Unix timestamp (seconds). `null` or omitted = session cookie |

---

## Hot Reload Methods

### `sessionReload()` — Reload cookies and profile

```typescript
// After editing cookies.json or profile.json
await piggy.sessionReload();

// Both files are reloaded simultaneously
```

### `sessionCookiesPath()` — Get cookies file path

```typescript
const cookiesPath = await piggy.sessionCookiesPath();
// "/home/user/my-scraper/cookies.json"
```

### `sessionPaths()` — Get all file paths

```typescript
const paths = await piggy.sessionPaths();
console.log(paths.cookies);   // cookies.json path
console.log(paths.profile);   // profile.json path
```

---

## Real-World Examples

### 1. Session Rotation Without Restart

```typescript
import { readFileSync, writeFileSync } from "fs";

const SESSIONS = [
  { name: "user1", token: "token_abc123" },
  { name: "user2", token: "token_def456" },
  { name: "user3", token: "token_ghi789" }
];

const cookiesPath = await piggy.sessionCookiesPath();

for (const session of SESSIONS) {
  console.log(`🔄 Switching to: ${session.name}`);
  
  // Read current cookies
  let cookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));
  
  // Update session cookie
  const sessionCookie = cookies.find(c => c.name === "session_token");
  if (sessionCookie) {
    sessionCookie.value = session.token;
  } else {
    cookies.push({
      name: "session_token",
      value: session.token,
      domain: ".example.com",
      path: "/"
    });
  }
  
  // Write and reload
  writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  await piggy.sessionReload();
  
  // Now browser is logged in as this user
  await piggy.site.navigate("https://example.com/dashboard");
  const userName = await piggy.site.fetchText(".user-name");
  console.log(`Logged in as: ${userName}`);
  
  await piggy.site.wait(2000);
}
```

### 2. Add Authentication Cookie Mid-Scrape

```typescript
// Start scraping without auth
await piggy.register("api", "https://api.example.com");
await piggy.api.navigate("https://api.example.com/public-data");
const publicData = await piggy.api.evaluate(() => ({ ... }));

// Later, we get auth token from somewhere
const authToken = await getAuthToken(); // From database, another service, etc.

// Add auth cookie without restarting
const cookiesPath = await piggy.sessionCookiesPath();
let cookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));

cookies.push({
  name: "auth_token",
  value: authToken,
  domain: ".api.example.com",
  path: "/",
  secure: true,
  httpOnly: true
});

writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
await piggy.sessionReload();

// Now access authenticated endpoints
await piggy.api.navigate("https://api.example.com/private-data");
const privateData = await piggy.api.evaluate(() => ({ ... }));
```

### 3. Bulk Cookie Import from Another Browser

```typescript
// Export cookies from Chrome (using browser extension or devtools)
// Save as chrome-cookies.json

import { readFileSync, writeFileSync } from "fs";

const chromeCookies = JSON.parse(readFileSync("./chrome-cookies.json", "utf-8"));
const cookiesPath = await piggy.sessionCookiesPath();

// Convert Chrome format to Piggy format
const piggyCookies = chromeCookies.map(c => ({
  name: c.name,
  value: c.value,
  domain: c.domain,
  path: c.path || "/",
  secure: c.secure || false,
  httpOnly: c.httpOnly || false,
  sameSite: c.sameSite || "Lax",
  expires: c.expirationDate || null
}));

// Write and reload
writeFileSync(cookiesPath, JSON.stringify(piggyCookies, null, 2));
await piggy.sessionReload();

console.log(`✅ Imported ${piggyCookies.length} cookies from Chrome`);
```

### 4. Clear All Cookies via File

```typescript
const cookiesPath = await piggy.sessionCookiesPath();

// Write empty array
writeFileSync(cookiesPath, JSON.stringify([], null, 2));
await piggy.sessionReload();

console.log("🍪 All cookies cleared");
```

### 5. Backup and Restore Cookies

```typescript
import { readFileSync, writeFileSync, existsSync } from "fs";

const cookiesPath = await piggy.sessionCookiesPath();

// Backup current cookies
const backupPath = `./cookies-backup-${Date.now()}.json`;
const currentCookies = readFileSync(cookiesPath, "utf-8");
writeFileSync(backupPath, currentCookies);
console.log(`💾 Backed up to: ${backupPath}`);

// ... do something that changes cookies ...

// Restore from backup
if (existsSync(backupPath)) {
  const backupCookies = readFileSync(backupPath, "utf-8");
  writeFileSync(cookiesPath, backupCookies);
  await piggy.sessionReload();
  console.log("🔄 Cookies restored from backup");
}
```

### 6. Live Cookie Monitor

```typescript
import { watch } from "fs";

const cookiesPath = await piggy.sessionCookiesPath();

// Watch for external changes to cookies.json
watch(cookiesPath, async (eventType) => {
  if (eventType === "change") {
    console.log("📝 cookies.json changed externally");
    
    // Reload automatically
    await piggy.sessionReload();
    
    const newCookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));
    console.log(`🍪 Now have ${newCookies.length} cookies`);
  }
});

console.log("👀 Monitoring cookies.json for changes...");
```

### 7. Session Fix for Expired Cookies

```typescript
async function ensureValidSession() {
  const cookiesPath = await piggy.sessionCookiesPath();
  let cookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));
  
  const sessionCookie = cookies.find(c => c.name === "session_id");
  
  // Check if expired
  if (sessionCookie?.expires && sessionCookie.expires < Date.now() / 1000) {
    console.log("⚠️ Session expired! Refreshing...");
    
    // Get new session token (e.g., from refresh endpoint)
    const newToken = await refreshAuthToken();
    
    // Update cookie
    sessionCookie.value = newToken;
    sessionCookie.expires = Math.floor(Date.now() / 1000) + 86400; // 24 hours
    
    writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    await piggy.sessionReload();
    
    console.log("✅ Session refreshed");
    return true;
  }
  
  return false;
}

// Check before each critical operation
await ensureValidSession();
await piggy.site.navigate("https://example.com/dashboard");
```

---

## Automatic Cookie Persistence

Piggy automatically saves cookies to `cookies.json` when:

1. **Cookies are set** via `cookie.set()` API
2. **Cookies are deleted** via `cookie.delete()` API
3. **Browser sets cookies** normally (from website responses)

You don't need to manually write the file for normal browsing — Piggy handles it.

```typescript
// These automatically update cookies.json
await piggy.site.cookies.set("session", "abc123", ".example.com");
await piggy.site.cookies.delete("tracking_id");

// No need to call sessionReload() — already saved!
```

You only need manual `sessionReload()` when:
- You edit `cookies.json` directly with an external editor
- You programmatically write to the file (as in examples above)
- You want to reload `profile.json` changes

---

## File Watcher (Automatic Reload)

Piggy watches `cookies.json` and `profile.json` automatically using `QFileSystemWatcher`.

```typescript
// No code needed — just edit the file and save
// Piggy detects the change and reloads automatically
```

```bash
# Edit cookies.json with any editor
nano cookies.json

# Save — Piggy reloads within milliseconds
# No sessionReload() call needed!
```

**File watcher behavior:**

| Action | Piggy Response |
|--------|----------------|
| Save `cookies.json` | Auto-reloads cookies |
| Save `profile.json` | Auto-reloads profile |
| Delete file | Ignores (no crash) |
| Malformed JSON | Logs error, keeps previous state |

---

## Cookie Expiration

### Session Cookies (No Expiry)

```json
{
  "name": "session_id",
  "value": "abc123",
  "expires": null
}
```

Session cookies last until the browser closes.

### Persistent Cookies (With Expiry)

```json
{
  "name": "remember_me",
  "value": "xyz789",
  "expires": 1735689600  // Unix timestamp (seconds)
}
```

### Set Expiration in Code

```typescript
// 7 days from now
const sevenDays = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

await piggy.site.cookies.set("remember_token", "xyz789", ".example.com", "/", {
  expires: sevenDays
});
```

---

## Security Considerations

### ⚠️ Don't Commit cookies.json to Git

```bash
# .gitignore
cookies.json
*.piggy
ws.json
pings.json
```

### ⚠️ Cookies Contain Sensitive Data

```json
{
  "name": "session_token",
  "value": "secret_auth_token_here",  // ← sensitive!
  "domain": ".bank.com"
}
```

**Best practices:**
- Never share `cookies.json`
- Use environment variables for initial auth
- Delete sensitive cookies when done

### Encrypt Cookies File (Advanced)

```typescript
import crypto from "crypto";
import { readFileSync, writeFileSync } from "fs";

const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY; // 32 bytes

function encryptCookies(cookies: any[], key: Buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(cookies), "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return JSON.stringify({ iv: iv.toString("hex"), authTag: authTag.toString("hex"), data: encrypted.toString("hex") });
}

// Write encrypted
const encrypted = encryptCookies(cookies, ENCRYPTION_KEY);
writeFileSync("./cookies.enc", encrypted);
```

---

## API Reference

### Cookie Methods

| Method | Description |
|--------|-------------|
| `sessionCookiesPath()` | Get path to `cookies.json` |
| `sessionReload()` | Hot reload cookies and profile |
| `sessionPaths()` | Get all file paths |
| `cookies.set()` | Set cookie (auto-saves to file) |
| `cookies.get()` | Get cookie by name |
| `cookies.delete()` | Delete cookie (auto-saves to file) |
| `cookies.list()` | List all cookies |

---

## Troubleshooting

### "Cookies not persisting across restarts"

**Cause:** `cookies.json` not being written

**Fix:**
```typescript
// Ensure you're using persistent profile
const profile = await piggy.sessionProfilePath();
console.log("Profile path:", profile); // Should be in working directory
```

### "sessionReload() not applying changes"

**Cause:** Malformed JSON in cookies.json

**Fix:**
```bash
# Validate JSON
cat cookies.json | jq .

# If invalid, fix or delete (Piggy will create fresh)
rm cookies.json
```

### "Cookies file getting too large"

**Cause:** Too many cookies accumulated

**Fix:**
```typescript
// Clean expired cookies
const cookiesPath = await piggy.sessionCookiesPath();
let cookies = JSON.parse(readFileSync(cookiesPath, "utf-8"));
const now = Date.now() / 1000;

cookies = cookies.filter(c => !c.expires || c.expires > now);
writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
await piggy.sessionReload();
```

### "Cookies from file not appearing in browser"

**Cause:** Domain mismatch

**Fix:** Ensure domain matches exactly:
```json
// ✅ Correct — matches site
{ "domain": ".example.com" }

// ❌ Wrong — won't apply
{ "domain": "example" }
```

---

## Next Steps

- [Identity & Profile](./identity-profile) — Understand fingerprint files
- [Session Persistence](./session-persistence) — Save WebSocket frames and pings
- [Remote Deployment](./remote-deployment) — Run Piggy on a VPS

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*