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

### Register Options

```ts
interface RegisterOptions {
  binary?: "headless" | "headful";  // Override binary for this site
  pool?: number;                    // Number of tabs in pool (default: 1)
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
  
  // Data Storage (NEW)
  store<T = any>(data: T | T[], schemaName?: string): Promise<StoreResult>;
  
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
  
  // Tab Pooling (NEW)
  poolStats(): PoolStats;
  
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

## Store Types (NEW)

### Store Result

```ts
interface StoreResult {
  stored: number;   // Number of records successfully saved
  skipped: number;  // Number of records that failed validation
}
```

### Store Schema (piggy.store.json)

```ts
interface StoreSchema {
  stores: StoreDefinition[];
}

interface StoreDefinition {
  name: string;                                    // Unique identifier
  destination: string;                             // File path (.json or .db)
  fields: Record<string, StoreFieldDefinition>;    // Field schemas
}

interface StoreFieldDefinition {
  type: "string" | "number" | "boolean" | "object" | "array";
  default?: any;                                   // Default value if missing
}
```

---

## Tab Pooling Types (NEW)

### Pool Stats

```ts
interface PoolStats {
  idle: number;    // Free tabs ready for use
  busy: number;    // Tabs currently handling requests
  queued: number;  // Requests waiting for a free tab
  total: number;   // Total pool size (idle + busy)
}
```

---

## OpenAPI / Detail Types (NEW)

### Serve Options (Updated)

```ts
interface ServeOptions {
  hostname?: string;     // Default: "localhost"
  title?: string;        // API title for OpenAPI
  version?: string;      // API version for OpenAPI
  description?: string;  // API description for OpenAPI
}
```

### API Options (Updated)

```ts
interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;           // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;  // Middleware
  timeout?: number;       // Request timeout in ms (NEW)
  detail?: RouteDetail;   // OpenAPI documentation (NEW)
}
```

### Route Detail

```ts
interface RouteDetail {
  tags?: string[];                    // Group routes in UI
  summary?: string;                   // Short description
  description?: string;               // Long description
  parameters?: RouteParameter[];      // Query/path/header params
  deprecated?: boolean;               // Mark as deprecated
  hide?: boolean;                     // Hide from OpenAPI UI
}
```

### Route Parameter

```ts
interface RouteParameter {
  name: string;                                    // Parameter name
  in: "query" | "path" | "header" | "cookie";    // Where it lives
  description?: string;                            // Description
  required?: boolean;                              // Is it required?
  schema: RouteParameterSchema;                    // Type definition
}

interface RouteParameterSchema {
  type: "string" | "integer" | "number" | "boolean" | "array" | "object";
  default?: any;           // Default value
  minimum?: number;        // Minimum value (for numbers)
  maximum?: number;        // Maximum value (for numbers)
  format?: string;         // email, uuid, date-time, etc.
  enum?: any[];            // Allowed values
  pattern?: string;        // Regex pattern for strings
  example?: any;           // Example value
}
```

---

## UsePiggy Type Helper (NEW)

```ts
// usePiggy returns a typed version of the piggy object
function usePiggy<T extends string>(): {
  [K in T]: SiteObject;
};

// Example usage:
// const { amazon, ebay } = usePiggy<"amazon" | "ebay">();
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
  register(name: string, url: string, opts?: RegisterOptions): Promise<Piggy>;
  close(opts?: { force?: boolean }): Promise<void>;
  
  // Global controls
  actHuman(enable: boolean): Piggy;
  mode(mode: "tab" | "process"): Piggy;
  detect(binary: "headless" | "headful"): string | null;
  
  // Global RPC
  expose(name: string, handler: (data: any) => Promise<any> | any, tabId?: string): Promise<Piggy>;
  unexpose(name: string, tabId?: string): Promise<Piggy>;
  
  // API Server
  serve(port: number, opts?: ServeOptions): Promise<void>;
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
import piggy, { 
  type SiteObject, 
  type CapturedRequest,
  type PoolStats,
  type StoreResult,
  type RouteDetail,
  usePiggy 
} from "nothing-browser";

// Fully typed
await piggy.launch({ mode: "tab", binary: "headless" });

// Register with pool
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

// Typed access with usePiggy
const { amazon } = usePiggy<"amazon">();

// SiteObject is fully typed
const site: SiteObject = piggy.amazon;

// Typed evaluate
const data = await site.evaluate<{ id: number; name: string }>(() => ({
  id: 1,
  name: "test"
}));

// Typed capture
const requests: CapturedRequest[] = await site.capture.requests();

// Typed pool stats
const stats: PoolStats = site.poolStats();
console.log(`Idle: ${stats.idle}, Busy: ${stats.busy}, Queued: ${stats.queued}`);

// Typed store
const storeResult: StoreResult = await site.store(products);
console.log(`Stored: ${storeResult.stored}, Skipped: ${storeResult.skipped}`);

// Typed API handler with detail
await site.api("/users", async (params, query, body): Promise<{ users: any[] }> => {
  return { users: [] };
}, { 
  ttl: 30000,
  detail: {
    summary: "Get users",
    description: "Returns a list of users",
    tags: ["Users"],
    parameters: [
      {
        name: "limit",
        in: "query",
        schema: { type: "integer", default: 10 }
      }
    ]
  }
});

// Typed serve with OpenAPI
await piggy.serve(3000, {
  title: "My API",
  version: "1.0.0",
  description: "API description"
});
```

## New Feature Types (v0.1.12 / v0.0.18)

### Connection Options (HTTP Mode)

```ts
interface ConnectOptions {
  host: string;   // http://localhost:2005 or http://your-vps:2005
  key: string;    // Your 64-character key (starts with "peaseernest")
}

Proxy Types
ts

