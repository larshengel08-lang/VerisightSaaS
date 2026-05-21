# HR Routebeheer Structure Design

## Scope

Deze spec beschrijft de herstructurering van de HR-zichtbare pagina **`/campaigns/[id]/beheer`** in Verisight.

Doel:

- de pagina compacter en operationeler maken
- duidelijk maken wat HR nu moet doen en wat nog openstaat
- werken vanuit een vaste fase-structuur in plaats van losse statuslagen
- bestaande functionaliteit behouden, maar anders ordenen

Deze spec verandert **niet**:

- productlogica
- permissies
- routehierarchie
- inhoudelijke capabilities
- data- of backendgedrag

Deze spec verandert **wel**:

- informatiehierarchie
- paginaritme
- prioriteit van blokken
- mate van uitleg/interpretatie
- manier waarop HR van overzicht naar actie navigeert

## Context

De huidige HR-ervaring op `Routebeheer` bevat te veel:

- interpretaties
- verklarende tekst
- losse statuskaarten met gelijke visuele prioriteit
- beheeronderdelen die tegelijk zichtbaar zijn

Daardoor voelt de pagina minder als een werkbare campagne-afrondtafel en meer als een mix van:

- statusuitleg
- operationssamenvatting
- losse tools

Voor HR moet deze pagina vooral dienen om een campagne **van start tot eind via een overzichtelijke checklist af te ronden**.

## Product Intent

`Routebeheer` wordt voor HR een **compacte regiepagina**.

De pagina moet niet primair uitleggen wat de route betekent.
De pagina moet primair laten zien:

- wat klaar is
- wat openstaat
- wat nu moet gebeuren
- waar HR moet klikken om dat uit te voeren

De pagina is dus een:

- checklist-werktafel
- voortgangspagina
- navigatiepunt naar de juiste uitvoeractie

en nadrukkelijk **geen interpretatiedashboard**.

## Primary User

Primaire gebruiker in deze spec:

- **HR / klant**

Deze gebruiker moet in `Routebeheer` een campagne operationeel kunnen afronden zonder te hoeven zoeken tussen:

- setup
- uitnodigingen
- reminders
- responsstatus
- output-readiness
- afronding

## Non-Goals

Deze spec doet bewust niet het volgende:

- geen inhoudelijke revamp van de campagneflow
- geen nieuwe functionaliteit ontwerpen
- geen nieuwe backendflows toevoegen
- geen inline bewerking van alles op deze pagina plaatsen
- geen AI-duiding of managementuitleg terugbrengen
- geen admin- of managerherstructurering meenemen in deze eerste slice

## Core Design Rule

Voor `Routebeheer` geldt voortaan:

- **weinig interpretatie**
- **weinig uitleg**
- **veel feitelijkheid**
- **directe navigatie naar actie**

Toegestane inhoud:

- status
- tellingen
- ontbrekende onderdelen
- korte feitregels
- actieknoppen
- links naar de juiste uitvoerplek

Niet-toegestane inhoud als dominante UI-laag:

- verklarende alineas
- managementduiding
- route-interpretatie
- "waarom dit belangrijk is"-copy
- AI-achtige samenvattingen

## Primary Job To Be Done

De primaire taak van HR op deze pagina is:

> Een campagne van start tot eind via een werkbare, overzichtelijke checklist afronden.

Dat betekent concreet dat HR deze soorten acties moet kunnen afronden of aansturen:

- deelnemers uploaden / controleren
- uitnodiging instellen
- reminder instellen
- deelnemers uitnodigen
- respons en voortgang volgen
- output openen zodra deze bruikbaar is
- afronding en controle uitvoeren

## Information Architecture

De pagina wordt in deze volgorde opgebouwd:

1. **Routekop**
2. **Subtiele klikbare `Nu doen`-regel**
3. **Compact klikbaar fase-overzicht**
4. **Opengeklapte fase-detaillaag na klik**
5. **Output & afronding**
6. **Logboek / controle**

Deze hierarchie vervangt de huidige zwaardere opbouw met meerdere losse status- en uitlegblokken bovenaan.

