# RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS

## Purpose

Dit document legt de vaste claimgrens voor RetentieScan v1.1 vast. Gebruik dit als referentie voor product, dashboard, rapport, validatie-output en buyer-facing copy.

Boundary note:

- `risk_score`, `avg_risk_score` en `stay_intent_score` zijn in dit document raw/storage-termen wanneer ze in code- of validatiecontext voorkomen.
- Producttaal blijft leidend:
  - `retentiesignaal`
  - `gem. retentiesignaal`
  - `stay-intent` als aanvullende signaallaag
- Vanaf 2026-04-18 geldt daarnaast een non-breaking aliaslaag in response/view-models:
  - `signal_score`
  - `avg_signal_score`
  - `direction_signal_score`

Leidende uitgangspunten:

- ExitScan blijft het primaire product voor terugkijkende vertrekduiding.
- RetentieScan blijft een groeps- en segmentinstrument voor vroegsignalering op behoud.
- RetentieScan v1.1 mag commercieel scherp zijn, maar niet harder claimen dan de huidige bewijslaag draagt.

## Evidence Ladder

| Niveau | Betekenis | Mag wel | Mag niet |
|---|---|---|---|
| 1. Inhoudelijk plausibel | Survey, scoring en interpretatie zijn inhoudelijk verdedigbaar | Uitleggen wat het product probeert te meten | Doen alsof het al empirisch bevestigd is |
| 2. Intern consistent | Frontend, backend, rapport, dashboard en marketing dragen dezelfde betekenis | Spreken van een consistente productlogica | Interne consistentie verkopen als validatiebewijs |
| 3. Testmatig beschermd | Regressietests, paritychecks en acceptatiechecks bewaken claimgrenzen | Spreken van een gecontroleerde v1.1-implementatie | Testgroen framen als marktbewijs |
| 4. Eerste statistische indicatie | Echte response-data ondersteunt reliability, factorchecks en samenhanganalyses | Spreken van eerste interne statistische signalen | Voorspellende of pragmatische waarde claimen zonder follow-up |
| 5. Pragmatisch gekoppeld | Echte response-data en echte follow-up uitkomsten wijzen dezelfde richting op | Spreken van eerste pragmatische onderbouwing op groepsniveau | Causaliteit, garantie of individuele voorspelling claimen |

## Claim Rules

### Toegestaan in v1.1

- RetentieScan is een compacte behoudsscan voor groeps- en segmentniveau.
- RetentieScan helpt eerder zichtbaar maken waar behoud aandacht vraagt.
- RetentieScan ondersteunt prioritering, verificatie en managementgesprek.
- RetentieScan combineert een retentiesignaal met bevlogenheid, stay-intent, vertrekintentie en beinvloedbare werkfactoren.
- RetentieScan is geen brede MTO en geen individuele voorspeller.

### Niet toegestaan in v1.1

- Gevalideerde voorspeller van vrijwillig verloop
- Wetenschappelijk bewezen causaliteitsmodel
- Garantie op lager verloop
- Individuele risicoscore of individueel vertrekadvies
- Outcome-claim op basis van synthetische, dummy- of onbekende datasetprovenance

## Internal Vs External Terminology

| Intern technisch | Extern zichtbaar | Regel |
|---|---|---|
| `risk_score` | `retentiesignaal` | Intern contract mag blijven bestaan zolang externe lagen niet terugvallen in predictor- of risicotaal |
| `avg_risk_score` | `gem. retentiesignaal` | In rapport, dashboard en marketing altijd in productspecifieke taal tonen |
| `risk_band` | `aandachtssignaal` / `signaalband` | Uitleggen als groepsduiding, niet als individuele risicoclassificatie |
| `signal_profile` | `signaalprofiel` | Alleen tonen als managementhulp voor verificatie en prioritering |

## Dataset Provenance Rules

- `real`: mag gebruikt worden voor interne statistische validatie; pragmatische validatie vraagt daarnaast echte follow-up uitkomsten.
- `synthetic`: telt alleen als pipeline- en metrics-infrastructuurbewijs.
- `dummy`: telt alleen als workflow- en acceptatiebewijs.
- `unknown`: telt nergens als market evidence totdat provenance expliciet is bevestigd.

Nieuwe regel voor validatiescripts:

- Elke validatierun moet dataset provenance expliciet tonen in output.
- Synthetische of dummy output mag nooit zonder waarschuwing worden opgeslagen alsof het marktbewijs is.

## Decision Rules After New Evidence

- Bij betere interne consistentie maar geen echte data:
  - claimgrens blijft gelijk
  - alleen wording en interpretatiekaders mogen worden aangescherpt
- Bij echte response-data met eerste statistische steun:
  - product mag intern sterker onderbouwd worden
  - buyer-facing wording blijft terughoudend
- Bij echte response-data zonder sterke schaal- of samenhangsteun:
  - copy en interpretatie terughoudender maken
  - geen scoreherweging zonder duidelijke analysebasis
- Bij echte response-data plus echte follow-up uitkomsten:
  - pragmatische validatie mag intern explicieter worden gebruikt
  - nog steeds geen individuele of causale claim

## Acceptance Gate For Buyer-Facing Claims

Buyer-facing aanscherping is pas toegestaan wanneer:

- de claim past binnen niveau 1-3 zonder extra bewijs, of
- de claim expliciet is onderbouwd door niveau 4 of 5 bewijs, en
- dashboard, rapport en marketing dezelfde claimdiscipline hanteren.

Als een claim meer bewijs vraagt dan aanwezig is:

- niet publiceren
- wel intern als hypothese documenteren
- koppelen aan het eerstvolgende echte validatiepakket
