# Action Center Ops Pilot Observation

## Korte samenvatting

Het bestaande Action Center is sterk genoeg om een beperkte live pilot te draaien als follow-through- en reviewlaag, mits Verisight de cadence bewust handmatig blijft dragen. De kern werkt al: dossiers, assignments, reviewmomenten, follow-upsignalen, delivery lifecycle en pilot learning sluiten inhoudelijk op elkaar aan. De grootste frictie zit nu niet in ontbrekende dashboards, maar in handmatige owner-locking, overdracht tussen delivery en klant, en verwachtingsmanagement rond activatie, first value, first management use en vervolg.

## Welke pilot of observatie is gedaan

Er is een semireele dossierpilot opgezet op de bestaande Action Center-productlaag, zonder nieuwe adapterwave en zonder dashboardscope te verbreden.

De observatie gebruikte drie bounded trajecten:

1. `Activation -> first management use`: traject waarin activatie bevestigd is en het eerste managementmoment expliciet gepland en gehouden moet worden.
2. `Owner missing na eerste read`: traject waarin wel output beschikbaar is, maar eigenaar, eerste actie of reviewmoment nog niet scherp vastliggen.
3. `Review due -> follow-up open -> learning handoff`: traject waarin de eerste reviewdruk zichtbaar is en de overdracht naar lifecycle-status en learning capture moet landen.

De pilot is gebaseerd op de bestaande repo-lagen:

- gedeelde Action Center-contracten voor dossiers, assignments, reviewmomenten en signalen
- delivery lifecycle en checkpointlogica
- onboarding-acceptance en report-to-action cadence
- pilot learning checkpoints en bestemmingstranslatie

Verificatie van de huidige contractsurface:

- `python -m pytest tests/test_action_center_shared_core.py tests/test_pilot_learning_system.py`
- `npm test -- action-center-shared-core.test.ts pilot-learning.test.ts`

## Wat al sterk genoeg werkt

- De follow-through-scope is scherp begrensd: de shared core telt open dossiers, blocked assignments, due reviews en kritieke follow-upsignalen, en opent geen generieke project- of dashboardlaag.
- Backend, frontend en opsdocs gebruiken al dezelfde taal voor assignment states, review states, signaaltypes en lifecycle-overgangen.
- De operating cadence rond `activation confirmed -> first management use -> reviewmoment locked -> follow-up decided` is inhoudelijk helder genoeg om een kleine pilot te dragen.
- De onboarding-checklist dwingt al af dat first management use, eerste eigenaar, eerste actie en reviewmoment niet als losse notities blijven zweven.
- De pilot learning-laag kan lessen al terugschrijven naar `product`, `report`, `onboarding`, `sales` en `operations`, waardoor een beperkte pilot niet eerst een analytics- of dashboardwave nodig heeft.

## Waar nog frictie zit

- De shared Action Center-core is nog een bounded samenvattingslaag; next step, handoff-context en overdue-reden leven nog in aangrenzende delivery- en learningrecords.
- Niet-MTO productadapters staan nog bewust uit, waardoor ExitScan-, RetentieScan- en onboardingtrajecten voor deze pilot manual-first moeten worden samengesteld.
- Verantwoordelijkheidsoverdracht van Verisight delivery owner naar klantowner is wel beschreven, maar blijft kwetsbaar als first management use niet expliciet wordt gelogd en gesloten.
- Activatie, first value, first management use en follow-up closure zijn vier verschillende waarheden; zonder strakke begeleiding voelt een traject sneller "klaar" dan het in werkelijkheid is.
- De 30-90 dagen learning review is een aparte lus naast de eerste follow-up; zonder expliciete scriptregels kan die scheiding operators en klanten verwarren.

## Indeling van frictie

- productissue
  De productlaag is bruikbaar als follow-through-oppervlak, maar leunt nog op delivery- en learninglagen voor overdue-context, handoff-notes en concrete next-stepduiding. Toekomstige productadapters staan nog op inactive, dus deze pilot blijft bewust handmatig en bounded.
- opsissue
  De pilot staat of valt met een benoemde delivery owner die lifecycle-status, reviewstatus en learning handoff binnen een werkdag bijwerkt. Zonder dat ritme wordt de follow-through-laag snel verouderd en ontstaat er schijnzekerheid.
- onboardingissue
  First management use moet al tijdens activatie worden voorbereid en daarna worden gesloten met eigenaar, eerste actie en reviewdatum. Als dat script niet strak wordt gevolgd, blijft onboarding technisch "live" terwijl adoptie nog niet echt is begonnen.
- verwachtingsissue
  Zowel intern als klantzijdig kan activatie nog worden verward met adoptie, first value met managementgebruik en een eerste read met automatische verbreding. De pilot heeft dus duidelijke taalgrenzen nodig: geen automatische upsell, geen nieuwe route voordat de eerste follow-up echt geland is.

## Git-status

- Worktree: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-ops-pilot`
- Branch: `codex/action-center-ops-pilot`
- Artefact: `docs/ops/ACTION_CENTER_OPS_PILOT_OBSERVATION.md`
- Verificatie:
  - `python -m pytest tests/test_action_center_shared_core.py tests/test_pilot_learning_system.py`
  - `npm test -- action-center-shared-core.test.ts pilot-learning.test.ts`

## Oordeel

- bruikbaar pilotbeeld

## Aanbevolen volgende stap

Draai nu een echte maar kleine live pilot met 2-4 dossiers op een bestaande route, manual-first en met een expliciete Action Center-owner. Meet daarbij alleen vier dingen: ontbrekende eigenaar, gemiste reviewdatum, stale follow-upstatus en onduidelijke verwachting bij klant of operator. Pas na die ronde beslissen of er een smalle productverankering nodig is; nu nog geen brede adapterwave of dashboardscope openen.
