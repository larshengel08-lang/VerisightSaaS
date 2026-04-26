# DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

Historical boundary note:

- dit plan blijft leidend voor demo-, sample- en showcase-architectuur binnen deze tranche, maar niet voor de zelfstandige commerciële routehiërarchie
- actuele first-buy truth en buyer-facing routewoorden winnen in [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md), [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md) en [COMMERCIAL_AND_ONBOARDING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md)
- sample-, showcase- en bewijsgrenzen winnen in [SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md) en [CASE_PROOF_AND_EVIDENCE_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md)

## 1. Summary

Dit traject maakt van de losse demo- en samplelagen van Verisight een expliciet systeem met vaste laagindeling, scenario-contracten, seed-orchestratie, playbook en regressiebescherming.

Uitgevoerd in deze tranche:

- [x] canonieke demo-laagindeling vastgelegd: buyer-facing showcase, internal sales demo, QA/live fixture en validation sandbox
- [x] canoniek scenario-contract toegevoegd in `demo_environment.py`
- [x] centrale orchestrator toegevoegd in `manage_demo_environment.py`
- [x] internal sales demo gestandaardiseerd rond een gedeelde demo-organisatie `verisight-sales-demo`
- [x] docs en acceptance-governance toegevoegd voor demo-flow, veiligheid en onderhoud
- [x] promptverwijzingen opgeschoond naar actuele repo-truth
- [x] regressietests toegevoegd voor scenario-contracten en sales demo seeds
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt op de echte repo-status

Bewuste defaults:

- [x] ExitScan blijft de primaire eerste demo- en showcase-route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Buyer-facing sample-output blijft apart via `generate_voorbeeldrapport.py`.
- [x] QA/live-fixtures en validation-sandboxes blijven bewust gescheiden van buyer-facing proof en sales-demo.

## 2. Milestones

### Milestone 0 - Freeze Current Demo And Sample Truth
Dependency: none

#### Tasks
- [x] Buyer-facing sample-output, internal demo-seeds, QA/live-fixtures, validation-sandboxes en legacy archive expliciet in kaart gebracht.
- [x] Huidige drift vastgelegd rond ontbrekend active planbestand, promptverwijzingen naar archiefcontext en inconsistente scenario-identiteiten.
- [x] Vastgelegd dat buyer-facing showcase al canoniek was, maar dat internal demo en QA/validation nog niet als een systeem beschreven waren.

#### Definition of done
- [x] Er ligt een repo-gebaseerd beeld van de volledige demo/samplelaag.
- [x] Buyer-facing showcase en interne demo/QA-lagen zijn expliciet van elkaar onderscheiden.

#### Validation
- [x] Observaties zijn terug te voeren op actuele scripts, docs, pdf's en promptbestanden.
- [x] ExitScan-first en RetentieScan-complementair zijn zichtbaar gehouden.

### Milestone 1 - Define The Canonical Demo And Sample Architecture
Dependency: Milestone 0

#### Tasks
- [x] Vier vaste lagen gedefinieerd in docs en code.
- [x] Per laag doelgroep, gebruiksmoment, claimsgrens, resetstrategie, eigenaar en datahygiene vastgelegd.
- [x] Canonieke identiteiten gekozen:
  - buyer-facing sample: `techbouw-demo`
  - internal sales demo: `verisight-sales-demo`
  - QA/live fixture: eigen fixture-orgs
  - validation sandbox: lokale data-paden
- [x] Vastgelegd dat buyer-facing sample-assets nooit internal demo vervangen.

#### Definition of done
- [x] Verisight heeft een expliciete demo/samplearchitectuur met vaste laagindeling.
- [x] Elke laag heeft een niet-overlappend doel.

#### Validation
- [x] Architectuur blijft binnen strategie-, trust- en claimsguardrails.
- [x] RetentieScan blijft gerichte vervolgroute in demo's.

### Milestone 2 - Create One Canonical Demo Seeding And Reset System
Dependency: Milestone 1

