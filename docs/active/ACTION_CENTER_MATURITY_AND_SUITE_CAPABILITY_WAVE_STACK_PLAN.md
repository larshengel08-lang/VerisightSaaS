# ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_WAVE_STACK_PLAN.md

## Status

- Plan status: active
- Active source of truth: dit document
- Build permission: wave_01_open
- Dependency: `ACTION_CENTER_MATURITY_AND_SUITE_CAPABILITY_PLAN.md` moet leidend blijven
- Next allowed step after green completion of current wave: closeout_of_current_phase

## Allowed Wave Stack

1. `WAVE_01_ACTION_CENTER_COCKPIT_REFRAME.md`
2. `WAVE_02_ACTION_CENTER_GUIDED_CREATION_AND_DOSSIERS.md`
3. `WAVE_03_ACTION_CENTER_PERMISSION_ENVELOPE.md`
4. `WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md`
5. `WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md`

## Wave Rules

- exact een actieve wave tegelijk
- elke wave levert docs, code, tests en validatie op
- MTO blijft de enige live drager
- suite capability blijft expliciet in scope als boundary-eis
- live koppeling naar andere scans blijft geblokkeerd

## Current Wave

- Current active wave: `WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md`
- Last completed wave: `WAVE_04_ACTION_CENTER_LOADER_AND_ADAPTER_SEAMS.md`

## Closeout Gate

`WAVE_05_ACTION_CENTER_POLISH_AND_CLOSEOUT.md` mag pas groen sluiten als:

- cockpit, creation en dossier-flow intern stabiel zijn
- permission envelope scherp genoeg is voor bounded managergebruik
- loader boundary expliciet is geisoleerd
- adapter seams duidelijk genoeg zijn voor een latere gated suite-track
