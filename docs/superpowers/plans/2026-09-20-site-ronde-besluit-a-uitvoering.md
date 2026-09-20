# Site-ronde bij propositiebesluit A: uitvoeringsverslag

> **POORT 3b, lees dit eerst.** Deze branch mag nu gebouwd worden, maar de site belooft na deze ronde de gespreksleidraad, de werkvragen en de besluitpagina. Die bestaan pas als plan 3b (`docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md`) is gemerged én live staat op Railway. **De uitvoerder merget niet en pusht niet.** De hoofdsessie merget `feature/site-ronde-a` pas na (1) merge en deploy van 3b en (2) een koude leesronde die gat B3 dicht verklaart.

Datum: 20 september 2026
Branch: `feature/site-ronde-a` (worktree `.worktrees/site-ronde-a`), vanaf main `31d2ff25`
Plan: `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a.md`
Spec: `docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md` (akkoord, besluiten in par. 8)
Uitvoering: subagent-driven-development, 16 taken, per taak een spec-compliance-review en een codekwaliteitsreview door aparte subagents, daarna een branchbrede eindreview en een aparte browserverificatie.

**Task 17 is niet uitgevoerd**: die wacht op plan 3c. Tot dan staat de vervolgmetingszin overal in de eerlijke tussenvorm ("het rapport van je tweede meting leg je naast het eerste"), nergens staat dat het rapport laat zien wat er sinds de eerste meting is veranderd.

---

## Wat er nu staat

De publieke site verkoopt wat Loep sinds besluit A levert. Loep zet de meting klaar en levert het rapport; de klant verstuurt de uitnodiging, volgt de respons, sluit of verlengt, leidt het MT-gesprek en legt het besluit vast. Elke belofte van een bespreking door Loep is weg, net als het woord "begeleid", de claim "geen zelfbedieningstool" en de varianten daarvan ("Loep doet het werk", "je beheert geen tool", "geen software om te beheren").

De prijs is een staffel op organisatiegrootte met één bron in `frontend/lib/pricing.ts`: tot 150 medewerkers €3.500 en €950, 150 tot 400 €4.500 en €1.250, 400 tot 1.000 €6.900 en €1.750, boven 1.000 op aanvraag, alles excl. btw. Loep Cultuurbeeld houdt €6.500 en valt buiten de staffel. Er staat geen los Loep-bedrag meer in een gerenderd marketingbestand; `public/llms.txt` kan niet importeren en wordt daarom door de guard tegen de staffel gelegd.

De paginatitel is "Loep | Zie waar behoud onder druk staat, voordat mensen gaan", de eyebrow "Meting en rapport · Het gesprek voer je zelf". Het founderfotoblok is van de homepage af (de foto blijft op `/kennismaking`); de trustsectie staat weer in de stand van vóór 21 juni.

---

## Baselines

De gate is de faalset per testnaam en de tsc-foutset per bestand en melding, nooit het aantal alleen.

| | baseline `31d2ff25` | eind |
|---|---|---|
| `npx tsc --noEmit` | 133 | **131** |
| `npx vitest run` | 60 falend | **48 falend** |
| faalset-diff | | **12 `<`-regels, 0 `>`-regels** |
| `npm run build` | | **exit 0** |
| guard `site-ronde-besluit-a.guard.test.ts` | bestond niet | **110/110 groen** |

**tsc, de twee verdwenen fouten** (beide in `lib/marketing-flow.test.ts`, door het verwijderen van `approachSteps` en `homepageProductRoutes` in Task 5):
- `error TS2339: Property 'body' does not exist on type 'never'.`
- `error TS2367: This comparison appears to be unintentional ... '"5. Dashboard en rapport"' have no overlap.`

**De twaalf verdwenen falende tests, met reden:**

