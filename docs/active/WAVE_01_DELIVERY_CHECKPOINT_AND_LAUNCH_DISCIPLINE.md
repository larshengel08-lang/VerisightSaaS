# WAVE_01_DELIVERY_CHECKPOINT_AND_LAUNCH_DISCIPLINE.md

## Title

Delivery Checkpoint And Launch Discipline

## Korte Summary

Deze wave maakt van de bestaande delivery-spine een hardere governancelaag voor launchdiscipline. Lifecycle-overgangen kunnen nu niet meer stilletjes voorbij open checkpointgates bewegen, en checkpointbevestiging tegen warnings of exceptions vraagt expliciete operatorverantwoording.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_02_CLIENT_ACTIVATION_AND_FIRST_VALUE_DISCIPLINE.md`

## Key Changes

- Governance en lifecycle-validatie toegevoegd in [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
  - `buildDeliveryGovernanceSnapshot`
  - `validateDeliveryLifecycleTransition`
  - `validateDeliveryCheckpointUpdate`
- Delivery save-routes gebruiken die governance nu echt in:
  - [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery/[id]/route.ts)
  - [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery-checkpoints/[id]/route.ts)
- Campaign delivery control toont nu expliciete governance lanes en launchblockers in [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- Nieuwe regressies toegevoegd in [ops-delivery.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.test.ts)

## Belangrijke Interfaces / Contracts

- vooruitgaande lifecycle-stappen worden nu governance-aware gevalideerd
- checkpointbevestiging op `warning`, `not_ready`, `exception` of `not_applicable` vraagt expliciete operator-note
- launch-ready vraagt nu een leesbare combinatie van:
  - implementation intake
  - import QA
  - invite readiness

## Testplan

Groen:

- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `node node_modules\\typescript\\bin\\tsc --noEmit`

Belangrijkste afgedekte scenario's:

- launchblockers blijven zichtbaar zolang intake/import/invite niet echt rond zijn
- lifecycle kan niet zomaar naar `invites_live` springen
- checkpointbevestiging onder warning/exception vraagt expliciete verantwoording

## Assumptions / Defaults

- assisted delivery blijft leading
- checkpoints blijven handmatig bevestigbaar
- de wave opent geen automation-first deliverypad

## Definition Of Done

- [x] Launchdiscipline is nu explicieter en minder impliciet.
- [x] Deliveryrecord en checkpoints spreken dezelfde governance-taal.
- [x] Open blockers blijven zichtbaar in de UI en afdwingbaar in save-routes.
- [x] Docs, code, tests en validatie zijn synchroon groen.
