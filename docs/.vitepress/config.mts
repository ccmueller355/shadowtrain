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
        { text: 'Operator Manual', link: '/manual' },
        { text: 'MVP Spec', link: '/spec' },
        {
          text: 'Shadow Dossier',
          items: [
            { text: 'Roster Overview', link: '/trainers/' },
            { text: '00 // UNIT-0 Spar-Drone', link: '/trainers/drone' },
            { text: '01 // Kaelen "Tusk" Vorga', link: '/trainers/kaelen' },
            { text: '02 // Valerie "Glitch" Vance', link: '/trainers/valerie' },
            { text: '03 // Marcus "Vanguard" Kade', link: '/trainers/marcus' },
            { text: '04 // Soren "Wraith" Kael', link: '/trainers/soren' },
            { text: '05 // Lyra "Aether" Vael', link: '/trainers/lyra' },
          ],
        },
        { text: 'Art Prompts', link: '/image-prompts' },
        { text: 'CI & Testing', link: '/ci-and-testing' },
        { text: 'Coverage', link: '/coverage' },
      ],

      sidebar: {
        '/': [
          {
            text: 'ShadowTrain Deck',
            items: [
              { text: 'Overview & Roadmap', link: '/' },
              { text: 'Field Operator Manual', link: '/manual' },
              { text: 'MVP Plan & Spec (M0–M10)', link: '/spec' },
              { text: 'CI, Pre-Commit & CT Tests', link: '/ci-and-testing' },
              { text: 'Code Coverage', link: '/coverage' },
            ],
          },
          {
            text: 'Shadow Dossier // Specialists',
            items: [
              { text: 'Roster Overview', link: '/trainers/' },
              { text: '00 // UNIT-0 Spar-Drone', link: '/trainers/drone' },
              { text: '01 // Kaelen "Tusk" Vorga', link: '/trainers/kaelen' },
              { text: '02 // Valerie "Glitch" Vance', link: '/trainers/valerie' },
              { text: '03 // Marcus "Vanguard" Kade', link: '/trainers/marcus' },
              { text: '04 // Soren "Wraith" Kael', link: '/trainers/soren' },
              { text: '05 // Lyra "Aether" Vael', link: '/trainers/lyra' },
              { text: 'Generative Art Prompts', link: '/image-prompts' },
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
