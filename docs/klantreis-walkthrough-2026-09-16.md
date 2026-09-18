# Klantreis-walkthrough ingelogde omgeving, 16 september 2026

Intake voor het plan "intuïtieve klantsuite" (blok D, E en G uit
`docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md`).

Uitgevoerd op productie (`https://www.getloep.nl`) met de vaste testklant uit
`docs/testklant.md`, ingelogd via `seed_test_tenant.py --login-link`. Rol:
Sanne, HR-manager van 180 medewerkers, net uitgenodigd, nooit eerder een
Loep-dashboard gezien, niemand legt iets uit. Schermafbeeldingen staan in
`docs/testklant/walkthrough/` (desktop 1280 px en mobiel 375 px, gemaakt met
Playwright; het browserpaneel gaf time-outs op screenshots).

Backend bij aanvang: `GET /api/health` gaf `version: 4805e92d82e3`, database
ok. De backend was dus geredeployd; de rapportdownload-500 hieronder is geen
"nog niet gedeployd"-geval.

Zwaarte:

- **Blokkerend**: Sanne loopt vast of doet iets fout dat niet te herstellen is.
- **Hinderlijk**: ze komt er wel doorheen, maar met raden, twijfel of ergernis.
- **Cosmetisch**: valt op, doet geen kwaad.

Soort:

- **staat er niet**: de functie of tekst ontbreekt.
- **staat er, niet gevonden**: het bestaat, maar Sanne ziet of vindt het niet.
- **verkeerd begrepen**: het staat er, maar ze leest er iets anders in.

Per bevinding staat tussen haakjes in welk blok van de spec het valt (D, E, G)
of dat het buiten de spec valt.

---

## 0. Activatie (`/complete-account`)

Schermafbeelding: `00-activatie-desktop.png`, `00-activatie-mobiel.png`.

**Verwacht:** een kort welkom in de stijl van de site, een wachtwoord kiezen,
door naar mijn omgeving.

**Wat er stond:** een pagina in het oude blauwe ontwerp (blauwe knop, blauw
logo, grijze kaders) met "Kies direct een wachtwoord", daaronder drie stappen
"Wat gebeurt er nu?" en een blok "Begeleide inrichting".

**Bevindingen**

- 0.1 Hinderlijk, verkeerd begrepen (buiten spec). De drie stappen zeggen:
  "Loep heeft organisatie, campaign en respondentimport al voorbereid" en "Je
  hoeft geen setup of surveylogica meer te beheren." Twee schermen later moet
  Sanne juist zelf een setup-wizard doorlopen. Ze verwacht na deze tekst dat
  alles al klaarstaat en dat er niets van haar gevraagd wordt. De tekst stamt
  nog uit de managed-flow.
- 0.2 Cosmetisch (buiten spec). Engelse en interne woorden in klantcopy:
  "campaign", "campaignoverzicht", "respondentimport", "managementduiding",
  "surveylogica".
- 0.3 Cosmetisch (buiten spec). De pagina staat in het oude blauwe
  Verisight-ontwerp, terwijl de mail, de site en het dashboard navy/amber
  zijn. Eerste scherm na de mail, dus de merkbreuk valt juist hier op.
- 0.4 Cosmetisch (buiten spec). Het veld "Bevestig wachtwoord" toont al
  bolletjes alsof er iets ingevuld staat (placeholder), "Nieuw wachtwoord"
  toont "Minimaal 8 tekens". Ongelijk.

De knop "Nu overslaan en doorgaan naar dashboard" werkt en landt op
`/dashboard`.

---

## 1. Landing en dashboard (`/dashboard`)

Schermafbeelding: `01-dashboard-desktop.png`, `01-dashboard-mobiel.png`.

**Verwacht:** de naam van mijn organisatie, een overzicht van mijn metingen
(er zijn er drie) en per meting wat er van mij verwacht wordt.

**Wat er stond:** één gele kaart: "Vandaag: stuur de herinnering. 6 van 30
ingevuld (20%) · Sluitdatum: nog niet gepland", een voortgangsbalk, de knop
"Kopieer herinneringstekst" en de oranje tekst "Geen herinnering versturen".
Kop van de pagina: "ACCOUNT Hotmail". Sidebar: Overzicht, Rapporten, en onder
"Afgesloten" een item "Loep Behoud, jul 2026".

