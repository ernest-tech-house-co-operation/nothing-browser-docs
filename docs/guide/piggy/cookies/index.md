# 🍪 Cookies API — Manage Browser Cookies

Set, get, delete, and list cookies. Essential for authentication, session management, and preserving login state across scraper runs.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

Cookies API gives you full control over browser cookies:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `cookies.set(name, value, domain, path?)` | Create/update a cookie | Set auth token, session ID |
| `cookies.get(name, domain?)` | Get a specific cookie | Retrieve session value |
| `cookies.delete(name, domain)` | Remove a cookie | Logout, clear tracking |
| `cookies.list(domain?)` | Get all cookies | Debug, export session |

---

## Important Notes

- `cookies.delete()` **requires both name and domain** — the browser needs the domain to identify which cookie to remove.
- `cookies.get()` and `cookies.list()` accept an optional domain to filter results.
- Cookies are automatically persisted to `cookies.json` in your working directory and survive browser restarts.
- `cookies.list()` reads from `cookies.json` on disk — it always reflects the current state.

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "./nothing-browser-headless.exe" });
await piggy.register("site", "https://example.com");

await piggy.site.navigate();
await piggy.site.waitForSelector("body");

// Set a cookie
await piggy.site.cookies.set("session_id", "abc123", "example.com");

// Get a cookie by name
const session = await piggy.site.cookies.get("session_id");
console.log(session.value); // "abc123"

// Get a cookie filtered by domain
const session2 = await piggy.site.cookies.get("session_id", "example.com");

// List all cookies
const allCookies = await piggy.site.cookies.list();

// List cookies filtered by domain
const siteCookies = await piggy.site.cookies.list("example.com");

// Delete a cookie — domain is required
await piggy.site.cookies.delete("session_id", "example.com");

await piggy.close();
```

---

## Cookie Object Structure

```ts
interface Cookie {
  name: string;           // Cookie name
  value: string;          // Cookie value
  domain: string;         // Domain (e.g., "example.com" or ".example.com" for subdomains)
  path: string;           // URL path (default: "/")
  httpOnly: boolean;      // Not accessible via JavaScript
  secure: boolean;        // HTTPS only
  expires?: number;       // Unix timestamp (seconds), undefined = session cookie
}
```

---

## Set Cookie

### `cookies.set(name, value, domain, path?)`

```ts
// Basic session cookie
await piggy.site.cookies.set("session_id", "abc123", "example.com");

// With a specific path
await piggy.site.cookies.set("user_pref", "dark_mode", "example.com", "/settings");

// With a leading dot to cover subdomains
await piggy.site.cookies.set("auth_token", "xyz789", ".example.com", "/");
```

> **Note:** The browser must have navigated to the domain before you can set cookies on it. Always call `navigate()` and `waitForSelector()` first.

---

## Get Cookie

### `cookies.get(name, domain?)`

```ts
// Get by name only
const cookie = await piggy.site.cookies.get("session_id");

// Get by name + domain (more precise)
const cookie2 = await piggy.site.cookies.get("session_id", "example.com");

if (cookie) {
  console.log(`Name:    ${cookie.name}`);
  console.log(`Value:   ${cookie.value}`);
  console.log(`Domain:  ${cookie.domain}`);
  console.log(`Expires: ${cookie.expires ?? "session"}`);
}
```

---

## Delete Cookie

### `cookies.delete(name, domain)`

> ⚠️ **Domain is required.** The browser uses both name and domain together to identify a cookie. Omitting domain will throw an error.

```ts
// Correct — provide both name and domain
await piggy.site.cookies.delete("session_id", "example.com");

// Delete multiple cookies
const cookies = await piggy.site.cookies.list();
for (const cookie of cookies) {
  if (cookie.name.startsWith("_ga")) {
    await piggy.site.cookies.delete(cookie.name, cookie.domain);
  }
}
```

---

## List All Cookies

### `cookies.list(domain?)`

```ts
// List all cookies
const cookies = await piggy.site.cookies.list();

// List filtered by domain
const siteCookies = await piggy.site.cookies.list("example.com");

for (const cookie of cookies) {
  console.log(`${cookie.name} = ${cookie.value}`);
  console.log(`  Domain:   ${cookie.domain}`);
  console.log(`  Path:     ${cookie.path}`);
  console.log(`  HttpOnly: ${cookie.httpOnly}`);
  console.log(`  Secure:   ${cookie.secure}`);
}
```

---

## Real-World Examples

### Example 1: Login Then Read Session Cookie

```ts
await piggy.register("quotes", "https://quotes.toscrape.com");
await piggy.quotes.navigate();
await piggy.quotes.waitForSelector(".quote");

