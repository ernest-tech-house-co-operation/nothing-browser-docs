# 🔥 Expose API — Call Node.js from Browser (RPC)

The flagship feature of Piggy. Expose Node.js functions to the browser and call them directly from page JavaScript. Real-time, bidirectional communication between your scraper and the page.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

RPC (Remote Procedure Call) lets you call Node.js functions from inside the browser page.

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

| Method | Scope | Use Case |
|--------|-------|----------|
| `exposeFunction()` | Single site | Site-specific functionality |
| `piggy.expose()` | All tabs | Shared services (logging, auth) |
| `exposeAndInject()` | Single site | Expose + inject in one call |

---

## Basic Usage

### Site-Specific Expose

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
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

## Expose a Function

### `site.exposeFunction(name, handler)`

Exposes a Node.js function to a specific site.

```ts
await piggy.site.exposeFunction("multiply", async (data) => {
  return data.a * data.b;
});

// Browser side
const result = await window.multiply({ a: 6, b: 7 });
// → 42
```

### Handler Return Values

```ts
// Simple return
await piggy.site.exposeFunction("getTime", async () => {
  return Date.now();
});

// Return object
await piggy.site.exposeFunction("getUser", async (id) => {
  return { id, name: "John", email: "john@example.com" };
});

// Error handling
await piggy.site.exposeFunction("riskyOperation", async (data) => {
  try {
    const result = await someAsyncOperation(data);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

## Unexpose a Function

### `site.unexposeFunction(name)`

Removes an exposed function.

```ts
await piggy.site.unexposeFunction("saveToDatabase");
```

### `site.clearExposedFunctions()`

Removes all exposed functions for a site.

```ts
await piggy.site.clearExposedFunctions();
```

---

## Global Expose (All Tabs)

### `piggy.expose(name, handler, tabId?)`

Exposes a function to all tabs (or a specific tab).

```ts
// Available to all tabs
await piggy.expose("logToServer", async (data) => {
  console.log("[Browser]", data);
  await analytics.track(data.event, data.properties);
  return { logged: true };
});

// Any page can call: window.logToServer({ event: 'pageview' })

// Remove global expose
await piggy.unexpose("logToServer");
```

### Global vs Site-Specific

```ts
// Global — available everywhere
await piggy.expose("sharedFunction", async (data) => {
  return { processed: true };
});

// Site-specific — only on this site
await piggy.site1.exposeFunction("siteSpecific", async (data) => {
  return { siteOnly: true };
});

// Both work on site1
await piggy.site1.evaluate(() => {
  window.sharedFunction({ test: true });     // ✅ Works
  window.siteSpecific({ test: true });       // ✅ Works
});

// Only global works on site2
await piggy.site2.evaluate(() => {
  window.sharedFunction({ test: true });     // ✅ Works
  window.siteSpecific({ test: true });       // ❌ undefined
});
```

---

## Expose and Inject Together

### `site.exposeAndInject(name, handler, injectionJs)`

Exposes a function AND injects browser code in one call.

```ts
await piggy.site.exposeAndInject(
  "logToServer",
  async (data) => {
    console.log("Browser says:", data);
    await db.logs.insert(data);
    return { received: true };
  },
  (fnName) => `
    // This runs in the browser
    console.log('${fnName} is ready!');
    
    setInterval(() => {
      window.${fnName}({
        url: window.location.href,
        timestamp: Date.now()
      });
    }, 5000);
  `
);
```

### Injection Formats

```ts
// String template (with function name)
await piggy.site.exposeAndInject(
  "myFunction",
  async (data) => ({ processed: true }),
  (fnName) => `
    window.${fnName}({ test: "data" });
  `
);

// Direct string (function name hardcoded)
await piggy.site.exposeAndInject(
  "myFunction", 
  async (data) => ({ processed: true }),
  `
    window.myFunction({ test: "data" });
  `
);
```

---

## Real-World Examples

### Example 1: WhatsApp Web Message Listener

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
      
      window.onNewMessage({
        text: el.innerText,
        timestamp: Date.now(),
        sender: el.querySelector('.sender')?.innerText,
      }).then(result => {
        console.log('Message saved with ID:', result.id);
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});

await piggy.whatsapp.navigate();
console.log("Listening for WhatsApp messages...");
```

### Example 2: Authentication Handler

```ts
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
```

### Example 3: Real-time Stock Ticker

```ts
await piggy.register("trading", "https://tradingview.com");

await piggy.trading.exposeFunction("onTrade", async (trade) => {
  console.log(`💰 ${trade.symbol}: $${trade.price} @ ${trade.volume}`);
  
  // Store in time-series database
  await influx.writePoint('trades', {
    fields: { price: trade.price, volume: trade.volume },
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
          window.onTrade(data.trade);
        }
      } catch (e) {}
    });
    
    return ws;
  };
});
```

