# 📘 TypeScript Types — Complete API Definitions

Full TypeScript type definitions for the Piggy API. Use these for type-safe development.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Core Types

### Launch & Connect Options

```ts
interface LaunchOptions {
  mode?: "tab" | "process";      // default: "tab"
  binary?: "headless" | "headful" | string;  // default: "headless"
}

interface ConnectOptions {
  host: string;   // http://localhost:2005 or http://your-vps:2005
  key: string;    // Your 64-character key (starts with "peaseernest")
}

interface RegisterOptions {
  binary?: "headless" | "headful" | string;
  pool?: number;   // Number of tabs in pool (default: 1)
}
```

### Site Object

```ts
interface SiteObject {
  // Navigation
  navigate(url?: string, opts?: NavigateOptions): Promise<void>;
  reload(): Promise<void>;
  goBack(): Promise<void>;
  goForward(): Promise<void>;
  waitForNavigation(): Promise<void>;
  title(): Promise<string>;
  url(): string;  // synchronous (cached)
  content(): Promise<string>;
  
  // Waiting
  wait(ms: number): Promise<void>;
  waitForSelector(selector: string, timeout?: number): Promise<void>;
  waitForVisible(selector: string, timeout?: number): Promise<void>;
  waitForResponse(pattern: string, timeout?: number): Promise<void>;
  
  // Interactions
  click(selector: string, opts?: ClickOptions): Promise<boolean>;
  doubleClick(selector: string): Promise<boolean>;
  hover(selector: string): Promise<boolean>;
  type(selector: string, text: string, opts?: TypeOptions): Promise<boolean>;
  select(selector: string, value: string | string[]): Promise<boolean>;
  evaluate<T = any>(js: string | ((...args: any[]) => T), ...args: any[]): Promise<T>;
  
  // Keyboard, Mouse, Scroll
  keyboard: {
    press(key: string): Promise<boolean>;
    combo(combo: string): Promise<boolean>;
  };
  mouse: {
    move(x: number, y: number): Promise<boolean>;
    drag(from: { x: number; y: number }, to: { x: number; y: number }): Promise<boolean>;
  };
  scroll: {
    to(selector: string): Promise<boolean>;
    by(px: number): Promise<void>;
  };
  
  // Fetch & Search
  fetchText(selector: string): Promise<string | null>;
  fetchLinks(selector: string): Promise<string[]>;
  fetchImages(selector: string): Promise<string[]>;
  search: {
    css(query: string): Promise<any>;
    id(query: string): Promise<any>;
  };
  
  // Storage
  store<T = any>(data: T | T[], schemaName?: string): Promise<StoreResult>;
  
  // RPC
  exposeFunction(name: string, handler: (data: any) => Promise<any> | any): Promise<SiteObject>;
  unexposeFunction(name: string): Promise<SiteObject>;
  clearExposedFunctions(): Promise<SiteObject>;
  exposeAndInject(name: string, handler: (data: any) => Promise<any> | any, injectionJs: string | ((fnName: string) => string)): Promise<SiteObject>;
  
  // Interception
  intercept: {
    block(pattern: string): Promise<void>;
    redirect(pattern: string, redirectUrl: string): Promise<void>;
    headers(pattern: string, headers: Record<string, string>): Promise<void>;
    respond(pattern: string, handlerOrResponse: object | Function): Promise<SiteObject>;
    modifyResponse(pattern: string, handler: (response: ModifyResponse) => Promise<ModifyResponseResult | null>): Promise<SiteObject>;
    clear(type?: "block" | "redirect" | "respond" | "modifyResponse" | "headers"): Promise<void>;
  };
  blockImages(): Promise<void>;
  unblockImages(): Promise<void>;
  
  // Capture
  capture: {
    start(): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    requests(): Promise<CapturedRequest[]>;
    ws(): Promise<WebSocketFrame[]>;
    cookies(): Promise<CapturedCookie[]>;
    storage(): Promise<StorageEntry[]>;
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
    reload(): Promise<void>;
    paths(): Promise<SessionPaths>;
    cookiesPath(): Promise<string>;
    profilePath(): Promise<string>;
    wsPath(): Promise<string>;
    pingsPath(): Promise<string>;
    setWsSave(enabled: boolean): Promise<void>;
    setPingsSave(enabled: boolean): Promise<void>;
  };
  
  // Screenshot & PDF
  screenshot(filePath?: string): Promise<string>;
  pdf(filePath?: string): Promise<string>;
  
  // API Server
  api(path: string, handler: ApiHandler, opts?: ApiOptions): SiteObject;
  
  // Lifecycle
  noclose(): SiteObject;
  close(): Promise<void>;
  addInitScript(js: string | (() => void)): Promise<SiteObject>;
  on(event: "navigate", handler: (url: string) => void): () => void;
  poolStats(): PoolStats | null;
}
```

