# Juridische ronde: voorwaarden, privacyverklaring en verwerkersovereenkomst

Datum: 2026-09-24
Status: akkoord Lars 2026-09-24 (alle zes keuzes op advies, zelf goedgekeurd), doorgevoerd; opschoontaak volgt in de fixronde (deel C)
Hoort bij: besluit Lars 24-9 ("mini-ronde met voorstel per zin, vóór de eerste offerte"), besluit A van 19-9 (bespreking uit het aanbod), de klantsuite (klant verstuurt zelf).

## 1. Waarom dit meer is dan het woord "begeleid"

De drie pagina's beschrijven de dienst van juni. Sindsdien is er veel veranderd, en een deel daarvan raakt de juistheid van wat Loep juridisch belooft of verklaart.

1. **De voorwaarden beloven "persoonlijke toelichting op de uitkomsten".** Dat is de bespreking die sinds besluit A niet meer bestaat. Een klant kan hem op grond van deze zin opeisen.
2. **Alle drie zeggen dat Loep uitnodigingen en herinneringen aan respondenten verstuurt, en daarvoor hun e-mailadressen verwerkt.** Sinds de klantsuite verstuurt de klant zelf en ontvangt Loep geen namen of e-mailadressen van respondenten. De privacyverklaring beschrijft dus méér verwerking dan er plaatsvindt. Dat is juridisch niet gevaarlijk, maar het is onjuist, en het verzwijgt je sterkste privacy-argument.
3. **Loep Start ontbreekt** in de privacyverklaring en de verwerkersovereenkomst, terwijl je het verkoopt. Een verwerkersovereenkomst die een product niet noemt, dekt de verwerking voor dat product niet.
4. **De voorwaarden noemen "een combinatie daarvan"**, een product dat in juni is geschrapt.
5. **De bewaartermijn verschilt.** De privacyverklaring belooft maximaal twee jaar na afronding. De verwerkersovereenkomst zegt "conform het overeengekomen bewaarbeleid", zonder termijn. En er is geen automatische opschoning (open punt L6 uit de security-audit van juli): de twee jaar is nu een belofte zonder mechanisme.

Wat dit document niet is: juridisch advies. De wijzigingen zijn feitelijke correcties zodat de teksten beschrijven wat Loep doet. Twee zinnen zijn nieuw en beschermend (V4 en V5); die zou ik door een jurist laten meelezen als je er één bij de hand hebt. De aansprakelijkheidsbeperking en de rest van de opbouw blijven ongewijzigd.

## 2. Wat Loep feitelijk verwerkt (gecontroleerd in de code, 24-9)

- **Respondenten:** antwoorden op de vragenlijst, de afdeling (gekozen door de respondent of meegegeven in de afdelingslink), open antwoorden, en een gehashte willekeurige sleutel die de browser zelf maakt om dubbel invullen te voorkomen (`backend/self_send.py`, `hash_dedup_key`: SHA-256 van een willekeurige UUID, geen identificerend gegeven). Geen naam, geen e-mailadres.
- **Uitzondering:** de oude werkwijze waarin Loep zelf uitnodigde (`comms_mode = managed`) kan niet meer worden aangemaakt, maar bestaat nog in de code en in oude metingen. Daarbij zijn wel e-mailadressen verwerkt. De teksten houden daarom een uitzondering "tenzij schriftelijk afgesproken" open.
- **HR-gebruikers:** naam, zakelijk e-mailadres, inloggegevens. De herinneringsmail gaat naar de HR-gebruiker, niet naar respondenten.
- **Open antwoorden:** kunnen namen bevatten; Loep haalt herkende namen automatisch weg voordat ze in een rapport komen (sinds de audit van juli eerlijk geformuleerd als "herkende").

## 3. Voorstel per zin

Toon: de voorwaarden en de privacyverklaring gebruiken al "je"; de verwerkersovereenkomst is formeel ("Verwerker", "u") en blijft dat.

### Voorwaarden (`frontend/app/voorwaarden/page.tsx`)

