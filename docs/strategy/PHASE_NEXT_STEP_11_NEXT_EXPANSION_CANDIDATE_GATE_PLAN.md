# Phase Next Step 11 - Next Expansion Candidate Gate Plan

## Title

Decide which reserved future route may remain the next serious Verisight expansion candidate after the current suite, and explicitly rule out the candidates that would blur or destabilize the live portfolio.

## Korte Summary

Na `PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md` is vastgezet dat de huidige suite eerst bestuurlijk en technisch stabiel moet blijven. Deze stap bepaalt daarom niet hoe we meteen verder bouwen, maar welke van de nog gereserveerde routes uberhaupt nog als serieuze volgende uitbreidingskandidaat mag gelden:

- `MTO`
- `Leadership Scan`
- `Customer Feedback`

De kernbeslissing van deze stap is:

- er opent nog steeds geen nieuwe buildwave
- `Customer Feedback` valt nu expliciet buiten de eerstvolgende Verisight-expansielogica
- `MTO` blijft voorlopig gereserveerd, maar niet als eerstvolgende kandidaat
- `Leadership Scan` blijft als enige over als mogelijke volgende controlled candidate
- ook voor `Leadership Scan` geldt: eerst een aparte entry-and-boundaries beslissing, daarna pas eventueel een wave-stack

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige codebase en marketinglaag tonen nu een suite met:

- twee kernproducten: `ExitScan`, `RetentieScan`
- een portfolioroute: `Combinatie`
- drie bounded follow-on routes: `Pulse`, `TeamScan`, `Onboarding 30-60-90`
- drie nog gesloten future routes: `MTO`, `Leadership Scan`, `Customer Feedback`

Na de suitefreeze, commerciele consolidatie en runtime/QA-gate is het logisch om vast te zetten welke future routes nu nog serieus passen bij wat Verisight inmiddels echt is geworden. Zonder deze stap zouden drie risico's snel terugkomen:

- een te brede lijst van “mogelijk volgende producten” zonder duidelijke prioriteit
- hernieuwde scopelek naar producten die inhoudelijk buiten de huidige suite vallen
- het openen van een nieuwe candidate die de huidige portfolioarchitectuur juist diffuser maakt

Deze stap voorkomt dat door nu expliciet te kiezen:

- welke candidate afvalt
- welke candidate bewust later kan blijven
- welke candidate, als de suite later weer uitbreidt, de meest logische eerstvolgende ingang is

## Current Implementation Baseline

### 1. Current live suite identity

- [x] de huidige live suite draait volledig om people-insight en employee-lifecycle vraagstukken
- [x] alle runtimeproducten blijven campaign-centered en managementgericht
- [x] de huidige follow-on routes verdiepen bestaande signalen in ritme, lokalisatie of vroege instroom
- [x] er is nog geen generieke platformlaag voor brede, domeinoverstijgende productsprongen

### 2. Current reserved candidate set

- [x] `MTO` staat nog op `reserved_future`
- [x] `Leadership Scan` staat nog op `reserved_future`
- [x] `Customer Feedback` staat nog op `reserved_future`
- [x] geen van deze drie heeft vandaag een runtime `scan_type`, productmodule, funnelpad of buyer-facing activatie

### 3. Current strategic tension

- [x] de suite is sterker geworden door scherpte en opvolglogica, niet door breadth-first catalogusgroei
- [x] de grootste huidige risico's zitten in overlap, verwarring en claimsymmetrie
- [x] een volgende candidate moet dus nauwer aansluiten op de huidige portfolio dan op een abstract “we zouden ook dit kunnen doen”

## Decision

### 1. No Immediate Expansion Reopening

Deze stap opent nog geen nieuwe uitbreiding.

Beslissing:

- de suite blijft gesloten voor nieuwe buildwaves
- deze stap selecteert alleen de eerstvolgende serieuze candidate-lijn
- ook na deze stap is er nog geen build permission

Rationale:

- de huidige suite is nu pas breed genoeg om een echte candidate-keuze zinvol te maken
- buildpermission zonder candidate-gate zou opnieuw scopelek veroorzaken

### 2. Customer Feedback Is Not The Next Verisight Candidate

`Customer Feedback` valt expliciet buiten de eerstvolgende uitbreidingslogica.

Beslissing:

- `Customer Feedback` blijft `reserved_future`
- `Customer Feedback` mag niet de eerstvolgende candidate-planning openen
- `Customer Feedback` hoort pas weer in beeld te komen na een veel latere, expliciete keuze om buiten de huidige people-insight suite te verbreden

Rationale:

- de huidige live suite is volledig employee- en managementsignaalgedreven
- `Customer Feedback` ligt inhoudelijk buiten de huidige employee-lifecycle lijn
- deze candidate zou nu eerder domeinverbreding betekenen dan portfolioverdieping
- dat zou haaks staan op de current `core-first suite`-architectuur

### 3. MTO Remains Reserved, But Not As The Next Candidate

`MTO` blijft gereserveerd, maar is nu niet de eerstvolgende logische candidate.

Beslissing:

- `MTO` blijft `reserved_future`
- `MTO` opent nu niet als volgende planningreeks
- `MTO` mag pas later opnieuw bekeken worden als expliciet brede tevredenheidsmeting strategisch gewenst is en niet botst met de huidige kernpositionering

Rationale:

- de huidige suite wint juist door scherpe, managementgerichte vragen in plaats van brede tevredenheidsmetingen
- `MTO` zou buyer-facing sneller als brede hoofdroute voelen dan als gecontroleerde vervolgstap
- `MTO` zou overlaprisico geven met `RetentieScan`, `Pulse`, `TeamScan` en delen van de huidige factorlaag
- binnen de huidige codebase bestaat nog geen noodzaak die naar een brede MTO-beweging dwingt

