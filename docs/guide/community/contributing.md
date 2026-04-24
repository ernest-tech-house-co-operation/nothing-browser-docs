# Contributing

First off — thank you for wanting to contribute to Nothing Browser. This project exists because people like you care about open source.

But let me be straight with you about how things work around here.

---

## The Hard Truth

I'm a solo developer. I have limited time. I'm very picky about what goes into the codebase.

**90% of PRs will be merged easily if they fix a bug.** Typos? Merge. Broken link? Merge. Memory leak fix? Merge. Documentation improvement? Merge.

**New features? That's a different conversation.**

---

## PR Response Time

I live in **Kenya (East Africa Time - EAT)** . I work on Nothing Browser during night hours after my day job.

| Action | Response Time |
|--------|---------------|
| PR opened | 14-20 hours (next night session) |
| PR reviewed | 14-20 hours |
| PR merged or closed | 14-20 hours |
| Issue opened | 14-20 hours |

**Don't expect instant responses.** I'll get to it when I get to it. Usually the same night or the next.

If you haven't heard back in 48 hours, ping me on Discord.

---

## For Nothing Browser (UI): C++ Knowledge Required

The Nothing Browser UI is written in **C++ using Qt6 WebEngine**. It **breaks easily**.

### ⚠️ Please Know C++ Before Modifying

```cpp
// This looks innocent but WILL crash
QString* ptr;  // Uninitialized pointer
ptr->append("hello");  // BOOM 💥

// This ALSO looks innocent but WILL leak memory
QWebEngineProfile* profile = new QWebEngineProfile();
// Forgot to delete? Memory leak.
```

**If you don't know C++:**

- Don't touch the `core/` directory
- Don't touch `engine/` directory
- Don't touch `fingerprintspoofer.cpp`
- Don't touch `interceptor.cpp`
- Don't touch `networkcapture.cpp`

Stick to documentation, examples, or the TypeScript Piggy library.

**If you do know C++:** Great! But test thoroughly. Run `make` and ensure no warnings. Run the browser for an hour. Check for memory leaks with Valgrind.

---

## DO NOT TOUCH These Files (Serious Ones)

These files are **critical** to browser functionality. Touch them = instant reject.

### 🚫 Absolute Forbidden (Nothing Browser UI)

| File | Reason |
|------|--------|
| `core/engine/fingerprintspoofer.cpp` | Core fingerprinting logic. One mistake = detectable. |
| `core/engine/fingerprintspoofer.h` | Same as above. |
| `core/engine/identitygenerator.cpp` | Session identity generation. Breaks fingerprint consistency. |
| `core/engine/identitygenerator.h` | Same as above. |
| `core/engine/interceptor.cpp` | Network interception. Easy to break all requests. |
| `core/engine/networkcapture.cpp` | Capture logic. Can miss requests. |
| `core/tabs/youtubetab.cpp` | YouTube bridge. Complex Java integration. |

### Why These Are Forbidden

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Fingerprint Spoofer                                                        │
│                                                                             │
│  One wrong line = browser becomes detectable.                               │
│  One wrong offset = canvas fingerprint unique.                              │
│  One wrong WebGL param = GPU fingerprint leaks.                             │
│                                                                             │
│  Please. Give us a break. Don't touch it.                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**If you send a PR touching these files, I will close it without reviewing.** No exceptions.

---

## ✅ Acceptable PRs for Nothing Browser UI

### UI Changes (Merge Fast)

| Change | Status | Example |
|--------|--------|---------|
| Tab styling | ✅ Merge | More curved tabs, different colors |
| Window decorations | ✅ Merge | Title bar, buttons, borders |
| Icon updates | ✅ Merge | Better icons, SVG improvements |
| Font adjustments | ✅ Merge | Readability improvements |
| Layout tweaks | ✅ Merge | Better spacing, alignment |
| Dark/light mode fixes | ✅ Merge | Theme improvements |
| Keyboard shortcuts | ✅ Merge | New shortcuts, fixes |

**If you make the tabs more curved?** Yeah, ok, we'll merge it.

> **Note:** Qt CSS is a different version of CSS. Test your changes thoroughly.

### Bug Fixes (Merge Fast)

| Change | Status |
|--------|--------|
| Memory leaks | ✅ Merge |
| Crash fixes | ✅ Merge |
| Connection issues | ✅ Merge |
| UI glitches | ✅ Merge |
| Typos in UI text | ✅ Merge |