**Bevindingen**

- 1.1 Blokkerend, staat er niet (G). Het dashboard toont alleen de nieuwste
  meting (campagne B, `limit(1)` op `created_at`). Campagne C, de meting die
  Sanne moet inrichten, is nergens in de interface bereikbaar: geen kaart,
  geen lijst, niet in de sidebar, en op `/reports` staat hij wel maar zonder
  link. Zonder de URL uit dit document kan ze haar nieuwe meting niet vinden.
  Ook na het lanceren van C (stap 3 hieronder) bleef het dashboard B tonen
  (`03h-dashboard-na-lancering-c.png`).
- 1.2 Hinderlijk, staat er niet (G). De kaart noemt geen campagnenaam en geen
  scan. "Vandaag: stuur de herinnering" gaat over een meting die niet
  benoemd wordt. Met drie metingen weet Sanne niet welke bedoeld is.
- 1.3 Hinderlijk, verkeerd begrepen (buiten spec). De kop "ACCOUNT Hotmail"
  is het domein van haar e-mailadres met een hoofdletter
  (`userEmail.split('@')[1]`). Bij sanne@bedrijfx.nl staat er "Bedrijfx",
  bij een gmail-adres "Gmail". De organisatienaam staat nergens in de
  schil; die verschijnt alleen in de wizard-kop.
- 1.4 Hinderlijk, staat er niet (D 7.4). "Geen herinnering versturen" is
  oranje en oogt als link, maar is een `span` zonder actie. Sanne klikt, er
  gebeurt niets, ze weet niet of het geregistreerd is.
- 1.5 Hinderlijk, staat er niet (D 7.1). "Sluitdatum: nog niet gepland", en
  nergens kan ze er een plannen. Ze leest het als een taak voor haarzelf en
  vindt de plek niet.
- 1.6 Hinderlijk, verkeerd begrepen (D). "Vandaag: stuur de herinnering" op
  de eerste dag dat ze inlogt, zonder datum van de uitnodiging en zonder dat
  ze ooit een herinneringsdag heeft gekozen. Ze weet niet waarom vandaag.
- 1.7 Hinderlijk, verkeerd begrepen (G). Sidebar "Afgesloten: Loep Behoud,
  jul 2026". Dit is het scan-label, niet de campagnenaam, en "jul 2026" is
  de aanmaakmaand (15 juli) terwijl de meting op 27 augustus sloot. Met twee
  Behoud-metingen zijn ze niet uit elkaar te houden.
- 1.8 Cosmetisch (buiten spec). Voettekst "Loep dashboard, rapporten en
  Action Center in één omgeving". Action Center bestaat niet voor de klant.
- 1.9 Cosmetisch (buiten spec). De knop "Rapporten" rechtsboven dubbelt het
  sidebar-item.

---

## 2. Welke meting staat centraal

Zie 1.1 en 1.2. Van de drie metingen is er één zichtbaar (B, lopend), één
alleen via de sidebar (A, gesloten, onder het scan-label) en één helemaal
niet (C). Wat de teksten betekenen: "6 van 30 ingevuld" is duidelijk; "Sluit
datum: nog niet gepland" is dat niet (zie 1.5). Klikbaar: de knop, de
sidebar-items. De oranje tekst is dat niet.

---

## 3. Campagne C: setup-wizard tot en met "Ja, verstuurd"

Schermafbeeldingen: `03a-campagne-c-detail-*.png` (landingskaart),
`03b-campagne-c-wizard-*.png` (stap 1), `03c-wizard-stap1-gisteren.png`,
`03d-wizard-na-stap1-3-deelnemers.png`, `03e-wizard-stap2-*.png`,
`03f-wizard-na-ja-verstuurd-desktop.png`, `03g-campagne-c-na-lancering-*.png`.

### 3a. Landingskaart (`/campaigns/<C>`)

**Wat er stond:** navy kaart "TEST LOEP TESTKLANT. Je eerste scan staat
klaar. In drie stappen lanceer je de uitnodiging naar je medewerkers. Klaar in
ongeveer 5 minuten. Begin met de setup".