### 4. Leadership Scan Becomes The Only Remaining Serious Next Candidate

`Leadership Scan` blijft als enige over als mogelijke volgende gecontroleerde uitbreidingskandidaat.

Beslissing:

- `Leadership Scan` wordt de enige candidate die, als expansion later heropent, als eerstvolgende planningtrack mag worden onderzocht
- ook voor `Leadership Scan` geldt eerst een decision-complete boundaries-plan, niet meteen een buildwave
- `Leadership Scan` wordt nu nog niet geactiveerd in runtime, marketing of funnel

Rationale:

- van de drie reserved routes ligt `Leadership Scan` inhoudelijk het dichtst bij de huidige people- en managementlogica
- de huidige suite raakt leiderschap al via factoren, teamcontext en managementhandoff, waardoor er inhoudelijke aangrijpingspunten bestaan
- tegelijk is er nog juist genoeg risico op overlap met `TeamScan` en bestaande leiderschapsfactoren om eerst een strakke boundary-step te eisen

### 5. Leadership Scan Must Be Framed As A Bounded Follow-On Candidate

Als `Leadership Scan` later wordt onderzocht, mag dat alleen als begrensde candidate gebeuren.

Beslissing:

- `Leadership Scan` mag niet starten als nieuw kernproduct
- `Leadership Scan` mag niet worden opgezet als generieke leiderschapstraining, 360-tool of performance-instrument
- `Leadership Scan` mag alleen onderzocht worden als managementgerichte verdieping na een bestaand breder signaal
- het product moet scherp onderscheiden blijven van:
  - `TeamScan`
  - bestaande `leadership`-factoruitleg binnen andere producten
  - `Segment Deep Dive`

### 6. Required Governance Before Any Leadership Scan Build

Zelfs met `Leadership Scan` als gekozen candidate blijft de governancevolgorde hard.

Beslissing:

- eerstvolgende toegestane stap is alleen een candidate-specifiek boundaries-plan
- daarna pas system-and-data boundaries
- daarna pas master index en wave stack
- pas daarna zou `WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md` ooit mogen openen

Niet toegestaan:

- direct `scan_type = leadership` toevoegen
- buyer-facing `leadership-scan` live zetten
- bestaande TeamScan- of factorlogica alvast verbreden “ter voorbereiding”

## Key Changes

- de future candidate-set wordt nu hard teruggebracht van drie naar een enkele serieuze eerstvolgende kandidaat
- `Customer Feedback` valt uit de nabije uitbreidingslogica
- `MTO` blijft gereserveerd maar niet eerstvolgend
- `Leadership Scan` wordt de enige toegestane volgende candidate-lijn
- zelfs die candidate blijft nog volledig geblokkeerd voor build tot een nieuwe boundaries-reeks is doorlopen

## Belangrijke Interfaces/Contracts

### 1. Reserved Candidate Contract

- `mto = reserved_future`
- `leadership-scan = reserved_future`
- `customer-feedback = reserved_future`

Beslissing:

- status blijft technisch gelijk; alleen de strategische candidate-prioriteit verandert

### 2. Next Candidate Priority Contract

- `customer-feedback = not next`
- `mto = later maybe`
- `leadership-scan = only next serious candidate`

### 3. Portfolio Integrity Contract

- volgende candidate mag de huidige `core-first suite` niet vervormen
- volgende candidate mag geen brede catalogusgroei triggeren
- volgende candidate moet een bounded managementvraag houden

### 4. Governance Sequence Contract

- geen buildwave zonder candidate-specific planningreeks
- geen runtimeactivatie zonder boundaries-besluiten
- geen marketingactivatie zonder release-hardening op het eind van een eventuele latere wave-stack

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [docs/strategy/PHASE_NEXT_STEP_8_POST_ONBOARDING_SUITE_SEQUENCE_AND_CONSOLIDATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_8_POST_ONBOARDING_SUITE_SEQUENCE_AND_CONSOLIDATION_GATE_PLAN.md)
- [docs/strategy/PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md)
- [docs/strategy/PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)

## Testplan

### Product acceptance

- [x] De current suite blijft inhoudelijk scherp en krijgt geen willekeurige volgende candidate.
- [x] `Customer Feedback` valt expliciet buiten de nabije route.
- [x] `MTO` wordt niet per ongeluk tot eerstvolgende route verheven.
- [x] `Leadership Scan` blijft alleen als bounded candidate over.

### Strategy acceptance

- [x] De candidate-keuze sluit aan op de huidige live suite-identiteit.
- [x] De keuze voorkomt verdere breedtegroei zonder duidelijke productreden.
- [x] De candidate-keuze maakt de volgende governance-stap eenduidig.

### Codebase acceptance

- [x] Deze stap veronderstelt geen bestaande `leadership` runtime-module die er nog niet is.
- [x] Deze stap veronderstelt geen nieuwe `scan_type`-activatie.
- [x] De reserved routes blijven technisch reserved.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de next-candidate keuze.
- [x] De vervolgstap is duidelijk begrensd tot een boundaries-plan.
- [x] Er ontstaat geen impliciete buildpermission uit deze stap.

## Assumptions/Defaults

- de huidige suite hoeft nu niet breder te worden om strategisch sterker te zijn
- als expansion later weer open mag, moet die de huidige management- en people-insight lijn verdiepen en niet verbreden naar een ander domein
- `Leadership Scan` is alleen logisch als bounded vervolgstap en niet als brede leiderschapspropositie
- `MTO` en `Customer Feedback` blijven voor nu bestuurlijk op afstand

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md`

Er is nog geen build permission voor `Leadership Scan` of een andere nieuwe productlijn.
