# Phase 2 Step 1 - System Layers, Domain Boundaries, and Artifact Lifecycle

## Title

Lock the current Verisight system layers, domain boundaries, access boundaries, and artifact lifecycle before any new productline architecture or build wave starts.

## Korte Summary

Deze stap zet de huidige systeembasis van Verisight expliciet vast, zodat toekomstige productlijnen op de bestaande productrealiteit kunnen voortbouwen in plaats van op een te breed, vooruitgedacht platformmodel. Het document bepaalt welke lagen vandaag echt bestaan, welke kernentiteiten de runtime al dragen, hoe control plane, runtime, UI en jobs nu feitelijk van elkaar verschillen, en welke artifacts persistent zijn versus alleen on-demand worden afgeleid.

De belangrijkste beslissing is dat Verisight voorlopig campaign-centered blijft. `Organization`, `Campaign`, `Respondent` en `SurveyResponse` blijven de primaire runtime-objecten. Delivery- en learninglagen blijven control-plane objecten rondom die campaign-kern. Rapporten, dashboardsamenvattingen en patroonduiding blijven afgeleide artifacts. Er komt in deze fase nog geen generiek `run`, `artifact`, `workflow` of multi-product execution-platform bij zolang de eerstvolgende productlijn dat niet direct en aantoonbaar nodig heeft.

Status van deze stap:

- Decision status: complete
- Runtime status: geen live productwijzigingen
- Build status: geen productbouw gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na Phase 1 is duidelijk:

- welke suitevolgorde logisch is
- welke productlijnen wel en niet binnen scope liggen
- welke ICP- en packaginggrenzen gelden

Wat nog ontbrak, was de architecturale vertaling daarvan naar de huidige codebase:

- welke lagen zijn platformlaag en welke zijn productspecifiek
- wat is control plane, wat is runtime, wat is UI en wat is nu nog geen echte joblaag
- welke objecten zijn kernentiteiten en welke zijn afgeleide of control-plane artifacts
- hoe tenant-, rol- en databoundaries vandaag echt lopen
- welke contractrichting logisch is voor een eerstvolgende productlijn zoals `Pulse`

Zonder deze stap zouden we te snel kunnen grijpen naar een generieke product-suite-architectuur met nieuwe runs, artifacts, entitlements of async jobs, terwijl de huidige codebase daar nog geen directe productreden voor geeft.

## Decision

### 1. System Layer Map

De huidige Verisight-architectuur wordt voor vervolgwerk opgesplitst in negen lagen.

#### Layer 1 - Public Marketing Layer

Doel:

- routekeuze
- trust en due diligence
- pricing en packaging
- buyer-facing sample proof

Huidige realiteit:

- Next.js marketingpagina's
- productoverzicht, pricing, trusthub en sample previews
- contact capture via publieke formulieren

Beslissing:

- deze laag blijft buyer-facing en commercieel
- deze laag is geen runtime voor campagnes, surveys of managementgebruik

#### Layer 2 - Authenticated Dashboard UI

Doel:

- klanttoegang tot campaign dashboards
- admin setup- en beheerinterfaces
- operator workflows voor delivery en learning

Huidige realiteit:

- Supabase-authenticated Next.js dashboard
- aparte beheerlagen voor Verisight-beheerders
- campaign dashboards, report downloads, contactaanvragen, delivery records en learning dossiers

Beslissing:

- deze laag blijft de primaire application UI
- nieuwe productlijnen mogen hierop landen, niet als aparte app of aparte codebase

#### Layer 3 - Survey Runtime Layer

Doel:

- respondenttoegang via token
- survey rendering
- survey validatie
- submit flow

Huidige realiteit:

- FastAPI-served survey endpoints
- Jinja-templates met shared survey shell en productspecifieke partials
- token-based respondent access zonder dashboardauth

Beslissing:

- survey runtime blijft een aparte execution surface naast dashboard UI
- nieuwe productlijnen mogen dit patroon hergebruiken zolang de surveyvorm vergelijkbaar blijft

