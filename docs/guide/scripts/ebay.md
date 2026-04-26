# 🛒 eBay Scraper — Reseller Intelligence API

Search listings, get sold prices, find deals, analyze trends, and get profit verdicts. Built for flippers and resellers.

---

## Features

- ✅ **Search active listings** — filter by price, condition, pagination
- ✅ **Listing details** — full item info: seller, images, specifics, shipping
- ✅ **Sold / completed research** — see what items actually sold for
- ✅ **Price stats** — min, max, average, median of sold items
- ✅ **Deals finder** — auctions ending soon below avg sold price
- ✅ **Price trend** — rising, falling, or stable with 3-page sample
- ✅ **Full analyze report** — demand score, best active deal, profit scenarios, verdict

---

## Output Examples

### Search Listings

```json
{
  "keyword": "iphone 15",
  "page": 1,
  "limit": 20,
  "count": 20,
  "listings": [
    {
      "itemId": "296129124843",
      "title": "Apple iPhone 15 Pro Max - 256GB - Blue Titanium - Unlocked",
      "price": "$899.99",
      "shipping": "Free shipping",
      "condition": "New (other)",
      "imageUrl": "https://i.ebayimg.com/images/g/.../s-l1600.webp",
      "listingUrl": "https://www.ebay.com/itm/296129124843",
      "sponsored": false
    }
  ]
}
```

### Sold Research with Price Stats

```json
{
  "keyword": "ps5 console",
  "page": 1,
  "priceStats": {
    "min": "325.00",
    "max": "550.00",
    "average": "412.50",
    "median": "410.00",
    "sampleSize": 47
  },
  "count": 20,
  "soldListings": [...]
}
```

### Deals — Auctions Ending Soon

```json
{
  "keyword": "iphone 15",
  "avgSoldPrice": "$650.00",
  "hotDealsFound": 3,
  "deals": [
    {
      "itemId": "123456789012",
      "title": "iPhone 15 128GB Unlocked",
      "currentBid": "$425.00",
      "timeLeft": "2h 15m",
      "bids": "17 bids",
      "avgSoldPrice": "$650.00",
      "potentialProfit": "$52.34",
      "isDeal": true
    }
  ]
}
```

### Trend Analysis

```json
{
  "keyword": "iphone 15 128gb",
  "sampleSize": 156,
  "trend": "📈 Rising",
  "trendPercent": "+8.2%",
  "pricing": {
    "avg": "$612.50",
    "median": "$605.00",
    "min": "$520.00",
    "max": "$725.00"
  },
  "afterFees": {
    "ebayFee": "$81.16",
    "netAvgRevenue": "$531.34"
  }
}
```

### Full Analyze Report — The Money Endpoint 💰

```json
{
  "keyword": "iphone 15 128gb unlocked",
  "verdict": "✅ Strong buy — good margin",
  "demand": "🔥 High",
  "trend": "📈 Rising",
  "trendPercent": "+8.2%",
  "soldData": {
    "sampleSize": 89,
    "avg": "$625.00",
    "median": "$618.00",
    "min": "$550.00",
    "max": "$700.00"
  },
  "activeData": {
    "count": 45,
    "avgPrice": "$645.00",
    "lowestPrice": "$589.00"
  },
  "bestActiveDeal": {
    "title": "iPhone 15 128GB - Like New",
    "price": "$589.00",
    "listingUrl": "https://www.ebay.com/itm/..."
  },
  "profitScenarios": {
    "buyPrice": "$300.00",
    "sellAtAvg": {
      "sellPrice": "$625.00",
      "fee": "$82.81",
      "profit": "$242.19",
      "roi": "80.7%"
    }
  }
}
```

---

## The Code

