# Limitations

Honest and transparent list of Nothing Browser's current limitations. Know what to expect before you start.

---

## Browser Limitations

### Sites That Block Nothing Browser

| Site/Service | Status | Reason |
|--------------|--------|--------|
| **Google Search** | ⚠️ May block | Advanced fingerprinting |
| **Gmail** | ⚠️ May block | Google account protection |
| **YouTube (browser tab)** | ⚠️ May degrade | Uses NewPipe tab instead |
| **Facebook** | ⚠️ Often blocks | Bot detection |
| **Banking sites** | ⚠️ Often blocks | Security measures |
| **Cloudflare protected** | ✅ Usually passes | TLS fingerprint matches Chrome |

**Workaround:** Use the YOUTUBE tab for YouTube content. Use headful mode for banking sites.

---

### Chrome Extensions

**Limitation:** Chrome extensions are not supported.

**Reason:** Qt WebEngine does not have a Chrome extension host.

**Alternative:** Use Piggy's plugin system for JavaScript injection.

---

### Mobile Emulation

**Limitation:** No built-in mobile device emulation.

**Reason:** Desktop-focused browser engine.

**Workaround:** Use CSS media queries and viewport settings in evaluate:

```ts
await site.evaluate(() => {
  // Force mobile viewport
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(meta);
});
```

---

## Fingerprint Limitations

### Canvas Uniqueness

| Metric | Current | Target |
|--------|---------|--------|
| Canvas uniqueness | 99.98% | 99.99%+ |
| Detection rate | Very low | Near zero |

The sin() PRNG is being replaced with xorshift in upcoming versions.

### WebGL Limitations

| Parameter | Status | Fix Version |
|-----------|--------|-------------|
| UNMASKED_VENDOR_WEBGL | ✅ Spoofed | Current |
| UNMASKED_RENDERER_WEBGL | ✅ Spoofed | Current |
| WebGL extensions | ⚠️ Partial | v0.2.0 |
| WebGL 2.0 params | ⚠️ Partial | v0.2.0 |

### Font Detection

**Limitation:** System fonts are still detectable.

**Reason:** Qt WebEngine reports real system fonts.

**Impact:** Advanced fingerprinting sites may detect unique font combinations.

---

## TLS Limitations (Qt WebEngine)

| Gap | Severity | Fix Path | Version |
|-----|----------|----------|---------|
| X25519MLKEM768 curve | Low | Qt WebEngine version bump | v0.3.0+ |
| Encrypted Client Hello (ECH) | Low | Custom Qt build required | v0.3.0+ |
| ALPS codepoint 17613 | Low | Qt WebEngine version bump | v0.3.0+ |

**Current Status:** These do NOT affect detection by Cloudflare, Akamai, or DataDome for Chrome 124 impersonation.

---

## Platform Limitations

### Windows Support

| Feature | Status | Target |
|---------|--------|--------|
| Basic browsing | ✅ Working | Current |
| Network capture | ✅ Working | Current |
| YouTube tab | ⚠️ Java required | Current |
| Native build | 🔨 In progress | v0.2.0 |
| Installer | 🔨 In progress | v0.2.0 |

### macOS Support

| Feature | Status | Target |
|---------|--------|--------|
| Basic browsing | ✅ Working | Current |
| Network capture | ✅ Working | Current |
| YouTube tab | ⚠️ Java required | Current |
| Apple Silicon native | ⚠️ Rosetta required | v0.2.0 |
| Notarization | 📋 Planned | v0.3.0 |

### Linux Support

| Feature | Status |
|---------|--------|
| x86_64 | ✅ Full support |
| ARM64 | ⚠️ Community builds |
| Wayland | ⚠️ May have issues (use X11) |

---

## Piggy Library Limitations

### exposeFunction

| Limitation | Description | Workaround |
|------------|-------------|------------|
| Max payload size | 10MB | Split large data |
| Call timeout | 30 seconds | Increase or batch |
| Queue size | 1000 calls | Reduce call frequency |
| Latency | ~150-300ms | Acceptable for scraping |

### WebSocket Capture

| Limitation | Description |
|------------|-------------|
| Binary frames | Base64 encoded, not raw |
| Compression | Not decoded |
| Large messages | May be truncated |

