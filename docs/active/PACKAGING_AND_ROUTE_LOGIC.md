# PACKAGING_AND_ROUTE_LOGIC

Last updated: 2026-04-26
Status: active  
Source of truth: commercial architecture canon, product line status board and client onboarding flow system.

## Titel

Commercial Architecture And Onboarding Flow Refinement - Packaging and route logic

## Korte samenvatting

Dit document zet de commerciele routearchitectuur om in expliciete packaging- en routebeslisregels. De kern is dat Verisight voorlopig een dual-core instap kent, terwijl de rest alleen als verdieping, bounded vervolg, embedded follow-through laag op de bestaande adminsurface of portfolioroute mag worden gelezen.

## Wat is geaudit

- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [PRODUCT_LINE_STATUS_BOARD.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [2026-04-25-action-center-second-live-consumer.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/plans/2026-04-25-action-center-second-live-consumer.md)
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

## Belangrijkste bevindingen

- `ExitScan` en `RetentieScan` mogen commercieel als eerste routes worden behandeld zonder de producttruth te overschrijven.
- `TeamScan` en `Onboarding 30-60-90` zijn geloofwaardige vervolgroutes, maar nog geen gelijkwaardige first-buy proposities.
- `Pulse` en `Leadership Scan` werken alleen veilig als bounded support routes na een eerste managementvraag of eerste managementactie.
- `Combinatie` is alleen logisch als portfolioverbindende route boven reeds bestaande managementvragen, niet als zelfstandig instappakket.
- Action Center is nu een echte interne productlaag, maar alleen als embedded follow-through voor bounded live consumers en niet als extra routevorm of pricinglaag.
- Die Action Center-laag betekent nu concreet een `follow_through`-workspace voor dossiers, assignments, reviewmomenten en follow-upsignalen; MTO en ExitScan zijn live, terwijl RetentieScan, Onboarding, Pulse en Leadership adaptermatig nog inactive zijn.

## Belangrijkste inconsistenties of risico's

- Buyer-facing overzichten die follow-on routes als `live` of volwaardige hoofdroutes framen, lopen voor op parity en formele outputvolwassenheid.
- Zonder routebeslisregels kan dual-core verschuiven naar suite-chaos of naar opportunistische upsellvolgorde.
- Packagingtaal kan te snel productstatus suggereren als instap, vervolg en bounded support niet expliciet gescheiden blijven.
- Zodra Action Center nergens expliciet is geclassificeerd, kan het onbedoeld gaan voelen als derde product, cockpitmodule of suite-shell terwijl de huidige laag alleen bounded follow-through draagt.

## Beslissingen / canonvoorstellen

- `Instap` betekent voorlopig alleen: een eerste route die zelfstandig de eerste managementvraag kan openen. Dat zijn nu `ExitScan` en `RetentieScan`.
- `Verdieping` betekent: extra duiding, segmentwerk of managementsessie bovenop een gekozen eerste route.
- `Vervolg` betekent: ritme, review of herhaalmeting nadat first value en first action al zijn geland.
- `Bounded support` betekent: smaller use case, begrensde claim en geen zelfstandige suite- of statuspromotie.
- `Embedded follow-through layer` betekent: een interne gedeelde productlaag die dossiers, eigenaarschap, reviewmomenten en signalen bundelt onder guided execution zonder buyer-facing pricing, losse moduleclaim of open adapterverhaal.
- Action Center betekent in deze fase concreet: bounded `follow_through`, geen project-plan/advisory-scope en geen live entry buiten MTO en ExitScan.
- `Portfolio route` betekent: verbindende route tussen meerdere echte managementvragen, niet een derde productkern.
- De commerciele default is `dual-core`, maar die default herdefinieert de vaste ExitScan-report-architectuur of de productmaturitylabels niet.
- Action Center valt nu expliciet onder `embedded follow-through layer` en niet onder `instap`, `verdieping`, `vervolg`, `bounded support` of `portfolio route`.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PACKAGING_AND_ROUTE_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md)

## Route and layer logic

| Routevorm | Mag buyer-facing worden gebruikt als | Mag niet worden gebruikt als | Huidige producten |
| --- | --- | --- | --- |
| Instap | de route zelfstandig de eerste managementvraag opent en de productketen dat echt draagt | brede suite-ingang of impliciete portfolio-pitch | ExitScan, RetentieScan |
| Verdieping | er al een gekozen eerste route is en extra duiding of segmentwerk logisch volgt | vervanging van een first-buy beslissing | segment deep dive, extra managementsessie |
| Vervolg | first value en first action al zijn geland | los add-on verhaal zonder managementdoel | vervolgmeting, ritmeroute |
| Bounded support | de vraag smaller is dan een kernroute en de begrenzing expliciet blijft | nieuwe kernpropositie of brede statusclaim | Pulse, Leadership Scan |
| Embedded follow-through layer | de laag intern dossiers, reviewdruk, assignments en eigenaarschap bundelt onder guided execution voor al actieve carriers | publiek prijsanker, derde product, buyer-facing module of bewijs van brede adapterdekking | Action Center (MTO + ExitScan live; RetentieScan/Onboarding/Pulse/Leadership inactive) |
| Lokale verificatie | er een bestaande hoofdvraag is die lokaal of per team getoetst moet worden | generieke teamsuite als eerste verkoopverhaal | TeamScan |
| Lifecycle-check | er een specifieke onboardingvraag ligt na of naast de eerste kernroute | algemeen HR operating system | Onboarding 30-60-90 |
| Portfolio route | meerdere echte managementvragen tegelijk bestuurlijk spelen | bundel als hoofdverhaal of prijsanker | Combinatie |

## Validatie

- De route-indeling volgt de huidige statusboard- en commercial-canonlogica.
- Er wordt geen nieuwe pricingstructuur of portfolioverbreding vastgezet.
- De indeling beschermt expliciet tegen buyer-facing overspraak van parity-build en bounded routes.
- Action Center is nu expliciet geclassificeerd zonder nieuwe commerciële scope te openen.
- De indeling botst niet met de gedeelde Action Center-core: geen adapteropening, geen project-plan/advisory-scope en geen routeclaim buiten de twee live consumers.

## Assumptions / defaults

- `Instap` is een commerciele routecategorie en geen repo-brede productstatus.
- `Bounded support` beschrijft routegebruik, niet waardeloosheid of afwijzing.
- Producten zonder volledige formele report parity mogen nog steeds intern of bounded worden gebruikt, zolang de claimlaag beperkt blijft.
- Action Center beschrijft nu een bestaande interne productlaag met twee bounded live consumers, niet een publieke route, apart pakket of brede adaptershell.

## Next gate

Client route selection, first-value en report-to-action flows expliciet uitschrijven.
