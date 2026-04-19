# RETENTIESCAN_V1_1_VALIDATION_PLAN.md

## 1. Summary

Dit plan maakt van **RetentieScan v1.1** een expliciet **validatietraject**, niet nog een algemene product- of copyronde.

Boundary note:

- Waar dit plan `risk_score`, `avg_risk_score` of `stay_intent_score` noemt, gaat het om raw/storage- of scripttermen en niet om canonieke productlabels.
- Gebruik in interpretatie- of buyer-facing lagen altijd:
  - `retentiesignaal`
  - `gem. retentiesignaal`
  - `stay-intent`
- Vanaf 2026-04-18 bestaat hiervoor ook een non-breaking aliaslaag in response/view-models:
  - `signal_score`
  - `avg_signal_score`
  - `direction_signal_score`

Uitgangspunt op basis van de huidige repo:

- ExitScan blijft het primaire product voor terugkijkende vertrekduiding.
- RetentieScan is al inhoudelijk aangescherpt als complementair vroegsignaalproduct voor behoud op groeps- en segmentniveau.
- Survey, scoring, dashboard, rapport en commerciele copy zijn nu grotendeels op dezelfde productbetekenis gebracht.
- De repo bevat al een echte validatie-infrastructuur:
  - codebook
  - reliability- en factorchecks
  - constructvaliditeit
  - dataset-export
  - readiness-assessment
  - pragmatische validatie-koppeling
  - dummy- en synthetische pilotflows
- De huidige empirische basis is echter nog niet sterk genoeg om RetentieScan v1.1 als `gevalideerd` te positioneren:
  - de bestaande validatieruns draaien vooral op synthetische of dummydata
  - pragmatische validatie is nog afhankelijk van echte follow-up uitkomsten
  - de live productdatabase bevat nog nauwelijks echte RetentieScan-data

Daarom kiest dit plan voor:

- **geen nieuwe productverbreding**
- **geen nieuwe pseudo-wetenschappelijke claimlaag**
- **wel een strak validatieprogramma rond aannames, metrics, interpretatie, uitkomstkoppeling en acceptatiecriteria**
- **wel onderscheid tussen wat nu al verantwoord kan worden aangescherpt en wat pas na echte data harder mag worden gemaakt**

Leidende doelstelling:

- RetentieScan v1.1 moet methodisch, commercieel, UX-matig en operationeel geloofwaardig genoeg worden om verder op te schalen, zonder harder te claimen dan de data dragen.

## 2. Milestones

### Milestone 0 - Freeze RetentieScan v1.1 Baseline And Validation Scope
Dependency: none

- [x] Uitgevoerd op 2026-04-14: repo-baseline, scopegrens en source-of-truth-lagen vastgelegd in dit plan plus ondersteunende validatiedocumenten.

#### Tasks
- [x] Leg de huidige v1.1-baseline repo-gebaseerd vast over:
  - survey
  - scoring
  - dashboard
  - rapport
  - marketing
  - tests
  - validatiescripts
- [x] Documenteer welke onderdelen al inhoudelijk aangescherpt zijn in eerdere trajecten:
  - product review/test
  - live test
  - product sharpening
- [x] Leg expliciet vast wat in dit traject wel validatie is en wat niet:
  - methodische validatie
  - pragmatische validatie
  - interpretatievalidatie
  - commerciele claimdiscipline
- [x] Maak het onderscheid scherp tussen:
  - productgereedheid
  - validatiegereedheid
  - bewijsniveau
- [x] Leg de huidige bron van waarheid vast voor RetentieScan v1.1:
  - frontend productmodule
  - backend retention module
  - dashboard helperlogica
  - rapportgenerator
  - analysis/retention validatielaag

#### Definition of done
- [x] Er is een controleerbaar baselinebeeld van RetentieScan v1.1 en zijn huidige validatie-infrastructuur.
- [x] Het traject is expliciet afgebakend als validatieprogramma en niet als brede productherbouw.
- [x] De belangrijkste aannames en onzekerheden zijn herleidbaar naar de actuele repo.

#### Validation
- [x] Observaties zijn gekoppeld aan concrete repo-bestanden.
- [x] ExitScan wordt alleen als positioneringsreferentie gebruikt.
- [x] De huidige status van echte versus synthetische validatiebasis is expliciet benoemd.

