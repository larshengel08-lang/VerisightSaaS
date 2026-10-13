# Uitvoeringsverslag: Loep Behoud als MTO-alternatief

Branch: `feature/behoud-mto-alternatief`, vanaf main `329cbba8` (polijstronde gemerged). Niet gemerged, niet gepusht.
Spec: `docs/superpowers/specs/2026-10-11-behoud-als-mto-alternatief-design.md`. Plan: `docs/superpowers/plans/2026-10-11-behoud-als-mto-alternatief.md`.
Uitgevoerd via subagent-driven-development, 12 en 13 oktober 2026.

## Resultaat in het kort

- **Site:** Loep Behoud heet op `/producten` en op de homepagekaart "Het korte medewerkersonderzoek", met de echte invultijd ("ongeveer 6 minuten"), en wordt neergezet als "Een alternatief voor het grote jaarlijkse MTO".
- **FAQ omgedraaid:** "Is Loep Behoud gewoon een MTO? Nee" is nu "Is Loep Behoud een MTO?" met het alternatief-antwoord.
- **Keuzehulp herschreven** tot "Wanneer past een groot MTO beter?".
- **Bedrag per medewerker weg** uit de tarievensectie.
- **Cultuurbeeld uit het aanbod:** 308 naar `/producten#loep-behoud`, niet meer kiesbaar in het contactformulier. Een brede vraag landt bij Loep Behoud, en oude leads houden een leesbaar label.
- **Backend:** de backend-copy is consistent gemaakt.
- **Loep_Docs:** in lijn gebracht, plus een nieuwe OR-notitie.

## Gates (op de laatste commit `117d92d7`)

| Gate | Baseline (main `329cbba8`) | Na | Faalset |
|---|---|---|---|
| tsc | 131 | 131 | n.v.t. |
| vitest | 47 falend | 47 falend, 1957 geslaagd | per naam identiek |
| pytest `tests/` | 24 falend | 24 falend, 2343 geslaagd, 11 overgeslagen | per naam identiek |
| `npm run build` | | groen | |

Pytest draait op `tests/`. Een kale `pytest` vanaf de repo-root verzamelt ook de oude review-packs in `docs/review-packs/`, en die botsen op bestandsnamen. Dat speelde al vóór deze ronde.

## Per taak

- **Taak 0:** de worktree is aangemaakt. In de hoofdmap is `frontend/node_modules` leeg, dus in de worktree is `npm install` gedraaid en `package-lock.json` teruggezet.
  - Invultijdbron: `SURVEY_DURATION_LABEL` in `frontend/lib/campaign-setup.ts`, retention = "ongeveer 6 minuten", gelijk aan `SURVEY_MINUTES = 6` in de backend. Die bron komt uit de polijstronde.
- **Taak 1:** copy-guard `frontend/lib/behoud-mto-alternatief.guard.test.ts` (49 tests). De invultijdcheck pint `SURVEY_DURATION_LABEL.retention` en niet alleen de constante. Dat is aangescherpt na de review, omdat `/producten` die constante voor alle drie de scans gebruikt.
- **Taak 2:**
  - FAQ, eyebrow, lead en when-bullet zijn aangepast.
  - De keuzehulp is herschreven. "Communicatie als eigen onderwerp" staat er bewust in en "informatie" niet, want informatie zit als verdiepings- en richtingoptie in Behoud. Dat is gecontroleerd tegen de stellingen, `scoring_config.py` en `deepening.py`.
  - De homepagekaart gebruikt `SURVEY_DURATION_LABEL.retention`.
  - De dode exports `pricingFaqs` en `approachRoutes` zijn verwijderd. Ze hadden geen gerenderde importeur, en de enige test die ze gebruikte is mee bijgewerkt.
  - **Bijvangst, spec gecorrigeerd:** de tarievensectie noemde nog "zo'n €30 per medewerker". De spec zei ten onrechte dat dit al weg was. Het is verwijderd volgens regel 4.3. De vergelijking met een uitbesteed traject blijft.
- **Taak 3:**
  - De `/producten`-description noemt nu "Loep Behoud, een alternatief voor het grote jaarlijkse MTO", en `llms.txt` heeft een regel met de invultijd erbij.
  - De agent zette de zin ook in de site-brede `SITE_DESCRIPTION` en `HOME_SCHEMA_DESCRIPTION`. Dat is teruggedraaid, want die beschrijven heel Loep (spec par. 3: de claim geldt alleen voor Behoud). Die zin kwam bovendien na teken 210, dus Google had hem toch afgekapt.
