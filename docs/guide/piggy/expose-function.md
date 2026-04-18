# 🔥 exposeFunction — Browser → Node.js RPC

**The flagship feature of Piggy.**

Call Node.js functions directly from browser JavaScript. Real-time, bidirectional communication between your scraper and the page.

---

## What Is RPC?

RPC (Remote Procedure Call) lets you call Node.js functions from inside the browser page. When the browser calls `window.myFunction()`, Piggy captures that call, sends it to your Node.js handler, and returns the result back to the browser.

```
Browser JavaScript                    Node.js
─────────────────                     ───────
window.saveToDatabase({...}) ──────► async (data) => {
                                          await db.insert(data)
                                          return { id: 123 }
                                      }
                                      │
                                      ▼
Promise resolves ◄────────────────── { id: 123 }
```

---

## Basic Example

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Expose a Node.js function to the browser
await piggy.app.exposeFunction("saveToDatabase", async (data) => {
  console.log("Received from browser:", data);
  
  // Do any Node.js operation
  const result = await db.users.insert({
    name: data.name,
    email: data.email,
    timestamp: Date.now()
  });
  
  // Return value goes back to browser
  return { success: true, id: result.id };
});

// Inject browser code that calls the exposed function
await piggy.app.evaluate(() => {
  document.querySelector("#submit").addEventListener("click", async () => {
    const result = await window.saveToDatabase({
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
    });
    
    console.log("Saved with ID:", result.id);
    alert("Data saved!");
  });
});

await piggy.app.navigate();
```

---

## Real-World Examples

### 1. WhatsApp Web Message Listener

```ts
await piggy.register("whatsapp", "https://web.whatsapp.com");

// Expose function to handle new messages
await piggy.whatsapp.exposeFunction("onNewMessage", async (message) => {
  console.log("📱 New message:", message);
  
  // Save to database
  await db.messages.insert({
    text: message.text,
    sender: message.sender,
    timestamp: message.timestamp,
  });
  
  // Send to your own WebSocket clients
  wsServer.clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
  
  return { saved: true, id: crypto.randomUUID() };
});

// Inject message listener
await piggy.whatsapp.evaluate(() => {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.message-in:not([data-seen])').forEach(el => {
      el.dataset.seen = '1';
      
      // Call Node.js function
      window.onNewMessage({
        text: el.innerText,
        timestamp: Date.now(),
        sender: el.querySelector('.sender')?.innerText,
      }).then(result => {
        console.log('Message saved with ID:', result.id);
        el.style.borderLeft = '3px solid green';
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});

console.log("Listening for WhatsApp messages...");
```

### 2. Authentication Handler

```ts
await piggy.register("site", "https://example.com");

// Expose auth handler
await piggy.site.exposeFunction("auth", async ({ username, password }) => {
  const response = await fetch("https://api.example.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.token) {
    // Store token for later use
    await redis.set(`session:${username}`, data.token);
    return { success: true, token: data.token, user: data.user };
  }
  
  return { success: false, error: data.message };
});

// Browser login form
await piggy.site.evaluate(() => {
  const form = document.querySelector("#login-form");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const result = await window.auth({
      username: form.querySelector("#username").value,
      password: form.querySelector("#password").value,
    });
    
    if (result.success) {
      localStorage.setItem("token", result.token);
      window.location.href = "/dashboard";
    } else {
      alert("Login failed: " + result.error);
    }
  });
});

await piggy.site.navigate("https://example.com/login");
```

### 3. Real-time Stock Ticker

```ts
await piggy.register("trading", "https://tradingview.com");

// Expose function to receive stock updates
await piggy.trading.exposeFunction("onTrade", async (trade) => {
  console.log(`💰 ${trade.symbol}: $${trade.price} @ ${trade.volume}`);
  
  // Store in time-series database
  await influx.writePoint('trades', {
    measurement: 'stock_trades',
    fields: {
      price: trade.price,
      volume: trade.volume,
    },
    tags: { symbol: trade.symbol },
    timestamp: Date.now()
  });
  
  return { received: true };
});

