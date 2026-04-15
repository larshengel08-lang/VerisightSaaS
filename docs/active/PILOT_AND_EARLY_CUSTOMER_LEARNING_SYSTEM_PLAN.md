# PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

## 1. Summary

Deze tranche maakt van pilots en vroege klanttrajecten van Verisight een expliciet, internal-only leersysteem in plaats van een verzameling losse ervaringen, handmatige notities en impliciete operatorkennis.

Bewuste defaults:

- [x] ExitScan blijft de primaire eerste route.
- [x] RetentieScan blijft complementair en verification-first.
- [x] De learninglaag blijft admin-first en internal-only.
- [x] Verisight kiest voor manual-first persistent capture, niet voor een zware analytics-stack.
- [x] Elke vroege klantroute krijgt dezelfde vijf vaste checkpoints.
- [x] Learnings sluiten pas wanneer repo-bestemming of bewuste afwijzing expliciet is.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Persistente dossierlaag toegevoegd in backend-ORM en Supabase-schema.
- [x] Vijf vaste checkpoints gemodelleerd met status, lesson strength en destination areas.
- [x] Admin-only create/update routes toegevoegd voor dossiers en checkpoints.
- [x] Nieuwe workbench toegevoegd onder `/beheer/klantlearnings`.
- [x] Leadlijst gekoppeld aan directe dossierstart vanuit echte `contact_requests`.
- [x] Campaigndetail gekoppeld aan de learning-workbench via een interne summarylaag.
- [x] Ops-playbook en templates toegevoegd voor kickoff, implementation capture, managementread, 30-90 dagen review en synthesis.
- [x] Regressietests toegevoegd voor learningdefaults en persistence-contracten.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.

Bewust niet uitgevoerd in deze tranche:

- [ ] Geen brede product analytics- of telemetry-stack.
- [ ] Geen externe CRM- of workflow-orchestratie.
- [ ] Geen buyer-facing proofclaims of nieuwe commerciële evidence-output.
- [ ] Geen automatische reminders of lifecycle-automation.
- [ ] Geen respondent- of klantzichtbare learning-UI.

## 2. Milestones

### Milestone 0 - Freeze The Current Pilot And Learning Baseline
Dependency: none

- [x] Vastgelegd waar learnings nu al ontstaan: contact requests, routekeuze, implementation intake, importchecks, launch, dashboardread, rapportuitleg, managementread en vervolgroute.
- [x] Expliciet onderscheid gemaakt tussen bestaande objective signals, bestaande operatorchecks en nog niet geborgde kwalitatieve lessen.
- [x] Huidige persistente bronnen bevestigd: `contact_requests`, campaign metadata, respondentstatus, timestamps en readinessgrenzen.
- [x] Repo-gap benoemd: trustbezwaren, koopreden, implementationfrictie, reportbegrip en managementfollow-through waren nog te vrijblijvend.

### Milestone 1 - Define The Canonical Pilot And Early-Customer Learning Model
Dependency: Milestone 0

- [x] Eén canoniek learningmodel vastgelegd met ExitScan Baseline als primaire eerste route.
- [x] RetentieScan complementair gehouden en niet als gelijke default instap neergezet.
- [x] Vijf vaste checkpoints gemodelleerd:
  - `lead_route_hypothesis`
  - `implementation_intake`
  - `launch_output`
  - `first_management_use`
  - `follow_up_review`
- [x] Eén gedeelde triage-statuslogica toegevoegd:
  - `nieuw`
  - `bevestigd`
  - `geparkeerd`
  - `uitgevoerd`
  - `verworpen`
- [x] Eén gedeelde bestemmingstaxonomie toegevoegd:
  - `product`
  - `report`
  - `onboarding`
  - `sales`
  - `operations`

### Milestone 2 - Add A Persisted Learning Dossier Layer
Dependency: Milestone 1

- [x] `pilot_learning_dossiers` toegevoegd in SQLAlchemy en `supabase/schema.sql`.
- [x] `pilot_learning_checkpoints` toegevoegd in SQLAlchemy en `supabase/schema.sql`.
- [x] `contact_requests` schema synchroon gemaakt met de bestaande backendvelden `route_interest`, `cta_source` en `desired_timing`.
- [x] Admin-only RLS policies toegevoegd voor dossier- en checkpointbeheer.
- [x] Bestaande objective signals hergebruikt in plaats van dubbel geregistreerd.

### Milestone 3 - Capture Learnings At The Five Fixed Lifecycle Moments
Dependency: Milestone 2

- [x] Create-route laat elk nieuw dossier meteen de vijf vaste checkpoints aanmaken.
- [x] Leadcapture gekoppeld aan learningstart via `/beheer/contact-aanvragen`.
- [x] Workbench toont per checkpoint systemsuggesties op basis van lead-, campaign-, invite-, response- en accessdata.
- [x] Dossiervelden toegevoegd voor buyer-vraag, verwachte eerste waarde, koopreden, trustfrictie, implementationrisico, adoptionuitkomst, managementactie-uitkomst, vervolgroute en stopreden.

### Milestone 4 - Build The Cross-Functional Learning Triage Loop
Dependency: Milestone 3

- [x] Checkpoints ondersteunen `objective_signal_notes`, `qualitative_notes`, `interpreted_observation` en `confirmed_lesson`.
- [x] Lesson strength toegevoegd:
  - `incidentele_observatie`
  - `terugkerend_patroon`
  - `direct_uitvoerbare_verbetering`
- [x] Bestemmingen verplicht zichtbaar gemaakt in de workbench en documentatie.
- [x] Campaigndetail laat zien of deze campaign al in de learninglus is opgenomen.

