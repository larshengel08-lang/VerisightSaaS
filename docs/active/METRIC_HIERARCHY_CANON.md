# METRIC_HIERARCHY_CANON

Last updated: 2026-04-18  
Status: active  
Source of truth: metric decision matrix, product definitions, scoring modules and current dashboard/report interpretation rules.

## Titel

Metric And Measurement Review Flow - Hierarchy canon

## Korte samenvatting

Deze canon bepaalt hoe metrics gelaagd moeten worden gelezen. Elk product heeft precies één hoofdmetric, daaronder een signaallaag, daaronder context en tenslotte een interne methodlaag. Zo blijven rapport en dashboard logisch voor de managementvraag zonder dat zwakkere afleidingen te zwaar worden aangezet.

## Wat is geaudit

- [METRIC_DECISION_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_DECISION_MATRIX.md)
- [backend/scoring_config.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring_config.py)
- [frontend/lib/management-language.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/management-language.ts)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)

## Belangrijkste bevindingen

- De codebase ondersteunt al impliciet een hiërarchie, maar die stond nog niet overal expliciet op papier.
- De grootste hardeningwinst zit in het apart houden van hoofdmetric, ondersteunende signalen en interne modeluitkomsten.

## Belangrijkste inconsistenties of risico's

- Zonder hiërarchie kunnen dashboards of mirrors gaan schuiven naar “meer cijfers = meer waarheid”.
- ExitScan en RetentieScan lopen het grootste risico op concurrerende lezing als aanvullende signalen te zichtbaar worden gemaakt.

## Beslissingen / canonvoorstellen

- Rapports, dashboards en onboardingflows moeten dezelfde hiërarchische leesvolgorde volgen.
- De vaste ExitScan-report-architectuur blijft staan; deze canon bepaalt alleen de inhoudelijke metriclaag binnen die structuur.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)

## Canon

### Algemene hiërarchie

1. Hoofdmetric  
   De ene bestuurlijke managementsamenvatting van het product.
2. Signaallaag  
   Aanvullende signalen die helpen richting kiezen, valideren of nuanceren.
3. Contextlaag  
   Factoren, redenen, segmentverschillen of bounded vergelijking die duiding geven.
4. Interne methodlaag  
   Gewichten, interne afleidingen of technische hulpuitkomsten die niet als primaire managementwaarheid horen te worden gelezen.

### Producthiërarchie

| Product | Hoofdmetric | Signaallaag | Contextlaag | Interne methodlaag |
| --- | --- | --- | --- | --- |
| ExitScan | `Frictiescore` | eerdere signalering | vertrekredenen, meespelende redenen, factor- en SDT-lagen | preventability, replacement cost, weights |
| RetentieScan | `Retentiesignaal` | stay-intent, vertrekintentie, bevlogenheid, signal profile | factor- en SDT-lagen, segmentduiding | weights, weighted factors |
| TeamScan | `Teamsignaal` | lokale richtingsvraag | actieve factorlaag, afdelingdelta's, veilige groepsread | safe-grouping rules, active factor extraction |
| Onboarding 30-60-90 | `Onboardingsignaal` | checkpoint-richting | actieve vroege factoren, checkpointcontext | snapshot bookkeeping |
| Pulse | `Pulsesignaal` | bounded richtingsvraag | actieve factorlaag, vorige vergelijkbare pulse waar veilig | bounded comparison logic |
| Leadership Scan | `Leadershipsignaal` | managementrichting | actieve leiderschaps-/werkfactoren, group-level contextread | context summaries, signal pattern helpers |

### Presentatieregels

- De hoofdmetric opent altijd de managementsamenvatting.
- De signaallaag mag de hoofdmetric verdiepen, maar niet vervangen.
- De contextlaag verklaart en prioriteert; zij vormt geen extra hoofdscore.
- De interne methodlaag hoort niet in buyer-facing headlinecopy en niet als zelfstandig bestuurscijfer.

## Validatie

- De canon is in lijn met definitions, dashboards en scoring.
- De hiërarchie voorkomt dat aanvullende signalen of legacy-metrics de hoofdvraag gaan overnemen.

## Assumptions / defaults

- Waar een metric in code generiek `risk_score` heet, wint de productspecifieke labeltaal in alle managementlagen.
- Als een laag niet expliciet in deze hiërarchie past, hoort die standaard in de interne methodlaag totdat anders bewezen.

## Next gate

Metric hardening signoff.
