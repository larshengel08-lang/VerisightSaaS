# Phase Next Step 4 - Post-TeamScan Suite Sequence and Onboarding Gate Plan

## Title

Lock what comes after TeamScan, keep the current live suite stable, and decide whether `Onboarding 30-60-90` is the next controlled productline to prepare.

## Korte Summary

Na `WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md` is de huidige live suite voor het eerst duidelijk verbreed zonder dat de kernportfolio diffuus is geworden:

- `ExitScan` en `RetentieScan` zijn nog steeds de twee buyer-facing kernproducten
- `Combinatie` blijft een portfolio-route en geen derde kernproduct
- `Pulse` en `TeamScan` zijn nu live als bounded `follow_on_route`
- andere future routes blijven bewust gesloten

Daardoor is de volgende stap niet automatisch weer een build wave. De juiste gate is nu opnieuw strategisch:

- bepalen of de eerstvolgende nieuwe productline inderdaad `Onboarding 30-60-90` moet zijn
- expliciet vastzetten dat er nog geen runtime- of marketingopening voor `Onboarding 30-60-90` komt
- bevestigen dat de huidige suite na `Pulse` en `TeamScan` eerst bestuurlijk stabiel moet blijven
- de volgende toegestane stap beperken tot een nieuwe onboarding-planningsreeks, niet tot een build wave

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen nieuwe wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De codebase en marketinglaag laten nu een duidelijk patroon zien:

- de runtime kent alleen `scan_type = exit | retention | pulse | team`
- de frontend productregistry kent alleen modules voor `exit`, `retention`, `pulse` en `team`
- de marketinglaag heeft nu precies vijf live buyer-facing routes: `ExitScan`, `RetentieScan`, `Combinatie`, `Pulse` en `TeamScan`
- `Onboarding 30-60-90` bestaat nog niet als scan type, productmodule, marketingproduct of route
- de huidige reserved routes zijn nog steeds `MTO`, `Leadership Scan` en `Customer Feedback`

Dat betekent dat `Onboarding 30-60-90` inhoudelijk wel de volgende logische lifecycle-candidate kan zijn, maar technisch en commercieel nog helemaal niet bestaat. Zonder deze stap zou de suite te snel van gecontroleerde verbreding naar brede catalogusgroei schuiven.

Deze stap voorkomt dat door nu expliciet te beslissen:

- wat de post-TeamScan suitevolgorde is
- welke route de volgende kandidaat wordt
- welke dingen nog geblokkeerd blijven
- welke plandocumenten eerst nodig zijn voordat een nieuwe productline open mag

## Current Implementation Baseline

### 1. Live portfolio reality

- [x] `ExitScan` en `RetentieScan` zijn live `core_product`
- [x] `Combinatie` is live `portfolio_route`
- [x] `Pulse` en `TeamScan` zijn live `follow_on_route`
- [x] er is nu geen zesde live productroute

### 2. Runtime reality

- [x] backend registry ondersteunt alleen `exit`, `retention`, `pulse` en `team`
- [x] frontend registry ondersteunt alleen `exit`, `retention`, `pulse` en `team`
- [x] `ScanType` bevat nog geen onboarding-gerelateerde variant
- [x] huidige runtime blijft campaign-centered

### 3. Marketing and funnel reality

- [x] `Onboarding 30-60-90` bestaat nu niet in `marketing-products.ts`
- [x] er is geen buyer-facing route zoals `/producten/onboarding` of vergelijkbaar
- [x] pricing en funnel kennen nu geen onboarding-route
- [x] huidige reserved marketing routes blijven buiten de live suite

### 4. Strategic reality

- [x] `Pulse` is publiek geopend als monitoringlaag na diagnose of baseline
- [x] `TeamScan` is publiek geopend als bounded lokalisatieroute na een breder signaal
- [x] de volgende productuitbreiding moet nu opnieuw decision-driven worden geopend

## Decision

### 1. Post-TeamScan Portfolio Freeze

De huidige live suite wordt na TeamScan niet automatisch verder verbreed.

Beslissing:

- er wordt nu geen extra live route geopend naast de huidige vijf buyer-facing routes
- `MTO`, `Leadership Scan` en `Customer Feedback` blijven gesloten `future_reserved_route`
- er komt nu geen nieuwe follow-on route puur omdat `Pulse` en `TeamScan` groen zijn

Rationale:

- de huidige suite is voor het eerst breed genoeg om verwarring te veroorzaken als we te snel doorbouwen
- de kernwaarde van Verisight blijft decision support, niet een steeds bredere surveycatalogus

### 2. Next Candidate Productline

De volgende logische nieuwe productline na `Pulse` en `TeamScan` blijft `Onboarding 30-60-90`.

Beslissing:

- `Onboarding 30-60-90` wordt bevestigd als eerstvolgende productline-candidate
- die candidate wordt inhoudelijk behandeld als lifecycle-scan voor vroege integratie en vroege retentierisico's
- `Onboarding 30-60-90` opent nog niet als build, route, scan type of reserved marketingproduct in deze stap

Rationale:

