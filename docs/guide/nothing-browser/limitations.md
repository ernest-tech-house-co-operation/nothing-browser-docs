# Known Limitations

Honest and transparent list of Nothing Browser's current limitations. Know what to expect before you start.

---

## Sites That Block Nothing Browser

Google properties (Search, Gmail, YouTube via browser), Facebook, and banking sites **will block or degrade** functionality. These sites use advanced browser fingerprinting that goes beyond what Nothing Browser currently spoofs.

| Site/Service | Status | Reason |
|--------------|--------|--------|
| **Google Search** | ⚠️ May block | Advanced fingerprinting |
| **Gmail** | ⚠️ May block | Account protection |
| **YouTube (browser tab)** | ⚠️ May degrade | Use YOUTUBE tab instead |
| **Facebook** | ⚠️ Often blocks | Bot detection |
| **Banking sites** | ⚠️ Often block | Security measures |
| **Cloudflare protected** | ✅ Usually passes | TLS matches Chrome |

**This is expected.** Nothing Browser is not designed to bypass Google's bot detection in current versions. Use the **YOUTUBE tab** for YouTube — it bypasses this entirely via NewPipe Extractor.

---

## No Chrome Extensions

Chrome extensions are **not supported**.

**Reason:** Qt WebEngine does not have a Chrome extension host.

**Alternative:** Use Nothing Browser's built-in plugin system for JavaScript injection.

---

## Fingerprint Spoofing ≠ Anonymity

Fingerprint spoofing reduces tracking entropy. It does **not** make you invisible.

| What it does | What it doesn't do |
|--------------|-------------------|
| Makes fingerprint less unique | Hide your IP address |
| Bypasses basic fingerprinting | Make you anonymous |
| Prevents cross-site tracking | Bypass login requirements |

**Recommendations:**
- Use a VPN separately if anonymity matters
- Do not store sensitive data in Nothing Browser
- Combine with Tor for advanced anonymity (planned)

---

## Captcha Solver

| Status | Version |
|--------|---------|
| ❌ Not available in current version | v0.1.x |
| 📋 Planned | v0.3.0 |

**Planned support:**
- reCAPTCHA v2
- reCAPTCHA v3
- hCaptcha

---

## Auto-Update and .deb Install

If installed via `.deb` to `/usr/bin`, the auto-updater requires `pkexec` or `sudo` to replace the binary.

| Installation Method | Auto-Update Experience |
|---------------------|------------------------|
| **tar.gz** (portable) | ✅ Seamless — no password |
| **.deb** (system install) | ⚠️ Password prompt via pkexec |

**Recommendation:** Use the `tar.gz` release for seamless in-app updates.

---

## YouTube Tab Requires Java

The YOUTUBE tab uses the NewPipe Extractor JAR bridge. **Java 17+ must be installed.**

### Check Java

```bash
java -version
# openjdk version "17.x.x" required
```

### If Java Not Found

The tab shows a status error: `java not found — install JDK 11+`

### Install Java

```bash
# Debian/Ubuntu
sudo apt install openjdk-17-jre

# Arch
sudo pacman -S jdk17-openjdk

# macOS
brew install openjdk@17

# Windows
# Download from adoptium.net
```

---

## Canvas Uniqueness

| Metric | Current | Target |
|--------|---------|--------|
| Canvas uniqueness | 99.98% | 99.99%+ |
| Detection rate | Very low | Near zero |

The sin() PRNG is being replaced with **xorshift** in upcoming versions to reduce uniqueness further.

---

## TLS Limitations (Qt WebEngine)

| Gap | Severity | Fix Path | Target Version |
|-----|----------|----------|----------------|
| X25519MLKEM768 curve | Low | Qt WebEngine version bump | v0.3.0+ |
| Encrypted Client Hello (ECH) | Low | Custom Qt build required | v0.3.0+ |
| ALPS codepoint 17613 | Low | Qt WebEngine version bump | v0.3.0+ |

**Important:** None of these affect detection by current Cloudflare, Akamai, or DataDome for Chrome 124 impersonation.

---

## Platform Limitations

### Windows Support

| Feature | Status | Target |
|---------|--------|--------|
| Basic browsing | ✅ Working | Current |
| Network capture | ✅ Working | Current |
| YouTube tab | ⚠️ Java required | Current |
| Native installer | 🔨 In progress | v0.2.0 |

### macOS Support

| Feature | Status | Target |
|---------|--------|--------|
| Basic browsing | ✅ Working | Current |
| Network capture | ✅ Working | Current |
| YouTube tab | ⚠️ Java required | Current |
| Apple Silicon native | ⚠️ Rosetta required | v0.2.0 |

### Linux Support

| Feature | Status |
|---------|--------|
| x86_64 | ✅ Full support |
| ARM64 | ⚠️ Community builds |
| Wayland | ⚠️ May have issues (use X11) |

---

## Performance Limitations

### Memory Usage

| Scenario | Memory |
|----------|--------|
| Idle browser | ~200-300MB |
| Single tab + capture | ~400-600MB |
| Multiple tabs (5) | ~800MB-1GB |

### CPU Usage

| Scenario | CPU |
|----------|-----|
| Idle | 0-2% |
| Navigation | 20-40% |
| Heavy scraping | 30-60% |

---

## Plugin System Limitations

| Limitation | Description |
|------------|-------------|
| No UI components | JavaScript only |
| Limited permissions | Network, storage only |
| No background pages | Runs per page |
| No Chrome APIs | Custom Piggy API only |

---

## Workarounds

### Site Blocking

```ts
// Use headful mode for blocked sites
await piggy.launch({ binary: "headful" });

// Add delays between requests
await piggy.site.wait(5000);

// Use YOUTUBE tab for YouTube content
// (instead of BROWSER tab)
```

### Memory Issues

```ts
// Clear capture periodically
await piggy.site.capture.clear();

// Close unused tabs
await piggy.site.close();
```

### Java Not Found

```bash
# Install Java 17
sudo apt install openjdk-17-jre
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

## Summary Table

| Limitation | Status | Fix Version |
|------------|--------|-------------|
| Google/Facebook blocking | ⚠️ Expected | Won't fix (by design) |
| Chrome extensions | ❌ Not supported | Won't fix (Qt limitation) |
| Captcha solver | 📋 Planned | v0.3.0 |
| Canvas uniqueness 99.98% | 🔨 In progress | v0.1.4 |
| X25519MLKEM768 curve | 📋 Planned | v0.3.0 |
| ECH support | 📋 Planned | v0.3.0 |
| Windows installer | 🔨 In progress | v0.2.0 |

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

## Next Steps

- [Build from Source](../technical/build-from-source) — Build your own version
- [TLS Fingerprint Report](../technical/tls-fingerprint) — Technical deep dive
- [Contributing](../community/contributing) — Help fix limitations

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
