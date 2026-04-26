\# AGENTS.md



\## Project overview

Shark Human Alliance is a humorous fictional web project that sells joke shark-protection certificates while supporting real ocean conservation.



This is a production-style Next.js app deployed to Vercel.

The tone should stay playful, deadpan, and official-looking rather than childish or chaotic.



Core product characteristics:

\- bilingual website: English and Spanish

\- downloadable A4 portrait certificates

\- humorous but polished brand presentation

\- payment flow, webhook flow, email flow, and verification flow are all important and should be changed carefully



\## Working style

\- Act like a careful senior web engineer with solid product-design judgment.

\- First inspect existing patterns before introducing new structure.

\- Reuse existing components, utilities, and conventions whenever possible.

\- Keep changes tightly scoped to the requested task.

\- Avoid unrelated refactors.

\- Do not add dependencies unless they are clearly necessary.

\- When requirements are slightly ambiguous, choose the simplest solution that matches the current product direction and note the assumption briefly at the end.



\## Commands

\- `npm run dev` - start dev server

\- `npm run build` - production build and TypeScript check

\- `npm run lint` - ESLint



\## Important environment constraint

\- The project is developed on Windows and deployed to Vercel.

\- The Linux VM may fail on `next build` because of missing SWC binaries.

\- Do not treat that known Linux build issue as proof that the code change is wrong unless the failure is clearly unrelated to SWC.

\- When build validation is unreliable, prefer linting, code inspection, and targeted reasoning.

\- On this Windows setup, shell-launched headless Chrome may fail when its `--user-data-dir` points into the workspace (for example `.chrome-headless`) because of local permission / Crashpad / IPC issues.

\- For local browser verification, prefer the in-app browser when available.

\- If shell headless Chrome is needed, use a fresh profile under `%TEMP%` or `%LOCALAPPDATA%`, ideally unique per run, and do not rely on a shared profile directory inside the repo.



\## Architecture



\### Routing and i18n

\- All pages live under `app/\\\[locale]/`.

\- Supported locales are `en` and `es`.

\- `middleware.ts` redirects `/` to `/en` using `next-intl`.

\- Translation strings are stored in:

&#x20; - `messages/en.json`

&#x20; - `messages/es.json`

\- Supported locales are defined in `i18n/routing.ts`.



\### Page structure convention

Each page should follow the established pattern:

\- `app/\\\[locale]/some-page/page.tsx` = thin server component

\- `components/some-page/some-page-content.tsx` = main `"use client"` UI component



Unless explicitly requested otherwise:

\- keep pages thin at the route level

\- keep most interactive UI logic in the corresponding content component

\- do not introduce a parallel page architecture



\### Data layer

Members are stored in PostgreSQL.

Connection is managed via `lib/db.ts` using a lazy `pg.Pool` singleton.



Primary data-access functions are in `lib/members.ts`, including:

\- listing members

\- looking up members by id, access token, Stripe session, or referral code

\- creating members

\- incrementing referral counts

\- generating member ids, referral codes, and access tokens



Important data behavior:

\- member ids use `crypto.randomUUID()`

\- webhook flow must remain idempotent

\- referral code generation includes collision retry behavior

\- do not duplicate DB access logic if an existing helper already covers the need



\### API routes

Important routes include:

\- `POST /api/checkout`

\- `POST /api/webhook`

\- `GET /api/members`

\- `GET /api/member-by-session`

\- `GET /api/referral/\\\[code]`

\- `POST /api/send-certificate`



Treat checkout, webhook, email, and certificate flows as sensitive areas.

Prefer minimal and careful edits in those areas.



\## Payment flow

Current expected flow:

1\. user submits purchase form

2\. app calls `POST /api/checkout`

3\. free promo codes can bypass Stripe and register immediately

4\. paid flow redirects to Stripe Checkout

5\. Stripe webhook registers the member

6\. certificate email is sent

7\. success page polls by `session\\\_id` until the member record appears



When changing purchase-related code:

\- preserve webhook idempotency

\- preserve referral behavior

\- avoid broad restructuring unless explicitly requested

\- do not break success-page polling expectations



\## Stripe and email initialization rules

\- Do not instantiate Stripe at module scope.

\- Use the existing lazy-init pattern from `lib/stripe.ts`.

\- Be aware that `lib/email.ts` may eventually need the same lazy-init approach if build issues appear.

\- Avoid eager initialization of external services at import time.



\## Certificate generation

There are two certificate outputs that should stay aligned:

\- visual preview component

\- generated PDF



Important certificate rules:

\- preview and PDF should remain visually and logically consistent

\- certificate format is A4 portrait

\- `lib/generate-certificate.ts` is async and should be awaited

\- deterministic reason selection based on member name should stay preserved unless explicitly changed

\- preserve tier behavior and palette mapping unless the task is specifically about redesigning them



\## Verification and referral features

\- verification page should continue to show a verified membership card experience

\- referral codes follow the SHA-style format already used in the project

\- referral rank progression is defined in `lib/referral-ranks.ts`

\- do not silently change referral thresholds, naming, or rank logic unless asked



\## UI and design rules

This project is design-sensitive. For UI work:



\- Preserve the existing visual language.

\- Aim for polished, funny, trustworthy, premium-feeling presentation.

\- The humor should feel official, dry, and brand-consistent.

\- Avoid making the site look childish, messy, or overly cartoony unless explicitly requested.

\- Reuse existing spacing, typography, colors, border treatments, shadows, and layout patterns.

\- Prefer strong hierarchy, clear readability, and clean section spacing.

\- Keep responsive behavior in mind from the start.

\- Avoid decorative clutter.

\- Avoid inventing a second design system.



\### Styling rules

\- Tailwind CSS v4 is used through `globals.css`.

\- Prefer existing CSS variables and brand tokens:

&#x20; - `--brand`

&#x20; - `--brand-dark`

&#x20; - `--accent`

&#x20; - `--muted`

&#x20; - `--border`

\- Prefer token-based styling over arbitrary new color choices.

\- Use existing visual patterns before creating new ones.



\## i18n and copy rules

\- Never add user-facing copy in only one language.

\- If you add or change visible UI text, update both `messages/en.json` and `messages/es.json` in the same task unless explicitly instructed otherwise.

\- Keep English copy brand-consistent: dry, official, humorous, and concise.

\- Keep Spanish copy aligned in meaning and tone, not just literally translated.



\## File editing rules

\- Prefer editing existing files over creating parallel replacements.

\- For a new page or section, inspect similar existing routes and components first.

\- Put route-specific UI close to the existing route/component structure.

\- Keep business logic out of presentational components when practical.

\- Preserve naming conventions already used in the repo.



\## Safe change priorities

If touching critical logic, optimize for correctness and minimal risk in this order:

1\. payments

2\. webhook handling

3\. database writes

4\. certificate generation

5\. email sending

6\. public UI polish



\## Known constraints

\- `middleware.ts` uses a deprecated file convention in Next.js 16 and may eventually need migration to `proxy`, but this is currently a warning rather than a priority refactor.

\- `data/members.json` is historical and no longer the source of truth.

\- PostgreSQL is the real member data source.



\## Validation before finishing

When relevant:

\- run `npm run lint`

\- run `npm run build` if the environment can validate it meaningfully

\- for UI changes, check likely mobile and desktop behavior

\- verify that new text exists in both locales

\- verify that obvious loading, empty, success, and error states are not broken where applicable



\## Final response expectations

In the final summary, always state:

1\. what changed

2\. which files were touched

3\. what validation was performed

4\. any assumptions, limitations, or unresolved risks



\## What not to do

\- do not perform broad refactors unless explicitly requested

\- do not add unnecessary dependencies

\- do not replace established patterns with a new architecture without a strong reason

\- do not leave new UI copy untranslated

\- do not make the humor random or off-brand

\- do not make high-risk payment or webhook changes casually

