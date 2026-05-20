# Social Asset Briefs

This file explains what each generated graphic asset is for, how it should look, and what size to use when rebuilding it in Canva, Figma, Midjourney, Flux, DALL-E, or another image tool.

SVG and PNG pairs represent the same asset. Use SVG when editing layout or text. Use PNG when placing the asset into a design tool that does not need vector editing.

## Shared Format Rules

Feed format: `1080 x 1350 px`, portrait `4:5`. Use for the main Instagram feed and most Facebook image posts.

Square format: `1080 x 1080 px`, `1:1`. Use as a safe fallback for cross-posting, profile grids, and platforms that crop aggressively.

Story format: `1080 x 1920 px`, `9:16`. Use for Instagram Stories, Reels covers, and vertical story-style notices.

Stamp format: `1400 x 560 px`, transparent background. Use as an overlay, not as a full post.

Texture format: `1080 x 1350 px`. Use as a background layer; crop or scale for square/story variants.

Component formats: `sha-bureau-header` is `1080 x 150 px`; `source-line` is `1080 x 90 px`.

Visual baseline: cream paper, navy ink, muted red/gold stamps, serif headlines, monospace administrative labels, no emoji, no glossy gradients, no loud ocean-turquoise palette.

## Stamps

Files live in:

- `stamps/svg/*-{navy,red,gold}.svg`
- `stamps/png/*-{navy,red,gold}.png`

Each stamp should look like a slightly imperfect rubber-office stamp: rectangular border, inner dashed border, condensed bold text, small rotation, visible ink feel, transparent background. Navy is the default official mark, red is urgent/comedic, gold is product/conversion/status.

### FILED

Files: `filed-{navy,red,gold}.{svg,png}`

Purpose: generic approval and default Bureau signature.

Look: short, compact stamp with strong legibility. It should feel routine and bureaucratic, not dramatic.

Use when: a memo, public notice, fact post, or ordinary administrative statement has been "processed."

Why: this is the most reusable mark; it turns simple text posts into branded paperwork.

### REVIEWED

Files: `reviewed-{navy,red,gold}.{svg,png}`

Purpose: Luna-adjacent approval mark.

Look: calm and precise. Avoid chaotic distressing; this stamp should feel like somebody checked the document.

Use when: Luna has implicitly approved, shortened, or inspected a post.

Why: it lets the brand imply character presence without always showing Luna.

### REDACTED

Files: `redacted-{navy,red,gold}.{svg,png}`

Purpose: redaction and mystery gag.

Look: official, slightly severe, ideally paired with black bars or removed text.

Use when: Luna removes most of a document, a statement is censored, or a joke depends on withheld information.

Why: redaction is a repeatable visual joke and gives the feed a recognizable Bureau language.

### PENDING

Files: `pending-{navy,red,gold}.{svg,png}`

Purpose: unresolved case or field report status.

Look: neutral, not alarming. It should feel like paperwork waiting in a tray.

Use when: Finnley files observations, decisions are delayed, or the Bureau is "reviewing" a beach situation.

Why: creates forward motion without forcing a hard punchline.

### NO OBJECTIONS RECEIVED

Files: `no-objections-received-{navy,red,gold}.{svg,png}`

Purpose: dry approval gag.

Look: longer official stamp; text must remain readable. Best used large enough that it does not blur.

Use when: the Bureau interprets silence from sharks as consent.

Why: turns absence of reply into a recurring bureaucratic joke.

### CASE OPENED

Files: `case-opened-{navy,red,gold}.{svg,png}`

Purpose: start of a wanted/case narrative.

Look: firmer and more active than `PENDING`. Red works well for wanted visuals.

Use when: a user, beachgoer, or fictional offender enters the Bureau case system.

Why: it supports the wanted poster funnel and gives user-generated content a procedural frame.

### CASE CLOSED

Files: `case-closed-{navy,red,gold}.{svg,png}`

Purpose: completion and payoff.

Look: decisive, satisfying, ideally in navy or gold.

Use when: a wanted case is resolved, a certificate is issued, or a user completes a product action.

Why: it makes conversion feel like story resolution, not a sales CTA.

### PROTECTION GRANTED

Files: `protection-granted-{navy,red,gold}.{svg,png}`

Purpose: product/status stamp.

Look: premium and affirmative. Gold is the most natural variant.

