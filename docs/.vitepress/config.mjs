import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nothing",
  description: "The Nothing Ecosystem — Does nothing... except everything that matters.",
  lang: 'en',
  lastUpdated: true,
  cleanUrls: true,
  
  // Ignore dead links to allow build to complete
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#00cc66' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Nothing Ecosystem' }],
    ['meta', { property: 'og:description', content: 'Browser, Scraper, Privacy — unified under one roof.' }],
  ],
  
  themeConfig: {
    logo: '/nothing-logo.svg',
    siteTitle: 'Nothing',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/what-is-nothing' },
      { text: 'Piggy API', link: '/piggy/' },
      { text: 'v0.1.3', link: 'https://github.com/BunElysiaReact/nothing-browser/releases' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'The Nothing Ecosystem',
          collapsed: false,
          items: [
            { text: 'What is Nothing', link: '/guide/what-is-nothing' },
            { text: 'The Three Pillars', link: '/guide/three-pillars' },
            { text: 'Version Timeline 2026', link: '/guide/timeline' },
            { text: 'Comparison', link: '/guide/comparison' }
          ]
        },
        {
          text: 'Nothing Browser (UI)',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/nothing-browser/' },
            { text: 'Installation', link: '/guide/nothing-browser/installation' },
            { text: 'Comparison', link: '/guide/nothing-browser/comparison' },
            { text: 'DEVTOOLS Tab', link: '/guide/nothing-browser/devtools' },
            { text: 'Network Inspector', link: '/guide/nothing-browser/network-inspector' },
            { text: 'WebSocket Capture', link: '/guide/nothing-browser/websocket-capture' },
            { text: 'Cookie Inspector', link: '/guide/nothing-browser/cookie-inspector' },
            { text: 'Storage Capture', link: '/guide/nothing-browser/storage' },
            { text: 'One-Click Export', link: '/guide/nothing-browser/export' },
            { text: 'YOUTUBE Tab', link: '/guide/nothing-browser/youtube' },
            { text: 'PLUGINS Tab', link: '/guide/nothing-browser/plugins' },
            { text: 'TECH HOUSE Tab', link: '/guide/nothing-browser/techhouse' },
            { text: 'BROWSER Tab', link: '/guide/nothing-browser/browser' },
            { text: 'Fingerprint Spoofing', link: '/guide/nothing-browser/fingerprint-spoofing' },
            { text: 'Session Management', link: '/guide/nothing-browser/sessions' },
            { text: 'Auto-Update', link: '/guide/nothing-browser/auto-update' },
            { text: 'Build from Source', link: '/guide/nothing-browser/build-from-source' },
            { text: 'Limitations', link: '/guide/nothing-browser/limitations' }
          ]
        },
        {
          text: 'Nothing Private Browser',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guide/private-browser/' },
            { text: 'Privacy Features', link: '/guide/private-browser/privacy' },
            { text: 'Installation', link: '/guide/private-browser/installation' },
            { text: 'Roadmap', link: '/guide/private-browser/roadmap' }
          ]
        },
        {
          text: 'Piggy — Scraper Library',
          collapsed: true,
          items: [
            { text: 'Quick Start', link: '/guide/piggy/quickstart' },
            { text: 'Why Piggy Exists', link: '/guide/piggy/why-piggy' },
            { text: 'Comparison with Other Tools', link: '/guide/piggy/comparison' },
            { text: 'Installation', link: '/guide/piggy/installation' },
            { text: 'Launch & Register', link: '/guide/piggy/launch' },
            { text: 'Navigation', link: '/guide/piggy/navigation' },
            { text: 'Interactions', link: '/guide/piggy/interactions' },
            { text: 'Data Extraction (evaluate)', link: '/guide/piggy/evaluate' },
            { text: '🔥 exposeFunction (RPC)', link: '/guide/piggy/expose-function' },
            { text: '🔧 exposeAndInject', link: '/guide/piggy/expose-inject' },
            { text: '🌐 Global Expose', link: '/guide/piggy/global-expose' },
            { text: '📡 Request Interception', link: '/guide/piggy/interception' },
            { text: '🎯 modifyResponse', link: '/guide/piggy/modify-response' },
            { text: '📦 Local Cache Mode', link: '/guide/piggy/cache-mode' },
            { text: '💾 Session Persistence', link: '/guide/piggy/session' },
            { text: '📸 Screenshot & PDF', link: '/guide/piggy/screenshot' },
            { text: '🌐 Multi-Site Parallel', link: '/guide/piggy/multi-site' },
            { text: '🧠 Human Mode', link: '/guide/piggy/human-mode' },
            { text: '🕸️ Network Capture', link: '/guide/piggy/network-capture' },
            { text: '🍪 Cookie Management', link: '/guide/piggy/cookies' },
            { text: '🎨 Fingerprint Spoofing', link: '/guide/piggy/fingerprint' },
            { text: '🚫 Anti-Detection', link: '/guide/piggy/anti-detection' },
            { text: '🚀 Built-in API Server', link: '/guide/piggy/api-server' },
            { text: '📦 Middleware', link: '/guide/piggy/middleware' },
            { text: '📝 Full API Reference', link: '/guide/piggy/api-reference' },
            { text: '📘 TypeScript Types', link: '/guide/piggy/types' }
          ]
        },
        {
          text: 'Technical Deep Dive',
          collapsed: true,
          items: [
            { text: 'TLS Fingerprint Report', link: '/guide/technical/tls-fingerprint' },
            { text: 'How exposeFunction Works', link: '/guide/technical/expose-function-internals' },
            { text: 'Build from Source', link: '/guide/technical/build-from-source' },
            { text: 'Limitations', link: '/guide/technical/limitations' }
          ]
        },
        {
          text: 'Community',
          collapsed: true,
          items: [
            { text: 'About & Credits', link: '/guide/community/about' },
            { text: 'Roadmap', link: '/guide/community/roadmap' },
            { text: 'Contributing', link: '/guide/community/contributing' },
            { text: 'Funding', link: '/guide/community/funding' }
          ]
        },
      ],
      '/piggy/': [
        {
          text: 'Piggy API Reference',
          items: [
            { text: 'Overview', link: '/piggy/' },
            { text: 'Launch Options', link: '/piggy/launch' },
            { text: 'Site Methods', link: '/piggy/site-methods' },
            { text: 'Intercept API', link: '/piggy/intercept' },
            { text: 'Expose API', link: '/piggy/expose' },
            { text: 'Capture API', link: '/piggy/capture' },
            { text: 'Session API', link: '/piggy/session' },
            { text: 'API Server', link: '/piggy/api-server' },
            { text: 'Types', link: '/piggy/types' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BunElysiaReact/nothing-browser' },
      { icon: 'discord', link: 'https://discord.gg/TUxBVQ7y' }
    ],
    
    footer: {
      message: 'MIT Licensed | Built by Ernest Tech House · Kenya · 2026',
      copyright: 'Copyright © 2026 Ernest Tech House'
    },
    
    search: {
      provider: 'local'
    },
    
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  },
  
  markdown: {
    theme: 'github-dark',
    lineNumbers: true
  }
})