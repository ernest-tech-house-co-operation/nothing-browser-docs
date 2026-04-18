# 🎨 Fingerprint Spoofing

Spoof browser fingerprints to avoid tracking and bypass detection. Piggy provides built-in fingerprint spoofing that works at the engine level.

---

## Overview

Fingerprint spoofing in Piggy happens at **DocumentCreation** phase — before any page JavaScript runs. This means:

- Spoofed values are present when page scripts first execute
- Cannot be detected by checking "when" properties were set
- Consistent across iframes and subframes

| Spoofed Property | What It Does | Bypasses |
|------------------|--------------|----------|
| `navigator.webdriver` | Removes automation flag | Bot detection |
| `navigator.plugins` | Spoofs Chrome plugins | Plugin detection |
| `navigator.languages` | Sets realistic languages | Language fingerprinting |
| `WebGL` | Spoofs vendor/renderer | GPU fingerprinting |
| `Canvas` | Adds per-pixel noise | Canvas fingerprinting |
| `Audio` | Adds inaudible noise | Audio fingerprinting |
| `Screen` | Reports real dimensions | Screen resolution tracking |
| `Battery` | Spoofs battery API | Battery fingerprinting |

---

## Basic Usage

Fingerprint spoofing is **automatic** — no configuration needed.

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Fingerprint is already spoofed!
await piggy.site.navigate();

// Check the spoofed values
const fingerprint = await piggy.site.evaluate(() => ({
  webdriver: navigator.webdriver,
  plugins: navigator.plugins.length,
  languages: navigator.languages,
  webglVendor: document.createElement('canvas').getContext('webgl')?.getParameter(37445),
  hardwareConcurrency: navigator.hardwareConcurrency,
  deviceMemory: (navigator as any).deviceMemory
}));

console.log("Spoofed fingerprint:", fingerprint);
```

---

## What Gets Spoofed

### 1. Navigator Properties

```ts
// These are automatically spoofed
await piggy.site.evaluate(() => {
  console.log(navigator.webdriver);        // undefined
  console.log(navigator.plugins.length);   // 3 (Chrome PDF, PDF Viewer, Native Client)
  console.log(navigator.languages);        // ['en-US', 'en']
  console.log(navigator.maxTouchPoints);   // 0
  console.log(navigator.vendor);           // "Google Inc."
});
```

### 2. Screen Properties

```ts
await piggy.site.evaluate(() => {
  console.log(screen.width);        // Real screen width
  console.log(screen.height);       // Real screen height
  console.log(screen.availWidth);   // Real width
  console.log(screen.availHeight);  // Real height - 40 (taskbar)
  console.log(screen.colorDepth);   // 24
  console.log(devicePixelRatio);    // Real DPI ratio
});
```

### 3. WebGL Spoofing

```ts
await piggy.site.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  
  // These return spoofed values (Intel, not real GPU)
  console.log(gl?.getParameter(37445)); // UNMASKED_VENDOR_WEBGL → "Intel Inc."
  console.log(gl?.getParameter(37446)); // UNMASKED_RENDERER_WEBGL → "Intel Iris OpenGL Engine"
});
```

### 4. Canvas Fingerprint Noise

```ts
// Canvas gets per-pixel ±1 noise using xorshift PRNG
// Same seed per session, different across sessions
await piggy.site.evaluate(() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, 100, 100);
  const data1 = ctx.getImageData(0, 0, 100, 100).data;
  
  // Different session = different fingerprint
  // But consistent within same session
});
```

### 5. Audio Fingerprint Noise

```ts
// AudioBuffer adds ±0.00000005 noise per sample
// Inaudible, but changes hash
await piggy.site.evaluate(() => {
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  // Audio fingerprint will be noised
});
```

---

## Custom Fingerprint Configuration

### Override Specific Values

```ts
// Add custom fingerprint overrides via init script
await piggy.site.addInitScript(`
  // Custom hardware concurrency
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8
  });
  
  // Custom device memory
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 8
  });
  
  // Custom platform
  Object.defineProperty(navigator, 'platform', {
    get: () => 'Win32'
  });
  
  // Custom timezone
  Object.defineProperty(Intl, 'DateTimeFormat', {
    value: new Proxy(Intl.DateTimeFormat, {
      construct(target, args) {
        if (args[0] === undefined) {
          args[0] = 'America/New_York';
        }
        return new target(...args);
      }
    })
  });
`);
```

### Randomize Per Session

```ts
// Generate random fingerprint values per session
const fingerprint = {
  hardwareConcurrency: [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)],
  deviceMemory: [4, 8, 16][Math.floor(Math.random() * 3)],
  platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)],
  timezone: ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'][Math.floor(Math.random() * 4)]
};