#### Tasks
- [x] `manage_demo_environment.py` toegevoegd als leidende orchestrator.
- [x] Vaste scenario's vastgelegd:
  - `sales_demo_exit`
  - `sales_demo_retention`
  - `qa_exit_live_test`
  - `qa_retention_demo`
  - `validation_retention_pilot`
- [x] Seedregels vastgelegd rond determinisme, idempotentie, fictieve data en veilige demo-domeinen.
- [x] Internal sales demo ingericht met gedeelde demo-organisatie en productspecifieke scenario's.

#### Definition of done
- [x] Interne demo-scenario's zijn reproduceerbaar vanuit een leidend contract.
- [x] Demo-reset vraagt niet meer om verspreide scriptkennis als instappunt.

#### Validation
- [x] Een operator kan scenario's centraal opvragen via `manage_demo_environment.py list`.
- [x] Wrapper-scenario's voor QA en validation blijven beschikbaar onder dezelfde ingang.

### Milestone 3 - Standardize Demo Scenarios, Campaign States And Sample Data Quality
Dependency: Milestone 2

#### Tasks
- [x] ExitScan sales demo voorzien van empty, early, indicative, decision-ready en closed states.
- [x] RetentieScan sales demo voorzien van indicative plus trend baseline/follow-up.
- [x] Responsdrempels vastgelegd:
  - detail vanaf 5
  - patroonbeeld vanaf 10
- [x] Veilige demo-maildomeinen en fictieve identiteiten hard vastgelegd.
- [x] Vastgelegd welk deel buyer-facing teaser/proof blijft en welk deel internal live-demo is.

#### Definition of done
- [x] Elke demo-state heeft een duidelijke rol in sales, onboarding of QA.
- [x] Demo-content blijft representatief voor echt productgedrag.

#### Validation
- [x] Scenario's ondersteunen hetzelfde productverhaal als dashboard, rapport en marketingcopy.
- [x] RetentieScan trend en segmentverdieping blijven verification-first.

### Milestone 4 - Align Demo Flow, Internal Enablement And Buyer-Facing Entry Points
Dependency: Milestone 3

#### Tasks
- [x] Een vaste demo-flow vastgelegd in `docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md`.
- [x] Buyer-facing entry points bewust beperkt gehouden tot sample-output en previews.
- [x] Relatie vastgelegd tussen sample-output, internal demo, onboarding en vroege klantgesprekken.
- [x] Demo-prompt bijgewerkt naar actuele repo-bestanden in plaats van archiefverwijzingen.

#### Definition of done
- [x] Sales en onboarding hebben een consistente demo-volgorde.
- [x] Buyer-facing sample-output en internal demo ondersteunen hetzelfde verhaal met verschillende rollen.

#### Validation
- [x] Een nieuwe operator kan de juiste demo kiezen zonder mondelinge uitleg.
- [x] Promptlaag verwijst naar actuele repo-truth.

### Milestone 5 - Add Smoke Checks, Governance And Regression Protection
Dependency: Milestone 4

#### Tasks
- [x] Acceptancechecklist toegevoegd voor laagindeling, scenario's, veiligheid en smoke-checks.
- [x] Regressietests toegevoegd voor scenario-contracten en internal sales demo seeds.
- [x] Refresh-governance vastgelegd in docs.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.

#### Definition of done
- [x] Demo/sample is inhoudelijk, operationeel en administratief geborgd.
- [x] Drift wordt sneller zichtbaar via docs en tests.

#### Validation
- [x] Kritieke demo/sampleflows hebben regressiebescherming.
- [x] Prompt-checklist weerspiegelt de repo-status van deze tranche.

## 3. Execution Breakdown By Subsystem

### Demo architecture
- [x] Vaste laagindeling toegevoegd en leidend gemaakt in docs en code.
- [x] Buyer-facing, sales demo, QA en validation expliciet van elkaar gescheiden.