### Milestone 1 - Validation Claim Boundary And Evidence Model
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: evidence ladder, claimgrenzen, internal-versus-external terminology en dataset-provenance-regels vastgelegd en in scripts verankerd.

#### Tasks
- [x] Leg vast welke uitspraken over RetentieScan v1.1 nu al verantwoord zijn:
  - groepssignaal
  - vroegsignalering
  - prioritering
  - verificatiespoor
  - managementinput
- [x] Leg vast welke uitspraken expliciet nog niet verantwoord zijn:
  - gevalideerde voorspeller van vrijwillig verloop
  - causale factorclaim
  - bewezen effect op lager verloop
  - individuele risicovoorspelling
- [x] Definieer een evidence ladder voor v1.1:
  - inhoudelijk plausibel
  - intern consistent
  - testmatig beschermd
  - statistisch eerste indicatie
  - pragmatisch gekoppeld aan follow-up uitkomsten
- [x] Vertaal die evidence ladder naar product- en buyer-facing claimregels.
- [x] Leg vast welke claims pas na echte data of follow-up harder mogen worden.

#### Definition of done
- [x] Er is een expliciete claimgrens voor RetentieScan v1.1.
- [x] Het team weet welk bewijsniveau bij welke productclaim hoort.
- [x] Marketing, dashboard en rapport kunnen later op dezelfde claimdiscipline worden beoordeeld.

#### Validation
- [x] Geen v1.1-claim vraagt bewijs dat in de huidige repo of datasets nog ontbreekt.
- [x] `Vroegsignaal` en `prioritering` zijn duidelijk toegestaan; `voorspeller` en `causaliteit` niet.
- [x] ExitScan/RetentieScan-grens blijft inhoudelijk rustig.

### Milestone 2 - Survey And Measurement Model Validation
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: surveyblokken, derived metrics en hun bedoelde outputlagen vastgelegd in een vaste meet- en interpretatiemap.

#### Tasks
- [x] Beoordeel de huidige RetentieScan-survey methodisch per blok:
  - SDT
  - organisatiefactoren
  - UWES-3
  - turnover intention
  - stay-intent
  - open behoudsvraag
- [x] Leg per blok vast:
  - waarom het erin zit
  - wat het moet verklaren of ondersteunen
  - wat het juist niet mag claimen
- [x] Maak zichtbaar welke afgeleide maten v1.1 gebruikt:
  - retention_signal_score
  - engagement_score
  - turnover_intention_score
  - stay_intent_score_norm
  - signal_profile
- [x] Beoordeel of elk item- en schaalblok voldoende direct aansluit op latere dashboard- en rapportinterpretatie.
- [x] Benoem expliciet welke surveyonderdelen sterk genoeg zijn om te behouden en welke later mogelijk herzien moeten worden.
- [x] Definieer welke schaal- of itemproblemen eerst met echte data getoetst moeten worden voordat inhoudelijke herweging zinvol is.

#### Definition of done
- [x] Elke surveymodule heeft een expliciete rol in de latere productoutput.
- [x] De meetlogica van survey naar afgeleide signalen is begrijpelijk en controleerbaar.
- [x] Het plan maakt onderscheid tussen inhoudelijke geschiktheid en empirische bevestiging.

#### Validation
- [x] Elk surveyblok is te koppelen aan concrete outputlagen in dashboard of rapport.
- [x] Geen blok blijft in v1.1 `meelopen` zonder duidelijke analytische functie.
- [x] Eventuele latere schaalherzieningen worden pas gepland na echte datatoetsing.

### Milestone 3 - Scoring And Derived Signal Validation
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-14: scoringsemantiek, internal-versus-external terms en metricprioriteiten vastgelegd; validatiescripts waarschuwen nu expliciet voor niet-echte datasets.

#### Tasks
- [x] Bevestig en documenteer het huidige v1.1 scoremodel:
  - gelijkgewogen retentiesignaal
  - signal bands
  - signal profile
  - aanvullende signalen naast de hoofdscore
- [x] Leg vast welke interne technische termen zichtbaar mogen blijven en welke alleen intern horen:
  - risk_score
  - avg_risk_score
  - risk_band
  - retention_signal_score
- [x] Beoordeel per afgeleide metric wat het vereiste validatieniveau is:
  - descriptief
  - constructmatig
  - pragmatisch
