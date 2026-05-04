# Open Graph images

## `wanted-sample.png` (1200 × 630)

Used as the social-share preview for `/[locale]/wanted` (Twitter card + OpenGraph).

### Current state

A temporary placeholder (copy of `public/mascots/homepage-hero-plush.png`) is in place
so the build doesn't 404 on missing image. **Replace it with a real
sample wanted poster** as soon as possible — the placeholder defeats the
purpose of the dedicated OG image.

### How to generate the real one

1. Run `npm run dev` and open `http://localhost:3000/en/wanted`.
2. Type **"Dave from Accounting"** as the name.
3. Pick the **"Clearly unprotected"** tone (the standard / default).
4. Click **Generate Wanted Poster**.
5. Optionally pick **A4** in the format toggle (more visual content).
6. Right-click the canvas preview → **Save image as…** → save somewhere temp.
7. Open the saved PNG (likely 2100 × 2970) in any image editor.
8. Crop / resize to **1200 × 630** for OG. Two reasonable options:
   - Crop the top half of the poster (header + WANTED + name + a few charges).
   - Crop the bottom area featuring the QR + reward box.
   The first option works best because the WANTED + name combo is the most
   recognizable part of the design.
9. Export as PNG, save as `public/og/wanted-sample.png`, replacing this
   placeholder.

### Targets per platform

| Platform | Recommended size | Notes |
|---|---|---|
| Open Graph (FB, LinkedIn, Slack) | 1200 × 630 | min 600 × 315, 1.91:1 ratio |
| Twitter (large card) | 1200 × 630 | same shape |
| iMessage | 1200 × 630 | same |

If you'd rather generate this dynamically per-share, swap to a Next.js
`opengraph-image.tsx` route (see `next/og` ImageResponse docs).
