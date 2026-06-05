# Caching & server-side optimalizace — Shark Human Alliance (Vercel)

> Stack: Next.js 16 (App Router) na Vercelu. Tahle strategie je psaná pro **Vercel**, ne pro Apache/Nginx. Sekce s `.htaccess` je až v příloze a na Vercelu **nefunguje** — je jen pro případ migrace na vlastní Apache server.

---

## 0) Reality check — co na Vercelu platí jinak

| Co se běžně radí | Realita na Vercelu |
|---|---|
| Nahraj `.htaccess` s cache pravidly | Vercel **není Apache**. `.htaccess` se ignoruje. Hlavičky se řeší v `next.config.ts` `headers()` nebo `vercel.json`. |
| Zapni GZIP/Brotli v configu serveru | Vercel komprimuje **automaticky** (Brotli/gzip dle `Accept-Encoding`). Nedá se a netřeba konfigurovat. |
| Nasaď CDN (Cloudflare, Fastly…) | Vercel **sám je CDN** (Edge Network, ~100 PoP). Statika a ISR stránky se cachují na edge automaticky. |
| Přidej preconnect na Google Fonts | Fonty jsou **self-hostované** přes `next/font`. Žádné spojení na `fonts.gstatic.com` v runtime → preconnect by byl zbytečný. |

**Jediný runtime third-party origin tohoto webu je Google Analytics** (`googletagmanager.com` + `google-analytics.com`). QR kódy jsou lokální data-URI, Stripe je server-side redirect, fonty self-hostované.

---

## 1) Browser caching policy — přesné Cache-Control podle typu

| Typ / cesta | Cache-Control | Kdo to nastaví |
|---|---|---|
| `/_next/static/*` (hashované JS, CSS, fonty) | `public, max-age=31536000, immutable` | **Next automaticky** — neměnit |
| `/_next/image*` (optimalizované přes `next/image`) | `public, max-age=31536000, immutable` (řídí `images.minimumCacheTTL`) | Vercel + `next.config` |
| `public/` obrázky (`png, jpg, webp, avif, gif`) a fonty (`woff2`…) | `public, max-age=31536000, immutable` | `next.config.ts headers()` ✅ implementováno |
| `favicon.svg`, `manifest.json`, `robots.txt`, `sitemap.xml` | `public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400` | `next.config.ts headers()` ✅ implementováno |
| **HTML stránky** (statické + ISR) | **NENASTAVOVAT ručně** — rozbilo by to ISR. Next/Vercel řídí přes `s-maxage` + `stale-while-revalidate` | Next/Vercel |
| **RSC payload** (`?_rsc=…`) | řízeno Next | Next |
| `/api/*` (dynamické) | `no-store` (default), cacheovatelné GET routy si nastaví vlastní `s-maxage` | route handler / `headers()` |

### Klíčové pravidlo `immutable` u `/public`

Soubory v `/public` **nemají hash v názvu**. `immutable` říká prohlížeči „tohle už nikdy nestahuj". Když změníš obsah pod stejným názvem, vracející se návštěvník dostane **starou verzi napořád**. Proto: **při změně obsahu přejmenuj soubor** (`cert-bg.webp` → `cert-bg-v2.webp`) nebo přidej query (`?v=2`). Naopak `/_next/static/*` hash má, takže tam je `immutable` bez rizika.

---

## 2) Implementace — `next.config.ts` (kanonické místo)

Pro Next aplikaci patří hlavičky sem (funguje na Vercelu, lokálně i jinde). **Už je nasazeno** v repu:

```ts
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Long-lived media & fonts in /public (NOT hashed → rename on change).
        source: "/:path*.(png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Icons / manifest / SEO files — must stay updatable.
        source: "/:file(favicon.svg|manifest.json|robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
```

### Volitelně: `no-store` pro API

Pokud chceš tvrdě zakázat cachování API, přidej do pole `headers()` další blok:

```ts
{
  source: "/api/:path*",
  headers: [{ key: "Cache-Control", value: "no-store" }],
},
```

