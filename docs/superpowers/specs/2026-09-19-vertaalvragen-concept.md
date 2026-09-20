# Vertaalvragen voor het blok "Zo maak je er een besluit van" (concept)

Datum: 2026-09-19
Status: concept, wacht op review Lars
Hoort bij: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` par. 6 en Bijlage A (plan 3b)
Bron van de routes: `DIRECTION_SETS` in `backend/products/shared/deepening.py` (retention v2, exit v1)

## 1. Wat dit is

Dit zijn de 72 vertaalvragen: per scan 6 onderwerpen × 6 routes, de middelste van de drie vragen in het blok "Zo maak je er een besluit van".
Het rapport kiest de vraag die hoort bij de route die de meeste medewerkers kozen; het MT moet hem kunnen beantwoorden zonder dat er iemand van Loep aan tafel zit.
Review per rij: zet er "akkoord" achter of herschrijf de vraag. Een rij zonder opmerking geldt als niet beoordeeld.
`WORK_QUESTIONS` in de code wordt pas gevuld na jouw akkoord; tot dan staat er niets van dit document in het rapport.
Begin bij sectie 4 (waar ik over twijfel) en sectie 5 (afwijkingen): daar zitten de besluiten die meer dan één rij raken.

**De verdeeld-variant staat hier één keer en wordt per onderwerp niet herhaald.** Bij een verdeelde richting (`divided`, `plurality`, `split_none`) vervangt deze vaste zin uit de spec de vertaalvraag:

> Je mensen zijn verdeeld tussen [A] en [B]. Welke van de twee past bij wat jullie de komende drie maanden kunnen waarmaken?

Die zin werkt niet in elke staat en niet voor Loep Vertrek. Zie sectie 5, punten 3 tot en met 6.

**Hoe ik de vragen heb gebouwd.** Het uitgangspunt uit de spec ("Wat is bij jullie een concrete [route]: wie, hoe vaak, wat moet eruit komen?") heb ik als startpunt genomen, niet als mal. Elke vraag eindigt op iets dat alleen bij die route hoort (wat er afvalt als er werk bijkomt, wat er gebeurt als een beslissing anders uitpakt, wat iemand terughoort over zijn inbreng), zodat hij niet ongewijzigd onder een ander onderwerp kan staan. Vertrek kijkt terug en eindigt op wie er nu werkt, zonder te zeggen dat het vertrek daardoor kwam.

De volgorde van de onderwerpen volgt `DEEPENING_FACTOR_KEYS`. De onderwerpnamen zijn de namen uit de vraag die de respondent zag.

## 2. Loep Behoud (retention), tegenwoordige tijd

### 2.1 De aansturing (`leadership`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `ldd_feedback` | Meer bruikbare feedback en richting | Geef meer bruikbare feedback en richting. | Wat is bij jullie bruikbare feedback: wie geeft die, hoe vaak, en wat kan een medewerker er de volgende dag mee? |
| `ldd_mandate` | Duidelijker wat ik zelf mag beslissen in mijn werk | Maak duidelijker wat medewerkers zelf mogen beslissen. | Welke drie beslissingen mag een medewerker bij jullie nemen zonder het eerst te vragen, en hoe reageert een leidinggevende als zo'n beslissing anders uitpakt? |
| `ldd_escalation` | Duidelijkere steun als er spanningen zijn of situaties vastlopen | Bied duidelijkere steun als er spanningen zijn of situaties vastlopen. | Als iets vastloopt of er spanning is: bij wie kan een medewerker terecht, hoe snel komt er antwoord, en wat doet de leidinggevende dan wel en niet? |
| `ldd_recognition` | Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd | Koppel concreter terug wat goed gaat en wat wordt gewaardeerd. | Hoe hoort iemand bij jullie dat zijn of haar werk goed was: van wie, hoe snel erna, en wat wordt er dan precies genoemd? |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn. | Wat mag een medewerker bij jullie van een leidinggevende verwachten: hoe vaak zien ze elkaar, hoe snel komt er antwoord, en hoe weet de medewerker dat? |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | Maak besluiten en verwachtingen stabieler en beter uitlegbaar. | Als een besluit of verwachting bij jullie verandert: wie legt uit waarom, aan wie, en binnen hoeveel dagen? En wat als het daarna weer wijzigt? |

### 2.2 De samenwerking in het team (`culture`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cud_safety` | Fouten of twijfels makkelijker en veiliger kunnen bespreken | Maak het makkelijker en veiliger om fouten of twijfels te bespreken. | Waar kan iemand bij jullie een fout of twijfel melden zonder dat het tegen hem of haar werkt: in welk overleg, bij wie, en wat gebeurt er daarna mee? |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | Geef kritische vragen en afwijkende meningen meer ruimte. | Op welk moment is tegenspraak bij jullie echt welkom: in welk overleg, vóór welk besluit, en wat doen jullie zichtbaar met een kritische vraag? |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | Maak spanningen of conflicten eerder bespreekbaar. | Wanneer is een spanning bij jullie groot genoeg om te bespreken: wie begint erover, hoe snel, en wie helpt als twee collega's er samen niet uitkomen? |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging. | Welke drie afspraken over samenwerken heeft elk team bij jullie nodig, wie spreekt iemand erop aan, en wanneer kijken jullie of ze nog werken? |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raken | Betrek medewerkers eerder bij besluiten of veranderingen die het team raken. | Bij welk soort besluit praten medewerkers bij jullie mee vóórdat het vaststaat: op welk moment, in welke vorm, en wat horen ze terug over hun inbreng? |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | Verbeter de samenwerking tussen teams of afdelingen. | Tussen welke teams of afdelingen loopt werk bij jullie het vaakst vast? Wie is eigenaar van die overdracht, en wat spreken die teams met elkaar af? |

