---
layout: home

hero:
  name: "Nothing"
  text: "Does nothing..."
  tagline: "except everything that matters."
  image:
    src: /nothing-logo.svg
    alt: Nothing Ecosystem
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-nothing
    - theme: alt
      text: Piggy API
      link: /guide/piggy/quickstart
    - theme: alt
      text: Download Scraping Browser
      link: https://github.com/ernest-tech-house-co-operation/nothing-browser/releases
    - theme: alt
      text: Download Private Browser
      link: https://github.com/ernest-tech-house-co-operation/nothing-private-browser/releases

features:
  - icon: 🦊
    title: Nothing Browser
    details: Full-featured Qt6/Chromium browser. DevTools baked in. Network capture, WebSocket inspector, one-click exports. For API reverse engineering and web scraping research.
    link: /guide/nothing-browser/
    linkText: Learn More

  - icon: 🔒
    title: Nothing Private Browser
    details: Privacy-first sibling. Zero telemetry. Zero session persistence. Fingerprint spoofing, WebRTC leak protection. No tracking. No black boxes.
    link: /guide/private-browser/
    linkText: Learn More

  - icon: 🐷
    title: Piggy — Scraper Library
    details: Bun + TypeScript headless browser library. Built-in fingerprint spoofing, network capture, session persistence, and Browser → Node.js RPC with exposeFunction.
    link: /guide/piggy/quickstart
    linkText: Quick Start

  - icon: 🔥
    title: exposeFunction (RPC)
    details: Call Node.js functions directly from browser JavaScript. Process WebSocket messages, handle auth, save to database — in real time.
    link: /guide/piggy/expose-function

  - icon: 📡
    title: Request Interception
    details: Block, redirect, or serve custom responses. Cache API responses locally. Mock endpoints. Modify response bodies on the fly.
    link: /guide/piggy/interception

  - icon: 🧬
    title: Chrome-Identical TLS
    details: Nothing Browser uses real BoringSSL — the same TLS stack as Chrome. Passes Cloudflare bot detection where Python and cURL fail.
    link: /guide/technical/tls-fingerprint

  - icon: 🧩
    title: Plugin System
    details: Community JS plugins injected at DocumentCreation. Install from inside the browser — no terminal required.
    link: /guide/nothing-browser/plugins

  - icon: ⚡
    title: One-Click Export
    details: Any captured request becomes Python (requests + curl_cffi), cURL, JavaScript fetch, or raw HTTP. Instantly.
    link: /guide/nothing-browser/export

  - icon: 💾
    title: Session Persistence
    details: Auto-save sessions on close. Load any previous session — all network traffic, cookies, WebSocket frames preserved.
    link: /guide/nothing-browser/sessions

  - icon: 🌐
    title: Multi-Site Parallel
    details: Control multiple browser tabs simultaneously. Register multiple sites, run operations in parallel, compare results.
    link: /guide/piggy/multi-site

  - icon: 🧠
    title: Human Mode
    details: "Random delays, simulated typos, natural scrolling patterns. Bypass behavioral detection with one line: piggy.actHuman(true)."
    link: /guide/piggy/human-mode

  - icon: 🚀
    title: Built-in API Server
    details: Turn your scraper into an API with one line. piggy.serve(3000) — automatic route generation, caching, middleware support.
    link: /guide/piggy/api-server
---

<div class="version-warning">
  <div class="warning-icon">⚠️</div>
  <div class="warning-content">
    <strong>Important Version Notice</strong><br>
    <strong>Piggy library v0.1.0 is buggy.</strong> Please stick with <strong>v0.0.20+</strong> for now.<br>
    Use <code>bun add nothing-browser@0.0.21</code> to get the stable library version.<br><br>
    <strong>Binary versions below v0.1.14 are buggy.</strong> Please download <strong>v0.1.14 or higher</strong>.<br>
    <strong> fixes are being worked on as of now and this notice will be removed when they are stable enough<strong>
    Download from <a href="https://github.com/BunElysiaReact/nothing-browser/releases" target="_blank" style="color: #ff8888;">GitHub Releases</a>.
  </div>
</div>

