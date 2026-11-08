import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

// ── Base path ─────────────────────────────────────────────────
// For GitHub Pages project site: https://<org>.github.io/<repo>/
const base = '/shadowtrain/';

export default withMermaid(
  defineConfig({
    base,
    title: 'ShadowTrain',
    description:
      'Offline-first cyberpunk workout logger — fixed-kettlebell & calisthenics progression engine',
    lang: 'en-US',
    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,

    head: [['link', { rel: 'icon', href: '/shadowtrain/favicon.png' }]],

    themeConfig: {
      search: { provider: 'local' },
      lastUpdated: { text: 'Updated' },

      nav: [
        { text: 'Home', link: '/' },
        { text: 'MVP Spec', link: '/spec' },
        { text: 'CI & Testing', link: '/ci-and-testing' },
        { text: 'Coverage', link: '/coverage' },
      ],

      sidebar: {
        '/': [
          {
            text: 'ShadowTrain Deck',
            items: [
              { text: 'Overview & Roadmap', link: '/' },
              { text: 'MVP Plan & Spec (M0–M9)', link: '/spec' },
              { text: 'CI, Pre-Commit & CT Tests', link: '/ci-and-testing' },
              { text: 'Code Coverage', link: '/coverage' },
            ],
          },
        ],
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/ccmueller355/shadowtrain' },
      ],
    },

    mermaidPlugin: {
      theme: 'neutral',
      themeVariables: {
        primaryColor: '#1a1815',
        primaryBorderColor: '#cc4444',
        lineColor: '#c4a44a',
      },
    },
  }),
);
