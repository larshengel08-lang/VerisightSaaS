# Polijstronde na leesronde 4: implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle 39 bevindingen uit koude leesronde 4 oplossen (behalve S1), "Behoudssignaal" hernoemen naar "Werkbeeld", een richting pas duidelijk of de grootste groep laten heten als hij groter is dan de niets-groep, en de respondentflow taalkundig rechtzetten.

**Architecture:** Bijna alles zit in `backend/report_html.py` (copy, helpers, renderers), met kleine wijzigingen in `backend/report_css.py`, `backend/report_distribution.py`, `backend/report_priority.py` en `backend/products/shared/deepening.py` (richtingstaat, één werkvraag). De respondentflow raakt `templates/` en de productdefinities, met één nieuw veld `survey_minutes` als enige bron voor de invultijd. Geen databasemigratie, geen schemawijziging, geen nieuwe dependency. Opgeslagen velden en API-namen veranderen niet: "Werkbeeld" is alleen wat de klant leest.

**Tech Stack:** Python 3.11 (FastAPI, Jinja2, WeasyPrint 70.0 in het productie-image), pytest; Next.js/TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-polijstronde.md`. **Bron per code:** `docs/rapport-koude-leesronde-2026-10-08.md`, sectie 5 (citaat, pagina, voorstel). Lees bij elke taak de rij van de codes die de taak noemt.

---

## Harde regels (gelden voor elke taak)

- Worktree `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\polijstronde`, branch `feature/polijstronde` vanaf main `6b5d3b7f`. **Niet mergen, niet pushen.**
- Nooit kaal `git stash` of `git stash pop`. Commit altijd met `git commit -- <paden>`. **Commit alles vóór je stopt**; ongecommit werk telt als niet gedaan.
- **Python 3.11 op Railway.** Geen f-string met een backslash of met hetzelfde aanhalingsteken binnen de accolades als eromheen (PEP 701). Gebruik binnen de accolades van een `f"..."` alleen `'...'`, en bouw lastige stukken op met `+`. `tests/test_python311_syntax_guard.py` moet groen blijven.
- **Copy:** Nederlands, je/jij, Loep als onderwerp (nooit "ik", "wij", "we"), geen em-dash (U+2014) en geen en-dash (U+2013), geen jargon, geen oorzaak-claim, geen voorspelling, geen advies van Loep. De HR-manager leidt het gesprek; Loep zit niet aan tafel. Elke nieuwe rapportzin haalt de generieke-zin-test: hij bevat een getal of naam uit deze meting, of hij verschijnt alleen als de data die hij duidt er is. Tekst in `SECTION_INTROS` wordt ongeëscaped gerenderd: gebruik daar HTML-entiteiten (`&eacute;`) voor niet-ASCII, zoals de bestaande teksten.
- **Nooit** RLS, privacygates, drempels of staffels verlagen. De klant ziet nooit individuele antwoorden. Verzin niets wat het rapport niet meet. Kan een voorstel niet zonder dat, doe het dan niet en zet het in het verslag onder "Wat Lars moet beslissen".
- **Gate is de faalset per testnaam**, niet het aantal. Baselines gemeten op main `6b5d3b7f` op 9-10 (Taak 0): backend 24 falend (`docs/superpowers/plans/polijstronde-backend-baseline-fails.txt`), tsc 131, vitest 50 namen (`polijstronde-vitest-baseline-fails.txt`: 47 stabiel plus 3 die onder CPU-last wisselen: twee in `app/api/action-center-route-follow-ups/route.test.ts` en één in `app/inzichten/page.test.ts`).
- Een gepinde test die door een bewuste copywijziging breekt, pas je **in dezelfde commit** aan naar de nieuwe tekst (lockstep). Noem elke aangepaste test in het commitbericht. Een test verzwakken (een assert weghalen zonder vervanging) mag niet.
- Testinloggegevens nooit in commit, log, verslag of screenshot.
- `Co-Authored-By`-regel in elk commitbericht: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Omgeving en vaste commando's

- `PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe` (3.11.9). Draai alles vanuit de worktree.
- Meetmap: `T=/c/Users/larsh/AppData/Local/Temp/loep-polijst`. Daar staan al: `nulmeting.txt` (renders op main), `staten-voor.txt` (richtingstaten op main), `vitest-fails.js` (uittrekker voor vitest-JSON).
- `frontend/node_modules` is in de worktree geïnstalleerd. Raakt het leeg: `cd frontend && npm install && git checkout -- package-lock.json`. Nooit een junction naar `node_modules` (`rmdir /s /q` op een junction leegt het doel).
- WeasyPrint rendert lokaal niet (geen GTK). PDF's valideer je in het productie-image.
- Docker hangt soms op `%LOCALAPPDATA%\Docker\run\dockerInference`: Docker-processen stoppen, de map `%LOCALAPPDATA%\Docker\run` hernoemen, Docker Desktop herstarten. Nooit factory reset.
- `docs/stresstest/` is gitignored. Genereer altijd eerst opnieuw, anders meet je oude HTML.
- Frontend-build: dummy's alleen in de shell: `RESEND_API_KEY=re_dummy NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run build`. Nooit in een bestand.

**Backend-faalset (na elke backendtaak):**
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde
$PY -m pytest tests -q -rf -p no:cacheprovider 2>&1 | grep -E "^(FAILED|ERROR) " | sed -E "s/ - .*$//" | sort > $T/na.txt; diff --strip-trailing-cr docs/superpowers/plans/polijstronde-backend-baseline-fails.txt $T/na.txt && echo GEEN_REGRESSIES
```
Verwacht `GEEN_REGRESSIES`. Een regel aan de `<`-kant (test op main rood, nu groen) mag; noteer hem. Elke regel aan de `>`-kant is een regressie. De volledige suite duurt ongeveer 20 minuten; draai tussendoor alleen de geraakte testbestanden en de volledige suite aan het eind van elke taak.

**Frontend-faalset (na elke frontendtaak):**
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde/frontend
npx tsc --noEmit 2>&1 | grep -c "error TS"
npx vitest run --reporter=json --outputFile=C:/Users/larsh/AppData/Local/Temp/loep-polijst/vitest-na.json >/dev/null 2>&1
node $T/vitest-fails.js C:/Users/larsh/AppData/Local/Temp/loep-polijst/vitest-na.json > $T/vitest-na.txt
diff --strip-trailing-cr ../docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt $T/vitest-na.txt | grep "^>" ; echo KLAAR
```
Verwacht `131` en geen regel met `>` vóór `KLAAR`. Ontbreken de drie wisselvallige namen aan de `<`-kant: prima.

**PDF's renderen in het productie-image (vast recept):**
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde
docker build -t loep-backend:test .
$PY scripts/stresstest_report.py && $PY scripts/render_besluit_max.py
mkdir -p $T/out
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde:/repo:ro" \
  -v "C:/Users/larsh/AppData/Local/Temp/loep-polijst/out:/out" \
  loep-backend:test sh -c "pip install -q pymupdf; python /repo/scripts/render_in_image.py"
```
Uitvoer per bestand `OK <naam> paginas=N warnings=0 emdash=0 check=OK` of `NIET OK` met bevindingen; slotregel `TOTAAL n bestanden, m met bevindingen`. Selectie: voorvoegsels als argumenten na `render_in_image.py` (bijv. `01 06 zz_`). `render_in_image.py` rendert ook `docs/examples/*.html`; regenereer die eerst (`$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding`) als je de voorbeelden mee wilt meten.

**Nulmeting op main (9-10, `$T/nulmeting.txt`):** 34 bestanden, 3 met bevindingen: `paginavulling` op pagina 7 van 01, 09 en 19 (bekende uitzondering, mag niet slechter worden). Paginatallen: 01 17 (36% op p.7), 02 17, 03 17, 04 16, 05 18, 06 18, 07 8, 08 13, 09 17 (26% op p.7), 10 19, 11 19, 12 17, 13 17, 14 17, 15 17, 16 18, 16b 18, 17 18, 18 13, 19 17 (36% op p.7), 20 13, 21 13, 22 13, `zz_besluitmax_*` 18/13/16, voorbeelden Vertrek 16, Behoud 18, Start 13.

---

## Bestandsoverzicht

| Bestand | Wat verandert | Taken |
|---|---|---|
| `backend/products/shared/deepening.py` | Richtingregel niets-groep in `direction_state`; één exit-werkvraag | 1, 9 |
| `backend/report_html.py` | Copy, helpers en renderers | 1-10 |
| `backend/report_css.py` | `.dir-niets`, `.dir-unchosen`, `.tg` niet breken, kop bij de kaarten, voettekst, p.02-noot | 3, 5, 6, 8 |
| `backend/report_distribution.py` | Regel "verdeeld beeld" | 6 |
| `backend/report_priority.py` | `CELL_TOO_FEW` | 6 |
| `generate_voorbeeldrapport.py` | Naam Loep Start-voorbeeld | 10 |
| `templates/survey-intro.html`, `templates/survey.html`, `templates/complete.html`, `templates/survey/*.html` | Respondentcopy | 12 |
| `backend/main.py` | Context startpagina, respondentmeldingen | 12 |
| `backend/products/{exit,retention,onboarding}/definition.py` | `survey_minutes`, respondentcopy | 12 |
| `frontend/lib/campaign-setup.ts` | Invultijd uit dezelfde getallen (pariteitstest) | 12 |
| `frontend/lib/dashboard/campaign-decision.ts` (+ test) | Terugkoppelingsregel en termijn Loep Start in lockstep | 8 |
| `frontend/lib/action-center-live.ts` | Oude naam uit één vraag | 3 |
| `frontend/app/privacy/page.tsx`, `frontend/lib/juridische-paginas.guard.test.ts` | Zin over gebruiksgegevens | 13 |
| `frontend/components/marketing/home-page-content.tsx`, `scripts/render_hero_p02.py`, `frontend/public/images/voorbeeld-loep-behoud-p02.*`, `frontend/lib/homepage-polijstronde.test.ts` | Homepage: hero-afbeelding en gelijke kaarten | 13b |
| `tests/test_polijstronde_*.py` (nieuw) | Nieuwe gedragstests per taak | 1-12 |
| `docs/examples/`, `frontend/public/examples/` | Voorbeeldrapporten opnieuw | 14 |
| `docs/superpowers/plans/2026-10-09-polijstronde-uitvoering.md` (nieuw) | Verslag | 14 |

## Taakoverzicht

| # | Taak | Codes / spec |
|---|---|---|
| 0 | Plan, spec, baselines committen | |
| 1 | Richting pas duidelijk als hij groter is dan de niets-groep | spec par. 3 |
| 2 | Pagina twee: richtingregel korter, geen percentage | spec par. 5, R18 |
| 3 | "Behoudssignaal" wordt "Werkbeeld"; bandlabels op p.03 | spec par. 2, R20, R12 |
| 4 | Kernzin en leidraad op pagina twee; besluitpagina afdelingsregel | R13, R21, R27, S3, S11 |
| 5 | Richtingkaart: twee tellingen, niets apart, niet gekozen opties, voorbehoud, kop bij kaarten | R7, V7, R19, R22, V10, R23 |
| 6 | Rangorde, onderwerppagina's en jargon | R9, R10, R11, R17, R24, R25, R26 |
| 7 | Afdelingen: kolomkop en geen cijfers van kleine afdelingen in de conclusie | R14, S9 |
| 8 | Methodiek en besluitpagina | R16, V14, S10, S6, S4 |
| 9 | Loep Vertrek | V3, V11, V12, V13, V15, V16 |
| 10 | Loep Start | S2, S5, S7, S8 |
| 11 | Tussenmeting in het productie-image, met vaste terugvalopties | |
| 12 | Respondentflow | spec par. 4 |
| 13 | Privacyverklaring sectie 5 | spec par. 5 |
| 13b | Homepage: echte rapportafbeelding in de hero, drie gelijke kaarten | spec par. 7 |
| 14 | Eindverificatie, voorbeeldrapporten, browsercheck, verslag | |

Volgorde: 0, dan 1 tot en met 10 **na elkaar** (ze raken allemaal `backend/report_html.py`; niet parallel), dan 11, dan 12 en 13 (onafhankelijk van het rapport; mogen in elke volgorde na 11), dan 13b (na 11 en 12), dan 14.

**Codes die niet in een taak staan:** S1 (vertaalvraag Loep Start) schuift volgens de spec naar na de eerste klant. Alle andere 38 codes staan hierboven.

**Wat dit plan bewust afwijkend van de spec of het leesrondevoorstel doet (en waarom):**
1. **Werkbeeld-uitleg (spec par. 2).** Het voorbeeld in de spec ("het gemiddelde van de zes werkonderwerpen") is onwaar. De score is per respondent het gemiddelde van zeven delen met gelijk gewicht: de zes werkonderwerpen en de werkbeleving (de drie basisbehoeften samen) als zevende deel (`backend/products/retention/scoring.py:42-55`). De uitleg wordt daarom: "De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven."
2. **R27.** Er is in code en data geen reden waarom blijf- en vertrekintentie niet per afdeling staan; het is een productkeuze. Dit plan voegt alleen de ware halve zin over "geen voorspelling van wie vertrekt" toe. De reden of een uitsplitsing per afdeling is aan Lars.
3. **R25.** Omrekenen naar tienden kan niet exact (2,5 wordt 4,375). De regel blijft op de antwoordschaal, met de uitleg wat 1 en 5 daar betekenen.
4. **R14 bij Loep Vertrek.** De scorekolom is daar 11 min de frictiescore, een getal zonder naam. De kop blijft "Score" en de intro zegt wat het is; een eigen naam is aan Lars.
5. **V10.** Het voorbehoud gaat ook gelden als een richting op minder dan tien veranderkeuzes rust (zelfde grens als de toelichting op dezelfde pagina). Dat voegt voorbehouden toe, verlaagt niets.
6. **V13.** De eigen grenzen van de frictiescore blijven (ze bepalen ook de opgeslagen `risk_band` van alle producten). Het rapport zegt dat het eigen grenzen zijn, en het middenlabel heet voortaan "Gemengd frictiebeeld". Gelijktrekken is aan Lars.
7. **S6.** "Ongeveer 30 dagen" volgt uit het ritme 30/60/90 van Loep Start; de precieze termijn is aan Lars.

---

## Taak 0: plan, spec en baselines committen

**Files:**
- Commit: `docs/superpowers/specs/2026-10-09-polijstronde.md`, `docs/rapport-koude-leesronde-2026-10-08.md`, `docs/superpowers/plans/2026-10-09-polijstronde.md`, `docs/superpowers/plans/polijstronde-backend-baseline-fails.txt`, `docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt`

De worktree, de baselines en de nulmeting zijn al gemaakt door de hoofdsessie van deze ronde. Alleen committen.

- [ ] **Stap 1: Controleren**
```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde
git log --oneline -1   # 6b5d3b7f
wc -l < docs/superpowers/plans/polijstronde-backend-baseline-fails.txt   # 24
wc -l < docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt    # 50
tail -1 $T/nulmeting.txt   # TOTAAL 34 bestanden, 3 met bevindingen
```

