# WebSocket Capture

Every WebSocket connection and frame is captured automatically.

## Frame Types

| Direction | Label | Description |
| --- | --- | --- |
| Outgoing | `UP SENT` | Data sent from the browser to the server |
| Incoming | `DN RECV` | Data received from the server |
| Open | `OPEN` | Connection established |
| Close | `CLOSED` | Connection closed with code and reason |

## Binary Frames

Binary frames are decoded from base64 and displayed as a hex dump with ASCII preview:

```
0000  48 65 6c 6c 6f 20 57 6f  72 6c 64 0a 00 00 00 00  Hello Wo rld.....
0010  ...
```

Use DOWNLOAD to save the full raw binary frame.

## JSON Frames

JSON frames are auto-pretty-printed in the detail panel. Raw text is also selectable.

## Testing WebSocket Capture

Navigate to any of these in the BROWSER tab to see live WS frames:

- `https://www.piesocket.com/websocket-tester`
- `https://socketsbay.com/test-websockets`

Frames will appear in real time in the WS tab.
