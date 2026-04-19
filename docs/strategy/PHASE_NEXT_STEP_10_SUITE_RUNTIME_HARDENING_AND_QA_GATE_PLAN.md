# Phase Next Step 10 - Suite Runtime Hardening and QA Gate Plan

## Title

Lock the runtime, regression, and QA gates for the current Verisight suite before any new expansion candidate, scale-up track, or broad platform work is allowed.

## Korte Summary

Na `PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md` is de commerciele suitehierarchie vastgezet. Deze stap doet hetzelfde aan de uitvoeringskant:

- welke runtime-contracten nu hard bewaakt moeten worden
- welke registry-, route- en reportgrenzen consistent moeten blijven
- welke regressieset minimaal groen moet blijven voor de huidige suite
- welke smoke-matrix nodig is voor de vijf runtime-producten en zes buyer-facing routes
- welke verschillen bewust mogen blijven bestaan en dus niet per ongeluk als bug of incomplete suite worden behandeld

De kernbeslissing van deze stap is:

- de volgende track is runtime hardening en QA-discipline, niet nieuwe productverbreding
- de huidige suite moet nu als een geheel bewaakt worden over backend, frontend, marketing, funnel, reports en tests
- de bewust ongelijke productgrenzen blijven leidend
- geen nieuwe expansion candidate mag openen voordat deze runtime- en QA-gate bestuurlijk expliciet is vastgezet

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige codebase heeft nu voor het eerst tegelijk:

- vijf actieve runtime `scan_type`-producten: `exit`, `retention`, `pulse`, `team`, `onboarding`
- zes buyer-facing live routes: `ExitScan`, `RetentieScan`, `Combinatie`, `Pulse`, `TeamScan`, `Onboarding 30-60-90`
- meerdere productmodules in backend en frontend
- meerdere bounded follow-on routes die bewust niet dezelfde output- en reportgrenzen hebben
- een bredere marketing-, funnel- en trustlaag die de suite als geheel moet blijven uitleggen

Daarmee verschuift het primaire risico:

- minder risico op "we hebben nog te weinig producten"
- meer risico op contractdrift tussen runtime, copy, funnel en tests
- meer risico dat een route live is in marketing maar niet goed bewaakt wordt in runtime of QA
- meer risico dat bewuste productgrenzen later onbedoeld worden gladgetrokken

Deze stap voorkomt dat door nu vast te zetten wat de minimale suite-hardening is voordat opnieuw naar nieuwe uitbreiding of scale-up gekeken mag worden.

## Current Implementation Baseline

### 1. Current runtime product reality

- [x] backend `CampaignCreate.scan_type` ondersteunt `exit | retention | pulse | team | onboarding`
- [x] frontend `ScanType` ondersteunt `exit | retention | pulse | team | onboarding`
- [x] backend productregistry ondersteunt `exit`, `retention`, `pulse`, `team`, `onboarding`
- [x] frontend productregistry ondersteunt `exit`, `retention`, `pulse`, `team`, `onboarding`
- [x] de runtime blijft campaign-centered en kent nog geen suite control plane, entitlementlaag of artifact-engine

### 2. Current buyer-facing suite reality

- [x] `marketing-products.ts` kent zes live routes
- [x] `Combinatie` is live als route en niet als runtime `scan_type`
- [x] `Pulse`, `TeamScan` en `Onboarding 30-60-90` zijn live als bounded `follow_on_route`
- [x] contactfunnel ondersteunt nu `exitscan`, `retentiescan`, `teamscan`, `onboarding`, `combinatie`, `nog-onzeker`

### 3. Current report boundary reality

- [x] `ExitScan` reportroute levert PDF
- [x] `RetentieScan` reportroute levert PDF
- [x] `Pulse` reportroute geeft bewust `422`
- [x] `TeamScan` reportroute geeft bewust `422`
- [x] `Onboarding 30-60-90` reportroute geeft bewust `422`
- [x] deze asymmetrie is nu productbewust en geen open regressie

### 4. Current QA reality

- [x] backend API- en portfolio-architectuurtests bestaan al
- [x] frontend marketing- en positioneringstests bestaan al
- [x] productspecifieke frontend dashboardtests bestaan voor follow-on producten
- [x] build, typecheck en typegen zijn recent groen geweest voor de huidige suite
- [x] buyer-facing smoke is recent gedaan op publieke routes

## Decision

### 1. Suite Runtime Hardening Is Now Mandatory

