# RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md

## 1. Summary

Dit plan scherpt **RetentieScan** verder aan als complementair product naast **ExitScan**, op basis van de **huidige repo-implementatie** in survey, scoring, dashboard, rapport en commerciële laag.

De hoofdrichting is:

- RetentieScan moet nog duidelijker lezen als **vroegsignaalproduct voor behoud op groeps- en segmentniveau**.
- RetentieScan moet commercieel scherp blijven, maar nergens lezen als **brede MTO**, **individuele predictor** of **pseudo-wetenschappelijke vertrekvoorspeller**.
- Survey, scoring, dashboard, rapport en marketing moeten **exact dezelfde productbetekenis** dragen.
- ExitScan blijft het primaire product voor terugkijkende vertrekduiding; RetentieScan blijft de complementaire route voor actieve medewerkers.

Belangrijkste observaties uit de huidige codebase:

- De huidige RetentieScan-propositie is al sterker dan een eerste concept:
  - groeps- en segmentniveau
  - geen individuele voorspeller
  - geen brede MTO
  - SDT-werkbeleving plus beinvloedbare werkfactoren
  - aanvullende signalen via bevlogenheid, stay-intent en vertrekintentie
- De survey is bewust compact en methodisch verdedigbaar:
  - 12 SDT-items
  - 6 organisatiefactoren
  - 3 UWES-items
  - 2 turnover-intention-items
  - 1 stay-intent-item
  - 1 open behoudsvraag
- De huidige scoring- en methodologielaag is helder als v1-werkmodel, maar nog niet volledig rustig in taal:
  - het product verkoopt `retentiesignaal`
  - de implementatie en aggregatie gebruiken op meerdere plekken nog `risk_score`, `avg_risk_score` en `Risicoprofiel`
  - dat creëert subtiele drift richting risico- of predictortaal
- Dashboard en rapport zijn inhoudelijk al rijk:
  - groepsbeelden
  - managementblokken
  - trend
  - segment-specifieke playbooks
  - clustering van open antwoorden
  - action playbooks
  maar die rijkdom vraagt nog een scherpere leesvolgorde en consequente productspecifieke terminologie
- Frontend en backend zijn al productmodule-gedreven, maar er bestaat nog duplicatie tussen:
  - frontend dashboardduiding
  - backend report content
  - report helperlogica
  - commerciële copy
  waardoor drift in termen, nuance en claims waarschijnlijk blijft zonder expliciete paritylaag
- De commerciële laag is meestal sterk, maar nog niet overal even precies:
  - sommige formuleringen zijn methodisch netjes terughoudend
  - andere formuleringen impliceren net iets te veel over welke factoren behoud "waarschijnlijk het meest beïnvloeden"

Dit plan kiest daarom voor:

- **geen nieuw product**
- **geen verbreding naar MTO**
- **geen grote backend-herarchitectuur**
- **wel een volledige inhoudelijke, methodische, commerciële en UX-matige aanscherping van RetentieScan**
- **wel expliciete regressiebescherming op producttaal, methodologische terughoudendheid en ExitScan/RetentieScan-grens**

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - zichtbare producttaal aangescherpt over website, dashboard, rapport, survey-intro, privacy en DPA
  - `Risicoprofiel` vervangen door `Signaalprofiel` in RetentieScan-rapportage
  - zichtbare predictor-, MTO- en risicotaal verder teruggedrongen in RetentieScan-copy en managementduiding
  - survey compact gehouden; geen extra survey-items toegevoegd
  - parity- en content-QA toegevoegd over frontend, backend, rapport en marketingcopy
- Bewust niet uitgevoerd in deze ronde:
  - geen nieuwe surveyblokken of productverbreding
  - geen interne hernoeming van backend-contracten zoals `risk_score` of `avg_risk_score`
  - geen grote report-engine of backend-herarchitectuur
  - geen validatie op pilotdata of predictive modellering

## 2. Milestones

### Milestone 0 - Freeze RetentieScan Baseline And Sharpening Target
Dependency: none

- [x] Uitgevoerd op 2026-04-14: baseline, hoofdspanningen en scopegrenzen zijn repo-gebaseerd vastgelegd; ExitScan alleen als vergelijkingskader gebruikt.