| Test | Reden |
|---|---|
| `app/producten/[slug]/page.test.ts` (5 tests) | Bestand verwijderd in Task 4; het knipte op `function PulsePage()`, een functie die in juni al weg was, en pinde opmaak van de drie verwijderde detailpagina's. |
| `lib/exit-product-copy.test.ts` | Bestand verwijderd in Task 4; pinde "u"-copy van vóór de je/jij-rebrand in `ExitScanPage`. |
| `lib/retention-product-copy.test.ts` | Bestand verwijderd in Task 4; idem voor `RetentionScanPage`. |
| `lib/aanpak-content.test.ts` | Bestand verwijderd in Task 3 met de doorverwezen pagina `/aanpak`. |
| `lib/tarieven-content.test.ts` | Bestand verwijderd in Task 3 met de doorverwezen pagina `/tarieven`. |
| `lib/marketing-flow.test.ts > keeps the approach flow explicit about assisted onboarding and first use` | Test verwijderd in Task 5; pinde letterlijk "Begeleide managementbespreking van 60-90 minuten" op de dode export `approachSteps`. |
| `lib/marketing-flow.test.ts > keeps the homepage focused on the three buyer-facing primary routes` | Test verwijderd in Task 5; pinde de dode export `homepageProductRoutes` met een portfolio dat sinds juni niet meer bestaat. |
| `lib/seo-conversion.test.ts > keeps the homepage and support-page metadata aligned with current SEO positioning` | **Groen geworden**, niet verwijderd: de test verwachtte `'Verisight'` als homepagetitel en is in Task 6 in lockstep op `SITE_TITLE` gezet. |

**Afwijking van de voorspelling in het plan.** Het plan voorspelde faalset 47 en gaf als baseline 59. Gemeten baseline was 60 en eindstand 48. Het verschil van precies één is in beide metingen dezelfde wisselvallige test die de plankop al noemt: `app/(dashboard)/beheer/health/page.test.ts` laadt soms niet (`Cannot find package 'server-only'`). De twaalf `<`-regels en de nul `>`-regels kloppen exact met de voorspelling; er is dus geen regel onverklaard.

---

## Commits (23)

| SHA | Taak | Inhoud |
|---|---|---|
| `1742d1a3` | 0 | Implementatieplan op de branch |
| `f58d2c86` | 1 | `lib/pricing.ts`: de staffel als enige bron van elk bedrag |
| `f580f18b` | 2 | Guardtest op besluit A en de staffel (bewust rood tot het eind) |
| `f2b17b6c` | 3 | `/aanpak` en `/tarieven` verwijderd, redirects blijven |
| `48badc6a` | 1 (fix) | Bedragcontrole ook op de JSON-LD-weg, staffel echt onveranderlijk |
| `8e28c7de` | 4 | Drie doorverwezen detailpagina's weg, `permanentRedirect` als vangnet |
| `e05c5916` | 2 (fix) | Guard: dekkingsgaten op bespreking, pad, JSX-spatie en llms.txt |
| `b3356bf7` | 5 | Negen dode exports uit `site-content.ts`, tests in lockstep |
| `7a4e1a54` | 6 | Titel en beschrijving uit één bron, OG-afbeelding in Loep-tokens |
| `d991820f` | 7 | Homepage na besluit A, founderfotoblok weg |
| `c4cd4070` | 6 (fix) | Link-preview loopt niet meer buiten het doek |
| `62365be6` | 8 | `/producten`: wie doet wat, levering, leads, hero, MTO-vergelijking |
| `60c1cff1` | 9 | Prijsstaffel op `/producten#tarieven` en in de structured data |
| `cceb5339` | 10 | `/vertrouwen` en de FAQ-JSON-LD, prijsvraag uit de staffel |
| `a77b24af` | 11 | `llms.txt`: staffel, geen bespreking door Loep |
| `c9707098` | 12 | `/pilot` volgt het product (weg a) |
| `b89e7305` | 13 | Loep Cultuurbeeld: geen directie-read sessie, eigen prijs |
| `ce9d67ca` | 14 | In-app prijslabel van de vervolgmeting als bereik |
| `7cece5e9` | fixronde | Leidraad en afweging alleen bij de scans die ze hebben |
| `f6d55da9` | fixronde | Tarievenzinnen kloppend sinds de staffel |
| `9d352f02` | fixronde | Twee verouderde previewpagina's uit `public/` |
| `a6a1a5ae` | fixronde | Verweesde `tweaks-panel.jsx` weg |
| `8451c773` | 16 | Browsercheck-screenshots |

