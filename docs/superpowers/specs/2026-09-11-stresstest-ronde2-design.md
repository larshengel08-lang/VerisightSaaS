# Spec: stresstest ronde 2, de conclusielaag eerlijk maken

**Datum:** 2026-09-11
**Status:** AKKOORD Lars (vijf keuzes bevestigd 2026-09-11), klaar voor plan + bouw
**Aanleiding:** `docs/rapport-stresstest-2026-09-10.md`. Ronde 1 (B1-B4, B10, B11, B15, B16) loopt apart. Deze ronde pakt de bevindingen die een ontwerpkeuze vroegen: B5, B6, B7, B8, B12, B17, B19 en het eerlijk labelen van Loep Start (B18-tussenstap).
**Volgorde:** starten NA de merge van ronde 1 op `main` (zelfde bestanden: `report_html.py`, `report_priority.py`). Eerst rebasen, dan bouwen.
**Acceptatiecriterium ("als een huis"):** `scripts/stresstest_report.py` opnieuw over alle 20 scenario's; op vraag 1, 2, 5 en 6 geen enkel ✗ meer, behalve waar de oorzaak een ronde-3-item is (B9 paginavulling, B13 Anders, B14 brug tussen tellingen, B20 drempelconsistentie). Matrix bijwerken in het bevindingenrapport onder "Na ronde 2".

---

## 0. Vijf besluiten (Lars, 2026-09-11)

| # | Besluit | Uitwerking hieronder |
|---|---|---|
| 1 | Behoudssignaal naar de gezondheidsschaal (hoog = goed), overal | ronde 1 (B4), hier alleen als afhankelijkheid |
| 2 | Vlak profiel expliciet benoemen op p.02 én de richtingvraag als eerste tie-break in de ranglijst; tie-break-rijen markeren | par. 1 en 2 |
| 3 | Afdelingsstartpunt alleen bij verschil >= 0,3 en n >= 10 aan beide kanten; anders "dicht bij elkaar"; restgroep noemen als die lager is; rij-cap eerlijk | par. 3 |
| 4 | Tussenvorm "grootste groep zonder meerderheid" en een aparte regel als "niets nodig" meedingt op een laag scorend onderwerp | par. 4 |
| 5 | Loep Start eerlijk labelen (site + rapport); v1.1-verdiepingsset na deze ronde | par. 7 |

Daarnaast, als ronde-2-items met een concrete regel (Lars: "eens" op de rondeverdeling): B17 (crisis en middelmaat hetzelfde label, par. 5) en B19 (respons heeft gevolgen, par. 6).

Gedeelde regels voor alle copy: gewone taal (copy-toon 2026-09-06), Loep als onderwerp, nooit "ik", geen em-dashes, Fail Loud (nooit een stil weggelaten blok, nooit een kaal veld). Elke nieuwe drempel is een benoemde constante met een toelichting, en wordt in één zin uitgelegd op de plek waar hij werkt.

---

## 1. Ranglijst: richtingvraag als eerste tie-break (B6-b, B5)

### 1.1 Huidig
`rank_factors` in `backend/report_priority.py`: sorteren op score; binnen `PRIORITY_TIE_MARGIN` (strikt < 0,3) kunnen een spreidingsvlag (>= 30% onder 5, alleen bij n >= 10) en een verdiepingsvlag (bestaande verrijkingsstaffel) de volgorde flippen. De richtingdata (`direction_agg`, sinds 2026-09-08 door elke respondent beantwoord) doet niet mee. Rijen die door een vlag omhoog kwamen zijn niet gemarkeerd (scenario 06: 6.2, 6.2, 6.3, 6.2, 6.3, 6.5 zonder uitleg).

### 1.2 Nieuw
Per factor een derde signaal: **vraag om verandering** = het aantal respondenten dat bij die factor (als eigen laagste) de richtingvraag beantwoordde met iets anders dan "Niets, dit zit hier goed". Alleen geldig als het aantal beantwoorders >= `DIRECTION_MIN_N` (3, bestaand).

Sorteerregel, in één zin (staat letterlijk onder de ranglijst):

> "Gesorteerd op score. Liggen scores binnen 0,3 van elkaar, dan telt eerst waar de meeste mensen om verandering vragen; is dat ook gelijk, dan een grote spreiding en een gedeelde toelichting uit de verdieping."

Implementatie: binnen een tie-groep (alle rijen die binnen de marge van de laagste van de groep liggen, bestaande groepslogica hergebruiken) wordt gesorteerd op (1) vraag-om-verandering aflopend, alleen als beide rijen een geldig aantal hebben, (2) spreidingsvlag, (3) verdiepingsvlag, (4) score, (5) factorlabel alfabetisch. Determinisme blijft; de bestaande tests op de vlaggen blijven gelden (ze worden alleen ondergeschikt aan het richtingsignaal binnen de marge).

