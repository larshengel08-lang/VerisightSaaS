# Fixronde leesronde 24-9: uitvoeringsverslag

Plan: `docs/superpowers/plans/2026-09-24-fixronde-leesronde.md`. Amendement met de besluiten van Lars: `docs/superpowers/plans/2026-09-24-fixronde-amendement-lars.md` (aangeleverd door de parallelle CEO-sessie tijdens Taak 0, na de keuzes van Lars op 24-9). Afwijkingen van de rapportspec staan in `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md`, sectie "Afwijkingen bij de fixronde leesronde (24-9)".

Uitgevoerd op 24 en 25 september in worktree `.worktrees/fixronde-leesronde`, branch `feature/fixronde-leesronde`, vanaf main `37059706`. Werkwijze: per taak één implementer, daarna een spec-review en een codekwaliteitsreview, herreview tot beide akkoord waren. **Alle taken 0 tot en met 21 zijn gebouwd en door beide reviews gekomen. Niet gemerged, niet gepusht.** Taak 22 is voor Lars en de hoofdsessie na de merge.

Het amendement voegde drie taken toe die niet in het plan stonden: **17b** (leads, leerdossiers en de resttabellen in de opschoning), **20b** (twee juridische zinnen) en, uit de review van Taak 18, **20c** (een opgeschoonde meting is overal eerlijk, niet alleen op de campagnepagina).

## Baselines