| # | Nu | Wordt | Waarom |
|---|---|---|---|
| V1 | **Loep:** de dienst en software voor Loep Vertrek, Loep Behoud, rapportage en bijbehorende begeleiding. | **Loep:** de dienst en software voor Loep Vertrek, Loep Behoud en Loep Start, met de inrichting van de meting en het rapport. | "Begeleiding" weg, Loep Start erbij. |
| V2 | Loep levert begeleide productvormen met software, uitnodigingen, analyse en rapportage. Dat kan onder meer bestaan uit Loep Vertrek, Loep Behoud of een combinatie daarvan, met: | Loep levert medewerkersonderzoek als dienst: Loep Vertrek, Loep Behoud en Loep Start. Per meting omvat dat: | "Combinatie" bestaat niet meer; "uitnodigingen" doet de klant. |
| V3a | inrichting van de campagne; | de inrichting van de meting, met de afdelingen en aantallen die de klant aanlevert; | Wie wat aanlevert. |
| V3b | versturen van uitnodigingen en herinneringen; | een uitnodigings- en herinneringstekst die de klant zelf verstuurt vanuit de eigen mailbox; | Onjuist sinds de klantsuite. |
| V3c | verzamelen en analyseren van antwoorden; | ongewijzigd | |
| V3d | dashboardtoegang en rapportage; | een eigen omgeving waarin de klant de respons volgt, de meting sluit of verlengt, het rapport downloadt en het besluit vastlegt; | Beschrijft wat er is. |
| V3e | persoonlijke toelichting op de uitkomsten. | een rapport met gespreksleidraad en besluitpagina, waarmee de klant het gesprek met het management zelf voert. | **Belangrijkste wijziging.** De oude zin belooft de bespreking. |
| V4 | De standaarddienst is organisatiegebonden en begeleid van opzet. Loep biedt op dit moment geen publieke self-service checkout, seat- of usageabonnementen, tenzij schriftelijk anders overeengekomen. | De dienst wordt per organisatie ingericht na een intake. Een bespreking of presentatie van de uitkomsten door Loep maakt geen deel uit van de dienst, tenzij schriftelijk anders overeengekomen. Loep biedt geen publieke zelfbestelling en geen abonnementen per gebruiker of per gebruik, tenzij schriftelijk anders overeengekomen. | **Nieuw en beschermend:** legt vast dat de bespreking niet inbegrepen is. Jargon ("checkout", "seat", "usage") eruit. |
| V5 | (nieuw, in "Wat verwachten wij van de klant?") | Dat de klant de uitnodiging aan de juiste groep verstuurt en het aantal uitgenodigden naar waarheid opgeeft. Dat aantal bepaalt het responspercentage in het rapport. | **Nieuw:** de juistheid van het rapport hangt aan een getal dat de klant invult. |
| V6 | Dat respondenten passend worden geinformeerd over de verwerking van hun gegevens. | Dat respondenten passend worden geïnformeerd over de verwerking van hun gegevens. | Trema. |

### Privacyverklaring (`frontend/app/privacy/page.tsx`)

| # | Nu | Wordt | Waarom |
|---|---|---|---|
| P1 | Loep is een in Nederland gevestigde dienst voor begeleide HR-signalering en rapportage. | Loep is een in Nederland gevestigde dienst voor medewerkersonderzoek en rapportage. | "Begeleid" weg. |
| P2 | Loep helpt HR-teams om vertrekredenen beter te begrijpen via Loep Vertrek en om eerder te zien waar behoud onder druk staat via Loep Behoud. | ... via Loep Behoud, en om te zien hoe nieuwe medewerkers landen via Loep Start. | Loep Start erbij. |
| P3 | **Respondenten:** e-mailadres voor uitnodiging, antwoorden op de vragenlijst en beperkte contextgegevens die de klant zelf aanlevert, zoals afdeling of functieniveau. | **Respondenten:** antwoorden op de vragenlijst, de afdeling, en een willekeurige sleutel die voorkomt dat dezelfde browser twee keer invult. De klant verstuurt de uitnodiging zelf; Loep ontvangt en bewaart geen namen of e-mailadressen van respondenten, tenzij schriftelijk is afgesproken dat Loep de uitnodigingen verstuurt. Open antwoorden kunnen toch een naam bevatten; herkende namen haalt Loep automatisch weg voordat ze in een rapport komen. | Klopt nu niet, en dit is je sterkste privacy-argument. |
| P4 | Om uitnodigingen en herinneringen te versturen aan respondenten. | Om de klantorganisatie op de afgesproken dag een herinnering te sturen, en om respondenten uit te nodigen alleen als dat schriftelijk is afgesproken. | De herinnering gaat naar HR, niet naar respondenten. |
| P5 | Om klantorganisaties te helpen hun uitstroom te duiden en behoud eerder op groepsniveau te signaleren via Loep Behoud. | Om klantorganisaties te helpen op groepsniveau te zien waar het wringt bij vertrek, behoud en de start van nieuwe medewerkers. | Loep Start, en geen jargon ("duiden", "signaleren"). |
| P6 | Campagnedata wordt bewaard zolang dat nodig is voor het overeengekomen traject en maximaal 2 jaar na afronding van de campagne, tenzij een andere bewaartermijn schriftelijk is afgesproken. Respondentgegevens die alleen nodig zijn voor uitnodiging en herinneringen worden niet langer bewaard dan functioneel nodig. | Gegevens van een meting bewaart Loep zolang dat nodig is voor de dienst, en uiterlijk twee jaar na het sluiten van de meting, tenzij schriftelijk een andere termijn is afgesproken. Daarna verwijdert of anonimiseert Loep ze. | Tweede zin vervalt (er zijn geen uitnodigingsgegevens). Zie keuze B hieronder over het mechanisme. |

