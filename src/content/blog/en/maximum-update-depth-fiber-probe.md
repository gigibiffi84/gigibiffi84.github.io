---
title: "Maximum update depth exceeded: hunting the culprit in React's fibers"
description: "A component stuck in a re-render loop, a useless stack trace, and a probing script that hooks into fiber commits to catch the object recreated on every render"
date: 2026-07-19T19:00:00+02:00
tags: ["react", "fiber", "debugging", "hooks", "performance"]
lang: en
hidden: true
translationKey: "maximum-update-depth-fiber-probe"
headerImage: "/images/maximum-update-depth-fiber-probe/header.jpg"
---

Who hasn't been there? The app is running smoothly, you touch an innocent-looking component, and suddenly the console blows up:

```
Uncaught Error: Maximum update depth exceeded. This can happen when a
component repeatedly calls setState inside componentWillUpdate or
componentDidUpdate. React limits the number of nested updates to
prevent infinite loops.
```

If you build with React, you know this error. And you know its cruel joke too: **it tells you the *what* but not the *who* — the stack trace points into React's internals, not at the guilty component**. In a tree with dozens of components, guessing is a terrible plan: you comment out a piece of JSX, reload, the loop is still there, you comment out another one, and an hour is gone.

Last time, I'd had enough. Fed up with not knowing who the culprit was, I decided to build something that would tell me — not yet another `console.log`, but a tool that would look at the problem from React's point of view.

#### The idea: impersonate the DevTools

The right place to look is one floor down, where React actually works: the **fibers**. Every mounted component has a fiber — the node of the internal data structure React runs reconciliation on — and on every **commit** (the phase where the computed changes are applied to the DOM) React notifies the DevTools through a global hook: `window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`.

That's the whole trick: **if we define that object ourselves before React loads, React will hand us the fiber tree on every commit**. From there we can walk it and count who's rendering too much:

```js
// fiber-probe.js — must load BEFORE React
(function () {
  const renderCounts = new Map();
  let commitCount = 0;
  const LOOP_THRESHOLD = 25;

  function nameOf(fiber) {
    const t = fiber.type;
    if (typeof t === 'string') return null; // host component (div, span...)
    return (t && (t.displayName || t.name)) || null;
  }

  function walk(fiber, updated) {
    if (!fiber) return;
    const name = nameOf(fiber);
    // flags & 1 (PerformedWork): the component actually rendered in this commit
    if (name && fiber.flags & 1) {
      const n = (renderCounts.get(name) || 0) + 1;
      renderCounts.set(name, n);
      updated.push(name);
      if (n === LOOP_THRESHOLD) {
        console.warn(`[fiber-probe] 🔥 ${name}: ${n} renders — likely loop!`);
        sniffHookDeps(fiber, name); // see below
      }
    }
    walk(fiber.child, updated);
    walk(fiber.sibling, updated);
  }

  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    inject: () => 1,
    onCommitFiberUnmount() {},
    onCommitFiberRoot(id, root) {
      commitCount++;
      const updated = [];
      walk(root.current.child, updated);
      console.log(`[fiber-probe] commit #${commitCount} — re-render: ${[...new Set(updated)].join(', ')}`);
    },
  };
})();
```

#### The part that makes the difference: "sniffing" the deps

Counting renders tells you *who* is looping, not *why*. The classic suspect — later confirmed in our case — is **an object recreated on every render** that ends up in a hook's dependencies: identical in content, always new as a reference. Every fiber keeps its hook list in `memoizedState`, and by comparing it with the previous render's one (the `alternate` fiber) you can expose exactly this pattern:

```js
function sniffHookDeps(fiber, name) {
  let hook = fiber.memoizedState;
  let prev = fiber.alternate && fiber.alternate.memoizedState;
  let i = 0;
  while (hook && prev) {
    const deps = hook.memoizedState?.deps;
    const prevDeps = prev.memoizedState?.deps;
    if (Array.isArray(deps) && Array.isArray(prevDeps)) {
      deps.forEach((dep, d) => {
        if (dep !== prevDeps[d] && typeof dep === 'object' && dep !== null
            && shallowEqual(dep, prevDeps[d])) {
          console.warn(`[fiber-probe] 🔍 ${name} — hook #${i}, dep[${d}]: ` +
            `NEW identity but shallow-equal → object recreated on every render?`);
        }
      });
    }
    hook = hook.next; prev = prev.next; i++;
  }
}
```

#### The verdict

Run against a reproduction of the bug (a `Dashboard` passing a `config` down to a `ResultsPanel` that syncs itself in a layout effect), the probe spilled everything in half a second:

```
[fiber-probe] commit #1 — re-render: Dashboard, ResultsPanel
[fiber-probe] commit #2 — re-render: Dashboard, ResultsPanel
[fiber-probe] commit #3 — re-render: Dashboard, ResultsPanel
[fiber-probe] 🔥 Dashboard: 25 renders in 22ms — likely loop!
[fiber-probe] 🔥 ResultsPanel: 25 renders in 22ms — likely loop!
[fiber-probe] 🔍 ResultsPanel — hook #1, dep[0]: NEW identity but
              shallow-equal to the previous value ({"page":1,"sort":"asc"})
              → object recreated on every render?
