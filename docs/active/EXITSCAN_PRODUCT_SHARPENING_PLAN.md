# EXITSCAN_PRODUCT_SHARPENING_PLAN.md

## 1. Summary

Dit plan scherpt **ExitScan** inhoudelijk, methodisch, commercieel en UX-matig aan op basis van de **huidige implementatie** in survey, scoring, dashboard, rapport en productcopy.

De hoofdrichting is:

- ExitScan moet duidelijker lezen als **scherp product voor vertrekduiding**, niet als generieke exit-enquête.
- ExitScan moet commercieel sterk blijven, maar niet meer claimen dan de huidige methodiek kan dragen.
- ExitScan moet in survey, scoring, dashboard en rapport **dezelfde logica en taal** gebruiken.
- ExitScan moet duidelijk complementair blijven aan **RetentieScan**:
  - ExitScan = terugkijkende vertrekduiding
  - RetentieScan = vroegsignalering in actieve populatie

Belangrijkste observaties uit de huidige codebase:

- De huidige ExitScan-propositie is al herkenbaar, maar nog niet strak genoeg tussen:
  - `waarom mensen vertrokken`
  - `werkfactoren en patronen die terugkeren`
  - `wat management hier logisch mee kan`
- De survey meet al een bruikbare basis:
  - vertrekcontext
  - SDT-werkbeleving
  - 6 organisatiefactoren
  - meespelende vertrekredenen
  - open tekst
- Er ontbreken nu nog een paar inhoudelijke ingrediënten om ExitScan sterker te maken:
  - eerdere signalering / bespreekbaarheid van vertrek
  - scherper onderscheid tussen hoofdreden, meespelende reden en beïnvloedbaarheid
  - een explicietere exit-specifieke vertaalslag van ruwe scores naar managementduiding
- De huidige scoringlogica is bruikbaar, maar voelt op onderdelen nog te generiek:
  - ExitScan gebruikt nog de generieke `compute_retention_risk(...)` route voor zijn frictiescore
  - preventability is al terecht afgezwakt naar werksignaal-taal, maar de producttaal eromheen is nog niet overal mee veranderd
- Dashboard en rapport zijn nu functioneel, maar ExitScan-specifieke decision support is nog te dun:
  - vertrekredenen, werksignalen en handelingsperspectief komen nog niet scherp genoeg samen
  - de taal rond `belevingsscore`, `signaalwaarde`, `frictiescore` en `sterk werksignaal` is nog niet overal even rustig en logisch
- De marketing- en productcopy rond ExitScan is commercieel bruikbaar, maar nog net te ambitieus op punten waar de methodiek zelf terughoudender is.

Dit plan kiest daarom voor:
- **geen nieuw product**
- **geen grote backend-herarchitectuur**
- **wel inhoudelijke aanscherping van ExitScan als productketen**
- **wel beperkte interface-, copy- en logica-aanpassingen waar nodig voor consistentie**

---

## 2. Milestones

### Milestone 0 - Freeze ExitScan Scope And Baseline
Dependency: none

#### Tasks
- [ ] Leg de huidige ExitScan-keten vast als baseline:
  - publieke ExitScan-propositie
  - surveyflow
  - scoringlogica
  - dashboardinterpretatie
  - rapportstructuur
- [ ] Maak expliciet onderscheid tussen:
  - wat nu echt ExitScan-specifiek is
  - wat nu nog gedeelde/generieke producttaal is
- [ ] Documenteer waar ExitScan nu inhoudelijk of commercieel te veel leunt op generieke surveylogica.
- [ ] Leg vast waar RetentieScan als vergelijkingskader relevant is, zonder RetentieScan zelf mee te wijzigen.

#### Definition of done
- [ ] Er is één helder baselinebeeld van de huidige ExitScan-keten.
- [ ] De belangrijkste inconsistenties tussen productlagen zijn expliciet benoemd.
- [ ] Het plan start vanuit echte repo-observaties, niet vanuit algemene producttheorie.

