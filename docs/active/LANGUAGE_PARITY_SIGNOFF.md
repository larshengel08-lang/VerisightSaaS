# LANGUAGE_PARITY_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: ExitScan embedded runtime truth and the already fixed ExitScan report architecture remain leading boundaries for this signoff. Shared grammar follows the existing report canon; buyer-facing mirrors and working maturity labels remain downstream layers.

## Titel

Language And Truth Parity Flow - Signoff gate

## Korte samenvatting

De language parity-flow is inhoudelijk voldoende gehard om af te sluiten en door te schuiven naar metric- en method review. De kerntermen voor ExitScan en RetentieScan zijn vastgelegd, de laagvolgorde is expliciet gemaakt en de belangrijkste driftzones zijn benoemd. Er blijft wel gerichte buyer-facing drift openstaan, maar die drift blokkeert de volgende hardeningfase niet zolang de embedded truth en de vastgezette ExitScan-report-architectuur leidend blijven.

## Wat is geaudit

- [LANGUAGE_PARITY_INVENTORY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_PARITY_INVENTORY.md)
- [LANGUAGE_DRIFT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_DRIFT_MATRIX.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [REPORT_TRUTH_BASELINE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TRUTH_BASELINE.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
- [voorbeeldrapport_retentiescan.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_retentiescan.pdf)

## Belangrijkste bevindingen

- ExitScan en RetentieScan hebben nu een expliciete producttaalcanon die bruikbaar is voor rapport, dashboard, onboarding en buyer-facing mirrorlagen.
- De vastgezette ExitScan-report-architectuur blijft intact; deze signoff wijzigt of heropent die architectuur niet.
- De gedeelde report grammar is stabiel genoeg om de volgende metric- en methodebesluiten op te baseren.
- De grootste resterende drift zit in buyer-facing detailcopy en in portfolio-overzichtstaal, niet in de embedded productdefinities.

## Belangrijkste inconsistenties of risico's

- Buyer-facing headlinecopy voor ExitScan en RetentieScan kan nog te generiek of te delivery-gedreven lezen.
- Voorbeeldrapporten blijven deels achter op de nieuwere grammar en moeten daarom als mirrorlaag worden gelezen, niet als primaire canon.
- `status: 'live'` in productoverzichten kan te vroeg productvolwassenheid suggereren voor follow-on routes.

## Beslissingen / canonvoorstellen

- De language parity-gate is `pass with controlled drift`.
- `Embedded truth` en de vastgezette ExitScan-report-architectuur zijn de harde beslislaag bij elke volgende fase.
- `Shared grammar` is voldoende stabiel voor metric review, method review en product line hardening.
- Open buyer-facing drift wordt niet nu al als redesignprobleem behandeld, maar als gerichte truth-fix backlog voor latere uitvoering.
- Working maturity labels blijven intern en worden in volgende fases alleen gebruikt als analysehulpmiddel.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [LANGUAGE_PARITY_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_PARITY_SIGNOFF.md)
- De language parity-flow formeel afgesloten met een expliciete go/no-go-beslissing voor vervolgfasen

## Validatie

- Signoff is gebaseerd op de eerder vastgelegde inventory, driftmatrix en product language canon.
- De signoff bevestigt uitdrukkelijk dat de ExitScan-report-architectuur buiten scope blijft voor wijziging.
- Er zijn geen nieuwe commerciële of methodische claims toegevoegd buiten de huidige product truth.

## Assumptions / defaults

- De volgende fase mag starten zonder eerst buyer-facing copy te herschrijven, zolang metric- en methodbesluiten op embedded truth en report grammar steunen.
- Open buyer-facing drift wordt pas omgezet naar concrete copyfixes wanneer dat nodig is voor parity of trust.
- `Pass with controlled drift` betekent niet dat drift is opgelost; alleen dat zij voldoende begrensd is om vervolgwerk niet te blokkeren.

## Next gate

Metric And Measurement Review Flow - inventory en relevance review.
