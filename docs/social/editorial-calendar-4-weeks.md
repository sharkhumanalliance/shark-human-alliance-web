# Editorial Calendar: Relaunch — First 4 Weeks From Zero

Last updated: 2026-07-01 (v2 — production-ready cards with generation prompts)

> **Replaces the previous IG+FB static-image calendar** (old plan in git history). At zero followers, static feed posts have no discovery surface — Reels/TikTok are the only organic reach a new account gets. Old specs in `posts/` are reused where noted; `voice.md`, `sources.md`, `brand-kit.md`, `mascot-model-sheet.md`, and `crisis.md` still govern everything.
>
> **v2 change:** every post is now a self-contained production card — exact on-screen text, final caption, alt text, and copy-paste generation prompts per shot. You should never need to invent copy or a prompt on production day.

## Relaunch Principles

1. **Video-first.** 2-3 Reels/week, posted natively to BOTH Instagram Reels and TikTok (same file, no watermark). Optional free YouTube Shorts re-post.
2. **Every post stands alone.** Every viewer is a first-time viewer. Callbacks are a bonus layer, never load-bearing.
3. **The free Wanted generator opens week 2**, not week 4. Free ≠ hard sell. Certificate stays invisible until the week-4 soft hint.
4. **Facebook feed paused.** Revisit after IG/TikTok traction.
5. **Stories paused** until ~500 followers. Exception: a free link-sticker duplicate of a feed CTA.
6. **Verdict/comment CTA on (almost) every post.** Comments outrank saves for distribution.
7. **One flexible trend slot/week** (see Trend Slot Playbook below). Skip if nothing fits. Check `crisis.md` first, always.
8. **Timing loose.** Default window 17:00-20:00 CEST; consistency and watch time beat clock precision.
9. **Keywords over hashtags.** Max 3-5 tags (`voice.md` list); searchable phrases ("shark facts", "wanted poster", "sharks older than trees") go in caption line 1 and on-screen text.

## Account Setup At Relaunch (one-time)

1. Bios exactly per `brand-kit.md` → Page Bios (IG name field `Shark Human Alliance — Bureau`; the "Real conservation" line stays on every platform).
2. **Bio link (permanent):** `https://sharkhumanalliance.com/wanted?from=social_bio`. The free tool converts cold profile visits better than the homepage. Per-post "link in bio" CTAs resolve to this URL, so that traffic is attributed `social_bio` — correct and expected. Reserve `from=social_wanted` for real per-post links (TikTok link button, Story link-sticker duplicates, future FB posts).
3. TikTok: same handle, same bio lines, same link once the account qualifies for one.
4. Pinning: after week 1 pin R1.2 (glossary engine); after week 2 pin R2.1 and R2.2 (court + free tool). Keep exactly 3 pins from week 2 on.
5. Legacy grid posts from the old plan (e.g. the Bureau Opens memo) stay — on-brand world-building. Do not delete, do not repost.

## Weekly Rhythm

| Slot | Format | Purpose |
| --- | --- | --- |
| Reel A (Mon-Tue) | 25-30s Reel | Character comedy |
| Reel B (Wed-Thu) | 25-30s Reel | Shark Court / Wanted mechanic — the share engine |
| Feed C (Fri-Sat) | 4:5 IMG/carousel | Facts (saves + search) or archetype Wanted poster (tags) |
| Trend slot (any day) | Reel | Optional. Current trend × Bureau voice |

Format contract (`video-series.md`): 0-2s muted-readable hook → 2-7s plush + prop → 7-18s absurd escalation → 18-24s ONE sourced fact → 24-30s in-world comment trigger. 9:16, burned-in captions, first frame carries the joke alone.

---

## PRODUCTION SYSTEM (read once, reuse forever)

### Workflow per Reel