#### Validation
- [ ] Baseline is controleerbaar te herleiden naar huidige code, templates en publieke copy.
- [ ] ExitScan/RetentieScan-grens is scherp genoeg beschreven om scopelek te voorkomen.

---

### Milestone 1 - ExitScan Positioning And Core Product Promise
Dependency: Milestone 0

#### Tasks
- [ ] Herschrijf de kernbelofte van ExitScan naar één sterke, verdedigbare lijn:
  - geen “harde oorzaakverklaring”
  - wel “vertrekduiding op basis van terugkerende werkfactoren, vertrekredenen en werksignalen”
- [ ] Maak een vaste producttaal voor ExitScan:
  - `frictiescore`
  - `sterk werksignaal`
  - `vertrekduiding`
  - `beïnvloedbare werkfactoren`
  - `managementgesprek`
- [ ] Trek een harde lijn tussen ExitScan en RetentieScan:
  - wat ExitScan wel levert
  - wat ExitScan niet probeert te doen
  - wat alleen RetentieScan hoort te doen
- [ ] Schrap of herschrijf copy die ExitScan te veel als brede survey of te harde diagnose laat lezen.
- [ ] Maak een vaste commerciële beschrijving van:
  - voor wie ExitScan is
  - wat je krijgt
  - wanneer ExitScan logisch is
  - wat de output bestuurlijk bruikbaar maakt

#### Definition of done
- [ ] ExitScan heeft één consistente productbelofte over website, dashboard en rapport.
- [ ] ExitScan leest niet meer als generieke exit-enquête.
- [ ] ExitScan en RetentieScan overlappen niet in hun kernbelofte.

#### Validation
- [ ] Een HR-manager kan in 10 seconden uitleggen wat ExitScan is en niet is.
- [ ] De producttaal is intern consistent tussen marketing, dashboard en rapport.
- [ ] Overclaiming-risico in de kernpropositie is verminderd zonder commerciële scherpte te verliezen.

---

### Milestone 2 - Survey Content Sharpness For ExitScan
Dependency: Milestone 1

#### Tasks
- [ ] Beoordeel de huidige ExitScan-survey module voor module:
  - vertrekcontext
  - SDT
  - organisatiefactoren
  - aanvullende vertrekredenen
  - open tekst
- [ ] Behoud wat inhoudelijk sterk is:
  - compacte SDT-laag
  - 6 duidelijke organisatiefactoren
  - primaire vertrekreden
  - stay-intent / beïnvloedbaarheid
- [ ] Voeg de ontbrekende ExitScan-vragen toe die inhoudelijk het meeste opleveren:
  - eerdere signalering of bespreekbaarheid van vertrek
  - waar relevant: of de organisatie signalen eerder had kunnen zien
- [ ] Beslis expliciet welke onderdelen uit eerdere blueprint-documenten bewust níet terugkomen:
  - geen onnodige uitbreiding naar lange pull-factor blokken
  - geen survey-inflatie zonder directe productwaarde
- [ ] Maak de open vraag sterker ExitScan-specifiek:
  - niet alleen “nog iets toelichten?”
  - wel gericht op wat de organisatie had moeten begrijpen of eerder had moeten zien
- [ ] Herijk de vraagformuleringen op:
  - terugkijkende exitcontext
  - leesbaarheid
  - methodische terughoudendheid
  - aansluiting op rapport- en dashboardduiding

#### Definition of done
- [ ] De ExitScan-survey meet precies wat het product later nodig heeft voor duiding.
- [ ] Elke surveyvraag heeft een duidelijke productfunctie.
- [ ] Er zitten geen evidente gaten meer tussen wat de survey vraagt en wat de output belooft.

#### Validation
- [ ] Alle surveyvragen zijn te koppelen aan een expliciete interpretatie in dashboard of rapport.
- [ ] De vragenlijst blijft compact genoeg voor de huidige productvorm.
- [ ] ExitScan bevat geen modules die eigenlijk alleen voor RetentieScan logisch zijn.

