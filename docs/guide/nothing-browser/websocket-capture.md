# WebSocket Capture

Every WebSocket connection and frame is captured automatically — no configuration needed.

---

## Overview

The **WS tab** in DEVTOOLS captures all WebSocket traffic in real time. Perfect for debugging real-time applications, reverse engineering WebSocket APIs, and understanding live data flows.

| Capture Type | Description |
|--------------|-------------|
| **Connection open** | When a WebSocket connection is established |
| **Outgoing frames** | Data sent from browser to server |
| **Incoming frames** | Data received from server |
| **Connection close** | When connection ends (with code and reason) |

---

## Frame Types

| Direction | Label | Color | Description |
|-----------|-------|-------|-------------|
| Outgoing | `UP SENT` | 🟢 Green | Data sent from the browser to the server |
| Incoming | `DN RECV` | 🔵 Blue | Data received from the server |
| Open | `OPEN` | 🟡 Yellow | Connection established |
| Close | `CLOSED` | 🔴 Red | Connection closed with code and reason |

---

## Viewing Frames

### List View

The main table shows:

| Column | Description |
|--------|-------------|
| **Time** | Timestamp of the frame |
| **Direction** | UP SENT or DN RECV |
| **Type** | Text, Binary, Open, Close |
| **Size** | Frame size in bytes |
| **Preview** | First 50 characters of data |

### Detail Panel

Click any frame to see full details:

- **Formatted view** — JSON pretty-printed (if applicable)
- **Raw view** — Raw text or hex dump
- **Headers** — Connection metadata

---

## Binary Frames

Binary frames are decoded from base64 and displayed as a **hex dump with ASCII preview**:

```
0000  48 65 6c 6c 6f 20 57 6f  72 6c 64 0a 00 00 00 00  Hello Wo rld.....
0010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ........ ........
0020  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ........ ........
```

### Hex Dump Features

| Feature | Description |
|---------|-------------|
| **Offset** | Byte position in hex |
| **Hex values** | Raw bytes in hexadecimal |
| **ASCII preview** | Human-readable characters on the right |
| **Non-printable** | Shown as `.` in ASCII view |

### Download Binary Frames

Click **DOWNLOAD** to save the full raw binary frame to a file.

---

## JSON Frames

JSON frames are **auto-pretty-printed** in the detail panel:

```json
{
  "type": "message",
  "data": {
    "user": "john_doe",
    "text": "Hello world",
    "timestamp": 1700000000000
  }
}
```

### Features

- ✅ Syntax highlighting
- ✅ Collapsible sections
- ✅ Copy as JSON
- ✅ Raw text also selectable

---

## Testing WebSocket Capture

Navigate to any of these test sites in the **BROWSER tab** to see live WebSocket frames:

| Site | Description |
|------|-------------|
| [pieSocket Tester](https://www.piesocket.com/websocket-tester) | Interactive WebSocket tester |
| [SocketsBay](https://socketsbay.com/test-websockets) | Multi-protocol test |
| [WebSocket.org Echo Test](https://websocket.org/tools/websocket-echo-test/) | Echo server |

### Test Steps

1. Open the BROWSER tab
2. Navigate to a test site
3. Switch to DEVTOOLS → **WS tab**
4. Watch frames appear in real time

---

## Real-World Use Cases

### Debugging Chat Applications

Capture WebSocket frames to see:

- Message payloads
- User join/leave events
- Typing indicators
- Read receipts

### Reverse Engineering Live APIs

WebSocket APIs are often undocumented. Capture frames to:

- Understand message structure
- Identify authentication flows
- Replay captured frames
- Build your own client

### Monitoring Trading Data

For stock/crypto trading platforms:

- Real-time price updates
- Order book changes
- Trade executions
- Market depth

### Game Development

Debug multiplayer game WebSockets:

- Player positions
- Game state updates
- Chat messages
- Matchmaking events

---

## Exporting WebSocket Data

### Copy Frame

Select a frame → **COPY** → Copies frame data to clipboard

### Download Frame

Select a frame → **DOWNLOAD** → Saves frame to file

### Save Session

Use [Session Management](./sessions) to save all captured WebSocket frames for later analysis.

---

## Filtering WebSocket Frames

Use the filter bar to find specific frames:

| Filter | Example |
|--------|---------|
| By direction | `up` or `down` |
| By type | `text`, `binary`, `open`, `close` |
| By content | `error`, `message`, `ping` |

---

## Capture Details

### What's Captured

| Item | Captured? |
|------|-----------|
| Frame direction | ✅ Yes |
| Frame type | ✅ Yes |
| Payload data | ✅ Yes |
| Timestamp | ✅ Yes |
| Frame size | ✅ Yes |
| Connection URL | ✅ Yes |
| Close code/reason | ✅ Yes (for CLOSED frames) |

### What's NOT Captured

| Item | Reason |
|------|--------|
| Compression state | Internal to WebSocket |
| Fragment boundaries | Reassembled automatically |
| Extension data | Not exposed by Qt |

---

## Performance

| Metric | Value |
|--------|-------|
| Max frames per second | ~1000 |
| Max frame size | 10MB |
| Memory limit | Configurable |

**Note:** Very high-frequency WebSocket traffic may impact performance. Use the **CLEAR** button to reset captured data.

---

## Troubleshooting

### No Frames Appearing

**Solutions:**
- Ensure WebSocket connection is established
- Check the site actually uses WebSockets (not all do)
- Refresh the page to trigger connection
- Check DEVTOOLS is open

### Binary Frames Show Garbage

**Explanation:** Binary data may be compressed or encrypted

**Solutions:**
- Download raw binary frame
- Use external tools to decode
- Check if data is compressed (gzip, deflate)

### Frames Missing

**Possible causes:**
- Capture started after connection
- Frames sent before DEVTOOLS opened
- Frame size exceeds limit

---

## API Reference (for Developers)

The WebSocket capture data is available programmatically via:

```cpp
// C++ access (for plugin developers)
QVector<WebSocketFrame> frames = capture->webSocketFrames();
for (const auto& frame : frames) {
    qDebug() << frame.direction << frame.data;
}
```

For Piggy users, see [Network Capture](../piggy/network-capture).

---

## Next Steps

- [Network Inspector](./network-inspector) — HTTP request/response capture
- [Cookie Inspector](./cookie-inspector) — Track cookies
- [DEVTOOLS Tab](./devtools) — Complete capture overview

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
