
# Why Piggy Exists

A message from the developer.

---

## The Problem

I was tired of writing the same 47 lines of setup code every time I wanted to scrape something.

```ts
// Puppeteer setup
import puppeteer from 'puppeteer';
import stealth from 'puppeteer-extra-plugin-stealth';
import puppeteerExtra from 'puppeteer-extra';
// ... 5 more imports
// ... 20 lines of stealth setup
// ... 15 lines of fingerprint spoofing
// ... and you're STILL getting blocked  like who has time for that 
// ... and worse the install took 5 mins and script crashed with errors that dont concern me like why should i be affected when chrome dev tool added a full stop function and i want to just click a button
```

Every project needed:
- Stealth plugins that break every 3 months
- Custom fingerprint spoofing that you copy from Stack Overflow
- Manual network capture that misses half the requests
- Session persistence that you write yourself
- And after all that... Cloudflare still blocks you.

**There had to be a better way.**

---

## The Realization

Most scraping tools are built on top of Chrome DevTools Protocol (CDP). CDP was designed for **debugging**, not for **scraping**. It's slow, leaky, and leaves detectable traces everywhere.

Puppeteer and Playwright are amazing for testing. But they leak automation signals like a sieve leaks water.

`navigator.webdriver = true` is set at the **engine level**. You cannot remove it from JavaScript. It's there. Always.

I realized: what if the browser was built for scraping from the ground up?

---

## The Solution

**Nothing Browser Piggy** is that solution.

Instead of hacking CDP, we built a custom socket protocol directly into the browser. Instead of patching Chrome, we use Qt WebEngine with real BoringSSL TLS. Instead of plugins, everything is built in.

```ts
// Piggy - one import, 20 lines, done
import piggy from "nothing-browser";

await piggy.launch();
await piggy.register("site", "https://example.com");
await piggy.site.navigate();
const data = await piggy.site.evaluate(() => ({ ... }));
```

No stealth plugins. No fingerprint hacks. No 47-line setup.

---

## The Philosophy

### 1. Scraping-first, not testing-first

Most tools were built for testing. Scraping is an afterthought. Piggy was built for scraping. Network capture, session persistence, human mode — these aren't add-ons, they're core features.

### 2. One import, zero configuration

You shouldn't need to read a 200-page manual to scrape a website. One import. One launch. One register. Go.

### 3. Anti-detection by default

Fingerprint spoofing isn't a plugin. It's built in. TLS fingerprint isn't patched. It's real Chrome. Human mode isn't a separate library. It's one line: `piggy.actHuman(true)`.

### 4. Version simplicity

Library and binary versions are independent. Update one without the other. Old code works with new binaries. New features don't break old code.

---

## The Technology

### Real BoringSSL, not patched

curl_cffi patches BoringSSL with 9,700 lines of diff. Piggy uses real BoringSSL because Qt WebEngine ships the actual Chromium networking stack.

### Socket communication, not CDP

CDP was designed for debugging. Sockets were designed for speed. Piggy uses Unix domain sockets (Linux/macOS) and Windows named pipes.

### DocumentCreation injection, not runtime

Puppeteer injects scripts after page load. Piggy injects at DocumentCreation — before any page JavaScript runs. You can't detect what was always there.

---

## The Trade-offs

Nothing is perfect. Here's what Piggy doesn't do:

| Limitation | Why |
|------------|-----|
| No Chrome extensions | Qt WebEngine limitation |
| Google/Facebook may block you | They block everything non-Chrome |
| Windows support is coming | Native Windows build in progress |
| No mobile emulation | Desktop-only for now |

But for 95% of scraping tasks? Piggy just works.

---

## The Future

### Multi-language support

The socket protocol means any language can talk to Piggy:

- Python (coming soon)
- Go (coming soon)
- Java (coming soon)
- Rust (planned)
- C# (planned)

### Feature roadmap

| Feature | Status |
|---------|--------|
| exposeFunction (RPC) | ✅ Done |
| Request interception | ✅ Done |
| Built-in API server | ✅ Done |
| Windows native | 🔨 In progress |
| Captcha solver | 📋 Planned |
| Headless mode improvements | 📋 Planned |

---

## A Personal Note

I built Piggy because I was frustrated.

Frustrated with getting blocked. Frustrated with broken plugins. Frustrated with 47-line setup files that I copy-pasted from project to project.

I wanted something that just works. Something where anti-detection isn't an afterthought. Something where I don't need to explain to my team why we need 5 different npm packages just to scrape a website.

Piggy is that something.

It's not perfect. It's not for every use case. But for web scraping and API reverse engineering? It's the tool I wish I had 5 years ago.

— Pease Ernest

*Ernest Tech House · Kenya · 2026*

---

## What Others Are Saying

> "I replaced 200 lines of Puppeteer + stealth plugin with 20 lines of Piggy. It just works."

> "The exposeFunction feature changed how I think about browser automation. RPC from browser to Node.js is a game changer."

> "Finally, a scraper that passes Cloudflare without 17 different plugins."

---

## Should You Use Piggy?

**Yes, if:**
- You're scraping websites with anti-bot protection
- You're reverse engineering APIs
- You want built-in network capture and session persistence
- You're tired of Puppeteer/Playwright getting blocked

**Maybe not, if:**
- You need cross-browser testing (Chrome, Firefox, Safari)
- You need Chrome extensions
- You're testing internal web apps (Puppeteer is fine for this)

---

## Getting Started

Ready to try Piggy?

- [Installation](./installation) — Get set up in 5 minutes
- [Quick Start](./quickstart) — Your first scraper
- [exposeFunction (RPC)](./expose-function) — The flagship feature

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
