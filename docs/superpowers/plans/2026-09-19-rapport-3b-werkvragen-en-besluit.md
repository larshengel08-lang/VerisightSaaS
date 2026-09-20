# Rapport 3b: werkvragen per startpunt en de besluitpagina: Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Het rapport brengt het MT van "dit kozen je mensen" naar "dit gaan wij doen": per startpunt drie werkvragen op de gespreksagenda, een invulbaar A4 "Besluit van het MT" vóór de appendix, en hetzelfde besluit vast te leggen in het dashboard, zodat het rapport het daarna voordrukt.

**Architecture:** De werkvragen zijn pure content plus één pure keuzefunctie in `backend/products/shared/deepening.py` (naast `DIRECTION_SETS`); `backend/report_html.py` rendert het blok onder "Wat er moet gebeuren" en een nieuwe besluitpagina die het oude blok "Uit de bespreking" vervangt. Het besluit leeft in één nieuwe tabel `campaign_decisions` (één rij per meting, RLS: leden lezen, eigenaar en operator schrijven); de frontend schrijft via een server action met upsert, de backend leest de rij via de bestaande sessie en drukt hem voor. De 72 vertaalvragen en de verdeeld-zinnen zijn gated content: de code en de guardtests staan klaar vóór de reviewgate, de teksten komen er pas in na akkoord van Lars.

**Tech Stack:** Python 3.11 (Railway én het lokale venv), FastAPI, SQLAlchemy, pytest, PyMuPDF, WeasyPrint 70.0 in het eigen productie-image (`Dockerfile`, `python:3.11-slim-bookworm`), Next.js App Router, Supabase (Postgres met RLS), vitest.

**Spec:** `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md`, onderdeel 3 (par. 6), onderdeel 4 (par. 7), par. 11 (migratie), par. 12 (verificatie), par. 2 (ontwerpregels) en de sectie "Afwijkingen bij plan 3a". **Content:** `docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md` (reviewgate, zie Taak 13). **Intakes:** `docs/superpowers/plans/2026-09-16-rapport-3a-uitvoering.md` (gat B3 open, "Bewust niet gedaan"), `docs/rapport-koude-leesronde-2026-09-16.md` (B3, H7, H11, H12), `docs/rapport-stresstest-2026-09-10.md` (Q3 staat op 10✓/10~/1✗).

**Stand van main:** `5dc757be` (plan 3a en klantsuite 2b gemerged). Baselines: backend `pytest tests` 25 falend; frontend `npx tsc --noEmit` 133 en `npx vitest run` 59 falend.

---

## Besloten context die overal doorwerkt

1. **Propositiebesluit 19-9 (optie A): de bespreking door Loep is uit het aanbod.** De HR-manager van de klant leidt het MT-gesprek zelf; het rapport is haar script. Geen enkele nieuwe zin veronderstelt een externe begeleider, "de bespreking met Loep" of "de begeleide managementbespreking". Het oude blok heet "Uit de bespreking" met de hint "In te vullen tijdens de bespreking"; de nieuwe pagina heet **"Besluit van het MT"** en de hints zeggen "In te vullen door het MT".
2. **Loep Start** krijgt de werkvragen niet (geen richtingdata), de besluitpagina wél, in een eerlijke variant zonder richtingkoppeling.
3. **De klant ziet nooit individuele antwoorden.** `campaign_decisions` bevat alleen wat het MT zelf invult. Geen join met `survey_responses` of `respondents`, nergens.
4. **Dashboardblok "Besluit vastleggen"** verschijnt alleen op een gesloten meting met rapport (`state.kind === 'report_ready'`, dezelfde gate als de downloadknop). Schrijven: eigenaar of operator (`canManage`). Meelezers zien het besluit alleen-lezen. Opslagfout = zichtbare melding, nooit stil succes. Eén rij per meting (upsert op `campaign_id`), met `recorded_by` en `updated_at`.
5. **De besluitpagina in de PDF is invulbaar met de pen** (lijnen), geen PDF-formulier. Staat er een besluit in `campaign_decisions`, dan drukt het rapport dat voor en zegt het wanneer het is vastgelegd.
6. **Aannames op advies, door Lars nog te bevestigen** (zo bouwen, zie "Wat Lars moet beslissen" onderaan): de laatste pagina van de appendix is uitgezonderd van de 40%-vullingsregel; de formulering "Wat dit rapport niet doet" uit plan 3a blijft staan (geen taak in dit plan).

---

## Vaste regels voor elke taak

1. **Copy:** Nederlands, je/jij, Loep is het onderwerp (nooit "ik" of "wij"), geen HR-jargon, geen advies en geen oorzaak-claims. Eerlijkheid is een verkoopargument, geen disclaimer.
2. **Geen em-dashes en geen en-dashes in klantcopy.** Dubbele punt, komma, punt of `&middot;`. Elke nieuwe copytest bevat een guard op het em-streepje (U+2014) en het en-streepje (U+2013) in de gerenderde body.
3. **Generieke-zin-test:** elke nieuwe rapportzin moet iets bevatten dat uit de data van deze meting komt (een getal, een onderwerpnaam, een gekozen optie) of eerlijk zeggen welke data ontbreekt. Een zin die ongewijzigd in elk rapport past, mag alleen als hij een vaste vraag of een vaste grens is (de besluitvraag, de H7-regel).
4. **Elke telling heeft een noemer in de vaste tellingsvorm van 3a:** `_telling(x, y)` ("6 van de 13 (46%)" vanaf tien, zonder percentage daaronder) met de uitleg van de noemer in dezelfde zin. Nooit een kale telling.
5. **Geen nieuwe drempels.** De herkenningsvraag gebruikt `_deepening_shows_distribution` (`answered >= 5`, `DEEPENING_DISTRIBUTION_MIN_N`); de richtingstaten komen uit `direction_state`. Nooit RLS, policies, privacygates, staffels of drempels verzwakken om een test te laten slagen. Faalt een test op een gate, dan is de fixture te arm, niet de gate te streng.
6. **Fail Loud.** Geen stil weggelaten blok, geen kaal veld, geen verzonnen waarde, geen ruwe sleutel in een klant-PDF. Onbekende sleutel of onbekend scantype: `KeyError`/`ValueError` met een duidelijke melding.
7. **Python 3.11.** Geen backslash en geen hergebruikt aanhalingsteken binnen een f-string-expressie (PEP 701 is 3.12); bouw zulke stukken met `+` of een lokale variabele. `tests/test_python311_syntax_guard.py` moet groen blijven.
8. **Pagina twee blijft één A4** (regel `p02-op-een-a4` in `scripts/check_pdf_report.py`). De leidraad krijgt geen extra rij; rij 5 wijst naar de besluitpagina met een echt paginanummer.
9. **Testcommando backend** (vanuit de worktree-root, altijd met pad `tests`):
   `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -rf -p no:cacheprovider`
   Het venv staat in de hoofdcheckout en resolveert `backend` naar de worktree. Nooit `pytest` zonder pad vanuit de repo-root.
10. **Gate is de faalset per testnaam**, nooit alleen het aantal. Taak 0 legt de drie faalsets vast, Taak 15 vergelijkt. Na elke backendtaak draai je het faalset-commando uit Taak 0.
11. **Regelnummers in dit plan zijn de stand op main `5dc757be`.** Ze verschuiven zodra een eerdere taak hetzelfde bestand raakt; het geciteerde ankerfragment is leidend, zoek daarop.
12. **Wijk je af van de spec of van dit plan, documenteer dat in de spec** onder een nieuw kopje "Afwijkingen bij plan 3b" (aangemaakt in Taak 4), in dezelfde commit.
13. **Contract-tests die oude copy pinnen gaan in lockstep mee.** Elke taak noemt ze bij naam. Een test aanpassen mag alleen omdat de spec de nieuwe copy voorschrijft; zeg in de commit welke test en waarom.
14. **Voorbeeld-HTML's en PDF's** (`docs/examples/`, `frontend/public/examples/`) regenereer je alleen in Taak 15.
15. **Git:** worktree `.worktrees/rapport-3b`, branch `feature/rapport-3b`. Nooit kaal `git stash` of `git stash pop` (de stash-stack is gedeeld tussen worktrees en sessies); gebruik een tijdelijke WIP-commit die je daarna met `git reset --soft HEAD~1` terugneemt. **Niet mergen, niet pushen.**
16. **Werkwijze:** subagent-driven-development, per taak één implementer, daarna een spec-compliance-review en een codekwaliteitsreview, met herreviews tot beide akkoord zijn.
17. **Commitblokken:** de `Co-Authored-By`-regels in dit plan zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies.

---

## Omgevingsvalkuilen

- `frontend/.env.local` mist `RESEND_API_KEY`. Voor `npm run build` zet je in de shell `RESEND_API_KEY=re_dummy_build_only` (alleen in de shell-omgeving, nooit in een bestand).
- De `.venv` mist `httpx`. `scripts/seed_test_tenant.py --reset` en `--login-link` draai je met de systeem-Python (`python scripts/seed_test_tenant.py ...`); `--dry-run` werkt met het venv.
- `frontend/node_modules` in de hoofdmap is leeg. Installeer in de worktree (`cd .worktrees/rapport-3b/frontend && npm install`) en zet daarna `package-lock.json` terug met `git checkout -- package-lock.json` als `npm install` hem wijzigde. Maak nooit een junction naar `node_modules`: `rmdir /s /q` op een junction leegt het doel.
- Docker Desktop hangt soms op `%LOCALAPPDATA%\Docker\run\dockerInference`. Fix: alle Docker-processen stoppen, de map `%LOCALAPPDATA%\Docker\run` hernoemen, Docker Desktop herstarten. **Nooit factory reset.**
- WeasyPrint kan lokaal niet renderen (geen GTK op Windows); PDF-tests slaan over via `requires_weasyprint`. **PDF's valideer je in het productie-image** (zie hieronder), niet in de ghcr-image (die draait WeasyPrint 58.1, productie 70.0).
- `docs/stresstest/` is gitignored. Genereer altijd eerst opnieuw met `.venv/Scripts/python.exe scripts/stresstest_report.py`, anders meet je oude HTML.
- De echte Railway-host is `web-production-bf382.up.railway.app`; `GET /api/health` geeft de live git-sha en `pdf_renderer`.

## PDF's renderen in het productie-image (vast recept)

Dit recept wordt in Taak 0, 6, 8, 9 en 15 gebruikt. Het script `scripts/render_in_image.py` wordt in Taak 0 aangemaakt.

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
docker build -t loep-backend:test .
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe scripts/stresstest_report.py
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-3b/out
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b:/repo:ro" \
  -v "C:/Users/larsh/AppData/Local/Temp/loep-3b/out:/out" \
  loep-backend:test sh -c "pip install -q pymupdf; python /repo/scripts/render_in_image.py"
```

Verwacht: per HTML-bestand één regel `OK <naam> warnings=0 emdash=0 check=OK`, en een slotregel `TOTAAL n bestanden, 0 met bevindingen`. Exitcode 0. De PDF's staan in `C:/Users/larsh/AppData/Local/Temp/loep-3b/out`.

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid | Taken |
|---|---|---|
| `migrations/2026_09_19_add_campaign_decisions.sql` (nieuw) | Eén additieve, idempotente migratie: tabel `campaign_decisions` met RLS én kolom `campaigns.previous_campaign_id` (ongebruikt tot plan 3c) | 1 |
| `supabase/schema.sql` | Hetzelfde blok onderaan, zodat een verse omgeving niet afwijkt van productie | 1 |
| `backend/models.py` | ORM-model `CampaignDecision`. **`previous_campaign_id` komt bewust NIET in het model** (zie Taak 2) | 2 |
| `backend/report_decision.py` (nieuw) | `load_decision(db, campaign_id)`: leest de besluitrij, met een zichtbare terugval als de tabel ontbreekt | 2 |
| `backend/report_html.py` | `build_report_data` levert `decision`; `_nl_tijd` via `ZoneInfo`; werkvragenblok; besluitpagina; leidraad rij 5; H7-regel op de afdelingspagina; dunne verdiepingsblokken | 2, 3, 5, 6, 7, 9 |
| `backend/report_css.py` | Stijl van het werkvragenblok en de besluitpagina; `verd-los` | 5, 6, 9 |
| `backend/products/shared/deepening.py` | `WORK_QUESTIONS`, `WORK_QUESTION_VARIANTS`, `work_question`, `work_question_variant`, `translation_question` | 4, 13 |
| `scripts/render_in_image.py` (nieuw) | Rendert alle HTML in `docs/stresstest/` en `docs/examples/` binnen het productie-image en draait `check_pdf_report` erop | 0 |
| `scripts/check_pdf_report.py` | Regel `besluit-op-een-a4`; uitzondering voor de appendixstaart | 8 |
| `generate_voorbeeldrapport.py`, `scripts/stresstest_report.py` | Geen wijziging in de data; alleen opnieuw draaien | 15 |
| `frontend/lib/dashboard/campaign-decision.ts` (nieuw) | Type, normalisatie en validatie van het besluit (puur) | 10 |
| `frontend/app/(dashboard)/campaigns/[id]/decision-actions.ts` (nieuw) | Server action `saveCampaignDecisionAction` (rechten, gate, upsert, Fail Loud) | 11 |
| `frontend/components/dashboard/decision-block.tsx` (nieuw) | Formulier voor eigenaar en operator, alleen-lezen weergave voor meelezers | 12 |
| `frontend/app/(dashboard)/campaigns/[id]/page.tsx` | Laadt het besluit (Fail Loud bij queryfout) en toont het blok onder de downloadknop | 12 |
| `tests/test_campaign_decisions_migration.py` (nieuw) | SQL-guard: RLS aan, policies, geen delete, idempotent, schema.sql in lockstep | 1 |
| `tests/test_report_decision_data.py` (nieuw) | Model, `load_decision`, `build_report_data["decision"]` | 2 |
| `tests/test_work_questions_logic.py` (nieuw) | `translation_question` per richtingstaat, met neutrale fixturevragen | 4 |
| `tests/test_report_werkvragen.py` (nieuw) | Herkenningsvraag, besluitvraag, blok, wiring, H7-regel | 5 |
| `tests/test_report_besluitpagina.py` (nieuw) | Besluitpagina leeg en voorgedrukt, drie producten, degraded, leidraad rij 5 | 6, 7 |
| `tests/test_check_pdf_besluit.py` (nieuw) | De twee wijzigingen in `check_pdf_report.py`, op PDF's die PyMuPDF zelf bouwt | 8 |
| `tests/test_work_questions_content.py` (nieuw) | Guardtest op de gevulde set (Taak 13) | 13 |
| `docs/superpowers/plans/plan3b-baseline-failset.txt` (nieuw) | Backend-faalset | 0 |
| `docs/rapport-stresstest-2026-09-10.md` | Sectie "Na plan 3b" | 15 |
| `docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md` (nieuw) | Uitvoeringsverslag, zelfde vorm als het 3a-verslag | 15 |

Bestaande tests die in lockstep meegaan (per taak benoemd): `tests/test_report_paginavulling.py`, `tests/test_report_p02_mtvel.py`, `tests/test_report_meetgegevens.py`, `tests/test_direction_report_block.py`, `tests/test_report_leesbaarheid.py`, `tests/test_report_onboarding_degraded_agenda.py`, `tests/test_report_design_sprong.py`.

---

## Taakvolgorde

| Taak | Spec | Onderwerp | Hangt af van | Vóór de reviewgate? |
|---|---|---|---|---|
| 0 | par. 12 | Worktree, drie baselines, productie-image, `render_in_image.py` | | ja |
| 1 | par. 7, 11 | Migratie `campaign_decisions` + `previous_campaign_id`, SQL-guard | 0 | ja |
| 2 | par. 11 | Model, `load_decision`, `build_report_data["decision"]` | 1 | ja |
| 3 | restpunt 3 | `_nl_tijd` via `ZoneInfo` | 0 | ja |
| 4 | par. 6 | Datastructuur en keuzefunctie van de vertaalvraag (content leeg) | 0 | ja |
| 5 | par. 6 | Blok "Zo maak je er een besluit van" + H7-regel | 4 | ja |
| 6 | par. 7 | Besluitpagina (leeg), "Uit de bespreking" weg, leidraad rij 5 | 5 | ja |
| 7 | par. 7 | Besluitpagina voorgedrukt uit `campaign_decisions` | 2, 6 | ja |
| 8 | restpunt 2, par. 12 | `check_pdf_report.py`: `besluit-op-een-a4`, appendixstaart | 6 | ja |
| 9 | restpunt 1 | Dunne verdiepingsblokken lopen door (gemeten in het productie-image) | 8 | ja |
| 10 | par. 7 | Frontend: type, normalisatie, validatie | 0 | ja |
| 11 | par. 7 | Frontend: server action | 10 | ja |
| 12 | par. 7 | Frontend: blok en pagina | 11 | ja |
| 13 | par. 6, bijlage A | **GATE.** `WORK_QUESTIONS` en de verdeeld-zinnen vullen uit het goedgekeurde conceptdocument | 4, akkoord Lars | **nee** |
| 14 | par. 11 | **WACHTSTAP.** Lars draait de migratie op productie | 1 | n.v.t. |
| 15 | par. 12 | Eindverificatie: 21 scenario's en 3 voorbeelden in het productie-image, matrix, leesronde light, browsercheck, faalsets, verslag | alles | **nee** |

Taak 3, 4 en 10 hangen alleen van Taak 0 af en mogen in elke volgorde; omdat Taak 2 t/m 9 allemaal `backend/report_html.py` raken, lopen ze na elkaar, niet parallel. De frontendtaken (10 t/m 12) raken geen backendbestand.

---

## Taak 0: Worktree, drie baselines, productie-image en het renderscript

**Files:**
- Create: `docs/superpowers/plans/plan3b-baseline-failset.txt`
- Create: `scripts/render_in_image.py`

- [ ] **Stap 1: Worktree aanmaken vanaf main**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v "^??" ; echo "(bovenstaande moet leeg zijn: geen ongecommitte wijzigingen aan getrackte bestanden)"
git worktree add .worktrees/rapport-3b -b feature/rapport-3b main
cd .worktrees/rapport-3b && git log --oneline -1
```
Verwacht: `5dc757be Merge feature/rapport-3a: ...` of de dan geldende top van main. Staat dit plan of het conceptdocument untracked in de hoofdmap, kopieer ze dan naar dezelfde paden in de worktree; ze gaan mee in de commit van stap 7.

- [ ] **Stap 2: Tooling controleren**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe --version
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -c "import pymupdf; from zoneinfo import ZoneInfo; print('pymupdf ok', ZoneInfo('Europe/Amsterdam'))"
docker --version && docker info --format "{{.ServerVersion}}"
```
Verwacht: `Python 3.11.9`, `pymupdf ok Europe/Amsterdam`, twee Docker-versieregels. Hangt `docker info`: zie "Omgevingsvalkuilen". Faalt de `ZoneInfo`-import: `.venv/Scripts/python.exe -m pip install "tzdata>=2024.1"`.

- [ ] **Stap 3: Backend-faalset vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
mkdir -p /c/Users/larsh/AppData/Local/Temp/loep-3b
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > docs/superpowers/plans/plan3b-baseline-failset.txt
wc -l < docs/superpowers/plans/plan3b-baseline-failset.txt
```
Verwacht: `25`. Wijkt het af, stop en meld het: dan is main niet op de bekende baseline.

Vanaf hier is het **faalset-commando** na elke backendtaak:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > /c/Users/larsh/AppData/Local/Temp/loep-3b/na.txt; diff docs/superpowers/plans/plan3b-baseline-failset.txt /c/Users/larsh/AppData/Local/Temp/loep-3b/na.txt && echo GEEN_REGRESSIES
```
Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 4: Frontend installeren en baselines vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b/frontend
npm install
git checkout -- package-lock.json
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-baseline.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-baseline.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-baseline-fails.txt
wc -l < /c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-baseline-fails.txt
```
Verwacht: `133` (tsc) en `59` (falende tests). De vitest-suite is licht wisselvallig (`app/(dashboard)/beheer/health/page.test.ts` laadt af en toe niet): wijkt het getal af, draai de vitest-regel opnieuw en vergelijk namen. `vitest-baseline-fails.txt` is de gate voor Taak 15.

- [ ] **Stap 5: Schrijf `scripts/render_in_image.py`**

Dit script draait alleen bínnen het productie-image. Het rendert elke rapport-HTML met dezelfde WeasyPrint als productie, telt de waarschuwingen van de renderer, telt em-dashes en en-dashes in de tekstlaag en draait `check_pdf_report` op het resultaat.

```python
"""Render alle rapport-HTML in het productie-image en controleer de PDF's.

Draait BINNEN het image `loep-backend:test` (zie plan 3b, "PDF's renderen in
het productie-image"). /repo is de read-only gemounte worktree, /out de
uitvoermap. Lokaal op Windows werkt dit niet: WeasyPrint heeft daar geen GTK.

Wat het meet per bestand:
  warnings   WARNING/ERROR-records op de `weasyprint`-logger tijdens de render
  streepjes  em-dashes en en-dashes in de tekstlaag van de PDF
  check      scripts/check_pdf_report.py, alle regels

Exitcode 0 als elk bestand schoon is, anders 1. Het script verzint niets: kan
een bestand niet gerenderd worden, dan telt dat als een bevinding.
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

REPO = Path("/repo")
OUT = Path("/out")
sys.path.insert(0, str(REPO))

import pymupdf  # noqa: E402
from weasyprint import HTML  # noqa: E402

from scripts import check_pdf_report as cpr  # noqa: E402

# De drie voorbeeldrapporten die de site linkt, plus alle scenario's.
VOORBEELDEN = ("voorbeeldrapport_loep.html", "voorbeeldrapport_retentiescan.html",
               "voorbeeldrapport_onboarding.html")


class _Teller(logging.Handler):
    def __init__(self) -> None:
        super().__init__(level=logging.WARNING)
        self.regels: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.regels.append(record.getMessage())


def _bronnen(selectie: list[str]) -> list[Path]:
    bronnen = sorted((REPO / "docs" / "stresstest").glob("*.html"))
    bronnen += [REPO / "docs" / "examples" / naam for naam in VOORBEELDEN]
    bronnen = [b for b in bronnen if b.exists()]
    if selectie:
        bronnen = [b for b in bronnen if any(b.name.startswith(s) for s in selectie)]
    return bronnen


def main() -> int:
    bronnen = _bronnen(sys.argv[1:])
    if not bronnen:
        print("GEEN BRONNEN: draai eerst scripts/stresstest_report.py in de worktree")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    met_bevindingen = 0
    for bron in bronnen:
        teller = _Teller()
        log = logging.getLogger("weasyprint")
        log.addHandler(teller)
        pdf = OUT / (bron.stem + ".pdf")
        try:
            HTML(filename=str(bron)).write_pdf(str(pdf))
        except Exception as exc:  # een render die omvalt is zelf de bevinding
            print("FOUT " + bron.name + " render mislukt: " + type(exc).__name__ + ": " + str(exc))
            met_bevindingen += 1
            continue
        finally:
            log.removeHandler(teller)
        doc = pymupdf.open(str(pdf))
        tekst = "".join(p.get_text() for p in doc)
        paginas = doc.page_count
        doc.close()
        streepjes = tekst.count("\u2014") + tekst.count("\u2013")
        bevindingen = cpr.check(str(pdf))
        schoon = not teller.regels and not streepjes and not bevindingen
        print(("OK " if schoon else "NIET OK ") + bron.stem
              + " paginas=" + str(paginas)
              + " warnings=" + str(len(teller.regels))
              + " emdash=" + str(streepjes)
              + " check=" + ("OK" if not bevindingen else str(len(bevindingen))))
        for regel in teller.regels:
            print("   warning: " + regel)
        for b in bevindingen:
            print("   " + str(b))
        if not schoon:
            met_bevindingen += 1
    print("TOTAAL " + str(len(bronnen)) + " bestanden, " + str(met_bevindingen) + " met bevindingen")
    return 1 if met_bevindingen else 0


if __name__ == "__main__":
    sys.exit(main())
```

Het script bevat geen f-strings (Python 3.11-veilig) en de streepjes staan als `\u2014` en `\u2013`, zodat het bestand zelf geen em-dash draagt. Een selectie geef je mee als argumenten: `python /repo/scripts/render_in_image.py 01 09 19` rendert alleen die scenario's.

- [ ] **Stap 6: Productie-image bouwen en de nulmeting draaien**

Volg het vaste recept ("PDF's renderen in het productie-image") en bewaar de uitvoer door achter het `docker run`-commando `| tee /c/Users/larsh/AppData/Local/Temp/loep-3b/nulmeting.txt` te zetten. Daarna:

```bash
grep -c "^NIET OK" /c/Users/larsh/AppData/Local/Temp/loep-3b/nulmeting.txt
grep -A4 "^NIET OK" /c/Users/larsh/AppData/Local/Temp/loep-3b/nulmeting.txt
```
Verwacht: **4 bestanden NIET OK**, alle vier alleen op `paginavulling`: `01_vlak_middelmatig`, `09_gemengde_afdelingen` en `19_vlak_niets_nodig` (een dunne verdiepingspagina alleen op een vel, 26 tot 36%) en `voorbeeldrapport_loep` (appendixstaart, 36%). Overal `warnings=0 emdash=0`. Wijkt dit af (andere bestanden, andere regels, of warnings), stop en meld het: Taak 8 en 9 zijn op deze nulmeting gebouwd.

- [ ] **Stap 7: Commit**

```bash
git add docs/superpowers/plans/plan3b-baseline-failset.txt scripts/render_in_image.py docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md
git commit -m "test(baseline): faalset en renderscript voor plan 3b

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 1: Migratie `campaign_decisions` + `campaigns.previous_campaign_id`

Eén additieve, idempotente migratie (spec par. 11), zodat Lars maar één keer SQL hoeft te draaien. `previous_campaign_id` blijft ongebruikt tot plan 3c. De RLS volgt het patroon van `migrations/2026_09_13_add_campaign_action_audit_events.sql`, met één verschil dat de spec voorschrijft: schrijven mag alleen de **eigenaar** (`is_org_owner`) of de operator, niet elk lid (`is_org_manager` omvat ook `member`). Klanten kunnen een besluit bijwerken maar niet verwijderen.

**Files:**
- Create: `migrations/2026_09_19_add_campaign_decisions.sql`
- Modify: `supabase/schema.sql` (hetzelfde blok onderaan het bestand)
- Test: `tests/test_campaign_decisions_migration.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende test**

`tests/test_campaign_decisions_migration.py`:

```python
"""SQL-guard op de migratie van plan 3b (spec 2026-09-16 par. 7 en 11).

De migratie kan lokaal niet tegen Postgres draaien; deze tests pinnen daarom de
tekst: RLS aan, leden lezen, alleen eigenaar en operator schrijven, geen delete
voor klanten, alles idempotent, en supabase/schema.sql in lockstep (schema-drift
was bevinding H3 van de security-audit van 2026-07-13).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIE = ROOT / "migrations" / "2026_09_19_add_campaign_decisions.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"

KOLOMMEN = ("campaign_id", "organization_id", "decided_at", "primary_topic", "primary_action",
            "owner", "follow_up_date", "secondary_topic", "secondary_action",
            "feedback_plan", "success_criterion", "recorded_by", "created_at", "updated_at")


def _sql() -> str:
    return re.sub(r"\s+", " ", MIGRATIE.read_text(encoding="utf-8")).lower()


def test_tabel_heeft_de_kolommen_uit_de_spec():
    sql = _sql()
    assert "create table if not exists public.campaign_decisions" in sql
    for kolom in KOLOMMEN:
        assert re.search(r"\b" + kolom + r"\b", sql), kolom


def test_een_rij_per_meting():
    """campaign_id is de primaire sleutel: de upsert in de frontend leunt daarop."""
    assert re.search(r"campaign_id uuid primary key references public\.campaigns\(id\) on delete cascade",
                     _sql())


def test_rls_staat_aan_en_leden_lezen():
    sql = _sql()
    assert "alter table public.campaign_decisions enable row level security" in sql
    assert re.search(r"for select using \(public\.is_org_member\(organization_id\) "
                     r"or public\.is_verisight_admin_user\(\)\)", sql)


def test_alleen_eigenaar_en_operator_schrijven():
    sql = _sql()
    for soort in ("insert", "update"):
        assert re.search(r"for " + soort + r"\b[^;]*public\.is_org_owner\(organization_id\) "
                         r"or public\.is_verisight_admin_user\(\)", sql), soort
    # is_org_manager omvat ook de rol 'member' (meelezer): die mag hier niet schrijven.
    assert "is_org_manager" not in sql


def test_update_policy_heeft_using_en_with_check():
    """Zonder with check kan een eigenaar een rij naar een andere organisatie omhangen."""
    blok = re.search(r"create policy \"org_owners_can_update_decisions\".*?;", _sql()).group(0)
    assert " using (" in blok and " with check (" in blok


def test_klanten_kunnen_geen_besluit_verwijderen():
    sql = _sql()
    assert "revoke delete on public.campaign_decisions from authenticated" in sql
    assert "for delete" not in sql


def test_organisatie_van_het_besluit_is_die_van_de_meting():
    """De policies kijken naar organization_id op de besluitrij. Zonder deze
    trigger kan een eigenaar van organisatie A een rij schrijven met
    campaign_id van organisatie B en organization_id van A."""
    sql = _sql()
    assert "create or replace function public.campaign_decisions_org_guard()" in sql
    assert "create trigger campaign_decisions_org_guard_trg" in sql
    assert "drop trigger if exists campaign_decisions_org_guard_trg" in sql


def test_previous_campaign_id_zit_in_dezelfde_migratie():
    sql = _sql()
    assert ("alter table public.campaigns add column if not exists previous_campaign_id uuid "
            "references public.campaigns(id) on delete set null") in sql


def test_migratie_is_idempotent():
    sql = _sql()
    assert sql.count("create policy") == sql.count("drop policy if exists")
    assert "create table public." not in sql.replace("create table if not exists public.", "")
    assert "create index if not exists" in sql


def test_schema_sql_draagt_hetzelfde_blok():
    schema = re.sub(r"\s+", " ", SCHEMA.read_text(encoding="utf-8")).lower()
    assert "create table if not exists public.campaign_decisions" in schema
    assert "alter table public.campaign_decisions enable row level security" in schema
    assert "org_owners_can_update_decisions" in schema
    assert "previous_campaign_id" in schema
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_campaign_decisions_migration.py -q -p no:cacheprovider`
Verwacht: FAIL met `FileNotFoundError` op het migratiebestand.

