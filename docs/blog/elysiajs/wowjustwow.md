---
title: "ElysiaJS: Wow. Just Wow."
date: 2026-05-15
---

# ElysiaJS: Wow. Just Wow.

**First, let's start with a round of applause.**

Because someone finally made something good. Something unimaginable. And surprisingly well done.

That is ElysiaJS.

---

## If You Love Express, You Will Love Elysia

That is a fact.

If you were introduced to the world of Express + Axios, you will absolutely adore Elysia.

**But just don't trust it 100%.** Maybe a solid 80%. In my opinion.

Now can we start? Because I have some strong opinions on Elysia and some unfortunate downsides.

---

## What I Will Cover in This Series

I will say this slightly though — I absolutely adore and respect SaltyAOM. You will see why I say that.

So let's start.

---

## What is ElysiaJS?

Have you ever had a sibling that is absolutely fast, silent, does specifically one thing perfectly, and fumbles hell on others?

That is the dear brother ElysiaJS.

According to the docs, it's "an Ergonomic  framework for humans." The meaning of "Ergonomic " — I have zero idea. So let's not go into that.

But Elysia is **pitch perfect for TypeScript users**.

Oh my god. That thing is good. When you write your TS code, brother, you will absolutely love ElysiaJS.

**When you use JS?** Uuum... brother, just forget about the sweet spots of Elysia. Because it will be like you're using fast Express.

---

## My First Concern: How Do JS Users Know Their Types?

I personally hate TypeScript.

Oh my god. I hate that language. That shit screams at everything. Worst of all, it says:

> "Property 'x' does not exist on type 'Y'"

You hover over it. You see:

> "TypeScript can't infer this type" or "Type does not exist in the library"

And the worst part? **The code runs.**

I will get to that when we talk about TypeScript. Because I think TS is just fancy noisy JS. Nothing more.

---

## Who Was ElysiaJS Made For?

That is a broad question. First, we need to understand what it is.

### If you've used Express

You know the guy works. But in 2026 speeds? He is slow.

And dear brother Axios? He just lives day after day. But it works.

### Enter Elysia

It brings:

- **Speed** — fast as hell
- **Type safety** — if you use TS
- **OpenAPI Swagger** — built-in
- **Type definitions** — for TS users only

That is the main point.

**But why TS?** I don't know. Salty himself can answer that.

Are you mad about that? Yes. But there is no way to help us JS lovers.

---

## A Confession

I have been in JS for over 4 years. I love that language. (Been diving into C++ recently too. I love JS.)

I use JS always.

But we are going into a world where I think JS will lose something. TypeScript feels like it will take over. Maybe JavaScript will get its own server, or a plug-and-add in the language.

That language (JS) was developed in 10 days by a guy who wanted web stuff. I think I forgot — I failed that question in my exam. So don't judge.

But that is the whole point of TS.

---

## Do I Use ElysiaJS?

Oh hell yes.

That shit is fast. Chugs requests like a pro.

**But note:** That is with Bun.

With Node? Uuum... you might click several times. But yeah, you will get the hang of it.

### Side Note

I write TS as JS. I don't care about the lines that come under my code as long as when I press `.` I get data in front. Full stop. And it works.

My TS code is messy. When I finish, I just change the extension to `.js` and go.

---

## Can ElysiaJS Be Made for JS Users?

Well... no.

No HTTP library has favored JS in this world. Because JS does not have a JS server. I will look at that. But I don't know the source code for JS. Where is it? I just find it.

---

## What Did ElysiaJS Do Right?

This is based on version **1.4.28**.

I know Elysia 2 drops in about 2 months. TypeBoxes added. In short, all TS additions from TS 6 will be in Elysia 2. Waiting to document that — I will talk about the things to be added according to Salty's X posts.

---

## Where the Speed Lives

To actually understand where the speed lives, we need to look at a cheeky little file sitting in `src/universal/request.ts`.

The word **universal** is the tell.

