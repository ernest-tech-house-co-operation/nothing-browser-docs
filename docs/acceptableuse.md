# Acceptable Use Policy

**Last Updated:** April 24, 2026

---

## Overview

This Acceptable Use Policy outlines what you may and may not do with Nothing Ecosystem software.

**The short version:** You can scrape public websites. Don't break the law. Be respectful.

---

## You May

| Activity | Status |
|----------|--------|
| Scrape public websites | ✅ Yes |
| Automate browser tasks | ✅ Yes |
| Reverse engineer public APIs | ✅ Yes |
| Build tools on top of Piggy | ✅ Yes |
| Create community language wrappers (Python, Go, Rust, etc.) | ✅ Yes |
| Use the software commercially | ✅ Yes |
| Modify the source code | ✅ Yes (MIT License) |
| Fork the repository | ✅ Yes |

---

## You May Not

| Activity | Status | Why |
|----------|--------|-----|
| Use for illegal activities | ❌ No | It's the law |
| Bypass authentication systems | ❌ No | That's hacking |
| Scrape non-public data | ❌ No | Respect privacy |
| Overwhelm servers | ❌ No | Be respectful |
| Sell access to our software | ❌ No | It's open source |
| Claim you wrote the software | ❌ No | Keep credits |
| Remove license headers | ❌ No | MIT requires it |

---

## Community Language Libraries

You are welcome to create community language wrappers (Python, Go, Rust, etc.).

### Requirements

| Requirement | Detail |
|-------------|--------|
| **You maintain it** | Bug fixes, updates, documentation |
| **You keep it updated** | When Piggy adds features, you add them |
| **You handle issues** | Users will come to you |
| **Dot notation** | Keep API consistent with original |

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

### What We Will Do

- ✅ Feature your library in our README
- ✅ Send users your way
- ✅ Not compete with you (if your wrapper is good)

### What We Will Not Do

- ❌ Maintain your library
- ❌ Fix your bugs
- ❌ Answer questions about your code

---

## Deprecation Policy for Community Libraries

Your library may be deprecated from our README if:

| Reason | Grace Period |
|--------|--------------|
| Inactive for 6+ months | 30 days notice |
| Behind by 3+ versions | 60 days notice |
| A better library comes along | 90 days notice |
| Buggy/unmaintained | Immediate (after discussion) |

### When a Better One Comes

If someone else creates a better-maintained library in the same language:

- Both libraries will be listed initially
- Users will choose the better one
- The less maintained one may be marked "legacy"
- Eventually deprecated if no improvements

**Competition is good for users.**

---

## Rate Limiting and Respectful Scraping

### Do

- ✅ Add delays between requests
- ✅ Respect robots.txt
- ✅ Use caching when possible
- ✅ Limit concurrent requests

### Don't

- ❌ DDoS websites
- ❌ Ignore 429 (Too Many Requests) responses
- ❌ Scrape faster than a human would browse
- ❌ Ignore website terms of service

**Be a good citizen of the web.**

---

## Reporting Violations

If you see someone using Nothing Ecosystem software for illegal purposes:

1. Don't engage with them
2. Report to GitHub (if on our platforms)
3. Report to local authorities if appropriate

**We take violations seriously.**

---

## Enforcement

Violation of this policy may result in:

| Violation | Consequence |
|-----------|-------------|
| First offense (minor) | Warning |
| Repeated minor violations | Support ban |
| Major violation (illegal activity) | Report to authorities |
| Abusive behavior | Immediate support ban |

**We will not revoke your right to use the software.** It's open source. But we may revoke your right to support.

---

## Contact

Report violations or ask questions:

- **GitHub:** https://github.com/BunElysiaReact/nothing-browser
- **Discord:** https://discord.gg/TUxBVQ7y

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