// Intercept WebSocket messages
await piggy.trading.evaluate(() => {
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    const ws = new originalWebSocket(url, protocols);
    
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade') {
          // Send to Node.js
          window.onTrade(data.trade);
        }
      } catch (e) {}
    });
    
    return ws;
  };
});

await piggy.trading.navigate();
```

### 4. Captcha Solver Integration

```ts
await piggy.register("site", "https://example.com");

// Expose captcha solver
await piggy.site.exposeFunction("solveCaptcha", async (imageData) => {
  // Send to captcha solving service
  const response = await fetch("https://2captcha.com/in.php", {
    method: "POST",
    body: new URLSearchParams({
      key: process.env.TWO_CAPTCHA_KEY,
      method: "base64",
      body: imageData
    })
  });
  
  const captchaId = await response.text();
  
  // Wait for solution
  let solution = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const result = await fetch(`https://2captcha.com/res.php?key=${process.env.TWO_CAPTCHA_KEY}&action=get&id=${captchaId}`);
    const text = await result.text();
    
    if (text.includes("OK|")) {
      solution = text.split("|")[1];
      break;
    }
  }
  
  return { solution };
});

// Inject captcha handler
await piggy.site.evaluate(() => {
  async function handleCaptcha() {
    const canvas = document.querySelector("#captcha-image");
    const imageData = canvas.toDataURL().split(",")[1];
    
    const result = await window.solveCaptcha(imageData);
    document.querySelector("#captcha-input").value = result.solution;
    document.querySelector("#submit").click();
  }
  
  handleCaptcha();
});
```

---

## exposeAndInject — One Call

Combine expose and injection in a single call:

```ts
await piggy.site.exposeAndInject(
  "onMessage",           // Function name
  async (data) => {      // Node.js handler
    console.log("Message:", data);
    return { received: true };
  },
  (fnName) => `          // Injection JS (runs in browser)
    setInterval(() => {
      const msg = document.querySelector('.message')?.innerText;
      if (msg) window.${fnName}({ text: msg });
    }, 1000);
  `
);
```

---

## Manage Exposed Functions

```ts
// Remove specific function
await piggy.site.unexposeFunction("saveToDatabase");

// Remove all functions for this site
await piggy.site.clearExposedFunctions();

// Check if function exists (in browser)
const exists = await piggy.site.evaluate(() => typeof window.saveToDatabase === "function");
```

---

## Global Expose (All Tabs)

Expose a function to every tab and future tabs:

```ts
// Available to all sites
await piggy.expose("logToServer", async (data) => {
  console.log("[Browser]", data);
  await analytics.track(data.event, data.properties);
  return { logged: true };
});

// Any page can call: window.logToServer({ event: 'pageview' })

// Remove global expose
await piggy.unexpose("logToServer");
```

---

## Error Handling

```ts
// In Node.js handler
await piggy.site.exposeFunction("risky", async (data) => {
  try {
    const result = await someAsyncOperation(data);
    return { success: true, result };
  } catch (error) {
    // Error propagates to browser as rejected Promise
    throw new Error(`Operation failed: ${error.message}`);
  }
});