Task 15 (Loep_Docs) staat buiten de git-repo en heeft geen commit; zie hieronder.

---

## Dode code: verwijderd en bewust blijven staan

Elke verwijdering ging met verify-before-delete: eerst een grep die bewijst dat er geen niet-test-importer is, met de uitvoer in het taakrapport. De redirects in `next.config.ts` zijn niet aangeraakt.

**Verwijderd**
- `app/aanpak/page.tsx`, `components/marketing/aanpak-content.tsx`, `lib/aanpak-content.test.ts`
- `app/tarieven/page.tsx`, `components/marketing/tarieven-content.tsx`, `lib/tarieven-content.test.ts`
- In `app/producten/[slug]/page.tsx`: `ExitScanPage`, `RetentionScanPage`, `OnboardingModernPage`, `OnboardingPage` en de twee imports die alleen zij gebruikten (676 regels); vier testbestanden (`[slug]/page.test.ts`, `exit-product-copy.test.ts`, `retention-product-copy.test.ts`, `product-detail-hero-prices.test.ts`)
- Negen exports uit `site-content.ts`: `homepageProductRoutes`, `homepageCoreProductRoutes`, `homepageComparisonRows`, `trustSignalHighlights`, `outcomeCards`, `included`, `approachSteps`, `customerLifecycleStages`, `pricingCards`
- De FAQ "Wanneer kies je voor de combinatie?" (product in juni geschrapt, stond nog in de FAQ-JSON-LD van de homepage)
- `public/images/lars-loep.jpg`, `public/preview-rapporteur.html`, `public/flow-preview.html`, `public/tweaks-panel.jsx`

**Bewust blijven staan** (naast de lijst in het plan onder "Bewust niet gedaan")
- `SuitePreviewSection`, `suiteFlowPoints` en `suiteSignalMetrics` in `home-page-content.tsx`: ongeveer 200 regels die `HomePageContent` niet mount. Task 7 heeft de copy er conform de plantabel toch in bijgewerkt, zodat hergebruik geen oude belofte terugbrengt. Opruimkandidaat, buiten de scope van deze ronde.
- `components/marketing/marketing-comparison-table.tsx`: verweesd geraakt doordat Task 4 de detailpagina's verwijderde. Nul importeurs, geen test. Opruimkandidaat.
- `pricingFaqs` in `site-content.ts` bevat nog "Wanneer kies je voor de combinatieroute?". Dode export (enige importer is een test), dus niet klantzichtbaar; weghalen raakt een testbestand dat buiten deze ronde valt.
- `'/aanpak'` en `'/tarieven'` in `PUBLIC_ROUTES` (`lib/public-route-access.ts`) en twee dode oppervlakken in `lib/content-operating-system.ts`. Onschadelijk: de middleware werkt op `PROTECTED_APP_ROUTES`, en de redirects vangen het verzoek af vóór de pagina rendert.

Geen test is verwijderd of afgezwakt om groen te worden. Elke verwijderde assertie hing aan een bestand of export die in dezelfde taak zelf verdween; dat staat per stap in de taakrapporten en is door de reviews nagelopen.

---

## Wat de reviews vonden

Alle zestien taken kregen twee reviews. Geen enkele taak werd afgekeurd, maar de reviews vonden wel echte dingen.

**Vóór de bouw al mis in het plan zelf.** De testregel voor de wij-vorm (`\b(wij|we|ons|onze)\b`) matchte de staart van "add-ons", waardoor test en implementatie uit hetzelfde plan niet allebei konden slagen. De implementer koos de copy te behouden en de regex te repareren met een lookbehind, niet andersom.

