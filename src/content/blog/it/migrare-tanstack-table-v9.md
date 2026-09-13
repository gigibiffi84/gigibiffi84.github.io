---
title: "Migrare TanStack Table da v8 a v9 senza riscrivere tutto"
description: "Invarianti prima del diff, un prototipo con vitest bench su 25k righe e una skill per il lavoro ripetitivo: come ho portato una data grid da v8 a v9"
date: 2026-09-13T18:13:42+02:00
tags: ["react", "tanstack", "migrazione", "performance", "agenti"]
lang: it
translationKey: "migrare-tanstack-table-v9"
headerImage: "/images/migrare-tanstack-table-v9/header.jpg"
---

C'è un momento preciso in cui una major version smette di essere una notizia e diventa un problema tuo: quando la libreria che ti ha aggiornato è quella su cui poggia la schermata più usata del prodotto. Per me è stata TanStack Table v9, e sotto c'era una data grid metadata-driven da milleseicento righe che alimenta praticamente ogni lista dell'applicazione.

La tentazione, in questi casi, è sempre la stessa: aspettare. **Aspettare però non è una decisione, è un modo per non prenderla.** Così ho fatto la cosa che faccio ogni volta che una migrazione mi sembra troppo grande: invece di partire dal diff, sono partito dalle invarianti.

#### Prima le invarianti, poi il diff

Un'invariante, qui, è una cosa che il mio codice dà per scontata e che la libreria potrebbe smettere di garantirmi. Non "quali file cambio", ma "su cosa mi sto appoggiando senza saperlo".

Il censimento della v8 è durato mezz'ora e ha prodotto una lista corta e sgradevolmente chiara: quattro punti in cui chiamavo `useReactTable`, sei row model in uso (core, filtered, sorted, paginated, faceted, expanded), `flexRender` sparso in cinque posti, `columnSizingInfo` in sette, `columnPinning` in due. E tre accessi a `table.getState()`.

Tre. Su milleseicento righe. Sembrano niente, ed è esattamente per questo che erano il problema: **gli invarianti pericolosi non sono quelli che ricorrono ovunque, sono quelli che stanno in un punto solo e reggono tutto il resto.**

Una nota di colore che poi si è rivelata utile: la mia libreria aveva già un tipo suo che si chiama `DataTableFeatures`, e la v9 introduce il concetto di `features` con un significato completamente diverso. Due parole identiche nello stesso file che vogliono dire cose distanti. Me ne sono accorto prima di scrivere codice, e solo perché stavo guardando le invarianti invece che i file.

#### Intent: la libreria che ti spedisce le istruzioni

