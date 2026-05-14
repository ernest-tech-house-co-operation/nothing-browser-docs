# 🔌 Proxy API — IP Rotation & Pool Management

Load, test, rotate, and manage proxies. Route browser traffic through different IPs to avoid rate limits, bypass geo-restrictions, and prevent blocks.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Proxy API gives you full control over proxy pools:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `proxy.load()` | Load proxies from local file | Use your own proxy list |
| `proxy.fetch()` | Fetch proxies from URL | Download from proxy services |
| `proxy.ovpn()` | Load OpenVPN config | Route through VPN |
| `proxy.set()` | Set single proxy | Manual configuration |
| `proxy.test()` | Health check all proxies | Find working proxies |
| `proxy.testStop()` | Stop health check | Cancel ongoing check |
| `proxy.next()` | Rotate to next proxy | Change IP |
| `proxy.enable()/disable()` | Enable/disable proxy | Bypass proxy temporarily |
| `proxy.current()` | Get current proxy | Check active proxy |
| `proxy.stats()` | Get pool statistics | Monitor pool health |
| `proxy.list()` | List all proxies | View entire pool |
| `proxy.rotation()` | Set rotation strategy | Auto-rotate IPs |
| `proxy.config()` | Configure behavior | Skip dead proxies, auto-check |
| `proxy.save()` | Save proxies to file | Export working proxies |

---

## Loading Proxies

### `proxy.load(path)`

Loads proxies from a local file (one per line).

```ts
await piggy.proxy.load("./proxies.txt");
```

File format:
```
http://103.149.162.195:80
https://192.168.1.100:443
socks5://user:pass@proxy.example.com:1080
103.149.162.195:80  # auto-detects http
```

### `proxy.fetch(url)`

Fetches proxies from a remote URL.

```ts
await piggy.proxy.fetch("https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt");
```

### `proxy.ovpn(path)`

Loads an OpenVPN configuration file.

```ts
await piggy.proxy.ovpn("./nordvpn-us.ovpn");
```

### `proxy.set(opts)`

Sets a single proxy manually.

```ts
// Object format
await piggy.proxy.set({
  host: "103.149.162.195",
  port: 80,
  type: "http"
});

// With authentication
await piggy.proxy.set({
  host: "proxy.example.com",
  port: 1080,
  type: "socks5",
  user: "username",
  pass: "password"
});

// URL format
await piggy.proxy.set({ proxy: "socks5://user:pass@proxy.example.com:1080" });
```

### Proxy Types

| Type | Description |
|------|-------------|
| `http` | HTTP proxy |
| `https` | HTTPS proxy |
| `socks5` | SOCKS5 proxy |
| `socks4` | SOCKS4 proxy |

---

## Health Checking

### `proxy.test()`

Tests all loaded proxies in parallel (20 concurrent). Emits events for each result.

```ts
await piggy.proxy.test();

// Monitor events
piggy.proxy.on("proxy:check:started", (data) => {
  console.log(`Checking ${data.total} proxies...`);
});

piggy.proxy.on("proxy:alive", (data) => {
  console.log(`✅ Proxy ${data.index} alive (${data.latency}ms)`);
});

piggy.proxy.on("proxy:dead", (data) => {
  console.log(`❌ Proxy ${data.index} dead`);
});

piggy.proxy.on("proxy:check:done", (data) => {
  console.log(`Done: ${data.alive} alive, ${data.dead} dead`);
});
```

### `proxy.testStop()`

Stops an ongoing health check.

```ts
await piggy.proxy.testStop();
```

---

## Rotation

### `proxy.next()`

Rotates to the next proxy in the pool.

```ts
await piggy.proxy.next();
const current = await piggy.proxy.current();
console.log(`Now using: ${current.proxy}`);
```

### `proxy.rotation(mode, interval?)`

Sets automatic rotation strategy.

```ts
// No auto-rotation (manual)
await piggy.proxy.rotation("none");

// Rotate every 30 seconds
await piggy.proxy.rotation("timed", 30000);

// Rotate per request
await piggy.proxy.rotation("perrequest");
```

### Rotation Modes

| Mode | Description |
|------|-------------|
| `"none"` | Manual only (call `proxy.next()`) |
| `"timed"` | Rotate every N milliseconds |
| `"perrequest"` | Rotate for each new page/tab |

---

## Enable/Disable

### `proxy.enable()`

Re-enables proxy routing (if disabled).

```ts
await piggy.proxy.enable();
```

### `proxy.disable()`

Bypasses proxy and uses real IP.

```ts
await piggy.proxy.disable();
```

---

## Status & Information

### `proxy.current()`

Returns the current active proxy.

