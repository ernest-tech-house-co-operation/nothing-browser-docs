# Bun Install: The Truth Nobody Wants to Admit

<div style="text-align: right; color: #888; font-size: 14px; margin-bottom: 20px;">
March 4th, 2026
</div>

**Praise where due. Challenge where fair. No respect for hype.**

I did not want to talk about this. But here we go.

---

## The Claim

"Bun install is fast."

Yes. On paper. Benchmark websites. First run after a fresh cache. It trashes npm, pnpm, and yarn. Not a lie.

But what does "fast" actually mean?

When I read "bun install is fast", my brain translated to: "I can install puppeteer in 1 minute instead of 7."

That is what fast means. Right?

**Wrong.**

---

## The Disappointment

Puppeteer still took 7 minutes.

I was utterly disappointed. Like what the fuck is this?

```
$ bun add puppeteer
# 7 minutes later...
# Still waiting.
# WHAT THE FUCK.
```

So I thought: "Naa, give bun another chance, Ernest. My 20mbps network probably lagged during install."

I re-ran the command.

This time it finished fast.

So I was like: "What the fuck :) Was I about to diss something that is actually fast?"

---

## The Math

Bun does something the other package managers don't.

**It caches.**

Not just the packages — the entire build process.

If in 15 years npm never thought of that, I will give bun that praise. Great job.

But here's the thing:

```
First install: 7 minutes (no cache)
Second install: 30 seconds (cached)
Delete cache folder: 7 minutes again
```

So bun is not "fast". Bun just caches aggressively on the first run.

That is where it gets the "fast" tag from.

---

## Fast Means Fast

Exactly. That's the whole point.

Fast means fast. Not "fast after the first time." Not "fast for small packages." Not "fast when the cache exists." Just fast.

If I tell you my car does 0-100 in 3 seconds and then you get in and it takes 40 seconds — I lied to you. Doesn't matter that it did 3 seconds last Tuesday with a warm engine. You experienced 40 seconds. That's the car's speed.

Bun's "fast" is conditional speed. And conditional speed with hidden conditions is just slow with good marketing.

---

## The "npm install axios" Test

Axios takes milliseconds on:

- npm
- pnpm
- bun (cached)
- bun (no cache — same as others)

So if tomorrow morning pnpm adds aggressive caching, what will bun do?

---

## The Discovery That Made Me Angry

Create a local npm package. Random name. Publish to npm.

Run:
```bash
bun add yourpackage
npm i yourpackage
```

Same time. Fine.

Now bump version from `1.0.0` to `1.0.1`. Publish. Wait 5 minutes.

Run:
```bash
bun add yourpackage@latest
```

**Bun will say: "No update."**

npm will update it immediately.

You have to explicitly pass the version number to bun:

```bash
bun add yourpackage@1.0.1
```

Then bun goes: "Nope, I don't have that version? Let me actually fetch it."

Until they fix that, this is the behavior. As of March 4th, 2026, this is my finding.

---

## The Baseline Problem (For Unfortunate People)

I have two machines:

| Machine | Specs |
|---------|-------|
| Lenovo | 16GB RAM, i7 8th gen, 1TB SSD |
| Acer (old) | 8GB RAM, i3 2nd gen, 1TB HDD |

The Acer uses **bun baseline**.

I deleted the bun cache folder. Ran `bun add axios` on the Acer.

**10 minutes.**

Why?

When you run `bun install` on baseline hardware, bun says:

> "Hey brother, fetch the WHOLE BASELINE VERSION, BUILD IT, THEN NOW RUN THE INSTALL."

Like what in the name of mother nature is that?

npm works like butter on my Acer because Node was built on shit hardware. Believe me. Node was made on machines that were already old when they wrote it.

Bun was made on good hardware. It shows.

---

## The Cheeky Side Note

Do you ever use `npm link yourlib` and `npm unlink yourlib`?

Bun has `bun link package-name`. Works fine.

Bun does **not** have `bun unlink`.

But it can spawn a Chromium instance.

Think about that.

This is not a bug. Maybe my baseline doesn't have `bun unlink`. I have never tested on my Lenovo because I love npm and bun was not good on my Acer.

It will be good on Lenovo because that laptop cost me a fortune to buy and I don't want to be buried in it.

---

## Something Good (Sort Of)

Well. It is still shit. But good.

**VS Code integration is nice.** The debugging experience is better than npm. Not by much. But noticeable.

But that's not bun's win. That's the language server protocol.

---

## The Verdict

| Feature | Bun | npm | pnpm |
|---------|-----|-----|------|
| First install speed | Same | Same | Same |
| Cached install speed | Fast | Meh | Meh |
| Baseline hardware | ❌ Broken | ✅ Works | ✅ Works |
| `bun unlink` | ❌ Doesn't exist | ✅ Exists | ✅ Exists |
| Version detection | ❌ Broken | ✅ Works | ✅ Works |
| Spawns Chromium | ✅ Yes | ❌ No | ❌ No |

---

## Should You Use Bun?

**For CI/CD on good hardware?** Yes. The cache is legit.

**For local development on old hardware?** No. You will suffer.

**For production?** Not yet. Wait for the version detection fix.

**For the love of God, test on your actual hardware before committing.**

---

## Final Thought

Bun is not bad. Bun is just... not finished.

The cache is brilliant. The baseline problem is not.

The version detection is broken. The lack of `bun unlink` is weird.

I want bun to win. But right now, it's winning on benchmarks, not on my Acer.

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*
