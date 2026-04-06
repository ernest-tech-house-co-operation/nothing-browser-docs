# Features

Nothing Browser v0.1.3 ships with the following features built in. No configuration required — everything is on by default.

## Network Inspector

Every HTTP request and response is captured and displayed in the DEVTOOLS tab.

For each request you can see:
- Method, status code, content type, and response size
- Full request headers and response headers  
- Request body — the data sent with POST, PUT, and PATCH requests
- Response body — the full server response
- Firefox-style summary view with decoded query parameters and the full URL

[Read more →](/guide/network-inspector)

## WebSocket Capture

Every WebSocket frame is captured with direction tagging (SENT / RECV). Binary frames are displayed as hex dumps with ASCII preview. JSON frames are auto-pretty-printed. All frames are downloadable as files.

[Read more →](/guide/websocket-capture)

## Cookie Inspector

Every cookie is captured the moment it is set. The **Set-By Request** tab shows the exact HTTP request responsible for each cookie — including headers and full URL.

[Read more →](/guide/cookie-inspector)

## Storage Capture

Every write to `localStorage` and `sessionStorage` is captured in real time, showing the origin, key, and full value.

## One-Click Export

Any captured request can be exported to:

| Format | Library |
| --- | --- |
| Python | `requests` |
| Python | `curl_cffi` (Chrome TLS bypass) |
| Shell | `cURL` |
| JavaScript | `fetch` |
| Raw | HTTP/1.1 |

Exports automatically include the correct cookies from the Cookie Inspector and the request body.

[Read more →](/guide/export)

## Fingerprint Spoofing

Nothing Browser randomises a new browser identity on every session. Spoofed at engine level — before any page JavaScript runs.

Spoofed values:
- Chrome User-Agent string and `Sec-CH-UA` client hints
- Hardware concurrency (CPU cores)
- Device memory
- Screen resolution and pixel ratio
- WebGL vendor and renderer strings
- Canvas fingerprint (per-pixel xorshift noise)
- Audio fingerprint noise
- WebRTC leak prevention
- Performance timer precision reduction
- Battery API

Real machine values are used as the base. Only noise is added on top — the same approach as Brave Browser, but implemented at `DocumentCreation` phase using `QWebEngineScript`.

[Read more →](/guide/fingerprint-spoofing)

## Plugin System

Nothing Browser has a built-in plugin manager. Plugins are JavaScript files injected into every page at document start. Install from inside the browser — no terminal required.

[Read more →](/guide/plugins)

## Session Management

Every browsing session is auto-saved on close as a JSON file. Sessions capture all network traffic, WebSocket frames, cookies, and storage entries. Load any previous session to resume inspection.

[Read more →](/guide/sessions)

## Auto-Update

Checks GitHub Releases on launch and every 6 hours. Updates download and install in-app with one click. No terminal. No `sudo` (when using tar.gz release).

[Read more →](/guide/auto-update)
