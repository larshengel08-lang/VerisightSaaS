# Phase 1 Step 2 - ICP, Management Questions, and Packaging Boundaries

## Title

Lock the ICP, primary management questions, and packaging boundaries per Verisight productline before any architecture or build wave starts.

## Korte Summary

Deze stap zet de marktgrenzen en productgrenzen van de verbrede Verisight-suite expliciet vast. Het document bepaalt voor wie Verisight bedoeld blijft, welke managementvraag elke productline oplost, wanneer een route wel of niet als eerste instap logisch is, en hoe productline, delivery mode, repeat motion, add-on en portfolio-route hard van elkaar gescheiden blijven.

De uitkomst van deze stap is dat `ExitScan` herkenbaar de primaire wedge blijft, `RetentieScan` scherp complementair of situationeel primair blijft, `Pulse` bewust wordt gepositioneerd als monitoringlaag na eerste diagnose of baseline, `TeamScan` pas logisch wordt na bredere signalering, en `Onboarding 30-60-90` alleen als latere lifecycle-candidate blijft staan. Hierdoor kan Phase 2 straks architectuur ontwerpen op een smalle, decision-driven basis in plaats van op een te brede suitefantasie.

Status van deze stap:

- Decision status: complete
- Runtime status: geen live productwijzigingen
- Build status: geen productbouw gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De north star en suitevolgorde liggen na Step 1 vast, maar zonder deze stap zouden belangrijke productgrenzen nog diffuus blijven:

- de huidige strategie houdt `ExitScan` als primaire entree en `RetentieScan` als complementaire route
- de huidige marketing- en pricinglaag onderscheidt al baseline, live, ritme, add-ons en portfolioroutes
- `Pulse` en `TeamScan` bestaan nu alleen als gereserveerde future routes en mogen niet impliciet gaan concurreren met bestaande delivery modes
- de huidige suite mag niet verschuiven van managementinstrumenten naar een brede surveycatalogus

Deze stap lost precies dat op door marktfit, routefit en packagingfit nu vast te zetten, voordat domeinmodel, systeemlagen of toekomstige build waves worden ontworpen.

## Decision

### 1. Suite ICP

Verisight blijft primair bedoeld voor organisaties met ongeveer `200` tot `1.000` medewerkers waar people-signalen bestuurlijk relevant zijn, waar uitstroom of behoud niet meer alleen een HR-observatie is, en waar management behoefte heeft aan gerichte decision support in plaats van een brede surveytool.

Suite ICP contract:

- `primary_org_profile`: groeiende of veranderende organisaties met terugkerende people-frictie die bestuurlijk leesbaar moet worden gemaakt
- `employee_range`: circa `200` tot `1.000` medewerkers als primaire sweet spot
- `trigger_condition`: structurele uitstroom, zichtbare behoudsdruk, behoefte aan gerichte opvolging, of noodzaak om managementprioriteit scherper te kiezen
- `decision_maker`: HR-lead, People lead, HR-manager, HR-directeur of directiebetrokken sponsor
- `sponsor`: MT, directie of businessverantwoordelijke die eigenaarschap op opvolging kan dragen
- `delivery_readiness`: bereidheid om met managementsamenvatting, handoff, eerste eigenaar en reviewmoment te werken
- `non_fit_conditions`: wens voor brede MTO-tooling, behoefte aan individuele voorspelling, ontbreken van bestuurlijke sponsor, te weinig volume of te weinig discipline om output op te volgen

Beslissing:

- Verisight wordt niet verbreed naar "voor elke organisatie met een people-vraag".
- Verisight blijft gericht op managementvragen die voldoende gewicht hebben om een gerichte scan, bestuurlijke handoff en opvolgritme te rechtvaardigen.

### 2. Core Entry Rule

`ExitScan` blijft de default eerste route van de suite.

Beslissing:

- standaard eerste instap blijft `ExitScan Baseline`
- uitzondering is alleen logisch wanneer de actieve-populatie behoudsvraag nu aantoonbaar urgenter is dan terugkijkende vertrekduiding
- `RetentieScan` wordt dus niet de algemene eerste stap van de suite
- `Pulse` en `TeamScan` worden expliciet uitgesloten als eerste standaardroute

