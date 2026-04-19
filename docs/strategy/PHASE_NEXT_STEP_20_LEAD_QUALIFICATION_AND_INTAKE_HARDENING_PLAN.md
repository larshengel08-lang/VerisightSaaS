# Phase Next Step 20 - Lead Qualification And Intake Hardening Plan

## Title

Sharpen lead qualification and intake handling for the current Verisight suite so route-aware leads become faster decision-ready, handoff-ready, and ops-ready without opening CRM expansion, revops sprawl, or premature delivery automation.

## Korte Summary

Na [PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md) is de commerciële architectuur van de huidige suite nu bestuurlijk scherp vastgezet:

- `ExitScan` blijft default first route
- `RetentieScan` blijft de expliciete primary exception
- `Combinatie` blijft portfolioroute
- follow-on routes blijven bounded
- pricing, CTA’s en suitecopy blijven `core-first`

De volgende logische stap is nu niet:

- delivery- of support-automation
- billing of CRM-verplaatsing
- enterprise intakeprocessen

Maar juist:

- de huidige leadcapture en intakeflow inhoudelijk scherper maken
- zorgen dat route-aware leads sneller triage- en handoff-ready worden
- vastleggen hoe contactcontext, buyer-vraag, timing, volgende stap en operatorstatus samen één gecontroleerd leadmodel vormen

De kernkeuze van deze stap is daarom:

- Verisight gebruikt voorlopig het bestaande leadmodel als gecontroleerde qualificationlaag
- lead hardening bouwt voort op de huidige `ContactRequest`, `CampaignDeliveryRecord` en `PilotLearningDossier` objecten
- qualification moet de suite reduceren tot de eerstvolgende logische route en intakevorm
- qualification mag niet ontaarden in een brede CRM-, scoring- of revops-stack

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The current lead model already exists, but is still more capture-ready than decision-ready

De huidige codebase heeft al een bruikbare leadlaag:

