---
name: new-article
description: Crea un nuovo articolo del blog completo di frontmatter, immagine di testata generata in stile tema e ottimizzazione SEO. Usare ogni volta che Luigi chiede di scrivere/creare un nuovo articolo o una nuova "pillola" per il blog.
---

# Nuovo articolo del blog

Procedura per creare un articolo di luigibifulco.it (Astro, repo `gigibiffi84/gigibiffi84.github.io`).

## 1. File markdown

Crea `src/content/blog/it/<slug>.md` (slug kebab-case, breve, senza date). Frontmatter:

```yaml
---
title: "Titolo dell'articolo"
description: "Descrizione di 120-160 caratteri: è la meta description E il sottotitolo visibile, deve invogliare al click nei risultati di ricerca"
date: 2026-07-19T10:00:00+02:00
tags: ["tag1", "tag2", "tag3"]
lang: it
hidden: true
translationKey: "<slug>"
headerImage: "/images/<slug>/header.jpg"
---
```

Regole:
- **date**: data odierna reale, con orario — gli orari servono a ordinare articoli pubblicati lo stesso giorno (il più recente finisce in cima alla home).
- **hidden: true di default**: l'articolo si pusha ma non esiste sul sito finché Luigi non dice di abilitarlo (si abilita rimuovendo la riga). Se Luigi chiede esplicitamente di pubblicare subito, ometti il flag.
- **tags**: 3-6, minuscoli; per le serie usare il tag comune della serie (es. `pillole` + `reactjsday`). Finiscono anche nei meta `article:tag` per i social.
- **translationKey**: identico allo slug; la versione inglese (se richiesta) va in `src/content/blog/en/<slug>.md` con lo **stesso** translationKey — lo switch lingua appare da solo.
- `draft: true` esiste ma è un'altra cosa: pagina raggiungibile ma non listata. Per l'embargo usare `hidden`.

## 2. Stile di scrittura (voce di Luigi)

- Prima persona, tono diretto e pragmatico, ironia leggera; opinioni nette in **grassetto**.
- Titoletti con `####`. Per le pillole: struttura `#### La pillola` → `#### Il takeaway`, chiusura con ponte alla prossima. Lunghezza pillola: 250-450 parole; articolo pieno: libero.
- Codice in fenced block con linguaggio; esempi concreti > teoria.
- Linkare i vecchi articoli del blog quando c'è un aggancio storico (percorsi interni `/blog/<slug>/`).
- Il motto di Luigi ("Complicare è facile, semplificare è difficile") si cita con parsimonia.

## 3. Immagine di testata

Ogni articolo DEVE avere `headerImage`. Se non esiste una foto specifica, generarla:

1. Aggiungi una riga in `CARDS` dentro `scripts/gen-headers.mjs`:
   `{ slug: '<slug>', glyph: '<testo breve evocativo>', kicker: 'luigibifulco.it — <contesto>', h1: <hue1>, h2: <hue2> }`
   - glyph: max ~14 caratteri, tipografico a tema (es. `scale()`, `#7 · hooks`, `window.*`); per le serie mantieni il pattern (`#N · parola`).
   - hue: coppia di tinte HSL 0-360 coerenti col tema dell'argomento (verde node, giallo JS, viola architettura...).
2. Esegui: `export PATH=~/.nvm/versions/node/v20.19.5/bin:$PATH && node scripts/gen-headers.mjs`
   (usa playwright-core + Chrome installato; genera 1200x630 JPEG in `public/images/<slug>/header.jpg`).
3. L'immagine fa da banner (21:9 contenuto, non invasivo) E da og:image per le card social.

## 4. SEO — già automatica, ma verifica

Il layout `Base.astro` genera da solo: canonical, Open Graph completo (`og:image` assoluta, `article:tag` dai tags, `article:published_time`), Twitter card, JSON-LD BlogPosting, sitemap. Non serve fare nulla oltre a un frontmatter completo. Checklist finale:
- description 120-160 caratteri, con le parole chiave dell'argomento
- title ≤ ~65 caratteri se possibile (viene troncato nelle SERP)
- immagine presente e generata

## 5. Verifica e pubblicazione

1. `export PATH=~/.nvm/versions/node/v20.19.5/bin:$PATH && npm run build` — deve completare senza errori; se l'articolo è `hidden` NON deve comparire tra le pagine generate.
2. Presenta a Luigi un riepilogo dei contenuti scritti e **chiedi conferma prima di committare/pushare** (l'articolo esce a suo nome).
3. Al push il deploy è automatico (GitHub Actions → Pages). Se non è hidden, verifica live su https://luigibifulco.it con curl.
4. Per abilitare un articolo hidden: rimuovi `hidden: true`, build, commit, push, verifica live (pagina 200, presente in home e RSS).
