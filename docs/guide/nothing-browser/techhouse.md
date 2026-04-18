# TECH HOUSE Tab

The update and changelog panel for Nothing Browser. Your central hub for staying up to date.

---

## Overview

The TECH HOUSE tab is where you:

- Check your current version
- See if updates are available
- Download and install new versions
- Read what changed (changelog)
- Navigate to other tabs

---

## What's on This Tab

| Section | Content |
|---------|---------|
| **Version Indicator** | Current version number |
| **Update Status** | Live check from GitHub Releases API |
| **Download/Install** | Controls for in-app updates |
| **Changelog** | Full changelog from latest release |
| **Stats Panel** | Browser information |
| **Quick Access** | Buttons to switch tabs |

---

## Update System

### How It Works

1. On launch, the browser checks GitHub Releases API
2. Compares your version with the latest release
3. Shows status in the TECH HOUSE tab
4. If update available, notification bell turns amber

### Update Status Messages

| Status | Message | Action |
|--------|---------|--------|
| Up to date | `You're on the latest version` | Nothing to do |
| Update available | `New version v0.1.4 is available` | Click DOWNLOAD |
| Check failed | `Failed to check for updates` | Check internet |
| Downloading | `Downloading... 45%` | Wait |
| Ready to install | `Update ready to install` | Click INSTALL |

---

## Update Bell

When a new version is available, the notification bell (🔔) in the **top-right of the tab bar** turns amber.

### Bell States

| State | Color | Meaning |
|-------|-------|---------|
| No updates | ⚪ Gray | You're up to date |
| Update available | 🟠 Amber | New version ready |
| Downloading | 🔵 Blue | Download in progress |
| Ready to install | 🟢 Green | Ready to install |

### Tab Label Update

The tab label also updates to show the new version:

```
🔔 TECH HOUSE [v0.1.4 ready]
```

---

## Download & Install Flow

### Step 1: Check for Updates

Automatic on launch. You can also click **CHECK NOW** to force a check.

### Step 2: Download

When an update is available:

1. Click **↓ DOWNLOAD UPDATE**
2. Watch the progress bar
3. Download continues in background

### Step 3: Install

After download completes:

1. Click **⚡ INSTALL & RESTART**
2. The app closes
3. Binary is swapped
4. Browser restarts automatically

**No terminal. No sudo (with tar.gz release).**

### Progress Bar

```
Downloading: [████████░░░░░░░░░░░░] 45% (2.3 MB / 5.1 MB)
Speed: 1.2 MB/s · Time remaining: 2 seconds
```

---

## Changelog

The changelog shows the full release notes from the latest GitHub release:

```markdown
## v0.1.4 (2026-01-15)

### Added
- exposeFunction RPC for browser → Node.js calls
- Request interception with custom responses

### Fixed
- Memory leak in network capture
- WebSocket binary frame display

### Changed
- Updated Qt WebEngine to 6.7
- Improved fingerprint spoofing
```

### Features

- ✅ Markdown formatting preserved
- ✅ Links to GitHub releases
- ✅ Shows all changes since your version

---

## Stats Panel

Displays information about your browser instance:

| Stat | Example | Description |
|------|---------|-------------|
| **Current version** | `v0.1.3` | Your installed version |
| **Engine** | `Chromium 124 / Qt6 6.7.0` | Browser engine versions |
| **Platform** | `Linux x86_64` | Operating system |
| **Binary type** | `Headless` or `Headful` | How the browser is running |
| **Uptime** | `2h 34m` | How long since launch |

---

## Quick Access Buttons

| Button | Action |
|--------|--------|
| **OPEN DEVTOOLS** | Switches to DEVTOOLS tab (network capture) |
| **OPEN BROWSER** | Switches to BROWSER tab (browsing) |
| **OPEN PLUGINS** | Switches to PLUGINS tab (plugin manager) |

---

## Auto-Update Details

### Check Frequency

| Event | When |
|-------|------|
| On launch | Immediately (with 3s delay) |
| Periodic | Every 6 hours |
| Manual | Click **CHECK NOW** |

### What Gets Updated

| Component | Updated? |
|-----------|----------|
| Browser binary | ✅ Yes |
| YouTube bridge (JAR) | ✅ Yes |
| Plugins | ❌ No (manual update) |
| User data | ❌ No (preserved) |

### Update Source

Updates are fetched from:

```
https://github.com/BunElysiaReact/nothing-browser/releases/latest
```

---

## Linux: .deb vs tar.gz

| Installation Method | Auto-Update Requires |
|---------------------|---------------------|
| **tar.gz** (portable) | No password — seamless |
| **.deb** (system install) | `pkexec` or `sudo` prompt |

**Recommendation:** Use `tar.gz` for seamless in-app updates.

---

## Manual Update

If auto-update fails or you prefer manual:

### Linux (.deb)

```bash
sudo apt update
sudo apt upgrade nothing-browser
```

### Linux (tar.gz)

```bash
# Download new version
wget https://github.com/BunElysiaReact/nothing-browser/releases/download/v0.1.4/nothing-browser-0.1.4-linux-x86_64.tar.gz

# Extract
tar -xzf nothing-browser-*.tar.gz

# Replace old binary
mv nothing-browser-*/nothing-browser ./nothing-browser
```

### Windows / macOS

Download new `.zip` or `.dmg` from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases)

---

## Troubleshooting

### Update Check Failed

**Error:** `Failed to check for updates`

**Solutions:**
- Check internet connection
- GitHub may be blocked in your region
- Try manual update

### Download Stuck

**Error:** Download not progressing

**Solutions:**
- Cancel and retry
- Check disk space
- Check firewall settings

### Install Fails

**Error:** `Failed to replace binary`

**Solutions:**
- Check write permissions
- Run browser from writable location
- For .deb: ensure `pkexec` is installed

### Version Shows Wrong

**Solution:** Click **REFRESH** or restart the browser

---

## Privacy Note

The update checker:

- ✅ Only checks GitHub API (no tracking)
- ✅ No personal data sent
- ✅ No analytics
- ✅ Can be disabled (planned)

---

## Next Steps

- [Auto-Update](./auto-update) — Detailed update documentation
- [DEVTOOLS Tab](./devtools) — Network capture and inspection
- [Session Management](./sessions) — Save and restore sessions

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
