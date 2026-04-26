# 🤖 Gemini Scraper

Ask Google Gemini questions programmatically — no API key, no login required. Uses the public unauthenticated interface.

---

## Features

- ✅ **No API key needed** — uses the public Gemini web interface
- ✅ **No login required** — works with the unauthenticated session
- ✅ **Streaming response handling** — waits for complete answer before returning
- ✅ **Built-in API server** — REST endpoint for questions
- ✅ **Human-like interaction** — natural typing and submission

---

## How It Works

The script:
1. Opens Gemini's web interface (`https://gemini.google.com`)
2. Types your question into the editor
3. Clicks send (or presses Enter)
4. Waits for the response to finish streaming
5. Returns the complete answer as JSON

> ⚠️ **Note:** This uses the **unauthenticated** Gemini interface. Rate limits apply. Be respectful.

---

## Output Example

```json
{
  "question": "What is the capital of Kenya?",
  "answer": "The capital of Kenya is Nairobi.",
  "timestamp": 1700000000000
}
```

---

## The Code

```typescript
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headful" });
await piggy.register("gemini", "https://gemini.google.com");

piggy.actHuman(true);

await piggy.gemini.navigate();
await piggy.gemini.waitForSelector("div.ql-editor");

await piggy.gemini.api("/ask", async (_params, query) => {
  const question = query.q;

  if (!question) {
    return { error: "Missing ?q= parameter" };
  }

  // Count how many responses exist BEFORE we send
  const beforeCount = await piggy.gemini.evaluate(() => {
    return document.querySelectorAll("message-content .markdown").length;
  });

  await piggy.gemini.click("div.ql-editor");
  await piggy.gemini.wait(300);

  await piggy.gemini.evaluate((q) => {
    const editor = document.querySelector("div.ql-editor");
    editor.focus();
    document.execCommand("selectAll", false);
    document.execCommand("delete", false);
    document.execCommand("insertText", false, q);
  }, question);

  await piggy.gemini.wait(800);

  // Wait for send button to become active
  await piggy.gemini.evaluate(() => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const btn = document.querySelector("button[aria-label='Send message']");
        if (btn && !btn.disabled) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
      setTimeout(() => { clearInterval(interval); resolve(); }, 8000);
    });
  });

  await piggy.gemini.wait(300);

  // Press Enter to submit
  await piggy.gemini.evaluate(() => {
    const editor = document.querySelector("div.ql-editor");
    editor.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Enter", code: "Enter", keyCode: 13, bubbles: true
    }));
  });

  // Wait for a NEW response to appear (count must exceed beforeCount)
  await piggy.gemini.evaluate((before) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const count = document.querySelectorAll("message-content .markdown").length;
        if (count > before) {
          clearInterval(interval);
          resolve();
        }
      }, 300);
      setTimeout(() => { clearInterval(interval); resolve(); }, 30000);
    });
  }, beforeCount);

  // Poll until the new response stops changing (streaming done)
  let lastText = "";
  let stableCount = 0;

  while (stableCount < 4) {
    await piggy.gemini.wait(800);

    const currentText = await piggy.gemini.evaluate(() => {
      const msgs = document.querySelectorAll("message-content .markdown");
      return msgs[msgs.length - 1]?.innerText ?? "";
    });

    if (currentText === lastText && currentText.length > 0) {
      stableCount++;
    } else {
      stableCount = 0;
      lastText = currentText;
    }
  }

  return {
    question,
    answer: lastText,
    timestamp: Date.now(),
  };
}, { ttl: 0 });

await piggy.serve(3000, {
  title: "Gemini Scraper API",
  version: "1.0.0",
});

console.log('Ready → curl "http://localhost:3000/gemini/ask?q=hello"');

await piggy.gemini.noclose();
```

---

## How to Run

```bash
# 1. Install Piggy
bun add nothing-browser

# 2. Download binary v0.1.12+ from GitHub Releases
# Place nothing-browser-headless in your project root

# 3. Run the script
bun run gemini-scraper.ts

# 4. Ask a question
curl "http://localhost:3000/gemini/ask?q=What%20is%20the%20capital%20of%20France?"
```

---

## API Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gemini/ask?q=your+question` | Ask Gemini a question, get JSON response |

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | ✅ Yes | Your question (URL encoded) |

### Response

```json
{
  "question": "What is the capital of France?",
  "answer": "The capital of France is Paris.",
  "timestamp": 1700000000000
}
```

---

## Important Notes

### No Login Required

This script uses the **unauthenticated** Gemini interface. You don't need a Google account or API key.

### Rate Limits

Google has rate limits for unauthenticated users. If you send too many requests too quickly, you may get temporarily blocked.

**Recommended:**
- Add delays between requests
- Use `actHuman(true)` for natural timing
- Don't spam

### Selectors May Change

Gemini's HTML structure changes occasionally. If the script stops working, update these selectors:

| Element | Current Selector |
|---------|------------------|
| Editor | `div.ql-editor` |
| Send button | `button[aria-label='Send message']` |
| Response content | `message-content .markdown` |

---

## Limitations

| Limitation | Explanation |
|------------|-------------|
| **No authentication** | Can't access Gemini Advanced or paid features |
| **Rate limited** | Google restricts unauthenticated usage |
| **Headful only** | Gemini may detect headless mode |
| **Response streaming** | Script waits for complete answer (may take 5-15 seconds) |

---

## Requirements

- Binary: v0.1.12+
- Library: v0.0.18+
- Headful mode required (Gemini detects headless)

---

## Next Steps

- [Script Marketplace](./) — Browse more scripts
- [Amazon Scraper](./amazon) — Product search API
- [eBay Scraper](./ebay) — Reseller intelligence

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*