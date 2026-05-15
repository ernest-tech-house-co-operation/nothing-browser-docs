## `quickstart.md`

```markdown
# Piggy Quick Start

Get your first scraper running in under 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0 installed (or Node.js ≥ 18)
- Nothing Browser binary (see below)

---

## Installation

```bash
bun add nothing-browser
```

## Download the Binary

Download the Nothing Browser binary for your platform from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases).

**For most scraping tasks, use `headless`.**

| Platform | Headless Binary |
|----------|-----------------|
| Linux | `nothing-browser-headless-*-linux-x86_64.tar.gz` |
| Windows | `nothing-browser-headless-*-windows-x64.zip` |
| macOS | `nothing-browser-headless-*-macos.tar.gz` |

### Linux / macOS (Simple)

```bash
# Extract
tar -xzf nothing-browser-headless-*-linux-x86_64.tar.gz

# Make executable
chmod +x nothing-browser-headless

# Place in your project root
```

### Windows (Custom Path)

Extract the zip to a folder named `brow` in your project root:

```
C:\my-scraper\
├── brow\
│   └── nothing-browser-headless.exe
└── index.ts
```

---

## Your First Scraper

Create `scrape.ts`:

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("books", "https://books.toscrape.com");

await piggy.books.navigate();
await piggy.books.wait.selector({ selector: ".product_pod", state: "attached" });

const books = await piggy.books.evaluate(() =>
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
  }))
);

console.log(`Found ${books.length} books:`);
console.log(books.slice(0, 5));

await piggy.close();
```

## Run It

```bash
bun run scrape.ts
```

---

## Next Steps

- [Core Concepts](./core/launch) — Launch, register, connect
- [Find API](./find) — Query DOM elements
- [Provide API](./provide) — Extract structured data
- [API Server](./api-server) — Turn your scraper into a REST API

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*