### Milestone 5 - Add Internal Surfaces, Templates And Acceptance
Dependency: Milestone 4

- [x] Nieuwe admin-surface toegevoegd in `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`.
- [x] Contactaanvragenpagina gekoppeld aan directe dossierstart.
- [x] Ops-playbook toegevoegd in `docs/ops/PILOT_LEARNING_PLAYBOOK.md`.
- [x] Templates toegevoegd in `docs/ops/PILOT_LEARNING_TEMPLATES.md`.
- [x] Bestaande ops-docs bijgewerkt zodat onboarding en learning dezelfde checkpointtaal spreken.
- [x] Frontend- en backendtests toegevoegd op defaults en persistence.

## 3. Execution Breakdown By Subsystem

### Data model and persistence

- [x] Nieuwe ORM-modellen: `PilotLearningDossier` en `PilotLearningCheckpoint`.
- [x] Nieuwe Supabase-tabellen met indexes en admin-only RLS.
- [x] `contact_requests` schema aligned met de al gebruikte backendvelden.

### Admin routes and mutations

- [x] `POST /api/learning-dossiers` voor dossierstart plus default checkpoints.
- [x] `PATCH /api/learning-dossiers/[id]` voor dossierupdates.
- [x] `PATCH /api/learning-checkpoints/[id]` voor checkpointupdates.

### Internal UI and workflow

- [x] Nieuwe learning-workbench onder `Beheer`.
- [x] Leadlijst koppelt direct door naar een dossierstart op echte leadcontext.
- [x] Campaignpagina toont admin-only learning summary en doorlink naar de workbench.
- [x] Objective signals worden in de UI voorgesteld vanuit bestaande repo-data, niet vanuit losse handmatige interpretatie.

### Documentation and templates

- [x] Trancheplan toegevoegd als actieve source of truth.
- [x] Playbook toegevoegd voor vaste lifecyclemomenten, governance en closure.
- [x] Templates toegevoegd voor:
  - pilot kickoff
  - implementation lesson capture
  - first management read capture
  - 30-90 dagen review
  - lesson synthesis

### QA and acceptance

- [x] Frontend tests toegevoegd voor checkpointvolgorde, statuslabels en objective signal helpers.
- [x] Backend tests toegevoegd voor dossier- en checkpointpersistence via SQLAlchemy metadata.
- [x] Prompt-checklist bijgewerkt naar `Voldaan`.

## 4. Validation Run

Uitgevoerd in deze tranche:

- [x] `python -m pytest tests/test_pilot_learning_system.py`
- [x] `npm.cmd test -- --run lib/pilot-learning.test.ts`
- [x] `npm.cmd run lint -- "app/(dashboard)/beheer/klantlearnings/page.tsx" "app/(dashboard)/beheer/contact-aanvragen/page.tsx" "app/(dashboard)/beheer/page.tsx" "app/(dashboard)/campaigns/[id]/page.tsx" "components/dashboard/pilot-learning-workbench.tsx" "app/api/learning-dossiers/route.ts" "app/api/learning-dossiers/[id]/route.ts" "app/api/learning-checkpoints/[id]/route.ts" "lib/pilot-learning.ts" "lib/contact-requests.ts"`
- [x] `npm.cmd run build`
- [x] Vercel production-check bevestigd via linked project `verisight-saa-s`: `verisight.nl` en `verisight-saa-s.vercel.app` wijzen naar een `READY` production deployment op `main`.

Niet uitgevoerd:

- [ ] Volledige end-to-end browserrun met live Supabase-sessie
  - Niet nodig om de contractlaag te valideren; deze tranche draait primair om admin-only repo-functionaliteit.

## 5. Files That Carry This Tranche

- `backend/models.py`
- `supabase/schema.sql`
- `frontend/lib/pilot-learning.ts`
- `frontend/lib/contact-requests.ts`
- `frontend/app/api/learning-dossiers/route.ts`
- `frontend/app/api/learning-dossiers/[id]/route.ts`
- `frontend/app/api/learning-checkpoints/[id]/route.ts`
- `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- `frontend/components/dashboard/pilot-learning-workbench.tsx`
- `frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx`
- `frontend/app/(dashboard)/beheer/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `docs/ops/PILOT_LEARNING_PLAYBOOK.md`
- `docs/ops/PILOT_LEARNING_TEMPLATES.md`
- `docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md`
- `docs/ops/ONBOARDING_ACCEPTANCE_CHECKLIST.md`
- `docs/ops/SETUP.md`
- `frontend/lib/pilot-learning.test.ts`
- `tests/test_pilot_learning_system.py`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`

## 6. Current Product Risks

- [x] Lessons blijven nog manual-first; discipline in gebruik blijft belangrijk.
- [x] Triage is nu bestuurbaar, maar nog niet geautomatiseerd richting backlog of changelog.
- [x] Objective signals zijn bewust compact; bredere analytics zijn nog niet gebouwd.
- [x] Buyer-facing claims mogen niet sneller opschuiven dan de confirmed lessons werkelijk dragen.

## 7. Open Questions

- [ ] Willen we later een compacte internal-only timeline per dossier toevoegen?
- [ ] Willen we later reminders of reviewmomenten deels automatiseren?
- [ ] Willen we later per buyer type, sector of organisatiegrootte syntheses gaan maken?

## 8. Follow-up Ideas

- [ ] Gebruik confirmed lessons later als basis voor case-proof en evidence.
- [ ] Trek learningpatronen later door naar proposal spines en objection handling.
- [ ] Gebruik de dossierlaag later voor lifecycle- en expansion-denken.
