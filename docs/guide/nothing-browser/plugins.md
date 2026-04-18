# PLUGINS Tab

The plugin manager for Nothing Browser. Plugins are JavaScript files injected into every page at `DocumentCreation` — the earliest possible injection point, before any page code runs.

---

## Overview

| Sub-Tab | Purpose |
|---------|---------|
| **INSTALLED** | Manage your installed plugins |
| **COMMUNITY** | Browse and install from the registry |

---

## INSTALLED Sub-Tab

Shows all installed plugins with:

- **Name, author, version**
- **Enable / Disable toggle**
- **Uninstall button**
- **Description and how-to-use text**

### Install from Local Folder

Click **+ FROM FOLDER** to install a plugin from a local directory containing:

```
my-plugin/
├── manifest.json
└── content.js
```

### Managing Plugins

| Action | How To |
|--------|--------|
| Enable/Disable | Click the toggle button |
| Uninstall | Click **UNINSTALL** |
| View details | Select the plugin from the list |

**Note:** If a plugin has `requires_restart: true` in its manifest, you need to restart the browser for the change to take effect.

---

## COMMUNITY Sub-Tab

Loads the community plugin registry from:

```
github.com/ernest-tech-house-co-operation/nothing-browser-plugins
```

### Browse and Install

1. Click **↺ REFRESH** to fetch the latest plugin list
2. Browse available plugins
3. Select any plugin to see its details
4. Click **↓ INSTALL** to install it directly

Already-installed plugins are shown with an `[INSTALLED]` label.

---

## Plugin Structure

### Directory Layout

```
my-plugin/
├── manifest.json
└── content.js
```

### manifest.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "What does this plugin do?",
  "author": "Your Name",
  "how_to_use": "Navigate to any page and the plugin runs automatically.",
  "requires_restart": false,
  "enabled": true,
  "permissions": ["network", "storage"]
}
```

#### Manifest Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Unique identifier (no spaces) |
| `name` | ✅ Yes | Display name |
| `version` | ✅ Yes | Semantic version |
| `description` | ✅ Yes | Short description |
| `author` | ❌ No | Your name/handle |
| `how_to_use` | ❌ No | Instructions for users |
| `requires_restart` | ❌ No | `true` if browser restart needed |
| `enabled` | ❌ No | Default enabled state |
| `permissions` | ❌ No | Requested permissions |

### content.js

Plain JavaScript. Runs in the page's main world context on every page load.

```js
(function() {
  'use strict';
  
  // Prevent double initialization
  if (window.__MY_PLUGIN_INIT__) return;
  window.__MY_PLUGIN_INIT__ = true;
  
  // Your code here — runs before any page JS
  console.log('[MyPlugin] loaded');
  
  // Example: Modify page behavior
  document.addEventListener('DOMContentLoaded', () => {
    // Page is ready
  });
})();
```

---

## Writing a Plugin

### Step 1: Create Folder

```bash
mkdir my-awesome-plugin
cd my-awesome-plugin
```

### Step 2: Create manifest.json

```json
{
  "id": "awesome-plugin",
  "name": "Awesome Plugin",
  "version": "1.0.0",
  "description": "Makes browsing awesome",
  "author": "Your Name",
  "how_to_use": "Installed and ready to go",
  "requires_restart": false,
  "enabled": true
}
```

### Step 3: Create content.js

```js
(function() {
  'use strict';
  
  if (window.__AWESOME_PLUGIN_INIT__) return;
  window.__AWESOME_PLUGIN_INIT__ = true;
  
  // Remove annoying popups
  const style = document.createElement('style');
  style.textContent = `
    .popup, .modal, .newsletter-signup {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('[AwesomePlugin] Active on', window.location.hostname);
})();
```

### Step 4: Install

- **From folder:** PLUGINS → INSTALLED → + FROM FOLDER → select `my-awesome-plugin`
- **To publish:** Submit PR to [community registry](https://github.com/ernest-tech-house-co-operation/nothing-browser-plugins)

---

## Example Plugins

### Dark Mode Enforcer

```js
// content.js
(function() {
  if (window.__DARK_MODE_INIT__) return;
  window.__DARK_MODE_INIT__ = true;
  
  const style = document.createElement('style');
  style.textContent = `
    html {
      filter: invert(1) hue-rotate(180deg);
    }
    img, video {
      filter: invert(1) hue-rotate(180deg);
    }
  `;
  document.head.appendChild(style);
})();
```

### Auto Clicker

```js
// content.js
(function() {
  if (window.__AUTO_CLICK_INIT__) return;
  window.__AUTO_CLICK_INIT__ = true;
  
  // Click all "Load More" buttons
  setInterval(() => {
    document.querySelectorAll('.load-more, #load-more, [data-action="load"]').forEach(btn => {
      btn.click();
    });
  }, 3000);
})();
```

### Ad Remover

```js
// content.js
(function() {
  if (window.__AD_REMOVER_INIT__) return;
  window.__AD_REMOVER_INIT__ = true;
  
  // Remove common ad elements
  const selectors = [
    '.ad',
    '.advertisement',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '.sponsored'
  ];
  
  const observer = new MutationObserver(() => {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();
```

---

## Permissions

| Permission | What It Allows |
|------------|----------------|
| `network` | Intercept network requests |
| `storage` | Access localStorage/sessionStorage |
| `tabs` | Create/modify tabs |
| `notifications` | Show browser notifications |

*Request only the permissions you need.*

---

## Publishing to Community Registry

1. Fork [nothing-browser-plugins](https://github.com/ernest-tech-house-co-operation/nothing-browser-plugins)
2. Add your plugin folder to `plugins/`
3. Update `registry.json` with your plugin info
4. Submit a Pull Request

### registry.json entry

```json
{
  "id": "awesome-plugin",
  "name": "Awesome Plugin",
  "version": "1.0.0",
  "description": "Makes browsing awesome",
  "author": "Your Name",
  "download_url": "https://github.com/your-username/awesome-plugin/archive/main.zip"
}
```

---

## Troubleshooting

### Plugin Not Loading

1. Check the plugin is **ENABLED** in INSTALLED tab
2. Check `requires_restart` — restart the browser if needed
3. Open DevTools (F12) and look for console errors

### Plugin Crashes

1. Disable the plugin
2. Check `content.js` for syntax errors
3. Test in isolation

### Uninstalling

Select the plugin and click **UNINSTALL**. The plugin folder is deleted from `~/.config/nothing-browser/plugins/`.

---

## Security Notes

- ✅ Plugins run in isolation (can't access your system)
- ✅ Permissions system limits what plugins can do
- ⚠️ Only install plugins from trusted sources
- ⚠️ Review `content.js` before installing

---

## Next Steps

- [DEVTOOLS Tab](./devtools) — Network capture and inspection
- [BROWSER Tab](./browser) — Core browsing features
- [Session Management](./sessions) — Save and restore sessions

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
