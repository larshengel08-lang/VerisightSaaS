# Vertaalvragen voor het blok "Zo maak je er een besluit van" (concept)

Datum: 2026-09-19
Status: akkoord Lars, 2026-09-21 (versie 2, review van 21-9 verwerkt; keuzes in sectie 6)
Hoort bij: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` par. 6 en Bijlage A (plan 3b)
Bron van de routes: `DIRECTION_SETS` in `backend/products/shared/deepening.py` (retention v2, exit v1)

## 1. Wat dit is

Dit zijn de 72 vertaalvragen: per scan 6 onderwerpen × 6 routes, de middelste van de drie vragen in het blok "Zo maak je er een besluit van".
Het rapport kiest de vraag die hoort bij de route die de meeste medewerkers kozen; het MT moet hem kunnen beantwoorden zonder dat er iemand van Loep aan tafel zit.
Review per rij: zet er "akkoord" achter of herschrijf de vraag. Een rij zonder opmerking geldt als niet beoordeeld.
`WORK_QUESTIONS` in de code wordt pas gevuld na jouw akkoord; tot dan staat er niets van dit document in het rapport.
Begin bij sectie 4 (waar ik over twijfel) en sectie 5 (afwijkingen): daar zitten de besluiten die meer dan één rij raken.

**De verdeeld-zinnen (versie 2).** De zin uit de spec noemde beide routes letterlijk ("verdeeld tussen [A] en [B]"). Dat werkt niet: met echte routeteksten wordt het ruim veertig woorden, de HR-manager zegt "mijn werk" over andermans werk, en vaak is er geen duidelijke B maar drie gelijke groepen. De routes staan met hun tellingen in het blok er direct boven, dus de zin noemt ze niet.

| Staat | Scan | Zin |
|---|---|---|
| Verdeeld (`divided`) | Behoud | Deze groep koos verschillend; de verdeling staat hierboven. Met welke van de meest gekozen richtingen beginnen jullie, en welke laten jullie bewust liggen? |
| Verdeeld (`divided`) | Vertrek | Deze vertrekkers kozen verschillend; de verdeling staat hierboven. Welke van de meest gekozen richtingen pakken jullie op voor wie er nu werkt, en welke laten jullie bewust liggen? |
| Verdeeld over wel of niets (`split_none`) | Behoud | Deze groep is verdeeld: een deel vraagt om verandering, een even groot deel zegt dat het goed zit. Beide kan kloppen. Waar zouden jullie met de meest gekozen richting beginnen? |
| Verdeeld over wel of niets (`split_none`) | Vertrek | Deze vertrekkers waren verdeeld: een deel vroeg om verandering, een even groot deel zei dat het goed zat. Beide kan kloppen. Waar zouden jullie voor wie er nu werkt met de meest gekozen richting beginnen? |

Geen vertaalvraag bij: grootste groep zonder meerderheid (`plurality`, die krijgt de vraag van zijn eigen route), "hier hoeft niets" als uitkomst (`none_needed`), te weinig antwoorden (`too_few`), en verdeeld waarbij "Anders" of "Niets" de grootste optie is.

**Hoe ik de vragen heb gebouwd.** Het uitgangspunt uit de spec ("Wat is bij jullie een concrete [route]: wie, hoe vaak, wat moet eruit komen?") heb ik als startpunt genomen, niet als mal. Elke vraag eindigt op iets dat alleen bij die route hoort (wat er afvalt als er werk bijkomt, wat er gebeurt als een beslissing anders uitpakt, wat iemand terughoort over zijn inbreng), zodat hij niet ongewijzigd onder een ander onderwerp kan staan. Vertrek kijkt terug en eindigt op wie er nu werkt, zonder te zeggen dat het vertrek daardoor kwam.

De volgorde van de onderwerpen volgt `DEEPENING_FACTOR_KEYS`. De onderwerpnamen zijn de namen uit de vraag die de respondent zag.

## 2. Loep Behoud (retention), tegenwoordige tijd

### 2.1 De aansturing (`leadership`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `ldd_feedback` | Meer bruikbare feedback en richting | Geef meer bruikbare feedback en richting. | Een medewerker levert werk in dat beter kan. Van wie hoort die wat er anders moet en waar het naartoe moet, en hoe snel? Wat kan die er de volgende dag mee? |
| `ldd_mandate` | Duidelijker wat ik zelf mag beslissen in mijn werk | Maak duidelijker wat medewerkers zelf mogen beslissen. | Welke drie beslissingen mag een medewerker bij jullie nemen zonder het eerst te vragen, en hoe reageert een leidinggevende als zo'n beslissing anders uitpakt? |
| `ldd_escalation` | Duidelijkere steun als er spanningen zijn of situaties vastlopen | Bied duidelijkere steun als er spanningen zijn of situaties vastlopen. | Als een medewerker vastloopt in een situatie of een spanning: wat doet de leidinggevende dan, binnen hoeveel dagen, en bij wie kan die medewerker terecht als het daar niet lukt? |
| `ldd_recognition` | Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd | Koppel concreter terug wat goed gaat en wat wordt gewaardeerd. | Hoe hoort iemand bij jullie dat zijn of haar werk goed was: van wie, hoe snel erna, en wat wordt er dan precies genoemd? |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn. | Hoe snel krijgt een medewerker bij jullie antwoord van de leidinggevende, en hoe vaak zien ze elkaar zonder dat er iets aan de hand is? Weet de medewerker wat die mag verwachten? |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | Maak besluiten en verwachtingen stabieler en beter uitlegbaar. | Als een besluit of verwachting bij jullie verandert: wie legt uit waarom, aan wie, en binnen hoeveel dagen? En wat als het daarna weer wijzigt? |

### 2.2 De samenwerking in het team (`culture`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cud_safety` | Fouten of twijfels makkelijker en veiliger kunnen bespreken | Maak het makkelijker en veiliger om fouten of twijfels te bespreken. | Een medewerker meldt zelf een fout. Wat gebeurt er daarna: wie reageert, wat zien collega's daarvan, en hoort de melder wat ermee gedaan is? |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | Geef kritische vragen en afwijkende meningen meer ruimte. | Wanneer veranderde een kritische vraag van een medewerker bij jullie voor het laatst een besluit? In welk overleg is daar ruimte voor, en wat hoort iemand wiens bezwaar het niet haalt? |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | Maak spanningen of conflicten eerder bespreekbaar. | Wanneer is een spanning bij jullie groot genoeg om te bespreken: wie begint erover, hoe snel, en wie helpt als twee collega's er samen niet uitkomen? |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging. | Een collega houdt zich niet aan een teamafspraak. Wie zegt daar bij jullie iets van, en hoe snel? En waar staan die afspraken, zodat een nieuw teamlid ze kent? |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raken | Betrek medewerkers eerder bij besluiten of veranderingen die het team raken. | Welk besluit dat een team raakt komt er de komende maanden aan? Op welk moment praten medewerkers mee voordat het vaststaat, en wat horen ze terug over hun inbreng? |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | Verbeter de samenwerking tussen teams of afdelingen. | Twee teams hangen van elkaars werk af. Wat spreken ze bij jullie met elkaar af, wie regelt dat, en wie beslist als het botst? |

