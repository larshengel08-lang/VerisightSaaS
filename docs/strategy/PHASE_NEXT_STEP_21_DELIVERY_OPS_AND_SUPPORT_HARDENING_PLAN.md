# Phase Next Step 21 - Delivery Ops And Support Hardening Plan

## Title

Harden delivery, ops, and support for the current Verisight suite so the existing assisted product model becomes more repeatable across setup, launch, first value, management use, exceptions, and learning handoff before any broader scale-up readiness gate is opened.

## Korte Summary

Na [PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md) is nu expliciet vastgezet hoe leads, routekeuze, operatorstatus en intakeharde handoff binnen de huidige suite moeten werken.

De volgende logische stap is nu:

- delivery, ops en support als één assisted operating layer scherper maken

Niet:

- self-serve delivery openen
- billing of checkout toevoegen
- CRM of supportplatform uitbreiden
- generieke workflow- of orchestrationlagen bouwen

De kernkeuze van deze stap is daarom:

- de bestaande assisted deliverylaag blijft de verkochte waarheid
- `CampaignDeliveryRecord`, `CampaignDeliveryCheckpoint` en `PilotLearningDossier` vormen samen de operationele ruggengraat
- first value, report delivery, management use en follow-up moeten suitebreed leesbaar en herhaalbaar blijven
- ops hardening gaat over discipline en consistentie, niet over automation-first platformbouw

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The repo already has a real assisted delivery system

De huidige codebase heeft nu al expliciete delivery-objecten:

- `CampaignDeliveryRecord`
- `CampaignDeliveryCheckpoint`
- `PilotLearningDossier`
- `PilotLearningCheckpoint`

en ook een operatorgerichte deliverylaag in:

- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [beheer/klantlearnings/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/klantlearnings/page.tsx)

Dat betekent dat delivery hardening nu moet bouwen op wat er al is, niet op een nieuw abstract model.

### 2. The current product promise still depends on assisted execution

Buyer-facing blijft Verisight verkopen als:

- begeleide setup
- gecontroleerde launch
- first value binnen een duidelijke handoff
- managementgebruik als echte mijlpaal

Dat maakt delivery en support nu een directe productlaag, geen losse interne achterkant.

### 3. Ops drift would now hurt the suite faster than missing automation

De huidige risico’s zitten waarschijnlijk eerder in:

- inconsistente deliverycadence per route
- onduidelijke checkpointbevestiging
- first value te vroeg of te laat claimen
- rapportdelivery en managementgebruik niet expliciet genoeg bevestigen
- learning en supportsignalen niet strak genoeg terugleiden

Niet in:

- gebrek aan workflow engines
- gebrek aan self-serve provisioning

### 4. This is the last preparation step before any true scale-up readiness gate

Zonder scherpe delivery/ops/support-laag kunnen latere scale-up-besluiten niet verantwoord worden genomen:

- billing zonder betrouwbare assisted delivery schept verkeerde verwachtingen
- checkout zonder heldere opsgrenzen vergroot exceptiondruk
- scale-up zonder first-value discipline vergroot churn- en trustrisico

## Current Implementation Baseline

### 1. Current delivery object model

- [x] `CampaignDeliveryRecord` bestaat als persistente deliveryruggengraat
- [x] `CampaignDeliveryCheckpoint` bestaat als expliciete acceptance- en exceptionlaag
- [x] `PilotLearningDossier` bestaat als learning- en reflectionlaag
- [x] `PilotLearningCheckpoint` bestaat als herhaalbare learningcadence

### 2. Current lifecycle and exception model

De bestaande lifecycle stages zijn nu al expliciet:

- `setup_in_progress`
- `import_cleared`
- `invites_live`
- `client_activation_pending`
- `client_activation_confirmed`
- `first_value_reached`
- `first_management_use`
- `follow_up_decided`
- `learning_closed`

De bestaande exception statuses zijn ook expliciet:

- `none`
- `blocked`
- `needs_operator_recovery`
- `awaiting_client_input`
- `awaiting_external_delivery`