---

### Milestone 3 - Scoring And Interpretation Model Alignment
Dependency: Milestone 2

#### Tasks
- [ ] Maak de ExitScan-scorelaag conceptueel eigen:
  - ExitScan mag niet langer inhoudelijk voelen als “retention risk met andere gewichten”
- [ ] Beslis of `compute_retention_risk(...)` voor ExitScan functioneel mag blijven bestaan als technische helper of inhoudelijk moet worden omgedoopt/gesplitst.
- [ ] Trek de relatie strak tussen:
  - belevingsscore
  - signaalwaarde
  - frictiescore
  - preventability / werksignaal
- [ ] Maak expliciet wat elk cijfer wél en niet betekent.
- [ ] Herijk preventability-taal volledig naar de huidige zachtere logica:
  - `STERK_WERKSIGNAAL`
  - `GEMENGD_WERKSIGNAAL`
  - `BEPERKT_WERKSIGNAAL`
- [ ] Controleer of de huidige exit reason mapping en aanvullende reasons logisch genoeg zijn voor de gewenste managementduiding.
- [ ] Herzie de score-output zodat ExitScan sterker leest als:
  - terugkijkende vertrekduiding
  - managementprioritering
  - hypothesevorming
  en minder als:
  - generieke survey-scorelaag

#### Definition of done
- [ ] ExitScan heeft één logisch scoreverhaal van surveyinput naar managementoutput.
- [ ] Preventability/werksignaal sluit inhoudelijk en terminologisch aan op dashboard en rapport.
- [ ] Scoretermen zijn rustig genoeg om extern uitlegbaar te zijn.

#### Validation
- [ ] Voor elk kerncijfer is een eenduidige uitleg beschikbaar.
- [ ] Geen scoreterm suggereert causaliteit of hard bewijs.
- [ ] ExitScan-scorelaag is duidelijk te onderscheiden van RetentieScan-signaaltaal.

---

### Milestone 4 - Dashboard Decision Support Sharpening
Dependency: Milestone 3

#### Tasks
- [ ] Versterk de ExitScan-specifieke dashboardread:
  - eerst: wat voor vertrekbeeld zien we?
  - daarna: welke werkfactoren springen eruit?
  - daarna: wat lijkt breed beïnvloedbaar?
  - daarna: wat vraagt nu gesprek of actie?
- [ ] Maak de bovenste beslislaag sterker ExitScan-specifiek:
  - vertrekbeeld
  - werksignaal
  - topfactor
  - eerstvolgende managementvraag
- [ ] Voeg zichtbaarere ExitScan-duiding toe rond:
  - top vertrekredenen
  - meespelende factoren
  - hoe breed het werkgerelateerde signaal is
- [ ] Herschrijf generieke dashboardtekst die nu te veel “signalen” noemt zonder ExitScan-context.
- [ ] Maak de factor- en focusvragenlaag scherper:
  - minder generiek HR-taal
  - meer exitgerichte verificatievragen
- [ ] Beoordeel of de huidige `RiskCharts`-weergave voor ExitScan voldoende informatief is, of dat ExitScan een eigen samenvattende leeslaag nodig heeft boven de generieke verdeling.
- [ ] Maak de methodologiekaart concreter voor ExitScan:
  - retrospectief
  - geen causale vaststelling
  - werkfactorensignaal
  - segmentvergelijking is beschrijvend

#### Definition of done
- [ ] Het dashboard leest als ExitScan-dashboard, niet als generiek scan-dashboard.
- [ ] Een HR-manager ziet sneller wat eerst te bespreken is.
- [ ] Vertrekduiding is zichtbaarer dan alleen factorranking.

#### Validation
- [ ] Eerste scherm geeft een bruikbare managementsamenvatting zonder rapport nodig te hebben.
- [ ] Dashboardtermen sluiten aan op rapporttermen.
- [ ] ExitScan-dashboard voelt inhoudelijk duidelijk anders dan RetentieScan-dashboard.