- **Taak 4:** "geen brede MTO" is nu "geen breed MTO met benchmark", in `backend/products/retention/definition.py`, `report_content.py` en `frontend/lib/products/retention/definition.ts`. "Verisight" is ook in `segmentText` vervangen door "Loep".
  - De nieuwe pytest `tests/test_behoud_mto_live_rapport.py` bewijst dat het live rapport geen "MTO" bevat. De eerste twee tests slaagden vóór de fix, dus de premisse van spec 6.2 klopt.
- **Taak 5 (gate, door de hoofdsessie):** alleen-lezen telling op productie op 12 oktober. Er zijn **0 Cultuurbeeld-campagnes** (productie heeft 10 Behoud- en 2 Vertrek-metingen) en **0 Cultuurbeeld-leads**, zowel in `route_interest` als in `qualified_route`.
- **Taak 6:**
  - `culture_assessment` is verplaatst naar `LEGACY_HIDDEN_CONTACT_ROUTE_OPTIONS` met het label "Loep Cultuurbeeld".
  - "medewerkersonderzoek" is toegevoegd als trefwoord. Een brede vraag zonder vertreksignaal krijgt nu `retentiescan`, en een expliciete oude Cultuurbeeld-keuze blijft staan.
  - Leadmail en beheer tonen "Loep Cultuurbeeld". Voorheen toonde de leadmail daar de ruwe sleutel.
  - Bijgewerkt: `contact-funnel.test.ts`, `contact-qualification.ts` en de bijbehorende test, en `marketing-flow.test.ts`.
- **Taak 7:** redirect in `next.config.ts`. De test importeert `next.config` direct. Er is geen andere gerenderde link naar `/producten/cultuurbeeld` gevonden.
- **Taak 8 (Loep_Docs, buiten de repo):**
  - Nieuw: `or-notitie.html` en `Loep OR-notitie.pdf`. De getallen komen uit de code: rapport vanaf 10, afdeling vanaf 5, uiterlijk twee jaar, ongeveer 6 minuten. De factornamen zijn die uit het rapport.
  - De OR-vraag staat in `intake-formulier.html` en `offerte-template.html`.
  - Bedrag per medewerker verwijderd uit `one-pager.html`, `sales-pitch.html`, `faq.html` en `harde-getallen.html`.
  - De positioneringszin staat in de one-pager en de pitch, de FAQ is overgenomen.
  - `methodische-verantwoording.html`: de invultijd stond op "6 tot 10 minuten" en is nu "ongeveer 6 minuten". De richtingvraag was nog beschreven volgens het ontwerp van juli en is bijgewerkt naar de huidige werking.
  - De PDF's van de one-pager, de verantwoording en de OR-notitie zijn opnieuw geëxporteerd. Reservekopieën staan in `Loep_Docs/_archief-2026-10-12/`.
- **Taak 9:** gates zie boven, en deze browsercheck (lokaal op :3100):
  - Homepage: de Behoud-kaart toont de nieuwe tekst met invultijd. Op 1440 px zijn de drie kaarten even hoog (285 px), de h1 is ongewijzigd.
  - `/producten`: eyebrow, lead, invultijd, keuzehulp en FAQ zijn zichtbaar, er staan geen streepjes in, en "per medewerker" staat er alleen in "Geen licenties per medewerker". Op 375 px is de scrollbreedte 375.
  - Redirects: `/producten/cultuurbeeld` geeft een 308 naar `#loep-behoud`, `/producten/exitscan` nog steeds een 308.
  - `/kennismaking`: geen Cultuurbeeld meer.
  - Console: alleen de bekende CSP-melding over het debugscript van Vercel Analytics in dev.
  - Dashboard testklant A (`/campaigns/12b958fb…`): geen "MTO" en geen "Verisight".

## Correcties op de spec, gevonden tijdens de bouw

1. **€30 per medewerker** stond nog op `/producten`. Opgelost, en de spec is gecorrigeerd.
2. **De methodiekkaart is niet klantzichtbaar.** `MethodologyCard` in `page-helpers.tsx` heeft geen importeur meer, want het dashboard-redesign van juni heeft hem vervangen. De dashboardtekst is daarmee alleen consistentie, net als de backend. Er is niets kapot.

## Eindreview en fixronde

De eindreview van de hele branch vond niets kritieks. Er was één belangrijk punt, en dat is opgelost:

- **Een oude link met `?route_interest=culture_assessment`** (of een Cultuurbeeld-`cta_source`) liet het formulier "Loep Vertrek" tonen, terwijl de lead als Cultuurbeeld werd opgeslagen. De bezoeker zag dus iets anders dan wat werd vastgelegd.
- **De oplossing zit alleen in het formulier.** Een nieuwe helper `visibleContactRouteInterest` zet elke route die niet als optie bestaat om naar `retentiescan`. Dat geldt ook voor `teamscan`.
- **Wat ongewijzigd blijft:** de API en de labelmaps accepteren oude leads nog steeds.
- **Tests:** een unittest en een broncheck (`contact-form.guard.test.ts`).

