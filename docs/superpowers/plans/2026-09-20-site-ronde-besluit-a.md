# Site-ronde bij propositiebesluit A: de bespreking uit het aanbod, prijsstaffel erin: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **POORT 3b, lees dit eerst.** Deze branch mag nu gebouwd worden, maar de site belooft na deze ronde de gespreksleidraad, de werkvragen en de besluitpagina. Die bestaan pas als plan 3b (`docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md`) is gemerged én live staat op Railway. **De uitvoerder merget niet en pusht niet.** De hoofdsessie merget `feature/site-ronde-a` pas na (1) merge en deploy van 3b en (2) een koude leesronde die gat B3 dicht verklaart. Zet deze alinea letterlijk bovenaan het uitvoeringsverslag.

> **POORT 3c.** Task 17 (de definitieve vervolgmetingszin) wordt **niet uitgevoerd vóór plan 3c is gemerged**. Tot dan staat overal de tussenvorm uit spec par. 4.3 en 4.5.

**Goal:** De publieke site verkoopt wat Loep sinds besluit A levert: een meting en een rapport dat het MT-gesprek leidt, dat gesprek voert de klant zelf, tegen een vaste prijs naar organisatiegrootte. Elke belofte van een bespreking door Loep, het woord "begeleid" en de claim "geen zelfbedieningstool" verdwijnen, dode marketingcode gaat weg, en elk bedrag komt uit één bron.

**Architecture:** Twee nieuwe pure modules dragen wat op meer dan één plek terugkomt: `frontend/lib/pricing.ts` (de staffel, de weergavehelpers, de FAQ-zin en de JSON-LD `OfferCatalog`) en `frontend/lib/site-meta.ts` (paginatitel en beschrijving). Componenten en pagina's importeren daaruit; er staat geen los Loep-bedrag meer in een gerenderd bestand. Eén nieuwe guardtest (`frontend/lib/site-ronde-besluit-a.guard.test.ts`) leest alle gerenderde marketingbestanden en verbiedt de oude beloftes en losse bedragen, zodat ze niet terugsluipen. Dode code (de doorverwezen pagina's `/aanpak`, `/tarieven`, de drie detailpagina's in `app/producten/[slug]/page.tsx` en de exports in `site-content.ts` zonder gerenderde gebruiker) wordt verwijderd na bewijs per grep, met de contract-tests in lockstep. De redirects in `next.config.ts` blijven ongewijzigd.

**Tech Stack:** Next.js 15 App Router (server components, `metadata`-export, `permanentRedirect`), TypeScript strict, vitest 3 (source-guard-tests met `readFileSync` en pure-functietests; er is géén testing-library en géén jsdom), inline-style componenten met de tokens `T`, `AC`, `FF`, `SHELL` uit `components/marketing/design-tokens`. Geen backend- en geen databasewijziging.

**Spec:** `docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md` (status akkoord; besluiten in par. 8 gaan vóór par. 2 en par. 4.1 waar ze botsen). Hoort bij besluit 2026-09-19 (optie A) en besluit 2026-09-11 (het rapport werkt zonder begeleiding).

**Stand van main:** `967ede3a` (20 september; de onware methodeclaim is er al uit). Regelnummers hieronder zijn op die stand geverifieerd. Taken raken deels dezelfde bestanden, dus na de eerste wijziging schuiven nummers op: **gebruik dan het geciteerde nu-fragment als anker, niet het nummer.** Staat een nu-fragment niet letterlijk in het bestand, stop en meld het; verzin geen vervanging.

**Werkplek:** git worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\site-ronde-a` op branch `feature/site-ronde-a` (Task 0). Alle paden hieronder zijn relatief aan de worktree-root tenzij ze met `C:\` beginnen; alle `npx`- en `npm`-commando's draaien vanuit `frontend/` in de worktree. **Nooit `git stash` of `git stash pop`**: de stash-stapel is gedeeld tussen worktrees en sessies; gebruik een tijdelijke WIP-commit als je iets moet parkeren. **Niet mergen, niet pushen.**

**Copyregels (klantzichtbaar, gelden voor elke taak):**
1. Nederlands, je/jij. **Loep is het onderwerp, nooit "ik", "wij", "we" of "ons" namens Loep.** De geraakte passages bevatten nu nog "wij"-zinnen; die gaan mee om. Passages die deze ronde niet raakt (de kennismaking-CTA, `/kennismaking`, de afsprakenlijst op `/pilot`) blijven zoals ze zijn, zie "Bewust niet gedaan".
2. Geen em-dashes (`—`) en geen en-dashes (`–`). Dubbele punt, komma, punt of "tot".
3. Geen HR-jargon. Titels en koppen raken de koopreden (vertrek is duur, behoud staat onder druk), ze beschrijven niet het product.
4. Eerlijkheid is een verkoopargument, geen disclaimer. Verboden blijven: oorzaak-claims, impactvoorspelling, uitkomstbeloftes ("minder verloop", "bespaar"), en "in hun eigen woorden" bij de meerkeuze-verdieping.
5. **Geen nieuwe belofte die het product niet waarmaakt.** Wat Loep doet: de intake, de meting klaarzetten met afdelingen en aantallen, de vragenlijst en de methode, het rapport, en bereikbaar zijn als iets niet werkt. Wat de klant doet: uitnodigen, de respons volgen, sluiten of verlengen, het gesprek leiden, het besluit vastleggen. **Loep Start heeft de gespreksleidraad en de besluitpagina wél, de werkvragen en de verdieping níét** (plan 3b, besloten context punt 2): schrijf werkvragen nooit toe aan alle drie de scans. **Loep Cultuurbeeld heeft geen gespreksleidraad**: beloof die daar niet.
6. Juridische pagina's (`app/privacy`, `app/voorwaarden`, `app/dpa`) blijven formeel "u" en vallen buiten de ronde. Ze beloven geen bespreking, maar noemen de dienst wel "begeleid"; zie "Wat Lars moet beslissen".

**Omgevingsvalkuilen (bekend, niet oplossen in dit plan):**
- `frontend/node_modules` in de hoofdmap is leeg. Installeer in de worktree (Task 0). `npm ci` weigert door een bekende lockfile-mismatch: gebruik `npm install` en zet het lockfile daarna terug. Nooit `rmdir /s /q` op een junction naar `node_modules`: dat leegt het doel.
- `frontend/.env.local` komt niet mee in een worktree: kopiëren (Task 0). Het mist `RESEND_API_KEY`; zonder die sleutel breekt `npm run build` af. Zet `RESEND_API_KEY=re_dummy_build_only` **in de omgeving van je shell, nooit in een bestand**.
- `npm run build 2>&1 | tail` maskeert de exitcode; print `$?` of lees de laatste regels.
- Vercel Analytics laadt in dev `va.vercel-scripts.com/v1/script.debug.js` en de CSP blokkeert dat: bekende consolefout, negeren.
- De vitest-suite is licht wisselvallig: `app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet. Vergelijk namen, niet het getal; draai bij twijfel opnieuw.

**Baselines (main `967ede3a`):** `npx tsc --noEmit` = 133 fouten; `npx vitest run` = 59 falende tests (één wisselvallige erbij geeft 60). **De gate is de faalset per testnaam en de tsc-foutset per bestand en melding, nooit alleen het aantal.** Task 0 legt beide vast, Task 16 vergelijkt. De regels die door dit plan verdwijnen (`<` in de diff) staan in Task 16 uitgeschreven, met per regel de reden. Elke `>`-regel is een regressie.

**Regel voor tests:** een test mag nooit worden verwijderd of afgezwakt om groen te worden zonder dat dit plan zegt waarom. Dit plan verwijdert tests alleen als het bestand of de export die ze vastpinnen zelf verdwijnt; de reden staat bij de stap.

**Werkwijze per taak:** subagent-driven-development met per taak een spec-review (klopt het met de spec, par. 8 en de copyregels; staat elke nu-tekst er niet meer en elke wordt-tekst er letterlijk?) en een codekwaliteitsreview (fail-loud, geen los bedrag, geen verzwakte test, types consistent, geen ongebruikte import die deze taak zelf veroorzaakt). Elke bevinding gaat terug naar dezelfde implementer, daarna herreview. Verslag na afloop als `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md` (Task 16), in dezelfde vorm als `docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md`.

> **Attributie:** de Co-Authored-By-regels in de commitblokken hieronder zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies.

---

## Bevindingen uit de inventaris die van de spec afwijken

De planschrijver heeft op 20-9 de inventaris opnieuw gedraaid. Vijf dingen kloppen niet met de spec; het plan volgt de code, niet de spec:

1. **`faqs` is niet dood.** Spec par. 5 noemt hem als export zonder gerenderde gebruiker, maar `faqSchema` (onderaan `site-content.ts`) bouwt er de FAQ-JSON-LD van die `app/page.tsx` op de homepage rendert. `faqs` blijft en wordt herschreven (Task 10).
2. **`pricingCards` en `included` renderen niet.** Spec par. 4.4 behandelt ze als live. `pricingCards` heeft als enige niet-test-importer het dode `tarieven-content.tsx`; de export `included` alleen het dode `aanpak-content.tsx` (de treffer in `producten-content.tsx` is een lokale `const included`). Beide gaan weg in plaats van herschreven (Task 5). De prijzen op `/producten#tarieven` staan hardgecodeerd in `producten-content.tsx`.
3. **Er staat nu geen prijs in de structured data.** De enige `Offer` staat in `getProductStructuredData` zonder bedrag. Task 9 voegt op `/producten` een `OfferCatalog` toe uit de ene bron, zodat de eindcontrole "de prijzen in de JSON-LD kloppen met de staffel" iets te controleren heeft.
4. **Meer live treffers dan de spec citeert.** Buiten de tabellen van par. 4: homepage r.55, 76, 84, 92, 121, 132-133 en 1776-1779 ("én het directiegesprek"); `/producten` r.54, 75, 180-181, 282 en de "stemmen we"-noot r.43; `layout.tsx` r.33 ("geen software om te beheren"); `trustItems` r.178 (rendert op `/vertrouwen`); de FAQ's r.641-646; heel Loep Cultuurbeeld; de OG-afbeelding; en het in-app label `NEW_MEASUREMENT_PRICE_LABEL` ("€1.250 excl. btw") dat door de staffel voor twee van de drie treden onwaar wordt.
5. **"Eén kolom" bestond niet.** Vóór de founderfoto (`b54f537e`, 21 juni) was de trustsectie hetzelfde tweekoloms raster met alleen de `h2` links. Task 7 herstelt precies die stand.

---

## Bestandsoverzicht

**Create**
- `frontend/lib/pricing.ts`: de staffel (`PRICING_TIERS`), `CULTUURBEELD_FROM_EUR`, `formatThousands`, `formatEur`, `firstScanRangeLabel`, `followUpRangeLabel`, `pricingFaqAnswer`, `buildPricingOfferCatalog`. De enige plek met Loep-bedragen.
- `frontend/lib/pricing.test.ts`: pure tests op de staffel en de helpers.
- `frontend/lib/site-meta.ts`: `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_SCHEMA_DESCRIPTION`.
- `frontend/lib/site-meta.test.ts`: titel, geldanker, geen uitkomstbelofte, en dat `layout.tsx` en `page.tsx` de constanten gebruiken.
- `frontend/lib/site-ronde-besluit-a.guard.test.ts`: verboden zinnen, losse bedragen en streepjes in gerenderde marketingbestanden; `llms.txt` consistent met de staffel.
- `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md`: verslag (Task 16).

**Modify**
- `frontend/app/layout.tsx:23-58`: titel en beschrijvingen uit `lib/site-meta.ts`.
- `frontend/app/page.tsx:8-22`: idem, plus de JSON-LD-beschrijving.
- `frontend/app/opengraph-image.tsx:76-137, 171`: tekst van de link-preview.
- `frontend/components/marketing/home-page-content.tsx`: r.55, 76, 84, 92, 121, 132-133, 330, 581, 734, 948, 1730, 1761, 1776-1779, 1816-1845 (fotoblok weg), 1892-1896 (werkvragenzin erbij).
- `frontend/components/marketing/producten-content.tsx`: leveringslijst, leads, hero, prijsregel per scan, tarievensectie met staffel, MTO-vergelijking.
- `frontend/app/producten/page.tsx`: JSON-LD `OfferCatalog`.
- `frontend/app/producten/[slug]/page.tsx`: vier dode paginafuncties weg, `permanentRedirect` als vangnet, Loep Cultuurbeeld herschreven.
- `frontend/components/marketing/site-content.ts`: negen dode exports weg (acht plus een alias); `trustItems`, `trustHubAnswerCards`, `faqs` herschreven; prijs-FAQ erbij.
- `frontend/public/llms.txt`: samenvatting, tarievenregel, pricing-blok.
- `frontend/app/pilot/page.tsx`: weg a.
- `frontend/lib/dashboard/new-measurement-request.ts`: prijslabel uit de staffel.
- Tests in lockstep: `frontend/lib/seo-conversion.test.ts`, `frontend/lib/marketing-portfolio-cleanup.test.ts`, `frontend/lib/commercial-suite-alignment.test.ts`, `frontend/lib/marketing-flow.test.ts`, `frontend/lib/marketing-positioning.test.ts`, `frontend/lib/marketing-proof-layer.test.ts`, `frontend/lib/dashboard/new-measurement-request.test.ts`.
- Buiten de repo: negen documenten in `C:\Users\larsh\Desktop\Business\Loep_Docs\` (Task 15).

**Delete (elk met bewijs per grep in de taak zelf)**
- `frontend/app/aanpak/page.tsx`, `frontend/components/marketing/aanpak-content.tsx`, `frontend/lib/aanpak-content.test.ts`
- `frontend/app/tarieven/page.tsx`, `frontend/components/marketing/tarieven-content.tsx`, `frontend/lib/tarieven-content.test.ts`
- `frontend/app/producten/[slug]/page.test.ts`, `frontend/lib/exit-product-copy.test.ts`, `frontend/lib/retention-product-copy.test.ts`, `frontend/lib/product-detail-hero-prices.test.ts`
- `frontend/public/images/lars-loep.jpg`

---

## Taakoverzicht

| # | Taak | Spec |
|---|---|---|
| 0 | Worktree, dependencies, baselines (vitest-faalset en tsc-foutset) | par. 7 |
| 1 | `lib/pricing.ts`: één bron voor elk bedrag | par. 8 punt 5 |
| 2 | Guardtest die de oude beloftes en losse bedragen verbiedt (rood tot Task 16) | par. 7 |
| 3 | Dode code A: `/aanpak` en `/tarieven` | par. 5 |
| 4 | Dode code B: de drie detailpagina's in `[slug]/page.tsx`, met redirect-vangnet | par. 5 |
| 5 | Dode code C: negen exports (acht plus een alias) in `site-content.ts` | par. 5, 4.4 |
| 6 | Titel, beschrijving, JSON-LD van de homepage, OG-afbeelding | par. 4.1, 8 punt 1 |
| 7 | Homepage: copy, fotoblok weg, werkvragenzin | par. 4.2, 8 punt 2 |
| 8 | `/producten`: levering, leads, hero, vergelijking | par. 4.3 |
| 9 | `/producten`: prijsregel per scan, tarievensectie met staffel, `OfferCatalog` | par. 8 punt 5 |
| 10 | Gedeelde content die rendert: `/vertrouwen` en de FAQ-JSON-LD | par. 4.4 |
| 11 | `llms.txt` | par. 4.5, 8 punt 5 |
| 12 | `/pilot`: weg a | par. 4.6, 8 punt 3 |
| 13 | Loep Cultuurbeeld | par. 5, 8 punt 4 |
| 14 | In-app prijslabel van de vervolgmeting uit de staffel | par. 8 punt 5 |
| 15 | Loep_Docs in lijn met besluit A en de staffel | par. 6, 8 punt 5 |
| 16 | Eindverificatie (tsc, faalset, build, browser, grep) en verslag. **Daarna STOP: poort 3b** | par. 3, 7 |
| 17 | **NIET UITVOEREN VÓÓR 3c:** de definitieve vervolgmetingszin | par. 3, 4.3, 4.5 |

---

### Task 0: Worktree, dependencies en baselines vastleggen

**Files:** geen codewijziging. Twee hulpscripts en de baselines staan buiten de repo, in `C:\Users\larsh\AppData\Local\Temp\loep-site-ronde-a\`.

- [ ] **Step 1: Worktree aanmaken vanaf main en `.env.local` kopiëren**

Run (vanuit de hoofdrepo):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v '^??' ; echo "---"
git worktree add .worktrees/site-ronde-a -b feature/site-ronde-a main
git -C .worktrees/site-ronde-a log --oneline -1
cp frontend/.env.local .worktrees/site-ronde-a/frontend/.env.local
ls .worktrees/site-ronde-a/frontend/.env.local
```
Expected: vóór `---` staat hooguit de spec als gewijzigd (` M docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md`); geen gewijzigde bestanden onder `frontend/` of `backend/`. Staat daar wel iets, stop en meld het: dat hoort niet in deze branch. `git worktree add` meldt `Preparing worktree (new branch 'feature/site-ronde-a')`; de log-regel toont `967ede3a` of nieuwer. `.env.local` is gitignored en komt nooit in een commit.

- [ ] **Step 2: Spec en plan op de branch zetten**

De spec staat in de hoofdmap als gewijzigd bestand (de besluiten van par. 8) en dit plan als nieuw bestand; de worktree heeft geen van beide. Kopieer ze en commit ze, zodat reviewers ze in de worktree kunnen lezen.

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
cp docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md .worktrees/site-ronde-a/docs/superpowers/specs/
cp docs/superpowers/plans/2026-09-20-site-ronde-besluit-a.md .worktrees/site-ronde-a/docs/superpowers/plans/
cd .worktrees/site-ronde-a
git add docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md docs/superpowers/plans/2026-09-20-site-ronde-besluit-a.md
git commit -m "docs(site): spec met besluiten 20-9 en implementatieplan site-ronde besluit A

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Expected: één commit met twee bestanden.

- [ ] **Step 3: Frontend-dependencies installeren in de worktree**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/site-ronde-a/frontend
npm install
git checkout -- package-lock.json
git status --short
```
Expected: `npm install` eindigt zonder `ERR!`; `git status --short` is leeg.

- [ ] **Step 4: Hulpscripts voor de faalset en de tsc-foutset aanmaken**

Inline `node -e` met backslashes overleeft de shell-escaping niet betrouwbaar. Maak daarom met je bestandstool (niet met een heredoc in de shell) deze twee bestanden aan.

`C:\Users\larsh\AppData\Local\Temp\loep-site-ronde-a\failset.cjs`:
```js
// Gebruik: node failset.cjs <vitest-json>  -> gesorteerde lijst "bestand > testnaam"
const r = require(process.argv[2])
const bs = String.fromCharCode(92)
const out = []
for (const s of r.testResults) {
  const file = s.name.split(bs).join('/').split('/frontend/').pop()
  for (const t of s.assertionResults) if (t.status === 'failed') out.push(file + ' > ' + t.fullName)
  if (s.status === 'failed' && s.assertionResults.length === 0) out.push(file + ' > (bestand laadt niet)')
}
console.log(out.sort().join('\n'))
```

`C:\Users\larsh\AppData\Local\Temp\loep-site-ronde-a\tscset.sh`:
```bash
#!/usr/bin/env bash
# Gebruik: tscset.sh <uitvoerbestand>. Regelnummers gaan eruit, zodat een verschoven
# regel geen schijnverschil geeft; bestand, foutcode en melding blijven.
npx tsc --noEmit 2>&1 | grep "error TS" | sed -E 's/\([0-9]+,[0-9]+\)//' | sort > "$1"
wc -l < "$1"
```

Run: `ls /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/`
Expected: `failset.cjs` en `tscset.sh`.

- [ ] **Step 5: Baselines vastleggen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/site-ronde-a/frontend
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
bash $T/tscset.sh $T/tsc-baseline.txt
npx vitest run --reporter=json --outputFile=$T/vitest-baseline.json >/dev/null 2>&1
node $T/failset.cjs $T/vitest-baseline.json > $T/fails-baseline.txt
wc -l < $T/fails-baseline.txt
grep -c "marketing-portfolio-cleanup" $T/fails-baseline.txt
```
Expected: `133` (tsc), daarna `59` of `60` (falende tests; het verschil is de wisselvallige `beheer/health`-test), daarna `0` (de portfolio-cleanup-guard is op main volledig groen en moet dat blijven). Wijkt het testgetal verder af, draai de vitest-regel opnieuw en vergelijk namen. `fails-baseline.txt` en `tsc-baseline.txt` zijn de gate voor Task 16.

- [ ] **Step 6: Controleer dat de twaalf regels die dit plan laat verdwijnen in de baseline staan**

Run:
```bash
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
grep -cE "^app/producten/\[slug\]/page\.test\.ts > |^lib/aanpak-content\.test\.ts > |^lib/tarieven-content\.test\.ts > |^lib/marketing-flow\.test\.ts > marketing flow defaults keeps the (approach flow|homepage focused)|^lib/seo-conversion\.test\.ts > SEO conversion tranche keeps the homepage and support-page metadata|^lib/exit-product-copy\.test\.ts > |^lib/retention-product-copy\.test\.ts > " $T/fails-baseline.txt
```
Expected: `12` (vijf uit `[slug]/page.test.ts`, één uit `aanpak-content`, één uit `tarieven-content`, twee uit `marketing-flow`, één uit `seo-conversion`, één uit `exit-product-copy`, één uit `retention-product-copy`). Is het een ander getal, noteer welke ontbreken en pas de verwachting in Task 16 Step 2 daarop aan; dat is een bevinding voor het verslag, geen reden om te stoppen.

---

### Task 1: `lib/pricing.ts`, één bron voor elk bedrag

**Files:**
- Create: `frontend/lib/pricing.ts`
- Test: `frontend/lib/pricing.test.ts`

Besluit Lars 20-9 (spec par. 8 punt 5): tot 150 medewerkers €3.500 en €950; 150 tot 400 €4.500 en €1.250; 400 tot 1.000 €6.900 en €1.750; boven 1.000 op aanvraag; alles excl. btw. Loep Cultuurbeeld houdt €6.500 en valt buiten de staffel. De onderste trede is geen korting voor de weggevallen bespreking maar een andere logica: kleinere organisatie, kleiner belang.

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/pricing.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import {
  CULTUURBEELD_FROM_EUR,
  PRICING_ABOVE_LABEL,
  PRICING_ABOVE_TEXT,
  PRICING_TIERS,
  buildPricingOfferCatalog,
  firstScanRangeLabel,
  followUpRangeLabel,
  formatEur,
  formatThousands,
  pricingFaqAnswer,
} from '@/lib/pricing'

describe('prijsstaffel (besluit Lars 20-9-2026)', () => {
  it('heeft precies de drie treden uit het besluit, in oplopende volgorde', () => {
    expect(PRICING_TIERS.map((t) => [t.label, t.firstScanEur, t.followUpEur])).toEqual([
      ['Tot 150 medewerkers', 3500, 950],
      ['150 tot 400 medewerkers', 4500, 1250],
      ['400 tot 1.000 medewerkers', 6900, 1750],
    ])
  })

  it('zet boven 1.000 medewerkers op aanvraag, zonder bedrag', () => {
    expect(PRICING_ABOVE_LABEL).toBe('Boven 1.000 medewerkers')
    expect(PRICING_ABOVE_TEXT).toBe('Op aanvraag')
    expect(PRICING_ABOVE_TEXT).not.toMatch(/\d/)
  })

  it('houdt Loep Cultuurbeeld buiten de staffel', () => {
    expect(CULTUURBEELD_FROM_EUR).toBe(6500)
    expect(PRICING_TIERS.some((t) => t.firstScanEur === CULTUURBEELD_FROM_EUR)).toBe(false)
  })

  it('houdt de rekensom van 30 euro per medewerker waar in de middelste trede', () => {
    expect(PRICING_TIERS[1].firstScanEur).toBe(150 * 30)
  })

  it('draagt de verwachtingsregel van Loep Vertrek alleen bij de onderste trede', () => {
    expect(PRICING_TIERS[0].note).toContain('minimaal 10 respondenten')
    expect(PRICING_TIERS[1].note).toBeNull()
    expect(PRICING_TIERS[2].note).toBeNull()
  })
})