## Deterministic Mapping From Current Lifecycle To 5 Phases

De nieuwe 5-fasenstructuur is een **presentatielaag**, geen nieuwe operationele lifecycle.

De huidige guided-self-serve state blijft canoniek voor:

- `phase`
- `nextAction`
- blockers
- statusvolgorde

De HR-pagina groepeert die bestaande state alleen opnieuw in vijf zichtbare fasen.

### Canonical mapping table

| Existing guided-self-serve phase | HR Routebeheer phase |
| --- | --- |
| `participant_data_required` | `Doelgroep klaarzetten` |
| `import_validation_required` | `Doelgroep klaarzetten` |
| `launch_date_required` | `Communicatie instellen` |
| `communication_ready` | `Communicatie instellen` |
| `ready_to_invite` | `Live zetten & volgen` |
| `survey_running` | `Live zetten & volgen` |
| `dashboard_active` | `Output beoordelen` |
| `first_next_step_available` | `Output beoordelen` |
| `closed` | `Afronden & controleren` |

### Mapping rule

- De implementatie mag geen nieuwe fase-interpretatie uit vrije tekst afleiden.
- De zichtbare HR-fase wordt uitsluitend bepaald via bovenstaande mapping.
- `Nu doen` gebruikt de bestaande guided-self-serve `nextAction` als primaire waarheid.
- Blockers blijven uit de bestaande state komen en worden alleen gegroepeerd onder de bijbehorende HR-fase.

Dit voorkomt dat de nieuwe UI ongemerkt nieuwe productlogica introduceert.

## Section Design

### 1. Routekop

Doel:

- basiscontext tonen
- de pagina verankeren
- geen verklarende laag toevoegen

Toon alleen:

- campagnenaam
- organisatie
- product / scantype
- globale status
- laatste activiteit

Niet tonen:

- uitgebreide beschrijving van de route
- why-copy
- voortgangsduiding in proza

Route-instellingen worden **niet** als los groot blok bovenaan teruggebracht.
De routekop toont alleen feitelijke metadata.

### 2. Nu doen

Doel:

- HR direct naar de eerstvolgende relevante uitvoeractie sturen

Eigenschappen:

- compact
- subtiel
- klikbaar
- altijd gekoppeld aan een echte actieplek

Structuur:

- taaklabel
- korte feitregel
- primaire actie

Voorbeeldvorm:

- `Nu doen: deelnemers uitnodigen`
- `Uitnodiging staat klaar, nog niet verstuurd`
- `Verstuur uitnodigingen`

Niet doen:

- grote waarschuwingbanner
- alarmerende hero
- veel toelichting

Alleen bij een echte blocker mag deze regel zwaarder aanvoelen, maar nog steeds binnen dezelfde compacte componentvorm.

### Nu doen priority rule

`Nu doen` krijgt altijd exact een primaire actie.

De prioriteit is deterministisch:

1. gebruik de bestaande guided-self-serve `nextAction`
2. koppel die `nextAction` aan de HR-fase via de canonical mapping table
3. toon overige blockers of parallelle open punten alleen in fase-status of fase-detail

Er wordt dus **geen tweede eigen prioriteringslaag** voor `Nu doen` ontworpen.

Als meerdere blockers tegelijk bestaan:

- `Nu doen` blijft het ene bestaande primaire `nextAction`
- overige open punten blijven zichtbaar in het fase-overzicht of in het fase-detail
- blockers overschrijven `Nu doen` niet op basis van nieuwe UI-logica

### 3. Compact fase-overzicht

Doel:

- in een scan laten zien waar de route staat
- HR laten kiezen welke fase aandacht nodig heeft

Eigenschappen:

- alle fasen standaard dichtgeklapt
- elke fase klikbaar
- geen open detail by default

Per fase toont dit overzicht alleen:

- fasenaam
- status
- een korte feitregel

Voorbeeld:

- `Communicatie instellen`
- `Open`
- `Uitnodiging ontbreekt, reminder niet ingesteld`

