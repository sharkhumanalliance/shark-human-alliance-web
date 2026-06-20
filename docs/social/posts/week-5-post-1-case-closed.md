# Week 5, Post 5.1 — Case SHA-0001 Closed

Status: Spec ready. Character-driven; an approved asset already exists and can be adapted (`public/mascots/case-closed-share.png`).
Slot: Week 5, Tue 20:00 (CET). Channel: IG + FB. Pillar: Product bridge. Mode: Character-driven (Finnley + Luna). CTA: **Close the case with paperwork** (soft conversion — CTA ladder step 4).

> **Phase + payoff.** Week 5 opens the Soft-Conversion phase (`strategy.md`). 5.1 is the direct payoff of 4.3: the first Wanted case the public could open (SHA-0001) is now **closed** — with a certificate. The product appears as administrative resolution, never as ad copy. Stay at CTA ladder step 4 ("close the case with paperwork"); do **not** use the hard step 5 ("file shark paperwork") or any discount language yet.

---

## 1. Visual concept — the case closes (reuse the existing asset)

This is exactly the scene the brand already has: `public/mascots/case-closed-share.png` — Finnley + Luna, a `WANTED → RESOLVED` poster, `PROTECTION GRANTED` / `CASE CLOSED` stamps, "Your shark status has been officially improved." **Adapt that asset** rather than generating from scratch: it is on-model, both mascots are present (mascot beat ✓), and reusing it ties the post to the product world the site already uses.

