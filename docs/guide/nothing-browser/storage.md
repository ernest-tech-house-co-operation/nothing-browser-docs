# Storage Capture

The STORAGE sub-tab captures every `localStorage.setItem()` and `sessionStorage.setItem()` call in real time.

---

## Overview

Modern web apps store data in localStorage and sessionStorage. Nothing Browser captures every write — so you can see exactly what data the app is saving.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STORAGE [4]                                                               │
├──────────────┬─────────────────────┬─────────────────────┬─────────────────┤
│ Type         │ Origin              │ Key                 │ Value           │
├──────────────┼─────────────────────┼─────────────────────┼─────────────────┤
│ 🟣 localStorage │ https://example.com │ user_preferences    │ {"theme":"dark"}│
│ 🟣 localStorage │ https://example.com │ session_token       │ abc123def456... │
│ 🔵 sessionStorage│ https://example.com │ cart_items          │ [{"id":1}]      │
│ 🟣 localStorage │ https://api.cdn.com │ api_cache           │ {...}           │
└──────────────┴─────────────────────┴─────────────────────┴─────────────────┘
```

---

## What Gets Captured

| Column | Description |
|--------|-------------|
| **Type** | localStorage (🟣 purple) or sessionStorage (🔵 blue) |
| **Origin** | Domain that set the item |
| **Key** | Storage key name |
| **Value** | Stored value (truncated in table) |

### Color Coding

| Storage Type | Color | Persistence |
|--------------|-------|-------------|
| **localStorage** | 🟣 Purple | Persists until manually cleared |
| **sessionStorage** | 🔵 Blue | Cleared when tab closes |

---

## Detail Panel

Click any item to see:

| Field | Description |
|-------|-------------|
| **Full Value** | Complete stored value (untruncated) |
| **Key** | Storage key |
| **Origin** | Full origin URL |
| **Timestamp** | When the write occurred |
| **Size** | Size of stored value in bytes |

### Example Detail Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Storage Item Details                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Key: user_preferences                                                      │
│  Origin: https://example.com                                                │
│  Timestamp: 2026-01-15 14:30:25.123                                        │
│  Size: 156 bytes                                                            │
│                                                                             │
│  Full Value:                                                                │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ {                                                                     │ │
│  │   "theme": "dark",                                                    │ │
│  │   "language": "en-US",                                                │ │
│  │   "notifications": true,                                              │ │
│  │   "fontSize": 16,                                                     │ │
│  │   "sidebarCollapsed": false                                           │ │
│  │ }                                                                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## localStorage vs sessionStorage

| Feature | localStorage | sessionStorage |
|---------|--------------|----------------|
| **Color** | 🟣 Purple | 🔵 Blue |
| **Persistence** | Forever (until cleared) | Until tab closes |
| **Scope** | Across all tabs/windows | Same tab only |
| **Use case** | User preferences, auth tokens | Cart, form data, temp state |
| **Clear on browser close** | No | Yes |

### Common Uses

| Type | Typical Data |
|------|--------------|
| **localStorage** | User settings, theme preferences, saved logins, API cache |
| **sessionStorage** | Shopping cart, form progress, page state, CSRF tokens |

---

## Real-Time Capture

Storage writes are captured **the moment they happen**:

```javascript
// When a website runs this:
localStorage.setItem('user_preferences', JSON.stringify({ theme: 'dark' }));