interface ProxySetOptions {
  host?: string;
  port?: number;
  type?: "http" | "https" | "socks5" | "socks4";
  user?: string;
  pass?: string;
  proxy?: string;  // URL format: "http://host:port"
}

interface ProxyCurrent {
  host: string;
  port: number;
  type: string;
  user?: string;
  alive: boolean;
  latencyMs?: number;
}

interface ProxyStats {
  total: number;    // Total proxies loaded
  alive: number;    // Proxies that passed health check
  dead: number;     // Proxies that failed health check
  index: number;    // Current position in rotation
  checking: boolean; // Whether health check is running
}

interface ProxyListItem {
  host: string;
  port: number;
  type: string;
  alive: boolean;
  latencyMs?: number;
}

type ProxyRotationMode = "none" | "timed" | "perrequest";

interface ProxyConfig {
  skipDead?: boolean;
  autoCheck?: boolean;
}

type ProxySaveFilter = "alive" | "dead" | "all";

Proxy Events
ts

type ProxyEvent =
  | "proxy:loaded"      // { count: number }
  | "proxy:changed"     // { host: string; port: number; type: string }
  | "proxy:alive"       // { host: string; port: number; type: string; latencyMs: number }
  | "proxy:dead"        // { host: string; port: number; type: string }
  | "proxy:check:started" // { total: number }
  | "proxy:check:done"  // { alive: number; dead: number }
  | "proxy:exhausted"   // {}
  | "proxy:fetch:failed" // { url: string; error: string }
  | "proxy:ovpn:loaded"; // { path: string }

Session Persistence Types
ts

interface SessionPaths {
  workDir: string;
  cookies: string;
  profile: string;
  ws: string;
  pings: string;
}

// ws.json frame format
interface WsFrame {
  id: string;
  direction: "sent" | "received";
  type: "text" | "binary" | "open" | "close";
  data: string;
  timestamp: number;
  size: number;
}

// pings.json entry format
interface PingEntry {
  timestamp: number;
  latencyMs: number | null;
  status: "success" | "failed";
  error?: string;
}

Identity & Profile Types
ts

// identity.json — DO NOT EDIT MANUALLY
interface Identity {
  cpu_cores: number;
  ram_gb: number;
  screen_resolution: string;
  gpu_vendor: string;
  gpu_renderer: string;
  timezone: string;
  canvas_seed: number;
  audio_seed: number;
  webgl_seed: number;
  font_seed: number;
}

// profile.json — SAFE TO EDIT
interface Profile {
  user_agent: string;
  sec_ch_ua: string;
  platform: string;
  chrome_version: number;
  language: string;
  gpu_renderer: string;
  gpu_vendor: string;
  timezone: string;
}

Cookie Format (cookies.json)
ts

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;  // Unix timestamp (seconds), null = session cookie
}

Updated Piggy Client Interface
ts

interface PiggyClient {
  // Connection
  connect(opts: ConnectOptions): Promise<void>;
  
  // Proxy methods
  proxyLoad(path: string): Promise<void>;
  proxyFetch(url: string): Promise<void>;
  proxyOvpn(path: string): Promise<void>;
  proxySet(opts: ProxySetOptions): Promise<void>;
  proxyTest(): Promise<void>;
  proxyTestStop(): Promise<void>;
  proxyNext(): Promise<void>;
  proxyDisable(): Promise<void>;
  proxyEnable(): Promise<void>;
  proxyCurrent(): Promise<ProxyCurrent>;
  proxyStats(): Promise<ProxyStats>;
  proxyList(limit?: number): Promise<ProxyListItem[]>;
  proxyRotation(mode: ProxyRotationMode, interval?: number): Promise<void>;
  proxyConfig(opts: ProxyConfig): Promise<void>;
  proxySave(path: string, filter: ProxySaveFilter): Promise<void>;
  onProxyEvent(event: string, handler: (data: any) => void): () => void;
  
  // Session persistence
  sessionWsSave(enabled: boolean): Promise<void>;
  sessionPingsSave(enabled: boolean): Promise<void>;
  sessionPaths(): Promise<SessionPaths>;
  sessionCookiesPath(): Promise<string>;
  sessionProfilePath(): Promise<string>;
  sessionWsPath(): Promise<string>;
  sessionPingsPath(): Promise<string>;
  sessionReload(): Promise<void>;
}

Example Usage with New Types
ts

import piggy from "nothing-browser";

// Connect to remote server
await piggy.connect({
  host: "http://vps.example.com:2005",
  key: "peaseernestbd7436aecf7041a39532a03308b8ee3350495f3cdb534b8294f9d"
});

// Enable WebSocket saving
await piggy.sessionWsSave(true);

// Get file paths
const paths: SessionPaths = await piggy.sessionPaths();
console.log(paths.cookies);

// Load proxies
await piggy.proxyFetch("https://example.com/proxies.txt");
await piggy.proxyTest();

// Get proxy stats
const stats: ProxyStats = await piggy.proxyStats();
console.log(`${stats.alive}/${stats.total} proxies alive`);

// Listen to proxy events
piggy.onProxyEvent("proxy:alive", (data: ProxyListItem) => {
  console.log(`✅ ${data.host}:${data.port} (${data.latencyMs}ms)`);
});

// Rotate proxies
await piggy.proxyRotation("perrequest");

Version Notice

    ⚠️ These types require Binary v0.1.12+ and Library v0.0.18+

    See Version Compatibility for details.



---

## Next Steps

- [Quick Start](./quickstart) — Start using Piggy
- [Typed Sites](./typed-sites) — Using usePiggy for type safety
- [Tab Pooling](./tab-pooling) — Concurrent request handling
- [Data Storage](./data-storage) — Schema-driven persistence
- [API Reference](./api-reference.md) — Complete API reference

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
