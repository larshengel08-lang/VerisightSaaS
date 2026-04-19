# DELIVERY_OPS_HARDENING_WAVE_STACK_PLAN.md

## 1. Summary

Dit document zet de **uitvoerbare implementatie-wave stack** voor delivery / ops hardening vast op basis van:

- [DELIVERY_OPS_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DELIVERY_OPS_HARDENING_IMPLEMENTATION_PLAN.md)

De kernbeslissing van deze stap is:

- delivery / ops krijgt nu een **gerichte assisted-discipline upgrade**
- die upgrade gebeurt in **kleine, gecontroleerde waves**
- de suite blijft daarbij expliciet **core-first**
- `ExitScan` blijft de default wedge
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- assisted delivery blijft de operating truth

Belangrijkste uitkomst uit de huidige codebase:

- de delivery-spine bestaat al via `CampaignDeliveryRecord` en `CampaignDeliveryCheckpoint`
- de campaign detail page heeft al een echte delivery control via `PreflightChecklist`
- client activation en learning hebben al eigen oppervlakken
- de grootste resterende gap zit nu in discipline, governance en zichtbaarheid, niet in ontbrekende platformlagen

Daarom opent deze stack niet met:

- self-serve delivery
- workflow engines
- supportplatforms
- nieuwe productscope

Maar met:

1. checkpoint and launch discipline
2. client activation and first value discipline
3. report, management use, and exception alignment
4. delivery learning and closeout discipline
5. closeout and refreshed delivery baseline

Deze stack bouwt nog niets. Ze zet alleen de toegestane delivery/ops-volgorde vast.

---

## 2. Why This Stack

De wavevolgorde is bewust zo gekozen:

- eerst moet de delivery-spine harder gaan afdwingen wat launch-ready echt betekent
- daarna moet client activation en first value minder ambigu worden
- daarna moet report delivery, management use en exceptionwerk beter in één lijn komen
- daarna pas mag learning-closeout expliciet aan delivery vastklikken
- closeout mag pas wanneer delivery, activation, output en learning als één coherent operating system groen zijn

Wat we dus expliciet **niet** doen:

- meteen support tooling verbreden
- eerst automation-first delivery bouwen
- billing of checkout koppelen aan delivery
- nieuwe producten openen

---

## 3. Locked Delivery And Ops Boundaries

Deze grenzen blijven tijdens alle waves hard staan:

- assisted delivery blijft de operating truth
- `CampaignDeliveryRecord` blijft het canonieke ops-object
- checkpoints blijven expliciet en handmatig bevestigbaar
- `first_value_reached` en `first_management_use` blijven aparte mijlpalen
- `report_delivery` blijft expliciet, ook bij bounded outputvormen
- exceptions blijven structurele states
- learning closure blijft een bewuste eindstatus
- geen self-serve onboarding
- geen supportdesk- of ticketingplatform
- geen workflow engine of scale-up laag

Deze track mag dus wel verbeteren:

- lifecycle discipline
- checkpoint governance
- activation discipline
- first value discipline
- management use discipline
- exception visibility
- learning closeout discipline

Deze track mag niet verbeteren via:

- platformverbreding
- nieuwe productlogica
- automation zonder directe delivery/ops-reden

---

## 4. Wave Stack

### Wave 1 - Delivery Checkpoint And Launch Discipline

Goal:

- de delivery-spine harder laten afdwingen wat launch-ready echt betekent

Focus:

- checkpoint discipline
- lifecycle transition gates
- expliciete launchblockers
- minder verborgen deliverydrift tussen record en checkpoints

Definition of done:

- vooruitgaande lifecycle-stappen kunnen niet meer stilletjes over open launchblockers heen springen
- checkpointbevestiging tegen warnings of exceptions vraagt explicietere discipline
- operators zien scherper wat launch-ready nog tegenhoudt

---

### Wave 2 - Client Activation And First Value Discipline

Goal:

- activation en first value als twee echte operating gates scherper maken

Focus:

