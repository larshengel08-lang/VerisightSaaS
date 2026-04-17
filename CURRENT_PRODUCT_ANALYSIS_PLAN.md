# CURRENT_PRODUCT_ANALYSIS_PLAN

## 1. Summary

Dit document is de uitvoerbare source of truth voor een systematische analyse van het huidige Verisight-product zoals het nu in de codebase en productlagen bestaat. De analyse richt zich uitsluitend op de huidige live productrealiteit van `ExitScan` en `RetentieScan`, inclusief survey, scoring, dashboard, rapportage, productcopy, commerciele positionering, trust-/methodiekframing en relevante marketinglagen waar die productclaims of productkeuzes raken.

De analyse wordt expliciet gebaseerd op de huidige implementatie en waarneembare output, niet op gewenste toekomstbeelden. Bij conflicten geldt de volgende volgorde voor waarheidsbepaling: runtime-implementatie en actuele output eerst, daarna ondersteunende documentatie en testintenties. Dit plan is bedoeld om daarna milestone voor milestone exact uitgevoerd te worden, zodat vervolgens onderbouwd besloten kan worden welke productrondes nodig zijn om productkwaliteit, methodische consistentie, commerciele scherpte, UX en rapportage te verbeteren zonder scopelek naar nieuwe producten of losse roadmap-ideeen.

Uitgangspunt voor de analyse:

- `ExitScan` en `RetentieScan` zijn de enige productobjecten binnen scope.
- Marketinglagen worden alleen meegenomen waar zij de productpositionering, productclaims, bewijsvoering of productkeuze beinvloeden.
- Shared infrastructuur telt mee waar die direct invloed heeft op beide producten.
- Legacy- of interne artefacten worden alleen meegenomen om te bepalen of zij nog onderdeel zijn van de actuele productrealiteit of juist verwarring of risico veroorzaken.
- Er worden in deze fase geen implementatiewijzigingen gedaan buiten dit planbestand.

## 2. Milestones

### Milestone 1. Product Baseline en Scope-afbakening

Dependencies:

- Geen. Dit is het startpunt voor alle vervolgstappen.

Steps:

- [ ] Bevestig welke runtime-lagen het huidige Verisight-product werkelijk vormen: backend, frontend, surveytemplates, dashboard, rapportgenerator, marketingpagina's en database-/statslagen.
- [ ] Classificeer welke codepaden productkritisch, ondersteunend, intern operationeel of legacy zijn.
- [ ] Leg vast welke artefacten als primaire bewijsbasis gelden voor `ExitScan` en `RetentieScan`.
- [ ] Maak een eerste kaart van shared versus product-specifieke modules.
- [ ] Documenteer expliciet welke onderdelen wel en niet tot de huidige live productrealiteit worden gerekend.

Definition of Done:

- Er ligt een vastgelegde scopekaart van de actuele productlagen.
- Voor elk hoofdonderdeel is duidelijk of het live, ondersteunend, intern of legacy is.
- De analysebasis voor alle volgende milestones is eenduidig en herhaalbaar.

Validation:

- [ ] De scopekaart sluit aan op de feitelijke runtime-implementatie en directorystructuur.
- [ ] Er is geen onbedoelde scopelek naar nieuwe producten, experimenten of roadmap-ideeen.
- [ ] Eventuele legacy-artefacten zijn benoemd zonder ze automatisch als live product aan te nemen.

### Milestone 2. Huidige Productarchitectuur en Productgrenzen

Dependencies:

- Milestone 1 afgerond.

Steps:

- [ ] Analyseer de productarchitectuur van `ExitScan`, `RetentieScan` en shared modules in backend en frontend.
- [ ] Leg vast waar productdefinities, registries, surveylogica, scoring, dashboards en rapportcontent per product leven.
- [ ] Breng in kaart waar productwaarheden dubbel bestaan over code, copy, rapporten, tests en marketing.
- [ ] Evalueer of de huidige architectuur het onderscheid tussen beide producten ondersteunt of juist vervaagt.
- [ ] Benoem welke onderdelen shared horen te blijven en welke onderdelen product-specifieker moeten worden beoordeeld.

Definition of Done:

- Er is een concrete architectuurkaart van de huidige productopbouw.
- Shared en product-specifieke verantwoordelijkheden zijn benoemd.
- Belangrijke plekken met risico op drift of dubbele waarheid zijn expliciet gemarkeerd.

Validation:

- [ ] Alle productkritische subsystemen zijn gekoppeld aan concrete codepaden.
- [ ] De analyse maakt zichtbaar waar het product consistent is en waar architecturale diffusie ontstaat.
- [ ] Het onderscheid tussen `ExitScan` en `RetentieScan` is technisch en inhoudelijk traceerbaar gemaakt.

### Milestone 3. Surveylogica, Vraagkwaliteit en Respondentflow

Dependencies:

- Milestone 1 en 2 afgerond.

Steps:

- [ ] Analyseer per product de volledige surveyflow: token-entry, rendering, volgorde, validatie en submitpad.
- [ ] Inventariseer alle product-specifieke en shared surveyblokken.
- [ ] Beoordeel de vraagkwaliteit op helderheid, relevantie, methodische discipline, antwoordbelasting en interpretatiegevoeligheid.
- [ ] Leg vast welke surveyonderdelen het onderscheid tussen `ExitScan` en `RetentieScan` daadwerkelijk dragen.
- [ ] Beoordeel of surveycopy, tone of voice en UX aansluiten op de claims van het product.
- [ ] Identificeer waar de survey als meetinstrument sterk is en waar hij diffuus, dubbelzinnig of verouderd aanvoelt.

Definition of Done:

- Voor beide producten is de surveylogica volledig in kaart gebracht.
- Het functionele en inhoudelijke onderscheid tussen beide surveys is expliciet beschreven.
- Er is een onderbouwd oordeel over vraagkwaliteit, respondentervaring en methodische fit.

Validation:

- [ ] Alle verplichte velden, productspecifieke items en validatieregels zijn meegenomen.
- [ ] Het verschil tussen `ExitScan` en `RetentieScan` is ook vanuit de surveylaag concreet aantoonbaar.
- [ ] Eventuele spanningen tussen survey UX en merk- of productbelofte zijn benoemd.

### Milestone 4. Scoring-, Interpretatie- en Signaallogica

Dependencies:

- Milestone 2 en 3 afgerond.

Steps:

- [ ] Analyseer per product de ruwe inputs, berekende subscores, wegingen, thresholds, risk bands en interpretatielabels.
- [ ] Breng shared scoringhelpers en productspecifieke scoring uiteen.
- [ ] Beoordeel of de huidige logica methodisch consistent is met wat survey en copy suggereren.
- [ ] Leg vast welke uitkomsten robuust en uitlegbaar zijn, en welke uitkomsten gevoelig zijn voor overinterpretatie.
- [ ] Beoordeel privacydrempels, segmentdrempels en aggregatielogica.
- [ ] Markeer plaatsen waar heuristiek, indicatieve aannames of v1-calibratie bestaan maar mogelijk steviger overkomen in output of copy.

Definition of Done:

- De huidige scoring- en interpretatiemodellen zijn per product uitlegbaar gedocumenteerd.
- Er is een expliciet oordeel over methodische sterkte, beperkingen en interpretatierisico's.
- Het verschil tussen productbelofte en daadwerkelijke meet- of scoringsdiepte is zichtbaar gemaakt.

Validation:

- [ ] Alle kritieke thresholds, wegingen en outputlabels zijn herleidbaar naar huidige code.
- [ ] Privacy- en segmentregels zijn expliciet getoetst aan productuitvoer en framing.
- [ ] Eventuele risico's op pseudo-precisie of overclaiming zijn concreet benoemd.

### Milestone 5. Dashboard-output en Decision Support

Dependencies:

- Milestone 2, 3 en 4 afgerond.

Steps:

- [ ] Analyseer per product de actuele dashboardopbouw, componentlagen en product-specifieke beslisblokken.
- [ ] Leg vast welke informatie het dashboard werkelijk toont, hoe die wordt samengevat en welke managementactie het probeert uit te lokken.
- [ ] Beoordeel bruikbaarheid voor eerste managementgebruik, opvolging en interne besluitvorming.
- [ ] Evalueer de balans tussen productinzichten, operationele status, onboarding en decision support.
- [ ] Beoordeel waar dashboardcopy en dashboardstructuur goed aligned zijn met de onderliggende meetlogica en waar niet.
- [ ] Benoem waar dichtheid, overlap of interne jargonlagen de producthelderheid verzwakken.