### Sample output and showcase
- [x] Buyer-facing sample-pipeline bewust ongemoeid gelaten.
- [x] Sample-outputdocs aangevuld met expliciete verwijzing naar de bredere demo-architectuur.

### Demo seeding and reset tooling
- [x] Nieuwe canonieke orchestrator toegevoegd.
- [x] Internal sales demo seedlogica toegevoegd voor ExitScan en RetentieScan.
- [x] Bestaande QA/validation-scripts onder dezelfde orchestrator bereikbaar gemaakt.

### Internal sales demo
- [x] Gedeelde demo-organisatie toegevoegd als sales truth.
- [x] ExitScan- en RetentieScan-scenario's met veilige campaign states vastgelegd.

### QA and validation fixtures
- [x] Bestaande fixture-scripts behouden.
- [x] Hun rol opnieuw vastgelegd als QA/live fixture of validation sandbox, niet als buyer-facing demo.

### Docs, prompts and operating playbooks
- [x] Nieuw systeemdocument toegevoegd.
- [x] Nieuw playbook toegevoegd.
- [x] Nieuwe acceptance-checklist toegevoegd.
- [x] Demo-planbestand in `docs/active` toegevoegd.
- [x] Demo-prompt geactualiseerd.

### Testing and acceptance
- [x] Tests toegevoegd voor scenario-dekking, veilige identiteiten en idempotente sales demo seeds.
- [x] Acceptance-governance expliciet gemaakt voor demo-health en promptsluiting.

## 4. Current Product Risks

- [x] Risico op kapotte of verouderde demo's is verlaagd door centrale orchestratie en docs.
- [x] Risico op te veel handmatig demo-werk is verlaagd door `manage_demo_environment.py` en het playbook.
- [x] Risico op sampledata die niet representatief is verkleind door vaste scenario-contracten en response thresholds.
- [x] Risico op gevoelige data in demo-omgevingen is verder begrensd via fictieve identiteiten en veilige demo-domeinen.
- [x] Risico op mismatch tussen demo en echt product is verlaagd door expliciete scheiding tussen buyer-facing sample, internal demo, QA en validation.

## 5. Open Questions

- [ ] Willen we later een afgeschermde interne demostartpagina in de app, of blijft de demo-omgeving script- en playbook-gedreven?
- [ ] Willen we demo health later automatisch periodiek controleren in CI of alleen via handmatige smoke-runs?
- [ ] Willen we na eerste echte pilots een aparte case-prooflaag naast sample-output en demo toevoegen?

## 6. Follow-up Ideas

- [ ] Voeg later een demo health command toe dat seed-scenario's en sample mirrors in een run controleert.
- [ ] Overweeg later een compacte boardroom demo-afleiding van de bestaande sample-output.
- [ ] Koppel later pilot learning expliciet aan demo refresh en bezwaarpatronen.

## 7. Out of Scope For Now

- [x] Geen publieke self-service demo-tenant.
- [x] Geen nieuwe productfamilies buiten ExitScan en RetentieScan.
- [x] Geen vervanging van de bestaande buyer-facing sample-pdf's als primaire prooflaag.
- [x] Geen brede analytics- of CRM-automatisering voor demo-gebruik.

## 8. Defaults Chosen

- [x] `docs/prompts/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLANMODE_PROMPT.md` blijft de leidende prompt.
- [x] `docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md` is de source of truth.
- [x] ExitScan blijft de primaire eerste demo- en showcase-route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Buyer-facing sample-output blijft apart via `generate_voorbeeldrapport.py`.
- [x] `verisight-sales-demo` is de canonieke internal sales demo-identiteit.
- [x] QA/live-test fixtures en validation-sandboxes blijven aparte lagen.
- [x] Demo-data gebruikt alleen fictieve namen en veilige demo-adressen.
- [x] Prompt- en governance-updates zijn gebaseerd op actuele repo-truth en niet op externe archiefcontext.
