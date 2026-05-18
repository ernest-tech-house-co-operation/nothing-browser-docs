# 🖼️ Iframe API — Cross-Frame DOM Operations

Interact with elements inside iframes — run JavaScript, click buttons, extract text, wait for selectors, all inside nested frames.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

| Method | What it does |
|--------|-------------|
| `iframe.list()` | List all iframes on the page |
| `iframe.evaluate()` | Run JS inside an iframe |
| `iframe.click()` | Click an element inside an iframe |
| `iframe.type()` | Type text into an iframe input |
| `iframe.text()` | Get text from an iframe element |
| `iframe.html()` | Get the full HTML of an iframe |
| `iframe.waitSel()` | Wait for a selector to appear inside an iframe |

---

## Quick Start

```ts
import piggy from "nothing-browser"
import path from "path"

await piggy.launch({ mode: "tab", binary: path.resolve(import.meta.dir, "../a/nothing-browser-headful.exe") })
await piggy.register("page", "https://www.w3schools.com/html/tryit.asp?filename=tryhtml_iframe")

await piggy.page.navigate()
await piggy.page.waitForSelector("iframe")
await new Promise(r => setTimeout(r, 1500)) // let iframes settle

const iframes = await piggy.page.iframe.list()
console.log(`Found ${iframes.length} iframes`)

await piggy.close()
```

**Real output from demo 13:**
```
Found 9 iframes:
  [0] id="iframeResult" name="iframeResult" src=""
  [1] id="" name="__tcfapiLocator" src=""
  [2] id="143d3d7301f7eb" name="__pb_locator__" src="about:blank"
  ...
```

> Pages have more iframes than you think — ad trackers, consent frames, etc. always use `frameIndex: 0` or filter by `id`/`name` to target the right one.

---

## Targeting an Iframe

Every method needs you to identify which iframe you're talking to. Use any one of:

| Key | Example | When to use |
|-----|---------|-------------|
| `frameIndex` | `frameIndex: 0` | You know the position |
| `id` | `id: "iframeResult"` | Iframe has an id attribute |
| `name` | `name: "frameA"` | Iframe has a name attribute |
| `src` | `src: "https://pay.example.com"` | You know part of the src URL |

```ts
// All equivalent if iframe[0] has id="iframeResult" name="iframeResult"
await piggy.page.iframe.html({ frameIndex: 0 })
await piggy.page.iframe.html({ id: "iframeResult" })
await piggy.page.iframe.html({ name: "iframeResult" })
```

---

## `iframe.list()`

Returns every iframe on the page with its index, id, name, and src.

```ts
const iframes = await piggy.page.iframe.list()
iframes.forEach((f: any) => {
  console.log(`[${f.index}] id="${f.id}" name="${f.name}" src="${f.src}"`)
})
```

Use this first to figure out which `frameIndex` you need.

---

## `iframe.evaluate({ frameIndex, js })`

Runs JavaScript inside the iframe and returns the result.

```ts
// Get the iframe's document title
const title = await piggy.page.iframe.evaluate({
  frameIndex: 0,
  js: "document.title",
})

// Get an element's text
const text = await piggy.page.iframe.evaluate({
  frameIndex: 0,
  js: "document.querySelector('.total').innerText",
})

// Run multi-line logic
const formData = await piggy.page.iframe.evaluate({
  frameIndex: 0,
  js: `
    const data = {};
    document.querySelectorAll('input').forEach(el => {
      if (el.name) data[el.name] = el.value;
    });
    return data;
  `
})
```

> ⚠️ Cross-origin iframes will block `evaluate`. You'll get an error — that's normal. Use `click`/`type` instead which still work cross-origin.

---

## `iframe.text({ frameIndex, selector })`

Gets the `innerText` of a selector inside the iframe.

```ts
const bodyText = await piggy.page.iframe.text({
  frameIndex: 0,
  selector: "body",
})
console.log(bodyText) // "HTML Iframes\n\nAn iframe is used to display..."

const price = await piggy.page.iframe.text({
  frameIndex: 0,
  selector: ".total-price",
})
```

---

## `iframe.html({ frameIndex })`

Gets the complete HTML of the iframe body.

```ts
const html = await piggy.page.iframe.html({ frameIndex: 0 })
console.log(html.slice(0, 150))
// <html><head></head><body contenteditable="false">
// <h2>HTML Iframes</h2>
// <p>An iframe is used to display a web page within a web page:</p>
```

---

## `iframe.click({ frameIndex, selector })`

Clicks an element inside the iframe.

