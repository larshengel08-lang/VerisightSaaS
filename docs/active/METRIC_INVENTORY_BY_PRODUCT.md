# METRIC_INVENTORY_BY_PRODUCT

Last updated: 2026-04-18  
Status: active  
Source of truth: product definitions, scoring modules, dashboard view-models and the fixed ExitScan report architecture.

## Titel

Metric And Measurement Review Flow - Inventory

## Korte samenvatting

Deze inventaris legt per productlijn vast welke metric werkelijk de hoofdmetric is, welke signalen ondersteunend zijn en welke lagen alleen intern of methodisch bedoeld zijn. De belangrijkste uitkomst is dat elk product nog steeds precies een samenvattend hoofdbeeld heeft, maar dat gedeelde technische veldnamen en beschrijvende vervolglaagsignalen explicieter begrensd moeten worden om constructdrift en schijnprecisie te voorkomen.

## Wat is geaudit

- [backend/scoring_config.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring_config.py)
- [backend/products/exit/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)
- [backend/products/team/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/definition.py)
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [backend/products/onboarding/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/definition.py)
- [backend/products/onboarding/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/scoring.py)
- [backend/products/pulse/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/definition.py)
- [backend/products/pulse/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/scoring.py)
- [backend/products/leadership/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/definition.py)
- [backend/products/leadership/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/scoring.py)
- [frontend/lib/products/exit/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/definition.ts)
- [frontend/lib/products/retention/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts)
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts)
- [frontend/lib/products/onboarding/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/definition.ts)
- [frontend/lib/products/pulse/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/definition.ts)
- [frontend/lib/products/leadership/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts)
- [frontend/lib/products/retention/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/dashboard.ts)
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/management-language.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/management-language.ts)

## Belangrijkste bevindingen

- Alle zes productlijnen hebben een samenvattende hoofdmetric op 1-10 schaal.
- ExitScan en RetentieScan hebben daarnaast aanvullende signalen die methodisch waardevol zijn, maar niet als concurrerende hoofdcijfers moeten worden gelezen.
- TeamScan, Onboarding, Pulse en Leadership gebruiken bewust compacte triagemodellen: een signaal, een beperkte set actieve factoren en een productspecifieke richtingsvraag.
- ExitScan bevat nog legacy-metingen zoals `preventability_result` en `replacement_cost_eur` die niet op hetzelfde niveau thuishoren als de hoofdmetric.
- RetentieScan trend-, herhaalmeet- en playbooklagen horen bij beschrijvende vervolguitleg en niet bij een extra hoofdmetric of effectlaag.

## Belangrijkste inconsistenties of risico's

- In opslag en backendpayloads heet de hoofdmetric vaak generiek `risk_score`, terwijl producttaal buyer-facing terecht productspecifiek is.
- ExitScan bevat meer nevenmetrics dan de andere lijnen, waardoor de kans op overlezing of schijnprecisie groter is.
- RetentieScan heeft sterke aanvullende signalen, maar de hoofdmetric moet leidend blijven om metric-verwarring te voorkomen.
- Technische veldnamen zoals `stay_intent_score` of verwante `stay_item`-routes lijken cross-product hetzelfde construct te meten, terwijl de managementvraag en interpretatie per lijn verschillen.

## Beslissingen / canonvoorstellen

- Elk product houdt precies een hoofdmetric als bestuurlijke managementsamenvatting.
- Factor-, SDT- en aanvullende signaallagen blijven ondersteunend, verklarend of verificerend.
- Interne payloadnamen zoals `risk_score` tellen niet als buyer-facing metriccanon; productlabels blijven leidend.
- Gedeelde direction/stay-velden in techniek of payloads tellen niet automatisch als gedeeld psychologisch construct; productcontext blijft leidend.
- RetentieScan trend-, repeat- en calibration-lagen blijven beschrijvende vervolglaag en geen zelfstandige metric- of effectlaag.

## Concrete wijzigingen

- Bestand ververst: [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)

## Metricinventaris

| Product | Hoofdmetric | Ondersteunende signalen | Contextsignalen / factorlaag | Interne of methodische hulplagen |
| --- | --- | --- | --- | --- |
| ExitScan | `Frictiescore` (`risk_score`) | vertrekredenen, meespelende redenen, eerdere signalering (`signal_visibility_score`) | `org_scores`, `sdt_scores`, factor-signalen en managementbanding | `preventability_result`, `replacement_cost_eur`, gewichten, recommendations |
| RetentieScan | `Retentiesignaal` (`risk_score`) | `stay_intent_score`, `turnover_intention_score`, `uwes_score`, `signal_profile` | `org_scores`, `sdt_scores`, topfactoren en banding | factor weights, weighted factors, recommendations, beschrijvende trend/repeat rows |
| TeamScan | `Teamsignaal` (`risk_score`) | `local_direction_score` uit een productspecifieke lokale richtingsvraag | actieve werkfactoren, lokale delta vs org, afdelingsread | `active_factors`, department-safe grouping, recommendations |
| Onboarding 30-60-90 | `Onboardingsignaal` (`risk_score`) | `checkpoint_direction_score` uit een productspecifieke checkpoint-richtingsvraag | actieve vroege werkfactoren, checkpoint context | `active_factors`, snapshot type, recommendations |
| Pulse | `Pulsesignaal` (`risk_score`) | bounded richtingsvraag via technisch `stay_intent_score` | actieve pulsefactoren, bounded vergelijklaag | `active_factors`, snapshot type, recommendations |
| Leadership Scan | `Leadershipsignaal` (`risk_score`) | `leadership_direction_score` uit een productspecifieke management-richtingsvraag | actieve leiderschaps-/werkfactoren, managementcontextread | `signal_patterns`, context summary, recommendations |

## Validatie

- De tabel volgt rechtstreeks uit productdefinities en scoringmodules.
- Waar `risk_score` backendbreed terugkeert is dit gekoppeld aan productspecifieke signal labels in definitions en dashboards.
- De inventaris verandert de vaste ExitScan-report-architectuur niet.
- De aanvullende RetentieScan-trendlaag is bewust als beschrijvende vervolglaag geregistreerd en niet als extra metric.

## Assumptions / defaults

- `recommendations` tellen in deze fase niet als metric, maar als vervolglaag.
- `risk_score` wordt productmatig gelezen als samenvattend signaal en niet als medisch, diagnostisch of voorspellend risicomodel.
- De compacte follow-on lijnen blijven bounded triagemodellen totdat latere method gates meer diepte dragen.
- Gedeelde direction/stay-velden in techniek of storage betekenen niet automatisch een gedeeld productconstruct.

## Next gate

Question-to-signal verification en method risk refresh opstellen.
