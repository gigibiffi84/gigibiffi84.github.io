---
title: "reactjsday 2025 in pillole #1 — Dentro un bundler"
description: "Prima pillola dal reactjsday di Verona: reverse engineering di un bundler Javascript, ovvero cosa succede davvero prima che il vostro codice arrivi al browser"
date: 2026-07-19T10:00:00+02:00
tags: ["pillole", "reactjsday", "react", "bundler", "tooling"]
lang: it
translationKey: "reactjsday-2025-pillole-1-bundler"
---

Come promesso, partono le **pillole dal reactjsday 2025 di Verona**. Piccola nota di colore prima di cominciare: i miei appunti della conferenza non sono su un quaderno — sono un'app React. Ebbene sì, per un talk su React ho sviluppato le slide **in React**. Ognuna di queste pillole nasce da una di quelle slide.

#### La pillola

Il primo talk che ho scelto era un **reverse engineering di un bundler Javascript**: costruirne uno minimale per capire cosa fanno davvero Vite, Webpack e compagnia. Esercizio che consiglio a chiunque — è il modo migliore per smontare la magia.

Un bundler è lo strumento che aggrega tutti i tuoi file sorgente in uno o pochi file di output. Senza, saresti costretto a dichiarare ogni singolo file Javascript con il suo `<script>`, gestendo a mano l'ordine di caricamento, l'inquinamento dello scope globale e l'iniezione delle dipendenze tra moduli. Chi ha vissuto il frontend pre-2015 sa di cosa parlo — io ci ho scritto sopra [un articolo nel 2015](/blog/gods-of-build-tools/), quando questi problemi li risolvevamo con Grunt e Bower. Undici anni dopo, i problemi sono gli stessi; gli strumenti, per fortuna, no.

Cosa risolve un bundler oggi:

- **Code splitting**, minificazione e ottimizzazione
- **Caching e versioning** del codice (i famosi hash nei nomi dei file)
- **Hot reloading** in sviluppo
- **Transpiling** (TypeScript, JSX...)
- **Tree shaking**, per non spedire al browser codice che nessuno importa

#### Il takeaway

Il bundler non è una scatola nera da subire: è un centinaio di righe di codice concettuale che puoi capire fino in fondo. Se volete provarci, al talk è stato mostrato [simple-bundler](https://github.com/edodusi/simple-bundler), un bundler didattico perfetto per iniziare.

---

*I talk completi del reactjsday 2025 sono online: [Track 1](https://youtube.com/live/Bnj3D03Qzqc) e [Track 2](https://youtube.com/live/x9fvrjg0f-g). Prossima pillola: la piramide dei test.*
