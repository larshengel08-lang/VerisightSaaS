# Phase Next Step 8 - Post-Onboarding Suite Sequence and Consolidation Gate Plan

## Title

Lock what comes after onboarding, freeze the current live Verisight suite, and decide that the next controlled track is consolidation and commercial/runtime hardening before any further productline expansion.

## Korte Summary

Na `WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md` is de live Verisight-suite voor het eerst breed genoeg om echte suitecomplexiteit te dragen:

- `ExitScan` en `RetentieScan` blijven de twee buyer-facing kernproducten
- `Combinatie` blijft een portfolioroute en geen derde kernproduct
- `Pulse`, `TeamScan` en `Onboarding 30-60-90` zijn nu live als bounded `follow_on_route`
- andere future routes blijven bewust gesloten

Daardoor is de volgende stap opnieuw geen automatische build wave. De juiste gate is nu:

- vastzetten dat er na onboarding niet direct nog een nieuwe productlijn wordt geopend
- expliciet kiezen dat de eerstvolgende track suiteconsolidatie en commercial/runtime hardening is
- bevestigen dat `MTO`, `Leadership Scan` en `Customer Feedback` nog niet aan de beurt zijn
- de volgende toegestane stap beperken tot een nieuwe consolidatie-planning, niet tot een nieuwe buildslice

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen nieuwe wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De codebase en marketinglaag laten nu een nieuw suitebeeld zien:

- de runtime kent nu `scan_type = exit | retention | pulse | team | onboarding`
- de frontend productregistry kent nu modules voor `exit`, `retention`, `pulse`, `team` en `onboarding`
- de marketinglaag heeft nu zes live buyer-facing routes: `ExitScan`, `RetentieScan`, `Combinatie`, `Pulse`, `TeamScan` en `Onboarding 30-60-90`
- `MTO`, `Leadership Scan` en `Customer Feedback` zijn nog steeds gesloten `future_reserved_route`

Dat betekent dat Verisight niet meer in een vroege “eerste verbreding”-fase zit. Het portfolio is nu breed genoeg dat:

- packaging, routekeuze en cross-sell scherper bewaakt moeten worden
- claims, trust en output per productlijn onder een gedeelde suitegrens moeten blijven
- runtime- en QA-harding belangrijker wordt dan nog een extra product openen
- de kans op buyer- en interne verwarring snel stijgt als we direct verder uitbreiden

Deze stap voorkomt dat door nu expliciet te beslissen:

- wat de post-onboarding suitevolgorde is
- dat de suite eerst wordt bevroren
- dat de volgende kandidaat geen nieuwe productlijn is, maar een consolidatietrack
- welke plandocumenten eerst nodig zijn voordat latere uitbreiding opnieuw überhaupt toegestaan wordt

## Current Implementation Baseline

### 1. Live portfolio reality

- [x] `ExitScan` en `RetentieScan` zijn live `core_product`
- [x] `Combinatie` is live `portfolio_route`
- [x] `Pulse`, `TeamScan` en `Onboarding 30-60-90` zijn live `follow_on_route`
- [x] er is nu geen zevende live productroute

### 2. Runtime reality

- [x] backend registry ondersteunt `exit`, `retention`, `pulse`, `team` en `onboarding`
- [x] frontend registry ondersteunt `exit`, `retention`, `pulse`, `team` en `onboarding`
- [x] huidige runtime blijft campaign-centered
- [x] er is nog geen generieke suite control plane, entitlementmodel of workflow-engine

### 3. Marketing and funnel reality

- [x] onboarding staat nu live naast `Pulse` en `TeamScan` in `marketing-products.ts`
- [x] pricing en funnel kennen nu onboarding als bounded follow-on route
- [x] trust en discovery vertellen nu zes buyer-facing routes in één suitekader
- [x] current future routes blijven gesloten

### 4. Strategic reality

- [x] drie nieuwe productlijnen zijn nu publiek geopend zonder de kern te vervangen
- [x] de volgende strategische fout zou zijn om van bounded suiteverbreding naar losse catalogusgroei te schuiven
- [x] de volgende stap moet dus governance-, commercial- en runtimegericht zijn, niet opnieuw product-opening-gericht

## Decision

### 1. Post-Onboarding Portfolio Freeze

De huidige live suite wordt na onboarding niet automatisch verder verbreed.

Beslissing:

- er wordt nu geen extra live route geopend naast de huidige zes buyer-facing routes
- `MTO`, `Leadership Scan` en `Customer Feedback` blijven gesloten `future_reserved_route`
- er komt nu geen nieuwe follow-on route puur omdat onboarding groen is

Rationale:

- de suite is nu breed genoeg om verwarring te veroorzaken als we te snel doorbouwen
- Verisight wint nu meer door scherpere suitegrenzen dan door een volgende productnaam

### 2. Next Controlled Track

De eerstvolgende gecontroleerde track na onboarding is geen nieuwe productlijn, maar suiteconsolidatie.

Beslissing:

- de volgende track wordt `Suite Consolidation and Commercial/Runtime Hardening`
- die track richt zich op:
  - portfoliohelderheid
  - packaging en routekeuze
  - trust- en claim-consistentie
  - QA- en runtime-hardening
  - buyer-facing en interne handoff-consistentie
