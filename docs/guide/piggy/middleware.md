# 📦 Middleware

Add authentication, logging, rate limiting, and other middleware to your API endpoints. Middleware functions run before your handler, perfect for cross-cutting concerns.

---

## Overview

Middleware in Piggy works with the built-in API server. Each endpoint can have multiple middleware functions that run sequentially before the handler.

| Middleware Type | Use Case |
|-----------------|----------|
| **Authentication** | API keys, JWT tokens, session validation |
| **Logging** | Request/response logging, analytics |
| **Rate Limiting** | Prevent abuse, control traffic |
| **Caching** | Conditional caching, ETags |
| **Validation** | Request body validation, sanitization |
| **Compression** | Response compression |
| **CORS** | Cross-origin request handling |

---

## Basic Middleware

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("api", "https://example.com");

// Simple logging middleware
const logger = async ({ request, set }: any) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  
  // Store start time for later
  (request as any).startTime = start;
};

// Timing middleware
const timer = async ({ request, set }: any) => {
  const duration = Date.now() - (request as any).startTime;
  console.log(`  ✓ Completed in ${duration}ms`);
};

// Apply middleware to endpoint
await piggy.api.api("/data", async () => {
  return { message: "Hello World" };
}, { 
  before: [logger, timer] 
});

await piggy.serve(3000);
```

---

## Authentication Middleware

### API Key Auth

```ts
const apiKeyAuth = async ({ headers, set }: any) => {
  const apiKey = headers["x-api-key"];
  
  if (!apiKey) {
    set.status = 401;
    throw new Error("API key required");
  }
  
  if (apiKey !== process.env.API_KEY) {
    set.status = 403;
    throw new Error("Invalid API key");
  }
  
  // Add user info to context
  (headers as any).user = { id: "api_user", role: "admin" };
};

// Protected endpoint
await piggy.api.api("/protected", async ({ headers }: any) => {
  return { 
    message: "Authenticated!", 
    user: (headers as any).user 
  };
}, { before: [apiKeyAuth] });
```

### JWT Authentication

```ts
import jwt from "jsonwebtoken";

const jwtAuth = async ({ headers, set }: any) => {
  const token = headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    set.status = 401;
    throw new Error("No token provided");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (headers as any).user = decoded;
  } catch (error) {
    set.status = 403;
    throw new Error("Invalid or expired token");
  }
};

// Protected endpoints
await piggy.api.api("/user/profile", async ({ headers }: any) => {
  const user = (headers as any).user;
  return { userId: user.id, email: user.email };
}, { before: [jwtAuth] });

await piggy.api.api("/user/settings", async ({ headers }: any) => {
  const user = (headers as any).user;
  return await db.settings.findByUserId(user.id);
}, { before: [jwtAuth] });
```

### Session Auth

```ts
const sessionAuth = async ({ headers, set, request }: any) => {
  const sessionId = headers.cookie?.match(/session_id=([^;]+)/)?.[1];
  
  if (!sessionId) {
    set.status = 401;
    throw new Error("Session required");
  }
  
  const session = await redis.get(`session:${sessionId}`);
  if (!session) {
    set.status = 403;
    throw new Error("Invalid session");
  }
  
  (request as any).session = JSON.parse(session);
};

await piggy.api.api("/dashboard", async ({ request }: any) => {
  const session = (request as any).session;
  return { 
    dashboard: await getDashboardData(session.userId),
    user: session.user 
  };
}, { before: [sessionAuth] });
```

---

## Logging Middleware

### Request Logger

```ts
const requestLogger = async ({ request, set }: any) => {
  const timestamp = new Date().toISOString();
  const { method, url, headers } = request;
  const ip = headers["x-forwarded-for"] || "unknown";
  
  console.log(JSON.stringify({
    level: "info",
    timestamp,
    type: "request",
    method,
    url,
    ip,
    userAgent: headers["user-agent"]
  }));
};

const responseLogger = async ({ set, request }: any) => {
  const duration = Date.now() - (request as any).startTime;
  
  console.log(JSON.stringify({
    level: "info",
    timestamp: new Date().toISOString(),
    type: "response",
    status: set.status || 200,
    duration: `${duration}ms`
  }));
};