### 2.3 Groeiperspectief (`growth`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij zijn | Maak zichtbaar welke mogelijkheden er voor medewerkers zijn. | Waar kan een medewerker bij jullie vandaag zien welke functies, opleidingen of projecten er zijn? Wie houdt dat bij, en wie vertelt het? |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | Voer een concreter gesprek over ontwikkeling. | Wat is bij jullie een concreet ontwikkelgesprek: wie voert het, hoe vaak, en wat moet eruit komen? |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op. | Waar staat een ontwikkelafspraak bij jullie na het gesprek, wie kijkt er na drie maanden naar, en hoe ziet de medewerker dat er iets mee gebeurt? |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | Plan ontwikkeling in naast het reguliere werk. | Hoeveel uur per maand mag ontwikkeling bij jullie kosten, wie vangt het werk dan op, en wat gebeurt er als het druk is? |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei wordt bepaald | Maak duidelijker hoe doorgroei wordt bepaald. | Wat moet iemand bij jullie laten zien om door te groeien, wie beslist daarover, en waar kan een medewerker dat nalezen voordat hij of zij het vraagt? |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie | Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie. | Welke vervolgstappen zijn er bij jullie echt, en welke niet? Wie zegt dat eerlijk tegen een medewerker, en op welk moment in het jaar? |

### 2.4 Beloning en voorwaarden (`compensation`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cpd_insight` | Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders | Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders. | Weten jullie zelf hoe jullie beloning zich verhoudt tot vergelijkbaar werk elders? Wat daarvan kunnen jullie delen, met wie, en wie legt het uit? |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | Leg verschillen tussen vergelijkbare functies beter uit. | Welke verschillen tussen vergelijkbare functies kunnen jullie goed uitleggen en welke niet? Wie legt ze uit, en wat doen jullie met een verschil dat niemand kan uitleggen? |
| `cpd_review` | Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk | Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk. | Wanneer keken jullie voor het laatst of functies nog passen bij hun zwaarte? Welke functies komen eerst, wie kijkt, en wanneer horen medewerkers de uitkomst? |
| `cpd_path` | Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing | Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing. | Wat kan een medewerker bij jullie de komende twee jaar aan salarisgroei verwachten: onder welke voorwaarden, op welk moment, en wie vertelt dat? |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei worden bepaald | Maak duidelijk hoe beloning en groei worden bepaald. | Kan een leidinggevende bij jullie in twee minuten uitleggen hoe een salaris en een volgende stap worden bepaald? Zo nee, wat ontbreekt er, en wie maakt dat? |
| `cpd_flex` | Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit | Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit. | Gaat het bij jullie om duidelijkheid of om ruimte? Wat kan er echt rond rooster en werktijden, voor welke functies, en wie beslist over een verzoek? |

