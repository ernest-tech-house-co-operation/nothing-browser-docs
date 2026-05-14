# 💾 Storage API — Schema-Based Data Persistence

Validate and save scraped data against a predefined schema. Extra fields are silently dropped. Missing fields become `null` (or a default value if specified). Write to JSON or SQLite — all with one line of code.

> ⚠️ **Version Requirement:** Binaryh v0.1.14+ | Library v0.0.20+

---

## Overview

The Storage API provides schema-driven data persistence:

| Feature | Description |
|---------|-------------|
| **Schema validation** | Extra fields dropped, missing fields become null |
| **Type coercion** | String, number, boolean, object, array types |
| **Default values** | Fallback values for missing fields |
| **Dual output** | JSON file or SQLite database |
| **Batch saving** | Store one record or thousands |

---

## Quick Start

### Step 1: Create `piggy.store.json` in your project root

```json
{
  "stores": [
    {
      "name": "products",
      "destination": "./data/products.json",
      "fields": {
        "id": { "type": "string" },
        "title": { "type": "string" },
        "price": { "type": "number" },
        "inStock": { "type": "boolean", "default": false },
        "category": { "type": "string" }
      }
    }
  ]
}
```

### Step 2: Call `store()` in your code

```ts
const result = await piggy.site.store(products);
console.log(result); // { stored: 20, skipped: 0 }
```

---

## Schema Definition

### Basic Schema Structure

```json
{
  "stores": [
    {
      "name": "unique_store_name",
      "destination": "./data/output.json",
      "fields": {
        "fieldName": { "type": "string" }
      }
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Unique identifier (used in `store(data, "name")`) |
| `destination` | ✅ Yes | File path (.json or .db) |
| `fields` | ✅ Yes | Object defining the schema |

### Field Types

| Type | Description | Coercion | Invalid becomes |
|------|-------------|----------|-----------------|
| `string` | Text value | `String(value)` | Always succeeds |
| `number` | Numeric value | `Number(value)` | `null` if NaN |
| `boolean` | True/false | `Boolean(value)` | Always succeeds |
| `object` | Nested object | Must be plain object | `null` |
| `array` | List of values | Must be array | `null` |

### Default Values

```json
{
  "fields": {
    "name": { "type": "string", "default": "Unknown" },
    "active": { "type": "boolean", "default": true },
    "count": { "type": "number", "default": 0 }
  }
}
```

If a field is missing from incoming data, the default value is used instead of `null`.

---

## Usage

### Store Single Record

```ts
const product = {
  id: "B09X5Y8Z7W",
  title: "Wireless Headphones",
  price: 79.99,
  inStock: true
};

const result = await piggy.site.store(product);
console.log(result); // { stored: 1, skipped: 0 }
```

### Store Multiple Records

```ts
const products = [
  { id: "001", title: "Product A", price: 10 },
  { id: "002", title: "Product B", price: 20 },
  { id: "003", title: "Product C", price: 30 }
];

const result = await piggy.site.store(products);
// { stored: 3, skipped: 0 }
```

### Store with Specific Schema Name

```ts
// Use a different schema than the site name
const result = await piggy.site.store(products, "backup_products");
```

---

## Real-World Examples

### Example 1: Amazon Product Scraper with Storage

```json
// piggy.store.json
{
  "stores": [
    {
      "name": "amazon_products",
      "destination": "./data/products.json",
      "fields": {
        "asin": { "type": "string" },
        "title": { "type": "string" },
        "price": { "type": "number" },
        "rating": { "type": "number", "default": 0 },
        "reviewCount": { "type": "number", "default": 0 },
        "availability": { "type": "string", "default": "Unknown" },
        "scrapedAt": { "type": "number" }
      }
    }
  ]
}
```

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch({ mode: "tab", binary: "headless" });
await piggy.register("amazon", "https://www.amazon.com");

const { amazon } = usePiggy<"amazon">();

await amazon.navigate("https://www.amazon.com/s?k=laptop");
await amazon.wait.selector({ selector: "[data-asin]", state: "attached" });

const products = await amazon.evaluate(() =>
  Array.from(document.querySelectorAll("[data-asin]")).map(el => ({
    asin: el.getAttribute("data-asin"),
    title: el.querySelector("h2 span")?.textContent?.trim(),
    price: parseFloat(el.querySelector(".a-price-whole")?.textContent?.replace(",", "") || "0"),
    rating: parseFloat(el.querySelector(".a-icon-alt")?.textContent?.match(/(\d\.?\d?)/)?.[1] || "0"),
    reviewCount: parseInt(el.querySelector(".a-size-base")?.textContent?.replace(/,/g, "") || "0"),
    availability: el.querySelector(".a-size-small")?.textContent?.includes("In stock") ? "In Stock" : "Check",
    scrapedAt: Date.now()
  }))
);

const result = await amazon.store(products);
console.log(`📦 Stored ${result.stored} products, skipped ${result.skipped}`);
```

