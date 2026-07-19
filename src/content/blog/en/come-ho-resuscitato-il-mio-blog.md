---
title: "How I Resurrected My Blog!"
description: "Ten years later: how I recovered all my old articles from Kirby CMS, what happened in the meantime between backend and architecture, and why GWT was right after all"
date: 2026-07-19
tags: ["blog", "astro", "markdown", "gwt", "typescript", "react", "angular", "architecture"]
lang: en
translationKey: "come-ho-resuscitato-il-mio-blog"
headerImage: "/images/come-ho-resuscitato-il-mio-blog/header.jpg"
---

If you're reading these lines, the miracle worked: **this blog is back from the dead after almost ten years of silence**. Same domain, same articles, same author — with a bit less hair and, I hope, a few clearer ideas.

#### Software archaeology

The old blog ran on Kirby CMS: PHP, a hosting plan to look after, and that constant feeling that sooner or later something would break. And indeed it did. Luckily I had done one thing right: **I had kept everything in a Git repository**, and Kirby — bless it — stored articles as text files with the body already written in markdown.

So the recovery was archaeology more than magic: a script converted Kirby's fields (`Title`, `Date`, `Tags` separated by `----`) into standard YAML frontmatter, fixed proprietary tags like `(link: ...)` and `(image: ...)`, and rescued images and code snippets. Out came all my articles from 2015 onwards, including the English versions and even three drafts I had never published.

The result is a static site built with [Astro](https://astro.build): I write a markdown file, run `git push`, and a minute later it's live on GitHub Pages. **No database, no PHP, no hosting to babysit.** Faithful to my motto: complicating is easy, simplifying is hard.

#### Ten years in one paragraph

I haven't been standing still in the meantime. My career started on the backend — Java, Spring, enterprise systems — and over the years it shifted more and more towards **architecture**: Domain-Driven Design, microservices, cloud architectures. Today my job is as much about drawing the boundaries of a system as it is about writing its code, and honestly I couldn't give up either one anymore.

And the frontend? Here comes the fun part.

#### GWT was right (told you so)

Those who read me back in 2015 will remember articles like [Javascript Is Dead?](/en/blog/js-is-dead/) and the series on [scalable Javascript projects](/blog/large-scale-javascript-projects-1/) (in Italian). At the time I was developing with GWT and defending a thesis that earned me the antipathy of half the web: **Javascript alone was not enough to build serious applications**. You needed types, modules, tooling, a compiler lending you a hand before runtime.

Over these ten years I've worked extensively with **Angular** first and **React** later, on projects of every size. And what amuses me most is seeing that the ecosystem landed exactly where I hoped it would: TypeScript brought the type system I was calling for, ES modules and bundlers brought modularization, frameworks brought structure and patterns. What GWT did by compiling Java to Javascript, TypeScript does today by compiling... to Javascript. **The direction was right; the tool was simply ahead of its time.**

It's not a personal vindication — it's confirmation that certain software engineering needs are universal: sooner or later, every platform that grows has to face them.

#### What comes next

The plan is to get back to writing regularly, in a more agile format: **bite-sized articles**, short and concrete. There's no shortage of material: I attended **reactjsday in Verona** in 2025 and came home with insights that deserve to be explored one by one — from rendering patterns to the new directions of the React ecosystem.

If the old blog was a developer's diary, this one wants to be the notebook of an architect who never stopped writing code.

See you soon. And this time for real :)