- het sluit het best aan op de bestaande lifecycle-grammatica van Verisight
- het verbreedt de suite inhoudelijk zonder direct te botsen met `Pulse` of `TeamScan`
- het vraagt eerst een scherpere entry- en boundarybeslissing dan nu in de codebase aanwezig is

### 3. What Is Explicitly Not Next

De volgende stap is expliciet niet:

- een `WAVE_01_ONBOARDING_*` buildartifact
- een buyer-facing opening van `Onboarding 30-60-90`
- een generieke lifecycle-hub of brede employee-journey suite
- een activatie van `MTO`, `Leadership Scan` of `Customer Feedback`
- een technische platformverbreding vooruitlopend op een nog niet gedefinieerd product

### 4. Required Planning Sequence Before Any Onboarding Build

Voordat `Onboarding 30-60-90` ook maar een eerste build wave mag krijgen, moeten eerst drie decision-complete stappen worden doorlopen:

1. `PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md`
2. `PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`
3. `PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Pas daarna mag:

4. `WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md`

Beslissing:

- de onboarding-track volgt dezelfde governance als `Pulse` en `TeamScan`
- er blijft exact een stap tegelijk actief
- zonder groene planningstrack komt er geen onboarding-runtimewerk

### 5. Commercial Sequence Contract

De post-TeamScan suite moet commercieel herkenbaar blijven.

Beslissing:

- `ExitScan` blijft de primaire wedge
- `RetentieScan` blijft de complementaire kernroute
- `Pulse` blijft de eerste monitoringlaag
- `TeamScan` blijft de eerste lokalisatielaag
- `Onboarding 30-60-90` wordt alleen later geopend als eigen lifecycle-vraag echt scherp te onderscheiden is van deze vier bestaande lagen

## Key Changes

- de huidige live suite wordt expliciet bevroren na TeamScan
- `Onboarding 30-60-90` wordt bevestigd als volgende kandidaat, maar nog niet geopend
- de volgende toegestane stap wordt beperkt tot onboarding-planning
- andere reserved routes blijven geblokkeerd

## Belangrijke Interfaces/Contracts

### 1. Suite Sequence Contract

De huidige suitevolgorde blijft:

- kern: `ExitScan`, `RetentieScan`
- portfolio-route: `Combinatie`
- bounded follow-on routes: `Pulse`, `TeamScan`

`Onboarding 30-60-90` mag hier pas aan toegevoegd worden na een aparte planningstrack.

### 2. Runtime Contract

Na deze stap blijft gelden:

- geen nieuw `scan_type`
- geen onboarding-productmodule
- geen nieuwe surveytemplate voor onboarding
- geen dashboard- of reportcontract voor onboarding

### 3. Marketing Contract

Na deze stap blijft gelden:

- geen live of reserved onboarding-route toevoegen
- geen pricingregel voor onboarding
- geen funnel- of CTA-openzet voor onboarding
- geen buyer-facing belofte over onboarding buiten latere strategie-documenten

### 4. Governance Contract

De eerstvolgende toegestane stap is nu:

- `PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md`

Niet toegestaan:

- meerdere onboarding-stappen tegelijk openen
- alvast `WAVE_01_ONBOARDING_*` schrijven
- alvast routes, scan types of artifacts voorbereiden "voor later"

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md)
- [docs/strategy/WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md)

## Testplan

### Product acceptance

- [x] De huidige live suite is expliciet begrensd na TeamScan.
- [x] `Onboarding 30-60-90` is bevestigd als volgende candidate, niet als automatische build.
- [x] Andere reserved routes zijn niet per ongeluk naar voren geschoven.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige registry- en marketingrealiteit.
- [x] Er wordt geen nieuw `scan_type` of nieuwe route verondersteld die nog niet bestaat.
- [x] Deze stap introduceert geen platformwerk "voor later".

### Runtime acceptance

- [x] Geen runtimewijzigingen in deze stap.
- [x] Geen marketingactivatie in deze stap.
- [x] Geen nieuwe onboarding-surface geactiveerd.

### QA acceptance

- [x] De volgende toegestane stap is eenduidig en beperkt.
- [x] De step voorkomt scopelek naar losse brainstorms of voortijdige builds.
- [x] De suitevolgorde blijft logisch na `Pulse` en `TeamScan`.

### Documentation acceptance

- [x] Het document functioneert als source of truth voor de post-TeamScan gate.
- [x] De dependencies naar bestaande suite- en TeamScan-documenten zijn expliciet.
- [x] De opvolgvolgorde voor onboarding is duidelijk benoemd.

## Assumptions/Defaults

- `Onboarding 30-60-90` blijft inhoudelijk de slimste volgende lifecycle-candidate.
- Die candidate is op dit moment nog niet buyer-facing of technisch voorbereid in de codebase.
- De suite wordt na TeamScan niet verder verbreed zonder nieuwe decision-complete stappen.
- `MTO`, `Leadership Scan` en `Customer Feedback` blijven voorlopig irrelevant voor de eerstvolgende productkeuze.

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md`

Er is nog geen build permission voor een onboarding-wave.
