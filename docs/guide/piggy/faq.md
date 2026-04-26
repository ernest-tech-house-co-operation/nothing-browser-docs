# FAQ — Frequently Asked Questions

Common issues, questions, and solutions for Piggy and Nothing Browser.

---

## Getting Started

### Q1: "I updated my library to v0.0.18, but `piggy.proxy` says 'command not recognized'. Why?"

**Answer:** You updated the TypeScript library but are still running an old binary (v0.1.0). New features require **Binary v0.1.12+**.

```bash
# Check your binary version
./nothing-browser-headless --version

# If it's older than v0.1.12, download latest from GitHub Releases
# Replace the binary in your project root
```

**The fix:** Update both. Binary first, then library.

---

### Q2: "Do I have to update if my v0.1.8 scraper is working fine?"

**Answer:** No. Piggy is backward compatible. If you don't need new features (proxies, HTTP mode, hot reload), your old code will work forever on the old binary.

```
┌─────────────────────────────────────────────────────────────────┐
│   ✅ Code works? Keep what you have.                            │
│   ❌ Want new features? Update both binary and library.         │
└─────────────────────────────────────────────────────────────────┘
```

---

### Q3: "I get `error: connect ENOENT /tmp/piggy`. What do I do?"

**Answer:** The binary started but the socket connection failed. Run the binary manually once:

```bash
# Step 1: Run binary manually
./nothing-browser-headless

# Step 2: Wait for: "[Piggy] Headless daemon on socket: piggy"
# Step 3: Press Ctrl+C

# Step 4: Run your script again
bun run your-script.ts
```

This creates the socket file on first run.

---

### Q4: "I get `curl: (52) Empty reply from server`. What's wrong?"

**Answer:** Your request timed out before data was sent back. Common causes:

1. **Human mode is enabled** — `actHuman(true)` adds random delays
2. **Wrong selector** — `waitForSelector()` never finds the element
3. **Page is slow** — target website taking too long

**Solutions:**

```bash
# Increase curl timeout
curl --max-time 60 "http://localhost:3000/search"

# Disable human mode for API
piggy.actHuman(false);

# Fix selector or add timeout
await site.waitForSelector(".correct-class", 10000);
```

---

## Remote Deployment & HTTP Mode

### Q5: "Can I run the Headful (visible) browser in HTTP mode on my VPS?"

**Answer:** No. HTTP mode is exclusive to `nothing-browser-headless`. Headful mode requires a local socket connection to render the UI.

| Binary | HTTP Mode | Socket Mode |
|--------|-----------|-------------|
| `nothing-browser-headless` | ✅ Yes | ✅ Yes |
| `nothing-browser-headful` | ❌ No | ✅ Yes |

---

### Q6: "I lost my API key (the 'peaseernest' string). How do I get it back?"

**Answer:** The key is shown only once on first run. But you can find it in the `{session-name}.piggy` file next to your binary:

```bash
cat my-server.piggy
# {"name":"my-server","key":"peaseernest...","created":"2026-04-26T10:00:00"}
```

**If you deleted the file:** Stop the binary, delete the `.piggy` file, restart — a new key will be generated.

---

### Q7: "Is the HTTP connection between my laptop and VPS encrypted?"

**Answer:** Piggy uses an API key for authorization, but the connection itself is not encrypted by default (plain HTTP).

**For production, put a reverse proxy like Nginx in front:**

```nginx
server {
    listen 443 ssl;
    server_name piggy.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:2005;
        proxy_set_header X-Piggy-Key $http_x_piggy_key;
    }
}
```

---

### Q8: "How do I run Piggy on a VPS in the background?"

**Answer:** Use `nohup` or `systemd`:

```bash
# With nohup
nohup ./nothing-browser-headless > piggy.log 2>&1 &

# Check logs
tail -f piggy.log

# Stop
pkill nothing-browser-headless
```

**For systemd (auto-start on boot):** See [Remote Deployment](./remote-deployment) guide.

---

## Proxy Support

### Q9: "Why does Piggy use a C++ ProxyManager instead of standard Node.js proxy agents?"

**Answer:** Speed and stealth.