Rationale:

- dit sluit aan op de huidige pricing ladder, site-copy en strategy defaults
- het beschermt de wedge van Verisight als vertrekduiding en voorkomt te vroege suiteverbreding

### 3. Productline Matrix

#### ExitScan

- `primary_management_question`: welk terugkerend vertrekbeeld zien we en welke werkfactoren wegen daarin het zwaarst mee
- `secondary_management_question`: waar moet management als eerste verdiepend gesprek, verificatie of eigenaarschap organiseren
- `primary_population`: ex-medewerkers of recente vertrekkers
- `cadence`: eenmalige baseline of doorlopende live route
- `signal_type`: retrospective vertrekduiding op groepsniveau
- `decision_use`: bestuurlijke duiding, prioritering, eerste managementsessie, eerste eigenaar
- `first_route_eligibility`: ja, standaard
- `best_follow_on_from`: geen, dit is de default wedge
- `not_for`: individuele diagnose, performance-beoordeling, brede cultuurmeting

Beslissing:

- `ExitScan` blijft het product voor terugkijkende diagnose
- `ExitScan Live` blijft een vervolgvorm binnen dezelfde lijn, niet een los suiteproduct

#### RetentieScan

- `primary_management_question`: waar staat behoud in de actieve populatie nu op groeps- of segmentniveau onder druk
- `secondary_management_question`: welke beinvloedbare werkfactoren vragen als eerste verificatie en gerichte opvolging
- `primary_population`: actieve medewerkers
- `cadence`: eenmalige baseline, daarna ritme als vaste vervolgvorm
- `signal_type`: group-level vroegsignalering op behoud
- `decision_use`: prioritering, verificatie, opvolgspoor, reviewmoment
- `first_route_eligibility`: alleen wanneer actieve behoudsdruk de primaire managementvraag is
- `best_follow_on_from`: `ExitScan` wanneer dezelfde thema's eerder in de actieve populatie moeten worden gevolgd
- `not_for`: brede MTO-vervanger, individuele predictor, algemene engagementtool

Beslissing:

- `RetentieScan` blijft een scherp vroegsignaalproduct en wordt niet opgerekt tot brede people monitor
- `RetentieScan ritme` blijft repeat motion binnen dezelfde lijn

#### Pulse

- `primary_management_question`: bewegen prioritaire signalen zichtbaar de goede of verkeerde kant op nadat eerste interventies of managementkeuzes zijn ingezet
- `secondary_management_question`: waar moet het reviewgesprek worden aangescherpt omdat trend, tempo of herstel uitblijft
- `primary_population`: actieve medewerkers of afgebakende doelgroepen die al in een eerdere lijn bestuurlijk relevant zijn gemaakt
- `cadence`: kort en frequent, in een vast begeleid ritme
- `signal_type`: trend- en effectmonitoring op eerder gedefinieerde signaalthema's
- `decision_use`: review, trendduiding, bijsturing van actieplannen
- `first_route_eligibility`: nee
- `best_follow_on_from`: `RetentieScan Baseline` als behoudsmonitoring, of `ExitScan` wanneer een thema actief gevolgd moet worden na retrospectieve diagnose
- `not_for`: eerste diagnose, brede pulse-tool, losse surveyfrequentie zonder eerdere managementvraag

Beslissing:

- `Pulse` wordt gepositioneerd als "diagnose daarna monitoren"
- `Pulse` wordt expliciet onderscheiden van `RetentieScan ritme`

Boundary met `RetentieScan ritme`:

- `RetentieScan ritme` is repeat binnen dezelfde retentiesignaallogica na baseline
- `Pulse` wordt later een eigen productline wanneer de monitoringbehoefte breder of frequenter wordt dan een herhaalde RetentieScan logisch kan dragen
- `Pulse` mag dus pas productwaardig worden wanneer het iets anders doet dan "RetentieScan vaker herhalen"

#### TeamScan

