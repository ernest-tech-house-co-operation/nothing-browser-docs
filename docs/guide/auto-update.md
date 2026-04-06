# Auto-Update

Nothing Browser checks for updates automatically and installs them in-app.

## How It Works

The update checker polls the GitHub Releases API:

```
https://api.github.com/repos/BunElysiaReact/nothing-browser/releases/latest
```

It checks on launch (after a 3-second delay) and every 6 hours.

## Update Notification

When a newer version is found, the **TECH HOUSE** tab label changes to:

```
🔔 TECH HOUSE [v0.1.4 ready]
```

The notification bell turns amber.

## Downloading and Installing

1. Go to **TECH HOUSE** tab
2. Click **↓ DOWNLOAD UPDATE**
3. Watch the progress bar
4. Click **⚡ INSTALL & RESTART**
5. The app closes, swaps the binary, and restarts automatically

No terminal. No `sudo` (when using the `tar.gz` release).

::: warning .deb users
If you installed via `.deb` to `/usr/bin`, the binary is not writable by your user. The updater will use `pkexec` or `sudo` and prompt for your password. To avoid this, use the `tar.gz` release instead.
:::

## Shipping a New Release

```bash
git add .
git commit -m "feat: what changed"
git push
git tag v0.1.4
git push origin v0.1.4
```

GitHub Actions builds Linux, Windows, and macOS automatically and publishes the release with all assets. Users get notified within 6 hours.