```typescript
import piggy, { usePiggy } from "nothing-browser";
import { existsSync, mkdirSync } from "fs";

// ──────────────────────────────────────────────
//  Setup
// ──────────────────────────────────────────────
if (!existsSync("./data")) mkdirSync("./data");

await piggy.launch({ mode: "tab", binary: "headless" });

// Register eBay — no pool for now (binary v0.1.8 doesn't handle pools well on heavy sites)
await piggy.register("ebay", "https://www.ebay.com");

// Act like a real human — random delays, natural scroll patterns
piggy.actHuman(true);

const { ebay } = usePiggy<"ebay">();

// ──────────────────────────────────────────────
//  Rate Limiter Middleware (60 req/min per IP)
// ──────────────────────────────────────────────
const rateLimitStore = new Map<string, number[]>();

const rateLimitMiddleware = async ({ headers, set }: any) => {
  const ip: string = headers["x-forwarded-for"] ?? "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 60;

  if (!rateLimitStore.has(ip)) rateLimitStore.set(ip, []);

  const hits = rateLimitStore.get(ip)!.filter((ts) => now - ts < windowMs);
  if (hits.length >= maxRequests) {
    set.status = 429;
    throw new Error("Rate limit exceeded — 60 requests per minute per IP.");
  }

  hits.push(now);
  rateLimitStore.set(ip, hits);
};

// ──────────────────────────────────────────────
//  Helper — build eBay search URL
// ──────────────────────────────────────────────
function buildSearchUrl(
  keyword: string,
  page: number,
  minPrice?: string,
  maxPrice?: string,
  condition?: string,
  sold?: boolean
): string {
  const params = new URLSearchParams({
    _nkw: keyword,
    _sacat: "0",
    _from: "R40",
    _pgn: String(page),
    _ipg: "60",
  });

  if (sold) {
    params.set("LH_Sold", "1");
    params.set("LH_Complete", "1");
  }
  if (minPrice) params.set("_udlo", minPrice);
  if (maxPrice) params.set("_udhi", maxPrice);

  const conditionMap: Record<string, string> = {
    new: "1000",
    used: "3000",
    refurbished: "2500",
  };
  if (condition && conditionMap[condition.toLowerCase()]) {
    params.set("LH_ItemCondition", conditionMap[condition.toLowerCase()]);
  }

  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

// ──────────────────────────────────────────────
//  ENDPOINT 1 — Search Listings
//  GET /ebay/search?q=iphone&page=1&minPrice=100&maxPrice=500&condition=used
// ──────────────────────────────────────────────
await ebay.api("/search", async (_params, query) => {
  const keyword   = query.q ?? "laptop";
  const page      = Math.max(1, parseInt(query.page) || 1);
  const minPrice  = query.minPrice;
  const maxPrice  = query.maxPrice;
  const condition = query.condition;
  const limit     = Math.min(parseInt(query.limit) || 20, 60);

  const url = buildSearchUrl(keyword, page, minPrice, maxPrice, condition, false);

  await ebay.navigate(url);
  await ebay.waitForSelector("div.su-card-container");

  // Simple scroll down and back — enough to trigger lazy loader
  await ebay.scroll.by(3000);
  await ebay.wait(1500);
  await ebay.scroll.by(-3000);
  await ebay.wait(500);

  const results = await ebay.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)")
    );

    return items.map((el) => {
      const linkEl  = el.querySelector("a.s-card__link") as HTMLAnchorElement | null;
      const imageEl = el.querySelector("img.s-card__image") as HTMLImageElement | null;
      const rawSrc = imageEl?.src || imageEl?.dataset.src || "";
      const imageUrl = rawSrc.includes("ir.ebaystatic.com") ? "" : rawSrc;

      const itemUrl = linkEl?.href ?? "";
      const itemIdMatch = itemUrl.match(/\/itm\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : null;

      const title = el.querySelector("div.s-card__title span.su-styled-text")?.textContent?.trim() ?? "";
      const condition = el.querySelector("div.s-card__subtitle span.su-styled-text")?.textContent?.trim() ?? "";
      const price = el.querySelector("span.s-card__price")?.textContent?.trim() ?? "";

      const attributeRows = el.querySelectorAll("div.s-card__attribute-row");
      const shipping = attributeRows.length > 1
        ? attributeRows[1].querySelector("span.su-styled-text")?.textContent?.trim() ?? ""
        : "";

      const sponsored = !!el.querySelector("div.s-card__sep");

      return {
        itemId,
        title,
        price,
        shipping,
        condition,
        seller: "",
        imageUrl,
        listingUrl: itemUrl,
        sponsored,
        scrapedAt: Date.now(),
      };
    });
  });

  // Filter out junk promo cards — real listings have numeric itemId and real title
  const real = results.filter(
    (item) => item.itemId && /^\d+$/.test(item.itemId) && item.title !== "Shop on eBay" && item.title !== ""
  );
  const trimmed = real.slice(0, limit);

  const totalText = await ebay.evaluate(() =>
    document.querySelector(".srp-controls__count-heading")?.textContent?.trim()
    || document.querySelector("h1.srp-controls__count")?.textContent?.trim()
    || ""
  );

  return {
    keyword,
    page,
    limit,
    filters: { minPrice: minPrice ?? null, maxPrice: maxPrice ?? null, condition: condition ?? null },
    totalResultsText: totalText,
    count: trimmed.length,
    listings: trimmed,
  };
}, {
  ttl: 45_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Search"],
    summary: "Search eBay listings",
    parameters: [
      { name: "q", in: "query", required: true, schema: { type: "string", example: "iphone 15 pro" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 60 } },
      { name: "minPrice", in: "query", schema: { type: "number" } },
      { name: "maxPrice", in: "query", schema: { type: "number" } },
      { name: "condition", in: "query", schema: { type: "string", enum: ["new", "used", "refurbished"] } }
    ]
  }
});

// ──────────────────────────────────────────────
//  ENDPOINT 2 — Listing Details
//  GET /ebay/listing/:itemId
// ──────────────────────────────────────────────
await ebay.api("/listing/:itemId", async (params) => {
  const { itemId } = params;

  if (!itemId || !/^\d+$/.test(itemId)) {
    throw new Error("Invalid itemId — must be a numeric eBay item ID.");
  }

  await ebay.navigate(`https://www.ebay.com/itm/${itemId}`);
  await ebay.waitForSelector("#mainContent");
  await ebay.waitForSelector("h1.x-item-title__mainTitle");
  await ebay.wait(800);

  const listing = await ebay.evaluate(() => {
    const title = document.querySelector("h1.x-item-title__mainTitle span.ux-textspans")?.textContent?.trim() ?? "";
    const price = document.querySelector("div.x-price-primary")?.textContent?.trim() ?? "";

    const condRaw = document.querySelector("div.x-item-condition-text")?.textContent?.trim().replace(/\s+/g, " ") ?? "";
    const condition = condRaw.includes(" - ") 
      ? condRaw.split(/(?<=\w)\s+(?=\w.*-)/)[0].trim()
      : condRaw.split(/\s{2,}/)[0].trim();

    const sellerRaw = document.querySelector("div.x-sellercard-atf__info__about-seller")?.textContent?.trim() ?? "";
    const sellerNameMatch = sellerRaw.match(/^(.+?)\s*\(/);

    const imageSet = new Set<string>();
    document.querySelectorAll("div.ux-image-carousel-item img").forEach((img) => {
      const i = img as HTMLImageElement;
      const src = (i.getAttribute("data-zoom-src") || i.src || i.dataset?.src || "")
        .replace(/s-l\d+\.webp/, "s-l1600.webp");
      if (src && !src.includes("ir.ebaystatic.com")) imageSet.add(src);
    });
    const images = Array.from(imageSet);

    const shipping = document.querySelector(".ux-labels-values--shipping .ux-labels-values__values-content")?.textContent?.trim() ?? "";
    const returns = document.querySelector(".ux-labels-values--returns .ux-labels-values__values-content")?.textContent?.trim() ?? "";

    const specifics: Record<string, string> = {};
    document.querySelectorAll(".ux-layout-section-evo__item--table-view .ux-labels-values").forEach((row) => {
      const label = row.querySelector(".ux-labels-values__labels-content span.ux-textspans")?.textContent?.trim();
      const value = row.querySelector(".ux-labels-values__values-content span.ux-textspans")?.textContent?.trim();
      if (label && value) specifics[label] = value;
    });

    const watchers = document.querySelector(".x-watch-heart-btn-text")?.textContent?.trim() ?? "";

    return {
      itemId: window.location.pathname.match(/\/itm\/(\d+)/)?.[1] ?? "",
      title,
      price,
      condition,
      currency: "USD",
      shipping,
      returns,
      watchers,
      seller: {
        name: sellerNameMatch?.[1]?.trim() ?? sellerRaw,
      },
      images,
      specifics,
      listingUrl: window.location.href,
      scrapedAt: Date.now(),
    };
  });

  return listing;
}, {
  ttl: 120_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Listings"],
    summary: "Get eBay listing details",
    parameters: [
      { name: "itemId", in: "path", required: true, schema: { type: "string", pattern: "^\\d+$" } }
    ]
  }
});

