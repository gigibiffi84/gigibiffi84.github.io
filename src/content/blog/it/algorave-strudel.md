---
title: "Algorave: come ho insegnato a Claude a suonare la trance"
description: "Cos'è un algorave, com'è nato e come lo uso io: live coding con Strudel, una skill di Claude Code e il MIDI via IAC Driver verso Logic Pro e GarageBand"
date: 2026-10-18T19:11:00+02:00
tags: ["algorave", "strudel", "musica", "live-coding", "midi", "agenti"]
lang: it
translationKey: "algorave-strudel"
headerImage: "/images/algorave-strudel/header.jpg"
---

Lo sapevate che sono uno sviluppatore software, ma il mio hobby più amato è suonare? Ecco, ora lo sapete. Per anni le due cose hanno vissuto in stanze separate: di giorno il codice, la sera la musica, e guai a mescolarle. Poi ho scoperto che esiste un modo per farle incontrare senza che una delle due si offenda, e ha un nome che sembra uscito da un volantino del 1996: **algorave**.

#### Cos'è un algorave

Un algorave è una festa in cui la musica viene scritta dal vivo, in codice, davanti a tutti. Il codice proiettato sul muro, le casse a palla, gente che balla su un `for` loop. Detto così sembra una riunione di sprint con le luci basse. Invece funziona, e io ci sono cascato con tutte le scarpe.