### 2.3 Groeiperspectief (`growth`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij zijn | Maak zichtbaar welke mogelijkheden er voor medewerkers zijn. | Waar ziet een medewerker bij jullie vandaag welke functies, opleidingen of projecten er zijn? En wie wijst een medewerker op wat er voor hem of haar tussen zit? |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | Voer een concreter gesprek over ontwikkeling. | Wat weet een medewerker bij jullie ná een ontwikkelgesprek dat die ervoor niet wist: welke stap, welke opleiding, welk ander werk? Wie voert dat gesprek, en hoe vaak? |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op. | Waar staat een ontwikkelafspraak bij jullie na het gesprek, wie kijkt er na drie maanden naar, en hoe ziet de medewerker dat er iets mee gebeurt? |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | Plan ontwikkeling in naast het reguliere werk. | Hoeveel uur per maand mag ontwikkeling bij jullie kosten, wie vangt het werk dan op, en wat gebeurt er als het druk is? |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei wordt bepaald | Maak duidelijker hoe doorgroei wordt bepaald. | Wat moet iemand bij jullie laten zien om door te groeien, wie beslist daarover, en waar kan een medewerker dat nalezen voordat hij of zij het vraagt? |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie | Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie. | Welke vervolgstappen zijn er bij jullie echt, en welke niet? Wie zegt dat eerlijk tegen een medewerker, en op welk moment in het jaar? |

### 2.4 Beloning en voorwaarden (`compensation`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cpd_insight` | Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders | Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders. | Een medewerker vraagt hoe jullie salaris zich verhoudt tot vergelijkbaar werk elders. Wat krijgt die te zien? En weten jullie het zelf niet: wie zoekt het uit, voor welke functies eerst? |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | Leg verschillen tussen vergelijkbare functies beter uit. | Welke verschillen tussen vergelijkbare functies kunnen jullie goed uitleggen en welke niet? Wie legt ze uit, en wat doen jullie met een verschil dat niemand kan uitleggen? |
| `cpd_review` | Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk | Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk. | Wanneer keken jullie voor het laatst of de beloning nog past bij hoe zwaar een functie is? Welke functies zijn sindsdien veranderd, en wie kijkt daar als eerste naar? |
| `cpd_path` | Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing | Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing. | Wat kan een medewerker bij jullie de komende twee jaar aan salarisgroei verwachten: onder welke voorwaarden, op welk moment, en wie vertelt dat? |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei worden bepaald | Maak duidelijk hoe beloning en groei worden bepaald. | Stel dat een medewerker het morgen vraagt: wie legt in twee minuten uit hoe bij jullie een salaris en een volgende stap worden bepaald? Wat blijft er onduidelijk, en wie zet dat op papier? |
| `cpd_flex` | Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit | Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit. | Wat kan er bij jullie echt rond rooster en werktijden, voor welke functies, wie beslist over een verzoek, en waar staat dat zodat niemand het hoeft te vragen? |