#### Layer 4 - Backend Orchestration and API Layer

Doel:

- campaign CRUD
- respondent import en uitnodigingen
- stats en report endpoints
- scoring orchestration

Huidige realiteit:

- FastAPI backend in `backend/main.py`
- productresolutie via backend registry
- interne en externe report endpoints

Beslissing:

- orchestration blijft centraal
- productspecifieke methodiek hoort niet in generieke API-routing terecht te komen

#### Layer 5 - Product Module Layer

Doel:

- surveydefinities
- scoringlogica
- dashboardduiding
- rapportcopy en productspecifieke interpretation logic

Huidige realiteit:

- gescheiden `exit`, `retention` en `shared` modules in backend en frontend
- centrale registry-bestanden voor resolutie op `scan_type`

Beslissing:

- toekomstige productlijnen moeten via dezelfde registry- en modulevorm worden toegevoegd
- compatibiliteitsfacades mogen geen nieuwe methodiek absorberen

#### Layer 6 - Reporting and Aggregate Intelligence Layer

Doel:

- campaign stats
- pattern detection
- dashboard summaries
- PDF generation

Huidige realiteit:

- `campaign_stats` view
- `detect_patterns` voor aggregaties
- report generation on demand via backend
- dashboardpresentatie via campaign page helpers en productspecifieke dashboard adapters

Beslissing:

- rapporten en managementsamenvattingen zijn afgeleide artifacts
- ze zijn geen primaire dataobjecten

#### Layer 7 - Control Plane Layer

Doel:

- lead capture
- operator setup
- delivery governance
- learning capture

Huidige realiteit:

- `ContactRequest`
- `CampaignDeliveryRecord` en `CampaignDeliveryCheckpoint`
- `PilotLearningDossier` en `PilotLearningCheckpoint`
- admin-only beheerlagen in frontend

Beslissing:

- control plane blijft in dezelfde repo en deployment
- control plane is geen apart product of apart SaaS-subplatform

#### Layer 8 - Persistence Layer

Doel:

- tenantdata
- campaigndata
- respondentdata
- response data
- control-plane data

Huidige realiteit:

- SQLAlchemy models
- Supabase / PostgreSQL schema
- afgeleide views zoals `campaign_stats`

Beslissing:

- persistence blijft campaign-centered
- nieuwe productlijnen mogen niet starten met een nieuw generiek datafundament als de bestaande campaign-kern nog voldoet

#### Layer 9 - Jobs and Automation Boundary

Doel:

- e-mail delivery
- beperkte achtergrondtaken
- operationele follow-up waar nodig

Huidige realiteit:

- FastAPI `BackgroundTasks`
- e-mailverzending
- geen duurzaam job-systeem, queue-systeem of workflow-engine als primaire runtime-laag

Beslissing:

- er bestaat nu nog geen volwaardige joblaag
- die mag ook niet "voor later" worden gebouwd zonder directe productreden

### 2. Control Plane vs Runtime vs UI vs Jobs

#### Control Plane

Objecten:

- `ContactRequest`
- `CampaignDeliveryRecord`
- `CampaignDeliveryCheckpoint`
- `PilotLearningDossier`
- `PilotLearningCheckpoint`

Taken:

- lead intake
- setup readiness
- delivery acceptance
- first value tracking
- learning capture

#### Runtime

Objecten:

- `Organization`
- `Campaign`
- `Respondent`
- `SurveyResponse`

Taken:

- tenanting
- campaign execution
- tokenized survey completion
- scoring
- aggregated management output

#### UI

Surfaces:

- public marketing UI
- authenticated dashboard UI
- tokenized survey UI

Taken:

- routekeuze
- operationele setup
- klantlezing van output
- respondentinteractie

#### Jobs

Huidige vorm:

- lichte background tasks
- e-mail delivery
- geen durable orchestrator

Beslissing:

- future architecture mag geen separate jobs-platform introduceren tenzij een concrete slice dat nodig maakt

### 3. Core Domain Boundaries and Ownership

