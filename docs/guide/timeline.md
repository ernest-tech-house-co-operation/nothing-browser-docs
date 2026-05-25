# Development Timeline

## Current Status (2026)

All three products are under active development. Here's what's being worked on:

---

## Nothing Browser

### ✅ Currently Available
- Core browser with DevTools baked in
- Network/WebSocket/Cookie/Storage capture
- One-click export (Python, cURL, JavaScript)
- YouTube tab (via NewPipe Extractor)
- Plugin system with community registry
- Session management
- Auto-update system
- Fingerprint spoofing

### 🔨 In Development
- Windows native support
- Response body search
- Identity reset UI
- Built-in captcha solver
- Script marketplace
- Headless mode
- Multi-tab session profiles

---

## Nothing Private Browser

### ✅ Currently Available
- Zero telemetry
- Zero session persistence
- Fingerprint spoofing
- WebRTC leak protection
- UA-CH spoofing

### 🔨 In Development
- Ad blocker (network-level, filter-list based)
- Tor routing
- ProtonVPN support

---

## Piggy (Scraper Library)

### ✅ Currently Available
- Navigation & interactions
- Session persistence
- Network capture
- Multi-site parallel
- Human mode
- **exposeFunction (RPC)**
- **intercept.respond**
- **intercept.modifyResponse**
- Built-in API server

### 🔨 In Development
- Global expose
- WebSocket client API
- Real-time streaming
- Enhanced TypeScript types

---

## 🍳 The Three Pillars — Coming in Later Versions

### 1. `nothing-stream` — Streaming Engine

A completely separate library. Not part of Piggy. Pure data streaming.

```typescript
import { saltyaom } from "nothing-engine";

// Core memory allocation
await saltyaom.allocateSpace();

// Open internal port highway
await saltyaom.allocatedSpace.routeToHttp(3000);

// Initiate raw, headless socket hook
await saltyaom.startStream();

// Register namespace stream
await saltyaom.register("siteUrl", "https://web.whatsapp.com");

// Read mutating HTML chunks as they tick past
saltyaom.capturedHtml.find(item => {
    capturedHtml.provideUsWith(text);
});
```

**What it does:** Raw packet streaming. No DOM snapshots. No page loads. Just data as it arrives.

**The catch:** It's not designed for UI. At all. And this will absolutely fail Cloudflare tests.

| Tool | Cloudflare Detection |
|------|---------------------|
| Puppeteer | 💡 A bulb saying "I'm a bot" |
| nothing-stream | 🚢 "What are this? That guide ships to harbour, yah. And it says 'hey Cloudflare, I'm a bot, block me.'" |

This is for sites like WhatsApp. Maybe your own. Or torrent sites. And you'll notice we use `capturedHtml` — I hate that name. It will be shorter. Because minute one HTML will be absolutely different from minute two HTML.

---

### 2. `nothing-render` — UI Drawer

A UI drawer that hooks into the streaming engine.

**The reality:** The streaming engine's nature is not to accept any UI rendering engine. Hooking up the rendering engine will be a very, very good game of "please for fucks sake work."

**But we will make it.** Let me elaborate how hard it will be:

1. You will have to learn C++
2. Then write code to create the hook between the two
3. There will be docs to write it — but I won't write it in full
4. Then you write code to translate the streams to drawings
5. And write code to tell the engine: "Hey bro, hold up"

This is not plug-and-play. This is duct tape and prayers.

---

### 3. `nothing-whatsapp` — WhatsApp Library

Exact replica of `whatsapp-web.js` API — but runs on nothing-browser (Piggy binary), NOT the streaming engine.

```typescript
import { ernest } from "nothing-whatsapp";

const client = new ernest.Client();  // Same API as whatsapp-web.js
// Under the hood: nothing-browser, not streaming engine
```

**Why not on streaming engine?** Streaming engine is pure data. WhatsApp needs occasional UI (QR codes, login screens). Can't run on stream alone.

**And also, surprise:** I will open a PR to the official `whatsapp-web.js` repo. Pedro Lopez might shut it down. But well, prayer is just that — he thinks about it.

