---
title: "ElysiaJS: Type Index — Coming Soon"
date: 2026-05-15
---

# ElysiaJS: Type Index — Coming Soon

**The reason I hate TypeScript?**

I'll get to that.

But first — this file. `type-system/index.ts`.

It uses `@sinclair/typebox`. I don't know why, but that lib is so troublesome with ElysiaJS internals.

I actually considered not reviewing this file.

But I feel like I have to.

---

## Coming Soon

This post is being written.

The TypeBox integration. The inference magic. The reason Elysia's autocomplete is so good — and the cost of that magic.

**What you'll learn:**

- How `@sinclair/typebox` works (and why it's problematic)
- How Elysia bridges TypeBox to runtime validation
- Why type safety comes at a complexity cost
- The parts of Elysia that scare me as a JS developer

---

## Preview

```ts
// This is beautiful
new Elysia()
    .post("/user", ({ body }) => body, {
        body: t.Object({
            name: t.String(),
            age: t.Number()
        })
    })

// But this is what happens under the hood
// (spoiler: it's complicated)
```

---

## Why I'm Hesitant

`@sinclair/typebox` is powerful. But it's also:

- **Verbose** — compared to Zod or Valibot
- **TypeScript-first** — JS users get almost nothing
- **Tightly coupled** — changes in TypeBox can break Elysia

SaltyAOM made it work. But I want to understand **how** — and whether it was worth it.

---

## The Promise

I will finish this review.

I will tell you:

1. What `type-system/index.ts` actually does
2. Why TypeBox was chosen over Zod
3. The tradeoffs Elysia made for perfect type safety
4. Whether JS users should care

**Coming soon. Stay tuned.**

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*