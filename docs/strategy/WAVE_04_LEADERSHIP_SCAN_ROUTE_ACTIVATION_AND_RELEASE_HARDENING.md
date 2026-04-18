# WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

## Title

Activate Leadership Scan as a bounded buyer-facing follow-on route only after portfolio clarity, trust framing, and release-hardening are explicit and green.

## Korte Summary

`WAVE_01` maakte Leadership Scan technisch uitvoerbaar binnen de bestaande runtime. `WAVE_02` maakte de interpretation layer methodisch scherper. `WAVE_03` trok de managementhandoff, eigenaar, first action en post-session route gelijk zodat Leadership nu als intern klantwaardige managementread kan functioneren. Wat nog ontbreekt is de buyer-facing releasebeslissing: Leadership staat publiek nog bewust dicht als gereserveerde future route, en dat is logisch zolang niet expliciet is bewezen dat publieke activatie de suite helderder maakt in plaats van diffuser.

Deze wave is daarom bewust geen nieuwe methodische of runtime-uitbreiding. `WAVE_04` gaat alleen over release-hardening en route-activatie:

- bepalen of Leadership Scan publiek live mag als begrensde `follow_on_route`
- copy, pricing, funnel en trust alignment scherp trekken op wat Leadership nu echt levert
- overlap met `TeamScan`, de `leadership`-factor, named leader verwachtingen en 360/performance-associaties expliciet afvangen
- regressietests uitvoeren op portfoliohelderheid voordat publieke activatie doorgaat

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: approved_for_execution
- Dependencies: `WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md` moet groen blijven
- Next allowed step after green completion: geen automatische volgende build wave; eerst expliciete suiteselectie of consolidatiebesluit

## Why This Wave Now

Deze wave volgt direct uit de huidige codebase:

- Leadership draait nu wel in de runtime als `scan_type = leadership`
- Leadership heeft nu een klantwaardige campaign page en managementhandoff
- buyer-facing staat Leadership nog bewust dicht:
  - [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) zet `leadership-scan` nu nog op `reserved_future`
  - [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) laat `/producten/leadership-scan` nog via `UpcomingProductPage` lopen
  - homepage, producten, tarieven en vertrouwen zijn nu geschreven voor de huidige live suite zonder publiek Leadership-aanbod

Dat maakt `WAVE_04` de eerstvolgende logische stap:

- niet opnieuw Leadership methodisch verbreden
- niet meteen een volgende productlijn openen
- eerst expliciet beslissen of Leadership publiek als bounded vervolgroute sterk genoeg, eerlijk genoeg en onderscheidend genoeg is

## Planned User Outcome

Na deze wave moet een buyer-facing bezoeker of eerste klantgesprek:

- Leadership Scan kunnen begrijpen als begrensde management-contextroute na een bestaand people-signaal
- direct zien wat Leadership wel en niet is
- Leadership niet verwarren met:
  - `TeamScan`
  - segment deep dive
  - named leader analyse
  - 360 of performance-assessment
- op pricing, trust en funnel dezelfde eerlijke productgrenzen terugzien als in de runtime

Wat deze wave nog niet hoeft te leveren:

- named leader output
- 360-, coaching- of performancepropositie
- nieuwe backend capabilities
- PDF/report voor Leadership
- entitlement- of billingverbreding
- nieuwe productlijn na Leadership

## Scope In

- publieke route-activatie van `leadership-scan` alleen als bounded `follow_on_route`
- buyer-facing copy-alignment met de huidige Leadership-runtime
- trust- en methodiekframing op basis van group-level, privacy-first, non-360 en non-performance grenzen
- pricing-, contactfunnel-, sitemap- en llms-alignment indien route-activatie doorgaat
- regressietests op portfoliohelderheid en semantisch onderscheid met `TeamScan`
- docs-update van deze wave en relevante source-of-truth pointers

## Scope Out

- named leader, hierarchy of 360-werk
- nieuwe Leadership-runtimefeatures
- PDF/reportgenerator
- scheduling, workflowstate of action-plan persistence
- nieuwe productlijnen of suite-expansie buiten Leadership
- herpositionering van ExitScan, RetentieScan, Pulse, TeamScan of Onboarding buiten wat nodig is voor portfoliohelderheid

## Dependencies

- [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md)
- [WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md)

## Execution Outcome

### 1. Leadership is now a bounded live follow-on route

- [x] `leadership-scan` staat in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) op `live`
- [x] `portfolioRole` staat nu op `follow_on_route`
- [x] de buyer-facing suite bevat Leadership nu expliciet als begrensde live vervolgronde

### 2. The route now resolves to a real bounded product page

- [x] `/producten/leadership-scan` loopt nu via een echte `LeadershipPage` in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [x] de buyer-facing site heeft nu een expliciete Leadership productpagina met bounded CTA-, trust- en comparison-copy

### 3. Suite messaging now includes Leadership without promoting it to a core route