- 3.1 Hinderlijk, verkeerd begrepen (G). "Je eerste scan" terwijl dit de
  derde meting van deze organisatie is. Bij een echte vervolgmeting wekt dit
  de indruk dat er iets mis is met het account.

### 3b. Stap 1: startdatum, aantal, link

**Wat er stond:** "Welkom TEST Loep Testklant bij Loep. Doorloop drie
stappen om je scan te lanceren." Drie kolommen; kolom 1 navy met Startdatum
(datumveld), Aantal deelnemers ("bijv. 40"), Survey-link met "Test →",
waarschuwing "Alleen openen om te controleren", checkbox "Link getest en
werkt", knop "Opslaan en verder →". Kolom 2 en 3 grijs met slotje.

- 3.2 Blokkerend, staat er niet (E 8.2). Aantal deelnemers 3 wordt zonder
  waarschuwing opgeslagen (minimum is 1). Daarna staat er "Campagne loopt, 0
  van 3 ingevuld" en kan er nooit een rapport komen (drempel 10), zonder dat
  dit ergens staat. Geen tekst over 10 of over 5 per afdeling.
- 3.3 Blokkerend, staat er niet (D 7.1). Geen sluitdatum en geen
  herinneringskeuze in stap 1. Na de lancering staat overal "Sluitdatum: nog
  niet gepland" en is er geen enkele plek om te sluiten of te verlengen.
- 3.4 Hinderlijk, verkeerd begrepen (E). "Aantal deelnemers" zonder uitleg.
  Voor Loep Vertrek: alle 180 medewerkers, of de vertrekkers van dit jaar?
  Sanne vult 180 in. Voor Behoud zou ze twijfelen of stagiairs en
  oproepkrachten meetellen. Ook "Startdatum" mist een toelichting (de dag dat
  ze de mail verstuurt).
- 3.5 Hinderlijk, verkeerd begrepen (buiten spec). Een datum in het verleden
  geeft de Engelse browsermelding "Value must be 16-09-2026 or later"
  (`03c-wizard-stap1-gisteren.png`). Als ze de uitnodiging gisteren al
  verstuurde, kan ze dat niet invullen en snapt ze niet waarom.
- 3.6 Hinderlijk, staat er niet (buiten spec). Na "Opslaan en verder" is er
  geen weg terug naar stap 1. Ook na een herlaad opent de wizard direct op
  stap 2. Een typefout in het aantal (3 in plaats van 30) is niet te
  herstellen.
- 3.7 Hinderlijk, verkeerd begrepen (D 7.2). "Doorloop drie stappen", maar
  stap 3 is een grijze placeholder "Volgen & rapport, respons monitoren ·
  herinnering sturen · rapport via Loep" die nooit actief wordt. "Rapport via
  Loep" leest alsof Loep het rapport opstuurt.
- 3.8 Cosmetisch (E 8.2). Checkbox "Link getest en werkt" heeft geen effect.
- 3.9 Cosmetisch (buiten spec). Em-dashes in de UI-copy (de regel "Alleen
  openen om te controleren", het stap-label "Stap 1 / Nu", het adviesblok),
  terwijl de site-copy die bewust niet gebruikt.

Goed: de waarschuwing "niet volledig invullen, anders tellen jouw antwoorden
mee" is precies wat Sanne moet weten. De link is direct testbaar.

### 3c. Stap 2: uitnodiging

**Wat er stond:** adviesblok, Onderwerp en Bericht als bewerkbare velden met
elk een "Kopieer", tekst "Vergeet niet je naam in te vullen", knop "Ja,
verstuurd →" met daaronder "Tip: kopieer de tekst hierboven voor je
verstuurt".

Onderwerp: "Uitnodiging: korte vragenlijst - TEST Loep Testklant". Bericht:
"Beste collega, TEST Loep Testklant houdt een korte, anonieme vragenlijst
(Loep Vertrek). Jouw eerlijke inzicht helpt ons begrijpen wat er speelt bij
vertrek, voor de mensen die blijven. Je antwoorden worden alleen op
groepsniveau gerapporteerd en zijn niet naar jou herleidbaar. Vul de
vragenlijst hier in (ongeveer 8 minuten): [link]. Alvast bedankt voor je
deelname. Met vriendelijke groet, HR".

- 3.10 Hinderlijk, staat er niet (buiten spec). "Ja, verstuurd" werkt zonder
  dat iets gekopieerd is en zonder bevestiging. De lancering is onomkeerbaar
  (daarna telt de meting als lopend). Eén verkeerde klik en de meting "loopt"
  terwijl niemand een mail kreeg.
- 3.11 Hinderlijk (buiten spec, blok C). De ondertekening is "HR" en "(Loep
  Vertrek)" staat als merknaam in de mail; de ontvanger kent Loep niet. De
  tip "vergeet niet je naam in te vullen" is de enige aanwijzing.