### 2.5 Werkbelasting (`workload`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | Baken het takenpakket en het werkvolume scherper af. | Er komt werk bij voor een team dat al vol zit. Wie zegt bij jullie wat er dan afgaat, en waar staat wat wel en niet bij een functie hoort? |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | Laat planning en bezetting beter aansluiten op het werk dat er ligt. | Hoe ver vooruit zien jullie hoeveel werk er komt, en wie legt dat naast de bezetting? Klopt het niet: mensen erbij, werk eraf, of vangt het team het op? |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze. | Welke pieken kunnen jullie zien aankomen, en welke niet? Wie verdeelt het spoedwerk, en wie mag zeggen: dit kan er nu niet bij? |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | Maak meer ruimte om te herstellen en werk goed af te ronden. | Na een drukke periode: wat mag er bij jullie blijven liggen zodat mensen kunnen bijkomen en werk goed kunnen afmaken? Wie beslist dat, en hoe weet het team dat het mag? |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | Maak duidelijker wat voorrang heeft en wat kan wachten. | Als alles belangrijk is: wie zegt bij jullie hardop wat mag wachten, en hoe weet een medewerker dat op maandag? Wat hebben jullie zelf voor het laatst laten wachten? |
| `wld_friction` | Minder dubbel werk, systeemgedoe of fouten in overdracht | Haal dubbel werk, systeemgedoe en fouten in de overdracht weg. | Welk dubbel werk of systeemgedoe kost de meeste tijd, en weten jullie dat of de mensen die het doen? Hoe halen jullie het op, en wie lost het eerste punt op? |

### 2.6 Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | Maak de prioriteiten binnen rollen duidelijker. | Vraag een medewerker en de leidinggevende los van elkaar naar de drie belangrijkste dingen in dat werk. Krijg je bij jullie twee keer hetzelfde lijstje? Wie bespreekt het, en hoe vaak? |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik word aangesproken | Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken. | Waarop wordt een medewerker bij jullie aangesproken, en wist die dat vooraf? Wie spreekt verwachtingen uit, op welk moment, en waar staan ze? |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | Maak opdrachten eenduidiger en stem beter af tussen betrokkenen. | Wat doet een medewerker bij jullie die van twee kanten iets anders te horen krijgt? Wie hakt de knoop door, en hoe snel? |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket verandert | Maak duidelijke afspraken wanneer een takenpakket verandert. | Als een takenpakket bij jullie verandert: wie bespreekt dat met de medewerker, vóór of na de verandering, en waar leggen jullie vast wat er is afgesproken? |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mag beslissen | Maak duidelijk wat medewerkers zelf mogen beslissen. | Neem een functie die bij jullie veel voorkomt. Waarover beslist iemand in die rol zelf, waarover samen en waarover niet, en wie vertelt dat bij de start? |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | Zorg voor betere informatie, context en overdracht. | Iemand begint bij jullie aan een klus of neemt een dienst over. Wat moet die dan weten, wie zorgt dat het er ligt, en wat doet die als het ontbreekt? |

## 3. Loep Vertrek (exit), nu eerst en toen als toets

De opdrachtvorm is in de code tijd-neutraal en dus dezelfde als bij Behoud. De kolom "Wat de respondent zag" toont de exit-tekst; bij 13 van de 36 routes wijkt die af van Behoud (verleden tijd), bij 23 is hij bewust gelijk (`SAME`).

### 3.1 De aansturing (`leadership`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `ldd_feedback` | Meer bruikbare feedback en richting | Geef meer bruikbare feedback en richting. | Een medewerker levert nu werk in dat beter kan. Van wie hoort die wat er anders moet, en hoe snel? En toen de vertrekkers er nog werkten? |
| `ldd_mandate` | Duidelijker wat ik zelf mocht beslissen in mijn werk | Maak duidelijker wat medewerkers zelf mogen beslissen. | Welke drie beslissingen mag een medewerker nu nemen zonder het eerst te vragen, en van wie heeft die dat gehoord? Was dat een jaar geleden anders? |
| `ldd_escalation` | Duidelijkere steun als er spanningen waren of situaties vastliepen | Bied duidelijkere steun als er spanningen zijn of situaties vastlopen. | Als een medewerker nu vastloopt in een situatie of een spanning: wat doet de leidinggevende dan, en binnen hoeveel dagen? En toen de vertrekkers er nog werkten? |
| `ldd_recognition` | Concretere terugkoppeling op wat goed ging en wat werd gewaardeerd | Koppel concreter terug wat goed gaat en wat wordt gewaardeerd. | Hoe hoort een medewerker nu dat het werk goed was: van wie, en wat wordt er dan precies genoemd? Wat is daar het afgelopen jaar aan veranderd? |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn. | Hoe snel krijgt een medewerker nu antwoord van de leidinggevende, en weet die vooraf wat die mag verwachten? En toen de vertrekkers er nog werkten? |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | Maak besluiten en verwachtingen stabieler en beter uitlegbaar. | Er verandert nu een besluit of verwachting. Wie legt uit waarom, en binnen hoeveel dagen? Ging dat het afgelopen jaar ook zo? |

