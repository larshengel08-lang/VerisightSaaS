# Polijstronde na leesronde 4 en de klantreis: uitvoeringsverslag

Spec: `docs/superpowers/specs/2026-10-09-polijstronde.md` (inclusief par. 7 Homepage, toegevoegd 10-10). Plan: `docs/superpowers/plans/2026-10-09-polijstronde.md`. Bron van de 39 codes: `docs/rapport-koude-leesronde-2026-10-08.md`, sectie 5.

Uitgevoerd van 9 tot en met 11 oktober in worktree `.worktrees/polijstronde`, branch `feature/polijstronde`, vanaf main `6b5d3b7f`. Werkwijze: per taak één implementer, daarna een spec-review en een codekwaliteitsreview, herreview tot beide akkoord waren. **Alle taken (0 tot en met 14, plus 13b) zijn gebouwd en door de reviews gekomen. 33 van de 39 leesronde-codes zijn dicht, 5 deels (met een beslispunt voor Lars), 1 bewust niet (S1, spec). Niet gemerged, niet gepusht.**

## Baselines

| | Voor (main `6b5d3b7f`, 9-10) | Na (HEAD, 11-10) |
|---|---|---|
| Backend `pytest tests` | 24 failed / 1972 passed / 11 skipped | 24 failed / 2309 passed / 11 skipped |
| Backend-faalset | `polijstronde-backend-baseline-fails.txt` | identiek per testnaam (`GEEN_REGRESSIES`) |
| Python 3.11-guard | groen | groen (70 passed, venv 3.11.9) |
| Frontend `tsc --noEmit` | 131 | 131 |
| Frontend `vitest run` | 49 failed / 1937 tests (faalset 50 namen: 47 stabiel + 3 wisselvallig) | 47 failed / 1948 tests |
| Vitest-faalset | `polijstronde-vitest-baseline-fails.txt` | niets nieuw aan de `>`-kant; aan de `<`-kant alleen de drie bekende wisselvallige namen (twee in `action-center-route-follow-ups/route.test.ts`, één in `inzichten/page.test.ts`) |
| Frontend-build | | geslaagd (`Compiled successfully`), dummy's alleen in de shell |

Tussentijdse backend-gate van de hoofdsessie op HEAD `2d946b70` (na Taak 11 en 12): ook `GEEN_REGRESSIES`, 24 failed / 2299 passed / 11 skipped.

## Leesronde-codes

Bewijs is geciteerd uit de nieuwe voorbeeldrapporten (PDF uit het productie-image, commit `2580083e`), tenzij anders vermeld. "Behoud" = `voorbeeldrapport_retentiescan`, "Vertrek" = `voorbeeldrapport_loep`, "Start" = `voorbeeldrapport_onboarding`.

