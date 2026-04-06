# YOUTUBE Tab (NthTube)

A YouTube client powered by NewPipe Extractor. No YouTube account. No API key. No tracking.

## Requirements

Java 17 or later must be installed:

```bash
java -version
# openjdk version "17.x.x" ...
```

If Java is not found, the status bar shows: `java not found — install JDK 11+`

## How to Use

1. Type a search query and press Enter or click **SEARCH**
2. Results appear in the left panel — single click to preview, double-click to load
3. Stream info is fetched (available streams appear in the quality dropdown)
4. Choose a stream and click **▶ STREAM** or **↓ DOWNLOAD**

## Stream Types

| Label | Description |
| --- | --- |
| `[VIDEO+AUDIO]` | Muxed stream — plays directly |
| `[VIDEO ONLY]` | Video without audio track |
| `[AUDIO]` | Audio only — for music |

## Loop Mode

Click **⟳ LOOP** to enable loop mode. The video player restarts automatically when it ends.

## Downloading

Click **↓ DOWNLOAD**, choose a save location, and the download begins with a live progress bar. The file is saved in the format of the selected stream (mp4, webm, m4a, etc.).

## Architecture

NthTube uses a Java JAR bridge (`newpipe-bridge.jar`) that wraps the NewPipe Extractor library. The bridge communicates with the Qt frontend over subprocess stdio, outputting JSON line by line.

The bridge JAR is looked for in:
1. Same folder as the `nothing-browser` binary
2. `./newpipe-bridge/build/libs/newpipe-bridge-1.0.0.jar`
3. `./newpipe-bridge.jar`
