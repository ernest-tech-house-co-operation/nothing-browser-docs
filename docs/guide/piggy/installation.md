# Installation

Get Piggy up and running in minutes.

## Requirements

- [Bun](https://bun.sh) ≥ 1.0 installed (or Node.js ≥ 18)
- Nothing Browser binary (see below)

---

## Step 1: Install the Package

```bash
bun add nothing-browser
```

## you can also use npm

---

## Step 2: Download the Binary

Download the Nothing Browser binary for your platform from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases).

### Which Binary?

| Binary | Use Case | Visibility |
|--------|----------|------------|
| `nothing-browser-headless` | Automated scraping, CI/CD, servers | No window (invisible) |
| `nothing-browser-headful` | Debugging, sites that detect headless | Visible window |

**For most scraping tasks, use `headless`.**

### Platform Downloads

| Platform | Headless | Headful |
|----------|----------|---------|
| Linux (x86_64) | `nothing-browser-headless-*-linux-x86_64.tar.gz` | `nothing-browser-headful-*-linux-x86_64.tar.gz` |
| Windows (x64) | `nothing-browser-headless-*-windows-x64.zip` | `nothing-browser-headful-*-windows-x64.zip` |
| macOS | `nothing-browser-headless-*-macos.tar.gz` | `nothing-browser-headful-*-macos.tar.gz` |

---

## Step 3: Place the Binary

### Linux / macOS Users (Simple)

Just place the binary in your project root:

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

Then in your code:

```typescript
await piggy.launch({ binary: "headless" });
```

**That's it. One file. No DLLs. No paths. Just works.**

---

### Windows Users (Custom Path Required)

For Windows users, the binary requires `.dll` files that must stay together with the `.exe`. You cannot place the `.exe` alone.

**Our recommendation:**

1. Download the Windows zip file
2. Extract the entire folder
3. **Rename the folder to something simple** — e.g., `brow`
4. Place the `brow` folder in your project root

```
C:\my-scraper\
├── node_modules\
├── package.json
├── index.ts
└── brow\                      ← renamed folder
    ├── nothing-browser-headless.exe
    ├── qt6webengine.dll
    ├── ...
```

5. In your code:

```typescript
await piggy.launch({ 
  binary: "brow/nothing-browser-headless.exe" 
});
```

That's it. Simple.

### Why This Works

| Before | After |
|--------|-------|
| Messy extracted folder name | Renamed to `brow` |
| Binary + DLLs scattered | All files together in one folder |
| Hard to type path | `brow/nothing-browser-headless.exe` — clean and short |

### Windows Path Examples

```typescript
// ✅ Our recommendation — clean and simple
binary: "brow/nothing-browser-headless.exe"

// ✅ Full absolute path (also works)
binary: "C:\\my-scraper\\brow\\nothing-browser-headless.exe"

// ✅ Forward slashes work too
binary: "C:/my-scraper/brow/nothing-browser-headless.exe"

// ❌ Don't do this — missing .exe
binary: "brow/nothing-browser-headless"
```

### The Only Rule

**Make sure the path is absolutely correct.** The detector won't give a helpful error if it's wrong.

```typescript
// If you see this error:
❌ Binary not found at custom path: brow/nothing-browser-headless.exe

// Double-check:
// 1. Does the folder exist?
// 2. Is the .exe inside it?
// 3. Did you spell it correctly?
```

---

## How Path Detection Works

| Input | Behavior |
|-------|----------|
| `"headless"` | Looks for `nothing-browser-headless` in current working directory |
| `"headful"` | Looks for `nothing-browser-headful` in current working directory |
| Any other string | Treats as raw path, checks existence |

---

## Step 4: Verify Installation

Create a test file `test.ts`:

```ts
import piggy from "nothing-browser";

// Linux / macOS
await piggy.launch({ mode: "tab", binary: "headless" });

// Windows — use your custom path
// await piggy.launch({ mode: "tab", binary: "brow/nothing-browser-headless.exe" });

console.log("✅ Piggy is working!");
await piggy.close();
```

Run it:

```bash
bun run test.ts
```

You should see:
```
[info] [piggy] launched — tab mode: "tab", binary: "headless"
[success] Connected to Piggy server
✅ Piggy is working!
[info] [piggy] closed
```

---

## Binary Detection

You can check which binary would be used without launching:

```ts
import piggy from "nothing-browser";

const headlessPath = piggy.detect("headless");
const headfulPath = piggy.detect("headful");
const customPath = piggy.detect("brow/nothing-browser-headless.exe");

console.log("Headless:", headlessPath);
console.log("Headful:", headfulPath);
console.log("Custom:", customPath);
```

---

## Troubleshooting

### "Binary not found"

**Error:**
```
Error: No nothing-browser-headless binary found in current directory
```

**Solution (Linux/macOS):**
- Ensure the binary is in your project root
- Run `ls -la` to verify it exists
- Ensure it's executable: `chmod +x nothing-browser-headless`

**Solution (Windows):**
- Use a custom path instead of `"headless"`
- Double-check the path is correct
- Ensure `.exe` extension is included
- Verify all `.dll` files are in the same folder

### "Binary not found at custom path" (Windows)

**Error:**
```
❌ Binary not found at custom path: brow/nothing-browser-headless.exe
```

**Solution:**
- Double-check the folder name — is it `brow` or something else?
- Does `brow/nothing-browser-headless.exe` actually exist?
- Did you extract ALL files from the zip? (Keep the DLLs!)

### "Connection refused"

**Error:**
```
Error: connect ECONNREFUSED /tmp/piggy
```

**Solution:**
- The binary may have crashed
- Kill any existing processes: `pkill -f nothing-browser` (Linux/macOS) or `taskkill /f /im nothing-browser-headless.exe` (Windows)
- Try running with `headful` mode to see errors

### "Missing dependencies" (Linux)

**Error:**
```
error while loading shared libraries: libQt6WebEngineCore.so.6
```

**Solution:**
```bash
# Debian/Ubuntu
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6

# Arch
sudo pacman -S qt6-webengine

# Fedora
sudo dnf install qt6-qtwebengine
```

### Windows DLL Issues

**Error:** DLL missing or not found

**Solution:**
- Keep the `.exe` and ALL `.dll` files together in the same folder
- Do not move the `.exe` alone
- Extract the entire zip contents, not just the `.exe`
- Use our recommended `brow` folder structure

---

## Quick Summary

| Platform | Recommended Setup |
|----------|-------------------|
| **Linux / macOS** | Place binary in project root → `binary: "headless"` |
| **Windows** | Extract zip to `brow` folder → `binary: "brow/nothing-browser-headless.exe"` |

---

## Next Steps

- [Launch & Register](./launch) — Configure and start the browser
- [Quick Start](./quickstart) — Your first scraper in 5 minutes
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
