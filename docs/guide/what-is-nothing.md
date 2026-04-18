# What is Nothing

**Nothing** is an ecosystem of three open-source tools built for people who want to understand how the web actually works.

| Product | What It Does | Best For |
|---------|--------------|----------|
| **Nothing Browser** | Qt6/Chromium browser with baked-in DevTools for network inspection | API reverse engineering, web scraping research |
| **Nothing Private Browser** | Privacy-first browser — zero telemetry, zero session persistence | Anonymous browsing, privacy research |
| **Piggy** | Bun + TypeScript headless browser library | Automated scraping, bot development, RPC |

All three share the same core engine: **Qt6 WebEngine with real BoringSSL TLS**. All three are MIT licensed. All three are built by **Ernest Tech House** in Kenya.

---

## The Philosophy

Most browsers are built to hide the web from you. Nothing browsers are built to **expose it**.

Every request, response, WebSocket frame, cookie, and storage write is captured in real time — visible, inspectable, copyable, and downloadable. One click exports any captured request to Python, cURL, JavaScript, or raw HTTP.

Traditional browser DevTools are passive. You have to open them at the right time, know what to look for, and manually copy things out. They don't export. They don't persist across sessions. They are not designed for reverse engineering workflows.

Nothing bakes the entire DevTools workflow into the browser itself. Everything is captured automatically from the first request. Sessions are saved and reloadable. Exports are one click. The browser is the tool.

---

## Why It Matters

### TLS Fingerprint

Nothing Browser runs on Qt WebEngine, which uses the **same BoringSSL stack as Google Chrome**. The TLS ClientHello — the very first bytes a server sees — is genuinely Chrome-identical. Not patched. Not simulated. Identical.

This is why Nothing Browser passes Cloudflare's bot detection where Python `requests`, `httpx`, Scrapy, and stock cURL are immediately flagged.

### One Import vs 47 Plugins

| | nothing-browser | Puppeteer | Playwright |
|---|---|---|---|
| Imports | **1** | 5–10 | 5–10 |
| Lines to scrape a site | **~20** | 80–200 | 80–200 |
| Fingerprint spoofing | ✅ built in | ❌ plugin needed | ❌ plugin needed |
| Network capture | ✅ built in | ❌ manual | ❌ manual |
| Built-in API server | ✅ | ❌ | ❌ |
| Cloudflare bypass | ✅ passes | ⚠️ often blocked | ⚠️ often blocked |

---

## What's Coming

| Focus Area | Upcoming Features |
|------------|-------------------|
| **Nothing Browser** | Windows native, response body search, captcha solver, headless mode, session profiles |
| **Nothing Private Browser** | Ad blocker, Tor routing, ProtonVPN support |
| **Piggy** | WebSocket client API, real-time streaming, enhanced RPC |

---

## Quick Links

- [The Three Pillars](./three-pillars) — Deep dive into each product
- [Piggy Quick Start](./piggy/quickstart) — First scraper in 5 minutes
- [TLS Fingerprint Report](./technical/tls-fingerprint) — Technical deep dive
- [Download Scraping Browser](https://github.com/BunElysiaReact/nothing-browser/releases)
- [Download Private Browser](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases)

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*