// ──────────────────────────────────────────────
//  ENDPOINT 3 — Sold / Completed Listings
//  GET /ebay/sold?q=ps5&page=1&minPrice=100&maxPrice=600
// ──────────────────────────────────────────────
await ebay.api("/sold", async (_params, query) => {
  const keyword   = query.q ?? "laptop";
  const page      = Math.max(1, parseInt(query.page) || 1);
  const minPrice  = query.minPrice;
  const maxPrice  = query.maxPrice;
  const condition = query.condition;
  const limit     = Math.min(parseInt(query.limit) || 20, 60);

  const url = buildSearchUrl(keyword, page, minPrice, maxPrice, condition, true);

  await ebay.navigate(url);
  await ebay.waitForSelector("div.su-card-container");

  await ebay.scroll.by(3000);
  await ebay.wait(1500);
  await ebay.scroll.by(-3000);
  await ebay.wait(500);

  const results = await ebay.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)")
    );

    return items.map((el) => {
      const linkEl = el.querySelector("a.s-card__link") as HTMLAnchorElement | null;
      const imageEl = el.querySelector("img.s-card__image") as HTMLImageElement | null;
      const rawSrc = imageEl?.src || imageEl?.dataset.src || "";
      const imageUrl = rawSrc.includes("ir.ebaystatic.com") ? "" : rawSrc;

      const itemUrl = linkEl?.href ?? "";
      const itemIdMatch = itemUrl.match(/\/itm\/(\d+)/);

      const title = el.querySelector("div.s-card__title span.su-styled-text")?.textContent?.trim() ?? "";
      const soldPrice = el.querySelector("span.s-card__price")?.textContent?.trim() ?? "";
      const condition = el.querySelector("div.s-card__subtitle span.su-styled-text")?.textContent?.trim() ?? "";

      const attributeRows = el.querySelectorAll("div.s-card__attribute-row");
      const soldDate = attributeRows.length > 1
        ? attributeRows[1].querySelector("span.su-styled-text")?.textContent?.trim() ?? ""
        : "";

      return {
        itemId: itemIdMatch ? itemIdMatch[1] : null,
        title,
        soldPrice,
        condition,
        soldDate,
        imageUrl,
        listingUrl: itemUrl,
        scrapedAt: Date.now(),
      };
    });
  });

  const trimmed = results.slice(0, limit);

  const prices = trimmed
    .map((item) => parseFloat(item.soldPrice.replace(/[^0-9.]/g, "")))
    .filter((p) => !isNaN(p) && p > 0);

  const priceStats = prices.length > 0
    ? {
        min: Math.min(...prices).toFixed(2),
        max: Math.max(...prices).toFixed(2),
        average: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
        median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)].toFixed(2),
        sampleSize: prices.length,
      }
    : null;

  return {
    keyword,
    page,
    limit,
    filters: { minPrice: minPrice ?? null, maxPrice: maxPrice ?? null, condition: condition ?? null },
    priceStats,
    count: trimmed.length,
    soldListings: trimmed,
  };
}, {
  ttl: 120_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Market Research"],
    summary: "Search sold / completed eBay listings",
    parameters: [
      { name: "q", in: "query", required: true, schema: { type: "string" } },
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 60 } },
      { name: "minPrice", in: "query", schema: { type: "number" } },
      { name: "maxPrice", in: "query", schema: { type: "number" } },
      { name: "condition", in: "query", schema: { type: "string", enum: ["new", "used", "refurbished"] } }
    ]
  }
});

