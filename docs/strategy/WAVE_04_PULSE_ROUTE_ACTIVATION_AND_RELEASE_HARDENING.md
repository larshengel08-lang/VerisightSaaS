# WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

## Title

Activate Pulse as a controlled public route while protecting Verisight's current portfolio clarity, pricing logic, and trust posture.

## Korte Summary

`WAVE_04` is uitgevoerd en gesloten als groene wave.

Pulse is nu buyer-facing actief, maar alleen als bounded vervolgroute:

- `pulse` staat in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) als `live` en `follow_on_route`
- `/producten/pulse` rendert nu een echte productervaring in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- homepage, productoverzicht, tarieven, trust-copy, sitemap en [llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt) zijn bijgewerkt op dezelfde Pulse-boundary
- ExitScan blijft de wedge, RetentieScan blijft de complementaire kernroute, Combinatie blijft portfolioroute, en andere reserved routes bleven gesloten

Status van deze wave:

- Wave status: completed_green
- Active source of truth: dit document
- Build permission: uitgevoerd
- Dependencies: `WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md` bleef groen
- Next allowed wave after green completion: later te beslissen op basis van suiteprioriteit

## Why This Wave Now

Na `WAVE_03` was Pulse productmatig sterk genoeg om publiek beoordeeld te worden, maar buyer-facing nog bewust afgeschermd. Deze wave sloot precies die spanning: publieke activatie zonder van Pulse een nieuw kernproduct, brede suiteclaim of nieuwe wedge te maken.

## Planned User Outcome

Na deze wave moet een buyer:

- Pulse kunnen zien als echte, maar begrensde vervolgroute
- begrijpen dat Pulse volgt op diagnose, baseline of eerste actie
- niet verward raken tussen ExitScan, RetentieScan, Pulse en Combinatie
- op product-, pricing- en trustlagen dezelfde positie terugzien

Nog steeds buiten scope:

- nieuwe Pulse-runtimefeatures
- checkout, billing of entitlements
- Pulse PDF/reportopening
- TeamScan of andere productactivaties

## Scope In

- Pulse publiek activeren van reserved route naar bounded follow-on route
- productdetailroute live zetten
- homepage-, producten-, tarieven- en trustcopy alignen
- metadata, sitemap en `llms.txt` alignen
- regressietests en smoke-validatie sluiten

## Scope Out

- nieuwe backend endpoints
- dashboardcontracten wijzigen
- brede suiteverbreding
- andere reserved routes openen

## Dependencies

- [PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md)
- [PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md)
- [PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md)
- [PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md)
- [PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md)
- [WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md)
- [WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md)

## Key Changes

- Pulse kreeg een nieuwe minimale marketingrol: `follow_on_route`
- `/producten/pulse` werd geactiveerd als echte productroute met bounded managementcopy
- `/producten` toont Pulse nu als vervolgroute, niet als derde kernproduct
- homepage, tarieven en vertrouwen benoemen Pulse nu alleen waar dat commercieel en methodisch klopt
- sitemap, OG en `llms.txt` zijn bijgewerkt zonder de compacte SEO-opzet te verbreden

## Belangrijke Interfaces/Contracts

### 1. Public Activation Contract

- [x] Pulse is publiek geactiveerd als gecontroleerde vervolgroute
- [x] Pulse is niet geopend als primaire eerste route
- [x] Pulse is niet geopend als derde kernproduct

### 2. Marketing Product Status Contract

- [x] `pulse.status = live`
- [x] `pulse.portfolioRole = follow_on_route`
- [x] andere reserved routes bleven `reserved_future`

### 3. Product Detail Contract

- [x] `/producten/pulse` rendert niet meer als `UpcomingProductPage`
- [x] de Pulse detailpagina blijft binnen de bestaande productdetailarchitectuur
- [x] de buyer-facing claim blijft gelijk aan de huidige runtimegrenzen

### 4. Portfolio Clarity Contract

- [x] ExitScan bleef primaire wedge
- [x] RetentieScan bleef complementaire kernroute
- [x] Combinatie bleef portfolioroute
- [x] Pulse werd expliciet onderscheiden van `RetentieScan ritme`

### 5. SEO and Conversion Contract

- [x] de publieke route bleef compact
- [x] de money-page logica bleef intact
- [x] Pulse kreeg alleen minimale metadata- en sitemapactivatie

## Primary Code Surfaces

### Existing Surfaces Extended

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

## Work Breakdown

### Track 1 - Activation Decision and Portfolio Role

Tasks:

- [x] Beslis expliciet of Pulse in de buyer-facing laag actief mag worden.
- [x] Leg vast welke portfolio-rol Pulse krijgt zonder ExitScan en RetentieScan te destabiliseren.
- [x] Houd alle andere reserved routes gesloten.

Definition of done:

- [x] Pulse heeft een expliciet, coherent portfolio-statuut.
- [x] Andere future routes bleven onaangeraakt en geblokkeerd.

### Track 2 - Pulse Route Activation

Tasks:

- [x] Activeer `/producten/pulse` als echte productroute.
- [x] Laat de route dezelfde bounded belofte vertellen als de app werkelijk levert.
- [x] Behoud de bestaande productdetailarchitectuur.

Definition of done:

- [x] Pulse is buyer-facing bereikbaar als echte route.
- [x] De route leest als vervolgroute, niet als brede nieuwe wedge.

