# 🛒 Script Marketplace

Ready-to-use scrapers. Copy, paste, and run. No setup. No configuration. Just working code.

---

## Overview

The Script Marketplace is a collection of community-ready scrapers for popular websites. Each script is:

- ✅ **Ready to run** — Copy, paste, and execute
- ✅ **Self-documenting** — Includes OpenAPI docs
- ✅ **Modular** — Easy to modify for your needs

> ⚠️ **Note:** Websites change their HTML structure over time. If a selector returns `null`, update it manually. These scripts are starting points, not permanent solutions.

---

## Why Piggy?

Piggy is just a **command mapper** for the Nothing Browser binary. The library does almost nothing — it maps TypeScript commands to socket messages.

| Feature | Piggy | Puppeteer |
|---------|-------|-----------|
| Library size | ~50KB | ~50MB |
| Communication | Socket (fast) | CDP (complex) |
| Port to other languages | Trivial (just map commands) | Extremely complex |

**Piggy library code is so simple you could paste it into an LLM and get a working Go/Python/Rust version.**

Puppeteer? Not even close.

---

## Available Scripts

| Website | Script | Status | Features |
|---------|--------|--------|----------|
| [Amazon](./amazon) | `amazon.ts` | ✅ Available | Search, product details, pagination, API server |
| [eBay](./ebay) | `ebay.ts` | ✅ Available | Search, sold research, deals, trends, profit analysis |
| [Walmart](./walmart) | `walmart.ts` | 📋 Coming soon | Product search, inventory check |
| [Gemini/AI](./gemini) | `gemini.ts` | 📋 Coming soon | AI-powered scraping |

---

## Quick Start

### Step 1: Copy the script

```bash
# Create a new file
touch amazon-scraper.ts
```

### Step 2: Paste the code

Copy the entire script from the [Amazon scraper](./amazon) page into your file.

### Step 3: Install Piggy

```bash
bun add nothing-browser
```

### Step 4: Download the binary

Download `nothing-browser-headless` from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases) and place it in your project root.

```bash
# Make it executable (Linux/macOS)
chmod +x nothing-browser-headless
```

### Step 5: Run

```bash
bun run amazon-scraper.ts
```

### Step 6: Test the API

```bash
# Search for products
curl "http://localhost:3000/amazon/search?q=mattress&pages=3"

# Get product details
curl "http://localhost:3000/amazon/product?url=https://www.amazon.com/dp/B0DGNVSYX3"
```

---

## Sample Output

When you run the Amazon scraper, you get clean, structured JSON:

```json
{
  "asin": "B0DGNVSYX3",
  "title": "Intex 64449ED Dura-Beam Deluxe Plush Air Mattress",
  "price": "KES 11,631.21",
  "rating": "4.4 out of 5 stars",
  "image": "https://m.media-amazon.com/images/I/61dIljEKKIL._AC_UL320_.jpg",
  "url": "https://www.amazon.com/dp/B0DGNVSYX3"
}
```

**Few lines of code. Clean data. No bloat.**

---

## Will There Be a Nothing × Puppeteer Script?

**No.** Not from me.

Piggy uses **socket communication**. Puppeteer uses **CDP (Chrome DevTools Protocol)**. They're completely different engineering levels.

- Piggy library: ~50KB, just maps commands to socket messages
- Puppeteer library: ~50MB, entire CDP implementation

If someone manages to make CDP and socket communicate fast — like how Piggy currently works — I will gladly market it as "Use Puppeteer to control Nothing Browser."

But I won't code it myself. I have other priorities.

**Want to build it?** Open a PR. I'll endorse you.

---

## Selector Maintenance

Websites change their HTML structure frequently. If a script stops working:

1. Open the website in your browser
2. Right-click → Inspect the element you want
3. Find a unique class or attribute
4. Update the selector in the script

**Example:**
```typescript
// Old selector (broken — Amazon changed their HTML)
el.querySelector(".product-title")?.textContent

// New selector (fixed)
el.querySelector("h2 span")?.textContent
```

**Test before you commit.** Make sure your changes work.

---

## Contributing Scripts

Have a scraper for a website not listed?

1. Test your script thoroughly
2. Open a PR on [GitHub](https://github.com/BunElysiaReact/nothing-browser)
3. Include:
   - The full script
   - Sample output (at least 3 items)
   - Any special instructions

**Guidelines:**
- Use `actHuman(true)` for natural delays
- Include error handling where appropriate
- Add OpenAPI `detail` for documentation
- Save results to a JSON file

---

## Version Requirements

| Script | Min Binary | Min Library |
|--------|------------|-------------|
| Amazon | v0.1.12 | v0.0.18 |
| eBay | v0.1.12 | v0.0.18 |
| Walmart (coming) | v0.1.12 | v0.0.18 |

Check your versions:
```bash
./nothing-browser-headless --version
bun list | grep nothing-browser
```

See [Version Compatibility](../guide/piggy/version-compatibility) for details.

---

## Next Steps

- [Amazon Scraper](./amazon) — Get started with Amazon
- [eBay Scraper](./ebay) — Reseller intelligence API
- [Quick Start](../guide/piggy/quickstart) — Learn Piggy basics
- [Remote Deployment](../guide/piggy/remote-deployment) — Run on a VPS
- [Proxy Support](../guide/piggy/proxy-support) — Rotate IPs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
