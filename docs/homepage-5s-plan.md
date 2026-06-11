# Homepage: plán úprav pro 5-second rule + gift-first + free kanál

Stav: IMPLEMENTOVÁNO 2026-06-10 — čeká lokální `npx tsc --noEmit && npm run lint` a vizuální kontrola (bash sandbox v session desynchronizovaný, ověřeno Read toolem).
Datum: 2026-06-10

Revize po implementaci (2026-06-10): `hero.description` doplněna o účel ("Protection: ceremonial. Morale: improved."); `hero.trustDescription` finálně BEZ čísla donace ("tracked and reported, certificate by certificate") — původní "{donation} from every certificate" byla fakticky chybná napříč tiery ($1 platí jen pro Protected; Non-Snack $12, Business $70). Přesné částky zůstávají na pricing kartách. `{donation}` placeholder z hero odstraněn; helper `getTierDonationLabel` v lib/tiers.ts ponechán pro budoucí použití.

## Cíl

Po 5 sekundách na homepage má návštěvník vědět: (1) je to personalizovaný **certifikát**, (2) primárně **dárek**, (3) stojí **$4** (řečeno tiše, ne v tlačítku), (4) konzervační část je **reálná**, (5) existuje **bezplatný kanál** (Wanted). Na mobilu musí být CTA v prvním viewportu.

Rozhodnuto v diskusi: cena NEPATŘÍ do CTA tlačítek (riziko předčasného transakčního signálu); patří do faktického řádku description. Gift je primární use case.

---

## Změna 1 — Hero: gift-first, cena v description, mobil

### 1a) Texty (`messages/en.json` + `es.json`, namespace `hero`)

| Klíč | Nová hodnota EN | Nová hodnota ES |
|---|---|---|
| `description` | `A personalized certificate for friends, coworkers, and beach-worriers. {price}, delivered instantly.` | `Un certificado personalizado para amigos, compañeros de trabajo y gente preocupada por la playa. {price}, entrega inmediata.` |
| `trustDescription` | `The Alliance is fictional. The conservation commitment is real — {donation} from every certificate.` | `La Alianza es ficticia. El compromiso con la conservación es real: {donation} de cada certificado.` |
| `ctaPrimary` | `File paperwork for a friend` | `Presenta papeleo para un amigo` |
| `ctaSecondary` | beze změny (`Preview the certificate`) | beze změny |
| `giftTeaserLink`, `wantedTeaserLink` | SMAZAT (viz 1c) | SMAZAT |

Pozn.: `{price}` a `{donation}` jako ICU placeholdery — cena se nedávno měnila ($5→$4), nesmí být natvrdo v textech. POZOR (CLAUDE.md): bare `t("description")` by vyrenderoval `{price}` literálně — volání musí předat parametry.

### 1b) `components/home/hero-section.tsx` (4,6 KB → Edit tool OK)

1. Import `getTierPriceLabel` z `@/lib/tiers`; donation label: buď nový helper `getTierDonationLabel` v `lib/tiers.ts` (preferováno, zrcadlí `getTierPriceLabel`, čerpá z `TIER_DONATIONS`), nebo lokální výpočet.
2. `t("description", { price: getTierPriceLabel("protected") })`, `t("trustDescription", { donation: getTierDonationLabel("protected") })`.
3. Primární CTA href: `/purchase?tier=protected` → `/purchase?tier=protected&gift=true`.
4. Smazat celý blok `heroTeaserLinks` (gift/wanted chipy).
5. **Mobil — klíčová změna:** blok akcí `lg:hidden` (řádky ~107–112) přesunout z konce gridu do textového sloupce hned za `trustDescription`. Výsledné pořadí na mobilu: badge → H1 → 3 řádky → **tlačítka** → obrázek. Desktop beze změny (blok `hidden lg:block` zůstává).
6. Popisky maskotů pod obrázkem (řádky ~92–103): obalit `hidden sm:block` — na mobilu zmizí, na desktopu zůstanou.

### 1c) Mazání klíčů

Před smazáním `giftTeaserLink`/`wantedTeaserLink` ověřit grepem, že je nepoužívá nic jiného než hero-section (CLAUDE.md: dead-key grep over-reportuje, ověřit per-klíč). Mazat v obou jazycích současně (parita).

---

## Změna 2 — Sekce Wanted na homepage (free kanál)

### 2a) Umístění

`components/home/home-content.tsx` (~16 KB → Edit tool OK): nová sekce **mezi `#real-impact` a `#home-final-cta`**. Logika scrollu: preview → tiery → impact (důvěra) → Wanted (záchyt nerozhodnutých) → final CTA (návrat ke koupi).

### 2b) Texty (nový namespace `home.wantedTeaser`)