| Code | Status | Reden | Bewijs |
|---|---|---|---|
| R7 | dicht | Eén zin bij de tweede telling. | Behoud p.13: "Dit is een andere telling dan de 16 bij de toelichting op pagina 6: daar gaat het om wie op dit onderwerp duidelijk laag antwoordde, hier om wie dit als eigen laagste onderwerp had." |
| R9 | dicht | Gelijke scores samen genoemd, met namen na een dubbele punt (afwijking: namen erbij, zelfde vorm als de laagste-zin). | Behoud p.5: "Drie onderwerpen vormen een relatief sterke basis (alle drie 7.1/10): Rolhelderheid en eigenaarschap, Cultuur en psychologische veiligheid, Beloning en eerlijkheid." |
| R10 | dicht | Zin die zegt welk geval hier geldt; "ook" alleen als een onderwerp onder 6,5 scoort. | Behoud p.9: "Hier staat de werkbeleving zelf ook onder druk: geen van de drie scoort relatief sterk." Start p.6: "Hier scoort de werkbeleving op alle drie relatief sterk." |
| R11 | dicht | Gewone woorden in kickers, tabel, voettekst en intro's (ook Vertrek en Start). Grep op `UWES`, `GROEPSOUTPUT`, `structureert`, `Enkelvoudige`, `duiding`, `BEHOUDSCONTEXT` in de drie voorbeelden: 0. | Behoud p.3: kicker "BLIJVEN EN VERTREKKEN"; "Eén vraag; lees hem als indicatie."; p.12: "te weinig antwoorden om iets over te zeggen", "Het MT beslist; de rangorde helpt alleen ordenen."; voettekst "VERTROUWELIJK · LOEP · ALLEEN GROEPSCIJFERS". |
| R12 | dicht | Eén bandset op p.03, uit `_factor_label` (Taak 3). | Behoud p.3: "6.2/10 aandachtspunt", "3.9/10 kwetsbaar punt", "5.7/10 aandachtspunt", "6.0/10 aandachtspunt". Zie beslispunt 7 (bevlogenheid). |
| R13 | dicht | Startpunt één keer genoemd. | Behoud p.2: "... Het gesprek begint bij het kwetsbare onderwerp." |
| R14 | deels | Behoud en Start: dicht. Vertrek: de kolomkop blijft kaal "Score" (frictiescore omgedraaid, uitleg in de intro). | Behoud p.10: "De kolom met het laagste onderwerp noemt per afdeling het laagst scorende onderwerp; bij kleine afdelingen (5 tot 9 antwoorden) staat daar alleen een label ... De kolom Werkbeeld is het werkbeeld van pagina 2, per afdeling."; kolomkop "WERKBEELD"; Start: "CHECKPOINTSCORE". Zie beslispunten 3 en 12. |
| R16 | dicht | Methodiekkaarten breken niet meer (kaartrij verhuist heel, Taak 8). | Behoud p.19 en Vertrek p.17 beginnen met de kaart "Open toelichtingen", heel. |
| R17 | dicht | "Verdeeld beeld" alleen als de middengroep echt dun is. | Behoud p.4: bevlogenheid "KWETSBAAR 15 / AANDACHT 14 / STERK 10" zonder label; p.7 werkdruk (16 / 10 / 13) houdt het label. |
| R18 | dicht | Geen percentage op p.02, noemer in de zin. | Behoud p.2: "Wat er moet gebeuren volgens 11 van de 15 die dit het laagst scoorden en de vraag beantwoordden: Voer een concreter gesprek over ontwikkeling." |
| R19 | dicht | Niets-rij (ook bij 0) en een regel met de niet gekozen opties, in de korte vorm (terugvaloptie uit Taak 11). | Behoud p.13: "Niets, dit zit hier goed 0 van de 15 (0%)" en "Niet gekozen: 4 andere richtingen." |
| R20 | dicht | "Behoudssignaal" heet "Werkbeeld", met uitleg; de werkbeleving is benoemd. | Behoud p.2: "WERKBEELD 6.2/10 Aandachtspunt / De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven." p.3: "(de drie basisbehoeften autonomie, competentie en verbondenheid)". |
| R21 | dicht | Leidraad en besluitpagina zeggen dat de afdelingsafspraak niet mee geparkeerd wordt. | Behoud p.2: "Vul de afdelingsafspraak en de terugkoppeling altijd in." p.15: "Maak deze afspraak ook als jullie het tweede punt parkeren." |
| R22 | dicht | Niets onderaan de kaart; de vertaalvraag noemt de richtingen bij naam. | Behoud p.14: "De meest gekozen richtingen op de kaart bij ‘Wat er moet gebeuren’ zijn ‘Meer ruimte om te herstellen en werk goed af te ronden’ (3); ‘Planning en bezetting ...’ en ‘Duidelijkere keuzes ...’ (elk 2). ‘Niets, dit zit hier goed’, gekozen door 2 van de 10 (20%), is geen richting en telt hier niet mee." |
| R23 | dicht | Kop, uitleg en kaarten op één pagina. Neveneffect: in 01, 09 en 14 staat het werkvragenblok daardoor alleen op een pagina (beslispunt 13). | Behoud p.13 begint met "WAT ER MOET GEBEUREN" en de uitleg, gevolgd door beide kaarten. Vertrek p.11 idem. |
| R24 | dicht | Strook 660 breed en tellingrij even breed (Taak 6). Niet uit tekst te citeren; de meetregel `zijmarge` geeft in alle 34 renders niets. | Taak 6, `46a408a8`; eindmeting. |
| R25 | deels | Op de antwoordschaal gehouden (de drempel werkt op die schaal; omrekenen zou een schijnprecisie geven), maar uitgelegd. | Behoud p.6: "Duidelijk laag: op de antwoordschaal van de vragenlijst (1 is ‘helemaal niet’, 5 is ‘helemaal wel’) gemiddeld 2,5 of lager, ... De andere scores per onderwerp in dit rapport zijn omgerekend naar 1 tot 10." Beslispunt 2. |
| R26 | dicht | Groepen van gelijke scores, alleen binnen de marge van de eerste rij. | Behoud p.12: "Drie onderwerpen staan gelijk op 7.1: Beloning en eerlijkheid, Cultuur en psychologische veiligheid, Rolhelderheid en eigenaarschap." |
| R27 | deels | "Geen voorspelling van wie vertrekt" toegevoegd; de reden voor het niet uitsplitsen niet, want het rapport meet die niet (de drempel per afdeling geldt voor de themakolom, niet voor de intenties). | Behoud p.2: "... en ook niet wie er vertrekt: dit rapport splitst ze niet per afdeling uit." Beslispunt 1. |
| V3 | dicht | Benoemd waar redenen en scores uit elkaar lopen, met het onderwerp bij naam. | Vertrek p.3: "Beloning werd 18 keer genoemd als reden die meespeelde, maar het onderwerp beloning en voorwaarden scoort 7.0 (relatief sterk): hier lopen redenen en scores uit elkaar." |
| V7 | dicht | Zoals R7. | Vertrek p.11: "Dit is een andere telling dan de 14 bij de toelichting op pagina 5: ..." |
| V10 | dicht | Voorbehoud hangt nu aan het aantal veranderkeuzes (onder 10). | Vertrek p.11, kaart tweede punt: "Volgens 4 van de 5 die om verandering vroegen; 3 kozen ‘Niets, dit zat hier goed’." en "Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie (drempels: pagina 16)." Beslispunt 6. |
| V11 | dicht | Eén anker in de woorden van p.02. | Vertrek p.12, beide werkvragen: "En in de uitstroomperiode (tussen oktober 2025 en maart 2026)?" Beslispunt 11 (tien andere werkvragen). |
| V12 | dicht | Regel met de verdeling in de appendix, alleen als het blok echte keuzes toont. | Vertrek p.15: "Werkdruk en balans (7 antwoorden): ‘Meer ruimte om te herstellen en werk goed af te ronden’ 3, ‘Duidelijkere keuzes over wat voorrang heeft en wat kan wachten’ 2, ..."; verwijzing p.11 "(pagina 15)". |
| V13 | deels | Eigen grenzen gehouden en uitgelegd; label "Gemengd frictiebeeld". Gelijktrekken verandert wat de frictiescore betekent. | Vertrek p.2: "Deze grenzen horen bij de frictiescore en zijn niet dezelfde als de grenzen 5,0 en 6,5 bij de onderwerpen." Beslispunt 4. |
| V14 | dicht | Afdelingsdeel weg als er geen afdelingen in het rapport staan. | Vertrek p.13: "Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met de vertrekredenen doet. Deel geen open antwoorden." |
| V15 | dicht | Gelijkgetrokken. | Vertrek p.1: "LOEP VERTREK" (geen "BASELINE"). |
| V16 | dicht | Zin in de intro-alinea. | Vertrek p.3: "Bij Loep Vertrek is dit het oordeel van mensen die vertrokken, niet van wie er nu werkt." |
| S1 | bewust niet | Spec par. 1: na de eerste klant. | Start p.2: opener ongewijzigd ("Is de informatiedichtheid of het werktempo hoog voor een eerste werkperiode?"). |
| S2 | deels | p.02 zegt wat het rapport doet. Restanten: de besluitpagina zegt "Loep Start meet nog geen richtingvraag" (`report_html.py:4436`), en de site noemt nog "een volgende versie". | Start p.2: "Deze scan bevat geen verdiepingsvragen en geen richtingvraag. Het rapport laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet gebeuren, vraag je in het gesprek met hen." Beslispunt 8. |
| S3 | dicht | Eigen zin op p.02 (`_p02_afdelingen_zin`). | Start p.2: "In twee afdelingen is Informatiedichtheid en werktempo wel een kwetsbaar punt (pagina 7)." |
| S4 | dicht | | Start p.4 en p.13: "Een volgende meting krijgt een eigen rapport." |
| S5 | dicht | Eén bron voor beide legenda's (`_band_legenda()`). | Start p.3 en p.4: "■ kwetsbaar punt ■ aandachtspunt ■ relatief sterk". |
| S6 | dicht | Termijn in dagen. | Start p.10: "Richtlijn: rond het volgende checkpoint, ongeveer 30 dagen na dit gesprek." Beslispunt 5. |
| S7 | dicht | Campagnenaam en legacy-naam opgeruimd. | Start p.1 en p.10: "Loep Start Q1 2026". |
| S8 | dicht | Stelling zonder punt, score bij de stelling. | Start p.9: "Bespreek eerst de stelling ‘De hoeveelheid informatie en werk in mijn eerste periode is haalbaar’ (4.6/10), binnen informatiedichtheid en werktempo." |
| S9 | dicht | Geen cijfers van kleine afdelingen in de conclusie. | Start p.7: "De twee laagste afdelingen liggen dicht bij elkaar (Sales en Operations)." Beslispunt 12 (de tabel toont ze wel). |
| S10 | dicht | Zelfde terugkoppelingsregel als Behoud, met grens 10. | Start p.10: "Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden." |
| S11 | dicht | Open antwoorden in de leidraad, met de vraag van Vertrek. | Start p.2: "Het waarom staat in de open antwoorden (pagina 8); vraag: wat komt terug in meer dan één antwoord?" |