Definition of Done:

- Het huidige dashboard is per product functioneel en inhoudelijk ontleed.
- Er ligt een oordeel over managementbruikbaarheid, producthelderheid en signaal-naar-besluitkwaliteit.
- Spanningen tussen dashboard-UX, productbelofte en meetdiepte zijn expliciet vastgelegd.

Validation:

- [ ] Alle productkritische dashboardsecties zijn meegenomen.
- [ ] Er is onderscheid gemaakt tussen echte decision support en ondersteunende delivery- of ops-informatie.
- [ ] Claims in dashboardcopy zijn getoetst aan de feitelijke datalaag en scoringlogica.

### Milestone 6. Rapportoutput en Managementbruikbaarheid

Dependencies:

- Milestone 2, 3 en 4 afgerond.

Steps:

- [ ] Analyseer de huidige rapportgenerator, productspecifieke rapportcontent en voorbeeldrapporten.
- [ ] Leg vast welke managementboodschap, handoff-structuur en actielogica de rapporten nu bieden.
- [ ] Beoordeel of de rapporten voldoende bestuurlijke scherpte, leesbaarheid en gebruikswaarde hebben.
- [ ] Toets of rapportclaims en duidingen precies aansluiten op wat de meetlogica werkelijk kan dragen.
- [ ] Breng in kaart waar rapporten sterk en verdedigbaar zijn en waar zij te veel zekerheid, causaliteit of commerciele kracht kunnen suggereren.
- [ ] Vergelijk waar relevant dashboardoutput en rapportoutput op consistentie, overlap en rolverdeling.

Definition of Done:

- De huidige rapportlaag is inhoudelijk, methodisch en commercieel beoordeeld.
- Het verschil tussen nuttige bestuurlijke duiding en mogelijke overframing is helder.
- Dashboard en rapport zijn op alignment en taakverdeling beoordeeld.

Validation:

- [ ] Voor beide producten is voorbeeldoutput of gegenereerde output expliciet meegenomen.
- [ ] De managementbruikbaarheid is beoordeeld op concrete besluit- en opvolgstructuur.
- [ ] Potentiele spanningen tussen rapportretoriek en onderliggende bewijskracht zijn benoemd.

### Milestone 7. Productcopy, Website en Commerciele Positionering

Dependencies:

- Milestone 1 en 2 afgerond.

Steps:

- [ ] Analyseer productcopy in app, dashboard, rapporten en marketingpagina's voor `ExitScan` en `RetentieScan`.
- [ ] Leg vast wat elk product nu zegt dat het is, hoe het werkt, wat het belooft en voor wie het bedoeld is.
- [ ] Beoordeel of het onderscheid tussen beide producten commercieel scherp genoeg is.
- [ ] Breng terminologische drift, overlap en inconsistentie in kaart rond baseline, live, momentopname, ritme, retrospectief en vergelijkbare labels.
- [ ] Toets of de marketingwebsite het product realistischer, gelijkwaardig of sterker neerzet dan de daadwerkelijke output rechtvaardigt.
- [ ] Beoordeel of shared copy de portfolio-eenheid ondersteunt of juist verwarring vergroot.

Definition of Done:

- De actuele commerciele positionering van beide producten is scherp beschreven.
- Verschillen, overlap en copy-drift zijn expliciet gemarkeerd.
- Er ligt een oordeel over de alignment tussen commerciele claim en productrealiteit.

Validation:

- [ ] Alle primaire productclaims zijn herleidbaar naar concrete schermen, pagina's of rapportonderdelen.
- [ ] Positioneringsverschillen tussen `ExitScan` en `RetentieScan` zijn voldoende scherp of expliciet als risico gemarkeerd.
- [ ] Risico's op verwarring, overbelofte of intern inconsistente terminologie zijn benoemd.

### Milestone 8. Trust, Methodiek en Privacyframing

Dependencies:

- Milestone 3, 4, 5, 6 en 7 afgerond.

Steps:

- [ ] Analyseer hoe trust, methodiekgrenzen, privacy, groepsniveau, interpretatiegrenzen en bewijsstatus nu in het product zijn verwerkt.
- [ ] Beoordeel of trustframing consistent is tussen survey, dashboard, rapport en marketing.
- [ ] Toets privacydrempels, segmentregels en open-tekstbehandeling aan de feitelijke productframing.
- [ ] Beoordeel of methodische beperkingen eerlijk en bruikbaar worden gecommuniceerd.
- [ ] Markeer waar de huidige trustlaag sterk is en waar hij formeel klopt maar UX- of copymatig onvoldoende landt.

Definition of Done:

- Trust-, methodiek- en privacyframing zijn end-to-end beoordeeld.
- Er is duidelijk waar Verisight nu geloofwaardig en zorgvuldig is.
- Er is ook duidelijk waar interpretatie- of privacyrisico's blijven bestaan.

Validation:

- [ ] Trustclaims zijn getoetst aan implementatie en output in plaats van alleen documentatie.
- [ ] Privacyregels en methodische grenzen zijn traceerbaar door de hele productketen.
- [ ] Eventuele gaten tussen "zorgvuldig geclaimd" en "zorgvuldig ervaren" zijn benoemd.

### Milestone 9. End-to-End Alignment, QA en Acceptatiekader

Dependencies:

- Alle voorgaande milestones afgerond.

Steps:

- [ ] Trek per product een end-to-end conclusie over alignment tussen survey, scoring, dashboard, rapport, copy en commerciele positionering.
- [ ] Stel vast welke onderdelen nu aantoonbaar sterk zijn en dus behouden of beschermd moeten worden.
- [ ] Stel vast welke onderdelen zwak, diffuus, verouderd of intern inconsistent zijn en prioriteit verdienen in vervolgrondes.
- [ ] Bepaal welke shared onderdelen shared moeten blijven en waar productscheiding scherper moet.
- [ ] Inventariseer bestaande test- en QA-dekking en definieer aanvullende validatie-, QA- en acceptatiechecks voor toekomstige productrondes.
- [ ] Maak een finale analyse-output met scherpe conclusies, risico's, open vragen en een beperkte follow-up-sectie zonder implementatievoorstellen uit te voeren.

Definition of Done:

- Er ligt een complete, uitvoerbare en verdedigbare productanalyse van de huidige staat.
- Sterktes, risico's, QA-gaten en productscheidingsvragen zijn expliciet geordend.
- Er is een acceptatiekader voor vervolgrondes dat op de huidige productrealiteit is gebaseerd.

Validation:

- [ ] Alle hoofdbevindingen zijn terug te voeren op eerdere milestones en concrete implementatie-observaties.
- [ ] De eindanalyse maakt onderscheid tussen feit, interpretatie en open vraag.
- [ ] Vervolgwerk is voorbereid zonder scopelek naar implementatie in deze fase.

## 3. Execution Breakdown By Subsystem

### A. Current Runtime en Productarchitectuur

- [ ] Inventariseer backend-, frontend-, surveytemplate-, rapport- en marketinglagen die direct bijdragen aan de huidige productervaring.
- [ ] Bevestig de rol van productregistries, productdefinities en shared modules.
- [ ] Scheid primaire live lagen van ondersteunende of legacy lagen.
- [ ] Leg vast waar productwaarheden verspreid staan en waar drift kan ontstaan.

Definition of Done:

- Er is een subsystemkaart met duidelijke runtimegrenzen en productverantwoordelijkheden.

### B. ExitScan

- [ ] Beschrijf wat `ExitScan` nu precies is volgens implementatie, output en copy.
- [ ] Leg vast hoe `ExitScan` survey, scoring, dashboard en rapport aan elkaar koppelt.
- [ ] Beoordeel of `ExitScan` primair retrospective duiding, operationele monitoring of besluitondersteuning levert.
- [ ] Benoem de sterkste en zwakste onderdelen van de huidige `ExitScan`.

Definition of Done:

- `ExitScan` is als huidig product scherp geprofileerd op werking, belofte en feitelijke levering.

