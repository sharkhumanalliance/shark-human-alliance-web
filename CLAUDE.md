# CLAUDE.md

Guidance for Claude when working in this repo. Keep this file short.

## Commands

```bash
npm run dev        # Turbopack dev server
npm run build      # Production build (Windows / Vercel only — TS check runs here)
npm run lint       # ESLint
npx tsc --noEmit   # TS-only check (works in Linux VM)
```

No tests. The Linux VM cannot run `next build` (missing SWC binaries). Verify with `tsc --noEmit` + `eslint`.

## ⚠️ HARD RULE — never Edit/Write large files (read this first)

The Edit and Write tools **routinely corrupt large files** (TS/TSX, any JSON, CSS) — the file ends mid-line or with trailing NULL bytes. This is a tool limitation, not a setting. It wastes tokens on a corrupt→detect→repair loop and risks shipping broken code.

**The rule, no exceptions:**

1. **Files > ~25 KB, and ALL `messages/*.json`: edit ONLY via Python through bash.** Never use the Edit or Write tool on them. Pattern: `python3 <<'PYEOF'` … read file → `assert s.count(old) == 1` (the marker must exist and be unique) → `s = s.replace(old, new)` → for JSON also `json.loads(s)` to validate → strip NULLs (`s.replace("\x00","")`) → write. Do the assert/validate **in the same bash call** as the write.
2. **Edit tool is allowed only for small files (< ~25 KB).**
3. **Verify in the SAME bash call as the edit** (`tail -c 80`, `tsc`, `eslint`, JSON parity) — one round trip, don't re-read files you just wrote.
4. **Don't create temp files** (e.g. a throwaway `tsconfig.verify.json`). The sandbox blocks `rm` by default, so temp files force a delete-permission detour. Filter tool output instead (`tsc --noEmit | grep -v '\.next'`).

Recovery if a file was already corrupted:

- Trailing NULLs: `python3 -c "p='path'; d=open(p,'rb').read().replace(b'\x00',b'').rstrip()+b'\n'; open(p,'wb').write(d)"`
- Mid-line cut: rebuild the missing tail via Python, or splice the unchanged tail from `git show HEAD:path` onto a unique anchor.
- Broken JSON: re-derive from `git show HEAD:path` and re-apply patches via Python `str.replace` + `json.loads` validation.

Files seen truncated: `wanted-content.tsx`, `success-content.tsx`, `purchase-flow.tsx`, `verify-content.tsx`, `registry-content.tsx`, `messages/{en,es}.json`, `globals.css`, `lib/tiers.ts`, several `app/[locale]/.../page.tsx`. Silent corruption — `tsc` catches it but only after layered edits make recovery harder.

## Project

**Shark Human Alliance** — bilingual EN/ES Next.js site selling joke shark-protection certificates. Stripe checkout → Postgres members → Resend email. Pages live under `app/[locale]/`; each is a thin server component delegating to `components/<page>/<page>-content.tsx` (`"use client"`).

## Data layer (`lib/members.ts` + `lib/db.ts`)

Postgres via lazy `pg.Pool`. Migrations in `db/migration-*.sql`. Member schema: `{id, registryCode?, name, tier, date, dedication, referralCode, referredBy?, referralCount, email?, stripeSessionId?, accessToken?, template?, locale?, registryVisibility}`. Member IDs are internal UUIDs; public registry/verify surfaces use `registry_code` (`registryCode` in app code). Webhook is idempotent via `getMemberByStripeSession()`.

## API routes

`/api/checkout` (Stripe + free promo `SHATEST`), `/api/webhook` (Stripe → DB + email + **server-side GA4 `purchase`** via `lib/ga4-measurement-protocol.ts`), `/api/members`, `/api/member-by-session`, `/api/member-privacy`, `/api/referral/[code]`, `/api/send-certificate`.

## Stripe

`lib/stripe.ts` exports lazy `getStripe()`. **Never** instantiate `new Stripe(...)` at module top — Vercel build crashes when secrets aren't present at build time. `lib/email.ts` (`getResend()`) and `lib/ga4-measurement-protocol.ts` follow the same lazy / secret-at-call-time pattern.

## Certificate (`/[locale]/purchase/success`)

