---
title: "ElysiaJS: The universal/ Folder — Full Breakdown"
date: 2026-05-15
---

# ElysiaJS: The universal/ Folder — Full Breakdown

This folder is Elysia's portability layer. Every file in it exists to answer one question:

> **How does a Bun-first framework run everywhere else without the developer noticing?**

SaltyAOM's answer is to isolate all runtime-specific behavior into one place and expose a single clean interface to the rest of the framework.

That's `universal/`.

---

## The Pattern

The pattern across every single file is identical:

1. **Check the runtime**
2. **If Bun** → use the native fast path
3. **If not Bun** → build a shim that behaves identically from the outside
4. **Never compute anything until it's asked for**
5. **Never import anything until it's needed**

That's the folder. Six files. One job. Done invisibly.

```
universal/
├── env.ts       — detects the runtime at startup
├── types.ts     — web standard type contracts
├── request.ts   — ElysiaRequest: fake Request object for Node/WinterCG
├── file.ts      — ElysiaFile: fake BunFile for Node with ReadStream fallback
├── server.ts    — Serve/Server type bridge
└── index.ts     — barrel re-export
```

---

## `env.ts` — Runtime Detection

```ts
export const isBun = typeof Bun !== 'undefined'
export const isDeno = typeof Deno !== 'undefined'

export function isCloudflareWorker() {
    try {
        if (typeof caches !== 'undefined' && typeof caches.default !== 'undefined')
            return true
        if (typeof WebSocketPair !== 'undefined') return true
    } catch {
        return false
    }
    return false
}
```

**The entry point of the whole system.**

Each runtime snitches on itself through a global only it exposes:

| Runtime | Global |
|---------|--------|
| Bun | `globalThis.Bun` |
| Deno | `globalThis.Deno` |
| Cloudflare Workers | `caches.default` / `WebSocketPair` |
| Node | None of these — silent fallback |

The `try/catch` on Cloudflare isn't paranoia — some environments actively throw when you touch `caches` instead of returning `undefined`. He wraps it because he's been burned.

**Node isn't checked at all.** It is the `else` branch that was never written.

---

## `types.ts` — Web Standard Contracts

No runtime behavior. Pure TypeScript. Two jobs:

### Job 1: Port the Fetch API spec as TypeScript types

For environments that don't have them natively:

```ts
export type BodyInit =
    | ArrayBuffer
    | AsyncIterable<Uint8Array>
    | Blob
    | FormData
    | Iterable<Uint8Array>
    | NodeJS.ArrayBufferView
    | URLSearchParams
    | null
    | string

export type RequestCache = 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload'
// ... and so on
```

### Job 2: Define abstract contracts for shim classes

```ts
export abstract class WebStandardRequest implements BodyMixin {
    abstract readonly cache: RequestCache
    abstract readonly credentials: RequestCredentials
    abstract readonly headers: Headers
    abstract readonly method: string
    abstract readonly url: string
    abstract readonly body: ReadableStream | null
    // ...
}

export abstract class WebStandardResponse implements BodyMixin {
    abstract readonly status: number
    abstract readonly ok: boolean
    abstract readonly headers: Headers
    // ...
}
```

These are the shapes. `ElysiaRequest` in `request.ts` says `implements WebStandardRequest` — this is what that means.

**Credit:** SaltyAOM didn't write these from scratch. He borrowed MIT-licensed definitions from `undici-fetch` and `node-fetch` and adapted them.

---

## `request.ts` — The Node Request Shim

**This is the most important file in the folder.**

| Runtime | What you get |
|---------|--------------|
| Bun | `Bun.serve()` hands you a real native `Request` — this class is never instantiated |
| Node | No native `Request` — Elysia builds one itself |

The entire philosophy of this class:

> **Never allocate. Never compute. Never parse — until the route handler actually asks for it.**

### Constructor — the only eager work

```ts
constructor(private input: RequestInfo, private init?: RequestInit) {
    // URL is extracted immediately — router needs it
    if (typeof input === 'string') this.url = input
    else if (input instanceof URL) this.url = input.href
    else if (input instanceof Request) this.url = input.url
    else throw new TypeError('Invalid url')

    // only scalar copies — zero object allocation
    if (init) {
        if (init.method) this.method = init.method
        if (init.keepalive) this.keepalive = init.keepalive
        if (init.signal) this._signal = init.signal
        // ...
    }
}
```

