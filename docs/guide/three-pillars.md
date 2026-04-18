# The Three Pillars of Nothing

The Nothing ecosystem consists of three distinct products, each serving a different use case — all sharing the same core engine.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTHING ECOSYSTEM                                    │
├─────────────────────────────┬─────────────────────────────┬─────────────────┤
│      NOTHING BROWSER        │   NOTHING PRIVATE BROWSER    │      PIGGY      │
│        (UI Desktop)         │      (Privacy Focus)         │ (Scraper Lib)   │
├─────────────────────────────┼─────────────────────────────┼─────────────────┤
│  • Full DevTools baked in   │  • Zero telemetry            │  • Headless     │
│  • Network/WS/Storage       │  • Zero session persistence  │  • TypeScript   │
│  • One-click export         │  • Fingerprint spoofing      │  • RPC via      │
│  • YouTube tab              │  • WebRTC leak protection    │    exposeFunction│
│  • Plugin system            │  • UA-CH spoofing            │  • Intercept API│
│  • Auto-update              │  • No black boxes            │  • Multi-site   │
│  • Session management       │  • Tor routing (planned)     │  • Human mode   │
└─────────────────────────────┴─────────────────────────────┴─────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │  Qt6 WebEngine Core    │
                          │  • Real BoringSSL TLS  │
                          │  • Chromium engine     │
                          │  • DocumentCreation    │
                          │    injection           │
                          └───────────────────────┘
```

---

## When to Use Which

| Use Case | Recommended Product |
|----------|---------------------|
| Reverse engineering an API | Nothing Browser (UI) |
| Building an automated scraper | Piggy |
| Anonymous browsing | Nothing Private Browser |
| Testing bot detection | Nothing Browser + Piggy |
| Researching WebSocket protocols | Nothing Browser (UI) |
| Production scraping pipeline | Piggy |
| Privacy-focused daily browsing | Nothing Private Browser |
| Learning how browsers work | Nothing Browser (source) |

---

## Pillar 1: Nothing Browser (UI)

A full-featured desktop browser with developer tools baked in. **Everything is captured automatically** — no need to open DevTools at the right moment.

### Key Features

| Feature | What It Does |
|---------|--------------|
| **NETWORK tab** | Every HTTP request/response with Firefox-style header view |
| **WS tab** | Every WebSocket frame, direction-tagged, JSON auto pretty-printed |
| **COOKIES tab** | Every cookie with the exact request that set it |
| **STORAGE tab** | localStorage and sessionStorage writes in real time |
| **EXPORT tab** | Python, curl_cffi, cURL, JavaScript fetch, raw HTTP |
| **YOUTUBE tab** | YouTube without API keys (via NewPipe Extractor) |
| **PLUGINS tab** | Community JS plugins installed in-browser |
| **TECH HOUSE tab** | Auto-updates, changelog, version info |

### Best For
- API reverse engineering
- Understanding how web apps work
- Capturing authentication flows
- Researching WebSocket protocols

[Learn more →](./nothing-browser/index)

---

## Pillar 2: Nothing Private Browser

A privacy-first browser that leaves no traces. **Zero telemetry. Zero session persistence.**

### Key Features

| Feature | What It Does |
|---------|--------------|
| **Zero telemetry** | No analytics, no phoning home |
| **Zero session persistence** | Cookies, cache, storage wiped on close |
| **Fingerprint spoofing** | Randomised Chrome UA, hardware, WebGL |
| **WebRTC leak protection** | STUN servers stripped from ICE config |
| **UA-CH spoofing** | navigator.userAgentData and getHighEntropyValues() |

### Coming Soon
- Ad blocker (network-level, filter-list based)
- Tor routing — optional onion routing, one toggle
- ProtonVPN support — import `.ovpn` or WireGuard config

### Best For
- Anonymous browsing
- Privacy research
- Testing tracking prevention
- Daily browsing without data collection

[Learn more →](./private-browser/index)

---

## Pillar 3: Piggy — Scraper Library

A Bun + TypeScript library that controls the Nothing Browser binary. **Write scrapers in TypeScript, run them headlessly.**

### Quick Example

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("books", "https://books.toscrape.com");

await piggy.books.navigate();
const books = await piggy.books.evaluate(() => 
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title"),
    price: el.querySelector(".price_color")?.textContent
  }))
);

console.log(books);
await piggy.close();
```

### Key Features

| Feature | Description |
|---------|-------------|
| 🔥 **exposeFunction** | Call Node.js from browser JS (RPC) |
| 🔧 **exposeAndInject** | Expose + inject in one call |
| 📡 **intercept.respond** | Serve custom responses to network requests |
| 🎯 **intercept.modifyResponse** | Modify responses on the fly |
| 💾 **Session persistence** | Save/load cookies, storage, state |
| 🌐 **Multi-site parallel** | Control multiple tabs simultaneously |
| 🧠 **Human mode** | Random delays, typos, natural patterns |
| 🚀 **Built-in API server** | Turn your scraper into an API |

### Best For
- Automated web scraping
- Bot development
- API testing
- Production scraping pipelines

[Quick Start →](./piggy/quickstart.md)

---

## Shared Core Technology

All three products share the same underlying technology:

### Qt6 WebEngine
- Full Chromium rendering engine
- Real BoringSSL TLS stack (same as Chrome)
- QWebEngineScript injection at DocumentCreation

### Chrome-Identical TLS

| Fingerprint Layer | Verdict |
| --- | --- |
| JA3 | Chrome-identical |
| JA4 | Chrome-identical |
| Akamai HTTP/2 | Chrome-identical |

### Fingerprint Spoofing

Real machine values are used as the base. Only noise is added on top — the same approach as Brave Browser, but implemented at `DocumentCreation` phase.

```cpp
// IdentityGenerator reads real values:
id.cpuCores      = std::thread::hardware_concurrency();
id.ramGb         = readFromProcMeminfo();
id.screenW/H     = QGuiApplication::primaryScreen()->size();
id.timezone      = QTimeZone::systemTimeZoneId();
id.canvasSeed    = rng->generateDouble();  // random per session
id.audioSeed     = rng->generateDouble();  // random per session
```

---

## The Naming

**"Nothing"** comes from the philosophy: the browser does nothing on its own. No telemetry. No phoning home. No hidden data collection. It simply does what you tell it to do.

**"Piggy"** is the scraper library — because it piggybacks on the browser binary. Also, the logo is a pink pig.

**"Private"** is self-explanatory.

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*