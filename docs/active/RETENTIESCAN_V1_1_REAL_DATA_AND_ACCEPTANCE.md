# RETENTIESCAN_V1_1_REAL_DATA_AND_ACCEPTANCE

## Purpose

Dit document zet het echte validatiecontract voor RetentieScan v1.1 vast: welke data nodig is, welke scripts leidend zijn, wat als blocker telt en wanneer v1.1 geloofwaardig genoeg is om verder op te schalen.

## Real Data Minimum

### Voor eerste statistische validatie

- minimaal 25 complete RetentieScan-responses voor eerste reliability-interpretatie
- minimaal 40 complete responses voor eerste factorcontrole
- meerdere afdelingen en meerdere role levels voor segmentvergelijking
- provenance expliciet gemarkeerd als `real`

### Voor eerste pragmatische validatie

- echte response-data
- echte follow-up uitkomsten
- segmentkoppeling via `campaign_id`, `department`, `role_level`
- duidelijk meetmoment en periode-label

## Data Contract

### Response-level export

Leidend script:

- `python export_retention_validation_dataset.py --db-path ... --dataset-origin real`

Verplichte inhoud:

- campaign-id
- respondent-id
- department
- role_level
- ruwe itemdata
- afgeleide signalen
- signal profile

### Segment-level aggregatie

Leidend script:

- `python run_retention_validation.py --db-path ... --dataset-origin real`

Doel:

- interne schaalcontrole
- samenhang tussen signalen
- basis voor latere outcome-koppeling

### Follow-up outcomes

Leidend template:

- [retentionscan_followup_outcomes_template.csv](/C:/Users/larsh/Desktop/Business/Verisight/data/templates/retentionscan_followup_outcomes_template.csv)

Minimaal relevant:

- `campaign_id`
- `department`
- `role_level`
- `period_label`
- `team_size`
- `voluntary_attrition_pct`
- `sick_leave_pct`
- `followup_engagement_score`
- `measurement_date`

### Respondent metadata

Sterk aanbevolen bij import:

- `email`
- `department`
- `role_level`

Leidend template:

- [retentionscan_respondent_import_template.csv](/C:/Users/larsh/Desktop/Business/Verisight/data/templates/retentionscan_respondent_import_template.csv)

## Script Rules

### Statistical validation

- `python assess_retention_validation_readiness.py --db-path ... --dataset-origin real`
- `python run_retention_validation.py --db-path ... --dataset-origin real`

### Pragmatic validation

- `python run_retention_pragmatic_validation.py --db-path ... --outcomes-csv ... --responses-origin real --outcomes-origin real`

### Guardrail

- Als dataset provenance `synthetic`, `dummy` of `unknown` is:
  - niet gebruiken als market evidence
  - niet gebruiken om pragmatische waarde te claimen
  - alleen gebruiken voor infrastructuur, workflow of interne verkenning

## Decision Tree

### Uitkomst A - Voldoende voor doorpakken

Voorwaarden:

- echte data
- voldoende n
- geen grote schaalproblemen
- interpretatiegrens blijft intact

Gevolg:

- RetentieScan v1.1 mag verder worden opgeschaald als voorzichtig gevalideerd groepssignaalproduct

### Uitkomst B - Bruikbaar, claimgrens behouden

Voorwaarden:

- product werkt inhoudelijk en UX-matig
- eerste statistische signalen zijn redelijk
- pragmatische evidence ontbreekt nog of is dun

Gevolg:

- opschalen mag beperkt
- buyer-facing claims blijven op vroegsignalering, prioritering en verificatie

### Uitkomst C - Bruikbaar product, methodisch nog te vroeg

Voorwaarden:

- workflow, dashboard en rapport werken
- data of schaalsteun is nog te zwak

Gevolg:

- product blijft bruikbaar als v1-instrument
- geen verdere claimverzwaring
- eerst extra echte data verzamelen

## Acceptance Criteria

| As | Minimale eis |
|---|---|
| Methodisch | evidence provenance expliciet, geen pseudo-validatie, duidelijke grenzen tussen descriptief en pragmatisch |
| Productmatig | survey, dashboard, rapport en validatiescripts sluiten inhoudelijk op elkaar aan |
| UX / interpretatie | dashboard en rapport sturen op verificatie eerst, niet op schijnzekerheid |
| Commercieel | buyer-facing claims blijven binnen vroegsignalering, prioritering en groepsniveau |
| Data | echte dataset en follow-up contract zijn helder genoeg om volgende validatieronde direct uit te voeren |

## Acceptance Evidence Sources

- Regressietests:
  - bestaande scoring-, API- en copy-paritytests blijven de technische beschermlaag
- Handmatige QA:
  - gebruik [RETENTIESCAN_V1_1_MEASUREMENT_AND_INTERPRETATION_QA.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_MEASUREMENT_AND_INTERPRETATION_QA.md) als vaste interpretatiecheck
- Validatierapportages:
  - readiness-output
  - statistical validation summary
  - pragmatic validation summary

Een v1.1-besluit is pas geloofwaardig als alle drie dezelfde claimgrens ondersteunen.

## What Counts As A Blocker

- geen echte response-data met voldoende provenance
- geen bruikbare department/role_level metadata voor segmentvalidatie
- output die synthetische of dummy data zonder waarschuwing als validatie framen
- copy of duiding die predictor- of causaliteitsclaims suggereert

## What Is Acceptable To Leave Open In v1.1

- herweging van factorscores
- herontwerp van signal profiles
- outcome-geijkte playbooks
- hardere commerciele bewijsclaims

Deze punten zijn pas logisch na een eerste ronde met echte data en echte follow-up uitkomsten.
