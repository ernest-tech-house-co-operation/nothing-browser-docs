# 🔥 Expose API — Call Node.js from the Browser

Expose Node.js functions to the browser and call them directly from page JavaScript. The browser calls `window.yourFunction(data)` and gets back a real return value from Node.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## How it works

```
Browser JavaScript                    Node.js
──────────────────                    ───────
window.saveProduct({...})  ────────► async (data) => {
                                         savedItems.push(data)
                                         return { success: true, id: "..." }
                                     }
                                     │
                                     ▼
Promise resolves ◄───────────────── { success: true, id: "..." }
```

---

## Quick Start

```ts
import piggy from "nothing-browser"
import path from "path"

await piggy.launch({ mode: "tab", binary: path.resolve(import.meta.dir, "../a/nothing-browser-headful.exe") })
await piggy.register("app", "https://example.com")

const savedItems: any[] = []

await piggy.app.exposeFunction("saveProduct", async (data: any) => {
  savedItems.push({ ...data, id: crypto.randomUUID() })
  return { success: true, id: savedItems[savedItems.length - 1].id, total: savedItems.length }
})

await piggy.app.navigate()
await piggy.app.click("#save-btn")

await piggy.close()
```

---

## `site.exposeFunction(name, handler)`

Exposes a Node.js function to the browser under `window.name`.

```ts
await piggy.app.exposeFunction("saveProduct", async (data: any) => {
  console.log("[Node] saveProduct called with:", data)
  savedItems.push({ ...data, id: crypto.randomUUID() })
  return { success: true, id: savedItems[savedItems.length - 1].id, total: savedItems.length }
})
```

The browser page can then call:
```js
const result = await window.saveProduct({ title: "Book", price: "$9.99" })
// result → { success: true, id: "uuid...", total: 1 }
```

Return anything serializable — objects, strings, numbers. Throw to reject the promise on the browser side.

---

## `site.unexposeFunction(name)`

Removes a previously exposed function.

```ts
await piggy.app.unexposeFunction("saveProduct")
```

---

## `site.clearExposedFunctions()`

Removes all exposed functions for this site.

```ts
await piggy.app.clearExposedFunctions()
```

---

## `site.exposeAndInject(name, handler, injectionJs)`

Exposes a function and immediately runs injection JS in the browser in one call.

```ts
await piggy.app.exposeAndInject(
  "logToServer",
  async (data: any) => {
    console.log("Browser says:", data)
    return { received: true }
  },
  (fnName) => `
    window.${fnName}({ url: window.location.href, timestamp: Date.now() });
  `
)
```

`injectionJs` can be a plain string or a function that receives the name and returns a string.

---

## `site.addInitScript(js)`

Injects JS that runs before any page script on every navigation. Use it to set globals or mock APIs before the page loads.

```ts
await piggy.app.addInitScript(`
  window.__PIGGY_DEMO__ = true;
  window.__INJECTED_AT__ = Date.now();
`)

await piggy.app.addInitScript(`
  const _origNow = Date.now;
  window.__realNow = _origNow;
`)
```

> Must be called before `navigate()`. Takes a plain string — not `{ js: "..." }`.

Verify it ran:
```ts
const flag = await piggy.app.evaluate(() => window.__PIGGY_DEMO__)
console.log(flag) // true
```

---

## Real demo output (demo 14)

```
Init script registered ✓
Second init script registered ✓
Exposed: saveProduct ✓
Exposed: computeHash ✓

__PIGGY_DEMO__ flag from initScript: true
[Node] saveProduct called with: { title: "Piggy Demo Book", price: "$9.99", timestamp: 1779101826964 }
Page result text: "Saved: ..."
Saved items in Node: 1
[Node] computeHash called with: "hello piggy"
Hash result on page: "Hash: hash-6a8a5a32"

Direct evaluate → saveProduct result: {}
Total saved items: 1
All saved: [{ title: "Piggy Demo Book", price: "$9.99", timestamp: ..., id: "ba2cdac6-..." }]
```

---

## Error handling

```ts
await piggy.app.exposeFunction("riskyOp", async (data: any) => {
  try {
    const result = await someAsyncOperation(data)
    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})
```

---

## Local file pages

If you're using a local HTML file, fix the path for Windows or Qt won't load it:

```ts
const pageUrl = `file:///${process.cwd().replace(/\\/g, "/")}/local-pages/rpc-test.html`
await piggy.register("app", pageUrl)
```

Plain `file://` + backslashes = blank white page.

---

## API Reference

| Method | Parameters | Returns |
|--------|------------|---------|
| `exposeFunction(name, handler)` | `name: string, handler: (data) => any` | `Promise<site>` |
| `unexposeFunction(name)` | `name: string` | `Promise<site>` |
| `clearExposedFunctions()` | — | `Promise<site>` |
| `exposeAndInject(name, handler, injectionJs)` | `name, handler, injectionJs: string \| (name) => string` | `Promise<site>` |
| `addInitScript(js)` | `js: string \| () => void` | `Promise<site>` |

---

## Next Steps

- [Iframe API](../iframe) — Interact with iframe content
- [Dialog API](../dialog) — Handle JavaScript dialogs
- [Intercept API](../intercept) — Intercept and modify network requests

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*