### 3. Current checkpoint model

De bestaande checkpoints zijn:

- `implementation_intake`
- `import_qa`
- `invite_readiness`
- `client_activation`
- `first_value`
- `report_delivery`
- `first_management_use`

### 4. Current operator surfaces

- [x] beheer-overzicht toont operationele cadence
- [x] open checkpoints en exceptions zijn zichtbaar
- [x] report gaps en activation gaps zijn zichtbaar
- [x] learning-workbench bestaat al als expliciete follow-through laag

## Decision

### 1. Assisted Delivery Remains The Operating Truth

Beslissing:

- Verisight blijft voorlopig draaien op assisted delivery
- delivery hardening gaat dus over beter uitvoeren en beter bevestigen, niet over minder mensen

Niet toegestaan:

- delivery semantisch laten schuiven naar self-serve
- buyer-facing suggereren dat setup, activation of first value vanzelf lopen

### 2. Delivery Record Becomes The Canonical Ops Spine

Beslissing:

- `CampaignDeliveryRecord` blijft het primaire operationele object na intakebesluit
- iedere actieve campaign met echte delivery moet langs deze spine kunnen worden gelezen:
  - lifecycle stage
  - exception status
  - owner
  - next step
  - operator notes
  - customer handoff note

### 3. Checkpoints Must Stay Explicit And Human-Confirmable

Beslissing:

- delivery-checkpoints blijven expliciet, klein en handmatig bevestigbaar
- autosignalen blijven ondersteuning, geen vervanging van acceptance

Rationale:

- first value, report delivery en managementgebruik zijn productkritische momenten
- daar hoort expliciete operatorbevestiging bij zolang de suite assisted blijft

### 4. First Value And Management Use Are Separate Milestones

Beslissing:

- `first_value_reached` en `first_management_use` blijven aparte operationele statussen

Betekenis:

- `first_value_reached` = de campaign heeft genoeg veilige, bruikbare output om managementwaarde te kunnen dragen
- `first_management_use` = dashboard of rapport is daadwerkelijk gebruikt voor prioriteit, eigenaar of vervolgstap

Niet toegestaan:

- deze twee mijlpalen samenklappen tot één vage status
- buyer-facing first value claimen zonder expliciete operationele bevestiging

### 5. Report Delivery Must Remain Explicit

Beslissing:

- `report_delivery` blijft aparte checkpointlaag
- dat geldt ook wanneer de route geen PDF ondersteunt

Interpretatie:

- bij `exit` en `retention` gaat dit over echte reportoplevering
- bij follow-on routes gaat dit over expliciete managementread / handoff / bounded output delivery

### 6. Exceptions Must Stay Structured, Not Hidden In Notes

Beslissing:

- exception-status blijft eersteklas operating state
- supportfrictie, klantvertraging of operatorherstel mag niet wegvallen in vrije tekst

Niet toegestaan:

- exceptions alleen in `next_step` of `operator_notes` stoppen
- support en delivery laten vervagen tot losse commentaren zonder structurele status

### 7. Learning Closure Must Remain A Deliberate End State

Beslissing:

- `follow_up_decided` en `learning_closed` blijven aparte operationele eindsignalen
- learning wordt dus niet impliciet gesloten zodra een campaign eindigt

Rationale:

- de suite heeft nu meerdere routes en meerdere follow-on logica’s
- operationele lessen moeten expliciet afgerond en teruggekoppeld worden

### 8. Support Hardening Means Better Repeatability, Not Support Platform Expansion

Beslissing:

- support hardening binnen deze fase betekent:
  - betere operator visibility
  - betere next-step discipline
  - duidelijkere exception handling
  - scherpere first-value en report-delivery bevestiging

- support hardening betekent nog niet:
  - ticketing platform
  - SLA engine
  - enterprise support desk
  - customer portal redesign

## Operating Layer To Lock

### 1. Setup And Import Readiness

Vast te houden:

- implementation intake bevestigd
- import QA bevestigd
- invite readiness expliciet

Doel:

- geen “bijna klaar” campaigns zonder heldere deliverybasis

