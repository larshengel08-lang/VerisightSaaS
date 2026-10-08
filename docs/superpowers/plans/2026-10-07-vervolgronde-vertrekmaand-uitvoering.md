# Vervolgronde vertrekmaand en zes keuzes: uitvoeringsverslag

Spec: `docs/superpowers/specs/2026-10-07-vervolgronde-vertrekmaand.md`. Plan: `docs/superpowers/plans/2026-10-07-vervolgronde-vertrekmaand.md`.

Uitgevoerd op 7 en 8 oktober in worktree `.worktrees/vervolgronde`, branch `feature/vervolgronde-vertrekmaand`, vanaf main `91ecfd14`. Werkwijze: per taak één implementer, daarna een spec-review en een codekwaliteitsreview, herreview tot beide akkoord waren; aan het eind een review over de hele branch. **Alle zeven spec-punten zijn gebouwd en door de reviews gekomen. Niet gemerged, niet gepusht.**

## Baselines

| | Voor (main `91ecfd14`) | Na (HEAD) |
|---|---|---|
| Backend `pytest tests` | 25 failed / 1816 passed / 11 skipped | 25 failed / 1930 passed / 11 skipped |
| Backend-faalset | `docs/superpowers/plans/vervolgronde-backend-baseline-fails.txt` | identiek per testnaam |
| Python 3.11-guard | groen | groen (67 passed, venv 3.11.9) |
| Frontend `tsc --noEmit` | 131 | 131 |
| Frontend `vitest run` | 47 failed / 1891 tests | 47 failed / 1897 tests, faalset identiek per testnaam (`vervolgronde-vitest-baseline-fails.txt`) |
| Frontend-build | | geslaagd, met dummy's alleen in de shell |

Eén tussentijdse suite-run gaf 26 fouten: `test_css_houdt_het_agendaslot_compact` las met `inspect.getsource` regelnummers terwijl een implementer `report_html.py` op dat moment bewerkte. Los gedraaid slaagt hij, en alle latere runs (ook de eindrun) zijn identiek aan de baseline.

## PDF-validatie in het productie-image

`scripts/render_in_image.py` in `loep-backend:test` (eigen `Dockerfile`, WeasyPrint 70.0). De nulmeting is gedaan op een tijdelijke worktree op de stand van main (daarna verwijderd); de eindmeting op HEAD, na het opnieuw genereren van `docs/stresstest/`, de voorbeeldrapporten en de besluitpagina-renders.

| | Nulmeting | Eindmeting |
|---|---|---|
| Bestanden | 24 (21 scenario's, 3 voorbeelden) | 34 (23 scenario's, 8 `zz_besluitmax`, 3 voorbeelden) |
| Met bevindingen | 3 | 3 |
| WeasyPrint-waarschuwingen | 0 | 0 |
| Em-dashes en en-dashes | 0 | 0 |