1. Generate 3-4 short clips (5-8s each) with the shot prompts below. **Generate silent and with NO text in frame** — generators mangle text; typography is added afterwards.
2. Use the approved mascot reference images as character reference in the generator (`public/mascots/homepage-hero-plush.png`, `public/mascots/case-closed-share.png`; per `mascot-model-sheet.md`, reference-editing beats pure text prompting). Regenerate on any color/eye/proportion drift.
3. Assemble in CapCut/Canva: cut clips to the timing plan, add ON-SCREEN TEXT (Geist Sans for readable lines, Cinzel for official headers — per `brand-kit.md`), overlay stamps from `assets/stamps/png/`, add trending or quiet audio, burn in captions.
4. Fact text must be copied verbatim from `sources.md`. Source line uses the `source-line` component.
5. Export the 0-2s hook frame (with text) as the Reel cover; keep all cover text inside the central 4:5 zone so the profile-grid crop does not cut it.

### Workflow per static graphic

Image-gen only for scene/mascot layers (textless). Layout, copy, stamps, and source lines come from `assets/templates/` + Canva. Never let a generator render final typography.

### Reusable prompt blocks

Paste these into every prompt where marked.

**[FINNLEY]** = `Finnley Mako, a soft blue plush shark (body color #4A9BE8), slightly larger of the two mascots, earnest, dramatic, big expressive eyes with white highlights, no accessories`

**[LUNA]** = `Luna Reef, a light teal plush shark (body color #5BC4BF) wearing a small coral scarf (#EE8A45), tiny flower and badge, calm, deadpan, tidy`

**[STYLE]** = `soft plush chibi shark mascot style consistent with provided reference images, rounded friendly body, gentle fabric texture, cozy miniature government-office set, cream paper documents, navy ink, wooden mini desk, rubber stamps, warm soft studio lighting, shallow depth of field, subtle film grain, NO text or letters anywhere in frame, vertical 9:16`

**[NEG]** = `scary shark, aggressive teeth, blood, horror, realistic predator anatomy, wrong colors, missing Luna scarf, missing Luna flower, harsh neon, plastic 3D toy look, distorted eyes, text, letters, words, watermark, logo`

**[PAPERSTYLE]** (for document/poster stills) = `vintage bureaucratic document on warm cream paper (#F6ECD8), navy ink (#162D50), subtle fiber texture and light ink imperfections, tactile official-form look, flat lay or straight-on, NO readable text (layout blocks only), 4:5 portrait`

---

## Publication Log

| Post | Window | Status |
| --- | --- | --- |
| R1.1 Emergency PR Meeting | Week 1, Reel A | Production card ready |
| R1.2 Language Correction #1 | Week 1, Reel B | Production card ready |
| C1.3 Public Fact Carousel | Week 1, Feed C | Captions FINAL in `posts/week-2-post-2-public-fact-carousel.md` |
| R2.1 Shark Court #1 | Week 2, Reel A | Production card ready |
| R2.2 Wanted Archetype #1 (funnel opens) | Week 2, Reel B | Production card ready |
| C2.3 Wanted Archetype #2 (static) | Week 2, Feed C | Production card ready |
| R3.1 Older Than Trees | Week 3, Reel A | Production card ready |
| R3.2 Luna Redacts | Week 3, Reel B | Production card ready |
| C3.3 Field Report | Week 3, Feed C | **Graphic already produced** — caption swap only |
| R4.1 Human Training Program, Lesson 1 | Week 4, Reel A | Production card ready |
| R4.2 Verdict Day — Case SHA-0001 Closed | Week 4, Reel B | Production card ready |
| C4.3 PSA — Resume | Week 4, Feed C | Reuse `posts/week-4-post-1-psa-resume.md` |

---

## WEEK 1 — The Bureau Is Legible In One View

No product, no links. A stranger seeing any single post gets the account and laughs.

### R1.1 Emergency PR Meeting (Reel A — Finnley intro)

The joke: a plush shark runs crisis PR about a 51-year-old movie, and behind him is a full conspiracy board about it.

