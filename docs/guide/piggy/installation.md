# Installation

Get Piggy up and running in minutes.

## Requirements

- [Bun](https://bun.sh) ≥ 1.0 installed
- Nothing Browser binary placed in your **project root**

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

### Extract and Place

**Linux / macOS:**
```bash
# Extract
tar -xzf nothing-browser-headless-*-linux-x86_64.tar.gz

# Make executable
chmod +x nothing-browser-headless

# Your project structure should look like:
# your-project/
#   ├── nothing-browser-headless   # ← binary here
#   ├── node_modules/
#   ├── package.json
#   └── your-script.ts
```

**Windows:**
```powershell
# Extract the zip file
# Place nothing-browser-headless.exe in your project root
```

---

## Step 3: Verify Installation

Create a test file `test.ts`:

```ts
import piggy from "nothing-browser";

// This will fail if binary is missing or not executable
await piggy.launch({ mode: "tab", binary: "headless" });
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

Piggy automatically looks for the binary in this order:

1. Current working directory (`./nothing-browser-headless`)
2. `./bin/nothing-browser-headless`
3. System PATH

You can also check which binary would be used without launching:

```ts
import piggy from "nothing-browser";

const binary = piggy.detect("headless");
console.log("Using:", binary); // "/path/to/nothing-browser-headless"
```

---

## Troubleshooting

### "Binary not found"

**Error:**
```
Error: No nothing-browser-headless binary found in current directory
```

**Solution:**
- Ensure the binary is in your project root
- Run `ls -la` to verify it exists
- On Linux/macOS, ensure it's executable: `chmod +x nothing-browser-headless`

### "Connection refused"

**Error:**
```
Error: connect ECONNREFUSED /tmp/piggy
```

**Solution:**
- The binary may have crashed
- Kill any existing processes: `pkill -f nothing-browser`
- Try running with `headful` mode to see errors: `binary: "headful"`

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

---

## Next Steps

- [Launch & Register](./launch) — Configure and start the browser
- [Quick Start](./quickstart) — Your first scraper in 5 minutes
- [exposeFunction (RPC)](./expose-function) — Call Node.js from browser

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
