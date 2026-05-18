---
title: Piggy — Headless Browser Library
---

# 🐷 Piggy

**Headless browser automation for TypeScript/Bun/Node.js.**

Built on Nothing Browser — real BoringSSL TLS, fingerprint spoofing at DocumentCreation, and 100+ APIs for scraping, automation, and data extraction.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+
>
> [Update instructions](./installation) | [Version Compatibility](./version-compatibility)

---

## Quick Start

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("example", "https://example.com");

await piggy.example.navigate();
const title = await piggy.example.title();
console.log(title);

await piggy.close();
```

---

## Why Piggy?

| Feature | Piggy | Puppeteer |
|---------|-------|-----------|
| Library size | ~50KB | ~50MB |
| Communication | Socket (fast) | CDP (complex) |
| Anti-detection | Built-in | Plugins needed |
| Fingerprint spoofing | DocumentCreation | Runtime (detectable) |
| API count | 100+ | ~50 |

**Piggy is just a command mapper** — thin wrapper around the Nothing Browser binary.

---

## Known Issues & Platform Quirks

### 🪟 Windows: `file://` URLs Must Use Triple Slash

On Windows, Qt WebEngine requires `file:///` (three slashes) for local file URLs. Two slashes (`file://`) causes Qt to interpret the drive letter as a hostname, resulting in a silent load failure.

```ts
// ❌ Wrong — Qt thinks "C" is the hostname
`file://C:/Users/me/page.html`

// ✅ Correct
`file:///C:/Users/me/page.html`
```

Also make sure backslashes are converted to forward slashes:

```ts
const url = `file:///${join(pagesDir, "page.html").replace(/\\/g, "/")}`
```

Always prefer `import.meta.dir` over `process.cwd()` for building paths — it's always the script's own folder regardless of where you ran the script from.

---

### 🪟 Windows: The Pipe Bug (Named Pipe Connection Failure)

**Symptom:**

```
error: connect ENOENT \\.\pipe\piggy
   errno: -4058,
 syscall: "connect",
 address: "\\\\.\\pipe\\piggy",
    code: "ENOENT"
