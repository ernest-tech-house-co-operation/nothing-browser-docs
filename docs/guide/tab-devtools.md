# DEVTOOLS Tab

The main scrapper panel. Always running — capture starts the moment you navigate anywhere in the BROWSER tab.

## Sub-Tabs

| Tab | What It Shows |
| --- | --- |
| NETWORK | All HTTP requests and responses |
| WS | All WebSocket frames |
| COOKIES | All cookies with set-by request info |
| STORAGE | All localStorage and sessionStorage writes |
| EXPORT | Code generator for Python, cURL, JS, raw HTTP |

## NETWORK

See [Network Inspector](/guide/network-inspector) for full details.

The tab label shows live count: `NETWORK [247]`

## WS

See [WebSocket Capture](/guide/websocket-capture) for full details.

## COOKIES

See [Cookie Inspector](/guide/cookie-inspector) for full details.

## STORAGE

Shows every `localStorage.setItem()` and `sessionStorage.setItem()` call with:
- Storage type (color-coded: purple = localStorage, blue = sessionStorage)
- Origin domain
- Key name
- Value (truncated in table, full value in detail panel)

## EXPORT

Select any request from the NETWORK tab first, then:

1. Choose format from dropdown
2. Click **GENERATE**
3. Click **COPY** or **DOWNLOAD**

See [One-Click Export](/guide/export) for all format details.

## CLEAR

The **CLEAR** button in the NETWORK tab clears all data across all sub-tabs simultaneously.
