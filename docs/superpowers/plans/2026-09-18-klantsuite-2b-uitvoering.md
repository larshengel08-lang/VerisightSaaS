# Klantsuite 2b: overzicht en schil: uitvoeringsverslag

Datum: 2026-09-18
Branch: `feature/klantsuite-2b` (worktree `.worktrees/klantsuite-2b`), vanaf main `66d73d82`. Niet gemerged, niet gepusht.
Plan: `docs/superpowers/plans/2026-09-18-klantsuite-2b-overzicht-en-schil.md`
Spec: `docs/superpowers/specs/2026-09-16-klantsuite-design.md`, blok G (par. 6) en blok H (par. 7), plus het amendement par. 4.3a (sluitdatum afdwingen, besluit Lars 18-9). Het amendement staat nu in de spec.

Uitgevoerd via subagent-driven-development: per taak één verse implementatie-subagent, daarna een spec-review en een codekwaliteitsreview door aparte subagents. Elke bevinding ging terug naar dezelfde implementer en kreeg een herreview. Na taak 10 volgde een review van de hele branch; die leverde nog vier fixcommits op, en de walkthrough nog één. Taak 0 en 11 heeft de coördinator zelf gedaan.

## Wat er nu werkt

- **De sluitdatum wordt afgedwongen.** Eén helper (`backend/survey_window.py`) beslist of een meting invulbaar is: actief én vandaag in Europe/Amsterdam op of vóór `closes_at`. De vier open-survey-endpoints weigeren daarna met "Deze meting is gesloten. Bedankt voor je interesse."; `/survey/submit` geeft een 410 met dezelfde tekst. Verlengen opent de deur weer (met een test vastgepind). Een persoonlijke link na sluiting telt niet meer als "geopend".
- **Uitnodiging en herinnering** noemen de sluitdatum: "Invullen kan tot en met 9 oktober 2026." Zonder sluitdatum blijft de regel weg. De wizard bouwt de uitnodiging opnieuw op na stap 1, in beide modi, en meldt het als eigen tekst is vervangen. De toelichting bij de sluitdatum belooft weer wat waar is: "Na deze datum kan niemand meer invullen."
- **Eén noemer en één set statuslabels.** "X van Y ingevuld" komt overal uit `resolveInvitedDenominator` (dezelfde regel als het rapport). Zonder noemer staat er nooit een verzonnen getal of 0%, maar "12 ingevuld, aantal uitgenodigden niet ingevuld". De vijf labels (Nog in te richten, Loopt, Actie nodig, Gesloten geen rapport, Rapport beschikbaar) zijn met een pariteitstest aan de kaartlogica vastgeklonken.
- **`/dashboard` toont alle metingen**: de nieuwste actieve als hoofdkaart, met de campagnenaam erop, en daaronder "Al je metingen" met naam, scan, status en link. Onderaan "Nieuwe meting aanvragen" (mailto, onderwerp met de organisatienaam); met prijs en "vervolgmeting" alleen als er al een meting gesloten is.
- **`/reports`** toont de echte noemer ("18 van 30 ingevuld (60%)"), klikbare namen, een open lijst voor wat nog niet beschikbaar is, en de kolomkoppen weer naast elkaar.
- **De schil:** de kop toont "TEST Loep Testklant" in plaats van "Hotmail" (en een zichtbare melding als de naam niet laadt); het mobiele menu heeft Overzicht, Rapporten, Hulp, het accountblok en "Uitloggen"; de footer noemt hallo@getloep.nl; "Afgesloten" toont campagnenaam en sluitmaand; de dubbele "Rapporten"-knop is weg.
- **`/help`**: drie stappen, de drempels 10 en 5 met uitleg die klopt met de rapportcode, wat jij doet en wat Loep doet, één contactblok. Beschermd achter inloggen.
- **Activatie- en inlogpagina** in Loep-stijl met self-service-copy; `/login?error=invite` legt een verlopen activatielink uit. De auth-logica is karakter voor karakter ongewijzigd.
- **De wizard werkt op 375 px** (ook de afdelingsrij in segmentmodus). Een mislukte rapportdownload legt de fout in het Nederlands uit, per status, met contact en een beknopte technische regel.
- **Geen em- of en-dashes** meer in `components/dashboard`, `app/(dashboard)` en `app/(auth)`, bewaakt door een guardtest. Ook de laadschermen spreken gewone taal ("Je meting wordt geladen").

## Baselines

