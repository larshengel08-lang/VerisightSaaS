# WAVE_01_QUALIFICATION_ROUTE_NARROWING_AND_DEFAULTS.md

## Title

Qualification Route Narrowing And Defaults

## Korte Summary

Deze wave maakt de eerste routekeuze in de publieke intake explicieter en rustiger, zonder de suite te verbreden. `ExitScan` blijft de default wedge, `RetentieScan` blijft de enige situationeel primaire uitzondering, `Combinatie` blijft bounded voor echte dubbelvragen en follow-on routes worden nu ook in de daadwerkelijke intakehelper behandeld als vervolgkeuzes in plaats van vlakke eerste routes.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_02_INTAKE_OPERATOR_DECISION_SUPPORT.md`

## Key Changes

- Nieuwe qualification-helper in [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
  - routevernauwing op basis van gekozen route, timing en intakevraag
  - expliciet onderscheid tussen:
    - `core_default`
    - `retention_primary`
    - `combination_candidate`
    - `bounded_follow_on_review`
    - `follow_on_reframe`
    - `uncertain_core_review`
- Publieke routevernauwing zichtbaar gemaakt in [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
  - real-time intakehint boven het formulier
  - success-state koppelt nu ook de ingestuurde aanvraag aan een expliciete intake-richting
- Regressies toegevoegd of verdiept in:
  - [contact-funnel.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.test.ts)
  - [marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)

## Belangrijke Interfaces / Contracts

- Publieke routeopties blijven ongewijzigd:
  - `exitscan`
  - `retentiescan`
  - `combinatie`
  - `teamscan`
  - `onboarding`
  - `leadership`
  - `nog-onzeker`
- Nieuwe helpercontracten in de frontend:
  - `CoreContactRouteInterest`
  - `FollowOnContactRouteInterest`
  - `ContactQualificationStatus`
  - `ContactQualificationGuidance`
- Belangrijkste functionele contract:
  - follow-on routes mogen zichtbaar en selecteerbaar blijven
  - maar zonder expliciet bestaand signaal worden ze niet als vlakke eerste route behandeld

## Testplan

Gerund en groen:

- `cmd /c npm test -- --run lib/contact-funnel.test.ts lib/marketing-flow.test.ts`
- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `cmd /c npx tsc --noEmit`

Belangrijkste afgedekte scenario's:

- `nog-onzeker` vernauwt actief naar een kernroute
- duidelijke behoudsvraag mag `RetentieScan` primair maken
- `Combinatie` blijft alleen voor echte dubbelvragen
- `TeamScan`, `Onboarding` en `Leadership` worden zonder bestaand signaal teruggeduwd naar core-first intake
- bounded follow-on review blijft mogelijk wanneer bestaand signaal expliciet genoemd wordt

## Assumptions / Defaults

- `ExitScan` blijft de veilige standaard eerste route wanneer de intake nog breed of diffuus is.
- `RetentieScan` mag alleen primair worden bij een expliciete behouds- of vroegsignaalvraag.
- Follow-on routes blijven zichtbaar in de suite, maar niet vlak in de eerste routekeuze.
- Deze wave verandert geen backendcontracten, deliverygates of bounded commerce-statussen.

## Definition Of Done

- [x] De publieke intake maakt de eerste routekeuze explicieter en rustiger.
- [x] `ExitScan` blijft ondubbelzinnig de default wedge.
- [x] `RetentieScan` blijft de enige situationeel primaire uitzondering.
- [x] Follow-on routes zijn functioneel begrensd in de intakehelper, niet alleen in copy.
- [x] Docs, code, tests en validatie zijn synchroon groen.