### 2.5 Werkbelasting (`workload`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | Baken het takenpakket en het werkvolume scherper af. | Wat hoort bij jullie wel en niet bij een functie, en wie zegt nee als er werk bijkomt? Wat gaat er dan af? |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | Laat planning en bezetting beter aansluiten op het werk dat er ligt. | Hoe ver vooruit weten jullie hoeveel werk er komt, wie zet dat af tegen de bezetting, en wat doen jullie als die twee niet kloppen? |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze. | Welke pieken kunnen jullie zien aankomen, en welke niet? Wie verdeelt het spoedwerk, en wie mag zeggen: dit kan er nu niet bij? |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | Maak meer ruimte om te herstellen en werk goed af te ronden. | Wat gebeurt er bij jullie na een drukke periode: wie ziet dat een team moet bijkomen, wat mag er dan blijven liggen, en wie beslist dat? |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | Maak duidelijker wat voorrang heeft en wat kan wachten. | Als alles belangrijk is: wie beslist bij jullie wat eerst gaat en wat mag wachten, en hoe weet een medewerker dat aan het begin van de week? |
| `wld_friction` | Minder dubbel werk, systeemgedoe of fouten in overdracht | Haal dubbel werk, systeemgedoe en fouten in de overdracht weg. | Welk dubbel werk of systeemgedoe kost bij jullie de meeste tijd? Kies er één: wie lost het op, en vóór welke datum? |

### 2.6 Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | Maak de prioriteiten binnen rollen duidelijker. | Kan iedere medewerker bij jullie de drie belangrijkste dingen van zijn of haar functie noemen? Wie bespreekt die, hoe vaak, en wanneer veranderen ze? |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik word aangesproken | Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken. | Waarop wordt een medewerker bij jullie aangesproken, en wist die dat vooraf? Wie spreekt verwachtingen uit, op welk moment, en waar staan ze? |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | Maak opdrachten eenduidiger en stem beter af tussen betrokkenen. | Wat doet een medewerker bij jullie die van twee kanten iets anders te horen krijgt? Wie hakt de knoop door, en hoe snel? |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket verandert | Maak duidelijke afspraken wanneer een takenpakket verandert. | Als een takenpakket bij jullie verandert: wie bespreekt dat, vóór of na de verandering, wat valt er dan af, en waar leggen jullie het vast? |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mag beslissen | Maak duidelijk wat medewerkers zelf mogen beslissen. | Neem een functie die bij jullie veel voorkomt. Waarover beslist iemand in die rol zelf, waarover samen en waarover niet, en wie vertelt dat bij de start? |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | Zorg voor betere informatie, context en overdracht. | Welke informatie heeft iemand bij jullie nodig aan het begin van een klus of dienst, wie levert die aan, en hoe gaat het bij een overdracht? |

## 3. Loep Vertrek (exit), verleden tijd

De opdrachtvorm is in de code tijd-neutraal en dus dezelfde als bij Behoud. De kolom "Wat de respondent zag" toont de exit-tekst; bij 13 van de 36 routes wijkt die af van Behoud (verleden tijd), bij 23 is hij bewust gelijk (`SAME`).

### 3.1 De aansturing (`leadership`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `ldd_feedback` | Meer bruikbare feedback en richting | Geef meer bruikbare feedback en richting. | Wat had bij jullie bruikbare feedback moeten zijn: van wie, hoe vaak, en waarover? Krijgt wie er nu werkt die wel? |
| `ldd_mandate` | Duidelijker wat ik zelf mocht beslissen in mijn werk | Maak duidelijker wat medewerkers zelf mogen beslissen. | Welke beslissingen hadden medewerkers bij jullie zelf mogen nemen, en wie had dat moeten zeggen? Weten de mensen die er nu werken het wel? |
| `ldd_escalation` | Duidelijkere steun als er spanningen waren of situaties vastliepen | Bied duidelijkere steun als er spanningen zijn of situaties vastlopen. | Bij wie had iemand moeten kunnen aankloppen als iets vastliep of er spanning was, en wat had daar moeten gebeuren? Weet wie er nu werkt waar die deur is? |
| `ldd_recognition` | Concretere terugkoppeling op wat goed ging en wat werd gewaardeerd | Koppel concreter terug wat goed gaat en wat wordt gewaardeerd. | Hoe had iemand bij jullie moeten horen dat zijn of haar werk goed was: van wie, hoe snel, hoe concreet? Hoe hoort wie er nu werkt dat? |
| `ldd_availability` | Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende | Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn. | Wat hadden medewerkers bij jullie van hun leidinggevende mogen verwachten: hoe vaak contact, hoe snel antwoord? Wat mogen de mensen die er nu werken verwachten? |
| `ldd_consistency` | Stabielere en beter uitlegbare besluiten en verwachtingen | Maak besluiten en verwachtingen stabieler en beter uitlegbaar. | Wie had bij jullie moeten uitleggen waarom een besluit of verwachting veranderde, aan wie, en hoe snel? Hoe gaat dat bij het eerstvolgende besluit? |