- client activation bevestiging
- first value boundary
- minder ambigu verschil tussen “invite verstuurd”, “activatie loopt”, “activatie bevestigd” en “eerste bruikbare waarde”

Definition of done:

- client activation en first value lezen minder als losse labels en meer als echte deliverymijlpalen
- lifecycle-overgangen naar activation en first value vragen nu explicietere readiness

---

### Wave 3 - Report, Management Use, And Exception Alignment

Goal:

- report delivery, eerste managementgebruik en exceptionwerk in één coherent governancepad brengen

Focus:

- report delivery discipline
- first management use discipline
- structurele exception- en recoveryduiding
- operatorzichtbaarheid op campaignniveau en opsniveau

Definition of done:

- een campaign kan niet geloofwaardig als management-used of verder worden gelezen zonder expliciete output- en usage-discipline
- exceptionwerk blijft zichtbaar en bounded

---

### Wave 4 - Delivery Learning And Closeout Discipline

Goal:

- learning, follow-up en closeout explicieter koppelen aan de delivery-spine

Focus:

- `follow_up_decided`
- `learning_closed`
- koppeling tussen campaign delivery en linked learning/workbench
- voorkomen dat delivery sluit zonder expliciete follow-through

Definition of done:

- closeout is geen vage reststatus meer
- operators hebben een explicietere brug tussen delivery en learning closure

---

### Wave 5 - Delivery Ops Hardening Closeout

Goal:

- deze track formeel sluiten en de nieuwe delivery/ops baseline vastzetten

Focus:

- docs, code, tests en validatie volledig groen
- expliciet vastleggen wat nu scherper is in lifecycle, launch, activation, output, exceptions en learning
- bevestigen dat assisted delivery en core-first suite intact zijn gebleven

Definition of done:

- delivery/ops hardening is als gecontroleerde track formeel gesloten
- de volgende implementatiekeuze kan starten vanuit een groen, stabiel operating system

---

## 5. Sequence Rules

- Altijd precies één actieve delivery/ops-wave tegelijk
- Pas na green closeout van de vorige wave mag de volgende openen
- Elke wave moet tegelijk opleveren:
  - productuitkomst
  - codewijziging
  - docs-update
  - tests
  - smoke-validatie
- Geen self-serve of automation-first verbreding zolang deze track niet formeel is gesloten
- Geen nieuwe product- of scale-upscope zonder directe delivery/ops-reden

---

## 6. Acceptance Standard Per Wave

Elke delivery/ops-wave moet expliciet langs deze lagen sluiten:

### Product acceptance
- De wave maakt assisted delivery aantoonbaar scherper of betrouwbaarder.
- De wave houdt first value, management use en learning bounded en expliciet.

### Codebase acceptance
- De implementatie blijft klein en productgericht.
- Er schuift geen generieke workflow- of supportplatformlaag mee.

### Runtime acceptance
- Delivery control, activation, output en learning blijven coherent.
- Core-first suitegrenzen blijven intact.

### QA acceptance
- Relevante regressies zijn groen.
- Er is een duidelijke smoke-route voor de wave-uitkomst.

### Documentation acceptance
- De wavedocumentatie blijft synchroon met implementatie en gating.

---

## 7. Recommended First Execution Order

De eerstvolgende toegestane stap is nu:

- `WAVE_01_DELIVERY_CHECKPOINT_AND_LAUNCH_DISCIPLINE.md`

Nog niet toegestaan:

- direct learning closeout bouwen zonder lifecycle discipline
- supporttooling verbreden
- self-serve delivery openen

---

## 8. Defaults Chosen

- Assisted delivery blijft de operating truth.
- Launch discipline opent voor activation discipline.
- Activation discipline opent voor management use en exception alignment.
- Learning closeout mag pas na expliciete delivery-output discipline.
- De stack opent met governance en zichtbaarheid, niet met platformverbreding.

---

## 9. Next Allowed Step

De eerstvolgende toegestane stap is:

- `WAVE_01_DELIVERY_CHECKPOINT_AND_LAUNCH_DISCIPLINE.md`
