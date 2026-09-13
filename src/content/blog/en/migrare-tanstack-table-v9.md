---
title: "Migrating TanStack Table from v8 to v9 without a rewrite"
description: "Invariants before the diff, a vitest bench prototype on 25k rows and a skill for the repetitive work: how I moved a data grid from v8 to v9"
date: 2026-09-13T18:13:42+02:00
tags: ["react", "tanstack", "migration", "performance", "agents"]
lang: en
translationKey: "migrare-tanstack-table-v9"
headerImage: "/images/migrare-tanstack-table-v9/header.jpg"
---

There's a precise moment when a major version stops being news and becomes your problem: when the library that just shipped it is the one holding up the most used screen in your product. For me that was TanStack Table v9, and underneath it sat a metadata-driven data grid of sixteen hundred lines feeding practically every list in the application.

The temptation, in these situations, is always the same: wait. **Waiting, though, isn't a decision — it's a way of not making one.** So I did what I do every time a migration looks too big: instead of starting from the diff, I started from the invariants.

#### Invariants first, diff later

An invariant, here, is something my code takes for granted and the library might stop guaranteeing. Not "which files do I change", but "what am I leaning on without knowing it".

Taking stock of v8 took half an hour and produced a short, unpleasantly clear list: four places calling `useReactTable`, six row models in use (core, filtered, sorted, paginated, faceted, expanded), `flexRender` scattered across five spots, `columnSizingInfo` in seven, `columnPinning` in two. And three reads of `table.getState()`.

Three. Across sixteen hundred lines. They look like nothing, and that's exactly why they were the problem: **the dangerous invariants aren't the ones that show up everywhere, they're the ones sitting in a single place and holding up all the rest.**

A detail that turned out to matter: my library already had a type of its own called `DataTableFeatures`, and v9 introduces the concept of `features` with a completely different meaning. Two identical words in the same file meaning distant things. I caught it before writing any code, and only because I was looking at invariants instead of files.

#### Intent: the library ships its own instructions

For the second half of the job — the invariants of v9, not of v8 — I leaned on [TanStack Intent](https://tanstack.com/intent/latest). It's worth explaining what it is, because the name doesn't help.

Intent **is not a migration tool**. It's the mechanism by which a package ships, alongside its code, instructions written to be read by an agent. The tagline is clearer than the documentation: *"Your dependency can ship the knowledge required to use it"*. The flow is scan → allow → inspect → load: the agent discovers the skills declared by packages, you decide which ones to authorize, the sources stay inspectable, and they get loaded only when needed.

The interesting part is that TanStack publishes in its own repo a skill called `migrate-v8-to-v9`. Which means the migration was explained to me by the library itself, versioned together with the code, instead of by a Stack Overflow post from 2024 referring to a beta. If you know how badly migration documentation ages, you'll understand why that made an impression.

It's the same shift in posture I wrote about regarding [loop engineering](/en/blog/loop-engineering/): it isn't the agent getting better, it's the context around it getting better.

#### A prototype is mostly there to let you say no

Before touching the real code I built a prototype. Not to see "whether it can be done" — that much was known — but to answer the one question that could have stopped everything: **is v9 genuinely faster, or am I redoing the work for the sake of a bigger number?**

Benchmarks with `vitest bench`, twenty-five thousand rows, the scenarios that actually hurt: sorting, filtering, selection. v9 did come out faster than v8. Had it gone the other way I'd have closed the prototype and stayed on v8 without regrets, and that's the point of a prototype: **it exists to earn you the right to say no with numbers in hand, not to confirm what you'd already decided.**

The reason for the gain, though, is the part that really matters. In v8 table state is a single snapshot: anything reading that snapshot depended on *everything*, so changing one selected row could re-render components that had nothing to do with selection. In v9 each slice — pagination, selection, sizing, filters — has its own reactive atom. A cell calling `row.getIsSelected()` depends on the selection atom and nothing else.

This isn't a micro-optimization: it's a change of model. And it explains why the gain shows up exactly where it hurts, on large tables.

#### useLegacyTable is a bridge, not a destination

v9 offers you `useLegacyTable`, exported from `@tanstack/react-table/legacy`: it accepts the v8-style API while running on the v9 engine. I used it, and I'd use it again.

But let's be clear about what it is: **deprecated from day one, and explicitly a bridge.** The official documentation says so outright — it is not to be treated as the destination. It's there to keep the application alive and green while you move the pieces one at a time, not to dodge the migration by dressing it up as a dependency bump.

This is where the wrapper saved me. With the table already encapsulated behind a component of mine, the contact points with the TanStack API were four, not four hundred. **The value of an abstraction isn't measured when you write it, it's measured the day the library underneath changes its API.** That day had come.

#### The real invariant: `getState()`

Strip away the mechanical renames — `useReactTable` becomes `useTable`, row models move from options to slots registered through `tableFeatures()`, pinning goes from physical `left`/`right` to logical `start`/`end` — and what's left is the one thing that genuinely changes how you write the component: state access.

In v8 it was a single line:

```tsx
const { sorting, pagination } = table.getState()
```

In v9 that line no longer has one replacement, it has three, and **choosing which one is a design decision, not a substitution**: `table.state` for the broad v8-style read, `table.store.state` for the aggregated store, `table.atoms.<slice>.get()` for a single slice. And if you need fine-grained reactivity, the subscription point moves next to whoever consumes the data:

```tsx
const table = useTable(options, () => null)

<table.Subscribe selector={state => state.pagination}>
  {pagination => <span>Page {pagination.pageIndex + 1}</span>}
</table.Subscribe>
```

Where state instead has to live outside the table — in my case selection, which other parts of the page need to read and write — you pass an external atom created with `createAtom` from `@tanstack/store` and hand it to the table through the `atoms` option. With one detail worth remembering, because it's the kind of thing you discover late and badly: **an external atom takes precedence over the controlled slice, and `table.reset()` does not reset it.** State you own stays yours, with everything that follows from that.

The global `onStateChange` goes away too: in its place, per-slice callbacks (`onSortingChange`, `onPaginationChange`) or `table.store.subscribe()` if you really need to listen to everything.

#### Let the machine do the repetitive work

At that point the picture was clear and the remaining work was the worst kind there is: many spots, each trivial, none of them safe to get wrong. Exactly the profile of what shouldn't be done by hand.

So I wrote a skill with a single job: **move every table state access onto the new APIs.** Not "migrate the table" — too vague to be verifiable — but one transformation repeated, with a clear rule on which of the three replacements to use case by case.

It's the same logic behind the skill I wrote for [this blog](/en/blog/loop-engineering/): the creative part stays mine, the mechanical and boring part becomes a procedure written once and applied the same way every time. With the advantage that a written procedure can be re-read, corrected and re-run — which is more than you can say for an afternoon's worth of patience.

#### The takeaway

If I had to reduce all of it to one thing: **the migration didn't start when I changed the first line, it started when I stopped looking at files and began listing invariants.** Four call sites and three `getState()` are an afternoon's work; those same four call sites found by accident, while the build is red, are a week.

The rest follows: Intent so the library explains the migration instead of the internet, a benchmarked prototype to earn the right to say no, `useLegacyTable` so nothing goes dark while I move things, a skill for the part that doesn't deserve human attention.

Complicating is easy, simplifying is hard. In migrations too — in migrations especially.
