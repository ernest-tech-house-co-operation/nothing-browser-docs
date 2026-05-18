# 💬 Dialog API — Handle JavaScript Dialogs & File Uploads

Manage browser dialogs (alert, confirm, prompt) and file uploads automatically. Prevent popups from breaking your automation.

> ⚠️ **Version Requirement:** Binary v0.1.14+ | Library v0.0.20+

---

## Overview

The Dialog API handles native browser dialogs and file inputs:

| Method | Purpose | Use Case |
|--------|---------|----------|
| `dialog.accept()` | Accept/confirm dialog | Click "OK" on alert/confirm/prompt |
| `dialog.dismiss()` | Dismiss/cancel dialog | Click "Cancel" on confirm |
| `dialog.status()` | Check pending dialog | See if a dialog is waiting |
| `dialog.setAutoAction()` | Auto-handle all dialogs | Set and forget |
| `dialog.upload()` | Upload a file | Handle file input elements |
| `dialog.waitAndAccept()` | Wait then accept | Block until dialog appears |
| `dialog.waitAndDismiss()` | Wait then dismiss | Block until dialog appears |
| `dialog.onDialog()` | Dialog event listener | React to dialogs in real-time |

---

## ⚠️ Critical: Dialogs Block the Page

Browser dialogs (`alert`, `confirm`, `prompt`) are **synchronous** — they freeze the entire page until dismissed. This means:

- **Never `await` a click that triggers a dialog.** The click will hang forever waiting for a response that can't come because the page is frozen.
- Always fire dialog-triggering clicks with `.catch(() => {})` and wait manually.

```ts
// ❌ WRONG — hangs forever
await piggy.site.click("#delete-btn");

// ✅ CORRECT — fire and forget, then wait
piggy.site.click("#delete-btn").catch(() => {});
await new Promise(r => setTimeout(r, 800));

// Now handle the dialog
await piggy.site.dialog.accept();
```

This applies to `alert()`, `confirm()`, and `prompt()` — all three block the page.

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

await piggy.site.navigate();

// Fire click without awaiting — dialog will block the page
piggy.site.click("#delete-btn").catch(() => {});
await new Promise(r => setTimeout(r, 800));

// Check if dialog is pending
const status = await piggy.site.dialog.status();
console.log(status);
// { pending: true, type: "confirm", message: "Are you sure?", defaultValue: "" }

// Accept the dialog (click OK)
await piggy.site.dialog.accept();

// Or dismiss (click Cancel)
// await piggy.site.dialog.dismiss();
```

---

## Dialog Types

| Type | Description | Methods |
|------|-------------|---------|
| `alert` | Simple message with OK button | `accept()` only |
| `confirm` | OK/Cancel choice | `accept()` or `dismiss()` |
| `prompt` | Input field + OK/Cancel | `accept(text?)` or `dismiss()` |

---

## API Reference

### `dialog.accept(text?)`

Accepts the current dialog (clicks OK). For prompt dialogs, you can provide input text.

```ts
// Accept alert or confirm
await piggy.site.dialog.accept();

// Accept prompt with custom input
await piggy.site.dialog.accept("my custom input");
```

---

### `dialog.dismiss()`

Dismisses/cancels the current dialog (clicks Cancel).

```ts
await piggy.site.dialog.dismiss();
```

---

### `dialog.status()`

Returns information about the current dialog state.

```ts
const status = await piggy.site.dialog.status();
// { pending: true, type: "confirm", message: "Save changes?", defaultValue: "" }

if (status.pending) {
  console.log(`Dialog waiting: ${status.type} — "${status.message}"`);
}
```

---

### `dialog.setAutoAction(action)`

Sets automatic handling for all future dialogs on this tab. Piggy will accept or dismiss dialogs without you needing to call `accept()` / `dismiss()` manually.

```ts
// Auto-accept all dialogs
await piggy.site.dialog.setAutoAction("accept");

// Auto-dismiss all dialogs
await piggy.site.dialog.setAutoAction("dismiss");

// Disable auto-handling (switch to manual / event mode)
await piggy.site.dialog.setAutoAction("");
```

> With auto-action set, dialog-triggering clicks still need to be fire-and-forget — the page is still frozen until Qt handles the dialog internally.

---

### `dialog.upload(selector, filePath)`

Uploads a file to a file input element by injecting it via a `DataTransfer` object. Works without triggering the OS file picker.

```ts
// Upload a text file
await piggy.site.dialog.upload("#file-input", "/path/to/file.txt");

// Upload an image
await piggy.site.dialog.upload("#avatar", "/path/to/photo.png");
```

**Supported file types:** `.txt`, `.pdf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.csv`, `.json` — plus any file as `application/octet-stream`.

> The file must exist on disk. C++ reads it directly and injects it into the page as a `File` object.

---

### `dialog.waitAndAccept(timeout?, text?)`

Waits for a dialog to appear, then accepts it. Useful when you're not sure exactly when a dialog will show up.

```ts
// Click, then wait up to 5s for a dialog and accept it
piggy.site.click("#delete-btn").catch(() => {});
const result = await piggy.site.dialog.waitAndAccept(5000);
console.log(result);
// { dialogType: "confirm", message: "Are you sure?", ... }
```

---

### `dialog.waitAndDismiss(timeout?)`

Waits for a dialog to appear, then dismisses it.

```ts
piggy.site.click("#cancel-btn").catch(() => {});
const result = await piggy.site.dialog.waitAndDismiss(5000);
```

---

### `dialog.onDialog(tabId, handler)`

Registers an event listener that fires whenever a dialog appears. Returns an unsubscribe function.

```ts
const unsub = piggy.site.dialog.onDialog("default", async (e) => {
  console.log(`Dialog: ${e.dialogType} — "${e.message}"`);

  if (e.dialogType === "confirm") {
    await piggy.site.dialog.accept();
  } else if (e.dialogType === "prompt") {
    await piggy.site.dialog.accept("Pease Ernest");
  }
});

