# Privacy Features

Deep dive into the privacy protections built into Nothing Private Browser.

---

## Overview

Nothing Private Browser has **zero telemetry, zero session persistence, and zero black boxes**. Every privacy feature is enabled by default — no configuration required.

| Feature | Status | Description |
|---------|--------|-------------|
| Zero telemetry | ✅ Enabled | No analytics, no phoning home |
| Session wiping | ✅ Enabled | Everything deleted on close |
| Fingerprint spoofing | ✅ Enabled | Chrome-identical fingerprint |
| WebRTC leak protection | ✅ Enabled | Real IP never exposed |
| UA-CH spoofing | ✅ Enabled | Modern fingerprinting blocked |
| Ad blocking | 📋 Planned | Network-level filter lists |
| Tor routing | 📋 Planned | Optional onion routing |
| VPN integration | 📋 Planned | Import .ovpn/WireGuard |

---

## Zero Telemetry

Nothing Private Browser sends **zero data** anywhere.

### What's Not Collected

```cpp
// NOTHING is collected:
// ❌ No usage metrics
// ❌ No crash reports
// ❌ No browsing history
// ❌ No search queries
// ❌ No device information
// ❌ No IP addresses
// ❌ No timestamps
// ❌ Nothing
```

### No "Phone Home" Calls

```cpp
// No calls to:
// • google-analytics.com
// • crashlytics.com
// • sentry.io
// • Any external servers

// The browser only connects to sites YOU visit
```

### Comparison

| Browser | Telemetry | Phone Home |
|---------|-----------|------------|
| **Nothing Private** | ❌ None | ❌ None |
| Chrome | ✅ Yes | ✅ Yes |
| Firefox | ⚠️ Some | ⚠️ Some |
| Brave | ⚠️ Some | ⚠️ Some |
| Safari | ⚠️ Some | ✅ Yes |

---

## Zero Session Persistence

Everything is wiped when you close the browser.

### What Gets Wiped

| Item | Status | On Close |
|------|--------|----------|
| Cookies | ✅ Deleted | Immediately |
| Cache | ✅ Cleared | Immediately |
| localStorage | ✅ Emptied | Immediately |
| sessionStorage | ✅ Emptied | Immediately |
| Browsing history | ✅ Removed | Immediately |
| IndexedDB | ✅ Purged | Immediately |
| Service workers | ✅ Unregistered | Immediately |
| Site permissions | ✅ Reset | Immediately |

### Code Implementation

```cpp
void PrivateBrowser::closeEvent(QCloseEvent* event) {
    // Wipe everything
    m_profile->cookieStore()->deleteAllCookies();
    m_profile->clearHttpCache();
    m_profile->clearAllVisitedLinks();
    m_profile->clearStorage();
    
    // Delete storage files
    QString storagePath = m_profile->storagePath();
    if (QDir(storagePath).exists()) {
        QDir(storagePath).removeRecursively();
    }
    
    // Fresh profile next launch
    m_profile = new QWebEngineProfile("PrivateSession_" + QUuid::createUuid().toString());
}
```

### What This Means

- **Close the browser = fresh start**
- No traces on disk
- No way to recover previous session
- Perfect for sensitive browsing

---

## Fingerprint Spoofing

Nothing Private Browser randomizes browser fingerprints to prevent tracking.

### Spoofed Properties

| Property | Real Value | Spoofed Value |
|----------|------------|---------------|
| User-Agent | Firefox/Chrome version | Chrome 124 |
| Platform | Linux x86_64 | Win32 |
| Hardware concurrency | 16 cores | 8 cores |
| Device memory | 32GB | 8GB |
| WebGL vendor | NVIDIA/AMD | Intel Inc. |
| WebGL renderer | Actual GPU | Intel Iris |
| Canvas fingerprint | Unique | Noised (xorshift) |
| Audio fingerprint | Unique | Noised (±0.00000005) |

### Injection Timing

