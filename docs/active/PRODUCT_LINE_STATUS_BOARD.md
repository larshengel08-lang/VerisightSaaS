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
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)

## Belangrijkste bevindingen

- Alleen ExitScan en RetentieScan kunnen intern als `core_proven` worden gelezen.
- TeamScan en Onboarding hebben de duidelijkste parityroute.
- Pulse en Leadership moeten bounded blijven totdat formele output en paritydiepte sterker zijn.
- De scherpste open methodische blocker zit nu niet meer in kerncopy, maar in claimdiscipline, output parity en gedeelde veldsemantiek.

## Belangrijkste inconsistenties of risico's

- De marketingstatus `live` is geen betrouwbare vervanging voor dit board.
- Zonder dit board kan productverbreding sneller lopen dan producthardening.

## Beslissingen / canonvoorstellen

- Dit board is voorlopig het leidende interne overzicht voor product line maturity.

## Concrete wijzigingen

- Bestand ververst: [PRODUCT_LINE_STATUS_BOARD.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md)

## Status board

| Productlijn | Working label | Huidige status | Grootste blocker | Eerstvolgende gate |
| --- | --- | --- | --- | --- |
| ExitScan | `core_proven` | intern en buyer-facing kernroute | legacy nevenmetrics en helperlagen begrensd houden | Wave A closeout |
| RetentieScan | `core_proven` | intern en buyer-facing kernroute | longitudinale claimdiscipline en gedeelde veldsemantiek | metrics/method closeout |
| TeamScan | `parity_build` | intern bruikbaar, buyer-facing bounded | formele report/output parity en lokale reportgrammar | Wave B parity |
| Onboarding 30-60-90 | `parity_build` | intern bruikbaar, buyer-facing bounded | formele report/output parity en checkpoint-read hardening | Wave B parity |
| Pulse | `bounded_support_route` | bounded bruikbaar | trendbegrenzing en formele output parity | Wave A truth boundary -> Wave B parity |
| Leadership Scan | `bounded_support_route` | bounded bruikbaar | formele output parity en identity-risk | Wave A truth boundary -> Wave B parity |
| Combinatie | `portfolio_route` | buyer-facing portfolioroute | suite- en bundeldrift voorkomen | commerciele routeverfijning later |

## Validatie

- Het board volgt de interne working labels zoals in dit hardeningprogramma afgesproken.
- Het board promoot geen nieuwe productstatus naar buiten.

## Assumptions / defaults

- `intern bruikbaar` betekent niet automatisch parity bereikt.
- `buyer-facing bounded` betekent alleen dat routeactivatie kan bestaan, niet dat formele output parity al gehaald is.
- Working labels blijven intern en volgen de actuele product-, parity- en methodrealiteit; ze zijn geen externe statuspromotie.

## Next gate

Metrics/method closeout en eventuele product line wave-herijking.