#### Tasks
- [ ] Leg de huidige RetentieScan-keten vast op basis van de repo:
  - publieke propositie
  - surveyflow
  - scoring en supplemental signals
  - dashboardinterpretatie
  - rapportduiding
  - commerciële positionering
- [ ] Documenteer expliciet wat nu al sterk en onderscheidend is aan RetentieScan.
- [ ] Maak zichtbaar waar de huidige repo nog drift heeft tussen:
  - `retentiesignaal`
  - `risk_score`
  - `risicoprofiel`
  - `vroegsignaal`
  - `behoud onder druk`
- [ ] Leg de productgrens met ExitScan vast:
  - ExitScan = terugkijkend
  - RetentieScan = vroegsignalering
  - combinatie = portfolio, geen inhoudelijke overlap
- [ ] Leg vast welke spanning in deze ronde wél wordt opgelost en welke bewust later blijft liggen.

#### Definition of done
- [ ] Er is één controleerbaar baselinebeeld van de huidige RetentieScan-keten.
- [ ] De belangrijkste inconsistenties zijn herleidbaar naar actuele repo-bestanden.
- [ ] De sharpening-scope is strak genoeg om uitvoering zonder scopelek te doen.

#### Validation
- [ ] Baseline is te herleiden naar survey, backend, frontend, rapport en marketingcopy.
- [ ] ExitScan wordt alleen als vergelijkingskader gebruikt.
- [ ] De hoofdspanning tussen producttaal en implementatietaal is expliciet benoemd.

### Milestone 1 - Product Promise And Portfolio Boundary
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: kernbelofte, portfolio-grens en buyer-facing woordenlijst aangescherpt in marketingcopy, productpagina, dashboard en rapporttaal.

#### Tasks
- [ ] Herschrijf de kernbelofte van RetentieScan naar één vaste, verdedigbare lijn:
  - vroegsignalering op behoud
  - groeps- en segmentniveau
  - beinvloedbare werkfactoren
  - geen MTO
  - geen individuele predictor
- [ ] Leg een vaste woordenlijst vast voor publieke en managementgerichte RetentieScan-termen.
- [ ] Beoordeel waar huidige copy te zwak, te generiek of juist te ambitieus is.
- [ ] Schrap of herschrijf copy die RetentieScan laat lezen als:
  - brede tevredenheidsmeting
  - algemene cultuurdiagnose
  - individuele risicoscore
  - gevalideerde vrijwillig-verloopvoorspeller
- [ ] Maak de verhouding met ExitScan commercieel en inhoudelijk scherper zonder defensief te worden.
- [ ] Leg de vaste kooplogica vast voor:
  - baseline
  - ritme / vervolgmeting
  - combinatie met ExitScan

#### Definition of done
- [ ] RetentieScan heeft één consistente productbelofte over website, dashboard en rapport.
- [ ] De productgrens met ExitScan is expliciet en rustig.
- [ ] De kernbelofte blijft commercieel scherp zonder onware claims.

#### Validation
- [ ] Een HR-manager kan in 10 seconden uitleggen wat RetentieScan wel en niet is.
- [ ] Geen kerncopy suggereert individuele voorspelling of causaliteit.
- [ ] RetentieScan leest niet meer als MTO-light.

### Milestone 2 - Survey Content And Input Model Sharpness
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: survey compact gehouden, intro/open vraag/helptekst aangescherpt en bewust geen extra survey-items toegevoegd.

#### Tasks
- [ ] Beoordeel de huidige RetentieScan-survey module voor module:
  - SDT
  - organisatiefactoren
  - bevlogenheid
  - vertrekintentie
  - stay-intent
  - open verbetersignaal
- [ ] Bevestig welke compactheid productmatig sterk is en behouden moet blijven.
- [ ] Onderzoek of er ontbrekende input is die directe productwinst oplevert voor:
  - scherpere behoudssignalering
  - betere managementduiding
  - duidelijker validatie- of actieperspectief
- [ ] Beoordeel of huidige vraagformuleringen voldoende sturen op:
  - behoud
  - werkbeleving
  - beïnvloedbare context
  en niet op generieke tevredenheid
- [ ] Herzie de open vraag en omringende guidance op managementwaarde:
  - wat helpt behoud het meest
  - hoe leesbaar is dit later als groepssignaal
  - hoe voorkom je klacht- of MTO-drift
