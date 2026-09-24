# Fixronde na de koude leesronde van 24 september: implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Per taak: één implementer, daarna een spec-review en een codekwaliteitsreview; herreview tot beide akkoord zijn.

**Goal:** Het rapport haalt de vier rapportpunten uit de top vijf van de koude leesronde van 24 september (blijf- en vertrekintentie geduid, een namenregel voor Loep Vertrek, paginaverwijzingen die kloppen, en een slot van de vergadering en een besluitpagina die sluiten), en de site krijgt een ondubbelzinnige prijsgrens, omvangvakken die op de staffel aansluiten, zichtbare veelgestelde vragen op `/producten` en overal dezelfde naam; en de belofte uit de privacyverklaring en de verwerkersovereenkomst (uiterlijk twee jaar na het sluiten verwijderen of anonimiseren, of eerder op verzoek) krijgt een werkend mechanisme.

**Architecture:** Alle rapportwijzigingen zitten in `backend/report_html.py` (copy, helpers, renderers) en `backend/report_css.py`, met één kleine datalaag-uitbreiding in `build_report_data` (`exit_months`). De meetregel `paginaverwijzing` in `scripts/check_pdf_report.py` gaat van "de verwezen pagina begint met een hoofdstukkop" naar "het getoonde nummer is de pagina waar het anker werkelijk staat", gelezen uit de link-annotaties die WeasyPrint schrijft; daardoor mag een verwijzing weer naar het werkvragenblok midden op een pagina wijzen. Deel A en B hebben geen databasemigratie: het tweede punt krijgt een expliciete parkeerregel in plaats van eigen eigenaar- en datumkolommen. De site-wijzigingen lopen allemaal via één bron (`frontend/lib/pricing.ts` voor grenzen en omvangvakken, `faqs` in `components/marketing/site-content.ts` voor de vragen). Deel C voegt één additieve migratie toe (`campaigns.data_purged_at`, `organizations.retention_months`, bewust niet op het ORM-model) en een opschoonmodule `backend/data_retention.py` (standaard dry-run), met een 410 op elke rapportroute na de opschoning.

**Tech Stack:** Python 3.11 (Railway; geen PEP 701 f-strings), FastAPI, SQLAlchemy, WeasyPrint 70.0 in het productie-image, PyMuPDF voor de PDF-meting, pytest; Next.js App Router, TypeScript, vitest.

**Bronnen:** `docs/superpowers/specs/2026-09-24-juridische-ronde.md` (P6, D5, keuze B) en `docs/security-audit-2026-07-12.md` (L6) voor Deel C; `docs/rapport-koude-leesronde-2026-09-24.md` (bevindingen R1 tot R19, V1 tot V9, S1 tot S8; sectie 6), `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (ontwerpregels, "Afwijkingen bij plan 3a/3b"), `docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md`, `docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md`, `docs/superpowers/plans/2026-09-20-site-ronde-besluit-a-uitvoering.md` ("Wat Lars moet beslissen", punt 5, 6, 7 en 15), en de besluiten van Lars van 24 september.

---

## Scope

**Deel A, het rapport** (Loep Behoud en Loep Vertrek; **Loep Start valt buiten deze ronde**, er verandert niets aan wat een Loep Start-rapport zegt):

1. Blijf- en vertrekintentie een zin geven op pagina twee (R1).
2. Namenregel voor Loep Vertrek bij de werkvragen, in de leidraad en bij de open antwoorden, plus de uitstroomperiode in de meetgegevens (V1, V5, V8). **De 72 vertaalvragen worden niet herschreven**; het voorstel om "toen de vertrekkers er nog werkten" te vervangen staat onder "Wat Lars moet beslissen".
3. Paginaverwijzingen die kloppen: de leidraad en de besluitpagina wijzen weer naar het werkvragenblok zelf, de meetregel controleert het getoonde nummer tegen de werkelijke ankerpagina, en de frictiescore krijgt uitleg (R2, V6, V2).
4. De laatste twaalf minuten en de besluitpagina: de leidraad zegt wat je overslaat en wat je parkeert, het tweede punt krijgt een parkeerregel, de afdelingsafspraak krijgt een regel, en "Niets, dit zit hier goed" telt in de verdeeld-staat niet als richting (R3, R4, R5, R6, V9, met R8, V4 en R15 omdat ze op dezelfde pagina zitten).

**Deel B, de site:**

5. Prijsgrens: de onderste trede heet "Minder dan 150 medewerkers".
6. Omvangvakken op het contactformulier gelijk aan de staffel.
7. Veelgestelde vragen zichtbaar op `/producten`, met de FAQPage-JSON-LD daar en niet meer op de homepage.
8. Naam: overal "Lars van den Hengel" (repo is al schoon; `Loep_Docs\offerte-template.html` niet).

**Deel C, opschoning na de bewaartermijn** (besluit Lars 24-9, eigen taken na A en B):

9. Datamodel per tabel: verwijderen, anonimiseren of bewaren, met advies (C.1).
10. Afwijkende termijn per organisatie: additieve kolom, migratie kopieerklaar, wachtstap (C.2, Taak 16, 22).
11. Idempotente opschoning met dry-run als standaard, per meting één transactie, periodiek via een Railway-cron (C.3, Taak 17).
12. Op verzoek per campagne of organisatie (Taak 17).
13. Rapport na de opschoning: 410 met een leesbare reden, en een eerlijke campagnepagina (Taak 18, 20).
14. **Geen `--apply` tegen productie in deze ronde**; alleen een dry-run met aantallen (Taak 19).

## Besluit over de migratie voor het besluit: geen migratie, een parkeerregel

(Dit gaat over de besluitpagina. Deel C heeft wel een eigen migratie, voor de bewaartermijn; zie C.2.)

Advies en gebouwde variant: **geen kolommen `secondary_owner`/`secondary_follow_up_date`**. Het tweede punt krijgt op de besluitpagina en in het dashboard één vaste regel: *"Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het oppakt. Anders parkeren jullie dit punt: de eigenaar van het startpunt zet het op de agenda van het vervolgmoment."* Waarom:

1. **Het past bij R3.** De leidraad zegt voortaan zelf: het tweede punt alleen als er tijd is, anders parkeren. Een parkeerregel op de besluitpagina is daar het logische vervolg; twee eigenaarvelden zouden het MT juist uitnodigen om in de laatste vier minuten een tweede besluit te forceren.
2. **Het geeft het tweede punt toch een eigenaar en een datum**: de eigenaar van het startpunt en de datum van het vervolgmoment. Dat is precies wat R4 vraagt ("of de expliciete regel geen eigenaar, dan parkeren tot het vervolgmoment").
3. **Geen handmatige deploystap.** Elke migratie is een stap die Lars in Supabase moet draaien vóór de Railway-redeploy. Op 13 september legde precies zo'n vergeten migratie elk rapport plat, en ook de migratie van plan 3b (`campaign_decisions`) was zo'n extra stap (inmiddels gedraaid, 24-9). Een tweede afhankelijkheid erbij, pre-eerste-klant, levert minder op dan hij kost.
4. **Eén besluit dat iemand draagt** is de eigen regel van de besluitpagina. Twee losse eigenaren ondergraven die.

Wil Lars later toch een eigenaar per punt (bijvoorbeeld voor plan 3c, "Wat is er veranderd"), dan is dat een additieve migratie die met 3c meekan; zie "Wat Lars moet beslissen".

## Harde regels (gelden voor elke taak)

- **Python 3.11 op Railway.** Geen f-string met een backslash of met hetzelfde aanhalingsteken binnen de accolades als eromheen (PEP 701). Gebruik in een `f"..."` binnen de accolades alleen `'...'`, en bouw lastige stukken op met `+`. `tests/test_python311_syntax_guard.py` moet groen blijven.
- Backendtests altijd als `pytest tests` via `.venv/Scripts/python.exe`.
- **Copy:** Nederlands, je/jij, Loep als onderwerp (nooit "ik" of "wij"/"we"), geen em-dash (U+2014) en geen en-dash (U+2013), geen HR-jargon, geen advies, geen oorzaak-claim, geen voorspelling. De HR-manager leidt het gesprek zelf; Loep zit niet aan tafel. Elke nieuwe rapportzin haalt de generieke-zin-test: hij bevat een getal of een naam uit deze meting, of hij is een leesregel die alleen verschijnt als de data die hij duidt er is.
- **Nooit** RLS, privacygates, staffels of drempels verzwakken. De klant ziet nooit individuele antwoorden.
- **Gate is de faalset per testnaam**, niet het aantal. Baselines op main (`33920b49`, gelijk op `37059706`: de juridische ronde voegde alleen een groene guardtest toe): backend `pytest tests` 25 falend; frontend `npx tsc --noEmit` 131, `npx vitest run` 47 falend.
- Nooit kaal `git stash` of `git stash pop`. Commit altijd met `git commit -- <paden>` (een gedeelde index kan andermans staged wijzigingen bevatten). Niet mergen, niet pushen.
- **Commit alles vóór je stopt**, ook als een sessielimiet nadert. Ongecommit werk telt als niet gedaan.
- De `Co-Authored-By`-regels in de commitblokken hieronder zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies.

## Omgeving en valkuilen

- Worktree: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\fixronde-leesronde`, branch `feature/fixronde-leesronde` vanaf main.
- Python: `PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe` (3.11.9, gelijk aan Railway). De venv mist `httpx`: `scripts/seed_test_tenant.py --reset` en `--login-link` draai je met de systeem-Python; `--dry-run` werkt met de venv. In deze ronde is de testklant niet nodig (geen migratie), zie Taak 16.
- Tijdelijke map voor meetuitvoer: `/c/Users/larsh/AppData/Local/Temp/loep-fixronde`.
- `frontend/node_modules` in de hoofdmap kan leeg zijn. Installeer in de worktree (`npm install`) en zet `package-lock.json` terug met `git checkout -- package-lock.json` als `npm install` hem wijzigde (`npm ci` weigert door een bekende mismatch). Maak nooit een junction naar `node_modules`: `rmdir /s /q` op een junction leegt het doel. Raakt `node_modules` tijdens de ronde leeg (bekend verschijnsel, vermoedelijk een parallelle sessie): opnieuw installeren en de baseline opnieuw meten.
- WeasyPrint rendert lokaal niet (geen GTK op Windows). Tests met `requires_weasyprint` slaan lokaal over. **PDF's valideer je in het productie-image**, niet in de ghcr-image (die draait WeasyPrint 58.1, productie 70.0).
- Docker Desktop hangt soms op `%LOCALAPPDATA%\Docker\run\dockerInference`. Fix: alle Docker-processen stoppen, de map `%LOCALAPPDATA%\Docker\run` hernoemen, Docker Desktop herstarten. Nooit factory reset.
- `docs/stresstest/` is gitignored. Genereer altijd eerst opnieuw met `$PY scripts/stresstest_report.py`, anders meet je oude HTML.
- Een frontend-build heeft een `RESEND_API_KEY` nodig. Zet een dummy alleen in de shell (`RESEND_API_KEY=re_dummy_build_only npm run build`), nooit in een bestand.

## PDF's renderen in het productie-image (vast recept)

Wordt gebruikt in Taak 0, 7, 11 en 21.

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
docker build -t loep-backend:test .
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe scripts/stresstest_report.py
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-fixronde/out
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde:/repo:ro" \
  -v "C:/Users/larsh/AppData/Local/Temp/loep-fixronde/out:/out" \
  loep-backend:test sh -c "pip install -q pymupdf; python /repo/scripts/render_in_image.py"
```

Uitvoer per HTML-bestand: `OK <naam> paginas=N warnings=0 emdash=0 check=OK`, of `NIET OK` met de bevindingen eronder; slotregel `TOTAAL n bestanden, m met bevindingen`. Een selectie geef je mee als argumenten na `render_in_image.py` (voorvoegsels, bijvoorbeeld `01 06 08 zz_`).

**Bekende uitzondering (mag niet slechter worden):** scenario 01, 09 en 19 hebben elk één `paginavulling`-bevinding op pagina 7 (36%, 26%, 36% na plan 3b). Elk ander bestand hoort `check=OK` te geven.

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid | Taken |
|---|---|---|
| `scripts/check_pdf_report.py` | Regel `paginaverwijzing` leest link-annotaties en vergelijkt het getoonde nummer met de ankerpagina; regel `besluit-op-een-a4` gebruikt het laatste vaste label als eindmarker | 1 |
| `tests/test_check_pdf_links.py` (nieuw) | Synthetische PDF's met links, plus een mutatietest op het echte voorbeeldrapport | 1 |
| `tests/test_report_p02_mtvel.py` | Lockstep: tekstverwijzing zonder hoofdstukkop is geen bevinding meer; leidraad zonder links; aanroepen zonder `has_direction` | 1, 2 |
| `tests/test_check_pdf_besluit.py` | Lockstep: eindmarker van de besluitpagina | 1 |
| `backend/report_html.py` | Leidraad (rij 2, 4, 5, voetregel), besluitpagina, `_intentie_duiding`, `_frictie_duiding`, namenregel, `_uitstroomperiode`, `_brugzin`, `_besluit_afdeling`, `_richtingen_weging`, `build_report_data["exit_months"]`, renderers | 2 t/m 6, 8, 9, 10 |
| `backend/report_css.py` | `.p02-duiding` en eventuele hefbomen uit Taak 7 | 3, 7 |
| `tests/test_report_leesronde_fixes.py` (nieuw) | Alle nieuwe rapportzinnen en hun gates | 2 t/m 6, 8, 9, 10 |
| `tests/test_report_besluitpagina.py`, `tests/test_report_werkvragen.py`, `tests/test_report_drempels_en_koppen.py` | Lockstep van gepinde copy en signatuur | 2, 9 |
| `scripts/render_besluit_max.py` (nieuw) | Twee stresstest-renders met een maximaal ingevuld besluit, voor `besluit-op-een-a4` | 11 |
| `frontend/components/dashboard/decision-block.tsx` + `.guard.test.ts` | Labels en hints gelijk aan de besluitpagina | 9 |
| `frontend/lib/pricing.ts` + `pricing.test.ts`, `frontend/public/llms.txt` | "Minder dan 150 medewerkers" | 12 |
| `frontend/lib/contact-funnel.ts`, `frontend/components/marketing/contact-form.tsx`, `frontend/lib/contact-size-options.test.ts` (nieuw) | Omvangvakken uit de staffel | 13 |
| `frontend/lib/lead-headcount.ts` + `.test.ts` (nieuw), `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx` | Schatting van de omvang leest ook "1.000" | 13 |
| `tests/test_contact_size_values.py` (nieuw) | De backend accepteert de nieuwe waarden | 13 |
| `frontend/components/marketing/site-content.ts`, `frontend/components/marketing/producten-content.tsx`, `frontend/app/producten/page.tsx`, `frontend/app/page.tsx`, `frontend/lib/producten-faq.test.ts` (nieuw), `frontend/lib/marketing-positioning.test.ts`, `frontend/lib/site-content-besluit-a.test.ts` | Veelgestelde vragen zichtbaar op `/producten` | 14 |
| `C:\Users\larsh\Desktop\Business\Loep_Docs\*.html` (buiten de repo) | Naam en staffelgrens in de sjablonen | 15 |
| `migrations/2026_09_24_add_data_retention.sql` (nieuw), `supabase/schema.sql` | Kolommen `data_purged_at` en `retention_months`, trigger die klanten ze niet laat wijzigen | 16 |
| `tests/test_data_retention_migration.py` (nieuw) | Guard: additief, idempotent, niet op het ORM-model | 16 |
| `backend/data_retention.py` (nieuw) | Opschoning na de termijn en op verzoek, CLI `python -m backend.data_retention`, `ensure_report_data_available` | 17 |
| `tests/test_data_retention.py` (nieuw) | Termijn, open metingen, andere organisaties, tweede run, dry-run, fout per meting (SQLite) | 17 |
| `backend/main.py`, `tests/test_data_retention_report.py` (nieuw) | 410 met een leesbare reden op elke rapportroute | 18 |
| `frontend/lib/dashboard/data-purged.ts` + `.test.ts` (nieuw), `frontend/app/(dashboard)/campaigns/[id]/page.tsx` | Campagnepagina toont een opgeschoonde meting eerlijk | 20 |
| `docs/examples/`, `frontend/public/examples/` | Voorbeeldrapporten opnieuw gegenereerd | 21 |
| `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` | Sectie "Afwijkingen bij de fixronde leesronde" | 21 |
| `docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md` (nieuw) | Verslag | 21 |

## Taakoverzicht

| # | Taak | Leesronde-codes | Deel |
|---|---|---|---|
| 0 | Worktree, baselines, productie-image, nulmeting | | |
| 1 | Meetregel `paginaverwijzing` via link-annotaties; eindmarker besluitpagina | R2, V6 (meetbaar maken) | A |
| 2 | Leidraad en besluitpagina wijzen naar het werkvragenblok; slot van 14 minuten met overslaan en parkeren | R2, V6, R3 | A |
| 3 | Blijf- en vertrekintentie duiden op pagina twee | R1 | A |
| 4 | Frictiescore uitleggen op pagina twee | V2 | A |
| 5 | Namenregel Loep Vertrek | V1, V5 | A |
| 6 | Uitstroomperiode in de meetgegevens | V8 | A |
| 7 | Tussenmeting pagina twee in het productie-image, met vaste hefbomen | R1, V2, R3 | A |
| 8 | Brugzin bij het tweede punt en een afdelingsafspraak op de besluitpagina | R5 | A |
| 9 | Besluitpagina en dashboard: parkeerregel, succes per punt, terugkoppeling, besluitvraag | R4, R8, V4, R15 | A |
| 10 | "Niets, dit zit hier goed" telt niet als richting | R6, V9 | A |
| 11 | Besluitpagina met een maximaal besluit meten | R4, R5 | A |
| 12 | Prijsgrens "Minder dan 150 medewerkers" | | B |
| 13 | Omvangvakken contactformulier | | B |
| 14 | Veelgestelde vragen zichtbaar op `/producten` | | B |
| 15 | Naam en staffelgrens in `Loep_Docs` | | B |
| 16 | Migratie voor de bewaartermijn | | C |
| 17 | De opschoning zelf (`backend/data_retention.py`) | | C |
| 18 | Rapport na de opschoning: 410 met een leesbare reden | | C |
| 19 | Dry-run van de opschoning (lokaal en alleen-lezen tegen productie) | | C |
| 20 | Campagnepagina toont een opgeschoonde meting eerlijk | | C |
| 21 | Eindverificatie, voorbeeldrapporten, leesronde light, browsercheck, verslag | | |
| 22 | Wachtstap en controles na de merge (Lars en de hoofdsessie) | | |

Volgorde: 0, dan 1 (de meetregel moet er zijn voordat de verwijzingen verschuiven), dan 2 t/m 6, dan 7 (meting), dan 8 t/m 10, dan 11 (meting), dan 12 t/m 15 (onafhankelijk van deel A, mogen ook eerder), dan 16 t/m 20 (Deel C), en als laatste 21. Taak 22 is geen bouwwerk. Taak 2 t/m 10 raken allemaal `backend/report_html.py`: niet parallel uitvoeren. Taak 18 raakt `backend/main.py` en importeert uit `backend/data_retention.py` (Taak 17).

---

## Taak 0: Worktree, baselines, productie-image, nulmeting

**Files:**
- Create: `docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt`
- Copy in: `docs/superpowers/plans/2026-09-24-fixronde-leesronde.md` (dit plan, staat untracked in de hoofdmap)

- [ ] **Stap 1: Worktree aanmaken**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git log --oneline -1 main
git worktree add .worktrees/fixronde-leesronde -b feature/fixronde-leesronde main
cp docs/superpowers/plans/2026-09-24-fixronde-leesronde.md .worktrees/fixronde-leesronde/docs/superpowers/plans/
cd .worktrees/fixronde-leesronde && git log --oneline -1
```
Verwacht: `33920b49 docs(rapport): koude leesronde na plan 3b ...` of een nieuwere commit op main. Is main verder dan `33920b49`: lees `git log --oneline 33920b49..main` en noem het in het verslag. Staan `docs/superpowers/specs/2026-09-24-juridische-ronde.md` of `docs/security-audit-2026-07-12.md` alleen untracked in de hoofdmap, kopieer ze dan ook naar dezelfde paden in de worktree (Deel C leest ze); ze gaan mee in de commit van stap 6 als ze nog niet in git staan.

- [ ] **Stap 2: Tooling controleren**

```bash
PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe
$PY --version
$PY -c "import pymupdf; print('pymupdf', pymupdf.__version__)"
docker --version && docker info --format "{{.ServerVersion}}"
```
Verwacht: `Python 3.11.9`, `pymupdf 1.28.2` (of nieuwer), twee Docker-versieregels. Hangt `docker info`: zie "Omgeving en valkuilen".

- [ ] **Stap 3: Backend-faalset vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-fixronde
$PY -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt
wc -l < docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt
```
Verwacht: `25`. Wijkt het af: stop en meld het, main staat dan niet op de bekende baseline.

Vanaf hier is het **backend-faalset-commando** na elke backendtaak:

```bash
$PY -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > /c/Users/larsh/AppData/Local/Temp/loep-fixronde/na.txt; diff docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt /c/Users/larsh/AppData/Local/Temp/loep-fixronde/na.txt && echo GEEN_REGRESSIES
```
Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 4: Frontend installeren en baselines vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde/frontend
npm install
git checkout -- package-lock.json
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-baseline.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-baseline.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-baseline-fails.txt
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-baseline-fails.txt
```
Verwacht: `131` (tsc) en `47` (falende tests). De vitest-suite is licht wisselvallig (`app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet): wijkt het getal af, draai de vitest-regel opnieuw en vergelijk namen.

Vanaf hier is het **frontend-faalset-commando** na elke frontendtaak:

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-na.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-na.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-na-fails.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-fixronde/vitest-na-fails.txt && echo GEEN_REGRESSIES
```
Verwacht: `131` en `GEEN_REGRESSIES`. Een test die op main faalde en nu slaagt mag (hij staat dan alleen aan de `<`-kant van de diff); noteer hem in het verslag en ga door. Elke regel aan de `>`-kant is een regressie.

- [ ] **Stap 5: Productie-image bouwen en nulmeting**

Volg het vaste recept ("PDF's renderen in het productie-image") zonder selectie en zet `| tee /c/Users/larsh/AppData/Local/Temp/loep-fixronde/nulmeting.txt` achter het `docker run`-commando.

Verwacht: 24 bestanden (21 scenario's inclusief `16b`, en drie voorbeelden), elk `warnings=0 emdash=0`, en `check=OK` behalve scenario 01, 09 en 19 (elk één `paginavulling` op pagina 7). Noteer per bestand het aantal pagina's; Taak 21 vergelijkt ermee.

- [ ] **Stap 6: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
git add docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt docs/superpowers/plans/2026-09-24-fixronde-leesronde.md
git commit -F- -- docs/superpowers/plans/fixronde-leesronde-baseline-failset.txt docs/superpowers/plans/2026-09-24-fixronde-leesronde.md <<'EOF'
chore(fixronde): baseline-faalset en plan fixronde leesronde 24-9

Backend 25 falend, tsc 131, vitest 47 falend op main.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
(Voeg de twee bronbestanden uit stap 1 toe aan `git add` en aan de padlijst als je ze moest kopiëren.)

---

## Taak 1: Meetregel `paginaverwijzing` via link-annotaties; eindmarker van de besluitpagina

**Waarom.** Plan 3b liet de leidraad en de besluitpagina naar het werkvragenblok wijzen (anker `sec-werkvragen`, midden op een pagina). De meetregel eiste dat elke verwezen pagina met een hoofdstukkop begint; 19 van de 21 scenario's faalden en de hoofdsessie draaide de verwijzing terug naar het begin van de gespreksagenda. Gevolg in de leesronde (R2, V6): "met de werkvragen (pagina 12)" terwijl ze op pagina 13 staan. De regel mat het verkeerde. Wat hij moet meten: **toont de verwijzing het nummer van de pagina waar het anker werkelijk staat?**

**Hoe de PDF dat vastlegt** (gemeten op de drie voorbeeldrapporten, WeasyPrint 70.0, PyMuPDF 1.28.2, 24-9): elke `<a class="pref" href="#anker">` wordt een link-annotatie met een benoemde bestemming (`/Dest (sec-agenda)`). `page.get_links()` geeft per link `kind == LINK_NAMED`, `nameddest` en de opgeloste doelpagina in `page` (0-gebaseerd). Het getoonde nummer staat als tekst binnen de linkrechthoek. Op alle 84 links in de drie voorbeelden gaven "de cijfers binnen de rechthoek, per teken gelezen" precies `page + 1`. WeasyPrint schrijft elke link twee keer (identieke rechthoek); de meting ontdubbelt. Per woord lezen werkt niet: het woordkader van "3)" of "12)." is breder dan de link.

Een tweede reparatie in hetzelfde script: `besluit-op-een-a4` zocht de voetregel "Leg dit besluit ook vast in je dashboard" als teken dat het invulvel niet overliep. Sinds eindreview-fix N5 van plan 3b staat die voetregel er **niet** bij een voorgedrukt besluit, dus elk ingevuld besluit gaf een valse bevinding (en Taak 11 meet juist een ingevuld besluit). De eindmarker wordt het laatste vaste label van de pagina, "Waaraan zien we", dat in beide staten staat.

**Files:**
- Modify: `scripts/check_pdf_report.py`
- Modify: `backend/report_html.py` (constante `BESLUIT_SLOTLABEL`, gebruikt in `_besluit_page`)
- Create: `tests/test_check_pdf_links.py`
- Modify: `tests/test_report_p02_mtvel.py` (twee tests, lockstep)
- Modify: `tests/test_check_pdf_besluit.py` (eindmarker, lockstep)

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_check_pdf_links.py`:

```python
"""Regel `paginaverwijzing` leest de link-annotaties (fixronde leesronde 24-9).

Een verwijzing mag naar een blok midden op een pagina wijzen, zolang het
getoonde nummer de pagina is waar het anker werkelijk staat. Gemeten op PDF's
die PyMuPDF zelf bouwt en op het echte voorbeeldrapport (WeasyPrint 70.0).
"""
from pathlib import Path

import pytest

pymupdf = pytest.importorskip("pymupdf")

from scripts import check_pdf_report as cpr  # noqa: E402

A4 = (595.0, 842.0)
ROOT = Path(__file__).resolve().parent.parent
VOORBEELD = ROOT / "docs" / "examples" / "voorbeeldrapport_retentiescan.pdf"


def _pdf(pad: Path, *, getoond: str | None, doel: int | None, leidraad: bool = False,
         kop_op_doel: bool = False) -> str:
    """Vier pagina's. Pagina 2 draagt "zie pagina <getoond>" met een link naar
    pagina-index `doel` (None: geen link). De doelpagina begint alleen met een
    hoofdstukkop als `kop_op_doel` waar is; de andere pagina's altijd."""
    doc = pymupdf.open()
    for i in range(4):
        page = doc.new_page(width=A4[0], height=A4[1])
        zonder_kop = doel is not None and i == doel and not kop_op_doel
        page.insert_text((60.0, 70.0), "regel bovenaan" if zonder_kop else "0" + str(i + 1) + " Kop",
                         fontsize=11)
        for y in range(100, 740, 20):
            page.insert_text((60.0, float(y)), "regel op " + str(y), fontsize=11)
    p2 = doc[1]
    if leidraad:
        p2.insert_text((60.0, 750.0), cpr.LEIDRAAD_MARKER + " in 45 minuten", fontsize=11)
    if getoond is not None:
        voor = "zie pagina "
        p2.insert_text((60.0, 780.0), voor + getoond, fontsize=11)
        x0 = 60.0 + pymupdf.get_text_length(voor, fontsize=11)
        x1 = x0 + max(pymupdf.get_text_length(getoond, fontsize=11), 6.0)
        rect = pymupdf.Rect(x0 - 0.5, 768.0, x1 + 0.5, 786.0)
        if doel is not None:
            p2.insert_link({"kind": pymupdf.LINK_GOTO, "from": rect, "page": doel,
                            "to": pymupdf.Point(45.0, 300.0)})
    doc.save(str(pad))
    doc.close()
    return str(pad)


def _meldingen(pad: str) -> list[str]:
    return [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VERWIJZING,))]


def test_juist_nummer_naar_het_midden_van_een_pagina_is_goed(tmp_path):
    """Het werkvragenblok staat midden op een pagina. Dat is geen fout meer,
    zolang het nummer klopt."""
    assert _meldingen(_pdf(tmp_path / "goed.pdf", getoond="3", doel=2)) == []


def test_verkeerd_nummer_is_een_bevinding(tmp_path):
    assert _meldingen(_pdf(tmp_path / "fout.pdf", getoond="3", doel=3, kop_op_doel=True)) == [
        "pagina 2: de verwijzing naar een intern anker toont pagina 3, "
        "maar het anker staat op pagina 4"]


def test_link_zonder_nummer_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "leeg.pdf", getoond="", doel=2)
    assert _meldingen(pad) == ["pagina 2: de link naar een intern anker toont geen paginanummer"]


def test_leidraad_met_nummers_maar_zonder_links_is_een_bevinding(tmp_path):
    """Zonder link-annotaties valt er niets na te gaan; dat mag niet als
    "geen overtreding" doorgaan."""
    pad = _pdf(tmp_path / "zonderlink.pdf", getoond="3", doel=None, leidraad=True)
    assert ("pagina 2 draagt de leidraad met paginanummers, maar geen enkele interne link; "
            "de meting kan niet nagaan of die nummers kloppen") in _meldingen(pad)


@pytest.mark.skipif(not VOORBEELD.exists(), reason="voorbeeldrapport ontbreekt")
def test_echt_voorbeeldrapport_heeft_alleen_kloppende_links():
    doc = pymupdf.open(str(VOORBEELD))
    try:
        links = [l for i in range(doc.page_count) for l in cpr._interne_links(doc[i])]
        assert len(links) >= 10, "te weinig interne links gevonden; leest de meting de PDF nog?"
        assert cpr._link_bevindingen(doc) == []
    finally:
        doc.close()


@pytest.mark.skipif(not VOORBEELD.exists(), reason="voorbeeldrapport ontbreekt")
def test_echt_voorbeeldrapport_met_een_verschoven_link_valt_op(tmp_path):
    """Mutatietest op de echte tekstlaag: vervang op pagina 2 de eerste link
    door een link naar de pagina erna. De meting moet het getoonde nummer en
    de nieuwe doelpagina noemen."""
    doc = pymupdf.open(str(VOORBEELD))
    p2 = doc[1]
    eerste = cpr._interne_links(p2)[0]
    rect = pymupdf.Rect(eerste["from"])
    getoond = int("".join(c for c in cpr._tekst_in(p2, rect) if c.isdigit()))
    for link in list(p2.get_links()):
        if pymupdf.Rect(link["from"]) == rect:
            p2.delete_link(link)
    p2.insert_link({"kind": pymupdf.LINK_GOTO, "from": rect, "page": eerste["page"] + 1,
                    "to": pymupdf.Point(45.0, 100.0)})
    pad = tmp_path / "gemuteerd.pdf"
    doc.save(str(pad))
    doc.close()
    verwacht = ("pagina 2: de verwijzing naar een intern anker toont pagina " + str(getoond)
                + ", maar het anker staat op pagina " + str(eerste["page"] + 2))
    assert verwacht in _meldingen(str(pad))
```

In `tests/test_check_pdf_besluit.py`:

1. Vervang de import `from backend.report_html import BESLUIT_TITEL, BESLUIT_VOETREGEL  # noqa: E402` door:
```python
from backend.report_html import BESLUIT_SLOTLABEL, BESLUIT_TITEL, BESLUIT_VOETREGEL  # noqa: E402
```
2. Vervang de definitie van `_besluit` door:
```python
SLOT = (700.0, BESLUIT_SLOTLABEL.upper())


def _besluit(met_voet: bool = True) -> list[tuple[float, str]]:
    regels = [(70.0, "04 " + BESLUIT_TITEL), (120.0, "Startpunt"), (400.0, "Eigenaar")]
    return regels + ([SLOT, VOET] if met_voet else [])
```
3. Vervang `test_markers_komen_uit_de_renderer` door:
```python
def test_markers_komen_uit_de_renderer():
    assert cpr.BESLUIT_KOP == BESLUIT_TITEL
    assert BESLUIT_SLOTLABEL.startswith(cpr.BESLUIT_SLOT)
```
4. Vervang `test_overgelopen_besluitpagina_is_een_bevinding` door:
```python
def test_overgelopen_besluitpagina_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "over.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                       _besluit(met_voet=False), [SLOT, VOET], _vol("05 Appendix")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert any("laatste vaste label" in m for m in meldingen)
    assert any("begint niet met een hoofdstukkop" in m for m in meldingen)
```
5. Voeg toe:
```python
def test_voorgedrukt_besluit_zonder_voetregel_is_geen_bevinding(tmp_path):
    """N5 (plan 3b): met een voorgedrukt besluit staat de voetregel er niet.
    Dat is geen overloop; de eindmarker is het laatste vaste label."""
    gevuld = [(70.0, "04 " + BESLUIT_TITEL), (120.0, "Startpunt"), (400.0, "Eigenaar"), SLOT]
    pad = _pdf(tmp_path / "gevuld.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                         gevuld, _vol("05 Appendix")])
    assert cpr.check(pad, regels=(cpr.REGEL_BESLUIT,)) == []
```

