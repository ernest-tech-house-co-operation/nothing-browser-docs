
# How exposeFunction Works

Deep dive into the internals of Piggy's RPC (Remote Procedure Call) system. Understanding how browser → Node.js communication works under the hood.

---

## Overview

`exposeFunction` allows browser JavaScript to call Node.js functions. Here's the complete flow:

```
Browser JavaScript              C++ Layer              Node.js Library
─────────────────              ─────────              ──────────────

window.saveData({...})             │                         │
       │                           │                         │
       ▼                           │                         │
┌──────────────┐                   │                         │
│  Queue Call  │                   │                         │
│  with args   │                   │                         │
└──────────────┘                   │                         │
       │                           │                         │
       ▼                           │                         │
   [await] Promise                  │                         │
    pending...                      │                         │
                                    │                         │
                            ┌───────────────┐                 │
                            │ Poll Queue    │                 │
                            │ (250ms timer) │                 │
                            └───────────────┘                 │
                                    │                         │
                                    ▼                         │
                            ┌───────────────┐                 │
                            │ Send via      │                 │
                            │ Socket        │                 │
                            └───────────────┘                 │
                                    │                         │
                                    │   {cmd: "exposed.call",  │
                                    │    name: "saveData",     │
                                    │    data: {...}}         │
                                    ▼                         │
                                    │ ──────────────────────► │
                                    │                         │
                                    │                    ┌────┴────┐
                                    │                    │ Handler│
                                    │                    │  runs  │
                                    │                    └────┬────┘
                                    │                         │
                                    │   {result: {...}}       │
                                    │ ◄────────────────────── │
                                    │                         │
                            ┌───────────────┐                 │
                            │ Send result   │                 │
                            │ to browser    │                 │
                            └───────────────┘                 │
                                    │                         │
                                    ▼                         │
       Promise resolves ◄─────────────────────────────────────┘
       with result
```

---

## Layer 1: Browser Injection

When you call `site.exposeFunction("saveData", handler)`, Piggy injects a stub into the browser:

```javascript
// Injected JavaScript (simplified)
window.saveData = function(data) {
    return new Promise((resolve, reject) => {
        const callId = crypto.randomUUID();
        
        // Store promise callbacks
        window.__pendingCalls[callId] = { resolve, reject };
        
        // Queue the call
        window.__callQueue.push({
            name: "saveData",
            callId: callId,
            data: data,
            timestamp: Date.now()
        });
        
        // Trigger C++ poll (sets a flag)
        window.__triggerPoll();
    });
};
```

### Injection Timing

The script is injected at **DocumentCreation** phase using `QWebEngineScript`:

```cpp
// C++ side injection
QWebEngineScript script;
script.setInjectionPoint(QWebEngineScript::DocumentCreation);
script.setWorldId(QWebEngineScript::MainWorld);
script.setRunsOnSubFrames(true);
script.setSourceCode(injectionScript);
```

This ensures the stub exists before any page JavaScript runs.

---

## Layer 2: Queue Management

Browser calls are queued to avoid overwhelming the socket:

```javascript
// Queue implementation (simplified)
window.__callQueue = [];
window.__pendingCalls = {};
window.__pollFlag = false;

window.__triggerPoll = function() {
    if (!window.__pollFlag) {
        window.__pollFlag = true;
        // Sets a flag that C++ checks on its timer
    }
};
```

### Queue Structure

```json
{
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "saveData",
  "data": { "username": "john", "score": 1000 },
  "timestamp": 1700000000000
}
```

---

## Layer 3: C++ Polling

The C++ layer polls the queue every 250ms:

```cpp
// C++ side polling (simplified)
void BrowserBridge::startPolling() {
    m_pollTimer = new QTimer(this);
    connect(m_pollTimer, &QTimer::timeout, this, &BrowserBridge::pollQueue);
    m_pollTimer->start(250); // 250ms interval
}

void BrowserBridge::pollQueue() {
    if (!m_hasPendingCalls) return;
    
    // Run JavaScript to get queued calls
    m_page->runJavaScript(R"(
        (function() {
            const queue = window.__callQueue;
            window.__callQueue = [];
            return JSON.stringify(queue);
        })();
    )", [this](const QVariant& result) {
        processQueue(result.toString());
    });
}
```

### Why 250ms?

| Consideration | Value |
|---------------|-------|
| **Latency** | 250ms max delay (acceptable for most scraping) |
| **CPU usage** | Low (4 polls per second) |
| **Batching** | Multiple calls can be batched together |

---

## Layer 4: Socket Communication

Processed calls are sent over the socket:

```cpp
void BrowserBridge::processQueue(const QString& queueJson) {
    QJsonArray calls = QJsonDocument::fromJson(queueJson.toUtf8()).array();
    
    for (const QJsonValue& call : calls) {
        QJsonObject obj = call.toObject();
        
        // Send to Node.js via socket
        QJsonObject message;
        message["type"] = "exposed_call";
        message["name"] = obj["name"].toString();
        message["callId"] = obj["callId"].toString();
        message["data"] = obj["data"];
        
        m_socket->sendText(QString::fromUtf8(
            QJsonDocument(message).toJson(QJsonDocument::Compact)
        ));
    }
}
```

### Socket Message Format

```json
{
  "type": "exposed_call",
  "name": "saveData",
  "callId": "550e8400-e29b-41d4-a716-446655440000",
  "data": { "username": "john", "score": 1000 }
}
```

---

## Layer 5: Node.js Handler

The Node.js library receives and processes calls:

```typescript
// Piggy client (simplified)
class PiggyClient {
    private eventHandlers = new Map();
    
    private handleEvent(event: any) {
        if (event.type === "exposed_call") {
            const { name, callId, data } = event;
            const handler = this.eventHandlers.get(name);
            
            if (handler) {
                // Execute handler
                Promise.resolve(handler(data))
                    .then(result => {
                        this.sendResult(callId, result, false);
                    })
                    .catch(error => {
                        this.sendResult(callId, error.message, true);
                    });
            }
        }
    }
    
    private sendResult(callId: string, result: any, isError: boolean) {
        this.send("exposed.result", {
            callId,
            result: isError ? result : JSON.stringify(result),
            isError
        });
    }
}
```

---

## Layer 6: Result Return

Results are sent back through the same path:

```cpp
// C++ receives result
void BrowserBridge::onResultReceived(const QString& message) {
    QJsonObject obj = QJsonDocument::fromJson(message.toUtf8()).object();
    
    QString callId = obj["callId"].toString();
    QString result = obj["result"].toString();
    bool isError = obj["isError"].toBool();
    
    // Send result back to browser
    QString js = QString(R"(
        (function() {
            const pending = window.__pendingCalls['%1'];
            if (pending) {
                delete window.__pendingCalls['%1'];
                if (%2) {
                    pending.reject(new Error('%3'));
                } else {
                    pending.resolve(JSON.parse('%3'));
                }
            }
        })();
    )").arg(callId).arg(isError).arg(result);
    
    m_page->runJavaScript(js);
}
```

---

## Complete Call Timeline

| Step | Time (ms) | Component | Action |
|------|-----------|-----------|--------|
| 1 | 0 | Browser | `window.saveData()` called |
| 2 | 0.001 | Browser | Call queued, Promise pending |
| 3 | 0-250 | Browser | Waiting for poll |
| 4 | 250 | C++ | Poll timer fires |
| 5 | 251 | C++ | Queue retrieved via JS |
| 6 | 252 | C++ | Message sent over socket |
| 7 | 253 | Node.js | Message received |
| 8 | 254 | Node.js | Handler executes |
| 9 | 255 | Node.js | Result sent back |
| 10 | 256 | C++ | Result received |
| 11 | 257 | C++ | Result injected via JS |
| 12 | 258 | Browser | Promise resolves |
| **Total** | **~258ms** | | **End-to-end latency** |

