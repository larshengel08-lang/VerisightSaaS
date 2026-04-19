# WAVE_04_FUTURE_SUITE_INTEGRATION_GATE.md

## Status

- Wave status: completed_green
- Active source of truth after opening: dit document
- Build permission: gate_closed
- Dependency: `WAVE_03_MTO_CLOSED_IMPROVEMENT_LOOP.md` moet groen zijn
- Next allowed step after green completion: expliciete nieuwe track voor suitekoppeling

## Goal

Houd een aparte gate voor latere aansluiting van andere producten:

- beoordelen of ExitScan en RetentieScan veilig kunnen aansluiten
- bepalen welke adapterlaag nodig is
- aantonen dat bestaande productlogica intact blijft
- besluiten of een latere suitebrede actieroute verantwoord is

## Guardrails

- geen automatische doorgroei vanuit wave 03
- geen live koppeling van andere producten in deze track

## Gate Decision

De gate blijft in deze fase bewust dicht.

- ExitScan en RetentieScan krijgen in deze track geen live koppeling naar de nieuwe actielaag.
- Een latere koppeling vraagt per product een aparte adapterlaag vanaf het bestaande insight- en dashboardcontract.
- De bestaande survey-opzet, meetmethodiek, scoring en dashboardflow van andere producten blijven onaangetast.
- Een suitebreed action center mag pas openen in een aparte vervolgfase met expliciete governance.
