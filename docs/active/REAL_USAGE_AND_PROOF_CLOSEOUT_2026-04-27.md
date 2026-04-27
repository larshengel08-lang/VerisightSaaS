# Real Usage And Proof Closeout

## Korte samenvatting

De RU-wave is werkend gemaakt voor de huidige suitebasis met echte adminsurfaces voor billing, telemetry en proof, plus een semireële seedlaag voor 2-4 trajecten. De bedoelde Supabase-tabellen ontbreken nog in deze live omgeving, daarom draait deze slice nu bewust in `fallback_only`-modus op gecontroleerde JSON registries die uit echte campagnes en organisaties zijn afgeleid.

## Wat is geland

- live adminsurfaces op:
  - `/beheer/billing`
  - `/beheer/health`
  - `/beheer/proof`
- echte serverhelpers voor:
  - billing registry
  - suite telemetry events
  - proof registry
- semireële seedscript:
  - `frontend/scripts/seed-real-usage-proof-wave.mjs`
- runtime fallback store:
  - `frontend/data/runtime-registries/billing-registry.json`
  - `frontend/data/runtime-registries/suite-telemetry-events.json`
  - `frontend/data/runtime-registries/proof-registry.json`
- routewiring voor:
  - `POST /api/internal/telemetry`
  - `GET/POST /api/billing-registry`
  - `GET/POST /api/proof-registry`

## Wat de semireële wave nu dekt

- `billing registry echt gebruiken`
  - 4 semireële assisted rows
- `telemetry live laten meelopen`
  - 20 bounded events over owner access, first value, first management use, manager denied insights, review scheduling en closeout
- `proof registry vullen`
  - 4 proof rows over de ladder:
    - `lesson_only`
    - `internal_proof_only`
    - `sales_usable`
    - `public_usable`
- `2-4 echte of semireële trajecten`
  - 4 semireële suite-runs gebaseerd op huidige campaigns en organizations

## Belangrijke nuance

De huidige Supabase-omgeving mist nog:

- `billing_registry`
- `suite_telemetry_events`
- `case_proof_registry`

Daarom is de slice nu bewust zo opgezet:

- **als de tabellen bestaan**:
  - lees en schrijf direct in Supabase
- **als de tabellen ontbreken**:
  - lees en schrijf via gecontroleerde fallback registries in de repo

Dat maakt de wave direct bruikbaar voor appgedrag, review, demo en interne proofdiscipline, zonder te doen alsof de live schema-stap al af is.

## Nog open

- de drie RU-tabellen alsnog echt provisionen in de gekoppelde Supabase-omgeving
- daarna dezelfde seed nog een keer door de echte DB laten lopen
- en pas daarna public proof verder opvoeren op basis van goedgekeurde echte cases

## Oordeel

Technisch geslaagd en reviewklaar als bounded RU-wave.

De suite heeft nu:

- werkende billing / telemetry / proof surfaces
- semireële usage-evidence
- expliciete public-proof scheiding

Maar de definitieve live afronding vraagt nog één echte schema-applicatiestap in Supabase.
