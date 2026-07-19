---
title: "reactjsday 2025 in pillole #5 — React Compiler: quando la magia fallisce"
description: "Il React Compiler è stabile e memoizza per te, ma non è magia nera: le regole che il tuo codice deve rispettare e gli strumenti per l'adozione incrementale"
date: 2026-07-19T10:20:00+02:00
tags: ["pillole", "reactjsday", "react", "react-compiler", "performance"]
lang: it
hidden: true
translationKey: "reactjsday-2025-pillole-5-react-compiler"
---

Quinta pillola dal **reactjsday 2025**, e questa è la mia preferita: il **React Compiler**, rilasciato stabile il **7 ottobre 2025**. Confesso: all'inizio sembrava magia anche a me. Poi, da buon pragmatico, ho capito che è qualcosa di meglio della magia: **un nuovo modo di scrivere applicazioni React, con regole precise**.

#### La pillola

Cos'è davvero il compiler: un **transpiler che applica la memoizzazione automatica dei componenti** — in pratica aggiunge per te `useMemo`, `useCallback` e `React.memo` dove servono. Il punto è che può farlo **solo se il tuo codice rispetta le Rules of React**. Altrimenti fa la cosa giusta: rinuncia (bail out) e lascia il componente non ottimizzato.

Nelle mie slide (scritte in React, con la direttiva `'use memo'` per testare il compiler in modalità annotation) ho raccolto una galleria di componenti che lo fanno fallire:

```tsx
function ItemList({ items, newItem, onAddItem }) {
  'use memo'
  const isLarge = items.length > 5
  if (isLarge) {
    // 🚩 mutazione diretta di un oggetto arrivato dalle props:
    // il compiler la vede e rinuncia a memoizzare l'intero componente
    newItem.name = 'Overbooking'
  }
  return /* ... */
}
```

Le violazioni tipiche da cercare nel proprio codice:

- **Mutare le props** o oggetti/reference mutabili durante il render
- **Side effect durante il render** (es. `document.title = ...`)
- **Hook condizionali**
- **Valori non deterministici** letti in render, come `Date.now()` o `Math.random()`
- **Dipendenze mancanti negli `useEffect`** — caso subdolo: dove la memoizzazione era diventata (per sbaglio) parte della correttezza, un cambio di memoizzazione può far scattare un effect troppo spesso o troppo poco

Il tooling per non andare alla cieca:

- [`react-compiler-healthcheck`](https://www.npmjs.com/package/react-compiler-healthcheck) per un check preliminare del progetto
- **`eslint-plugin-react-compiler`** per intercettare le violazioni in editor
- La regola `react-hooks/incompatible-library` segnala le librerie non ancora compatibili — al momento del talk, ad esempio, **TanStack Virtualizer e TanStack Table** non lo erano
- Per i progetti grandi: [adozione incrementale](https://react.dev/learn/react-compiler/incremental-adoption) con politiche di opt-in/opt-out, e [la guida ufficiale](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo) su cosa fare con gli `useMemo`/`useCallback` scritti prima del compiler

#### Il takeaway

Il React Compiler ottimizza i re-render, ma **non è magia nera**: non può impedire che nuove reference di oggetti e funzioni causino re-render dei figli, e davanti a codice che viola le regole si tira indietro in silenzio. Il compiler non vi regala performance: vi ripaga per il codice scritto bene.

---

*Ultima pillola in arrivo: useTransition e i form che non si congelano.*
