# Nothing Private Browser

A privacy-first browser built on **Qt6 + Chromium WebEngine**. No telemetry, no session persistence, no black boxes — just a browser that actually respects you.

---

## Overview

Nothing Private Browser is the privacy-focused sibling of Nothing Browser. It shares the same core engine but with different defaults and features.

| Feature | Nothing Browser | Nothing Private Browser |
|---------|-----------------|------------------------|
| Network capture | ✅ Full DevTools | ❌ Disabled by default |
| Session persistence | ✅ Auto-save | ❌ Zero persistence |
| Telemetry | ✅ None | ✅ None |
| Fingerprint spoofing | ✅ Yes | ✅ Yes |
| WebRTC leak protection | ⚠️ Optional | ✅ Enabled by default |
| Cookie storage | Persistent | Session-only |
| Cache | Persistent | Wiped on close |
| Use case | Scraping/API reverse engineering | Anonymous browsing |

---

## Why Private Browser?

Most browsers claim to be private but:

- Send telemetry to母公司
- Store browsing history
- Keep cookies after you close
- Leak your real IP via WebRTC
- Have unique fingerprints

Nothing Private Browser solves all of these.

---

## Key Features

### Zero Telemetry

```cpp
// No analytics, no phoning home
// No crash reporting
// No usage metrics
// Nothing
```

The browser does exactly one thing: render web pages. Nothing else.

### Zero Session Persistence

On close, everything is wiped:

- ✅ Cookies deleted
- ✅ Cache cleared
- ✅ localStorage emptied
- ✅ sessionStorage cleared
- ✅ History removed
- ✅ IndexedDB purged

```cpp
// On close
void PrivateBrowser::closeEvent() {
    m_profile->cookieStore()->deleteAllCookies();
    m_profile->clearHttpCache();
    m_profile->clearAllVisitedLinks();
    m_storageManager->clearAll();
}
```

### Fingerprint Spoofing

Same as Nothing Browser — injected at DocumentCreation:

- Chrome User-Agent
- Spoofed hardware concurrency
- Spoofed device memory
- Canvas noise (xorshift PRNG)
- Audio noise
- WebGL vendor/renderer spoofing

### WebRTC Leak Protection

STUN servers are stripped from ICE config:

```cpp
// Before: Your real IP exposed
iceServers: [{ urls: "stun:stun.l.google.com:19302" }]

// After: STUN servers removed
iceServers: []  // Your real IP never leaks
```

### UA-CH Spoofing

`navigator.userAgentData` and `getHighEntropyValues()` return consistent spoofed values:

```javascript
navigator.userAgentData.brands
// [{brand: "Chromium", version: "124"}, ...]

await navigator.userAgentData.getHighEntropyValues(["architecture", "model"])
// {architecture: "x86", model: "MacBookPro18,1", ...}
```

---

## Installation

### Linux (Debian/Ubuntu)

```bash
# Add repository
curl -fsSL https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev/nothing-browser-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/nothing-browser.gpg

echo 'deb [signed-by=/usr/share/keyrings/nothing-browser.gpg] https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev stable main' \
  | sudo tee /etc/apt/sources.list.d/nothing-browser.list

# Install
sudo apt update && sudo apt install nothing-private-browser
```

### Linux (.deb)

```bash
sudo dpkg -i nothing-private-browser_*_amd64.deb
```

### Linux (tar.gz)

```bash
tar -xzf nothing-private-browser-*-linux-x86_64.tar.gz
cd nothing-private-browser-*-linux-x86_64
./nothing-private-browser
```

### Arch Linux

```bash
yay -S nothing-private-browser
```

### macOS

Download the `.dmg` from [Releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases) → drag to Applications.

### Windows

Download the `.zip` from [Releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases) → extract → run `nothing-private-browser.exe`.

---

## Privacy Features Deep Dive

### Cookie Management

Cookies are session-only by default:

```cpp
// No persistent cookie storage
m_profile->setPersistentStoragePath("");
m_profile->setPersistentCookiesPolicy(
    QWebEngineProfile::NoPersistentCookies
);
```

### Cache Behavior

Cache is cleared on every close:

```cpp
void PrivateBrowser::clearCache() {
    m_profile->clearHttpCache();
    m_profile->clearAllVisitedLinks();
    m_profile->clearRequestFilter();
}
```

### Storage Isolation

Each session gets fresh storage:

```cpp
// New storage for each session
m_profile = new QWebEngineProfile("PrivateSession_" + QUuid::createUuid().toString());
```

---

## Planned Features

### Ad Blocker (v0.2.0)

