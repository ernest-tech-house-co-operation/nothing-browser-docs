# Fingerprint Spoofing

Nothing Browser injects a spoofing script at `DocumentCreation` phase — before any page JavaScript runs. This is done via `QWebEngineScript` with `MainWorld` context and `RunsOnSubFrames` enabled.

## How It Works

On first launch, `IdentityGenerator` reads real machine values and generates a `BrowserIdentity`. Noise seeds are randomised per session. The identity is saved to `~/.config/nothing-browser/identity.json` and reused across sessions — making the fingerprint consistent for the same machine.

```cpp
// IdentityGenerator reads real values:
id.cpuCores      = std::thread::hardware_concurrency();   // real CPU
id.ramGb         = readFromProcMeminfo();                  // real RAM, rounded to power of 2
id.screenW/H     = QGuiApplication::primaryScreen()->size();
id.timezone      = QTimeZone::systemTimeZoneId();
id.canvasSeed    = rng->generateDouble();  // random per session
id.audioSeed     = rng->generateDouble();  // random per session
```

Real values are used as the base. Only the canvas/audio/webgl seeds change each session — so APIs are internally consistent (CreepJS cross-validation passes) but differ across sessions (tracking fails).

## What Is Spoofed

### Navigator Properties

```js
navigator.webdriver        // → undefined (disabled at engine level)
navigator.vendor           // → "Google Inc."
navigator.maxTouchPoints   // → 0
navigator.pdfViewerEnabled // → true
navigator.plugins          // → Chrome PDF Plugin, Viewer, Native Client
navigator.mimeTypes        // → application/pdf, text/pdf
```

### Screen

```js
screen.width       // → real screen width
screen.height      // → real screen height
screen.availWidth  // → real width
screen.availHeight // → real height - 40 (taskbar)
screen.colorDepth  // → 24
devicePixelRatio   // → real DPI ratio
```

### Canvas Noise

Canvas reads are intercepted. Each pixel gets ±1 noise using a seeded PRNG:

```js
// Seed changes every session — same within a session
function seededRand(seed, index) {
    const x = Math.sin(seed * 9301 + index * 49297 + 233720) * 24601;
    return x - Math.floor(x);
}
```

Both `getImageData` and `toDataURL` are intercepted. The same seed is used for both — so they are internally consistent.

### Audio Noise

`AudioBuffer.getChannelData` and `copyFromChannel` add ±0.00000005 noise per sample using a separate seed. Inaudible. Undetectable by ear. Different hash every session.

### WebGL

```js
// Intercepts getParameter for aliased range params
WebGLRenderingContext.prototype.getParameter  // spoofed
WebGL2RenderingContext.prototype.getParameter // spoofed
```

### Chrome Object

A full `window.chrome` object is injected with `runtime`, `loadTimes`, `csi`, and `app` — matching what a real Chrome page sees.

### WebRTC

STUN servers are filtered from `RTCPeerConnection` config to prevent IP leakage.

### Performance Timer

`performance.now()` is rounded to 0.1ms precision — reduces timing attack surface.

### Battery API

```js
navigator.getBattery() // → { charging: true, level: 0.85-1.0, ... }
```

### Timezone

`Intl.DateTimeFormat` is proxied to inject the real system timezone where not specified.

## Enabling / Resetting Identity

The identity is saved at:

```
~/.config/nothing-browser/identity.json
```

Delete this file and restart to generate a new permanent identity. In-app reset button coming in v0.2.0.

## Known Limitations

Canvas uniqueness is currently 99.98% — the sin() PRNG is being replaced with xorshift in v0.2.0 to improve this. See the [TLS Report](/guide/tls-fingerprint#known-gaps-and-roadmap) for the full gap list.