This is not Elysia's Bun path. This is the Node/WinterCG compatibility shim. A fake `Request` object that mimics the Web Standard `Request` API without actually being one.

### On Bun

`Bun.serve()` hands you a real native `Request`. This class is never touched.

### On Node

There is no native `Request`. So Elysia builds one itself. This is it.

---

## The Constructor

The constructor is the only eager part. URL gets extracted immediately because the router needs it to do its job.

Everything else — headers, signal, body — is deferred. Just primitive copies. No object allocation.

```ts
constructor(private input: RequestInfo, private init?: RequestInit) {
    if (typeof input === 'string') this.url = input
    else if (input instanceof URL) this.url = input.href
    else if (input instanceof Request) this.url = input.url
    else throw new TypeError('Invalid url')

    if (init) {
        if (init.method) this.method = init.method
        if (init.keepalive) this.keepalive = init.keepalive
        // ... scalar copies only
    }
}
```

---

## Lazy Headers

Headers are lazy and cached. The `Headers` object does not exist until something actually reads it. Once built, it is stored in `_headers` and never rebuilt.

```ts
private _headers: Headers | undefined

get headers() {
    if (this._headers) return this._headers
    if (!this.init?.headers) return (this._headers = new Headers())
    // ... build once, cache forever
}
```

---

## Lazy AbortSignal

Same story for `AbortSignal`. `AbortController` is expensive. Most requests never abort. So it is never created unless accessed.

```ts
get signal() {
    if (this._signal) return this._signal
    return (this._signal = new AbortController().signal)
}
```

---

## The Body

The getter kills GET and HEAD requests at the door — by spec they carry no body, so it returns `null` immediately.

For everything else, it wraps the raw input in a `ReadableStream` without copying it where possible:

- `ArrayBuffer` gets enqueued by reference
- `Blob` calls its native `.stream()`
- `DataView` hands over `.buffer` directly

```ts
get body(): ReadableStream | null {
    if (this.method === 'GET' || this.method === 'HEAD' || !this.init?.body)
        return null

    if (body instanceof ReadableStream) return body          // pass-through
    if (body instanceof ArrayBuffer)
        return new ReadableStream({ start(c) { c.enqueue(body); c.close() } })
    if (body instanceof Blob) return body.stream()           // native, free
    if (body instanceof DataView)
        return new ReadableStream({ start(c) { c.enqueue(body.buffer); c.close() } })
    // ...
}
```

---

## The JSON Shortcut

Most JSON APIs never even touch `.body`. They call `.json()` directly, which short-circuits straight to the raw `init.body` before a stream is ever involved.

```ts
async json() {
    if (typeof this.init?.body === 'string')
        return JSON.parse(this.init.body)  // zero work — already a string

    if (this.init?.body instanceof ArrayBuffer)
        return JSON.parse(Buffer.from(this.init.body).toString())

    return JSON.parse(Buffer.from(await this.arrayBuffer()).toString())
}
```

---

## The Classic Comment

And at the very bottom, this comment:

```ts
// @ts-ignore this is intentional, it works
return Buffer.from(Buffer.concat(chunks)).toString()
```

**SaltyAOM knows TypeScript is unhappy** about `Buffer.concat` receiving `Uint8Array[]`. He does not care.

It works at runtime because `Uint8Array` is structurally compatible with what `Buffer.concat` actually needs.

**Classic.**

---

## The Philosophy

The whole philosophy of this file is one line:

> **Never allocate. Never compute. Never parse — until the route handler actually asks for it.**

On Bun, this file barely matters. Bun's native `Request` already does this at the C level.

This file exists so Node does not completely embarrass itself.

*(This analysis was done by my brother who likes TS. I like JS. But he is just a magic guy with TS.)*

---

## Next Questions

The next questions are:

1. How does Elysia know where it's running and what server API to use?
2. That is quite an interesting find and just proves my point — Salty thought through this library/framework so well.

**Elysia. Wow. Just wow.**

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*