TIMING & ON-SCREEN TEXT (add in edit):

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `EMERGENCY PR MEETING.` / `A shark has been called scary again.` | Shot 1 |
| 2-7s | — | Shot 1 continues |
| 7-14s | `THE BUREAU WISHES TO CLARIFY THAT THE 1975 FILM WAS NOT, IN FACT, A DOCUMENTARY.` (typed-memo style, Cinzel header optional) | Shot 2 |
| 14-18s | `FILED` stamp slams over frame (use `filed-navy.png`) | Shot 3 |
| 18-24s | `Statistically, the average shark is having a quiet day.` + `Fewer than 10 human fatalities from unprovoked shark bites occur in most years.` + source line `FLORIDA MUSEUM ISAF` | Text card (Canva, ledger paper) |
| 24-30s | `Comment one word of support. Finnley reads everything. Twice.` | Shot 4 |

SHOT PROMPTS:

- **Shot 1 (hook, 6s):** `[FINNLEY] sitting at a tiny wooden desk in a miniature press office, visibly distressed, one fin on his forehead, a chunky manila folder on the desk, behind him a cork board covered in blank papers connected by dramatic red string, one crumpled paper ball rolls off the desk, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (statement, 7s):** `[FINNLEY] standing at a tiny press-conference podium with a miniature microphone, composing himself, delivering a statement with great dignity, a single spotlight, blank cream statement paper in fin, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (Luna stamp, 4s):** `[LUNA] slides into frame from the side, stamps a document on the desk once with a wooden rubber stamp without looking up from the clipboard in her other fin, slides back out of frame, deadpan, [FINNLEY] blurred in background mid-speech, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (CTA, 4s):** `[FINNLEY] close-up, hopeful wet-eyed expression, clutching the folder to his chest like a comfort object, looking directly into camera, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `A shark has been called scary again. Press spokesperson Finnley Mako has prepared a statement. He insists you watch it. Twice. #SharkHumanAlliance #SharkFacts #FinnleyMako`

ALT TEXT: `A blue plush shark in a tiny press office delivers an official statement; a teal plush shark stamps it FILED without looking.`

ASSEMBLY: desk (S1) → cut-away to podium statement (S2) → back to desk for Luna's stamp (S3) → close-up (S4). The location jump is intentional — it reads as edited press footage. Fallback if two-character consistency fails in S3: shoot Luna alone stamping, Finnley stays off-frame (his speech continues as on-screen text).

AUDIO: quiet office ambience or a trending "serious announcement" sound.

PINNED COMMENT (paste as-is): `Finnley has asked the Bureau to relay that he is "doing fine." This has been filed under Optimism.`

COMMENT REPLIES: in character, grateful, slightly too moved.

### R1.2 Language Correction #1 (Reel B — the running joke starts)

The joke: the Bureau formally corrects "shark-infested waters" — and then produces a map of Earth to prove whose house it is.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `Please stop saying "shark-infested waters."` | Shot 1 |
| 2-8s | `OFFICIAL CORRECTION № 1` / `infested` (struck through) → `inhabited` | Shot 2 + text overlay |
| 8-15s | `That is our house. You are the visitor.` | Shot 2 continues |
| 15-20s | `For reference, the house:` + `REVIEWED` stamp (`reviewed-navy.png`) — CORRECTED is not in the stamp set; the correction lives in the 2-8s overlay text | Shot 3 |
| 20-25s | `More than one-third of shark, ray, and chimaera species are threatened with extinction.` + `SOURCE — DULVY ET AL. 2021` + `The paperwork situation is currently worse for them than for you.` | Text card (ledger paper) |
| 25-30s | `The Bureau accepts further corrections in the comments.` | Shot 4 |

SHOT PROMPTS:

- **Shot 1 (hook, 4s):** `[LUNA] at a tiny desk holding up one flat fin toward the camera in a calm "stop" gesture, unimpressed, a tall stack of documents beside her, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (correction, 8s):** `[LUNA] drawing a single precise line through a word on an official document with a fountain pen, then writing above it, extreme care, close-up on fins and paper, [FINNLEY] in soft-focus background nodding with too much emotion, one tear, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (the map, 6s):** `[LUNA] unrolls a vintage classroom-style world map onto a stand and taps the ocean with a wooden pointer, completely deadpan, the ocean area subtly highlighted, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (CTA, 4s):** `[LUNA] holding an empty official suggestion-box tray toward the camera, expectant, one eyebrow area slightly raised, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Official correction: the waters are not infested. They are inhabited. Roughly 71% of the planet is, administratively speaking, their house. The Bureau will now accept other phrases requiring review. #SharkHumanAlliance #SharkConservation`

