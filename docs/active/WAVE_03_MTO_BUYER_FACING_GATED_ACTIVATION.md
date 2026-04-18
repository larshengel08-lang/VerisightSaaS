# WAVE_03_MTO_BUYER_FACING_GATED_ACTIVATION.md

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: completed
- Dependency: `WAVE_02_MTO_INTERNAL_INTAKE_AND_COMMERCIAL_READINESS.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_04_MTO_PORTFOLIO_HIERARCHY_AND_DEFAULT_ROUTE_GOVERNANCE.md`

## Title

Open MTO buyer-facing als begrensde nieuwe route naast de bestaande suite, met expliciete gates rond CTA, proof en positionering, zonder al default-route- of hoofdmodelmigratie open te trekken.

## Scope In

- buyer-facing MTO product- en CTA-openstelling op bounded niveau
- publieke trust-, sample- en productpositionering voor MTO
- regressies voor gated activatie zonder defaultverschuiving
- docs-update van deze wave

## Scope Out

- MTO als nieuwe default-route
- deprecatie van ExitScan of RetentieScan
- brede portfoliohiërarchie-herbouw
- migratie naar hoofdmodelgovernance

## Uitvoering

- publieke contactintake geopend voor `route_interest = mto`
- buyer-facing MTO-productpagina geopend als gated activation route op aanvraag
- publieke MTO CTA toegevoegd op de productenoverzichtspagina, zonder core-first tellingen of navigatie-hiërarchie te herschrijven
- sitemap uitgebreid met `/producten/mto`
- publieke qualificationcopy aangescherpt zodat MTO als assisted route op aanvraag wordt gelezen en niet als nieuwe default
- backend contactrequest-contracten uitgebreid zodat publieke MTO-intake technisch wordt geaccepteerd

## Aannames

- WAVE_03 opent MTO publiek, maar nog steeds expliciet gated en assisted
- MTO wordt nog niet opgenomen als nieuw kernproduct in homepage-, dropdown- of default-routehiërarchie
- bounded commerce blijft ook na publieke activatie exclusief voor ExitScan en RetentieScan

## Validatie

- `cmd /c npm test -- --run lib/contact-qualification.test.ts lib/contact-commerce.test.ts lib/marketing-positioning.test.ts`
- `cmd /c npx tsc --noEmit`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py tests/test_portfolio_architecture_program.py -k "public_mto_interest or public_surfaces_keep_core_first or portfolio_contract" -q`

## Definition Of Done

- MTO is buyer-facing bereikbaar via productpagina, CTA en publieke intake
- publieke copy houdt MTO expliciet gated en assisted
- core-first portfoliohiërarchie en default-routegedrag blijven nog ongewijzigd
