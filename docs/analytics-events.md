# Analytics Events

Shark Human Alliance uses GA4 through `components/analytics.tsx`.
Analytics storage defaults to denied and is updated only after cookie consent.

Official references:

- GA4 recommended events: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- GA4 Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events

## Source Taxonomy

Use canonical `source` values from `lib/analytics-events.ts`.

| Source | Meaning |
| --- | --- |
| `hero` | Homepage or page hero CTA |
| `header` | Site header or case header secondary action |
| `sticky_cta` | Mobile homepage sticky CTA |
| `home_wanted_cta` | Homepage Wanted teaser section CTA |
| `home_preview_cta` | Homepage live certificate preview buy/gift CTAs |
| `home_tier_card` | Homepage membership tier card CTA |
| `home_final_cta` | Homepage final closing section CTA |
| `impact_cta` | Impact page purchase CTAs (hero proof + closing section) |
| `wanted_poster` | Wanted poster creation surface |
| `wanted_gift_cta` | Wanted poster gift/protect CTA |
| `wanted_case` | Wanted case page surface |
| `wanted_case_cta` | Wanted case settle/protect CTA |
| `wanted_footer_cta` | Wanted page footer CTA |
| `gift_reveal` | Gift reveal page and its protect-back CTA |

Legacy incoming source values are normalized before analytics use:

| Legacy source | Canonical source |
| --- | --- |
| `wanted_poster` on purchase attribution | `wanted_gift_cta` |
| `wanted_case_header_cta` | `wanted_case_cta` |
| `home_mobile_sticky_cta` | `sticky_cta` |
| `case_header` | `header` |

## Event Contract

Do not send names, email addresses, dedication text, gift messages, access
tokens, raw member UUIDs, or Stripe customer data to GA4.

Where meaningful, funnel events should include:

- `source`
- `locale`
- `tier`
- `tone`
- `personalized`
- `is_gift`

Use only dimensions that are meaningful for the event. For example,
`wanted_poster_generate` has `tone`, `locale`, and `personalized`, but no
`tier` because no tier has been selected yet.

## Events

| Event | Fired when | Parameters | Key event |
| --- | --- | --- | --- |
| `view_item` | Purchase page first loads | `item_id`, `item_name`, `tier`, `value`, `currency`, `locale`, `source`, `is_gift`, `items[]` | No |
| `select_item` | Purchase tier changes | `item_id`, `item_name`, `tier`, `value`, `currency`, `locale`, `source`, `items[]` | No |
| `begin_checkout` | Purchase form is confirmed and submitted | `item_id`, `item_name`, `tier`, `value`, `currency`, `locale`, `source`, `is_gift`, `has_promo`, `has_email`, `items[]` | No |
| `purchase` | Client success page resolves a member record; server webhook sends the same paid Stripe purchase when analytics consent and GA client id are present | `transaction_id`, `value`, `currency`, `item_id`, `item_name`, `tier`, `locale`, `source`, `is_gift`, `is_promo` client-only for promo, `items[]` | Yes |
| `sticky_cta_shown` | Mobile homepage sticky CTA first becomes visible | `source`, `placement` | No |
| `sticky_cta_click` | Mobile homepage sticky CTA is clicked | `source`, `placement` | No |
| `sticky_cta_dismiss` | Mobile homepage sticky CTA is dismissed | `source`, `placement` | No |
| `wanted_teaser_click` | Homepage Wanted teaser CTA is clicked | `source` | No |
| `wanted_poster_generate` | Wanted poster is generated | `source`, `tone`, `locale`, `personalized`, `name_length` | No |
| `wanted_poster_multi_tag` | Multiple wanted names are parsed or navigated | `source`, `tone`, `locale`, `name_count`, `navigated`, `index` | No |
| `wanted_poster_share` | Wanted poster share is attempted | `source`, `format`, `tone`, `locale`, `personalized` | No |
| `wanted_poster_download` | Wanted poster download is attempted | `source`, `format`, `tone`, `locale`, `personalized`, `tilted` | No |
| `wanted_poster_reroll` | Wanted poster charges are rerolled | `source`, `tone`, `locale` | No |
| `wanted_case_view` | Wanted case page is viewed | `source`, `tone`, `locale`, `personalized` | No |
| `wanted_case_response` | Wanted case response tab is selected | `source`, `response`, `tone`, `locale`, `personalized` | No |
| `wanted_accuse_back` | Accuse-back loop is started | `source`, `tone`, `locale`, `personalized` | No |
| `wanted_case_blame_submitted` | Accuse-back name is submitted | `source`, `tone`, `locale`, `personalized` | No |
| `wanted_to_purchase_click` | Wanted CTA to purchase is clicked | `source`, `placement`, `tone`, `locale`, `personalized` | No |
| `gift_reveal_view` | Gift reveal page loads | `source`, `locale`, `bare`, `personalized`, `has_message`, `has_token`, `has_certificate` | No |
| `gift_reveal_opened` | Gift reveal envelope is opened | `source`, `locale` | No |
| `gift_reveal_bare_gift_click` | Bare gift page gift CTA is clicked | `source`, `locale`, `is_gift` | No |
| `gift_reveal_certificate_click` | Gift certificate link is clicked | `source`, `locale` | No |
| `gift_reveal_protect_back_click` | Gift recipient clicks protect-back CTA | `source`, `tier`, `locale` | No |
| `gift_reveal_wanted_click` | Gift recipient clicks wanted CTA | `source`, `locale` | No |
| `certificate_download` | Certificate download is clicked | `tier`, `format` | No |
| `gift_link_copy` | Buyer copies gift reveal link | `tier` | No |
| `gift_reveal_preview_click` | Buyer previews gift reveal link | `tier` | No |
| `referral_link_copy` | Referral link is copied | `tier` | No |
| `share_story_clicked` | Post-purchase story share starts | `tier` | No |
| `share_story_downloaded` | Post-purchase story image downloads | `tier` | No |
| `share_story_native_success` | Native share succeeds | `tier`, `mode` | No |
| `share_story_failed` | Post-purchase story share fails | `tier`, `stage` | No |
| `share_link_copied` | Verification link is copied | `tier` | No |
| `rank_lookup` | Career rank lookup succeeds | `rank`, `referral_count`, `tier` | No |
| `certificate_preview_interaction` | Homepage certificate preview interaction is debounced | none | No |
| `gift_toggle` | Gift option changes on purchase | `tier`, `locale`, `source`, `enabled` | No |
| `no_email_warning_shown` | No-email warning is shown | `tier`, `locale`, `source` | No |
| `confirmation_shown` | Purchase review confirmation is shown | `tier`, `locale`, `source` | No |
| `no_email_confirmed` | User confirms purchase without email | `tier`, `locale`, `source` | No |