#### Organization

Rol:

- tenant boundary

Ownership:

- platform/shared layer

Beslissing:

- toekomstige productlijnen blijven onder dezelfde organization-tenant hangen
- er komt nu geen aparte billing account, workspace of portfolio account abstraction boven

#### Campaign

Rol:

- operationele fulfillment unit
- huidige runtime-kern per scan

Ownership:

- platform/shared layer

Beslissing:

- `Campaign` blijft de primaire runtime-eenheid voor productuitvoering
- campaigns zijn geen subscriptions, seats, plans of generieke suite-runs
- toekomstige productlijnen moeten eerst proberen binnen deze abstraction te landen

#### Respondent

Rol:

- invite- en tokenhouder binnen een campaign

Ownership:

- platform/shared layer

Beslissing:

- respondent blijft gekoppeld aan precies een campaign
- respondentmetadata blijft minimale segmentatie-input, geen breed people profile system

#### SurveyResponse

Rol:

- primaire payload van ruwe antwoorden plus berekende productuitkomst

Ownership:

- runtime, met productmodule-input en platform-storage

Beslissing:

- `SurveyResponse` blijft de primaire persisted execution-output
- `full_result` blijft toegestaan als product-specifieke uitkomstcontainer
- nieuwe productlijnen mogen hierop voortbouwen zolang de outputvorm survey-centered blijft

#### CampaignStats and Pattern Report

Rol:

- afgeleide aggregate intelligence

Ownership:

- reporting / aggregate layer

Beslissing:

- dit blijven afgeleide read-models
- ze zijn niet de system of record

#### Report PDF

Rol:

- on-demand gegenereerd managementartifact

Ownership:

- reporting layer

Beslissing:

- het PDF-rapport blijft een derived artifact
- er komt nu geen apart persisted artifact-register voor report binaries

#### CampaignDeliveryRecord

Rol:

- control-plane lifecycle-object per campaign

Ownership:

- operations / control plane

Beslissing:

- delivery state blijft naast de campaign bestaan en niet in de campaign zelf
- dit model is geschikt voor toekomstige productlijnen zolang ze assisted delivery volgen

#### PilotLearningDossier

Rol:

- control-plane learning- en evidence-object

Ownership:

- operations / learning plane

Beslissing:

- learning capture blijft los van de campaign runtime
- supporting artifacts mogen worden gerefereerd, maar learning is geen productruntime

#### MarketingProduct Registry

Rol:

- buyer-facing portfolio registry

Ownership:

- marketing layer

Beslissing:

- marketingproductstatus is geen runtime productcontract
- reserved future routes mogen niet automatisch runtime-entiteiten worden

### 4. Multitenancy, Roles, and Data Boundaries

#### Tenant Boundary

Huidige grens:

- `Organization` is de tenant

Beslissing:

- dit blijft de enige primaire tenant boundary
- er komt nu geen extra workspace-, portfolio- of subscription-tenantlaag bovenop

#### Access Roles

Huidige toegangsvormen:

- publieke buyer zonder login
- respondent met token
- authenticated dashboard user
- Verisight-beheerder via `profiles.is_verisight_admin`
- backend admin token voor interne fallback op bepaalde backendroutes

Huidige typed role hints:

- `owner`
- `member`
- `viewer`

Beslissing:

- huidige rolgrenzen zijn voorlopig voldoende
- geen nieuw entitlement- of planmodel voordat een latere fase dat direct nodig maakt

#### Data Boundary Rules

- respondents zien alleen hun eigen tokenized survey
- management ziet groeps- en segmentoutput, geen individuele signalen
- admins beheren setup, delivery en learning
- buyer-facing marketingdata blijft gescheiden van runtime campaigndata
- control-plane objecten blijven gescheiden van survey runtime data

### 5. Artifact Lifecycle Model

Het huidige artifactmodel wordt expliciet vastgezet als een keten van persisted entities en derived artifacts.

#### Stage 1 - Buyer Intent Artifact

