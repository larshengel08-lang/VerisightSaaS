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
- routehiërarchie
- inhoudelijke capabilities
- data- of backendgedrag

Deze spec verandert **wel**:

- informatiehiërarchie
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

- verklarende alinea’s
- managementduiding
- route-interpretatie
- “waarom dit belangrijk is”-copy
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

Deze hiërarchie vervangt de huidige zwaardere opbouw met meerdere losse status- en uitlegblokken bovenaan.

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

### 3. Compact fase-overzicht

Doel:

- in één scan laten zien waar de route staat
- HR laten kiezen welke fase aandacht nodig heeft

Eigenschappen:

- alle fasen standaard dichtgeklapt
- elke fase klikbaar
- geen open detail by default

Per fase toont dit overzicht alleen:

- fasenaam
- status
- één korte feitregel

Voorbeeld:

- `Communicatie instellen`
- `Open`
- `Uitnodiging ontbreekt, reminder niet ingesteld`

### 4. Fase-detail

Doel:

- alleen na expliciete klik context en acties tonen voor één fase

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

### Fase 1 — Doelgroep klaarzetten

Doel:

- deelnemers zijn aanwezig en bruikbaar

Toont:

- uploadstatus
- aantal deelnemers
- fouten of ontbrekende onderdelen

Acties:

- deelnemers uploaden
- import controleren

### Fase 2 — Communicatie instellen

Doel:

- uitnodiging en reminder zijn correct ingericht

Toont:

- uitnodiging ingesteld of niet
- reminder ingesteld of niet
- timing/frequentie status

Acties:

- uitnodiging instellen
- reminder instellen

### Fase 3 — Live zetten & volgen

Doel:

- campagne is verstuurd en de voortgang is operationeel te volgen

Toont:

- uitnodigingen verstuurd of niet
- huidige respons
- openstaande opvolging

Acties:

- deelnemers uitnodigen
- reminder versturen / opvolgen

### Fase 4 — Output beoordelen

Doel:

- HR kan zien of de output al bruikbaar is

Toont:

- dashboard leesbaar of niet
- rapport beschikbaar of niet
- readiness op hoofdlijn

Acties:

- open dashboard
- open rapport

### Fase 5 — Afronden & controleren

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
