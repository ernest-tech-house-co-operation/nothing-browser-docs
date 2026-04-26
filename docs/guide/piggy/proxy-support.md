# 🚀 Proxy Support — Rotate IPs, Bypass Blocks

Route all browser traffic through proxies. Rotate IPs automatically, health-check proxies, load lists from files or URLs, and even use OpenVPN configs.

---

## Overview

Piggy's proxy system gives you full control over IP rotation:

| Feature | Description |
|---------|-------------|
| **Load proxies** | From local file or remote URL |
| **Health checking** | Parallel testing (20 concurrent) with real-time events |
| **Rotation strategies** | None, timed, or per-request |
| **OpenVPN support** | Load `.ovpn` files directly |
| **Hot reload** | Add/remove proxies without restart |
| **Save results** | Export alive/dead/all proxies to file |

> ⚠️ **Version Required:** Binary v0.1.12+ | Library v0.0.18+

---

## Quick Start

```typescript
import piggy from "nothing-browser";

// Connect to Piggy (HTTP mode required for remote)
await piggy.connect({
  host: "http://localhost:2005",
  key: "peaseernest..."
});

// Load proxy list from URL
await piggy.proxy.fetch("https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt");

// Or load from local file
await piggy.proxy.load("./proxies.txt");

// Enable proxy
await piggy.proxy.enable();

// Check current proxy
const current = await piggy.proxy.current();
console.log(current);
// { host: "103.149.162.195", port: 80, type: "http", alive: true, latencyMs: 245 }

// Rotate to next proxy
await piggy.proxy.next();

// Health check all proxies
await piggy.proxy.test();
// Watch events: proxy:alive, proxy:dead, proxy:check:done

// Get stats
const stats = await piggy.proxy.stats();
console.log(stats);
// { total: 150, alive: 87, dead: 63, index: 5, checking: false }
```

---

## Loading Proxies

### From Local File

```typescript
await piggy.proxy.load("./proxies.txt");
```

File format (one per line):
```
http://103.149.162.195:80
https://192.168.1.100:443
socks5://user:pass@proxy.example.com:1080
103.149.162.195:80  # auto-detects http
```

### From URL

```typescript
await piggy.proxy.fetch("https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt");
```

### From OpenVPN Config

```typescript
await piggy.proxy.ovpn("./my-vpn-config.ovpn");
```

### Manual Set (Single Proxy)

```typescript
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

---

## Proxy Types

| Type | Description | Example |
|------|-------------|---------|
| `http` | HTTP proxy | `http://103.149.162.195:80` |
| `https` | HTTPS proxy | `https://192.168.1.100:443` |
| `socks5` | SOCKS5 proxy | `socks5://proxy.example.com:1080` |
| `socks4` | SOCKS4 proxy | `socks4://proxy.example.com:1080` |

---

## Health Checking

### Start Health Check

```typescript
// Tests all loaded proxies in parallel (20 concurrent)
await piggy.proxy.test();
```

### Monitor Health Events

```typescript
// Listen for health check events
piggy.proxy.on("proxy:alive", (data) => {
  console.log(`✅ Proxy alive: ${data.host}:${data.port} (${data.latencyMs}ms)`);
});

piggy.proxy.on("proxy:dead", (data) => {
  console.log(`❌ Proxy dead: ${data.host}:${data.port}`);
});

piggy.proxy.on("proxy:check:started", (data) => {
  console.log(`🔄 Health check started for ${data.total} proxies`);
});

piggy.proxy.on("proxy:check:done", (data) => {
  console.log(`✅ Health check complete: ${data.alive} alive, ${data.dead} dead`);
});

piggy.proxy.on("proxy:exhausted", () => {
  console.warn("⚠️ No alive proxies remaining!");
});
```

### Stop Health Check

```typescript
await piggy.proxy.testStop();
```

---

## Rotation Strategies

### None (Manual)

```typescript
await piggy.proxy.rotation("none");
// You must call proxy.next() manually to rotate
```

### Timed Rotation

```typescript
// Rotate every 10 seconds
await piggy.proxy.rotation("timed", 10000);

// Rotate every 5 minutes
await piggy.proxy.rotation("timed", 300000);
```

### Per-Request Rotation

```typescript
// Rotate to next proxy for each new page/tab
await piggy.proxy.rotation("perrequest");
```

### Manual Rotation

```typescript
// Rotate to next proxy immediately
await piggy.proxy.next();

// Check current after rotation
const current = await piggy.proxy.current();
```

### Reset Rotation

```typescript
// Stop automatic rotation, keep current proxy
await piggy.proxy.rotation("none");
```

---

## Enabling / Disabling

### Enable Proxy

```typescript
// Start routing traffic through proxy
await piggy.proxy.enable();
```

### Disable Proxy

```typescript
// Bypass proxy, use real IP
await piggy.proxy.disable();
```

### Check Current State

```typescript
const current = await piggy.proxy.current();
console.log(current);
// {
//   host: "103.149.162.195",
//   port: 80,
//   type: "http",
//   alive: true,
//   latencyMs: 245
// }
```

