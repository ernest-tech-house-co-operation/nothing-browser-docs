# Installation

Nothing Browser ships prebuilt binaries for Linux. macOS and Windows are coming in v0.2.0.

## Linux — One-Line Installer

The fastest way. Downloads the latest release and installs it system-wide.

```bash
curl -fsSL https://raw.githubusercontent.com/BunElysiaReact/nothing-browser/main/install.sh | sudo bash
```

Then run:

```bash
nothing-browser
```

## Linux — .deb Package (Debian / Ubuntu)

```bash
# Install dependencies first
sudo apt-get install -f

# Install the .deb
sudo apt install ./nothing-browser_*_amd64.deb
```

::: warning Auto-update note
If you install via `.deb` to `/usr/bin`, the in-app auto-updater cannot replace the binary without elevated permissions. Use the `tar.gz` release if you want fully seamless auto-updates.
:::

## Linux — tar.gz (No install, portable)

```bash
tar -xzf nothing-browser-*-linux-x86_64.tar.gz
cd nothing-browser-*-linux-x86_64
./nothing-browser
```

This version supports in-app auto-update with no `sudo` required.

## Arch Linux (AUR)

```bash
yay -S nothing-browser
```

## macOS

Download the `.dmg` from [Releases](https://github.com/BunElysiaReact/nothing-browser/releases) → drag to Applications. No install needed.

::: info
macOS support is in active development. Full release in v0.2.0.
:::

## Windows

Download the `.zip` from [Releases](https://github.com/BunElysiaReact/nothing-browser/releases) → extract → run `nothing-browser.exe`.

::: info
Windows support is in active development. Full release in v0.2.0.
:::

## Dependencies

Nothing Browser uses Qt6 WebEngine. The `.deb` and installer handle this automatically. For the `tar.gz`, Qt6 must be installed:

```bash
# Debian / Ubuntu
sudo apt install libqt6webenginewidgets6 libqt6webenginecore6

# Arch
sudo pacman -S qt6-webengine

# Fedora
sudo dnf install qt6-qtwebengine
```

## YouTube Tab — Java Requirement

The YOUTUBE tab uses the NewPipe Extractor bridge, which requires Java 17 or later:

```bash
# Debian / Ubuntu
sudo apt install openjdk-17-jre

# Check version
java -version
```
