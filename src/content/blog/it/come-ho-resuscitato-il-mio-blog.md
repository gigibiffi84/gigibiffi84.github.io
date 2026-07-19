---
title: "Come ho resuscitato il mio blog!"
description: "Dieci anni dopo: come ho recuperato tutti i miei vecchi articoli da Kirby CMS, cosa è successo nel frattempo tra backend e architettura, e perché GWT alla fine aveva ragione"
date: 2026-07-19
tags: ["blog", "astro", "markdown", "gwt", "typescript", "react", "angular", "architettura"]
lang: it
translationKey: "come-ho-resuscitato-il-mio-blog"
headerImage: "/images/come-ho-resuscitato-il-mio-blog/header.jpg"
---

Se stai leggendo queste righe, il miracolo è riuscito: **questo blog è tornato in vita dopo quasi dieci anni di silenzio**. Stesso dominio, stessi articoli, stesso autore — ma con qualche capello in meno e, spero, qualche idea più chiara.

#### L'archeologia informatica

Il vecchio blog girava su Kirby CMS: PHP, un hosting da mantenere, e quella sensazione costante che prima o poi qualcosa si sarebbe rotto. E infatti. Per fortuna avevo fatto una cosa giusta: **avevo conservato tutto in un repository Git**, e Kirby — sia benedetto — salvava gli articoli in file di testo con il corpo già in markdown.

Il recupero è stato quindi un lavoro di archeologia più che di magia: uno script ha convertito i campi di Kirby (`Title`, `Date`, `Tags` separati da `----`) in frontmatter YAML standard, sistemato i tag proprietari come `(link: ...)` e `(image: ...)`, e recuperato immagini e snippet di codice. Ne sono usciti tutti i miei articoli dal 2015 in poi, comprese le versioni inglesi e perfino tre bozze che non avevo mai pubblicato.

Il risultato è un sito statico costruito con [Astro](https://astro.build): scrivo un file markdown, faccio `git push`, e in un minuto è online su GitHub Pages. **Niente database, niente PHP, niente hosting da curare.** Fedele al mio motto: complicare è facile, semplificare è difficile.

#### Dieci anni in un paragrafo

Nel frattempo non sono stato fermo. La mia carriera è partita dal backend — Java, Spring, sistemi enterprise — e negli anni si è spostata sempre più verso **la parte architetturale**: Domain-Driven Design, microservizi, architetture cloud. Oggi il mio lavoro è tanto disegnare i confini di un sistema quanto scriverne il codice, e onestamente non saprei più rinunciare a nessuna delle due cose.

E il frontend? Qui viene il bello.

#### GWT aveva ragione (ve l'avevo detto)

Chi mi leggeva nel 2015 ricorderà articoli come [Javascript per sviluppare? No Grazie](/blog/js-is-dead/) e la serie sui [progetti Javascript scalabili](/blog/large-scale-javascript-projects-1/). All'epoca sviluppavo con GWT e sostenevo una tesi che mi costò le antipatie di mezzo web: **Javascript da solo non bastava per costruire applicazioni serie**. Servivano tipi, moduli, tooling, un compilatore che ti desse una mano prima del runtime.

In questi dieci anni ho lavorato a fondo con **Angular** prima e **React** poi, su progetti di ogni dimensione. E la cosa che mi diverte di più è constatare che l'ecosistema è arrivato esattamente dove speravo: TypeScript ha portato il type system che invocavo, i moduli ES e i bundler hanno portato la modularizzazione, i framework hanno portato struttura e pattern. Quello che GWT faceva compilando Java verso Javascript, oggi lo fa TypeScript compilando... verso Javascript. **La direzione era giusta, era lo strumento a essere in anticipo sui tempi.**

Non è una rivincita personale — è la conferma che certe esigenze di ingegneria del software sono universali: prima o poi ogni piattaforma che cresce se le deve porre.

#### Cosa arriva adesso

Il piano è tornare a scrivere con regolarità, e in formato più agile: **articoli in pillole**, brevi e concreti. Il materiale non manca: sono stato al **reactjsday di Verona** nel 2025 e ne ho portato a casa spunti che meritano di essere approfonditi uno per uno — dai pattern di rendering alle nuove direzioni dell'ecosistema React.

Se il vecchio blog era il diario di uno sviluppatore, questo vuole essere il taccuino di un architetto che non ha mai smesso di scrivere codice.

Ci si legge presto. E questa volta sul serio :)