In `tests/test_report_p02_mtvel.py`:

1. Vervang `test_check_ziet_een_verwijzing_naar_een_pagina_zonder_hoofdstukkop` in zijn geheel door:
```python
@requires_pymupdf
def test_tekstverwijzing_naar_een_pagina_zonder_hoofdstukkop_is_geen_bevinding_meer(tmp_path: Path):
    """Fixronde leesronde 24-9: een verwijzing mag naar een blok midden op een
    pagina wijzen (het werkvragenblok). Of het nummer klopt, meet de regel nu
    aan de link-annotatie (tests/test_check_pdf_links.py), niet aan de kop."""
    pad = _goed_rapport(tmp_path / "ref2.pdf",
                        p2_extra=[(765.0, "zie pagina 2 voor de meetgegevens")])
    assert cpr.check(str(pad), regels=(cpr.REGEL_VERWIJZING,)) == []
```
2. Vervang in `test_check_eist_vijf_gevulde_verwijzingen_zodra_de_leidraad_er_staat` de slotassertie door:
```python
    assert meldingen == [
        "pagina 2 draagt de leidraad maar 4 gevulde verwijzing(en) "
        "([3, 4, 5, 6]); dat blok levert er minstens 5",
        "pagina 2 draagt de leidraad met paginanummers, maar geen enkele interne link; "
        "de meting kan niet nagaan of die nummers kloppen"]
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
$PY -m pytest tests/test_check_pdf_links.py tests/test_check_pdf_besluit.py -q -p no:cacheprovider
```
Verwacht: FAIL. `test_check_pdf_besluit.py` breekt al bij de import (`ImportError: cannot import name 'BESLUIT_SLOTLABEL'`); `test_check_pdf_links.py` faalt op `AttributeError: module 'scripts.check_pdf_report' has no attribute '_interne_links'` en op de ontbrekende bevindingen.

- [ ] **Stap 3: `BESLUIT_SLOTLABEL` in de renderer**

In `backend/report_html.py`, direct onder `BESLUIT_TITEL = "Besluit van het MT"`:

```python
# Het laatste vaste label van de besluitpagina. scripts/check_pdf_report.py
# gebruikt het begin ervan als eindmarker: staat het label op de besluitpagina,
# dan liep het invulvel niet over. De voetregel kan dat niet meer zijn, die
# vervalt bij een voorgedrukt besluit (N5, plan 3b).
BESLUIT_SLOTLABEL = "Waaraan zien we dat het werkt"
```

En in `_besluit_page` vervang:

```python
  <div class="bl-blok">
    {_bl_veld("Waaraan zien we dat het werkt", succes)}
  </div>
```
door:
```python
  <div class="bl-blok">
    {_bl_veld(BESLUIT_SLOTLABEL, succes)}
  </div>
```

- [ ] **Stap 4: Het script aanpassen**

In `scripts/check_pdf_report.py`:

(a) Vervang in de moduledocstring het hele blok van `paginaverwijzing` (van `  paginaverwijzing  pagina 2 draagt gevulde` tot en met `hem als fout aanneemt;`) door:

```
  paginaverwijzing  pagina 2 draagt gevulde "pagina N"-verwijzingen, geen die
                    leeg renderde en geen nummer buiten het document (H4).
                    Daarnaast, op elke pagina: elke interne link toont als
                    tekst precies het nummer van de pagina waar zijn anker
                    staat. WeasyPrint schrijft een <a href="#anker"> als
                    link-annotatie met een benoemde bestemming; PyMuPDF lost
                    die op naar de doelpagina. Zo mag een verwijzing naar een
                    blok midden op een pagina wijzen (het werkvragenblok,
                    fixronde leesronde 24-9) en valt een verkeerd nummer toch
                    op. Draagt pagina 2 de leidraad met nummers maar geen enkele
                    interne link, dan is dat zelf een bevinding: dan valt er
                    niets na te gaan. Grens van de meting: of het anker op het
                    goede element staat, meet deze regel niet; dat bewaken de
                    unittests op de HTML (_assert_verwijzingen_kloppen);
```

en in het blok van `besluit-op-een-a4` de woorden `staat de voetregel op diezelfde pagina` door `staat het laatste vaste label ("Waaraan zien we ...") op diezelfde pagina`.

(b) Vervang het blok met `BESLUIT_KOP`, `BESLUIT_VOET` en `BESLUIT_BELOFTE` (inclusief het commentaar erboven) door:

```python
# Markers van de besluitpagina (backend/report_html.py: BESLUIT_TITEL,
# BESLUIT_SLOTLABEL en de trustline onder de gespreksagenda). De test
# test_markers_komen_uit_de_renderer bewaakt dat ze gelijk blijven. De
# eindmarker is het laatste vaste label en niet de voetregel: die vervalt bij
# een voorgedrukt besluit (N5, plan 3b), en dan meldde deze regel een overloop
# die er niet was.
BESLUIT_KOP = "Besluit van het MT"
BESLUIT_SLOT = "Waaraan zien we"
BESLUIT_BELOFTE = "Leg het besluit vast op pagina"
```

(c) In `_besluit`, vervang:

```python
    if BESLUIT_VOET.casefold() not in _pagina_tekst(doc[i]).casefold():
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 1} draagt de besluitpagina maar niet de voetregel; "
                           f"loopt het invulvel over naar een tweede pagina?"))
```
door:
```python
    if BESLUIT_SLOT.casefold() not in _pagina_tekst(doc[i]).casefold():
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 1} draagt de besluitpagina maar niet het laatste vaste "
                           f"label ({BESLUIT_SLOT!r}); loopt het invulvel over naar een tweede pagina?"))
```

(d) Verwijder `_AGENDASLOT_OPENERS`, `_begint_met_agendaslot` en het commentaarblok erboven (vanaf `# De gespreksagenda (het slot van hoofdstuk` tot en met de `return any(...)`-regel). `_begint_met_hoofdstukkop` blijft: `_besluit` gebruikt hem.

(e) Voeg direct boven `def _verwijzingen` toe:

```python
_LINK_KINDS = (pymupdf.LINK_GOTO, pymupdf.LINK_NAMED)


def _interne_links(page: pymupdf.Page) -> list[dict]:
    """De interne links van een pagina, één per rechthoek.

    WeasyPrint 70 schrijft elke <a class="pref"> als twee identieke
    link-annotaties (gemeten op de drie voorbeeldrapporten, 24-9). PyMuPDF lost
    een benoemde bestemming zelf op naar `page` (0-gebaseerd); een bestemming
    die niet bestaat geeft -1.
    """
    gezien: set[tuple[float, float, float, float]] = set()
    uit: list[dict] = []
    for link in page.get_links():
        if link.get("kind") not in _LINK_KINDS:
            continue
        r = pymupdf.Rect(link["from"])
        sleutel = (round(r.x0, 1), round(r.y0, 1), round(r.x1, 1), round(r.y1, 1))
        if sleutel in gezien:
            continue
        gezien.add(sleutel)
        uit.append(link)
    return uit


def _tekst_in(page: pymupdf.Page, rect: pymupdf.Rect) -> str:
    """De tekens waarvan het midden binnen `rect` valt.

    Per teken en niet per woord: het nummer staat vast aan een haakje of punt
    ("12)."), en het woordkader is dan breder dan de link. Gemeten: op alle 84
    links van de drie voorbeeldrapporten geeft dit precies het getoonde nummer.
    """
    tekens: list[str] = []
    for blok in page.get_text("rawdict")["blocks"]:
        for regel in blok.get("lines", []):
            for span in regel["spans"]:
                for teken in span["chars"]:
                    x0, y0, x1, y1 = teken["bbox"]
                    if rect.contains(pymupdf.Point((x0 + x1) / 2, (y0 + y1) / 2)):
                        tekens.append(teken["c"])
    return "".join(tekens)


def _link_bevindingen(doc: pymupdf.Document) -> list[Bevinding]:
    """Elke interne link toont het nummer van de pagina waar zijn anker staat."""
    bevindingen: list[Bevinding] = []
    for i in range(doc.page_count):
        page = doc[i]
        for link in _interne_links(page):
            naam = repr(link["nameddest"]) if link.get("nameddest") else "een intern anker"
            doel = link.get("page")
            if doel is None or not 0 <= doel < doc.page_count:
                bevindingen.append(Bevinding(
                    REGEL_VERWIJZING,
                    f"pagina {i + 1}: de link naar {naam} wijst naar geen bestaande pagina"))
                continue
            getoond = re.sub(r"\D", "", _tekst_in(page, pymupdf.Rect(link["from"])))
            if not getoond:
                bevindingen.append(Bevinding(
                    REGEL_VERWIJZING,
                    f"pagina {i + 1}: de link naar {naam} toont geen paginanummer"))
            elif int(getoond) != doel + 1:
                bevindingen.append(Bevinding(
                    REGEL_VERWIJZING,
                    f"pagina {i + 1}: de verwijzing naar {naam} toont pagina {getoond}, "
                    f"maar het anker staat op pagina {doel + 1}"))
    return bevindingen
```

(f) Vervang in `_verwijzingen` de slotlus (van `    for ref in sorted(set(gevuld)):` tot en met `    return bevindingen`) door:

```python
    if LEIDRAAD_MARKER in p2 and gevuld and not _interne_links(doc[1]):
        bevindingen.append(Bevinding(
            REGEL_VERWIJZING,
            "pagina 2 draagt de leidraad met paginanummers, maar geen enkele interne link; "
            "de meting kan niet nagaan of die nummers kloppen"))

    for ref in sorted(set(gevuld)):
        if not 1 <= ref <= n:
            bevindingen.append(Bevinding(
                REGEL_VERWIJZING,
                f"verwijzing naar pagina {ref} buiten het document ({n} pagina's)"))
    bevindingen += _link_bevindingen(doc)
    return bevindingen
```

en vervang de eerste alinea van de docstring van `_verwijzingen` door: `"""De paginaverwijzingen (H4). Vier dingen kunnen misgaan, en geen ervan mag als "geen overtreding" langs de meting glippen: een verwijzing die leeg renderde (ontbrekend anker), te weinig verwijzingen terwijl de leidraad er vijf hoort te leveren, een nummer buiten het document, en een nummer dat niet de pagina is waar het anker staat (via de link-annotaties, op elke pagina).`

- [ ] **Stap 5: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_check_pdf_links.py tests/test_check_pdf_besluit.py tests/test_report_p02_mtvel.py tests/test_report_besluitpagina.py -q -p no:cacheprovider
```
Verwacht: alles `passed` (tests met `requires_weasyprint` `skipped`). Faalt `test_link_zonder_nummer_is_een_bevinding` omdat PyMuPDF een lege `insert_text` weigert of de rechthoek een teken van "pagina" raakt: laat de test dan een spatie tonen (`getoond=" "`) en controleer met `cpr._tekst_in` dat de rechthoek alleen die spatie bevat. Pas nooit de meting aan om de test te laten slagen.

- [ ] **Stap 6: Het script op de drie echte voorbeeldrapporten**

```bash
for f in docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.pdf; do $PY scripts/check_pdf_report.py "$f" --regel paginaverwijzing --regel besluit-op-een-a4; done
```
Verwacht: drie keer `OK`. Deze PDF's zijn de render van vóór deze ronde: de leidraad wijst er naar de gespreksagenda, en dat nummer klopt ook.

- [ ] **Stap 7: Faalset en syntax-guard**

Draai het backend-faalset-commando (Taak 0 stap 3) en `$PY -m pytest tests/test_python311_syntax_guard.py -q -p no:cacheprovider`. Verwacht: `GEEN_REGRESSIES` en `passed`.

- [ ] **Stap 8: Commit**

```bash
git add tests/test_check_pdf_links.py
git commit -F- -- scripts/check_pdf_report.py backend/report_html.py tests/test_check_pdf_links.py tests/test_check_pdf_besluit.py tests/test_report_p02_mtvel.py <<'EOF'
fix(check-pdf): paginaverwijzing meet het getoonde nummer tegen de ankerpagina

De regel eiste dat een verwezen pagina met een hoofdstukkop begint. Daardoor
kon de leidraad niet naar het werkvragenblok midden op een pagina wijzen en
stond er in de leesronde van 24-9 'pagina 12' waar de werkvragen op 13 staan
(R2, V6). Nu leest de regel de link-annotaties die WeasyPrint schrijft en
controleert hij per link dat het getoonde nummer de pagina van het anker is.
Eindmarker besluitpagina wordt het laatste vaste label: de voetregel vervalt
bij een voorgedrukt besluit (N5).

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---


## Taak 2: Leidraad en besluitpagina wijzen naar het werkvragenblok; slot met overslaan en parkeren

**Leesronde:** R2 en V6 (verwijzing naar de verkeerde pagina), R3 (twaalf minuten voor twee punten, drie vragen en een besluitpagina; de leidraad zegt niet wat je overslaat of doorschuift).

**Wat verandert:**
- Rij 5 van de leidraad wijst naar `LEIDRAAD_ANKERS["werkvragen"]` zodra het werkvragenblok rendert (Behoud en Vertrek met een factorprofiel), en anders, zoals nu, naar het eerste gesprekspunt op de gespreksagenda (Loep Start).
- De inleiding van de besluitpagina wijst naar hetzelfde anker.
- De tijdvakken worden `25-31 min` (afdelingen, zes minuten) en `31-45 min` (wat gaan we doen, veertien minuten).
- Rij 5 zegt: bij het startpunt sla je Herkennen over (dat deden jullie al), het tweede punt alleen als er tijd is, anders parkeren tot het vervolgmoment.
- `_leidraad_block` en `_leidraad_html` verliezen `has_direction` en `direction_agg`: rij 5 hangt nu aan het bestaan van het werkvragenblok (`has_werkvragen`), niet aan richtingdata. De renderer berekent het werkvragenblok daarom vóór pagina twee en geeft `bool(_wq_block)` door; zo kan de leidraad nooit naar een blok verwijzen dat er niet is.

**Files:**
- Modify: `backend/report_html.py` (`_leidraad_block`, `_leidraad_html`, `_besluit_page`, `render_exit_report_html`, `render_retention_report_html`, `render_onboarding_report_html`)
- Create: `tests/test_report_leesronde_fixes.py`
- Modify (lockstep): `tests/test_report_p02_mtvel.py`, `tests/test_report_besluitpagina.py`, `tests/test_report_drempels_en_koppen.py`

- [ ] **Stap 1: Schrijf de falende tests**

Maak `tests/test_report_leesronde_fixes.py`:

```python
"""Fixronde na de koude leesronde van 24-9 (docs/superpowers/plans/2026-09-24-fixronde-leesronde.md).

Elke sectie hoort bij één taak van het plan; de zinnen die hier gepind worden
komen letterlijk uit het plan. Loep Start valt buiten deze ronde: waar een test
Loep Start noemt, is het om te bewijzen dat daar niets verandert.
"""
import re

import pytest

from backend.report_html import (
    LEIDRAAD_ANKERS,
    _besluit_page,
    _leidraad_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture, _page_two
from tests.test_report_p02_mtvel import _retention_met_secties

STREEPJES = ("\u2014", "\u2013")


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _rij(html: str, tijd: str) -> str:
    """De HTML van één leidraadrij, vanaf het tijdvak tot het einde van de rij."""
    start = html.index(tijd)
    return html[start:html.index("</tr>", start)]


def _href(anker: str) -> str:
    return 'href="#' + LEIDRAAD_ANKERS[anker] + '"'


# ── Taak 2: verwijzingen naar het werkvragenblok, slot van de vergadering ────

def test_rij_vijf_wijst_naar_het_werkvragenblok_zelf():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    rij = _rij(html, "31-45 min")
    assert _href("werkvragen") in rij
    assert _href("besluit") in rij
    assert _href("agenda") not in rij


def test_rij_vijf_zegt_wat_je_overslaat_en_wat_je_parkeert():
    html = _leidraad_block("exit", has_segments=False, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(_rij(html, "31-45 min"))
    assert "Bij het startpunt sla je Herkennen over, dat deden jullie al; neem de vragen eronder." in tekst
    assert ("Het tweede punt alleen als er tijd is, anders parkeren jullie het tot het "
            "vervolgmoment.") in tekst


def test_tijdvakken_geven_het_slot_veertien_minuten():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(html)
    for tijd in ("0-5 min", "5-12 min", "12-25 min", "25-31 min", "31-45 min"):
        assert tijd in tekst
    assert "25-33 min" not in tekst and "33-45 min" not in tekst
    assert html.count("<tr>") == 5


def test_zonder_werkvragen_wijst_rij_vijf_naar_het_eerste_gesprekspunt():
    html = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                           has_deepening=False)
    rij = _rij(html, "31-45 min")
    assert "Het eerste gesprekspunt (pagina" in _plain(rij)
    assert _href("agenda") in rij
    assert "werkvragen" not in _plain(rij).lower()


def _exit_met_toelichtingen() -> dict:
    data = _fixture("exit", n=25, profile=True)
    data["open_texts"] = ["Toelichting " + str(i) for i in range(6)]
    return data


@pytest.mark.parametrize("render, data_fn", [
    (render_retention_report_html, _retention_met_secties),
    (render_exit_report_html, _exit_met_toelichtingen),
])
def test_render_verwijst_naar_een_werkvragenblok_dat_er_is(render, data_fn):
    html = render(data_fn())
    assert _href("werkvragen") in _page_two(html)
    assert _body(html).count('id="' + LEIDRAAD_ANKERS["werkvragen"] + '"') == 1


def test_besluitpagina_verwijst_naar_het_werkvragenblok():
    html = _besluit_page(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                         startpunt_label="Groeiperspectief", tweede_label=None,
                         review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.",
                         heeft_werkvragen=True)
    assert _href("werkvragen") in html
    assert _href("agenda") not in html


def test_loep_start_verandert_niet():
    """Loep Start valt buiten deze ronde: geen werkvragen, geen verwijzing ernaar."""
    body = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert 'id="' + LEIDRAAD_ANKERS["werkvragen"] + '"' not in body
    assert _href("werkvragen") not in body
```

Pas de lockstep-tests aan (ze pinden de oude, foute verwijzing of de oude signatuur):

- `tests/test_report_besluitpagina.py`, `test_inleiding_verwijst_naar_de_werkvragen_of_zegt_dat_ze_er_niet_zijn`: vervang de regel met `LEIDRAAD_ANKERS["agenda"]` door
  ```python
      assert 'href="#' + LEIDRAAD_ANKERS["werkvragen"] + '"' in met
  ```
  en werk de docstring bij: "Fixronde leesronde 24-9: de inleiding wijst naar het eigen anker van het blok (werkvragen). De meetregel meet sinds Taak 1 het getoonde nummer tegen de ankerpagina, dus de terugdraai van N1 is niet meer nodig."
- `tests/test_report_besluitpagina.py`, `test_leidraad_rij_vijf_wijst_naar_werkvragen_en_besluit`: vervang de hele test door
  ```python
  def test_leidraad_rij_vijf_wijst_naar_werkvragen_en_besluit():
      """Fixronde leesronde 24-9 (R2): rij 5 wijst naar het werkvragenblok zelf."""
      html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                             has_deepening=True, has_werkvragen=True)
      rij = html[html.index("31-45 min"):]
      assert 'href="#' + LEIDRAAD_ANKERS["werkvragen"] + '"' in rij
      assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in rij
      assert "De werkvragen (pagina" in _plain(rij)
      assert html.count("<tr>") == 5          # geen extra rij: p.02 blijft een A4
      zonder = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                               has_deepening=False)
      assert "werkvragen" not in _plain(zonder)
      assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in zonder
  ```
- `tests/test_report_p02_mtvel.py`: haal in elke aanroep van `_leidraad_block` het argument `has_direction=...` weg (regels rond 488, 502, 505, 511, 520 en 1409). In `test_leidraad_heeft_vijf_tijdvakken_met_paginaverwijzingen` wordt de tijdvak-tupel `("0-5 min", "5-12 min", "12-25 min", "25-31 min", "31-45 min")`. In de test met `assert set(_assert_verwijzingen_kloppen(html)) == {` (rond regel 760) wordt de verwachte set `{"p02", "sec-drempels", "sec-besluit", "sec-werkvragen"}` en de commentaarregel erboven: "Sinds de fixronde van 24-9 wijst de besluitpagina naar het werkvragenblok zelf." In `test_de_pdf_vult_de_verwijzingen_met_echte_paginanummers` vervang je `assert str(_pagina_met("Waar begint het gesprek?")) in nummers` door `assert str(_pagina_met("Per gesprekspunt de vragen die het MT")) in nummers` (die test draait alleen waar WeasyPrint rendert).
- `tests/test_report_drempels_en_koppen.py`, `test_leidraadregel_wijst_in_alle_drie_de_producten_naar_de_drempeltabel`: haal de regel `has_direction=st != "onboarding",` weg.

De synthetische PDF-tests in `tests/test_report_p02_mtvel.py` die regels als `"25-33 min: ..."` in een zelfgebouwde PDF zetten, blijven ongewijzigd: ze meten het script, niet de renderer.

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider
```
Verwacht: FAIL met `TypeError: _leidraad_block() got an unexpected keyword argument 'has_werkvragen'` en, bij de render-test, een ontbrekende `href="#sec-werkvragen"`.

- [ ] **Stap 3: `_leidraad_block`**

Vervang de signatuur:
```python
def _leidraad_block(scan_type: str, *, has_segments: bool, has_quotes: bool,
                    has_direction: bool, has_deepening: bool) -> str:
```
door:
```python
def _leidraad_block(scan_type: str, *, has_segments: bool, has_quotes: bool,
                    has_deepening: bool, has_werkvragen: bool = False) -> str:
```
Vervang in de docstring de alinea die begint met `has_deepening en has_direction volgen dezelfde regel` door:
```
    has_deepening volgt dezelfde regel voor regel 3: een meting van voor de
    verdiepingsvraag (campagne-gate, juli 2026) rendert dat blok niet, en de
    leidraad mag het dan ook niet beloven. has_werkvragen (fixronde 24-9) is
    bool(_werkvragen_block(...)) van de renderer: rij 5 verwijst alleen naar
    dat blok als het er echt staat. Loep Start heeft geen van beide.
```
Vervang het blok vanaf `    # Plan 3b: het besluit heeft een eigen pagina.` tot en met de toewijzing van `slot = (...)` (de regel `f"Het eerste gesprekspunt (pagina {p(A['agenda'])}). " + besluit)`) door:

```python
    # Rij 5 (fixronde leesronde 24-9, R2/V6/R3). Twee dingen:
    # 1. De verwijzing wijst naar het werkvragenblok zelf (anker "werkvragen"),
    #    niet naar het begin van de gespreksagenda: het blok staat meestal een
    #    pagina later, en "met de werkvragen (pagina 12)" stuurde het MT naar de
    #    ranglijst. Mogelijk sinds scripts/check_pdf_report.py het getoonde
    #    nummer tegen de ankerpagina meet in plaats van een hoofdstukkop te eisen.
    # 2. Veertien minuten voor twee punten, drie vragen en een besluitpagina is
    #    krap. De rij zegt wat je overslaat (Herkennen bij het startpunt: dat
    #    deden jullie al bij de verdieping) en wat mag doorschuiven (het tweede
    #    punt, met dezelfde parkeerregel als op de besluitpagina).
    besluit = f"Het besluit leg je vast op pagina {p(A['besluit'])}."
    if has_werkvragen:
        slot = (f"De werkvragen (pagina {p(A['werkvragen'])}). Bij het startpunt sla je "
                "Herkennen over, dat deden jullie al; neem de vragen eronder. Het tweede punt "
                "alleen als er tijd is, anders parkeren jullie het tot het vervolgmoment. "
                + besluit)
    else:
        slot = f"Het eerste gesprekspunt (pagina {p(A['agenda'])}). " + besluit
```

Vervang in de lijst `rijen` de laatste twee regels:
```python
        ("25-33 min", *rij4),
        ("33-45 min", "Wat gaan we doen", slot),
```
door:
```python
        ("25-31 min", *rij4),
        ("31-45 min", "Wat gaan we doen", slot),
```

- [ ] **Stap 4: `_leidraad_html`**

Vervang de signatuur:
```python
def _leidraad_html(scan_type: str, *, data: dict, deep_agg: dict, direction_agg: dict,
                   startpunt_fk: str | None, has_sdt: bool, geen_profiel: bool) -> str:
```
door:
```python
def _leidraad_html(scan_type: str, *, data: dict, deep_agg: dict,
                   startpunt_fk: str | None, has_sdt: bool, geen_profiel: bool,
                   has_werkvragen: bool = False) -> str:
```
Vervang in de docstring het bolletje `- Regel 5 volgt \`direction_agg\`: ...` (drie regels) door:
```
    - Regel 5 volgt `has_werkvragen`: de renderer geeft bool(_werkvragen_block)
      door, dus de leidraad verwijst alleen naar dat blok als het rendert.
```
En vervang de return:
```python
    return _leidraad_block(
        scan_type, has_segments=has_segments, has_quotes=has_quotes,
        has_direction=bool(direction_agg),
        has_deepening=_deepening_shows_distribution(
            deep_agg.get(startpunt_fk) if startpunt_fk else None))
```
door:
```python
    return _leidraad_block(
        scan_type, has_segments=has_segments, has_quotes=has_quotes,
        has_deepening=_deepening_shows_distribution(
            deep_agg.get(startpunt_fk) if startpunt_fk else None),
        has_werkvragen=has_werkvragen)
```

- [ ] **Stap 5: De renderers**

In `render_exit_report_html`, direct onder de toewijzing van `_brug = (...)` (vlak boven `# ── Cover ──`):
```python
    # Het werkvragenblok wordt hier al gebouwd (fixronde 24-9): de leidraad op
    # pagina twee verwijst ernaar, en alleen als het er echt is.
    _wq_block = _werkvragen_block(_raster_rows, deep_agg, direction_agg, "exit")
```
en verwijder verderop de regel `    _wq_block = _werkvragen_block(_raster_rows, deep_agg, direction_agg, "exit")` (vlak boven `s += _prioriteringsraster(`). Vervang de aanroep:
```python
        leidraad_html=_leidraad_html(
            "exit", data=data, deep_agg=deep_agg, direction_agg=direction_agg,
            startpunt_fk=_primary, has_sdt=_heeft_werkbeleving(sdt_a),
            geen_profiel=_geen_profiel),
```
door:
```python
        leidraad_html=_leidraad_html(
            "exit", data=data, deep_agg=deep_agg,
            startpunt_fk=_primary, has_sdt=_heeft_werkbeleving(sdt_a),
            geen_profiel=_geen_profiel, has_werkvragen=bool(_wq_block)),
```

In `render_retention_report_html` hetzelfde: onder `_brug = (...)` de regel
```python
    # Zie render_exit_report_html: het blok eerst, de leidraad verwijst ernaar.
    _wq_block = _werkvragen_block(_raster_rows, deep_agg, direction_agg, ST)
```
de latere toewijzing van `_wq_block` weg, en de aanroep wordt:
```python
        leidraad_html=_leidraad_html(
            ST, data=data, deep_agg=deep_agg,
            startpunt_fk=_primary, has_sdt=_heeft_werkbeleving(sdt_a),
            geen_profiel=_geen_profiel, has_werkvragen=bool(_wq_block)),
```

In `render_onboarding_report_html` vervang:
```python
    _ob_leidraad = _leidraad_html(ST, data=data, deep_agg={}, direction_agg={},
                                  startpunt_fk=None, has_sdt=_ob_has_sdt,
                                  geen_profiel=_geen_profiel)
```
door:
```python
    _ob_leidraad = _leidraad_html(ST, data=data, deep_agg={},
                                  startpunt_fk=None, has_sdt=_ob_has_sdt,
                                  geen_profiel=_geen_profiel)
```

Controleer daarna dat er geen aanroep van `_leidraad_block` of `_leidraad_html` meer `has_direction` of `direction_agg` meegeeft:
```bash
grep -n "has_direction\|_leidraad_html(.*direction_agg" backend/report_html.py
```
Verwacht: geen uitvoer.

- [ ] **Stap 6: `_besluit_page`**

Vervang:
```python
    agenda = _pref(LEIDRAAD_ANKERS["agenda"])
    if heeft_werkvragen:
        # N1 (eindreview): wijst naar het eigen anker van het blok (gezet op de
        # wrapper in _werkvragen_block), niet naar de beginpagina van het
        # hoofdstuk (agenda) waar het blok vaak niet op staat.
        werkvragen = _pref(LEIDRAAD_ANKERS["agenda"])
```
door:
```python
    agenda = _pref(LEIDRAAD_ANKERS["agenda"])
    if heeft_werkvragen:
        # Fixronde 24-9 (R2): wijst naar het eigen anker van het blok (gezet op
        # de wrapper in _werkvragen_block), niet naar de beginpagina van het
        # hoofdstuk, waar het blok meestal niet op staat.
        werkvragen = _pref(LEIDRAAD_ANKERS["werkvragen"])
```
Verwijder in `_leidraad_block` ook het oude commentaarblok over de N1-terugdraai (van `    # N1 (eindreview): "met de werkvragen" wees naar het hoofdstukanker` tot en met `    # op.`), als het na stap 3 nog ergens staat.

- [ ] **Stap 7: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_p02_mtvel.py tests/test_report_drempels_en_koppen.py tests/test_report_werkvragen.py tests/test_report_direction_degraded.py tests/test_report_onboarding_degraded_agenda.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`.

- [ ] **Stap 8: Faalset en syntax-guard**

Backend-faalset-commando en `$PY -m pytest tests/test_python311_syntax_guard.py -q -p no:cacheprovider`. Verwacht: `GEEN_REGRESSIES` en `passed`.

- [ ] **Stap 9: Commit**

```bash
git add tests/test_report_leesronde_fixes.py
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_p02_mtvel.py tests/test_report_drempels_en_koppen.py <<'EOF'
fix(rapport): leidraad en besluitpagina wijzen naar het werkvragenblok zelf

Leesronde 24-9, R2/V6: 'met de werkvragen (pagina 12)' terwijl ze op 13
staan. De verwijzing gaat weer naar het anker van het blok; de meetregel
controleert sinds de vorige commit het getoonde nummer. R3: het slot krijgt
veertien minuten en zegt wat je overslaat (Herkennen bij het startpunt) en
wat je parkeert (het tweede punt, tot het vervolgmoment).

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 3: Blijf- en vertrekintentie duiden op pagina twee

**Leesronde R1:** het zwaarste getal van het Behoud-rapport (blijfintentie 3.9, 25 van de 39 onder de 5; 19 van de 39 met veel vertrekgedachten) wordt genoemd maar niet geduid. In de nagespeelde vergadering ontspoorde minuut 5 tot 12 op "twee derde wil weg, waar zit dat?". Het rapport splitst deze cijfers niet per afdeling uit (het afdelingsblok toont het behoudssignaal en de onderwerpen, geen blijf- of vertrekintentie), dus de eerlijke zin is: dit zegt hoe dringend, niet waar of waarom; daarom begint het gesprek bij het startpunt.

**Regel:** één alinea direct onder de cijfers op pagina twee, alleen bij Loep Behoud, alleen als de blijfintentie kwetsbaar of een aandachtspunt is (bij "relatief sterk" is er geen ontsporing om voor te zijn en zou de zin een probleem suggereren dat er niet is), en niet in de degraded staat (daar draagt `_geen_factorprofiel_note` het verhaal). De vertrekintentie staat erin zodra er minstens `MIN_DISTRIBUTION_N` (10) losse scores zijn, dezelfde staffel als de spreidingsstrook; "veel vertrekgedachten" is daar de hoogste zone (vanaf `ZONE_HIGH`, 6,5), met hetzelfde label als op de behoudscontext. De leidraad krijgt in rij 2 één zin die de HR-manager naar die alinea stuurt.

Generieke-zin-test: de eerste zin draagt de getallen van deze meting, de laatste de naam van het startpunt; de middelste is een leesregel die alleen verschijnt als er een kwetsbare of wankele blijfintentie is.