- [ ] **Stap 2: Commit**
```bash
git add docs/superpowers/specs/2026-10-09-polijstronde.md docs/rapport-koude-leesronde-2026-10-08.md docs/superpowers/plans/2026-10-09-polijstronde.md docs/superpowers/plans/polijstronde-backend-baseline-fails.txt docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt
git commit -F- -- docs/superpowers/specs/2026-10-09-polijstronde.md docs/rapport-koude-leesronde-2026-10-08.md docs/superpowers/plans/2026-10-09-polijstronde.md docs/superpowers/plans/polijstronde-backend-baseline-fails.txt docs/superpowers/plans/polijstronde-vitest-baseline-fails.txt <<'EOF'
chore(polijstronde): spec, leesronde 4, plan en baselines

Backend 24 falend, tsc 131, vitest 47 stabiel plus 3 wisselvallig (50
namen in de baseline) op main 6b5d3b7f.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 1: een richting moet groter zijn dan de niets-groep (spec par. 3)

**Files:**
- Modify: `backend/products/shared/deepening.py` (`direction_state`, rond regel 1187-1307)
- Modify: `backend/report_html.py` (`_direction_card_cell` 3327-3456, `_direction_p02_line` 4084-4145, methodiekcel in `_trust_page` 4689-4711)
- Create: `tests/test_polijstronde_richting.py`
- Lockstep (14 tests die met de nieuwe regel breken, door de hoofdsessie vooraf vastgesteld):
  - `tests/test_direction_niets_apart.py`: `test_plurality_kaart_met_niets[exit|retention]`, `test_plurality_p02_met_niets[exit|retention]`, `test_rijen_zonder_keuze_krijgen_een_zin_en_alles_telt_op`, en `test_methodiek_legt_uit_dat_niets_geen_richting_is` (tekst)
  - `tests/test_direction_renderer_wiring.py`: `test_niet_kwetsbaar_geeft_op_beide_plekken_geen_split_none_maar_de_route[exit|retention]`
  - `tests/test_direction_report_block.py`: `test_new_states_stay_out_without_a_known_factor_score`, `test_p02_line_for_the_new_states` (deel `zonder_score`), `test_split_none_beslist_op_de_getoonde_score_niet_op_de_rauwe` (de 4.96-assert op `dir-clear`)
  - `tests/test_direction_state_inhoudelijk.py`: `test_defecte_rij_verandert_de_staat_alleen_via_n` (paar `("none_needed","clear")` wordt `("none_needed","divided")`), `test_plurality_op_inhoudelijke_stemmen` (eerste geval), `test_split_none_gaat_voor_clear` (regel 133: bij 6.0 nu `divided`)
  - `tests/test_direction_state_plurality.py`: `test_onbekende_score_geldt_nooit_als_kwetsbaar`

**Waarom:** "Van wie om verandering vroeg, kiest de grootste groep X" kan nu verschijnen terwijl meer mensen "Niets" kozen dan X (bijv. niets 8, X 5, op een onderwerp boven de 5,0). Onder de 5,0 vangt `split_none` dit al (strenger: daar is het ook verdeeld bij niets = grootste richting min één). De nieuwe regel werkt dus alleen bij een getoonde score vanaf 5,0 en bij een onbekende score.

- [ ] **Stap 1: Nulmeting richtingstaten bestaat al**

`$T/staten-voor.txt` is op main gemaakt. Niet opnieuw maken.

- [ ] **Stap 2: Schrijf de falende tests**

`tests/test_polijstronde_richting.py`:
```python
"""Spec 2026-10-09 par. 3 (besluit Lars 9-10): een richting heet pas duidelijk,
of de grootste groep, als hij meer stemmen heeft dan 'Niets, dit zit hier goed'.
Is de niets-groep even groot of groter, dan heet het onderwerp verdeeld."""
import itertools
import re

import pytest

from backend.products.shared import deepening as dp
from backend.products.shared.deepening import direction_option_texts
from backend.report_html import _direction_card_cell, _direction_p02_line, _trust_page

FK = "growth"


def _opties(scan_type="retention"):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    other_key = next(k for k in keys if k.endswith("_other"))
    routes = [k for k in keys if k not in (none_key, other_key)]
    return none_key, other_key, routes


def _agg(counts, answered=None):
    n = sum(counts.values()) if answered is None else answered
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


def test_niets_groter_dan_grootste_richting_is_verdeeld():
    none_key, _o, (a, b, c, *_r) = _opties()
    # change_n 7, a 4/7 met voorsprong 2 was clear; niets 5 > 4.
    st = dp.direction_state(_agg({a: 4, b: 2, c: 1, none_key: 5}), FK, 6.0)
    assert st["state"] == "divided"
    assert st["none_at_least_top"] is True
    assert st["change_top_n"] == 4 and st["none_n"] == 5


def test_niets_even_groot_als_grootste_richting_is_verdeeld():
    none_key, _o, (a, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, none_key: 4}), FK, 6.0)
    assert st["state"] == "divided" and st["none_at_least_top"] is True


def test_niets_een_kleiner_blijft_duidelijk_boven_de_vijf():
    none_key, _o, (a, b, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, b: 1, none_key: 3}), FK, 6.0)
    assert st["state"] == "clear" and st["none_at_least_top"] is False


def test_onder_de_vijf_blijft_split_none_voorgaan():
    none_key, _o, (a, *_r) = _opties()
    assert dp.direction_state(_agg({a: 4, none_key: 4}), FK, 4.5)["state"] == "split_none"


def test_onbekende_score_valt_ook_onder_de_regel():
    none_key, _o, (a, *_r) = _opties()
    assert dp.direction_state(_agg({a: 14, none_key: 14}), FK, None)["state"] == "divided"


def test_none_at_least_top_staat_altijd_in_de_uitkomst():
    none_key, _o, (a, b, *_r) = _opties()
    for counts in ({a: 1}, {a: 5, b: 1}, {none_key: 9, a: 1}, {a: 3, none_key: 3}):
        st = dp.direction_state(_agg(counts), FK, 6.0)
        assert "none_at_least_top" in st


def test_eigenschap_clear_en_plurality_altijd_groter_dan_niets():
    none_key, other_key, routes = _opties()
    keys = [routes[0], routes[1], other_key, none_key]
    for waarden in itertools.product(range(0, 7), repeat=4):
        counts = {k: v for k, v in zip(keys, waarden) if v}
        if not counts:
            continue
        for score in (None, 5.0, 6.2, 8.0):
            st = dp.direction_state(_agg(counts), FK, score)
            if st["state"] in ("clear", "plurality"):
                assert st["top_n"] > st["none_n"], (counts, score, st)


def _kaart(counts, scan_type="retention", score=6.2):
    a = _agg(counts)
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=a,
                                scan_type=scan_type, factor_key=FK,
                                n_total=a["answered"], factor_score=score)


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_noemt_niets_groter_dan_de_grootste_richting(scan_type):
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    html = _kaart({a: 5, b: 3, none_key: 8}, scan_type)
    assert 'class="dir-card dir-divided"' in html
    assert "Geen eenduidige richting." in html
    tekst = re.sub(r"<[^>]+>", " ", html)
    assert "meer mensen kozen" in tekst and "(8)" in tekst and "(5)" in tekst
    assert "grootste groep kiest" not in tekst


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_noemt_niets_even_groot(scan_type):
    none_key, _o, (a, *_r) = _opties(scan_type)
    tekst = re.sub(r"<[^>]+>", " ", _kaart({a: 4, none_key: 4}, scan_type))
    assert "even veel mensen kozen" in tekst


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_p02_regel_bij_niets_groter(scan_type):
    none_key, _o, (a, b, *_r) = _opties(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 5, b: 3, none_key: 8})}, FK, scan_type, 6.2)
    assert regel.startswith("Over wat hier moet gebeuren zijn de 16 ")
    assert "8 vinden dat hier niets hoeft, tegen 5 voor de grootste richting." in regel
    assert "zonder meerderheid" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_methodiek_noemt_de_nieuwe_regel(scan_type):
    html = _trust_page(scan_type, opener_html="", direction_active=True)
    tekst = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
    assert "heet pas duidelijk, of de grootste groep, als hij meer stemmen heeft dan" in tekst
```
Controleer de signatuur van `_trust_page` (regel 4579) en vul ontbrekende verplichte argumenten aan zoals `tests/test_direction_niets_apart.py` hem aanroept.

- [ ] **Stap 3: Draai en zie ze falen**

Run: `$PY -m pytest tests/test_polijstronde_richting.py -q`
Verwacht: FAIL (`KeyError: 'none_at_least_top'`, staat `clear`/`plurality`).

- [ ] **Stap 4: Implementatie in `direction_state`**

In `backend/products/shared/deepening.py`:
1. Voeg aan `base` (regel ~1243) `"none_at_least_top": False, "change_top_n": 0` toe.
2. Direct na het `split_none`-blok (na regel ~1288) en vóór `if change_n < DIRECTION_MIN_N:`:
```python
    # Spec 2026-10-09 par. 3 (besluit Lars 9-10): een richting heet pas
    # duidelijk, of de grootste groep, als hij meer stemmen heeft dan de
    # niets-optie. Is de niets-groep even groot of groter, dan is het onderwerp
    # verdeeld. Onder DIRECTION_SPLIT_NONE_MAX_SCORE heeft split_none dit
    # hierboven al strenger afgevangen (daar ook bij één stem verschil); deze
    # regel werkt dus vanaf die score en bij een onbekende score.
    if none_key is not None and none_n >= change_top:
        return {**base, "state": "divided", "none_at_least_top": True,
                "change_top_n": change_top}
```
3. Werk de docstring bij: de volgorde wordt `too_few -> none_needed -> (divided zonder veranderoptie, of met *_other als grootste) -> split_none -> divided als niets >= grootste richting -> clear -> plurality -> divided`, en noem de twee nieuwe sleutels in de "Retourneert altijd"-zin.

- [ ] **Stap 5: Kaart**

In `_direction_card_cell`, in de tak voor `divided`: is `st["none_at_least_top"]` waar, dan wordt de body (kop blijft `DIRECTION_HEAD_DIVIDED`):
```python
        niets = _niets_tekst(scan_type)
        top = st["change_top_n"]
        if st["none_n"] == top:
            body = (f"De {n} {DIR_N_DIE_WIE} zijn verdeeld: even veel mensen kozen "
                    f"‘{niets}’ ({st['none_n']}) als de grootste richting ({top}).")
        else:
            body = (f"De {n} {DIR_N_DIE_WIE} zijn verdeeld: meer mensen kozen "
                    f"‘{niets}’ ({st['none_n']}) dan de grootste richting ({top}).")
```
Gebruik de bestaande helper voor de niets-tekst per scan (zoek `_niets_tekst`; heet hij anders, gebruik die). Voeg `_zonder_keuze_zin(st)` toe zoals de gewone divided-body doet. De `dir-src`/`dir-head`-structuur blijft gelijk aan de bestaande divided-kaart.

- [ ] **Stap 6: Pagina twee**

In `_direction_p02_line`, in de tak `if st["state"] == "divided":`:
```python
    if st["state"] == "divided":
        if st["none_at_least_top"]:
            return (f"Over wat hier moet gebeuren zijn de {n} {DIR_N_DIE_WIE} verdeeld: "
                    f"{_tel(st['none_n'], 'vindt', 'vinden')} dat hier niets hoeft, "
                    f"tegen {st['change_top_n']} voor de grootste richting.")
        return (f"Over wat hier moet gebeuren zijn de {n} {DIR_N_DIE_WIE} "
                "verdeeld. Zie de gespreksagenda.")
```
`_tel` geeft "8 vinden" (getal plus werkwoord); controleer dat in de bestaande helper.

- [ ] **Stap 7: Methodiekcel**

In `_trust_page` (4689-4711) wordt de richtingzin, met `{niets}` = `_niets_tekst(scan_type)`:
```
Wie ‘{niets}’ koos, telt niet mee bij de vraag welke richting de grootste is; hoeveel mensen dat kozen, staat er apart bij. Een richting heet pas duidelijk, of de grootste groep, als hij meer stemmen heeft dan ‘{niets}’; anders heet het onderwerp verdeeld. Kiest meer dan de helft niets, dan staat er dat hier volgens de meesten niets hoeft. Scoort het onderwerp onder de 5,0, dan heet het ook verdeeld als de grootste richting maar één stem meer heeft dan de niets-groep. De drempel van 3 staat in de drempeltabel op pagina <pref>.
```
Gebruik de bestaande constanten (`DIRECTION_SPLIT_NONE_MAX_SCORE` via `_komma`, `DIRECTION_MIN_N`) zoals de huidige code. Het stuk vanaf "De drempel van" blijft zoals het is.

- [ ] **Stap 8: Tests groen, lockstep**

Run: `$PY -m pytest tests/test_polijstronde_richting.py tests/test_direction_niets_apart.py tests/test_direction_renderer_wiring.py tests/test_direction_report_block.py tests/test_direction_state_inhoudelijk.py tests/test_direction_state_plurality.py tests/test_report_tellingen.py -q`

Pas de 14 genoemde tests aan naar de nieuwe uitkomst (staat `divided` met de nieuwe body of p.02-regel). Per test: verander alleen de verwachte staat/tekst, nooit de invoer, en zet er een regel commentaar bij: `# Spec 2026-10-09 par. 3: niets >= grootste richting is verdeeld.` In `test_plurality_kaart_met_niets`/`test_plurality_p02_met_niets` (PLUR_NIETS, niets 8 > route 5): verwacht nu de divided-kaart. Blijft een test over die een plurality-met-niets moet bewijzen, geef hem een nieuwe invoer waarbij niets kleiner is dan de route (bijv. niets 3, routes 5/2/2) en houd de bestaande assertvormen.

`test_staten_gaan_alleen_omhoog` (`_oud` vergelijkt met main 91ecfd14) moet groen blijven zonder wijziging; faalt hij, stop en meld het.

- [ ] **Stap 9: Volledige backend-faalset** (zie boven). Verwacht `GEEN_REGRESSIES`.

- [ ] **Stap 10: Richtingstaten na**
```bash
$PY scripts/stresstest_report.py > /dev/null && $PY scripts/richting_staten.py > $T/staten-taak1.txt
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention
$PY scripts/richting_staten.py --voorbeelden >> $T/staten-taak1.txt
diff $T/staten-voor.txt $T/staten-taak1.txt; git checkout -- docs/examples frontend/public/examples
```
Verwacht (vooraf door de hoofdsessie gesimuleerd): **geen enkele kaart wisselt**; alleen twee onderwerpen buiten de agenda in scenario 04 wisselen, en die staan niet op een kaart. Noteer de uitkomst in `$T/staten-taak1.txt`; het verslag gebruikt hem. De voorbeeldrapporten worden pas in Taak 14 definitief gemaakt; zet ze nu terug.

