# BROWSER Tab

A full Chromium browser. All traffic is automatically captured to DEVTOOLS — no need to open anything.

---

## Overview

The BROWSER tab is where you actually browse the web. Everything you do here is automatically captured in the DEVTOOLS tab.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔒 https://example.com  │  GO  │  🔧 JS  │  🎨 CSS  │  🖼️ IMG  │  ●      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          ┌─────────────────────┐                           │
│                          │                     │                           │
│                          │    Example Domain   │                           │
│                          │                     │                           │
│                          │   This page is for  │                           │
│                          │   illustrative      │                           │
│                          │   purposes.         │                           │
│                          │                     │                           │
│                          └─────────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Toolbar Controls

| Control | Icon | Function | Default |
|---------|------|----------|---------|
| **URL bar** | — | Type or paste any URL, press Enter or click GO | — |
| **GO button** | `GO` | Navigate to URL in address bar | — |
| **JS toggle** | `🔧 JS` | Enable / disable JavaScript | ✅ Enabled |
| **CSS toggle** | `🎨 CSS` | Enable / disable stylesheets | ✅ Enabled |
| **IMG toggle** | `🖼️ IMG` | Enable / disable image loading | ✅ Enabled |
| **Status dot** | `●` | Blue = loading, Green = loaded | — |

### Status Dot Colors

| Color | Meaning |
|-------|---------|
| 🔵 **Blue** | Page is loading |
| 🟢 **Green** | Page has finished loading |
| 🔴 **Red** | Error loading page |

---

## URL Bar Features

### Navigation

```text
# Type any URL and press Enter
https://example.com
example.com
google.com

# Search (if no URL pattern detected)
what is nothing browser
```

### Auto-complete

- Suggests previously visited URLs
- Shows matching bookmarks (if any)

### Security Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔒 | HTTPS (secure) |
| 🔓 | HTTP (not secure) |
| ⚠️ | Invalid certificate |

---

## JavaScript Toggle

Disable JavaScript to:
- Bypass client-side bot detection
- Speed up page loading
- Avoid popups and modals

**Note:** Many modern sites require JavaScript to function. Disable only when needed.

```text
JS Toggle: ON  → JavaScript enabled (default)
JS Toggle: OFF → JavaScript disabled
```

When disabled, the page reloads without JavaScript.

---

## CSS Toggle

Disable stylesheets to:
- View raw HTML structure
- Extract data without styling interference
- Debug layout issues

```text
CSS Toggle: ON  → Stylesheets enabled (default)
CSS Toggle: OFF → Raw unstyled HTML
```

**Example (CSS disabled):**

```
[Heading] Example Domain
[Paragraph] This page is for illustrative purposes.
[Link] More information...
```

---

## Image Toggle

Disable images to:
- Save bandwidth
- Speed up page loading
- Avoid tracking pixels

```text
IMG Toggle: ON  → Images load normally (default)
IMG Toggle: OFF → Images blocked (empty placeholders)
```

**Blocked images show as empty boxes or alt text.**

---

## New Tab Interception

### The Problem

Some sites (especially streaming sites) open new tabs to trigger player URLs. In a normal browser, this would break your capture session.

### The Solution

Nothing Browser **intercepts new tab requests** and loads the URL in the current tab instead.

```
Normal browser:
  Click video → New tab opens → Capture lost ❌

Nothing Browser:
  Click video → URL loads in same tab → Capture continues ✅
```

**This is intentional.** It keeps the capture session intact and prevents the player URL from being missed.

### Technical Details

```cpp
// New tab interception
void BrowserTab::onNewWindowRequest(const QUrl& url) {
    // Instead of opening new tab, navigate current tab
    m_webView->setUrl(url);
    // Capture continues uninterrupted
}
```

---

## Fingerprint Injection

The fingerprint spoofing script is injected at **DocumentCreation** — before any page JavaScript runs.

### Injection Timing

```
Timeline:
────────────────────────────────────────────────────────────►

DocumentCreation     Page JavaScript     User Interaction
       │                    │                   │
       ▼                    ▼                   ▼
  Fingerprint        Page sees already    Everything works
  injected           spoofed values       normally
```

