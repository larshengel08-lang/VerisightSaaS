# PRODUCT_LINE_STATUS_BOARD

Last updated: 2026-04-18  
Status: active  
Source of truth: product line baseline review, parity matrix, backlog and hardening waves.

## Titel

Product Line Hardening Flow - Status board

## Korte samenvatting

Dit statusboard geeft per productlijn de huidige interne maturitystand, grootste blocker en eerstvolgende gate. Het is een intern hardeningboard en geen publieke statuskaart.

## Wat is geaudit

- [PRODUCT_LINE_BASELINE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_BASELINE_REVIEW.md)
- [PRODUCT_LINE_PARITY_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_PARITY_MATRIX.md)
- [PRODUCT_LINE_HARDENING_BACKLOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_HARDENING_BACKLOG.md)
- [PRODUCT_LINE_HARDENING_WAVES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_HARDENING_WAVES.md)

## Belangrijkste bevindingen

- Alleen ExitScan en RetentieScan kunnen intern als `core_proven` worden gelezen.
- TeamScan en Onboarding hebben de duidelijkste parityroute.
- Pulse en Leadership moeten bounded blijven totdat formele output en paritydiepte sterker zijn.

## Belangrijkste inconsistenties of risico's

- De marketingstatus `live` is geen betrouwbare vervanging voor dit board.
- Zonder dit board kan productverbreding sneller lopen dan producthardening.

## Beslissingen / canonvoorstellen

- Dit board is voorlopig het leidende interne overzicht voor product line maturity.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LINE_STATUS_BOARD.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md)

## Status board

| Productlijn | Working label | Huidige status | Grootste blocker | Eerstvolgende gate |
| --- | --- | --- | --- | --- |
| ExitScan | `core_proven` | intern en buyer-facing kernroute | buyer-facing drift en legacy nevenmetrics | Wave A closeout |
| RetentieScan | `core_proven` | intern en buyer-facing kernroute | naming debt en aanvullende signaaldiscipline | Wave A/B normalization |
| TeamScan | `parity_build` | intern bruikbaar, buyer-facing bounded | formele report/output parity | Wave A truth boundary -> Wave B parity |
| Onboarding 30-60-90 | `parity_build` | intern bruikbaar, buyer-facing bounded | formele report/output parity | Wave A truth boundary -> Wave B parity |
| Pulse | `bounded_support_route` | bounded bruikbaar | beperkte outputvolwassenheid en trendbegrenzing | Wave A truth boundary |
| Leadership Scan | `bounded_support_route` | bounded bruikbaar | formele output parity en identity-risk | Wave A truth boundary |
| Combinatie | `portfolio_route` | buyer-facing portfolioroute | suite- en bundeldrift voorkomen | commerciële routeverfijning later |

## Validatie

- Het board volgt de interne working labels zoals in dit hardeningprogramma afgesproken.
- Het board promoot geen nieuwe productstatus naar buiten.

## Assumptions / defaults

- `intern bruikbaar` betekent niet automatisch parity bereikt.
- `buyer-facing bounded` betekent alleen dat routeactivatie kan bestaan, niet dat formele output parity al gehaald is.

## Next gate

Commercial architecture and onboarding flow refinement.
