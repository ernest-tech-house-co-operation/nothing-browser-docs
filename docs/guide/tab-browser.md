# BROWSER Tab

A full Chromium browser. All traffic is automatically captured to DEVTOOLS.

## Toolbar Controls

| Control | Function |
| --- | --- |
| URL bar | Type or paste any URL, press Enter or click GO |
| JS toggle | Enable / disable JavaScript (reloads page) |
| CSS toggle | Enable / disable stylesheets |
| IMG toggle | Enable / disable image loading |
| Status dot | Blue = loading, Green = loaded |

## New Tab Interception

Sites that open a new tab (common in streaming sites to trigger a player URL) are intercepted. The new URL is loaded in the current tab instead. This is intentional — it keeps the capture session intact and prevents the player URL from being missed.

## Fingerprint Injection

The fingerprint spoofing script is injected at `DocumentCreation` — before any page JS runs — via `QWebEngineScript`. Every page, including iframes, gets the spoofed values. See [Fingerprint Spoofing](/guide/fingerprint-spoofing).

## Known Blocks

Google properties, Facebook, and banking sites actively detect non-standard browsers. They will block or degrade functionality. This is expected behavior — these sites go beyond standard bot detection.