- [ ] **Stap 3: Schrijf de migratie**

`migrations/2026_09_19_add_campaign_decisions.sql`:

```sql
-- Migration: campaign_decisions + campaigns.previous_campaign_id
-- Hoort bij: plan 3b (docs/superpowers/plans/2026-09-19-rapport-3b-werkvragen-en-besluit.md),
-- spec docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md par. 7 en 11.
-- Uitvoeren in: Supabase Dashboard -> SQL Editor, VOOR de Railway-redeploy van plan 3b.
-- Additief en idempotent: opnieuw draaien verandert niets.
--
-- campaign_decisions: het besluit dat het MT na het gesprek vastlegt. Een rij
-- per meting. Bevat alleen wat het MT zelf invult; geen koppeling met
-- survey_responses of respondents.
-- previous_campaign_id: koppeling naar de vorige meting. Blijft ongebruikt tot
-- plan 3c (vervolgmeting); staat hier zodat er maar een keer SQL gedraaid hoeft
-- te worden. De backend leest deze kolom nog niet.

create table if not exists public.campaign_decisions (
  campaign_id       uuid primary key references public.campaigns(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  decided_at        date,
  primary_topic     text not null default '',
  primary_action    text not null default '',
  owner             text not null default '',
  follow_up_date    date,
  secondary_topic   text not null default '',
  secondary_action  text not null default '',
  feedback_plan     text not null default '',
  success_criterion text not null default '',
  recorded_by       uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists campaign_decisions_org_idx
  on public.campaign_decisions (organization_id);

-- De policies hieronder kijken naar organization_id op de besluitrij. Deze
-- trigger dwingt af dat die gelijk is aan de organisatie van de meting, zodat
-- niemand een besluit aan de meting van een andere organisatie kan hangen.
create or replace function public.campaign_decisions_org_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  campaign_org uuid;
begin
  select c.organization_id into campaign_org from public.campaigns c where c.id = new.campaign_id;
  if campaign_org is null or campaign_org <> new.organization_id then
    raise exception 'campaign_decisions: organisatie van het besluit wijkt af van die van de meting';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists campaign_decisions_org_guard_trg on public.campaign_decisions;
create trigger campaign_decisions_org_guard_trg
  before insert or update on public.campaign_decisions
  for each row execute function public.campaign_decisions_org_guard();

alter table public.campaign_decisions enable row level security;

-- Leden van de organisatie lezen; alleen de eigenaar en de Loep-operator
-- schrijven. is_org_owner en niet de ruimere manager-check: die omvat ook de
-- rol 'member' (meelezer). Service-role (de backend) omzeilt RLS.
drop policy if exists "org_members_can_select_decisions" on public.campaign_decisions;
create policy "org_members_can_select_decisions"
  on public.campaign_decisions for select
  using (public.is_org_member(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_insert_decisions" on public.campaign_decisions;
create policy "org_owners_can_insert_decisions"
  on public.campaign_decisions for insert
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

drop policy if exists "org_owners_can_update_decisions" on public.campaign_decisions;
create policy "org_owners_can_update_decisions"
  on public.campaign_decisions for update
  using (public.is_org_owner(organization_id) or public.is_verisight_admin_user())
  with check (public.is_org_owner(organization_id) or public.is_verisight_admin_user());

-- Een besluit wordt bijgewerkt, niet gewist: er is bewust geen delete-policy,
-- en het recht zelf is ingetrokken.
revoke delete on public.campaign_decisions from authenticated;
revoke all on public.campaign_decisions from anon;

-- Koppeling naar de vorige meting (plan 3c). Nullable, geen default, geen index
-- nodig op dit volume.
alter table public.campaigns
  add column if not exists previous_campaign_id uuid
  references public.campaigns(id) on delete set null;
```

`is_org_member`, `is_org_owner` en `is_verisight_admin_user` bestaan op productie (gezet door `migrations/2026_07_13_lock_individual_data_to_operator.sql`, live toegepast op 2026-07-13); de migratie definieert ze daarom niet opnieuw.

- [ ] **Stap 4: Zet hetzelfde blok onderaan `supabase/schema.sql`**

Plak onderaan `supabase/schema.sql` een kopregel en daarna de volledige inhoud van de migratie vanaf `create table if not exists public.campaign_decisions` tot en met het `alter table public.campaigns`-statement:

```sql

-- ── Plan 3b (2026-09-19): besluit van het MT per meting + koppeling vorige meting ──
-- Gelijk aan migrations/2026_09_19_add_campaign_decisions.sql.
```

- [ ] **Stap 5: Draai de test en zie hem slagen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_campaign_decisions_migration.py -q -p no:cacheprovider`
Verwacht: `10 passed`.

- [ ] **Stap 6: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 7: Commit**

```bash
git add migrations/2026_09_19_add_campaign_decisions.sql supabase/schema.sql tests/test_campaign_decisions_migration.py
git commit -m "feat(db): migratie campaign_decisions met RLS en previous_campaign_id

Leden lezen, alleen eigenaar en operator schrijven, geen delete. Een trigger
houdt de organisatie van het besluit gelijk aan die van de meting.
Nog NIET gedraaid op productie: dat is de wachtstap in Taak 14.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 2: Model `CampaignDecision`, `load_decision` en `build_report_data["decision"]`

De backend leest het besluit via de bestaande sessie (spec par. 11). Twee dingen die uit het incident van 13 september volgen (een niet-gedraaide migratie legde toen élk rapport plat):

1. **`previous_campaign_id` komt NIET in het ORM-model `Campaign`.** Een kolom in het model wordt in elke `SELECT` op `campaigns` meegenomen; ontbreekt hij op productie, dan faalt elke campagnequery. De kolom is tot plan 3c ongebruikt, dus het model blijft zoals het is. Plan 3c voegt hem toe.
2. **Het lezen van `campaign_decisions` mag een rapport niet platleggen als de tabel ontbreekt.** Dat is geen stille terugval: `load_decision` logt een error en geeft `unavailable=True` terug, en de besluitpagina (Taak 7) zegt dan in één regel dat Loep niet kon nagaan of er al een besluit is vastgelegd. Elke andere fout blijft een fout.

`load_decision` wordt als **eerste** aangeroepen in `build_report_data`, vóór de campagnequery: een mislukt statement maakt in Postgres de transactie onbruikbaar en vraagt een `rollback()`, en een rollback aan het begin kan geen al geladen objecten laten verlopen.

**Files:**
- Modify: `backend/models.py` (nieuw model direct na `class CampaignDeliveryRecord`, vóór `class CampaignDeliveryCheckpoint`)
- Create: `backend/report_decision.py`
- Modify: `backend/report_html.py` (`build_report_data`, anker `def build_report_data(campaign_id: str, db: Session)`; import bovenaan)
- Test: `tests/test_report_decision_data.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_decision_data.py`:

```python
"""Het besluit van het MT in de rapportdata (plan 3b, spec 16-9 par. 7 en 11).

Bron is de tabel campaign_decisions, een rij per meting, geschreven door de
frontend. De backend leest alleen. Ontbreekt de tabel (migratie niet gedraaid),
dan valt het rapport niet om maar zegt de data dat het besluit niet te lezen was.
"""
import logging
from datetime import date

from sqlalchemy.orm import Session

from backend.models import Campaign, CampaignDecision
from backend.report_decision import load_decision
from backend.report_html import build_report_data
from tests.test_report_meetgegevens import _campagne


def _cid(db: Session) -> str:
    return _campagne(db, comms_mode="self_send", completed=12, rows=12,
                     invited_count=20, launch_date=date(2026, 3, 9), closed_at=None)


def _besluit(db: Session, cid: str, **velden) -> None:
    camp = db.query(Campaign).filter(Campaign.id == cid).one()
    basis = dict(campaign_id=cid, organization_id=camp.organization_id,
                 decided_at=date(2026, 4, 2), primary_topic="Groeiperspectief",
                 primary_action="Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.",
                 owner="Sanne de Vries", follow_up_date=date(2026, 6, 15))
    basis.update(velden)
    db.add(CampaignDecision(**basis))
    db.commit()


def test_zonder_rij_is_er_geen_besluit(db_session: Session):
    cid = _cid(db_session)
    assert load_decision(db_session, cid) == (None, False)


def test_rij_komt_terug_als_dict_met_alle_velden(db_session: Session):
    cid = _cid(db_session)
    _besluit(db_session, cid, secondary_topic="Werkdruk", secondary_action="Piekrooster herzien.",
             feedback_plan="HR vertelt het in het teamoverleg van mei.",
             success_criterion="Iedereen heeft een afspraak op papier.")
    besluit, unavailable = load_decision(db_session, cid)
    assert unavailable is False
    assert besluit["primary_topic"] == "Groeiperspectief"
    assert besluit["primary_action"].startswith("Elke leidinggevende")
    assert besluit["owner"] == "Sanne de Vries"
    assert besluit["decided_at"] == date(2026, 4, 2)
    assert besluit["follow_up_date"] == date(2026, 6, 15)
    assert besluit["secondary_topic"] == "Werkdruk"
    assert besluit["feedback_plan"].startswith("HR vertelt")
    assert besluit["success_criterion"].startswith("Iedereen")
    assert besluit["updated_at"] is not None
    # Wie het vastlegde is een gebruikers-id en hoort niet in een klant-PDF.
    assert "recorded_by" not in besluit


def test_een_lege_rij_telt_niet_als_besluit(db_session: Session):
    """De frontend weigert een besluit zonder 'wat precies', maar een rij die
    toch leeg is mag geen voorgedrukte lege pagina met 'Vastgelegd op' opleveren."""
    cid = _cid(db_session)
    _besluit(db_session, cid, decided_at=None, primary_topic="", primary_action="  ",
             owner="", follow_up_date=None)
    assert load_decision(db_session, cid) == (None, False)


def test_ontbrekende_tabel_legt_het_rapport_niet_plat(db_session: Session, caplog):
    cid = _cid(db_session)
    CampaignDecision.__table__.drop(bind=db_session.get_bind())
    with caplog.at_level(logging.ERROR, logger="backend.report_decision"):
        besluit, unavailable = load_decision(db_session, cid)
    assert (besluit, unavailable) == (None, True)
    assert "campaign_decisions" in caplog.text
    # De sessie is na de rollback nog bruikbaar: het rapport moet verder kunnen.
    assert db_session.query(Campaign).filter(Campaign.id == cid).count() == 1


def test_build_report_data_levert_het_besluit(db_session: Session):
    cid = _cid(db_session)
    _besluit(db_session, cid)
    data = build_report_data(cid, db_session)
    assert data["decision"]["owner"] == "Sanne de Vries"
    assert data["decision_unavailable"] is False


def test_build_report_data_zonder_besluit(db_session: Session):
    data = build_report_data(_cid(db_session), db_session)
    assert data["decision"] is None
    assert data["decision_unavailable"] is False


def test_campaign_model_draagt_previous_campaign_id_nog_niet():
    """Bewust: een kolom in het model zit in elke SELECT op campaigns. Staat de
    migratie nog niet op productie, dan valt elke campagnequery om (incident
    2026-09-13). Plan 3c voegt de kolom toe zodra hij gebruikt wordt."""
    assert "previous_campaign_id" not in Campaign.__table__.columns
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_decision_data.py -q -p no:cacheprovider`
Verwacht: FAIL bij het importeren: `ImportError: cannot import name 'CampaignDecision' from 'backend.models'`.

- [ ] **Stap 3: Voeg het model toe**

In `backend/models.py`, direct na het einde van `class CampaignDeliveryRecord` (na zijn `__repr__`) en vóór `class CampaignDeliveryCheckpoint`:

```python
class CampaignDecision(Base):
    """Het besluit dat het MT na het gesprek vastlegt (plan 3b, spec 16-9 par. 7).

    Een rij per meting; de frontend schrijft hem (upsert op campaign_id), de
    backend leest hem alleen om de besluitpagina voor te drukken. Bevat alleen
    wat het MT zelf invult, geen koppeling met antwoorden of respondenten.
    Migratie: migrations/2026_09_19_add_campaign_decisions.sql.

    Let op: campaigns.previous_campaign_id uit dezelfde migratie staat bewust
    nog NIET op het Campaign-model (zie tests/test_report_decision_data.py).
    """

    __tablename__ = "campaign_decisions"

    campaign_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("campaigns.id", ondelete="CASCADE"), primary_key=True)
    organization_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    decided_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    primary_topic: Mapped[str] = mapped_column(Text, nullable=False, default="")
    primary_action: Mapped[str] = mapped_column(Text, nullable=False, default="")
    owner: Mapped[str] = mapped_column(Text, nullable=False, default="")
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    secondary_topic: Mapped[str] = mapped_column(Text, nullable=False, default="")
    secondary_action: Mapped[str] = mapped_column(Text, nullable=False, default="")
    feedback_plan: Mapped[str] = mapped_column(Text, nullable=False, default="")
    success_criterion: Mapped[str] = mapped_column(Text, nullable=False, default="")
    recorded_by: Mapped[str | None] = mapped_column(GUID(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    def __repr__(self) -> str:
        return f"<CampaignDecision campaign_id={self.campaign_id!r}>"
```

Er komt bewust geen `relationship` op `Campaign`: een relatie met `cascade` of eager loading zou de tabel in campagnequery's trekken, en precies dat moet niet.

- [ ] **Stap 4: Schrijf `backend/report_decision.py`**

```python
"""Het vastgelegde besluit van het MT lezen voor het rapport (plan 3b).

Eigen module en geen functie in report_html.py: dit is het enige stuk van de
rapportdata dat een tabel leest die door de frontend wordt geschreven en die
op een omgeving kan ontbreken (migratie nog niet gedraaid).

Let op Railway (Python 3.11): geen PEP 701-f-strings hieronder.
"""
from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.orm import Session

from backend.models import CampaignDecision

logger = logging.getLogger(__name__)

_TEKSTVELDEN = ("primary_topic", "primary_action", "owner", "secondary_topic",
                "secondary_action", "feedback_plan", "success_criterion")
_DATUMVELDEN = ("decided_at", "follow_up_date")


def load_decision(db: Session, campaign_id: str) -> tuple[dict[str, Any] | None, bool]:
    """(besluit, unavailable).

    besluit is None als er geen rij is of als de rij niets bevat. unavailable is
    True als de tabel niet te lezen was; de besluitpagina zegt dat dan in een
    regel (zichtbare terugval, geen stille). Alleen een ontbrekende of
    onleesbare tabel wordt zo afgevangen (ProgrammingError op Postgres,
    OperationalError op SQLite); elke andere fout blijft een fout.

    Roep dit aan VOOR de andere query's van het rapport: na een mislukt
    statement is de transactie in Postgres onbruikbaar en volgt een rollback.
    """
    try:
        rij = (db.query(CampaignDecision)
               .filter(CampaignDecision.campaign_id == campaign_id).first())
    except (ProgrammingError, OperationalError) as exc:
        db.rollback()
        logger.error(
            "campaign_decisions niet leesbaar voor campagne %s (%s). Is "
            "migrations/2026_09_19_add_campaign_decisions.sql gedraaid? Het rapport "
            "rendert de besluitpagina leeg, met een regel dat het besluit niet te lezen was.",
            campaign_id, type(exc).__name__)
        return None, True
    if rij is None:
        return None, False
    besluit: dict[str, Any] = {veld: (getattr(rij, veld) or "").strip() for veld in _TEKSTVELDEN}
    for veld in _DATUMVELDEN:
        besluit[veld] = getattr(rij, veld)
    if not any(besluit[veld] for veld in _TEKSTVELDEN + _DATUMVELDEN):
        return None, False
    besluit["updated_at"] = rij.updated_at
    return besluit, False
```

- [ ] **Stap 5: Lees het besluit in `build_report_data`**

In `backend/report_html.py`, bij de imports (na `from backend.models import Campaign, Respondent, SurveyResponse`):

```python
from backend.report_decision import load_decision
```

In `build_report_data`, als **eerste statements** van de functie, vóór `camp: Campaign = (`:

```python
    # Het besluit eerst (plan 3b): een mislukt statement op een ontbrekende
    # tabel vraagt een rollback, en die mag geen al geladen objecten raken.
    decision, decision_unavailable = load_decision(db, campaign_id)
```

In de `return dict(` van dezelfde functie, na `segment_reason=segment_reason,`:

```python
        decision=decision,
        decision_unavailable=decision_unavailable,
```

- [ ] **Stap 6: Draai de tests en zie ze slagen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_decision_data.py tests/test_report_meetgegevens.py -q -p no:cacheprovider`
Verwacht: alles `passed`.

- [ ] **Stap 7: Faalset-commando (Taak 0) en de 3.11-guard**

Run ook: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_python311_syntax_guard.py -q -p no:cacheprovider`
Verwacht: `GEEN_REGRESSIES` en de guard groen (hij pakt het nieuwe bestand `backend/report_decision.py` mee).

- [ ] **Stap 8: Commit**

```bash
git add backend/models.py backend/report_decision.py backend/report_html.py tests/test_report_decision_data.py
git commit -m "feat(rapport): besluit van het MT in de rapportdata

load_decision leest campaign_decisions als eerste query van het rapport.
Ontbreekt de tabel, dan valt het rapport niet om: error in het log en
decision_unavailable in de data, zodat de besluitpagina het kan zeggen.
previous_campaign_id staat bewust nog niet op het Campaign-model.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 3: `_nl_tijd` via `ZoneInfo`, één bron voor "Nederlandse dag"

Plan 3a schreef een eigen zomertijdregel omdat `tzdata` toen niet in het venv of op Railway stond. Sinds klantsuite 2b staat `tzdata` in `requirements.txt` en gebruikt `backend/survey_window.py` `ZoneInfo("Europe/Amsterdam")`. De bestaande tests in `tests/test_report_meetgegevens.py::test_datum_nl_leest_timestamps_in_nederlandse_tijd` pinnen het gedrag al op zes randgevallen (zomer, winter, beide DST-grenzen, naive datetime); die blijven ongewijzigd en moeten groen blijven.

**Files:**
- Modify: `backend/report_html.py:1159-1180` (anker `def _laatste_zondag_utc(jaar: int, maand: int)` tot en met het einde van `_nl_tijd`), plus de import op regel 16
- Test: `tests/test_report_meetgegevens.py` (één test erbij)

- [ ] **Stap 1: Schrijf de falende test**

Voeg onderaan `tests/test_report_meetgegevens.py` toe:

```python
def test_nederlandse_dag_heeft_een_bron():
    """Plan 3b: de eigen zomertijdregel uit 3a is weg; het rapport en de
    sluitdatum van de survey lezen dezelfde tijdzone."""
    from backend import report_html, survey_window
    assert not hasattr(report_html, "_laatste_zondag_utc")
    assert report_html.AMSTERDAM is survey_window.AMSTERDAM
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_meetgegevens.py::test_nederlandse_dag_heeft_een_bron -q -p no:cacheprovider`
Verwacht: FAIL (`_laatste_zondag_utc` bestaat nog).

- [ ] **Stap 3: Vervang de eigen regel**

Verwijder in `backend/report_html.py` de hele functie `_laatste_zondag_utc` en vervang `_nl_tijd` door:

```python
def _nl_tijd(d: datetime) -> datetime:
    """Zet een timestamp om naar Nederlandse tijd.

    closed_at wordt als UTC opgeslagen (frontend: new Date().toISOString()); een
    naive datetime behandelen we daarom als UTC. Dezelfde tijdzone als de
    sluitdatum van de survey (backend/survey_window.py), zodat "de Nederlandse
    dag" op één plek is gedefinieerd.
    """
    utc = d.replace(tzinfo=timezone.utc) if d.tzinfo is None else d
    return utc.astimezone(AMSTERDAM)
```

Voeg bij de imports toe (bij de andere `backend`-imports):

```python
from backend.survey_window import AMSTERDAM
```

en haal `timedelta` uit `from datetime import date, datetime, timedelta, timezone` als `grep -n "timedelta" backend/report_html.py` daarna geen andere treffer meer geeft.

- [ ] **Stap 4: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_meetgegevens.py -q -p no:cacheprovider`
Verwacht: alles `passed`, inclusief de zes randgevallen uit plan 3a.

- [ ] **Stap 5: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 6: Commit**

```bash
git add backend/report_html.py tests/test_report_meetgegevens.py
git commit -m "refactor(rapport): Nederlandse tijd via ZoneInfo in plaats van een eigen zomertijdregel

tzdata staat sinds klantsuite 2b in requirements.txt; survey_window.py deed
het al zo. Een bron voor de Nederlandse dag.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 4: Datastructuur en keuzefunctie van de vertaalvraag (content blijft leeg)

De 72 vertaalvragen en de verdeeld-zinnen zijn gated content (Taak 13). Deze taak bouwt alles eromheen: de structuur, de ophaalfuncties en **één pure functie die per richtingstaat beslist welke vertaalvraag het blok toont**. De tests gebruiken twee neutrale testvragen via `monkeypatch`; er komt geen enkele echte vraagtekst in de code.

**Structuur (conceptdocument par. 5 punt 2):** per routesleutel twee teksten, want de respondenttekst verschilt bij 13 van de 36 routes tussen Behoud (tegenwoordige tijd) en Vertrek (verleden tijd):

```python
WORK_QUESTIONS = {
    "growth": {
        "grd_visibility": {"retention": "...", "exit": "..."},
        ...
    },
    ...
}
WORK_QUESTION_VARIANTS = {
    "divided":    {"retention": "... ‘{a}’ ... ‘{b}’ ...", "exit": "..."},
    "split_none": {"retention": "... ‘{a}’ ...", "exit": "..."},
}
```

De sleutels zijn die van `DIRECTION_SETS`: alleen de 36 inhoudelijke routes (opties met een `imperative`). `*_none` en `*_other` hebben geen opdrachtvorm en krijgen geen vraag. De vertaalvragen noemen het onderwerp nergens bij naam (spec, respondentvraag en rapportlabels gebruiken drie verschillende namen); het blok eromheen levert de naam via `_fl(fk, scan_type)`.

**Let op: neem het patroon van `direction_imperative` niet over.** Die functie valideert `scan_type` alleen en gebruikt hem niet (de opdrachtvorm is tijd-neutraal). `work_question` moet `scan_type` echt gebruiken.

**Welke vraag per richtingstaat** (spec par. 6 punt 2, aangevuld met conceptdocument par. 5 punten 3 t/m 8; de afwijkingen van de spec gaan in deze taak de spec in):

| Staat uit `direction_state` | Vertaalvraag |
|---|---|
| `clear` | de route-eigen vraag van de winnende route |
| `plurality` | **aanname:** ook de route-eigen vraag van de grootste groep (het rapport toont daar al de opdrachtvorm van die route). De spec zette `plurality` bij de verdeelde staten; besluit voor Lars |
| `divided` met twee inhoudelijke routes A en B | de verdeeld-zin (`WORK_QUESTION_VARIANTS["divided"]`), met de routeteksten van A en B tussen aanhalingstekens (10 van de 36 routeteksten bevatten "ik", "mij" of "mijn") |
| `divided` waar `*_other` de grootste veranderoptie is, of waar geen tweede inhoudelijke route bestaat | **geen** vertaalvraag. Nooit "A en Anders" afdrukken, nooit een tweede route verzinnen |
| `split_none` | eigen zin (`WORK_QUESTION_VARIANTS["split_none"]`): B is daar de niets-optie en "welke van de twee kunnen jullie waarmaken" klopt dan niet |
| `none_needed`, `too_few` | **geen** vertaalvraag (er is geen route om op te kiezen) |

**Vóór de reviewgate is de content leeg.** `translation_question` geeft dan `None` en het blok toont alleen de herkennings- en de besluitvraag. Dat is geen stille terugval in productie: `tests/test_work_questions_content.py::test_de_set_is_gevuld` (Taak 13) maakt een lege set een rode test, en de branch wordt niet gemerged vóór Taak 13 en 15 klaar zijn. Zodra de set niet leeg is, is een ontbrekende route een `KeyError`.

**Files:**
- Modify: `backend/products/shared/deepening.py` (nieuw blok direct na `direction_imperative`, vóór `def _factor_items`)
- Modify: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (nieuw kopje onderaan)
- Test: `tests/test_work_questions_logic.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_work_questions_logic.py`:

```python
"""Welke vertaalvraag hoort bij welke richtingstaat (plan 3b, spec 16-9 par. 6).

De echte vraagteksten zijn gated content (Taak 13) en staan hier niet: deze
tests zetten twee neutrale testvragen en twee neutrale varianten in de module.
Elke staat komt uit de echte direction_state, zodat de test breekt als de
staatlogica verschuift.
"""
import pytest

from backend.products.shared import deepening as dp

VRAGEN = {
    "growth": {"grd_visibility": {"retention": "Testvraag zicht, nu?", "exit": "Testvraag zicht, toen?"}},
    "workload": {"wld_peaks": {"retention": "Testvraag pieken, nu?", "exit": "Testvraag pieken, toen?"}},
}
VARIANTEN = {
    "divided": {"retention": "Nu verdeeld tussen ‘{a}’ en ‘{b}’?", "exit": "Toen verdeeld tussen ‘{a}’ en ‘{b}’?"},
    "split_none": {"retention": "Nu vraagt een deel om ‘{a}’?", "exit": "Toen vroeg een deel om ‘{a}’?"},
}


@pytest.fixture()
def gevuld(monkeypatch):
    monkeypatch.setattr(dp, "WORK_QUESTIONS", VRAGEN)
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", VARIANTEN)


def _agg(counts, answered=None):
    n = answered if answered is not None else sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts,
            "other_texts": []}


def _vraag(scan, fk, counts, score, answered=None):
    st = dp.direction_state(_agg(counts, answered), fk, score)
    return st["state"], dp.translation_question(scan, fk, st)


