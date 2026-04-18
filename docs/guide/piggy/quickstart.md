# Piggy Quick Start

Get your first scraper running in under 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0 installed
- Nothing Browser binary in your project root

## Installation

```bash
bun add nothing-browser
```

## Download the Binary

Download the headless binary for your platform from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases) and place it in your project root.

| Platform | Binary Name |
|----------|-------------|
| Linux | `nothing-browser-headless` |
| Windows | `nothing-browser-headless.exe` |
| macOS | `nothing-browser-headless` |

Make it executable (Linux/macOS):

```bash
chmod +x nothing-browser-headless
```

---

## Your First Scraper

Create `scrape.ts`:

```ts
import piggy from "nothing-browser";

// Launch the browser
await piggy.launch({ mode: "tab" });

// Register a site
await piggy.register("books", "https://books.toscrape.com");

// Navigate to the page
await piggy.books.navigate();

// Wait for content to load
await piggy.books.waitForSelector(".product_pod");

// Extract data
const books = await piggy.books.evaluate(() =>
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
    rating: (() => {
      const ratingClass = el.querySelector(".star-rating")?.className ?? "";
      const ratingMap: Record<string, number> = {
        "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5,
      };
      const key = ratingClass.replace("star-rating", "").trim();
      return ratingMap[key] ?? 0;
    })(),
    availability: el.querySelector(".availability")?.textContent?.trim() ?? "",
  }))
);

// Print results
console.log(`Found ${books.length} books:`);
console.log(books.slice(0, 5));

// Close the browser
await piggy.close();
```

## Run It

```bash
bun run scrape.ts
```

You should see output like:

```
Found 20 books:
[
  {
    title: "A Light in the Attic",
    price: "£51.77",
    rating: 3,
    availability: "In stock"
  },
  {
    title: "Tipping the Velvet",
    price: "£53.74",
    rating: 1,
    availability: "In stock"
  },
  ...
]
```

---

## With Human Mode (Avoid Detection)

Add natural human-like behavior:

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Enable human mode globally
piggy.actHuman(true);

await piggy.register("books", "https://books.toscrape.com");
await piggy.books.navigate();

// These actions will have random delays and natural patterns
await piggy.books.wait(500);  // random between 300-800ms
await piggy.books.click(".product_pod h3 a");
await piggy.books.scroll.by(400);

const title = await piggy.books.title();
console.log("Current page:", title);

await piggy.close();
```

---

## With Session Persistence (Stay Logged In)

Save and restore cookies, storage, and state:

```ts
import piggy from "nothing-browser";
import { existsSync, readFileSync, writeFileSync } from "fs";

const SESSION_FILE = "./session.json";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");

// Load previous session if exists
if (existsSync(SESSION_FILE)) {
  const saved = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
  await piggy.site.session.import(saved);
  console.log("Session restored");
}

await piggy.site.navigate();
await piggy.site.click("#login-button");
// ... do authenticated things ...

// Save session on exit
process.on("SIGINT", async () => {
  const session = await piggy.site.session.export();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  console.log("Session saved");
  await piggy.close();
  process.exit(0);
});
```

---

## With exposeFunction (RPC)

Call Node.js functions directly from browser JavaScript:

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Expose a Node.js function to the browser
await piggy.app.exposeFunction("saveToDatabase", async (data) => {
  console.log("Saving:", data);
  // Save to your database
  await db.users.insert(data);
  return { success: true, id: crypto.randomUUID() };
});

// Inject browser code that calls the exposed function
await piggy.app.evaluate(() => {
  document.querySelector("#submit").addEventListener("click", async () => {
    const result = await window.saveToDatabase({
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
    });
    console.log("Saved with ID:", result.id);
  });
});

await piggy.app.navigate();
```

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Deep dive into browser → Node.js calls
- [Request Interception](./interception) — Mock APIs, cache responses, block trackers
- [Multi-Site Parallel](./multi-site) — Scrape multiple sites simultaneously
- [Built-in API Server](./api-server) — Turn your scraper into a REST API

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
