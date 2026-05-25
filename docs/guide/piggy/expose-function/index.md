# 🔥 exposeFunction — Browser → Node.js RPC

**The flagship feature of Piggy.**

Call Node.js functions directly from browser JavaScript. Real-time, bidirectional communication between your scraper and the page.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.21+

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