> Pozor: pokud konkrétní route handler (`app/api/.../route.ts`) vrací vlastní `Cache-Control`, vznikne dvojitá hlavička. Buď nastav `no-store` globálně **a** v handlerech ho nepřepisuj, nebo to řeš per-route. Pro cacheovatelné GET (např. `/api/members`) je lepší přímo v handleru:
> ```ts
> return Response.json(data, {
>   headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
> });
> ```
> Routy `checkout`, `webhook`, `member-by-session`, `member-privacy` musí zůstat `no-store` (jsou per-user / mutující).

---

## 3) Alternativa / doplněk — `vercel.json`

Tvůj `vercel.json` teď obsahuje jen `redirects`. Hlavičky **nech v `next.config.ts`** (jedno místo, žádná duplicita). Kdybys je chtěl mít ve `vercel.json` místo toho, vypadalo by to takhle — ale **nepoužívej obě varianty zároveň**:

```jsonc
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [ /* ...stávající... */ ],
  "headers": [
    {
      "source": "/:path*.(png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(favicon.svg|manifest.json|robots.txt|sitemap.xml)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```

---

## 4) GZIP / Brotli komprese

**Nedělej nic — Vercel to řeší sám.** Edge automaticky vrací Brotli (`br`) nebo gzip podle `Accept-Encoding` klienta pro textové typy (HTML, JS, CSS, JSON, SVG, XML). Už komprimované formáty (webp, avif, png, woff2) znovu nekomprimuje (správně — bylo by to kontraproduktivní).

Ověření:

```bash
# Brotli na JS bundlu:
curl -sI -H "Accept-Encoding: br" https://www.sharkhumanalliance.com/_next/static/chunks/main.js | grep -i content-encoding
# očekávané: content-encoding: br

# HTML stránka:
curl -sI -H "Accept-Encoding: br" https://www.sharkhumanalliance.com/en | grep -i content-encoding
```

---

## 5) CDN — implementační plán pro Vercel Edge Network

Vercel je CDN; práce je hlavně v tom **maximalizovat, co se dá cachovat na edge**:

1. **Statické stránky.** Marketingové routy mají `generateStaticParams` (en/es) a `setRequestLocale` → renderují se staticky při buildu a servírují z edge cache. Drž je bez `cookies()`/`headers()`/`no-store`, ať zůstanou statické.
2. **ISR tam, kde jsou data.** Pro stránky s daty z DB (registry) zvaž `export const revalidate = 60;` — stránka se cachuje na edge a přegeneruje na pozadí. Edge pak vrací `s-maxage=60, stale-while-revalidate`.
3. **Obrázky.** `next/image` (hero, registry) servíruje AVIF/WebP z edge image cache; `minimumCacheTTL` = rok. Syrová certifikátová pozadí jdou jako statika z `/public` s `immutable`.
4. **Edge caching pro cacheovatelné API.** Veřejné GET (např. seznam členů registru) můžou vracet `s-maxage` (viz výše) → odpověď se cachuje na edge, ne se počítá při každém requestu.
5. **Regiony.** Funkce běží defaultně v jednom regionu. Pokud je DB v EU, nastav region funkcí blízko DB (`vercel.json` → `"functions"` / project settings), ať SSR/API nemají cross-region latenci k Postgresu.
6. **Cache-busting deploymentem.** Každý deploy dostane nové hashe pro `/_next/static/*`, takže immutable cache se „prolomí" automaticky. Jen `/public` soubory řeš přejmenováním.

---

## 6) DNS prefetch / preconnect — third-party resource hints

Grep přes celý kód: jediné origins načítané **jako resource v runtime** jsou Google Analytics. **Už je nasazeno** v `app/[locale]/layout.tsx` v `<head>`:

```tsx
{/* GA je jediný runtime third-party origin. Fonty jsou self-hostované,
    Stripe je server-redirect — žádné resource hints nepotřebují.
    GA je consent-gated a afterInteractive → dns-prefetch (jen DNS) je
    levnější a bezpečnější než preconnect, který by otevíral zbytečné
    TCP/TLS spojení i uživatelům, co analytiku odmítnou. */}
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
```

