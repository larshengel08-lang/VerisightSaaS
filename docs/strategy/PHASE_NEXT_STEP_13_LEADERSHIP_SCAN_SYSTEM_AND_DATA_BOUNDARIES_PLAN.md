# Phase Next Step 13 - Leadership Scan System and Data Boundaries Plan

## Title

Lock the system fit, data boundaries, and runtime constraints for Leadership Scan so the candidate can only move forward within the current Verisight architecture and currently plausible data reality.

## Korte Summary

Na `PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md` is vastgezet wat Leadership Scan inhoudelijk wel en niet mag zijn. Deze stap bepaalt daarom binnen welke technische en datamatige grenzen die candidate later überhaupt zou mogen bestaan:

- welke bestaande runtimegrenzen leidend blijven
- welke data de codebase vandaag echt heeft
- welke leadership-specifieke data juist nog niet bestaat
- welke v1-boundary daarom verdedigbaar is
- welke systeem- en privacygrenzen eerst hard moeten blijven

De kernbeslissing van deze stap is:

- Leadership Scan moet, als candidate, binnen de huidige campaign-centered runtime blijven passen
- v1 mag niet uitgaan van manager-id, reporting lines, org chart of 360-actorrollen, omdat die nu niet bestaan
- v1 mag niet starten als individuele managerread
- als Leadership Scan later opent, moet het eerst draaien op bestaande groeps- en contextdata, met een smalle managementverificatiegrens
- er komt nog geen nieuwe control plane, geen hiërarchie-engine en geen leiderschapsdossierlaag “voor later”

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De grootste fout bij Leadership Scan zou nu zijn om een productdefinitie te kiezen die technisch leunt op data en runtime-objecten die Verisight vandaag niet heeft:

- geen `scan_type = leadership`
- geen `manager_id`
- geen `team_id`
- geen reporting hierarchy
- geen 360-rollen of multi-rater actors
- geen manager-specifieke artifact- of reportlaag

Tegelijk heeft de huidige codebase wel al een paar bruikbare ankers:

- campaign-centered execution
- respondentmetadata met `department` en `role_level`
- bestaande factor `leadership` in `org_raw` / `org_scores`
- bestaande managementhandoff- en follow-upstructuren
- bestaande privacy- en suppressielogica rond groepsniveau

Daardoor moet deze stap expliciet vastzetten:

- welke delen van de huidige runtime herbruikbaar zijn
- welke nieuwe data we nu nog juist niet mogen veronderstellen
- hoe smal een Leadership Scan v1 later zou moeten blijven

## Current Implementation Baseline

### 1. Current runtime architecture

- [x] de runtime is vandaag campaign-centered
- [x] `Campaign.scan_type` ondersteunt nu alleen `exit | retention | pulse | team | onboarding`
- [x] frontend en backend productregistries kennen nog geen leadership-module
- [x] de huidige suite kent geen generieke run-, artifact- of workflow-engine per productlijn

### 2. Current respondent and response data reality

- [x] respondentmetadata bevat vandaag `department`, `role_level`, `exit_month`, `annual_salary_eur`, `email`
- [x] respondentmetadata bevat geen `manager_id`, `manager_name`, `team_id`, `location`, `business_unit` of reporting line
- [x] `survey_responses` slaan vandaag `org_raw`, `org_scores`, `sdt_raw`, `sdt_scores`, open text en productsummary op
- [x] de factor `leadership` bestaat nu al binnen `org_raw` en `org_scores`
- [x] er is nog geen leiderschapsspecifieke response-entity, subtable of manager-contextmodel

### 3. Current portfolio and privacy reality

- [x] de huidige suite rapporteert op groepsniveau
- [x] `TeamScan` werkt nu al als department-first lokalisatie en niet als manager-ranking product
- [x] de live suite heeft geen individuele managerweergave
- [x] de huidige privacylogica is gebouwd rond suppressie en veilige aggregatie, niet rond persoonsgerichte readouts

## Decision

### 1. Leadership Scan Must Stay Campaign-Centered In V1

Leadership Scan moet, als later candidate, binnen de huidige campaign-centered runtime passen.

Beslissing:

- geen aparte orchestrationlaag
- geen aparte long-running lifecycle-engine
- geen nieuwe cross-campaign artifactstructuur als basisvoorwaarde
- Leadership Scan moet, net als andere productlijnen, in eerste instantie campaign-based kunnen draaien

Rationale:

- dit sluit aan op de bestaande architectuur
- dit voorkomt dat Leadership Scan een dekmantel wordt voor brede platformverbouwing

### 2. No Manager Identity Model In V1

Leadership Scan v1 mag niet leunen op individuele manageridentiteit.

Beslissing:

- geen `manager_id`
- geen `manager_email`
- geen `manager_name`
- geen reporting line of org chart als verplichte input
- geen individuele manager-ranking of manager-scorecards

Rationale:

- deze data bestaat vandaag niet in de codebase
- het zou direct zwaardere privacy-, interpretatie- en governancevragen openen
- het zou de route te snel richting beoordeling of performance stuwen

### 3. No 360 or Multi-Rater Model In V1

Leadership Scan v1 mag niet starten als 360- of multi-rater product.

Beslissing:

- geen aparte actorrollen zoals medewerker, peer, manager, skip-level
- geen respondenttype-model
- geen kalibratielaag tussen meerdere beoordelaars
- geen individuele leiderschapsprofielen

Rationale:

- deze objecten bestaan vandaag niet in runtime of schema
- ze zouden inhoudelijk niet passen bij de bounded managementvraag uit stap 12

### 4. Plausible V1 Data Boundary

Als Leadership Scan later verder onderzocht wordt, moet v1 uitgaan van wat nu wél plausibel beschikbaar is:

