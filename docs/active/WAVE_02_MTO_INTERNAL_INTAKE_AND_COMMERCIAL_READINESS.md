# WAVE_02_MTO_INTERNAL_INTAKE_AND_COMMERCIAL_READINESS.md

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: completed
- Dependency: `WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_03_MTO_BUYER_FACING_GATED_ACTIVATION.md`

## Title

Maak de interne assisted intake-, readiness- en prooflaag voor MTO scherp genoeg om later een buyer-facing opening gecontroleerd te kunnen dragen, zonder MTO nu al publiek te activeren.

## Scope In

- interne MTO assisted-intake en handoffdiscipline
- operator- en deliverycopy voor MTO readiness
- bounded proof- en sampletaal voor interne MTO-voorbereiding
- regressies en docs voor deze interne readinesslaag

## Scope Out

- publieke MTO-productpagina of live CTA-openstelling
- SEO-, sitemap- of buyer-facing activatie
- default-routeverschuiving
- brede suite- of commercelaag buiten MTO

## Uitvoering

- interne MTO assisted-readiness helper toegevoegd voor routebevestiging, owner, handoff, delivery-link en proofspoor
- admin leadtriage uitgebreid met een expliciete `MTO assisted readiness` kaart voor intern vervolg
- delivery preflight uitgebreid met een MTO assisted-readiness paneel op campaignniveau
- implementation-readiness copy aangescherpt zodat `mto` baseline assisted blijft en live/public activatie expliciet dicht blijft
- regressietests toegevoegd voor assisted readiness en MTO deliverycopy

## Aannames

- WAVE_02 opent alleen interne assisted intake- en readinessdiscipline, geen publieke activatie
- `deliverable-proof` en `trustproof` blijven de eerste interne bewijslaag voor MTO totdat een latere wave publieke routes opent
- MTO blijft in deze wave commercieel assisted en niet bounded-commerce enabled

## Validatie

- `cmd /c npm test -- --run lib/mto-assisted-readiness.test.ts lib/implementation-readiness.test.ts lib/pilot-learning.test.ts lib/ops-delivery.test.ts`
- `cmd /c npm test -- --run lib/contact-qualification.test.ts lib/contact-commerce.test.ts lib/implementation-readiness.test.ts lib/mto-assisted-readiness.test.ts lib/pilot-learning.test.ts lib/ops-delivery.test.ts`
- `cmd /c npx tsc --noEmit`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -q`

## Definition Of Done

- interne MTO intake en delivery hebben expliciete assisted-readinesscopy
- operators zien welke interne MTO-discipline nog ontbreekt voordat verdere activatie logisch wordt
- publieke portfolio- en activatiesurfaces blijven ongewijzigd gesloten
