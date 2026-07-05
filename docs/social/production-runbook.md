# Production Runbook — "Give me the next post"

Last updated: 2026-07-01

Purpose: let ANY assistant (including a simpler model) produce a complete, correct production package for the next post with zero creative decisions. Everything needed is already written down; the assistant's only job is to find, expand, and assemble it.

## Where things live

| What | File |
| --- | --- |
| Post order + status | `editorial-calendar-4-weeks.md` → **Publication Log** table |
| Full production card per post | `editorial-calendar-4-weeks.md` → the post's section |
| Prompt blocks `[FINNLEY]` `[LUNA]` `[STYLE]` `[NEG]` `[PAPERSTYLE]` | `editorial-calendar-4-weeks.md` → **PRODUCTION SYSTEM** section |
| Approved fact wording + citations | `sources.md` |
| Caption/voice rules, forbidden phrases | `voice.md` |
| Mascot look guardrails | `mascot-model-sheet.md` |
| Colors, fonts, stamps, templates | `brand-kit.md`, `assets/asset-briefs.md` |
| Humor pause check | `crisis.md` |
| Reused older specs | `posts/*.md` (linked from each card) |

Status tracking: after publishing, edit the Publication Log row status to `Published` (+ date). "Next post" = the first row from the top whose status is not `Published`.

## Procedure (deterministic)

1. Open `editorial-calendar-4-weeks.md`, read the Publication Log, pick the first non-Published row.
2. Go to that post's production card.
3. Expand every `[BLOCK]` placeholder in the shot prompts by copying the block text **verbatim** from the PRODUCTION SYSTEM section. The result must contain no square-bracket placeholders.
4. If the card references another spec (`posts/*.md`) or an existing asset, open it and pull the final copy from there.
5. If the card contains a fact, verify the exact wording exists in `sources.md`. If it does not, output `BLOCKED: wording not in sources.md` instead of improvising.
6. Assemble the output package in the exact format below. Copy all on-screen text, captions, and alt text **character-for-character** — no paraphrasing, no "improving".

## Output package format (always this, in this order)

```
POST: <id + name> | <format> | <week/slot>
STATUS GATES:
- crisis.md checked? (instruct user)
- facts in sources.md? (state yes/no + which)
- link carries from=? (state the exact URL, or "no link in this post")
SHOTS:
<for each shot: duration, FULL expanded prompt, FULL negative prompt,
 or the non-genAI instruction (screen recording / existing asset / template)>
ON-SCREEN TEXT: <the card's timing table, verbatim>
ASSEMBLY: <edit steps: clip order, fonts per brand-kit, which stamp PNG, audio note>
CAPTION (paste as-is): <verbatim>
ALT TEXT (paste as-is): <verbatim>
PINNED COMMENT (paste as-is): <verbatim, or "none">
COVER: <which frame; confirm text sits inside the central 4:5 zone>
FINAL QA (state pass/fail per line):
- no [BLOCK] placeholders left unexpanded in any prompt
- every stamp referenced exists in brand-kit.md's stamp set / assets/stamps/png
- captions, on-screen text, alt text, pinned comment copied character-for-character
- facts verbatim in sources.md
- case numbers match the card's continuity notes
AFTER PUBLISHING: mark the Publication Log row Published + post the pinned comment.
```

## Master prompt (paste this into the assistant)

> Read `docs/social/production-runbook.md` and follow its Procedure exactly. Then read `docs/social/editorial-calendar-4-weeks.md`, find the next non-Published post in the Publication Log, and output the complete production package in the runbook's Output package format. Expand all prompt blocks verbatim from the PRODUCTION SYSTEM section. Copy captions, on-screen text, and alt text character-for-character. Do not invent facts, jokes, hashtags, or copy — if anything required is missing from the files, say exactly what is missing instead of improvising.

## Hard rules for the assistant

- Never write a new fact, statistic, or source. `sources.md` or nothing.
- Never rewrite captions or on-screen text. They are final.
- Never generate typography inside image/video generators — text is added in edit (Canva/CapCut), per the calendar's PRODUCTION SYSTEM.
- Never use phrases from the `voice.md` forbidden list, even in helper text.
- If two files conflict, `editorial-calendar-4-weeks.md` wins for post content; `sources.md` wins for facts; `crisis.md` wins over everything (it can pause a post).
