
# About

## Ernest Tech House

Ernest Tech House is a one-person software outfit based in **Kenya**, building open-source developer tools for people who want to understand how things actually work.

The philosophy is simple: expensive problems deserve cheap solutions. The tools are built for developers running on real hardware — not cloud credits, not enterprise budgets. If it runs on an i3 with 8GB of RAM, it ships.

**Nothing Browser** is one of several projects under the [BunElysiaReact](https://github.com/BunElysiaReact) GitHub organization.

---

## Coded by Pease Ernest

Second-year degree student in Computer Science. Self-described code reader. Ships one version update per project per month. Believes the best way to learn a system is to capture every packet it sends.

- **Email:** [ernesttechhouse@gmail.com](mailto:ernesttechhouse@gmail.com)
- **Discord:** [pease ernest8](https://discord.gg/TUxBVQ7y)
- **GitHub:** [BunElysiaReact](https://github.com/BunElysiaReact)
- **WhatsApp:** [Ernest Tech House Channel](https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U)

---

## On Elysia and SaltyAOM

> **A note on standing on the shoulders of giants** — This section exists because credit matters, and because SaltyAOM deserves more of it than he gets.

### We Use SaltyAOM's Work

Both Nothing Browser and Nothing Private Browser use **Elysia** as the API layer for their scraper/server components. **In your browsers, you will find his images** — because we use his work, and we give credit where it's due.

If a report was sent to us to remove them, we wouldn't hesitate — because credit where it's due, and we stand on the shoulders of giants.

[Elysia](https://elysiajs.com) is a TypeScript web framework for Bun. It is fast — genuinely, measurably, absurdly fast. But speed is not why it matters to this project. What matters is what **SaltyAOM** figured out that nobody else had.

**SaltyAOM** — the solo Thai developer behind Elysia — built something that most framework authors miss entirely: a type system that works *with* you instead of fighting you. Eden Treaty, Elysia's end-to-end type safety layer, means your frontend knows the exact shape of every route on your backend at compile time. No codegen. No OpenAPI. No drift. Just types, flowing from server to client like they were always supposed to.

---

### The Ergonomics

Here is what a full typed API looks like in Elysia:

```typescript
import { Elysia, t } from 'elysia'

const app = new Elysia()
  .get('/health', () => ({ status: 'ok', version: '0.1.3' }))
  .post('/capture', ({ body }) => {
    return { id: crypto.randomUUID(), captured: body.url }
  }, {
    body: t.Object({
      url: t.String(),
      method: t.String()
    })
  })
  .listen(3000)

export type App = typeof app
```

And on the client, with Eden Treaty:

```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

const api = treaty<App>('localhost:3000')

// This is fully typed. No guessing.
const { data } = await api.capture.post({
  url: 'https://api.example.com',
  method: 'POST'
})
```

That `data` object knows its shape. The route path is a property. The body is validated. Wrong type? TypeScript catches it before you run a single line. This is not a feature you turn on — it is just how Elysia works.

---

### What SaltyAOM Solved

Most framework authors think about routing. Some think about middleware. A few think about performance. **SaltyAOM thought about the full developer experience as a system** — and then he built the type inference engine to support it.

The Elysia type system is:
- **Custom-built** — not bolted onto Express or Fastify
- **Inferred** — pulls the full app type from route definitions
- **Exportable** — what makes Eden Treaty possible

He also did this as a solo developer, while the framework ecosystem was largely ignoring Bun. Elysia was built for Bun **before Bun was stable**. That was a bet, and it paid off.

---

### The Respect

Building a framework is thankless. Building one that challenges the dominant paradigm — that says *"no, we don't need to wrap Express, we can do this properly from scratch on a new runtime"* — is harder.

Doing it solo, with the quality and consistency that Elysia ships with, is genuinely impressive.

SaltyAOM is quiet about it. The code speaks. Elysia has over **17,900 GitHub stars** as of 2026 and it earned every one.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   haha                                                                      │
│   nothing browser is just getting started                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Final Words

If you build on Bun, **use Elysia**. If you use Elysia, **read the source** — it will teach you things about TypeScript inference that no tutorial will.

- [elysiajs.com](https://elysiajs.com)
- [GitHub: SaltyAOM/elysia](https://github.com/elysiajs/elysia)

---

*Ernest Tech House · Kenya · 2026*

*Coded by Pease Ernest*
