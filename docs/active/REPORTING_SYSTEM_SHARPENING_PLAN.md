# REPORTING_SYSTEM_SHARPENING_PLAN.md

## 1. Summary

Dit plan scherpt het **rapportagesysteem van Verisight** aan op basis van de huidige repo-implementatie in backend, dashboard, productspecifieke report-content, marketingcopy en tests.

De hoofdrichting is:

- het rapport moet sneller als **managementinstrument** lezen en minder als survey-uitdraai
- **ExitScan** moet het sterkste en scherpste rapportproduct worden voor terugkijkende vertrekduiding
- **RetentieScan** moet complementair blijven als vroegsignaalrapport voor behoud op groeps- en segmentniveau
- dashboard, rapport en websitecopy moeten **één inhoudelijke lijn** spreken
- productspecifieke rapportduiding moet uit de juiste productmodules komen, niet verspreid of impliciet in losse shared helpers blijven hangen
- methodologische nuance moet geloofwaardigheid beschermen zonder de commerciële bruikbaarheid van de rapporten te verzwakken

Belangrijkste repo-observaties:

- `backend/report.py` is nu de centrale rapport-engine en bevat veel shared layoutlogica, maar ook nog veel productinhoudelijke beslissingen
- productspecifieke report-content bestaat al, maar is asymmetrisch:
  - ExitScan heeft een lichte payloadlaag
  - RetentieScan heeft een rijkere payloadlaag met signal profile copy en playbooks
- de frontend-dashboardlaag rekent en duidt op meerdere plekken opnieuw, waardoor drift tussen dashboard en rapport een structureel risico blijft
- de dashboard decision-supportlaag is al aangescherpt; de rapportlaag is nu de meest logische open vervolgstap
- de stats- en report-keten is functioneel stabiel en getest, maar de parity tussen rapport, dashboard en marketing wordt nog niet centraal genoeg afgedwongen

Dit plan kiest daarom voor:

- **geen nieuwe producten**
- **geen herontwerp van scoringformules**
- **geen volledige report-engine rewrite**
- **wel een gerichte herstructurering van de rapportlaag**
- **wel expliciete productspecifieke rapportidentiteit voor ExitScan en RetentieScan**
- **wel regressiebescherming op terminologie, managementread en parity**

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - productspecifieke report-content contracts toegevoegd voor managementsamenvatting, signaalduiding, hypothesen en vervolgstappen
  - `backend/report.py` aangescherpt als shared report kernel met minder impliciete productcopy in shared code
  - ExitScan-managementread en signaalpagina bestuurlijker gemaakt rond vertrekbeeld, meespelende factoren, eerdere signalering en eerste managementvraag
  - RetentieScan-managementread rustiger gemaakt rond groepsbeeld, aanvullende behoudssignalen, verificatie en opvolging
  - frontend productdefinities aangescherpt zodat dashboard, rapport en websitecopy dezelfde kerntermen gebruiken
  - regressiebescherming toegevoegd via backend report payload-tests, paritytests en bestaande PDF smoke-routes
  - planbestand en prompt-checklist bijgewerkt als repo-source-of-truth
- Bewust niet als apart deliverable uitgevoerd:
  - geen los paritymatrix-document; parity is praktisch vastgelegd in productspecifieke definities, report-content en tests
  - geen report-engine rewrite of visual uplift-programma buiten de scope van dit plan
  - geen hernoeming van opgeslagen response-contracten of interne `risk`-velden buiten zichtbare rapporttaal
  - geen aparte backend lintstap, omdat de repo daarvoor geen aparte lintconfiguratie bevat

## 2. Milestones

### Milestone 0 - Freeze Reporting Baseline And Ownership Model
Dependency: none

- [x] Uitgevoerd op 2026-04-14: baseline, ownership model, shared versus productspecifieke rapportverantwoordelijkheden en parity-risico's zijn in dit plan repo-gebaseerd vastgelegd.