Telling: 33 dicht, 5 deels (R14, R25, R27, V13, S2), 1 bewust niet (S1).

## "Behoudssignaal" werd "Werkbeeld"

Alleen weergave: `risk_score`, `signal_score`, `_signal_health`, `signal_label` en `toDisplaySignalScore` blijven. Loep Start houdt "Checkpointscore", Loep Vertrek "Frictiescore".

| Plek | Voor (main) | Na |
|---|---|---|
| p.02, tegel (Behoud) | "Behoudssignaal" | "Werkbeeld", met eronder "De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven." |
| p.02 zonder factorprofiel | "{band} (behoudssignaal 5.5/10)." | "Het werkbeeld is 5.5/10: een aandachtspunt." (`_werkbeeld_zin`) |
| p.02, leidraad 5-12 min | "de blijfintentie en het behoudssignaal" | "de blijfintentie en het werkbeeld" |
| p.03, intro | "Het behoudssignaal is een samenvattende groepsscore ..." | "Het werkbeeld is een samenvattende groepsscore ... Het zegt hoe mensen hun werk ervaren, niet of ze blijven" |
| p.03, rijtitel | "Behoudssignaal" | "Werkbeeld" |
| p.10, kolomkop en intro (Behoud) | "Score" | "Werkbeeld"; "De kolom Werkbeeld is het werkbeeld van pagina 2, per afdeling." |
| Gespreksopener leiderschap | "Gaat het behoudssignaal over vertrouwen in leiding ...?" | zonder "behoudssignaal" |
| Vertrek-intro | "behoudssignaal" | "beeld van het werk" |
| Action Center (`frontend/lib/action-center-live.ts:60`) | "Welk behoudssignaal verdient nu ..." | "Welk signaal over behoud verdient nu ..." |
| Homepage hero | (navy mock-kaart, geen "Behoudssignaal") | alt-tekst noemt "het werkbeeld" |
| Voorbeeldrapporten (`docs/examples`, `frontend/public/examples`) | "Behoudssignaal" | "Werkbeeld" |

Grep-controle (Taak 14 stap 4): `grep -rn -i "behoudssignaal" backend/report_html.py docs/examples/*.html frontend/public/examples/*.html frontend/lib/action-center-live.ts` geeft niets. `llms.txt` en het dashboard bevatten het woord niet (ook op main niet).

**Bewust ongewijzigd** (niet zichtbaar voor de klant):
- `backend/products/team/definition.py:36` (TeamScan, inactief product).
- `frontend/lib/contact-funnel.ts:384-385`, `frontend/lib/contact-qualification.ts:87,96`: operatorteksten ("vroeg behoudssignaal").
- `frontend/lib/types.ts:240`: commentaar.
- `frontend/components/marketing/home-page-content.tsx:64` (`suiteSignalMetrics`, alleen gebruikt door de niet-gerenderde `SuitePreviewSection`) en `frontend/components/marketing/hero-motion-dashboard.tsx:129` (component zonder importers): dode code met de oude naam. Beslispunt 10.

## Richtingregel (spec par. 3)

Een richting heet pas duidelijk of "de grootste groep" als hij meer stemmen heeft dan "Niets, dit zit hier goed"; anders heet het onderwerp verdeeld. De regel staat in `direction_state` na `split_none`; de kaart en p.02 noemen dan beide tellingen, de methodiekzin is bijgewerkt (Behoud p.19: "Een richting heet pas duidelijk, of de grootste groep, als hij meer stemmen heeft dan ‘Niets, dit zit hier goed’; anders heet het onderwerp verdeeld."). Kleine n (1/1/1) valt terug op de bestaande staat; de werkvraag kreeg een eigen variant zodat hij de kaart niet tegenspreekt.

**Welke kaarten wisselden van staat: geen.** `diff staten-voor.txt staten-na.txt` is leeg, over alle 22 scenario's, de 8 `zz_besluitmax`-renders en de drie voorbeelden (65 regels). Taak 1 gaf hetzelfde. Waarom geen enkele wissel, uit de `meta.json` per scenario (alle onderwerpen waar niets minstens zo groot is als de grootste richting en minstens 3 antwoorden):