### Verwerkersovereenkomst (`frontend/app/dpa/page.tsx`)

| # | Nu | Wordt | Waarom |
|---|---|---|---|
| D1 | Loep, Nederlandse dienst voor begeleide HR-signalering en rapportage. | Loep, Nederlandse dienst voor medewerkersonderzoek en rapportage. | "Begeleid" weg. |
| D2 | ... in het kader van de Loep Vertrek- en/of Loep Behoud-dienstverlening van Verwerker. (ook in de paginabeschrijving en par. 3 en de passage over Loep Behoud) | ... in het kader van de dienstverlening van Verwerker voor Loep Vertrek, Loep Behoud en/of Loep Start. | **Dekking:** Loep Start viel buiten de overeenkomst. |
| D3 | **Respondentgegevens:** e-mailadres voor uitnodiging en herinnering, surveyantwoorden en beperkte contextgegevens zoals afdeling, functieniveau of diensttijd. | **Respondentgegevens:** antwoorden op de vragenlijst, afdeling en een willekeurige sleutel tegen dubbel invullen. E-mailadressen van respondenten uitsluitend indien schriftelijk is overeengekomen dat Verwerker de uitnodigingen verstuurt. | Klopt nu niet. |
| D4 | ... ten behoeve van de uitvoering van Loep Vertrek en/of Loep Behoud, inclusief uitnodigingen, herinneringen, dashboardtoegang, rapportage en noodzakelijke technische beveiliging. | ... ten behoeve van de uitvoering van Loep Vertrek, Loep Behoud en/of Loep Start, inclusief de inrichting van de meting, herinneringen aan de Verwerkingsverantwoordelijke, dashboardtoegang, rapportage en noodzakelijke technische beveiliging. | Idem. |
| D5 | Na afloop van de dienstverlening verwijdert of anonimiseert Verwerker persoonsgegevens conform het overeengekomen bewaarbeleid, tenzij wettelijke verplichtingen een langere bewaring vereisen. | Verwerker verwijdert of anonimiseert persoonsgegevens uiterlijk twee jaar na het sluiten van de meting, of eerder op verzoek van de Verwerkingsverantwoordelijke, tenzij schriftelijk een andere termijn is overeengekomen of wettelijke verplichtingen een langere bewaring vereisen. | Eén termijn in beide documenten. |
| D6 | De categorieen betrokkenen zijn: | De categorieën betrokkenen zijn: | Trema. |

## 4. Keuzes voor Lars

**A. Akkoord met de teksten zoals hierboven,** of per blok aanpassen. Advies: akkoord; de nieuwe zinnen V4 en V5 kort laten meelezen als je een jurist kent, anders ook akkoord (ze beperken jouw risico, ze vergroten het niet).

**B. De bewaartermijn van twee jaar en het mechanisme.** Beide documenten beloven straks "uiterlijk twee jaar". Er is geen automatische opschoning.
- **Advies: een kleine opschoontaak bouwen vóór de eerste klant** (één script of geplande taak dat metingen ouder dan twee jaar na sluiten anonimiseert, met een test en een log). Een belofte in een verwerkersovereenkomst zonder mechanisme is precies waar een AVG-vraag van een klant op stuk loopt.
- Alternatief: handmatig, met een terugkerende herinnering. Dat werkt zolang er weinig klanten zijn.

**C. Wie het laatste woord heeft.** Advies: jij keurt goed; een jurist alleen voor V4 en V5 als die er makkelijk bij is. Een volledige juridische review is voor deze fase te zwaar.

## 5. Uitvoering na akkoord

Kleine taak, geen plan nodig: de zinnen vervangen in de drie pagina's, een guardtest die "begeleid", "persoonlijke toelichting" en "e-mailadres voor uitnodiging" in de juridische pagina's verbiedt, tsc en de testsuite op baseline, en een live check. De gepersonaliseerde verwerkersovereenkomst die je naar klanten stuurt (als die buiten de repo bestaat) moet dezelfde wijzigingen krijgen.