- campaign-level deelname
- respondentmetadata:
  - `department`
  - `role_level`
- bestaande factor- en responsegegevens:
  - `org_raw`
  - `org_scores`
  - bestaande `leadership`-factoritems
- mogelijk aanvullende, productspecifieke maar nog steeds campaigngebonden survey-items

Belangrijke grens:

- v1 mag nieuwe surveyvragen krijgen
- v1 mag niet afhankelijk worden van nieuwe organisatorische masterdata die vandaag nergens bestaat

### 5. Aggregation Boundary

Leadership Scan moet, als later product, starten op aggregatieniveau en niet op individueel niveau.

Beslissing:

- de eerste plausibele read blijft groeps- of contextgebaseerd
- mogelijke contextdragers in v1:
  - campaign totaal
  - `department`
  - `role_level`
  - bestaande suppressie-aware segmenten
- geen individuele manager-output

Praktische implicatie:

- als Leadership Scan later managementcontext wil tonen, moet dat eerst via veilige, geaggregeerde patronen en niet via named leader readouts

### 6. Distinction From TeamScan In System Terms

TeamScan en Leadership Scan mogen technisch niet op hetzelfde read-model uitkomen zonder expliciete productreden.

Beslissing:

- `TeamScan` blijft department-first lokalisatie
- Leadership Scan mag niet simpelweg een hernoemde department-priority read worden
- als v1 op `department` of `role_level` steunt, moet de output nog steeds een andere managementvraag beantwoorden dan `TeamScan`

Rationale:

- anders ontstaat productdubbeling zonder echte nieuwe waarde

### 7. Privacy and Interpretation Boundary

Leadership Scan krijgt vanaf de systemlaag een strengere interpretatiegrens.

Beslissing:

- geen persoonsgerichte conclusies
- geen causale claims over individuele leiders
- geen output die aanvoelt als formele beoordeling
- suppressie- en minimum-n-grenzen moeten minimaal even streng zijn als bij bestaande lokale reads

Default:

- Leadership Scan v1 mag alleen bestaan als privacy op groepsniveau verdedigbaar blijft

### 8. No New Platform Objects “For Later”

Leadership Scan mag geen excuus worden om brede nieuwe infra alvast neer te zetten.

Niet toegestaan in deze candidate-richting:

- generieke leadership artifact types
- nieuwe org hierarchy tables zonder directe v1-noodzaak
- entitlement- of rolelagen specifiek voor leidinggevenden
- nieuwe report engines puur om leadership later mogelijk te maken

### 9. Likely Future Contract Shape

Als Leadership Scan later door mag naar wave-planning, is de meest plausibele contractrichting nu:

- een nieuw `scan_type = leadership`
- campaign-centered execution
- baseline-first
- geaggregeerde, suppressie-aware managementread
- expliciete boundarycopy dat het geen 360, ranking of performance-instrument is

Dit is nog geen buildtoestemming, maar wel de systemrichting die nu bestuurlijk het meest verdedigbaar is.

## Key Changes

- Leadership Scan wordt technisch teruggebracht naar een smalle, campagnegebonden candidate
- manager-identiteit, hiërarchie en 360-logica worden nu expliciet buiten v1 geplaatst
- de datagrens wordt geankerd in bestaande respondent- en factorrealiteit
- privacy en suppressie worden vanaf de systemlaag leidend gemaakt
- de volgende stap wordt beperkt tot master index en wave stack, niet build

## Belangrijke Interfaces/Contracts

### 1. Runtime Fit Contract

- `Leadership Scan` must fit current campaign-centered runtime
- no separate control plane
- no hierarchy engine prerequisite

### 2. Data Boundary Contract

- allowed v1 anchors:
  - `department`
  - `role_level`
  - `org_raw`
  - `org_scores`
  - leadership factor items
- not allowed as v1 prerequisite:
  - `manager_id`
  - org chart
  - reporting line
  - 360 actor roles

### 3. Aggregation Contract

- group/context-level output only
- no named leader readouts
- suppressie-aware segmentation required

### 4. Privacy Contract

- no individual manager inference
- no performance framing
- no causal claims on leaders

## Primary Reference Surfaces

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)

## Testplan

### Product acceptance

- [x] Leadership Scan blijft bounded en managementgericht.
- [x] De route leunt niet op data die vandaag niet bestaat.
- [x] Het onderscheid met `TeamScan` en bestaande factoruitleg blijft technisch plausibel.

### Architecture acceptance

- [x] De candidate past binnen de huidige campaign-centered runtime.
- [x] Er wordt geen brede platformverbouwing vooruitgelopen.
- [x] Nieuwe hiërarchie- of 360-objecten zijn expliciet buiten v1 geplaatst.

### Privacy acceptance

- [x] Individuele managerreadouts zijn uitgesloten.
- [x] Suppressie en aggregatie blijven leidend.
- [x] De route schuift niet richting beoordeling of performance tooling.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor system- en data-boundaries.
- [x] De huidige datarealiteit van de codebase is expliciet verwerkt.
- [x] De volgende toegestane stap is duidelijk begrensd.

## Assumptions/Defaults

- de huidige codebase heeft genoeg factor- en contextdata om een smalle leadership-candidate te overwegen, maar niet genoeg hiërarchische data voor een rijke leadership-suite
- een mogelijke v1 moet eerst geaggregeerd en suppressie-aware blijven
- managementcontext is binnen Verisight alleen verdedigbaar zolang het geen individuele beoordeling wordt
- extra leadership-specifieke surveyvragen kunnen later verdedigbaar zijn, maar alleen binnen een campaign-boundary

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Er is nog geen build permission voor `Leadership Scan`.