| Scenario | Onderwerp | Niets / grootste richting / veranderkeuzes | Agendakaart? | Staat (voor = na) |
|---|---|---|---|---|
| 02 een lage factor | Beloning (tweede punt) | 2 / 2 / 2 | ja | verdeeld (onder de vloer van 3); alleen de kaarttekst en de werkvraag veranderden |
| 04 alles hoog | zes onderwerpen | bijv. 4 / 3 / 4 (leiderschap), 5 / 3 / 3 (cultuur) | startpunt en tweede punt | `none_needed` (meer dan de helft niets), gaat vóór |
| 13 veel niets nodig | Groeiperspectief (startpunt) | 14 / 14 / 22 | ja | `split_none`, gaat vóór |
| 10, 13, 14, 16b, 19, 22 | onderwerpen buiten de agenda | bijv. 4 / 2 / 4 (19 leiderschap) | nee | geen kaart |

De nieuwe regel is dus een vangnet voor een geval dat de stresstest niet op een agendakaart laat vallen; hij is unit-getest (`tests/` Taak 1, 16 lockstep-aanpassingen plus 2 in de werkvragen-tests).

## Wat er is gebouwd, per taak

| Taak | Onderwerp | Commits |
|---|---|---|
| 0 | Spec, leesronde, plan, baselines; homepagepunten (par. 7) | `3e15d35d`, `b899d316`, `c4f4837f` |
| 1 | Richting pas duidelijk als hij groter is dan de niets-groep | `27525110`, `ee9398e5` |
| 2 | p.02-richtingregel zonder percentage, noemer in een slotzin (R18) | `46f26e8a`, `eb79221e` |
| 3 | "Behoudssignaal" wordt "Werkbeeld"; een bandset op p.03 (R20, R12) | `b03f753b`, `78c4eca1`, `29331c4f` |
| 4 | Kernzin, leidraad en afdelingsregel (R13, R21, R27, S3, S11) | `38f2d6e5`, `93d37081`, `2cbacf87`, `d1e20eab` |
| 5 | De richtingkaart (R7, V7, R19, R22, V10, R23) | `6f1c0a24`, `5c7a06ee`, `f735fde5`, `c7656087` |
| 6 | Rangorde, onderwerppagina's en jargon (R9, R10, R11, R17, R24, R25, R26) | `46a408a8`, `a14214e8`, `8aade53e` |
| 7 | Afdelingen (R14, S9) | `9048f0ec`, `0c322334` |
| 8 | Methodiek en besluitpagina (R16, V14, S10, S6, S4) | `3430c853` |
| 9 | Loep Vertrek (V3, V11, V12, V13, V15, V16) | `5b491690`, `959b652f`, `9a92c852`, `382afbe9`, `20847c2b` |
| 10 | Loep Start (S2, S5, S7, S8) | `b350dacf`, `338ad914` |
| 11 | Tussenmeting in het productie-image, paginering terug | `2f11f9e2`, `b3deaaf6`, `2d946b70` |
| 12 | Respondentflow (spec par. 4) | `34dd54b9`, `651dd3d0`, `36669148` |
| 13 | Privacyverklaring sectie 5 | `8d78966d`, `af70e7dd` |
| 13b | Homepage (spec par. 7) | `451f1bc6`, `cfae4e82` |
| 14 | Voorbeeldrapporten, eindmeting, browsercheck, verslag | `2580083e` en de verslagcommit |

## Wat de reviews vonden

- **Taak 1:** spec akkoord met vijf notities. Kwaliteit: de werkvraag sprak de kaart tegen (nieuwe variant `none_at_least_top`), een vacue testcase, verouderde testnamen, en bij kleine n (1/1/1) een te stellige staat (nu terugval).
- **Taak 2:** spec akkoord. Kwaliteit: ontbrekende test voor `none_needed` bij 10 of meer; samengevoegde takken (byte-gelijk bewezen over 43.200 aggregaten); label als constante; sterkere plurality-tests.
- **Taak 3:** planfout gevonden en gecorrigeerd: de eerst gekozen labels "onder druk / vraagt aandacht" botsten met R12; nu de woorden van `_factor_label`. Kwaliteit: `_factor_level` als enige bron voor labelvergelijkingen, `zone_index` publiek, docstrings, `.sc-n`. 21 renders byte-gelijk op één CSS-regel na.
- **Taak 4:** de patroonvraag stond niet altijd precies één keer in Start (nu ook in rij 4); copy zonder "daar" en dubbel "ook"; gedeelde tak voor "geen kwetsbaar onderwerp". De afdelingsregel noemde wie en wanneer dubbel (`2cbacf87`).
- **Taak 5:** `break-after` lekte naar het werkvragenblok, waardoor een paginaverwijzing kon verschuiven (CSS-scope, `f735fde5`); puntkomma tussen telgroepen; helpers en één bron voor "toelichting staat er" (31 renders byte-gelijk).
- **Taak 6:** spec vond twee resterende verwijzingen naar "vertrekcontext" (`a14214e8`). Kwaliteit: een gelijk-groep kon meer dan 0,3 overspannen als de richtingwinnaar voorop stond (reproductie via `rank_factors`); opsommingen met labels die zelf "en" bevatten waren onleesbaar (nu de R9-vorm); "ook" in de R10-zin alleen onder 6,5; R25 "scores per onderwerp" (eNPS is geen 1-10).
- **Taak 7:** paginalink, een langere introtekst kostte in 05/06/17 een dunne extra pagina (korter gemaakt), één scoreopmaak, grenstests.
- **Taak 8:** geen blokkerende bevindingen. Opgemerkt: het dashboard toont de terugkoppelingsregel altijd met het afdelingsdeel; dode `review_when`-teksten.
- **Taak 9:** spec akkoord. Kwaliteit: de verwijzing naar het bijlageblok verscheen ook als dat blok geen keuzes toonde (nu gedeelde `_richting_overig`); het anker op p.12 week af van p.02 (nu gelijk); tests renderden naar `docs/stresstest` (nu naar een tijdelijke map).
- **Taak 10:** legenda uit één helper, beletselteken in de stelling, directe legendatest.
- **Taak 11:** spec: "Vul de terugkoppeling dan toch in." las als "op het vervolgmoment" (nu "altijd", `b3deaaf6`). Kwaliteit: CSS was volgordeafhankelijk, R10-zin gesplitst, `_intro(extra)`, klassen voor de uitsplitsing (`2d946b70`).
- **Taak 12:** /producten noemde "± 10/8/5 minuten" (Vertrek 10 tegen 8 in de vragenlijst; nu uit `SURVEY_MINUTES`); de startpagina beloofde "90 dagen opnieuw openen" terwijl de sluitdatum wordt afgedwongen (nu "Invullen kan tot en met {datum}."); technische 422-teksten voor de respondent (nu gewone taal, reden gelogd); "Organisatiefactoren" als stapkop (nu "Je werksituatie"). Daarna: clientwaarden in de logreden begrensd en ge-escaped (log-injectie, `36669148`).
- **Taak 13:** afwijking van de plantekst goedgekeurd: `case_proof_registry` is geen gebruiksdata, en "uiterlijk" omdat de maandelijkse run vooruitkijkt.
- **Taak 13b:** de knip had een lege bovenmarge en kon stil terugvallen op PNG; nu knip vanaf 40 pt en een harde fout als een tekstblok door de knip loopt of WebP ontbreekt. Het label "Voorbeeld" dekte de paginakop af (nu rechtsboven, `aria-hidden` omdat de alt-tekst ermee begint). Een ontbrekende invultijd gooit nu een fout in plaats van een verkeerd bereik. Kaart 2 kreeg de goedgekeurde tekst.

