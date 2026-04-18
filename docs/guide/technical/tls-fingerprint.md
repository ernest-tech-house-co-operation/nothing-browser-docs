# TLS Fingerprint Report

> Researched and authored by Pease Ernest | Ernest Tech House | 2025

## What Is TLS Fingerprinting

Before a single HTTP request is made, every client connecting to a TLS-secured website sends a **ClientHello** message. This message contains the client's supported cipher suites, TLS extensions, elliptic curves, and their exact ordering — before any JavaScript runs, before any User-Agent header is sent.

Bot detection platforms — Cloudflare, Akamai, PerimeterX, DataDome — capture this ClientHello and compute a hash called a **JA3 fingerprint**. Python `requests`, cURL, Scrapy, Playwright — they all have known JA3 signatures that are immediately recognized and blocked.

Nothing Browser runs on Qt WebEngine, which uses the **full Chromium networking stack with BoringSSL** — the same TLS library that ships inside Google Chrome. The ClientHello is not simulated or patched. It is genuinely produced by the same code Chrome uses.

## Live Fingerprint Data

Captured live from Nothing Browser v0.1.x hitting `tls.browserleaks.com`, `tls.peet.ws`, and `fp.impersonate.pro`:

| Fingerprint Layer | Hash / Value | Verdict |
| --- | --- | --- |
| JA3 | `aa50c12a5dfa717d9d6ab34e97de79d5` | Chrome-identical |
| JA4 | `t13d1516h2_8daaf6152771_f37e75b10bcc` | Chrome-identical |
| JA3N (normalised) | `d30e0275e3aa85343be2d3550d3ced62` | Chrome-identical |
| Akamai HTTP/2 | `4f04edce68a7ecbe689edce7bf5f23f3` | Chrome-identical |
| Akamai text | `1:65536;3:1000;4:6291456;6:262144│15663105│0│m,a,s,p` | Chrome 124 match |
| PeetPrint | `fcf4f05a46efc954776ace0f11f2f38a` | Chrome with GREASE |
| TLS version | TLS 1.3 | Correct |
| HTTP version | HTTP/2 | Correct |
| GREASE | Present in ciphers and curves | Chrome behavior confirmed |

## Comparison: Nothing Browser vs Every Major Tool

| Tool | TLS Library | JA3 Status | Detectable by Cloudflare |
| --- | --- | --- | --- |
| **Nothing Browser** | BoringSSL (real Chromium) | Chrome-identical | **No — passes as real Chrome** |
| Python requests | OpenSSL | Known Python JA3 | Yes — immediately flagged |
| Python httpx | OpenSSL | Known Python JA3 | Yes — immediately flagged |
| Python curl_cffi | BoringSSL (patched) | Chrome-identical | No — equal to Nothing Browser |
| Playwright (Chrome) | BoringSSL (real Chrome) | Chrome-identical | No — but JS fingerprint leaks |
| Playwright (Firefox) | NSS (Firefox) | Firefox JA3 | Sometimes |
| Puppeteer | BoringSSL (real Chrome) | Chrome-identical | No — but automation flags leak |
| Scrapy | OpenSSL | Known Python JA3 | Yes — flagged |
| curl (stock) | OpenSSL / NSS | Known curl JA3 | Yes — flagged |
| curl-impersonate | BoringSSL (patched) | Chrome-identical | No |
| Selenium Chrome | BoringSSL (real Chrome) | Chrome-identical | No — but `webdriver` flag leaks |

::: tip The key distinction
Playwright, Puppeteer, and Selenium use real Chrome TLS — but they leak automation signals in JavaScript (`navigator.webdriver`, missing `chrome.runtime`, etc). Nothing Browser patches all of these at injection. `curl_cffi` patches TLS but has no browser context at all. **Nothing Browser is the only tool that addresses both layers simultaneously.**
:::

## Why Qt WebEngine Is the Right Foundation

### Real BoringSSL, Not Patched

`curl-impersonate` achieves Chrome-identical TLS by patching BoringSSL and cURL's source code with a 9,700-line diff. Nothing Browser achieves the same result without any patching — because Qt WebEngine ships the actual Chromium networking stack.

### Full JavaScript Engine

Playwright and Puppeteer drive Chrome from the outside via CDP. They cannot intercept every JavaScript API at the `DocumentCreation` phase. Nothing Browser injects its spoofing script at `DocumentCreation`, before any page JavaScript runs, using `QWebEngineScript`. This is architecturally superior.

### No Automation Flags

Chrome driven by Selenium or Playwright sets `navigator.webdriver = true` at the engine level. This cannot be overridden from JavaScript — it requires patching Chromium source. Nothing Browser is not an automation driver. It is a browser. `navigator.webdriver` is naturally `undefined`.

## Known Gaps and Roadmap

| Gap | Severity | Fix Path | Version Target |
| --- | --- | --- | --- |
| Canvas uniqueness 99.98% | High | Replace sin() PRNG with xorshift, reduce pixel noise density | v0.2.0 |
| `sec-ch-ua` brand format | Medium | Update `buildSecChUa()` for Chrome 110+ format | v0.1.2 |
| `navigator.userAgentData` missing | Medium | Add UA-CH injection to FingerprintSpoofer | v0.1.2 |
| WebGL UNMASKED params not spoofed | Medium | Add params 37445 and 37446 to WebGL override | v0.1.2 |
| TLS curves missing X25519MLKEM768 | Low | Qt WebEngine version bump required | v0.3.0+ |
| No ECH (Encrypted Client Hello) | Low | Chrome 119+ feature, Qt custom build required | v0.3.0+ |
| ALPS codepoint 17513 vs 17613 | Low | Chrome 133+ only, Qt limitation | v0.3.0+ |

The TLS-layer gaps are Qt WebEngine version constraints. They do not affect detection by current Cloudflare, Akamai, or DataDome systems for Chrome 124 impersonation.

## The Advantage Statement

| Capability | Nothing Browser | Best Alternative |
| --- | --- | --- |
| Real Chromium TLS (no patching) | ✅ Yes | curl_cffi (patched) |
| No automation flag leakage | ✅ Yes | None — all automation tools leak this |
| DocumentCreation-phase JS injection | ✅ Yes | Playwright (partial, via CDP) |
| Full DevTools network capture | ✅ Yes | Browser DevTools (manual only) |
| One-click Python/curl export | ✅ Yes | None |
| WebSocket frame capture | ✅ Yes | None in scraping tools |
| Canvas and audio noise | ✅ Yes | Brave (coarser implementation) |
| Zero telemetry | ✅ Yes | Brave (some telemetry) |
| Auto-update | ✅ Yes | Manual for most tools |

Nothing Browser v0.1.x achieves Chrome-identical TLS fingerprinting natively — without patching, without a proxy layer, and without sacrificing a real browser environment.

---

*Nothing Browser — Coded by Pease Ernest | Ernest Tech House | TLS Research & Analysis | 2025*