### Track 3 - Commercial and Trust Alignment

Tasks:

- [x] Werk homepage-, producten-, pricing- en trustcopy bij waar Pulse publiek relevant is.
- [x] Maak expliciet onderscheid tussen `RetentieScan ritme` en `Pulse`.
- [x] Zorg dat de site niet sterker verkoopt dan de huidige Pulse-output werkelijk draagt.

Definition of done:

- [x] Claims, trust en routekeuze zijn voor Pulse aligned met de huidige runtime.
- [x] De commerciele positie van ExitScan en RetentieScan bleef scherp.

### Track 4 - SEO, Funnel, and Release Hardening

Tasks:

- [x] Werk metadata, sitemap en routegedrag bij.
- [x] Hard portfolio-, funnel- en SEO-tests af op de nieuwe Pulse-status.
- [x] Voer buyer-facing smoke-validatie uit op producten, Pulse, tarieven en vertrouwen.

Definition of done:

- [x] Publieke Pulse-route breekt geen bestaande SEO- of conversion-guardrails.
- [x] De buyer-facing flow bleef compact en coherent.

## Testplan

### Automated Tests

- [x] `marketing-products` weerspiegelt de nieuwe Pulse-status correct.
- [x] Marketingpositioning-tests bewaken nog steeds de rol van ExitScan, RetentieScan, Combinatie en Pulse.
- [x] Marketingflow-tests bewaken nog steeds de primaire CTA- en routekeuzelogica.
- [x] SEO-tests bleven groen met de beperkte Pulse-activatie.

### Integration Checks

- [x] `/producten/pulse` rendert als echte route.
- [x] `/producten` communiceert Pulse alleen als bounded vervolgroute.
- [x] Homepage-, trust- en pricinglagen blijven coherent na Pulse-activatie.
- [x] Andere reserved routes bleven future-reserved.

### Smoke Path

1. Controleer `/producten`.
2. Controleer `/producten/pulse`.
3. Controleer `/tarieven`.
4. Controleer `/vertrouwen`.
5. Bevestig overal dezelfde bounded Pulse-positie.

### Validation Snapshot

- [x] `cmd /c npm test` -> `75 passed`
- [x] `cmd /c npx tsc --noEmit` -> groen
- [x] `cmd /c npm run build` -> groen
- [x] `.\\.venv\\Scripts\\python.exe -m pytest tests/test_api_flows.py tests/test_pulse_scoring.py -q` -> `29 passed`
- [x] Buyer-facing smoke op `http://127.0.0.1:3003` -> groen voor `/producten`, `/producten/pulse`, `/tarieven` en `/vertrouwen`

## Assumptions/Defaults

- Pulse bleef smaller gepositioneerd dan de technische readiness op zichzelf zou toelaten.
- ExitScan bleef de primaire wedge.
- Bij twijfel kreeg portfoliohelderheid voorrang boven extra zichtbaarheid.
- TeamScan en alle andere reserved routes bleven dicht.

## Product Acceptance

- [x] Pulse voelt publiek als logische vervolgroute en niet als derde kernproduct.
- [x] Buyers begrijpen hoe Pulse zich verhoudt tot ExitScan en RetentieScan.
- [x] De site belooft over Pulse niet meer dan de huidige app werkelijk levert.

## Codebase Acceptance

- [x] Publieke Pulse-activatie bleef begrensd tot marketing-, route- en releasehardening-oppervlakken.
- [x] Andere reserved routes bleven ongemoeid.
- [x] De activatie introduceerde geen brede architectuurverbreding.

## Runtime Acceptance

- [x] Pulse bleef in de app werken zoals na `WAVE_03`.
- [x] Buyer-facing activatie veranderde geen backend- of dashboardcontracten.
- [x] Pulse report/PDF bleef buiten scope.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Buyer-facing smoke-validatie is uitgevoerd.
- [x] Portfolio- en routeverwarring is niet toegenomen.

## Documentation Acceptance

- [x] Dit wave-document is synchroon met de feitelijke implementatie.
- [x] `WAVE_03` bleef gesloten en groen.
- [x] `WAVE_04` is duidelijk als afgeronde source of truth vastgelegd.

## Risks To Watch

- Pulse kan commercieel alsnog te breed worden gemaakt in latere copyrondes.
- ExitScan mag zijn wedge-rol niet verliezen als Pulse meer zichtbaarheid krijgt.
- `RetentieScan ritme` en Pulse moeten ook in toekomstige pricingrondes scherp onderscheiden blijven.
- Verdere SEO-uitbreiding rond Pulse moet compact blijven.

## Not In This Wave

- Geen nieuwe Pulse-runtimefeatures
- Geen TeamScan-activatie
- Geen Onboarding 30-60-90-activatie
- Geen checkout, billing of entitlementwerk
- Geen brede suiteherstructurering

## Exit Gate

- [x] Pulse buyer-facing alleen gecontroleerd en bounded geactiveerd
- [x] portfolio-, trust- en pricingcopy aligned met die activatie
- [x] tests en buyer-facing smoke-validatie groen
- [x] andere reserved routes gesloten gebleven

## Next Allowed Wave

Na deze green close-out volgt geen automatische volgende wave. De volgende stap moet opnieuw expliciet gekozen worden op basis van suiteprioriteit, commerciele resultaten en productvolgorde.
