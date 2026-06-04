# Korektura anglických textů (`messages/en.json`)

Korektorský a copywriterský průchod celým souborem (řádky 1–1850), doplněný strojovými kontrolami parity, ICU placeholderů, mezer a typografie. Čísla řádků odkazují na `messages/en.json`.

---

## Shrnutí

Anglické texty jsou nadprůměrně čisté — žádné skutečné pravopisné chyby ani gramatické přešlapy jsem nenašel. Skutečné nálezy jsou převážně **typografická nekonzistence** (rovné vs. typografické uvozovky, tři tečky vs. výpustek, velikost písmen u „Wanted poster"). **Jeden nález je věcný a právně relevantní**: sídlo společnosti je v Obchodních podmínkách a v Zásadách ochrany osobních údajů uvedeno odlišně.

Důležitá poznámka na úvod: část toho, co předchozí návrh označoval za chyby, **chybami není** (záměrně neformální text pro sdílení na sociálních sítích, malé „official-ish" uprostřed věty). Tyto případy níže explicitně odděluji, aby nedošlo k „přeopravení".

---

## A. Co je v pořádku (ověřeno strojově)

- **Parita klíčů EN ↔ ES**: 100 %, žádný klíč nechybí ani nepřebývá.
- **ICU placeholdery** (`{name}`, `{price}`, `{count, plural, …}`): u všech sdílených klíčů shodné v obou jazycích.
- **Dvojité mezery**: žádné.
- **Spojovník místo pomlčky**: nikde. Web správně používá dlouhou pomlčku „—" s mezerami (např. ř. 164, 439, 616). Výtka z předchozího návrhu („Digital version - print it yourself") je bezpředmětná — taková formulace v souboru není.

---

## B. Věcný nález — právně relevantní (doporučuji opravit přednostně)

**Rozdílné uvedení sídla společnosti ve dvou dokumentech.** Stejné sídlo je ve smluvním a v privacy dokumentu napsáno jinak:

- Obchodní podmínky, ř. 1577: `registered office Radlická 663/28, 150 00 Prague`
- Zásady ochrany os. údajů, ř. 1810: `registered office at Radlicka 663/28, Smichov, 150 00 Prague 5`

Liší se: diakritika („Radlická" × „Radlicka"), uvedení městské části („Smichov" jen v jednom, navíc bez diakritiky — správně „Smíchov"), a „Prague" × „Prague 5".

**Návrh:** sjednotit obě místa na jedno znění, shodné se zápisem v obchodním rejstříku. Pokud se v anglickém textu diakritika záměrně vypouští, je třeba ji vypustit konzistentně (pak ale i „Radlická" → „Radlicka"). Doporučené jednotné znění (s diakritikou, odpovídající rejstříku):

> `Radlická 663/28, Smíchov, 150 00 Praha 5, Czech Republic`

**Související, ř. 1838 a 1846:** dozorový úřad je uveden jako `UOOU`. Oficiální zkratka je **ÚOOÚ** (Úřad pro ochranu osobních údajů). V anglickém textu je vypuštění diakritiky obhajitelné, ale mělo by být konzistentní se zbytkem dokumentu (viz výše). Doporučuji buď `ÚOOÚ`, nebo plně „Office for Personal Data Protection".

---

## C. Typografická nekonzistence (skutečné nálezy)

### C1. Rovné vs. typografické uvozovky a apostrofy

Soubor používá **převážně rovné** apostrofy a uvozovky (36× rovný apostrof), ale na několika místech se objevují **typografické (kudrnaté)**. To je nejednotné. Doporučuji zvolit **jednu** konvenci — pro UI řetězce v JSON je bezpečnější varianta **rovné** (vyhne se problémům s kódováním a escapováním a odpovídá většině textu).

Kudrnatý apostrof `’` (sjednotit na `'`):

- ř. 302 — `…what they’re buying…`
- ř. 708 — `If it isn’t there…`
- ř. 732 — `Use this if you’d like…`
- ř. 1141 — `If you’re putting it on the wall…`
- ř. 1452 — `…someone else’s problem…`

Kudrnaté dvojité uvozovky `“ ”` (sjednotit na `"`):

- ř. 1376 — `choose “Save to Photos”`
- ř. 1432 — `“I deny being a snack…”`
- ř. 1433 — `filed it under “Interesting, but insufficient.”`
- ř. 1446 — `circled the word “someone”`
- ř. 1452 — `…` (viz výše, ve stejném řetězci)
- ř. 1761 — `using the “Cookies settings” link`

A naopak — jediné místo, kde se jako uvozovky používají **rovné jednoduché** uvozovky:

- ř. 1090 — `no 'catch of the day' signs` → po sjednocení na rovné dvojité: `no "catch of the day" signs`

Pozn.: pokud byste naopak chtěl jednotně typografické uvozovky (hezčí v tištěném certifikátu), je to obhajitelné, ale pak je nutné převést **všech** 36 rovných apostrofů — větší a rizikovější zásah. Doporučuji rovné.

### C2. Tři tečky vs. znak výpustku `…`

Také nejednotné:

- ASCII tři tečky `...`: ř. 902 (`oceanic archives...`), ř. 1332 (`Preparing poster...`), ř. 1515 (`Consulting the archives...`)
- Znak výpustku `…`: ř. 788 (`Preparing your Story…`), ř. 976 (`m-3f8a…`), ř. 978 (`Checking…`)

**Návrh:** sjednotit na jednu variantu. Pro UI doporučuji rovněž ASCII `...` (konzistence s rovnými uvozovkami) — tedy ř. 788, 976, 978 převést na `...`.

### C3. Velikost písmen u „Wanted poster"

Toto je jediné místo, kde výtka předchozího návrhu na Title Case vs. sentence case **skutečně platí** — jen s jiným příkladem. Produkt je psán třemi způsoby:

- Title Case „Wanted Poster": ř. 89, 116 (navigace), 794, 982, 1028, 1272 (tlačítka)
- sentence case „Wanted poster": ř. 22, 147, 377, 378, 730, 969, 1453
- celé malými „wanted poster": **ř. 1650** — `Generate a wanted poster` (jasný výstřelek vůči sourozeneckým klíčům, kde je „Wanted poster")