Network-level, filter-list based ad blocking:

```cpp
// Coming soon
class AdBlocker : public QWebEngineUrlRequestInterceptor {
    void interceptRequest(QWebEngineUrlRequestInfo &info) override {
        if (isAdDomain(info.requestUrl().host())) {
            info.block(true);
        }
    }
};
```

### Tor Routing (v0.3.0)

Optional onion routing, one toggle:

```cpp
// Coming soon
void enableTor() {
    m_profile->setProxy(QNetworkProxy::Socks5Proxy, "127.0.0.1", 9050);
    // Route all traffic through Tor
}
```

### ProtonVPN Support (v0.3.0)

Import `.ovpn` or WireGuard config file directly:

```cpp
// Coming soon
void importVPNConfig(const QString& filePath) {
    // Parse OpenVPN or WireGuard config
    // Configure system VPN
    // Route browser traffic through VPN
}
```

---

## Comparison with Other Privacy Browsers

| Feature | Nothing Private | Brave | Firefox | Tor Browser |
|---------|-----------------|-------|---------|-------------|
| Zero telemetry | ✅ Yes | ⚠️ Some | ⚠️ Some | ✅ Yes |
| Fingerprint spoofing | ✅ Yes | ✅ Yes | ⚠️ Limited | ✅ Yes |
| Session persistence | ❌ None | ⚠️ Optional | ⚠️ Persistent | ❌ None |
| WebRTC leak protection | ✅ Yes | ✅ Yes | ⚠️ Partial | ✅ Yes |
| Built-in ad blocker | 📋 Planned | ✅ Yes | ⚠️ Extension | ✅ Yes |
| Tor integration | 📋 Planned | ⚠️ Private mode | ❌ No | ✅ Yes |
| Open source | ✅ MIT | ✅ MPL | ✅ MPL | ✅ BSD |

---

## Limitations

### Sites That May Not Work

| Site | Status | Reason |
|------|--------|--------|
| Google Search | ⚠️ May block | Fingerprinting |
| Gmail | ⚠️ May block | Account protection |
| Facebook | ⚠️ Often blocks | Bot detection |
| Banking sites | ⚠️ May block | Security measures |
| Cloudflare sites | ✅ Works | TLS matches Chrome |

### Known Limitations

| Limitation | Description |
|------------|-------------|
| No Chrome extensions | Qt WebEngine limitation |
| No mobile emulation | Desktop-only |
| No sync across devices | Privacy by design |
| No password manager | Session-only storage |

---

## Privacy Audit Status

| Component | Status | Last Audit |
|-----------|--------|------------|
| Telemetry | ✅ None | v0.1.0 |
| Data persistence | ✅ Wiped on close | v0.1.0 |
| Fingerprint spoofing | ⚠️ In progress | v0.1.3 |
| WebRTC leaks | ✅ Fixed | v0.1.1 |
| DNS leaks | ⚠️ Needs VPN | v0.3.0 planned |

---

## Roadmap

| Version | Focus | Features |
|---------|-------|----------|
| v0.1.0 | Core privacy | Zero telemetry, session wipe |
| v0.1.1 | Network leaks | WebRTC protection |
| v0.1.2 | Fingerprinting | UA-CH spoofing |
| v0.1.3 | Canvas/Audio | xorshift PRNG noise |
| v0.2.0 | Ad blocking | Network-level filter lists |
| v0.3.0 | Anonymity | Tor routing, VPN support |
| v1.0.0 | Stable | Full privacy audit |

---

## Quick Start

### First Launch

```bash
# Linux
nothing-private-browser

# macOS
open /Applications/Nothing\ Private\ Browser.app

# Windows
nothing-private-browser.exe
```

The browser opens with:
- Fresh session (no previous data)
- Fingerprint spoofing enabled
- WebRTC protection on
- No telemetry

### Using the Browser

1. **Browse normally** — all privacy features work automatically
2. **Close the browser** — everything is wiped
3. **Reopen** — fresh session, no traces

No settings to configure. No privacy toggles to find. It just works.

---

## Image Assets Notice

Some image assets used in this project are sourced externally and may be subject to third-party rights.

If a DMCA or copyright complaint is filed against any asset, it will be removed promptly. Assets are not guaranteed to stay in the repo permanently — if you depend on specific images in a fork, host your own copies.

---

## License

MIT License — use it, modify it, fork it. Just don't add telemetry.

---

## Next Steps

- [Privacy Features](./privacy) — Deep dive into privacy protections
- [Installation](./installation) — Detailed install guides
- [Roadmap](./roadmap) — Upcoming features

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*

*Built by Ernest Tech House*
