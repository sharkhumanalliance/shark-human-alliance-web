# Video Series Engine (comedy-first)

Last updated: 2026-05-31

This is the short-form video engine: cute, funny, mascot-forward. It sits on top of the world in `brand-kit.md` and follows the tone in `voice.md` (now cute-and-funny first). The Bureau is the comedic setting; Finnley and Luna are the stars.

Guardrails that still apply: facts only from `sources.md`; check `crisis.md` before publishing; conservation claims stay honest (forward commitment until a citable allocation exists); never imply the product gives real safety.

## Characters (canonical)

- **Finnley Mako** - soft blue plush shark. Earnest, dramatic, big feelings; an optimist who takes shark PR personally. Can have bad days (mildly tearful is allowed and endearing).
- **Luna Reef** - light teal plush shark with a coral scarf. Calm, deadpan, official. Reads, initials, redacts. Her flatness is the comedic foil to Finnley's drama.

Keep both exactly on `mascot-model-sheet.md`. Cute and expressive, never scary or toothy-aggressive.

## The format (25-30s)

1. **0-2s hook** - one sharp line on screen, readable instantly, muted-friendly.
2. **2-7s visual proof** - plush shark + a prop: case file, stamp, mini desk, courtroom, press mic.
3. **7-18s absurd escalation** - official language, exaggerated seriousness, mini-drama between Finnley and Luna.
4. **18-24s shark-positive payoff** - ONE accurate point from `sources.md`, lightly framed.
5. **24-30s comment trigger** - an in-world CTA: a verdict, a vote, "open a case", "send to a specific human".

First frame must carry information on its own. Do not open on a pretty establishing shot.

## Recurring series

### 1. Shark Court  (-> Wanted bridge)

A shark is "charged" with an absurd human accusation; Luna defends, Finnley is the dramatic defendant. This IS the site's Wanted/case mechanic in video form, so it doubles as the product bridge.

Hooks: "The People v. Tiny Hammerhead." / "Charge: looking too pointy near a beach." / "Exhibit A: he has no pockets, therefore no evil plan."

CTA: "Guilty or misunderstood? The Bureau invites your verdict." Then, when pushing product: "Open a case on a human who is still paperwork-free" -> link to `/wanted` with `from=social_wanted`. A closed case resolves with a certificate.

### 2. Shark PR Department

Finnley and Luna fix sharks' bad PR as overworked officials.

Hooks: "Emergency PR meeting. A shark has been called scary again." / "We regret to inform you that another human watched Jaws unsupervised." / "Official statement: the shark was not lurking. He was commuting."

### 3. Myth Correction Office

Each video corrects one myth as an over-serious memorandum. Use careful wording ("many sharks", "most encounters"), never absolutes. Fact must be from `sources.md`.

Myths: "Sharks hunt humans." / "All sharks are dangerous." / "The ocean would be safer without sharks."

### 4. Tiny Shark, Big Feelings

A plush shark has a humanly relatable emotional problem. Warm and cute; Finnley can be a little tearful on a bad day.

Beats: Finnley hears someone called him a "monster". / Luna prepares a self-esteem seminar for misunderstood predators. / Finnley corrects "shark-infested waters" to "shark-occupied homeland".

### 5. Human Training Program

Sharks politely train humans to behave more fairly.

Lessons: "Lesson 1: stop calling our home infested." / "Lesson 2: not every fin is a threat." / "Lesson 4: sharks are not villains. They are wet coworkers."

### 6. Ocean Bureaucracy (world-building)

The ocean runs as an absurd agency. Invent units: Department of Misunderstood Fins, Office of Human Panic Reduction, Bureau of Gentle Apex Predators, Committee for Unfairly Spiky Animals.

## Running joke: language corrections

"shark-infested" -> "shark-inhabited" / "correctly staffed" / "shark-occupied homeland". Highly memetic, repeatable, comment-friendly. Build a community glossary out of it.

## Hook taxonomy

- **Official emergency:** "Emergency announcement from the Shark Human Alliance." / "This is not a drill. A shark has been emotionally misrepresented."
- **Unfair accusation:** "This shark has been accused of ruining beach vibes." / "The defendant is charged with having a suspicious fin."
- **Language correction:** "Please stop saying shark-infested waters. That is our house."
- **Absurd official claim:** "Effective immediately, sharks may no longer be judged by tooth count."
- **Cute conflict:** "Finnley tried to look less intimidating. It did not go well."

## Props / visual kit

Mini desk, stamps (APPROVED / DENIED / MISUNDERSTOOD / FILED / REDACTED), folders (CASE FILE / URGENT / HUMAN PANIC REPORT), Shark Human Alliance sign, press-conference mic, mini courtroom, tiny glasses or tie, ocean maps, blue/cream backgrounds, big readable on-screen text.

## First series to test

1. **Shark Court** - best for comments and the Wanted bridge.
2. **Shark PR Statements** - short, memetic, shareable.
3. **Human Panic Reduction Training** - education without moralizing.
4. **Language Corrections** - repeatable running joke and community glossary.

## Generation prompt

Use as a base for drafting concepts:

> Create short-form video concepts for Shark Human Alliance, a cute, funny fictional agency improving shark-human relations through plush shark characters and an absurdly official paperwork world. Characters: Finnley Mako (soft blue plush shark; earnest, dramatic, big feelings) and Luna Reef (light teal plush shark with a coral scarf; calm, deadpan, official). Tone: cute, funny, warm, slightly absurd, shark-positive. No fearmongering, gore, clickbait, or aggressive controversy. Each concept must include: a 2-second hook; the first visual frame; a 25-30s script; camera directions; one visual gag; one accurate shark-positive point I can verify against sources; a caption; and an in-world comment/share CTA. Make each feel like part of a recurring institution (court hearings, PR meetings, official corrections, training sessions). Where useful, tie the case to opening a Wanted case on a real human.

## Self-analysis prompt (once 15-30 videos exist)

> Analyze these Shark Human Alliance videos. I will provide title, hook, first-frame, character used, emotional trigger, educational angle, CTA type, caption, length, and the metrics: views, average watch time, completion, replays, likes, comments, shares, saves, follower conversion, plus site-side events (wanted_poster_generate, wanted_to_purchase_click, purchase) attributed via from= source. Identify which patterns drive both engagement AND site conversion. Split into: repeat, improve, stop, and new variations to test. Base conclusions only on the supplied data; no generic advice.
