# WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

## Title

Activate onboarding only as a tightly bounded public follow-on route once the current assisted checkpoint product is strong enough to carry it without creating suite confusion, lifecycle oversell, or overlap with existing onboarding language.

## Korte Summary

`WAVE_01` maakte onboarding technisch uitvoerbaar binnen de huidige campaign-centered runtime. `WAVE_02` maakte de checkpointread methodisch scherper. `WAVE_03` maakte onboarding klantwaardiger via expliciete managementhandoff, owner, first action en reviewgrens.

Deze wave is nu uitgevoerd en heeft onboarding gecontroleerd buyer-facing geopend:

- onboarding is toegevoegd als bounded `follow_on_route` in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- `/producten/onboarding-30-60-90` rendert nu als echte productroute in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- homepage, producten, tarieven, vertrouwen, funnel, sitemap, footer en `llms.txt` vertellen nu dezelfde bounded onboarding-positie
- onboarding wordt publiek expliciet verteld als assisted single-checkpoint lifecycle-check en niet als client onboarding-tool, brede employee journey suite, retentievariant of self-serve product

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md` moet groen blijven
- Next allowed wave after green completion: geen automatische vervolgwave; eerst expliciete suitestrategiekeuze

## Why This Wave Now

Na `WAVE_03` is onboarding intern productmatig scherp genoeg om bestuurlijk te beoordelen op publieke activatie. Juist daar zit nu het risico:

- de repo gebruikt vandaag `onboarding` al als client-onboarding en adoptieterm
- de publieke suite noemt nu alleen `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en `Combinatie`
- onboarding raakt sneller dan Pulse of TeamScan aan brede employee-lifecycle verwachtingen
- te vroege buyer-facing opening kan Verisight laten lijken op een bredere EX-suite of onboardingplatform, terwijl de huidige runtime alleen een assisted single-checkpoint product draagt

Daardoor is `WAVE_04` geen simpele route-openzet, maar een release-hardening wave:

- eerst expliciet toetsen of onboarding publiek de suite helderder maakt
- daarna pas buyer-facing activatie op beperkte, gecontroleerde surfaces
- geen activatie als onboarding publiek groter, vager of softwarematiger gaat klinken dan het product nu echt is

## Planned User Outcome

Na deze wave kan een buyer:

- onboarding zien als logische vervolgronde voor vroege nieuwe-medewerker-signalen na een eerste bredere managementread of als aparte lifecyclevraag die bewust smaller is dan RetentieScan
- begrijpen dat onboarding nu een assisted single-checkpoint route is en geen brede `30-60-90` journey engine
- onboarding niet verwarren met client onboarding, Pulse, TeamScan of een algemene employee experience suite
- dezelfde bounded onboarding-positie terugzien op productroute, pricing, trust en contactfunnel

Nog steeds buiten scope:

- onboarding als nieuw kernproduct of primaire wedge
- multi-checkpoint orchestration
- hire-date, cohort- of schedulelogica
- onboarding PDF/report-opening
- self-serve checkout, entitlement of brede lifecycle platformclaims

## Scope In

- onboarding buyer-facing beoordelen en, alleen als de huidige output dat rechtvaardigt, activeren als gecontroleerde publieke route
- productdetailroute voor `/producten/onboarding-30-60-90` of de definitief gekozen onboarding-slug openen binnen de bestaande productdetailarchitectuur
- copy-alignering op homepage, productoverzicht, tarieven, vertrouwen en funnel waar onboarding publiek relevant wordt
- expliciete afbakening ten opzichte van client onboarding, `RetentieScan`, `Pulse`, `TeamScan` en brede employee-journey taal
- metadata, sitemap en discovery-surfaces alignen op dezelfde bounded onboarding-positie
- regressietests, smokevalidatie en trustchecks voor de publieke onboarding-positie

## Scope Out

- nieuwe onboarding-runtimefeatures
- multi-checkpoint onboardingflows
- hire-date, start-date of cohortdata-engine
- onboarding PDF/report-output
- nieuwe backend endpoints, task engines of lifecycle state machines
- brede suite-reframing buiten wat nodig is om onboarding eerlijk te positioneren
- activatie van extra reserved routes of andere nieuwe productlijnen

## Dependencies

- [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md)
- [WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md)

## Current Implementation Baseline

### 1. Onboarding is runtime-live and now buyer-facing bounded

- [x] `scan_type = onboarding` bestaat nu in backend en frontend registries
- [x] onboarding heeft een eigen productmodule, surveyflow, scoring en dashboardread
- [x] onboarding report/PDF blijft bewust begrensd
- [x] onboarding staat nu als bounded `follow_on_route` in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

### 2. Public portfolio now includes onboarding without moving the core wedge