### C. RetentieScan

- [ ] Beschrijf wat `RetentieScan` nu precies is volgens implementatie, output en copy.
- [ ] Leg vast hoe `RetentieScan` survey, scoring, dashboard en rapport aan elkaar koppelt.
- [ ] Beoordeel of `RetentieScan` vooral vroegsignalering, temperatuurmeting, risicoduiding of besluitondersteuning levert.
- [ ] Benoem de sterkste en zwakste onderdelen van de huidige `RetentieScan`.

Definition of Done:

- `RetentieScan` is als huidig product scherp geprofileerd op werking, belofte en feitelijke levering.

### D. Shared Productlaag

- [ ] Inventariseer welke vraagblokken, werkfactoren, copypatronen, rapportstructuren en dashboardmechanieken shared zijn.
- [ ] Beoordeel welke shared onderdelen methodisch en commercieel logisch zijn.
- [ ] Beoordeel waar shared patronen het onderscheid tussen beide producten juist afvlakken.

Definition of Done:

- Duidelijk is wat bewust shared is, wat nuttig shared kan blijven en waar shared design nu verwarring veroorzaakt.

### E. Survey en Respondentervaring

- [ ] Toets vraagkwaliteit, volgorde, terminologie, belasting en duidelijkheid.
- [ ] Beoordeel de spanning tussen meetdiscipline en respondentbegrip.
- [ ] Check of survey UX en merkuitstraling passen bij de premium- of productclaimlaag.

Definition of Done:

- Surveykwaliteit en survey-UX zijn per product en shared laag beoordeeld.

### F. Scoring en Interpretatie

- [ ] Herleid hoe ruwe antwoorden naar managementsignalen worden vertaald.
- [ ] Beoordeel robuustheid, uitlegbaarheid en risico op overinterpretatie.
- [ ] Toets of indicatieve, heuristische of v1-logica voldoende begrensd wordt in copy en output.

Definition of Done:

- De meet- en interpretatieketen is inhoudelijk en methodisch doorgrond.

### G. Dashboard en Beslislogica

- [ ] Analyseer welke beslissingen het dashboard wil uitlokken.
- [ ] Check of managementblokken, samenvattingen en next-step kaarten terecht zijn gegeven de datakwaliteit.
- [ ] Beoordeel signaal-naar-actie coherentie en informatiedichtheid.

Definition of Done:

- Dashboardbruikbaarheid en alignment met meetrealiteit zijn beoordeeld.

### H. Rapporten en Managementoutput

- [ ] Analyseer bestuurlijke handoff, samenvattingen, beslisstructuur en risico op overframing.
- [ ] Beoordeel hoe rapporten zich verhouden tot dashboard en marketingmateriaal.
- [ ] Check managementbruikbaarheid voor directie, MT en HR.

Definition of Done:

- Rapporten zijn beoordeeld op leesbaarheid, scherpte, bewijsdiscipline en bruikbaarheid.

### I. Productcopy en Commerciele Positionering

- [ ] Verzamel kernclaims per product uit app-, rapport- en marketingsurfaces.
- [ ] Beschrijf de huidige commerciele propositie van elk product.
- [ ] Beoordeel onderscheid, overlap, verwarring en claimkracht.

Definition of Done:

- Huidige positionering is expliciet en toetsbaar vastgelegd.

### J. Trust, Methodiek en Privacy

- [ ] Analyseer hoe groepsniveau, signalering, preventie, privacy en bewijsstatus nu worden begrensd.
- [ ] Beoordeel of trustframing intern consistent is.
- [ ] Benoem frictie tussen formele zorgvuldigheid en ervaren productzekerheid.

Definition of Done:

- De trust- en methodieklaag is als integraal onderdeel van het product beoordeeld.

### K. QA en Acceptatie

- [ ] Inventariseer bestaande tests, parity-checks en validatiemechanieken.
- [ ] Bepaal welke checks nodig zijn om toekomstige productrondes veilig te maken.
- [ ] Definieer een acceptatiekader voor wijzigingen in survey, scoring, dashboard, rapport en copy.

Definition of Done:

- Er ligt een concreet validatie- en acceptatiekader voor vervolgwerk.

