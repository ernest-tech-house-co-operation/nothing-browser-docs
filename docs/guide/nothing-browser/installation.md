# Installation

Install Nothing Browser on your platform.

---

## Linux (Debian/Ubuntu) — Recommended

### Add Repository (APT)

```bash
# Add GPG key
curl -fsSL https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev/nothing-browser-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/nothing-browser.gpg

# Add repository
echo 'deb [signed-by=/usr/share/keyrings/nothing-browser.gpg] https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev stable main' \
  | sudo tee /etc/apt/sources.list.d/nothing-browser.list

# Update and install
sudo apt update
sudo apt install nothing-browser
```

### Run

```bash
nothing-browser
```

---

## Linux (.deb Package)

### Download

Download the `.deb` from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases)

### Install

```bash
sudo dpkg -i nothing-browser_*_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Run

```bash
nothing-browser
```

---

## Linux (tar.gz — Portable)

No installation required. Works from any folder.

### Download and Extract

```bash
wget https://github.com/BunElysiaReact/nothing-browser/releases/download/v0.1.3/nothing-browser-0.1.3-linux-x86_64.tar.gz
tar -xzf nothing-browser-*-linux-x86_64.tar.gz
cd nothing-browser-*-linux-x86_64
```

### Run

```bash
./nothing-browser
```

### Make Binary Available Globally (Optional)

```bash
sudo ln -s $(pwd)/nothing-browser /usr/local/bin/nothing-browser
nothing-browser  # Now works from anywhere
```

---

## Arch Linux (AUR)

```bash
yay -S nothing-browser
```

Or manually:

```bash
git clone https://aur.archlinux.org/nothing-browser.git
cd nothing-browser
makepkg -si
```

### Run

```bash
nothing-browser
```

---

## Fedora

### Install Dependencies

```bash
sudo dnf install qt6-qtwebengine qt6-qtbase
```

### Download and Run

```bash
# Download tar.gz from releases
tar -xzf nothing-browser-*-linux-x86_64.tar.gz
cd nothing-browser-*-linux-x86_64
./nothing-browser
```

---

## macOS

### Download

Download the `.dmg` from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases)

### Install

1. Open the downloaded `.dmg`
2. Drag `Nothing Browser.app` to `Applications`
3. Right-click → **Open** (first time only, to bypass Gatekeeper)

### Run

```bash
open /Applications/Nothing\ Browser.app
```

### From Terminal

```bash
/Applications/Nothing\ Browser.app/Contents/MacOS/nothing-browser
```

---

## Windows

### Download

Download the `.zip` from [GitHub Releases](https://github.com/BunElysiaReact/nothing-browser/releases)

### Extract and Run

1. Extract the `.zip` to a folder (e.g., `C:\Program Files\Nothing Browser`)
2. Run `nothing-browser.exe`

### Create Shortcut (Optional)

1. Right-click `nothing-browser.exe`
2. Select **Send to** → **Desktop (create shortcut)**

---

## Dependencies

### Linux

The `.deb` package handles dependencies automatically. For `tar.gz`, install manually:

```bash
# Debian/Ubuntu
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6 libqt6core6

# Arch
sudo pacman -S qt6-webengine qt6-base

# Fedora
sudo dnf install qt6-qtwebengine qt6-qtbase
```

### All Platforms

| Dependency | Version | Required For |
|------------|---------|--------------|
| **Qt6 WebEngine** | 6.4+ | Browser engine |
| **Java** | 17+ | YouTube tab (optional) |

### Java (Optional — for YouTube tab)

```bash
# Debian/Ubuntu
sudo apt install openjdk-17-jre

# Arch
sudo pacman -S jdk17-openjdk

# macOS
brew install openjdk@17

# Windows
# Download from adoptium.net
```

---

## Verification

### Check Installation

```bash
# Linux
which nothing-browser
nothing-browser --version

# macOS
ls /Applications/Nothing\ Browser.app
mdls /Applications/Nothing\ Browser.app | grep kMDItemVersion

# Windows
# Right-click nothing-browser.exe → Properties → Details
```

### Test Launch

```bash
nothing-browser
```

Expected output:
- Browser window opens
- DEVTOOLS tab shows "NETWORK [0]"
- No error messages

---

## Which Binary to Use?

| Binary | Use Case | Visibility | Auto-Update |
|--------|----------|------------|--------------|
| **Headless** | Automated scraping, CI/CD | No window | ✅ Yes |
| **Headful** | Debugging, visible browsing | Visible window | ✅ Yes |

### For Piggy Library Users

Download the **headless** binary and place it in your project root:

```bash
# Your project structure
your-project/
├── nothing-browser-headless   # ← binary here
├── node_modules/
├── package.json
└── your-script.ts
```

---

## Troubleshooting

### "Command not found" (Linux)

**Solution:** Add to PATH or use full path:

```bash
export PATH=$PATH:/usr/bin
# Or
/usr/bin/nothing-browser
```

### "libQt6WebEngineCore.so.6: cannot open shared object"

**Solution:** Install Qt6 WebEngine:

```bash
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6
```

### macOS "Cannot be opened because developer cannot be verified"

**Solution:** Right-click the app → **Open** → **Open**

Or use terminal:

```bash
xattr -d com.apple.quarantine /Applications/Nothing\ Browser.app
```

### Windows "VCRUNTIME140.dll not found"

**Solution:** Install [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)

### Java Not Found (YouTube tab)

**Solution:** Install Java 17+:

```bash
java -version  # Check if installed
# Install from instructions above
```

---

## Updates

### Linux (APT repository)

```bash
sudo apt update
sudo apt upgrade nothing-browser
```

### Linux (.deb)

Download new `.deb` and install:

```bash
sudo dpkg -i nothing-browser_new_version_amd64.deb
```

### Linux (tar.gz)

Download new `tar.gz` and replace the old folder.

### Windows

Download new `.zip` and replace the old `.exe`.

### macOS

Download new `.dmg` and replace the old app.

### In-App Auto-Update

The browser checks for updates automatically. See [Auto-Update](./auto-update).

---

## Uninstall

### Linux (APT)

```bash
sudo apt remove nothing-browser
sudo apt purge nothing-browser  # Remove config files
```

### Linux (.deb)

```bash
sudo dpkg -r nothing-browser
```

### Linux (tar.gz)

```bash
rm -rf nothing-browser-*
```

### Arch Linux

```bash
yay -R nothing-browser
```

### macOS

```bash
rm -rf /Applications/Nothing\ Browser.app
rm -rf ~/Library/Application\ Support/nothing-browser
```

### Windows

Delete the folder containing `nothing-browser.exe`

---

## Next Steps

- [DEVTOOLS Tab](./devtools) — Capture network traffic
- [BROWSER Tab](./browser) — Browse with capture
- [Piggy Library](../piggy/quickstart) — Automated scraping

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