| Meting | Voor (main `66d73d82`) | Na (`51aaf6a5`) |
|---|---|---|
| `npx tsc --noEmit` | 133 | 133 |
| `npx vitest run` falend | 60 | 59 |
| `npx vitest run` geslaagd | 1332 | 1504 |
| `pytest tests` falend | 25 | 25 |
| `pytest tests` geslaagd | 1115 | 1135 (+ 5 skipped, beide) |
| `npm run build` | niet gedraaid op main | exit 0 met `RESEND_API_KEY` alleen in de shell; `/help` in de routetabel |

Frontend-faalset per testnaam (`diff baseline-fails.txt final-fails.txt`):

```
1d0
< app/(auth)/login/page.test.ts > auth release wording keeps login and activation copy tied to dashboard and campaign release
```

Precies de test die het plan voorspelde (herschreven in taak 8). Geen enkele `>`-regel. De bekende laadfout van `app/(dashboard)/beheer/health/page.test.ts` staat in beide lijsten.

Backend-faalset: `diff pytest-baseline.txt pytest-na.txt` gaf "faalset identiek". `tests/test_python311_syntax_guard.py` groen.

## Commits (25)

| Taak | Commits |
|---|---|
| 1 Sluitdatum afgedwongen (backend) | `b75f11b7`, fix `f33d736e` |
| 2 Sluitdatum in uitnodiging en herinnering | `353a16af`, fix `661a71bc` |
| 3 Noemer, statuslabels, `/reports` | `59ff9b90`, fix `94f160f4` |
| 4 Alle metingen op `/dashboard` | `a3991320` |
| 5 Nieuwe meting aanvragen | `010db63c`, fix `e4f0a904` |
| 6 Schil: kop, mobiel menu, footer, Afgesloten | `6c6a6912`, fix `66010239` |
| 7 `/help` | `0712af23`, fix `b24c556a` |
| 8 Activatie- en inlogpagina | `eb28bbef`, fix `9873f771` |
| 9 Wizard responsive, downloadfout | `86b9eb2a`, fixes `6b79190c`, `fed5be1d` |
| 10 Streepjes-sweep | `2748d4ef`, fix `da58502e` |
| Review hele branch | `9b3c187f`, `d0cc837d`, `2af3e23b`, `aa703605` |
| Walkthrough | `51aaf6a5` |
| 11 Documenten | deze commit |

Commits van Sonnet-subagents dragen `Co-Authored-By: Claude Sonnet 5`; dat is het model dat ze schreef, dus bewust niet herschreven.

## Afwijkingen van het plan

1. **De sluitdag zelf loopt nog** (`9b3c187f`). Kaart en lijst vroegen "Sluit de meting" op de sluitdag zelf (`today >= closesAt`), terwijl de uitnodiging "tot en met" belooft en de backend die dag openhoudt. Wie de prompt volgde, sloot respondenten buiten die de belofte hadden gekregen. Nu pas de dag erna, met de tekst "De sluitdatum is voorbij." Het plan liet de resolver ongemoeid; alleen de review van de hele branch kon dit zien.
2. **"Nieuwe meting aanvragen" heeft twee varianten.** Spec 6.3 kent alleen "Klaar voor een vervolgmeting? Dezelfde meting opnieuw kost €1.250." Zonder gesloten meting zegt het blok nu "Een meting aanvragen? Mail Loep welke scan je wilt starten", zonder prijs: een eerste scan is geen vervolgmeting van €1.250. De bijzin uit het plan over "een compacte bespreking van de vergelijking met de vorige meting" is geschrapt; op "gesloten zonder rapport" is er niets om mee te vergelijken.
3. **Eén mailknop op "gesloten zonder rapport."** De resolver zette daar een eigen "Mail Loep"-knop naast het nieuwe blok. Spec 4.5 zegt "met de mailknop uit blok G"; de resolver-knop is weg, de subtekst is ongewijzigd. Dit is naast `campaignName` de enige gedragswijziging in de resolver.
4. **Activatiecopy.** De plantekst "Loep heeft je organisatie en je eerste meting al aangemaakt. Daarna richt je ..." is onwaar voor wie later wordt uitgenodigd. Nu: "Je organisatie staat al klaar in Loep. Een meting loopt in drie stappen:" en daaronder "In je overzicht zie je bij welke stap jouw meting nu staat."
5. **Helpcopy preciezer dan het plan.** "Loep verstuurt niets" werd "Loep mailt je medewerkers niet" (Loep mailt wél als het rapport klaarstaat); de herinnering is voorwaardelijk; de afdelingsregels volgen `report_html.py` (eigen regel vanaf 5, "Overige afdelingen" alleen als die samen op 5 komen, geen uitsplitsing bij minder dan twee afdelingen met 5). Bijvangst: de wizardmelding in `lib/response-activation.ts` beloofde ten onrechte dat kleine afdelingen onder "Overige afdelingen" vallen.
6. **Fail Loud op meer plekken dan het plan noemde.** De layout gooit bij een `campaign_stats`-fout (was een stille lege sidebar); `/dashboard` en de campagnepagina gooien bij een fout op delivery record, herinneringsevents, campagnegegevens en organisatienaam. Een ontbrekende rij zonder fout blijft gewoon werken. De statuscontext gooit bij de rijlimiet van 1000.
7. **Gesloten-lijst gesorteerd op sluitdatum** (plancode sorteerde op aanmaakdatum terwijl de sluitmaand getoond wordt).
8. **375 px in segmentmodus.** De afdelingsrij (naam, aantal, verwijderknop) liep over; `min-w-0`/`shrink-0` toegevoegd. Het plan zei dat verder niets hoefde te veranderen.
9. **Downloadfout samengevat.** De proxy stopt de ruwe upstream-body in `detail`; bij een Railway-502 zou een hele HTML-pagina als technische melding verschijnen. `lib/report-download-error.ts` vat samen (JSON-detail, HTML wordt een korte melding, maximaal 300 tekens) en kiest de hoofdmelding per status.
10. **Testcorrecties waar de plantest niet kon slagen:** de guard telde `closesAt: closesAt || null` drie keer terwijl er een vierde (bestaande) stond; de dashboardguard verbood elke `.limit(1)` terwijl de herinneringsquery die terecht houdt; de logintest zocht het letterlijke mailadres terwijl de plancode `LOEP_CONTACT_EMAIL` gebruikt. Alle drie versmald tot wat ze bedoelden.
11. **Kleinere keuzes:** de "Loopt"-pil in `#B07A10` in plaats van `#E8A020` (contrast); `?error=invite` wordt na het lezen uit de URL gehaald; de streepjesguard telt de gescande bestanden, zodat een verkeerde map niet stil slaagt; laadschermen in gewone taal.

