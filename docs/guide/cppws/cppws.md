# cppws — Full API Reference

> **The fastest WebSocket library alive. Bring your framework — we run alongside it.**
>
> This document is the complete API reference for cppws. Every method, every option,
> every type. If it's in the library, it's in here.

---

## Table of Contents

1. [Installation](#installation)
2. [Server Factory — `ws(options)`](#server-factory--wsoptions)
3. [Server Builder (chainable)](#server-builder-chainable)
4. [WebSocketServer](#websocketserver)
5. [WSContext](#wscontext)
6. [RoomSender](#roomsender)
7. [RoomManager](#roommanager)
8. [MetricsCollector](#metricscollector)
9. [TypedEmitter](#typedemitter)
10. [Configuration Reference](#configuration-reference)
    - [WSOptions](#wsoptions)
    - [RoomConfig](#roomconfig)
    - [SecurityConfig](#securityconfig)
    - [AuthConfig](#authconfig)
    - [CompressionConfig](#compressionconfig)
    - [BatchingConfig](#batchingconfig)
    - [HistoryConfig](#historyconfig)
    - [TLSConfig](#tlsconfig)
    - [PubSubAdapter](#pubsubadapter)
11. [Types & Interfaces](#types--interfaces)
    - [WSMetrics](#wsmetrics)
    - [ConnectionInfo](#connectioninfo)
    - [HistoryEntry](#historyentry)
    - [ServerEvents](#serverevents)
12. [Native Loader](#native-loader)
13. [Internal Event Bus](#internal-event-bus)
14. [Error Handling](#error-handling)
15. [Full Example](#full-example)

---

## Installation

```bash
npm install cppws
```

Pre-built binaries are resolved automatically via `optionalDependencies`. No compiler needed.

```javascript
import { ws } from 'cppws'
// or
const { ws } = require('cppws')
```

---

## Server Factory — `ws(options)`

The main entry point. Call it with a configuration object to get a **ServerBuilder** back.

```javascript
import { ws } from 'cppws'

const builder = ws({ port: 3001 })
```

### Signature

```typescript
function ws(options: WSOptions): ServerBuilder
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `WSOptions` | ✅ | Server configuration. `port` is the only required field. |

### Returns

A [`ServerBuilder`](#server-builder-chainable) — a chainable object for registering
handlers before starting the server.

### Minimal Example

```javascript
import { ws } from 'cppws'

ws({ port: 3001 })
  .onOpen(ctx => ctx.send('hello'))
  .onMessage((ctx, data) => ctx.send(data))
  .onClose((ctx, code) => console.log('closed', code))
  .start()
```

---

## Server Builder (chainable)

The object returned by `ws(options)`. Register your handlers here, then call `.start()`.
Every method returns `this` so calls chain naturally.

### `.onOpen(handler)`

Called when a client completes the WebSocket handshake and the connection is open.

```javascript
ws({ port: 3001 })
  .onOpen(ctx => {
    ctx.join('general')
    ctx.send(JSON.stringify({ event: 'connected', id: ctx.id }))
  })
```

**Handler signature:**
```typescript
(ctx: WSContext) => void | Promise<void>
```

**Notes:**
- Auth runs before this handler fires. If auth fails the connection never opens — `onOpen`
  is never called.
- `ctx.userId` is populated here if auth is enabled and a JWT was verified.
- You can call `ctx.close()` inside `onOpen` to immediately reject a connection after
  inspecting it (e.g. custom post-auth checks).

---

### `.onMessage(handler)`

Called for every message received from a client after the connection is open.

```javascript
.onMessage((ctx, data) => {
  if (data.action === 'broadcast') {
    ctx.to(data.room).send(data.text)
  }
})
```

**Handler signature:**
```typescript
(ctx: WSContext, data: any) => void | Promise<void>
```

**Notes:**
- `data` is automatically JSON-parsed if the message is valid JSON. If JSON parsing fails,
  `data` is the raw string.
- Messages that exceed `security.maxPayloadBytes` are dropped before this handler fires.
- Messages dropped by the rate limiter never reach this handler.

---

### `.onClose(handler)`

Called when a client disconnects for any reason — clean close, network drop, idle timeout,
server shutdown, or `ctx.close()`.

```javascript
.onClose((ctx, code, reason) => {
  console.log(`${ctx.id} left with code ${code}: ${reason}`)
  ctx.to('general').send(JSON.stringify({ event: 'user:left', id: ctx.id }))
})
```

**Handler signature:**
```typescript
(ctx: WSContext, code: number, reason: string) => void | Promise<void>
```

**Common close codes:**

| Code | Meaning |
|------|---------|
| `1000` | Normal closure |
| `1001` | Going away (server shutdown) |
| `1006` | Abnormal closure (network drop — no close frame received) |
| `1008` | Policy violation (rate limit, payload too large) |
| `4001`–`4999` | Application-defined codes |

**Notes:**
- `ctx.rooms` is still populated at close time. You can broadcast a leave notification
  from inside this handler.
- `ctx.send()` is a no-op inside `onClose` — the socket is already closing.

---

### `.start()`

Starts the cppws server. Launches the uWebSockets C++ event loop on a background thread,
binds to the configured port, and begins accepting connections.

```javascript
const server = ws({ port: 3001 })
  .onOpen(ctx => ctx.send('hello'))
  .start()
```

**Returns:** [`WebSocketServer`](#websocketserver)

**Notes:**
- Call `.start()` after registering all handlers. Handlers registered after `.start()` are
  ignored.
- Throws synchronously if the port is already in use.
- The returned `WebSocketServer` instance is how you interact with the running server
  (metrics, history, shutdown, etc).

---

## WebSocketServer

The object returned by `.start()`. Your handle on the running server.

```javascript
const server = ws({ port: 3001 }).onOpen(ctx => {}).start()
```

---

### `server.shutdown()`

Gracefully shuts down the server. Sends close code `1001` to every active connection,
waits for them to drain, stops the MetricsCollector, flushes the message batcher, and
terminates the uWS event loop.

```javascript
await server.shutdown()
```

**Signature:**
```typescript
shutdown(): Promise<void>
```

---

### `server.getMetrics()`

Returns a snapshot of all server metrics at the moment of the call. Values come directly
from C++ atomic counters — zero JS overhead.

```javascript
const m = server.getMetrics()
console.log(m.activeConnections)
console.log(m.messagesPerSecond)
```

**Signature:**
```typescript
getMetrics(): WSMetrics
```

**Returns:** [`WSMetrics`](#wsmetrics)

---

### `server.getConnectionCount()`

Returns the number of currently active (open) connections.

```javascript
console.log(server.getConnectionCount()) // e.g. 342
```

**Signature:**
```typescript
getConnectionCount(): number
```

---

### `server.getRooms()`

Returns the [`RoomManager`](#roommanager) instance for the server. Use it to inspect
room membership, list rooms, and get room metadata.

```javascript
const rooms = server.getRooms()
const info  = rooms.getRoomInfo('general')
console.log(info.size) // number of connections in the room
```

**Signature:**
```typescript
getRooms(): RoomManager
```

---

### `server.getHistory(room, sinceTimestamp?)`

Returns broadcast history for a room. Used for reconnection state sync — clients can
request messages they missed while disconnected.

```javascript
const history = server.getHistory('general')
const missed  = server.getHistory('general', Date.now() - 60_000)
```

**Signature:**
```typescript
getHistory(room: string, sinceTimestamp?: number): HistoryEntry[]
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `room` | `string` | — | Room name to query |
| `sinceTimestamp` | `number` | `0` | Only return entries after this Unix ms timestamp. Omit for all entries. |

**Returns:** Array of [`HistoryEntry`](#historyentry)

**Notes:**
- Returns `[]` if history is not enabled (`history: false` in options, which is the default).
- Returns `[]` if the room has no history or all entries predate `sinceTimestamp`.
- History is stored in-memory. It is not persisted across server restarts.

---

### `server.getMetricsCollector()`

Returns the [`MetricsCollector`](#metricscollector) instance. Use it to subscribe to
live metric updates on a polling interval.

```javascript
const collector = server.getMetricsCollector()
const unsub = collector.onMetricsUpdate(m => {
  console.log(`${m.messagesPerSecond} msg/s`)
})

// Later:
unsub()
```

**Signature:**
```typescript
getMetricsCollector(): MetricsCollector
```

---

### `server.getEventBus()`

Returns the internal [`InternalEventBus`](#internal-event-bus) for advanced monitoring.
Use it to listen for rate limit hits, dropped messages, and other internal events.

```javascript
const bus = server.getEventBus()
bus.on('rateLimitHit', ({ connectionId, droppedCount }) => {
  console.warn(`${connectionId} hit rate limit — dropped: ${droppedCount}`)
})
```

**Signature:**
```typescript
getEventBus(): InternalEventBus
```

---

### Server Event Emitter

`WebSocketServer` extends [`TypedEmitter`](#typedemitter) and emits the following events:

```javascript
server.on('connection', ({ connectionId, ip }) => {
  console.log(`new connection: ${connectionId} from ${ip}`)
})

server.on('disconnection', ({ connectionId, code, reason }) => {
  console.log(`disconnected: ${connectionId} (${code})`)
})

server.on('message', ({ connectionId, data }) => {
  // fires for every message from every connection
})

server.on('error', ({ connectionId, error }) => {
  // errors from native layer or handlers
})

server.on('roomBroadcast', ({ room, message }) => {
  // fires for every room broadcast
})

server.on('serverStarted', ({ host, port }) => {
  console.log(`server started on ${host}:${port}`)
})

server.on('serverStopped', ({ reason }) => {
  console.log(`server stopped: ${reason}`)
})
```

See [`ServerEvents`](#serverevents) for the full event map.

---

## WSContext

The object passed to every handler (`onOpen`, `onMessage`, `onClose`). Your primary
interface for interacting with an individual connection.

---

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique connection ID. Format: `conn_{timestamp}_{random}`. |
| `userId` | `string \| undefined` | Authenticated user ID. Populated after auth. `undefined` if auth is disabled or the token had no user ID claim. |
| `ip` | `string` | Client IP address. Reads `X-Forwarded-For`, then `X-Real-IP`, then the raw socket address. |
| `rooms` | `Set<string>` | The set of rooms this connection is currently in. Read-only — use `ctx.join()` and `ctx.leave()` to modify. |
| `jwt` | `object \| undefined` | Decoded JWT payload. Only populated if auth is enabled and a valid JWT was verified. |

---

### `ctx.join(room)`

Add this connection to a room. The connection will receive broadcasts sent to that room.

```javascript
ctx.join('general')
ctx.join('vip').join('announcements') // chainable
```

**Signature:**
```typescript
join(room: string): WSContext
```

**Returns:** `this` (chainable)

**Notes:**
- No-op if already in the room.
- Respects `rooms.maxRoomsPerConnection` if configured.

---

### `ctx.leave(room)`

Remove this connection from a room. The connection stops receiving broadcasts to that room.

```javascript
ctx.leave('general')
```

**Signature:**
```typescript
leave(room: string): WSContext
```

**Returns:** `this` (chainable)

**Notes:**
- No-op if not in the room.

---

### `ctx.leaveAll()`

Remove this connection from all rooms it is currently in.

```javascript
ctx.leaveAll()
```

**Signature:**
```typescript
leaveAll(): WSContext
```

**Returns:** `this` (chainable)

---

### `ctx.send(data)`

Send a message directly to this connection.

```javascript
ctx.send('plain text')
ctx.send({ event: 'connected', id: ctx.id })  // auto JSON-serialized
ctx.send(42)                                   // auto JSON-serialized
```

**Signature:**
```typescript
send(data: any): WSContext
```

**Returns:** `this` (chainable)

**Notes:**
- Objects and arrays are `JSON.stringify`'d automatically.
- Strings are sent as-is.
- Numbers, booleans, and other primitives are `JSON.stringify`'d.
- If the connection's send buffer exceeds `highWaterMark`, the message is dropped and
  `droppedMessages` is incremented. The connection is not closed.
- No-op inside `onClose` — the socket is already closing.

---

### `ctx.emit(event, data)`

Send a typed event to this connection. Wraps `data` in `{ event, data }` and sends it
as JSON.

```javascript
ctx.emit('user:joined', { userId: 'abc123' })
// Client receives: { "event": "user:joined", "data": { "userId": "abc123" } }
```

**Signature:**
```typescript
emit(event: string, data: any): WSContext
```

**Returns:** `this` (chainable)

---

### `ctx.to(room)`

Target a room for broadcasting. Returns a [`RoomSender`](#roomsender).

```javascript
ctx.to('general').send({ text: 'hello everyone' })
ctx.to('general').emit('announcement', { text: 'server restart in 5 minutes' })
```

**Signature:**
```typescript
to(room: string): RoomSender
```

**Returns:** [`RoomSender`](#roomsender)

**Notes:**
- Broadcasts to all connections in the room, including the sender (unless you filter
  by `ctx.id` on the client side).

---

### `ctx.privatelySend(userId, event, data)`

Send a private message to a specific user, identified by their user ID rather than
connection ID.

```javascript
ctx.privatelySend('user-456', 'dm', {
  from: ctx.userId,
  text: 'hey, how are you?',
})
```

**Signature:**
```typescript
privatelySend(userId: string, event: string, data: any): void
```

**Notes:**
- Resolves `userId` to a connection via the internal user-to-connection map.
- If the user is connected to a different server instance, the pub/sub adapter routes
  the message automatically (when a `pubSub` adapter is configured).
- No-op if `userId` is not found and no pub/sub adapter is configured.
- Requires auth to be enabled so connections have a `userId`.

---

### `ctx.close(code?, reason?)`

Disconnect this client. Sends a WebSocket close frame with the given code and reason.

```javascript
ctx.close()                        // code 1000, no reason
ctx.close(4001, 'unauthorized')
ctx.close(1008, 'rate limit exceeded')
```

**Signature:**
```typescript
close(code?: number, reason?: string): void
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `code` | `number` | `1000` | WebSocket close code |
| `reason` | `string` | `''` | Human-readable reason (max 123 bytes per WS spec) |

---

### `ctx.getInfo()`

Returns a snapshot of live connection statistics.

```javascript
const info = ctx.getInfo()
console.log(info.messagesReceived)
console.log(info.rooms)
```

**Signature:**
```typescript
getInfo(): ConnectionInfo
```

**Returns:** [`ConnectionInfo`](#connectioninfo)

---

## RoomSender

The object returned by `ctx.to(room)`. Used to broadcast to a room.

---

### `roomSender.send(data)`

Broadcast a message to all connections in the room.

```javascript
ctx.to('general').send({ event: 'message', text: 'hello' })
ctx.to('general').send('plain text broadcast')
```

**Signature:**
```typescript
send(data: any): void
```

**Notes:**
- Same serialization rules as `ctx.send()`.
- If message history is enabled, this broadcast is stored in the room's history.

---

### `roomSender.emit(event, data)`

Broadcast a typed event to all connections in the room. Wraps `data` in `{ event, data }`.

```javascript
ctx.to('general').emit('user:joined', { userId: ctx.userId })
// Every client in 'general' receives:
// { "event": "user:joined", "data": { "userId": "..." } }
```

**Signature:**
```typescript
emit(event: string, data: any): void
```

---

## RoomManager

Returned by `server.getRooms()`. High-level interface for inspecting room state.

---

### `roomManager.getRoomInfo(room)`

Get metadata about a room.

```javascript
const info = server.getRooms().getRoomInfo('general')
console.log(info.name)         // 'general'
console.log(info.size)         // number of connections
console.log(info.connections)  // string[] of connection IDs
```

**Signature:**
```typescript
getRoomInfo(room: string): RoomInfo
```

**Returns:**
```typescript
interface RoomInfo {
  name: string
  size: number
  connections: string[]
}
```

**Throws:** If the room does not exist.

---

### `roomManager.getRoomSize(room)`

Returns the number of connections currently in the room.

```javascript
const count = server.getRooms().getRoomSize('general')
```

**Signature:**
```typescript
getRoomSize(room: string): number
```

**Returns:** `0` if the room does not exist.

---

### `roomManager.getRoomMembers(room)`

Returns an array of connection IDs currently in the room.

```javascript
const members = server.getRooms().getRoomMembers('general')
// ['conn_1701234567890_abc', 'conn_1701234567891_def', ...]
```

**Signature:**
```typescript
getRoomMembers(room: string): string[]
```

**Returns:** `[]` if the room does not exist.

---

### `roomManager.listRooms()`

Returns an array of all currently active room names (rooms with at least one member).

```javascript
const rooms = server.getRooms().listRooms()
// ['general', 'vip', 'announcements']
```

**Signature:**
```typescript
listRooms(): string[]
```

---

### `roomManager.join(connectionId, room)`

Programmatically add a connection to a room from outside a handler. Useful for
server-initiated room assignments.

```javascript
server.getRooms().join('conn_abc123', 'vip')
```

**Signature:**
```typescript
join(connectionId: string, room: string): void
```

---

### `roomManager.leave(connectionId, room)`

Programmatically remove a connection from a room from outside a handler.

```javascript
server.getRooms().leave('conn_abc123', 'vip')
```

**Signature:**
```typescript
leave(connectionId: string, room: string): void
```

---

### `roomManager.destroy()`

Destroys the room manager, clearing all room state. Called automatically during
`server.shutdown()`. Do not call manually unless you know what you're doing.

**Signature:**
```typescript
destroy(): void
```

---

## MetricsCollector

Returned by `server.getMetricsCollector()`. Polls the C++ atomic counters on an interval
and computes derived metrics like `messagesPerSecond`.

---

### `collector.start(intervalMs?)`

Start the polling interval.

```javascript
collector.start(1000) // poll every second (default)
collector.start(500)  // poll every 500ms
```

**Signature:**
```typescript
start(intervalMs?: number): void
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `intervalMs` | `number` | `1000` | How often to poll, in milliseconds |

---

### `collector.stop()`

Stop the polling interval.

```javascript
collector.stop()
```

**Signature:**
```typescript
stop(): void
```

---

### `collector.isActive()`

Returns whether the collector is currently polling.

```javascript
collector.isActive() // true / false
```

**Signature:**
```typescript
isActive(): boolean
```

---

### `collector.onMetricsUpdate(callback)`

Register a callback that fires every time the collector polls. Returns an unsubscribe
function.

```javascript
const unsub = collector.onMetricsUpdate(metrics => {
  console.log(`${metrics.messagesPerSecond} msg/s`)
  console.log(`${metrics.activeConnections} connections`)
})

// Later, stop listening:
unsub()
```

**Signature:**
```typescript
onMetricsUpdate(callback: (metrics: WSMetrics) => void): () => void
```

**Returns:** An unsubscribe function. Call it to stop receiving updates.

---

### `collector.snapshot()`

Returns the most recent metrics snapshot without waiting for the next poll.

```javascript
const snap = collector.snapshot()
console.log(snap.uptimeMs)
```

**Signature:**
```typescript
snapshot(): WSMetrics
```

---

## TypedEmitter

A generic, fully-typed event emitter. `WebSocketServer` extends it.

---

### `.on(event, handler)`

Register a persistent listener for an event.

```javascript
server.on('connection', ({ connectionId, ip }) => {
  console.log(`${connectionId} connected from ${ip}`)
})
```

**Signature:**
```typescript
on<E extends keyof Events>(event: E, handler: (payload: Events[E]) => void): this
```

---

### `.once(event, handler)`

Register a one-time listener. Automatically removed after the first fire.

```javascript
server.once('serverStarted', ({ host, port }) => {
  console.log(`server ready on ${host}:${port}`)
})
```

**Signature:**
```typescript
once<E extends keyof Events>(event: E, handler: (payload: Events[E]) => void): this
```

---

### `.off(event, handler)`

Remove a specific listener.

```javascript
const handler = ({ connectionId }) => console.log(connectionId)
server.on('connection', handler)
// Later:
server.off('connection', handler)
```

**Signature:**
```typescript
off<E extends keyof Events>(event: E, handler: (payload: Events[E]) => void): this
```

---

### `.emit(event, payload)`

Emit an event manually. Primarily used internally but available if you need it.

```javascript
server.emit('serverStarted', { host: '0.0.0.0', port: 3001 })
```

**Signature:**
```typescript
emit<E extends keyof Events>(event: E, payload: Events[E]): void
```

---

### `.removeAllListeners(event?)`

Remove all listeners for a specific event, or all listeners for all events.

```javascript
server.removeAllListeners('connection') // remove all 'connection' listeners
server.removeAllListeners()             // remove everything
```

**Signature:**
```typescript
removeAllListeners(event?: keyof Events): void
```

---

### `.listenerCount(event)`

Returns the number of listeners registered for an event.

```javascript
server.listenerCount('connection') // 2
```

**Signature:**
```typescript
listenerCount(event: keyof Events): number
```

---

### `.eventNames()`

Returns an array of all event names that have at least one listener registered.

```javascript
server.eventNames() // ['connection', 'disconnection', 'serverStarted']
```

**Signature:**
```typescript
eventNames(): Array<keyof Events>
```

---

## Configuration Reference

### WSOptions

The full configuration object passed to `ws()`.

```typescript
interface WSOptions {
  // ── Required ──────────────────────────────────────────────────────────
  port: number

  // ── Network ───────────────────────────────────────────────────────────
  host?: string               // default: '0.0.0.0'

  // ── Rooms ─────────────────────────────────────────────────────────────
  rooms?: boolean | RoomConfig  // default: false

  // ── Security ──────────────────────────────────────────────────────────
  security?: SecurityConfig

  // ── Compression ───────────────────────────────────────────────────────
  compression?: CompressionConfig

  // ── Pub/Sub (horizontal scaling) ──────────────────────────────────────
  pubSub?: PubSubAdapter

  // ── Timeouts & limits ─────────────────────────────────────────────────
  idleTimeout?: number          // seconds, default: 120
  maxPayload?: number           // bytes, default: 1_048_576 (1MB)
  highWaterMark?: number        // bytes, default: 1_048_576 (1MB)

  // ── History / event sourcing ──────────────────────────────────────────
  history?: boolean | HistoryConfig  // default: false

  // ── Message batching ──────────────────────────────────────────────────
  batching?: boolean | BatchingConfig  // default: false

  // ── TLS ───────────────────────────────────────────────────────────────
  tls?: TLSConfig

  // ── Custom user ID extraction ─────────────────────────────────────────
  extractUserId?: (ctx: any) => string | undefined

  // ── Logger override ───────────────────────────────────────────────────
  logger?: {
    debug: (...args: any[]) => void
    info:  (...args: any[]) => void
    warn:  (...args: any[]) => void
    error: (...args: any[]) => void
  }
}
```

---

### RoomConfig

Passed as `rooms` in `WSOptions`.

```typescript
interface RoomConfig {
  maxRoomsPerConnection?: number    // default: unlimited
  maxConnectionsPerRoom?: number    // default: unlimited
}
```

**Usage:**
```javascript
ws({
  port: 3001,
  rooms: true,                     // enable with defaults
  // or:
  rooms: {
    maxRoomsPerConnection: 10,
    maxConnectionsPerRoom: 5000,
  },
})
```

---

### SecurityConfig

Passed as `security` in `WSOptions`.

```typescript
interface SecurityConfig {
  maxMessagesPerMinute?: number     // per connection, default: 60
  maxPayloadBytes?: number          // per message, default: 1_048_576
  maxConnectionsPerIP?: number      // default: 10
  auth?: AuthConfig
}
```

**Notes:**
- `maxPayloadBytes` is enforced at the C++ layer before the message reaches JS.
- `maxConnectionsPerIP` is checked before auth, preventing token brute-forcing.
- Rate limiting uses a sliding-window algorithm implemented in C++ with zero GC pressure.

---

### AuthConfig

Passed as `security.auth` in `WSOptions`. Authentication runs during the HTTP upgrade
handshake. Failed auth returns `403` — the WebSocket connection is never opened.

```typescript
interface AuthConfig {
  enabled: boolean
  source?: 'query' | 'header' | 'cookie'   // default: 'header'
  fieldName?: string                        // default: 'token'

  // Option A: Custom async validator
  validate?: (token: string) => Record<string, any> | null | Promise<Record<string, any> | null>

  // Option B: Built-in HMAC-SHA256 JWT verification
  secret?: string
}
```

**Source behaviour:**

| Source | Where the token is read from | Client sends |
|--------|------------------------------|--------------|
| `'query'` | URL query parameter `?{fieldName}=` | `ws://host:3001?token=eyJh...` |
| `'header'` | `Authorization: Bearer {token}` header | HTTP upgrade header |
| `'cookie'` | Cookie named `{fieldName}` | Cookie jar |

**Using `validate`:**
```javascript
auth: {
  enabled: true,
  source: 'query',
  fieldName: 'token',
  validate: async (token) => {
    const payload = await myJWTLib.verify(token)
    return payload ?? null  // return null to reject
  },
}
```

**Using built-in JWT (`secret`):**
```javascript
auth: {
  enabled: true,
  source: 'header',
  secret: process.env.JWT_SECRET,
  // verifies HMAC-SHA256 signature + exp claim
  // decoded payload available as ctx.jwt in handlers
}
```

**Custom user ID extraction:**

By default cppws looks for `ctx.jwt.sub`, `ctx.jwt.id`, then `ctx.jwt.userId` to populate
`ctx.userId`. Override with `extractUserId` at the top level of `WSOptions`:

```javascript
ws({
  port: 3001,
  security: { auth: { enabled: true, secret: 'xxx' } },
  extractUserId: (ctx) => ctx.jwt?.username,
})
```

---

### CompressionConfig

Passed as `compression` in `WSOptions`. Uses permessage-deflate, handled at the C++ layer.

```typescript
interface CompressionConfig {
  enabled?: boolean     // default: false
  level?: number        // 0 (fastest) to 9 (best ratio), default: 3
  threshold?: number    // only compress messages >= this many bytes, default: 1024
}
```

**Usage:**
```javascript
ws({
  port: 3001,
  compression: {
    enabled: true,
    level: 6,
    threshold: 512,
  },
})
```

---

### BatchingConfig

Passed as `batching` in `WSOptions`. Coalesces multiple `send()` calls within
`flushInterval` ms into fewer TCP packets.

```typescript
interface BatchingConfig {
  maxBatchSize?: number    // flush after this many messages, default: 50
  flushInterval?: number   // flush every N ms regardless of size, default: 10
}
```

**Usage:**
```javascript
ws({
  port: 3001,
  batching: {
    maxBatchSize: 50,
    flushInterval: 10,
  },
})
// or enable with defaults:
batching: true
```

**Notes:**
- Multiple broadcasts to the same room within one flush window are coalesced into a
  single JSON array.
- Useful for high-throughput scenarios (>1000 broadcasts/sec to the same room).
- Adds up to `flushInterval` ms of latency. Disable for latency-sensitive applications.

---

### HistoryConfig

Passed as `history` in `WSOptions`.

```typescript
interface HistoryConfig {
  maxEntriesPerRoom?: number    // default: 100
}
```

**Usage:**
```javascript
ws({
  port: 3001,
  history: true,                        // enable with defaults (100 entries/room)
  // or:
  history: { maxEntriesPerRoom: 500 },
})
```

**Notes:**
- History is stored in-memory. Not persisted across server restarts.
- Old entries are evicted in FIFO order when `maxEntriesPerRoom` is reached.
- Query via `server.getHistory(room, sinceTimestamp)`.

---

### TLSConfig

Passed as `tls` in `WSOptions`. Enables `wss://` (WebSocket Secure).

```typescript
interface TLSConfig {
  cert: string    // path to PEM certificate file
  key: string     // path to PEM private key file
}
```

**Usage:**
```javascript
ws({
  port: 3001,
  tls: {
    cert: '/etc/ssl/certs/cert.pem',
    key:  '/etc/ssl/private/key.pem',
  },
})
// Clients connect to: wss://yourhost:3001
```

---

### PubSubAdapter

Passed as `pubSub` in `WSOptions`. Enables horizontal scaling across multiple cppws
instances by distributing room broadcasts through an external message bus.

```typescript
interface PubSubAdapter {
  connect():                                           void | Promise<void>
  disconnect():                                        void | Promise<void>
  subscribe(room: string):                             void | Promise<void>
  unsubscribe(room: string):                           void | Promise<void>
  publish(room: string, message: string):              void | Promise<void>
  onMessage?(handler: (room: string, msg: string) => void): void | Promise<void>
  destroy?():                                          void | Promise<void>
}
```

**Redis example:**
```javascript
import { createClient } from 'redis'

const pub = createClient()
const sub = createClient()
await pub.connect()
await sub.connect()

const redisAdapter = {
  async subscribe(room)  { await sub.subscribe(`cppws:${room}`, () => {}) },
  async unsubscribe(room){ await sub.unsubscribe(`cppws:${room}`) },
  async publish(room, message) { await pub.publish(`cppws:${room}`, message) },
  onMessage(handler) {
    sub.on('message', (channel, message) => {
      const room = channel.replace('cppws:', '')
      handler(room, message)
    })
  },
  async destroy() {
    await pub.disconnect()
    await sub.disconnect()
  },
}

ws({ port: 3001, pubSub: redisAdapter }).start()
```

---

## Types & Interfaces

### WSMetrics

Returned by `server.getMetrics()` and `collector.snapshot()`.

```typescript
interface WSMetrics {
  totalConnections:       number   // all-time connections accepted
  activeConnections:      number   // currently open connections
  totalMessagesReceived:  number   // all-time messages received from clients
  totalMessagesSent:      number   // all-time messages sent to clients
  totalBytesReceived:     number   // all-time bytes received
  totalBytesSent:         number   // all-time bytes sent
  droppedMessages:        number   // messages dropped (backpressure or rate limit)
  rejectedConnections:    number   // connections rejected (auth fail, IP throttle)
  uptimeMs:               number   // server uptime in milliseconds
  messagesPerSecond:      number   // computed by MetricsCollector over last interval
  slowClients:            number   // connections currently above highWaterMark
}
```

---

### ConnectionInfo

Returned by `ctx.getInfo()`.

```typescript
interface ConnectionInfo {
  id:               string     // connection ID
  ip:               string     // client IP address
  userId:           string | undefined
  rooms:            string[]   // rooms this connection is currently in
  connectedAt:      number     // Unix ms timestamp of connection open
  lastSeen:         number     // Unix ms timestamp of last message received
  messagesReceived: number     // messages received on this connection
  messagesSent:     number     // messages sent on this connection
  bytesReceived:    number     // bytes received on this connection
  bytesSent:        number     // bytes sent on this connection
}
```

---

### HistoryEntry

Returned in arrays by `server.getHistory()`.

```typescript
interface HistoryEntry {
  messageId:  string   // unique ID for this broadcast
  room:       string   // room the message was broadcast to
  message:    string   // the raw serialized message
  timestamp:  number   // Unix ms timestamp of the broadcast
}
```

---

### ServerEvents

The typed event map for `WebSocketServer`. Used internally by `TypedEmitter`.

```typescript
interface ServerEvents {
  connection: {
    connectionId: string
    ip: string
  }

  disconnection: {
    connectionId: string
    code: number
    reason: string
  }

  message: {
    connectionId: string
    data: any
  }

  error: {
    connectionId: string | null
    error: Error
  }

  roomBroadcast: {
    room: string
    message: string
  }

  serverStarted: {
    host: string
    port: number
  }

  serverStopped: {
    reason: string
  }
}
```

---

## Native Loader

Low-level utilities for checking whether the C++ native addon is active.

---

### `loadNative()`

Load and return the native C++ addon, or the pure-JS mock if the binary is not available.
The result is cached — subsequent calls return the same object.

```javascript
import { loadNative } from 'cppws'

const native = loadNative()
```

**Signature:**
```typescript
function loadNative(): NativeAddon
```

**Notes:**
- You should never need to call this directly in application code.
- Useful for testing and for checking which mode cppws is running in.

---

### `isNativeLoaded()`

Returns `true` if the C++ addon was successfully loaded, `false` if the pure-JS mock
is active.

```javascript
import { isNativeLoaded } from 'cppws'

if (!isNativeLoaded()) {
  console.warn('cppws running in JS mock mode — no native binary found')
}
```

**Signature:**
```typescript
function isNativeLoaded(): boolean
```

---

## Internal Event Bus

Returned by `server.getEventBus()`. Emits internal cppws events for advanced monitoring
and observability. All events are informational — listening to them has no effect on
server behaviour.

```javascript
const bus = server.getEventBus()

bus.on('rateLimitHit', ({ connectionId, droppedCount }) => {
  // A connection exceeded maxMessagesPerMinute
  // The message was dropped, connection stays open
})

bus.on('payloadTooLarge', ({ connectionId, size, limit }) => {
  // A message exceeded maxPayloadBytes
  // The message was dropped
})

bus.on('connectionThrottled', ({ ip, count, limit }) => {
  // An IP exceeded maxConnectionsPerIP
  // The new connection was rejected with 403
})

bus.on('authFailed', ({ connectionId, reason }) => {
  // An auth check failed
  // The connection was rejected with 403
})

bus.on('backpressure', ({ connectionId, bufferSize, highWaterMark }) => {
  // A connection's send buffer exceeded highWaterMark
  // Subsequent sends to this connection are dropped until it drains
})

bus.on('batchFlushed', ({ room, messageCount, byteCount }) => {
  // The message batcher flushed a batch to a room
})
```

---

## Error Handling

cppws does not throw from inside handler callbacks. Errors in your `onOpen`, `onMessage`,
or `onClose` handlers are caught internally, logged via `ernest-logger`, and emitted on
the server's `'error'` event. The connection stays open.

```javascript
server.on('error', ({ connectionId, error }) => {
  console.error(`Handler error on ${connectionId}:`, error)
  // You can choose to close the connection here:
  // server.getRooms().leave(connectionId, ...)
})
```

If you want to close a connection on a handler error, do it explicitly:

```javascript
ws({ port: 3001 })
  .onMessage((ctx, data) => {
    try {
      processMessage(data)
    } catch (err) {
      ctx.send(JSON.stringify({ error: err.message }))
      ctx.close(4000, 'handler error')
    }
  })
  .start()
```

---

## Full Example

Everything in one file.

```javascript
import { ws, isNativeLoaded } from 'cppws'

// Log whether we're running native C++ or the JS mock
console.log(`Native C++ addon: ${isNativeLoaded()}`)

const server = ws({
  port: 3001,
  host: '0.0.0.0',

  rooms: {
    maxRoomsPerConnection: 20,
    maxConnectionsPerRoom: 5000,
  },

  security: {
    maxMessagesPerMinute: 120,
    maxPayloadBytes: 1_048_576,
    maxConnectionsPerIP: 10,
    auth: {
      enabled: true,
      source: 'query',
      fieldName: 'token',
      secret: process.env.JWT_SECRET,
    },
  },

  compression: {
    enabled: true,
    level: 3,
    threshold: 1024,
  },

  batching: {
    maxBatchSize: 50,
    flushInterval: 10,
  },

  history: {
    maxEntriesPerRoom: 200,
  },

  idleTimeout: 120,
  highWaterMark: 1_048_576,
})

.onOpen(async ctx => {
  ctx.join('general')

  // Send missed messages since 60 seconds ago
  const history = server.getHistory('general', Date.now() - 60_000)
  if (history.length > 0) {
    ctx.send(JSON.stringify({ event: 'history', entries: history }))
  }

  ctx.send(JSON.stringify({
    event: 'connected',
    id: ctx.id,
    userId: ctx.userId,
  }))

  ctx.to('general').emit('user:joined', { userId: ctx.userId })
})

.onMessage((ctx, data) => {
  const msg = typeof data === 'object' ? data : {}

  if (msg.action === 'join' && msg.room) {
    ctx.join(msg.room)
    ctx.send(JSON.stringify({ event: 'joined', room: msg.room }))
    return
  }

  if (msg.action === 'leave' && msg.room) {
    ctx.leave(msg.room)
    ctx.send(JSON.stringify({ event: 'left', room: msg.room }))
    return
  }

  if (msg.action === 'broadcast' && msg.room && msg.text) {
    ctx.to(msg.room).send(JSON.stringify({
      event: 'message',
      from: ctx.userId,
      text: msg.text,
      ts: Date.now(),
    }))
    return
  }

  if (msg.action === 'dm' && msg.userId && msg.text) {
    ctx.privatelySend(msg.userId, 'dm', {
      from: ctx.userId,
      text: msg.text,
    })
    return
  }

  if (msg.action === 'ping') {
    ctx.send(JSON.stringify({ event: 'pong', ts: Date.now() }))
    return
  }
})

.onClose((ctx, code) => {
  ctx.to('general').emit('user:left', { userId: ctx.userId })
  console.log(`${ctx.id} disconnected: ${code}`)
})

.start()

// Monitor rate limit hits
server.getEventBus().on('rateLimitHit', ({ connectionId, droppedCount }) => {
  console.warn(`rate limit: ${connectionId} dropped ${droppedCount} messages`)
})

// Live metrics every 5 seconds
const collector = server.getMetricsCollector()
const unsub = collector.onMetricsUpdate(m => {
  console.log(`[metrics] ${m.activeConnections} conn | ${m.messagesPerSecond} msg/s`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  unsub()
  await server.shutdown()
  process.exit(0)
})
```

---

**Built by [Ernest Tech House](https://github.com/Ernest12287)**