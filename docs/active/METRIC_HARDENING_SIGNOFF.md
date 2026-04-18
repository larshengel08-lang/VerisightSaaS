# METRIC_HARDENING_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: metric inventory, relevance review, decision matrix and hierarchy canon.

## Titel

Metric And Measurement Review Flow - Signoff

## Korte samenvatting

De metricflow is nu voldoende gehard om als vaste metriccanon te dienen voor parity-, method- en producthardening. De hoofdmetrics per product zijn bevestigd, aanvullende signalen zijn duidelijk begrensd en de kwetsbaarste ExitScan-nevenmetrics zijn inhoudelijk gedegradeerd naar een niet-leidende laag.

## Wat is geaudit

- [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)
- [METRIC_RELEVANCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_RELEVANCE_REVIEW.md)
- [METRIC_DECISION_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_DECISION_MATRIX.md)
- [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)

## Belangrijkste bevindingen

- De metriclaag is intern consistent genoeg voor vervolgwerk.
- ExitScan en RetentieScan hebben een expliciete en proportionele hierarchie tussen hoofdmetric en aanvullende signalen.
- De bounded productlijnen zijn metricmatig juist sterker door hun smalle opbouw, mits hun ondersteunende richtingvragen niet als extra hoofdmetric worden gelezen.
- Technische veldnamen blijven gedeeld, maar de metricbetekenis is productspecifiek.

## Belangrijkste inconsistenties of risico's

- Degrade-besluiten zijn nog niet overal technisch of buyer-facing afgedwongen; latere parity- en codefixes moeten die canon nog volgen.
- Zonder semantische aliaslaag kunnen generieke velden zoals `risk_score` of `stay_intent_score` opnieuw tot overlezing leiden.

## Beslissingen / canonvoorstellen

- De metric gate is `pass with targeted semantics follow-up`.
- `Frictiescore`, `Retentiesignaal`, `Teamsignaal`, `Onboardingsignaal`, `Pulsesignaal` en `Leadershipsignaal` zijn bevestigd als producthoofdcijfers.
- `preventability_result` en `replacement_cost_eur` tellen niet als primaire managementmetrics.
- RetentieScan trend-, repeat- en calibration-lagen tellen niet als extra metriclaag.

## Concrete wijzigingen

- Bestand ververst: [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)

## Buyer-facing metricgrenzen

| Product | Buyer-facing leidend | Buyer-facing secundair | Niet buyer-facing leidend |
| --- | --- | --- | --- |
| ExitScan | `Frictiescore` | eerdere signalering, vertrekredenen, topfactoren | `preventability_result`, `replacement_cost_eur`, interne gewichten |
| RetentieScan | `Retentiesignaal` | stay-intent, vertrekintentie, bevlogenheid, signal profile | factor weights, weighted factors, trend/calibration als extra metric |
| TeamScan | `Teamsignaal` | lokale richtingsvraag, actieve factorlaag | safe-grouping helpers, extraction logic |
| Onboarding 30-60-90 | `Onboardingsignaal` | checkpoint-richtingsvraag, actieve factorlaag | snapshot bookkeeping |
| Pulse | `Pulsesignaal` | bounded richtingsvraag, actieve factorlaag | vergelijking als trendbewijs, helperlogica |
| Leadership Scan | `Leadershipsignaal` | managementrichting, contextfactoren | signal pattern helpers, context summaries als hoofdmetric |

## Validatie

- De signoff rust op repo-gebaseerde definitions, scoring en dashboardlogica.
- Er is geen wijziging aangebracht aan de vastgezette ExitScan-report-architectuur.
- Er is geen productstatus-, pricing- of commerciele promotiebeslissing hardgezet.

## Assumptions / defaults

- De metriccanon geldt vanaf nu als default voor parity-, method- en producthardingstappen.
- Buyer-facing metricgebruik volgt de productspecifieke labeltaal, niet de generieke backendveldnaam.

## Next gate

Field semantics and code alias hardening.