describe('weergave van bedragen', () => {
  it('zet een punt als duizendtalscheiding', () => {
    expect(formatThousands(950)).toBe('950')
    expect(formatThousands(3500)).toBe('3.500')
    expect(formatThousands(125000)).toBe('125.000')
    expect(formatEur(6900)).toBe('€6.900')
  })

  it('faalt luid op een bedrag dat geen heel, positief getal is', () => {
    expect(() => formatThousands(12.5)).toThrow(/heel, positief getal/)
    expect(() => formatThousands(-1)).toThrow(/heel, positief getal/)
    expect(() => formatThousands(Number.NaN)).toThrow(/heel, positief getal/)
  })

  it('leidt het bereik af uit de staffel, niet uit losse getallen', () => {
    expect(firstScanRangeLabel()).toBe('€3.500 tot €6.900')
    expect(followUpRangeLabel()).toBe('€950 tot €1.750')
  })
})

describe('prijs-FAQ', () => {
  const antwoord = pricingFaqAnswer()

  it('noemt elke trede met beide bedragen, op aanvraag en excl. btw', () => {
    for (const tier of PRICING_TIERS) {
      expect(antwoord).toContain(tier.label)
      expect(antwoord).toContain(formatEur(tier.firstScanEur))
      expect(antwoord).toContain(formatEur(tier.followUpEur))
    }
    expect(antwoord).toContain('Boven 1.000 medewerkers op aanvraag')
    expect(antwoord).toContain('excl. btw')
  })

  it('gebruikt geen em-dash, geen en-dash en geen wij-vorm', () => {
    expect(antwoord).not.toMatch(/[\u2013\u2014]/)
    expect(antwoord).not.toMatch(/\b(wij|we|ons|onze)\b/i)
  })
})

describe('JSON-LD OfferCatalog', () => {
  const catalog = buildPricingOfferCatalog()

  it('heeft per trede twee offers met bedrag, valuta en btw-vlag', () => {
    expect(catalog['@type']).toBe('OfferCatalog')
    expect(catalog.itemListElement).toHaveLength(PRICING_TIERS.length * 2)
    for (const offer of catalog.itemListElement) {
      expect(offer['@type']).toBe('Offer')
      expect(offer.priceCurrency).toBe('EUR')
      expect(offer.priceSpecification.valueAddedTaxIncluded).toBe(false)
      expect(offer.priceSpecification.price).toBe(offer.price)
    }
  })

  it('bevat exact de bedragen uit de staffel', () => {
    const prijzen = catalog.itemListElement.map((offer) => offer.price).sort()
    const verwacht = PRICING_TIERS.flatMap((t) => [String(t.firstScanEur), String(t.followUpEur)]).sort()
    expect(prijzen).toEqual(verwacht)
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/pricing.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/pricing"`.

- [ ] **Step 3: Schrijf de implementatie**

Create `frontend/lib/pricing.ts`:
```ts
/**
 * Eén bron voor elk bedrag dat Loep publiek noemt (besluit Lars, 20 september
 * 2026; spec docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md par. 8
 * punt 5). Componenten, JSON-LD, de prijs-FAQ en het in-app label importeren
 * hieruit. lib/site-ronde-besluit-a.guard.test.ts verbiedt losse Loep-bedragen
 * in gerenderde marketingbestanden en houdt public/llms.txt hiermee in de pas.
 *
 * De staffel loopt op organisatiegrootte, niet per medewerker. De onderste
 * trede is geen korting voor de weggevallen bespreking: een kleinere
 * organisatie heeft minder op het spel staan.
 */
export type PricingTierId = 'tot-150' | '150-400' | '400-1000'

export type PricingTier = {
  id: PricingTierId
  label: string
  firstScanEur: number
  followUpEur: number
  /** Alleen waar een trede een eerlijke kanttekening nodig heeft. */
  note: string | null
}

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'tot-150',
    label: 'Tot 150 medewerkers',
    firstScanEur: 3500,
    followUpEur: 950,
    note: 'Loep Vertrek in deze trede: patroonanalyse vraagt minimaal 10 respondenten. Loep stemt de meetperiode daarop af in de intake.',
  },
  { id: '150-400', label: '150 tot 400 medewerkers', firstScanEur: 4500, followUpEur: 1250, note: null },
  { id: '400-1000', label: '400 tot 1.000 medewerkers', firstScanEur: 6900, followUpEur: 1750, note: null },
]

export const PRICING_ABOVE_LABEL = 'Boven 1.000 medewerkers'
export const PRICING_ABOVE_TEXT = 'Op aanvraag'
export const PRICING_VAT_NOTE = 'excl. btw'

/** Loep Cultuurbeeld valt buiten de staffel en houdt zijn eigen vanaf-prijs. */
export const CULTUURBEELD_FROM_EUR = 6500

/** 3500 -> "3.500". Fail Loud: nooit een half of negatief bedrag op de site. */
export function formatThousands(amount: number): string {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`Bedrag moet een heel, positief getal zijn, kreeg: ${amount}`)
  }
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 3500 -> "€3.500". */
export function formatEur(amount: number): string {
  return `€${formatThousands(amount)}`
}

function lowestAndHighest(pick: (tier: PricingTier) => number): [number, number] {
  const values = PRICING_TIERS.map(pick)
  return [Math.min(...values), Math.max(...values)]
}

/** "€3.500 tot €6.900" */
export function firstScanRangeLabel(): string {
  const [low, high] = lowestAndHighest((tier) => tier.firstScanEur)
  return `${formatEur(low)} tot ${formatEur(high)}`
}

/** "€950 tot €1.750" */
export function followUpRangeLabel(): string {
  const [low, high] = lowestAndHighest((tier) => tier.followUpEur)
  return `${formatEur(low)} tot ${formatEur(high)}`
}

/** Antwoord op "Wat kost een scan van Loep?" voor de FAQ-JSON-LD. */
export function pricingFaqAnswer(): string {
  const treden = PRICING_TIERS.map(
    (tier) =>
      `${tier.label}: ${formatEur(tier.firstScanEur)} voor de eerste scan en ${formatEur(tier.followUpEur)} voor een vervolgmeting.`,
  ).join(' ')
  return `De prijs hangt af van de grootte van je organisatie, niet van het aantal mensen dat meedoet. ${treden} ${PRICING_ABOVE_LABEL} op aanvraag. Alle bedragen ${PRICING_VAT_NOTE}, zonder licenties per medewerker en zonder add-ons achteraf.`
}

type PricingOffer = {
  '@type': 'Offer'
  name: string
  price: string
  priceCurrency: 'EUR'
  priceSpecification: {
    '@type': 'PriceSpecification'
    price: string
    priceCurrency: 'EUR'
    valueAddedTaxIncluded: false
  }
}

function offer(name: string, amount: number): PricingOffer {
  const price = String(amount)
  return {
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'EUR',
    priceSpecification: { '@type': 'PriceSpecification', price, priceCurrency: 'EUR', valueAddedTaxIncluded: false },
  }
}

/** JSON-LD voor /producten: per trede een eerste scan en een vervolgmeting. */
export function buildPricingOfferCatalog() {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'OfferCatalog' as const,
    name: 'Loep Behoud, Loep Vertrek en Loep Start: vaste prijs naar organisatiegrootte',
    url: 'https://www.getloep.nl/producten#tarieven',
    itemListElement: PRICING_TIERS.flatMap((tier) => [
      offer(`Eerste scan, ${tier.label.toLowerCase()}`, tier.firstScanEur),
      offer(`Vervolgmeting, ${tier.label.toLowerCase()}`, tier.followUpEur),
    ]),
  }
}
```

- [ ] **Step 4: Draai de test en zie hem slagen**

Run: `npx vitest run lib/pricing.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 5: tsc mag niet groeien**

Run: `bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task1.txt`
Expected: `133`.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/pricing.ts frontend/lib/pricing.test.ts
git commit -m "feat(site): prijsstaffel op organisatiegrootte als enige bron van bedragen

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Guardtest die de oude beloftes en losse bedragen verbiedt

**Files:**
- Create: `frontend/lib/site-ronde-besluit-a.guard.test.ts`

Deze test is de rode draad van de ronde. Hij wordt hier geschreven en is **bewust rood tot Task 16**: elke volgende taak maakt zijn eigen bestanden groen (de `it`-namen bevatten het bestandspad, zodat je met `-t` kunt filteren). De tussenliggende rode regels zijn geen regressies; de faalset-gate geldt alleen in Task 16, en daar moet deze test volledig groen zijn.

De lijst "gerenderde marketingbestanden" is: alles in `components/marketing/` (geen tests), plus de publieke pagina's, de twee nieuwe lib-modules en `public/llms.txt`. De juridische pagina's staan er bewust niet in.

- [ ] **Step 1: Schrijf de test**

Create `frontend/lib/site-ronde-besluit-a.guard.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRICING_TIERS, formatThousands } from '@/lib/pricing'

/**
 * Propositiebesluit A (19-9-2026) en de prijsstaffel (20-9-2026): de bespreking
 * door Loep is uit het aanbod, "begeleid" en "geen zelfbedieningstool" zijn uit
 * de positionering, en elk Loep-bedrag komt uit lib/pricing.ts. Deze guard leest
 * de bron van elk gerenderd marketingbestand, zodat de oude belofte niet
 * terugsluipt. Spec: docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md.
 *
 * Juridische pagina's (app/privacy, app/voorwaarden, app/dpa) vallen buiten de
 * ronde en staan hier bewust niet in.
 */
const ROOT = process.cwd()
const MARKETING_DIR = 'components/marketing'

const EXPLICIT_FILES = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/page.tsx',
  'app/producten/[slug]/page.tsx',
  'app/kennismaking/page.tsx',
  'app/vertrouwen/page.tsx',
  'app/pilot/page.tsx',
  'lib/site-meta.ts',
  'lib/pricing.ts',
  'public/llms.txt',
]

function marketingFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, MARKETING_DIR))
    .filter((name) => /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
    .map((name) => `${MARKETING_DIR}/${name}`)
    .sort()
}

const RENDERED_FILES = [...marketingFiles(), ...EXPLICIT_FILES]

/** Fail Loud: een ontbrekend bestand is een fout, geen overgeslagen controle. */
function read(rel: string): string {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) throw new Error(`Gerenderd marketingbestand ontbreekt: ${rel}`)
  // JSX breekt lopende tekst over regels af; vergelijken gaat op één regel.
  return fs.readFileSync(full, 'utf8').replace(/\s+/g, ' ')
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ['het woord "begeleid" in elke vorm', /begeleid/i],
  ['"managementbespreking"', /managementbespreking/i],
  ['"bespreking inbegrepen" of "gesprek inbegrepen"', /(bespreking|gesprek)\s+(standaard\s+)?inbegrepen/i],
  ['"zelfbedieningstool"', /zelfbedien/i],
  ['"geduid door HR-specialisten"', /geduid door hr-specialisten/i],
  ['"Loep doet de meting", "het werk" of "de opzet"', /loep doet (de|het) (meting|werk|opzet)/i],
  ['"Loep voert uit" of "Loep voert de scan uit"', /loep voert (uit|de )/i],
  [
    '"beheert geen software of tool" en varianten',
    /beheer(t|en)? geen (software|tool)|geen software om te beheren|zonder toolbeheer|geen toolbeheer/i,
  ],
  ['"niets zelf in te richten"', /niets zelf (in te richten|te beheren)/i],
  ['"directie-read sessie"', /read sessie/i],
  ['"Ik duid elke scan zelf"', /duid elke scan/i],
  ['"het directiegesprek" als levering van Loep', /én het directiegesprek/i],
]

describe('besluit A: geen bespreking, geen "begeleid", geen "geen zelfbedieningstool"', () => {
  for (const file of RENDERED_FILES) {
    it(`${file} bevat geen oude belofte`, () => {
      const source = read(file)
      for (const [label, pattern] of FORBIDDEN) {
        expect(pattern.test(source), `${label} gevonden in ${file}`).toBe(false)
      }
    })
  }
})

/**
 * Elk Loep-bedrag komt uit lib/pricing.ts. Concurrentieprijzen ("€25.000 tot
 * €100.000") en de rekensom "€30 per medewerker" zijn geen Loep-prijs en vallen
 * buiten het patroon. public/llms.txt is een statisch tekstbestand en kan niet
 * importeren; dat wordt hieronder tegen de staffel gelegd.
 */
const LOOSE_LOEP_AMOUNT = /(€|EUR|&euro;)\s?(3\.500|4\.500|6\.900|6\.500|950|1\.250|1\.750)(?![\d.])/
const PRICE_SOURCE_FILES = new Set(['lib/pricing.ts', 'public/llms.txt'])

describe('prijsstaffel: geen los Loep-bedrag buiten lib/pricing.ts', () => {
  for (const file of RENDERED_FILES.filter((f) => !PRICE_SOURCE_FILES.has(f))) {
    it(`${file} bevat geen los Loep-bedrag`, () => {
      const match = read(file).match(LOOSE_LOEP_AMOUNT)
      expect(match?.[0] ?? null, `los bedrag in ${file}; gebruik formatEur uit lib/pricing.ts`).toBeNull()
    })
  }
})

describe('public/llms.txt volgt de staffel', () => {
  const llms = () => read('public/llms.txt')

  for (const tier of PRICING_TIERS) {
    it(`noemt ${tier.label} met de eerste scan en de vervolgmeting`, () => {
      expect(llms()).toContain(`${tier.label.toLowerCase()} EUR ${formatThousands(tier.firstScanEur)}`)
      expect(llms()).toContain(`EUR ${formatThousands(tier.followUpEur)}`)
    })
  }

  it('noemt geen ander bedrag dan de zes uit de staffel', () => {
    const gevonden = [...llms().matchAll(/EUR (\d[\d.]*\d|\d)/g)].map((m) => m[1]).sort()
    const verwacht = PRICING_TIERS.flatMap((t) => [formatThousands(t.firstScanEur), formatThousands(t.followUpEur)]).sort()
    expect(gevonden).toEqual(verwacht)
  })

  it('zegt dat boven 1.000 medewerkers op aanvraag is en dat Loep niet aan tafel zit', () => {
    expect(llms()).toContain('boven 1.000 medewerkers op aanvraag')
    expect(llms()).toContain('Geen bespreking door Loep')
  })
})

/** Alleen bestanden waarvan deze ronde de copy herschrijft. */
const DASH_FREE_FILES = [
  'components/marketing/home-page-content.tsx',
  'components/marketing/producten-content.tsx',
  'components/marketing/site-content.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/[slug]/page.tsx',
  'app/pilot/page.tsx',
  'lib/site-meta.ts',
  'lib/pricing.ts',
  'public/llms.txt',
]

describe('geen em-dash en geen en-dash in de herschreven bestanden', () => {
  for (const file of DASH_FREE_FILES) {
    it(`${file} bevat geen em-dash of en-dash`, () => {
      const match = read(file).match(/.{0,40}[–—].{0,40}/)
      expect(match?.[0] ?? null, `streepje in ${file}`).toBeNull()
    })
  }
})
```

- [ ] **Step 2: Draai de test en leg vast wat rood is**

Run: `npx vitest run lib/site-ronde-besluit-a.guard.test.ts 2>&1 | tail -40`
Expected: FAIL. Rood zijn in elk geval: de oude-belofte-test voor `aanpak-content.tsx`, `home-page-content.tsx`, `producten-content.tsx`, `site-content.ts`, `tarieven-content.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/producten/[slug]/page.tsx`, `app/pilot/page.tsx`, `public/llms.txt` en `lib/site-meta.ts` (dat bestand bestaat nog niet, de test faalt daar luid op "ontbreekt"); de los-bedrag-test voor `producten-content.tsx`, `site-content.ts`, `tarieven-content.tsx`, `app/pilot/page.tsx` en `app/producten/[slug]/page.tsx`; alle `llms.txt`-tests; de streepjestest voor `producten-content.tsx`, `site-content.ts`, `app/pilot/page.tsx`, `app/producten/[slug]/page.tsx` en `lib/site-meta.ts`. Groen moeten nu al zijn: alle overige bestanden in `components/marketing/`, `app/kennismaking/page.tsx`, `app/vertrouwen/page.tsx`, `app/producten/page.tsx`, `app/opengraph-image.tsx` en `lib/pricing.ts`. Is een van díé rood, dan heeft de inventaris een treffer gemist: stop en meld het bestand en de gevonden zin, voeg hem niet stil toe aan een uitzonderingslijst.

- [ ] **Step 3: tsc mag niet groeien**

Run: `bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task2.txt`
Expected: `133`.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/site-ronde-besluit-a.guard.test.ts
git commit -m "test(site): guard op besluit A en de prijsstaffel (rood tot het eind van de ronde)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Dode code A, de doorverwezen pagina's `/aanpak` en `/tarieven`

**Files:**
- Delete: `frontend/app/aanpak/page.tsx`, `frontend/components/marketing/aanpak-content.tsx`, `frontend/lib/aanpak-content.test.ts`
- Delete: `frontend/app/tarieven/page.tsx`, `frontend/components/marketing/tarieven-content.tsx`, `frontend/lib/tarieven-content.test.ts`
- Modify: `frontend/lib/marketing-portfolio-cleanup.test.ts:12-19, 44-46, 148-158`
- Modify: `frontend/lib/seo-conversion.test.ts:7, 9, 44-45, 128-135, 149-150`
- Modify: `frontend/lib/commercial-suite-alignment.test.ts:17-20, 30`

`/aanpak` verwijst sinds 4 juli door naar `/producten`, `/tarieven` sinds 17 juni naar `/producten#tarieven` (`next.config.ts`). De redirect vangt het verzoek af vóór de pagina rendert. **De redirects blijven; `next.config.ts` wordt niet aangeraakt.** Links naar `/aanpak` en `/tarieven` elders in de code (o.a. `app/inzichten/page.tsx`, `insights-index-content.tsx`, Loep Cultuurbeeld) blijven werken via de redirect en worden hier niet aangepast.

- [ ] **Step 1: Bewijs dat niets anders de bestanden gebruikt**

Run:
```bash
cd frontend
grep -rnE "aanpak-content|tarieven-content|AanpakContent|TarievenContent|@/app/aanpak|@/app/tarieven" --include=*.ts --include=*.tsx app components lib
grep -nE "source: '/(aanpak|tarieven)'" next.config.ts
```
Expected eerste commando, precies deze regels en geen andere: de import en het gebruik in `app/aanpak/page.tsx` en `app/tarieven/page.tsx`; de `export function` in de twee content-bestanden; en de tests `lib/aanpak-content.test.ts`, `lib/tarieven-content.test.ts`, `lib/marketing-portfolio-cleanup.test.ts`, `lib/seo-conversion.test.ts`, `lib/commercial-suite-alignment.test.ts`. Expected tweede commando: twee regels, beide met `permanent: true`. Staat er een andere niet-test-importer, stop en meld het.

- [ ] **Step 2: Zet de nieuwe verwachting in de portfolio-cleanup-guard (rood)**

In `frontend/lib/marketing-portfolio-cleanup.test.ts`:

(a) Haal uit `BROWSABLE_SURFACE` de regel `'components/marketing/tarieven-content.tsx',` weg.

(b) Vervang
```ts
  it('Cultuurbeeld is not referenced on /tarieven', () => {
    expect(read('components/marketing/tarieven-content.tsx')).not.toContain('Cultuurbeeld')
  })
```
door
```ts
  // Site-ronde besluit A (2026-09-20): /tarieven en /aanpak verwezen al door en
  // zijn als pagina verwijderd. De redirect is het enige dat overblijft; de
  // tarieven staan op /producten#tarieven en komen uit lib/pricing.ts.
  it('/tarieven en /aanpak bestaan alleen nog als redirect naar /producten', () => {
    for (const rel of [
      'app/tarieven/page.tsx',
      'components/marketing/tarieven-content.tsx',
      'app/aanpak/page.tsx',
      'components/marketing/aanpak-content.tsx',
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), rel)), `${rel} hoort weg te zijn`).toBe(false)
    }
    const config = read('next.config.ts')
    expect(config).toContain("{ source: '/tarieven', destination: '/producten#tarieven', permanent: true }")
    expect(config).toContain("{ source: '/aanpak', destination: '/producten', permanent: true }")
  })
```

(c) Verwijder het hele laatste `describe`-blok `'Portfolio cleanup — /tarieven shows three equal baselines'` (het leest alleen het bestand dat verdwijnt; wat het bewaakte, drie gelijke prijzen, wordt vervangen door de staffeltests in `lib/pricing.test.ts`).

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts`
Expected: FAIL op precies één test, `/tarieven en /aanpak bestaan alleen nog als redirect naar /producten` ("app/tarieven/page.tsx hoort weg te zijn").

- [ ] **Step 3: Haal de dode imports uit `seo-conversion.test.ts`**

Zonder deze stap laadt het hele testbestand niet meer zodra de pagina's weg zijn, en vallen drie tests die nu groen zijn mee om.

In `frontend/lib/seo-conversion.test.ts`:

(a) Verwijder de twee importregels
```ts
import { metadata as aanpakMetadata } from '@/app/aanpak/page'
```
en
```ts
import { metadata as pricingMetadata } from '@/app/tarieven/page'
```

(b) Verwijder in de eerste test de twee regels
```ts
    expect(imageUrl(aanpakMetadata.openGraph?.images)).toBe('/opengraph-image')
    expect(imageUrl(pricingMetadata.openGraph?.images)).toBe('/opengraph-image')
```

(c) Verwijder in de test `keeps route-aware CTA wiring on the intended money pages` de twee `const`-blokken `pricingPageSource` en `pricingContentSource` (elk vier regels) en de twee regels
```ts
    expect(pricingPageSource).toContain("ctaSource: 'pricing_primary_cta'")
    expect(pricingContentSource).toContain("ctaSource: 'pricing_closing_cta'")
```
Die test faalt op main al om andere redenen (hij verwacht `product_pulse_form` en `product_leadership_form`, die sinds juni niet meer bestaan) en blijft falen; hij staat in de baseline en hoort daar te blijven staan.

- [ ] **Step 4: Haal de dode leesactie uit `commercial-suite-alignment.test.ts`**

In de tweede test (`connects pricing, trust and contact copy to the bounded suite promise`): verwijder het `const pricingSource = fs.readFileSync(...)`-blok (vier regels) en de regel `expect(pricingSource).toContain('dashboard, rapport en Action Center')`. De test faalt op main al (hij verwacht "Action Center"-copy die in juni is verwijderd) en blijft falen op de twee overgebleven verwachtingen; hij staat in de baseline en hoort daar te blijven staan.

- [ ] **Step 5: Verwijder de bestanden**

Run (vanuit de worktree-root):
```bash
git rm frontend/app/aanpak/page.tsx frontend/components/marketing/aanpak-content.tsx frontend/lib/aanpak-content.test.ts
git rm frontend/app/tarieven/page.tsx frontend/components/marketing/tarieven-content.tsx frontend/lib/tarieven-content.test.ts
ls frontend/app/aanpak frontend/app/tarieven 2>&1
```
Expected: zes bestanden verwijderd; `ls` meldt dat beide mappen niet bestaan (git ruimt lege mappen op; staat er nog een lege map, verwijder die).

Waarom de twee testbestanden weg mogen: `aanpak-content.test.ts` en `tarieven-content.test.ts` lezen elk alleen het bestand dat verdwijnt, en vallen op main al (ze verwachten "U"-copy en `price: 'vanaf €4.500'` op een pagina die niemand meer ziet). Ze verdwijnen uit de faalset; dat zijn twee van de twaalf verwachte `<`-regels in Task 16.

- [ ] **Step 6: Draai de geraakte tests**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts lib/seo-conversion.test.ts lib/commercial-suite-alignment.test.ts 2>&1 | tail -25`
Expected: `marketing-portfolio-cleanup` volledig groen. `seo-conversion`: het bestand laadt; rood zijn dezelfde vier tests als op main (`keeps the homepage and support-page metadata...`, `adds solution routes to the sitemap...`, `generates solution and product metadata...`, `keeps route-aware CTA wiring...`); groen zijn `serves noindex headers...`, `keeps exactly three compact SEO solution routes...` en `keeps llms.txt aligned...`. `commercial-suite-alignment`: beide tests rood, zoals op main.