- `ContactRequest` in [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- updatebare operatorvelden via [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- een admin-overview in [contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)

De huidige velden dragen al:

- `route_interest`
- `cta_source`
- `desired_timing`
- `ops_stage`
- `ops_exception_status`
- `ops_owner`
- `ops_next_step`
- `ops_handoff_note`

Maar de bestuurlijke laag erboven is nog niet expliciet genoeg vastgezet als qualification- en intakearchitectuur.

### 2. Commercialization now needs a tighter decision handoff, not just better route capture

Route-aware capture is al aanwezig, maar de volgende commerciële winst zit nu in:

- sneller van lead naar eerste routebesluit
- helderder onderscheid tussen `nog-onzeker` en expliciete routeleads
- betere intakevoorbereiding voor delivery
- minder losse interpretatie door operators of sellers

### 3. The existing admin page already exposes the right operational pressure points

De huidige lead-admin in [contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx) laat al zien waar de druk zit:

- route
- timing
- notificatiestatus
- foutreden
- koppeling naar learning-workbench
- behoefte aan productspecifieke opvolging

Dat bevestigt dat de eerstvolgende stap niet “meer tooling” is, maar “strakkere qualificationregels”.

### 4. Intake hardening must happen before delivery hardening

Als qualification en intake nog te diffuus blijven:

- ontstaan verkeerde handoffs naar delivery
- worden follow-on routes sneller verkeerd verkocht
- wordt ops later gedwongen te compenseren voor commerciële onduidelijkheid
- groeit de suite operationeel scheef

Daarom moet intake hardening nu eerst als apart beslisdocument worden vastgezet.

## Current Implementation Baseline

### 1. Current lead capture reality

- [x] leads komen binnen via `/api/contact-request`
- [x] routekeuze, CTA-herkomst en gewenste timing worden opgeslagen
- [x] `leadership` is nu ook contractueel ondersteund
- [x] `ExitScan` blijft default route-interest wanneer niets expliciet gekozen is

### 2. Current operator reality

- [x] leadrecords kennen operatorstatusvelden
- [x] leads kunnen via een admin-route bekeken worden
- [x] notificatiefouten worden niet genegeerd maar expliciet opgeslagen
- [x] de huidige UI stuurt al op routecontext, timing en opvolging

### 3. Current handoff reality

- [x] `ContactRequest` kan gekoppeld worden aan `CampaignDeliveryRecord`
- [x] `ContactRequest` kan gekoppeld worden aan `PilotLearningDossier`
- [x] delivery en learning zijn dus al downstream objecten van intake
- [x] de suite kent nog geen volledig uitgewerkte intakekwalificatieboom

### 4. Current constraints

- [x] er is nog geen CRM-migratie
- [x] er is nog geen lead scoring engine
- [x] er is nog geen outbound automation stack
- [x] er is nog geen automatische proposal-, billing- of provisioningflow

## Decision

### 1. Qualification Must Reduce, Not Broaden

Beslissing:

- qualification is er om de eerstvolgende logische route en intakevorm scherp te maken
- qualification is er niet om meer routes tegelijk open te zetten

Rationale:

- de suite is al breed genoeg
- qualification moet buyer- en operatorverwarring verkleinen

### 2. The Current ContactRequest Model Remains The Qualification Spine

Beslissing:

- `ContactRequest` blijft voorlopig het primaire qualification-object
- qualification hardening bouwt dus voort op bestaande velden en bestaande updateflow
- er wordt nog geen nieuw leadobject geïntroduceerd

Belangrijkste bestaande velden die nu als qualification spine worden gezien:

- `route_interest`
- `cta_source`
- `desired_timing`
- `current_question`
- `ops_stage`
- `ops_exception_status`
- `ops_owner`
- `ops_next_step`
- `ops_handoff_note`
- `last_contacted_at`

### 3. Qualification Must Distinguish Route Confidence Explicitly

Beslissing:

- leads moeten bestuurlijk gelezen worden als één van deze categorieën:
  - `core-route clear`
  - `follow-on route plausible but needs confirmation`
  - `portfolio/combinatie only if second question is real`
  - `nog-onzeker / route needs operator narrowing`

Deze categorieën openen in deze stap nog geen codewijziging, maar vormen wel het besliskader voor de volgende implementation wave.

### 4. Intake Hardening Must Stay Core-First

Beslissing:

- follow-on leads mogen niet automatisch als normale first-sale leads behandeld worden
- intake moet dus expliciet bewaken:
  - is dit echt een follow-on vraag?
  - hoort dit eerst terug naar `ExitScan` of `RetentieScan`?
  - is `Combinatie` hier echt gerechtvaardigd?

Niet toegestaan:

- `Pulse`, `TeamScan`, `Onboarding 30-60-90` of `Leadership Scan` routinematig als standaard eerste deal behandelen
- `nog-onzeker` laten eindigen in te brede intake zonder routebesluit

### 5. Qualification And Intake Are Not Yet Delivery Or Learning Automation

Beslissing:

- deze stap gaat alleen over:
  - leadbesluit
  - routebevestiging
  - intake readiness
  - operator owner en next step
  - handoff note discipline

- deze stap gaat nog niet over:
  - campaign provisioning
  - delivery checkpoint automation
  - support workflows
  - learning-program automation

### 6. Notification Failures, Timing And Route Drift Remain First-Class Qualification Inputs

Beslissing:

- een lead is niet “af” zodra hij is opgeslagen
- notification status, timing, routefit en handoff readiness zijn allemaal onderdeel van qualification health

Dat betekent:

- notificatiefouten blijven expliciet zichtbaar
- gewenste timing blijft triage-input
- routekeuze blijft operatorcontrole vragen wanneer deze zwak of te breed is

### 7. Qualification Must Prepare A Cleaner Handoff To Two Downstream Systems

Beslissing:

- qualification dient nu twee mogelijke downstream paden voor te bereiden:
  - `CampaignDeliveryRecord` wanneer een route en traject bevestigd worden
  - `PilotLearningDossier` wanneer buyerfrictie, hypothese of leersignaal eerst vastgelegd moet worden

Niet toegestaan:

- delivery en learning als losse parallelle werksporen behandelen zonder expliciet intakebesluit

## Qualification Categories To Lock

### 1. Core Route Clear

Voorbeeld:

- expliciete `exitscan` of `retentiescan`
- buyer-vraag past direct bij kernroute
- timing en vraag zijn concreet genoeg voor intakevoorbereiding

Gewenste vervolgstap:

- operator bevestigt route
- intake next step wordt expliciet
- handoff naar delivery kan voorbereid worden

### 2. Follow-On Plausible But Needs Confirmation

Voorbeeld:

- `teamscan`, `onboarding`, `leadership` of `pulse`
- buyer-vraag klinkt follow-on, maar bevestiging nodig of er al een eerder signaal of eerste routebasis is

Gewenste vervolgstap:

- operator toetst of de vraag echt vervolg-gedreven is
- zo niet: lead terug naar kernroutekeuze

### 3. Combination Only If The Second Question Is Real

Voorbeeld:

- `combinatie`
- buyer noemt twee managementvragen tegelijk

Gewenste vervolgstap:

- operator bevestigt of beide vragen echt tegelijk bestaan
- als niet: terugbrengen naar eerste kernroute

### 4. Route Unclear / Needs Narrowing

Voorbeeld:

- `nog-onzeker`
- te brede vraag
- CTA-herkomst en buyer-vraag spreken elkaar tegen

Gewenste vervolgstap:

- operator reduceert de keuze tot één eerste routebesluit

## Key Changes

- qualification en intake worden nu als eigen architectuurlaag vastgezet
- het bestaande leadmodel wordt bevestigd als centrale qualification spine
- follow-on leads krijgen expliciet strengere intakebevestiging dan kernroutes
- notificatiestatus, timing en operatorvelden worden erkend als echte qualification inputs
- downstream handoff naar delivery en learning wordt expliciet voorbereid, maar nog niet geautomatiseerd

## Belangrijke Interfaces / Contracts

### 1. Lead Capture Contract

- `route_interest`
- `cta_source`
- `desired_timing`
- `current_question`

blijven de buyer-facing qualification inputs

### 2. Operator Qualification Contract

- `ops_stage`
- `ops_exception_status`
- `ops_owner`
- `ops_next_step`
- `ops_handoff_note`
- `last_contacted_at`

vormen samen de interne qualification/handoff laag

### 3. Downstream Handoff Contract

Qualification kan uitmonden in:

- `CampaignDeliveryRecord`
- `PilotLearningDossier`

Maar pas nadat de eerste route en intakevorm voldoende scherp zijn

### 4. Route Discipline Contract

- `ExitScan` blijft default
- `RetentieScan` blijft expliciete uitzondering
- `Combinatie` blijft secundair
- follow-on routes blijven vervolg-gedreven
- `nog-onzeker` moet worden teruggebracht tot één eerste routebesluit

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md)
- [contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md)
- [CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md)

## Testplan

### Product acceptance

- [x] Qualification blijft de suite reduceren in plaats van verbreden.
- [x] Follow-on routes blijven strenger bevestigd dan kernroutes.
- [x] `nog-onzeker` blijft keuzehulp en geen eindstation.

### Commercial acceptance

- [x] Lead qualification blijft `core-first`.
- [x] Routebevestiging en intake readiness worden expliciete operatoruitkomsten.
- [x] `Combinatie` blijft alleen logisch bij echte tweede vraag.

### Operational acceptance

- [x] Operatorvelden worden erkend als echte qualificationlaag.
- [x] Delivery en learning blijven downstream paden en niet het startpunt.
- [x] Deze stap opent nog geen delivery-automation.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige lead-, admin- en ops-objecten.
- [x] Dit document introduceert nog geen nieuw leadobject of CRM-laag.
- [x] Dit document opent nog geen implementation wave.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor qualification en intake hardening.
- [x] De grens tussen commercial architecture en delivery/ops blijft expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- het huidige leadmodel is voorlopig sterk genoeg om qualification op te bouwen
- commerciële reductie is belangrijker dan meer automation
- de operator blijft voorlopig een actieve schakel in routebevestiging en intakevoorbereiding
- follow-on routes vragen standaard meer commerciële verificatie dan kernroutes
- delivery automation komt later pas aan bod

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md`

Er is nog geen build permission voor:

- CRM migration
- delivery automation
- billing
- checkout
- een nieuwe productlijn
