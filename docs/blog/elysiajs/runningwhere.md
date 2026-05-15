---
title: "ElysiaJS: Running Where? — How It Detects the Runtime"
date: 2026-05-15
---

# ElysiaJS: Running Where? — How It Detects the Runtime

*(This was analyzed by my brother who likes TS. I like JS. But he is just a magic guy with TS.)*

The next question is:

> **How does Elysia know where it's running and what server API to use?**

That is a quite interesting find and just proves my point — Salty thought through this library/framework so well.

Aight. So check this out.

---

## The Question

How does Elysia know:

- If it's running on Bun?
- If it's running on Deno?
- If it's running on Cloudflare Workers?
- If it's running on Node (the fallback)?

And more importantly — **how does it know what server API to use** for each environment without the developer doing anything?

Two files. Two answers.

---

## File 1: The Runtime Detector (`env.ts`)

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

**Each runtime snitches on itself through a global it exposes exclusively.**

| Runtime | Global | Detection |
|---------|--------|-----------|
| Bun | `globalThis.Bun` | `typeof Bun !== 'undefined'` |
| Deno | `globalThis.Deno` | `typeof Deno !== 'undefined'` |
| Cloudflare Workers | `caches.default` / `WebSocketPair` | `isCloudflareWorker()` |
| Node | None of the above | **Fall through everything — silent** |

**Node isn't even checked.** It's just the fallback. Last man standing.

The `try/catch` on Cloudflare is because some environments actually **throw** when you touch `caches` instead of returning `undefined`. So he wrapped it defensively. He's been burned before.

---

## What Drives What

```
request comes in
      ↓
isBun? → yes → Bun.serve() → native Request → fast path
       → no  → node:http  → ElysiaRequest shim → universal path
```

- `env.ts` drives **what runs** at runtime
- If Bun → use native `Bun.serve()` and real `Request`
- If not Bun → fall back to Node's `http` module and the `ElysiaRequest` shim we looked at earlier

---

## File 2: The Type Bridge (`server.ts`)

This one is the clever part. Look at the bottom:

```ts
export type Serve =
    Equal<BunServe.Options<unknown>, unknown> extends false
        ? BunServe.Options<unknown>   // Bun types exist — use them
        : ServeOptions                // no Bun — use Elysia's own fallback

export type Server =
    Equal<BunServer<unknown>, unknown> extends false
        ? BunServer<unknown>
        : ServerOptions
```

`Equal<A, B>` checks at **compile time** whether Bun's types actually resolved to something real or just collapsed to `unknown`.

| Result | Action |
|--------|--------|
| Bun types are present in the environment | Use the real Bun types (`BunServe.Options`, `BunServer`) |
| Bun types are NOT present | Use Elysia's own fallback types (`ServeOptions`, `ServerOptions`) |

`ServeOptions` is literally just Elysia **documenting what `Bun.serve()` looks like** — by hand, as a fallback.

Same trick as `isBun` — but at the **type level** instead of runtime.

---

## How They Connect

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    │  env.ts (runtime)                           │
                    │  isBun? isDeno? isCloudflareWorker?         │
                    │                                             │
                    └─────────────────────────────────────────────┘
                                      │
                                      │ determines which server runs
                                      ▼
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    │  server.ts (compile time)                   │
                    │  Serve / Server types                        │
                    │  Bun types → use them                       │
                    │  No Bun types → fallback to Elysia's own    │
                    │                                             │
                    └─────────────────────────────────────────────┘
```

| File | Job | When It Runs |
|------|-----|--------------|
| `env.ts` | Detect runtime (Bun, Deno, Cloudflare, Node) | **Runtime** |
| `server.ts` | Make TypeScript types correct for that runtime | **Compile time** |

Two files. One job each.

---

## Why This Matters

SaltyAOM didn't just build a fast framework.

He thought about **every environment** it would ever land in:

- Bun (the target)
- Node (the fallback)
- Deno (the alternative)
- Cloudflare Workers (the edge)

And he made sure the **seams are invisible** to the developer using it.

The developer just writes:

```ts
new Elysia()
    .get("/", () => "Hello World")
    .listen(3000)
```

And it works. Everywhere.

That's not magic. That's **meticulous engineering.**

---

## The Pattern

```
universal/ folder
├── env.ts        → tells you WHERE you are
├── request.ts    → gives you a Request object if you're not on Bun
├── file.ts       → gives you a File object if you're not on Bun
└── server.ts     → makes the TYPES correct for WHERE you are
```

Same pattern across every file:

1. Check the runtime
2. If Bun → use native fast path
3. If not Bun → build a shim
4. Never compute until asked
5. Never import until needed

---

## The Takeaway

ElysiaJS wasn't designed for Node.

It was designed for **Bun**.

Then it was made to work everywhere else — without the developer noticing.

**That's the engineering. That's the craft.**

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*