// Later — stop listening
unsub();
```

> **Note:** `onDialog` requires `setAutoAction("")` to be set first, otherwise Qt handles the dialog before the event reaches your handler.

---

## Real-World Examples

### Example 1: Auto-Accept All Dialogs

```ts
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("app", "https://example.com");

// Set and forget — all dialogs auto-accepted
await piggy.app.dialog.setAutoAction("accept");

await piggy.app.navigate();

// Fire clicks without awaiting
piggy.app.click("#delete-all").catch(() => {});
await new Promise(r => setTimeout(r, 800));

piggy.app.click("#save").catch(() => {});
await new Promise(r => setTimeout(r, 800));
```

---

### Example 2: Handle Confirm Based on Message Content

```ts
await piggy.app.navigate();

piggy.app.click("#delete-item").catch(() => {});
await new Promise(r => setTimeout(r, 800));

const status = await piggy.app.dialog.status();

if (status.pending && status.message.includes("permanently")) {
  await piggy.app.dialog.dismiss();
  console.log("Cancelled dangerous deletion");
} else if (status.pending) {
  await piggy.app.dialog.accept();
  console.log("Accepted safe action");
}
```

---

### Example 3: File Upload with Verification

```ts
await piggy.app.navigate("https://example.com/upload");
await piggy.app.waitForSelector("#file-input");

// Upload file — no OS picker needed
await piggy.app.dialog.upload("#file-input", "./report.pdf");

// Verify filename appeared in the page
await new Promise(r => setTimeout(r, 300));
const shown = await piggy.app.provide.text({ selector: "#file-name" });
console.log(`Page shows: "${shown}"`); // "report.pdf"
```

---

### Example 4: Prompt Dialog with Custom Input

```ts
piggy.app.click("#rename-btn").catch(() => {});
await new Promise(r => setTimeout(r, 800));

const status = await piggy.app.dialog.status();

if (status.pending && status.type === "prompt") {
  console.log(`Prompt: "${status.message}" (default: "${status.defaultValue}")`);
  await piggy.app.dialog.accept("new-filename.txt");
  console.log("File renamed ✓");
}
```

---

### Example 5: Event-Based Dialog Handler

```ts
await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("app", "https://example.com");

// Switch to manual/event mode first
await piggy.app.dialog.setAutoAction("");

const unsub = piggy.app.dialog.onDialog("default", async (e) => {
  console.log(`[Dialog] ${e.dialogType}: ${e.message}`);

  switch (e.dialogType) {
    case "alert":
      await piggy.app.dialog.accept();
      break;

    case "confirm":
      if (e.message.toLowerCase().includes("delete")) {
        await piggy.app.dialog.dismiss();
      } else {
        await piggy.app.dialog.accept();
      }
      break;

    case "prompt":
      await piggy.app.dialog.accept("auto-filled-value");
      break;
  }
});

await piggy.app.navigate();

piggy.app.click("#delete-btn").catch(() => {});
await new Promise(r => setTimeout(r, 1000));

piggy.app.click("#rename-btn").catch(() => {});
await new Promise(r => setTimeout(r, 1000));

unsub(); // stop listening
```

---

### Example 6: Upload Multiple Files

```ts
const files = [
  "./img/photo1.jpg",
  "./img/photo2.jpg",
  "./img/photo3.jpg",
];

for (const file of files) {
  await piggy.app.dialog.upload("#gallery", file);
  await new Promise(r => setTimeout(r, 300));
  console.log(`Uploaded: ${file}`);
}

await piggy.app.click("#submit");
```

---

## Type Definitions

```ts
interface DialogStatus {
  pending: boolean;
  type: "alert" | "confirm" | "prompt" | "";
  message: string;
  defaultValue: string;
}

interface DialogEventData {
  tabId: string;
  dialogType: "alert" | "confirm" | "prompt";
  message: string;
  defaultValue: string;
}
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `await piggy.site.click("#btn")` when btn triggers a dialog | Use `.catch(() => {})` and wait manually |
| Calling `onDialog` without `setAutoAction("")` first | Set `setAutoAction("")` before registering listener |
| Passing wrong `tabId` to `dialog.upload()` | Use `piggy.site._tabId` or omit tabId (uses site's own tab) |
| Expecting `onDialog` events for auto-accepted dialogs | Auto-action handles silently — events only fire in manual mode |

---

## Next Steps

- [Captcha API](../captcha) — Handle CAPTCHA and block detection
- [Human API](../human) — Human-like behavior
- [Interactions](../click) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*