## GA4 UI Setup

Configure these in GA4 Admin after deployment:

- Mark only `purchase` as the key event.
- Register event-scoped custom dimensions: `source`, `tier`, `tone`,
  `locale`, `personalized`, `bare`, `has_certificate`, `is_gift`.
- Optional event-scoped dimensions for diagnostics: `placement`,
  `has_message`, `has_token`, `has_promo`, `has_email`, `is_promo`.

Recommended explorations:

- Wanted funnel: `wanted_poster_generate` -> `wanted_poster_share` or
  `wanted_accuse_back` -> `wanted_case_view` -> `wanted_to_purchase_click` ->
  `purchase`.
- Gift loop: gift `purchase` -> `gift_reveal_view` ->
  `gift_reveal_opened` -> `gift_reveal_protect_back_click` ->
  `purchase` where `source = gift_reveal`.
- Sticky/home: `sticky_cta_shown` -> `sticky_cta_click` -> `purchase`.

## Server-Side Purchase Tracking

Webhook purchase tracking uses GA4 Measurement Protocol from
`app/api/webhook/route.ts` through `lib/ga4-measurement-protocol.ts`.

Required environment:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` for client GA4.
- `GA4_MEASUREMENT_PROTOCOL_SECRET` for webhook Measurement Protocol.
- Optional `GA4_MEASUREMENT_ID` if the server should use a different web
  stream id. If omitted, the server reuses `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

Consent behavior:

- `/purchase` asks `gtag` for `client_id` only when analytics consent is
  granted.
- `/api/checkout` stores `gaClientId`, `analyticsConsent`, and
  `attributionSource` in Stripe metadata only when appropriate.
- `/api/webhook` sends Measurement Protocol `purchase` only when
  `analyticsConsent = true` and a GA client id is present.
- Analytics failures are logged but do not fail Stripe webhook processing.

Deduplication:

- Client and server purchase events use the same `transaction_id`
  (`checkout.session.id`) and the same ecommerce `items[]` structure.
- Verify duplicate handling with a test Stripe payment in GA4 DebugView or
  Realtime before relying on revenue reports.
