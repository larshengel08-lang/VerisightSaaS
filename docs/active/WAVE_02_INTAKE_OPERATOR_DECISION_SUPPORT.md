# WAVE_02_INTAKE_OPERATOR_DECISION_SUPPORT.md

## Title

Intake Operator Decision Support

## Korte Summary

Deze wave vertaalt de publieke routevernauwing uit `WAVE_01` naar een interne operatorlaag. Qualification is nu niet meer alleen zichtbaar in buyer-facing copy, maar ook als compacte beslislaag in lead-ops: aanbevolen eerste route, route-review, timing en volgende qualificationstap lezen nu als een samenhangend decisionsysteem.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_03_QUALIFICATION_TO_DELIVERY_HANDOFF_ALIGNMENT.md`

## Key Changes

- Nieuwe operatorhelper in [contact-qualification.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-qualification.ts)
  - vertaalt de funnelqualification naar een interne visibility summary
  - maakt expliciet onderscheid tussen:
    - core-default bevestiging
    - RetentieScan als primaire uitzondering
    - combinatie-review
    - bounded follow-on review
    - follow-on herkadreeractie
    - actieve routevernauwing bij `nog-onzeker`
- Nieuwe regressies in [contact-qualification.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-qualification.test.ts)
- Interne operatorweergave in [lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
  - qualification summary-card boven de commerce summary
  - aanbevolen eerste route, geselecteerde route en volgende qualificationstap nu direct leesbaar

## Belangrijke Interfaces / Contracts

- Nieuwe frontendcontracten:
  - `ContactQualificationVisibilitySummary`
  - `buildContactQualificationVisibilitySummary(...)`
- Geen backendcontractwijzigingen in deze wave
- Geen wijziging aan:
  - `ContactRequest`
  - bounded commerce statuses
  - delivery lifecycle contracts

## Testplan

Gerund en groen:

- `cmd /c npm test -- --run lib/contact-qualification.test.ts lib/contact-funnel.test.ts`
- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `cmd /c npx tsc --noEmit`

Belangrijkste afgedekte scenario's:

- core-default leads blijven naar `ExitScan` wijzen
- `RetentieScan` blijft de enige primaire uitzondering
- follow-on routes lezen intern als reviewitem, niet als vlakke eerste route
- `nog-onzeker` wordt intern ook actief vernauwd

## Assumptions / Defaults

- Operator decision support blijft in deze wave frontend-first; persistente qualificationvelden openen nog niet.
- De bestaande lead-ops tabel blijft de juiste plek voor deze eerste interne beslislaag.
- Bounded commerce blijft zichtbaar, maar wordt nog niet door qualification gegated in deze wave.

## Definition Of Done

- [x] Qualification is intern zichtbaar als compacte beslislaag.
- [x] Routekeuze, timing en context lezen in lead-ops als een samenhangend decisionsysteem.
- [x] `ExitScan` blijft default wedge en `RetentieScan` blijft de enige primaire uitzondering.
- [x] Follow-on routes blijven intern bounded en review-first.
- [x] Docs, code, tests en validatie zijn synchroon groen.