### 3.2 De samenwerking in het team (`culture`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cud_safety` | Fouten of twijfels makkelijker en veiliger kunnen bespreken | Maak het makkelijker en veiliger om fouten of twijfels te bespreken. | Een medewerker meldt nu zelf een fout. Wie reageert, en wat zien collega's daarvan? En toen de vertrekkers er nog werkten? |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | Geef kritische vragen en afwijkende meningen meer ruimte. | In welk overleg kan een medewerker nu een kritische vraag stellen vóórdat een besluit vaststaat, en wat hoort die terug? Wat is daar het afgelopen jaar aan veranderd? |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | Maak spanningen of conflicten eerder bespreekbaar. | Twee collega's komen er nu samen niet uit. Wie begint erover, hoe snel, en wie helpt? En toen de vertrekkers er nog werkten? |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging. | Een collega houdt zich nu niet aan een teamafspraak. Wie zegt daar iets van, en waar staan die afspraken? Was dat een jaar geleden anders? |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raakten | Betrek medewerkers eerder bij besluiten of veranderingen die het team raken. | Welk besluit dat een team raakt komt eraan? Op welk moment praten medewerkers mee voordat het vaststaat? En hoe ging dat bij het vorige grote besluit? |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | Verbeter de samenwerking tussen teams of afdelingen. | Twee teams hangen nu van elkaars werk af. Wat spreken ze met elkaar af, en wie beslist als het botst? En toen de vertrekkers er nog werkten? |

### 3.3 Groeiperspectief (`growth`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij waren | Maak zichtbaar welke mogelijkheden er voor medewerkers zijn. | Waar ziet een medewerker vandaag welke functies, opleidingen of projecten er zijn, en wie wijst die erop? Stond dat er een jaar geleden ook? |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | Voer een concreter gesprek over ontwikkeling. | Wat weet een medewerker nu ná een ontwikkelgesprek dat die ervoor niet wist, en wie voert dat gesprek? Wat is daar het afgelopen jaar aan veranderd? |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op. | Waar staat een ontwikkelafspraak nu na het gesprek, en wie komt erop terug? Hoeveel afspraken van een jaar geleden zijn nagekomen? |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | Plan ontwikkeling in naast het reguliere werk. | Hoeveel uur per maand heeft een medewerker nu voor ontwikkeling, en wat gebeurt er als het druk is? Was dat een jaar geleden anders? |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei werd bepaald | Maak duidelijker hoe doorgroei wordt bepaald. | Wat moet een medewerker nu laten zien om door te groeien, en waar kan die dat nalezen? Stond dat er al toen de vertrekkers er nog werkten? |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie | Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie. | Welke vervolgstappen zijn er nu echt, en welke niet? Wie zegt dat eerlijk tegen een medewerker, en wanneer? Gebeurde dat een jaar geleden ook? |

### 3.4 Beloning en voorwaarden (`compensation`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cpd_insight` | Beter inzicht in hoe beloning zich verhield tot vergelijkbaar werk elders | Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders. | Een medewerker vraagt nu hoe jullie salaris zich verhoudt tot vergelijkbaar werk elders. Wat krijgt die te zien, en weten jullie het zelf? Was dat een jaar geleden anders? |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | Leg verschillen tussen vergelijkbare functies beter uit. | Welke verschillen tussen vergelijkbare functies kunnen jullie nu uitleggen, en welke niet? Wat doen jullie met een verschil dat niemand kan uitleggen? En een jaar geleden? |
| `cpd_review` | Beter kijken of beloning paste bij de zwaarte en verantwoordelijkheid van mijn werk | Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk. | Wanneer keken jullie voor het laatst of de beloning nog past bij hoe zwaar een functie is? Welke functies zijn sindsdien veranderd, en wie kijkt daar nu naar? |
| `cpd_path` | Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing | Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing. | Wat kan een medewerker nu de komende twee jaar aan salarisgroei verwachten, en wie vertelt dat? Kreeg een medewerker dat een jaar geleden ook te horen? |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei werden bepaald | Maak duidelijk hoe beloning en groei worden bepaald. | Stel dat een medewerker het nu vraagt: wie legt in twee minuten uit hoe een salaris en een volgende stap worden bepaald? Was die uitleg er een jaar geleden ook? |
| `cpd_flex` | Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit | Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit. | Wat kan er nu echt rond rooster en werktijden, voor welke functies, en waar staat dat? Was dat een jaar geleden anders? |