#### Tasks
- [ ] Leg de huidige rapportketen vast als baseline:
  - survey submit
  - scoring output
  - pattern detection
  - dashboard decision support
  - PDF-rapport
  - marketingclaims rond output
- [ ] Documenteer expliciet welke rapportverantwoordelijkheden nu shared zijn en welke nu al productspecifiek zijn.
- [ ] Leg vast waar de huidige rapportlaag inhoudelijk in `backend/report.py` zit en waar die al via productspecifieke modules wordt geïnjecteerd.
- [ ] Leg vast waar frontend en backend nu parallel dezelfde interpretatie opnieuw opbouwen.
- [ ] Gebruik ExitScan als primaire referentie voor gewenste rapportkwaliteit; gebruik RetentieScan als complementair vergelijkingskader.

#### Definition of done
- [ ] Er is één controleerbaar baselinebeeld van het huidige rapportagesysteem.
- [ ] Shared versus product-specifieke rapportverantwoordelijkheden zijn expliciet beschreven.
- [ ] De belangrijkste parity- en driftpunten tussen backend, dashboard en marketing zijn benoemd.

#### Validation
- [ ] Baseline is direct te herleiden naar actuele repo-bestanden en tests.
- [ ] ExitScan/RetentieScan-grens in rapportage is scherp genoeg om scopelek te voorkomen.
- [ ] Het plan vertrekt vanuit echte implementatie, niet vanuit algemene rapporttheorie.

---

### Milestone 1 - Reporting Contract And Product Module Boundaries
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: vaste productspecifieke report-content builders toegevoegd; shared kernel en productmodules hebben nu scherpere grenzen zonder route- of opslagbreuk.

#### Tasks
- [ ] Herstructureer de rapportarchitectuur conceptueel naar:
  - shared report kernel voor layout, aggregatie en rendering
  - productspecifieke contentcontracten voor managementduiding, signaalduiding en vervolgstappen
- [ ] Maak één vaste interne report-content contractlaag per product, zodat `backend/report.py` niet langer impliciet producttaal bepaalt waar dat productspecifiek hoort te zijn.
- [ ] Verplaats productspecifieke narratieve beslissingen uit shared code naar de productmodules waar dat logisch is.
- [ ] Definieer welke secties shared blijven:
  - cover layout
  - response-aggregatie
  - generieke tabellen/grafieken
  - minimale methodology shell
- [ ] Definieer welke secties productmodules moeten aanleveren:
  - managementsamenvatting framing
  - signal page framing
  - hypotheses framing
  - repeat/next-step copy
  - product-specifieke waarschuwings- en leesregels
- [ ] Behoud backwards compatibility van de report route en campaign report generation API.

#### Important interfaces and contract changes
- [ ] Standaardiseer de productspecifieke report-module interface op een vaste set payload builders in plaats van ad-hoc optionele hooks.
- [ ] Houd externe HTTP-routes gelijk:
  - `/api/campaigns/{id}/report`
  - `/api/internal/campaigns/{id}/report`
- [ ] Houd `CampaignStats` en opgeslagen `SurveyResponse.full_result` compatibel; dit traject verandert presentatie en interpretatielaag, niet het opslagcontract.

#### Definition of done
- [ ] Het is voor een implementer duidelijk welke rapportbeslissingen in shared code horen en welke in productmodules.
- [ ] `backend/report.py` krijgt een rustiger verantwoordelijkheidsscope.
- [ ] Productidentiteit kan daarna scherper worden zonder layout of routing te dupliceren.

#### Validation
- [ ] Geen productspecifieke managementcopy blijft onnodig in shared report code hangen.
- [ ] De report-engine kan beide producten blijven renderen zonder branch-explosie.
- [ ] Contractwijzigingen blijven intern en breken geen bestaande routes of tests.

---

### Milestone 2 - ExitScan Report Identity And Management Read
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: ExitScan-managementsamenvatting, signaalduiding, hypothese-intro en vervolgstappen zijn aangescherpt naar vertrekduiding en bestuurlijke prioritering.

