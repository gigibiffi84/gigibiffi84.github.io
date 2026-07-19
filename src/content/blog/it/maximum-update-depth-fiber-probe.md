---
title: "Maximum update depth exceeded: a caccia del colpevole nei fiber di React"
description: "Un componente in loop di re-render, uno stack trace inutile e uno script di probing che intercetta i commit dei fiber per scovare l'oggetto ricreato a ogni render"
date: 2026-07-19T19:00:00+02:00
tags: ["react", "fiber", "debugging", "hooks", "performance"]
lang: it
translationKey: "maximum-update-depth-fiber-probe"
headerImage: "/images/maximum-update-depth-fiber-probe/header.jpg"
---

A chi non è mai capitato? L'app fila liscia, tocchi un componente innocuo, e all'improvviso la console esplode:

```
Uncaught Error: Maximum update depth exceeded. This can happen when a
component repeatedly calls setState inside componentWillUpdate or
componentDidUpdate. React limits the number of nested updates to
prevent infinite loops.
```

Se sviluppi in React, questo errore lo conosci. E conosci anche la sua beffa: **ti dice il *cosa* ma non il *chi* — lo stack trace punta alle viscere di React, non al componente colpevole**. In un albero con decine di componenti, andare a intuito è un pessimo piano: commenti un pezzo di JSX, ricarichi, il loop c'è ancora, ne commenti un altro, e intanto è passata un'ora.

L'ultima volta mi sono stufato. Stufo di non capire chi fosse il colpevole, ho deciso di costruirmi qualcosa che me lo dicesse — non l'ennesimo `console.log`, ma uno strumento che guardasse il problema dal punto di vista di React.

#### L'idea: farsi passare per i DevTools

Il posto giusto dove guardare è un piano più in basso, dove lavora React davvero: i **fiber**. Ogni componente montato ha un fiber — il nodo della struttura dati interna su cui React esegue la reconciliation — e a ogni **commit** (la fase in cui le modifiche calcolate vengono applicate al DOM) React notifica i DevTools attraverso un hook globale: `window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`.

Il trucco è tutto qui: **se definiamo noi quell'oggetto prima che React si carichi, React ci consegnerà l'albero dei fiber a ogni commit**. Da lì possiamo camminarlo e contare chi sta renderizzando troppo:

```js
// fiber-probe.js — da caricare PRIMA di React
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
    // flags & 1 (PerformedWork): il componente ha renderizzato in questo commit
    if (name && fiber.flags & 1) {
      const n = (renderCounts.get(name) || 0) + 1;
      renderCounts.set(name, n);
      updated.push(name);
      if (n === LOOP_THRESHOLD) {
        console.warn(`[fiber-probe] 🔥 ${name}: ${n} render — probabile loop!`);
        sniffHookDeps(fiber, name); // vedi sotto
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

#### Il pezzo che fa la differenza: "fiutare" le deps

Contare i render ti dice *chi* è in loop, ma non *perché*. Il sospetto classico — confermato poi nel nostro caso — è **un oggetto ricreato a ogni render** finito nelle dipendenze di un hook: identico nel contenuto, sempre nuovo come reference. Così ogni fiber conserva la sua lista di hook in `memoizedState`, e confrontandola con quella del render precedente (il fiber `alternate`) si può smascherare esattamente questo pattern:

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
            `NUOVA identity ma shallow-equal → oggetto ricreato a ogni render?`);
        }
      });
    }
    hook = hook.next; prev = prev.next; i++;
  }
}
```

#### Il verdetto

Eseguito sulla riproduzione del bug (un `Dashboard` che passa una `config` a un `ResultsPanel` che si sincronizza in un layout effect), il probe ha vuotato il sacco in mezzo secondo:

```
[fiber-probe] commit #1 — re-render: Dashboard, ResultsPanel
[fiber-probe] commit #2 — re-render: Dashboard, ResultsPanel
[fiber-probe] commit #3 — re-render: Dashboard, ResultsPanel
[fiber-probe] 🔥 Dashboard: 25 render in 22ms — probabile loop!
[fiber-probe] 🔥 ResultsPanel: 25 render in 22ms — probabile loop!
[fiber-probe] 🔍 ResultsPanel — hook #1, dep[0]: NUOVA identity ma
              shallow-equal al valore precedente ({"page":1,"sort":"asc"})
              → oggetto ricreato a ogni render?
Uncaught Error: Maximum update depth exceeded.
```