- [x] huidige live marketingroutes zijn `ExitScan`, `RetentieScan`, `Combinatie`, `Pulse`, `TeamScan` en `Onboarding 30-60-90`
- [x] [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx) noemt onboarding nu expliciet als bounded lifecycle-vervolgroute
- [x] [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx) positioneert nu expliciet twee kernproducten, een portfolioroute en bounded vervolgroutes
- [x] onboarding is buyer-facing toegevoegd zonder kernproductstatus of nieuwe suite-taxonomie

### 3. Public pricing, trust, funnel and discovery now support the same onboarding boundary

- [x] [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx) noemt onboarding nu als quote-only lifecycle-route op aanvraag
- [x] [vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx) noemt onboarding nu expliciet in de publieke trustlaag
- [x] [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) en [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py) ondersteunen nu `route_interest = onboarding`
- [x] [sitemap.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/sitemap.ts) en [llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt) bevatten nu de onboardingroute

### 4. Product detail architecture now serves onboarding as a live bounded route

- [x] [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) rendert nu echte detailroutes voor `exitscan`, `retentiescan`, `pulse`, `teamscan`, `onboarding-30-60-90` en `combinatie`
- [x] onbekende of niet-geregistreerde producten vallen nog steeds buiten de live detailset
- [x] onboarding gebruikt nu een expliciete lifecycle-detailroute zonder de bestaande productdetailarchitectuur te verbreden

## Key Changes

- onboarding krijgt in deze wave hoogstens een bounded publieke vervolgstatuut, geen kernproductstatus
- de publieke slug en productdetailroute mogen alleen openen met de huidige assisted single-checkpoint boundary
- bestaande afwezigheid van onboarding op homepage, pricing, trust, funnel en discovery wordt alleen aangepast als dezelfde compacte productpositie overal vol te houden is
- publieke onboardingcopy moet expliciet onderscheiden tussen:
  - client onboarding van Verisight als implementatieproces
  - onboarding als lifecycle-meetroute voor nieuwe medewerkers
  - bredere retentie- of employee journey claims die nu nog niet gedragen worden
- regressies op suiteverwarring moeten expliciet worden afgevangen in copy, funnel en tests

## Belangrijke Interfaces/Contracts

### 1. Public Activation Contract

Als onboarding publiek geactiveerd wordt, dan alleen als:

- bounded follow-on of aparte lifecycle route binnen de bestaande suite
- niet als primaire wedge
- niet als brede onboardingsoftware
- niet als employee journey of `30-60-90` automation suite

Beslissing:

- onboarding blijft buyer-facing secundair aan de huidige kernportfolio
- bij twijfel krijgt portfoliohelderheid voorrang boven extra zichtbaarheid

### 2. Marketing Product Status Contract

De huidige marketinglaag kent nu:

- `core_product`
- `portfolio_route`
- `follow_on_route`
- `future_reserved_route`

Beslissing voor deze wave:

- onboarding gebruikt alleen een bestaande portfolio-rol
- de voorkeursrichting is een bounded `follow_on_route`, niet een nieuwe taxonomielaag
- er wordt geen nieuwe marketingrol toegevoegd puur om onboarding te kunnen openen

### 3. Onboarding Detail Route Contract

Als onboarding publiek opent, dan moet de productdetailroute:

- binnen de bestaande productdetailarchitectuur blijven
- expliciet vertellen wanneer onboarding logisch is en wanneer niet
- zichtbaar begrenzen dat v1 nu assisted en single-checkpoint is
- geen brede `30-60-90`, cohort-, hire-date of automationclaim introduceren

### 4. Semantic Distinction Contract

De buyer-facing laag moet expliciet onderscheid houden tussen:

- client onboarding als implementatie/adoptieproces
- onboarding als nieuwe-medewerker checkpointscan
- `RetentieScan` als bredere behoudsroute
- `Pulse` als hercheckroute
- `TeamScan` als lokale verificatieroute

Beslissing:

- onboarding mag niet klinken als simpele herlabeling van bestaande adoption-language
- onboarding mag ook niet als smalle RetentieScan-variant verkocht worden

### 5. Trust and Interpretation Contract

Als onboarding buyer-facing zichtbaar wordt, dan moeten trustsurfaces expliciet blijven zeggen:

- groepsniveau en assisted interpretatie blijven leidend
- het product leest een checkpoint en geen volledige journey
- onboarding is geen performance-, manager- of retentiepredictietool
- verdere vervolgactie blijft bounded en managementgericht

### 6. Pricing and Funnel Contract

Als onboarding op pricing- of contactlagen verschijnt, dan alleen als:

- op aanvraag of quote-only
- zonder self-serve indruk
- zonder pakketstructuur die onboarding als standaard eerste instap suggereert
- met contactfunnelcopy die de juiste routekeuze beschermt in plaats van suiteverwarring vergroot

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
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)

