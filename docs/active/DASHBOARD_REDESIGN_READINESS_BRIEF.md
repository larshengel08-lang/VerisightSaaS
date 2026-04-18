# DASHBOARD_REDESIGN_READINESS_BRIEF

Last updated: 2026-04-18  
Status: active  
Source of truth: product language canon, metric hierarchy canon, product line status board and report-to-action program plan.

## Titel

Redesign Readiness - Dashboard brief

## Korte samenvatting

Dit brief geeft de dashboard-redesignthread een duidelijke inhoudelijke rail. De redesignlaag mag interactie, compositie en visual hierarchy verbeteren, maar niet zelfstandig producttaal, metriekhierarchie of productstatus bepalen.

## Wat is geaudit

- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [METRIC_HIERARCHY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HIERARCHY_CANON.md)
- [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)
- [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)
- [PRODUCT_LINE_STATUS_BOARD.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md)
- [PRODUCT_LINE_PARITY_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_PARITY_MATRIX.md)
- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)

## Belangrijkste bevindingen

- Dashboard en rapport delen nu genoeg taal- en actielogica om een vaste UX-rail te vormen.
- De belangrijkste inhoudelijke bescherming voor redesign zit in de hoofdmetric per product, de signaallaag eronder en de bounded status van meerdere follow-on routes.
- Follow-on producten kunnen visueel aantrekkelijk worden gepresenteerd, maar mogen niet via UI-status of CTA-framing naar hogere maturity worden opgetild.
- Bounded routes schakelen in hun follow-through terug naar `bredere duiding`, niet naar zwaardere diagnoseframing.

## Belangrijkste inconsistenties of risico's

- Een redesignthread kan te snel meerdere signalen als gelijkwaardige hoofd-KPI's tonen, wat de managementvraag vertroebelt.
- Statusbadges, labels of CTA's kunnen impliciet productpromotie doen die de paritylaag nog niet draagt.
- Meer detail zichtbaar maken kan methodische schijnprecisie vergroten als de hierarchie niet leidend blijft.

## Beslissingen / canonvoorstellen

- Elk product opent het dashboard met precies een hoofdmetric.
- De leesvolgorde blijft: hoofdmetric -> signaallaag -> contextlaag -> eerste managementroute.
- `core_proven`, `parity_build`, `bounded_support_route` en `portfolio_route` blijven interne working labels en mogen niet als publieke UI-status worden genormaliseerd zonder aparte gate.
- Het dashboard moet dezelfde report-to-action volgorde blijven sturen als rapport en onboarding.
- Productspecifieke executive labels blijven intact:
  - TeamScan: `Lokale handoff`
  - Onboarding 30-60-90: `Checkpoint-handoff`
  - Leadership Scan: `Management-handoff`

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [DASHBOARD_REDESIGN_READINESS_BRIEF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DASHBOARD_REDESIGN_READINESS_BRIEF.md)

## Handoff rules

- Mag veranderen:
  - lay-out en informatiecompositie
  - visual hierarchy van hero, signal cards en action layer
  - mobile/desktop verdeling
  - interactiepatronen die de bestaande leeslijn verduidelijken
- Mag niet veranderen:
  - producthoofdmetric
  - betekenis van signalen
  - bounded productstatus
  - report-to-action contract
  - methodische suppressie- en trustgrenzen
- Moet zichtbaar blijven:
  - eerste managementvraag
  - eerste prioriteit of eerste verificatiespoor
  - eerste eigenaar
  - eerste stap
  - reviewmoment
  - bounded fallback naar bredere duiding waar de route dat vraagt

## Validatie

- Dit brief houdt redesign weg van product- en methodbesluiten.
- De rules volgen de metric- en methodsignoff van dit hardeningprogramma.
- Er wordt geen productstatus of pricingbesluit vastgelegd.

## Assumptions / defaults

- Dashboardredesign werkt op bestaande productdefinities en niet op nieuwe productpositionering.
- De sterkste paritylat ligt nog steeds bij ExitScan en RetentieScan; follow-on routes blijven visueel begrensd totdat parity verder is gehard.
- Statusbadges of CTA-labels mogen non-core routes niet optillen boven hun huidige bounded productrealiteit.

## Next gate

Commercial shell readiness vastleggen voor homepage, aanpak en tarieven zonder portfolio-overspraak.
