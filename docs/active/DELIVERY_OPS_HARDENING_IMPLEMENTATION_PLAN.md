# DELIVERY_OPS_HARDENING_IMPLEMENTATION_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de eerstvolgende implementatiefase na de formeel gesloten lead qualification- en intaketrack.

De kernsituatie is nu:

- de suite is productmatig paritywaardig en commercieel genormaliseerd
- qualification en intake dwingen nu beter af wat de juiste eerste route is
- bounded commerce en intake readiness bestaan nu als expliciete gate
- daardoor verschuift de eerstvolgende implementatievraag van:
  - "hoe kiezen we de juiste route?"
- naar:
  - "hoe maken we delivery, ops en support daarna consistenter, overdraagbaarder en minder persoonsafhankelijk?"

Dit document opent daarom:

- delivery / ops hardening implementation

En opent niet:

- nieuwe producten
- nieuwe platformlagen
- scale-up werk
- bredere billing/checkout uitbreiding
- self-serve delivery
- ticketing-, CRM- of workflow-platformbouw

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: not started
- Next allowed step: `DELIVERY_OPS_HARDENING_WAVE_STACK_PLAN.md`

---

## 2. Why This Track Now

De suite en intakekant zijn nu scherp genoeg dat de grootste resterende frictie waarschijnlijk zit in:

- wanneer een campaign echt launch-ready is
- hoe import, invite readiness en client activation consistent bevestigd worden
- wanneer `first_value_reached` veilig claimbaar is
- hoe `report_delivery` en `first_management_use` per route discipline houden
- hoe blocked, recovery en awaiting-client states zichtbaar en herhaalbaar blijven
- hoe learning en follow-up expliciet worden gesloten in plaats van impliciet weg te vallen

De huidige codebase laat ook zien dat hier al een echte basis voor bestaat:

- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts) bevat al een canonieke lifecycle-, exception- en checkpointlogica
- [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx) is feitelijk al het delivery-control-oppervlak per campaign
- [client-access-list.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/client-access-list.tsx) bewaakt client activation en invite follow-through
- [pilot-learning-workbench.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/pilot-learning-workbench.tsx) is al de expliciete learning- en follow-up laag
- `CampaignDeliveryRecord`, `CampaignDeliveryCheckpoint`, `PilotLearningDossier` en `PilotLearningCheckpoint` bestaan al als persistente ruggengraat

Dus:

- qualification/intake sloot de voorkant van de routekeuze
- deze track moet nu de uitvoering daarna aanscherpen

---

## 3. Objective

Doel van deze track:

- de assisted deliverylaag herhaalbaarder maken
- delivery-checkpoints scherper en minder ambigu maken
- operators beter laten zien waar een campaign staat en wat de volgende echte stap is
- first value, report delivery, management use en learning closure suitebreed consistenter maken
- exception- en recoverywerk zichtbaarder en overdraagbaarder maken

Gewenste uitkomst:

- minder drift tussen intake, setup, livegang en learning
- minder verborgen exceptionwerk in losse notities
- duidelijkere handoff van qualification naar delivery naar follow-through

---

## 4. Scope In

- delivery lifecycle discipline
- checkpoint discipline en checkpoint visibility
- client activation and first value discipline
- report delivery en first management use discipline
- exception handling, recovery visibility en blocked-state management
- follow-up and learning closure alignment
- tests, docs en acceptance voor deze delivery/ops laag

## 5. Scope Out

- nieuwe productlijnen
- routeactivatie of buyer-facing productuitbreiding
- billing/checkout verbreding
- self-serve onboarding of provisioning
- nieuw supportplatform of ticketingsysteem
- generieke workflow- of orchestrationlaag
- brede automation-first delivery

---

## 6. Core Questions To Answer

Deze track moet expliciet antwoord geven op:

1. Wanneer is een campaign echt klaar om delivery te starten, los van alleen intake-ready?
2. Welke checkpoints moeten hard en expliciet bevestigd blijven voordat invites of livegang verantwoord zijn?
3. Wanneer telt client activation echt als bevestigd en niet alleen als invite verstuurd?
4. Wanneer mag `first_value_reached` veilig worden gezet per route en waar moeten we terughoudend blijven?
5. Hoe blijven `report_delivery` en `first_management_use` expliciet en routebewust, ook bij bounded follow-on producten?
6. Hoe maken we blocked-, recovery- en awaiting-client situaties sneller leesbaar voor operators?
7. Wanneer is follow-up echt besloten en wanneer mag learning formeel sluiten?

