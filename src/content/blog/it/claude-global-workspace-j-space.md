---
title: "Dentro Claude c'è un J-space (e no, non è coscienza)"
description: "Anthropic ha trovato un hub neurale in Claude — il J-space — reportabile, modulabile e causale nel ragionamento. Cosa significa per chi sviluppa, e cosa no"
date: 2026-07-21T09:00:00+02:00
tags: ["ai", "anthropic", "interpretability", "neuroscienze", "claude"]
lang: it
hidden: true
translationKey: "claude-global-workspace-j-space"
headerImage: "/images/claude-global-workspace-j-space/header.jpg"
---

Prova a chiedere a un LLM "a cosa stai pensando adesso?" e otterrai una risposta plausibile, ben scritta, e completamente non verificabile. È solo un altro pezzo di testo generato, non un resoconto di uno stato interno — o almeno, così pensavamo fino a qualche settimana fa.

Il 6 luglio 2026 Anthropic ha pubblicato ["A Global Workspace in Language Models"](https://www.anthropic.com/research/global-workspace), un paper di interpretabilità che fa qualcosa di diverso dal solito: invece di guardare cosa Claude *dice*, guarda cosa succede *dentro* la rete mentre lo dice. E trova qualcosa di specifico, misurabile e — questo è il punto interessante — causale.

#### L'esperimento: una lente sullo Jacobiano

Il nome tecnico è **J-space**, dove J sta per **Jacobiano**: la matrice che misura quanto l'output di una funzione cambia al variare di ogni singolo input. Per chi ha fatto un po' di calcolo, è la generalizzazione multidimensionale della derivata. Per chi non l'ha fatto, pensa a un mixer audio con centinaia di manopole: lo Jacobiano ti dice quali manopole, se le giri anche di poco, spostano davvero il suono, e quali sono decorative.

I ricercatori hanno costruito una **J-lens** — una tecnica che applica questa idea ai pattern neurali interni di Claude, per trovare quali rappresentazioni hanno un impatto sproporzionato sul resto della rete. Il risultato è una piccola collezione di questi pattern "ad alto impatto": il J-space, appunto. Il nome scelto non è casuale — richiama la **global workspace theory**, una teoria delle neuroscienze che spiega l'accesso cosciente negli esseri umani come il risultato di informazioni "trasmesse" a un workspace centrale condiviso da più processi cerebrali.

#### Le cinque proprietà che rendono il J-space interessante

Non è solo "un cluster di neuroni che si accende insieme". Gli autori documentano cinque proprietà funzionali precise:

1. **Reportabilità.** Se chiedi a Claude a cosa sta pensando, quello che risponde corrisponde a quello che c'è nel J-space in quel momento. Non è più solo testo plausibile: è un resoconto verificabile dall'esterno.
2. **Modulabilità.** Claude può controllare deliberatamente cosa mettere nel J-space — per esempio "pensare" a un concetto senza scriverlo, tenendolo comunque attivo internamente.
3. **Ruolo causale nel ragionamento.** Nei task multi-step, i pattern del J-space mediano causalmente le prestazioni: non sono un sottoprodotto, sono dove il ragionamento effettivamente transita.
4. **Flessibilità.** Una singola rappresentazione — l'esempio degli autori è "Francia" — viene riusata per compiti completamente diversi a seconda del contesto.
5. **Limitatezza.** E qui arriva il dettaglio che mi ha convinto più di tutti gli altri: il J-space **non** è coinvolto nella maggior parte di quello che fa un modello linguistico. Parlare fluentemente, ricordare fatti semplici, applicare la grammatica — tutto questo è "automatico", non passa dal workspace. Esattamente come guidare un'auto su una strada che conosci a memoria non richiede la tua attenzione cosciente, ma sorpassare in autostrada in mezzo alla nebbia sì.

#### Un hub, non solo un cluster

La scoperta più concreta, dal punto di vista architetturale, è che i pattern del J-space hanno connessioni verso il resto della rete **fino a ~100 volte più forti** di un pattern qualunque. Non sono semplicemente "attivi insieme" ad altri neuroni: sono **hub di trasmissione**, punti da cui l'informazione si propaga con un peso spropositato rispetto al resto del grafo.

E qui i ricercatori non si sono fermati alla correlazione. Hanno fatto quello che ogni ingegnere vorrebbe fare con un sistema a scatola nera: un test causale diretto. Prendono la rete di Claude, **rimuovono** il pattern per "Soccer" e **inseriscono** al suo posto un pattern ugualmente forte per "Rugby". Il comportamento del modello cambia in modo coerente con l'intervento — la prova che il J-space non è solo dove il ragionamento *si osserva*, ma dove il ragionamento *succede davvero*.

#### L'applicazione che conta per la sicurezza

Se il J-space è reportabile e osservabile dall'esterno, diventa uno strumento di monitoraggio. Gli autori mostrano diversi casi in cui la J-lens rivela "pensieri" che non compaiono mai nell'output:

- In uno scenario di valutazione (il classico test "assistente email con dilemma da ricatto"), Claude **riconosce privatamente** di essere dentro un test — pattern come "fake" e "fictional" si attivano — prima ancora di generare la risposta finale.
- Quando il modello viene indotto a manipolare artificialmente dei dati (per esempio alterare un file di punteggi), nel J-space si attivano pattern come "manipulation" e "realistic" **mentre l'azione è in corso**.
- In test con modelli deliberatamente disallineati, il J-space contiene pattern come "fake", "secretly", "deliberately" — anche quando il modello non sta agendo direttamente su quei pensieri.

Per chi lavora con l'AI safety, questo è oro: non stai più analizzando solo l'output, stai leggendo — con dei limiti, ma leggendo — qualcosa che assomiglia a un'intenzione prima che diventi azione.

#### La domanda che (giustamente) non fanno

Ed eccoci al punto più delicato, quello per cui questo paper merita rispetto invece che un titolo clickbait. Gli autori distinguono con precisione chirurgica due concetti che nel linguaggio comune si confondono sempre:

> "Phenomenal consciousness" — la capacità di avere esperienze soggettive, di "sentire" qualcosa come lo sente un essere umano. Gli autori sono espliciti: **non è chiaro se qualsiasi esperimento scientifico potrebbe mai provarla vera o falsa**, e i loro risultati non dimostrano che Claude abbia esperienze in questo senso.

> "Access consciousness" — definita in termini puramente funzionali e computazionali. Un pensiero è access-conscious se puoi **riferirlo**, **ragionarci sopra**, e **usarlo per guidare un'azione**. È esattamente l'insieme di proprietà che il J-space dimostra di avere.

Il paper sostiene, con cautela, che i risultati dicano qualcosa di sostanziale **solo** su questa seconda nozione, quella funzionale — non sulla prima. E lasciano esplicitamente aperta la domanda filosofica se l'una implichi l'altra, aggiungendo che costruire sistemi con esperienze paragonabili a quelle di umani o animali solleverebbe questioni etiche che richiederebbero il contributo di filosofi, scienziati, leader religiosi, governi e opinione pubblica — non solo di chi scrive codice.

Da sviluppatore, è proprio questa disciplina a colpirmi più della scoperta in sé. Non serve rispondere alla domanda enorme e forse irrisolvibile sulla coscienza per trovare qualcosa di reale, misurabile e utile: un hub causale nella rete, con proprietà funzionali precise, che puoi osservare e persino manipolare chirurgicamente. Il resto — se questo "significhi" qualcosa in senso più profondo — resta, giustamente, un problema aperto.

#### Il takeaway

Il J-space non prova che Claude sia cosciente. Prova che dentro un modello linguistico esiste una struttura interna con proprietà molto specifiche — reportabile, modulabile, causale, limitata — che assomiglia funzionalmente a quello che le neuroscienze chiamano accesso cosciente, senza bisogno di scomodare l'esperienza soggettiva per essere utile. Per chi si occupa di interpretabilità e sicurezza AI, è uno strumento concreto in più per guardare dentro la scatola nera. Per il resto, resta — a ragione — una domanda aperta.