### Example 2: SQLite Database Storage

Same schema, just change destination to `.db`:

```json
{
  "stores": [
    {
      "name": "analytics",
      "destination": "./data/analytics.db",
      "fields": {
        "pageUrl": { "type": "string" },
        "visitorId": { "type": "string" },
        "timestamp": { "type": "number" },
        "duration": { "type": "number" },
        "bounce": { "type": "boolean", "default": false }
      }
    }
  ]
}
```

```ts
// Same code works — writes to SQLite instead of JSON
await site.store(pageView);
```

### Example 3: E-commerce Order Storage

```json
{
  "stores": [
    {
      "name": "orders",
      "destination": "./data/orders.json",
      "fields": {
        "orderId": { "type": "string" },
        "customerEmail": { "type": "string" },
        "total": { "type": "number" },
        "items": { "type": "array" },
        "shippingAddress": { "type": "object" },
        "status": { "type": "string", "default": "pending" },
        "placedAt": { "type": "number" }
      }
    }
  ]
}
```

```ts
const order = {
  orderId: "ORD-12345",
  customerEmail: "customer@example.com",
  total: 299.98,
  items: [
    { sku: "PROD-001", name: "Product 1", quantity: 2, price: 99.99 },
    { sku: "PROD-002", name: "Product 2", quantity: 1, price: 99.99 }
  ],
  shippingAddress: {
    street: "123 Main St",
    city: "Anytown",
    zip: "12345"
  },
  placedAt: Date.now()
};

const result = await site.store(order);
```

### Example 4: Batch Store with Error Handling

```ts
async function storeWithRetry(site: any, data: any[], maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await site.store(data);
      console.log(`✅ Stored ${result.stored} records on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

const result = await storeWithRetry(site, products);
```

### Example 5: Incremental Price History

```json
{
  "stores": [
    {
      "name": "price_history",
      "destination": "./data/prices.json",
      "fields": {
        "productId": { "type": "string" },
        "price": { "type": "number" },
        "currency": { "type": "string", "default": "USD" },
        "timestamp": { "type": "number" }
      }
    }
  ]
}
```

```ts
// Store price at different times
const priceSnapshot = {
  productId: "ABC123",
  price: 49.99,
  timestamp: Date.now()
};

await site.store(priceSnapshot);

// Later...
priceSnapshot.price = 39.99;
priceSnapshot.timestamp = Date.now();
await site.store(priceSnapshot);
```

### Example 6: API Endpoint with Storage

```ts
await piggy.register("shop", "https://books.toscrape.com");

await shop.api("/scrape", async (_params, query) => {
  const category = query.category || "all";
  
  await shop.navigate(`https://books.toscrape.com/catalogue/category/books/${category}_1/index.html`);
  await shop.wait.selector({ selector: ".product_pod", state: "attached" });
  
  const books = await shop.evaluate(() =>
    Array.from(document.querySelectorAll(".product_pod")).map(el => ({
      title: el.querySelector("h3 a")?.getAttribute("title"),
      price: el.querySelector(".price_color")?.textContent,
      rating: el.querySelector(".star-rating")?.className.match(/star-rating (\w+)/)?.[1],
      inStock: (el.querySelector(".availability")?.textContent || "").includes("In stock")
    }))
  );
  
  // Store automatically
  const result = await shop.store(books);
  
  return { 
    category, 
    count: books.length, 
    stored: result.stored,
    skipped: result.skipped,
    books 
  };
});