### 2. Client Activation Readiness

Vast te houden:

- klanttoegang telt pas wanneer activatie echt bevestigd is
- open invites zijn nog geen afgeronde activatie

Doel:

- buyer-facing launch claimen pas wanneer echte toegang en adoption mogelijk zijn

### 3. First Value Readiness

Vast te houden:

- first value volgt op bruikbare output
- lage-n of onvolledige scoredata vraagt expliciete terughoudendheid

Doel:

- first value blijft geloofwaardig en productwaar

### 4. Report / Management Delivery

Vast te houden:

- expliciete oplevering van rapport of managementread
- expliciete bevestiging van eerste managementgebruik

Doel:

- productwaarde niet verwarren met alleen technische beschikbaarheid

### 5. Follow-Up And Learning Closure

Vast te houden:

- vervolgroute of vervolgactie expliciet besloten
- learning pas sluiten als de les echt verwerkt is

Doel:

- suitebreed herhaalbare operating cadence

## Key Changes

- delivery, ops en support worden nu als één assisted operating layer vastgezet
- delivery record en checkpointlaag worden erkend als canonieke ops spine
- first value, report delivery en management use blijven apart en expliciet
- exceptions en learning closure blijven structureel en zichtbaar
- automation blijft bewust geblokkeerd zolang assisted discipline nog de echte hefboom is

## Belangrijke Interfaces / Contracts

### 1. Delivery Lifecycle Contract

- `setup_in_progress`
- `import_cleared`
- `invites_live`
- `client_activation_pending`
- `client_activation_confirmed`
- `first_value_reached`
- `first_management_use`
- `follow_up_decided`
- `learning_closed`

### 2. Delivery Exception Contract

- `none`
- `blocked`
- `needs_operator_recovery`
- `awaiting_client_input`
- `awaiting_external_delivery`

### 3. Delivery Checkpoint Contract

- `implementation_intake`
- `import_qa`
- `invite_readiness`
- `client_activation`
- `first_value`
- `report_delivery`
- `first_management_use`

### 4. Learning Handoff Contract

Operationele follow-through kan nu landen in:

- `CampaignDeliveryRecord`
- `CampaignDeliveryCheckpoint`
- `PilotLearningDossier`
- `PilotLearningCheckpoint`

maar alleen via expliciete stage- en handoffbesluiten

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md)
- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [beheer/klantlearnings/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/klantlearnings/page.tsx)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)

## Testplan

### Product acceptance

- [x] Assisted delivery blijft productwaarheid en geen tijdelijk lapmiddel.
- [x] First value en management use blijven expliciete productmijlpalen.
- [x] Outputdelivery blijft routebewust en bounded.

### Operational acceptance

- [x] Deliveryrecords blijven de canonieke ops spine.
- [x] Checkpoints blijven expliciet en handmatig bevestigbaar.
- [x] Exceptions blijven structureel zichtbaar.
- [x] Learning closure blijft een bewuste eindstatus.

### Support acceptance

- [x] Support wordt gelezen als exception discipline en handoff discipline.
- [x] Er opent nog geen nieuwe support toolinglaag.
- [x] Ops hardening blijft gericht op repeatability in de bestaande assisted setup.

### Codebase acceptance

- [x] Dit document sluit aan op de bestaande ops objecten en beheerflows.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen workflow platform of automation stack.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor delivery/ops/support hardening.
- [x] De grens met latere scale-up readiness blijft expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de bestaande operatorgedreven setup blijft voorlopig de juiste uitvoeringsvorm
- first value moet suitebreed operationeel expliciet bevestigd blijven
- supportproblemen moeten eerst zichtbaar en structureel zijn vóór ze geautomatiseerd worden
- ops hardening is nu belangrijker dan workflow automation
- een latere scale-up readiness gate pas zinvol is nadat deze deliverylaag bestuurlijk scherp staat

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md`

Er is nog geen build permission voor:

- delivery automation
- self-serve provisioning
- billing
- checkout
- enterprise controls
- een nieuwe productlijn