La definizione ufficiale su [algorave.com](https://algorave.com/about/) è una presa in giro della legge inglese che vietava i rave definendoli musica a "beat ripetitivi":

> Sounds wholly or predominantly characterised by the emission of a succession of repetitive conditionals.

Condizionali ripetitivi. **Finalmente qualcuno ha descritto il mio codice in modo lusinghiero.**

La regola d'oro è una sola: chi suona **mostra lo schermo**. Niente laptop chiuso con la mela accesa e il dubbio che stia controllando la posta. Il processo si vede, si legge, si giudica. Le [linee guida](https://github.com/Algorave/guidelines) aggiungono il resto: niente headliner, porte aperte a chiunque, sale piccole e buie, un proiettore ad alto contrasto e un po' di fumo. E una frase che mi è rimasta in testa: chi fa algorave non finge che il software sia creativo, **si prende la responsabilità della musica che fa**. Tenetela a mente, perché tra poco entra in scena un'AI.

#### Com'è nato

L'idea di suonare scrivendo codice dal vivo è più vecchia del nome. Nel 2004 nasce [TOPLAP](https://toplap.org/), la comunità del live coding, con un manifesto che chiede proprio questo: lo schermo di chi suona deve essere visibile al pubblico. Show us your screens.

Il nome arriva nel 2011: Alex McLean e Nick Collins stanno andando a un concerto, in macchina passa una radio pirata happy hardcore, e da lì esce "algorave". Il primo evento dichiarato è del 2012, a Londra, come warm-up del SuperCollider Symposium. Dieci anni dopo la comunità festeggiava il compleanno in streaming con più di trecento eventi alle spalle, in giro per il mondo.

Mi piace che non si presenti come "il futuro della musica dance". Si mette in fila dietro una storia lunga, quella dei rave, e non pretende di sostituirla.

#### Strudel: TidalCycles nel browser

Lo strumento che uso si chiama [Strudel](https://strudel.cc/workshop/getting-started/): il porting JavaScript di TidalCycles, gira nel browser, zero installazioni. Scrivi un pattern, premi Ctrl+Enter, e la cassa parte:

```js
setcpm(137 / 4)                    // un ciclo = una battuta

const kick = s("bd*4").bank("RolandTR909")
const clap = s("~ cp ~ cp").gain(0.55)

$: stack(kick, clap)
```

Con `setcpm(BPM/4)` un ciclo diventa una battuta, e la matematica in testa diventa banale: `"<a b>/2"` è un accordo ogni due battute. La casualità poi è "seminata" sul ciclo: la battuta 37 tira sempre gli stessi dadi. **Un riff casuale ma ripetibile sul palco è esattamente il tipo di contraddizione che piace a noi sviluppatori.**

#### Dal browser a Logic Pro con l'IAC Driver

I synth di Strudel sono simpatici, ma io a casa ho Logic Pro, e i suoni che conosco stanno lì. Il ponte è un pezzo di macOS che quasi nessuno apre: l'**IAC Driver**, un cavo MIDI virtuale che collega due programmi sullo stesso Mac.

Si accende in due minuti:

1. **Configurazione MIDI Audio** → Finestra → Mostra Studio MIDI (Cmd+2).
2. Doppio clic su **Driver IAC**, spunta "Il dispositivo è online", controlla che esista almeno il Bus 1.
3. Apri Strudel in **Chrome**: il Web MIDI c'è solo lì, Safari non lo supporta. Accetta il permesso MIDI.
4. Lancia una volta `.midi()` senza argomenti e copia il nome della porta che stampa la console. Su macOS in italiano è `Driver IAC Bus 1`, in inglese `IAC Driver Bus 1`: indovinarlo a memoria è il modo più rapido per non sentire niente.

Da lì la traccia ha un interruttore. Una costante decide se ogni parte suona coi synth di Strudel o esce come MIDI su un canale fisso:

```js
const LOGIC = true               // true = MIDI verso Logic, false = synth di Strudel
const PORT  = 'Driver IAC Bus 1'

const out = (pat, ch, synth) => LOGIC ? pat.midi(PORT).midichan(ch) : synth(pat)

const bass = out(
  n("[~ 0 ~ [0 0]]*2").scale("E1:minor"),
  1,                                      // canale 1 = basso
  p => p.s("sawtooth").lpf(330)
)
```

In Logic ogni parte ha la sua traccia Software Instrument, con **MIDI In Port** sull'IAC e **MIDI In Channel** sul canale giusto: basso sull'1, pad sul 3, lead sul 5, arpeggio sul 6, batteria sul 10 con Drum Machine Designer che legge le note General MIDI (36 cassa, 38 rullante, 42 charleston). Armi tutte le tracce, premi R, e **Logic registra quello che Strudel sta suonando**, parte per parte, pronto da editare come se l'avessi suonato su una tastiera.

Con GarageBand il trucco funziona lo stesso, con meno lusso: GarageBand ascolta l'IAC senza configurazioni, ma suona tutto quello che arriva sulla traccia selezionata, senza smistare per canale. Per una parte alla volta, o per far sentire un riff con un pianoforte vero invece che con un'onda a dente di sega, basta e avanza.

Gli effetti che esistono solo in Strudel, come rumori, riser e droni, restano nel browser: non sono MIDI. Quindi in pratica suonano tutti e due insieme, Logic per gli strumenti e Strudel per l'aria attorno.

#### Una skill invece di mille prompt

Dopo qualche traccia mi sono accorto che stavo rispiegando a Claude sempre le stesse cose. Così ho fatto quello che ormai faccio con ogni lavoro ripetitivo (era successo anche con la [migrazione a TanStack Table v9](/blog/migrare-tanstack-table-v9/)): ho scritto una skill di Claude Code, `strudel-algorave`.

Dentro ci sono una traccia di esempio completa, la checklist dell'IAC Driver, la mappa dei canali per Logic, e qualche regola che per me non è negoziabile:

- **La cassa e la melodia principale sono deterministiche.** Sono l'ancora e l'identità del pezzo. Tutto il resto può variare, ma solo scegliendo tra note nella tonalità e sulla griglia: casualità sì, stonature no.
- **Si scrive musica originale.** Se chiedi una canzone famosa, ottieni un pezzo nuovo *nello spirito* di quella.
- **Ogni traccia finisce con `._pianoroll()`**, così sul proiettore il pubblico vede le note nascere. Show us your screens, appunto.
- **Lo stesso file serve due palchi:** in modalità auto suona l'arrangiamento dall'inizio alla fine, in modalità live suona una sezione alla volta e salto alla successiva con Ctrl+Enter, senza fermare il tempo.

Ecco dove torna la frase sulla responsabilità: **le regole della skill sono il punto in cui decido io**. L'AI scrive i pattern, ma l'identità del pezzo, i vincoli e la scelta di cosa suona restano miei. È lo stesso principio del [loop engineering](/blog/loop-engineering/): non è l'agente a diventare più bravo, è il contesto attorno a lui.

#### "Fammi il pezzo di Fable"

La prima richiesta alla skill nuova è stata, lo confesso, poco originale: "generami una traccia basata su *Fable*". Robert Miles, metà anni Novanta, pianoforte, archi, il breakdown lunghissimo. Chi c'era sa.

La skill ha fatto quello che le avevo chiesto di fare, cioè non quello che le stavo chiedendo: niente cover, ma un pezzo originale di dream trance in quello spirito. Si chiama **Paper Lanterns**: Mi minore, 137 BPM, Em–C–D–Bm, 160 battute tra intro, due drop e un breakdown di 32 battute in cui restano solo piano, archi e arpeggio. Il cuore è la melodia del piano, otto battute scritte a mano e bloccate:

```js
const MELODY = `<
  [b4 ~ e5 ~ g5 ~ f#5 e5]   [~ b4 ~ ~ d5 ~ e5 ~]
  [e5 ~ g5 ~ c6 ~ b5 g5]    [~ e5 ~ ~ g5 ~ ~ ~]
  [f#5 ~ a5 ~ d6 ~ a5 f#5]  [~ e5 ~ ~ f#5 ~ a5 ~]
  [b5 ~ a5 f#5 ~ d5 ~ f#5]  [e5 ~ ~ ~ ~ ~ ~ ~]
>`
```

Attorno, tutto il resto respira: l'arpeggio pesca note a caso tra quelle dell'accordo, i filtri degli archi si aprono e si chiudono lentamente, il charleston perde qualche colpo qua e là. Ogni esecuzione è un po' diversa, ma la melodia è sempre quella. Sul canale 5 arriva a un pianoforte di Logic, e lì, lo ammetto, mi sono commosso un pochino.

#### Il takeaway

Il codice e la musica non erano poi così lontani: un pattern è un loop, un arrangiamento è una lista di sezioni, un groove è una funzione del tempo. L'algorave mi ha dato la scusa per smettere di tenerli in stanze separate, Strudel il linguaggio, l'IAC Driver il cavo per portare tutto nei suoni che conosco, e Claude un compagno di sala prove che non si stanca mai di rifare il breakdown.

Prossimo passo: portare Paper Lanterns davanti a qualcuno che balla. Con lo schermo bene in vista.
