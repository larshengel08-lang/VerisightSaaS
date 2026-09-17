# Spoor 2: het rapport zonder begeleiding, en de vervolgmeting

Datum: 2026-09-16
Status: concept, wacht op review Lars
Bronnen: strategisch besluit 2026-09-11 ("de HR-manager is de facilitator, het rapport is haar script"); koude leesrondes `docs/rapport-koude-leesronde-2026-09-12.md` en `docs/rapport-koude-leesronde-2026-09-16.md` (delta: 1 opgelost, 25 open, 11 nieuw); stresstest `docs/rapport-stresstest-2026-09-10.md` (matrix na ronde 2 en de drie nieuwe open punten); ronde 3 (B9, B13, B14, B20); besluit Lars 2026-09-16 dat de vergelijkingspagina erin komt (optie A).

## 1. Doel en lat

Een HR-manager die het rapport voor het eerst ziet leidt er morgen een MT-vergadering van 45 minuten mee, zonder Loep in de kamer, en gaat naar buiten met een vastgelegd besluit. Bij een vervolgmeting ziet ze in één oogopslag wat er sinds dat besluit is veranderd.

**Lat, drie meetbare onderdelen:**
1. Stresstest: alle 21 scenario's zonder kruisje op Q1, Q2, Q5 en Q6; Q3 hoogstens twee tildes; Q4 (holle pagina's) zonder kruisje. Plus twee nieuwe scenario's: 22 (vervolgmeting op scenario 02) en 23 (vervolgmeting met gewijzigde afdelingen).
2. Koude leesronde 3 (zelfde persona, zelfde drie MT-reacties): nul blokkerende gaten, hoogstens vijf hinderlijke, en de drie reacties elk te pareren met een citaat van maximaal twee pagina's uit elkaar.
3. WeasyPrint-Docker: nul warnings; Python 3.11-guard groen; browsercheck op de testklant: campagne A downloadt en de besluitpagina print op één A4.

## 2. Ontwerpregels

- **Pagina twee is het vel dat het MT krijgt.** Alles wat de HR-manager in de eerste vijf minuten nodig heeft staat daar, met paginaverwijzingen naar het bewijs.
- **Eén verhaal over het startpunt.** Organisatiebreed en per afdeling mogen verschillende dingen aanwijzen, maar het rapport zegt dan zelf hoe die twee zich verhouden.
- **Van keuze naar besluit met werkvragen, niet met advies.** Loep verzint geen acties. Loep stelt de vragen die het MT moet beantwoorden om van "dit kozen je mensen" naar "dit gaan wij doen" te komen.
- **Het besluit is een product.** Het wordt vastgelegd in het rapport (invulbaar A4) en in het dashboard, en het komt terug in de vervolgmeting.
- **Elke telling heeft een noemer en elke drempel een uitleg**, op de plek waar hij voorkomt, niet alleen in de methodiek.
- Bestaande eerlijkheidsregels blijven: geen oorzaakclaims, geen individuen, staffels, geen automatische analyse van open tekst, geen em-dashes.

## 3. Scope in zeven onderdelen

| # | Onderdeel | Dekt |
|---|---|---|
| 1 | Pagina twee als MT-vel | leesronde B1, H1, H3, H4, H5, H8, H9, H10, H16, H17, C10, C11; ronde 2 open punt (a) |
| 2 | Eén startpuntverhaal | B2/B3 twee startpunten, H20 restgroep, C8 cover, ronde 2 open punt (b) |
| 3 | Werkvragen per startpunt | B4/B3 brug naar besluit, H6, H7 |
| 4 | Besluitpagina + dashboard | H11, H12, spec 11-9 par. besluitpagina |
| 5 | Vervolgmeting: koppeling + "Wat is er veranderd" | Sanne's zeven wensen, besluit optie A |
| 6 | Ronde 3 + restpunten | B9 paginavulling (H16, C5), B13 Anders, B14 brug tussen tellingen (H2, H19), B20 drempels (H18), ronde 2 open punt (c), C2, C3, C9, C12, C13, typografie |
| 7 | Taal | H14 jargon, H15 verspreidingsregel, terminologie onderwerp/thema/factor/stelling |

Loep Start blijft eerlijk gelabeld en krijgt geen werkvragen of vergelijking in deze spec (geen verdieping en richting, v1.1 apart). Loep Vertrek krijgt alles behalve de vergelijkingspagina in zijn eigen verleden-tijd-stem; de vergelijking geldt voor Behoud en Vertrek beide.

## 4. Onderdeel 1: pagina twee als MT-vel

Pagina twee wordt herbouwd als één A4 met vaste blokken, in deze volgorde:

1. **Kop: het antwoord in één zin**, zoals ronde 2 die al maakt (vier vormen naar aantal kwetsbare onderwerpen, vlak profiel, gedeelde laagste). Twee correcties: de zin over "één onderwerp" valt weg als het profiel meer dan één kwetsbaar onderwerp heeft (H17), en de vlakke-profiel-zin vergelijkt op de getoonde, afgeronde score (ronde 2 punt a). Bij een gelijke laagste score noemt de zin alle gelijke onderwerpen.
2. **De twee cijfers die het MT wakker maken.** Voor Behoud: blijfintentie met zone-verdeling ("Blijfintentie 3,9 op 10: 25 van de 39 zitten onder de 5, dat is kwetsbaar") en de responsbasis met oordeel ("39 van 58 ingevuld, 67%: ruim genoeg voor een betrouwbaar beeld" / de bestaande waarschuwingen onder 50% en 30%). De blijfintentie krijgt dezelfde bandlogica als de factoren (onder 5 kwetsbaar, 5 tot 6,5 aandachtspunt, boven 6,5 relatief sterk) en wordt in de kop benoemd zodra hij kwetsbaar is. Voor Vertrek: de meest genoemde vertrekreden met noemer, en bij een gelijkspel "twee redenen even vaak genoemd: X en Y" (ronde 2 punt b).
3. **Startpunt en waarom**, met de bestaande onderbouwingscel, maar de cellen die geen reden zijn (C10) verdwijnen: er staan alleen cellen met een echte reden (score, spreiding, verdieping, richting, vertrekreden). De regel "11 van de 15" krijgt zijn noemer ter plekke: "11 van de 15 mensen bij wie dit het laagst scoorde".
4. **Eén gespreksopener** (H9). De opener op pagina twee en op de gespreksagenda zijn dezelfde zin; de agenda verwijst naar pagina twee in plaats van een tweede te maken.
5. **Zo leid je dit gesprek in 45 minuten**: vijf regels met tijdvak, wat je op tafel legt, en de paginaverwijzing (pagina's worden in het rapport geteld en overal genoemd waar naar een sectie wordt verwezen, H4). Dit vervangt het gebruiksblok; de zin over de "begeleide managementbespreking" verdwijnt (H5).
6. **Meetgegevens**: meetperiode als datums (start en sluiting uit het delivery record, H8), aantal uitgenodigd, aantal ingevuld, en bij een vervolgmeting de datum van de vorige meting.

Pagina drie mag niet bijna leeg zijn (H16): het cijferoverzicht dat nu op pagina drie begint, sluit direct aan op pagina twee of pagina twee wordt zo gebouwd dat hij precies één A4 vult. De lay-outregel wordt getest met de drie langste factornamen en met scenario 11 (n=180).

## 5. Onderdeel 2: één startpuntverhaal

- Het navy segmentblok heet niet langer "Startpunt voor de bespreking" maar **"Waar het per afdeling begint"**. Het startpunt van het rapport is er één, organisatiebreed, op pagina twee en de gespreksagenda.
- Als de aangewezen afdeling een ander onderwerp laag heeft dan het organisatiebrede startpunt, zet het rapport op de gespreksagenda én op pagina twee de **brugzin**: "Organisatiebreed begint het gesprek bij [X]. Bij [afdeling] springt [Y] eruit ([score]); neem dat als tweede punt voor die afdeling." Als het hetzelfde onderwerp is: "Bij [afdeling] weegt [X] het zwaarst ([score]); daar begint het gesprek ook." Als geen afdeling wordt aangewezen (ronde 2-regels): geen brugzin, wel de bestaande eerlijke reden.
- De restgroep "Overige afdelingen" (H20) krijgt in de tabel een noemer ("samen X uitgenodigd, Y ingevuld") en de zin welke afdelingen erin zitten ("Facilitair, Staf"), zodat "scoort het laagst" niet over een naamloze groep gaat. Onder de vijf ingevulde blijft de restgroep zonder score, met reden.
- Cover, band en kop gebruiken één woord voor hetzelfde ding (C8): de cover zegt "Waar het gesprek begint: [X]" in plaats van "Eerste aandachtspunt", en de bandnamen blijven "kwetsbaar punt / aandachtspunt / relatief sterk".

## 6. Onderdeel 3: werkvragen per startpunt

Op de gespreksagenda, direct onder "Wat er moet gebeuren", komt per startpunt (en per tweede punt) een blok **"Zo maak je er een besluit van"** met drie vragen. Geen advies, wel de vertaalslag die het MT moet maken:

1. **Herkenningsvraag**, altijd datagedreven: "[N] van de [M] koos '[meest gekozen toelichting]'. Waar zie je dat bij jullie terug, en waar niet?" Bij te weinig verdiepingsdata: "Wat maakt dat [onderwerp] hier zo laag scoort, volgens jullie?"
2. **Vertaalvraag**, uit een vaste set per onderwerp en scan (`WORK_QUESTIONS` in `backend/products/shared/deepening.py`, naast de routesets), gekozen op de meest gekozen richting: bij "Een concreter gesprek over mijn ontwikkeling" bijvoorbeeld "Wat is bij jullie een concreet ontwikkelgesprek: wie voert het, hoe vaak, en wat moet eruit komen?" Bij een verdeelde richting (`divided`, `plurality`, `split_none`) wordt de vraag: "Je mensen zijn verdeeld tussen [A] en [B]. Welke van de twee past bij wat jullie de komende drie maanden kunnen waarmaken?"
3. **Besluitvraag**, altijd dezelfde vorm: "Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je over 90 dagen dat het werkt?"

De vaste set: 36 vertaalvragen (6 onderwerpen × 6 routes) voor Behoud en 36 voor Vertrek in verleden-tijd-stem, als concept in bijlage A van deze spec; reviewgate door Lars zoals bij de routeteksten in juli. Loep Start krijgt de vragen niet (geen richtingdata).

De reactie van de afdelingsmanager ("dat komt door de reorganisatie") krijgt op de segmentpagina één vaste regel: "Een lage score zegt niet waarom. Vraag de afdeling zelf naar de toelichting; het rapport toont die alleen organisatiebreed." (H7, eerlijk over de grens.)

## 7. Onderdeel 4: de besluitpagina

De laatste pagina vóór de appendix wordt een **invulbaar A4 "Besluit van het MT"**, ook los te printen, met velden:

- Meting en datum van deze bespreking
- Startpunt (voorgedrukt) en **Wat precies** (drie regels)
- Eigenaar en **Datum vervolgmoment** (geen termijn, een datum; de hint "45 tot 90 dagen" staat ernaast)
- Tweede punt (voorgedrukt als er een is) met dezelfde drie regels
- **Terugkoppeling aan medewerkers**: wie, wanneer, wat
- **Waaraan zien we dat het werkt**: één regel
- Voetregel: "Vul dit ook in op je dashboard; bij een vervolgmeting zet Loep dit besluit op pagina twee."

**Dashboard:** op een gesloten meting met rapport komt een blok "Besluit vastleggen" met dezelfde velden, opgeslagen in een nieuwe tabel `campaign_decisions` (één rij per meting: `campaign_id`, `decided_at`, `primary_topic`, `primary_action`, `owner`, `follow_up_date`, `secondary_topic`, `secondary_action`, `feedback_plan`, `success_criterion`, `recorded_by`, `updated_at`; RLS als de audittabel: leden lezen, eigenaar en operator schrijven). Het formulier is de enige plek waar de klant iets in het systeem schrijft ná de meting; Fail Loud bij opslagfouten.

## 8. Onderdeel 5: de vervolgmeting

### 8.1 Koppeling

`campaigns.previous_campaign_id` (uuid, nullable, FK naar `campaigns`, zelfde organisatie afgedwongen met een check via trigger of in de server action). Lars kiest bij het aanmaken van de vervolgmeting de vorige meting in het beheerformulier (dropdown van gesloten metingen van dezelfde organisatie en hetzelfde scantype). Geen automatische gok. De cover toont "Vervolgmeting" met beide meetdata.

### 8.2 Pagina "Wat is er veranderd"

Direct ná pagina twee, alleen bij een gekoppelde vorige meting, één pagina:

1. **Jullie besluit van [maand jaar]**: uit `campaign_decisions` van de vorige meting: wat, wie, datum vervolgmoment. Ontbreekt het besluit: "Er is voor de vorige meting geen besluit vastgelegd in het dashboard." (Fail Loud, geen leeg vak.)
2. **De zes onderwerpen toen en nu**, in de volgorde van het cijferoverzicht: score toen, score nu, verschil. Verschil wordt alleen als verschuiving benoemd ("hoger", "lager") als het ten minste 0,3 is én beide metingen tien of meer antwoorden hebben; anders "vrijwel gelijk" of "niet vergelijkbaar (te weinig antwoorden in [meting])". Het startpunt van toen krijgt een markering.
3. **Blijfintentie toen en nu** met de drie zones (Behoud); vertrekintentie idem (Behoud); voor Vertrek de vertrekredenverdeling toen en nu.
4. **De toelichting en de richting bij het startpunt van toen**: aandeel toen en nu voor de meest gekozen toelichting en voor de meest gekozen richting, met noemers. Dat is de enige plek die iets zegt over "heeft het besluit iets gedaan", en het rapport zegt er expliciet bij dat dit geen oorzaakverband bewijst.
5. **Respons toen en nu** met uitgenodigden; een daling van meer dan 15 procentpunt krijgt de zin "Dat is zelf een signaal."
6. **Afdelingen**: alleen afdelingen die in beide metingen bestaan (op label), met laagste onderwerp toen en nu; nieuwe of verdwenen afdelingen worden genoemd, niet vergeleken.

**Eerlijkheidsregels op de pagina zelf:** "Andere mensen hebben ingevuld dan vorige keer; dit vergelijkt groepen, geen personen." En: "Een verschil onder 0,3 is ruis bij deze aantallen."

### 8.3 Pagina twee bij een vervolgmeting

Blok 2 van pagina twee krijgt een extra regel: "Vorige meting: [startpunt toen], besluit: [wat precies]. Zie pagina 3 voor wat er veranderde."

## 9. Onderdeel 6: ronde 3 en restpunten

- **B9 paginavulling**: geen pagina onder 40% gevuld. eNPS krijgt geen eigen pagina meer (H13: op de pagina met de intentiecijfers); halflege pagina's 9, 11, 12 worden samengevoegd of aangevuld; pagina 3 (H16) volgens onderdeel 1.
- **B13 Anders-toelichtingen**: als "Anders" bij een verdieping 20% of meer haalt, zegt het rapport dat en toont de geanonimiseerde teksten op de verdiepingspagina (staffel: vanaf vijf; anders alleen het aantal).
- **B14 brug tussen tellingen** (H2, H19): elke telling in de verdiepings- en richtingketen staat in één vaste vorm "X van de Y (Y = ...)", en de richtingketen sluit: "39 kregen de vraag, 27 beantwoordden hem, 12 sloegen over" staat er letterlijk, zodat er nooit twaalf mensen "verdwijnen".
- **B20 drempels** (H18): één drempeltabel op de methodiekpagina (3 voor richting, 5 per groep, 8 voor agendaverrijking, 10 voor patroonduiding, met één zin waarom elk), en elke inline drempel verwijst ernaar met dezelfde woorden.
- Ronde 2 punt (c): de kolomkoppen van de ranglijst in een `thead`, zodat ze herhalen op een vervolgpagina (te testen door de tabel geforceerd te laten breken).
- Cosmetisch: het anonimiseringslabel één keer boven de quotes (C2); de dubbele bandlijst weg (C3); afdelingstabel met kolomkoppen (C9); geen "(vervolg)" in de kop van een nieuw onderwerp (C12); "vrijwel gelijk aan" niet in de agendakolom (C13); "geïnteresseerd" met trema en losse streepjes weg.

## 10. Onderdeel 7: taal

- "Bestuurlijke read" wordt "Het antwoord in het kort"; "verdieptrigger", "interventieprescriptie", "responsbasis" en "managementread" verdwijnen uit klantcopy (H14). Vertaaltabel in bijlage B; source-guard-test op de verboden woorden.
- Eén woord per ding: "onderwerp" voor de zes gemeten thema's, "stelling" voor de losse vragen, "afdeling" voor segmenten. "Factor" en "thema" verdwijnen uit klantcopy.
- Cover en slotpagina krijgen één verspreidingsregel (H15): "Voor het MT en HR van [organisatie]. Deel dit rapport niet met individuele medewerkers; de toelichtingen zijn geanonimiseerd maar herkenbaar in kleine teams."

## 11. Data en migraties

Eén migratie, additief: `campaigns.previous_campaign_id`, tabel `campaign_decisions` met RLS, beide idempotent. Draaien vóór de Railway-redeploy. De backend leest `campaign_decisions` alleen via de bestaande sessie (service-role-equivalent), de frontend via RLS.

## 12. Verificatie

- Stresstest-harnas uitgebreid met scenario 22 (vervolgmeting op 02: startpunt verschoven, besluit vastgelegd) en 23 (vervolgmeting met een afdeling erbij en een weg, zonder vastgelegd besluit); de matrix krijgt een kolom Q7 "vergelijking eerlijk" voor die twee.
- Koude leesronde 3 door een agent op het nieuwe voorbeeldrapport én op scenario 22, met dezelfde drie MT-reacties.
- WeasyPrint-Docker op alle voorbeeldrapporten en op 06, 11, 18, 22, 23: nul warnings; kolomkoppen herhalen bij geforceerde paginabreuk.
- Python 3.11-guard groen; backend 25 = baseline; frontend tsc en vitest op baseline.
- Browsercheck testklant: campagne A downloadt (Railway-500 moet eerst weg), besluit vastleggen werkt, en een tweede testcampagne gekoppeld aan A toont de vergelijkingspagina.

## 13. Uitvoering

Drie plannen, na elkaar, elk in een aparte sessie (allemaal in `report_html.py`, dus niet parallel):

- **Plan 3a: pagina twee, startpuntverhaal, ronde 3, taal** (onderdelen 1, 2, 6, 7). Geen schemawijziging.
- **Plan 3b: werkvragen en besluitpagina** (onderdelen 3, 4), inclusief de reviewgate op de 72 vertaalvragen en de migratie voor `campaign_decisions`.
- **Plan 3c: vervolgmeting** (onderdeel 5), inclusief `previous_campaign_id`, beheerformulier, scenario 22 en 23.

Na 3a draait de stresstest opnieuw; na 3c de koude leesronde 3. De backend-responsnoemer uit spoor 1 (par. 4.6 van de spec van 11 september) zit in 3a.

## 14. Open punten voor de review

1. De vertaalvragen (bijlage A, 72 stuks) schrijf ik als concept nadat je deze spec goedkeurt; reviewgate zoals in juli. Akkoord met de vorm "herkenning, vertaling, besluit"?
2. Besluit vastleggen in het dashboard: nu meebouwen (3b), of eerst alleen het papieren A4 en het dashboard bij 3c? Mijn advies: meteen, anders heeft 3c niets om op pagina twee te zetten.
3. De cover-formulering "Waar het gesprek begint: [X]": akkoord, of liever de bestaande "Eerste aandachtspunt" met aangepaste bandnaam?

## Bijlage A: vertaalvragen (concept volgt na akkoord)

Per onderwerp (leiderschap, cultuur, groeiperspectief, beloning, werkdruk, rolhelderheid) en per route uit `DIRECTION_SETS` één vertaalvraag in de vorm "Wat is bij jullie een concrete [route]: wie, hoe vaak, wat moet eruit komen?", voor Behoud in de tegenwoordige tijd en voor Vertrek in de vorm "Wat had bij jullie een concrete [route] moeten zijn?".

## Bijlage B: vertaaltabel jargon

| Nu | Wordt |
|---|---|
| Bestuurlijke read | Het antwoord in het kort |
| responsbasis | respons |
| verdieptrigger | verdiepende vraag |
| interventieprescriptie | advies |
| managementread | samenvatting voor het MT |
| factor / thema | onderwerp |
| item | stelling |
| segment | afdeling |

## Afwijkingen bij plan 3a

- **Responsnoemer (spec 11-9 par. 4.6):** de code (`_respons_noemer`, ronde 2) neemt het vastgelegde aantal uit het delivery record als noemer ongeacht `comms_mode`, en geeft bij een te laag vastgelegd aantal géén afgekapte 100% maar géén percentage plus de reden. Dat is strenger dan par. 4.6 en blijft zo: liever geen getal dan een onwaar getal.
- **Sluitdatum:** `closed_at` staat op `Campaign`, niet op het delivery record; de start komt uit `delivery_record.launch_date`.
- **Respons-oordeel zonder noemer (blok 2, codereview taak 2):** het plan schreef "het aantal uitgenodigden is niet vastgelegd". Dat is onwaar bij een te laag vastgelegd aantal of een managed campagne waarin iedereen invulde (`_respons_noemer`). Wordt: "{n} ingevuld; Loep kan het aantal uitgenodigden niet vaststellen, dus staat er geen percentage." Onder `MIN_AGGREGATE_N` volgt ook hier de drempelmelding: "Te weinig voor een profiel per onderwerp, daarvoor zijn er minimaal 10 nodig."
- **Vertrekreden in blok 2 (codereview taak 2):** de noemer is het aantal respondenten dat een vertrekreden gaf (de reden is optioneel), niet het aantal ingevulde vragenlijsten. Is dat kleiner, dan staat het erbij: "(4 van de 10 die een reden gaven)", bij een gelijkspel "(elk 4 van de 10 die een reden gaven)". Het gelijkspel wordt bepaald op de volledige teller (`exit_r_top` in `build_report_data`), niet op de top 5 van de tabel; boven "zes" staat het cijfer.
- **Blijfintentie in de kop (codereview taak 2):** zonder kwetsbaar onderwerp in de kop wordt het "Wel is de blijfintentie kwetsbaar: ..." in plaats van "Ook ...", anders spreekt de zin "Geen onderwerp scoort kwetsbaar." tegen. Enkelvoud "1 van de 39 zit onder de 5"; zonder losse scores geen kopzin.
- **"Daar begint het gesprek." (taak 3, C11):** het plan verkortte de startpuntzin bij één of twee kwetsbare onderwerpen zodra het startpunt het eerstgenoemde is. Bij twee kwetsbare onderwerpen, of met een "Daarnaast zijn ... een aandachtspunt."-zin ertussen, wijst "Daar" dan naar meer dan het startpunt. De verkorting geldt daarom alleen bij precies één kwetsbaar onderwerp zonder aandachtspuntenzin; anders blijft "Als startpunt kiest Loep X." staan.
- **Getoonde gelijkstand in de startpuntzin (taak 3, codereview):** het verschil naar de volgende rij (`_p02_startpunt_gronden`) wordt berekend op de getoonde scores (B15), afgerond op 0,1. 4.94 en 4.96 staan als 4.9 en 5.0 in het raster; de zin zegt dan "klein, 0,1 punt" in plaats van "0,02 punt". Een getoond verschil van 0 wordt vanzelf de gelijkstandvorm. De gate "klein" (onder `PRIORITY_TIE_MARGIN`) is dezelfde maar werkt op dat getal, dus een getoond verschil van 0,3 is niet meer klein. Het getal in de zin heeft daarom één decimaal ("0,1 punt"). Geen nieuwe drempel.
- **Opsomming van gedeelde laagste scores (taak 3, codereview):** labels bevatten zelf al "en", dus geen "A en B" meer maar telwoord, dubbele punt en komma's. Tak zonder kwetsbaar onderwerp: "Geen onderwerp scoort kwetsbaar. Twee onderwerpen delen de laagste score (5.5/10): A, B; als eerste gesprekspunt kiest Loep X." Vlakke zin: "(laagste score 6.2/10, gedeeld door drie onderwerpen: A, B, C; hoogste D 6.9/10)"; bij één laagste blijft "(laagste A 6.0/10, hoogste D 6.5/10)". Plan-pins die hierdoor veranderen: in `test_report_p02_kernzin` de vlakke-zin-test ("laagste A, B en C 6.2/10") en de twee gedeelde-laagste-pins ("A en B delen de laagste score (5.8/10); ..."), en `test_report_p02_profielvorm::test_vlakke_zin_noemt_laagste_en_hoogste_met_scores`.
- **Alle onderwerpen dezelfde score (taak 3, codereview):** geen "laagste ... hoogste" (dan zou één onderwerp beide heten) maar "Geen enkel onderwerp springt eruit: alle zes onderwerpen scoren 6.2/10. Dat is zelf de bevinding." De startpuntzin krijgt dan geen gelijkstandvorm maar de kale keuze; de kop zegt de gelijkstand al.
- **Gelijkstandzin noemt het gelijke onderwerp (taak 3, codereview):** "deelt de laagste score met het volgende" wordt "met {naam}" bij één ander onderwerp en "met twee andere onderwerpen" (telwoord) bij meer. De namen komen uit het profiel (de onderwerpen op de laagste getoonde score), niet uit de volgende rasterrij: na een tie-break hoeft die niet de gelijke te zijn. "Laagste" voor het startpunt betekent nu: hoort bij de onderwerpen met de laagste getoonde score. Pins: `test_report_p02_kernzin::test_exacte_gelijkstand_krijgt_een_eigen_zin` en `test_report_respons_gevolgen::test_gelijkstandzin_wordt_een_mogelijk_startpunt` (fixture kreeg een echte getoonde gelijkstand, anders is er geen onderwerp om te noemen).
- **Eén verschilhelper voor alle drie de scans (taak 3, codereview 2):** `_getoond_verschil` rekent het verschil op de getoonde scores; Loep Start (`render_onboarding_report_html`) rekende dat nog zelf op ruwe scores en rendert anders "klein, 0,0 punt". De vlakke kop met alle onderwerpen gelijk laat de gelijkstandzin weg (die zegt het al); de kop "6 van de 6 onderwerpen scoren kwetsbaar" niet, dus daar blijft "Dat onderwerp deelt de laagste score met vijf andere onderwerpen" staan.
- **Meervoud aandachtspunten (taak 3, codereview):** "Daarnaast is A een aandachtspunt." / "Daarnaast zijn A en B aandachtspunten." Pin: `test_report_exit_kernzin::test_kernzin_claimt_niet_dat_startpunt_het_laagst_scoort`.
- **Gebruiksblok blijft tot taak 5 (taak 4):** het plan liet het gebruiksblok in taak 4 van p.02 verdwijnen en nam één rode test voor lief. Twee andere tests pinnen dezelfde leesroute (`test_report_onboarding_eerlijk::test_de_leesroute_noemt_de_hoofdstukken_zoals_ze_heten`, `test_report_onboarding_degraded_agenda::test_de_leesroute_op_p02_komt_uit_bij_een_echte_vraag`), en een blok dat een taak lang stil wegvalt is precies wat Fail Loud verbiedt. Het gebruiksblok rendert daarom tijdelijk in het `leidraad_html`-slot (zelfde plek: vóór de meetgegevens); taak 5 vervangt die aanroep door de leidraad. Geen enkele test is rood.
- **Vertrekreden-cel in het why-blok (taak 4, codereview):** blok 2 en de kernzin noemen de meest genoemde vertrekreden al met getal. Hoort het startpunt bij die reden (alleen of in een gelijkspel), dan maakt de why-cel alleen de koppeling, zonder getal: "Hoofdreden · Meest genoemd · dit onderwerp hangt samen met de meest genoemde vertrekreden" of "Als vertrekreden genoemd · Even vaak · dit onderwerp hangt samen met een van de meest genoemde vertrekredenen". Staat een andere reden hoger, dan heet de cel "Als vertrekreden genoemd" (niet "Hoofdreden", dat sprak zichzelf tegen) met "26× · van de 45 vertrekkers; Beter aanbod elders is vaker genoemd (30 keer)". De noemer volgt blok 2 (wie een reden gaf, als dat minder is); gelijkspel en "vaker" komen uit `exit_r_top`. Helper: `_hoofdreden_cell`.
- **Spreiding- en verdiepingcel alleen als ze een reden zijn (taak 4, codereview):** de spreidingcel staat er alleen als de rij van het startpunt de spreidingsvlag heeft of de spreiding de volgorde besliste (`decided_by`), en boven `MIN_DISTRIBUTION_N`; zonder signaal stond er "0 van de 45 onder de 5". De verdiepingcel vervalt als de gespreksopener dezelfde toelichting al noemt. Een onbekende optiesleutel geeft een fout, zoals bij de richtingopties.
- **Verwijzing op de Loep Start-agenda (taak 4, codereview):** "Dezelfde opener staat op pagina 2." staat er alleen als de zinnen echt gelijk zijn. p.02 kiest het startpunt uit `top_fkeys` (scoring, risico afgerond op 2 decimalen), de agenda uit `_select_priority_factors` (onafgerond); bij een bijna-gelijkstand kunnen die uiteenlopen. Dat verschil is niet opgelost, alleen afgevangen.
- **Bronregel bij een gedeelde laagste score (taak 4, open punt uit taak 3):** "Gebaseerd op de laagst scorende factor." klopt niet als meer onderwerpen de laagste getoonde score delen. Wordt: "Gebaseerd op de laagste score; die deelt dit onderwerp met {naam}." of "... met {telwoord} andere onderwerpen." Geldt voor exit en retention (`_raster_attribution`, alleen in de generieke tak) en voor Loep Start, dat die regel vast had. De K1-tak (toprij boven een lagere score zonder verklarend signaal) blijft ongewijzigd.
- **Bronregel bij de datagedreven opener (taak 4):** de regel "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping." vervalt samen met `_short_mgmt_q`; de bronregel zegt nu altijd waarom dit onderwerp het startpunt is. De opener zelf noemt de toelichting al.
- **Paginasplitsing in tests (taak 4):** p.02 krijgt `id="p02"` (nodig voor de CSS van taak 6), dus `_page_two` in `test_report_degraded_page_two` zoekt op `<div class="pb sec"` zonder het sluitende `>`; `test_totaalsignaal_staat_met_profiel_in_de_onderbouwingsrij` kijkt naar `class="sg p02-cijfers"`.
- **Genoteerd, niet veranderd (taak 4):** zonder factorprofiel staat het totaalsignaal nu twee keer op p.02: in de degraded kernzin ("De frictiescore van 5.1/10 wijst op een gemengd vertrekbeeld.") en in de cijfersrij, die in die staat ook rendert. Geen tegenspraak; de kernzin is gepind (`_DEGRADED_SIGNAAL`). Ook de drempel van 10 staat er dan twee keer (respons-oordeel en degraded alinea).
- **Geen leidraad zonder factorprofiel (taak 5):** in de degraded staat rendert de leidraad niet; hij zou sturen naar een startpunt, een verdieping en een volgorde die er niet zijn. De degraded alinea op p.02 zegt wat er wel is, de slotpagina draagt een echte vraag. De vier tests die de degraded en de normale leesroute pinden gaan in lockstep mee en controleren nu dat er geen leidraad en geen `class="pref"` staat (degraded) of dat de leidraad met de juiste regel 3 rendert (met profiel): `test_report_direction_degraded::test_leidraad_belooft_geen_lege_secties` en `::test_leidraad_met_profiel`, `test_report_onboarding_degraded_agenda::test_zonder_profiel_geen_leidraad_maar_wel_een_echte_vraag`, `test_report_onboarding_eerlijk::test_de_leidraad_noemt_bij_loep_start_geen_verdieping`.
- **Loep Start zonder regel 4 (taak 5):** zonder afdelingen, zonder open toelichtingen en zonder werkbeleving heeft regel 4 geen sectie om naar te verwijzen; dan rendert de leidraad niet. De werkbelevingssectie en die gate lezen dezelfde variabele (`_ob_has_sdt`), zodat ze niet uiteen kunnen lopen. In de praktijk heeft elke Loep Start-meting werkbeleving.
- **"Responsbasis" heet overal "meetgegevens" (taak 5):** het plan paste alleen de `wel=`-lijsten aan. Drie terugvalzinnen van de kernzin ("Zie de vertrekcontext en de responsbasis ...") en de degraded agenda-alinea van Loep Start ("de responsbasis op de openingspagina") verwezen ook naar een blok dat zo niet meer heet; die zeggen nu "de meetgegevens". Pins: `test_report_respons_gevolgen::test_verwijzing_krijgt_een_eigen_mededeling_in_plaats_van_een_haakje` en `::test_verwijzende_terugval_krijgt_geen_haakje`.
- **Begeleide bespreking ook uit de Loep Start-agenda (taak 5, H5):** `SECTION_INTROS["gespreksagenda"]` (alleen Loep Start) zei nog "maak je in de begeleide managementbespreking"; wordt "maken jullie in de bespreking zelf". Geen test pinde deze zin.
- **Datastatus-pin bij Loep Start (taak 5):** het plan schreef de assertie `"Niet in dit rapport: werkgeversaanbeveling (eNPS)."`; zonder afdelingen staan die er ook in ("Niet in dit rapport: afdelingen (te weinig antwoorden per afdeling), werkgeversaanbeveling (eNPS)."). De test controleert daarom de regel en het eNPS-deel los, en dat "openen zodra" niet op p.02 en in de meetgegevens van alle drie de scans staat.
- **Meetdatums in de noemer-tests (taak 5):** `_basis` in `test_report_respons_gevolgen` krijgt meetdatums, want "Meetperiode niet vastgelegd" raakte de `"vastgelegd" not in`-asserties van twee tests die over de noemer gaan (`test_responsbasis_zwijgt_bij_voldoende_respons`, `test_responsbasis_toont_de_reden_van_een_te_laag_vastgelegd_aantal`).
- **Leidraad kent ook een vlag voor de verdieping (taak 5):** het plan gaf `_leidraad_block` alleen `has_segments`, `has_quotes` en `has_direction`, waardoor regel 3 bij Vertrek en Behoud altijd "en wat mensen als toelichting kozen" beloofde. Er is een verplichte `has_deepening` bijgekomen; zonder verdieping zegt regel 3 "de laagste stelling en de score van elke stelling", wat de verdiepingspagina in die staat wel toont. Nieuwe test: `test_report_p02_mtvel::test_leidraad_belooft_geen_toelichtingen_in_een_meting_zonder_verdieping`.
- **Elke leidraadvlag hangt aan de gate van de sectie zelf (taak 5, codereview):** `bool(deep_agg)` was nog te grof. Het verdiepingsblok toont pas een verdeling vanaf vijf beantwoorde verdiepingsvragen, en alleen voor het onderwerp zelf; bij een startpunt met twee antwoorden beloofde regel 3 de toelichtingen terwijl die pagina zegt dat het er te weinig zijn. De vlag komt nu uit het aggregaat van het startpunt via `_deepening_shows_distribution`, dezelfde staffel die `_deepening_block` nu ook zelf gebruikt (geen nieuwe drempel, één bron). Regel 4 volgt de werkbelevingsgate (`_heeft_werkbeleving`, dezelfde dimensies als de sectie) nu ook bij Vertrek en Behoud, niet alleen bij Loep Start: zonder afdelingen, toelichtingen en werkbeleving rendert de leidraad in geen van de drie producten. `has_direction` blijft op `bool(direction_agg)`: bij te weinig antwoorden rendert het blok "Wat er moet gebeuren" nog wel, met de eerlijke tellingen. De drie renderers kiezen hun vlaggen via één gedeelde `_leidraad_html`, zodat ze niet uiteen kunnen lopen.
- **Regel 1 van de leidraad is productbewust (taak 5, codereview):** de methodiekpagina van Loep Start heeft geen cel Drempelwaarden (daar staat Checkpoint-logica), dus "de drempels staan op pagina N" was daar onwaar. Loep Start zegt nu "wat Loep uit deze aantallen wel en niet afleidt staat op pagina N". Zet taak 11 een drempeltabel op alle drie de methodiekpagina's, dan mag die tweedeling weg en wijst regel 1 naar `LEIDRAAD_ANKERS["drempels"]`.
- **Omgekeerde meetperiode (taak 5, codereview):** een sluitdatum vóór de startdatum werd letterlijk afgedrukt ("30 maart 2026 tot 9 maart 2026"). `build_report_data` vergelijkt de datums nu vóór het formatteren (via `_kalenderdag`, dezelfde dag die `_datum_nl` afdrukt) en geeft `period_dates_conflict`; de meetgegevens zeggen dan "Meetperiode niet betrouwbaar vastgelegd" met één regel eronder waarom, in plaats van een periode die niet kan bestaan.
- **Reden zonder afdelingstabel komt uit de data (taak 5, codereview):** de renderers gaven vast "te weinig antwoorden per afdeling" mee, ook als de organisatie nooit een afdeling had vastgelegd. `_segment_absent_reason` onderscheidt die twee ("niet vastgelegd bij deze meting" tegenover "te weinig antwoorden per afdeling") en `build_report_data` levert hem als `segment_reason`; een fixture zonder die sleutel krijgt geen verzonnen reden maar de kale opsomming.
- **Verwijzing van de gespreksagenda naar pagina twee (taak 5, codereview):** "Dezelfde opener staat op pagina 2." had het nummer hardcoded en klopte alleen zolang p.02 letterlijk pagina twee is; die twee plekken gebruiken nu `_pref("p02")`, met `id="p02"` als anker. De acht tests die de zin pinden delen daarvoor één constante.
- **H4 is na taak 5 nog niet volledig gesloten:** de spec vraagt paginanummers "overal waar naar een sectie wordt verwezen" (par. 4 blok 5). De leidraad heeft ze, en twee van de drie verwijzingen die de leesronde bij H4 citeerde zijn verdwenen met het blok waarin ze stonden: "achteraan de gespreksagenda" (gebruiksblok, p.02) en "segmentbeeld verderop in dit rapport" (Segmentstatus-kaart, p.03). Vier verwijzingen dragen nog geen nummer: `SECTION_INTROS["verdieping"]` ("Wat er volgens hen moet gebeuren staat bij de gespreksagenda", het derde H4-citaat), `OVERZICHTSPROFIEL_RANGORDE` voor Vertrek/Behoud ("bij de gespreksagenda verderop") en voor Loep Start ("staat verderop vooraan bij de thema's met de meeste aandacht en in de gespreksagenda"), en de `divided`-tak van `_direction_p02_line` ("Zie de gespreksagenda."). De eerste drie zijn vaste copy die de taalronde (taak 13) toch herschrijft, dus daar horen ze; de vierde kan niet zonder contractwijziging, want `_bestuurlijke_read` escapet `direction_line` met `_h()` (die regel draagt tellingen en optieteksten) en een `<a class="pref">` erin zou letterlijk worden afgedrukt. Dat vraagt een aparte parameter naast `direction_line`.
- **WeasyPrint-Docker niet gedraaid (taak 5):** de Docker-daemon reageerde in deze sessie niet (`docker ps` en `docker info` liepen in een timeout), dus de PDF-render met nul warnings is voor deze taak niet uitgevoerd. De structuur is wel getest (elke verwijzing wijst naar precies één bestaand anker, in Vertrek, Behoud, Loep Start en in de degraded staat zonder factorprofiel), en de uitkomst is gepind in `test_report_p02_mtvel::test_de_pdf_vult_de_verwijzingen_met_echte_paginanummers`: die rendert met WeasyPrint, eist nul WARNING/ERROR-records op de `weasyprint`-logger (een verwijzing naar een onbekend anker logt daar `Content discarded: target points to undefined anchor`) en controleert in de tekstlaag dat de gevulde nummers naar de echte pagina van de gespreksagenda en het overzichtsprofiel wijzen. De test slaat via `requires_weasyprint` netjes over waar GTK ontbreekt. Het pad `target-counter(attr(href), page)` -> `attr(href)` als string -> anker uit het element-`id` is nagelezen in de WeasyPrint-broncode van het venv (`css/tokens.py::get_target`, `css/targets.py::lookup_target`, `css/__init__.py` dat `-weasy-anchor` uit `id` zet). Taak 6 en 14 moeten de echte render alsnog doen.
- **Genoteerd, niet veranderd:** bij een respons onder `RESPONSE_INDICATIVE_RATE` staat er twee keer een dubbele punt na elkaar ("Indicatief beeld: Behoud vraagt aandacht op één kwetsbaar onderwerp: ..."). Dat was al zo en blijft voorlopig staan.
- **Pagina twee kon niet op een echte PDF gemeten worden (taak 6):** WeasyPrint kan lokaal niet renderen (geen GTK) en de Docker-engine reageerde ook in deze sessie niet (`docker info` liep in een timeout, en de Windows-service start niet zonder beheerdersrechten). De vijf PDF's uit stap 4 van het plan zijn dus niet gerenderd en niet gemeten. Wat wél is gedaan: de structurele eisen zijn in HTML getest voor alle zeven staten van p.02 (drie producten, met en zonder factorprofiel, plus de retentievarianten) en de meetcode van `scripts/check_pdf_report.py` is getest op PDF's die PyMuPDF zelf bouwt met bekende paginavulling en bekende teksten, met per regel een document dat hem overtreedt en een document dat hem haalt. De uitkomst op het echte rapport is gepind in `test_report_p02_mtvel::test_de_echte_pdf_zet_de_meetgegevens_op_pagina_twee`, dat via `requires_weasyprint` netjes overslaat waar de renderer ontbreekt. **Nooit tegen een echte PDF gelopen:** of p.02 met de compacte maten daadwerkelijk op één A4 past, of hoofdstuk 02 in de PDF echt op pagina drie begint, en of de tabelkopregel klopt. Scenario 11 en 20 zijn wel gegenereerd (HTML): p.02 is daar één paginasectie zonder tweede paginabreuk, met de meetgegevens erin, en de sectie erna opent met hoofdstuk 02. Taak 14 moet de render alsnog doen, samen met de openstaande render uit taak 5.
- **Structuur van p.02 was na taak 5 al goed (taak 6):** de losse kaarten Populatie, Segmentstatus en Datastatus zijn in taak 5 in de meetgegevens opgegaan, dus stap 2 van taak 6 vroeg geen productiewijziging meer. De eisen zijn alleen vastgelegd: één `pb sec` voor heel p.02, geen tweede paginabreuk erin, geen losse kaart na de meetgegevens, en de sectie direct erna opent met de hoofdstukkop 02 (in alle drie de producten, ook zonder factorprofiel).
- **De compacte maten van p.02 staan achteraan in het stylesheet (taak 6):** het plan zette ze na `.br-kernzin`. Daar staan ze vóór `.why { ... }`, en twee bestaande designguards (`test_report_html_design::test_why_block_not_navy_background` en `::test_why_block_has_border_left`) lezen met `re.search(r'\.why\s*\{')` de eerste treffer in het stylesheet: die werd `#p02 .why`, een regel zonder achtergrond en zonder left-border, waardoor beide guards omvielen. De overrides staan daarom onderaan, ná elke basisregel die ze aanpassen (wat voor overrides ook de gewone plek is). `test_css_houdt_pagina_twee_compact` pint die volgorde, zodat een volgende verplaatsing de designguards niet opnieuw stilzwijgend op de verkeerde regel laat kijken. Geen test is aangepast.
- **`scripts/check_pdf_report.py` draagt een regelnaam per bevinding (taak 6):** het plan gaf één lijst met foutregels. Taak 6 mag de vullingsregel nog niet halen (die is van taak 8), dus elke bevinding is nu een `Bevinding(regel, melding)` en `check()` neemt een `regels`-selectie; de CLI kan die met `--regel` beperken en noemt de gemeten regels in de slotregel. Verder drie afwijkingen van de schets, alle in dezelfde richting (niets stil laten gebeuren): een document met minder dan drie pagina's geeft een bevinding in plaats van een `IndexError`; een onleesbaar bestand geeft `NIET GEMETEN` met exitcode 2, onderscheiden van `NIET OK` met exitcode 1; en de paginatekst wordt op witruimte genormaliseerd voordat er naar "pagina N" wordt gezocht, want `target-counter` zet het nummer achter het woord en de tekstlaag mag daar afbreken (zelfde normalisatie als de PDF-test van taak 5). De tekstblokken worden op positie gesorteerd, zodat "de eerste tekst van een pagina" niet van de volgorde in de contentstream afhangt. Import via `pymupdf` in plaats van `fitz`: dezelfde bibliotheek, maar `fitz` waarschuwt bij import dat het verdwijnt.
- **Een lege paginaverwijzing is nu zelf een bevinding (taak 6, codereview):** de regel telde alleen de nummers die er stonden, dus een rapport waarin élke verwijzing leeg renderde (ontbrekend anker, "op pagina .") kreeg "geen overtredingen". Het script meldt nu het aantal verwijzingen zonder nummer, en eist minstens vijf gevulde verwijzingen zodra pagina twee de leidraad draagt (die levert er vijf, `_leidraad_block`/`LEIDRAAD_ANKERS`). Het minimum hangt bewust aan de aanwezigheid van de leidraad en niet vast op vijf: zonder factorprofiel rendert de leidraad niet en hoort p.02 er nul te hebben (taak 5), dus een blind minimum zou daar een fout melden die er niet is. De zelfverwijzing "de meetgegevens op deze pagina;" wordt eerst weggemaskeerd, anders leest die prozaregel als een weggelopen verwijzing. Beide markers (de titel van de leidraad en het label "Meetgegevens") staan met een verwijzing naar `report_html.py` in het script: herschrijft de taalronde ze, dan moeten ze hier mee, anders meldt het script een overloop of een weggevallen anker die er niet is.
- **De CLI weigert een regel waarvoor de gegevens ontbreken (taak 6, codereview):** `--regel tabelkop` zonder `--thead` meette niets en zei toch "OK (gemeten: tabelkop)". Dat is nu een harde fout (exitcode 2), net als het omgekeerde (`--thead` zonder die regel in de selectie). Staat de tabelkopregel alleen in de standaardselectie, dan blijft hij optioneel en zegt de slotregel "tabelkop (niet gemeten, geen --thead)".
- **Nieuwe regel `paginaformaat` (taak 6, codereview minor):** de vulling wordt met de A4-marges gerekend, dus op een ander paginaformaat is de uitkomst niet te vertrouwen. Dat is nu een bevinding in plaats van een stille misrekening, en hij wordt altijd gemeten, net als "dit document is te kort om te meten".
- **PyMuPDF staat in `requirements-dev.txt` (taak 6, codereview):** het pakket stond in geen enkel requirements-bestand, terwijl het script en de nieuwe tests het op moduleniveau importeren; zonder het pakket viel de hele collectie van `tests/` om en daarmee de faalset-diff zelf. Naast de regel in `requirements-dev.txt` staat er nu een `requires_pymupdf` in `tests/conftest.py` (zelfde patroon als `requires_weasyprint`) en importeert de testmodule het script geguard, zodat alleen de metende tests overslaan. Geverifieerd met een geblokkeerde import: 65 geslaagd, 20 overgeslagen, collectie heel.
- **De meetcode is ook op een echte WeasyPrint-PDF gelopen (taak 6, codereview):** niet op een verse render (geen GTK, geen Docker), maar op de drie gecommitte voorbeeldrapporten in `docs/examples/`, die nog de render van vóór taak 5 zijn. Uitkomst: alle drie melden "pagina 2 bevat de meetgegevens niet" en "pagina 3 begint niet met hoofdstuk 02 maar met 'Populatie'" respectievelijk "'Segmentstatus'", plus paginavulling van 4%, 15% en 18% op pagina drie. Dat is precies H16 zoals de leesronde hem beschreef, en het bewijst dat de meting op echte output werkt. Wat het niet bewijst: dat de render ná taak 5 en 6 de regel haalt. De vullingscijfers van diezelfde meting zetten de MIN_FILL-grens in perspectief: de laagste pagina die slaagt haalt 42%, de hoogste die valt 38%. Aandachtspunt voor taak 8, vastgelegd bij de constante.