// ──────────────────────────────────────────────
//  ENDPOINT 4 — Deals (Auctions ending soon below avg sold price)
//  GET /ebay/deals?q=iphone+15&maxPrice=400
// ──────────────────────────────────────────────
await ebay.api("/deals", async (_params, query) => {
  const keyword  = query.q ?? "iphone";
  const maxPrice = query.maxPrice;
  const limit    = Math.min(parseInt(query.limit) || 20, 60);

  const params = new URLSearchParams({
    _nkw: keyword,
    _sacat: "0",
    _from: "R40",
    LH_Auction: "1",
    _sop: "1",
    _ipg: "60",
  });
  if (maxPrice) params.set("_udhi", maxPrice);

  const url = `https://www.ebay.com/sch/i.html?${params.toString()}`;

  await ebay.navigate(url);
  await ebay.waitForSelector("div.su-card-container");
  await ebay.scroll.by(3000);
  await ebay.wait(1000);
  await ebay.scroll.by(-3000);
  await ebay.wait(500);

  const auctions = await ebay.evaluate(() => {
    return Array.from(document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)"))
      .map((el) => {
        const linkEl = el.querySelector("a.s-card__link") as HTMLAnchorElement | null;
        const imageEl = el.querySelector("img.s-card__image") as HTMLImageElement | null;
        const rawSrc = imageEl?.src || imageEl?.dataset.src || "";
        const itemUrl = linkEl?.href ?? "";
        const itemIdMatch = itemUrl.match(/\/itm\/(\d+)/);

        const title = el.querySelector("div.s-card__title span.su-styled-text")?.textContent?.trim() ?? "";
        const price = el.querySelector("span.s-card__price")?.textContent?.trim() ?? "";
        const condition = el.querySelector("div.s-card__subtitle span.su-styled-text")?.textContent?.trim() ?? "";

        const attributeRows = el.querySelectorAll("div.s-card__attribute-row");
        const timeLeft = attributeRows.length > 1
          ? attributeRows[1].querySelector("span.su-styled-text")?.textContent?.trim() ?? ""
          : "";

        const bidsEl = el.querySelector("span.s-card__bids");
        const bids = bidsEl?.textContent?.trim() ?? "0 bids";

        return {
          itemId: itemIdMatch ? itemIdMatch[1] : null,
          title,
          currentBid: price,
          bids,
          timeLeft,
          condition,
          imageUrl: rawSrc.includes("ir.ebaystatic.com") ? "" : rawSrc,
          listingUrl: itemUrl,
          scrapedAt: Date.now(),
        };
      })
      .filter((item) => item.itemId && item.title && item.title !== "Shop on eBay");
  });

  // Get avg sold price for context
  const soldParams = new URLSearchParams({
    _nkw: keyword, _sacat: "0", _from: "R40", _pgn: "1", _ipg: "60",
    LH_Sold: "1", LH_Complete: "1",
  });
  await ebay.navigate(`https://www.ebay.com/sch/i.html?${soldParams.toString()}`);
  await ebay.waitForSelector("div.su-card-container");

  const soldPrices = await ebay.evaluate(() =>
    Array.from(document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)"))
      .map((el) => parseFloat(
        (el.querySelector("span.s-card__price")?.textContent?.trim() ?? "")
          .replace(/[^0-9.]/g, "")
      ))
      .filter((p) => !isNaN(p) && p > 0)
  );

  const avgSold = soldPrices.length
    ? parseFloat((soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length).toFixed(2))
    : null;

  const deals = auctions.slice(0, limit).map((item) => {
    const bid = parseFloat(item.currentBid.replace(/[^0-9.]/g, ""));
    const belowAvg = avgSold && !isNaN(bid) ? avgSold - bid : null;
    return {
      ...item,
      avgSoldPrice: avgSold ? `$${avgSold}` : null,
      potentialProfit: belowAvg && belowAvg > 0
        ? `$${(belowAvg * 0.8675).toFixed(2)}`
        : null,
      isDeal: belowAvg !== null && belowAvg > 20,
    };
  });

  const hotDeals = deals.filter((d) => d.isDeal).length;

  return {
    keyword,
    avgSoldPrice: avgSold ? `$${avgSold}` : null,
    hotDealsFound: hotDeals,
    count: deals.length,
    deals,
  };
}, {
  ttl: 30_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Business Intelligence"],
    summary: "Find eBay auction deals",
    parameters: [
      { name: "q", in: "query", required: true, schema: { type: "string" } },
      { name: "maxPrice", in: "query", schema: { type: "number" } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
    ]
  }
});

