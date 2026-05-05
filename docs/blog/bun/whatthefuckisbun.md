# What The Fuck Is Bun?

<div style="text-align: right; color: #888; font-size: 14px; margin-bottom: 20px;">
March 4th, 2026
</div>

**Praise where due. Challenge where fair. No respect for hype.**

This review was written on 4th March 2026.

---

## What Is Bun According To You And Me?

Well, to me, bun is a JS runtime.

That's how I knew it. Bun runs JS fast.

Let me put into perspective.

When I was being taught JS, I was introduced to dear old Node. Which was good. I knew Node's way: `npm`, `npx`, `pnpm`. I knew to get anything working: search for the perfect thing to use, then simply `npm i` the thing.

For instance, I want to convert markdown to HTML. I can just do `npm i marked` (yeah it's old, but surprisingly it just works). I use it because npm alone can't do everything.

But on the other hand, there is a kid (bun) trying to chug everything up. And it has tears.

Not gonna lie, I was surprised when I saw there was a bun update that now somehow bun converts MD to HTML.

Like why in the name of Jesus will I use bun's built-in marked when there is VitePress (which these docs and blog are written in)? There is the good old daddy marked. Docusaurus or whatever.

I mean, why?

---

## Bun.image

Then yesterday, bun released a new API: `bun.image`.

I mean, come on. For fucks sake.

There is Sharp. Yes, it is hard to bundle Sharp. We all know that. But there is libuv and they are old, but surprisingly they work way, way better.

Dare me — as of today, you get an error on `bun.image`. Where in the name of alpha nations will you get the answer?

Open your issue in bun's repo. They will float away in the pools of 5k issues bun currently has.

You have no Stack Overflow. You have no Reddit. You just have their docs that are shit.

They just show you how it works. New features are not documented until after a week of an update is made. Like wtf.

So what are you going to do?

Sharp has Reddit posts covering its failures. Its errors. Stack Overflow answers. You cannot get lost.

Bun's features are shallowly undocumented and absolutely unneeded.

For instance, me personally — if I want to convert a JPG or shrink it, I will just do `npm i sharp`. I fix the deps errors. But it works well.

I can't do `bun.image`. No. Never.

It just does not feel right. Because there is a better thing for that job. Something that has been battle-tested, fixed, maintained. And surprisingly, it works.

So why the fuck should I switch?

Less code? Yes.

But imagine in your JS code, if `bun.image` crashes — believe me, because bun is the runtime, everything will crash.

But use Sharp with bun. If Sharp crashes, it just releases an error. Your runtime finds it and displays simple, good errors. With a try-catch and some retries, it will work.

That is the thing. Your script will not die on you.

---

## Bun Is Great? Bun Is Shit?

Bun is great. I love it. I use it.

I was introduced to the Node world, which honestly I love and adore. Is it slow? Hell yeah it is. But does it work? Yes it does.

Is bun fast? Fucking yes it is. Does it work? Yes it does — run your JS fast.

But do the features it implements work? I have never tested them because I don't want to run into hell and have zero way to get back.

Will you trust bun's implementations?

Maybe if it survives 3 years and tutorials come and docs are well written. But before then, I will stick to what works fine.

And currently, that is npm libs and bun to run it. Simple.

---

## For New Students

Maybe for new students that are started and introduced to bun, they might like it.

But for me, bun can never in this world beat Node unless it shapes up what it should do.

Because now, bun being fast has:

- High latency
- Crashes
- Memory leaks everywhere

People are complaining. It is becoming bloat. But Jarred Sumner seems not to care.

Next week you will hear: "Bun now has Elysia built in." Or maybe "Bun can now create PDFs."

Because when a fucking runtime can launch a headless browser (yes, bun can do that unfortunately), what can't it ship in the next release?

---

## The Question

So the question arises:

**What is bun to you?**

- A runtime?
- A bloat?
- A good thing?

Send your responses to: **ernesttechhouse@gmail.com**

Subject: **bun**

---

## Other Posts in This Series

- [Bun Install: The Truth Nobody Wants to Admit](./buninstallmess) — Is bun install really fast?
- [What The Fuck Is Bun?](./whatthefuckisbun) — You are here

---

## Coming Next

- **Is bun install really fast?** — The deep dive into caching, baseline hardware, and conditional speed

---

*Nothing Blog. Part of the Nothing Ecosystem.*

*Built by Ernest Tech House · Kenya · 2026*