**Files:**
- Modify: `backend/report_html.py` (`INTENTIE_DUIDING_KERN`, `_intentie_duiding`, `_leidraad_block` rij 2, `_leidraad_html`, `render_retention_report_html`)
- Modify: `backend/report_css.py` (`#p02 .p02-duiding`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg `_intentie_duiding` toe aan de import uit `backend.report_html` bovenaan `tests/test_report_leesronde_fixes.py`, en voeg onderaan toe:

```python
# ── Taak 3: blijf- en vertrekintentie duiden (R1) ───────────────────────────

from backend.report_html import _intentie_duiding  # noqa: E402

STAY = [2.0] * 25 + [5.5] * 8 + [8.0] * 6        # n=39
TO_VEEL = [7.0] * 19 + [3.0] * 20                 # 19 van de 39 vanaf 6,5
KERN = ("Deze cijfers zeggen hoe dringend behoud hier is. Ze zeggen niet bij welke afdeling "
        "het speelt of waarom: dit rapport splitst ze niet per afdeling uit.")
SLOT = ("Daarom begint het gesprek bij Groeiperspectief: daar zie je waar het wringt, en daar "
        "kan het MT zelf iets besluiten.")


def test_intentie_duiding_noemt_urgentie_grens_en_startpunt():
    html = _intentie_duiding(3.9, STAY, TO_VEEL, startpunt_label="Groeiperspectief")
    assert html.startswith('<p class="p02-duiding">')
    assert _plain(html) == ("19 van de 39 hebben veel vertrekgedachten (vertrekintentie vanaf "
                            "6,5). " + KERN + " " + SLOT)


def test_intentie_duiding_enkelvoud_en_nul():
    een = _plain(_intentie_duiding(3.9, STAY, [7.0] + [3.0] * 38, startpunt_label="Groeiperspectief"))
    assert een.startswith("1 van de 39 heeft veel vertrekgedachten")
    geen = _plain(_intentie_duiding(3.9, STAY, [3.0] * 39, startpunt_label="Groeiperspectief"))
    assert geen.startswith("Geen van de 39 heeft veel vertrekgedachten")


def test_intentie_duiding_zonder_genoeg_vertrekscores_noemt_alleen_de_leesregel():
    t = _plain(_intentie_duiding(3.9, STAY, [7.0] * 9, startpunt_label="Groeiperspectief"))
    assert t == KERN + " " + SLOT


def test_intentie_duiding_ook_bij_een_aandachtspunt():
    assert KERN in _plain(_intentie_duiding(5.8, STAY, TO_VEEL, startpunt_label="Groeiperspectief"))


@pytest.mark.parametrize("avg_si, startpunt", [(7.0, "Groeiperspectief"), (None, "Groeiperspectief"),
                                               (3.9, None), (3.9, "")])
def test_intentie_duiding_zwijgt_als_er_niets_te_duiden_is(avg_si, startpunt):
    assert _intentie_duiding(avg_si, STAY, TO_VEEL, startpunt_label=startpunt) == ""


def test_intentie_duiding_claimt_geen_oorzaak_en_voorspelt_niets():
    t = _plain(_intentie_duiding(3.9, STAY, TO_VEEL, startpunt_label="Groeiperspectief")).lower()
    for fout in ("oorzaak", "komt door", "voorspel", "zullen vertrekken", "gaan vertrekken"):
        assert fout not in t
    assert not any(s in t for s in STREEPJES)


def test_behoud_pagina_twee_draagt_de_duiding_en_de_leidraad_verwijst_ernaar():
    data = _retention_met_secties(
        avg_si=3.9, intent_resp={"stay": STAY, "turnover": TO_VEEL, "engagement": [6.0] * 39})
    p2 = _page_two(render_retention_report_html(data))
    assert "hoe dringend behoud hier is" in _plain(p2)
    assert ("Gaat het over de blijfintentie, lees dan de regel onder de cijfers hierboven voor."
            in _plain(_rij(p2, "5-12 min")))


def test_behoud_met_sterke_blijfintentie_heeft_geen_duiding_en_geen_verwijzing():
    data = _retention_met_secties(
        avg_si=7.5, intent_resp={"stay": [8.0] * 39, "turnover": [2.0] * 39, "engagement": [6.0] * 39})
    p2 = _plain(_page_two(render_retention_report_html(data)))
    assert "hoe dringend behoud hier is" not in p2
    assert "lees dan de regel onder de cijfers" not in p2


def test_vertrek_krijgt_geen_intentieduiding():
    assert "hoe dringend behoud hier is" not in _plain(render_exit_report_html(_exit_met_toelichtingen()))
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k "intentie or duiding"
```
Verwacht: FAIL bij de import (`ImportError: cannot import name '_intentie_duiding'`).

- [ ] **Stap 3: `_intentie_duiding`**

In `backend/report_html.py`, direct onder de functie `_blijfintentie_kopzin`:

```python
# R1 (koude leesronde 24-9): de blijfintentie had sinds B1 een naam op pagina
# twee, maar geen duiding. Het MT las "25 van de 39 onder de 5" en vroeg: waar
# zit dat, en wat doen we ermee? Het rapport splitst blijf- en vertrekintentie
# niet per afdeling uit (het afdelingsblok toont het behoudssignaal en de
# onderwerpen), dus de eerlijke zin is: dit zegt hoe dringend, niet waar of
# waarom; daarom begint het gesprek bij het startpunt.
INTENTIE_DUIDING_KERN = (
    "Deze cijfers zeggen hoe dringend behoud hier is. Ze zeggen niet bij welke afdeling "
    "het speelt of waarom: dit rapport splitst ze niet per afdeling uit.")


def _intentie_duiding(avg_si: float | None, stay_scores: list[float],
                      to_scores: list[float], *, startpunt_label: str | None) -> str:
    """Eén alinea onder de cijfers op pagina twee (R1), alleen bij Loep Behoud.

    Leeg zonder blijfintentie, zonder startpunt (degraded: daar draagt
    _geen_factorprofiel_note het verhaal) of bij een relatief sterke
    blijfintentie (dan is er geen ontsporing om voor te zijn).

    De vertrekintentie staat erin zodra er minstens MIN_DISTRIBUTION_N losse
    scores zijn, dezelfde staffel als de spreidingsstrook op de
    behoudscontext; "veel vertrekgedachten" is daar de hoogste zone (vanaf
    ZONE_HIGH), met hetzelfde label.
    """
    if avg_si is None or not startpunt_label:
        return ""
    if _factor_label(avg_si) == "Relatief sterk":
        return ""
    delen: list[str] = []
    vals = [v for v in to_scores if v is not None]
    if len(vals) >= MIN_DISTRIBUTION_N:
        hoog = score_distribution(vals)["zones"][2]
        grens = f"{ZONE_HIGH:.1f}".replace(".", ",")
        if hoog == 0:
            delen.append("Geen van de " + str(len(vals)) + " heeft veel vertrekgedachten "
                         "(vertrekintentie vanaf " + grens + ").")
        else:
            delen.append(str(hoog) + " van de " + str(len(vals)) + " "
                         + _werkwoord(hoog, "heeft", "hebben")
                         + " veel vertrekgedachten (vertrekintentie vanaf " + grens + ").")
    delen.append(INTENTIE_DUIDING_KERN)
    delen.append("Daarom begint het gesprek bij " + startpunt_label + ": daar zie je waar het "
                 "wringt, en daar kan het MT zelf iets besluiten.")
    return '<p class="p02-duiding">' + _h(" ".join(delen)) + "</p>"
```

- [ ] **Stap 4: Leidraad rij 2**

In `_leidraad_block`: voeg aan de signatuur `intentie_duiding: bool = False` toe (na `has_werkvragen`), en vervang de rij
```python
        ("5-12 min", "Het beeld in één plaatje", f"Het cijferoverzicht (pagina {p(A['overzicht'])}) en {context} "
                                                 f"(pagina {p(A['context'])}). Vraag: verrast dit iemand?"),
```
door
```python
        ("5-12 min", "Het beeld in één plaatje", rij2),
```
met, boven `rijen = [`:
```python
    rij2 = (f"Het cijferoverzicht (pagina {p(A['overzicht'])}) en {context} "
            f"(pagina {p(A['context'])}). Vraag: verrast dit iemand?")
    if intentie_duiding:
        # R1: het moment waarop de vergadering ontspoorde. De regel onder de
        # cijfers op deze pagina is de zin die de HR-manager dan voorleest.
        rij2 += " Gaat het over de blijfintentie, lees dan de regel onder de cijfers hierboven voor."
```
In `_leidraad_html`: voeg `intentie_duiding: bool = False` toe aan de signatuur (na `has_werkvragen`) en geef hem door: `has_werkvragen=has_werkvragen, intentie_duiding=intentie_duiding)`.

- [ ] **Stap 5: De Behoud-renderer**

In `render_retention_report_html`, direct na de toewijzing van `_cijfers_html = _p02_cijfers_block([...])`:
```python
    # R1 (fixronde 24-9): de duiding van blijf- en vertrekintentie hangt direct
    # onder de cijfers. Zonder startpunt (degraded) niet.
    _to_scores = (data.get("intent_resp") or {}).get("turnover") or []
    _intentie_html = _intentie_duiding(
        avg_si, _stay_scores, _to_scores,
        startpunt_label=None if _geen_profiel else _raster_primary_label)
    _cijfers_html += _intentie_html
```
en in de aanroep van `_leidraad_html` in deze renderer: `geen_profiel=_geen_profiel, has_werkvragen=bool(_wq_block), intentie_duiding=bool(_intentie_html)),`.

- [ ] **Stap 6: CSS**

In `backend/report_css.py`, in het `#p02`-blok direct onder de regel `#p02 .sc-v { font-size: 18px; }`:
```css
#p02 .p02-duiding { font-size: 10px; line-height: 1.45; color: #374151; margin: -4px 0 12px; max-width: none; }
```
(Het bestand is een Python-string met `r"""`; de regel bevat geen accolade-interpolatie en geen backslash.)

- [ ] **Stap 7: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_p02_mtvel.py tests/test_report_p02_kernzin.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`.

- [ ] **Stap 8: Faalset, syntax-guard, commit**

Backend-faalset-commando en de syntax-guard: `GEEN_REGRESSIES` en `passed`.

```bash
git commit -F- -- backend/report_html.py backend/report_css.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(rapport): blijf- en vertrekintentie krijgen een duiding op pagina twee

Leesronde 24-9, R1: het zwaarste getal van het Behoud-rapport werd genoemd
maar niet geduid, en de vergadering ontspoorde op 'twee derde wil weg'. Eén
alinea onder de cijfers zegt wat het getal wel zegt (hoe dringend) en niet
(waar of waarom, het rapport splitst het niet per afdeling uit), noemt de
vertrekintentie, en zegt waarom het gesprek bij het startpunt begint. Alleen
bij een kwetsbare of wankele blijfintentie.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 4: Frictiescore uitleggen op pagina twee

**Leesronde V2:** "FRICTIESCORE 5.0/10 Gemengd vertrekbeeld" staat in de eerste minuut op tafel, nergens uitgelegd: wat meet het, en is hoog goed of slecht? Het is bovendien het enige getal in het rapport waar hoger slechter is. De frictiescore is het gewogen gemiddelde van (11 min de score) over de zes onderwerpen plus het risico op werkbeleving (`backend/products/exit/scoring.py::compute_exit_friction`); de band komt uit `RISK_HIGH` (7,0) en `RISK_MEDIUM` (4,5).

**Regel:** één alinea onder de cijfers van Loep Vertrek, in beide staten (met en zonder factorprofiel), zodra er een frictiescore is. Dezelfde stijl als de intentieduiding (`p02-duiding`).

**Files:**
- Modify: `backend/report_html.py` (`_frictie_duiding`, `render_exit_report_html`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 4: frictiescore uitleggen (V2) ─────────────────────────────────────

from backend.report_html import _frictie_duiding  # noqa: E402

FRICTIE = ("Frictiescore: de zes onderwerpen en de werkbeleving van de vertrekkers samen in één "
           "getal. Hier is hoger slechter, anders dan bij de andere scores in dit rapport: vanaf "
           "7,0 is de frictie sterk, onder 4,5 laag. Het getal zegt hoe breed het wringt, niet "
           "waar; dat laten de onderwerpen zien.")


def test_frictie_duiding_zegt_wat_het_meet_en_welke_kant_op():
    html = _frictie_duiding(5.0)
    assert html.startswith('<p class="p02-duiding">')
    assert _plain(html) == FRICTIE


def test_frictie_duiding_zwijgt_zonder_score():
    assert _frictie_duiding(None) == ""


@pytest.mark.parametrize("profile, n", [(True, 25), (False, 7)])
def test_vertrek_pagina_twee_legt_de_frictiescore_uit(profile, n):
    p2 = _plain(_page_two(render_exit_report_html(_fixture("exit", n=n, profile=profile))))
    assert FRICTIE in p2


def test_behoud_heeft_geen_frictieuitleg():
    assert "Frictiescore:" not in _plain(render_retention_report_html(_retention_met_secties()))
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k frictie
```
Verwacht: FAIL (`ImportError: cannot import name '_frictie_duiding'`).

- [ ] **Stap 3: `_frictie_duiding`**

In `backend/report_html.py`, direct onder `_intentie_duiding`:

```python
def _frictie_duiding(avg_risk: float | None) -> str:
    """V2 (koude leesronde 24-9): de frictiescore stond in de eerste minuut op
    tafel zonder uitleg. Het is ook het enige getal in dit rapport waar hoger
    slechter is (risicoschaal, zie _band_key). De grenzen komen uit
    scoring_config, dezelfde als de band in de cel ernaast. Leeg zonder score."""
    if avg_risk is None:
        return ""
    sterk = f"{RISK_HIGH:.1f}".replace(".", ",")
    laag = f"{RISK_MEDIUM:.1f}".replace(".", ",")
    zin = ("Frictiescore: de zes onderwerpen en de werkbeleving van de vertrekkers samen in "
           "één getal. Hier is hoger slechter, anders dan bij de andere scores in dit "
           "rapport: vanaf " + sterk + " is de frictie sterk, onder " + laag + " laag. Het "
           "getal zegt hoe breed het wringt, niet waar; dat laten de onderwerpen zien.")
    return '<p class="p02-duiding">' + _h(zin) + "</p>"
```

- [ ] **Stap 4: De Vertrek-renderer**

In `render_exit_report_html`, direct na de toewijzing van `_cijfers_html = _p02_cijfers_block([...])`:
```python
    # V2 (fixronde 24-9): de frictiescore krijgt uitleg onder de cijfers.
    _cijfers_html += _frictie_duiding(avg_risk)
```
Controleer dat `avg_risk` in deze renderer de frictiescore is (`avg_risk = data["avg_risk"]` bovenaan de functie); zo niet, gebruik de variabele die `_signal_cell` voedt.

- [ ] **Stap 5: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_p02_mtvel.py tests/test_report_degraded_page_two.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`.

- [ ] **Stap 6: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(rapport): frictiescore van Loep Vertrek krijgt uitleg op pagina twee

Leesronde 24-9, V2: de frictiescore stond in de eerste minuut op tafel zonder
te zeggen wat hij meet en of hoog goed of slecht is. Eén alinea onder de
cijfers: wat erin zit, dat hoger hier slechter is, de grenzen van de band, en
dat het getal zegt hoe breed het wringt maar niet waar.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 5: Namenregel voor Loep Vertrek

**Leesronde V1 en V5:** bij Loep Vertrek zitten managers aan tafel die weten wie er uit hun team vertrok. "Waar zie je dat bij jullie terug", "Beantwoord hem eerst voor je eigen team" en acht minuten losse vertrekverhalen voorlezen leiden naar "dat was vast Piet". Nergens staat dat je geen namen noemt. Dit is het enige punt waar het rapport iets kan veroorzaken wat het de respondenten heeft beloofd te voorkomen.

**Regel:** één vaste zin, `NAMENREGEL_VERTREK`, op drie plekken: onder de inleiding van het werkvragenblok, in de voetregel van de leidraad, en bij de open antwoorden (samen met een vraag voor dat slot). Rij 4 van de leidraad krijgt bij Loep Vertrek, als die naar de open antwoorden wijst, de vraag erbij. Alleen Loep Vertrek; Loep Behoud gaat over wie er nog werkt. **De 72 vertaalvragen en de aansturingshint zijn goedgekeurde content en blijven ongewijzigd**; zie "Wat Lars moet beslissen" voor het tijdsanker.

**Files:**
- Modify: `backend/report_html.py` (`NAMENREGEL_VERTREK`, `TOELICHTINGEN_VRAAG_VERTREK`, `TOELICHTINGEN_REGEL_VERTREK_HTML`, `_leidraad_block`, `_werkvragen_block`, `render_exit_report_html`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 5: namenregel Loep Vertrek (V1, V5) ────────────────────────────────

from backend.report_html import (  # noqa: E402
    NAMENREGEL_VERTREK,
    TOELICHTINGEN_VRAAG_VERTREK,
    _werkvragen_block,
)
from tests.test_report_priority_render import DIRECTION, RANKED  # noqa: E402


def test_namenregel_tekst():
    assert NAMENREGEL_VERTREK == ("Praat over hoe het werkt, niet over wie er vertrok. Valt er een "
                                  "naam, ga dan terug naar de vraag.")
    assert TOELICHTINGEN_VRAAG_VERTREK == ("Lees ze als patroon: wat komt terug in meer dan één "
                                           "antwoord? Raad niet wie wat schreef.")


def test_werkvragen_vertrek_dragen_de_namenregel_behoud_niet():
    assert NAMENREGEL_VERTREK in _plain(_werkvragen_block(RANKED, {}, DIRECTION, "exit"))
    assert NAMENREGEL_VERTREK not in _plain(_werkvragen_block(RANKED, {}, DIRECTION, "retention"))


def test_leidraad_vertrek_draagt_de_namenregel_en_de_vraag_bij_de_toelichtingen():
    tekst = _plain(_leidraad_block("exit", has_segments=False, has_quotes=True,
                                   has_deepening=True, has_werkvragen=True))
    assert NAMENREGEL_VERTREK in tekst
    assert "Vraag: wat komt terug in meer dan één antwoord?" in tekst


def test_leidraad_behoud_heeft_geen_namenregel():
    tekst = _plain(_leidraad_block("retention", has_segments=False, has_quotes=True,
                                   has_deepening=True, has_werkvragen=True))
    assert NAMENREGEL_VERTREK not in tekst
    assert "wat komt terug in meer dan één antwoord" not in tekst


def test_open_antwoorden_vertrek_dragen_vraag_en_namenregel():
    body = _body(render_exit_report_html(_exit_met_toelichtingen()))
    blok = body[body.index('id="' + LEIDRAAD_ANKERS["toelichtingen"] + '"'):]
    blok = _plain(blok[:blok.index("Toelichting 0")])
    assert TOELICHTINGEN_VRAAG_VERTREK + " " + NAMENREGEL_VERTREK in blok


def test_open_antwoorden_behoud_zonder_namenregel():
    assert NAMENREGEL_VERTREK not in _plain(render_retention_report_html(_retention_met_secties()))
```

Controleer bij het schrijven dat de open teksten in de gerenderde pagina letterlijk als "Toelichting 0" staan (de anonimisering laat ze ongemoeid); staat er een andere vorm, zoek dan het begin van de eerste quote op zoals `_themed_quotes` hem rendert.

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k "namenregel or open_antwoorden"
```
Verwacht: FAIL (`ImportError: cannot import name 'NAMENREGEL_VERTREK'`).

- [ ] **Stap 3: Constanten**

In `backend/report_html.py`, direct onder de dict `LEIDRAAD_ANKERS`:

```python
# V1/V5 (koude leesronde 24-9): bij Loep Vertrek zitten er managers aan tafel
# die weten wie er uit hun team vertrok. De werkvragen ("waar zie je dat bij
# jullie terug") en de open antwoorden sturen dan naar personen, en nergens
# stond dat je geen namen noemt. Eén vaste regel op drie plekken: bij de
# werkvragen, in de leidraad en bij de open antwoorden. Loep Behoud heeft hem
# niet nodig: daar gaat het gesprek over wie er nog werkt.
NAMENREGEL_VERTREK = ("Praat over hoe het werkt, niet over wie er vertrok. Valt er een naam, "
                      "ga dan terug naar de vraag.")
TOELICHTINGEN_VRAAG_VERTREK = ("Lees ze als patroon: wat komt terug in meer dan één antwoord? "
                               "Raad niet wie wat schreef.")
TOELICHTINGEN_REGEL_VERTREK_HTML = ('<p class="trustline">'
                                    + _h(TOELICHTINGEN_VRAAG_VERTREK + " " + NAMENREGEL_VERTREK)
                                    + "</p>")
```
(`_h` staat hoger in het bestand dan `LEIDRAAD_ANKERS`; controleer dat met `grep -n "^def _h(\|^LEIDRAAD_ANKERS" backend/report_html.py`.)

- [ ] **Stap 4: Leidraad**

In `_leidraad_block`, vervang:
```python
    elif has_quotes:
        rij4 = ("Wat mensen zelf schreven", f"De open toelichtingen, ongefilterd (pagina {p(A['toelichtingen'])}).")
```
door:
```python
    elif has_quotes:
        # V5: bij Loep Vertrek krijgt dit slot een vraag, anders lees je acht
        # minuten losse vertrekverhalen voor aan wie de vertrekkers kende.
        vraag = " Vraag: wat komt terug in meer dan één antwoord?" if scan_type == "exit" else ""
        rij4 = ("Wat mensen zelf schreven",
                f"De open toelichtingen, ongefilterd (pagina {p(A['toelichtingen'])})." + vraag)
```
Vervang de return van `_leidraad_block`:
```python
    return (f'<div class="leidraad"><div class="leidraad-title">Zo leid je dit gesprek in 45 minuten</div>'
            f'<table>{trs}</table>'
            f'<p class="trustline" style="margin-top:6px;">Dit rapport is een groepsbeeld van de organisatie, '
            f'geen beoordeling van personen of afdelingen.</p></div>')
```
door:
```python
    voet = ("Dit rapport is een groepsbeeld van de organisatie, geen beoordeling van personen "
            "of afdelingen.")
    if scan_type == "exit":
        voet += " " + NAMENREGEL_VERTREK
    return (f'<div class="leidraad"><div class="leidraad-title">Zo leid je dit gesprek in 45 minuten</div>'
            f'<table>{trs}</table>'
            f'<p class="trustline" style="margin-top:6px;">{_h(voet)}</p></div>')
```

- [ ] **Stap 5: Werkvragen**

In `_werkvragen_block`, vervang de return:
```python
    return (f'<div class="wq-block" id="{LEIDRAAD_ANKERS["werkvragen"]}">'
            f'<span class="eyebrow">{WERKVRAGEN_EYEBROW}</span>'
            f'<p class="dir-intro">{WERKVRAGEN_INTRO}</p>'
            f'<table class="dir-grid wq-grid"><tr>{cards}</tr></table></div>')
```
door:
```python
    # V1 (fixronde 24-9): de namenregel direct onder de inleiding, bij Loep Vertrek.
    namenregel = ('<p class="dir-intro">' + _h(NAMENREGEL_VERTREK) + "</p>"
                  if scan_type == "exit" else "")
    return ('<div class="wq-block" id="' + LEIDRAAD_ANKERS["werkvragen"] + '">'
            + '<span class="eyebrow">' + WERKVRAGEN_EYEBROW + "</span>"
            + '<p class="dir-intro">' + WERKVRAGEN_INTRO + "</p>"
            + namenregel
            + '<table class="dir-grid wq-grid"><tr>' + cards + "</tr></table></div>")
```
(Concatenatie in plaats van een f-string: de oude regel zette `"werkvragen"` binnen `f'...'`; dat is 3.11-veilig, maar de nieuwe regel met `namenregel` erbij blijft zo leesbaar en zonder geneste aanhalingstekens.)

- [ ] **Stap 6: Open antwoorden bij Loep Vertrek**

In `render_exit_report_html`, in het blok onder `# ── Open toelichtingen ──`, vervang:
```python
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, "exit", top_fkeys, n)}
```
door:
```python
  {_intro("open_toelichtingen")}
  {TOELICHTINGEN_REGEL_VERTREK_HTML}
  {_themed_quotes(texts, "exit", top_fkeys, n)}
```
Alleen in de Vertrek-renderer; de Behoud- en Start-renderer blijven zoals ze zijn.

- [ ] **Stap 7: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_werkvragen.py tests/test_report_p02_mtvel.py tests/test_report_besluitpagina.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`. Pint een bestaande test de oude voetregel van de leidraad letterlijk voor Loep Vertrek (`grep -rn "geen beoordeling van personen of afdelingen" tests`), werk die dan bij met `in` in plaats van `==`, niet door de nieuwe zin te schrappen.

- [ ] **Stap 8: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(rapport): namenregel voor Loep Vertrek bij werkvragen, leidraad en open antwoorden

Leesronde 24-9, V1/V5: aan tafel zitten managers die weten wie er vertrok, en
nergens stond dat je geen namen noemt. Eén vaste regel op drie plekken, plus
een vraag bij de open antwoorden ('wat komt terug in meer dan één
antwoord?'). De goedgekeurde vertaalvragen blijven ongewijzigd.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 6: Uitstroomperiode in de meetgegevens

**Leesronde V8:** de werkvragen vragen "Stond dat er een jaar geleden ook?" en "toen de vertrekkers er nog werkten", maar het rapport geeft alleen de periode waarin de vragenlijst openstond, niet wanneer deze mensen vertrokken. De datalaag kent `respondents.exit_month` (`YYYY-MM`), maar alleen bij een import met metadata; in de self-send-flow (de enige die nu live is) is hij altijd leeg. Het rapport noemt de periode als hij bekend is en zegt het hardop als hij dat niet is. Niets verzinnen.

**Regel:**
- Minstens `MIN_SEGMENT_N` (5) vertrekmaanden bekend: een regel onder de meetgegevens, "Uitstroomperiode: vertrokken tussen maart 2025 en februari 2026." (of "vertrokken in maart 2026." bij één maand), met "(bij 30 van de 39 vastgelegd)" als niet iedereen er een heeft. De grens van 5 is dezelfde als voor een afdeling: bij minder is de vroegste of laatste maand één persoon.
- 1 tot 4 bekend: in "Niet in dit rapport" de tekst "de maand van vertrek (bij 3 van de 12 vastgelegd, te weinig om een periode te noemen)".
- Geen bekend: in "Niet in dit rapport" de tekst "de maand van vertrek (niet vastgelegd; de meetperiode hierboven is de periode waarin de vragenlijst openstond)".
- Een waarde die niet de vorm `YYYY-MM` heeft, wordt in `build_report_data` genegeerd met een waarschuwing in het log (het schema dwingt de vorm af; dit vangt alleen oude rijen).

**Files:**
- Modify: `backend/report_html.py` (`import re`, `_EXIT_MONTH_RE`, `build_report_data`, `_maand_nl`, `_uitstroomperiode`, `_responsbasis`, `render_exit_report_html`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 6: uitstroomperiode (V8) ───────────────────────────────────────────

from sqlalchemy.orm import Session  # noqa: E402

from backend.models import Campaign, Organization, Respondent, SurveyResponse  # noqa: E402
from backend.report_html import _responsbasis, _uitstroomperiode, build_report_data  # noqa: E402


def test_uitstroomperiode_zonder_maanden():
    assert _uitstroomperiode([], 12) == (
        None, "de maand van vertrek (niet vastgelegd; de meetperiode hierboven is de periode "
              "waarin de vragenlijst openstond)")
    assert _uitstroomperiode(None, 12)[0] is None


def test_uitstroomperiode_te_weinig_bekend():
    assert _uitstroomperiode(["2025-03", "2025-04", "2025-06"], 12) == (
        None, "de maand van vertrek (bij 3 van de 12 vastgelegd, te weinig om een periode te noemen)")


def test_uitstroomperiode_spreiding_en_deels_bekend():
    maanden = ["2026-02", "2025-03", "2025-07", "2025-11", "2025-09"]
    assert _uitstroomperiode(maanden, 12) == (
        "Uitstroomperiode: vertrokken tussen maart 2025 en februari 2026 (bij 5 van de 12 vastgelegd).",
        None)


def test_uitstroomperiode_een_maand_iedereen_bekend():
    assert _uitstroomperiode(["2026-03"] * 5, 5) == (
        "Uitstroomperiode: vertrokken in maart 2026.", None)


def test_responsbasis_toont_uitstroomregel_en_ontbrekende_maand():
    met = _plain(_responsbasis(invited=20, completed=12, period="Wave 1",
                               population="Uitgestroomde medewerkers", segment_available=True,
                               uitstroom_regel="Uitstroomperiode: vertrokken in maart 2026."))
    assert "Uitstroomperiode: vertrokken in maart 2026." in met
    zonder = _plain(_responsbasis(invited=20, completed=12, period="Wave 1",
                                  population="Uitgestroomde medewerkers", segment_available=True,
                                  extra_ontbreekt=["de maand van vertrek (niet vastgelegd)"]))
    assert "Niet in dit rapport: de maand van vertrek (niet vastgelegd)." in zonder


def test_vertrek_zonder_maanden_zegt_het_op_pagina_twee():
    p2 = _plain(_page_two(render_exit_report_html(_fixture("exit", n=25, profile=True))))
    assert "de maand van vertrek (niet vastgelegd" in p2


def test_vertrek_met_maanden_noemt_de_periode_op_pagina_twee():
    data = _fixture("exit", n=25, profile=True)
    data["exit_months"] = ["2025-03"] * 10 + ["2026-02"] * 10
    p2 = _plain(_page_two(render_exit_report_html(data)))
    assert "Uitstroomperiode: vertrokken tussen maart 2025 en februari 2026 (bij 20 van de 25 vastgelegd)." in p2


def _exit_met_maanden(db: Session, maanden: list[str | None], scan_type: str = "exit") -> str:
    org = Organization(name="TestOrg", slug="testorg-v8", contact_email="hr@test.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type=scan_type, delivery_mode="baseline")
    db.add(camp)
    db.flush()
    for maand in maanden:
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker",
                       completed=True, exit_month=maand)
        db.add(r)
        db.add(SurveyResponse(respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                              pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                              risk_score=5.5, risk_band="MIDDEN", exit_reason_code="P1"))
    db.commit()
    return camp.id


def test_build_report_data_levert_geldige_vertrekmaanden(db_session: Session):
    cid = _exit_met_maanden(db_session, ["2025-03", "2025-13", None, "2026-02", "maart"])
    assert sorted(build_report_data(cid, db_session)["exit_months"]) == ["2025-03", "2026-02"]


def test_build_report_data_behoud_heeft_geen_vertrekmaanden(db_session: Session):
    cid = _exit_met_maanden(db_session, ["2025-03"], scan_type="retention")
    assert build_report_data(cid, db_session)["exit_months"] == []
```
(`db_session` is de fixture uit `tests/conftest.py`: in-memory SQLite, nooit productie.)

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k "uitstroom or vertrekmaanden or maanden or responsbasis"
```
Verwacht: FAIL (`ImportError: cannot import name '_uitstroomperiode'`).

- [ ] **Stap 3: Datalaag**

In `backend/report_html.py`: voeg `import re` toe onder `import math` bovenaan. Voeg onder `logger = logging.getLogger(__name__)` toe:
```python
# De vorm van respondents.exit_month (schemas.py dwingt hem af bij import).
_EXIT_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
```
In `build_report_data`, direct onder de regel `exit_r_given = sum(exit_r_cnt.values())`:
```python
    # V8 (fixronde 24-9): de maand van vertrek, als die bij de respondent is
    # vastgelegd (import met metadata). In de self-send-flow bestaat hij niet;
    # _uitstroomperiode zegt dat dan hardop.
    exit_months: list[str] = []
    if scan_type == "exit":
        for r in completed:
            if not r.exit_month:
                continue
            if _EXIT_MONTH_RE.match(r.exit_month):
                exit_months.append(r.exit_month)
            else:
                logger.warning("exit_month met onbekende vorm genegeerd (campagne %s)", campaign_id)
```
en voeg in de `return dict(...)` direct na `exit_r_counts=dict(exit_r_cnt),` toe:
```python
        exit_months=exit_months,
```

- [ ] **Stap 4: `_maand_nl` en `_uitstroomperiode`**

Direct onder de functie `_kalenderdag`:
```python
def _maand_nl(jaar_maand: str) -> str:
    """"2025-03" -> "maart 2025"."""
    jaar, maand = jaar_maand.split("-")
    return _MAANDEN_NL[int(maand) - 1] + " " + jaar


def _uitstroomperiode(exit_months: list[str] | None, n: int) -> tuple[str | None, str | None]:
    """(regel onder de meetgegevens, tekst voor 'Niet in dit rapport') voor Loep Vertrek (V8).

    Precies één van de twee is gevuld. Een periode pas vanaf MIN_SEGMENT_N
    bekende maanden: de vroegste en de laatste maand zijn elk van één persoon,
    en bij minder bekende maanden ligt die persoon te dichtbij. Zelfde grens
    als een afdeling apart tonen.
    """
    maanden = sorted(m for m in (exit_months or []) if m)
    bekend = len(maanden)
    if bekend == 0:
        return None, ("de maand van vertrek (niet vastgelegd; de meetperiode hierboven is de "
                      "periode waarin de vragenlijst openstond)")
    if bekend < MIN_SEGMENT_N:
        return None, ("de maand van vertrek (bij " + str(bekend) + " van de " + str(n)
                      + " vastgelegd, te weinig om een periode te noemen)")
    eerste, laatste = _maand_nl(maanden[0]), _maand_nl(maanden[-1])
    regel = ("Uitstroomperiode: vertrokken in " + eerste if eerste == laatste
             else "Uitstroomperiode: vertrokken tussen " + eerste + " en " + laatste)
    if bekend < n:
        regel += " (bij " + str(bekend) + " van de " + str(n) + " vastgelegd)"
    return regel + ".", None
```

- [ ] **Stap 5: `_responsbasis`**

Voeg twee keyword-parameters toe aan de signatuur, na `period_conflict: bool = False`:
```python
                  uitstroom_regel: str = "", extra_ontbreekt: list[str] | None = None) -> str:
```
Vervang:
```python
    if not enps_available:
        ontbreekt.append("werkgeversaanbeveling (eNPS)")
```
door:
```python
    if not enps_available:
        ontbreekt.append("werkgeversaanbeveling (eNPS)")
    ontbreekt.extend(extra_ontbreekt or [])
```
en direct daaronder, na de toewijzing van `ontbreekt_html`:
```python
    uitstroom_html = (f'<p class="trustline" style="margin-top:4px;">{_h(uitstroom_regel)}</p>'
                      if uitstroom_regel else "")
```
en in `body` de laatste regel `  {caution_html}{conflict_html}{ontbreekt_html}"""` wordt `  {caution_html}{conflict_html}{uitstroom_html}{ontbreekt_html}"""`. Voeg aan de docstring toe: "`uitstroom_regel` en `extra_ontbreekt` (fixronde 24-9, V8) komen van `_uitstroomperiode`; alleen Loep Vertrek geeft ze mee."

- [ ] **Stap 6: De Vertrek-renderer**

In `render_exit_report_html`, direct boven `_responsbasis_band = _responsbasis(`:
```python
    # V8 (fixronde 24-9): wanneer deze mensen vertrokken, of hardop dat dat niet
    # is vastgelegd. Oude fixtures zonder exit_months tellen als "niet vastgelegd".
    _uit_regel, _uit_ontbreekt = _uitstroomperiode(data.get("exit_months"), data["n_completed"])
```
en voeg in de aanroep van `_responsbasis` na `period_conflict=bool(data.get("period_dates_conflict")),` toe:
```python
        uitstroom_regel=_uit_regel or "",
        extra_ontbreekt=[_uit_ontbreekt] if _uit_ontbreekt else None,
```

- [ ] **Stap 7: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_p02_mtvel.py tests/test_report_degraded_page_two.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`. Pint een bestaande test de regel "Niet in dit rapport: ..." van een Vertrek-rapport letterlijk (`grep -rn "Niet in dit rapport" tests`), werk hem dan bij met de extra tekst; verzwak de assertie niet.

- [ ] **Stap 8: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(rapport): uitstroomperiode van Loep Vertrek in de meetgegevens

Leesronde 24-9, V8: de werkvragen toetsen aan 'een jaar geleden', maar het
rapport gaf alleen de periode waarin de vragenlijst openstond. Is de maand
van vertrek bij minstens vijf mensen vastgelegd, dan staat de periode onder
de meetgegevens; anders zegt 'Niet in dit rapport' dat hij ontbreekt. In de
self-send-flow is hij altijd leeg; niets verzonnen.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---


## Taak 7: Tussenmeting pagina twee in het productie-image, met vaste hefbomen

Taak 2 tot en met 6 maken pagina twee langer: een duidingsalinea (Behoud of Vertrek), een langere rij 5, een zin in rij 2 (Behoud), de namenregel in de leidraadvoet en een extra regel in de meetgegevens (Vertrek). Pagina twee moet één A4 blijven (`p02-op-een-a4`). Dat is alleen in het productie-image te meten.

**Files:**
- Modify (alleen als een hefboom nodig is): `backend/report_css.py`
- Geen nieuwe tests; de meting is de gate.

- [ ] **Stap 1: Voorbeeld-HTML tijdelijk regenereren**

`render_in_image.py` rendert ook `docs/examples/*.html`; die zijn nog van vóór deze ronde. Regenereer ze voor de meting en zet ze daarna terug (ze worden in Taak 21 definitief opnieuw gemaakt en gecommit):

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
```
Verwacht: drie keer "Rapport opgeslagen (HTML)". De generator gebruikt een wegwerp-SQLite zodra `DATABASE_URL` geen SQLite is; hij raakt productie niet.

- [ ] **Stap 2: Meten**

Volg het vaste recept zonder selectie, met `| tee /c/Users/larsh/AppData/Local/Temp/loep-fixronde/meting-taak7.txt`.

Verwacht: 24 bestanden, `warnings=0 emdash=0`, `check=OK` behalve de drie bekende `paginavulling`-bevindingen van 01, 09 en 19 met dezelfde percentages als in de nulmeting. Vooral: **geen** `p02-op-een-a4`, `zijmarge` of `paginaverwijzing`.

- [ ] **Stap 3: Alleen bij een `p02-op-een-a4`-bevinding: hefbomen, in deze volgorde**

Pas één hefboom toe, meet opnieuw (alleen de falende bestanden als selectie is genoeg om te kijken, daarna nog één keer alles), en ga pas naar de volgende als het nog niet past. Elke hefboom is een regel in het `#p02`-blok van `backend/report_css.py`, direct onder de regel van `.p02-duiding` uit Taak 3.

Hefboom A, de duidingsalinea compacter:
```css
#p02 .p02-duiding { font-size: 9.5px; line-height: 1.4; margin: -6px 0 8px; }
```
Hefboom B, de leidraadregels dichter:
```css
#p02 .leidraad td { padding: 1px 6px 1px 0; line-height: 1.38; }
```
Hefboom C, het waarom-blok compacter:
```css
#p02 .why { padding: 10px 14px 8px; margin-bottom: 8px; }
```

Past het na hefboom C nog niet: **stop**. Schrap geen copy om ruimte te maken; meld in het verslag welke scenario's overlopen, met hoeveel (lees het met `$PY scripts/check_pdf_report.py <pdf> --regel p02-op-een-a4`), en leg het voor aan de hoofdsessie.

- [ ] **Stap 4: Voorbeeld-HTML terugzetten**

```bash
git checkout -- docs/examples frontend/public/examples
git status --short
```
Verwacht: alleen `backend/report_css.py` gewijzigd als je een hefboom gebruikte, anders niets.

- [ ] **Stap 5: Commit (alleen als er een hefboom is toegepast)**

```bash
git commit -F- -- backend/report_css.py <<'EOF'
style(rapport): pagina twee compacter zodat hij met de nieuwe duiding op één A4 past

Gemeten in het productie-image (WeasyPrint 70.0) op 21 scenario's en drie
voorbeelden na de fixronde van 24-9.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
Noteer in het verslag welke hefbomen nodig waren (of geen).

---

## Taak 8: Brugzin bij het tweede punt en een afdelingsafspraak op de besluitpagina

**Leesronde R5:** het afdelingsblok zegt "Vraag de afdeling zelf naar de toelichting", maar die afspraak heeft geen plek op de besluitpagina. En als het laagste onderwerp van de aangewezen afdeling hetzelfde is als het tweede punt organisatiebreed (werkdruk bij Operations in het voorbeeld), zegt het rapport dat niet: de HR-manager moet het verband zelf leggen.

**Wat verandert:**
- `_brugzin` krijgt `tweede_key`. Is het onderwerp van de afdeling zwaar (kwetsbaar of aandachtspunt, de bestaande regel) én gelijk aan het tweede punt, dan luidt de zin: "Organisatiebreed begint het gesprek bij [X]. Bij [afdeling] springt [Y] eruit ([score]); dat is ook het tweede punt organisatiebreed, dus neem [afdeling] daarin mee." In alle andere gevallen blijft de zin precies zoals hij was.
- De besluitpagina krijgt een blok "Afspraak per afdeling" zodra het rapport een afdeling aanwijst: voorgedrukt "[afdeling]: [onderwerp]" (of alleen de afdeling als er geen onderwerp te noemen is), één lijn, en de hint "Het rapport toont de toelichtingen alleen voor de hele organisatie. Wat vragen jullie deze afdeling zelf, wie doet dat, en wanneer?". Valt het onderwerp samen met het tweede punt, dan staat daarvoor "Dit onderwerp is ook het tweede punt; neem de afdeling daarin mee.".
- Geen dashboardveld (geen migratie): het blok is met de pen in te vullen; dat staat in "Wat Lars moet beslissen".

**Files:**
- Modify: `backend/report_html.py` (`_brugzin`, `_besluit_afdeling`, `_besluit_page`, `render_exit_report_html`, `render_retention_report_html`, constanten `BESLUIT_AFDELING_*`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 8: brugzin bij het tweede punt, afdelingsafspraak (R5) ─────────────

from backend.report_html import (  # noqa: E402
    BESLUIT_AFDELING_HINT,
    BESLUIT_AFDELING_LABEL,
    BESLUIT_AFDELING_SAMEN,
    _besluit_afdeling,
    _brugzin,
    _fl,
)

SEG_OPS = {"department": "Operations", "score": 6.0, "n": 17, "invited": 21,
           "low_fk": "workload", "low_avg": 4.9, "rest_lager": False}


def test_brugzin_noemt_het_tweede_punt_als_het_hetzelfde_onderwerp_is():
    zin = _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention", tweede_key="workload")
    assert zin == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Bij Operations springt "
                   + _fl("workload", "retention") + " eruit (4.9/10); dat is ook het tweede punt "
                   "organisatiebreed, dus neem Operations daarin mee.")


def test_brugzin_zonder_samenval_blijft_zoals_hij_was():
    zonder = _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention", tweede_key="leadership")
    assert zonder.endswith("bespreek dat voor die afdeling na het startpunt.")
    assert _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention") == zonder


def test_brugzin_bij_een_relatief_sterk_onderwerp_blijft_neutraal():
    sterk = dict(SEG_OPS, low_avg=6.8)
    zin = _brugzin("growth", "Groeiperspectief", sterk, "retention", tweede_key="workload")
    assert "tweede punt" not in zin
    assert zin.endswith("relatief sterk.")


def test_besluit_afdeling():
    assert _besluit_afdeling(None, "retention", "workload") is None
    assert _besluit_afdeling(SEG_OPS, "retention", "workload") == {
        "department": "Operations", "topic": _fl("workload", "retention"), "samen_met_tweede": True}
    zonder_onderwerp = _besluit_afdeling(dict(SEG_OPS, low_fk=None, low_avg=None), "retention", None)
    assert zonder_onderwerp == {"department": "Operations", "topic": None, "samen_met_tweede": False}


def _besluit(**kw) -> str:
    basis = dict(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                 startpunt_label="Groeiperspectief", tweede_label="Werkdruk en herstelruimte",
                 review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.", heeft_werkvragen=True)
    basis.update(kw)
    return _besluit_page(**basis)


def test_besluitpagina_heeft_een_regel_voor_de_afdelingsafspraak():
    t = _plain(_besluit(afdeling={"department": "Operations", "topic": "Werkdruk en herstelruimte",
                                  "samen_met_tweede": True}))
    assert BESLUIT_AFDELING_LABEL in t
    assert "Operations: Werkdruk en herstelruimte" in t
    assert BESLUIT_AFDELING_SAMEN + " " + BESLUIT_AFDELING_HINT in t


def test_besluitpagina_zonder_aangewezen_afdeling_heeft_geen_afdelingsblok():
    assert BESLUIT_AFDELING_LABEL not in _plain(_besluit())


def test_afdelingsblok_staat_voor_de_terugkoppeling():
    t = _plain(_besluit(afdeling={"department": "Operations", "topic": None, "samen_met_tweede": False}))
    assert t.index(BESLUIT_AFDELING_LABEL) < t.index("Terugkoppeling aan medewerkers")
    assert "Operations" in t and "Operations:" not in t
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k "brugzin or afdeling"
```
Verwacht: FAIL (`ImportError: cannot import name 'BESLUIT_AFDELING_HINT'`).

- [ ] **Stap 3: `_brugzin`**

Vervang de signatuur:
```python
def _brugzin(startpunt_key: str | None, startpunt_label: str, seg: dict | None,
             scan_type: str) -> str:
```
door:
```python
def _brugzin(startpunt_key: str | None, startpunt_label: str, seg: dict | None,
             scan_type: str, tweede_key: str | None = None) -> str:
```
Voeg aan de docstring toe: "Fixronde 24-9 (R5): valt het zware onderwerp van de afdeling samen met het tweede punt organisatiebreed (tweede_key), dan zegt de zin dat, zodat het MT de afdeling in dat punt meeneemt in plaats van er een apart gesprek van te maken. Alleen in de zware tak: de neutrale vorm boven de aandachtspuntgrens blijft ongewijzigd."

Vervang de zware, andere-onderwerp-tak:
```python
    if zwaar:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Bij {dept} springt "
                f"{low_lbl} eruit ({low_sc}); bespreek dat voor die afdeling na het startpunt.")
```
door:
```python
    if zwaar and seg["low_fk"] == tweede_key:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Bij {dept} springt "
                f"{low_lbl} eruit ({low_sc}); dat is ook het tweede punt organisatiebreed, dus "
                f"neem {dept} daarin mee.")
    if zwaar:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Bij {dept} springt "
                f"{low_lbl} eruit ({low_sc}); bespreek dat voor die afdeling na het startpunt.")
```

- [ ] **Stap 4: Besluitpagina**

Onder `BESLUIT_INGEKORT = (...)`:
```python
# R5 (koude leesronde 24-9): de afspraak uit het afdelingsblok ("vraag de
# afdeling zelf naar de toelichting") had geen plek op de besluitpagina.
BESLUIT_AFDELING_LABEL = "Afspraak per afdeling"
BESLUIT_AFDELING_HINT = ("Het rapport toont de toelichtingen alleen voor de hele organisatie. Wat "
                         "vragen jullie deze afdeling zelf, wie doet dat, en wanneer?")
BESLUIT_AFDELING_SAMEN = "Dit onderwerp is ook het tweede punt; neem de afdeling daarin mee."


def _besluit_afdeling(seg: dict | None, scan_type: str, tweede_key: str | None) -> dict | None:
    """De aangewezen afdeling voor de besluitpagina, of None.

    seg komt uit _segment_startpunt, dezelfde gate als de brugzin en het navy
    afdelingsblok: de drie kunnen niet uiteenlopen."""
    if not seg:
        return None
    fk = seg.get("low_fk")
    return {"department": seg["department"],
            "topic": _fl(fk, scan_type) if fk else None,
            "samen_met_tweede": bool(fk) and fk == tweede_key}
```
Voeg aan `_besluit_page` de keyword-parameter `afdeling: dict | None = None` toe (na `decision_unavailable: bool = False`), en direct boven de regel `ingekort = wat1_afgekapt or ...`:
```python
    if afdeling:
        vast = afdeling["department"] + (": " + afdeling["topic"] if afdeling.get("topic") else "")
        samen = BESLUIT_AFDELING_SAMEN + " " if afdeling.get("samen_met_tweede") else ""
        hint = samen + BESLUIT_AFDELING_HINT
        afdeling_html = ('<div class="bl-blok">'
                         + _bl_veld(BESLUIT_AFDELING_LABEL,
                                    '<div class="bl-vast">' + _h(vast) + "</div>" + _bl_lines(1),
                                    hint)
                         + "</div>")
    else:
        afdeling_html = ""
```
In de return-f-string, direct na het blok van het tweede punt (na de `</div>` van het `bl-blok` met `{_bl_veld(tweede_lbl, tweede)}`) en vóór het blok "Terugkoppeling aan medewerkers":
```python
  {afdeling_html}
```

- [ ] **Stap 5: Renderers**

In `render_exit_report_html`, vervang:
```python
    _brug = ("" if _geen_profiel else
             _brugzin(_raster_rows[0]["key"], _raster_primary_label, _seg_startpunt, "exit"))
```
door:
```python
    _tweede_key = next((r["key"] for r in _raster_rows if r["agenda_role"] == "tweede"), None)
    _brug = ("" if _geen_profiel else
             _brugzin(_raster_rows[0]["key"], _raster_primary_label, _seg_startpunt, "exit",
                      tweede_key=_tweede_key))
```
en voeg in de aanroep van `_besluit_page` in dezelfde renderer toe (na `decision_unavailable=...`):
```python
        afdeling=None if _geen_profiel else _besluit_afdeling(_seg_startpunt, "exit", _tweede_key),
```
Let op: de laatste bestaande regel van die aanroep eindigt op `)))`; zet de nieuwe regel ervóór en verplaats het sluithaakje, zodat de aanroep blijft compileren.

In `render_retention_report_html` hetzelfde, met `ST` in plaats van `"exit"`.

- [ ] **Stap 6: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_segment_startpunt.py -q -p no:cacheprovider
```
(Bestaat `tests/test_report_segment_startpunt.py` niet, zoek de bestaande brugzin-tests met `grep -rln "_brugzin" tests` en draai die.) Verwacht: alles `passed`.

- [ ] **Stap 7: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(rapport): afdeling koppelt aan het tweede punt en krijgt een regel op de besluitpagina

Leesronde 24-9, R5: de afspraak uit het afdelingsblok viel op de
besluitpagina weg, en dat werkdruk bij de afdeling en het tweede punt over
hetzelfde gaan, moest de HR-manager zelf zeggen. De brugzin zegt het nu, en
de besluitpagina heeft een regel 'Afspraak per afdeling'.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 9: Besluitpagina en dashboard: parkeerregel, succes per punt, terugkoppeling, besluitvraag

**Leesronde:** R4 (tweede punt zonder eigenaar en datum; "waaraan zien we" hoort bij geen punt), R8 en V4 (wat mag je terugkoppelen, en aan wie bij Vertrek), R15 (werkvraag "over 90 dagen" naast "45 tot 90 dagen").

**Wat verandert (geen migratie, zie "Besluit over de migratie"):**
- Onder "Wat precies" van het tweede punt de parkeerregel `BESLUIT_PARKEERREGEL`. Het tweede "Wat precies" krijgt twee lijnen in plaats van drie (ruimte voor de regel).
- `BESLUIT_SLOTLABEL` wordt "Waaraan zien we bij het startpunt dat het werkt".
- De hint onder "Terugkoppeling aan medewerkers" wordt per scan: Behoud en Vertrek zeggen wat je wel en niet deelt; Vertrek zegt ook aan wie. **Loep Start blijft ongewijzigd.**
- `BESLUITVRAAG` wordt "... en waaraan zie je op het vervolgmoment dat het werkt?" (één termijn: het vervolgmoment, met de richtlijn van 45 tot 90 dagen op de besluitpagina).
- Het dashboardblok "Besluit vastleggen" volgt de labels en hints (labelconsistentie, besluit plan 3b).

**Files:**
- Modify: `backend/report_html.py` (`BESLUIT_SLOTLABEL`, `BESLUIT_PARKEERREGEL`, `BESLUIT_TERUGKOPPELING`, `BESLUITVRAAG`, `_besluit_page`)
- Modify: `tests/test_report_leesronde_fixes.py`, lockstep `tests/test_report_besluitpagina.py`, `tests/test_report_werkvragen.py`
- Modify: `frontend/components/dashboard/decision-block.tsx`, `frontend/components/dashboard/decision-block.guard.test.ts`

- [ ] **Stap 1: Schrijf de falende tests (backend)**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 9: parkeerregel, succes per punt, terugkoppeling, besluitvraag ──────

from backend.report_html import (  # noqa: E402
    BESLUIT_PARKEERREGEL,
    BESLUIT_SLOTLABEL,
    BESLUIT_TERUGKOPPELING,
    BESLUITVRAAG,
)


def test_parkeerregel_tekst_en_plek():
    assert BESLUIT_PARKEERREGEL == (
        "Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het "
        "oppakt. Anders parkeren jullie dit punt: de eigenaar van het startpunt zet het op de "
        "agenda van het vervolgmoment.")
    t = _plain(_besluit())
    assert t.index("Tweede punt") < t.index(BESLUIT_PARKEERREGEL) < t.index("Terugkoppeling aan medewerkers")


def test_succes_hoort_bij_het_startpunt():
    assert BESLUIT_SLOTLABEL == "Waaraan zien we bij het startpunt dat het werkt"
    assert BESLUIT_SLOTLABEL in _plain(_besluit())


def test_terugkoppeling_per_scan():
    assert BESLUIT_TERUGKOPPELING["retention"] == (
        "Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen "
        "open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.")
    assert BESLUIT_TERUGKOPPELING["exit"] == (
        "Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met de "
        "vertrekredenen doet. Deel geen open antwoorden en geen uitkomsten van afdelingen met "
        "minder dan 10 antwoorden.")
    assert BESLUIT_TERUGKOPPELING["onboarding"] == "Je mensen vulden in; ze horen wat het MT ermee doet."
    for scan_type, hint in BESLUIT_TERUGKOPPELING.items():
        assert hint in _plain(_besluit(scan_type=scan_type, heeft_werkvragen=scan_type != "onboarding"))


def test_besluitvraag_noemt_het_vervolgmoment_niet_negentig_dagen():
    assert BESLUITVRAAG == ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je op het "
                            "vervolgmoment dat het werkt?")


def test_tweede_punt_heeft_twee_lijnen_voor_wat_precies():
    html = _besluit()
    blok = html[html.index("Tweede punt"):html.index("Terugkoppeling aan medewerkers")]
    assert blok.count('class="bl-line"') == 2
```

Lockstep:
- `tests/test_report_werkvragen.py`, `test_besluitvraag_heeft_de_vaste_vorm_uit_de_spec`: de tweede assertie wordt
  ```python
      assert BESLUITVRAAG == ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je "
                              "op het vervolgmoment dat het werkt?")
  ```
- `tests/test_report_besluitpagina.py`, `test_pagina_draagt_alle_velden_uit_de_spec`: vervang in de tupel `"Waaraan zien we dat het werkt"` door `"Waaraan zien we bij het startpunt dat het werkt"`.
- `tests/test_report_besluitpagina.py`, `test_ingevuld_terugkoppelingsplan_vervangt_de_tabel_door_tekst`: vervang `assert "Je mensen vulden in; ze horen wat het MT ermee doet." in t` door `assert BESLUIT_TERUGKOPPELING["retention"] in t` en voeg `BESLUIT_TERUGKOPPELING` toe aan de import bovenaan dat bestand.
- `tests/test_report_besluitpagina.py`, `test_pagina_is_een_eigen_vel_en_breekt_niet`: de telling `>= 12` blijft kloppen (3 + 1 + 1 + 1 + 2 + 3 + 1 = 12); pas het commentaar aan naar "3 wat precies, eigenaar, 2 datums, 2 wat precies tweede punt, 3 terugkoppeling, 1 succes".

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_werkvragen.py -q -p no:cacheprovider -k "parkeer or succes or terugkoppeling or besluitvraag or twee_lijnen or velden"
```
Verwacht: FAIL (`ImportError: cannot import name 'BESLUIT_PARKEERREGEL'`).

- [ ] **Stap 3: Constanten en `_besluit_page`**

In `backend/report_html.py`:

- `BESLUIT_SLOTLABEL = "Waaraan zien we dat het werkt"` wordt `BESLUIT_SLOTLABEL = "Waaraan zien we bij het startpunt dat het werkt"`, met in het commentaar erboven de extra regel "R4 (fixronde 24-9): het label hoort bij het startpunt; het tweede punt parkeert of noemt zelf wie het oppakt."
- `BESLUITVRAAG` wordt:
```python
BESLUITVRAAG = ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je op het "
                "vervolgmoment dat het werkt?")
```
  met erboven: `# R15 (fixronde 24-9): één termijn. "Over 90 dagen" stond naast de richtlijn "45 tot 90 dagen" op de besluitpagina.`
- Onder de constanten van de afdeling (Taak 8):
```python
# R4 (koude leesronde 24-9): het tweede punt had geen eigenaar en geen datum.
# Geen eigen kolommen (zie plan, "Besluit over de migratie"), wel een regel die
# het punt een eigenaar en een datum geeft: die van het startpunt.
BESLUIT_PARKEERREGEL = ("Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ "
                        "ook wie het oppakt. Anders parkeren jullie dit punt: de eigenaar van het "
                        "startpunt zet het op de agenda van het vervolgmoment.")
# R8/V4 (koude leesronde 24-9): wat mag je terugkoppelen, en bij Loep Vertrek:
# aan wie? De grens van de afdelingen is die van een afdeling met een score in
# het rapport (MIN_DISTRIBUTION_N). Loep Start valt buiten deze ronde.
BESLUIT_TERUGKOPPELING = {
    "retention": ("Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. "
                  "Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan "
                  + str(MIN_DISTRIBUTION_N) + " antwoorden."),
    "exit": ("Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met "
             "de vertrekredenen doet. Deel geen open antwoorden en geen uitkomsten van "
             "afdelingen met minder dan " + str(MIN_DISTRIBUTION_N) + " antwoorden."),
    "onboarding": "Je mensen vulden in; ze horen wat het MT ermee doet.",
}
```
In `_besluit_page`:
- vervang `        wat2 = _bl_waarde(None, 3)` door `        wat2 = _bl_waarde(None, 2)`;
- vervang `    {_bl_veld("Wat precies", wat2)}` door `    {_bl_veld("Wat precies", wat2, BESLUIT_PARKEERREGEL)}`;
- vervang `    <div class="bl-hint">Je mensen vulden in; ze horen wat het MT ermee doet.</div>` door `    <div class="bl-hint">{_h(BESLUIT_TERUGKOPPELING[scan_type])}</div>`.

Een onbekend `scan_type` geeft hier een `KeyError`; dat is bedoeld (Fail Loud), de drie renderers geven altijd een bekend type mee.

- [ ] **Stap 4: Draai de backendtests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_werkvragen.py tests/test_check_pdf_besluit.py -q -p no:cacheprovider
```
Verwacht: alles `passed`.

- [ ] **Stap 5: Dashboard (test eerst)**

In `frontend/components/dashboard/decision-block.guard.test.ts`: vervang in de labellijst `'Waaraan zien we dat het werkt',` door `'Waaraan zien we bij het startpunt dat het werkt',`, en voeg een test toe:

```ts
  it('volgt de besluitpagina: parkeerregel bij het tweede punt en wat je terugkoppelt', () => {
    expect(source).toContain(
      'Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het oppakt. Anders parkeren jullie dit punt: de eigenaar van het startpunt zet het op de agenda van het vervolgmoment.',
    )
    expect(source).toContain(
      'Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
    )
    expect(source).not.toContain('Alleen als jullie er een kiezen.')
    expect(source).not.toContain('Je mensen vulden in; ze horen wat het MT ermee doet.')
  })
```
Draai `cd frontend && npx vitest run components/dashboard/decision-block.guard.test.ts`; verwacht FAIL.

In `frontend/components/dashboard/decision-block.tsx`:
- `<ReadOnlyRow label="Waaraan zien we dat het werkt" value={decision.successCriterion} />` wordt `<ReadOnlyRow label="Waaraan zien we bij het startpunt dat het werkt" value={decision.successCriterion} />`;
- in het formulier wordt de labeltekst `Waaraan zien we dat het werkt` (boven `name="successCriterion"`) `Waaraan zien we bij het startpunt dat het werkt`;
- `<span className={hintClass}>Alleen als jullie er een kiezen.</span>` wordt
```tsx
            <span className={hintClass}>
              Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het oppakt. Anders
              parkeren jullie dit punt: de eigenaar van het startpunt zet het op de agenda van het vervolgmoment.
            </span>
```
  Let op: de guard-test zoekt de zin als één string; JSX voegt de twee regels met een spatie samen, maar de broncode bevat een regeleinde. Zet de hint daarom op één regel in de bron, of zet hem in een constante `const SECOND_POINT_HINT = '...'` bovenaan het bestand en render `{SECOND_POINT_HINT}`. Kies de constante; dan leest de guard-test hem letterlijk.
- de hint van de terugkoppeling wordt op dezelfde manier `const FEEDBACK_HINT = 'Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.'` en `<span className={hintClass}>{FEEDBACK_HINT}</span>`.

Het dashboard kent het scantype hier niet; de Behoud-tekst geldt ook voor Vertrek (de extra zin over "wie er nu werkt" staat alleen in de PDF). Noteer dat in het verslag.

Draai de guard-test opnieuw (PASS) en het frontend-faalset-commando (Taak 0 stap 4): `131` en `GEEN_REGRESSIES`.

- [ ] **Stap 6: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py tests/test_report_besluitpagina.py tests/test_report_werkvragen.py frontend/components/dashboard/decision-block.tsx frontend/components/dashboard/decision-block.guard.test.ts <<'EOF'
fix(besluit): parkeerregel voor het tweede punt, succes bij het startpunt, terugkoppelregel

Leesronde 24-9. R4: het tweede punt had geen eigenaar en geen datum; een
parkeerregel geeft het die van het startpunt, zonder migratie. 'Waaraan
zien we' hoort bij het startpunt. R8/V4: wat je wel en niet deelt, en bij
Loep Vertrek aan wie. R15: de besluitvraag noemt het vervolgmoment in plaats
van 90 dagen. Het dashboard volgt de labels.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 10: "Niets, dit zit hier goed" telt niet als richting

**Leesronde R6 en V9:** bij een verdeelde richting vraagt de vaste vertaalvraag "Met welke van de meest gekozen richtingen beginnen jullie". In de kaart erboven staat "Niets, dit zit hier goed" tussen de routes, met hetzelfde aantal als een echte route. Het MT leest "Niets" dan als een richting om mee te beginnen.

**Wat `translation_question` nu doet** (`backend/products/shared/deepening.py`): in de staat `divided` geeft hij de vaste verdeeld-zin zodra er minstens twee inhoudelijke routes gekozen zijn; de niets-optie telt daar al niet mee om te bepalen óf er een vraag komt, maar de zin zelf zegt niet welke routes "de meest gekozen" zijn, en de kaart sorteert de niets-optie ertussen.

**Wat verandert:** de verdeeld-zin blijft letterlijk staan (goedgekeurde content). Onder de vertaalvraag komt, alleen in de staat `divided`, één regel die de meest gekozen richtingen bij naam noemt (de inhoudelijke routes met de hoogste of de op één na hoogste telling) en de niets-optie apart weegt: "2 van de 8 kozen ‘Niets, dit zit hier goed’; dat is geen richting en telt hier niet mee." De Anders-optie telt ook niet mee als richting (geen opdrachtvorm). De tweede helft van R6 (zeggen dat de grootste richting en de grootste toelichting hetzelfde zeggen) wordt bewust **niet** gebouwd: daarvoor is een koppeling tussen toelichtingen en routes nodig die in september is geschrapt, en de zin zou een verband beweren dat het rapport niet heeft gemeten.

**Files:**
- Modify: `backend/report_html.py` (`_richtingen_weging`, `_werkvragen_block`)
- Modify: `tests/test_report_leesronde_fixes.py`

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_leesronde_fixes.py` toe:

```python
# ── Taak 10: niets telt niet als richting (R6, V9) ──────────────────────────

from backend.products.shared import deepening as dp  # noqa: E402
from backend.products.shared.deepening import direction_state  # noqa: E402
from backend.report_html import _richtingen_weging  # noqa: E402


def _agg(**counts):
    n = sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts,
            "other_texts": []}


def test_weging_noemt_de_meest_gekozen_richtingen_en_weegt_niets_apart():
    st = direction_state(_agg(wld_recovery=3, wld_peaks=2, wld_scope=2, wld_none=2, wld_other=1),
                         "workload", 5.8)
    assert st["state"] == "divided"
    teksten = dp.direction_option_texts("retention", "workload")
    # Tien beantwoorders: _telling zet vanaf MIN_DISTRIBUTION_N (10) het
    # percentage erachter. Volgorde: telling aflopend, dan sleutel (zoals ranked).
    assert _richtingen_weging(st, "retention", "workload") == (
        "De meest gekozen richtingen: ‘" + teksten["wld_recovery"] + "’: 3 van de 10 (30%); ‘"
        + teksten["wld_peaks"] + "’: 2 van de 10 (20%); ‘" + teksten["wld_scope"]
        + "’: 2 van de 10 (20%). 2 van de 10 (20%) kozen ‘Niets, dit zit hier goed’; dat is geen "
        "richting en telt hier niet mee.")


def test_weging_zonder_niets_heeft_geen_niets_zin():
    st = direction_state(_agg(wld_peaks=3, wld_scope=3, wld_planning=2), "workload", 5.8)
    zin = _richtingen_weging(st, "retention", "workload")
    assert "Niets" not in zin and zin.startswith("De meest gekozen richtingen: ")


def test_weging_vertrek_citeert_de_verleden_tijd():
    st = direction_state(_agg(wld_peaks=3, wld_scope=3, wld_none=2), "workload", 5.8)
    assert "‘Niets, dit zat hier goed’" in _richtingen_weging(st, "exit", "workload")


def test_weging_alleen_in_de_verdeeld_staat():
    duidelijk = direction_state(_agg(wld_peaks=6, wld_scope=1, wld_none=1), "workload", 5.8)
    assert duidelijk["state"] != "divided"
    assert _richtingen_weging(duidelijk, "retention", "workload") == ""


def test_werkvragen_tonen_de_weging_onder_de_verdeeld_zin(gevuld):
    html = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    kaart = _plain(html[html.index("Tweede punt: Werkdruk en herstelruimte"):])
    assert VARIANTEN["divided"]["retention"] in kaart
    assert "De meest gekozen richtingen: " in kaart
    assert "kozen ‘Niets, dit zit hier goed’; dat is geen richting en telt hier niet mee." in kaart
```
Importeer bovenaan deze sectie ook de fixture en de varianten uit de werkvragentests:
```python
from tests.test_report_werkvragen import VARIANTEN, gevuld  # noqa: E402,F401
```
(`gevuld` is een pytest-fixture; door hem te importeren is hij in dit bestand beschikbaar. `F401` omdat hij als argument wordt gebruikt, niet als naam.)

- [ ] **Stap 2: Draai de tests en zie ze falen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py -q -p no:cacheprovider -k weging
```
Verwacht: FAIL (`ImportError: cannot import name '_richtingen_weging'`).

- [ ] **Stap 3: `_richtingen_weging`**

In `backend/report_html.py`, direct boven `def _werkvragen_block`:

```python
def _richtingen_weging(st: dict, scan_type: str, factor_key: str) -> str:
    """R6/V9 (koude leesronde 24-9): in de staat `divided` zegt de vaste
    verdeeld-zin "de meest gekozen richtingen" zonder ze te noemen, en de kaart
    sorteert "Niets, dit zit hier goed" ertussen. Deze regel noemt de routes
    met de hoogste en de op één na hoogste telling, en weegt de niets-optie
    apart: die is geen richting. Anders telt ook niet mee (geen opdrachtvorm).

    Leeg buiten `divided`, en bij minder dan twee inhoudelijke routes (dan
    geeft translation_question ook geen verdeeld-zin). Een onbekende
    optiesleutel valt luid om, net als in _direction_card_cell.
    """
    if st["state"] != "divided":
        return ""
    n = st["n"]
    inhoud = [(k, c) for k, c in st["ranked"] if c > 0 and not k.endswith(("_none", "_other"))]
    if len(inhoud) < 2:
        return ""
    teksten = direction_option_texts(scan_type, factor_key)
    for k, _c in inhoud:
        if k not in teksten:
            raise KeyError("richtingen_weging: onbekende optiesleutel " + repr(k)
                           + " voor " + repr(factor_key) + " (" + scan_type + ")")
    hoogste = sorted({c for _k, c in inhoud}, reverse=True)[:2]
    meest = [(k, c) for k, c in inhoud if c in hoogste]
    zin = ("De meest gekozen richtingen: "
           + "; ".join("‘" + teksten[k] + "’: " + _telling(c, n) for k, c in meest) + ".")
    if st["none_key"] and st["none_n"]:
        zin += (" " + _telling(st["none_n"], n) + " "
                + _werkwoord(st["none_n"], "koos", "kozen") + " ‘" + teksten[st["none_key"]]
                + "’; dat is geen richting en telt hier niet mee.")
    return zin
```

- [ ] **Stap 4: In het werkvragenblok**

In `_werkvragen_block`, in de lus: zet in de `else`-tak van `if direction_agg:` ook `st = None` (dus `vertaal, staat, st = None, "too_few", None`), en vervang:
```python
        if vertaal:
            vertaal_cel = _h(vertaal)
            if fk == "leadership":
                vertaal_cel += f'<div class="wq-hint">{_h(WERKVRAGEN_AANSTURING_HINT)}</div>'
            rijen.append(("Vertalen", vertaal_cel))
```
door:
```python
        if vertaal:
            vertaal_cel = _h(vertaal)
            weging = _richtingen_weging(st, scan_type, fk) if st else ""
            if weging:
                vertaal_cel += '<div class="wq-hint">' + _h(weging) + "</div>"
            if fk == "leadership":
                vertaal_cel += f'<div class="wq-hint">{_h(WERKVRAGEN_AANSTURING_HINT)}</div>'
            rijen.append(("Vertalen", vertaal_cel))
```

- [ ] **Stap 5: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_report_leesronde_fixes.py tests/test_report_werkvragen.py tests/test_direction_content.py -q -p no:cacheprovider
```
(Bestaat `tests/test_direction_content.py` niet, laat hem weg.) Verwacht: alles `passed`.

- [ ] **Stap 6: Faalset, syntax-guard, commit**

```bash
git commit -F- -- backend/report_html.py tests/test_report_leesronde_fixes.py <<'EOF'
fix(werkvragen): 'Niets, dit zit hier goed' telt in een verdeelde richting niet als richting

Leesronde 24-9, R6/V9: bij een verdeelde richting vroeg de vertaalvraag naar
'de meest gekozen richtingen' terwijl de niets-optie ertussen stond. Onder de
vaste verdeeld-zin noemt een regel nu de meest gekozen routes bij naam en
weegt de niets-optie apart. De goedgekeurde verdeeld-zin blijft ongewijzigd.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 11: Besluitpagina met een maximaal besluit meten

Taak 8 en 9 zetten meer op de besluitpagina (afdelingsblok, parkeerregel). Plan 3b mat dat een besluit met elk tekstveld op de frontendlimiet (600 tekens) de pagina over een tweede vel duwde; `BESLUIT_TEKST_MAX = 300` loste dat op. Dat moet opnieuw gemeten worden, met een aangewezen afdeling (scenario 06) en voor Loep Vertrek (scenario 08).

**Files:**
- Create: `scripts/render_besluit_max.py`

- [ ] **Stap 1: Schrijf het script**

```python
"""Twee stresstest-renders met een maximaal ingevuld besluit (fixronde leesronde 24-9, Taak 11).

NIET-PRODUCTIE. Schrijft docs/stresstest/zz_besluitmax_<scenario>.html (gitignored);
scripts/render_in_image.py neemt die vanzelf mee. Elk tekstveld van het besluit
staat op de frontendlimiet van 600 tekens (DECISION_LIMITS in
frontend/lib/dashboard/campaign-decision.ts); de besluitpagina kort af op
BESLUIT_TEKST_MAX en meldt dat. Scenario 06 wijst een afdeling aan (blok
"Afspraak per afdeling"), scenario 08 is Loep Vertrek.

Gebruik: python scripts/render_besluit_max.py
"""
from __future__ import annotations

import shutil
import sys
import tempfile
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from scripts import stresstest_report as st  # noqa: E402

SCENARIOS = ("06", "08")
_ZIN = ("Elke leidinggevende voert voor de zomer met iedere medewerker een gesprek over de "
        "volgende stap in het werk, en legt de afspraak vast. ")


def _tekst(n: int = 600) -> str:
    return (_ZIN * (n // len(_ZIN) + 1))[:n]


BESLUIT = {
    "decided_at": date(2026, 4, 2),
    "primary_topic": "Werkdruk en herstelruimte",
    "primary_action": _tekst(),
    "owner": "Sanne de Vries",
    "follow_up_date": date(2026, 6, 15),
    "secondary_topic": "Groeiperspectief",
    "secondary_action": _tekst(),
    "feedback_plan": _tekst(),
    "success_criterion": _tekst(),
    "updated_at": datetime(2026, 4, 3, 9, 30, tzinfo=timezone.utc),
}


def main() -> int:
    doelmap = st.OUT_DIR
    echte = st.build_report_data

    def met_besluit(campaign_id, db):
        data = echte(campaign_id, db)
        data["decision"] = dict(BESLUIT)
        data["decision_unavailable"] = False
        return data

    with tempfile.TemporaryDirectory() as tmp:
        st.OUT_DIR = Path(tmp)
        st.build_report_data = met_besluit
        try:
            for num in SCENARIOS:
                sc = next(s for s in st.SCENARIOS if s.num == num)
                meta = st.run_scenario(sc)
                bron = Path(meta["html"])
                doelmap.mkdir(parents=True, exist_ok=True)
                doel = doelmap / ("zz_besluitmax_" + bron.name)
                shutil.copyfile(bron, doel)
                print("geschreven: " + str(doel.relative_to(ROOT)))
        finally:
            st.OUT_DIR = doelmap
            st.build_report_data = echte
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Stap 2: Draaien en meten**

```bash
$PY scripts/stresstest_report.py
$PY scripts/render_besluit_max.py
ls docs/stresstest/zz_besluitmax_*
```
Verwacht: `zz_besluitmax_06_...html` en `zz_besluitmax_08_...html`. Controleer vóór de render dat de besluitpagina van 06 het afdelingsblok draagt:
```bash
grep -c "Afspraak per afdeling" docs/stresstest/zz_besluitmax_06_*.html
```
Verwacht: `1`. Is het `0`, dan wijst scenario 06 in deze stand geen afdeling aan; kies dan een scenario dat dat wel doet (`grep -l "WAAR HET PER AFDELING BEGINT\|Waar het per afdeling begint" docs/stresstest/*.html`) en zet dat nummer in `SCENARIOS`.

Render met het vaste recept, met selectie `06 08 zz_` en `| tee /c/Users/larsh/AppData/Local/Temp/loep-fixronde/meting-taak11.txt`.

Verwacht: alle vier `check=OK`, in het bijzonder geen `besluit-op-een-a4` bij de twee `zz_`-bestanden. Bekijk één besluitpagina ook met het oog (`pymupdf`: `doc[i].get_pixmap(dpi=80).save(...)` op de pagina die met "Besluit van het MT" begint): de melding "Dit vel toont het begin van lange antwoorden" staat erop, de afdelingsregel ook.

- [ ] **Stap 3: Alleen bij een `besluit-op-een-a4`-bevinding**

Verlaag `BESLUIT_TEKST_MAX` van 300 naar 240 in `backend/report_html.py`, draai `$PY -m pytest tests/test_report_besluitpagina.py -q -p no:cacheprovider` (tests die 300 pinden gaan mee in lockstep, met een regel in het verslag) en meet opnieuw. Past het dan nog niet: **stop** en meld het; schrap geen blok van de besluitpagina zonder besluit van Lars. Een verlaagde grens gaat op de lijst "Wat Lars moet beslissen" (hij besliste over de 300).

- [ ] **Stap 4: Commit**

```bash
git add scripts/render_besluit_max.py
git commit -F- -- scripts/render_besluit_max.py <<'EOF'
chore(qa): render met een maximaal ingevuld besluit voor de besluitpaginameting

Twee stresstest-renders (06 met een aangewezen afdeling, 08 Loep Vertrek)
waarin elk besluitveld op de frontendlimiet staat. render_in_image.py neemt
ze vanzelf mee.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
(Als stap 3 nodig was: `backend/report_html.py` en de bijgewerkte tests in dezelfde commit, en de commitboodschap zegt het.)

---


## Taak 12: Prijsgrens "Minder dan 150 medewerkers"

**Besluit Lars 24-9:** "Tot 150 medewerkers" en "150 tot 400 medewerkers" lazen allebei alsof 150 erin valt. De onderste trede heet "Minder dan 150 medewerkers"; 150 valt in de trede van €4.500. Eén bron: `frontend/lib/pricing.ts`. Alle weergaven (tarievensectie op `/producten`, de prijsvraag in de FAQ, de `OfferCatalog`-JSON-LD) lezen het label daaruit; `public/llms.txt` is statisch en gaat in lockstep, bewaakt door `lib/site-ronde-besluit-a.guard.test.ts` (die zoekt `tier.label.toLowerCase()` in `llms.txt`).

**Files:**
- Modify: `frontend/lib/pricing.ts`, `frontend/lib/pricing.test.ts`, `frontend/public/llms.txt`, `frontend/lib/producten-pricing.test.ts` (alleen commentaar)

- [ ] **Stap 1: Test eerst**

In `frontend/lib/pricing.test.ts`, vervang in `heeft precies de drie treden uit het besluit, in oplopende volgorde` de eerste rij `['Tot 150 medewerkers', 3500, 950],` door `['Minder dan 150 medewerkers', 3500, 950],`, en voeg in dezelfde `describe` toe:

```ts
  it('laat 150 in precies één trede vallen: de middelste (besluit Lars 24-9-2026)', () => {
    expect(PRICING_TIERS[0].label).toBe('Minder dan 150 medewerkers')
    expect(PRICING_TIERS[1].label.startsWith('150 tot ')).toBe(true)
    expect(PRICING_TIERS.some((tier) => /^tot 150\b/i.test(tier.label))).toBe(false)
  })

  it('zet het nieuwe label ook in de FAQ-tekst en de JSON-LD', () => {
    expect(pricingFaqAnswer()).toContain('Minder dan 150 medewerkers: €3.500')
    const namen = buildPricingOfferCatalog().itemListElement.map((offer) => offer.name)
    expect(namen).toContain('Eerste scan, minder dan 150 medewerkers')
    expect(namen).toContain('Vervolgmeting, minder dan 150 medewerkers')
  })
```

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde/frontend
npx vitest run lib/pricing.test.ts
```
Verwacht: FAIL op het label.

- [ ] **Stap 2: De bron**

In `frontend/lib/pricing.ts`:
```ts
export type PricingTierId = 'tot-150' | '150-400' | '400-1000'
```
wordt
```ts
export type PricingTierId = 'onder-150' | '150-400' | '400-1000'
```
en de eerste trede:
```ts
  {
    // Besluit Lars 24-9-2026: "Tot 150" en "150 tot 400" lazen allebei alsof
    // 150 erin viel. 150 valt in de middelste trede.
    id: 'onder-150',
    label: 'Minder dan 150 medewerkers',
```
(De id wordt alleen als React-key gebruikt; `grep -rn "tot-150" frontend --include=*.ts --include=*.tsx | grep -v node_modules` moet na de wijziging leeg zijn.)

- [ ] **Stap 3: llms.txt**

In `frontend/public/llms.txt` vervang `excl. btw: tot 150 medewerkers EUR 3.500,` door `excl. btw: minder dan 150 medewerkers EUR 3.500,`. Houd het label op één regel (de guard zoekt het label als aaneengesloten tekst).

In `frontend/lib/producten-pricing.test.ts` het commentaar `// rekensom naast de rij "Tot 150 medewerkers"` bijwerken naar `"Minder dan 150 medewerkers"`.

- [ ] **Stap 4: Tests en faalset**

```bash
npx vitest run lib/pricing.test.ts lib/site-ronde-besluit-a.guard.test.ts lib/producten-pricing.test.ts lib/seo-conversion.test.ts lib/site-content-besluit-a.test.ts
```
Verwacht: alles groen, behalve tests die al in de baseline-faalset stonden. Daarna het frontend-faalset-commando: `131` en `GEEN_REGRESSIES`.

- [ ] **Stap 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
git commit -F- -- frontend/lib/pricing.ts frontend/lib/pricing.test.ts frontend/public/llms.txt frontend/lib/producten-pricing.test.ts <<'EOF'
fix(site): onderste prijstrede heet 'Minder dan 150 medewerkers'

Besluit Lars 24-9: 'Tot 150' en '150 tot 400' lazen allebei alsof 150 erin
viel. 150 valt in de middelste trede. Eén bron (lib/pricing.ts); tarieven,
FAQ-antwoord en OfferCatalog lezen het label daaruit, llms.txt in lockstep.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 13: Omvangvakken op het contactformulier gelijk aan de staffel

**Besluit Lars 24-9:** het formulier op `/kennismaking` bood 100 - 200 / 200 - 400 / 400 - 700 / 700 - 1.000; een lead met "100 - 200" viel in twee prijstreden. De vakken worden de treden zelf, uit dezelfde bron: "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers", "Boven 1.000 medewerkers" (het bestaande label `PRICING_ABOVE_LABEL`), plus het bestaande "Anders / nog niet zeker".

**Wat er met de opslag gebeurt (gecontroleerd):**
- De API-route (`frontend/app/api/contact/route.ts`) eist alleen een niet-lege tekst van minstens 2 tekens (`isNonEmptyString(body.employee_count, 2)`) en stuurt hem door naar de backend. De backend (`backend/schemas.py`, `ContactRequestCreate.employee_count`) accepteert 2 tot 80 tekens; de kolom `contact_requests.employee_count` is `String(80)`. **De nieuwe waarden worden zonder wijziging geaccepteerd**; er is geen lijst van toegestane waarden en dus geen migratie.
- **Bestaande leads houden hun oude waarde** ("100 - 200 medewerkers" enz.). Niets herschrijft of verwijdert die; de leadlijst en de leadmail tonen de tekst zoals hij binnenkwam.
- Eén interne lezer rekent met de waarde: `estimateHeadcount` op `/beheer/klantlearnings` pakt het eerste getal. "Boven 1.000 medewerkers" gaf daar `1` (de punt in "1.000"). Die functie gaat naar `lib/lead-headcount.ts` en leest duizendtallen goed; oude waarden blijven hetzelfde opleveren ("100 - 200" is 100, "700 - 1.000" is 700).

**Files:**
- Modify: `frontend/lib/contact-funnel.ts` (`CONTACT_SIZE_OPTIONS`)
- Modify: `frontend/components/marketing/contact-form.tsx`
- Create: `frontend/lib/contact-size-options.test.ts`
- Create: `frontend/lib/lead-headcount.ts`, `frontend/lib/lead-headcount.test.ts`
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- Create: `tests/test_contact_size_values.py`

- [ ] **Stap 1: Tests eerst**

`frontend/lib/contact-size-options.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONTACT_SIZE_OPTIONS } from '@/lib/contact-funnel'
import { PRICING_ABOVE_LABEL, PRICING_TIERS } from '@/lib/pricing'

describe('omvangvakken van het contactformulier (besluit Lars 24-9)', () => {
  it('zijn precies de prijstreden, boven 1.000 en twijfel', () => {
    expect(CONTACT_SIZE_OPTIONS).toEqual([
      'Minder dan 150 medewerkers',
      '150 tot 400 medewerkers',
      '400 tot 1.000 medewerkers',
      'Boven 1.000 medewerkers',
      'Anders / nog niet zeker',
    ])
  })

  it('komen uit dezelfde bron als de staffel', () => {
    expect(CONTACT_SIZE_OPTIONS.slice(0, 3)).toEqual(PRICING_TIERS.map((tier) => tier.label))
    expect(CONTACT_SIZE_OPTIONS[3]).toBe(PRICING_ABOVE_LABEL)
  })

  it('passen in de opslag: 2 tot 80 tekens (API-route en backend)', () => {
    for (const waarde of CONTACT_SIZE_OPTIONS) {
      expect(waarde.length).toBeGreaterThanOrEqual(2)
      expect(waarde.length).toBeLessThanOrEqual(80)
    }
  })

  it('het formulier rendert de vakken uit die bron en niet meer de oude ranges', () => {
    const source = readFileSync(path.join(process.cwd(), 'components/marketing/contact-form.tsx'), 'utf8')
    expect(source).toContain('CONTACT_SIZE_OPTIONS.map')
    for (const oud of ['100 - 200', '200 - 400', '400 - 700', '700 - 1.000']) {
      expect(source).not.toContain(oud)
    }
  })
})
```

`frontend/lib/lead-headcount.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { estimateHeadcount } from '@/lib/lead-headcount'

describe('estimateHeadcount', () => {
  it('leest de nieuwe vakken, ook met een duizendtalpunt', () => {
    expect(estimateHeadcount('Minder dan 150 medewerkers')).toBe(150)
    expect(estimateHeadcount('150 tot 400 medewerkers')).toBe(150)
    expect(estimateHeadcount('400 tot 1.000 medewerkers')).toBe(400)
    expect(estimateHeadcount('Boven 1.000 medewerkers')).toBe(1000)
  })

  it('geeft voor oude leads hetzelfde als voorheen', () => {
    expect(estimateHeadcount('100 - 200 medewerkers')).toBe(100)
    expect(estimateHeadcount('700 - 1.000 medewerkers')).toBe(700)
    expect(estimateHeadcount('50-100')).toBe(50)
    expect(estimateHeadcount('1500')).toBe(1500)
  })

  it('geeft 0 zonder getal', () => {
    expect(estimateHeadcount('Anders / nog niet zeker')).toBe(0)
    expect(estimateHeadcount(null)).toBe(0)
    expect(estimateHeadcount(undefined)).toBe(0)
  })
})
```

`tests/test_contact_size_values.py`:
```python
"""De backend accepteert de omvangvakken van het contactformulier (fixronde 24-9, Taak 13).

Het veld is vrije tekst (2 tot 80 tekens); er is geen lijst van toegestane
waarden. Deze test pint dat de nieuwe vakken erdoor komen en dat een oude
waarde ook blijft werken.
"""
import pytest

from backend.schemas import ContactRequestCreate


@pytest.mark.parametrize("omvang", [
    "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers",
    "Boven 1.000 medewerkers", "Anders / nog niet zeker", "100 - 200 medewerkers",
])
def test_omvangvak_wordt_geaccepteerd(omvang):
    req = ContactRequestCreate(name="Test Persoon", work_email="hr@voorbeeld.nl",
                               organization="Voorbeeld B.V.", employee_count=omvang,
                               current_question="Wij willen behoud beter begrijpen.")
    assert req.employee_count == omvang
```

Draai `npx vitest run lib/contact-size-options.test.ts lib/lead-headcount.test.ts` (FAIL: export en module ontbreken) en `$PY -m pytest tests/test_contact_size_values.py -q -p no:cacheprovider` (PASS: dit bevestigt alleen wat al zo is; laat hem staan als bewaking).

- [ ] **Stap 2: `CONTACT_SIZE_OPTIONS`**

In `frontend/lib/contact-funnel.ts`, bovenaan bij de imports:
```ts
import { PRICING_ABOVE_LABEL, PRICING_TIERS } from '@/lib/pricing'
```
en direct boven `export const CONTACT_DESIRED_TIMING_OPTIONS`:
```ts
/**
 * Omvangvakken van het contactformulier (besluit Lars 24-9-2026): dezelfde
 * grenzen als de prijsstaffel, zodat elke lead bij precies één trede hoort. De
 * waarde is het label zelf, zodat leadmail en leadlijst hetzelfde lezen als het
 * formulier. Oude leads houden hun oude waarde ("100 - 200 medewerkers" enz.):
 * contact_requests.employee_count is vrije tekst en wordt nergens herschreven.
 */
export const CONTACT_SIZE_UNSURE = 'Anders / nog niet zeker'
export const CONTACT_SIZE_OPTIONS: readonly string[] = [
  ...PRICING_TIERS.map((tier) => tier.label),
  PRICING_ABOVE_LABEL,
  CONTACT_SIZE_UNSURE,
]
```

- [ ] **Stap 3: Het formulier**

In `frontend/components/marketing/contact-form.tsx`: voeg `CONTACT_SIZE_OPTIONS,` toe aan de import uit `@/lib/contact-funnel` en vervang de vijf regels
```tsx
            <option value="100 - 200 medewerkers">100 - 200 medewerkers</option>
            <option value="200 - 400 medewerkers">200 - 400 medewerkers</option>
            <option value="400 - 700 medewerkers">400 - 700 medewerkers</option>
            <option value="700 - 1.000 medewerkers">700 - 1.000 medewerkers</option>
            <option value="Anders / nog niet zeker">Anders / nog niet zeker</option>
```
door
```tsx
            {CONTACT_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
```
De eerste, uitgeschakelde optie "Kies een range" blijft staan; maak er "Kies de omvang" van (het zijn geen ranges meer).

- [ ] **Stap 4: `estimateHeadcount`**

`frontend/lib/lead-headcount.ts`:
```ts
/**
 * Schatting van de organisatiegrootte uit het omvangvak van een lead: het eerste
 * getal, met een duizendtalpunt gelezen als duizendtal ("Boven 1.000" is 1000,
 * niet 1). Oude leads ("100 - 200 medewerkers") geven hetzelfde als voorheen.
 * Alleen voor een interne schatting (beheer/klantlearnings); nooit voor een prijs.
 */
export function estimateHeadcount(value: string | null | undefined): number {
  const match = value?.match(/\d{1,3}(?:\.\d{3})+|\d+/)
  return match ? Number.parseInt(match[0].replace(/\./g, ''), 10) : 0
}
```
In `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`: verwijder de lokale functie `estimateHeadcount` (vier regels) en voeg `import { estimateHeadcount } from '@/lib/lead-headcount'` toe bij de imports.

- [ ] **Stap 5: Tests en faalset**

```bash
npx vitest run lib/contact-size-options.test.ts lib/lead-headcount.test.ts lib/contact-funnel.test.ts lib/marketing-flow.test.ts lib/commercial-suite-alignment.test.ts
```
Verwacht: groen, behalve baseline-falers. Daarna het frontend-faalset-commando (`131`, `GEEN_REGRESSIES`) en het backend-faalset-commando (`GEEN_REGRESSIES`).

- [ ] **Stap 6: Commit**

```bash
git add frontend/lib/contact-size-options.test.ts frontend/lib/lead-headcount.ts frontend/lib/lead-headcount.test.ts tests/test_contact_size_values.py
git commit -F- -- frontend/lib/contact-funnel.ts frontend/components/marketing/contact-form.tsx frontend/lib/contact-size-options.test.ts frontend/lib/lead-headcount.ts frontend/lib/lead-headcount.test.ts "frontend/app/(dashboard)/beheer/klantlearnings/page.tsx" tests/test_contact_size_values.py <<'EOF'
fix(site): omvangvakken van het contactformulier volgen de prijsstaffel

Besluit Lars 24-9: een lead met '100 - 200' viel in twee prijstreden. De
vakken komen nu uit lib/pricing.ts. API en backend accepteren vrije tekst
(2-80 tekens), dus geen migratie; oude leads houden hun waarde. De interne
schatting leest 'Boven 1.000' voortaan als 1000 in plaats van 1.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 14: Veelgestelde vragen zichtbaar op `/producten`

**Besluit Lars 24-9:** de FAQPage-JSON-LD staat op de homepage, maar de vragen staan daar nergens zichtbaar (Google eist dat FAQPage-inhoud zichtbaar is op de pagina). De vragen gaan zichtbaar naar `/producten`, direct na de tarieven; de JSON-LD verhuist mee; de homepage verliest hem. Eén bron: `faqs` in `components/marketing/site-content.ts` (de JSON-LD `faqSchema` is daar al van afgeleid).

**Inhoudscheck tegen besluit A en de staffel** (per vraag, zoals ze nu in `faqs` staan):

| Vraag | Oordeel | Wat verandert |
|---|---|---|
| Wat is het verschil tussen Loep Vertrek en Loep Behoud? | klopt | niets (tests pinnen de formulering) |
| Is Loep Behoud gewoon een MTO? | klopt, gewone taal | niets |
| Ziet management individuele retention-scores? | Engels en jargon ("retention-scores", "segmentinzichten", "performance-sturing") | vraag en antwoord in gewone taal |
| Is Loep Behoud een gevalideerde vertrekvoorspeller? | jargon ("SDT-gebaseerde managementscan", "testmatig beschermd"), en "positioneren **we**" (Loep is onderwerp, nooit "we") | antwoord herschreven |
| Hoe vaak herhaal je Loep Behoud? | "Voor v1", en "volgen of acties effect hebben" belooft een effectmeting die er niet is (plan 3c is niet gebouwd) | antwoord herschreven, zonder effectbelofte |
| Wanneer is Loep Start de juiste route? | klopt met besluit A | niets |
| Is Loep een instrument of een dienst? | klopt met besluit A | niets |
| Wat kost een scan van Loep? | uit `pricingFaqAnswer()`, volgt de staffel en na Taak 12 het nieuwe label | niets |

**Files:**
- Modify: `frontend/components/marketing/site-content.ts` (drie FAQ-teksten)
- Modify: `frontend/components/marketing/producten-content.tsx` (`FaqSection`)
- Modify: `frontend/app/producten/page.tsx` (JSON-LD erbij), `frontend/app/page.tsx` (JSON-LD weg)
- Create: `frontend/lib/producten-faq.test.ts`
- Modify (lockstep): `frontend/lib/marketing-positioning.test.ts`, `frontend/lib/site-content-besluit-a.test.ts`

- [ ] **Stap 1: Tests eerst**

`frontend/lib/producten-faq.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { faqSchema, faqs } from '@/components/marketing/site-content'

const lees = (relatief: string) => readFileSync(path.join(process.cwd(), relatief), 'utf8')

describe('veelgestelde vragen op /producten (besluit Lars 24-9)', () => {
  it('de homepage draagt de FAQPage-JSON-LD niet meer', () => {
    expect(lees('app/page.tsx')).not.toContain('faqSchema')
  })

  it('/producten draagt de FAQPage-JSON-LD', () => {
    const page = lees('app/producten/page.tsx')
    expect(page).toContain('faqSchema')
    expect(page).toContain('JSON.stringify(faqSchema)')
  })

  it('/producten rendert de vragen zichtbaar uit dezelfde bron', () => {
    const content = lees('components/marketing/producten-content.tsx')
    expect(content).toContain('function FaqSection')
    expect(content).toContain('faqs.map')
    expect(content).toContain('Veelgestelde vragen')
    expect(content).toContain('<FaqSection />')
  })

  it('het schema is geldig: elke vraag heeft een naam en een antwoord', () => {
    expect(faqSchema['@context']).toBe('https://schema.org')
    expect(faqSchema['@type']).toBe('FAQPage')
    expect(faqSchema.mainEntity).toHaveLength(faqs.length)
    for (const vraag of faqSchema.mainEntity) {
      expect(vraag['@type']).toBe('Question')
      expect(vraag.name.length).toBeGreaterThan(5)
      expect(vraag.acceptedAnswer['@type']).toBe('Answer')
      expect(vraag.acceptedAnswer.text.length).toBeGreaterThan(20)
    }
  })

  it('de antwoorden houden zich aan besluit A en de copyregels', () => {
    for (const [vraag, antwoord] of faqs) {
      const tekst = `${vraag} ${antwoord}`
      expect(tekst, vraag).not.toMatch(/[\u2014\u2013]/)
      expect(tekst, vraag).not.toMatch(/\b(we|wij|ons|onze)\b/i)
      expect(tekst, vraag).not.toMatch(/retention-scores|SDT-gebaseerd|performance-sturing|\bv1\b/i)
      expect(tekst, vraag).not.toMatch(/begeleid|bespreking/i)
    }
  })

  it('de herschreven antwoorden', () => {
    const antwoord = (vraag: string) => faqs.find(([q]) => q === vraag)?.[1]
    expect(antwoord('Ziet het management scores van losse medewerkers?')).toBe(
      'Nee. Loep Behoud laat groepen en afdelingen zien, nooit één persoon. Het is niet bedoeld om mensen te beoordelen of om te voorspellen wie weggaat.',
    )
    expect(antwoord('Is Loep Behoud een gevalideerde vertrekvoorspeller?')).toBe(
      'Nee. Loep Behoud voorspelt niet wie er vertrekt. Het laat op groepsniveau zien waar behoud onder druk staat en wat je mensen daarover zeggen. De vragen bouwen op onderzoek naar wat mensen aan hun werk bindt, maar de scan is geen wetenschappelijk gevalideerde voorspeller van vertrek.',
    )
    expect(antwoord('Hoe vaak herhaal je Loep Behoud?')).toBe(
      'Begin met één meting. Wil je later zien of het beeld verschuift, dan herhaal je dezelfde meting als vervolgmeting, bijvoorbeeld na een half jaar.',
    )
  })
})
```
Let op de regel `\b(we|wij|ons|onze)\b`: controleer bij het schrijven dat geen bestaand, goed antwoord het woord "ons" of "we" legitiem bevat; staat er een, pas dan de test niet aan maar het antwoord (Loep als onderwerp).

Lockstep in `frontend/lib/marketing-positioning.test.ts`, in `keeps retention faq copy explicit about group insight and non-predictive use`:
```ts
    const scoreFaq = faqs.find(([question]) => question === 'Ziet het management scores van losse medewerkers?')
```
en vervang de asserties op `scoreFaq` en `predictorFaq` door:
```ts
    expect(scoreFaq?.[1].toLowerCase()).toContain('nooit één persoon')
    expect(scoreFaq?.[1].toLowerCase()).toContain('niet bedoeld om mensen te beoordelen')
    expect(predictorFaq?.[1].toLowerCase()).toContain('voorspelt niet wie er vertrekt')
```
In `frontend/lib/site-content-besluit-a.test.ts`: hernoem `zet de prijsvraag ook in het schema dat de homepage rendert` naar `zet de prijsvraag ook in het schema dat /producten rendert` (de assertie blijft).

```bash
npx vitest run lib/producten-faq.test.ts
```
Verwacht: FAIL.

- [ ] **Stap 2: De drie antwoorden**

In `frontend/components/marketing/site-content.ts`, in `faqs`:
```ts
  [
    'Ziet management individuele retention-scores?',
    'Nee. Loep Behoud is bedoeld voor groeps- en segmentinzichten, niet voor beoordeling, performance-sturing of voorspelling op persoonsniveau.',
  ],
  [
    'Is Loep Behoud een gevalideerde vertrekvoorspeller?',
    'Nee. Voor v1 positioneren we Loep Behoud als SDT-gebaseerde managementscan voor vroegsignalering op behoud, verificatie en prioritering: inhoudelijk plausibel en testmatig beschermd, maar niet als wetenschappelijk gevalideerde voorspeller van vrijwillig vertrek.',
  ],
  [
    'Hoe vaak herhaal je Loep Behoud?',
    'Voor v1 is een baseline logisch als startpunt. Daarna kun je periodiek herhalen, bijvoorbeeld per kwartaal of halfjaar, als je gericht wilt volgen of acties effect hebben.',
  ],
```
wordt:
```ts
  [
    'Ziet het management scores van losse medewerkers?',
    'Nee. Loep Behoud laat groepen en afdelingen zien, nooit één persoon. Het is niet bedoeld om mensen te beoordelen of om te voorspellen wie weggaat.',
  ],
  [
    'Is Loep Behoud een gevalideerde vertrekvoorspeller?',
    'Nee. Loep Behoud voorspelt niet wie er vertrekt. Het laat op groepsniveau zien waar behoud onder druk staat en wat je mensen daarover zeggen. De vragen bouwen op onderzoek naar wat mensen aan hun werk bindt, maar de scan is geen wetenschappelijk gevalideerde voorspeller van vertrek.',
  ],
  [
    'Hoe vaak herhaal je Loep Behoud?',
    'Begin met één meting. Wil je later zien of het beeld verschuift, dan herhaal je dezelfde meting als vervolgmeting, bijvoorbeeld na een half jaar.',
  ],
```

- [ ] **Stap 3: Zichtbaar op `/producten`**

In `frontend/components/marketing/producten-content.tsx`: voeg `import { faqs } from '@/components/marketing/site-content'` toe bij de imports, en direct boven `function ContactSection()`:

```tsx
/**
 * Veelgestelde vragen (besluit Lars 24-9-2026). Dezelfde bron als de
 * FAQPage-JSON-LD op deze pagina (faqSchema in site-content.ts): Google wil dat
 * die vragen zichtbaar op de pagina staan. Uitklapbaar met <details>, zodat de
 * antwoorden in de HTML staan en zonder JavaScript leesbaar zijn.
 */
function FaqSection() {
  return (
    <section
      id="veelgestelde-vragen"
      style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(48px,5.5vw,72px) 0', scrollMarginTop: 80 }}
    >
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 28, maxWidth: '64ch' }}>
            <div style={{ color: AC.deep, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', marginBottom: 12, textTransform: 'uppercase' }}>
              Veelgestelde vragen
            </div>
            <h2 style={{ color: T.ink, fontFamily: FF, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, letterSpacing: '-.026em', lineHeight: 1.06 }}>
              Wat mensen vragen voor ze beginnen
            </h2>
          </div>
        </Reveal>
        <div style={{ borderTop: `1px solid ${T.rule}`, maxWidth: '72ch' }}>
          {faqs.map(([vraag, antwoord]) => (
            <details key={vraag} style={{ borderBottom: `1px solid ${T.rule}`, padding: '16px 0' }}>
              <summary style={{ color: T.ink, cursor: 'pointer', fontFamily: FF, fontSize: 16.5, fontWeight: 700, lineHeight: 1.4 }}>
                {vraag}
              </summary>
              <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.7, marginTop: 10 }}>{antwoord}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
```
en in `ProductenContent` tussen `<PricingSection />` en `<ContactSection />`:
```tsx
      <FaqSection />
```

- [ ] **Stap 4: JSON-LD verhuizen**

`frontend/app/producten/page.tsx`: voeg `import { faqSchema } from '@/components/marketing/site-content'` toe, en direct onder de regel met `JSON.stringify(pricingSchema)`:
```tsx
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
```
`frontend/app/page.tsx`: verwijder de import van `faqSchema` en de regel `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />`.

- [ ] **Stap 5: Tests en faalset**

```bash
npx vitest run lib/producten-faq.test.ts lib/marketing-positioning.test.ts lib/site-content-besluit-a.test.ts lib/seo-conversion.test.ts lib/site-ronde-besluit-a.guard.test.ts
```
Verwacht: groen, behalve baseline-falers. Daarna het frontend-faalset-commando: `131` en `GEEN_REGRESSIES`.

- [ ] **Stap 6: Commit**

```bash
git add frontend/lib/producten-faq.test.ts
git commit -F- -- frontend/components/marketing/site-content.ts frontend/components/marketing/producten-content.tsx frontend/app/producten/page.tsx frontend/app/page.tsx frontend/lib/producten-faq.test.ts frontend/lib/marketing-positioning.test.ts frontend/lib/site-content-besluit-a.test.ts <<'EOF'
fix(site): veelgestelde vragen zichtbaar op /producten, FAQ-JSON-LD mee

Besluit Lars 24-9: de FAQPage-JSON-LD stond op de homepage terwijl de vragen
daar nergens te zien waren. Ze staan nu uitklapbaar op /producten, na de
tarieven, uit dezelfde bron als het schema. Drie antwoorden in gewone taal
(geen 'we', geen v1/SDT-jargon, geen belofte van een effectmeting).

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 15: Naam en staffelgrens in `Loep_Docs`

**Besluit Lars 24-9:** overal "Lars van den Hengel". Gecontroleerd op 24-9: in de repo staat de naam al overal goed (`frontend/app/kennismaking/page.tsx`, `frontend/lib/homepage-besluit-a.test.ts`); de enige afwijking is `Loep_Docs\offerte-template.html` ("Loep · Lars Hengel"). De drie `.docx`-bestanden bevatten de naam niet. Omdat de prijsgrens in Taak 12 verandert, gaan de sjablonen met de staffel ("tot 150") in dezelfde stap mee; anders zegt de offerte iets anders dan de site.

`Loep_Docs` staat buiten de repo en buiten versiebeheer: eerst een archiefkopie, dan wijzigen. Deze taak heeft geen commit.

**Files (buiten de repo, `C:\Users\larsh\Desktop\Business\Loep_Docs\`):** `offerte-template.html`, `faq.html`, `harde-getallen.html`, `one-pager.html`, `sales-pitch.html`.

- [ ] **Stap 1: Zoeken, zodat niets gemist wordt**

```bash
cd /c/Users/larsh/Desktop/Business/Loep_Docs
grep -rnio "[^<>\"]\{0,30\}hengel[^<>\"]\{0,20\}" --include=*.html . | grep -v _archief
grep -rnio "[^<>]\{0,20\}tot 150[^<>]\{0,20\}" --include=*.html . | grep -v _archief
cd /c/Users/larsh/Desktop/Business/Verisight && git grep -nio "lars hengel\|l\. hengel\|lars v\.d\. hengel\|lars vd hengel" -- frontend backend templates docs ':!docs/superpowers'
```
Verwacht: `offerte-template.html` met "Lars Hengel" (en "Lars van den Hengel" in `pilotbevestiging.html`, die klopt); "tot 150" in de vijf genoemde bestanden; de git-grep in de repo leeg. Vind je meer of andere treffers, neem ze mee in stap 3 en noem ze in het verslag.

- [ ] **Stap 2: Archiefkopie**

```bash
cd /c/Users/larsh/Desktop/Business/Loep_Docs
mkdir -p _archief-2026-09-24
cp offerte-template.html faq.html harde-getallen.html one-pager.html sales-pitch.html _archief-2026-09-24/
ls _archief-2026-09-24
```
Verwacht: de vijf bestanden.

- [ ] **Stap 3: Wijzigen (exacte vervangingen)**

| Bestand | Vervang | Door |
|---|---|---|
| `offerte-template.html` | `Loep · Lars Hengel` | `Loep · Lars van den Hengel` |
| `offerte-template.html` | `excl. btw: tot 150 medewerkers &euro; 3.500` | `excl. btw: minder dan 150 medewerkers &euro; 3.500` |
| `faq.html` | `organisatie: tot 150 medewerkers &euro; 3.500` | `organisatie: minder dan 150 medewerkers &euro; 3.500` |
| `harde-getallen.html` | `<br>tot 150 / 150 tot 400` | `<br>minder dan 150 / 150 tot 400` |
| `one-pager.html` | `excl. btw &middot; tot 150 / 150 tot 400` | `excl. btw &middot; minder dan 150 / 150 tot 400` |
| `sales-pitch.html` | `organisatie (tot 150, 150 tot 400` | `organisatie (minder dan 150, 150 tot 400` |

Gebruik de Edit-tool per rij (exacte tekst, één treffer per bestand). Controleer daarna:
```bash
grep -c "Lars Hengel" offerte-template.html; grep -rnci "tot 150 medewerkers\|tot 150 /\|(tot 150," faq.html harde-getallen.html offerte-template.html one-pager.html sales-pitch.html
```
Verwacht: `0` voor de naam en `0` per bestand voor de oude grens.

- [ ] **Stap 4: Verslag**

Geen commit (buiten de repo). Noteer in het verslag: welke bestanden, dat de archiefkopie in `Loep_Docs\_archief-2026-09-24\` staat, en dat de twee pdf's (`Loep onepager.pdf`, `Loep methodische verantwoording.pdf`) nog steeds oude exports zijn die Lars zelf opnieuw moet exporteren.

---


# Deel C: opschoning na de bewaartermijn

**Besluit Lars 24-9:** de privacyverklaring (P6) en de verwerkersovereenkomst (D5) beloven vanaf nu: "uiterlijk twee jaar na het sluiten van de meting verwijdert of anonimiseert Loep de gegevens, of eerder op verzoek, tenzij schriftelijk een andere termijn is afgesproken" (`docs/superpowers/specs/2026-09-24-juridische-ronde.md`). Er is geen mechanisme; dit was open punt L6 in `docs/security-audit-2026-07-12.md`. Het moet er zijn vóór de eerste klant.

**Harde regel voor deze ronde: `--apply` draait nooit tegen productie.** Alleen `--dry-run` (de standaard), en in het verslag komen alleen aantallen, geen inhoud. De eerste echte run is een besluit van Lars.

## C.1 Datamodel en advies per tabel

Onderzocht in `backend/models.py`, `supabase/schema.sql` en `migrations/`. "Per meting" betekent: de rij hoort via `campaign_id` (direct of via een ouder) bij één meting.

| Tabel | Wat erin staat | Na de termijn | Waarom |
|---|---|---|---|
| `respondents` | per respondent: afdeling, functieniveau, vertrekmaand, jaarsalaris, e-mailadres (oude managed-werkwijze), token, dedup-hash, tijdstempels | **verwijderen** | De kern van de persoonsgegevens. Anonimiseren laat per persoon een rij met afdeling en antwoorden staan, die in kleine afdelingen herleidbaar blijft; dat is geen anonimisering. |
| `survey_responses` | alle antwoorden, open tekst, LLM-analyse van de open tekst, JSONB `deepening_responses` en `direction_response`, afgeleide scores, `full_result` | **verwijderen** (eerst, dan `respondents`) | Idem; ook de afgeleide scores zijn per persoon. |
| `campaigns` | naam, scantype, datums, `segment_departments` (afdelingsnamen en aantallen uitgenodigd) | **bewaren**, `data_purged_at` zetten | Geen persoonsgegevens. Nodig om te laten zien dat de meting bestond en waarom er geen rapport meer is. De afdelingsaantallen zijn organisatiegegevens. |
| `campaign_delivery_records` | `invited_count`, datums, operatornotities, overdrachtnotitie, `self_send_config` en `participant_comms_config` (afzendernaam, mailteksten), reminders | **anonimiseren**: `operator_notes`, `customer_handoff_note`, `next_step` naar leeg; `self_send_config` en `participant_comms_config` naar `{}`; `self_send_reminders` naar `[]`. Bewaren: `invited_count`, `launch_date`, `lifecycle_stage`, tijdstempels | Vrije tekst en afzendernaam kunnen namen bevatten. Noemer en datums zijn geen persoonsgegevens en blijven bruikbaar. |
| `campaign_delivery_checkpoints` | operatornotitie en automatische samenvatting per checkpoint | **anonimiseren**: `operator_note`, `last_auto_summary` naar leeg | Vrije tekst. |
| `campaign_decisions` | besluit van het MT: onderwerpen, vrije tekst, eigenaar (een naam), `recorded_by` | **anonimiseren**: `owner`, `primary_action`, `secondary_action`, `feedback_plan`, `success_criterion` naar `''`, `recorded_by` naar leeg. Bewaren: `primary_topic`, `secondary_topic`, `decided_at`, `follow_up_date` | De eigenaar is een naam en vrije tekst kan namen bevatten. De onderwerpen zijn labels en houden de besluitgeschiedenis leesbaar voor een latere vervolgmeting (plan 3c). |
| `campaign_action_audit_events` | wie deed wat (gebruikers-id, naam), samenvatting, metadata | **verwijderen** (rijen van deze meting) | Operationeel logboek; na de termijn geen doel meer, en het bevat namen van gebruikers. Staat niet in het ORM. |
| `action_center_manager_responses` (en via cascade `action_center_route_actions`, `action_center_action_reviews`), `action_center_route_relations` (bron- of doelmeting), `action_center_review_decisions` (`route_source_id`) | notities van managers per meting | **verwijderen** (rijen van deze meting) | Vrije tekst en namen; het Action Center wordt uitgefaseerd. Staan niet in het ORM; ze worden alleen geraakt als de tabel bestaat. |
| `organizations`, `org_members`, `org_invites`, `profiles`, `organization_secrets` | account- en klantgegevens | **niet in deze opschoning** | Horen bij het account, niet bij een meting; ze eindigen met het account. |
| `contact_requests` | leads: naam, werk-e-mail, organisatie, vraag | **niet in deze opschoning** | Commercieel contact, geen meting en geen verwerking namens een klant. Eigen termijn nodig: zie "Wat Lars moet beslissen". |
| `pilot_learning_dossiers`, `pilot_learning_checkpoints` | interne leerdossiers met leadgegevens | **niet in deze opschoning** | Intern en commercieel. Eigen termijn nodig: zie "Wat Lars moet beslissen". |

**Advies verwijderen tegenover anonimiseren:** verwijderen voor alles wat per respondent is, anonimiseren (vrije tekst leeg) voor wat per meting is. Een vervolgmeting na meer dan twee jaar kan daardoor niet meer met de oude scores vergelijken; wil Lars dat wel, dan hoort bij plan 3c een momentopname van de geaggregeerde cijfers bij het sluiten (geen persoonsgegevens), niet het bewaren van individuele antwoorden.

**Wat er na de opschoning met het rapport gebeurt (Fail Loud):** elke rapportroute (`/api/campaigns/{id}/report`, de interne variant, `/report-preview`, `/report-html`) geeft **410 Gone** met de melding "De gegevens van deze meting zijn op [datum] verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig." De campagnedetailpagina in het dashboard toont dezelfde boodschap in plaats van de downloadknop, en niet "te weinig antwoorden".

**Buiten de database** (voor het verslag en de verwerkersovereenkomst, geen code): Supabase-back-ups bewaren verwijderde rijen nog tot hun eigen bewaartermijn verloopt; mails via Resend (uitnodigingen, meldingen) en foutmeldingen in Sentry vallen buiten deze opschoning.

## C.2 Afwijkende termijn per organisatie: ja, een kolom

**Advies: een additieve, nullable kolom `organizations.retention_months`** (leeg betekent 24; toegestaan 1 tot 120). Een constante in de code zou ook kunnen zolang er geen afspraak bestaat, maar een geplande taak moet een afwijkende afspraak altijd kennen; een kolom maakt dat een gegeven in plaats van een deploy. Dezelfde migratie voegt `campaigns.data_purged_at` toe (nodig voor de 410 en om een tweede run niets te laten doen), dus de extra kolom kost geen extra stap.

**Beide kolommen komen bewust niet op het ORM-model.** Een kolom in het model komt in elke `SELECT` op die tabel; een niet-gedraaide migratie legde op 13 september elk rapport plat. De opschoning leest en schrijft ze met losse SQL en controleert eerst of ze bestaan (zelfde aanpak als `previous_campaign_id` in plan 3b):
- `--apply` zonder de kolommen: stopt met exitcode 2 en de melding welke migratie ontbreekt;
- dry-run zonder de kolommen: rekent met 24 maanden voor iedereen en zegt dat hardop bovenaan de uitvoer;
- de rapportcheck zonder de kolom: niets kan zijn opgeschoond (de opschoning weigert zonder kolom), dus het rapport gaat gewoon door. Dat is geen stille terugval maar de waarheid.

**Wie zet een afwijkende termijn:** alleen Loep. Klanten mogen hun eigen organisatierij bijwerken (policy `owners_can_update_org`) en managers hun campagnes; een trigger weigert daarom een wijziging van `retention_months` of `data_purged_at` door een ingelogde klant (`auth.role() = 'authenticated'`) die geen operator is. De service-role en een directe databaseverbinding (de opschoning) mogen wel. Dit maakt de RLS strenger, niet losser.

## C.3 Het mechanisme en hoe het periodiek draait

Kern in `backend/data_retention.py` (niet in `scripts/`: het productie-image kopieert alleen `backend/` en `templates/`). Aanroep: `python -m backend.data_retention`, standaard dry-run.

- Een meting komt in aanmerking als ze gesloten is (`is_active` onwaar én `closed_at` gevuld) en de sluitdag in Nederlandse tijd plus de termijn in kalendermaanden vandaag of eerder valt. Open metingen en metingen zonder sluitdatum worden nooit geraakt en staan apart in de uitvoer.
- Per meting één transactie. Een fout rolt alleen die meting terug, de uitvoer noemt hem, en de exitcode wordt 1.
- Dry-run opent op Postgres een `READ ONLY`-transactie: schrijven kan dan niet, ook niet per ongeluk.
- De uitvoer noemt per meting alleen id's, datums en aantallen, nooit namen of inhoud, en eindigt met een samenvattingsregel.
- "Eerder op verzoek": `--campagne <uuid>` (mag vaker) of `--organisatie <uuid>`, zelfde dry-run-standaard. Een open meting weigert het op verzoek ook (sluit hem eerst); een onbekende id is een regel in de uitvoer en exitcode 1.

**Periodiek draaien, advies: een Railway-cronservice**, niet een nieuw HTTP-endpoint. Het reminder-patroon (intern endpoint met `x-admin-token`, extern aangeroepen) past voor meldingen, maar een endpoint dat gegevens verwijdert is een extra aanvalsoppervlak dat hier niets toevoegt. Railway kan een tweede service uit dezelfde repo en hetzelfde `Dockerfile` op een schema draaien:
1. Lars maakt in Railway een nieuwe service uit deze repo (builder Dockerfile), met dezelfde `DATABASE_URL` als de webservice (gedeelde variabele).
2. Startcommando: `python -m backend.data_retention --apply`. Schema: `0 3 * * *` (dagelijks 03:00 UTC; de taak is idempotent, dus dagelijks is veilig en houdt "uiterlijk twee jaar" strak).
3. Controle: Railway toont per cronrun de logs en de status. Elke run eindigt met `SAMENVATTING (opgeschoond): ...`; een exitcode ongelijk aan 0 kleurt de run rood. Lars kijkt maandelijks naar de runhistorie.
4. Tot Lars dit aanzet, draait er niets. Eerst de migratie, dan één handmatige dry-run tegen productie, dan de cron.

---

## Taak 16: Migratie voor de bewaartermijn

**Files:**
- Create: `migrations/2026_09_24_add_data_retention.sql`
- Modify: `supabase/schema.sql` (hetzelfde blok onderaan, zodat een verse omgeving niet afwijkt)
- Create: `tests/test_data_retention_migration.py`

- [ ] **Stap 1: Guardtest eerst**

`tests/test_data_retention_migration.py`:
```python
"""De migratie voor de bewaartermijn (fixronde 24-9, Deel C): additief, idempotent,
met een trigger die klanten de twee kolommen niet laat wijzigen, en bewust niet
op het ORM-model."""
from pathlib import Path

from backend.models import Campaign, Organization

ROOT = Path(__file__).resolve().parent.parent
MIGRATIE = ROOT / "migrations" / "2026_09_24_add_data_retention.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"


def _sql() -> str:
    return MIGRATIE.read_text(encoding="utf-8").lower()


def test_migratie_is_additief_en_idempotent():
    sql = _sql()
    assert "add column if not exists data_purged_at timestamptz" in sql
    assert "add column if not exists retention_months integer" in sql
    assert "retention_months between 1 and 120" in sql
    assert "create or replace function public.guard_retention_columns()" in sql
    assert sql.count("drop trigger if exists") == 2
    for verboden in ("drop table", "drop column", "delete from", "truncate", "alter column"):
        assert verboden not in sql, verboden


def test_trigger_laat_alleen_loep_de_kolommen_wijzigen():
    sql = _sql()
    assert "auth.role()" in sql
    assert "is_verisight_admin_user()" in sql
    assert "set search_path = public" in sql
    assert "before update on public.organizations" in sql
    assert "before update on public.campaigns" in sql


def test_schema_sql_heeft_hetzelfde_blok():
    schema = SCHEMA.read_text(encoding="utf-8").lower()
    assert "add column if not exists data_purged_at timestamptz" in schema
    assert "add column if not exists retention_months integer" in schema
    assert "create or replace function public.guard_retention_columns()" in schema


def test_kolommen_staan_bewust_niet_op_het_orm_model():
    """Een kolom op het model komt in elke SELECT; een niet-gedraaide migratie
    legde op 13 september elk rapport plat. backend/data_retention.py leest ze
    met losse SQL en controleert eerst of ze bestaan."""
    assert "data_purged_at" not in Campaign.__table__.columns
    assert "retention_months" not in Organization.__table__.columns
```
```bash
$PY -m pytest tests/test_data_retention_migration.py -q -p no:cacheprovider
```
Verwacht: FAIL (`FileNotFoundError`), behalve de ORM-test.

- [ ] **Stap 2: De migratie**

`migrations/2026_09_24_add_data_retention.sql`:
```sql
-- Migration: bewaartermijn van metinggegevens (fixronde 24-9, Deel C)
-- Aanleiding: privacyverklaring (P6) en verwerkersovereenkomst (D5) beloven dat
-- Loep uiterlijk twee jaar na het sluiten van een meting de gegevens verwijdert
-- of anonimiseert, of eerder op verzoek, tenzij schriftelijk anders afgesproken.
-- backend/data_retention.py doet dat; deze migratie geeft het twee kolommen.
-- Uitvoeren in: Supabase Dashboard -> SQL Editor. Additief en idempotent: opnieuw
-- draaien verandert niets, en de live backend merkt er niets van (de kolommen
-- staan bewust niet op het ORM-model).

alter table public.campaigns
  add column if not exists data_purged_at timestamptz;

comment on column public.campaigns.data_purged_at is
  'Moment waarop backend/data_retention.py de respondentgegevens van deze meting verwijderde. Leeg: niet opgeschoond.';

alter table public.organizations
  add column if not exists retention_months integer;

comment on column public.organizations.retention_months is
  'Schriftelijk afgesproken bewaartermijn in maanden na het sluiten van een meting. Leeg: 24.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_retention_months_check'
  ) then
    alter table public.organizations
      add constraint organizations_retention_months_check
      check (retention_months is null or retention_months between 1 and 120);
  end if;
end $$;

-- Klanten mogen hun organisatierij en campagnes bijwerken (RLS-policies
-- owners_can_update_org en org_managers_can_update_campaigns). Deze twee
-- kolommen zijn van Loep: een ingelogde klant die geen operator is, mag ze niet
-- wijzigen. De service-role en een directe databaseverbinding (de opschoning)
-- hebben geen JWT-rol 'authenticated' en mogen wel.
create or replace function public.guard_retention_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') = 'authenticated' and not public.is_verisight_admin_user() then
    if tg_table_name = 'organizations' and new.retention_months is distinct from old.retention_months then
      raise exception 'retention_months wordt alleen door Loep gezet';
    end if;
    if tg_table_name = 'campaigns' and new.data_purged_at is distinct from old.data_purged_at then
      raise exception 'data_purged_at wordt alleen door de opschoning gezet';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_retention_guard_trg on public.organizations;
create trigger organizations_retention_guard_trg
  before update on public.organizations
  for each row execute function public.guard_retention_columns();

drop trigger if exists campaigns_retention_guard_trg on public.campaigns;
create trigger campaigns_retention_guard_trg
  before update on public.campaigns
  for each row execute function public.guard_retention_columns();
```
Controlequery (voor Taak 21 en het verslag), verwacht `true | true | true | 2`:
```sql
select
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'campaigns' and column_name = 'data_purged_at') as purged_kolom,
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'organizations' and column_name = 'retention_months') as termijn_kolom,
  exists (select 1 from pg_constraint where conname = 'organizations_retention_months_check') as check_bestaat,
  (select count(*) from pg_trigger where tgname in ('organizations_retention_guard_trg',
                                                    'campaigns_retention_guard_trg')) as triggers;
```

- [ ] **Stap 3: `supabase/schema.sql`**

Plak de migratie (zonder de kopcommentaarregels, met één regel `-- Bewaartermijn (migratie 2026_09_24_add_data_retention.sql)` erboven) onderaan `supabase/schema.sql`.

- [ ] **Stap 4: Test en commit**

```bash
$PY -m pytest tests/test_data_retention_migration.py -q -p no:cacheprovider
```
Verwacht: `4 passed`. Backend-faalset-commando: `GEEN_REGRESSIES`.

```bash
git add migrations/2026_09_24_add_data_retention.sql tests/test_data_retention_migration.py
git commit -F- -- migrations/2026_09_24_add_data_retention.sql supabase/schema.sql tests/test_data_retention_migration.py <<'EOF'
feat(privacy): migratie voor de bewaartermijn van metinggegevens

campaigns.data_purged_at en organizations.retention_months (leeg is 24),
additief en idempotent, met een trigger die klanten de twee kolommen niet
laat wijzigen. Bewust niet op het ORM-model. Nog niet gedraaid: wachtstap
voor Lars.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 17: De opschoning zelf (`backend/data_retention.py`)

**Files:**
- Create: `backend/data_retention.py`
- Create: `tests/test_data_retention.py`

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_data_retention.py`:
```python
"""Opschoning na de bewaartermijn (fixronde 24-9, Deel C).

Altijd tegen een in-memory SQLite, nooit tegen productie. De twee kolommen van
de migratie staan niet op het ORM-model; de fixture voegt ze toe zoals de
migratie dat op Postgres doet. Twee tabellen buiten het ORM
(campaign_action_audit_events, action_center_manager_responses) krijgen een
minimale vorm, zodat de verwijdering ervan getest wordt.
"""
from datetime import date, datetime, timezone

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import data_retention as dr
from backend.database import Base
from backend.models import (
    Campaign, CampaignDecision, CampaignDeliveryRecord, Organization, Respondent, SurveyResponse,
)

VANDAAG = date(2028, 6, 15)


def _engine(*, migratie: bool = True, extra_tabellen: bool = True):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    with engine.begin() as con:
        if migratie:
            con.execute(text("alter table campaigns add column data_purged_at timestamp"))
            con.execute(text("alter table organizations add column retention_months integer"))
        if extra_tabellen:
            con.execute(text("create table campaign_action_audit_events "
                             "(id varchar(36) primary key, campaign_id char(36) not null)"))
            con.execute(text("create table action_center_manager_responses "
                             "(id varchar(36) primary key, campaign_id char(36) not null)"))
    return engine


@pytest.fixture()
def fabriek():
    engine = _engine()
    yield sessionmaker(bind=engine, autocommit=False, autoflush=False)
    engine.dispose()


def _meting(fabriek, *, slug: str, gesloten: datetime | None, actief: bool = False,
            n: int = 3, termijn: int | None = None) -> tuple[str, str]:
    db = fabriek()
    org = Organization(name="Org " + slug, slug=slug, contact_email="hr@" + slug + ".nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Meting " + slug, scan_type="retention",
                    is_active=actief, closed_at=gesloten)
    db.add(camp)
    db.flush()
    for i in range(n):
        r = Respondent(campaign=camp, department="Zorg", completed=True,
                       email="persoon" + str(i) + "@" + slug + ".nl")
        db.add(r)
        db.add(SurveyResponse(respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                              pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                              open_text_raw="Mijn leidinggevende Piet luistert niet.",
                              risk_score=5.5, risk_band="MIDDEN"))
    db.add(CampaignDeliveryRecord(organization_id=org.id, campaign_id=camp.id, invited_count=10,
                                  operator_notes="Gebeld met Sanne", customer_handoff_note="Sanne",
                                  self_send_config={"senderName": "Sanne de Vries"}))
    db.add(CampaignDecision(campaign_id=camp.id, organization_id=org.id,
                            primary_topic="Groeiperspectief", primary_action="Sanne plant gesprekken",
                            owner="Sanne de Vries", success_criterion="Iedereen heeft een gesprek"))
    db.flush()
    db.execute(text("insert into campaign_action_audit_events (id, campaign_id) values (:i, :c)"),
               {"i": "a-" + slug, "c": camp.id})
    db.execute(text("insert into action_center_manager_responses (id, campaign_id) values (:i, :c)"),
               {"i": "m-" + slug, "c": camp.id})
    if termijn is not None:
        db.execute(text("update organizations set retention_months = :t where id = :o"),
                   {"t": termijn, "o": org.id})
    db.commit()
    ids = (camp.id, org.id)
    db.close()
    return ids


def _tel(fabriek, campaign_id: str) -> dict[str, int]:
    db = fabriek()
    try:
        resp_ids = [r.id for r in db.query(Respondent).filter(Respondent.campaign_id == campaign_id)]
        return {
            "respondenten": len(resp_ids),
            "antwoorden": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).count() if resp_ids else 0,
            "audit": db.execute(text("select count(*) from campaign_action_audit_events where campaign_id = :c"),
                                {"c": campaign_id}).scalar(),
            "action_center": db.execute(text("select count(*) from action_center_manager_responses where campaign_id = :c"),
                                        {"c": campaign_id}).scalar(),
        }
    finally:
        db.close()


def _gesloten(jaar: int, maand: int, dag: int) -> datetime:
    return datetime(jaar, maand, dag, 10, 0, tzinfo=timezone.utc)


def _status(rapport, campaign_id: str) -> str:
    return next(m.status for m in rapport.metingen if m.campaign_id == campaign_id)


def test_verlopen_meting_wordt_opgeschoond(fabriek):
    cid, _org = _meting(fabriek, slug="a", gesloten=_gesloten(2026, 5, 1))
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "opgeschoond"
    assert _tel(fabriek, cid) == {"respondenten": 0, "antwoorden": 0, "audit": 0, "action_center": 0}
    db = fabriek()
    rec = db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one()
    assert rec.invited_count == 10
    assert rec.operator_notes is None and rec.customer_handoff_note is None
    assert rec.self_send_config == {}
    besluit = db.get(CampaignDecision, cid)
    assert besluit.primary_topic == "Groeiperspectief"
    assert besluit.owner == "" and besluit.primary_action == "" and besluit.success_criterion == ""
    assert db.get(Campaign, cid) is not None
    assert dr.data_purged_at(db, cid) is not None
    db.close()


def test_niets_jonger_dan_de_termijn_wordt_geraakt(fabriek):
    cid, _ = _meting(fabriek, slug="b", gesloten=_gesloten(2026, 7, 1))   # 23,5 maand
    voor = _tel(fabriek, cid)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "binnen_termijn"
    assert _tel(fabriek, cid) == voor


def test_grens_valt_op_de_dag_zelf_in_nederlandse_tijd(fabriek):
    # Gesloten op 15 juni 2026 om 23:30 UTC = 16 juni 01:30 Nederlandse tijd.
    cid, _ = _meting(fabriek, slug="c", gesloten=datetime(2026, 6, 15, 23, 30, tzinfo=timezone.utc))
    assert _status(dr.opschonen(fabriek, vandaag=date(2028, 6, 15), apply=False), cid) == "binnen_termijn"
    assert _status(dr.opschonen(fabriek, vandaag=date(2028, 6, 16), apply=False), cid) == "verlopen"


def test_open_metingen_nooit_ook_niet_op_verzoek(fabriek):
    lopend, _ = _meting(fabriek, slug="d", gesloten=None, actief=True)
    zonder_datum, _ = _meting(fabriek, slug="e", gesloten=None, actief=False)
    oud_maar_actief, _ = _meting(fabriek, slug="f", gesloten=_gesloten(2024, 1, 1), actief=True)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    for cid in (lopend, zonder_datum, oud_maar_actief):
        assert _status(rapport, cid) == "open"
        assert _tel(fabriek, cid)["respondenten"] == 3
    op_verzoek = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, campagne_ids=[lopend])
    assert _status(op_verzoek, lopend) == "geweigerd_open"
    assert _tel(fabriek, lopend)["respondenten"] == 3


def test_andere_organisaties_nooit(fabriek):
    a, org_a = _meting(fabriek, slug="g", gesloten=_gesloten(2027, 1, 1))   # binnen termijn
    b, _ = _meting(fabriek, slug="h", gesloten=_gesloten(2025, 1, 1))       # verlopen, andere org
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, organisatie_ids=[org_a])
    assert [m.campaign_id for m in rapport.metingen] == [a]
    assert _status(rapport, a) == "opgeschoond"                          # op verzoek: termijn telt niet
    assert _tel(fabriek, b)["respondenten"] == 3


def test_tweede_run_doet_niets(fabriek):
    cid, _ = _meting(fabriek, slug="i", gesloten=_gesloten(2026, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    db = fabriek()
    eerste = dr.data_purged_at(db, cid)
    db.close()
    tweede = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(tweede, cid) == "al_opgeschoond"
    db = fabriek()
    assert dr.data_purged_at(db, cid) == eerste
    db.close()


def test_dry_run_schrijft_niets_en_telt_wel(fabriek):
    cid, _ = _meting(fabriek, slug="j", gesloten=_gesloten(2026, 1, 1), n=4)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    meting = next(m for m in rapport.metingen if m.campaign_id == cid)
    assert meting.status == "verlopen"
    assert meting.tellingen["respondenten"] == 4
    assert meting.tellingen["open_tekst"] == 4
    assert _tel(fabriek, cid)["respondenten"] == 4
    db = fabriek()
    assert dr.data_purged_at(db, cid) is None
    db.close()


def test_afwijkende_termijn_per_organisatie(fabriek):
    lang, _ = _meting(fabriek, slug="k", gesloten=_gesloten(2026, 1, 1), termijn=36)
    kort, _ = _meting(fabriek, slug="l", gesloten=_gesloten(2027, 5, 1), termijn=12)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    assert _status(rapport, lang) == "binnen_termijn"
    assert _status(rapport, kort) == "verlopen"


def test_apply_zonder_migratie_weigert_dry_run_zegt_het():
    engine = _engine(migratie=False)
    fabriek = sessionmaker(bind=engine)
    cid, _ = _meting(fabriek, slug="m", gesloten=_gesloten(2025, 1, 1))
    with pytest.raises(dr.RetentieMigratieOntbreekt):
        dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    assert rapport.migratie_gedraaid is False
    assert _status(rapport, cid) == "verlopen"
    assert _tel(fabriek, cid)["respondenten"] == 3
    engine.dispose()


def test_ontbrekende_tabel_buiten_het_orm_wordt_overgeslagen():
    engine = _engine(extra_tabellen=False)
    fabriek = sessionmaker(bind=engine)
    db = fabriek()
    org = Organization(name="Org n", slug="n", contact_email="hr@n.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Meting n", scan_type="retention", is_active=False,
                    closed_at=_gesloten(2025, 1, 1))
    db.add(camp)
    db.commit()
    cid = camp.id
    db.close()
    assert _status(dr.opschonen(fabriek, vandaag=VANDAAG, apply=True), cid) == "opgeschoond"
    engine.dispose()


def test_fout_in_een_meting_rolt_alleen_die_terug(fabriek, monkeypatch):
    kapot, _ = _meting(fabriek, slug="o", gesloten=_gesloten(2025, 1, 1))
    goed, _ = _meting(fabriek, slug="p", gesloten=_gesloten(2025, 1, 1))
    echte = dr._schoon_op

    def soms_kapot(db, campaign_id, nu):
        echte(db, campaign_id, nu)
        if campaign_id == kapot:
            raise RuntimeError("testfout")

    monkeypatch.setattr(dr, "_schoon_op", soms_kapot)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, kapot) == "fout"
    assert _tel(fabriek, kapot)["respondenten"] == 3          # teruggerold
    assert _status(rapport, goed) == "opgeschoond"
    assert _tel(fabriek, goed)["respondenten"] == 0


def test_onbekende_campagne_op_verzoek_is_een_regel(fabriek):
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False,
                           campagne_ids=["00000000-0000-0000-0000-000000000001"])
    assert [(m.campaign_id, m.status) for m in rapport.metingen] == [
        ("00000000-0000-0000-0000-000000000001", "onbekend")]


def test_plus_maanden_klemt_op_de_laatste_dag():
    assert dr._plus_maanden(date(2026, 1, 31), 1) == date(2026, 2, 28)
    assert dr._plus_maanden(date(2028, 2, 29), 12) == date(2029, 2, 28)
    assert dr._plus_maanden(date(2026, 3, 15), 24) == date(2028, 3, 15)
```

- [ ] **Stap 2: Draai en zie ze falen**

```bash
$PY -m pytest tests/test_data_retention.py -q -p no:cacheprovider
```
Verwacht: FAIL bij de import (`ImportError: cannot import name 'data_retention'`).

- [ ] **Stap 3: `backend/data_retention.py`**

```python
"""Bewaartermijn van metinggegevens (fixronde 24-9, Deel C; open punt L6 uit de
security-audit van juli).

De privacyverklaring (P6) en de verwerkersovereenkomst (D5) beloven: uiterlijk
twee jaar na het sluiten van een meting verwijdert of anonimiseert Loep de
gegevens, of eerder op verzoek, tenzij schriftelijk een andere termijn is
afgesproken. Deze module doet dat. Wat er per tabel gebeurt en waarom staat in
docs/superpowers/plans/2026-09-24-fixronde-leesronde.md, Deel C.1.

Gebruik (standaard dry-run, schrijft niets):
    python -m backend.data_retention
    python -m backend.data_retention --campagne <uuid> [--campagne <uuid>]
    python -m backend.data_retention --organisatie <uuid>
    python -m backend.data_retention --apply

campaigns.data_purged_at en organizations.retention_months (migratie
2026_09_24_add_data_retention.sql) staan bewust NIET op het ORM-model: een
kolom op het model komt in elke SELECT op die tabel, en een niet-gedraaide
migratie legde op 13 september elk rapport plat. Deze module leest en schrijft
ze met losse SQL en controleert eerst of ze bestaan.
"""
from __future__ import annotations

import argparse
import calendar
import logging
import sys
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Callable, Iterable

from sqlalchemy import DateTime, Integer, bindparam, inspect, select, text
from sqlalchemy.orm import Session

from backend.models import (
    GUID,
    Campaign,
    CampaignDecision,
    CampaignDeliveryCheckpoint,
    CampaignDeliveryRecord,
    Respondent,
    SurveyResponse,
)
from backend.survey_window import AMSTERDAM, today_amsterdam

logger = logging.getLogger(__name__)

STANDAARD_TERMIJN_MAANDEN = 24
MIGRATIE = "migrations/2026_09_24_add_data_retention.sql"

# Tabellen buiten het ORM met rijen per meting. Alleen geraakt als de tabel en
# de kolom bestaan (in een verse of lokale database ontbreken ze vaak). De
# namen zijn vaste constanten, geen invoer: ze mogen in de SQL-tekst.
NIET_ORM_TABELLEN: tuple[tuple[str, str], ...] = (
    ("campaign_action_audit_events", "campaign_id"),
    ("action_center_manager_responses", "campaign_id"),   # cascade: route_actions, action_reviews
    ("action_center_route_relations", "source_campaign_id"),
    ("action_center_route_relations", "target_campaign_id"),
    ("action_center_review_decisions", "route_source_id"),
)

_Q_PURGED = (text("select data_purged_at from campaigns where id = :id")
             .bindparams(bindparam("id", type_=GUID()))
             .columns(data_purged_at=DateTime(timezone=True)))
_U_PURGED = text("update campaigns set data_purged_at = :ts where id = :id").bindparams(
    bindparam("id", type_=GUID()), bindparam("ts", type_=DateTime(timezone=True)))
_Q_TERMIJN = (text("select retention_months from organizations where id = :id")
              .bindparams(bindparam("id", type_=GUID()))
              .columns(retention_months=Integer()))


class RetentieMigratieOntbreekt(RuntimeError):
    """--apply zonder de kolommen van de migratie: stoppen, niets raden."""


class ReportDataPurged(Exception):
    """Het rapport kan niet meer gemaakt worden: de gegevens zijn verwijderd."""

    def __init__(self, purged_at: datetime) -> None:
        from backend.report_html import _datum_nl
        self.purged_at = purged_at
        super().__init__(
            "De gegevens van deze meting zijn op " + (_datum_nl(purged_at) or "een onbekende datum")
            + " verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. "
            "Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is "
            "gedownload, blijft geldig.")


def _kolommen(db: Session, tabel: str) -> set[str]:
    """Kolommen van een tabel, leeg als de tabel niet bestaat.

    Via de verbinding van de sessie zelf, niet via de engine: een inspector op
    de engine haalt een verbinding uit de pool en geeft hem terug met een
    rollback. Bij één gedeelde verbinding (SQLite StaticPool in de tests) zou
    dat de lopende opschoning halverwege terugdraaien.
    """
    insp = inspect(db.connection())
    if not insp.has_table(tabel):
        return set()
    return {c["name"] for c in insp.get_columns(tabel)}


def migratie_gedraaid(db: Session) -> bool:
    return ("data_purged_at" in _kolommen(db, "campaigns")
            and "retention_months" in _kolommen(db, "organizations"))


def data_purged_at(db: Session, campaign_id: str) -> datetime | None:
    """Wanneer de gegevens van deze meting zijn verwijderd, of None.

    Zonder de kolom kan er niets zijn opgeschoond: opschonen() weigert --apply
    zonder migratie. None is dan de waarheid, geen terugval.
    """
    if "data_purged_at" not in _kolommen(db, "campaigns"):
        return None
    return db.execute(_Q_PURGED, {"id": campaign_id}).scalar()


def ensure_report_data_available(db: Session, campaign_id: str) -> None:
    """Fail Loud voor elke rapportroute: na de opschoning een leesbare reden."""
    purged = data_purged_at(db, campaign_id)
    if purged is not None:
        raise ReportDataPurged(purged)


def _plus_maanden(d: date, maanden: int) -> date:
    totaal = d.year * 12 + (d.month - 1) + maanden
    jaar, maand0 = divmod(totaal, 12)
    maand = maand0 + 1
    return date(jaar, maand, min(d.day, calendar.monthrange(jaar, maand)[1]))


def _sluitdag(closed_at: datetime) -> date:
    """De dag van sluiten in Nederlandse tijd; een naive datetime is UTC."""
    moment = closed_at if closed_at.tzinfo else closed_at.replace(tzinfo=timezone.utc)
    return moment.astimezone(AMSTERDAM).date()


@dataclass
class Meting:
    campaign_id: str
    organization_id: str | None
    status: str   # verlopen | opgeschoond | binnen_termijn | open | al_opgeschoond | geweigerd_open | onbekend | fout
    reden: str = ""            # "termijn" of "verzoek"
    gesloten_op: date | None = None
    verloopt_op: date | None = None
    termijn_maanden: int | None = None
    tellingen: dict[str, int] = field(default_factory=dict)
    fout: str = ""


@dataclass
class Rapportage:
    migratie_gedraaid: bool
    apply: bool
    metingen: list[Meting]


def _termijn(db: Session, organization_id: str, gedraaid: bool) -> int:
    if not gedraaid:
        return STANDAARD_TERMIJN_MAANDEN
    waarde = db.execute(_Q_TERMIJN, {"id": organization_id}).scalar()
    return waarde or STANDAARD_TERMIJN_MAANDEN


def _tellingen(db: Session, campaign_id: str) -> dict[str, int]:
    resp_ids = select(Respondent.id).where(Respondent.campaign_id == campaign_id)
    uit = {
        "respondenten": db.query(Respondent).filter(Respondent.campaign_id == campaign_id).count(),
        "antwoorden": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).count(),
        "open_tekst": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids),
                                                      SurveyResponse.open_text_raw.isnot(None)).count(),
        "besluit": (db.query(CampaignDecision).filter(CampaignDecision.campaign_id == campaign_id).count()
                    if _kolommen(db, "campaign_decisions") else 0),
    }
    for tabel, kolom in NIET_ORM_TABELLEN:
        if kolom in _kolommen(db, tabel):
            q = text("select count(*) from " + tabel + " where " + kolom + " = :id").bindparams(
                bindparam("id", type_=GUID()))
            uit[tabel + "." + kolom] = int(db.execute(q, {"id": campaign_id}).scalar() or 0)
    return uit


def _schoon_op(db: Session, campaign_id: str, nu: datetime) -> None:
    """Alle schrijfacties voor één meting; de aanroeper doet commit of rollback."""
    resp_ids = select(Respondent.id).where(Respondent.campaign_id == campaign_id)
    db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).delete(
        synchronize_session=False)
    db.query(Respondent).filter(Respondent.campaign_id == campaign_id).delete(
        synchronize_session=False)

    rec = db.query(CampaignDeliveryRecord).filter(
        CampaignDeliveryRecord.campaign_id == campaign_id).one_or_none()
    if rec is not None:
        rec.operator_notes = None
        rec.customer_handoff_note = None
        rec.next_step = None
        rec.self_send_config = {}
        rec.participant_comms_config = {}
        rec.self_send_reminders = []
        rec.updated_at = nu
        db.query(CampaignDeliveryCheckpoint).filter(
            CampaignDeliveryCheckpoint.delivery_record_id == rec.id).update(
            {CampaignDeliveryCheckpoint.operator_note: None,
             CampaignDeliveryCheckpoint.last_auto_summary: None},
            synchronize_session=False)

    if _kolommen(db, "campaign_decisions"):
        besluit = db.get(CampaignDecision, campaign_id)
        if besluit is not None:
            besluit.owner = ""
            besluit.primary_action = ""
            besluit.secondary_action = ""
            besluit.feedback_plan = ""
            besluit.success_criterion = ""
            besluit.recorded_by = None
            besluit.updated_at = nu

    for tabel, kolom in NIET_ORM_TABELLEN:
        if kolom in _kolommen(db, tabel):
            q = text("delete from " + tabel + " where " + kolom + " = :id").bindparams(
                bindparam("id", type_=GUID()))
            db.execute(q, {"id": campaign_id})

    db.execute(_U_PURGED, {"ts": nu, "id": campaign_id})


