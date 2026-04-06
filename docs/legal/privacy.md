# Privacy Policy

**Last updated: 2025 · Ernest Tech House**

> Nothing Browser sends nothing outside your browser. This is not a marketing claim. It is an architectural fact.

## The Short Version

Nothing Browser does not collect, transmit, store, or process any of your personal data. There are no servers. There is no cloud. There is no analytics pipeline. There is no one watching.

## What We Collect

**Nothing.**

There is no telemetry. There is no crash reporter phoning home. There are no usage statistics. There are no "anonymous analytics." There is no account system. There is no login. There is no email required to use this software.

## What Stays on Your Machine

Everything Nothing Browser captures — network requests, cookies, WebSocket frames, session files, your browser identity — lives exclusively in these local paths:

```
~/.config/nothing-browser/identity.json   ← your fingerprint identity
~/.config/nothing-browser/sessions/       ← saved sessions
~/.config/nothing-browser/plugins/        ← installed plugins
/tmp/nothing-browser-update/              ← update downloads (temporary)
```

None of these are read by us. None of these are transmitted anywhere. You can delete them at any time.

## The Update Checker

The only outbound request Nothing Browser makes on its own is to the GitHub Releases API:

```
https://api.github.com/repos/BunElysiaReact/nothing-browser/releases/latest
```

This request:
- Is made on launch and every 6 hours
- Contains only a standard HTTP request with a `User-Agent` header (`NothingBrowser/0.1.x`)
- Returns only the latest release version number and download URL
- Can be seen in the DEVTOOLS tab like any other request — we hide nothing

GitHub may log this request per their own privacy policy. We do not receive or store it.

## Plugin System

Plugins you install from the community registry are fetched from:

```
https://raw.githubusercontent.com/ernest-tech-house-co-operation/nothing-browser-plugins/
```

We do not track which plugins you install. GitHub may log the raw file request.

Plugins run as JavaScript in your browser pages. You are responsible for reviewing any plugin's `content.js` before installing it. We do not audit community plugins.

## Third-Party Sites

Nothing Browser is a browser. When you navigate to a website, that website can see your IP address, your browser fingerprint (reduced by our spoofing), and whatever data you send it. That is between you and the website.

We are not responsible for the privacy practices of websites you visit with Nothing Browser.

## Children

Nothing Browser is a developer tool. It is not directed at children.

## Changes

If this policy changes, the updated version will be in the repository and reflected here. Given that the policy is "we collect nothing," there is not much to change.

## Contact

[ernesttechhouse@gmail.com](mailto:ernesttechhouse@gmail.com)

[Discord](https://discord.gg/TUxBVQ7y) · [WhatsApp](https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U)