- [x] Gebruik de bestaande reliability- en factorchecks om een eerste beoordelingskader te maken voor:
  - SDT-schalen
  - organisatiefactoren
  - engagement
  - turnover intention
- [x] Maak een expliciete prioriteitenlijst voor welke afgeleide maten het eerst echte data nodig hebben.
- [x] Leg vast dat scoreherweging, threshold-herziening en profielhernoeming pas volgen na echte empirische observaties.

#### Definition of done
- [x] Het scoreverhaal van ruwe input naar managementsignaal is expliciet en toetsbaar.
- [x] Interne risk-contracten en externe signaaltaal zijn logisch van elkaar gescheiden.
- [x] Er is een heldere beslisregel voor wat nu descriptief blijft en wat later zwaarder gevalideerd moet worden.

#### Validation
- [x] Het plan behandelt het retentiesignaal als v1-werkmodel, niet als bewezen predictor.
- [x] De belangrijkste metrics hebben een expliciet validatiepad.
- [x] Thresholds en signal profiles worden niet zonder datagrondslag `harder` gemaakt.

### Milestone 4 - Dashboard And Interpretation Validation
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-14: dashboardlagen, interpretatiegrenzen, huidige n-drempels en handmatige QA-checklist vastgelegd in een vaste referentie.

#### Tasks
- [x] Beoordeel de dashboardleesvolgorde methodisch:
  - beslisoverzicht
  - managementduiding
  - trend
  - analyse/driverlaag
  - focusvragen
  - playbooks
  - segment-playbooks
  - methodologiekaart
- [x] Leg vast welke dashboardblokken nu al verantwoord zijn als:
  - samenvatting
  - prioritering
  - verificatiehint
  - eerste actieframe
- [x] Leg vast welke dashboardblokken nog duidelijk als v1-heuristiek gelezen moeten worden:
  - signal profiles
  - action playbooks
  - segment-playbooks
  - open-tekstthema's
- [x] Definieer interpretatiegrenzen per laag:
  - wat management eruit mag halen
  - wat HR eerst moet valideren
  - wat niet als bewijs mag worden gelezen
- [x] Beoordeel of de huidige minimum n-drempels voldoende beschermend zijn voor veilige weergave.
- [x] Definieer handmatige interpretatie-QA voor RetentieScan-dashboardgebruik.

#### Definition of done
- [x] De dashboardlaag heeft een expliciet interpretatiekader.
- [x] V1-heuristiek en meer stabiele managementinformatie zijn zichtbaar van elkaar gescheiden.
- [x] Het implementatieteam weet welke dashboardlagen extra voorzichtig geframed moeten blijven.

#### Validation
- [x] Geen dashboardblok impliceert individuele voorspelling of causale zekerheid.
- [x] De huidige drempels voor detailweergave en patroonanalyse zijn bewust en toetsbaar.
- [x] De UX ondersteunt verificatie eerst, niet schijnzekerheid eerst.

### Milestone 5 - Report Validation And Management Readability
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-14: rapportonderdelen, heuristische delen en paritygrenzen vastgelegd als vaste lees- en reviewregels voor RetentieScan.

#### Tasks
- [x] Beoordeel de RetentieScan-rapportstructuur als managementinstrument:
  - summary
  - signal profile
  - aanvullende behoudssignalen
  - open-antwoordthema's
  - hypothesen
  - playbooks
  - segment deep dive
  - vervolgstappen
- [x] Leg per rapportonderdeel vast:
  - descriptieve waarde
  - interpretatierisico
  - benodigde validatiegraad
- [x] Maak expliciet welke rapportpassages v1.1 mogen blijven als:
  - managementduiding
  - werkhypothese
  - verificatiespoor
  - praktische actieroute
- [x] Leg vast welke rapportpassages eerst aangescherpte wording of extra bewijs nodig hebben voordat ze later sterker mogen worden.
- [x] Definieer parity-eisen tussen dashboard en rapport voor dezelfde signalen en termen.
- [x] Maak een acceptatiecheck voor rapporteerbaarheid op methodische eerlijkheid en commerciele bruikbaarheid.

#### Definition of done
- [x] Het rapport heeft een expliciet validatiekader per type inhoud.
- [x] Dashboard en rapport zijn beoordeelbaar op dezelfde interpretatieregels.
- [x] Werkhypothesen en playbooks zijn duidelijk gepositioneerd als v1-hulpmiddel, niet als empirisch bewezen route.

