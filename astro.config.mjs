// @ts-check
import { defineConfig } from 'astro/config';

// NOTA: quando il DNS di luigibifulco.it punterà a GitHub Pages, riporta
// `site` a 'https://luigibifulco.it' e ricrea public/CNAME con quel dominio.
export default defineConfig({
  site: 'https://gigibiffi84.github.io',
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
