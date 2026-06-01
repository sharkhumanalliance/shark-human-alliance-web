# Social Strategy

Last updated: 2026-05-31

## Positioning

Shark Human Alliance is not a generic shark meme page and not a normal conservation NGO account.

It is:

> A fictional bureaucracy issuing official-ish shark paperwork, with a real conservation allocation behind the joke.

The audience should first understand the world, then the characters, then the product.

## Campaign Goal

The first 6 weeks are not primarily about immediate purchase volume.

The goal is to:

1. Make the brand voice legible: dry bureaucracy, official-ish paperwork, real shark conservation.
2. Establish Finnley Mako and Luna Reef as recurring characters.
3. Build trust that the conservation part is not pretend.
4. Use the free Wanted Poster as the bridge from awareness to product.

## Phases

| Phase | Weeks | Posts | Goal | Conversion Role |
| --- | ---: | ---: | --- | --- |
| Bureau opens | 1-2 | 1-6 | Brand voice, post types, Finnley/Luna introductions | No hard sell; only profile link and soft curiosity |
| Bureau active | 3-4 | 7-12 | Field reports, redactions, facts, repeating Bureau mechanics | End of week 4 introduces first Wanted CTA |
| Soft conversion | 5-6 | 13-18 | Wanted Poster to certificate bridge | Product appears as case closure, not ad copy |
| Sustained | 7+ | 19+ | Rotating pillars, facts, characters, launches, milestones | Occasional conversion spikes and retargeting |

## Conversion Timing

Do not wait for 30-50 posts before mentioning the product. That is too cautious.

The first meaningful conversion bridge should appear around week 4, after roughly 12 posts. The strongest bridge is:

> Open a Wanted case -> share the accusation -> close the case with paperwork.

This preserves the joke while giving people a reason to reach the purchase page.

Harder product pushes can start after week 6, especially around:

- first visible audience response
- first public registry entries
- first conservation allocation progress
- seasonal beach/travel moments
- gift moments

Gifting and reciprocity (accuse-back) do not need to wait for the Sustained phase. They can run as soft beats from week 4-5, because both are already built into the site funnel.

## Measurement (tie social to the site GA funnel)

Judge social on the site's real funnel, not only platform vanity metrics:

- awareness -> `wanted_poster_generate`
- sharing -> `wanted_poster_share`, `wanted_accuse_back`
- intent -> `wanted_to_purchase_click`
- revenue -> `purchase`

Every off-platform link (bio, Story link sticker, swipe-up) must carry a canonical `from=` source so the site attributes the visit after the Stripe redirect: `from=social_wanted`, `from=social_gift`, `from=social_bio`. The site normalizes these via `lib/analytics-events.ts` into `sessionStorage["sha_attribution_source"]`. The week-4 and week-6 checkpoints below use these events, not just saves/replies.

## Language Policy

Start social EN-only for the first 4-6 weeks. The goal is to stabilize the visual system, post formats, and brand voice before doubling production work.

Add ES caption variants after the best-performing formats are clear. When ES starts, translate meaning and tone rather than posting literal copies.

The website remains EN/ES; this policy applies only to social publishing.

## Content Pillars

### A. Bureau Humor

Fake administration, memoranda, forms, stamps, redactions, case files.

Goal: curiosity, shares, "what is this account?"

Examples:

- Bureau Memo
- Field Report
- Form FIN-X update
- Luna redacted document
- No objections received

### B. Shark Facts And Mission

Real shark facts presented in Bureau language.

Goal: legitimacy, saves, trust, conservation value.

Rule: Every fact post must use approved wording and citation from `sources.md`.

### C. Characters

Finnley and Luna as recurring officials.

Goal: emotional memory and repeatable story hooks.

Finnley is the public-facing optimist. Luna is the quiet reviewer who redacts, initials, and occasionally refuses to comment.

### D. Product Bridge

Not "buy this certificate" as a standalone idea. Product appears as an administrative resolution:

- close the case
- file Form FIN-1
- improve shark-facing status
- enter the registry
- issue paperwork

## Growth Loops (site mechanics to seed)