**De guard dekte minder dan hij beloofde.** Twee reviews vonden samen tien gaten, allemaal gedicht in `e05c5916` vóór ze schade konden doen. De belangrijkste: er was geen patroon voor "de bespreking" als losse belofte, waardoor zeven zinnen die de spec letterlijk als "nu" citeert ongehinderd door de guard kwamen; `process.cwd()` maakte dat een verkeerde werkmap alle 108 testnamen stil liet verdwijnen, wat de faalset-gate als "geen fouten" zou lezen; en `{' '}` in JSX ontsnapte aan de normalisatie, zodat `gesprek{' '} inbegrepen` erdoorheen glipte.

**Een Fail Loud-gat in de prijsmodule.** `offer()` zette een bedrag zonder validatie in de JSON-LD: een fout bedrag zou luid falen op de site maar stil in de structured data belanden. De controle is losgetrokken en geldt nu op beide wegen. De staffel is daarnaast echt bevroren, zodat een schrijfpoging een `TypeError` geeft in plaats van alleen een compilerwaarschuwing.

**De link-preview liep buiten het doek.** Pre-existent en op beide commits gereproduceerd: de rechterkolom van de OG-afbeelding had geen breedtebeperking, waardoor Satori de navy kaart afsneed. Opgelost met één eigenschap, met een gemeten waarde (1200 min 2×56 padding min 720 linkerkolom min 28 gap = 340) en een pixelmeting op de gerenderde PNG als bewijs.

**De eindreviews vonden vier dingen die de losse taakreviews niet konden zien** (alle vier gefixt in de fixronde):
1. De homepage beloofde "Gespreksleidraad en besluitpagina in elk rapport", terwijl Loep Cultuurbeeld geen van beide heeft en dezelfde branch dat zelf vastpint.
2. De ranglijst werd onvoorwaardelijk beloofd terwijl Loep Start geen prioriteringsraster heeft. De afbakening zit nu op het "waarom" (wat er meewoog in de volgorde), niet op de ranglijst zelf, omdat de rangorde bij Loep Start wel bestaat en alleen de afweging ontbreekt.
3. Twee zinnen in de tarievensectie klopten niet meer sinds de staffel: de rekensom "€30 per medewerker" kon tegen de verkeerde trede gelegd worden, en "drie tot vier keer zoveel" had geen referent meer.
4. `public/preview-rapporteur.html` stond publiek bereikbaar en verkocht letterlijk het omgekeerde van besluit A ("Geen self-service tool. Een professional begeleidt het traject"), met het oude Verisight-merk in de titel. Samen met `flow-preview.html` verwijderd; de guard scant `public/` nu dynamisch op HTML, zodat dit niet opnieuw kan gebeuren.

---

## Browsercheck (20 september 2026)

Dev-server op poort 3177, zes pagina's op desktop en 375 px, veertien screenshots in `docs/site-ronde-a/`.

- **Geen horizontale overloop**: `document.documentElement.scrollWidth` is 375 op alle zes pagina's op 375 px, en gelijk aan `innerWidth` op desktop.
- **Titel** exact "Loep | Zie waar behoud onder druk staat, voordat mensen gaan", ook als `og:title` en `twitter:title`.
- **Alle 14 JSON-LD-blokken over de zes pagina's parsen zonder fout.** De `OfferCatalog` op `/producten` heeft zes Offers met de bedragen 3500, 950, 4500, 1250, 6900, 1750, valuta EUR op zowel de Offer als de `priceSpecification`, en `valueAddedTaxIncluded: false`.
- **FAQ-JSON-LD** op de homepage: geldig, 8 vragen, geen enkele die "combinatie" noemt.
- **Redirects**: `/aanpak` 308 naar `/producten`, `/tarieven` 308 naar `/producten#tarieven`, `/producten/exitscan` 308 naar `/producten#loep-vertrek`, `/producten/cultuurbeeld` 200. Ook gecontroleerd: `retentiescan`, `onboarding-30-60-90` en `/oplossingen/exitscan`. Elke interne link in de gerenderde HTML geeft 200.
- **Console**: buiten de bekende, in het plan gedocumenteerde CSP-blokkade van Vercel Analytics nul fouten, op alle veertien combinaties.
- **Slotgrep** over `components/marketing/`, de publieke pagina's onder `app/` (juridische pagina's uitgezonderd) en `public/llms.txt`, op `begeleid` in elke vorm, `managementbespreking`, `bespreking inbegrepen`, `zelfbedien`, `geduid door HR-specialisten`, `geen software om te beheren`, `directie-read sessie` en de zeven bedragen: **nul treffers**.

