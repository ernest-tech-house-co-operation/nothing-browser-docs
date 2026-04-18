# 🍪 Cookie Management

Get, set, delete, and list cookies. Perfect for authentication, session management, and debugging.

---

## Overview

Cookies are essential for maintaining sessions, authentication, and user preferences. Piggy provides full control over cookies:

| Operation | Method | Description |
|-----------|--------|-------------|
| **List** | `cookies.list()` | Get all cookies |
| **Get** | `cookies.get(name)` | Get specific cookie by name |
| **Set** | `cookies.set(name, value, domain, path?)` | Create or update cookie |
| **Delete** | `cookies.delete(name)` | Remove specific cookie |

---

## List All Cookies

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// Get all cookies
const cookies = await piggy.site.cookies.list();

for (const cookie of cookies) {
  console.log(`${cookie.name}=${cookie.value}`);
  console.log(`  Domain: ${cookie.domain}`);
  console.log(`  Path: ${cookie.path}`);
  console.log(`  HttpOnly: ${cookie.httpOnly}`);
  console.log(`  Secure: ${cookie.secure}`);
  console.log(`  Expires: ${cookie.expires || 'Session'}`);
}
```

### Cookie Object Structure

```ts
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;  // Unix timestamp, undefined = session cookie
}
```

---

## Get Specific Cookie

```ts
// Get cookie by name
const sessionCookie = await piggy.site.cookies.get("session_id");

if (sessionCookie) {
  console.log("Session ID:", sessionCookie.value);
  console.log("Domain:", sessionCookie.domain);
} else {
  console.log("Cookie not found");
}
```

---

## Set Cookie

```ts
// Set a cookie (required: name, value, domain)
await piggy.site.cookies.set("theme", "dark", ".example.com");

// Set cookie with path
await piggy.site.cookies.set("preference", "dark-mode", ".example.com", "/settings");

// Set authentication cookie
await piggy.site.cookies.set("auth_token", "abc123def456", ".example.com", "/");

// Set secure session cookie
await piggy.site.cookies.set("session", crypto.randomUUID(), ".example.com", "/");
```

---

## Delete Cookie

```ts
// Delete specific cookie
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

## Real-World Examples

### 1. Save and Restore Cookies

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
await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Load previous cookies
await loadCookies(piggy.site);

// Navigate (should be logged in if cookies were valid)
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

await piggy.close();
```

### 2. Transfer Cookies Between Sites

```ts
// Copy cookies from one site to another
async function copyCookies(from: any, to: any, domain?: string) {
  const cookies = await from.cookies.list();
  
  for (const cookie of cookies) {
    // Optionally change domain
    const targetDomain = domain || cookie.domain;
    await to.cookies.set(cookie.name, cookie.value, targetDomain, cookie.path);
  }
  
  console.log(`📋 Copied ${cookies.length} cookies`);
}

// Usage
await piggy.launch({ mode: "process" }); // Separate processes

await piggy.register("site1", "https://example.com");
await piggy.register("site2", "https://example.org");

// Login on site1
await piggy.site1.navigate("https://example.com/login");
await piggy.site1.type("#email", "user@example.com");
await piggy.site1.type("#password", "password");
await piggy.site1.click("#login-btn");
await piggy.site1.waitForNavigation();

// Copy cookies to site2 (same domain structure)
await copyCookies(piggy.site1, piggy.site2, ".example.org");

// site2 should now be authenticated
await piggy.site2.navigate("https://example.org/dashboard");
```

### 3. Clear All Cookies

```ts
async function clearAllCookies(site: any) {
  const cookies = await site.cookies.list();
  
  for (const cookie of cookies) {
    await site.cookies.delete(cookie.name);
  }
  
  console.log(`🧹 Cleared ${cookies.length} cookies`);
}

// Clear tracking cookies
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

### 4. Session Cookie Management

