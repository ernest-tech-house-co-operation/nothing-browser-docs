# 📸 Screenshot & PDF API — Capture Page Content

Take screenshots of web pages and generate PDF documents. Perfect for visual verification, archiving, generating reports, and debugging.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview
## Notice
screen shot in headless does not work somehow honestly i have n idea of what happens i mean a image is generated but it comes with a blank white sheet that says screen shot of the site you wanted a screen shot off i have no idea of how to take a screen shot of a browser that has ui off :D but well sth has to be figured out right i will do my research for the headfull i think it should work 

The Screenshot & PDF API provides methods for capturing page content:

| Method | Output | Use Case |
|--------|--------|----------|
| `screenshot()` | PNG image (base64 or file) | Visual verification, debugging |
| `pdf()` | PDF document (base64 or file) | Reports, archiving |
| `blockImages()` | — | Speed up screenshots on image-heavy pages |
| `unblockImages()` | — | Re-enable images |

---

## Screenshot

### `screenshot(filePath?)`

Takes a screenshot of the current page. Returns base64 if no path provided, otherwise returns the file path.

```ts
// Get screenshot as base64
const base64 = await piggy.site.screenshot();
console.log(base64.substring(0, 100)); // "data:image/png;base64,iVBORw0KGgo..."

// Save to file
const filePath = await piggy.site.screenshot("./error.png");
console.log(`Screenshot saved to: ${filePath}`);

// Save with timestamp
const timestamp = Date.now();
await piggy.site.screenshot(`./screenshots/page-${timestamp}.png`);
```

---

## PDF

### `pdf(filePath?)`

Generates a PDF of the current page. Returns base64 if no path provided, otherwise returns the file path.

```ts
// Get PDF as base64
const base64 = await piggy.site.pdf();
console.log(base64.substring(0, 100)); // "data:application/pdf;base64,JVBERi0xLjQK..."

// Save to file
const filePath = await piggy.site.pdf("./report.pdf");
console.log(`PDF saved to: ${filePath}`);

// Save with date
const date = new Date().toISOString().split('T')[0];
await piggy.site.pdf(`./reports/report-${date}.pdf`);
```

---

## Image Blocking

### `blockImages()`

Blocks all images from loading. Useful for faster screenshots on image-heavy pages.

```ts
await piggy.site.blockImages();
await piggy.site.navigate("https://image-heavy-site.com");
await piggy.site.screenshot("./fast-screenshot.png");
```

### `unblockImages()`

Re-enables image loading.

```ts
await piggy.site.unblockImages();
```

---

## Real-World Examples

### Example 1: Screenshot Multiple Pages

```ts
await piggy.register("shop", "https://books.toscrape.com");

// Get all product links
const productLinks = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });

// Screenshot each product page
for (let i = 0; i < Math.min(10, productLinks.length); i++) {
  await piggy.shop.navigate(productLinks[i]);
  await piggy.shop.waitForSelector(".product_main");
  
  const title = await piggy.shop.fetch.text({ query: "h1" });
  const filename = `./screenshots/${title.replace(/[^a-z0-9]/gi, '_')}.png`;
  
  await piggy.shop.screenshot(filename);
  console.log(`📸 Screenshot ${i + 1}: ${filename}`);
}
```

### Example 2: Generate PDF Report

```ts
async function generateReport(site: any, urls: string[], outputFile: string) {
  const report = {
    generated: new Date().toISOString(),
    pages: [] as any[]
  };
  
  for (const url of urls) {
    console.log(`Processing: ${url}`);
    
    await site.navigate(url);
    await site.wait(2000);
    
    const title = await site.title();
    const screenshot = await site.screenshot(); // base64
    
    report.pages.push({
      url,
      title,
      screenshot: screenshot.substring(0, 100) + "...",
      timestamp: Date.now()
    });
    
    // Save full screenshot
    const filename = `./report-screenshots/${new URL(url).hostname}.png`;
    await site.screenshot(filename);
  }
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Report - ${new Date().toISOString()}</title>
  <style>
    body { font-family: monospace; margin: 40px; background: #1a1a1a; color: #eee; }
    h1 { color: #00cc66; }
    .page { margin-bottom: 40px; border: 1px solid #333; padding: 20px; }
    img { max-width: 100%; border: 1px solid #333; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Visual Report</h1>
  <p>Generated: ${report.generated}</p>
  ${report.pages.map(page => `
    <div class="page">
      <div class="url">${page.url}</div>
      <div class="title">${page.title}</div>
      <img src="screenshots/${new URL(page.url).hostname}.png" />
    </div>
  `).join('')}
</body>
</html>
  `;
  
  await Bun.write(outputFile, html);
  console.log(`📄 Report generated: ${outputFile}`);
}

