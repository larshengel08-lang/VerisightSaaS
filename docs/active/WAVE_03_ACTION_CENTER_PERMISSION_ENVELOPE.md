# WAVE_03_ACTION_CENTER_PERMISSION_ENVELOPE.md

## Status

- Wave status: completed_green
- Active source of truth after opening: dit document
- Build permission: closed
- Dependency: `WAVE_02_ACTION_CENTER_GUIDED_CREATION_AND_DOSSIERS.md` moet groen zijn
- Next allowed step after green completion: `WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md`

## Goal

Scherp het bounded operating model aan: HR centraal, managers alleen hun eigen afdeling.

## Scope

- permission contract voor action center access
- afdeling-gebonden zicht- en editregels
- tests die bevestigen dat MTO-only gedrag behouden blijft

## Non-Goals

- nog geen suitebreed permissionsysteem
- nog geen org-brede dashboardrefactor

## Completion Notes

- Viewer-managers kunnen nu bounded werken op hun eigen afdelingsacties via de Action Center envelope.
- HR en bredere campaignmanagers houden centraal zicht, zonder dat niet-MTO gedrag opent.
- De permissionstap blijft MTO-first, maar gebruikt wel suite-capable envelope-logica in plaats van route-specifieke uitzonderingen.
