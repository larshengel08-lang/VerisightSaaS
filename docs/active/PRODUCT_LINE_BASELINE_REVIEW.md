# PRODUCT_LINE_BASELINE_REVIEW

Last updated: 2026-04-22  
Status: active  
Source of truth: product definitions, scoring modules, active parity plans, onboarding 5-readiness signoff, fixed ExitScan report architecture and current runtime/output behavior.

## Titel

Product Line Hardening Flow - Baseline review

## Korte samenvatting

De productlijnen vallen nu in drie duidelijke groepen uiteen. ExitScan is de sterkste embedded baseline en blijft de referentie. RetentieScan is inhoudelijk sterk en commercieel kernwaardig. Onboarding 30-60-90 staat nu expliciet op 5-niveau binnen bounded peer-scope, terwijl TeamScan niet langer als actieve paritypromotiecasus hoeft te worden gelezen. Pulse en Leadership blijven `bounded_support_route`.

## Wat is geaudit

- [EXITSCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_PRODUCT_SHARPENING_PLAN.md)
- [RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)
- [ONBOARDING_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_PARITY_GAP_ANALYSIS_PLAN.md)
- [LEADERSHIP_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LEADERSHIP_PARITY_GAP_ANALYSIS_PLAN.md)
- [PRODUCT_PARITY_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_PARITY_PROGRAM_PLAN.md)
- [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)
- [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

## Belangrijkste bevindingen

- ExitScan is `core_proven` en blijft de huidige embedded basis voor report truth.
- RetentieScan is intern ook `core_proven`, maar nog niet overal op exact hetzelfde canon- en reportdisciplineniveau als ExitScan.
- Onboarding 30-60-90 heeft nu inhoudelijk en architectonisch genoeg zelfstandigheid om als expliciet `peer_5_frozen` te behandelen.
- TeamScan blijft inhoudelijk bounded bruikbaar, maar geen actieve peer-promotiecasus.
- Leadership en Pulse zijn waardevolle bounded routes, maar formele output en paritydiepte lopen nog achter op hun buyer-facing activatie.
- De marketinglaag noemt meerdere follow-on routes `live`, terwijl backend-formele output voor `pulse`, `team`, `onboarding` en `leadership` in deze wave nog `422` kan geven.

## Belangrijkste inconsistenties of risico's

- Buyer-facing activatie loopt verder vooruit dan formele productvolwassenheid bij meerdere follow-on routes.
- `formele reportoutput` is de grootste objectieve scheidslijn tussen kernroutes en parity-build/bounded routes.
- Zonder statusboard kan “live” worden verward met “volwassen en paritywaardig”.

## Beslissingen / canonvoorstellen

- Working maturity labels blijven intern analysegereedschap.
- `core_proven` geldt nu voor ExitScan en RetentieScan.
- `peer_5_frozen` geldt nu voor Onboarding 30-60-90.
- `parity_build` blijft alleen nog een historisch label in oudere paritytracks en is niet langer de actuele waarheid voor Onboarding.
- `bounded_support_route` geldt nu voor Pulse en Leadership Scan.
- `portfolio_route` geldt voor Combinatie.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LINE_BASELINE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_BASELINE_REVIEW.md)

## Baseline review

| Productlijn | Working label | Huidige baseline | Grootste kracht | Grootste gap |
| --- | --- | --- | --- | --- |
| ExitScan | `core_proven` | sterkste embedded baseline, vaste reportarchitectuur, managementduiding staat | product truth en report truth zijn het scherpst | buyer-facing mirror drift en legacy nevenmetrics |
| RetentieScan | `core_proven` | sterk survey/scoring/dashboard/rapportproduct, kernroute voor behoud | vroege behoudsduiding met rijke aanvullende signalen | interne `risk`-naming en nog niet overal exact ExitScan-niveau |
| TeamScan | `parity_build` | bounded runtime-route met lokale prioritering | department-first lokalisatie en veilige bounded handoff | formele report parity ontbreekt |
| Onboarding 30-60-90 | `peer_5_frozen` | bounded peer-route met formele executive architectuur en preview/prooflaag | scherpe single-checkpoint logica met volwassen managementread | bounded lifecycle-discipline expliciet bewaken |
| Pulse | `bounded_support_route` | bounded reviewroute en cycle-read | compacte review- en ritmelogica | beperkte outputvolwassenheid en trenddiepte |
| Leadership Scan | `bounded_support_route` | bounded managementcontextroute | sterke trust- en boundarylaag | formele output parity ontbreekt en identity-risico blijft hoog |
| Combinatie | `portfolio_route` | route tussen kernproducten | logisch portfoliopad zonder derde kernproduct | gevoelig voor suite- of bundeldrift |

## Validatie

- De baseline-oordelen zijn herleidbaar naar actieve plannen, scoring, buyer-facing activatie en backend-outputgedrag.
- Geen productstatus is publiek gecanoniseerd; dit blijft een intern hardeningboard.

## Assumptions / defaults

- Een buyer-facing route mag bestaan zonder volledige parity, zolang bounded scope en truthgrenzen expliciet bewaakt blijven.
- De vaste ExitScan-report-architectuur blijft onaantastbare referentie, niet template voor identieke productstructuren.

## Next gate

Cross-layer parity matrix.