- deze stap opent nog geen buildwave; alleen de volgende planningstrack wordt toegestaan

Rationale:

- zes live routes vragen nu eerst scherpere orkestratie
- de grootste risico’s zitten nu in verwarring, oversell en inconsistentie, niet in een gebrek aan productbreedte

### 3. What Is Explicitly Not Next

De volgende stap is expliciet niet:

- een nieuwe `WAVE_01_*` voor een vierde nieuwe productlijn
- een live opening van `MTO`, `Leadership Scan` of `Customer Feedback`
- een brede employee-journey suite of governance-platformbuild
- een billing-, SSO- of enterprise-uitrol zonder eerst suiteconsolidatie te beslissen
- een technische platformverbreding puur “voor later”

### 4. Required Planning Sequence Before Any Further Expansion

Voordat een nieuwe productlijn of bredere commercialization wave mag openen, moeten eerst drie decision-complete stappen doorlopen worden:

1. `PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md`
2. `PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md`
3. `PHASE_NEXT_STEP_11_NEXT_EXPANSION_CANDIDATE_GATE_PLAN.md`

Pas daarna mag opnieuw gekozen worden of:

- verdere expansion logisch is
- de suite op zes routes blijft
- commercialization/scale-up eerder aan de beurt is dan productverbreding

### 5. Commercial Sequence Contract

De post-onboarding suite moet commercieel herkenbaar blijven.

Beslissing:

- `ExitScan` blijft de primaire wedge
- `RetentieScan` blijft de complementaire kernroute
- `Combinatie` blijft de portfolioroute
- `Pulse`, `TeamScan` en `Onboarding 30-60-90` blijven expliciet kleinere, bounded vervolgvragen
- de volgende commerciële winst moet komen uit helderder suitegebruik, niet uit nóg een nieuwe route

## Key Changes

- de huidige live suite wordt expliciet bevroren na onboarding
- de volgende gecontroleerde track wordt consolidatie in plaats van nieuwe expansie
- de volgende toegestane stap wordt beperkt tot een consolidatie-plandocument
- andere reserved routes blijven geblokkeerd

## Belangrijke Interfaces/Contracts

### 1. Suite Sequence Contract

De huidige suitevolgorde blijft:

- kern: `ExitScan`, `RetentieScan`
- portfolioroute: `Combinatie`
- bounded follow-on routes: `Pulse`, `TeamScan`, `Onboarding 30-60-90`

Een volgende route mag pas weer openen na een aparte consolidatie- en gate-reeks.

### 2. Runtime Contract

Na deze stap blijft gelden:

- geen nieuw `scan_type`
- geen nieuwe productmodule
- geen nieuwe buyer-facing reserved route
- geen generieke suite-engine als impliciet vervolg op het huidige portfolio

### 3. Marketing Contract

Na deze stap blijft gelden:

- geen zevende live route toevoegen
- geen nieuwe pricingregel voor nog een extra productlijn
- geen nieuwe funnelroute buiten de zes huidige live routes
- geen buyer-facing belofte over bredere suite-expansie buiten latere strategy docs

### 4. Governance Contract

De eerstvolgende toegestane stap is nu:

- `PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md`

Niet toegestaan:

- meteen een nieuwe expansion-wave openen
- meerdere consolidatiestappen tegelijk openen
- alvast nieuwe routes, entitlements of runtime-objecten voorbereiden “voor later”

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [docs/strategy/WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md)

## Testplan

### Product acceptance

- [x] De huidige live suite is expliciet begrensd na onboarding.
- [x] De volgende track is consolidatie en niet automatisch verdere expansie.
- [x] Andere reserved routes zijn niet per ongeluk naar voren geschoven.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige registry- en marketingrealiteit.
- [x] Er wordt geen nieuwe route of productmodule verondersteld die nog niet bestaat.
- [x] Deze stap introduceert geen platformwerk “voor later”.

### Runtime acceptance

- [x] Geen runtimewijzigingen in deze stap.
- [x] Geen marketingactivatie in deze stap.
- [x] Geen nieuwe buildwave geopend in deze stap.

### QA acceptance

- [x] De volgende toegestane stap is eenduidig en beperkt.
- [x] De step voorkomt scopelek naar losse brainstorms of voortijdige builds.
- [x] De suitevolgorde blijft logisch na onboarding.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de post-onboarding gate.
- [x] Dependencies naar de huidige suite- en onboardingdocumenten zijn expliciet.
- [x] De opvolgvolgorde voor consolidatie is duidelijk benoemd.

## Assumptions/Defaults

- de huidige suitebreedte is voorlopig voldoende
- verdere groei moet nu eerst verdiend worden via scherpere suitekwaliteit en commerciële consistentie
- `MTO`, `Leadership Scan` en `Customer Feedback` blijven voorlopig irrelevant voor de eerstvolgende keuze
- commercialization en scale-up mogen pas weer naar voren schuiven nadat suiteconsolidatie expliciet is besloten

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md`

Er is nog geen build permission voor een nieuwe expansion-wave.
