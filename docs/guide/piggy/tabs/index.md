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

// Close the new tab
await piggy.tabs.close(newTabId);

await piggy.close();
```

---

## Tab ID Reference

- `"default"` — The main tab created when you register a site
- UUID strings — Additional tabs created with `tabs.new()`

---

## Real-World Examples

### Example 1: Open Multiple Pages in Parallel

```ts
await piggy.register("site", "https://example.com");

// Create tabs for different pages
const tab1 = await piggy.tabs.new();
const tab2 = await piggy.tabs.new();
const tab3 = await piggy.tabs.new();

// Navigate each tab to different URLs
await piggy.navigation.navigate("https://example.com/page1", tab1);
await piggy.navigation.navigate("https://example.com/page2", tab2);
await piggy.navigation.navigate("https://example.com/page3", tab3);

// Get titles in parallel
const [title1, title2, title3] = await Promise.all([
  piggy.navigation.title(tab1),
  piggy.navigation.title(tab2),
  piggy.navigation.title(tab3)
]);

console.log({ title1, title2, title3 });

// Clean up
await piggy.tabs.close(tab1);
await piggy.tabs.close(tab2);
await piggy.tabs.close(tab3);
```

### Example 2: Scrape Multiple Products Concurrently

```ts
await piggy.register("shop", "https://books.toscrape.com");

// Get product links from main tab
await piggy.shop.navigate();
const productLinks = await piggy.shop.fetch.links({ query: ".product_pod h3 a" });

// Limit to first 5
const linksToScrape = productLinks.slice(0, 5);

// Create a tab for each product
const tabs = await Promise.all(linksToScrape.map(() => piggy.tabs.new()));

// Scrape each product in parallel
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

// Close all tabs
await Promise.all(tabs.map(tabId => piggy.tabs.close(tabId)));
```

### Example 3: Monitor Tab Activity

```ts
await piggy.register("site", "https://example.com");

// Create several tabs
const tabIds = await Promise.all([
  piggy.tabs.new(),
  piggy.tabs.new(),
  piggy.tabs.new()
]);

// Navigate each
for (const tabId of tabIds) {
  await piggy.navigation.navigate("https://example.com", tabId);
}

// Check which tabs have finished loading
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

### Example 4: Tab Pool for Worker Tasks

```ts
class TabWorker {
  private availableTabs: string[] = [];
  private busyTabs = new Set<string>();
  
  async init(poolSize: number) {
    for (let i = 0; i < poolSize; i++) {
      const tabId = await piggy.tabs.new();
      this.availableTabs.push(tabId);
    }
  }
  
  async execute<T>(url: string, callback: (tabId: string) => Promise<T>): Promise<T> {
    if (this.availableTabs.length === 0) {
      throw new Error("No available tabs");
    }
    
    const tabId = this.availableTabs.shift()!;
    this.busyTabs.add(tabId);
    
    try {
      await piggy.navigation.navigate(url, tabId);
      const result = await callback(tabId);
      return result;
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

// Usage
const worker = new TabWorker();
await worker.init(3);

const results = await Promise.all([
  worker.execute("https://example.com/1", async (tabId) => {
    return await piggy.navigation.title(tabId);
  }),
  worker.execute("https://example.com/2", async (tabId) => {
    return await piggy.navigation.title(tabId);
  }),
  worker.execute("https://example.com/3", async (tabId) => {
    return await piggy.navigation.title(tabId);
  })
]);

console.log(results);
await worker.close();
```

### Example 5: Compare Two Pages Side by Side

```ts
await piggy.register("site", "https://example.com");

// Create two tabs
const tabA = await piggy.tabs.new();
const tabB = await piggy.tabs.new();

// Navigate to different versions
await piggy.navigation.navigate("https://example.com/v1", tabA);
await piggy.navigation.navigate("https://example.com/v2", tabB);

// Take screenshots
await piggy.media.screenshot("./v1.png", tabA);
await piggy.media.screenshot("./v2.png", tabB);

// Compare titles
const titleA = await piggy.navigation.title(tabA);
const titleB = await piggy.navigation.title(tabB);

console.log(`V1 title: ${titleA}`);
console.log(`V2 title: ${titleB}`);

// Clean up
await piggy.tabs.close(tabA);
await piggy.tabs.close(tabB);
```

### Example 6: Error Recovery with Fresh Tab

```ts
async function scrapeWithRetry(site: any, url: string, maxRetries = 3) {
  let currentTabId = "default";
  
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await site.navigate(url);
      await site.wait.selector({ selector: ".content", state: "visible" });
      return await site.provide.text({ selector: ".content" });
      
    } catch (error) {
      console.log(`Attempt ${i} failed:`, error.message);
      
      if (i === maxRetries) throw error;
      
      // Create a fresh tab for retry
      const newTabId = await piggy.tabs.new();
      await piggy.tabs.close(currentTabId);
      currentTabId = newTabId;
      
      // Update site's internal tab reference
      // Note: This requires re-registering or updating the site object
      await site.close();
      await piggy.register("site", url);
      
      await site.wait(2000); // Backoff
    }
  }
}
```

### Example 7: Background Tab for Monitoring

```ts
// Create a background tab for monitoring
const monitorTab = await piggy.tabs.new();

// Navigate to status page
await piggy.navigation.navigate("https://status.example.com", monitorTab);

// Check status every minute
setInterval(async () => {
  try {
    const status = await piggy.fetch.text({ 
      query: ".status-badge", 
      tabId: monitorTab 
    });
    
    if (status === "DOWN") {
      console.error("⚠️ Service is DOWN!");
      // Trigger alert
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

When you create a new tab, you can use the global navigation/actions clients with the `tabId` parameter:

```ts
// Create a new tab
const newTabId = await piggy.tabs.new();

// Use navigation client with tabId
await piggy.navigation.navigate("https://example.com", newTabId);

// Use interactions client with tabId
await piggy.interactions.click("#button", newTabId);

// Use fetch client with tabId
const text = await piggy.fetch.text({ query: ".title", tabId: newTabId });

// Use wait client with tabId
await piggy.wait.selector({ selector: ".content", state: "visible", tabId: newTabId });

// Close when done
await piggy.tabs.close(newTabId);
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `tabs.new()` | — | `Promise<string>` | Create new tab, returns tabId |
| `tabs.list()` | — | `Promise<string[]>` | List all open tab IDs |
| `tabs.close(tabId)` | `tabId: string` | `Promise<void>` | Close a specific tab |

### Tab ID Notes

| Tab ID | Description |
|--------|-------------|
| `"default"` | Main tab (created when you register a site) |
| UUID string | Tabs created with `tabs.new()` |

---

## Type Definitions

```ts
type TabId = string;

interface TabsClient {
  new(): Promise<TabId>;
  list(): Promise<TabId[]>;
  close(tabId: TabId): Promise<void>;
}
```

---

## Best Practices

### Always Close Unused Tabs

```ts
const tabId = await piggy.tabs.new();
try {
  // use tab
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