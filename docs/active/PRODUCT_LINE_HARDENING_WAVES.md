# PRODUCT_LINE_HARDENING_WAVES

Last updated: 2026-04-18  
Status: active  
Source of truth: product line hardening backlog.

## Titel

Product Line Hardening Flow - Waves

## Korte samenvatting

De hardeningwaves zijn gestructureerd in drie blokken: `Wave A` voor truth and safety, `Wave B` voor parity and management use en `Wave C` voor release readiness. Deze volgorde voorkomt dat buyer-facing activatie opnieuw harder gaat lopen dan productrealiteit.

## Wat is geaudit

- [PRODUCT_LINE_HARDENING_BACKLOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_HARDENING_BACKLOG.md)
- [PRODUCT_PARITY_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_PARITY_PROGRAM_PLAN.md)

## Belangrijkste bevindingen

- Bijna alle producten hebben eerst `Wave A` nodig voordat verdere parity of promotie gezond is.
- TeamScan en Onboarding zijn de duidelijkste kandidaten voor `Wave B` zodra report/output parity is besloten.

## Belangrijkste inconsistenties of risico's

- `Wave C` mag niet worden geïnterpreteerd als automatische commerciële promotie; het blijft een interne readinesswave.

## Beslissingen / canonvoorstellen

- De vaste volgorde is: eerst truth and safety, dan parity and management use, dan release readiness.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LINE_HARDENING_WAVES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_HARDENING_WAVES.md)

## Waves

### Wave A - Truth and safety

- ExitScan: nevenmetrics degraden en buyer-facing drift fixen
- RetentieScan: hoofdmetrichiërarchie en bounded methodlabels aanscherpen
- TeamScan: report/output boundary expliciteren versus buyer-facing claims
- Onboarding: report/output boundary expliciteren versus buyer-facing claims
- Pulse: review-only bounded language en comparison limits expliciteren
- Leadership: non-named-leader en non-360 trustlaag overal doortrekken

### Wave B - Parity and management use

- TeamScan: formele output parity en rijkere managementduiding
- Onboarding: formele output parity en checkpointduiding verdiepen
- RetentieScan: naming debt en aanvullende signaalhiërarchie verder normaliseren
- Pulse: bounded managementreview en opvolglogica verdiepen
- Leadership: group-level managementcontext en formele handoff verdiepen

### Wave C - Release readiness

- Cross-layer consistency checks
- buyer-facing mirrorchecks tegen canon
- QA- en acceptancecloseout per productlijn
- statusboard refresh vóór bredere promotie

## Validatie

- De waves respecteren de huidige boundary dat redesign en commerciële shell elders lopen.
- Geen wave heropent de vastgezette ExitScan-report-architectuur.

## Assumptions / defaults

- `Wave B` start alleen als `Wave A` voor dat product voldoende is afgevinkt.
- `Wave C` betekent readiness voor gecontroleerde activatie, niet automatisch suitepromotie.

## Next gate

Product line status board.