### 1.3 Markering van tie-break-rijen (B5)
Elke rij die door een tie-break boven een rij met lagere of gelijke score staat, krijgt in de agendakolom een regel eronder, in gewone taal, met de telling:

- richting: "Staat hoger dan [factor] omdat hier meer mensen om verandering vragen (10 van de 11 tegen 9 van de 11)."
- spreiding: "Staat hoger dan [factor] omdat de antwoorden hier verder uiteenlopen (13 van de 45 onder de 5)."
- verdieping: "Staat hoger dan [factor] omdat hier een gedeelde toelichting uit de verdieping ligt."

Loep Vertrek: de vertrekreden-weging (`EXIT_REASON_WEIGHT`) verschuift daar ook de volgorde en heeft geen kolom. Toevoegen: kolom "Als vertrekreden genoemd" (telling) in het raster voor exit, en dezelfde markeringsregel ("Staat hoger dan [factor] omdat dit vaker als vertrekreden is genoemd (9 keer tegen 4)."). `_raster_attribution` (p.02-bronregel, 2026-07-20) krijgt een richting-tak: "De scores lagen vrijwel gelijk; het aantal mensen dat om verandering vraagt gaf de doorslag."

### 1.4 Tests
- Tie-groep met gelijke scores, verschillend aantal vraag-om-verandering: richting wint boven spreiding.
- Richting alleen geldig bij >= 3 beantwoorders; onder de drempel valt de tie-break terug op spreiding/verdieping.
- Markeringsregel verschijnt alleen op rijen die daadwerkelijk zijn geflipt, met de juiste tellingen.
- Regressie: scenario 01 (Leiderschap 10/11 vraag om verandering wint van Groeiperspectief 9/11 bij 6,17 vs 5,67? NB: 0,5 verschil, dus GEEN tie; het startpunt blijft Groeiperspectief. Dit is bewust: de marge blijft 0,3. Testen dat de regel niet buiten de marge werkt), scenario 06 (geen niet-oplopende kolom zonder markering meer), scenario 08 (exit-kolom aanwezig).

---

## 2. Vlak profiel op pagina twee (B6-a)

### 2.1 Regel
Het profiel is **vlak** wanneer het verschil tussen de hoogste en laagste van de zes werkfactoren kleiner is dan `FLAT_PROFILE_SPAN = 1.0` (strikt <). Constante in `report_priority.py`, met toelichting: "binnen één punt van elkaar" is in één zin uitlegbaar.

### 2.2 Copy op p.02
Bij een vlak profiel opent de kernzin niet met "[factor] is het eerste gesprekspunt" maar met:

> "Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste [X] [score], hoogste [Y] [score]). Dat is zelf de bevinding."

Daarna de startpuntkeuze, met de grond erbij, afhankelijk van wat de ranglijst besliste:

- richting gaf de doorslag: "Als startpunt kiest Loep [factor]: daar vragen de meeste mensen om verandering ([a] van de [b])."
- alleen score (geen tie binnen 0,3, of richting ongeldig): "Als startpunt kiest Loep [factor], de laagste score. Het verschil met de volgende is klein ([delta]); weeg dat mee in de bespreking."
- iedereen zegt vooral "niets nodig" (state none_needed op het startpunt): "Je mensen vragen nergens dringend om verandering. Bespreek of een startpunt nu nodig is, of dat dit beeld eerst gedeeld wordt."

Bij een vlak profiel waarbij alle factoren >= 6,5 (scenario 04): de kop "Waarom [factor] bovenaan staat" wordt "Waar Loep zou beginnen, en waarom", en de bandcel "7,8/10 · relatief sterk" mag niet naast "eerste gesprekspunt" staan zonder de vlak-profiel-zin erboven.

De bestaande onderbouwingscel ("Gemiddelde score", "Laagst scorende stelling", "Relatief sterk") blijft.

### 2.3 Niet-vlak profiel
Ongewijzigd: "[factor] is het eerste gesprekspunt." plus `_raster_attribution`.

### 2.4 Tests
Scenario 01, 04, 18, 19 tonen de vlak-profiel-zin; scenario 02, 05, 06 niet. De zin bevat de echte laagste/hoogste met scores. Geen em-dash.

---

## 3. Afdelingsstartpunt alleen bij echt verschil (B7, B8)

