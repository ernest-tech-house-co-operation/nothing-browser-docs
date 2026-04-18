# 🔧 exposeAndInject

Combine `exposeFunction` and `evaluate` in one powerful call. Define your Node.js handler and inject the browser-side code simultaneously.

---

## Overview

`exposeAndInject` is a convenience method that does two things at once:

1. **Exposes** a Node.js function to the browser (like `exposeFunction`)
2. **Injects** JavaScript code that calls that function

| Method | Steps | Use Case |
|--------|-------|----------|
| `exposeFunction` + `evaluate` | 2 calls | When you need separate control |
| `exposeAndInject` | 1 call | Quick setup, clean code |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://example.com");

// Expose AND inject in one call
await piggy.app.exposeAndInject(
  "logToServer",           // Function name (browser sees window.logToServer)
  async (data) => {        // Node.js handler
    console.log("Browser says:", data);
    await db.logs.insert(data);
    return { received: true, id: crypto.randomUUID() };
  },
  (fnName) => `            // Browser injection code
    // This runs in the browser
    console.log('${fnName} is ready!');
    
    // Send data every 5 seconds
    setInterval(() => {
      window.${fnName}({
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }).then(result => {
        console.log('Logged with ID:', result.id);
      });
    }, 5000);
  `
);

await piggy.app.navigate();
// The browser will start sending data every 5 seconds
```

---

## Injection Function Signature

The injection code can be either:

### 1. String Template (with function name)

```ts
await piggy.site.exposeAndInject(
  "myFunction",
  async (data) => ({ processed: true }),
  (fnName) => `
    // Use ${fnName} to reference the exposed function
    window.${fnName}({ test: "data" });
  `
);
```

### 2. Direct String (no function name needed)

```ts
await piggy.site.exposeAndInject(
  "myFunction", 
  async (data) => ({ processed: true }),
  `
    // The function is already available as window.myFunction
    window.myFunction({ test: "data" });
  `
);
```

---

## Real-World Examples

### 1. Auto-Save Form Data

```ts
await piggy.register("app", "https://example.com/form");

await piggy.app.exposeAndInject(
  "autoSave",
  async (formData) => {
    // Save to database
    await db.drafts.insert({
      id: formData.id,
      data: formData.data,
      savedAt: Date.now()
    });
    
    console.log(`💾 Auto-saved draft: ${formData.id}`);
    return { saved: true, timestamp: Date.now() };
  },
  `
    // Watch form inputs and auto-save
    let saveTimeout;
    const form = document.querySelector('#my-form');
    const inputs = form.querySelectorAll('input, textarea');
    
    function collectFormData() {
      const data = {};
      inputs.forEach(input => {
        data[input.name] = input.value;
      });
      return data;
    }
    
    function save() {
      const formData = collectFormData();
      window.autoSave({
        id: window.location.pathname,
        data: formData
      }).then(result => {
        console.log('Auto-saved at', new Date(result.timestamp));
        // Show saved indicator
        const indicator = document.querySelector('#save-status');
        if (indicator) indicator.textContent = 'Saved';
        setTimeout(() => {
          if (indicator) indicator.textContent = '';
        }, 2000);
      });
    }
    
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(save, 1000);
      });
    });
    
    console.log('Auto-save enabled');
  `
);

await piggy.app.navigate("https://example.com/form");
// Form data will auto-save to your database as user types
```

### 2. Real-Time Analytics Tracker

```ts
await piggy.register("site", "https://example.com");

await piggy.site.exposeAndInject(
  "trackAnalytics",
  async (event) => {
    // Send to analytics service
    await fetch("https://analytics.example.com/collect", {
      method: "POST",
      body: JSON.stringify(event)
    });
    
    console.log(`📊 Tracked: ${event.type} - ${event.label}`);
    return { tracked: true };
  },
  (fnName) => `
    // Track page views
    window.${fnName}({
      type: 'pageview',
      url: window.location.href,
      timestamp: Date.now(),
      referrer: document.referrer
    });
    
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        window.${fnName}({
          type: 'click',
          label: target.textContent || target.id || target.tagName,
          url: target.href || null,
          timestamp: Date.now()
        });
      }
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll >= 25 && maxScroll < 50) {
          window.${fnName}({ type: 'scroll', depth: 25 });
        } else if (maxScroll >= 50 && maxScroll < 75) {
          window.${fnName}({ type: 'scroll', depth: 50 });
        } else if (maxScroll >= 75) {
          window.${fnName}({ type: 'scroll', depth: 75 });
        }
      }
    });
    
    console.log('Analytics tracking enabled');
  `
);