await piggy.api.api("/data", async () => {
  return { data: "test" };
}, { before: [requestLogger, responseLogger] });
```

### Analytics Middleware

```ts
const analytics = async ({ request, set }: any) => {
  const start = Date.now();
  
  // Store request start time
  (request as any).analyticsStart = start;
  
  // Track in background
  setImmediate(() => {
    db.analytics.insert({
      endpoint: request.url,
      method: request.method,
      timestamp: start,
      ip: request.headers["x-forwarded-for"]
    });
  });
};

const trackCompletion = async ({ set, request }: any) => {
  const duration = Date.now() - (request as any).analyticsStart;
  
  // Update analytics with duration
  setImmediate(() => {
    db.analytics.update(
      { timestamp: (request as any).analyticsStart },
      { $set: { duration, status: set.status || 200 } }
    );
  });
};

await piggy.api.api("/tracked", async () => {
  return { message: "Tracked!" };
}, { before: [analytics, trackCompletion] });
```

---

## Rate Limiting Middleware

### In-Memory Rate Limiter

```ts
const rateLimits = new Map();

const rateLimiter = (windowMs: number, maxRequests: number) => {
  return async ({ headers, set }: any) => {
    const ip = headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    
    if (!rateLimits.has(ip)) {
      rateLimits.set(ip, []);
    }
    
    const requests = rateLimits.get(ip).filter((ts: number) => now - ts < windowMs);
    
    if (requests.length >= maxRequests) {
      set.status = 429;
      throw new Error(`Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s`);
    }
    
    requests.push(now);
    rateLimits.set(ip, requests);
  };
};

// 10 requests per minute
await piggy.api.api("/limited", async () => {
  return { message: "You made it!" };
}, { before: [rateLimiter(60000, 10)] });

