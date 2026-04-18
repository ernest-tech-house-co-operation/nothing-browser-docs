# 🌐 Global Expose

Expose Node.js functions to **all browser tabs** simultaneously. Perfect for shared services like logging, authentication, and analytics that need to work across your entire application.

---

## Overview

Global expose makes functions available in every tab and every registered site.

| Method | Scope | Use Case |
|--------|-------|----------|
| `site.exposeFunction()` | Single site | Site-specific functionality |
| `piggy.expose()` | **All tabs** | Shared services, logging, auth |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });

// Expose a global function available to ALL tabs
await piggy.expose("logToServer", async (data) => {
  console.log("[Global Log]", data);
  await fetch("https://api.example.com/logs", {
    method: "POST",
    body: JSON.stringify(data)
  });
  return { logged: true, timestamp: Date.now() };
});

// Register multiple sites
await piggy.register("site1", "https://example1.com");
await piggy.register("site2", "https://example2.com");
await piggy.register("site3", "https://example3.com");

// All sites can call the same global function
await piggy.site1.evaluate(() => window.logToServer({ page: "site1", action: "loaded" }));
await piggy.site2.evaluate(() => window.logToServer({ page: "site2", action: "loaded" }));
await piggy.site3.evaluate(() => window.logToServer({ page: "site3", action: "loaded" }));

await piggy.close();
```

---

## Global vs Site-Specific

```ts
// Global expose - available everywhere
await piggy.expose("sharedFunction", async (data) => {
  return { processed: true };
});

// Site-specific - only on this site
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

## Real-World Examples

### 1. Global Analytics Tracker

```ts
await piggy.launch({ mode: "tab" });

// Global analytics function
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
  
  // Store locally
  await db.analytics.insert({
    ...event,
    timestamp: Date.now(),
    sessionId: event.sessionId
  });
  
  return { tracked: true, eventId: crypto.randomUUID() };
});

// Register all your sites
await piggy.register("shop", "https://shop.example.com");
await piggy.register("blog", "https://blog.example.com");
await piggy.register("dashboard", "https://dashboard.example.com");

// Inject tracking code into all sites
for (const site of [piggy.shop, piggy.blog, piggy.dashboard]) {
  await site.addInitScript(`
    // Track page views
    window.trackEvent({
      name: 'pageview',
      properties: {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title
      },
      sessionId: localStorage.getItem('session_id')
    });
    
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        window.trackEvent({
          name: 'click',
          properties: {
            element: target.tagName,
            text: target.textContent?.slice(0, 50),
            href: target.href
          },
          sessionId: localStorage.getItem('session_id')
        });
      }
    });
    
    console.log('Global analytics tracking active');
  `);
}

// Navigate through sites - all activity tracked
await piggy.shop.navigate();
await piggy.blog.navigate();
await piggy.dashboard.navigate();
```

### 2. Shared Authentication State

```ts
await piggy.launch({ mode: "tab" });

// Global auth functions
let currentUser: any = null;

await piggy.expose("getCurrentUser", async () => {
  return currentUser || null;
});

await piggy.expose("setCurrentUser", async (user) => {
  currentUser = user;
  console.log(`🔐 User set: ${user?.email}`);
  
  // Broadcast to all tabs
  for (const site of Object.values(piggy).filter(s => s._name)) {
    await site.evaluate((userData) => {
      window.dispatchEvent(new CustomEvent('userChanged', { detail: userData }));
    }, user).catch(() => {});
  }
  
  return { success: true, user };
});

await piggy.expose("logout", async () => {
  currentUser = null;
  console.log("🔐 User logged out");
  
  // Clear session across all tabs
  for (const site of Object.values(piggy).filter(s => s._name)) {
    await site.evaluate(() => {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('userChanged', { detail: null }));
    }).catch(() => {});
  }
  
  return { success: true };
});

// Register sites
await piggy.register("app1", "https://app1.example.com");
await piggy.register("app2", "https://app2.example.com");
await piggy.register("app3", "https://app3.example.com");

// Add auth listener to all sites
for (const site of [piggy.app1, piggy.app2, piggy.app3]) {
  await site.addInitScript(`
    // Listen for auth changes
    window.addEventListener('userChanged', (e) => {
      const user = e.detail;
      if (user) {
        console.log('User logged in:', user.email);
        document.querySelector('#user-menu')?.classList.remove('hidden');
        document.querySelector('#user-name').textContent = user.email;
      } else {
        console.log('User logged out');
        document.querySelector('#user-menu')?.classList.add('hidden');
      }
    });
    
    // Get initial user
    window.getCurrentUser().then(user => {
      if (user) {
        window.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
      }
    });
  `);
}

// Login once, affects all tabs
await piggy.expose.setCurrentUser({ id: 1, email: "user@example.com" });
// All three apps now show logged-in state
```