**Proč ne `preconnect`:** preconnect otevírá plné TCP+TLS spojení hned. GA se ale načítá až `afterInteractive` a jen po souhlasu s cookies. Preconnect by tedy plýtval spojením u všech, kdo souhlas nedají. `dns-prefetch` udělá jen DNS lookup — levné a užitečné, ať se GA nakonec načte nebo ne.

**Co NEpřidávat (časté chyby):**
- `preconnect` na `fonts.googleapis.com` / `fonts.gstatic.com` — fonty jsou self-hostované.
- `preconnect` na `js.stripe.com` — Stripe je server-side redirect na `checkout.stripe.com` (navigace, ne subresource; preconnect nepomůže).
- `preconnect` na `api.qrserver.com` — QR se generuje lokálně.

---

## 7) Verifikační checklist (po deployi)

```bash
BASE=https://www.sharkhumanalliance.com

# 1) Immutable na statice z /public
curl -sI $BASE/cert-seal.png | grep -i cache-control
#   public, max-age=31536000, immutable

# 2) Hashovaná Next statika
curl -sI $BASE/_next/static/css/*.css | grep -i cache-control   # immutable

# 3) Favicon NENÍ immutable (jde aktualizovat)
curl -sI $BASE/favicon.svg | grep -i cache-control
#   public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400

# 4) Brotli
curl -sI -H "Accept-Encoding: br" $BASE/en | grep -i content-encoding   # br

# 5) HTML stránka má edge cache hlavičky (x-vercel-cache: HIT na 2. request)
curl -sI $BASE/en | grep -i x-vercel-cache

# 6) API se necachuje
curl -sI $BASE/api/members | grep -i cache-control
```

Cíl u `x-vercel-cache`: `HIT` (stránka servírovaná z edge) nebo `STALE` (SWR background revalidate). `MISS`/`BYPASS` na statické stránce = něco ji dělá dynamickou.

---

## Příloha A — `.htaccess` (POUZE mimo Vercel)

**Na Vercelu nefunguje.** Použij jen kdyby ses stěhoval na vlastní **Apache** server. Pro Nginx je ekvivalent níž.

```apache
# .htaccess — Apache only (NEfunguje na Vercelu)

# ----- Komprese -----
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/css application/javascript application/json image/svg+xml application/xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json image/svg+xml application/xml
</IfModule>

# ----- Cache-Control -----
<IfModule mod_headers.c>
  # Hashovaná build statika
  <FilesMatch "\.(js|css|woff2?|ttf|otf)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Obrázky v /public (nehashované → měň název při změně)
  <FilesMatch "\.(png|jpe?g|gif|webp|avif)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Ikony / manifest / SEO — aktualizovatelné
  <FilesMatch "^(favicon\.svg|manifest\.json|robots\.txt|sitemap\.xml)$">
    Header set Cache-Control "public, max-age=86400, stale-while-revalidate=86400"
  </FilesMatch>
  # HTML — nech revalidovat
  <FilesMatch "\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
```

### Nginx ekvivalent

```nginx
# komprese
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml application/xml;
# brotli on; brotli_types ...;   # vyžaduje ngx_brotli modul

location ~* \.(js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|avif)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* ^/(favicon\.svg|manifest\.json|robots\.txt|sitemap\.xml)$ {
  add_header Cache-Control "public, max-age=86400";
}
```

---

## Shrnutí — co je hotové vs. doporučené

**Nasazeno v repu (tímto):**
- `next.config.ts`: AVIF/WebP, `minimumCacheTTL` rok, immutable pro media/fonty, kratší TTL pro favicon/manifest/robots/sitemap.
- `layout.tsx`: `dns-prefetch` na GA.

**Řeší Vercel automaticky:** Brotli/gzip, CDN edge cache, immutable hashovaná statika, image optimization cache.

**K rozhodnutí:** `no-store` pro `/api/*` (per-route vs. globálně), ISR `revalidate` pro `/registry`, region funkcí u EU databáze.
