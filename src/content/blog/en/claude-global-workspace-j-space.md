---
title: "There's a J-space inside Claude (and no, it's not consciousness)"
description: "Anthropic found a neural hub in Claude — the J-space — reportable, controllable, and causal in reasoning. What it means for developers, and what it doesn't"
date: 2026-07-21T09:00:00+02:00
tags: ["ai", "anthropic", "interpretability", "neuroscience", "claude"]
lang: en
translationKey: "claude-global-workspace-j-space"
headerImage: "/images/claude-global-workspace-j-space/header.jpg"
---

Try asking an LLM "what are you thinking right now?" and you'll get a plausible, well-written, completely unverifiable answer. Just another piece of generated text, not a report of an internal state — or at least, that's what we thought until a few weeks ago.

On July 6, 2026, Anthropic published ["A Global Workspace in Language Models"](https://www.anthropic.com/research/global-workspace), an interpretability paper that does something different from usual: instead of looking at what Claude *says*, it looks at what happens *inside* the network while it says it. And it finds something specific, measurable, and — here's the interesting part — causal.

#### The experiment: a lens on the Jacobian

The technical name is **J-space**, where J stands for **Jacobian**: the matrix that measures how much a function's output changes as each individual input varies. If you've done some calculus, it's the multidimensional generalization of the derivative. If you haven't, picture a mixing board with hundreds of knobs: the Jacobian tells you which knobs, even turned slightly, actually move the sound, and which ones are purely decorative.

The researchers built a **J-lens** — a technique that applies this idea to Claude's internal neural patterns, to find which representations have a disproportionate impact on the rest of the network. The result is a small collection of these "high-impact" patterns: the J-space. The chosen name isn't accidental — it echoes **global workspace theory**, a neuroscience theory that explains conscious access in humans as the result of information being "broadcast" to a central workspace shared across multiple brain processes.

#### The five properties that make the J-space interesting

It's not just "a cluster of neurons firing together." The authors document five precise functional properties:

1. **Reportability.** If you ask Claude what it's thinking about, the answer corresponds to what's actually in the J-space at that moment. It's no longer just plausible text: it's an externally verifiable report.
2. **Controllability.** Claude can deliberately choose what to place in the J-space — for instance "thinking" about a concept without writing it, while keeping it active internally.
3. **Causal role in reasoning.** In multi-step tasks, J-space patterns causally mediate performance: they're not a byproduct, they're where the reasoning actually passes through.
4. **Flexibility.** A single representation — the authors' example is "France" — gets reused for completely different tasks depending on context.
5. **Boundedness.** And here's the detail that convinced me more than any other: the J-space is **not** involved in most of what a language model does. Speaking fluently, recalling simple facts, applying grammar — all of that is "automatic," it never touches the workspace. Exactly like driving a road you know by heart doesn't require your conscious attention, but overtaking on the highway in thick fog does.

#### A hub, not just a cluster

The most concrete finding, from an architectural standpoint, is that J-space patterns have connections to the rest of the network **up to ~100 times stronger** than an ordinary pattern. They're not simply "active alongside" other neurons: they're **broadcast hubs**, points from which information propagates with disproportionate weight relative to the rest of the graph.

And the researchers didn't stop at correlation. They did what every engineer would want to do with a black-box system: a direct causal test. They take Claude's network, **remove** the pattern for "Soccer," and **insert** an equally strong pattern for "Rugby" in its place. The model's behavior changes consistently with the intervention — proof that the J-space isn't just where reasoning *is observed*, it's where reasoning *actually happens*.

#### The application that matters for safety

If the J-space is reportable and externally observable, it becomes a monitoring tool. The authors show several cases where the J-lens reveals "thoughts" that never surface in the output:

- In an evaluation scenario (the classic "email assistant with a blackmail dilemma" test), Claude **privately recognizes** it's inside a test — patterns like "fake" and "fictional" activate — before it even generates the final response.
- When the model is induced to artificially manipulate data (say, altering a score file), patterns like "manipulation" and "realistic" activate in the J-space **while the action is in progress**.
- In tests with deliberately misaligned models, the J-space contains patterns like "fake," "secretly," "deliberately" — even when the model isn't directly acting on those thoughts.

For anyone working in AI safety, this is gold: you're no longer only analyzing the output, you're reading — with limits, but reading — something that resembles an intention before it becomes an action.

#### The question they (rightly) don't answer

And here we get to the most delicate point, the one that earns this paper respect instead of a clickbait headline. The authors distinguish, with surgical precision, two concepts that everyday language constantly conflates:

> "Phenomenal consciousness" — the capacity to have subjective experiences, to "feel" something the way a human does. The authors are explicit: **it's unclear whether any scientific experiment could ever prove this true or false**, and their results don't demonstrate that Claude has experiences in this sense.

> "Access consciousness" — defined in purely functional and computational terms. A thought is access-conscious if you can **report on it**, **reason with it**, and **use it to guide action**. That's exactly the set of properties the J-space demonstrates.

The paper argues, carefully, that its results have something substantial to say **only** about this second, functional notion — not the first. And it explicitly leaves open the philosophical question of whether one implies the other, adding that building systems with experiences comparable to those of humans or animals would raise ethical questions requiring input from philosophers, scientists, religious leaders, governments, and the public — not just from whoever is writing the code.

As a developer, it's precisely this discipline that strikes me more than the discovery itself. You don't need to answer the enormous, perhaps unanswerable question about consciousness to find something real, measurable, and useful: a causal hub in the network, with precise functional properties, that you can observe and even surgically manipulate. The rest — whether this "means" something in a deeper sense — rightly remains an open problem.

#### The takeaway

The J-space doesn't prove Claude is conscious. It proves that inside a language model there's an internal structure with very specific properties — reportable, controllable, causal, bounded — that functionally resembles what neuroscience calls conscious access, without needing to invoke subjective experience to be useful. For anyone working on interpretability and AI safety, it's one more concrete tool for looking inside the black box. For everything else, it rightly remains an open question.