| Feature | Node.js Proxy | Piggy C++ Proxy |
|---------|---------------|-----------------|
| Per-request rotation | ❌ Requires browser restart | ✅ Instant |
| IP leak prevention | ⚠️ Possible leaks | ✅ Zero leaks |
| Health checking | ❌ Manual | ✅ Automatic (20 concurrent) |
| OpenVPN support | ❌ No | ✅ Yes |

Handling proxies in C++ prevents "leakage" that reveals your real IP to advanced anti-bots.

---

### Q10: "Can I use my own OpenVPN (.ovpn) files with Piggy?"

**Answer:** Yes. v0.1.12+ supports loading `.ovpn` files directly:

```typescript
// Load VPN config
await piggy.proxy.ovpn("./nordvpn-us.ovpn");

// Wait for connection
piggy.proxy.on("proxy:ovpn:loaded", () => {
  console.log("VPN connected, new IP active");
});
```

This tunnels the browser's traffic specifically through the VPN.

---

### Q11: "How do I rotate proxies automatically?"

**Answer:** Use rotation strategies:

```typescript
// Rotate every 30 seconds
await piggy.proxy.rotation("timed", 30000);

// Rotate per request
await piggy.proxy.rotation("perrequest");

// Manual rotation
await piggy.proxy.next();
```

---

### Q12: "What proxy formats are supported?"

**Answer:** Multiple formats:

```
# HTTP/HTTPS
http://103.149.162.195:80
https://proxy.example.com:443

# SOCKS
socks5://user:pass@proxy.example.com:1080
socks4://proxy.example.com:1080

# Plain (auto-detects)
103.149.162.195:80
```

Lines starting with `#` are ignored.

---

### Q13: "How do I check if my proxies are alive?"

**Answer:** Use `proxy.test()` and listen for events:

```typescript
await piggy.proxy.test();

piggy.proxy.on("proxy:alive", (data) => {
  console.log(`✅ ${data.host}:${data.port} (${data.latencyMs}ms)`);
});

piggy.proxy.on("proxy:dead", (data) => {
  console.log(`❌ ${data.host}:${data.port}`);
});

piggy.proxy.on("proxy:check:done", (data) => {
  console.log(`Done: ${data.alive}/${data.dead} alive`);
});
```

---

## Session Persistence

### Q14: "My `ws.json` file is getting huge (5GB+). How do I stop this?"

**Answer:** WebSocket saving is **opt-in**. Disable it when not debugging:

```typescript
// Stop saving WebSocket frames
await piggy.sessionWsSave(false);

// Delete the large file
// rm ws.json
```

**Recommended:** Enable only for debugging, not for 24/7 production runs.

---

### Q15: "How do I update cookies without restarting my 7-day scrape?"

**Answer:** Use **Hot Reload**:

```bash
# Step 1: Edit cookies.json while scraper runs
nano cookies.json
```

```typescript
// Step 2: Reload from your code
await piggy.sessionReload();

// Browser adopts new cookies instantly, no restart
```

---

### Q16: "What is `identity.json` and can I move it to a different server?"

**Answer:** `identity.json` is your "Hardware DNA" — it contains your CPU, RAM, GPU, and timezone.

**Yes, you can move it.** If you copy `identity.json` to another server, that server will "inherit" your exact hardware fingerprint. This is useful for moving a "warmed up" session from your laptop to a VPS.

```bash
# From laptop
scp identity.json user@vps:/home/user/piggy/

# On VPS — same fingerprint as laptop!
```

**⚠️ Don't edit it manually.** Delete it to regenerate a fresh identity.

---

### Q17: "My cookies aren't persisting across restarts. What's wrong?"

**Answer:** Check that `cookies.json` exists and has write permissions:

```bash
# Check file exists
ls -la cookies.json

# Check permissions
chmod 644 cookies.json

# If missing, Piggy creates it automatically on first cookie set
```

Also ensure you're using HTTP mode or the binary has write access to the directory.

---

## Identity & Profile

### Q18: "What's the difference between `identity.json` and `profile.json`?"

**Answer:**