| | Voor (main `37059706`) | Na (HEAD) |
|---|---|---|
| Backend `pytest tests` | 25 failed / 1551 passed / 11 skipped | 25 failed / 1811 passed / 11 skipped |
| Backend-faalset | `docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt` | identiek per testnaam (`GEEN_REGRESSIES`) |
| Python 3.11-guard | groen | groen (66 passed; venv 3.11.9, gelijk aan Railway) |
| Frontend `tsc --noEmit` | 131 | 131 |
| Frontend `vitest run` | 47 failed / 1801 tests | 47 failed / 1891 tests, faalset identiek per testnaam (`docs/superpowers/plans/fixronde-leesronde-vitest-baseline-fails.txt`) |
| Nieuwe tests | | +260 backend, +90 frontend |
| Frontend-build | | geslaagd (72/72 pagina's), met dummy's alleen in de shell |

De build had naast `RESEND_API_KEY` ook dummy's voor `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` nodig, omdat de worktree geen `frontend/.env.local` heeft (het prerenderen van `/login` en `/reset-password` maakt een Supabase-client aan). Niets daarvan staat in een bestand.

## PDF-validatie in het productie-image

`scripts/render_in_image.py` in `loep-backend:test` (eigen `Dockerfile`, WeasyPrint 70.0). `docs/stresstest/` is vóór elke meting opnieuw gegenereerd. De nulmeting is gedaan op een aparte worktree op de stand van main (met de oude meetregel), de eindmeting op HEAD (met de nieuwe).

| | Nulmeting | Eindmeting |
|---|---|---|
| Bestanden | 24 (21 scenario's, 3 voorbeelden) | 29 (21 scenario's, 5 `zz_besluitmax`, 3 voorbeelden) |
| Met bevindingen | 3 | 3 |
| WeasyPrint-waarschuwingen | 0 | 0 |
| Em-dashes en en-dashes | 0 | 0 |
| `p02-op-een-a4` | geen | geen |
| `besluit-op-een-a4` | geen | geen, ook niet met een maximaal besluit |
| `paginaverwijzing` | geen (oude regel) | geen (nieuwe regel: elk getoond nummer is de ankerpagina) |
| `zijmarge` | geen | geen |

De drie bevindingen zijn dezelfde als vóór deze ronde, met dezelfde percentages: `paginavulling` op pagina 7 van 01 (36%), 09 (26%) en 19 (36%).

**Paginatallen:** gelijk aan de nulmeting, op één na: **scenario 13 van 18 naar 17 pagina's**. Door hefboom E (Taak 10) is het agendaslot circa 30pt korter en past het onderaan pagina 12 in plaats van bovenaan een eigen pagina 13. De vijf `zz_besluitmax`-renders zijn nieuw (06: 18, samen_06: 18, 08: 13, vx: 16, samen_vx: 16).

**Ruimte (de krappe gevallen):**

| Waar | Krapst | Waarde |
|---|---|---|
| Pagina twee (tekst tot onderrand inhoud) | 08 | 27,2pt (nulmeting 41,2); vb_loep 35,0; 09 37,1; vb_retentie 45,5 |
| Agendaslot | 10 en 15 | circa 3 tot 4pt; het slot is ondeelbaar, dus elke groei zet het op een eigen vel (de `paginavulling`-regel vangt dat dan) |
| Besluitpagina | `zz_besluitmax_max_vx` (Loep Vertrek, aangewezen afdeling, alle velden op de limiet) | 25,1pt |

**Hefbomen (allemaal CSS, geen copy geschrapt):**
- Taak 7, pagina twee: A (duidingsalinea 9,5px), B (leidraadregels dichter), C (waarom-blok compacter), en na akkoord van de controller D1 (kleinere letter bij een lange of gelijkstaande hoofdreden van vertrek, klasse `sc-reden-lang`) en D2 (meetgegevens dichter, alleen witruimte). Elke `#p02`-selector staat één keer in de CSS (guardtest).
- Taak 10, agendaslot: hefboom E (compactere marges en celpadding in werkvragenblok en navy vlak).
- Taak 11, besluitpagina: `BESLUIT_TEKST_MAX` 300 naar 240 (plan, stap 3) plus hefboom F (alleen ruimte tussen blokken; de schrijflijnen van het lege vel zijn gelijk gebleven).

## Wat er is gebouwd, per taak

| Taak | Onderwerp | Commits |
|---|---|---|
| 0 | Worktree, baselines, nulmeting, plan en amendement in git | `2082745c` |
| 1 | Meetregel `paginaverwijzing` via link-annotaties; eindmarker besluitpagina | `05131873`, `cfd6a833` |
| 2 | Leidraad en besluitpagina naar het werkvragenblok; slot van 14 minuten | `73336cb7`, `1a9eb5e6` |
| 3 | Blijf- en vertrekintentie geduid op pagina twee | `98b62463`, `fe65cc18` |
| 4 | Frictiescore uitgelegd op pagina twee | `652aa9bd` |
| 5 | Namenregel Loep Vertrek; amendement A1 (tijdsanker) en A2 (hint) | `ae3c7f0c`, `cf462533`, `ca73c3d4` |
| 6 | Uitstroomperiode in de meetgegevens | `57d020dc`, `d700b12c` |
| 7 | Pagina twee op één A4 (hefbomen A tot D) | `061849ee`, `4dcdc844`, `3fcc280d` |
| 8 | Brugzin bij het tweede punt; afdelingsafspraak op de besluitpagina | `458e2121`, `b15e0798`, `c527835d`, `44005185` |
| 9 | Besluitpagina en dashboard: parkeerregel, slotlabel, terugkoppeling, besluitvraag | `4f0f0da6`, `f419ca09`, `ede2d2cf` |
| 10 | "Niets, dit zit hier goed" telt niet als richting | `4537a0d9`, `69d12ee5`, `fe881cc1`, `2bd2ea14` |
| 11 | Besluitpagina met een maximaal besluit gemeten | `d5f39176`, `068ec3fe`, `410d481c` |
| 12 | Prijsgrens "Minder dan 150 medewerkers" | `904eeb60` |
| 13 | Omvangvakken contactformulier uit de staffel | `b06144b5`, `8c0fbe0a`, `bd2248f1` |
| 14 | Veelgestelde vragen zichtbaar op `/producten` | `eb0d0cea`, `4a608d65` |
| 15 | Naam en staffelgrens in `Loep_Docs` (buiten de repo, geen commit) | archief `Loep_Docs\_archief-2026-09-24\` |
| 16 | Migratie bewaartermijn plus triggers | `cca21b7f`, `df332f2e`, `35608828`, `de021fff`, `8412ace9`, `0833bba9`, `d0426592` |
| 17 | Opschoning van metingen (`backend/data_retention.py`) | `62eb7dad`, `a7722f9c`, `3c05ceb4`, `86a5ce97` (kolomcache) |
| 17b | Leads, leerdossiers, telemetrie en bewijsregister in de opschoning | `9a525daf`, `e229f418` |
| 18 | Rapport na de opschoning: 410 met een leesbare reden | `fffe0b35`, `36ad54c8` |
| 19 | Dry-run lokaal en alleen-lezen tegen productie | geen code (zie Deel C) |
| 20 | Campagnepagina toont een opgeschoonde meting eerlijk | `8e98399d`, `d3dfc7b4` |
| 20b | Juridische zinnen leads en back-ups | `eae0f59e` |
| 20c | Opgeschoonde meting overal eerlijk (dashboard, rapporten, beheer, open antwoorden, API) | `57ff8c13`, `f84d6c79`, `69139882`, `17045aa5`, `843b91c6`, `b77e7ff8`, `0a99ab68` |
| 21 | Voorbeeldrapporten, eindmeting, leesronde light, browsercheck, spec, verslag | `e7fca88e` en de verslagcommit |

## Leesronde-codes

Bewijs: de koude leesronde light van 25-9 (verse lezer zonder context, beide voorbeeldrapporten als PDF, elke paginaverwijzing nagelopen).

| Code | Wat | Status | Bewijs |
|---|---|---|---|
| R1 | Blijf- en vertrekintentie op p.02 zonder duiding | **dicht** | Behoud p.2: "Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet bij welke afdeling het speelt of waarom ..." plus leidraadverwijzing in rij 2 |
| V1, V5 | Namen van vertrekkers | **dicht** | Vertrek p.2 (leidraadvoet), p.9 (open antwoorden), p.11 (werkvragen) |
| V8 | Wanneer vertrokken | **dicht** | Vertrek p.2: "de maand van vertrek (niet vastgelegd; ...)"; met vijf of meer maanden staat de periode er |
| R2, V6 | Verwijzing naar de werkvragen een pagina te vroeg | **dicht** | alle verwijzingen op p.2 en de besluitpagina kloppen (Behoud 13/14, Vertrek 11/12); de meetregel meet het nu |
| V2 | Frictiescore onuitgelegd | **dicht** | Vertrek p.2 |
| R3 | Slot: wat je overslaat en parkeert | **dicht** | leidraad rij 5 |
| R4 | Tweede punt zonder eigenaar en datum | **deels** | parkeerregel (gebouwd zoals besloten, geen eigen velden); de lezer noemt de eigenaar "in het vrije veld" |
| R5 | Afdelingsafspraak | **deels** | het blok staat er; de lezer mist of het meegeparkeerd wordt als het tweede punt geparkeerd wordt |
| R6 (eerste helft), V9 | "Niets" als richting | **deels** | de weging zegt het expliciet; maar de staat "Geen eenduidige richting" zelf kan door de niets-stemmen ontstaan (zie "Wat Lars moet beslissen", punt 1) |
| R6 (tweede helft) | Grootste richting gelijk aan grootste toelichting | **bewust niet** | vraagt een koppeling die niet gemeten wordt |
| R8, V4, R15 | Terugkoppeling, succes per punt, besluittermijn | **dicht** | besluitpagina en dashboard gelijk |

**Nieuwe punten uit de leesronde light** (geen blokkerende):
- Hinderlijk: Vertrek p.11, "Geen eenduidige richting" terwijl zonder de niets-optie 4 van de 5 dezelfde richting kozen, en een optie met 1 stem heet "meest gekozen" (zie beslispunt 1).
- Hinderlijk: Loep Behoud heeft bij de open antwoorden geen regel als "Raad niet wie wat schreef" (bij huidige medewerkers is dat risico groter dan bij vertrekkers).
- Hinderlijk: de methodiekpagina breekt midden in een zin af naar de volgende pagina (Behoud p.17-18, Vertrek p.15-16), juist in "Wat dit rapport niet doet" en "Wie dit mag zien" (R16 uit de vorige leesronde, bewust niet in deze ronde).
- Hinderlijk: de leidraad noemt voor 31-45 min niet de volgorde van terugkoppeling, afdelingsafspraak en "Waaraan zien we"; dat zijn zes tot acht velden in veertien minuten.
- Hinderlijk: Vertrek p.3, beloning is net zo vaak meespelende reden als leiderschap, maar staat onderaan de ranglijst zonder uitleg (V3, bewust niet in deze ronde).
- Cosmetisch: "Enkelvoudige richtingsvraag" (blijfintentie) naast "Richtingvraag"; "5.7/10 zichtbaar" onuitgelegd; frictiedrempels alleen op p.2; meetingnaam "Q1 2026" suggereert een vertrekperiode; eNPS "+0"; Vertrek-besluitpagina noemt afdelingen die het rapport niet toont; omslachtige gelijkstandzin bij drie keer 7.1; werkbeleving in tegenwoordige tijd bij vertrekkers.

## Wat de reviews vonden

Elke taak kreeg een spec-review en een codekwaliteitsreview; bij Deel C draaiden de reviewers ook in een wegwerp-Postgres met het echte schema (nooit productie). Wat de reviews vonden en wat daarna gebouwd werd, per taak:

- **Taak 1:** een pagina met een gedeeltelijk ontbrekende link gaf vals OK; nu een bevinding als er meer gevulde verwijzingen dan interne links zijn. Ontdubbeling ook op bestemming.
- **Taak 2:** rij 5 beloofde een tweede punt ook zonder tweede punt; "neem de vragen eronder" terwijl er vaak één vraag onder staat; twee asserties die nooit konden falen.
- **Taak 3:** drie onware zinnen: "Deze cijfers ... niet per afdeling" (het behoudssignaal staat wél per afdeling), "daar zie je waar het wringt" bij een relatief sterk startpunt, en geen "mogelijk startpunt" onder 30% respons.
- **Taak 4:** zonder factorprofiel verwees de zin naar onderwerpen die er niet staan (in de bouw al opgelost).
- **Taak 5:** pagina twee van scenario 08 liep sinds Taak 4 over (opgelost in Taak 7); de A1-formulering "deze mensen" verwijst in drie vragen naar het verkeerde meervoud (beslispunt 3).
- **Taak 6:** de docstring beloofde privacybescherming die de grens van vijf niet geeft (nu eerlijk, keuze bij Lars); verwijzing naar een lege meetperiode.
- **Taak 7:** de hefbomen overschreven elkaar niet maar de oude regels waren dood en een test pinde de dode waarden; 10px voor de duidingsalinea past niet (0,3pt tekort op 08).
- **Taak 8:** de besluitpagina gaf een afdelingsopdracht bij een relatief sterk onderwerp, terwijl pagina twee bewust neutraal bleef; een vacuüme assertie.
- **Taak 9:** het dashboard toonde voor elke scan de terugkoppelhint van Loep Behoud; de parkeerregel verscheen zonder tweede punt; een helper zat in een client-component; hints zaten in het label (toegankelijkheid).
- **Taak 10:** de weging uit de plantekst zette het agendaslot in vier renders op een eigen vel; Anders stond met een telling op de kaart maar werd niet genoemd; de weging stond op 8,5px; bijvangst: de stap-labels liepen door een specificiteitsfout tegen de tekst aan ("HERKENNEN8 van de 16").
- **Taak 11:** de besluitpagina liep over bij elke aangewezen afdeling; het meetscript faalde niet luid als zijn slechtste geval ongemerkt verdween; vier puntjes na een punt.
- **Taak 12, 13, 14:** een door de implementer toegevoegde grenshint op het formulier publiceerde een prijsregel die Lars niet besliste (verwijderd, beslispunt 6); verder alleen kleine punten.
- **Taak 16:** de trigger uit de plantekst zou elke gewone klantwijziging van de organisatie blokkeren (PL/pgSQL rekent `and` niet kort); daarna vonden de reviews dat een klant de sluitdatum kon verschuiven, heropenen, stopzetten zonder sluitmoment, terugdateren (een meting uit 2001 zou bij de volgende run gewist worden) en na de opschoning alsnog besluiten en andere rijen kon schrijven. Alles dicht in de database; 67 gedragsgevallen in `migrations/checks/2026_09_24_data_retention_gedrag.sql`. In de frontend meldde "archiveren" vals succes als RLS de wijziging stil tegenhield.
- **Taak 17:** een meting die na de inventaris werd heropend werd toch gewist (nu hercontrole met `FOR UPDATE`); zeven Action Center-tabellen met onder meer e-mailadressen vielen buiten de opschoning; een onbekend organisatie-id gaf stil succes; foutmeldingen konden persoonsgegevens bevatten; een maandelijkse run kon tot een maand na "uiterlijk twee jaar" wissen (nu één maand vooruit, beslispunt 8).
- **Taak 17b:** een recente beslissing in een oud dossier telde niet als contact; een ontbrekende tijdstempelkolom kromp "laatste contact" stil in; een lead werd gewist terwijl een gekoppeld dossier recent was.
- **Taak 18 en 20:** een opschoning tussen controle en generatie gaf een 500; een tikfout in de kolomnaam zou elke opgeschoonde meting weer normaal laten lijken (nu alleen genegeerd als de melding precies `data_purged_at` noemt). De review van Taak 18 vond het plangat dat Taak 20c werd: `/reports` zou een opgeschoonde meting tonen als "Gesloten met 0 ingevuld. Minimaal 10 nodig voor een rapport", precies wat C.1 verbiedt.

## Afwijkingen van het plan, en waarom

- **Amendement A1/A2 en A4** (besluiten Lars) vervingen de plantekst waar het plan "ongewijzigd, beslispunt" zei; zie het amendement. Maandelijkse in plaats van dagelijkse cron; leads en dossiers wél in de opschoning; twee juridische zinnen.
- **Taak 2:** "neem wat eronder staat" in plaats van "neem de vragen eronder"; de parkeerzin alleen met een tweede punt.
- **Taak 3:** de duidingszin noemt "Blijf- en vertrekintentie" en niet "Deze cijfers"; "waar het wringt" en "mogelijk startpunt" afhankelijk van de data; rij 2 noemt beide intenties.
- **Taak 4:** zonder factorprofiel eindigt de frictiezin zonder verwijzing naar onderwerpen.
- **Taak 5:** de guard `TERUGBLIK_VORMEN` accepteert het nieuwe tijdsanker in plaats van het oude.
- **Taak 6:** ongeldige maanden geven één waarschuwing per meting in plaats van per rij.
- **Taak 7:** hefboom D1 en D2 (buiten de plantekst, puur CSS, controllerbesluit), en het samenvoegen van de hefbomen in de bestaande `#p02`-regels omdat regels die later in de CSS staan anders de hefbomen overschreven.
- **Taak 8:** de brugzin zonder "organisatiebreed" (anders een regel extra op pagina twee); de besluitpagina vergelijkt met het gedrukte tweede punt en noemt de samenval alleen bij een zwaar onderwerp; de toelichtingenhint alleen als het rapport toelichtingen toont; `_brugzin` zegt onder 30% respons "mogelijk startpunt" (doorgeschoven uit de review van Taak 3).
- **Taak 9:** het dashboard krijgt het scantype, zodat de terugkoppelhint en de richtlijn voor het vervolgmoment per scan gelijk zijn aan de PDF.
- **Taak 10:** kortere weging (tellingen in plaats van routeteksten), Anders erbij, hefboom E.
- **Taak 11:** echte veldlimieten uit `DECISION_LIMITS`, een zelfgebouwd Vertrek-scenario met aangewezen afdeling, 240 plus hefboom F.
- **Taak 13:** een grenshint op het formulier gebouwd en weer weggehaald (prijsregel is aan Lars).
- **Taak 16:** geneste `if` in de trigger; bescherming van de sluitklok en een schrijfslot na de opschoning (beide niet in de plantekst, beide uit de reviews).
- **Taak 17:** `action_center_route_actions` expliciet gewist; `--campagne` en `--organisatie` samen geweigerd; extra statussen die de maandrun rood kleuren; vooruitblik van één maand.
- **Taak 21:** opgesplitst: renders en build door een implementer, gates, leesronde light, browsercheck en verslag door de controller. De screenshots uit stap 7 zijn wel gemaakt (in het browserpaneel), maar niet als bestand opgeslagen: het preview-hulpmiddel slaat geen afbeeldingen op en tekende de mobiele weergave niet (leeg vel, ook al bij Taak 14 gezien). De vijf controles zijn daarom via de DOM gedaan; zie "Browsercheck".

## Deel C: opschoning

**Zoals gebouwd.** `python -m backend.data_retention`, standaard dry-run (op Postgres een `READ ONLY`-transactie), `--apply` expliciet, `--campagne <uuid>` (mag vaker) of `--organisatie <uuid>` voor een verzoek. Per meting, lead of dossier één transactie met hercontrole en vergrendeling; een fout rolt alleen die eenheid terug en geeft exitcode 1. Uitvoer: alleen id's, datums en aantallen.

| Tabel | Na de termijn |
|---|---|
| `survey_responses`, `respondents` | verwijderd |
| `campaigns` | bewaard, `data_purged_at` gezet |
| `campaign_delivery_records` | vrije tekst en configuratie leeg; `invited_count`, datums en fase blijven |
| `campaign_delivery_checkpoints` | notities leeg |
| `campaign_decisions` | eigenaar, vrije tekst en `recorded_by` leeg; onderwerpen en datums blijven |
| `campaign_action_audit_events`, Action Center-tabellen per meting (incl. mail-events met e-mailadres, agenda-links, schemawijzigingen, adoptie- en uitvoeringsevents, reviewritme, governance), `suite_telemetry_events`, `case_proof_registry` | rijen van die meting verwijderd |
| `contact_requests` | verwijderd twee jaar na het laatste contact (vijf tijdstempels, plus gekoppelde dossiers); verwijzingen eerst leeg |
| `pilot_learning_dossiers`, `_checkpoints` | verwijderd twee jaar na het laatste contact (inclusief beslissingen op de checkpoints) |
| `organizations`, leden, uitnodigingen, profielen, secrets | niet (horen bij het account) |

- **Termijn:** 24 maanden na de sluitdag (Nederlandse tijd), of `organizations.retention_months`. Door de maandelijkse run met `VOORUITBLIK_MAANDEN = 1` wordt tot een maand vóór het einde van de termijn opgeschoond, nooit erna.
- **Rood kleuren** (exitcode 1): fout, onbekende id, gestopt zonder sluitdatum, opnieuw gesloten na opschoning (nieuwe data), een lead of dossier zonder enige datum, een tabel die een tijdstempelkolom mist.
- **Na de opschoning:** alle rapportroutes, `/stats` en `/respondents` geven 410 met "De gegevens van deze meting zijn op [datum] verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig." Dashboard, `/reports`, `/beheer`, open antwoorden en routebeheer tonen "Gegevens verwijderd op [datum]". Een besluit vastleggen wordt geweigerd.
- **In de database** (nog niet gedraaid): klanten kunnen `retention_months` en `data_purged_at` niet zetten, de sluitklok niet verschuiven of terugdateren (de database zet het sluitmoment), niet heropenen, niet stopzetten zonder sluitmoment, en na de opschoning niets meer schrijven in de tabellen van die meting.
- **Buiten de database** (niet in de opschoning): back-ups van Supabase (zin in de verwerkersovereenkomst, Taak 20b), mails bij Resend, meldingen in Sentry.
- **Lokale dry-run** (lege SQLite): dry-run exit 0 met LET OP-regel over de migratie; `--apply` exit 2 ("GESTOPT: ... migratie"); ongeldige uuid exit 2.
- **Productie-dry-run** (25-9, door de controller, alleen-lezen, zonder `--apply`; eerst gecontroleerd dat de module geen `init_db` of DDL aanroept): exit 0, LET OP (migratie niet gedraaid, dus 24 maanden voor iedereen). Metingen: 0 verlopen, 0 opgeschoond, 4 binnen de termijn, 8 open, 0 gestopt zonder sluitdatum, 0 al opgeschoond, 0 heropend, 0 opnieuw gesloten, 0 geweigerd, 0 onbekend, 0 fouten. Leads: 0 verlopen, 30 binnen de termijn, 0 zonder datum, 0 fouten. Dossiers: 0.
- **Periodiek:** Railway-cronservice uit dezelfde repo en hetzelfde `Dockerfile`, met dezelfde `DATABASE_URL` als de webservice. Startcommando `python -m backend.data_retention --apply`, schema `0 3 1 * *` (de 1e van de maand, 03:00 UTC). Elke run eindigt met twee samenvattingsregels; een exitcode ongelijk aan 0 kleurt de run rood. Aanzetten is aan Lars (Taak 22).

**Voor plan 3c:** bij het sluiten van een meting een momentopname van de geaggregeerde cijfers bewaren (geen persoonsgegevens), zodat een vergelijking na de opschoning nog kan.

## Browsercheck

Dev-server van de worktree op poort 3104 (tijdelijke launch-configuratie, na afloop weggehaald), desktop en 375 px:

1. `/producten`: de sectie "Veelgestelde vragen" staat na de tarieven; acht vragen, elke vraag klapt open en toont het antwoord (visueel gecontroleerd); de drie herschreven antwoorden staan erin; "Minder dan 150 medewerkers" staat erin, "Tot 150" niet. **OK**
2. `/producten`: JSON-LD bevat Organization, BreadcrumbList, OfferCatalog en FAQPage; FAQPage heeft acht vragen, gelijk aan de zichtbare vragen; elke `JSON.parse` slaagt. **OK**
3. `/`: geen FAQPage meer (alleen Organization en WebPage). **OK**
4. `/kennismaking`: "Omvang organisatie" biedt "Kies de omvang", "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers", "Boven 1.000 medewerkers", "Anders / nog niet zeker". Niet verstuurd. **OK**
5. 375 px: `scrollWidth` 375 op `/producten` (met alle vragen open, geen element voorbij 375) en op `/kennismaking`. Console: alleen de bekende CSP-melding over het debugscript van Vercel Analytics in dev, los van deze ronde. **OK**

Screenshots: niet opgeslagen (zie "Afwijkingen", Taak 21).

## Wat Lars moet beslissen

De punten 1 tot en met 3, 6 en 10 raken klantzichtbare tekst of een belofte; de rest is kleiner.

1. **"Geen eenduidige richting" door de niets-stemmen.** In de verdeeld-staat telt "Niets, dit zit hier goed" mee bij het bepalen óf er een eenduidige richting is. In het Vertrek-voorbeeld kozen 4 van de 5 die iets wilden dezelfde richting, en toch staat er "Geen eenduidige richting"; de weging eronder noemt dan een optie met 1 stem "meest gekozen" (de vertaalvraag komt al bij twee routes met elke telling). Voorstel: de staat bepalen op de inhoudelijke stemmen en de niets-optie apart melden. Dat verandert een staffel en is daarom niet in deze ronde gedaan.
2. **"Op de kaart hierboven" na een paginabreuk.** De weging en de goedgekeurde verdeeld-zin zeggen "hierboven"; bij een grote richtingkaart kan het agendaslot op het volgende vel staan. Laten, of "bij 'Wat er moet gebeuren'"?
3. **A1-formulering "deze mensen".** In `cud_conflict` ("Twee collega's komen er nu samen niet uit ... En in de periode waarin deze mensen vertrokken?"), `cud_crossteam` en `cud_safety` leest "deze mensen" als de collega's of teams in de vraag. Voorstel reviewer: "En in de periode waar deze meting over gaat?". Gebouwd zoals besloten. (Ook doorgegeven aan de CEO-sessie op 24-9.)
4. **Uitstroomperiode en herleidbaarheid.** De vroegste en de laatste maand kunnen elk van één persoon zijn; HR kent de maanden en de audit van 13-7 noemt `exit_month` een quasi-identificerende kolom. Accepteren, pas een periode tonen als beide randmaanden minstens twee personen hebben, of per kwartaal? Daarnaast: "vertrokken" is verleden tijd, terwijl `exit_month` bij een lopende meting een geplande maand kan zijn.
5. **Leesbaarheid op papier.** De duidingsalinea op pagina twee staat op 9,5px (de afspraak van juli is 10px voor zulke regels; 10px kost een regel op scenario 08). De hints op de besluitpagina (parkeerregel, afdeling, terugkoppeling) staan op 8,5px cursief; vergroten kost ruimte (25pt marge in het slechtste geval). In het dashboard staan die lange hints in hoofdletters (de labelstijl); een eigen hintstijl is een ontwerpkeuze.
6. **Prijsgrenzen 400 en 1.000.** "150 tot 400" en "400 tot 1.000" bevatten allebei 400; "400 tot 1.000" en "Boven 1.000" laten 1.000 dubbel lezen. Een organisatie van precies 400 past in twee omvangvakken. Voorstel: de labels in `frontend/lib/pricing.ts` ondubbelzinnig maken (het formulier volgt dan vanzelf).
7. **`BESLUIT_TEKST_MAX` naar 240.** Het rapport toont het begin van elk lang besluitveld (met melding); het dashboard waarschuwt niet dat de PDF maar 240 van de 600 tekens toont. Hint bij het veld, of een lagere limiet in het dashboard?
8. **Opschoning, vooruitblik.** De maandelijkse run schoont tot een maand vóór het einde van de termijn op, ook bij een schriftelijk afgesproken langere termijn. Past bij "uiterlijk"; alternatief is een dagelijkse run zonder vooruitblik.
9. **Opschoning, restpunten.** (a) Goedgekeurde publieke cases in `case_proof_registry` worden met de meting gewist; bewaar het bewijs van toestemming buiten de database als een case gepubliceerd wordt. (b) Telemetrie- en bewijsrijen zonder `campaign_id` (ook na het verwijderen van een meting, `on delete set null`) worden nooit opgeschoond; voorstel: twee jaar na aanmaken. (c) `action_center_support_access_events` (organisatieniveau, optionele vrije tekst) valt bewust buiten schrijfslot en opschoning. (d) Een lead wissen maakt de koppeling in de levering leeg; de operator ziet dan "handoff nog niet expliciet gekoppeld". (e) Een operator die een opgeschoonde meting heropent, moet ook `closed_at` leegmaken; anders kan de klant niet sluiten. Een heropende opgeschoonde meting blijft overal "Gegevens verwijderd".
10. **Privacyzin leads.** "Wat je via het contactformulier of in een kennismaking met Loep deelt" dekt niet expliciet de eigen notities die Loep in leerdossiers maakt (koopreden, uitkomst, lessen); de termijn klopt wel.
11. **Loep Start** (buiten deze ronde): de brugzin zegt onder 30% respons nog "daar begint het gesprek ook" naast een kernzin met "mogelijk startpunt".
12. **Uit het plan, nog open:** afspraak per afdeling alleen op papier (geen dashboardveld); parkeerregel in plaats van een tweede eigenaar (kolommen kunnen met plan 3c mee); de twee pdf's in `Loep_Docs` (`Loep onepager.pdf`, `Loep methodische verantwoording.pdf`) opnieuw exporteren uit de bijgewerkte HTML.

## Bewust niet gedaan

- **Loep Start (S1 tot en met S8):** buiten deze ronde; ook de indicatieve brugzin (beslispunt 11).
- **R6, tweede helft;** R7, V7, R9, R10, R11, R12, R13, R14, R16, R17, R18, R19, V3: kandidaten voor de volgende ronde. De leesronde light vond R16 (methodiekpagina) en V3 (beloning) opnieuw.
- **De overige 58 vertaalvragen en de verdeeld-zinnen:** goedgekeurde content, ongewijzigd.
- **De vertrekmaand in de Vertrek-vragenlijst:** aparte vervolgtaak na de merge (amendement).
- **Een HTTP-endpoint voor de opschoning:** Railway-cron in plaats daarvan.
- **Opschoonbewust (buiten scope, vervolgtaak):** `/beheer/klantlearnings`, de Action Center-pagina's, `api/internal/progress-nudge`, `lib/action-center-manager-results-notifications.ts`, het dode `get-beheer-page-data.ts`, en `POST /api/campaigns/{id}/respondents` (geen 410; het schrijfslot in de database weigert een klant wel).
- **Kleine vervolgpunten uit de reviews:** identieke open antwoorden worden samengevoegd (botst met "wat komt terug in meer dan één antwoord?"; voorstel "(2×)"); Anders-antwoorden bij Loep Vertrek op de verdiepingspagina's zonder namenregel; de "Score"-kolom in de afdelingstabel van Loep Vertrek is de omgekeerde frictiescore zonder uitleg; "van de 1 stellingen" (enkelvoud) in de Gemiddelde-scorecel; `estimateHeadcount("Minder dan 150")` geeft 150 (alleen intern); op `/dashboard` met één meting twee extra queries; de pil "Dashboard verwijderd" in routebeheer leest vreemd; de ongebruikte export `pricingFaqs` in `site-content.ts`.

## Na merge (Taak 22)

1. **Migratie** `migrations/2026_09_24_add_data_retention.sql` in Supabase draaien (SQL Editor), vóór de Railway-redeploy. Controlequery: stap 4 van `migrations/checks/2026_09_24_data_retention_gedrag.sql` (alleen de `select`, alleen lezen), verwacht `true | true | true | 2` voor de kolommen, de check en de twee klok-triggers, en 12 triggers `*_purged_guard_trg` (13 als `action_center_governance_interventions` live bestaat). Daarnaast de alleen-lezen controle onderaan de migratie: `select pg_get_functiondef('auth.role'::regproc) like '%request.jwt.claims%';`, verwacht `true` (anders laat de trigger elke klant door). Zonder migratie werkt alles zoals nu; alleen `--apply` weigert.
2. **Railway-redeploy** (rapportcode, `backend/main.py`, `backend/data_retention.py`); Vercel deployt de frontend.
3. **Browsercheck op de testklant** volgens `docs/testklant.md` (`seed_test_tenant.py --dry-run`, `--reset`, `--login-link` met de systeem-Python; inloggegevens nergens vastleggen): campagne A toont het besluitblok met "Waaraan zien we bij het startpunt dat het werkt", de parkeerregel en de terugkoppelhint van de eigen scan, en geen "Gegevens verwijderd"; de download van A heeft de leidraad naar de werkvragen en de nieuwe besluitpagina; B en C zoals vóór de merge; sluiten van een meting werkt nog (de database zet nu het sluitmoment).
4. **Productie-dry-run** na de migratie (`python -m backend.data_retention`, zonder `--apply`): verwacht geen LET OP-regel meer en nul verlopen.
5. **Railway-cron** aanzetten en de eerste `--apply`: besluit van Lars.

## Opruimwerk

- Tijdelijke meetuitvoer en hulpscripts staan in `C:\Users\larsh\AppData\Local\Temp\loep-fixronde\` (niet in de repo), onder meer `nulmeting.txt`, `eind.txt`, `t7-cyclus.sh`, `t8_ruimte.py`, `t10_slot.py`, `t11_ruimte.py`; de volledige productie-dry-run (met id's) staat alleen daar.
- De tijdelijke nulmeting-worktree is verwijderd. De launch-configuratie voor de browsercheck is weggehaald.
- Docker Desktop moest twee keer herstart worden: eerst hing `%LOCALAPPDATA%\Docker\run\dockerInference`, daarna faalde `%LOCALAPPDATA%\docker-secrets-engine\engine.sock`. Beide mappen zijn hernoemd (`*.old-<tijd>`), niet verwijderd; ze kunnen weg.