- 3.12 Cosmetisch (buiten spec). Het onderwerp-veld is een textarea van één
  regel die het einde afkapt ("TEST Loep Testklant" valt eraf).

### 3d. Na "Ja, verstuurd"

**Wat er stond:** de campagnepagina met "Campagne loopt. De uitnodiging is
verstuurd. Je kunt de respons hier volgen. 0 van 3 ingevuld · Sluitdatum: nog
niet gepland", een tijdlijn "Uitnodiging verstuurd: Klaar / Herinnering:
Optioneel / Campagne sluiten: Sluitdatum: nog niet gepland" en direct
daaronder het blok "Herinneringsmail, pas aan en stuur vanuit je eigen
e-mail".

- 3.13 Hinderlijk, verkeerd begrepen (D 7.2). De tijdlijn heeft geen enkele
  datum. "Campagne sluiten" staat als tijdlijnpunt maar is geen knop; Sanne
  zoekt hoe ze sluit en vindt niets.
- 3.14 Hinderlijk, verkeerd begrepen (D). De herinneringsmail staat er op de
  dag van lancering al klaar, zonder aanwijzing wanneer die bedoeld is. Sanne
  vraagt zich af of ze die nu ook moet sturen.
- 3.15 Zie 1.1: na de lancering toont het dashboard nog steeds B.

Geen console-fouten tijdens de hele wizard.

---

## 4. Campagne B (lopend, `/campaigns/<B>`)

Schermafbeelding: `04-campagne-b-desktop.png`, `04-campagne-b-mobiel.png`,
`04b-campagne-b-na-kopieer.png`.

**Verwacht:** voortgang, wanneer de uitnodiging uitging, wanneer de
herinnering gepland staat, wanneer het sluit, en een knop om te sluiten.

**Wat er stond:** dezelfde gele kaart als op het dashboard, nu met
campagnenaam erboven ("TEST Loep Behoud - lopend, Loep Behoud · Behoud onder
druk"). Geen tijdlijn (die staat alleen op de "Campagne loopt"-kaart, niet op
de herinneringskaart).

Klik op "Kopieer herinneringstekst": de knop wordt "Ik heb de herinnering
verstuurd". Het klembord bevat onderwerp en bericht in één tekst:
"Herinnering: korte vragenlijst - TEST Loep Testklant / Beste collega, Een
korte herinnering: heb je de anonieme vragenlijst van TEST Loep Testklant al
ingevuld? Je antwoorden tellen alleen op groepsniveau mee. Vul de vragenlijst
hier in (ongeveer 6 minuten): [link]. Heb je hem al ingevuld? Dan kun je deze
mail negeren, en bedankt. Met vriendelijke groet, HR".

- 4.1 Blokkerend, staat er niet (D 7.3/7.4). Met 6 van 30 kan Sanne de
  meting niet sluiten en niet verlengen: "Campagne sluiten" verschijnt pas bij
  10 of meer ingevuld, of bij een verstreken sluitdatum die ze niet kan
  instellen. Als ze wél mag sluiten, is dat een kale
  browser-`confirm()`-dialoog ("Weet je zeker dat je deze campagne wilt
  sluiten? Respondenten kunnen daarna niet meer invullen...", niet geklikt,
  uit de code). Sluit ze onder de 10, dan komt de tekst "Rapport nog niet
  beschikbaar. Deze campagne is gesloten met X ingevulde reacties. Dat is te
  weinig voor een veilig rapport." zonder vervolgstap of contact (D 7.5).