### Documentation (Merge Instant)

| Change | Status |
|--------|--------|
| Typos | ✅ Merge |
| Broken links | ✅ Merge |
| Missing examples | ✅ Merge |
| Clarifications | ✅ Merge |

---

## For Nothing Private Browser: UI Changes Only

Nothing Private Browser has a **very strict rule**: No settings. No toggles. No configuration UI.

### ✅ Acceptable PRs for Private Browser

| Change | Status |
|--------|--------|
| Tab styling | ✅ Merge |
| Window decorations | ✅ Merge |
| Icon updates | ✅ Merge |
| Font adjustments | ✅ Merge |
| Layout tweaks | ✅ Merge |

### ❌ NOT Acceptable for Private Browser

| Change | Status | Reason |
|--------|--------|--------|
| **Adding settings UI** | 🚫 100% denied | No toggles. Ever. |
| **Privacy controls** | 🚫 Denied | Privacy is already enabled |
| **Configuration dialogs** | 🚫 Denied | No settings to configure |
| **Feature toggles** | 🚫 Denied | Use regular Nothing Browser |

---

## For Piggy Library (TypeScript)

### ✅ Acceptable PRs

| Change | Status |
|--------|--------|
| Bug fixes | ✅ Merge |
| TypeScript type improvements | ✅ Merge |
| Documentation | ✅ Merge |
| New features (with binary change) | 🤷 Depends |

### ❌ NOT Acceptable for Piggy

| Change | Status | Reason |
|--------|--------|--------|
| `human/index.ts` changes | 🚫 100% denied | Human mode finely tuned |
| New features without binary | 🚫 Denied | Binary must support it first |
| Replace Elysia with Express | 🚫 Denied | Elysia stays |

---

## 🌍 Creating a Community Language Library

Want to use Piggy from Python, Go, Java, Rust, or any other language? **You can create your own library!**

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMUNITY LANGUAGE LIBRARIES                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Official (TypeScript/Bun)  →  Maintained by Ernest Tech House             │
│                                                                             │
│   Community (Python/Go/Java/Rust/etc.)  →  Maintained by YOU                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ⚠️ Important: You Must Maintain It

**I will not code the Python version. Or the Go version. Or any other language version.**

If you create a community library:

- ✅ **You maintain it** — bug fixes, updates, documentation
- ✅ **You keep it up to date** — when Piggy adds new features, you add them
- ✅ **You handle issues** — users will come to you

### 🐍 Special Note About Python

**If a high-quality Python wrapper emerges from the community, Ernest Tech House will not create an official Python client.**

We believe in community-driven development. If you build a good Python wrapper:

- ✅ We will feature it prominently in our README
- ✅ We will recommend it to Python users
- ✅ We will send TypeScript users your way for Python questions
- ❌ We will not compete with you by building our own

**This applies to any language.** If the community builds and maintains a solid wrapper, we focus our limited time elsewhere.

### How to Get Your Library Accepted