## Renders in het productie-image

`scripts/render_in_image.py` in `loep-backend:test` (eigen `Dockerfile`, WeasyPrint 70.0), vast recept, na het opnieuw genereren van `docs/stresstest/`, `zz_besluitmax_*` en de voorbeelden.

| Meting | Bestanden | Met bevindingen | Warnings | Streepjes |
|---|---|---|---|---|
| Nulmeting (main, 9-10) | 34 | 3 | 0 | 0 |
| Na Taak 7 | 34 | 13 | 0 | 0 |
| Taak 11 start | 34 | 13 | 0 | 0 |
| Taak 11 eind | 34 | 4 | 0 | 0 |
| **Eindmeting (HEAD, 11-10)** | **34** | **4** | **0** | **0** |

Eindmeting, de vier bestanden met bevindingen (alleen `paginavulling`, verder niets: geen `p02-op-een-a4`, `besluit-op-een-a4`, `paginaverwijzing` of `zijmarge`):
- 01: p.7 36% (nulmeting 36%) en p.13 werkvragenblok 39%.
- 09: p.7 26% (nulmeting 26%) en p.13 werkvragenblok 39%.
- 14: p.13 werkvragenblok 32%.
- 19: p.7 36% (nulmeting 36%).

De drie bekende pagina's zijn niet slechter geworden. Het werkvragenblok op een eigen pagina in 01/09/14 is de bekende uitzondering uit Taak 11 (zelfde percentages als `t11-eind.txt`); oorzaak R23 (beslispunt 13). De eindmeting is per bestand gelijk aan de Taak 11-eindmeting.

**Paginatallen** (nulmeting → eind): 01 17→18, 02 17→18, 03 17→18, 04 16→16, 05 18→19, 06 18→19, 07 8→8, 08 13→14, 09 17→18, 10 19→19, 11 19→20, 12 17→18, 13 17→18, 14 17→18, 15 17→18, 16 18→19, 16b 18→19, 17 18→19, 18 13→14, 19 17→17, 20 13→13, 21 13→14, 22 13→14, `zz_besluitmax_*` 18/13/16 → 19/14/17, voorbeelden Vertrek 16→17, Behoud 18→19, Start 13→13. De +1 komt door R23: het werkvragenblok krijgt een eigen pagina (44 tot 59% gevuld) omdat kop, uitleg en kaarten samen moeten blijven.

**Terugvalopties uit Taak 11:** terugval R19 (korte vorm "Niet gekozen: 3 andere richtingen.") is globaal ingezet. Terugval 3 (R21 korter) gemeten: spaart geen regel, wel de kortere tekst gehouden. Terugval 2 (R22-weegregel weg) niet toegepast: er staat geen weegregel in 01/09/14, dus geen effect. Krapste p.02: scenario 22 eindigt op 784 van 785 pt.

**Voorbeeldrapporten:** HTML opnieuw gegenereerd in beide mappen (byte-gelijk tussen `docs/examples` en `frontend/public/examples`), PDF's uit de eindmeting onder de bestaande namen (`voorbeeldrapport_loep.pdf`, `_retentiescan.pdf`, `_onboarding.pdf`; de site linkt de eerste twee): 17, 19 en 13 pagina's.

**Hero-afbeelding (stap 1b):** `scripts/render_hero_p02.py` opnieuw gedraaid op het nieuwe Behoud-voorbeeld: `hero_p02.webp` is **byte-gelijk** aan `frontend/public/images/voorbeeld-loep-behoud-p02.webp` (124.824 bytes, 1489x1037). Niet vervangen.

## Browsercheck

**Respondentflow**, lokale backend (uvicorn, poort 8010) op een wegwerp-SQLite in `$T`, via een tijdelijke launch-configuratie (daarna byte-gelijk teruggezet). Vier campagnes met `public_survey_token`: Vertrek, Behoud en Start met sluitdatum, en Behoud zonder sluitdatum.