---

### Milestone 5 - Report Structure And Management Readability
Dependency: Milestone 4

#### Tasks
- [ ] Herzie de rapportlijn van ExitScan op managementbruikbaarheid:
  - management summary
  - vertrekbeeld
  - werkfactoren
  - werksignaal / beïnvloedbaarheid
  - hypothesen
  - vervolgstappen
- [ ] Maak expliciet wat ExitScan-rapportage uniek maakt ten opzichte van een gewone exit-enquête:
  - geen losse respondentnotities
  - geen generieke tevredenheidssamenvatting
  - wel patroonbeeld, werkfactoren, vertrekduiding en prioritering
- [ ] Herschrijf of herschik onderdelen die nu te generiek of te “survey-rapportachtig” lezen.
- [ ] Vereenvoudig de scoretabeltaal waar nodig:
  - belevingsscore
  - signaalwaarde
  - band
- [ ] Zorg dat preventability / werksignaal in het rapport niet blijft hangen als label, maar echt managementwaarde geeft.
- [ ] Maak werkhypothesen expliciet ExitScan-waardig:
  - vertrek achteraf duiden
  - managementgesprek richten
  - geen schijnzekerheid
- [ ] Trek de methodologiepassage inhoudelijk strak met de echte huidige implementatie en niet met oudere blueprint-ambities.

#### Definition of done
- [ ] Het rapport voelt als een managementinstrument voor vertrekduiding.
- [ ] De rapportvolgorde ondersteunt echte besluitvorming.
- [ ] De methodologische nuance ondermijnt de commerciële waarde niet, maar bewaakt geloofwaardigheid.

#### Validation
- [ ] Een directielid kan de managementsamenvatting lezen zonder scorelogica te kennen.
- [ ] De rapportduiding gebruikt geen termen die elders anders bedoeld worden.
- [ ] ExitScan-rapport en ExitScan-dashboard vertellen hetzelfde verhaal in andere diepte.

---

### Milestone 6 - ExitScan Commercial Sharpness And Product Boundaries
Dependency: Milestone 5

#### Tasks
- [ ] Herzie de publieke ExitScan-copy op:
  - productpagina
  - overzichtspagina
  - waar relevant homepage- of portfolio-copy
- [ ] Maak ExitScan scherper als koopbaar product:
  - waarvoor koop je dit
  - wanneer is het logisch
  - wat maakt dit anders dan losse exitgesprekken of interne analyse
- [ ] Herschrijf teksten die nu te portfolio-breed of te generiek surveyachtig zijn.
- [ ] Behoud commerciële kracht, maar vervang zinnen die nu impliciet te veel beloven.
- [ ] Leg de verhouding met RetentieScan vast in één vaste commerciële logica:
  - ExitScan = achteraf begrijpen
  - RetentieScan = eerder signaleren
  - combinatie = bewuste portfolio-aanpak, niet inhoudelijke overlap
- [ ] Zorg dat ExitScan niet alsnog leest als “de achterafversie van dezelfde scan”.

#### Definition of done
- [ ] ExitScan heeft een eigen koopbare identiteit.
- [ ] ExitScan en RetentieScan zijn inhoudelijk complementair zonder productverwarring.
- [ ] Websitecopy ondersteunt de aangescherpte productinhoud in plaats van die te overschrijven.

#### Validation
- [ ] Productpagina en rapport gebruiken compatibele producttaal.
- [ ] ExitScan onderscheidt zich helder van generieke exit-interviews en RetentieScan.
- [ ] Geen publieke copy suggereert meer methodische zekerheid dan de output echt kan dragen.

---

### Milestone 7 - Consistency Pass Across Shared And Exit-Specific Layers
Dependency: Milestone 6

#### Tasks
- [ ] Leg vast wat shared blijft:
  - survey shell
  - SDT-bouwstenen
  - organisatiefactoren
  - generieke primitives
