# 🔄 Version Compatibility

New features are added to the **binary first**, then the TypeScript library.

> ⚠️ **Minimum versions:** Binary v0.1.14+ | Library v0.0.21+

---

## Quick Reference

| Feature | Min Binary | Min Library |
|---------|------------|-------------|
| HTTP Mode + Remote Deployment | v0.1.14 | v0.0.21 |
| Proxy Support (all commands) | v0.1.14 | v0.0.21 |
| Session Persistence (ws.json, pings.json) | v0.1.14 | v0.0.21 |
| Identity/Profile System | v0.1.14 | v0.0.21 |
| Cookies Hot Reload | v0.1.14 | v0.0.21 |
| All features before these | v0.1.0 | v0.0.1 |

---

## How to Check Your Versions

### Binary Version

```bash
./nothing-browser-headless --version
```

### Library Version

```bash
bun list | grep nothing-browser
```

---

## Update Instructions

### Update Binary

```bash
# Download latest from GitHub Releases
# Replace your old binary
```

### Update Library

```bash
bun update nothing-browser
```

---

## ⚠️ Important: You Don't Have to Update

**If your current code works, keep what you have.**

| Your Situation | Action |
|----------------|--------|
| Code works, no new features needed | **Do nothing** |
| Want new features | Update both binary and library |
| Production system, stability critical | Lock versions |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `command not recognized` | Binary too old | Update to v0.1.14+ |
| `ENOENT /tmp/piggy` | Socket not created | Run binary manually once |
| `curl: (52) Empty reply` | Timeout or human mode | Add `--max-time` or disable `actHuman()` |

---

## Feature Matrix

| Feature | Binary v0.1.0 | Binary v0.1.14+ |
|---------|---------------|-----------------|
| Socket mode | ✅ | ✅ |
| HTTP mode | ❌ | ✅ |
| Proxy load/fetch | ❌ | ✅ |
| Proxy test/rotate | ❌ | ✅ |
| ws.json persistence | ❌ | ✅ |
| identity.json | ❌ | ✅ |
| Cookies hot reload | ❌ | ✅ |

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