- `primary_management_question`: in welke teams, leidingcontexten of lokale werksettings speelt het al zichtbare signaal het eerst of het scherpst
- `secondary_management_question`: waar moet management gericht onderzoeken, intervenieren of leiderschapssteun prioriteren
- `primary_population`: afgebakende teams of leiderschapscontexten na een breder organisatiethema
- `cadence`: episodisch en gericht, niet als always-on eerste meting
- `signal_type`: lokalisatie en teamcontextduiding
- `decision_use`: teamprioritering, local validation, managergerichte opvolging
- `first_route_eligibility`: nee, behalve in een later gedefinieerde uitzonderingssituatie die nu nog niet wordt geopend
- `best_follow_on_from`: `RetentieScan`, `Pulse` of een sterk `ExitScan`-patroon dat teamgericht vervolg nodig maakt
- `not_for`: eerste organisatiebrede diagnose, generieke teamtool, brede samenwerkingstool zonder eerdere signalering

Beslissing:

- `TeamScan` wordt geen parallelle eerste managementscan
- `TeamScan` wordt later de lokalisatielaag nadat bredere signalering bestuurlijk al staat

#### Onboarding 30-60-90

- `primary_management_question`: waar loopt vroege integratie, duidelijkheid, steun of verwachting in de eerste 90 dagen vast
- `secondary_management_question`: welke vroege fricties vragen aanpassing in onboarding, leiding of teaminbedding
- `primary_population`: nieuwe medewerkers in de eerste `30`, `60` en `90` dagen
- `cadence`: lifecycle-gedreven op vaste momenten, niet breed ritmisch voor de hele populatie
- `signal_type`: early lifecycle signalering en onboardingduiding
- `decision_use`: onboardingverbetering, vroege retentierisico-reductie, first-90-days review
- `first_route_eligibility`: nu niet activeren als suite-entry
- `best_follow_on_from`: later pas logisch wanneer de suitegrammatica rond diagnose, monitoring en lokalisatie eerst bewezen is
- `not_for`: generieke cultuurmeting, algemene engagementscan, vroege uitbreiding van de live suite

Beslissing:

- deze lijn blijft een latere candidate
- geen architectuur- of packagingcommitment buiten deze positionering

### 4. Entry Rules en Non-Entry Rules

#### ExitScan

Wel eerste route wanneer:

- uitstroom achteraf bestuurlijk moet worden geduid
- losse exitinput nog geen betrouwbaar patroonbeeld geeft
- de organisatie eerst een managementread op vertrek nodig heeft

Niet eerste route wanneer:

- de echte vraag nu over actieve-populatie behoud en vroege signalering gaat
- er nauwelijks relevante exitpopulatie of exitvolume beschikbaar is

#### RetentieScan

Wel eerste route wanneer:

- actieve medewerkers nu de primaire bestuurlijke zorg zijn
- management eerder wil signaleren waar behoud onder druk staat
- er voldoende privacydiscipline en terughoudendheid bestaat rond group-level interpretatie

Niet eerste route wanneer:

- de buyer eigenlijk vooral retrospectief vertrek wil begrijpen
- de organisatie feitelijk een brede MTO-vervanger zoekt
- de organisatie individuele signalen of performance-achtige output verwacht

#### Pulse

Wel vervolgstap wanneer:

- een eerste diagnose of baseline al heeft geleid tot concrete prioriteiten en eerste acties
- management effect, trend of herstel frequenter wil volgen
- het reviewmoment belangrijker wordt dan een nieuwe brede diagnose

Niet eerste route wanneer:

- de buyer nog geen eerste managementvraag heeft gekozen
- de organisatie nog geen bruikbare baseline of eerdere scanwaarde heeft
- de behoefte feitelijk alleen een hogere surveyfrequentie is zonder bestuurlijk kader

#### TeamScan

Wel vervolgstap wanneer:

- een breder signaal al zichtbaar is en lokalisatie nodig wordt
- management gericht wil weten in welke teamcontext of leidingomgeving eerst moet worden verdiept

Niet eerste route wanneer:

- de organisatiediagnose nog niet helder is
- de buyer een generieke teamtool zoekt
- de vraag nog te breed is voor teamgerichte interventie

#### Onboarding 30-60-90

Wel latere route wanneer:

- vroege retentie, onboardingkwaliteit en eerste 90 dagen een bewezen managementthema zijn
- de suite al geloofwaardig werkt in diagnose, monitoring en lokalisatie