### 3.1 Regel
Het navy-blok "Startpunt voor de bespreking" op de segmentpagina noemt een afdeling alleen als:
- verschil tussen de laagste niet-gepoolde afdeling en de op één na laagste >= `SEGMENT_START_MIN_DELTA = 0.3`, én
- beide afdelingen n >= `MIN_DISTRIBUTION_N` (10).

Anders: "De afdelingen liggen dicht bij elkaar (laagste [X] [score], hoogste [Y] [score]). Geen afdeling vraagt als eerste aandacht; kijk naar het organisatiebeeld." Bij exact gelijke laagste scores: nooit één aanwijzen.

Als de gepoolde restgroep ("Overige afdelingen") lager uitkomt dan de aangewezen laagste afdeling: extra zin "De restgroep 'Overige afdelingen' scoort lager ([score]), maar is samengesteld uit kleine afdelingen en wordt daarom niet als startpunt genoemd."

Het bestaande laagste-thema-deel van de anchor-zin (2026-07-16) blijft alleen staan als er een afdeling wordt genoemd.

### 3.2 Rij-cap (B8)
De cap van 8 rijen in `_department_segment_rows` vervalt: elke afdeling met n >= MIN_SEGMENT_N (5) krijgt een rij. Bij meer dan 12 rijen mag de tabel over een pagina heen lopen (WeasyPrint: `page-break-inside: auto` op de tabel, header herhalen). De intro-zin "Afdelingen met minder dan vijf responses worden gebundeld" is daarmee weer waar.

### 3.3 Tests
Scenario 01 (Sales 6,02 vs restgroep 5,86: geen aanwijzing, restgroep-zin), 02 en 19 (exacte tie: geen aanwijzing), 06 (Operations 4,5 vs 7+: wél aanwijzing), 10 (12 afdelingen, allemaal in de tabel, Operations n=9 zichtbaar).

---

## 4. Richtingblok: grootste groep zonder meerderheid, en "niets nodig" op een laag onderwerp (B12)

### 4.1 Huidig
Vier staten: clear (top > 50% en marge >= 2), divided, none_needed (>= 50% niets; ronde 1 maakt dit strikt > 50%), too_few (< 3). Scenario 11: 27 van 62 (44%) met voorsprong 12 → "Geen eenduidige richting", niets over de grootste groep.

### 4.2 Nieuw: staat `plurality` binnen divided
Als er geen meerderheid is maar de grootste veranderoptie >= `DIRECTION_PLURALITY_MIN_SHARE = 0.35` heeft én een voorsprong >= 2 op de volgende optie (niets-nodig telt als optie mee):

- kop: "De grootste groep kiest [X], zonder meerderheid."
- regel: "[a] van de [b] kozen [X]; [c] kozen [Y]." (top twee, met tellingen; percentages alleen bij b >= 10 volgens de bestaande staffel)
- opdrachtvorm van [X] wordt getoond, met de bron "volgens de grootste groep ([a] van de [b])", nooit "volgens de meeste".
- p.02-regel: "Wat er moet gebeuren volgens de grootste groep: [opdrachtvorm] ([a] van de [b], zonder meerderheid)."

### 4.3 Nieuw: staat `split_none` op een laag scorend onderwerp
Als op een factor met score < 5,0 (kwetsbaar) de niets-optie de grootste of gedeeld-grootste keuze is (niets >= top veranderoptie - 1):

- kop: "Verdeeld: een deel zegt dat hier niets hoeft, een even groot deel vraagt om [X]."
- regel: "[n1] kozen 'Niets, dit zit hier goed'; [n2] kozen [X]. Op een onderwerp dat laag scoort ([score]) is dat verschil zelf het gesprek."
- geen opdrachtvorm als "moet"; wel de opdrachtvorm van [X] als "wat de andere helft vraagt".
- p.02-regel: "Wat er moet gebeuren: je mensen zijn hierover verdeeld ([n1] zegt niets nodig, [n2] vraagt om [X])."

Volgorde van evaluatie: too_few → none_needed (strikt > 50%) → clear → split_none (alleen bij score < 5,0) → plurality → divided.

### 4.4 Tests
Scenario 11 → plurality met 27/62; scenario 13 → split_none (14 niets, 14 verandering, score 4,5); scenario 15 (geen optie boven 35%) → divided ongewijzigd; scenario 04 → none_needed ongewijzigd. Staffel: onder 10 beantwoorders alleen tellingen.

---

## 5. Kernzin p.02 beweegt mee met het aantal kwetsbare onderwerpen (B17)

### 5.1 Huidig
De kernzin volgt alleen de band van het behoudssignaal (na ronde 1: gezondheidsschaal). Scenario 01 (geen factor kwetsbaar) en 05 (alle zes kwetsbaar, 42 van 45 onder de 5 op Leiderschap) krijgen dezelfde zin "Behoud vraagt aandacht".

