# WAVE_03_REPORT_MANAGEMENT_USE_AND_EXCEPTION_ALIGNMENT.md

## Title

Report, Management Use, And Exception Alignment

## Korte Summary

Deze wave brengt report delivery, eerste managementgebruik en exceptionwerk in één coherente governancelaag. Daardoor kan een campaign niet meer geloofwaardig als “management-used” of verder worden behandeld zonder expliciete output- en usage-discipline.

Status:

- Wave status: completed_green
- Source of truth: dit document
- Next allowed step: `WAVE_04_DELIVERY_LEARNING_AND_CLOSEOUT_DISCIPLINE.md`

## Key Changes

- Report delivery en management use zijn nu aparte governance-lanes in [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- Report/output discipline is routebewust opgenomen in [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- Lifecycle-validatie naar `first_management_use` vereist nu expliciete output- en usage-readiness
- Open exceptions op record- of checkpointniveau blijven nu structureel onderdeel van de blockersets

## Belangrijke Interfaces / Contracts

- `report_delivery` blijft expliciet, ook waar output geen klassieke PDF-route is
- `first_management_use` vraagt nu expliciete usage-discipline bovenop output delivery
- open exceptionstatus kan niet stilletjes verdwijnen achter vrije tekst

## Testplan

Groen:

- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npx next typegen`
- `node node_modules\\typescript\\bin\\tsc --noEmit`

Belangrijkste afgedekte scenario's:

- management use blijft geblokkeerd zolang report/output delivery nog niet expliciet rond is
- exceptions blijven zichtbaar in governance- en savepaden

## Assumptions / Defaults

- first management use blijft handmatig bevestigd
- output delivery en management use blijven bewust gescheiden

## Definition Of Done

- [x] Report/output en management use zijn coherenter uitgelijnd.
- [x] Exceptions blijven een eersteklas operating state.
- [x] Een campaign kan niet te vroeg als verder gevorderd worden gelezen.
- [x] Docs, code, tests en validatie zijn synchroon groen.