Niet nu activeren wanneer:

- de suite nog geen bewezen productsuite-grammatica heeft
- de buyer vooral een brede engagement- of cultuurvraag wil oplossen

### 5. Packaging Boundaries

#### Packaging Taxonomy

- `productline`: een zelfstandige managementvraag met eigen populatie, signaaltype en outputcontract
- `delivery_mode`: de operationele vorm waarin dezelfde productline wordt uitgevoerd
- `repeat_motion`: de vaste herhaalvorm binnen dezelfde productline na eerste waarde
- `add_on`: een beperkte verdieping of extra laag binnen een bestaande productline
- `portfolio_route`: een route tussen productlijnen zonder daarvan een nieuw kernproduct te maken

#### Classificatie van huidige live vormen

- `ExitScan` = `productline`
- `ExitScan Baseline` = `delivery_mode`
- `ExitScan Live` = `delivery_mode`
- `RetentieScan` = `productline`
- `RetentieScan Baseline` = `delivery_mode`
- `RetentieScan ritme` = `repeat_motion`
- `Segment Deep Dive` = `add_on`
- `Compacte retentie vervolgmeting` = `add_on`
- `Combinatie` = `portfolio_route`

#### Classificatie van toekomstige lijnen

- `Pulse` = toekomstige `productline`
- een latere frequente pulse-cyclus = later te bepalen `delivery_mode` of `repeat_motion` binnen `Pulse`, maar nu nog niet openen
- `TeamScan` = toekomstige `productline`
- `Onboarding 30-60-90` = latere `productline`

Beslissing:

- toekomstige productlijnen mogen niet worden geintroduceerd als synoniem voor bestaande live repeat motions
- `Pulse` is dus niet hetzelfde als `RetentieScan ritme`
- `TeamScan` is dus niet hetzelfde als `Segment Deep Dive`

### 6. Expansion en Handoff Logic

#### Van ExitScan naar RetentieScan

Deze doorstroom is logisch wanneer:

- dezelfde thema's eerder in de actieve populatie zichtbaar moeten worden
- management na vertrekduiding eerder wil sturen op behoud
- de eerste route al heeft geleid tot bruikbare managementwaarde, eerste eigenaar en reviewmoment

#### Van RetentieScan naar Pulse

Deze doorstroom is logisch wanneer:

- een eerste retentiebaseline en eerste opvolging al staan
- management nu korter en frequenter effect wil volgen
- de monitoringbehoefte groter wordt dan een periodieke herhaling van dezelfde baselinevorm

#### Van Pulse naar TeamScan

Deze doorstroom is logisch wanneer:

- trends of terugkerende signalen al zichtbaar zijn
- management nu vooral wil weten waar die signalen lokaal het scherpst spelen
- team- of leidingcontext het echte vervolgprobleem wordt

#### Naar Onboarding 30-60-90

Deze doorstroom is pas logisch wanneer:

- vroege lifecycle-vragen een eigen bestuurlijk probleem worden
- de bestaande suite al voldoende geloofwaardige grammar heeft
- er expliciet niet geprobeerd wordt om een brede people-suite in een keer te openen

Expansion guardrails:

- geen expansion zonder bewezen eerste managementwaarde
- geen expansion zonder eerste eigenaar en reviewmoment
- geen expansion als de volgende route de huidige vraag niet echt aanvult
- geen parallelle suiteverkoop wanneer de eerste lijn nog geen bruikbare managementread opleverde

## Key Changes

- De suite heeft nu een expliciet ICP-kader in plaats van alleen impliciete marketingfit.
- Elke productline heeft nu een unieke managementvraag, populatie en entry-regel.
- `Pulse` is expliciet onderscheiden van `RetentieScan ritme`.
- `TeamScan` is expliciet onderscheiden van `Segment Deep Dive`.
- `Onboarding 30-60-90` is logisch geplaatst zonder nu al suite-breedte af te dwingen.
- Packaging is hard gescheiden van productidentiteit.

## Belangrijke Interfaces/Contracts

### ICP Contract

- `primary_org_profile`
- `employee_range`
- `trigger_condition`
- `decision_maker`
- `sponsor`
- `delivery_readiness`
- `non_fit_conditions`