def test_clear_geeft_de_route_eigen_vraag(gevuld):
    staat, vraag = _vraag("retention", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert staat == "clear"
    assert vraag == "Testvraag zicht, nu?"


def test_scan_type_wordt_echt_gebruikt(gevuld):
    _staat, vraag = _vraag("exit", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert vraag == "Testvraag zicht, toen?"


def test_plurality_geeft_de_vraag_van_de_grootste_groep(gevuld):
    staat, vraag = _vraag("retention", "growth",
                          {"grd_visibility": 4, "grd_time": 2, "grd_none": 2, "grd_criteria": 2}, 6.0)
    assert staat == "plurality"
    assert vraag == "Testvraag zicht, nu?"


def test_divided_met_twee_routes_geeft_de_verdeeld_zin_met_beide_routeteksten(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag == ("Nu verdeeld tussen ‘Piekmomenten en spoedwerk eerder plannen, verdelen of "
                     "begrenzen’ en ‘Takenpakket en werkvolume beter afbakenen’?")


def test_divided_gebruikt_voor_vertrek_de_vertrekvariant_en_de_vertrekteksten(gevuld):
    staat, vraag = _vraag("exit", "leadership", {"ldd_mandate": 3, "ldd_escalation": 3, "ldd_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag.startswith("Toen verdeeld tussen ‘")
    # De verleden-tijd-tekst die de vertrekker zag, niet die van Behoud.
    assert "Duidelijker wat ik zelf mocht beslissen in mijn werk" in vraag
    assert "mag beslissen" not in vraag


def test_divided_met_anders_als_grootste_veranderoptie_geeft_geen_vraag(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_other": 4, "wld_peaks": 2, "wld_none": 2}, 5.4)
    assert staat == "divided"
    assert vraag is None


def test_divided_zonder_tweede_inhoudelijke_route_geeft_geen_vraag(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_peaks": 3, "wld_none": 3, "wld_other": 2}, 6.0)
    assert staat == "divided"
    assert vraag is None


def test_split_none_geeft_de_eigen_zin_met_alleen_de_veranderroute(gevuld):
    staat, vraag = _vraag("retention", "workload", {"wld_none": 4, "wld_peaks": 4}, 4.5)
    assert staat == "split_none"
    assert vraag == "Nu vraagt een deel om ‘Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen’?"
    assert "Niets, dit zit hier goed" not in vraag


@pytest.mark.parametrize("counts,answered", [({"wld_none": 5, "wld_peaks": 2, "wld_scope": 1}, None),
                                              ({"wld_peaks": 2}, 2)])
def test_none_needed_en_too_few_geven_geen_vraag(gevuld, counts, answered):
    staat, vraag = _vraag("retention", "workload", counts, 5.4, answered)
    assert staat in ("none_needed", "too_few")
    assert vraag is None


def test_lege_set_geeft_geen_vraag_en_geen_fout(monkeypatch):
    """De stand voor de reviewgate: de content is er nog niet. Expliciet leeg
    gezet, zodat deze test ook na Taak 13 (gevulde set) blijft kloppen."""
    monkeypatch.setattr(dp, "WORK_QUESTIONS", {})
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", {})
    assert dp.work_questions_ready() is False
    _staat, vraag = _vraag("retention", "growth", {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}, 5.1)
    assert vraag is None


def test_gevulde_set_zonder_deze_route_faalt_luid(gevuld):
    with pytest.raises(KeyError, match="grd_time"):
        dp.work_question("retention", "growth", "grd_time")


def test_niets_en_anders_hebben_geen_vraag(gevuld):
    for sleutel in ("grd_none", "grd_other"):
        with pytest.raises(KeyError, match="geen inhoudelijke route"):
            dp.work_question("retention", "growth", sleutel)


def test_onbekend_scantype_en_onbekend_onderwerp_falen_luid(gevuld):
    with pytest.raises(ValueError, match="onboarding"):
        dp.work_question("onboarding", "growth", "grd_visibility")
    with pytest.raises(KeyError):
        dp.work_question("retention", "bestaat_niet", "grd_visibility")
    with pytest.raises(ValueError, match="onboarding"):
        dp.translation_question("onboarding", "growth", {"state": "clear", "top_key": "grd_visibility"})


def test_onbekende_staat_faalt_luid(gevuld):
    with pytest.raises(ValueError, match="onbekende staat"):
        dp.translation_question("retention", "growth", {"state": "iets_nieuws", "ranked": []})
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_work_questions_logic.py -q -p no:cacheprovider`
Verwacht: FAIL, `AttributeError: module 'backend.products.shared.deepening' has no attribute 'WORK_QUESTIONS'` (in de fixture) of `translation_question`.

- [ ] **Stap 3: Schrijf de implementatie**

In `backend/products/shared/deepening.py`, direct na `direction_imperative` en vóór `def _factor_items`:

```python
# ── Vertaalvragen voor het blok "Zo maak je er een besluit van" (plan 3b) ─────
# Spec 2026-09-16 par. 6. De teksten zijn gated content: ze komen uit
# docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md en gaan er pas in
# na akkoord van Lars (plan 3b, Taak 13). Tot dan zijn beide dicts leeg en toont
# het rapport alleen de herkennings- en de besluitvraag;
# tests/test_work_questions_content.py maakt een lege set daarna een rode test.
#
# Per onderwerp, per inhoudelijke route (een optie met een `imperative`) twee
# teksten: Behoud in de tegenwoordige tijd, Vertrek in de verleden tijd. *_none
# en *_other hebben geen vraag. De vragen noemen het onderwerp niet bij naam.
WORK_QUESTIONS: dict[str, dict[str, dict[str, str]]] = {}

# De zinnen voor een verdeelde richting. "divided" draagt de plaatshouders {a}
# en {b}, "split_none" alleen {a}; de aanhalingstekens staan in de tekst zelf.
WORK_QUESTION_VARIANTS: dict[str, dict[str, str]] = {}


def work_questions_ready() -> bool:
    """False zolang de gated content er niet in zit (plan 3b, Taak 13)."""
    return bool(WORK_QUESTIONS) and bool(WORK_QUESTION_VARIANTS)


def _content_route_keys(factor_key: str) -> list[str]:
    """De inhoudelijke routes van een onderwerp: opties met een opdrachtvorm."""
    return [o["key"] for o in DIRECTION_SETS[factor_key]["options"] if o["imperative"]]


def work_question(scan_type: str, factor_key: str, option_key: str) -> str:
    """De vertaalvraag bij een inhoudelijke route, in de tijd van deze scan.

    Anders dan direction_imperative GEBRUIKT deze functie scan_type: Behoud en
    Vertrek hebben elk een eigen tekst. Onbekend scantype, onbekend onderwerp,
    een niets- of Anders-optie of een route zonder vraag: een fout met een
    duidelijke melding, nooit een ruwe sleutel in een klant-PDF.
    """
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"work_question: onbekend scan_type {scan_type!r}")
    if option_key not in _content_route_keys(factor_key):
        raise KeyError(
            f"work_question: {option_key!r} is geen inhoudelijke route van {factor_key!r}")
    try:
        return WORK_QUESTIONS[factor_key][option_key][scan_type]
    except KeyError:
        raise KeyError(
            f"work_question: geen vertaalvraag voor {option_key!r} "
            f"({factor_key!r}, {scan_type!r})") from None


def work_question_variant(kind: str, scan_type: str, **velden: str) -> str:
    """De zin voor een verdeelde richting, gevuld met de routeteksten."""
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"work_question_variant: onbekend scan_type {scan_type!r}")
    try:
        sjabloon = WORK_QUESTION_VARIANTS[kind][scan_type]
    except KeyError:
        raise KeyError(
            f"work_question_variant: geen variant {kind!r} voor {scan_type!r}") from None
    return sjabloon.format(**velden)


def translation_question(scan_type: str, factor_key: str, state: dict[str, Any]) -> str | None:
    """De vertaalvraag die bij deze richtingstaat hoort, of None als er geen hoort.

    `state` is de uitkomst van direction_state. Per staat:
      clear, plurality   de route-eigen vraag van de grootste route;
      divided            de verdeeld-zin met de twee grootste inhoudelijke
                         routes, of None als de grootste veranderoptie *_other
                         is of er geen tweede inhoudelijke route is gekozen;
      split_none         de eigen zin met alleen de veranderroute;
      none_needed,
      too_few            None: er is geen route om op te kiezen.
    Zolang de content niet gevuld is (voor de reviewgate) altijd None.
    """
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"translation_question: onbekend scan_type {scan_type!r}")
    soort = state["state"]
    if soort not in ("clear", "plurality", "divided", "split_none", "none_needed", "too_few"):
        raise ValueError(f"translation_question: onbekende staat {soort!r}")
    if not work_questions_ready() or soort in ("none_needed", "too_few"):
        return None
    if soort in ("clear", "plurality"):
        return work_question(scan_type, factor_key, state["top_key"])
    teksten = direction_option_texts(scan_type, factor_key)
    if soort == "split_none":
        return work_question_variant("split_none", scan_type, a=teksten[state["top_key"]])
    # divided
    verander = [k for k, _c in state["ranked"] if not k.endswith("_none")]
    if not verander or verander[0].endswith("_other"):
        return None
    inhoudelijk = [k for k in verander if not k.endswith("_other")]
    if len(inhoudelijk) < 2:
        return None
    return work_question_variant("divided", scan_type,
                                 a=teksten[inhoudelijk[0]], b=teksten[inhoudelijk[1]])
```

- [ ] **Stap 4: Draai de tests en zie ze slagen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_work_questions_logic.py -q -p no:cacheprovider`
Verwacht: `14 passed`.

- [ ] **Stap 5: Leg de afwijkingen vast in de spec**

Voeg onderaan `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` toe:

```markdown

## Afwijkingen bij plan 3b

- **Twee teksten per route (par. 6, bijlage A):** `WORK_QUESTIONS` heeft per routesleutel een tekst voor Behoud en een voor Vertrek, omdat de respondenttekst bij 13 van de 36 routes tussen de scans verschilt. `work_question` gebruikt `scan_type` echt; `direction_imperative` doet dat niet en is dus geen patroon om over te nemen.
- **`plurality` krijgt de route-eigen vraag (par. 6 punt 2):** de spec zette `plurality` bij de verdeelde staten. In die staat toont het rapport al de opdrachtvorm van de grootste route (35% of meer, voorsprong van twee); de verdeeld-zin zou die informatie negeren. Aanname, besluit bij Lars.
- **`split_none` krijgt een eigen zin:** B is daar de niets-optie, en "welke van de twee kunnen jullie waarmaken" is dan onzin (niets doen kan altijd).
- **`divided` zonder twee inhoudelijke routes krijgt geen vertaalvraag:** is `*_other` de grootste veranderoptie, of is er maar één inhoudelijke route gekozen, dan toont het blok alleen de herkennings- en de besluitvraag. Nooit "A en Anders", nooit een verzonnen tweede route.
- **`none_needed` en `too_few` krijgen geen vertaalvraag:** er is geen route om op te kiezen. Bij `none_needed` laat de besluitvraag het MT ook besluiten hier niets te doen (zie Taak 5 van plan 3b).
- **Vertrek heeft een eigen verdeeld-zin in de verleden tijd.** De verdeeld-zinnen (Behoud, Vertrek, `split_none`) zijn gated content, net als de 72 vertaalvragen.
- **De vertaalvragen noemen het onderwerp niet bij naam.** Het blok eromheen levert de naam via `_fl(fk, scan_type)`.
```

- [ ] **Stap 6: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 7: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_work_questions_logic.py docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "feat(werkvragen): structuur en keuzefunctie van de vertaalvraag, content nog leeg

translation_question kiest per richtingstaat: route-eigen vraag bij clear en
plurality, verdeeld-zin bij divided met twee inhoudelijke routes, eigen zin
bij split_none, geen vraag bij none_needed, too_few en divided zonder tweede
route. De teksten zelf zijn gated content (Taak 13).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 5: Blok "Zo maak je er een besluit van" + de vaste regel op de afdelingspagina

Dit dicht gat B3 van de koude leesronde: per startpunt en per tweede punt drie vragen, direct onder "Wat er moet gebeuren". Geen advies; de vragen die het MT zelf moet beantwoorden.

1. **Herkennen.** Datagedreven zodra het verdiepingsblok van dat onderwerp een verdeling toont (`_deepening_shows_distribution`, `answered >= 5`, geen nieuwe drempel) en de grootste toelichting niet `*_other` is: de telling in de vaste tellingsvorm, de toelichting letterlijk, de noemer uitgelegd in dezelfde zin. Anders de terugvalvraag.
   **Afwijking van de spec (vastleggen):** de spec schrijft als terugval "Wat maakt dat [onderwerp] hier zo laag scoort, volgens jullie?". "Zo laag" is onwaar bij een startpunt dat als aandachtspunt of relatief sterk scoort (vlak profiel, scenario 01, 04, 19). De terugval noemt daarom de score zelf: "Wat zit er volgens jullie achter de 6.2/10 op [onderwerp]?".
2. **Vertalen.** `translation_question` uit Taak 4. Geeft die `None`, dan staat de rij er niet; er komt geen lege rij en geen verzonnen vraag.
3. **Besluiten.** Altijd dezelfde vorm (spec). Eén uitzondering: bij `none_needed` zegt de richtingkaart al "Hier hoeft volgens de meeste betrokkenen niets. ... Bespreek of dit dan het startpunt moet zijn."; de besluitvraag sluit daarop aan en laat het MT ook besluiten hier niets te doen.

Dit is ook de verbinding die de leesronde bij werkdruk miste ("Geen eenduidige richting" zonder koppeling aan de meest gekozen toelichting): de herkenningsvraag noemt de toelichting van p.07 op dezelfde plek waar de verdeelde richting staat. Loep beweert niet dat de twee op elkaar aansluiten (de verwantschapsmapping is op 8 september bewust verwijderd); het MT legt die link.

Het blok rendert voor Vertrek en Behoud zodra de ranglijst een startpunt heeft, ook in een meting zonder richtingdata (dan zonder vertaalvraag). Loep Start krijgt het blok niet.

**Files:**
- Modify: `backend/report_html.py` (nieuw blok direct na `_wat_moet_gebeuren_block`, vóór `def _direction_degraded_line`; `_prioriteringsraster`; `_segment_block`; de twee renderers; de import uit `deepening`)
- Modify: `backend/report_css.py` (na de regel `.dir-block { margin-top: 18px; break-inside: avoid; }` en de andere `.dir-`-regels, vóór het volgende commentaarblok)
- Test: `tests/test_report_werkvragen.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_werkvragen.py`:

```python
"""Blok "Zo maak je er een besluit van" (plan 3b, spec 16-9 par. 6).

Drie vragen per gesprekspunt: herkennen (datagedreven), vertalen (gated content,
hier met neutrale testvragen) en besluiten (vaste vorm). Plus de vaste regel op
de afdelingspagina (H7).
"""
import re

import pytest

from backend.products.shared import deepening as dp
from backend.report_html import (
    BESLUITVRAAG,
    BESLUITVRAAG_NIETS,
    SEGMENT_TOELICHTING_GRENS,
    _besluitvraag,
    _herkenningsvraag,
    _prioriteringsraster,
    _segment_block,
    _werkvragen_block,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture
from tests.test_report_priority_render import DIRECTION, RANKED, RESP

VRAGEN = {
    "growth": {"grd_visibility": {"retention": "Testvraag zicht, nu?", "exit": "Testvraag zicht, toen?"}},
}
VARIANTEN = {
    "divided": {"retention": "Nu verdeeld tussen ‘{a}’ en ‘{b}’?", "exit": "Toen verdeeld tussen ‘{a}’ en ‘{b}’?"},
    "split_none": {"retention": "Nu vraagt een deel om ‘{a}’?", "exit": "Toen vroeg een deel om ‘{a}’?"},
}


@pytest.fixture()
def gevuld(monkeypatch):
    monkeypatch.setattr(dp, "WORK_QUESTIONS", VRAGEN)
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", VARIANTEN)


def _deep(**counts):
    n = sum(counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": counts, "secondary_counts": {}, "other_texts": []}


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── Herkenningsvraag ─────────────────────────────────────────────────────────

def test_herkenningsvraag_noemt_de_toelichting_met_telling_en_noemer():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                            "retention", "growth", "Groeiperspectief", 5.1)
    assert zin == ("6 van de 13 (46%) kozen als toelichting ‘Ik zie niet welke mogelijkheden er "
                   "voor mij zijn’; die 13 zijn de mensen die bij groeiperspectief duidelijk laag "
                   "antwoordden en de verdiepende vraag beantwoordden. Waar zie je dat bij jullie "
                   "terug, en waar niet?")


def test_herkenningsvraag_onder_tien_zonder_percentage_en_met_enkelvoud():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=1, gr_time=1, gr_criteria=1,
                                             gr_ceiling=1, gr_conversation=1)},
                            "retention", "growth", "Groeiperspectief", 5.1)
    assert zin.startswith("1 van de 5 koos als toelichting ‘")
    assert "%" not in zin


def test_herkenningsvraag_valt_terug_onder_de_staffel_en_noemt_de_score():
    zin = _herkenningsvraag({"growth": _deep(gr_visibility=4)}, "retention", "growth",
                            "Groeiperspectief", 6.2)
    assert zin == "Wat zit er volgens jullie achter de 6.2/10 op groeiperspectief?"
    assert "zo laag" not in zin


def test_herkenningsvraag_valt_terug_zonder_verdiepingsdata_en_bij_anders_als_grootste():
    verwacht = "Wat zit er volgens jullie achter de 5.1/10 op groeiperspectief?"
    assert _herkenningsvraag({}, "retention", "growth", "Groeiperspectief", 5.1) == verwacht
    assert _herkenningsvraag({"growth": _deep(gr_other=6, gr_time=2)}, "retention", "growth",
                             "Groeiperspectief", 5.1) == verwacht


def test_herkenningsvraag_faalt_luid_op_een_onbekende_toelichtingssleutel():
    with pytest.raises(KeyError, match="bestaat_niet"):
        _herkenningsvraag({"growth": _deep(bestaat_niet=6)}, "retention", "growth",
                          "Groeiperspectief", 5.1)


# ── Besluitvraag ─────────────────────────────────────────────────────────────

def test_besluitvraag_heeft_de_vaste_vorm_uit_de_spec():
    assert _besluitvraag("clear") == BESLUITVRAAG
    assert BESLUITVRAAG == ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je "
                            "over 90 dagen dat het werkt?")


def test_besluitvraag_bij_niets_nodig_laat_het_mt_ook_niets_besluiten():
    assert _besluitvraag("none_needed") == BESLUITVRAAG_NIETS
    assert "niets te doen" in BESLUITVRAAG_NIETS
    assert "eigenaar" in BESLUITVRAAG_NIETS


# ── Het blok ─────────────────────────────────────────────────────────────────

def test_blok_toont_per_gesprekspunt_de_drie_vragen(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html)
    assert "Zo maak je er een besluit van" in t
    assert "Startpunt: Groeiperspectief" in t
    assert "Tweede punt: Werkdruk en herstelruimte" in t
    assert "6 van de 13 (46%) kozen als toelichting" in t
    assert "Testvraag zicht, nu?" in t                       # growth is clear
    assert t.count(BESLUITVRAAG) == 2
    assert html.count('class="wq-card"') == 2


def test_verdeelde_richting_krijgt_de_verdeeld_zin_naast_de_toelichting(gevuld):
    """Gat B3 bij werkdruk: 'Geen eenduidige richting' stond los van de meest
    gekozen toelichting. Beide staan nu in dezelfde kaart."""
    html = _werkvragen_block(RANKED, {"workload": _deep(wl_recovery=6, wl_volume=3, wl_peaks_adhoc=3)},
                             DIRECTION, "retention")
    kaart = html[html.index("Tweede punt: Werkdruk en herstelruimte"):]
    t = _plain(kaart)
    assert "6 van de 12 (50%) kozen als toelichting" in t
    assert "Nu verdeeld tussen ‘Piekmomenten en spoedwerk eerder plannen" in t


def test_zonder_vertaalvraag_staat_er_geen_lege_rij(monkeypatch):
    """Voor de reviewgate (lege content) en bij staten zonder vertaalvraag.
    Expliciet leeg gezet, zodat de test ook na Taak 13 blijft kloppen."""
    monkeypatch.setattr(dp, "WORK_QUESTIONS", {})
    monkeypatch.setattr(dp, "WORK_QUESTION_VARIANTS", {})
    html = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    assert "Vertalen" not in _plain(html)
    assert html.count("Herkennen") == 2 and html.count("Besluiten") == 2
    assert "<td></td>" not in html and "None" not in html


def test_blok_rendert_ook_zonder_richtingdata_en_is_leeg_zonder_gesprekspunten():
    html = _werkvragen_block(RANKED, {}, {}, "retention")
    assert html.count('class="wq-card"') == 2
    assert _werkvragen_block([], {}, DIRECTION, "retention") == ""


def test_blok_rendert_met_de_echte_content_zonder_fout():
    """Rooktest die voor en na Taak 13 moet slagen: met lege content geen rij
    'Vertalen', met gevulde content voor elke route een vraag (anders KeyError)."""
    html = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    assert html.count('class="wq-card"') == 2


def test_blok_weigert_loep_start():
    with pytest.raises(ValueError, match="onboarding"):
        _werkvragen_block(RANKED, {}, {}, "onboarding")


def test_geen_streepjes_geen_advies_geen_begeleider(gevuld):
    html = _werkvragen_block(RANKED, {"growth": _deep(gr_visibility=6, gr_time=4, gr_criteria=3)},
                             DIRECTION, "retention")
    t = _plain(html).lower()
    for fout in ("\u2014", "\u2013", "loep adviseert", "aanbeveling", "begeleide", "de bespreking met loep"):
        assert fout not in t


# ── Wiring ───────────────────────────────────────────────────────────────────

def test_raster_zet_het_blok_onder_wat_er_moet_gebeuren():
    blok = _werkvragen_block(RANKED, {}, DIRECTION, "retention")
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="Opener?", review_when="Later.",
                                opener_html="<h2>kop</h2>", direction_agg=DIRECTION, n_total=13,
                                werkvragen_html=blok)
    assert html.index("Wat er moet gebeuren") < html.index("Zo maak je er een besluit van")
    assert html.index("Zo maak je er een besluit van") < html.index("Gespreksopener")


def test_behoud_rendert_het_blok_en_loep_start_niet():
    behoud = _body(render_retention_report_html(_fixture("retention", n=25, profile=True)))
    assert "Zo maak je er een besluit van" in behoud
    start = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert "Zo maak je er een besluit van" not in start


def test_zonder_factorprofiel_geen_blok():
    html = _body(render_retention_report_html(_fixture("retention", n=7, profile=False)))
    assert "Zo maak je er een besluit van" not in html


# ── H7: de vaste regel op de afdelingspagina ─────────────────────────────────

def test_afdelingspagina_zegt_waar_de_toelichting_vandaan_moet_komen():
    rows = [{"department": "Operations", "n": 17, "avg": 5.2, "scores": [5.2] * 17,
             "is_pooled": False, "invited": 20},
            {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6,
             "is_pooled": False, "invited": 8}]
    met = _segment_block(rows, scan_type="retention", toelichting_regel=True)
    zonder = _segment_block(rows, scan_type="retention")
    assert SEGMENT_TOELICHTING_GRENS in met
    assert SEGMENT_TOELICHTING_GRENS not in zonder
    assert SEGMENT_TOELICHTING_GRENS == (
        "Een lage score zegt niet waarom. Vraag de afdeling zelf naar de toelichting; "
        "het rapport toont die alleen organisatiebreed.")
```

De rijvorm in de laatste test is die van `tests/test_report_startpuntverhaal.py::_row` (sleutels `department`, `n`, `avg`, `scores`, `is_pooled`, `invited`).

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_werkvragen.py -q -p no:cacheprovider`
Verwacht: FAIL bij het importeren (`cannot import name 'BESLUITVRAAG'`).

- [ ] **Stap 3: Schrijf het blok**

Voeg aan de import uit `backend.products.shared.deepening` in `backend/report_html.py` toe (alfabetisch, na `get_deepening_sets,`):

```python
    translation_question,
```

Direct na het einde van `_wat_moet_gebeuren_block` en vóór `def _direction_degraded_line`:

```python
# ── Werkvragen "Zo maak je er een besluit van" (plan 3b, spec 16-9 par. 6) ────
# Geen advies: de vragen die het MT zelf moet beantwoorden om van "dit kozen je
# mensen" naar "dit gaan wij doen" te komen. De HR-manager leidt dat gesprek;
# niets hieronder veronderstelt een begeleider van Loep.

WERKVRAGEN_EYEBROW = "Zo maak je er een besluit van"
WERKVRAGEN_INTRO = ("Per gesprekspunt de vragen die het MT van ‘dit kozen je mensen’ naar "
                    "‘dit gaan wij doen’ brengen. Loep geeft hier geen advies; het besluit is "
                    "aan jullie.")
BESLUITVRAAG = ("Wat spreken jullie vandaag af, wie is eigenaar, en waaraan zie je "
                "over 90 dagen dat het werkt?")
# Bij none_needed zegt de richtingkaart al dat hier volgens de meeste
# betrokkenen niets hoeft; de besluitvraag mag dan niet doen alsof er per se
# iets afgesproken moet worden.
BESLUITVRAAG_NIETS = ("De meeste betrokkenen zeggen dat hier niets hoeft. Blijft dit een "
                      "gesprekspunt, of besluiten jullie hier nu niets te doen? Wie is eigenaar "
                      "van dat besluit, en wanneer kijken jullie opnieuw?")


def _herkenningsvraag(deep_agg: dict, scan_type: str, factor_key: str, label: str,
                      score: float | None) -> str:
    """Vraag 1. Datagedreven zodra het verdiepingsblok van dit onderwerp een
    verdeling toont (_deepening_shows_distribution, dezelfde staffel als die
    pagina) en de grootste toelichting geen Anders is. De telling staat in de
    vaste vorm (_telling) en de noemer wordt in dezelfde zin uitgelegd (B14).

    Terugval: de score zelf, niet "zo laag". Bij een vlak profiel is het
    startpunt een aandachtspunt of relatief sterk, en dan is "zo laag" onwaar.
    """
    terugval = f"Wat zit er volgens jullie achter de {_score_str(_shown(score))} op {_lc(label)}?"
    agg = deep_agg.get(factor_key)
    if not _deepening_shows_distribution(agg):
        return terugval
    ranked = sorted((agg.get("primary_counts") or {}).items(), key=lambda kv: (-kv[1], kv[0]))
    if not ranked or ranked[0][0].endswith("_other"):
        return terugval
    top_key, top_n = ranked[0]
    teksten = _deepening_option_texts(scan_type, factor_key)
    if top_key not in teksten:
        raise KeyError(
            f"werkvragen: onbekende toelichtingssleutel {top_key!r} voor {factor_key!r} ({scan_type})")
    answered = agg["answered"]
    return (f"{_telling(top_n, answered)} {_werkwoord(top_n, 'koos', 'kozen')} als toelichting "
            f"‘{teksten[top_key]}’; die {answered} zijn de mensen die bij {_lc(label)} duidelijk "
            "laag antwoordden en de verdiepende vraag beantwoordden. Waar zie je dat bij jullie "
            "terug, en waar niet?")


def _besluitvraag(state: str) -> str:
    """Vraag 3: altijd dezelfde vorm, behalve als de meerderheid zegt dat hier
    niets hoeft."""
    return BESLUITVRAAG_NIETS if state == "none_needed" else BESLUITVRAAG


def _werkvragen_block(ranked: list[dict], deep_agg: dict, direction_agg: dict,
                      scan_type: str) -> str:
    """Twee kaarten (startpunt en tweede punt) met elk twee of drie vragen.

    Leeg zonder gesprekspunten (geen factorprofiel). Zonder richtingdata rendert
    het blok wel, zonder vertaalvraag: herkennen en besluiten kan altijd. De
    rij "Vertalen" staat er alleen als translation_question een vraag geeft;
    nooit een lege rij.
    """
    if scan_type not in DIRECTION_SCAN_TYPES:
        raise ValueError(f"_werkvragen_block: geen werkvragen voor scan_type {scan_type!r}")
    punten = [r for r in ranked if r["agenda_role"] in ("startpunt", "tweede")]
    if not punten:
        return ""
    cards = ""
    for r in punten:
        fk = r["key"]
        agg = direction_agg.get(fk) if direction_agg else None
        if agg is not None:
            st = direction_state(agg, fk, _shown(r["score"]))
            vertaal = translation_question(scan_type, fk, st)
            staat = st["state"]
        else:
            vertaal, staat = None, "too_few"
        rijen = [("Herkennen", _herkenningsvraag(deep_agg, scan_type, fk, r["label"], r["score"]))]
        if vertaal:
            rijen.append(("Vertalen", vertaal))
        rijen.append(("Besluiten", _besluitvraag(staat)))
        rol = "Startpunt" if r["agenda_role"] == "startpunt" else "Tweede punt"
        trs = "".join(f'<tr><td class="wq-stap">{_h(stap)}</td><td class="wq-vraag">{_h(vraag)}</td></tr>'
                      for stap, vraag in rijen)
        cards += (f'<td class="wq-card"><div class="dir-role">{rol}: {_h(r["label"])}</div>'
                  f'<table class="wq-tbl">{trs}</table></td>')
    return (f'<div class="wq-block"><span class="eyebrow">{WERKVRAGEN_EYEBROW}</span>'
            f'<p class="dir-intro">{WERKVRAGEN_INTRO}</p>'
            f'<table class="dir-grid wq-grid"><tr>{cards}</tr></table></div>')
```

- [ ] **Stap 4: Hang het blok in `_prioriteringsraster`**

Voeg aan de signatuur van `_prioriteringsraster` toe, na `brug_zin: str = ""`:

```python
                         werkvragen_html: str = "") -> str:
```

(de bestaande `brug_zin: str = "") -> str:` wordt `brug_zin: str = "",`), en zet in het return-sjabloon direct na de regel `  {dir_block}`:

```python
  {werkvragen_html}
```

Voeg aan de docstring toe:

```python
    werkvragen_html (plan 3b): het blok "Zo maak je er een besluit van", door de
    renderers gebouwd met _werkvragen_block. Leeg voor directe aanroepers.
```

- [ ] **Stap 5: Laat de twee renderers het blok bouwen**

In `render_exit_report_html`, in de aanroep van `_prioriteringsraster` (anker `direction_block_html=_dir_block,`), voeg toe na `brug_zin=_brug,`:

```python
        werkvragen_html=_werkvragen_block(_raster_rows, deep_agg, direction_agg, "exit"),
```

In `render_retention_report_html` hetzelfde, met `ST` in plaats van `"exit"`:

```python
        werkvragen_html=_werkvragen_block(_raster_rows, deep_agg, direction_agg, ST),
```

`render_onboarding_report_html` blijft ongewijzigd.

- [ ] **Stap 6: De vaste regel op de afdelingspagina (H7)**

Boven `def _segment_block(` in `backend/report_html.py`:

```python
# H7 (koude leesronde): de afdelingsmanager zegt "dat komt door de reorganisatie".
# Het rapport kan dat niet toetsen en zegt dat eerlijk: toelichtingen staan er
# alleen organisatiebreed (per afdeling zijn het er te weinig om te tonen).
SEGMENT_TOELICHTING_GRENS = (
    "Een lage score zegt niet waarom. Vraag de afdeling zelf naar de toelichting; "
    "het rapport toont die alleen organisatiebreed.")
```

Voeg aan de signatuur van `_segment_block` toe, na `hidden_n: int = 0`:

```python
                   hidden_n: int = 0, toelichting_regel: bool = False) -> str:
```

en zet in het return-sjabloon van de tak mét tabel, direct na `    {low_note}`:

```python
    {f'<p class="trustline">{SEGMENT_TOELICHTING_GRENS}</p>' if toelichting_regel else ''}
```

In `render_exit_report_html` en `render_retention_report_html` geef je in de aanroep van `_segment_block` mee: `toelichting_regel=bool(deep_agg) and bool(_seg_rows)`. Loep Start geeft hem niet mee (daar bestaan geen toelichtingen, dus "het rapport toont die alleen organisatiebreed" zou onwaar zijn).

- [ ] **Stap 7: CSS**

In `backend/report_css.py`, na de laatste `.dir-`-regel van het blok `/* ── Richtingblok "Wat er moet gebeuren" ── */`:

```css
/* ── Werkvragen "Zo maak je er een besluit van" (plan 3b) ── */
.wq-block { margin-top: 16px; break-inside: avoid; }
.wq-card { width: 50%; vertical-align: top; background: #FFFFFF; border-left: 3px solid """ + accent + r"""; padding: 10px 14px; }
.wq-tbl { width: 100%; border-collapse: collapse; }
.wq-tbl td { font-size: 10px; line-height: 1.5; color: #374151; padding: 5px 0; vertical-align: top; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.wq-tbl tr:last-child td { border-bottom: none; }
.wq-stap { width: 22%; font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: """ + accent_lo + r"""; padding-right: 8px; }
```

Geen `gap`, geen flex, geen `inset`, geen CSS-variabelen: WeasyPrint negeert die stil.

- [ ] **Stap 8: Draai de tests en zie ze slagen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_werkvragen.py tests/test_direction_report_block.py tests/test_report_priority_render.py -q -p no:cacheprovider`
Verwacht: alles `passed`.

- [ ] **Stap 9: Leg de afwijking vast in de spec**

Voeg onder "Afwijkingen bij plan 3b" toe:

```markdown
- **Terugval van de herkenningsvraag noemt de score, niet "zo laag" (par. 6 punt 1):** bij een vlak profiel is het startpunt een aandachtspunt of relatief sterk, en dan is "zo laag" onwaar. Wordt: "Wat zit er volgens jullie achter de 6.2/10 op [onderwerp]?" Dezelfde terugval geldt als `*_other` de grootste toelichting is: een Anders-antwoord is geen toelichting om te citeren.
- **Besluitvraag bij `none_needed`:** de richtingkaart zegt daar al dat volgens de meeste betrokkenen niets hoeft. De besluitvraag laat het MT dan ook besluiten hier niets te doen, met eigenaar en een moment om opnieuw te kijken.
- **Het blok rendert ook zonder richtingdata** (meting van vóór de richtingvraag): herkennen en besluiten kan altijd; alleen de vertaalvraag vervalt.
- **De H7-regel staat er alleen bij Vertrek en Behoud met verdiepingsdata.** Bij Loep Start bestaan geen toelichtingen; de zin zou daar iets beloven dat er niet is.
```

- [ ] **Stap 10: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`. Valt een bestaande test om op een HTML-volgorde in de gespreksagenda, dan is dat een lockstep-geval alleen als de test de volgorde "richtingblok, dan direct het navy slot" pinde; meld elke andere.

- [ ] **Stap 11: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_report_werkvragen.py docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "feat(rapport): werkvragen per gesprekspunt onder 'Wat er moet gebeuren'

Herkennen (toelichting met telling en noemer, of de score als terugval),
vertalen (translation_question, nog zonder content) en besluiten. Plus de
vaste regel op de afdelingspagina dat een lage score niet zegt waarom (H7).
Dicht gat B3 van de koude leesronde zodra Taak 13 de content levert.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 6: De besluitpagina (leeg), "Uit de bespreking" weg, leidraad rij 5 met een echt paginanummer

De laatste pagina vóór de appendix wordt een invulbaar A4 **"Besluit van het MT"** (spec par. 7), in alle drie de producten. Het oude blok met drie invulregels (Vertrek en Behoud: de `fill-steps`-tabel in het navy slot; Loep Start: de cel "Uit de bespreking") verdwijnt, samen met de slotzin "Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is" waar de leesronde (H11) over struikelde. Op die plek komt één regel die naar de besluitpagina verwijst.

Velden, in deze volgorde (H11, H12):

1. Meting (voorgedrukt) en **Datum van dit gesprek** (lijn).
2. **Startpunt** (voorgedrukt) en **Wat precies** (drie lijnen). Zonder factorprofiel is er geen startpunt: dan staat er een lijn met de regel dat dit rapport nog geen startpunt aanwijst.
3. **Eigenaar** (lijn) en **Datum vervolgmoment** (lijn; een datum, geen termijn, met de hint ernaast).
4. **Tweede punt** (voorgedrukt als er een is, anders een lijn) en **Wat precies** (drie lijnen).
5. **Terugkoppeling aan medewerkers**: wie, wanneer, wat (drie lijnen met label).
6. **Waaraan zien we dat het werkt** (één lijn).
7. Voetregel.

**Afwijking van de spec (vastleggen):** de spec schrijft als voetregel "Vul dit ook in op je dashboard; bij een vervolgmeting zet Loep dit besluit op pagina twee." De vervolgmeting is plan 3c en bestaat nog niet; die belofte is tot dan onwaar. Wordt: "Leg dit besluit ook vast in je dashboard. Loep drukt het dan voor in dit rapport en bewaart het bij deze meting." Plan 3c zet de zin uit de spec terug zodra de vergelijkingspagina er is.

**Loep Start** krijgt dezelfde pagina. Het verschil zit in de inleiding: Vertrek en Behoud verwijzen naar de werkvragen, Loep Start zegt eerlijk dat het besluit uit het gesprek over het startpunt volgt (geen richtingvraag, geen werkvragen).

De pagina opent met een hoofdstukkop (`ch.opener`), want `scripts/check_pdf_report.py` eist dat elke pagina waarnaar pagina twee verwijst met een hoofdstuknummer begint. Rij 5 van de leidraad krijgt geen extra regel maar een kortere tekst met twee verwijzingen (agenda en besluit); pagina twee moet één A4 blijven.

**Files:**
- Modify: `backend/report_html.py` (`LEIDRAAD_ANKERS`, `_leidraad_block`, `_eerste_managementspoor`, `_prioriteringsraster`, `WERKVRAGEN_INTRO`, nieuwe `_besluit_page` direct na `_werkvragen_block`, de drie renderers)
- Modify: `backend/report_css.py` (na het `wq-`-blok uit Taak 5)
- Test: `tests/test_report_besluitpagina.py` (nieuw)
- Lockstep: `tests/test_pdf_redesign.py::test_managementspoor_eigenaarschap_is_blank_not_ai_suggested`, `tests/test_report_paginavulling.py::test_raster_agenda_invulregels_naast_elkaar_en_slotregel_reist_mee`, `tests/test_report_priority_render.py::test_navy_slotblok_met_opener_en_invulregels`, `tests/test_report_p02_mtvel.py::test_leidraad_belooft_geen_toelichtingen_in_een_meting_zonder_verdieping`

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_besluitpagina.py`:

```python
"""De besluitpagina "Besluit van het MT" (plan 3b, spec 16-9 par. 7).

Invulbaar met de pen: lijnen, geen PDF-formulier. In alle drie de producten, ook
zonder factorprofiel. Niets op deze pagina veronderstelt een begeleider van Loep
(propositiebesluit 2026-09-19).
"""
import re

import pytest

from backend.report_html import (
    BESLUIT_TITEL,
    BESLUIT_VOETREGEL,
    LEIDRAAD_ANKERS,
    _besluit_page,
    _leidraad_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture

_RENDER = {"exit": render_exit_report_html, "retention": render_retention_report_html,
           "onboarding": render_onboarding_report_html}


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _pagina(**kw) -> str:
    basis = dict(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                 startpunt_label="Groeiperspectief", tweede_label="Werkdruk en herstelruimte",
                 review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.", heeft_werkvragen=True)
    basis.update(kw)
    return _besluit_page(**basis)


def test_pagina_draagt_alle_velden_uit_de_spec():
    t = _plain(_pagina())
    for veld in ("Meting", "Wave 1", "Datum van dit gesprek", "Startpunt", "Groeiperspectief",
                 "Wat precies", "Eigenaar", "Datum vervolgmoment", "Tweede punt",
                 "Werkdruk en herstelruimte", "Terugkoppeling aan medewerkers", "Wie", "Wanneer",
                 "Wat", "Waaraan zien we dat het werkt"):
        assert veld in t, veld
    assert BESLUIT_VOETREGEL in t


def test_pagina_is_een_eigen_vel_en_breekt_niet():
    html = _pagina()
    assert html.startswith('<div class="pb sec besluit">')
    assert html.count('class="bl-line"') >= 12     # 3 + 3 wat precies, eigenaar, 2 datums, 3 terugkoppeling, 1 succes


def test_vervolgmoment_vraagt_een_datum_met_de_hint_ernaast():
    t = _plain(_pagina())
    assert "Kies een datum, geen termijn." in t
    assert "Richtlijn: 45 tot 90 dagen na dit gesprek." in t


def test_zonder_tweede_punt_blijft_het_veld_invulbaar():
    t = _plain(_pagina(tweede_label=None))
    assert "Tweede punt (als jullie er een kiezen)" in t
    assert "None" not in t


def test_zonder_startpunt_zegt_de_pagina_dat_eerlijk():
    t = _plain(_pagina(startpunt_label=None, tweede_label=None, heeft_werkvragen=False))
    assert "Dit rapport wijst nog geen startpunt aan; kies zelf het onderwerp." in t
    assert "None" not in t


def test_inleiding_verwijst_naar_de_werkvragen_of_zegt_dat_ze_er_niet_zijn():
    met = _pagina()
    assert "Zo maak je er een besluit van" in _plain(met)
    assert 'href="#' + LEIDRAAD_ANKERS["agenda"] + '"' in met
    start = _plain(_pagina(scan_type="onboarding", heeft_werkvragen=False))
    assert "Zo maak je er een besluit van" not in start
    assert "Loep Start meet nog geen richtingvraag" in start


def test_niets_veronderstelt_een_begeleider_en_geen_streepjes():
    t = _plain(_pagina()).lower()
    for fout in ("tijdens de bespreking", "uit de bespreking", "begeleide", "bespreking met loep",
                 "vervolgmeting", "\u2014", "\u2013"):
        assert fout not in t, fout


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
@pytest.mark.parametrize("profile,n", [(True, 25), (False, 7)])
def test_elk_product_heeft_de_pagina_voor_de_appendix_ook_zonder_profiel(scan_type, profile, n):
    body = _body(_RENDER[scan_type](_fixture(scan_type, n=n, profile=profile)))
    assert body.count('<div class="pb sec besluit">') == 1
    assert body.count('id="' + LEIDRAAD_ANKERS["besluit"] + '"') == 1
    assert BESLUIT_TITEL in body
    assert body.index(BESLUIT_TITEL) < body.index("Methodiek, privacy")
    if "Volledige vraagresultaten" in body:
        assert body.index(BESLUIT_TITEL) < body.index("Volledige vraagresultaten")


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_het_oude_blok_is_weg_en_de_agenda_verwijst_naar_de_besluitpagina(scan_type):
    body = _body(_RENDER[scan_type](_fixture(scan_type, n=25, profile=True)))
    t = _plain(body)
    assert "Uit de bespreking" not in t
    assert "In te vullen tijdens de bespreking" not in t
    assert "Nog niet besluiten" not in t
    assert "fill-steps" not in body
    assert "Leg het besluit vast op pagina" in t


def test_leidraad_rij_vijf_wijst_naar_agenda_en_besluit():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_direction=True, has_deepening=True)
    rij = html[html.index("33-45 min"):]
    assert 'href="#' + LEIDRAAD_ANKERS["agenda"] + '"' in rij
    assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in rij
    assert "met de werkvragen" in _plain(rij)
    assert html.count("<tr>") == 5          # geen extra rij: p.02 blijft een A4
    zonder = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                             has_direction=False, has_deepening=False)
    assert "werkvragen" not in _plain(zonder)
    assert 'href="#' + LEIDRAAD_ANKERS["besluit"] + '"' in zonder
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_besluitpagina.py -q -p no:cacheprovider`
Verwacht: FAIL bij het importeren (`cannot import name 'BESLUIT_TITEL'`).

- [ ] **Stap 3: Anker en leidraad rij 5**

In `LEIDRAAD_ANKERS` (anker `"drempels": "sec-drempels",`), voeg toe:

```python
    "besluit": "sec-besluit",          # besluitpagina "Besluit van het MT" (plan 3b)
```

Vervang in `_leidraad_block` de toekenning van `slot` door:

```python
    # Plan 3b: het besluit heeft een eigen pagina. Geen extra rij (p.02 blijft
    # een A4), wel twee verwijzingen in deze ene.
    besluit = f"Het besluit leg je vast op pagina {p(A['besluit'])}."
    slot = (f"Wat er volgens je mensen moet gebeuren, met de werkvragen (pagina {p(A['agenda'])}). "
            + besluit
            if has_direction else
            f"Het eerste gesprekspunt (pagina {p(A['agenda'])}). " + besluit)
```

- [ ] **Stap 4: Schrijf `_besluit_page`**

Direct na `_werkvragen_block` in `backend/report_html.py`:

```python
# ── Besluitpagina "Besluit van het MT" (plan 3b, spec 16-9 par. 7) ───────────
# Invulbaar met de pen. De HR-manager leidt het gesprek; het MT vult in.

BESLUIT_TITEL = "Besluit van het MT"
# Afwijking van de spec: die belooft "bij een vervolgmeting zet Loep dit besluit
# op pagina twee". De vervolgmeting is plan 3c; tot dan is dat onwaar.
BESLUIT_VOETREGEL = ("Leg dit besluit ook vast in je dashboard. Loep drukt het dan voor in dit "
                     "rapport en bewaart het bij deze meting.")
BESLUIT_GEEN_STARTPUNT = "Dit rapport wijst nog geen startpunt aan; kies zelf het onderwerp."
BESLUIT_DATUM_HINT = "Kies een datum, geen termijn."


def _bl_lines(n: int) -> str:
    return '<div class="bl-line"></div>' * n


def _bl_veld(label: str, inhoud: str, hint: str = "") -> str:
    hint_html = f'<div class="bl-hint">{_h(hint)}</div>' if hint else ""
    return f'<div class="bl-lbl">{_h(label)}</div>{inhoud}{hint_html}'


def _besluit_page(*, opener_html: str, scan_type: str, campaign_name: str,
                  startpunt_label: str | None, tweede_label: str | None,
                  review_hint: str, heeft_werkvragen: bool) -> str:
    """Eén A4, los te printen. Voorgedrukt is alleen wat het rapport weet: de
    meting, het startpunt en het tweede punt. Al het andere is een lijn.

    Zonder startpunt (geen factorprofiel) staat er een lijn met de reden; zonder
    tweede punt blijft dat veld invulbaar. heeft_werkvragen volgt het blok op de
    gespreksagenda: alleen dan verwijst de inleiding ernaar.
    """
    agenda = _pref(LEIDRAAD_ANKERS["agenda"])
    if heeft_werkvragen:
        intro = (f"Neem de uitkomst van ‘{WERKVRAGEN_EYEBROW}’ (pagina {agenda}) hier over. "
                 "Eén besluit dat iemand draagt is meer waard dan vijf voornemens.")
    elif scan_type == "onboarding":
        intro = ("Loep Start meet nog geen richtingvraag; het besluit volgt uit jullie gesprek over "
                 f"het startpunt (pagina {agenda}). Eén besluit dat iemand draagt is meer waard "
                 "dan vijf voornemens.")
    else:
        intro = (f"Het besluit volgt uit jullie gesprek over de gespreksagenda (pagina {agenda}). "
                 "Eén besluit dat iemand draagt is meer waard dan vijf voornemens.")

    def _onderwerp(label: str | None, leeg_hint: str) -> str:
        if label:
            return '<div class="bl-vast">' + _h(label) + "</div>"
        hint = ('<div class="bl-hint">' + _h(leeg_hint) + "</div>") if leeg_hint else ""
        return _bl_lines(1) + hint

    startpunt = _onderwerp(startpunt_label, BESLUIT_GEEN_STARTPUNT)
    tweede_lbl = "Tweede punt" if tweede_label else "Tweede punt (als jullie er een kiezen)"
    tweede = _onderwerp(tweede_label, "")
    # Lokale variabelen in plaats van geneste f-strings: Python 3.11 (Railway).
    meting = '<div class="bl-vast">' + _h(campaign_name) + "</div>"
    datum_hint = BESLUIT_DATUM_HINT + " " + review_hint
    return f"""<div class="pb sec besluit">
  {opener_html}
  <p class="sec-intro">{intro}</p>
  <table class="bl-rij"><tr>
    <td class="bl-cel">{_bl_veld("Meting", meting)}</td>
    <td class="bl-cel">{_bl_veld("Datum van dit gesprek", _bl_lines(1))}</td>
  </tr></table>
  <div class="bl-blok">
    {_bl_veld("Startpunt", startpunt)}
    {_bl_veld("Wat precies", _bl_lines(3), "Een onderwerp is nog geen afspraak: schrijf op wat er gebeurt.")}
  </div>
  <table class="bl-rij"><tr>
    <td class="bl-cel">{_bl_veld("Eigenaar", _bl_lines(1), "Eén naam.")}</td>
    <td class="bl-cel">{_bl_veld("Datum vervolgmoment", _bl_lines(1), datum_hint)}</td>
  </tr></table>
  <div class="bl-blok">
    {_bl_veld(tweede_lbl, tweede)}
    {_bl_veld("Wat precies", _bl_lines(3))}
  </div>
  <div class="bl-blok">
    <div class="bl-lbl">Terugkoppeling aan medewerkers</div>
    <table class="bl-drie"><tr>
      <td>{_bl_veld("Wie", _bl_lines(1))}</td>
      <td>{_bl_veld("Wanneer", _bl_lines(1))}</td>
      <td>{_bl_veld("Wat", _bl_lines(1))}</td>
    </tr></table>
    <div class="bl-hint">Je mensen vulden in; ze horen wat het MT ermee doet.</div>
  </div>
  <div class="bl-blok">
    {_bl_veld("Waaraan zien we dat het werkt", _bl_lines(1))}
  </div>
  <p class="trustline">{BESLUIT_VOETREGEL}</p>
</div>"""
```

Pas in dezelfde stap `WERKVRAGEN_INTRO` (Taak 5) aan, zodat de werkvragen naar de besluitpagina wijzen. Omdat de intro nu een `<a>` draagt, gaat hij bewust niet door `_h()` (vaste copy zonder data, zoals de leidraad):

```python
WERKVRAGEN_INTRO = ("Per gesprekspunt de vragen die het MT van ‘dit kozen je mensen’ naar "
                    "‘dit gaan wij doen’ brengen. Loep geeft hier geen advies; het besluit is "
                    "aan jullie en komt op pagina " + _pref(LEIDRAAD_ANKERS["besluit"]) + ".")
```

`_pref` en `LEIDRAAD_ANKERS` staan hoger in het bestand dan het werkvragenblok; controleer dat met `grep -n "^def _pref\|^LEIDRAAD_ANKERS\|^WERKVRAGEN_INTRO" backend/report_html.py` (de eerste twee regelnummers moeten lager zijn dan het derde).

- [ ] **Stap 5: Haal het oude blok uit de twee agenda-functies**

In `_prioriteringsraster`: verwijder de lokale functie `_fill_row`, de variabele `review_hint`, en in het return-sjabloon de hele `<table class="steps fill-steps">...</table>` en de regel met "Nog niet besluiten". Het slot wordt:

```python
  <div class="no-break agenda-slot">
  <div class="agenda-dark" style="margin-top:16px;">
    <div class="agenda-opener">
      <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(opener_vraag)}</p>
      {f'<p class="agenda-why" style="margin-top:6px;">Dezelfde opener staat op pagina {_pref("p02")}.</p>' if ranked else ''}
    </div>
  </div>
  <p class="trustline">Leg het besluit vast op pagina {_pref(LEIDRAAD_ANKERS["besluit"])}: wat precies, wie, en op welke datum jullie opnieuw kijken.</p>
  </div>
```

De parameter `review_when` blijft in de signatuur staan (een twintigtal tests geeft hem mee) maar wordt niet meer gebruikt; zet dat in de docstring: `review_when: sinds plan 3b ongebruikt (de hint staat op de besluitpagina); blijft in de signatuur tot de aanroepers zijn opgeschoond.`

In `_eerste_managementspoor`: verwijder de lokale `_fill_row`, de derde `<td class="step">` met "Uit de bespreking", de variabele `review_hint` en de slotregel "Nog niet besluiten"; zet op die plek dezelfde trustline als hierboven. Werk de docstring bij (de alinea over "Uit de bespreking" vervalt; `review_when` krijgt dezelfde zin als hierboven). De constante `REVIEW_WHEN_GEEN_PROFIEL` heeft daarna geen gebruiker meer (geen test verwijst ernaar): verwijder hem, met zijn commentaar.

De sectie-intro van de Loep Start-agenda belooft nog "wanneer je erop terugkomt"; dat staat nu op de besluitpagina. Vervang in `SECTION_INTROS["gespreksagenda"]` de laatste twee zinnen door (geen test pint deze zin):

```python
    "gespreksagenda": (
        "Alles wat je tot hier las is de onderbouwing; hier begint het gesprek. Deze agenda "
        "vat samen wat als eerste op tafel hoort en waarom juist dat. Het is bewust geen "
        "kant-en-klaar actieplan: de keuzes (wat pakken we op, wie is eigenaar, wanneer kijken "
        "we opnieuw) maken jullie zelf, en je legt ze vast op de besluitpagina."),
```

Neem de sleutel en de omringende opmaak over zoals ze in het bestand staan (`grep -n '"gespreksagenda"' backend/report_html.py`); alleen de tekst verandert.

- [ ] **Stap 6: Hang de pagina in de drie renderers**

In `render_exit_report_html`, direct na de aanroep `s += _prioriteringsraster(...)` en vóór `# ── Appendix`:

```python
    # ── Besluitpagina (plan 3b): laatste pagina voor de appendix ─────────────
    _wq_html = _werkvragen_block(_raster_rows, deep_agg, direction_agg, "exit")
    s += _besluit_page(
        opener_html=ch.opener(BESLUIT_TITEL, kicker="In te vullen door het MT",
                              anchor=LEIDRAAD_ANKERS["besluit"]),
        scan_type="exit", campaign_name=data["campaign_name"],
        startpunt_label=next((r["label"] for r in _raster_rows if r["agenda_role"] == "startpunt"), None),
        tweede_label=next((r["label"] for r in _raster_rows if r["agenda_role"] == "tweede"), None),
        review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.",
        heeft_werkvragen=bool(_wq_html))
```

Verplaats de toekenning van `_wq_html` naar vóór de aanroep van `_prioriteringsraster` en geef daar `werkvragen_html=_wq_html` mee, zodat het blok één keer wordt gebouwd. Doe hetzelfde in `render_retention_report_html` met `ST`. In `render_onboarding_report_html`, direct na `s += _eerste_managementspoor(...)`:

```python
    s += _besluit_page(
        opener_html=ch.opener(BESLUIT_TITEL, kicker="In te vullen door het MT",
                              anchor=LEIDRAAD_ANKERS["besluit"]),
        scan_type=ST, campaign_name=data["campaign_name"],
        startpunt_label=_fl(_ob_startpunt_fk, ST) if _ob_startpunt_fk and not _geen_profiel else None,
        tweede_label=_fl(_ob_second_fk, ST) if _ob_second_fk and not _geen_profiel else None,
        review_hint="Richtlijn: rond het volgende checkpoint.",
        heeft_werkvragen=False)
```

- [ ] **Stap 7: CSS**

In `backend/report_css.py`, direct na het `wq-`-blok:

```css
/* ── Besluitpagina "Besluit van het MT" (plan 3b): lijnen voor de pen ── */
.besluit { break-inside: avoid; }
.bl-rij, .bl-drie { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 14px; }
.bl-cel { width: 50%; vertical-align: top; padding-right: 18px; }
.bl-drie td { width: 33.3%; vertical-align: top; padding-right: 14px; }
.bl-drie .bl-lbl { margin-top: 4px; font-size: 7.5px; }
.bl-blok { margin-top: 16px; break-inside: avoid; }
.bl-lbl { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: """ + accent_lo + r"""; margin: 10px 0 2px; }
.bl-vast { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px; color: """ + INK + r"""; padding: 4px 0 2px; }
.bl-line { border-bottom: 1px solid #94A3B8; height: 24px; }
.bl-hint { font-size: 8.5px; font-style: italic; color: """ + STEEL + r"""; margin-top: 4px; }
```

- [ ] **Stap 8: Lockstep-tests (spec par. 7 schrijft de nieuwe vorm voor)**

1. `tests/test_pdf_redesign.py::test_managementspoor_eigenaarschap_is_blank_not_ai_suggested`: de drie asserties op "Uit de bespreking", "step-fill" en "in te vullen tijdens de bespreking" en de `split("eigenaar</div>")`-regel vervangen door:

```python
    assert "Uit de bespreking" not in html
    assert "step-fill" not in html
    assert "Leg het besluit vast op pagina" in html
    # De agenda noemt de eigenaar alleen als keuze van het MT (sectie-intro),
    # nooit als ingevulde naam of rol: het navy vlak draagt geen eigenaarveld meer.
    donker = html[html.index('<div class="agenda-dark">'):]
    assert "eigenaar" not in donker.lower()
```
   en de docstring: "Plan 3b: het invulblok is verhuisd naar de besluitpagina; de agenda suggereert nog steeds geen eigenaar."

2. `tests/test_report_paginavulling.py::test_raster_agenda_invulregels_naast_elkaar_en_slotregel_reist_mee`: hernoem naar `test_raster_agenda_slotregel_reist_mee_met_het_navy_blok` en vervang de body door:

```python
    d = _fixture("retention", n=25, profile=True)
    body = _body(render_retention_report_html(d))
    slot = body[body.index('<div class="no-break agenda-slot">'):]
    einde = slot.index("Leg het besluit vast op pagina")   # ValueError als de regel ontbreekt
    assert "fill-steps" not in slot[:einde]
    assert "Gespreksopener" in slot[:einde]
```

3. `tests/test_report_priority_render.py::test_navy_slotblok_met_opener_en_invulregels`: hernoem naar `test_navy_slotblok_met_opener_en_verwijzing_naar_de_besluitpagina`; de laatste twee asserties worden:

```python
    assert "In te vullen tijdens de bespreking" not in html
    assert "Leg het besluit vast op pagina" in html
```

4. `tests/test_report_p02_mtvel.py::test_leidraad_belooft_geen_toelichtingen_in_een_meting_zonder_verdieping`: de laatste assertie wordt `assert "Het eerste gesprekspunt (pagina" in tekst`.

- [ ] **Stap 9: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_besluitpagina.py tests/test_report_werkvragen.py tests/test_pdf_redesign.py tests/test_report_paginavulling.py tests/test_report_priority_render.py tests/test_report_p02_mtvel.py -q -p no:cacheprovider`
Verwacht: alles `passed` (PDF-tests `skipped`). Let op `test_report_p02_mtvel.py::test_elke_paginaverwijzing_wijst_naar_precies_een_anker` en `::test_degraded_staat_heeft_geen_leidraad_en_geen_losse_verwijzing`: die bewijzen dat het nieuwe anker `sec-besluit` in elke staat precies één keer bestaat.

- [ ] **Stap 10: Meet pagina twee en de agenda in het productie-image**

Volg het vaste recept, met als laatste argument een selectie: `python /repo/scripts/render_in_image.py 02 06 11 18 20`. Verwacht voor deze vijf: geen bevinding op `p02-op-een-a4` en geen op `paginaverwijzing`. Een `paginavulling`-bevinding op de besluitpagina of de agenda is hier een blokkade: meld de gemeten percentages en pas de maten van `.bl-line` (hoogte) aan tot de besluitpagina tussen 55% en 95% ligt en op één vel staat. Verander `MIN_FILL` niet.

- [ ] **Stap 11: Leg de afwijking vast in de spec**

Onder "Afwijkingen bij plan 3b":

```markdown
- **Voetregel van de besluitpagina (par. 7):** de spec belooft "bij een vervolgmeting zet Loep dit besluit op pagina twee". De vervolgmeting is plan 3c; tot die er is staat er "Leg dit besluit ook vast in je dashboard. Loep drukt het dan voor in dit rapport en bewaart het bij deze meting." Plan 3c zet de spec-zin terug.
- **Eén eigenaar en één vervolgdatum per besluit (par. 7):** de spec geeft het tweede punt "dezelfde drie regels". De tabel heeft één `owner` en één `follow_up_date`; het tweede punt krijgt daarom alleen "Wat precies". Twee eigenaren vragen een schemawijziging en zijn niet gevraagd.
- **`review_when` blijft als ongebruikte parameter** in `_prioriteringsraster` en `_eerste_managementspoor`: de hint staat nu op de besluitpagina. Opschonen van de aanroepers is een losse refactor.
```

- [ ] **Stap 12: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 13: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_report_besluitpagina.py tests/test_pdf_redesign.py tests/test_report_paginavulling.py tests/test_report_priority_render.py tests/test_report_p02_mtvel.py docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "feat(rapport): besluitpagina 'Besluit van het MT' vervangt 'Uit de bespreking'

Invulbaar A4 voor de appendix in alle drie de producten: wat precies, eigenaar,
datum vervolgmoment, tweede punt, terugkoppeling aan medewerkers, waaraan zien
we dat het werkt. De leidraad op pagina twee wijst er met een paginanummer naar.
Lockstep: vier tests die het oude invulblok pinden.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 7: De besluitpagina drukt een vastgelegd besluit voor

Staat er een besluit in `campaign_decisions` (Taak 2 levert het als `data["decision"]`), dan drukt het rapport dat voor in plaats van lege lijnen, en zegt het wanneer het is vastgelegd. Per veld: gevuld is tekst, leeg blijft een lijn (het MT kan op papier aanvullen). Kon Loep de tabel niet lezen (`decision_unavailable`), dan zegt de pagina dat in één regel en blijft ze invulbaar: zichtbare terugval, geen stille.

Het onderwerp dat het MT zelf vastlegde wint van het startpunt van het rapport: het is hun besluit. Wat het MT typte gaat altijd door `_h()`.

**Files:**
- Modify: `backend/report_html.py` (`_besluit_page` en de drie aanroepen)
- Test: `tests/test_report_besluitpagina.py` (uitbreiden)

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_besluitpagina.py` toe:

```python
# ── Taak 7: voorgedrukt besluit ──────────────────────────────────────────────
from datetime import date, datetime, timezone

BESLUIT = {
    "decided_at": date(2026, 4, 2), "primary_topic": "Groeiperspectief",
    "primary_action": "Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.",
    "owner": "Sanne de Vries", "follow_up_date": date(2026, 6, 15),
    "secondary_topic": "", "secondary_action": "", "feedback_plan": "",
    "success_criterion": "Iedereen heeft een afspraak op papier.",
    "updated_at": datetime(2026, 4, 3, 9, 30, tzinfo=timezone.utc),
}


def test_vastgelegd_besluit_staat_voorgedrukt_met_de_datum_van_vastleggen():
    html = _pagina(decision=BESLUIT)
    t = _plain(html)
    assert "Vastgelegd in het dashboard, laatst bijgewerkt op 3 april 2026." in t
    assert "Elke leidinggevende voert voor 1 juni een ontwikkelgesprek." in t
    assert "Sanne de Vries" in t
    assert "2 april 2026" in t and "15 juni 2026" in t
    assert "Iedereen heeft een afspraak op papier." in t


def test_lege_velden_van_een_vastgelegd_besluit_blijven_invulbaar():
    html = _pagina(decision=BESLUIT)
    # tweede punt: wat precies (3) + terugkoppeling (3) blijven lijnen
    assert html.count('class="bl-line"') == 6
    assert "Lege velden vul je met de pen in of werk je bij in het dashboard." in _plain(html)


def test_het_onderwerp_van_het_mt_wint_van_het_startpunt_van_het_rapport():
    t = _plain(_pagina(decision=dict(BESLUIT, primary_topic="Roosters in de zorgteams")))
    assert "Roosters in de zorgteams" in t
    assert t.count("Groeiperspectief") == 0


def test_tekst_van_het_mt_wordt_geescaped():
    html = _pagina(decision=dict(BESLUIT, primary_action="<script>alert(1)</script>"))
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


def test_onleesbare_tabel_wordt_gezegd_en_de_pagina_blijft_invulbaar():
    html = _pagina(decision=None, decision_unavailable=True)
    t = _plain(html)
    assert ("Loep kon niet nagaan of er al een besluit is vastgelegd in het dashboard; "
            "vul het hieronder in.") in t
    assert html.count('class="bl-line"') >= 12


def test_zonder_besluit_geen_statusregel():
    t = _plain(_pagina())
    assert "Vastgelegd in het dashboard" not in t
    assert "Loep kon niet nagaan" not in t


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_renderers_geven_het_besluit_door(scan_type):
    d = _fixture(scan_type, n=25, profile=True)
    d["decision"] = BESLUIT
    d["decision_unavailable"] = False
    assert "Sanne de Vries" in _plain(_body(_RENDER[scan_type](d)))
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_besluitpagina.py -q -p no:cacheprovider`
Verwacht: FAIL met `TypeError: _besluit_page() got an unexpected keyword argument 'decision'`.

- [ ] **Stap 3: Breid `_besluit_page` uit**

Voeg aan de signatuur toe, na `heeft_werkvragen: bool`:

```python
                  heeft_werkvragen: bool, decision: dict | None = None,
                  decision_unavailable: bool = False) -> str:
```

Voeg boven `_besluit_page` toe:

```python
BESLUIT_ONLEESBAAR = ("Loep kon niet nagaan of er al een besluit is vastgelegd in het dashboard; "
                      "vul het hieronder in.")


def _bl_waarde(tekst: str | None, lijnen: int) -> str:
    """Gevuld is tekst, leeg blijft een lijn voor de pen."""
    if tekst:
        return '<div class="bl-tekst">' + _h(tekst) + "</div>"
    return _bl_lines(lijnen)
```

Vervang daarna de hele body van `_besluit_page` vanaf `def _onderwerp(` tot en met de `return` door de versie hieronder (de `intro`-toekenning erboven blijft staan):

```python
    def _onderwerp(label: str | None, leeg_hint: str) -> str:
        if label:
            return '<div class="bl-vast">' + _h(label) + "</div>"
        hint = ('<div class="bl-hint">' + _h(leeg_hint) + "</div>") if leeg_hint else ""
        return _bl_lines(1) + hint

    d = decision or {}
    # Het onderwerp dat het MT zelf vastlegde wint: het is hun besluit.
    startpunt = _onderwerp(d.get("primary_topic") or startpunt_label, BESLUIT_GEEN_STARTPUNT)
    tweede_onderwerp = d.get("secondary_topic") or tweede_label
    tweede_lbl = "Tweede punt" if tweede_onderwerp else "Tweede punt (als jullie er een kiezen)"
    tweede = _onderwerp(tweede_onderwerp, "")
    if decision:
        status = ('<p class="bl-status">Vastgelegd in het dashboard, laatst bijgewerkt op '
                  + _h(_datum_nl(decision.get("updated_at")) or "een onbekende datum")
                  + ". Lege velden vul je met de pen in of werk je bij in het dashboard.</p>")
    elif decision_unavailable:
        status = '<p class="bl-status">' + BESLUIT_ONLEESBAAR + "</p>"
    else:
        status = ""
    # Lokale variabelen in plaats van geneste f-strings: Python 3.11 (Railway).
    meting = '<div class="bl-vast">' + _h(campaign_name) + "</div>"
    gesprek = _bl_waarde(_datum_nl(d.get("decided_at")), 1)
    wat1 = _bl_waarde(d.get("primary_action"), 3)
    wat1_hint = "" if d.get("primary_action") else "Een onderwerp is nog geen afspraak: schrijf op wat er gebeurt."
    eigenaar = _bl_waarde(d.get("owner"), 1)
    eigenaar_hint = "" if d.get("owner") else "Eén naam."
    vervolg = _bl_waarde(_datum_nl(d.get("follow_up_date")), 1)
    vervolg_hint = "" if d.get("follow_up_date") else BESLUIT_DATUM_HINT + " " + review_hint
    wat2 = _bl_waarde(d.get("secondary_action"), 3)
    succes = _bl_waarde(d.get("success_criterion"), 1)
    if d.get("feedback_plan"):
        terugkoppeling = _bl_waarde(d.get("feedback_plan"), 1)
    else:
        terugkoppeling = ('<table class="bl-drie"><tr>'
                          + "<td>" + _bl_veld("Wie", _bl_lines(1)) + "</td>"
                          + "<td>" + _bl_veld("Wanneer", _bl_lines(1)) + "</td>"
                          + "<td>" + _bl_veld("Wat", _bl_lines(1)) + "</td>"
                          + "</tr></table>")
    return f"""<div class="pb sec besluit">
  {opener_html}
  <p class="sec-intro">{intro}</p>
  {status}
  <table class="bl-rij"><tr>
    <td class="bl-cel">{_bl_veld("Meting", meting)}</td>
    <td class="bl-cel">{_bl_veld("Datum van dit gesprek", gesprek)}</td>
  </tr></table>
  <div class="bl-blok">
    {_bl_veld("Startpunt", startpunt)}
    {_bl_veld("Wat precies", wat1, wat1_hint)}
  </div>
  <table class="bl-rij"><tr>
    <td class="bl-cel">{_bl_veld("Eigenaar", eigenaar, eigenaar_hint)}</td>
    <td class="bl-cel">{_bl_veld("Datum vervolgmoment", vervolg, vervolg_hint)}</td>
  </tr></table>
  <div class="bl-blok">
    {_bl_veld(tweede_lbl, tweede)}
    {_bl_veld("Wat precies", wat2)}
  </div>
  <div class="bl-blok">
    <div class="bl-lbl">Terugkoppeling aan medewerkers</div>
    {terugkoppeling}
    <div class="bl-hint">Je mensen vulden in; ze horen wat het MT ermee doet.</div>
  </div>
  <div class="bl-blok">
    {_bl_veld("Waaraan zien we dat het werkt", succes)}
  </div>
  <p class="trustline">{BESLUIT_VOETREGEL}</p>
</div>"""
```

Zonder `decision` levert dit exact de pagina van Taak 6 (alle `_bl_waarde`-aanroepen geven lijnen, alle hints staan er); de tests van Taak 6 blijven dus ongewijzigd groen.

- [ ] **Stap 4: CSS**

In `backend/report_css.py`, in het besluitpagina-blok:

```css
.bl-tekst { font-size: 11px; line-height: 1.55; color: """ + INK + r"""; padding: 4px 0 6px; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.bl-status { font-size: 9.5px; color: """ + STEEL + r"""; margin: 8px 0 0; font-style: italic; }
```

- [ ] **Stap 5: Geef het besluit door in de drie renderers**

Voeg aan elk van de drie `_besluit_page(...)`-aanroepen toe:

```python
        decision=data.get("decision"),
        decision_unavailable=bool(data.get("decision_unavailable")),
```

`data.get` en niet `data[...]`: testfixtures dragen de nieuwe sleutels niet (vaste regel uit plan 3a: een ontbrekende sleutel rendert als "geen besluit", nooit als een verzonnen waarde).

- [ ] **Stap 6: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_besluitpagina.py tests/test_report_decision_data.py -q -p no:cacheprovider`
Verwacht: alles `passed`.

- [ ] **Stap 7: Faalset-commando (Taak 0) en de 3.11-guard**. Verwacht: `GEEN_REGRESSIES`, guard groen.

- [ ] **Stap 8: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_report_besluitpagina.py
git commit -m "feat(rapport): besluitpagina drukt een vastgelegd besluit voor

Gevulde velden als tekst, lege velden blijven een lijn voor de pen, met de
datum waarop het besluit in het dashboard is bijgewerkt. Kon Loep de tabel
niet lezen, dan zegt de pagina dat en blijft ze invulbaar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 8: `check_pdf_report.py`: regel `besluit-op-een-a4` en de uitzondering voor de appendixstaart

Twee kleine wijzigingen in het meetscript, elk met tests op PDF's die PyMuPDF zelf bouwt (dezelfde aanpak als plan 3a, taak 6).

**(a) Nieuwe regel `besluit-op-een-a4`** (spec par. 1 punt 3: "de besluitpagina print op één A4"). Belooft het rapport een besluitpagina (de regel "Leg het besluit vast op pagina" op de gespreksagenda), dan moet er precies één pagina zijn die met de hoofdstukkop "Besluit van het MT" begint, moet de voetregel op diezelfde pagina staan, en moet de pagina erna met een hoofdstukkop beginnen. Anders loopt de besluitpagina over. Een document zonder belofte en zonder besluitpagina (een render van vóór plan 3b) geeft geen bevinding.

**(b) De laatste pagina van de appendix is uitgezonderd van de vullingsregel.** Aanname op advies, door Lars nog te bevestigen (open besluit 1 uit het 3a-verslag: voorbeeld Loep Vertrek p.13, 36%). Reden: zodra een sectie langer is dan één vel bepaalt de hoeveelheid data hoe vol de staart is; geen CSS-maat lost dat op. De cover en de laatste pagina van het document waren al uitgezonderd. **Eén schakelaar, makkelijk terug te draaien:** `APPENDIX_STAART_UITGEZONDERD = False` herstelt het oude gedrag. De openingspagina van de appendix is nooit uitgezonderd, alleen een vervolgpagina.

De appendix begint sinds Taak 6 altijd bovenaan een vel: de besluitpagina ervoor krijgt in deze taak `break-after: page`, zodat de appendix niet onder het invulvel doorloopt (dat moet los te printen zijn).

**Files:**
- Modify: `scripts/check_pdf_report.py`
- Modify: `backend/report_css.py` (regel `.besluit` uit Taak 6)
- Test: `tests/test_check_pdf_besluit.py` (nieuw)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_check_pdf_besluit.py`:

```python
"""De twee regels die plan 3b aan scripts/check_pdf_report.py toevoegt.

Gemeten op PDF's die PyMuPDF zelf bouwt, met per regel een document dat hem
overtreedt en een document dat hem haalt. De echte render loopt via het
productie-image (plan 3b, Taak 15).
"""
from pathlib import Path

import pytest

pymupdf = pytest.importorskip("pymupdf")

from backend.report_css import build_css  # noqa: E402
from backend.report_html import BESLUIT_TITEL, BESLUIT_VOETREGEL  # noqa: E402
from scripts import check_pdf_report as cpr  # noqa: E402

A4 = (595.0, 842.0)


def _pdf(pad: Path, paginas: list[list[tuple[float, str]]]) -> str:
    doc = pymupdf.open()
    for regels in paginas:
        page = doc.new_page(width=A4[0], height=A4[1])
        for y, tekst in regels:
            page.insert_text((60.0, y), tekst, fontsize=11)
    doc.save(str(pad))
    doc.close()
    return str(pad)


def _vol(kop: str) -> list[tuple[float, str]]:
    return [(70.0, kop)] + [(y, "regel op " + str(int(y))) for y in range(100, 760, 20)]


def _dun(kop: str) -> list[tuple[float, str]]:
    return [(70.0, kop)] + [(y, "regel op " + str(int(y))) for y in range(100, 260, 20)]


BELOFTE = (400.0, "Leg het besluit vast op pagina 4: wat precies, wie, en op welke datum.")
VOET = (740.0, BESLUIT_VOETREGEL[:60])


def _besluit(met_voet: bool = True) -> list[tuple[float, str]]:
    regels = [(70.0, "04 " + BESLUIT_TITEL), (120.0, "Startpunt"), (400.0, "Eigenaar")]
    return regels + ([VOET] if met_voet else [])


# ── (a) besluit-op-een-a4 ────────────────────────────────────────────────────

def test_markers_komen_uit_de_renderer():
    assert cpr.BESLUIT_KOP == BESLUIT_TITEL
    assert BESLUIT_VOETREGEL.startswith(cpr.BESLUIT_VOET)


def test_besluitpagina_op_een_vel_is_goed(tmp_path):
    pad = _pdf(tmp_path / "goed.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                       _besluit(), _vol("05 Appendix"), _vol("06 Methodiek")])
    assert cpr.check(pad, regels=(cpr.REGEL_BESLUIT,)) == []


def test_belofte_zonder_besluitpagina_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "weg.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                      _vol("04 Appendix"), _vol("05 Methodiek")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert len(meldingen) == 1 and "geen pagina die met" in meldingen[0]


def test_overgelopen_besluitpagina_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "over.pdf", [_vol("cover"), _vol("01 Kop"), _vol("03 Agenda") + [BELOFTE],
                                       _besluit(met_voet=False), [VOET], _vol("05 Appendix")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert any("voetregel" in m for m in meldingen)
    assert any("begint niet met een hoofdstukkop" in m for m in meldingen)


def test_twee_besluitpaginas_is_een_bevinding(tmp_path):
    pad = _pdf(tmp_path / "twee.pdf", [_vol("cover"), _vol("01 Kop") + [BELOFTE], _besluit(),
                                       _besluit(), _vol("05 Methodiek")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_BESLUIT,))]
    assert len(meldingen) == 1 and "2 pagina's" in meldingen[0]


def test_oud_rapport_zonder_belofte_en_zonder_pagina_geeft_geen_bevinding(tmp_path):
    pad = _pdf(tmp_path / "oud.pdf", [_vol("cover"), _vol("01 Kop"), _vol("02 Agenda"), _vol("03 Methodiek")])
    assert cpr.check(pad, regels=(cpr.REGEL_BESLUIT,)) == []


def test_regel_zit_in_de_standaardselectie():
    assert cpr.REGEL_BESLUIT in cpr.ALLE_REGELS


def test_besluitpagina_houdt_de_appendix_van_het_vel():
    css = build_css("retention")
    regel = css[css.index(".besluit {"):]
    regel = regel[:regel.index("}")]
    assert "break-after: page" in regel and "break-inside: avoid" in regel


# ── (b) appendixstaart ───────────────────────────────────────────────────────

def _met_appendix(staart: list[tuple[float, str]]) -> list[list[tuple[float, str]]]:
    return [_vol("cover"), _vol("01 Kop"), _vol("02 Cijfers"), _vol("05 Appendix"), staart,
            _vol("06 Methodiek, privacy"), _dun("slot")]


def test_dunne_appendixstaart_is_uitgezonderd(tmp_path):
    pad = _pdf(tmp_path / "staart.pdf", _met_appendix(_dun("Werkbeleving: alle stellingen")))
    assert cpr.check(pad, regels=(cpr.REGEL_VULLING,)) == []


def test_uitzondering_is_met_een_schakelaar_terug_te_draaien(tmp_path, monkeypatch):
    pad = _pdf(tmp_path / "staart.pdf", _met_appendix(_dun("Werkbeleving: alle stellingen")))
    monkeypatch.setattr(cpr, "APPENDIX_STAART_UITGEZONDERD", False)
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 5 is")


def test_dunne_openingspagina_van_de_appendix_is_niet_uitgezonderd(tmp_path):
    pad = _pdf(tmp_path / "open.pdf", [_vol("cover"), _vol("01 Kop"), _vol("02 Cijfers"),
                                       _dun("05 Appendix"), _vol("06 Methodiek, privacy"), _dun("slot")])
    meldingen = [b.melding for b in cpr.check(pad, regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 4 is")


def test_een_dunne_pagina_elders_blijft_een_bevinding(tmp_path):
    paginas = _met_appendix(_vol("Werkbeleving: alle stellingen"))
    paginas[2] = _dun("02 Cijfers")
    meldingen = [b.melding for b in cpr.check(_pdf(tmp_path / "elders.pdf", paginas),
                                               regels=(cpr.REGEL_VULLING,))]
    assert len(meldingen) == 1 and meldingen[0].startswith("pagina 3 is")
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_check_pdf_besluit.py -q -p no:cacheprovider`
Verwacht: FAIL (`AttributeError: module 'scripts.check_pdf_report' has no attribute 'BESLUIT_KOP'`).

- [ ] **Stap 3: Pas het script aan**

In `scripts/check_pdf_report.py`. Voeg aan de moduledocstring, in de lijst met regels na `paginavulling`, toe:

```text
                    Ook uitgezonderd: de laatste vervolgpagina van de appendix
                    (APPENDIX_STAART_UITGEZONDERD, plan 3b). De hoeveelheid data
                    bepaalt hoe vol die staart is; geen lay-outmaat lost dat op;
  besluit-op-een-a4 belooft de gespreksagenda een besluitpagina, dan is er precies
                    één pagina die met de kop "Besluit van het MT" begint, staat
                    de voetregel op diezelfde pagina en begint de pagina erna met
                    een hoofdstukkop (plan 3b; het invulvel moet los te printen
                    zijn);
```

Na de constante `A4_TOLERANTIE_PT`:

```python
# Aanname plan 3b, door Lars te bevestigen: de laatste vervolgpagina van de
# appendix telt niet mee voor de vullingsregel. Zet op False om dat terug te
# draaien; verder verandert er dan niets.
APPENDIX_STAART_UITGEZONDERD = True

# Markers van de besluitpagina (backend/report_html.py: BESLUIT_TITEL,
# BESLUIT_VOETREGEL en de trustline onder de gespreksagenda). De test
# test_markers_komen_uit_de_renderer bewaakt dat ze gelijk blijven.
BESLUIT_KOP = "Besluit van het MT"
BESLUIT_VOET = "Leg dit besluit ook vast in je dashboard"
BESLUIT_BELOFTE = "Leg het besluit vast op pagina"
```

Bij de regelnamen:

```python
REGEL_BESLUIT = "besluit-op-een-a4"
ALLE_REGELS = (REGEL_P02, REGEL_VULLING, REGEL_VERWIJZING, REGEL_THEAD, REGEL_ZIJMARGE,
               REGEL_BESLUIT, REGEL_FORMAAT)
```

Nieuwe helpers, direct boven `def check(`:

```python
def _begint_met_hoofdstukkop(page: pymupdf.Page) -> bool:
    return bool(re.match(r"^\d{2}\b", first_text(page)))


def _appendix_staart(doc: pymupdf.Document) -> int | None:
    """Index van de laatste vervolgpagina van de appendix, of None.

    De appendix begint op de pagina die met "NN Appendix" opent en loopt tot de
    eerstvolgende pagina die met een hoofdstukkop begint. Alleen een
    vervolgpagina telt: de openingspagina zelf is nooit uitgezonderd.
    """
    start = None
    for i in range(doc.page_count):
        kop = first_text(doc[i]).casefold()
        if start is None:
            if re.match(r"^\d{2}\s+appendix\b", kop):
                start = i
        elif re.match(r"^\d{2}\b", kop):
            return i - 1 if i - 1 > start else None
    return None


def _besluit(doc: pymupdf.Document) -> list[Bevinding]:
    n = doc.page_count
    patroon = r"^\d{2}\s+" + re.escape(BESLUIT_KOP.casefold())
    koppen = [i for i in range(n) if re.match(patroon, first_text(doc[i]).casefold())]
    belooft = any(BESLUIT_BELOFTE.casefold() in _pagina_tekst(doc[i]).casefold() for i in range(n))
    if not koppen:
        if belooft:
            return [Bevinding(REGEL_BESLUIT,
                              f"de gespreksagenda belooft een besluitpagina, maar er is geen pagina "
                              f"die met {BESLUIT_KOP!r} begint")]
        return []
    if len(koppen) > 1:
        return [Bevinding(REGEL_BESLUIT,
                          f"{len(koppen)} pagina's beginnen met {BESLUIT_KOP!r} "
                          f"({[i + 1 for i in koppen]}); het moet er precies één zijn")]
    i = koppen[0]
    bevindingen: list[Bevinding] = []
    if BESLUIT_VOET.casefold() not in _pagina_tekst(doc[i]).casefold():
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 1} draagt de besluitpagina maar niet de voetregel; "
                           f"loopt het invulvel over naar een tweede pagina?"))
    if i + 1 < n and not _begint_met_hoofdstukkop(doc[i + 1]):
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 2}, direct na de besluitpagina, begint niet met een "
                           f"hoofdstukkop: {first_text(doc[i + 1])[:50]!r}"))
    return bevindingen
```

In `_check_doc`, vervang het blok `if REGEL_VULLING in regels:` door:

```python
    if REGEL_VULLING in regels:
        staart = _appendix_staart(doc) if APPENDIX_STAART_UITGEZONDERD else None
        for i in range(1, n - 1):
            if i == staart:
                continue
            f = page_fill(doc[i])
            if f < MIN_FILL:
                bevindingen.append(Bevinding(
                    REGEL_VULLING,
                    f"pagina {i + 1} is {f:.0%} gevuld (< {MIN_FILL:.0%}); "
                    f"begint met {first_text(doc[i])[:50]!r}"))

    if REGEL_BESLUIT in regels:
        bevindingen += _besluit(doc)
```

In `main()`, direct vóór de slotregel `print(f"{'OK' if not bevindingen else 'NIET OK'} ...`, zodat een uitzondering nooit onzichtbaar is:

```python
    if REGEL_VULLING in regels and APPENDIX_STAART_UITGEZONDERD:
        try:
            doc = pymupdf.open(args.pdf)
            staart = _appendix_staart(doc)
            if staart is not None:
                print(f"INFO {args.pdf}: pagina {staart + 1} (staart van de appendix, "
                      f"{page_fill(doc[staart]):.0%} gevuld) is uitgezonderd van de vullingsregel")
            doc.close()
        except Exception:                          # de meting zelf is hierboven al gelukt
            pass
```

Let op de f-strings hierboven: geen aanhalingsteken van hetzelfde type en geen backslash binnen een expressie (het script draait ook in het 3.11-image). `{BESLUIT_KOP!r}` en `{'OK' if ...}` binnen een `"`-string zijn geldig in 3.11.

- [ ] **Stap 4: De besluitpagina sluit haar vel af**

In `backend/report_css.py`, vervang de regel uit Taak 6:

```css
.besluit { break-inside: avoid; }
```

door:

```css
/* break-after: de appendix stroomt (.sec zonder .pb) en zou anders onder het
   invulvel beginnen; dat vel moet los te printen zijn. */
.besluit { break-inside: avoid; break-after: page; }
```

- [ ] **Stap 5: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_check_pdf_besluit.py tests/test_report_p02_mtvel.py tests/test_report_paginavulling.py -q -p no:cacheprovider`
Verwacht: alles `passed` of `skipped`. De bestaande scripttests in `test_report_p02_mtvel.py` die `cpr.check(pad)` zonder regelselectie aanroepen bouwen documenten zonder belofte en zonder besluitpagina; de nieuwe regel geeft daar geen bevinding.

- [ ] **Stap 6: Meet in het productie-image**

Volg het vaste recept op alle bestanden (geen selectie) en bewaar de uitvoer als `/c/Users/larsh/AppData/Local/Temp/loep-3b/na-taak8.txt` (Taak 9 vergelijkt ermee). Verwacht ten opzichte van de nulmeting uit Taak 0: `voorbeeldrapport_loep` is nu OK met een `INFO`-regel over de appendixstaart (die INFO-regel komt alleen uit de CLI; `render_in_image.py` toont hem niet, draai voor dat ene bestand `python /repo/scripts/check_pdf_report.py /out/voorbeeldrapport_loep.pdf` in dezelfde container); geen enkel bestand heeft een bevinding op `besluit-op-een-a4`; scenario 01, 09 en 19 staan nog op hun `paginavulling`-bevinding (Taak 9). De voorbeeld-HTML's in `docs/examples/` zijn nog de render van vóór 3b (die regenereer je pas in Taak 15); de besluitregel wordt hier door de 21 scenario's gedekt.

- [ ] **Stap 7: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 8: Commit**

```bash
git add scripts/check_pdf_report.py backend/report_css.py tests/test_check_pdf_besluit.py
git commit -m "test(pdf): regel besluit-op-een-a4 en uitzondering voor de appendixstaart

De besluitpagina moet op een vel staan en haar vel afsluiten. De laatste
vervolgpagina van de appendix telt niet mee voor de vullingsregel (aanname,
besluit bij Lars): APPENDIX_STAART_UITGEZONDERD = False draait het terug.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 9: Dunne verdiepingsblokken lopen door, gemeten in het productie-image

**Het probleem (nulmeting Taak 0).** In het productie-image (WeasyPrint 70.0) falen scenario 01, 09 en 19 op `paginavulling`: het verdiepingsblok van een onderwerp zónder verdiepingsdata (kop, spreidingsbalk en drie stellingen, geen toelichtingsblok) staat alleen op een vel, 26 tot 36% gevuld. Oorzaak: elk verdiepingsblok is `.sec.flow` met `break-inside: avoid`. Past het dunne blok niet meer onder zijn voorganger, dan verhuist het als geheel naar een nieuw vel, en het hoofdstuk erna (Werkbeleving, `.pb`) opent weer een eigen vel. Plan 3a was afgesteld op de ghcr-image (WeasyPrint 58.1), waar dit net wel paste.

**De ingreep.** Een dun blok, en het blok er direct vóór, mogen over een paginagrens lopen (`verd-los`: `break-inside: auto`), terwijl hun binnendelen heel blijven (kop bij de eerste inhoud, kaarten en tabelrijen ongebroken). Het dunne blok begint dan op de pagina van zijn voorganger in plaats van een eigen vel te forceren. "Dun" is een eigenschap van de data, geen lay-outgok: het onderwerp heeft geen getriggerde verdieping, dus `_deepening_block` levert niets. Rapporten zonder dun blok veranderen niet (byte-identieke HTML), dus daar kan niets verschuiven. Loep Start blijft buiten deze taak (scenario 20 haalt de regel).

**Dit is een lay-outtaak met een meetlus.** Of een paginagrens goed valt is niet op papier uit te rekenen; de acceptatie is een meting. `MIN_FILL` blijft 0,40, er komt geen nieuwe uitzondering bij, en geen scenario dat in de nulmeting OK was mag NIET OK worden.

**Files:**
- Modify: `backend/report_html.py` (nieuwe helpers boven `def render_exit_report_html`; `_factor_detail` in de Vertrek-renderer en `_ret_factor_detail` in de Behoud-renderer, plus hun aanroeplussen)
- Modify: `backend/report_css.py` (na `.sec.flow.verd.verd-eerste { margin-top: -20px; }`)
- Test: `tests/test_report_paginavulling.py` (uitbreiden)

- [ ] **Stap 1: Schrijf de falende tests**

Voeg onderaan `tests/test_report_paginavulling.py` toe:

```python
# ── Plan 3b, Taak 9: dunne verdiepingsblokken lopen door ─────────────────────

def _deep_agg_3b(**counts):
    n = sum(counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": counts, "secondary_counts": {}, "other_texts": []}


def _verd_klassen(body: str) -> list[str]:
    return re.findall(r'<div class="(sec flow verd[^"]*)">', body)


def test_verd_los_helper_kiest_dunne_blokken_en_hun_voorganger():
    from backend.report_html import _verd_los
    deep = {"workload": _deep_agg_3b(wl_recovery=6), "growth": _deep_agg_3b(gr_time=6)}
    assert _verd_los(["workload", "growth", "role_clarity"], deep) == {"growth", "role_clarity"}
    assert _verd_los(["role_clarity", "workload", "growth"], deep) == {"role_clarity"}
    assert _verd_los(["workload", "growth"], deep) == set()
    # Een aggregaat dat niet getriggerd is levert geen toelichtingsblok: ook dun.
    deep["leadership"] = dict(_deep_agg_3b(), triggered=0)
    assert _verd_los(["workload", "leadership"], deep) == {"workload", "leadership"}


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_dun_blok_en_zijn_voorganger_mogen_over_de_paginagrens(scan_type):
    d = _fixture(scan_type, n=25, profile=True)
    # De fixture heeft geen verdiepingsdata: drie verdiepingsblokken, alle drie dun.
    body0 = _body(_RENDERERS_3B[scan_type](d))
    assert len(_verd_klassen(body0)) == 3
    assert all("verd-los" in k for k in _verd_klassen(body0))


def test_rapport_zonder_dun_blok_verandert_niet():
    """Alle drie de onderwerpen met verdiepingsdata: geen enkele verd-los, dus
    de HTML (en daarmee de paginering) is die van voor deze taak."""
    d = _fixture("retention", n=25, profile=True)
    d["deepening_agg"] = {
        "workload": _deep_agg_3b(wl_recovery=6, wl_volume=3),
        "growth": _deep_agg_3b(gr_visibility=6, gr_time=3),
        "role_clarity": _deep_agg_3b(**{_eerste_optie("role_clarity"): 6}),
        "leadership": _deep_agg_3b(**{_eerste_optie("leadership"): 6}),
        "culture": _deep_agg_3b(**{_eerste_optie("culture"): 6}),
        "compensation": _deep_agg_3b(**{_eerste_optie("compensation"): 6}),
    }
    body = _body(render_retention_report_html(d))
    assert len(_verd_klassen(body)) == 3
    assert not any("verd-los" in k for k in _verd_klassen(body))


def test_loep_start_blijft_buiten_verd_los():
    from backend.report_html import render_onboarding_report_html
    body = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert "verd-los" not in body


def test_css_houdt_de_binnendelen_van_een_los_blok_heel():
    from backend.report_css import build_css
    css = build_css("retention")
    assert ".sec.flow.verd.verd-los { break-inside: auto; }" in css
    blok = css[css.index(".sec.flow.verd.verd-los"):]
    blok = blok[:blok.index("/* einde verd-los */")]
    assert "break-after: avoid" in blok          # kop blijft bij de eerste inhoud
    assert ".verd-los .card" in blok and ".verd-los .item-tbl tr" in blok
```

en bovenaan hetzelfde bestand, direct na de bestaande imports (`re`, `pytest`, de drie renderers, `_fixture` en `_body` staan er al):

```python
from backend.products.shared.deepening import DEEPENING_SETS

_RENDERERS_3B = {"exit": render_exit_report_html, "retention": render_retention_report_html}


def _eerste_optie(factor_key: str) -> str:
    """Een echte toelichtingssleutel van dit onderwerp (de renderer faalt hard op een onbekende)."""
    return DEEPENING_SETS[factor_key]["options"][0]["key"]
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_paginavulling.py -q -p no:cacheprovider -k "verd_los or dun_blok or zonder_dun or loep_start_blijft or binnendelen"`
Verwacht: FAIL (`cannot import name '_verd_los'`, en geen `verd-los` in de klassen).

- [ ] **Stap 3: Schrijf de helpers**

In `backend/report_html.py`, direct boven `def render_exit_report_html(`:

```python
# ── Dunne verdiepingsblokken (plan 3b, Taak 9) ────────────────────────────────
# Een onderwerp zonder getriggerde verdieping krijgt geen toelichtingsblok en is
# dan ongeveer een derde pagina hoog. Als .sec.flow (break-inside: avoid)
# verhuist het in zijn geheel zodra het niet meer onder zijn voorganger past, en
# staat het alleen op een vel (26 tot 36% gevuld in stresstest 01, 09 en 19,
# gemeten in het productie-image). Zo'n blok, en het blok er direct voor, mogen
# daarom over een paginagrens lopen; hun binnendelen blijven heel (CSS).

def _verdieping_is_dun(deep_agg: dict, factor_key: str) -> bool:
    """Zelfde voorwaarde als waarop _deepening_block niets levert."""
    agg = deep_agg.get(factor_key)
    return not (agg and agg.get("triggered"))


def _verd_los(priority_fkeys: list[str], deep_agg: dict) -> set[str]:
    """De onderwerpen waarvan het verdiepingsblok over een paginagrens mag
    lopen: elk dun blok en het blok er direct voor. Leeg als geen blok dun is;
    dan verandert er niets aan de HTML."""
    los: set[str] = set()
    for i, fk in enumerate(priority_fkeys):
        if _verdieping_is_dun(deep_agg, fk):
            los.add(fk)
            if i > 0:
                los.add(priority_fkeys[i - 1])
    return los
```

- [ ] **Stap 4: Zet de klasse in de twee renderers**

In `render_exit_report_html`, direct vóór `def _factor_detail(`:

```python
    _los_fkeys = _verd_los(priority_fkeys, deep_agg)
```

en vervang in `_factor_detail` de openingsregel van het return-sjabloon:

```python
        return f"""<div class="sec flow verd{' verd-eerste' if is_first else ''}">
```

door (de klasse vooraf opgebouwd, geen extra expressie in de f-string):

```python
        # verd-los VOOR verd-eerste: test_ook_het_eerste_verdiepingsonderwerp_stroomt
        # eist dat de klasse op verd-eerste eindigt.
        klassen = "sec flow verd" + (" verd-los" if fk in _los_fkeys else "") + (" verd-eerste" if is_first else "")
        return f"""<div class="{klassen}">
```

Doe exact hetzelfde in `render_retention_report_html` (vóór `def _ret_factor_detail(` en in die functie). `deep_agg` is in beide renderers al gedefinieerd vóór dit punt; controleer dat met `grep -n "deep_agg *=" backend/report_html.py`. `_ob_factor_detail` blijft ongewijzigd.

- [ ] **Stap 5: CSS**

In `backend/report_css.py`, direct na `.sec.flow.verd.verd-eerste { margin-top: -20px; }`:

```css
/* Dun verdiepingsblok en zijn voorganger (plan 3b): mogen over een paginagrens
   lopen, zodat het dunne blok niet alleen op een vel belandt. De binnendelen
   blijven heel: een kop staat nooit los onderaan, een kaart en een tabelrij
   breken niet. */
.sec.flow.verd.verd-los { break-inside: auto; }
.verd-los .slabel, .verd-los .ch-head, .verd-los h2, .verd-los .verd-h3 { break-after: avoid; }
.verd-los .card, .verd-los .item-tbl tr { break-inside: avoid; }
/* einde verd-los */
```

Het spreidingsblok (`distribution_block` in `backend/report_distribution.py`) draagt al `class="no-break"` en heeft dus geen eigen regel nodig.

- [ ] **Stap 6: Draai de tests**

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_paginavulling.py -q -p no:cacheprovider`
Verwacht: alles `passed` of `skipped`. De bestaande tests `test_elke_renderer_laat_de_volgende_verdieping_doorstromen` en `test_ook_het_eerste_verdiepingsonderwerp_stroomt` pinnen `sec flow verd` als prefix van de klasse; die blijft staan.

- [ ] **Stap 7: Meet in het productie-image (de eigenlijke acceptatie)**

Volg het vaste recept op **alle** bestanden en bewaar de uitvoer als `/c/Users/larsh/AppData/Local/Temp/loep-3b/na-taak9.txt`. Vergelijk per bestand met de meting van Taak 8:

```bash
diff <(grep -E "^(OK|NIET OK) " /c/Users/larsh/AppData/Local/Temp/loep-3b/na-taak8.txt | sed -E "s/ paginas=.*//" | sort) \
     <(grep -E "^(OK|NIET OK) " /c/Users/larsh/AppData/Local/Temp/loep-3b/na-taak9.txt | sed -E "s/ paginas=.*//" | sort)
```
Verwacht: precies drie regels wisselen van `NIET OK` naar `OK` (`01_vlak_middelmatig`, `09_gemengde_afdelingen`, `19_vlak_niets_nodig`) en geen enkele regel wisselt de andere kant op. (Sla de uitvoer van de meting in Taak 8 stap 6 daarvoor op als `na-taak8.txt`; heb je dat niet gedaan, draai die meting dan opnieuw op de commit van Taak 8 via een tijdelijke worktree, niet met `git stash`.)

**Haalt een van de drie de regel nog niet, loop dan deze ladder af, één trede per keer, en meet na elke trede opnieuw met dezelfde diff:**

1. *Hele hoofdstuk los zodra er een dun blok in zit.* Vervang in `_verd_los` de body door:
   ```python
       if any(_verdieping_is_dun(deep_agg, fk) for fk in priority_fkeys):
           return set(priority_fkeys)
       return set()
   ```
   en pas de eerste test aan op die uitkomst (`{"workload", "growth", "role_clarity"}`, `{"role_clarity", "workload", "growth"}`, `set()`, `{"workload", "leadership"}`).
2. *Dunne blokken compacter,* zodat ze vaker onder hun voorganger passen. Voeg in de klassenopbouw, direct na het `verd-los`-deel, toe: `+ (" verd-dun" if _verdieping_is_dun(deep_agg, fk) else "")`, en in `backend/report_css.py` onder het `verd-los`-blok dezelfde binnenmaten als `verd-compact` (een eigen klasse, want `test_ook_het_eerste_verdiepingsonderwerp_stroomt` pint dat `verd-compact` alleen bij Loep Start voorkomt):
   ```css
   .verd-dun .slabel { margin-bottom: 10px; }
   .verd-dun .verd-h3 { margin-top: 14px; }
   .verd-dun .item-tbl td { padding: 5px 8px; }
   .verd-dun .card { padding: 10px 0 10px 16px; margin-bottom: 10px; }
   ```
3. *Nog steeds een bevinding:* **stop.** Verander `MIN_FILL` niet en voeg geen uitzondering toe. Leg per falend scenario de paginavulling van het hele verdiepingshoofdstuk vast (pagina, percentage, eerste tekst) in de spec onder "Afwijkingen bij plan 3b" en zet het als open punt in het uitvoeringsverslag onder "Besluit voor Lars".

Wordt een scenario dat OK was NIET OK, draai dan de laatste trede terug; een winst op drie scenario's is geen verlies op een vierde waard.

- [ ] **Stap 8: Leg de uitkomst vast in de spec**

Onder "Afwijkingen bij plan 3b", met de echte gemeten cijfers:

```markdown
- **Dunne verdiepingsblokken (restpunt productie-image):** in WeasyPrint 70.0 stond het verdiepingsblok van een onderwerp zonder verdiepingsdata alleen op een vel (scenario 01, 09, 19: [gemeten percentages voor]). Een dun blok en het blok ervoor mogen nu over een paginagrens lopen (`verd-los`); binnendelen blijven heel. Na de ingreep: [gemeten percentages na], trede [0, 1 of 2] van de ladder. Rapporten zonder dun blok zijn byte-identiek gebleven.
```

Vul de vierkante haken met de gemeten waarden; laat ze niet staan.

- [ ] **Stap 9: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 10: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_report_paginavulling.py docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "fix(rapport): dun verdiepingsblok loopt door op de pagina van zijn voorganger

In het productie-image (WeasyPrint 70) stond een onderwerp zonder
verdiepingsdata alleen op een vel (26 tot 36%). Een dun blok en het blok ervoor
mogen nu over een paginagrens lopen; koppen, kaarten en tabelrijen blijven heel.
Gemeten op alle 21 scenario's en de drie voorbeelden; MIN_FILL ongewijzigd.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 10: Frontend: type, normalisatie en validatie van het besluit (puur)

Eén pure module die de server action (Taak 11) en het blok (Taak 12) delen. Geen Supabase, geen React: alleen de vorm van het besluit, de vertaling van en naar een databaserij en de validatie met klantleesbare meldingen.

Verplicht: onderwerp, wat precies en eigenaar (H11: "een thema is geen actie"). De datum van het vervolgmoment is niet verplicht (het MT weet hem soms nog niet) maar moet, als hij er staat, een echte datum zijn. Een tweede actie zonder tweede onderwerp wordt geweigerd.

**Files:**
- Create: `frontend/lib/dashboard/campaign-decision.ts`
- Test: `frontend/lib/dashboard/campaign-decision.test.ts`

- [ ] **Stap 1: Schrijf de falende test**

`frontend/lib/dashboard/campaign-decision.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  DECISION_LIMITS,
  decisionFromRow,
  decisionToRow,
  normalizeDecisionInput,
  validateDecisionInput,
} from './campaign-decision'

const geldig = {
  decidedAt: '2026-04-02',
  primaryTopic: 'Groeiperspectief',
  primaryAction: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
  owner: 'Sanne de Vries',
  followUpDate: '2026-06-15',
  secondaryTopic: '',
  secondaryAction: '',
  feedbackPlan: '',
  successCriterion: '',
}

describe('besluit van het MT (plan 3b, spec 2026-09-16 par. 7)', () => {
  it('normaliseert: trimt tekst en maakt van een lege datum null', () => {
    const n = normalizeDecisionInput({ ...geldig, owner: '  Sanne de Vries ', followUpDate: '', decidedAt: undefined })
    expect(n.owner).toBe('Sanne de Vries')
    expect(n.followUpDate).toBeNull()
    expect(n.decidedAt).toBeNull()
  })

  it('negeert velden die er niet horen en waarden die geen tekst zijn', () => {
    const n = normalizeDecisionInput({ ...geldig, owner: 42, recordedBy: 'iemand', campaignId: 'x' })
    expect(n.owner).toBe('')
    expect(Object.keys(n).sort()).toEqual(Object.keys(geldig).sort())
  })

  it('keurt een volledig besluit goed', () => {
    expect(validateDecisionInput(normalizeDecisionInput(geldig))).toBeNull()
  })

  it.each([
    ['primaryTopic', 'Vul in over welk onderwerp het besluit gaat.'],
    ['primaryAction', 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'],
    ['owner', 'Vul in wie eigenaar is van dit besluit.'],
  ])('weigert een leeg verplicht veld: %s', (veld, melding) => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, [veld]: '  ' }))).toBe(melding)
  })

  it('weigert een datum die geen datum is, en accepteert een lege', () => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '15-06-2026' }))).toBe(
      'De datum van het vervolgmoment is geen geldige datum.',
    )
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '2026-02-31' }))).toBe(
      'De datum van het vervolgmoment is geen geldige datum.',
    )
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '' }))).toBeNull()
  })

  it('weigert een vervolgmoment voor de datum van het gesprek', () => {
    expect(
      validateDecisionInput(normalizeDecisionInput({ ...geldig, decidedAt: '2026-04-02', followUpDate: '2026-04-01' })),
    ).toBe('Het vervolgmoment ligt voor de datum van het gesprek.')
  })

  it('weigert een tweede actie zonder tweede onderwerp', () => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, secondaryAction: 'Piekrooster herzien.' }))).toBe(
      'Vul bij het tweede punt ook het onderwerp in.',
    )
  })

  it('weigert een veld dat te lang is, met de grens in de melding', () => {
    const lang = 'x'.repeat(DECISION_LIMITS.action + 1)
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryAction: lang }))).toBe(
      `Wat precies is te lang (maximaal ${DECISION_LIMITS.action} tekens).`,
    )
  })

  it('vertaalt naar een databaserij zonder updated_at (de trigger zet die)', () => {
    const rij = decisionToRow(normalizeDecisionInput(geldig), {
      campaignId: 'c-1',
      organizationId: 'o-1',
      userId: 'u-1',
    })
    expect(rij).toEqual({
      campaign_id: 'c-1',
      organization_id: 'o-1',
      recorded_by: 'u-1',
      decided_at: '2026-04-02',
      primary_topic: 'Groeiperspectief',
      primary_action: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
      owner: 'Sanne de Vries',
      follow_up_date: '2026-06-15',
      secondary_topic: '',
      secondary_action: '',
      feedback_plan: '',
      success_criterion: '',
    })
  })

  it('leest een databaserij terug, en geeft null bij geen rij', () => {
    expect(decisionFromRow(null)).toBeNull()
    const d = decisionFromRow({
      decided_at: '2026-04-02',
      primary_topic: 'Groeiperspectief',
      primary_action: 'Actie',
      owner: 'Sanne',
      follow_up_date: null,
      secondary_topic: null,
      secondary_action: '',
      feedback_plan: '',
      success_criterion: '',
      updated_at: '2026-04-03T09:30:00Z',
    })
    expect(d?.primaryTopic).toBe('Groeiperspectief')
    expect(d?.followUpDate).toBeNull()
    expect(d?.secondaryTopic).toBe('')
    expect(d?.updatedAt).toBe('2026-04-03T09:30:00Z')
  })
})
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run (vanuit `.worktrees/rapport-3b/frontend`): `npx vitest run lib/dashboard/campaign-decision.test.ts 2>&1 | tail -8`
Verwacht: FAIL, `Failed to resolve import "./campaign-decision"`.