await piggy.serve(3000);
```

### Example 7: Multiple Stores for Different Data Types

```json
// piggy.store.json
{
  "stores": [
    {
      "name": "raw_scrapes",
      "destination": "./data/raw.json",
      "fields": {
        "url": { "type": "string" },
        "html": { "type": "string" },
        "timestamp": { "type": "number" }
      }
    },
    {
      "name": "processed_products",
      "destination": "./data/products.json",
      "fields": {
        "id": { "type": "string" },
        "title": { "type": "string" },
        "price": { "type": "number" }
      }
    },
    {
      "name": "errors",
      "destination": "./data/errors.db",
      "fields": {
        "errorMessage": { "type": "string" },
        "url": { "type": "string" },
        "timestamp": { "type": "number" }
      }
    }
  ]
}
```

```ts
// Save raw HTML
await site.store({ url: pageUrl, html: pageHtml, timestamp: Date.now() }, "raw_scrapes");

// Save processed products
await site.store(products, "processed_products");

// Save errors
await site.store({ errorMessage: error.message, url: pageUrl, timestamp: Date.now() }, "errors");
```

---

## Schema Validation in Action

### Input Data (from scraper)

```ts
const rawData = {
  id: "123",
  title: "Cool Product",
  price: 29.99,
  inStock: true,
  rating: 4.5,        // Extra field - will be DROPPED
  metadata: {         // Extra field - will be DROPPED
    source: "scraper"
  }
};
```

### Schema

```json
{
  "fields": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "price": { "type": "number" },
    "inStock": { "type": "boolean" }
  }
}
```

### Output (saved to file)

```json
{
  "id": "123",
  "title": "Cool Product",
  "price": 29.99,
  "inStock": true
}
```

**Extra fields (`rating`, `metadata`) are silently dropped.**

### Missing Fields with Defaults

```json
// Schema with defaults
{
  "fields": {
    "name": { "type": "string", "default": "Anonymous" },
    "active": { "type": "boolean", "default": true }
  }
}
```

```ts
// Input missing both fields
const data = {};

// Output
{
  "name": "Anonymous",
  "active": true
}
```

---

## Return Value

```ts
interface StoreResult {
  stored: number;   // Number of records successfully saved
  skipped: number;  // Number of records that failed validation
}

const result = await site.store(products);
console.log(`Saved: ${result.stored}`);
console.log(`Skipped: ${result.skipped}`);
```

---

## Best Practices

### 1. Define Schemas Before Writing Code

```json
// Plan your data shape first
{
  "stores": [{
    "name": "products",
    "destination": "./data/products.json",
    "fields": {
      // List all fields you'll need
    }
  }]
}
```

### 2. Use Defaults for Optional Fields

```json
{
  "rating": { "type": "number", "default": 0 },
  "inStock": { "type": "boolean", "default": false },
  "category": { "type": "string", "default": "Uncategorized" }
}
```

### 3. Include Timestamps

```json
{
  "scrapedAt": { "type": "number" },
  "updatedAt": { "type": "number" }
}
```

```ts
const data = {
  ...scrapedData,
  scrapedAt: Date.now()
};
```

### 4. Separate Raw and Processed Data

```json
{
  "stores": [
    { "name": "raw_html", "destination": "./data/raw.json", "fields": {...} },
    { "name": "parsed_data", "destination": "./data/parsed.json", "fields": {...} }
  ]
}
```

### 5. Use SQLite for Large Datasets

```json
// JSON is fine for <10,000 records
"destination": "./data/products.json"

// SQLite for larger datasets
"destination": "./data/products.db"
```

---

## API Reference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `store(data, schemaName?)` | `data: object \| object[], schemaName?: string` | `Promise<StoreResult>` | Store validated data |

### Return Object

```ts
interface StoreResult {
  stored: number;   // Number of records successfully saved
  skipped: number;  // Number of records that failed validation
}
```

### Schema File Location

Piggy looks for `piggy.store.json` in:
1. Current working directory (`./piggy.store.json`)
2. Parent directory (`../piggy.store.json`)
3. User home directory (`~/piggy.store.json`)

---

## Type Definitions

```ts
interface StoreResult {
  stored: number;
  skipped: number;
}

interface StoreSchema {
  stores: StoreDefinition[];
}

interface StoreDefinition {
  name: string;
  destination: string;
  fields: Record<string, StoreFieldDefinition>;
}

interface StoreFieldDefinition {
  type: "string" | "number" | "boolean" | "object" | "array";
  default?: any;
}
```

---

## Next Steps

- [API Server](../api-server) — Combine storage with API endpoints
- [Provide API](../provide) — Extract structured data to store
- [Session API](../session) — Persist browser session

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*