#### Tasks
- [ ] Maak ExitScan expliciet het sterkste managementrapport voor terugkijkende vertrekduiding.
- [ ] Herschrijf de ExitScan management summary zodat die eerst antwoord geeft op:
  - welk vertrekbeeld keert terug
  - welke werkfactoren springen eruit
  - hoe breed het werksignaal is
  - welke managementvraag nu eerst telt
- [ ] Maak de signaalpagina voor ExitScan sterker als vertrekduiding-laag:
  - hoofdreden
  - meespelende redenen
  - eerdere signalering
  - werksignaal
  - bestuurlijke lezing
- [ ] Maak ExitScan-hypothesen explicieter managementwaardig:
  - gericht op toetsbare vertrekduiding
  - geen schijnzekerheid
  - direct inzetbaar in MT- of HR-gesprek
- [ ] Herschrijf de vervolgstappen voor ExitScan naar een duidelijkere lijn van duiden naar verbeteren.
- [ ] Trek ExitScan-rapporttaal strak met de huidige ExitScan-dashboardtaal en productpagina.

#### Definition of done
- [ ] ExitScan leest als eigen managementrapport, niet als generieke surveyrapportage.
- [ ] De management summary van ExitScan staat inhoudelijk boven de rest van het rapport.
- [ ] Het rapport ondersteunt vertrekduiding en prioritering zonder causaliteit te claimen.

#### Validation
- [ ] Een directielid kan de eerste pagina’s van ExitScan lezen zonder scorelogica te kennen.
- [ ] ExitScan-termen betekenen in rapport en dashboard hetzelfde.
- [ ] ExitScan-output voelt scherper en bestuurlijker dan de huidige shared basislaag.

---

### Milestone 3 - RetentieScan Report Identity And Actionability
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: RetentieScan-managementsamenvatting, signaalduiding, hypothese-intro en vervolgstappen zijn herschikt rond groepsbeeld, verificatie en gerichte opvolging.

#### Tasks
- [ ] Behoud de sterkere RetentieScan-lagen die al bestaan:
  - signal profile
  - trend
  - playbooks
  - segment-playbooks
- [ ] Herstructureer die lagen zodat de leesvolgorde nog rustiger wordt:
  - groepsbeeld
  - aanvullende behoudssignalen
  - eerste verificatie
  - pas daarna actie- en segmentverdieping
- [ ] Zorg dat RetentieScan nergens terugvalt in:
  - brede MTO-taal
  - individuele scoretaal
  - predictieve of causaliteitsframing
- [ ] Maak de open-signaallaag en playbooks duidelijker ondergeschikt aan het primaire groepsbeeld.
- [ ] Trek RetentieScan-rapporttaal strak met de huidige RetentieScan-dashboardtaal, inclusief trend- en verificatielogica.
- [ ] Houd ExitScan complementair zichtbaar, zonder RetentieScan als tweede versie van hetzelfde rapport te laten lezen.

#### Definition of done
- [ ] RetentieScan blijft inhoudelijk rijk, maar leest rustiger en hiërarchischer.
- [ ] De rapportvolgorde ondersteunt eerst managementduiding en daarna verdieping.
- [ ] De actionability van RetentieScan blijft sterk zonder overclaiming.

#### Validation
- [ ] Een lezer begrijpt eerst het groepssignaal en pas daarna de playbooks.
- [ ] RetentieScan-rapport en RetentieScan-dashboard gebruiken dezelfde signaalbetekenis.
- [ ] Geen rapportpassage suggereert individuele voorspelling of gevalideerde vertrekvoorspelling.

---

### Milestone 4 - Shared Terminology, Methodology And Report Language
Dependency: Milestone 2 and Milestone 3

- [x] Uitgevoerd op 2026-04-14: kerntermen, methodology copy en zichtbare managementtaal zijn verder aligned tussen backend report-content, frontend definities en marketing-paritytests.

#### Tasks
- [ ] Maak één vaste rapportwoordenlijst voor kerntermen:
  - ExitScan: frictiescore, werksignaal, vertrekduiding, eerdere signalering
  - RetentieScan: retentiesignaal, stay-intent, vertrekintentie, bevlogenheid, signaalprofiel