### 3.2 De samenwerking in het team (`culture`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cud_safety` | Fouten of twijfels makkelijker en veiliger kunnen bespreken | Maak het makkelijker en veiliger om fouten of twijfels te bespreken. | Waar had iemand bij jullie een fout of twijfel veilig moeten kunnen melden, en wat had er dan mee moeten gebeuren? Waar kan dat nu? |
| `cud_dissent` | Meer ruimte voor kritische vragen en afwijkende meningen | Geef kritische vragen en afwijkende meningen meer ruimte. | Op welk moment had tegenspraak bij jullie welkom moeten zijn: in welk overleg, vóór welk besluit? Waar is die ruimte er nu wel? |
| `cud_conflict` | Spanningen of conflicten eerder bespreekbaar maken | Maak spanningen of conflicten eerder bespreekbaar. | Wanneer had een spanning bij jullie besproken moeten worden, en wie had daarmee moeten beginnen? Wie doet dat nu, en hoe snel? |
| `cud_agreements` | Duidelijkere teamafspraken over gedrag, samenwerking en opvolging | Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging. | Welke afspraken over samenwerken hadden teams bij jullie moeten hebben, en wie had erop moeten letten? Welke daarvan ontbreken vandaag nog? |
| `cud_involvement` | Eerder betrokken worden bij besluiten of veranderingen die het team raakten | Betrek medewerkers eerder bij besluiten of veranderingen die het team raken. | Bij welk besluit hadden medewerkers bij jullie eerder moeten meepraten, en in welke vorm? Welk besluit komt eraan waarbij dat nog kan? |
| `cud_crossteam` | Betere samenwerking tussen teams of afdelingen | Verbeter de samenwerking tussen teams of afdelingen. | Tussen welke teams of afdelingen had de samenwerking bij jullie anders gemoeten, en wie had dat moeten oppakken? Wie is er vandaag eigenaar van? |

### 3.3 Groeiperspectief (`growth`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `grd_visibility` | Beter zicht op welke mogelijkheden er voor mij waren | Maak zichtbaar welke mogelijkheden er voor medewerkers zijn. | Waar hadden medewerkers bij jullie moeten kunnen zien welke mogelijkheden er waren, en wie had het moeten vertellen? Waar ziet wie er nu werkt dat? |
| `grd_conversation` | Een concreter gesprek over mijn ontwikkeling | Voer een concreter gesprek over ontwikkeling. | Wat had bij jullie een concreet ontwikkelgesprek moeten zijn: wie had het gevoerd, hoe vaak, en wat had eruit moeten komen? Krijgt wie er nu werkt dat gesprek? |
| `grd_followthrough` | Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen | Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op. | Waar hadden ontwikkelafspraken bij jullie moeten staan, en wie had moeten nagaan of ze werden nagekomen? Hoeveel afspraken van nu staan zwart op wit? |
| `grd_time` | Ontwikkeling beter inplannen naast het reguliere werk | Plan ontwikkeling in naast het reguliere werk. | Hoeveel tijd had ontwikkeling bij jullie mogen kosten naast het werk, en wie had die tijd moeten vrijmaken? Hoeveel tijd is er nu echt? |
| `grd_criteria` | Duidelijkere criteria voor hoe doorgroei werd bepaald | Maak duidelijker hoe doorgroei wordt bepaald. | Wat had iemand bij jullie moeten laten zien om door te groeien, en wie had dat moeten uitleggen? Kan wie er nu werkt dat ergens nalezen? |
| `grd_nextstep` | Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie | Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie. | Welk eerlijk gesprek over vervolgstappen had bij jullie gevoerd moeten worden: door wie, en op welk moment? Voor welke functies is dat gesprek nu nog niet gevoerd? |

### 3.4 Beloning en voorwaarden (`compensation`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `cpd_insight` | Beter inzicht in hoe beloning zich verhield tot vergelijkbaar werk elders | Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders. | Wat hadden jullie medewerkers kunnen laten zien over hoe jullie beloning zich verhield tot vergelijkbaar werk elders? Weten jullie dat nu zelf, en wat delen jullie ervan? |
| `cpd_explain` | Meer uitlegbaarheid van verschillen tussen vergelijkbare functies | Leg verschillen tussen vergelijkbare functies beter uit. | Welke verschillen tussen vergelijkbare functies hadden jullie moeten kunnen uitleggen, en wie had dat moeten doen? Welke kunnen jullie vandaag nog steeds niet uitleggen? |
| `cpd_review` | Beter kijken of beloning paste bij de zwaarte en verantwoordelijkheid van mijn werk | Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk. | Bij welke functies had eerder gekeken moeten worden of de beloning nog paste bij de zwaarte, en door wie? Welke functies zijn nu aan de beurt? |
| `cpd_path` | Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing | Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing. | Wat hadden medewerkers bij jullie moeten weten over salarisgroei: hoeveel, onder welke voorwaarden, wanneer? Wat weet wie er nu werkt daarover? |
| `cpd_clarity` | Meer duidelijkheid over hoe beloning en groei werden bepaald | Maak duidelijk hoe beloning en groei worden bepaald. | Wie had bij jullie moeten kunnen uitleggen hoe salaris en doorgroei werden bepaald, en op welk moment? Kan een leidinggevende dat vandaag in twee minuten? |
| `cpd_flex` | Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit | Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit. | Wat had er bij jullie gekund rond rooster, werktijden of flexibiliteit, en wie had daarover duidelijk moeten zijn? Wat kan er nu, en weet iedereen dat? |