| File | Purpose | Edit? |
|------|---------|-------|
| `identity.json` | Hardware fingerprint (CPU, RAM, GPU, seeds) | ❌ No |
| `profile.json` | Browser settings (UA, headers, timezone) | ✅ Yes |

`profile.json` is built from `identity.json` on first run. Edit `profile.json` to change User-Agent, language, or timezone.

---

### Q19: "How do I change my User-Agent?"

**Answer:** Edit `profile.json` and reload:

```bash
# Step 1: Stop or pause scraper
# Step 2: Edit profile.json
nano profile.json
```

```json
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0"
}
```

```typescript
// Step 3: Reload
await piggy.sessionReload();

// Step 4: Verify
const ua = await site.evaluate(() => navigator.userAgent);
console.log(ua); // Windows UA now
```

---

### Q20: "Can I have multiple identities on the same machine?"

**Answer:** Yes. Create separate directories for different identities:

```bash
mkdir ./profile-us
cp nothing-browser-headless ./profile-us/
cd ./profile-us
./nothing-browser-headless  # Generates US identity

mkdir ./profile-jp
cp nothing-browser-headless ./profile-jp/
cd ./profile-jp
./nothing-browser-headless  # Generates JP identity
```

Each directory has its own `identity.json`, `profile.json`, and `cookies.json`.

---

## Performance & Stability

### Q21: "Piggy is using too much memory. How do I reduce it?"

**Answer:** Several strategies:

```typescript
// 1. Disable WebSocket saving if enabled
await piggy.sessionWsSave(false);

// 2. Clear captured requests periodically
await piggy.site.capture.clear();

// 3. Close tabs when done
await piggy.site.close();

// 4. Use tab pooling (limits concurrent tabs)
await piggy.register("site", "https://example.com", { pool: 2 });

// 5. Restart the binary daily (via cron)
# cron job: 0 3 * * * pkill nothing-browser-headless && ./nothing-browser-headless
```

---

### Q22: "Piggy crashes randomly. How do I debug?"

**Answer:** Check logs and run in headful mode:

```bash
# Run without nohup to see errors
./nothing-browser-headless

# Or check log file
tail -f piggy.log

# Run headful to see browser window
# (Only works locally, not on headless VPS)
./nothing-browser-headful
```

**Common crash causes:**
- Out of memory (reduce concurrent tabs)
- Corrupted `cookies.json` (delete and restart)
- Old binary version (update to latest)

---

### Q23: "How do I keep Piggy running 24/7 on a VPS?"

**Answer:** Use systemd for auto-restart:

```bash
# Create service file
sudo nano /etc/systemd/system/piggy.service
```

```ini
[Unit]
Description=Piggy Headless Browser
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/piggy
ExecStart=/home/your-user/piggy/nothing-browser-headless
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable piggy
sudo systemctl start piggy
sudo systemctl status piggy
```

---

## Security

### Q24: "Is my data safe when using Piggy?"

**Answer:** Yes. The binary sends zero data out of your machine except the websites you visit.

- ❌ No telemetry
- ❌ No phone home
- ❌ No crash reports sent
- ❌ No tracking

All data stays in your working directory. See [Privacy Policy](/privacypolicy) for details.

---

### Q25: "Can someone hack my Piggy server if they have the key?"

**Answer:** The key provides full control over the browser. **Protect it like a password.**

**Best practices:**
- Store key in environment variables, not code
- Use firewall to restrict IP access: `ufw allow from YOUR_IP to port 2005`
- Use Nginx with client certificate authentication for production
- Rotate keys periodically: delete `.piggy` file and restart

---

### Q26: "Does Piggy work with Cloudflare protected sites?"

**Answer:** Yes. Piggy passes Cloudflare where other tools fail because:

- Real BoringSSL TLS (Chrome-identical JA3 fingerprint)
- No `navigator.webdriver` flag
- DocumentCreation injection (cannot be detected)
- Human mode for behavioral patterns

**Still getting blocked?** Try:
```typescript
// Use headful mode (some sites detect headless)
await piggy.launch({ binary: "headful" });

// Enable human mode
piggy.actHuman(true);

// Use residential proxies
await piggy.proxy.load("./residential-proxies.txt");
```