<div class="ecosystem-stats">
  <div class="stat">
    <span class="stat-number">3</span>
    <span class="stat-label">Products</span>
  </div>
  <div class="stat">
    <span class="stat-number">100+</span>
    <span class="stat-label">API Methods</span>
  </div>
  <div class="stat">
    <span class="stat-number">100%</span>
    <span class="stat-label">Open Source</span>
  </div>
  <div class="stat">
    <span class="stat-number">MIT</span>
    <span class="stat-label">License</span>
  </div>
</div>

## 📊 What is Nothing?

<div class="seo-grid">
  <div class="seo-card">
    <h3>🦊 Nothing Browser</h3>
    <p><strong>The scraper-first browser.</strong> Built for API reverse engineering, web scraping, and automation research. Every request, response, and WebSocket frame is captured automatically. One-click export to Python, cURL, or JavaScript. Passes Cloudflare where other tools fail.</p>
    <a href="/guide/nothing-browser/">Learn more →</a>
  </div>
  <div class="seo-card">
    <h3>🔒 Nothing Private Browser</h3>
    <p><strong>The privacy-first browser.</strong> Zero telemetry. Zero session persistence. Fingerprint spoofing, WebRTC leak protection, no tracking, no black boxes. Close the browser and everything is wiped.</p>
    <a href="/guide/private-browser/">Learn more →</a>
  </div>
  <div class="seo-card">
    <h3>🐷 Piggy</h3>
    <p><strong>The scraper library.</strong> Bun + TypeScript headless browser automation. Built-in fingerprint spoofing, session persistence, and Browser → Node.js RPC with exposeFunction. One import. 20 lines. Go.</p>
    <a href="/guide/piggy/quickstart">Quick Start →</a>
  </div>
</div>

<div class="github-section">
  <div class="github-cards">
    <a href="https://github.com/ernest-tech-house-co-operation/nothing-browser" class="github-card">
      <span class="github-icon">📦</span>
      <div>
        <strong>nothing-browser</strong>
        <small>Piggy scraper library · TypeScript</small>
      </div>
      <span class="github-stars">⭐ 22</span>
    </a>
    <a href="https://github.com/BunElysiaReact/nothing-browser" class="github-card">
      <span class="github-icon">🦊</span>
      <div>
        <strong>nothing-browser-core</strong>
        <small>Qt6/Chromium binary · C++</small>
      </div>
    </a>
    <a href="https://github.com/ernest-tech-house-co-operation/nothing-private-browser" class="github-card">
      <span class="github-icon">🔒</span>
      <div>
        <strong>nothing-private-browser</strong>
        <small>Privacy browser · C++</small>
      </div>
    </a>
  </div>
</div>

## 📜 Legal

<div class="legal-links">
  <a href="/privacypolicy" class="legal-btn">🔒 Privacy Policy</a>
  <a href="/termsofservice" class="legal-btn">📋 Terms of Service</a>
  <a href="/acceptableuse" class="legal-btn">⚖️ Acceptable Use Policy</a>
</div>

## 📞 Support & Community

<div class="support-section">
  <div class="support-links">
    <a href="https://discord.gg/TUxBVQ7y" class="support-btn discord">💬 Discord</a>
    <a href="https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U" class="support-btn whatsapp">📱 WhatsApp Channel</a>
    <a href="https://github.com/ernest-tech-house-co-operation/nothing-browser" class="support-btn github">🐙 GitHub (Piggy)</a>
    <a href="https://github.com/BunElysiaReact/nothing-browser" class="support-btn github">🐙 GitHub (Core)</a>
    <a href="https://github.com/ernest-tech-house-co-operation/nothing-private-browser" class="support-btn github">🐙 GitHub (Private)</a>
  </div>
  
  <div class="contact-info">
    <p><strong>📧 Email:</strong> <a href="mailto:ernesttechhouse@gmail.com">ernesttechhouse@gmail.com</a></p>
    <p><strong>📱 WhatsApp Business:</strong> <a href="https://wa.me/254103106336">+254 103 106 336</a> (direct messaging)</p>
    <p><strong>💬 Discord:</strong> <a href="https://discord.gg/TUxBVQ7y">pease ernest8</a> (direct messaging available)</p>
  </div>
  
  <div class="reply-schedule">
    <p>📢 <strong>Any questions are passed through email, Discord, and WhatsApp channel.</strong></p>
    <p>💬 <strong>I am chatty</strong> — if you want direct messaging, use the official WhatsApp Business account number or Discord.</p>
    <p>⏰ <strong>My reply schedule will change depending on how many DMs I get per hour.</strong> Be patient — I'm a solo developer.</p>
  </div>