Beslissing:

- dit contract is verplicht input voor alle toekomstige productline-definities en routekeuzes

### Productline Fit Contract

- `productline`
- `primary_management_question`
- `secondary_management_question`
- `primary_population`
- `cadence`
- `signal_type`
- `decision_use`
- `first_route_eligibility`
- `best_follow_on_from`
- `not_for`

Beslissing:

- geen toekomstige productline mag worden toegevoegd zonder volledig ingevuld fit contract

### Packaging Boundary Contract

- `productline`
- `delivery_mode`
- `repeat_motion`
- `add_on`
- `portfolio_route`

Beslissing:

- elke buyer-facing vorm moet exact onder een van deze types vallen

### Route Qualification Contract

- `entry_condition`
- `disqualifier`
- `minimum_signal_need`
- `minimum_management_readiness`
- `expansion_trigger`
- `handoff_to_next_route`

Beslissing:

- deze velden worden verplichte input voor toekomstige sales copy, portfolio logic en productregistratie

### Packaging Ladder Contract

- eerste route
- vervolgvorm binnen dezelfde lijn
- verdieping binnen dezelfde lijn
- expansion naar andere lijn

Beslissing:

- repeat, add-on en expansion mogen in copy en architectuur niet op hetzelfde niveau worden behandeld

## Testplan

### Reviewtest

- [x] Gecontroleerd dat het suite-ICP aansluit op de huidige strategie rond organisaties van ongeveer `200` tot `1.000` medewerkers en de bestaande `ExitScan`-wedge.
- [x] Gecontroleerd dat `RetentieScan` group-level en complementair blijft aan huidige trust- en pricingcopy.

### Productline Distinctness Test

- [x] `ExitScan` = retrospectieve diagnose
- [x] `RetentieScan` = vroegsignalering in actieve populatie
- [x] `Pulse` = monitoring van trend en effect
- [x] `TeamScan` = lokalisatie en teamcontext
- [x] `Onboarding 30-60-90` = early lifecycle signalering

Conclusie:

- elke lijn heeft nu een andere primaire managementvraag, populatie en cadence

### Entry Rule Test

- [x] `ExitScan` blijft default wedge
- [x] `RetentieScan` blijft uitzondering als actieve behoudsvraag primair is
- [x] `Pulse` kan niet als eerste route worden verkocht
- [x] `TeamScan` kan niet als eerste brede organisatieroute worden verkocht

### Packaging Taxonomy Test

- [x] Alle bestaande live vormen passen in exact een packagingtype
- [x] Geen bestaande live vorm hoeft te worden opgewaardeerd tot nieuwe productline
- [x] Toekomstige lijnen zijn begrensd zonder bestaande packaging te breken

### Expansion Logic Review

- [x] Follow-on motions blijven waarde-gedreven
- [x] Expansion blijft gekoppeld aan eerste managementwaarde
- [x] Upsell zonder aanvullende managementvraag is uitgesloten

### Smoke-validatie

#### Scenario 1

Een HR-team heeft structurele uitstroom maar geen acute actieve behoudsurgentie.

- Route: `ExitScan Baseline`
- Waarom: retrospectieve diagnose is hier eerst nodig
- Resultaat: logisch en niet diffuus

#### Scenario 2

Een organisatie heeft vooral een urgente actieve-populatie vraag en wil eerder signaleren waar behoud nu onder druk staat.

- Route: `RetentieScan Baseline`
- Waarom: actieve behoudsvraag is hier aantoonbaar primair
- Resultaat: logisch en in lijn met huidige uitzonderingsregel

#### Scenario 3

Een klant heeft na eerste baseline en eerste actie behoefte aan frequente opvolging van effect.

- Route: eerst `RetentieScan ritme`, later mogelijk `Pulse`
- Waarom: repeat binnen dezelfde lijn gaat voor nieuwe productline
- Resultaat: voorkomt te vroege productuitbreiding

#### Scenario 4

Een klant ziet een breed signaal, maar weet niet in welke teams of leidingcontext eerst moet worden verdiept.

- Route: later `TeamScan` na bredere signalering
- Waarom: lokalisatie volgt op diagnose of monitoring
- Resultaat: teamlaag wordt niet te vroeg geopend

