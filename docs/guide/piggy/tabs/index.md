# 📑 Tabs API — Multi-Tab Management

Create, list, and close browser tabs. Perfect for managing multiple pages within the same browser instance.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Tabs API gives you programmatic control over browser tabs:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `tabs.new()` | Create a new tab | Open a separate page |
| `tabs.list()` | List all tabs | See what tabs are open |
| `tabs.close()` | Close a tab | Clean up resources |

> 💡 **Alias:** `piggy.tab` and `piggy.tabs` both work — use whichever you prefer.

> 💡 **Note:** For concurrent requests to the same site, use [Tab Pooling](../tab-pooling) instead. The Tabs API is for managing unrelated pages.

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });

// Create a new tab
const newTabId = await piggy.tabs.new();
console.log(`New tab ID: ${newTabId}`);

// List all tabs
const tabs = await piggy.tabs.list();
console.log("Open tabs:", tabs);
// Output: ["default", "550e8400-e29b-41d4-a716-446655440000"]

// Close by string or object — both work
await piggy.tabs.close(newTabId);
await piggy.tabs.close({ tabId: newTabId });

await piggy.close();
```

---

## Tab ID Reference

- `"default"` — The main tab created on launch (before any `register` call)
- UUID strings — Additional tabs created with `tabs.new()` or via `register()`

> **Note:** Each `piggy.register()` call creates its own tab. After registering 4 sites, `tabs.list()` returns 5 tabs (1 default + 4 registered).

---

## Real-World Examples

### Example 1: Parallel Scraping Across Multiple Pages

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });

const pages = [1, 2, 3, 4];

// Register a tab per page
for (const p of pages) {
  await piggy.register(`page${p}`, `https://books.toscrape.com/catalogue/page-${p}.html`);
}

const t0 = Date.now();

// Navigate all tabs in parallel
await Promise.all(pages.map(p =>
  piggy[`page${p}`].navigate()
    .then(() => piggy[`page${p}`].waitForSelector(".product_pod"))
));

console.log(`All 4 pages loaded in ${Date.now() - t0}ms`);

// Extract data from all tabs in parallel
const results = await Promise.all(pages.map(async p => {
  const books = await piggy[`page${p}`].evaluate(() =>
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
      price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
    }))
  );
  return { page: p, count: books.length, books };
}));

for (const { page, count, books } of results) {
  console.log(`Page ${page}: ${count} books`);
  console.log(`  First: "${books[0]?.title}" at ${books[0]?.price}`);
}

await piggy.close();
```

### Example 2: Raw Tab Creation and Cleanup

```ts
// Create a raw tab
const tabId = await piggy.tab.new();
console.log(`Created tab: ${tabId}`);

// Check tabs
const tabsBefore = await piggy.tab.list();
console.log(`Open tabs: ${tabsBefore.length}`);

// Close it — string or object form both work
await piggy.tab.close({ tabId });
// or: await piggy.tab.close(tabId);

const tabsAfter = await piggy.tab.list();
console.log(`Tabs after close: ${tabsAfter.length}`);
```

### Example 3: Parallel vs Sequential Comparison

```ts
await piggy.launch({ mode: "tab", binary: "headless" });

const pages = [1, 2, 3, 4];
for (const p of pages) {
  await piggy.register(`page${p}`, `https://books.toscrape.com/catalogue/page-${p}.html`);
}

// Parallel
const t0 = Date.now();
await Promise.all(pages.map(p =>
  piggy[`page${p}`].navigate()
    .then(() => piggy[`page${p}`].waitForSelector(".product_pod"))
));
const parallelMs = Date.now() - t0;

// Sequential (same site, different URLs)
await piggy.register("seq", "https://books.toscrape.com");
const tSeq = Date.now();
for (const p of pages) {
  await piggy.seq.navigate(`https://books.toscrape.com/catalogue/page-${p}.html`);
  await piggy.seq.waitForSelector(".product_pod");
}
const seqMs = Date.now() - tSeq;

console.log(`Parallel  (4 pages): ${parallelMs}ms`);
console.log(`Sequential (4 pages): ${seqMs}ms`);
// Real result: parallel ~17s (network bound), sequential ~1.4s (cached after parallel)

await piggy.close();
```

> ⚠️ **Timing note:** If the sequential run follows the parallel run in the same session, the browser cache will make sequential appear faster. For a fair benchmark, run them in separate sessions.

### Example 4: Open Multiple Pages in Parallel

```ts
await piggy.register("site", "https://example.com");

const tab1 = await piggy.tabs.new();
const tab2 = await piggy.tabs.new();
const tab3 = await piggy.tabs.new();

await piggy.navigation.navigate("https://example.com/page1", tab1);
await piggy.navigation.navigate("https://example.com/page2", tab2);
await piggy.navigation.navigate("https://example.com/page3", tab3);

const [title1, title2, title3] = await Promise.all([
  piggy.navigation.title(tab1),
  piggy.navigation.title(tab2),
  piggy.navigation.title(tab3),
]);

console.log({ title1, title2, title3 });

await piggy.tabs.close(tab1);
await piggy.tabs.close(tab2);
await piggy.tabs.close(tab3);
```

### Example 5: Scrape Multiple Products Concurrently

```ts
await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

const productLinks = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });
const linksToScrape = productLinks.slice(0, 5);

