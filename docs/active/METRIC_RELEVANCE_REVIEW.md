# METRIC_RELEVANCE_REVIEW

Last updated: 2026-04-18  
Status: active  
Source of truth: metric inventory, scoring logic, dashboard interpretation rules and existing trust contracts.

## Titel

Metric And Measurement Review Flow - Relevance review

## Korte samenvatting

De hoofdmetrics zijn managementrelevant genoeg om te behouden. De grootste hardeningopgave zit niet in de samenvattende signalen zelf, maar in het begrenzen van aanvullende of legacy-metrics zodat ze niet zwaarder gaan klinken dan de surveybasis of productvorm draagt.

## Wat is geaudit

- [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)
- [backend/scoring_config.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring_config.py)
- [backend/products/exit/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/scoring.py)
- [backend/products/retention/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/scoring.py)
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [backend/products/onboarding/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/scoring.py)
- [backend/products/pulse/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/scoring.py)
- [backend/products/leadership/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/scoring.py)
- [frontend/lib/products/retention/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/dashboard.ts)
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/management-language.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/management-language.ts)

## Belangrijkste bevindingen

- `Frictiescore` en `Retentiesignaal` zijn beiden bruikbare samenvattingen voor de managementvraag, mits ze steeds samen gelezen worden met factor- en contextsignalen.
- De bounded productlijnen hebben logische één-cijfer-triage, juist omdat hun surveybasis klein en hun managementvraag smal is.
- `preventability_result` en `replacement_cost_eur` zijn veel kwetsbaarder voor overclaim dan de andere metriclagen.
- RetentieScan aanvullende signalen zijn relevant, maar alleen zolang de hiërarchie duidelijk blijft: retentiesignaal eerst, aanvullend signaal daarna.

## Belangrijkste inconsistenties of risico's

- Als aanvullende signalen zoals `stay_intent`, `turnover_intention` of `engagement` even zwaar worden gecommuniceerd als de hoofdmetric, ontstaat metricverwarring.
- Als legacy ExitScan-metrics buyer-facing blijven meeliften, ontstaat schijnprecisie die methodisch niet proportioneel is.
- De generieke backendnaam `risk_score` kan intern nuttig zijn, maar vraagt altijd productspecifieke vertaling in rapport en dashboard.

## Beslissingen / canonvoorstellen

- Hoofdmetrics blijven `keep`.
- Aanvullende signalen in ExitScan en RetentieScan worden `tighten`.
- `preventability_result` en `replacement_cost_eur` worden `degrade` naar interne of sterk begrensde methodlaag.
- Factor- en SDT-lagen blijven `keep` als interpretatielaag, niet als concurrerende hoofdmetric.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [METRIC_RELEVANCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_RELEVANCE_REVIEW.md)

## Relevance review

| Metriclaag | Managementrelevantie | Stabiliteit | Risico op schijnprecisie | Reviewuitkomst |
| --- | --- | --- | --- | --- |
| Hoofdmetric per product (`Frictiescore`, `Retentiesignaal`, `Teamsignaal`, `Onboardingsignaal`, `Pulsesignaal`, `Leadershipsignaal`) | Hoog | Middel tot hoog | Middel | Keep |
| Factorgemiddelden / factor-signalen | Hoog | Middel | Middel | Keep |
| SDT-totaal en SDT-risico | Middel tot hoog | Middel | Middel | Keep als onderliggende laag |
| Retentie aanvullende signalen (`stay_intent`, `turnover intentie`, `bevlogenheid`) | Hoog | Middel | Middel | Tighten |
| Richtingsvragen in bounded lijnen | Middel | Middel | Laag tot middel | Keep als ondersteunend |
| Signal profile / banding / management label | Hoog | Middel | Middel | Keep |
| Exit eerdere signalering (`signal_visibility_score`) | Middel tot hoog | Middel | Middel | Tighten |
| Exit vertrekredenen en meespelende redenen | Hoog | Middel | Middel | Keep als contextlaag |
| `preventability_result` | Middel | Laag tot middel | Hoog | Degrade |
| `replacement_cost_eur` | Laag tot middel | Laag | Hoog | Degrade |

## Validatie

- Relevance is beoordeeld op basis van daadwerkelijke scoring en dashboardlogica, niet alleen productcopy.
- De review laat de vaste ExitScan-report-architectuur ongemoeid.
- Geen nieuwe productclaim of metric is toegevoegd.

## Assumptions / defaults

- Een metric is alleen `keep` als hij de managementvraag helpt verhelderen zonder nieuwe pseudozekerheid te introduceren.
- `Degrade` betekent hier niet direct verwijderen uit code, maar wel uit buyer-facing of primaire managementlezing halen.

## Next gate

Metric decision matrix en hiërarchiecanon vastleggen.