def _alleen_lezen(db: Session) -> None:
    """Dry-run op Postgres: de transactie kan niet schrijven, ook niet per ongeluk."""
    if db.get_bind().dialect.name == "postgresql":
        db.execute(text("SET TRANSACTION READ ONLY"))


def _inventaris(db: Session, *, vandaag: date, gedraaid: bool,
                campagne_ids: list[str], organisatie_ids: list[str]) -> list[Meting]:
    op_verzoek = bool(campagne_ids or organisatie_ids)
    q = db.query(Campaign)
    if campagne_ids:
        q = q.filter(Campaign.id.in_(campagne_ids))
    elif organisatie_ids:
        q = q.filter(Campaign.organization_id.in_(organisatie_ids))
    campagnes = q.order_by(Campaign.id).all()
    metingen: list[Meting] = []
    gevonden = {c.id for c in campagnes}
    for cid in campagne_ids:
        if cid not in gevonden:
            metingen.append(Meting(campaign_id=cid, organization_id=None, status="onbekend"))
    for c in campagnes:
        m = Meting(campaign_id=c.id, organization_id=c.organization_id, status="",
                   reden="verzoek" if op_verzoek else "termijn")
        if gedraaid and data_purged_at(db, c.id) is not None:
            m.status = "al_opgeschoond"
        elif c.is_active or c.closed_at is None:
            m.status = "geweigerd_open" if op_verzoek else "open"
        else:
            m.gesloten_op = _sluitdag(c.closed_at)
            m.termijn_maanden = _termijn(db, c.organization_id, gedraaid)
            m.verloopt_op = _plus_maanden(m.gesloten_op, m.termijn_maanden)
            m.status = "verlopen" if (op_verzoek or vandaag >= m.verloopt_op) else "binnen_termijn"
        metingen.append(m)
    return metingen