---

## Find API Types

### Element Descriptor

```ts
interface ElementDescriptor {
  tag: string;                      // element tag name
  id: string;                       // element id attribute
  cls: string;                      // element class attribute
  text: string;                     // innerText, first 400 chars
  html: string;                     // innerHTML, first 800 chars
  href: string;                     // href attribute (if any)
  src: string;                      // src attribute (if any)
  value: string;                    // value attribute (if any)
  attrs: Record<string, string>;    // all attributes
}
```

### Find Options

```ts
interface FindByTextOptions {
  text: string;
  selector?: string;   // defaults to "*"
  exact?: boolean;     // defaults to false
}

interface FindByAttrOptions {
  attr: string;
  value?: string;
  selector?: string;   // defaults to "*"
}

interface FindByRoleOptions {
  role: string;
  name?: string;
}

interface FindClosestOptions {
  selector: string;
  ancestor: string;
}

interface FindFilterOptions {
  selector: string;
  attr: string;
  value: string;
}
```

---

## Provide API Types

### Structured Data Types

```ts
interface LinkDescriptor {
  text: string;
  href: string;
  title: string;
}

interface ImageDescriptor {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface PageData {
  title: string;
  url: string;
  html: string;
  text: string;
}

interface DivDescriptor {
  tag: string;
  id: string;
  cls: string;
  text: string;
  html: string;
  children: DivDescriptor[];   // direct children only, max 20
}

interface SelectData {
  value: string;
  options: {
    text: string;
    value: string;
    selected: boolean;
  }[];
}

interface TableData {
  headers: string[];
  rows: string[][];
}
```

---

## Wait API Types

```ts
type WaitSelectorState = "attached" | "detached" | "visible" | "hidden";

interface WaitSelectorOptions {
  selector: string;
  state?: WaitSelectorState;   // default: "attached"
  timeout?: number;            // default: 30000
  tabId?: string;
}

interface WaitFunctionOptions {
  js: string;
  timeout?: number;            // default: 30000
  tabId?: string;
}
```

---

## Capture API Types

```ts
interface CapturedRequest {
  method: string;
  url: string;
  status: string;
  type: string;
  mime: string;
  reqHeaders: string;
  reqBody: string;
  resHeaders: string;
  resBody: string;
  size: number;
  timestamp: string;
}

interface WebSocketFrame {
  connectionId: string;
  url: string;
  direction: "sent" | "received";
  data: string;
  binary: boolean;
  timestamp: string;
}

interface CapturedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  expires: string;
}

interface StorageEntry {
  key: string;
  value: string;
}
```

---

## Interception Types

```ts
interface InterceptRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface InterceptResponse {
  status?: number;           // default: 200
  contentType?: string;      // default: auto-detect
  headers?: Record<string, string>;
  body: string | Buffer;
}

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
  expires?: number;   // Unix timestamp (seconds)
}

interface CookieSetOptions {
  name: string;
  value: string;
  domain: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  expiry?: number;    // Unix timestamp (seconds)
}

interface CookieDeleteOptions {
  name: string;
  domain: string;
}
```

---

## Session Types

```ts
interface ExportedSession {
  url: string;
  cookies: Cookie[];
  storage: {
    localStorage: Array<{ key: string; value: string; origin: string }>;
    sessionStorage: Array<{ key: string; value: string; origin: string }>;
  };
}

interface SessionPaths {
  workDir: string;     // QDir::currentPath() – where script runs
  cookies: string;
  profile: string;
  ws: string;
  pings: string;
}
```

---

## Proxy Types