- [ ] Leg expliciet vast welke surveyuitbreidingen bewust níet worden gedaan zolang v1 compact en verdedigbaar moet blijven.

#### Definition of done
- [ ] De RetentieScan-survey meet precies wat het product later wil duiden.
- [ ] Elke surveyvraag heeft een duidelijke rol in dashboard of rapport.
- [ ] De vragenlijst blijft compact genoeg voor de huidige productvorm.

#### Validation
- [ ] Elke surveymodule is te koppelen aan een concrete outputlaag.
- [ ] Geen vraag voelt als algemene tevredenheidsvulling.
- [ ] Eventuele extra surveyinput is alleen opgenomen bij directe productwinst.

### Milestone 3 - Scoring, Signal Semantics And Methodology Alignment
Dependency: Milestone 2

- [x] Uitgevoerd op 2026-04-14: zichtbare `risk`- en predictor-drift teruggedrongen; methodologie en signaaltaal tussen frontend, backend en rapport verder gelijkgetrokken.

#### Tasks
- [ ] Trek de relatie strak tussen:
  - retentiesignaal
  - risk score / average risk
  - signaalband
  - signal profile
  - stay-intent
  - vertrekintentie
  - bevlogenheid
- [ ] Beslis welke termen intern technisch mogen blijven en welke extern zichtbaar horen te zijn.
- [ ] Herschrijf de methodologielaag zodat `v1`, `gelijkgewogen werkmodel` en `groepsniveau` overal dezelfde betekenis dragen.
- [ ] Beoordeel of de huidige thresholds en profielnamen inhoudelijk sterk genoeg zijn voor managementduiding.
- [ ] Herzie uitleg rond topfactoren, aanvullende signalen en signal profile om predictor- of causaliteitsdrift verder te verminderen.
- [ ] Maak expliciet wat RetentieScan wel levert:
  - prioritering
  - verificatiespoor
  - richting voor vervolgactie
  en wat niet:
  - diagnostiek
  - persoonsbeoordeling
  - bewezen causaliteit
- [ ] Leg vast waar methodologische duplicatie tussen frontend, backend en report-content moet worden teruggedrongen.

#### Definition of done
- [ ] RetentieScan heeft één logisch scoreverhaal van surveyinput naar managementsignaal.
- [ ] Externe producttaal en interne implementatietaal botsen niet meer zichtbaar.
- [ ] Methodologische nuance is scherp, verdedigbaar en niet verlamd.

#### Validation
- [ ] Geen kernterm suggereert individuele voorspelling of gevalideerde causaliteit.
- [ ] Dezelfde signaalterm betekent in dashboard en rapport hetzelfde.
- [ ] `risk`-taal is alleen zichtbaar waar die productmatig verantwoord is.

### Milestone 4 - Dashboard Decision Support And UX Readability
Dependency: Milestone 3

- [x] Uitgevoerd op 2026-04-14: RetentieScan-dashboardtaal en hero-/managementduiding aangescherpt naar verificatie, aandachtspunten en samenvattend groepssignaal.

#### Tasks
- [ ] Maak de bovenste dashboardlaag nog duidelijker RetentieScan-specifiek:
  - waar staat behoud onder druk
  - hoe stevig is het groepsbeeld
  - wat moet eerst gevalideerd worden
  - welke actie volgt logisch daarna
- [ ] Beoordeel of de huidige samenvattingskaarten, groepsbeelden en managementblokken de juiste leesvolgorde hebben.
- [ ] Herschrijf generieke dashboardtaal die nog te veel als algemene score- of risicodashboard leest.
- [ ] Trek de lijn tussen:
  - primair signaal
  - aanvullende signalen
  - focusvragen
  - playbooks
  - trend
  - segment-duiding
  zodat de gebruiker niet eerst door detail moet om de hoofdlijn te begrijpen
- [ ] Beoordeel de rol van `Risicoprofiel` en soortgelijke termen in het huidige dashboard.
- [ ] Maak de methodologiekaart en insight warnings explicieter RetentieScan-waardig:
  - groepsinput
  - privacy-first
  - verificatie
  - beschrijvende segmentduiding