- [ ] **Stap 3: Schrijf de module**

`frontend/lib/dashboard/campaign-decision.ts`:

```ts
/**
 * Het besluit van het MT bij een meting (plan 3b, spec 2026-09-16 par. 7).
 * Pure module: vorm, normalisatie, validatie en de vertaling van en naar een
 * rij van `campaign_decisions`. Bevat alleen wat het MT zelf invult; er is geen
 * koppeling met antwoorden of respondenten.
 */

export interface CampaignDecisionInput {
  decidedAt: string | null
  primaryTopic: string
  primaryAction: string
  owner: string
  followUpDate: string | null
  secondaryTopic: string
  secondaryAction: string
  feedbackPlan: string
  successCriterion: string
}

export interface CampaignDecision extends CampaignDecisionInput {
  updatedAt: string | null
}

export const DECISION_LIMITS = { topic: 120, owner: 120, action: 600, text: 600 } as const

const TEXT_FIELDS = [
  'primaryTopic',
  'primaryAction',
  'owner',
  'secondaryTopic',
  'secondaryAction',
  'feedbackPlan',
  'successCriterion',
] as const

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function dateOrNull(value: unknown): string | null {
  const trimmed = text(value)
  return trimmed.length > 0 ? trimmed : null
}

/** Alleen de bekende velden, getrimd; een lege datum wordt null. */
export function normalizeDecisionInput(raw: Record<string, unknown>): CampaignDecisionInput {
  return {
    decidedAt: dateOrNull(raw.decidedAt),
    primaryTopic: text(raw.primaryTopic),
    primaryAction: text(raw.primaryAction),
    owner: text(raw.owner),
    followUpDate: dateOrNull(raw.followUpDate),
    secondaryTopic: text(raw.secondaryTopic),
    secondaryAction: text(raw.secondaryAction),
    feedbackPlan: text(raw.feedbackPlan),
    successCriterion: text(raw.successCriterion),
  }
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const FIELD_LABELS: Record<(typeof TEXT_FIELDS)[number], { label: string; max: number }> = {
  primaryTopic: { label: 'Het onderwerp', max: DECISION_LIMITS.topic },
  primaryAction: { label: 'Wat precies', max: DECISION_LIMITS.action },
  owner: { label: 'De eigenaar', max: DECISION_LIMITS.owner },
  secondaryTopic: { label: 'Het tweede onderwerp', max: DECISION_LIMITS.topic },
  secondaryAction: { label: 'Wat precies bij het tweede punt', max: DECISION_LIMITS.action },
  feedbackPlan: { label: 'De terugkoppeling', max: DECISION_LIMITS.text },
  successCriterion: { label: 'Waaraan jullie zien dat het werkt', max: DECISION_LIMITS.text },
}

/** Null als het besluit opgeslagen mag worden, anders één melding voor de klant. */
export function validateDecisionInput(input: CampaignDecisionInput): string | null {
  if (!input.primaryTopic) return 'Vul in over welk onderwerp het besluit gaat.'
  if (!input.primaryAction) return 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'
  if (!input.owner) return 'Vul in wie eigenaar is van dit besluit.'
  if (input.secondaryAction && !input.secondaryTopic) return 'Vul bij het tweede punt ook het onderwerp in.'
  for (const field of TEXT_FIELDS) {
    const { label, max } = FIELD_LABELS[field]
    if (input[field].length > max) return `${label} is te lang (maximaal ${max} tekens).`
  }
  if (input.decidedAt && !isRealDate(input.decidedAt)) return 'De datum van het gesprek is geen geldige datum.'
  if (input.followUpDate && !isRealDate(input.followUpDate)) {
    return 'De datum van het vervolgmoment is geen geldige datum.'
  }
  if (input.decidedAt && input.followUpDate && input.followUpDate < input.decidedAt) {
    return 'Het vervolgmoment ligt voor de datum van het gesprek.'
  }
  return null
}

/** Rij voor de upsert. `updated_at` ontbreekt bewust: de databasetrigger zet die. */
export function decisionToRow(
  input: CampaignDecisionInput,
  ids: { campaignId: string; organizationId: string; userId: string },
): Record<string, string | null> {
  return {
    campaign_id: ids.campaignId,
    organization_id: ids.organizationId,
    recorded_by: ids.userId,
    decided_at: input.decidedAt,
    primary_topic: input.primaryTopic,
    primary_action: input.primaryAction,
    owner: input.owner,
    follow_up_date: input.followUpDate,
    secondary_topic: input.secondaryTopic,
    secondary_action: input.secondaryAction,
    feedback_plan: input.feedbackPlan,
    success_criterion: input.successCriterion,
  }
}

export function decisionFromRow(row: Record<string, unknown> | null | undefined): CampaignDecision | null {
  if (!row) return null
  return {
    decidedAt: dateOrNull(row.decided_at),
    primaryTopic: text(row.primary_topic),
    primaryAction: text(row.primary_action),
    owner: text(row.owner),
    followUpDate: dateOrNull(row.follow_up_date),
    secondaryTopic: text(row.secondary_topic),
    secondaryAction: text(row.secondary_action),
    feedbackPlan: text(row.feedback_plan),
    successCriterion: text(row.success_criterion),
    updatedAt: dateOrNull(row.updated_at),
  }
}
```