Spoofing happens at **DocumentCreation** — before any page JavaScript runs:

```cpp
QWebEngineScript script;
script.setInjectionPoint(QWebEngineScript::DocumentCreation);  // Key!
script.setWorldId(QWebEngineScript::MainWorld);
script.setRunsOnSubFrames(true);
```

This means page scripts cannot detect the spoofing — it was "always there."

### Per-Session Randomization

```cpp
// New seeds every session
m_canvasSeed = QRandomGenerator::global()->generateDouble();
m_audioSeed = QRandomGenerator::global()->generateDouble();

// Different fingerprint every session
// Consistent within the same session
```

---

## WebRTC Leak Protection

WebRTC can expose your real IP address even when using a VPN.

### The Problem

```javascript
// Any website can do this
const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
pc.createDataChannel("");
pc.createOffer().then(offer => pc.setLocalDescription(offer));

// Your real IP appears in ICE candidates
pc.onicecandidate = (event) => {
    console.log(event.candidate.candidate); // Real IP exposed!
};
```

### The Solution

```cpp
void WebRTCProtector::interceptRTCPeerConnection() {
    // Strip all STUN servers from ICE config
    QString script = R"(
        const OriginalRTCPeerConnection = window.RTCPeerConnection;
        window.RTCPeerConnection = function(config) {
            // Remove STUN servers
            if (config && config.iceServers) {
                config.iceServers = config.iceServers.filter(
                    server => !server.urls?.includes('stun:')
                );
            }
            return new OriginalRTCPeerConnection(config);
        };
    )";
    
    m_page->runJavaScript(script);
}
```

### Result

| Scenario | Real IP Leaks? |
|----------|----------------|
| Without protection | ✅ Yes (exposed) |
| With protection | ❌ No (blocked) |
| With VPN + protection | ❌ No (VPN IP only) |

---

## UA-CH Spoofing

User-Agent Client Hints (UA-CH) are modern fingerprinting methods.

### What UA-CH Reveals

```javascript
// Sites can request high-entropy values
const hints = await navigator.userAgentData.getHighEntropyValues([
    "architecture",
    "model",
    "platform",
    "platformVersion",
    "uaFullVersion"
]);

// Without spoofing, reveals:
// • CPU architecture (arm64/x86)
// • Device model (MacBookPro18,1)
// • Exact OS version
// • Exact browser version
```

### Spoofed Values

```cpp
QString spoofedUA = R"(
    Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
            brands: [
                { brand: "Chromium", version: "124" },
                { brand: "Not A(Brand", version: "99" }
            ],
            mobile: false,
            platform: "Windows",
            getHighEntropyValues: async (hints) => ({
                architecture: "x86",
                model: "",
                platform: "Windows",
                platformVersion: "10.0",
                uaFullVersion: "124.0.6367.91"
            })
        })
    });
)";
```

---

## DNS Leak Prevention

DNS leaks can reveal your browsing activity even with HTTPS.

### Current Status

| Feature | Status | Version |
|---------|--------|---------|
| DNS over HTTPS | ⚠️ Planned | v0.2.0 |
| DNS leak blocking | ⚠️ Planned | v0.2.0 |
| Custom DNS servers | ⚠️ Planned | v0.2.0 |

### Workaround

Use a VPN or configure system DNS:

```bash
# Linux - use Cloudflare DNS
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
echo "nameserver 1.0.0.1" | sudo tee -a /etc/resolv.conf
```

---

## Ad Blocking (Planned for v0.2.0)

Network-level ad blocking using filter lists.

### Filter List Support

| List | Status |
|------|--------|
| EasyList | 📋 Planned |
| EasyPrivacy | 📋 Planned |
| Peter Lowe's list | 📋 Planned |
| uBlock Origin filters | 📋 Planned |

### Implementation