```ts
await piggy.page.iframe.click({
  frameIndex: 0,
  selector: "#submit-button",
})

// By iframe name
await piggy.page.iframe.click({
  name: "payment",
  selector: "button[type='submit']",
})
```

---

## `iframe.type({ frameIndex, selector, text })`

Types into an input inside the iframe.

```ts
await piggy.page.iframe.type({
  frameIndex: 0,
  selector: "#card-number",
  text: "4111111111111111",
})
```

---

## `iframe.waitSel({ frameIndex, selector, timeout? })`

Waits until a selector appears inside the iframe. Returns `"found"` or throws on timeout.

```ts
const result = await piggy.page.iframe.waitSel({
  frameIndex: 0,
  selector: "body",
  timeout: 5000,
})
console.log(result) // "found"

// Always wait before interacting with dynamic iframes
await piggy.page.iframe.waitSel({ frameIndex: 0, selector: "#payment-form", timeout: 10000 })
await piggy.page.iframe.type({ frameIndex: 0, selector: "#card-number", text: "4111111111111111" })
```

---

## Real Examples

### Payment form

```ts
await piggy.register("shop", "https://example.com/checkout")
await piggy.shop.navigate()

await piggy.shop.iframe.waitSel({ frameIndex: 0, selector: "#payment-form", timeout: 15000 })

await piggy.shop.iframe.type({ frameIndex: 0, selector: "#card-number", text: "4111111111111111" })
await piggy.shop.iframe.type({ frameIndex: 0, selector: "#expiry",      text: "12/28" })
await piggy.shop.iframe.type({ frameIndex: 0, selector: "#cvv",         text: "123" })
await piggy.shop.iframe.type({ frameIndex: 0, selector: "#name",        text: "John Doe" })

await piggy.shop.iframe.click({ frameIndex: 0, selector: "#submit-payment" })
```

### Find a specific iframe by src

```ts
const iframes = await piggy.page.iframe.list()
const twitterFrame = iframes.find((f: any) => f.src.includes("twitter.com"))

if (twitterFrame) {
  await piggy.page.iframe.waitSel({ frameIndex: twitterFrame.index, selector: "[data-testid='tweet']", timeout: 10000 })
  const tweet = await piggy.page.iframe.text({ frameIndex: twitterFrame.index, selector: "[data-testid='tweetText']" })
  console.log("Tweet:", tweet)
}
```

### Auto-fill any iframe form

```ts
async function fillIframeForm(site: any, frameIndex: number, fields: Record<string, string>) {
  await site.iframe.waitSel({ frameIndex, selector: "form", timeout: 10000 })
  for (const [field, value] of Object.entries(fields)) {
    await site.iframe.type({ frameIndex, selector: `#${field}`, text: value })
  }
  await site.iframe.click({ frameIndex, selector: "button[type='submit']" })
}

await fillIframeForm(piggy.page, 0, {
  email: "user@example.com",
  password: "secret123",
})
```

---

## Limitations

| Issue | What happens | Workaround |
|-------|-------------|------------|
| Cross-origin iframe | `evaluate`, `text`, `html` throw | Use `click`/`type` — they still work |
| Iframe not loaded yet | selector not found | `waitForSelector("iframe")` + 500ms sleep before calling iframe methods |
| Ad/tracker iframes | `list()` returns many unexpected frames | Filter by `id` or `name`, not just index |

---

## API Reference

| Method | Parameters | Returns |
|--------|------------|---------|
| `iframe.list()` | — | `Promise<IframeDescriptor[]>` |
| `iframe.evaluate(opts)` | `frameIndex/id/name/src`, `js` | `Promise<any>` |
| `iframe.click(opts)` | `frameIndex/id/name/src`, `selector` | `Promise<boolean>` |
| `iframe.type(opts)` | `frameIndex/id/name/src`, `selector`, `text` | `Promise<boolean>` |
| `iframe.text(opts)` | `frameIndex/id/name/src`, `selector` | `Promise<string>` |
| `iframe.html(opts)` | `frameIndex/id/name/src` | `Promise<string>` |
| `iframe.waitSel(opts)` | `frameIndex/id/name/src`, `selector`, `timeout?` | `Promise<"found">` |

```ts
interface IframeDescriptor {
  index: number
  src:   string
  id:    string
  name:  string
}
```

---

## Next Steps

- [Find API](../find) — Query DOM elements on the main page
- [Provide API](../provide) — Extract structured data
- [Dialog API](../dialog) — Handle dialogs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*