- [ ] Beoordeel of de open-antwoordclustering en segment-playbooks de managementread versterken of juist cognitieve ruis toevoegen.

#### Definition of done
- [ ] Het dashboard leest als RetentieScan-dashboard en niet als generiek campagnedashboard.
- [ ] Een HR-manager ziet sneller wat eerst te valideren en prioriteren is.
- [ ] Detailsecties ondersteunen de hoofdlijn in plaats van die te verdringen.

#### Validation
- [ ] Het eerste scherm geeft bruikbare beslisondersteuning zonder rapport nodig te hebben.
- [ ] De RetentieScan-leesvolgorde is zichtbaar anders dan ExitScan.
- [ ] Dashboardtaal blijft consistent met methodologie en productpagina.

### Milestone 5 - Report Structure And Management Readability
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-14: rapporttaal aangescherpt op managementread, `Signaalprofiel`, behoudsplaybooks en minder risico-/predictorframing.

#### Tasks
- [ ] Herzie de rapportlijn op managementbruikbaarheid:
  - management summary
  - behoudsbeeld
  - werkfactoren
  - aanvullende signalen
  - hypotheses
  - playbooks
  - segmenten
  - vervolgstappen
- [ ] Maak explicieter wat het rapport uniek maakt ten opzichte van:
  - een brede MTO-rapportage
  - een losse pulse-output
  - een persoonsgericht risicorapport
- [ ] Herschrijf passages waar `risico`, `profiel` of factorbetekenis te hard of te generiek leest.
- [ ] Maak de samenhang tussen retentiesignaal, stay-intent, vertrekintentie en bevlogenheid nog beter bestuurlijk leesbaar.
- [ ] Beoordeel of trend- en segmentsecties goed geprioriteerd zijn in de rapportvolgorde.
- [ ] Maak werkhypothesen en action playbooks expliciet RetentieScan-waardig:
  - eerst valideren
  - dan gericht handelen
  - geen schijnzekerheid
- [ ] Trek de methodologiepassage en signal page strak met de huidige implementatie, niet met latere validatieambities.

#### Definition of done
- [ ] Het rapport voelt als managementinstrument voor behoudsprioritering.
- [ ] Rapportstructuur en rapporttaal versterken de productbelofte.
- [ ] RetentieScan-rapport en dashboard vertellen hetzelfde verhaal in andere diepte.

#### Validation
- [ ] Een directielid kan de managementsamenvatting lezen zonder scorelogica te kennen.
- [ ] Rapporttermen botsen niet met dashboardtermen.
- [ ] V1-beperkingen zijn zichtbaar zonder dat de rapportwaarde instort.

### Milestone 6 - Commercial Layer, Buyer Confidence And Packaging Fit
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: productpagina, pricing, FAQ, overview, preview en portfolioverhaal op dezelfde RetentieScan-belofte aligned.

#### Tasks
- [ ] Herzie de publieke RetentieScan-copy op:
  - productpagina
  - productenoverzicht
  - homepage-context
  - pricing en FAQ waar relevant
- [ ] Maak RetentieScan scherper als koopbaar product:
  - waarom je dit koopt
  - wanneer baseline logisch is
  - wanneer ritme logisch is
  - waarom dit niet “een lichtere survey” is
- [ ] Herschrijf copy die nu te veel op algemene surveysoftware of MTO-logica leunt.
- [ ] Beoordeel of de pricing- en packagecopy de echte productinhoud voldoende ondersteunt.
- [ ] Maak de combinatie met ExitScan sterker als bewust portfolioverhaal, niet als cross-sell zonder inhoudelijke basis.
- [ ] Leg vast welke buyer-facing claims expliciet wel en niet gebruikt mogen worden.

#### Definition of done
- [ ] RetentieScan heeft een eigen koopbare identiteit.
- [ ] Commerciële copy ondersteunt de werkelijke methodiek.
- [ ] ExitScan en RetentieScan zijn samen logisch zonder productverwarring.

#### Validation
- [ ] Productpagina, pricing en rapport gebruiken compatibele producttaal.
- [ ] Geen buyer-facing tekst suggereert predictor- of MTO-eigenschappen.
- [ ] De baseline/ritme-logica is helder genoeg voor een kopende HR-manager.

### Milestone 7 - Shared Versus Retention-Specific Boundaries
Dependency: Milestone 6