### 4. Fase-detail

Doel:

- alleen na expliciete klik context en acties tonen voor een fase

Gedrag:

- standaard niet zichtbaar
- opent alleen na klik op een fase
- toont alleen de aangeklikte fase
- geen meerdere open fasen tegelijk vereist in dit ontwerp

Inhoud per fase-detail:

- fase-status
- feitregel(s)
- primaire actie
- optionele secundaire actie

Geen:

- lange toelichting
- interpretatieve statuscopy

De fase-detaillaag is de enige plek waar fase-specifieke acties en statuscontext verder uitwerken.
De overzichtslagen blijven compact.

### 5. Output & afronding

Doel:

- zichtbaar houden waar de route uiteindelijk naartoe werkt

Eigenschappen:

- altijd zichtbaar
- compact
- niet dominant

Toon alleen:

- dashboard beschikbaar of niet
- rapport beschikbaar of niet
- afrondingsstatus op hoofdlijn
- acties zoals `Open dashboard` of `Open rapport`

### Ownership boundary with Phase 4

Om dubbele UI-truth te voorkomen, geldt:

- **Output & afronding** is een altijd zichtbare samenvattingslaag
- **Fase 4 - Output beoordelen** is de enige fase waarin output-readiness inhoudelijk wordt uitgewerkt

Concreet:

- de vaste output-sectie toont alleen globale beschikbaarheid en directe open-acties
- fase 4 toont de detailstatus van readiness
- fase 4 blijft leidend voor outputgerelateerde detailcontext
- de vaste output-sectie mag geen tweede eigen readiness-verhaal, extra statuscopy of duplicaatknoppen introduceren

### 6. Logboek / controle

Doel:

- operationele controlelaag beschikbaar houden

Eigenschappen:

- laagste prioriteit op de pagina
- compact
- niet als hoofdsectie gepositioneerd

Doel hiervan is niet om HR door een auditverhaal te leiden, maar om controle en terugzoekbaarheid beschikbaar te houden wanneer nodig.

## The 5 Phases

De HR-versie van `Routebeheer` gebruikt exact deze 5 fasen:

1. **Doelgroep klaarzetten**
2. **Communicatie instellen**
3. **Live zetten & volgen**
4. **Output beoordelen**
5. **Afronden & controleren**

### Fase 1 - Doelgroep klaarzetten

Doel:

- deelnemers zijn aanwezig en bruikbaar

Toont:

- uploadstatus
- aantal deelnemers
- fouten of ontbrekende onderdelen

Acties:

- deelnemers uploaden
- import controleren

### Fase 2 - Communicatie instellen

Doel:

- uitnodiging en reminder zijn correct ingericht

Toont:

- uitnodiging ingesteld of niet
- reminder ingesteld of niet
- timing/frequentie status

Acties:

- uitnodiging instellen
- reminder instellen
- route-instellingen bekijken

### Plaats van route-instellingen

De capability `route-instellingen terugvinden` blijft behouden en krijgt een expliciete plek:

- als **secundaire actie binnen fase 2 - Communicatie instellen**

Daarmee blijft deze capability logisch vindbaar op de plek waar launchdatum, timing en communicatiestructuur relevant zijn.

Route-instellingen komen dus:

- niet terug als losse dominante kaart bovenaan
- niet terug als aparte hoofdsectie
- wel terug als gerichte secundaire actie in de fase waar HR er operationeel iets aan heeft

### Fase 3 - Live zetten & volgen

Doel:

- campagne is verstuurd en de voortgang is operationeel te volgen

Toont:

- uitnodigingen verstuurd of niet
- huidige respons
- openstaande opvolging

Acties:

- deelnemers uitnodigen
- reminder versturen / opvolgen

### Fase 4 - Output beoordelen

Doel:

- HR kan zien of de output al bruikbaar is

Toont:

- dashboard leesbaar of niet
- rapport beschikbaar of niet
- readiness op hoofdlijn

Acties:

- open dashboard
- open rapport

### Fase 5 - Afronden & controleren