Ed ecco il colpevole, **che non era il componente indicato dal loop**: `ResultsPanel` faceva tutto giusto, le sue deps erano corrette. Era il padre a ricreare `config` (e la callback `onSync`) a ogni render:

```jsx
// ✗ prima: nuova identity a ogni render del padre
const config = { page, sort };
const handleSync = () => setSyncCount((c) => c + 1);

// ✓ dopo: identity stabile finché non cambiano i valori
const config = useMemo(() => ({ page, sort }), [page, sort]);
const handleSync = useCallback(() => setSyncCount((c) => c + 1), []);
```

Due righe di fix per un pomeriggio di caccia. Come sempre.

#### Una via più moderna: `useEffectEvent`

Da React 19.2 c'è uno strumento pensato proprio per una metà di questo problema: **`useEffectEvent`**. Un *Effect Event* è una funzione dichiarata accanto all'effect ma **non reattiva**: legge sempre l'ultima versione di props e stato senza dover comparire tra le dipendenze.

Nel nostro caso la callback `onSync` non doveva far ri-scattare l'effect — stava nelle deps solo perché il linter ce la vuole. Estratta in un Effect Event, la sua identity instabile diventa innocua:

```jsx
function ResultsPanel({ config, onSync }) {
  const [rows, setRows] = useState([]);
  const syncEvent = useEffectEvent(() => onSync());

  useLayoutEffect(() => {
    setRows(computeRows(config));
    syncEvent(); // onSync sparisce dalle deps
  }, [config]);
}
```

E qui metà del loop svanisce **senza nemmeno toccare il padre**. Ma attenzione al limite, che è il punto importante: **`useEffectEvent` risolve le dipendenze-funzione, non le dipendenze-dato**. `config` deve restare reattiva — è giusto che l'effect ri-scatti quando cambia davvero — quindi se il padre continua a ricrearla a ogni render, il loop resta. Per i dati la cura è sempre la stessa: identity stabile (`useMemo`) o deps primitive (`[config.page, config.sort]`). Regola pratica: *gli eventi negli Effect Event, i dati nelle deps — con identity di cui ci si possa fidare*.

#### Bonus: perché a volte l'errore non arriva

Curiosità emersa riproducendo il caso: con `useLayoutEffect` (aggiornamenti sincroni dentro il commit) React conta gli update annidati e **lancia l'errore dopo ~50 cicli**. Con `useEffect` gli update sono asincroni, ogni giro è un task separato e il contatore non scatta mai: **niente errore, solo un'app che frigge in silenzio** — nella mia prova, 26.000 commit in pochi secondi. Se la CPU è al 100% e la UI arranca senza errori in console, il loop può esserci lo stesso: il probe lo vede comunque.

#### Se non volete scrivervi il probe

Sono onesto: lo script fatto in casa è nato per *capire* — e vi consiglio di scriverlo almeno una volta, perché non c'è modo migliore per imparare come lavora React sotto il cofano. Ma per l'uso quotidiano, o se i fiber vi sembrano ancora stregoneria, esistono strumenti maturi che fanno questo probing per voi:

- **[React DevTools Profiler](https://react.dev/learn/react-developer-tools)** — lo strumento ufficiale: registrando una sessione con l'opzione *"Record why each component rendered"* vi dice per ogni componente quante volte ha renderizzato e perché (props, state, hook).
- **[React Scan](https://github.com/aidenybai/react-scan)** — il più adatto a chi inizia: `npx react-scan@latest` e senza toccare una riga di codice **evidenzia visivamente sulla pagina** i componenti che re-renderizzano, segnalando proprio le props uguali per valore ma nuove per reference.
- **[why-did-you-render](https://github.com/welldone-software/why-did-you-render)** — la libreria storica (supporta React 19): logga in console esattamente il nostro caso, con messaggi tipo *"props.config changed, but its value is the same"*.

Sotto il cofano usano gli stessi meccanismi del nostro probe. La differenza è che ora sapete anche *come* fanno.

#### Il takeaway

Lo stack trace di `Maximum update depth exceeded` ti porta dentro React, non dentro il tuo codice: per trovare il colpevole serve guardare **chi renderizza troppo e quali dipendenze cambiano identity senza cambiare valore**. E i fiber, con `onCommitFiberRoot`, sono un'API di osservazione formidabile che React ci mette in mano gratis. Il pattern dell'oggetto ricreato a ogni render, peraltro, è lo stesso di cui parlerò a proposito del React Compiler: nemmeno lui può salvarvi dalle identity instabili. Le reference contano.
