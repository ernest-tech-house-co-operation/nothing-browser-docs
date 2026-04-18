# 📝 Full API Reference

Complete API documentation for Piggy. All methods, parameters, return values, and examples.

---

## Core API

### `piggy.launch(opts?)`

Launches the Nothing Browser binary.

```ts
piggy.launch(opts?: LaunchOptions): Promise<Piggy>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `opts.mode` | `"tab" \| "process"` | `"tab"` | Tab mode (shared browser) or process mode (isolated) |
| `opts.binary` | `"headless" \| "headful"` | `"headless"` | Headless (no window) or headful (visible) |

**Returns:** `Promise<Piggy>` - The piggy instance for chaining

**Example:**
```ts
await piggy.launch({ mode: "tab", binary: "headless" });
```

---

### `piggy.register(name, url, opts?)`

Registers a site and returns a site object.

```ts
piggy.register(name: string, url: string, opts?: RegisterOptions): Promise<Piggy>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Unique name for the site (accessed as `piggy[name]`) |
| `url` | `string` | Base URL for the site |
| `opts.binary` | `"headless" \| "headful"` | Override binary for this site |

**Returns:** `Promise<Piggy>` - The piggy instance with `piggy[name]` now available

**Example:**
```ts
await piggy.register("books", "https://books.toscrape.com");
await piggy.books.navigate();
```

---

### `piggy.close(opts?)`

Closes the browser and cleans up resources.

```ts
piggy.close(opts?: CloseOptions): Promise<void>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `opts.force` | `boolean` | `false` | Force kill all processes immediately |

**Example:**
```ts
await piggy.close();              // Graceful close
await piggy.close({ force: true }); // Force kill
```

---

### `piggy.actHuman(enable)`

Enables or disables human-like behavior globally.

```ts
piggy.actHuman(enable: boolean): Piggy
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `enable` | `boolean` | `true` to enable, `false` to disable |

**Returns:** `Piggy` - The piggy instance for chaining

**Example:**
```ts
piggy.actHuman(true);
await piggy.books.click("button"); // Has random delay
```

---

## Navigation API

### `site.navigate(url?)`

Navigates to a URL.

```ts
site.navigate(url?: string): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` (optional) | URL to navigate to (uses registered URL if omitted) |

**Example:**
```ts
await site.navigate();                         // Uses registered URL
await site.navigate("https://example.com");    // Custom URL
```

---

### `site.reload()`

Reloads the current page.

```ts
site.reload(): Promise<void>
```

---

### `site.goBack()`

Goes back in history.

```ts
site.goBack(): Promise<void>
```

---

### `site.goForward()`

Goes forward in history.

```ts
site.goForward(): Promise<void>
```

---

### `site.waitForNavigation()`

Waits for page navigation to complete.

```ts
site.waitForNavigation(): Promise<void>
```

---

### `site.waitForSelector(selector, timeout?)`

Waits for an element to appear in the DOM.

```ts
site.waitForSelector(selector: string, timeout?: number): Promise<void>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | - | CSS selector to wait for |
| `timeout` | `number` | `30000` | Timeout in milliseconds |

---

### `site.waitForResponse(urlPattern, timeout?)`

Waits for a specific network response.

```ts
site.waitForResponse(urlPattern: string, timeout?: number): Promise<void>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `urlPattern` | `string` | - | URL pattern (supports `*` wildcard) |
| `timeout` | `number` | `30000` | Timeout in milliseconds |

---

### `site.wait(ms)`

Pauses execution for a specified time.

```ts
site.wait(ms: number): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `ms` | `number` | Milliseconds to wait (varies ±30% if human mode enabled) |

---

### `site.title()`

Gets the page title.

```ts
site.title(): Promise<string>
```

**Returns:** `Promise<string>` - The page title

---

### `site.url()`

Gets the current URL.

```ts
site.url(): Promise<string>
```

**Returns:** `Promise<string>` - The current URL

---

### `site.content()`

Gets the full page HTML.

```ts
site.content(): Promise<string>
```

**Returns:** `Promise<string>` - The complete HTML content

---

## Interaction API

### `site.click(selector, opts?)`

Clicks an element.

```ts
site.click(selector: string, opts?: ClickOptions): Promise<boolean>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | - | CSS selector of element to click |
| `opts.button` | `"left" \| "right" \| "middle"` | `"left"` | Mouse button to use |
| `opts.clickCount` | `number` | `1` | Number of clicks |
| `opts.delay` | `number` | `0` | Delay between clicks in ms |

