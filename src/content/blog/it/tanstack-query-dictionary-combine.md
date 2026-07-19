---
title: "TanStack Query: cachare un dizionario di query key con combine"
description: "Cachare una query key è facile, ma un dizionario dinamico di key? useQueries + combine per N cache indipendenti consumate come un oggetto solo"
date: 2026-07-19T20:00:00+02:00
tags: ["react", "tanstack-query", "hooks", "caching", "patterns"]
lang: it
translationKey: "tanstack-query-dictionary-combine"
headerImage: "/images/tanstack-query-dictionary-combine/header.jpg"
---

Bello TanStack Query: dai una query key, una fetch function, e la cache è servita. Ma prima o poi arriva la domanda: **posso cachare una query key... e se voglio cachare un *dizionario* di key?**

Il caso concreto è più comune di quanto sembri. Un form di anagrafica con tre select da popolare: nazioni, valute, categorie. Tre sorgenti dati diverse, tre cache che vorresti **indipendenti** (se si aggiungono le categorie non voglio ributtare giù le nazioni), ma consumate dal form come **un oggetto solo**, con un solo stato di caricamento. In pratica voglio passare questo:

```ts
const dictionaries = {
  countries: fetchCountries,
  currencies: fetchCurrencies,
  categories: fetchCategories,
}
```

e ricevere indietro `{ data: { countries: [...], currencies: [...], categories: [...] }, isLoading, isReady }`.

#### Le strade che non funzionano

La prima tentazione è **una query unica** che fa le tre fetch in un `Promise.all` sotto un'unica key. Funziona, finché non devi invalidare: la cache è un blocco monolitico, invalidare le categorie significa rifetchare tutto. E addio `staleTime` differenziati.

La seconda tentazione è **un `useQuery` per voce**. Ma il dizionario è dinamico — oggi tre voci, domani cinque — e le Rules of Hooks vietano di chiamare hook in un ciclo di lunghezza variabile. Vicolo cieco.

#### `useQueries` + `combine`

La risposta è nell'API pensata esattamente per questo: [`useQueries`](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) accetta un **array di query costruito a runtime** (le Rules of Hooks sono rispettate: l'hook è uno solo), e la sua opzione **`combine`** trasforma l'array di risultati nella forma che vuoi tu. Ecco il hook completo:

```tsx
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'

type Fetchers<T> = Record<string, () => Promise<T[]>>

export function useQueryDictionary<T>(fetchers: Fetchers<T>, enabled = true) {
  // I chiamanti passano quasi sempre un object literal nuovo a ogni render:
  // teniamo le fetch function in un ref, così le queryFn restano stabili.
  const fetchersRef = useRef(fetchers)
  fetchersRef.current = fetchers

  // Ricalcoliamo l'elenco dei nomi solo quando cambia DAVVERO l'insieme
  // delle chiavi: la firma stringa è un confronto per valore a costo zero.
  const signature = Object.keys(fetchers).sort().join('|')
  const names = useMemo(() => (signature ? signature.split('|') : []), [signature])

  const queries = useMemo(
    () =>
      names.map((name) => ({
        queryKey: ['dictionary', name],
        queryFn: () => fetchersRef.current[name](),
        enabled,
        staleTime: 5 * 60_000,
      })),
    [names, enabled]
  )

  const combine = useCallback(
    (results: UseQueryResult<T[]>[]) => ({
      data: Object.fromEntries(
        names.map((name, i) => [name, results[i]?.data ?? []])
      ) as Record<string, T[]>,
      isReady: results.every((r) => r.isSuccess),
      isLoading: results.some((r) => r.isLoading),
      isFetching: results.some((r) => r.isFetching),
      isError: results.some((r) => r.isError),
    }),
    [names]
  )

  return useQueries({ queries, combine })
}
```

E l'uso è esattamente il sogno di partenza:

```tsx
const { data, isReady, isLoading } = useQueryDictionary({
  countries: fetchCountries,
  currencies: fetchCurrencies,
  categories: fetchCategories,
})

if (isLoading) return <Spinner />
// data.countries, data.currencies, data.categories — ognuna con la SUA cache
```

#### I tre dettagli che fanno la differenza

**1. Il ref sulle fetch function.** Chi usa il hook passa un object literal, quindi funzioni con identity nuova a ogni render. Se finissero direttamente nelle `queryFn`, ogni render rigenererebbe l'array `queries`. Il ref assorbe il churn: le funzioni dentro sono sempre fresche, ma le reference esposte a TanStack restano stabili. Se questo pattern vi ricorda qualcosa, sì: è la stessa lezione sulle identity del [pezzo sui fiber e il Maximum update depth](/blog/maximum-update-depth-fiber-probe/) — un oggetto ricreato a ogni render nel posto sbagliato e il loop è servito.

**2. La firma delle chiavi.** `Object.keys(...).sort().join('|')` è un confronto *per valore* travestito da stringa: l'array `names` (e a cascata `queries` e `combine`) si rigenera solo quando l'insieme delle voci cambia davvero, non a ogni render.

**3. Query key ad array, non stringhe concatenate.** `['dictionary', 'countries']` invece di `'dictionary/countries'`. Non è pignoleria: le key gerarchiche abilitano l'**invalidazione per prefisso**:

```ts
// invalida SOLO le categorie (es. dopo una create)
queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })

// invalida TUTTO il dizionario in un colpo
queryClient.invalidateQueries({ queryKey: ['dictionary'] })
```

Ed è qui che il pattern ripaga: quando l'utente crea una nuova categoria da un'altra parte dell'app, invalidate quella voce sola e le altre N-1 cache non se ne accorgono nemmeno.

#### Bonus: la ciliegina di `combine`

`combine` non è solo cosmesi. TanStack applica lo **structural sharing** anche al risultato combinato: se i dati sottostanti non cambiano, l'oggetto restituito mantiene la stessa identity tra un render e l'altro — quindi potete passarlo a componenti memoizzati o metterlo nelle deps di un effect senza paura. Il cerchio con l'articolo precedente si chiude: qui le identity stabili ve le regala la libreria.

Volendo si arricchisce con helper mirati — un `find(id, name?)` che cerca un elemento per id in una voce o in tutto il dizionario è la naturale estensione, e con `data` memoizzato viene gratis.

#### Il takeaway

Quando vi serve **una cache per voce ma un risultato solo**, la coppia `useQueries` + `combine` è la risposta idiomatica: N query indipendenti (invalidazione e staleness granulari) esposte come un unico oggetto stabile. E i due trucchi di contorno — ref per le funzioni, firma per le chiavi — sono la solita, eterna storia: **in React le identity contano**, e i pattern migliori sono quelli che le tengono a bada per voi.