## Wat de reviews vonden

- **Taak 1:** tests die rond middernacht konden falen (dag nu vastgezet); `opened_at` werd gezet vóór de sluitingscheck.
- **Taak 2:** een tijdstempel zonder offset kon in de browser een dag verschuiven.
- **Taak 3:** stille afkapping bij 1000 rijen, dubbel berekende noemer, een pariteitskoppeling die een toekomstige drempelsplitsing zou verbergen, link die niet als link te herkennen was.
- **Taak 5:** een prijs en vergelijking beloofd waar ze niet bestaan; twee concurrerende mailknoppen.
- **Taak 6:** sortering tegen het getoonde label in; stille statsfout; menu zonder `aria-expanded`.
- **Taak 7:** drie onware of onvolledige zinnen in de help (zie afwijking 5).
- **Taak 8:** onware activatiecopy voor latere genodigden; geen `autoComplete`; te laag contrast.
- **Taak 9:** overflow in segmentmodus; ruwe HTML als foutmelding; 401/403 kregen "probeer het later opnieuw".
- **Hele branch:** de sluitdag-fout (afwijking 1), de vervolgmetingtekst bij een nieuwe klant, stille queries op de hoofdkaart.

## Browsercheck (18 september 2026)

Lokale frontend uit de worktree op `http://localhost:3100`, tegen productie-Supabase via de gekopieerde `.env.local`, ingelogd met een verse `--login-link`. Eerst `--dry-run` (geslaagd, "Geen productiedata aangeraakt"), dan `--reset` ("11 tellingen van andere organisaties ongewijzigd"). De seed lanceert B op 14 september, dus dit was **dag 4 na de seed-lancering**; de herinnering staat op 19 september en de herinneringskaart was nog niet aan de beurt. Persona: Sanne, HR-manager, eerste keer. Geen schermafdrukken op schijf gezet (de schermen tonen het testmailadres).