def opschonen(session_factory: Callable[[], Session], *, vandaag: date, apply: bool,
              campagne_ids: Iterable[str] = (), organisatie_ids: Iterable[str] = ()) -> Rapportage:
    """Bepaal welke metingen verlopen zijn en schoon ze op (alleen met apply).

    Op verzoek (campagne_ids of organisatie_ids): alleen die metingen, ongeacht
    de termijn, en nooit een open meting. Per meting één transactie.
    """
    campagne_ids = [str(uuid.UUID(str(c))) for c in campagne_ids]
    organisatie_ids = [str(uuid.UUID(str(o))) for o in organisatie_ids]
    db = session_factory()
    try:
        if not apply:
            _alleen_lezen(db)
        gedraaid = migratie_gedraaid(db)
        if apply and not gedraaid:
            raise RetentieMigratieOntbreekt(
                "De kolommen campaigns.data_purged_at en organizations.retention_months "
                "bestaan niet. Draai eerst " + MIGRATIE + " in Supabase.")
        metingen = _inventaris(db, vandaag=vandaag, gedraaid=gedraaid,
                               campagne_ids=campagne_ids, organisatie_ids=organisatie_ids)
    finally:
        db.rollback()
        db.close()

    nu = datetime.now(timezone.utc)
    for m in metingen:
        if m.status != "verlopen":
            continue
        db = session_factory()
        try:
            if not apply:
                _alleen_lezen(db)
            m.tellingen = _tellingen(db, m.campaign_id)
            if apply:
                _schoon_op(db, m.campaign_id, nu)
                db.commit()
                m.status = "opgeschoond"
            else:
                db.rollback()
        except Exception as exc:
            db.rollback()
            m.status = "fout"
            m.fout = type(exc).__name__ + ": " + str(exc)[:200]
            logger.exception("opschoning mislukt voor campagne %s", m.campaign_id)
        finally:
            db.close()
    return Rapportage(migratie_gedraaid=gedraaid, apply=apply, metingen=metingen)


