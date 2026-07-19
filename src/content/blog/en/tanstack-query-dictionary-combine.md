---
title: "TanStack Query: caching a dictionary of query keys with combine"
description: "Caching one query key is easy — but a dynamic dictionary of keys? useQueries + combine for N independent caches consumed as a single object"
date: 2026-07-19T20:00:00+02:00
tags: ["react", "tanstack-query", "hooks", "caching", "patterns"]
lang: en
translationKey: "tanstack-query-dictionary-combine"
headerImage: "/images/tanstack-query-dictionary-combine/header.jpg"
---

TanStack Query is great: give it a query key and a fetch function, and caching is served. But sooner or later the question comes: **I can cache one query key... what if I want to cache a *dictionary* of keys?**

The concrete case is more common than it sounds. A data-entry form with three selects to populate: countries, currencies, categories. Three different data sources, three caches you want **independent** (adding a category shouldn't throw away the countries), but consumed by the form as **one object**, with one loading state. In short, I want to pass this:

```ts
const dictionaries = {
  countries: fetchCountries,
  currencies: fetchCurrencies,
  categories: fetchCategories,
}
```

and get back `{ data: { countries: [...], currencies: [...], categories: [...] }, isLoading, isReady }`.

#### The roads that don't work

The first temptation is **a single query** doing the three fetches in a `Promise.all` under one key. It works, until you need to invalidate: the cache is one monolithic block, and invalidating the categories means refetching everything. Different `staleTime` per entry? Forget it.

The second temptation is **one `useQuery` per entry**. But the dictionary is dynamic — three entries today, five tomorrow — and the Rules of Hooks forbid calling hooks in a variable-length loop. Dead end.

#### `useQueries` + `combine`

The answer is the API designed exactly for this: [`useQueries`](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) accepts an **array of queries built at runtime** (the Rules of Hooks are respected: there's only one hook), and its **`combine`** option transforms the array of results into whatever shape you want. Here's the full hook:

```tsx
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'

type Fetchers<T> = Record<string, () => Promise<T[]>>

export function useQueryDictionary<T>(fetchers: Fetchers<T>, enabled = true) {
  // Callers almost always pass a fresh object literal on every render:
  // keep the fetch functions in a ref so the queryFn references stay stable.
  const fetchersRef = useRef(fetchers)
  fetchersRef.current = fetchers

  // Recompute the list of names only when the SET of keys actually changes:
  // the string signature is a value comparison at zero cost.
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

And the usage is exactly the dream we started from:

```tsx
const { data, isReady, isLoading } = useQueryDictionary({
  countries: fetchCountries,
  currencies: fetchCurrencies,
  categories: fetchCategories,
})

if (isLoading) return <Spinner />
// data.countries, data.currencies, data.categories — each with ITS OWN cache
```

#### The three details that make the difference

**1. The ref over the fetch functions.** Whoever uses the hook passes an object literal, hence functions with a new identity on every render. If they went straight into the `queryFn`s, every render would regenerate the `queries` array. The ref absorbs the churn: the functions inside are always fresh, but the references exposed to TanStack stay stable. If this pattern rings a bell — yes, it's the same identity lesson from the [fibers and Maximum update depth piece](/en/blog/maximum-update-depth-fiber-probe/): one object recreated on every render in the wrong place, and the loop is served.

**2. The keys signature.** `Object.keys(...).sort().join('|')` is a *value* comparison disguised as a string: the `names` array (and downstream `queries` and `combine`) regenerates only when the set of entries genuinely changes, not on every render.

**3. Array query keys, not concatenated strings.** `['dictionary', 'countries']` instead of `'dictionary/countries'`. That's not pedantry: hierarchical keys enable **prefix invalidation**:

```ts
// invalidate ONLY the categories (e.g. after a create)
queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })

// invalidate the WHOLE dictionary in one shot
queryClient.invalidateQueries({ queryKey: ['dictionary'] })
```

And this is where the pattern pays off: when the user creates a new category somewhere else in the app, you invalidate that single entry and the other N-1 caches don't even notice.

#### Bonus: the cherry on top of `combine`

`combine` isn't just cosmetics. TanStack applies **structural sharing** to the combined result too: if the underlying data hasn't changed, the returned object keeps the same identity across renders — so you can pass it to memoized components or put it in an effect's deps without fear. Which closes the circle with the previous article: here, the stable identities are a gift from the library.

If you want more, targeted helpers are the natural extension — a `find(id, name?)` that looks an item up by id in one entry or across the whole dictionary comes for free once `data` is memoized.

#### The takeaway

When you need **one cache per entry but a single result**, the `useQueries` + `combine` pair is the idiomatic answer: N independent queries (granular invalidation and staleness) exposed as one stable object. And the two supporting tricks — a ref for the functions, a signature for the keys — are the same old eternal story: **in React, identities matter**, and the best patterns are the ones that keep them in check for you.