- [x] homepage noemt Leadership nu als bounded vervolgronde naast Pulse, TeamScan en onboarding
- [x] `/producten` toont Leadership nu als live route binnen de follow-on laag
- [x] `/tarieven` en `/vertrouwen` kennen Leadership nu als actief vervolgproduct met expliciete non-360 en non-named-leader grens

## Key Changes

- Leadership kan in deze wave publiek live gaan als begrensde `follow_on_route`, maar alleen als de portfoliohelderheid sterker wordt van activatie.
- Marketingcopy, pricing en trust moeten exact dezelfde grenzen zeggen als de runtime nu waarmaakt.
- Leadership mag buyer-facing niet klinken als named leader, performance- of 360-product.
- Als die alignment niet overtuigend lukt, blijft Leadership bewust dicht als `reserved_future`.

Uitkomst van uitvoering:

- Leadership is publiek geactiveerd als begrensde `follow_on_route`
- de buyer-facing route blijft expliciet group-level only, privacy-first, non-360 en non-performance
- homepage, producten, tarieven, vertrouwen, funnel, sitemap en `llms.txt` zijn meegetrokken in dezelfde begrensde portfolioframing
- regressietests, build, typecheck, portfolio/API-pytests en buyer-facing smoke zijn groen

## Belangrijke Interfaces/Contracts

### 1. Buyer-Facing Route Contract

Als Leadership in deze wave live gaat, geldt:

- slug blijft `leadership-scan`
- status wordt `live`
- portfolio role wordt `follow_on_route`
- route blijft expliciet positioneerd als vervolgronde na een bestaand people-signaal

Beslissing:

- Leadership wordt geen `core_product`
- Leadership wordt geen publieke suite-anchor of bundle-onderdeel

### 2. Buyer-Facing Promise Contract

De publieke Leadership-belofte mag alleen claimen wat de runtime nu echt draagt:

- geaggregeerde managementread
- compacte managementhandoff
- eerste eigenaar
- begrensde eerste actie
- expliciete reviewgrens

Niet claimen:

- named leaders
- manager ranking
- 360 of coaching assessment
- bewijs van leiderschapskwaliteit
- performance- of causale claims

### 3. Trust and Methodology Contract

De trustlaag moet expliciet maken dat Leadership:

- group-level only is
- suppressie- en privacy-first blijft
- geen identity- of hierarchy-model heeft
- geen 360- of performanceproduct is

Beslissing:

- trustcopy wint bij twijfel van verkooppolish
- buyer-facing activatie mag de methodische grenzen niet zachter maken dan in de dashboardruntime

### 4. Portfolio Distinction Contract

Leadership moet buyer-facing duidelijk onderscheiden blijven van:

- `TeamScan` als department-first lokalisatie
- segment deep dive als beschrijvende verdieping
- de losse factor `leadership` in andere scans

Beslissing:

- publieke copy moet de centrale managementvraag van Leadership scherper maken dan de technische featurelijst
- als die onderscheidbaarheid niet sterk genoeg wordt, blijft de route dicht

### 5. Release Gate Contract

Publieke activatie is pas toegestaan als:

- homepage, producten, tarieven, vertrouwen en funnel coherent blijven
- regressietests groen zijn
- Leadership geen semantische portfoliolek of trustlek opent

Beslissing:

- release-hardening is onderdeel van deze wave, geen losse nazorg

## Primary Code Surfaces

### Existing Surfaces To Extend If Activation Proceeds

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/app/vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/app/sitemap.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/sitemap.ts)
- [frontend/public/llms.txt](/C:/Users/larsh/Desktop/Business/Verisight/frontend/public/llms.txt)

### Existing Behaviors To Keep

- Leadership runtime blijft campaign-centered en group-level only
- Leadership report route blijft bewust `422`
- Leadership blijft follow-on, niet core

## Work Breakdown

### Track 1 - Route Activation Decision

Tasks:

- [x] Bepaal of Leadership buyer-facing live mag gaan als `follow_on_route`.
- [x] Houd de suitevolgorde helder: Leadership mag niet de kernportfolio overschaduwen.
- [x] Laat de route dicht als copy en productgrens niet sterk genoeg aligned krijgen.

Definition of done:

- [x] Het is expliciet duidelijk of Leadership live gaat of bewust dicht blijft.
- [x] Die keuze is verdedigbaar vanuit de huidige runtime en portfolioarchitectuur.

### Track 2 - Marketing and Product Page Alignment

Tasks:

- [x] Werk de Leadership productpagina bij of activeer die buyer-facing.
- [x] Trek homepage-, producten- en prijzen-copy recht als Leadership live gaat.
- [x] Houd de buyer-facing beschrijving compact, onderscheidend en methodisch eerlijk.

Definition of done:

- [x] Leadership is publiek begrijpelijk zonder named leader- of 360-associatie.
- [x] De live suite wordt helderder en niet diffuser.

### Track 3 - Trust, Privacy, and Distinction Hardening

Tasks:

- [x] Maak de trustlaag expliciet over group-level, privacy-first en non-360 boundaries.
- [x] Maak het onderscheid met `TeamScan`, segment deep dive en de factor `leadership` expliciet.
- [x] Zorg dat funnel- en CTA-tekst geen bredere belofte maakt dan de runtime waarmaakt.

Definition of done:

- [x] Leadership heeft buyer-facing trustframing die gelijkloopt met de runtimegrenzen.
- [x] Semantische overlap met andere routes blijft beheerst.

### Track 4 - Regression, Docs, and Release Validation

Tasks:

- [x] Voeg regressietests toe of werk ze bij voor portfoliohelderheid en route-status.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer buyer-facing smoke-validatie uit op producten, tarieven, vertrouwen en Leadership zelf.

Definition of done:

- [x] Frontendtests, build en smoke zijn groen.
- [x] Docs zijn synchroon met de uiteindelijke publieke status van Leadership.

## Testplan

### Automated Tests

- [x] Leadership route-status klopt in marketingregistries.
- [x] Leadership buyer-facing copy blijft onderscheidbaar van `TeamScan`.
- [x] Leadership trustcopy bevat group-level, privacy- en non-360 grenzen.
- [x] Pricing en funnel introduceren geen ongewenste leadership bundle of core positioning.

### Integration Checks

- [x] `/producten/leadership-scan` toont ofwel een echte bounded productroute, of blijft bewust upcoming met expliciete reden.
- [x] `/producten` blijft logisch als suitescherm.
- [x] `/tarieven` en `/vertrouwen` blijven coherent met de live productgrenzen.
- [x] Leadership runtimeclaims en buyer-facing claims blijven aligned.

### Smoke Path

1. Open `/producten`.
2. Open `/producten/leadership-scan`.
3. Open `/tarieven`.
4. Open `/vertrouwen`.
5. Controleer dat:
   - Leadership logisch gepositioneerd is als bounded vervolgroute of bewust nog dicht blijft
   - named leader, 360 en performanceclaims nergens impliciet worden geopend
   - Leadership niet verward raakt met `TeamScan`
   - de rest van de suite coherent blijft

## Assumptions/Defaults

- Leadership is pas buyer-facing live verdedigbaar als bounded follow-on route.
- Buyer-facing activatie heeft alleen zin als de portfoliohelderheid toeneemt.
- Trust- en methodiekgrenzen zijn belangrijker dan extra commerciële breedte.
- Als activatie en eerlijkheid botsen, blijft Leadership bewust nog gesloten.

## Product Acceptance

- [x] Leadership is buyer-facing alleen live als het portfolio er helderder van wordt.
- [x] Bezoekers begrijpen wat Leadership wel en niet is.
- [x] Leadership klinkt niet als named leader of 360-product.

## Codebase Acceptance

- [x] Wijzigingen blijven begrensd tot marketing-, funnel- en release-hardening surfaces.
- [x] Geen nieuwe runtimearchitectuur of backendfeature wordt vooruit gebouwd.
- [x] Andere productroutes blijven intact.

## Runtime Acceptance

- [x] Leadership runtime blijft ongewijzigd en stabiel.
- [x] Leadership report blijft bewust buiten scope.
- [x] Buyer-facing activatie maakt geen claims die runtime niet waarmaakt.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Buyer-facing smoke is succesvol uitgevoerd.
- [x] Semantische overlap met `TeamScan` en 360/performanceframing blijft expliciet afgevangen.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke uitkomst.
- [x] `WAVE_03` blijft gesloten en groen.
- [x] Na afronding is duidelijk of Leadership live is gezet of bewust dicht is gebleven.

## Risks To Watch

- Leadership lijkt buyer-facing al snel groter of rijper dan de runtime werkelijk draagt.
- Leadership kan semantisch overlappen met `TeamScan` of named leader verwachtingen oproepen.
- Trustframing kan zachter worden in commerciële copy dan in productruntime.
- De suite kan te breed of catalogusachtig gaan voelen als Leadership te prominent wordt geactiveerd.

## Not In This Wave

- Geen named leader output
- Geen 360- of coachingproduct
- Geen Leadership PDF/report
- Geen nieuwe productlijn na Leadership
- Geen billing- of entitlementwerk

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] Leadership buyer-facing status expliciet en verdedigbaar is
- [x] Leadership product-, trust- en funnelcopy aligned zijn met de huidige runtime
- [x] portfoliohelderheid, tests, build en smoke groen zijn

## Validation Snapshot

- [x] `cmd /c npm test` -> `89 passed`
- [x] `cmd /c npx next typegen` -> groen
- [x] `cmd /c npm run build` -> groen
- [x] `cmd /c npx tsc --noEmit` -> groen
- [x] `.\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py tests/test_api_flows.py -q` -> `41 passed`
- [x] buyer-facing smoke -> `200` op `/producten`, `/producten/leadership-scan`, `/tarieven` en `/vertrouwen`

## Next Allowed Step

Na volledige green close-out van deze wave mag niet automatisch nog een nieuwe productlijn openen. Eerst is een expliciete suite- of consolidatiebeslissing nodig.
