# Session Management

Nothing Browser auto-saves your session on close and lets you reload it at any time.

## What's in a Session

Sessions are JSON files that contain:

- All captured network requests (method, URL, status, headers, bodies)
- All WebSocket frames
- All cookies
- All localStorage and sessionStorage entries
- The current URL

## Auto-Save

On close, the session is saved to:

```
~/.config/nothing-browser/sessions/last-session.json
```

## Loading the Last Session

**Session → Load Last Session** (`Ctrl+Shift+O`)

Or on the next launch, use the menu — the last session is always available.

## Saving a Named Session

**Session → Save Current Session...** (`Ctrl+S`)

Enter a name. The session is saved to:

```
~/.config/nothing-browser/sessions/your-name.json
```

## Quick Save (Auto-name)

**Session → Quick Save** (`Ctrl+Shift+S`)

Saves with a timestamp name: `2025-03-15_14-30-22.json`

## Sharing Sessions

Sessions are plain JSON. Copy the file to any machine running Nothing Browser and load it via **Session → Load Session...**. All captured data — including cookies and WebSocket frames — transfers.

## Sessions Folder

**Session → Open Sessions Folder** opens the sessions directory in your file manager.
