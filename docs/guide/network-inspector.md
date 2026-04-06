# Network Inspector

The NETWORK sub-tab in DEVTOOLS captures every HTTP request and response automatically. No configuration. No filter needed upfront. Everything goes in.

## What Gets Captured

- **Method** — GET, POST, PUT, DELETE, PATCH
- **Status code** — 200, 304, 404, 500, etc.
- **Content type** — JSON, HTML, binary, etc.
- **Response size** — shown in bytes or KB
- **Request headers** — all headers sent with the request
- **Response headers** — all headers received back
- **Request body** — POST/PUT/PATCH body, decoded
- **Response body** — full server response, JSON auto-formatted
- **Timestamp** — `hh:mm:ss.zzz`

## How to Use It

1. Open Nothing Browser
2. Go to the BROWSER tab and navigate to any site
3. Switch to DEVTOOLS → NETWORK
4. All requests are already there

Click any row to see the full detail in the right panel. Three sub-tabs:

| Sub-tab | Content |
| --- | --- |
| Summary + Headers | Firefox-style view with decoded query params, full URL, all headers |
| Response | The server response body — JSON formatted if applicable |
| Raw | Raw HTTP/1.1 representation |

## Filtering

Use the filter bar to search by URL. The type dropdown filters by request type: XHR, Fetch, WS, Script, Doc, Img.

## Export from Network Tab

Select any row and click:

- **COPY HEADERS** — copies summary + headers to clipboard
- **COPY RESPONSE** — copies response body to clipboard  
- **AS CURL** — generates and copies a cURL command
- **AS PYTHON** — generates and copies a Python `requests` script
- **DOWNLOAD** — saves the full request + response to a `.txt` file

Cookies from the Cookie Inspector are automatically included in exports.

## Capture Method

HTTP capture uses two layers:

1. `QWebEngineUrlRequestInterceptor` (`Interceptor`) — captures every request at the network layer, injects headers
2. JavaScript injection (`NetworkCapture.captureScript()`) — patches `fetch` and `XMLHttpRequest` to capture request bodies and response bodies

This dual approach is why request bodies (POST data) are captured correctly — the JS layer sees the body before it's sent.
