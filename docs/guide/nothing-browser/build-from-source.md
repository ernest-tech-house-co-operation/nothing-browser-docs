# Build from Source

Building Nothing Browser from source requires Qt6 WebEngine, CMake, and a C++ compiler. Java 17 is needed for the YouTube bridge.

---

## Requirements

| Platform | Dependencies |
| --- | --- |
| **Linux** | Qt6 WebEngine, CMake 3.20+, GCC or Clang, Java 17 |
| **macOS** | Qt6 via Homebrew, CMake, Xcode CLT, Java 17 |
| **Windows** | Qt6 via Qt Installer, CMake, Visual Studio 2022, Java 17 |

### All Platforms

| Requirement | Version | Notes |
|-------------|---------|-------|
| Git | Latest | For cloning repository |
| CMake | 3.20+ | Build system |
| C++ Compiler | C++17 compatible | GCC, Clang, or MSVC |
| Java | 17+ | For YouTube tab (NewPipe Extractor) |
| Qt6 | 6.4+ | Qt6 WebEngine required |

---

## Linux (Debian/Ubuntu)

### Install Dependencies

```bash
# Install Qt6 WebEngine and build tools
sudo apt update
sudo apt install -y \
    build-essential \
    cmake \
    git \
    openjdk-17-jre \
    qt6-base-dev \
    qt6-webengine-dev \
    libqt6webenginewidgets6 \
    libqt6webenginecore6

# Verify installations
cmake --version
qmake6 --version
java -version
```

### Clone and Build

```bash
# Clone repository
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser

# Create build directory
mkdir build && cd build

# Configure with CMake
cmake .. -DCMAKE_BUILD_TYPE=Release

# Build (use all CPU cores)
make -j$(nproc)

# Run the built browser
./nothing-browser
```

### Install System-Wide

```bash
# After building, install
sudo make install

# Run from anywhere
nothing-browser
```

### Build .deb Package

```bash
# From the build directory
cpack -G DEB

# Install the generated .deb
sudo dpkg -i nothing-browser_*.deb
```

---

## Arch Linux

### Install Dependencies

```bash
# Install required packages
sudo pacman -S \
    base-devel \
    cmake \
    git \
    java-openjdk \
    qt6-base \
    qt6-webengine

# Or install via AUR (recommended)
yay -S nothing-browser
```

### Build from Source

```bash
# Clone and build
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
./nothing-browser
```

---

## Fedora

### Install Dependencies

```bash
sudo dnf install \
    cmake \
    gcc-c++ \
    git \
    java-17-openjdk \
    qt6-qtbase-devel \
    qt6-qtwebengine-devel
```

### Build

```bash
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
./nothing-browser
```

---

## macOS

### Install Dependencies

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Qt6 and dependencies
brew install qt6 cmake git openjdk@17

# Add Qt6 to PATH
echo 'export PATH="/opt/homebrew/opt/qt6/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
cmake --version
qmake --version
java -version
```

### Build

```bash
# Clone repository
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser

# Create build directory
mkdir build && cd build

# Configure (adjust Qt path if needed)
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_PREFIX_PATH=/opt/homebrew/opt/qt6

# Build
make -j$(sysctl -n hw.ncpu)

# Run
./nothing-browser.app/Contents/MacOS/nothing-browser
```

### Create .dmg Package

```bash
# From build directory
cpack -G DragNDrop

# Output: nothing-browser-*.dmg
```

---

## Windows

### Install Dependencies

1. **Visual Studio 2022**
   - Download from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/)
   - Select "Desktop development with C++" workload

2. **Qt6**
   - Download from [qt.io/download](https://www.qt.io/download)
   - Select "Qt 6.4.0 or later"
   - Select "MSVC 2022 64-bit" component
   - Select "Qt WebEngine" component

3. **CMake**
   - Download from [cmake.org/download](https://cmake.org/download/)
   - Add to system PATH during installation

4. **Java 17**
   - Download from [adoptium.net](https://adoptium.net/)
   - Add to system PATH

5. **Git**
   - Download from [git-scm.com](https://git-scm.com/)

### Set Environment Variables

```powershell
# Set Qt6 path (adjust to your installation)
setx QT6_DIR "C:\Qt\6.4.0\msvc2022_64"

# Verify
echo %QT6_DIR%
```

### Build Using Script

Open **Developer Command Prompt for VS 2022**:

```batch
# Clone repository
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser

# Edit QT6_DIR in scripts/build-windows.bat first
scripts\build-windows.bat
```

### Manual Build

```batch
# Create build directory
mkdir build
cd build

# Configure
cmake .. -G "Visual Studio 17 2022" -A x64 -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build . --config Release --parallel

# Run
.\Release\nothing-browser.exe
```

---

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
│   ├── build-deb.sh          # Build .deb package
│   ├── build-windows.bat     # Build Windows release
│   └── PKGBUILD              # Arch AUR package
├── .github/
│   └── workflows/
│       └── build-release.yml # CI — builds all platforms on tag push
├── install.sh                # Universal Linux installer
└── CMakeLists.txt
```

---

## Build Options

### CMake Options

| Option | Default | Description |
|--------|---------|-------------|
| `-DCMAKE_BUILD_TYPE` | `Debug` | `Release` for production |
| `-DBUILD_TESTS` | `ON` | Build unit tests |
| `-DBUILD_NEWPIPE_BRIDGE` | `ON` | Build YouTube Java bridge |
| `-DUSE_SYSTEM_QT` | `ON` | Use system Qt6 libraries |

### Example with Options

```bash
cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_TESTS=OFF \
    -DBUILD_NEWPIPE_BRIDGE=ON
```

---

## CI / Releasing

Nothing Browser uses **GitHub Actions** to build all platforms automatically on tag push.

### Ship a New Release

```bash
git add .
git commit -m "feat: what changed"
git push
git tag v0.1.4
git push origin v0.1.4
```

### What Happens

GitHub Actions automatically:

| Step | Output |
|------|--------|
| 1. Builds Linux | `.deb`, `.tar.gz` |
| 2. Builds Windows | `.zip`, `.exe` |
| 3. Builds macOS | `.dmg`, `.tar.gz` |
| 4. Creates Release | All assets attached |
| 5. Updates "latest" | Tag points to new release |

### Update Notification

The in-app update checker picks up the new release within **6 hours**.

---

## Troubleshooting

### Qt6 WebEngine Not Found

**Error:**
```
Could not find a package configuration file provided by "Qt6WebEngine"
```

**Solution:**
```bash
# Debian/Ubuntu
sudo apt install qt6-webengine-dev

# Arch
sudo pacman -S qt6-webengine

# macOS
brew install qt6

# Windows
# Ensure Qt6 path is set correctly
```

### Java Not Found

**Error:**
```
Could not find Java. Please install Java 17+
```

**Solution:**
```bash
# Debian/Ubuntu
sudo apt install openjdk-17-jre

# Arch
sudo pacman -S jdk17-openjdk

# macOS
brew install openjdk@17

# Windows
# Download from adoptium.net and add to PATH
```

### CMake Version Too Old

**Error:**
```
CMake 3.20 or higher is required
```

**Solution:**
```bash
# Debian/Ubuntu
sudo apt remove cmake
wget -qO- "https://github.com/Kitware/CMake/releases/download/v3.27.0/cmake-3.27.0-linux-x86_64.tar.gz" | sudo tar --strip-components=1 -xz -C /usr/local

# macOS
brew upgrade cmake

# Windows
# Download latest from cmake.org
```

### Build Fails with Missing Headers

**Solution:**
```bash
# Clean build directory and retry
rm -rf build
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make clean
make -j$(nproc)
```

---

## Docker Build

```dockerfile
# Dockerfile
FROM ubuntu:22.04

RUN apt update && apt install -y \
    build-essential \
    cmake \
    git \
    openjdk-17-jre \
    qt6-base-dev \
    qt6-webengine-dev \
    libgl1-mesa-dev \
    libxkbcommon-x11-0

WORKDIR /app
RUN git clone https://github.com/BunElysiaReact/nothing-browser.git .

RUN mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc)

CMD ["./build/nothing-browser"]
```

```bash
# Build Docker image
docker build -t nothing-browser .

# Run
docker run --rm -it nothing-browser
```

---

## Build Outputs

| Platform | Binary Location | Package Output |
|----------|-----------------|----------------|
| Linux | `build/nothing-browser` | `.deb` or `.tar.gz` |
| macOS | `build/nothing-browser.app` | `.dmg` or `.tar.gz` |
| Windows | `build/Release/nothing-browser.exe` | `.zip` or `.exe` |

---

## Next Steps

- [Limitations](../technical/limitations) — Known limitations
- [TLS Fingerprint Report](../technical/tls-fingerprint.md) — Technical deep dive
- [Contributing](../community/contributing) — How to contribute

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