- object: `ContactRequest`
- status: persisted
- doel: route-interest, buyer-vraag, timing en leadops

#### Stage 2 - Qualified Runtime Container

- object: `Organization`
- object: `Campaign`
- status: persisted
- doel: tenant en productuitvoering aanmaken

#### Stage 3 - Setup and Delivery Control Artifacts

- object: `CampaignDeliveryRecord`
- object: `CampaignDeliveryCheckpoint`
- status: persisted
- doel: setup, delivery, first value en exception governance

#### Stage 4 - Respondent Intake Artifacts

- object: respondent import preview
- object: `Respondent`
- status: preview deels transient, respondent persisted
- doel: gecontroleerde respondentopbouw en uitnodigingsflow

#### Stage 5 - Survey Access Artifact

- object: respondent token en invite link
- status: persisted token, derived URL
- doel: veilige toegang tot de survey

#### Stage 6 - Execution Output Artifact

- object: `SurveyResponse`
- status: persisted
- doel: ruwe antwoorden, subscores, aggregate-ready output en `full_result`

#### Stage 7 - Aggregate Read Artifacts

- object: `campaign_stats`
- object: pattern report output
- status: derived
- doel: dashboard- en managementsamenvattingen voeden

#### Stage 8 - Management Output Artifacts

- object: dashboard view
- object: PDF report
- status: derived on demand
- doel: managementlezen, handoff en besluitvorming

#### Stage 9 - Learning and Evidence Artifacts

- object: `PilotLearningDossier`
- object: `PilotLearningCheckpoint`
- status: persisted
- doel: leren, bewijs, adoption en vervolgroutecapture

Beslissing:

- Verisight werkt nu met een hybride artifactmodel: kernruntime persistent, managementoutput derived, ops- en learninglaag persistent
- er komt nu geen generiek artifact-register naast deze keten

### 6. First API and Contract Direction

#### Current Rule

Nieuwe productlijnen moeten eerst passen in:

- dezelfde organization boundary
- dezelfde campaign-centered runtime
- dezelfde product registry-resolutie
- dezelfde survey -> scoring -> dashboard/report keten

#### API Direction

- `scan_type`-gedreven resolutie blijft de kern van productrouting
- uitbreiding van `scan_type` gebeurt pas wanneer de eerstvolgende productlijn daadwerkelijk aan build toe is
- API-routing blijft orchestration-only en houdt geen productspecifieke methodiek vast
- derived artifacts blijven opvraagbaar via campaign-context, niet via een generiek artifact API-model

#### Domain Direction for Pulse

Voor `Pulse` geldt voorlopig de default:

- eerst proberen binnen `Campaign`, `Respondent`, `SurveyResponse` en registry-resolution te landen
- pas een nieuw runtime-object toevoegen als frequente monitoring aantoonbaar niet netjes binnen de bestaande campaign-abstraction past

#### Domain Direction for TeamScan

Voor `TeamScan` geldt voorlopig de default:

- eerst teamcontext modelleren als productspecifieke interpretatie of segmentation binnen de bestaande tenant- en campaignvorm
- pas nieuwe objecten toevoegen als lokalisatie echt een apart runtime-contract vereist

### 7. Guardrails for Future Architecture

- Geen generieke `Run`-tabel toevoegen in deze fase.
- Geen generieke `Artifact`-tabel toevoegen in deze fase.
- Geen aparte control-plane service toevoegen in deze fase.
- Geen queue- of workflow-engine toevoegen in deze fase.
- Geen tweede tenantlaag toevoegen in deze fase.
- Geen productlijn als aparte app of aparte deployment modelleren in deze fase.

## Key Changes

- De architectuur is nu expliciet opgesplitst in public UI, dashboard UI, survey runtime, backend orchestration, product modules, reporting, control plane, persistence en jobs boundary.
- `Campaign` is nu hard vastgezet als primaire runtime-container.
- Delivery en learning zijn nu expliciet control-plane objecten en geen runtime- of productlaag.
- Rapporten, stats en pattern output zijn nu expliciet als afgeleide artifacts benoemd.
- Multitenancy en rolgrenzen zijn vastgezet op de huidige eenvoudige realiteit.
- Er is nu een harde architectuurregel tegen premature `run`-, `artifact`- en workflow-abstracties.

