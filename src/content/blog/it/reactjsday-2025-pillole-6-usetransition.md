---
title: "reactjsday 2025 in pillole #6 — useTransition: form che non si congelano"
description: "Ultima pillola da Verona: marcare gli aggiornamenti di stato costosi come non urgenti per tenere la UI reattiva, nei form e non solo"
date: 2026-07-19T10:25:00+02:00
tags: ["pillole", "reactjsday", "react", "performance", "hooks"]
lang: it
hidden: true
translationKey: "reactjsday-2025-pillole-6-usetransition"
headerImage: "/images/reactjsday-2025-pillole-6-usetransition/header.jpg"
---

Sesta e ultima pillola dal **reactjsday 2025**: la performance dei form con **`useTransition`**. Nelle mie slide questa era anche una demo live — scrivevi in un campo di ricerca e vedevi la differenza. Il bello di fare le slide in React è anche questo.

#### La pillola

Il problema: quando un aggiornamento di stato scatena una computazione costosa — filtrare una lista enorme, un ricalcolo complesso — la UI si **congela**. L'utente digita e le lettere arrivano a scatti, perché React sta usando il main thread per il lavoro pesante alla stessa priorità dell'input.

La soluzione: separare l'urgente dal differibile. L'aggiornamento dell'input è urgente (deve rispondere subito), il ricalcolo dei risultati no. `useTransition` serve esattamente a dichiararlo:

```jsx
const [isPending, startTransition] = useTransition()

const handleChange = (value) => {
  // urgente: l'input si aggiorna subito
  setQuery(value)

  // differibile: il lavoro pesante non blocca la digitazione
  startTransition(() => {
    setResults(expensiveFilter(value))
  })
}
```

Bonus non trascurabile: `isPending` ti dà gratis lo stato di caricamento per mostrare uno spinner mentre il filtro lavora — niente stati booleani gestiti a mano.

#### Il takeaway

`startTransition` marca gli aggiornamenti di stato come **non urgenti** e mantiene la UI reattiva durante le operazioni costose. E — come è stato giustamente sottolineato al talk — vale **non solo per i form**: ovunque ci sia un aggiornamento pesante innescato da un'interazione, è un candidato.

#### Chiudendo la serie

Sei pillole, sei promemoria per il quotidiano. Se dovessi comprimerle in quattro righe, sarebbero i takeaway con cui ho chiuso le mie slide: ogni stato nel suo scope e ogni componente col suo ruolo; quality gate a ogni livello della pipeline (con metriche, non sensazioni); occhio alle reference degli oggetti, perché nemmeno il React Compiler vi salva da quelle; e transition per gli aggiornamenti pesanti, non solo nei form.

I talk completi sono su YouTube — [Track 1](https://youtube.com/live/Bnj3D03Qzqc) e [Track 2](https://youtube.com/live/x9fvrjg0f-g) — e qui trovate [gli speaker](https://www.reactjsday.it/speakers/). Se eravate a Verona e volete confrontarvi su uno di questi temi, sapete dove trovarmi.
