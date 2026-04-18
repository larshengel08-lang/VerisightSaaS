# METRIC_DECISION_MATRIX

Last updated: 2026-04-18  
Status: active  
Source of truth: metric inventory, relevance review and current scoring implementation.

## Titel

Metric And Measurement Review Flow - Decision matrix

## Korte samenvatting

Deze matrix zet elke relevante metriclaag op `keep`, `tighten`, `degrade` of `retire`. De hoofdkeuze is dat de suite doorbouwt op één bestuurlijke hoofdmetric per product, terwijl legacy ExitScan-metrics en te harde afleidingen nadrukkelijk omlaag worden gezet.

## Wat is geaudit

- [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)
- [METRIC_RELEVANCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_RELEVANCE_REVIEW.md)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)

## Belangrijkste bevindingen

- Er is geen noodzaak om hoofdmetrics te vervangen; wel om hun hiërarchie harder vast te leggen.
- ExitScan heeft de meeste noodzaak tot metricbegrenzing.
- RetentieScan heeft de meeste noodzaak tot hiërarchische discipline tussen hoofdmetric en aanvullende signalen.

## Belangrijkste inconsistenties of risico's

- Interne naming (`risk_score`) en buyer-facing naming kunnen zonder canon uit elkaar gaan lopen.
- Een degrade-besluit zonder expliciete canon zou in latere flows alsnog teruggedraaid kunnen worden via copy of dashboarddrift.

## Beslissingen / canonvoorstellen

- Beslissingen in deze matrix gelden als inhoudelijke default voor rapport, dashboard, onboarding en later buyer-facing mirrors.
- `Retire` wordt in deze fase niet breed gebruikt; de meeste zwakke lagen zijn nog intern bruikbaar maar niet meer leidend.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [METRIC_DECISION_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_DECISION_MATRIX.md)

## Decision matrix

| Product / metric | Besluit | Toelichting |
| --- | --- | --- |
| ExitScan `Frictiescore` | Keep | Hoofdmetric voor bestuurlijke vertrekduiding |
| ExitScan factor-signalen | Keep | Nodig om frictiescore niet los te lezen |
| ExitScan SDT-risico | Keep | Onderliggende psychologische laag, niet als tweede hoofdmetric |
| ExitScan vertrekredenen / meespelende redenen | Keep | Nodige contextlaag voor managementduiding |
| ExitScan eerdere signalering | Tighten | Relevante context, maar geen concurrerend hoofdcijfer |
| ExitScan `preventability_result` | Degrade | Te gevoelig voor overclaim; hoogstens interne methodhulp |
| ExitScan `replacement_cost_eur` | Degrade | Commercieel verleidelijk maar methodisch te dun als kernlezing |
| RetentieScan `Retentiesignaal` | Keep | Hoofdmetric voor vroegsignalering op behoud |
| RetentieScan factor-signalen | Keep | Eerste verificatiespoor en managementroute |
| RetentieScan `stay_intent` | Tighten | Aanvullend signaal, geen hoofdmetric |
| RetentieScan `turnover intention` | Tighten | Aanvullend signaal, verification-first |
| RetentieScan `bevlogenheid` | Tighten | Aanvullend energiemaatje, niet de hoofduitkomst |
| RetentieScan `signal_profile` | Keep | Bruikbare bestuurlijke synthese van hoofdmetric plus aanvullingen |
| TeamScan `Teamsignaal` | Keep | Hoofdmetric voor bounded localisatie |
| TeamScan lokale richtingsvraag | Keep | Nodig voor bounded vervolglogica |
| TeamScan afdelingdelta's | Tighten | Alleen tonen waar safe grouping en verschilsterkte dit dragen |
| Onboarding `Onboardingsignaal` | Keep | Hoofdmetric voor enkel checkpoint |
| Onboarding checkpoint-richting | Keep | Functioneel ondersteunend voor eerste handoff |
| Pulse `Pulsesignaal` | Keep | Hoofdmetric voor bounded reviewmoment |
| Pulse richtingsvraag | Tighten | Ondersteunend, niet trendbewijs |
| Leadership `Leadershipsignaal` | Keep | Hoofdmetric voor geaggregeerde managementcontext |
| Leadership managementrichting | Keep | Ondersteunende handofflaag |

## Validatie

- Elke beslissing sluit aan op de geobserveerde trust contracts en scoring-opbouw.
- Geen beslissing raakt de vastgezette ExitScan-report-architectuur.

## Assumptions / defaults

- `Keep` betekent buyer-facing toegestaan binnen de productgrenzen.
- `Tighten` betekent alleen tonen of benoemen met expliciete interpretatieregels.
- `Degrade` betekent niet primair buyer-facing en niet leidend in managementsamenvatting.

## Next gate

Metric hierarchy canon en formele metricsignoff afronden.