- [x] Uitgevoerd op 2026-04-14: shared infrastructuur behouden; RetentieScan-specifieke terminologie, duiding en paritychecks expliciet aangescherpt zonder grote herarchitectuur.

#### Tasks
- [ ] Leg vast wat shared mag blijven:
  - survey shell
  - SDT-bouwstenen
  - organisatiefactoren
  - generieke dashboardprimitives
  - algemene campaign-orchestratie
- [ ] Leg vast wat RetentieScan-specifiek moet blijven:
  - productdefinitie
  - signal semantics
  - focusvragen
  - playbooks
  - rapportduiding
  - commerciële framing
- [ ] Breng duplicatie en driftkans in kaart tussen:
  - frontend retention module
  - backend retention module
  - report content
  - report helperlogica
  - marketingcopy
- [ ] Bepaal waar centralisatie nodig is en waar productspecifieke duplicatie acceptabel blijft.
- [ ] Breng de terminologie terug tot één vaste woordenlijst per laag.

#### Definition of done
- [ ] Shared en RetentieScan-specifieke verantwoordelijkheden zijn expliciet beschreven.
- [ ] Driftkans tussen dashboard en rapport is kleiner en zichtbaarder gemaakt.
- [ ] Een implementer kan daarna zonder producttwijfel doorwerken.

#### Validation
- [ ] Dezelfde term betekent in survey, dashboard, rapport en website hetzelfde.
- [ ] Geen ExitScan-logica of generieke risk-taal lekt onbedoeld in RetentieScan-duiding.
- [ ] Centralisatiekeuzes zijn inhoudelijk gemotiveerd en niet alleen technisch.

### Milestone 8 - QA, Tests And Acceptance For RetentieScan Sharpening
Dependency: Milestone 7

- [x] Uitgevoerd op 2026-04-14: unit-, parity- en acceptancechecks uitgebreid; frontend tests, backend tests, lint en build groen uitgevoerd.

#### Tasks
- [ ] Voeg unit tests toe of breid ze uit voor RetentieScan-specifieke logica:
  - signal profile
  - methodologiepayload
  - signal-page framing
  - dashboardduiding
- [ ] Voeg paritychecks toe tussen:
  - frontend definitie
  - backend definitie
  - dashboardteksten
  - reportteksten
  - marketingkritieke copy
- [ ] Voeg content-QA checks toe voor:
  - geen predictorclaim
  - geen MTO-drift
  - juiste ExitScan/RetentieScan-grens
  - consistente signaalterminologie
- [ ] Voeg acceptatiechecks toe per laag:
  - survey
  - scoring
  - dashboard
  - rapport
  - marketing
- [ ] Definieer een handmatige reviewcheck voor interpretatie en buyer-facing eerlijkheid.

#### Definition of done
- [ ] De aangescherpte RetentieScan-keten is testbaar en reviewbaar.
- [ ] Kernlogica en kerncopy zijn beschermd tegen regressie.
- [ ] Acceptatie is inhoudelijk, methodisch en commercieel tegelijk.

#### Validation
- [ ] Een wijziging in terminologie, thresholds of claims kan niet ongemerkt doorslippen.
- [ ] De belangrijkste RetentieScan-flow is afgedekt van survey tot rapporttaal.
- [ ] Het product is na uitvoering inhoudelijk scherper en beter beschermd.

## 3. Execution Breakdown By Subsystem

### Product Promise And Positioning
- [x] Uitgevoerd: vroegsignaalbelofte, ExitScan-grens en non-predictive framing zijn consistent aangescherpt.
- [ ] RetentieScan herformuleren naar één vaste vroegsignaalbelofte op groepsniveau.
- [ ] De grens met ExitScan opnieuw vastzetten in productcopy, dashboard en rapport.
- [ ] Predictor-, diagnose- en MTO-drift systematisch terugdringen.

### Survey And Input Contract
- [x] Uitgevoerd: survey compact gehouden en open tekst plus begeleidende surveycopy scherper gekoppeld aan behoudsduiding.
- [ ] De compacte survey behouden waar die productmatig sterk is.
- [ ] Alleen extra input toevoegen als die direct productwaarde geeft.
- [ ] Open tekst, stay-intent, vertrekintentie en bevlogenheid nog scherper aan behoudsduiding koppelen.