Doel:

- route operationeel sluiten met de juiste controle

Toont:

- afrondingsstatus
- laatste controlepunten
- logboekbeschikbaarheid

Acties:

- logboek bekijken
- afronding controleren

## Capability Preservation

Deze herstructurering mag geen bestaande capability onvindbaar maken.

De volgende functionele capabilities moeten behouden blijven:

- doelgroep/import bereiken
- uitnodigingen uitvoeren of beheren
- reminders uitvoeren of beheren
- route-instellingen terugvinden
- responsstatus zien
- dashboard openen
- rapport openen
- logboek / audit openen
- blokkades herkennen
- lifecycle/fasevoortgang zien

Wat verandert:

- waar deze capabilities staan
- in welke volgorde HR ze ziet
- hoeveel uitleg eromheen staat

Wat niet verandert:

- dat HR ze nog steeds kan bereiken

## Navigation Principle

`Routebeheer` is een werktafel en geen eindstation voor alle bewerking.

Dat betekent:

- `Nu doen` navigeert direct naar de echte actie
- fase-detail geeft context en actie
- de daadwerkelijke uitvoering kan elders liggen

Bijvoorbeeld:

- importcontrole kan naar een operationeel anker of flow elders leiden
- uitnodiging/reminder kan naar de juiste campaign-actie leiden
- output opent de bestaande dashboard- of rapportroute

De pagina moet dus regisseren, niet alles hosten.

## Content Tone

De tone of voice op deze pagina moet functioneel en compact zijn.

Wel:

- feitelijk
- kort
- taakgericht
- operationeel

Niet:

- verklarend
- adviserend
- verhalend
- interpretatief

## Progress Tracking Across HR Pages

Deze spec richt zich inhoudelijk op `Routebeheer`, maar legt ook een voortgangskader vast voor de bredere HR-slice.

### HR visible pages in scope set

- `/dashboard`
- `/campaigns/[id]`
- `/campaigns/[id]/beheer`
- `/reports`
- `/action-center`

### Current restructuring status

| Page | Status | Notes |
| --- | --- | --- |
| `/campaigns/[id]/beheer` | **Now designing** | Eerste uitgewerkte slice in deze spec |
| `/dashboard` | Not yet restructured | Later vanuit dezelfde Excel-bron aanpakken |
| `/campaigns/[id]` | Not yet restructured | Later aanpakken |
| `/reports` | Not yet restructured | Later aanpakken |
| `/action-center` | Not yet restructured | Later aanpakken |

Dit voortgangskader moet zichtbaar blijven in het vervolgwerk, zodat duidelijk is:

- wat al bewust is aangepakt
- wat nog ongewijzigd is gebleven
- wat later volgt

## Source of Truth for Follow-Up Work

De Excel-bron met route- en rolmatrix blijft het werkinstrument voor vervolgstructurering.

Voor vervolgstappen moet die bron gebruikt worden om per zichtbare pagina vast te leggen:

- primair doel voor de gebruiker
- belangrijkste contentblokken
- kern-KPI / bewijs
- primaire CTA
- secundaire CTA
- data bron / query
- open gaten of vragen

Deze spec levert daarvoor de eerste uitgewerkte pagina-structuur op.

## Success Criteria

De HR-versie van `Routebeheer` is geslaagd als:

- de pagina in default state compact aanvoelt
- HR zonder interpretatieve tekst begrijpt wat nu openstaat
- de eerstvolgende stap direct klikbaar is
- het fase-overzicht scanbaar is zonder detailruis
- fase-detail alleen verschijnt na expliciete klik
- output en logboek beschikbaar blijven zonder de pagina te domineren
- bestaande functionaliteit nog steeds vindbaar is

## Explicit Removal Rule

De huidige laag met:

- interpretaties
- verklarende tekst
- duidende statuscopy
- managementachtige samenvattingen

mag in de nieuwe HR-structuur **weg** en hoeft niet in andere vorm terug te komen.

Dit is een expliciete ontwerpregel en geen optionele optimalisatie.
