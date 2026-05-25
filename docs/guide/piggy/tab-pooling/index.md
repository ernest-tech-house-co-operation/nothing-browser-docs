# 🏊 Tab Pooling — Legacy (Under Review)

> ⚠️ **IMPORTANT:** Tab Pooling is currently **under review** and **may become legacy**.  
> **We strongly recommend using the official [Tabs API](./tabs) instead** for multi-tab management.  
> Tab Pooling will be maintained for backward compatibility but new features will not be added.

---

## ⚠️ Status: Under Review / Legacy Candidate

| Aspect | Status |
|--------|--------|
| **Recommended replacement** | [`tabs` API](./tabs) |
| **Maintenance** | ✅ Bug fixes only |
| **New features** | ❌ No |
| **Deprecation planned** | Possibly in v0.2.0 |

**Why?** The official [`tabs` API](./tabs) is simpler, more flexible, and covers all use cases that Tab Pooling was designed for. Use `tabs.new()`, `tabs.list()`, and `tabs.close()` instead.

---

## Overview (Legacy)

Tab pooling was originally designed to give each site a pool of tabs for concurrent requests. However, the official [Tabs API](./tabs) now provides a cleaner, more explicit way to manage multiple tabs.

```ts
// ❌ Legacy approach (not recommended)
await piggy.register("amazon", "https://amazon.com", { pool: 4 });

// ✅ Recommended approach
const tabs = await Promise.all([
  piggy.tabs.new(),
  piggy.tabs.new(),
  piggy.tabs.new(),
  piggy.tabs.new()
]);
```

---

## Migration Guide

### Instead of `{ pool: N }`, use explicit tabs:

```ts
// Old (pooling)
await piggy.register("amazon", "https://amazon.com", { pool: 4 });
await piggy.amazon.api("/search", handler); // automatically pooled

// New (explicit tabs)
await piggy.register("amazon", "https://amazon.com");
const tabs = await Promise.all(Array(4).fill().map(() => piggy.tabs.new()));

// Use tabs directly
await piggy.amazon.navigate("https://amazon.com", tabs[0]);
await piggy.amazon.navigate("https://amazon.com", tabs[1]);
// ...
```

---

## If You Must Use It (Legacy)

```ts
// ⚠️ Not recommended for new code
await piggy.register("amazon", "https://amazon.com", { pool: 3 });

// Check pool status (still works)
const stats = amazon.poolStats();
// { idle: 2, busy: 1, queued: 0, total: 3 }
```

But please migrate to [`tabs` API](./tabs).

---

## Next Steps

- [Tabs API (Recommended)](./tabs) — Official multi-tab management
- [Multi-Site Parallel](./multi-site) — Multiple sites, not multiple tabs
- [API Server](./api-server) — Build APIs with explicit tab control

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*