### 3. Centralized Notification System

```ts
await piggy.launch({ mode: "tab" });

// Global notification function
await piggy.expose("showNotification", async ({ title, message, type }) => {
  console.log(`🔔 [${type}] ${title}: ${message}`);
  
  // Store notification
  await db.notifications.insert({
    title,
    message,
    type,
    timestamp: Date.now(),
    read: false
  });
  
  // Send to external service (Slack, Discord, etc.)
  await fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({ title, message, type })
  });
  
  return { sent: true };
});

// Global notification sender (from browser)
await piggy.expose("sendNotification", async (notification) => {
  // This function is called FROM the browser
  console.log(`📨 Browser notification:`, notification);
  
  // Store and forward
  await db.notifications.insert(notification);
  
  // Broadcast to all other tabs
  for (const site of Object.values(piggy).filter(s => s._name)) {
    await site.evaluate((notif) => {
      window.dispatchEvent(new CustomEvent('notification', { detail: notif }));
    }, notification).catch(() => {});
  }
  
  return { broadcast: true };
});

// Register sites
await piggy.register("siteA", "https://siteA.example.com");
await piggy.register("siteB", "https://siteB.example.com");
await piggy.register("siteC", "https://siteC.example.com");

// Add notification listener to all sites
for (const site of [piggy.siteA, piggy.siteB, piggy.siteC]) {
  await site.addInitScript(`
    // Listen for notifications
    window.addEventListener('notification', (e) => {
      const { title, message, type } = e.detail;
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }
      
      // Show in-page toast
      const toast = document.createElement('div');
      toast.className = 'notification-toast';
      toast.innerHTML = \`
        <strong>\${title}</strong>
        <p>\${message}</p>
      \`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    });
    
    // Send notification when something happens
    function sendAlert(message) {
      window.sendNotification({
        title: 'Alert',
        message,
        type: 'warning',
        source: window.location.hostname,
        timestamp: Date.now()
      });
    }
    
    // Example: alert on form submit
    document.addEventListener('submit', (e) => {
      sendAlert('Form submitted on ' + window.location.hostname);
    });
  `);
}

// Send global notification from Node.js
await piggy.expose.showNotification({
  title: "System Update",
  message: "Scheduled maintenance in 1 hour",
  type: "warning"
});
```

### 4. Shared Database Connection

```ts
await piggy.launch({ mode: "tab" });

// Global database functions
await piggy.expose("dbQuery", async ({ collection, query }) => {
  console.log(`📊 Querying ${collection}:`, query);
  
  const result = await db.collection(collection).find(query).toArray();
  return { success: true, data: result, count: result.length };
});

await piggy.expose("dbInsert", async ({ collection, document }) => {
  const result = await db.collection(collection).insertOne({
    ...document,
    createdAt: Date.now(),
    source: 'browser'
  });
  
  return { success: true, id: result.insertedId };
});

await piggy.expose("dbUpdate", async ({ collection, query, update }) => {
  const result = await db.collection(collection).updateMany(query, { $set: update });
  return { success: true, modified: result.modifiedCount };
});

// Register sites
await piggy.register("admin", "https://admin.example.com");
await piggy.register("reports", "https://reports.example.com");

// Sites can directly query database
await piggy.admin.addInitScript(`
  async function loadUsers() {
    const result = await window.dbQuery({
      collection: 'users',
      query: { active: true }
    });
    
    console.log(\`Loaded \${result.count} users\`);
    // Render users...
  }
  
  async function saveSettings(settings) {
    await window.dbUpdate({
      collection: 'settings',
      query: { id: 'app' },
      update: settings
    });
  }
  
  loadUsers();
`);

await piggy.admin.navigate();
```

### 5. Cross-Tab Communication

```ts
await piggy.launch({ mode: "tab" });

// Global message bus
const messageListeners = new Map();

await piggy.expose("publish", async ({ channel, data }) => {
  console.log(`📡 Published to ${channel}:`, data);
  
  // Store message
  await db.messages.insert({ channel, data, timestamp: Date.now() });
  
  // Notify all listeners
  const listeners = messageListeners.get(channel) || [];
  for (const listener of listeners) {
    listener(data);
  }
  
  return { delivered: listeners.length };
});

