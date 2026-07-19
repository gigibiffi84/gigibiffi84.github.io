# luigibifulco.it — Blog

Blog personale, migrato dal vecchio CMS Kirby ad [Astro](https://astro.build). Bilingue IT/EN.

## Struttura

- `src/content/blog/it/*.md` — articoli in italiano
- `src/content/blog/en/*.md` — versioni inglesi (stesso `translationKey` = stesso articolo)
- `public/images/<slug>/` — immagini e allegati originali di ogni articolo

Ogni articolo ha frontmatter YAML: `title`, `description`, `date`, `tags`, `lang`, `translationKey`, `headerImage` (opzionale), `draft` (opzionale — i draft non compaiono in home né nel feed RSS, ma la pagina esiste).

## Comandi

```sh
nvm use          # attiva Node 20 (vedi .nvmrc)
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
```

## Scrivere un nuovo articolo

Crea `src/content/blog/it/mio-articolo.md`:

```markdown
---
title: "Titolo"
description: "Breve descrizione"
date: 2026-07-19
tags: ["tag1", "tag2"]
lang: it
translationKey: "mio-articolo"
---

Testo in markdown...
```

Per la versione inglese, stesso file in `en/` con lo stesso `translationKey`: lo switch di lingua appare da solo.

## Deploy

Push su `main` → GitHub Actions builda e pubblica su GitHub Pages (`.github/workflows/deploy.yml`). Nelle impostazioni del repo: **Settings → Pages → Source: GitHub Actions**.

Con dominio custom `luigibifulco.it`: configura il dominio in Settings → Pages e lascia `site` in `astro.config.mjs` com'è. Senza dominio custom, cambia `site`/`base` come indicato nel commento in `astro.config.mjs`.