_KOPPEN = {
    "verlopen": "VERLOPEN", "opgeschoond": "OPGESCHOOND", "binnen_termijn": "BINNEN TERMIJN",
    "open": "OPEN", "al_opgeschoond": "AL OPGESCHOOND", "geweigerd_open": "GEWEIGERD",
    "onbekend": "ONBEKEND", "fout": "FOUT",
}


def _regel(m: Meting, *, apply: bool) -> str:
    """Eén uitvoerregel: id's, datums en aantallen, nooit namen of inhoud."""
    kop = _KOPPEN[m.status].ljust(15) + "campagne=" + m.campaign_id
    if m.organization_id:
        kop += " organisatie=" + m.organization_id
    if m.status in ("open", "geweigerd_open"):
        return kop + ": loopt nog of heeft geen sluitdatum, niet geraakt"
    if m.status == "onbekend":
        return kop + ": deze id bestaat niet"
    if m.status == "al_opgeschoond":
        return kop + ": eerder opgeschoond, niets te doen"
    kop += (" gesloten=" + str(m.gesloten_op) + " termijn=" + str(m.termijn_maanden)
            + " mnd verloopt=" + str(m.verloopt_op) + " (" + m.reden + ")")
    if m.status == "binnen_termijn":
        return kop
    tellingen = " ".join(k + "=" + str(v) for k, v in m.tellingen.items())
    if m.status == "fout":
        return kop + " | " + tellingen + " | " + m.fout + " (teruggedraaid)"
    return kop + " | " + tellingen + " | " + ("opgeschoond" if apply else "dry-run: niets gewijzigd")


