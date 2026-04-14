# RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN

## 1. Summary

Dit plan scherpt **RetentieScan** aan als vroegsignaalproduct voor behoud op groeps- en segmentniveau.

De kernrichting is:

- RetentieScan blijft expliciet **geen brede MTO** en **geen individuele voorspeller**
- survey, scoring, dashboard, rapport en marketing gebruiken dezelfde producttaal
- ExitScan blijft het primaire product voor terugkijkende vertrekduiding
- RetentieScan blijft complementair als vroegsignaalroute voor actieve medewerkers

Belangrijkste implementatiekeuzes in deze versie:

- producttaal is aangescherpt richting `groepssignaal`, `vroegsignaal` en `beinvloedbare werkfactoren`
- methodologie benoemt expliciet dat het retentiesignaal in v1 een **gelijkgewogen werkmodel** is
- dashboard- en rapportcopy benadrukken verificatie en prioritering, niet voorspelling of causaliteit
- marketingcopy maakt scherper onderscheid tussen RetentieScan, ExitScan en MTO-achtige alternatieven
- regressietests beschermen RetentieScan-positionering en methodologische terughoudendheid beter

Bewust niet uitgevoerd in deze ronde:

- geen extra surveyvragen of extra surveyblokken toegevoegd; de huidige survey is bewust compact gehouden
- geen inhoudelijke herweging van het retentiesignaal; v1 blijft gelijkgewogen tot er echte pilotkalibratie is
- geen verdere rapportarchitectuur- of playbookcentralisatie buiten de directe alignment
- geen handmatige QA-checklist als apart artefact toegevoegd; dit blijft vervolgstap

## 2. Milestones

### Milestone 0 - Freeze RetentieScan Baseline And Evidence Map
Dependency: none

#### Tasks
- [x] Huidige RetentieScan-keten vastgelegd in survey, scoring, dashboard, rapport, marketing en tests
- [x] RetentieScan-specifieke versus shared lagen in kaart gebracht
- [x] ExitScan alleen als vergelijkingskader gebruikt
- [x] Uitvoeringsvolgorde gekozen: eerst inhoud en methodiek, daarna copy en QA

#### Definition of done
- [x] Baseline is gebaseerd op huidige repo-observaties
- [x] Grootste inconsistenties tussen backend, frontend, rapport en marketing zijn benoemd
- [x] Uitvoering start vanuit codebase-truth

#### Validation
- [x] Observaties zijn herleidbaar naar code, templates en tests
- [x] De ExitScan/RetentieScan-grens is scherp genoeg beschreven

### Milestone 1 - RetentieScan Positioning And Core Product Promise
Dependency: Milestone 0

#### Tasks
- [x] Kernbelofte aangescherpt naar vroegsignalering op behoud op groeps- en segmentniveau
- [x] Vaste woordenlijst vastgelegd rond retentiesignaal, stay-intent, vertrekintentie en werkfactoren
- [x] Productgrens met ExitScan strakker gemaakt
- [x] Predictieve en MTO-achtige drift in copy verminderd
- [x] Buyer-facing beschrijving aangescherpt voor baseline en ritme

#### Definition of done
- [x] RetentieScan heeft een consistente productbelofte over website, dashboard en rapport
- [x] RetentieScan leest niet meer als MTO-light of voorspelproduct
- [x] ExitScan en RetentieScan overlappen niet in hun kernbelofte

#### Validation
- [x] Kerncopy suggereert geen individuele voorspelling of causaliteit
- [x] Portfoliovergelijking blijft commercieel scherp en inhoudelijk eerlijk

### Milestone 2 - Survey Content Sharpness And Submission Logic
Dependency: Milestone 1

#### Tasks
- [x] Survey-intro en privacyframing aangescherpt op groepssignalen
- [x] Open tekst explicieter gericht op behoudsversterking in werk, leiding en samenwerking
- [x] Submit- en signal-helptekst aligned met RetentieScan-betekenis
- [ ] Eventuele extra survey-input alleen toevoegen als directe productwinst nodig blijkt

#### Definition of done
- [x] Survey leest als behoudsscan
- [x] Open tekst ondersteunt behoudsprioritering beter
- [x] Submit-logica sluit aan op productbetekenis

#### Validation
- [x] Survey vermijdt generieke tevredenheidsframing
- [x] Vragen en signalen blijven compact en bruikbaar voor actieve medewerkers

### Milestone 3 - Scoring, Signal Profile And Methodology Alignment
Dependency: Milestone 2

