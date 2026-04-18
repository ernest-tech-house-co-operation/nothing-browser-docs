# Installation

Install Nothing Private Browser on your platform.

---

## Linux (Debian/Ubuntu) — Recommended

### Add Repository

```bash
# Add GPG key
curl -fsSL https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev/nothing-browser-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/nothing-browser.gpg

# Add repository
echo 'deb [signed-by=/usr/share/keyrings/nothing-browser.gpg] https://pub-5119122a931748c3b649ad4ca5aab522.r2.dev stable main' \
  | sudo tee /etc/apt/sources.list.d/nothing-browser.list

# Update and install
sudo apt update
sudo apt install nothing-private-browser
```

### Run

```bash
nothing-private-browser
```

---

## Linux (.deb Package)

### Download

Download the `.deb` from [GitHub Releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases)

### Install

```bash
sudo dpkg -i nothing-private-browser_*_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Run

```bash
nothing-private-browser
```

---

## Linux (tar.gz — Portable)

### Download and Extract

```bash
wget https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases/download/v0.1.0/nothing-private-browser-0.1.0-linux-x86_64.tar.gz
tar -xzf nothing-private-browser-*-linux-x86_64.tar.gz
cd nothing-private-browser-*-linux-x86_64
```

### Run

```bash
./nothing-private-browser
```

**No installation required** — works from any folder.

---

## Arch Linux (AUR)

```bash
yay -S nothing-private-browser
```

Or manually:

```bash
git clone https://aur.archlinux.org/nothing-private-browser.git
cd nothing-private-browser
makepkg -si
```

---

## macOS

### ⚠️ Community Support Only

We currently have **no way of testing macOS builds** with our current resources. The community maintains macOS support.

### Download

Download the `.dmg` from [GitHub Releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases)

### Install

1. Open the downloaded `.dmg`
2. Drag `Nothing Private Browser.app` to `Applications`
3. Right-click → **Open** (first time only, to bypass Gatekeeper)

### Run

```bash
open /Applications/Nothing\ Private\ Browser.app
```

### Build from Source (macOS)

If you're on macOS and can help test:

```bash
git clone https://github.com/ernest-tech-house-co-operation/nothing-private-browser.git
cd nothing-private-browser
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(sysctl -n hw.ncpu)
./nothing-private-browser.app/Contents/MacOS/nothing-private-browser
```

**Community contributions for macOS are welcome!**

---

## Windows

### ⚠️ Installer Coming Soon

A Windows installer (`.exe`) will be created soon. For now, use the portable `.zip`.

### Download

Download the `.zip` from [GitHub Releases](https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases)

### Extract and Run

1. Extract the `.zip` to a folder (e.g., `C:\Program Files\Nothing Private Browser`)
2. Run `nothing-private-browser.exe`

### Create Shortcut (Optional)

1. Right-click `nothing-private-browser.exe`
2. Select **Send to** → **Desktop (create shortcut)**

### Windows Installer (Coming Soon)

- MSI installer in progress
- Auto-start menu integration
- File associations
- Automatic updates

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
| Qt6 WebEngine | 6.4+ | Browser engine |
| Java | 17+ | YouTube tab (optional) |

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
which nothing-private-browser
nothing-private-browser --version

# macOS
ls /Applications/Nothing\ Private\ Browser.app
mdls /Applications/Nothing\ Private\ Browser.app | grep kMDItemVersion

# Windows
# Right-click nothing-private-browser.exe → Properties → Details
```

### Test Launch

```bash
nothing-private-browser
```

Expected output:
- Browser window opens
- No error messages in terminal
- Fresh session (no previous data)

---

## Troubleshooting

### "Command not found" (Linux)

**Solution:** Add to PATH or use full path:

```bash
export PATH=$PATH:/usr/bin
# Or
/usr/bin/nothing-private-browser
```

### "libQt6WebEngineCore.so.6: cannot open shared object"

**Solution:** Install Qt6 WebEngine:

```bash
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6
```

### macOS "Cannot be opened because the developer cannot be verified"

**Solution:** Right-click the app → **Open** → **Open**

Or use terminal:

```bash
xattr -d com.apple.quarantine /Applications/Nothing\ Private\ Browser.app
```

### Windows "VCRUNTIME140.dll not found"

**Solution:** Install [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)

---

## Updates

### Linux (APT repository)

```bash
sudo apt update
sudo apt upgrade nothing-private-browser
```

### Linux (.deb)

Download new `.deb` and install:

```bash
sudo dpkg -i nothing-private-browser_new_version_amd64.deb
```

### Linux (tar.gz)

Download new `tar.gz` and replace the old folder.

### Windows (.zip)

Download new `.zip` and replace the old `.exe`.

### Auto-Update

Auto-update is planned for v0.2.0.

---

## Uninstall

### Linux (APT)

```bash
sudo apt remove nothing-private-browser
sudo apt purge nothing-private-browser  # Remove config files
```

### Linux (.deb)

```bash
sudo dpkg -r nothing-private-browser
```

### Linux (tar.gz)

```bash
rm -rf nothing-private-browser-*
```

### Arch Linux

```bash
yay -R nothing-private-browser
```

### macOS

```bash
rm -rf /Applications/Nothing\ Private\ Browser.app
rm -rf ~/Library/Application\ Support/Nothing\ Private\ Browser
```

### Windows

Delete the folder containing `nothing-private-browser.exe`

---

## Next Steps

- [Privacy Features](./privacy) — Deep dive into privacy protections
- [Roadmap](./roadmap) — Upcoming features
- [Limitations](../technical/limitations) — Known limitations

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