### 3.5 Werkbelasting (`workload`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | Baken het takenpakket en het werkvolume scherper af. | Er komt nu werk bij voor een team dat al vol zit. Wie zegt wat er dan afgaat? En toen de vertrekkers er nog werkten? |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | Laat planning en bezetting beter aansluiten op het werk dat er ligt. | Hoe ver vooruit weten jullie nu hoeveel werk er komt, en wie legt dat naast de bezetting? Keken jullie daar een jaar geleden ook zo naar? |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze. | Welke pieken zien jullie nu aankomen, en wie mag zeggen: dit kan er niet bij? Wie mocht dat zeggen toen de vertrekkers er nog werkten? |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | Maak meer ruimte om te herstellen en werk goed af te ronden. | Na een drukke periode: wat mag er nu blijven liggen, en hoe weet het team dat het mag? En toen de vertrekkers er nog werkten? |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | Maak duidelijker wat voorrang heeft en wat kan wachten. | Als alles belangrijk is: wie zegt nu hardop wat mag wachten, en hoe weet een medewerker dat op maandag? Was dat een jaar geleden anders? |
| `wld_friction` | Minder dubbel werk, systeemgedoe of fouten in overdracht | Haal dubbel werk, systeemgedoe en fouten in de overdracht weg. | Welk dubbel werk of systeemgedoe kost nu de meeste tijd, en wie lost het eerste punt op? Wat ervan bestond al toen de vertrekkers er nog werkten? |

### 3.6 Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | Maak de prioriteiten binnen rollen duidelijker. | Vraag een medewerker en de leidinggevende los van elkaar naar de drie belangrijkste dingen in dat werk. Krijg je nu twee keer hetzelfde lijstje? En een jaar geleden? |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik werd aangesproken | Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken. | Waarop wordt een medewerker nu aangesproken, en wist die dat vooraf? Waar staan die verwachtingen? Stonden ze er al toen de vertrekkers er nog werkten? |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | Maak opdrachten eenduidiger en stem beter af tussen betrokkenen. | Een medewerker krijgt nu van twee kanten iets anders te horen. Wie hakt de knoop door, en hoe snel? En toen de vertrekkers er nog werkten? |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket veranderde | Maak duidelijke afspraken wanneer een takenpakket verandert. | Er verandert nu een takenpakket. Wie bespreekt dat met de medewerker, vóór of na de verandering? Hoe ging dat bij de laatste wijziging? |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mocht beslissen | Maak duidelijk wat medewerkers zelf mogen beslissen. | Neem een functie die veel voorkomt. Waarover beslist iemand in die rol nu zelf, en wie vertelt dat? Was dat een jaar geleden even duidelijk? |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | Zorg voor betere informatie, context en overdracht. | Iemand neemt nu een klus of dienst over. Wat moet die weten, en wie zorgt dat het er ligt? En toen de vertrekkers er nog werkten? |

## 4. Waar ik over twijfel

Tien punten, van meest naar minst onzeker. De eerste drie zijn mijn zwakste vragen.

**1. `cpd_flex` (Behoud).** De route zelf is dubbel ("duidelijkheid of ruimte") en noemt drie dingen tegelijk. Mijn openingszin "Gaat het bij jullie om duidelijkheid of om ruimte?" vraagt het MT iets wat de data niet beantwoordt, dus het MT gaat raden. Dat is eerlijk over de dubbelheid, maar het is geen vertaling.
Alternatief: "Wat kan er bij jullie echt rond rooster en werktijden, voor welke functies, en waar vindt een medewerker dat zonder het te hoeven vragen?"

**2. `wld_friction` (Behoud).** "Kies er één" stuurt. Het is geen advies over wát, maar wel over hóe, en dat schuurt met "werkvragen, geen advies". Bovendien weet een MT vaak niet welk gedoe de meeste tijd kost; dan blijft de vraag hangen op de eerste zin.
Alternatief: "Waar meldt een medewerker bij jullie dubbel werk of systeemgedoe, wie pakt zo'n melding op, en hoe snel hoort die wat ermee gebeurt?"

**3. `wld_scope` (Vertrek), en daarmee het hele Vertrek-patroon.** "Wie had nee moeten zeggen" zoekt achteraf een schuldige en zit dicht tegen een oorzaak-claim aan: het suggereert dat er iets is nagelaten. De spec schrijft de vorm "had moeten zijn" voor, dus ik heb hem gevolgd, maar bij 36 vragen achter elkaar klinkt het als een verhoor. Daarnaast eindigen alle 36 Vertrek-vragen op een variant van "en nu?" (nu, vandaag, de eerstvolgende keer); per vraag goed, als set eentonig. Omdat het rapport er maar één of twee per keer toont, is dat minder erg dan het in dit document lijkt.
Alternatief voor deze rij: "Wat had bij jullie wel en niet bij de functie moeten horen, en waar had dat moeten staan? Waar staat het nu?"
Alternatief voor het patroon: overal "wie had moeten" vervangen door "hoe had dat geregeld moeten zijn". Dat is zachter, maar ook vager. Jouw keuze.