> The 71% figure is approved as Fact 5 in `sources.md` (NOAA citation). Use the wording there.

ALT TEXT: `A teal plush shark formally corrects the phrase "shark-infested waters" to "shark-inhabited waters" and presents a world map as evidence.`

AUDIO: soft pen-scratch and office ambience; a deadpan "serious reveal" trending sound also works.

PINNED COMMENT (paste as-is): `Corrections are reviewed in the order received. "Shark week" is already under investigation.`

This launches the community-glossary engine — audience-submitted "corrections" feed future episodes. Reply in character; best submissions become Official Correction № 2, 3, …

### C1.3 Public Fact Carousel (Feed C)

Direct reuse of `posts/week-2-post-2-public-fact-carousel.md` (slides + captions FINAL there). One change — append to caption: `Comment FILED to acknowledge receipt.`

Slides are text-led: build from `public-notice-stat-card` templates + `sha-bureau-header` + `source-line`. No image-gen needed.

---

## WEEK 2 — Wanted Opens (the growth loop starts)

> **Shark Awareness Day is Tue July 14** — publish R2.1 that day and open its caption with `Shark Court is in session on Shark Awareness Day.` (+ hashtag `#SharkAwarenessDay` as the rotating tag). Optionally spend the week-2 trend slot on a straight Bureau memo Reel: `The Bureau acknowledges Shark Awareness Day. The sharks remain unaware. The Bureau finds this fitting.`

Link mechanic: IG bio link. Canonical URL `https://sharkhumanalliance.com/wanted?from=social_wanted` — **implemented 2026-07-06:** `/wanted` persists the campaign origin first-touch; internal CTAs no longer overwrite it (`docs/analytics-events.md`).

### R2.1 Shark Court #1 (Reel A)

The joke: a shark is on trial for looking too pointy; the evidence collapses because he has no pockets and the "lurking" footage is his own living room.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `SHARK COURT IS IN SESSION.` / `The People v. Tiny Hammerhead.` | Shot 1 |
| 2-8s | `CHARGE: looking too pointy near a public beach.` | Shot 1 continues |
| 8-14s | `EXHIBIT A: the defendant has no pockets, and therefore no evil plan.` | Shot 2 |
| 14-20s | `EXHIBIT B: security footage of the defendant "lurking."` / `The defendant lives there.` | Shot 3 |
| 20-25s | `Most humans entering the ocean are not, technically, on the menu.` + `SOURCE — FLORIDA MUSEUM ISAF` | Text card |
| 25-30s | `GUILTY or MISUNDERSTOOD?` / `The Bureau invites your verdict.` | Shot 4 |

SHOT PROMPTS:

- **Shot 1 (courtroom, 7s):** `miniature courtroom scene, [FINNLEY] as the nervous defendant wearing a tiny crooked tie, sitting very straight in a small wooden dock, [LUNA] beside him as defense counsel calmly arranging documents, a tall judge bench looming empty above them, wood paneling, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (Exhibit A, 6s):** `[LUNA] presenting evidence in a miniature courtroom: she gestures with a wooden pointer at [FINNLEY] who slowly rotates in place showing he has no pockets, fins slightly raised, apologetic, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (Exhibit B, 6s):** `grainy black-and-white security-camera style footage of [FINNLEY] in a cozy miniature living room, sitting in a small armchair with a cup of tea, completely peaceful, timestamp-corner aesthetic without readable characters, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (verdict CTA, 4s):** `[FINNLEY] gripping the edge of the wooden dock, big pleading eyes to camera, [LUNA] beside him already stamping a document, split emotional register, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Shark Court is in session. The defendant is charged with looking too pointy. The defense notes he has no pockets. Verdicts accepted below: GUILTY or MISUNDERSTOOD. #SharkHumanAlliance #SharkCourt #FinnleyMako`