- [ ] Harmoniseer methodology copy tussen:
  - `backend/products/*/report_content.py`
  - frontend scan definitions
  - marketingcopy
- [ ] Breng rapporttaal terug tot rustigere managementformuleringen waar de laag nu te technisch of te survey-achtig leest.
- [ ] Verwijder of herschrijf legacy- of drifttermen waar zichtbare output nog teveel op `risk` leunt.
- [ ] Maak expliciet wat elk cijfer wel en niet betekent in rapportcontext.
- [ ] Zorg dat de methodology-passages exact aansluiten op de echte huidige implementatie:
  - geen overgeërfde blueprintambities
  - geen impliciete claims buiten de codebasis

#### Definition of done
- [ ] Dezelfde kernterm betekent in rapport, dashboard en website hetzelfde.
- [ ] Methodologie is verdedigbaar, rustig en commercieel bruikbaar.
- [ ] Zichtbare drift tussen interne en externe taal is verder teruggedrongen.

#### Validation
- [ ] Geen kernterm botst tussen ExitScan-rapport, RetentieScan-rapport en dashboard.
- [ ] Methodologietekst beschrijft de echte implementatie en niet een toekomstig model.
- [ ] Buyer-facing taal blijft scherp zonder methodische overspraak.

---

### Milestone 5 - Dashboard, Report And Website Parity Layer
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-14: parity is praktisch vastgelegd in productspecifieke definities, report payloads en regressietests; er is bewust geen los paritymatrix-document toegevoegd.

#### Tasks
- [ ] Leg per product één paritymatrix vast tussen:
  - dashboard hero/decision support
  - report management summary
  - methodology card
  - productpagina
- [ ] Maak zichtbaar welke copy of betekenis op meerdere plekken bewust gelijk moet blijven.
- [ ] Breng shared helpers en productmodules in lijn op:
  - signaalband-uitleg
  - topfactorbetekenis
  - interpretatie van trend of werksignaal
  - segmentvergelijking
- [ ] Verminder inhoudelijke duplicatie waar dat direct drift veroorzaakt; laat acceptabele duplicatie staan waar productspecifieke UX dat vraagt.
- [ ] Zorg dat het dashboard niet één verhaal vertelt en het rapport een ander verhaal nuanceert of overschrijft.

#### Definition of done
- [ ] Dashboard, rapport en website zijn inhoudelijk aligned op kernbelofte en interpretatie.
- [ ] Parity wordt expliciet bewaakt in plaats van impliciet gehoopt.
- [ ] ExitScan en RetentieScan houden elk een eigen rapportidentiteit zonder contradicties.

#### Validation
- [ ] Voor elk product is één consistente managementread herkenbaar over alle lagen heen.
- [ ] Geen buyer-facing copy claimt meer dan rapport en dashboard werkelijk dragen.
- [ ] De paritymatrix is te vertalen naar tests en reviewchecks.

---

### Milestone 6 - QA, Acceptance And Prompt-System Closure
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: backend tests, PDF smoke-routes, frontend paritytests, lint en build zijn groen; planbestand en `PROMPT_CHECKLIST.xlsx` zijn bijgewerkt.

#### Tasks
- [ ] Breid backend tests uit op productspecifieke report payloads en terminology contracts.
- [ ] Voeg paritytests toe tussen frontend scan definitions, marketing positioning en backend report content.
- [ ] Behoud bestaande PDF smoke tests; voeg geen fragiele full-PDF snapshots toe.
- [ ] Voeg acceptancechecks toe voor:
  - managementsamenvatting
  - productspecifieke signal page
  - hypotheses
  - vervolgstappen
  - methodology copy
- [ ] Voeg content-QA checks toe op:
  - geen causaliteitsclaim
  - geen individuele predictor-taal
  - ExitScan/RetentieScan-grens
  - rapport-dashboard parity