- [ ] Leg vast wat ExitScan-specifiek moet zijn:
  - productcopy
  - surveycontext
  - interpretatielogica
  - dashboardduiding
  - rapportduiding
  - commerciële framing
- [ ] Loop inconsistenties na tussen:
  - backend product definition
  - frontend product definition
  - marketing products
  - dashboard helpers
  - report content
  - methodology docs
- [ ] Verwijder of markeer legacy-logica die ExitScan nog als “oude generieke module” laat lezen.
- [ ] Breng terminology drift terug tot één vaste woordenlijst.

#### Definition of done
- [ ] Shared en ExitScan-specifieke verantwoordelijkheden zijn expliciet vastgelegd.
- [ ] Er zijn geen zichtbare productinhoudelijke tegenstrijdigheden meer tussen lagen.
- [ ] ExitScan gebruikt één consistente woordenlijst.

#### Validation
- [ ] Dezelfde term betekent in survey, dashboard, rapport en website hetzelfde.
- [ ] Geen RetentieScan-logica lekt onbedoeld in ExitScan-productduiding.
- [ ] De productscheiding is ook voor een implementer duidelijk genoeg.

---

### Milestone 8 - QA, Tests And Acceptance For ExitScan Sharpening
Dependency: Milestone 7

#### Tasks
- [ ] Voeg unit tests toe voor ExitScan-specifieke logica:
  - preventability / werksignaal
  - exit-specifieke score-uitleg
  - vertrekredenmapping
- [ ] Voeg integration tests toe voor ExitScan-survey submit:
  - verplichte velden
  - optionele velden
  - nieuwe contextvragen
  - opgeslagen outputstructuur
- [ ] Voeg report/dashboard parity checks toe:
  - labels
  - thresholds
  - terminology
  - managementduiding
- [ ] Voeg content QA-checks toe:
  - geen overclaiming
  - ExitScan/RetentieScan-grens helder
  - geen generieke surveytaal op cruciale plekken
- [ ] Voeg acceptatiechecks toe per laag:
  - survey
  - scoring
  - dashboard
  - rapport
  - marketingcopy

#### Definition of done
- [ ] De aangescherpte ExitScan-keten is testbaar en reviewbaar.
- [ ] Kernlogica en kerncopy zijn beschermd tegen regressie.
- [ ] Acceptatie is productmatig en methodisch, niet alleen technisch.

#### Validation
- [ ] Tests dekken de belangrijkste ExitScan-paden.
- [ ] Reviewchecklist kan milestone voor milestone gebruikt worden.
- [ ] ExitScan is na uitvoering inhoudelijk scherper, niet alleen mooier geformuleerd.

---

## 3. Execution Breakdown By Subsystem

### Product Promise And Commercial Layer
- [ ] ExitScan-propositie herformuleren naar sterke maar verdedigbare vertrekduiding.
- [ ] Productpagina, productenoverzicht en relevante homepage-copy alignen op dezelfde belofte.
- [ ] ExitScan scherper afzetten tegen RetentieScan zonder overlap of defensieve taal.

### Survey
- [ ] ExitScan-vragenlijst herijken op echte vertrekduiding.
- [ ] Ontbrekende contextvraag toevoegen rond eerdere signalering/bespreekbaarheid.
- [ ] Open vraag explicieter richten op wat de organisatie had moeten begrijpen of eerder had moeten zien.
- [ ] Survey compact houden; geen blueprint-inflatie zonder directe productwinst.

### Scoring And Methodiek
- [ ] ExitScan-frictielogica inhoudelijk eigen maken.
- [ ] Preventability/werksignaal volledig alignen met huidige zachtere interpretatie.
- [ ] Score-uitleg vereenvoudigen en begrenzen.
- [ ] Exit reason mapping, aanvullende reasons en beïnvloedbaarheid opnieuw op productwaarde toetsen.

