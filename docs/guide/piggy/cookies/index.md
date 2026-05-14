# 🍪 Cookies API — Manage Browser Cookies

Set, get, delete, and list cookies. Essential for authentication, session management, and preserving login state across scraper runs.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

Cookies API gives you full control over browser cookies:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `cookies.set()` | Create/update a cookie | Set auth token, session ID |
| `cookies.get()` | Get a specific cookie | Retrieve session value |
| `cookies.delete()` | Remove a cookie | Logout, clear tracking |
| `cookies.list()` | Get all cookies | Debug, export session |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

// Set a cookie
await piggy.site.cookies.set("session_id", "abc123", ".example.com");

// Get a cookie
const session = await piggy.site.cookies.get("session_id");
console.log(session.value); // "abc123"

// List all cookies
const allCookies = await piggy.site.cookies.list();

// Delete a cookie
await piggy.site.cookies.delete("session_id");
```

---

## Cookie Object Structure

```ts
interface Cookie {
  name: string;           // Cookie name
  value: string;          // Cookie value
  domain: string;         // Domain (e.g., ".example.com" for subdomains)
  path: string;           // URL path (default: "/")
  httpOnly: boolean;      // Not accessible via JavaScript
  secure: boolean;        // HTTPS only
  sameSite?: "Strict" | "Lax" | "None";  // SameSite policy
  expires?: number;       // Unix timestamp (seconds), undefined = session cookie
}
```

---

## Set Cookie

### `cookies.set(name, value, domain, path?)`

```ts
// Basic session cookie
await piggy.site.cookies.set("session_id", "abc123", ".example.com");

// With specific path
await piggy.site.cookies.set("user_pref", "dark_mode", ".example.com", "/settings");

// With all options (using full object — see SessionClient)
await piggy.site.session.setCookie({
  name: "auth_token",
  value: "xyz789",
  domain: ".example.com",
  path: "/",
  httpOnly: true,
  secure: true,
  expiry: Math.floor(Date.now() / 1000) + 86400  // 24 hours
});
```

### Cookie Security Flags

| Flag | Description | When to Use |
|------|-------------|-------------|
| `httpOnly` | Not accessible via JavaScript | Auth tokens, session IDs |
| `secure` | HTTPS only | Production sites |
| `sameSite: "Strict"` | Same site only | CSRF protection |
| `sameSite: "Lax"` | Same site, plus top-level navigation | Most cases |
| `sameSite: "None"` | Cross-site (requires `secure`) | Third-party contexts |

---

## Get Cookie

### `cookies.get(name)`

```ts
const cookie = await piggy.site.cookies.get("session_id");

if (cookie) {
  console.log(`Session: ${cookie.value}`);
  console.log(`Domain: ${cookie.domain}`);
  console.log(`Expires: ${cookie.expires || "Session"}`);
} else {
  console.log("Cookie not found");
}
```

---

## Delete Cookie

### `cookies.delete(name)`

```ts
await piggy.site.cookies.delete("session_id");

// Delete multiple cookies
const cookies = await piggy.site.cookies.list();
for (const cookie of cookies) {
  if (cookie.name.startsWith("_ga")) {
    await piggy.site.cookies.delete(cookie.name);
  }
}
```

---

## List All Cookies

### `cookies.list()`

```ts
const cookies = await piggy.site.cookies.list();

for (const cookie of cookies) {
  console.log(`${cookie.name}=${cookie.value}`);
  console.log(`  Domain: ${cookie.domain}`);
  console.log(`  Path: ${cookie.path}`);
  console.log(`  HttpOnly: ${cookie.httpOnly}`);
  console.log(`  Secure: ${cookie.secure}`);
}
```

---

## Real-World Examples

### Example 1: Save and Restore Cookies

```ts
import { writeFileSync, readFileSync, existsSync } from "fs";

const COOKIE_FILE = "./cookies.json";

// Save cookies to file
async function saveCookies(site: any) {
  const cookies = await site.cookies.list();
  writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
  console.log(`💾 Saved ${cookies.length} cookies`);
}

