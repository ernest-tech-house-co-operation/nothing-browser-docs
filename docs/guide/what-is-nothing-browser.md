# What is Nothing Browser

> A scrapper-first browser built on Qt6 + Chromium WebEngine. Designed for API reverse engineering, web scraping, automation research, and people who hate black boxes.

Most browsers are built to hide the web from you. Nothing Browser is built to **expose it**.

Every request, response, WebSocket frame, cookie, and storage write is captured in real time — visible, inspectable, copyable, and downloadable. One click exports any captured request to Python, cURL, JavaScript, or raw HTTP.

## The Core Idea

Traditional browser DevTools are passive. You have to open them at the right time, know what to look for, and manually copy things out. They don't export. They don't persist across sessions. They are not designed for reverse engineering workflows.

Nothing Browser bakes the entire DevTools workflow into the browser itself. Everything is captured automatically from the first request. Sessions are saved and reloadable. Exports are one click. The browser is the tool.

## Who It's For

- API reverse engineers who need to see exactly what a web app sends
- Scrapers who need to replicate authenticated requests in Python or cURL
- Automation researchers studying bot detection mechanisms
- Developers who need to inspect WebSocket protocols
- Anyone who has lost an authenticated session because DevTools wasn't open

## What Makes It Different

```
┌─────────────────────────────────────────────────────────────┐
│  DEVTOOLS  │  BROWSER  │  YOUTUBE  │  TECH HOUSE           │
├─────────────────────────────────────────────────────────────┤
│  NETWORK [247]  │  WS [12]  │  COOKIES [38]  │  STORAGE   │
│                                                             │
│  POST  200  Fetch  1.2k  https://api.example.com/v1/data  │
│  GET   304  Script  -    https://cdn.example.com/app.js   │
│                                                             │
│  [COPY HEADERS] [COPY RESPONSE] [AS CURL] [AS PYTHON]     │
└─────────────────────────────────────────────────────────────┘
```

The DEVTOOLS tab is always running. You don't open it. It's already capturing.

## TLS Fingerprint

Nothing Browser runs on Qt WebEngine, which uses the **same BoringSSL stack as Google Chrome**. This means the TLS ClientHello — the very first bytes a server sees before any HTTP — is genuinely Chrome-identical. Not patched. Not simulated. Identical.

This is why Nothing Browser passes Cloudflare's bot detection where Python `requests`, `httpx`, Scrapy, and stock cURL are immediately flagged.

See the full [TLS Fingerprint Report](/guide/tls-fingerprint) for live benchmark data.

## Version

Current version: **v0.1.3**

Built by **Ernest Tech House** · Coded by **Pease Ernest**

[ernesttechhouse@gmail.com](mailto:ernesttechhouse@gmail.com) · [Discord](https://discord.gg/TUxBVQ7y) · [WhatsApp](https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U)