---

## Loep_Docs (Task 15, buiten de repo)

Negen sjablonen in `C:\Users\larsh\Desktop\Business\Loep_Docs\` zijn in lijn gebracht: offerte-template, factuur-template, pilotbevestiging, one-pager, sales-pitch, faq, intake-formulier, methodische-verantwoording en harde-getallen. De ongewijzigde kopieën staan in `Loep_Docs\_archief-2026-09-20\`; dat is de enige terugweg, want die map staat niet onder versiebeheer.

Inhoudelijk: elke bespreking door Loep is eruit (de offerte en de pilotbevestiging zijn contractueel), de oude definitie van de vervolgmeting ("inclusief compacte bespreking van 45-60 min", 9 juli) is vervallen, de staffel staat erin, en de vaste bedragen in offerte en factuur zijn invulvelden geworden zodat geen enkel sjabloon nog één trede voorschrijft. De doorlooptijd is van "intake tot bespreking" naar "intake tot rapport" gegaan.

Twee dingen bijgevangen: de offerte beloofde de verdiepingsvragen als "standaard onderdeel van elke scan" terwijl Loep Start die niet heeft (nu afgebakend tot Loep Vertrek en Loep Behoud), en drie en-dashes in klantzichtbare zinnen zijn vervangen.

**Niet aangeraakt**: `copy-ronde-positionering.html` (reviewdocument van 6 september, historie), de drie `.docx`-gespreksstructuren en `factuur-template.zip`. Geen enkel bestand droeg een klantnaam, dus er was niets dat op die grond moest blijven staan.

---

## Zelf geformuleerde teksten die Lars moet nalopen

De spec gaf voor deze plekken geen wordt-tekst; de planschrijver of de uitvoerder heeft ze geschreven, in dezelfde stem.

1. **Homepage, hero-subkop.** Het plan miste een plek die de guard wel ving: "Loep doet het werk; jij krijgt een antwoord" is "Loep zet de meting klaar en levert het rapport; jij krijgt een antwoord" geworden.
2. **Homepage, stap 3.** "Jij leidt het gesprek met je MT; het rapport is je leidraad van 45 minuten." De 45 minuten komen uit het plan en uit 3b, maar het is een harde toezegging die pas waar is zodra 3b live staat. Dat valt samen met poort 3b.
3. **Homepage, trustlijst.** "Gespreksleidraad en besluitpagina in Loep Vertrek, Loep Behoud en Loep Start" (was "in elk rapport"; Cultuurbeeld heeft ze niet).
4. **Homepage en llms.txt, de ranglijst.** "Plus één ranglijst: dit eerst. Bij Loep Vertrek en Loep Behoud lees je er ook bij wat er meewoog in die volgorde." Het METHODE-blok is in dezelfde beweging omgedraaid zodat één afbakening beide claims dekt.
5. **`/producten`, de rekensom.** "In de trede van 150 tot 400 medewerkers komt een scan bij 150 medewerkers neer op zo'n €30 per medewerker, en bij 300 medewerkers op de helft daarvan. Ter vergelijking: een volledig uitbesteed onderzoekstraject kost bij die omvang al snel drie tot vier keer het bedrag van die trede."
6. **Loep Cultuurbeeld.** De doelgroepregel is "100 tot 1.000 medewerkers, directie als koper" geworden (was "MKB 50 tot 1000 fte"), de buurcel "Organisaties boven 1.000 medewerkers" (was "Enterprise 1000+ fte"). Beide "Bekijk tarieven"-links zijn weg; in plaats daarvan staat er "Vanaf €6.500 excl. btw voor de baseline", uit `CULTUURBEELD_FROM_EUR`. Reden: die links stuurden de lezer naar een staffel waar dit product niet in staat, en er is geen andere pagina waar de Cultuurbeeld-prijs staat.
7. **In-app label van de vervolgmeting.** "€950 tot €1.750 excl. btw, naar de grootte van je organisatie."
8. **Loep_Docs.** Alle wordt-teksten in de negen documenten.

---

## Wat Lars moet beslissen

1. **De twee pdf's in Loep_Docs** (`Loep onepager.pdf`, `Loep methodische verantwoording.pdf`) zijn exports van 16 juli en dragen nog de oude tekst en prijs. Die moet je zelf opnieuw exporteren uit de bijgewerkte HTML; tot die export zijn ze inhoudelijk onjuist.
2. **De Loep_Docs-sjablonen beloven nu de gespreksleidraad en de besluitpagina, en die staan nog niet live.** Ze staan buiten versiebeheer en zijn dus direct verstuurbaar. Stuur offerte, pilotbevestiging, one-pager, sales-pitch en faq pas uit nadat plan 3b gemerged en gedeployed is.
3. **De juridische pagina's noemen de dienst nog "begeleid"**: `app/voorwaarden/page.tsx` r.30 ("bijbehorende begeleiding"), r.55 ("Loep levert begeleide productvormen") en r.66 ("De standaarddienst is organisatiegebonden en begeleid van opzet"); `app/privacy/page.tsx` r.29 en `app/dpa/page.tsx` r.48 ("dienst voor begeleide HR-signalering"). Geen van deze belooft een bespreking, maar r.66 van de voorwaarden is een contractuele omschrijving die na besluit A niet meer klopt met wat de site verkoopt. Advies blijft: één juridische mini-ronde, los van deze branch.
4. **De Bosman-pilot.** De verstuurde pilotbevestiging belooft een begeleide managementbespreking van 1 tot 1,5 uur. Task 15 past alleen het sjabloon aan. Krijgt Bosman de bespreking nog, of stuur je een bijgewerkte bevestiging volgens weg a?
5. **De tredegrens op precies 150.** "Tot 150 medewerkers" en "150 tot 400 medewerkers" lezen allebei alsof 150 erin valt. De labels zijn jouw besluit en zijn ongewijzigd gebleven; de rekensom is zo herschreven dat hij niet meer tegen de verkeerde rij gelegd kan worden. Wil je de grens ondubbelzinnig, dan wordt het eerste label "Minder dan 150 medewerkers".
6. **De omvangranges op `/kennismaking` sluiten niet aan op de staffel.** Het contactformulier biedt 100-200 / 200-400 / 400-700 / 700-1.000, de staffel breekt op 150 / 400 / 1.000. Een lead die "100 - 200 medewerkers" kiest valt in twee prijstredes. Niet aangepast omdat de optiewaarden je binnenkomende leaddata vormen; als je wilt dat een lead meteen naar een trede te herleiden is, is dit een kleine vervolgtaak.
7. **De FAQ-JSON-LD staat op de homepage maar de vragen staan nergens zichtbaar op die pagina.** Google wil dat FAQPage-inhoud zichtbaar is, en deze ronde zet er nu ook een prijstabel in die alleen op `/producten#tarieven` zichtbaar is. Pre-existent probleem dat door deze ronde groter wordt. Twee wegen: het blok verplaatsen naar `/producten` en de FAQ daar zichtbaar renderen, of de FAQPage-node weghalen.
8. **Het in-app prijslabel is een bereik** omdat het dashboard de organisatiegrootte niet kent. Wil je het exacte bedrag per klant tonen, dan is er een tredeveld op de organisatie nodig; dat is een kleine vervolgtaak met een migratie. Deze ronde heeft bewust geen veld en geen migratie toegevoegd.
9. **`/producten/cultuurbeeld/opengraph-image` geeft 500**, dus die pagina heeft geen link-preview: Satori weigert `display: 'inline-flex'`. Pre-existent, buiten de diff van deze branch. Dezelfde pagina draagt in de JSON-LD nog het oude merk "Verisight" (`isPartOf.WebSite.name` en `Service.provider`), en gebruikt nog het CTA-jargon "route-inschatting" dat elders in juli al vervangen is.
10. **`/pilot` valt voor `twitter:title` en `twitter:description` terug op de homepagestandaard**, terwijl `og:title` en `og:description` wél pilot-specifiek zijn. Op X wint `twitter:*`, dus die link toont de homepage-propositie. Relevant omdat `/pilot` juist bedoeld is om 1-op-1 te delen.
11. **Twee prerenderde slugs dragen nog "| Verisight"** in de titel: `mto` en `customer-feedback` hebben geen `seoTitle`, dus de fallback in `app/producten/[slug]/page.tsx` slaat aan.
12. **Claimsterkte loopt uiteen**: de homepage zegt "gevalideerde vragenlijsten", `/vertrouwen` zegt "gebaseerd op relevante literatuur". Niet strijdig, maar de sterkste formulering staat op de pagina die het minst over bewijs gaat. De breadcrumb-JSON-LD van `/vertrouwen` noemt de pagina bovendien nog "Privacy".
13. **De gespreksleidraad is in de rapportcode voorwaardelijk** (`backend/report_html.py` geeft een leeg blok terug als er geen afdelingen, geen open tekst en geen werkbeleving zijn) terwijl de site hem onvoorwaardelijk belooft. Zeldzame degraded staat, maar goed om te weten vóór de eerste kleine klant.
14. **In-app resten die besluit A ook raakt**, bewust buiten scope maar zichtbaar voor een ingelogde klant: "of laat Loep begeleiden" in `lib/customer-permissions.ts`, en "Begeleiding" en "Volgende bespreking" in het Action Center.
15. **De naam in de offerte** is "Loep · Lars Hengel", terwijl de site en de nieuwe pilotzin "Lars van den Hengel" gebruiken. Pre-existente inconsistentie.

