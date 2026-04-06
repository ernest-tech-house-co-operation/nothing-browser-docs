# Build from Source

Building Nothing Browser from source requires Qt6 WebEngine, CMake, and a C++ compiler. Java 17 is needed for the YouTube bridge.

## Requirements

| Platform | Dependencies |
| --- | --- |
| Linux | Qt6 WebEngine, CMake 3.20+, GCC or Clang, Java 17 |
| macOS | Qt6 via Homebrew, CMake, Xcode CLT, Java 17 |
| Windows | Qt6 via Qt Installer, CMake, Visual Studio 2022, Java 17 |

## Linux / macOS

```bash
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
./nothing-browser
```

## Windows

Open a Developer Command Prompt. Edit `QT6_DIR` in `scripts/build-windows.bat` to point to your Qt6 installation first.

```bat
scripts\build-windows.bat
```

## Install Qt6 WebEngine (Linux)

```bash
# Debian / Ubuntu
sudo apt install qt6-webengine-dev qt6-base-dev cmake build-essential

# Arch
sudo pacman -S qt6-webengine qt6-base cmake base-devel

# Fedora
sudo dnf install qt6-qtwebengine-devel qt6-qtbase-devel cmake gcc-c++
```

## Project Structure

```
nothing-browser/
├── core/
│   ├── app/                  # MainWindow
│   ├── engine/               # Interceptor, FingerprintSpoofer,
│   │                         # NetworkCapture, UpdateChecker
│   ├── tabs/                 # BrowserTab, DevToolsPanel,
│   │                         # NewsTab, YoutubeTab, PluginsTab
│   └── main.cpp
├── assets/
│   └── icons/logo.svg
├── scripts/
│   ├── build-deb.sh
│   ├── build-windows.bat
│   └── PKGBUILD
├── .github/
│   └── workflows/
│       └── build-release.yml
├── install.sh
└── CMakeLists.txt
```

## CI / Releasing

Nothing Browser uses GitHub Actions to build all platforms automatically on tag push.

```bash
git add .
git commit -m "feat: what changed"
git push
git tag v0.1.4
git push origin v0.1.4
```

GitHub Actions builds Linux, Windows, and macOS and publishes the release with all assets attached. The in-app update checker picks up the new release within 6 hours.
