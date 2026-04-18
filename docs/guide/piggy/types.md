# Types

Complete TypeScript type definitions for Piggy API.

---

## Core Types

### Launch Options

```ts
interface LaunchOptions {
  mode?: "tab" | "process";  // default: "tab"
  binary?: "headless" | "headful";  // default: "headless"
}
```

### Site Object

```ts
interface SiteObject {
  // Navigation
  navigate(url?: string): Promise<void>;
  reload(): Promise<void>;
  goBack(): Promise<void>;
  goForward(): Promise<void>;
  waitForNavigation(): Promise<void>;
  title(): Promise<string>;
  url(): Promise<string>;
  content(): Promise<string>;
  
  // Waiting
  wait(ms: number): Promise<void>;
  waitForSelector(selector: string, timeout?: number): Promise<void>;
  waitForResponse(urlPattern: string, timeout?: number): Promise<void>;
  
  // Interactions
  click(selector: string, opts?: ClickOptions): Promise<boolean>;
  doubleClick(selector: string): Promise<boolean>;
  hover(selector: string): Promise<boolean>;
  type(selector: string, text: string, opts?: TypeOptions): Promise<boolean>;
  select(selector: string, value: string | string[]): Promise<boolean>;
  
  // Keyboard
  keyboard: {
    press(key: string): Promise<boolean>;
    combo(combo: string): Promise<boolean>;
  };
  
  // Mouse
  mouse: {
    move(x: number, y: number): Promise<boolean>;
    drag(from: { x: number; y: number }, to: { x: number; y: number }): Promise<boolean>;
  };
  
  // Scroll
  scroll: {
    to(selector: string): Promise<boolean>;
    by(px: number): Promise<boolean>;
  };
  
  // Data Extraction
  evaluate<T = any>(js: string | ((...args: any[]) => T), ...args: any[]): Promise<T>;
  fetchText(selector: string): Promise<string | null>;
  fetchLinks(selector?: string): Promise<string[]>;
  fetchImages(selector?: string): Promise<string[]>;
  search: {
    css(query: string): Promise<any>;
    id(id: string): Promise<any>;
  };
  
  // RPC (exposeFunction)
  exposeFunction(name: string, handler: (data: any) => Promise<any> | any): Promise<void>;
  unexposeFunction(name: string): Promise<void>;
  clearExposedFunctions(): Promise<void>;
  exposeAndInject(
    name: string, 
    handler: (data: any) => Promise<any> | any,
    injectionJs: string | ((fnName: string) => string)
  ): Promise<void>;
  
  // Request Interception
  intercept: {
    block(pattern: string): Promise<void>;
    redirect(pattern: string, redirectUrl: string): Promise<void>;
    headers(pattern: string, headers: Record<string, string>): Promise<void>;
    respond(
      pattern: string, 
      handler: (request: InterceptRequest) => Promise<InterceptResponse | null>
    ): Promise<void>;
    modifyResponse(
      pattern: string,
      handler: (response: ModifyResponse) => Promise<ModifyResponseResult | null>
    ): Promise<void>;
    clear(type?: "block" | "redirect" | "respond" | "modifyResponse" | "headers"): Promise<void>;
  };
  
  blockImages(): Promise<void>;
  unblockImages(): Promise<void>;
  
  // Network Capture
  capture: {
    start(): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    requests(): Promise<CapturedRequest[]>;
    ws(): Promise<CapturedWebSocketFrame[]>;
    cookies(): Promise<CapturedCookie[]>;
    storage(): Promise<CapturedStorage>;
  };
  
  // Cookies
  cookies: {
    set(name: string, value: string, domain: string, path?: string): Promise<void>;
    get(name: string): Promise<Cookie | null>;
    delete(name: string): Promise<void>;
    list(): Promise<Cookie[]>;
  };
  
  // Session
  session: {
    export(): Promise<ExportedSession>;
    import(data: ExportedSession): Promise<void>;
  };
  
  // Screenshot & PDF
  screenshot(filePath?: string): Promise<string>;
  pdf(filePath?: string): Promise<string>;
  
  // API Server
  api(
    path: string, 
    handler: ApiHandler, 
    opts?: ApiOptions
  ): Promise<void>;
  
  noclose(): void;
  
  // Internal
  _name?: string;
  _tabId?: string;
  _client?: PiggyClient;
  close(): Promise<void>;
}
```

---

## Interception Types

### Intercept Request

```ts
interface InterceptRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}
```

### Intercept Response

```ts
interface InterceptResponse {
  status?: number;           // default: 200
  contentType?: string;      // default: auto-detect
  headers?: Record<string, string>;
  body: string | Buffer;
}
```

### Modify Response