De test op "te lang" verwacht `Wat precies is te lang (maximaal 600 tekens).`; dat is `FIELD_LABELS.primaryAction.label` plus de vaste staart.

- [ ] **Stap 4: Draai de test en `tsc`**

Run: `npx vitest run lib/dashboard/campaign-decision.test.ts 2>&1 | tail -5` en `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Verwacht: alle tests `passed`; `133` (geen nieuwe typefouten).

- [ ] **Stap 5: Commit**

```bash
git add frontend/lib/dashboard/campaign-decision.ts frontend/lib/dashboard/campaign-decision.test.ts
git commit -m "feat(dashboard): vorm, normalisatie en validatie van het besluit van het MT

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 11: Frontend: server action `saveCampaignDecisionAction`

Rechten en gate, in deze volgorde: ingelogd en lid van de organisatie (`loadActorContext`), eigenaar of operator (hetzelfde recht als de andere beheeracties: `getCustomerActionPermission(role, 'review_launch')`), geldige invoer, en de meting is gesloten met een rapport (`isReportReleaseReady`, dezelfde gate als de downloadknop). Daarna een upsert op `campaign_id`. **Fail Loud:** elke fout komt als leesbare melding terug; een upsert die nul rijen raakt (RLS filtert stil) is ook een fout. RLS op de tabel is de achtervang, niet de enige controle.

