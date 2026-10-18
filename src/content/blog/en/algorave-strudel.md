---
title: "Algorave: how I taught Claude to play trance"
description: "What an algorave is, how it started and how I use it: live coding with Strudel, a Claude Code skill, and MIDI over the IAC Driver into Logic Pro and GarageBand"
date: 2026-10-18T19:11:00+02:00
tags: ["algorave", "strudel", "music", "live-coding", "midi", "agents"]
lang: en
translationKey: "algorave-strudel"
headerImage: "/images/algorave-strudel/header.jpg"
---

Did you know I'm a software developer, but my favourite hobby is playing music? Well, now you do. For years the two lived in separate rooms: code by day, music by night, and never the twain shall meet. Then I found out there's a way to bring them together without either one getting offended, and it has a name that sounds like it came off a 1996 flyer: **algorave**.

#### What an algorave is

An algorave is a party where the music is written live, in code, in front of everyone. Code projected on the wall, speakers turned up, people dancing to a `for` loop. Put like that it sounds like a sprint review with the lights down. It works anyway, and I fell for it hook, line and sinker.

The official definition on [algorave.com](https://algorave.com/about/) is a joke on the UK law that banned raves by defining them as music with "repetitive beats":

> Sounds wholly or predominantly characterised by the emission of a succession of repetitive conditionals.

Repetitive conditionals. **Finally someone has described my code in flattering terms.**

There's one golden rule: whoever plays **shows their screen**. No closed laptop with a glowing apple and the nagging doubt that they're checking their email. The process is visible, readable, judgeable. The [guidelines](https://github.com/Algorave/guidelines) add the rest: no headliners, doors open to everyone, small dark rooms, a high-contrast projector and a bit of haze. And there's one line that stuck with me: algorave musicians don't pretend their software is being creative, **they take responsibility for the music they make**. Keep that in mind, because an AI is about to walk on stage.

#### How it started

The idea of playing music by writing code live is older than the name. In 2004 [TOPLAP](https://toplap.org/) was born, the live coding community, with a manifesto that asks exactly this: the performer's screen must be visible to the audience. Show us your screens.

The name came in 2011: Alex McLean and Nick Collins were on their way to a gig, a happy hardcore pirate radio station came on, and "algorave" came out of it. The first self-declared event was in 2012, in London, as a warm-up for the SuperCollider Symposium. Ten years later the community was streaming its birthday with more than three hundred events behind it, all over the world.

I like that it doesn't sell itself as "the future of dance music". It lines up behind a long history, that of raves, and doesn't try to replace it.

#### Strudel: TidalCycles in the browser

The tool I use is called [Strudel](https://strudel.cc/workshop/getting-started/): the JavaScript port of TidalCycles. It runs in the browser, nothing to install. Write a pattern, press Ctrl+Enter, and the kick starts:

```js
setcpm(137 / 4)                    // one cycle = one bar

const kick = s("bd*4").bank("RolandTR909")
const clap = s("~ cp ~ cp").gain(0.55)

$: stack(kick, clap)
```

With `setcpm(BPM/4)` one cycle becomes one bar, and the mental maths becomes trivial: `"<a b>/2"` is a chord every two bars. Randomness is "seeded" by the cycle too: bar 37 always rolls the same dice. **A riff that's random but repeatable on stage is exactly the kind of contradiction developers love.**

#### From the browser to Logic Pro with the IAC Driver

Strudel's synths are fun, but at home I have Logic Pro, and the sounds I know live there. The bridge is a piece of macOS almost nobody opens: the **IAC Driver**, a virtual MIDI cable that connects two programs on the same Mac.

It takes two minutes to switch on:

1. **Audio MIDI Setup** → Window → Show MIDI Studio (Cmd+2).
2. Double-click **IAC Driver**, tick "Device is online", and check that at least Bus 1 exists.
3. Open Strudel in **Chrome**: Web MIDI only exists there, Safari doesn't support it. Accept the MIDI permission.
4. Run `.midi()` once with no argument and copy the port name the console prints. On English macOS it's `IAC Driver Bus 1`, on Italian macOS `Driver IAC Bus 1`: guessing it from memory is the fastest way to hear nothing at all.

From there the track has a switch. One constant decides whether each part plays on Strudel's synths or goes out as MIDI on a fixed channel:

```js
const LOGIC = true               // true = MIDI to Logic, false = Strudel's synths
const PORT  = 'IAC Driver Bus 1'

const out = (pat, ch, synth) => LOGIC ? pat.midi(PORT).midichan(ch) : synth(pat)

const bass = out(
  n("[~ 0 ~ [0 0]]*2").scale("E1:minor"),
  1,                                      // channel 1 = bass
  p => p.s("sawtooth").lpf(330)
)
```

In Logic each part gets its own Software Instrument track, with **MIDI In Port** set to the IAC and **MIDI In Channel** set to the right channel: bass on 1, pad on 3, lead on 5, arp on 6, drums on 10 with Drum Machine Designer reading the General MIDI notes (36 kick, 38 snare, 42 hi-hat). Arm all the tracks, press R, and **Logic records whatever Strudel is playing**, part by part, ready to edit as if I'd played it on a keyboard.

With GarageBand the trick works too, with fewer luxuries: GarageBand listens to the IAC with no setup, but plays everything that arrives on the selected track, without sorting by channel. For one part at a time, or to hear a riff on a real piano instead of a sawtooth wave, it's more than enough.

The effects that only exist in Strudel, like noise, risers and drones, stay in the browser: they aren't MIDI. So in practice both play together, Logic for the instruments and Strudel for the air around them.

#### A skill instead of a thousand prompts

After a few tracks I realised I kept explaining the same things to Claude over and over. So I did what I now do with any repetitive job (it happened with the [TanStack Table v9 migration](/en/blog/migrare-tanstack-table-v9/) too): I wrote a Claude Code skill, `strudel-algorave`.

Inside there's a complete example track, the IAC Driver checklist, the channel map for Logic, and a few rules that are non-negotiable for me:

- **The kick and the main melody are deterministic.** They are the anchor and the identity of the track. Everything else can vary, but only by choosing among notes in key and on the grid: randomness yes, wrong notes no.
- **Only original music.** Ask for a famous song and you get a new piece *in its spirit*.
- **Every track ends with `._pianoroll()`**, so the audience sees the notes being born on the projector. Show us your screens, indeed.
- **The same file serves two stages:** in auto mode it plays the arrangement from start to finish, in live mode it plays one section at a time and I jump to the next with Ctrl+Enter, without stopping the clock.

This is where the line about responsibility comes back: **the skill's rules are where I make the decisions**. The AI writes the patterns, but the identity of the track, the constraints and the choice of what plays stay mine. It's the same principle as [loop engineering](/en/blog/loop-engineering/): it's not the agent that gets better, it's the context around it.

#### "Make me the Fable song"

My first request to the new skill was, I confess, not very original: "generate a track based on *Fable*". Robert Miles, mid-nineties, piano, strings, that endless breakdown. If you were there, you know.

The skill did what I had asked it to do, which is not what I was asking it for: no cover, but an original dream trance piece in that spirit. It's called **Paper Lanterns**: E minor, 137 BPM, Em–C–D–Bm, 160 bars across an intro, two drops and a 32-bar breakdown where only piano, strings and arp remain. Its heart is the piano melody, eight bars written by hand and locked in place:

```js
const MELODY = `<
  [b4 ~ e5 ~ g5 ~ f#5 e5]   [~ b4 ~ ~ d5 ~ e5 ~]
  [e5 ~ g5 ~ c6 ~ b5 g5]    [~ e5 ~ ~ g5 ~ ~ ~]
  [f#5 ~ a5 ~ d6 ~ a5 f#5]  [~ e5 ~ ~ f#5 ~ a5 ~]
  [b5 ~ a5 f#5 ~ d5 ~ f#5]  [e5 ~ ~ ~ ~ ~ ~ ~]
>`
```

Around it, everything else breathes: the arp picks random notes from the chord, the string filters open and close slowly, the hi-hat drops a hit here and there. Every run is a little different, but the melody is always the same. On channel 5 it reaches a Logic piano, and there, I admit, I got a little emotional.

#### The takeaway

Code and music weren't that far apart after all: a pattern is a loop, an arrangement is a list of sections, a groove is a function of time. Algorave gave me the excuse to stop keeping them in separate rooms, Strudel gave me the language, the IAC Driver the cable to bring it all into the sounds I know, and Claude a rehearsal partner that never gets tired of redoing the breakdown.

Next step: taking Paper Lanterns in front of people who dance. With the screen in plain sight.