ALT TEXT: `A plush shark stands trial in a miniature courtroom for looking too pointy; his lawyer presents his lack of pockets as evidence.`

AUDIO: courtroom-drama strings, slightly too dramatic for plush sharks; or a trending "objection" sound.

PINNED COMMENT (paste as-is): `The defendant would like the record to show he was commuting.`

### R2.2 Wanted Archetype #1 (Reel B — funnel opens)

The joke: the Bureau opens actual cases on a human archetype everyone knows — and Luna hangs the poster with a tiny spirit level, because procedure.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `A case has been opened.` | Shot 1 |
| 2-9s | `WANTED:` / `the friend who says "shark-infested waters."` | Shot 2 (poster insert) |
| 9-16s | — (the level gag carries it) | Shot 3 |
| 16-22s | `The poster is free.` / `The Bureau is not made of money. The Bureau is made of paperwork.` | Shot 3 continues |
| 22-30s | `Know this human? Tag them.` / `Or open your own case — free, link in bio.` + `CASE OPENED` stamp (red) + small mono line `CASE № SHA-0001` | Shot 4 / end card |

SHOT PROMPTS:

- **Shot 1 (hook, 4s):** `top-down shot of a miniature Bureau desk, two plush shark fins sliding a thick red-labeled case folder into center frame, dramatic but cozy lighting, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (poster insert):** screen recording OR export of the actual site generator poster (`/wanted`) with the archetype name — this is product-true and needs no image-gen. Add the poster text in the generator itself.
- **Shot 3 (the level, 8s):** `[LUNA] pinning a vintage wanted poster to a cork board, then holding a tiny spirit level against it and adjusting the poster two millimeters, absolute focus, [FINNLEY] behind her holding three more rolled posters and vibrating with excitement, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (CTA, 4s):** `slow push-in on the cork board with three vintage wanted posters pinned in a neat row, one clearly newer, warm lamp light, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Some humans remain dangerously paperwork-free. The Bureau has opened a public reporting channel. Tag the accused, or open a case of your own — free, link in bio. #SharkHumanAlliance #WantedPoster`

ALT TEXT: `A teal plush shark pins a wanted poster for "the friend who says shark-infested waters" to a cork board, using a tiny spirit level.`

AUDIO: cozy detective/noir suspense.

PINNED COMMENT (paste as-is): `The accused may respond by opening a counter-case. The Bureau accepts filings in both directions.`

Continuity: this is case `SHA-0001`. It closes on camera in R4.2 — do not renumber.

Watch: `wanted_poster_generate`, `wanted_poster_share`, `wanted_accuse_back`.

### C2.3 Wanted Archetype #2 (Feed C — static poster)

4:5 image, pure paperwork mode (no mascots — per `mascot-model-sheet.md` social usage rule).

POSTER COPY (exact, set in the `wanted-case` template):

- Header: `WANTED` (red, Cinzel)
- Subject: `Watched a certain 1975 film once and has never trusted a lake since.`
- Charges (mono, form-style): `1. Slandering an entire species at a barbecue.` / `2. Pointing at fins that were dolphins.` / `3. Humming the two-note song at the beach. Twice.`
- Footer: `CASE № SHA-0002 · REPORT SIMILAR HUMANS AT THE LINK IN BIO` + `CASE OPENED` stamp (red)

BACKGROUND PROMPT (if regenerating the paper layer): `[PAPERSTYLE], aged wanted-poster sheet with a deep brown outer frame (#3A2515), central empty silhouette area, distressed edges` — Negative: `[NEG]`. Silhouette stays neutral — never a real face.

CAPTION (final): `The Bureau does not name names. The Bureau simply files posters and waits. Tag the subject if the description fits — or open your own case, link in bio. #SharkHumanAlliance #WantedPoster`

ALT TEXT: `A vintage wanted poster for a human who watched a certain 1975 film once and has never trusted a lake since, with three formal charges.`

