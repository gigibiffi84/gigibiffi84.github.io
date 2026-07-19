---
title: "reactjsday 2025 in pillole #2 — Una pipeline di test a prova di proiettile"
description: "Dalla unit al E2E: come strutturare l'investimento sui test di una app React senza mandare in bancarotta la CI"
date: 2026-07-19T10:05:00+02:00
tags: ["pillole", "reactjsday", "react", "testing", "playwright", "vitest"]
lang: it
hidden: true
translationKey: "reactjsday-2025-pillole-2-testing"
headerImage: "/images/reactjsday-2025-pillole-2-testing/header.jpg"
---

Seconda pillola dal **reactjsday 2025**: *From Unit to E2E: Crafting a Bulletproof testing pipeline for React Apps*. Titolo ambizioso, contenuti concreti.

#### La pillola

Il punto di partenza è un classico che non invecchia: la **piramide dei test di Mike Cohn**. Tanti unit test veloci alla base, meno test di integrazione nel mezzo, pochi E2E in cima. Sembra ovvio, ma è il punto dove più team sbagliano l'investimento.

Le note che mi sono portato a casa:

- **I componenti non sono mai davvero isolati**, quindi lo unit test da solo non basta. Serve una strategia multi-livello.
- **Troppi E2E sono un costo**, non una garanzia: tempi di esecuzione che si allungano, flakiness, CI che diventa un collo di bottiglia. La piramide serve proprio a evitare che diventi un rettangolo.
- **Raccogliete metriche durante l'esecuzione dei test**: senza numeri sul ROI e senza uno storico dei report non potete capire dove sono i veri punti di fallimento.
- **Quality gate a ogni livello**, a partire dalla workstation locale: strumenti come Husky permettono di far rispettare gli standard già prima del commit, quando correggere costa poco.
- Il consiglio più pratico del talk: **scrivere unit test sui componenti visuali che rispecchiano gli scenari E2E di Playwright**, usando Vitest e React Testing Library con le query raccomandate — `getByRole` (ruoli ARIA), `getByText`, `getByLabelText`, `getByPlaceholderText`. Stesso linguaggio a due livelli della piramide: se cambia il markup ma non il comportamento, i test reggono.

#### Il takeaway

I test sono un investimento con un ROI da misurare, non un rito da celebrare. Metteteli dove costano poco e rendono tanto, e fate parlare unit ed E2E la stessa lingua.

Per approfondire: [Testing JavaScript](https://www.testingjavascript.com/) di Kent C. Dodds e [Mastering React Test-Driven Development](https://github.com/PacktPublishing/Mastering-React-Test-Driven-Development-Second-Edition).

---

*Prossima pillola: lo state management e i suoi scope.*