| Klíč | EN | ES |
|---|---|---|
| `label` | `Public reporting channel` | `Canal público de denuncias` |
| `title` | `Some humans remain dangerously paperwork-free.` | `Algunos humanos siguen peligrosamente sin papeleo.` |
| `text` | `The Bureau operates a free public reporting channel. Open a Wanted case on a friend, coworker, or other undocumented human — instant, shareable, and administratively dramatic.` | `La Oficina opera un canal público y gratuito de denuncias. Abre un caso Wanted sobre un amigo, compañero de trabajo u otro humano indocumentado: instantáneo, compartible y administrativamente dramático.` |
| `cta` | `Open a Wanted case — it's free` | `Abre un caso Wanted — es gratis` |

"Free" zde říct explicitně — je to pointa sekce (na rozdíl od ceny v hero).

### 2c) Vizuál

Čistě CSS, žádné nové assety: karta na poster paper `#F6ECD8`, dvojitý rámeček, serif/mono "WANTED" titulek, malý červený (`#B94135`) "CASE OPEN" štítek rotovaný ~-8° (stamp dojem). Vintage akcent = vizuální oddech mezi čistými sekcemi, konzistentní s brand-kitem (template 3 Wanted Case).

### 2d) Analytika

1. `lib/analytics-events.ts`: do `ANALYTICS_SOURCES` přidat `homeWanted: "home_wanted_cta"`.
2. CTA: `trackEvent("wanted_teaser_click", { source: "home_wanted_cta" })` na click (vzor: `certificate_preview_interaction` v home-content).
3. Aktualizovat kanonický kontrakt `docs/analytics-events.md` (nový event + source).
4. Atribuce nákupů z Wanted flow zůstává přes stávající `wanted_*` sources — nic dalšího netřeba.

---

## Změna 3 — Volitelné: 404 + FAQ

1. **404** (`messages` namespace `notFound` + `app/[locale]/not-found.tsx`): přidat klíč `wantedCta: "Open a Wanted case"` → `/wanted` jako třetí akci. Stávající copy ("This page escaped the filing cabinet.") už je v tónu, jen doplnit akci.
2. **FAQ**: přidat otázku `Is there a free option?` s odpovědí odkazující na Wanted generátor (free, instant) a vysvětlením, že case lze později "uzavřít paperworkem". Přesné umístění v FAQ struktuře ověřit při implementaci (strukturu faq namespace jsem zatím nečetl).

---

## Co se NEMĚNÍ (vědomě)

- Cena v CTA tlačítkách (hero, header, sticky) — NE, viz diskuse.
- Header CTA `File shark paperwork` a sticky CTA — beze změny, zůstávají jako self-purchase vstup (vyvažují gift-first hero).
- H1, badge "Snack status: under review", brandLine — silné, beze změny.
- Hero obrázek a `priority` loading — beze změny (LCP).

## Pořadí implementace a verifikace

1. `messages/{en,es}.json` — JEDINĚ Python přes bash (CLAUDE.md): assert unikátnosti markerů + `json.loads` + parity check klíčů v témže volání.
2. `lib/tiers.ts` (+`getTierDonationLabel`), `lib/analytics-events.ts` — malé soubory, Edit tool.
3. `hero-section.tsx`, `home-content.tsx` — Edit tool, po editu ověřit Read toolem (bash sandbox se v této session desynchronizoval — bash výstupům o "truncated" souborech nevěřit, ověřovat Read/Grep).
4. `docs/analytics-events.md`, 404, FAQ.
5. Lokálně (uživatel): `npx tsc --noEmit && npm run lint`, vizuální kontrola dev serveru — mobil 390×844: tlačítka viditelná bez scrollu; desktop 1340: hero bez chipů.
6. Po deployi: týden sledovat `begin_checkout` (hero source), `wanted_teaser_click`, gift ratio ve Stripe metadatech. Volitelně Lyssna five-second test nového hero (otázky: Co web prodává? Kolik to stojí? Co je tu skutečné?).

## Rizika

1. **`gift=true` v primárním CTA** předvyplní gift toggle i self-kupcům → musí jít snadno vypnout (purchase flow toggle existuje). Pokud by gift ratio v datech bylo < ~50 %, vrátit href bez `gift=true` a nechat jen copy.
2. **Wanted chip pryč z hero** může krátkodobě snížit traffic na /wanted, než ho dožene nová sekce + nav. Sledovat `wanted_poster_generate`.
3. **Mazání i18n klíčů**: při přehlédnutém použití jinde spadne render na missing key — proto grep před smazáním; v pochybnosti klíče nechat (dead-key úklid je v CLAUDE.md veden jako pending).
4. **ICU**: zapomenutý parametr = literální `{price}` na produkci. Po nasazení vizuálně zkontrolovat obě locale.
5. Tabulky výše obsahují finální copy — případné korektury EN/ES provést PŘED implementací, ať se messages editují jednou.
