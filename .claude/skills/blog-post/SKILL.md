---
name: blog-post
description: Pipeline completa di un articolo del blog luigibifulco.it (Astro) — invarianti di frontmatter, naming, i18n, immagine di testata, verifica meccanica con check-post.mjs, build, test e deploy su GitHub Pages. Usare quando si crea, si modifica, si verifica, si pubblica o si abilita un articolo, e quando qualcosa nel sito non appare come atteso.
---

# Articolo del blog: invarianti, build, test, deploy

Repo `gigibiffi84/gigibiffi84.github.io` → https://luigibifulco.it. Astro 5, content collection
type-safe, i18n it/en, deploy automatico su GitHub Pages.

Per lo **stile di scrittura** (voce di Luigi, struttura delle pillole) usa la skill `new-article`.
Questa skill copre tutto il resto: cosa deve essere vero perché un articolo funzioni, e come
verificarlo prima di pubblicare.

Prerequisito per ogni comando node/npm in questo repo:

```
export PATH=~/.nvm/versions/node/v24.18.1/bin:$PATH
```

## 1. Gli invarianti

Ricavati dallo schema in `src/content.config.ts`, dal routing in `src/pages/blog/[slug].astro` e
`src/pages/en/blog/[slug].astro`, e dalla convenzione degli articoli esistenti.

**Struttura dei file**

| Cosa | Dove | Regola |
|---|---|---|
| Articolo IT | `src/content/blog/it/<slug>.md` | obbligatorio |
| Articolo EN | `src/content/blog/en/<slug>.md` | opzionale, **stesso slug** |
| Immagine | `public/images/<slug>/header.jpg` | 1200×630 JPEG, condivisa IT/EN |
| Card generativa | `CARDS` in `scripts/gen-headers.mjs` | una riga per slug |

Lo **slug** è kebab-case, minuscolo, senza date. Il nome del file non entra nell'URL: la rotta si
costruisce da `translationKey`. Tenerli identici (`nome file == slug == translationKey`) è
l'invariante che impedisce sorprese.

**Frontmatter** — campi obbligatori dallo schema: `title`, `description`, `date`, `tags`, `lang`,
`translationKey`. `headerImage` è opzionale per Astro ma **obbligatorio per le regole del blog**.

```yaml
---
title: "Titolo dell'articolo"
description: "120-160 caratteri: è la meta description E il sottotitolo visibile sotto il titolo"
date: 2026-09-12T10:00:00+02:00
tags: ["tag1", "tag2", "tag3"]
lang: it
translationKey: "<slug>"
headerImage: "/images/<slug>/header.jpg"
hidden: true
---
```

- `date`: ISO completa **con orario e offset**. L'orario ordina gli articoli dello stesso giorno (il
  più recente in cima alla home). Astro non fa embargo sulle date: una data futura pubblica subito.
- `lang`: deve coincidere con la cartella. `it` in `it/`, `en` in `en/`.
- `translationKey`: identico nelle due lingue — è ciò che accende lo switch lingua e il
  `<link rel="alternate" hreflang>`.
- `tags`: 3-6, minuscoli. Finiscono nei meta `article:tag` e nelle `keywords` del JSON-LD.
- `hidden: true` **di default**: si committa e si pusha, ma in produzione non viene generata nessuna
  pagina (esclusa da rotte, home, RSS, sitemap, switch lingua). In `npm run dev` è invece visibile
  col badge "nascosto", così Luigi può leggerla in anteprima. Si abilita rimuovendo la riga.
- `draft: true` è un'altra cosa: la pagina esiste ed è raggiungibile, ma non è listata in home e RSS.
  Per l'embargo si usa `hidden`.
- Se esistono entrambe le lingue e `hidden` è disallineato, solo una va online e lo switch lingua non
  compare. È uno stato legittimo (traduzione non ancora pronta, o versione da rivedere), quindi il
  checker lo segnala come warning, non come errore: va confermato, non corretto per riflesso.

**Link interni** — il prefisso lingua è un invariante, non un dettaglio:

- da un articolo IT: `/blog/<slug>/`
- da un articolo EN: `/en/blog/<slug>/`

Uno slug linkato deve esistere **in quella lingua**, altrimenti è un 404 silenzioso: la build non se
ne accorge.

