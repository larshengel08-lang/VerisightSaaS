# Phase 3 Step 1 - Plan Library, Naming, and Build-Wave Governance

## Title

Lock the plan library structure, naming conventions, source-of-truth rules, and one-wave-at-a-time build governance before any implementation wave starts.

## Korte Summary

Deze stap zet vast hoe Verisight het vervolgwerk bestuurt. Het document definieert waar beslisdocumenten leven, waar uitvoerdocumenten leven, hoe build waves worden benoemd, welke artifacts per stap verplicht zijn, welke acceptancelagen groen moeten zijn voordat een volgende wave opent, en hoe we voorkomen dat meerdere productlijnen of meerdere half-afgemaakte slices tegelijk worden geopend.

De belangrijkste uitkomst is een harde governance-regel: er mag steeds maar een enkele actieve build wave tegelijk openstaan, en die wave is pas klaar wanneer productuitkomst, code, docs, tests en smoke-validatie synchroon groen zijn. De planbibliotheek wordt daarbij expliciet gesplitst in strategische beslislaag, build-governance-laag en uitvoerlaag.

Status van deze stap:

- Decision status: complete
- Runtime status: geen live productwijzigingen
- Build status: nog geen implementatiewave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na Phase 1 en Phase 2 is duidelijk:

- wat de suite is
- welke productlijnen en volgorde binnen scope liggen
- hoe de huidige architectuur is begrensd

Wat nog ontbreekt, is de uitvoeringsgovernance:

- hoe nieuwe step-documenten, wave-plannen en acceptance checks worden georganiseerd
- hoe naming consistent blijft tussen strategie, build waves en uitvoer
- hoe we exact voorkomen dat `Pulse`, `TeamScan` en andere latere lijnen tegelijk openbreken
- hoe buildwerk altijd gekoppeld blijft aan docs, tests en acceptance

De repo heeft al nuttige bouwstenen:

- `docs/strategy` als beslislaag
- `docs/prompts` als bestaande plan- en promptbibliotheek
- `PROMPT_INDEX.md` als conflictpreventie- en source-of-truth-aanwijzing
- `ROADMAP.md` en `ROADMAP_DATA.yaml` als fase- en exit-gate geheugen

Maar deze structuren zijn nog historisch opgebouwd rond eerdere programma's en niet strak genoeg vastgezet voor een nieuwe multi-product, wave-driven suite-opbouw.

## Decision

### 1. Plan Library Architecture

De documentbibliotheek voor vervolgwerk krijgt drie expliciete niveaus.

#### Level A - Strategic Decision Layer

Locatie:

- `docs/strategy`

Doel:

- vastleggen van suitebeslissingen
- architectuurgrenzen
- markt- en packaginggrenzen
- build-governance en sequencing

Documenttypes:

- `PHASE_X_STEP_Y_*.md`
- `STRATEGY.md`
- `ROADMAP.md`

Beslissing:

- alle phase- en stepdocumenten voor suite-opbouw leven in `docs/strategy`
- deze documenten zijn beslisbasis en geen losse todo-lijsten

#### Level B - Build Governance Layer

Locatie:

- `docs/strategy`

Doel:

- master index
- active wave registry
- gatingregels
- naming conventions
- acceptance checklists

Documenttypes:

- phase/step governance docs
- een later master index document
- een later active wave register document

Beslissing:

- build governance hoort niet in `docs/prompts`
- build governance blijft naast de strategiedocumenten omdat het beslissend en niet prompt-specifiek is

#### Level C - Execution Layer

Locatie:

- `docs/prompts`
- eventuele toekomstige wave-specifieke uitvoerdocumenten in een nog te openen buildmap, maar pas als governance die stap expliciet opent

Doel:

- prompt templates
- uitvoerprompts
- checklistspoor
- eventueel wave-specifieke werkplannen

Beslissing:

- `docs/prompts` blijft de uitvoer- en historielaag voor promptgedreven trajecten
- nieuwe suite-build waves worden niet automatisch als promptdocumenten opgezet; eerst governance, dan pas een concrete wavevorm

### 2. Source-of-Truth Hierarchy

Voor het nieuwe suitewerk geldt voortaan deze vaste volgorde:

1. huidig `PHASE_X_STEP_Y` document voor de actieve stap
2. eerdere fase- en stepdocumenten in `docs/strategy` waarop de stap expliciet voortbouwt
3. `STRATEGY.md`
4. `ROADMAP.md`
5. `docs/prompts/PROMPT_INDEX.md` en bestaande promptartefacten als historisch en uitvoerend contextmateriaal
6. codebase en tests als implementatiebewijs zodra een build wave actief is