## Belangrijke Interfaces/Contracts

### System Layer Contract

- `layer_name`
- `purpose`
- `contains_runtime_state`
- `contains_control_plane_state`
- `product_specific_allowed`
- `shared_only_allowed`

Beslissing:

- elke toekomstige architectuurwijziging moet expliciet aan een laag worden toegewezen

### Core Entity Ownership Contract

- `entity_name`
- `layer_owner`
- `is_runtime_core`
- `is_control_plane`
- `is_derived`
- `product_specific_extension_allowed`

Beslissing:

- geen nieuwe entiteit zonder expliciete ownershipclassificatie

### Runtime Campaign Contract

- `organization_id`
- `scan_type`
- `delivery_mode`
- `enabled_modules`
- `respondent_count`
- `response_state`
- `reportability_state`

Beslissing:

- toekomstige productlijnen moeten aantonen of zij nog binnen deze contractvorm passen

### Derived Artifact Contract

- `artifact_name`
- `source_entity`
- `persisted_or_derived`
- `access_surface`
- `privacy_boundary`

Beslissing:

- dashboardstats, pattern reports en PDF output blijven derived totdat een concrete slice persistent artifact storage echt nodig maakt

### Access Boundary Contract

- `actor_type`
- `auth_mode`
- `tenant_scope`
- `allowed_surfaces`
- `forbidden_surfaces`

Beslissing:

- toekomstige authorization-uitbreiding moet aantonen dat zij niet met de huidige eenvoudige boundary kan volstaan

### Job Boundary Contract

- `task_name`
- `sync_or_background`
- `durable_required`
- `operator_visible`
- `failure_recovery_mode`

Beslissing:

- geen durable job infrastructure zonder concrete taskclass die background tasks niet meer kan dragen

## Testplan

### Architecture Consistency Review

- [x] Gecontroleerd dat de gedefinieerde systeemlagen aansluiten op huidige codepaden in backend, frontend, templates en docs.
- [x] Gecontroleerd dat productmodules al gescheiden zijn en gedeelde infrastructuur centraal blijft.

### Domain Ownership Test

- [x] `Organization`, `Campaign`, `Respondent` en `SurveyResponse` vormen de huidige runtime-kern.
- [x] `CampaignDeliveryRecord` en `PilotLearningDossier` zijn control-plane objecten.
- [x] `campaign_stats`, pattern output en PDF-report zijn afgeleide artifacts.

### Access Boundary Test

- [x] Publieke buyer heeft geen campaign runtime toegang.
- [x] Respondent werkt via token en niet via dashboardauth.
- [x] Verisight-beheer heeft aparte adminrechten.
- [x] Klantdashboard blijft gescheiden van respondentflow.

### Artifact Lifecycle Test

- [x] De keten van lead -> campaign -> respondent -> survey response -> aggregate -> report -> delivery -> learning is volledig traceerbaar in de huidige implementatie.
- [x] Geen extra generiek artifactmodel is nodig om de huidige realiteit te beschrijven.

### Premature Abstraction Test

- [x] Geen directe productreden gevonden om nu al `run`, `artifact`, `workflow` of extra tenantlagen in te voeren.
- [x] Background tasks en huidige campaign-centered runtime zijn nog voldoende als default basis.

### Smoke-validatie

#### Scenario 1

Een nieuwe buyer komt binnen via de website en plant een eerste traject.

- Flow: `ContactRequest` -> `Organization` -> `Campaign`
- Uitkomst: control plane en runtime zijn helder gescheiden

#### Scenario 2

Een respondent ontvangt een invite en vult een survey in.

- Flow: `Respondent` token -> survey runtime -> `SurveyResponse`
- Uitkomst: execution blijft campaign-centered en survey-centered

#### Scenario 3