```ts
// Check if session is still valid
async function isSessionValid(site: any): Promise<boolean> {
  const sessionCookie = await site.cookies.get("session_id");
  
  if (!sessionCookie) return false;
  
  // Check if expired
  if (sessionCookie.expires && sessionCookie.expires < Date.now() / 1000) {
    console.log("Session expired");
    return false;
  }
  
  // Verify by making a request
  await site.navigate("https://example.com/api/me");
  const response = await site.capture.requests();
  const meRequest = response.find(r => r.url.includes("/api/me"));
  
  return meRequest?.status === 200;
}

// Refresh session
async function refreshSession(site: any, refreshToken: string) {
  // Use refresh token to get new session
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

// Usage
await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

if (!await isSessionValid(piggy.app)) {
  console.log("Session invalid, refreshing...");
  await refreshSession(piggy.app, process.env.REFRESH_TOKEN);
}

await piggy.app.navigate("https://example.com/dashboard");
```

### 5. Export Cookies for External Tools

```ts
// Export as Netscape format (for wget, curl)
async function exportNetscapeCookies(site: any): Promise<string> {
  const cookies = await site.cookies.list();
  const lines = [
    "# Netscape HTTP Cookie File",
    "# https://curl.se/docs/http-cookies.html"
  ];
  
  for (const cookie of cookies) {
    const domain = cookie.domain.startsWith(".") ? cookie.domain : `.${cookie.domain}`;
    const secure = cookie.secure ? "TRUE" : "FALSE";
    const httpOnly = cookie.httpOnly ? "TRUE" : "FALSE";
    const expires = cookie.expires || "0";
    const path = cookie.path || "/";
    
    lines.push(`${domain}\tTRUE\t${path}\t${secure}\t${expires}\t${cookie.name}\t${cookie.value}`);
  }
  
  return lines.join("\n");
}

// Export as JSON for Puppeteer/Playwright
async function exportForPuppeteer(site: any) {
  const cookies = await site.cookies.list();
  
  return cookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite
  }));
}

// Export as Set-Cookie headers
async function exportAsHeaders(site: any): Promise<string[]> {
  const cookies = await site.cookies.list();
  
  return cookies.map(cookie => {
    let header = `${cookie.name}=${cookie.value}`;
    if (cookie.domain) header += `; Domain=${cookie.domain}`;
    if (cookie.path) header += `; Path=${cookie.path}`;
    if (cookie.secure) header += `; Secure`;
    if (cookie.httpOnly) header += `; HttpOnly`;
    if (cookie.sameSite) header += `; SameSite=${cookie.sameSite}`;
    if (cookie.expires) header += `; Expires=${new Date(cookie.expires * 1000).toUTCString()}`;
    return header;
  });
}

// Usage
const netscape = await exportNetscapeCookies(piggy.site);
console.log(netscape);

const puppeteerCookies = await exportForPuppeteer(piggy.site);
console.log(puppeteerCookies);

const headers = await exportAsHeaders(piggy.site);
console.log(headers);
```

### 6. Cookie-Based Authentication Flow

```ts
async function authenticateWithCookies(site: any, credentials: any) {
  // Clear existing cookies first
  await clearAllCookies(site);
  
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
  
  // Return session info
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

## Cookie Security Notes

```ts
// ⚠️ Never log cookie values in production
console.log("Cookie:", cookie.value); // DON'T DO THIS

// ✅ Use for debugging only
if (process.env.DEBUG) {
  console.log("Cookie name:", cookie.name);
}

// ⚠️ Session cookies are sensitive
// Store them securely, don't commit to git

// ✅ Clear sensitive cookies when done
await clearAllCookies(piggy.site);
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `cookies.list()` | Get all cookies |
| `cookies.get(name)` | Get cookie by name (returns null if not found) |
| `cookies.set(name, value, domain, path?)` | Set cookie (path defaults to "/") |
| `cookies.delete(name)` | Delete cookie by name |

---

## Next Steps

- [Session Persistence](./session) — Save and restore full sessions
- [Network Capture](./network-capture) — Capture cookies from network traffic
- [Request Interception](./interception) — Modify cookies via headers

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
