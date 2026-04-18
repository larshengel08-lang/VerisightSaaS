# WAVE_04_DELIVERY_LEARNING_AND_CLOSEOUT_DISCIPLINE.md

## Title

Delivery Learning And Closeout Discipline

## Korte Summary

Deze wave maakt delivery-closeout explicieter afhankelijk van echte follow-through. `learning_closed` vraagt nu niet alleen een latere lifecycle-status, maar ook expliciet follow-up en learning-evidence.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_05_DELIVERY_OPS_HARDENING_CLOSEOUT.md`

## Key Changes

- De campaign detail page haalt nu closeout-relevante learning-evidence op in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- De learning disclosure toont nu explicieter of closeout-evidence al bestaat
- Lifecycle-validatie naar `learning_closed` vereist nu:
  - expliciete follow-up beslissing
  - linked learning closeout-evidence
- Die closeout-evidence wordt nu meegewogen in:
  - [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
  - [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery/[id]/route.ts)

## Belangrijke Interfaces / Contracts

- `follow_up_decided` blijft aparte operating state
- `learning_closed` vraagt nu expliciete review-, vervolg- of stopuitkomst
- een gekoppeld learningdossier zonder vervolguitkomst telt nog niet als closeout-evidence

## Testplan

Groen:

- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `node node_modules\\typescript\\bin\\tsc --noEmit`

Belangrijkste afgedekte scenario's:

- `learning_closed` blokkeert zonder follow-up beslissing
- `learning_closed` blokkeert zonder expliciete learning closeout-evidence
- de campaign page maakt zichtbaar of closeout nog openstaat

## Assumptions / Defaults

- learning closure blijft een bewuste eindstatus
- workbench- of dossierwerk blijft de juiste plek voor expliciete closeout-evidence

## Definition Of Done

- [x] Delivery-closeout is nu explicieter gekoppeld aan follow-through.
- [x] Learning-evidence is onderdeel van de closeout-governance geworden.
- [x] Operators zien sneller wanneer closeout nog niet eerlijk gezet kan worden.
- [x] Docs, code, tests en validatie zijn synchroon groen.