// 100 requests per hour
await piggy.api.api("/hourly-limited", async () => {
  return { message: "Limited to 100/hour" };
}, { before: [rateLimiter(3600000, 100)] });
```

### Redis Rate Limiter

```ts
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const redisRateLimiter = (windowMs: number, maxRequests: number) => {
  return async ({ headers, set }: any) => {
    const ip = headers["x-forwarded-for"] || "unknown";
    const key = `ratelimit:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old entries
    await redis.zRemRangeByScore(key, 0, windowStart);
    
    // Count current requests
    const count = await redis.zCard(key);
    
    if (count >= maxRequests) {
      set.status = 429;
      throw new Error(`Rate limit exceeded`);
    }
    
    // Add current request
    await redis.zAdd(key, { score: now, value: `${now}` });
    await redis.expire(key, Math.ceil(windowMs / 1000));
  };
};

await piggy.api.api("/redis-limited", async () => {
  return { message: "Redis rate limited" };
}, { before: [redisRateLimiter(60000, 20)] });
```

---

## Validation Middleware

### Request Body Validation

```ts
const validateBody = (schema: any) => {
  return async ({ body, set }: any) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      if (rules.required && !value) {
        errors.push(`${field} is required`);
      }
      
      if (rules.type === "email" && value && !value.includes("@")) {
        errors.push(`${field} must be a valid email`);
      }
      
      if (rules.min && value && value.length < rules.min) {
        errors.push(`${field} must be at least ${rules.min} characters`);
      }
      
      if (rules.max && value && value.length > rules.max) {
        errors.push(`${field} must be at most ${rules.max} characters`);
      }
    }
    
    if (errors.length > 0) {
      set.status = 400;
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  };
};

await piggy.api.api("/user", async ({ body }: any) => {
  await db.users.insert(body);
  return { success: true, user: body };
}, { 
  method: "POST",
  before: [validateBody({
    email: { required: true, type: "email" },
    name: { required: true, min: 2, max: 50 },
    age: { required: true, min: 18, max: 120 }
  })]
});
```

### Query Parameter Validation

```ts
const validateQuery = (schema: any) => {
  return async ({ query, set }: any) => {
    for (const [param, rules] of Object.entries(schema)) {
      const value = query[param];
      
      if (rules.required && !value) {
        set.status = 400;
        throw new Error(`Missing query parameter: ${param}`);
      }
      
      if (rules.type === "number" && value && isNaN(Number(value))) {
        set.status = 400;
        throw new Error(`${param} must be a number`);
      }
      
      if (rules.type === "boolean" && value && !["true", "false"].includes(value)) {
        set.status = 400;
        throw new Error(`${param} must be true or false`);
      }
    }
  };
};

await piggy.api.api("/search", async ({ query }: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  
  return await db.products.find().skip((page - 1) * limit).limit(limit);
}, { 
  before: [validateQuery({
    page: { type: "number" },
    limit: { type: "number" },
    category: { required: true }
  })]
});
```

---

## CORS Middleware

```ts
const cors = () => {
  return async ({ set }: any) => {
    set.headers = {
      ...set.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
      "Access-Control-Max-Age": "86400"
    };
  };
};

await piggy.api.api("/public", async () => {
  return { data: "CORS enabled" };
}, { before: [cors()] });
```

---

## Compression Middleware

```ts
import zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);

const compression = () => {
  return async ({ headers, set, request }: any) => {
    const acceptEncoding = headers["accept-encoding"] || "";
    
    if (acceptEncoding.includes("gzip")) {
      (request as any).compress = true;
      set.headers = { ...set.headers, "Content-Encoding": "gzip" };
    }
  };
};

const compressResponse = async ({ set, request, response }: any) => {
  if ((request as any).compress && response?.body) {
    const compressed = await gzip(response.body);
    response.body = compressed;
  }
};

await piggy.api.api("/large-data", async () => {
  const data = await fetchLargeDataset();
  return data;
}, { before: [compression(), compressResponse] });
```

---

## Multiple Middleware Example

```ts
// Combine multiple middleware
const auth = apiKeyAuth;
const logger = requestLogger;
const limiter = rateLimiter(60000, 100);
const corsMiddleware = cors();
const validator = validateBody({
  email: { required: true, type: "email" },
  action: { required: true }
});

await piggy.api.api("/secure-endpoint", async ({ body, headers }: any) => {
  const user = (headers as any).user;
  
  // Process request
  const result = await processRequest(body, user);
  
  return { success: true, result };
}, { 
  method: "POST",
  before: [auth, logger, limiter, corsMiddleware, validator],
  ttl: 30000
});
```

---

## Error Handling Middleware

```ts
const errorHandler = async ({ set, error }: any) => {
  console.error("API Error:", error);
  
  set.status = set.status || 500;
  
  return {
    error: true,
    message: error.message || "Internal server error",
    timestamp: Date.now()
  };
};

// Apply to all routes via global handler
// (Implemented automatically by Piggy)
```

---

## Conditional Middleware

```ts
const conditionalAuth = (shouldAuth: boolean) => {
  return async ({ headers, set, request }: any) => {
    if (!shouldAuth) return;
    
    const token = headers.authorization;
    if (!token) {
      set.status = 401;
      throw new Error("Auth required for this endpoint");
    }
    
    // Verify token...
  };
};

// Auth only in production
const isProduction = process.env.NODE_ENV === "production";

await piggy.api.api("/data", async () => {
  return { data: "conditional auth" };
}, { before: [conditionalAuth(isProduction)] });
```

---

## Middleware Order

Middleware runs in the order provided:

```ts
await piggy.api.api("/endpoint", handler, { 
  before: [
    logger,      // 1. Log request start
    auth,        // 2. Authenticate
    rateLimiter, // 3. Check rate limits
    validator,   // 4. Validate input
    // ... handler runs here ...
    timer        // 5. Log completion time
  ] 
});
```

---

## API Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `before` | `Array<(context: any) => void>` | Middleware functions to run before handler |

### Middleware Context

```ts
interface MiddlewareContext {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
    query: Record<string, string>;
    params: Record<string, string>;
  };
  set: {
    status: number;
    headers: Record<string, string>;
  };
  error?: Error;
}
```

---

## Next Steps

- [Built-in API Server](./api-server) — Complete API server documentation
- [Session Persistence](./session) — Session management
- [exposeFunction (RPC)](./expose-function) — RPC for browser communication

---

