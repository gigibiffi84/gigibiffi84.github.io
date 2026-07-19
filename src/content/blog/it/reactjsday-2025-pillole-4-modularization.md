---
title: "reactjsday 2025 in pillole #4 — Modularizzare per scalare a 15+ team"
description: "Il case study Thoughtworks: modularizzazione (che non è code splitting), configurazioni a runtime e l'importanza di un platform team"
date: 2026-07-19T10:15:00+02:00
tags: ["pillole", "reactjsday", "react", "architettura", "modularization"]
lang: it
hidden: true
translationKey: "reactjsday-2025-pillole-4-modularization"
---

Quarta pillola dal **reactjsday 2025**: il talk di Thoughtworks sulla **modularizzazione delle app React**, raccontata attraverso il case study di una soluzione CMS con app React Native strutturata per scalare a **più di 15 team**. Il talk che, da architetto, mi ha fatto annuire più spesso — anche perché ho ritrovato molte scelte che stiamo già facendo bene, e un paio di dolori che conosco fin troppo.

#### La pillola

Cosa funziona, secondo il case study (e secondo la mia esperienza):

- **Architettura modulare** vera: la modularizzazione è un fatto di confini e ownership, **non di code splitting**. Il code splitting è un'ottimizzazione di bundle; la modularizzazione è una scelta organizzativa.
- **Code generator e template**: la struttura di un nuovo modulo non si copia-incolla da quello accanto, si genera. Coerenza gratis.
- Per il mobile, una regola preziosa: **non "cuocere" dentro l'app configurazioni e logiche che cambiano spesso**. Meglio servirle a runtime via JSON schema o remote config: ogni modifica "baked-in" significa nuova release e nuova approvazione degli store, e i cicli di rilascio mobile sono strutturalmente più lenti e rigidi del web.

I pain point, che poi sono i soliti sospetti ma fa bene sentirseli dire:

- **La documentazione conta** — la mancanza di documentazione è il debito che si paga con gli interessi più alti quando i team sono tanti.
- **Mindset**: ogni team deve fare information gathering prima di costruire, o ogni modulo reinventa la sua ruota.
- **Un Platform Team inteso come prodotto**: serve qualcuno che valuti quali enabler portano davvero un incremento di produttività a tutti i team, e non solo automazioni che piacciono a chi le scrive.
- Per la documentazione, il suggerimento pratico è [Docusaurus](https://docusaurus.io/docs/playground) — un buon esempio reale è [docs.iota.org](https://docs.iota.org/developer).

#### Il takeaway

Si scala coi confini, non coi bundle: la modularizzazione è organizzazione del lavoro travestita da architettura. E senza documentazione e un platform team che ragiona da prodotto, 15 team producono 15 ruote.

---

*Prossima pillola: il React Compiler, e soprattutto quando fallisce.*
