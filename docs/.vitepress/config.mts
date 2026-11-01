import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

const base = '/shadowtrain/';

export default withMermaid(
  defineConfig({
    base,
    title: 'ShadowTrain',
    description: 'Offline-first cyberpunk workout logger — Pavel kettlebell & calisthenics progression engine',
    lang: 'en-US',
    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,
    themeConfig: {
      search: { provider: 'local' },
      nav: [
        { text: 'Home', link: '/' },
        { text: 'MVP Spec', link: '/spec' },
      ],
      sidebar: {
        '/': [
          {
            text: 'Documentation',
            items: [
              { text: 'Overview', link: '/' },
              { text: 'MVP Plan & Spec', link: '/spec' },
            ],
          },
        ],
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/ccmueller355/shadowtrain' },
      ],
    },
  }),
);