De huidige suite moet nu behandeld worden als een samenhangend productoppervlak met verplichte contractbewaking.

Beslissing:

- runtime hardening is nu de eerstvolgende noodzakelijke discipline
- deze stap opent nog geen nieuwe codewave
- deze stap bepaalt wel welke contracten en regressies voortaan niet meer stilzwijgend mogen verschuiven

Rationale:

- de suite is nu breed genoeg dat kleine inconsistenties snel commerciele of methodische schade kunnen geven
- vooral follow-on routes vragen scherpe begrenzing tussen "bestaat", "werkt", "is buyer-facing live" en "ondersteunt report"

### 2. Registry Consistency Contract

De suite mag niet uit elkaar lopen tussen backend, frontend en database-/schemaoppervlakken.

Beslissing:

- `scan_type`-ondersteuning moet consistent blijven tussen:
  - `backend/schemas.py`
  - `backend/products/shared/registry.py`
  - `frontend/lib/types.ts`
  - `frontend/lib/products/shared/registry.ts`
  - `supabase/schema.sql`
- `Combinatie` blijft expliciet buyer-facing route en geen runtime `scan_type`
- een nieuwe route of een nieuw `scan_type` mag niet informeel in een enkel oppervlak verschijnen

Niet toegestaan:

- nieuw runtime product alleen in frontend of alleen in backend registreren
- buyer-facing route live zetten zonder passend registry- en funnelcontract
- `Combinatie` ongemerkt naar runtime-product opwaarderen

### 3. Product Boundary Consistency Contract

De huidige suite mag inhoudelijk ongelijk blijven waar dat bewust zo ontworpen is.

Beslissing:

- `ExitScan` en `RetentieScan` blijven de enige huidige report-gedragen kernproducten
- `Pulse`, `TeamScan` en `Onboarding 30-60-90` blijven bounded follow-on producten met smallere outputgrenzen
- het feit dat follow-on producten nu geen PDF-report ondersteunen blijft toegestaan en moet juist bewaakt worden

Niet toegestaan:

- follow-on producten behandelen alsof incomplete reportondersteuning per definitie bugged is
- copy of funnel al laten impliceren dat elke live route dezelfde artifactlaag heeft
- de kernproducten semantisch verlagen om alle routes uniform te laten lijken

### 4. Report Support Contract

De reportsurface moet expliciet contractueel bewaakt worden.

Beslissing:

- `exit` -> PDF ondersteund
- `retention` -> PDF ondersteund
- `pulse` -> `422` supported boundary
- `team` -> `422` supported boundary
- `onboarding` -> `422` supported boundary

Rationale:

- dit sluit aan op de huidige implementatie en voorkomt dat "live route" en "full report parity" door elkaar gaan lopen

### 5. Buyer-Facing Route and Funnel Contract

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

Niet toegestaan:

- publieke route live zonder contact- of CTA-alignment
- contactroute ondersteunen zonder publieke of portfolio-uitleg
- follow-on route als nieuwe default first route laten landen zonder aparte decision-step

### 6. Regression Matrix Contract

Er hoort nu een minimale suiteset te zijn die groen moet blijven voordat verdere uitbreiding bestuurlijk weer open mag.

Beslissing:

- minimaal te bewaken backend regressies:
  - `tests/test_api_flows.py`
  - `tests/test_portfolio_architecture_program.py`
  - productspecifieke scoringtests voor `pulse`, `team`, `onboarding`
- minimaal te bewaken frontend regressies:
  - `frontend/lib/marketing-positioning.test.ts`
  - `frontend/lib/marketing-flow.test.ts`
  - `frontend/lib/seo-conversion.test.ts`
  - productspecifieke dashboardtests voor `pulse`, `team`, `onboarding`
- minimale technische gates:
  - `npm test`
  - `npx next typegen`
  - `npx tsc --noEmit`
  - `npm run build`
  - relevante `pytest`-set

### 7. Smoke Matrix Contract

Naast tests moet er een kleine, heldere smoke-matrix blijven bestaan.

Beslissing:

- publieke buyer-facing smoke moet minimaal de volgende routes afdekken:
  - `/`
  - `/producten`
  - `/producten/exitscan`
  - `/producten/retentiescan`
  - `/producten/combinatie`
  - `/producten/pulse`
  - `/producten/teamscan`
  - `/producten/onboarding-30-60-90`
  - `/tarieven`
  - `/vertrouwen`
