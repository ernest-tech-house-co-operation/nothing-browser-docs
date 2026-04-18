# Session Management

Nothing Browser auto-saves your session on close and lets you reload it at any time. Perfect for continuing your work across browser restarts.

---

## Overview

Sessions capture everything you've done and let you pick up right where you left off.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SESSION MANAGEMENT                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💾 Save Current Session...    → Save with custom name                      │
│  ⚡ Quick Save                 → Save with timestamp name                   │
│  📂 Load Last Session          → Resume where you left off                  │
│  📁 Load Session...            → Load any saved session file                │
│  📁 Open Sessions Folder       → Browse all session files                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What's in a Session

Sessions are JSON files that contain:

| Component | What's Saved |
|-----------|--------------|
| **Network requests** | All captured HTTP requests (method, URL, status, headers, bodies) |
| **WebSocket frames** | All captured WebSocket frames (direction, type, data) |
| **Cookies** | All cookies (name, value, domain, path, flags) |
| **Storage** | All localStorage and sessionStorage entries |
| **Current URL** | The page you were on |

### Session File Structure

```json
{
  "version": "1.0",
  "timestamp": 1700000000000,
  "url": "https://example.com/dashboard",
  "requests": [
    {
      "method": "GET",
      "url": "https://api.example.com/users",
      "status": 200,
      "requestHeaders": {...},
      "responseHeaders": {...}
    }
  ],
  "websockets": [
    {
      "direction": "sent",
      "type": "text",
      "data": "{\"type\":\"ping\"}"
    }
  ],
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123",
      "domain": ".example.com"
    }
  ],
  "storage": {
    "localStorage": [
      { "key": "theme", "value": "dark" }
    ],
    "sessionStorage": []
  }
}
```

---

## Auto-Save

On close, the session is automatically saved to:

```
~/.config/nothing-browser/sessions/last-session.json
```

| Platform | Path |
|----------|------|
| **Linux** | `~/.config/nothing-browser/sessions/` |
| **macOS** | `~/Library/Application Support/nothing-browser/sessions/` |
| **Windows** | `%APPDATA%\nothing-browser\sessions\` |

**You don't need to do anything — it just works.**

---

## Loading the Last Session

### Method 1: Menu

**Session → Load Last Session** (`Ctrl+Shift+O`)

### Method 2: On Launch

The last session is always available from the menu. On next launch, you can load it with one click.

### What Happens

```
Last session loaded → Browser restores:
  • All captured requests
  • All WebSocket frames
  • All cookies
  • All storage entries
  • Last URL
```

---

## Saving a Named Session

**Session → Save Current Session...** (`Ctrl+S`)

1. Enter a name (e.g., `amazon-login`, `api-debug`, `product-scrape`)
2. Click Save

The session is saved to:

```
~/.config/nothing-browser/sessions/your-name.json
```

### Use Cases for Named Sessions

| Session Name | Use |
|--------------|-----|
| `amazon-login` | Saved after logging into Amazon |
| `api-capture` | Captured API calls for documentation |
| `bug-report` | Session showing a bug to share |
| `price-check` | Product pages for price monitoring |

---

## Quick Save (Auto-name)

**Session → Quick Save** (`Ctrl+Shift+S`)

Saves with a timestamp name — no need to type:

```
2025-01-15_14-30-22.json
2025-01-15_15-45-10.json
2025-01-15_16-20-05.json
```

Perfect for:
- Saving checkpoints during debugging
- Creating session history
- Quick backups before risky actions

---

## Sharing Sessions

Sessions are **plain JSON files**. You can share them with teammates or across machines.

### Share with Teammate

```bash
# Export
cp ~/.config/nothing-browser/sessions/debug-session.json /tmp/

# Send via Slack, email, USB, etc.