await piggy.site.navigate("https://example.com");
// All user interactions are tracked to your analytics service
```

### 3. Captcha Solver Integration

```ts
await piggy.register("site", "https://example.com/login");

await piggy.site.exposeAndInject(
  "solveCaptcha",
  async (imageData) => {
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
        const solution = text.split("|")[1];
        return { success: true, solution };
      }
    }
    
    return { success: false, error: "Timeout" };
  },
  `
    // Find captcha on page
    async function handleCaptcha() {
      const captchaImg = document.querySelector('#captcha-image, .captcha-img, img[alt*="captcha"]');
      if (!captchaImg) return;
      
      // Get image as base64
      const canvas = document.createElement('canvas');
      canvas.width = captchaImg.width;
      canvas.height = captchaImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(captchaImg, 0, 0);
      const imageData = canvas.toDataURL().split(',')[1];
      
      // Solve captcha
      const result = await window.solveCaptcha(imageData);
      
      if (result.success) {
        const input = document.querySelector('#captcha-input, input[name="captcha"]');
        if (input) {
          input.value = result.solution;
          // Auto-submit if form exists
          const form = input.closest('form');
          if (form) form.submit();
        }
      }
    }
    
    // Run when page loads and on navigation
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleCaptcha);
    } else {
      handleCaptcha();
    }
    
    // Also watch for dynamically added captchas
    const observer = new MutationObserver(() => handleCaptcha());
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('Captcha solver ready');
  `
);

await piggy.site.navigate("https://example.com/login");
// Captchas will be solved automatically
```

### 4. WebSocket Message Forwarder

```ts
await piggy.register("trading", "https://tradingview.com");

await piggy.trading.exposeAndInject(
  "forwardTrade",
  async (trade) => {
    console.log(`💰 Trade: ${trade.symbol} @ ${trade.price}`);
    
    // Forward to your WebSocket server
    wsServer.clients.forEach(client => {
      client.send(JSON.stringify(trade));
    });
    
    // Store in database
    await db.trades.insert(trade);
    
    return { received: true, timestamp: Date.now() };
  },
  (fnName) => `
    // Intercept WebSocket messages
    const originalWebSocket = window.WebSocket;
    
    window.WebSocket = function(url, protocols) {
      const ws = new originalWebSocket(url, protocols);
      
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if it's a trade message
          if (data.type === 'trade' || data.data?.trade) {
            const trade = data.trade || data.data.trade;
            window.${fnName}({
              symbol: trade.symbol,
              price: trade.price,
              volume: trade.volume,
              timestamp: Date.now(),
              exchange: window.location.hostname
            });
          }
        } catch (e) {
          // Not JSON or not a trade message
        }
      });
      
      return ws;
    };
    
    console.log('WebSocket trade interceptor active');
  `
);

await piggy.trading.navigate("https://tradingview.com");
// All WebSocket trades are forwarded to your backend
```

### 5. Session Heartbeat

```ts
await piggy.register("app", "https://example.com/dashboard");

await piggy.app.exposeAndInject(
  "heartbeat",
  async (data) => {
    console.log(`💓 Heartbeat from ${data.userId}`);
    
    // Extend session in database
    await db.sessions.update(data.sessionId, {
      lastSeen: Date.now(),
      url: data.url
    });
    
    // Check if session should be extended
    const shouldExtend = Date.now() - data.lastActivity < 30 * 60 * 1000;
    
    return { 
      extended: shouldExtend,
      message: shouldExtend ? "Session active" : "Session expiring soon"
    };
  },
  `
    // Send heartbeat every minute
    let lastActivity = Date.now();
    
    // Track user activity
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });
    
    async function sendHeartbeat() {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) return;
      
      const result = await window.heartbeat({
        sessionId,
        userId: document.body.dataset.userId,
        url: window.location.href,
        lastActivity,
        timestamp: Date.now()
      });
      
      if (!result.extended) {
        console.warn('Session expiring soon!');
        // Show warning to user
        const warning = document.createElement('div');
        warning.textContent = 'Your session will expire soon. Please save your work.';
        warning.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff9800;color:#000;padding:10px;text-align:center;z-index:10000;';
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 5000);
      }
    }
    
    // Send heartbeat every 30 seconds
    setInterval(sendHeartbeat, 30000);
    sendHeartbeat(); // Send immediately
    
    console.log('Session heartbeat active');
  `
);