| Controle | Uitkomst |
|---|---|
| Startpagina, titel | "Loep Vertrek \| Loep", "Loep Behoud \| Loep", "Loep Start \| Loep": zonder streepje. OK |
| Knop | "Begin met invullen" (alle vier). OK |
| Aanhef | Vertrek: "De organisatie waar je werkt of werkte, heeft Loep gevraagd dit onderzoek uit te voeren."; Behoud en Start: "Je organisatie heeft Loep gevraagd ...". OK |
| Invultijd | Vertrek "ongeveer 8 minuten", Behoud 6, Start 3; in de vragenlijst zelf dezelfde 8 (Vertrek). OK |
| Anonimiseringszin | "Herkende namen, e-mailadressen, telefoonnummers en postcodes haalt Loep automatisch uit open antwoorden voordat ze in een rapport komen. Noem liever zelf geen namen." OK |
| Termijnzin | "Invullen kan tot en met 10 november 2026." bij een sluitdatum; ontbreekt bij de campagne zonder sluitdatum. OK |
| Vertrek-vragenlijst, stapkoppen | "Stap 1: Over je vertrek", "Stap 2: Werkbeleving", "Stap 3: Je werksituatie", "Stap 4: Korte verduidelijking", "Stap 5: Wat had geholpen?", "Stap 6: Afsluiting". OK |
| Keuzelijsten | "Kies een antwoord", "3 tot 6 maanden", "1 tot 2 jaar"; vertrekmaand met "Kies een maand" en "Zeg ik liever niet". Geen streepjes in de hele HTML (0 keer U+2013/U+2014), geen kapot teken (U+FFFD). OK |
| Behoud-vragenlijst | "Stap 1: Werkbeleving", "Stap 2: Je werksituatie", "Stap 3: Korte verduidelijking", "Stap 4: Wat zou helpen?", "Stap 5: Werkplezier en blijven" met de koppen "Blijven" en "Aanbevelen"; 0 streepjes, geen kapot teken. OK |
| Versturen | Vertrek (desktop) en Behoud (375 px): POST `/survey/submit` 200, beide met verdieping en richtingvraag opgeslagen (`direction_response` met `exit_..._direction` en `retention_..._direction`). OK |
| Bedankpagina | "Bedankt \| Loep", "Bedankt voor je deelname!". OK |
| Al ingevuld (persoonlijke link opnieuw) | "Al ingevuld. Je hebt deze vragenlijst al eerder ingevuld." OK |
| Al ingevuld (open link, zelfde browser) | POST `/start` 409, pagina "Al ingevuld \| Loep": "Je hebt deze vragenlijst al ingevuld". OK |
| 375 px | `scrollWidth` 375 op de startpagina's (Vertrek, Behoud, Start), op alle zes stappen van de Vertrek-vragenlijst (verste element 351 px), alle vijf van Behoud, de bedankpagina en "al ingevuld". OK |
| Console | één 404 (GET `/`, bestaat niet op de backend) en de 409 van de dubbele start. Geen andere fouten. |

Kleine waarnemingen (niet gewijzigd, buiten de lijst van spec par. 4; zie beslispunt 14): de "al ingevuld"-pagina via de persoonlijke link heeft als titel "Bedankt | Loep"; die pagina en de bedankpagina zeggen ook tegen vertrekkers "Neem contact op met de HR-afdeling van je organisatie" en "Jouw input helpt de organisatie gerichter te verbeteren"; de stapbalk zegt "Verduidelijking", de kop "Korte verduidelijking"; de vragenlijst zegt "vertrouwelijk verwerkt" waar de startpagina "anoniem verwerkt" zegt.

**Homepage**, dev-server van de worktree op poort 3100 (tijdelijke launch-configuratie, teruggezet):

| Controle | Uitkomst |
|---|---|
| Hero-afbeelding (1440 breed) | laadt (`complete`, via next/image), 478 px breed, alt-tekst aanwezig, label "Voorbeeld" één keer op de figuur. OK |
| Oude teksten | "veruit het laagst", "Eerste managementvraag", "Waardering en erkenning", "Behoudssignaal": 0 op de pagina; "Gespreksopener" staat er. OK |
| Drie kaarten, desktop | elk 605,6 px hoog; de mini-visual begint in alle drie 357 px onder de kaartrand. OK |
| Kaart 1 | "in 3 tot 8 minuten". OK |
| 375 px | `scrollWidth` 375; kaarten onder elkaar (557, 582, 611 px, links 20, rechts 355); de afbeelding valt in de kolom (20 tot 355 px) zodra de inschuifanimatie klaar is. In het verborgen previewpaneel bleef de `Reveal`-wrapper op zijn beginstand staan (opacity 0, 40 px verschoven): het bekende rAF-verschijnsel van het paneel, geen productfout. |
| Console | alleen de bekende CSP-melding over het debugscript van Vercel Analytics in dev, en één `ERR_CONNECTION_REFUSED` (geen backend op de dev-server). |

## Homepage (spec par. 7)

- **Hero-afbeelding:** bron `docs/examples/voorbeeldrapport_retentiescan.html`, gerenderd met WeasyPrint in het productie-image en geknipt met PyMuPDF (`scripts/render_hero_p02.py`): pagina twee van y = 40 pt tot y = 454,6 pt van 841,9 (factor 0,54: net onder "Gebaseerd op het laagst scorende onderwerp.", vóór de regel "Wat er moet gebeuren ..."; het script stopt met een fout als een tekstblok door de knip loopt), schaal 2,5. Formaat 1489 x 1037 px, WebP kwaliteit 82, 124.824 bytes (PNG-tussenstap 167.812). Label "Voorbeeld" rechtsboven; alt-tekst "Voorbeeld van pagina twee uit een Loep Behoud-rapport: de kernzin, het werkbeeld en de cijfers over blijven en vertrekken." Werkbeeld met uitleg staat in beeld. In Taak 14 byte-gelijk opnieuw gemaakt.
- **Kaarthoogtes:** voor 433, 490 en 508 px; na 605,6, 605,6 en 605,6 px (desktop 1440, gemeten in Taak 14 op de eindstand; Taak 13b mat 604,8 vóór de reviewfix). Subgrid over twee rijen (tekst, mini-visual), zodat de mini-visuals op één lijn beginnen.
- **Woorden:** voor 43, 59 en 63; na 39, 39 en 37.
- **Minuten kaart 1:** "in 3 tot 8 minuten", berekend uit `SURVEY_MINUTES` in `frontend/lib/campaign-setup.ts` (onboarding 3, retention 6, exit 8; kleinste en grootste). Dezelfde waarden staan in de productdefinities (`survey_minutes` in `backend/products/*/definition.py`), die de startpagina en de vragenlijst voeden; een pariteitstest (Taak 12) houdt frontend en backend gelijk. Ontbreekt een scan, dan gooit de pagina een fout.
- **Kaart 2:** label "Gespreksopener"; de ranglijst met het waarom en "wat er volgens je mensen moet gebeuren" is gekoppeld aan Loep Vertrek en Loep Behoud, omdat Loep Start die niet heeft.