- [ ] **Stap 11: Commit**
```bash
git commit -F- -- backend/products/shared/deepening.py backend/report_html.py tests/test_polijstronde_richting.py tests/test_direction_niets_apart.py tests/test_direction_renderer_wiring.py tests/test_direction_report_block.py tests/test_direction_state_inhoudelijk.py tests/test_direction_state_plurality.py <<'EOF'
feat(richting): richting pas duidelijk als hij groter is dan de niets-groep

Spec 2026-10-09 par. 3. Is de niets-groep even groot of groter dan de
grootste richting, dan heet het onderwerp verdeeld; kaart en pagina twee
noemen beide tellingen. Onder de 5,0 blijft split_none voorgaan.
Lockstep: <noem de aangepaste tests>.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Taak 2: pagina twee, richtingregel korter en zonder percentage (spec par. 5, R18)

**Files:**
- Modify: `backend/report_html.py` (`_telling` 2928, `_richting_telling` 3040, `_direction_p02_line` 4084)
- Create: `tests/test_polijstronde_p02_richting.py`
- Lockstep: `tests/test_direction_niets_apart.py` (BASELINE `*/p02`-sleutels, `test_clear_p02_noemt_noemer_en_niets`, `test_plurality_p02_met_niets`, `test_enkelvoud_bij_een_niets_stem`, `test_rijen_zonder_keuze_*`, `test_plurality_met_rijen_zonder_keuze_en_zonder_niets`, `test_getallen_tellen_op_in_clear_en_plurality`), `tests/test_direction_report_block.py` (`test_p02_line_per_state`, `test_half_none_p02_line_makes_no_majority_claim`, `test_p02_line_for_the_new_states`), `tests/test_report_tellingen.py` (`test_p02_regel_labelt_de_noemer_net_als_de_kaart`, `test_p02_en_kaart_noemen_hetzelfde_getal_met_percentage`), `tests/test_report_p02_mtvel.py:280`, `tests/test_direction_renderer_wiring.py` (60-95)

**Doel:** Op pagina twee geen percentage meer bij de richting (R18: "11 van de 15" is sterk genoeg). De lange regel bij de grootste groep wordt korter: eerst de opdracht, dan de noemer in een slotzin (spec par. 5). De kaart op de gespreksagenda houdt zijn percentage.

Nieuwe vormen op pagina twee (`{imp}` = `direction_imperative(...)`, eindigt al op een punt; `{nz}` = `_zonder_keuze_p02(st)`):

| Staat | Nieuwe regel |
|---|---|
| clear, op alle beantwoorders | `Wat er moet gebeuren volgens {top} van de {n} die dit het laagst scoorden en de vraag beantwoordden: {imp}` |
| clear, op veranderkeuzes | `Wat er moet gebeuren volgens {top} van de {change_n} die dit het laagst scoorden en om verandering vroegen: {imp}` + (` {N vindt/vinden} dat hier niets hoeft.` als none_n) + `{nz}` |
| plurality, op alle beantwoorders | `Wat er moet gebeuren volgens de grootste groep, zonder meerderheid: {imp} Dat zijn {top} van de {n} die dit het laagst scoorden en de vraag beantwoordden.` |
| plurality, op veranderkeuzes | `Wat er moet gebeuren volgens de grootste groep, zonder meerderheid: {imp} Dat zijn {top} van de {change_n} die dit het laagst scoorden en om verandering vroegen` + (`; {N vindt/vinden} dat hier niets hoeft` als none_n) + `.` + `{nz}` |
| none_needed | `{top} van de {n} die dit het laagst scoorden en de vraag beantwoordden zeggen: hier hoeft niets.` |
| split_none, divided, too_few | ongewijzigd (Taak 1 regelt divided met niets) |

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_p02_richting.py`:
```python
"""R18 en spec 2026-10-09 par. 5: richtingregel op pagina twee zonder percentage,
en bij de grootste groep eerst de opdracht, dan de noemer in een slotzin."""
import re

import pytest

from backend.products.shared.deepening import direction_option_texts
from backend.report_html import _direction_card_cell, _direction_p02_line

FK = "growth"


def _keys(scan_type):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    routes = [k for k in keys if not k.endswith(("_none", "_other"))]
    return none_key, routes


def _agg(counts):
    n = sum(counts.values())
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_geen_percentage_op_pagina_twee(scan_type):
    _n, (a, b, *_r) = _keys(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 11, b: 4})}, FK, scan_type, 4.7)
    assert "11 van de 15 die dit het laagst scoorden" in regel
    assert "%" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_kaart_houdt_het_percentage(scan_type):
    _n, (a, b, *_r) = _keys(scan_type)
    a_ = _agg({a: 11, b: 4})
    kaart = _direction_card_cell("startpunt", label="Groeiperspectief", agg=a_,
                                 scan_type=scan_type, factor_key=FK, n_total=15,
                                 factor_score=4.7)
    assert "11 van de 15 (73%)" in kaart


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_grootste_groep_met_niets_opdracht_eerst_noemer_in_slotzin(scan_type):
    none_key, (a, b, c, d, *_r) = _keys(scan_type)
    # change_n 27: a 12 (44%), b 8, c 4, d 3; niets 8 < 12.
    regel = _direction_p02_line({FK: _agg({a: 12, b: 8, c: 4, d: 3, none_key: 8})},
                                FK, scan_type, 6.2)
    assert regel.startswith("Wat er moet gebeuren volgens de grootste groep, zonder meerderheid: ")
    assert regel.endswith(" Dat zijn 12 van de 27 die dit het laagst scoorden en om "
                          "verandering vroegen; 8 vinden dat hier niets hoeft.")
    assert "%" not in regel


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_grootste_groep_zonder_niets(scan_type):
    _n, (a, b, c, d, *_r) = _keys(scan_type)
    regel = _direction_p02_line({FK: _agg({a: 8, b: 5, c: 4, d: 3})}, FK, scan_type, 6.2)
    assert regel.endswith(" Dat zijn 8 van de 20 die dit het laagst scoorden en de vraag "
                          "beantwoordden.")
```
Controleer dat de gekozen tellingen in deze staten vallen (`plurality`: aandeel ≥ 35%, voorsprong ≥ 2); pas alleen de getallen aan als de bestaande drempels iets anders geven, en zeg dat in het commitbericht.

- [ ] **Stap 2: Zie ze falen.** `$PY -m pytest tests/test_polijstronde_p02_richting.py -q`

- [ ] **Stap 3: Implementatie**
1. `_telling(x, y, *, pct: bool = True)`: zonder percentage als `pct` onwaar is. Docstring: "pct=False alleen voor pagina twee (R18); de kaart houdt het percentage."
2. `_richting_telling(st, *, pct: bool = True)` geeft `pct` door.
3. `_direction_p02_line` volgens de tabel hierboven; alle tellingen met `pct=False`. Voor none_needed: `_telling(st['top_n'], n, pct=False)`.

- [ ] **Stap 4: Tests groen, lockstep.** Draai de geraakte bestanden uit de Files-lijst. `test_p02_en_kaart_noemen_hetzelfde_getal_met_percentage` wordt: "pagina twee en kaart noemen hetzelfde getal; de kaart met percentage, pagina twee zonder" (hernoem de test zo; asserts: kaart bevat `4 van de 10 (40%)`, regel bevat `4 van de 10` en geen `%`). De BASELINE-strings in `test_direction_niets_apart.py` voor `*/p02` krijgen de nieuwe vorm; laat het docstringcommentaar "BASELINE is de uitvoer van HEAD" bijwerken met "na polijstronde taak 2".

- [ ] **Stap 5: Volledige backend-faalset.** `GEEN_REGRESSIES`.

- [ ] **Stap 6: Commit** (`feat(p02): richtingregel zonder percentage, noemer in een slotzin`), met de lockstep-tests in de padlijst en in het bericht.

---

## Taak 3: "Behoudssignaal" wordt "Werkbeeld"; bandlabels op p.03 (spec par. 2, R20, R12)

**Files:**
- Modify: `backend/report_html.py` (regels 151-155 `_RETENTION_BANDS`, 236, 1609, 1624, 1849, `_p02_signal_cell` 741, `_behoudscontext` 6073-6170, 7029, 7056; docstrings 163 en 193)
- Modify: `backend/report_css.py` (stijl voor de uitleg onder de tegel)
- Modify: `frontend/lib/action-center-live.ts:60`
- Create: `tests/test_polijstronde_werkbeeld.py`
- Lockstep: `tests/test_report_signal_polarity.py` (67-96, 176-183, 277-311 en de bandlabels 45-50), `tests/test_report_p02_kernzin.py:571-587`, `tests/test_pdf_redesign.py:143-146`, `tests/test_report_degraded_page_two.py:295`, `tests/test_report_leesbaarheid.py:96`, `tests/test_report_band_rounding.py:151-170`

**Inventaris (door de hoofdsessie gemaakt; alleen deze plekken ziet de klant):**

| Plek | Nu | Wordt |
|---|---|---|
| p.02 tegel (`report_html.py:7029`) | `Behoudssignaal` | `Werkbeeld`, met eronder de uitleg `De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven.` |
| p.02 zonder profiel (7056) | `{band} (behoudssignaal 5.5/10).` | `{band} (werkbeeld 5.5/10).` |
| p.02 leidraad (1849) | `de blijfintentie en het behoudssignaal` | `de blijfintentie en het werkbeeld` |
| p.03 intro `SECTION_INTROS["behoudscontext"]` (1609) | `Het behoudssignaal is een samenvattende groepsscore: de zes onderwerpen over het werk en de werkbeleving samen, ...` | `Het werkbeeld is een samenvattende groepsscore: de zes onderwerpen over het werk en de werkbeleving (de drie basisbehoeften autonomie, competentie en verbondenheid) samen, ...` en daarna, vóór de rest van de bestaande tekst: `Het zegt hoe mensen hun werk ervaren, niet of ze blijven; dat zeggen blijf- en vertrekintentie.` Controleer de exacte namen van de drie basisbehoeften in het rapport (`_werkbeleving_section`) en gebruik die. Behoud "Hoe hoger, hoe beter" en "onder de 5,0" (gepind door `test_report_signal_polarity.py:108-113`). |
| p.03 rijtitel (6093) en rijtekst (6094) | `Behoudssignaal` / `De zes onderwerpen over het werk en de werkbeleving samengebracht op groepsniveau.` | `Werkbeeld` / `De zes onderwerpen over het werk en de werkbeleving samen, op groepsniveau. Geen meting van of mensen blijven.` |
| Gespreksopener zonder verdieping, leiderschap (236) | `Gaat het behoudssignaal over vertrouwen in leiding, feedback of zichtbare steun?` | `Gaat wat hier wringt over vertrouwen in leiding, feedback of zichtbare steun?` |
| Loep Vertrek intro (1624) | `... de opgegeven redenen en het bredere werkbeeld hetzelfde verhaal vertellen.` | `... de opgegeven redenen en het bredere beeld van het werk hetzelfde verhaal vertellen.` (botst anders met de nieuwe naam) |
| Action Center (`frontend/lib/action-center-live.ts:60`) | `Welk behoudssignaal verdient nu ...` | `Welk signaal over behoud verdient nu ...` (rest gelijk) |
| Voorbeeldrapporten Behoud | oude naam | opnieuw gegenereerd in Taak 14 |

**Niet zichtbaar voor de klant, bewust niet gewijzigd** (komt in het verslag): dashboard en live site noemen deze score niet; `frontend/public/llms.txt` en de mailtemplates bevatten de naam niet; `backend/report.py` (dood pad voor retention), `backend/products/retention/definition.py` (`signal_label`, `dashboard_signal_help`; alleen gelezen door `report.py`), `backend/products/retention/report_content.py`, en de frontendbestanden zonder importeur (`home-launcher.ts`, `dashboard-architecture.ts`, `page-helpers.tsx`, `lib/products/retention/*`, `hero-motion-dashboard.tsx`, `home-page-content.tsx:62` in de niet-gerenderde `SuitePreviewSection`, `site-content.ts` `approachRoutes`/`pricingFaqs`). Interne namen (`risk_score`, `signal_score`, `_signal_health`, `toDisplaySignalScore`) blijven. Loep Start houdt "Checkpointscore", Loep Vertrek "Frictiescore".

**Bandlabels (R12).** Op p.03 krijgen alle vier de cijfers labels uit dezelfde set als de rest van het rapport (grenzen 5,0 en 6,5 op de getoonde score):
- Werkbeeld, bevlogenheid, blijfintentie: `onder druk` (onder 5,0), `vraagt aandacht` (5,0 tot 6,5), `relatief sterk` (vanaf 6,5). Blijfintentie krijgt nu ook een label.
- Vertrekintentie (hoger is slechter): gebruik de zonelabels van de spreidingsstrook voor vertrekintentie (`_ZONE_LABELS_INVERT` in `backend/report_distribution.py:62`, met dezelfde zonefunctie die de strook gebruikt), kleine letter, en noem de middelste `vraagt aandacht`. Zo zeggen label en strook altijd hetzelfde.
- `_RETENTION_BANDS` (151-155) wordt `("Onder druk", ...)`, `("Vraagt aandacht", ...)`, `("Relatief sterk", ...)` met dezelfde kleuren. Dat is de band onder de tegel op p.02. De kop van p.02 ("Behoud vraagt aandacht op ...", `_P02_DRUKWOORD`) blijft.
- Gevolg om in het verslag te melden: bevlogenheid had eigen grenzen (7,5 / 6,0 / 4,5) en krijgt de grenzen van zijn eigen kleur (5,0 / 6,5).

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_werkbeeld.py`:
```python
"""Spec 2026-10-09 par. 2 en R20/R12: de score heet Werkbeeld, met een eerlijke
uitleg, en de vier cijfers op p.03 gebruiken de bandlabels van de rest van het rapport."""
import re

from scripts import stresstest_report as st

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def test_geen_behoudssignaal_meer_in_een_behoudrapport():
    html = _html("02_een_lage_factor")
    assert "ehoudssignaal" not in html and "EHOUDSSIGNAAL" not in html


def test_tegel_op_pagina_twee_heet_werkbeeld_met_uitleg():
    t = _tekst(_html("02_een_lage_factor"))
    assert "Werkbeeld" in t
    assert "De zes werkonderwerpen en de werkbeleving samen; geen meting van of mensen blijven." in t


def test_uitleg_is_waar_en_noemt_geen_gemiddelde_van_zes():
    t = _tekst(_html("02_een_lage_factor"))
    assert "gemiddelde van de zes" not in t


def test_vertrekrapport_en_startrapport_houden_hun_eigen_naam():
    assert "Frictiescore" in _html("08_exit_n12") and "Werkbeeld" not in _html("08_exit_n12")
    assert "Checkpointscore" in _html("20_onboarding_sanity")
    assert "Werkbeeld" not in _html("20_onboarding_sanity")


def test_vertrekrapport_gebruikt_werkbeeld_niet_als_los_woord():
    assert "werkbeeld" not in _html("08_exit_n12").lower()


def test_p03_labels_uit_een_set():
    html = _html("02_een_lage_factor")
    notes = re.findall(r'class="sigrow-note"[^>]*>(.*?)<', html)
    toegestaan = {"onder druk", "vraagt aandacht", "relatief sterk",
                  "veel vertrekgedachten", "weinig vertrekgedachten"}
    assert len(notes) == 4, notes
    for note in notes:
        assert note.strip().lower() in toegestaan, note