`loadActorContext` staat nu als niet-geëxporteerde helper in `dashboard-actions.ts`. Een `'use server'`-bestand mag alleen async server actions exporteren (een export wordt een aanroepbaar endpoint), dus de helper verhuist naar een gewone module die beide actiebestanden importeren. De bestaande tests mocken `@/lib/supabase/server`; die mock blijft werken omdat de nieuwe module dezelfde import gebruikt.

**Files:**
- Create: `frontend/lib/dashboard/actor-context.ts`
- Modify: `frontend/app/(dashboard)/dashboard/dashboard-actions.ts:30-73` (het type `ActorContext`, `SupabaseClientType` en `loadActorContext` vervangen door een import)
- Create: `frontend/app/(dashboard)/campaigns/[id]/decision-actions.ts`
- Test: `frontend/app/(dashboard)/campaigns/[id]/decision-actions.test.ts`

- [ ] **Stap 1: Verhuis `loadActorContext`**

`frontend/lib/dashboard/actor-context.ts` (de body is ongewijzigd overgenomen uit `dashboard-actions.ts`):

```ts
/**
 * Wie voert deze dashboardactie uit, en voor welke organisatie? Gedeeld door de
 * server actions van het dashboard en van de besluitpagina. Geen 'use server':
 * dit is een helper, geen aanroepbaar endpoint. Alleen importeren vanuit
 * servercode.
 */
import { createClient } from '@/lib/supabase/server'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import type { MemberRole } from '@/lib/types'

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>

export type ActorContext =
  | { ok: false; error: string }
  | {
      ok: true
      supabase: SupabaseClientType
      user: NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']>
      organizationId: string
      isAdmin: boolean
      role: MemberRole | null
      actorRole: CampaignAuditActorRole
    }

export async function loadActorContext(campaignId: string): Promise<ActorContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()
  if (!campaign) return { ok: false, error: 'Campagne niet gevonden of niet toegankelijk.' }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = profile?.is_verisight_admin === true
  const role = (membership?.role ?? null) as MemberRole | null
  const actorRole: CampaignAuditActorRole = isAdmin ? 'verisight_admin' : (role ?? 'unknown')

  return { ok: true, supabase, user, organizationId: campaign.organization_id, isAdmin, role, actorRole }
}
```

In `dashboard-actions.ts`: verwijder `type SupabaseClientType`, `type ActorContext` en de functie `loadActorContext`, en voeg bij de imports toe: `import { loadActorContext } from '@/lib/dashboard/actor-context'`. Verwijder daarna imports die alleen de verhuisde code gebruikte (`createClient`, `CampaignAuditActorRole`, `MemberRole`), maar alleen als `grep -n "createClient\|CampaignAuditActorRole\|MemberRole" "app/(dashboard)/dashboard/dashboard-actions.ts"` geen ander gebruik meer toont.

Controle dat de verhuizing niets brak:

```bash
npx vitest run "app/(dashboard)/dashboard/dashboard-actions.test.ts" "app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts" 2>&1 | tail -6
```
Verwacht: dezelfde uitkomst als op main. Leg die vooraf vast met hetzelfde commando vóór je iets wijzigt; slaagde een test toen en faalt hij nu, dan is de verhuizing fout.

- [ ] **Stap 2: Schrijf de falende test**

`frontend/app/(dashboard)/campaigns/[id]/decision-actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

let user: { id: string } | null = { id: 'user-1' }
let orgMemberRole: string | null = 'owner'
let isAdmin = false
let isActive = false
let campaignError: { message: string } | null = null
let totalCompleted = 18
let statsError: { message: string } | null = null
let upsertRows = 1
let upsertError: { message: string } | null = null
let upserts: Array<{ payload: Record<string, unknown>; options: unknown }> = []

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { organization_id: 'org-1' } }),
              maybeSingle: async () =>
                campaignError ? { data: null, error: campaignError } : { data: { is_active: isActive }, error: null },
            }),
          }),
        }
      }
      if (table === 'profiles') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_verisight_admin: isAdmin } }) }) }) }
      }
      if (table === 'org_members') {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: orgMemberRole ? { role: orgMemberRole } : null }) }) }),
          }),
        }
      }
      if (table === 'campaign_stats') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () =>
                statsError
                  ? { data: null, error: statsError }
                  : { data: { total_completed: totalCompleted, scan_type: 'retention' }, error: null },
            }),
          }),
        }
      }
      if (table === 'campaign_decisions') {
        return {
          upsert: (payload: Record<string, unknown>, options: unknown) => ({
            select: async () => {
              upserts.push({ payload, options })
              if (upsertError) return { data: null, error: upsertError }
              return { data: Array.from({ length: upsertRows }, () => ({ campaign_id: 'campaign-1' })), error: null }
            },
          }),
        }
      }
      throw new Error(`onverwachte tabel in de test: ${table}`)
    },
  }),
}))

import { saveCampaignDecisionAction } from './decision-actions'

const besluit = {
  decidedAt: '2026-04-02',
  primaryTopic: 'Groeiperspectief',
  primaryAction: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
  owner: 'Sanne de Vries',
  followUpDate: '2026-06-15',
}

beforeEach(() => {
  user = { id: 'user-1' }
  orgMemberRole = 'owner'
  isAdmin = false
  isActive = false
  campaignError = null
  totalCompleted = 18
  statsError = null
  upsertRows = 1
  upsertError = null
  upserts = []
})

describe('saveCampaignDecisionAction (plan 3b)', () => {
  it('slaat het besluit op als upsert op campaign_id, met recorded_by', async () => {
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({ ok: true })
    expect(upserts).toHaveLength(1)
    expect(upserts[0].options).toEqual({ onConflict: 'campaign_id' })
    expect(upserts[0].payload).toMatchObject({
      campaign_id: 'campaign-1',
      organization_id: 'org-1',
      recorded_by: 'user-1',
      primary_topic: 'Groeiperspectief',
      owner: 'Sanne de Vries',
      follow_up_date: '2026-06-15',
    })
    expect(upserts[0].payload).not.toHaveProperty('updated_at')
  })

  it('laat de operator schrijven, ook zonder lidmaatschap', async () => {
    isAdmin = true
    orgMemberRole = null
    expect(await saveCampaignDecisionAction('campaign-1', besluit)).toEqual({ ok: true })
  })

  it.each(['member', 'viewer', null])('weigert een meelezer (%s) en schrijft niets', async (role) => {
    orgMemberRole = role
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Alleen de eigenaar van deze Loep-omgeving kan het besluit vastleggen.')
    expect(upserts).toHaveLength(0)
  })

  it('weigert zonder login', async () => {
    user = null
    expect(await saveCampaignDecisionAction('campaign-1', besluit)).toEqual({ ok: false, error: 'Niet ingelogd.' })
  })

  it('geeft de validatiemelding terug en schrijft niets', async () => {
    const result = await saveCampaignDecisionAction('campaign-1', { ...besluit, owner: ' ' })
    expect(result).toEqual({ ok: false, error: 'Vul in wie eigenaar is van dit besluit.' })
    expect(upserts).toHaveLength(0)
  })

  it('weigert op een lopende meting', async () => {
    isActive = true
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.')
    expect(upserts).toHaveLength(0)
  })

  it('weigert onder de rapportdrempel', async () => {
    totalCompleted = 9
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.')
  })

  it('Fail Loud: een mislukte statusquery is geen "onder de drempel"', async () => {
    statsError = { message: 'timeout' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result.error).toBe('Opslaan mislukt: Loep kon niet vaststellen of het rapport klaarstaat (timeout).')
    expect(upserts).toHaveLength(0)
  })

  it('Fail Loud: een databasefout komt als melding terug', async () => {
    upsertError = { message: 'relation "campaign_decisions" does not exist' }
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({
      ok: false,
      error: 'Opslaan mislukt: relation "campaign_decisions" does not exist',
    })
  })

  it('Fail Loud: nul geraakte rijen is geen stil succes', async () => {
    upsertRows = 0
    const result = await saveCampaignDecisionAction('campaign-1', besluit)
    expect(result).toEqual({ ok: false, error: 'Opslaan mislukt: het besluit is niet opgeslagen (geen rechten op deze meting).' })
  })
})
```

- [ ] **Stap 3: Draai de test en zie hem falen**

Run: `npx vitest run "app/(dashboard)/campaigns/[id]/decision-actions.test.ts" 2>&1 | tail -8`
Verwacht: FAIL, `Failed to resolve import "./decision-actions"`.

- [ ] **Stap 4: Schrijf de action**

`frontend/app/(dashboard)/campaigns/[id]/decision-actions.ts`:

```ts
'use server'

/**
 * Het besluit van het MT vastleggen (plan 3b, spec 2026-09-16 par. 7). De enige
 * plek waar de klant na de meting iets in het systeem schrijft. App-level
 * rechten en gate, met RLS op campaign_decisions als achtervang. Fail Loud:
 * elke fout komt als melding terug, nooit een stil succes.
 */

import { loadActorContext } from '@/lib/dashboard/actor-context'
import { getCustomerActionPermission } from '@/lib/customer-permissions'
import { decisionToRow, normalizeDecisionInput, validateDecisionInput } from '@/lib/dashboard/campaign-decision'
import { isReportReleaseReady } from '@/lib/response-activation'
import type { ScanType } from '@/lib/types'

export interface DecisionActionResult {
  ok: boolean
  error?: string
}

const NOT_ALLOWED = 'Alleen de eigenaar van deze Loep-omgeving kan het besluit vastleggen.'
const NOT_READY = 'Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.'

export async function saveCampaignDecisionAction(
  campaignId: string,
  rawInput: Record<string, unknown>,
): Promise<DecisionActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // Zelfde recht als de andere beheeracties: eigenaar of Loep-operator.
  const canManage = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canManage) return { ok: false, error: NOT_ALLOWED }

  const input = normalizeDecisionInput(rawInput)
  const invalid = validateDecisionInput(input)
  if (invalid) return { ok: false, error: invalid }

  // Zelfde gate als de downloadknop: gesloten meting met rapport.
  const [{ data: campaignRow, error: campaignError }, { data: statsRow, error: statsError }] = await Promise.all([
    ctx.supabase.from('campaigns').select('is_active').eq('id', campaignId).maybeSingle(),
    ctx.supabase.from('campaign_stats').select('total_completed, scan_type').eq('campaign_id', campaignId).maybeSingle(),
  ])
  if (campaignError || !campaignRow) {
    return { ok: false, error: `Opslaan mislukt: ${campaignError?.message ?? 'meting niet gevonden of geen rechten'}.` }
  }
  if (statsError) {
    return { ok: false, error: `Opslaan mislukt: Loep kon niet vaststellen of het rapport klaarstaat (${statsError.message}).` }
  }
  const isActive = (campaignRow as { is_active: boolean }).is_active
  const totalCompleted = (statsRow as { total_completed?: number } | null)?.total_completed ?? 0
  const scanType = (statsRow as { scan_type?: ScanType } | null)?.scan_type
  if (isActive || !isReportReleaseReady(totalCompleted, { scanType })) {
    return { ok: false, error: NOT_READY }
  }

  const { data: rows, error } = await ctx.supabase
    .from('campaign_decisions')
    .upsert(decisionToRow(input, { campaignId, organizationId: ctx.organizationId, userId: ctx.user.id }), {
      onConflict: 'campaign_id',
    })
    .select('campaign_id')
  if (error) return { ok: false, error: `Opslaan mislukt: ${error.message}` }
  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Opslaan mislukt: het besluit is niet opgeslagen (geen rechten op deze meting).' }
  }
  return { ok: true }
}
```