```cpp
class AdBlocker : public QWebEngineUrlRequestInterceptor {
    void interceptRequest(QWebEngineUrlRequestInfo &info) override {
        QUrl url = info.requestUrl();
        
        // Check against filter lists
        if (m_filterList->isBlocked(url.host(), url.path())) {
            info.block(true);
            return;
        }
        
        info.block(false);
    }
};
```

---

## Tor Routing (Planned for v0.3.0)

Optional onion routing for complete anonymity.

### How It Works

```
Your Computer → Tor Network → Destination
                    │
                    ├── Node 1 (entry)
                    ├── Node 2 (middle)
                    └── Node 3 (exit) → Website
```

### Implementation

```cpp
void enableTor() {
    // Route through Tor SOCKS proxy
    m_profile->setProxy(QNetworkProxy::Socks5Proxy, "127.0.0.1", 9050);
    
    // Disable WebRTC (already done)
    // Disable DNS leaks
    // Disable JavaScript if needed
}
```

### One Toggle

```cpp
// Settings toggle
connect(torToggle, &QCheckBox::toggled, [this](bool enabled) {
    if (enabled) {
        enableTor();
    } else {
        disableTor();
    }
});
```

---

## VPN Integration (Planned for v0.3.0)

Import VPN configurations directly into the browser.

### Supported Formats

| Format | Support |
|--------|---------|
| OpenVPN (.ovpn) | 📋 Planned |
| WireGuard (.conf) | 📋 Planned |
| ProtonVPN | 📋 Planned |

### Import Flow

```cpp
void importVPNConfig(const QString& filePath) {
    if (filePath.endsWith(".ovpn")) {
        importOpenVPN(filePath);
    } else if (filePath.endsWith(".conf")) {
        importWireGuard(filePath);
    }
    
    // Route browser traffic through VPN
    m_profile->setProxy(m_vpnProxy);
}
```

---

## Privacy Settings (None)

There are **no privacy settings to configure**.

```
┌─────────────────────────────────────────────────────────────┐
│                    SETTINGS                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   There is nothing to configure.                            │
│                                                             │
│   Privacy is already enabled.                               │
│   Fingerprinting is already blocked.                        │
│   WebRTC is already protected.                              │
│                                                             │
│   Close the browser when you're done.                       │
│   Everything is wiped automatically.                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Privacy by default. No toggles. No confusion.**

---

## Privacy Audit Checklist

| Check | Status | Evidence |
|-------|--------|----------|
| No telemetry | ✅ Pass | Code audit, network monitoring |
| No persistent storage | ✅ Pass | Storage cleared on close |
| Fingerprint spoofing | ✅ Pass | JA3 matches Chrome |
| WebRTC protection | ✅ Pass | STUN servers stripped |
| UA-CH spoofing | ✅ Pass | getHighEntropyValues spoofed |
| DNS leaks | ⚠️ Partial | VPN required |
| Ad blocking | 📋 Planned | v0.2.0 |
| Tor integration | 📋 Planned | v0.3.0 |

---

## Testing Your Privacy

### Test Your Browser

| Site | What It Tests |
|------|---------------|
| [browserleaks.com](https://browserleaks.com) | WebRTC, canvas, fingerprints |
| [amiunique.org](https://amiunique.org) | Browser fingerprint |
| [ipleak.net](https://ipleak.net) | IP and DNS leaks |
| [deviceinfo.me](https://deviceinfo.me) | Device information |

### Manual Tests

```javascript
// Check WebRTC leak
const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
pc.createDataChannel("");
pc.createOffer().then(offer => pc.setLocalDescription(offer));
pc.onicecandidate = (event) => {
    console.log(event.candidate?.candidate); // Should be empty or no IP
};

// Check fingerprint
console.log(navigator.userAgent);
console.log(navigator.plugins.length);
console.log(navigator.webdriver); // Should be undefined
```

---

## Next Steps

- [Installation](./installation) — Install the browser
- [Roadmap](./roadmap) — Upcoming privacy features
- [Limitations](../technical/limitations) — Known limitations

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