**Returns:** `Promise<boolean>` - `true` if clicked, `false` if element not found

---

### `site.doubleClick(selector)`

Double-clicks an element.

```ts
site.doubleClick(selector: string): Promise<boolean>
```

---

### `site.hover(selector)`

Hovers over an element.

```ts
site.hover(selector: string): Promise<boolean>
```

---

### `site.type(selector, text, opts?)`

Types text into an input element.

```ts
site.type(selector: string, text: string, opts?: TypeOptions): Promise<boolean>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | - | CSS selector of input element |
| `text` | `string` | - | Text to type |
| `opts.delay` | `number` | `50` | Delay between keystrokes in ms |
| `opts.human` | `boolean` | `false` | Override global human mode |

---

### `site.select(selector, value)`

Selects an option from a dropdown.

```ts
site.select(selector: string, value: string | string[]): Promise<boolean>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string` | CSS selector of select element |
| `value` | `string \| string[]` | Value(s) to select |

---

### `site.keyboard.press(key)`

Presses a keyboard key.

```ts
site.keyboard.press(key: string): Promise<boolean>
```

**Common keys:** `"Enter"`, `"Escape"`, `"Tab"`, `"Delete"`, `"Backspace"`, `"ArrowUp"`, `"ArrowDown"`

---

### `site.keyboard.combo(combo)`

Presses a key combination.

```ts
site.keyboard.combo(combo: string): Promise<boolean>
```

**Examples:** `"Ctrl+A"`, `"Ctrl+C"`, `"Cmd+W"`, `"Ctrl+Shift+I"`

---

### `site.mouse.move(x, y)`

Moves the mouse to coordinates.

```ts
site.mouse.move(x: number, y: number): Promise<boolean>
```

---

### `site.mouse.drag(from, to)`

Drags from one point to another.

```ts
site.mouse.drag(from: { x: number; y: number }, to: { x: number; y: number }): Promise<boolean>
```

---

### `site.scroll.to(selector)`

Scrolls to an element.

```ts
site.scroll.to(selector: string): Promise<boolean>
```

---

### `site.scroll.by(px)`

Scrolls by pixels.

```ts
site.scroll.by(px: number): Promise<boolean>
```

---

## Data Extraction API

### `site.evaluate(js, ...args)`

Executes JavaScript in the page context.

```ts
site.evaluate<T = any>(js: string | ((...args: any[]) => T), ...args: any[]): Promise<T>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `js` | `string \| function` | JavaScript to execute |
| `...args` | `any[]` | Arguments to pass to the function |

**Returns:** `Promise<T>` - The return value of the executed code

**Example:**
```ts
const title = await site.evaluate(() => document.title);
const products = await site.evaluate(() => 
  Array.from(document.querySelectorAll(".product")).map(el => el.textContent)
);
```

---

### `site.fetchText(selector)`

Gets text content of the first matching element.

```ts
site.fetchText(selector: string): Promise<string | null>
```

---

### `site.fetchLinks(selector?)`

Gets all href attributes from matching links.

```ts
site.fetchLinks(selector?: string): Promise<string[]>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | `"a"` | CSS selector for links |

---

### `site.fetchImages(selector?)`

Gets all src attributes from matching images.

```ts
site.fetchImages(selector?: string): Promise<string[]>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `string` | `"img"` | CSS selector for images |

---

### `site.search.css(query)`

Finds elements by CSS selector.

```ts
site.search.css(query: string): Promise<any>
```

---

### `site.search.id(id)`

Finds element by ID.

```ts
site.search.id(id: string): Promise<any>
```