- [ ] **Step 7: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts 2>&1 | grep -E "aanpak-content|tarieven-content"
bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task3.txt
```
Expected: het eerste commando geeft geen regels (de twee bestanden bestaan niet meer, dus de guard maakt er geen test meer voor); tsc `133`.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/lib/marketing-portfolio-cleanup.test.ts frontend/lib/seo-conversion.test.ts frontend/lib/commercial-suite-alignment.test.ts
git commit -m "chore(site): doorverwezen pagina's /aanpak en /tarieven verwijderd, redirects blijven

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Dode code B, de drie detailpagina's in `app/producten/[slug]/page.tsx`

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx:3, 9, 11, 35-45, 84-110, 406-1068`
- Modify: `frontend/lib/marketing-portfolio-cleanup.test.ts:77-113` (het `describe`-blok `three equal product pages`)
- Delete: `frontend/app/producten/[slug]/page.test.ts`, `frontend/lib/exit-product-copy.test.ts`, `frontend/lib/retention-product-copy.test.ts`, `frontend/lib/product-detail-hero-prices.test.ts`

`/producten/exitscan`, `/producten/retentiescan` en `/producten/onboarding-30-60-90` verwijzen sinds 17 juni met een 308 door naar de ankers op `/producten`. De vier paginafuncties `ExitScanPage`, `RetentionScanPage`, `OnboardingModernPage` en `OnboardingPage` (samen ruim 660 regels, met tien keer "begeleid", zes keer "managementbespreking" en drie keer "vanaf €4.500") renderen dus nooit. **`CultureAssessmentPage` blijft** (Task 13) en `UpcomingProductPage` blijft. De pagina krijgt zelf een `permanentRedirect` als vangnet: verdwijnt de regel uit `next.config.ts` ooit, dan toont de route geen lege pagina maar stuurt hij alsnog door (Fail Loud in plaats van stil leeg).

- [ ] **Step 1: Bewijs dat niets anders de functies gebruikt**

Run:
```bash
cd frontend
grep -rnE "ExitScanPage|RetentionScanPage|OnboardingModernPage|\bOnboardingPage\b" --include=*.ts --include=*.tsx app components lib | grep -v "^app/producten/\[slug\]/page.tsx"
grep -nE "source: '/producten/(exitscan|retentiescan|onboarding-30-60-90)'" next.config.ts
```
Expected eerste commando: alleen regels uit `app/producten/[slug]/page.test.ts`, `lib/exit-product-copy.test.ts`, `lib/retention-product-copy.test.ts` en `lib/marketing-portfolio-cleanup.test.ts`. Expected tweede commando: drie regels, elk met `permanent: true`. Staat er een niet-testbestand in de eerste lijst, stop en meld het.

- [ ] **Step 2: Vervang het `describe`-blok in de portfolio-cleanup-guard (rood)**

In `frontend/lib/marketing-portfolio-cleanup.test.ts`: vervang het hele blok dat begint met `describe('Portfolio cleanup — three equal product pages', () => {` en eindigt vóór `describe('Portfolio cleanup — deferred public Action Center / removed-product references', () => {` door:
```ts
// Site-ronde besluit A (2026-09-20): de detailpagina's van Loep Vertrek, Loep
// Behoud en Loep Start verwezen sinds 17 juni door en zijn verwijderd. Wat dit
// blok vroeger bewaakte (zes dienst-bullets per pagina) staat nu één keer op
// /producten en wordt bewaakt door lib/site-ronde-besluit-a.guard.test.ts.
describe("Portfolio cleanup: detailpagina's van Vertrek, Behoud en Start zijn weg, de redirects blijven", () => {
  const page = () => read('app/producten/[slug]/page.tsx')

  it('heeft de vier dode paginafuncties niet meer en houdt Loep Cultuurbeeld', () => {
    for (const name of ['ExitScanPage', 'RetentionScanPage', 'OnboardingModernPage', 'OnboardingPage']) {
      expect(page(), `${name} hoort weg te zijn`).not.toContain(`function ${name}(`)
    }
    expect(page()).toContain('function CultureAssessmentPage()')
    expect(page()).toContain('function UpcomingProductPage(')
  })

  it('stuurt de drie slugs ook in de pagina zelf door, als vangnet naast next.config.ts', () => {
    expect(page()).toContain('REDIRECTED_PRODUCT_ANCHORS')
    expect(page()).toContain('if (redirectTarget) permanentRedirect(redirectTarget)')
    expect(page()).toContain("exitscan: '/producten#loep-vertrek'")
    expect(page()).toContain("retentiescan: '/producten#loep-behoud'")
    expect(page()).toContain("'onboarding-30-60-90': '/producten#loep-start'")
  })

  it('houdt de drie redirects in next.config.ts', () => {
    const config = read('next.config.ts')
    expect(config).toContain("{ source: '/producten/exitscan', destination: '/producten#loep-vertrek', permanent: true }")
    expect(config).toContain("{ source: '/producten/retentiescan', destination: '/producten#loep-behoud', permanent: true }")
    expect(config).toContain("{ source: '/producten/onboarding-30-60-90', destination: '/producten#loep-start', permanent: true }")
  })
})
```

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts`
Expected: FAIL op de eerste twee nieuwe tests; de derde is groen.

- [ ] **Step 3: Pas de kop van `[slug]/page.tsx` aan**

(a) Regel 3: vervang `import { notFound } from 'next/navigation'` door
```ts
import { notFound, permanentRedirect } from 'next/navigation'
```

(b) Verwijder de twee imports die alleen de dode functies gebruikten (elders in het bestand komen ze niet voor):
```ts
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
```
en
```ts
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
```
Laat de overige imports staan, ook `MarketingProofStrip`, `PreviewEvidenceRail`, `PreviewSlider`, `SampleShowcaseCard` en de twee `getPrimarySampleShowcaseAsset`-constanten: die waren op main al ongebruikt en vallen buiten deze ronde.

(c) Vervang het commentaarblok boven `PUBLICLY_REMOVED_PRODUCT_SLUGS` (vier regels, met em-dashes) plus de constante door:
```ts
// Pulse, Leadership Scan en Combinatie zijn uit het publieke portfolio gehaald
// (portfolio-cleanup, juni 2026): die routes geven 404 en staan niet in de
// sitemap of de static params.
const PUBLICLY_REMOVED_PRODUCT_SLUGS = new Set(['pulse', 'leadership-scan', 'combinatie'])

// Loep Vertrek, Loep Behoud en Loep Start hebben sinds 17 juni 2026 geen eigen
// pagina meer: next.config.ts verwijst ze met een 308 door naar het anker op
// /producten. De paginafuncties zijn op 20 september 2026 verwijderd. Deze tabel
// is het vangnet: verdwijnt de redirect uit next.config.ts ooit, dan stuurt de
// pagina zelf door in plaats van een lege pagina te tonen.
const REDIRECTED_PRODUCT_ANCHORS: Record<string, string> = {
  exitscan: '/producten#loep-vertrek',
  retentiescan: '/producten#loep-behoud',
  'onboarding-30-60-90': '/producten#loep-start',
}
```

(d) Vervang `generateStaticParams` door:
```ts
export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.filter(
    (product) =>
      !PUBLICLY_REMOVED_PRODUCT_SLUGS.has(product.slug) && !(product.slug in REDIRECTED_PRODUCT_ANCHORS),
  ).map((product) => ({ slug: product.slug }))
}
```

(e) In `ProductDetailPage`: voeg direct na `if (PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) notFound()` toe:
```ts

  const redirectTarget = REDIRECTED_PRODUCT_ANCHORS[slug]
  if (redirectTarget) permanentRedirect(redirectTarget)
