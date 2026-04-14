# EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md

## 1. Summary

Dit plan gebruikt de huidige implementatie van ExitScan als vertrekpunt voor een volledige review- en testanalyse, met `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` als source of truth voor de uitvoering.

De huidige codebase staat al verder dan een eerste concept:
- ExitScan heeft al een eigen surveycontext met `signal_visibility_score`, aanvullende vertrekredenen en exit-specifieke open vraag.
- ExitScan heeft al eigen producttaal in marketing en frontend: `vertrekduiding`, `frictiescore` en `sterk werksignaal`.
- ExitScan heeft al eigen scoringlogica in `backend/products/exit/scoring.py` via `compute_exit_friction(...)`.
- Het dashboard heeft al ExitScan-specifieke view-models en managementblokken.
- Tests dekken al delen van scoring en survey-submit af.

De kern van dit traject is daarom niet een blanco productontwerp, maar een scherpe review op vier resterende spanningen:
- shared versus exit-specifieke logica lopen nog door elkaar, vooral in `backend/scoring.py`, `backend/report.py` en gedeelde dashboardhelpers;
- de publieke belofte is al scherp, maar moet nog expliciet bewaakt worden tegen generieke surveytaal en subtiele overclaiming;
- dashboard en rapport zijn inhoudelijk bruikbaar, maar moeten nog strakker dezelfde managementleeslijn volgen;
- regressiebescherming zit nu vooral backend-side; parity, content-QA en UI-interpretatie zijn nog onvoldoende afgedekt.

Publieke interfaces en contracten die in dit traject leidend blijven:
- `SurveySubmit` blijft het bestaande intakecontract; wijzigingen zijn alleen toegestaan als additieve of verduidelijkende aanscherping.
- Dashboardconsumptie blijft lopen via het bestaande ExitScan view-model vanuit `frontend/lib/products/exit/*`.
- Rapportdownload blijft de bestaande PDF-route gebruiken; dit traject verandert primair inhoud, duiding en consistentie, niet het routecontract.

## 2. Milestones

### Milestone 0 - Freeze Current ExitScan Baseline
Dependency: none

#### Tasks
- [ ] Leg de huidige ExitScan-keten vast op basis van de repo: marketingbelofte, surveyflow, scoring, dashboard, rapport en tests.
- [ ] Documenteer expliciet welke onderdelen al aangescherpt zijn sinds `EXITSCAN_PRODUCT_SHARPENING_PLAN.md`.
- [ ] Maak een baseline-reviewmatrix met per laag: wat is al scherp, wat is nog diffuus, wat is nog generiek/shared.
- [ ] Markeer waar ExitScan nu nog leunt op shared of legacy-logica die inhoudelijke drift kan veroorzaken.
- [ ] Leg de lichte portfolio-link vast: RetentieScan alleen meenemen voor productgrens, terminologie en commercieel onderscheid.

#### Definition of done
- [ ] Er is een controleerbaar baselinebeeld van de huidige ExitScan-implementatie.
- [ ] Elke vervolgstap verwijst terug naar concrete repo-observaties, niet naar algemene productaannames.
- [ ] ExitScan/RetentieScan-grens is scherp genoeg vastgelegd om scopelek te voorkomen.

#### Validation
- [ ] Baseline is herleidbaar naar actuele code, templates, marketingcopy en tests.
- [ ] Het plan benoemt expliciet welke bevindingen al “opgelost” lijken en dus alleen nog validatie vragen.

### Milestone 1 - Product Promise And Portfolio Boundary Review
Dependency: Milestone 0

#### Tasks
- [ ] Review alle ExitScan-copylagen op dezelfde kernbelofte: terugkijkende vertrekduiding op basis van werkfactoren, vertrekredenen en werksignalen.
- [ ] Controleer dat ExitScan overal primair product blijft en niet als generieke exit-enquete leest.
- [ ] Review waar RetentieScan in homepage-, producten-, pricing- en vergelijkingstaal nodig is om ExitScan scherper te kaderen.
- [ ] Verwijder in de uitvoeringsscope alle taal die nog suggereert: harde causaliteit, individuele diagnose of bewezen verklaringskracht.
- [ ] Leg een vaste woordenlijst vast voor publieke ExitScan-termen en voor interne managementtermen.

#### Definition of done
- [ ] Er is een eenduidige ExitScan-propositie die commercieel scherp blijft zonder onware claims.
- [ ] De verhouding ExitScan versus RetentieScan is licht maar duidelijk aanwezig in portfolio-copy.
- [ ] Website, productpagina en dashboardtaal gebruiken dezelfde kernbelofte.

