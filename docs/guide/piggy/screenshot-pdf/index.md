# 📸 Screenshot & PDF API — Capture Page Content

Take screenshots of web pages and generate PDF documents. Perfect for visual verification, archiving, generating reports, and debugging.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

| Method | Output | Use Case |
|--------|--------|----------|
| `screenshot(filePath?)` | PNG image (base64 or file) | Visual verification, debugging |
| `pdf(filePath?)` | PDF document (base64 or file) | Reports, archiving |
| `blockImages()` | — | Speed up loads on image-heavy pages |
| `unblockImages()` | — | Re-enable images |

---

## Known Limitations

### Screenshot in Headless Mode
Screenshots in headless mode currently produce a blank white image with only the page title as text. This is a known Qt WebEngine rendering issue — the GPU compositor does not paint the page into the offscreen buffer before the screenshot is taken. This is being researched and will be fixed in a future version.

**Workaround:** Use headful mode (`nothing-browser-headful.exe`) for screenshots, and add a `wait` after navigation to allow the page to fully render before capturing.

### PDF in Headless Mode
PDF export works correctly in both headless and headful mode. Qt WebEngine's PDF renderer does not depend on the GPU compositor, so it always produces the full rendered page.

---

## Screenshot

### `screenshot(filePath?)`

Takes a screenshot of the current page. Returns base64 if no path is provided, otherwise saves to the given path.

> ⚠️ Use headful mode. Add a wait after `waitForSelector` to allow full rendering.

```ts
import piggy from "nothing-browser";
import { writeFileSync } from "fs";
import path from "path";

const binaryPath = path.resolve(import.meta.dir, "../a/nothing-browser-headful.exe");

await piggy.launch({ mode: "tab", binary: binaryPath });
await piggy.register("site", "https://books.toscrape.com");

await piggy.site.navigate();
await piggy.site.waitForSelector(".product_pod");
await piggy.site.wait(2000); // wait for full render

// Get as base64 and save manually
const b64 = await piggy.site.screenshot();
writeFileSync("./screenshot.png", Buffer.from(b64, "base64"));

// Or save directly to file
await piggy.site.screenshot("./screenshot.png");
```

---

## PDF

### `pdf(filePath?)`

Generates a PDF of the current page. Works correctly in both headless and headful mode.

```ts
// Get as base64 and save manually
const b64 = await piggy.site.pdf();
writeFileSync("./page.pdf", Buffer.from(b64, "base64"));

// Or save directly to file
await piggy.site.pdf("./page.pdf");
```

---

## Image Blocking

### `blockImages()` / `unblockImages()`

```ts
await piggy.site.blockImages();
await piggy.site.navigate("https://books.toscrape.com");
await piggy.site.waitForSelector(".product_pod");
// page loaded faster without images

await piggy.site.unblockImages();
// images will load on next navigation
```

> Always call `unblockImages()` before taking a screenshot — a page loaded with images blocked will render blank or unstyled.

---

## Real-World Examples

### Example 1: Screenshot a Product Page

```ts
await piggy.site.unblockImages()
await piggy.site.intercept.clear()
await piggy.site.navigate("https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html")
await piggy.site.waitForSelector(".product_main")
await piggy.site.wait(2000) // wait for full render

const b64 = await piggy.site.screenshot()
writeFileSync("./product.png", Buffer.from(b64, "base64"))
console.log("Product screenshot saved ✓")
```

### Example 2: Generate PDF Report

```ts
await piggy.site.navigate("https://books.toscrape.com")
await piggy.site.waitForSelector(".product_pod")

const b64 = await piggy.site.pdf()
writeFileSync("./catalogue.pdf", Buffer.from(b64, "base64"))
console.log("PDF saved ✓")
```

### Example 3: Screenshot Multiple Pages

```ts
const links = await piggy.site.fetchLinks(".product_pod h3 a")

for (let i = 0; i < Math.min(5, links.length); i++) {
  await piggy.site.navigate(links[i])
  await piggy.site.waitForSelector(".product_main")
  await piggy.site.wait(1500)

  const b64 = await piggy.site.screenshot()
  writeFileSync(`./screenshots/product-${i + 1}.png`, Buffer.from(b64, "base64"))
  console.log(`Screenshot ${i + 1} saved`)
}
```

### Example 4: Screenshot on Error for Debugging

```ts
async function scrapeWithDebug(site: any, url: string) {
  try {
    await site.navigate(url)
    await site.waitForSelector(".content")
    return await site.provide.text({ selector: ".content" })
  } catch (error: any) {
    const filename = `./error-${Date.now()}.png`
    const b64 = await site.screenshot()
    writeFileSync(filename, Buffer.from(b64, "base64"))
    console.log(`Error screenshot saved: ${filename}`)
    throw error
  }
}
```

### Example 5: Block Images, Screenshot, Then Unblock

```ts
await piggy.site.blockImages()
const t0 = Date.now()
await piggy.site.navigate("https://books.toscrape.com")
await piggy.site.waitForSelector(".product_pod")
console.log(`Loaded in ${Date.now() - t0}ms (no images)`)

// Unblock before screenshot or you'll get a blank image
await piggy.site.unblockImages()
await piggy.site.navigate()
await piggy.site.waitForSelector(".product_pod")
await piggy.site.wait(2000)

const b64 = await piggy.site.screenshot()
writeFileSync("./with-images.png", Buffer.from(b64, "base64"))
```

### Example 6: PDF from Multiple URLs

```ts
const urls = [
  "https://books.toscrape.com",
  "https://books.toscrape.com/catalogue/page-2.html",
  "https://books.toscrape.com/catalogue/page-3.html",
]

for (let i = 0; i < urls.length; i++) {
  await piggy.site.navigate(urls[i])
  await piggy.site.waitForSelector(".product_pod")

  const b64 = await piggy.site.pdf()
  writeFileSync(`./page-${i + 1}.pdf`, Buffer.from(b64, "base64"))
  console.log(`PDF ${i + 1} saved`)
}
```

---

## Performance Tips

```ts
// Block images for faster navigation (not for screenshots)
await piggy.site.blockImages()
await piggy.site.navigate(url)

// Always unblock before screenshotting
await piggy.site.unblockImages()
await piggy.site.navigate(url)
await piggy.site.waitForSelector(".content")
await piggy.site.wait(2000) // allow render
await piggy.site.screenshot("./output.png")
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `screenshot(filePath?)` | `filePath?: string` | `Promise<string>` | PNG screenshot as base64 |
| `pdf(filePath?)` | `filePath?: string` | `Promise<string>` | PDF as base64 |
| `blockImages()` | — | `Promise<void>` | Block all images from loading |
| `unblockImages()` | — | `Promise<void>` | Re-enable image loading |

---

## Next Steps

- [Capture API](../capture) — Capture network traffic
- [Human API](../human) — Human-like scrolling before screenshots
- [Intercept API](../intercept) — Block/modify requests before capture

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*