- 4.2 Hinderlijk, staat er niet (D). Op de herinneringskaart ontbreekt de
  tijdlijn die de "Campagne loopt"-kaart wel heeft. Startdatum en looptijd
  zijn hier nergens te zien.
- 4.3 Hinderlijk, verkeerd begrepen (buiten spec). "Kopieer herinneringstekst"
  plakt onderwerp en bericht als één blok. Sanne plakt het in het
  berichtvenster van Outlook en de onderwerpregel staat in de mailtekst. In
  de wizard en op de "Campagne loopt"-kaart zijn onderwerp en bericht wel
  apart te kopiëren; hier niet.
- 4.4 Hinderlijk, staat er niet (D 7.4). "Geen herinnering versturen" doet
  niets (zie 1.4). Als Sanne besluit geen herinnering te sturen, blijft de
  kaart "Vandaag: stuur de herinnering" tonen tot ze op "Ik heb de
  herinnering verstuurd" klikt, wat niet waar is.

Goed: kopieer → "Ik heb de herinnering verstuurd" is een helder
tweestapspatroon, en de herinneringstekst is af.

---

## 5. Campagne A (gesloten, `/campaigns/<A>`)

Schermafbeelding: `05-campagne-a-desktop.png`, `05-campagne-a-mobiel.png`,
`05b-campagne-a-na-download-klik.png`.

**Verwacht:** één duidelijke knop om het rapport te pakken.

**Wat er stond:** kaart "Je rapport is beschikbaar. 18 respondenten · Gesloten
27 augustus 2026" met knop "Open rapport", en daaronder een tweede kaart "Je
rapport staat klaar. Het antwoord staat op pagina twee..." met knop "Rapport
downloaden".

- 5.1 Blokkerend, omgeving/backend (buiten spec; blok A aan de UI-kant
  werkt). "Rapport downloaden" geeft onder de knop de rode tekst "Internal
  Server Error". Vastgesteld: de Next-proxy `/api/campaigns/<A>/report` geeft
  500 met de tekst van de backend; de backend zelf geeft met de API-sleutel
  van de testorganisatie ook 500 op `/api/campaigns/<A>/report`, terwijl
  `/stats` 200 geeft. Health meldt `4805e92d82e3`, lokaal HEAD verschilt
  daarvan alleen in een testbestand. Het bleef 500 ná de reset (dus ook met
  gevulde `direction_response`). Dezelfde data rendert lokaal foutloos via
  de dry-run (HTML), en de backend compileert schoon onder Python 3.11. De
  oorzaak zit dus in de PDF-stap of runtime op Railway en is alleen uit de
  Railway-logs te halen. Voor Sanne: het enige dat ze kwam halen, krijgt ze
  niet, met een Engelse technische melding en geen vervolgstap.
- 5.2 Hinderlijk, verkeerd begrepen (buiten spec). Twee kaarten met dezelfde
  boodschap en twee knoppen. "Open rapport" linkt naar de pagina zelf
  (`/campaigns/<A>`), dus er gebeurt zichtbaar niets. Sanne denkt dat de
  eerste knop kapot is.
- 5.3 Cosmetisch (buiten spec). Foutmelding "Internal Server Error" in het
  Engels, zonder "probeer het later" of "mail hallo@getloep.nl".

---

## 6. Rapportenoverzicht (`/reports`)

Schermafbeelding: `06-reports-desktop.png`, `06-reports-mobiel.png`,
`06b-reports-uitgeklapt-desktop.png`, `06c-reports-na-download-klik.png`.

**Wat er stond:** "Je rapporten" met intro, "Beschikbaar nu (1 rapport)": een
kaart met TEST Loep Behoud - gesloten met rapport, Q3 2026, "18 van 18
ingevuld", "Download PDF". Daaronder een inklapbare "Nog niet beschikbaar
(2)" met B ("6 van 6 ingevuld", "Meting loopt") en C ("0 ingevuld", "Meting
loopt").