---

## Configuration

```typescript
// Skip dead proxies automatically
await piggy.proxy.config({ skipDead: true });

// Enable auto health checking (periodic)
await piggy.proxy.config({ autoCheck: true });

// Both together
await piggy.proxy.config({ skipDead: true, autoCheck: true });
```

---

## Statistics & Listing

### Get Stats

```typescript
const stats = await piggy.proxy.stats();
console.log(stats);
// {
//   total: 150,     // Total proxies loaded
//   alive: 87,      // Proxies that passed health check
//   dead: 63,       // Proxies that failed health check
//   index: 5,       // Current position in rotation
//   checking: false // Whether health check is running
// }
```

### List Proxies

```typescript
// Get all proxies (may be large)
const allProxies = await piggy.proxy.list();

// Get first 10 only
const first10 = await piggy.proxy.list(10);

// Each entry shows health status
console.log(first10[0]);
// {
//   host: "103.149.162.195",
//   port: 80,
//   type: "http",
//   alive: true,
//   latencyMs: 245
// }
```

---

## Saving Proxies

### Save Alive Proxies

```typescript
// Save only working proxies
await piggy.proxy.save("./alive-proxies.txt", "alive");
```

### Save Dead Proxies

```typescript
// Save failed proxies (for debugging)
await piggy.proxy.save("./dead-proxies.txt", "dead");
```

### Save All Proxies

```typescript
// Save everything (preserves health status in comments)
await piggy.proxy.save("./all-proxies.txt", "all");
```

Output format:
```
# Alive: 87, Dead: 63
http://103.149.162.195:80  # alive, 245ms
http://192.168.1.100:8080  # dead
socks5://proxy.example.com:1080  # alive, 89ms
```

---

## Real-World Examples

### 1. Rotating Residential Proxy Pool

```typescript
import piggy from "nothing-browser";

await piggy.connect({
  host: "http://localhost:2005",
  key: process.env.PIGGY_KEY
});

// Load premium proxy list
await piggy.proxy.fetch("https://api.proxy-service.com/get-proxies?key=YOUR_KEY&format=txt");

// Enable auto-rotation per request
await piggy.proxy.rotation("perrequest");

// Enable skipping dead proxies
await piggy.proxy.config({ skipDead: true });

// Health check
await piggy.proxy.test();

// Monitor events
piggy.proxy.on("proxy:exhausted", async () => {
  console.log("No proxies left! Refreshing...");
  await piggy.proxy.fetch("https://api.proxy-service.com/get-proxies?key=YOUR_KEY&format=txt");
  await piggy.proxy.test();
});

// Now each new page/tab gets a different IP
await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate(); // Uses first proxy
// ... do stuff ...

await piggy.amazon.close();
// Next register will use next proxy automatically
```

### 2. Scraping with Timed Rotation

```typescript
// Rotate IP every 30 seconds to avoid rate limiting
await piggy.proxy.rotation("timed", 30000);

await piggy.register("target", "https://target-site.com");

for (let i = 0; i < 100; i++) {
  await piggy.target.navigate(`https://target-site.com/page/${i}`);
  const data = await piggy.target.evaluate(() => ({ ... }));
  await piggy.target.store(data);
  console.log(`Scraped page ${i}, proxy rotates every 30s automatically`);
}
```

### 3. Multi-Region Proxy Setup

```typescript
// Load proxies from different regions
await piggy.proxy.load("./us-proxies.txt");
await piggy.proxy.load("./eu-proxies.txt");
await piggy.proxy.load("./asia-proxies.txt");

// Check health
await piggy.proxy.test();

// Get stats
const stats = await piggy.proxy.stats();
console.log(`US+EU+Asia combined: ${stats.alive} working proxies`);

// Save working proxies for next run
await piggy.proxy.save("./working-proxies.txt", "alive");

// Manual rotation
for (const url of urls) {
  const current = await piggy.proxy.current();
  console.log(`Scraping with: ${current.host}:${current.port}`);
  
  await piggy.site.navigate(url);
  // ... scrape ...
  
  await piggy.proxy.next(); // Next region IP
}
```

### 4. OpenVPN Integration

```typescript
// Load VPN config
await piggy.proxy.ovpn("./nordvpn-us.ovpn");

// Wait for connection
await new Promise(resolve => {
  piggy.proxy.on("proxy:ovpn:loaded", resolve);
});

console.log("VPN connected, new IP active");

// Scrape with VPN IP
await piggy.register("geo-restricted", "https://us-only-site.com");
await piggy.geo-restricted.navigate();

// Switch to different VPN server
await piggy.proxy.ovpn("./nordvpn-uk.ovpn");
```

### 5. Proxy Pool with Fallback

```typescript
// Load multiple proxy sources
try {
  await piggy.proxy.fetch("https://api.proxy-service.com/proxies.txt");
} catch (e) {
  console.log("Primary source failed, using backup...");
  await piggy.proxy.load("./backup-proxies.txt");
}