### What Gets Spoofed

| Property | Spoofed Value |
|----------|---------------|
| `navigator.webdriver` | `undefined` |
| `navigator.plugins` | Chrome plugins (PDF, etc.) |
| `navigator.languages` | `['en-US', 'en']` |
| WebGL vendor | `Intel Inc.` |
| Canvas | Per-pixel noise (xorshift) |
| Audio | ±0.00000005 noise |

### Scope

- ✅ Every page
- ✅ All iframes
- ✅ All sub-frames
- ✅ All navigations

[Full Fingerprint Spoofing documentation →](./fingerprint-spoofing)

---

## Known Blocks

The following sites actively detect non-standard browsers and may block or degrade functionality:

| Site | Status | Reason |
|------|--------|--------|
| **Google Search** | ⚠️ May block | Advanced fingerprinting |
| **Gmail** | ⚠️ May block | Account protection |
| **Google Drive** | ⚠️ May block | Security measures |
| **Facebook** | ⚠️ Often blocks | Bot detection |
| **Instagram** | ⚠️ Often blocks | Bot detection |
| **WhatsApp Web** | ⚠️ May degrade | Automation detection |
| **Banking sites** | ⚠️ Often block | Security policies |
| **Netflix** | ⚠️ May block | DRM requirements |
| **Spotify Web** | ⚠️ May work | Less strict |

### Why They Block

These sites use multiple detection methods:

1. **TLS fingerprint** — JA3/JA4 (Nothing Browser passes this)
2. **JavaScript properties** — `navigator.webdriver`, `chrome.runtime`
3. **Behavioral analysis** — Mouse movements, typing patterns
4. **Canvas/WebGL fingerprinting** — GPU rendering patterns

### Workarounds

| Solution | When to Use |
|----------|-------------|
| Use **headful mode** | Sites detecting headless |
| Enable **human mode** | Behavioral detection |
| Use **YOUTUBE tab** | For YouTube content |
| Try **Private Browser** | Different fingerprint profile |

**This is expected behavior.** These sites go beyond standard bot detection.

---

## Navigation Tips

### Back/Forward

- Use mouse buttons (if available)
- Right-click → Back/Forward
- No toolbar buttons (use keyboard or mouse)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Focus URL bar |
| `Ctrl+R` | Reload page |
| `Ctrl+Shift+R` | Hard reload (ignore cache) |
| `Alt+←` | Go back |
| `Alt+→` | Go forward |
| `Ctrl+F` | Find in page |
| `Ctrl+Shift+J` | Open DEVTOOLS |

### Reload Types

| Action | Effect |
|--------|--------|
| Normal reload | Load from cache if available |
| Hard reload (Ctrl+Shift+R) | Ignore cache, fresh request |

---

## Capture Integration

Everything in the BROWSER tab is automatically captured:

| Action | Captured In |
|--------|-------------|
| Page navigation | NETWORK tab |
| API calls | NETWORK tab |
| WebSocket messages | WS tab |
| Cookies set | COOKIES tab |
| Storage writes | STORAGE tab |

**You don't need to do anything.** Capture runs automatically.

---

## Troubleshooting

### Page Not Loading

**Solutions:**
- Check URL is correct
- Check internet connection
- Try disabling JS/CSS/IMG toggles
- Check status dot color

### Capture Not Showing

**Solutions:**
- Switch to DEVTOOLS tab
- Check you're on the right sub-tab (NETWORK, WS, etc.)
- Click CLEAR and try again

### Site Looks Wrong

**Solutions:**
- Check CSS toggle is ON
- Check JS toggle is ON (sites need JS)
- Try reloading the page

### Site Detects Automation

**Solutions:**
- Use headful mode: `binary: "headful"`
- Enable human mode: `piggy.actHuman(true)`
- Try Private Browser for better anonymity

---

## Next Steps

- [DEVTOOLS Tab](./devtools) — View captured traffic
- [Fingerprint Spoofing](./fingerprint-spoofing) — Anti-detection details
- [Network Inspector](./network-inspector) — HTTP request analysis

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
