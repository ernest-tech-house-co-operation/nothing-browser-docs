---
title: "Big News from the Nothing Ecosystem"
date: 2026-06-29
---

# Big News from the Nothing Ecosystem

**Fam. We need to talk.**

June 2026 has been a wild month at Ernest Tech House. Multiple things are happening at
once — some finished, some in theory, some shipping this week. Let's break it all down.

---

## 1. Pipes & Sockets Are Going Legacy

This is the big one.

As of today, Piggy communicates with the Nothing Browser binary through a **named pipe
(Windows) or a Unix domain socket (Linux/macOS)**. That's how commands travel from your
script to the binary. Fast, local, no HTTP overhead.

That communication channel is going legacy when the next binary version drops.

**Why?**

Because of this error:

> 🪟 [Windows — The Pipe Bug (Named Pipe Connection Failure)](https://nothing-browser-docs.pages.dev/guide/piggy/#%F0%9F%AA%9F-windows-the-pipe-bug-named-pipe-connection-failure)

If you've hit this on Windows, you know exactly how frustrating it is. Named pipe
connection failures on Windows are deep in the OS plumbing — not something fixable
with a code patch on our side. I was writing most of my scripts on Windows and hitting
this constantly. It drove me absolutely insane.

So I went into theory mode.

### The New Model: WebSockets

Here's the idea. A named pipe is a 1:1 connection — rigid, OS-specific, fragile on
Windows. A WebSocket is different: it's an open channel that says *"hey, I'm here,
what do you need?"*

The new flow will work like this:

1. User double-clicks the Nothing Browser binary on their machine
2. Binary launches and opens a WebSocket server internally
3. Binary hands you the WebSocket connection config
4. In your script, you pass it to `await piggy.launch()`:

```typescript
await piggy.launch({
  ws: {
    url: 'ws://localhost:PORT',
    // ...config the binary gives you
  }
})
```

5. Everything from that point onwards is exactly the same as today

No pipe. No named pipe hell. No Windows errors that can't be fixed with code.
Just a WebSocket that works identically on every OS.

**One important thing:** this is a theory as of right now. Coding has not started yet.
It will begin once cppws development wraps up (more on that in point 2). The current
named pipe / socket communication is still the active channel — don't go changing
anything in your scripts today.

And don't panic about your existing code. **Old versions of both the library and the
binary will continue working.** Just don't run `npm update` blindly if you're on a
version that's working for you. Stay where you are until you're ready to move.

---

## 2. We're Building a WebSocket Library — cppws

You guessed it. C++ and TypeScript. Because apparently we can't help ourselves.

**cppws** is our native WebSocket server library — uWebSockets at the core, N-API
bindings, TypeScript on top. It started as an Elysia plugin called `elysiajscppws`,
hit a fundamental architectural wall (Bun owns the sockets — long story), and came
out the other side as a proper standalone server that runs alongside any HTTP framework
or none at all.

Full details are already live in the docs:

> 📖 [cppws Documentation](/guide/cppws/cppws)

Timeline: **this Thursday night or the weekend**. That's when the library drops.
The docs and integration guides are already written. The test suite is already passing.
We're just finishing final polish before publishing to npm.

If you're building anything real-time — chat, live dashboards, multiplayer, command
routing between services — cppws is going to be your thing.

---

## 3. Nothing Runtime — First Phase Complete

We don't talk about this one much yet. But it's moving.

The first base of coding for the **Nothing Runtime** is done. Testing hasn't started yet,
but the foundation is solid and it's showing serious potential. This is a longer-horizon
project but the early signs are genuinely exciting.

More details will come when testing begins and we have something concrete to show. For
now: it's real, it's progressing, and the first phase went great.

---

## 4. Ernest Tech House is on YouTube

We have a YouTube channel now.

> 📺 [youtube.com/@ErnestTechHouse](https://www.youtube.com/@ErnestTechHouse)

What's going up there:

- Tutorials on everything we build — Piggy, cppws, Nothing Browser, Nothing Runtime
- Walkthroughs of real scraping scripts
- Some random beats and cool vibes because why not

Subscribe if you want to follow along as we build. We'll be posting regularly.

---

## 5. Official WhatsApp Channel

We're on WhatsApp now too — as a channel, not a group. Privacy matters, so no group chats
where everyone can see each other. Just us posting updates you can read whenever.

> 💬 [Join the WhatsApp Channel](https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U)

Prefer to reach us directly? You can:

- **WhatsApp:** [+254 103 106 336](https://wa.me/254103106336)
- **Email:** [ernesttechhouse@gmail.com](mailto:ernesttechhouse@gmail.com)

We actually respond. Come say hi.

---

## The Quick Summary

| What | Status | When |
|------|--------|------|
| Pipe/socket → WebSocket communication | Theory, not yet started | After cppws ships |
| Old binary + library still works | ✅ Yes | Forever (don't `npm update` if happy) |
| cppws WebSocket library | Final polish | This Thursday/weekend |
| Nothing Runtime first phase | ✅ Done | Testing coming soon |
| YouTube channel | ✅ Live | Now |
| WhatsApp channel | ✅ Live | Now |

---

## Bottom Line

A lot is moving. None of it breaks what you have today. All of it makes tomorrow faster,
more reliable, and available on every OS without Windows pipe nightmares.

Keep your existing scripts running. Follow along on YouTube. And check in on the docs
for cppws this week — that one ships soon.

**One import. 20 lines. Go.**

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*