De drie bevindingen zijn de bekende: `paginavulling` op pagina 7 van 01 (36%), 09 (26%) en 19 (36%), met dezelfde percentages als vóór deze ronde. Nieuw en schoon: 21 en 22 (Vertrek met vertrekmaanden, 13 pagina's), en de drie `zz_besluitmax_oud_*` (besluitpagina met oude besluiten van 600 tekens, zie Taak 10), plus de bestaande `max`/`samen`-varianten. `p02-op-een-a4`, `besluit-op-een-a4`, `paginaverwijzing` en `zijmarge`: geen bevindingen.

**Paginatallen:** gelijk aan de nulmeting, behalve scenario 10 (18 naar 19) en 11 (20 naar 19). Beide komen door de gewisselde richtingstaat (andere kaarttekst in het agendaslot), niet door een overloop: de paginavullingsregel geeft daar geen bevinding.

## Richtingstaten: welke scenario's wisselden (spec par. 3)

Nulmeting en eindmeting met `scripts/richting_staten.py` (nieuw, leest de kaartklassen uit de HTML). Vijf kaarten wisselen, alle vijf "omhoog" (de enige toegestane richtingen: verdeeld naar grootste groep, verdeeld naar duidelijk, grootste groep naar duidelijk). Overal komt de wissel doordat de niets-stemmen niet meer in de noemer zitten:

| Scenario | Kaart | Voor | Na | Waarom (tellingen na) |
|---|---|---|---|---|
| 09 gemengde afdelingen | Startpunt groeiperspectief | plurality | clear | 4 van de 8 die om verandering vroegen, voorsprong 2; 1 koos niets (noemer was 9) |
| 10 veel kleine afdelingen | Tweede punt leiderschap | divided | plurality | 12 van de 27 (44%) die om verandering vroegen, voorsprong 4; 8 kozen niets (noemer was 35, 12/35 = 34% < 35%) |
| 11 groot normaal | Startpunt groeiperspectief | plurality | clear | 27 van de 47 (57%) die om verandering vroegen; 15 kozen niets (noemer was 62, 44%) |
| 19 vlak, niets nodig | Startpunt groeiperspectief | divided | clear | 6 van de 7 die om verandering vroegen; 5 kozen niets (noemer was 12, voorsprong op niets 1) |
| Voorbeeldrapport Loep Vertrek | Tweede punt leiderschap en feedback | divided | clear | 4 van de 5 die om verandering vroegen; 3 kozen ‘Niets, dit zat hier goed’ (het motiverende geval uit de leesronde) |

Geen enkele `none_needed`- of `split_none`-kaart veranderde. De spec-review vergeleek de oude en nieuwe functie uitputtend over 491.515 invoercombinaties: 0 keer naar beneden, `none_needed` en `split_none` exact gelijk, oude `clear` altijd nog `clear`.

## Wat er is gebouwd, per taak

| Taak | Onderwerp | Commits |
|---|---|---|
| 0 | Plan, baselines, hulpscript richtingstaten, nulmeting | `b70cbbb1` (spec), `b8eab23a` |
| 1 | Eén bron voor de vertrekmaand (`backend/exit_month.py`), import streng | `3466d304`, `82545087` |
| 2 | Submit valideert en bewaart de vertrekmaand; HR-waarde blijft leidend | `36faccf3` |
| 3 | Vraag in de Vertrek-vragenlijst met "Zeg ik liever niet" | `1c640ca7`, `f8f3cb9c`, `690618ff` |
| 4 | Uitstroomperiode alleen met randmaanden van minstens twee personen | `7220bb6a`, `fa4d2ca1` |
| 5 | Vertrekmaanden in stresstest (nieuwe scenario's 21 en 22) en Vertrek-voorbeeld | `9541a280`, `1cea2265` |
| 6 | Richtingstaat op de inhoudelijke stemmen | `63d03adb`, `26fa4493`, `a8db33a3` |
| 7 | Niets-stemmen apart op kaart, pagina twee, methodiek en drempeltabel | `8948ae24`, `2709bd9c`, `3eab6859`, `83978766` |
| 8 | Geen "hierboven" meer naar de richtingkaart | `59de77d6`, `5afb7e7f` |
| 9 | Omvangvak "1.000 of meer medewerkers" | `f5ba2f30` |
| 10 | Besluitvelden op 240 tekens met teller | `0f37db23`, `4d40c27b` |
| 11 | Gebruiksgegevens zonder meting na twee jaar weg | `a5a4f663`, `c3d19305` |
| 12 | Voorbeeldrapporten, eindmeting, browsercheck, verslag | `1b12e48d` en de verslagcommit |

### Kern per punt

1. **Vertrekmaand.** Vraag "In welke maand ben je vertrokken, of vertrek je?" in stap 1 van Loep Vertrek, niet verplicht, met "Kies een maand", "Zeg ik liever niet" en de maanden van een half jaar vooruit tot twee jaar terug (nieuwste eerst). Hulptekst (gekoppeld via `aria-describedby`): "Niet verplicht. Je organisatie ziet je antwoord niet los: het rapport noemt alleen een periode, en alleen als genoeg mensen dezelfde maand kozen." "Zeg ik liever niet" en overslaan sturen `null`. De server weigert met 422: een maand bij een andere scan, een ongeldige vorm (ook `""` en `liever_niet`), een maand buiten het venster (met één maand speling) en een maand bij een respondent wiens maand HR al aanleverde (die wordt nooit overschreven, ook niet met leeg; de vraag staat dan niet in de vragenlijst). Opslag in de bestaande kolom `respondents.exit_month`, geen migratie. Een test pint dat `exit_month` niet in de kolomgrant voor klanten staat.
2. **Uitstroomperiode.** Alleen als minstens vijf maanden bekend zijn én de vroegste en de laatste maand elk minstens twee personen hebben. Anders in "Niet in dit rapport": "de periode van vertrek (de vroegste of de laatste opgegeven maand is door te weinig mensen gekozen om die te noemen zonder dat iemand herkenbaar wordt)". De regel zegt "vertrek tussen" in plaats van "vertrokken tussen", omdat de vraag ook een geplande maand toelaat. Docstring eerlijk herschreven. Voorbeeld Loep Vertrek: "Uitstroomperiode: vertrek tussen oktober 2025 en maart 2026 (bij 30 van de 35 vastgelegd)."
3. **Niets telt niet als richting.** `change_n` = het aantal echte veranderkeuzes (alles behalve "Niets", Anders meegeteld). Vloer 3, meerderheid en voorsprong 2 gelden daarop; `none_needed` (meer dan de helft niets) en `split_none` blijven zoals ze waren en worden vóór `clear` getoetst. Kaart, pagina twee en methodiek zeggen op welke noemer de richting rust en hoeveel mensen niets kozen, bijvoorbeeld "Volgens 4 van de 5 die om verandering vroegen; 3 kozen ‘Niets, dit zat hier goed’." en op pagina twee "... volgens 4 van de 5 die dit het laagst scoorden en om verandering vroegen: [opdracht]. 3 vinden dat hier niets hoeft."
4. **Geen "hierboven".** De goedgekeurde verdeeld-zin en de weging verwijzen nu naar "bij ‘Wat er moet gebeuren’"; de drempeltabel zegt "in de verdeling zelf". Blijven staan, met bewijs: verwijzingen binnen pagina twee (gehouden op één A4 door de meetregel), binnen hetzelfde meetgegevensblok en binnen dezelfde alinea.
5. **Omvangvakken.** "Minder dan 150", "150 tot 400", "400 tot 1.000", "1.000 of meer medewerkers", uit `frontend/lib/pricing.ts`; formulier, FAQ, JSON-LD en `llms.txt` volgen. Oude opgeslagen waarden ("Boven 1.000 medewerkers") blijven leesbaar.
6. **Besluitvelden.** "Wat precies" (startpunt en tweede punt), terugkoppeling en succescriterium op 240 tekens = `BESLUIT_TEKST_MAX`, gepind door `tests/test_besluit_limiet_pin.py`. Teller "n / 240" bij elk van die vier velden; boven de grens (alleen bij oude besluiten) een rode, voorgelezen melding. Opslaan van een te lang veld wordt geweigerd met "Wat precies is te lang voor het rapport (maximaal 240 tekens, nu 600).", nooit afgekapt.
7. **Opschoning.** Rijen in `suite_telemetry_events` en `case_proof_registry` zonder meting worden 24 maanden na aanmaken verwijderd (zelfde dagberekening en maand vooruitblik als leads). Per tabel één transactie; dry-run standaard; alleen in de periodieke run; tweede run doet niets; eigen regel per tabel en een samenvatting vóór de samenvatting van de metingen (die blijft de laatste regel). De triggers uit de bewaartermijnmigratie vuren alleen op insert en update en houden een delete niet tegen.

## Wat de reviews vonden

- **Taak 1:** een losgeraakt commentaarblok in `report_html.py`; het schema van de import had nog een eigen kopie van de regex; `_maand_nl` dupliceerde `maand_label`; `match` liet een maand met een regeleinde door (nu `fullmatch`, met test).
- **Taak 2:** geen bevindingen; wel het advies het contract "liever niet is `null`, niet `""`" in een test vast te leggen (gedaan in Taak 3).
- **Taak 3:** de hulptekst was niet gekoppeld aan de keuzelijst voor schermlezers. De spec-review wees erop dat de belofte in de hulptekst pas na Taak 4 waar was (volgorde in het plan; Taak 4 volgde direct).
- **Taak 4:** letterlijke streepjes in een test, een te smalle maandcontrole, een vage docstring ("bredere randen") en een ontbrekende eerlijke zin: met precies twee personen in een randmaand kan HR afleiden dat die twee meededen.
- **Taak 5:** de vertrekmaanden in de nieuwe scenario's liepen tot na de sluitdatum van de testmeting (nu verschoven); een omslachtige import in de test.
- **Taak 6:** rijen zonder keuze konden een richting over de vloer tillen (twee echte stemmen werden "duidelijk"); `change_n` betekende in de code iets anders dan de kaart zou gaan zeggen ("die om verandering vroegen"). Opgelost met één grootheid (echte veranderkeuzes), een luide fout bij een kapotte telling en een waarschuwing bij rijen zonder keuze.
- **Taak 7:** zonder deze taak zou de kaart "De grootste groep kiest ..." tonen terwijl niets de grootste groep kon zijn, en "Volgens 4 van de 8" naast een tabel met drie niets-stemmen. Daarna: de "tweede" optie in de grootste-groep-kaart kon de niets-optie zijn (oude fout, nu weg); bij rijen zonder keuze telden de getallen in drie staten niet op; pagina twee verloor de uitleg wie de noemer is; de methodiekzin beloofde meer dan de code deed en las als een algoritme (herschreven in gewone taal).
- **Taak 8:** een vergeten "erboven" in de drempeltabel.
- **Taak 9:** geen bevindingen.
- **Taak 10:** de teller kondigde elke toetsaanslag aan via de schermlezer; de pintest hing af van de werkmap; drie verouderde verwijzingen naar 600; de zwaarste echte besluitpagina (oud besluit met 600 tekens en de inkortmelding) werd niet meer gemeten (nu `zz_besluitmax_oud_*`).
- **Taak 11:** `FOR UPDATE` vergrendelde alle rijen zonder meting (nu alleen de verlopen); onjuiste docstrings over het vergrendelen; geen tests voor de race (rij krijgt tussendoor een meting) en voor het werken in blokken.
- **Eindreview:** alle zeven punten ✅, geen kritieke of belangrijke bevindingen. De marge op `.helper-text` gold ook voor de Anders-hint bij Loep Behoud (nu alleen onder de vertrekmaandvraag, `690618ff`).

## Afwijkingen van het plan, en waarom

- **Taak 2:** de context-helper `_survey_exit_month_options` in plaats van inline code, zodat hij los te testen is.
- **Taak 3:** de bestaande klasse `.helper-text` in plaats van een nieuwe `.field-help`.
- **Taak 6:** de vloer van 3 geldt ook vóór de grootste groep (het plan noemde hem alleen bij duidelijk, maar de eigen test van het plan verwachtte dat); `change_n` is het aantal echte keuzes in plaats van "alle antwoorden min niets" (zie de review). Defecte rijen tellen alleen nog in `n` (te weinig, meer dan de helft niets).
- **Taak 7:** de vorm met "die om verandering vroegen" verschijnt zodra de echte keuzes afwijken van alle antwoorden (niet alleen bij niets-stemmen); pagina twee noemt de groep voluit ("die dit het laagst scoorden en om verandering vroegen"); de methodiekzin is herschreven; de waarschuwing over rijen zonder keuze staat in de aggregatie (één keer per onderwerp).
- **Taak 10:** de teller kondigt alleen de overschrijding aan, niet elke telling; nieuwe besluitpagina-renders met oude lange besluiten.
- **Taak 11:** eerst lezen zonder slot, daarna alleen de verlopen rijen vergrendelen.

## Browsercheck

**Vertrek-vragenlijst** tegen een lokale backend op een wegwerp-SQLite (tijdelijke map, niet in de repo), via een tijdelijke launch-configuratie die daarna is teruggezet. Zeven respondenten aangemaakt.

| Controle | Uitkomst |
|---|---|
| Vraag staat er, niet verplicht, 33 opties ("Kies een maand", "Zeg ik liever niet", april 2027 tot oktober 2024), hulptekst gekoppeld | OK |
| Maand kiezen (september 2026) en versturen | POST 200, `exit_month = 2026-09` |
| Overslaan en versturen | POST 200, `exit_month` leeg |
| "Zeg ik liever niet" | payload `exit_month: null`, POST 200, kolom leeg |
| Refresh na kiezen | keuze "Zeg ik liever niet" komt terug |
| Respondent met HR-maand (2026-05) | vraag staat er niet; maand blijft 2026-05 |
| Loep Behoud | vraag staat er niet |
| 375 px | `scrollWidth` 375, keuzelijst 41 tot 334 px, niets voorbij de rand |

Console: één 404 die niet in de lijst met verzoeken staat (vermoedelijk favicon). Screenshots tekenen in het previewpaneel maar worden niet als bestand opgeslagen, zoals in de fixronde; de controles zijn daarom via de DOM gedaan.

**Site** (dev-server van de worktree):
- `/producten`: de drie treden en "1.000 of meer medewerkers" (2 keer), geen "Boven 1.000"; JSON-LD Organization, BreadcrumbList, OfferCatalog en FAQPage, alles parst, het FAQ-antwoord noemt het nieuwe label. OK.
- `/kennismaking`: "Kies de omvang", "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers", "1.000 of meer medewerkers", "Anders / nog niet zeker". Niet verstuurd. OK.
- 375 px op `/producten` met alle vragen open: `scrollWidth` 375, geen horizontale scroll. Wel lopen enkele binnenelementen in de scansecties tot 383 px door en worden ze afgesneden door hun container; die secties zijn in deze ronde niet aangeraakt en het label zelf eindigt op 359 px. Niet vergeleken met main.
- Console: alleen de bekende CSP-melding over het debugscript van Vercel Analytics in dev.

## Wat Lars moet beslissen

1. **Een duidelijke richting naast een grote niets-groep.** Op een onderwerp dat niet laag scoort, geeft de nieuwe regel een duidelijke richting ook als "niets" de grootste losse keuze is (voorbeeld: niets 5 van 13, route 4 van 13). De kaart toont de opdracht als kop en noemt de niets-stemmen apart. Dit volgt uit het besluit; scenario 11 laat het op schaal zien (27 van de 47 die om verandering vroegen, 15 kozen niets). Accepteren, of een extra voorwaarde (bijvoorbeeld: de richting moet ook groter zijn dan de niets-groep)?
2. **Venster van de keuzelijst:** een half jaar vooruit en twee jaar terug (`backend/exit_month.py`). Keuze van de controller.
3. **"Zeg ik liever niet" en overslaan** worden hetzelfde opgeslagen (leeg). Onderscheiden kan alleen met een extra kolom (migratie). Nodig?
4. **HR-maand gaat voor.** Bij een respondent wiens maand HR al aanleverde, staat de vraag niet in de vragenlijst en wordt de HR-maand nooit overschreven.
5. **Twee personen in een randmaand.** De regel voorkomt dat één persoon herkenbaar wordt, niet dat HR afleidt dat die twee meededen. Accepteren, of kwartalen?
6. **Privacyverklaring.** De opschoning van gebruiksgegevens zonder meting staat nergens in de juridische teksten (er staat niets dat ermee in strijd is). Een zin toevoegen in de privacyverklaring, sectie 5?
7. **Uitleg van "tot".** De omvanglabels zijn zonder overlap, maar de site zegt nergens dat "150 tot 400" betekent "tot en zonder 400". Nu niet toegevoegd (prijsregel is aan Lars).
8. **Methodiekzin over niets** (Behoud en Vertrek): "Wie ‘Niets, dit zit hier goed’ koos, telt niet mee bij de vraag welke richting de grootste is; hoeveel mensen dat kozen, staat er apart bij. Kiest meer dan de helft niets, dan staat er dat hier volgens de meesten niets hoeft. Scoort het onderwerp onder de 5,0 en is de groep die niets koos even groot als de grootste richting, groter, of maar één kleiner, dan heet het onderwerp verdeeld." Akkoord met deze tekst?
9. **Lange regel op pagina twee** bij de grootste groep met niets-stemmen: "Wat er moet gebeuren volgens de grootste groep van wie dit het laagst scoorde en om verandering vroeg, 12 van de 27 (44%), zonder meerderheid: ..." Correct maar zwaar; inkorten kan door de noemer naar een slotzin te verplaatsen.
10. **Buiten de repo:** `Loep_Docs/one-pager.html` zegt nog "Boven 1.000".

## Bewust niet gedaan

- Loep Start, plan 3c en de overige leesronde-kandidaten (buiten deze ronde, spec "Niet in deze ronde").
- `backend/report.py:6066` (oude ReportLab-renderer voor team, leadership en cultuurbeeld) zegt nog "De volgorde hierboven"; buiten de scope van punt 4.
- Bewijs van toestemming voor gepubliceerde cases buiten de database (spec: hoeft niet gebouwd).

## Na merge

1. **Geen migratie nodig.**
2. **Railway-redeploy van beide services:** "Loep main" (vragenlijst, submit, rapport) en "Loep - monthly cleanup" (die bouwt een eigen image; zonder redeploy draait de run van 1 november de oude code, wat nu geen kwaad doet: de tabellen bestaan sinds april 2026, dus niets is twee jaar oud).
3. **Vercel** deployt automatisch: omvanglabel, `llms.txt`, de teller bij de besluitvelden en de voorbeeldrapporten.
4. **Browsercheck op de testklant** (`docs/testklant.md`): een besluit met een veld van meer dan 240 tekens laat de rode teller zien en weigert op te slaan; korter maken en opslaan werkt.

## Opruimwerk

- Meetuitvoer en hulpbestanden staan in `C:\Users\larsh\AppData\Local\Temp\loep-vervolgronde\` (niet in de repo): `nulmeting.txt`, `eind.txt`, `staten-voor.txt`, `staten-na.txt`, suite-logs, `seed_browsercheck.py`, `browsercheck.db`, `launch.json.bak`.
- De tijdelijke nulmeting-worktree is verwijderd. De launch-configuratie is teruggezet.
- Docker Desktop hing twee keer op `%LOCALAPPDATA%\Docker\run\dockerInference`. De map is hernoemd (`run.old-20261007-192836` en `run.old-20261007-195602`), niet verwijderd; die mappen kunnen weg.
- `frontend/node_modules` in de worktree raakte tijdens de ronde één keer leeg (bekend verschijnsel) en is opnieuw geïnstalleerd; `package-lock.json` is teruggezet.