Use when: someone receives a certificate or a case is upgraded into official-ish protection.

Why: it bridges the joke to the paid certificate without breaking the Bureau voice.

### OBJECTION DENIED

Files: `objection-denied-{navy,red,gold}.{svg,png}`

Purpose: stronger comedy response.

Look: firm, slightly absurd, but not aggressive.

Use when: the Bureau dismisses a silly complaint, not genuine criticism.

Why: gives the account a sharper running gag while keeping the tone institutional.

### FORWARD TO LUNA

Files: `forward-to-luna-{navy,red,gold}.{svg,png}`

Purpose: character workflow stamp.

Look: internal routing mark, like something placed on a document before review.

Use when: Finnley creates a problem and Luna must review it.

Why: builds the Finnley/Luna relationship without overexplaining it.

### RETURNED - RECIPIENT UNREACHABLE

Files: `returned-recipient-unreachable-{navy,red,gold}.{svg,png}`

Purpose: returned mail gag.

Look: official postal/bureau rejection mark; red is the strongest default.

Use when: a letter to sharks, the ocean, or an unreachable recipient comes back.

Why: this is one of the strongest shareable concepts because the joke is visual and immediate.

## Paper Textures

Files live in `textures`.

### Clean Paper

Files: `clean-paper.{svg,png}`

Size: `1080 x 1350 px`

Purpose: base background for polished notices, statements, and fact cards.

Look: warm cream paper, subtle fiber, minimal stains, enough texture to avoid flat Canva-beige.

Why: gives all posts a consistent physical-paper world.

### Stained Paper

Files: `stained-paper.{svg,png}`

Size: `1080 x 1350 px`

Purpose: background for field reports, returned letters, old files, and slightly chaotic Bureau scenes.

Look: cream paper with ink stains, soft aging, faint irregular marks. It should still look premium, not dirty.

Why: adds narrative wear when a post needs more atmosphere.

### Ledger Paper

Files: `ledger-paper.{svg,png}`

Size: `1080 x 1350 px`

Purpose: background for statistics, receipts, checklists, source-backed facts, and allocation posts.

Look: cream paper with faint horizontal and vertical ledger/grid lines.

Why: makes factual posts feel documented and accountable rather than meme-like.

## Components

Files live in `components`.

### SHA Bureau Header

Files: `sha-bureau-header.{svg,png}`

Size: `1080 x 150 px`

Purpose: reusable top header for memos, public notices, internal documents, and multi-slide carousels.

Look: small SHA mark, monospace institutional label, serif Bureau title. It should feel like a letterhead, not a logo lockup.

Why: keeps layouts consistent without forcing every graphic to carry a large logo.

### Source Line

Files: `source-line.{svg,png}`

Size: `1080 x 90 px`

Purpose: reusable source/citation footer for factual posts.

Look: thin separator line and small monospace source text.

Why: protects credibility. Factual posts must be visibly sourced because the brand says the conservation side is real.

## Social Templates

Template files live in:

- `templates/svg/{template}-{feed,square,story}.svg`
- `templates/png/{template}-{feed,square,story}.png`

Available sizes:

- `feed`: `1080 x 1350 px`
- `square`: `1080 x 1080 px`
- `story`: `1080 x 1920 px`

### Bureau Memo

Files: `bureau-memo-{feed,square,story}.{svg,png}`

Purpose: standard announcement format.

Look: cream paper sheet, small administrative kicker, large serif title, short memo body, one stamp near the lower half. Keep the composition quiet and official.

Use for: account opening, weekly memos, small updates, policy jokes, "the Bureau has reviewed..." posts.

Why: this is the core format. It makes the account feel like a fictional institution rather than a random meme page.

### Public Notice Stat Card

Files: `public-notice-stat-card-{feed,square,story}.{svg,png}`

Purpose: fact-led conservation post.

Look: one huge statistic, short explanatory line, source footer, `FILED` stamp. The statistic should dominate; the layout should feel like a public record.

Use for: shark mortality, threatened species, shark bite fatality context, donation/allocation facts.

Why: balances humor with legitimacy. This is where the project proves the real-world mission.

### Wanted Case

Files: `wanted-case-{feed,square,story}.{svg,png}`

Purpose: acquisition and soft-conversion bridge.