---

### Q: Can I send 1000 requests per minute with Piggy and not get banned?

**Answer:** No. Piggy is a **stealth suit**, not a magic wand.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Piggy makes you look like a human.                            │
│   It does NOT make you invisible.                               │
│                                                                 │
│   If a human can't do 1000 requests/minute,                     │
│   neither should your scraper.                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Piggy passes the technical sniff test:**
- ✅ TLS handshake looks like Chrome
- ✅ Canvas/WebGL fingerprints look like real hardware
- ✅ Mouse moves with physics, not teleportation
- ✅ No `navigator.webdriver` flag

**But if you act like a bot, you'll be treated like a bot.**

---

### The "Speed Limit" Rule

Amazon knows a human cannot read 60 product pages in 60 seconds.

| Behavior | Result |
|----------|--------|
| 1 request/second | ❌ Obvious bot |
| 1 request/5 seconds | ⚠️ Suspicious |
| 2-7 second random delays | ✅ Human-like |

**The responsible way:**
```typescript
// ❌ Bad — bot behavior
for (let i = 0; i < 1000; i++) {
  await amazon.navigate(`https://amazon.com/s?page=${i}`);
  // No delay — instant ban
}

// ✅ Good — human behavior
for (let i = 0; i < 1000; i++) {
  await amazon.navigate(`https://amazon.com/s?page=${i}`);
  // Random delay between 2-7 seconds
  await amazon.wait(Math.random() * 5000 + 2000);
}
```

---

### IP Reputation — The "Neighborhood" Rule

If you come from a cheap datacenter IP, Amazon's guard is already up before you load the page.

| IP Type | Risk Level |
|---------|------------|
| Residential proxy | ✅ Low |
| Mobile IP | ✅ Very low |
| Datacenter IP (AWS/DigitalOcean) | ❌ High risk |

**Solution:** Use Piggy's proxy support with residential IPs:
```typescript
await piggy.proxy.load("./residential-proxies.txt");
await piggy.proxy.enable();
```

---

### The "Consistent Soul" — Keep Your Identity

Real humans don't change their CPU, RAM, and GPU every time they open a tab.

| Action | Result |
|--------|--------|
| Delete `identity.json` daily | ❌ Amazon sees a new computer every day — suspicious |
| Keep `identity.json` for 7 days | ✅ Amazon sees the "same" human — builds trust |

**Don't delete your `identity.json`.** Let Amazon recognize you.

---

### The Golden Rule of Scraping

> "The best scraper looks so much like a human, it's not worth the server's time to double-check."

| Approach | Result |
|----------|--------|
| Piggy + random delays + residential proxies | ✅ Week-long scrape, no CAPTCHAs |
| Piggy + 1000 requests/minute | ❌ Banned in minutes |

---

### Realistic Expectations for a 7-Day Scrape

| Strategy | Requests/day | Delay | Risk |
|----------|--------------|-------|------|
| Single IP, 2-7s delay | ~12,000 | 5s avg | ✅ Low |
| Single IP, 1s delay | ~86,000 | 1s avg | ⚠️ Medium |
| Residential proxy pool, 2-7s delay | ~12,000 per IP | 5s avg | ✅ Very low |
| Datacenter IP, no delay | Unlimited | 0s | ❌ Immediate ban |

**Recommended for 7 days:**
- Use 5-10 residential proxies
- Rotate every 10 requests or every 5 minutes
- Add 2-7 second random delays
- Keep your `identity.json`

---

### Bottom Line

Piggy is a **stealth suit**, not a ghost.

- You can walk past guards undetected
- You cannot knock over furniture and expect to stay invisible

**Treat Piggy with respect. Add delays. Use proxies. Keep your identity. You'll scrape for 7 days without a single CAPTCHA.**

---

### Q: Can I use Puppeteer with Nothing Browser?

**Answer:** No. Not from me. And probably not ever.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Piggy uses SOCKET communication.                              │
│   Puppeteer uses CDP (Chrome DevTools Protocol).                │
│                                                                 │
│   They speak completely different languages.                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### The Technical Reality

| | Piggy | Puppeteer |
|---|-------|-----------|
| **Communication** | Socket (Unix/Windows pipes) | CDP (WebSocket) |
| **Library size** | ~50KB | ~50MB |
| **What it does** | Maps commands to socket messages | Entire CDP implementation |
| **Port to other languages** | Trivial (paste into LLM) | Extremely complex |

**Piggy library is just a thin wrapper.** It does almost nothing except send commands to the binary.

**Puppeteer is a monster.** It reimplements the entire Chrome DevTools Protocol.

---

### Can You Make Them Work Together?

**Theoretically?** Yes. Someone could write a bridge that translates CDP commands to Piggy socket commands.

**Realistically?** That would require:

```cpp
// CDP command → Socket command
// Example: Page.navigate → { cmd: "navigate", payload: { url } }

