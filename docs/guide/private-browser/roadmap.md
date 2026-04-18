# Roadmap

The future of Nothing Private Browser. This is the **intended direction** — not a promise of specific dates or features.

---

## Important Disclaimer

This roadmap represents the **line of which the browser is meant to follow**. 

It does **NOT** mean every single BOM (Bill of Materials) or release must follow it exactly.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   This is a VISION, not a CONTRACT.                         │
│                                                             │
│   Features may ship earlier, later, or not at all.          │
│   Versions may be skipped.                                  │
│   Priorities may change.                                    │
│                                                             │
│   I might ship an update TOMORROW because why not.          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**The only rule:** Every release is private by default. No telemetry. No session persistence. Everything else is flexible.

---

## Version Timeline

| Version | Focus | Key Features | Status |
|---------|-------|--------------|--------|
| **v0.1.0** | Core privacy | Zero telemetry, session wipe, basic fingerprint spoofing | ✅ Released |
| **v0.1.1** | Network leaks | WebRTC protection, improved headers | ✅ Released |
| **v0.1.2** | Modern fingerprinting | UA-CH spoofing, userAgentData | ✅ Released |
| **v0.1.3** | Advanced fingerprinting | xorshift canvas noise, WebGL spoofing | ✅ Released |
| **v0.2.0** | Ad blocking | Network-level filter lists, EasyList support | 🔨 In progress |
| **v0.3.0** | Anonymity | Tor routing, VPN import | 📋 Planned |
| **v0.4.0** | Hardening | DNS over HTTPS, encrypted storage | 📋 Planned |
| **v1.0.0** | Stability | Full audit, stable API | 📋 Planned |

---

## v0.2.0 — Ad Blocking (Current)

**Focus:** Block trackers and ads at the network level.

| Feature | Status | Description |
|---------|--------|-------------|
| Filter list parser | 🔨 In progress | Parse EasyList, EasyPrivacy |
| Network interceptor | 🔨 In progress | Block requests before they send |
| Custom filter support | 📋 Planned | User-defined block lists |
| Element hiding | 📋 Planned | Hide empty spaces from blocked ads |

**Why this matters:** Most "privacy" browsers still load ads — they just hide them. Nothing Private Browser will block them entirely.

**Expected release:** When it's ready. Could be next week. Could be next month.

---

## v0.3.0 — Anonymity

**Focus:** Make you truly anonymous online.

| Feature | Status | Description |
|---------|--------|-------------|
| Tor integration | 📋 Planned | One-click onion routing |
| OpenVPN import | 📋 Planned | Import .ovpn files directly |
| WireGuard import | 📋 Planned | Import .conf files directly |
| ProtonVPN support | 📋 Planned | Native ProtonVPN integration |
| Circuit display | 📋 Planned | Show Tor/VPN path |

**Why this matters:** VPNs and Tor are separate apps. They should be built in.

**Expected release:** When I figure out how to make it seamless.

---

## v0.4.0 — Hardening

**Focus:** Eliminate remaining privacy leaks.

| Feature | Status | Description |
|---------|--------|-------------|
| DNS over HTTPS | 📋 Planned | Encrypted DNS by default |
| DNS leak blocking | 📋 Planned | Prevent DNS leaks |
| Encrypted storage | 📋 Planned | Even temporary storage encrypted |
| Cache partitioning | 📋 Planned | Per-site cache isolation |
| Network partitioning | 📋 Planned | Per-site network state |

**Why this matters:** DNS is the last unencrypted piece of your browsing.

---

## v1.0.0 — Stability

**Focus:** Production-ready, audited, stable.

| Feature | Status | Description |
|---------|--------|-------------|
| Security audit | 📋 Planned | Third-party audit |
| Penetration testing | 📋 Planned | Find and fix leaks |
| Stable API | 📋 Planned | No breaking changes |
| Documentation complete | 🔨 In progress | What you're reading now |

---

## The "I Might Ship Tomorrow" Philosophy

Here's how releases actually work:

```javascript
// Not this:
if (featureComplete && testsPass && documentationDone && moonPhase === "full") {
    shipRelease();
}

// This:
if (iFeelLikeIt && itWorksOnMyMachine) {
    shipRelease();
}
```

**Real examples:**

- v0.1.1 shipped because I found a WebRTC leak at 2 AM
- v0.1.2 shipped because I wanted better UA-CH spoofing
- v0.1.3 shipped because canvas noise needed improvement

**No fixed schedules. No "quarterly releases." No "sprint planning."**

Just: **Is it better? Ship it.**

---

## What This Means For You

### If You're a User

- Updates come when they come
- Features appear without warning
- Something you want might ship tomorrow
- Or next year
- Or never

### If You're a Contributor

- Don't ask "when will X be released?"
- Don't ask for roadmaps with dates
- Do submit bug fixes
- Do suggest features (but don't expect timelines)

### If You're a Company

- Don't depend on specific release dates
- Do test each release before deploying
- Do consider forking if you need stability

---

## Priority Order

Features are prioritized by:

1. **What I personally need** (I built this for myself first)
2. **What breaks privacy** (security holes go to the front)
3. **What the community asks for** (if it makes sense)
4. **What's fun to build** (yes, this matters)

---

## Recent Releases

| Version | Date | What |
|---------|------|------|
| v0.1.0 | 2025-03 | Core private browser |
| v0.1.1 | 2025-04 | WebRTC leak protection |
| v0.1.2 | 2025-05 | UA-CH spoofing |
| v0.1.3 | 2025-06 | xorshift canvas noise |

**Next release:** When it's ready.

---

## How to Stay Updated

- **Watch GitHub Releases:** [github.com/ernest-tech-house-co-operation/nothing-private-browser/releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases)
- **Join Discord:** [https://discord.gg/TUxBVQ7y](https://discord.gg/TUxBVQ7y)
- **Check the TECH HOUSE tab** (in the browser)

---

## The Bottom Line

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   This roadmap is a DIRECTION, not a SCHEDULE.              │
│                                                             │
│   The browser will get better over time.                    │
│                                                             │
│   Exactly when?                                             │
│                                                             │
│   When I have time.                                         │
│   When I feel like it.                                      │
│   When it's ready.                                          │
│                                                             │
│   Maybe tomorrow.                                           │
│   Maybe next week.                                          │
│   Maybe next month.                                         │
│                                                             │
│   That's the deal.                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- [Privacy Features](./privacy) — Deep dive into privacy
- [Installation](./installation) — Install the browser
- [Limitations](../technical/limitations) — Know what to expect

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*

*I might ship something tomorrow. Or I might not. We'll see.*
