# Open Graph images

OG previews for `/[locale]/wanted` and `/[locale]/wanted/case` are now
generated **dynamically at request time** by
`app/og/wanted/route.tsx` (uses `next/og` `ImageResponse`).

## Route

```
/og/wanted?name=<encoded>&tone=<mild|clear|emergency>&locale=<en|es>
```

Returns a 1200 × 630 PNG with the WANTED poster aesthetic (dark wood frame,
parchment, headline, deterministic charges drawn from the message pools).

The route is referenced in `generateMetadata` of:
- `app/[locale]/wanted/page.tsx`        — generic landing, seeded with a
  sample name ("Dave from Accounting" / "David de Contabilidad").
- `app/[locale]/wanted/case/page.tsx`   — personalized landing, reads
  `name` and `tone` from query params.

## Caching

The handler sets `Cache-Control: public, max-age=86400, s-maxage=86400,
stale-while-revalidate=604800`. Output is purely a deterministic function
of query params (`nameHash` → modular index into the message arrays), so
edge-cached previews remain stable.

## Determinism / virality note

Identical share URL → identical preview. That matters when the same
`/wanted/case?name=X` link is reshared: every scraper / messenger sees the
same image. If you ever change the charge pools in `messages/*.json` the
hashed indices may shift; bump a query-string version param (e.g. `&v=2`)
to force scrapers to refresh.

## Target sizes per platform

| Platform | Size | Notes |
|---|---|---|
| Open Graph (FB, LinkedIn, Slack) | 1200 × 630 | min 600 × 315, 1.91:1 ratio |
| Twitter (large card) | 1200 × 630 | same shape |
| iMessage | 1200 × 630 | same — does **not** follow 30x redirects |

The last column is why `handleShare` in `components/wanted/wanted-content.tsx`
emits the long `/wanted/case?...` URL rather than the `/w?...` short redirect.