FUTURE ARCHETYPES (one per fortnight, rotate): refuses to swim past waist depth; announces "something touched my leg" annually; watches shark documentaries "for safety reasons"; brings a floatie as a legal defense; checks the water for fins from the parking lot.

---

## WEEK 3 — Repeatable Series + The Gravitas Beat

### R3.1 Older Than Trees (Reel A — gravitas, no jokes)

One of the most-shared shark facts on the internet — which is exactly why it gets video treatment, not a static. No stamps, no mascots, no gags. Quiet piano or ambient audio.

TIMING & ON-SCREEN TEXT (slow card sequence, Cinzel + Cormorant):

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-3s | `450 MILLION YEARS` | Shot 1 |
| 3-8s | `Sharks are older than trees.` | Shot 1 continues |
| 8-16s | `Sharks and their ancient relatives have a fossil record stretching back about 450 million years — before the first trees existed.` | Shot 2 |
| 16-22s | `SOURCE — NATURAL HISTORY MUSEUM` | Shot 2 continues |
| 22-28s | `The Bureau would like them to stay.` | Shot 3 |

SHOT PROMPTS (textless backgrounds; all text added in edit):

- **Shot 1 (8s):** `extremely slow push-in over deep dark ocean water surface at dusk, minimal, austere, navy and black palette, faint light rays underwater, no animals visible, cinematic, vertical 9:16, no text` — Negative: `[NEG]`
- **Shot 2 (8s):** `slow drift across an ancient fossil texture in stone, ammonite and sediment layers, museum-lighting mood, navy-tinted shadows, macro detail, vertical 9:16, no text` — Negative: `[NEG]`
- **Shot 3 (6s):** `a single small shark silhouette swimming calmly in vast open blue water, seen from distance, peaceful, immense negative space, vertical 9:16, no text` — Negative: `[NEG]`

CAPTION (final, per original spec): `A factual entry, not a joke. Sharks were here before trees. The Bureau would like them to stay. #SharkFacts #SharkConservation #SharkHumanAlliance`

ALT TEXT: `Slow, quiet video card sequence: sharks have existed for about 450 million years — longer than trees.`

AUDIO: quiet piano or ambient pad. No trending sounds on this one.

PINNED COMMENT: none. Keep this comment section quiet; reply plainly (not in character) to questions.

### R3.2 Luna Redacts (Reel B — character via action)

The joke: Finnley's three-page press release survives contact with Luna as a single word. Even his signature heart gets redacted.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `Luna Reef will now review Finnley's press release.` | Shot 1 |
| 2-9s | — (handover + first strike-throughs) | Shot 1-2 |
| 9-16s | — (marker sounds carry it; escalating speed) | Shot 2 |
| 16-20s | `What survived:` / `"Filed."` | Shot 3 |
| 20-24s | `Even the heart. Especially the heart.` + `REDACTED` stamp | Shot 3 continues |
| 24-30s | `Comment one word Finnley should be allowed to keep.` | Shot 4 |

SHOT PROMPTS:

- **Shot 1 (handover, 5s):** `[FINNLEY] proudly presenting a comically long document that unrolls off the desk and onto the floor, beaming, [LUNA] receiving it with both fins and zero expression, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (redaction montage, 8s):** `extreme close-up of plush shark fins redacting a document with a thick black marker, line after line disappearing under black bars, methodical then faster, paper texture visible, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (the survivor, 6s):** `a mostly-black redacted document held up to camera, one tiny unredacted spot near the bottom, then a fin redacts one final small doodle in the corner, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (aftermath, 4s):** `[FINNLEY] staring at the redacted page in devastated disbelief, fin over his heart, [LUNA] already filing the document into a drawer, serene, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Finnley wrote three pages. Luna reviewed them. One word survived. Comment one word Finnley should be allowed to keep. #SharkHumanAlliance #LunaReef #FinnleyMako`

ALT TEXT: `A teal plush shark redacts a blue plush shark's three-page press release down to the single word "Filed."`

AUDIO: marker squeaks and page turns, ASMR-leaning; or a trending "getting ready" sound under the montage.