```
en vervang de vijf regels
```tsx
      {slug === 'retentiescan' ? <RetentionScanPage /> : null}
      {slug === 'exitscan' ? <ExitScanPage /> : null}
      {slug === 'cultuurbeeld' ? <CultureAssessmentPage /> : null}
      {slug === 'onboarding-30-60-90' ? <OnboardingModernPage /> : null}
      {!['retentiescan', 'exitscan', 'cultuurbeeld', 'onboarding-30-60-90'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
```
door
```tsx
      {slug === 'cultuurbeeld' ? <CultureAssessmentPage /> : <UpcomingProductPage slug={slug} />}
```
`generateMetadata` blijft ongewijzigd (een bestaande test roept hem aan voor `exitscan`).

- [ ] **Step 4: Verwijder de vier functies**

Verwijder alles vanaf de regel `function ExitScanPage() {` tot en met de regel `void OnboardingPage` (en de lege regel erna). Direct daarboven eindigt `CultureAssessmentPage` met `}`; direct daaronder begint `function UpcomingProductPage({ slug }: { slug: string }) {`. Tussen die twee staan geen gedeelde constanten of types (geverifieerd: alleen de vier `function`-declaraties).

Run:
```bash
grep -cE "^function (ExitScanPage|RetentionScanPage|OnboardingModernPage|OnboardingPage)\(|^void OnboardingPage" "app/producten/[slug]/page.tsx"
grep -cE "^function (CultureAssessmentPage|UpcomingProductPage|getProductStructuredData)\(" "app/producten/[slug]/page.tsx"
wc -l < "app/producten/[slug]/page.tsx"
```
Expected: `0`, `3`, en een regelaantal tussen 470 en 500 (was 1137).

- [ ] **Step 5: Verwijder de vier testbestanden die alleen de dode functies vastpinden**

Run (vanuit de worktree-root):
```bash
git rm "frontend/app/producten/[slug]/page.test.ts" frontend/lib/exit-product-copy.test.ts frontend/lib/retention-product-copy.test.ts frontend/lib/product-detail-hero-prices.test.ts
```
Waarom dit mag: alle vier lezen `[slug]/page.tsx` en knippen op `function ExitScanPage()` of `function RetentionScanPage()`; ze bewaken uitsluitend opmaak en copy van pagina's die sinds 17 juni niemand meer ziet (kaartschaduw, "Na de scan ontvangt u rapport, dashboard en een begeleide managementbespreking", `vanaf €4.500 • Baseline`). `[slug]/page.test.ts` faalt op main al volledig (vijf tests), en `exit-product-copy.test.ts` en `retention-product-copy.test.ts` vallen op main elk op hun ene test (ze verwachten nog "u"-copy van vóór de je/jij-ronde): samen zeven van de twaalf verwachte `<`-regels in Task 16. Alleen `product-detail-hero-prices.test.ts` is op main groen en verdwijnt zonder spoor in de faalset; noem hem in het verslag onder "verwijderde tests".

- [ ] **Step 6: Draai de geraakte tests**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts lib/seo-conversion.test.ts lib/commercial-suite-alignment.test.ts 2>&1 | tail -25`
Expected: `marketing-portfolio-cleanup` volledig groen. `seo-conversion` en `commercial-suite-alignment`: dezelfde rode en groene tests als na Task 3 (de CTA-wiringtest en `keeps the combination route framed...` lezen `[slug]/page.tsx` en vielen al).

- [ ] **Step 7: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "slug" 2>&1 | tail -15
bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task4.txt
```
Expected: de drie tests voor `app/producten/[slug]/page.tsx` zijn nog rood, maar alleen op Loep Cultuurbeeld ("begeleid", "read sessie", `€6.500`, en-dashes in de vergelijkingstabel); Task 13 maakt ze groen. tsc `133`.

- [ ] **Step 8: Commit**

```bash
git add -A "frontend/app/producten/[slug]/page.tsx" frontend/lib/marketing-portfolio-cleanup.test.ts
git commit -m "chore(site): doorverwezen detailpagina's van Vertrek, Behoud en Start verwijderd, redirect-vangnet in de pagina

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Dode code C, negen exports in `site-content.ts`

**Files:**
- Modify: `frontend/components/marketing/site-content.ts:39-86, 201-230, 350-375, 392-427, 484-505, 522-570`
- Modify: `frontend/lib/marketing-flow.test.ts:13-21, 56-65, 76-80`
- Modify: `frontend/lib/marketing-positioning.test.ts:12-22, 91-101, 103-120`
- Modify: `frontend/lib/marketing-proof-layer.test.ts:4-10, 20`

Na Task 3 hebben deze exports geen gerenderde gebruiker meer. Samen dragen ze veertien van de zestien treffers in dit bestand. **`faqs` blijft**: de spec noemt hem dood, maar `faqSchema` rendert hem als JSON-LD op de homepage (Task 10 herschrijft hem). Exports zonder treffer voor besluit A (`approachRoutes`, `processHighlights`, `comparisonCards`, `trustQuickLinks`, `marketingFooterLinks`, `marketingPagePurposes`, `homepageUtilityLinks`, `pricingFaqs`, `pricingLifecycleLadder`, `homepageProofSignals`, `publicProofCards`, `statCards`, `productOverviewComparisonRows`) blijven staan, ook als ze dood zijn: zie "Bewust niet gedaan".

| Export | Niet-test-importers na Task 3 | Test die erop leunt |
|---|---|---|
| `homepageProductRoutes` en de alias `homepageCoreProductRoutes` | geen | `marketing-flow.test.ts` (faalt op main) |
| `homepageComparisonRows` | geen | geen |
| `trustSignalHighlights` | geen | `marketing-proof-layer.test.ts` (faalt op main) |
| `outcomeCards` | geen | geen |
| `included` | geen (was alleen `aanpak-content.tsx`) | `marketing-flow.test.ts` (faalt op main) |
| `approachSteps` | geen (was alleen `aanpak-content.tsx`) | `marketing-flow.test.ts` (faalt op main) |
| `customerLifecycleStages` | geen | geen |
| `pricingCards` | geen (was alleen `tarieven-content.tsx`) | `marketing-positioning.test.ts` (één groene, één rode test) |

- [ ] **Step 1: Bewijs per export**

Run:
```bash
cd frontend
for e in homepageProductRoutes homepageCoreProductRoutes homepageComparisonRows trustSignalHighlights outcomeCards included approachSteps customerLifecycleStages pricingCards; do
  echo "== $e"
  grep -rlE "\b$e\b" --include=*.ts --include=*.tsx app components lib | grep -v "components/marketing/site-content.ts"
done
```
Expected: per export alleen testbestanden (`lib/marketing-flow.test.ts`, `lib/marketing-positioning.test.ts`, `lib/marketing-proof-layer.test.ts`) of niets. Eén uitzondering die geen importer is: `components/marketing/producten-content.tsx` verschijnt bij `included` omdat het een **lokale** `const included` heeft; controleer met `grep -n "included" components/marketing/producten-content.tsx` dat er geen `import` van `included` staat. Staat er een andere niet-test-importer, stop en meld het.

- [ ] **Step 2: Pas `marketing-flow.test.ts` aan**

(a) Haal `approachSteps,`, `homepageProductRoutes,` en `included,` uit de importlijst van `@/components/marketing/site-content`.

(b) Verwijder de hele test `it('keeps the homepage focused on the three buyer-facing primary routes', ...)`. Reden: hij pint alleen `homepageProductRoutes`, verwacht sinds juni een portfolio met "Loep Cultuurbeeld" dat de homepage niet meer heeft, en faalt op main.

(c) Verwijder de hele test `it('keeps the approach flow explicit about assisted onboarding and first use', ...)`. Reden: hij pint letterlijk `'Begeleide managementbespreking van 60–90 minuten'` en stap `'6. Managementbespreking'` van de verwijderde `/aanpak`, precies de belofte die besluit A schrapt, en faalt op main.

Beide zijn verwachte `<`-regels in Task 16. De twee tsc-fouten op `marketing-flow.test.ts` (TS2367 en TS2339 op de `approachSteps`-vergelijking) verdwijnen mee; dat is de verwachte daling van tsc 133 naar 131.

- [ ] **Step 3: Pas `marketing-positioning.test.ts` aan**

(a) Haal `pricingCards,` uit de importlijst en voeg onder de bestaande imports toe:
```ts
import { PRICING_TIERS } from '@/lib/pricing'
```

(b) In de test `keeps Loep Vertrek framed as the default first route in commercial conversations`: verwijder de regel `const exitBaselineCard = pricingCards.find((card) => card.eyebrow === 'Loep Vertrek Baseline')` en vervang
```ts
    expect(exitBaselineCard?.price).toBe('vanaf €4.500')
```
door
```ts
    // Site-ronde besluit A (2026-09-20): pricingCards is weg; de prijs is een
    // staffel op organisatiegrootte uit lib/pricing.ts, gelijk voor elke scan.
    expect(PRICING_TIERS.map((tier) => tier.firstScanEur)).toEqual([3500, 4500, 6900])
```

(c) In de test `keeps Loep Cultuurbeeld framed as a broad annual baseline instead of a pulse, benchmark or ranking layer`: verwijder de regel `const cultureBaselineCard = pricingCards.find(...)` en de twee regels
```ts
    expect(cultureBaselineCard?.price).toBe('op aanvraag')
    expect(cultureBaselineCard?.bullets.join(' ').toLowerCase()).toContain('board-read')
```
Die test faalt op main al op `cultureRow` (de vergelijkingstabel heeft geen rij voor Loep Cultuurbeeld) en blijft daarop falen; hij staat in de baseline en hoort daar te blijven staan.

- [ ] **Step 4: Pas `marketing-proof-layer.test.ts` aan**

Haal `trustSignalHighlights,` uit de importlijst en verwijder de regel
```ts
    expect(trustSignalHighlights.some((item) => item.title === 'Manager-scope blijft bounded')).toBe(true)
```
De test faalt op main al (hij verwacht een kaart "Hoe werkt manager-toegang?" die niet bestaat) en blijft daarop falen.

- [ ] **Step 5: Verwijder de negen exports**

In `frontend/components/marketing/site-content.ts`, verwijder elk blok in zijn geheel, van `export const <naam>` tot en met de afsluitende `] as const` (of de ene regel bij de alias):
1. `homepageProductRoutes`
2. het commentaar `// Keep the existing homepage module contract intact for builds that still` plus de regel eronder, plus `export const homepageCoreProductRoutes = homepageProductRoutes`
3. `homepageComparisonRows`
4. `trustSignalHighlights`
5. `outcomeCards`
6. `included`
7. `approachSteps`
8. `customerLifecycleStages`
9. `pricingCards`

Run:
```bash
grep -cE "^export const (homepageProductRoutes|homepageCoreProductRoutes|homepageComparisonRows|trustSignalHighlights|outcomeCards|included|approachSteps|customerLifecycleStages|pricingCards)\b" components/marketing/site-content.ts
grep -nEi "begeleid|bespreking|toolbeheer|beheert geen|voert (uit|de )|inbegrepen" components/marketing/site-content.ts
```
Expected: `0`, en daarna precies vier regels: `trustItems` ("Loep voert uit, je beheert geen tool"), `trustHubAnswerCards` ("Een begeleide dienst: ...") en de twee FAQ's onderaan ("... met begeleide bespreking." en "Loep is een begeleide dienst. ..."). Die vier zijn live en gaan in Task 10.

- [ ] **Step 6: Draai de geraakte tests**

Run: `npx vitest run lib/marketing-flow.test.ts lib/marketing-positioning.test.ts lib/marketing-proof-layer.test.ts lib/commercial-homepage.test.ts lib/content-operating-system.test.ts 2>&1 | tail -25`
Expected: `marketing-flow` volledig groen (de twee rode tests zijn weg). `marketing-positioning`: rood zijn dezelfde drie als op main (`keeps three primary routes...`, `keeps visible trust navigation...`, `keeps Loep Cultuurbeeld framed...`); `keeps Loep Vertrek framed as the default first route...` is groen. `marketing-proof-layer`: beide rood, zoals op main. `commercial-homepage`: drie rood, zoals op main. `content-operating-system`: groen.

- [ ] **Step 7: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "site-content" 2>&1 | tail -12
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
bash $T/tscset.sh $T/tsc-task5.txt
diff $T/tsc-baseline.txt $T/tsc-task5.txt
```
Expected: voor `site-content.ts` is de los-bedrag-test en de streepjestest nu groen; de oude-belofte-test is nog rood (Task 10). tsc `131`; de diff toont precies twee `<`-regels, beide `lib/marketing-flow.test.ts` (TS2367 en TS2339), en geen `>`-regel.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/marketing/site-content.ts frontend/lib/marketing-flow.test.ts frontend/lib/marketing-positioning.test.ts frontend/lib/marketing-proof-layer.test.ts
git commit -m "chore(site): negen exports zonder gerenderde gebruiker uit site-content, tests in lockstep

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Titel, beschrijving, JSON-LD van de homepage en de OG-afbeelding

**Files:**
- Create: `frontend/lib/site-meta.ts`
- Test: `frontend/lib/site-meta.test.ts`
- Modify: `frontend/app/layout.tsx:23-58`
- Modify: `frontend/app/page.tsx:1-22`
- Modify: `frontend/app/opengraph-image.tsx:76-137, 171`
- Modify: `frontend/lib/seo-conversion.test.ts` (eerste test)

Besluit Lars (spec par. 8 punt 1): de titel raakt de koopreden, niet het product. De beschrijving draagt het geldanker. Grens: geen uitkomstbelofte. De titel staat nu op vier plekken en de beschrijving in drie varianten; ze komen uit één module, zodat ze niet meer uit elkaar lopen. **Par. 8 gaat vóór par. 4.1**: de drie beschrijvingsvarianten uit par. 4.1 vervallen voor de ene beschrijving met het geldanker.

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/site-meta.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { metadata as homePageMetadata } from '@/app/page'
import { HOME_SCHEMA_DESCRIPTION, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-meta'

function source(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\s+/g, ' ')
}

describe('paginatitel en beschrijving (besluit Lars 20-9-2026)', () => {
  it('heeft de titel die de koopreden raakt', () => {
    expect(SITE_TITLE).toBe('Loep | Zie waar behoud onder druk staat, voordat mensen gaan')
  })

  it('draagt het geldanker en zegt eerlijk wat je koopt en wat je zelf doet', () => {
    expect(SITE_DESCRIPTION).toBe(
      "Eén vertrokken medewerker vervangen kost al snel tienduizenden euro's. Loep laat zien waar behoud onder druk staat, waarom volgens je mensen zelf, en waar je begint. Meting en rapport; het gesprek voer je zelf.",
    )
  })

  it('belooft geen uitkomst en noemt geen hard bedrag voor vertrekkosten', () => {
    for (const text of [SITE_TITLE, SITE_DESCRIPTION, HOME_SCHEMA_DESCRIPTION]) {
      expect(text).not.toMatch(/minder verloop|bespaar|verlaag|voorkom|garant/i)
      expect(text).not.toMatch(/[€]\s?\d/)
      expect(text).not.toMatch(/[–—]/)
      expect(text).not.toMatch(/begeleid|inbegrepen/i)
    }
  })

  it('zegt in de JSON-LD van de homepage dat het rapport het gesprek leidt en dat je het zelf voert', () => {
    expect(HOME_SCHEMA_DESCRIPTION).toContain('Meting van behoud, vertrek en onboarding voor HR en management')
    expect(HOME_SCHEMA_DESCRIPTION).toContain('dat gesprek voer je zelf')
  })
})

describe('layout en homepage gebruiken de ene bron', () => {
  it('app/layout.tsx heeft geen eigen titel of beschrijving meer', () => {
    const layout = source('app/layout.tsx')
    expect(layout).toContain('default: SITE_TITLE')
    expect(layout.split('title: SITE_TITLE').length - 1).toBe(2)
    expect(layout.split('description: SITE_DESCRIPTION').length - 1).toBe(3)
    expect(layout).not.toContain("'Loep |")
  })

  it('app/page.tsx exporteert de titel en de beschrijving uit lib/site-meta.ts', () => {
    expect(homePageMetadata.title).toBe(SITE_TITLE)
    expect(homePageMetadata.description).toBe(SITE_DESCRIPTION)
    expect(source('app/page.tsx')).toContain('description: HOME_SCHEMA_DESCRIPTION')
  })
})

describe('link-preview (app/opengraph-image.tsx)', () => {
  const og = () => source('app/opengraph-image.tsx')

  it('draagt dezelfde kop en categorieregel als de site', () => {
    expect(og()).toContain('Zie waar behoud onder druk staat, voordat mensen gaan.')
    expect(og()).toContain('Meting en rapport. Het gesprek met je MT voer je zelf.')
  })

  it('noemt de drie scans en geen Loep Cultuurbeeld of intern jargon', () => {
    expect(og()).toContain('Loep Behoud · Loep Vertrek · Loep Start')
    expect(og()).not.toContain('Cultuurbeeld')
    expect(og()).not.toContain('primary routes')
    expect(og()).not.toContain('commerciële flow')
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/site-meta.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/site-meta"`.

- [ ] **Step 3: Schrijf `lib/site-meta.ts`**

Create `frontend/lib/site-meta.ts`:
```ts
/**
 * Eén bron voor de titel en de beschrijving van de site (besluit Lars, 20
 * september 2026; spec 2026-09-20-site-ronde-besluit-a.md par. 8 punt 1).
 * De titel raakt de koopreden (behoud onder druk), niet het product. De
 * beschrijving draagt het geldanker. Grens: geen uitkomstbelofte en geen hard
 * bedrag voor vertrekkosten; lib/site-meta.test.ts bewaakt dat.
 */
export const SITE_TITLE = 'Loep | Zie waar behoud onder druk staat, voordat mensen gaan'

export const SITE_DESCRIPTION =
  "Eén vertrokken medewerker vervangen kost al snel tienduizenden euro's. Loep laat zien waar behoud onder druk staat, waarom volgens je mensen zelf, en waar je begint. Meting en rapport; het gesprek voer je zelf."

/** Beschrijving in de WebPage-JSON-LD van de homepage. */
export const HOME_SCHEMA_DESCRIPTION =
  'Meting van behoud, vertrek en onboarding voor HR en management: waar het wringt, waarom volgens je mensen, en waar je begint. Het rapport leidt het gesprek met je MT; dat gesprek voer je zelf.'
```

- [ ] **Step 4: Gebruik de constanten in `app/layout.tsx`**

Voeg onder de bestaande imports toe:
```ts
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-meta'
```
Vervang in het `metadata`-object:

| Nu | Wordt |
|---|---|
| `default: 'Loep \| Begeleide analyse van behoud, vertrek en onboarding',` | `default: SITE_TITLE,` |
| het blok `description:` + de regel `'Loep laat organisaties van 100 tot 1.000 medewerkers zien waar het wringt, ... rapport en gesprek inbegrepen, geen software om te beheren.',` (direct boven `metadataBase`) | `description: SITE_DESCRIPTION,` |
| in `openGraph`: `title: 'Loep \| Begeleide analyse van behoud, vertrek en onboarding',` | `title: SITE_TITLE,` |
| in `openGraph`: het blok `description:` + `'Zie waar het wringt voordat mensen vertrekken, ... Begeleide scan met rapport en gesprek inbegrepen.',` | `description: SITE_DESCRIPTION,` |
| in `twitter`: `title: 'Loep \| Begeleide analyse van behoud, vertrek en onboarding',` | `title: SITE_TITLE,` |
| in `twitter`: het blok `description:` + dezelfde zin | `description: SITE_DESCRIPTION,` |

`title.template` (`'%s | Loep'`), `metadataBase`, `images`, `robots` en `verification` blijven ongewijzigd.

- [ ] **Step 5: Gebruik de constanten in `app/page.tsx`**

Voeg onder de bestaande imports toe:
```ts
import { HOME_SCHEMA_DESCRIPTION, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-meta'
```
Vervang het `metadata`-object door:
```ts
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}
```
Vervang in `homepageSchema` het blok
```ts
    description:
      'Begeleide scan van behoud, vertrek en onboarding voor HR en management: waar het wringt, waarom volgens je mensen, en waar je begint. Rapport en gesprek per scan inbegrepen.',
```
door
```ts
    description: HOME_SCHEMA_DESCRIPTION,
```

- [ ] **Step 6: Herschrijf de tekst van `app/opengraph-image.tsx`**

Alleen tekst en twee lettergroottes; de opmaak (het oude blauwe kleurenpalet) blijft, zie "Wat Lars moet beslissen". De nieuwe kop is langer dan de oude, vandaar de kleinere letter.

| Nu | Wordt |
|---|---|
| `Loep Vertrek + Loep Behoud + Loep Cultuurbeeld` | `Loep Behoud · Loep Vertrek · Loep Start` |
| `<div style={{ fontSize: '74px', fontWeight: 700, lineHeight: 1.02 }}>` met `Kies eerst de juiste route.` | `<div style={{ fontSize: '58px', fontWeight: 700, lineHeight: 1.05 }}>` met `Zie waar behoud onder druk staat, voordat mensen gaan.` |
| `<div style={{ fontSize: '34px', lineHeight: 1.3, color: '#334155' }}>` met `Begrijp waarom mensen gingen, zie eerder waar behoud onder druk staat of lees cultuur en engagement breed.` | `<div style={{ fontSize: '30px', lineHeight: 1.3, color: '#334155' }}>` met `Waar het wringt, waarom volgens je mensen zelf, en waar je begint.` |
| `Loep levert drie duidelijke primary routes met dashboard, rapport en managementduiding in dezelfde taal.` | `Meting en rapport. Het gesprek met je MT voer je zelf.` |
| `Voor HR-teams` | `Voor HR en management` |
| `Dashboard, rapport en productkeuze in één commerciële flow` | `Een rapport dat je MT-gesprek leidt` |
| `Live routes` | `Drie scans` |
| het hele `<div style={{ fontSize: '24px', lineHeight: 1.3, color: '#7c3aed' }}>` met `Loep Cultuurbeeld` (drie regels) | verwijderd |
| `<div style={{ fontSize: '22px', lineHeight: 1.3, color: '#0284c7' }}>` rond `Loep Start` | `<div style={{ fontSize: '24px', lineHeight: 1.3, color: '#0284c7' }}>` |
| `Loep Vertrek en Loep Behoud voor HR-teams` (voettekst) | `Meting en rapport · Het gesprek voer je zelf` |

- [ ] **Step 7: Zet de titelverwachting in `seo-conversion.test.ts` recht**

Voeg bij de imports toe:
```ts
import { SITE_TITLE } from '@/lib/site-meta'
```
en vervang in de eerste test
```ts
    expect(homePageMetadata.title).toBe('Verisight')
```
door
```ts
    expect(homePageMetadata.title).toBe(SITE_TITLE)
```
De test verwachtte sinds de rebrand van juni de oude merknaam en viel daarom op main. Na Task 3 en deze regel is hij groen: dat is één van de twaalf verwachte `<`-regels in Task 16.

- [ ] **Step 8: Draai de tests**

Run: `npx vitest run lib/site-meta.test.ts lib/seo-conversion.test.ts lib/marketing-portfolio-cleanup.test.ts lib/public-route-access.test.ts 2>&1 | tail -20`
Expected: `site-meta` groen (8 tests); in `seo-conversion` is `keeps the homepage and support-page metadata aligned with current SEO positioning` nu groen, de andere drie rode blijven rood; `marketing-portfolio-cleanup` en `public-route-access` groen.

- [ ] **Step 9: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "app/layout.tsx|app/page.tsx|lib/site-meta.ts|opengraph-image" 2>&1 | tail -15
bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task6.txt
```
Expected: alle gefilterde guardtests groen. tsc `131`.

- [ ] **Step 10: Commit**

```bash
git add frontend/lib/site-meta.ts frontend/lib/site-meta.test.ts frontend/app/layout.tsx frontend/app/page.tsx frontend/app/opengraph-image.tsx frontend/lib/seo-conversion.test.ts
git commit -m "feat(site): titel en beschrijving raken de koopreden, uit één bron; link-preview in lijn

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Homepage, copy en het fotoblok

**Files:**
- Modify: `frontend/components/marketing/home-page-content.tsx` (regels 55, 76, 84, 92, 121, 132-133, 330, 581, 734, 948, 1730, 1761, 1776-1779, 1800-1845, 1892-1896)
- Delete: `frontend/public/images/lars-loep.jpg`
- Test: `frontend/lib/homepage-besluit-a.test.ts`

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/homepage-besluit-a.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FILE = 'components/marketing/home-page-content.tsx'

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function bron() {
  return fs.readFileSync(path.join(process.cwd(), FILE), 'utf8').replace(/\s+/g, ' ')
}

describe('homepage na besluit A', () => {
  it('draagt de nieuwe categorieregel in de hero en in de donkere band', () => {
    expect(bron().split('Meting en rapport · Het gesprek voer je zelf').length - 1).toBe(2)
  })

  it('zegt dat jij het gesprek leidt en dat het rapport je leidraad is', () => {
    expect(bron()).toContain('Loep meet niet alleen. Het rapport brengt je MT tot één eerste keuze.')
    expect(bron()).toContain(
      'Daarna leid jij het gesprek met je MT, met het rapport als leidraad, en leggen jullie vast: wat, wie, wanneer.',
    )
    expect(bron()).toContain('én de leidraad voor je MT-gesprek.')
    expect(bron()).toContain("title: 'Kiezen met je MT: wat, wie, wanneer'")
  })

  it('belooft wat het rapport levert, niet wat Loep aan tafel doet', () => {
    expect(bron()).toContain("'Gespreksleidraad en besluitpagina in elk rapport',")
    expect(bron()).toContain("['Volgende stap', 'Besluit vastgelegd'],")
    expect(bron().split('Het rapport leidt je MT-gesprek.').length - 1).toBe(2)
  })

  it('zegt eerlijk dat de klant de respons in een eigen omgeving volgt', () => {
    expect(bron()).toContain('Loep ziet hun adressen nooit. De respons volg je in je eigen omgeving.')
  })

  it('schrijft de werkvragen toe aan de twee scans die ze hebben, niet aan Loep Start', () => {
    expect(bron()).toContain(
      'De vertaling naar jullie situatie maak je zelf, met de werkvragen in het rapport van Loep Behoud en Loep Vertrek.',
    )
  })

  it('heeft het fotoblok met de quote niet meer', () => {
    expect(bron()).not.toContain('lars-loep.jpg')
    expect(bron()).not.toContain('Lars van den Hengel')
    expect(fs.existsSync(path.join(process.cwd(), 'public/images/lars-loep.jpg'))).toBe(false)
    // De foto op /kennismaking blijft.
    expect(fs.existsSync(path.join(process.cwd(), 'public/images/lars-kennismaking.png'))).toBe(true)
  })

  it('gebruikt Loep als onderwerp in de kaart van Loep Start', () => {
    expect(bron()).toContain("body: 'Loep meet vroeg hoe nieuwe medewerkers landen.")
    expect(bron()).not.toContain('Wij meten vroeg')
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/homepage-besluit-a.test.ts`
Expected: FAIL op alle zeven tests.

- [ ] **Step 3: Vervang de copy**

Elke rij is één letterlijke vervanging in `frontend/components/marketing/home-page-content.tsx`. "Spec" betekent: tekst uit spec par. 4.2; "plan" betekent: door de planschrijver geformuleerd (zie de zelfreview).

| Regel | Nu | Wordt | Bron |
|---|---|---|---|
| 55 | `body: 'Samen, in één gesprek.',` | `body: 'Met je MT, in één gesprek.',` | plan |
| 76 | `... en waar je begint. Rapport en gesprek inbegrepen.',` (kaart Loep Behoud) | `... en waar je begint. Het rapport leidt je MT-gesprek.',` | plan |
| 84 | `... en wat je als eerste aanpakt. Rapport en gesprek inbegrepen.',` (kaart Loep Vertrek) | `... en wat je als eerste aanpakt. Het rapport leidt je MT-gesprek.',` | plan |
| 92 | `body: 'Wij meten vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, ...` | `body: 'Loep meet vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, ...` (de rest van de zin, met de zin over de verdieping, blijft letterlijk staan; `lib/loep-start-scope-disclosure.test.ts` pint hem) | plan |
| 121 | `... Loep ziet hun adressen nooit, en jij beheert geen tool.',` | `... Loep ziet hun adressen nooit. De respons volg je in je eigen omgeving.',` | plan |
| 132 | `title: 'Samen kiezen: wat, wie, wanneer',` | `title: 'Kiezen met je MT: wat, wie, wanneer',` | plan |
| 133 | `body: 'In het gesprek met je MT kiezen jullie samen: wat pakken we op, wie doet het, wanneer kijken we terug. Geen actieplan uit een computer. Jullie kiezen, met de feiten erbij.',` | `body: 'Jij leidt het gesprek met je MT; het rapport is je leidraad van 45 minuten. Jullie kiezen: wat pakken we op, wie doet het, wanneer kijken we terug. Geen actieplan uit een computer, wel de feiten erbij.',` | plan |
| 330 | `['Volgende stap', 'Bespreking ingepland'],` | `['Volgende stap', 'Besluit vastgelegd'],` | spec |
| 581 | `Loep meet niet alleen. Loep begeleidt management naar één eerste keuze.` | `Loep meet niet alleen. Het rapport brengt je MT tot één eerste keuze.` | spec |
| 734 | `Begeleide retentie-analyse` | `Meting en rapport · Het gesprek voer je zelf` | spec |
| 948 | `... Daarna bespreken we het samen met je MT en leggen we vast: wat, wie, wanneer.` | `... Daarna leid jij het gesprek met je MT, met het rapport als leidraad, en leggen jullie vast: wat, wie, wanneer.` | spec |
| 1730 | `'Managementbespreking standaard inbegrepen',` | `'Gespreksleidraad en besluitpagina in elk rapport',` | spec |
| 1761 | `Begeleide analyse · Geen zelfbedieningstool` | `Meting en rapport · Het gesprek voer je zelf` | spec |
| 1778 | `én het directiegesprek.` | `én de leidraad voor je MT-gesprek.` | plan |

In regel 133 staat "wat pakken we op": dat is het MT dat spreekt, niet Loep, en blijft.

- [ ] **Step 4: Haal het fotoblok weg**

In `ProofSection`: de linkerkolom is nu een `<div>` met twee `<Reveal>`-blokken: de `h2` "Veilig op groepsniveau. Niets op de persoon." en daaronder de foto met naam, functie en quote. Herstel de stand van vóór commit `b54f537e` (21 juni): de `h2` staat direct in het raster, zonder omhullende `<div>`.

Vervang het hele blok van
```tsx
          <div>
            <Reveal>
              <h2
```
tot en met de `</div>` die de linkerkolom sluit (de regel direct vóór `<div style={{ minWidth: 0 }}>`) door:
```tsx
          <Reveal>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(2.6rem, 4.2vw, 4.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.96,
                maxWidth: '16ch',
              }}
            >
              Veilig op groepsniveau. Niets op de persoon.
            </h2>
          </Reveal>
```
De rechterkolom (`<div style={{ minWidth: 0 }}>` met de vier punten, het Methode-blok en de knop naar het voorbeeldrapport) blijft staan. De spec zegt "weer één kolom"; zo'n stand heeft nooit bestaan: vóór de foto was het hetzelfde tweekoloms raster met alleen de kop links. Dat is wat hier terugkomt.

Run (vanuit de worktree-root): `git rm frontend/public/images/lars-loep.jpg`

Bewijs dat de foto nergens anders gebruikt wordt:
```bash
cd frontend && grep -rn "lars-loep" --include=*.ts --include=*.tsx --include=*.css --include=*.json app components lib public 2>/dev/null
```
Expected: geen regels.

- [ ] **Step 5: Voeg de werkvragenzin toe aan het Methode-blok**

Spec par. 8 punt 2: de onware claim is er al uit (`967ede3a`); de ronde voegt alleen de zin over de werkvragen toe. Loep Start heeft geen werkvragen (plan 3b), dus de zin noemt de twee scans die ze wel hebben; dat wijkt af van de letterlijke spectekst en staat in de zelfreview.

Vervang
```tsx
                  Geen cijfer dat je maar moet geloven.
                </p>
```
door
```tsx
                  Geen cijfer dat je maar moet geloven. De vertaling naar jullie situatie maak je zelf,
                  met de werkvragen in het rapport van Loep Behoud en Loep Vertrek.
                </p>
```

- [ ] **Step 6: Draai de tests**

Run: `npx vitest run lib/homepage-besluit-a.test.ts lib/loep-start-scope-disclosure.test.ts lib/commercial-homepage.test.ts lib/homepage-dashboard-preview-label.test.ts lib/marketing-proof-layer.test.ts 2>&1 | tail -20`
Expected: `homepage-besluit-a` groen (7 tests); `loep-start-scope-disclosure` groen; `commercial-homepage`, `homepage-dashboard-preview-label` en `marketing-proof-layer` exact zoals op main (controleer tegen `fails-baseline.txt`: `commercial-homepage` drie rood, `marketing-proof-layer` twee rood, `homepage-dashboard-preview-label` één rood; alle zes pinnen copy van vóór juni en staan in de baseline).

- [ ] **Step 7: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "home-page-content" 2>&1 | tail -10
bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task7.txt
```
Expected: de drie guardtests voor `home-page-content.tsx` groen. tsc `131`.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/components/marketing/home-page-content.tsx frontend/lib/homepage-besluit-a.test.ts frontend/public/images/lars-loep.jpg
git commit -m "feat(site): homepage na besluit A: jij leidt het gesprek, het rapport is je leidraad; founderfoto weg

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: `/producten`, levering, leads, hero en de MTO-vergelijking

**Files:**
- Modify: `frontend/components/marketing/producten-content.tsx:14-21, 29, 43, 54, 75, 135-140, 176-182, 362-366`
- Test: `frontend/lib/producten-besluit-a.test.ts`

Alleen copy; de prijs volgt in Task 9. **Let op `lib/loep-start-scope-disclosure.test.ts`**: die pint dat de hero `Drie scans, één recept` bevat, de zin `Bij Loep Vertrek en Loep Behoud staat er ook in waarom dat zo is en wat er volgens je mensen moet gebeuren.` en het fragment `een rapport dat zegt waar het wringt en waar je begint`, en dat de regel `'Rapport: waar het wringt en waar je begint (bij Loep Vertrek en Loep Behoud ook waarom)',` precies twee keer voorkomt. De wordt-teksten hieronder houden daar rekening mee; die test moet groen blijven.

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/producten-besluit-a.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FILE = 'components/marketing/producten-content.tsx'

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function bron() {
  return fs.readFileSync(path.join(process.cwd(), FILE), 'utf8').replace(/\s+/g, ' ')
}

describe('/producten na besluit A: wie doet wat', () => {
  it('beschrijft in de gedeelde route wat Loep doet en wat je zelf doet', () => {
    for (const regel of [
      "'Intake en scopebepaling',",
      "'Meting klaarzetten: vragenlijst, afdelingen en de uitnodigingstekst die je zelf verstuurt',",
      "'Je volgt de respons in je eigen omgeving en sluit of verlengt zelf',",
      "'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',",
      "'Besluit vastleggen in je omgeving',",
    ]) {
      expect(bron(), regel).toContain(regel)
    }
  })

  it('maakt Loep het onderwerp van elke lead en laat het rapport het MT tot een keuze brengen', () => {
    expect(bron()).toContain(
      "lead: 'Loep brengt vertrekpatronen scherp in beeld, en het rapport brengt je MT tot één duidelijke keuze.',",
    )
    expect(bron()).toContain(
      "lead: 'Loep laat zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt, en het rapport brengt je MT tot één eerste keuze.',",
    )
    expect(bron()).toContain(
      "lead: 'Loep meet vroeg hoe nieuwe medewerkers landen. Het rapport geeft je MT een helder groepsbeeld om één eerste stap op te kiezen.',",
    )
    expect(bron()).not.toMatch(/\bWij\b/)
    expect(bron()).not.toContain('stemmen we')
  })

  it('zegt in de hero dat jij verstuurt en het gesprek leidt', () => {
    expect(bron()).toContain('Drie scans, één recept: Loep zet de meting klaar, jij verstuurt hem, en je krijgt een rapport dat zegt waar het wringt en waar je begint.')
    expect(bron()).toContain('Daarna leid jij het gesprek met je MT; het rapport is je leidraad.')
  })

  it('noemt de route vast, niet begeleid', () => {
    expect(bron()).toContain('Eén vaste route, ongeacht de scan.')
    expect(bron()).toContain(
      'Loep zet klaar en levert het rapport; jij verstuurt, volgt de respons en leidt het gesprek.',
    )
  })

  it('zet in de MTO-vergelijking een antwoord tegenover een dashboard', () => {
    expect(bron()).toContain("'Je wilt een antwoord waar je MT mee aan tafel kan, geen dashboard om te beheren',")
  })

  it('houdt de verwachtingsregel van Loep Vertrek, met Loep als onderwerp', () => {
    expect(bron()).toContain(
      "note: 'Patroonanalyse vraagt minimaal 10 respondenten. Bij kleinere organisaties stemt Loep de meetperiode daarop af in de intake.',",
    )
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/producten-besluit-a.test.ts`
Expected: FAIL op alle zes tests.

- [ ] **Step 3: Vervang de copy**

Elke rij is één letterlijke vervanging in `frontend/components/marketing/producten-content.tsx`.

| Regel | Nu | Wordt | Bron |
|---|---|---|---|
| 16 | `'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',` | `'Meting klaarzetten: vragenlijst, afdelingen en de uitnodigingstekst die je zelf verstuurt',` | spec |
| 17 | `'Respons monitoren op campagneniveau',` | `'Je volgt de respons in je eigen omgeving en sluit of verlengt zelf',` | spec |
| 19 | `'Begeleide managementbespreking (60–90 min)',` (in `sharedDelivery`) | `'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',` | spec |
| 20 | `'Vervolgstap vastgelegd',` (in `sharedDelivery`) | `'Besluit vastleggen in je omgeving',` | spec |
| 29 | `lead: 'Wij brengen vertrekpatronen scherp in beeld en begeleiden je naar één duidelijke managementkeuze.',` | `lead: 'Loep brengt vertrekpatronen scherp in beeld, en het rapport brengt je MT tot één duidelijke keuze.',` | spec |
| 43 | `note: 'Patroonanalyse vraagt minimaal 10 respondenten. Bij kleinere organisaties stemmen we de meetperiode daarop af in de intake.',` | `note: 'Patroonanalyse vraagt minimaal 10 respondenten. Bij kleinere organisaties stemt Loep de meetperiode daarop af in de intake.',` | plan |
| 54 | `lead: 'Wij laten zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt.',` | `lead: 'Loep laat zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt, en het rapport brengt je MT tot één eerste keuze.',` | plan |
| 75 | `lead: 'Wij meten vroeg hoe nieuwe medewerkers landen en leveren een helder groepsbeeld.',` | `lead: 'Loep meet vroeg hoe nieuwe medewerkers landen. Het rapport geeft je MT een helder groepsbeeld om één eerste stap op te kiezen.',` | plan |
| 177 | `Eén begeleide route, ongeacht de scan.` | `Eén vaste route, ongeacht de scan.` | spec |
| 365 | `'Je wilt duiding en een managementbespreking, geen zelfbeheer',` | `'Je wilt een antwoord waar je MT mee aan tafel kan, geen dashboard om te beheren',` | spec |

De regel `'Rapport: waar het wringt en waar je begint (bij Loep Vertrek en Loep Behoud ook waarom)',` (regel 18) blijft letterlijk staan.

Vervang de hero-alinea (regels 136-139)
```tsx
            Drie scans, één recept: Loep doet de meting, jij krijgt een rapport dat zegt waar het wringt en waar je
            begint. Bij Loep Vertrek en Loep Behoud staat er ook in waarom dat zo is en wat er volgens je mensen moet
            gebeuren. Daarna bespreken we het samen. Geen software om te beheren. Loep Vertrek als er al mensen weg
            zijn, Loep Behoud als je ze wilt houden, Loep Start als nieuwe mensen moeten landen.
```
door
```tsx
            Drie scans, één recept: Loep zet de meting klaar, jij verstuurt hem, en je krijgt een rapport dat zegt
            waar het wringt en waar je begint. Bij Loep Vertrek en Loep Behoud staat er ook in waarom dat zo is en wat
            er volgens je mensen moet gebeuren. Daarna leid jij het gesprek met je MT; het rapport is je leidraad.
            Loep Vertrek als er al mensen weg zijn, Loep Behoud als je ze wilt houden, Loep Start als nieuwe mensen
            moeten landen.
```

Vervang in `SharedDeliverySection` (regels 180-181)
```tsx
                De drie scans verschillen in vraag en uitkomst, maar de uitvoering is hetzelfde. Loep voert uit, jij
                beheert geen tool.
```
door
```tsx
                De drie scans verschillen in vraag en uitkomst, maar de route is hetzelfde. Loep zet klaar en levert
                het rapport; jij verstuurt, volgt de respons en leidt het gesprek.
```

De lijst `included` in `PricingSection` (regels 280-286) gaat mee in Task 9.

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run lib/producten-besluit-a.test.ts lib/loep-start-scope-disclosure.test.ts lib/marketing-portfolio-cleanup.test.ts lib/producten-page-follow-on.test.ts 2>&1 | tail -15`
Expected: `producten-besluit-a` groen (6 tests); `loep-start-scope-disclosure` en `marketing-portfolio-cleanup` groen; `producten-page-follow-on` rood zoals op main (één test, staat in de baseline).

- [ ] **Step 5: Commit**

```bash
git add frontend/components/marketing/producten-content.tsx frontend/lib/producten-besluit-a.test.ts
git commit -m "feat(site): /producten zegt wie wat doet: Loep zet klaar, jij verstuurt en leidt het gesprek

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: `/producten`, prijsregel per scan, tarievensectie met staffel en de `OfferCatalog`

**Files:**
- Modify: `frontend/components/marketing/producten-content.tsx:1-6, 219-225, 279-354`
- Modify: `frontend/app/producten/page.tsx`
- Test: `frontend/lib/producten-pricing.test.ts`

Ontwerp van de staffel, binnen de bestaande visuele taal (tokens `T`, `FF`, dunne lijnen, geen kaarten, geen nieuwe componenten): elke trede is een rij met het label bovenaan en daaronder twee gelijke kolommen, "Eerste scan" en "Vervolgmeting", elk met een klein bijschrift en het bedrag. Een tabel met drie kolommen naast elkaar past niet op 375 px (335 px bruikbaar); twee kolommen van `minmax(0, 1fr)` onder een label wel, op elke breedte. "Boven 1.000 medewerkers" is een vierde rij zonder bedrag. De uitleg van wat een eerste scan en een vervolgmeting is staat één keer onder de rijen, niet per trede.

Per scan (in `ScanSection`) staat het bereik, niet één bedrag: "€3.500 tot €6.900", met een link naar de staffel. Het woord "vanaf" is op 4 juli bewust geschrapt en komt niet terug; een bereik is eerlijker dan een vanaf-prijs.

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/producten-pricing.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function bron(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\s+/g, ' ')
}

const CONTENT = 'components/marketing/producten-content.tsx'
const PAGE = 'app/producten/page.tsx'

describe('/producten: de prijs komt uit lib/pricing.ts', () => {
  it('importeert de staffel en de weergavehelpers', () => {
    expect(bron(CONTENT)).toContain("from '@/lib/pricing'")
    for (const naam of [
      'PRICING_TIERS',
      'PRICING_ABOVE_LABEL',
      'PRICING_ABOVE_TEXT',
      'PRICING_VAT_NOTE',
      'firstScanRangeLabel',
      'followUpRangeLabel',
      'formatEur',
    ]) {
      expect(bron(CONTENT), naam).toContain(naam)
    }
  })

  it('rendert elke trede met beide bedragen en de rij op aanvraag', () => {
    expect(bron(CONTENT)).toContain('{PRICING_TIERS.map((tier) => (')
    expect(bron(CONTENT)).toContain('{formatEur(tier.firstScanEur)}')
    expect(bron(CONTENT)).toContain('{formatEur(tier.followUpEur)}')
    expect(bron(CONTENT)).toContain('{tier.note ? (')
    expect(bron(CONTENT)).toContain('{PRICING_ABOVE_LABEL}')
    expect(bron(CONTENT)).toContain('{PRICING_ABOVE_TEXT}')
  })

  it('toont per scan het bereik met een link naar de staffel, geen los bedrag en geen "vanaf"', () => {
    expect(bron(CONTENT)).toContain('{firstScanRangeLabel()}')
    expect(bron(CONTENT)).toContain('Vervolgmeting daarna: {followUpRangeLabel()} {PRICING_VAT_NOTE}.')
    expect(bron(CONTENT)).toContain('href="#tarieven"')
    // Het woord staat wel in drie codecommentaren ("afgerond vanaf de officiële ..."); het gaat om een vanaf-prijs.
    expect(bron(CONTENT)).not.toContain('vanaf €')
    expect(bron(CONTENT)).not.toContain('Vanaf €')
    expect(bron(CONTENT)).not.toContain('anaf {')
  })

  it('legt de staffel uit als logica, niet als korting', () => {
    expect(bron(CONTENT)).toContain('Eén vaste prijs, naar de grootte van je organisatie.')
    expect(bron(CONTENT)).toContain(
      'Een grotere organisatie heeft meer op het spel staan als behoud onder druk komt; een kleinere minder, en die betaalt dus minder.',
    )
    expect(bron(CONTENT)).toContain('Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons achteraf.')
    expect(bron(CONTENT)).not.toMatch(/korting/i)
  })

  it('houdt de rekensom van 30 euro per medewerker, zonder de bespreking', () => {
    expect(bron(CONTENT)).toContain('komt een scan neer op zo&rsquo;n €30 per medewerker.')
    expect(bron(CONTENT)).not.toContain('inclusief de')
  })

  it('beschrijft de eerste scan en de vervolgmeting zonder bespreking', () => {
    expect(bron(CONTENT)).toContain(
      'Eenmalig en alles inbegrepen: inrichting, meting, rapport met gespreksleidraad en besluitpagina.',
    )
    // Tussenvorm tot plan 3c (spec par. 4.3).
    expect(bron(CONTENT)).toContain('het rapport van je tweede meting leg je naast het eerste.')
    expect(bron(CONTENT)).not.toContain('compacte bespreking')
  })

  it('zet in de inbegrepen-lijst wat het rapport levert en wat je zelf doet', () => {
    expect(bron(CONTENT)).toContain("'Meting klaargezet door Loep: vragenlijst, afdelingen en uitnodigingstekst',")
    expect(bron(CONTENT).split("'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',").length - 1).toBe(2)
    expect(bron(CONTENT).split("'Besluit vastleggen in je omgeving',").length - 1).toBe(2)
  })
})

describe('/producten: structured data', () => {
  it('rendert de OfferCatalog uit de ene bron', () => {
    expect(bron(PAGE)).toContain("import { buildPricingOfferCatalog } from '@/lib/pricing'")
    expect(bron(PAGE)).toContain('const pricingSchema = buildPricingOfferCatalog()')
    expect(bron(PAGE)).toContain('JSON.stringify(pricingSchema)')
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/producten-pricing.test.ts`
Expected: FAIL op alle acht tests.

- [ ] **Step 3: Importeer de staffel in `producten-content.tsx`**

Voeg onder `import { buildContactHref } from '@/lib/contact-funnel'` toe:
```tsx
import {
  PRICING_ABOVE_LABEL,
  PRICING_ABOVE_TEXT,
  PRICING_TIERS,
  PRICING_VAT_NOTE,
  firstScanRangeLabel,
  followUpRangeLabel,
  formatEur,
} from '@/lib/pricing'
```

- [ ] **Step 4: Vervang de prijsregel per scan in `ScanSection`**

Vervang (regels 219-225)
```tsx
              <div style={{ alignItems: 'baseline', display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: T.ink, fontFamily: FF, fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>€4.500</span>
                <span style={{ color: T.inkMuted, fontSize: 13 }}>excl. btw · volledig traject</span>
              </div>
              <p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>
                Vervolgmeting daarna: €1.250 excl. btw
              </p>
```
door
```tsx
              <div style={{ alignItems: 'baseline', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <span style={{ color: T.ink, fontFamily: FF, fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>{firstScanRangeLabel()}</span>
                <span style={{ color: T.inkMuted, fontSize: 13 }}>{PRICING_VAT_NOTE} · naar de grootte van je organisatie</span>
              </div>
              <p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>
                Vervolgmeting daarna: {followUpRangeLabel()} {PRICING_VAT_NOTE}.{' '}
                <a href="#tarieven" style={{ color: scan.accent, fontWeight: 600, textDecoration: 'none' }}>
                  Bekijk de staffel
                </a>
              </p>
```

- [ ] **Step 5: Vervang `PricingSection` in zijn geheel**

Vervang de hele functie `PricingSection` (van `function PricingSection() {` tot en met de sluitende `}` vóór `function MtoComparisonSection() {`) door:
```tsx
// Tussenvorm tot plan 3c (spec 2026-09-20 par. 4.3): het rapport legt de twee
// metingen nog niet zelf naast elkaar. Task 17 van het plan vervangt deze zin
// zodra 3c live is; public/llms.txt gaat dan mee.
const FOLLOW_UP_COPY =
  'Dezelfde meting opnieuw, wanneer je wilt zien of het signaal beweegt. De inrichting staat er al; het rapport van je tweede meting leg je naast het eerste.'

function PricingSection() {
  const included = [
    'Intake en scopebepaling',
    'Meting klaargezet door Loep: vragenlijst, afdelingen en uitnodigingstekst',
    'Rapport: waar het wringt en waar je begint (bij Loep Vertrek en Loep Behoud ook waarom)',
    'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',
    'Besluit vastleggen in je omgeving',
  ] as const
  const amountCaption = {
    color: T.inkMuted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.14em',
    marginBottom: 4,
    textTransform: 'uppercase',
  } as const
  const amountValue = { color: T.ink, fontFamily: FF, fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' } as const

  return (
    <section id="tarieven" style={{ background: T.paperSoft, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0', scrollMarginTop: 80 }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 items-start">
          <Reveal>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: AC.deep, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 12, textTransform: 'uppercase' }}>Tarieven</div>
              <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.026em', lineHeight: 1.06, marginBottom: 16 }}>
                Eén vaste prijs, naar de grootte van je organisatie.
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 16, lineHeight: 1.72, marginBottom: 16, maxWidth: '52ch' }}>
                De prijs hangt af van hoe groot je organisatie is, niet van het aantal mensen dat meedoet. Een grotere
                organisatie heeft meer op het spel staan als behoud onder druk komt; een kleinere minder, en die betaalt
                dus minder. Elke scan is een volledig traject, van intake tot en met het rapport met gespreksleidraad.
                Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons achteraf. Doorlooptijd: weken,
                geen maanden; het precieze ritme stem je af in de intake. Maatwerk op aanvraag.
              </p>
              <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.72, marginBottom: 24, maxWidth: '52ch' }}>
                Ter vergelijking: een volledig uitbesteed onderzoekstraject kost al snel drie tot vier keer zoveel.
                Bij een organisatie van 150 medewerkers komt een scan neer op zo&rsquo;n €30 per medewerker.
              </p>
              <div style={{ borderTop: `1px solid ${T.rule}` }}>
                {PRICING_TIERS.map((tier) => (
                  <div key={tier.id} style={{ borderBottom: `1px solid ${T.rule}`, padding: '16px 0' }}>
                    <div style={{ color: T.ink, fontFamily: FF, fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{tier.label}</div>
                    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                      <div>
                        <div style={amountCaption}>Eerste scan</div>
                        <div style={amountValue}>{formatEur(tier.firstScanEur)}</div>
                      </div>
                      <div>
                        <div style={amountCaption}>Vervolgmeting</div>
                        <div style={amountValue}>{formatEur(tier.followUpEur)}</div>
                      </div>
                    </div>
                    {tier.note ? (
                      <p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>{tier.note}</p>
                    ) : null}
                  </div>
                ))}
                <div style={{ alignItems: 'baseline', borderBottom: `1px solid ${T.rule}`, display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 0' }}>
                  <span style={{ color: T.ink, fontFamily: FF, fontSize: 17, fontWeight: 700 }}>{PRICING_ABOVE_LABEL}</span>
                  <span style={{ color: T.inkSoft, fontSize: 15, marginLeft: 'auto' }}>{PRICING_ABOVE_TEXT}</span>
                </div>
              </div>
              <p style={{ color: T.inkMuted, fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>Alle bedragen {PRICING_VAT_NOTE}.</p>
              <p style={{ color: T.inkMuted, fontSize: 13.5, lineHeight: 1.6, marginTop: 16 }}>
                <strong style={{ color: T.ink, fontWeight: 600 }}>Eerste scan.</strong> Eenmalig en alles inbegrepen:
                inrichting, meting, rapport met gespreksleidraad en besluitpagina.
              </p>
              <p style={{ color: T.inkMuted, fontSize: 13.5, lineHeight: 1.6, marginTop: 8 }}>
                <strong style={{ color: T.ink, fontWeight: 600 }}>Vervolgmeting.</strong> {FOLLOW_UP_COPY}
              </p>
              <p style={{ color: T.inkSoft, fontSize: 14, fontWeight: 600, marginTop: 14 }}>
                Zo wordt Loep goedkoper naarmate je het langer gebruikt, niet duurder.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div style={{ background: T.white, border: `1px solid ${T.rule}`, padding: '22px 24px' }}>
              <div style={{ color: T.inkMuted, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 14, textTransform: 'uppercase' }}>
                Inbegrepen bij elke scan
              </div>
              <div style={{ borderTop: `1px solid ${T.rule}` }}>
                {included.map((item) => (
                  <div key={item} style={{ alignItems: 'flex-start', borderBottom: `1px solid ${T.rule}`, display: 'grid', gap: 12, gridTemplateColumns: '16px 1fr', padding: '12px 0' }}>
                    <span aria-hidden style={{ background: AC.mid, borderRadius: '50%', height: 6, marginTop: 8, width: 6 }} />
                    <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```
De rechterkolom ("Inbegrepen bij elke scan") is ongewijzigd op de inhoud van de lijst na.

- [ ] **Step 6: Zet de `OfferCatalog` op `/producten`**

In `frontend/app/producten/page.tsx`: voeg onder `import { buildContactHref } from '@/lib/contact-funnel'` toe
```tsx
import { buildPricingOfferCatalog } from '@/lib/pricing'
```
voeg in `ProductenPage` direct na de declaratie van `breadcrumbSchema` toe
```tsx
  // Prijzen in de structured data komen uit dezelfde bron als de tarievensectie.
  const pricingSchema = buildPricingOfferCatalog()
```
en direct na het bestaande `<script type="application/ld+json" ... breadcrumbSchema ... />`
```tsx
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />
```

- [ ] **Step 7: Draai de tests**

Run: `npx vitest run lib/producten-pricing.test.ts lib/producten-besluit-a.test.ts lib/loep-start-scope-disclosure.test.ts lib/pricing.test.ts 2>&1 | tail -12`
Expected: alle vier groen.

- [ ] **Step 8: Kijk in de browser, desktop en 375 px**

Run (tweede shell, laat draaien): `cd frontend && npm run dev -- --port 3100`

Open `http://localhost:3100/producten#tarieven`. Controleer op desktop: drie treden onder elkaar, elk met twee bedragen; onder de eerste trede de Loep Vertrek-noot; de rij "Boven 1.000 medewerkers" met "Op aanvraag"; per scan bovenaan de pagina "€3.500 tot €6.900". Zet de viewport op 375 breed en voer in de console uit:
```js
document.documentElement.scrollWidth
```
Expected: `375`. De bedragen breken niet af en lopen niet over elkaar. Stop de dev-server daarna.

- [ ] **Step 9: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "producten" 2>&1 | tail -12
bash /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tscset.sh /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/tsc-task9.txt
```
Expected: alle guardtests voor `producten-content.tsx` en `app/producten/page.tsx` groen (die voor `app/producten/[slug]/page.tsx` nog niet, Task 13). tsc `131`.

- [ ] **Step 10: Commit**

```bash
git add frontend/components/marketing/producten-content.tsx frontend/app/producten/page.tsx frontend/lib/producten-pricing.test.ts
git commit -m "feat(site): prijsstaffel op /producten#tarieven en in de structured data, per scan het bereik

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Gedeelde content die rendert, `/vertrouwen` en de FAQ-JSON-LD

**Files:**
- Modify: `frontend/components/marketing/site-content.ts` (imports; `trustItems`; `trustHubAnswerCards`, kaart "Wat koop je precies?"; de laatste twee items van `faqs`, plus één nieuw item)
- Test: `frontend/lib/site-content-besluit-a.test.ts`

Na Task 5 staan er nog vier treffers in dit bestand, en alle vier renderen: `trustItems` (de eerste vier items staan op `/vertrouwen`), de kaart "Wat koop je precies?" (ook `/vertrouwen`), en twee antwoorden in `faqs`, dat via `faqSchema` als FAQ-JSON-LD op de homepage staat. De prijs-FAQ komt erbij (spec par. 8 punt 5: de veelgestelde vragen krijgen dezelfde drie treden).

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/site-content-besluit-a.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { faqSchema, faqs, trustHubAnswerCards, trustItems } from '@/components/marketing/site-content'
import { pricingFaqAnswer } from '@/lib/pricing'

describe('/vertrouwen na besluit A', () => {
  it('zegt in de trustregel wie wat doet', () => {
    expect(trustItems).toContain('Loep zet de meting klaar, jij verstuurt en leidt het gesprek')
    expect(trustItems.join(' ')).not.toMatch(/voert uit|beheert geen/i)
  })

  it('beantwoordt "Wat koop je precies?" met een meting en een rapport', () => {
    const kaart = trustHubAnswerCards.find((card) => card.title === 'Wat koop je precies?')
    expect(kaart?.body).toBe(
      'Een meting en een rapport. Loep zet de meting klaar, jij verstuurt hem, en het rapport zegt waar je begint en leidt je MT-gesprek. Geen licentie, geen platform dat je moet inrichten.',
    )
  })
})

describe('FAQ-JSON-LD na besluit A', () => {
  const antwoord = (vraag: string) => faqs.find(([question]) => question === vraag)?.[1]

  it('beschrijft Loep Start zonder bespreking', () => {
    expect(antwoord('Wanneer is Loep Start de juiste route?')).toBe(
      'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep zet de meting klaar en levert een rapport op groepsniveau, met een gespreksleidraad voor het gesprek met je MT.',
    )
  })

  it('noemt Loep een meting en een rapport, geen dienst aan tafel', () => {
    expect(antwoord('Is Loep een instrument of een dienst?')).toBe(
      'Een meting en een rapport. Loep zet de meting klaar en levert het rapport; jij verstuurt de uitnodiging, volgt de respons in je eigen omgeving en leidt het gesprek met je MT, met het rapport als leidraad. Geen licentie, geen platform dat je moet inrichten.',
    )
  })

  it('heeft een prijsvraag waarvan het antwoord uit de staffel komt', () => {
    expect(antwoord('Wat kost een scan van Loep?')).toBe(pricingFaqAnswer())
  })

  it('zet de prijsvraag ook in het schema dat de homepage rendert', () => {
    const entity = faqSchema.mainEntity.find((item) => item.name === 'Wat kost een scan van Loep?')
    expect(entity?.acceptedAnswer.text).toBe(pricingFaqAnswer())
  })

  it('belooft in geen enkel antwoord nog een bespreking of begeleiding', () => {
    for (const [vraag, tekst] of faqs) {
      expect(tekst, vraag).not.toMatch(/begeleid|bespreking/i)
    }
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/site-content-besluit-a.test.ts`
Expected: FAIL op alle zeven tests.

- [ ] **Step 3: Vervang de copy**

In `frontend/components/marketing/site-content.ts`:

(a) Voeg onder `import { buildContactHref } from '@/lib/contact-funnel'` toe:
```ts
import { pricingFaqAnswer } from '@/lib/pricing'
```

(b) In `trustItems` (plan):

| Nu | Wordt |
|---|---|
| `'Loep voert uit, je beheert geen tool',` | `'Loep zet de meting klaar, jij verstuurt en leidt het gesprek',` |

(c) In `trustHubAnswerCards`, kaart `title: 'Wat koop je precies?'` (spec par. 4.4):

| Nu | Wordt |
|---|---|
| `body: 'Een begeleide dienst: Loep voert de scan uit, levert een managementrapport met prioriteiten en begeleidt HR en management naar één eerste keuze. Geen platform om zelf te beheren.',` | `body: 'Een meting en een rapport. Loep zet de meting klaar, jij verstuurt hem, en het rapport zegt waar je begint en leidt je MT-gesprek. Geen licentie, geen platform dat je moet inrichten.',` |

(d) In `faqs` (plan; de spec geeft hier geen wordt-tekst omdat hij `faqs` voor dood hield):

| Vraag | Nu | Wordt |
|---|---|---|
| `'Wanneer is Loep Start de juiste route?'` | `'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep voert de checkpoint-read uit en levert een rapport met begeleide bespreking.',` | `'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep zet de meting klaar en levert een rapport op groepsniveau, met een gespreksleidraad voor het gesprek met je MT.',` |
| `'Is Loep een instrument of een dienst?'` | `'Loep is een begeleide dienst. Wij voeren de scan uit, leveren het rapport en begeleiden de managementbespreking. Je hoeft niets zelf in te richten of te beheren.',` | `'Een meting en een rapport. Loep zet de meting klaar en levert het rapport; jij verstuurt de uitnodiging, volgt de respons in je eigen omgeving en leidt het gesprek met je MT, met het rapport als leidraad. Geen licentie, geen platform dat je moet inrichten.',` |

(e) Voeg als laatste item van `faqs`, direct na het item `'Is Loep een instrument of een dienst?'` en vóór `] as const`, toe:
```ts
  // Het antwoord komt uit lib/pricing.ts, zodat de FAQ-JSON-LD nooit een ander
  // bedrag noemt dan /producten#tarieven.
  ['Wat kost een scan van Loep?', pricingFaqAnswer()],
```

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run lib/site-content-besluit-a.test.ts lib/marketing-positioning.test.ts lib/marketing-proof-layer.test.ts lib/marketing-flow.test.ts 2>&1 | tail -15`
Expected: `site-content-besluit-a` groen (7 tests); `marketing-positioning` drie rood zoals op main, de rest groen (de FAQ-tests pinnen de vragen over het verschil, het MTO, scores en de voorspeller, die ongewijzigd zijn); `marketing-proof-layer` twee rood zoals op main; `marketing-flow` groen.

- [ ] **Step 5: Guard en tsc**

Run:
```bash
npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "site-content" 2>&1 | tail -10
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
bash $T/tscset.sh $T/tsc-task10.txt
diff $T/tsc-task5.txt $T/tsc-task10.txt && echo "tsc-set identiek aan na Task 5"
```
Expected: de drie guardtests voor `site-content.ts` groen. tsc `131` en de set identiek aan die na Task 5. Verschijnt er een nieuwe fout in `marketing-positioning.test.ts` of `marketing-proof-layer.test.ts` door het nieuwe FAQ-item (de vergelijkingen daar leunen op de letterlijke types van `as const`), dan is dat een regressie: los hem op in `site-content.ts`, niet in de test.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/marketing/site-content.ts frontend/lib/site-content-besluit-a.test.ts
git commit -m "feat(site): /vertrouwen en de FAQ-JSON-LD na besluit A, prijsvraag uit de staffel

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: `public/llms.txt`

**Files:**
- Modify: `frontend/public/llms.txt:3-12, 21, 25-32`
- Modify: `frontend/lib/seo-conversion.test.ts` (test `keeps llms.txt aligned with the current pricing and product routes`)

De guard uit Task 2 heeft de test al: elke trede met beide bedragen, geen ander bedrag, "boven 1.000 medewerkers op aanvraag" en "Geen bespreking door Loep". Deze taak schrijft de tekst en trekt de bestaande contract-test gelijk.

- [ ] **Step 1: Bevestig dat de guard rood is op `llms.txt`**

Run: `npx vitest run lib/site-ronde-besluit-a.guard.test.ts -t "llms" 2>&1 | tail -15`
Expected: FAIL op de oude-belofte-test voor `public/llms.txt` en op de vijf tests onder `public/llms.txt volgt de staffel`.

- [ ] **Step 2: Vervang de samenvatting**

Vervang de hele blockquote (de tien regels die met `> ` beginnen, regels 3-12) door:
```
> Loep helpt organisaties van 100 tot 1.000 medewerkers zien waar het wringt,
> waarom volgens hun eigen mensen, en waar ze moeten beginnen. Anders dan een
> breed medewerkersonderzoek eindigt elke Loep-scan in een ranglijst waarvan
> de lezer ziet hoe die tot stand komt, plus een gespreksleidraad en een
> besluitpagina waarmee HR en management zelf kiezen wat ze als eerste
> aanpakken. Loep Behoud (waar het wringt bij mensen die je wilt houden), Loep
> Vertrek (waarom mensen weggingen) en Loep Start (hoe nieuwe medewerkers
> landen). Loep zet de meting klaar en levert het rapport; de klant verstuurt
> de uitnodiging zelf en leidt zelf het gesprek met het management, met het
> rapport als leidraad. Rapportage altijd per groep, nooit per persoon, zonder
> voorspellingen of automatisch gegenereerde actieplannen.
```

- [ ] **Step 3: Vervang de tarievenregel en het pricing-blok**

| Nu | Wordt |
|---|---|
| `- [Tarieven](https://www.getloep.nl/producten#tarieven): een heldere prijs per scan` | `- [Tarieven](https://www.getloep.nl/producten#tarieven): vaste prijs naar de grootte van de organisatie` |

Vervang de twee bullets onder `## Pricing` (regels 27-32) door:
```
- Elke scan (Loep Behoud, Loep Vertrek of Loep Start) heeft een vaste prijs
  naar de grootte van de organisatie, excl. btw: tot 150 medewerkers EUR 3.500,
  150 tot 400 medewerkers EUR 4.500, 400 tot 1.000 medewerkers EUR 6.900,
  boven 1.000 medewerkers op aanvraag. Een volledig traject: inrichting, meting
  en rapport met gespreksleidraad en besluitpagina. Geen bespreking door Loep.
  Geen licentie per medewerker.
- Een vervolgmeting kost in dezelfde treden EUR 950, EUR 1.250 en EUR 1.750
  excl. btw: dezelfde meting opnieuw op de bestaande inrichting.
```
De tweede bullet is de tussenvorm tot plan 3c (spec par. 4.5); Task 17 vult hem aan.

- [ ] **Step 4: Trek de contract-test gelijk**

In `frontend/lib/seo-conversion.test.ts`, test `keeps llms.txt aligned with the current pricing and product routes`: vervang
```ts
    // Actuele portfolio (2026-07-04): drie gelijkwaardige scans, één prijs.
    expect(llmsText).toContain('EUR 4.500 excl. btw')
```
door
```ts
    // Site-ronde besluit A (2026-09-20): drie gelijkwaardige scans, één staffel
    // op organisatiegrootte. De bedragen zelf legt
    // lib/site-ronde-besluit-a.guard.test.ts tegen lib/pricing.ts.
    expect(llmsText.replace(/\s+/g, ' ')).toContain('150 tot 400 medewerkers EUR 4.500')
    expect(llmsText).toContain('Geen bespreking door Loep')
```
De overige verwachtingen in die test (de vijf ankers, de twee voorbeeldrapporten, geen "Verisight", geen "Cultuurbeeld", geen `/aanpak`) blijven staan en blijven waar.

- [ ] **Step 5: Draai de tests**

Run: `npx vitest run lib/site-ronde-besluit-a.guard.test.ts lib/seo-conversion.test.ts 2>&1 | tail -20`
Expected: alle `llms`-tests van de guard groen; in `seo-conversion` is `keeps llms.txt aligned...` groen en zijn de drie bekende rode tests rood.

- [ ] **Step 6: Commit**

```bash
git add frontend/public/llms.txt frontend/lib/seo-conversion.test.ts
git commit -m "feat(site): llms.txt na besluit A: staffel, geen bespreking door Loep, klant leidt het gesprek

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12: `/pilot`, weg a

**Files:**
- Modify: `frontend/app/pilot/page.tsx:7-9, 85, 91-92, 106-112, 169, 194, 220, 262, 292`
- Test: `frontend/lib/pilot-besluit-a.test.ts`

Besluit Lars (spec par. 8 punt 3): de pilot volgt het product. Geen bespreking; wel feedback op het rapport én op hoe het MT-gesprek ermee liep. De pagina blijft link-only en `noindex`. De sectie "Wat we samen afspreken" en de slotnoot "We bekijken eerst samen of de pilot past" gaan over de afspraak tussen twee partijen en blijven in de wij-vorm; zie "Bewust niet gedaan".

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/pilot-besluit-a.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function bron() {
  return fs.readFileSync(path.join(process.cwd(), 'app/pilot/page.tsx'), 'utf8').replace(/\s+/g, ' ')
}

describe('/pilot volgt het product (weg a)', () => {
  it('levert een volledige scan met gespreksleidraad, geen bespreking', () => {
    for (const regel of [
      "'Een volledige Loep-scan',",
      "'Meting klaargezet door Loep; jij verstuurt en volgt de respons',",
      "'Managementrapport met prioriteiten',",
      "'Gespreksleidraad en besluitpagina in het rapport',",
      "'Eerste managementvraag en vervolgstap',",
    ]) {
      expect(bron(), regel).toContain(regel)
    }
  })

  it('vraagt feedback op het rapport en op hoe het MT-gesprek ermee liep', () => {
    expect(bron()).toContain("'Gerichte feedback op het proces, het rapport en hoe het gesprek met je MT ermee liep.',")
    expect(bron()).toContain("'Je MT bespreekt het rapport zelf en deelt achteraf hoe dat ging',")
    expect(bron()).toContain("'Eén MT-gesprek dat je zelf leidt, met het rapport als leidraad',")
  })

  it('maakt Loep het onderwerp in de hero en in de slotband', () => {
    expect(bron()).toContain('Loep gebruikt de pilot om het rapport en de klantreis aan te scherpen.')
    expect(bron()).toContain('Daarom stelt Loep tijdelijk 1 tot 2 founding pilots beschikbaar.')
    expect(bron()).toContain('Loep krijgt scherpe feedback, praktijkbewijs en, alleen bij tevredenheid, toestemming voor een referentie.')
  })

  it('blijft link-only en noindex', () => {
    expect(bron()).toContain('robots: { index: false, follow: false }')
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/pilot-besluit-a.test.ts`
Expected: FAIL op de eerste drie tests; de vierde is groen.

- [ ] **Step 3: Vervang de copy**

Elke rij is één letterlijke vervanging in `frontend/app/pilot/page.tsx`.

| Regel | Nu | Wordt | Bron |
|---|---|---|---|
| 8-9 | `// Bedoeld om 1-op-1 met warme contacten te delen, zodat het de €4.500-positionering` / `// niet ondergraaft.` | `// Bedoeld om 1-op-1 met warme contacten te delen, zodat het de prijspositionering` / `// (de staffel in lib/pricing.ts) niet ondergraaft.` | plan |
| 85 | `Founding pilot · 1–2 plekken` | `Founding pilot · 1 tot 2 plekken` | plan |
| 91-92 | `volwaardig Loep-traject; wij gebruiken de pilot om de output, begeleiding en klantreis aan te scherpen.` | `volwaardig Loep-traject; Loep gebruikt de pilot om het rapport en de klantreis aan te scherpen.` | plan |
| 107 | `'Een begeleide Loep-scan',` | `'Een volledige Loep-scan',` | plan |
| 108 | `'Campagne- en responsregie',` | `'Meting klaargezet door Loep; jij verstuurt en volgt de respons',` | plan |
| 110 | `'Begeleide managementbespreking (60–90 min)',` | `'Gespreksleidraad en besluitpagina in het rapport',` | plan |
| 169 | `Vooral concretere ontwikkelafspraken en beter zicht op groeimogelijkheden — input van respondenten, geen uitvoeringsadvies.` | `Vooral concretere ontwikkelafspraken en beter zicht op groeimogelijkheden. Input van respondenten, geen uitvoeringsadvies.` | plan |
| 194 | `'Gerichte feedback op proces, rapport en de managementbespreking.',` | `'Gerichte feedback op het proces, het rapport en hoe het gesprek met je MT ermee liep.',` | plan |
| 220 | `'Management beschikbaar voor de bespreking',` | `'Je MT bespreekt het rapport zelf en deelt achteraf hoe dat ging',` | spec |
| 262 | `'Eén managementbespreking',` | `'Eén MT-gesprek dat je zelf leidt, met het rapport als leidraad',` | plan |
| 292 | `body="Daarom stellen we tijdelijk 1–2 founding pilots beschikbaar. Jij krijgt een volwaardig traject; wij krijgen scherpe feedback, praktijkbewijs en, alleen bij tevredenheid, toestemming voor een referentie."` | `body="Daarom stelt Loep tijdelijk 1 tot 2 founding pilots beschikbaar. Jij krijgt een volwaardig traject; Loep krijgt scherpe feedback, praktijkbewijs en, alleen bij tevredenheid, toestemming voor een referentie."` | plan |

`'Campagne- en responsregie'` (regel 108) staat niet in de inventaris van de spec, maar belooft dat Loep de respons regisseert; sinds de klantsuite doet de klant dat zelf.

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run lib/pilot-besluit-a.test.ts lib/site-ronde-besluit-a.guard.test.ts -t "pilot" 2>&1 | tail -12`
Expected: `pilot-besluit-a` groen (4 tests); de drie guardtests voor `app/pilot/page.tsx` groen (oude belofte, los bedrag, streepjes).

- [ ] **Step 5: Commit**

```bash
git add frontend/app/pilot/page.tsx frontend/lib/pilot-besluit-a.test.ts
git commit -m "feat(site): /pilot volgt het product: geen bespreking, wel feedback op het MT-gesprek

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 13: Loep Cultuurbeeld

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx` (functie `CultureAssessmentPage`; regelnummers van vóór Task 4: 208, 211, 224, 227, 318, 332, 370-375)
- Test: `frontend/lib/cultuurbeeld-besluit-a.test.ts`

Besluit Lars (spec par. 8 punt 4): besluit A geldt ook hier; de "Begeleide directie-read sessie (60–90 min)" vervalt. Loep Cultuurbeeld houdt zijn eigen prijs en valt buiten de staffel, maar het bedrag komt wel uit `lib/pricing.ts`. **Beloof hier geen gespreksleidraad, werkvragen of besluitpagina**: het Cultuurbeeld-rapport is een andere renderer en heeft die niet. De wordt-teksten zeggen alleen dat je het gesprek met je directie zelf voert, met het rapport als basis.

- [ ] **Step 1: Schrijf de falende test**

Create `frontend/lib/cultuurbeeld-besluit-a.test.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function cultuurbeeld() {
  const bron = fs
    .readFileSync(path.join(process.cwd(), 'app/producten/[slug]/page.tsx'), 'utf8')
    .replace(/\s+/g, ' ')
  const start = bron.indexOf('function CultureAssessmentPage()')
  const einde = bron.indexOf('function UpcomingProductPage(')
  expect(start, 'CultureAssessmentPage niet gevonden').toBeGreaterThan(-1)
  expect(einde, 'UpcomingProductPage niet gevonden').toBeGreaterThan(start)
  return bron.slice(start, einde)
}

describe('Loep Cultuurbeeld na besluit A', () => {
  it('maakt Loep het onderwerp en zegt dat je het gesprek met je directie zelf voert', () => {
    expect(cultuurbeeld()).toContain(
      'Loep brengt cultuur en engagement in beeld. Jij weet wat bestuurlijk aandacht vraagt.',
    )
    expect(cultuurbeeld()).toContain('Het gesprek met je directie voer je zelf, met het rapport op tafel.')
    expect(cultuurbeeld()).toContain("'Je bespreekt het rapport zelf met je directie',")
    expect(cultuurbeeld()).toContain("'Het gesprek met je directie voer je zelf, met het board-read rapport als basis',")
  })

  it('belooft geen sessie, geen begeleiding en geen leidraad die dit rapport niet heeft', () => {
    expect(cultuurbeeld()).not.toMatch(/sessie|begeleid|self-serve|\bWij\b/)
    expect(cultuurbeeld()).not.toMatch(/gespreksleidraad|werkvragen|besluitpagina/i)
  })

  it('haalt de vanaf-prijs uit lib/pricing.ts en staat buiten de staffel', () => {
    expect(cultuurbeeld().split('formatEur(CULTUURBEELD_FROM_EUR)').length - 1).toBe(2)
    expect(cultuurbeeld()).not.toContain('PRICING_TIERS')
  })

  it('gebruikt geen en-dash in de vergelijkingstabel', () => {
    expect(cultuurbeeld()).toContain("'6 tot 12 weken'")
    expect(cultuurbeeld()).toContain("'€25.000 tot €100.000 en meer'")
    expect(cultuurbeeld()).toContain("'MKB 50 tot 1000 fte, directie als koper'")
  })
})
```

- [ ] **Step 2: Draai de test en zie hem falen**

Run: `npx vitest run lib/cultuurbeeld-besluit-a.test.ts`
Expected: FAIL op alle vier tests.

- [ ] **Step 3: Vervang de copy**

Voeg bij de imports van `frontend/app/producten/[slug]/page.tsx` toe:
```ts
import { CULTUURBEELD_FROM_EUR, formatEur } from '@/lib/pricing'
```

Alle wordt-teksten in deze taak zijn door de planschrijver geformuleerd (de spec geeft voor Loep Cultuurbeeld alleen het besluit).

| Nu | Wordt |
|---|---|
| `Wij brengen cultuur en engagement in beeld. Jij weet wat bestuurlijk aandacht vraagt.` | `Loep brengt cultuur en engagement in beeld. Jij weet wat bestuurlijk aandacht vraagt.` |
| `Loep voert de jaarlijkse cultuur- en engagementbaseline uit, analyseert de uitkomsten en levert een board-read met eerste aandachtspunten. Geen survey-platform, maar een begeleid traject.` | `Loep zet de jaarlijkse cultuur- en engagementbaseline klaar, analyseert de uitkomsten en levert een board-read met eerste aandachtspunten. Het gesprek met je directie voer je zelf, met het rapport op tafel.` |
| `vanaf €6.500 {'•'} Baseline` | `vanaf {formatEur(CULTUURBEELD_FROM_EUR)} {'•'} Baseline` |
| `'Begeleide directie-read sessie (60–90 min)',` (kaart in de hero) | `'Je bespreekt het rapport zelf met je directie',` |
| `'Begeleide directie-read sessie (60–90 min): samen de eerste managementvraag kiezen',` | `'Het gesprek met je directie voer je zelf, met het board-read rapport als basis',` |
| `Geen benchmarking met externe normen in v1 · Geen named manager detail standaard · Geen individuele voorspellingen · Geen automatische interventie · Geen self-serve platform.` | `Geen benchmarking met externe normen in v1 · Geen named manager detail standaard · Geen individuele voorspellingen · Geen automatische interventie.` |
| `['Doorlooptijd', '5 werkdagen na sluiting', '6–12 weken', 'Onbepaald, je doet het zelf'],` | `['Doorlooptijd', '5 werkdagen na sluiting', '6 tot 12 weken', 'Onbepaald, je doet het zelf'],` |
| `['Begeleiding', 'Inbegrepen, board-read sessie door Loep', 'Consultancydag apart geprijsd', 'Geen, je interpreteert zelf'],` | `['Gesprek met de directie', 'Voer je zelf, met het board-read rapport', 'Consultancydag apart geprijsd', 'Voer je zelf, zonder rapport dat richting geeft'],` |
| ``['Prijs', 'Vanaf €6.500', '€25.000–€100.000+', 'Laag instap, hoge tijdsinvestering'],`` | ``['Prijs', `Vanaf ${formatEur(CULTUURBEELD_FROM_EUR)}`, '€25.000 tot €100.000 en meer', 'Laag instap, hoge tijdsinvestering'],`` |
| `['Geschikt voor', 'MKB 50–1000 fte, directie als koper', 'Enterprise 1000+ fte', 'Teams die zelf willen bouwen'],` | `['Geschikt voor', 'MKB 50 tot 1000 fte, directie als koper', 'Enterprise 1000+ fte', 'Teams die zelf willen bouwen'],` |

De twee "Bekijk tarieven"-links naar `/tarieven` blijven staan (ze komen via de redirect op `/producten#tarieven` uit, waar Loep Cultuurbeeld niet in de staffel staat); zie "Wat Lars moet beslissen".

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run lib/cultuurbeeld-besluit-a.test.ts lib/marketing-portfolio-cleanup.test.ts lib/site-ronde-besluit-a.guard.test.ts -t "Cultuurbeeld|slug|Portfolio" 2>&1 | tail -15`
Expected: `cultuurbeeld-besluit-a` groen (4 tests); `marketing-portfolio-cleanup` groen; de drie guardtests voor `app/producten/[slug]/page.tsx` groen (oude belofte, los bedrag, streepjes).

- [ ] **Step 5: Kijk in de browser**

Run (tweede shell): `cd frontend && npm run dev -- --port 3100`. Open `http://localhost:3100/producten/cultuurbeeld`.
Expected: de hero-kaart toont "vanaf €6.500 • Baseline"; de vergelijkingstabel toont "Vanaf €6.500" en de rij "Gesprek met de directie"; nergens "sessie" of "begeleid". Stop de dev-server daarna.

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/producten/[slug]/page.tsx" frontend/lib/cultuurbeeld-besluit-a.test.ts
git commit -m "feat(site): Loep Cultuurbeeld na besluit A: geen directie-read sessie, prijs uit lib/pricing

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 14: In-app prijslabel van de vervolgmeting uit de staffel

**Files:**
- Modify: `frontend/lib/dashboard/new-measurement-request.ts:1-4`
- Modify: `frontend/lib/dashboard/new-measurement-request.test.ts:32-34`

Op `/dashboard` staat bij "Klaar voor een vervolgmeting?": "Dezelfde meting opnieuw kost €1.250 excl. btw." Met de staffel is dat voor twee van de drie treden onwaar, en het dashboard weet de organisatiegrootte niet. Eerlijke oplossing zonder nieuw veld: het bereik uit de staffel. Het component `request-new-measurement.tsx` blijft ongewijzigd; alleen de constante verandert.

- [ ] **Step 1: Zet de nieuwe verwachting in de test (rood)**

In `frontend/lib/dashboard/new-measurement-request.test.ts`: voeg bij de imports toe
```ts
import { PRICING_TIERS, formatEur } from '@/lib/pricing'
```
en vervang
```ts
  it('noemt de prijs van de vervolgmeting zoals op de site (beslissing 2026-07-09)', () => {
    expect(NEW_MEASUREMENT_PRICE_LABEL).toBe('€1.250 excl. btw')
  })
```
door
```ts
  it('noemt het bereik van de vervolgmeting uit de staffel, want het dashboard kent de organisatiegrootte niet (besluit 2026-09-20)', () => {
    expect(NEW_MEASUREMENT_PRICE_LABEL).toBe('€950 tot €1.750 excl. btw, naar de grootte van je organisatie')
    expect(NEW_MEASUREMENT_PRICE_LABEL).toContain(formatEur(PRICING_TIERS[0].followUpEur))
    expect(NEW_MEASUREMENT_PRICE_LABEL).toContain(formatEur(PRICING_TIERS[PRICING_TIERS.length - 1].followUpEur))
  })
```

Run: `npx vitest run lib/dashboard/new-measurement-request.test.ts`
Expected: FAIL op die ene test (`'€1.250 excl. btw'` is niet het bereik).

- [ ] **Step 2: Leid de constante af**

In `frontend/lib/dashboard/new-measurement-request.ts`: vervang
```ts
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

/** Prijs van de vervolgmeting zoals publiek op /producten (beslissing 2026-07-09). */
export const NEW_MEASUREMENT_PRICE_LABEL = '€1.250 excl. btw'
```
door
```ts
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { PRICING_VAT_NOTE, followUpRangeLabel } from '@/lib/pricing'

/**
 * Prijs van de vervolgmeting zoals publiek op /producten#tarieven (staffel op
 * organisatiegrootte, besluit 2026-09-20). Het dashboard kent de grootte van de
 * organisatie niet, dus het noemt het bereik en geen enkel bedrag.
 */
export const NEW_MEASUREMENT_PRICE_LABEL = `${followUpRangeLabel()} ${PRICING_VAT_NOTE}, naar de grootte van je organisatie`
```

- [ ] **Step 3: Draai de tests**

Run: `npx vitest run lib/dashboard/new-measurement-request.test.ts components/dashboard/request-new-measurement.test.ts 2>&1 | tail -8`
Expected: beide groen. De componenttest pint de zin `Dezelfde meting opnieuw kost {NEW_MEASUREMENT_PRICE_LABEL}.`, die ongewijzigd is; op het scherm staat nu "Dezelfde meting opnieuw kost €950 tot €1.750 excl. btw, naar de grootte van je organisatie."

- [ ] **Step 4: Bewijs dat er in de app geen ander los vervolgmetingsbedrag staat**

Run: `grep -rnE "1\.250|1250" --include=*.ts --include=*.tsx app components lib | grep -v "lib/pricing"`
Expected: geen regels.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/dashboard/new-measurement-request.ts frontend/lib/dashboard/new-measurement-request.test.ts
git commit -m "fix(dashboard): prijs van de vervolgmeting als bereik uit de staffel, niet het oude vaste bedrag

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 15: Loep_Docs in lijn met besluit A en de staffel

**Files (buiten de git-repo, geen versiebeheer):** in `C:\Users\larsh\Desktop\Business\Loep_Docs\`
- Modify: `offerte-template.html`, `factuur-template.html`, `pilotbevestiging.html`, `one-pager.html`, `sales-pitch.html`, `faq.html`, `intake-formulier.html`, `methodische-verantwoording.html`, `harde-getallen.html`
- Ongewijzigd: `copy-ronde-positionering.html` (historie), de `.docx`-bestanden, de twee pdf's (zie de laatste stap) en `factuur-template.zip`

De offerte en de pilotbevestiging zijn contractueel: daar mag na besluit A geen bespreking meer in staan, en de definitie van de vervolgmeting van 9 juli ("inclusief compacte bespreking, 45 tot 60 minuten") vervalt. Dit zijn verkoopdocumenten waarin Lars soms zelf spreekt; deze taak herschrijft alleen de zinnen die de bespreking, de begeleiding of een vast bedrag beloven, en maakt Loep daarin het onderwerp. Alle wordt-teksten zijn door de planschrijver geformuleerd. **Gebruik je bestandstool met de letterlijke nu-tekst (inclusief HTML-entiteiten zoals `&euro;` en `&ndash;`), geen `sed`.** Staat een nu-tekst er niet letterlijk, stop en meld het.

- [ ] **Step 1: Maak een kopie, want er is geen versiebeheer**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Loep_Docs
mkdir -p _archief-2026-09-20
cp offerte-template.html factuur-template.html pilotbevestiging.html one-pager.html sales-pitch.html faq.html intake-formulier.html methodische-verantwoording.html harde-getallen.html _archief-2026-09-20/
ls _archief-2026-09-20 | wc -l
```
Expected: `9`.

- [ ] **Step 2: `offerte-template.html`**

1. Nu: `Verwijder de rijen die niet van toepassing zijn. Elke scan omvat: survey, rapport op groepsniveau en een begeleide managementbespreking.`
   Wordt: `Verwijder de rijen die niet van toepassing zijn. Elke scan omvat: meting en rapport op groepsniveau, met gespreksleidraad en besluitpagina. Prijs naar organisatiegrootte, excl. btw: tot 150 medewerkers &euro; 3.500, 150 tot 400 &euro; 4.500, 400 tot 1.000 &euro; 6.900, daarboven op aanvraag. Vervolgmeting in dezelfde treden: &euro; 950, &euro; 1.250, &euro; 1.750. Vul hieronder de trede van deze klant in.`
2. Nu: `Begrijpen waarom mensen vertrokken. Exitsurvey, rapport, begeleide bespreking.</span></td><td class="num">&euro; 4.500</td>`
   Wordt: `Begrijpen waarom mensen vertrokken. Exitmeting en rapport met gespreksleidraad.</span></td><td class="num"><span class="fill" contenteditable="true">&euro; [trede]</span></td>`
3. Nu: `Zien waar behoud onder druk staat bij de huidige populatie. Survey, rapport, begeleide bespreking.</span></td><td class="num">&euro; 4.500</td>`
   Wordt: `Zien waar behoud onder druk staat bij de huidige populatie. Meting en rapport met gespreksleidraad.</span></td><td class="num"><span class="fill" contenteditable="true">&euro; [trede]</span></td>`
4. Nu: `Checkpoint-beeld van de eerste werkperiode (30-60-90). Survey, rapport, begeleide bespreking.</span></td><td class="num">&euro; 4.500</td>`
   Wordt: `Checkpoint-beeld van de eerste werkperiode (30-60-90). Meting en rapport met gespreksleidraad.</span></td><td class="num"><span class="fill" contenteditable="true">&euro; [trede]</span></td>`
5. Nu: `Dezelfde meting opnieuw op de bestaande inrichting, bijvoorbeeld na 60&ndash;90 dagen. Inclusief compacte bespreking van de vergelijking met de eerste meting: is het signaal bewogen?</span></td><td class="num">&euro; 1.250</td>`
   Wordt: `Dezelfde meting opnieuw op de bestaande inrichting, bijvoorbeeld na 60 tot 90 dagen. Het rapport van de tweede meting leg je naast het eerste: is het signaal bewogen?</span></td><td class="num"><span class="fill" contenteditable="true">&euro; [trede]</span></td>`
6. Nu: `<li><strong>Begeleide managementbespreking</strong> (ca. 1 tot 1,5 uur): duiding van het beeld en de eerste vervolgstap, met HR en/of MT.</li>`
   Wordt: `<li><strong>Gespreksleidraad en besluitpagina</strong>: het rapport bevat een leidraad van 45 minuten waarmee HR zelf het gesprek met het MT leidt, en een pagina om het besluit vast te leggen (wat, wie, wanneer). Loep zit niet aan tafel.</li>`
7. Nu: `<li>Doorlooptijd van intake tot bespreking: doorgaans 4 tot 6 weken, afhankelijk van de veldwerkperiode.</li>`
   Wordt: `<li>Doorlooptijd van intake tot rapport: doorgaans 4 tot 6 weken, afhankelijk van de veldwerkperiode.</li>`

- [ ] **Step 3: `factuur-template.html`**

1. Nu: `Loep Behoud · baseline scan, incl. rapport en begeleide managementbespreking (conform offerte <span>[OFT-2026-XXX]</span>)`
   Wordt: `Loep Behoud · baseline scan, incl. rapport met gespreksleidraad en besluitpagina (conform offerte <span>[OFT-2026-XXX]</span>)`
2. Nu: `<span class="fill" contenteditable="true">4.500,00</span>`
   Wordt: `<span class="fill" contenteditable="true">[3.500,00 / 4.500,00 / 6.900,00]</span>`
3. Nu: `Vervolgmeting: dezelfde meting opnieuw, incl. compacte bespreking van de vergelijking met de eerste meting`
   Wordt: `Vervolgmeting: dezelfde meting opnieuw op de bestaande inrichting`
4. Nu: `<span class="fill" contenteditable="true">1.250,00</span>`
   Wordt: `<span class="fill" contenteditable="true">[950,00 / 1.250,00 / 1.750,00]</span>`
5. De drie totalen eronder zijn voorbeeldsommen van de oude bedragen (5.750,00, 1.207,50 en 6.957,50) en kloppen niet meer zodra de regels een trede-keuze zijn. Vervang ze door invulvelden:
   Nu: `<span class="fill" contenteditable="true">5.750,00</span>` Wordt: `<span class="fill" contenteditable="true">[subtotaal]</span>`
   Nu: `<span class="fill" contenteditable="true">1.207,50</span>` Wordt: `<span class="fill" contenteditable="true">[21% van het subtotaal]</span>`
   Nu: `<span class="fill" contenteditable="true">6.957,50</span>` Wordt: `<span class="fill" contenteditable="true">[subtotaal + btw]</span>`

- [ ] **Step 4: `pilotbevestiging.html`**

1. Nu: `<li>Begeleide managementbespreking van ca. 1 tot 1,5 uur, waarin we het beeld samen duiden.</li>`
   Wordt: `<li>Gespreksleidraad van 45 minuten en een besluitpagina in het rapport; het gesprek met je MT leid je zelf.</li>`
2. Nu: `&middot; bespreking: uiterlijk <span class="fill" contenteditable="true">[datum]</span>.</li>`
   Wordt: `&middot; rapport: uiterlijk <span class="fill" contenteditable="true">[datum]</span>.</li>`
3. Nu: `een <strong>eerlijk feedbackgesprek</strong> van ca. 30 minuten na de bespreking, en,`
   Wordt: `een <strong>eerlijk feedbackgesprek</strong> van ca. 30 minuten nadat je MT het rapport heeft besproken, over het rapport &eacute;n over hoe dat gesprek ermee liep, en,`
4. Nu: `(&euro;&nbsp;1.250, dezelfde meting opnieuw na bijvoorbeeld 60&ndash;90 dagen, met een compacte bespreking van de vergelijking: is het signaal bewogen?) of een <strong>nieuwe scan op een ander thema</strong> (&euro;&nbsp;4.500). Dat bespreken we pas na de managementbespreking, niet eerder.`
   Wordt: `(&euro;&nbsp;950 tot &euro;&nbsp;1.750 naar organisatiegrootte, dezelfde meting opnieuw na bijvoorbeeld 60 tot 90 dagen: is het signaal bewogen?) of een <strong>nieuwe scan op een ander thema</strong> (&euro;&nbsp;3.500 tot &euro;&nbsp;6.900 naar organisatiegrootte). Dat komt pas ter sprake na het feedbackgesprek, niet eerder.`
5. Nu: `Ik doe de begeleiding persoonlijk.`
   Wordt: `Je mailt of belt rechtstreeks met Lars van den Hengel, oprichter van Loep.`

- [ ] **Step 5: `one-pager.html`**

1. Nu: `Loep doet het werk. Jij krijgt een antwoord, en dat staat op pagina twee.`
   Wordt: `Loep zet de meting klaar, jij verstuurt hem. Jij krijgt een antwoord, en dat staat op pagina twee.`
2. Nu: `<div class="big">Een volledige scan: <span class="amber">&euro; 4.500</span></div>`
   Wordt: `<div class="big">Een volledige scan: <span class="amber">&euro; 3.500 tot &euro; 6.900</span></div>`
3. Nu: `<span class="num">&euro; 4.500</span> <span style="color:var(--muted)">excl. btw &middot; per scan</span>`
   Wordt: `<span class="num">&euro; 3.500 / 4.500 / 6.900</span> <span style="color:var(--muted)">excl. btw &middot; tot 150 / 150 tot 400 / 400 tot 1.000 medewerkers</span>`
4. Nu: `<small>Inclusief opzet, rapport en begeleide bespreking. Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons. Vervolgmeting later: &euro; 1.250.</small>`
   Wordt: `<small>Inclusief opzet, meting en rapport met gespreksleidraad en besluitpagina; het gesprek met je MT leid je zelf. Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons. Vervolgmeting later: &euro; 950 / 1.250 / 1.750. Boven 1.000 medewerkers op aanvraag.</small>`
5. Nu: `<span>Geen software om te beheren</span>`
   Wordt: `<span>Geen licentie, geen platform om in te richten</span>`

De regel `Bij ~150 medewerkers zo'n &euro; 30 per persoon.` blijft: 150 &times; &euro; 30 = &euro; 4.500 is de middelste trede.

- [ ] **Step 6: `sales-pitch.html`**

1. Nu: `Loep is een begeleide HR-scan die`
   Wordt: `Loep is een HR-scan die`
2. Nu: `Loep doet de opzet en de analyse en bespreekt de uitkomst persoonlijk met je.`
   Wordt: `Loep zet de meting klaar en doet de analyse; het gesprek met je MT leid je zelf, met het rapport als leidraad.`
3. Nu: `<li>Een begeleide managementbespreking van ongeveer een uur, waarin we het beeld samen duiden en jij weet wat je maandag kunt doen.</li>`
   Wordt: `<li>Een gespreksleidraad van 45 minuten en een besluitpagina in het rapport, zodat je MT in &eacute;&eacute;n gesprek kiest en jij weet wat je maandag kunt doen.</li>`
4. Nu: `<tr><td>Een behoudscan, inclusief begeleide bespreking</td><td>&euro;&nbsp;4.500</td></tr>`
   Wordt: `<tr><td>Een behoudscan bij ~150 medewerkers, rapport met gespreksleidraad</td><td>&euro;&nbsp;4.500</td></tr>`
5. Nu: `<li><strong>Geen software om te beheren.</strong> Loep doet de opzet en de uitleg persoonlijk. Je koopt geen tool, je koopt een antwoord dat je begrijpt.</li>`
   Wordt: `<li><strong>Geen licentie, geen platform om in te richten.</strong> Loep zet de meting klaar; jij verstuurt hem en volgt de respons in je eigen omgeving. Je koopt geen tool, je koopt een antwoord dat je begrijpt.</li>`
6. Nu: `<p><strong>&euro; 4.500 excl. btw</strong> voor een volledige scan, inclusief opzet, rapport en begeleide bespreking. Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons. Een vervolgmeting later (dezelfde meting opnieuw, met een compacte vergelijkingsbespreking) kost <strong>&euro; 1.250</strong>.`
   Wordt: `<p><strong>&euro; 3.500, &euro; 4.500 of &euro; 6.900 excl. btw</strong> voor een volledige scan, naar de grootte van de organisatie (tot 150, 150 tot 400, 400 tot 1.000 medewerkers; daarboven op aanvraag): opzet, meting en rapport met gespreksleidraad en besluitpagina. Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons. Een vervolgmeting later (dezelfde meting opnieuw) kost <strong>&euro; 950, &euro; 1.250 of &euro; 1.750</strong>.`
7. Nu: `Het is een korte, begeleide scan die laat zien`
   Wordt: `Het is een korte scan die laat zien`
8. Nu: `Loep doet het werk en bespreekt de uitkomst samen met je MT.`
   Wordt: `Loep zet alles klaar en levert het rapport; het gesprek met je MT leid je zelf, met het rapport als leidraad.`
9. Nu: `eindigt in &eacute;&eacute;n vraag, begeleide bespreking)`
   Wordt: `eindigt in &eacute;&eacute;n vraag, rapport met gespreksleidraad)`

- [ ] **Step 7: `faq.html`**

1. Nu: `Loep is begeleid: Loep doet de opzet, de vragenlijst en de analyse, en bespreekt de uitkomst persoonlijk met je. Je koopt geen software die je zelf moet bedienen, je koopt een uitkomst die je begrijpt.`
   Wordt: `Loep doet de opzet, de vragenlijst en de analyse, en het rapport zegt waar je begint. Jij verstuurt de uitnodiging en leidt het gesprek met je MT, met het rapport als leidraad. Je koopt geen licentie, je koopt een uitkomst die je begrijpt.`
2. Nu: `<div class="q">Waarom &euro; 4.500? Dat is niet niks.</div>`
   Wordt: `<div class="q">Waarom &euro; 3.500 tot &euro; 6.900? Dat is niet niks.</div>`
3. Nu: `Je krijgt een begeleid traject: opzet, gevalideerde meting, analyse en een persoonlijke bespreking.`
   Wordt: `Je krijgt een volledig traject: opzet, gevalideerde meting, analyse en een rapport met gespreksleidraad en besluitpagina. De prijs loopt mee met de grootte van je organisatie: tot 150 medewerkers &euro; 3.500, 150 tot 400 &euro; 4.500, 400 tot 1.000 &euro; 6.900.`
4. Nu: `<strong>&euro; 1.250.</strong> Dat is dezelfde meting opnieuw op de bestaande inrichting, met een compacte bespreking (45 tot 60 minuten) waarin we de vergelijking met de eerste meting doornemen: is het signaal bewogen?`
   Wordt: `<strong>&euro; 950, &euro; 1.250 of &euro; 1.750</strong>, in dezelfde treden als de eerste scan. Dat is dezelfde meting opnieuw op de bestaande inrichting; het rapport van je tweede meting leg je naast het eerste: is het signaal bewogen?`

De zin "Als dat bij je past, bespreken we dat graag." (over de founding pilot) blijft: dat is het kennismakingsgesprek, geen bespreking van een rapport.

- [ ] **Step 8: `intake-formulier.html`**

1. Nu: `Hun antwoord in hun eigen woorden. Dit stuurt de duiding in het rapport en de bespreking.`
   Wordt: `Hun antwoord in hun eigen woorden. Dit is de vraag waar het rapport straks een antwoord op moet geven; leg hem ernaast als het rapport er is.`
2. Nu: `<div class="q">Wie ziet straks het rapport en wie zit bij de managementbespreking?</div>`
   Wordt: `<div class="q">Wie ziet straks het rapport, wie leidt het gesprek met het MT en wie zit erbij?</div>`
3. Nu: `<tr><td>Managementbespreking (1-1,5 uur)</td>`
   Wordt: `<tr><td>MT-gesprek door de klant zelf (45 min, met de leidraad uit het rapport)</td>`
4. Nu: `Prik de bespreekdatum nú, in dit gesprek. Een pilot zonder geplande bespreking zakt weg in agenda's.`
   Wordt: `Laat de klant de datum van het MT-gesprek nú prikken, in dit gesprek. Een rapport zonder gepland gesprek zakt weg in agenda's.`
5. Nu: `feedbackgesprek (30 min) na de bespreking;`
   Wordt: `feedbackgesprek (30 min) nadat het MT het rapport heeft besproken;`

- [ ] **Step 9: `methodische-verantwoording.html`**

1. Nu: `die keuzes maken HR en management in de bespreking.`
   Wordt: `die keuzes maken HR en management zelf, in hun eigen gesprek, met het rapport als leidraad.`

- [ ] **Step 10: `harde-getallen.html`**

1. Nu: `<td>Volledige scan (opzet + rapport + begeleide bespreking)<span class="why">`
   Wordt: `<td>Volledige scan (opzet + meting + rapport met gespreksleidraad)<span class="why">`
2. Nu: `<td>&euro; 4.500 excl. btw</td>`
   Wordt: `<td>&euro; 3.500 / 4.500 / 6.900 excl. btw<br>tot 150 / 150 tot 400 / 400 tot 1.000 medewerkers; daarboven op aanvraag</td>`
3. Nu: `Dezelfde meting opnieuw op de bestaande inrichting, incl. compacte vergelijkingsbespreking van 45 tot 60 minuten. Loep wordt goedkoper`
   Wordt: `Dezelfde meting opnieuw op de bestaande inrichting, in dezelfde treden. Loep wordt goedkoper`
4. Nu: `<td>&euro; 1.250</td>`
   Wordt: `<td>&euro; 950 / 1.250 / 1.750</td>`
5. Nu: `<span class="why">Inclusief de begeleide bespreking.</span>`
   Wordt: `<span class="why">Middelste trede: 150 &times; &euro; 30 = &euro; 4.500.</span>`
6. Nu: `<td>Totale doorlooptijd, intake tot bespreking</td>`
   Wordt: `<td>Totale doorlooptijd, intake tot rapport</td>`
7. Nu: `<td>Begeleide managementbespreking</td>` met in de cel eronder `<td>1 tot 1,5 uur</td>`
   Wordt: `<td>MT-gesprek door de klant zelf, met de leidraad uit het rapport</td>` met in de cel eronder `<td>45 minuten</td>`

- [ ] **Step 11: Verifieer met een grep**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Loep_Docs
grep -nEi "begeleid|managementbespreking|compacte (vergelijkings)?bespreking|geen software|doet het werk|bespreekt de uitkomst" offerte-template.html factuur-template.html pilotbevestiging.html one-pager.html sales-pitch.html faq.html intake-formulier.html methodische-verantwoording.html harde-getallen.html
grep -nE "&euro;(&nbsp;| )?(4\.500|1\.250)" offerte-template.html factuur-template.html pilotbevestiging.html one-pager.html sales-pitch.html faq.html harde-getallen.html
```
Expected eerste commando: geen regels. Expected tweede commando: alleen regels waarin `4.500` of `1.250` naast de andere twee treden staat, plus de rekensom in `sales-pitch.html` ("Een behoudscan bij ~150 medewerkers ... &euro;&nbsp;4.500"). Een los `&euro; 4.500` of `&euro; 1.250` zonder de andere treden is een gemiste plek: noteer hem in het verslag en los hem op.

- [ ] **Step 12: Leg vast wat Lars zelf moet doen**

Deze taak heeft geen commit (de map staat buiten de repo). Noteer in het uitvoeringsverslag: (1) de twee pdf's `Loep onepager.pdf` en `Loep methodische verantwoording.pdf` zijn exports van 16 juli en dragen de oude tekst; Lars exporteert ze opnieuw uit de bijgewerkte HTML. (2) Het archief staat in `Loep_Docs\_archief-2026-09-20\`. (3) De `.docx`-gespreksstructuren voor het pilotgesprek zijn niet aangeraakt.

---

### Task 16: Eindverificatie en uitvoeringsverslag. Daarna STOP: poort 3b

**Files:**
- Create: `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md`

- [ ] **Step 1: De guard is volledig groen**

Run: `cd frontend && npx vitest run lib/site-ronde-besluit-a.guard.test.ts 2>&1 | tail -8`
Expected: alle tests groen, 0 rood. Is er één rood, dan is de ronde niet af: ga terug naar de taak van dat bestand. Voeg nooit een bestand toe aan een uitzonderingslijst om deze stap te halen.

- [ ] **Step 2: Frontend-faalset vergelijken, niet alleen tellen**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/site-ronde-a/frontend
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
npx vitest run --reporter=json --outputFile=$T/vitest-na.json >/dev/null 2>&1
node $T/failset.cjs $T/vitest-na.json > $T/fails-na.txt
wc -l < $T/fails-na.txt
diff $T/fails-baseline.txt $T/fails-na.txt
```
Expected: `47` (of `48` als de wisselvallige `beheer/health`-test deze keer niet laadt; stond hij in de baseline en nu niet, of andersom, draai opnieuw). De diff toont **precies deze twaalf `<`-regels en geen enkele `>`-regel**:

| `<`-regel | Reden |
|---|---|
| `app/producten/[slug]/page.test.ts > ...` (vijf tests) | Testbestand verwijderd met de dode detailpagina's (Task 4) |
| `lib/exit-product-copy.test.ts > ExitScanPage copy ...` | idem (Task 4) |
| `lib/retention-product-copy.test.ts > RetentionScanPage copy ...` | idem (Task 4) |
| `lib/aanpak-content.test.ts > aanpak content roles copy ...` | Testbestand verwijderd met de dode `/aanpak` (Task 3) |
| `lib/tarieven-content.test.ts > tarieven content pricing copy ...` | Testbestand verwijderd met de dode `/tarieven` (Task 3) |
| `lib/marketing-flow.test.ts > ... keeps the approach flow explicit about assisted onboarding and first use` | Test verwijderd met `included` en `approachSteps` (Task 5) |
| `lib/marketing-flow.test.ts > ... keeps the homepage focused on the three buyer-facing primary routes` | Test verwijderd met `homepageProductRoutes` (Task 5) |
| `lib/seo-conversion.test.ts > ... keeps the homepage and support-page metadata aligned with current SEO positioning` | Groen geworden: dode imports weg (Task 3), titel uit `lib/site-meta.ts` (Task 6) |

Elke `>`-regel is een regressie: zoek de taak die hem veroorzaakte en los hem daar op. Ontbreekt een verwachte `<`-regel, dan is een stap niet uitgevoerd.

- [ ] **Step 3: tsc-foutset vergelijken**

Run:
```bash
T=/c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a
bash $T/tscset.sh $T/tsc-na.txt
diff $T/tsc-baseline.txt $T/tsc-na.txt
```
Expected: `131`. De diff toont precies twee `<`-regels, beide `lib/marketing-flow.test.ts` (TS2367 en TS2339 op de verwijderde `approachSteps`-vergelijking), en geen `>`-regel.

- [ ] **Step 4: Productiebuild**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/site-ronde-a/frontend
RESEND_API_KEY=re_dummy_build_only npm run build > /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/build.log 2>&1; echo "exit=$?"
tail -5 /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/build.log
grep -E "/aanpak|/tarieven|/pilot|/producten" /c/Users/larsh/AppData/Local/Temp/loep-site-ronde-a/build.log
```
Expected: `exit=0`. In de routetabel staan `/pilot`, `/producten` en `/producten/[slug]`; `/aanpak` en `/tarieven` staan er **niet** meer als route (ze bestaan alleen nog als redirect). De sleutel staat alleen in de shell van dit ene commando, nooit in een bestand.

- [ ] **Step 5: Laatste grep op de verboden zinnen**

Run (vanuit `frontend/`):
```bash
grep -rnEi "begeleid|managementbespreking|(bespreking|gesprek) (standaard )?inbegrepen|zelfbedien|geduid door hr|loep doet (de|het) (meting|werk|opzet)|loep voert (uit|de )|beheert? geen (software|tool)|geen software om te beheren|toolbeheer|niets zelf in te richten|read sessie|duid elke scan|directiegesprek" \
  components/marketing app/layout.tsx app/page.tsx app/opengraph-image.tsx app/producten app/kennismaking app/vertrouwen app/pilot lib/site-meta.ts lib/pricing.ts public/llms.txt \
  | grep -v "\.test\."
```
Expected: geen regels.

- [ ] **Step 6: Browsercheck op de lokale dev-server, desktop en 375 px**

Run (tweede shell, laat draaien): `cd frontend && npm run dev -- --port 3100`

Loop elke pagina langs op desktopbreedte en op 375 px. Voer op 375 px per pagina in de console `document.documentElement.scrollWidth` uit; de verwachting is telkens `375`.

| Pagina | Wat je moet zien |
|---|---|
| `http://localhost:3100/` | Eyebrow in de hero en in de donkere band: "Meting en rapport · Het gesprek voer je zelf". Geen foto van Lars; de trustsectie heeft links alleen de kop, rechts de vier punten met "Gespreksleidraad en besluitpagina in elk rapport", het Methode-blok met de werkvragenzin en de knop naar het voorbeeldrapport. De donkere band eindigt op "én de leidraad voor je MT-gesprek." |
| `http://localhost:3100/producten` | Hero met "Loep zet de meting klaar, jij verstuurt hem"; per scan "€3.500 tot €6.900" met de link "Bekijk de staffel"; "Eén vaste route, ongeacht de scan." met de zes stappen |
| `http://localhost:3100/producten#tarieven` | Drie treden met elk twee bedragen, de Loep Vertrek-noot onder de eerste trede, "Boven 1.000 medewerkers · Op aanvraag", "Alle bedragen excl. btw.", de uitleg van eerste scan en vervolgmeting zonder bespreking |
| `http://localhost:3100/pilot` | Kaart met "Een volledige Loep-scan" en "Gespreksleidraad en besluitpagina in het rapport"; nergens "bespreking" of "begeleid"; "1 tot 2 plekken" |
| `http://localhost:3100/kennismaking` | Ongewijzigd, **met** de ronde foto van Lars |
| `http://localhost:3100/vertrouwen` | In de trustregels "Loep zet de meting klaar, jij verstuurt en leidt het gesprek" (past hij op één of twee regels zonder de kolom te breken?); kaart "Wat koop je precies?" met de nieuwe tekst |
| `http://localhost:3100/producten/cultuurbeeld` | "vanaf €6.500 • Baseline", rij "Gesprek met de directie", geen "sessie" |
| `http://localhost:3100/opengraph-image` | De kop "Zie waar behoud onder druk staat, voordat mensen gaan." past volledig in beeld, niets loopt onder de rand of over de rechterkolom; geen "Loep Cultuurbeeld" |

Console: schoon op elke pagina, op de bekende Vercel Analytics-CSP-melding na.

- [ ] **Step 7: Titel, beschrijving, og-tags, JSON-LD en redirects uit de bron**

Run (dev-server draait nog):
```bash
curl -s http://localhost:3100/ | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3100/ | grep -oE '<meta (name="description"|property="og:title"|property="og:description"|name="twitter:title") content="[^"]*"' 
curl -s http://localhost:3100/ | grep -o 'Wat kost een scan van Loep?' | head -1
curl -s http://localhost:3100/producten | grep -o '"price":"[0-9]*"' | sort -u
curl -sI http://localhost:3100/aanpak | grep -iE "^HTTP|^location"
curl -sI http://localhost:3100/tarieven | grep -iE "^HTTP|^location"
curl -sI http://localhost:3100/producten/exitscan | grep -iE "^HTTP|^location"
```
Expected, in volgorde:
1. `<title>Loep | Zie waar behoud onder druk staat, voordat mensen gaan</title>`
2. Vier regels; `og:title` en `twitter:title` dragen dezelfde titel, `description` en `og:description` beginnen met "Eén vertrokken medewerker vervangen kost al snel tienduizenden euro" (de apostrof staat in de HTML als `&#x27;`).
3. `Wat kost een scan van Loep?` (de prijsvraag staat in de FAQ-JSON-LD van de homepage).
4. Precies zes regels: `"price":"1250"`, `"price":"1750"`, `"price":"3500"`, `"price":"4500"`, `"price":"6900"`, `"price":"950"`. Dat zijn de zes bedragen van `PRICING_TIERS`; een zevende of een ontbrekende is een fout.
5. t/m 7. Telkens `HTTP/1.1 308 Permanent Redirect` met `location: /producten`, `location: /producten#tarieven` en `location: /producten#loep-vertrek`.

Stop de dev-server daarna.

- [ ] **Step 8: Schrijf het uitvoeringsverslag**

Create `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md`, in dezelfde vorm als `docs/superpowers/plans/2026-09-18-klantsuite-2b-uitvoering.md`. **Bovenaan, letterlijk:**

```markdown
> **POORT 3b.** Deze branch is gebouwd maar niet gemerged en niet gepusht. De site belooft na deze ronde de gespreksleidraad, de werkvragen en de besluitpagina. De hoofdsessie merget `feature/site-ronde-a` pas nadat (1) plan 3b (`docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md`) is gemerged én live staat op Railway, en (2) een koude leesronde gat B3 dicht verklaart. Task 17 (de definitieve vervolgmetingszin) wacht op plan 3c.
```

Daaronder, met deze koppen:
1. **Wat er nu staat** (per pagina, in gewone taal: wat de bezoeker leest dat er eerst niet stond).
2. **Baselines** (tabel voor/na: tsc 133 naar 131, vitest falend 59 naar 47, geslaagd voor/na, build exit 0), met de letterlijke faalset-diff en de tsc-diff uit Step 2 en 3.
3. **Commits per taak** (`git log --oneline main..HEAD`).
4. **Verwijderde code en verwijderde tests**, elk met de grep die bewees dat het weg mocht. Noem `product-detail-hero-prices.test.ts` apart: die was groen en verdwijnt zonder spoor in de faalset.
5. **Afwijkingen van het plan** (elke plek waar een nu-tekst niet letterlijk klopte, een regelnummer verschoven was, of een stap anders liep).
6. **Wat de reviews vonden** (per taak: spec-review en codekwaliteitsreview, bevinding en oplossing).
7. **Browsercheck** (de tabel uit Step 6 met per pagina "gezien" en de gemeten `scrollWidth`; de uitvoer van Step 7).
8. **Loep_Docs** (de drie punten uit Task 15 Step 12, en elke gemiste plek uit de grep van Step 11).
9. **Bewust niet gedaan** (neem de sectie onderaan dit plan over en vul aan).
10. **Wat Lars moet beslissen** (neem de sectie onderaan dit plan over en vul aan met wat de uitvoering opleverde).

- [ ] **Step 9: Commit het verslag**

```bash
git add docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md
git commit -m "docs(site): uitvoeringsverslag site-ronde besluit A

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
git log --oneline main..HEAD | wc -l
```
Expected: schone werkboom; ongeveer zestien commits.

- [ ] **Step 10: STOP. Poort 3b.**

Niet mergen. Niet pushen. Meld aan de hoofdsessie: de branch `feature/site-ronde-a` staat klaar in `.worktrees/site-ronde-a`, het verslag staat in `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md`, en de merge wacht op plan 3b plus een koude leesronde. Tot die tijd staat op de live site de oude belofte; dat is afgesproken (spec par. 3): de site belooft niets wat het rapport nog niet waarmaakt, en dat geldt ook de andere kant op, de nieuwe belofte gaat pas live als het rapport hem draagt.

---

### Task 17: De definitieve vervolgmetingszin. **NIET UITVOEREN VÓÓR PLAN 3c IS GEMERGED EN LIVE STAAT**

**Files:**
- Modify: `frontend/components/marketing/producten-content.tsx` (constante `FOLLOW_UP_COPY`)
- Modify: `frontend/lib/producten-pricing.test.ts`
- Modify: `frontend/public/llms.txt` (tweede bullet onder `## Pricing`)
- Buiten de repo: `C:\Users\larsh\Desktop\Business\Loep_Docs\offerte-template.html`, `faq.html`, `pilotbevestiging.html`

Spec par. 3 (poort 3c) en par. 4.3 en 4.5: de zin dat het rapport zelf laat zien wat er sinds de eerste meting is veranderd, mag pas live als plan 3c dat in het rapport heeft gebouwd. Tot dan staat overal de tussenvorm ("het rapport van je tweede meting leg je naast het eerste"). Deze taak is klein gehouden zodat hij in één commit kan, op `main` of op een eigen kleine branch, door wie 3c afrondt.

- [ ] **Step 1: Controleer de poort**

Run:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git log --oneline main | grep -iE "3c|vervolgmeting|vergelijk" | head -5
curl -s https://web-production-bf382.up.railway.app/api/health
```
Expected: een merge-commit van plan 3c op `main`, en een `/api/health` waarvan de git-sha die commit of een latere is. Is een van beide niet zo, **stop hier**: de zin is dan een overclaim. Controleer daarnaast in een vers gegenereerd rapport van een tweede meting dat de vergelijking met meting 1 er echt in staat; noteer de paginatitel van dat blok in de commitmessage.

- [ ] **Step 2: Zet de nieuwe verwachting in de test (rood)**

In `frontend/lib/producten-pricing.test.ts`, test `beschrijft de eerste scan en de vervolgmeting zonder bespreking`: vervang
```ts
    // Tussenvorm tot plan 3c (spec par. 4.3).
    expect(bron(CONTENT)).toContain('het rapport van je tweede meting leg je naast het eerste.')
```
door
```ts
    // Definitieve vorm sinds plan 3c: het rapport vergelijkt de twee metingen zelf.
    expect(bron(CONTENT)).toContain('het rapport laat zien wat er sinds je eerste meting is veranderd.')
    expect(bron(CONTENT)).not.toContain('leg je naast het eerste')
```

Run: `cd frontend && npx vitest run lib/producten-pricing.test.ts`
Expected: FAIL op die ene test.

- [ ] **Step 3: Vervang de zin op de site**

In `frontend/components/marketing/producten-content.tsx`: vervang het commentaar boven `FOLLOW_UP_COPY` en de constante door:
```tsx
// Definitieve vorm sinds plan 3c: het rapport van de tweede meting vergelijkt
// zelf met de eerste (spec 2026-09-20 par. 4.3). public/llms.txt zegt hetzelfde.
const FOLLOW_UP_COPY =
  'Dezelfde meting opnieuw, wanneer je wilt zien of het signaal beweegt. De inrichting staat er al; het rapport laat zien wat er sinds je eerste meting is veranderd.'
```

In `frontend/public/llms.txt`: vervang
```
- Een vervolgmeting kost in dezelfde treden EUR 950, EUR 1.250 en EUR 1.750
  excl. btw: dezelfde meting opnieuw op de bestaande inrichting.
```
door
```
- Een vervolgmeting kost in dezelfde treden EUR 950, EUR 1.250 en EUR 1.750
  excl. btw: dezelfde meting opnieuw op de bestaande inrichting. Het rapport
  laat zien wat er sinds de eerste meting is veranderd.
```

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run lib/producten-pricing.test.ts lib/site-ronde-besluit-a.guard.test.ts lib/seo-conversion.test.ts 2>&1 | tail -12`
Expected: `producten-pricing` en de guard groen; `seo-conversion` met dezelfde drie rode tests als na Task 16.

- [ ] **Step 5: Loep_Docs**

In `C:\Users\larsh\Desktop\Business\Loep_Docs\` (maak eerst een kopie van de drie bestanden in `_archief-<datum van vandaag>\`):

1. `offerte-template.html`. Nu: `Het rapport van de tweede meting leg je naast het eerste: is het signaal bewogen?` Wordt: `Het rapport laat zien wat er sinds de eerste meting is veranderd: is het signaal bewogen?`
2. `faq.html`. Nu: `het rapport van je tweede meting leg je naast het eerste: is het signaal bewogen?` Wordt: `het rapport laat zien wat er sinds je eerste meting is veranderd: is het signaal bewogen?`
3. `pilotbevestiging.html`. Nu: `dezelfde meting opnieuw na bijvoorbeeld 60 tot 90 dagen: is het signaal bewogen?)` Wordt: `dezelfde meting opnieuw na bijvoorbeeld 60 tot 90 dagen; het rapport laat zien wat er sinds de eerste meting is veranderd)`

- [ ] **Step 6: Commit**

```bash
git add frontend/components/marketing/producten-content.tsx frontend/lib/producten-pricing.test.ts frontend/public/llms.txt
git commit -m "feat(site): vervolgmeting: het rapport laat zien wat er sinds de eerste meting is veranderd (na plan 3c)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
Niet pushen; de hoofdsessie beslist wanneer dit live gaat.

---

## Bewust niet gedaan

1. **Juridische pagina's** (`app/privacy`, `app/voorwaarden`, `app/dpa`). Ze beloven geen bespreking, maar noemen de dienst wel "begeleid" (zie "Wat Lars moet beslissen" punt 1). Ze blijven formeel "u" en vallen buiten de ronde.
2. **Wij-zinnen buiten de geraakte passages.** De kennismaking-CTA op de homepage ("We bekijken samen welk vraagstuk nu speelt"), de metadata van `/kennismaking`, de slot-CTA's van `/producten` en `/vertrouwen`, de sectie "Wat we samen afspreken" en de slotnoot op `/pilot`, en de FAQ "Voor v1 positioneren we Loep Behoud als ...". Het kennismakingsgesprek is echt een gesprek met Lars; een site-brede wij-sweep is een eigen ronde.
3. **Dode exports zonder treffer voor besluit A** in `site-content.ts`: `approachRoutes`, `processHighlights`, `comparisonCards`, `trustQuickLinks`, `marketingFooterLinks`, `marketingPagePurposes`, `homepageUtilityLinks` (wijst nog naar `/aanpak`, een groene test pint dat), `pricingFaqs`, `pricingLifecycleLadder`, `homepageProofSignals`, `publicProofCards`, `statCards`, `productOverviewComparisonRows`. Ze renderen niet en beloven geen bespreking; opruimen raakt vier testbestanden en hoort in een eigen cleanup.
4. **De doorverwezen `/oplossingen/[slug]`-pagina's** en alles wat alleen zij gebruiken (`lib/seo-solution-pages.ts` met "een begeleide productroute", `lib/report-preview-copy.ts` met "Begeleide output", `PreviewSlider`, `PreviewEvidenceRail`, `SampleShowcaseCard`). Zelfde patroon als de detailpagina's, maar niet in de spec genoemd en met een eigen testgroep.
5. **Ongebruikte imports die op main al ongebruikt waren** in `app/producten/[slug]/page.tsx` (`MarketingProofStrip`, `PreviewEvidenceRail`, `PreviewSlider`, `SampleShowcaseCard`, `exitSampleAsset`, `retentionSampleAsset`) en de "Verisight"-fallbacks in `generateMetadata` en `getProductStructuredData` (elke live slug heeft een `seoTitle`, dus ze renderen niet).
6. **`lib/marketing-products.ts`**: `serviceOutput` van Loep Vertrek noemt een "eerste managementsessie". Dat veld komt alleen in de JSON-LD van `/producten/exitscan`, en die route verwijst door. Niet aangeraakt.
7. **De link "Bekijk tarieven" op Loep Cultuurbeeld** (twee keer, naar `/tarieven`).
8. **De opmaak van de OG-afbeelding.** Alleen de tekst is herschreven; het palet is nog het oude blauw van vóór de rebrand.
9. **`tests/e2e/marketing-layout.spec.ts`** bezoekt `/tarieven`; dat werkt via de redirect en Playwright hoort niet bij de gate.
10. **De in-app copy** buiten het ene prijslabel. `/help` en de dashboards zijn in de klantsuite al op zelfbediening gezet.

---

## Wat Lars moet beslissen

1. **De voorwaarden noemen de dienst "begeleid".** `app/voorwaarden/page.tsx` r.30 ("bijbehorende begeleiding"), r.55 ("Loep levert begeleide productvormen") en r.66 ("De standaarddienst is organisatiegebonden en begeleid van opzet"); `app/privacy/page.tsx` r.29 en `app/dpa/page.tsx` r.48 ("dienst voor begeleide HR-signalering"). Geen van deze belooft een bespreking, maar r.66 van de voorwaarden is een contractuele omschrijving die na besluit A niet meer klopt met wat de site verkoopt. Advies: één juridische mini-ronde, los van deze branch, met als wordt-richting "organisatiegebonden, door Loep klaargezet".
2. **De Bosman-pilot.** De verstuurde pilotbevestiging belooft een begeleide managementbespreking van 1 tot 1,5 uur. Task 15 past alleen het sjabloon aan. Krijgt Bosman de bespreking nog (afspraak is afspraak), of stuur je een bijgewerkte bevestiging volgens weg a? Dit stond al open sinds 19-9.
3. **Het in-app prijslabel is nu een bereik** ("€950 tot €1.750 excl. btw, naar de grootte van je organisatie"), omdat het dashboard de organisatiegrootte niet kent. Wil je het exacte bedrag per klant tonen, dan is er een veld op de organisatie nodig (trede, door jou gezet bij de intake); dat is een kleine vervolgtaak met een migratie.
4. **Loep Cultuurbeeld.** (a) De pagina zegt "MKB 50 tot 1000 fte", terwijl de rest van de site sinds 4 juli "100 tot 1.000 medewerkers" zegt; alleen het streepje is vervangen. (b) "Bekijk tarieven" leidt naar een staffel waar Cultuurbeeld niet in staat: link weghalen, of een regel "Loep Cultuurbeeld: vanaf €6.500, buiten de staffel" onder de staffel? (c) De wordt-teksten beloven bewust geen gespreksleidraad, omdat het Cultuurbeeld-rapport die niet heeft.
5. **De FAQ "Wanneer kies je voor de combinatie?"** staat nog in de FAQ-JSON-LD van de homepage, terwijl de combinatieroute in juni uit het portfolio is gehaald. Eén regel weghalen; niet gedaan omdat het geen besluit-A-treffer is.
6. **De OG-afbeelding** heeft na deze ronde de goede tekst in de oude blauwe Verisight-opmaak. Een herontwerp in navy en amber is een uur werk en maakt elke gedeelde link beter; aparte taak.
7. **De doorlooptijd in de offerte** is van "intake tot bespreking: 4 tot 6 weken" naar "intake tot rapport: 4 tot 6 weken" gegaan, met hetzelfde getal als veilige bovengrens. Als het rapport er in de praktijk eerder is, kan daar "3 tot 5 weken" staan; dat getal is van jou.
8. **De homepage-werkvragenzin wijkt af van de letterlijke spectekst**: er staat "met de werkvragen in het rapport van Loep Behoud en Loep Vertrek", omdat Loep Start geen werkvragen krijgt (plan 3b). Zonder die toevoeging zou de homepage iets beloven dat het Start-rapport niet heeft.
9. **De twee pdf's in Loep_Docs** (`Loep onepager.pdf`, `Loep methodische verantwoording.pdf`) moet je zelf opnieuw exporteren uit de bijgewerkte HTML.

---

## Zelfreview

### 1. Dekking van de spec

| Spec | Eis | Taak |
|---|---|---|
| par. 1 punt 1 | De bespreking weg op elke prijsplek, in de leveringslijst, de FAQ, `llms.txt` en de JSON-LD | 5, 7, 8, 9, 10, 11, 12, 13 |
| par. 1 punt 2 | "Geen zelfbedieningstool", "Loep doet de meting", "beheert geen software", "niets zelf in te richten" weg | 6 (`layout.tsx` r.33), 7, 8, 10, 11; bewaakt door Task 2 |
| par. 1 punt 3, par. 8 punt 2 | Onware methodeclaim: al weg in `967ede3a`; alleen de werkvragenzin erbij | 7 Step 5 |
| par. 2, par. 8 punt 1 | Eyebrow, paginatitel, beschrijving met geldanker, geen uitkomstbelofte | 6, 7; test `site-meta.test.ts` |
| par. 2 laatste alinea | Wat Loep doet en wat de klant doet | Copyregel 5; 7, 8, 10, 11 |
| par. 3 | Poort 3b (merge pas na 3b en koude leesronde), poort 3c (tussenvorm) | Kop van het plan, Task 16 Step 8 en 10, Task 17 |
| par. 4.1 | Metadata `layout.tsx`, `page.tsx`, JSON-LD home | 6 (par. 8 punt 1 vervangt de drie beschrijvingsvarianten door één) |
| par. 4.2 | Homepage, acht rijen | 7 (alle acht, plus zes die de spec niet citeerde) |
| par. 4.3 | `/producten`, twaalf rijen, plus de leads van Behoud en Start | 8, 9 |
| par. 4.4 | `trustHubAnswerCards`, `included`, `pricingCards` | 10 (`trustHubAnswerCards`); `included` en `pricingCards` bleken dood en gaan weg in 5, zie "Bevindingen" punt 2 |
| par. 4.5 | `llms.txt`, drie passages | 11; de na-3c-zin in 17 |
| par. 4.6, par. 8 punt 3 | `/pilot` weg a | 12 |
| par. 5 | Dode code: `/aanpak`, `/tarieven`, de drie detailpagina's, zes exports, `approachSteps` | 3, 4, 5. `faqs` blijft (rendert via `faqSchema`); drie exports extra verwijderd (`included`, `pricingCards`, alias) |
| par. 5, par. 8 punt 4 | Cultuurbeeld verliest de directie-read sessie, houdt €6.500 | 13 |
| par. 6 | Loep_Docs, negen documenten; het reviewdocument blijft | 15 (en 17 voor de na-3c-zin) |
| par. 7 | Contract-tests in lockstep; nieuwe guard; baselines met faalset per naam | 0, 2, 3, 4, 5, 6, 11, 16 |
| par. 8 punt 5 | Staffel, één bron, geen losse bedragen, €30-zin blijft zonder "inclusief de bespreking", "geen licenties" blijft, JSON-LD, `llms.txt`, FAQ, Loep_Docs, Vertrek-regel bij de onderste trede, boven 1.000 op aanvraag | 1, 2, 9, 10, 11, 13, 14, 15 |

Geen eis zonder taak. Drie dingen zijn toegevoegd die de spec niet noemt: de `OfferCatalog` op `/producten` (anders is er geen prijs in de structured data om te controleren), het in-app prijslabel (Task 14; door de staffel onwaar geworden) en de tekst van de OG-afbeelding (de link-preview hoort dezelfde kop te dragen als de titel).

### 2. Door de planschrijver geformuleerd, review Lars

De spec geeft voor deze plekken geen wordt-tekst. Alle zijn in dezelfde stem geschreven (Loep als onderwerp, geen streepjes, geen belofte die het product niet waarmaakt) en staan letterlijk in de taak.

| Plek | Tekst | Taak |
|---|---|---|
| Homepage, donkere band | "Een tool geeft je grafieken. Loep geeft je de conclusie én de leidraad voor je MT-gesprek." | 7 |
| Homepage, scankaarten Behoud en Vertrek | "... Het rapport leidt je MT-gesprek." | 7 |
| Homepage, stap 1 | "... Loep ziet hun adressen nooit. De respons volg je in je eigen omgeving." | 7 |
| Homepage, stap 3 | "Kiezen met je MT: wat, wie, wanneer" en "Jij leidt het gesprek met je MT; het rapport is je leidraad van 45 minuten. Jullie kiezen: wat pakken we op, wie doet het, wanneer kijken we terug. Geen actieplan uit een computer, wel de feiten erbij." | 7 |
| Homepage, vierde stap | "Met je MT, in één gesprek." | 7 |
| Homepage, Methode | "De vertaling naar jullie situatie maak je zelf, met de werkvragen in het rapport van Loep Behoud en Loep Vertrek." (spec zonder de twee scannamen) | 7 |
| `/producten`, lead Loep Behoud | "Loep laat zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt, en het rapport brengt je MT tot één eerste keuze." | 8 |
| `/producten`, lead Loep Start | "Loep meet vroeg hoe nieuwe medewerkers landen. Het rapport geeft je MT een helder groepsbeeld om één eerste stap op te kiezen." | 8 |
| `/producten`, hero | "Drie scans, één recept: Loep zet de meting klaar, jij verstuurt hem, en je krijgt een rapport dat zegt waar het wringt en waar je begint. ... Daarna leid jij het gesprek met je MT; het rapport is je leidraad." | 8 |
| `/producten`, vaste route | "Loep zet klaar en levert het rapport; jij verstuurt, volgt de respons en leidt het gesprek." | 8 |
| `/producten`, inbegrepen | "Meting klaargezet door Loep: vragenlijst, afdelingen en uitnodigingstekst" | 9 |
| Tarieven, kop en uitleg | "Eén vaste prijs, naar de grootte van je organisatie." en "De prijs hangt af van hoe groot je organisatie is, niet van het aantal mensen dat meedoet. Een grotere organisatie heeft meer op het spel staan als behoud onder druk komt; een kleinere minder, en die betaalt dus minder." | 9 |
| Per scan | "€3.500 tot €6.900 excl. btw · naar de grootte van je organisatie" en "Vervolgmeting daarna: €950 tot €1.750 excl. btw. Bekijk de staffel" | 9 |
| Onderste trede | "Loep Vertrek in deze trede: patroonanalyse vraagt minimaal 10 respondenten. Loep stemt de meetperiode daarop af in de intake." | 1 |
| Prijs-FAQ | "De prijs hangt af van de grootte van je organisatie, niet van het aantal mensen dat meedoet. Tot 150 medewerkers: €3.500 voor de eerste scan en €950 voor een vervolgmeting. ... Alle bedragen excl. btw, zonder licenties per medewerker en zonder add-ons achteraf." | 1, 10 |
| `/vertrouwen`, trustregel | "Loep zet de meting klaar, jij verstuurt en leidt het gesprek" | 10 |
| FAQ Loep Start | "... Loep zet de meting klaar en levert een rapport op groepsniveau, met een gespreksleidraad voor het gesprek met je MT." | 10 |
| FAQ instrument of dienst | "Een meting en een rapport. Loep zet de meting klaar en levert het rapport; jij verstuurt de uitnodiging, volgt de respons in je eigen omgeving en leidt het gesprek met je MT, met het rapport als leidraad. Geen licentie, geen platform dat je moet inrichten." | 10 |
| JSON-LD homepage | "Meting van behoud, vertrek en onboarding voor HR en management: ... Het rapport leidt het gesprek met je MT; dat gesprek voer je zelf." | 6 |
| OG-afbeelding | alle tien regels in de tabel van Task 6 Step 6 | 6 |
| `llms.txt` | de samenvatting en het pricing-blok (de spec geeft fragmenten, het plan de volledige tekst) | 11 |
| `/pilot` | alle rijen behalve "Je MT bespreekt het rapport zelf en deelt achteraf hoe dat ging" | 12 |
| Loep Cultuurbeeld | alle tien rijen | 13 |
| In-app label | "€950 tot €1.750 excl. btw, naar de grootte van je organisatie" | 14 |
| Loep_Docs | alle wordt-teksten in de negen documenten | 15 |

### 3. Placeholders

Gezocht op "TBD", "TODO", "later invullen", "vergelijkbaar met Task", "passende foutafhandeling" en stappen zonder code of tekst: niets gevonden. Elke copystap heeft de letterlijke nu- en wordt-tekst; elke codestap de volledige code; elke verwijderstap de grep met de verwachte uitvoer. De invulvelden `[trede]`, `[subtotaal]` en `[3.500,00 / 4.500,00 / 6.900,00]` in Task 15 zijn geen placeholders van het plan maar bedoelde invulvelden in Lars' sjablonen.

### 4. Consistentie van namen en types

- `lib/pricing.ts` exporteert `PRICING_TIERS`, `PRICING_ABOVE_LABEL`, `PRICING_ABOVE_TEXT`, `PRICING_VAT_NOTE`, `CULTUURBEELD_FROM_EUR`, `formatThousands`, `formatEur`, `firstScanRangeLabel`, `followUpRangeLabel`, `pricingFaqAnswer`, `buildPricingOfferCatalog`. Task 2 gebruikt `PRICING_TIERS` en `formatThousands`; Task 5 `PRICING_TIERS`; Task 9 de zeven namen uit de importlijst plus `buildPricingOfferCatalog`; Task 10 `pricingFaqAnswer`; Task 13 `CULTUURBEELD_FROM_EUR` en `formatEur`; Task 14 `PRICING_VAT_NOTE`, `followUpRangeLabel`, `PRICING_TIERS`, `formatEur`. Geen naam die niet in Task 1 is gedefinieerd.
- `lib/site-meta.ts` exporteert `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_SCHEMA_DESCRIPTION`; Task 6 gebruikt precies die drie.
- `REDIRECTED_PRODUCT_ANCHORS` en `redirectTarget` (Task 4) heten in de test en in de code hetzelfde.
- `FOLLOW_UP_COPY` (Task 9) is de constante die Task 17 vervangt.
- De guard verwacht in `llms.txt` de vorm `<label in kleine letters> EUR <bedrag>`; de tekst in Task 11 Step 3 heeft precies die vorm voor alle drie de treden, en noemt precies zes bedragen.
- Verwachte eindstanden zijn overal gelijk: tsc 131 (Task 5, 6, 7, 9, 10, 16), faalset 47 met twaalf `<`-regels (Task 0 Step 6, Task 16 Step 2).

---

## Uitvoering

Plan compleet en opgeslagen in `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a.md`. Twee manieren van uitvoeren:

1. **Subagent-driven (aanbevolen).** Een verse subagent per taak, met per taak een spec-review en een codekwaliteitsreview; REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`.
2. **Inline.** Taken in één sessie met checkpoints; REQUIRED SUB-SKILL: `superpowers:executing-plans`.

In beide gevallen: worktree `.worktrees/site-ronde-a`, branch `feature/site-ronde-a`, nooit `git stash`, niet mergen, niet pushen, en na Task 16 stoppen voor poort 3b. Task 17 wacht op plan 3c.
