# Comparison

How Nothing Browser compares to other tools used for scraping, automation, and API reverse engineering.

## TLS Layer

| Tool | TLS Library | Chrome JA3 | Cloudflare |
| --- | --- | --- | --- |
| **Nothing Browser** | BoringSSL (real Chromium) | ✅ Identical | ✅ Passes |
| Python requests | OpenSSL | ❌ Python JA3 | ❌ Flagged |
| Python httpx | OpenSSL | ❌ Python JA3 | ❌ Flagged |
| Python curl_cffi | BoringSSL (patched) | ✅ Identical | ✅ Passes |
| Playwright (Chrome) | BoringSSL | ✅ Identical | ⚠️ JS leaks |
| Puppeteer | BoringSSL | ✅ Identical | ⚠️ JS leaks |
| Selenium Chrome | BoringSSL | ✅ Identical | ⚠️ webdriver flag |
| Scrapy | OpenSSL | ❌ Known | ❌ Flagged |
| curl (stock) | OpenSSL/NSS | ❌ Known | ❌ Flagged |

## JavaScript Layer

| Tool | webdriver flag | chrome.runtime | DocumentCreation injection |
| --- | --- | --- | --- |
| **Nothing Browser** | ✅ Absent | ✅ Present | ✅ Yes |
| Playwright | ❌ Present | ❌ Absent | ⚠️ Partial (CDP) |
| Puppeteer | ❌ Present | ❌ Absent | ⚠️ Partial (CDP) |
| Selenium | ❌ Present | ❌ Absent | ❌ No |
| curl_cffi | N/A | N/A | N/A |

## Capability

| Capability | Nothing Browser | Playwright | curl_cffi | Browser DevTools |
| --- | --- | --- | --- | --- |
| Real browser rendering | ✅ | ✅ | ❌ | ✅ |
| Network capture | ✅ Auto | ✅ Manual | ❌ | ✅ Manual |
| WebSocket capture | ✅ | ✅ | ❌ | ✅ Manual |
| Cookie inspector | ✅ | ✅ | ❌ | ✅ Manual |
| One-click export | ✅ | ❌ | ❌ | ❌ |
| Session save/load | ✅ | ❌ | ❌ | ❌ |
| Zero telemetry | ✅ | ❌ | ✅ | ✅ |
| Plugin system | ✅ | ❌ | ❌ | ✅ (extensions) |
| YouTube without API | ✅ | ❌ | ❌ | ❌ |

See the full [TLS Fingerprint Report](/guide/tls-fingerprint) for live benchmark data and hash values.