#### Validation
- [ ] Een koper kan in 10 seconden het verschil uitleggen tussen ExitScan, RetentieScan en de combinatie.
- [ ] Geen publieke tekst belooft meer zekerheid dan survey, scoring en rapport feitelijk ondersteunen.

### Milestone 2 - Survey, Scoring And Interpretation Alignment Review
Dependency: Milestone 1

#### Tasks
- [ ] Review of de huidige ExitScan-survey exact meet wat dashboard en rapport later nodig hebben.
- [ ] Toets of `signal_visibility_score`, hoofdreden en aanvullende redenen nu voldoende zijn voor sterkere vertrekduiding.
- [ ] Controleer of er nog inhoudelijke overlap of tegenstrijdigheid zit tussen `backend/products/exit/scoring.py` en de shared exit-defaults in `backend/scoring.py`.
- [ ] Beslis in de uitvoering dat ExitScan-inhoud niet meer via impliciete shared defaults mag afwijken van de exit-module.
- [ ] Maak per scoreterm expliciet wat die wel en niet betekent: `frictiescore`, `sterk werksignaal`, `signaalwaarde`, `beinvloedbaarheid`.
- [ ] Review de mapping van vertrekredenen, aanvullende redenen en open tekst op managementwaarde en methodische terughoudendheid.

#### Definition of done
- [ ] Survey, scoring en interpretatie vormen een logisch en uitlegbaar ExitScan-verhaal.
- [ ] Er is geen inhoudelijk dubbel spoor meer voor exit scoringlogica.
- [ ] Elke kernterm heeft een stabiele betekenis over backend, frontend en rapport heen.

#### Validation
- [ ] Voor elk surveyveld is duidelijk welke outputlaag erop leunt.
- [ ] Geen score- of interpretatieterm suggereert causaliteit of juridische stelligheid.
- [ ] ExitScan-scorelogica is inhoudelijk duidelijk anders dan RetentieScan.

### Milestone 3 - Dashboard And Report Decision-Support Review
Dependency: Milestone 2

#### Tasks
- [ ] Review het dashboard op de echte ExitScan-leesvolgorde: vertrekbeeld, topfactoren, werksignaal, eerste managementvraag, logische vervolgstap.
- [ ] Toets of `RiskCharts`, `RecommendationList` en shared dashboardhelpers ExitScan voldoende productspecifiek laten lezen.
- [ ] Review of rapport en dashboard dezelfde drempels, termen en managementsamenvatting gebruiken.
- [ ] Maak expliciet waar rapportcopy nog generiek scan- of surveyachtig leest in plaats van ExitScan-specifiek.
- [ ] Breng rapport, dashboard en methodology-card terug tot dezelfde interpretatieregels.
- [ ] Houd het bestaande PDF-contract stabiel; verander alleen inhoud, structurering en uitleg.

#### Definition of done
- [ ] Dashboard en rapport vertellen hetzelfde ExitScan-verhaal in verschillende diepte.
- [ ] Shared componenten of helpers veroorzaken geen zichtbare drift in ExitScan-duiding.
- [ ] Management krijgt eerst interpretatie en prioritering, pas daarna detailanalyse.

#### Validation
- [ ] Een HR-manager kan het dashboard lezen zonder eerst het rapport nodig te hebben.
- [ ] Een directielid kan het rapport lezen zonder de technische scoringlogica te kennen.
- [ ] Dezelfde term betekent in dashboard, rapport en methodology-card hetzelfde.

### Milestone 4 - QA, Tests And Regression Protection
Dependency: Milestone 3

#### Tasks
- [ ] Breid backend tests uit van formulebescherming naar interpretatie- en paritybescherming.
- [ ] Voeg tests toe voor ExitScan-specifieke contracten: `signal_visibility_score`, exit-context summary, vertrekredenlabeling en werksignaaluitkomsten.
- [ ] Voeg paritychecks toe tussen dashboardduiding, reportduiding en scan-definitions voor termen, thresholds en kernlabels.
- [ ] Voeg content-QA checks toe voor commerciele claims, ExitScan/RetentieScan-grens en verbod op harde causaliteit.
- [ ] Definieer acceptatiechecks voor surveyflow, dashboard, rapport en productcopy.
- [ ] Neem ten minste een end-to-end ExitScan smoke pad op: uitnodigen, invullen, stats, dashboardread, PDF-rapport.

#### Definition of done
- [ ] ExitScan is beschermd tegen regressies in zowel logica als interpretatie.
- [ ] Tests bewaken niet alleen cijfers, maar ook managementtaal en productgrenzen.
- [ ] Er is een expliciete QA-checklist voor inhoud, UX en commerciele scherpte.

