# Project Scan And Expansion Boundary Audit

## Titel

Customer Expansion Boundary Notes

## Korte samenvatting

De suggester moet bestaan binnen de al vastgelegde dual-core en productmaturitygrenzen. Dat betekent: geen pricingverschuiving, geen suitepush, geen bounded route als kernroute verkopen en geen automatische productsprong zonder expliciete nieuwe managementvraag. De engine moet daarom strenger zijn dan marketingcopy en liever `nu niet` zeggen dan een te vroege vervolgrichting suggereren.

## Wat is geaudit

- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/NON_CORE_OUTPUT_PARITY_REVIEW.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/NON_CORE_DASHBOARD_PARITY_MATRIX.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/client-onboarding.ts`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/ops-delivery.ts`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/pilot-learning.ts`

## Belangrijkste bevindingen

- `Dual-core` is geen tijdelijke copykeuze maar de actieve commerciële default.
- `Pulse` en `Leadership Scan` zijn bounded support routes; ze mogen dus niet als nieuwe eerste hoofdroutes uit de suggester rollen.
- `TeamScan` en `Onboarding 30-60-90` zijn parity-build routes; ze mogen alleen voorgesteld worden waar hun huidige output, handoff en bounded use case dat dragen.
- `Segment Deep Dive` is verdieping, geen routevervanging.
- `Combinatie` is een portfoliokader, geen auto-suggestible vervolgaanbod.
- Deliverycanon eist dat first value, first action en reviewmoment eerst landen; expansion vóór die momenten is methodisch en commercieel te vroeg.

## Belangrijkste risico’s

- Het verwarren van `beschikbare productlijn` met `auto-voorstelbare vervolgroutes`.
- Het verwarren van `buyer-safe vervolg` met `technisch bestaande module`.
- Het laten sturen van de suggester door commerciële wensdruk in plaats van door productstatus en routefit.
- Het impliciet normaliseren van non-core routes door ze altijd als kaart mee te tonen, ook als ze `nu niet` horen te zijn.

## Beslissingen / canonvoorstellen

- De suggester gebruikt alleen producttruth-signalen, geen marketingconvenience.
- De suggester mag geen pricing-, bundel- of suite-argument gebruiken.
- De suggester mag geen cross-core sprong automatisch aanbevelen zonder expliciete menselijk bevestigde nieuwe managementvraag.
- `Nu niet` is een geldige en gewenste uitkomst.
- De engine mag alleen hoge confidence claimen wanneer zowel lifecycle-gates als routefit-gates groen zijn.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_BOUNDARY_NOTES.md`

## Auto-proposal boundary matrix

| Route | Mag automatisch voorgesteld worden | Voorwaarden | Boundary |
| --- | --- | --- | --- |
| RetentieScan ritme | ja | huidige route is `RetentieScan`, first management use bevestigd, eerste actie of reviewlogica aanwezig | blijft vervolg binnen bestaande core route |
| Compacte vervolgmeting | ja | first management use bevestigd, bounded reviewvraag, nog geen harde ritmebeslissing nodig | blijft kleiner dan vol ritme of nieuw product |
| Pulse | ja, voorzichtig | eerdere route heeft al eerste waarde en bounded review past beter dan bredere herdiagnose | nooit als nieuwe kernroute |
| Segment Deep Dive | ja, alleen met bewijs | voldoende respons, relevante metadata, scherp segmentdoel | verdieping, geen productverschuiving |
| TeamScan | ja, alleen lokaal | lokale verificatievraag, afdelingsmetadata, voldoende n per groep | parity-build, geen brede teamsuiteclaim |
| Onboarding 30-60-90 | nee in v1 | vraagt expliciete lifecyclevraag buiten huidige auto-inputs | parity-build, handmatige beslissing |
| Leadership Scan | nee in v1 | vraagt expliciete managementcontext buiten huidige auto-inputs | bounded, identity-risk |
| Combinatie | nee | portfolio-route, geen auto-offer | nooit als automatische vervolgstap |
| ExitScan/RetentieScan cross-core shift | nee in v1 | alleen bij expliciete nieuwe managementvraag | human-confirmed only |

## Claim ceiling

- `Aanbevolen`: route past aantoonbaar bij huidige routecanon en lifecyclegates.
- `Te overwegen`: route is verdedigbaar, maar vraagt nog menselijk oordeel of aanvullende context.
- `Nu niet`: route is te vroeg, te breed, onvoldoende onderbouwd of productmatig nog niet eerlijk.

## Validatie

- De boundary-notes volgen de actieve commercial architecture canon en productstatusboard.
- Geen enkel voorstel in deze notitie verschuift pricing, productstatus of commerciële architectuur.
- De matrix beschermt expliciet tegen suitepush en bounded-route inflatie.

## Assumptions / defaults

- v1 hoeft niet alle denkbare vervolgroutes te automatiseren om commercieel bruikbaar te zijn.
- Een auto-suggestie is beslisondersteuning voor sales/onboarding/delivery, geen klant-facing automation.
- Waar input ontbreekt, kiest de engine voor suppressie of lagere confidence.

## Next gate

Expansion Logic Design: inputs, gates, decision rules en outputvorm exact definiëren.
