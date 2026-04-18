# Auto-Update

Nothing Browser checks for updates automatically and installs them in-app — no terminal required.

---

## Overview

| Feature | Description |
|---------|-------------|
| **Check frequency** | On launch + every 6 hours |
| **Update source** | GitHub Releases API |
| **Download method** | In-app streaming |
| **Install method** | Automatic binary swap |
| **User interaction** | Two clicks (DOWNLOAD → INSTALL) |

---

## How It Works

The update checker polls the GitHub Releases API:

```
https://api.github.com/repos/BunElysiaReact/nothing-browser/releases/latest
```

### Check Timing

| Event | When |
|-------|------|
| **First check** | 3 seconds after launch |
| **Periodic checks** | Every 6 hours |
| **Manual check** | Click CHECK NOW in TECH HOUSE tab |

### What It Checks

| Field | Compared |
|-------|----------|
| `tag_name` | Against current version |
| `assets` | Downloads for your platform |
| `body` | Changelog content |

---

## Update Notification

When a newer version is found:

### Tab Label Change

The **TECH HOUSE** tab label updates to show the new version:

```
🔔 TECH HOUSE [v0.1.4 ready]
```

### Bell Icon

The notification bell in the top-right of the tab bar turns **amber**:

| State | Bell | Tab Label |
|-------|------|-----------|
| Up to date | ⚪ Gray | `TECH HOUSE` |
| Update available | 🟠 Amber | `🔔 TECH HOUSE [v0.1.4 ready]` |
| Downloading | 🔵 Blue | `🔔 TECH HOUSE [downloading...]` |
| Ready to install | 🟢 Green | `🔔 TECH HOUSE [install ready]` |

---

## Downloading and Installing

### Step-by-Step

```
Step 1: Go to TECH HOUSE tab
              │
              ▼
Step 2: Click ↓ DOWNLOAD UPDATE
              │
              ▼
Step 3: Watch progress bar
              │
              ▼
Step 4: Click ⚡ INSTALL & RESTART
              │
              ▼
Step 5: App closes, swaps binary, restarts
```

### Progress Bar

During download, you'll see:

```
Downloading: [████████░░░░░░░░░░░░] 45% (2.3 MB / 5.1 MB)
Speed: 1.2 MB/s · Time remaining: 2 seconds
```

### After Download

The **INSTALL & RESTART** button becomes active. Click it to:

1. Save current session (auto-save)
2. Close the application
3. Replace the binary
4. Restart the browser

**No terminal. No sudo (with tar.gz release).**

---

## Platform Differences

### Linux (tar.gz) — Recommended

| Aspect | Details |
|--------|---------|
| Binary location | Anywhere (user-writable) |
| Update requires | No password |
| Update method | Direct binary swap |
| Experience | Seamless |

### Linux (.deb)

| Aspect | Details |
|--------|---------|
| Binary location | `/usr/bin` (system) |
| Update requires | `pkexec` or `sudo` |
| Update method | Password prompt |
| Experience | One password entry |

```bash
# .deb users will see:
┌─────────────────────────────────────────┐
│  Authentication Required                │
│                                         │
│  [sudo] password for user:             │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]  [OK]                        │
└─────────────────────────────────────────┘
```

### Windows

| Aspect | Details |
|--------|---------|
| Binary location | Anywhere (user-writable) |
| Update requires | No admin (if writable) |
| Update method | Direct binary swap |

### macOS

| Aspect | Details |
|--------|---------|
| Binary location | `/Applications` (may need password) |
| Update requires | Password for system install |
| Update method | App bundle replacement |

---

## Update Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTO-UPDATE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Launch  │───►│  Check   │───►│ Available│───►│ Notify   │              │
│  │ Browser  │    │ GitHub   │    │   ?      │    │  User    │              │
│  └──────────┘    └──────────┘    └────┬─────┘    └────┬─────┘              │
│                                       │               │                    │
│                          No ──────────┘               │ Yes                │
│                          │                            │                    │
│                          ▼                            ▼                    │
│                    ┌──────────┐              ┌──────────────┐              │
│                    │  Wait 6  │              │   User       │              │
│                    │  Hours   │              │   Downloads  │              │
│                    └──────────┘              └──────┬───────┘              │
│                                                      │                      │
│                                                      ▼                      │
│                                               ┌──────────────┐             │
│                                               │   User       │             │
│                                               │   Installs   │             │
│                                               └──────┬───────┘             │
│                                                      │                      │
│                                                      ▼                      │
│                                               ┌──────────────┐             │
│                                               │   Browser    │             │
│                                               │   Restarts   │             │
│                                               │   Updated!   │             │
│                                               └──────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

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
chmod +x nothing-browser
```

### Windows

1. Download new `.zip` from Releases
2. Extract
3. Replace old `.exe`

### macOS

1. Download new `.dmg` from Releases
2. Drag to Applications
3. Replace old version

---

## Disabling Auto-Update

Auto-update is **always enabled** in the UI version. To disable:

### Option 1: Use offline version

Download the binary and disconnect from network.

### Option 2: Block GitHub API

```bash
# /etc/hosts
127.0.0.1 api.github.com
```

### Option 3: Use tar.gz and don't update

The tar.gz version doesn't force updates.

---

## Shipping a New Release (For Maintainers)

### Step 1: Commit Changes

```bash
git add .
git commit -m "feat: what changed"
```

### Step 2: Create Tag

```bash
git tag v0.1.4
git push origin v0.1.4
```

### Step 3: GitHub Actions Builds

| Platform | Build Time | Output |
|----------|------------|--------|
| Linux | ~10 min | `.deb`, `.tar.gz` |
| Windows | ~15 min | `.zip`, `.exe` |
| macOS | ~20 min | `.dmg`, `.tar.gz` |

### Step 4: Release Published

GitHub Actions automatically:

1. Builds all platforms
2. Creates a GitHub Release
3. Attaches all assets
4. Updates the "latest" tag

### Step 5: Users Get Notified

Within 6 hours (or on next launch), users see the update notification.

---

## Troubleshooting

### Update Check Fails

**Error:** `Failed to check for updates`

**Solutions:**
- Check internet connection
- GitHub may be blocked in your region
- Firewall may block API access

### Download Fails

**Error:** Download stuck or fails

**Solutions:**
- Check disk space
- Check write permissions
- Retry download
- Use manual update

### Install Fails (.deb)

**Error:** `Failed to replace binary`

**Solution:** Ensure `pkexec` is installed:

```bash
sudo apt install policykit-1
```

### Install Fails (tar.gz)

**Error:** `Permission denied`

**Solution:** Binary location must be writable:

```bash
chmod +w ./nothing-browser
# Or move to writable location
```

### Version Shows Wrong After Update

**Solution:** 
1. Close browser completely
2. Restart
3. Check TECH HOUSE tab again

---

## Update Security

| Concern | How It's Addressed |
|---------|---------------------|
| MITM attacks | GitHub API over HTTPS |
| Corrupted downloads | Checksum verification |
| Fake releases | GitHub signature verification |
| Malicious binaries | Only from official GitHub |

---


## Next Steps

- [TECH HOUSE Tab](./techhouse) — Update management UI
- [Installation](./installation) — First-time setup
- [Session Management](./sessions) — Save your work before updating
---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