### Example 4: Global Analytics Tracker

```ts
// Global analytics function for all tabs
await piggy.expose("trackEvent", async (event) => {
  console.log(`📊 Tracking: ${event.name}`, event.properties);
  
  // Send to multiple analytics services
  await Promise.all([
    fetch("https://analytics.example.com/collect", {
      method: "POST",
      body: JSON.stringify(event)
    }),
    fetch("https://api.mixpanel.com/track", {
      method: "POST",
      body: JSON.stringify(event)
    })
  ]);
  
  return { tracked: true };
});

// Register multiple sites
await piggy.register("shop", "https://shop.example.com");
await piggy.register("blog", "https://blog.example.com");

// Inject tracking code into all sites
for (const site of [piggy.shop, piggy.blog]) {
  await site.addInitScript(`
    window.trackEvent({
      name: 'pageview',
      properties: { url: window.location.href }
    });
    
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        window.trackEvent({
          name: 'click',
          properties: { text: target.textContent }
        });
      }
    });
  `);
}
```

### Example 5: Captcha Solver Integration

```ts
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
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const result = await fetch(`https://2captcha.com/res.php?key=${process.env.TWO_CAPTCHA_KEY}&action=get&id=${captchaId}`);
    const text = await result.text();
    
    if (text.includes("OK|")) {
      return text.split("|")[1];
    }
  }
  
  return null;
});

// Inject captcha handler
await piggy.site.evaluate(() => {
  async function handleCaptcha() {
    const canvas = document.querySelector("#captcha-image");
    const imageData = canvas.toDataURL().split(",")[1];
    
    const solution = await window.solveCaptcha(imageData);
    document.querySelector("#captcha-input").value = solution;
    document.querySelector("#submit").click();
  }
  
  handleCaptcha();
});
```

### Example 6: Cross-Tab Communication

```ts
// Global message bus
const messageListeners = new Map();

await piggy.expose("publish", async ({ channel, data }) => {
  console.log(`📡 Published to ${channel}:`, data);
  
  const listeners = messageListeners.get(channel) || [];
  for (const listener of listeners) {
    listener(data);
  }
  
  return { delivered: listeners.length };
});

await piggy.expose("subscribe", async ({ channel, tabId }) => {
  if (!messageListeners.has(channel)) {
    messageListeners.set(channel, []);
  }
  
  messageListeners.get(channel).push(async (data) => {
    await piggy.tabs.send(tabId, 'message', data);
  });
  
  return { subscribed: true };
});

// Register sites
await piggy.register("tab1", "https://example.com");
await piggy.register("tab2", "https://example.com");

// Add messaging to all tabs
for (const tab of [piggy.tab1, piggy.tab2]) {
  await tab.addInitScript(`
    const tabId = '${tab._tabId}';
    window.subscribe({ channel: 'global', tabId });
    
    document.addEventListener('click', () => {
      window.publish({
        channel: 'global',
        data: { from: tabId, message: 'Hello from ' + tabId }
      });
    });
  `);
}
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
    // Return error to browser as rejected Promise
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

## API Reference

### Site Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `exposeFunction(name, handler)` | `name: string, handler: Function` | `Promise<SiteObject>` | Expose function to this site |
| `unexposeFunction(name)` | `name: string` | `Promise<SiteObject>` | Remove exposed function |
| `clearExposedFunctions()` | — | `Promise<SiteObject>` | Remove all functions |
| `exposeAndInject(name, handler, injectionJs)` | `name, handler, injectionJs: string \| Function` | `Promise<SiteObject>` | Expose + inject in one call |

### Global Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `piggy.expose(name, handler, tabId?)` | `name: string, handler: Function, tabId?: string` | `Promise<piggy>` | Expose globally |
| `piggy.unexpose(name, tabId?)` | `name: string, tabId?: string` | `Promise<piggy>` | Remove global expose |

### Event

| Event | Data | Description |
|-------|------|-------------|
| `exposed_call` | `{ tabId, name, callId, data }` | Function called from browser |

---

## Type Definitions

```ts
type ExposedHandler = (data: any) => Promise<any> | any;

interface ExposedCallEvent {
  tabId: string;
  name: string;
  callId: string;
  data: string;  // JSON string of arguments
}
```

---

## Next Steps

- [Events API](../events) — Handle exposed_call events
- [Iframe API](../iframe) — Expose functions inside iframes
- [Dialog API](../dialog) — Handle JavaScript dialogs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*