def _samenvatting(r: Rapportage) -> str:
    tel = {k: sum(1 for m in r.metingen if m.status == k) for k in _KOPPEN}
    return ("SAMENVATTING (" + ("opgeschoond" if r.apply else "dry-run") + "): "
            + str(tel["verlopen"]) + " verlopen, " + str(tel["opgeschoond"]) + " opgeschoond, "
            + str(tel["binnen_termijn"]) + " binnen de termijn, " + str(tel["open"]) + " open, "
            + str(tel["al_opgeschoond"]) + " al opgeschoond, " + str(tel["geweigerd_open"])
            + " geweigerd, " + str(tel["onbekend"]) + " onbekend, " + str(tel["fout"]) + " fouten.")


def _uuid_arg(waarde: str) -> str:
    try:
        return str(uuid.UUID(waarde))
    except ValueError:
        raise argparse.ArgumentTypeError("geen geldige uuid: " + repr(waarde)) from None


def main(argv: list[str] | None = None, *,
         session_factory: Callable[[], Session] | None = None,
         vandaag: date | None = None) -> int:
    ap = argparse.ArgumentParser(
        prog="python -m backend.data_retention",
        description="Schoon metingen op na de bewaartermijn. Zonder --apply schrijft dit niets.")
    ap.add_argument("--apply", action="store_true",
                    help="Echt opschonen. Zonder deze vlag is het een dry-run.")
    ap.add_argument("--campagne", action="append", default=[], type=_uuid_arg, metavar="UUID",
                    help="Op verzoek: alleen deze meting, ongeacht de termijn (mag vaker).")
    ap.add_argument("--organisatie", action="append", default=[], type=_uuid_arg, metavar="UUID",
                    help="Op verzoek: alle gesloten metingen van deze organisatie.")
    args = ap.parse_args(argv)

    if session_factory is None:
        from backend.database import SessionLocal, engine
        session_factory = SessionLocal
        print("database: " + engine.url.get_backend_name() + " op "
              + (engine.url.host or "een lokaal bestand"))
    try:
        rapport = opschonen(session_factory, vandaag=vandaag or today_amsterdam(), apply=args.apply,
                            campagne_ids=args.campagne, organisatie_ids=args.organisatie)
    except RetentieMigratieOntbreekt as exc:
        print("GESTOPT: " + str(exc))
        return 2
    if not rapport.migratie_gedraaid:
        print("LET OP: de migratie " + MIGRATIE + " is niet gedraaid. Deze dry-run rekent met "
              + str(STANDAARD_TERMIJN_MAANDEN) + " maanden voor elke organisatie en ziet niet "
              "welke metingen al zijn opgeschoond.")
    for m in rapport.metingen:
        print(_regel(m, apply=rapport.apply))
    print(_samenvatting(rapport))
    slecht = {"fout", "onbekend", "geweigerd_open"}
    return 1 if any(m.status in slecht for m in rapport.metingen) else 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)
    sys.exit(main())
```

- [ ] **Stap 4: Draai de tests en zie ze slagen**

```bash
$PY -m pytest tests/test_data_retention.py -q -p no:cacheprovider
```
Verwacht: alles `passed`. Geeft `data_purged_at` op SQLite een tekst in plaats van een datetime terug, dan werkt `.columns(data_purged_at=DateTime(timezone=True))` op `_Q_PURGED` niet in deze SQLAlchemy-versie: vervang de query dan door `select(literal_column("data_purged_at", DateTime(timezone=True))).select_from(table("campaigns")).where(literal_column("id") == bindparam("id", type_=GUID()))` (imports uit `sqlalchemy`). SQLite bewaart `closed_at` zonder tijdzone; `_sluitdag` leest een naive datetime als UTC, en dat is hoe `closed_at` wordt opgeslagen. Verzwak nooit een test om hem te laten slagen.

- [ ] **Stap 5: Faalset, syntax-guard, commit**

```bash
git add backend/data_retention.py tests/test_data_retention.py
git commit -F- -- backend/data_retention.py tests/test_data_retention.py <<'EOF'
feat(privacy): opschoning van metinggegevens na de bewaartermijn

python -m backend.data_retention, standaard dry-run. Verwijdert respondenten
en antwoorden van gesloten metingen waarvan de termijn (24 maanden of de
afgesproken termijn) verstreken is, anonimiseert vrije tekst per meting en
zet data_purged_at. Open metingen nooit, andere organisaties bij een verzoek
nooit, per meting één transactie, een tweede run doet niets. Op verzoek per
campagne of organisatie. --apply weigert zonder migratie.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 18: Rapport na de opschoning: 410 met een leesbare reden

**Files:**
- Modify: `backend/main.py`
- Create: `tests/test_data_retention_report.py`

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_data_retention_report.py`:
```python
"""Een rapportaanvraag na de opschoning geeft een nette melding (fixronde 24-9, Deel C).
SQLite via de gedeelde fixtures; nooit productie."""
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from backend import data_retention as dr
from backend.models import Campaign, Organization


def _campagne(db: Session, *, met_kolom: bool, opgeschoond: bool) -> str:
    if met_kolom:
        db.execute(text("alter table campaigns add column data_purged_at timestamp"))
    org = Organization(name="Org", slug="org-410", contact_email="hr@org.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Meting", scan_type="retention", is_active=False,
                    closed_at=datetime(2025, 1, 1, tzinfo=timezone.utc))
    db.add(camp)
    db.commit()
    if opgeschoond:
        db.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                   {"ts": datetime(2027, 1, 2, 3, 0), "id": camp.id})
        db.commit()
    return camp.id