URL is the only thing computed upfront because **routing cannot happen without it.** Everything else waits.

### Headers — lazy and cached

```ts
private _headers: Headers | undefined

get headers() {
    if (this._headers) return this._headers          // already built? return it
    if (!this.init?.headers) return (this._headers = new Headers())  // nothing? empty, cached
    // ... build once from whatever shape was passed in
}
```

`Headers` object is allocated **exactly once**, then stored. If a route never reads headers, **zero allocation ever happens.**

### Signal — lazy and cached

```ts
private _signal: AbortSignal | undefined

get signal() {
    if (this._signal) return this._signal
    return (this._signal = new AbortController().signal)
}
```

`AbortController` is relatively expensive. Most requests never abort. So it is never created unless something actually accesses `.signal`.

### Body — the main event

```ts
get body(): ReadableStream | null {
    // GET and HEAD carry no body by spec — kill it immediately
    if (this.method === 'GET' || this.method === 'HEAD' || !this.init?.body)
        return null

    const body = this.init.body

    if (body instanceof ReadableStream) return body           // pass-through, zero work
    if (body instanceof ArrayBuffer)
        return new ReadableStream({
            start(controller) { controller.enqueue(body); controller.close() }
        })                                                    // enqueues by reference, no copy
    if (body instanceof Blob) return body.stream()            // native stream, free
    if (typeof body === 'string')
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(body))
                controller.close()
            }
        })
    if (body instanceof DataView)
        return new ReadableStream({
            start(controller) { controller.enqueue(body.buffer); controller.close() }
        })                                                    // .buffer is the raw ArrayBuffer — no copy
    if (Symbol.iterator in body)
        return new ReadableStream({
            start(controller) {
                for (const chunk of body) controller.enqueue(chunk)
                controller.close()
            }
        })
    if (Symbol.asyncIterator in body)
        return new ReadableStream({
            async start(controller) {
                for await (const chunk of body) controller.enqueue(chunk)
                controller.close()
            }
        })

    return null
}
```

The body getter handles every possible input shape and normalizes it to a `ReadableStream`.

**Zero-copy where possible:**
- `ArrayBuffer` and `DataView` enqueue their underlying buffer **by reference, not by value**
- `ReadableStream` passes through untouched
- `Blob` calls its native `.stream()` — free

The whole thing only runs when `.body` is accessed. **Most JSON endpoints skip it entirely.**

### Parse methods — short-circuit chains

```ts
async json() {
    if (typeof this.init?.body === 'string')
        return JSON.parse(this.init.body)        // already a string — zero work

    if (this.init?.body instanceof ArrayBuffer)
        return JSON.parse(Buffer.from(this.init.body).toString())

    return JSON.parse(Buffer.from(await this.arrayBuffer()).toString())
}

async text() {
    if (typeof this.init?.body === 'string') return this.init.body  // literally free

    if (this.init?.body instanceof ArrayBuffer)
        return Buffer.from(this.init.body).toString()

    const buffer = await this.arrayBuffer()
    return Buffer.from(buffer).toString()
}
```

Each method checks the **cheapest path first** and falls through only when necessary.

A string body calling `.json()` **never touches a stream or buffer.**

### The honest comment at the bottom

```ts
// @ts-ignore this is intentional, it works
return Buffer.from(Buffer.concat(chunks)).toString()
```

TypeScript is unhappy about `Buffer.concat` receiving `Uint8Array[]`. SaltyAOM knows.

It works at runtime because `Uint8Array` is structurally compatible with what `Buffer.concat` actually needs. He suppresses it and moves on.

**This is the philosophy of the whole file in one line:** runtime correctness over type-checker happiness.

---

## `file.ts` — The Node File Shim

Same pattern as `request.ts` but for file serving.

| Runtime | What you get |
|---------|--------------|
| Bun | `Bun.file()` — native lazy file handle, nothing read until consumed |
| Node | `ReadStream` fallback |

