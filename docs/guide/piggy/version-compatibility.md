# 🔄 Version Compatibility

New features are added to the **binary first**, then the TypeScript library. If a feature doesn't work, update your binary — the library may be ahead.

---

## Quick Reference

| Feature | Minimum Binary | Minimum Library |
|---------|----------------|-----------------|
| HTTP Mode + Remote Deployment | **v0.1.12** | **v0.0.18** |
| Proxy Support (all commands) | **v0.1.12** | **v0.0.18** |
| Session Persistence (ws.json, pings.json) | **v0.1.12** | **v0.0.18** |
| Identity/Profile System | **v0.1.12** | **v0.0.18** |
| Cookies Hot Reload | **v0.1.12** | **v0.0.18** |
| All features before these | v0.1.0 | v0.0.1 |

---

## ⚠️ Important: You Don't Have to Update

**If your current code works and you don't need new features, just don't update.**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ✅ Your code works? Keep what you have.                       │
│                                                                 │
│   You can:                                                      │
│   • Keep old binary (v0.1.0)                                    │
│   • Keep old library (v0.0.1)                                   │
│   • Update library but never use new API methods                │
│   • Mix old binary + new library (old features still work)      │
│                                                                 │
│   You only NEED to update if you want NEW features.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Safe Combinations

| Binary | Library | New Features Work? | Old Features Work? |
|--------|---------|-------------------|-------------------|
| v0.1.0 | v0.0.1 | ❌ | ✅ |
| v0.1.0 | v0.0.18 | ❌ (new APIs missing in binary) | ✅ |
| v0.1.12 | v0.0.1 | ❌ (library too old) | ✅ |
| v0.1.12 | v0.0.18 | ✅ | ✅ |

**Rule:** Old features never break. The library and binary are backward compatible.

### What Happens If You Update Library But Not Binary

```typescript
// You update library to v0.0.18 but binary is still v0.1.0
import piggy from "nothing-browser";

// Old features — still work perfectly ✅
await piggy.launch();
await piggy.register("site", "https://example.com");
await piggy.site.navigate();
await piggy.site.click("#button");

// New features — won't work (binary doesn't understand the commands) ❌
await piggy.proxy.load("./proxies.txt");  // Error: command not recognized
await piggy.sessionWsSave(true);           // Error: command not recognized
await piggy.connect({ host, key });        // Error: HTTP mode not supported
```

**The error won't crash your existing code.** It only appears if you call new methods.

### Recommendation

| Your Situation | What to Do |
|----------------|-------------|
| Code works, no new features needed | **Do nothing.** Keep your current versions. |
| Code works, want new features eventually | Update both binary and library together |
| Production system, stability critical | Lock versions. Don't update. |
| Testing new features | Use separate directory with new binary |

### Locking Versions (For Stability)

```bash
# package.json — pin exact versions
{
  "dependencies": {
    "nothing-browser": "0.0.1"  # not ^0.0.1
  }
}

# Keep binary v0.1.0 in your project
# Don't download new binary
```

---

## How to Check Your Versions

### Binary Version

```bash
./nothing-browser-headless --version
```

Or check the file name you downloaded:
- `nothing-browser-headless-v0.1.12-linux-x86_64.tar.gz`

### Library Version

```bash
# Bun
bun list | grep nothing-browser

# npm
npm list nothing-browser

# Direct from package.json
cat package.json | grep nothing-browser
```

### Check in Code

```typescript
import piggy from "nothing-browser";
console.log(piggy.version); // "0.0.18"
```

---

## Update Instructions (Only If You Need New Features)

### Update Binary

**Option 1: Download from GitHub Releases**

```bash
# Go to releases page
# https://github.com/BunElysiaReact/nothing-browser/releases

# Download latest for your platform
wget https://github.com/BunElysiaReact/nothing-browser/releases/download/v0.1.12/nothing-browser-headless-linux-x86_64.tar.gz

# Extract
tar -xzf nothing-browser-headless-linux-x86_64.tar.gz

# Make executable
chmod +x nothing-browser-headless
```

**Option 2: Using curl (Linux)**

```bash
LATEST="v0.1.12"
curl -L "https://github.com/BunElysiaReact/nothing-browser/releases/download/${LATEST}/nothing-browser-headless-linux-x86_64.tar.gz" | tar -xz
chmod +x nothing-browser-headless
```

### Update Library

```bash
# Bun
bun update nothing-browser

# npm
npm update nothing-browser

# yarn
yarn upgrade nothing-browser
```

---

## Feature Availability Rule

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   NEW FEATURES ARE ADDED TO THE BINARY FIRST                    │
│                                                                 │
│   Binary v0.1.12 ──┬── Library v0.0.18 ✅ (features work)      │
│                    │                                            │
│                    └── Library v0.0.17 ❌ (features fail)       │
│                                                                 │
│   The library waits for the binary to implement the socket      │
│   command before exposing the feature.                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If a feature doesn't work:**
1. Check your binary version first
2. Update binary to latest
3. Then update library if needed