#### Validation
- [x] Rapporttaal blijft bestuurlijk bruikbaar zonder wetenschappelijke overclaiming.
- [x] Dezelfde signalen betekenen in dashboard en rapport hetzelfde.
- [x] Segment- en open-tekstblokken blijven beschrijvend en verificerend.

### Milestone 6 - Real Data Readiness And Validation Dataset Program
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: real-data contract, templategebruik, minimale metadata en follow-up outcome-koppeling vastgelegd in een aparte uitvoeringsreferentie.

#### Tasks
- [x] Leg vast welke echte data minimaal nodig is voor v1.1-validatie:
  - complete responses
  - campaignspreiding
  - department
  - role_level
  - meetmomenten
  - follow-up uitkomsten
- [x] Gebruik de bestaande readinesslogica als basis voor harde datadrempels:
  - reliability
  - factorcontrole
  - segmentvergelijking
  - pragmatische validatie
- [x] Definieer het minimale echte validatiedatasetcontract:
  - response-level export
  - segment-level aggregatie
  - outcomes-template
  - meetperiode
- [x] Maak expliciet onderscheid tussen:
  - synthetische data voor infrastructuur
  - dummy pilotdata voor workflow
  - echte operationele data voor validatie
- [x] Bepaal welke metadata-invulling bij respondentimport verplicht of sterk aanbevolen moet worden voor latere validatie.
- [x] Leg vast hoe echte follow-up uitkomsten gekoppeld worden:
  - vrijwillige uitstroom
  - verzuim
  - follow-up engagement
  - eventuele vervolgmeting

#### Definition of done
- [x] Er is een expliciet dataprogramma voor echte RetentieScan-validatie.
- [x] Het team weet welke datasets bruikbaar zijn voor welke validatiestap.
- [x] De overgang van demo-infrastructuur naar echte validatie is besluitklaar.

#### Validation
- [x] Synthetische validatieruns worden niet meer verward met echte empirische bewijsvoering.
- [x] De minimale metadata voor segmentvalidatie is expliciet vastgelegd.
- [x] Follow-up uitkomsten zijn concreet genoeg gespecificeerd om later echt te koppelen.

### Milestone 7 - Statistical And Pragmatic Validation Execution Framework
Dependency: Milestone 6

- [x] Uitgevoerd op 2026-04-14: statistische en pragmatische validatielagen gespecificeerd en de leidende scripts kregen provenance-aware guardrails.

#### Tasks
- [x] Structureer het validatieprogramma in 3 lagen:
  - interne meetkwaliteit
  - construct-/samenhangvalidatie
  - pragmatische uitkomstvalidatie
- [x] Definieer voor elke laag de leidende analyses:
  - alpha/omega
  - item-total correlations
  - floor/ceiling effects
  - factor checks
  - correlaties tussen SDT, engagement, stay-intent, turnover intention en retentiesignaal
  - correlaties tussen segmentsignalen en follow-up uitkomsten
- [x] Leg vast wanneer een bevinding leidt tot:
  - alleen documenteren
  - copy of interpretatie aanscherpen
  - score- of itemmodel herzien
  - claimgrens verlagen
- [x] Definieer hoe signalen uit echte validatie teruggekoppeld worden naar productkeuzes.
- [x] Maak een beslisboom voor v1.1:
  - voldoende voor doorpakken
  - bruikbaar maar claimgrens behouden
  - productmatig bruikbaar maar methodisch nog te vroeg voor opschaling
- [x] Maak het raamwerk geschikt voor herhaalruns op nieuwe datasets.

#### Definition of done
- [x] Er is een uitvoerbaar validatiekader voor statistische en pragmatische toetsing.
- [x] Analyse-uitkomsten hebben vooraf gedefinieerde productconsequenties.
- [x] Het traject is herhaalbaar en niet afhankelijk van ad-hoc interpretatie.

#### Validation
- [x] Elke analysecategorie heeft een duidelijke rol in besluitvorming.
- [x] Uitkomsten leiden niet automatisch tot productwijziging zonder vooraf gedefinieerde interpretatieregel.
- [x] Het kader voorkomt cherry-picking of te optimistische lezing van vroege data.

### Milestone 8 - Acceptance Criteria For A Credible RetentieScan v1.1
Dependency: Milestone 7

