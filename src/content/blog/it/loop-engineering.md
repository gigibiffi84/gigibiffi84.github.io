---
title: "Loop engineering: smetti di scrivere prompt, progetta il ciclo"
description: "Basta prompt scritti a mano: il loop engineering progetta cicli che guidano gli agenti AI verso un obiettivo. Cos'è, come funziona e dove può fare male"
date: 2026-07-30T10:00:00+02:00
tags: ["ai", "agenti", "loop engineering", "claude code", "produttività"]
lang: it
translationKey: "loop-engineering"
headerImage: "/images/loop-engineering/header.jpg"
---

Qualche giorno fa mi è capitato davanti [questo video](https://www.youtube.com/watch?v=YpmRNpA0IWM) — "I loop stanno sostituendo i prompt" — e ammetto di averlo aperto con il sopracciglio alzato, come faccio con tutto ciò che dichiara morto qualcosa. Il prompt engineering è morto, il codice è morto, JavaScript [è morto da anni](/blog/js-is-dead/) eppure eccoci qui. Però stavolta, sotto l'hype, c'è un'idea che merita di essere capita bene. Perché non è una moda lessicale: è un cambio di postura.

#### Da "cosa scrivo all'agente" a "chi lo scrive al posto mio"

L'idea in una riga: **smetti di essere la persona che scrive i prompt all'agente, e diventa la persona che progetta il sistema che li scrive al posto tuo**. Un sistema che sceglie il prossimo task, lo passa all'agente, verifica il risultato, decide se riprovare o andare avanti, e ricomincia. Senza di te a guardare.

Il termine si è cristallizzato a giugno 2026 nel giro di un paio di giorni. Il 7 giugno Peter Steinberger scrive: *"You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents"* — e il post fa milioni di visualizzazioni. Il giorno dopo Addy Osmani pubblica [un saggio](https://www.oreilly.com/radar/loop-engineering/) che trasforma lo slogan in un framework con un'anatomia precisa. E dietro le quinte c'era già chi lavorava così da mesi: Boris Cherny, del team Claude Code di Anthropic (sì, la stessa Anthropic [del J-space](/blog/claude-global-workspace-j-space/)), dichiara candidamente: *"I don't prompt Claude anymore. I have loops running that prompt Claude"*.

La progressione, se ci pensate, era scritta: prompt engineering → context engineering → harness engineering → loop engineering. Prima ottimizzavamo la frase, poi il contesto attorno alla frase, poi gli strumenti attorno al modello, e adesso il ciclo che tiene tutto in moto.

#### L'anatomia: un termostato, non una chat

Un loop ben fatto assomiglia più a un termostato che a una chatbot: legge lo stato del mondo, agisce, misura di nuovo, e si ferma quando la condizione è raggiunta. In pseudocodice:

```js
let stato = { goal: "CI verde", tentativi: 0 };

while (!verificato(stato) && stato.tentativi < MAX) {
  const azione = agente.decidi(stato);   // reason
  const esito  = esegui(azione);         // act: test, patch, build
  stato = aggiorna(stato, esito);        // observe
  stato = compatta(stato);               // il contesto non è infinito
  stato.tentativi++;
}

if (!verificato(stato)) escalation("qui serve un umano");
```

Le parti che contano non sono quelle ovvie. Sono:

1. **Una condizione di uscita testabile.** "Fai un buon refactoring" non è un goal, è una speranza. "I test passano e il linter è pulito" è un goal. Se la verifica la fa il modello giudicando sé stesso, avete costruito una macchina per l'autoassoluzione.
2. **Strumenti veri.** Il feedback deve arrivare dal mondo reale — test runner, type checker, terminale — non dalla sensazione del modello di aver fatto bene.
3. **Gestione del contesto.** Un loop che gira a lungo accumula spazzatura nella finestra di contesto; senza compattazione, al giro venti l'agente non si ricorda più cosa stava facendo.
4. **Logica di terminazione ed escalation.** Un loop senza tetto di iterazioni non è autonomia, è una bolletta.

#### I pezzi del sistema

Osmani elenca i componenti con cui questi loop si costruiscono in pratica, e chi usa strumenti come Claude Code li riconoscerà al volo: **automazioni** schedulate che fanno discovery e triage da sole, **worktree** isolati per far lavorare più agenti in parallelo senza pestarsi i file, **skill** che documentano la conoscenza di progetto una volta sola invece di rispiegarla a ogni sessione, **connettori** verso issue tracker e CI, e **subagenti** — con un pattern che trovo particolarmente sano: un agente propone, un *altro* agente verifica. Il tutto tenuto insieme da una memoria esterna (file Markdown, board), perché i modelli tra una run e l'altra non si ricordano niente.

L'esempio canonico è la run mattutina: il sistema legge i fallimenti CI di ieri e le issue aperte, fa triage, apre worktree per i fix fattibili, un subagente scrive le patch e un altro le rivede contro gli standard del progetto, i connettori aprono le PR, e ciò che non si risolve da solo finisce in una inbox per l'umano. Tu arrivi col caffè e trovi il lavoro già smistato.

#### Dove può fare male

Ed eccoci alla parte che nel video — e in gran parte dell'hype — passa più in fretta di quanto dovrebbe. Tre problemi che non spariscono, anzi peggiorano quanto meglio funziona il loop:

- **La verifica resta tua.** Un loop non sorvegliato fa errori non sorvegliati. Anche l'agente verificatore *dichiara* che è tutto a posto, non lo *garantisce*.
- **Il debito di comprensione.** Più il loop shippa codice che non hai scritto, più si accumula codice che non capisci. Senza una disciplina di review, tra sei mesi il progetto è di qualcun altro — e quel qualcuno non risponde su Slack.
- **La resa cognitiva.** Il rischio più subdolo: progettare il loop e poi smettere di esercitare giudizio. A quel punto il loop non è leva, è abdicazione.

E poi c'è il conto dei token, che con i loop non sorvegliati sa essere molto creativo.

#### Insomma

Il loop engineering è reale, ed è la direzione giusta per il lavoro ripetitivo, lungo, con criteri di successo misurabili: tenere la CI verde, smaltire il triage, migrazioni meccaniche. Ma **non tutto ha bisogno di un loop**: una sessione interattiva per un problema che stai ancora capendo resta spesso la scelta migliore, e un loop costruito male è solo un modo più costoso di sbagliare senza guardare. Come dico sempre: complicare è facile, semplificare è difficile — e un buon loop è prima di tutto un esercizio di semplificazione: un goal verificabile, un ciclo corto, un'uscita chiara. Chiudo con la frase di Osmani che mi porto a casa: costruisci il loop, ma **costruiscilo come chi intende restare l'ingegnere, non come chi preme il bottone**.