1. **Open an issue** in the [original Piggy GitHub repo](https://github.com/BunElysiaReact/nothing-browser/issues)
2. **Show us every API you implemented working** — provide proof (screenshots, videos, or test output)
3. **Leave a way for further communication** — GitHub, Discord, email, whatever
4. **We chat** — discuss any questions
5. **We accept** — your library gets listed in our README

### Requirements

| Requirement | Detail |
|-------------|--------|
| **No age cap** | Anybody anywhere can create a library |
| **No permission needed** | Just open an issue and show your work |
| **Must maintain** | Keep it updated or it gets deprecated |
| **Dot notation** | Retain dot notation sounding — no hell function names |

### Dot Notation Rule

```python
# ✅ Good - dot notation
site.navigate()
site.click("#button")
site.evaluate("() => document.title")

# ❌ Bad - hell function names
navigate_site_function()
click_the_button_please()
do_the_evaluate_thing()
```

**Keep it consistent with the original Piggy API.** Users should feel at home switching between languages.

### Deprecation Policy

Your library may be deprecated if:

| Reason | Grace Period |
|--------|--------------|
| **Few updates** (inactive for 6+ months) | 30 days notice |
| **Missing new features** (behind by 3+ versions) | 60 days notice |
| **A better community library comes along** | 90 days notice |
| **Buggy/unmaintained** | Immediate (after discussion) |

### When a Better One Comes

If someone else creates a better-maintained library in the same language:

- Both libraries will be listed initially
- Users will choose the better one
- The less maintained one may be marked "legacy"
- Eventually deprecated if no improvements

**Competition is good for users.**

### Listing Format

Once accepted, your library appears in our README:

```markdown
## Community Clients

| Language | Repository | Maintainer | Status | Last Update |
|----------|------------|------------|--------|-------------|
| Python | [nothing-browser-py](https://github.com/user/nothing-browser-py) | @user | ✅ Active | 2026-01-15 |
| Go | [piggy-go](https://github.com/user/piggy-go) | @user | ⚠️ Beta | 2026-01-10 |
| Rust | [piggy-rs](https://github.com/user/piggy-rs) | @user | 🔨 Alpha | 2026-01-01 |
```

### Example: Opening an Issue

```markdown
**Title:** New Python library: nothing-browser-py

**Description:** I've implemented a Python client for Piggy.

**Implemented APIs:**
- ✅ launch()
- ✅ register()
- ✅ navigate()
- ✅ click()
- ✅ evaluate()
- ✅ exposeFunction()

**Proof:** [link to video/screenshots]

**Repository:** https://github.com/user/nothing-browser-py

**Contact:** @user on Discord

**Maintenance Plan:** I will update within 2 weeks of each Piggy release.
```

---

## Feature PRs: You Better Have a Good Story

If you add a new feature to the library, you have to answer one question:

**How in God's name did you add it to the binary?**

Here's how it works:

```
Binary (C++) → Library (TypeScript) → Documentation
     ↑                ↑                    ↑
   Must exist      Must match          Must explain
   first           the binary           the feature
```

You cannot add a library feature without the binary supporting it. The binary is the foundation. The library is just a wrapper.

So if you send a PR adding `site.newFunction()` to the library, I will ask:

- Where is the binary change?
- What socket command does it use?
- Why do we need this?

**No binary change = PR rejected.**

---

## Multi-Language Support (Official)

### Official vs Community

| Label | Meaning |
|-------|---------|
| **Official** | Built by Ernest Tech House, maintained by us |
| **Community** | Built by you, tagged by us |

### Official Clients Timeline

| Language | Official Release | Who Builds | Notes |
|----------|------------------|------------|-------|
| TypeScript/Bun | ✅ v0.1.0 | Ernest Tech House | Primary client |
| Python | 📋 v0.7.0 | **CANCELLED if community wrapper exists** | See note below |
| Go | 📋 v0.8.0 | Ernest Tech House | Proceeding |
| Java | 📋 v0.9.0 | Ernest Tech House | Proceeding |
| Rust | 📋 v1.0.0 | Ernest Tech House | Proceeding |

### ⚠️ Python Official Release Policy

**If a high-quality community Python wrapper is released and maintained, the official Python client (planned for v0.7.0) will be cancelled.**

Why?

- Limited development time
- Community solutions are often better (maintained by people who actually use Python daily)
- No point in duplicating work

**So if you want an official Python client from us... build a great community one first.** Then we won't need to.

This applies to any language where a strong community client emerges before our official release date.

---

## Three Repositories

Nothing Browser spans three GitHub repositories:

| Repository | Language | Purpose |
|------------|----------|---------|
| `nothing-browser` (core) | C++ | The browser binary |
| `nothing-browser-docs` | Markdown | Documentation site |
| `piggy` (library) | TypeScript | Node/Bun client library |

### PRs Across Repositories

| Repository | PR Response | Merge Policy |
|------------|-------------|--------------|
| `nothing-browser` (core) | 14-20 hours | Strict (C++ must be correct) |
| `nothing-browser-docs` | 14-20 hours | Lenient (typos = merge) |
| `piggy` (library) | 14-20 hours | Moderate (depends on change) |

**PRs in any of the three repos are either closed or merged within 14-20 hours** (my next night session after opening).

---

## Code Style

### TypeScript (Piggy Library)

```ts
// ✅ Good
async function scrapeData(url: string): Promise<Data> {
    const site = await piggy.register("temp", url);
    await site.navigate();
    return await site.evaluate(() => ({ ... }));
}

// ❌ Bad
async function scrapeData(url){ // no types
    let site = await piggy.register("temp",url)
    await site.navigate()
    return await site.evaluate(()=>({...}))
}
```

### C++ (Nothing Browser UI)

```cpp
// ✅ Good
void BrowserBridge::processQueue() {
    if (m_queue.isEmpty()) return;
    // ...
}

// ❌ Bad
void process_queue() { // not in namespace
    if(queue.empty()==false){ // inconsistent
        // ...
    }
}
```

### Qt6 Specific

```cpp
// ✅ Good - Use Qt containers
QVector<QString> list;
list.append("item");

// ❌ Bad - Don't mix STL and Qt
std::vector<std::string> list;
list.push_back("item");
```

---

## Review Process

| PR Type | Review Time | Decision |
|---------|-------------|----------|
| Bug fix (C++) | 14-20 hours | ✅ Likely merge |
| Bug fix (TypeScript) | 14-20 hours | ✅ Merge |
| Documentation | 14-20 hours | ✅ Merge |
| UI change (tabs, icons) | 14-20 hours | ✅ Likely merge |
| New feature (with binary) | 14-20 hours | 🤷 Depends |
| New feature (without binary) | 14-20 hours | ❌ Reject |
| Community library submission | 14-20 hours | ✅ Likely accept |
| Touch fingerprintspoofer.cpp | 14-20 hours | ❌ Reject |
| Touch identitygenerator.cpp | 14-20 hours | ❌ Reject |
| Touch human/index.ts | 14-20 hours | ❌ Reject |
| Add settings to Private Browser | 14-20 hours | ❌ Reject |
| Replace Elysia | 14-20 hours | ❌ Reject |

---

## PR Checklist

Before submitting a PR:

### For Nothing Browser UI (C++):

- [ ] Do you know C++? (If no, don't submit)
- [ ] Did you test on your machine?
- [ ] Did you run `make` without warnings?
- [ ] Did you test for memory leaks?
- [ ] Did you touch `fingerprintspoofer.cpp`? (If yes, don't submit)
- [ ] Did you touch `identitygenerator.cpp`? (If yes, don't submit)

### For Nothing Private Browser:

- [ ] Did you add any settings/UI? (If yes, don't submit)
- [ ] Is it just UI styling? (If yes, probably merge)

### For Piggy Library (TypeScript):

- [ ] Does it fix a bug? (If yes, explain)
- [ ] Does it add a feature? (If yes, where's the binary change?)
- [ ] Did you touch `human/index.ts`? (If yes, don't submit)
- [ ] Did you update documentation?

### For Community Language Library:

- [ ] Did you open an issue first?
- [ ] Did you show every API working?
- [ ] Did you provide contact info?
- [ ] Will you maintain it?

### For Documentation:

- [ ] Is it a typo fix? (Merge)
- [ ] Is it a new page? (Review needed)

---

## Getting Help

Before submitting a PR, ask:

- **Discord:** [Join our server](https://discord.gg/TUxBVQ7y)
- **GitHub Discussions:** [Start a discussion](https://github.com/BunElysiaReact/nothing-browser/discussions)

I'm responsive. Just don't ask "can you add Express support?" because the answer is no.

**Remember:** I respond within 14-20 hours (next night session EAT). Don't expect instant replies.

---

## The Bottom Line

I built Nothing Browser because I wanted a tool that works. I'm protective of the codebase because I have to maintain it.

### Summary Table

| Area | Rule |
|------|------|
| **Nothing Browser UI (C++)** | Know C++ or don't touch |
| **Fingerprint spoofer** | Don't touch. Instant reject. |
| **Identity generator** | Don't touch. Instant reject. |
| **Tab styling** | ✅ Yes, merge it. |
| **Bug fixes** | ✅ Yes, please. |
| **Documentation** | ✅ Yes, please. |
| **Private Browser settings** | 100% denied. Never. |
| **Piggy human/index.ts** | Don't touch. Instant reject. |
| **New features** | Convince me. Need binary change. |
| **Express/Fastify** | No. Never. Elysia stays. |
| **Community language libs** | You build it. You maintain it. |
| **Python official client** | Cancelled if community wrapper exists |
| **PR response time** | 14-20 hours (EAT night hours) |

**If you're cool with that, welcome aboard.**

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*

— Pease Ernest

*P.S. If you make the tabs more curved, I will literally merge it within the hour (next night session). Qt CSS is a different version of CSS.*
