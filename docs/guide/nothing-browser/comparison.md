
# Comparison

How Nothing Browser compares to other browsers and scraping tools.

---

## Overview

Nothing Browser is not trying to be everything to everyone. It excels at specific use cases.

| Tool | Best For | Primary Language |
|------|----------|------------------|
| **Nothing Browser** | Scraping, API reverse engineering, privacy | TypeScript/Bun, C++ |
| **Puppeteer** | Chrome automation, testing | JavaScript/Node.js |
| **Playwright** | Cross-browser testing | JS/TS/Python/Java/.NET |
| **Selenium** | Legacy browser automation | Multiple |
| **Brave** | Daily browsing with privacy | C++ |
| **Firefox** | General browsing | C++ |
| **Chrome** | General browsing | C++ |

---

## Nothing Browser vs Puppeteer/Playwright

| Feature | Nothing Browser | Puppeteer | Playwright |
|---------|-----------------|-----------|------------|
| **Primary use** | Scraping, reverse engineering | Testing | Testing |
| **TLS fingerprint** | ✅ Real BoringSSL | ✅ Real BoringSSL | ✅ Real BoringSSL |
| **navigator.webdriver** | ✅ Undefined | ❌ True | ❌ True |
| **Fingerprint spoofing** | ✅ Built-in | ❌ Plugin needed | ❌ Plugin needed |
| **Network capture** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **WebSocket capture** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **One-click export** | ✅ Python/cURL | ❌ No | ❌ No |
| **Built-in API server** | ✅ Yes | ❌ No | ❌ No |
| **Session persistence** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Human mode** | ✅ Built-in | ❌ Manual | ❌ Manual |
| **Lines of code to scrape** | ~20 | 80-200 | 80-200 |
| **Imports needed** | 1 | 5-10 | 5-10 |

### Summary

| Aspect | Winner |
|--------|--------|
| **Easiest to use for scraping** | Nothing Browser |
| **Best for testing** | Playwright |
| **Best for simple automation** | Puppeteer |

---

## Nothing Browser vs Privacy Browsers

| Feature | Nothing Browser | Brave | Firefox (hardened) | Tor Browser |
|---------|-----------------|-------|--------------------|-------------|
| **Zero telemetry** | ✅ Yes | ⚠️ Some | ⚠️ Some | ✅ Yes |
| **Fingerprint spoofing** | ✅ Yes | ✅ Yes | ⚠️ Limited | ✅ Yes |
| **Session persistence** | ✅ Optional | ⚠️ Optional | ⚠️ Persistent | ❌ None |
| **WebRTC protection** | ✅ Yes | ✅ Yes | ⚠️ Partial | ✅ Yes |
| **Built-in ad blocker** | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Tor integration** | ❌ No | ⚠️ Private mode | ❌ No | ✅ Yes |
| **Network capture** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Scraping features** | ✅ Yes | ❌ No | ❌ No | ❌ No |

### Summary

| Aspect | Winner |
|--------|--------|
| **Best for privacy + scraping** | Nothing Browser |
| **Best for daily private browsing** | Brave |
| **Best for anonymity** | Tor Browser |

---

## Nothing Browser vs Scraping Libraries

| Feature | Nothing Browser | curl_cffi | requests | Scrapy |
|---------|-----------------|-----------|----------|--------|
| **TLS fingerprint** | ✅ Real BoringSSL | ✅ Patched BoringSSL | ❌ OpenSSL | ❌ OpenSSL |
| **JavaScript execution** | ✅ Yes (full browser) | ❌ No | ❌ No | ❌ No |
| **Cookie handling** | ✅ Automatic | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| **Session persistence** | ✅ Built-in | ❌ No | ⚠️ Manual | ⚠️ Manual |
| **Human mode** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Speed** | Medium | Fast | Fast | Fast |
| **Resource usage** | High | Low | Low | Low |

### Summary

| Aspect | Winner |
|--------|--------|
| **Best for JS-heavy sites** | Nothing Browser |
| **Best for simple APIs** | curl_cffi / requests |
| **Best for large-scale scraping** | Scrapy (with proper setup) |

---

## Detailed Comparisons

### TLS Fingerprint

| Tool | TLS Library | JA3 Status | Cloudflare |
|------|-------------|------------|------------|
| **Nothing Browser** | BoringSSL (real) | Chrome-identical | ✅ Passes |
| Puppeteer | BoringSSL (real) | Chrome-identical | ⚠️ JS leaks |
| Playwright | BoringSSL (real) | Chrome-identical | ⚠️ JS leaks |
| curl_cffi | BoringSSL (patched) | Chrome-identical | ✅ Passes |
| requests | OpenSSL | Python JA3 | ❌ Blocked |
| Scrapy | OpenSSL | Python JA3 | ❌ Blocked |

### JavaScript Detection

| Tool | navigator.webdriver | chrome.runtime | DocumentCreation injection |
|------|---------------------|----------------|---------------------------|
| **Nothing Browser** | ✅ Undefined | ✅ Present | ✅ Yes |
| Puppeteer | ❌ True | ❌ Absent | ⚠️ Partial |
| Playwright | ❌ True | ❌ Absent | ⚠️ Partial |
| Selenium | ❌ True | ❌ Absent | ❌ No |