### Dashboard
- [ ] ExitScan-dashboard minder generiek maken.
- [ ] Top vertrekbeeld, topfactor en werksignaal prominenter maken.
- [ ] Focusvragen herschrijven naar exitgerichte managementverificatie.
- [ ] Methodologiekaart ExitScan-specifieker maken.

### Rapport
- [ ] ExitScan-rapportstructuur aanscherpen op managementbruikbaarheid.
- [ ] Vertrekduiding explicieter naar voren halen.
- [ ] Signaalwaarde/belevingsscore-taal versimpelen waar nodig.
- [ ] Werkhypothesen en vervolgstappen sterker aan ExitScan koppelen.

### Shared vs Exit-Specific Boundaries
- [ ] Vastleggen wat shared mag blijven en wat product-specifiek moet zijn.
- [ ] Oude drift tussen docs, backend en frontend wegwerken.
- [ ] Terminologie op één woordenlijst brengen.

### QA And Acceptance
- [ ] Unit-, integration- en parity-tests toevoegen voor ExitScan.
- [ ] Productcopy-reviewchecklist toevoegen.
- [ ] Acceptatiecriteria per milestone expliciet afvinken.

---

## 4. Current Product Risks

### Methodische risico’s
- [ ] ExitScan belooft publiekelijk soms meer “waarom” dan de huidige methodiek echt ondersteunt.
- [ ] De survey mist nu nog een expliciete laag rond eerdere signalering/bespreekbaarheid van vertrek.
- [ ] De huidige primaire + aanvullende vertrekredenen zijn bruikbaar, maar nog vrij grof voor sterkere vertrekduiding.
- [ ] ExitScan gebruikt nog technisch en inhoudelijk deels een generieke risicologica, wat de productidentiteit verzwakt.
- [ ] `preventability` is inhoudelijk al terughoudender geworden, maar die zachtere logica is nog niet overal doorvertaald.

### Commerciële risico’s
- [ ] ExitScan kan nog te veel lezen als “een nette exit-enquête” in plaats van een scherp managementproduct.
- [ ] De publieke belofte “begrijp waarom mensen zijn vertrokken” kan bij kritische kopers te hard voelen als het rapport vooral signalen en hypothesen geeft.
- [ ] Het onderscheid met losse exitgesprekken of intern HR-rapport is nog niet overal maximaal voelbaar.

### UX- en interpretatierisico’s
- [ ] Dashboard en rapport gebruiken meerdere begrippen naast elkaar (`frictiescore`, `belevingsscore`, `signaalwaarde`, `sterk werksignaal`) die nog niet overal intuïtief samenkomen.
- [ ] Het dashboard toont ExitScan nog te weinig als vertrekduiding-flow; het voelt nog deels als gedeeld score-dashboard.
- [ ] `signaalverdeling` en factorranking zijn bruikbaar, maar kunnen zonder sterkere ExitScan-context te abstract blijven.
- [ ] Segment deep dive kan nog te makkelijk als verklaring worden gelezen in plaats van als beschrijvende verdieping.

### Risico op overlap of verwarring met RetentieScan
- [ ] ExitScan en RetentieScan delen nu veel structuren en taal, waardoor ExitScan soms te weinig eigen productkarakter toont.
- [ ] ExitScan gebruikt nog teveel generieke “signaal”-taal die ook bij RetentieScan past.
- [ ] Op website- en portfolio-niveau bestaat risico dat ExitScan en RetentieScan als “dezelfde scan in twee tijdsmomenten” worden gelezen.

### Risico dat ExitScan te veel als generieke exit-enquête leest
- [ ] Surveyflow is compact, maar mist nog een paar vragen die duidelijk maken dat ExitScan meer doet dan standaard exitfeedback verzamelen.
- [ ] Dashboarddecision support legt nu nog onvoldoende uit wat management met ExitScan-specifieke output moet doen.
- [ ] Rapportstructuur is degelijk, maar moet nog duidelijker de stap maken van score-overzicht naar vertrekduiding en handelingsperspectief.

