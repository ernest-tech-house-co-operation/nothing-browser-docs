# 🌐 Remote Deployment — HTTP Mode

Run Piggy on a VPS and connect from anywhere. No more keeping your laptop running 24/7.

---

## Overview

Piggy headless binary can run in **HTTP mode** — a secure API server on port 2005. Connect from any machine using your generated API key.

| Mode | Transport | Use Case |
|------|-----------|----------|
| **Socket** (default) | Unix socket / Windows pipe | Local development, same machine |
| **HTTP** | TCP port 2005 + API key | Remote VPS, cloud deployment, team access |

> ⚠️ **Headful binary does NOT support HTTP mode.** Only `nothing-browser-headless` can run as an HTTP server.

---

## First-Time Setup

### Step 1: Run the Binary

```bash
./nothing-browser-headless
```

### Step 2: Choose HTTP Mode

```
Mode? (socket/http): http
```

### Step 3: Enter a Session Name

```
Session name: my-production-server
```

The session name can be anything — spaces are allowed.

### Step 4: Copy Your Key

```
Session : my-production-server
Key     : peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d
Saved to: /home/user/my-scraper/my-production-server.piggy

⚠️  Keep your key safe — it will not be shown again.
    To reset: delete my-production-server.piggy and restart.
```

**Your key is shown ONCE.** Copy it immediately and save it somewhere safe (`.env` file, password manager, etc.)

### Step 5: Verify It's Running

```
[Piggy] HTTP API ready on port 2005
```

---

## Key File

The key is also saved to `{session-name}.piggy` next to your binary:

```json
{
  "name": "my-production-server",
  "key": "peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d",
  "created": "2026-04-26T10:00:00"
}
```

You can read it anytime:

```bash
cat my-production-server.piggy
```

---

## Connecting from TypeScript

### Local Connection

```typescript
import piggy from "nothing-browser";

await piggy.connect({
  host: "http://localhost:2005",
  key: "peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d"
});

// Now use piggy normally
await piggy.register("amazon", "https://amazon.com");
await piggy.amazon.navigate();
```

### Remote VPS Connection

```typescript
await piggy.connect({
  host: "http://your-vps-ip:2005",
  key: "peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d"
});
```

### Using Environment Variable

```typescript
// .env
PIGGY_HOST=http://your-vps-ip:2005
PIGGY_KEY=peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d

// your code
await piggy.connect({
  host: process.env.PIGGY_HOST,
  key: process.env.PIGGY_KEY
});
```

---

## Testing Your Connection

The simplest test — send "hello" to confirm the server is alive:

```bash
curl -X POST http://your-vps:2005 \
  -H "X-Piggy-Key: peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d" \
  -d "hello"
```

**Correct key response:**
```
Hello! I am active. Start scraping.
```

**Wrong or missing key:**
```json
{"ok": false, "error": "Unauthorized — invalid or missing X-Piggy-Key"}
```

---

## Deploying on a VPS

### Step 1: Upload the Binary

```bash
scp nothing-browser-headless user@your-vps:/home/user/piggy/
```

### Step 2: SSH In and Run First-Time Setup

```bash
ssh user@your-vps
cd /home/user/piggy
chmod +x nothing-browser-headless
./nothing-browser-headless
```

Follow the prompts — choose HTTP mode, enter a session name, copy your key.

### Step 3: Run in Background

```bash
nohup ./nothing-browser-headless > piggy.log 2>&1 &
```

### Step 4: Check It's Running

```bash
tail -f piggy.log
# Should see: [Piggy] HTTP API ready on port 2005
```

### Step 5: Open Firewall Port

```bash
# Ubuntu / Debian
sudo ufw allow 2005

# CentOS / RHEL
sudo firewall-cmd --permanent --add-port=2005/tcp
sudo firewall-cmd --reload
```

### Step 6: Connect from Your Code

Use the VPS IP address and the key you saved.

