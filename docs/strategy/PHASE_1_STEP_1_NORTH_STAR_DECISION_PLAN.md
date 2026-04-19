# Phase 1 Step 1 - Verisight Suite North Star Decision Plan

## Title

Lock the Verisight product-suite north star, expansion order, and anti-goals before any new productline build starts.

## Korte Summary

Deze stap legt eerst de strategische productgrenzen vast voor de verbreding van Verisight, zodat architectuur en uitvoering later niet breder lopen dan de huidige productwaarheid kan dragen. De stap moet expliciet beslissen wat Verisight als suite gaat zijn, welke productlijnen in welke volgorde logisch zijn, welke packagingregels gelden, en wat we juist niet gaan doen.

Deze stap is bewust document- en beslisgedreven. Er wordt nog geen nieuwe productlijn gebouwd. Het doel is om de huidige situatie van `ExitScan` en `RetentieScan` te vertalen naar een strakke suite-thesis met harde sequencing: eerst diagnosticeren, dan monitoren, dan lokaliseren, en pas daarna verbreden naar een extra lifecycle-moment.

## Why This Is The Next Step

De huidige repo bevat al een heldere live kern met `ExitScan` en `RetentieScan`, een buyer-facing combinatie-route en gereserveerde future routes voor `Pulse` en `Teamscan` in [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts). Tegelijk zeggen de huidige strategie en roadmap nog expliciet dat nieuwe productfamilies later pas logisch zijn in [docs/strategy/STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md) en [docs/strategy/ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md).

Die spanning moet eerst decision-complete worden opgelost. Zonder deze stap zouden `Pulse`, `TeamScan` en een mogelijke `Onboarding 30-60-90`-lijn te vroeg in architectuur, navigatie of copy terechtkomen.

## Step Objective

Beslis en documenteer:

- wat Verisight als verbrede suite wel en niet is
- welke ICP en managementvragen leidend blijven
- welke productvolgorde wordt vergrendeld
- hoe `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en `Onboarding 30-60-90` zich tot elkaar verhouden
- welke packaging- en positioneringsregels niet mogen breken wanneer latere waves starten

## Decision Scope

Deze stap moet de volgende beslissingen expliciet vastzetten:

- [ ] Suite thesis: Verisight blijft een guided, management-facing people signal product suite en wordt niet herkadert als brede surveytool, MTO-platform of open people OS.
- [ ] Core live basis: `ExitScan` en `RetentieScan` blijven de enige live core products waarop de suite wordt uitgebouwd.
- [ ] Expansion order: `Pulse` wordt de eerstvolgende productlijn, `TeamScan` de tweede, `Onboarding 30-60-90` pas daarna als latere lifecycle-lijn.
- [ ] Product ladder: diagnose -> monitor -> localize -> early lifecycle stabilize.
- [ ] Packaging guardrail: productlijnen blijven producten, geen losse feature bundles of generieke modules zonder buyer-vraag.
- [ ] Portfolio guardrail: de combinatie blijft een portfolio-route en wordt geen derde kernproduct.
- [ ] Anti-goals: geen brede people suite, geen generieke pulse-tool, geen manager-tool zonder productgrenzen, geen parallelle multi-line build.

## Evidence Base

Deze stap moet worden onderbouwd met de huidige repo-realiteit:

- [CURRENT_PRODUCT_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/CURRENT_PRODUCT_ANALYSIS_PLAN.md)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [docs/strategy/STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [docs/strategy/ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)

## Planned Output For This Step

Wanneer deze stap straks echt wordt uitgevoerd, moet hij minimaal opleveren:

- een geupdate north star document voor de verbrede Verisight-suite
- een aangescherpte strategie-update waarin de huidige "geen nieuwe productfamilies"-guardrail wordt vervangen door een gecontroleerde suite-expansieregel
- een expliciete productladder voor live core, next candidate en later candidate
- een naming- en packagingcontract voor product versus route versus delivery mode
- een heldere set anti-goals die architectuur en productbeslissingen later begrenzen

## Key Changes

- Verisight verschuift strategisch van "twee producten met latere opties" naar "een strak geordende suite met een locked expansion order".
- `Pulse` wordt niet gedefinieerd als brede pulse-tool, maar als de eerste monitoringlaag bovenop de huidige diagnoseproducten.
- `TeamScan` wordt niet neergezet als algemene teamtool, maar als een vervolglijn die helpt lokaliseren waar signalen als eerste onderzocht of aangepakt moeten worden.
- `Onboarding 30-60-90` wordt nog niet als actieve productlijn gecommitteerd, maar wel als expliciete latere candidate binnen dezelfde lifecycle-logica.
- De huidige strategie moet worden herzien van "nog geen nieuwe productfamilies" naar "wel uitbreiden, maar alleen in locked sequence en met harde gates".
- Productarchitectuur mag later alleen worden uitgebreid wanneer die direct nodig is voor de eerstvolgende productlijn, niet voor de volledige suite vooruit.

## Belangrijke Interfaces/Contracts

### 1. Portfolio Status Contract

De suite moet na deze stap exact met deze statussen kunnen werken:

- `live_core`
- `portfolio_route`
- `next_locked_candidate`
- `later_candidate`

Doel:

- voorkomen dat reserved, live, portfolio en expansion door elkaar gaan lopen in copy, code of navigatie

### 2. Product Line Contract

Elke productlijn moet later dezelfde beslisvelden hebben:

- `name`
- `primary_buyer_question`
- `population`
- `cadence`
- `unit_of_analysis`
- `signal_type`
- `primary_management_output`
- `decision_use`
- `expansion_prerequisite`

Doel:

- zorgen dat elke nieuwe lijn scherp afwijkt van de andere lijnen en niet alleen een andere verpakking van dezelfde surveylogica wordt

### 3. Packaging Contract

Na deze stap moet het onderscheid vastliggen tussen:

- `productline`
- `portfolio_route`
- `delivery_mode`
- `follow_on_motion`

Doel:

- voorkomen dat bijvoorbeeld `Baseline`, `Live`, `ritme`, `compact vervolg`, `Pulse` en `Combinatie` commercieel op hetzelfde abstractieniveau terechtkomen

### 4. Expansion Sequence Contract

De suite-uitbreiding moet hard worden begrensd op:

- `ExitScan` / `RetentieScan` als huidige basis
- `Pulse` als eerstvolgende build candidate
- `TeamScan` pas na een werkende Pulse-slice
- `Onboarding 30-60-90` pas na bewezen productsuite-grammatica

Doel:

- voorkomen dat architectuur, dataobjecten, navigation of entitlementlogica alvast voor alle toekomstige lijnen tegelijk worden opgerekt

## Work Breakdown

### Step 1A - Lock the suite thesis

- [ ] Formuleer een north star in een zin die zowel de huidige productrealiteit als de verbreding draagt.
- [ ] Leg expliciet vast wat Verisight niet wordt.
- [ ] Toets de north star aan de huidige live kracht van dashboard, rapport en management handoff.

Definition of Done:

- Er is een korte suite-definitie die zowel intern als buyer-facing bruikbaar is.

### Step 1B - Lock the product ladder

- [ ] Beschrijf de rol van `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en `Onboarding 30-60-90` in een enkele portfolio-ladder.
- [ ] Maak expliciet waarom `Pulse` eerst komt, gebaseerd op de huidige `RetentieScan`- en `ExitScan`-logica.
- [ ] Maak expliciet waarom `TeamScan` nog niet eerst komt.
- [ ] Maak expliciet waarom `Onboarding 30-60-90` later is en nog geen build commitment krijgt.

Definition of Done:

- De suitevolgorde is inhoudelijk, commercieel en uitvoerbaar onderbouwd.

### Step 1C - Lock packaging and anti-goals

- [ ] Leg vast wat een productlijn is, wat een route is en wat een delivery mode is.
- [ ] Schrijf de anti-goals uit die toekomstige scope-expansie moeten afremmen.
- [ ] Leg vast welke uitbreidingen nu expliciet niet gestart mogen worden.

Definition of Done:

- De producttaxonomie en anti-goals zijn strak genoeg om Phase 2 architectuur te begrenzen.

### Step 1D - Identify the exact follow-on step

- [ ] Benoem de eerstvolgende stap na deze beslissing.
- [ ] Leg vast welke inputs uit deze stap verplicht nodig zijn voor Phase 2.
- [ ] Schrijf een harde gate op: geen architectuurverbreding totdat deze step-output is goedgekeurd.

Definition of Done:

- De overgang naar de volgende stap is beperkt, logisch en gecontroleerd.

## Testplan

Deze stap is een beslis- en documentstap, maar moet alsnog toetsbaar zijn.

- [ ] Reviewtest: controleer dat de suite north star niet botst met de huidige live productclaims van `ExitScan` en `RetentieScan`.
- [ ] Taxonomietest: controleer dat `productline`, `portfolio_route` en `delivery_mode` zonder overlap te onderscheiden zijn.
- [ ] Sequencingtest: controleer dat `Pulse`, `TeamScan` en `Onboarding 30-60-90` elk een unieke buyer-vraag en volgordelogica hebben.
- [ ] Regression review: controleer dat deze stap geen impliciete verplichting introduceert om nu al navigatie, architectuur of entitlementmodellen breed uit te bouwen.
- [ ] Smoke-validatie: loop vijf voorbeeldsituaties langs en bevestig dat de suitevolgorde daar logisch en niet diffuus uitkomt.

