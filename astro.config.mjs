import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCallouts from './src/lib/remark-callouts.mjs';

export default defineConfig({
  site: 'https://marcoveron.me',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkCallouts],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