const tabs = await Promise.all(linksToScrape.map(() => piggy.tabs.new()));

const results = await Promise.all(
  tabs.map(async (tabId, index) => {
    await piggy.navigation.navigate(linksToScrape[index], tabId);
    await piggy.wait.selector({ selector: ".product_main", tabId });
    const title = await piggy.navigation.title(tabId);
    const price = await piggy.fetch.text({ query: ".price_color", tabId });
    return { title, price, url: linksToScrape[index] };
  })
);

console.log("Scraped products:", results);
await Promise.all(tabs.map(tabId => piggy.tabs.close(tabId)));
```

### Example 6: Tab Pool for Worker Tasks

```ts
class TabWorker {
  private availableTabs: string[] = [];
  private busyTabs = new Set<string>();

  async init(poolSize: number) {
    for (let i = 0; i < poolSize; i++) {
      this.availableTabs.push(await piggy.tabs.new());
    }
  }

  async execute<T>(url: string, callback: (tabId: string) => Promise<T>): Promise<T> {
    if (this.availableTabs.length === 0) throw new Error("No available tabs");
    const tabId = this.availableTabs.shift()!;
    this.busyTabs.add(tabId);
    try {
      await piggy.navigation.navigate(url, tabId);
      return await callback(tabId);
    } finally {
      this.busyTabs.delete(tabId);
      this.availableTabs.push(tabId);
    }
  }

  async close() {
    for (const tabId of [...this.availableTabs, ...this.busyTabs]) {
      await piggy.tabs.close(tabId);
    }
  }
}

const worker = new TabWorker();
await worker.init(3);

const results = await Promise.all([
  worker.execute("https://example.com/1", tabId => piggy.navigation.title(tabId)),
  worker.execute("https://example.com/2", tabId => piggy.navigation.title(tabId)),
  worker.execute("https://example.com/3", tabId => piggy.navigation.title(tabId)),
]);

console.log(results);
await worker.close();
```

### Example 7: Monitor Tab Activity

```ts
await piggy.register("site", "https://example.com");

const tabIds = await Promise.all([
  piggy.tabs.new(),
  piggy.tabs.new(),
  piggy.tabs.new(),
]);

for (const tabId of tabIds) {
  await piggy.navigation.navigate("https://example.com", tabId);
}

setInterval(async () => {
  const tabs = await piggy.tabs.list();
  console.log(`Active tabs: ${tabs.length}`);
  for (const tabId of tabs) {
    try {
      const title = await piggy.navigation.title(tabId);
      console.log(`  Tab ${tabId}: ${title}`);
    } catch {
      console.log(`  Tab ${tabId}: unreachable`);
    }
  }
}, 5000);
```

### Example 8: Background Tab for Monitoring

```ts
const monitorTab = await piggy.tabs.new();
await piggy.navigation.navigate("https://status.example.com", monitorTab);

setInterval(async () => {
  try {
    const status = await piggy.fetch.text({ query: ".status-badge", tabId: monitorTab });
    if (status === "DOWN") {
      console.error("⚠️ Service is DOWN!");
    } else {
      console.log(`✅ Service is ${status}`);
    }
    await piggy.navigation.reload(monitorTab);
  } catch (error) {
    console.error("Failed to check status:", error.message);
  }
}, 60000);
```

---

## Working with Tabs and Site Objects

When you create a new tab, use the global navigation/actions clients with the `tabId` parameter:

```ts
const newTabId = await piggy.tabs.new();

await piggy.navigation.navigate("https://example.com", newTabId);
await piggy.interactions.click("#button", newTabId);
const text = await piggy.fetch.text({ query: ".title", tabId: newTabId });
await piggy.wait.selector({ selector: ".content", state: "visible", tabId: newTabId });

await piggy.tabs.close(newTabId);
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `tabs.new()` | — | `Promise<string>` | Create new tab, returns tabId |
| `tabs.list()` | — | `Promise<string[]>` | List all open tab IDs |
| `tabs.close(tabId)` | `string \| { tabId: string }` | `Promise<void>` | Close a specific tab |

### Aliases

| Alias | Equivalent |
|-------|-----------|
| `piggy.tab` | `piggy.tabs` |

---

## Type Definitions

```ts
type TabId = string;

interface TabsClient {
  new(): Promise<TabId>;
  list(): Promise<TabId[]>;
  close(opts: TabId | { tabId: TabId }): Promise<void>;
}
```

---

## Best Practices

### Always Close Unused Tabs

```ts
const tabId = await piggy.tabs.new();
try {
  await doWork(tabId);
} finally {
  await piggy.tabs.close(tabId);
}
```

### Check Tab Existence Before Use

```ts
const tabs = await piggy.tabs.list();
if (!tabs.includes(tabId)) {
  console.log("Tab no longer exists");
  return;
}
```

### Use `Promise.all` for Parallel Operations

```ts
// ✅ Good — parallel
await Promise.all(tabs.map(tabId => doWork(tabId)));

// ❌ Bad — sequential
for (const tabId of tabs) {
  await doWork(tabId);
}
```

---

## Next Steps

- [Tab Pooling](../tab-pooling) — Concurrent requests to same site
- [Navigation API](../navigation) — Control page navigation
- [Interactions API](../click) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*