---

## Bewust niet gedaan

Naast de lijst in het plan onder "Bewust niet gedaan" (juridische pagina's, wij-zinnen buiten de geraakte passages, dode exports zonder besluit-A-treffer, de doorverwezen `/oplossingen/[slug]`-pagina's, ongebruikte imports die op main al ongebruikt waren, `lib/marketing-products.ts`, de Playwright-suite en de in-app copy):

- **Task 17**, de definitieve vervolgmetingszin, wacht op plan 3c.
- **De h1 van `/vertrouwen`** zegt "Zo gaan we met jullie data om", een "we" namens Loep die in geen plantabel staat.
- **De dode `SuitePreviewSection`** en `marketing-comparison-table.tsx`: opruimkandidaten, niet in deze ronde.
- **De `OfferCatalog` is waarschijnlijk inert** voor zoekmachines: de Offers hebben geen `itemOffered` en de catalogus hangt niet aan een Service- of Product-node. De bedragen kloppen; of het iets oplevert is een aparte vraag.

---

## Omgeving, voor de volgende sessie

`frontend/node_modules` in de worktree raakte tijdens deze ronde **vijf keer** leeg of incompleet (`.bin` weg, `@jridgewell/sourcemap-codec` of `magic-string` weg), telkens zonder draaiend npm-proces. Symptoom: `npx vitest` faalt met "not recognized" of `ERR_MODULE_NOT_FOUND`. Herstel is `npm install` gevolgd door `git checkout -- package-lock.json` (`npm ci` weigert door een bekende lockfile-mismatch). Vermoedelijke oorzaak is een parallelle sessie in een andere worktree; houd er rekening mee en meet baselines opnieuw na een herstel.

Twee keer heeft een subagent bijna werk van een ander meegecommit doordat `git commit` zonder pathspec de hele index pakt, die in een gedeelde worktree ook andermans staged wijzigingen bevat. Beide keren teruggedraaid. **In een gedeelde worktree is `git commit -- <paden>` verplicht**; `git add -A` en `git commit -a` zijn dat niet waard.