Beslissing:

- voor elk traject is precies een actieve step of wave de source of truth
- meerdere concurrerende planbestanden voor hetzelfde werk zijn niet toegestaan

### 3. One-Wave-At-A-Time Rule

Verisight werkt vanaf nu met een harde uitvoeringsregel:

- exact een actieve build wave tegelijk
- geen parallelle productbouw aan meerdere nieuwe lijnen
- geen volgende wave voordat de huidige wave volledig groen is

Definitie van "actieve wave":

- er is een expliciet wave-document
- de wave heeft scope, acceptance, tests en smokeplan
- de wave heeft write-permission op code, docs en tests

Definitie van "groen":

- product acceptance groen
- codebase acceptance groen
- runtime acceptance groen
- QA acceptance groen
- documentation acceptance groen

Beslissing:

- `Pulse` wordt straks de eerstvolgende en enige actieve productbuild wave
- `TeamScan` en `Onboarding 30-60-90` blijven gesloten totdat Pulse echt groen en afgesloten is

### 4. Build-Wave Object Model

Elke build wave wordt behandeld als een bestuurbaar object met vaste velden.

Verplicht wave contract:

- `wave_id`
- `phase`
- `productline`
- `wave_title`
- `objective`
- `scope_in`
- `scope_out`
- `dependencies`
- `planned_user_outcome`
- `code_surfaces`
- `docs_surfaces`
- `test_surfaces`
- `smoke_path`
- `acceptance_layers`
- `exit_gate`
- `next_allowed_wave`

Beslissing:

- er komt geen "begin maar gewoon" implementatie meer zonder volledig wave contract

### 5. Naming Conventions

#### Strategy Step Documents

Format:

- `PHASE_<N>_STEP_<N>_<SHORT_NAME>.md`

Voorbeeld:

- `PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md`

Regels:

- hoofdletters
- underscores
- fase en stap altijd expliciet
- naam beschrijft de besliskern, niet alleen een themawoord

#### Build-Wave Documents

Format:

- `WAVE_<NN>_<PRODUCTLINE>_<SHORT_NAME>.md`

Voorbeelden:

- `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md`
- `WAVE_02_PULSE_RESULTS_AND_REVIEW_WORKFLOW.md`

Regels:

- twee-cijferige waveindex
- precies een productline in de naam
- geen meerdere productlines in een wavebestandsnaam

#### Supporting Checklists

Format:

- `CHECKLIST_<PRODUCTLINE>_<PURPOSE>.md`

Voorbeelden:

- `CHECKLIST_PULSE_ACCEPTANCE.md`
- `CHECKLIST_PULSE_SMOKE.md`

#### Decision Logs

Format:

- `DECISION_<YYYYMMDD>_<SHORT_NAME>.md`

Beslissing:

- deze logvorm blijft beschikbaar voor kleine besluiten, maar vervangt geen phase-step-document

### 6. Required Deliverables Per Step and Per Wave

#### Voor een strategy step

Verplicht:

- decision-complete document
- expliciete assumptions/defaults
- test- of reviewlogica
- acceptance-lagen
- next step

#### Voor een build wave

Verplicht:

- wave-document
- codewijziging
- docs-update
- tests
- smoke-validatie
- acceptance-resultaat

Beslissing:

- geen wave zonder code
- geen code zonder docs
- geen docs zonder test en smokeplan

### 7. Acceptance Layer Contract

Elke toekomstige build wave moet dezelfde vijf acceptancelagen hebben.

#### Product Acceptance

Vraagt:

- lost deze wave een concrete gebruikers- of managementuitkomst op
- sluit de output aan op de productbelofte

#### Codebase Acceptance

Vraagt:

- zijn implementatie, interfaces en registries coherent
- is de wijziging begrensd tot de bedoelde surfaces

#### Runtime Acceptance

Vraagt:

- werkt de flow technisch end-to-end
- is bestaand gedrag niet stuk

#### QA Acceptance

Vraagt:

- zijn tests, regressiechecks en smokechecks groen
- is de wave veilig genoeg om als basis voor de volgende te dienen

#### Documentation Acceptance

Vraagt:

- zijn plan, docs, naming en uitleg synchroon met de code
- is duidelijk wat nu de source of truth is

Beslissing:

- een wave is pas afgesloten als alle vijf de lagen expliciet groen zijn afgetekend

### 8. Gating Rules

#### Gate A - Geen brede architectuur voor later

- nieuwe abstracties alleen als de actieve wave ze direct nodig heeft

#### Gate B - Geen parallelle productlijnen

- geen actieve bouw aan `TeamScan` of `Onboarding 30-60-90` zolang `Pulse` open is

#### Gate C - Geen volgende wave bij gele docs of tests

- incomplete docs of ontbrekende tests blokkeren voortgang

#### Gate D - Geen "partial done"

- een wave telt niet als klaar op basis van alleen code, alleen UI of alleen architectuur

#### Gate E - Geen impliciete expansion

- een wave mag geen verborgen scope openen voor entitlement, billing, connectors of jobs tenzij de step dat expliciet heeft toegestaan

### 9. Master Index Decision

Er komt later een centrale master index voor de nieuwe suite-opbouw.

Verplichte inhoud van die index:

- alle phase- en stepdocumenten
- actieve en afgesloten waves
- huidige source-of-truth pointer
- laatst goedgekeurde wave
- eerstvolgende toegestane wave

Beslissing:

- deze index wordt in de volgende stap aangemaakt, niet in deze

### 10. Build Wave Sequence Default

De default volgorde voor de eerstvolgende buildperiode wordt nu begrensd op:

- eerst: governance en planning compleet
- daarna: `Pulse` wave stack
- daarna pas: `TeamScan`
- daarna pas: latere lifecycle-lijn

Beslissing:

- de eerstvolgende concrete bouwstap is een `Pulse`-gerichte wavebibliotheek
- niet meteen een foundation build voor de hele suite

## Key Changes

- De repo krijgt nu een expliciete scheiding tussen beslislaag, governance-laag en uitvoerlaag.
- Source-of-truth-regels zijn vastgezet op precies een actieve stap of wave tegelijk.
- Naming conventions voor phase-steps, build waves, checklists en decision logs zijn vastgezet.
- Acceptance is nu formeel gekoppeld aan product, code, runtime, QA en docs.
- Er is nu een harde one-wave-at-a-time governance-regel.
- De volgende implementatie mag alleen via een expliciete `Pulse` wave stack openen.

## Belangrijke Interfaces/Contracts

### Step Document Contract

- `step_id`
- `phase`
- `title`
- `objective`
- `decision_scope`
- `key_changes`
- `interfaces_contracts`
- `testplan`
- `acceptance_layers`
- `next_step`

Beslissing:

- elk nieuw phase-step document moet minimaal dit contract volgen

### Build Wave Contract

- `wave_id`
- `phase`
- `productline`
- `title`
- `summary`
- `key_changes`
- `interfaces_contracts`
- `testplan`
- `assumptions_defaults`
- `product_acceptance`
- `codebase_acceptance`
- `runtime_acceptance`
- `qa_acceptance`
- `documentation_acceptance`

Beslissing:

- dit contract wordt verplicht voor alle uitvoerende waves

### Source-of-Truth Contract

- `current_active_artifact`
- `artifact_type`
- `scope`
- `supersedes`
- `next_allowed_artifact`

Beslissing:

- elk actief traject moet expliciet kunnen aanwijzen wat nu leidend is

### Naming Contract

- `artifact_type`
- `filename_pattern`
- `productline_required`
- `phase_required`
- `sequence_required`

Beslissing:

- geen nieuwe documenten buiten dit namingcontract zonder expliciete uitzondering

### Acceptance Contract

- `product`
- `codebase`
- `runtime`
- `qa`
- `documentation`

Beslissing:

- deze vijf lagen zijn niet optioneel in buildwerk

## Testplan

### Governance Consistency Review

- [x] Gecontroleerd dat de voorgestelde documentlagen aansluiten op de bestaande `docs/strategy` en `docs/prompts` structuur.
- [x] Gecontroleerd dat `PROMPT_INDEX.md` al een source-of-truth en conflictpreventiepatroon bevat waarop deze governance logisch voortbouwt.

### Naming Convention Test

- [x] Phase-step naming volgt bestaande suite-documenten in `docs/strategy`.
- [x] Nieuwe wave naming is onderscheidbaar van bestaande prompt- en programmadocumenten.
- [x] Productline blijft altijd expliciet zichtbaar in uitvoerende wavebestanden.

### One-Wave Rule Test