Kleine punten, ook opgelost:
1. De operatortekst in de `culture_primary`-tak zegt nu dat Cultuurbeeld uit het aanbod is en dat Loep Behoud getoetst wordt.
2. De copy-guard leest de invultijd uit `SURVEY_DURATION_LABEL.retention` in plaats van een losse tekst. Gaat `SURVEY_MINUTES` omhoog, dan faalt de guard op `llms.txt`.
3. De regex voor een bedrag per medewerker herkent nu ook `&euro;` en `formatEur(`. De regex zelf is gepind met voorbeeldzinnen.
4. De pytest voor het live rapport werkt nu ongeacht de map waarin pytest draait.
5. Cultuurbeeld staat ook in `REDIRECTED_PRODUCT_ANCHORS`, als tweede vangnet naast `next.config.ts`.
6. De prijszin luidt nu "... drie tot vier keer wat Loep voor die omvang rekent."

**Gates na de fixronde:** tsc 131, vitest per naam identiek aan de baseline, build groen, en de pytest voor het live rapport slaagt (3 passed).

**Niet opgelost, ter info:** wie expliciet Loep Vertrek kiest en het over samenwerking of leiderschap heeft, zonder een woord over vertrek, krijgt in het beheeradvies Loep Behoud als aanbevolen route. Voorheen werd dat Cultuurbeeld. Alleen de operator ziet dit, en de bezoekerskeuze blijft opgeslagen.

## Besluiten Lars 13-10 (verwerkt)

1. **Derde reden geschrapt.** De keuzehulp noemt nog twee redenen voor een groot MTO: een benchmark en onderwerpen die Behoud niet meet.
2. **"arbeidsomstandigheden" wordt "de fysieke werkplek en veiligheid".** Werkdruk valt wettelijk onder arbeidsomstandigheden, en Behoud meet werkdruk. De term stond alleen op `/producten`. In Loep_Docs kwam hij nergens voor, dus er hoefde geen PDF opnieuw te worden geëxporteerd. De spec is bijgewerkt.
3. **Eyebrow op `/producten` weer "Behoud onder druk"**, gelijk aan de homepage. De lead begint nu met "Het korte medewerkersonderzoek (ongeveer 6 minuten). Een alternatief voor het grote jaarlijkse MTO." De invultijd komt uit `SURVEY_DURATION_LABEL.retention`.
4. **Homepagekaart Behoud ingekort tot 20 woorden** (Vertrek heeft er 17): "Het korte medewerkersonderzoek (ongeveer 6 minuten): waar het wringt en waar je begint. Een alternatief voor het grote jaarlijkse MTO."

**Guard uitgebreid:** de keuzehulp heeft precies twee redenen, "arbeidsomstandigheden" en "intern team zelf beheert" komen niet meer voor, en "de fysieke werkplek en veiligheid" wel. De regel "korte medewerkersonderzoek staat altijd naast de invultijd" blijft gelden en is groen. `producten-besluit-a.test.ts` pint de nieuwe lead en eyebrow, bijgewerkt in lockstep.

**Gates:** tsc 131, vitest 47 falend en per naam identiek aan de baseline, pytest `tests/` 24 falend en per naam identiek (2343 geslaagd), build groen.

**Browser:**
- Op 1440 px zijn de drie homepagekaarten even hoog (3× 285 px).
- Op 375 px heeft de Behoud-kaart 4 regels tekst van 15 px op een breedte van 288 px, zonder overflow. De scrollbreedte is 375, ook op `/producten`.
- `/producten` toont de eyebrow "Behoud onder druk", de nieuwe lead en een keuzehulp met twee redenen.
- Screenshots op 375 px bleven leeg door de bekende valkuil van het verborgen browserpaneel. Daarom is daar met DOM-metingen gecontroleerd.

## Na de merge

- **Vercel** deployt de frontend: site, `llms.txt` en de redirect.
- **Railway**, service "Loep main": redeploy voor de backend-copy. Die is niet klantzichtbaar, maar zo lopen code en productie gelijk. Serverless moet aan blijven op het gratis plan. Daarna `GET /api/health` en controleren dat de git-sha deze merge bevat. Er is geen DB-migratie.
- **Mergevolgorde:** `feature/polijstronde-beslissingen` gaat ook uit van `329cbba8`. Kijk bij de tweede merge naar `producten-content.tsx`, `home-page-content.tsx`, `site-content.ts`, `contact-funnel.ts` en `retention/report_content.py`.
- **Opruimen:** worktree `.worktrees/behoud-mto` (node_modules is daar echt geïnstalleerd, geen junction, dus gewoon verwijderen) en de launch.json-entry "Behoud MTO (worktree)".
