# Development Timeline

## Current Status (2026)

All products are under active development. Here's what's being worked on. But let me be honest with you — some of this is aspirational, some is practical, and some might never see the light of day.

---

## Nothing Browser

### ✅ Currently Available
- Core browser with DevTools baked in
- Network/WebSocket/Cookie/Storage capture
- One-click export (Python, cURL, JavaScript)
- YouTube tab (via NewPipe Extractor)
- Plugin system with community registry
- Session management
- Auto-update system
- Fingerprint spoofing

### 🔨 In Development
- Windows native support
- Response body search
- Identity reset UI
- Built-in captcha solver
- Script marketplace
- Headless mode
- Multi-tab session profiles

---

## Nothing Private Browser

### ✅ Currently Available
- Zero telemetry
- Zero session persistence
- Fingerprint spoofing
- WebRTC leak protection
- UA-CH spoofing

### 🔨 In Development
- Ad blocker (network-level, filter-list based)
- Tor routing
- ProtonVPN support

---

## Piggy (Scraper Library)

### ✅ Currently Available
- Navigation & interactions
- Session persistence
- Network capture
- Multi-site parallel
- Human mode
- **exposeFunction (RPC)**
- **intercept.respond**
- **intercept.modifyResponse**
- Built-in API server

### 🔨 In Development
- Global expose
- WebSocket client API
- Real-time streaming
- Enhanced TypeScript types

---

## 🍳 The Three Pillars — Projects I Want to Make

> *All these things I'm planning to make — or will make — are projects I want to build to prove that if you do one thing well, everything is great.*

---

### 1. `nothing-stream` — Streaming Engine

A completely separate library. Not part of Piggy. Pure data streaming.

```typescript
import { saltyaom } from "nothing-engine";

// Core memory allocation
await saltyaom.allocateSpace();

// Open internal port highway
await saltyaom.allocatedSpace.routeToHttp(3000);

// Initiate raw, headless socket hook
await saltyaom.startStream();

// Register namespace stream
await saltyaom.register("siteUrl", "https://web.whatsapp.com");

// Read mutating HTML chunks as they tick past
saltyaom.capturedHtml.find(item => {
    capturedHtml.provideUsWith(text);
});
```

**What it does:** Raw packet streaming. No DOM snapshots. No page loads. Just data as it arrives.

**The honest truth:** This is genuinely almost impossible to make. Streaming HTML and giving a JS script that will be funky and very, very hard. But with code and some waits, everything will be fine.

**Where the idea came from:** I got this idea because I always wanted to run a WhatsApp bot in a tiny Pterodactyl server. And I saw `yt-dlp.exe` streams YouTube. So a YouTube scraper was my insight. Funny, huh?

**The catch:** It's not designed for UI. At all. This will absolutely fail Cloudflare tests.

| Tool | Cloudflare Detection |
|------|---------------------|
| Puppeteer | 💡 A bulb saying "I'm a bot" |
| nothing-stream | 🚢 "What are this? That guide ships to harbour, yah. And it says 'hey Cloudflare, I'm a bot, block me.'" |

This is for sites like WhatsApp. Maybe your own. Or torrent sites. Sites that don't have heavy anti-bot.

---

### 2. `nothing-render` — UI Drawer

A UI drawer that hooks into the streaming engine.

**The honest truth:** This will take ages to make. Why, you might ask?

Well, because I have **zero idea** how to make a streaming engine possible, let alone create an engine to render it. Call me cynical, but that's the reality.

**The reality:** The streaming engine's nature is not to accept any UI rendering engine. Hooking up the rendering engine will be a very, very good game of "please for fucks sake work."

**If we ever make it, here's how hard it will be:**
1. You will have to learn C++
2. Then write code to create the hook between the two
3. There will be docs to write it — but I won't write it in full
4. Then you write code to translate the streams to drawings
5. And write code to tell the engine: "Hey bro, hold up"

This is not plug-and-play. This is duct tape and prayers.

**Call me cynical, but...** naaaaa. I'm not doing it.

---

### 3. `nothing-whatsapp` — WhatsApp Library

Exact replica of `whatsapp-web.js` API — but runs on nothing-browser (Piggy binary), NOT the streaming engine.

**whatsapp-web.js currently:**
```javascript
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', (msg) => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
```

**nothing-whatsapp will be:**
```typescript
import { client, qrcode } from "nothing-whatsapp";

const client = new Client();

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.on("message", (msg) => {
    if (msg.body === "!ping") {
        msg.reply("pong");
    }
});

client.initialize();

// Extra: API route for QR
const waApi = await route("/whatsapp/requestqr");
waApi.on("qr", (qr) => {
    // Send QR to client
});

// We will try to make it so that you wrap the API code in a function like:
await new function(requestqr) = the qr code here;
// Then map the function to the new API route
```

**What's different:**
- We'll pack `qrcode-terminal` directly into the library
- No external QR dependency
- Same API, different engine

**Why not on streaming engine?** Streaming engine is pure data. WhatsApp needs occasional UI (QR codes, login screens). Can't run on stream alone.

**The PR I will open:** I will open a PR to the official `whatsapp-web.js` repo. Pedro Lopez might shut it down. But well, prayer is just that — he thinks about it.

Because it will be way, way better than Puppeteer. And it will mean he will just take care of updating WhatsApp HTML updates — not browser stuff. See the split of work?

**What this means:**
- Same developer experience — zero learning curve
- 30MB RAM instead of 500MB
- 50+ sessions on the same hardware

---

### 4. `nth` — The Nothing Runtime

*One job. Run JS. Fast.*

> *And because I hate Bun. Sorry Jarred Sumner. You are just a joke.*