**Návrh:** stanovit pravidlo a držet ho. Rozumná konvence: „Wanted poster" jako obecné podstatné jméno (sentence case) v běžném textu i na tlačítkách; Title Case ponechat jen pro navigační štítek a SEO titulky. Minimum: opravit ř. 1650 `wanted` → `Wanted` a sjednotit tlačítka („Generate Wanted Poster" × „Generate a Wanted poster").

### C4. „café/cafés" vs. „cafes"

- s diakritikou: ř. 212, 451, 487 (`café`, `cafés`)
- bez diakritiky: ř. 374 (`cafes`)

**Návrh:** sjednotit na `cafés` (ř. 374: `offices, cafes, studios` → `offices, cafés, studios`).

---

## D. Záměrné volby — NEopravovat (kontrola proti „přeopravení")

Tyto případy vypadají jako nekonzistence, ale jde o funkční a stylově odůvodněné volby. Uvádím je proto, aby se omylem „neopravily":

- **Malá písmena ve sdíleném textu pro sociální sítě** (ř. 825–826, 833–844, 835): `a protected friend`, `not a snack`, `shark-free zone`, `Reviewed and found non-snack`. Jde o `subline`/`previewHeadline`/`nativeTitle`/`nativeText` — záměrně neformální „mluvený" register pro Instagram. Ponechat.
- **`official-ish` malými uprostřed věty** (ř. 4, 11, 12, 28, 56, 900) je správně; verzálkové „Official-ish" jen na začátku titulku (ř. 27). V pořádku.
- **„OFFICIAL CERTIFICATE: SHARK-FREE ZONE"** verzálkami (ř. 1085) — záměrný titulek certifikátu.
- **`Proudly shark-free since 2026`** (ř. 666) — placeholder dedikace, malé „shark-free" je zde namístě.

### Hraniční případ (volba, ne chyba)

- **„the alliance" / „The alliance" malými** (ř. 258–259, domovské FAQ) vs. „the Alliance" velkým **všude jinde** (76×). Buď jde o záměrné „vystoupení z role" při upřímné odpovědi „Is the alliance real?", nebo o nedopatření. Doporučení: pokud nemá jít o záměr, sjednotit na „the Alliance" kvůli konzistenci značky (Aliance je v textech důsledně vlastní jméno). Nechávám na vašem rozhodnutí.

---

## E. Parita s `es.json`

Klíče a placeholdery jsou v pořádku. Typografické nálezy z části C (uvozovky, výpustek) se **velmi pravděpodobně týkají i `es.json`** — doporučuji stejný typografický průchod i tam, aby sjednocení platilo napříč oběma jazyky. Mohu provést.

---

## Návrh dalšího postupu

Mohu změny rovnou aplikovat do `en.json` (a paralelně do `es.json`) a dodat git diff k odsouhlasení. Doporučené pořadí podle priority: **B (právní)** → **C3 (Wanted poster)** → **C1/C2 (typografie)** → **C4** → rozhodnutí o **D (the alliance)**.
