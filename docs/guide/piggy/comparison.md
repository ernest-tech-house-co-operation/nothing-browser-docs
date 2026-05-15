# Piggy vs Other Scraping Tools

How Nothing Browser Piggy compares to other browser automation libraries.

---

## Quick Comparison

| Feature | Piggy | Puppeteer | Playwright |
|---------|-------|-----------|------------|
| **Library size** | ~50KB | ~50MB | ~50MB |
| **Communication** | Socket | CDP (WebSocket) | CDP (WebSocket) |
| **Anti-detection** | ✅ Built-in | ❌ Plugins | ❌ Plugins |
| **Fingerprint spoofing** | ✅ DocumentCreation | ❌ Runtime (detectable) | ❌ Runtime |
| **Proxy rotation** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **WebSocket capture** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Built-in API server** | ✅ | ❌ | ❌ |
| **Lines to scrape** | ~20 | 80-200 | 80-200 |

---

## Why Piggy is Different

### Communication

Piggy uses **direct socket communication** (Unix domain socket / Windows named pipe). Puppeteer/Playwright use CDP over WebSocket.

### Anti-Detection

Piggy injects fingerprint spoofing at **DocumentCreation** — before any page JavaScript runs. Puppeteer injects at runtime, which is detectable.

### Library Size

Piggy is just a **command mapper** — ~50KB. Puppeteer is ~50MB because it reimplements the entire CDP.

---

## When to Use What

| Use Case | Recommended |
|----------|-------------|
| Scraping with anti-detection | **Piggy** |
| Testing web apps | Playwright |
| Simple Chrome automation | Puppeteer |
| Cross-browser testing | Playwright |
| Production scraping pipeline | **Piggy** |

---

## Version Compatibility

Piggy consists of two parts:
1. **Library** (`nothing-browser` npm package)
2. **Binary** (downloaded separately)

These versions are **independent** and can be mixed.

| Library | Binary | Works? |
|---------|--------|--------|
| Old | Old | ✅ |
| Old | New | ✅ (old features only) |
| New | Old | ⚠️ (new features unavailable) |
| New | New | ✅ (all features) |

See [Version Compatibility](./version-compatibility) for details.

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*