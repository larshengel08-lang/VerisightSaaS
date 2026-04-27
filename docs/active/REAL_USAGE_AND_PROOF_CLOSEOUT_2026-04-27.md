# Real Usage And Proof Closeout

## Korte samenvatting

De RU-wave draait nu echt DB-backed op de huidige suitebasis: billing, telemetry en proof hebben live adminsurfaces, de drie RU-tabellen zijn geprovisioneerd in de gekoppelde Supabase-omgeving en de semireele seedlaag voor 2-4 trajecten schrijft nu direct naar Supabase. De fallback registries blijven bewust bestaan als bounded noodgeval en lokale veiligheidslaag, maar zijn niet langer de primaire runtimewaarheid.

## Wat is geland

- live adminsurfaces op:
  - `/beheer/billing`
  - `/beheer/health`
  - `/beheer/proof`
- echte serverhelpers voor:
  - billing registry
  - suite telemetry events
  - proof registry
- semireele seedscript:
  - `frontend/scripts/seed-real-usage-proof-wave.mjs`
- runtime fallback store:
  - `frontend/data/runtime-registries/billing-registry.json`
  - `frontend/data/runtime-registries/suite-telemetry-events.json`
  - `frontend/data/runtime-registries/proof-registry.json`
- routewiring voor:
  - `POST /api/internal/telemetry`
  - `GET/POST /api/billing-registry`
  - `GET/POST /api/proof-registry`
- live schema-aanvulling:
  - `migrations/2026_04_27_add_real_usage_registry_tables.sql`

## Wat de semireele wave nu dekt

- `billing registry echt gebruiken`
  - 4 semireele assisted rows
- `telemetry live laten meelopen`
  - 20 bounded events over owner access, first value, first management use, manager denied insights, review scheduling en closeout
- `proof registry vullen`
  - 4 proof rows over de ladder:
    - `lesson_only`
    - `internal_proof_only`
    - `sales_usable`
    - `public_usable`
- `2-4 echte of semireele trajecten`
  - 4 semireele suite-runs gebaseerd op huidige campaigns en organizations

## Belangrijke nuance

De slice blijft bewust in een dubbel veilig model:

- **primaire waarheid**:
  - `billing_registry`
  - `suite_telemetry_events`
  - `case_proof_registry`
  - live in Supabase
- **fallbacklaag**:
  - gecontroleerde JSON registries in de repo
  - alleen voor lokale noodpaden of als een omgeving tijdelijk de schema-objecten nog niet heeft

Dat houdt de suite eerlijk assisted en operationeel robuust, zonder de live waarheid opnieuw te verleggen naar demo- of mockdata.

## Nog open

- de eerste echte live cases door deze nieuwe registrylaag laten lopen
- public proof alleen verder opvoeren op basis van goedgekeurde echte cases
- fallbackgebruik alleen nog als noodgeval of lokale ontwikkelguardrail behandelen

## Oordeel

Technisch geslaagd en live afgerond als bounded RU-wave.

De suite heeft nu:

- werkende billing / telemetry / proof surfaces
- DB-backed semireele usage-evidence
- expliciete public-proof scheiding

De infrastructuurgap is nu gesloten; het vervolgwerk zit niet meer in schema, maar in echt gebruik en zwaardere proof.
