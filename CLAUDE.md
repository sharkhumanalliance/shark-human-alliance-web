# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build (also runs TypeScript check)
npm run lint       # ESLint
npx tsc --noEmit   # Type-check only (works in the Linux VM, unlike `next build`)
```

There are no tests. The project is developed on Windows and deployed to Vercel; the Linux VM cannot run `next build` (missing SWC binaries). For verification in the VM use `npx tsc --noEmit` and `npx eslint . --ext .ts,.tsx`. Type-checking runs automatically during `next build` on Windows / Vercel.

## ⚠️ Edit-tool truncation gotcha

The Edit tool occasionally truncates large source files (TS/TSX, large JSON) when applying big replacements — it leaves the file ending mid-line or with trailing NULL bytes. After every Edit on a file >~30 KB, **verify with `tail -c 200 <path>`** that the file ends with the expected closing brackets/EOF. If truncated:
- Trailing NULLs: `python3 -c "p='path'; d=open(p,'rb').read().rstrip(b'\x00')+b'\n'; open(p,'wb').write(d)"`
- Mid-line cut: rebuild the missing tail via Python script (avoid further Edit calls on the same file).
- Broken JSON: re-read from `git show HEAD:path` and re-apply patches via `json.dump`.

Files I have observed truncate this way: `wanted-content.tsx`, `success-content.tsx`, `purchase-flow.tsx`, `messages/en.json`, `messages/es.json`, `globals.css`, `lib/tiers.ts`, several `app/[locale]/.../page.tsx`. Affected files are silently corrupted — `tsc` will catch it, but only AFTER you've layered more edits on top of broken state.

## Project Overview

**Shark Human Alliance** — a humorous fictional alliance selling joke shark-protection certificates. Every sale funds real ocean conservation. Certificates are downloadable as A4 portrait PDFs. The site is bilingual (EN/ES).

## Architecture

### Routing & i18n

All pages live under `app/[locale]/` (locales: `en`, `es`). `middleware.ts` redirects `/` → `/en` via `next-intl`. Translation strings are in `messages/en.json` and `messages/es.json`. The `i18n/routing.ts` file defines the supported locales.

Each page follows a consistent pattern:
- `app/[locale]/some-page/page.tsx` — thin server component, calls `setRequestLocale`, renders `<SiteHeader>`, `<SomeContent>`, `<SiteFooter>`
- `components/some-page/some-page-content.tsx` — the actual `"use client"` component with all UI logic

### Data Layer

Members are stored in **PostgreSQL** (e.g. Neon, Supabase, Vercel Postgres). Connection is managed via `lib/db.ts` (lazy `pg.Pool` singleton). Data-access functions live in `lib/members.ts`:

- `listMembers()`, `getMemberById(id)`, `getMemberByAccessToken(token)`, `getMemberByStripeSession(sessionId)`, `getMemberByReferralCode(code)`
- `createMember(data)`, `incrementReferralCount(code)`
- `generateMemberId()`, `generateUniqueReferralCode()`, `generateAccessToken()`

Migrations: `db/migration-001.sql` (initial schema), `db/migration-002.sql` (issue_date → timestamptz, add template/locale columns). Run sequentially against your database.

Member schema:
```ts
{ id, name, tier, date, dedication, referralCode, referredBy?, referralCount, email?, stripeSessionId?, accessToken?, template?, locale? }
```

Key patterns:
- **Member IDs** use `crypto.randomUUID()` (via `generateMemberId()`).
- **Webhook idempotency**: `/api/webhook` checks `getMemberByStripeSession()` before creating a member.
- **Referral code collision retry**: `createMember()` retries with a new code on unique constraint violation (up to 5 times).
- **Verification page**: `/[locale]/verify?id=MEMBER_ID` shows a verified membership card with funny quips.

### API Routes

- `POST /api/checkout` — creates Stripe Checkout session or bypasses Stripe entirely for free promo codes (currently `SHATEST`). Returns `{ url }`.
- `POST /api/webhook` — Stripe webhook: registers member in DB, sends certificate email via Resend.
- `GET /api/members` — returns the member list (used by the registry page).
- `GET /api/member-by-session?session_id=` — polls for a member by Stripe session ID (success page polls this until webhook fires).
- `GET /api/referral/[code]` — looks up a member by referral code.
- `POST /api/send-certificate` — manually resends the certificate email.

### Payment Flow

1. User fills purchase form → `POST /api/checkout`
2. For free promo codes: member is registered immediately, redirect to success page with a synthetic `session_id`.
3. For paid: redirect to Stripe Checkout (with `allow_promotion_codes: true`).
4. After payment: Stripe fires webhook → `/api/webhook` registers member + sends email.
5. Success page at `/purchase/success?session_id=` polls `/api/member-by-session` until the member appears.

### Stripe Initialization

`lib/stripe.ts` exports `getStripe()` — a lazy initializer that creates the Stripe client on first call. **Do not instantiate `new Stripe(...)` at module level** — it crashes Vercel build when `STRIPE_SECRET_KEY` is not available at build time.

### Certificate Generation

- **Preview**: `components/certificate/certificate-preview.tsx` + `certificate-document.tsx` — React components, supports three templates (`luxury`, `classic`, `playful`) and two paper formats (`a4`, `letter`). Each template has CSS rules under `.certificate-page--<template>.certificate-page--paper-<format>` in `globals.css`.
- **PDF**: `lib/generate-certificate.ts` — jsPDF, portrait A4, async (loads `seal.png` via `fetch("/seal.png")` and embeds it). Always call with `await`.
- **Reason selection**: both preview and PDF use the same deterministic hash on the member name (`hash = ((hash << 5) - hash + charCode) | 0`) to pick a single reason from the pool — the same name always gets the same reason.
- **Tiers**: `basic`/`protected` (teal), `nonsnack` (orange), `business` (violet). Color palettes are defined in both the preview component and `generate-certificate.ts`.
- **Helper**: `lib/certificate-paper.ts` exposes `isPaperFormatAvailableForTemplate` + `normalizePaperFormatForTemplate` — call these before mounting the template selector to avoid invalid template/paper combinations.

### Wanted poster (`/[locale]/wanted`)

Viral lead-gen tool: user types a name + picks tone (mild/clear/emergency) → live Canvas preview of a "WANTED" poster with seeded charges, rotates on download, exports as PNG for sharing.

- **Component**: `components/wanted/wanted-content.tsx`. The big `drawPoster(ctx, layout)` function renders the entire poster on a single `<canvas>`. Layout config in `POSTER_LAYOUTS[posterFormat]` provides per-format dimensions (A4 = 2100×2970, Story = 1080×1920) plus `qrSize`. All font sizes and offsets in `drawPoster` are scaled via `s(n) = n * (width/2100)`. **Story format usually needs *larger* `n` because the canvas is half-width** — e.g. `s(isStory ? 64 : 30)` for charges keeps charges readable after IG downscale to phone (~12 px on phone).
- **Determinism**: poster contents (charges, subtitle, case detail, reward, distress pattern, download tilt) are seeded by `seededHash = nameHash(name + "::" + rerollSeed)`. Same name + same reroll seed → same poster. Reroll button bumps the seed.
- **Pools** (in `messages/{en,es}.json` under `wanted.*`): `toneCharges.<mild|clear|emergency>` (5 each), `commonCharges` (10), `administrativeSubtitles` (8), `caseDetails` (8 `{label,value}`), `rewardTexts` (7). Component picks from these via `(seededHash + offset) % length`.
- **QR**: links to `/purchase?tier=protected&gift=true&ref=wanted&name=<encoded>` so the gift purchase flow is pre-filled. *Verify `/purchase` reads `gift=true` and `name=` query params* — that's the conversion path.
- **OG image**: `app/[locale]/wanted/page.tsx` references `/og/wanted-sample.png` (1200×630). The current file in `public/og/` is a placeholder; see `public/og/README.md` for how to produce the real one.
- **Tilt on download**: `handleDownload` rotates the canvas by ±2° (deterministic per `nameHash`) on an off-screen canvas before `toBlob`. Preview stays straight for editing.
- **Procedural distress**: paper grain (~600 noise dots + fiber strokes) and WANTED title distress (parchment scratches + ink bleed dots + dropout polygon) are computed in `drawPoster` using `mulberry32(seededHash)` — no font assets required.

### Post-purchase share (`PostPurchaseShare`)

`components/purchase/post-purchase-share.tsx`. After successful checkout, the user sees a Story preview built from a hero image (`/mascots/case-closed-share.png`) plus a single tier-specific card. The Canvas-based Story export uses `tierHeadlines.<tier>` (in `messages.*.json` under `purchase.share`) for `headlineTop`, `headlineBottom`, `previewHeadline`, `nativeTitle`, `nativeText`. Each public tier (`protected`, `nonsnack`, `business`, plus `basic` fallback) has its own copy.

### Success page (`/[locale]/purchase/success`)

`components/purchase/success-content.tsx`. After Stripe webhook fires, polls `/api/member-by-session` and renders:
1. Success header (h1)
2. `PostPurchaseShare` card
3. Certificate card with collapsible "Customize" (template + paper selector hidden by default), preview, and primary `Download PDF` CTA
4. Email/registry visibility notice
5. Muted referral card (rank ladder + copy referral link + "Make a wanted poster" CTA)
6. Back-to-home text link

### Styling

Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`). Design tokens are CSS variables defined in `:root`:

| Variable | Use |
|---|---|
| `--brand` | Primary blue `#2f80ed` |
| `--brand-dark` | Dark navy `#173d63` |
| `--accent` | Coral `#ff7f6a` |
| `--muted` | Body text gray `#5f7892` |
| `--border` | Border blue-gray `#d4e8f7` |

Use `var(--brand)` etc. in Tailwind arbitrary values: `bg-[var(--brand)]`.

### Environment Variables

See `.env.example`. Required for full functionality:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon, Supabase) |
| `STRIPE_SECRET_KEY` | Stripe API (server-side, lazy-loaded) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (client-side) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Email delivery via Resend |
| `NEXT_PUBLIC_BASE_URL` | Used in Stripe redirect URLs and emails |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (currently `G-CF50YEKP1Y`) |

### Referral System

Members get a unique `SHA-XXXX` referral code. The `/career` page shows the rank ladder (`lib/referral-ranks.ts`): Civilian → Intern → Field Agent → Senior Diplomat → Ambassador → Chief Whisperer, based on `referralCount`.

### i18n message conventions

- All user-facing strings live in `messages/en.json` + `messages/es.json`. Both files must always have parity (same keys in both languages).
- Keys with `{name}` ICU placeholders **must be called with the variable**: `t("shareTitle", { name: ... })`. Calling without the var renders the placeholder literally.
- Tier-keyed objects (`tierHeadlines`, `tones`) are accessed dynamically via `t(\`tones.${selectedTone}.posterSubtitle\`)`. The available tier keys for the wanted page are `mild | clear | emergency`; for purchase share they're `basic | protected | nonsnack | business`.
- Arrays read with `t.raw("commonCharges") as string[]`. Don't iterate untyped — cast to expected shape.