// This is NOT trivial
// CDP has 500+ methods
// Piggy has ~50 socket commands
```

**If someone manages to make CDP and socket communicate fast — like how Piggy currently works — I will gladly market it as "Use Puppeteer to control Nothing Browser."**

But I won't code it myself. I have other priorities.

---

### What About Playwright?

Same answer. Playwright also uses CDP (for Chromium) or other protocols for Firefox/WebKit.

| Tool | Protocol |
|------|----------|
| Puppeteer | CDP |
| Playwright | CDP (Chromium) + others |
| Selenium | WebDriver |
| Piggy | Custom socket |

**None of them speak Piggy's socket language.**

---

### Want to Build It?

Open a PR. I'll endorse you.

**Requirements:**
- Translate CDP commands to Piggy socket commands
- Maintain it
- Keep it fast

**What you get:**
- My endorsement
- A link in the README
- Eternal gratitude from Puppeteer users who want Nothing Browser

---

### The Bottom Line

| Your Question | Answer |
|---------------|--------|
| "Can I use Puppeteer with Nothing Browser?" | No. |
| "Will you build it?" | No. |
| "Can someone else build it?" | Yes. Open a PR. |
| "Should I just use Piggy instead?" | Yes. It's 50KB and does the same thing. |

**Piggy exists so you don't need Puppeteer for scraping.** 

---

### Why Piggy is Better for Scraping

| Feature | Piggy | Puppeteer |
|---------|-------|-----------|
| Built-in anti-detection | ✅ Yes | ❌ Needs plugins |
| Fingerprint spoofing | ✅ Built-in | ❌ Hacks required |
| HTTP mode (remote VPS) | ✅ Yes | ❌ No |
| Proxy rotation | ✅ Built-in | ❌ Manual |
| WebSocket frame saving | ✅ Opt-in | ❌ No |
| Session hot reload | ✅ Yes | ❌ No |
| Library size | 50KB | 50MB |

**Piggy was built for scraping. Puppeteer was built for testing.**

Use the right tool for the job.

---

## Troubleshooting Quick Reference

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| `command not recognized` | Binary too old | Update to v0.1.12+ |
| `ENOENT /tmp/piggy` | Socket not created | Run binary manually once |
| `curl: (52) Empty reply` | Timeout or human mode | Add `--max-time` or disable `actHuman()` |
| Cookies not saving | Write permission | `chmod 644 cookies.json` |
| Proxy command fails | Binary v0.1.0 | Update to v0.1.12+ |
| Identity changes each run | `identity.json` deleted | Keep the file |
| ws.json too large | Still saving | `sessionWsSave(false)` |

---

## Getting Help

**Still stuck?**

1. Check your versions: `./nothing-browser-headless --version` and `bun list | grep nothing-browser`
2. Search existing [GitHub Issues](https://github.com/BunElysiaReact/nothing-browser/issues)
3. Join [Discord](https://discord.gg/TUxBVQ7y) for community support
4. Open a new GitHub issue with:
   - Binary version
   - Library version
   - OS (`uname -a`)
   - Error message
   - Minimal reproduction code

---

## Next Steps

- [Remote Deployment](./remote-deployment) — Run Piggy on a VPS
- [Proxy Support](./proxy-support) — Route traffic through proxies
- [Version Compatibility](./version-compatibility) — Understand binary vs library versions

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*