---

## 7. Current Codebase Baseline

De implementatiebasis voor deze track is nu:

- persistente deliveryruggengraat via `CampaignDeliveryRecord`
- persistente checkpointlaag via `CampaignDeliveryCheckpoint`
- expliciete learningruggengraat via `PilotLearningDossier` en `PilotLearningCheckpoint`
- delivery samenvatting en autosignalen in [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- campaign-level delivery control in [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- client activation oppervlak in [client-access-list.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/client-access-list.tsx)
- learning en follow-through oppervlak in [pilot-learning-workbench.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/pilot-learning-workbench.tsx)
- qualification/intake en bounded commerce gates die nu al voorafgaande readiness vastleggen

Belangrijk:

- dit plan bouwt voort op wat er al bestaat
- dit plan vervangt het bestaande opsmodel niet door een abstracter platformmodel

---

## 8. Proposed Execution Order

De eerstvolgende veilige volgorde is:

1. `DELIVERY_OPS_HARDENING_WAVE_STACK_PLAN.md`
2. `WAVE_01_DELIVERY_CHECKPOINT_AND_LAUNCH_DISCIPLINE.md`
3. `WAVE_02_CLIENT_ACTIVATION_AND_FIRST_VALUE_DISCIPLINE.md`
4. `WAVE_03_REPORT_MANAGEMENT_USE_AND_EXCEPTION_ALIGNMENT.md`
5. `WAVE_04_DELIVERY_LEARNING_AND_CLOSEOUT_DISCIPLINE.md`
6. `WAVE_05_DELIVERY_OPS_HARDENING_CLOSEOUT.md`

Dat betekent:

- eerst de wave-stack, boundaries en acceptance vastzetten
- daarna pas gecontroleerde implementatie-waves

---

## 9. Defaults Chosen

- Assisted delivery blijft de operationele waarheid.
- `CampaignDeliveryRecord` en `CampaignDeliveryCheckpoint` blijven de canonieke ops spine na intakebesluit.
- `first_value_reached` en `first_management_use` blijven aparte mijlpalen.
- `report_delivery` blijft expliciet, ook bij routes zonder klassieke PDF-oplevering.
- Exceptions blijven structurele states en mogen niet verdwijnen in vrije tekst.
- Learning closure blijft een bewuste eindstatus en geen impliciete afsluiting.
- Deze track optimaliseert discipline en repeatability, niet automation-first schaalbaarheid.
- `ExitScan` blijft default wedge en `RetentieScan` blijft de enige situationeel primaire uitzondering; delivery hardening verandert die suitehiërarchie niet.
- Als er parallel frontendwerk gebeurt, moet dat per wave op afgesproken file-ownership gebeuren; gedeelde control-oppervlakken zoals `preflight-checklist.tsx`, `client-access-list.tsx` en `lead-ops-table.tsx` mogen niet tegelijk door meerdere mensen worden aangepast.

---

## 10. Acceptance

### Product acceptance
- [x] Dit document maakt duidelijk waarom delivery/ops hardening nu de logische volgende implementatietrack is.
- [x] Assisted delivery, first value en management use blijven expliciete productmijlpalen.

### Codebase acceptance
- [x] Het plan sluit aan op de bestaande delivery-, checkpoint- en learningrealiteit in de codebase.
- [x] Het plan bouwt voort op bestaande surfaces in plaats van een nieuw platformmodel te introduceren.

### Runtime acceptance
- [x] De bestaande suitehiërarchie en bounded productgrenzen blijven intact.
- [x] Dit document opent nog geen self-serve of automation-first runtimepad.

### QA acceptance
- [x] Het document maakt duidelijk dat ook deze track wave- en gate-based uitgevoerd moet worden.
- [x] Exceptions, first value en learning closure blijven toetsbare acceptancepunten.

### Documentation acceptance
- [x] Dit document kan direct dienen als startpunt voor de delivery/ops hardening wave stack.
- [x] De grens met latere scale-up of supportplatformwerk blijft expliciet.

---

## 11. Next Allowed Step

Na dit document mag nu openen:

- `DELIVERY_OPS_HARDENING_WAVE_STACK_PLAN.md`
