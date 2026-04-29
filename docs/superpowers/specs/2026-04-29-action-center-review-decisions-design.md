# Action Center Review Decisions Design

Date: 2026-04-29  
Scope: Eerstvolgende schone Action Center-fase na de gemergede decision-history port op `main`  
Status: Draft spec

## 1. Doel

Deze fase maakt de decision-history laag echt authored en bruikbaar over tijd.

De vorige fase heeft Action Center semantisch rijker gemaakt in presentatie:
- `latestDecision`
- `actionProgress`
- `decisionHistory`

Maar die laag leunt nog grotendeels op legacy dossier- en checkpointtruth. Daardoor is de UI sterker geworden dan de onderliggende bestuurlijke write-path.

Het doel van deze fase is daarom:
- reviewbeslissingen canoniek vastleggen
- actiekwaliteit explicieter vastleggen
- resultaatlus over meerdere beslismomenten laten leven
- zonder managers extra invoerlast te geven

Na deze fase moet een route niet alleen beter tonen wat er besloten lijkt te zijn, maar ook echt gedragen worden door een kleine interne truth-laag die meerdere reviewmomenten kan opslaan.

## 2. Productgrens

Wel in scope:
- een kleine authored review-decision truth
- authored `currentStep`, `nextStep`, `expectedEffect`
- authored `decisionReason` en `nextCheck`
- een compacte decision history over meerdere momenten
- een interne Verisight/HR write-path
- Action Center landing/detail die primair uit die waarheid projecteren

Niet in scope:
- managerinput in Action Center
- nieuwe managerformulieren
- brede workflow of task-management
- uitgebreide timeline van alle events
- nieuwe HR-suite work buiten Action Center en de interne beheerlaag
- escalatie- of governancevarianten zoals `opschalen`, `borgen`, `archiveren`

De kernregel blijft:
- rijkere bestuurlijke waarheid
- niet meer eindgebruikersbediening

## 3. Gekozen aanpak

De juiste aanpak voor deze fase is `authored-decision-first`.

Niet:
- nog meer legacy projectie maken uit dossiers/checkpoints
- of meteen managerinteractie toevoegen

Wel:
1. één kleine canonieke `review decision` recordlaag toevoegen
2. die recordlaag koppelen aan een route en een reviewmoment
3. authored actieprogressie aan dezelfde recordlaag hangen
4. Action Center laten lezen uit die recordlaag, met legacy fallback alleen voor oudere routes
5. de interne write-path onderbrengen in bestaande Verisight-beheerflows, niet in manager-UI

Dat maakt de volgende stap inhoudelijk sterk, maar houdt de UX nog steeds rustig.

## 4. Canonieke truth-laag

### 4.1 Nieuw record

Deze fase introduceert één nieuwe canonieke entiteit:
- `ActionCenterReviewDecision`

Per record leggen we vast:
- `id`
- `routeSourceType`
- `routeSourceId`
- `checkpointId`
- `decision`
- `decisionReason`
- `nextCheck`
- `currentStep`
- `nextStep`
- `expectedEffect`
- `observationSnapshot`
- `decisionRecordedAt`
- `reviewCompletedAt`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

### 4.2 Canonieke betekenis

`decision`
- bestuurlijk besluit van dit reviewmoment
- waarden in deze fase:
  - `doorgaan`
  - `bijstellen`
  - `afronden`
  - `stoppen`

`decisionReason`
- de compacte reden waarom juist dit besluit nu logisch is

`nextCheck`
- wat bij de volgende toets zichtbaar of duidelijker moet zijn

`currentStep`
- welke stap nu de actieve route-interventie is

`nextStep`
- welke volgende kleine stap daarna logisch volgt

`expectedEffect`
- welk effect of welke verduidelijking deze stap moet opleveren

`observationSnapshot`
- de relevante observatie op dit beslismoment
- compact en routegericht, niet een volledige notulenlaag

### 4.3 Identity en ordering

Deze laag moet stabiel identificeerbaar en sorteerbaar zijn.

Canonieke identity:
- `id` is de enige primaire identity

Canonieke ordering:
1. `decisionRecordedAt` descending
2. `reviewCompletedAt` descending
3. `createdAt` descending
4. `id` ascending als laatste tie-breaker

Dus:
- decision history wordt nooit meer gebouwd op impliciete updatevolgorde
- en ook niet op dossiertekst alleen

## 5. Canonieke source- en write-regel

### 5.1 Enige write-path

Voor nieuwe reviewbeslissingen geldt één harde regel:
- nieuwe decision/history truth wordt uitsluitend geschreven via `ActionCenterReviewDecision`

Dus niet:
- soms via dossiervelden
- soms via checkpointvelden
- soms via componentlocal state

Bestaande dossiervelden zoals:
- `first_action_taken`
- `first_management_value`
- `management_action_outcome`
- `expected_first_value`

blijven bestaan als legacy/seedinput, maar zijn niet langer de canonieke write-path voor nieuwe reviewbesluiten.

### 5.2 Interne owner

Deze write-path is in deze fase alleen beschikbaar voor:
- Verisight admin / interne HR-operatie

Managers:
- blijven read-only
- zien de rijkere waarheid wel
- schrijven er nog niet naar

### 5.3 Write-surface

De authored decision-truth wordt in deze fase niet direct in Action Center geschreven.