**4. `ldd_mandate` tegenover `rcd_mandate` (beide scans).** De code heeft dezelfde route onder twee onderwerpen (zie afwijking 8). Ik heb ze uit elkaar getrokken: onder aansturing gaat de vraag over hoe een leidinggevende reageert als een eigen beslissing anders uitpakt, onder rol over wat per functie vastligt. De aansturing-variant vertaalt daardoor iets anders dan wat de respondent letterlijk koos ("duidelijker wát ik mag beslissen", niet "rugdekking").
Alternatief `ldd_mandate`: "Welke drie beslissingen mag een medewerker bij jullie nemen zonder het eerst te vragen, en welke leidinggevende vertelt dat wanneer aan het team?"

**5. `cud_crossteam` (Behoud).** De eerste zin is eigenlijk een herkenningsvraag, en die is er al. En aan een MT-tafel zitten de hoofden van precies die afdelingen: "waar loopt het vast" nodigt uit tot wijzen naar elkaar.
Alternatief: "Wat spreken twee teams bij jullie met elkaar af als ze van elkaars werk afhangen, wie regelt dat, en wie beslist als het botst?"

**6. `cpd_clarity` (beide scans), "in twee minuten".** Concreet en onthoudbaar, maar het is een ja-neevraag met een testje erin. Een MT kan "ja" zeggen en doorlopen.
Alternatief: "Hoe wordt bij jullie een salaris en een volgende stap bepaald, wie legt dat uit, en wanneer hoort een medewerker het voor het eerst?"

**7. `cpd_review` (Vertrek).** "Had eerder gekeken moeten worden" zegt impliciet dat jullie te laat waren. Dat is een oordeel dat de data niet draagt.
Alternatief: "Hoe vaak had bij jullie gekeken moeten worden of de beloning nog paste bij de zwaarte van een functie, en door wie? Wanneer gebeurt dat de eerstvolgende keer?"

**8. `wld_recovery` (Behoud).** "Wie ziet dat een team moet bijkomen" heb ik al van "iemand" naar "een team" gezet om niet op de persoon te komen, maar herstel is per persoon; de vraag wordt er wat onnatuurlijk van.
Alternatief: "Wat mag er bij jullie na een drukke periode blijven liggen, wie beslist dat, en hoe weet het team dat het mag?"

**9. `grd_conversation` (Behoud).** Dit is letterlijk het voorbeeld uit de spec, en volgens mijn eigen generieke-zin-test de vlakste van de set: "wie, hoe vaak, wat moet eruit komen" past onder elk gesprek. Ik heb hem laten staan omdat jij hem al zag.
Alternatief: "Wat is bij jullie een concreet ontwikkelgesprek: wie voert het, hoe vaak, en wat staat er na afloop op papier?"

**10. `grd_nextstep` (Vertrek).** Het slot "voor welke functies is dat gesprek nu nog niet gevoerd" heb ik bewust op functies gezet en niet op personen. Maar een MT weet dat meestal niet, en de vraag duwt naar een actie.
Alternatief slot: "Wie voert dat gesprek nu, en wanneer?"

## 5. Afwijkingen van wat de spec aanneemt

1. **Aantallen kloppen.** Elk onderwerp heeft in `DIRECTION_SETS` acht opties: één `*_none`, zes inhoudelijke routes, één `*_other`. Zes onderwerpen × zes routes = 36 per scan, 72 samen, zoals de spec aanneemt. `*_none` en `*_other` hebben `imperative: None` en krijgen geen vertaalvraag.

2. **Eén opdrachtvorm, twee respondentteksten.** De `imperative` is tijd-neutraal en per route één keer gedefinieerd; de respondenttekst verschilt bij 13 van de 36 routes tussen Behoud en Vertrek. `WORK_QUESTIONS` heeft dus per routesleutel twee teksten nodig (`retention` en `exit`), in dezelfde vorm als `_t(...)`. Een ophaalfunctie naast `direction_imperative` moet, anders dan die functie, `scan_type` wél gebruiken.

3. **De verdeeld-variant past niet op `split_none`.** In die staat is de tweede groep de niets-optie. De vaste zin wordt dan "Je mensen zijn verdeeld tussen [route] en 'Niets, dit zit hier goed'. Welke van de twee past bij wat jullie kunnen waarmaken?", en dat is onzin: niets doen kun je altijd waarmaken. Voorstel voor een eigen zin: "Een deel van je mensen vraagt om [A], een ongeveer even groot deel zegt dat het hier goed zit. Waar zit dat verschil bij jullie: tussen afdelingen, functies of diensten?" Let op: dat blijft groepsniveau, het vraagt niet wie wat invulde.

4. **De verdeeld-variant past niet altijd op `divided`.** `divided` ontstaat ook als de grootste veranderoptie `*_other` is, of als er geen enkele veranderoptie gekozen is. Dan is er geen [A] of [B] met een tekst die je kunt noemen. De spec zegt niet wat het blok dan toont. Voorstel: in die gevallen geen vertaalvraag, en de herkenningsvraag en besluitvraag blijven staan. Geen verzonnen tweede route.