## 4. Current Product Strengths

- De huidige codebase heeft een duidelijke productopdeling tussen `ExitScan`, `RetentieScan` en shared modules, wat een sterke basis geeft voor gerichte analyse en latere productrondes.
- Beide producten hebben daadwerkelijk verschillende survey- en scoringslogica in plaats van alleen andere marketinglabels, wat het inhoudelijke onderscheid verdedigbaar maakt.
- De rapportlaag is opvallend sterk in managementgerichtheid: signalen worden vertaald naar eerste besluit, eerste eigenaar, eerste stap en reviewmoment.
- Trust-, privacy- en methodiekgrenzen zijn niet alleen marketingcopy, maar ook zichtbaar in thresholds, segmentregels en uitlegcopie.
- De producten tonen discipline in groepsniveauframing en minimumgrenzen voor segment- en patroonanalyse, wat methodische en privacyzorgvuldigheid ondersteunt.
- De combinatie van dashboard en rapport laat zien dat Verisight niet alleen data toont, maar ook probeert te structureren hoe management de output gebruikt.
- Voorbeeldrapporten en previewlagen maken de productoutput concreet en verkoopbaar zonder dat het aanbod volledig abstract blijft.
- Er bestaat al QA-dekking op scoring, API-flows, rapportpariteit en copy-/positioneringspariteit, wat uitzonderlijk waardevol is voor methodische en commerciele consistentie.
- De huidige trustpositionering benoemt meerdere keren wat het product nadrukkelijk niet is, wat de geloofwaardigheid vergroot.
- Shared werkfactoren en gemeenschappelijke rapportstructuren geven het portfolio herkenbaarheid en interne samenhang.

## 5. Current Product Risks

- Methodisch risico: productwaarheden lijken verspreid over backend, frontend, rapportcontent, marketingcopy en tests, waardoor drift of interne inconsistentie relatief makkelijk kan ontstaan.
- Methodisch risico: delen van de interpretatielaag zijn indicatief, heuristisch of expliciet v1, maar kunnen in samenvattende output steviger of definitiever overkomen dan de onderliggende logica werkelijk rechtvaardigt.
- Methodisch risico: open-tekstclustering en patroonduiding kunnen rijk ogen in output, terwijl de feitelijke methodische diepte beperkter is.
- Commercieel risico: terminologie rond `baseline`, `live`, `momentopname`, `ritme` en `retrospectief` lijkt niet overal volledig consistent, wat productkeuze en salesgesprekken kan vertroebelen.
- Commercieel risico: de marketinglaag kan op sommige punten een sterker, scherper of volwassener product suggereren dan wat de actuele survey-, dashboard- of rapportoutput in alle gevallen daadwerkelijk levert.
- Commercieel risico: de aanwezigheid van shared portfolio-taal en een combinatiepropositie kan de onderscheidende keuze tussen `ExitScan` en `RetentieScan` verzwakken als dat onderscheid niet consequent wordt bewaakt.
- UX-risico: de survey-ervaring lijkt visueel en merkmatig minder sterk dan de website- en rapportlagen, wat de ervaren productkwaliteit kan verlagen.
- UX-risico: het dashboard combineert productinzichten met operationele en onboardinglagen, waardoor de kern van het product voor gebruikers minder snel scherp kan zijn.
- UX-risico: decision-supportblokken zijn sterk, maar lopen risico om te sturend of te zeker te ogen wanneer de onderliggende datadiepte of steekproef beperkt is.
- Privacy-/interpretatierisico: open tekst, segmentatie en signaalduiding blijven gevoelig voor herleidbaarheid, overspecificatie of te stellige interpretatie, ook wanneer minimumgrenzen formeel aanwezig zijn.
- Privacy-/interpretatierisico: gebruikers kunnen groepssignalen alsnog lezen als quasi-individuele waarheid als trustframing niet op elk moment voldoende scherp landt.
- Risico op overlap of verwarring tussen `ExitScan` en `RetentieScan`: beide producten delen werkfactoren, managementstructuur en veel portfolio-taal, waardoor het verschil tussen terugkijken en vroegsignaleren kan vervagen.
- Risico op overlap of verwarring tussen `ExitScan` en `RetentieScan`: als beide producten in copy en dashboard te veel dezelfde managementtaal voeren, wordt de eigen productidentiteit minder scherp.
- Risico dat marketing sterker lijkt dan daadwerkelijke output: buyer-facing preview, trustcopy en propositie kunnen op sommige plekken meer methodische stevigheid of productvolwassenheid uitstralen dan alle onderliggende productlagen nu consistent waarmaken.
- Architectuurrisico: legacy of parallelle artefacten kunnen onduidelijkheid veroorzaken over wat het echte live product is en welke lagen nog onderhouden of meegewogen moeten worden.