```ts
const current = await piggy.proxy.current();
console.log(current);
// {
//   active: true,
//   host: "103.149.162.195",
//   port: 8080,
//   type: "http",
//   user: "",
//   proxy: "http://103.149.162.195:8080",
//   latency: 120,
//   health: "alive"
// }
```

### `proxy.stats()`

Returns pool statistics.

```ts
const stats = await piggy.proxy.stats();
console.log(stats);
// {
//   total: 10,
//   alive: 8,
//   dead: 2,
//   index: 3,
//   active: true,
//   checking: false,
//   skipDead: true,
//   autoCheck: true
// }
```

### `proxy.list(limit?)`

Lists all proxies with health status.

```ts
// All proxies
const all = await piggy.proxy.list();

// First 10
const first10 = await piggy.proxy.list(10);

console.log(all.proxies[0]);
// {
//   index: 0,
//   host: "103.149.162.195",
//   port: 8080,
//   type: "http",
//   user: "",
//   proxy: "http://103.149.162.195:8080",
//   latency: 0,
//   health: "unchecked",
//   current: false
// }
```

---

## Configuration

### `proxy.config(opts)`

Configures proxy behavior.

```ts
// Skip dead proxies automatically
await piggy.proxy.config({ skipDead: true });

// Enable auto health checking
await piggy.proxy.config({ autoCheck: true });

// Both
await piggy.proxy.config({ skipDead: true, autoCheck: true });
```

---

## Saving Proxies

### `proxy.save(path, filter?)`

Saves proxies to a file.

```ts
// Save only alive proxies
await piggy.proxy.save("./alive-proxies.txt", "alive");

// Save dead proxies (for debugging)
await piggy.proxy.save("./dead-proxies.txt", "dead");

// Save all proxies
await piggy.proxy.save("./all-proxies.txt", "all");
```

---

## Events

| Event | Data | Description |
|-------|------|-------------|
| `proxy:changed` | `{ proxy, host, port, latency }` | Proxy rotated |
| `proxy:loaded` | `{ count }` | Proxies loaded from file/URL |
| `proxy:fetch:failed` | `{ error }` | Fetch failed |
| `proxy:check:started` | `{ total }` | Health check started |
| `proxy:alive` | `{ index, latency }` | Proxy alive |
| `proxy:dead` | `{ index, latency }` | Proxy dead |
| `proxy:check:done` | `{ alive, dead }` | Health check finished |
| `proxy:exhausted` | `{}` | No alive proxies left |
| `proxy:ovpn:loaded` | `{ remote, port }` | OVPN loaded |

### Subscribing to Events

```ts
// Subscribe
const unsubscribe = piggy.proxy.on("proxy:changed", (data) => {
  console.log(`Now using: ${data.proxy}`);
});

// Unsubscribe
unsubscribe();
```

---

## Real-World Examples

### Example 1: Basic Proxy Setup

```ts
await piggy.proxy.load("./proxies.txt");
await piggy.proxy.test();
await piggy.proxy.enable();
await piggy.proxy.rotation("perrequest");

console.log("Proxy pool ready");
```

### Example 2: Rotating Residential Proxy Pool

```ts
// Load premium proxy list
await piggy.proxy.fetch("https://api.proxy-service.com/get-proxies?key=YOUR_KEY");

// Enable auto-rotation per request
await piggy.proxy.rotation("perrequest");

// Skip dead proxies automatically
await piggy.proxy.config({ skipDead: true });

// Health check
await piggy.proxy.test();

// Monitor exhaustion
piggy.proxy.on("proxy:exhausted", async () => {
  console.log("No proxies left! Refreshing...");
  await piggy.proxy.fetch("https://api.proxy-service.com/get-proxies?key=YOUR_KEY");
  await piggy.proxy.test();
});

await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate(); // Uses first proxy
```

### Example 3: Scraping with Timed Rotation

```ts
// Rotate IP every 30 seconds
await piggy.proxy.rotation("timed", 30000);

await piggy.register("target", "https://target-site.com");

for (let i = 0; i < 100; i++) {
  await piggy.target.navigate(`https://target-site.com/page/${i}`);
  const data = await piggy.target.evaluate(() => ({ ... }));
  console.log(`Scraped page ${i}, proxy rotates every 30s automatically`);
}
```

### Example 4: Multi-Region Proxy Setup

```ts
// Load proxies from different regions
await piggy.proxy.load("./us-proxies.txt");
await piggy.proxy.load("./eu-proxies.txt");
await piggy.proxy.load("./asia-proxies.txt");

// Health check
await piggy.proxy.test();

const stats = await piggy.proxy.stats();
console.log(`${stats.alive} working proxies`);

// Save working proxies for next run
await piggy.proxy.save("./working-proxies.txt", "alive");
```

### Example 5: OpenVPN Integration

```ts
// Load VPN config
await piggy.proxy.ovpn("./nordvpn-us.ovpn");

