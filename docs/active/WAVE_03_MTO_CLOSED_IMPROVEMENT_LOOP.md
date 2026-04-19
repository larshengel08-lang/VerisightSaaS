# WAVE_03_MTO_CLOSED_IMPROVEMENT_LOOP.md

## Status

- Wave status: completed_green
- Active source of truth after opening: dit document
- Build permission: closed
- Dependency: `WAVE_02_SHARED_ACTION_CONTRACTS.md` moest bewezen geisoleerd groen zijn
- Next allowed step after green completion: `WAVE_04_FUTURE_SUITE_INTEGRATION_GATE.md`

## Goal

Open de MTO-first closed improvement loop bovenop de geisoleerde contracten:

- actiecreatie vanuit MTO-afdelingssignaal
- owner-toewijzing
- voortgangsupdates
- reviewmomenten
- effect-check
- koppeling naar vervolgmeting of vervolgroute

## Guardrails

- MTO-first in gebruik
- shared-by-design in contracten
- niet automatisch actief voor andere producten

## Completion Evidence

- Actiecreatie opent nu direct vanuit de veilige MTO-afdelingsread.
- HR kan default owners vastleggen; toegewezen managers blijven bounded op hun eigen scope.
- Voortgangsupdates, reviewmomenten en effect-checks zijn vastgelegd binnen de MTO-route.
- De closed improvement loop hangt alleen achter `scan_type = mto` en verandert geen bestaande productflow.
