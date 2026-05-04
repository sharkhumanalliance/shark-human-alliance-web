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

## ⚠️ Edit-tool truncation gotcha (read this first)

The Edit tool occasionally truncates large source files (TS/TSX, big JSON, CSS) when applying big replacements — file ends mid-line or with trailing NULL bytes. After every Edit on a file >~30 KB, **verify with `tail -c 200 <path>`** that it ends with the expected closing brackets/EOF. Recovery:

- Trailing NULLs: `python3 -c "p='path'; d=open(p,'rb').read().rstrip(b'\x00')+b'\n'; open(p,'wb').write(d)"`
- Mid-line cut: rebuild the missing tail via Python script.
- Broken JSON: `git show HEAD:path` and re-apply patches via `json.dump`.

Files seen truncated: `wanted-content.tsx`, `success-content.tsx`, `purchase-flow.tsx`, `messages/{en,es}.json`, `globals.css`, `lib/tiers.ts`, several `app/[locale]/.../page.tsx`. Silent corruption — `tsc` catches it but only after layered edits make recovery harder.

## Project

**Shark Human Alliance** — bilingual EN/ES Next.js site selling joke shark-protection certificates. Stripe checkout → Postgres members → Resend email. Pages live under `app/[locale]/`; each is a thin server component delegating to `components/<page>/<page>-content.tsx` (`"use client"`).

## Data layer (`lib/members.ts` + `lib/db.ts`)

Postgres via lazy `pg.Pool`. Migrations in `db/migration-*.sql`. Member schema: `{id, name, tier, date, dedication, referralCode, referredBy?, referralCount, email?, stripeSessionId?, accessToken?, template?, locale?, registryVisibility}`. Member IDs are UUIDs. Webhook is idempotent via `getMemberByStripeSession()`.

## API routes

`/api/checkout` (Stripe + free promo `SHATEST`), `/api/webhook` (Stripe → DB + email), `/api/members`, `/api/member-by-session`, `/api/referral/[code]`, `/api/send-certificate`.

## Stripe

`lib/stripe.ts` exports lazy `getStripe()`. **Never** instantiate `new Stripe(...)` at module top — Vercel build crashes when secrets aren't present at build time. Same lazy pattern would be wise for `lib/email.ts` (still eager).

## Certificate (`/[locale]/purchase/success`)

3 templates (`luxury`, `classic`, `playful`) × 2 paper formats (`a4`, `letter`). CSS rules under `.certificate-page--<template>.certificate-page--paper-<format>` in `globals.css`. Use `lib/certificate-paper.ts` helpers (`isPaperFormatAvailableForTemplate`, `normalizePaperFormatForTemplate`) before mounting selectors. PDF generation: `lib/generate-certificate.ts` (jsPDF, async, embeds `seal.png`).

## Wanted poster (`/[locale]/wanted`)

Big Canvas-based generator in `components/wanted/wanted-content.tsx`. `drawPoster(ctx, layout)` renders the entire poster on a single `<canvas>`. Two formats from `POSTER_LAYOUTS`: A4 (2100×2970) and Story (1080×1920).

- All sizes scale via `s(n) = n * (width / 2100)`. **Story canvas is half-width, so `n` must usually be larger** for Story to stay readable on phone after IG downscale (e.g. `s(isStory ? 64 : 30)` for charges → ~12 px on phone).
- Determinism: `seededHash = nameHash(name + "::" + rerollSeed)`. Same name + same reroll seed → identical poster. Reroll button bumps the seed.
- Pools (in `wanted.*` of messages): `toneCharges.<tone>` (5×3), `commonCharges` (10), `administrativeSubtitles` (8), `caseDetails` (8 `{label,value}`), `rewardTexts` (7). Picks rotate via `(seededHash + offset) % length`.
- QR links to `/purchase?tier=protected&gift=true&ref=wanted&name=<encoded>` — verify `/purchase` actually reads `gift=true` and `name=`. That's the conversion path.
- Download tilts the canvas ±2° (deterministic) on an off-screen canvas before `toBlob`. Preview stays straight.
- Procedural distress on WANTED + parchment grain via `mulberry32(seededHash)` — no font assets.
- OG image at `/og/wanted-sample.png` (1200×630) is currently a placeholder; see `public/og/README.md`.

## Post-purchase share

`components/purchase/post-purchase-share.tsx`. Uses `/mascots/case-closed-share.png` + tier-specific copy from `purchase.share.tierHeadlines.<tier>` (keys: `headlineTop`, `headlineBottom`, `previewHeadline`, `nativeTitle`, `nativeText`).

## i18n conventions

- Both `messages/en.json` and `messages/es.json` must have parity.
- ICU placeholders require the variable: `t("shareTitle", { name })`. Bare call renders `{name}` literally.
- Tier-keyed access: `t(\`tones.${tone}.posterSubtitle\`)`. Tones for wanted: `mild|clear|emergency`. Tiers for share: `basic|protected|nonsnack|business`.
- Arrays: `t.raw("commonCharges") as string[]`. Always cast.
- Stale keys to clean up next pass: `wanted.howStep{1,2,3}*` (section was removed).

## Styling

Tailwind CSS v4 (`@import "tailwindcss"`). Tokens in `:root` of `globals.css`: `--brand`, `--brand-dark`, `--accent`, `--muted`, `--border`. Use as `bg-[var(--brand)]`.

## Environment

See `.env.example`. Required: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

## Tracked GA4 events (`components/analytics.ts`)

`purchase`, `certificate_download`, `referral_link_copy`, `share_story_{clicked,downloaded,native_success,failed}`, `share_link_copied`, `wanted_poster_{generate,download,share,reroll}`.

## Other constraints

- `middleware.ts` uses deprecated convention (Next 16 wants `proxy`). Warning only.
- `data/members.json` historical, unused. All data in Postgres.
- `wanted.socialProofText` is hand-maintained (currently "18 wanted posters issued this week"). Bump manually until real analytics.
- `lib/qr-svg.ts` `getQrCodeUrl` hits an external QR API — swap to local `qrcode` npm if it ever needs to go offline.
