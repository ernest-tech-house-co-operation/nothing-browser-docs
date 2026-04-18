# Nothing Browser

A scrapper-first browser built on Qt6 + Chromium WebEngine. Designed for API reverse engineering, web scraping, automation research, and people who hate black boxes.

---

## Overview

Most browsers are built to hide the web from you. Nothing Browser is built to **expose it**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DEVTOOLS  │  BROWSER  │  YOUTUBE  │  TECH HOUSE           │  PLUGINS      │
├─────────────────────────────────────────────────────────────────────────────┤
│  NETWORK [247]  │  WS [12]  │  COOKIES [38]  │  STORAGE   │  EXPORT       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POST  200  Fetch  1.2k  https://api.example.com/v1/data                   │
│  GET   304  Script  -    https://cdn.example.com/app.js                    │
│  WS    OPEN  -       -    wss://socket.example.com                         │
│                                                                             │
│  [COPY HEADERS] [COPY RESPONSE] [AS CURL] [AS PYTHON] [DOWNLOAD]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Every request, response, WebSocket frame, cookie, and storage write is captured in real time — visible, inspectable, copyable, and downloadable. One click exports any captured request to Python, cURL, JavaScript, or raw HTTP.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Network Inspector** | Every HTTP request/response with Firefox-style header view |
| **WebSocket Capture** | Every frame, direction-tagged, JSON auto pretty-printed |
| **Cookie Inspector** | Every cookie with the exact request that set it |
| **Storage Capture** | localStorage and sessionStorage writes in real time |
| **One-Click Export** | Python, curl_cffi, cURL, JavaScript fetch, raw HTTP |
| **YouTube Tab** | YouTube without API keys (via NewPipe Extractor) |
| **Plugin System** | Community JS plugins installed in-browser |
| **Session Management** | Auto-save sessions on close, load any previous session |
| **Auto-Update** | In-app updates, no terminal required |
| **Fingerprint Spoofing** | Chrome-identical TLS, canvas noise, WebGL spoofing |

---

## Quick Start

### Install

```bash
# Download the binary for your platform
# Place in your project root

# Install the npm package
bun add nothing-browser
```

### Launch

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("books", "https://books.toscrape.com");

await piggy.books.navigate();
await piggy.books.waitForSelector(".product_pod");

const books = await piggy.books.evaluate(() =>
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
  }))
);

console.log(books);
await piggy.close();
```

**That's it. One import, one register, scrape, done.**

---

## The Philosophy

Traditional browser DevTools are passive. You have to open them at the right time, know what to look for, and manually copy things out. They don't export. They don't persist across sessions. They are not designed for reverse engineering workflows.

Nothing Browser bakes the entire DevTools workflow into the browser itself. Everything is captured automatically from the first request. Sessions are saved and reloadable. Exports are one click. The browser is the tool.

---

## Why Nothing Browser

| Feature | Nothing Browser | Puppeteer | Playwright |
|---------|-----------------|-----------|------------|
| **Imports** | 1 | 5-10 | 5-10 |
| **Lines to scrape** | ~20 | 80-200 | 80-200 |
| **Fingerprint spoofing** | ✅ Built-in | ❌ Plugin needed | ❌ Plugin needed |
| **Network capture** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Built-in API server** | ✅ | ❌ | ❌ |
| **Cloudflare bypass** | ✅ Passes | ⚠️ Often blocked | ⚠️ Often blocked |

---

## Tabs Explained

| Tab | Purpose |
|-----|---------|
| **DEVTOOLS** | Network, WebSocket, Cookie, Storage capture + Export |
| **BROWSER** | Full Chromium browser, all traffic captured |
| **YOUTUBE** | YouTube client without API keys or tracking |
| **TECH HOUSE** | Updates, changelog, version info |
| **PLUGINS** | Community plugin manager |

---

## Headless vs Headful

| Binary | Use Case | Visibility |
|--------|----------|------------|
| **Headless** | Automated scraping, CI/CD, servers | No window |
| **Headful** | Debugging, sites that detect headless | Visible window |

```ts
// Headless (default)
await piggy.launch({ binary: "headless" });

// Headful (visible)
await piggy.launch({ binary: "headful" });
```

---

## Use Cases

### API Reverse Engineering

1. Browse to the target site
2. Watch DEVTOOLS capture all API calls
3. Export any request as Python or cURL
4. Replicate in your own code

### Web Scraping

1. Write your scraper using Piggy
2. Built-in anti-detection handles Cloudflare
3. Session persistence maintains login
4. Human mode avoids behavioral detection

### Bot Development

1. Real Chrome TLS fingerprint
2. No automation flags
3. Canvas and audio noise
4. Human-like interaction timing

### Privacy Research

1. Zero telemetry
2. See exactly what data sites collect
3. Capture every network request
4. Export for analysis

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Nothing Browser                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  BROWSER    │    │  DEVTOOLS   │    │  YOUTUBE    │    │  PLUGINS    │  │
│  │  Tab        │    │  Tab        │    │  Tab        │    │  Tab        │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         ▼                  ▼                  ▼                  ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Qt6 WebEngine                               │   │
│  │  • Chromium rendering engine                                        │   │
│  │  • Real BoringSSL TLS                                               │   │
│  │  • DocumentCreation injection                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Binary Downloads

| Platform | Headless | Headful |
|----------|----------|---------|
| **Linux** | `nothing-browser-headless-*.tar.gz` | `nothing-browser-headful-*.tar.gz` |
| **Windows** | `nothing-browser-headless-*.zip` | `nothing-browser-headful-*.zip` |
| **macOS** | `nothing-browser-headless-*.tar.gz` | `nothing-browser-headful-*.tar.gz` |

Download from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases)

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS** | Linux, Windows 10+, macOS 11+ | Latest |
| **RAM** | 2GB | 4GB+ |
| **Disk** | 200MB | 500MB |
| **Java** | 17+ (for YouTube tab) | 17+ |

---

## Next Steps

- [Installation](./installation) — Get set up
- [DEVTOOLS Tab](./devtools) — Capture network traffic
- [BROWSER Tab](./browser) — Browse with capture
- [Piggy Library](../piggy/quickstart) — Automated scraping

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