---

## RPC API (exposeFunction)

### `site.exposeFunction(name, handler)`

Exposes a Node.js function to the browser.

```ts
site.exposeFunction(name: string, handler: (data: any) => Promise<any> | any): Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Function name (available as `window[name]` in browser) |
| `handler` | `(data: any) => Promise<any> \| any` | Node.js function to call |

**Example:**
```ts
await site.exposeFunction("saveData", async (data) => {
  await db.insert(data);
  return { saved: true };
});
```

---

### `site.unexposeFunction(name)`

Removes an exposed function.

```ts
site.unexposeFunction(name: string): Promise<void>
```

---

### `site.clearExposedFunctions()`

Removes all exposed functions for this site.

```ts
site.clearExposedFunctions(): Promise<void>
```

---

### `site.exposeAndInject(name, handler, injectionJs)`

Exposes a function and injects browser code in one call.

```ts
site.exposeAndInject(
  name: string, 
  handler: (data: any) => Promise<any> | any,
  injectionJs: string | ((fnName: string) => string)
): Promise<void>
```

---

### `piggy.expose(name, handler, tabId?)`

Exposes a function globally to all tabs.

```ts
piggy.expose(name: string, handler: (data: any) => Promise<any> | any, tabId?: string): Promise<Piggy>
```

---

### `piggy.unexpose(name, tabId?)`

Removes a globally exposed function.

```ts
piggy.unexpose(name: string, tabId?: string): Promise<Piggy>
```

---

## Request Interception API

### `site.intercept.block(pattern)`

Blocks requests matching a pattern.

```ts
site.intercept.block(pattern: string): Promise<void>
```

**Pattern examples:** `"*google-analytics.com*"`, `"*.png"`, `"*/ads/*"`

---

### `site.intercept.redirect(pattern, redirectUrl)`

Redirects matching requests.

```ts
site.intercept.redirect(pattern: string, redirectUrl: string): Promise<void>
```

---

### `site.intercept.headers(pattern, headers)`

Adds or modifies request headers.

```ts
site.intercept.headers(pattern: string, headers: Record<string, string>): Promise<void>
```

---

### `site.intercept.respond(pattern, handler)`

Serves a custom response.

```ts
site.intercept.respond(
  pattern: string,
  handler: (request: InterceptRequest) => Promise<InterceptResponse | null>
): Promise<void>
```

---

### `site.intercept.modifyResponse(pattern, handler)`

Modifies an existing response.

```ts
site.intercept.modifyResponse(
  pattern: string,
  handler: (response: ModifyResponse) => Promise<ModifyResponseResult | null>
): Promise<void>
```

---

### `site.intercept.clear(type?)`

Clears intercept rules.

```ts
site.intercept.clear(type?: "block" | "redirect" | "respond" | "modifyResponse" | "headers"): Promise<void>
```

---

### `site.blockImages()`

Blocks all images.

```ts
site.blockImages(): Promise<void>
```

---

### `site.unblockImages()`

Unblocks all images.

```ts
site.unblockImages(): Promise<void>
```

---

## Network Capture API

### `site.capture.start()`

Starts capturing network traffic.

```ts
site.capture.start(): Promise<void>
```

---

### `site.capture.stop()`

Stops capturing network traffic.

```ts
site.capture.stop(): Promise<void>
```

---

### `site.capture.clear()`

Clears captured data.

```ts
site.capture.clear(): Promise<void>
```

---

### `site.capture.requests()`

Gets captured HTTP requests.

```ts
site.capture.requests(): Promise<CapturedRequest[]>
```

---

### `site.capture.ws()`

Gets captured WebSocket frames.

```ts
site.capture.ws(): Promise<CapturedWebSocketFrame[]>
```

---

### `site.capture.cookies()`

Gets captured cookies.

```ts
site.capture.cookies(): Promise<CapturedCookie[]>
```

---

### `site.capture.storage()`

Gets captured storage data.

```ts
site.capture.storage(): Promise<CapturedStorage>
```

---

## Cookie API

### `site.cookies.set(name, value, domain, path?)`

Sets a cookie.

```ts
site.cookies.set(name: string, value: string, domain: string, path?: string): Promise<void>
```

---

### `site.cookies.get(name)`

Gets a cookie by name.

```ts
site.cookies.get(name: string): Promise<Cookie | null>
```

---

### `site.cookies.delete(name)`

Deletes a cookie.

```ts
site.cookies.delete(name: string): Promise<void>
```

---

### `site.cookies.list()`

Lists all cookies.

```ts
site.cookies.list(): Promise<Cookie[]>
```

---

## Session API

### `site.session.export()`

Exports current session (cookies + storage).

```ts
site.session.export(): Promise<ExportedSession>
```

---

### `site.session.import(data)`

Imports a saved session.

```ts
site.session.import(data: ExportedSession): Promise<void>
```

---

## Screenshot & PDF API

### `site.screenshot(filePath?)`

Takes a screenshot.

```ts
site.screenshot(filePath?: string): Promise<string>
```

**Returns:** If `filePath` provided, returns the file path. Otherwise returns base64 string.

---

### `site.pdf(filePath?)`

Generates a PDF.

```ts
site.pdf(filePath?: string): Promise<string>
```

**Returns:** If `filePath` provided, returns the file path. Otherwise returns base64 string.

---

## API Server API

### `site.api(path, handler, opts?)`

Creates an API endpoint.

```ts
site.api(
  path: string,
  handler: (params: Record<string, string>, query: Record<string, string>, body?: any) => Promise<any>,
  opts?: ApiOptions
): Promise<void>
```

**API Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `"GET" \| "POST" \| "PUT" \| "DELETE"` | `"GET"` | HTTP method |
| `ttl` | `number` | `0` | Cache TTL in milliseconds |
| `before` | `Array<(context: any) => void>` | `[]` | Middleware functions |

---

### `piggy.serve(port, opts?)`

Starts the HTTP server.

```ts
piggy.serve(port: number, opts?: { hostname?: string }): Promise<void>
```

---

### `piggy.stopServer()`

Stops the HTTP server.

```ts
piggy.stopServer(): void
```

---

### `piggy.routes()`

Lists all registered API routes.

```ts
piggy.routes(): Array<{
  site: string;
  method: string;
  path: string;
  ttl: number;
  middlewareCount: number;
}>
```

---

### `site.noclose()`

Prevents the site from closing when `piggy.close()` is called.

```ts
site.noclose(): void
```

---

## Multi-Site API

### `piggy.all(sites)`

Runs the same operation on multiple sites.

```ts
piggy.all(sites: SiteObject[]): {
  [K in keyof SiteObject]: SiteObject[K] extends (...args: infer P) => infer R
    ? (...args: P) => Promise<R[]>
    : never;
}
```

**Example:**
```ts
const titles = await piggy.all([site1, site2, site3]).title();
// Returns: ["Title 1", "Title 2", "Title 3"]
```

---

### `piggy.diff(sites)`

Runs operations and returns results mapped by site name.

```ts
piggy.diff(sites: SiteObject[]): {
  [K in keyof SiteObject]: SiteObject[K] extends (...args: infer P) => infer R
    ? (...args: P) => Promise<Record<string, R>>
    : never;
}
```

**Example:**
```ts
const titles = await piggy.diff([site1, site2, site3]).title();
// Returns: { site1: "Title 1", site2: "Title 2", site3: "Title 3" }
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `BINARY_NOT_FOUND` | Nothing Browser binary not found |
| `CONNECTION_FAILED` | Failed to connect to browser socket |
| `NAVIGATION_TIMEOUT` | Page navigation timed out |
| `SELECTOR_NOT_FOUND` | CSS selector did not match any element |
| `EVALUATION_FAILED` | JavaScript evaluation failed |
| `CAPTURE_NOT_STARTED` | Called capture method before `capture.start()` |

---

## Next Steps

- [Quick Start](./quickstart) — Start using Piggy
- [Types](./types) — TypeScript definitions
- [Examples](./types) — More code examples

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