3 templates (`luxury`, `classic`, `playful`) × 2 paper formats (`a4`, `letter`). CSS rules under `.certificate-page--<template>.certificate-page--paper-<format>` in `globals.css`. Use `lib/certificate-paper.ts` helpers (`isPaperFormatAvailableForTemplate`, `normalizePaperFormatForTemplate`) before mounting selectors. PDF generation: `lib/generate-certificate.ts` (jsPDF, async, embeds `seal.png`).

## Wanted poster (`/[locale]/wanted`)

Big Canvas-based generator in `components/wanted/wanted-content.tsx`. `drawPoster(ctx, layout)` renders the entire poster on a single `<canvas>`. Two formats from `POSTER_LAYOUTS`: A4 (2100×2970) and Story (1080×1920).

- All sizes scale via `s(n) = n * (width / 2100)`. **Story canvas is half-width, so `n` must usually be larger** for Story to stay readable on phone after IG downscale (e.g. `s(isStory ? 64 : 30)` for charges → ~12 px on phone).
- Determinism: `seededHash = nameHash(name + "::" + rerollSeed)`. Same name + same reroll seed → identical poster. Reroll button bumps the seed.
- Pools (in `wanted.*` of messages): `toneCharges.<tone>` (5×3), `commonCharges` (10), `administrativeSubtitles` (8), `caseDetails` (8 `{label,value}`), `rewardTexts` (7). Picks rotate via `(seededHash + offset) % length`.
- QR & internal CTAs link to `/purchase?tier=protected&gift=true&from=<canonical_source>&name=<encoded>`, usually `wanted_gift_cta`, `wanted_case_cta`, or `wanted_footer_cta`. `/purchase` (in `purchase-flow.tsx`) reads `name`, `gift` and `from` on mount; `from` is normalized and persisted to `sessionStorage["sha_attribution_source"]` so the `purchase` event on `/purchase/success` can re-emit it after Stripe's redirect. Legacy `ref=wanted` was removed — it was being silently rejected by the SHA-XXXX referral-code validator.
- **Multi-name stepper:** the name field accepts several names (comma/newline, deduped, max 5) via `parseNameList`; `handleGenerate` queues them and the action panel walks one poster at a time (`queue`/`queueIndex`/`goToQueueIndex`). `posterName` (first parsed name) drives the canvas + `seededHash`, so the preview never shows the raw comma list.
- **Reciprocity (accuse-back):** `/wanted/case` (`wanted-case-content.tsx`) blame panel + header shortcut issue a fresh poster for the blamed person via `/wanted?name=<x>&by=<accuser>`. The generator carries `by` into its share URL so the next case shows "Filed by …". `by`/`from`/`msg` are third-party names passed ONLY in URLs — never persisted to Postgres. Events: `wanted_accuse_back`, `wanted_poster_multi_tag`.
- Download tilts the canvas ±2° (deterministic) on an off-screen canvas before `toBlob`. Preview stays straight.
- Procedural distress on WANTED + parchment grain via `mulberry32(seededHash)` — no font assets.
- OG image (1200×630) is generated dynamically by `app/og/wanted/route.tsx` (uses `next/og`). Shared `/wanted/case?name=...&tone=...` URLs get a personalized preview; the generic `/wanted` page is seeded with a sample name. Share button in `wanted-content.tsx` emits the long `/wanted/case?...` URL (not `/w?...`) because some scrapers do not follow redirects. See `public/og/README.md`.

## Homepage (`components/home/home-content.tsx`)

Live certificate customizer: `previewName` input + template selector → live `CertificatePreview`; the buy/gift CTAs carry `&name=` into `/purchase` (they currently omit `&template=`, which `/purchase` would accept — a known continuity gap). `components/home/mobile-sticky-cta.tsx` is a mobile-only bottom CTA that appears after the hero scrolls past (IntersectionObserver + matchMedia desktop guard, `sessionStorage` dismiss, `prefers-reduced-motion`, safe-area inset).

## Post-purchase share

`components/purchase/post-purchase-share.tsx`. Generates a 1080x1920 Story PNG with a certificate-led composition + tier-specific copy from `purchase.share.tierHeadlines.<tier>` (keys: `headlineTop`, `headlineBottom`, `previewHeadline`, `nativeTitle`, `nativeText`). The shared verify URL should use public `registryCode`, not raw internal member id.