---

## 5. Open Questions

- [ ] Willen we in ExitScan expliciet een vraag toevoegen over **eerdere signalering / kenbaar maken van vertrekintentie**, zoals oudere blueprint-documenten al suggereerden?
- [ ] Willen we `frictiescore` als hoofdterm houden, of moet ExitScan naar een iets bestuurlijker label zonder productherkenning te verliezen?
- [ ] Moet `signaalwaarde` zichtbaar blijven in het rapport/dashboard, of alleen waar het echt prioriteringswaarde heeft?
- [ ] Moet ExitScan op de website primair als **baseline-product** worden verkocht, met `Live` alleen secundair/op aanvraag?
- [ ] Willen we de huidige aanvullende vertrekredenen-checkboxes behouden, of vervangen door een scherpere exitcontext-opzet?
- [ ] Moet het dashboard een expliciete widget krijgen voor **top vertrekredenen** naast werkfactoren?
- [ ] Willen we in het rapport explicieter onderscheid maken tussen:
  - vertrekduiding
  - beïnvloedbaar werksignaal
  - externe / persoonlijke vertrekcontext?
- [ ] Willen we de methodologische taal later ook buiten het product meenemen in salesmateriaal en offerte-templates?

---

## 6. Follow-up Ideas

- [ ] Voeg later een compacte “ExitScan leeswijzer” toe als one-pager voor HR/MT.
- [ ] Voeg een expliciete buyer-facing vergelijking toe tussen ExitScan en traditionele exitgesprekken.
- [ ] Overweeg later een compacte follow-up meetvorm voor ExitScan Live, maar alleen nadat Baseline inhoudelijk strak staat.
- [ ] Voeg later een betere voorbeeldset toe van ExitScan-output in salesmateriaal.
- [ ] Overweeg later een expliciete glossary in dashboard/rapport als termen toch te zwaar blijven.

---

## 7. Out of Scope For Now

- [ ] Grote backend-herarchitectuur buiten wat direct nodig is voor ExitScan-inhoud.
- [ ] Nieuwe producten of nieuwe surveyfamilies.
- [ ] Volledige herbouw van RetentieScan.
- [ ] Grote redesign van de complete marketingwebsite buiten ExitScan-positionering.
- [ ] Self-service uitbreiding, pricing-experimenten of CRM-werk.
- [ ] Nieuwe predictive modellen of externe benchmarklogica.
- [ ] Volledige report engine rewrite.
- [ ] Grote database- of tenancy-refactors die niet direct ExitScan-inhoud raken.

---

## 8. Defaults Chosen

- [ ] ExitScan blijft een **terugkijkend product voor vertrekduiding**, niet een causale diagnose of voorspeller.
- [ ] ExitScan mag commercieel sterk blijven, maar claimt primair:
  - terugkerende patronen
  - werkfactoren
  - vertrekduiding
  - managementprioritering
- [ ] RetentieScan wordt alleen als vergelijkingskader gebruikt om ExitScan scherper te positioneren.
- [ ] Shared SDT- en organisatiefactorbouwstenen blijven bestaan tenzij ze ExitScan-inhoud aantoonbaar verzwakken.
- [ ] Geen survey-uitbreiding zonder directe winst voor ExitScan-duiding.
- [ ] `STERK_WERKSIGNAAL / GEMENGD_WERKSIGNAAL / BEPERKT_WERKSIGNAAL` blijft de voorkeursrichting boven hard “redbaar / niet-redbaar”.
- [ ] ExitScan-dashboard en ExitScan-rapport moeten inhoudelijk dezelfde taal spreken, ook als de diepte verschilt.
- [ ] De uitvoeringsvolgorde is:
  1. positionering
  2. survey
  3. scoring
  4. dashboard
  5. rapport
  6. commerciële alignment
  7. consistency pass
  8. tests en acceptance