// Usage
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("report", "https://example.com");

const urls = [
  "https://example.com",
  "https://example.com/products",
  "https://example.com/about",
  "https://example.com/contact"
];

await generateReport(piggy.report, urls, "./visual-report.html");
```

### Example 3: Visual Regression Testing

```ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as fs from "fs/promises";

const BASELINE_DIR = "./baselines";
const CURRENT_DIR = "./current";
const DIFF_DIR = "./diffs";

// Ensure directories exist
await fs.mkdir(BASELINE_DIR, { recursive: true });
await fs.mkdir(CURRENT_DIR, { recursive: true });
await fs.mkdir(DIFF_DIR, { recursive: true });

async function captureBaseline(site: any, name: string) {
  await site.screenshot(`${BASELINE_DIR}/${name}.png`);
  console.log(`📸 Baseline captured: ${name}`);
}

async function compareVisual(site: any, name: string, threshold = 0.01) {
  // Capture current screenshot
  await site.screenshot(`${CURRENT_DIR}/${name}.png`);
  
  const baselinePath = `${BASELINE_DIR}/${name}.png`;
  const currentPath = `${CURRENT_DIR}/${name}.png`;
  
  if (!existsSync(baselinePath)) {
    console.log(`No baseline for ${name}, capturing...`);
    await captureBaseline(site, name);
    return true;
  }
  
  // Use pixelmatch for comparison (install: bun add pixelmatch pngjs)
  const { default: pixelmatch } = await import("pixelmatch");
  const { PNG } = await import("pngjs");
  
  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const current = PNG.sync.read(readFileSync(currentPath));
  
  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  
  const mismatchedPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    width,
    height,
    { threshold }
  );
  
  const diffPercent = mismatchedPixels / (width * height);
  
  if (diffPercent > threshold) {
    writeFileSync(`${DIFF_DIR}/${name}.png`, PNG.sync.write(diff));
    console.log(`⚠️ Visual difference: ${(diffPercent * 100).toFixed(2)}%`);
    return false;
  }
  
  console.log(`✅ Visual match: ${(diffPercent * 100).toFixed(2)}%`);
  return true;
}

// Usage
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("app", "https://example.com");

// Capture baseline (first run)
await piggy.app.navigate("https://example.com/home");
await captureBaseline(piggy.app, "homepage");

// Later, compare after changes
await piggy.app.navigate("https://example.com/home");
const matches = await compareVisual(piggy.app, "homepage");

if (!matches) {
  console.log("❌ Visual regression detected!");
}
```

### Example 4: Debug with Screenshots on Error

```ts
async function scrapeWithDebug(site: any, url: string) {
  try {
    await site.navigate(url);
    await site.waitForSelector(".content");
    return await site.provide.text({ selector: ".content" });
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    
    // Take screenshot on error for debugging
    const timestamp = Date.now();
    const filename = `./error-${timestamp}.png`;
    await site.screenshot(filename);
    console.log(`📸 Error screenshot saved: ${filename}`);
    
    throw error;
  }
}
```

### Example 5: Screenshot After Each Action (Debugging)

```ts
async function debugWithScreenshots(site: any, debugDir: string) {
  let step = 0;
  
  await fs.mkdir(debugDir, { recursive: true });
  
  return {
    async capture(name: string) {
      step++;
      const filename = `${debugDir}/${step}_${name}.png`;
      await site.screenshot(filename);
      console.log(`📸 Debug screenshot: ${filename}`);
    },
    
    async click(selector: string) {
      await this.capture(`before_click_${selector}`);
      await site.click(selector);
      await site.wait(500);
      await this.capture(`after_click_${selector}`);
    },
    
    async type(selector: string, text: string) {
      await this.capture(`before_type_${selector}`);
      await site.type(selector, text);
      await this.capture(`after_type_${selector}`);
    }
  };
}

// Usage
await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("app", "https://example.com");
await piggy.app.navigate();

const debug = await debugWithScreenshots(piggy.app, "./debug-screenshots");