await piggy.quotes.navigate("https://quotes.toscrape.com/login");
await piggy.quotes.waitForSelector("#username");
await piggy.quotes.type("#username", "admin");
await piggy.quotes.type("#password", "admin");
await piggy.quotes.click("input[type='submit']");
await piggy.quotes.waitForNavigation();

const cookies = await piggy.quotes.cookies.list();
console.log(`Cookies after login: ${cookies.length}`);
cookies.forEach(c => console.log(`  ${c.name} = ${c.value}`));
```

### Example 2: Save and Restore Cookies

```ts
import { writeFileSync, readFileSync, existsSync } from "fs";

const COOKIE_FILE = "./my-cookies.json";

async function saveCookies(site: any) {
  const cookies = await site.cookies.list();
  writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
  console.log(`Saved ${cookies.length} cookies`);
}

async function loadCookies(site: any) {
  if (!existsSync(COOKIE_FILE)) return false;
  const cookies = JSON.parse(readFileSync(COOKIE_FILE, "utf8"));
  for (const cookie of cookies) {
    await site.cookies.set(cookie.name, cookie.value, cookie.domain, cookie.path);
  }
  console.log(`Loaded ${cookies.length} cookies`);
  return true;
}

await piggy.launch({ mode: "tab", binary: "./nothing-browser-headless.exe" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();
await piggy.site.waitForSelector("body");

await loadCookies(piggy.site);
await saveCookies(piggy.site);
```

### Example 3: Clear Tracking Cookies

```ts
async function clearTrackingCookies(site: any) {
  const cookies = await site.cookies.list();
  const trackingDomains = [
    "google-analytics.com",
    "doubleclick.net",
    "facebook.com",
  ];

  let cleared = 0;
  for (const cookie of cookies) {
    if (trackingDomains.some(d => cookie.domain.includes(d))) {
      await site.cookies.delete(cookie.name, cookie.domain);
      cleared++;
    }
  }
  console.log(`Cleared ${cleared} tracking cookies`);
}
```

### Example 4: Export Cookies as Netscape Format (for curl/wget)

```ts
async function exportNetscapeCookies(site: any): Promise<string> {
  const cookies = await site.cookies.list();
  const lines = [
    "# Netscape HTTP Cookie File",
    "# https://curl.se/docs/http-cookies.html"
  ];

  for (const cookie of cookies) {
    const domain  = cookie.domain.startsWith(".") ? cookie.domain : `.${cookie.domain}`;
    const secure  = cookie.secure ? "TRUE" : "FALSE";
    const expires = cookie.expires ?? "0";
    const path    = cookie.path ?? "/";
    lines.push(`${domain}\tTRUE\t${path}\t${secure}\t${expires}\t${cookie.name}\t${cookie.value}`);
  }

  return lines.join("\n");
}

const netscape = await exportNetscapeCookies(piggy.site);
console.log(netscape);
```

### Example 5: Export Cookies for Playwright

```ts
async function exportForPlaywright(site: any) {
  const cookies = await site.cookies.list();
  return cookies.map(cookie => ({
    name:     cookie.name,
    value:    cookie.value,
    domain:   cookie.domain,
    path:     cookie.path,
    expires:  cookie.expires ? cookie.expires * 1000 : -1,
    httpOnly: cookie.httpOnly,
    secure:   cookie.secure,
    sameSite: "Lax"
  }));
}

const playwrightCookies = await exportForPlaywright(piggy.site);
console.log(JSON.stringify(playwrightCookies, null, 2));
```

---

## Cookie File (cookies.json)

Piggy automatically persists cookies to `cookies.json` in your working directory. This file is kept in sync at all times — `cookies.get()` and `cookies.list()` read directly from it.

```json
[
  {
    "name": "session_id",
    "value": "abc123def456",
    "domain": "example.com",
    "path": "/",
    "httpOnly": true,
    "secure": true
  },
  {
    "name": "user_pref",
    "value": "dark_mode",
    "domain": "example.com",
    "path": "/",
    "httpOnly": false,
    "secure": false
  }
]
```

### Hot Reload

Edit `cookies.json` while Piggy is running, then reload:

```ts
await piggy.site.session.reload();
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `cookies.set(name, value, domain, path?)` | `name: string, value: string, domain: string, path?: string` | `Promise<void>` | Set or update a cookie |
| `cookies.get(name, domain?)` | `name: string, domain?: string` | `Promise<Cookie \| null>` | Get a cookie by name |
| `cookies.delete(name, domain)` | `name: string, domain: string` | `Promise<void>` | Delete a cookie — domain required |
| `cookies.list(domain?)` | `domain?: string` | `Promise<Cookie[]>` | List all cookies, optionally filtered by domain |

---

## Next Steps

- [Session API](./session) — Export/import full session state
- [Capture API](./capture) — Capture cookies from network traffic
- [Proxy API](./proxy) — Rotate IPs for different cookie contexts

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*