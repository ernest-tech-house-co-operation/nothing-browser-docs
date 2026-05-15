# Installation

Get Piggy up and running in minutes.

## Requirements

- [Bun](https://bun.sh) ≥ 1.0 installed (or Node.js ≥ 18)
- Nothing Browser binary v0.1.14+

---

## Step 1: Install the Package

```bash
bun add nothing-browser
```

---

## Step 2: Download the Binary

Download from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases).

### Linux / macOS Users (Simple)

```bash
# Extract
tar -xzf nothing-browser-headless-*-linux-x86_64.tar.gz

# Make executable
chmod +x nothing-browser-headless

# Your project structure:
# your-project/
#   ├── nothing-browser-headless   # ← binary here
#   ├── node_modules/
#   ├── package.json
#   └── your-script.ts
```

### Windows Users (Custom Path Required)

Windows requires `.dll` files that must stay with the `.exe`.

**Our recommendation:**

1. Extract the zip
2. Rename the folder to `brow`
3. Place `brow` folder in your project root

```
C:\my-scraper\
├── brow\
│   └── nothing-browser-headless.exe
├── package.json
└── index.ts
```

Then in your code:

```ts
await piggy.launch({ 
  binary: "brow/nothing-browser-headless.exe" 
});
```

---

## Step 3: Verify Installation

Create `test.ts`:

```ts
import piggy from "nothing-browser";

// Linux / macOS
await piggy.launch({ mode: "tab", binary: "headless" });

// Windows
// await piggy.launch({ mode: "tab", binary: "brow/nothing-browser-headless.exe" });

console.log("✅ Piggy is working!");
await piggy.close();
```

Run:

```bash
bun run test.ts
```

---

## Troubleshooting

### "Binary not found"

**Linux/macOS:** Ensure binary is in project root and executable (`chmod +x`)

**Windows:** Use full path with `.exe` and keep `.dll` files in same folder

### "Connection refused"

Run binary manually once:
```bash
./nothing-browser-headless
# Wait for "Headless daemon on socket"
# Press Ctrl+C, then run script again
```

### "Missing dependencies" (Linux)

```bash
# Debian/Ubuntu
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6
```

---

## Next Steps

- [Quick Start](./quickstart) — Your first scraper
- [Core Concepts](./core/launch) — Launch & register
- [Find API](./find) — Query DOM elements

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*