### Test Surfaces

- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)
- [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)
- [frontend/lib/seo-conversion.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-conversion.test.ts)
- [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py)

## Implementation Snapshot

- onboarding is publiek geactiveerd als bounded `follow_on_route` via [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- `/producten/onboarding-30-60-90` rendert nu als echte productroute in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- homepage, productoverzicht, tarieven, vertrouwen, footer, sitemap en `llms.txt` zijn aligned in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx), [producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx), [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx), [vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx), [public-footer.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/public-footer.tsx), [sitemap.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/sitemap.ts) en [llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)
- trust-, pricing- en funnelgrenzen zijn doorgetrokken in [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts), [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) en [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- onboarding blijft buyer-facing expliciet begrensd als assisted single-checkpoint lifecycle-check zonder client onboarding-tool, journey-engine of retentiepredictie

## Validation Snapshot

- [x] `cmd /c npm test` -> groen (`17` testbestanden, `85` tests passed)
- [x] `cmd /c npx next typegen` -> groen
- [x] `cmd /c npx tsc --noEmit` -> groen
- [x] `cmd /c npm run build` -> groen
- [x] `.\.venv\Scripts\python.exe -m pytest tests/test_onboarding_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py -q` -> groen (`40 passed`)
- [x] buyer-facing smoke op lokale devserver -> groen voor `/producten`, `/producten/onboarding-30-60-90`, `/tarieven` en `/vertrouwen`

## Work Breakdown

### Track 1 - Activation Decision and Portfolio Role

Tasks:

- [x] Beslis expliciet of onboarding buyer-facing open mag na `WAVE_03`.
- [x] Leg vast welke bestaande portfolio-rol onboarding krijgt zonder ExitScan, RetentieScan, Pulse, TeamScan en Combinatie te destabiliseren.
- [x] Houd alle andere reserved routes en niet-bestaande lifecycle-extensies gesloten.

Definition of done:

- [x] onboarding heeft een expliciet en coherent buyer-facing statuut
- [x] de gekozen rol past binnen de huidige marketingarchitectuur zonder nieuwe taxonomie
- [x] onboarding opent niet impliciet als bredere suiteclaim

### Track 2 - Onboarding Route Activation

Tasks:

- [x] Voeg onboarding pas toe aan de marketing product registry wanneer de copy exact de huidige runtimegrenzen volgt.
- [x] Open de gekozen onboarding-slug als echte productroute binnen de bestaande detailarchitectuur.
- [x] Vervang afwezigheid of eventuele placeholdercopy door lifecyclecopy die aansluit op de echte assisted implementatie.
- [x] Houd de bestaande productdetailarchitectuur en live productset compact.

Definition of done:

- [x] onboarding is buyer-facing bereikbaar als echte route of expliciet nog gesloten op basis van deze wavebeslissing
- [x] de route leest als bounded lifecycle-vervolg, niet als brede employee journey propositie
- [x] de route blijft onderscheidend ten opzichte van client onboarding

### Track 3 - Commercial and Trust Alignment

Tasks:

- [x] Werk homepage-, producten-, pricing-, trust- en footercopy bij waar onboarding publiek relevant wordt.
- [x] Maak expliciet onderscheid tussen onboarding, client onboarding, RetentieScan, Pulse en TeamScan.
- [x] Zorg dat de site onboarding niet sterker verkoopt dan de huidige app-output werkelijk draagt.
- [x] Voeg onboarding alleen aan de contactfunnel toe als de routekeuzelogica daardoor scherper wordt en niet diffuser.

Definition of done:

- [x] claims, trust en routekeuze zijn voor onboarding aligned met de huidige runtime
- [x] de commerciële positie van ExitScan en RetentieScan blijft scherp
- [x] onboarding voelt als aanvulling op de suite, niet als brede herpositionering ervan

### Track 4 - SEO, Funnel, and Release Hardening

Tasks:

- [x] Werk metadata, sitemap, `llms.txt` en discovery-surfaces bij als onboarding publiek opent.
- [x] Hard portfolio-, funnel- en SEO-tests af op de gekozen onboarding-status.
- [x] Voer buyer-facing smokevalidatie uit op producten, onboarding, tarieven en vertrouwen.
- [x] Bevestig dat client-onboarding taal niet onbedoeld vervuild raakt door de nieuwe publieke route.

Definition of done:

- [x] een publieke onboardingroute breekt geen bestaande SEO- of conversion-guardrails
- [x] de buyer-facing flow blijft compact en coherent
- [x] onboarding veroorzaakt geen verwarring tussen implementatie-onboarding en productonboarding

## Testplan

### Automated Tests

- [x] `marketing-products` weerspiegelt de gekozen onboarding-status correct
- [x] marketingpositioning-tests bewaken nog steeds de rol van ExitScan, RetentieScan, Combinatie, Pulse, TeamScan en onboarding
- [x] marketingflow-tests bewaken nog steeds de primaire CTA- en routekeuzelogica
- [x] SEO-tests blijven groen met de beperkte onboarding-activatie of met de expliciete niet-activatie

### Integration Checks

- [x] de gekozen onboarding detailroute rendert correct binnen de productarchitectuur
- [x] `/producten` communiceert onboarding alleen als bounded lifecycle-vervolgroute
- [x] homepage-, trust- en pricinglagen blijven coherent na onboardingbeslissing
- [x] andere reserved routes en suitegrenzen blijven intact

### Smoke Path

1. Controleer `/producten`.
2. Controleer de onboarding productroute of bevestig expliciet dat die bewust nog dicht blijft.
3. Controleer `/tarieven`.
4. Controleer `/vertrouwen`.
5. Controleer de kennismakingsfunnel.
6. Bevestig overal dezelfde bounded onboarding-positie en expliciete lifecycle-/interpretatiegrenzen.

## Assumptions/Defaults

- onboarding blijft smaller gepositioneerd dan de term `30-60-90` op zichzelf zou kunnen suggereren
- ExitScan blijft de primaire wedge en RetentieScan de complementaire kernroute
- Pulse en TeamScan blijven de bestaande live follow-on routes; onboarding mag die publieke logica niet diffuus maken
- onboarding v1 blijft assisted en `single_checkpoint_per_campaign`
- bij twijfel krijgen portfoliohelderheid, trustframing en semantische scherpte voorrang boven extra zichtbaarheid

## Product Acceptance

- [x] onboarding voelt publiek als logische lifecycle-vervolgroute en niet als brede onboarding- of employee-journey suite
- [x] buyers begrijpen hoe onboarding zich verhoudt tot client onboarding, RetentieScan, Pulse en TeamScan
- [x] de site belooft over onboarding niet meer dan de huidige app werkelijk levert

## Codebase Acceptance

- [x] publieke onboarding-activatie blijft begrensd tot marketing-, route- en releasehardening-oppervlakken
- [x] andere reserved routes en bestaande live routes blijven inhoudelijk intact
- [x] de activatie introduceert geen brede architectuurverbreding

## Runtime Acceptance

- [x] onboarding blijft in de app werken zoals na `WAVE_03`
- [x] buyer-facing activatie verandert geen backend- of dashboardcontracten
- [x] onboarding report/PDF en multi-checkpoint logica blijven buiten scope

## QA Acceptance

- [x] relevante tests zijn groen
- [x] buyer-facing smokevalidatie is uitgevoerd
- [x] portfolio- en routeverwarring neemt niet toe
- [x] client-onboarding en productonboarding blijven semantisch gescheiden

## Documentation Acceptance

- [x] dit wave-document is synchroon met de feitelijke implementatie van deze wave zodra die wordt uitgevoerd
- [x] `WAVE_03` blijft gesloten en groen
- [x] `WAVE_04` is duidelijk als actieve source of truth voor onboarding releasehardening vastgelegd

## Risks To Watch

- onboarding kan commercieel te groot gaan klinken als `30-60-90` publiek te breed wordt gelezen
- de grootste semantische regressie is overlap met bestaande client-onboarding taal
- publieke activatie kan Verisight te veel richting brede lifecycle suite trekken
- pricing- of funnelcopy kan onboarding te vroeg als standaard eerste route laten lijken
- trustcopy moet expliciet blijven over checkpoint-, groeps- en interpretatiegrenzen, anders ontstaat snel oversell

## Not In This Wave

- Geen nieuwe onboarding-runtimefeatures
- Geen multi-checkpoint, hire-date of cohortondersteuning
- Geen onboarding PDF/reportopening
- Geen self-serve checkout, billing of entitlementwerk
- Geen brede EX-suite reframing
- Geen activatie van andere reserved routes of nieuwe productlijnen

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] onboarding buyer-facing alleen gecontroleerd en bounded is geactiveerd of expliciet bewust gesloten is gehouden op basis van de release-hardening toets
- [x] portfolio-, trust-, pricing- en funnelcopy aligned zijn met die onboardingbeslissing
- [x] regressies op client-onboarding overlap en brede lifecycle-oversell expliciet zijn afgevangen
- [x] tests en buyer-facing smokevalidatie groen zijn
- [x] de huidige live suite helder en coherent is gebleven

## Next Allowed Wave

Na deze green close-out volgt geen automatische volgende wave. De volgende stap moet opnieuw expliciet gekozen worden op basis van suitestrategie, commerciële feedback, buyer-response en de gewenste volgorde na onboarding.