### Ease of Use (Scraping Example)

**Nothing Browser (~20 lines):**
```ts
import piggy from "nothing-browser";

await piggy.launch();
await piggy.register("site", "https://example.com");
await piggy.site.navigate();
const data = await piggy.site.evaluate(() => ({
    title: document.title,
    content: document.body.innerText
}));
await piggy.close();
```

**Puppeteer (~80+ lines):**
```ts
import puppeteer from 'puppeteer';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerExtra from 'puppeteer-extra';

puppeteerExtra.use(stealthPlugin());
const browser = await puppeteerExtra.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const data = await page.evaluate(() => ({
    title: document.title,
    content: document.body.innerText
}));
await browser.close();
```

---

## When to Use Nothing Browser

### ✅ Good For

| Use Case | Why |
|----------|-----|
| **Web scraping** | Built-in anti-detection, session persistence |
| **API reverse engineering** | Network capture, one-click export |
| **Bot development** | Human mode, fingerprint spoofing |
| **Privacy research** | Zero telemetry, fingerprint analysis |
| **Debugging web apps** | Full network/WebSocket capture |

### ❌ Not Ideal For

| Use Case | Better Alternative |
|----------|---------------------|
| **Cross-browser testing** | Playwright |
| **Chrome extension testing** | Puppeteer |
| **Mobile testing** | Appium |
| **Simple API calls** | curl_cffi / requests |
| **Large-scale distributed scraping** | Scrapy with custom setup |
| **Daily general browsing** | Brave / Firefox |

---

## Performance Comparison

| Metric | Nothing Browser | Puppeteer | Playwright | curl_cffi |
|--------|-----------------|-----------|------------|-----------|
| **Startup time** | ~2-3s | ~1-2s | ~1-2s | ~0.1s |
| **Memory usage (idle)** | ~200-300MB | ~150-250MB | ~150-250MB | ~50MB |
| **Memory per tab** | ~100-200MB | ~80-150MB | ~80-150MB | N/A |
| **Request speed** | Real browser | Real browser | Real browser | Very fast |
| **JS execution** | Full Chromium | Full Chromium | Full Chromium | N/A |

---

## Feature Matrix

| Feature | Nothing Browser | Puppeteer | Playwright | Brave | curl_cffi |
|---------|-----------------|-----------|------------|-------|-----------|
| **Headless mode** | ✅ | ✅ | ✅ | ❌ | N/A |
| **Headful mode** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Multiple tabs** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Multiple profiles** | ✅ | ⚠️ | ⚠️ | ✅ | N/A |
| **Network interception** | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| **Request blocking** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Cookie management** | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Screenshot** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PDF generation** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mobile emulation** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Geolocation spoofing** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Zero telemetry** | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |

---

## Cost Comparison

| Tool | License | Cost |
|------|---------|------|
| **Nothing Browser** | MIT | Free |
| Puppeteer | Apache 2.0 | Free |
| Playwright | Apache 2.0 | Free |
| Selenium | Apache 2.0 | Free |
| Brave | MPL 2.0 | Free |
| curl_cffi | MIT | Free |

**All tools listed are open source and free.**

---

## Community & Support

| Tool | GitHub Stars | Active Contributors | Documentation |
|------|--------------|---------------------|---------------|
| **Nothing Browser** | Growing | 1 (solo dev) | ✅ Full |
| Puppeteer | 86k+ | 100+ | ✅ Excellent |
| Playwright | 60k+ | 150+ | ✅ Excellent |
| Selenium | 29k+ | 500+ | ✅ Extensive |
| Brave | 16k+ | 200+ | ✅ Good |
| curl_cffi | 3k+ | 10+ | ✅ Good |

---

## Summary Table

| If you need... | Choose... |
|----------------|-----------|
| **Scraping with anti-detection** | Nothing Browser |
| **Testing Chrome extensions** | Puppeteer |
| **Cross-browser testing** | Playwright |
| **Legacy browser automation** | Selenium |
| **Daily private browsing** | Brave |
| **Simple Python API calls** | curl_cffi |
| **Large-scale scraping** | Scrapy |
| **API reverse engineering** | Nothing Browser |

---

## The Bottom Line

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Nothing Browser is the best choice for:                                   │
│                                                                             │
│   ✓ Web scraping with anti-detection                                        │
│   ✓ API reverse engineering                                                 │
│   ✓ Bot development                                                         │
│   ✓ Privacy research                                                        │
│   ✓ Network/WebSocket debugging                                             │
│                                                                             │
│   Not the best choice for:                                                  │
│                                                                             │
│   ✗ Cross-browser testing                                                   │
│   ✗ Mobile testing                                                          │
│   ✗ Daily general browsing                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- [What is Nothing](../what-is-nothing) — Ecosystem overview
- [Piggy Quick Start](../piggy/quickstart) — Start scraping in 5 minutes
- [Nothing Browser Features](./browser.md) — Explore the browser

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
