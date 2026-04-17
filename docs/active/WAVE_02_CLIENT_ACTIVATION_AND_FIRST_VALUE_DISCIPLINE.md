# WAVE_02_CLIENT_ACTIVATION_AND_FIRST_VALUE_DISCIPLINE.md

## Title

Client Activation And First Value Discipline

## Korte Summary

Deze wave maakt client activation en first value explicieter als aparte operating gates. Een campaign voelt daardoor minder snel “bijna live” of “al waardevol” op basis van alleen invites of vroege responses.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_03_REPORT_MANAGEMENT_USE_AND_EXCEPTION_ALIGNMENT.md`

## Key Changes

- Activation- en first value-blockers zijn nu expliciet onderdeel van dezelfde governance snapshot in [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- Lifecycle-validatie naar:
  - `client_activation_confirmed`
  - `first_value_reached`
  gebruikt nu dezelfde gate-logica
- De delivery control toont nu aparte activation- en first value-lanes in [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)

## Belangrijke Interfaces / Contracts

- `client_activation_confirmed` vraagt nu explicietere readiness dan alleen verstuurde invites
- `first_value_reached` vraagt nu:
  - activation discipline
  - een groen genoeg autosignaal
  - handmatige checkpointbevestiging

## Testplan

Groen:

- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `node node_modules\\typescript\\bin\\tsc --noEmit`

Belangrijkste afgedekte scenario's:

- first value wordt niet vrijer gezet zolang activation of first value nog niet echt bevestigd zijn
- waarschuwingen rond activatie en indicatief first value blijven zichtbaar in de delivery control

## Assumptions / Defaults

- client activation is pas “bevestigd” bij echte dashboardtoegang of expliciet bevestigde handmatige override
- first value blijft een productmijlpaal en geen ruwe data-aanwezigheid

## Definition Of Done

- [x] Client activation leest nu als echte deliverygate.
- [x] First value is scherper begrensd en minder ambigu.
- [x] Operators zien sneller wat activatie of first value nog tegenhoudt.
- [x] Docs, code, tests en validatie zijn synchroon groen.
