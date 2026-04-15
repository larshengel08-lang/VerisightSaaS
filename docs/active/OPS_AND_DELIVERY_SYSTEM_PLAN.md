# Ops And Delivery System Plan

## Summary

Dit plan is nu de actieve source of truth voor de operations- en deliverylaag van Verisight.

Wat in deze tranche al echt in repo is aangebracht:
- een persistente lead-triagelaag op `contact_requests`
- een canonieke deliveryrecord per campaign via `campaign_delivery_records`
- persistente checkpoints voor implementation intake, import QA, invite readiness, client activation, first value, report delivery en first management use
- admin-oppervlakken voor leadtriage in `/beheer/contact-aanvragen`
- een persistente delivery control in `/campaigns/[id]` in plaats van localStorage-only checklisting
- prompt- en planlaag die deze tranche expliciet als source of truth moet behandelen

Wat dit plan nog steeds bewaakt:
- ExitScan blijft de primaire eerste route
- RetentieScan blijft complementair
- baseline blijft default, live blijft een bewuste vervolgroute
- assisted kwaliteit blijft leidend, ook wanneer operations herhaalbaarder wordt

## Milestones

### Milestone 1 - Freeze The Canonical Ops And Delivery Truth
Dependency: none

#### Tasks
- [x] Leg de echte repo-flow vast van contactaanvraag tot eerste managementread en vervolgroute.
- [x] Benoem expliciet welke stappen buyer-facing, internal-only, shared of backend-only zijn.
- [x] Maak per stap duidelijk wat nu al in product zit, wat in docs zit en wat nog op operatorgeheugen leunt.
- [x] Leg de feitelijke huidige source-of-truth-hiërarchie vast voor leadcapture, setup, readiness, activatie, report delivery, learning en demo.
- [x] Los bestaande truth-drift in kaart op, inclusief path-drift rond `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`.
- [x] Maak expliciet waar ExitScan-first, RetentieScan-complementair en baseline-first al hard verankerd zijn.

#### Definition of done
- [x] Er ligt één controleerbaar repo-gebaseerd beeld van de volledige ops- en deliveryketen.
- [x] Elke stap heeft een duidelijke huidige eigenaar, trigger en output.
- [x] Repo-drift en documentdrift zijn expliciet benoemd als invoer voor de rest van het plan.

#### Validation
- [x] Observaties zijn herleidbaar naar routes, schema, ops-docs en prompt-checklist.
- [x] Geen operationele conclusie leunt op externe aannames boven repo-truth.
- [x] ExitScan-first en assisted delivery blijven de leidende defaults.

### Milestone 2 - Define One Canonical Lifecycle And Status Model
Dependency: Milestone 1

#### Tasks
- [x] Definieer één canoniek lifecyclemodel voor lead captured -> route qualified -> implementation intake ready -> setup in progress -> import cleared -> invites live -> client activation pending/confirmed -> first value -> first management use -> follow-up decided -> learning closed.
- [x] Koppel aan elke fase eigenaar, ingang, exit-criteria en uitzonderingstaal.
- [x] Maak onderscheid tussen launch readiness, first-value readiness, adoption readiness en lifecycle follow-through.
- [x] Definieer exceptiontypen voor blocked, operator recovery, awaiting client input en awaiting external delivery.
- [x] Leg vast welke statuslaag op leadniveau en welke op campaignniveau hoort te leven.
- [x] Houd baseline/live in hetzelfde model zonder tweede concurrerende flow.

#### Definition of done
- [x] Verisight heeft een expliciete end-to-end lifecyclelogica.
- [x] Readiness en adoption-status hebben een vaste plaats.
- [x] Handovers tussen sales, setup, launch, adoption en learning zijn statusmatig besluitvast gemaakt.

#### Validation
- [x] Het model botst niet met huidige productguardrails.
- [x] RetentieScan blijft complementair.
- [x] Manual-first en persisted control zijn expliciet gescheiden.

### Milestone 3 - Replace Fragile Checklisting With Persisted Ops Control
Dependency: Milestone 2