```bash
nth index.js
```

It doesn't bundle axios. It doesn't have opinions about your project structure. It doesn't try to be a package manager, a bundler, a test runner, or a deployment tool. It runs JS. That's it.

**How it works:**

When you run `nth init default`, nth will create an `nth.json` file. Inside, you'll find about 30 lines of JSON. These are the extra plugins that nth will depend on:

```json
{
  "packageManager": "npm" | "pnpm",
  "userun": false,
  "autocomplete": true,
  "testing": "vitest",
  "http": true
}
```

| Setting | What it does |
|---------|--------------|
| `packageManager` | Choose between npm or pnpm |
| `userun` | If `false`, you don't need to type `nth run index.js` — just `nth index.js` |
| `autocomplete` | Tab completion. Type `nth pigg` and press enter — the script will start `piggy.js` |
| `testing` | Vitest integration |
| `http` | Server-side logic (might just be Elysia baked in — who knows?) |

**Important:** Your file name must be unique, or it will crash horribly with an error: "Can't start — found duplicate files."

**The philosophy:** This runtime will be absolutely pluggable — just not overdone. You can't add `marked` capabilities. Nope. `nth` will make sure your CPU is utilized for that specific task.
 i have been thinking what nth will be and am geting ideas imagine sth like nth index.js together main.py yah it runs js and then calls up python like cocurent kinda thing but it just calls the language runner you can to nth -1 index.js -success -2 main.js -sucess main.ts ths one first runs the-1 code if it fails t stops if it suceeds runs the -2 and it goes on like that then nth will heavily depend on already availablethings ather than runtmes the nthconfig.jsn will look something like 
 nth config {
    package-manager; pnpm:
    tester; vitetest:
    testscript:"your vitetestscript";
    nthbuild :true;
    nthbuildservice: node/bun;

 }
 nthbuild is basaically telling a complex runtime like nodeto run your code but spit out machine language of c++ code whatever the engine releases then it produces one file for yourserver what i mean here is i am thinking this way when you run node index.js the node engine jv8 or whatever compiles your code to machine language or sth i honestly dont know but imagine how servers will love such code that the engine has outputted imagine runing nth build node index.js and then we grab the code the engine releases i have noidea what langit will be but what i know is servers will love it mybe it might not be a great idea but i will try it trust me and all this additions like the --on--success(-sucess) will be plugins ou add to nth nth is a runtime the juices you run nth add plugin on-sucess and t downloads it for you

 and i was sitting just yesterday and i thought what makes brave firefox trustable to sighninwithgoogle button i thought those browsers release specific binaries and google is just being a bitch so i thought nothing-lion(cant use brave you know why), nothing-camera(chrome), nothing-fire(firefox) this are just your "google trusted browser" with pigg comiled in it just think of the level of cloudflare will hate me i mean come on damn it right and when you use nth as your runtime to install them is basically nth replace nth-browser --with nothing-fire(firefox browser) 
this browsers will just have the exact same ui everything same as your normal browser but it will have piggy in it like when you use nothing-browser to scrape you can just swtch to nthing-camera and use chrome to browse and i think that is the best because you can use it normally and gain a reputation score with google then use it for scraping 
## The Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    nothing-whatsapp                         │
│              (WhatsApp API wrapper)                         │
│         Exact replica of whatsapp-web.js API                │
│              Runs on nothing-browser                        │
│                    NOT on streaming engine                  │
├─────────────────────────────────────────────────────────────┤
│                      nothing-render                         │
│                    (UI drawer)                              │
│         Hooks into streaming engine (if it works)           │
│              Will be a nightmare to integrate               │
├─────────────────────────────────────────────────────────────┤
│                      nothing-stream                         │
│                   (Streaming engine)                        │
│         Raw packet ingestion, DOM chunks as they stream     │
│              NOT designed for UI — pure data                │
├─────────────────────────────────────────────────────────────┤
│                    nothing-browser                          │
│                   (C++ QtWebEngine core)                    │
│              Piggy's binary — socket communication          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🪶 Minified Binary (XXX-mini)
*Tiny footprint for simple, unprotected targets.*

A stripped-down Chromium binary in the **50–70 MB range** (no promises), built specifically for sites that don't need heavy evasion. No bells, no whistles — just a lean browser you can ship anywhere. It will be patched like the main binary, but global-scale anti-bot evasion is not its goal. If your target doesn't fight back, this is your binary.

---

## 🪟 Windows 8 Support
*Because Node runs on it, and a scraper server is a scraper server.*

A Piggy build targeting Windows 8 compatibility. Realistically this is useful as a headless server environment rather than a daily driver. Node.js support is the key enabler here — if the runtime runs, Piggy can run.

**And I am making this because** I'm building a system where the host machine is Windows 8. So yeah. I need this.

---

## The Language Problem (for nth)

This is where it gets honest. `nth` wants to be written in the fastest language on the planet, and that's a harder question than it sounds:

- **Assembly** — theoretically the ceiling. Practically a nightmare. Bugs don't just crash your program; they corrupt memory and take everything else down with them. Not impossible, just painful in ways that age you.
- **C++** — the proven choice. Fast, battle-tested, and also boring in a way that makes it hard to stay interested long enough to finish.
- **Rust** — the obvious modern answer. Bun moved from Zig to Rust, which is precisely why it's less appealing. Following Bun's footsteps defeats the point.
- **Zig** — interesting, but Bun abandoned it, which at minimum raises questions.
- **Something else entirely** — the search continues.

The language decision is genuinely open. Speed is non-negotiable. The rest is still being figured out.

---

> *This will take a while. That's fine. The idea is right.*

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*