// Load cookies from file
async function loadCookies(site: any) {
  if (!existsSync(COOKIE_FILE)) return false;
  
  const cookies = JSON.parse(readFileSync(COOKIE_FILE, "utf8"));
  
  for (const cookie of cookies) {
    await site.cookies.set(cookie.name, cookie.value, cookie.domain, cookie.path);
  }
  
  console.log(`🍪 Loaded ${cookies.length} cookies`);
  return true;
}

// Usage
await piggy.launch();
await piggy.register("site", "https://example.com");

// Load previous cookies
await loadCookies(piggy.site);

// Navigate (should be logged in)
await piggy.site.navigate();

// Check if logged in
const isLoggedIn = await piggy.site.evaluate(() => {
  return document.querySelector(".user-menu") !== null;
});

if (!isLoggedIn) {
  // Perform login
  await piggy.site.navigate("https://example.com/login");
  await piggy.site.type("#email", "user@example.com");
  await piggy.site.type("#password", "password");
  await piggy.site.click("#login-btn");
  await piggy.site.waitForNavigation();
  
  // Save new cookies
  await saveCookies(piggy.site);
}
```

### Example 2: Transfer Cookies Between Sites

```ts
// Copy cookies from one site to another
async function copyCookies(from: any, to: any, domain?: string) {
  const cookies = await from.cookies.list();
  
  for (const cookie of cookies) {
    const targetDomain = domain || cookie.domain;
    await to.cookies.set(cookie.name, cookie.value, targetDomain, cookie.path);
  }
  
  console.log(`📋 Copied ${cookies.length} cookies`);
}

// Usage
await piggy.launch({ mode: "process" });

await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");

// Login on site1
await piggy.site1.navigate("https://example.com/login");
await piggy.site1.type("#email", "user@example.com");
await piggy.site1.type("#password", "password");
await piggy.site1.click("#login-btn");
await piggy.site1.waitForNavigation();

// Copy cookies to site2
await copyCookies(piggy.site1, piggy.site2, ".example.org");

// site2 should now be authenticated
await piggy.site2.navigate("https://example.org/dashboard");
```

### Example 3: Clear Tracking Cookies

```ts
async function clearTrackingCookies(site: any) {
  const cookies = await site.cookies.list();
  const trackingDomains = [
    "google-analytics.com",
    "doubleclick.net",
    "facebook.com",
    "amazon-adsystem.com"
  ];
  
  let cleared = 0;
  
  for (const cookie of cookies) {
    if (trackingDomains.some(domain => cookie.domain.includes(domain))) {
      await site.cookies.delete(cookie.name);
      cleared++;
    }
  }
  
  console.log(`🧹 Cleared ${cleared} tracking cookies`);
}
```

### Example 4: Session Validation with Refresh

```ts
async function ensureValidSession(site: any, refreshToken: string) {
  // Check if session exists and is valid
  const sessionCookie = await site.cookies.get("session_id");
  
  if (!sessionCookie) {
    console.log("No session, refreshing...");
    return await refreshSession(site, refreshToken);
  }
  
  // Verify by making a request
  await site.navigate("https://api.example.com/me");
  const response = await site.capture.requests();
  const meRequest = response.find(r => r.url.includes("/api/me"));
  
  if (meRequest?.status !== "200") {
    console.log("Session expired, refreshing...");
    return await refreshSession(site, refreshToken);
  }
  
  console.log("Session valid");
  return true;
}

async function refreshSession(site: any, refreshToken: string) {
  const response = await fetch("https://api.example.com/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.sessionId) {
    await site.cookies.set("session_id", data.sessionId, ".example.com", "/");
    console.log("🔄 Session refreshed");
    return true;
  }
  
  return false;
}
```

### Example 5: Export Cookies for External Tools

```ts
// Export as Netscape format (for curl, wget)
async function exportNetscapeCookies(site: any): Promise<string> {
  const cookies = await site.cookies.list();
  const lines = [
    "# Netscape HTTP Cookie File",
    "# https://curl.se/docs/http-cookies.html"
  ];
  
  for (const cookie of cookies) {
    const domain = cookie.domain.startsWith(".") ? cookie.domain : `.${cookie.domain}`;
    const secure = cookie.secure ? "TRUE" : "FALSE";
    const expires = cookie.expires || "0";
    const path = cookie.path || "/";
    
    lines.push(`${domain}\tTRUE\t${path}\t${secure}\t${expires}\t${cookie.name}\t${cookie.value}`);
  }
  
  return lines.join("\n");
}