// In browser
try {
  const result = await window.risky({ foo: "bar" });
  console.log(result);
} catch (error) {
  console.error("Node.js error:", error.message);
}
```

---

## Performance

| Operation | Typical Latency |
|-----------|-----------------|
| First call (cold) | ~250ms |
| Subsequent calls | ~50-100ms |
| Large payload (1MB) | ~200ms |

The function survives page navigations and works with both tab and process modes.

---

## How It Works

1. **Browser injects stub**: `window.fnName` becomes a Promise-returning function
2. **Browser queues calls**: Arguments are pushed to internal queue
3. **C++ picks up queue**: Polls the queue every 250ms
4. **Signal to Node.js**: Server broadcasts to all connected clients
5. **Your handler runs**: TypeScript handler processes the data
6. **Result returns**: Promise in browser resolves with your return value

---

## API Reference

| Method | Description |
|--------|-------------|
| `site.exposeFunction(name, handler)` | Expose function to this site |
| `site.unexposeFunction(name)` | Remove exposed function |
| `site.clearExposedFunctions()` | Remove all functions |
| `site.exposeAndInject(name, handler, js)` | Expose + inject in one call |
| `piggy.expose(name, handler, tabId?)` | Expose globally |
| `piggy.unexpose(name, tabId?)` | Remove global expose |

---

## Next Steps

- [Request Interception](./interception) — Mock APIs, cache responses
- [Data Extraction](./evaluate) — Extract data with evaluate()
- [Built-in API Server](./api-server) — Turn exposed functions into REST APIs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
```

Now **`guide/piggy/evaluate.md`** (data extraction):

```markdown
# 📊 Evaluate — Data Extraction

Execute JavaScript directly in the browser page and get results back to Node.js.

---

## Basic Evaluate

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("site", "https://example.com");
await piggy.site.navigate();

// Simple evaluation
const title = await piggy.site.evaluate(() => document.title);
console.log("Page title:", title);

// Return objects
const data = await piggy.site.evaluate(() => ({
  url: window.location.href,
  userAgent: navigator.userAgent,
  screenWidth: screen.width,
  screenHeight: screen.height,
}));

console.log(data);
```

---

## Extract Multiple Elements

```ts
// Get all product data
const products = await piggy.site.evaluate(() => {
  return Array.from(document.querySelectorAll(".product")).map(el => ({
    name: el.querySelector(".name")?.textContent?.trim(),
    price: el.querySelector(".price")?.textContent?.trim(),
    image: el.querySelector("img")?.src,
    link: el.querySelector("a")?.href,
  }));
});

console.log(`Found ${products.length} products`);
```

---

## Pass Arguments to Evaluate

```ts
// Pass data from Node.js to browser
const selector = ".product-pod";
const minPrice = 20;

const items = await piggy.site.evaluate(
  (sel, min) => {
    return Array.from(document.querySelectorAll(sel))
      .filter(el => {
        const price = parseFloat(el.querySelector(".price")?.textContent?.replace("£", "") || "0");
        return price >= min;
      })
      .map(el => ({
        title: el.querySelector("h3 a")?.textContent,
        price: el.querySelector(".price")?.textContent,
      }));
  },
  selector,  // argument 1
  minPrice    // argument 2
);
```

---

## Real-World Examples

### 1. Scrape Product Listing

```ts
await piggy.register("shop", "https://books.toscrape.com");
await piggy.shop.navigate();

const books = await piggy.shop.evaluate(() => {
  const ratingMap: Record<string, number> = {
    "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5
  };
  
  return Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    title: el.querySelector("h3 a")?.getAttribute("title") ?? "",
    price: el.querySelector(".price_color")?.textContent?.trim() ?? "",
    rating: ratingMap[el.querySelector(".star-rating")?.className.replace("star-rating", "").trim() ?? ""] ?? 0,
    availability: el.querySelector(".availability")?.textContent?.trim() ?? "",
    inStock: (el.querySelector(".availability")?.textContent?.trim() || "").includes("In stock"),
    imageUrl: el.querySelector("img")?.src ?? "",
  }));
});

console.log(books);
```

### 2. Extract Table Data

```ts
const tableData = await piggy.site.evaluate(() => {
  const rows = document.querySelectorAll("table tbody tr");
  
  return Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      id: cells[0]?.textContent?.trim(),
      name: cells[1]?.textContent?.trim(),
      email: cells[2]?.textContent?.trim(),
      status: cells[3]?.textContent?.trim(),
    };
  });
});
```

### 3. Infinite Scroll Pagination

