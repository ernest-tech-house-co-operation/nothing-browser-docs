# Why Piggy Exists

A message from the developer.

---

## The Problem

I was tired of writing the same 47 lines of setup code every time I wanted to scrape something.

Every project needed:
- Stealth plugins that break every 3 months
- Custom fingerprint spoofing copied from Stack Overflow
- Manual network capture that misses half the requests
- Session persistence written from scratch
- And after all that... Cloudflare still blocks you.

**There had to be a better way.**

---

## The Realization

Most scraping tools are built on top of Chrome DevTools Protocol (CDP). CDP was designed for **debugging**, not for **scraping**. It's slow, leaky, and leaves detectable traces everywhere.

`navigator.webdriver = true` is set at the **engine level**. You cannot remove it from JavaScript. It's there. Always.

I realized: what if the browser was built for scraping from the ground up?

---

## The Solution

**Nothing Browser Piggy** is that solution.

Instead of hacking CDP, we built a custom socket protocol directly into the browser. Instead of patching Chrome, we use Qt WebEngine with real BoringSSL TLS. Instead of plugins, everything is built in.

```ts
// Piggy — one import, 20 lines, done
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

Most tools were built for testing. Scraping is an afterthought. Piggy was built for scraping.

### 2. One import, zero configuration

You shouldn't need to read a 200-page manual to scrape a website.

### 3. Anti-detection by default

Fingerprint spoofing isn't a plugin. It's built in.

### 4. Version simplicity

Library and binary versions are independent. Update one without the other.

---

## The Bottom Line

Piggy is the tool I wish I had 5 years ago.

— Pease Ernest

*Ernest Tech House · Kenya · 2026*

---

## Next Steps

- [Quick Start](./quickstart) — Start using Piggy
- [Installation](./installation) — Get set up
- [Core Concepts](./core/launch) — Launch & register

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*