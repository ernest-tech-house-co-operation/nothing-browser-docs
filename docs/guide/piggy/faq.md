# FAQ — Frequently Asked Questions

Common issues, questions, and solutions for Piggy and Nothing Browser.

---

## Getting Started

### Q1: "I updated my library to v0.0.18, but `piggy.proxy` says 'command not recognized'. Why?"

**Answer:** You updated the TypeScript library but are still running an old binary (v0.1.0). New features require **Binary v0.1.14+**.

```bash
# Check your binary version
./nothing-browser-headless --version

# If it's older than v0.1.14, download latest from GitHub Releases
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
await site.wait.selector({ selector: ".correct-class", timeout: 10000 });
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

## Proxy Support

### Q8: "Why does Piggy use a C++ ProxyManager instead of standard Node.js proxy agents?"

**Answer:** Speed and stealth.

| Feature | Node.js Proxy | Piggy C++ Proxy |
|---------|---------------|-----------------|
| Per-request rotation | ❌ Requires browser restart | ✅ Instant |
| IP leak prevention | ⚠️ Possible leaks | ✅ Zero leaks |
| Health checking | ❌ Manual | ✅ Automatic (20 concurrent) |
| OpenVPN support | ❌ No | ✅ Yes |

Handling proxies in C++ prevents "leakage" that reveals your real IP to advanced anti-bots.

---

### Q9: "How do I rotate proxies automatically?"

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

## Identity & Profile

### Q10: "What is `identity.json` and can I move it to a different server?"

**Answer:** `identity.json` is your "Hardware DNA" — it contains your CPU, RAM, GPU, and timezone.

**Yes, you can move it.** If you copy `identity.json` to another server, that server will "inherit" your exact hardware fingerprint. This is useful for moving a "warmed up" session from your laptop to a VPS.

```bash
# From laptop
scp identity.json user@vps:/home/user/piggy/

# On VPS — same fingerprint as laptop!
```

**⚠️ Don't edit it manually.** Delete it to regenerate a fresh identity.

---

### Q11: "Can I have multiple identities on the same machine?"

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

## Security & Responsible Scraping

### Q12: "Can I send 1000 requests per minute with Piggy and not get banned?"

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

### The Golden Rule of Scraping

> "The best scraper looks so much like a human, it's not worth the server's time to double-check."

| Approach | Result |
|----------|--------|
| Piggy + random delays + residential proxies | ✅ Week-long scrape, no CAPTCHAs |
| Piggy + 1000 requests/minute | ❌ Banned in minutes |

---

### Q13: "Can I use Puppeteer with Nothing Browser?"

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

| | Piggy | Puppeteer |
|---|-------|-----------|
| **Communication** | Socket (Unix/Windows pipes) | CDP (WebSocket) |
| **Library size** | ~50KB | ~50MB |
| **What it does** | Maps commands to socket messages | Entire CDP implementation |

**If someone manages to make CDP and socket communicate fast — like how Piggy currently works — I will gladly market it as "Use Puppeteer to control Nothing Browser."**

But I won't code it myself. I have other priorities.

---

## Troubleshooting Quick Reference

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| `command not recognized` | Binary too old | Update to v0.1.14+ |
| `ENOENT /tmp/piggy` | Socket not created | Run binary manually once |
| `curl: (52) Empty reply` | Timeout or human mode | Add `--max-time` or disable `actHuman()` |
| Cookies not saving | Write permission | `chmod 644 cookies.json` |
| Proxy command fails | Binary v0.1.0 | Update to v0.1.14+ |
| Identity changes each run | `identity.json` deleted | Keep the file |
| ws.json too large | Still saving | `session.setWsSave(false)` |

---

## Getting Help

**Still stuck?**

1. Check your versions: `./nothing-browser-headless --version` and `bun list | grep nothing-browser`
2. Search existing [GitHub Issues](https://github.com/BunElysiaReact/nothing-browser/issues)
3. Join [Discord](https://discord.gg/TUxBVQ7y) for community support
4. Join [WhatsApp Channel](https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U) for updates
5. Open a new GitHub issue with:
   - Binary version
   - Library version
   - OS (`uname -a`)
   - Error message
   - Minimal reproduction code

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*