#### Tasks
- [x] Vervang localStorage-only launch/acceptance-tracking door een persistente ops-control-laag per campaign.
- [x] Maak een persistente checkliststructuur voor implementation intake, import QA, invite readiness, client activation, first value, report delivery en first management use.
- [x] Definieer welke checks auto-derived zijn en welke handmatig bevestigd blijven.
- [x] Voeg operator-notes en exception-notes toe.
- [x] Voorkom dubbele waarheden tussen preflight, onboarding acceptance en campaign readiness door één deliveryrecord + checkpoints te gebruiken.
- [x] Maak checkliststatus zichtbaar in `/beheer/contact-aanvragen`, `/beheer` en `/campaigns/[id]`.

#### Definition of done
- [x] Kritieke deliverychecks zijn niet langer afhankelijk van browser-local state.
- [x] Auto-signalen en manual confirmations zijn gescheiden.
- [x] Een tweede operator kan de launch- en acceptance-status overnemen.

#### Validation
- [x] Readinessdata uit respondents, invites, client access en stats voedt de checkpointlaag.
- [x] De nieuwe statuslaag blijft compatibel met campaign stats en learning.
- [x] Handmatige checks blijven proportioneel.

### Milestone 4 - Harden Delivery Fault Handling And Recovery
Dependency: Milestone 3

#### Tasks
- [x] Maak lead notification failure zichtbaar in leadtriage.
- [x] Maak import/invite/activation/report risico's expliciet zichtbaar in de delivery control via warnings, exceptionstatus en operator-notes.
- [x] Bewaar onderscheid tussen safe fallback, manual recovery en klantcommunicatie in ops-tekst en UI.
- [x] Documenteer dat session/RLS plus backend secret bridges de huidige tijdelijke werkelijkheid zijn.
- [x] Voeg nog compactere monitoring of escalatie-overzichten toe voor mailproblemen, rapportfouten en activatiegaten.
- [x] Vertaal de volledige failure-mode matrix nog explicieter naar ops-playbooks.

#### Definition of done
- [x] Kritieke fouten in delivery hebben nu een zichtbaar recoveryhaakje.
- [x] Operators zien per campaign of er recovery of klantinput nodig is.
- [x] De recoverymatrix is nu expliciet uitgeschreven in ops-docs.

#### Validation
- [x] De belangrijkste backend- en frontend-overdrachtsstappen hebben nu exceptionstatus of warning-oppervlak.
- [x] Recoverypaden passen binnen assisted operations.
- [x] Geen zware automation is geforceerd.

### Milestone 5 - Operationalize Handoffs, Cadence, And Follow-Through
Dependency: Milestone 4

#### Tasks
- [x] Maak van lead -> intake -> setup -> live -> first read -> follow-up één vaste digitale leeslijn.
- [x] Definieer canonieke artefacten via leadtriage, deliveryrecord, checkpoints en learning-workbench.
- [x] Harmoniseer taal tussen leadflow, setup, campaign detail en learning.
- [x] Veranker learning als sluitstuk van vroege delivery.
- [x] Houd demo/sample gescheiden van echte klantdelivery in de planlaag.
- [x] Voeg nog een expliciet command-center of reviewritme-overzicht toe voor blocked setups en open loops.

#### Definition of done
- [x] Het traject van akkoord tot eerste managementwaarde is overdraagbaar zonder veel mondelinge context.
- [x] Follow-through na livegang is onderdeel van delivery geworden.
- [x] Learning closure en ops closure raken expliciet aan elkaar.

#### Validation
- [x] Een operator kan de flow volgen via productoppervlakken en playbooks.
- [x] Verkochte assisted flow en leverbare cadence lopen in dezelfde volgorde.
- [x] Demo/sample blijft gescheiden van echte klantops.

### Milestone 6 - Add Operational QA, Acceptance, And Governance Closure
Dependency: Milestone 5

#### Tasks
- [x] Vertaal het opsmodel naar toetsbare repo-oppervlakken.
- [x] Houd lead capture, import, invites, activation, readiness state en learning capture expliciet toetsbaar.
- [x] Verifieer het frontend met TypeScript en test-run.
- [x] Werk promptlaag en actieve docs bij zodat één ops-plan leidend wordt.
- [x] Werk `PROMPT_CHECKLIST.xlsx` en roadmap-status bij.
- [ ] Voeg nog bredere smoke-runs toe voor volledige end-to-end delivery buiten unit/integrationniveau.