## Gift flow & reveal (`/[locale]/gift`)

- Buyer ticks gift on `/purchase` → recipient email + optional `fromName` + `giftMessage`. `fromName` threads purchase-flow → checkout → Stripe metadata → webhook → emails (`lib/email.ts`).
- Both payment paths build a `revealUrl` (`/gift?to=&from=&msg=&token=`) sent to recipient AND buyer (buyer paid; recipient may never open the email). `giftMessage` is capped at 600 chars in the URL.
- `app/[locale]/gift/page.tsx` (noindex) loads the real cert by `token` via `getMemberByAccessToken` and passes it to `components/gift/gift-reveal-content.tsx`: wax-seal break animation (`gr-seal*` CSS; `grSealBreakLeft` animationend → reveal, with a 1300 ms fallback; `prefers-reduced-motion` skips it), live `CertificatePreview`, the message, and "Protect someone back" / "Make a Wanted poster" CTAs. `bare` state (no params) shows a generic "gift waiting" page.
- `from`/`message` are URL-only, never stored in Postgres. i18n namespace `giftReveal`.
- Success page (`success-content.tsx`) shows a copyable gift link + preview when `?gift=1` (set on `success_url` for gift checkouts).

## Certificate / verify OG preview

Public `/[locale]/verify?id=<registryCode>` pages generate certificate-style Open Graph previews through `app/og/certificate/route.tsx` (1200x630). This is only for public registry records; private certificate access still uses `/certificate/view?token=...` and should not expose access tokens in OG metadata.

## i18n conventions

- Both `messages/en.json` and `messages/es.json` must have parity.
- ICU placeholders require the variable: `t("shareTitle", { name })`. Bare call renders `{name}` literally.
- Tier-keyed access: `t(\`tones.${tone}.posterSubtitle\`)`. Tones for wanted: `mild|clear|emergency`. Tiers for share: `basic|protected|nonsnack|business`.
- Arrays: `t.raw("commonCharges") as string[]`. Always cast.
- Dead keys pending cleanup: `hero.howStep{1,2,3}`, `home.howStep{1,2,3}` (how-it-works section removed). A blunt "unused key" grep over-reports — many keys are dynamic (`realImpact.partner${n}`, `${tier}Price`); verify per-key before deleting.

## Styling

Tailwind CSS v4 (`@import "tailwindcss"`). Tokens in `:root` of `globals.css`: `--brand`, `--brand-dark`, `--accent`, `--muted`, `--border`. Use as `bg-[var(--brand)]`.

## Environment

See `.env.example`. Required: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Optional for server-side GA4 purchase tracking: `GA4_MEASUREMENT_ID`, `GA4_MEASUREMENT_PROTOCOL_SECRET`.

## Tracked GA4 events (`components/analytics.tsx`)

Canonical event contract lives in `docs/analytics-events.md`. `purchase` is the only GA4 key event. Ecommerce events use `items[]` with certificate tier as the item, and wanted/gift/sticky funnel events use canonical `source` values from `lib/analytics-events.ts` (`wanted_gift_cta`, `wanted_case_cta`, `wanted_footer_cta`, `gift_reveal`, `sticky_cta`, etc.). `view_item`, `begin_checkout`, and `purchase` re-emit canonical `source` from `sessionStorage["sha_attribution_source"]` so funnel reports survive Stripe's redirect. Paid Stripe purchases are also sent from `/api/webhook` through GA4 Measurement Protocol when analytics consent and GA client id are present; do not send PII to GA4.

## Other constraints

- `middleware.ts` uses deprecated convention (Next 16 wants `proxy`). Warning only.
- `data/members.json` historical, unused. All data in Postgres.
- `wanted.socialProofText` is hand-maintained (currently "18 wanted posters issued this week"). Bump manually until real analytics.
- `lib/qr-svg.ts` `getQrCodeUrl` hits an external QR API — swap to local `qrcode` npm if it ever needs to go offline.
- `registry_code` is the public registry identifier. Migration stage 1 (`db/migration-004-registry-code.sql`) and hardening stage 2 (`db/migration-005-registry-code-not-null.sql`) have been run against production.