Per la seconda metà del lavoro — le invarianti della v9, non della v8 — mi sono appoggiato a [TanStack Intent](https://tanstack.com/intent/latest). Vale la pena spiegare cos'è, perché il nome non aiuta.

Intent **non è un tool di migrazione**. È il meccanismo con cui un pacchetto spedisce, insieme al codice, le istruzioni scritte per essere lette da un agente. Il motto è più chiaro della documentazione: *"Your dependency can ship the knowledge required to use it"*. Il flusso è scan → allow → inspect → load: l'agente scopre le skill dichiarate dai pacchetti, tu decidi quali autorizzare, le sorgenti restano ispezionabili, e vengono caricate solo quando servono.

La parte interessante è che TanStack pubblica nel proprio repo una skill che si chiama `migrate-v8-to-v9`. Cioè: la migrazione me l'ha raccontata la libreria stessa, versionata insieme al codice, invece che un post su Stack Overflow del 2024 riferito a una beta. Se avete presente quanto invecchia male la documentazione di migrazione, capite perché la cosa mi ha fatto un certo effetto.

È lo stesso spostamento di postura di cui parlavo a proposito del [loop engineering](/blog/loop-engineering/): non è l'agente a diventare più bravo, è il contesto attorno a lui a diventare migliore.

#### Il prototipo serve soprattutto a dire di no

Prima di toccare il codice vero ho costruito un prototipo. Non per vedere "se si può fare" — quello si sapeva — ma per rispondere all'unica domanda che avrebbe potuto fermare tutto: **la v9 è davvero più veloce, o sto rifacendo il lavoro per il gusto del numero più alto?**

Benchmark con `vitest bench`, venticinquemila righe, gli scenari che mi facevano male davvero: sort, filtro, selezione. La v9 è risultata effettivamente più veloce della v8. Se fosse andata al contrario avrei chiuso il prototipo e sarei rimasto sulla v8 senza rimpianti, ed è questo il punto di un prototipo: **serve a poterti permettere di dire di no con dei numeri in mano, non a confermare quello che avevi già deciso.**

Il perché del guadagno, però, è la parte che vale davvero. In v8 lo stato della tabella è uno snapshot unico: qualunque cosa leggesse quello snapshot dipendeva da *tutto*, quindi cambiare una riga selezionata poteva far ridisegnare componenti che con la selezione non c'entravano niente. In v9 ogni slice — paginazione, selezione, sizing, filtri — ha il suo atom reattivo. Una cella che chiama `row.getIsSelected()` dipende dall'atom della selezione e basta.

Non è una micro-ottimizzazione: è un cambio di modello. E spiega perché il guadagno si vede proprio dove fa male, cioè sulle tabelle grandi.

#### useLegacyTable è un ponte, non una destinazione

La v9 ti offre `useLegacyTable`, esportato da `@tanstack/react-table/legacy`: accetta l'API in stile v8 girando su motore v9. L'ho usato, e lo rifarei.

Ma va detto com'è: **è deprecato in partenza, ed è dichiaratamente un ponte.** La documentazione ufficiale è esplicita — non va trattato come destinazione. Serve a tenere l'applicazione viva e verde mentre sposti i pezzi uno alla volta, non a evitare la migrazione travestendola da upgrade di dipendenza.

Qui il wrapper mi ha salvato. Avendo la tabella già incapsulata dietro un mio componente, i punti di contatto con l'API di TanStack erano quattro e non quattrocento. **Il valore di un'astrazione non si misura quando la scrivi, si misura il giorno in cui la libreria sotto cambia API.** Quel giorno era arrivato.

#### L'invariante vera: `getState()`

Tolti i rinomini meccanici — `useReactTable` diventa `useTable`, i row model passano da opzioni a slot registrati con `tableFeatures()`, il pinning passa dal fisico `left`/`right` al logico `start`/`end` — resta l'unica cosa che cambia davvero il modo in cui scrivi il componente: l'accesso allo stato.

In v8 era una riga sola:

```tsx
const { sorting, pagination } = table.getState()
```

In v9 quella riga non ha più un solo sostituto, ne ha tre, e **scegliere quale è una decisione di design, non una sostituzione**: `table.state` per la lettura larga in stile v8, `table.store.state` per lo store aggregato, `table.atoms.<slice>.get()` per il singolo slice. E se ti serve la reattività fine, il punto di sottoscrizione si sposta vicino a chi consuma il dato:

```tsx
const table = useTable(options, () => null)

<table.Subscribe selector={state => state.pagination}>
  {pagination => <span>Pagina {pagination.pageIndex + 1}</span>}
</table.Subscribe>
```

Dove invece lo stato deve vivere fuori dalla tabella — nel mio caso la selezione, che altri pezzi di pagina devono leggere e scrivere — si passa un atom esterno creato con `createAtom` di `@tanstack/store` e lo si consegna alla tabella tramite l'opzione `atoms`. Con un dettaglio da tenere a mente, perché è il genere di cosa che si scopre tardi e male: **un atom esterno ha la precedenza sullo slice controllato, e `table.reset()` non lo resetta.** Lo stato che possiedi tu resta tuo, con tutto quello che ne consegue.

Anche `onStateChange` globale sparisce: al suo posto le callback per slice (`onSortingChange`, `onPaginationChange`) oppure `table.store.subscribe()` se davvero ti serve ascoltare tutto.

#### Il lavoro ripetitivo lo fa la macchina

A quel punto il quadro era chiaro e il lavoro rimasto era il peggiore che esista: tanti punti, ognuno banale, tutti da non sbagliare. Esattamente il profilo di cosa non va fatto a mano.

Così ho scritto una skill il cui compito è uno solo: **portare tutti gli accessi allo stato della tabella sulle nuove API.** Non "migra la tabella" — troppo vago per essere verificabile — ma un'unica trasformazione ripetuta, con una regola chiara su quale dei tre sostituti usare caso per caso.

È la stessa logica della skill che ho scritto per [questo blog](/blog/loop-engineering/): la parte creativa resta mia, la parte meccanica e noiosa diventa una procedura scritta una volta e applicata sempre allo stesso modo. Con il vantaggio che una procedura scritta la puoi rileggere, correggere e rieseguire — cosa che con la pazienza di un pomeriggio non funziona.

#### Il takeaway

Se dovessi ridurre tutto a una cosa sola: **la migrazione non è iniziata quando ho cambiato la prima riga, è iniziata quando ho smesso di guardare i file e ho cominciato a elencare le invarianti.** Quattro call site e tre `getState()` sono un pomeriggio di lavoro; gli stessi quattro call site trovati a caso, mentre la build è rossa, sono una settimana.

Il resto è conseguenza: Intent per farmi raccontare la migrazione dalla libreria invece che da internet, un prototipo con benchmark per avere il diritto di dire di no, `useLegacyTable` per non spegnere niente mentre sposto, una skill per la parte che non merita attenzione umana.

Complicare è facile, semplificare è difficile. Anche nelle migrazioni, soprattutto nelle migrazioni.