- [x] Uitgevoerd op 2026-04-14: acceptatiecriteria, blockerlogica en evidence sources vastgelegd voor een geloofwaardige v1.1-beslissing.

#### Tasks
- [x] Definieer expliciete acceptatiecriteria voor v1.1 op vier assen:
  - methodisch
  - productmatig
  - UX/interpreteerbaarheid
  - commercieel
- [x] Leg vast wat minimaal waar moet zijn voordat v1.1 als `geloofwaardig genoeg om verder op te schalen` telt.
- [x] Maak een acceptatiematrix voor:
  - survey
  - scoring
  - dashboard
  - rapport
  - marketing/claims
  - validatiedata
- [x] Definieer welke open punten acceptabel zijn in v1.1 en welke blockers zijn.
- [x] Koppel acceptatiecriteria aan regressietests, handmatige QA en validatierapportages.
- [x] Leg vast welke vervolgronde logisch wordt na v1.1:
  - claimverfijning
  - scoreherweging
  - segmentkalibratie
  - outcome-based playbook-ijking

#### Definition of done
- [x] Er is een besluitklaar acceptatiekader voor RetentieScan v1.1.
- [x] Opschaling kan later worden beoordeeld zonder nieuwe fundamentele interpretatievragen.
- [x] Het verschil tussen `bruikbaar product` en `sterk gevalideerd product` is expliciet gemaakt.

#### Validation
- [x] Acceptatiecriteria zijn streng genoeg om pseudo-validatie te voorkomen.
- [x] v1.1 kan commercieel bruikbaar zijn zonder dat methodische volwassenheid wordt overschat.
- [x] De volgende uitvoerder kan op basis hiervan direct een implementatie- en validatieronde starten.

## 3. Execution Breakdown By Subsystem

### Product Promise And Claim Discipline
- [x] Leg vast welke buyer-facing claims nu al verantwoord zijn.
- [x] Definieer harde verboden claims voor predictor-, causaliteits- en MTO-drift.
- [x] Koppel elk claimtype aan een bewijsniveau.

### Survey And Measurement Model
- [x] Valideer de rol van elk surveyblok in het latere productverhaal.
- [x] Leg vast welke schalen eerst echte data nodig hebben voordat ze herzien worden.
- [x] Maak de meetketen van item naar afgeleid signaal expliciet.

### Scoring And Derived Metrics
- [x] Bevestig het huidige gelijkgewogen v1-model als tijdelijk werkmodel.
- [x] Leg validatieprioriteit vast per metric en profiel.
- [x] Houd interne risk-contracten gescheiden van externe signaaltaal.

### Dashboard And Interpretation
- [x] Maak een interpretatiekader voor beslislaag, analyse, trend, playbooks en open tekst.
- [x] Bevestig drempels voor veilige weergave en patroonanalyse.
- [x] Voeg handmatige interpretatieacceptatie toe naast technische tests.

### Report And Management Readability
- [x] Beoordeel elk rapportonderdeel op descriptieve waarde versus interpretatierisico.
- [x] Borg parity tussen dashboard- en rapportduiding.
- [x] Houd hypothesen en playbooks expliciet in v1-werkmodus.

### Data And Validation Infrastructure
- [x] Gebruik bestaande export-, readiness- en validation-scripts als basis.
- [x] Maak een minimaal echt validatiedatasetcontract.
- [x] Specificeer follow-up outcomes voor pragmatische validatie.

### QA, Testing And Acceptance
- [x] Houd bestaande regressietests als beschermlaag voor inhoud en claims.
- [x] Voeg validatiegerichte acceptance checks toe voor metrics, interpretatie en claimdiscipline.
- [x] Definieer beslisregels voor doorontwikkeling na eerste echte validatieruns.

## 4. Current Product Risks

### Validatierisico's
- [x] De huidige validatierapporten draaien vooral op synthetische of dummydata.
- [x] Echte pragmatische validatie is nog niet mogelijk zonder follow-up uitkomsten.
- [x] Er is nog onvoldoende echte productdata om RetentieScan v1.1 empirisch `sterk onderbouwd` te noemen.

### Methodische risico's
- [x] Het retentiesignaal blijft een gelijkgewogen v1-werkmodel.
- [x] Signal profiles, thresholds en playbooks zijn inhoudelijk plausibel maar nog niet outcome-geijkt.
- [x] Sommige schaalblokken moeten pas op echte data echt worden beoordeeld op consistentie en stabiliteit.