await piggy.app.navigate();
// Session stays alive while user is active
```

### 6. Price Alert Monitor

```ts
await piggy.register("shop", "https://example.com/product");

await piggy.shop.exposeAndInject(
  "checkPrice",
  async ({ currentPrice, targetPrice, productId }) => {
    if (currentPrice <= targetPrice) {
      console.log(`🎯 PRICE ALERT! ${productId} is $${currentPrice}`);
      
      // Send notification
      await fetch(process.env.WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({
          productId,
          currentPrice,
          targetPrice,
          url: `https://example.com/product/${productId}`
        })
      });
      
      return { alerted: true };
    }
    
    return { alerted: false };
  },
  (fnName) => `
    // Watch for price changes
    let lastPrice = null;
    
    function checkPrice() {
      const priceElement = document.querySelector('.price, .product-price, [data-price]');
      if (!priceElement) return;
      
      const priceText = priceElement.textContent;
      const price = parseFloat(priceText.replace(/[^0-9.-]/g, ''));
      
      if (price && price !== lastPrice) {
        lastPrice = price;
        
        // Get target price from localStorage
        const targetPrice = parseFloat(localStorage.getItem('target_price') || '0');
        const productId = window.location.pathname.split('/').pop();
        
        if (targetPrice > 0) {
          window.${fnName}({
            currentPrice: price,
            targetPrice,
            productId
          }).then(result => {
            if (result.alerted) {
              // Highlight price
              priceElement.style.backgroundColor = '#ffeb3b';
              priceElement.style.transition = 'background-color 0.5s';
              setTimeout(() => {
                priceElement.style.backgroundColor = '';
              }, 3000);
            }
          });
        }
      }
    }
    
    // Check every 5 seconds
    setInterval(checkPrice, 5000);
    checkPrice();
    
    console.log('Price monitor active');
  `
);

// Set target price in localStorage
await piggy.shop.evaluate(() => {
  localStorage.setItem('target_price', '50');
});

await piggy.shop.navigate("https://example.com/product/123");
// Get alert when price drops to $50 or below
```

---

## Error Handling

```ts
await piggy.site.exposeAndInject(
  "riskyOperation",
  async (data) => {
    try {
      const result = await someAsyncOperation(data);
      return { success: true, result };
    } catch (error) {
      // Error will be sent to browser
      throw new Error(`Operation failed: ${error.message}`);
    }
  },
  `
    async function doOperation() {
      try {
        const result = await window.riskyOperation({ test: "data" });
        console.log("Success:", result);
      } catch (error) {
        console.error("Node.js error:", error.message);
        // Show error to user
        alert("Operation failed: " + error.message);
      }
    }
    
    doOperation();
  `
);
```

---

## Comparison: exposeFunction + evaluate vs exposeAndInject

### Two-step approach:
```ts
await piggy.site.exposeFunction("myFunc", handler);
await piggy.site.evaluate(`
  window.myFunc({ data: "test" });
`);
```

### One-step approach:
```ts
await piggy.site.exposeAndInject(
  "myFunc",
  handler,
  `
    window.myFunc({ data: "test" });
  `
);
```

Both achieve the same result. `exposeAndInject` is cleaner when the injection code is tightly coupled with the exposed function.

---

## API Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Function name exposed to browser |
| `handler` | `(data: any) => Promise<any> \| any` | Node.js handler function |
| `injectionJs` | `string \| ((fnName: string) => string)` | Browser code to inject |

### injectionJs Formats

**String (direct):**
```ts
`window.myFunction({ data: "test" });`
```

**Function (with fnName):**
```ts
(fnName) => `window.${fnName}({ data: "test" });`
```

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Detailed RPC documentation
- [Global Expose](./global-expose) — Expose functions across all sites
- [Built-in API Server](./api-server) — Turn exposed functions into REST APIs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