| # | Stap | Uitkomst |
|---|---|---|
| 1 | Activatie | ✅ Loep-ontwerp, "Kies een wachtwoord", beide velden "Minimaal 8 tekens", rechts "Wat je hierna doet" met drie stappen, geen managed-jargon. "Later, ga naar mijn overzicht" landt op `/dashboard`. |
| 2 | Dashboard | ✅ Kop "TEST Loep Testklant"; sidebar Overzicht, Rapporten, Hulp, onder "Afgesloten" A met "Gesloten sep 2026"; hoofdkaart B met naam en "6 van 30 ingevuld"; "Al je metingen" met B (Loopt, "Staat hierboven"), C (Nog in te richten), A (Rapport beschikbaar), elk klikbaar; "Klaar voor een vervolgmeting?" met mailto, onderwerp "Nieuwe meting aanvragen: TEST Loep Testklant"; footer met hallo@getloep.nl; één "Rapporten"-link. |
| 3 | Campagne C, wizard | ✅ "Je meting staat klaar." → wizard. Toelichting sluitdatum exact. Start 18-9, sluit 9-10, 30 deelnemers: stap 2 eindigt op "Invullen kan tot en met 9 oktober 2026." Eigen naam in het bericht gezet, terug naar stap 1, sluitdatum 16-10: melding "De uitnodiging is opnieuw opgebouwd ..." verschijnt en de regel zegt 16 oktober; de eigen naam is weg (zie hinderlijk 2). Niet gelanceerd. |
| 4 | 375 px | ✅ Wizard stap 1 en 2: stappen onder elkaar, velden op volle breedte, knop "Opslaan en verder" één regel (40 px hoog), `scrollWidth` 375. Ook `/dashboard`, `/campaigns/<B>`, `/reports`, `/help`: 375. |
| 5 | Campagne B | ✅ "Campagne loopt" met campagnenaam bij het scanlabel, tijdlijn, "Meting sluiten"; sluitdatum één keer (tijdlijn, "Nog niet ingesteld"). "Alle metingen" landt op `/dashboard`. |
| 6 | Campagne A | ✅ Eén rapportblok met "Rapport downloaden", geen "Open rapport". Downloaden: "Het rapport kon niet worden opgehaald (fout 500). Probeer het later opnieuw of mail hallo@getloep.nl." Oorzaak: de lokale proxy wijst naar een lokale backend die niet draaide (`ECONNREFUSED`). Op productie draait Railway nog `4805e92d`; de download werkt pas na de redeploy. |
| 7 | `/reports` | ✅ A onder "Beschikbaar nu" met "18 van 30 ingevuld (60%)"; B "Loopt", C "Nog in te richten" in een open lijst; kolomkoppen naast elkaar; namen linken naar de meting. |
| 8 | `/help` | ✅ Drie stappen, drempels met uitleg, "Wat jij doet" / "Wat Loep doet", contactblok. |
| 9 | Mobiel menu | ✅ Overzicht, Rapporten, Hulp, accountblok met mailadres en "TEST Loep Testklant", "Uitloggen" (`aria-expanded` klopt). Uitloggen landt op `/login`. |
| 10 | Inlogpagina | ✅ "Log in bij Loep", contactregel, niets over managers of v2.0. `/login?error=invite` toont de melding boven het formulier en haalt de parameter uit de URL. |
| 11 | Console | ✅ Alleen de bekende CSP-melding over `va.vercel-scripts.com/v1/script.debug.js`, plus de 500 van stap 6. |

De backend-afdwinging van de sluitdatum is met pytest vastgepind en pas in de browser zichtbaar na de Railway-redeploy (checklistpunt 10 in `docs/testklant.md`). Afgesloten met `--reset`: "11 tellingen van andere organisaties ongewijzigd". Een volgende check heeft een verse login-link nodig.

## Walkthrough-score

| | 16 september | 18 september |
|---|---|---|
| Blokkerend | 6 | **0** |
| Hinderlijk | 26 | **2** |
| Cosmetisch | 11 | 4 |

**De lat (nul blokkerend, hoogstens vijf hinderlijk) is gehaald.**

Wat nog openstaat:
- Hinderlijk 1 (5.1): rapportdownload werkt niet tot de Railway-redeploy. Omgeving, geen code; de melding is nu Nederlands en noemt het contactadres (5.3 opgelost).
- Hinderlijk 2 (nieuw): wie in stap 2 de tekst aanpast (bijvoorbeeld de eigen naam onder "Met vriendelijke groet") en daarna in stap 1 de sluitdatum verandert, verliest die aanpassingen. Er staat een melding, en het is het gedrag dat het plan voorschreef, maar het is wel werk kwijt. Beter: alleen de regel "Invullen kan tot en met" vervangen als alleen die veranderde.
- Cosmetisch (nieuw): de campagnenaam staat op de campagnepagina twee keer (kop en kaart); "Nog niet beschikbaar" op `/reports` heeft geen kolomkoppen; een niet-gelanceerde meting krijgt toch een periode ("Q3 2026"); het mobiele menu toont de afgesloten metingen niet.
- Opgelost tijdens de walkthrough (nieuw): laadschermen met "Campaign state wordt opgebouwd" (`51aaf6a5`).

