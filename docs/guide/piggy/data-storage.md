# 💾 Data Storage — site.store()

Validate and save scraped data against a predefined schema. Drops extra fields, fills missing ones with null (or defaults), and writes to JSON or SQLite — all with one line of code.

---

## Overview

`site.store()` is a schema-driven persistence system. Define your data shape once in `piggy.store.json`, then call `store()` anywhere in your scraper.

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

### Step 2: Call `site.store()` in your code

```ts
import piggy, { usePiggy } from "nothing-browser";

await piggy.launch();
await piggy.register("shop", "https://books.toscrape.com");

const { shop } = usePiggy<"shop">();
await shop.navigate();

// Scrape products
const products = await shop.evaluate(() =>
  Array.from(document.querySelectorAll(".product_pod")).map(el => ({
    id: el.querySelector("h3 a")?.getAttribute("href")?.match(/\d+/)?.[0],
    title: el.querySelector("h3 a")?.getAttribute("title"),
    price: parseFloat(el.querySelector(".price_color")?.textContent?.replace("£", "") || "0"),
    inStock: (el.querySelector(".availability")?.textContent || "").includes("In stock"),
    category: "books",
    // Extra field: rating (will be dropped by schema!)
    rating: el.querySelector(".star-rating")?.className
  }))
);

// Store with validation
const result = await shop.store(products);
console.log(result); // { stored: 20, skipped: 0 }

// View saved data
// cat ./data/products.json
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

## Usage Examples

### Store Single Record

```ts
const product = {
  id: "B09X5Y8Z7W",
  title: "Wireless Headphones",
  price: 79.99,
  inStock: true
};

await shop.store(product);
```

### Store Multiple Records

```ts
const products = [
  { id: "001", title: "Product A", price: 10 },
  { id: "002", title: "Product B", price: 20 },
  { id: "003", title: "Product C", price: 30 }
];

await shop.store(products);
// All three saved, validated against schema
```

### Store with Specific Schema Name

```ts
// Use a different schema than the site name
await shop.store(products, "backup_products");
```

```json
// piggy.store.json
{
  "stores": [
    { "name": "products", "destination": "./data/products.json", "fields": {...} },
    { "name": "backup_products", "destination": "./data/backup.json", "fields": {...} }
  ]
}
```

### Store Return Value

```ts
const result = await shop.store(products);

console.log(`Saved: ${result.stored}`);
console.log(`Skipped (validation failed): ${result.skipped}`);
// { stored: 47, skipped: 3 }
```

---

## Real-World Examples

### 1. Amazon Product Scraper

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

await piggy.launch();
await piggy.register("amazon", "https://www.amazon.com", { pool: 3 });

const { amazon } = usePiggy<"amazon">();

await amazon.api("/search", async (_params, query) => {
  const term = query.q ?? "laptop";
  
  await amazon.navigate(`https://www.amazon.com/s?k=${encodeURIComponent(term)}`);
  await amazon.waitForSelector("[data-asin]");
  
  const products = await amazon.evaluate(() =>
    Array.from(document.querySelectorAll("[data-asin]"))
      .filter(el => el.getAttribute("data-asin"))
      .map(el => ({
        asin: el.getAttribute("data-asin"),
        title: el.querySelector("h2 span")?.textContent?.trim(),
        price: parseFloat(el.querySelector(".a-price-whole")?.textContent?.replace(",", "") || "0"),
        rating: parseFloat(el.querySelector(".a-icon-alt")?.textContent?.match(/(\d\.?\d?)/)?.[1] || "0"),
        reviewCount: parseInt(el.querySelector(".a-size-base")?.textContent?.replace(/,/g, "") || "0"),
        availability: el.querySelector(".a-size-small")?.textContent?.includes("In stock") ? "In Stock" : "Check",
        scrapedAt: Date.now()
      }))
  );
  
  // Store with validation
  const result = await amazon.store(products);
  console.log(`📦 Stored ${result.stored} products, skipped ${result.skipped}`);
  
  return { term, count: products.length, products, stored: result };
});

await piggy.serve(3000);
```

### 2. SQLite Database Storage

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
// Same code works - writes to SQLite instead of JSON
await site.store(pageView); // INSERT INTO analytics ...
```

### 3. E-commerce Order Storage

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
  // status will default to "pending"
};

await shop.store(order);
```

### 4. Batch Store with Error Handling

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

const result = await storeWithRetry(shop, products);
```

### 5. Incremental Storage with Timestamps

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

await site.store(priceSnapshot); // Append to history

// Later...
priceSnapshot.price = 39.99;
priceSnapshot.timestamp = Date.now();
await site.store(priceSnapshot); // Another entry
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

## Multiple Stores Example

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

## File Format Examples

### JSON Output (pretty-printed)

```json
[
  {
    "id": "B09X5Y8Z7W",
    "title": "Wireless Headphones",
    "price": 79.99,
    "inStock": true,
    "scrapedAt": 1700000000000
  },
  {
    "id": "B08W4T3R2Y",
    "title": "Bluetooth Speaker",
    "price": 49.99,
    "inStock": true,
    "scrapedAt": 1700000000001
  }
]
```

### SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT,
  title TEXT,
  price REAL,
  inStock INTEGER,
  scrapedAt INTEGER
);
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

## Troubleshooting

### "Store 'products' not found in piggy.store.json"

**Error:**
```
Error: Store 'products' not defined in piggy.store.json
```

**Solution:** Check the `name` field in your schema:

```json
{
  "stores": [
    { "name": "products", ... }  // Must match the name you pass to store()
  ]
}
```

### "Destination directory does not exist"

**Error:** Directory for `./data/products.json` doesn't exist

**Solution:** Create the directory or let Piggy create it:

```bash
mkdir -p ./data
```

Piggy will create the directory automatically in the next version.

### "Type coercion failed for field 'price'"

**Error:** Could not convert value to number

**Solution:** Ensure your scraper extracts numbers correctly:

```ts
// Instead of
price: el.querySelector(".price")?.textContent  // "$29.99"

// Do
price: parseFloat(el.querySelector(".price")?.textContent?.replace("$", "") || "0")  // 29.99
```

---

## API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `site.store(data)` | Store data using site's default schema | `{ stored: number, skipped: number }` |
| `site.store(data, "schemaName")` | Store data using named schema | `{ stored: number, skipped: number }` |

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

## Next Steps

- [Built-in API Server](./api-server) — Combine storage with API endpoints
- [Tab Pooling](./tab-pooling) — Handle concurrent requests
- [Session Persistence](./session) — Save browser state

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*