Because it will be way, way better than Puppeteer. And it will mean he will just take care of updating WhatsApp HTML updates — not browser stuff. See the split of work?

**What this means:**
- Same developer experience — zero learning curve
- 30MB RAM instead of 500MB
- 50+ sessions on the same hardware

---

## The Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    nothing-whatsapp                         │
│              (WhatsApp API wrapper)                         │
│         Exact replica of whatsapp-web.js API                │
│              Runs on nothing-browser                        │
│                    NOT on streaming engine                  │
├─────────────────────────────────────────────────────────────┤
│                      nothing-render                         │
│                    (UI drawer)                              │
│         Hooks into streaming engine (if it works)           │
│              Will be a nightmare to integrate               │
├─────────────────────────────────────────────────────────────┤
│                      nothing-stream                         │
│                   (Streaming engine)                        │
│         Raw packet ingestion, DOM chunks as they stream     │
│              NOT designed for UI — pure data                │
├─────────────────────────────────────────────────────────────┤
│                    nothing-browser                          │
│                   (C++ QtWebEngine core)                    │
│              Piggy's binary — socket communication          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🪶 Minified Binary (XXX-mini)
*Tiny footprint for simple, unprotected targets.*

A stripped-down Chromium binary in the **50–70 MB range** (no promises), built specifically for sites that don't need heavy evasion. No bells, no whistles — just a lean browser you can ship anywhere. It will be patched like the main binary, but global-scale anti-bot evasion is not its goal. If your target doesn't fight back, this is your binary.

---

## 🪟 Windows 8 Support
*Because Node runs on it, and a scraper server is a scraper server.*

A Piggy build targeting Windows 8 compatibility. Realistically this is useful as a headless server environment rather than a daily driver. Node.js support is the key enabler here — if the runtime runs, Piggy can run.

**And I am making this because** I'm building a system where the host machine is Windows 8. So yeah. I need this.

---

## ⚡ `nth` — The Nothing Runtime
*One job. Run JS. Fast.*

`nth` is a JavaScript runner with a single, uncompromising purpose: run your script as fast as possible and get out of the way. The interface is as simple as it gets.

*And because I hate Bun. Sorry Jarred Sumner. You are just a joke.*

```bash
nth index.js
```

It doesn't bundle axios. It doesn't have opinions about your project structure. It doesn't try to be a package manager, a bundler, a test runner, or a deployment tool. It runs JS. That's it.

**How it works:**

`nth` piggybacks on the JS ecosystem you already have. You configure your preferred engine in `nth.config` at your project root:

```json
{
  "packageManager": "pnpm"
}
```

Valid options: `node`, `npm`, `pnpm`, `bun`, `deno`. When you run `nth index.js`, it resolves your config and delegates to whatever you've set. The magic isn't in reinventing the wheel — it's in being the thinnest possible layer on top of tools that already work.

**Why it exists:**

Bun proved something important: JS can be fast. The runtime isn't the bottleneck — the ambition is. Bun decided to be a runtime, a bundler, a package manager, a test runner, and probably a coffee maker. It's mediocre at most of them. `nth` takes the lesson (JS can start fast) and ignores the ego trip (let's replace everything).

The result is something **absurdly well-suited for serverless functions** — tiny binary, single responsibility, cold starts that don't embarrass you.

**The language problem:**

This is where it gets honest. `nth` wants to be written in the fastest language on the planet, and that's a harder question than it sounds:

- **Assembly** — theoretically the ceiling. Practically a nightmare. Bugs don't just crash your program; they corrupt memory and take everything else down with them. Not impossible, just painful in ways that age you.
- **C++** — the proven choice. Fast, battle-tested, and also boring in a way that makes it hard to stay interested long enough to finish.
- **Rust** — the obvious modern answer. Bun moved from Zig to Rust, which is precisely why it's less appealing. Following Bun's footsteps defeats the point.
- **Zig** — interesting, but Bun abandoned it, which at minimum raises questions.
- **Something else entirely** — the search continues.

The language decision is genuinely open. Speed is non-negotiable. The rest is still being figured out.

> *This will take a while. That's fine. The idea is right.*

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*