# Teammate imports
cp /tmp/debug-session.json ~/.config/nothing-browser/sessions/
```

### Load on Another Machine

1. Copy session file to target machine
2. Place in sessions folder
3. **Session → Load Session...** → Select file

**All captured data transfers — including cookies and WebSocket frames.**

---

## Sessions Folder

**Session → Open Sessions Folder**

Opens the sessions directory in your file manager.

### What You Can Do

| Action | How |
|--------|-----|
| **Browse** | See all saved sessions |
| **Delete** | Remove unwanted session files |
| **Copy** | Duplicate sessions for backup |
| **Share** | Send session files to others |
| **Edit** | Modify JSON directly (advanced) |

---

## Real-World Use Cases

### 1. Debugging Session

```text
1. Reproduce bug in browser
2. Quick Save (Ctrl+Shift+S)
3. Share session file with developer
4. Developer loads session
5. Sees exactly what you saw
```

### 2. API Documentation

```text
1. Browse through API flows
2. All requests captured
3. Save named session: `api-docs`
4. Export requests to Python/cURL
5. Generate API documentation
```

### 3. Authentication Persistence

```text
1. Log into site
2. Save session: `logged-in`
3. Close browser
4. Later: Load session
5. Still logged in (cookies restored)
```

### 4. Competitive Research

```text
1. Browse competitor site
2. All network traffic captured
3. Save session: `competitor-analysis`
4. Review API endpoints later
5. Reverse engineer their API
```

### 5. Bug Reporting

```text
1. Reproduce issue
2. Quick Save
3. Attach session file to bug report
4. Developer loads = instant reproduction
```

---

## Managing Sessions

### Delete Single Session

1. **Session → Open Sessions Folder**
2. Delete the session file

### Delete All Sessions

```bash
rm -rf ~/.config/nothing-browser/sessions/*
```

### Export Session

Copy session file from sessions folder to any location.

### Import Session

Copy session file into sessions folder, then **Session → Load Session...**

---

## Session Size

| Content | Typical Size |
|---------|--------------|
| Empty session | ~1 KB |
| 100 requests | ~500 KB - 5 MB |
| 1000 requests | ~5 MB - 50 MB |
| With large bodies | Up to hundreds of MB |

**Tip:** Clear captured data before saving if session is too large.

---

## Privacy & Security

| Concern | How It's Addressed |
|---------|---------------------|
| **Sensitive data** | Sessions contain cookies and request bodies |
| **Storage location** | Local machine only (not cloud) |
| **Encryption** | Not encrypted by default (plain JSON) |
| **Sharing** | Be careful — cookies can authenticate as you |

### Security Recommendations

```text
⚠️ Session files contain authentication cookies.
⚠️ Anyone with the session file can impersonate you.
✅ Keep session files secure.
✅ Delete sessions when no longer needed.
✅ Don't share sessions with untrusted parties.
```

---

## Troubleshooting

### Session Not Loading

**Solutions:**
- Check session file exists in sessions folder
- Check file is valid JSON
- Try loading from **Session → Load Session...**

### Auto-Save Not Working

**Solutions:**
- Check write permissions to config directory
- Check disk space
- Close browser normally (not force kill)

### Session Corrupted

**Solution:** Delete the corrupted session file and save again.

### Can't Find Sessions Folder

**Solution:** Create it manually:

```bash
mkdir -p ~/.config/nothing-browser/sessions
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save Current Session (named) |
| `Ctrl+Shift+S` | Quick Save (timestamp) |
| `Ctrl+Shift+O` | Load Last Session |

---

## Menu Reference

| Menu Item | Shortcut | Action |
|-----------|----------|--------|
| Save Current Session... | `Ctrl+S` | Save with custom name |
| Quick Save | `Ctrl+Shift+S` | Save with timestamp |
| Load Last Session | `Ctrl+Shift+O` | Load most recent session |
| Load Session... | — | Browse and load any session |
| Open Sessions Folder | — | Open folder in file manager |

---

## Next Steps

- [DEVTOOLS Tab](./devtools) — Capture data for sessions
- [Auto-Update](./auto-update) — Update without losing sessions
- [Cookie Inspector](./cookie-inspector) — Understand cookie persistence

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