```ts
interface ProxyCurrent {
  active: boolean;
  host?: string;
  port?: number;
  type?: "http" | "https" | "socks5";
  user?: string;
  proxy?: string;
  latency?: number;
  health?: "alive" | "dead" | "checking" | "unchecked";
}

interface ProxyStats {
  total: number;
  alive: number;
  dead: number;
  index: number;
  active: boolean;
  checking: boolean;
  skipDead: boolean;
  autoCheck: boolean;
}

interface ProxyEntry {
  index: number;
  host: string;
  port: number;
  type: "http" | "https" | "socks5";
  user: string;
  proxy: string;
  latency: number;
  health: "alive" | "dead" | "checking" | "unchecked";
  current: boolean;
}

interface ProxyListResult {
  proxies: ProxyEntry[];
  total: number;
  shown: number;
}

interface ProxyConfig {
  skipDead: boolean;
  autoCheck: boolean;
}

interface ProxySetOptions {
  host?: string;
  port?: number;
  type?: "http" | "https" | "socks5" | "socks4";
  user?: string;
  pass?: string;
  proxy?: string;  // URL format: "http://host:port"
}

type ProxyRotationMode = "none" | "timed" | "perrequest";
type ProxySaveFilter = "alive" | "dead" | "all";
```

---

## Captcha & Block Types

```ts
interface CaptchaStatus {
  detected: boolean;
  paused: boolean;
  type: "cloudflare" | "recaptcha" | "hcaptcha" | "turnstile" | "generic" | null;
}

interface BlockStatus {
  detected: boolean;
  type: "403" | "429" | "access-denied" | "firewall" | "rate-limit" | null;
}

interface CaptchaEventData {
  tabId: string;
  captchaType: string;
}

interface BlockEventData {
  tabId: string;
  blockType: string;
}
```

---

## Dialog Types

```ts
interface DialogStatus {
  pending: boolean;
  type: "alert" | "confirm" | "prompt" | null;
  message: string;
  defaultValue: string;
}

interface DialogResult {
  type: "alert" | "confirm" | "prompt";
  message: string;
  accepted?: boolean;
  dismissed?: boolean;
  input?: string;
}

interface DialogEventData {
  tabId: string;
  dialogType: "alert" | "confirm" | "prompt";
  message: string;
  defaultValue: string;
}
```

---

## Human Mode Types

```ts
type TypingSpeed = "slow" | "normal" | "fast";
type ClickDelay = "cautious" | "normal" | "fast";
type ScrollSpeed = "slow" | "normal" | "fast";

interface HumanProfile {
  typingSpeed: TypingSpeed;
  clickDelay: ClickDelay;
  scrollSpeed: ScrollSpeed;
  mouseWiggle: boolean;
}

interface HumanTypeOptions {
  selector: string;
  text: string;
  clear?: boolean;
  speed?: number;  // Override profile, ms between keys
}

interface HumanClickOptions {
  selector: string;
  force?: boolean;
  delay?: number;  // Override profile, ms before click
}
```

---

## Iframe Types

```ts
interface IframeDescriptor {
  index: number;
  src: string;
  id: string;
  name: string;
  width: number;
  height: number;
}

interface IframeEvaluateOptions {
  frameIndex?: number;
  id?: string;
  name?: string;
  src?: string;
  js: string;
  tabId?: string;
}

interface IframeInteractionOptions {
  frameIndex?: number;
  id?: string;
  name?: string;
  src?: string;
  sel: string;
  tabId?: string;
}

interface IframeTypeOptions extends IframeInteractionOptions {
  text: string;
}

interface IframeWaitOptions extends IframeInteractionOptions {
  timeout?: number;
}
```

---

## API Server Types

```ts
type ApiHandler = (
  params: Record<string, string>,
  query: Record<string, string>,
  body?: any
) => Promise<any>;

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";  // default: "GET"
  ttl?: number;           // Cache TTL in ms (0 = no cache)
  before?: Array<(context: any) => void>;  // Middleware
  timeout?: number;       // Request timeout in ms
  detail?: RouteDetail;   // OpenAPI documentation
}

interface ServeOptions {
  hostname?: string;     // Default: "localhost"
  title?: string;        // API title for OpenAPI
  version?: string;      // API version for OpenAPI
  description?: string;  // API description for OpenAPI
}

interface RouteDetail {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: RouteParameter[];
  deprecated?: boolean;
  hide?: boolean;
}

interface RouteParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  schema: RouteParameterSchema;
}

interface RouteParameterSchema {
  type: "string" | "integer" | "number" | "boolean" | "array" | "object";
  default?: any;
  minimum?: number;
  maximum?: number;
  format?: string;
  enum?: any[];
  pattern?: string;
  example?: any;
}
```

---

## Storage Types

```ts
interface StoreResult {
  stored: number;   // Number of records successfully saved
  skipped: number;  // Number of records that failed validation
}

interface StoreSchema {
  stores: StoreDefinition[];
}

interface StoreDefinition {
  name: string;
  destination: string;
  fields: Record<string, StoreFieldDefinition>;
}

interface StoreFieldDefinition {
  type: "string" | "number" | "boolean" | "object" | "array";
  default?: any;
}
```

