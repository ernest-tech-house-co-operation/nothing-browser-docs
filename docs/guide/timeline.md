```markdown
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

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
```