**Corpo** — niente `# ` di primo livello (l'h1 lo genera il layout dal `title`); le sezioni usano
`#### `. Codice in fenced block con linguaggio (Shiki, tema `github-dark`).

**SEO** — completamente automatica in `src/layouts/Base.astro`: canonical, Open Graph con `og:image`
assoluta, `article:tag`, `article:published_time`, Twitter card, JSON-LD `BlogPosting`, hreflang,
sitemap. Non aggiungere meta tag negli articoli: basta un frontmatter completo.

## 2. Immagine di testata

Ogni articolo ne ha una. Se non c'è una foto specifica, si genera in stile tema:

1. Aggiungi una riga in `CARDS` dentro `scripts/gen-headers.mjs`:
   ```js
   { slug: '<slug>', glyph: '<testo breve>', kicker: 'luigibifulco.it — <contesto>', h1: <hue>, h2: <hue> },
   ```
   - `glyph`: max ~14 caratteri, tipografico e a tema (`scale()`, `while (!done)`, `#7 · hooks`).
     Oltre i ~14 aggiungi `small: true`. Per le serie mantieni il pattern `#N · parola`.
   - `h1`/`h2`: coppia di tinte HSL 0-360 coerenti col tema (verde node, giallo JS, viola
     architettura, rosso errori…).
2. `export PATH=~/.nvm/versions/node/v24.18.1/bin:$PATH && node scripts/gen-headers.mjs`
   (playwright-core + Chrome installato; rigenera **tutte** le card, è idempotente).
3. L'immagine fa da banner nell'articolo (ritagliata 21:9) **e** da `og:image` per le card social —
   per questo deve restare 1200×630.

## 3. Test: verifica meccanica degli invarianti

Il repo non ha una suite di test. Il controllo degli invarianti è questo script:

```
export PATH=~/.nvm/versions/node/v24.18.1/bin:$PATH
node .claude/skills/blog-post/check-post.mjs <slug>
```

Verifica: forma dello slug; presenza dei file; campi obbligatori; `lang` coerente con la cartella;
`translationKey` uguale allo slug; lunghezza di `description` e `title`; formato e plausibilità della
data; numero e case dei tag; percorso dell'immagine, sua esistenza e dimensioni reali lette dal JPEG;
card in `gen-headers.mjs`; coerenza IT/EN di data, `hidden` e immagine; prefisso lingua,
raggiungibilità e slash finale di ogni link interno; assenza di h1 nel corpo. I blocchi di codice
sono esclusi dai controlli sul testo, così un `# commento` shell non passa per un h1.

Due livelli: `✗` **error** = qualcosa è rotto o fuori convenzione in modo non negoziabile (exit ≠ 0);
`!` **warning** = da leggere e valutare, non blocca. I post migrati da Kirby nel 2015 hanno diversi
warning noti (date senza orario, description corte, foto non 1200×630): è debito storico, non
regressione. Per un articolo nuovo l'obiettivo è **zero error e zero warning**.

Con `--built`, dopo una build, verifica anche l'output: pagina generata (o **non** generata se
`hidden`), presenza in `rss.xml` e in `sitemap-0.xml`.

Con `--all` al posto dello slug passa in rassegna tutti gli articoli e stampa solo quelli con
qualcosa da segnalare — utile dopo un refactor, o per capire cosa è già rotto prima di toccare
qualcosa (`--all --built` funziona allo stesso modo).

## 4. Build

```
export PATH=~/.nvm/versions/node/v24.18.1/bin:$PATH
npm run build
node .claude/skills/blog-post/check-post.mjs <slug> --built
```

`npm run build` fallisce se il frontmatter viola lo schema Zod — è il primo test vero. Poi
`--built` chiude il cerchio su ciò che lo schema non può sapere.

Anteprima locale quando serve vedere la resa:
- `npm run dev` → include gli articoli `hidden` (badge "nascosto"): è il modo per far leggere una
  bozza a Luigi.
- `npm run preview` → serve `dist/`, cioè esattamente ciò che andrà online: è il modo per
  verificare che un `hidden` sia davvero invisibile.

## 5. Deploy

Push su `main` → GitHub Actions (`.github/workflows/deploy.yml`, `withastro/action` +
`actions/deploy-pages`) builda e pubblica su Pages. Non c'è nessuno step manuale, e non c'è staging:
`main` **è** la produzione.

**Chiedi sempre conferma a Luigi prima di committare o pushare** — l'articolo esce a suo nome.

Dopo il push:

```
gh run watch                                  # oppure: gh run list --limit 3
curl -sI https://luigibifulco.it/blog/<slug>/ | head -1     # atteso: 200 se pubblicato, 404 se hidden
curl -s  https://luigibifulco.it/rss.xml | grep -c '<slug>' # presente solo se pubblicato
```

Pages ha qualche minuto di cache: se il 404 persiste subito dopo il deploy, riprova prima di
indagare.

**Abilitare un articolo hidden**: rimuovi `hidden: true` da **entrambe** le lingue → `npm run build`
→ `check-post.mjs <slug> --built` → commit → push → verifica live (pagina 200, presente in home, in
RSS e nella sitemap).

## 6. Ordine di lavoro consigliato

1. Scegli lo slug; scrivi IT (e EN se richiesto) con `hidden: true`.
2. Aggiungi la card in `gen-headers.mjs` ed esegui lo script.
3. `check-post.mjs <slug>` finché è pulito.
4. `npm run build` + `check-post.mjs <slug> --built`.
5. Riepilogo a Luigi, conferma, commit + push.
6. Verifica il run di Actions e l'URL live.