## Bewust niet gedaan

1. **Lopende metingen zonder sluitdatum** blijven "Nog niet ingesteld", zonder knop (besluit Lars 18-9).
2. **Scoping van `/dashboard` op één organisatie.** De query leunt op RLS. Wie lid is van meer organisaties (de operator) ziet in "Al je metingen" de metingen van al die organisaties, zonder label, en de hoofdkaart kan uit elke organisatie komen. Dat was met `limit(1)` al zo en is geen lek; voor een klant met één organisatie speelt het niet.
3. **Hoofdkaart op aanmaakdatum** (letterlijk spec 6.1). Na lancering van C (aangemaakt 10-9) blijft B (13-9) de hoofdkaart; C staat als "Loopt" in de lijst.
4. **Vier UTC-"vandaag"-helpers in de frontend** tegenover de Amsterdam-dag in de backend: rond middernacht hoogstens twee uur verschil.
5. **Na verlengen** noemt de al verstuurde uitnodiging de oude datum; de herinnering noemt de nieuwe. De klant krijgt daar geen hint over.
6. **`dispatch_reminders` en het operatorpaneel** blijven op `self_send_config.endDate` (plan-besluit 6).
7. **De streepjesguard scant `lib/` niet**, waar veel nieuwe copy staat (nu schoon). Respondentcopy `backend/main.py:1266` zegt nog "Bedankt — uw eerdere antwoorden" (em-dash en "uw", bestond al).
8. **Operator-schermen:** `/beheer` toont nog de oude noemer (`completion_rate_pct`); "n.b." in beheer en in het CSV-formulier leest bij bewust lege velden als "onbekend".
9. **Dode code:** `closeDateLabel`, de mailto-takken in beide statuskaarten, `portfolioCounts` (nog met drempel 5), `buildHrReportDownloadRows`/`cockpit-index`, de onbereikbare `generating`-tak (belooft nog een mail).
10. **`supabase/schema.sql`** mist `closes_at`/`closed_at` in `campaign_stats` (alleen de migratie heeft ze). Een database herbouwd uit `schema.sql` geeft nu een luide fout in de hele ingelogde omgeving.
11. **Een backend-404** (bijvoorbeeld een rapport dat niet te genereren is) toont "geen toegang met dit account"; de technische regel eronder noemt de echte reden.
12. **Tests zijn grotendeels source-guards**, zoals in 2a; gedrag van menu, dialogen en wizard is alleen in de browser gecontroleerd.

## Wat Lars moet weten

- **Niets is gemerged of gepusht.** Main heeft ook de 2a-merge nog niet gepusht; pushen van main neemt beide mee.
- **Railway-redeploy nodig, vóór of tegelijk met de Vercel-deploy.** Taak 1 raakt `backend/main.py`, `backend/models.py`, `backend/survey_window.py`, `requirements.txt` en `templates/survey-status.html`. De frontend belooft vanaf de push "Na deze datum kan niemand meer invullen" en "Invullen kan tot en met"; dat is pas waar na de redeploy. Controleer de sha via `/api/health`. Dezelfde redeploy lost de PDF-download op (Railway staat nog op `4805e92d`).
- **Nieuwe dependency `tzdata`.** `survey_window.py` laadt de tijdzone bij het importeren; zonder `tzdata` start de backend niet. Dus een volledige rebuild, geen herstart.
- **Geen DB-migratie**, maar check vooraf één keer het kolomtype: `select data_type from information_schema.columns where table_name='campaigns' and column_name='closes_at'` moet `date` geven. Bij een tijdstempel geven alle vier survey-endpoints een 500.
- **Metingen met een sluitdatum in het verleden** weigeren respondenten zodra de redeploy live is.
- **Faalset-diff:** frontend één `<`-regel (de voorspelde logintest), backend identiek.
- **Beslissen:**
  1. `/help` laat de klant "het gesprek met je managementteam" zelf voeren (besluit 11-9), terwijl de site nog "Managementbespreking inbegrepen" verkoopt en Loep's rol die bespreking niet noemt. Welke van de twee klopt vandaag?
  2. `/dashboard` scopen op één organisatie, of vastleggen dat operators `/beheer` gebruiken (bewust niet gedaan 2).
  3. Hoofdkaart op aanmaakdatum of op lanceerdatum (bewust niet gedaan 3).
  4. De twee hinderlijke punten hierboven: de download lost zich op met de redeploy; het behoud van eigen tekst bij een datumwijziging is een kleine vervolgtaak.