- [x] Governance sluit parallelle bouw aan `Pulse`, `TeamScan` en `Onboarding 30-60-90` uit.
- [x] Governance blokkeert vervolgwerk wanneer acceptance niet volledig groen is.

### Deliverable Completeness Test

- [x] Elke toekomstige build wave moet code, docs, tests en smoke-validatie omvatten.
- [x] "Alleen architectuur", "alleen UI" of "alleen copy" telt niet als afsluitende wave.

### Smoke-validatie

#### Scenario 1

Een nieuwe `Pulse` wave wordt gestart zonder testplan.

- Resultaat: geblokkeerd
- Waarom: build wave contract is onvolledig

#### Scenario 2

Een `Pulse` wave heeft code en docs, maar smoke-validatie is nog niet gedaan.

- Resultaat: niet groen
- Waarom: runtime en QA acceptance zijn niet afgerond

#### Scenario 3

Iemand wil tijdens een open `Pulse` wave alvast `TeamScan` navigatie aanmaken.

- Resultaat: geblokkeerd
- Waarom: one-wave-at-a-time rule en scope guardrail

#### Scenario 4

Een toekomstige wave wil een generiek artifactmodel toevoegen zonder directe productreden.

- Resultaat: geblokkeerd
- Waarom: architectuuruitbreiding voor later is niet toegestaan

#### Scenario 5

Een afgesloten wave heeft groen op alle acceptance-lagen en een expliciete next allowed wave.

- Resultaat: volgende wave mag openen
- Waarom: governance en gating zijn gehaald

## Assumptions/Defaults

- `docs/strategy` blijft de leidende beslis- en governance-map.
- `docs/prompts` blijft de uitvoer- en historische promptlaag.
- De eerstvolgende actieve build wave wordt `Pulse`.
- `Pulse` opent eerst als smalle vertical-slice stack, niet als volledige productlijn in een keer.
- Bestaande promptartefacten blijven waardevolle context, maar sturen de nieuwe suite-wavevolgorde niet zelfstandig aan.
- `PROMPT_CHECKLIST.xlsx` blijft historisch en auditmatig nuttig, maar wordt niet de primaire wave-governancebron.

## Product Acceptance

- [x] De governance ondersteunt de gewenste decision-driven manier van werken.
- [x] De governance voorkomt dat productbouw te vroeg breed wordt.
- [x] Product, architectuur en uitvoering blijven aan elkaar gekoppeld.
- [x] De volgende concrete buildstap blijft begrensd tot een enkele productlijn.

## Codebase Acceptance

- [x] De governance sluit aan op de huidige repo- en docsstructuur.
- [x] Nieuwe naming is consistent met bestaande phase-step documenten.
- [x] Er is geen nieuwe technische infrastructuur nodig om deze governance te gebruiken.
- [x] De governance geeft duidelijke write-boundaries voor toekomstige waves.

## Runtime Acceptance

- [x] Er zijn geen runtimewijzigingen doorgevoerd.
- [x] Huidige app, survey en dashboardflows blijven onaangetast.
- [x] Governance introduceert geen nieuwe runtime-objecten of live routes.

## QA Acceptance

- [x] De gatingregels zijn expliciet, testbaar en niet dubbelzinnig.
- [x] One-wave governance is helder genoeg om scope creep te blokkeren.
- [x] Acceptance-lagen zijn volledig en herhaalbaar.

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor build governance.
- [x] De documentbibliotheek en namingregels zijn expliciet vastgezet.
- [x] Het document benoemt de volgende stap helder en beperkt.

## Not In This Step

- Geen implementatie van een build wave.
- Geen master index bestand aanmaken.
- Geen wave register aanmaken.
- Geen productcode wijzigen.
- Geen update aan `PROMPT_CHECKLIST.xlsx`.

## Exit Gate

Deze stap is afgerond omdat:

- [x] planbibliotheeklagen expliciet zijn vastgezet
- [x] naming conventions zijn vastgezet
- [x] source-of-truth-regels zijn vastgezet
- [x] one-wave-at-a-time governance is vastgezet
- [x] acceptance- en gatingregels zijn vastgezet
- [x] de eerstvolgende toegestane buildvoorbereidingsstap expliciet is benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `Phase 3 Step 2 - Pulse master index and first build-wave stack plan`

Verplichte inputs voor die stap:

- suite north star en expansion order
- ICP- en packaginggrenzen
- system layers en domain boundaries
- artifact lifecycle
- build-wave governance en naming conventions
- harde regel dat slechts een enkele Pulse-wave tegelijk actief mag zijn