Een klant opent het dashboard en downloadt het rapport.

- Flow: derived stats + on-demand report binnen campaign context
- Uitkomst: geen apart artifact register nodig

#### Scenario 4

Een admin wil weten of report delivery en first management use al bevestigd zijn.

- Flow: `CampaignDeliveryRecord` en checkpoints
- Uitkomst: dit blijft control plane, niet runtime

#### Scenario 5

Een future `Pulse` slice moet toegevoegd worden.

- Flowregel: eerst proberen via bestaande campaign/productmodule-keten
- Uitkomst: geen premature platformverbreding

## Assumptions/Defaults

- De huidige campaign-centered runtime is voorlopig sterk genoeg als basis voor de eerstvolgende productlijn.
- Delivery en learning blijven assisted control-plane lagen rondom de kernruntime.
- De huidige tenant boundary op `Organization` blijft leidend.
- De huidige access boundary is bewust eenvoudig en hoeft nog niet te evolueren naar plans, seats of enterprise RBAC.
- Derived managementoutput hoeft nog niet persistent als generiek artifact opgeslagen te worden.
- Alleen een concrete volgende build wave mag bewijzen dat een nieuwe runtime-abstraction nodig is.

## Product Acceptance

- [x] De architectuur ondersteunt nog steeds de huidige productrealiteit van `ExitScan` en `RetentieScan`.
- [x] De architectuur laat gecontroleerde uitbreiding naar een eerstvolgende lijn toe zonder brede suite-uitrol.
- [x] Productlijnen blijven managementinstrumenten en geen los platformfeaturecluster.
- [x] De artifactketen sluit aan op echte managementwaarde en deliverygebruik.

## Codebase Acceptance

- [x] Het document sluit aan op de huidige codebase-indeling en kernentiteiten.
- [x] Er is geen nieuwe brede infrastructuur geintroduceerd.
- [x] Het document benoemt concrete toekomstige contracten voor registry-, runtime- en accessbeslissingen.
- [x] Bestaande productmodule-separatie blijft leidend.

## Runtime Acceptance

- [x] Er zijn geen runtimewijzigingen doorgevoerd.
- [x] Huidige survey-, dashboard-, report- en control-plane flows blijven onaangetast.
- [x] Geen nieuwe database-entiteiten, API-routes of jobsystemen zijn toegevoegd.

## QA Acceptance

- [x] System layers zijn onderling onderscheidbaar en niet overlappend gedefinieerd.
- [x] Core entities hebben duidelijke ownership.
- [x] Artifact lifecycle is herleidbaar en niet diffuus.
- [x] Premature abstracties zijn expliciet uitgesloten.

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor de huidige architectuurgrenzen van de suite.
- [x] Het document koppelt product, architectuur en uitvoering aan elkaar.
- [x] Het document eindigt met een heldere volgende stap.

## Not In This Step

- Geen implementatie van `Pulse`, `TeamScan` of `Onboarding 30-60-90`.
- Geen nieuw domeinmodel buiten de huidige kernentiteiten.
- Geen nieuwe APIs of queue-systemen.
- Geen wijziging aan pricing, marketingcopy of productregistratie.
- Geen foundation build.

## Exit Gate

Deze stap is afgerond omdat:

- [x] system layers en verantwoordelijkheden expliciet zijn vastgezet
- [x] control plane, runtime, UI en jobs boundary zijn onderscheiden
- [x] kernentiteiten en ownership zijn vastgelegd
- [x] multitenancy, rollen en databoundaries zijn vastgesteld
- [x] artifact lifecycle is uitgewerkt
- [x] de eerste API- en contractrichting voor vervolgwerk is benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `Phase 3 Step 1 - Plan library, naming conventions, and build-wave governance plan`

Verplichte inputs voor die stap:

- suite north star en expansion order
- ICP- en packaginggrenzen per productline
- system layer map
- core entity ownership
- artifact lifecycle
- guardrail dat slechts een enkele volgende build wave tegelijk geopend mag worden