- [ ] Werk na uitvoering `PROMPT_CHECKLIST.xlsx` bij:
  - zet `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md` op voldaan of niet voldaan
  - vul `Last Updated`
  - noteer kort wat is opgeleverd

#### Definition of done
- [ ] Het aangescherpte rapportagesysteem is technisch én inhoudelijk reviewbaar.
- [ ] Regressies in producttaal en report parity kunnen minder makkelijk ongemerkt doorslippen.
- [ ] Het prompt-systeem en checklist sluiten aan op de werkelijk uitgevoerde uitkomst.

#### Validation
- [ ] Tests dekken de belangrijkste report-content en paritypaden.
- [ ] Acceptance kan productmatig en methodisch worden afgevinkt.
- [ ] De checklist weerspiegelt de echte status van dit traject.

## 3. Execution Breakdown By Subsystem

### Shared report kernel
- [x] Uitgevoerd: `backend/report.py` blijft de gedeelde render-engine, terwijl productspecifieke narratieve keuzes nu via vaste payload builders worden geïnjecteerd.
- [ ] Houd `backend/report.py` verantwoordelijk voor data-opbouw, layout en renderflow.
- [ ] Verplaats productspecifieke narratieve keuzes naar productmodules.
- [ ] Maak sectie-opbouw explicieter en minder afhankelijk van verspreide inline productbranches.

### Product-specific report content
- [x] Uitgevoerd: ExitScan en RetentieScan hebben nu elk een volwaardige management payloadlaag voor summary, signal page, hypothesen en vervolgstappen.
- [ ] Breid ExitScan report-content uit tot volwaardige management payloadlaag.
- [ ] Structureer RetentieScan report-content verder rond groepsbeeld, verificatie en actie.
- [ ] Maak productspecifieke hypotheses-, signaal- en repeat-copy eenduidig per product.

### Dashboard-report parity
- [x] Uitgevoerd: frontend definities en marketing-positioning checks zijn aangescherpt op dezelfde rapporttaal en signaalbetekenis.
- [ ] Align frontend scan definitions en dashboard view models met backend report terminology.
- [ ] Harmoniseer signaalbetekenis, topfactoruitleg en methodology-framing.
- [ ] Leg vast waar frontend opnieuw mag afleiden en waar backendtekst leidend moet zijn.

### Tests and QA
- [x] Uitgevoerd: backend payload-tests, paritychecks, PDF smoke-validatie, frontend lint en frontend build zijn toegevoegd of groen herbevestigd.
- [ ] Breid unit tests uit op report payloads en terminology contracts.
- [ ] Voeg paritytests toe tussen backend report content, frontend definitions en marketing positioning.
- [ ] Houd PDF-validatie op smoke-niveau; test copy en contracts vóór de PDF-renderlaag.

### Prompt-system closure
- [x] Uitgevoerd: `REPORTING_SYSTEM_SHARPENING_PLAN.md` is toegevoegd als source of truth en de checklistregel is bijgewerkt voor deze prompt.
- [ ] Lever `REPORTING_SYSTEM_SHARPENING_PLAN.md` als source of truth op.
- [ ] Werk `PROMPT_CHECKLIST.xlsx` bij na uitvoering.
- [ ] Laat vervolgtrajecten pas aansluiten nadat de rapport-source-of-truth is vastgesteld.

## 4. Current Product Risks

### Interpretatierisico's
- [ ] Rapporten kunnen nog te snel gelezen worden als score-overzicht in plaats van managementduiding.
- [ ] ExitScan kan nog te veel als nette survey-output lezen als de management summary niet hard genoeg prioriteert.
- [ ] RetentieScan kan in rijkere delen te veel detail boven de hoofdlijn laten komen.

### Methodologische risico's
- [ ] Methodology copy en zichtbare terminologie zitten op meerdere plekken, waardoor nuance kan verschuiven.
- [ ] Interne `risk`-contracten kunnen zichtbaar doorlekken in buyer-facing of management-facing taal.
- [ ] Rapporten kunnen te hard of te zacht formuleren als parity niet expliciet bewaakt wordt.