// ──────────────────────────────────────────────
//  ENDPOINT 5 — Price Trend
//  GET /ebay/trend?q=iphone+15+128gb
// ──────────────────────────────────────────────
await ebay.api("/trend", async (_params, query) => {
  const keyword = query.q ?? "iphone";

  const allSold: { price: number; date: string }[] = [];

  for (let page = 1; page <= 3; page++) {
    const params = new URLSearchParams({
      _nkw: keyword, _sacat: "0", _from: "R40",
      _pgn: String(page), _ipg: "60",
      LH_Sold: "1", LH_Complete: "1",
      _sop: "10",
    });

    await ebay.navigate(`https://www.ebay.com/sch/i.html?${params.toString()}`);
    await ebay.waitForSelector("div.su-card-container");
    await ebay.wait(600);

    const pageData = await ebay.evaluate(() =>
      Array.from(document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)"))
        .map((el) => {
          const priceRaw = el.querySelector("span.s-card__price")?.textContent?.trim() ?? "";
          const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ""));
          const rows = el.querySelectorAll("div.s-card__attribute-row");
          const date = rows.length > 1
            ? rows[1].querySelector("span.su-styled-text")?.textContent?.trim() ?? ""
            : "";
          return { price, date };
        })
        .filter((d) => !isNaN(d.price) && d.price > 0)
    );

    allSold.push(...pageData);
  }

  if (allSold.length === 0) {
    return { keyword, error: "No sold data found" };
  }

  const prices = allSold.map((d) => d.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const median = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)];

  const half = Math.floor(prices.length / 2);
  const recentAvg = prices.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const olderAvg = prices.slice(half).reduce((a, b) => a + b, 0) / half;
  const trendPct = ((recentAvg - olderAvg) / olderAvg) * 100;
  const trend = trendPct > 3 ? "📈 Rising"
    : trendPct < -3 ? "📉 Falling"
    : "➡️ Stable";

  const ebayFee = parseFloat((avg * 0.1325).toFixed(2));
  const netAvg = parseFloat((avg - ebayFee).toFixed(2));

  return {
    keyword,
    sampleSize: allSold.length,
    trend,
    trendPercent: `${trendPct > 0 ? "+" : ""}${trendPct.toFixed(1)}%`,
    pricing: {
      avg: `$${avg.toFixed(2)}`,
      median: `$${median.toFixed(2)}`,
      min: `$${min.toFixed(2)}`,
      max: `$${max.toFixed(2)}`,
    },
    afterFees: {
      ebayFee: `$${ebayFee}`,
      netAvgRevenue: `$${netAvg}`,
      note: "Based on 13.25% eBay final value fee",
    },
    recentSold: allSold.slice(0, 10),
  };
}, {
  ttl: 300_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Business Intelligence"],
    summary: "Price trend for a search term",
    parameters: [
      { name: "q", in: "query", required: true, schema: { type: "string" } }
    ]
  }
});