5. **`plurality` heeft wél een grootste groep.** De spec zet `plurality` bij de verdeelde staten, maar in die staat toont het rapport al de opdrachtvorm van de grootste route (35% of meer, voorsprong van twee). Vraag voor jou: daar de route-eigen vertaalvraag tonen met de grootste groep als noemer, of de verdeeld-zin? Ik zou de route-eigen vraag nemen; de verdeeld-zin negeert dan informatie die twee regels hoger wel staat.

6. **De verdeeld-variant bestaat niet voor Vertrek.** "Je mensen zijn verdeeld" en "de komende drie maanden waarmaken" zijn tegenwoordige tijd over mensen die weg zijn. Voorstel: "De mensen die weggingen waren verdeeld tussen [A] en [B]. Welke van de twee kunnen jullie de komende drie maanden waarmaken voor wie er nu werkt?"

7. **[A] en [B] staan in de ik-vorm.** Tien van de 36 routeteksten bevatten "ik", "mij" of "mijn" (`ldd_mandate`, `ldd_availability`, `grd_visibility`, `grd_conversation`, `cpd_review`, `rcd_priorities`, `rcd_expectations`, `rcd_scope`, `rcd_mandate`, `rcd_information`). In de verdeeld-zin moeten ze dus tussen aanhalingstekens, of de zin gebruikt de opdrachtvorm in plaats van de respondenttekst. De opdrachtvorm leest beter maar is een gebiedende wijs midden in een zin. Aanhalingstekens lijken me het veiligst.

8. **Geen vertaalvraag bij `too_few` en `none_needed`.** De spec zegt "gekozen op de meest gekozen richting", maar in deze twee staten is er geen route om op te kiezen. Bij `none_needed` zegt de meerderheid dat er niets hoeft, terwijl het onderwerp toch startpunt is. Dat vraagt om een eigen zin (bijvoorbeeld "De meesten zeggen dat dit hier goed zit, en toch scoort het laag. Hoe rijmen jullie dat?") of om het weglaten van de vertaalvraag. Nu ongedefinieerd; een besluit hierover hoort in plan 3b.

9. **Vijf routeparen overlappen tussen of binnen onderwerpen**, waardoor de generieke-zin-test daar per definitie moeilijk is. Ik heb ze uit elkaar geschreven, maar het blijft kunstmatig:
   - `ldd_mandate` en `rcd_mandate`: vrijwel dezelfde respondenttekst onder twee onderwerpen.
   - `wld_priorities` en `rcd_priorities`: voorrang in het werk tegenover prioriteiten in de rol.
   - `cpd_clarity`, `cpd_path` en `grd_criteria`: drie keer "hoe wordt groei of salaris bepaald".
   - `grd_conversation` en `grd_nextstep`: twee gesprekken over ontwikkeling.
   - `ldd_feedback` en `ldd_recognition`: feedback tegenover terugkoppeling op wat goed gaat.
   Dit is een eigenschap van de routesets, niet van de vertaalvragen. Aanpassen kost een versiebump van de routeset en hoort bij de herweging na twee of drie campagnes, niet nu.

10. **Routes die zich slecht laten vertalen.**
    - `cpd_flex`: dubbel ("duidelijkheid of ruimte") met drie objecten; zie twijfel 1.
    - `wld_peaks`: drie werkwoorden (plannen, verdelen, begrenzen); de vraag kan er maar twee dragen.
    - `cpd_insight`: veronderstelt dat het MT zelf weet hoe de beloning zich verhoudt tot elders. Vaak is dat niet zo, en daarom begint de vraag daar. Dat is eerlijk, maar het antwoord kan "dat weten we niet" zijn, en dan eindigt het gesprek bij een onderzoeksopdracht in plaats van een besluit.
    - Alle zes `ldd_*`-routes: de mensen aan tafel zijn zelf de leidinggevenden waar het over gaat. De vragen zijn op "een leidinggevende bij jullie" gezet, nooit op een afdeling of naam, maar het gesprek kan daar alsnog heen schuiven. De vaste regel uit spec par. 6 over de afdelingsmanager helpt hier niet; overweeg een vergelijkbare regel bij dit onderwerp.

11. **Onderwerpnamen.** Bijlage A van de spec noemt "leiderschap, cultuur, werkdruk, rolhelderheid". De respondent zag "de aansturing", "de samenwerking in het team", "werkbelasting" en "duidelijkheid over je rol", en het rapport heeft per scan weer eigen labels (Vertrek: "Leiderschap en feedback", "Werkdruk en balans", "Cultuur en veiligheid"). De vertaalvragen noemen het onderwerp bewust nergens bij naam, zodat ze onder elk label kloppen.

12. **Volgorde.** `DIRECTION_SETS` begint bij `workload`, `DEEPENING_FACTOR_KEYS` bij `leadership`. Dit document volgt `DEEPENING_FACTOR_KEYS`, omdat `get_direction_sets` dat ook doet. Voor `WORK_QUESTIONS` maakt de volgorde niet uit; een contenttest moet wel afdwingen dat elke inhoudelijke routesleutel precies één vraag per scan heeft en dat `*_none` en `*_other` er geen hebben.