- 6.1 Hinderlijk, verkeerd begrepen (buiten spec). "18 van 18" en "6 van 6
  ingevuld": de noemer is hier het aantal gestarte respondenten
  (`campaign_stats.total_invited`), op het dashboard is het 30 uitgenodigden.
  Sanne leest 100% respons terwijl het 60% en 20% is. Twee schermen, twee
  waarheden.
- 6.2 Hinderlijk, verkeerd begrepen (G). Campagne C krijgt "Meting loopt"
  terwijl hij nog ingericht moet worden. Zelfde statuslabels als spec 10.1
  vraagt ("Nog in te richten", "Loopt", "Actie nodig", ...) ontbreken hier.
- 6.3 Hinderlijk, staat er niet (G). De rijen onder "Nog niet beschikbaar"
  zijn niet klikbaar. Dit is de enige plek waar alle drie de metingen bij
  naam staan, en juist hier kom je niet bij de meting.
- 6.4 Hinderlijk, staat er, niet gevonden (buiten spec). "Nog niet
  beschikbaar (2)" is dichtgeklapt; dat het uitklapbaar is, zie je niet
  (geen pijltje).
- 6.5 Cosmetisch (buiten spec). De kolomkoppen "SCAN / PERIODE / RESPONS"
  staan gestapeld boven de kaart als tabelkoppen zonder tabel.
- 6.6 Zie 5.1: "Download PDF" geeft hier dezelfde "Internal Server Error".

---

## 7. Menu, help, uitloggen, terugweg

Schermafbeelding: `07-mobiel-menu-open.png`, `07-na-uitloggen-desktop.png`,
`07-login-desktop.png`, `07-login-mobiel.png`.

- 7.1 Hinderlijk, staat er niet (G 10.2). In de hele ingelogde omgeving is er
  geen hulp-, uitleg- of contactlink. Alle links in de schil: Overzicht,
  Rapporten, de afgesloten campagne. `/help` en `/settings` geven de
  marketing-404 ("Bekijk de producten / Plan een kennismaking"), wat voor een
  ingelogde klant vreemd is. Het blok "nieuwe meting aanvragen" uit spec
  10.2 ontbreekt nog.
- 7.2 Hinderlijk, staat er niet (buiten spec). Het mobiele menu bevat alleen
  Overzicht en Rapporten; "Uitloggen" en het accountblok staan er niet in.
- 7.3 Cosmetisch (buiten spec). De inlogpagina na uitloggen is zwaar:
  "Toegang voor klanten, beheerders en managers", een alinea over managers,
  "Loep v2.0 · Vertrouwelijk platform". Wel goed: "Nog geen toegang...? Neem
  contact op" staat er.

Uitloggen landt op `/login`; `/dashboard` daarna ook. Dat klopt.

---

## 8. Mobiel 375 px

- Dashboard (`01-dashboard-mobiel.png`): netjes, geen horizontale scroll
  (scrollWidth 375), hamburger werkt.
- Campagne A (`05-campagne-a-mobiel.png`): netjes.
- Campagne C na lancering (`03g-campagne-c-na-lancering-mobiel.png`): netjes,
  tijdlijn en mailblok passen.
- 8.1 Blokkerend, staat er wel, onbruikbaar (buiten spec). Wizard stap 1 en
  stap 2 (`03b-campagne-c-wizard-mobiel.png`, `03e-wizard-stap2-mobiel.png`):
  de drie kolommen staan naast elkaar (`grid-cols-3` zonder breakpoint). De
  invoervelden zijn ~30 px breed, de datum toont één letter, teksten breken
  per lettergreep, de knop "Opslaan en verder" is drie regels hoog. Op een
  telefoon is de meting niet in te richten. Geen overflow (het past net),
  maar niet te bedienen.

---

## Top 10 om als eerste te fixen

1. **Rapportdownload geeft 500** (5.1). Buiten spec, backend/Railway. Zonder
   dit levert de hele suite niets op; Railway-logs bekijken voor
   `/api/campaigns/<id>/report`.
2. **Alle metingen zichtbaar op het dashboard, en campagne C bereikbaar**
   (1.1, 1.2, 3.15, 6.3). Blok G 10.1: hoofdkaart plus lijst "Andere
   metingen" met naam, scan, status en link.