// Wait for connection
piggy.proxy.on("proxy:ovpn:loaded", () => {
  console.log("VPN connected, new IP active");
});

await piggy.register("geo-restricted", "https://us-only-site.com");
await piggy.geo-restricted.navigate();
```

### Example 6: Proxy Pool with Fallback

```ts
try {
  await piggy.proxy.fetch("https://api.proxy-service.com/proxies.txt");
} catch (e) {
  console.log("Primary source failed, using backup...");
  await piggy.proxy.load("./backup-proxies.txt");
}

await piggy.proxy.test();
await piggy.proxy.config({ skipDead: true, autoCheck: true });

piggy.proxy.on("proxy:exhausted", async () => {
  console.warn("All proxies dead! Refreshing from backup...");
  await piggy.proxy.load("./emergency-proxies.txt");
  await piggy.proxy.test();
});

setInterval(async () => {
  const stats = await piggy.proxy.stats();
  console.log(`Proxy pool: ${stats.alive}/${stats.total} alive`);
}, 60000);
```

### Example 7: Manual Proxy Rotation on Block

```ts
piggy.onEvent("blocked", "default", async () => {
  console.log("Block detected! Rotating proxy...");
  await piggy.proxy.next();
  await piggy.site.reload();
});

await piggy.proxy.load("./proxies.txt");
await piggy.proxy.enable();

await piggy.register("site", "https://example.com");
await piggy.site.navigate();
```

---

## Proxy File Formats

### Text Format (one per line)

```
http://103.149.162.195:80
https://192.168.1.100:443
socks5://proxy.example.com:1080
socks4://user:pass@proxy.example.com:1080
```

### Auto-Detection

| Input | Auto-Detects As |
|-------|-----------------|
| `103.149.162.195:80` | http |
| `192.168.1.100:443` | https (if SSL works) |
| Port 80, 8080, 3128 | http |
| Port 1080 | socks5 |

### Comments

Lines starting with `#` are ignored.

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `proxy.load(path)` | `path: string` | `Promise<void>` | Load from local file |
| `proxy.fetch(url)` | `url: string` | `Promise<void>` | Fetch from URL |
| `proxy.ovpn(path)` | `path: string` | `Promise<void>` | Load OpenVPN config |
| `proxy.set(opts)` | `{ host, port, type?, user?, pass? }` or `{ proxy: string }` | `Promise<void>` | Set single proxy |
| `proxy.test()` | — | `Promise<void>` | Health check |
| `proxy.testStop()` | — | `Promise<void>` | Stop health check |
| `proxy.next()` | — | `Promise<string>` | Rotate to next |
| `proxy.disable()` | — | `Promise<void>` | Bypass proxy |
| `proxy.enable()` | — | `Promise<void>` | Re-enable proxy |
| `proxy.current()` | — | `Promise<ProxyCurrent>` | Current proxy |
| `proxy.stats()` | — | `Promise<ProxyStats>` | Pool statistics |
| `proxy.list(limit?)` | `limit?: number` | `Promise<ProxyListResult>` | List proxies |
| `proxy.rotation(mode, interval?)` | `mode: "none"\|"timed"\|"perrequest", interval?: number` | `Promise<void>` | Set rotation |
| `proxy.config(opts)` | `{ skipDead?, autoCheck? }` | `Promise<ProxyConfig>` | Configure |
| `proxy.save(path, filter?)` | `path: string, filter?: "all"\|"alive"\|"dead"` | `Promise<void>` | Save to file |

---

## Type Definitions

```ts
interface ProxyCurrent {
  active: boolean;
  host?: string;
  port?: number;
  type?: "http" | "https" | "socks5";
  user?: string;
  proxy?: string;
  latency?: number;
  health?: "alive" | "dead" | "checking" | "unchecked";
}

interface ProxyStats {
  total: number;
  alive: number;
  dead: number;
  index: number;
  active: boolean;
  checking: boolean;
  skipDead: boolean;
  autoCheck: boolean;
}

interface ProxyEntry {
  index: number;
  host: string;
  port: number;
  type: "http" | "https" | "socks5";
  user: string;
  proxy: string;
  latency: number;
  health: "alive" | "dead" | "checking" | "unchecked";
  current: boolean;
}

interface ProxyListResult {
  proxies: ProxyEntry[];
  total: number;
  shown: number;
}

interface ProxyConfig {
  skipDead: boolean;
  autoCheck: boolean;
}
```

---

## Next Steps

- [Captcha API](../captcha) — Handle CAPTCHA and block detection
- [Events API](../events) — Listen to proxy events
- [Intercept API](../intercept) — Intercept requests through proxies

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*