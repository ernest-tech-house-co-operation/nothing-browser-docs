# Plugin System

Nothing Browser has a built-in plugin manager. Plugins are JavaScript files injected into every page at `DocumentCreation` — the earliest possible injection point, before any page code runs.

## Installing Plugins

### From the Community Registry

1. Go to the **PLUGINS** tab
2. Click the **COMMUNITY** sub-tab
3. Click **↺ REFRESH** to load the plugin list from GitHub
4. Select a plugin and click **↓ INSTALL**

The registry is hosted at:
`github.com/ernest-tech-house-co-operation/nothing-browser-plugins`

### From a Local Folder

1. Go to **PLUGINS** tab → **INSTALLED** sub-tab
2. Click **+ FROM FOLDER**
3. Select the folder containing your plugin's `manifest.json` and `content.js`

## Plugin Structure

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
  "description": "What it does",
  "author": "Your Name",
  "how_to_use": "Navigate to X and the plugin runs automatically.",
  "requires_restart": false,
  "enabled": true,
  "permissions": ["network", "storage"]
}
```

### content.js

Plain JavaScript. Runs in the page's main world context on every page load.

```js
(function() {
  'use strict';
  if (window.__MY_PLUGIN_INIT__) return;
  window.__MY_PLUGIN_INIT__ = true;
  
  // Your code here — runs before any page JS
  console.log('[MyPlugin] loaded');
})();
```

## Enabling / Disabling

Select any installed plugin and click **DISABLE** or **ENABLE**. If the plugin has `requires_restart: true`, you need to restart the browser for the change to take effect.

## Uninstalling

Select a plugin and click **UNINSTALL**. The plugin folder is deleted from `~/.config/nothing-browser/plugins/`.
