// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://luigibifulco.it',
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