// ──────────────────────────────────────────────
//  ENDPOINT 6 — Analyze (full reseller intelligence)
//  GET /ebay/analyze?q=iphone+15+128gb&buyPrice=300
// ──────────────────────────────────────────────
await ebay.api("/analyze", async (_params, query) => {
  const keyword = query.q ?? "iphone";
  const buyPrice = parseFloat(query.buyPrice ?? "0");

  // Active listings
  const activeParams = new URLSearchParams({
    _nkw: keyword, _sacat: "0", _from: "R40", _pgn: "1", _ipg: "60",
  });
  await ebay.navigate(`https://www.ebay.com/sch/i.html?${activeParams.toString()}`);
  await ebay.waitForSelector("div.su-card-container");
  await ebay.wait(600);

  const activeListings = await ebay.evaluate(() =>
    Array.from(document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)"))
      .map((el) => {
        const linkEl = el.querySelector("a.s-card__link") as HTMLAnchorElement | null;
        const itemUrl = linkEl?.href ?? "";
        const idMatch = itemUrl.match(/\/itm\/(\d+)/);
        const price = parseFloat(
          (el.querySelector("span.s-card__price")?.textContent?.trim() ?? "").replace(/[^0-9.]/g, "")
        );
        const title = el.querySelector("div.s-card__title span.su-styled-text")?.textContent?.trim() ?? "";
        const cond = el.querySelector("div.s-card__subtitle span.su-styled-text")?.textContent?.trim() ?? "";
        return { itemId: idMatch?.[1] ?? null, title, price, condition: cond, listingUrl: itemUrl };
      })
      .filter((i) => i.itemId && !isNaN(i.price) && i.price > 0 && i.title !== "Shop on eBay")
  );

  // Sold listings (2 pages)
  const soldAll: number[] = [];
  for (let page = 1; page <= 2; page++) {
    const soldParams = new URLSearchParams({
      _nkw: keyword, _sacat: "0", _from: "R40",
      _pgn: String(page), _ipg: "60",
      LH_Sold: "1", LH_Complete: "1", _sop: "10",
    });
    await ebay.navigate(`https://www.ebay.com/sch/i.html?${soldParams.toString()}`);
    await ebay.waitForSelector("div.su-card-container");
    await ebay.wait(500);

    const pagePrices = await ebay.evaluate(() =>
      Array.from(document.querySelectorAll("div.su-card-container:not(.su-card-container--ad)"))
        .map((el) => parseFloat(
          (el.querySelector("span.s-card__price")?.textContent?.trim() ?? "").replace(/[^0-9.]/g, "")
        ))
        .filter((p) => !isNaN(p) && p > 0)
    );
    soldAll.push(...pagePrices);
  }

  const avgSold = soldAll.reduce((a, b) => a + b, 0) / soldAll.length;
  const medSold = [...soldAll].sort((a, b) => a - b)[Math.floor(soldAll.length / 2)];
  const maxSold = Math.max(...soldAll);

  const activePrices = activeListings.map((i) => i.price);
  const avgActive = activePrices.reduce((a, b) => a + b, 0) / activePrices.length;
  const minActive = Math.min(...activePrices);

  const bestDeal = activeListings.sort((a, b) => a.price - b.price)[0];

  const ebayFeeRate = 0.1325;
  const demandRatio = soldAll.length / Math.max(activeListings.length, 1);
  const demandScore = demandRatio > 1.5 ? "🔥 High"
    : demandRatio > 0.8 ? "✅ Medium"
    : "❄️ Low";

  const half = Math.floor(soldAll.length / 2);
  const recentAvg = soldAll.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const olderAvg = soldAll.slice(half).reduce((a, b) => a + b, 0) / half;
  const trendPct = ((recentAvg - olderAvg) / olderAvg) * 100;
  const trend = trendPct > 3 ? "📈 Rising"
    : trendPct < -3 ? "📉 Falling"
    : "➡️ Stable";

  const profitAtAvg = avgSold * (1 - ebayFeeRate) - buyPrice;
  const verdict = buyPrice === 0
    ? "💡 Provide ?buyPrice=X for full verdict"
    : profitAtAvg > 50 ? "✅ Strong buy — good margin"
    : profitAtAvg > 20 ? "⚠️ Marginal — tight profit"
    : profitAtAvg > 0 ? "😬 Risky — very thin margin"
    : "❌ Avoid — selling below buy price";

  return {
    keyword,
    verdict,
    demand: demandScore,
    trend,
    trendPercent: `${trendPct > 0 ? "+" : ""}${trendPct.toFixed(1)}%`,
    soldData: {
      sampleSize: soldAll.length,
      avg: `$${avgSold.toFixed(2)}`,
      median: `$${medSold.toFixed(2)}`,
      min: `$${Math.min(...soldAll).toFixed(2)}`,
      max: `$${maxSold.toFixed(2)}`,
    },
    activeData: {
      count: activeListings.length,
      avgPrice: `$${avgActive.toFixed(2)}`,
      lowestPrice: `$${minActive.toFixed(2)}`,
    },
    bestActiveDeal: bestDeal ? {
      title: bestDeal.title,
      price: `$${bestDeal.price.toFixed(2)}`,
      listingUrl: bestDeal.listingUrl,
    } : null,
    profitScenarios: buyPrice > 0 ? {
      buyPrice: `$${buyPrice.toFixed(2)}`,
      sellAtAvg: {
        sellPrice: `$${avgSold.toFixed(2)}`,
        fee: `$${(avgSold * ebayFeeRate).toFixed(2)}`,
        profit: `$${profitAtAvg.toFixed(2)}`,
        roi: `${((profitAtAvg / buyPrice) * 100).toFixed(1)}%`,
      },
    } : null,
  };
}, {
  ttl: 120_000,
  before: [rateLimitMiddleware],
  detail: {
    tags: ["Business Intelligence"],
    summary: "Full reseller intelligence report",
    description: "The money endpoint 💰 — demand score, price trend, best deal, profit scenarios",
    parameters: [
      { name: "q", in: "query", required: true, schema: { type: "string" } },
      { name: "buyPrice", in: "query", schema: { type: "number" }, description: "Your purchase price — enables profit calculation" }
    ]
  }
});

