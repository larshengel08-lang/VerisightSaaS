# METRIC_HARDENING_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: metric inventory, relevance review, decision matrix and hierarchy canon.

## Titel

Metric And Measurement Review Flow - Signoff

## Korte samenvatting

De metricflow is voldoende gehard om door te schuiven naar de survey- en methodevidencefase. De hoofdmetrics per product zijn bevestigd, aanvullende signalen zijn duidelijk begrensd en de meest kwetsbare ExitScan-nevenmetrics zijn inhoudelijk gedegradeerd naar een niet-leidende laag.

## Wat is geaudit

- [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)
- [METRIC_RELEVANCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_RELEVANCE_REVIEW.md)
- [METRIC_DECISION_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_DECISION_MATRIX.md)
- [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)

## Belangrijkste bevindingen

- De metriclaag is intern consistent genoeg voor vervolgwerk.
- ExitScan en RetentieScan hebben nu een expliciete en proportionele hiërarchie tussen hoofdmetric en aanvullende signalen.
- De bounded productlijnen zijn metricmatig juist sterker door hun smalle opbouw.

## Belangrijkste inconsistenties of risico's

- Degrade-besluiten zijn nog documentair; latere buyer-facing of dashboardfixes moeten deze canon nog daadwerkelijk volgen.
- Methodische risico's rond surveybasis en afleiding zijn nog niet volledig beoordeeld; dat gebeurt in de volgende fase.

## Beslissingen / canonvoorstellen

- De metric gate is `pass with targeted method follow-up`.
- `Frictiescore`, `Retentiesignaal`, `Teamsignaal`, `Onboardingsignaal`, `Pulsesignaal` en `Leadershipsignaal` zijn bevestigd als producthoofdcijfers.
- `preventability_result` en `replacement_cost_eur` tellen vanaf nu niet meer als primaire managementmetrics.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)

## Validatie

- De signoff rust op repo-gebaseerde definitions, scoring en dashboardlogica.
- Er is geen wijziging aangebracht aan de vastgezette ExitScan-report-architectuur.
- Er is geen productstatus, pricing- of commerciële promotiebeslissing hardgezet.

## Assumptions / defaults

- De metriccanon geldt vanaf nu als default voor volgende survey-, method- en product hardeningstappen.
- Verdere code- of copyfixes kunnen later nodig zijn, maar blokkeren deze signoff niet.

## Next gate

Method And Survey Evidence Flow - `QUESTION_TO_SIGNAL_MAP.md`, `METHOD_EVIDENCE_REVIEW.md`, `METHOD_RISK_MATRIX.md`, `SURVEY_METHOD_FIX_PLAN.md` en `METHOD_SIGNOFF.md`.