## 6. Open Questions

- Is de huidige FastAPI + Next.js keten de volledige live productrealiteit, of draaien er nog operationele of klantgerichte flows via oudere Streamlit-artefacten?
- Welke artefacten gelden intern als definitieve productwaarheid wanneer copy, rapporten, dashboard en marketing onderling subtiel verschillen?
- Zijn de huidige voorbeeldrapporten volledig representatief voor wat klanten nu ontvangen, of deels commerciele showcase?
- Is `RetentieScan` commercieel en operationeel nu primair een momentopnameproduct, een ritmeproduct of beide, en wordt dat overal hetzelfde gecommuniceerd?
- Hoe bewust is de huidige keuze om dashboardlagen voor ops of onboarding mee te nemen in dezelfde ervaring als productinzichten?
- In welke mate is huidige segment- en patroonduiding al gevalideerd met echte klantdata versus interne ontwerpintentie?
- Welke huidige claims zijn expliciet bedoeld als indicatief en welke worden al als harde productbelofte verkocht?
- Welke shared componenten zijn bewust gekozen voor portfolio-eenheid en welke zijn vooral historisch gegroeid?

## 7. Follow-up Ideas

- Na afronding van de analyse een aparte beslisronde doen voor productscheiding versus shared portfolio-architectuur.
- Na afronding van de analyse een expliciete claim-audit uitvoeren op alle buyer-facing copy en previewlagen.
- Na afronding van de analyse een aparte survey-UX review doen als blijkt dat surveykwaliteit en merkervaring niet goed aligned zijn.
- Na afronding van de analyse een methodische calibratie- en validatieronde definieren voor signalen, heuristieken en interpretatietaal.
- Na afronding van de analyse een vereenvoudigingsronde overwegen voor dashboarddichtheid en rolzuiverheid tussen product, onboarding en operations.

## 8. Out of Scope For Now

- Nieuwe producten, nieuwe scanvarianten of uitbreiding van het portfolio.
- Implementatie van verbeteringen in survey, scoring, dashboard, rapporten of marketingcopy.
- Nieuwe roadmap-ideeen buiten de beperkte follow-up-sectie.
- Nieuwe methodieken, nieuwe meetmodellen of herontwerp van scoring zonder dat eerst de huidige staat volledig is vastgesteld.
- Brede GTM-, prijs- of salesstrategie buiten wat direct nodig is om de huidige productpositionering te beoordelen.
- Technische refactors die niet nodig zijn voor de analyse van het huidige product.

## 9. Defaults Chosen

- De analyse baseert zich primair op huidige runtime-implementatie, actuele output en codegedrag; documentatie en tests zijn ondersteunend tenzij zij aantoonbaar de actuele productrealiteit representeren.
- `ExitScan` en `RetentieScan` zijn de enige producten binnen scope; de combinatiepropositie wordt alleen meegenomen waar die de positionering of verwarring tussen die twee beinvloedt.
- Shared modules, werkfactoren en rapport- of dashboardpatronen worden meegenomen omdat zij direct de huidige productrealiteit vormen.
- Legacy- of parallelle artefacten worden standaard behandeld als te classificeren, niet automatisch als live product.
- Minimumgrenzen, segmentregels en privacydrempels in de huidige implementatie worden behandeld als actieve productrealiteit totdat het tegendeel blijkt.
- Marketingpagina's vallen alleen binnen scope waar zij productbelofte, positionering, trustframing of verwachte output beinvloeden.
- Deze fase doet geen implementatie; alleen dit planbestand is aangemaakt als basis voor latere uitvoering.