- [ ] **Stap 5: Draai de tests en `tsc`**

Run: `npx vitest run "app/(dashboard)/campaigns/[id]/decision-actions.test.ts" "app/(dashboard)/dashboard/dashboard-actions.test.ts" "app/(dashboard)/dashboard/dashboard-actions.lifecycle.test.ts" 2>&1 | tail -8` en `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Verwacht: de nieuwe tests `passed`, de twee bestaande bestanden ongewijzigd ten opzichte van stap 1, `133`.

- [ ] **Stap 6: Commit**

```bash
git add frontend/lib/dashboard/actor-context.ts "frontend/app/(dashboard)/dashboard/dashboard-actions.ts" "frontend/app/(dashboard)/campaigns/[id]/decision-actions.ts" "frontend/app/(dashboard)/campaigns/[id]/decision-actions.test.ts"
git commit -m "feat(dashboard): server action om het besluit van het MT vast te leggen

Eigenaar of operator, alleen op een gesloten meting met rapport, upsert op
campaign_id. Elke fout komt als melding terug; nul geraakte rijen is ook een
fout. loadActorContext verhuist naar een gedeelde module.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 12: Frontend: het blok "Besluit vastleggen" op de campagnedetailpagina

Het blok staat onder de downloadknop, alleen in de staat `report_ready`. Eigenaar en operator krijgen het formulier; meelezers zien het besluit alleen-lezen (of de regel dat er nog geen is). **De besluitquery mag de pagina niet platleggen:** staat de migratie nog niet op productie, dan geeft de query een fout, en een `throw` zou de downloadknop onbereikbaar maken. De fout wordt daarom zichtbaar in het blok getoond (Fail Loud, maar begrensd tot het blok dat faalt).

Componenttests in deze repo zijn source-guards (`readFileSync`), geen DOM-tests; dit plan volgt dat patroon. Het gedrag wordt in Taak 15 in de browser gecontroleerd op de testklant.

**Files:**
- Create: `frontend/components/dashboard/decision-block.tsx`
- Test: `frontend/components/dashboard/decision-block.guard.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx` (imports; de besluitquery na de bestaande `Promise.all`; het blok direct na de `report_ready`-kaart)
- Test: `frontend/app/(dashboard)/campaigns/[id]/page.decision.test.ts`

- [ ] **Stap 1: Schrijf de falende tests**

`frontend/components/dashboard/decision-block.guard.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./decision-block.tsx', import.meta.url), 'utf8')

describe('blok "Besluit vastleggen" (plan 3b, spec 2026-09-16 par. 7)', () => {
  it('heeft dezelfde velden als de besluitpagina in het rapport', () => {
    for (const label of [
      'Datum van het gesprek',
      'Onderwerp',
      'Wat precies',
      'Eigenaar',
      'Datum vervolgmoment',
      'Tweede punt',
      'Terugkoppeling aan medewerkers',
      'Waaraan zien we dat het werkt',
    ]) {
      expect(source).toContain(label)
    }
  })

  it('schrijft alleen via de server action en toont fout en succes zichtbaar', () => {
    expect(source).toContain('saveCampaignDecisionAction')
    expect(source).toContain('role="alert"')
    expect(source).toContain('role="status"')
    expect(source).toContain('router.refresh()')
    expect(source).not.toContain('supabase')
  })

  it('meldt geen succes voordat de action ok teruggeeft', () => {
    const okBranch = source.slice(source.indexOf('if (!result.ok)'))
    expect(okBranch.indexOf('setError(')).toBeLessThan(okBranch.indexOf('setNotice('))
  })

  it('meelezers krijgen geen formulier en geen knop', () => {
    const readOnly = source.slice(source.indexOf('function ReadOnlyDecision'), source.indexOf('export function DecisionBlock'))
    expect(readOnly).not.toContain('<input')
    expect(readOnly).not.toContain('<textarea')
    expect(readOnly).not.toContain('<button')
    expect(source).toContain('Er is nog geen besluit vastgelegd.')
  })

  it('zegt een laadfout hardop in plaats van een leeg formulier te tonen', () => {
    expect(source).toContain('loadError')
    expect(source).toContain('Loep kan het besluit nu niet laden')
  })

  it('veronderstelt geen begeleider en gebruikt geen streepjes', () => {
    expect(source).not.toMatch(/bespreking met Loep|begeleide|tijdens de bespreking/)
    expect(source).not.toMatch(/[\u2014\u2013]/)
  })
})
```

`frontend/app/(dashboard)/campaigns/[id]/page.decision.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campagnedetail: besluit vastleggen (plan 3b)', () => {
  it('toont het blok alleen naast de downloadknop, in de staat report_ready', () => {
    expect(source.match(/<DecisionBlock/g)).toHaveLength(1)
    const before = source.slice(0, source.indexOf('<DecisionBlock'))
    // Direct voor het blok staat de gate, en de downloadknop staat erboven.
    expect(before.slice(-80)).toContain("state.kind === 'report_ready' ? (")
    expect(before).toContain('PdfDownloadButton')
  })

  it('geeft schrijfrecht door als canManage en niet als isAdmin', () => {
    expect(source).toContain('canManage={canManage}')
  })

  it('haalt het besluit alleen op als er een rapport is, en laat een queryfout de pagina niet omvallen', () => {
    expect(source).toContain(".from('campaign_decisions')")
    expect(source).toContain('decisionLoadError')
    const decisionPart = source.slice(source.indexOf(".from('campaign_decisions')"))
    expect(decisionPart.slice(0, 600)).not.toContain('throw new Error')
  })

  it('leest geen individuele antwoorden voor dit blok', () => {
    const decisionPart = source.slice(source.indexOf(".from('campaign_decisions')"), source.indexOf(".from('campaign_decisions')") + 600)
    expect(decisionPart).not.toContain('survey_responses')
  })
})
```

- [ ] **Stap 2: Draai de tests en zie ze falen**

Run: `npx vitest run components/dashboard/decision-block.guard.test.ts "app/(dashboard)/campaigns/[id]/page.decision.test.ts" 2>&1 | tail -8`
Verwacht: FAIL (bestand bestaat niet; geen `<DecisionBlock` in de pagina).

- [ ] **Stap 3: Schrijf het blok**

`frontend/components/dashboard/decision-block.tsx`:

```tsx
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { saveCampaignDecisionAction } from '@/app/(dashboard)/campaigns/[id]/decision-actions'
import { DECISION_LIMITS, type CampaignDecision } from '@/lib/dashboard/campaign-decision'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

/**
 * "Besluit vastleggen" op een gesloten meting met rapport (plan 3b, spec
 * 2026-09-16 par. 7). Dezelfde velden als de besluitpagina in het rapport; wat
 * hier staat drukt het rapport bij de volgende download voor. Eigenaar en
 * operator schrijven, meelezers lezen. Fail Loud: een fout staat in beeld.
 */

interface DecisionBlockProps {
  campaignId: string
  canManage: boolean
  decision: CampaignDecision | null
  loadError: string | null
}

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]'
const inputClass =
  'mt-1 w-full rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:border-[color:var(--dashboard-accent-strong)] focus:outline-none disabled:opacity-50'
const hintClass = 'mt-1 text-xs text-[color:var(--dashboard-muted)]'

function ReadOnlyRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-[color:var(--dashboard-text)]">{value}</dd>
    </div>
  )
}

function ReadOnlyDecision({ decision }: { decision: CampaignDecision | null }) {
  if (!decision) {
    return (
      <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
        Er is nog geen besluit vastgelegd. De eigenaar van deze Loep-omgeving kan dat hier doen.
      </p>
    )
  }
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <ReadOnlyRow label="Datum van het gesprek" value={formatDutchDate(decision.decidedAt)} />
      <ReadOnlyRow label="Onderwerp" value={decision.primaryTopic} />
      <ReadOnlyRow label="Wat precies" value={decision.primaryAction} />
      <ReadOnlyRow label="Eigenaar" value={decision.owner} />
      <ReadOnlyRow label="Datum vervolgmoment" value={formatDutchDate(decision.followUpDate)} />
      <ReadOnlyRow label="Tweede punt" value={decision.secondaryTopic} />
      <ReadOnlyRow label="Wat precies bij het tweede punt" value={decision.secondaryAction} />
      <ReadOnlyRow label="Terugkoppeling aan medewerkers" value={decision.feedbackPlan} />
      <ReadOnlyRow label="Waaraan zien we dat het werkt" value={decision.successCriterion} />
    </dl>
  )
}

export function DecisionBlock({ campaignId, canManage, decision, loadError }: DecisionBlockProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const raw: Record<string, unknown> = {}
    form.forEach((value, key) => {
      raw[key] = typeof value === 'string' ? value : ''
    })
    try {
      const result = await saveCampaignDecisionAction(campaignId, raw)
      if (!result.ok) {
        setError(result.error ?? 'Opslaan mislukt.')
      } else {
        setNotice('Besluit opgeslagen. Bij de volgende download staat het voorgedrukt in je rapport.')
        router.refresh()
      }
    } catch (caught) {
      setError(`Opslaan mislukt: ${caught instanceof Error ? caught.message : 'onbekende fout'}.`)
    } finally {
      setBusy(false)
    }
  }

  const updatedLabel = formatDutchDate(decision?.updatedAt)

  return (
    <section
      aria-labelledby="decision-heading"
      className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6"
    >
      <h3 id="decision-heading" className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">
        Besluit vastleggen
      </h3>
      <p className="mb-5 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">
        Wat heeft het MT besloten na het gesprek over dit rapport? Wat je hier vastlegt, drukt Loep voor op de
        besluitpagina van het rapport.
        {updatedLabel ? ` Laatst bijgewerkt op ${updatedLabel}.` : ''}
      </p>

      {loadError ? (
        <p role="alert" className="text-sm leading-6 text-red-600">
          Loep kan het besluit nu niet laden ({loadError}). Je rapport hierboven werkt wel. Blijft dit zo, mail dan{' '}
          <a className="underline" href={`mailto:${LOEP_CONTACT_EMAIL}`}>
            {LOEP_CONTACT_EMAIL}
          </a>
          .
        </p>
      ) : !canManage ? (
        <ReadOnlyDecision decision={decision} />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Datum van het gesprek
            <input type="date" name="decidedAt" defaultValue={decision?.decidedAt ?? ''} disabled={busy} className={inputClass} />
          </label>
          <label className={labelClass}>
            Onderwerp
            <input
              type="text"
              name="primaryTopic"
              required
              maxLength={DECISION_LIMITS.topic}
              defaultValue={decision?.primaryTopic ?? ''}
              placeholder="Het startpunt uit je rapport (pagina twee)"
              disabled={busy}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Wat precies
            <textarea
              name="primaryAction"
              required
              rows={3}
              maxLength={DECISION_LIMITS.action}
              defaultValue={decision?.primaryAction ?? ''}
              disabled={busy}
              className={inputClass}
            />
            <span className={hintClass}>Een onderwerp is nog geen afspraak: schrijf op wat er gebeurt.</span>
          </label>
          <label className={labelClass}>
            Eigenaar
            <input
              type="text"
              name="owner"
              required
              maxLength={DECISION_LIMITS.owner}
              defaultValue={decision?.owner ?? ''}
              disabled={busy}
              className={inputClass}
            />
            <span className={hintClass}>Eén naam.</span>
          </label>
          <label className={labelClass}>
            Datum vervolgmoment
            <input type="date" name="followUpDate" defaultValue={decision?.followUpDate ?? ''} disabled={busy} className={inputClass} />
            <span className={hintClass}>Kies een datum, geen termijn. Richtlijn: 45 tot 90 dagen na het gesprek.</span>
          </label>
          <label className={labelClass}>
            Tweede punt
            <input
              type="text"
              name="secondaryTopic"
              maxLength={DECISION_LIMITS.topic}
              defaultValue={decision?.secondaryTopic ?? ''}
              disabled={busy}
              className={inputClass}
            />
            <span className={hintClass}>Alleen als jullie er een kiezen.</span>
          </label>
          <label className={labelClass}>
            Wat precies bij het tweede punt
            <textarea
              name="secondaryAction"
              rows={2}
              maxLength={DECISION_LIMITS.action}
              defaultValue={decision?.secondaryAction ?? ''}
              disabled={busy}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Terugkoppeling aan medewerkers
            <textarea
              name="feedbackPlan"
              rows={2}
              maxLength={DECISION_LIMITS.text}
              defaultValue={decision?.feedbackPlan ?? ''}
              placeholder="Wie vertelt wat, en wanneer?"
              disabled={busy}
              className={inputClass}
            />
            <span className={hintClass}>Je mensen vulden in; ze horen wat het MT ermee doet.</span>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Waaraan zien we dat het werkt
            <input
              type="text"
              name="successCriterion"
              maxLength={DECISION_LIMITS.text}
              defaultValue={decision?.successCriterion ?? ''}
              disabled={busy}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50"
            >
              {busy ? 'Opslaan...' : decision ? 'Besluit bijwerken' : 'Besluit opslaan'}
            </button>
            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="text-sm text-[color:var(--dashboard-muted)]">
                {notice}
              </p>
            ) : null}
          </div>
        </form>
      )}
    </section>
  )
}
```

- [ ] **Stap 4: Hang het blok in de pagina**

In `frontend/app/(dashboard)/campaigns/[id]/page.tsx`. Imports:

```tsx
import { DecisionBlock } from '@/components/dashboard/decision-block'
import { decisionFromRow } from '@/lib/dashboard/campaign-decision'
```

Direct na de toekenning `const pageState = withoutSelfLink(state, ...)`:

```tsx
  // Besluit van het MT (plan 3b): alleen op een gesloten meting met rapport.
  // Bewust geen throw: ontbreekt de tabel (migratie nog niet gedraaid) of faalt
  // de query, dan blijft de downloadknop bereikbaar en zegt het blok zelf wat
  // er mis is.
  let decisionRow: Record<string, unknown> | null = null
  let decisionLoadError: string | null = null
  if (state.kind === 'report_ready') {
    const { data, error } = await supabase
      .from('campaign_decisions')
      .select(
        'decided_at, primary_topic, primary_action, owner, follow_up_date, secondary_topic, secondary_action, feedback_plan, success_criterion, updated_at',
      )
      .eq('campaign_id', id)
      .maybeSingle()
    if (error) decisionLoadError = error.message
    else decisionRow = (data as Record<string, unknown> | null) ?? null
  }
```

In de JSX, direct na het sluitende `) : null}` van het blok `{state.kind === 'report_ready' ? ( ... PdfDownloadButton ... ) : null}`:

```tsx
      {state.kind === 'report_ready' ? (
        <DecisionBlock
          campaignId={stats.campaign_id}
          canManage={canManage}
          decision={decisionFromRow(decisionRow)}
          loadError={decisionLoadError}
        />
      ) : null}
```

`recorded_by` wordt bewust niet geselecteerd: een gebruikers-id heeft in de UI niets te zoeken.

- [ ] **Stap 5: Draai de tests, `tsc` en de build**

```bash
npx vitest run components/dashboard/decision-block.guard.test.ts "app/(dashboard)/campaigns/[id]/page.decision.test.ts" "app/(dashboard)/campaigns/[id]/page.report-access.test.ts" 2>&1 | tail -8
npx tsc --noEmit 2>&1 | grep -c "error TS"
RESEND_API_KEY=re_dummy_build_only npm run build 2>&1 | tail -5
```
Verwacht: alle drie de testbestanden `passed` (de bestaande `page.report-access.test.ts` eist dat er na `state.kind === 'report_ready'` geen `isAdmin` staat: het blok krijgt `canManage`, niet `isAdmin`); `133`; de build eindigt zonder fout.

- [ ] **Stap 6: Commit**

```bash
git add frontend/components/dashboard/decision-block.tsx frontend/components/dashboard/decision-block.guard.test.ts "frontend/app/(dashboard)/campaigns/[id]/page.tsx" "frontend/app/(dashboard)/campaigns/[id]/page.decision.test.ts"
git commit -m "feat(dashboard): blok 'Besluit vastleggen' op een gesloten meting met rapport

Formulier voor eigenaar en operator, alleen-lezen voor meelezers. Een fout bij
het laden staat in het blok zelf en legt de downloadknop niet plat.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 13 (GATE): `WORK_QUESTIONS` en de verdeeld-zinnen vullen uit het goedgekeurde conceptdocument

> **STOP. Begin hier pas als Lars het conceptdocument heeft goedgekeurd.** Bovenaan `docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md` moet een regel staan die begint met `Status: akkoord`. Staat daar nog `Status: concept`, of staat er geen akkoordregel: **stop en meld het.** Verzin geen vraagteksten, neem de conceptteksten niet op eigen gezag over, en bouw dan wel gewoon door aan de taken die niet van deze gate afhangen (0 t/m 12).
>
> Onder de gate vallen: de 72 vertaalvragen (36 routes × Behoud en Vertrek) en de verdeeld-zinnen (`divided` voor Behoud, `divided` voor Vertrek in de verleden tijd, `split_none` voor beide). Dat zijn allemaal teksten uit het conceptdocument, geen constanten die je zelf formuleert.

Het conceptdocument zegt: "Review per rij: zet er 'akkoord' achter of herschrijf de vraag. Een rij zonder opmerking geldt als niet beoordeeld." En sectie 4 en 5 bevatten besluiten die meer dan één rij raken (alternatieven per route, het Vertrek-patroon "wie had moeten", de varianten). Neem steeds de tekst zoals Lars hem heeft achtergelaten.

**Files:**
- Modify: `backend/products/shared/deepening.py` (`WORK_QUESTIONS`, `WORK_QUESTION_VARIANTS`)
- Test: `tests/test_work_questions_content.py` (nieuw)

- [ ] **Stap 1: Controleer de gate**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
grep -n "^Status:" docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md
```
Verwacht: één regel die met `Status: akkoord` begint. Anders: **stop en meld het.** Staat het goedgekeurde document alleen in de hoofdmap (untracked of nieuwer), kopieer het dan eerst naar de worktree.

- [ ] **Stap 2: Controleer dat elke rij beoordeeld is**

Lees sectie 2 en 3 van het document volledig. Elke rij moet óf het woord "akkoord" dragen óf een herschreven vraag. Maak een lijst van rijen zonder opmerking. Is die lijst niet leeg: **stop en meld welke rijen (routesleutel en scan) nog niet beoordeeld zijn.** Lees daarna sectie 4 (twijfels) en sectie 5 (afwijkingen) en noteer per punt wat Lars besloot; een gekozen alternatief vervangt de tekst in de tabel.

- [ ] **Stap 3: Schrijf de guardtest (faalt eerst: de set is nog leeg)**

`tests/test_work_questions_content.py`:

```python
"""Guard op de gated content van plan 3b: de 72 vertaalvragen en de verdeeld-zinnen.

Bron: docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md, goedgekeurd
door Lars. Deze tests bewaken de vorm, niet de inhoud: volledigheid tegenover
DIRECTION_SETS, geen streepjes, Vertrek in de verleden tijd, geen dubbele vragen.
Dat vijf routeparen inhoudelijk overlappen (o.a. ldd_mandate/rcd_mandate) is
een eigenschap van de routesets en wordt hier bewust niet getest.
"""
import re

from backend.products.shared.deepening import (
    DIRECTION_SETS,
    WORK_QUESTION_VARIANTS,
    WORK_QUESTIONS,
    work_question,
    work_questions_ready,
)
from backend.report_html import _FACTOR_EXIT_LABEL, _FACTOR_RETENTION_LABEL

SCANS = ("retention", "exit")


def _routes(factor_key: str) -> set[str]:
    return {o["key"] for o in DIRECTION_SETS[factor_key]["options"] if o["imperative"]}


def _alle_vragen() -> list[tuple[str, str, str, str]]:
    return [(fk, rk, scan, tekst)
            for fk, routes in WORK_QUESTIONS.items()
            for rk, per_scan in routes.items()
            for scan, tekst in per_scan.items()]


def test_de_set_is_gevuld():
    """Een lege set betekent: het rapport toont geen enkele vertaalvraag. Dat is
    alleen voor de reviewgate toegestaan."""
    assert work_questions_ready()
    assert len(_alle_vragen()) == 72


def test_elke_inhoudelijke_route_heeft_precies_een_vraag_per_scan_en_omgekeerd():
    assert set(WORK_QUESTIONS) == set(DIRECTION_SETS)
    for fk in DIRECTION_SETS:
        assert set(WORK_QUESTIONS[fk]) == _routes(fk), fk
        assert len(_routes(fk)) == 6, fk
        for rk, per_scan in WORK_QUESTIONS[fk].items():
            assert set(per_scan) == set(SCANS), (fk, rk)


def test_niets_en_anders_hebben_geen_vraag():
    for fk, routes in WORK_QUESTIONS.items():
        for rk in routes:
            assert not rk.endswith(("_none", "_other")), (fk, rk)


def test_elke_vraag_is_een_vraag_zonder_streepjes_en_zonder_reviewresten():
    for fk, rk, scan, tekst in _alle_vragen():
        waar = (fk, rk, scan)
        assert tekst == tekst.strip() and tekst.endswith("?"), waar
        assert "\u2014" not in tekst and "\u2013" not in tekst, waar
        assert "akkoord" not in tekst.lower(), waar
        assert "  " not in tekst and "|" not in tekst, waar


def test_vertrek_staat_niet_in_de_tegenwoordige_tijd_vorm():
    for fk, rk, scan, tekst in _alle_vragen():
        if scan == "exit":
            assert "Wat is bij jullie" not in tekst, (fk, rk)


def test_geen_twee_vragen_zijn_identiek():
    teksten = [t for _fk, _rk, _scan, t in _alle_vragen()]
    dubbel = sorted({t for t in teksten if teksten.count(t) > 1})
    assert dubbel == []


def test_vragen_noemen_het_onderwerp_niet_bij_naam():
    """Spec, respondentvraag en rapportlabels gebruiken drie verschillende namen;
    het blok eromheen levert de naam via _fl."""
    labels = {l.lower() for l in list(_FACTOR_EXIT_LABEL.values()) + list(_FACTOR_RETENTION_LABEL.values())}
    for fk, rk, scan, tekst in _alle_vragen():
        for label in labels:
            assert label not in tekst.lower(), (fk, rk, scan, label)


def test_vragen_spreken_het_mt_aan_en_niet_loep():
    for fk, rk, scan, tekst in _alle_vragen():
        assert not re.search(r"\b(ik|wij|loep)\b", tekst.lower()), (fk, rk, scan)


def test_verdeeld_zinnen_zijn_compleet_en_citeren_de_routeteksten():
    assert set(WORK_QUESTION_VARIANTS) == {"divided", "split_none"}
    for soort, per_scan in WORK_QUESTION_VARIANTS.items():
        assert set(per_scan) == set(SCANS), soort
        for scan, tekst in per_scan.items():
            waar = (soort, scan)
            assert tekst.endswith("?"), waar
            assert "\u2014" not in tekst and "\u2013" not in tekst, waar
            # Tien van de 36 routeteksten staan in de ik-vorm: altijd citeren.
            assert "‘{a}’" in tekst, waar
            assert ("‘{b}’" in tekst) is (soort == "divided"), waar
    # Vertrek: de mensen zijn weg, dus niet "zijn verdeeld".
    assert "zijn verdeeld" not in WORK_QUESTION_VARIANTS["divided"]["exit"]


def test_ophaalfunctie_levert_voor_elke_route_en_scan_de_juiste_tekst():
    for fk in DIRECTION_SETS:
        for rk in _routes(fk):
            for scan in SCANS:
                assert work_question(scan, fk, rk) == WORK_QUESTIONS[fk][rk][scan]
```

Run: `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_work_questions_content.py -q -p no:cacheprovider`
Verwacht: FAIL op `test_de_set_is_gevuld` (en de tests die erop leunen).

- [ ] **Stap 4: Haal de goedgekeurde teksten uit het document**

Dit hulpscript leest de tabellen van sectie 2 en 3 en print een Python-dict. Het is een overtikhulp, geen bron van waarheid: **lees de uitvoer rij voor rij na tegen het document**, haal reviewresten ("akkoord", doorhalingen) uit de cellen en verwerk de besluiten uit sectie 4 en 5 met de hand.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe - <<'PYEOF'
import re
from pathlib import Path

doc = Path("docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md").read_text(encoding="utf-8")
scan = None
factor = None
out: dict = {}
for regel in doc.splitlines():
    if regel.startswith("## 2."):
        scan = "retention"
    elif regel.startswith("## 3."):
        scan = "exit"
    elif regel.startswith("## ") and not regel.startswith(("## 2.", "## 3.")):
        scan = None
    kop = re.match(r"^### .*\(`([a-z_]+)`\)", regel)
    if kop:
        factor = kop.group(1)
    rij = re.match(r"^\| `([a-z_]+)` \|(.+)\|\s*$", regel)
    if scan and factor and rij:
        cellen = [c.strip() for c in rij.group(2).split("|")]
        out.setdefault(factor, {}).setdefault(rij.group(1), {})[scan] = cellen[-1]
for fk, routes in out.items():
    print(f'    "{fk}": {{')
    for rk, per_scan in routes.items():
        print(f'        "{rk}": {{')
        for s in ("retention", "exit"):
            print(f'            "{s}": {per_scan.get(s, "ONTBREEKT")!r},')
        print("        },")
    print("    },")
print(sum(len(v) for r in out.values() for v in r.values()), "teksten")
PYEOF
```
Verwacht: 6 onderwerpen, per onderwerp 6 routes, slotregel `72 teksten`, nergens `ONTBREEKT`. Heeft de goedgekeurde versie een extra kolom (bijvoorbeeld een reviewkolom), dan is `cellen[-1]` niet de vraag; pas de index aan en controleer opnieuw.

- [ ] **Stap 5: Vul de twee dicts**

Vervang in `backend/products/shared/deepening.py` de lege toekenningen `WORK_QUESTIONS: ... = {}` en `WORK_QUESTION_VARIANTS: ... = {}` door de gevulde versies. `WORK_QUESTIONS` krijgt de nagelezen uitvoer van stap 4 tussen de accolades, in de volgorde van `DEEPENING_FACTOR_KEYS`. `WORK_QUESTION_VARIANTS` krijgt de vier zinnen uit de goedgekeurde sectie 5 van het document (punt 3: `split_none`; punt 6: `divided` voor Vertrek; de `divided`-zin voor Behoud staat bovenaan het document), met de plaatshouders `‘{a}’` en `‘{b}’` op de plek van [A] en [B]:

```python
WORK_QUESTION_VARIANTS: dict[str, dict[str, str]] = {
    "divided": {
        "retention": "<de goedgekeurde verdeeld-zin voor Behoud, met ‘{a}’ en ‘{b}’>",
        "exit": "<de goedgekeurde verdeeld-zin voor Vertrek in de verleden tijd, met ‘{a}’ en ‘{b}’>",
    },
    "split_none": {
        "retention": "<de goedgekeurde split_none-zin voor Behoud, met ‘{a}’>",
        "exit": "<de goedgekeurde split_none-zin voor Vertrek, met ‘{a}’>",
    },
}
```

De vier teksten tussen punthaken zijn geen placeholders van dit plan maar de plek waar de goedgekeurde tekst van Lars komt; dit plan mag ze niet formuleren. Heeft Lars voor `split_none` geen aparte Vertrek-zin goedgekeurd, **stop en meld het** in plaats van de Behoud-zin te hergebruiken.

Werk het commentaar boven `WORK_QUESTIONS` bij: de zin "Tot dan zijn beide dicts leeg ..." wordt "Gevuld op [datum] uit de door Lars goedgekeurde versie van het conceptdocument (commit [sha van het document])."

- [ ] **Stap 6: Heeft Lars anders besloten over `plurality` of de andere staten?**

Taak 4 bouwde de aannames: `plurality` krijgt de route-eigen vraag; `divided` zonder twee inhoudelijke routes, `none_needed` en `too_few` krijgen geen vraag. Staat in het goedgekeurde document een ander besluit (sectie 5, punten 4, 5 en 8), pas dan `translation_question` en de tests in `tests/test_work_questions_logic.py` in lockstep aan en noteer het in de spec onder "Afwijkingen bij plan 3b". Geen ander besluit: niets doen.

- [ ] **Stap 7: Draai de tests**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_work_questions_content.py tests/test_work_questions_logic.py tests/test_report_werkvragen.py tests/test_report_besluitpagina.py tests/test_direction_report_block.py -q -p no:cacheprovider
```
Verwacht: alles `passed`. `tests/test_report_werkvragen.py::test_blok_rendert_met_de_echte_content_zonder_fout` rendert nu met de echte vragen.

- [ ] **Stap 8: Generieke-zin-test met de hand**

Lees de 72 vragen in de code nog één keer achter elkaar. Een vraag die ongewijzigd onder een andere route zou passen is een bevinding voor Lars (meld hem in het verslag), geen reden om de tekst zelf te wijzigen.

- [ ] **Stap 9: Faalset-commando (Taak 0)**. Verwacht: `GEEN_REGRESSIES`.