def test_interne_rapportroute_geeft_410_met_reden(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    res = client.get("/api/internal/campaigns/" + cid + "/report")
    assert res.status_code == 410
    detail = res.json()["detail"]
    assert "zijn op 2 januari 2027 verwijderd" in detail
    assert "Een nieuw rapport maken kan daarom niet meer." in detail
    assert "blijft geldig" in detail


def test_preview_geeft_ook_410(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    assert client.get("/api/campaigns/" + cid + "/report-preview").status_code == 410


def test_zonder_kolom_of_zonder_opschoning_geen_410(db_session: Session):
    cid = _campagne(db_session, met_kolom=False, opgeschoond=False)
    dr.ensure_report_data_available(db_session, cid)   # geen uitzondering


def test_generate_report_pdf_weigert_ook_rechtstreeks(db_session: Session):
    import pytest

    from backend.main import _generate_report_pdf
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    with pytest.raises(dr.ReportDataPurged):
        _generate_report_pdf(cid, db_session)
```
(De `client`-fixture uit `tests/conftest.py` koppelt de app aan dezelfde `db_session`; zonder `BACKEND_ADMIN_TOKEN` en buiten productie laat `require_backend_admin_token` de aanroep door.)

```bash
$PY -m pytest tests/test_data_retention_report.py -q -p no:cacheprovider
```
Verwacht: FAIL (geen 410; de rapportgeneratie loopt door en faalt anders of geeft 200).

- [ ] **Stap 2: `backend/main.py`**

Bij de imports (bij de andere `from backend...`-regels):
```python
from backend.data_retention import ReportDataPurged, ensure_report_data_available
```
Direct boven `def _generate_report_pdf`:
```python
def _weiger_opgeschoonde_meting(db: Session, campaign_id: str) -> None:
    """410 met een leesbare reden als de gegevens van de meting volgens de
    bewaartermijn of op verzoek zijn verwijderd (fixronde 24-9, Deel C). Fail
    Loud: geen leeg of kapot rapport."""
    try:
        ensure_report_data_available(db, campaign_id)
    except ReportDataPurged as exc:
        raise HTTPException(status_code=410, detail=str(exc)) from exc
```
In `_generate_report_pdf`, direct na de `if campaign is None: raise ValueError(...)`-regel:
```python
    # Deel C: ook wie deze functie rechtstreeks aanroept, krijgt een reden.
    ensure_report_data_available(db, campaign_id)
```
En roep `_weiger_opgeschoonde_meting(db, campaign_id)` aan in vier routes, telkens direct na de controle `if not campaign: raise HTTPException(status_code=404, ...)`: `download_report`, `download_report_internal`, `report_html_preview`, `report_html_pdf`. In `report_html_preview` staat de aanroep vóór het `try`-blok, zodat de algemene `except Exception` er geen 500 van maakt.

- [ ] **Stap 3: Tests, faalset, commit**

```bash
$PY -m pytest tests/test_data_retention_report.py tests/test_report_generation_fallback.py tests/test_api_flows.py -q -p no:cacheprovider
```
Verwacht: alles `passed` of `skipped`. Backend-faalset-commando: `GEEN_REGRESSIES`; syntax-guard: `passed`.

```bash
git add tests/test_data_retention_report.py
git commit -F- -- backend/main.py tests/test_data_retention_report.py <<'EOF'
feat(privacy): rapportaanvraag na de opschoning geeft 410 met een leesbare reden

Na de bewaartermijn bestaan de antwoorden niet meer. Elke rapportroute zegt
dan wanneer de gegevens zijn verwijderd en dat een eerder gedownload rapport
geldig blijft, in plaats van een leeg of kapot rapport te maken.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 19: Dry-run van de opschoning (lokaal en, alleen-lezen, tegen productie)

Geen code; een meting. **`--apply` niet tegen productie.**

- [ ] **Stap 1: CLI-rooktest lokaal**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
DATABASE_URL="sqlite:///C:/Users/larsh/AppData/Local/Temp/loep-fixronde/leeg.db" $PY -c "from backend.database import init_db; init_db()"
DATABASE_URL="sqlite:///C:/Users/larsh/AppData/Local/Temp/loep-fixronde/leeg.db" $PY -m backend.data_retention; echo "exit=$?"
DATABASE_URL="sqlite:///C:/Users/larsh/AppData/Local/Temp/loep-fixronde/leeg.db" $PY -m backend.data_retention --apply; echo "exit=$?"
DATABASE_URL="sqlite:///C:/Users/larsh/AppData/Local/Temp/loep-fixronde/leeg.db" $PY -m backend.data_retention --campagne geen-uuid; echo "exit=$?"
```
Verwacht: de eerste run print `database: sqlite op een lokaal bestand`, de LET OP-regel over de migratie, een `SAMENVATTING (dry-run): 0 verlopen, ...` en `exit=0`; de tweede `GESTOPT: De kolommen ... bestaan niet ...` en `exit=2`; de derde een argparse-fout (`geen geldige uuid`) en `exit=2`. `init_db` maakt de ORM-tabellen aan (`Base.metadata.create_all`), zonder de twee migratiekolommen: precies de stand van productie vóór de migratie.

- [ ] **Stap 2: Dry-run tegen productie, alleen-lezen**

Alleen als `.env` in de hoofdmap een Postgres-`DATABASE_URL` naar Supabase bevat. Kopieer het bestand niet, druk de waarde niet af, zet hem niet in een commando dat in een log belandt:
```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe -c "from backend.database import engine; print(engine.url.get_backend_name(), engine.url.host)"
```
Is dat `postgresql` met een Supabase-host: draai de dry-run vanuit de worktree en geef de `DATABASE_URL` uit de `.env` van de hoofdmap alleen als omgevingsvariabele mee. Kopieer `.env` niet; zo staat de waarde in geen commando en geen log (`load_dotenv` overschrijft een bestaande omgevingsvariabele niet):
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
DATABASE_URL="$(grep '^DATABASE_URL=' ../../.env | cut -d= -f2-)" $PY -m backend.data_retention > /c/Users/larsh/AppData/Local/Temp/loep-fixronde/dryrun-productie.txt 2>&1; echo "exit=$?"
head -2 /c/Users/larsh/AppData/Local/Temp/loep-fixronde/dryrun-productie.txt
tail -1 /c/Users/larsh/AppData/Local/Temp/loep-fixronde/dryrun-productie.txt
```
Nooit `--apply` in deze stap.
Verwacht: `exit=0` (of 1 als er een fout is: dan staat hij in de uitvoer), een LET OP-regel zolang de migratie niet gedraaid is, en een samenvattingsregel. De transactie is `READ ONLY`; schrijven kan niet. Is het geen Postgres, of staat er geen `DATABASE_URL`: sla deze stap over en zet in het verslag dat de productie-dry-run door Lars gedraaid moet worden, met het commando.

- [ ] **Stap 3: In het verslag**

Alleen de samenvattingsregel en de aantallen per status, **geen campagne-id's van klanten, geen organisatienamen, geen inhoud**. Verwacht bij de huidige stand (september 2026, oudste meting van april 2026): nul verlopen.

---

## Taak 20: Campagnedetail toont een opgeschoonde meting eerlijk

Na de opschoning zou de campagnedetailpagina een gesloten meting met 0 antwoorden tonen ("te weinig antwoorden") en, als de status toch "rapport klaar" was, een downloadknop die 410 geeft. Dat is een stille misleiding. De pagina leest `data_purged_at` en toont dan één kaart met de reden, zonder statuskaart, downloadknop of besluitblok.

**Files:**
- Create: `frontend/lib/dashboard/data-purged.ts`, `frontend/lib/dashboard/data-purged.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`

- [ ] **Stap 1: Tests eerst**

`frontend/lib/dashboard/data-purged.test.ts`:
```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { dataPurgedMessage, loadDataPurgedAt } from '@/lib/dashboard/data-purged'

function fakeSupabase(result: { data: unknown; error: { code?: string; message: string } | null }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => result,
        }),
      }),
    }),
  } as unknown as SupabaseClient
}

describe('opgeschoonde meting (Deel C, bewaartermijn)', () => {
  it('geeft de datum terug als de gegevens verwijderd zijn', async () => {
    const supabase = fakeSupabase({ data: { data_purged_at: '2028-06-16T03:00:00Z' }, error: null })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBe('2028-06-16T03:00:00Z')
  })

  it('geeft null als de kolom nog niet bestaat: zonder kolom kan er niets zijn opgeschoond', async () => {
    const supabase = fakeSupabase({ data: null, error: { code: '42703', message: 'column does not exist' } })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBeNull()
  })

  it('valt luid om bij een andere fout', async () => {
    const supabase = fakeSupabase({ data: null, error: { code: '500', message: 'kapot' } })
    await expect(loadDataPurgedAt(supabase, 'c1')).rejects.toThrow('Kon niet nagaan of de gegevens van deze meting nog bestaan')
  })

  it('zegt wanneer en wat dat betekent', () => {
    expect(dataPurgedMessage('2028-06-16T03:00:00Z')).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.',
    )
  })

  it('de campagnepagina gebruikt het en toont dan geen downloadknop', () => {
    const page = readFileSync(path.join(process.cwd(), 'app/(dashboard)/campaigns/[id]/page.tsx'), 'utf8')
    expect(page).toContain('loadDataPurgedAt')
    expect(page).toContain('dataPurgedMessage')
    const start = page.indexOf('if (purgedAt)')
    const eind = page.indexOf('const [{ data: campaignMeta')
    expect(start).toBeGreaterThan(-1)
    expect(eind).toBeGreaterThan(start)
    const tak = page.slice(start, eind)
    expect(tak).toContain('dataPurgedMessage(purgedAt)')
    expect(tak).not.toContain('PdfDownloadButton')
    expect(tak).not.toContain('DecisionBlock')
  })
})
```
De laatste test is een broncontrole zoals de andere guard-tests in deze repo: de tak `if (purgedAt) { return (...) }` staat direct na `const stats = ...` en vóór de `Promise.all` met `campaignMeta`, en bevat geen downloadknop en geen besluitblok.

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde/frontend
npx vitest run lib/dashboard/data-purged.test.ts
```
Verwacht: FAIL.

- [ ] **Stap 2: `frontend/lib/dashboard/data-purged.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'

/**
 * Deel C (bewaartermijn): na de opschoning bestaan de antwoorden van een meting
 * niet meer. Zonder deze check toont de campagnepagina "te weinig antwoorden" en
 * een downloadknop die 410 geeft. De kolom bestaat pas na migratie
 * 2026_09_24_add_data_retention.sql; ontbreekt hij, dan kan er ook niets zijn
 * opgeschoond (de opschoning weigert zonder die kolom), dus null is dan waar.
 */
const COLUMN_MISSING_CODES = new Set(['42703', 'PGRST204'])

export async function loadDataPurgedAt(supabase: SupabaseClient, campaignId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('data_purged_at')
    .eq('id', campaignId)
    .maybeSingle()
  if (error) {
    if (COLUMN_MISSING_CODES.has(error.code ?? '')) return null
    throw new Error(`Kon niet nagaan of de gegevens van deze meting nog bestaan: ${error.message}`)
  }
  const value = (data as { data_purged_at?: string | null } | null)?.data_purged_at
  return value ?? null
}

/** Dezelfde zin als de 410 van de backend (backend/data_retention.py). */
export function dataPurgedMessage(purgedAtIso: string): string {
  const dag = formatDutchDate(purgedAtIso) ?? 'een onbekende datum'
  return `De gegevens van deze meting zijn op ${dag} verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.`
}
```

- [ ] **Stap 3: De campagnepagina**

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`: voeg `import { dataPurgedMessage, loadDataPurgedAt } from '@/lib/dashboard/data-purged'` toe, en direct na de regel `const stats = statsRow as CampaignStats`:

```tsx
  // Deel C (bewaartermijn): een opgeschoonde meting toont de reden, geen
  // statuskaart met 0 antwoorden en geen downloadknop die 410 geeft.
  const purgedAt = await loadDataPurgedAt(supabase, id)
  if (purgedAt) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
        >
          ← Alle metingen
        </Link>
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--dashboard-ink)]">
          {stats.campaign_name}
        </h2>
        <div role="status" className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">Gegevens verwijderd</p>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">{dataPurgedMessage(purgedAt)}</p>
        </div>
      </div>
    )
  }
```
Het pijltje `←` staat al zo op dezelfde pagina; het is geen streepje.

- [ ] **Stap 4: Tests en faalset**

```bash
npx vitest run lib/dashboard/data-purged.test.ts
```
Verwacht: groen. Daarna het frontend-faalset-commando: `131` en `GEEN_REGRESSIES`.

- [ ] **Stap 5: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
git add frontend/lib/dashboard/data-purged.ts frontend/lib/dashboard/data-purged.test.ts
git commit -F- -- frontend/lib/dashboard/data-purged.ts frontend/lib/dashboard/data-purged.test.ts "frontend/app/(dashboard)/campaigns/[id]/page.tsx" <<'EOF'
feat(dashboard): opgeschoonde meting toont de reden in plaats van nul antwoorden

Na de bewaartermijn toonde de campagnepagina 'te weinig antwoorden' en een
downloadknop die 410 gaf. Nu één kaart met dezelfde zin als de backend. Zonder
de nieuwe kolom (migratie nog niet gedraaid) verandert er niets.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---


# Afronding

## Taak 21: Eindverificatie, voorbeeldrapporten, leesronde light, browsercheck, verslag

**Files:**
- Modify: `docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.{html,pdf}`, `frontend/public/examples/` idem
- Modify: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (sectie "Afwijkingen bij de fixronde leesronde")
- Create: `docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md`

- [ ] **Stap 1: Alles opnieuw genereren**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
$PY scripts/stresstest_report.py
$PY scripts/render_besluit_max.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
```
Verwacht: 21 regels `[nn] ...` zonder traceback, twee regels `geschreven: docs/stresstest/zz_besluitmax_...`, en drie keer "Rapport opgeslagen (HTML)" met paden in `docs/examples/` en `frontend/public/examples/`.

- [ ] **Stap 2: Alles renderen in het productie-image**

Bouw het image opnieuw (`docker build -t loep-backend:test .`, de backend is gewijzigd) en volg het vaste recept zonder selectie, met `| tee /c/Users/larsh/AppData/Local/Temp/loep-fixronde/eind.txt`.

Verwacht: 26 bestanden (21 scenario's, twee `zz_besluitmax_`, drie voorbeelden), elk `warnings=0 emdash=0`, en `check=OK` behalve 01, 09 en 19 met hun ene `paginavulling`-bevinding op **hetzelfde of een hoger** percentage dan in de nulmeting. Elke andere bevinding is een blokkade: los hem op in de taak waar hij vandaan komt, met een eigen commit, en draai deze stap opnieuw. De regel `paginaverwijzing` controleert nu op elke pagina dat elk getoond nummer de pagina van het anker is; een `OK` betekent dus ook: rij 5 van de leidraad en de besluitpagina wijzen naar de pagina waar de werkvragen echt staan.

Vergelijk de paginatallen met de nulmeting:
```bash
diff <(grep -oE "^(OK|NIET OK) [^ ]+ paginas=[0-9]+" /c/Users/larsh/AppData/Local/Temp/loep-fixronde/nulmeting.txt | sed 's/^NIET //;s/^OK //') \
     <(grep -oE "^(OK|NIET OK) [^ ]+ paginas=[0-9]+" /c/Users/larsh/AppData/Local/Temp/loep-fixronde/eind.txt | sed 's/^NIET //;s/^OK //')
```
Een pagina meer of minder is geen fout, maar noteer elk verschil met de reden in het verslag.

- [ ] **Stap 3: Voorbeeld-PDF's op hun plek**

```bash
OUT=/c/Users/larsh/AppData/Local/Temp/loep-fixronde/out
for naam in voorbeeldrapport_loep voorbeeldrapport_retentiescan voorbeeldrapport_onboarding; do
  cp "$OUT/$naam.pdf" "docs/examples/$naam.pdf" && cp "$OUT/$naam.pdf" "frontend/public/examples/$naam.pdf"
done
$PY -m pytest tests/test_check_pdf_links.py -q -p no:cacheprovider
```
Verwacht: de linktests slagen ook op de nieuwe voorbeeld-PDF (met werkvragenverwijzing midden op een pagina).

- [ ] **Stap 4: Faalsets en syntax-guard**

Backend-faalset-commando (Taak 0 stap 3), `$PY -m pytest tests/test_python311_syntax_guard.py -q -p no:cacheprovider`, en het frontend-faalset-commando (Taak 0 stap 4). Verwacht: `GEEN_REGRESSIES`, `passed`, `131` en `GEEN_REGRESSIES`. Noteer het aantal nieuwe tests (backend `passed` voor en na, frontend aantal tests voor en na).

- [ ] **Stap 5: Frontend-build**

```bash
cd frontend && RESEND_API_KEY=re_dummy_build_only npm run build
```
Verwacht: build geslaagd. Zet de sleutel nooit in een bestand.

- [ ] **Stap 6: Koude leesronde light**

Geef een verse subagent (geen context van dit plan) de twee gerenderde PDF's `docs/examples/voorbeeldrapport_retentiescan.pdf` en `docs/examples/voorbeeldrapport_loep.pdf` en deze opdracht:

> Je bent de HR-manager van TechBouw B.V. Het rapport kwam vandaag binnen; morgen leid je 45 minuten MT zonder iemand van Loep erbij. Lees eerst Loep Behoud volledig, daarna Loep Vertrek. Beantwoord met citaten en paginanummers (rechtsonder): (1) Blijfintentie en vertrekintentie: zegt pagina twee wat die getallen wel en niet zeggen, en waarom het gesprek toch bij het startpunt begint? (2) Loep Vertrek: staat er, bij de werkvragen, in de leidraad en bij de open antwoorden, dat je niet over personen praat? Zie je wanneer deze mensen vertrokken, of staat er dat dat niet bekend is? (3) Klopt elke paginaverwijzing op pagina twee en op de besluitpagina? Controleer elk nummer door de pagina op te slaan. Wordt de frictiescore uitgelegd? (4) Lukt het slot van de vergadering in veertien minuten: zegt de leidraad wat je overslaat en wat je parkeert, heeft het tweede punt op de besluitpagina een regel voor eigenaar en datum, heeft de afdelingsafspraak een plek, en telt "Niets, dit zit hier goed" ergens als richting? Geef per punt: dicht, deels of open, met het citaat. Nieuwe problemen die je tegenkomt: noem ze met ernst (blokkerend, hinderlijk, cosmetisch).

Neem de uitkomst op in het verslag. Staat een van de vier punten op "open": los het op in de taak waar het hoort, met een eigen commit, en draai stap 1 tot en met 3 opnieuw.

- [ ] **Stap 7: Browsercheck van de site**

Voeg in `C:\Users\larsh\Desktop\Business\.claude\launch.json` een configuratie toe (en haal hem aan het eind van de taak weer weg):
```json
    ,{
      "name": "Fixronde leesronde (worktree)",
      "runtimeExecutable": "C:\\Program Files\\nodejs\\npm.cmd",
      "runtimeArgs": ["run", "dev"],
      "cwd": "Verisight/.worktrees/fixronde-leesronde/frontend",
      "port": 3104,
      "autoPort": true
    }
```
Start hem met de preview-tool (naam "Fixronde leesronde (worktree)") en controleer, op desktopbreedte en op 375 px (`resize_window` preset `mobile`, daarna terug naar `desktop`):

1. `/producten`: de sectie "Veelgestelde vragen" staat na de tarieven; elke vraag klapt open en toont het antwoord; de drie herschreven antwoorden staan erin; de tarievensectie toont "Minder dan 150 medewerkers".
2. `/producten`: `document.querySelectorAll('script[type="application/ld+json"]')` bevat een `FAQPage` met acht vragen, en elke `JSON.parse` slaagt (via `javascript_tool`, alleen lezen).
3. `/`: geen `FAQPage` meer in de JSON-LD.
4. `/kennismaking`: het veld "Omvang organisatie" biedt precies de vijf vakken uit Taak 13 en "Kies de omvang" als eerste. **Verstuur het formulier niet.**
5. Op 375 px op beide pagina's: `document.documentElement.scrollWidth === 375` (geen horizontale scroll), en geen fouten in de console.

Maak screenshots van de FAQ-sectie (dicht en met één vraag open) en van het omvangveld, desktop en mobiel, en zet ze in `docs/superpowers/plans/fixronde-leesronde-screenshots/` (er staan geen persoonsgegevens op deze publieke pagina's). Stop de server en haal de launch-configuratie weer weg.

- [ ] **Stap 8: Afwijkingen in de spec**

Voeg onderaan `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` een sectie `## Afwijkingen bij de fixronde leesronde (24-9)` toe, met een bolletje per besluit dat van de spec afwijkt of hem aanvult: de meetregel `paginaverwijzing` via link-annotaties (waardoor N1 van plan 3b terug kan); de tijdvakken 25-31 en 31-45; `has_direction` uit de leidraad; de duidingsalinea's op pagina twee (Behoud: intentie; Vertrek: frictie); de namenregel bij Loep Vertrek; de uitstroomperiode met de grens van vijf; de parkeerregel in plaats van een tweede eigenaar (geen migratie voor het besluit); het afdelingsblok op de besluitpagina (alleen op papier); "Waaraan zien we" bij het startpunt; de terugkoppelregel per scan (Loep Start ongewijzigd); de besluitvraag met het vervolgmoment in plaats van 90 dagen; de weging van "Niets" in de verdeeld-staat; de eindmarker van `besluit-op-een-a4`; eventuele hefbomen uit Taak 7 of een verlaagde `BESLUIT_TEKST_MAX` uit Taak 11.

- [ ] **Stap 9: Verslag**

`docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md`, in de vorm van `docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md`, met deze koppen: **Baselines** (tabel voor/na: backend failed/passed/skipped, faalset, 3.11-guard, tsc, vitest, nieuwe tests), **PDF-validatie in het productie-image** (aantal bestanden, warnings, streepjes, `check_pdf_report.py` per regel, paginatallen voor en na, de twee `zz_besluitmax_`-renders, hefbomen uit Taak 7 en 11), **Wat er is gebouwd, per taak** (taak, onderwerp, commit), **Leesronde-codes** (per code: dicht, deels, open, bewust niet, met de koude leesronde light als bewijs), **Wat de reviews vonden**, **Afwijkingen van het plan, en waarom**, **Deel C: opschoning** (de tabel uit C.1 zoals gebouwd, de uitkomst van de lokale dry-run en van de productie-dry-run met alleen aantallen, of dat die door Lars moet), **Browsercheck** (vijf punten, screenshots), **Wat Lars moet beslissen** (neem de lijst hieronder over en vul aan), **Bewust niet gedaan** (lijst hieronder, aangevuld), **Na merge** (Taak 22).

- [ ] **Stap 10: Commit (alles, ook als de sessie bijna op is)**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/fixronde-leesronde
git add docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md docs/superpowers/plans/fixronde-leesronde-screenshots
git commit -F- -- docs/superpowers/plans/2026-09-24-fixronde-leesronde-uitvoering.md docs/superpowers/plans/fixronde-leesronde-screenshots docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.html docs/examples/voorbeeldrapport_onboarding.pdf frontend/public/examples/voorbeeldrapport_loep.html frontend/public/examples/voorbeeldrapport_loep.pdf frontend/public/examples/voorbeeldrapport_retentiescan.html frontend/public/examples/voorbeeldrapport_retentiescan.pdf frontend/public/examples/voorbeeldrapport_onboarding.html frontend/public/examples/voorbeeldrapport_onboarding.pdf <<'EOF'
docs(fixronde): verslag, afwijkingen in de spec en nieuwe voorbeeldrapporten

Alle scenario's en voorbeelden gerenderd in het productie-image (WeasyPrint
70.0); voorbeeldrapporten opnieuw gegenereerd na de fixronde van 24-9.

de Co-Authored-By-regels zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
git status --short
```
Verwacht: `git status --short` toont geen gewijzigde bestanden meer in de worktree (hooguit ongetrackte bestanden die bewust buiten de commit bleven; noem ze in het verslag). **Niet mergen, niet pushen.**

---

## Taak 22: Wachtstap en controles na de merge (voor Lars en de hoofdsessie)

Geen agentwerk tijdens de bouw; dit hoort in het verslag onder "Na merge", in deze volgorde.

1. **Migratie `2026_09_24_add_data_retention.sql` in Supabase draaien** (Dashboard, SQL Editor), vóór de Railway-redeploy. Kopieerklaar: de SQL uit Taak 16 stap 2. Controlequery uit dezelfde stap, verwacht `true | true | true | 2`. Zonder migratie werkt alles zoals nu (rapporten, dashboard); alleen `--apply` van de opschoning weigert. Staat de migratie `2026_09_19_add_campaign_decisions.sql` van plan 3b nog open, draai die eerst.
2. **Railway-redeploy** (Python-wijzigingen in de rapportcode en `backend/main.py`); Vercel deployt de frontend vanzelf.
3. **Browsercheck op de vaste testklant** volgens `docs/testklant.md`: eerst `scripts/seed_test_tenant.py --dry-run`, dan `--reset`, dan `--login-link` (met de systeem-Python; inloggegevens nooit in een commit, log, verslag of screenshot). Controleer: campagne A (gesloten) toont de rapportkaart en het blok "Besluit vastleggen" met de labels "Waaraan zien we bij het startpunt dat het werkt", de parkeerregel bij het tweede punt en de nieuwe terugkoppelhint, en **geen** kaart "Gegevens verwijderd"; de download van campagne A geeft een PDF met de leidraad die naar de werkvragen wijst en de nieuwe besluitpagina; campagne B (lopend) en C (in te richten) tonen hetzelfde als voor de merge.
4. **Productie-dry-run van de opschoning** na de migratie: `python -m backend.data_retention` zonder `--apply` (zie Taak 19 stap 2); verwacht geen LET OP-regel meer en nul verlopen metingen.
5. **Railway-cron aanzetten** (zie C.3) is een besluit van Lars en de eerste echte `--apply`-run ook.

---

## Wat Lars moet beslissen

1. **Tijdsanker in de Vertrek-vertaalvragen (V1).** Veertien goedgekeurde vragen eindigen op "En toen de vertrekkers er nog werkten?" of een variant daarvan. Die vorm laat managers aan specifieke mensen terugdenken. Voorstel (alleen die zinsdelen, de rest van de vraag blijft letterlijk):
   - "En toen de vertrekkers er nog werkten?" wordt "En in de periode waarin deze mensen vertrokken?" (tien vragen: `ldd_feedback`, `ldd_escalation`, `ldd_availability`, `cud_safety`, `cud_conflict`, `cud_crossteam`, `wld_scope`, `wld_recovery`, `rcd_alignment`, `rcd_information`);
   - `grd_criteria`: "Stond dat er al toen de vertrekkers er nog werkten?" wordt "Stond dat er al in de periode waarin deze mensen vertrokken?";
   - `wld_peaks`: "Wie mocht dat zeggen toen de vertrekkers er nog werkten?" wordt "Wie mocht dat zeggen in de periode waarin deze mensen vertrokken?";
   - `wld_friction`: "Wat ervan bestond al toen de vertrekkers er nog werkten?" wordt "Wat ervan bestond al in de periode waarin deze mensen vertrokken?";
   - `rcd_expectations`: "Stonden ze er al toen de vertrekkers er nog werkten?" wordt "Stonden ze er al in de periode waarin deze mensen vertrokken?".
   (Gemeten op main `33920b49` in `WORK_QUESTIONS`, `backend/products/shared/deepening.py`; alleen de `exit`-tekst van elke vraag.)
   Akkoord, anders, of laten staan (de namenregel uit Taak 5 vangt het gesprek dan op)?
2. **De aansturingshint bij Loep Vertrek.** "Deze vraag gaat ook over de leidinggevenden aan deze tafel. Beantwoord hem eerst voor je eigen team." is goedgekeurde content, maar de leesronde noemt "eerst voor je eigen team" bij Vertrek als duwtje naar namen. Laten staan (met de namenregel eronder), of alleen bij Loep Behoud tonen?
3. **De maand van vertrek wordt in de self-send-flow nooit vastgelegd.** Taak 6 toont dan eerlijk dat hij ontbreekt, en de werkvragen ("een jaar geleden") hebben geen anker. Een vraag "In welke maand ben je vertrokken (of vertrek je)?" in de Vertrek-vragenlijst is een kleine vervolgtaak (geen migratie: `respondents.exit_month` bestaat al). Wil je die?
4. **Parkeerregel in plaats van een tweede eigenaar en datum.** Zo gebouwd, zonder migratie (zie "Besluit over de migratie"). Wil je voor plan 3c toch een eigenaar en datum per punt, dan komen `secondary_owner` en `secondary_follow_up_date` als additieve kolommen mee met de migratie van 3c.
5. **Afspraak per afdeling alleen op papier.** Het dashboard kan hem niet opslaan (geen veld). Hoort hij in het dashboard, dan is dat een kolom erbij in dezelfde vervolgmigratie.
6. **Terugkoppelhint in het dashboard is voor alle scans gelijk.** Het dashboardblok kent het scantype niet; de Vertrek-zin over "wie er nu werkt" staat alleen op de PDF. Goed zo, of het scantype doorgeven?
7. **Drie FAQ-antwoorden herschreven** (Taak 14): "Ziet het management scores van losse medewerkers?", "Is Loep Behoud een gevalideerde vertrekvoorspeller?", "Hoe vaak herhaal je Loep Behoud?". Akkoord met de tekst?
8. **Deel C, bewaartermijn:** (a) de migratie draaien (Taak 22); (b) de Railway-cron aanzetten en de eerste `--apply`-run, of liever handmatig per kwartaal; (c) een termijn voor leads (`contact_requests`) en leerdossiers (`pilot_learning_*`), die nu buiten de opschoning vallen: advies twee jaar na het laatste contact, met een eigen regel in de privacyverklaring; (d) de verwerkersovereenkomst noemt nu "verwijdert of anonimiseert"; de back-ups van Supabase bewaren verwijderde rijen nog tot hun eigen termijn. Wil je dat in de DPA benoemen?; (e) een vergelijking met een meting van meer dan twee jaar oud kan na de opschoning niet meer; wil je bij plan 3c een momentopname van de geaggregeerde cijfers bij het sluiten?
9. **Dashboardoverzicht en rapportenlijst na een opschoning.** De campagnedetailpagina zegt het eerlijk (Taak 20); `/dashboard` en `/reports` tonen een opgeschoonde meting nog als gesloten meting met 0 antwoorden (of laten hem uit de rapportenlijst vallen). Een vervolgtaak, pas relevant na de eerste opschoning.
10. **Alleen als het gebeurde:** een verlaagde `BESLUIT_TEKST_MAX` (Taak 11) of hefbomen op pagina twee (Taak 7), en een pagina twee die ook na hefboom C niet paste.
11. **De twee pdf's in `Loep_Docs`** (`Loep onepager.pdf`, `Loep methodische verantwoording.pdf`) zijn nog oude exports; opnieuw exporteren uit de bijgewerkte HTML.

## Bewust niet gedaan

- **Loep Start (S1 tot en met S8):** buiten deze ronde (besluit Lars). Ook de besluitpagina en de terugkoppelhint van Loep Start zijn ongewijzigd.
- **R6, tweede helft:** zeggen dat de grootste richting en de grootste toelichting hetzelfde zeggen. Vraagt een koppeling tussen toelichtingen en routes die in september is geschrapt; de zin zou een verband beweren dat het rapport niet meet.
- **R7 en V7 (twee groepen met hetzelfde getal op één pagina), R9 (drie onderwerpen op 7.1), R10 (werkbeleving, welk geval), R11 (resterend jargon), R12 (labels behoudscontext), R13 (dubbele mededeling in de kop), R14 (zin over kleine afdelingen), R16 (afgebroken kaarten op de methodiekpagina), R17 (label verdeeld beeld), R18 (percentage in de richtingregel op p.02), R19 (opties met 0), V3 (beloning als reden en als sterk onderwerp):** niet in de top vier van deze ronde; kandidaten voor de volgende.
- **De 72 vertaalvragen en de verdeeld-zinnen:** goedgekeurde content, ongewijzigd (zie beslispunt 1 en 2).
- **Kolommen voor een tweede eigenaar en datum:** zie "Besluit over de migratie".
- **Een HTTP-endpoint voor de opschoning:** zie C.3 (Railway-cron in plaats daarvan).
- **`/dashboard` en `/reports` na een opschoning:** zie beslispunt 9.

---

## Zelfreview

**1. Dekking van de opdracht**

| Eis (opdracht 24-9) | Taak |
|---|---|
| Deel A1: blijf- en vertrekintentie een zin op p.02, wel/niet zeggen, waarom startpunt, geen oorzaak/voorspelling, p.02 één A4 | 3 (zin + tests op oorzaak/voorspelling), 7 (A4-meting met hefbomen), 21 stap 2 |
| Deel A2: namenregel bij werkvragen en in de leidraad, regel bij open antwoorden | 5 |
| Deel A2: uitstroomperiode op p.02 | 6 |
| Deel A2: vertaalvragen niet herschrijven; tijdsanker als beslispunt met concrete tekst | 5 (niets aan de vragen), "Wat Lars moet beslissen" punt 1 |
| Deel A3: verwijzing weer naar `LEIDRAAD_ANKERS["werkvragen"]` | 2 (leidraad en besluitpagina) |
| Deel A3: meetregel controleert getoond nummer tegen ankerpagina, robuust, test die faalt bij verkeerd nummer | 1 (link-annotaties, onderzocht op 84 echte links; synthetische en mutatietest op de echte PDF) |
| Deel A3: frictiescore uitleg op p.02 | 4 |
| Deel A4: leidraad zegt wat je overslaat en wat doorschuift | 2 |
| Deel A4: tweede punt eigenaar en datum, migratie of parkeerregel, advies, bouwen | "Besluit over de migratie", 9 |
| Deel A4: afdelingsafspraak en samenvallen met het tweede punt (R5) | 8 |
| Deel A4: "Niets" telt niet als richting in de verdeeld-zin | 10 |
| Deel A4, verwant op dezelfde pagina: R4 succes per punt, R8/V4 terugkoppeling, R15 termijn | 9 |
| Besluitpagina blijft één A4 met een maximaal besluit | 1 (eindmarker), 11 |
| Deel B5: "Minder dan 150 medewerkers", één bron, JSON-LD, llms.txt, tests in lockstep | 12 |
| Deel B6: omvangvakken gelijk aan de staffel, API-validatie en opslag gecontroleerd, oude waarden | 13 |
| Deel B7: FAQ zichtbaar op `/producten`, JSON-LD verhuist, weg van de homepage, één bron, inhoud getoetst | 14 |
| Deel B8: naam "Lars van den Hengel" in `frontend/` en `Loep_Docs` (archiefkopie eerst) | 15 (repo al schoon, bevestigd met grep) |
| Deel C1: datamodel per tabel, verwijderen/anonimiseren/bewaren, advies, rapport niet stil breken | C.1, 17, 18, 20 |
| Deel C2: afwijkende termijn per organisatie, migratie kopieerklaar en idempotent, wachtstap | C.2, 16, 22 |
| Deel C3: idempotent script, dry-run standaard, `--apply` expliciet, log per meting, nooit open of binnen termijn, één transactie per meting; periodiek draaien; wie zet het aan en hoe zie je het | C.3, 17, 19, 22 |
| Deel C4: op verzoek per campagne of organisatie, dry-run standaard | 17 (`campagne_ids`, `organisatie_ids`, CLI `--campagne`, `--organisatie`) |
| Deel C5: tests op termijn, open metingen, andere organisaties, tweede run, rapport na opschoning; alleen SQLite | 17, 18 |
| Deel C6: geen `--apply` tegen productie; dry-run met alleen aantallen in het verslag | Deel C kop, 19, 21 stap 9 |
| Python 3.11-guard, `pytest tests`, productie-image, 21 scenario's opnieuw genereren, 01/09/19 niet slechter | 0, 7, 11, 21 |
| Copyregels (je/jij, Loep als onderwerp, geen streepjes, geen jargon/advies/oorzaak) | tests in 3, 4, 14; review per taak |
| Nooit RLS, privacygates, staffels of drempels verzwakken | geen drempel verlaagd; uitstroomperiode achter `MIN_SEGMENT_N`; trigger in 16 maakt RLS strenger |
| Baselines 25 / 131 / 47 per testnaam, taak 0 legt vast, laatste taak vergelijkt | 0, 21 stap 4 |
| Eindverificatie: voorbeeldrapporten (HTML + PDF, beide mappen), leesronde light op de vier punten, `npm run build` met dummy, browsercheck `/producten` en `/kennismaking` desktop en 375 px | 21 |
| Migratie: SQL kopieerklaar, wachtstap, dashboardcheck op de testklant (`--dry-run`, dan `--reset`) | 16, 22 |
| Worktree, branch, subagent-driven met twee reviews, geen kale stash, niet mergen of pushen, verslag, alles committen | kop van het plan, 0, 21 stap 10 |

**2. Placeholder-scan.** Gezocht naar "TBD", "TODO", "later", "vergelijkbaar met", "voeg foutafhandeling toe": geen. Drie plekken geven een terugvaloptie in plaats van één vaste weg, omdat het gedrag alleen in de echte omgeving te zien is, en elke keer met de exacte vervanging: de lege-link-test in Taak 1 (PyMuPDF en een lege tekst), de `.columns()`-query op SQLite in Taak 17, en de keuze van scenario 06 in Taak 11. De hefbomen in Taak 7 en de verlaagde grens in Taak 11 staan met hun volledige code en een harde stopregel.

**3. Consistentie van namen en signaturen.**
- `_leidraad_block(scan_type, *, has_segments, has_quotes, has_deepening, has_werkvragen=False, intentie_duiding=False)`: Taak 2 haalt `has_direction` weg en voegt `has_werkvragen` toe, Taak 3 voegt `intentie_duiding` toe; alle testaanroepen in Taak 2, 3 en 5 gebruiken deze vorm. `_leidraad_html(..., has_werkvragen=False, intentie_duiding=False)` zonder `direction_agg`, in Taak 2 en 3; de drie renderers in Taak 2.
- `_wq_block` wordt in Taak 2 vóór pagina twee berekend en blijft dezelfde variabele voor `_prioriteringsraster` en `_besluit_page(heeft_werkvragen=...)`.
- `BESLUIT_SLOTLABEL` ontstaat in Taak 1 ("Waaraan zien we dat het werkt") en krijgt in Taak 9 zijn nieuwe waarde; `check_pdf_report.BESLUIT_SLOT = "Waaraan zien we"` is in beide een voorvoegsel.
- `_besluit_page(..., afdeling=None)` uit Taak 8; `BESLUIT_PARKEERREGEL`, `BESLUIT_TERUGKOPPELING`, `BESLUITVRAAG` uit Taak 9; de testhelper `_besluit(**kw)` staat in de Taak 8-sectie van `tests/test_report_leesronde_fixes.py` en wordt in Taak 9 hergebruikt.
- `_brugzin(..., tweede_key=None)` en `_besluit_afdeling(seg, scan_type, tweede_key)` in Taak 8, met `_tweede_key` in beide renderers.
- `_richtingen_weging(st, scan_type, factor_key)` in Taak 10; `_werkvragen_block` zet `st = None` zonder richtingdata.
- `_uitstroomperiode(exit_months, n) -> (regel, ontbreekt)` en `_responsbasis(..., uitstroom_regel="", extra_ontbreekt=None)` in Taak 6; `build_report_data["exit_months"]`.
- Testhelpers in `tests/test_report_leesronde_fixes.py`: `_plain`, `_rij`, `_href`, `_exit_met_toelichtingen` (Taak 2) worden in latere secties hergebruikt; de imports per sectie staan onder hun kop met `# noqa: E402`.
- Deel C: `opschonen(session_factory, *, vandaag, apply, campagne_ids=(), organisatie_ids=()) -> Rapportage`, `Meting.status` met de acht waarden uit `_KOPPEN`, `data_purged_at`, `ensure_report_data_available`, `ReportDataPurged`, `RetentieMigratieOntbreekt`, `_schoon_op(db, campaign_id, nu)` (door de fouttest gemonkeypatcht onder dezelfde naam), `main(argv, *, session_factory, vandaag)`. In `backend/main.py`: `_weiger_opgeschoonde_meting(db, campaign_id)`. Frontend: `loadDataPurgedAt(supabase, campaignId)` en `dataPurgedMessage(iso)`, met dezelfde zin als `ReportDataPurged`.
- Taaknummers: het vaste recept wordt gebruikt in Taak 0, 7, 11 en 21; Taak 0 zegt dat Taak 21 met de nulmeting vergelijkt.