**If you don't care about the feature:** Don't update. Keep working.

---

## Common Errors & Solutions

### "command not recognized"

**Error:**
```
error: command "proxy.load" not recognized
```

**Cause:** Binary version is too old (pre-v0.1.12)

**Fix (if you need the feature):**
```bash
# Update binary to v0.1.12+
./nothing-browser-headless --version  # Check current
# Download latest, replace binary
```

**Fix (if you don't need the feature):**
```bash
# Just don't use that command. Your old code still works.
# Ignore the error if you accidentally called it.
```

### "Cannot find module 'nothing-browser'"

**Error:**
```
Error: Cannot find module 'nothing-browser'
```

**Cause:** Library not installed

**Fix:**
```bash
bun add nothing-browser
```

### Connection works but proxy commands fail

**Cause:** Binary is old, library is new

**Fix (if you need proxy):** Update binary only — library is fine
**Fix (if you don't need proxy):** Do nothing. Your old code works.

---

## Version History

### v0.1.12 (Binary) / v0.0.18 (Library) — Current

**New Features:**
- HTTP mode + remote deployment
- Full proxy system (load, fetch, set, test, rotate, save)
- Session persistence (ws.json, pings.json opt-in)
- Identity/profile system (identity.json, profile.json)
- Cookies hot reload
- OpenVPN support

### v0.1.0 (Binary) / v0.0.1 (Library) — Initial Release

**Features:**
- Socket mode only
- Basic navigation, click, type, evaluate
- exposeFunction (RPC)
- Request interception
- Network capture
- Session export/import

---

## Keeping Everything in Sync (Only If You Want New Features)

### Development Workflow

```bash
# 1. Binary team adds new socket command
# 2. Binary released as v0.1.13

# 3. Library team implements client method
# 4. Library released as v0.0.19

# 5. Users who want new features update both
bun update nothing-browser
# Download latest binary from releases
```

### Recommended Setup for Production (Stability First)

```bash
# Lock your versions
# Don't update unless you need to

./nothing-browser-headless --version  # v0.1.0 (stays here)
bun list | grep nothing-browser       # v0.0.1 (stays here)

# Your code will work forever with these versions
```

### Recommended Setup for Development (Want New Features)

```bash
# Keep both at latest
./nothing-browser-headless --version  # v0.1.12
bun list | grep nothing-browser       # v0.0.18

# Get new features as they come
```

### CI/CD Pipeline Check (Optional)

```typescript
// Add version check to your scripts (only if you need new features)
import piggy from "nothing-browser";

const requiredBinaryVersion = "0.1.12";
const requiredLibVersion = "0.0.18";

// Check library version
if (piggy.version < requiredLibVersion) {
  console.warn(`⚠️ Library outdated: ${piggy.version} < ${requiredLibVersion}`);
}

// You can also check binary version via command
// (implement in your deployment script)
```

---

## Feature Matrix

| Feature | Binary v0.1.0 | Binary v0.1.12+ |
|---------|---------------|-----------------|
| Socket mode | ✅ | ✅ |
| HTTP mode | ❌ | ✅ |
| Proxy load/fetch | ❌ | ✅ |
| Proxy test/rotate | ❌ | ✅ |
| Proxy OVPN | ❌ | ✅ |
| ws.json persistence | ❌ | ✅ |
| pings.json persistence | ❌ | ✅ |
| identity.json | ❌ | ✅ |
| profile.json | ❌ | ✅ |
| Cookies hot reload | ❌ | ✅ |
| sessionReload() | ❌ | ✅ |

---

## The Golden Rule

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👑 IF YOUR CODE WORKS, DON'T UPDATE.                         │
│                                                                 │
│   New features are OPTIONAL.                                    │
│   Old features stay supported.                                  │
│   No forced updates. Ever.                                      │
│                                                                 │
│   Update library → old APIs still work.                         │
│   Keep old binary → old features still work.                    │
│   Never use new APIs → never need new binary.                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Getting Help

**Version-related issues:**

1. Check your versions first
2. Decide if you actually need the new feature
3. If you don't need it, keep your current versions
4. If you need it, update both binary and library
5. If problem persists, open GitHub issue with:
   - Binary version: `./nothing-browser-headless --version`
   - Library version: `bun list | grep nothing-browser`
   - OS: `uname -a`
   - Error message
   - Whether you actually need the new feature

**Links:**
- [Binary Releases](https://github.com/BunElysiaReact/nothing-browser/releases)
- [Library npm](https://www.npmjs.com/package/nothing-browser)
- [GitHub Issues](https://github.com/BunElysiaReact/nothing-browser/issues)

---

## Next Steps

- [Remote Deployment](./remote-deployment) — Run Piggy on a VPS (requires v0.1.12+)
- [Proxy Support](./proxy-support) — Route traffic through proxies (requires v0.1.12+)
- [Session Persistence](./session-persistence) — Save WebSocket frames and pings (requires v0.1.12+)

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*