```

**What happened:** The Nothing Browser binary spawned successfully, but Windows didn't let it create the named pipe in time — or Windows Defender / UAC blocked the binary from running as a background process entirely.

**The fix:**

1. Open the folder containing your binary (e.g. `piggy-playground/a/`)
2. Double-click `nothing-browser-headful.exe` directly
3. If Windows shows a security prompt, click **Run Anyway**
4. Close the browser window that opens
5. Re-run your script

This whitelists the binary with Windows so it can spawn freely from scripts.

**Do we know exactly why this happens?** No.  
**Is it going to be fixed?** Also no.  
**Does the workaround always work?** Yes.
**Will you get such errorsfrequently in windows?** Yes.

> This issue only affects Windows. Linux and macOS do not require this step.

---

## API Families

### Core
- [`launch()`](./core/launch) — Start the browser
- [`connect()`](./core/connect) — Connect to remote server
- [`register()`](./core/register) — Register a site
- [`close()`](./core/close) — Shutdown

### Navigation
- [`navigate()`](./navigation/navigate) — Go to URL
- [`reload()`](./navigation/reload) — Refresh page
- [`goBack()` / `goForward()`](./navigation/back-forward) — History
- [`title()` / `url()` / `content()`](./navigation/title-url-content) — Page info

### Waiting
- [`wait.selector()`](./waiting/wait-selector) — Wait for element state
- [`wait.function()`](./waiting/wait-function) — Wait for JS condition
- [`waitForResponse()`](./waiting/wait-response) — Wait for network

### Interactions
- [`click()`](./interactions/click) — Click elements
- [`type()`](./interactions/type) — Type text
- [`hover()`](./interactions/hover) — Hover mouse
- [`select()`](./interactions/select) — Dropdown options
- [`keyboard`](./interactions/keyboard) — Key presses
- [`mouse`](./interactions/mouse) — Mouse movement
- [`scroll`](./interactions/scroll) — Scroll page

### Find — DOM Query
- [`find.css()` / `find.all()`](./find#findcss--findall) — CSS selector
- [`find.first()`](./find#findfirst) — First match
- [`find.byText()`](./find#findbytext) — By text content
- [`find.byAttr()`](./find#findbyattr) — By attribute
- [`find.byTag()`](./find#findbytag) — By tag name
- [`find.byPlaceholder()`](./find#findbyplaceholder) — By input placeholder
- [`find.byRole()`](./find#findbyrole) — By ARIA role
- [`find.closest()`](./find#findclosest) — Closest ancestor
- [`find.parent()` / `find.children()`](./find#findparent--findchildren) — DOM traversal
- [`find.filter()`](./find#findfilter) — Filter results
- [`find.count()` / `find.exists()`](./find#findcount--findexists) — Count/check
- [`find.visible()` / `find.enabled()` / `find.checked()`](./find#findvisible--findenabled--findchecked) — State checks

### Provide — Data Extraction
- [`provide.text()` / `provide.textAll()`](./provide#providetext--providetextall) — Extract text
- [`provide.html()`](./provide#providehtml) — Inner HTML
- [`provide.attr()` / `provide.attrAll()`](./provide#provideattr--provideattrall) — Attributes
- [`provide.table()`](./provide#providetable) — HTML table to JSON
- [`provide.list()`](./provide#providelist) — Extract list items
- [`provide.links()` / `provide.images()`](./provide#providelinks--provideimages) — Links & images
- [`provide.form()`](./provide#provideform) — Form data
- [`provide.page()`](./provide#providepage) — Full page metadata
- [`provide.div()`](./provide#providediv) — Element structure
- [`provide.meta()`](./provide#providemeta) — Meta tags
- [`provide.select()`](./provide#provideselect) — Select dropdown
- [`provide.json()`](./provide#providejson) — Embedded JSON-LD

### Fetch & Search (Legacy)
- [`fetch.text()` / `fetch.textAll()`](./fetch-search/fetch) — Quick text
- [`fetch.links()` / `fetch.linksAll()`](./fetch-search/fetch) — Quick links
- [`fetch.image()`](./fetch-search/fetch) — Quick images
- [`search.css()` / `search.id()`](./fetch-search/search) — DOM snapshots

### Capture — Network
- [`capture.start()` / `capture.stop()`](./capture) — Start/stop recording
- [`capture.requests()`](./capture) — HTTP requests
- [`capture.ws()`](./capture) — WebSocket frames
- [`capture.cookies()`](./capture) — Network cookies
- [`capture.storage()`](./capture) — Local/session storage
- [`capture.clear()`](./capture) — Clear buffer

### Interception
- [`intercept.block()`](./intercept) — Block requests
- [`intercept.redirect()`](./intercept) — Redirect
- [`intercept.headers()`](./intercept) — Modify headers
- [`intercept.respond()`](./intercept) — Mock responses
- [`intercept.modifyResponse()`](./intercept) — Modify real responses
- [`intercept.clear()`](./intercept) — Clear rules

### Cookies
- [`cookies.set()` / `cookies.get()` / `cookies.delete()` / `cookies.list()`](./cookies)

### Session
- [`session.export()` / `session.import()`](./session) — Save/load session
- [`session.reload()`](./session) — Hot reload cookies/profile
- [`session.paths()`](./session) — File paths
- [`session.setWsSave()` / `session.setPingsSave()`](./session) — Persistence opt-in

### Expose — RPC
- [`exposeFunction()`](./expose) — Call Node.js from browser
- [`exposeAndInject()`](./expose) — Expose + inject in one call
- [`piggy.expose()` / `piggy.unexpose()`](./expose) — Global functions

### Iframe
- [`iframe.list()`](./iframe) — List iframes
- [`iframe.evaluate()`](./iframe) — Run JS in iframe
- [`iframe.click()` / `iframe.type()`](./iframe) — Interact inside iframe
- [`iframe.text()` / `iframe.html()`](./iframe) — Extract content
- [`iframe.waitSel()`](./iframe) — Wait for selector

### Captcha & Block
- [`captcha.status()` / `captcha.resolve()`](./captcha) — Detect/solve
- [`captcha.pause()` / `captcha.check()`](./captcha) — Manual intervention
- [`captcha.setAutoRetry()`](./captcha) — Auto retry
- [`block.status()` / `block.retry()`](./captcha) — Block detection

### Dialog & Upload
- [`dialog.accept()` / `dialog.dismiss()`](./dialog) — Handle alerts
- [`dialog.status()`](./dialog) — Check pending dialog
- [`dialog.upload()`](./dialog) — File upload
- [`dialog.waitAndAccept()` / `dialog.waitAndDismiss()`](./dialog) — Await dialog

### Human Mode
- [`human.set()` / `human.get()`](./human) — Configure behavior
- [`human.type()` / `human.click()`](./human) — Human-like interactions

### Screenshot & PDF
- [`screenshot()`](./screenshot-pdf) — Take screenshot
- [`pdf()`](./screenshot-pdf) — Generate PDF
- [`blockImages()` / `unblockImages()`](./screenshot-pdf) — Image blocking

### Proxy
- [`proxy.load()` / `proxy.fetch()` / `proxy.ovpn()`](./proxy) — Load proxies
- [`proxy.set()` / `proxy.enable()` / `proxy.disable()`](./proxy) — Configure
- [`proxy.test()` / `proxy.testStop()`](./proxy) — Health check
- [`proxy.next()` / `proxy.rotation()`](./proxy) — Rotate
- [`proxy.current()` / `proxy.stats()` / `proxy.list()`](./proxy) — Status
- [`proxy.save()`](./proxy) — Save proxy list

### API Server
- [`api()`](./api-server) — Register endpoint
- [`serve()` / `stopServer()`](./api-server) — Start/stop HTTP server
- [`routes()`](./api-server) — List routes
- [`all()` / `diff()`](./api-server) — Multi-site operations

### Storage
- [`store()`](./storage) — Schema-based data persistence

### Tabs
- [`tabs.new()` / `tabs.list()` / `tabs.close()`](./tabs)

### Events
- [`onEvent()` / `site.on()`](./events) — Subscribe to events
- [captcha, dialog, navigate, exposed_call, proxy events](./events)

### Types
- [Full TypeScript definitions](./types)

---

## Search for an API

Looking for something specific?

| What you want | Use this |
|---------------|----------|
| Extract text from a div | [`provide.text()`](./provide#providetext--providetextall) |
| Get all links on a page | [`provide.links()`](./provide#providelinks--provideimages) |
| Wait for element to appear | [`wait.selector()`](./waiting/wait-selector) |
| Click a button inside iframe | [`iframe.click()`](./iframe) |
| Handle a confirm dialog | [`dialog.accept()` / `dialog.dismiss()`](./dialog) |
| Upload a file | [`dialog.upload()`](./dialog) |
| Rotate proxies | [`proxy.next()` / `proxy.rotation()`](./proxy) |
| Save session to file | [`session.export()` / `session.import()`](./session) |
| Call Node.js from browser | [`exposeFunction()`](./expose) |
| Solve CAPTCHA | [`captcha.resolve()`](./captcha) |

---

## Response Samples

See exactly what each command returns with real examples:

- [Find API Response Samples](./find#response-samples)
- [Provide API Response Samples](./provide#response-samples)
- [Capture API Response Samples](./capture#response-samples)
- [Proxy API Response Samples](./proxy#response-samples)

> All examples use the same sample HTML page. Responses shown are real.

---

## Next Steps

- [Installation](../installation) — Get set up
- [Quick Start](../quickstart) — First scraper in 5 minutes
- [Find API](./find) — DOM query (start here for scraping)

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*