De write-surface komt in de bestaande interne beheerlaag rond learning dossiers/checkpoints, specifiek:
- gekoppeld aan `follow_up_review`
- en waar nodig aan `first_management_use` voor de eerste authored stapkwaliteit

Dat houdt Action Center zelf schoon als consumptielaag.

## 6. Relatie met bestaande learning truth

De nieuwe truth-laag vervangt de learning dossiers/checkpoints niet.

De rolverdeling wordt:

`PilotLearningDossier`
- blijft de bredere context, oorsprong en legacy carrier

`PilotLearningCheckpoint`
- blijft het reviewanker en operationele checkpoint

`ActionCenterReviewDecision`
- wordt de canonieke bestuurlijke besluit- en voortgangslaag voor Action Center

Dus:
- dossiers en checkpoints beschrijven de context
- review decisions beschrijven wat bestuurlijk is besloten en hoe de route vooruitgaat

## 7. Projectieregels

### 7.1 Primair

Action Center projecteert vanaf nu primair uit authored decisions.

Per route:
- `latestDecision` = meest recente authored decision
- `decisionHistory` = alle authored decisions volgens de vaste ordering
- `actionProgress.currentStep` = `currentStep` van de laatste authored decision
- `actionProgress.nextStep` = `nextStep` van de laatste authored decision
- `actionProgress.expectedEffect` = `expectedEffect` van de laatste authored decision
- `resultLoop.whatWeObserved` = `observationSnapshot` van de laatste authored decision
- `resultLoop.whatWasDecided` = zichtbare label van `decision`

### 7.2 Legacy fallback

Voor routes zonder authored decisions blijft één tijdelijke fallback bestaan:
- projecteer uit de bestaande decision-history helpers en dossier/checkpointtruth

Regel:
- zodra een route minstens één authored decision heeft, wint authored truth volledig
- we mengen authored en legacy entries niet door elkaar binnen dezelfde history

Dus:
- zero authored decisions = legacy fallback toegestaan
- one or more authored decisions = alleen authored history zichtbaar

Dat voorkomt half gemengde routeverhalen.

## 8. UI-gedrag

### 8.1 Action Center landing

Landing blijft compact.

Laat alleen zien:
- laatste beslissing
- huidige stap
- eventueel een compacte volgende toets als dat helpt

Geen uitgebreide history op landing.

### 8.2 Action Center detail

Detail wordt de plek waar de authored truth volledig zichtbaar wordt:
- laatste beslissing
- reden van het besluit
- volgende toets
- huidige stap
- hierna
- verwacht effect
- kernobservatie
- compacte beslisgeschiedenis

### 8.3 Managers

Managers blijven read-only.

Zij zien:
- duidelijker waarom iets doorloopt, bijgesteld wordt, afgerond of gestopt is
- beter welke stap nu geldt
- beter hoe de route zich ontwikkelt

Maar zij voeren in deze fase niets in.

### 8.4 Verisight / interne HR

De interne beheerlaag krijgt een beperkte authored write-capability:
- nieuwe review decision toevoegen
- bestaande review decision bijwerken

Niet:
- uitgebreide bulkbewerkingen
- matrixschermen
- multi-actor review approvals

## 9. Resultaatlus over tijd

De kernwinst van deze fase is dat resultaat niet meer alleen de laatste projectie is, maar authored over meerdere momenten.

Een goede decision history laat dan compact zien:
- welke stap toen liep
- wat toen zichtbaar werd
- wat toen besloten werd
- wat daarna de volgende toets werd

Dat maakt de route:
- minder impressionistisch
- minder afhankelijk van losse updatecopy
- en veel sterker als intern managementdossier

## 10. Telemetry en bewijs

Omdat review decisions nu authored worden, kunnen telemetry-events ook scherper worden.

Minimaal willen we kunnen onderscheiden:
- authored review decision created
- authored review decision updated
- route consumed with authored decision history present

Deze fase hoeft nog geen groot analyticsdashboard te bouwen.

Maar we willen wel dat de nieuwe waarheid bewijsbaar gebruikt en onderscheiden kan worden.

## 11. Guardrails

Niet doen in deze fase:
- authored decisions in manager-UI stoppen
- meerdere open current steps tegelijk ondersteunen
- decision history combineren met alle update-events
- authored truth in verschillende tabellen dupliceren
- Action Center ombouwen tot taskboard

De juiste zwaarte is:
- één kleine decision-table
- één kleine interne write-surface
- één veel sterkere read-model in Action Center

## 12. Succescriteria

Deze fase is geslaagd als:

### Truth
- nieuwe reviewbesluiten hebben één duidelijke canonieke write-path
- action progression is authored en niet meer half projectie / half legacy

### UI
- Action Center detail laat duidelijk authored bestuurlijke voortgang zien
- managers begrijpen de route beter zonder extra handelingen

### History
- routes met meerdere reviewmomenten tonen een compacte, stabiele authored history
- ordering en identity zijn consistent over surfaces en tests

### Scope-discipline
- managerinteractie is nog steeds afwezig
- de module blijft rustig
- de write-path blijft intern en beperkt

## 13. Volgende logische stap hierna

Pas na deze fase wordt het gezond om te beoordelen:
- welke beperkte managerinteractie echt nuttig is
- of managers één stap, reviewuitkomst of update zelf moeten kunnen bevestigen

Dus eerst:
- authored review decisions
- authored actieprogressie
- authored resultaatlus

Daarna pas:
- minimale manager write-interactie
