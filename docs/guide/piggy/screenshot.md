# 📸 Screenshot & PDF

Capture screenshots and generate PDFs of web pages. Perfect for visual verification, archiving, and generating reports.

---

## Overview

| Feature | Method | Output |
|---------|--------|--------|
| **Screenshot** | `screenshot(filePath?)` | PNG image (base64 or file) |
| **PDF** | `pdf(filePath?)` | PDF document (base64 or file) |

---

## Basic Screenshot

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// Save screenshot to file
await piggy.site.screenshot("./screenshot.png");

// Get screenshot as base64 (no file saved)
const base64 = await piggy.site.screenshot();
console.log(base64); // data:image/png;base64,iVBORw0KG...

// Save with timestamp
const timestamp = Date.now();
await piggy.site.screenshot(`./screenshots/page-${timestamp}.png`);
```

---

## Basic PDF

```ts
// Save page as PDF
await piggy.site.pdf("./page.pdf");

// Get PDF as base64
const pdfBase64 = await piggy.site.pdf();
console.log(pdfBase64); // data:application/pdf;base64,JVBERi0...

// Save with custom name
await piggy.site.pdf(`./reports/report-${new Date().toISOString().split('T')[0]}.pdf`);
```

---

## Real-World Examples

### 1. Screenshot Multiple Pages

```ts
await piggy.register("shop", "https://books.toscrape.com");

// Get all product links
const productLinks = await piggy.shop.fetchLinks(".product_pod h3 a");

// Screenshot each product page
for (let i = 0; i < Math.min(10, productLinks.length); i++) {
  await piggy.shop.navigate(productLinks[i]);
  await piggy.shop.waitForSelector(".product_main");
  
  const title = await piggy.shop.fetchText("h1");
  const filename = `./screenshots/${title.replace(/[^a-z0-9]/gi, '_')}.png`;
  
  await piggy.shop.screenshot(filename);
  console.log(`📸 Screenshot ${i + 1}: ${filename}`);
}

await piggy.close();
```

### 2. Visual Regression Testing

```ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as fs from "fs/promises";

// Baseline directory
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
  
  // Use external tool like pixelmatch (install: bun add pixelmatch pngjs)
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
await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Capture baseline (first run)
await piggy.app.navigate("https://example.com/home");
await captureBaseline(piggy.app, "homepage");

await piggy.app.navigate("https://example.com/product");
await captureBaseline(piggy.app, "product-page");

// Later, compare after changes
await piggy.app.navigate("https://example.com/home");
const homeMatches = await compareVisual(piggy.app, "homepage");

await piggy.app.navigate("https://example.com/product");
const productMatches = await compareVisual(piggy.app, "product-page");

if (!homeMatches || !productMatches) {
  console.log("❌ Visual regression detected!");
}
```

### 3. Generate Report with Screenshots

```ts
async function generateReport(site: any, urls: string[], outputFile: string) {
  const report = {
    generated: new Date().toISOString(),
    pages: [] as any[]
  };
  
  for (const url of urls) {
    console.log(`Processing: ${url}`);
    
    await site.navigate(url);
    await site.wait(2000); // Wait for dynamic content
    
    const title = await site.title();
    const screenshot = await site.screenshot(); // base64
    
    report.pages.push({
      url,
      title,
      screenshot: screenshot.substring(0, 100) + "...", // Truncate for display
      timestamp: Date.now()
    });
    
    // Save full screenshot to file
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
    .url { color: #00cc66; font-size: 14px; }
    .title { font-size: 18px; font-weight: bold; }
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
await piggy.launch({ mode: "tab" });
await piggy.register("report", "https://example.com");

const urls = [
  "https://example.com",
  "https://example.com/products",
  "https://example.com/about",
  "https://example.com/contact"
];

await generateReport(piggy.report, urls, "./visual-report.html");
await piggy.close();
```

### 4. Screenshot with Custom Viewport

```ts
// Note: Viewport size is controlled by the browser window
// For headless mode, you can set size via launch options

// For different screenshot sizes, you can:
// 1. Set browser window size before launching
// 2. Use CSS zoom in evaluate

async function screenshotWithSize(site: any, width: number, height: number, outputPath: string) {
  // Set viewport via JavaScript
  await site.evaluate((w, h) => {
    window.resizeTo(w, h);
    document.body.style.zoom = `${Math.min(w / 1920, h / 1080)}`;
  }, width, height);
  
  await site.wait(500); // Wait for resize
  await site.screenshot(outputPath);
}

// Usage
await piggy.launch({ mode: "tab", binary: "headful" }); // Need headful for resize
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// Screenshot at different sizes
await screenshotWithSize(piggy.site, 375, 667, "./mobile.png");    // iPhone
await screenshotWithSize(piggy.site, 768, 1024, "./tablet.png");   // iPad
await screenshotWithSize(piggy.site, 1920, 1080, "./desktop.png"); // Desktop
```

### 5. Screenshot After Each Action (Debugging)

```ts
async function debugWithScreenshots(site: any, debugDir: string) {
  let step = 0;
  
  await fs.mkdir(debugDir, { recursive: true });
  
  return {
    async capture(name: string) {
      step++;
      const timestamp = Date.now();
      const filename = `${debugDir}/${step}_${timestamp}_${name}.png`;
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

### 6. Full Page Screenshot (Scrolling)

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
    await site.wait(300); // Wait for lazy loading
    
    const screenshot = await site.screenshot();
    screenshots.push(screenshot);
  }
  
  // Stitch screenshots together (requires external library)
  // For now, save individual sections
  for (let i = 0; i < screenshots.length; i++) {
    await Bun.write(`${outputPath}_part${i + 1}.png`, Buffer.from(screenshots[i], "base64"));
  }
  
  console.log(`📸 Captured ${screenshots.length} sections`);
}

// Usage
await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com/long-page");
await piggy.site.navigate();
await piggy.site.wait(2000);

await fullPageScreenshot(piggy.site, "./full-page");
```

### 7. Screenshot with Element Highlighting

```ts
async function screenshotWithHighlight(site: any, selector: string, outputPath: string) {
  // Highlight element before screenshot
  await site.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      const originalOutline = (element as HTMLElement).style.outline;
      (element as HTMLElement).style.outline = "3px solid #00cc66";
      
      // Store original style to restore later
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
await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

await screenshotWithHighlight(piggy.site, "#submit-button", "./highlighted-button.png");
```

---

## API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `screenshot(filePath?)` | Take screenshot of current page | `string` (base64 if no path, otherwise file path) |
| `pdf(filePath?)` | Generate PDF of current page | `string` (base64 if no path, otherwise file path) |

### Screenshot Output

- **With filePath**: Saves PNG to disk, returns file path
- **Without filePath**: Returns base64 string (starts with `data:image/png;base64,`)

### PDF Output

- **With filePath**: Saves PDF to disk, returns file path
- **Without filePath**: Returns base64 string (starts with `data:application/pdf;base64,`)

---

## Next Steps

- [Built-in API Server](./api-server) — Turn screenshots into API endpoints
- [Multi-Site Parallel](./multi-site) — Screenshot multiple sites simultaneously
- [Network Capture](./network-capture) — Capture requests alongside screenshots

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