</div>

<div class="home-footer">

**Built by [Ernest Tech House](mailto:ernesttechhouse@gmail.com) · Coded by Pease Ernest**

*Kenya · 2026*

</div>

<style>
.version-warning {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 12px;
  padding: 16px 24px;
  margin: 24px auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-icon {
  font-size: 28px;
}

.warning-content {
  color: #ff8888;
  font-size: 14px;
  line-height: 1.5;
}

.warning-content strong {
  color: #ff4444;
  font-size: 16px;
}

.warning-content code {
  background: rgba(255, 68, 68, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #ff8888;
}

.ecosystem-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin: 48px 0;
  padding: 24px;
  border-top: 1px solid #2c2c2c;
  border-bottom: 1px solid #2c2c2c;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #00cc66;
}

.stat-label {
  font-size: 14px;
  color: #888;
}

.seo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 48px 0;
}

.seo-card {
  background: #1a1a1a;
  border: 1px solid #2c2c2c;
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s;
}

.seo-card:hover {
  transform: translateY(-4px);
  border-color: #00cc66;
}

.seo-card h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #00cc66;
}

.seo-card p {
  margin: 0 0 16px 0;
  line-height: 1.5;
  color: #ccc;
}

.seo-card a {
  color: #00cc66;
  text-decoration: none;
}

.seo-card a:hover {
  text-decoration: underline;
}

.github-section {
  margin: 48px 0;
}

.github-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.github-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a1a1a;
  border: 1px solid #2c2c2c;
  border-radius: 10px;
  padding: 16px 24px;
  text-decoration: none;
  transition: all 0.2s;
  min-width: 260px;
}

.github-card:hover {
  border-color: #00cc66;
  transform: translateY(-2px);
}

.github-icon {
  font-size: 24px;
}

.github-card strong {
  display: block;
  color: #fff;
  font-size: 14px;
}

.github-card small {
  color: #888;
  font-size: 11px;
}

.github-stars {
  margin-left: auto;
  color: #00cc66;
  font-size: 12px;
  font-weight: 600;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 24px 0 48px 0;
  flex-wrap: wrap;
}

.legal-btn {
  display: inline-block;
  padding: 10px 24px;
  background: #1a1a1a;
  border: 1px solid #2c2c2c;
  border-radius: 8px;
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.legal-btn:hover {
  border-color: #00cc66;
  color: #00cc66;
  transform: translateY(-2px);
}

.support-section {
  background: #1a1a1a;
  border: 1px solid #2c2c2c;
  border-radius: 12px;
  padding: 32px;
  margin: 48px 0;
}

.support-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.support-btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.support-btn:hover {
  opacity: 0.8;
}

.support-btn.discord {
  background: #5865F2;
  color: white;
}

.support-btn.whatsapp {
  background: #25D366;
  color: white;
}

.support-btn.github {
  background: #333;
  color: white;
}

.contact-info {
  margin: 24px 0;
  padding: 16px;
  background: #0d0d0d;
  border-radius: 8px;
}

.contact-info p {
  margin: 8px 0;
}

.contact-info a {
  color: #00cc66;
}

.reply-schedule {
  margin-top: 24px;
  padding: 16px;
  background: #0d0d0d;
  border-radius: 8px;
  border-left: 3px solid #00cc66;
}

.reply-schedule p {
  margin: 8px 0;
  color: #aaa;
}

.home-footer {
  text-align: center;
  padding: 48px 24px 24px;
  font-family: monospace;
  font-size: 12px;
  color: #666;
  border-top: 1px solid #2c2c2c;
  margin-top: 40px;
}

.home-footer a {
  color: #00cc66;
}

.VPFeatures .VPFeature {
  border-radius: 12px;
  transition: transform 0.2s;
}

.VPFeatures .VPFeature:hover {
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .VPHomeHero .actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .version-warning {
    margin: 16px;
    padding: 12px 16px;
  }
  
  .warning-content {
    font-size: 12px;
  }
  
  .support-links {
    flex-direction: column;
    align-items: center;
  }
  
  .support-btn {
    width: 100%;
    text-align: center;
  }
  
  .legal-links {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .legal-btn {
    width: 100%;
    text-align: center;
  }
  
  .github-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .github-card {
    width: 100%;
    max-width: 320px;
  }
}
</style>