```ts
interface ModifyResponse {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  json(): Promise<any>;
}

interface ModifyResponseResult {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}
```

---

## Capture Types

### Captured Request

```ts
interface CapturedRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  timestamp: number;
  duration: number;
}
```

### Captured WebSocket Frame

```ts
interface CapturedWebSocketFrame {
  id: string;
  direction: "sent" | "received";
  type: "text" | "binary" | "open" | "close";
  data: string;
  timestamp: number;
  size: number;
}
```

### Captured Cookie

```ts
interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;
  session: boolean;
  setByRequest: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
}
```

### Captured Storage

```ts
interface CapturedStorage {
  localStorage: Array<{
    key: string;
    value: string;
    timestamp: number;
  }>;
  sessionStorage: Array<{
    key: string;
    value: string;
    timestamp: number;
  }>;
}
```

---

## Cookie Types

```ts
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;  // Unix timestamp
}
```

---

## Session Types

```ts
interface ExportedSession {
  cookies: Cookie[];
  storage: {
    localStorage: Array<{
      key: string;
      value: string;
      origin: string;
    }>;
    sessionStorage: Array<{
      key: string;
      value: string;
      origin: string;
    }>;
  };
  url: string;
}
```

---

## API Server Types

### API Handler

```ts
type ApiHandler = (
  params: Record<string, string>,
  query: Record<string, string>,
  body?: any
) => Promise<any>;
```

### API Options

```ts
interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;           // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;  // Middleware
}
```

---

## Interaction Options

### Click Options

```ts
interface ClickOptions {
  button?: "left" | "right" | "middle";  // default: "left"
  clickCount?: number;                    // default: 1
  delay?: number;                         // ms between clicks
}
```

### Type Options

```ts
interface TypeOptions {
  delay?: number;        // ms between keystrokes
  human?: boolean;       // overrides global human mode
}
```

---

## Piggy Main Object

```ts
interface Piggy {
  // Lifecycle
  launch(opts?: LaunchOptions): Promise<Piggy>;
  register(name: string, url: string, opts?: { binary?: "headless" | "headful" }): Promise<Piggy>;
  close(opts?: { force?: boolean }): Promise<void>;
  
  // Global controls
  actHuman(enable: boolean): Piggy;
  mode(mode: "tab" | "process"): Piggy;
  detect(binary: "headless" | "headful"): string | null;
  
  // Global RPC
  expose(name: string, handler: (data: any) => Promise<any> | any, tabId?: string): Promise<Piggy>;
  unexpose(name: string, tabId?: string): Promise<Piggy>;
  
  // API Server
  serve(port: number, opts?: { hostname?: string }): Promise<void>;
  stopServer(): void;
  routes(): Array<{
    site: string;
    method: string;
    path: string;
    ttl: number;
    middlewareCount: number;
  }>;
  
  // Multi-site
  all(sites: SiteObject[]): {
    [K in keyof SiteObject]: SiteObject[K] extends (...args: infer P) => infer R
      ? (...args: P) => Promise<R[]>
      : never;
  };
  
  diff(sites: SiteObject[]): {
    [K in keyof SiteObject]: SiteObject[K] extends (...args: infer P) => infer R
      ? (...args: P) => Promise<Record<string, R>>
      : never;
  };
  
  // Dynamic sites
  [key: string]: any;  // Registered sites
}
```

---

## Event Types

### Navigation Event

```ts
interface NavigationEvent {
  url: string;
  tabId: string;
}
```

### Exposed Call Event

```ts
interface ExposedCallEvent {
  tabId: string;
  name: string;
  callId: string;
  data: any;
}
```

---

## Logger Types

```ts
interface Logger {
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
}
```

---

## Utility Types

### Response Handler Result

```ts
type ResponseResult = 
  | { success: true; result: any }
  | { success: false; error: string };
```

### Wait Options

```ts
interface WaitOptions {
  timeout?: number;
  pollInterval?: number;
}
```

---

## Example Usage with Types

```ts
import piggy, { type SiteObject, type CapturedRequest } from "nothing-browser";

// Fully typed
const response = await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("api", "https://api.example.com");

// SiteObject is fully typed
const site: SiteObject = piggy.api;

// Typed evaluate
const data = await site.evaluate<{ id: number; name: string }>(() => ({
  id: 1,
  name: "test"
}));

// Typed capture
const requests: CapturedRequest[] = await site.capture.requests();

// Typed API handler
await site.api("/users", async (params, query, body): Promise<{ users: any[] }> => {
  return { users: [] };
}, { ttl: 30000 });
```

---

## Next Steps

- [Quick Start](./quickstart) — Start using Piggy
- [API Reference](./api-reference.md) — Complete API reference
- [Examples](./excample) — More code examples

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