#### Scenario 5

Een buyer wil meteen de hele suite kopen zonder dat de eerste route al werkt.

- Route: afwijzen als suite-default, eerst een eerste route kiezen
- Waarom: Verisight blijft decision-driven, niet bundle-driven
- Resultaat: expansion guardrail houdt stand

## Assumptions/Defaults

- `ExitScan` blijft de primaire entreepropositie totdat echte suite-evidence een andere wedge rechtvaardigt.
- `RetentieScan` blijft complementair of situationeel primair, niet de generieke start van de suite.
- `Pulse` wordt later alleen geopend als aparte lijn wanneer de monitoringbehoefte verder gaat dan repeat binnen `RetentieScan`.
- `TeamScan` wordt later alleen geopend als aparte lijn wanneer lokalisatie en teamcontext een eigen managementprobleem zijn geworden.
- `Onboarding 30-60-90` blijft een latere lifecycle-candidate zonder actief pricing- of routecommitment.
- De huidige live pricing ladder blijft leidend totdat latere uitvoerstappen haar expliciet aanpassen.

## Product Acceptance

- [x] Per lijn is duidelijk welke managementvraag wordt opgelost.
- [x] Per lijn is duidelijk voor wie die lijn wel en niet bedoeld is.
- [x] `ExitScan` blijft herkenbaar de primaire wedge.
- [x] `Pulse` is scherp onderscheiden van `RetentieScan ritme`.
- [x] `TeamScan` is scherp onderscheiden van organisatiebrede diagnose en `Segment Deep Dive`.
- [x] `Onboarding 30-60-90` is logisch geplaatst zonder de suite nu al operationeel te verbreden.

## Codebase Acceptance

- [x] De stap benoemt welke bestaande artefacten later geraakt worden: strategie, roadmap, marketing-products, site-content, pricing- en positioningtests.
- [x] Er is nog geen nieuw domeinmodel of entitlementmodel geintroduceerd.
- [x] Bestaande live productregistratie blijft intact.
- [x] De contracts zijn concreet genoeg om later in code en tests te worden vastgelegd.

## Runtime Acceptance

- [x] De huidige live app, dashboard, rapporten en websitegedrag blijven onaangetast.
- [x] Er is geen nieuwe route live gezet.
- [x] Er is geen pricing, CTA-flow of productstatus runtime-side aangepast.
- [x] Er zijn geen nieuwe database-, auth- of jobconcepten toegevoegd.

## QA Acceptance

- [x] Er is geen overlap meer in kernvragen tussen productlijnen op strategisch niveau.
- [x] Packaging-termen zijn expliciet en onderling exclusief gemaakt.
- [x] Expansion- en handoffregels zijn uitlegbaar zonder upsell- of bundelruis.
- [x] Deze stap bevat concrete review- en smokechecks die later herhaalbaar zijn.

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor de markt- en packaginggrenzen van de suite.
- [x] Het document benoemt duidelijk welke bestaande systemen later moeten worden geupdate.
- [x] Het document eindigt met een heldere gate naar de architectuurfase.

## Not In This Step

- Geen systeemarchitectuur of domeinmodel.
- Geen API-ontwerp.
- Geen repo-herstructurering.
- Geen wijzigingen aan pricingpagina's, productpagina's of tests.
- Geen implementatie van `Pulse`, `TeamScan` of `Onboarding 30-60-90`.

## Exit Gate

Deze stap is afgerond omdat:

- [x] de suite-ICP en non-fit criteria expliciet zijn vastgezet
- [x] elke productline een unieke managementvraag heeft
- [x] entry rules en non-entry rules per lijn zijn vastgelegd
- [x] packaging boundaries zijn uitgewerkt zonder taxonomische overlap
- [x] expansion en handofflogica zijn begrensd
- [x] de inputs voor Phase 2 expliciet zijn benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `Phase 2 Step 1 - System layers, domain boundaries, and artifact lifecycle plan`

Verplichte inputs voor die stap:

- suite ICP contract
- productline fit contracts per lijn
- packaging taxonomy
- expansion and handoff logic
- harde regel dat alleen de eerstvolgende lijn architecturaal mag worden ontsloten