// It appears instantly in the STORAGE tab:
// 🟣 localStorage | https://example.com | user_preferences | {"theme":"dark"}
```

### What Triggers Capture

| Action | Captured? |
|--------|-----------|
| `localStorage.setItem()` | ✅ Yes |
| `sessionStorage.setItem()` | ✅ Yes |
| `localStorage.removeItem()` | ❌ No (deletion not shown) |
| `localStorage.clear()` | ❌ No (clearing not shown) |
| Reading values | ❌ No (only writes) |

---

## How Capture Works

The capture uses JavaScript injection to patch the storage methods:

```javascript
// Patched localStorage.setItem
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    // Capture the write
    window.__captureStorage('localStorage', window.location.origin, key, value);
    
    // Call original
    return originalSetItem.call(this, key, value);
};
```

This runs at **DocumentCreation** — before any page JavaScript — so no writes are missed.

---

## Real-World Use Cases

### 1. Understanding App State

```text
1. Use the web app
2. Watch STORAGE tab
3. See what data the app saves
4. Understand how it tracks users
```

### 2. Reverse Engineering Authentication

```text
1. Log into site
2. Check STORAGE tab
3. Look for auth tokens in localStorage
4. Find token key name (e.g., 'access_token')
5. Use in your scraper
```

### 3. Debugging Cart Issues

```text
1. Add items to cart
2. Check STORAGE tab
3. See cart data in sessionStorage
4. Verify items are stored correctly
5. Debug missing items
```

### 4. Preference Extraction

```text
1. Configure app settings
2. Check STORAGE tab
3. See preference keys and values
4. Replicate in automation
```

### 5. Cache Analysis

```text
1. Use API-heavy app
2. Check STORAGE tab
3. See API responses cached in localStorage
4. Understand caching strategy
```

---

## Filtering Storage Items

### Filter by Type

| Filter | Result |
|--------|--------|
| Click 🟣 | Show only localStorage |
| Click 🔵 | Show only sessionStorage |

### Filter by Origin

Use the filter bar to search by origin:

| Example | Matches |
|---------|---------|
| `example.com` | All items from example.com |
| `api.` | All items from API subdomains |
| `localhost` | Local development items |

### Filter by Key

Search for specific keys:

| Example | Matches |
|---------|---------|
| `token` | Keys containing "token" |
| `pref` | Keys containing "pref" |
| `cart` | Keys containing "cart" |

---

## Copying Storage Data

### Copy Single Item

Select item → **COPY** → Copies key and value

### Copy All as JSON

Click **COPY ALL JSON**:

```json
{
  "localStorage": {
    "user_preferences": "{\"theme\":\"dark\"}",
    "session_token": "abc123def456"
  },
  "sessionStorage": {
    "cart_items": "[{\"id\":1,\"qty\":2}]"
  }
}
```

### Export for Scraping

Use the JSON output in your scraper:

```python
# Python example
import json

with open('storage.json', 'r') as f:
    storage = json.load(f)
    
# Use localStorage values
token = storage['localStorage']['session_token']
```

---

## Clearing Storage

### Clear Single Item

Select item → Click **DELETE**

### Clear All Captured

Click **CLEAR ALL** button (clears only captured data, not actual storage)

### Clear Actual Storage (in Browser)

To actually clear website's storage:

1. Go to BROWSER tab
2. Open DevTools (F12) → Application → Storage
3. Clear manually

---

## Privacy Note

Storage data captured in DEVTOOLS is:

- ✅ Stored only in memory
- ✅ Cleared when you click CLEAR
- ✅ Not saved to disk (unless you export)
- ✅ Wiped when browser closes (sessionStorage naturally, localStorage persists)

---

## Troubleshooting

### No Storage Items Appearing

**Solutions:**
- Check website actually uses storage
- Interact with the site (storage writes happen on actions)
- Refresh the page
- Check DEVTOOLS is open

### Value Truncated

**Solution:** Click the item to see full value in detail panel

### Large Values Not Showing

**Solution:** Very large values (>1MB) may be truncated. Use DOWNLOAD to save raw.

### Storage Items Disappearing

**Solutions:**
- sessionStorage clears when tab closes
- Website may be removing items
- Check if you cleared capture

---

## Storage vs Cookies

| Aspect | Storage | Cookies |
|--------|---------|---------|
| **Size limit** | ~5-10MB | ~4KB |
| **Sent to server** | No | Yes (automatically) |
| **JavaScript access** | Yes | Yes (unless HttpOnly) |
| **Persistence** | Manual or session | Expiry-based |
| **Best for** | App state, preferences | Authentication, tracking |

**Use STORAGE tab for app data, COOKIES tab for auth tokens.**

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus filter bar |
| `Delete` | Delete selected item |
| `Ctrl+A` | Select all items |
| `Ctrl+C` | Copy selected item |

---

## Next Steps

- [Cookie Inspector](./cookie-inspector) — Track authentication cookies
- [Network Inspector](./network-inspector) — See how storage data is used
- [DEVTOOLS Tab](./devtools) — Complete capture overview

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