## Afwijkingen van het plan, en waarom

- **Taak 3:** labels "onder druk / vraagt aandacht" vervangen door de woorden van `_factor_label`, omdat ze botsten met R12 (één bandset in het hele rapport).
- **Taak 4:** S3 kreeg een eigen helper `_p02_afdelingen_zin` in plaats van een plek in `_p02_opening`, vanwege de responsstaart van de openingszin. `BESLUIT_AFDELING_SAMEN` wijkt af van de plantekst (geen dubbele wie/wanneer).
- **Taak 5:** het anker `sec-verdieping-{fk}` staat op het toelichtingsblok, niet op de onderwerpkop: de onderwerppagina mag breken, en anders wijst de verwijzing een pagina te vroeg.
- **Taak 6:** R9 met namen en "/10"; R26-groepen alleen binnen de marge van de eerste rij, lange ketens in meerdere zinnen (scenario 13: drie).
- **Taak 7:** de scorekolom bleef 8% breed. Verbreden naar 10 of 12% gaf in 03 en 06 een extra pagina van 21%. Opgelost met zachte afbreekstreepjes.
- **Taak 9:** V3 noemt het onderwerp bij naam; V11 haalt het anker uit `_uitstroom_bereik` (één privacygate).
- **Taak 11:** R10-zin in de rechterkolom, R19 in de korte vorm.
- **Taak 13:** zin over "technische gegevens over het gebruik van de beheeromgeving en interne aantekeningen van Loep", met "uiterlijk".
- **Taak 13b:** subgrid in plaats van flex (flex gaf gelijke kaarten maar ongelijke visuals); afbeelding vanaf 40 pt geknipt en 1037 px hoog in plaats van 1137.
- **Taak 14:** de homepage is opnieuw gemeten (niet alleen de respondentflow), omdat de laatste homepagecommit (`cfae4e82`) na de meting van Taak 13b kwam.

## Wat Lars moet beslissen