// Export as JSON for other automation tools
async function exportForPlaywright(site: any) {
  const cookies = await site.cookies.list();
  
  return cookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires ? cookie.expires * 1000 : -1,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite || "Lax"
  }));
}

// Usage
const netscape = await exportNetscapeCookies(piggy.site);
console.log(netscape);

const playwrightCookies = await exportForPlaywright(piggy.site);
console.log(playwrightCookies);
```

### Example 6: Cookie-Based Authentication Flow

```ts
async function authenticateWithCookies(site: any, credentials: any) {
  // Clear existing cookies first
  const existingCookies = await site.cookies.list();
  for (const cookie of existingCookies) {
    await site.cookies.delete(cookie.name);
  }
  
  // Navigate to login page
  await site.navigate("https://example.com/login");
  
  // Fill and submit form
  await site.type("#email", credentials.email);
  await site.type("#password", credentials.password);
  await site.click("#remember-me");
  await site.click("#login-btn");
  await site.waitForNavigation();
  
  // Get session cookie
  const sessionCookie = await site.cookies.get("session_id");
  
  if (!sessionCookie) {
    throw new Error("Login failed - no session cookie set");
  }
  
  console.log(`✅ Authenticated with session: ${sessionCookie.value}`);
  
  return {
    sessionId: sessionCookie.value,
    expires: sessionCookie.expires,
    domain: sessionCookie.domain
  };
}

// Usage
const auth = await authenticateWithCookies(piggy.site, {
  email: "user@example.com",
  password: "password123"
});

console.log("Session:", auth);
```

---

## Cookie File (cookies.json)

Piggy automatically saves cookies to `cookies.json` in your working directory.

```json
[
  {
    "name": "session_id",
    "value": "abc123def456",
    "domain": ".example.com",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "Lax",
    "expires": 1735689600
  },
  {
    "name": "user_pref",
    "value": "dark_mode",
    "domain": "example.com",
    "path": "/settings",
    "httpOnly": false,
    "secure": false,
    "expires": null
  }
]
```

### Hot Reload

Edit `cookies.json` while Piggy is running, then reload:

```bash
# Edit the file
nano cookies.json

# Reload from your code
await piggy.site.session.reload();
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `cookies.set(name, value, domain, path?)` | `name, value, domain, path?: string` | `Promise<void>` | Set a cookie |
| `cookies.get(name)` | `name: string` | `Promise<Cookie \| null>` | Get a cookie |
| `cookies.delete(name)` | `name: string` | `Promise<void>` | Delete a cookie |
| `cookies.list()` | — | `Promise<Cookie[]>` | List all cookies |

### Cookie Interface

```ts
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;   // Unix timestamp (seconds)
}
```

---

## Security Best Practices

```ts
// ⚠️ Never log cookie values in production
console.log("Cookie:", cookie.value);  // DON'T DO THIS

// ✅ Use for debugging only
if (process.env.DEBUG) {
  console.log("Cookie name:", cookie.name);
}

// ⚠️ Session cookies are sensitive
// Store them securely, don't commit to git

// ✅ Clear sensitive cookies when done
await clearAllCookies(piggy.site);

// ✅ Use httpOnly and secure flags for auth cookies
await piggy.site.session.setCookie({
  name: "auth_token",
  value: token,
  domain: ".example.com",
  httpOnly: true,
  secure: true
});
```

---

## Type Definitions

```ts
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;
}

interface CookieSetOptions {
  name: string;
  value: string;
  domain: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  expiry?: number;
}
```

---

## Next Steps

- [Session API](./session) — Export/import full session state
- [Capture API](./capture) — Capture cookies from network traffic
- [Proxy API](./proxy) — Rotate IPs for different cookie contexts

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*