### Session Persistence

| Limitation | Description |
|------------|-------------|
| IndexedDB | Not saved |
| Cache storage | Not saved |
| Service workers | Not persisted |

---

## YouTube Tab Limitations

### Java Requirement

Java 17+ must be installed:

```bash
# Check Java version
java -version
# openjdk version "17.x.x" required
```

If Java is not found, the YouTube tab shows an error.

### NewPipe Limitations

| Feature | Status |
|---------|--------|
| Video playback | ✅ Working |
| Audio only | ✅ Working |
| Download | ✅ Working |
| Comments | ❌ Not supported |
| Playlists | ⚠️ Partial |
| Subscriptions | ❌ Not supported |
| Account login | ❌ Not supported |

---

## Plugin System Limitations

| Limitation | Description |
|------------|-------------|
| No UI components | JavaScript only |
| Limited permissions | Network, storage only |
| No background pages | Runs per page |
| No Chrome APIs | Custom Piggy API only |

---

## Performance Limitations

### Memory Usage

| Scenario | Memory |
|----------|--------|
| Idle browser | ~200-300MB |
| Single tab + capture | ~400-600MB |
| Multiple tabs (5) | ~800MB-1GB |
| Long-running session | May increase over time |

### CPU Usage

| Scenario | CPU |
|----------|-----|
| Idle | 0-2% |
| Navigation | 20-40% |
| Heavy scraping | 30-60% |
| Multiple tabs | 50-80% |

---

## Known Bugs (Being Fixed)

| Issue | Status | Fix Version |
|-------|--------|-------------|
| Memory leak in capture | 🔨 In progress | v0.1.4 |
| Windows socket connection | 🔨 In progress | v0.2.0 |
| Headless mode detection | 🔨 In progress | v0.1.4 |
| Canvas noise pattern | 🔨 In progress | v0.1.4 |

---

## Workarounds

### Site Blocking

```ts
// Use headful mode for blocked sites
await piggy.launch({ binary: "headful" });

// Add delays between requests
await piggy.site.wait(5000);

// Rotate user agents
const userAgents = [...];
const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
await piggy.site.intercept.headers("*", { "User-Agent": randomUA });
```

### Memory Issues

```ts
// Clear capture periodically
await piggy.site.capture.clear();

// Close unused tabs
await piggy.site.close();

// Restart browser for long sessions
setInterval(async () => {
    await piggy.close();
    await piggy.launch();
}, 3600000); // Every hour
```

### Java Not Found

```bash
# Install Java 17
sudo apt install openjdk-17-jre  # Debian/Ubuntu
brew install openjdk@17          # macOS

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

---

## When to Use Alternative Tools

| Use Case | Alternative | Why |
|----------|-------------|-----|
| Cross-browser testing | Playwright | Supports Firefox, Safari |
| Mobile testing | Appium | Real device testing |
| Chrome extension testing | Puppeteer | Native Chrome support |
| Simple static scraping | Cheerio | Lighter weight |
| Python-only stack | curl_cffi | Python native |

---

## Reporting Limitations

Found a limitation not listed?

1. Check [GitHub Issues](https://github.com/BunElysiaReact/nothing-browser/issues)
2. Open a new issue with:
   - Description of the limitation
   - Steps to reproduce
   - Expected vs actual behavior
   - System information

---

## Future Improvements

| Limitation | Target Version | Fix |
|------------|----------------|-----|
| Canvas uniqueness | v0.1.4 | xorshift PRNG |
| Windows native | v0.2.0 | Full Windows support |
| WebGL spoofing | v0.2.0 | Complete WebGL override |
| Captcha solver | v0.3.0 | Built-in solver |
| Memory leaks | v0.1.4 | Proper cleanup |

---

## Summary

Most limitations are:
- **Known and documented**
- **Being actively worked on**
- **Have workarounds available**

For 95% of scraping tasks, Nothing Browser works perfectly. The remaining 5% have alternatives or are being fixed.

---

## Next Steps

- [Build from Source](./build-from-source) — Build your own version
- [TLS Fingerprint Report](./tls-fingerprint) — Technical deep dive
- [Contributing](../community/contributing) — Help fix limitations

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