### 5.2 Nieuw
De eerste zin van p.02 volgt het aantal werkfactoren onder 5,0:

- 0 kwetsbaar en profiel vlak → de vlak-profiel-zin (par. 2).
- 0 kwetsbaar, niet vlak → "Geen onderwerp scoort kwetsbaar. [factor] scoort het laagst en is het eerste gesprekspunt."
- 1 of 2 kwetsbaar → "Behoud vraagt aandacht op [één onderwerp / twee onderwerpen]: [X] ([score])[ en [Y] ([score])]."
- 3 of meer kwetsbaar → "Behoud staat breed onder druk: [k] van de 6 onderwerpen scoren kwetsbaar." gevolgd door het startpunt.

Het behoudssignaal-getal blijft in de cel eronder staan met zijn band; het stuurt de eerste zin niet meer alleen.

### 5.3 Tests
Scenario 01, 02, 05 krijgen drie verschillende openingszinnen; tellingen kloppen met `_factor_label`-drempels (afgeronde, getoonde waarde, conform ronde 1 B15).

---

## 6. Respons heeft gevolgen (B19)

### 6.1 Regel
`response_rate = afgerond / uitgenodigd` (alleen als uitgenodigd bekend is; bij self_send is `invited_count` de handmatige noemer).

- < `RESPONSE_CAUTION_RATE = 0.5`: bij de responsbasis op p.02 een zin: "Minder dan de helft heeft ingevuld ([a] van de [b]). Lees de uitkomsten als het beeld van wie meedeed, niet van de hele organisatie." En de kernzin krijgt een staart: "(op basis van [a] van de [b] genodigden)".
- < `RESPONSE_INDICATIVE_RATE = 0.3`: bovendien opent de kernzin met "Indicatief beeld:" en het woord "startpunt" wordt "mogelijk startpunt".
- >= 0,5: ongewijzigd.
- uitgenodigd onbekend: geen uitspraak over respons (geen fake percentage), wel de zin "Het aantal genodigden is niet vastgelegd; het responspercentage is daarom niet bekend."

### 6.2 Tests
Scenario 16 (30%: caution-zin, staart, "Indicatief beeld" want 30% is niet < 0,3 → alleen caution; voeg scenario 16b toe met 25% voor de indicatieve variant) en 17 (90%: ongewijzigd).

---

## 7. Loep Start eerlijk labelen (B18, tussenstap tot v1.1)

- Site, scankaart Loep Start (`home-page-content.tsx`) en output-regel op /producten: "Wij meten vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, geen individuele beoordeling. De verdieping (waarom, volgens je mensen) en het blok 'wat er moet gebeuren' komen in een volgende versie."
- Rapport Loep Start, p.02 onder de kernzin: "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Het rapport laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet gebeuren volgt in een volgende versie."
- Paginatitels "Verdieping: [factor]" in het Start-rapport hernoemen naar "[factor]" (er is geen verdieping).
- Gespreksagenda Start: de dubbele constatering ("Op deze stelling scoort de groep het laagst" + "Laagst scorende stelling in het cijferbeeld") ontdubbelen; de claim "het laagst van het hele beeld" alleen bij een strikt laagste, bij gelijkspel "een van de laagst scorende stellingen".
- Contract-tests die Start-copy pinnen in lockstep. Geen wijziging aan de Start-survey.

---

## 8. Buiten scope (ronde 3)
B9 paginavulling (lay-outtraject), B13 Anders-toelichtingen in het rapport, B14 brug tussen verdieping- en richtingtelling, B20 één drempelregel voor SDT/eNPS bij n < 10, Loep Start v1.1-verdiepingsset.

## 9. Verificatie (verplicht)
1. Backend-suite tegen de baseline via stash-diff (byte-identieke faalset; verwacht 25 failed pre-existent), nieuwe tests voor elke paragraaf.
2. `scripts/stresstest_report.py` alle 20 (+16b) scenario's; matrix bijwerken onder "Na ronde 2" in `docs/rapport-stresstest-2026-09-10.md`; per scenario citaat van de nieuwe p.02-openingszin.
3. Drie voorbeeldrapporten regenereren (HTML + PDF via WeasyPrint-Docker, 0 warnings, 0 em-dashes); p.02, ranglijst, segmentpagina en richtingblok visueel controleren.
4. Frontend: tsc = baseline, marketing-tests faalset per naam identiek, Start-copy op site.
5. Commit + push; Railway-redeploy als openstaande actie voor Lars; beslissingslog in `C:\Users\larsh\CLAUDE.md`.