1. **R27, reden waarom blijf- en vertrekintentie niet per afdeling staan.** Nu: "dit rapport splitst ze niet per afdeling uit", zonder reden. Een eerlijke reden ("te weinig antwoorden per afdeling om één vraag te duiden") geldt niet voor Operations met 17 antwoorden; een uitsplitsing per afdeling is een productkeuze. *Advies:* zo laten tot na de eerste klant; vraagt de klant erom, dan uitsplitsen vanaf 10 antwoorden, net als de onderwerpscores.
2. **R25, de drempel voor "duidelijk laag" op de antwoordschaal 1 tot 5.** Gehouden en uitgelegd. Omrekenen naar tienden geeft getallen als "3,75 of lager" die niemand herkent. *Advies:* zo laten.
3. **Naam van de scorekolom bij Loep Vertrek (R14).** Nu kaal "Score"; de intro legt uit dat het de frictiescore is en dat hoger slechter is. *Advies:* kolomkop "Frictiescore", zoals Behoud en Start; één regel code.
4. **V13, eigen grenzen van de frictiescore (4,5 / 7,0).** Uitgelegd, niet gelijkgetrokken. *Advies:* zo laten; gelijktrekken verandert wat de score betekent en vraagt een eigen besluit over de schaal.
5. **S6, "ongeveer 30 dagen" bij Loep Start.** *Advies:* akkoord; past bij checkpoints op 30/60/90.
6. **V10, voorbehoud onder tien veranderkeuzes.** Het voorbehoud staat nu vaker (ook bij een duidelijke richting op bijvoorbeeld 4 van 5). *Advies:* akkoord; dat is precies het punt van de leesronde.
7. **Bevlogenheid volgt nu 5,0 / 6,5 (R12).** De eigen grenzen 7,5 / 6,0 / 4,5 zijn weg; vertrekintentie kreeg zonelabels ("weinig vertrekgedachten", "aandacht", "veel vertrekgedachten"). *Advies:* akkoord.
8. **Loep Start zegt nog "volgende versie" en "nog" (S2).** Op de site: `home-page-content.tsx:94` en `producten-content.tsx:95`; in het rapport: besluitpagina "Loep Start meet nog geen richtingvraag" (`report_html.py:4436`). Spec par. 6 laat de site buiten deze ronde. *Advies:* site en besluitpagina in dezelfde vorm als p.02 ("Deze scan bevat geen richtingvraag; het besluit volgt uit jullie gesprek ...") zodra Start weer verkocht wordt, of nu als kleine follow-up.
9. **Terugvalopties uit Taak 11.** R19 staat in de korte vorm ("Niet gekozen: 4 andere richtingen.") zonder namen. Daardoor staat er bij een kaart met alleen een niets-rij soms "Niet gekozen: 6 andere richtingen". *Advies:* akkoord; de namen kosten een regel en daarmee in drie scenario's een pagina.
10. **Dode code met de oude naam en andere dode teksten.** `suiteSignalMetrics` in `home-page-content.tsx:62-66` (alleen in de niet-gerenderde `SuitePreviewSection`), `hero-motion-dashboard.tsx` (geen importers), en de `review_when`-teksten in `report_html.py` die nooit renderen. *Advies:* één opruimcommit na de merge (verify-before-delete).
11. **V11, tien andere Vertrek-werkvragen eindigen nog op "een jaar geleden"** (`deepening.py` 660, 694, 716, 720, 728, 734, 738, 746, 750, 754). In het voorbeeld niet zichtbaar, maar bij een ander startpunt kunnen een startpunt en een tweede punt twee tijdsankers tonen. Goedgekeurde content, andere betekenis (verandering in de tijd tegenover de uitstroomperiode). *Advies:* gelijktrekken naar het uitstroomanker; het is de vorm die de leesronde vroeg.
12. **Score van kleine afdelingen in de tabel.** De themakolom toont bij 5 tot 9 antwoorden alleen een label, de scorekolom wel een cijfer (Behoud: Marketing 5/8 "6.3"; Start: Sales 7/9 "6.0", Operations 5/9 "6.2"), terwijl het navy blok die cijfers weglaat (S9). *Advies:* de scorekolom bij 5 tot 9 antwoorden ook als label tonen; dat maakt R14 en S9 sluitend.
13. **Werkvragenblok alleen op een pagina in 01, 09 en 14 (39 / 39 / 32%), tegenover R23.** Kop, uitleg en kaarten reizen samen; tekort 17, 33 en 170 pt. *Advies:* R23 houden (een kop zonder kaarten is erger dan een halfvolle pagina) en de uitzondering in de meetregel vastleggen.
14. **Kleine teksten in de respondentflow** (zie Browsercheck): titel "Bedankt" op de "al ingevuld"-pagina, "HR-afdeling van je organisatie" en "helpt de organisatie gerichter te verbeteren" tegen vertrekkers, "Verduidelijking" tegen "Korte verduidelijking", "vertrouwelijk" tegen "anoniem". *Advies:* in één kleine ronde gelijktrekken, voor de Vertrek-variant met de aanhef van de startpagina.
15. **Taak 1: nieuwe werkvraagvariant `none_at_least_top`** (CONCEPT, `deepening.py` ~827) en het weglaten van de wegingsregel in die staat. "Beide kan kloppen" (ook in de goedgekeurde `split_none`-variant) is taalkundig "Beide kunnen kloppen". Vertrek p.02 zegt "vinden dat hier niets hoeft" in de tegenwoordige tijd (bestaand patroon). *Advies:* variant akkoord, "Beide kunnen kloppen" in beide varianten.
16. **`BESLUIT_AFDELING_SAMEN`**: "Dit onderwerp is ook het tweede punt. Maak deze afspraak ook als jullie het tweede punt parkeren. Het rapport toont de toelichtingen alleen voor de hele organisatie." *Advies:* akkoord.
17. **R21, korte vorm in de leidraad:** "Vul de afdelingsafspraak en de terugkoppeling altijd in." ("dan toch" las als "op het vervolgmoment"). *Advies:* akkoord.
18. **S3 bij een vlak profiel.** Bij "Geen enkel onderwerp springt eruit" (scenario 09, 19) vuurt de afdelingszin niet, ook als een afdeling een kwetsbaar laagste onderwerp heeft. Geen tegenspraak, dus zo gelaten. *Advies:* akkoord; anders in de volgende leesronde meenemen.
19. **Dashboard-terugkoppeling.** Het dashboard toont altijd de volledige regel, met het afdelingsdeel, ook bij metingen zonder afdelingen. *Advies:* follow-up: `segment_departments` gebruiken, zoals het rapport.
20. **`anonymize_text` vangt alleen volledige namen** (twee woorden met een hoofdletter). Daarom zegt de startpagina "Herkende namen ..." en "Noem liever zelf geen namen." *Advies:* akkoord voor nu; uitbreiden (voornamen) is een eigen traject.
21. **Kop "Appendix"** is een Engels woord. *Advies:* "Bijlage".
22. **Positie van de R10-zin.** Hij staat onder de laatste kaart van de rechterkolom (Verbondenheid) en kan als commentaar op alleen die kaart lezen. *Advies:* zo laten (de plek spaart een regel en de zin noemt "de drie"); anders volle breedte onder de kaarten.

## Na merge

1. **Geen migratie.**
2. **Railway-redeploy van "Loep main":** rapport (`report_html.py`, `report_css.py`, `report_distribution.py`, `deepening.py`), vragenlijst en startpagina's (`templates/`), productdefinities (`survey_minutes`) en de submitmeldingen (`survey_messages.py`). "Loep - monthly cleanup" raakt deze ronde niet.
3. **Vercel** deployt automatisch: privacyverklaring sectie 5, homepage (hero-afbeelding, drie kaarten), /producten-invultijd, de Action Center-zin en de voorbeeldrapporten.
4. **Browsercheck op de testklant** volgens `docs/testklant.md`: rapportdownload van campagne A (Werkbeeld op p.02 met uitleg, richtingkaart met niets onderaan), en de vragenlijst van campagne B (startpagina met invultijd, termijnzin en "Begin met invullen").

## Opruimwerk

- Meetuitvoer en hulpbestanden in `C:\Users\larsh\AppData\Local\Temp\loep-polijst\` (niet in de repo): o.a. `nulmeting.txt`, `t7-na-render-full.txt`, `t11-start.txt`, `t11-eind.txt`, `eind.txt`, `staten-voor.txt`, `staten-na.txt`, `na-eind.txt`, `vitest-eind.txt`, suite- en buildlogs, de PDF's in `out/`, `txt-*.txt` (tekst van de voorbeeld-PDF's), `seed_browsercheck.py`, `tokens.txt`, `browsercheck.db`, `launch.json.orig` en `launch.json.eind-orig`, plus de hulpscripts van eerdere taken.
- De launch-configuratie in `C:\Users\larsh\Desktop\Business\.claude\launch.json` is na beide browserchecks byte-gelijk teruggezet.
- Docker hing deze ronde niet; geen nieuwe hernoemde mappen. Wel staan er nog oude in `%LOCALAPPDATA%\Docker\` (`run.broken`, `run.broken2`, `run.old-*`, `run.stale-*`, `run_stale_*`); die kunnen weg.
- `docs/stresstest/` is gitignored en bevat de eindmeting.