#### Validation
- [ ] Een wijziging in thresholds, labels of duiding kan niet ongemerkt doorlopen.
- [ ] De belangrijkste ExitScan-flow is afgedekt van survey-submit tot rapportoutput.
- [ ] Copy- en interpretatierisico’s zijn toetsbaar gemaakt, niet alleen benoemd.

### Milestone 5 - Final Consistency Pass And Closeout
Dependency: Milestone 4

#### Tasks
- [ ] Voer een laatste consistency pass uit over backend, frontend, marketing en docs.
- [ ] Leg shared versus ExitScan-specifieke verantwoordelijkheden expliciet vast voor implementatie.
- [ ] Zet de uitvoeringsvolgorde vast per subsystem, inclusief afhankelijkheden en validatiemomenten.
- [ ] Werk `PROMPT_CHECKLIST.xlsx` bij voor deze promptregel met status, datum en korte oplevernotitie.
- [ ] Sluit het traject af met een acceptatiecheck die toetst of ExitScan nu inhoudelijk scherper is en niet alleen beter geformuleerd.

#### Definition of done
- [ ] Er is een uitvoerbare volgorde zonder open beslissingen voor de implementer.
- [ ] Checklist en planbestand zijn de enige leidende artefacten voor dit traject.
- [ ] ExitScan is na review duidelijker, consistenter en beter beschermd.

#### Validation
- [ ] Een nieuwe engineer kan milestone voor milestone uitvoeren zonder productbeslissingen te hoeven nemen.
- [ ] Het plan sluit af op concrete repo-feiten, niet op losse observaties.

## 3. Execution Breakdown By Subsystem

### Product Promise And Commercial Layer
- [ ] Houd ExitScan als primaire route voor terugkijkende vertrekduiding.
- [ ] Gebruik RetentieScan alleen voor lichte portfolio-afbakening op productgrenzen en kooplogica.
- [ ] Harmoniseer producttaal over `marketing-products`, `site-content` en de ExitScan productpagina.
- [ ] Verwijder resterende generieke surveyframing op commercieel kritieke plekken.

### Survey And Input Contract
- [ ] Behoud het bestaande ExitScan-surveycontract als basis.
- [ ] Review of `signal_visibility_score`, aanvullende vertrekredenen en open tekst voldoende managementwaarde opleveren.
- [ ] Verduidelijk alleen waar surveyinput niet scherp genoeg vertaalt naar dashboard of rapport.

### Scoring And Interpretation
- [ ] Maak `backend/products/exit/scoring.py` inhoudelijk leidend voor ExitScan.
- [ ] Minimaliseer of elimineer inhoudelijke duplicatie met shared exit-defaults in `backend/scoring.py`.
- [ ] Borg een vaste betekenis voor `frictiescore`, `sterk werksignaal` en gerelateerde labels.
- [ ] Houd ExitScan retrospectief en indicatief, niet diagnostisch of voorspellend.

### Dashboard
- [ ] Maak de ExitScan-leeslijn leidend boven generieke analyselagen.
- [ ] Behoud shared primitives alleen waar ze ExitScan-duiding niet vervlakken.
- [ ] Toets `RiskCharts`, `RecommendationList` en page-helpers op ExitScan-specifieke taal en thresholds.

### Report
- [ ] Houd de PDF-route en outputvorm stabiel.
- [ ] Review alle vaste copy en rapportlogica op ExitScan-specifieke managementbruikbaarheid.
- [ ] Breng rapportdrempels, labels en hypotheses in lijn met dashboard en scoring.

### QA And Testing
- [ ] Voeg backend contracttests, paritytests en content-QA toe.
- [ ] Voeg minimaal een end-to-end ExitScan smoke flow toe.
- [ ] Bescherm shared-versus-product-specifieke grenzen met tests waar drift waarschijnlijk is.

## 4. Current Product Risks

### Methodische risico's
- [ ] ExitScan gebruikt al eigen exit scoring, maar shared scoring bevat nog exit-defaultlogica die inhoudelijke drift kan veroorzaken.
- [ ] `preventability` is inhoudelijk afgezwakt naar werksignaal, maar de implementatie gebruikt nog meerdere lagen en namen die uit elkaar kunnen lopen.
- [ ] Survey en output zijn sterker gekoppeld dan eerder, maar de review moet nog bevestigen dat elk surveyveld echte productwaarde heeft.