await debug.capture("homepage_loaded");
await debug.click("#login-btn");
await debug.type("#email", "user@example.com");
await debug.type("#password", "password");
await debug.click("#submit");
await debug.capture("after_login");
```

### Example 6: Full Page Screenshot (Scrolling)

```ts
async function fullPageScreenshot(site: any, outputPath: string) {
  // Get full page height
  const { scrollHeight, viewportHeight } = await site.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight
  }));
  
  const screenshots: string[] = [];
  
  // Scroll and capture each section
  for (let y = 0; y < scrollHeight; y += viewportHeight) {
    await site.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await site.wait(300);
    
    const screenshot = await site.screenshot();
    screenshots.push(screenshot);
  }
  
  // Save individual sections
  for (let i = 0; i < screenshots.length; i++) {
    await Bun.write(`${outputPath}_part${i + 1}.png`, Buffer.from(screenshots[i], "base64"));
  }
  
  console.log(`📸 Captured ${screenshots.length} sections`);
}

// Usage
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com/long-page");
await piggy.site.navigate();

await fullPageScreenshot(piggy.site, "./full-page");
```

### Example 7: Screenshot with Element Highlighting

```ts
async function screenshotWithHighlight(site: any, selector: string, outputPath: string) {
  // Highlight element before screenshot
  await site.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      const originalOutline = (element as HTMLElement).style.outline;
      (element as HTMLElement).style.outline = "3px solid #00cc66";
      (element as any).__originalOutline = originalOutline;
    }
  }, selector);
  
  await site.wait(200);
  await site.screenshot(outputPath);
  
  // Restore original style
  await site.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element && (element as any).__originalOutline !== undefined) {
      (element as HTMLElement).style.outline = (element as any).__originalOutline;
    }
  }, selector);
  
  console.log(`📸 Screenshot with highlighted element: ${selector}`);
}

// Usage
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

await screenshotWithHighlight(piggy.site, "#submit-button", "./highlighted-button.png");
```

### Example 8: Generate PDF from Multiple URLs

```ts
async function generateMultiPagePDF(site: any, urls: string[], outputPath: string) {
  const pdfs: string[] = [];
  
  for (const url of urls) {
    console.log(`Processing: ${url}`);
    await site.navigate(url);
    await site.wait(2000);
    
    const pdf = await site.pdf();
    pdfs.push(pdf);
  }
  
  // Note: Combining PDFs requires external library
  // Save individual PDFs for now
  for (let i = 0; i < pdfs.length; i++) {
    await Bun.write(`${outputPath}_page${i + 1}.pdf`, Buffer.from(pdfs[i], "base64"));
  }
  
  console.log(`📄 Saved ${pdfs.length} PDFs`);
}

// Usage
const urls = [
  "https://example.com/page1",
  "https://example.com/page2",
  "https://example.com/page3"
];

await generateMultiPagePDF(piggy.site, urls, "./report");
```

---

## Performance Tips

### Block Images for Faster Screenshots

```ts
// Block images before navigating
await piggy.site.blockImages();
await piggy.site.navigate("https://image-heavy-site.com");
await piggy.site.screenshot("./fast-screenshot.png");
await piggy.site.unblockImages();
```

### Use Headless Mode for Speed

```ts
// Headless is faster than headful for screenshots
await piggy.launch({ binary: "headless" });
```

### Wait for Content Before Screenshot

```ts
await piggy.site.navigate(url);
await piggy.site.waitForSelector(".content");
await piggy.site.wait(500); // Extra buffer for animations
await piggy.site.screenshot("./screenshot.png");
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `screenshot(filePath?)` | `filePath?: string` | `Promise<string>` | PNG screenshot (base64 or file path) |
| `pdf(filePath?)` | `filePath?: string` | `Promise<string>` | PDF document (base64 or file path) |
| `blockImages()` | — | `Promise<void>` | Block all images |
| `unblockImages()` | — | `Promise<void>` | Unblock images |

### Return Values

| Scenario | Returns |
|----------|---------|
| `screenshot()` with no path | Base64 string (starts with `data:image/png;base64,`) |
| `screenshot("./file.png")` | File path (`"./file.png"`) |
| `pdf()` with no path | Base64 string (starts with `data:application/pdf;base64,`) |
| `pdf("./file.pdf")` | File path (`"./file.pdf"`) |

---

## Type Definitions

```ts
type ScreenshotResult = string;  // base64 or file path
type PdfResult = string;         // base64 or file path
```

---

## Next Steps

- [Capture API](../capture) — Capture network traffic
- [API Server](../api-server) — Serve screenshots via API
- [Human API](../human) — Human-like scrolling before screenshots

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*