```ts
constructor(public path: string) {
    if (isBun) this.value = Bun.file(path)   // native, lazy, fast
    else {
        // lazy-load fs — don't import at module level
        const fs = process.getBuiltinModule('fs')
```

He uses `process.getBuiltinModule` instead of a static `import fs from 'fs'` because a top-level import would break in browser and Cloudflare environments that don't have `fs`. The module only loads when you're actually on Node and actually serving a file.

### Four defensive exit checks

```ts
if (typeof window !== 'undefined') { console.warn(...); return }    // browser — bail
if (typeof process === 'undefined') { warnMissing(); return }       // no process — bail
if (!fs) { warnMissing(); return }                                  // no fs — bail
if (typeof fs.createReadStream !== 'function') { warnMissing(); return }  // no stream — bail
```

Only after passing all four does it create the stream:

```ts
// Readstream can be only read once
// IIFE to ensure it's created immediately
this.value = (() => createReadStream(path))()
this.stats = stat(path)
```

The IIFE comment matters. Node `ReadStream` is **single-use** — unlike `BunFile` which is re-readable. It's created immediately so it's ready when the handler fires, not lazily like everything else in this folder.

### The mime table

The `mime` lookup table maps file extensions to content-type strings. Two entries in it are worth noting:

```ts
xlsx_OLD: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
'3gp_DOES_NOT_CONTAIN_VIDEO': 'audio/3gpp',
```

These keys will never match a real file extension. SaltyAOM left **notes-to-self inside the key names** instead of separate comments. Dead entries, but they tell you why the other keys exist.

---

## `server.ts` — The Type Bridge

Handles the **compile-time** equivalent of what `env.ts` handles at **runtime** — making sure TypeScript knows the correct server types regardless of environment.

```ts
export type Serve =
    Equal<BunServe.Options<unknown>, unknown> extends false
        ? BunServe.Options<unknown>    // Bun types resolved — use them
        : ServeOptions                 // Bun absent — use Elysia's fallback

export type Server =
    Equal<BunServer<unknown>, unknown> extends false
        ? BunServer<unknown>
        : ServerOptions
```

`Equal<A, B>` checks at compile time whether `BunServe.Options<unknown>` resolved to a real type or collapsed to `unknown`.

| Result | Action |
|--------|--------|
| Bun's types are present | Use the real Bun types |
| Bun's types absent | Fall back to Elysia's own `ServeOptions` |

`ServeOptions` is Elysia's **hand-written description** of what `Bun.serve()` looks like — a spec-by-hand fallback so the rest of the framework types correctly even when `@types/bun` isn't installed.

---

## `index.ts` — The Barrel

```ts
export { env } from './env'
export { file } from './file'
export type { ErrorLike, GenericServeOptions, Serve, ServeOptions, Server, ... } from './server'
```

Nothing to analyze. Re-exports everything so the rest of Elysia imports from `'./universal'` as a single surface instead of reaching into individual files. **Standard folder hygiene.**

---

## The Full Picture

```
universal/
├── env.ts       — detects the runtime at startup (isBun, isDeno, isCloudflareWorker)
├── types.ts     — web standard type contracts (WebStandardRequest, WebStandardResponse)
├── request.ts   — ElysiaRequest: fake Request object for Node/WinterCG
├── file.ts      — ElysiaFile: fake BunFile for Node with ReadStream fallback
├── server.ts    — Serve/Server type bridge so types work with or without @types/bun
└── index.ts     — barrel re-export
```

**The pattern across every single file is identical:**

1. Check the runtime
2. If Bun → use the native fast path
3. If not Bun → build a shim that behaves identically from the outside
4. Never compute anything until it's asked for
5. Never import anything until it's needed

That's the folder. Six files. One job. **Done invisibly.**

---

## The Takeaway

SaltyAOM didn't write Elysia for Node. He wrote it for Bun. Then he made it work everywhere else by building a compatibility layer so thin you don't notice it's there.

**Runtime correctness over type-checker happiness.**
**Lazy everything.**
**Shim only when you have to.**

That's `universal/`.

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*