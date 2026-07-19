// @ts-check
import { defineConfig } from 'astro/config';

// NOTA: se pubblichi su GitHub Pages senza dominio custom, cambia `site` in
// 'https://gigibiffi84.github.io' e aggiungi `base: '/<nome-repo>'`.
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
