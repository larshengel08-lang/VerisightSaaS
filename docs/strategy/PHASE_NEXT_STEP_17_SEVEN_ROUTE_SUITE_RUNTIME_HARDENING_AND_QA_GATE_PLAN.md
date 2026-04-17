# Phase Next Step 17 - Seven-Route Suite Runtime Hardening and QA Gate Plan

## Title

Refresh the runtime, regression, and QA gates for the current seven-route Verisight suite so live buyer-facing reality, runtime contracts, reports, funnel behavior, and tests stay aligned after Leadership Scan activation.

## Korte Summary

De eerdere runtime- en QA-gate in [PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md) was correct voor de toenmalige suite:

- vijf runtime `scan_type`-producten
- zes buyer-facing live routes
- geen publieke `Leadership Scan`

Sinds [WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md) klopt die QA-gate niet meer volledig met de live realiteit. De actuele suite heeft nu:

- zes runtime `scan_type`-producten: `exit`, `retention`, `pulse`, `team`, `onboarding`, `leadership`
- zeven buyer-facing live routes: `ExitScan`, `RetentieScan`, `Combinatie`, `Pulse`, `TeamScan`, `Onboarding 30-60-90`, `Leadership Scan`
- een follow-on laag die groter en gevoeliger is dan voorheen

De kernbeslissing van deze stap is daarom:

- de suite moet nu als zeven-route geheel opnieuw gehard worden over backend, frontend, marketing, funnel, reportgrenzen en regressies
- contractdrift die na Leadership zichtbaar is, telt nu als eersteklas consolidatierisico
- geen nieuwe expansion- of scale-up-track mag openen voordat deze geactualiseerde runtime- en QA-gate bestuurlijk expliciet is vastgezet

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The suite runtime is broader than the old QA gate assumed

De huidige codebase kent nu zes runtimeproducten:

- [types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts) ondersteunt `exit | retention | pulse | team | onboarding | leadership`
- [registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py) ondersteunt dezelfde set
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py) ondersteunt `scan_type = leadership` ook in `CampaignCreate`

De vorige QA-gate benoemde nog alleen de pre-Leadership suite. Daarmee is een refresh nu noodzakelijk.

### 2. Buyer-facing reality and backend contact contracts are no longer fully aligned

Na Leadership is er nu een concrete contractdrift zichtbaar:

- frontend funnel in [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) ondersteunt `leadership`
- maar backend `ContactRequestCreate.route_interest` in [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py) kent nog steeds alleen:
  - `exitscan`
  - `retentiescan`
  - `teamscan`
  - `onboarding`
  - `combinatie`
  - `nog-onzeker`

Dit is exact het type live contractdrift dat na Leadership zwaarder weegt dan nog een nieuwe productlijn openen.

### 3. Existing QA references now lag behind live suite reality

Ook bestaande regressieverwachtingen lopen nog achter:

- [test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py) verwijst nog naar de oude contact-route set zonder `leadership`
- de eerdere suite QA-gate benoemt nog geen buyer-facing smoke op `/producten/leadership-scan`
- de eerdere report boundary set benoemt `leadership` nog niet expliciet

Daarom moet de QA-governance eerst worden vernieuwd voordat verdere groei bestuurlijk weer open kan.

## Current Implementation Baseline

### 1. Current runtime product reality

- [x] backend `CampaignCreate.scan_type` ondersteunt `exit | retention | pulse | team | onboarding | leadership`
- [x] frontend `ScanType` ondersteunt `exit | retention | pulse | team | onboarding | leadership`
- [x] backend productregistry ondersteunt `exit`, `retention`, `pulse`, `team`, `onboarding`, `leadership`
- [x] frontend productregistry ondersteunt `exit`, `retention`, `pulse`, `team`, `onboarding`, `leadership`
- [x] de runtime blijft campaign-centered en kent nog geen control plane, billinglaag of artifact-engine

