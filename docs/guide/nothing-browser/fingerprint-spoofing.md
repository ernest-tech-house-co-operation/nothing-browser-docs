# Fingerprint Spoofing

Nothing Browser injects a spoofing script at `DocumentCreation` phase — before any page JavaScript runs. This makes fingerprinting almost impossible.

---

## Overview

Browser fingerprinting is how websites identify you without cookies. Nothing Browser spoofs the most common fingerprinting vectors.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FINGERPRINT SPOOFING                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Real Machine:                    Spoofed to Website:                       │
│  ┌─────────────────────┐          ┌─────────────────────┐                  │
│  │ CPU: 16 cores       │   ───►   │ CPU: 8 cores        │                  │
│  │ RAM: 32 GB          │   ───►   │ RAM: 8 GB           │                  │
│  │ GPU: NVIDIA RTX     │   ───►   │ GPU: Intel Iris     │                  │
│  │ OS: Linux           │   ───►   │ OS: Windows         │                  │
│  │ Canvas: Unique      │   ───►   │ Canvas: Noised      │                  │
│  │ Audio: Unique       │   ───►   │ Audio: Noised       │                  │
│  └─────────────────────┘          └─────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works

On first launch, `IdentityGenerator` reads real machine values and generates a `BrowserIdentity`:

```cpp
// IdentityGenerator reads real values:
id.cpuCores      = std::thread::hardware_concurrency();   // real CPU
id.ramGb         = readFromProcMeminfo();                  // real RAM, rounded to power of 2
id.screenW/H     = QGuiApplication::primaryScreen()->size();
id.timezone      = QTimeZone::systemTimeZoneId();
id.canvasSeed    = rng->generateDouble();  // random per session
id.audioSeed     = rng->generateDouble();  // random per session
```

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Real values as base** | CPU cores, RAM, screen size come from your machine |
| **Noise added on top** | Canvas and audio get per-session noise |
| **Consistent per session** | Same fingerprint throughout the session |
| **Different across sessions** | New noise seeds = new fingerprint |

**Real values are used as the base. Only the canvas/audio/webgl seeds change each session — so APIs are internally consistent (CreepJS cross-validation passes) but differ across sessions (tracking fails).**

---

## What Is Spoofed

### Navigator Properties

| Property | Real Value | Spoofed Value |
|----------|------------|---------------|
| `navigator.webdriver` | `undefined` (real browser) | `undefined` |
| `navigator.vendor` | `Google Inc.` | `Google Inc.` |
| `navigator.maxTouchPoints` | `0` (desktop) | `0` |
| `navigator.pdfViewerEnabled` | `true` | `true` |
| `navigator.plugins` | Chrome plugins | Chrome PDF Plugin, Viewer, Native Client |
| `navigator.mimeTypes` | `application/pdf`, `text/pdf` | Same |

### Screen Properties

| Property | Real Value | Spoofed Value |
|----------|------------|---------------|
| `screen.width` | Real screen width | Real screen width |
| `screen.height` | Real screen height | Real screen height |
| `screen.availWidth` | Real width | Real width |
| `screen.availHeight` | Real height - 40 (taskbar) | Real height - 40 |
| `screen.colorDepth` | 24 | 24 |
| `devicePixelRatio` | Real DPI ratio | Real DPI ratio |

### Canvas Noise

Canvas reads are intercepted. Each pixel gets ±1 noise using a seeded PRNG:

```javascript
// Seed changes every session — same within a session
function seededRand(seed, index) {
    const x = Math.sin(seed * 9301 + index * 49297 + 233720) * 24601;
    return x - Math.floor(x);
}
```

Both `getImageData` and `toDataURL` are intercepted. The same seed is used for both — so they are internally consistent.

### Audio Noise

`AudioBuffer.getChannelData` and `copyFromChannel` add ±0.00000005 noise per sample using a separate seed:

| Characteristic | Value |
|----------------|-------|
| Noise amount | ±0.00000005 |
| Audibility | Inaudible |
| Detection | Different hash every session |

### WebGL Spoofing

```javascript
// Intercepts getParameter for aliased range params
WebGLRenderingContext.prototype.getParameter  // spoofed
WebGL2RenderingContext.prototype.getParameter // spoofed
```

| Parameter | Real Value | Spoofed Value |
|-----------|------------|---------------|
| UNMASKED_VENDOR_WEBGL | NVIDIA/AMD | `Intel Inc.` |
| UNMASKED_RENDERER_WEBGL | Actual GPU | `Intel Iris OpenGL Engine` |

### Chrome Object

A full `window.chrome` object is injected:

```javascript
window.chrome = {
    runtime: { ... },
    loadTimes: function() { ... },
    csi: function() { ... },
    app: { ... }
};
```

### WebRTC Protection

STUN servers are filtered from `RTCPeerConnection` config to prevent IP leakage:

```javascript
// Before: Your real IP could leak
iceServers: [{ urls: "stun:stun.l.google.com:19302" }]

// After: STUN servers removed
iceServers: []  // No IP leakage
```

### Performance Timer

`performance.now()` is rounded to 0.1ms precision — reduces timing attack surface.

