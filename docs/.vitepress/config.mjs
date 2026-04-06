import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nothing Browser',
  description: 'Does nothing... except everything that matters.',
  lang: 'en-US',

  head: [
    ['meta', { name: 'theme-color', content: '#00cc66' }],
    ['meta', { name: 'og:title', content: 'Nothing Browser Docs' }],
    ['meta', { name: 'og:description', content: 'Does nothing... except everything that matters.' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Nothing Browser',

    nav: [
      { text: 'Guide', link: '/guide/what-is-nothing-browser' },
      { text: 'Features', link: '/guide/features' },
      { text: 'TLS Report', link: '/guide/tls-fingerprint' },
      { text: 'Roadmap', link: '/guide/roadmap' },
      { text: 'About', link: '/about' },
      {
        text: 'Community',
        items: [
          { text: 'GitHub', link: 'https://github.com/BunElysiaReact/nothing-browser' },
          { text: 'Discord', link: 'https://discord.gg/TUxBVQ7y' },
          { text: 'WhatsApp', link: 'https://whatsapp.com/channel/0029VbBzoXuCxoArtvaslR0U' },
        ]
      },
      {
        text: 'Legal',
        items: [
          { text: 'Privacy Policy', link: '/legal/privacy' },
          { text: 'Terms of Use', link: '/legal/terms' },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'What is Nothing Browser', link: '/guide/what-is-nothing-browser' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Build from Source', link: '/guide/build-from-source' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Overview', link: '/guide/features' },
          { text: 'Network Inspector', link: '/guide/network-inspector' },
          { text: 'WebSocket Capture', link: '/guide/websocket-capture' },
          { text: 'Cookie Inspector', link: '/guide/cookie-inspector' },
          { text: 'One-Click Export', link: '/guide/export' },
          { text: 'Fingerprint Spoofing', link: '/guide/fingerprint-spoofing' },
          { text: 'Plugin System', link: '/guide/plugins' },
          { text: 'Session Management', link: '/guide/sessions' },
          { text: 'Auto-Update', link: '/guide/auto-update' },
        ]
      },
      {
        text: 'The Tabs',
        items: [
          { text: 'DEVTOOLS', link: '/guide/tab-devtools' },
          { text: 'BROWSER', link: '/guide/tab-browser' },
          { text: 'YOUTUBE (NthTube)', link: '/guide/tab-youtube' },
          { text: 'TECH HOUSE', link: '/guide/tab-techhouse' },
          { text: 'PLUGINS', link: '/guide/tab-plugins' },
        ]
      },
      {
        text: 'Research',
        items: [
          { text: 'TLS Fingerprint Report', link: '/guide/tls-fingerprint' },
          { text: 'Comparison Table', link: '/guide/comparison' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Roadmap', link: '/guide/roadmap' },
          { text: 'Known Limitations', link: '/guide/limitations' },
          { text: 'Credits', link: '/guide/credits' },
        ]
      },
      {
        text: 'About',
        items: [
          { text: 'About Ernest Tech House', link: '/about' },
        ]
      },
      {
        text: 'Legal',
        items: [
          { text: 'Privacy Policy', link: '/legal/privacy' },
          { text: 'Terms of Use', link: '/legal/terms' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BunElysiaReact/nothing-browser' },
      { icon: 'discord', link: 'https://discord.gg/TUxBVQ7y' },
    ],

    footer: {
      message: 'MIT License — use it, build on it, sell scripts with it.',
      copyright: 'Built by Ernest Tech House · Coded by Pease Ernest'
    },

    editLink: {
      pattern: 'https://github.com/BunElysiaReact/nothing-browser/edit/main/docs/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: 'Updated at',
    }
  },

  markdown: {
    theme: {
      light: 'github-dark',
      dark: 'github-dark'
    }
  }
})