await piggy.site.addInitScript(`
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => ${fingerprint.hardwareConcurrency}
  });
  
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => ${fingerprint.deviceMemory}
  });
  
  Object.defineProperty(navigator, 'platform', {
    get: () => '${fingerprint.platform}'
  });
`);
```

---

## Testing Your Fingerprint

### 1. Basic Fingerprint Check

```ts
async function checkFingerprint(site: any) {
  return await site.evaluate(() => ({
    // Navigator
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    languages: navigator.languages,
    webdriver: navigator.webdriver,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    vendorSub: (navigator as any).vendorSub,
    productSub: (navigator as any).productSub,
    
    // Screen
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: devicePixelRatio
    },
    
    // Plugins
    plugins: Array.from(navigator.plugins).map(p => p.name),
    mimeTypes: navigator.mimeTypes.length,
    
    // WebGL
    webgl: (() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return null;
      return {
        vendor: gl.getParameter(37445),
        renderer: gl.getParameter(37446)
      };
    })(),
    
    // Canvas
    canvas: (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.fillRect(0, 0, 200, 200);
      return canvas.toDataURL().substring(0, 100);
    })()
  }));
}

const fingerprint = await checkFingerprint(piggy.site);
console.log("Fingerprint:", fingerprint);
```

### 2. Test on Fingerprint Sites

```ts
const testSites = [
  "https://amiunique.org/fingerprint",
  "https://fingerprintjs.com/demo",
  "https://deviceandbrowserinfo.com",
  "https://www.creepjs.com",
  "https://browserleaks.com/canvas",
  "https://browserleaks.com/webgl"
];

for (const url of testSites) {
  await piggy.site.navigate(url);
  await piggy.site.wait(3000);
  await piggy.site.screenshot(`./fingerprint-test-${Date.now()}.png`);
  console.log(`Tested: ${url}`);
}
```

---

## Fingerprint Persistence

### Save Fingerprint Identity

```ts
import { writeFileSync, readFileSync, existsSync } from "fs";

const IDENTITY_FILE = "./browser-identity.json";

// Save current fingerprint identity
async function saveIdentity(site: any) {
  const fingerprint = await site.evaluate(() => ({
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    platform: navigator.platform,
    languages: navigator.languages
  }));
  
  writeFileSync(IDENTITY_FILE, JSON.stringify(fingerprint, null, 2));
  console.log("💾 Fingerprint identity saved");
}

// Load and restore fingerprint identity
async function loadIdentity(site: any) {
  if (!existsSync(IDENTITY_FILE)) return false;
  
  const identity = JSON.parse(readFileSync(IDENTITY_FILE, "utf8"));
  
  await site.addInitScript(`
    Object.defineProperty(navigator, 'userAgent', {
      get: () => '${identity.userAgent}'
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => ${identity.hardwareConcurrency}
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => ${identity.deviceMemory}
    });
  `);
  
  console.log("🔄 Fingerprint identity restored");
  return true;
}
```

---

## Advanced: Canvas Fingerprint Control

```ts
// Canvas noise is automatic, but you can customize
await piggy.site.addInitScript(`
  // Custom canvas noise function
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  
  CanvasRenderingContext2D.prototype.getImageData = function(x, y, w, h) {
    const imageData = originalGetImageData.call(this, x, y, w, h);
    const data = imageData.data;
    
    // Add custom noise pattern
    for (let i = 0; i < data.length; i += 4) {
      // Only modify RGB, not alpha
      if (Math.random() < 0.05) {
        data[i] = data[i] ^ (Math.random() * 10);
        data[i+1] = data[i+1] ^ (Math.random() * 10);
        data[i+2] = data[i+2] ^ (Math.random() * 10);
      }
    }
    
    return imageData;
  };
`);
```

---

## Advanced: WebGL Spoofing

```ts
await piggy.site.addInitScript(`
  // Full WebGL spoofing
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // Spoofed vendor
    if (parameter === 37445) return 'Intel Inc.';
    
    // Spoofed renderer
    if (parameter === 37446) return 'Intel Iris OpenGL Engine';
    
    // Spoofed renderer info
    if (parameter === 7936) return 'WebGL Renderer';
    if (parameter === 7937) return 'WebGL Vendor';
    
    // Spoofed extensions
    if (parameter === 7939) return ['ANGLE_instanced_arrays', 'EXT_blend_minmax'];
    
    return getParameter.call(this, parameter);
  };
  
  // Also spoof WebGL2
  const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
  WebGL2RenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return 'Intel Inc.';
    if (parameter === 37446) return 'Intel Iris OpenGL Engine';
    return getParameter2.call(this, parameter);
  };
`);
```

---

## Advanced: Font Fingerprinting

```ts
// Spoof available fonts
await piggy.site.addInitScript(`
  const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
  
  CanvasRenderingContext2D.prototype.measureText = function(text) {
    const result = originalMeasureText.call(this, text);
    
    // Add small variation to font metrics
    result.width = result.width * (1 + (Math.random() - 0.5) * 0.01);
    
    return result;
  };
`);
```

---

## Limitations

| Limitation | Explanation |
|------------|-------------|
| **Canvas uniqueness 99.98%** | Not 100% unique, but enough for most cases |
| **WebGL limitations** | Some advanced WebGL features not spoofed |
| **Font detection** | System fonts still detectable |
| **Timezone** | Can be detected via Date() object |

---

## API Reference

| Method | Description |
|--------|-------------|
| `site.addInitScript(js)` | Add custom fingerprint overrides |
| `piggy.launch()` | Fingerprint spoofing auto-enabled |

---

## Next Steps

- [Anti-Detection](./anti-detection) — Complete anti-detection guide
- [Human Mode](./human-mode) — Add human-like behavior
- [TLS Fingerprint Report](../technical/tls-fingerprint) — Technical TLS details

---