- runtime smoke moet minimaal de volgende productflows kunnen bevestigen:
  - `exit`: create -> import -> submit -> stats -> report `200`
  - `retention`: create -> submit -> stats -> report `200`
  - `pulse`: create -> submit -> stats -> report `422`
  - `team`: create -> import/submit -> stats -> report `422`
  - `onboarding`: create -> import/submit -> stats -> report `422`

Belangrijke nuance:

- helper- of API-driven smoke blijft toegestaan waar auth-protected dashboardroutes niet telkens handmatig doorlopen worden
- de bounded `422`-uitkomst telt hier expliciet als geldige smoke-uitkomst, niet als failure

### 8. No Premature Platform Broadening Contract

Runtime hardening mag niet ontaarden in abstract platformwerk.

Beslissing:

- geen generieke control-plane, entitlement- of artifactlaag "voor later"
- geen nieuwe multi-product orchestration puur om de suite formeler te maken
- geen nieuwe reportengine puur om contractsymmetrie af te dwingen

Rationale:

- de huidige suite vraagt nu discipline, niet abstractie

## Key Changes

- de suite krijgt nu een harde runtime- en QA-governancegrens
- registry-, funnel-, route- en reportcontracten worden als een geheel behandeld
- bewuste productasymmetrie wordt expliciet beschermd
- de minimale regressiematrix wordt suitebreed benoemd
- verdere uitbreiding blijft geblokkeerd tot na deze gate en een volgende expliciete expansion-candidate beslissing

## Belangrijke Interfaces/Contracts

### 1. Scan Type Runtime Contract

- `scan_type = exit | retention | pulse | team | onboarding`
- `combination != runtime scan_type`
- backend, frontend en schema-oppervlakken moeten dezelfde runtime set blijven dragen

### 2. Report Support Contract

- `exit -> pdf`
- `retention -> pdf`
- `pulse -> 422 supported boundary`
- `team -> 422 supported boundary`
- `onboarding -> 422 supported boundary`

### 3. Buyer-Facing Route Contract

- live route set:
  - `exitscan`
  - `retentiescan`
  - `combinatie`
  - `pulse`
  - `teamscan`
  - `onboarding-30-60-90`
- funnel route-interest set:
  - `exitscan`
  - `retentiescan`
  - `teamscan`
  - `onboarding`
  - `combinatie`
  - `nog-onzeker`

### 4. QA Gate Contract

- backend regression set must stay green
- frontend regression set must stay green
- build/type gates must stay green
- smoke outcomes must stay consistent with current product boundaries

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

- [x] De huidige suite wordt behandeld als een samenhangend geheel en niet als losse routes.
- [x] Bewuste verschillen tussen kernproducten en follow-on producten blijven expliciet toegestaan.
- [x] De huidige suite opent geen impliciete parity-belofte die de codebase nog niet draagt.

### Codebase acceptance

- [x] Het document sluit aan op de huidige runtime- en routecontractsituatie.
- [x] `Combinatie` blijft expliciet buiten de runtime `scan_type`-set.
- [x] Deze stap introduceert geen nieuw platformobject, nieuwe suite-engine of nieuwe buildwave.

### Runtime acceptance

- [x] Registry- en routegrenzen zijn expliciet benoemd.
- [x] Reportgrenzen zijn expliciet benoemd.
- [x] Geen live runtimewijziging in deze stap.

### QA acceptance

- [x] De minimale regressiematrix is suitebreed benoemd.
- [x] De smoke-matrix maakt expliciet onderscheid tussen `200`- en `422`-verwachtingen.
- [x] De step voorkomt dat verdere expansie opent zonder eerst runtime- en QA-discipline te verankeren.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de runtime-hardening- en QA-gate.
- [x] Het document sluit logisch aan op de post-onboarding en suite-consolidatiegates.
- [x] De volgende toegestane stap is duidelijk begrensd.

## Assumptions/Defaults

- de grootste korte-termijnwinst zit nu in suitebetrouwbaarheid, niet in nog een extra route
- helper- en API-driven smoke is voorlopig voldoende waar auth-protected dashboardflows niet telkens handmatig worden doorlopen
- bewuste reportasymmetrie is nu een geldige productgrens en geen open issue
- verdere expansion mag pas terug op tafel komen nadat deze suitebreedte eerst bestuurlijk is gehard

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_11_NEXT_EXPANSION_CANDIDATE_GATE_PLAN.md`

Er is nog geen build permission voor een nieuwe productlijn, scale-up-wave of brede platformuitbreiding.