3. **Sluitdatum en herinneringsdag in de wizard; sluiten en verlengen als
   echte knoppen** (1.5, 3.3, 3.13, 4.1). Blok D 7.1, 7.3, 7.4.
4. **Drempel van 10 (en 5 per afdeling) afdwingen in de wizard, met uitleg
   bij "Aantal deelnemers"** (3.2, 3.4). Blok E 8.2.
5. **Wizard bruikbaar op mobiel** (8.1). Buiten spec; één kolom onder ~768 px.
6. **Activatiepagina: copy en ontwerp in lijn met de wizard** (0.1 t/m 0.3).
   Buiten spec; de eerste zin die Sanne leest belooft nu het tegendeel van
   wat er komt.
7. **Eén noemer overal en eerlijke statuslabels op /reports** (6.1, 6.2).
   Deels G (statuslabels), deels buiten spec (noemer uit het delivery
   record in plaats van gestarte respondenten).
8. **Bevestiging bij "Ja, verstuurd" en een weg terug naar stap 1** (3.6,
   3.10). Buiten spec.
9. **Hulp en contact in de schil, organisatienaam in plaats van "Hotmail"**
   (7.1, 1.3). G 10.2 voor het contactblok; de organisatienaam is buiten
   spec.
10. **"Geen herinnering versturen" werkend maken, dubbele rapportkaart op
    campagne A samenvoegen, onderwerp en bericht apart kopiëren op de
    herinneringskaart** (1.4, 4.4, 5.2, 4.3). D 7.4 voor de herinnering; de
    rest buiten spec.

Wat verder opviel maar lager staat: 1.7 sidebar-label en -maand (G), 3.7 stap
3 als placeholder (D 7.2), 3.5 Engelse datummelding, 3.11 ondertekening
"HR", 7.2 uitloggen ontbreekt in mobiel menu, 1.8 "Action Center" in de
voettekst, 3.9 em-dashes in de UI-copy.

## Drie dingen die goed werken en zo moeten blijven

1. **Eén kaart, één actie.** Het dashboard vertelt in één zin wat er vandaag
   moet gebeuren en geeft daar één knop voor. Het patroon kopieer → "Ik heb
   de herinnering verstuurd" is duidelijk en eerlijk (niets wordt
   automatisch verstuurd, Sanne bevestigt zelf).
2. **De teksten liggen klaar.** Uitnodiging en herinnering staan er compleet
   in, met link, privacyzin ("alleen op groepsniveau, niet herleidbaar") en
   invultijd, bewerkbaar en per veld te kopiëren. De waarschuwing "alleen
   openen om te controleren, niet volledig invullen" voorkomt een echte fout.
3. **Rustige, consistente schil.** Sidebar, kaarten en mobiel dashboard zijn
   rustig en in één stijl; geen horizontale scroll op 375 px, geen
   console-fouten op geen enkel scherm, inloggen via link en uitloggen doen
   precies wat je verwacht.

## Telling

- Blokkerend: 6 (1.1, 3.2, 3.3, 4.1, 5.1, 8.1)
- Hinderlijk: 26
- Cosmetisch: 11

## Reset van de testklant

- `.venv-314/Scripts/python.exe scripts/seed_test_tenant.py --dry-run`:
  geslaagd, alle zes rapportblokken aanwezig, geen productiedata aangeraakt.
- `.venv-314/Scripts/python.exe scripts/seed_test_tenant.py --reset`:
  geslaagd. Organisatie `a7dd316b-…` verwijderd en opnieuw gezet, "11
  tellingen van andere organisaties ongewijzigd", campagnes A/B/C met
  dezelfde id's. Nacontrole: campagne C heeft weer een leeg delivery record
  (`launch_date`, `launch_confirmed_at`, `invited_count` alle `null`), dus
  de lancering uit stap 3 is ongedaan gemaakt; campagne A heeft 18 responses
  met 18 gevulde `direction_response`.
- Bestaande sessies zijn door de reset ingetrokken; voor een volgende check
  is een verse `--login-link` nodig.

Niets gecommit, geen `git stash`, geen codewijziging. Nieuwe bestanden: dit
verslag en `docs/testklant/walkthrough/*.png` (33 afbeeldingen, geen
inloggegevens erin).
