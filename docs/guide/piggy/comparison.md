# Piggy vs Other Scraping Tools

How Nothing Browser Piggy compares to other browser automation and scraping libraries.

---

## Quick Comparison

| Feature | Piggy | Puppeteer | Playwright | Selenium | curl_cffi |
|---------|-------|-----------|------------|----------|-----------|
| **Communication** | Socket (Unix/Windows pipes) | CDP | CDP | WebDriver | HTTP |
| **Language** | TypeScript/Bun | JavaScript/Node.js | JS/TS/Python/Java/.NET | Multiple | Python |
| **TLS Fingerprint** | ✅ Real BoringSSL | ✅ Real BoringSSL | ✅ Real BoringSSL | ✅ Real BoringSSL | ⚠️ Patched |
| **navigator.webdriver** | ✅ Undefined | ❌ True (leaks) | ❌ True (leaks) | ❌ True (leaks) | N/A |
| **Built-in fingerprint spoofing** | ✅ Yes | ❌ Plugin needed | ❌ Plugin needed | ❌ Plugin needed | ✅ Yes |
| **Network capture** | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ No |
| **WebSocket capture** | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ No |
| **One-click export** | ✅ Python/cURL | ❌ No | ❌ No | ❌ No | ❌ No |
| **Built-in API server** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Session persistence** | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ No |
| **Human mode** | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Manual | ❌ No |
| **Cloudflare bypass** | ✅ Passes | ⚠️ Often blocked | ⚠️ Often blocked | ⚠️ Often blocked | ✅ Passes |
| **Lines of code to scrape** | ~20 | 80-200 | 80-200 | 100-250 | ~50 |

---

## How Piggy Communicates

Unlike Puppeteer/Playwright (which use Chrome DevTools Protocol over WebSocket), Piggy uses **direct socket communication**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Code                               │
│                    (Bun/TypeScript)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Socket Connection
                              │ (Unix domain socket / Windows pipe)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nothing Browser Binary                       │
│                    (Qt6 WebEngine + C++)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Socket Paths

| Platform | Socket Path |
|----------|-------------|
| Linux/macOS | `/tmp/piggy` (Unix domain socket) |
| Windows | `\\.\pipe\piggy` (Named pipe) |

### Why Socket Instead of CDP?

| Aspect | Socket (Piggy) | CDP (Puppeteer/Playwright) |
|--------|----------------|---------------------------|
| **Protocol** | Custom, lightweight | Chrome DevTools Protocol |
| **Overhead** | Minimal | Higher |
| **Latency** | Lower | Higher |
| **Custom commands** | ✅ Easy to add | ❌ Limited by CDP spec |
| **Binary size** | Smaller | Larger |
| **Control** | Full | Limited to CDP |

---

## Detailed Comparison

### TLS Fingerprint

| Tool | TLS Library | JA3 Status | Cloudflare |
|------|-------------|------------|------------|
| **Piggy** | BoringSSL (real Chrome) | ✅ Chrome-identical | ✅ Passes |
| Puppeteer | BoringSSL (real Chrome) | ✅ Chrome-identical | ⚠️ JS leaks |
| Playwright | BoringSSL (real Chrome) | ✅ Chrome-identical | ⚠️ JS leaks |
| Selenium | BoringSSL (real Chrome) | ✅ Chrome-identical | ⚠️ webdriver flag |
| curl_cffi | BoringSSL (patched) | ✅ Chrome-identical | ✅ Passes |
| Python requests | OpenSSL | ❌ Python JA3 | ❌ Blocked |

### JavaScript Detection

| Tool | navigator.webdriver | chrome.runtime | DocumentCreation injection |
|------|---------------------|----------------|---------------------------|
| **Piggy** | ✅ undefined | ✅ Present | ✅ Yes |
| Puppeteer | ❌ true | ❌ Absent | ⚠️ Partial (CDP) |
| Playwright | ❌ true | ❌ Absent | ⚠️ Partial (CDP) |
| Selenium | ❌ true | ❌ Absent | ❌ No |
| curl_cffi | N/A | N/A | N/A |

### Communication Overhead

```ts
// Piggy - direct socket command
socket.write(JSON.stringify({ cmd: "navigate", payload: { url } }) + "\n");

// Puppeteer - CDP over WebSocket
ws.send(JSON.stringify({
  id: 123,
  method: "Page.navigate",
  params: { url }
}));
```

---

## When to Use What

| Use Case | Recommended Tool |
|----------|------------------|
| **Quick scraping with anti-detection** | Piggy |
| **Testing web apps** | Playwright |
| **Simple Chrome automation** | Puppeteer |
| **Cross-browser testing** | Playwright |
| **Python-only stack** | curl_cffi |
| **API reverse engineering** | Piggy |
| **Production scraping pipeline** | Piggy |
| **Browser extension testing** | Puppeteer |

---

## Version Compatibility

### Important: Library vs Binary Versions

Piggy consists of two parts:
1. **Node/Bun library** (`nothing-browser` npm package)
2. **Nothing Browser binary** (downloaded separately)