The site has built-in loops the content should actively feed; ignoring them wastes the strongest acquisition the product already has.

- **Reciprocity (accuse-back):** an accused human can file a Wanted poster back. Seed it ("Subject filed a counter-report. The Bureau is now uncomfortable in both directions."). This is the share engine; measured by `wanted_accuse_back`.
- **Gifting + sealed reveal:** the site has a gift flow ending in a wax-seal reveal. Treat gifting as a primary use case (birthdays, "shark-free" holidays), not a late-phase afterthought. The reveal is shareable on its own.
- **Registry as social proof:** once opt-in entries exist, run a recurring "newly protected this week" beat with initial-only names.
- **UGC / seeding:** the Wanted generator IS content. Organic-from-zero is slow for a novelty product, so plan for amplifying the single best humor post and seeding a few creators to "open a case" on a friend, not only owned posts.
- **Channel fit:** the tag/accuse-back behavior is DM/Stories/TikTok-native, not feed-native. Weight Stories/Reels/TikTok for the viral mechanic; keep polished 4:5 feed for brand/world-building. Re-evaluate FB feed cost vs. payoff.
- **Career/referral:** referral ranks exist on the site; occasional posts can nod to rank progression.

## Weekly Mix

Baseline:

- 3 feed posts per week on Instagram.
- 2 feed posts per week on Facebook, usually adapted from Instagram with longer caption.
- 1-2 Stories per week from week 2.

Content rule:

> Each week needs at least one factual/mission post or one product-bridge post.

Do not force A/B/C rotation. Humor is the acquisition engine, so two humor posts in a row are allowed if the week still has a fact or bridge post.

Production reality: with a small team, prefer fewer, consistent posts (e.g. 2 IG/week) over the full IG+FB matrix. Consistency beats volume; batch-produce a week at a time.

## Platform Role

### Instagram

Primary grid and character-world building.

Best formats:

- 4:5 feed posts
- carousels for facts
- 9:16 story versions of Wanted/Bureau updates
- occasional Reels only when asset quality is high

### Facebook

Longer explanation and trust-building.

Best formats:

- adapted feed posts with longer captions
- impact updates
- product explanation framed as paperwork
- audience comments and shares from people buying gifts

## Stories

Stories start in week 2 at low density.

Use them for material too small for the feed:

- stamp closeups
- "Luna reviewed this"
- quick polls
- mini Bureau notices
- reposted Wanted posters
- behind-the-scenes desk shots

Avoid daily Stories until production becomes easy.

## Sensitivity

Before every publishing week, check [crisis.md](./crisis.md). If a fatal or serious shark incident is currently in the news cycle, pause humor and product-bridge posts.

## CTA Ladder

Use this order:

1. Follow/curiosity: "More notices will follow."
2. Engagement: "Send this to the unprotected human."
3. Free tool: "Open a Wanted case."
4. Soft conversion: "Close the case with paperwork."
5. Direct conversion: "File shark paperwork."

## Success Signals

Weeks 1-2:

- follow rate per reach
- profile visits
- comments that understand the joke
- saves on fact cards

Weeks 3-4:

- Wanted Poster visits
- shares
- story replies
- comments naming friends

Weeks 5-6:

- Wanted to purchase clicks
- checkout starts
- certificate purchases
- repeat comments around Finnley/Luna

Review checkpoints:

- End of week 2: keep/adjust visual templates, posting times, and first-line caption style.
- End of week 4: decide whether Wanted bridge is earning visits/shares; if not, improve the free-tool CTA before pushing certificates harder.

## Decision Filter

Before publishing a post, ask:

1. Is it funny, factual, character-building, or a product bridge?
2. Does it sound like the Bureau, not a normal brand account?
3. If it contains a fact, is the wording approved in `sources.md`?
4. If it uses Finnley or Luna, does it follow the model sheet?
5. Would this still make sense without explaining the joke in the caption?
6. If it claims real conservation, can it cite a real allocation number or a named recipient org with a committed %? If neither exists yet, do not publish "the conservation is real" as present-tense fact, phrase it as a forward commitment.