#### Tasks
- [x] Methodologiecopy expliciet gemaakt over v1, gelijkgewogen basis en groepsniveau
- [x] Signal-pagecopy aligned met niet-predictieve interpretatie
- [x] Dashboardcopy aligned met verificatie en prioritering
- [ ] Eventuele inhoudelijke herweging later pas na pilotkalibratie beoordelen

#### Definition of done
- [x] RetentieScan heeft een helderder scoreverhaal van surveyinput naar managementsignaal
- [x] Signal profile en aanvullende signalen zijn inhoudelijk beter uitlegbaar
- [x] Methodologische nuance is zichtbaar zonder commerciële waarde te verliezen

#### Validation
- [x] Geen scoreterm suggereert individuele voorspelling of harde causaliteit
- [x] Dashboard, rapport en methodologiekaart gebruiken dezelfde kernbetekenis

### Milestone 4 - Dashboard Decision Support And Actionability
Dependency: Milestone 3

#### Tasks
- [x] Beslislaag aangescherpt op groepssignaal en verificatie
- [x] Profielkaarten verschoven van `Risicoprofiel` naar `Groepsbeeld`
- [x] Signaalbanden explicieter gekaderd als groepsniveau
- [x] Dashboardcopy sterker gericht op signaleren, valideren en handelen

#### Definition of done
- [x] Dashboard leest duidelijker als RetentieScan-dashboard
- [x] HR ziet sneller wat eerst geverifieerd moet worden
- [x] De beslislaag blijft voorzichtig waar data nog beperkt is

#### Validation
- [x] Dashboard gebruikt geen persoonsgerichte voorspeltaal
- [x] Actie- en validatielaag voelt specifiek voor behoudssignalering

### Milestone 5 - Report Structure And Management Readability
Dependency: Milestone 4

#### Tasks
- [x] Rapportmethodologie en signal-pagecopy aangescherpt
- [x] Groepsniveau en niet-predictieve duiding explicieter gemaakt
- [x] V1-kalibratiegrenzen benoemd zonder de rapportwaarde te ondermijnen
- [ ] Verdere rapportstructuurherziening kan in een vervolgronde worden verdiept

#### Definition of done
- [x] Rapport voelt sterker als managementinstrument voor behoudsprioritering
- [x] Rapporttaal is methodisch eerlijk en commercieel bruikbaar

#### Validation
- [x] Rapport en dashboard vertellen hetzelfde verhaal in andere diepte
- [x] V1-beperkingen zijn zichtbaar maar niet verlammend

### Milestone 6 - Commercial Alignment And Portfolio Boundary
Dependency: Milestone 5

#### Tasks
- [x] Publieke RetentieScan-copy aangescherpt op productpagina, overview, pricing en FAQ
- [x] Kernkoopreden scherper gemaakt: geen MTO, geen predictor, wel vroegsignaal
- [x] ExitScan leidend gehouden als primair product
- [x] Baseline en ritme commercieel duidelijker gekaderd

#### Definition of done
- [x] RetentieScan heeft een eigen koopbare identiteit
- [x] Portfolioverhouding met ExitScan is commercieel helder
- [x] Publieke copy ondersteunt de echte productmethodiek

#### Validation
- [x] Productpagina en rapport gebruiken compatibele producttaal
- [x] Geen copy laat RetentieScan lezen als generieke survey of individuele score

### Milestone 7 - Consistency Pass Across Shared And Retention-Specific Layers
Dependency: Milestone 6

#### Tasks
- [x] Drift tussen backend en frontend methodologiecopy verkleind
- [x] Calibration note in frontend en backend verder aligned
- [x] Terminologie rond groepssignaal, MTO en predictor verscherpt
- [ ] Verdere centralisatie van dubbele playbookcopy later beoordelen

#### Definition of done
- [x] Shared en RetentieScan-specifieke taal liggen dichter bij elkaar
- [x] Geen zichtbare tegenspraak tussen marketing, dashboard en rapport

#### Validation
- [x] Nieuwe productbeslissingen hebben een duidelijkere thuisbasis
- [x] Dezelfde term betekent in hoofdlagen hetzelfde

### Milestone 8 - QA, Tests And Acceptance For RetentieScan
Dependency: Milestone 7

#### Tasks
- [x] Backendtests uitgebreid voor retention methodologie en signal page
- [x] Frontendtests uitgebreid voor retention dashboard framing
- [x] Marketingpositioneringstests uitgebreid voor RetentieScan
- [ ] Handmatige QA-checks kunnen in een vervolgronde verder worden uitgewerkt