These versions are **independent** and can be mixed.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Project                             │
├─────────────────────────────┬───────────────────────────────┤
│   Node/Bun Library          │   Nothing Browser Binary      │
│   (npm package)             │   (downloaded separately)     │
│                             │                               │
│   • API surface             │   • Browser engine            │
│   • exposeFunction logic    │   • TLS fingerprint           │
│   • TypeScript types        │   • Network capture           │
│   • Socket client           │   • Socket server             │
└─────────────────────────────┴───────────────────────────────┘
                              │
                              │ Socket Connection
                              ▼
                    ┌─────────────────────┐
                    │   /tmp/piggy        │
                    │   (Unix socket)     │
                    └─────────────────────┘
```

### Feature Rollout Order

When a new feature is added:

1. **First added to binary** (C++ layer with socket handler)
2. **Then added to library** (TypeScript layer with socket client)
3. **Then documented**

```
Timeline:
────────────────────────────────────────────────────────────►
     Binary v0.2.0          Library v0.6.0
     (adds new feature)     (exposes new feature)
     (new socket command)   (new method in library)
          │                        │
          ▼                        ▼
     Binary ready            Library ready
     but not exposed         with new API
```

### If You Update Library Without Binary

```ts
// You updated library to v0.6.0 but binary is still v0.1.0
await piggy.launch();  // OK - works

// New function that requires binary v0.2.0+
await piggy.site.newFunction();  
// ❌ TypeError: piggy.site.newFunction is not a function
```

**Error message:**
```
TypeError: piggy.site.newFunction is not a function

The library is trying to send a socket command that the binary doesn't understand.
Either update the binary or don't use this new function.
```

This happens because:
1. Library sends a new socket command to binary
2. Old binary doesn't recognize that command
3. Library throws "not a function" error

### Solutions

| Solution | When to Use |
|----------|-------------|
| **Update binary** | You need the new feature |
| **Don't use new function** | You don't need it |
| **Downgrade library** | You want to stay stable |

### Compatible Version Examples

```bash
# These combinations all work fine:
Library v0.5.0 + Binary v0.1.0  ✅ (old binary, old socket commands)
Library v0.5.0 + Binary v0.2.0  ✅ (new binary, same socket commands)
Library v0.6.0 + Binary v0.1.0  ⚠️ (new socket commands unavailable)
Library v0.6.0 + Binary v0.2.0  ✅ (new socket commands available)
```

### Backward Compatibility Promise

- ✅ **We never delete socket commands** without announcement
- ✅ **Old library continues to work** with newer binaries
- ✅ **You can stick with an old library** (e.g., v0.0.7) and a newer binary (e.g., v0.1.10)
- ✅ **Even 15 versions ahead**, old library + new binary works
- ✅ **Old socket commands remain supported** in new binaries

### Upgrade Policy

```ts
// Safe to upgrade library if:
// 1. You don't use new functions
// 2. You also upgrade binary

// Also safe to stay on old library:
// - It will continue working
// - We don't break existing APIs
// - All old socket commands still work
```

---

## Multi-Language Support (Coming Soon)

Piggy's **socket-based communication** means any language that can connect to Unix domain sockets or Windows named pipes can use it:

| Language | Status | Target Release |
|----------|--------|----------------|
| **TypeScript/Bun** | ✅ Available now | v0.1.0 |
| **Python** | 🔨 In development | v0.7.0 |
| **Go** | 📋 Planned | v0.8.0 |
| **Java** | 📋 Planned | v0.9.0 |
| **Rust** | 📋 Planned | v1.0.0 |
| **C#/.NET** | 📋 Planned | v1.0.0 |
| **Ruby** | 📋 Planned | v1.0.0 |
| **C++** | 📋 Planned | v1.0.0 |

### Python Example (Coming Soon)

```python
# Future Python version - connects to /tmp/piggy socket
from nothing_browser import piggy

await piggy.launch()
await piggy.register("site", "https://example.com")
await piggy.site.navigate()
data = await piggy.site.evaluate("() => ({ title: document.title })")
print(data)
```

### Go Example (Coming Soon)

```go
// Future Go version - connects to /tmp/piggy socket
package main

import "github.com/nothing-browser/piggy"

func main() {
    piggy.Launch()
    site := piggy.Register("site", "https://example.com")
    site.Navigate()
    title := site.Title()
    fmt.Println(title)
}
```

### Why Socket Communication Matters for Multi-Language

All language versions communicate via **socket** (Unix domain socket / Windows named pipe), which means:

- ✅ **Same features** across all languages
- ✅ **Same performance** across all languages  
- ✅ **Same anti-detection** across all languages
- ✅ **Binary is language-agnostic**
- ✅ **Any language with socket support** can implement a client
- ✅ **No HTTP/WebSocket overhead** like CDP-based tools

### Socket Protocol

```json
// Command format (library → binary)
{
  "id": "123",
  "cmd": "navigate",
  "payload": { "url": "https://example.com", "tabId": "default" }
}

// Response format (binary → library)
{
  "id": "123",
  "ok": true,
  "data": { "title": "Example Domain" }
}

// Event format (binary → library, unsolicited)
{
  "type": "event",
  "event": "navigate",
  "tabId": "default",
  "url": "https://example.com"
}
```

---

## Summary

| Aspect | Piggy |
|--------|-------|
| **Communication** | Socket (Unix/Windows pipes) - faster than CDP |
| **Easiest to use** | ✅ Yes |
| **Best anti-detection** | ✅ Yes |
| **Fastest setup** | ✅ Yes |
| **Most features built-in** | ✅ Yes |
| **Multi-language** | 🔨 Coming soon (via socket protocol) |
| **Production ready** | ✅ Yes |

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
