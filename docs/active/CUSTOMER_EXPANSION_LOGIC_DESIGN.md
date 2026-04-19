# Expansion Logic Design

## Titel

Expansion Logic Design

## Korte samenvatting

De MVP wordt een pure, explainable suggestie-engine die alleen bestaande lifecycle-, delivery- en learning-signalen leest en daar buyer-safe vervolgroutes uit afleidt. De engine geeft geen verborgen sales-score terug, maar een begrensde beslisuitkomst met routecards, confidence en guardrails. De engine blijft bewust suppressief: alleen voorstelbaar waar routecanon, productstatus en deliverystatus dat echt dragen.

## Wat is ontworpen

- triggergates voor expansionbesluit
- inputset die producttruth-first blijft
- routecatalogus voor v1
- confidence- en claimsysteem
- suppressieregels
- rendergedrag voor dashboard en learning-workbench

## Belangrijkste bevindingen

- De benodigde input bestaat al grotendeels in runtime:
  - `scan_type`
  - `delivery_mode`
  - responsdrempels
  - `follow_up_decided_at`
  - `first_management_use_confirmed_at`
  - `review_moment`
  - `first_action_taken`
  - `management_action_outcome`
  - `next_route`
  - metadata-indicatoren zoals segment/add-on en teamlokalisatiebasis
- De engine kan veilig starten zonder databasewijziging als computed viewmodel.
- De engine moet twee beslisniveaus ondersteunen:
  - `nog niet klaar voor expansionbesluit`
  - `klaar voor begrensde vervolgsuggestie`

## Belangrijkste risico’s

- Een te rijke inputset met vrije tekst of commerciële voorkeur zou tot pseudo-intelligente maar slecht verdedigbare routeverschuivingen leiden.
- Een te simpele engine zonder suppressieregels zou voortdurend kaarten tonen die in de praktijk `nu niet` horen te zijn.
- Een engine zonder verklarende redenen zou alsnog opportunistisch aanvoelen, ook als de regels inhoudelijk kloppen.

## Beslissingen / canonvoorstellen

- Alleen deze inputklassen mogen de suggestie sturen:
  - lifecycle state
  - delivery readiness
  - first management use
  - review- en first-action-signalen
  - responskwaliteit
  - metadata- en segmentgeschiktheid
  - huidige route en delivery mode
- Deze inputs mogen nadrukkelijk niet sturen:
  - pricing wens
  - sales targetdruk
  - routevoorraad
  - ongestructureerde suitewens
  - “dit product willen we ook laten landen”
- De engine gebruikt drie uitkomstlabels:
  - `aanbevolen`
  - `te overwegen`
  - `nu niet`
- Confidence wordt beperkt tot:
  - `hoog`: zelfde-route vervolg met expliciete lifecycle- en reviewbasis
  - `middel`: bounded vervolg met voldoende maar niet volledige context
  - `laag`: alleen informatief tonen of suppressen

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_LOGIC_DESIGN.md`

## Toegestane v1-inputs

| Input | Bron | Rol in beslissing |
| --- | --- | --- |
| `scan_type` | campaign stats / campaign | bepaalt routefamilie en toegestane vervolgvormen |
| `delivery_mode` | campaign | onderscheidt baseline versus live/ritme-context |
| `responses_length`, `hasMinDisplay`, `hasEnoughData` | dashboard helpers | onderbouwt of verdieping of segmentwerk eerlijk is |
| `first_management_use_confirmed_at` | delivery record | hoofdgate voor expansion readiness |
| `follow_up_decided_at` | delivery record | voorkomt dubbel of te laat suggereren |
| `review_moment` | pilot learning dossier | geeft ritme of bounded vervolg context |
| `first_action_taken` | pilot learning dossier | beschermt tegen vervolg zonder eerste actie |
| `management_action_outcome` | pilot learning dossier | verhoogt confidence wanneer eerste managementwaarde echt is geland |
| `hasSegmentDeepDive` | campaign add-on / modules | bepaalt of Segment Deep Dive al productmatig open ligt |
| lokale metadata-geschiktheid | responses / department groups | bepaalt of TeamScan verdedigbaar is |

## Routescope v1

| Routekey | Buyer-safe label | Status in canon | v1-behandeling |
| --- | --- | --- | --- |
| `retention_rhythm` | RetentieScan ritme | core follow-on | volledig ondersteund |
| `compact_follow_up` | Compacte vervolgmeting | bounded follow-up | volledig ondersteund |
| `pulse` | Pulse | bounded support route | volledig ondersteund |
| `segment_deep_dive` | Segment Deep Dive | verdieping | volledig ondersteund |
| `teamscan` | TeamScan | parity-build lokale verificatie | volledig ondersteund met strenge gates |
| `onboarding_check` | Onboarding 30-60-90 | parity-build | suppressed in v1 |
| `leadership_check` | Leadership Scan | bounded support | suppressed in v1 |
| `portfolio_combination` | Combinatie | portfolio route | suppressed in v1 |
| `cross_core_shift` | ExitScan/RetentieScan wissel | human-confirmed | suppressed in v1 |

## Beslislogica in woorden

1. Als first management use nog niet bevestigd is, geeft de engine geen vervolgvoorstel maar alleen een readiness-uitleg.
2. Als follow-up al formeel besloten is, blijft de engine adviserend en markeert hij de bestaande beslissing als referentie, niet als nieuwe push.
3. Bij `RetentieScan baseline` krijgt `RetentieScan ritme` voorrang zodra reviewmoment en eerste actie aanwezig zijn.
4. `Compacte vervolgmeting` wordt alleen zichtbaar als bounded herchecklogica past, maar een vol ritmebesluit nog niet sterk genoeg onderbouwd is.
5. `Pulse` wordt alleen getoond als bounded reviewlaag na eerdere diagnose of eerste actie, nooit als nieuwe core route.
6. `Segment Deep Dive` wordt alleen positief als respons, metadata en segmentcontext dat dragen.
7. `TeamScan` wordt alleen positief als er lokale verificatiegrond bestaat en afdelings- of groepsmetadata een eerlijke lokale read mogelijk maken.
8. Niet-ondersteunde of te brede routes worden ofwel suppressed of expliciet als `nu niet` gelabeld.

## Outputvorm

- Engine-niveau:
  - readiness status
  - summary title
  - summary body
  - blocking reasons
  - primary suggestion key
  - suggestion cards
- Card-niveau:
  - routekey
  - label
  - status
  - confidence
  - rationale
  - guardrail note
  - applyable label voor `next_route`

## Validatie

- Het ontwerp volgt de dual-core commercial canon en bounded productstatus.
- Het ontwerp gebruikt alleen bestaande runtime-inputs of direct afleidbare metadata.
- Het ontwerp vermijdt pricing-, CRM- of billingafhankelijkheden.

## Assumptions / defaults

- `first_management_use_confirmed_at` is de primaire no-go/ready gate voor automatische vervolgsuggestie.
- `review_moment` en `first_action_taken` zijn voldoende eerste signalen voor bounded vervolg, zonder een nieuwe state machine te introduceren.
- v1 hoeft geen automatische persistente decision log op te slaan zolang render en handoff duidelijk zijn.

## Next gate

Decision canon exact uitwerken per route, inclusief suppressie en confidencegrenzen.
