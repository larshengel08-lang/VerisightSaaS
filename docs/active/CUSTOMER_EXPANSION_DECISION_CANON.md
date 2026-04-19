# Expansion Logic Design

## Titel

Customer Expansion Decision Canon

## Korte samenvatting

Deze canon legt de beslisvolgorde vast voor de MVP-suggester. De kernregel is dat lifecycle-gates vóór routegates gaan: zonder first management use geen expansionbesluit, zonder routefit geen suggestie, zonder producttruth geen promotie. De engine mag dus alleen kiezen tussen verdedigbare vervolgen binnen de huidige canon en moet de rest onderdrukken of als `nu niet` markeren.

## Wat is ontworpen

- beslisvolgorde
- routeprioriteit per huidige route
- suppressieregels
- confidence-grenzen
- handofflabels voor workbench en dashboard

## Belangrijkste bevindingen

- Een vaste prioriteitsvolgorde voorkomt dat Pulse of TeamScan ten onrechte concurreren met een sterker core-vervolg.
- `Nu niet` en `menselijke bevestiging nodig` zijn noodzakelijke canonuitkomsten, geen edge cases.
- De huidige codebasis is beter geschikt voor routecards met rationale dan voor een enkel “best next product”.

## Belangrijkste risico’s

- Zonder expliciete prioriteitsvolgorde kan een brede lijst alsnog opportunistisch ogen.
- Zonder suppressieregels zouden niet-ondersteunde routes in de UI “meelopen” en daarmee status krijgen.

## Beslissingen / canonvoorstellen

- Beslisvolgorde:
  1. lifecycle gate
  2. huidige routefamilie
  3. same-route vervolg
  4. bounded reviewroute
  5. verdieping
  6. lokale verificatie
  7. suppressie van niet-gedragen routes
- Het primaire voorstel in v1 is altijd een vervolgvorm binnen de huidige routefamilie of een bounded extension, nooit een suiteverbreding.
- `RetentieScan ritme` gaat vóór `Pulse` wanneer de huidige route retention is en review/cadans past.
- `Segment Deep Dive` gaat vóór `TeamScan` wanneer het probleem vooral segmentduiding vraagt en niet lokale verificatie.
- `TeamScan` gaat vóór `Pulse` wanneer er duidelijke lokale verificatiegrond is.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_DECISION_CANON.md`

## Canonieke beslisregels

### Regel 1. Lifecycle first

- Als `first_management_use_confirmed_at` ontbreekt:
  - geen expansionvoorstel
  - alleen readiness-uitleg
- Als `follow_up_decided_at` al gevuld is:
  - toon bestaande beslissing als referentie
  - geen nieuwe harde primaire route pushen

### Regel 2. Retention blijft retention-first

- Huidige route `RetentieScan` + first action + reviewmoment:
  - `RetentieScan ritme` = `aanbevolen`, confidence `hoog`
- Huidige route `RetentieScan` + first action zonder hard ritmebesluit:
  - `Compacte vervolgmeting` = `te overwegen`, confidence `middel`
- `Pulse` mag alleen naast retention zichtbaar worden als bounded reviewlaag, niet als vervanging van `RetentieScan ritme`

### Regel 3. Pulse blijft bounded

- `Pulse` wordt alleen positief wanneer:
  - er al eerdere routewaarde is
  - de volgende vraag een review- of correctievraag is
  - geen bredere herdiagnose nodig is
- Als die voorwaarden zwak zijn:
  - `Pulse` = `nu niet`

### Regel 4. Segment Deep Dive vraagt bewijs

- Alleen `aanbevolen` of `te overwegen` wanneer:
  - voldoende respons aanwezig is
  - segmentmetadata bruikbaar is
  - de huidige route al een eerste managementread heeft opgeleverd
- Zonder metadata of voldoende n:
  - `Segment Deep Dive` = `nu niet`

### Regel 5. TeamScan is lokale verificatie, geen default

- Alleen `aanbevolen` of `te overwegen` wanneer:
  - lokale verificatievraag aannemelijk is
  - afdelings- of groepsdata een eerlijke lokale read mogelijk maken
  - bounded use expliciet blijft
- Zonder lokale basis:
  - `TeamScan` = `nu niet`

### Regel 6. Niet-gedragen routes worden suppressed

- `Onboarding 30-60-90`, `Leadership Scan`, `Combinatie` en core shifts blijven buiten auto-suggestie.
- In de UI krijgen ze hoogstens een guardrailmelding, geen voorstelkaart.

## Status- en confidencecanon

| Status | Betekenis | Toegestane confidence |
| --- | --- | --- |
| `aanbevolen` | huidige routecanon en lifecyclegates ondersteunen dit als eerstvolgende stap | `hoog`, `middel` |
| `te overwegen` | inhoudelijk verdedigbaar, maar vraagt nog menselijk oordeel of extra context | `middel`, `laag` |
| `nu niet` | te vroeg, te breed, onvoldoende basis of buiten v1-scope | `laag` |

## Handofflabels v1

| Routekey | Handofflabel |
| --- | --- |
| `retention_rhythm` | RetentieScan ritme |
| `compact_follow_up` | Compacte vervolgmeting |
| `pulse` | Pulse |
| `segment_deep_dive` | Segment Deep Dive |
| `teamscan` | TeamScan |

## Validatie

- De canon forceert geen suitepush en houdt non-core routes bounded.
- De canon beschermt `RetentieScan ritme` als sterkste huidige buyer-safe follow-on binnen retention.
- De canon onderdrukt expliciet routes die in producttruth of routecanon nog te vroeg zijn.

## Assumptions / defaults

- `TeamScan`-geschiktheid mag in v1 afgeleid worden uit bestaande lokale metadata- en n-signalen.
- `Compacte vervolgmeting` is in v1 een bounded suggestion label en geen nieuw technisch campaign type.
- De canon richt zich op operator-support, niet op buyer-facing automatisering.

## Next gate

Implementation Plan: triggermoment, schema’s, renderstrategie, tests en handoff exact vastleggen.