---

## Tab Pooling Types

```ts
interface PoolStats {
  idle: number;    // Free tabs ready for use
  busy: number;    // Tabs currently handling requests
  queued: number;  // Requests waiting for a free tab
  total: number;   // Total pool size (idle + busy)
}
```

---

## Interaction Options

```ts
interface ClickOptions {
  retries?: number;
  timeout?: number;
}

interface TypeOptions {
  delay?: number;    // ms between keystrokes
  clear?: boolean;
  retries?: number;
  speed?: "slow" | "normal" | "fast";
}

interface NavigateOptions {
  retries?: number;
}
```

---

## Event Types

```ts
interface NavigateEventData {
  tabId: string;
  url: string;
}

interface ExposedCallEventData {
  tabId: string;
  name: string;
  callId: string;
  data: string;
}

interface ProxyChangedEventData {
  proxy: string;
  host: string;
  port: number;
  latency: number;
}

interface ProxyLoadedEventData {
  count: number;
}

interface ProxyCheckEventData {
  total: number;
  alive: number;
  dead: number;
}

interface ProxyAliveDeadEventData {
  index: number;
  latency: number;
}
```

---

## Piggy Main Object

```ts
interface Piggy {
  // Lifecycle
  launch(opts?: LaunchOptions): Promise<Piggy>;
  connect(opts: ConnectOptions): Promise<Piggy>;
  register(name: string, url: string, opts?: RegisterOptions): Promise<Piggy>;
  close(opts?: { force?: boolean }): Promise<void>;
  
  // Global controls
  actHuman(enable: boolean): Piggy;
  mode(mode: "tab" | "process"): Piggy;
  detect(binary: "headless" | "headful" | string): string | null;
  
  // Global RPC
  expose(name: string, handler: (data: any) => Promise<any> | any, tabId?: string): Promise<Piggy>;
  unexpose(name: string, tabId?: string): Promise<Piggy>;
  
  // API Server
  serve(port: number, opts?: ServeOptions): Promise<void>;
  stopServer(): void;
  routes(): RouteInfo[];
  
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
  
  // Sub-API clients
  tabs: TabsClient;
  navigation: NavigationClient;
  interactions: InteractionsClient;
  media: MediaClient;
  capture: CaptureClient;
  find: FindClient;
  provide: ProvideClient;
  wait: WaitClient;
  evaluate: EvaluateClient;
  fetch: FetchClient;
  captcha: CaptchaClient;
  dialog: DialogClient;
  human: HumanClient;
  iframe: IframeClient;
  session: SessionClient;
  export: ExportClient;
  proxy: ProxyClient;
  
  // Dynamic sites
  [key: string]: any;
}

interface RouteInfo {
  site: string;
  method: string;
  path: string;
  ttl: number;
  middlewareCount: number;
}
```

---

## Example Usage with Types

```ts
import piggy, { 
  type SiteObject, 
  type CapturedRequest,
  type ElementDescriptor,
  type PoolStats,
  type StoreResult,
  usePiggy 
} from "nothing-browser";

// Fully typed launch
await piggy.launch({ mode: "tab", binary: "headless" });

// Register with pool
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

// Typed access with usePiggy
const { amazon } = usePiggy<"amazon">();

// Typed evaluate
const data = await amazon.evaluate<{ id: number; name: string }>(() => ({
  id: 1,
  name: "test"
}));

// Typed capture
const requests: CapturedRequest[] = await amazon.capture.requests();

// Typed pool stats
const stats: PoolStats = amazon.poolStats();
console.log(`Idle: ${stats.idle}, Busy: ${stats.busy}`);

// Typed store
const storeResult: StoreResult = await amazon.store(products);
console.log(`Stored: ${storeResult.stored}, Skipped: ${storeResult.skipped}`);

// Typed find
const elements: ElementDescriptor[] = await amazon.find.css({ selector: ".price" });

// Typed API handler
await amazon.api("/users", async (params, query, body): Promise<{ users: any[] }> => {
  return { users: [] };
}, { 
  ttl: 30000,
  detail: {
    summary: "Get users",
    parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }]
  }
});

// Typed serve with OpenAPI
await piggy.serve(3000, {
  title: "My API",
  version: "1.0.0",
  description: "API description"
});
```

---

## Next Steps

- [Find API](../find) — DOM query with element descriptors
- [Provide API](../provide) — Structured data extraction
- [API Server](../api-server) — Build APIs with Piggy

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*