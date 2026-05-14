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
| `dialog.onDialog()` | Dialog event | React to dialogs in real-time |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("site", "https://example.com");

await piggy.site.navigate();

// Click button that triggers an alert
await piggy.site.click("#delete-btn");

// Check if dialog is pending
const status = await piggy.site.dialog.status();
console.log(status); // { pending: true, type: "confirm", message: "Are you sure?", defaultValue: "" }

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

## Handle Dialogs

### `dialog.accept(text?)`

Accepts the current dialog (clicks OK). For prompt dialogs, you can provide input text.

```ts
// Accept alert or confirm
await piggy.site.dialog.accept();

// Accept prompt with custom input
await piggy.site.dialog.accept("User input text");
```

### `dialog.dismiss()`

Dismisses/cancels the current dialog (clicks Cancel).

```ts
await piggy.site.dialog.dismiss();
```

### `dialog.status()`

Returns information about the current dialog.

```ts
const status = await piggy.site.dialog.status();
// { pending: true, type: "confirm", message: "Save changes?", defaultValue: "" }
```

### `dialog.setAutoAction(tabId?, action)`

Sets automatic handling for all future dialogs.

```ts
// Auto-accept all dialogs
await piggy.site.dialog.setAutoAction("accept");

// Auto-dismiss all dialogs
await piggy.site.dialog.setAutoAction("dismiss");

// Disable auto-handling (manual mode)
await piggy.site.dialog.setAutoAction("");
```

---

## File Upload

### `dialog.upload(selector, filePath)`

Uploads a file to a file input element.

```ts
// Upload a single file
await piggy.site.dialog.upload("#avatar", "/home/user/photo.jpg");

// Upload multiple files (use multiple attribute)
await piggy.site.dialog.upload("#gallery", "/home/user/photo1.jpg");
await piggy.site.dialog.upload("#gallery", "/home/user/photo2.jpg");
```

---

## Wait for Dialogs

### `dialog.waitAndAccept(timeout?, text?)`

Waits for a dialog to appear, then accepts it.

```ts
// Click button that shows a delayed dialog
await piggy.site.click("#delete-btn");

// Wait up to 5 seconds for dialog, then accept
const result = await piggy.site.dialog.waitAndAccept(5000);
console.log(result); // { type: "confirm", message: "Are you sure?", accepted: true }
```

### `dialog.waitAndDismiss(timeout?)`

Waits for a dialog to appear, then dismisses it.

```ts
await piggy.site.click("#cancel-btn");
const result = await piggy.site.dialog.waitAndDismiss(5000);
// { type: "confirm", message: "Cancel changes?", dismissed: true }
```

---

## Events

### `dialog.onDialog(tabId, handler)`

Triggered when any dialog appears.

```ts
piggy.dialog.onDialog("default", (data) => {
  console.log(`Dialog detected: ${data.dialogType}`);
  console.log(`Message: ${data.message}`);
  console.log(`Default value: ${data.defaultValue}`);
  
  // Auto-accept confirm dialogs
  if (data.dialogType === "confirm") {
    piggy.site.dialog.accept();
  }
});
```

---

## Real-World Examples

### Example 1: Auto-Accept All Dialogs

```ts
await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("app", "https://example.com");

// Set and forget — all dialogs auto-accepted
await piggy.app.dialog.setAutoAction("accept");

await piggy.app.navigate();
await piggy.app.click("#delete-all");  // Confirm dialog auto-accepted
await piggy.app.click("#save");        // Alert auto-accepted
```

### Example 2: Handle Confirm Based on Condition

```ts
await piggy.app.navigate();
await piggy.app.click("#delete-item");

const status = await piggy.app.dialog.status();

if (status.type === "confirm" && status.message.includes("permanently")) {
  // Dangerous action — dismiss
  await piggy.app.dialog.dismiss();
  console.log("Cancelled dangerous deletion");
} else {
  // Safe action — accept
  await piggy.app.dialog.accept();
}
```

### Example 3: File Upload with Preview

```ts
await piggy.app.navigate("https://example.com/upload");

// Upload file
await piggy.app.dialog.upload("#file-input", "./screenshot.png");

// Wait for preview to load
await piggy.app.wait.selector({ selector: ".image-preview", state: "visible" });

// Submit form
await piggy.app.click("#submit");

// Handle success alert
await piggy.app.dialog.waitAndAccept(5000);
console.log("Upload complete");
```

### Example 4: Prompt Dialog with User Input

```ts
await piggy.app.click("#rename");

// Wait for prompt
const status = await piggy.app.dialog.status();

if (status.type === "prompt") {
  console.log(`Prompt message: ${status.message}`);
  
  // Enter new name and accept
  await piggy.app.dialog.accept("new-filename.txt");
  
  console.log("File renamed");
}
```

### Example 5: Comprehensive Dialog Handler

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("app", "https://example.com");