```
Controleer de werkelijke klassenaam van het label per rij op p.03 (`_behoudscontext`; de tests in `test_report_signal_polarity.py` gebruiken `sigrow-note`) en de scenariosleutels (`$PY scripts/stresstest_report.py --list`).

- [ ] **Stap 2: Zie ze falen.** `$PY -m pytest tests/test_polijstronde_werkbeeld.py -q`

- [ ] **Stap 3: Implementatie** volgens de tabel en de bandlabels hierboven. `_p02_signal_cell(label, value, band, note: str = "")` krijgt een optionele vierde parameter; met een `note` komt er onder de band `<div class="sc-n">{_h(note)}</div>`. In `report_css.py` naast `.sc-b`: `.sc-n { font-size: 10px; color: #475569; margin-top: 3px; line-height: 1.35; }` (10px is de leesbaarheidsondergrens voor uitlegregels, zie de beslissing van 2026-07-09). Alleen Loep Behoud geeft een `note` mee. Werk de docstrings op 163 en 193 bij ("werkbeeld / checkpointscore"). In `frontend/lib/action-center-live.ts:60` alleen het woord.

- [ ] **Stap 4: Tests groen, lockstep** in de genoemde bestanden. In `test_report_signal_polarity.py:126` staat `RET_DEF["signal_label"] == "Retentiesignaal"`: dat is de interne definitie en blijft groen; niet aanraken.

- [ ] **Stap 5: Backend- en frontend-faalset.** Beide zonder regressie.

- [ ] **Stap 6: Commit** (`feat(rapport): Behoudssignaal heet Werkbeeld, met eerlijke uitleg; een bandset op p.03`).

---

## Taak 4: kernzin, leidraad en afdelingsregel (R13, R21, R27, S3, S11)

**Files:**
- Modify: `backend/report_html.py` (`_p02_opening` 575-694, `INTENTIE_DUIDING_KERN` 903, `_leidraad_block` 1820-1932, `_leidraad_html` 1935-1969, `PATROONVRAAG_VERTREK` 1812, `BESLUIT_AFDELING_SAMEN` 3777, de drie renderers voor de nieuwe argumenten)
- Create: `tests/test_polijstronde_p02_kernzin.py`
- Lockstep: `tests/test_report_p02_kernzin.py:170-178` (R13), `tests/test_report_leesronde_fixes.py:52, 182-184, 743` (R21, R27), `tests/test_report_onboarding_eerlijk.py:180-191` (S11), alle tests die `PATROONVRAAG_VERTREK` importeren (`grep -rn PATROONVRAAG_VERTREK tests backend`)

**R13.** In de inkortlogica van `_p02_opening` (678-693): is er precies één kwetsbaar onderwerp, is dat het startpunt, en verhindert alleen de aandachtspuntenzin het inkorten, dan vervangt `Het gesprek begint bij het kwetsbare onderwerp.` (indicatief: `Het gesprek begint waarschijnlijk bij het kwetsbare onderwerp.`) de zin `Als startpunt kiest Loep {label}.` Geen "Daar": dat zou naar de aandachtspunten wijzen. Is het startpunt een ander onderwerp dan het laagste, dan blijft de bestaande zin.

**R27.** `INTENTIE_DUIDING_KERN` wordt:
`Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet bij welke afdeling het speelt of waarom, en ook niet wie er vertrekt: dit rapport splitst ze niet per afdeling uit.`
De reden waarom niet per afdeling is aan Lars (zie de afwijkingenlijst bovenaan); niet verzinnen.

**R21.**
- Leidraad, slot 31-45 minuten, achter de parkeerzin (alleen als `has_tweede_punt`): `Vul op de besluitpagina ook de terugkoppeling in, ook als je het tweede punt parkeert.` Is er een aangewezen afdeling (nieuwe vlag `has_afdeling_afspraak`, doorgegeven via `_leidraad_html` vanuit de renderers, waar is bepaald of de besluitpagina een afdelingsblok krijgt), dan: `Vul op de besluitpagina ook de afdelingsafspraak en de terugkoppeling in, ook als je het tweede punt parkeert.`
- Besluitpagina: `BESLUIT_AFDELING_SAMEN` wordt `Dit onderwerp is ook het tweede punt. Ook als jullie dat parkeren: spreek hier af wie de afdeling vraagt, en wanneer.`

**S3.** Begint de kernzin met `Geen onderwerp scoort kwetsbaar.`, en is in minstens één afdeling op de afdelingspagina het laagste onderwerp wél kwetsbaar, dan komt er één zin achter de kernzin:
- alle zulke afdelingen hebben het startpunt als laagste onderwerp: `In {k} {afdeling|afdelingen} is {label} daar wel een kwetsbaar punt (pagina {pref afdelingen}).`
- anders: `In {k} {afdeling|afdelingen} scoort het laagste onderwerp daar wel kwetsbaar (pagina {pref afdelingen}).`
Telregel: tel alleen afdelingen uit `data["segment_factor_rows"]` waarvan het eerste (laagste) onderwerp op de getoonde score onder 5,0 ligt; dat is precies wat de afdelingspagina als label toont (ook bij 5 tot 9 antwoorden). Tel nooit een ander onderwerp van een kleine afdeling: dat staat niet op de afdelingspagina. Geef `segment_factor_rows` als nieuw argument aan `_p02_opening` door. Getal met `_TELWOORD` ("twee afdelingen"). Werkt voor alle drie de scans.

**S11 (Loep Start).** Leidraadrij 12-25 minuten, als er open antwoorden zijn (`has_quotes`) én de rij "Wat mensen zelf schreven" niet al naar de open antwoorden verwijst:
`Het startpunt: de score en de laagste stelling (pagina {p5}). Open met de gespreksopener hierboven. Het waarom staat in de open antwoorden (pagina {pT}); vraag: wat komt terug in meer dan één antwoord?`
Hernoem `PATROONVRAAG_VERTREK` naar `PATROONVRAAG` (zelfde tekst) en werk alle verwijzingen bij. Het woord "verdieping" mag niet in de Loep Start-leidraad staan (`test_report_onboarding_eerlijk.py:180-191`).

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_p02_kernzin.py`:
```python
"""R13, R21, R27, S3 en S11: pagina twee en de besluitpagina."""
import re

from backend.report_html import BESLUIT_AFDELING_SAMEN, INTENTIE_DUIDING_KERN, PATROONVRAAG
from scripts import stresstest_report as st

_CACHE: dict[str, str] = {}


def _html(key):
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def _p02(html):
    t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
    return t[: t.index("Zo gebruik je dit rapport")] if "Zo gebruik je dit rapport" in t else t


def test_r27_geen_voorspelling():
    assert "en ook niet wie er vertrekt" in INTENTIE_DUIDING_KERN


def test_r21_besluitpagina_ook_bij_parkeren():
    assert "Ook als jullie dat parkeren: spreek hier af wie de afdeling vraagt" in BESLUIT_AFDELING_SAMEN


def test_patroonvraag_hernoemd():
    assert PATROONVRAAG == "wat komt terug in meer dan één antwoord?"


def test_r13_startpunt_niet_twee_keer_genoemd():
    html = _html("02_een_lage_factor")
    t = _p02(html)
    # Eén kwetsbaar onderwerp dat ook het startpunt is: geen "Als startpunt kiest Loep".
    if "op één kwetsbaar onderwerp" in t:
        assert "Als startpunt kiest Loep" not in t
        assert "Het gesprek begint" in t


def test_s3_start_noemt_kwetsbare_afdelingen():
    t = _p02(_html("20_onboarding_sanity"))
    if "Geen onderwerp scoort kwetsbaar." in t:
        assert re.search(r"In (een|twee|drie|vier|vijf|\d+) afdeling(en)? ", t), t[:600]
```
Pas de scenario's aan als `02_een_lage_factor`/`20_onboarding_sanity` het geval niet bevatten (`docs/stresstest/*.meta.json` laat de factorgemiddelden en afdelingen zien); maak de conditionele `if` dan hard (`assert`) zodra je een scenario hebt dat het geval zeker toont. Een test die door een `if` nooit iets controleert, telt niet: de review controleert dat elke test minstens één assert uitvoert. Voeg daarnaast een eenheidstest toe die `_p02_opening` direct aanroept met een synthetische `segment_factor_rows` (twee afdelingen, laagste onderwerp 4.6 en 4.8 op het startpunt) en de exacte zin `In twee afdelingen is ... daar wel een kwetsbaar punt (pagina` controleert; bekijk de signatuur van `_p02_opening` en hoe `tests/test_report_p02_kernzin.py` hem aanroept.

Voeg voor S11 een test toe naar het patroon van `tests/test_report_onboarding_eerlijk.py:180-191` die controleert dat de Loep Start-leidraad (met open antwoorden, zonder afdelingen) `Het waarom staat in de open antwoorden (pagina` bevat en een `href="#sec-toelichtingen"`, en dat "verdieping" er niet in staat.

- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie** volgens de beschrijving hierboven.
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(p02): startpunt een keer genoemd, kwetsbare afdelingen benoemd, open antwoorden in de Start-leidraad`).

Pagina twee moet op één A4 blijven; dat meet Taak 11 in het productie-image.

---

## Taak 5: de richtingkaart (R7, V7, R19, R22, V10, R23)

**Files:**
- Modify: `backend/report_html.py` (`_direction_card_cell` 3327-3456, `_wat_moet_gebeuren_block` 3459-3496, `_richtingen_weging` 3573-3626, `_drempeltabel` 4553-4563, de verdiepingsopeners in de drie renderers rond 6786, 7205 en de onboarding-tegenhanger)
- Modify: `backend/report_css.py` (`.dir-niets`, `.dir-unchosen`, `.dir-intro`/`.dir-totals`)
- Create: `tests/test_polijstronde_kaart.py`
- Lockstep: card-goldens in `tests/test_direction_niets_apart.py:68-78`, `tests/test_direction_report_block.py:46, 89, 128-140`, `tests/test_report_leesronde_fixes.py:1035-1090`, `tests/test_geen_hierboven.py:34-41`, `tests/test_report_tellingen.py:183`

**R7 en V7: twee tellingen op één pagina.** Elke verdiepingspagina krijgt een eigen anker: `_verdieping_anker(fk) -> str` geeft `"sec-verdieping-" + fk`. De eerste verdiepingspagina houdt `LEIDRAAD_ANKERS["verdieping"]` op zijn kop en krijgt direct erna `<span id="sec-verdieping-{fk}"></span>`; volgende pagina's krijgen het id op hun `slabel` (`_ChapterCounter.sub` krijgt een optioneel `anchor`). `_wat_moet_gebeuren_block` en `_direction_card_cell` krijgen het verdiepingsaggregaat van het onderwerp mee (`deep_answered: int | None`) en of er voor dat onderwerp een verdiepingspagina in het rapport staat. Zijn beide waar en is `deep_answered > 0`, dan komt er onder de keten van de kaart:
`Dit is een andere telling dan de {deep_answered} bij de toelichting op pagina {pref}: daar gaat het om wie op dit onderwerp duidelijk laag antwoordde, hier om wie dit als eigen laagste onderwerp had.`
("telling", niet "groep": de twee groepen kunnen overlappen.) De `_pref` staat buiten de `_h()`-geëscapete tekst.

**R22: "Niets" apart.** In de kaarttabel staan eerst de veranderopties (op aantal, `*_other` meegerekend), dan een scheidingsrij met de niets-optie, klasse `dir-niets` (ook bij 0 stemmen, zolang de factor een niets-optie heeft). In `report_css.py`, naast `.dir-tbl td` (regel ~367): `.dir-tbl tr.dir-niets td { border-top: 1px solid #CBD5E1; padding-top: 5px; }`.
De vertaalzin in `_richtingen_weging` noemt de richtingen bij naam, gegroepeerd per aantal, voor de twee hoogste aantallen:
`De meest gekozen richtingen op de kaart bij ‘Wat er moet gebeuren’ zijn ‘{A}’ ({3}) en ‘{B}’, ‘{C}’ en ‘{D}’ (elk {2}).`
(Eén richting per aantal: `‘{A}’ ({3})`; meerdere: opsomming met komma's en "en", dan `(elk {n})`.) De bestaande zin over de niets-optie blijft erachter. Het commentaar op 3608-3610 (namen weggelaten voor de paginaruimte) wordt vervangen door een verwijzing naar R22 en naar de terugvaloptie in Taak 11.

**R19: niet gekozen opties.** Onder de tabel, klasse `dir-unchosen`: `Niet gekozen: ‘{X}’, ‘{Y}’ en ‘{Z}’.` met alle richtingen uit `direction_option_texts(scan_type, factor_key)` die 0 stemmen kregen, zonder de niets-optie (die staat nu in zijn eigen rij) en zonder "Anders". Geen regel als alles gekozen is. CSS: `.dir-unchosen { font-size: 10px; color: #64748B; margin-top: 4px; line-height: 1.4; }`.
Versiecontrole: kijk of de richtingopties een versie dragen (`question_set_version` of vergelijkbaar in `DIRECTION_SETS` of in de opgeslagen `direction_response`). Bestaat er maar één versie, noteer dat in het commitbericht. Bestaan er meer, toon de regel alleen als alle antwoorden voor dit onderwerp de huidige versie hadden.

**V10: voorbehoud op de echte basis.** De beperkte-basis-regel (`_beperkte_basis_note()`) komt onder de kaart als `n <= DIRECTION_CAVEAT_MAX_N` (zoals nu), **of** als de staat `clear` of `plurality` is en `change_n < MIN_AGGREGATE_N` (10, `backend/scoring_config.py:53`; dezelfde grens als de beperkte-basis-regel bij HERKENNEN op dezelfde pagina). `DIRECTION_CAVEAT_MAX_N` zelf blijft ongewijzigd. Drempeltabel (4553-4563): vervang `bij drie of vier antwoorden staat er een beperkte-basis-regel bij` door `bij drie of vier antwoorden, en bij een richting die op minder dan tien veranderkeuzes rust, staat er een beperkte-basis-regel bij`.

**R23: kop bij de kaarten.** In `report_css.py`: `.dir-intro, .dir-totals { break-after: avoid; page-break-after: avoid; }`. Laat `.dir-block` zonder `break-inside: avoid` (het commentaar op 336-347 legt uit waarom: scenario 14). Taak 11 meet scenario 14 opnieuw.

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_kaart.py`:
```python
"""R7/V7, R19, R22, V10 en R23: de richtingkaart."""
import re

import pytest

from backend.products.shared.deepening import direction_option_texts
from backend.report_html import _direction_card_cell, _drempeltabel
from backend.report_css import REPORT_CSS  # controleer de naam van de CSS-constante
from scripts import stresstest_report as st

FK = "growth"


def _keys(scan_type):
    keys = list(direction_option_texts(scan_type, FK))
    none_key = next(k for k in keys if k.endswith("_none"))
    routes = [k for k in keys if not k.endswith(("_none", "_other"))]
    return none_key, routes


def _agg(counts):
    n = sum(counts.values())
    return {"answered": n, "counts": counts, "other_texts": [], "lowest_n": n,
            "offered": n, "skipped": 0}


def _kaart(counts, scan_type="retention", **kw):
    a = _agg(counts)
    return _direction_card_cell("startpunt", label="Groeiperspectief", agg=a,
                                scan_type=scan_type, factor_key=FK,
                                n_total=a["answered"], factor_score=4.7, **kw)


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niets_staat_onder_de_richtingen(scan_type):
    none_key, (a, b, *_r) = _keys(scan_type)
    html = _kaart({a: 3, b: 2, none_key: 2}, scan_type)
    rijen = re.findall(r"<tr(?: class=\"([^\"]*)\")?>", html)
    assert rijen[-1] == "dir-niets"


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niets_rij_ook_bij_nul(scan_type):
    _n, (a, b, *_r) = _keys(scan_type)
    assert 'class="dir-niets"' in _kaart({a: 11, b: 4}, scan_type)


@pytest.mark.parametrize("scan_type", ["retention", "exit"])
def test_niet_gekozen_opties_in_een_regel(scan_type):
    _n, (a, b, *rest) = _keys(scan_type)
    html = _kaart({a: 11, b: 4}, scan_type)
    m = re.search(r'<div class="dir-unchosen">(.*?)</div>', html)
    assert m and m.group(1).startswith("Niet gekozen: ")
    teksten = direction_option_texts(scan_type, FK)
    for k in rest:
        assert teksten[k] in m.group(1)


def test_voorbehoud_bij_richting_op_weinig_veranderkeuzes():
    none_key, (a, b, *_r) = _keys("exit")
    # Vertrek p.11: 4 van de 5 die om verandering vroegen, 3 kozen niets.
    html = _kaart({a: 4, b: 1, none_key: 3}, "exit")
    assert "Beperkte basis" in html


def test_geen_voorbehoud_vanaf_tien_veranderkeuzes():
    _n, (a, b, *_r) = _keys("retention")
    assert "Beperkte basis" not in _kaart({a: 8, b: 3}, "retention")


def test_drempeltabel_noemt_de_nieuwe_voorbehoudregel():
    tekst = re.sub(r"<[^>]+>", " ", _drempeltabel("retention", direction_active=True,
                   direction_degraded=False, deepening_active=True, ranking_active=True))
    assert "minder dan tien veranderkeuzes" in re.sub(r"\s+", " ", tekst)


def test_kop_blijft_bij_de_kaarten():
    css = re.sub(r"\s+", " ", REPORT_CSS)
    assert re.search(r"\.dir-intro, \.dir-totals \{[^}]*break-after: avoid", css)


def test_tweede_telling_verwijst_naar_de_toelichting():
    sc = {s.key: s for s in st.SCENARIOS}["02_een_lage_factor"]
    html = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    assert "Dit is een andere telling dan de" in html
    assert 'href="#sec-verdieping-' in html
    for anker in set(re.findall(r'href="#(sec-verdieping-[a-z_]+)"', html)):
        assert f'id="{anker}"' in html
```
Controleer de werkelijke namen (CSS-constante in `report_css.py`, de klasse van de beperkte-basis-regel, de signatuur van `_drempeltabel`) en pas de imports aan. Kies voor `test_tweede_telling_verwijst_naar_de_toelichting` een scenario waarin het startpunt een verdiepingspagina heeft (meta.json: `deepening_agg`).

- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie** volgens de beschrijving hierboven.
- [ ] **Stap 4: Tests groen, lockstep.** De kaart-goldens in `test_direction_niets_apart.py` krijgen de nieuwe tabelvorm (niets-rij, eventueel niet-gekozen-regel); de test die zegt "zonder niets-stemmen byte-gelijk" verandert in "zonder niets-stemmen alleen de niets-rij met 0 en de niet-gekozen-regel erbij"; houd het bewijs dat de rest van de zin niet verandert.
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(agenda): niets apart, niet gekozen opties, twee tellingen uitgelegd, voorbehoud op de echte basis`).

---

## Taak 6: rangorde, onderwerppagina's en jargon (R9, R10, R11, R17, R24, R25, R26)

**Files:**
- Modify: `backend/report_html.py` (`_overzicht_summary_and_bands` 5886-5943, `_werkbeleving_section` 6228-6303, `_behoudscontext` 6100-6101 en 6132, kickers 6676/7113/6157/6169, gedegradeerde p.02 7010/7057, `raster_intro` 2510, `_trigger_regel` 4226-4240, `_prioriteringsraster` 2740-2748, de drie aanroepen van `distribution_block` op 6753/7176/7614)
- Modify: `backend/report_priority.py:44` (`CELL_TOO_FEW`), `backend/report_css.py:41` (voettekst), `backend/report_distribution.py` (`polarized`)
- Create: `tests/test_polijstronde_onderwerpen.py`
- Lockstep: `tests/test_report_plan3a_nafixes.py:61-66` (R9), `tests/test_report_html_design.py:127-135` (kicker Vertrek), `tests/test_deepening_report.py:133` en `tests/test_report_tellingen.py:30, 768-769` (R25), `tests/test_report_drempels_en_koppen.py:234-236`, `tests/test_report_priority_render.py:164-167` (R26), `tests/test_report_distribution.py:11-58, 128` en `tests/test_report_distribution_invert.py:149` (R17)

**R9.** Hebben meerdere relatief sterke onderwerpen dezelfde getoonde hoogste score, dan: `{Telwoord} onderwerpen vormen een relatief sterke basis (alle {telwoord} {score}).`, bij twee `Twee onderwerpen vormen een relatief sterke basis (allebei {score}).` Is de hoogste uniek, dan blijft de bestaande zin met dat ene onderwerp. Vergelijk op `_shown(score)`.

**R10.** In `_werkbeleving_section`, na de drie dimensies, één zin afhankelijk van de data (de intro met "met een gezonde werkbeleving" blijft):
- alle drie onder 6,5: `Hier staat de werkbeleving zelf ook onder druk: geen van de drie scoort relatief sterk.`
- alle drie vanaf 6,5: `Hier scoort de werkbeleving op alle drie relatief sterk.`
- gemengd: geen zin.

**R11 (jargon), alle drie de scans:**
| Nu | Wordt |
|---|---|
| kicker `Behoudscontext`, `Behoudscontext (vervolg)` | `Blijven en vertrekken`, `Blijven en vertrekken (vervolg)` |
| gedegradeerde p.02: `de behoudscontext op de volgende pagina`, `Zie de behoudscontext ...` | `de cijfers over blijven en vertrekken op de volgende pagina`, `Zie de cijfers over blijven en vertrekken ...` |
| kicker `Vertrekcontext` | `Waarom mensen vertrokken` |
| `Enkelvoudige richtingsvraag, indicatief.` | `Eén vraag; lees hem als indicatie.` (met `&eacute;` waar de tekst ongeëscaped rendert) |
| `... Zin om te gaan (UWES). ...` | zonder `(UWES)` |
| `De bespreking beslist; dit raster structureert.` | `Het MT beslist; de rangorde helpt alleen ordenen.` |
| `CELL_TOO_FEW = "te weinig beantwoorders voor duiding"` | `"te weinig antwoorden om iets over te zeggen"` |
| voettekst `VERTROUWELIJK · LOEP · GROEPSOUTPUT` | `VERTROUWELIJK · LOEP · ALLEEN GROEPSCIJFERS` |
Zoek daarna in `report_html.py` naar klantzichtbare restanten van hetzelfde soort (`grep -n -i "duiding\|structureert\|indicatief\|output" backend/report_html.py`) en vervang alleen wat de klant leest; noem elke extra vervanging in het commitbericht.

**R17.** `polarized` in `report_distribution.py` krijgt een extra voorwaarde: de middengroep is kleiner dan elk van beide buitengroepen (`mid < low and mid < high`). 4/2/4 blijft verdeeld; 15/14/10 niet meer.

**R24.** De drie aanroepen op de onderwerppagina's krijgen `width=660`, net als de aanroep in `_behoudscontext` (6150). Controleer in de SVG-functie dat de labels binnen die breedte vallen.

**R25.** `_trigger_regel` wordt:
`Duidelijk laag: op de antwoordschaal van de vragenlijst (1 is ‘helemaal niet’, 5 is ‘helemaal wel’) gemiddeld 2,5 of lager, minstens twee stellingen op 2 of lager, of een 1 bij gemiddeld hoogstens 3,5. De andere scores in dit rapport zijn omgerekend naar 1 tot 10.`
De getallen blijven uit de constanten (`TRIGGER_AVG_MAX` enz.). De antwoordlabels staan in `templates/survey/shared-org.html:16` ("Helemaal niet" / "Helemaal wel"); controleer ze.

**R26.** De bijna-gelijkregel onder het raster bouwt groepen uit opeenvolgende `near_tie_with`-koppelingen. Per groep: zijn alle getoonde scores gelijk, `{A}, {B} en {C} staan gelijk op {score}.`; anders `{A}, {B} en {C} staan in de rangorde vrijwel gelijk ({min} tot {max}).` ("in de rangorde": bijna-gelijk gaat over de rangschikking, die bij Vertrek ook de vertrekredenen weegt). Groepen gescheiden door een spatie; elke groep een eigen zin.

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_onderwerpen.py`:
```python
"""R9, R10, R11, R17, R24, R25, R26."""
import re

from backend.report_distribution import compute_distribution  # controleer de naam
from backend.report_html import _overzicht_summary_and_bands, _trigger_regel
from backend.report_priority import CELL_TOO_FEW
from scripts import stresstest_report as st

_CACHE: dict[str, str] = {}


def _html(key):
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        _CACHE[key] = open(st.run_scenario(sc)["html"], encoding="utf-8").read()
    return _CACHE[key]


def test_r9_drie_gelijke_sterke_onderwerpen():
    ranked = [("A", 4.7), ("B", 5.6), ("C", 7.1), ("D", 7.1), ("E", 7.1)]
    summary, _bands = _overzicht_summary_and_bands(ranked)  # controleer signatuur
    assert "Drie onderwerpen vormen een relatief sterke basis (alle drie 7.1)." in summary


def test_r17_middengroep_niet_dun_is_niet_verdeeld():
    vals = [3.0] * 15 + [5.8] * 14 + [8.0] * 10
    assert compute_distribution(vals)["polarized"] is False
    vals = [3.0] * 4 + [5.8] * 2 + [8.0] * 4
    assert compute_distribution(vals)["polarized"] is True


def test_r25_regel_legt_de_schaal_uit():
    regel = _trigger_regel()
    assert "1 is ‘helemaal niet’, 5 is ‘helemaal wel’" in regel
    assert "omgerekend naar 1 tot 10" in regel


def test_r11_geen_jargon_meer():
    for key in ("02_een_lage_factor", "08_exit_n12", "20_onboarding_sanity"):
        t = re.sub(r"<[^>]+>", " ", _html(key))
        for woord in ("Behoudscontext", "BEHOUDSCONTEXT", "Vertrekcontext", "UWES",
                      "Enkelvoudige", "structureert", "GROEPSOUTPUT", "beantwoorders voor duiding"):
            assert woord not in t, (key, woord)
    assert CELL_TOO_FEW == "te weinig antwoorden om iets over te zeggen"


def test_r24_strook_op_volle_breedte():
    html = _html("02_een_lage_factor")
    assert 'width="440"' not in html
```
Pas namen en signaturen aan na het lezen van de code. Voeg voor R10 en R26 eenheidstests toe met synthetische invoer (drie dimensies onder 6,5; een groep van drie bijna-gelijke rijen met gelijke en ongelijke getoonde scores). Voeg voor R10 een test toe dat bij gemengde waarden geen van beide zinnen verschijnt.

- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie.**
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(rapport): gelijke scores eerlijk benoemd, werkbeleving geduid, gewone woorden, schaal uitgelegd`).

---

## Taak 7: afdelingen (R14, S9)

**Files:**
- Modify: `backend/report_html.py` (`SECTION_INTROS["segmentanalyse"]` 1679-1690, `_segment_block` 5198-5321, `_segment_start_note` 5033-5191)
- Create: `tests/test_polijstronde_afdelingen.py`
- Lockstep: `tests/test_report_segment_startpunt.py:125, 142, 153, 179, 205, 234, 328`, `tests/test_report_startpuntverhaal.py:225`

**R14.** Intro: `De kolom met het laagste onderwerp ...` wordt `In de kolom met het laagste onderwerp tonen we bij kleine afdelingen (5 tot 9 antwoorden) bewust alleen een duidingslabel, geen cijfer achter de komma; alle onderwerpen per afdeling met hun scores staan er vanaf 10 antwoorden.` (de rest van de intro blijft). Daarachter één zin per scan over de scorekolom, doorgegeven als argument aan `_segment_block` (de intro wordt nu statisch gerenderd; geef `_segment_block` een `scan_type` mee als hij die nog niet heeft):
- retention: `De kolom Werkbeeld is het werkbeeld van pagina 2, per afdeling.`
- onboarding: `De kolom Checkpointscore is de checkpointscore van pagina 2, per afdeling.`
- exit: `De kolom Score is per afdeling de frictiescore van pagina 2, maar omgedraaid: hier is hoger beter.`
Kolomkop `Score` wordt `Werkbeeld` (retention), `Checkpointscore` (onboarding), `Score` (exit). Controleer de breedte van de kopcel (8%) en verbreed indien nodig ten koste van de kolom "Laagste onderwerp".

**S9.** In `_segment_start_note`: geen `x.x/10` meer bij een afdeling met minder dan `MIN_DISTRIBUTION_N` (10) antwoorden, en ook niet bij de restgroep als die minder dan 10 heeft. Concreet:
- `liggen dicht bij elkaar (Sales 6.0/10 en Operations 6.2/10)` wordt, als minstens één van de twee onder de 10 zit, `liggen dicht bij elkaar (Sales en Operations)`; hebben beide 10 of meer, dan blijven de cijfers.
- idem `komen op dezelfde score uit (... beide 6.0/10)`, staat 2 (`({low_sc:.1f}/10)`) en de restgroepzin.
Het gate is per afdeling, met dezelfde constante als de staffel in `_segment_theme_cell` (regel ~4836). Nooit een cijfer toevoegen dat er nu niet staat.

- [ ] **Stap 1: Falende tests** in `tests/test_polijstronde_afdelingen.py`: (a) `_segment_start_note` met twee afdelingen van 7 en 5 antwoorden die dicht bij elkaar liggen bevat `(Sales en Operations)` en geen `/10`; (b) dezelfde met 12 en 11 antwoorden bevat wel beide cijfers; (c) een gerenderde Behoud-afdelingstabel heeft de kop `Werkbeeld`, Start `Checkpointscore`, Vertrek `Score` plus de omgedraaid-zin. Bouw de invoer zoals `tests/test_report_segment_startpunt.py` dat doet.
- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie.**
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(afdelingen): kolomkop zegt welke score, geen cijfers van kleine afdelingen in de conclusie`).

---

## Taak 8: methodiek en besluitpagina (R16, V14, S10, S6, S4)

**Files:**
- Modify: `backend/report_html.py` (`BESLUIT_TERUGKOPPELING` 3790-3798, `BESLUIT_REVIEW_HINT` 3737-3743, `_besluit_page` 3866-4039, `_checkpointoverzicht` 7330-7332, `_trust_page` 4648, aanroepen van `_besluit_page` in de drie renderers)
- Modify: `backend/report_css.py` (`.tg`, regel ~428)
- Modify: `frontend/lib/dashboard/campaign-decision.ts` (`DECISION_FEEDBACK_HINTS`, `DECISION_REVIEW_HINTS`), `frontend/lib/dashboard/campaign-decision.test.ts:263-270`
- Create: `tests/test_polijstronde_besluit.py`
- Lockstep: `tests/test_report_leesronde_fixes.py:921-931, 973-982, 985-988, 1008-1009`, `tests/test_report_besluitpagina.py:229`

**R16.** `.tg` krijgt `break-inside: avoid; page-break-inside: avoid;` (zelfde patroon als `.dir-grid`, regel 356). Taak 11 meet de paginavulling van de methodiekpagina's.

**V14 en S10: terugkoppelingsregel.** Vervang de dict door een functie:
```python
BESLUIT_TERUGKOPPELING_BASIS = {
    "retention": ("Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. "
                  "Deel geen open antwoorden"),
    "exit": ("Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met "
             "de vertrekredenen doet. Deel geen open antwoorden"),
    "onboarding": ("Je mensen vulden in; ze horen wat het MT ermee doet. Deel het startpunt, het "
                   "beeld van de hele groep en wat het MT besluit. Deel geen open antwoorden"),
}


def besluit_terugkoppeling(scan_type: str, heeft_afdelingen: bool) -> str:
    """Terugkoppelingsregel op de besluitpagina. Het afdelingsdeel staat er alleen
    als het rapport afdelingen toont (V14); het dashboard weet dat niet en toont
    altijd de volledige regel."""
    staart = (" en geen uitkomsten van afdelingen met minder dan "
              + str(MIN_DISTRIBUTION_N) + " antwoorden.") if heeft_afdelingen else "."
    return BESLUIT_TERUGKOPPELING_BASIS[scan_type] + staart
```
`_besluit_page` krijgt `heeft_afdelingen: bool` (de renderers geven `bool(data.get("segment_rows"))` mee). Het dashboard (`DECISION_FEEDBACK_HINTS`) krijgt per scan exact `besluit_terugkoppeling(scan, True)`; de pariteitstest in `test_report_leesronde_fixes.py:1008` vergelijkt daarmee.

**S6.** `BESLUIT_REVIEW_HINT["onboarding"]` wordt `Richtlijn: rond het volgende checkpoint, ongeveer 30 dagen na dit gesprek.` Dashboard `DECISION_REVIEW_HINTS.onboarding` in lockstep.

**S4.** `een volgende meting bespreken we los` wordt `een volgende meting bespreek je los` (7332), en `Een volgende meting bespreken we los van dit rapport.` wordt `Een volgende meting bespreek je los van dit rapport.` (4648).

- [ ] **Stap 1: Falende tests** in `tests/test_polijstronde_besluit.py`: `besluit_terugkoppeling("exit", False)` eindigt op `Deel geen open antwoorden.`; `("exit", True)` eindigt op `met minder dan 10 antwoorden.`; `("onboarding", True)` bevat `Deel geen open antwoorden en geen uitkomsten van afdelingen`; gerenderde Vertrek zonder afdelingen (`08_exit_n12`) bevat het afdelingsdeel niet op de besluitpagina; de CSS bevat `break-inside: avoid` binnen de `.tg`-regel; geen "bespreken we" meer in een gerenderd Start-rapport. Vul de frontendtest in `campaign-decision.test.ts` aan met de nieuwe Start-termijn.
- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie** (backend en frontend in dezelfde commit).
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend- en frontend-faalset.**
- [ ] **Stap 6: Commit** (`feat(besluit): terugkoppelingsregel per rapport, Loep Start met grens en termijn; methodiekkaarten niet gesplitst`).

---

## Taak 9: Loep Vertrek (V3, V11, V12, V13, V15, V16)

**Files:**
- Modify: `backend/report_html.py` (`_vertrekcontext` 6004-6070 en zijn aanroep 6672-6680, `_uitstroomperiode` 1320-1369, `_werkvragen_block` 3639, `_direction_totals_line` 3276-3291, `_appendix_section` 6306-6366 en de aanroepen, `_EXIT_BANDS` 146-150, `_frictie_duiding` 961-979, `build_report_data` 5568-5571, `_enps_block` 6212-6225 en de drie aanroepen, `LEIDRAAD_ANKERS`)
- Modify: `backend/products/shared/deepening.py:708` (één exit-werkvraag)
- Create: `tests/test_polijstronde_vertrek.py`
- Lockstep: `tests/test_report_exit_kernzin.py:161-173`, `tests/test_work_questions_content.py` (`A1_SLOTEN`, `EXIT_SHA_NA_A1`, `TERUGBLIK_VORMEN`, de veertien-test), `tests/test_report_tellingen.py:352-354, 375, 414, 526-543`, `tests/test_report_signal_polarity.py:61`, `tests/test_report_band_rounding.py:100-110`, `tests/test_report_leesronde_fixes.py:342-381`, `tests/test_report_paginavulling.py:36-52`

**V3.** `_vertrekcontext` krijgt de factorgemiddelden en de redencodes mee (nu alleen (label, aantal)). Een reden "loopt uit elkaar met de scores" als: de code via `FACTOR_EXIT_CODE` (259-262) bij een onderwerp hoort, de reden door minstens `MIN_SEGMENT_N` (5) mensen genoemd is (hoofdreden en "speelde ook mee" opgeteld), en dat onderwerp op de getoonde score relatief sterk is (vanaf 6,5). Gebruik volledige tellingen; is `cont_dist` beperkt tot de top 5, voeg in `build_report_data` een volledige telling toe (`cont_counts`) uit dezelfde bron. Maximaal twee redenen, hoogste aantal eerst. Per reden één zin, vóór de bestaande zin "De meest genoemde hoofdreden en de scores per onderwerp belichten elk een eigen invalshoek.":
`{Label} werd {n} keer genoemd als reden ({h} keer als hoofdreden, {m} keer als reden die meespeelde), maar scoort als onderwerp {score} (relatief sterk): hier lopen redenen en scores uit elkaar.`
Laat het deel tussen haakjes weg als een van beide 0 is (`{n} keer genoemd als hoofdreden` of `als reden die meespeelde`). Geen verbandclaim, geen advies.

**V11.** Eén tijdsanker met het woord van pagina twee.
1. `deepening.py:708` (startpunt grd_visibility, exit): `Stond dat er een jaar geleden ook?` wordt `En in de periode waar deze meting over gaat?`. Werk `A1_SLOTEN` (nu vijftien vragen met dit anker), `EXIT_SHA_NA_A1` en de veertien-test bij (hernoem naar "vijftien"); haal "een jaar geleden" uit `TERUGBLIK_VORMEN` als het nergens meer voorkomt.
2. Splits `_uitstroomperiode` in een helper `_uitstroom_bereik(exit_months, n) -> tuple[str, str] | None` (zelfde gate: minstens `MIN_SEGMENT_N` bekende maanden, randmaanden elk minstens `UITSTROOM_RAND_MIN`) en de bestaande regel die hem gebruikt. Nooit maanden tonen buiten deze gate.
3. In `_werkvragen_block` (alleen exit): geeft `_uitstroom_bereik` een bereik, vervang in elke werkvraag `in de periode waar deze meting over gaat` door `in de uitstroomperiode ({eerste} tot {laatste})`; anders blijft de tekst zoals hij is.

**V12.** De mensen die een onderwerp buiten de agenda als laagste hadden, krijgen hun keuzes in de bijlage.
- `_appendix_section` krijgt `direction_agg`, de agendasleutels (startpunt, tweede punt) en `scan_type` (alleen exit en retention). Onder de bestaande bijlage een blok met kop `Richtingvraag bij de andere onderwerpen` en per onderwerp met `lowest_n > 0` buiten de agenda:
  - onder `DIRECTION_MIN_N` beantwoorders: `{Label}: {k} {had|hadden} dit als laagste onderwerp; te weinig antwoorden om iets over te zeggen.`
  - anders: `{Label} ({answered} antwoorden): ‘{route}’ {c}, ‘{route}’ {c}, ...; ‘{niets}’ {c}.` (veranderopties op aantal, niets apart achteraan, opties met 0 weg)
  - slotregel: `Dit zijn de keuzes van respondenten, geen advies van Loep.`
- De bijlage krijgt een anker (`LEIDRAAD_ANKERS["bijlage"] = "sec-bijlage"`, op de kop van de bijlage).
- `_direction_totals_line`: rendert de bijlage met dit blok, dan wordt `Die antwoorden gaan over onderwerpen die niet op de agenda staan en zijn daarom niet uitgewerkt.` aangevuld met ` Wat zij kozen, staat in de bijlage (pagina {pref}).` Zonder bijlage (gate `_should_show_appendix`) blijft de zin zoals hij is. Geef de vlag van buiten mee; bereken de gate niet opnieuw op een andere plek.

**V13.** `_EXIT_BANDS["MIDDEN"]` wordt `Gemengd frictiebeeld`. `_frictie_duiding` krijgt na `onder {laag} laag.` de zin `Deze grenzen horen bij de frictiescore en zijn niet dezelfde als de grenzen 5,0 en 6,5 bij de onderwerpen.` De drempels zelf (`RISK_HIGH`, `RISK_MEDIUM`) blijven: ze bepalen ook de opgeslagen `risk_band` van alle producten.

**V15.** `build_report_data` (5568-5571): `scan_lbl` wordt voor exit ook `scan_meta["product_name"]` (geen "Baseline"/"Live" meer op de cover). `delivery_mode` blijft in de data.

**V16.** `_enps_block(..., scan_type)` krijgt de scan mee; bij exit komt direct na de intro: `<p class="...">Bij Loep Vertrek is dit het oordeel van mensen die vertrokken, niet van wie er nu werkt.</p>` (gebruik dezelfde klasse als de intro). Alle drie de aanroepen geven de scan mee.

- [ ] **Stap 1: Falende tests** in `tests/test_polijstronde_vertrek.py`:
  - V3: synthetische `_vertrekcontext`-aanroep met beloning 18 keer "speelde mee", 0 keer hoofdreden, score 7.0 geeft `Beloning werd 18 keer genoemd als reden die meespeelde, maar scoort als onderwerp 7.0 (relatief sterk)`; met score 6.0 geen zin; met 4 vermeldingen geen zin.
  - V11: in een gerenderd scenario met uitstroomperiode (`21_exit_uitstroom`) staat `in de uitstroomperiode (december 2025 tot maart 2026)` en niet `in de periode waar deze meting over gaat`; in `22_exit_uitstroom_rand` (geen periode) staat het omgekeerde; `een jaar geleden` staat in geen van beide.
  - V12: gerenderd Vertrek-voorbeeld of scenario met bijlage bevat `Richtingvraag bij de andere onderwerpen` en `Wat zij kozen, staat in de bijlage (pagina`.
  - V13: `_band(5.0, "exit")[0] == "Gemengd frictiebeeld"`; `_frictie_duiding(...)` bevat `niet dezelfde als de grenzen 5,0 en 6,5`.
  - V15: gerenderde Vertrek-cover bevat geen `Baseline`.
  - V16: `_enps_block(..., scan_type="exit")` bevat `oordeel van mensen die vertrokken`; met `retention` niet.
- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie.**
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(vertrek): redenen en scores naast elkaar, een tijdsanker, keuzes buiten de agenda in de bijlage, eNPS van vertrekkers`).

---

## Taak 10: Loep Start (S2, S5, S7, S8)

**Files:**
- Modify: `backend/report_html.py` (`ONBOARDING_GEEN_VERDIEPING_NOTE*` 2010-2024, `_landingskwaliteit` 7358-7362, `_laagste_stelling_zin` 2349-2362)
- Modify: `generate_voorbeeldrapport.py` (`ONBOARDING_CONFIG` 237-244 en de opschoning op 996-1006)
- Create: `tests/test_polijstronde_start.py`
- Lockstep: `tests/test_report_onboarding_eerlijk.py:98-105, 108-133, 216-226, 241-252`

**S2.**
- `ONBOARDING_GEEN_VERDIEPING_NOTE` = `Deze scan bevat geen verdiepingsvragen en geen richtingvraag. Het rapport laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet gebeuren, vraag je in het gesprek met hen.`
- `ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED` = `Deze scan bevat geen verdiepingsvragen en geen richtingvraag. Wat er volgens nieuwe medewerkers moet gebeuren, vraag je in het gesprek met hen.`
- Werk het commentaar bij dat zegt dat rapport en site hetzelfde zeggen: de site (`loep-start-scope-disclosure`) zegt nog "komen in een volgende versie"; dat is een verkoopkeuze en buiten deze ronde (spec par. 6). Noem dat in het verslag.

**S5.** Legenda `goed geland` wordt `relatief sterk`.

**S7.** `campaign_name` wordt `Loep Start Q1 2026`. De opschoning van oude demo-campagnes (996-1006) verwijdert ook campagnes met de oude naam `Onboarding Checkpoint Q1 2026`, zodat er geen verouderde demo achterblijft.

**S8.** In `_laagste_stelling_zin`: haal afsluitende leestekens (`.`, `?`, `!`) van `stelling`. Lees in de code of `score` de score van het onderwerp of van de stelling is, en zet het getal bij waar het bij hoort:
- onderwerpscore: `Bespreek eerst binnen {onderwerp} ({score}/10) de stelling ‘{stelling}’. Dat is {welke} {waar}.`
- stellingscore: `Bespreek eerst de stelling ‘{stelling}’ ({score}/10), binnen {onderwerp}. Dat is {welke} {waar}.`

- [ ] **Stap 1: Falende tests** in `tests/test_polijstronde_start.py`: de twee noten bevatten niet "volgende versie" en niet "nog"; `_laagste_stelling_zin` met een stelling die op een punt eindigt geeft geen `.’` meer; gerenderd `20_onboarding_sanity` bevat geen `goed geland`; `generate_voorbeeldrapport.ONBOARDING_CONFIG["campaign_name"] == "Loep Start Q1 2026"`.
- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie.**
- [ ] **Stap 4: Tests groen, lockstep.**
- [ ] **Stap 5: Backend-faalset.** `GEEN_REGRESSIES`.
- [ ] **Stap 6: Commit** (`feat(start): zegt wat het rapport doet, een bandnaam, stelling zonder dubbele punt`).

---

## Taak 11: tussenmeting in het productie-image, met vaste terugvalopties

**Files:** geen nieuwe; alleen wijzigingen als een terugvaloptie nodig is.

- [ ] **Stap 1: Render alles** met het vaste recept (zonder selectie), na het opnieuw genereren van de voorbeelden (`generate_voorbeeldrapport.py` voor exit, retention en onboarding). Uitvoer naar `$T/tussenmeting.txt` (`| tee`).

- [ ] **Stap 2: Beoordeel per regel van `check_pdf_report.py`**

Verwacht: dezelfde 3 bevindingen als de nulmeting (pagina 7 van 01, 09, 19, met hetzelfde of een hoger vullingspercentage), verder `check=OK`, 0 warnings, 0 streepjes. Vergelijk paginatallen met `$T/nulmeting.txt` en noteer elk verschil met de oorzaak.

- [ ] **Stap 3: Terugvalopties, in deze volgorde, alleen als een regel faalt**

1. **Agendaslot loopt over** (`paginavulling` of een losgeraakte kop rond "Wat er moet gebeuren"): R19 wordt de korte vorm `Niet gekozen: {k} andere richtingen.` Meet opnieuw.
2. Nog steeds: R22 noemt alleen de richting(en) met het hoogste aantal bij naam, de tweede groep als aantal (`... ‘{A}’ (3), daarna drie richtingen met elk 2.`). Meet opnieuw.
3. **Pagina twee past niet** (`p02-op-een-a4`): de R21-leidraadzin wordt `Vul op de besluitpagina ook de terugkoppeling in.` (zonder het parkeerdeel). Meet opnieuw.
4. **Methodiekpagina te leeg** door R16 (`paginavulling` op de methodiekpagina): meld het, verander niets.

Past het daarna nog niet: **stop**. Schrap geen copy om ruimte te maken; meld per scenario wat overloopt (met `$PY scripts/check_pdf_report.py <pdf> --regel <regel>`) en leg het voor aan de hoofdsessie.

- [ ] **Stap 4: Scenario 14 en R23.** Controleer in de PDF van scenario 14 dat het agendaslot niet alleen op een pagina staat en dat de kop "Wat er moet gebeuren" op dezelfde pagina staat als de kaarten. Doe dat ook voor de voorbeelden Behoud en Vertrek.

- [ ] **Stap 5: Commit** van eventuele terugvalwijzigingen, met de meetuitkomst in het bericht. Zet de voorbeeldrapporten terug als ze niet bewust gewijzigd zijn (`git checkout -- docs/examples frontend/public/examples`); Taak 14 maakt ze definitief.

---

## Taak 12: respondentflow (spec par. 4)

**Files:**
- Modify: `templates/survey-intro.html`, `templates/survey.html`, `templates/complete.html`, `templates/survey/exit-context.html`, `templates/survey/shared-sdt.html`, `templates/survey/shared-org.html`, `templates/survey/shared-deepening.html`, `templates/survey/retention-signals.html`
- Modify: `backend/main.py` (context van `GET /survey/open/{token}` rond 1140-1202; meldingen 1160-1161, 1228-1229, 1278-1279, 1319-1320, 1338-1341 en de foutteksten die de vragenlijst toont)
- Modify: `backend/products/exit/definition.py`, `backend/products/retention/definition.py`, `backend/products/onboarding/definition.py`
- Modify: `frontend/lib/campaign-setup.ts` (`SURVEY_DURATION_LABEL` 69-77)
- Create: `tests/test_polijstronde_respondent.py`
- Lockstep: `tests/test_retention_copy_parity.py:56` (blijft groen), en elke test uit `grep -rn "survey starten\|Survey starten\|10–15\|herleidbare informatie\|Je werkgever" tests frontend --include=*.py --include=*.ts`

**Invultijd: één bron.** Elke productdefinitie met een `survey_intro` krijgt `survey_minutes` (exit 8, retention 6, onboarding 3; dat zijn de getallen die nu in `survey_intro` staan). Daaruit:
- `survey_intro` bouwt zijn tijdzin uit `survey_minutes` (bijv. `"Invullen kost ongeveer " + str(MINUTEN) + " minuten."` met een module-constante; geen f-string-trucs nodig).
- `invite_duration` wordt `"ongeveer " + str(MINUTEN) + " minuten"` (de mails tonen "Duur: {duration}").
- De startpagina (`survey-intro.html:186`) toont `Invullen kost ongeveer {{ survey_minutes }} minuten.`; `main.py` geeft `survey_minutes` mee in de context van `/survey/open/{token}` (haal de definitie op zoals `/survey/{token}` dat doet met `get_scan_definition`). Heeft een scan geen `survey_minutes` (Cultuurbeeld en andere niet-verkochte scans), dan laat de pagina de tijdzin weg; nooit een getal verzinnen.
- `frontend/lib/campaign-setup.ts` krijgt een getallenkaart `export const SURVEY_MINUTES: Partial<Record<ScanType, number>> = { exit: 8, retention: 6, onboarding: 3 }` en `SURVEY_DURATION_LABEL` wordt daaruit afgeleid (`'ongeveer ' + n + ' minuten'`; de andere scans houden `'een paar minuten'`). Een nieuwe Python-test leest het TS-bestand en controleert dat de drie getallen in `SURVEY_MINUTES` gelijk zijn aan `survey_minutes` (patroon van `tests/test_besluit_limiet_pin.py`). Taak 13b gebruikt `SURVEY_MINUTES` op de homepage.

**Overige punten (alle respondentzichtbaar):**
| Plek | Nu | Wordt |
|---|---|---|
| `survey-intro.html:216` | `Survey starten` | `Begin met invullen` |
| `survey-intro.html:191-192` | `Open antwoorden worden gecontroleerd op herleidbare informatie voordat ze in een rapport komen.` | `Herkende namen, e-mailadressen, telefoonnummers en postcodes haalt Loep automatisch uit open antwoorden voordat ze in een rapport komen. Noem liever zelf geen namen.` (dat is wat `anonymize_text` in `backend/scoring.py:69-82` doet) |
| `survey-intro.html:185` | `Je werkgever heeft Loep gevraagd dit onderzoek uit te voeren.` | exit: `De organisatie waar je werkt of werkte, heeft Loep gevraagd dit onderzoek uit te voeren.`; andere scans: `Je organisatie heeft Loep gevraagd dit onderzoek uit te voeren.` (geef `scan_type` mee in de context) |
| titels `survey-intro.html:7`, `survey.html:6`, `complete.html:6` | `... — Loep` | `... | Loep` |
| `survey-intro.html:221` | `Bedankt — een tweede invulling is niet nodig.` | `Bedankt, een tweede keer invullen is niet nodig.` |
| `complete.html:116` | `Je hebt deze survey al eerder ingevuld — je antwoorden ...` | `Je hebt deze vragenlijst al eerder ingevuld. Je antwoorden ...` |
| `complete.html:118, 129` | `survey`, `responses` | `vragenlijst`, `antwoorden` |
| `complete.html:138` | `Aangeboden door Loep — Scherper zien wat telt.` | `Aangeboden door Loep. Scherper zien wat telt.` |
| stapkoppen (`exit-context.html:4`, `shared-sdt.html:4`, `shared-org.html:4`, `shared-deepening.html:7, 31`, `survey.html:478`) | `Stap N — ...` | `Stap N: ...` |
| voortgangslabel (`survey.html:557`, JS) | `" — " + label` | `": " + label` |
| keuzelijst (`exit-context.html:11, 45`) | `— Selecteer —` | `Kies een antwoord` |
| looptijden (`exit-context.html:13-18`) | `3–6 maanden` enz. | `3 tot 6 maanden`, `6 tot 12 maanden`, `1 tot 2 jaar`, `2 tot 5 jaar`, `5 tot 10 jaar`, `10 tot 15 jaar` |
| `survey.html:461, 491, 1197` | `deze survey`, `Verstuur survey ✓`, `de survey verstuurt` | `deze vragenlijst`, `Verstuur je antwoorden ✓`, `de vragenlijst verstuurt` |
| `main.py:1278-1279` | `U heeft deze vragenlijst al ingevuld` / `Bedankt — uw eerdere antwoorden ...` | `Je hebt deze vragenlijst al ingevuld` / `Bedankt, je eerdere antwoorden ...` |
| `main.py` statuspagina's 1160-1161, 1228-1229, 1319-1320, 1338-1341 | `Survey-link ongeldig`, `Deze survey-link klopt niet`, `Survey-link verlopen`, `de survey alsnog wilt invullen` | `Link ongeldig`, `Deze link naar de vragenlijst klopt niet`, `Link verlopen`, `de vragenlijst alsnog wilt invullen` (behoud je/jij) |
| foutteksten die de vragenlijst letterlijk toont (`main.py`, bijv. `Survey al ingevuld.`, `... De survey is niet opgeslagen.`) | `survey` | `vragenlijst` |
| `retention-signals.html:41, 59` | koppen `Stay-intent`, `eNPS` | `Blijven`, `Aanbevelen` |
| `retention-signals.html:61` | kapot teken `â—†` | `◆` |
| stap `Behoudssignalen` (`survey.html:476, 478`) | `Behoudssignalen` | `Werkplezier en blijven` |
| `exit-context.html:46, 54` | `Organisatiefactoren (push)`, `Externe aantrekkingskrachten (pull)` | `Redenen binnen de organisatie`, `Redenen van buiten` |
| `onboarding/definition.py:38-39` (`survey_intro`) | `onboarding-scan`, `managementread voor dit ene checkpoint` | gewone taal, bijv. `deze vragenlijst over je eerste periode` en `een groepsbeeld voor dit ene meetmoment` (lees de hele zin en houd de betekenis) |

Het interne `localStorage`-sleutelwoord `verisight_survey_` blijft (hernoemen wist lopende antwoorden). De Cultuurbeeld-meldingen (`main.py:1171-1179, 1365-1375`) blijven: die scan wordt niet verkocht; noem het in het verslag.

- [ ] **Stap 1: Falende tests**

`tests/test_polijstronde_respondent.py`:
```python
"""Spec 2026-10-09 par. 4: respondentflow in gewone taal, een bron voor de invultijd."""
import re
from pathlib import Path

import pytest

from backend.products.exit.definition import SCAN_DEFINITION as EXIT  # controleer de namen
from backend.products.onboarding.definition import SCAN_DEFINITION as ONB
from backend.products.retention.definition import SCAN_DEFINITION as RET

ROOT = Path(__file__).resolve().parent.parent
RESPONDENT = [ROOT / "templates" / n for n in ("survey-intro.html", "survey.html",
              "complete.html", "survey-status.html")] + sorted((ROOT / "templates" / "survey").glob("*.html"))


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_streepjes_in_respondenttemplates(pad):
    tekst = pad.read_text(encoding="utf-8")
    assert "—" not in tekst and "–" not in tekst


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_kapotte_tekens(pad):
    assert "â€" not in pad.read_text(encoding="utf-8") and "â—" not in pad.read_text(encoding="utf-8")


def test_startknop_nederlands():
    intro = (ROOT / "templates" / "survey-intro.html").read_text(encoding="utf-8")
    assert "Survey starten" not in intro and "Begin met invullen" in intro
    assert "gecontroleerd op herleidbare informatie" not in intro


@pytest.mark.parametrize("definitie,minuten", [(EXIT, 8), (RET, 6), (ONB, 3)])
def test_invultijd_een_bron(definitie, minuten):
    assert definitie["survey_minutes"] == minuten
    assert str(minuten) + " minuten" in definitie["survey_intro"]
    assert definitie["invite_duration"] == "ongeveer " + str(minuten) + " minuten"


def test_frontend_minuten_gelijk_aan_backend():
    ts = (ROOT / "frontend" / "lib" / "campaign-setup.ts").read_text(encoding="utf-8")
    blok = ts[ts.index("SURVEY_MINUTES"):]
    blok = blok[: blok.index("}")]
    for scan, d in (("exit", EXIT), ("retention", RET), ("onboarding", ONB)):
        assert re.search(scan + r"\s*:\s*" + str(d["survey_minutes"]) + r"\b", blok), scan


def test_startpagina_toont_invultijd_en_juiste_aanhef(client):
    # Gebruik de bestaande fixtures uit tests/conftest.py en de helpers uit
    # tests/test_segment_flow.py om een open campagne per scan te maken en
    # GET /survey/open/{token} op te vragen.
    ...
```
Maak de laatste test af met de bestaande fixtures (`client`, `db_session`) en het patroon uit `tests/test_segment_flow.py`: voor een exit-campagne bevat de pagina `ongeveer 8 minuten` en `De organisatie waar je werkt of werkte`; voor retention `ongeveer 6 minuten` en `Je organisatie heeft Loep`; nergens `Je werkgever`, `10 tot 15` of `Survey`. Voeg een test toe dat de gerenderde vragenlijst (`GET /survey/{token}`) voor exit en retention geen `—`, `–`, `survey`, `Stay-intent` of `(push)` bevat in de zichtbare tekst (tags weggestript; de `localStorage`-sleutel staat in een script en telt niet: strip ook `<script>`-inhoud).

- [ ] **Stap 2: Zie ze falen.**
- [ ] **Stap 3: Implementatie.**
- [ ] **Stap 4: Tests groen, lockstep** (inclusief `frontend/lib/campaign-setup.test.ts`, `self-send-comms.test.ts` en `setup-wizard-card.guard.test.ts` als die geraakt worden).
- [ ] **Stap 5: Backend- en frontend-faalset.**
- [ ] **Stap 6: Commit** (`feat(respondent): Nederlandse startpagina, een bron voor de invultijd, eerlijke anonimiseringszin, geen streepjes`).

---

## Taak 13: privacyverklaring sectie 5 (spec par. 5)

**Files:**
- Modify: `frontend/app/privacy/page.tsx` (sectie 5, regels 89-100)
- Modify: `frontend/lib/juridische-paginas.guard.test.ts`

Nieuwe alinea in sectie 5, na de alinea over contactformulier en kennismaking:
```tsx
        <p>
          Gebruiksgegevens die niet aan een meting hangen, zoals technische gegevens over het gebruik van de
          beheeromgeving, verwijdert Loep twee jaar na het aanmaken.
        </p>
```
Dit klopt met `backend/data_retention.py` (`GEBRUIK_TERMIJN_MAANDEN = 24`, tabellen `suite_telemetry_events` en `case_proof_registry`, rijen zonder `campaign_id`, 24 maanden na `created_at`).

- [ ] **Stap 1: Falende test** in `juridische-paginas.guard.test.ts`, in de stijl van regels 42-46:
```ts
it('privacy sectie 5 noemt de termijn voor gebruiksgegevens zonder meting (polijstronde)', () => {
  expect(paginas.privacy).toMatch(
    /Gebruiksgegevens die niet aan een meting hangen, zoals technische gegevens over het gebruik van de\s+beheeromgeving, verwijdert Loep twee jaar na het aanmaken\./
  )
})
```
- [ ] **Stap 2:** `cd frontend && npx vitest run lib/juridische-paginas.guard.test.ts` faalt.
- [ ] **Stap 3:** Alinea toevoegen.
- [ ] **Stap 4:** Test groen; de bestaande streepjestest (regels 60-62) blijft groen.
- [ ] **Stap 5: Frontend-faalset.**
- [ ] **Stap 6: Commit** (`feat(privacy): termijn voor gebruiksgegevens zonder meting`).

---

## Taak 13b: homepage (spec par. 7, toegevoegd 10-10)

**Files:**
- Create: `scripts/render_hero_p02.py` (draait in het productie-image)
- Create: `frontend/public/images/voorbeeld-loep-behoud-p02.webp` (of `.png` als WebP niet lukt; zie stap 2)
- Modify: `frontend/components/marketing/home-page-content.tsx` (`managementFlowSteps` 116-136, `ManagementFlowVisual` label op ~269, `ManagementFlowSection` 539-705, hero-visual in `HeroSection` 821-893)
- Create: `frontend/lib/homepage-polijstronde.test.ts`

**Afhankelijkheid:** draai deze taak na Taak 11 (alle rapportwijzigingen staan, ook "Werkbeeld") en na Taak 12 (`SURVEY_MINUTES` bestaat). Taak 14 genereert de voorbeeldrapporten opnieuw; de generator is deterministisch, dus de afbeelding blijft kloppen. Controleer dat in Taak 14 (stap 1b).

**1. Afbeelding uit het echte rapport.** `scripts/render_hero_p02.py` (niet-productie, QA/marketing):
- leest `/repo/docs/examples/voorbeeldrapport_retentiescan.html`, rendert met WeasyPrint naar PDF (zoals `render_in_image.py`), opent pagina 2 (index 1) met PyMuPDF;
- knipt de bovenste helft: `clip = pymupdf.Rect(0, 0, page.rect.width, page.rect.height * 0.5)`; stel de factor bij (0,45 tot 0,6) zodat de knip na een heel blok valt (kernzin, tegels met Werkbeeld en de regel eronder), nooit door een tekstregel heen;
- rendert op 2,5x (`matrix=pymupdf.Matrix(2.5, 2.5)`), schrijft `/out/hero_p02.png`;
- comprimeert met Pillow als dat in het image zit (`python -c "import PIL"`) naar WebP kwaliteit 82, anders blijft het PNG (optimize). Doel: kleiner dan 250 KB, breedte rond 1400 px.
Draaien:
```bash
$PY generate_voorbeeldrapport.py retention
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde:/repo:ro" \
  -v "C:/Users/larsh/AppData/Local/Temp/loep-polijst/out:/out" \
  loep-backend:test sh -c "pip install -q pymupdf; python /repo/scripts/render_hero_p02.py"
cp $T/out/hero_p02.webp frontend/public/images/voorbeeld-loep-behoud-p02.webp
git checkout -- docs/examples frontend/public/examples
```
Bekijk de afbeelding (Read-tool op het bestand): scherp, "Werkbeeld" zichtbaar, geen afgesneden regel, geen streepjes, geen "Behoudssignaal".

**2. Hero.** Vervang in `HeroSection` de hele navy mock-kaart (de `div` met `background: '#0d1b2a'` en de schaduw-`div` ervoor, ~821-892) door een `figure`:
- `next/image` met de afbeelding, `width`/`height` gelijk aan de echte pixelmaten, `sizes="(max-width: 1120px) 100vw, 480px"`, `priority` (hero, grootste element), `style={{ width: '100%', height: 'auto', display: 'block' }}`;
- alt-tekst: `Voorbeeld van pagina twee uit een Loep Behoud-rapport: de kernzin, het werkbeeld en de cijfers over blijven en vertrekken.`;
- zichtbaar label linksboven op de afbeelding: `Voorbeeld` (klein, hoofdletters, op een donker of wit vlak met voldoende contrast);
- de verschoven schaduwvlak-`div` en de omlijsting mogen blijven (zelfde huisstijl); de container blijft `maxWidth: 480`.
Werkt `next/image` niet met de bestaande `images`-config in `next.config.ts`, gebruik dan een gewone `<img>` met `width`, `height`, `loading="eager"` en `decoding="async"`; CSP `img-src 'self'` staat dat al toe.

**3. Blok "Luisteren. Begrijpen. Kiezen."**
- Even hoog: het `article` krijgt `height: '100%'`, `display: 'flex'`, `flexDirection: 'column'`; de mini-visual staat in een wrapper met `marginTop: 'auto'` zodat alle drie onderaan op één lijn staan. Werkt de stretch niet door de `Reveal`-wrapper, geef `Reveal` een optionele `style`-prop (alleen doorgeven aan de buitenste `div`) en zet daar `height: '100%'`. Verwijder `minHeight: 408` als het niet meer nodig is.
- Tekst per kaart rond 40 woorden (tussen 36 en 44). Basis (de implementer mag licht schaven, maar niets toevoegen wat het rapport niet doet):
  - kaart 1 (de minuten uit `SURVEY_MINUTES` in `frontend/lib/campaign-setup.ts`, kleinste en grootste van exit, retention en onboarding): `` `Anoniem, in ${min} tot ${max} minuten ingevuld, afhankelijk van de scan. Loep zet alles klaar; jij stuurt één mail vanuit je eigen mailbox. Loep ziet de adressen van je mensen nooit. De respons volg je in je eigen omgeving.` ``
  - kaart 2: `Een rapport dat laat zien wat laag scoort én wat je mensen daar zelf over zeggen. Plus één ranglijst: dit eerst, en waarom. Bij Loep Vertrek en Loep Behoud staat er ook bij wat er volgens je mensen moet gebeuren.`
  - kaart 3: `Jij leidt het gesprek met je MT; het rapport is je leidraad van 45 minuten. Jullie kiezen wat je oppakt, wie het doet en wanneer je terugkijkt. Geen actieplan uit een computer, wel de feiten erbij.`
- In `ManagementFlowVisual` (kaart 2) wordt het label `Eerste managementvraag` `Gespreksopener`.

- [ ] **Stap 1: Falende test** `frontend/lib/homepage-polijstronde.test.ts`:
```ts
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const bron = readFileSync(join(__dirname, '..', 'components', 'marketing', 'home-page-content.tsx'), 'utf8')
const live = bron.slice(0, bron.indexOf('function SuitePreviewSection'))

describe('homepage polijstronde (spec par. 7)', () => {
  it('hero zegt niets meer wat het rapport niet zegt', () => {
    for (const oud of ['veruit het laagst', 'Eerste managementvraag', 'Waardering en erkenning', 'Illustratief voorbeeld']) {
      expect(live).not.toContain(oud)
    }
  })

  it('hero toont de echte rapportafbeelding met label en alt-tekst', () => {
    expect(live).toContain('/images/voorbeeld-loep-behoud-p02.')
    expect(live).toContain('Voorbeeld van pagina twee uit een Loep Behoud-rapport')
    expect(live).toMatch(/>\s*Voorbeeld\s*</)
    const pad = join(__dirname, '..', 'public', 'images')
    const bestand = ['voorbeeld-loep-behoud-p02.webp', 'voorbeeld-loep-behoud-p02.png']
      .map((n) => join(pad, n)).find((p) => { try { return statSync(p).isFile() } catch { return false } })
    expect(bestand).toBeTruthy()
    expect(statSync(bestand!).size).toBeLessThan(250 * 1024)
  })

  it('invultijd komt uit SURVEY_MINUTES, niet uit vaste tekst', () => {
    expect(live).not.toContain('tien minuten')
    expect(live).toContain('SURVEY_MINUTES')
  })

  it('kaartteksten rond 40 woorden', () => {
    const blok = live.slice(live.indexOf('const managementFlowSteps'), live.indexOf('function ManagementFlowVisual'))
    const bodies = [...blok.matchAll(/body:\s*(?:'([^']*)'|`([^`]*)`)/g)].map((m) => m[1] ?? m[2])
    expect(bodies).toHaveLength(3)
    for (const b of bodies) {
      const woorden = b.replace(/\$\{[^}]*\}/g, 'X').trim().split(/\s+/).length
      expect(woorden).toBeGreaterThanOrEqual(36)
      expect(woorden).toBeLessThanOrEqual(44)
    }
  })

  it('geen streepjes in de live homepage', () => {
    expect(live).not.toMatch(/[\u2013\u2014]/)
  })
})
```
Staat `managementFlowSteps` niet meer als lijst met `body:` (bijv. omdat kaart 1 een template literal nodig heeft), pas de regex aan; de test moet de drie echte teksten meten. Bevat de live homepage al streepjes buiten deze twee blokken, beperk die laatste test dan tot de twee blokken en meld het.

- [ ] **Stap 2: Zie hem falen.** `cd frontend && npx vitest run lib/homepage-polijstronde.test.ts`
- [ ] **Stap 3: Afbeelding maken** (punt 1), **hero** (punt 2), **blok** (punt 3).
- [ ] **Stap 4: Test groen; frontend-faalset; `npm run build` met de dummy's.**
- [ ] **Stap 5: Browsercheck homepage**, desktop (1440 breed) en 375 px, tegen de dev-server van de worktree: tijdelijke configuratie in `C:\Users\larsh\Desktop\Business\.claude\launch.json` (eerst een kopie in `$T`, daarna terugzetten) met `runtimeExecutable` het volledige pad naar `npm.cmd`, `runtimeArgs` `["--prefix", "C:/Users/larsh/Desktop/Business/Verisight/.worktrees/polijstronde/frontend", "run", "dev", "--", "-p", "3100"]`, poort 3100. Controleer met `javascript_tool`:
  - de drie kaarten hebben op desktop dezelfde hoogte (`getBoundingClientRect().height`, verschil hoogstens 1 px) en de mini-visuals beginnen op dezelfde `top`;
  - de hero-afbeelding laadt (`naturalWidth > 0`), heeft de alt-tekst, het label "Voorbeeld" staat erop;
  - op 375 px: `document.documentElement.scrollWidth === 375`, de afbeelding past binnen de kolom, kaarten onder elkaar;
  - de console geeft geen fouten (behalve de bekende CSP-melding over het debugscript van Vercel Analytics in dev).
  Noteer de gemeten hoogtes voor en na (voor: 433, 490, 508 px) en de woordaantallen. Een screenshot van de hero en het blok (desktop en 375 px) mag; zet er geen inloggegevens of persoonsgegevens op.
- [ ] **Stap 6: Commit** (`feat(homepage): echte rapportafbeelding in de hero, drie gelijke kaarten met invultijd uit de vragenlijstbron`), met script, afbeelding, component, test en eventueel `design-tokens.tsx`.

---

## Taak 14: eindverificatie, voorbeeldrapporten, browsercheck, verslag

- [ ] **Stap 1: Voorbeeldrapporten opnieuw**
```bash
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
```
Controleer dat zowel `docs/examples/` als `frontend/public/examples/` de nieuwe HTML hebben (de generator schrijft beide; zo niet, kopieer zoals eerdere rondes dat deden: zie `git log --stat -1 -- frontend/public/examples`). Maak de PDF's in het productie-image (zoals in de fixronde: de PDF-uitvoer van `render_in_image.py` in `$T/out` naar beide mappen kopiëren onder de bestaande bestandsnamen; controleer welke bestanden de site linkt).

- [ ] **Stap 1b: Hero-afbeelding nog gelijk?** Draai `scripts/render_hero_p02.py` opnieuw op het nieuwe Behoud-voorbeeld en vergelijk met `frontend/public/images/voorbeeld-loep-behoud-p02.*` (byte-gelijk, of visueel gelijk als de compressie varieert). Wijkt de inhoud af, vervang de afbeelding en noem het in het verslag.

- [ ] **Stap 2: Eindmeting.** Vast recept zonder selectie, `| tee $T/eind.txt`. Verwacht: 34 bestanden, alleen de bekende 3 bevindingen, 0 warnings, 0 streepjes. Paginatallen naast de nulmeting.

- [ ] **Stap 3: Richtingstaten na.** `$PY scripts/richting_staten.py > $T/staten-na.txt; $PY scripts/richting_staten.py --voorbeelden >> $T/staten-na.txt; diff $T/staten-voor.txt $T/staten-na.txt`. Noteer elke wissel met de tellingen uit de meta.json (verslag: "welke scenario's van richtingstaat wisselden").

- [ ] **Stap 4: Grep-controle Werkbeeld.** `grep -rn -i "behoudssignaal" backend/report_html.py docs/examples/*.html frontend/public/examples/*.html frontend/lib/action-center-live.ts` geeft niets. Noteer in het verslag elke plek waar "Behoudssignaal" "Werkbeeld" werd (tabel uit Taak 3).

- [ ] **Stap 5: Volledige suites.** Backend-faalset en frontend-faalset, plus `npm run build` met de dummy's in de shell. `tests/test_python311_syntax_guard.py` groen.

- [ ] **Stap 6: Browsercheck respondentflow** tegen een lokale backend op een wegwerp-SQLite (map in `$T`, niet in de repo), desktop en 375 px:
  1. Maak met een tijdelijk script (in `$T`, naar het patroon van `seed_browsercheck.py` uit de vervolgronde: organisatie, een open Behoud-campagne en een open Vertrek-campagne met `public_survey_token`) testdata aan.
  2. Start de backend: `DATABASE_URL=sqlite:///C:/Users/larsh/AppData/Local/Temp/loep-polijst/browsercheck.db $PY -m uvicorn backend.main:app --port 8010` via een tijdelijke `.claude/launch.json`-configuratie in de hoofdmap (`C:\Users\larsh\Desktop\Business\.claude\launch.json`; maak eerst een kopie, zet hem daarna terug) en `preview_start`.
  3. Controleer per scan: startpagina (knop "Begin met invullen", juiste invultijd, juiste aanhef, anonimiseringszin, titel zonder streepje), de vragenlijst (stapkoppen met dubbele punt, keuzelijsten zonder streepjes, Behoud-koppen "Blijven" en "Aanbevelen", geen kapot teken), versturen, bedankpagina, en de pagina "al ingevuld" (opnieuw openen na versturen). Bij 375 px: `document.documentElement.scrollWidth` is 375.
  4. Lees via `read_page`/`get_page_text`; screenshots zijn optioneel. In een verborgen browserpaneel vuurt `requestAnimationFrame` niet; dat geldt voor gestreamde Next-pagina's, niet voor deze Jinja-pagina's.
  5. Zet `launch.json` terug en verwijder de wegwerp-database niet uit `$T` (opruimlijst in het verslag).

- [ ] **Stap 7: Verslag** `docs/superpowers/plans/2026-10-09-polijstronde-uitvoering.md` met deze koppen:
  - **Baselines** (tabel voor/na: backend failed/passed/skipped en faalset, Python 3.11-guard, tsc, vitest en faalset, build).
  - **Leesronde-codes:** tabel met alle 39 codes (R7, R9-R14, R16-R27, V3, V7, V10-V16, S1-S11): status `dicht`, `deels` of `bewust niet`, met reden en bewijs (citaat uit het nieuwe voorbeeldrapport). S1: bewust niet (spec). R27, R25, R14 (Vertrek), V13: deels, met verwijzing naar "Wat Lars moet beslissen".
  - **"Behoudssignaal" werd "Werkbeeld":** de tabel uit Taak 3 met de plekken, plus de bewust ongewijzigde dode code.
  - **Richtingregel:** wat er verandert en welke scenario's of voorbeeldkaarten van staat wisselden (Taak 1 en Taak 14 stap 3).
  - **Wat er is gebouwd, per taak** (taak, onderwerp, commits).
  - **Wat de reviews vonden** (per taak, spec-review en codekwaliteitsreview).
  - **Renders in het productie-image** (nulmeting, tussenmeting, eindmeting; paginatallen; gebruikte terugvalopties uit Taak 11).
  - **Browsercheck** (tabel per controle), respondentflow én homepage.
  - **Homepage (spec par. 7):** de nieuwe hero-afbeelding (bron, knip, formaat, bestandsgrootte), kaarthoogtes voor (433, 490, 508 px) en na, woordaantallen voor (43, 59, 63) en na, welke minuten kaart 1 noemt en waar ze vandaan komen.
  - **Afwijkingen van het plan, en waarom.**
  - **Wat Lars moet beslissen**, minstens: (1) R27 reden of uitsplitsing per afdeling; (2) R25 regel op de antwoordschaal gehouden; (3) naam voor de scorekolom bij Loep Vertrek (R14); (4) V13 eigen frictiegrenzen gelijktrekken of niet; (5) S6 termijn "ongeveer 30 dagen"; (6) V10 voorbehoud nu ook onder tien veranderkeuzes (vaker zichtbaar); (7) bevlogenheid-labels volgen nu 5,0/6,5 (R12); (8) site Loep Start zegt nog "volgende versie" (S2); (9) eventueel ingezette terugvalopties uit Taak 11; (10) dode code met de oude naam (opruimen of laten).
  - **Na merge:** geen migratie; Railway-redeploy van "Loep main" (rapport, vragenlijst, definities); Vercel deployt privacyverklaring, Action Center-zin en voorbeeldrapporten; browsercheck op de testklant volgens `docs/testklant.md`.
  - **Opruimwerk** (bestanden in `$T`, eventuele hernoemde Docker-mappen).

- [ ] **Stap 8: Commit** van voorbeeldrapporten en verslag. Controleer met `git status --short` dat er niets ongecommit is (behalve `docs/stresstest/`, die gitignored is).

- [ ] **Stap 9: Melden** dat de branch klaar is voor verificatie door de hoofdsessie (CEO sparring prompt).