PINNED COMMENT (paste as-is): `Luna has reviewed this comment section in advance. Several of you are already redacted.`

### C3.3 Field Report (Feed C — asset already produced)

Reuse the produced graphic from `posts/week-3-post-3-field-report.md` unchanged. New caption: `Finnley filed a field report. Luna is reviewing it. Forward this to the undocumented human in your life. Verdict below: THOROUGH or CONCERNING? #SharkHumanAlliance`

---

## WEEK 4 — Loops Reinforced + First Soft Product Hint

CTA ladder stays at step 3-4 (`strategy.md`): free tool primary, "close the case with paperwork" as narrative resolution. No price, no urgency, no discount language.

### R4.1 Human Training Program, Lesson 1 (Reel A)

The joke: sharks run a corporate-training seminar for humans, whiteboard and all. Callback to R1.2 for followers; complete on its own for everyone else.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `HUMAN TRAINING PROGRAM` / `Lesson 1: stop calling our home infested.` | Shot 1 |
| 2-9s | `infested` → struck through → `inhabited` → struck through → `correctly staffed` | Shot 2 + overlays |
| 9-16s | `Attendance today:` / `zero humans. The Bureau remains optimistic.` | Shot 3 |
| 16-22s | `The Bureau remains optimistic that shark-human relations can be improved administratively.` | Shot 3 continues |
| 22-30s | `Open a case on the human who needs Lesson 1 — free, link in bio.` + `PENDING` stamp | Shot 4 / end card |

SHOT PROMPTS:

- **Shot 1 (classroom, 5s):** `[LUNA] standing beside a miniature whiteboard on wheels with a wooden pointer, teacher energy, tiny classroom with empty small chairs, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (whiteboard, 7s):** `close-up of a plush fin crossing out writing on a miniature whiteboard and writing beneath it, marker squeak energy, blank scribble shapes instead of readable words, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (empty room, 7s):** `reverse shot of the miniature classroom: all tiny chairs empty, [FINNLEY] alone in the front row taking enthusiastic notes, [LUNA] at the whiteboard unbothered, [STYLE]` — Negative: `[NEG]`
- **Shot 4 (CTA, 4s):** `[LUNA] placing a single sheet titled with a blank header into an outbox tray labeled with a blank label, tidy, final, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Lesson 1 of the Human Training Program has concluded. Attendance: zero humans, one extremely supportive colleague. Enrollment for Lesson 2 opens in the comments. Open a case on the human who needs Lesson 1 — link in bio. #SharkHumanAlliance`

ALT TEXT: `A teal plush shark teaches "Lesson 1: stop calling our home infested" to an empty miniature classroom; a blue plush shark takes notes alone in the front row.`

AUDIO: gentle corporate-training muzak.

PINNED COMMENT (paste as-is): `Lesson 2 ("not every fin is a threat") begins once enrollment reaches one (1) human.`

### R4.2 Verdict Day — Case SHA-0001 Closed (Reel B — soft bridge)

The joke: the archetype case from R2.2 finally resolves. Verdict: guilty of operating without paperwork. Sentence: paperwork. One-shark standing ovation. First time the certificate exists on screen — as resolution, not ad.

TIMING & ON-SCREEN TEXT:

| Time | On-screen text (exact) | Visual |
| --- | --- | --- |
| 0-2s | `VERDICT DAY.` / `Case SHA-0001: the friend who says "shark-infested waters."` | Shot 1 |
| 2-8s | `Verdict: GUILTY of operating without shark-facing paperwork.` | Shot 1 continues |
| 8-15s | `Sentence: paperwork.` | Shot 2 |
| 15-20s | `The human is now, administratively, no longer a snack.` + `CASE CLOSED` stamp (gold) | Shot 2 continues |
| 20-25s | — (single clap gag) | Shot 3 |
| 25-30s | `Open a case. Some of them close.` / `Free, link in bio.` | End card |

SHOT PROMPTS:

- **Shot 1 (verdict, 6s):** `miniature courtroom, [FINNLEY] as judge with a tiny gavel far too small for the moment, striking it with maximum ceremony, [STYLE]` — Negative: `[NEG]`
- **Shot 2 (ceremony, 7s):** adapt the existing asset `public/mascots/case-closed-share.png` (this exact scene) — animate with image-to-video: `two plush sharks formally presenting an ornate certificate document toward the camera, ceremonial, proud, warm light, [STYLE]` — Negative: `[NEG]`
- **Shot 3 (single clap, 5s):** `[LUNA] delivering exactly one slow clap, then returning her fins to a folded resting position, [FINNLEY] wiping away a tear with a tiny handkerchief, [STYLE]` — Negative: `[NEG]`

CAPTION (final): `Case SHA-0001 is closed. Verdict: guilty of operating without shark-facing paperwork. Sentence: paperwork. The human is now, administratively, no longer a snack. Open a case of your own — free, link in bio. #SharkHumanAlliance #WantedPoster`

ALT TEXT: `A plush shark judge finds a human guilty of operating without paperwork; the sentence is paperwork, a certificate is ceremonially presented, and one shark delivers a single slow clap.`

Conservation gate (`strategy.md` filter #6): no present-tense "the conservation is real" claim without a citable allocation — forward commitment phrasing only.

AUDIO: ceremonial brass, slightly too grand for the size of the gavel.

PINNED COMMENT (paste as-is): `The certificate is real, in the sense that it is really a certificate.`

### C4.3 PSA — Resume (Feed C)

Reuse `posts/week-4-post-1-psa-resume.md` unchanged (retro PSA poster, `PUBLIC NOTICE`). Caption per spec + `Share with a human currently updating their resume.`

---

## Trend Slot Playbook (evergreen adapters)

Keep one slot/week for a current sound/format. Three adapters that always work in Bureau voice:

1. **"POV / interview" audio** → intern interview at the Bureau: `Finnley interviews a new intern. The only question is "how do you feel about paperwork."`
2. **"Explaining my job to my family" format** → `I regulate shark-human misunderstandings. No, it does not pay in fish.`
3. **Any dramatic-reveal sound** → drawer opens to reveal… another form. `The Bureau has located the missing paperwork. It was paperwork all along.`

Rules: trend audio + Bureau text overlay + one plush shot is enough; do not force a fact beat into trend posts; `crisis.md` check applies.

## Week 5 Preview (decide at week-4 checkpoint)

Priority order: accuse-back beat (`Subject filed a counter-report. The Bureau is now uncomfortable in both directions.` — drives `wanted_accuse_back`) → gift/sealed-reveal beat (reuse `posts/week-5` drafts, `from=social_gift`) → Shark Court #3 built from audience-submitted charges → first registry beat if opt-in entries exist.

## Measurement Checkpoints

- **End of week 2:** completion rate + avg watch time per format (PR vs Correction vs Court). Kill or fix the weakest, double the strongest. Site-side: first `wanted_poster_generate` with `from=social_wanted`.
- **End of week 4:** is Wanted earning generates/shares? If yes → week 5 leans accuse-back + gift. If no → fix the free-tool CTA before any certificate push.
- Follower count is secondary to: completion rate, comments/reach, `wanted_poster_generate`, `wanted_poster_share`.

## Production Checklist (per week)

1. Fact copy verbatim from `sources.md` — video text cards included.
2. Mascot shots checked against `mascot-model-sheet.md` references; regenerate on drift.
3. Reels: 9:16, burned-in captions, hook readable muted in frame 1; generators produce NO text — typography in edit only.
4. Post natively to IG Reels AND TikTok; no watermarked cross-posts. Optional YouTube Shorts.
5. Alt text (provided per card) attached to every post.
6. `crisis.md` check before scheduling any humor or Wanted post.
7. Max 3-5 hashtags; searchable keywords in caption line 1 and on-screen text.
8. Every off-platform link carries canonical `from=` (`social_wanted`, `social_gift`, `social_bio`).
9. Reply in character (playful) or plainly (serious) per `voice.md`; audience corrections and verdicts feed future episodes; pin one in-world comment per Reel.