- [ ] **Stap 10: Commit**

```bash
git add backend/products/shared/deepening.py tests/test_work_questions_content.py docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "feat(werkvragen): 72 vertaalvragen en de verdeeld-zinnen uit het goedgekeurde concept

Content door Lars goedgekeurd in 2026-09-19-vertaalvragen-concept.md. Guardtest:
elke inhoudelijke route precies een vraag per scan en omgekeerd, geen streepjes,
Vertrek niet in de tegenwoordige-tijd-vorm, geen identieke vragen.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 14 (WACHTSTAP): Lars draait de migratie op productie

De browsercheck in Taak 15 schrijft een besluit naar de productiedatabase van de testklant (de lokale frontend praat met productie-Supabase). Zonder de tabel faalt dat, en terecht. **Deze stap voert de agent niet uit; de agent wacht op de bevestiging van Lars.**

- [ ] **Stap 1: Geef Lars de SQL**

De SQL is de volledige inhoud van `migrations/2026_09_19_add_campaign_decisions.sql` (Taak 1). Print hem zodat hij te kopiëren is:

```bash
cat /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b/migrations/2026_09_19_add_campaign_decisions.sql
```

Instructie voor Lars: Supabase Dashboard, SQL Editor, plakken, Run. De migratie is additief en idempotent: opnieuw draaien verandert niets, en de live backend (nog zonder plan 3b) merkt er niets van.

- [ ] **Stap 2: Laat Lars deze controlequery draaien en de uitkomst teruggeven**

```sql
select
  to_regclass('public.campaign_decisions') is not null as tabel_bestaat,
  (select relrowsecurity from pg_class where oid = 'public.campaign_decisions'::regclass) as rls_aan,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'campaign_decisions') as policies,
  exists (select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'campaigns'
            and column_name = 'previous_campaign_id') as kolom_bestaat;
```
Verwacht: `true | true | 3 | true`. Wijkt één waarde af: niet doorgaan met de browsercheck; meld de uitkomst.

- [ ] **Stap 3: Leg de bevestiging vast**

Noteer in het uitvoeringsverslag (Taak 15) de datum waarop Lars de migratie draaide en de vier waarden van de controlequery. Zonder die bevestiging blijft de browsercheck in het verslag staan als "niet uitgevoerd: migratie nog niet gedraaid", en is de branch niet klaar voor merge.

**Volgorde na de merge (voor het verslag):** de migratie staat er dan al; daarna Railway-redeploy (backend leest de tabel), Vercel deployt de frontend vanzelf bij de push.

---

## Taak 15: Eindverificatie: 21 scenario's en 3 voorbeelden in het productie-image, matrix "Na plan 3b", leesronde light, browsercheck, faalsets, verslag

**Begin hier pas als Taak 13 (content) klaar is.** Stap 8 (browsercheck) vraagt bovendien de bevestiging uit Taak 14. Zonder Taak 13 zou je voorbeeldrapporten zonder vertaalvragen publiceren.

**Files:**
- Modify: `docs/rapport-stresstest-2026-09-10.md` (nieuwe sectie "Na plan 3b", vóór "## Reproduceren")
- Modify: `docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.{html,pdf}`, `frontend/public/examples/` idem
- Create: `docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md`
- Create (tijdelijk, gitignored map): `docs/stresstest/90_besluit_voorgedrukt.html`

- [ ] **Stap 1: Controleer de voorwaarden**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe
$PY -m pytest tests/test_work_questions_content.py -q -p no:cacheprovider
```
Verwacht: alles `passed`. Bestaat het bestand niet of faalt `test_de_set_is_gevuld`: stop, Taak 13 is niet gedaan.

- [ ] **Stap 2: Genereer alles opnieuw**

```bash
$PY scripts/stresstest_report.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
```
Verwacht: 21 regels `[nn] ...` zonder traceback; drie keer "Rapport opgeslagen (HTML)" met paden in `docs/examples/` en `frontend/public/examples/`. De generator gebruikt een wegwerp-SQLite zodra `DATABASE_URL` geen SQLite is (`_build_demo_session_factory`); hij raakt productie niet.

- [ ] **Stap 3: Eén wegwerp-render met een voorgedrukt besluit**

Geen enkel scenario en geen voorbeeld heeft een vastgelegd besluit (de lege, invulbare pagina is wat een klant bij de eerste download ziet). De voorgedrukte staat is unit-getest; bekijk hem één keer op een echte PDF:

```bash
$PY - <<'PYEOF'
from datetime import date, datetime, timezone
from pathlib import Path

from backend.report_html import render_retention_report_html
from tests.test_report_degraded_page_two import _fixture

d = _fixture("retention", n=25, profile=True)
d["decision"] = {
    "decided_at": date(2026, 4, 2), "primary_topic": "Werkdruk en herstelruimte",
    "primary_action": "Elke teamleider maakt voor 1 mei met het team een lijst van werk dat kan wachten.",
    "owner": "Sanne de Vries", "follow_up_date": date(2026, 6, 15),
    "secondary_topic": "", "secondary_action": "",
    "feedback_plan": "HR vertelt het besluit in het teamoverleg van 14 april.",
    "success_criterion": "Elk team heeft de lijst en gebruikt hem in het weekoverleg.",
    "updated_at": datetime(2026, 4, 3, 9, 30, tzinfo=timezone.utc),
}
d["decision_unavailable"] = False
Path("docs/stresstest/90_besluit_voorgedrukt.html").write_text(render_retention_report_html(d), encoding="utf-8")
print("geschreven")
PYEOF
```

- [ ] **Stap 4: Render alles in het productie-image**

Volg het vaste recept ("PDF's renderen in het productie-image") zonder selectie; bewaar de uitvoer als `/c/Users/larsh/AppData/Local/Temp/loep-3b/eind.txt`.

Verwacht: 25 bestanden (21 scenario's, de wegwerp-render `90_...`, 3 voorbeelden), elk `warnings=0 emdash=0 check=OK`, slotregel `TOTAAL 25 bestanden, 0 met bevindingen`. De enige toegestane uitzondering is een open punt dat Taak 9 stap 7 trede 3 al heeft vastgelegd; elke andere bevinding is een blokkade: los hem op in de taak waar hij vandaan komt, met een eigen commit, en draai deze stap opnieuw.

Controleer daarna met de hand, in dezelfde container of lokaal met PyMuPDF:

```bash
$PY - <<'PYEOF'
import glob
import pymupdf
for pad in sorted(glob.glob("C:/Users/larsh/AppData/Local/Temp/loep-3b/out/*.pdf")):
    doc = pymupdf.open(pad)
    besluit = [i + 1 for i in range(doc.page_count) if "BESLUIT VAN HET MT" in doc[i].get_text().upper()[:200]]
    p2 = " ".join(doc[1].get_text().split())
    print(pad.split("/")[-1], doc.page_count, "pag.", "besluitpagina:", besluit,
          "| verwijzingen op p.02:", p2.count("pagina "))
PYEOF
```
Verwacht: elk rapport heeft precies één besluitpagina; op pagina twee staan bij een rapport met leidraad minstens zes "pagina "-verwijzingen (rij 5 levert er nu twee). In `90_besluit_voorgedrukt.pdf` staat op de besluitpagina "Vastgelegd in het dashboard, laatst bijgewerkt op 3 april 2026." en "Sanne de Vries".

- [ ] **Stap 5: Zet de drie voorbeeld-PDF's op hun plek**

```bash
OUT=/c/Users/larsh/AppData/Local/Temp/loep-3b/out
for naam in voorbeeldrapport_loep voorbeeldrapport_retentiescan voorbeeldrapport_onboarding; do
  cp "$OUT/$naam.pdf" "docs/examples/$naam.pdf" && cp "$OUT/$naam.pdf" "frontend/public/examples/$naam.pdf"
done
rm -f docs/stresstest/90_besluit_voorgedrukt.html
```

- [ ] **Stap 6: Matrix "Na plan 3b" in `docs/rapport-stresstest-2026-09-10.md`**

Voeg vóór `## Reproduceren` een sectie `## Na plan 3b (datum)` toe, in dezelfde vorm als "Na plan 3a": branch en scope, de volledige matrix (21 scenario's × Q1 t/m Q6), wat er per bevinding veranderde, welke kruisjes en tildes blijven staan en waarom, en de verificatie. **Q3 ("wat moet er gebeuren") is de hoofdmaat**; de stand op main is 10✓/10~/1✗.

Beoordeel elk scenario opnieuw door de gespreksagenda en de besluitpagina van de gerenderde PDF te lezen, niet door de code te lezen. Scoreregel voor Q3:

| Score | Wanneer |
|---|---|
| ✓ | Het rapport brengt het MT van keuze naar besluit: per gesprekspunt een herkenningsvraag met echte data of een eerlijke terugval, een vertaalvraag óf een staat waarin er terecht geen hoort (`none_needed`, `too_few`, `divided` zonder twee routes) met een besluitvraag die daarbij past, en een besluitpagina die het startpunt voordrukt |
| ~ | Het blok staat er, maar iets erin helpt het MT niet verder: een terugvalvraag waar data had kunnen staan, een vertaalvraag die niet bij de getoonde richting past, of een besluitpagina zonder startpunt. Bij Loep Start (scenario 20): geen werkvragen, wel een besluitpagina |
| ✗ | Geen brug naar een besluit, of een vraag die iets beweert wat de data niet draagt |

Neem per scenario het letterlijke citaat van de drie werkvragen van het startpunt op (zoals ronde 2 dat deed met de openingszin van pagina twee), zodat elke score te herleiden is. Scoor Q1, Q2, Q4, Q5 en Q6 opnieuw; een cel die slechter wordt dan "Na plan 3a" is een regressie en een blokkade. Let bij Q5 (tegenspraak) op de combinatie herkenningsvraag en verdiepingspagina (zelfde toelichting, zelfde telling, zelfde noemer) en bij Q6 (overclaim) op "zo laag", op een vertaalvraag bij een staat zonder meerderheid, en op de voetregel van de besluitpagina.

- [ ] **Stap 7: Koude leesronde light tegen gat B3**

Geef een verse subagent (geen context van dit plan) de gerenderde `voorbeeldrapport_retentiescan.pdf` en deze opdracht:

> Je bent HR-manager bij een organisatie van 150 mensen. Je hebt dit rapport vanochtend gekregen en leidt morgen zonder hulp van buiten een MT-vergadering van 45 minuten. Lees het rapport zoals het er ligt; je kent het product niet. Beantwoord, met paginanummer en letterlijk citaat: (1) Weet je na de gespreksagenda hoe je het MT van "dit kozen onze mensen" naar "dit gaan wij doen" brengt? Welke vraag stel je letterlijk? (2) Bij het tweede punt: staat wat je mensen als toelichting kozen op dezelfde plek als wat ze als richting kozen, en kun je die twee zelf met elkaar verbinden? (3) Waar leg je het besluit vast, wat vul je in, en wat ontbreekt er op dat vel? (4) Staat ergens wat je je medewerkers terugkoppelt? (5) Veronderstelt het rapport ergens dat er iemand van Loep bij het gesprek zit? Sluit af met: gat B3 (geen brug van keuze naar besluit) dicht of open, en de drie dingen die je het meest hinderen.

Neem het oordeel over in het verslag, met de citaten. "Open" op B3 is een blokkade voor de merge (niet voor dit verslag): meld het bij Lars met het citaat.

- [ ] **Stap 8: Browsercheck van het blok "Besluit vastleggen" op de vaste testklant**

Voorwaarde: de bevestiging uit Taak 14. Lees eerst `docs/testklant.md`.

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
$PY scripts/seed_test_tenant.py --dry-run
python scripts/seed_test_tenant.py --reset          # systeem-Python: het venv mist httpx
cp /c/Users/larsh/Desktop/Business/Verisight/frontend/.env.local frontend/.env.local
git status --short frontend/.env.local            # moet leeg zijn: het bestand is gitignored
cd frontend && npm run dev                          # poort 3000; laat draaien
python ../scripts/seed_test_tenant.py --login-link # in een tweede shell, vanuit de worktree-root
```

**Inloggegevens en de login-link komen nooit in een commit, een logregel, het verslag of een screenshot; e-mailadressen in screenshots maskeer je.** De login-link is eenmalig: open hem direct in de browser (vervang de host door `http://localhost:3000` als de link naar productie wijst).

Controleer op campagne A (`/campaigns/12b958fb-ce46-5efa-a947-d5b6e1e09126`, gesloten met rapport):

1. Onder "Je rapport staat klaar" staat het blok "Besluit vastleggen" met een leeg formulier.
2. Opslaan zonder eigenaar geeft de melding "Vul in wie eigenaar is van dit besluit." en slaat niets op.
3. Een volledig besluit opslaan geeft "Besluit opgeslagen. ..."; na een harde refresh staan de waarden in het formulier en staat er "Laatst bijgewerkt op ...".
4. Nogmaals opslaan met een gewijzigde eigenaar werkt (upsert, geen tweede rij).
5. Op campagne B (lopend, `/campaigns/cf39a128-7184-553d-b844-1bd516826f3f`) en campagne C (in te richten) staat het blok **niet**.
6. Op 375 px breed staat het formulier in één kolom zonder horizontaal scrollen; de console is schoon.

Wat deze check niet dekt, en waarom: (a) de alleen-lezen weergave voor een meelezer, want de testklant heeft alleen eigenaars (gedekt door `decision-block.guard.test.ts`); (b) het voorgedrukte besluit in een gedownloade PDF, want de downloadknop haalt het rapport bij de live backend en die draait nog zonder plan 3b (gedekt door stap 3 en 4). Zet beide zo in het verslag.

Ruim op: stop de dev-server, `rm frontend/.env.local`, en draai `python scripts/seed_test_tenant.py --reset` opnieuw zodat het testbesluit verdwijnt (de rij hangt met `on delete cascade` aan de campagne).

- [ ] **Stap 9: Guards en faalsets**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
$PY -m pytest tests/test_python311_syntax_guard.py -q -p no:cacheprovider
$PY -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > /c/Users/larsh/AppData/Local/Temp/loep-3b/na.txt; diff docs/superpowers/plans/plan3b-baseline-failset.txt /c/Users/larsh/AppData/Local/Temp/loep-3b/na.txt && echo GEEN_REGRESSIES
cd frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=/c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-na.json >/dev/null 2>&1
node -e "const r=require('/c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-na.json');const f=[];for(const s of r.testResults)for(const t of s.assertionResults)if(t.status==='failed')f.push(s.name.replace(/\\\\/g,'/').split('/frontend/')[1]+' > '+t.fullName);console.log(f.sort().join('\n'))" > /c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-na-fails.txt
diff /c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-baseline-fails.txt /c/Users/larsh/AppData/Local/Temp/loep-3b/vitest-na-fails.txt && echo GEEN_FRONTEND_REGRESSIES
RESEND_API_KEY=re_dummy_build_only npm run build 2>&1 | tail -3
```
Verwacht: guard groen; `GEEN_REGRESSIES`; `133`; `GEEN_FRONTEND_REGRESSIES` (een regel met `>` in de diff is een nieuwe falende test en een blokkade; wisselvalligheid van `beheer/health/page.test.ts` los je op door opnieuw te draaien en namen te vergelijken); de build slaagt.

- [ ] **Stap 10: Schrijf het uitvoeringsverslag**

`docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md`, in dezelfde vorm als `docs/superpowers/plans/2026-09-16-rapport-3a-uitvoering.md`, met deze koppen: **Baselines** (tabel voor/na: backend failed/passed/skipped, faalset, 3.11-guard, tsc, vitest, nieuwe tests), **Matrix** (Q1 t/m Q6, "Na plan 3a" tegenover "Na plan 3b", Q3 uitgelicht), **PDF-validatie in het productie-image** (aantal bestanden, warnings, streepjes, `check_pdf_report.py`, pagina-aantallen van de drie voorbeelden, de uitkomst van Taak 9 met de trede van de ladder), **Reviewgate** (datum akkoord Lars, welke rijen hij herschreef, wat hij besloot over `plurality` en de varianten), **Migratie** (datum en de vier waarden van de controlequery), **Afwijkingen van het plan, en waarom**, **Wat de reviews vonden**, **Bewust niet gedaan** (neem de lijst onderaan dit plan over en vul aan), **Koude leesronde light** (oordeel op B3 met citaten), **Browsercheck** (zes punten, wat niet gedekt is), **Besluit voor Lars**, **Na merge** (volgorde: migratie staat er al, Railway-redeploy, Vercel deployt vanzelf; de drie geregenereerde voorbeeld-PDF's gaan mee).

Geen inloggegevens, geen login-link, geen e-mailadressen in het verslag.

- [ ] **Stap 11: Commit**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3b
git add docs/rapport-stresstest-2026-09-10.md docs/superpowers/plans/2026-09-19-rapport-3b-uitvoering.md docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.html docs/examples/voorbeeldrapport_onboarding.pdf frontend/public/examples/voorbeeldrapport_loep.html frontend/public/examples/voorbeeldrapport_loep.pdf frontend/public/examples/voorbeeldrapport_retentiescan.html frontend/public/examples/voorbeeldrapport_retentiescan.pdf frontend/public/examples/voorbeeldrapport_onboarding.html frontend/public/examples/voorbeeldrapport_onboarding.pdf
git status --short | grep -v "^??"      # moet leeg zijn
git commit -m "docs(rapport): plan 3b eindverificatie, matrix en uitvoeringsverslag

Alle scenario's en voorbeelden gerenderd in het productie-image; voorbeeld-
rapporten geregenereerd met werkvragen en besluitpagina.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

**Niet mergen, niet pushen.** De hoofdsessie verifieert op de gemergde code en beslist.

---

## Bewust niet gedaan

- **Vervolgmeting (plan 3c):** `previous_campaign_id` staat in de migratie maar niet op het ORM-model en wordt nergens gelezen; de pagina "Wat is er veranderd", het beheerformulier, scenario 22 en 23 en de spec-voetregel "bij een vervolgmeting zet Loep dit besluit op pagina twee" horen bij 3c.
- **Werkvragen voor Loep Start:** geen richtingdata, dus geen blok (v1.1, eigen routeset nodig).
- **Onderlinge afstand tussen vertaalvragen:** vijf routeparen overlappen inhoudelijk (`ldd_mandate`/`rcd_mandate`, `wld_priorities`/`rcd_priorities`, `cpd_clarity`/`cpd_path`/`grd_criteria`, `grd_conversation`/`grd_nextstep`, `ldd_feedback`/`ldd_recognition`). De guardtest eist alleen dat geen twee vragen identiek zijn. Dit is een routeset-probleem en hoort bij de herweging na twee of drie campagnes (versiebump), niet bij 3b.
- **Toelichtingen per afdeling (H7):** het rapport zegt nu eerlijk dat het die niet toont; ze tonen vraagt een eigen staffel per afdeling en is niet gevraagd.
- **Twee eigenaren of twee vervolgdata per besluit:** de tabel heeft er één van elk.
- **Een auditevent bij het opslaan van een besluit:** de rij draagt `recorded_by` en `updated_at`; de audittabel is live aangemaakt en krijgt geen nieuwe actiesleutels zonder aanleiding.
- **De ongebruikte parameter `review_when`** in `_prioriteringsraster` en `_eerste_managementspoor`, en de dode helpers `_playbook_card` en `_step_cards` (nergens aangeroepen; ze dragen nog "In te vullen tijdens de bespreking"): losse opschoonronde.
- **De formulering "Wat dit rapport niet doet" uit plan 3a:** blijft staan (aanname op advies, zie hieronder).
- **Site- en Loep_Docs-copy rond de bespreking (propositiebesluit 19-9):** aparte site-switch, pas live als het onbegeleide rapport de lat haalt.
- **H6 (werkbeleving: welk gesprek?) en de restpunten uit het 3a-verslag** (`generated_at` op de UTC-dag, "n=60"-jargon in de appendix, "Frictiescore" op p.02 van Loep Vertrek, de drie manieren waarop een onbekende optiesleutel wordt afgehandeld): buiten scope van onderdeel 3 en 4.

---

## Wat Lars moet beslissen

1. **De 72 vertaalvragen en de verdeeld-zinnen** (`docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md`): per rij akkoord of herschrijven, plus de tien twijfels in sectie 4 en het Vertrek-patroon "wie had moeten". Zet daarna bovenaan `Status: akkoord Lars, <datum>`. Dit is de gate voor Taak 13 en 15.
2. **`plurality`: route-eigen vraag of verdeeld-zin?** Gebouwd als aanname: de route-eigen vraag van de grootste groep (het rapport toont daar al de opdrachtvorm van die route). De spec zette `plurality` bij de verdeelde staten.
3. **Geen vertaalvraag bij `none_needed`, `too_few` en `divided` zonder twee inhoudelijke routes.** Gebouwd als aanname; het blok toont dan herkennen en besluiten. Bij `none_needed` luidt de besluitvraag: "De meeste betrokkenen zeggen dat hier niets hoeft. Blijft dit een gesprekspunt, of besluiten jullie hier nu niets te doen? Wie is eigenaar van dat besluit, en wanneer kijken jullie opnieuw?" Akkoord met die zin?
4. **Terugval van de herkenningsvraag:** "Wat zit er volgens jullie achter de 6.2/10 op [onderwerp]?" in plaats van de spec-zin met "zo laag" (onwaar bij een vlak of hoog profiel). Akkoord?
5. **Voetregel van de besluitpagina:** tot plan 3c staat er "Leg dit besluit ook vast in je dashboard. Loep drukt het dan voor in dit rapport en bewaart het bij deze meting." in plaats van de belofte over de vervolgmeting. Akkoord?
6. **Appendixstaart uitgezonderd van de 40%-vullingsregel** (advies, gebouwd als aanname; `APPENDIX_STAART_UITGEZONDERD = False` draait het terug). Bevestigen.
7. **"Wat dit rapport niet doet" uit plan 3a blijft staan** (advies, geen taak in dit plan). Bevestigen.
8. **De migratie draaien op productie** (Taak 14), vóór de browsercheck en vóór de Railway-redeploy na de merge.
9. **Alleen de eigenaar en de operator schrijven een besluit** (`is_org_owner`, niet `is_org_manager`): een lid met de rol `member` leest mee maar legt niets vast. Dat volgt de spec en het bestaande `canManage`; noem het als je het anders wilt.

---

## Zelfreview

### 1. Spec-dekking

| Spec | Eis | Taak |
|---|---|---|
| par. 2 | Van keuze naar besluit met werkvragen, niet met advies | 4, 5, 13 |
| par. 2 | Het besluit is een product: in het rapport, in het dashboard (terugkomen in de vervolgmeting is 3c) | 6, 7, 10, 11, 12 |
| par. 2 | Elke telling heeft een noemer | 5 (herkenningsvraag met `_telling` en noemerzin) |
| par. 2 | Geen oorzaakclaims, geen individuen, staffels, geen em-dashes | vaste regels; guards in 5, 6, 12, 13 |
| par. 6 | Blok "Zo maak je er een besluit van" onder "Wat er moet gebeuren", per startpunt en tweede punt | 5 |
| par. 6.1 | Herkenningsvraag datagedreven, terugval bij te weinig data | 5 (terugval afwijkend, vastgelegd) |
| par. 6.2 | Vertaalvraag uit `WORK_QUESTIONS`, gekozen op de meest gekozen richting; verdeeld-variant | 4, 13 (per staat uitgewerkt, afwijkingen vastgelegd) |
| par. 6.3 | Besluitvraag in vaste vorm | 5 |
| par. 6 | 36 + 36 vragen, reviewgate door Lars, Loep Start niet | 13, 5 |
| par. 6 | Vaste regel op de segmentpagina (H7) | 5 |
| par. 7 | Invulbaar A4 met alle velden, ook los te printen | 6, 8 (`break-after`, regel `besluit-op-een-a4`) |
| par. 7 | Dashboardblok op een gesloten meting met rapport, zelfde velden | 10, 11, 12 |
| par. 7 | Tabel `campaign_decisions`, één rij per meting, RLS | 1 |
| par. 7 | Fail Loud bij opslagfouten | 11, 12 |
| par. 11 | Eén additieve, idempotente migratie met `previous_campaign_id`; backend leest via de bestaande sessie, frontend via RLS | 1, 2, 12 |
| par. 12 | WeasyPrint nul warnings, 3.11-guard, baselines, browsercheck besluit vastleggen | 0, 15 |
| par. 1 lat 3 | De besluitpagina print op één A4 | 8, 15 |
| propositiebesluit 19-9 | Geen begeleider verondersteld; "Besluit van het MT" | 5, 6, 12 (guards op de copy) |
| restpunt 1 | Dunne verdiepingsblokken, gemeten in het productie-image | 9 |
| restpunt 2 | Appendixstaart, één terugdraaibare wijziging | 8 |
| restpunt 3 | `_nl_tijd` via `ZoneInfo` | 3 |
| aanvulling punt 1 | 36 routes per scan, `*_none`/`*_other` zonder vraag, guardtest | 4, 13 |
| aanvulling punt 2 | Twee teksten per routesleutel, `scan_type` echt gebruikt, Fail Loud | 4 |
| aanvulling punt 3 | Eén pure functie met een test per staat; `none_needed` eerlijk in de besluitvraag | 4, 5 |
| aanvulling punt 4 | Vertrek-variant en `split_none`-zin vallen onder de gate | 4 (structuur), 13 (content) |
| aanvulling punt 5 | Vragen noemen het onderwerp niet; het blok levert de naam via `_fl` | 5, 13 (guardtest) |
| aanvulling punt 6 | Identiek-guard zonder afstandseis; genoemd in "Bewust niet gedaan" | 13 |
| aanvulling punt 7 | Appendixstaart en "Wat dit rapport niet doet" als aanname | 8, "Wat Lars moet beslissen" |

**Niet gedekt, bewust:** par. 8 (vervolgmeting) en scenario 22/23 uit par. 12 zijn plan 3c. H6 staat in de scopetabel van de spec bij onderdeel 3, maar par. 6 werkt het niet uit; het staat onder "Bewust niet gedaan".

### 2. Aannames die in dit plan zijn vastgelegd

1. `plurality` krijgt de route-eigen vraag (afwijking van de spec, besluit Lars).
2. Geen vertaalvraag bij `none_needed`, `too_few` en `divided` zonder twee inhoudelijke routes; eigen besluitvraag bij `none_needed`.
3. `split_none` en Vertrek-`divided` krijgen eigen zinnen, en die zijn gated content.
4. De terugval van de herkenningsvraag noemt de score in plaats van "zo laag".
5. Het werkvragenblok rendert ook zonder richtingdata (zonder vertaalvraag).
6. De H7-regel staat alleen bij Vertrek en Behoud met verdiepingsdata.
7. De voetregel van de besluitpagina belooft tot 3c niets over de vervolgmeting.
8. Eén eigenaar en één vervolgdatum per besluit; het tweede punt krijgt alleen "Wat precies".
9. Een rij in `campaign_decisions` zonder inhoud telt niet als besluit.
10. Het onderwerp dat het MT vastlegde wint op de besluitpagina van het startpunt van het rapport.
11. `previous_campaign_id` komt niet op het ORM-model vóór plan 3c.
12. Een onleesbare besluitentabel legt geen rapport en geen campagnepagina plat, maar wordt zichtbaar gemeld (backend: logregel en regel op de besluitpagina; frontend: melding in het blok).
13. Schrijven mag alleen de eigenaar of de operator (`is_org_owner`), niet elk lid.
14. De gate voor de besluitpagina-regel in `check_pdf_report.py` is de belofte op de gespreksagenda, zodat renders van vóór 3b geen valse bevinding geven.
15. Vóór de reviewgate is de content leeg en toont het blok twee vragen; `test_de_set_is_gevuld` maakt dat daarna een rode test.
16. De laatste vervolgpagina van de appendix is uitgezonderd van de vullingsregel; "Wat dit rapport niet doet" blijft staan.
17. De browsercheck draait lokaal vanuit de worktree tegen productie-Supabase, omdat de branch niet gepusht wordt; de gedownloade PDF komt dan nog van de live backend zonder 3b.

### 3. Placeholder-scan

Geen "TBD", "TODO" of "vul later in". Twee plekken dragen bewust geen eindtekst, omdat dit plan die niet mag formuleren: de 72 vertaalvragen en de vier verdeeld-zinnen in Taak 13 (bron: het door Lars goedgekeurde conceptdocument, met een extractiescript en een guardtest), en de gemeten percentages in Taak 9 stap 8 (uitkomst van een meting). Beide hebben een expliciete stopregel in plaats van een gok.

### 4. Consistentie van namen

`WORK_QUESTIONS`, `WORK_QUESTION_VARIANTS`, `work_questions_ready`, `work_question`, `work_question_variant`, `translation_question` (Taak 4) worden zo gebruikt in Taak 5 en 13. `_herkenningsvraag(deep_agg, scan_type, factor_key, label, score)`, `_besluitvraag(state)`, `_werkvragen_block(ranked, deep_agg, direction_agg, scan_type)` (Taak 5) zo in Taak 6. `_besluit_page(*, opener_html, scan_type, campaign_name, startpunt_label, tweede_label, review_hint, heeft_werkvragen[, decision, decision_unavailable])`, `BESLUIT_TITEL`, `BESLUIT_VOETREGEL`, `LEIDRAAD_ANKERS["besluit"]` (Taak 6, 7) zo in Taak 8 en 15. `load_decision(db, campaign_id) -> (dict | None, bool)` en de datasleutels `decision` en `decision_unavailable` (Taak 2) zo in Taak 7. `CampaignDecisionInput`, `CampaignDecision`, `normalizeDecisionInput`, `validateDecisionInput`, `decisionToRow`, `decisionFromRow`, `DECISION_LIMITS` (Taak 10) zo in Taak 11 en 12. `REGEL_BESLUIT`, `APPENDIX_STAART_UITGEZONDERD`, `BESLUIT_KOP`, `BESLUIT_VOET`, `BESLUIT_BELOFTE` (Taak 8). De kolomnamen van `campaign_decisions` zijn gelijk in de migratie (Taak 1), het model (Taak 2), `decisionToRow`/`decisionFromRow` (Taak 10) en de select in de pagina (Taak 12).