### Scoring And Methodiek
- [x] Uitgevoerd: methodologie, signaaluitleg en zichtbare scoretaal verder aligned; interne contracten bleven bewust technisch ongewijzigd.
- [ ] De taal rond retentiesignaal en risk intern en extern uitlijnen.
- [ ] Methodologie expliciet houden als v1 gelijkgewogen werkmodel.
- [ ] Signaalprofielen, signal bands en factorbetekenis inhoudelijk scherper uitleggen.

### Dashboard
- [x] Uitgevoerd: beslislaag en RetentieScan-specifieke managementduiding zijn aangescherpt.
- [ ] De beslislaag nog meer centraal zetten.
- [ ] De detaillaag laten volgen op de hoofdlijn in plaats van andersom.
- [ ] Trend, segmenten, open antwoorden en playbooks alleen laten lezen als gecontroleerde verdieping.

### Rapport
- [x] Uitgevoerd: rapporttaal, signaalprofiel en behoudsplaybooks zijn aangescherpt op managementbruikbaarheid.
- [ ] De rapportvolgorde aanscherpen op managementbruikbaarheid.
- [ ] Behoudsbeeld, aanvullende signalen en actieperspectief sterker verbinden.
- [ ] Risico- en predictorachtige taal verder terugbrengen.

### Commercial Layer
- [x] Uitgevoerd: productpagina, pricing, FAQ en marketingpreview spreken nu dezelfde RetentieScan-taal.
- [ ] Productpagina, pricing, FAQ en productoverview alignen op dezelfde productbelofte.
- [ ] Buyer confidence versterken zonder methodische overclaiming.
- [ ] Baseline, ritme en combinatie met ExitScan commercieel logischer kaderen.

### Shared Versus Product-Specific Boundaries
- [x] Uitgevoerd: drift tussen frontend, backend, rapport en marketing is verkleind via tekstalignering en paritytests.
- [ ] Vastleggen wat shared blijft en wat RetentieScan-specifiek moet zijn.
- [ ] Drift tussen frontend, backend, rapport en marketing verkleinen.
- [ ] Terminologielijst expliciet maken.

### QA And Acceptance
- [x] Uitgevoerd: regressiebescherming uitgebreid met frontend-tests, backend-tests, paritychecks, lint en buildvalidatie.
- [ ] Unit-, parity- en content-QA uitbreiden.
- [ ] Handmatige acceptatiecheck toevoegen voor interpretatie, buyer-facing eerlijkheid en productgrenzen.
- [ ] Regressiebescherming inrichten op methodische terughoudendheid en portfolio-consistentie.

## 4. Current Product Risks

### Methodische risico's
- [ ] RetentieScan is in v1 nog een gelijkgewogen werkmodel en niet pilot-geijkt.
- [ ] De huidige producttaal is vaak terughoudend, maar interne `risk`-terminologie kan die terughoudendheid ondergraven.
- [ ] De compacte survey houdt het product scherp, maar begrenst ook de bewijskracht en nuance.
- [ ] Open-antwoordclustering en playbooks zijn bruikbaar, maar nog niet empirisch gekalibreerd op echte pilotuitkomsten.

### Commerciele risico's
- [ ] Sommige copy suggereert impliciet net meer verklaringskracht dan de huidige methodiek draagt.
- [ ] RetentieScan kan nog te veel lezen als “slimme retentievoorspeller” als termen niet strak genoeg bewaakt blijven.
- [ ] Baseline, ritme en combinatie zijn commercieel logisch, maar vragen nog scherpere buyer-facing uitleg.

### UX- en interpretatierisico's
- [ ] Dashboard en rapport bevatten veel bruikbare lagen, maar de leesvolgorde kan nog te complex voelen.
- [ ] Detailsecties zoals trend, segment-playbooks en open antwoordthema's kunnen de hoofdlijn verdringen als framing niet strak genoeg is.
- [ ] `Risicoprofiel`-achtige taal kan verwarring geven met de publiek verkochte betekenis van RetentieScan.