### Interpretatie- En Dashboardrisico's
- [x] De dashboardlaag is al rijk en bruikbaar, maar kan zonder strakke framing te hard gelezen worden.
- [x] Trend-, segment- en open-tekstlagen kunnen meer zekerheid suggereren dan nu verantwoord is.
- [x] Signaalprofielen en actieroutes kunnen te snel als `bewijs` gelezen worden in plaats van als verificatiespoor.

### Commerciele risico's
- [x] RetentieScan is commercieel scherper geworden, maar moet actief bewaakt blijven tegen predictor- of MTO-associaties.
- [x] Een te vroege validatieclaim kan buyer trust later juist ondermijnen.
- [x] `v1.1` kan te snel gelezen worden als methodisch afgerond in plaats van verantwoord opgeschaald.

### Risico Dat v1.1 Te Snel Te Hard Geclaimd Wordt
- [x] Interne risk-terminologie kan extern onbedoeld harder ogen dan bedoeld.
- [x] Een eerste correlatie of nette validatierun op synthetische data mag niet als marktclaim worden gebruikt.
- [x] Productgereedheid, live gereedheid en validatiegereedheid moeten expliciet gescheiden blijven.

## 5. Open Questions

- [ ] Welke minimale echte RetentieScan-dataset geldt intern als voldoende voor de eerste echte v1.1-validatieronde?
- [ ] Welke follow-up uitkomsten zijn operationeel het meest haalbaar om als eerste te koppelen: vrijwillige uitstroom, verzuim, follow-up engagement of herhaalmeting?
- [ ] Willen we interne `risk_score`-taal in een latere ronde ook technisch verder terugdringen, of voorlopig alleen extern afschermen?
- [ ] Welke drempel geldt voor commerciele wording: alleen repo- en infrastructuur-gereed, of pas na eerste echte validatierun?
- [ ] Moeten signal profiles later behouden blijven, hernoemd worden of pas na echte data opnieuw worden ontworpen?
- [ ] Willen we segment deep dive in v1.1 als add-on houden zolang outcome-ijking nog beperkt is?
- [ ] Welke uitkomsten zijn blokkerend voor opschaling en welke slechts reden voor claimdiscipline?

## 6. Follow-up Ideas

- [ ] Voeg later een expliciete evidence matrix toe voor sales, website en rapport.
- [ ] Voeg een handmatige `interpretatie-eerlijkheid` review toe voor dashboard en rapport.
- [ ] Overweeg later inhoudelijke herweging van factoren zodra echte outcome-data beschikbaar komt.
- [ ] Voeg later snapshot- of golden-copy tests toe voor validatiekritieke rapport- en dashboardcopy.
- [ ] Bouw later een structurele feedbacklus van echte pilotuitkomsten terug naar playbooks en segmentduiding.

## 7. Out of Scope For Now

- [x] Grote productverbreding of verbouwing van RetentieScan naar bredere MTO-functionaliteit.
- [x] Nieuwe predictive modellen of individuele retention scores.
- [x] Hardere causaliteitsclaims of ROI-claims zonder echte uitkomstvalidatie.
- [x] Grote backend-herarchitectuur die niet nodig is voor validatie of interpretatieborging.
- [x] Volledige redesign van dashboard of rapport buiten validatie- en geloofwaardigheidsdoelen.
- [x] Grote ExitScan-wijzigingen buiten het nodig houden van de productgrens.

## 8. Defaults Chosen

- [x] ExitScan blijft het primaire product; RetentieScan blijft complementair.
- [x] RetentieScan v1.1 wordt beoordeeld als groeps- en segmentinstrument, niet als individuele predictor.
- [x] Het huidige retentiesignaal blijft voorlopig een gelijkgewogen v1-werkmodel.
- [x] Bestaande synthetische en dummy validatieruns tellen als infrastructuurbewijs, niet als marktbewijs.
- [x] Dashboard, rapport en commerciele laag moeten aan dezelfde claimgrens voldoen.
- [x] Signaalprofielen, playbooks en open-tekstclustering blijven in v1.1 hulpmiddelen voor verificatie en prioritering.
- [x] Echte follow-up outcomes zijn vereist voor pragmatische validatie.
- [x] Pas na eerste echte validatieruns mogen herweging, threshold-aanpassing of hardere claims serieus worden overwogen.