await piggy.expose("subscribe", async ({ channel, callbackId }) => {
  if (!messageListeners.has(channel)) {
    messageListeners.set(channel, []);
  }
  
  messageListeners.get(channel).push(async (data) => {
    // Send to browser
    const sites = Object.values(piggy).filter(s => s._name);
    for (const site of sites) {
      await site.evaluate((cbId, msgData) => {
        window.dispatchEvent(new CustomEvent(cbId, { detail: msgData }));
      }, callbackId, data).catch(() => {});
    }
  });
  
  return { subscribed: true };
});

// Register sites
await piggy.register("tab1", "https://example.com");
await piggy.register("tab2", "https://example.com");
await piggy.register("tab3", "https://example.com");

// Add messaging to all tabs
for (const site of [piggy.tab1, piggy.tab2, piggy.tab3]) {
  await site.addInitScript(`
    const callbackId = 'msg_' + Math.random();
    
    // Subscribe to channel
    window.subscribe({ channel: 'global', callbackId });
    
    // Listen for messages
    window.addEventListener(callbackId, (e) => {
      console.log('Received message:', e.detail);
      
      // Show in UI
      const msgDiv = document.createElement('div');
      msgDiv.textContent = JSON.stringify(e.detail);
      document.body.appendChild(msgDiv);
    });
    
    // Send message on button click
    document.addEventListener('click', () => {
      window.publish({
        channel: 'global',
        data: {
          from: window.location.href,
          message: 'Hello from ' + window.location.href,
          timestamp: Date.now()
        }
      });
    });
  `);
}

// All three tabs can communicate with each other
```

---

## Managing Global Exposed Functions

### List Global Functions

```ts
// Track exposed global functions
const globalFunctions = new Set();

// Override expose to track
const originalExpose = piggy.expose;
piggy.expose = async (name, handler, tabId) => {
  globalFunctions.add(name);
  return originalExpose.call(piggy, name, handler, tabId);
};

// Usage
await piggy.expose("func1", async () => {});
await piggy.expose("func2", async () => {});
await piggy.expose("func3", async () => {});

console.log("Global functions:", Array.from(globalFunctions));
// ['func1', 'func2', 'func3']
```

### Remove Global Function

```ts
// Unexpose a global function
await piggy.unexpose("logToServer");
await piggy.unexpose("trackEvent");
await piggy.unexpose("showNotification");

// After unexpose, browser windows can no longer call it
```

### Check if Function Exists

```ts
async function isFunctionExposed(site: any, functionName: string): Promise<boolean> {
  return await site.evaluate((fnName) => {
    return typeof window[fnName] === 'function';
  }, functionName);
}

const exists = await isFunctionExposed(piggy.site1, "logToServer");
console.log("logToServer exposed:", exists);
```

---

## Performance Considerations

```ts
// Global functions are available in ALL tabs
// Keep them lightweight

// ❌ Bad: Heavy computation in global function
await piggy.expose("heavyTask", async (data) => {
  // This will run in Node.js, but called from every tab
  const result = await massiveDatabaseQuery(data);
  await complexDataProcessing(result);
  return result;
});

// ✅ Good: Lightweight, fast operations
await piggy.expose("lightTask", async (data) => {
  // Quick lookup, minimal processing
  const cached = await redis.get(data.key);
  return cached;
});

// ✅ Good: Async, non-blocking
await piggy.expose("asyncTask", async (data) => {
  // Fire and forget
  setImmediate(() => {
    processData(data);
  });
  return { queued: true };
});
```

---

## Error Handling

```ts
// Global error handler for exposed functions
await piggy.expose("riskyOperation", async (data) => {
  try {
    const result = await someAsyncOperation(data);
    return { success: true, result };
  } catch (error) {
    console.error("Global function error:", error);
    
    // Return error to browser
    return { 
      success: false, 
      error: error.message,
      timestamp: Date.now()
    };
  }
});

// Browser side error handling
await piggy.site.evaluate(`
  async function callRiskyOperation() {
    try {
      const result = await window.riskyOperation({ test: true });
      if (result.success) {
        console.log("Success:", result.result);
      } else {
        console.error("Operation failed:", result.error);
      }
    } catch (error) {
      console.error("Communication error:", error);
    }
  }
  
  callRiskyOperation();
`);
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `piggy.expose(name, handler, tabId?)` | Expose function to all tabs |
| `piggy.unexpose(name, tabId?)` | Remove globally exposed function |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Function name available as `window[name]` |
| `handler` | `(data: any) => Promise<any> \| any` | Node.js handler |
| `tabId` | `string` (optional) | Specific tab ID (rarely needed) |

---

## Next Steps

- [exposeFunction (RPC)](./expose-function) — Site-specific RPC
- [exposeAndInject](./expose-inject) — Combined expose + inject
- [Built-in API Server](./api-server) — Turn functions into REST APIs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
