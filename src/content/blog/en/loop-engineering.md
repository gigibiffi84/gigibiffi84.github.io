---
title: "Loop engineering: stop writing prompts, design the loop"
description: "Hand-written prompts are on their way out: loop engineering designs cycles that drive AI agents toward a goal. What it is, how it works, where it hurts"
date: 2026-07-30T10:00:00+02:00
tags: ["ai", "agents", "loop engineering", "claude code", "productivity"]
lang: en
translationKey: "loop-engineering"
headerImage: "/images/loop-engineering/header.jpg"
---

A few days ago I stumbled upon [this video](https://www.youtube.com/watch?v=YpmRNpA0IWM) — "Loops are replacing prompts" — and I'll admit I opened it with a raised eyebrow, as I do with anything declaring something dead. Prompt engineering is dead, code is dead, JavaScript [has been dead for years](/en/blog/js-is-dead/) and yet here we are. But this time, underneath the hype, there's an idea worth understanding properly. Because it's not a lexical fad: it's a change of posture.

#### From "what do I type at the agent" to "who types it for me"

The idea in one line: **stop being the person who writes prompts for the agent, and become the person who designs the system that writes them for you**. A system that picks the next task, hands it to the agent, verifies the result, decides whether to retry or move on, and starts over. Without you watching.

The term crystallized in June 2026 within a couple of days. On June 7th Peter Steinberger wrote: *"You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents"* — and the post racked up millions of views. The next day Addy Osmani published [an essay](https://www.oreilly.com/radar/loop-engineering/) turning the slogan into a framework with a precise anatomy. And behind the scenes, some people had already been working this way for months: Boris Cherny, from Anthropic's Claude Code team (yes, the same Anthropic [from the J-space](/en/blog/claude-global-workspace-j-space/)), candidly stated: *"I don't prompt Claude anymore. I have loops running that prompt Claude"*.

The progression, if you think about it, was written all along: prompt engineering → context engineering → harness engineering → loop engineering. First we optimized the sentence, then the context around the sentence, then the tooling around the model, and now the cycle that keeps the whole thing running.

#### The anatomy: a thermostat, not a chat

A well-built loop looks more like a thermostat than a chatbot: it reads the state of the world, acts, measures again, and stops when the condition is met. In pseudocode:

```js
let state = { goal: "green CI", attempts: 0 };

while (!verified(state) && state.attempts < MAX) {
  const action = agent.decide(state);   // reason
  const result = execute(action);       // act: test, patch, build
  state = update(state, result);        // observe
  state = compact(state);               // context isn't infinite
  state.attempts++;
}

if (!verified(state)) escalate("a human is needed here");
```

The parts that matter aren't the obvious ones. They are:

1. **A testable exit condition.** "Do a good refactoring" is not a goal, it's a hope. "Tests pass and the linter is clean" is a goal. If verification is done by the model judging itself, you've built a self-absolution machine.
2. **Real tools.** Feedback must come from the real world — test runners, type checkers, the terminal — not from the model's feeling of having done well.
3. **Context management.** A long-running loop accumulates garbage in the context window; without compaction, by iteration twenty the agent no longer remembers what it was doing.
4. **Termination and escalation logic.** A loop with no iteration cap isn't autonomy, it's a bill.

#### The building blocks

Osmani lists the components these loops are built from in practice, and anyone using tools like Claude Code will recognize them instantly: scheduled **automations** doing discovery and triage on their own, isolated **worktrees** so multiple agents can work in parallel without stepping on each other's files, **skills** documenting project knowledge once instead of re-explaining it every session, **connectors** to issue trackers and CI, and **subagents** — with a pattern I find particularly healthy: one agent proposes, a *different* agent verifies. All of it held together by external memory (Markdown files, boards), because between one run and the next, models remember nothing.

The canonical example is the morning run: the system reads yesterday's CI failures and open issues, triages them, opens worktrees for the feasible fixes, one subagent writes the patches and another reviews them against project standards, connectors open the PRs, and whatever doesn't solve itself lands in an inbox for the human. You show up with your coffee and find the work already sorted.

#### Where it can hurt

And here's the part that the video — and most of the hype — glosses over faster than it should. Three problems that don't go away, and actually get worse the better the loop works:

- **Verification is still yours.** An unattended loop makes unattended mistakes. Even the verifier agent *claims* everything is fine — it doesn't *guarantee* it.
- **Comprehension debt.** The more the loop ships code you didn't write, the more code piles up that you don't understand. Without review discipline, in six months the project belongs to someone else — and that someone doesn't answer on Slack.
- **Cognitive surrender.** The sneakiest risk: designing the loop and then ceasing to exercise judgment. At that point the loop isn't leverage, it's abdication.

And then there's the token bill, which with unattended loops can get very creative.

#### Bottom line

Loop engineering is real, and it's the right direction for repetitive, long-running work with measurable success criteria: keeping CI green, clearing triage, mechanical migrations. But **not everything needs a loop**: an interactive session for a problem you're still figuring out often remains the better choice, and a badly built loop is just a more expensive way of being wrong without watching. As I always say: complicating is easy, simplifying is hard — and a good loop is first and foremost an exercise in simplification: a verifiable goal, a short cycle, a clear exit. I'll close with the line from Osmani I'm taking home: build the loop, but **build it like someone who intends to stay the engineer, not just the person who presses go**.