const { app } = usePiggy<"app">();

// Set up dialog event listener
piggy.dialog.onDialog("default", async (data) => {
  console.log(`[Dialog] ${data.dialogType}: ${data.message}`);
  
  switch (data.dialogType) {
    case "alert":
      console.log("Just info, accepting...");
      await app.dialog.accept();
      break;
      
    case "confirm":
      if (data.message.includes("delete") || data.message.includes("remove")) {
        console.log("Dangerous action, dismissing...");
        await app.dialog.dismiss();
      } else {
        console.log("Safe action, accepting...");
        await app.dialog.accept();
      }
      break;
      
    case "prompt":
      console.log(`Prompt with default: "${data.defaultValue}"`);
      await app.dialog.accept("auto-filled-value");
      break;
  }
});

await app.navigate();

// These will be handled automatically by the event handler
await app.click("#delete-btn");
await app.click("#save-btn");
await app.click("#rename-btn");

console.log("All dialogs handled");
```

### Example 6: Retry on Dialog

```ts
async function submitWithRetry(site: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    await site.click("#submit");
    
    try {
      const status = await site.dialog.status();
      
      if (status.pending && status.message.includes("invalid")) {
        console.log(`Validation failed, retry ${i + 1}/${maxRetries}`);
        await site.dialog.accept();
        
        // Fix form data
        await site.type("#email", "valid@email.com");
        continue;
      }
      
      // Success — accept and break
      if (status.pending) {
        await site.dialog.accept();
      }
      return true;
      
    } catch {
      // No dialog, submission succeeded
      return true;
    }
  }
  
  return false;
}

const success = await submitWithRetry(piggy.app);
console.log(success ? "Form submitted" : "Failed after retries");
```

### Example 7: Upload Multiple Files

```ts
async function uploadMultipleFiles(site: any, selector: string, files: string[]) {
  for (const file of files) {
    await site.dialog.upload(selector, file);
    await site.wait(500);  // Small delay between uploads
    console.log(`Uploaded: ${file}`);
  }
}

await uploadMultipleFiles(piggy.app, "#gallery", [
  "./img/photo1.jpg",
  "./img/photo2.jpg",
  "./img/photo3.jpg"
]);

await piggy.app.click("#submit");
```

---

## API Reference

### Dialog Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `dialog.accept(text?)` | `text?: string` | `Promise<void>` | Accept dialog (OK). For prompt, provide input text |
| `dialog.dismiss()` | — | `Promise<void>` | Dismiss dialog (Cancel) |
| `dialog.status()` | — | `Promise<DialogStatus>` | Get current dialog state |
| `dialog.setAutoAction(action)` | `action: "accept" \| "dismiss" \| ""` | `Promise<void>` | Auto-handle future dialogs |
| `dialog.upload(selector, filePath)` | `selector: string, filePath: string` | `Promise<void>` | Upload file to input |
| `dialog.waitAndAccept(timeout?, text?)` | `timeout?: number, text?: string` | `Promise<DialogResult>` | Wait for dialog, then accept |
| `dialog.waitAndDismiss(timeout?)` | `timeout?: number` | `Promise<DialogResult>` | Wait for dialog, then dismiss |

### Event Handler

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `dialog.onDialog(tabId, handler)` | `tabId: string, handler: (data) => void` | `() => void` | Dialog event listener |

---

## Type Definitions

```ts
interface DialogStatus {
  pending: boolean;
  type: "alert" | "confirm" | "prompt" | null;
  message: string;
  defaultValue: string;
}

interface DialogResult {
  type: "alert" | "confirm" | "prompt";
  message: string;
  accepted?: boolean;
  dismissed?: boolean;
  input?: string;
}

interface DialogEventData {
  tabId: string;
  dialogType: "alert" | "confirm" | "prompt";
  message: string;
  defaultValue: string;
}
```

---

## Best Practices

### Use Auto-Action for Known Sites

```ts
// If you know all dialogs are safe to accept
await piggy.site.dialog.setAutoAction("accept");
```

### Handle Conditional Responses

```ts
const status = await piggy.site.dialog.status();
if (status.message.includes("delete")) {
  await piggy.site.dialog.dismiss();  // Be careful with deletions
} else {
  await piggy.site.dialog.accept();
}
```

### Always Wait for Navigation After Dialogs

```ts
await piggy.site.click("#submit");
await piggy.site.dialog.accept();
await piggy.site.waitForNavigation();  // Dialog may trigger navigation
```

### Use Events for Complex Logic

```ts
piggy.dialog.onDialog("default", async (data) => {
  // Centralized dialog handling
  await handleDialog(data);
});
```

---

## Next Steps

- [Captcha API](./captcha) — Handle CAPTCHA and block detection
- [Human API](./human) — Human-like behavior to avoid dialogs
- [Interactions](./click) — Click, type, hover

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*