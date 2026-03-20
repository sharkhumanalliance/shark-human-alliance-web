# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build (also runs TypeScript check)
npm run lint       # ESLint
```

There are no tests. The project is developed on Windows and deployed to Vercel; the Linux VM cannot run `next build` (missing SWC binaries). Type-checking runs automatically during `next build`.

## Project Overview

**Shark Human Alliance** — a humorous fictional alliance selling joke shark-protection certificates. Every sale funds real ocean conservation. Certificates are downloadable as A4 portrait PDFs. The site is bilingual (EN/ES).

## Architecture

### Routing & i18n

All pages live under `app/[locale]/` (locales: `en`, `es`). `middleware.ts` redirects `/` → `/en` via `next-intl`. Translation strings are in `messages/en.json` and `messages/es.json`. The `i18n/routing.ts` file defines the supported locales.

Each page follows a consistent pattern:
- `app/[locale]/some-page/page.tsx` — thin server component, calls `setRequestLocale`, renders `<SiteHeader>`, `<SomeContent>`, `<SiteFooter>`
- `components/some-page/some-page-content.tsx` — the actual `"use client"` component with all UI logic

### Data Layer

Members are stored in **`data/members.json`** — a flat JSON array, no database. This file is read/written directly by API routes using `fs/promises`. On Vercel, writes persist only within a single serverless invocation (the filesystem is ephemeral in production). A proper database migration is a known future need.

Member schema:
```ts
{ id, name, tier, date, dedication, referralCode, referredBy?, referralCount, email?, stripeSessionId? }
```

### API Routes

- `POST /api/checkout` — creates Stripe Checkout session or bypasses Stripe entirely for free promo codes (currently `SHATEST`). Returns `{ url }`.
- `POST /api/webhook` — Stripe webhook: registers member in JSON, sends certificate email via Resend.
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

- **Preview**: `components/certificate/certificate-preview.tsx` — React component, `aspect-ratio: 210/297` (A4 portrait), percentage-based internal padding so proportions are independent of rendered size.
- **PDF**: `lib/generate-certificate.ts` — jsPDF, portrait A4, async (loads `seal.png` via `fetch("/seal.png")` and embeds it). Always call with `await`.
- **Reason selection**: both preview and PDF use the same deterministic hash on the member name (`hash = ((hash << 5) - hash + charCode) | 0`) to pick a single reason from the pool — the same name always gets the same reason.
- **Tiers**: `basic`/`protected` (teal), `nonsnack` (orange), `business` (violet). Color palettes are defined in both the preview component and `generate-certificate.ts`.

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
| `STRIPE_SECRET_KEY` | Stripe API (server-side, lazy-loaded) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (client-side) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Email delivery via Resend |
| `NEXT_PUBLIC_BASE_URL` | Used in Stripe redirect URLs and emails |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (currently `G-CF50YEKP1Y`) |

### Referral System

Members get a unique `SHA-XXXX` referral code. The `/career` page shows the rank ladder (`lib/referral-ranks.ts`): Civilian → Intern → Field Agent → Senior Diplomat → Ambassador → Chief Whisperer, based on `referralCount`.

### Known Constraints

- `middleware.ts` uses the deprecated `middleware` file convention (Next.js 16 wants `proxy`). It's a warning, not a build error, but worth migrating eventually.
- `data/members.json` writes do not persist on Vercel between deployments/invocations. Suitable for MVP/demo; replace with a database for production.
- `lib/email.ts` still uses eager Resend initialization (same pattern as the old Stripe bug). If Resend starts failing builds, apply the same lazy-init pattern used in `lib/stripe.ts`.