### Risico op generieke rapportage
- [ ] De centrale report-engine kan producten nog te veel op één generieke structuur laten leunen.
- [ ] ExitScan gebruikt nog te weinig eigen productspecifieke report-intelligentie vergeleken met RetentieScan.
- [ ] Shared secties kunnen te survey-achtig blijven als productframing niet per sectie wordt afgedwongen.

### Risico dat managementsamenvatting te zwak of te diffuus is
- [ ] Cover en summary geven nog niet maximaal scherp de eerste bestuurlijke lezing per product.
- [ ] Het huidige rapport kan op de eerste pagina’s te veel samenvatten en te weinig kiezen.
- [ ] Belangrijkste managementvraag en eerstvolgende stap zijn nog niet overal dominant genoeg.

### Risico dat rapport en dashboard verschillende verhalen vertellen
- [ ] Frontend helpers en backend report-builders duiden deels parallel.
- [ ] Dashboard decision support is al aangescherpt; rapport kan daar nog achterblijven.
- [ ] Zonder paritylaag kan marketingcopy strakker worden dan het rapport of juist andersom.

## 5. Open Questions

- [ ] Willen we op termijn een aparte visual-uplift prompt bovenop dit traject, of moet de rapport-engine visueel alleen functioneel rustiger worden binnen dit traject?
- [ ] Willen we later PDF-text extraction toevoegen voor diepere content-validatie, of houden we PDF-tests bewust op smoke-niveau?
- [ ] Willen we na dit traject ook een publiek voorbeeldrapport als sales/showcase deliverable opnemen, of blijft dat een apart vervolgprogramma?

## 6. Follow-up Ideas

- [ ] Voeg later een buyer-facing voorbeeldrapport of rapport-preview toe voor sales en website.
- [ ] Maak later een compacte report glossary als termen ondanks aanscherping nog te specialistisch blijven.
- [ ] Overweeg later een aparte boardroom-read variant of one-page executive export als de kernrapporten eerst inhoudelijk strak staan.
- [ ] Gebruik latere pilotdata om hypotheses en playbooks nog scherper te ijken op echte klantoutput.

## 7. Out of Scope For Now

- [x] Bevestigd in deze uitvoeringsronde: geen scoring-herontwerp, geen survey-uitbreiding, geen visual uplift-programma en geen report-engine rewrite buiten de directe rapportlaag.

- [ ] Nieuwe scoringmodellen of herwegingen buiten zichtbare report-uitleg.
- [ ] Grote survey-uitbreidingen.
- [ ] Grote redesign van de complete website buiten parity op rapporttaal.
- [ ] Nieuwe producten of portfolio-uitbreidingen.
- [ ] Self-service report builder of report-engine rewrite.
- [ ] Predictieve modellen, benchmarks of extra methodische claims zonder validatiebasis.

## 8. Defaults Chosen

- [x] Bevestigd in deze uitvoeringsronde: ExitScan primair, RetentieScan complementair, compatibele report-routes en parity-validatie vóór de PDF-renderlaag.

- [ ] ExitScan blijft het primaire product en krijgt de scherpste managementrapport-identiteit.
- [ ] RetentieScan blijft complementair en groepsgericht; geen individuele predictorframing.
- [ ] De report routes en opgeslagen response-contracten blijven compatibel.
- [ ] `backend/report.py` blijft de gedeelde render-engine; productnarratief verschuift naar de productmodules.
- [ ] PDF-tests blijven smoke-based; parity en copy worden vooral vóór de renderlaag getest.
- [ ] Dashboard, rapport en website moeten dezelfde productbetekenis dragen, ook als ze niet letterlijk dezelfde tekst gebruiken.
- [ ] `REPORTING_SYSTEM_SHARPENING_PLAN.md` wordt de source of truth voor de latere uitvoering.
- [ ] `PROMPT_CHECKLIST.xlsx` wordt pas na daadwerkelijke repo-uitvoering bijgewerkt, niet alleen na analyse.