### Risico op overlap of verwarring met ExitScan
- [ ] Gedeelde structuren en vergelijkbare managementtaal kunnen RetentieScan te veel als variant van ExitScan laten lezen.
- [ ] Portfolio-copy kan de verschillen tussen terugkijken en vroegsignaleren nog iets te plat maken.
- [ ] Zonder strakke grens kan de combinatie lezen als “twee vergelijkbare scans” in plaats van twee verschillende managementroutes.

### Risico dat RetentieScan te veel als generieke MTO of pseudo-voorspelling leest
- [ ] Brede tevredenheidsassociaties blijven op de loer door surveyvorm, factorensets en cultuur-/werkbelevingscopy.
- [ ] Predictorassociaties blijven op de loer door `risk`-taal, signaalprofielen en scherpere managementframing.
- [ ] Als survey, dashboard en rapport niet exact dezelfde nuance dragen, valt RetentieScan snel terug in een diffuus middengebied tussen MTO en predictor.

## 5. Open Questions

- [ ] Willen we `risk_score` en `Risicoprofiel` verder terugdringen uit buyer-facing en management-facing RetentieScan-lagen?
- [ ] Moet stay-intent zichtbaarder of juist compacter gepositioneerd worden binnen de managementread?
- [ ] Willen we de trendlaag centraler maken in RetentieScan of bewust secundair houden na de eerste baseline?
- [ ] Zijn de huidige signal profile-labels inhoudelijk sterk genoeg, of vragen ze een meer productmatige herformulering?
- [ ] Moet de open vraag nog explicieter sturen op behoudsversterking in werk, leiding en samenwerking?
- [ ] Welke duplicatie tussen frontend- en backendduiding accepteren we bewust, en welke moet echt worden gecentraliseerd?
- [ ] Willen we later een buyer-facing vergelijking toevoegen tussen RetentieScan, MTO en individuele risicomodellen?

## 6. Follow-up Ideas

- [ ] Voeg later een compacte RetentieScan leeswijzer toe voor HR en MT.
- [ ] Voeg later een expliciete buyer-facing vergelijking toe tussen RetentieScan, MTO en individuele voorspelmodellen.
- [ ] Gebruik toekomstige pilotdata om thresholds, signal profiles en playbooks scherper te ijken.
- [ ] Voeg later snapshot- of content-tests toe op rapport- en dashboardkritieke RetentieScan-copy.
- [ ] Overweeg later een glossarylaag als producttaal ondanks aanscherping nog te specialistisch blijft.

## 7. Out of Scope For Now

- [x] Bevestigd in deze uitvoeringsronde: geen productverbreding, geen grote herarchitectuur en geen predictive validatie buiten huidige v1-scope.

- [ ] Grote backend-herarchitectuur buiten wat direct nodig is voor RetentieScan-consistentie.
- [ ] Nieuwe producten, nieuwe surveyfamilies of verbreding naar algemene MTO-functionaliteit.
- [ ] Volledige herbouw van ExitScan buiten wat nodig is voor portfolio-afbakening.
- [ ] Nieuwe predictive modellen, benchmarks of wetenschappelijke claims zonder echte validatiebasis.
- [ ] Grote website-redesign buiten RetentieScan-positionering en directe productcopy.
- [ ] Volledige rewrite van report engine of dashboardframework.

## 8. Defaults Chosen

- [x] Bevestigd in deze uitvoeringsronde: ExitScan primair, RetentieScan complementair, compact, groepsgericht en methodisch terughoudend.

- [ ] ExitScan blijft het primaire product; RetentieScan blijft complementair.
- [ ] RetentieScan blijft een groeps- en segmentinstrument, geen individuele predictor.
- [ ] Het retentiesignaal blijft in deze ronde een v1 gelijkgewogen werkmodel.
- [ ] De survey blijft compact tenzij extra input directe productwinst oplevert.
- [ ] Dashboard en rapport moeten dezelfde producttaal spreken, ook als de diepte verschilt.
- [ ] Buyer-facing scherpte is gewenst, maar nooit ten koste van methodische eerlijkheid.
- [ ] De uitvoeringsvolgorde is:
- [ ] 1. productbelofte
- [ ] 2. survey
- [ ] 3. scoring en methodiek
- [ ] 4. dashboard
- [ ] 5. rapport
- [ ] 6. commerciële alignment
- [ ] 7. consistency pass
- [ ] 8. QA en acceptance