### 2. Current buyer-facing suite reality

- [x] `marketing-products.ts` kent zeven live buyer-facing routes
- [x] `Combinatie` blijft live route en geen runtime `scan_type`
- [x] `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` zijn live `follow_on_route`
- [x] de huidige publieke suite is dus groter dan de oude QA-gate veronderstelde

### 3. Current report boundary reality

- [x] `ExitScan` reportroute levert PDF
- [x] `RetentieScan` reportroute levert PDF
- [x] `Pulse` reportroute geeft bewust `422`
- [x] `TeamScan` reportroute geeft bewust `422`
- [x] `Onboarding 30-60-90` reportroute geeft bewust `422`
- [x] `Leadership Scan` reportroute geeft bewust `422`
- [x] deze asymmetrie is productbewust en geen open bug

### 4. Current funnel and contact contract reality

- [x] frontend funnel ondersteunt nu `leadership`
- [x] backend contact request schema ondersteunt `leadership` nog niet
- [x] daarmee bestaat nu een expliciete live contractdrift tussen buyer-facing keuze en backend ingest

### 5. Current QA reality

- [x] backend API- en portfolio-architectuurtests bestaan al
- [x] frontend marketing-, flow- en SEO-tests bestaan al
- [x] productspecifieke dashboardtests bestaan nu voor `pulse`, `team`, `onboarding` en `leadership`
- [x] build, typecheck, typegen en buyer-facing smoke zijn recent groen geweest voor de huidige suite

## Decision

### 1. Seven-Route Runtime Hardening Is Now Mandatory

Beslissing:

- runtime hardening is nu opnieuw verplicht voor de actuele zeven-route suite
- deze stap opent nog geen codewave
- deze stap bepaalt wel welke contracten en regressies nu niet meer stilzwijgend achter mogen lopen op de live suite

Rationale:

- de suite is nu breed genoeg dat kleine inconsistenties direct commerciële of operationele schade geven
- vooral live follow-on routes vragen strakke afstemming tussen "buyer-facing zichtbaar", "funnel kiest dit", "backend accepteert dit" en "QA bewaakt dit"

### 2. Registry Consistency Contract

De suite mag niet uit elkaar lopen tussen backend, frontend en schema-oppervlakken.

Beslissing:

- `scan_type`-ondersteuning moet consistent blijven tussen:
  - [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
  - [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
  - [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
  - [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
  - `supabase/schema.sql`
- `Combinatie` blijft expliciet buyer-facing route en geen runtime `scan_type`
- een nieuwe route of een nieuw `scan_type` mag niet informeel in een enkel oppervlak verschijnen

### 3. Funnel and Contact Contract Must Match Live Route Reality

Beslissing:

- live buyer-facing routekeuze in frontend funnel moet aansluiten op backend contact-ingest
- de volgende runtime hardening wave moet expliciet de mismatch rond `leadership` oppakken
- route-interest support moet consistent blijven tussen:
  - [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
  - [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
  - relevante API-tests

Niet toegestaan:

- buyer-facing route live laten terwijl backend lead-ingest die route niet formeel accepteert
- route-interest sets los van elkaar laten evolueren

### 4. Product Boundary Consistency Contract

De suite mag inhoudelijk ongelijk blijven waar dat bewust zo ontworpen is.

Beslissing:

- `ExitScan` en `RetentieScan` blijven de enige report-gedragen kernproducten
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven bounded follow-on producten met smallere output- en reportgrenzen
- het feit dat follow-on producten geen PDF-report ondersteunen blijft toegestaan en moet juist bewaakt worden

### 5. Report Support Contract

De reportsurface moet nu expliciet de actuele zes runtimeproducten afdekken.

Beslissing:

- `exit -> PDF ondersteund`
- `retention -> PDF ondersteund`
- `pulse -> 422 supported boundary`
- `team -> 422 supported boundary`
- `onboarding -> 422 supported boundary`
- `leadership -> 422 supported boundary`

Rationale:

- dit sluit aan op de huidige implementatie en voorkomt dat "live route" en "full report parity" door elkaar gaan lopen

### 6. Buyer-Facing Route and Funnel Contract

De publiek zichtbare suite en de contactfunnel moeten dezelfde routewerkelijkheid blijven vertellen.

Beslissing:

- live buyer-facing routes moeten consistent blijven tussen:
  - `frontend/lib/marketing-products.ts`
  - `frontend/app/producten/page.tsx`
  - `frontend/app/producten/[slug]/page.tsx`
  - `frontend/app/page.tsx`
  - `frontend/app/tarieven/page.tsx`
  - `frontend/app/vertrouwen/page.tsx`
  - `frontend/components/marketing/site-content.ts`
  - `frontend/lib/contact-funnel.ts`
  - `frontend/app/sitemap.ts`
  - `frontend/public/llms.txt`
- follow-on routes moeten in funnel en copy bounded blijven
- `ExitScan` blijft default first route in contactlogica

### 7. Regression Matrix Contract

De minimale regressieset moet nu de actuele suite afdekken.

Beslissing:

- minimaal te bewaken backend regressies:
  - `tests/test_api_flows.py`
  - `tests/test_portfolio_architecture_program.py`
  - productspecifieke scoringtests voor `pulse`, `team`, `onboarding`, `leadership`
- minimaal te bewaken frontend regressies:
  - `frontend/lib/marketing-positioning.test.ts`
  - `frontend/lib/marketing-flow.test.ts`
  - `frontend/lib/seo-conversion.test.ts`
  - productspecifieke dashboardtests voor `pulse`, `team`, `onboarding`, `leadership`
- minimale technische gates:
  - `npm test`
  - `npx next typegen`
  - `npx tsc --noEmit`
  - `npm run build`
  - relevante `pytest`-set

### 8. Smoke Matrix Contract

Naast tests moet er een kleine, expliciete smoke-matrix blijven bestaan.

Beslissing:

- publieke buyer-facing smoke moet minimaal afdekken:
  - `/`
  - `/producten`
  - `/producten/exitscan`
  - `/producten/retentiescan`
  - `/producten/combinatie`
  - `/producten/pulse`
  - `/producten/teamscan`
  - `/producten/onboarding-30-60-90`
  - `/producten/leadership-scan`
  - `/tarieven`
  - `/vertrouwen`
- runtime smoke moet minimaal de volgende productflows kunnen bevestigen:
  - `exit`: create -> import -> submit -> stats -> report `200`
  - `retention`: create -> submit -> stats -> report `200`
  - `pulse`: create -> submit -> stats -> report `422`
  - `team`: create -> import/submit -> stats -> report `422`
  - `onboarding`: create -> import/submit -> stats -> report `422`
  - `leadership`: create -> import/submit -> stats -> report `422`

Belangrijke nuance:

- helper- of API-driven smoke blijft toegestaan waar auth-protected dashboardroutes niet telkens handmatig doorlopen worden
- de bounded `422`-uitkomst telt expliciet als geldige smoke-uitkomst, niet als failure

### 9. No Premature Platform Broadening Contract

Runtime hardening mag nu nog steeds niet ontaarden in abstract platformwerk.

Beslissing:

- geen generieke control-plane, entitlement- of artifactlaag "voor later"
- geen multi-product orchestration puur om de suite formeler te maken
- geen nieuwe reportengine puur om contractsymmetrie af te dwingen

## Key Changes

- de runtime- en QA-governance wordt vernieuwd voor de actuele zeven-route suite
- `leadership` wordt nu expliciet meegenomen in scan type-, report-, smoke- en regressiecontracten
- funnel/contact drift wordt nu formeel benoemd als runtime hardening-onderwerp
- bewuste productasymmetrie wordt expliciet beschermd
- verdere expansion blijft geblokkeerd tot na deze vernieuwde gate

## Belangrijke Interfaces/Contracts

### 1. Scan Type Runtime Contract

- `scan_type = exit | retention | pulse | team | onboarding | leadership`
- `combination != runtime scan_type`
- backend, frontend en schema-oppervlakken moeten dezelfde runtime set blijven dragen

### 2. Report Support Contract

- `exit -> pdf`
- `retention -> pdf`
- `pulse -> 422 supported boundary`
- `team -> 422 supported boundary`
- `onboarding -> 422 supported boundary`
- `leadership -> 422 supported boundary`

### 3. Buyer-Facing Route Contract

Live route set:

- `exitscan`
- `retentiescan`
- `combinatie`
- `pulse`
- `teamscan`
- `onboarding-30-60-90`
- `leadership-scan`

### 4. Funnel Route-Interest Contract

Intended live route-interest set:

- `exitscan`
- `retentiescan`
- `teamscan`
- `onboarding`
- `leadership`
- `combinatie`
- `nog-onzeker`

Beslissing:

- frontend en backend moeten uiteindelijk dezelfde route-interest set weerspiegelen

### 5. QA Gate Contract

- backend regressieset moet groen blijven
- frontend regressieset moet groen blijven
- build/type gates moeten groen blijven
- smoke-uitkomsten moeten consistent blijven met de actuele productgrenzen

## Primary Reference Surfaces

- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)
- [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py)
- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)
- [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)
- [frontend/lib/seo-conversion.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-conversion.test.ts)

## Testplan

### Product acceptance

- [x] De huidige suite wordt behandeld als een samenhangend zeven-route geheel en niet als losse routes.
- [x] Bewuste verschillen tussen kernproducten en follow-on producten blijven expliciet toegestaan.
- [x] De actuele suite opent geen impliciete parity-belofte die de codebase nog niet draagt.

### Codebase acceptance

- [x] Het document sluit aan op de huidige runtime-, route- en reportcontractsituatie.
- [x] `Combinatie` blijft expliciet buiten de runtime `scan_type`-set.
- [x] Deze stap introduceert geen nieuw platformobject, nieuwe suite-engine of nieuwe buildwave.
- [x] Het document benoemt concrete contact/funnel-drift als huidige runtime-hardening input.

### Runtime acceptance

- [x] Registry-, route- en reportgrenzen zijn expliciet benoemd voor de actuele suite.
- [x] `leadership` is expliciet opgenomen in runtime- en reportcontracten.
- [x] Geen live runtimewijziging in deze stap.

### QA acceptance

- [x] De minimale regressiematrix is suitebreed vernieuwd.
- [x] De smoke-matrix maakt expliciet onderscheid tussen `200`- en `422`-verwachtingen, inclusief `leadership`.
- [x] De stap voorkomt dat verdere expansie opent zonder eerst runtime- en QA-discipline te verankeren voor de actuele live suite.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de runtime-hardening- en QA-gate van de zeven-route suite.
- [x] Het document sluit logisch aan op de post-Leadership suitefreeze en commerciële refresh.
- [x] De volgende toegestane stap is duidelijk begrensd.

## Assumptions/Defaults

- de grootste korte-termijnwinst zit nu in suitebetrouwbaarheid en contractdiscipline, niet in nog een extra route
- helper- en API-driven smoke is voorlopig voldoende waar auth-protected dashboardflows niet telkens handmatig worden doorlopen
- bewuste reportasymmetrie is een geldige productgrens en geen open issue
- contact/funnel-contractdrift is nu een eersteklas consolidatieprobleem en niet slechts een detailfout

## Next Allowed Step

De eerstvolgende toegestane stap is:

- een expliciete keuze tussen:
  - suite hardening implementation waves
  - controlled commercialization/scale-up hardening
  - of een latere, opnieuw geopende expansion-candidate gate

Er is nog geen automatische build permission voor een nieuwe productlijn.