Look: wanted poster / case file hybrid. Red `WANTED`, strong border, central subject area, `CASE OPENED` stamp. Add a name or simple subject portrait when used in production.

Use for: wanted poster funnel, user-shareable cases, "operating without shark-facing paperwork" jokes.

Why: it is free, viral, and naturally points toward certificate purchase without starting as a hard sell.

### Finnley Statement

Files: `finnley-statement-{feed,square,story}.{svg,png}`

Purpose: character quote format for Finnley.

Look: mascot portrait/cutout on the left or upper area, quote on the right, `REVIEWED` stamp. Finnley should feel diplomatic, optimistic, and slightly official.

Use for: Finnley quotes, press spokesperson posts, gentle corrections about sharks.

Why: makes Finnley a recurring voice rather than only a visual mascot.

### Luna Redacted

Files: `luna-redacted-{feed,square,story}.{svg,png}`

Purpose: redaction/document gag for Luna.

Look: formal document with large title, black redaction bars, tiny surviving fragments of text, `REDACTED` stamp.

Use for: quarterly statements, internal reviews, "Luna removed most of this" jokes.

Why: creates a strong, repeatable Luna format without requiring a new mascot pose every time.

### Field Report

Files: `field-report-{feed,square,story}.{svg,png}`

Purpose: observational beach/world posts.

Look: note-like document, timestamped copy, understated stamp. It may use stained paper or ledger texture.

Use for: Finnley reports, beach observations, public behavior jokes, early story world-building.

Why: it turns ordinary situations into Bureau paperwork and supplies low-cost recurring content.

### Conservation Receipt

Files: `conservation-receipt-{feed,square,story}.{svg,png}`

Purpose: donation/product transparency.

Look: receipt-like paper card, clear `$1` amount, short explanation, source/allocation footer, `REVIEWED` stamp.

Use for: explaining that each Protected Friend sale contributes to conservation, donation reports, allocation posts.

Why: it makes the commercial side feel accountable and avoids vague "we support charity" language.

### Case Closed / Product Bridge

Files: `case-closed-product-bridge-{feed,square,story}.{svg,png}`

Purpose: soft conversion after wanted/case content.

Look: official case resolution notice, gold or navy `PROTECTION GRANTED` stamp, concise copy. It should feel like completion, not an ad.

Use for: moving from wanted poster to certificate, announcing certificate availability, post-purchase share graphics.

Why: converts through narrative payoff instead of generic sales pressure.

### Press Conference

Files: `press-conference-{feed,square,story}.{svg,png}`

Purpose: larger announcements and launch moments.

Look: official statement layout with mascot area and quote area. It should feel like Finnley is at a small institutional podium, even if the placeholder is simple.

Use for: launch updates, donation milestones, new feature announcements, serious-but-still-Bureau messages.

Why: gives important moments a branded format so they do not become off-style marketing posts.

## Mascot Assets To Add

The generated folder `mascots` is intentionally a placeholder.

Needed production assets:

- `finnley-transparent.png`: transparent cutout, high resolution, front or 3/4 view.
- `luna-transparent.png`: transparent cutout, high resolution, front or 3/4 view.
- `finnley-luna-duo-transparent.png`: both mascots together, no text.
- `finnley-reference-front.png`, `finnley-reference-three-quarter.png`, `finnley-reference-profile.png`.
- `luna-reference-front.png`, `luna-reference-three-quarter.png`, `luna-reference-profile.png`.
- optional expression set: calm, mildly offended, tired/reviewing.

Recommended size for transparent cutouts: at least `2000 px` on the longest side, transparent PNG.

Recommended size for reference sheets: `3000 x 2000 px` or larger, neutral background, no text baked into the character.

Purpose: keep AI-generated mascot scenes visually consistent with the existing approved mascot look.

Why: without references, image generators will slowly change body shape, eye color, accessories, and personality across posts.

## Rebuilding Assets In Image Tools

For AI image tools, generate backgrounds and mascot scenes without important text whenever possible. Add final typography, citations, and stamps in Canva/Figma/SVG afterward.

For Canva/Figma, treat these generated SVGs as layout guides. Replace placeholder copy and mascot circles with final cutouts, then export the platform-specific format.

For factual posts, always copy the exact source wording from `docs/social/sources.md` and keep a visible source line in the graphic.