### Commerciele risico's
- [ ] De publieke propositie is scherp, maar kan nog terugvallen naar generieke surveytaal in shared of portfolio-context.
- [ ] Subtiele overclaiming blijft mogelijk als “vertrekduiding” in rapport of dashboard alsnog als verklaring wordt gelezen.
- [ ] De lichte portfolio-link met RetentieScan moet scherp blijven zonder ExitScan te verwateren.

### UX- en interpretatierisico's
- [ ] Dashboard en rapport bevatten meerdere signaallagen en kunnen daardoor nog te druk of te technisch gelezen worden.
- [ ] Shared dashboardcomponenten kunnen ExitScan inhoudelijk vlakker maken dan de productpagina belooft.
- [ ] Methodology, insight warnings en managementblokken moeten exact dezelfde leeshouding afdwingen.

### Risico op overlap of verwarring met RetentieScan
- [ ] Sommige shared helpers, labels en portfolio-copy kunnen ExitScan en RetentieScan nog te veel als varianten van hetzelfde product laten lezen.
- [ ] ExitScan moet terugkijkend en rapporterend blijven; RetentieScan moet vroegsignalerend en privacy-strakker blijven.

### Risico dat ExitScan te veel als generieke exit-enquete leest
- [ ] Surveyflow is functioneel sterk, maar de review moet nog bewijzen dat de output duidelijk meer biedt dan standaard exitfeedback.
- [ ] Rapport en dashboard moeten het productbelofteverschil dragen, niet alleen de marketingpagina.

### Risico dat review en testdekking belangrijke regressies missen
- [ ] Huidige tests zitten vooral op backend scoring en submitflows.
- [ ] Frontendduiding, rapportcopy en cross-layer parity zijn nog onvoldoende expliciet beschermd.
- [ ] Shared-versus-exit drift kan nu nog ongemerkt ontstaan zonder duidelijke regressietest.

## 5. Open Questions

- [ ] Is `frictiescore` extern de beste hoofdterm, of moet die vooral een interne managementterm blijven naast `vertrekduiding`?
- [ ] Moet `signal_visibility_score` zichtbaarer worden in dashboard en rapport, of vooral als onderliggende contextvariabele blijven werken?
- [ ] Moet ExitScan-rapportage explicieter onderscheid maken tussen hoofdreden, meespelende redenen en beinvloedbaar werksignaal?
- [ ] Hoeveel shared helperlogica mag blijven bestaan voordat ExitScan-inhoud opnieuw te generiek wordt?
- [ ] Moet de lichte portfolio-link later ook worden doorgetrokken naar pricing- en sales-assets buiten de huidige webcopy?

## 6. Follow-up Ideas

- [ ] Voeg later een buyer-facing ExitScan versus klassieke exitgesprekken vergelijking toe.
- [ ] Overweeg later een compacte ExitScan leeswijzer voor HR en MT.
- [ ] Voeg later expliciete report/dashboard snapshot-tests toe zodra de copy stabiel genoeg is.
- [ ] Overweeg later een aparte glossarylaag als termen ondanks aanscherping nog te specialistisch blijven.

## 7. Out of Scope For Now

- [ ] Brede herziening van RetentieScan buiten noodzakelijke portfolio-afbakening.
- [ ] Nieuwe producten, nieuwe surveyfamilies of volledige portfolio-herontwerp.
- [ ] Grote backend-herarchitectuur buiten wat nodig is om ExitScan-drift te voorkomen.
- [ ] Volledige rewrite van report engine, dashboard framework of survey shell.
- [ ] Pricing-, CRM- of salesoperatie buiten directe ExitScan-positionering.
- [ ] Nieuwe predictive of benchmarkclaims.

## 8. Defaults Chosen

- [ ] Dit traject levert primair `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` op als source of truth.
- [ ] ExitScan blijft het primaire product; RetentieScan wordt alleen licht meegenomen voor portfolio-grenzen en complementaire positionering.
- [ ] De nadruk ligt op alignment, QA en commerciele aanscherping, niet op een breed nieuw productontwerp.
- [ ] Het bestaande surveycontract en bestaande PDF-route blijven leidend; wijzigingen zijn alleen toegestaan als ze interpretatie, consistentie of regressiebescherming verbeteren.
- [ ] ExitScan blijft retrospectief, indicatief en managementgericht; geen causale, juridische of individuele claimrichting.
- [ ] `PROMPT_CHECKLIST.xlsx` wordt na oplevering van dit planbestand bijgewerkt als onderdeel van het traject.
- [ ] De uitvoeringsvolgorde is: baseline review, productbelofte, survey/scoring, dashboard/rapport, QA/tests, consistency pass.