Voorbeeld smoke-situaties:

- een organisatie wil vertrek achteraf begrijpen
- een organisatie wil behoud frequenter volgen na eerste diagnose
- een organisatie ziet brede signalen maar weet niet in welke teamcontext eerst te kijken
- een organisatie wil de eerste 90 dagen beter begrijpen
- een organisatie wil alles tegelijk kopen zonder dat de eerste lijn al werkt

## Assumptions/Defaults

- `ExitScan` blijft de primaire entreepropositie totdat echte suite-evidence iets anders rechtvaardigt.
- `RetentieScan` blijft een complementaire, group-level vroegsignaleringslijn en wordt niet herkadert als brede people survey.
- `Pulse` is de logisch eerste nieuwe lijn omdat hij de stap van eenmalige scan naar begeleid ritme commercieel en inhoudelijk het kleinste maakt.
- `TeamScan` is pas logisch nadat de gedeelde signaalgrammatica en monitoringlaag productwaardig werken.
- `Onboarding 30-60-90` blijft een latere candidate en krijgt in deze stap nog geen architectuur- of build commitment.
- De combinatie blijft een route tussen producten, niet een suite-bundel die de afzonderlijke lijnen vervangt.
- Deze stap mag documentatie en taxonomy-richting voorbereiden, maar nog geen brede code- of navigatie-uitrol starten.

## Product Acceptance

- [ ] Het document maakt duidelijk wat Verisight als verbrede suite is.
- [ ] Het document maakt duidelijk voor wie de suite bedoeld blijft.
- [ ] Elke productlijn heeft een scherp andere managementvraag.
- [ ] `Pulse` staat overtuigend als eerste build candidate vast.
- [ ] De suite voelt als een logische extensie van de huidige live producten, niet als een abrupte nieuwe richting.

## Codebase Acceptance

- [ ] De stap benoemt exact welke bestaande code- en docartefacten later moeten worden aangepast.
- [ ] Er wordt nog geen architectuur toegevoegd puur voor later gebruik.
- [ ] Er ontstaat geen conflict met de huidige live productregistratie, behalve expliciet benoemde strategische guardrails die in een volgende uitvoerstap moeten worden geupdate.
- [ ] De toekomstige statusvelden en productrollen zijn concreet genoeg om later in code te worden vastgelegd.

## Runtime Acceptance

- [ ] De huidige live runtime van `ExitScan` en `RetentieScan` blijft volledig ongemoeid.
- [ ] Er wordt geen nieuwe route, featureflag of productscherm geactiveerd.
- [ ] De stap forceert geen nieuwe runtime-objecten voordat Phase 2 en Foundation Build die onderbouwen.

## QA Acceptance

- [ ] De suitevolgorde is uitlegbaar zonder contradicties.
- [ ] Terminologie is scherp genoeg om later in tests te verankeren.
- [ ] De anti-goals zijn concreet genoeg om future-scope creep tegen te houden.
- [ ] De stap bevat een expliciete smoke-validatie en reviewlogica.

## Documentation Acceptance

- [ ] Deze stap kan dienen als source of truth voor de eerstvolgende strategische beslissing.
- [ ] Het document benoemt duidelijk welke bestaande strategiedocumenten later moeten worden aangepast.
- [ ] Het document eindigt met een heldere gate naar de volgende stap.

## Not In This Step

- Geen architectuurontwerp voor de hele suite.
- Geen data- of domeinmodeluitbreiding.
- Geen nieuwe survey-, scoring- of dashboardimplementatie.
- Geen nieuwe marketingpagina's, pricingwijzigingen of navigatieuitrol.
- Geen commitment om `Onboarding 30-60-90` nu al te bouwen.

## Exit Gate

Deze stap is pas klaar wanneer:

- de suite north star in een enkele heldere formulering is vastgezet
- de productladder en expansion order expliciet zijn vergrendeld
- packaging en anti-goals zijn uitgewerkt
- de spanning met de huidige strategie- en roadmapguardrails expliciet is opgelost
- de volgende stap eenduidig is vastgesteld

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `Phase 1 Step 2 - ICP, managementvragen en packaging boundaries per productline`

Die stap mag pas starten nadat dit document is geaccepteerd als beslisbasis.
