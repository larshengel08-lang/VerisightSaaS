# Action Center manager pilot 2026-04-26

## Type pilot
Semireële pilot op current main-achtige productbasis met seeded accounts en echte Supabase-auth.

## Seeded pilotactors
- HR owner:
  - `hr.action-center.owner@demo.verisight.local`
- Manager 1:
  - `manager.noord@demo.verisight.local`
  - department-scope: `IT`
- Manager 2:
  - `manager.people@demo.verisight.local`
  - department-scope: `Operations`

## Wat is live getest
- gedeelde suite-login
- HR owner ziet dashboard plus Action Center
- manager assignee landt op Action Center-only shell
- manager krijgt denied state op reports
- manager krijgt denied state op campaign detail
- department-scoped follow-through is zichtbaar in Action Center

## Observatie

### Wat nu goed werkt
- één shell voor HR en Action Center
- manager-only persona blijft echt buiten survey-inzichten
- departmentscopes zijn geen mock meer; ze lezen uit echte respondentdepartmentdata
- HR kan vanuit dezelfde suite de Action Center-module openen zonder aparte app

### Wat nu bewust nog bounded blijft
- managerinviteflow is nog geen brede self-serve flow
- managerassignment gebruikt in deze pilot seeded accounts als kandidaatpool
- follow-through editing buiten managerassignment blijft dicht; Action Center blijft verder read-first

## Conclusie
De manager-only Action Center route is nu technisch en semireëel bewezen genoeg om als volwassen hardeningbasis verder te gebruiken.
