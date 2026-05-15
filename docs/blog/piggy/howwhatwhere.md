---
title: "Piggy: How, What, Where"
date: 2026-05-15
---

# Piggy: How, What, Where

**Let me chain it up for you.**

---

## How Does Piggy Work?

People keep asking this. So here's the truth.

**Piggy the library does ABSOLUTELY NOTHING important apart from command creation.**

The whole object we export — `piggy` — is just a command factory. It creates a block of commands to send to the browser.

When you do something like:

```typescript
await piggy.amazon.navigate();
```

Here's what actually happens:

1. Piggy creates a JSON array of your command
2. Sends it to the binary over a socket
3. The binary receives it and executes it

That's it. The library is a thin wrapper. A glorified messenger.

```
┌─────────────────┐     Socket      ┌─────────────────────────┐
│   Your Code     │ ──────────────► │  Nothing Browser Binary │
│  piggy.navigate │   JSON command  │  (C++ / Qt6 WebEngine)  │
└─────────────────┘                 └─────────────────────────┘
```

**Why does it feel instantaneous?**

Because Piggy and the binary talk through a **socket** (Unix domain socket or Windows named pipe). Fast. Local. No HTTP overhead.

Unless you're using HTTP mode (available in the headless binary for remote VPS deployment). That's a bit slower, but still fast enough.

---

## The Naming (No Deep Story)

My naming is kinda weird. I know that.

Let me tell you why I chose these names:

**Nothing Browser** — I had absolutely no reason. There's no story behind it. I just thought: "What weird name can someone give to a browser?" Nothing. Then I picked Nothing Browser.

**Piggy** — The original idea was just "Piggy." Full stop. Later it came to me that "piggy" sounds like "piggybacking" a real session. But Piggy does NOT piggyback on any browser. It is essentially a remote control to the binary. It doesn't piggyback on anything.

So piggybacking is not the theme. I just thought it was a funny name.

The Python counterpart will also be called Piggy. Nothing important about that. It's just a good name for an export object. Nothing corporate.

---

## My Dream for Piggy

My dream for Piggy is simple and very structured:

> **I want Piggy to be the best scraping object in the whole OSS community.**

And boy, I will force issues to make it work. Which is essentially why I make things easy to use.

One import. 20 lines. Go.

---

## Why Compare Piggy to Puppeteer?

The thing I can't understand: **Why is Piggy compared to Puppeteer, Playwright, and others?**

Bro, come on. Those are **testing libraries**, not scraping libraries.

I'm not limiting you — use whatever you want. But as of today (v0.0.21), we already beat Puppeteer at absolutely everything that matters for scraping.

| Feature | Piggy | Puppeteer |
|---------|-------|-----------|
| Library size | ~50KB | ~50MB |
| Anti-detection | ✅ Built-in | ❌ Plugins needed |
| Fingerprint spoofing | ✅ DocumentCreation | ❌ Runtime (detectable) |
| Proxy rotation | ✅ Built-in | ❌ Manual |
| WebSocket capture | ✅ Built-in | ❌ Manual |
| Built-in API server | ✅ | ❌ |

**Puppeteer is so darn good at testing YOUR OWN website.** But cracking Amazon using it? That's absolutely impossible.

And please, don't use Piggy for testing — unless you're tired of waiting 7 minutes for Puppeteer to download.

---

## The Golden Rule: Stay Updated

The trick with Piggy is simple:

**Try to be on the latest version of everything — both the binary and the Node.js library.**

But here's the nuance:

### Major Version Bumps (v0.1.21 → v0.2.0)

**MUST update the binary.** I do changes in fingerprint generation in huge bumps. If you don't update, things will break.

### Minor Version Bumps (v0.1.14 → v0.1.15)

**Not a must.** Only update if:

- You want to test new features
- Your current script is working fine — keep it
- You're satisfied with what you have — no pressure

### How to Know You Need to Update

| Error Message | What It Means | Fix |
|---------------|---------------|-----|
| `piggy.<sitename>.somefunction is undefined` | Old library OR old binary | Update both |
| `command unknown error` | Binary has NO idea what instruction you sent | Update binary (tiny bump or major) |

The binary sends "command unknown" errors when you give it an instruction it has 0 idea of. That's your cue.

---

## Summary Table

| Situation | Action |
|-----------|--------|
| Your code works, you're happy | Do nothing. Keep your versions. |
| You want new features | Update library + binary together |
| You get `undefined` errors | Update library first, then binary |
| You get `command unknown` | Update binary immediately |
| Major version bump (v0.1.x → v0.2.x) | **MUST update binary** |
| Tiny patch bump (v0.1.14 → v0.1.15) | Optional |

---

## The Bottom Line

Piggy is simple:

- Thin wrapper over socket commands
- Binary does the heavy lifting
- Stay updated for new features
- Old code keeps working

**One import. 20 lines. Go.**

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*