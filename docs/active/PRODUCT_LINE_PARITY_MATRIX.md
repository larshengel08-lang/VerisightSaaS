# PRODUCT_LINE_PARITY_MATRIX

Last updated: 2026-04-18  
Status: active  
Source of truth: product line baseline review and current repo/runtime behavior.

## Titel

Product Line Hardening Flow - Parity matrix

## Korte samenvatting

De paritymatrix laat zien waar de drift per productlijn precies zit tussen survey, scoring, report, dashboard, action handoff en buyer-facing claims. De kern is helder: de kernroutes zijn breed gedragen, terwijl meerdere follow-on routes vooral op formele output en paritydiepte achterlopen.

## Wat is geaudit

- [PRODUCT_LINE_BASELINE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_BASELINE_REVIEW.md)
- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

## Belangrijkste bevindingen

- ExitScan en RetentieScan scoren het hoogst op cross-layer parity.
- TeamScan en Onboarding zijn inhoudelijk geloofwaardig, maar breken parity op formele reportoutput.
- Pulse en Leadership hebben de grootste afstand tussen bounded waarheid en bredere buyer-facing leesbaarheid.

## Belangrijkste inconsistenties of risico's

- Follow-on buyer-facing activatie kan te volwassen klinken zolang report parity nog ontbreekt.
- Report availability is nu de sterkste objectieve paritymarker in de suite.

## Beslissingen / canonvoorstellen

- Productvolwassenheid wordt in deze fase primair beoordeeld op cross-layer parity, niet op losse marketingactivatie.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LINE_PARITY_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_PARITY_MATRIX.md)

## Parity matrix

| Product | Survey | Scoring | Report | Dashboard | Action handoff | Claims | Oordeel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ExitScan | sterk | sterk | sterk | sterk | sterk | middel-sterk | dichtst bij volledige parity |
| RetentieScan | sterk | sterk | sterk | sterk | sterk | sterk | kernroute met beperkte naming debt |
| TeamScan | middel-sterk | middel-sterk | zwak | sterk | middel-sterk | middel | parity_build |
| Onboarding 30-60-90 | middel-sterk | middel-sterk | zwak | sterk | middel-sterk | middel-sterk | parity_build |
| Pulse | middel | middel | zwak | middel-sterk | middel | middel | bounded_support_route |
| Leadership Scan | middel | middel | zwak | middel-sterk | middel | middel | bounded_support_route |
| Combinatie | n.v.t. | n.v.t. | n.v.t. | n.v.t. | middel | middel | portfolio_route, geen zelfstandig product |

## Validatie

- `zwak` op report betekent hier expliciet: formele output ontbreekt of is nog niet paritywaardig.
- De matrix volgt de huidige repo-realiteit en niet gewenste toekomstarchitectuur.

## Assumptions / defaults

- `sterk` betekent niet perfect; wel voldoende gedragen over meerdere lagen.
- `middel` of `zwak` impliceert backlogwerk, niet automatisch escalatie.

## Next gate

Hardening backlog en waves.
