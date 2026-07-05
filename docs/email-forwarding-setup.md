# Nastavení e-mailu na doméně sharkhumanalliance.com

Cíl: aby pošta poslaná na adresu na doméně (např. `info@sharkhumanalliance.com`)
padala rovnou do tvého Gmailu. Volitelně také aby ses z Gmailu mohl **jako** tato
adresa i odpovídat.

## Výchozí stav (ověřeno)

- **DNS domény běží na Vercelu** (nameservery `ns1/ns2.vercel-dns.com`). Nic se
  nepřesouvá — všechno vyřešíš přidáním pár DNS záznamů ve Vercelu.
- **Root doména nemá žádné MX** → dnes neumí přijímat poštu. To je jediné, co
  chybí.
- **Odesílání už funguje přes Resend** ze subdomény
  `updates.sharkhumanalliance.com` (DKIM je nasazený, návratová cesta přes Amazon
  SES v regionu EU – eu-west-1). Tyhle záznamy se **nesmí mazat**.
- Protože Resend sedí na subdoméně, **root je čistý** — přidání přeposílání na root
  nic z Resendu nerozbije a žádné slučování SPF se neřeší.

Zvolená služba pro příjem/přeposílání: **ImprovMX** (zdarma, nejjednodušší).
Alternativa: **Forward Email** (open-source, umí i bezplatné „odeslat jako") —
záznamy jsou obdobné, viz konec dokumentu.

---

## Část A — Rozhodnutí, jaké adresy chceš

Doporučení pro start:

- `info@sharkhumanalliance.com` → tvůj Gmail (hlavní kontaktní adresa), a
- catch-all `*@sharkhumanalliance.com` → tvůj Gmail (chytne cokoli\@doména, ať ti
  nic neuteče).

Cílovou schránku (kam se přeposílá) si drž po ruce, dál v textu ji píšu jako
`tvuj-email@gmail.com`.

---

## Část B — Založení přeposílání v ImprovMX

1. Otevři **improvmx.com** → **Sign up** (zdarma, bez karty). Můžeš se přihlásit
   přímo přes Google účet toho Gmailu, kam chceš poštu.
2. **Add domain** → zadej `sharkhumanalliance.com`.
3. Vytvoř aliasy:
   - alias `info` → `tvuj-email@gmail.com`
   - (volitelně) alias `*` (catch-all) → `tvuj-email@gmail.com`
4. ImprovMX ti hned ukáže **přesné DNS záznamy** (MX + SPF, případně DKIM). Nech si
   tuhle stránku otevřenou (Domain settings → DNS / Instructions) — hodnoty odtud
   mají přednost, budeš je opisovat do Vercelu.

Standardní hodnoty ImprovMX (pro kontrolu, že sedí):

| Typ | Host / Name | Hodnota | Priorita |
|-----|-------------|---------|----------|
| MX  | `@`         | `mx1.improvmx.com` | `10` |
| MX  | `@`         | `mx2.improvmx.com` | `20` |
| TXT | `@`         | `v=spf1 include:spf.improvmx.com ~all` | — |

Pokud ImprovMX navíc nabídne **DKIM** (TXT, název typicky `improvmx._domainkey`),
přidej ho také — zlepší doručitelnost.

---

## Část C — Přidání DNS záznamů ve Vercelu

Kde: **Vercel dashboard → doména `sharkhumanalliance.com` → DNS Records**
(sekce Domains — buď v projektu, nebo na úrovni týmu, podle toho, kde je doména
vedená).

1. Otevři **DNS Records** pro `sharkhumanalliance.com`.
2. Zkontroluj, že na root (`@`) **nejsou žádné staré MX** (dle ověření tam nejsou).
   Kdyby ano, musely by pryč — na rootu smí být jen jedna sada MX.
3. Přidej **MX**: Type `MX`, Name `@`, Value `mx1.improvmx.com`, Priority `10`.
4. Přidej **MX**: Type `MX`, Name `@`, Value `mx2.improvmx.com`, Priority `20`.
5. Přidej **TXT (SPF)**: Type `TXT`, Name `@`,
   Value `v=spf1 include:spf.improvmx.com ~all`.
6. (Je-li vyžadován) přidej **TXT DKIM** přesně podle stránky ImprovMX.
7. **Nemaž a neměň** stávající: `google-site-verification` TXT na rootu a **vše na
   `updates.` a `send.updates.`** (to je Resend — kdybys to smazal, přestanou
   chodit e-maily s certifikáty z webu).
8. Ulož.

Varianta přes Vercel CLI (kdyby se ti to líbilo víc než klikání):

```bash
vercel dns add sharkhumanalliance.com @ MX mx1.improvmx.com 10
vercel dns add sharkhumanalliance.com @ MX mx2.improvmx.com 20
vercel dns add sharkhumanalliance.com @ TXT "v=spf1 include:spf.improvmx.com ~all"
```

(Nutný nainstalovaný Vercel CLI a `vercel login`.)

---

## Část D — Ověření a test

1. Zpět v ImprovMX klikni na **Check / Verify** a počkej, až MX i SPF **zezelenají**
   (propagace obvykle 5–30 min, výjimečně déle).
2. **Test příjmu:** z jiné schránky pošli e-mail na `info@sharkhumanalliance.com` —
   musí přijít do tvého Gmailu. Kdyby nic, koukni do složky **Spam**.
3. Tím je **příjem hotový**.

---

## Část E (volitelné) — Odpovídat / psát „jako" ta adresa z Gmailu

Aby odchozí e-maily z Gmailu mohly jít jako `info@sharkhumanalliance.com`,
potřebuješ odchozí **SMTP**. Dvě cesty:

### Cesta 1 — využít stávající Resend (bez nové služby)

- Nejsnáz pošleš „jako" `hello@updates.sharkhumanalliance.com` — tahle identita je
  v Resendu **už ověřená** a funguje hned.
- Chceš-li posílat „jako" `info@sharkhumanalliance.com` (root), musíš v Resendu
  přidat i **root doménu** (Resend → Domains → Add Domain → `sharkhumanalliance.com`
  → doplnit vypsané DKIM/SPF/return-path záznamy do Vercelu, obdoba subdomény).
- SMTP údaje Resendu: host `smtp.resend.com`, port `465` (SSL) nebo `587` (TLS),
  uživatel `resend`, heslo = tvůj **Resend API klíč** (Resend → API Keys).
- V Gmailu: ⚙️ **Nastavení → Zobrazit všechna nastavení → Účty a import →
  „Odeslat poštu jako" → Přidat další e-mailovou adresu.**
  - Zadej jméno a adresu (`info@…` nebo `hello@updates…`).
  - SMTP server `smtp.resend.com`, port `465`, uživatel `resend`, heslo = API klíč,
    zabezpečení SSL.
  - Gmail pošle na tu adresu **ověřovací kód** — protože ji přeposíláš do Gmailu
    (Část B–D), kód ti přijde do schránky → potvrď.

Pozor: odchozí maily se počítají do **odesílací kvóty Resendu** a míchají projektovou
odesílací identitu s osobní poštou. Pro pár odpovědí OK; pro čisté oddělení viz
Cesta 2.

### Cesta 2 — Forward Email místo ImprovMX

- Použij **forwardemail.net** (stejná logika jako ImprovMX): MX
  `mx1.forwardemail.net` (10) a `mx2.forwardemail.net` (20) + jejich TXT záznam.
  Na rootu smí být **jen jedna** sada MX — tedy ImprovMX **nebo** Forward Email,
  ne obojí.
- Free tarif Forward Email umí **„Send Mail As" přes Gmail**, takže odesílání
  vyřešíš bez Resendu i bez placení.

---

## Část F — Na co si dát pozor

- **Nemaž** Resend záznamy na `updates.` a `send.updates.` — přišel bys o odesílání
  z webu.
- **Neměň nameservery** — zůstávají na Vercelu. Vše se řeší přidáním záznamů.
- **Jen jedna sada MX na root** — jedna služba (ImprovMX *nebo* Forward Email).
- **Jen jeden SPF (TXT `v=spf1…`) na root.** Teď tam žádný není, takže přidáváš
  první — v pořádku. (Resend SPF je na subdoméně, nekoliduje.)
- ImprovMX free je **jen přeposílání**, ne nástroj na hromadné maily.

---

## Rychlý přehled — co přidat do Vercel DNS

| Typ | Host/Name | Hodnota | Priorita |
|-----|-----------|---------|----------|
| MX  | `@` | `mx1.improvmx.com` | `10` |
| MX  | `@` | `mx2.improvmx.com` | `20` |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | — |
| TXT (DKIM, jen je-li vyžadován ImprovMX) | dle ImprovMX | dle ImprovMX | — |

**Ponechat beze změny:** `google-site-verification` TXT na `@`; vše na
`updates.sharkhumanalliance.com` a `send.updates.sharkhumanalliance.com` (Resend).

---

## Shrnutí v jedné větě

Ve Vercelu přidáš 2× MX + 1× TXT (SPF) z ImprovMX, v ImprovMX nastavíš alias
`info` (a případně catch-all) na svůj Gmail, počkáš na ověření a otestuješ —
a hotovo. Odesílání „jako" (Část E) je nepovinný bonus.
