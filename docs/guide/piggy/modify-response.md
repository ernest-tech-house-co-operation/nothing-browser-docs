# 🎯 modifyResponse

Modify HTTP responses on the fly before they reach the browser. Perfect for injecting data, redacting sensitive information, or transforming API responses.

---

## Overview

`modifyResponse` lets you intercept and modify responses after they're received from the server but before the browser processes them.

| Feature | Description |
|---------|-------------|
| **Modify body** | Change response content |
| **Modify headers** | Add, remove, or change headers |
| **Change status** | Override HTTP status code |
| **Conditional** | Modify based on URL pattern |

---

## Basic Usage

```ts
import piggy from "nothing-browser";

await piggy.launch({ mode: "tab" });
await piggy.register("app", "https://api.example.com");

// Modify API responses
await piggy.app.intercept.modifyResponse(
  "*/api/users*",
  async (response) => {
    const data = await response.json();
    
    // Add custom field
    data._scraped_at = Date.now();
    data._source = "nothing-browser";
    
    return {
      body: JSON.stringify(data),
      headers: { "X-Modified": "true" }
    };
  }
);

await piggy.app.navigate("https://api.example.com/users");
// API response will have extra fields
```

---

## Real-World Examples

### 1. Redact Sensitive Data

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/user/profile",
  async (response) => {
    const data = await response.json();
    
    // Remove sensitive fields
    delete data.ssn;
    delete data.credit_card;
    delete data.password_hash;
    
    // Mask email
    if (data.email) {
      const [local, domain] = data.email.split('@');
      data.email = `${local.slice(0, 2)}***@${domain}`;
    }
    
    // Mask phone number
    if (data.phone) {
      data.phone = data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    
    return { body: JSON.stringify(data) };
  }
);
```

### 2. Inject Analytics Code

```ts
await piggy.site.intercept.modifyResponse(
  "*.html",
  async (response) => {
    let html = response.body;
    
    // Inject analytics script before </head>
    const analyticsScript = `
      <script>
        (function() {
          // Custom analytics
          fetch('/api/track', {
            method: 'POST',
            body: JSON.stringify({
              page: window.location.href,
              timestamp: Date.now()
            })
          });
        })();
      </script>
    `;
    
    html = html.replace('</head>', `${analyticsScript}</head>`);
    
    return { 
      body: html,
      headers: { "X-Injected": "analytics" }
    };
  }
);
```

### 3. Transform API Response Format

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/products*",
  async (response) => {
    const data = await response.json();
    
    // Transform from snake_case to camelCase
    const transformed = {
      products: data.products?.map((p: any) => ({
        id: p.id,
        name: p.product_name,
        price: p.price_amount,
        inStock: p.inventory_count > 0,
        category: p.category_name
      })),
      total: data.total_count,
      page: data.current_page
    };
    
    return { 
      body: JSON.stringify(transformed),
      headers: { "X-Transformed": "snake-to-camel" }
    };
  }
);
```

### 4. Add Pagination Metadata

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/search*",
  async (response) => {
    const data = await response.json();
    
    // Calculate and add pagination info
    const page = parseInt(response.url.match(/page=(\d+)/)?.[1] || "1");
    const limit = parseInt(response.url.match(/limit=(\d+)/)?.[1] || "20");
    
    data.pagination = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: data.total,
      totalPages: Math.ceil(data.total / limit),
      hasNext: page * limit < data.total,
      hasPrev: page > 1
    };
    
    return { body: JSON.stringify(data) };
  }
);
```

### 5. Cache Control Injection

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/*",
  async (response) => {
    // Add cache headers to API responses
    const headers = {
      ...response.headers,
      "Cache-Control": "public, max-age=300",
      "CDN-Cache-Control": "public, max-age=600",
      "X-Cache-TTL": "300"
    };
    
    return { headers };
  }
);
```

### 6. HTML Content Filtering

```ts
await piggy.site.intercept.modifyResponse(
  "*.html",
  async (response) => {
    let html = response.body;
    
    // Remove ad scripts
    html = html.replace(/<script[^>]*ads[^>]*>.*?<\/script>/gi, '');
    
    // Remove popups
    html = html.replace(/<div[^>]*popup[^>]*>.*?<\/div>/gi, '');
    
    // Remove tracking pixels
    html = html.replace(/<img[^>]*pixel[^>]*>/gi, '');
    
    // Add custom CSS to hide elements
    const hideCSS = `
      <style>
        .ad-container, .popup, .newsletter-modal { display: none !important; }
      </style>
    `;
    
    html = html.replace('</head>', `${hideCSS}</head>`);
    
    return { 
      body: html,
      headers: { "X-Filtered": "ads,popups,trackers" }
    };
  }
);
```

