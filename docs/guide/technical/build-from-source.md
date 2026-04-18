# Build from Source

Build Nothing Browser from source code. Useful for development, custom modifications, or when pre-built binaries aren't available for your platform.

---

## Requirements

### All Platforms

| Requirement | Version | Notes |
|-------------|---------|-------|
| Git | Latest | For cloning repository |
| CMake | 3.20+ | Build system |
| C++ Compiler | C++17 compatible | GCC, Clang, or MSVC |
| Java | 17+ | For YouTube tab (NewPipe Extractor) |
| Qt6 | 6.4+ | Qt6 WebEngine required |

### Platform-Specific

| Platform | Dependencies |
|----------|--------------|
| **Linux** | Qt6 WebEngine development packages, build-essential |
| **macOS** | Xcode Command Line Tools, Qt6 via Homebrew |
| **Windows** | Visual Studio 2022, Qt6 (Qt Installer) |

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

## Linux (Arch Linux)

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

### Build from Source (Arch)

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

### Build

Open **Developer Command Prompt for VS 2022**:

```batch
# Clone repository
git clone https://github.com/BunElysiaReact/nothing-browser.git
cd nothing-browser

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

### Using Build Script

```batch
# From the repository root
scripts\build-windows.bat
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

## Build Outputs

| Platform | Binary Location | Package Output |
|----------|-----------------|----------------|
| Linux | `build/nothing-browser` | `.deb` or `.tar.gz` |
| macOS | `build/nothing-browser.app` | `.dmg` or `.tar.gz` |
| Windows | `build/Release/nothing-browser.exe` | `.zip` or `.exe` |

---

## CI/CD with GitHub Actions

The project uses GitHub Actions for automated builds:

```yaml
# .github/workflows/build.yml (simplified)
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Qt6
        uses: jurplel/install-qt-action@v3
        with:
          version: '6.4.0'
          modules: 'qtwebengine'
      
      - name: Build
        run: |
          mkdir build && cd build
          cmake .. -DCMAKE_BUILD_TYPE=Release
          cmake --build . --config Release
      
      - name: Package
        run: cpack --config build/CPackConfig.cmake
      
      - name: Upload
        uses: actions/upload-artifact@v4
        with:
          name: nothing-browser-${{ matrix.os }}
          path: build/*.tar.gz
```

---

## Next Steps

- [Limitations](./limitations) — Known limitations
- [TLS Fingerprint Report](./tls-fingerprint) — Technical deep dive
- [Contributing](../community/contributing) — How to contribute

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
