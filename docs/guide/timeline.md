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

### 🍳 Cooking — Coming in Later Versions

#### `piggy.synthesize.llm.md` / `piggy.synthesize.llm.html`
*Our answer to Firecrawl, Jina, and every paid web-to-LLM pipeline — self-hosted, free, and more capable.*

Piggy's HTTP server will expose two synthesis endpoints that convert any live webpage into clean, LLM-ready output — handling JavaScript rendering, logins, iframes, Cloudflare, and everything paid tools struggle with.

| Endpoint | Output | Use Case |
|----------|--------|----------|
| `piggy.synthesize.llm.md` | Clean Markdown | Feed pages directly into LLM context |
| `piggy.synthesize.llm.html` | Semantic HTML (no scripts/styles) | Structured extraction, RAG pipelines |

**How it works:**
```typescript
// Start Piggy with HTTP server
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.serve(3000);

// Synthesize any page
GET http://localhost:3000/synthesize/md?url=https://example.com
GET http://localhost:3000/synthesize/html?url=https://example.com
```

**MCP Integration — LLMs browse the web natively:**
```json
{
  "mcpServers": {
    "piggy": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```
Once connected, any MCP-compatible agent (Claude Desktop, Cursor, etc.) can call `piggy_navigate`, `piggy_synthesize_md`, and `piggy_synthesize_html` directly — no third-party API, no data leaving your server.

**What you can build with it:**
- 🤖 LLM agents that browse real pages, not cached snapshots
- 📚 RAG pipelines fed by live web content
- 🔍 Private research tools with no API bills
- 🏗️ Self-hosted Firecrawl replacement for your entire team
- 🔄 Automated content monitoring with LLM summarization
- 🌐 MCP server for Claude Desktop / Cursor with full browser power

**Why it beats every paid alternative:**

| Solution | JS Rendering | MCP Native | Self-Hostable | Free |
|----------|-------------|------------|---------------|------|
| **Firecrawl** | ✅ | ❌ | ❌ | ❌ |
| **Jina Reader** | ⚠️ | ❌ | ❌ | ⚠️ rate-limited |
| **Browser-Use** | ✅ | ❌ | ✅ | ✅ |
| **Playwright MCP** | ✅ | ✅ | ✅ | ✅ |
| **Piggy + MCP** | ✅ | ✅ | ✅ | ✅ |

Piggy already handles hard targets — Cloudflare, dialogs, iframes, authenticated sessions — that HTTP crawlers can't touch. The synthesis layer puts clean, structured output on top of that. The goal: **Firecrawl + Browser-Use combined, MIT licensed, running on your own machine.**

---

#### 🪶 Minified Binary (XXX-mini)
*Tiny footprint for simple, unprotected targets.*

A stripped-down Chromium binary in the **50–70 MB range** (no promises), built specifically for sites that don't need heavy evasion. No bells, no whistles — just a lean browser you can ship anywhere. It will be patched like the main binary, but global-scale anti-bot evasion is not its goal. If your target doesn't fight back, this is your binary.

---

#### 🪟 Windows 8 Support
*Because Node runs on it, and a scraper server is a scraper server.*

A Piggy build targeting Windows 8 compatibility. Realistically this is useful as a headless server environment rather than a daily driver. Node.js support is the key enabler here — if the runtime runs, Piggy can run.

---

#### ⚡ `nth` — The Nothing Runtime
*One job. Run JS. Fast.*

`nth` is a JavaScript runner with a single, uncompromising purpose: run your script as fast as possible and get out of the way. The interface is as simple as it gets:

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