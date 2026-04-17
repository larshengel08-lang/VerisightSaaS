# WAVE_03_QUALIFICATION_TO_DELIVERY_HANDOFF_ALIGNMENT.md

## Title

Qualification To Delivery Handoff Alignment

## Korte Summary

Deze wave maakt qualification onderdeel van de echte handoff- en startgovernance. De oorspronkelijke formulierkeuze is niet langer genoeg om een lead richting `implementation_intake_ready` te laten schuiven: er is nu een expliciete qualificationstatus, een bevestigde route en een reviewer nodig voordat delivery-start operationeel groen mag worden.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_04_LEAD_QUALIFICATION_AND_INTAKE_CLOSEOUT.md`

## Key Changes

- Persistente qualificationcontracten toegevoegd in:
  - [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
  - [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
  - [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- Nieuwe qualificationvelden op `ContactRequest`:
  - `qualification_status`
  - `qualified_route`
  - `qualification_note`
  - `qualification_reviewed_by`
  - `qualification_reviewed_at`
- Handofff- en startgate aangescherpt in [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
  - `implementation_intake_ready` vereist nu:
    - bevestigde qualification
    - expliciete gekwalificeerde route
    - expliciete reviewer
- Frontendtypes en operatorflow meegetrokken in:
  - [pilot-learning.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pilot-learning.ts)
  - [contact-qualification.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-qualification.ts)
  - [lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- Regressies uitgebreid in:
  - [contact-qualification.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-qualification.test.ts)
  - [pilot-learning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pilot-learning.test.ts)
  - [test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

## Belangrijke Interfaces / Contracts

- Nieuwe backendcontracten:
  - `qualification_status`: `not_reviewed | needs_route_review | route_confirmed`
  - `qualified_route`: `exitscan | retentiescan | combinatie | teamscan | onboarding | leadership`
- Nieuwe operationele regel:
  - `implementation_intake_ready` is pas toegestaan na expliciete qualification review
- Belangrijke boundary:
  - deze wave opent geen nieuwe deliverytooling
  - ze maakt alleen de overgang van qualification naar delivery strakker en explicieter

## Testplan

Gerund en groen:

- `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py -q -k "contact_request_update or bounded_billing_foundation_smoke_flow"`
- `cmd /c npm test -- --run lib/contact-qualification.test.ts`
- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `node node_modules\typescript\bin\tsc --noEmit`

Belangrijkste afgedekte scenario's:

- qualificationroute en reviewer worden persistent opgeslagen
- `implementation_intake_ready` wordt geweigerd zonder bevestigde qualification
- bounded commerce smokeflow blijft werken wanneer qualification wel expliciet bevestigd is
- lead-ops leest bevestigde qualification nu als de handoffwaarheid

## Assumptions / Defaults

- De minimaal noodzakelijke handoffwaarheid is nu: bevestigde route plus reviewer.
- De oorspronkelijke `route_interest` blijft bewaard als intake-ingang, maar niet meer als voldoende handoffsignaal.
- Follow-on routes mogen bevestigd worden, maar alleen expliciet en reviewbaar.
- Deze wave verbreedt bounded commerce, delivery tooling of productscope niet.

## Definition Of Done

- [x] Qualification is persistent en operationeel zichtbaar.
- [x] Delivery-start kan niet meer zonder bevestigde qualificationroute doorlekken.
- [x] Lead-ops kan de daadwerkelijke gekwalificeerde route nu vastleggen.
- [x] De core-first suitehiërarchie blijft intact, maar de handoff is strakker.
- [x] Docs, code, tests en validatie zijn synchroon groen.