#### Definition of done
- [x] Kernlogica, kerncopy en kerninterpretatie zijn beter beschermd tegen regressie
- [x] Acceptatie bestrijkt inhoud, methodiek en commercie beter

#### Validation
- [x] Nieuwe tests vormen samen een sluitender regressieset voor RetentieScan-positionering
- [x] RetentieScan kan scherper blijven zonder terug te glijden naar generieke surveytaal

## 3. Execution Breakdown By Subsystem

### Product Promise And Positioning
- [x] RetentieScan herformuleerd als vroegsignaalproduct voor behoud op groepsniveau
- [x] ExitScan leidend gehouden als primair product
- [x] Predictieve en MTO-achtige drift expliciet teruggedrongen

### Survey And Submission Flow
- [x] Surveyframing aangescherpt op groepssignalen
- [x] Open tekst scherper gericht op behoudsverbetering
- [x] Signal-help en submitbetekenis aligned

### Scoring And Methodology
- [x] Retentiesignaal gekaderd als gelijkgewogen v1-werkmodel
- [x] Methodologie expliciet niet-predictief en niet-causaal gemaakt
- [x] Signal profiles sterker verbonden aan verificatie en prioritering

### Dashboard And Actionability
- [x] Beslislaag aangescherpt op groepsbeeld
- [x] Signaalbanden explicieter als groepsniveau geframed
- [x] Dashboardtaal sterker gericht op signaleren, valideren en handelen

### Report And Management Readability
- [x] Rapportmethodologie en signal page aligned met dashboardtaal
- [x] Groepsinformatie expliciet gemaakt
- [x] V1-kalibratielogica benoemd waar relevant

### Commercial Copy And Portfolio
- [x] Productpagina, overview, pricing en FAQ op één lijn gebracht
- [x] RetentieScan scherper onderscheiden van MTO en individuele predictor
- [x] Baseline en ritme beter gekaderd

### QA, Tests And Acceptance
- [x] Backend-, frontend- en copytests uitgebreid
- [ ] Handmatige interpretatie-QA kan verder worden uitgewerkt
- [x] Validatie-output blijft methodische onderbouwing, geen directe marketingclaim

## 4. Current Product Risks

- [x] Het retentiesignaal blijft in v1 een heuristisch, gelijkgewogen werkmodel
- [x] Signal profiles en playbooks blijven inhoudelijk bruikbaar maar nog niet volledig op pilotdata geijkt
- [x] Open-tekstclustering blijft een eenvoudige signaleringslaag
- [x] RetentieScan moet actief bewaakt blijven tegen drift richting MTO of predictor
- [x] Report/dashboard/playbook-pariteit vraagt blijvende regressiebescherming

## 5. Open Questions

- [ ] Willen we de huidige gelijkgewogen methodiek in een volgende ronde inhoudelijk herwegen?
- [ ] Moet de trendlaag later centraler worden in RetentieScan?
- [ ] Willen we playbooks later sterker laten afhangen van echte pilotkalibratie?
- [ ] Moeten er aparte handmatige acceptatiechecks komen voor copy die predictor- of MTO-drift verbieden?

## 6. Follow-up Ideas

- [ ] Voeg een compacte RetentieScan-leeswijzer toe voor HR en MT
- [ ] Voeg een expliciete vergelijking toe tussen RetentieScan, MTO en individuele risicomodellen
- [ ] Gebruik latere pilotdata om thresholds en playbooks te ijken
- [ ] Breid trend- en opvolglogica uit zodra herhaalmetingen vaker voorkomen

## 7. Out of Scope For Now

- [x] Nieuwe predictive modellen of individuele retention scores
- [x] Grote platform- of dashboardherbouw
- [x] Volledige herpositionering van ExitScan buiten wat nodig is voor de grens met RetentieScan
- [x] Nieuwe surveyfamilies of portfolio-uitbreidingen buiten RetentieScan
- [x] Methodische claims die alleen na echte pilotdata verantwoord zijn

## 8. Defaults Chosen

- [x] ExitScan blijft het primaire product; RetentieScan blijft complementair
- [x] RetentieScan blijft een groeps- en segmentinstrument, geen individuele predictor
- [x] De huidige survey blijft compact tenzij extra input directe productwinst oplevert
- [x] De huidige thresholds en gelijkgewogen basis blijven v1-default
- [x] Playbooks en signal profiles blijven v1-prioriteringshulp, geen interventiemachine
- [x] Dashboard en rapport moeten dezelfde producttaal spreken
- [x] Shared bouwstenen blijven alleen staan waar ze RetentieScan niet verzwakken