---

## Performance Characteristics

### Latency Breakdown

| Component | Time |
|-----------|------|
| Queue wait (average) | ~125ms |
| C++ polling overhead | ~2ms |
| Socket transmission | ~1ms |
| Node.js handler | Variable |
| Result return | ~3ms |
| **Average total** | **~150-300ms** |

### Throughput

| Scenario | Calls/sec |
|----------|-----------|
| Small payloads (<1KB) | ~20-30 |
| Large payloads (1MB) | ~3-5 |
| Concurrent calls | ~15-20 |

---

## Memory Management

### Queue Cleanup

```javascript
// Automatic cleanup of stale promises
setInterval(() => {
    const now = Date.now();
    const timeout = 30000; // 30 seconds
    
    for (const [callId, pending] of Object.entries(window.__pendingCalls)) {
        if (now - pending.timestamp > timeout) {
            pending.reject(new Error("Call timeout"));
            delete window.__pendingCalls[callId];
        }
    }
}, 5000);
```

### Queue Size Limits

```cpp
// C++ side limit
const int MAX_QUEUE_SIZE = 1000;

void BrowserBridge::processQueue() {
    if (queueSize() > MAX_QUEUE_SIZE) {
        // Clear old calls
        clearHalfQueue();
        m_page->runJavaScript("window.__callQueue = window.__callQueue.slice(-500);");
    }
}
```

---

## Security Considerations

### Call Validation

```cpp
// Validate call origin
bool BrowserBridge::validateCall(const QString& name) {
    // Only calls from main frame (not iframes)
    if (!m_isMainFrame) return false;
    
    // Check against allowed functions
    return m_allowedFunctions.contains(name);
}
```

### Data Sanitization

```cpp
// Limit payload size
const int MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB

bool BrowserBridge::validatePayload(const QJsonObject& data) {
    QString json = QJsonDocument(data).toJson(QJsonDocument::Compact);
    return json.size() <= MAX_PAYLOAD_SIZE;
}
```

---

## Debugging

### Enable Trace Logging

```cpp
// C++ debug output
void BrowserBridge::logCall(const QString& name, const QJsonObject& data) {
    if (m_debugEnabled) {
        qDebug() << "[exposeFunction] Call:" << name;
        qDebug() << "[exposeFunction] Data:" << data;
        qDebug() << "[exposeFunction] Queue size:" << m_queue.size();
    }
}
```

### Browser Console Monitoring

```javascript
// Monitor queue in browser console
setInterval(() => {
    console.log({
        queueSize: window.__callQueue?.length || 0,
        pendingCalls: Object.keys(window.__pendingCalls || {}).length
    });
}, 1000);
```

---

## Common Issues

### 1. Function Not Found

**Error:** `TypeError: window.myFunction is not a function`

**Cause:** `exposeFunction` not called before navigation or function name mismatch.

**Solution:** Call `exposeFunction` before `navigate()`.

### 2. Call Timeout

**Error:** `Error: Call timeout`

**Cause:** Node.js handler took too long (>30 seconds).

**Solution:** Increase timeout or optimize handler.

### 3. Queue Backlog

**Symptom:** Calls getting slower over time

**Cause:** Handler slower than call rate.

**Solution:** Batch calls or use `exposeAndInject` to reduce frequency.

---

## Summary

The exposeFunction RPC system is built on:

1. **JavaScript stubs** injected at DocumentCreation
2. **Queue mechanism** to batch calls
3. **C++ polling** every 250ms
4. **Socket communication** for transport
5. **Promise-based API** for async handling

This design prioritizes **reliability** and **simplicity** over raw speed, making it perfect for scraping and automation tasks.

---

## Next Steps

- [Global Expose](../piggy/global-expose) — Functions across all tabs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