#### Definition of done
- [x] Operations en delivery zijn procesmatig reviewbaar.
- [x] Het prompt-systeem weerspiegelt dat dit traject leidend is.
- [ ] Volledige browser- of live-smokes zijn nog niet aan deze tranche toegevoegd.

#### Validation
- [x] Kritieke flows zijn toetsbaar van leadcapture tot learning closure.
- [x] Planlaag, checklistlaag en actieve docs spreken dezelfde taal.
- [x] Overig vervolgwerk blijft expliciet open staan.

## Execution Breakdown By Subsystem

- [x] Lead capture and sales-to-delivery handoff: leadtriage, owner, next step en handoff note leven nu op `contact_requests`.
- [x] Implementation intake and setup control: elke campaign krijgt automatisch een deliveryrecord en checkpoints.
- [x] Respondent import, invites and activation: invite readiness en client activation zijn persistente checkpoints geworden.
- [x] Livegang, first value and report delivery: launch, first value en report delivery zijn gescheiden gates.
- [x] Learning capture and follow-up: campaign delivery en learning-workbench zijn expliciet aan elkaar gekoppeld.
- [x] Auth, secrets and operational boundaries: huidige secret bridges zijn als tijdelijke werkelijkheid benoemd in code en planlaag.
- [ ] QA, testing and governance: extra end-to-end smoke-lagen blijven vervolgwerk, maar monitoring en command-center signalen zijn nu toegevoegd.

## Current Product Risks

- [x] Risico op operationele chaos bij eerste groei is verlaagd, maar nog niet volledig weg zonder command-center en monitoring.
- [x] Risico op persoonsafhankelijk deliverywerk is verlaagd door persistente status en notes.
- [x] Risico op losse overdrachten tussen sales, setup, livegang en eerste managementread is verlaagd door lead -> delivery koppeling.
- [x] Risico op manual-only of localStorage-only checklisting is in deze tranche weggehaald.
- [x] Risico op verschil tussen verkochte flow en leverbare flow blijft bewaakt via assisted defaults.
- [x] Risico op verspreide truth over repo, externe docs en CRM is kleiner, maar externe artefacten blijven een aandachtspunt.
- [x] Risico op auth- of secret-bridges blijft aanwezig als later vereenvoudigingswerk.

## Open Questions

- [ ] Wordt blocked/recovery later een aparte overzichtspagina of blijft het binnen huidige beheeroppervlakken?
- [ ] Willen we first management use later productmatig meten naast handmatige bevestiging?
- [ ] Wanneer voegen we compactere monitoring toe voor mail-, rapport- en activatiefouten?
- [ ] Hoe sterk laten we externe CRM-artefacten nog meedoen nu repo-surfaces leidend zijn?

## Follow-up Ideas

- [ ] Bouw een intern ops command center voor open leads, blocked deliveries en open follow-up.
- [ ] Voeg async invite queueing toe zodra manual-first control stabiel genoeg is.
- [ ] Voeg report-delivery monitoring en recovery-smokes toe.
- [ ] Trek backend secret bridges later verder recht.

## Out of Scope For Now

- [ ] Self-service onboarding of billing
- [ ] Zware workflow-engine of brede CRM-automatisering
- [ ] Nieuwe productfamilies buiten ExitScan en RetentieScan
- [ ] Volledige backend-modularisatie
- [ ] Grote analytics-stack voor adoption evidence

## Defaults Chosen

- [x] `docs/prompts/OPS_AND_DELIVERY_SYSTEM_PLANMODE_PROMPT.md` blijft de leidende prompt.
- [x] Dit bestand is de actieve source of truth voor deze tranche.
- [x] ExitScan blijft primaire eerste route.
- [x] RetentieScan blijft complementair.
- [x] Assisted en manual-first blijven de operationele waarheid.
- [x] Baseline blijft default eerste deliveryroute.
- [x] Persistente checklisting krijgt voorrang boven zware automation.
