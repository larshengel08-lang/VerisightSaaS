# WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md

## Status

- Wave status: completed_green
- Active source of truth after opening: dit document
- Build permission: closed
- Dependency: `WAVE_03_ACTION_CENTER_PERMISSION_ENVELOPE.md` moet groen zijn
- Next allowed step after green completion: `WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md`

## Goal

Isoleer de MTO Action Center-loader en maak suite-capable adapterseams expliciet zonder live koppeling te openen.

## Scope

- MTO Action Center loader/builder losser trekken uit de grote campaign page
- neutralere dossier-primitives en traceability seams expliciet maken
- adapter boundary voorbereiden voor latere productkoppeling

## Non-Goals

- nog geen live adapter voor ExitScan of RetentieScan
- nog geen suitebreed action center

## Completion Notes

- De campaign page roept nu een aparte MTO Action Center-loader aan in plaats van de Action Center-tabellen zelf te orkestreren.
- Een eerste neutrale source-reference helper maakt suite-capable adapterseams explicieter.
- De track blijft MTO-only live, terwijl de latere koppeling aan andere producten technisch minder geforceerd wordt.
