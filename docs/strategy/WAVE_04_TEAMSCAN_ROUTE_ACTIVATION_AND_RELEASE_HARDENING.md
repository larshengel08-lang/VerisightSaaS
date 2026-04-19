# WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

## Title

Activate TeamScan only as a controlled public follow-on route while protecting Verisight's current portfolio clarity, privacy posture, and distinction from Segment Deep Dive.

## Korte Summary

`WAVE_01` maakte TeamScan uitvoerbaar binnen de huidige runtime. `WAVE_02` voegde suppressie-aware lokalisatie en bounded prioritering toe. `WAVE_03` maakte de TeamScan-output klantwaardiger via expliciete managementhandoff, eerste eigenaar, begrensde eerste actie en reviewgrens.

Deze wave is nu uitgevoerd en heeft de buyer-facing laag gecontroleerd geopend:

- `teamscan` is verplaatst van `reserved_future` naar een bounded publieke `follow_on_route` in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- `/producten/teamscan` rendert nu als echte productroute in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- homepage, productoverzicht, tarieven, vertrouwen, sitemap, funnel en `llms.txt` zijn aligned op dezelfde bounded TeamScan-positie
- TeamScan wordt publiek expliciet verteld als department-first lokalisatieroute na een breder signaal, niet als brede teamscan, leiderschapsscan of vervanging van `Segment Deep Dive`

Status van deze wave:

- Wave status: completed_green
- Active source of truth: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md` moet groen blijven
- Next allowed wave after green completion: geen automatische vervolgwave; eerst expliciete suitestrategiekeuze

## Why This Wave Now

Na `WAVE_03` was TeamScan intern productmatiger geworden, maar extern nog bewust afgeschermd. Dat bleef gevoelig, omdat TeamScan makkelijker dan Pulse kan ontsporen in buyer-facing verwarring:

- het kan te makkelijk verward raken met een generieke teamscan of leiderschapsscan
- het kan commercieel te breed lijken ten opzichte van de huidige app-output
- het schuurt direct tegen bestaande `Segment Deep Dive`-logica op de marketinglaag
- het vraagt expliciete buyer-facing trustcopy rond suppressie, groepsgrenzen en niet-causale interpretatie

Daardoor was `WAVE_04` geen automatische marketingopenzet, maar een release-hardening wave:

- eerst expliciet toetsen of TeamScan publiek de suite helderder maakt
- daarna pas buyer-facing activatie op beperkte, gecontroleerde plekken
- geen activatie als die buyer-facing laag TeamScan sterker of diffuser maakt dan de runtime nu rechtvaardigt

## Planned User Outcome

Na deze wave kan een buyer:

- TeamScan zien als logische vervolgronde nadat een breder signaal al zichtbaar is
- begrijpen dat TeamScan helpt bepalen waar eerst lokale verificatie of actie logisch is
- TeamScan niet verwarren met een brede teamscan, leiderschapsscan of add-on zonder eigen managementvraag
- dezelfde bounded positionering terugzien op productroute, pricing, trust en productoverzicht

Nog steeds buiten scope:

- buyer-facing opening als nieuw kernproduct
- TeamScan als eerste wedge
- PDF/report-opening
- manager-, location- of multi-boundary activatie
- checkout, entitlementlogica of self-serve koopflow

## Scope In

- TeamScan buyer-facing activeren van `reserved_future` naar een gecontroleerde publieke route
- productdetailroute voor `/producten/teamscan` live zetten binnen de bestaande productdetailarchitectuur
- copy-alignering op homepage, productoverzicht, tarieven en vertrouwen waar TeamScan publiek relevant wordt
- expliciete afbakening ten opzichte van `Segment Deep Dive`, `Pulse`, `RetentieScan` en generieke team- of leiderschapsscans
- metadata, sitemap en eventuele discovery-surfaces alignen
- regressietests, smokevalidatie en trustchecks voor de publieke TeamScan-positie

## Scope Out

- nieuwe TeamScan-runtimefeatures
- nieuwe backend endpoints of artifacts
- manager- of locationboundaries
- TeamScan PDF/report-output
- workflow- of taakengine
- nieuwe portfolio-rollen of brede suitestructuurverbreding
- activatie van andere reserved routes

## Dependencies

- [PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md)
- [WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md)

## Key Changes

- TeamScan heeft buyer-facing alleen een bounded vervolgstatuut gekregen, geen kernproductstatus.
- `/producten/teamscan` is alleen geopend met de huidige department-first, privacy-first lokalisatielaag.
- bestaande reserved TeamScan-copy is vervangen door een productverhaal dat past bij de echte implementatie.
- pricing-, trust- en productoverzichtslagen tonen TeamScan nu zonder ExitScan, RetentieScan, Pulse en Combinatie diffuser te maken.
- regressies op `Segment Deep Dive`-verwarring zijn expliciet afgevangen in copy, funnel en tests.

## Belangrijke Interfaces/Contracts

### 1. Public Activation Contract

Als TeamScan publiek geactiveerd wordt, dan alleen als:

- bounded follow-on route
- niet als eerste route
- niet als kernproduct
- niet als generieke team- of leiderschapsscan

Beslissing:

- TeamScan blijft buyer-facing secundair aan een eerdere bredere managementread
- bij twijfel krijgt portfoliohelderheid voorrang boven extra zichtbaarheid

### 2. Marketing Product Status Contract

De huidige marketinglaag kent nu:

- `core_product`
- `portfolio_route`
- `follow_on_route`
- `future_reserved_route`

Beslissing voor deze wave:

- TeamScan gebruikt alleen een bestaande portfolio-rol
- de gekozen richting is `follow_on_route` als bounded lokalisatieroute
- er is geen nieuwe marketingrol toegevoegd puur voor TeamScan

### 3. Product Detail Contract

Als TeamScan publiek opent, dan moet `/producten/teamscan`:

- niet meer via `UpcomingProductPage` renderen
- binnen de bestaande productdetailarchitectuur blijven
- expliciet vertellen wanneer TeamScan logisch is en wanneer niet
- de huidige productgrenzen zichtbaar houden: `department`-first, privacy-first, geen manager ranking, geen causale bewijsclaim

### 4. Segment Deep Dive Distinction Contract

De buyer-facing laag moet expliciet blijven onderscheiden tussen:

- `Segment Deep Dive` als add-on/verdieping binnen bestaande productlijnen
- `TeamScan` als eigen lokalisatieroute na een breder signaal

Beslissing:

- TeamScan mag niet klinken als louter herlabelde segmentuitsplitsing
- `Segment Deep Dive` blijft buyer-facing herkenbaar als bestaand add-on patroon

### 5. Trust and Interpretation Contract

Als TeamScan buyer-facing zichtbaar wordt, dan moeten trustsurfaces expliciet blijven zeggen:

- groepsniveau en suppressie blijven leidend
- kleine teams of onveilige uitsplitsingen worden bewust niet getoond
- TeamScan prioriteert lokale verificatie en eerste actie
- TeamScan is geen oordeel over individuele managers of teamperformance

### 6. Pricing and Commercial Contract

Als TeamScan op pricinglagen verschijnt, dan alleen als:

- quote-only of op aanvraag
- bounded vervolgronde
- zonder self-serve indruk
- zonder prijsstructuur die het als nieuwe standaard instap suggereert

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [frontend/app/producten/[slug]/opengraph-image.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/opengraph-image.tsx)
- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/app/vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx)
- [frontend/app/sitemap.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/sitemap.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/components/marketing/public-footer.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/public-footer.tsx)
- [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)

### Test Surfaces

- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)
- [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)
- [frontend/lib/seo-conversion.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-conversion.test.ts)
- [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py)

## Work Breakdown

### Track 1 - Activation Decision and Portfolio Role

Tasks:

- [x] Beslis expliciet of TeamScan buyer-facing open mag na `WAVE_03`.
- [x] Leg vast welke bestaande portfolio-rol TeamScan krijgt zonder ExitScan, RetentieScan, Pulse en Combinatie te destabiliseren.
- [x] Houd alle andere reserved routes gesloten.

Definition of done:

- [x] TeamScan heeft een expliciet, coherent buyer-facing statuut.
- [x] De gekozen rol past binnen de huidige marketingarchitectuur zonder nieuwe taxonomie.

### Track 2 - TeamScan Route Activation

Tasks:

- [x] Activeer `/producten/teamscan` alleen als echte productroute wanneer de copy exact de huidige runtimegrenzen volgt.
- [x] Vervang de huidige reserved "samenwerking en dynamiek"-copy door lokalisatiecopy die aansluit op de echte implementatie.
- [x] Behoud de bestaande productdetailarchitectuur.

Definition of done:

- [x] TeamScan is buyer-facing bereikbaar als echte route.
- [x] De route leest als bounded lokalisatievervolg, niet als brede teamdiagnose.

### Track 3 - Commercial and Trust Alignment

Tasks:

- [x] Werk homepage-, producten-, pricing- en trustcopy bij waar TeamScan publiek relevant wordt.
- [x] Maak expliciet onderscheid tussen TeamScan, Segment Deep Dive, Pulse en bredere diagnoseproducten.
- [x] Zorg dat de site TeamScan niet sterker verkoopt dan de huidige output werkelijk draagt.

Definition of done:

- [x] Claims, trust en routekeuze zijn voor TeamScan aligned met de huidige runtime.
- [x] De commerciele positie van ExitScan en RetentieScan blijft scherp.

### Track 4 - SEO, Funnel, and Release Hardening

Tasks:

- [x] Werk metadata, sitemap en discovery-surfaces bij als TeamScan publiek opent.
- [x] Hard portfolio-, funnel- en SEO-tests af op de nieuwe TeamScan-status.
- [x] Voer buyer-facing smokevalidatie uit op producten, TeamScan, tarieven en vertrouwen.

Definition of done:

- [x] Een publieke TeamScan-route breekt geen bestaande SEO- of conversion-guardrails.
- [x] De buyer-facing flow blijft compact en coherent.

## Testplan

### Automated Tests

- [x] `marketing-products` weerspiegelt de nieuwe TeamScan-status correct.
- [x] Marketingpositioning-tests bewaken nog steeds de rol van ExitScan, RetentieScan, Combinatie, Pulse en TeamScan.
- [x] Marketingflow-tests bewaken nog steeds de primaire CTA- en routekeuzelogica.
- [x] SEO-tests blijven groen met de beperkte TeamScan-activatie.

### Integration Checks

- [x] `/producten/teamscan` rendert als echte route.
- [x] `/producten` communiceert TeamScan alleen als bounded vervolgroute.
- [x] Homepage-, trust- en pricinglagen blijven coherent na TeamScan-activatie.
- [x] Andere reserved routes blijven future-reserved.

### Smoke Path

1. Controleer `/producten`.
2. Controleer `/producten/teamscan`.
3. Controleer `/tarieven`.
4. Controleer `/vertrouwen`.
5. Bevestig overal dezelfde bounded TeamScan-positie en expliciete suppressie-/interpretatiegrenzen.

## Assumptions/Defaults

- TeamScan blijft smaller gepositioneerd dan de technische readiness op zichzelf zou toelaten.
- ExitScan blijft de primaire wedge en RetentieScan de complementaire kernroute.
- Pulse blijft de eerste live follow-on route; TeamScan komt buyer-facing alleen daarna in beeld als lokalisatielaag.
- `department` blijft de enige buyer-facing TeamScan-v1 boundary.
- Bij twijfel krijgt portfoliohelderheid en privacyframing voorrang boven extra zichtbaarheid.

## Validation Snapshot

- [x] `cmd /c npm test` -> groen (`16` testbestanden, `81` tests passed)
- [x] `cmd /c npx tsc --noEmit` -> groen
- [x] `cmd /c npm run build` -> groen
- [x] `.\.venv\Scripts\python.exe -m pytest tests/test_team_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py tests/test_customer_lifecycle_and_expansion_model.py -q` -> groen (`38 passed`)
- [x] Buyer-facing smoke op lokale devserver -> groen voor `/producten`, `/producten/teamscan`, `/tarieven` en `/vertrouwen`
- [x] TeamScan-contentcheck bevestigd via follow-up fetch; de eerste string-mismatch kwam door een te strikte smoke-assert en niet door een route- of renderfout

## Product Acceptance

- [x] TeamScan voelt publiek als logische lokalisatievervolgroute en niet als brede teamscan.
- [x] Buyers begrijpen hoe TeamScan zich verhoudt tot ExitScan, RetentieScan, Pulse en Segment Deep Dive.
- [x] De site belooft over TeamScan niet meer dan de huidige app werkelijk levert.

## Codebase Acceptance

- [x] Publieke TeamScan-activatie blijft begrensd tot marketing-, route- en releasehardening-oppervlakken.
- [x] Andere reserved routes blijven ongemoeid.
- [x] De activatie introduceert geen brede architectuurverbreding.

## Runtime Acceptance

- [x] TeamScan blijft in de app werken zoals na `WAVE_03`.
- [x] Buyer-facing activatie verandert geen backend- of dashboardcontracten.
- [x] TeamScan report/PDF blijft buiten scope.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Buyer-facing smokevalidatie is uitgevoerd.
- [x] Portfolio- en routeverwarring neemt niet toe.

## Documentation Acceptance

- [x] Dit wave-document is synchroon met de feitelijke implementatie.
- [x] `WAVE_03` blijft gesloten en groen.
- [x] `WAVE_04` is duidelijk als actieve source of truth voor releasehardening vastgelegd.

## Risks To Watch

- TeamScan kan commercieel alsnog te breed of te consultancy-achtig worden gemaakt in latere copyrondes.
- Buyer-facing verwarring met `Segment Deep Dive` is het grootste productspecifieke regressierisico.
- Een te vroege pricingvermelding kan TeamScan groter laten lijken dan de huidige bounded output rechtvaardigt.
- Trustcopy moet expliciet blijven over suppressie en niet-managergerichte interpretatie, anders ontstaat snel overselling.

## Not In This Wave

- Geen nieuwe TeamScan-runtimefeatures
- Geen manager- of locationondersteuning
- Geen TeamScan PDF/reportopening
- Geen checkout, billing of entitlementwerk
- Geen activatie van Onboarding 30-60-90 of andere reserved routes
- Geen brede suiteherstructurering

## Exit Gate

- [x] TeamScan buyer-facing alleen gecontroleerd en bounded geactiveerd
- [x] portfolio-, trust- en pricingcopy aligned met die activatie
- [x] regressies op Segment Deep Dive-verwarring expliciet afgevangen
- [x] tests en buyer-facing smokevalidatie groen
- [x] andere reserved routes gesloten gebleven

## Next Allowed Wave

Na deze green close-out volgt geen automatische volgende wave. De volgende stap moet opnieuw expliciet gekozen worden op basis van suitestrategie, commerciele feedback, buyer-response en productvolgorde.
