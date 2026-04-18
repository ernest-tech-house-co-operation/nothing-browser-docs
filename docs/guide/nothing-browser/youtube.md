# YOUTUBE Tab (NthTube)

A YouTube client powered by NewPipe Extractor. **No YouTube account. No API key. No tracking.**

---

## Overview

The YOUTUBE tab is a complete YouTube client built into Nothing Browser. It bypasses YouTube's tracking, ads, and API restrictions by using the NewPipe Extractor library.

| Feature | Status |
|---------|--------|
| Search videos | ✅ Yes |
| Play streams | ✅ Yes |
| Download videos | ✅ Yes |
| Loop mode | ✅ Yes |
| No account required | ✅ Yes |
| No API key | ✅ Yes |
| No tracking | ✅ Yes |
| Comments | ❌ No |
| Playlists | ❌ No |
| Subscriptions | ❌ No |

---

## Requirements

### Java 17 or Later

Java 17+ must be installed on your system:

```bash
# Check Java version
java -version
# openjdk version "17.x.x" ...
```

### Install Java if Missing

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

### Java Not Found

If Java is not found, the status bar shows:

```
java not found — install JDK 11+
```

The tab will not function until Java is installed.

---

## How to Use

### Step 1: Search

1. Type a search query in the search box
2. Press **Enter** or click **SEARCH**
3. Results appear in the left panel

### Step 2: Preview

| Action | Result |
|--------|--------|
| **Single click** | Preview video info (title, duration, views) |
| **Double click** | Load the video for streaming |

### Step 3: Stream or Download

Once a video is loaded:

1. Stream info is fetched automatically
2. Available streams appear in the quality dropdown
3. Choose your preferred quality/format
4. Click:

| Button | Action |
|--------|--------|
| **▶ STREAM** | Play video in the built-in player |
| **↓ DOWNLOAD** | Save video to your computer |

---

## Stream Types

| Label | Description | Best For |
|-------|-------------|----------|
| `[VIDEO+AUDIO]` | Muxed stream — plays directly | Most users |
| `[VIDEO ONLY]` | Video without audio track | Advanced users |
| `[AUDIO]` | Audio only | Music, podcasts |

### Quality Options

| Quality | Typical Bitrate |
|---------|-----------------|
| 144p | Low bandwidth |
| 240p | Mobile |
| 360p | Standard |
| 480p | Good |
| 720p | HD |
| 1080p | Full HD |
| 1440p | 2K |
| 2160p | 4K |

---

## Loop Mode

Click **⟳ LOOP** to enable loop mode.

When enabled:
- Video player restarts automatically when it ends
- Perfect for music, ambient noise, or study sessions
- Click again to disable

---

## Downloading

### How to Download

1. Select a video (double-click from results)
2. Choose quality from dropdown
3. Click **↓ DOWNLOAD**
4. Choose a save location in the file dialog
5. Watch the live progress bar

### Download Progress

```
Downloading: [████████░░░░░░░░] 45% (2.3 MB / 5.1 MB)
```

### File Formats

| Stream Type | Common Formats |
|-------------|----------------|
| VIDEO+AUDIO | `.mp4`, `.webm` |
| VIDEO ONLY | `.mp4`, `.webm` |
| AUDIO | `.m4a`, `.opus`, `.webm` |

### Download Location

Files are saved to your chosen location. No default folder — you choose every time.

---

## Architecture

NthTube uses a **Java JAR bridge** that wraps the NewPipe Extractor library.

```
┌─────────────────────────────────────────────────────────────┐
│                    Nothing Browser                          │
│  ┌─────────────┐                              ┌───────────┐ │
│  │  YOUTUBE    │  ◄── stdio JSON ────►  │   Java    │ │
│  │  Tab (C++)  │                              │  Bridge   │ │
│  └─────────────┘                              └─────┬─────┘ │
│                                                     │       │
└─────────────────────────────────────────────────────┼───────┘
                                                      │
                                                      ▼
                                            ┌─────────────────┐
                                            │ NewPipe         │
                                            │ Extractor       │
                                            │ (Java Library)  │
                                            └─────────────────┘
                                                      │
                                                      ▼
                                                    YouTube
```

### Bridge JAR Location

The bridge JAR (`newpipe-bridge.jar`) is looked for in this order:

1. Same folder as the `nothing-browser` binary
2. `./newpipe-bridge/build/libs/newpipe-bridge-1.0.0.jar`
3. `./newpipe-bridge.jar`

### Communication

The bridge communicates with the Qt frontend over **subprocess stdio**, outputting JSON line by line:

```json
{"type":"search_result","query":"never gonna give you up","items":[...]}
{"type":"stream_info","videoId":"dQw4w9WgXcQ","formats":[...]}
{"type":"download_progress","percent":45,"speed":"2.3 MB/s"}
```

---

## Troubleshooting

### "java not found"

**Error:** Status bar shows Java not found

**Solution:** Install Java 17+

```bash
# Check if Java is installed
which java
java --version

# Install if missing
# See requirements section above
```

### No Results

**Issue:** Search returns empty

**Solutions:**
- Check your internet connection
- YouTube may be blocked in your region
- Try a different search query

### Download Fails

**Issue:** Download starts but fails

**Solutions:**
- Check disk space
- Check write permissions for the save location
- Try a lower quality stream

### Video Won't Play

**Issue:** Stream button does nothing

**Solutions:**
- Select a video first (double-click)
- Choose a quality from the dropdown
- Try a different stream type (VIDEO+AUDIO recommended)

### Bridge JAR Not Found

**Error:** Bridge JAR missing in logs

**Solution:** The JAR is included with the binary. If missing:

```bash
# Reinstall the browser
# Or manually place newpipe-bridge.jar in the binary folder
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Search |
| `Ctrl+F` | Focus search box |
| `Space` | Play/Pause (when player focused) |
| `L` | Toggle loop mode |

---

## Privacy Note

The YOUTUBE tab:

- ✅ **No Google account required**
- ✅ **No API key needed**
- ✅ **No tracking sent to Google**
- ✅ **No ads**
- ✅ **Your watch history stays local**

YouTube itself still sees your requests (IP address, video IDs), but without account linking or tracking cookies.

---

## Limitations

| Limitation | Reason |
|------------|--------|
| No comments | NewPipe doesn't support comments |
| No playlists | NewPipe limitation |
| No subscriptions | Requires account |
| No live streams | Limited support |
| No 4K on some videos | YouTube restrictions |

---

## Next Steps

- [PLUGINS Tab](./plugins) — Extend browser functionality
- [DEVTOOLS Tab](./devtools) — Network capture and inspection
- [Session Management](./sessions) — Save and restore sessions

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