Minimal changes to make it this post:
- Add/!-swap a case number so it reads **`CASE NO. SHA-0001 — CLOSED`** (continuity with 4.3's opened SHA-0001).
- Keep `CASE CLOSED` / `PROTECTION GRANTED` stamps. One or two stamps max (this is the one moment escalation is allowed, per `brand-kit.md`).
- Keep it warm and celebratory — this is Finnley's happy ending, Luna quietly approving.

If a fresh generation is needed, see §3. Otherwise the existing asset + a case-number overlay is the fastest, most on-brand route.

Format exports: 4:5 feed (primary), 9:16 Story (with link sticker — recovers the IG click), 1:1 optional.

---

## 2. Copy (exact strings)

**On the visual:**
- `CASE NO. SHA-0001 — CLOSED`
- `PROTECTION GRANTED` (stamp)
- `CASE CLOSED` (stamp)
- Optional line: `SHARK STATUS: OFFICIALLY IMPROVED`

**IG caption (primary):**
```
Case SHA-0001 is closed. One human, formerly paperwork-free, is now officially documented and,
administratively, no longer a snack. Finnley is delighted. Luna has initialed it without comment.
Other cases remain open.
```

**CTA line:** `Close the case with paperwork — link in bio.` (IG) / `Close the case with paperwork: https://sharkhumanalliance.com/purchase?from=social_wanted` (FB)

**FB caption:**
```
The Bureau is pleased to report that Case SHA-0001 has been closed. The human in question has
been issued official paperwork and is now, administratively, no longer a snack. Their shark
status has been improved on the public record.

This is how a case closes: not with enforcement — the Bureau has none — but with paperwork.
Other cases remain open. If you have opened one (or had one opened on you), it can be closed
the same way.

Close the case with paperwork: https://sharkhumanalliance.com/purchase?from=social_wanted

The Alliance is fictional. Proceeds will fund real shark conservation.
```

---

## 3. AI generation — only if not reusing the asset (text baked in)

Prefer adapting `case-closed-share.png`. If generating fresh, keep both mascots on-model and the certificate/stamps legible.

> **Reference images:** `public/mascots/case-closed-share.png` (the target composition) and `public/mascots/homepage-hero-plush.png` (character reference).

**Prompt:**
```
Two soft plush chibi shark ambassadors celebrating a closed case: a friendly blue shark
(#4A9BE8, slightly larger) holding an official certificate, and a teal shark (#5BC4BF, slightly
smaller, coral flower over one eye, coral scarf, gold star badge, no glasses, calmly pleased).
Between them, a "WANTED — UNPROTECTED HUMAN" poster overstamped "RESOLVED", and stamps reading
"PROTECTION GRANTED" and "CASE CLOSED". A small case number "CASE NO. SHA-0001 — CLOSED".
Warm Bureau office scene, navy-and-cream palette with coral warmth, cream certificate paper,
gentle lighting, tactile not plastic, no scary teeth, no aggression, mobile-readable. 4:5.
```

**Append the model-sheet base add-on** (see `mascot-model-sheet.md`) and **negative prompt:**
```
scary shark, aggressive teeth, blood, horror, wrong colors, blue Luna, reading glasses,
missing Luna flower/scarf/badge, frantic expression, real human face on the poster, harsh
neon, plastic 3D, garbled text, discount or price text
```

Hard checks: Finnley blue + larger; Luna teal + smaller + flower/scarf/badge + no glasses; poster uses a neutral silhouette (no real face); stamps and case number legible; **no price/discount text anywhere**.

---

## 4. Caption — options + recommendation

1. ★ **Recommended (blended — funnier, keeps the continuity)** — `Case SHA-0001 is closed. One human, formerly paperwork-free, is now officially documented and, administratively, no longer a snack. Finnley is delighted. Luna has initialed it without comment. Other cases remain open.`
2. (straighter Bureau tone) `Case SHA-0001 is closed. The human has been issued paperwork and is now, administratively, no longer a snack. The Bureau considers the matter resolved. Other cases remain open.`
3. `SHA-0001: resolved. The Bureau closes cases the only way it can — with paperwork.`

**Recommendation: 1.** Leads with the funnier Finnley/Luna two-hander ("delighted" / "initialed it without comment") while keeping the SHA-0001 payoff, the "no longer a snack" line, and the soft "Other cases remain open" pull. Use **2** for a straighter Bureau tone, or **3** for the tightest line.

---

## 5. Alt text + hashtags

**Alt text:**
```
The blue plush shark Finnley and the teal plush shark Luna celebrate beside a "WANTED —
UNPROTECTED HUMAN" poster stamped RESOLVED, with PROTECTION GRANTED and CASE CLOSED stamps and
a certificate. A label reads "Case No. SHA-0001 — Closed." Warm, official, no real faces.
```

**Hashtags (5 stable + rotating):**
```
#SharkHumanAlliance #SharkConservation #SharkFacts #OceanConservation #SaveTheSharks #NotASnack
```

---

## 6. Pre-publication checklist

- [ ] If reusing `case-closed-share.png`: case number overlaid as `SHA-0001 — CLOSED`; otherwise mascots on-model per §3.
- [ ] Mascot check: Finnley blue/larger; Luna teal/smaller/flower+scarf+badge/no glasses.
- [ ] **No price, no discount, no "buy now"** — product framed only as "close the case with paperwork" (CTA ladder step 4, not step 5).
- [ ] Wanted poster on the visual uses a neutral silhouette, never a real face.
- [ ] Link mechanic set: IG bio link `https://sharkhumanalliance.com/purchase?from=social_wanted` + "link in bio"; FB links directly; optional Story link sticker.
- [ ] `from=social_wanted` attribution confirmed on `/purchase` (CLAUDE.md documents `/purchase` reads/persists `from` — lower risk than the `/wanted` case, but verify).
- [ ] Conservation line stays forward-commitment unless a real allocation figure/named org exists (strategy Decision Filter #6).
- [ ] One or two stamps max; angle −12…+12°.
- [ ] Hashtags = 5 stable + 1 rotating. Alt text written. `crisis.md` scanned.

---

## 7. Engagement guidance (comments)

Mixed voices: Finnley celebratory, Luna dry. Plain tone for genuine questions/distress (`voice.md` / `crisis.md`).

- "How do I close mine?" → warm, in-world: `File the paperwork and the case closes itself. Link in bio.` (point to the certificate without hard-selling).
- "Is this a real charity?" → answer plainly and honestly about the conservation allocation; do not overstate (Decision Filter #6). Never imply the product provides real safety.
- "My friend opened a case on me!" → `The accused may close the case with paperwork, or file a counter-case. The Bureau is impartial.` (seeds 5.2 accuse-back and 5.3 gifting).
- Real shark-incident or distress → `crisis.md`, no humor.

> Forward link: 5.1 (close your own case) → 5.2 (accuse-back) → 5.3 (gift a closed case for someone else). Keep SHA-0001 as the canonical "first closed case"; future closures increment.