## 6. Versie 2: wat er uit de review van 21 september is verwerkt

Bron: `docs/superpowers/specs/2026-09-21-vertaalvragen-review.md` (13 goed, 54 scherper, 5 onhoudbaar). In de tabellen van sectie 2 en 3 hierboven staat nu de definitieve tekst: 59 vragen zijn vervangen door de herschrijving, 13 zijn ongewijzigd. De oorspronkelijke conceptvragen staan in de review, kolom "Conceptvraag". Sectie 4 en 5 hieronder zijn van versie 1 en blijven staan als achtergrond.

**Besluiten Lars, 21 september 2026 (via het keuzeformulier in de hoofdsessie):**

1. **Loep Vertrek: nu eerst, toen als toets.** Akkoord. Alle 36 Vertrek-vragen gaan over wie er nu werkt, met het verleden als feitelijke toets aan het eind. De vorm "wie had ... moeten" vervalt. Dit wijkt af van "verleden-tijd-stem" in de rapport-spec par. 6 en Bijlage A; het amendement staat in sectie 7.
2. **Behoud begint bij wat een medewerker meemaakt**, niet bij wat er geregeld is. Akkoord.
3. **De verdeeld-zinnen noemen de routes niet meer.** Akkoord.
4. **Eén vaste regel onder het onderwerp aansturing.** Akkoord, met deze tekst: "Deze vraag gaat ook over de leidinggevenden aan deze tafel. Beantwoord hem eerst voor je eigen team."
5. **`ldd_mandate` (Behoud): de zachtere versie.** De herschrijving uit de review ("Noemt iedere leidinggevende aan deze tafel dezelfde drie ...") maakte van de tafel een proef; Lars kiest als HR-professional de conceptvraag.
6. **`cpd_clarity` (Behoud en Vertrek): de zachtere versie** ("Stel dat een medewerker het morgen vraagt ..."), om dezelfde reden.
7. **`rcd_priorities` (Behoud en Vertrek): de opdracht-versie uit de review** ("Vraag een medewerker en de leidinggevende los van elkaar ..."). Bekend nadeel: het is een opdracht voor na het overleg, geen vraag die aan tafel te beantwoorden is. Lars kiest hem omdat twee lijstjes naast elkaar niet met een vermoeden af te doen zijn.
8. **De tien vragen waar het rapport het meest op leunt** (review sectie 4) zijn één voor één voorgelegd en alle tien goedgekeurd. De overige vragen gaan mee zoals ze in versie 2 staan.

**Bekend en geaccepteerd:** `cpd_flex` is een noodvraag. De route zelf is een opdracht met "of" erin (duidelijkheid of ruimte) en moet bij de herweging na twee of drie campagnes worden gesplitst. `wld_friction` laat "fouten in overdracht" uit de route liggen.

## 7. Amendement voor plan 3b, taak 13

Geldt zodra bovenaan dit document `Status: akkoord` staat. De extractie in taak 13 (laatste cel per rij in sectie 2 en 3) werkt ongewijzigd. Wat wel verandert:

1. **`WORK_QUESTION_VARIANTS` zonder `{a}` en `{b}`.** De vier zinnen uit de tabel bovenaan zijn vaste teksten. `translation_question` vult bij `divided` en `split_none` niets meer in; de routeteksten worden niet geciteerd. De guardtest `test_verdeeld_zinnen_zijn_compleet_en_citeren_de_routeteksten` wordt: beide staten, beide scans, geen accolades in de tekst, en de Vertrek-zinnen bevatten niet "zijn verdeeld".
2. **Guard op de Vertrek-stem.** `test_vertrek_staat_niet_in_de_tegenwoordige_tijd_vorm` blijft ("Wat is bij jullie" komt niet voor), en er komt een test bij: elke Vertrek-vraag bevat een terugblik. Toegestane vormen: "toen de vertrekkers", "een jaar geleden", "het afgelopen jaar", "sindsdien", "voor het laatst", "de laatste wijziging", "het vorige".
3. **Vaste regel bij aansturing.** In het blok "Zo maak je er een besluit van" komt onder de vertaalvraag, alleen als het onderwerp `leadership` is, de regel uit punt 4 van sectie 6. Eén constante, een test dat hij bij geen ander onderwerp verschijnt.
4. **Spec.** Voeg aan `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` onder "Afwijkingen" toe: Vertrek-vertaalvragen staan in de tegenwoordige tijd met een verleden-tijd-toets (review 21-9, akkoord Lars), in plaats van de verleden-tijd-stem uit par. 6 en Bijlage A.
5. **Pagina.** Drie vragen per punt, tot 32 woorden per vertaalvraag, op een gespreksagenda die al vol is. Meet na het vullen opnieuw met `scripts/check_pdf_report.py` in het productie-image; loopt de pagina over, dan gaat het werkvragenblok van het tweede punt naar de volgende pagina, niet de lettergrootte omlaag.

