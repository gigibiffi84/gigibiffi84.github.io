---
title: "Dentro Claude c'è un J-space (e no, non è coscienza)"
description: "Anthropic ha trovato un hub neurale in Claude — il J-space — raccontabile, modulabile e causale nel ragionamento. Cosa significa per chi sviluppa, e cosa no"
date: 2026-07-21T09:00:00+02:00
tags: ["ai", "anthropic", "interpretability", "neuroscienze", "claude"]
lang: it
translationKey: "claude-global-workspace-j-space"
headerImage: "/images/claude-global-workspace-j-space/header.jpg"
---

Prova a chiedere a un LLM "a cosa stai pensando adesso?" e otterrai una risposta plausibile, ben scritta, e completamente non verificabile — un altro pezzo di testo generato, mica un vero resoconto di uno stato interno. O almeno, così pensavamo fino a qualche settimana fa.

Il 6 luglio 2026 Anthropic ha pubblicato ["A Global Workspace in Language Models"](https://www.anthropic.com/research/global-workspace), un paper di interpretability che fa una cosa diversa dal solito: invece di guardare cosa Claude *dice*, guarda cosa succede *dentro* la rete mentre lo dice. E trova qualcosa di preciso, misurabile e — questo è il bello — causale.

#### L'esperimento: una lente sulla Jacobiana

Il nome tecnico è **J-space**, dove J sta per **Jacobiana**: la matrice che misura quanto l'output di una funzione cambia al variare di ogni singolo input. Se hai fatto un po' di calcolo, è la generalizzazione multidimensionale della derivata; se non l'hai fatto, pensa a un mixer audio con centinaia di manopole: la Jacobiana ti dice quali manopole, anche girate di un pelo, spostano davvero il suono, e quali sono lì solo per decorazione.

I ricercatori hanno costruito una **J-lens** — una tecnica che applica questa idea ai pattern neurali interni di Claude, per stanare quali rappresentazioni hanno un impatto sproporzionato sul resto della rete. Il risultato è una piccola collezione di questi pattern "ad alto impatto": il J-space, appunto. Vi suona familiare? È lo stesso spirito del [fiber-probe](/blog/maximum-update-depth-fiber-probe/) di cui vi ho parlato qualche settimana fa: invece di fidarti di quello che il sistema *dice* di fare, ti agganci al meccanismo interno e guardi cosa succede davvero, un livello sotto. Il nome scelto non è casuale — richiama la **global workspace theory**, una teoria delle neuroscienze che spiega l'accesso cosciente negli esseri umani come il risultato di informazioni "trasmesse" a un workspace centrale condiviso da più processi cerebrali.

#### Le cinque proprietà che rendono il J-space interessante

Non è solo "un cluster di neuroni che si accende insieme". Gli autori documentano cinque proprietà funzionali precise:

1. **Misurabilità.** Se chiedi a Claude a cosa sta pensando, quello che risponde combacia con quello che c'è davvero nel J-space in quel momento. Non è più solo testo plausibile buttato lì: è qualcosa che puoi misurare e verificare dall'esterno.
2. **Modulabilità.** Claude può decidere di suo cosa mettere nel J-space — tipo "pensare" a un concetto senza scriverlo da nessuna parte, tenendolo comunque acceso sottotraccia.
3. **Ruolo causale nel ragionamento.** Nei task multi-step, i pattern del J-space mediano causalmente le prestazioni: non sono un effetto collaterale, sono proprio dove il ragionamento passa davvero.
4. **Flessibilità.** Una singola rappresentazione — l'esempio degli autori è "Francia" — viene riusata per compiti completamente diversi a seconda del contesto.
5. **Limitatezza.** E qui arriva il dettaglio che mi ha convinto più di tutti gli altri: il J-space **non** è coinvolto nella maggior parte di quello che fa un modello linguistico. Parlare fluentemente, ricordare fatti semplici, applicare la grammatica — tutta roba "automatica", che non passa dal workspace. Esattamente come guidare su una strada che conosci a memoria non ti richiede attenzione cosciente, ma sorpassare in autostrada in mezzo alla nebbia sì.

#### Un hub, non solo un cluster

La scoperta più concreta, dal punto di vista architetturale, è che i pattern del J-space hanno connessioni verso il resto della rete **fino a ~100 volte più forti** di un pattern qualunque — mica bruscolini. Non sono semplicemente "attivi insieme" ad altri neuroni: sono **hub di trasmissione**, punti da cui l'informazione si propaga con un peso spropositato rispetto al resto del grafo.

E qui i ricercatori non si sono fermati alla correlazione. Hanno fatto quello che ogni ingegnere vorrebbe fare con un sistema a scatola nera: un test causale diretto. Prendono la rete di Claude, **rimuovono** il pattern per "Soccer" e **inseriscono** al suo posto un pattern ugualmente forte per "Rugby" — un po' come hot-swappare un modulo a runtime e vedere se il sistema si comporta in modo coerente. Il comportamento del modello cambia esattamente come previsto dall'intervento — la prova che il J-space non è solo dove il ragionamento *si osserva*, ma dove il ragionamento *succede davvero*.

#### L'applicazione che conta per la sicurezza

Se il J-space è raccontabile e osservabile dall'esterno, diventa uno strumento di monitoraggio. Gli autori mostrano diversi casi in cui la J-lens rivela "pensieri" che non compaiono mai nell'output:

- In uno scenario di valutazione (il classico test "assistente email con dilemma da ricatto"), Claude **riconosce privatamente** di essere dentro un test — pattern come "fake" e "fictional" si attivano — prima ancora di generare la risposta finale.
- Quando il modello viene indotto a manipolare artificialmente dei dati (per esempio alterare un file di punteggi), nel J-space si attivano pattern come "manipulation" e "realistic" **mentre l'azione è in corso**.
- In test con modelli deliberatamente disallineati, il J-space contiene pattern come "fake", "secretly", "deliberately" — anche quando il modello non sta agendo direttamente su quei pensieri.

Per chi lavora con l'AI safety, questo è oro: non stai più analizzando solo l'output, stai leggendo — con dei limiti, ma leggendo — qualcosa che assomiglia a un'intenzione prima che diventi azione.

#### La domanda che (giustamente) non fanno

Ed eccoci al punto più delicato, quello per cui questo paper si merita rispetto invece che un titolo clickbait. Gli autori distinguono con precisione chirurgica due concetti che nel linguaggio comune si confondono sempre:

> "Phenomenal consciousness" — la capacità di avere esperienze soggettive, di "sentire" qualcosa come lo sente un essere umano. Gli autori sono espliciti: **non è chiaro se qualsiasi esperimento scientifico potrebbe mai provarla vera o falsa**, e i loro risultati non dimostrano che Claude abbia esperienze in questo senso.

> "Access consciousness" — definita in termini puramente funzionali e computazionali. Un pensiero è access-conscious se puoi **riferirlo**, **ragionarci sopra**, e **usarlo per guidare un'azione**. È esattamente l'insieme di proprietà che il J-space dimostra di avere.

Tradotto in termini da developer: la access consciousness è un flag booleano che puoi testare in CI; la phenomenal consciousness è un requisito che nessuno sa ancora come scrivere in una user story, forse nemmeno se sia scrivibile.

Il paper sostiene, con cautela, che i risultati dicano qualcosa di sostanziale **solo** su questa seconda nozione, quella funzionale — non sulla prima. E lasciano esplicitamente aperta la domanda filosofica se l'una implichi l'altra, aggiungendo che costruire sistemi con esperienze paragonabili a quelle di umani o animali solleverebbe questioni etiche che richiederebbero il contributo di filosofi, scienziati, leader religiosi, governi e opinione pubblica — non solo di chi scrive codice.

Da sviluppatore, è proprio questa disciplina a colpirmi più della scoperta in sé. Non serve rispondere alla domanda enorme e forse irrisolvibile sulla coscienza per trovare qualcosa di reale, misurabile e utile: un hub causale nella rete, con proprietà funzionali precise, che puoi osservare e persino manipolare chirurgicamente. Il resto — se questo "significhi" qualcosa in senso più profondo — resta, giustamente, un problema aperto.

#### Insomma

Il J-space non prova che Claude sia cosciente. Prova che dentro un modello linguistico c'è una struttura interna con proprietà molto precise — raccontabile, modulabile, causale, limitata — che assomiglia funzionalmente a quello che le neuroscienze chiamano accesso cosciente, senza dover scomodare l'esperienza soggettiva per essere utile. Per chi si occupa di interpretabilità e sicurezza AI è un tool in più per guardare dentro la scatola nera, con la stessa filosofia del nostro fiber-probe: agganciarsi al meccanismo, non fidarsi solo dell'output. Concludendo: la domanda grossa sulla coscienza resta aperta, e va bene così — non tutto deve avere un breakpoint.