### Battery API

```javascript
navigator.getBattery() // → { charging: true, level: 0.85-1.0, ... }
```

### Timezone

`Intl.DateTimeFormat` is proxied to inject the real system timezone where not specified.

---

## Injection Timing

The fingerprint spoofing script is injected at **DocumentCreation** — before any page JavaScript runs.

```
Timeline:
────────────────────────────────────────────────────────────────────────────►

DocumentCreation     Page JavaScript     User Interaction
       │                    │                   │
       ▼                    ▼                   ▼
  Fingerprint        Page sees already    Everything works
  injected           spoofed values       normally
```

### Why DocumentCreation Matters

| Injection Point | Can Page Detect? | Why |
|-----------------|------------------|-----|
| **DocumentCreation** | ❌ No | Script runs before page code |
| After page load | ⚠️ Maybe | Page can see when values changed |
| Via CDP (Puppeteer) | ✅ Yes | Automation detectable |

**QWebEngineScript with DocumentCreation is architecturally superior to CDP-based injection.**

---

## Session Identity

### Where Identity Is Stored

The identity is saved at:

```
~/.config/nothing-browser/identity.json
```

### Identity File Example

```json
{
  "cpuCores": 8,
  "ramGb": 16,
  "screenWidth": 1920,
  "screenHeight": 1080,
  "timezone": "America/New_York",
  "canvasSeed": 0.123456789,
  "audioSeed": 0.987654321,
  "createdAt": 1700000000000
}
```

### Resetting Identity

To generate a new permanent identity:

```bash
# Delete the identity file
rm ~/.config/nothing-browser/identity.json

# Restart browser — new identity generated
```

**In-app reset button coming in future version.**

---

## Testing Fingerprint

### Online Test Sites

| Site | What It Tests |
|------|---------------|
| [amiunique.org](https://amiunique.org) | Complete fingerprint analysis |
| [browserleaks.com](https://browserleaks.com) | Canvas, WebGL, audio |
| [fingerprintjs.com/demo](https://fingerprintjs.com/demo) | Commercial fingerprinting |
| [creepjs.com](https://creepjs.com) | Advanced detection tests |
| [deviceinfo.me](https://deviceinfo.me) | Device information |

### Manual Test

```javascript
// Run in browser console
console.log({
    webdriver: navigator.webdriver,
    plugins: navigator.plugins.length,
    languages: navigator.languages,
    webglVendor: document.createElement('canvas').getContext('webgl')?.getParameter(37445),
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory
});
```

---

## Comparison with Other Browsers

| Feature | Nothing Browser | Brave | Firefox | Chrome |
|---------|----------------|-------|---------|--------|
| **DocumentCreation injection** | ✅ Yes | ⚠️ Partial | ❌ No | ❌ No |
| **Canvas noise** | ✅ xorshift | ✅ Sin-based | ❌ No | ❌ No |
| **Audio noise** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **WebGL spoofing** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **WebRTC protection** | ✅ Yes | ✅ Yes | ⚠️ Partial | ❌ No |
| **Per-session randomization** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

---

## Known Limitations

| Limitation | Status | Fix Version |
|------------|--------|-------------|
| Canvas uniqueness 99.98% | 🔨 In progress | v0.1.4 |
| `sec-ch-ua` brand format | 🔨 In progress | v0.1.4 |
| `navigator.userAgentData` missing | 🔨 In progress | v0.1.4 |
| WebGL UNMASKED params spoofing | 🔨 In progress | v0.1.4 |

### Why Canvas Uniqueness Isn't 100%

The sin() PRNG is being replaced with xorshift in upcoming versions to improve this.

---

## Enabling / Disabling

Fingerprint spoofing is **always enabled** in Nothing Browser. There is no toggle.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   There is no "disable fingerprint spoofing" button.        │
│                                                             │
│   Privacy is on by default.                                 │
│   Fingerprinting is blocked by default.                     │
│                                                             │
│   If you need real fingerprints, use regular Chrome.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### Injection Code (Simplified)

```javascript
(function() {
    'use strict';
    
    // Spoof navigator properties
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
    
    // Spoof plugins
    Object.defineProperty(navigator, 'plugins', {
        get: () => [
            { name: 'Chrome PDF Plugin' },
            { name: 'Chrome PDF Viewer' },
            { name: 'Native Client' }
        ]
    });
    
    // Spoof WebGL
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter.call(this, parameter);
    };
    
    // Canvas noise
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(x, y, w, h) {
        const imageData = originalGetImageData.call(this, x, y, w, h);
        // Add noise using xorshift
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (seededRand() < 0.5) {
                imageData.data[i] ^= 1;
                imageData.data[i+1] ^= 1;
                imageData.data[i+2] ^= 1;
            }
        }
        return imageData;
    };
})();
```

---

## Next Steps

- [BROWSER Tab](../nothing-browser/browser) — See fingerprint in action
- [DEVTOOLS Tab](../nothing-browser/devtools) — Capture network traffic
- [TLS Fingerprint Report](../technical/tls-fingerprint) — Network-level fingerprinting

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