// Health check
await piggy.proxy.test();

// Configure to skip dead proxies automatically
await piggy.proxy.config({ skipDead: true, autoCheck: true });

// Monitor exhaustion
piggy.proxy.on("proxy:exhausted", async () => {
  console.warn("All proxies dead! Refreshing from backup...");
  await piggy.proxy.load("./emergency-proxies.txt");
  await piggy.proxy.test();
});

// Stats logging every minute
setInterval(async () => {
  const stats = await piggy.proxy.stats();
  console.log(`Proxy pool: ${stats.alive}/${stats.total} alive`);
}, 60000);
```

---

## Events Reference

| Event | Payload | When |
|-------|---------|------|
| `proxy:loaded` | `{ count }` | After load() or fetch() completes |
| `proxy:changed` | `{ host, port, type }` | After rotation (manual or timed) |
| `proxy:alive` | `{ host, port, type, latencyMs }` | Proxy passes health check |
| `proxy:dead` | `{ host, port, type }` | Proxy fails health check |
| `proxy:check:started` | `{ total }` | Health check begins |
| `proxy:check:done` | `{ alive, dead }` | Health check completes |
| `proxy:exhausted` | `{}` | No alive proxies remaining |
| `proxy:fetch:failed` | `{ url, error }` | proxy.fetch() failed |
| `proxy:ovpn:loaded` | `{ path }` | OpenVPN config loaded |

### Event Subscription

```typescript
// Subscribe to single event
const unsubscribe = piggy.proxy.on("proxy:alive", (data) => {
  console.log("Proxy alive:", data);
});

// Unsubscribe
unsubscribe();

// Subscribe to multiple
piggy.proxy.on("proxy:dead", (data) => {
  // handle dead proxy
});
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

If no protocol specified, Piggy auto-detects:
- `103.149.162.195:80` → http
- `192.168.1.100:443` → https (if SSL works)
- Standard ports (80, 8080, 3128) → http
- Port 1080 → socks5

### Comment Lines

Lines starting with `#` are ignored:

```
# This is a comment
http://103.149.162.195:80  # inline comments also ignored
```

---

## API Reference

### Proxy Methods

| Method | Description |
|--------|-------------|
| `proxyLoad(path)` | Load proxies from local file |
| `proxyFetch(url)` | Fetch proxies from URL |
| `proxyOvpn(path)` | Load OpenVPN config |
| `proxySet({ host, port, type, user, pass })` | Set single proxy |
| `proxyTest()` | Start health check |
| `proxyTestStop()` | Stop health check |
| `proxyNext()` | Rotate to next proxy |
| `proxyDisable()` | Bypass proxy, use real IP |
| `proxyEnable()` | Re-enable proxy |
| `proxyCurrent()` | Get current proxy details |
| `proxyStats()` | Get total/alive/dead/index/checking |
| `proxyList(limit?)` | List all proxies with health |
| `proxyRotation(mode, interval?)` | Set rotation strategy |
| `proxyConfig({ skipDead, autoCheck })` | Runtime config |
| `proxySave(path, filter)` | Save proxies to file |
| `onProxyEvent(event, handler)` | Subscribe to events |

### Proxy Set Options

```typescript
interface ProxySetOptions {
  host?: string;
  port?: number;
  type?: "http" | "https" | "socks5" | "socks4";
  user?: string;
  pass?: string;
  proxy?: string;  // URL format: "http://host:port"
}
```

### Rotation Modes

| Mode | Description |
|------|-------------|
| `"none"` | Manual only (call proxyNext()) |
| `"timed"` | Rotate every N milliseconds |
| `"perrequest"` | Rotate for each new page/tab |

---

## Troubleshooting

### "No alive proxies"

**Cause:** All proxies failed health check

**Fix:**
```typescript
// Load fresh proxies
await piggy.proxy.fetch("https://your-proxy-source.com/list.txt");
await piggy.proxy.test();

// Or disable proxy temporarily
await piggy.proxy.disable();
```

### High latency

**Cause:** Proxies are slow

**Fix:**
```typescript
// Check latency in stats
const stats = await piggy.proxy.stats();
console.log(stats);

// Save only fast proxies (you'd need to filter manually)
const all = await piggy.proxy.list();
const fast = all.filter(p => p.latencyMs && p.latencyMs < 500);
// Then create a new file with fast proxies only
```

### "command not recognized"

**Cause:** Binary version too old (< v0.1.12)

**Fix:** Update binary to v0.1.12+

### OpenVPN not connecting

**Cause:** Missing OpenVPN dependencies

**Fix:**
```bash
# Ubuntu/Debian
sudo apt install openvpn

# Check file permissions
chmod 600 my-vpn-config.ovpn
```

---

## Next Steps

- [Remote Deployment](./remote-deployment) — Run Piggy on a VPS with proxies
- [Session Persistence](./session-persistence) — Save WebSocket frames and pings
- [Identity & Profile](./identity-profile) — Understand fingerprint files

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