### Synthetic social proof

`wanted.socialProofText` is a hand-maintained string ("18 wanted posters issued this week."). Bump the number manually until real analytics are wired up. There is no live counter.

### Tracked analytics events

Currently emitted via `trackEvent()` (`components/analytics.ts`):
- `purchase` (success page after webhook)
- `certificate_download` (success page)
- `referral_link_copy` (success page)
- `share_story_clicked / downloaded / native_success / failed` (post-purchase share)
- `share_link_copied`
- `wanted_poster_generate / download / share / reroll`

### Known Constraints

- `middleware.ts` uses the deprecated `middleware` file convention (Next.js 16 wants `proxy`). It's a warning, not a build error, but worth migrating eventually.
- `lib/email.ts` still uses eager Resend initialization (same pattern as the old Stripe bug). If Resend starts failing builds, apply the same lazy-init pattern used in `lib/stripe.ts`.
- `data/members.json` is no longer used — kept as historical reference. All data now lives in PostgreSQL.
- Several files have `howStep1Title`, `howStep1Text`, etc. message keys that are no longer referenced — the "How it works" section was removed from `/wanted`. Safe to delete on next pass.
- The `lib/qr-svg.ts` `getQrCodeUrl` builder hits an external QR API. If that ever needs to go offline-only, swap to a local generator (e.g. `qrcode` npm).