### 7. JSONP to JSON Converter

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/jsonp*",
  async (response) => {
    let body = response.body;
    
    // Convert JSONP to regular JSON
    // callback({"data": "value"}) -> {"data": "value"}
    const jsonpMatch = body.match(/^[^(]+\(({.*})\);?$/);
    
    if (jsonpMatch) {
      const jsonData = JSON.parse(jsonpMatch[1]);
      return {
        body: JSON.stringify(jsonData),
        headers: { "Content-Type": "application/json", "X-JSONP-Converted": "true" }
      };
    }
    
    return null; // Not JSONP, don't modify
  }
);
```

### 8. Error Response Enhancement

```ts
await piggy.site.intercept.modifyResponse(
  "*",
  async (response) => {
    // Only modify error responses
    if (response.status >= 400) {
      let errorBody;
      
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.body };
      }
      
      // Add helpful debugging info
      const enhancedError = {
        ...errorBody,
        _debug: {
          timestamp: Date.now(),
          url: response.url,
          status: response.status,
          userAgent: response.headers["user-agent"],
          suggestion: getSuggestion(response.status)
        }
      };
      
      return {
        status: response.status,
        body: JSON.stringify(enhancedError),
        headers: { "X-Error-Enhanced": "true" }
      };
    }
    
    return null; // Not an error, don't modify
  }
);

function getSuggestion(status: number): string {
  if (status === 401) return "Check your authentication token";
  if (status === 403) return "You don't have permission for this resource";
  if (status === 404) return "Verify the URL is correct";
  if (status === 429) return "Slow down - rate limit exceeded";
  if (status === 500) return "Server error - try again later";
  return "Check your request and try again";
}
```

### 9. Data Enrichment

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/products/*",
  async (response) => {
    const product = await response.json();
    
    // Enrich with external data
    const [reviews, stock, priceHistory] = await Promise.all([
      fetchReviews(product.id),
      checkStock(product.sku),
      getPriceHistory(product.id)
    ]);
    
    product.enriched = {
      averageRating: reviews.average,
      reviewCount: reviews.count,
      inStock: stock.available,
      priceHistory: priceHistory,
      lastUpdated: Date.now()
    };
    
    return { body: JSON.stringify(product) };
  }
);
```

### 10. Conditional Modification

```ts
await piggy.site.intercept.modifyResponse(
  "*/api/data*",
  async (response) => {
    const data = await response.json();
    
    // Only modify for certain conditions
    if (data.user?.premium && data.user?.premium === true) {
      // Premium users get extra fields
      data.premium_features = ['analytics', 'export', 'api_access'];
      return { body: JSON.stringify(data) };
    }
    
    if (data.items && data.items.length > 100) {
      // Paginate large responses
      data.items = data.items.slice(0, 100);
      data.truncated = true;
      return { body: JSON.stringify(data) };
    }
    
    return null; // No modification needed
  }
);
```

---

## modifyResponse vs respond

| Method | When It Runs | Use Case |
|--------|--------------|----------|
| `respond` | Before request is sent | Serve cached/mock response |
| `modifyResponse` | After response received | Modify real response |

```ts
// respond - replaces the response entirely
await piggy.site.intercept.respond("*/api/users", async () => {
  return { body: JSON.stringify(mockData) };
});

// modifyResponse - modifies the real response
await piggy.site.intercept.modifyResponse("*/api/users", async (response) => {
  const data = await response.json();
  data.modified = true;
  return { body: JSON.stringify(data) };
});
```

---

## Multiple Modify Rules

```ts
// Multiple rules chain together
await piggy.site.intercept.modifyResponse("*/api/*", async (response) => {
  const data = await response.json();
  data._step1 = true;
  return { body: JSON.stringify(data) };
});

await piggy.site.intercept.modifyResponse("*/api/users*", async (response) => {
  const data = await response.json();
  data._step2 = true;
  return { body: JSON.stringify(data) };
});

// Both rules apply to /api/users
// Final response has both _step1 and _step2
```

---

## Response Object

```ts
interface ModifyResponseHandler {
  (response: {
    url: string;
    method: string;
    status: number;
    headers: Record<string, string>;
    body: string;
    json: () => Promise<any>;
  }): Promise<{
    status?: number;      // Override status code
    headers?: Record<string, string>;  // Merge with original headers
    body?: string;        // Replace response body
  } | null>;  // Return null for no modification
}
```

---

## API Reference

| Method | Description |
|--------|-------------|
| `intercept.modifyResponse(pattern, handler)` | Modify responses matching pattern |

### Pattern Examples

| Pattern | Matches |
|---------|---------|
| `*.html` | All HTML pages |
| `*/api/*` | All API endpoints |
| `*.json` | All JSON responses |
| `*/users/*` | User endpoints |

---

## Next Steps

- [Request Interception](./interception) — Complete interception guide
- [Local Cache Mode](./cache-mode) — Cache modified responses
- [Network Capture](./network-capture) — Capture modified responses

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