Uncaught Error: Maximum update depth exceeded.
```

And there's the culprit — **which was not the component flagged by the loop**: `ResultsPanel` was doing everything right, its deps were correct. It was the parent recreating `config` (and the `onSync` callback) on every render:

```jsx
// ✗ before: new identity on every parent render
const config = { page, sort };
const handleSync = () => setSyncCount((c) => c + 1);

// ✓ after: stable identity until the values actually change
const config = useMemo(() => ({ page, sort }), [page, sort]);
const handleSync = useCallback(() => setSyncCount((c) => c + 1), []);
```

A two-line fix for an afternoon of hunting. As always.

#### A more modern way: `useEffectEvent`

Since React 19.2 there's a tool designed for exactly one half of this problem: **`useEffectEvent`**. An *Effect Event* is a function declared next to the effect but **non-reactive**: it always reads the latest props and state without having to appear among the dependencies.

In our case the `onSync` callback was never supposed to re-trigger the effect — it sat in the deps only because the linter demands it. Extracted into an Effect Event, its unstable identity becomes harmless:

```jsx
function ResultsPanel({ config, onSync }) {
  const [rows, setRows] = useState([]);
  const syncEvent = useEffectEvent(() => onSync());

  useLayoutEffect(() => {
    setRows(computeRows(config));
    syncEvent(); // onSync disappears from the deps
  }, [config]);
}
```

Half of the loop vanishes **without even touching the parent**. But mind the limit, which is the important part: **`useEffectEvent` solves function dependencies, not data dependencies**. `config` must stay reactive — it's right for the effect to re-run when it genuinely changes — so if the parent keeps recreating it on every render, the loop survives. For data the cure is still the same: stable identity (`useMemo`) or primitive deps (`[config.page, config.sort]`). Rule of thumb: *events go into Effect Events, data goes into the deps — with identities you can trust*.

#### Bonus: why sometimes the error never shows up

A curiosity that emerged while reproducing the case: with `useLayoutEffect` (synchronous updates inside the commit) React counts the nested updates and **throws the error after ~50 cycles**. With `useEffect` the updates are asynchronous, every iteration is a separate task and the counter never trips: **no error, just an app silently frying** — in my test, 26,000 commits in a few seconds. If the CPU is at 100% and the UI is crawling with a clean console, the loop may be there anyway: the probe sees it regardless.

#### If you don't want to write the probe yourself

Let me be honest: the homemade script was born to *understand* — and I recommend writing one at least once, because there's no better way to learn how React works under the hood. But for everyday use, or if fibers still feel like sorcery, there are mature tools that do this probing for you:

- **[React DevTools Profiler](https://react.dev/learn/react-developer-tools)** — the official tool: record a session with the *"Record why each component rendered"* option and it tells you, for every component, how many times it rendered and why (props, state, hooks).
- **[React Scan](https://github.com/aidenybai/react-scan)** — the best fit for beginners: `npx react-scan@latest` and, without touching a line of code, it **visually highlights on the page** the components that re-render, flagging exactly the props that are equal by value but new by reference.
- **[why-did-you-render](https://github.com/welldone-software/why-did-you-render)** — the veteran library (React 19 supported): it logs our exact case to the console, with messages like *"props.config changed, but its value is the same"*.

Under the hood they use the same mechanisms as our probe. The difference is that now you also know *how* they do it.

#### The takeaway

The `Maximum update depth exceeded` stack trace leads you into React, not into your code: to find the culprit you need to look at **who renders too much and which dependencies change identity without changing value**. And fibers, via `onCommitFiberRoot`, are a formidable observation API React hands you for free. The recreated-object pattern, by the way, is the same one I'll be covering when talking about the React Compiler: not even the compiler can save you from unstable identities. References matter.