// ──────────────────────────────────────────────
//  Start the Server 🚀
// ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "3000");

await piggy.serve(PORT, {
  hostname: "0.0.0.0",
  title: "eBay Scraper API",
  version: "1.0.0",
  description: "Unofficial eBay scraper API — search, sold research, deals, trends, and profit analysis"
});

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                   🐷  eBay Scraper API  🛒                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}                             ║
║                                                                  ║
║  Core Endpoints:                                                 ║
║  GET /ebay/search?q=iphone&page=1                                ║
║  GET /ebay/listing/:itemId                                       ║
║  GET /ebay/sold?q=ps5                                            ║
║                                                                  ║
║  💰 Business Intelligence:                                       ║
║  GET /ebay/deals?q=iphone+15                                    ║
║  GET /ebay/trend?q=iphone+15+128gb                               ║
║  GET /ebay/analyze?q=iphone+15+128gb&buyPrice=300                ║
║                                                                  ║
║  📖 OpenAPI: http://localhost:${PORT}/openapi                     ║
╚══════════════════════════════════════════════════════════════════╝
`);

ebay.noclose();

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await piggy.close();
  process.exit(0);
});
```

---

## How to Run

```bash
# 1. Install Piggy
bun add nothing-browser

# 2. Download binary v0.1.12+ from GitHub Releases
# Place nothing-browser-headless in your project root

# 3. Run
bun run ebay-scraper.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ebay/search?q=iphone&page=1&minPrice=100&condition=used` | Search active listings |
| GET | `/ebay/listing/:itemId` | Get full listing details |
| GET | `/ebay/sold?q=ps5&page=1` | Research sold prices with stats |
| GET | `/ebay/deals?q=iphone+15&maxPrice=400` | Auctions ending soon below avg |
| GET | `/ebay/trend?q=iphone+15+128gb` | Price trend (rising/falling/stable) |
| GET | `/ebay/analyze?q=iphone+15+128gb&buyPrice=300` | Full reseller report |

---

## Selector Notes

eBay changes HTML frequently. Current selectors:

| Element | Selector |
|---------|----------|
| Listing card | `div.su-card-container` |
| Title | `div.s-card__title span.su-styled-text` |
| Price | `span.s-card__price` |
| Condition | `div.s-card__subtitle span.su-styled-text` |
| Link | `a.s-card__link` |
| Image | `img.s-card__image` |

---

## Requirements

- Binary: v0.1.12+
- Library: v0.0.18+

---

## Next Steps

- [Script Marketplace](./) — Browse more scripts
- [Amazon Scraper](./amazon) — Amazon product search
- [Proxy Support](../guide/piggy/proxy-support) — Rotate IPs

---

*Nothing Ecosystem · Ernest Tech House · Kenya · 2026*