---

## Managing the Remote Process

### Stop the Server

```bash
pkill nothing-browser-headless
```

### Restart

```bash
pkill nothing-browser-headless
nohup ./nothing-browser-headless > piggy.log 2>&1 &
```

### Check if Running

```bash
pgrep -f nothing-browser-headless
# Returns PID if running
```

### View Logs

```bash
tail -f piggy.log
```

### Auto-Start with systemd (Optional)

Create `/etc/systemd/system/piggy.service`:

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

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable piggy
sudo systemctl start piggy
sudo systemctl status piggy
```

---

## Resetting Your Key

If you lose your key or want to generate a new one:

```bash
# 1. Stop the binary
pkill nothing-browser-headless

# 2. Delete the key file
rm my-production-server.piggy

# 3. Restart — you'll be prompted again
./nothing-browser-headless
```

**Your old key will no longer work.** Update your code with the new key.

---

## File Structure After First Run

```
/home/user/piggy/
├── nothing-browser-headless
├── my-production-server.piggy   ← KEY FILE (keep safe!)
├── identity.json                ← browser fingerprint (auto-generated)
├── cookies.json                 ← persistent cookies (auto-created)
├── profile.json                 ← browser settings (auto-created)
├── ws.json                      ← WebSocket frames (opt-in)
└── pings.json                   ← ping log (opt-in)
```

---

## Security Best Practices

| Practice | Why |
|----------|-----|
| **Use environment variables** | Never hardcode keys in source code |
| **Rotate keys periodically** | Delete `.piggy` file and regenerate |
| **Use firewall** | Restrict port 2005 to trusted IPs only |
| **Run as non-root user** | Never run as root |
| **Use HTTPS proxy** | Put nginx with SSL in front for production |
| **Monitor logs** | Watch for unauthorized access attempts |

### Restrict to Specific IPs (UFW)

```bash
# Allow only your office IP
sudo ufw allow from 123.456.789.0 to any port 2005

# Deny everyone else
sudo ufw deny 2005
```

---

## Limitations

| Limitation | Explanation |
|------------|-------------|
| **Headless only** | HTTP mode only works with `nothing-browser-headless` |
| **No HTTPS** | Use nginx as a reverse proxy for SSL termination |
| **No built-in auth beyond key** | Key is the only authentication |
| **Single session per binary** | One key, one session per running binary |

---

## Troubleshooting

### "Connection refused"

**Cause:** Server not running or wrong port

**Fix:**
```bash
# Check if running
pgrep -f nothing-browser-headless

# Check port
netstat -tlnp | grep 2005
```

### "Unauthorized — invalid X-Piggy-Key"

**Cause:** Wrong key or key file deleted

**Fix:**
```bash
# Check your key file
cat *.piggy

# Or regenerate
rm *.piggy
./nothing-browser-headless
```

### "Address already in use"

**Cause:** Another process on port 2005

**Fix:**
```bash
# Find and kill
lsof -i :2005
kill -9 <PID>
```

### Binary starts but no HTTP

**Cause:** You chose socket mode by accident

**Fix:** Delete the key file and restart, choose "http" this time.

---

## API Reference

### Connection Methods

| Method | Description |
|--------|-------------|
| `piggy.connect({ host, key })` | Connect to remote Piggy HTTP server |
| `piggy.close()` | Disconnect from server |

### Connection Options

```typescript
interface ConnectOptions {
  host: string;   // http://localhost:2005 or http://your-vps:2005
  key: string;    // Your 64-character key (starts with "peaseernest")
}
```

---

## Next Steps

- [Proxy Support](./proxy-support) — Route traffic through proxies, rotate IPs
- [Session Persistence](./session-persistence) — Save WebSocket frames and pings
- [Identity & Profile](./identity-profile) — Understand fingerprint files
- [Cookies Hot Reload](./cookies-hotreload) — Edit cookies while browser runs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