```ts
async function scrapeAllProducts() {
  let allProducts: any[] = [];
  let hasMore = true;
  
  while (hasMore) {
    // Get current products
    const products = await piggy.site.evaluate(() => {
      return Array.from(document.querySelectorAll(".product")).map(el => ({
        title: el.querySelector(".title")?.textContent,
        price: el.querySelector(".price")?.textContent,
      }));
    });
    
    allProducts.push(...products);
    
    // Check if "Load More" exists
    const hasLoadMore = await piggy.site.evaluate(() => {
      const btn = document.querySelector("#load-more");
      return btn !== null && btn instanceof HTMLElement && !btn.disabled;
    });
    
    if (!hasLoadMore) break;
    
    // Click load more and wait
    await piggy.site.click("#load-more");
    await piggy.site.wait(2000); // Wait for new content
  }
  
  return allProducts;
}

const allProducts = await scrapeAllProducts();
console.log(`Scraped ${allProducts.length} products`);
```

### 4. Monitor DOM Changes

```ts
// Start observing DOM changes
await piggy.site.evaluate(() => {
  window.__mutations = [];
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      window.__mutations.push({
        type: mutation.type,
        target: mutation.target.tagName,
        addedNodes: mutation.addedNodes.length,
        removedNodes: mutation.removedNodes.length,
        timestamp: Date.now()
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  window.__getMutations = () => [...window.__mutations];
  window.__clearMutations = () => { window.__mutations = []; };
});

// Later, get mutations
const mutations = await piggy.site.evaluate(() => window.__getMutations());
console.log(`Detected ${mutations.length} DOM changes`);
```

### 5. Form Data Extraction

```ts
const formData = await piggy.site.evaluate(() => {
  const form = document.querySelector("#checkout-form");
  if (!form) return null;
  
  const formData = new FormData(form as HTMLFormElement);
  const data: Record<string, any> = {};
  
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  return data;
});

console.log("Form data:", formData);
```

---

## Helper Methods

### fetchText

```ts
// Get text content of first matching element
const heading = await piggy.site.fetchText("h1");
console.log(heading); // "Welcome to our store"

// Get text from specific element
const price = await piggy.site.fetchText(".product-price");
```

### fetchLinks

```ts
// Get all links on page
const allLinks = await piggy.site.fetchLinks("a");
// Returns array of href strings

// Get links matching selector
const productLinks = await piggy.site.fetchLinks(".product a");
```

### fetchImages

```ts
// Get all image URLs
const allImages = await piggy.site.fetchImages("img");

// Get product images only
const productImages = await piggy.site.fetchImages(".product-img");
```

### search

```ts
// CSS selector search
const element = await piggy.site.search.css("#main-content");
const allDivs = await piggy.site.search.css("div.container");

// Get by ID
const header = await piggy.site.search.id("header");
```

---

## Performance Tips

```ts
// ❌ Bad: Multiple evaluate calls
for (const item of items) {
  const text = await piggy.site.evaluate((sel) => 
    document.querySelector(sel)?.textContent, 
    item.selector
  );
}

// ✅ Good: One evaluate call with batch processing
const texts = await piggy.site.evaluate((selectors) => {
  return selectors.map(sel => 
    document.querySelector(sel)?.textContent
  );
}, items.map(i => i.selector));
```

---

## Error Handling

```ts
try {
  const result = await piggy.site.evaluate(() => {
    // This will throw in browser
    return document.querySelector("#non-existent").textContent;
  });
} catch (error) {
  console.error("Evaluation failed:", error.message);
  // Error from browser JavaScript is propagated
}
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `evaluate(js, ...args)` | Execute JavaScript, return result |
| `fetchText(selector)` | Get text content of element |
| `fetchLinks(selector?)` | Get all href attributes |
| `fetchImages(selector?)` | Get all src attributes |
| `search.css(query)` | Query CSS selector |
| `search.id(id)` | Get element by ID |

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser
- [Request Interception](./interception) — Mock APIs, cache responses
- [Network Capture](./network-capture) — Capture HTTP/WebSocket traffic

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