### 3.5 Werkbelasting (`workload`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `wld_scope` | Takenpakket en werkvolume beter afbakenen | Baken het takenpakket en het werkvolume scherper af. | Wat had bij jullie wel en niet bij de functie moeten horen, en wie had nee moeten zeggen als er werk bijkwam? Wie zegt dat nu? |
| `wld_planning` | Planning en bezetting beter laten aansluiten op het werk dat er ligt | Laat planning en bezetting beter aansluiten op het werk dat er ligt. | Op welk moment hadden jullie kunnen zien dat bezetting en werk niet meer klopten, en wie had er dan iets aan moeten doen? Wie kijkt daar nu naar? |
| `wld_peaks` | Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen | Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze. | Welke pieken hadden jullie zien aankomen, en wie had het spoedwerk moeten verdelen of begrenzen? Wie mag nu zeggen: dit kan er niet bij? |
| `wld_recovery` | Meer ruimte om te herstellen en werk goed af te ronden | Maak meer ruimte om te herstellen en werk goed af te ronden. | Wat had er bij jullie na een drukke periode mogen blijven liggen, en wie had dat moeten beslissen? Wie beslist dat nu? |
| `wld_priorities` | Duidelijkere keuzes over wat voorrang heeft en wat kan wachten | Maak duidelijker wat voorrang heeft en wat kan wachten. | Wie had bij jullie moeten beslissen wat eerst ging en wat kon wachten, en hoe hadden medewerkers dat moeten horen? Hoe horen ze het nu? |
| `wld_friction` | Minder dubbel werk, systeemgedoe of fouten in overdracht | Haal dubbel werk, systeemgedoe en fouten in de overdracht weg. | Welk dubbel werk of systeemgedoe had bij jullie al weg moeten zijn, en wie had het moeten oppakken? Wat ervan bestaat vandaag nog? |

### 3.6 Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Wat de respondent zag | Opdrachtvorm uit de code | Vertaalvraag (concept) |
|---|---|---|---|
| `rcd_priorities` | Duidelijkere prioriteiten binnen mijn rol | Maak de prioriteiten binnen rollen duidelijker. | Wat hadden bij jullie de drie belangrijkste dingen van een functie moeten zijn, en wie had dat moeten bespreken? Kan wie er nu werkt ze noemen? |
| `rcd_expectations` | Duidelijkheid over verwachtingen en waarop ik werd aangesproken | Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken. | Waarop werden medewerkers bij jullie aangesproken, en wie had dat vooraf moeten zeggen? Weet wie er nu werkt waarop hij of zij wordt aangesproken? |
| `rcd_alignment` | Eenduidigere opdrachten en betere afstemming tussen betrokkenen | Maak opdrachten eenduidiger en stem beter af tussen betrokkenen. | Wie had bij jullie de knoop moeten doorhakken als een medewerker van twee kanten iets anders hoorde? Wie doet dat vandaag, en hoe snel? |
| `rcd_scope` | Duidelijke afspraken als mijn takenpakket veranderde | Maak duidelijke afspraken wanneer een takenpakket verandert. | Wat had er bij jullie afgesproken moeten worden als een takenpakket veranderde: door wie, vooraf of achteraf, wat viel eraf? Hoe gaat dat bij de eerstvolgende wijziging? |
| `rcd_mandate` | Duidelijkheid over wat ik zelf mocht beslissen | Maak duidelijk wat medewerkers zelf mogen beslissen. | Waarover had iemand in een veelvoorkomende functie bij jullie zelf mogen beslissen, en wie had dat moeten vertellen? Wie vertelt het nu bij de start? |
| `rcd_information` | Betere informatie, context en overdracht voor mijn werk | Zorg voor betere informatie, context en overdracht. | Welke informatie of overdracht hadden medewerkers bij jullie nodig om hun werk goed te doen, en wie had die moeten leveren? Wie levert die nu? |

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
