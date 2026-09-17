# Rapport 3a: pagina twee als MT-vel, één startpuntverhaal, ronde 3 en taal — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een HR-manager leidt met pagina twee en de gespreksagenda een MT-vergadering van 45 minuten zonder Loep in de kamer, en het rapport spreekt zichzelf nergens tegen: één startpunt, één gespreksopener, elke telling met noemer, elke drempel met uitleg, geen jargon, geen halflege pagina's.

**Architecture:** Alles zit in de pure rapportlaag: `backend/report_html.py` (rendering en `build_report_data`), `backend/report_css.py` (paginaverwijzingen via `target-counter`, tabelkoppen, flow-secties), `backend/products/shared/deepening.py` (alleen de `other_texts`-aggregatie voor B13) en twee productdefinities (twee typografische tekstfixes). Paginanummers komen niet uit Python maar uit WeasyPrint zelf: elke sectie krijgt een `id`, elke verwijzing is een `<a class="pref" href="#id"></a>` waarvan de CSS `target-counter(attr(href), page)` rendert (op 2026-09-16 in `ghcr.io/weasyprint/weasyprint` geverifieerd: "pagina 4" en "pagina 2" in de tekstlaag van de PDF). Geen schemawijziging, geen API-wijziging, geen surveylogica. Werkvragen, besluitpagina, `campaign_decisions` en de vervolgmeting zijn plan 3b/3c en komen hier niet voor.

**Tech Stack:** Python 3.11 (Railway én het lokale venv), pytest, PyMuPDF (`fitz`, in het venv) voor paginametingen, WeasyPrint via Docker `ghcr.io/weasyprint/weasyprint` voor PDF-validatie, het stresstest-harnas `scripts/stresstest_report.py`.

**Spec:** `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (onderdelen 1, 2, 6, 7; par. 4, 5, 9, 10, bijlage B) plus par. 4.6 van `docs/superpowers/specs/2026-09-11-self-service-onboarding-design.md`. **Intakes:** `docs/rapport-koude-leesronde-2026-09-16.md` (B/H/C-nummers) en `docs/rapport-stresstest-2026-09-10.md` (sectie "Na ronde 2": matrix, open punten a/b/c, observaties 3 en 4).

---

## Vaste regels voor elke taak

1. **Gewone taal** (copy-toon 2026-09-06): Loep is het onderwerp, nooit "ik"; geen HR-jargon. Vanaf taak 13 gelden de verboden woorden uit bijlage B van de spec hard (source-guard).
2. **Geen em-dashes in klantcopy.** Dubbele punt, komma, punt of `&middot;`. Elke nieuwe copy-test bevat een em-dash-guard op de gerenderde body.
3. **Fail Loud.** Geen stil weggelaten blok, geen kaal veld, geen verzonnen getal. Ontbreekt iets (datum, noemer, afdelingsnamen), dan staat er in één zin wat er ontbreekt.
4. **Python 3.11.** Geen backslash en geen hergebruikt aanhalingsteken binnen een f-string-expressie; bouw zulke stukken met `+`. `tests/test_python311_syntax_guard.py` bewaakt dit en het lokale venv (3.11.9) weigert het al bij import.
5. **Elke telling heeft een noemer en elke drempel een uitleg op de plek waar hij staat** (spec par. 2). Nieuwe drempels bestaan in dit plan niet; alle getallen komen uit de bestaande constanten (`MIN_AGGREGATE_N`, `MIN_SEGMENT_N`, `MIN_QUOTES_N`, `MIN_DISTRIBUTION_N`, `DEEPENING_MIN_N`, `DIRECTION_MIN_N`, `RESPONSE_CAUTION_RATE`, `RESPONSE_INDICATIVE_RATE`). De ene uitzondering, het aandeel "Anders" van 20% (spec par. 9 B13), wordt in taak 9 een benoemde constante met uitleg.
6. **Contract-tests die oude copy pinnen werken in lockstep mee.** Elke taak noemt de tests bij naam. Een test aanpassen mag alleen omdat de spec de nieuwe copy voorschrijft; zeg in de commit welke test en waarom.
7. **Baseline:** backend `25 failed` met de faalset uit taak 0 (`docs/superpowers/plans/plan3a-baseline-failset.txt`). Na elke taak: nul nieuwe regressies, faalset per testnaam identiek. Gebruik altijd de diff, nooit alleen het aantal.
8. **Testcommando** (vanuit de worktree-root `.worktrees/rapport-3a`):
   `/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf`
   Het venv staat in de hoofdcheckout en resolveert `backend` naar de worktree (geverifieerd in ronde 2).
9. **Regelnummers in dit plan zijn de stand op main (`f28b0a7d`).** Ze verschuiven zodra een eerdere taak hetzelfde bestand raakt; het geciteerde ankerfragment is leidend, zoek daarop.
10. **Wijk je af van de spec, documenteer dat in de spec zelf** (`docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md`, kopje "Afwijkingen bij plan 3a", aangemaakt in taak 1) in dezelfde commit.
11. **Voorbeeld-HTML's in `docs/examples/` en `frontend/public/examples/` regenereer je alleen in taak 14**, niet tussendoor: anders draagt elke commit 3 MB base64-fonts.
12. **Fixtures in tests bevatten niet elke nieuwe datasleutel.** Nieuwe sleutels uit `build_report_data` (`period_start`, `period_end`, `enps_detail`) leest de renderer daarom met `data.get(...)`; een ontbrekende waarde rendert als "niet vastgelegd" of blijft weg, nooit als verzonnen waarde. Dat is eerlijke degradatie, geen stille terugval.

---

## Bestandsoverzicht

| Bestand | Verantwoordelijkheid | Taken |
|---|---|---|
| `backend/report_html.py` | Datalaag (`build_report_data`) en alle rendering | 1 t/m 13 |
| `backend/report_css.py` | Paginaverwijzingen (`.pref`), flow-secties, tabelkoppen, tweekolomsappendix | 5, 8, 11 |
| `backend/products/shared/deepening.py` | `other_texts` in `aggregate_deepening` en `aggregate_direction` (B13) | 9 |
| `backend/products/exit/definition.py`, `backend/products/retention/definition.py` | Twee typografische fixes in stellingteksten B4 en B12 (C6) | 12 |
| `scripts/check_pdf_report.py` (nieuw) | PyMuPDF-controle op een gerenderde PDF: paginavulling, pagina-drie-regel, paginaverwijzingen, herhaalde tabelkoppen | 6, 8, 11, 14 |
| `scripts/stresstest_report.py` | Harnas: seed van `launch_date`/`closed_at`/`invited_count` zodat de meetgegevens echte datums tonen | 14 |
| `generate_voorbeeldrapport.py` | Voorbeeldgenerator: dezelfde seed | 14 |
| `tests/test_report_meetgegevens.py` (nieuw) | Noemer + datums uit het delivery record (DB-pad) | 1 |
| `tests/test_report_p02_mtvel.py` (nieuw) | Pagina twee als MT-vel: blok 2, onderbouwing, opener, leidraad, meetgegevens | 2, 4, 5, 6 |
| `tests/test_report_startpuntverhaal.py` (nieuw) | Segmentblok, brugzin, restgroep, cover | 7 |
| `tests/test_report_paginavulling.py` (nieuw) | HTML-structuur van de flow-secties, eNPS-plaats, PDF-check (skipt zonder WeasyPrint) | 8 |
| `tests/test_report_tellingen.py` (nieuw) | B13, B14, sluitende richtingketen | 9, 10 |
| `tests/test_report_drempels_en_koppen.py` (nieuw) | B20-drempeltabel, `thead`, C13 | 11 |
| `tests/test_report_taal_guard.py` (nieuw) | Source-guard verboden woorden, terminologie, typografie, verspreidingsregel | 12, 13 |
| `docs/rapport-stresstest-2026-09-10.md` | Sectie "Na plan 3a" | 14 |
| `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` | Kopje "Afwijkingen bij plan 3a" | 1, 4, 8, 14 |

Bestaande tests die in lockstep meegaan (per taak benoemd): `test_report_respons_gevolgen.py`, `test_report_p02_kernzin.py`, `test_report_degraded_page_two.py`, `test_report_degraded_verwijzingen.py`, `test_report_design_sprong.py`, `test_report_html_design.py`, `test_pdf_redesign.py`, `test_report_leesbaarheid.py`, `test_report_priority_consistency.py`, `test_report_priority_attribution.py`, `test_report_priority_render.py`, `test_direction_report_block.py`, `test_direction_renderer_wiring.py`, `test_report_direction_degraded.py`, `test_deepening_report.py`, `test_deepening_report_html.py`, `test_report_segment_startpunt.py`, `test_segment_factor_themes.py`, `test_cover_label_overflow.py`, `test_report_onboarding_eerlijk.py`, `test_report_onboarding_degraded_agenda.py`, `test_report_polariteit_en_opsomming.py`, `test_report_exit_kernzin.py`, `test_report_distribution.py`, `test_report_band_rounding.py`.

---

## Taakvolgorde

| Taak | Spec | Onderwerp | Hangt af van |
|---|---|---|---|
| 0 | — | Worktree en baseline-faalset | — |
| 1 | 4.6 (11-9), par. 4 blok 6 | Noemer uit het delivery record (bevestigen) + datums start/sluiting in de data | 0 |
| 2 | par. 4 blok 2, punt (b) | Blok 2: blijfintentie met band en zones, respons-oordeel, vertrekreden met noemer en gelijkspel | 1 |
| 3 | par. 4 blok 1, punt (a), H17 | Kop: vlak profiel op de getoonde score, gedeelde laagste met namen, "één kwetsbaar onderwerp" met de aandachtspunten erbij | 2 |
| 4 | par. 4 blok 3 en 4, C10, C11, H1, H9 | Onderbouwing zonder lege cellen, noemer bij "X van de Y", één gespreksopener | 3 |
| 5 | par. 4 blok 5 en 6, H4, H5, H8 | "Zo leid je dit gesprek in 45 minuten", paginaverwijzingen, meetgegevens met datums, gebruiksblok weg | 4 |
| 6 | par. 4 slot, H16 | Pagina twee is één A4, pagina drie begint met hoofdstuk 02; `scripts/check_pdf_report.py` | 5 |
| 7 | par. 5, B2, H20, C8, punt (b) | Eén startpuntverhaal: segmentblok hernoemd, brugzin, restgroep met noemer en samenstelling, cover | 6 |
| 8 | par. 9 B9, H13, C5, C7, C12 | Paginavulling: eNPS bij de context, flow-secties, werkbeleving en appendix in twee kolommen, geen "(vervolg)" bij een nieuw onderwerp | 7 |
| 9 | par. 9 B13 | Anders-toelichtingen: aggregatie + weergave (staffel 5) | 8 |
| 10 | par. 9 B14, H2, H19 | Vaste tellingsvorm "X van de Y (Y = ...)" en de sluitende richtingketen | 9 |
| 11 | par. 9 B20, H18, punt (c), C9, C13 | Drempeltabel op de methodiekpagina + inline verwijzingen; `thead` in ranglijst en afdelingstabel; "vrijwel gelijk" onder de tabel | 10 |
| 12 | par. 9 C2, C3, C6; par. 10 H15 | Anonimiseringslabel één keer, bandlijst weg, trema en streepjes, verspreidingsregel op cover en slotpagina | 11 |
| 13 | par. 10, bijlage B, H14 | Taalronde: vertaaltabel, terminologie onderwerp/stelling/afdeling, source-guard | 12 |
| 14 | par. 12 | Harnas- en generatorseed, alle 21 scenario's, matrix "Na plan 3a", WeasyPrint-Docker, voorbeeldrapporten, guards, faalset | 13 |

---

## Taak 0: Worktree en baseline-faalset

**Files:**
- Create: `docs/superpowers/plans/plan3a-baseline-failset.txt`

- [ ] **Stap 1: Worktree aanmaken vanaf main**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
git status --short | grep -v "^??" ; echo "(bovenstaande moet leeg zijn: geen ongecommitte wijzigingen aan getrackte bestanden)"
git worktree add .worktrees/rapport-3a -b feature/rapport-3a main
cd .worktrees/rapport-3a && git log --oneline -1
```
Verwacht: `f28b0a7d test(guard): op Python 3.11 zelf compileren i.p.v. 3.12-tokens lezen` (of de dan geldende top van main).

- [ ] **Stap 2: Faalset vastleggen**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3a
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > docs/superpowers/plans/plan3a-baseline-failset.txt
wc -l < docs/superpowers/plans/plan3a-baseline-failset.txt
```
Verwacht: `25`. Wijkt het af, stop en meld het: dan is main niet op de bekende baseline.

- [ ] **Stap 3: Python-versie en tooling controleren**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe --version
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -c "import fitz; print('pymupdf ok')"
docker --version
```
Verwacht: `Python 3.11.9`, `pymupdf ok`, een Docker-versieregel.

- [ ] **Stap 4: Commit**

```bash
git add docs/superpowers/plans/plan3a-baseline-failset.txt
git commit -m "test(baseline): faalset van voor plan 3a vastgelegd

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Vanaf hier is het faalset-commando in elke taak:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```
Verwacht: `GEEN_REGRESSIES`.

---

## Taak 1: Noemer uit het delivery record bevestigen + datums in de data

**Wat de code al doet (afwijking van spec 11-9 par. 4.6, vastleggen in de spec):** `_respons_noemer` (`backend/report_html.py:659-707`, anker `def _respons_noemer(record_invited: int | None, *, rows: int,`) en de aanroep in `build_report_data` (`:3166-3170`, anker `_record = camp.delivery_record`) implementeren sinds ronde 2 al: (1) `delivery_record.invited_count` als noemer zodra die er is en niet lager is dan het aantal ingevulde vragenlijsten, (2) anders de respondentrijen als die er méér zijn dan ingevulde, (3) anders `n_invited=None` met de zin "Loep kan niet vaststellen hoeveel mensen zijn uitgenodigd ...". Twee verschillen met par. 4.6: de code kijkt niet naar `comms_mode` (het vastgelegde aantal gaat vóór, ook bij managed; dat is de bedoelde noemer) en een te laag vastgelegd aantal geeft géén afgekapte 100% maar géén percentage plus de reden (ronde-2-besluit "liever geen getal dan een onwaar getal", strenger dan 4.6). Dit plan houdt de code en documenteert de afwijking. Nieuw in deze taak: de meetdatums (H8, spec par. 4 blok 6) komen uit `delivery_record.launch_date` (start) en `campaign.closed_at` (sluiting; dat veld staat op `Campaign`, `backend/models.py:150`, niet op het delivery record), als Nederlandse datumtekst of `None`.

**Files:**
- Modify: `backend/report_html.py:3131-3369` (`def build_report_data`), plus één nieuwe helper vlak boven `_cover_respons_stat` (`:813`).
- Test: `tests/test_report_meetgegevens.py` (nieuw)
- Modify: `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (nieuw kopje onderaan)

- [ ] **Stap 1: Schrijf de falende test**

`tests/test_report_meetgegevens.py`:

```python
"""Noemer en meetdatums uit het delivery record (spec 11-9 par. 4.6, spec 16-9 par. 4 blok 6).

De noemer-logica bestaat sinds ronde 2 (_respons_noemer); deze tests pinnen het
self_send-pad expliciet, zodat het niet stil kan terugvallen op len(respondents)
en een verzonnen 100% kan tonen. De datums zijn nieuw: launch_date (delivery
record) en closed_at (campagne), als Nederlandse tekst of None. Nooit een
verzonnen datum.
"""
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from backend.models import Campaign, CampaignDeliveryRecord, Organization, Respondent, SurveyResponse
from backend.report_html import _datum_nl, build_report_data


def _campagne(db: Session, *, comms_mode: str, completed: int, rows: int,
              invited_count: int | None, launch_date: date | None,
              closed_at: datetime | None) -> str:
    org = Organization(name="TestOrg", slug="testorg", contact_email="hr@test.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type="retention",
                    comms_mode=comms_mode, closed_at=closed_at)
    db.add(camp)
    db.flush()
    if invited_count is not None or launch_date is not None:
        db.add(CampaignDeliveryRecord(organization_id=org.id, campaign_id=camp.id,
                                      invited_count=invited_count, launch_date=launch_date))
    for i in range(rows):
        klaar = i < completed
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker", completed=klaar)
        db.add(r)
        if klaar:
            db.add(SurveyResponse(
                respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                risk_score=5.5, risk_band="MIDDEN"))
    db.commit()
    return camp.id


def test_datum_nl_formatteert_nederlands():
    assert _datum_nl(date(2026, 3, 9)) == "9 maart 2026"
    assert _datum_nl(datetime(2026, 4, 30, 23, 59, tzinfo=timezone.utc)) == "30 april 2026"
    assert _datum_nl(None) is None


def test_self_send_gebruikt_het_vastgelegde_aantal(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=39, rows=39,
                    invited_count=58, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] == 58
    assert data["completion_pct"] == 67.2
    assert data["n_invited_note"] == ""


def test_self_send_zonder_aantal_verzint_geen_honderd_procent(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=39, rows=39,
                    invited_count=None, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] is None
    assert data["completion_pct"] is None
    assert "niet vaststellen hoeveel mensen zijn uitgenodigd" in data["n_invited_note"]


def test_datums_uit_delivery_record_en_campagne(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=12, rows=12,
                    invited_count=20, launch_date=date(2026, 3, 9),
                    closed_at=datetime(2026, 3, 30, 12, 0, tzinfo=timezone.utc))
    data = build_report_data(cid, db_session)
    assert data["period_start"] == "9 maart 2026"
    assert data["period_end"] == "30 maart 2026"


def test_ontbrekende_datums_zijn_none_niet_verzonnen(db_session: Session):
    cid = _campagne(db_session, comms_mode="managed", completed=12, rows=15,
                    invited_count=None, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["period_start"] is None
    assert data["period_end"] is None
```

- [ ] **Stap 2: Draai de test, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_meetgegevens.py -q
```
Verwacht: `ImportError: cannot import name '_datum_nl'`.

- [ ] **Stap 3: Implementeer `_datum_nl` en de twee datavelden**

In `backend/report_html.py`, vlak boven `def _cover_respons_stat(` (`:813`), invoegen:

```python
_MAANDEN_NL = ("januari", "februari", "maart", "april", "mei", "juni", "juli",
               "augustus", "september", "oktober", "november", "december")


def _datum_nl(d) -> str | None:
    """Datum als Nederlandse tekst ("9 maart 2026"), of None als er geen datum is.

    Meetgegevens op pagina twee (H8). Een datetime wordt op de kalenderdag
    gelezen; een ontbrekende datum blijft None, zodat de renderer er in één zin
    bij kan zeggen dat hij niet is vastgelegd in plaats van iets te verzinnen.
    """
    if d is None:
        return None
    return f"{d.day} {_MAANDEN_NL[d.month - 1]} {d.year}"
```

In `build_report_data`, direct na de regel `completion  = round(n_completed / n_invited * 100, 1) if n_invited else None` (`:3170`):

```python
    # Meetdatums (spec 16-9 par. 4 blok 6, H8): start uit het delivery record,
    # sluiting uit de campagne zelf (closed_at staat op Campaign). Beide mogen
    # ontbreken; dan zegt de meetgegevensregel dat, en verzint het rapport niets.
    period_start = _datum_nl(_record.launch_date if _record is not None else None)
    period_end = _datum_nl(camp.closed_at)
```

En in de `return dict(` (`:3343`), na `n_completed=n_completed, completion_pct=completion,`:

```python
        period_start=period_start, period_end=period_end,
```

- [ ] **Stap 4: Draai de test, verwacht slagen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_meetgegevens.py tests/test_report_respons_gevolgen.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 5: Afwijking in de spec vastleggen**

Onderaan `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` toevoegen:

```markdown
## Afwijkingen bij plan 3a

- **Responsnoemer (spec 11-9 par. 4.6):** de code (`_respons_noemer`, ronde 2) neemt het vastgelegde aantal uit het delivery record als noemer ongeacht `comms_mode`, en geeft bij een te laag vastgelegd aantal géén afgekapte 100% maar géén percentage plus de reden. Dat is strenger dan par. 4.6 en blijft zo: liever geen getal dan een onwaar getal.
- **Sluitdatum:** `closed_at` staat op `Campaign`, niet op het delivery record; de start komt uit `delivery_record.launch_date`.
```

- [ ] **Stap 6: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py tests/test_report_meetgegevens.py docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md
git commit -m "feat(rapport): meetdatums uit delivery record en campagne in de rapportdata

Noemer-pad self_send gepind; period_start/period_end als NL-tekst of None.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 2: Blok 2 van pagina twee: de cijfers die het MT wakker maken

Blijfintentie krijgt dezelfde bandlogica als de onderwerpen (`_factor_label`: onder 5,0 kwetsbaar, 5,0 tot 6,5 aandachtspunt, vanaf 6,5 relatief sterk) plus de zone-verdeling uit `score_distribution`; de respons krijgt een oordeel in één zin; Loep Vertrek noemt de meest genoemde vertrekreden met noemer en benoemt een gelijkspel (ronde 2 punt b). Het totaalsignaal (`_p02_signal_cell`) verhuist mee naar dit blok. De blijfintentie komt in de kop zodra hij kwetsbaar is.

**Files:**
- Modify: `backend/report_html.py` (nieuwe helpers direct onder `_p02_signal_cell`, `:635-646`; `render_exit_report_html` `:3751-3756`; `render_retention_report_html` `:4257-4270`; `render_onboarding_report_html` `:4707-4708`)
- Test: `tests/test_report_p02_mtvel.py` (nieuw); lockstep: `tests/test_report_respons_gevolgen.py` (regel 478, `test_staart_hangt_aan_de_claim_en_niet_aan_de_vertrekredentelling`)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_p02_mtvel.py`:

```python
"""Pagina twee als MT-vel (spec 2026-09-16 par. 4).

Blok 2: blijfintentie met band en zones, respons met oordeel, vertrekreden met
noemer en gelijkspel. Elke zin die hier wordt gepind komt letterlijk uit de spec
of uit de leesronde (B1, H3, ronde-2-punt b).
"""
import re

from backend.report_html import (
    _blijfintentie_cell,
    _blijfintentie_kopzin,
    _p02_cijfers_block,
    _respons_oordeel,
    _vertrekreden_cell,
    _vertrekreden_zin,
)

STAY_KWETSBAAR = [2.0] * 25 + [5.5] * 8 + [8.0] * 6   # n=39, gem 3.9
STAY_STERK = [8.0] * 30 + [6.0] * 9                   # n=39, gem 7.5


def _tekst(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


# ── blijfintentie ────────────────────────────────────────────────────────────

def test_blijfintentie_cel_toont_band_en_zones():
    cel = _tekst(_blijfintentie_cell(3.9, STAY_KWETSBAAR))
    assert "Blijfintentie 3.9/10" in cel
    assert "kwetsbaar" in cel
    assert "25 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_relatief_sterk():
    cel = _tekst(_blijfintentie_cell(7.5, STAY_STERK))
    assert "relatief sterk" in cel
    assert "0 van de 39 zitten onder de 5" in cel


def test_blijfintentie_cel_leeg_zonder_score():
    assert _blijfintentie_cell(None, []) == ""


def test_blijfintentie_kopzin_alleen_bij_kwetsbaar():
    assert _blijfintentie_kopzin(3.9, STAY_KWETSBAAR) == (
        "Ook de blijfintentie is kwetsbaar: 3.9/10, 25 van de 39 zitten onder de 5.")
    assert _blijfintentie_kopzin(7.5, STAY_STERK) == ""
    assert _blijfintentie_kopzin(None, []) == ""
    # Op de grens beslist de getoonde score (B15): 4.96 toont 5.0 en is geen kwetsbaar punt.
    assert _blijfintentie_kopzin(4.96, [5.0] * 12) == ""


# ── respons ──────────────────────────────────────────────────────────────────

def test_respons_oordeel_genoeg():
    assert _respons_oordeel(39, 58) == (
        "39 van de 58 ingevuld (67%): genoeg voor een betrouwbaar groepsbeeld.")


def test_respons_oordeel_onder_de_helft():
    assert _respons_oordeel(45, 150) == (
        "45 van de 150 ingevuld (30%): het beeld van wie meedeed, niet van de hele organisatie.")


def test_respons_oordeel_indicatief():
    assert _respons_oordeel(45, 180) == (
        "45 van de 180 ingevuld (25%): indicatief, geen vastgesteld startpunt.")


def test_respons_oordeel_te_weinig_voor_profiel():
    assert _respons_oordeel(8, 14) == (
        "8 van de 14 ingevuld (57%): te weinig voor een profiel per onderwerp, daarvoor zijn er minimaal 10 nodig.")


def test_respons_oordeel_zonder_noemer():
    assert _respons_oordeel(39, None) == (
        "39 ingevuld; het aantal uitgenodigden is niet vastgelegd, dus staat er geen percentage.")


# ── vertrekreden (Loep Vertrek) ──────────────────────────────────────────────

DIST = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
        {"code": "P1", "label": "Leiderschap / management", "count": 2}]
TIE = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
       {"code": "P1", "label": "Leiderschap / management", "count": 4},
       {"code": "P3", "label": "Gebrek aan groei", "count": 1}]


def test_vertrekreden_zin_met_noemer():
    assert _vertrekreden_zin(DIST, 12) == (
        "Beter aanbod elders is de meest genoemde vertrekreden (4 van de 12).")


def test_vertrekreden_zin_benoemt_gelijkspel():
    assert _vertrekreden_zin(TIE, 12) == (
        "Twee redenen zijn even vaak genoemd (4 van de 12 elk): Beter aanbod elders en Leiderschap / management.")


def test_vertrekreden_zin_leeg_zonder_redenen():
    assert _vertrekreden_zin([], 12) == ""


def test_vertrekreden_cel_gelijkspel():
    cel = _tekst(_vertrekreden_cell(TIE, 12))
    assert "4 van de 12" in cel and "even vaak" in cel


def test_cijfers_block_bouwt_een_sg_tabel():
    html = _p02_cijfers_block(["<td>a</td>", "", "<td>b</td>"])
    assert html.count("<td>") == 2 and 'class="sg' in html
    assert _p02_cijfers_block(["", ""]) == ""
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py -q
```
Verwacht: `ImportError` op `_blijfintentie_cell`.

- [ ] **Stap 3: Implementeer de helpers**

In `backend/report_html.py`, direct onder `_p02_signal_cell` (na de regel `f'<div class="sc-b">{_h(band)}</div></td>')`, `:646`):

```python
def _p02_cijfers_block(cells: list[str]) -> str:
    """Blok 2 van pagina twee (spec 16-9 par. 4): de cijfers die het MT wakker
    maken, als één statrij. Lege cellen vallen weg; zonder cellen geen tabel."""
    tds = "".join(c for c in cells if c)
    if not tds:
        return ""
    return f'<table class="sg p02-cijfers"><tr>{tds}</tr></table>'


def _blijfintentie_zones(stay_scores: list[float]) -> tuple[int, int, int, int]:
    """(onder 5, 5 tot 6,5, vanaf 6,5, n) op de individuele blijfintentiescores."""
    from backend.report_distribution import score_distribution
    vals = [v for v in stay_scores if v is not None]
    low, mid, high = score_distribution(vals)["zones"]
    return low, mid, high, len(vals)


def _blijfintentie_cell(avg_si: float | None, stay_scores: list[float]) -> str:
    """Blijfintentie met dezelfde band als de onderwerpen en de zone-verdeling (B1).

    "Blijfintentie 3.9/10: kwetsbaar. 25 van de 39 zitten onder de 5." De band
    komt uit _factor_label (dus op de getoonde score, B15), de zones uit
    score_distribution: dezelfde grenzen als de spreidingsstrook verderop.
    """
    if avg_si is None:
        return ""
    low, _mid, _high, n = _blijfintentie_zones(stay_scores)
    band = _factor_label(avg_si).lower()
    zones = f"{low} van de {n} zitten onder de 5" if n else "geen losse scores beschikbaar"
    return (f'<td><div class="sc-l">Blijfintentie</div>'
            f'<div class="sc-v" style="color:{_factor_color(avg_si)};">{_score_str(avg_si)}</div>'
            f'<div class="sc-b">{_h(band)}: {_h(zones)}</div></td>')


def _blijfintentie_kopzin(avg_si: float | None, stay_scores: list[float]) -> str:
    """De zin die de kop krijgt zodra de blijfintentie kwetsbaar is (spec par. 4 blok 2).

    Alleen dan: een blijfintentie die aandachtspunt of relatief sterk is hoort
    in blok 2, niet in de kop. Leeg als er geen score is.
    """
    if avg_si is None or _factor_label(avg_si) != "Kwetsbaar punt":
        return ""
    low, _mid, _high, n = _blijfintentie_zones(stay_scores)
    return (f"Ook de blijfintentie is kwetsbaar: {_score_str(avg_si)}, "
            f"{low} van de {n} zitten onder de 5.")


def _respons_oordeel(completed: int, invited: int | None) -> str:
    """Eén zin die zegt of de respons genoeg is (H3), op dezelfde drempels als
    _respons_caution en _respons_kernzin_staart, zodat blok 2 en de kernzin
    nooit verschillend kunnen oordelen over hetzelfde getal."""
    if not invited:
        return (f"{completed} ingevuld; het aantal uitgenodigden is niet vastgelegd, "
                f"dus staat er geen percentage.")
    pct = _respons_pct(completed, invited)
    kop = f"{completed} van de {invited} ingevuld ({pct}%)"
    if completed < MIN_AGGREGATE_N:
        return (f"{kop}: te weinig voor een profiel per onderwerp, daarvoor zijn er "
                f"minimaal {MIN_AGGREGATE_N} nodig.")
    rate = _response_rate(completed, invited)
    if rate < RESPONSE_INDICATIVE_RATE:
        return f"{kop}: indicatief, geen vastgesteld startpunt."
    if rate < RESPONSE_CAUTION_RATE:
        return f"{kop}: het beeld van wie meedeed, niet van de hele organisatie."
    return f"{kop}: genoeg voor een betrouwbaar groepsbeeld."


def _respons_cell(completed: int, invited: int | None) -> str:
    pct = _respons_pct(completed, invited)
    value = f"{pct}%" if pct is not None else "n.b."
    return (f'<td><div class="sc-l">Respons</div><div class="sc-v">{value}</div>'
            f'<div class="sc-b">{_h(_respons_oordeel(completed, invited))}</div></td>')


def _vertrekreden_top(exit_r_dist: list[dict]) -> tuple[list[dict], int]:
    """(alle redenen met de hoogste telling, die telling). Leeg zonder redenen."""
    if not exit_r_dist:
        return [], 0
    top = max(r["count"] for r in exit_r_dist)
    return [r for r in exit_r_dist if r["count"] == top], top


def _vertrekreden_zin(exit_r_dist: list[dict], n: int) -> str:
    """De meest genoemde vertrekreden met noemer; bij een gelijkspel alle
    gelijke redenen (ronde 2 punt b, scenario 08: 4 om 4)."""
    tops, cnt = _vertrekreden_top(exit_r_dist)
    if not tops:
        return ""
    if len(tops) == 1:
        return f"{tops[0]['label']} is de meest genoemde vertrekreden ({cnt} van de {n})."
    namen = _opsomming([r["label"] for r in tops])
    return (f"{_TELWOORD[len(tops)].capitalize()} redenen zijn even vaak genoemd "
            f"({cnt} van de {n} elk): {namen}.")


def _vertrekreden_cell(exit_r_dist: list[dict], n: int) -> str:
    tops, cnt = _vertrekreden_top(exit_r_dist)
    if not tops:
        return ""
    if len(tops) == 1:
        label, body = tops[0]["label"], f"meest genoemde vertrekreden, {cnt} van de {n}"
    else:
        label = _opsomming([r["label"] for r in tops])
        body = f"even vaak genoemd, {cnt} van de {n} elk"
    return (f'<td><div class="sc-l">Vertrekreden</div>'
            f'<div class="sc-v" style="font-size:14px;">{_h(label)}</div>'
            f'<div class="sc-b">{_h(body)}</div></td>')
```

`_TELWOORD` (`:1730`) en `_opsomming` (`:1295`) staan verderop in het bestand; dat mag, de functies lopen pas bij het renderen. `_TELWOORD` dekt 2 t/m 6; `exit_r_dist` telt hoogstens 5 redenen (`most_common(5)`), dus een gelijkspel van meer dan 5 kan niet.

- [ ] **Stap 4: Verwerk blok 2 en de kopzin in de drie renderers**

In `render_exit_report_html`, vervang de regels `:3751-3756` (anker `_signal_cell = _p02_signal_cell("Frictiescore"` t/m `_er_zin = f" {er_top} is de meest genoemde vertrekreden." ...`) door:

```python
    _signal_cell = _p02_signal_cell("Frictiescore", rdsp if avg_risk else "",
                                    fl if avg_risk else "")
    # Blok 2 (spec par. 4): vertrekreden met noemer en gelijkspel, respons met
    # oordeel, frictiescore. De vertrekredenzin hangt achter de kernzin; de
    # noemer van de respons hoort bij het startpunt, dus die gaat eerst.
    _er_zin = (" " + _vertrekreden_zin(data["exit_r_dist"], n)) if (exec_line and er_top) else ""
    _cijfers_html = _p02_cijfers_block([
        _vertrekreden_cell(data["exit_r_dist"], n),
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
```

In `render_retention_report_html`, vervang `:4257-4258` (anker `_signal_cell = _p02_signal_cell("Behoudssignaal"`) door:

```python
    _signal_cell = _p02_signal_cell("Behoudssignaal", _score_str(signal) if signal else "",
                                    band_lbl or "")
    _stay_scores = (data.get("intent_resp") or {}).get("stay") or []
    _cijfers_html = _p02_cijfers_block([
        _blijfintentie_cell(avg_si, _stay_scores),
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
    _si_kop = _blijfintentie_kopzin(avg_si, _stay_scores)
```
en vervang `:4269-4270` (anker `exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],` in de retention-renderer) door:

```python
    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"], verwijzing=_verwijst)
    # Kwetsbare blijfintentie hoort in de kop (B1): het rapport past zijn eigen
    # regel "onder 5,0 is kwetsbaar" toe op zijn slechtste getal. Niet in de
    # degraded staat: daar draagt de alinea van _geen_factorprofiel_note het verhaal.
    if _si_kop and not _geen_profiel:
        exec_line = f"{exec_line} {_si_kop}"
```

In `render_onboarding_report_html`, direct na `:4707-4708` (anker `_signal_cell = _p02_signal_cell("Checkpointscore"`):

```python
    _cijfers_html = _p02_cijfers_block([
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
```

Taak 4 wisselt `signal_cell_html=_signal_cell` in de drie `_bestuurlijke_read`-aanroepen om naar `cijfers_html=_cijfers_html`; tot dan is `_cijfers_html` een lokale variabele die nog niet gerenderd wordt. Dat is bewust: taak 4 verbouwt de handtekening van `_bestuurlijke_read` in één keer.

- [ ] **Stap 5: Lockstep en draaien**

`tests/test_report_respons_gevolgen.py` regel 478 pint `"Beter aanbod elders is de meest genoemde vertrekreden."` zonder noemer. Werk die assertie bij naar:

```python
    assert ("Als startpunt kiest Loep Groeiperspectief (op basis van 45 van de 150 "
            "genodigden). Beter aanbod elders is de meest genoemde vertrekreden (9 van de 45).") in tekst
```

`tests/test_report_exit_kernzin.py` regels 132-133 en 154-155 pinnen dezelfde zin zonder noemer (`"Beter aanbod elders is de meest genoemde vertrekreden."` en `f"{_SYNTHETISCH_REDENLABEL} is de meest genoemde vertrekreden."`). Voeg daar de noemer toe in de vorm `({count} van de {n})`, met `count` de telling van de bovenste reden in `_DIST_LOS` respectievelijk `_DIST_SAMENVALLEND` en `n` de `n` van `_exit_fixture` (beide staan bovenaan dat bestand; lees ze af, verzin ze niet). Staan er in die fixture twee redenen met dezelfde hoogste telling, dan verwacht de test de gelijkspelvorm `"Twee redenen zijn even vaak genoemd (... elk): A en B."`.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py tests/test_report_respons_gevolgen.py tests/test_report_exit_kernzin.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 6: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py tests/test_report_p02_mtvel.py tests/test_report_respons_gevolgen.py
git commit -m "feat(rapport): blok 2 op pagina twee: blijfintentie met band en zones, respons-oordeel, vertrekreden met noemer

test_staart_hangt_aan_de_claim: vertrekredenzin draagt nu de noemer (spec par. 4 blok 2).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 3: De kop: vlak profiel op de getoonde score, gedeelde laagste met namen, "één kwetsbaar onderwerp" met de aandachtspunten erbij

Ronde 2 punt (a): `_p02_flat_sentence` noemt de laagste factor uit de ruwe sortering terwijl drie onderwerpen dezelfde getoonde score hebben (scenario 06). H17: "aandacht op één onderwerp" belooft rust die de oranje balken niet waarmaken. Spec par. 4 blok 1: bij een gelijke laagste score noemt de zin alle gelijke onderwerpen. C11: de kop zegt het startpunt niet twee keer.

**Files:**
- Modify: `backend/report_html.py:356-373` (`def _p02_flat_sentence`), `:513-521` (`def _p02_shared_low`, vervalt), `:524-600` (`def _p02_opening`)
- Test: `tests/test_report_p02_kernzin.py` (nieuwe tests + lockstep op regels 88-96 en 302)

- [ ] **Stap 1: Schrijf de falende tests** (toevoegen aan `tests/test_report_p02_kernzin.py`, onder `test_geen_kwetsbaar_en_startpunt_wijkt_af_van_de_laagste`)

```python
# Scenario 06 uit de stresstest: drie onderwerpen tonen 6.2, de vlakke zin
# noemde er één als "laagste" (ronde 2 open punt a).
DRIE_GEDEELD = {"leadership": 6.5, "culture": 6.24, "growth": 6.22,
                "compensation": 6.15, "workload": 6.3, "role_clarity": 6.3}


def test_vlakke_zin_noemt_alle_onderwerpen_op_de_laagste_getoonde_score():
    zin = _open(DRIE_GEDEELD, primary="workload")
    assert f"laagste {L('compensation')}, {L('growth')} en {L('culture')} 6.2/10" in zin
    assert "laagste Beloning en eerlijkheid 6.2/10," not in zin


def test_gedeelde_laagste_zonder_kwetsbaar_noemt_beide_namen():
    zin = _open(GEDEELDE_LAAGSTE, primary="compensation")
    assert f"{L('compensation')} en {L('leadership')} delen de laagste score (5.8/10)" in zin
    assert "deelt de laagste score met het volgende onderwerp" not in zin


def test_een_kwetsbaar_onderwerp_noemt_de_aandachtspunten():
    # H17: één rode balk, twee oranje. De kop zegt dat er één kwetsbaar
    # onderwerp is en noemt de aandachtspunten in dezelfde adem.
    avgs = {"leadership": 5.7, "culture": 7.1, "growth": 4.7,
            "compensation": 7.1, "workload": 5.2, "role_clarity": 7.1}
    zin = _open(avgs, primary="growth")
    assert zin.startswith(f"Behoud vraagt aandacht op één kwetsbaar onderwerp: {L('growth')} (4.7/10). ")
    assert f"Daarnaast zijn {L('workload')} (5.2/10) en {L('leadership')} (5.7/10) een aandachtspunt." in zin


def test_een_kwetsbaar_onderwerp_zonder_aandachtspunten():
    zin = _open(EEN_LAGE, primary="growth")
    assert "één kwetsbaar onderwerp" in zin
    assert "Daarnaast" not in zin


def test_kop_herhaalt_het_startpunt_niet():
    # C11: "...: Groeiperspectief (4.5/10). Als startpunt kiest Loep
    # Groeiperspectief." zegt tweemaal hetzelfde. Is het startpunt het
    # eerstgenoemde kwetsbare onderwerp en heeft de startpuntzin geen eigen
    # grond, dan volstaat "Daar begint het gesprek."
    zin = _open(EEN_LAGE, primary="growth")
    assert zin.endswith("(4.5/10). Daar begint het gesprek.")
    assert "Als startpunt kiest Loep" not in zin
    zacht = _open(EEN_LAGE, primary="growth", indicatief=True)
    assert zacht.endswith("Daar begint het gesprek waarschijnlijk.")


def test_kop_herhaalt_niet_maar_grond_blijft_staan():
    # Met een grond (klein verschil, richting) blijft de volle startpuntzin: die
    # zegt iets nieuws.
    zin = _open(TWEE_LAAG, primary="growth", next_delta=0.1)
    assert f"Als startpunt kiest Loep {L('growth')}, de laagste score." in zin
    # Startpunt is niet het eerstgenoemde kwetsbare onderwerp: geen verkorting.
    zin = _open(TWEE_LAAG, scan="exit", primary="workload", tie_break_kind=None, next_delta=1.0)
    assert f"Als startpunt kiest Loep {L('workload', 'exit')}." in zin
```

De volgorde in de eerste test volgt `profile_shape`: laagst-eerst op de onafgeronde waarde (compensation 6.15, growth 6.22, culture 6.24). In `GEDEELDE_LAAGSTE` staan `leadership` en `compensation` beide op 5.85; bij exact gelijke waarden beslist de factorsleutel alfabetisch, dus compensation vóór leadership.

Werk in hetzelfde bestand de bestaande pins bij:
- regels 88-89 (`test_gedeelde_laagste_...`, zin met `deelt de laagste score met het volgende onderwerp en is het eerste gesprekspunt`) → `f"{L('compensation')} en {L('leadership')} delen de laagste score (5.8/10); als eerste gesprekspunt kiest Loep {L('compensation')}."`. Bij een gedeelde laagste zegt de zin nooit meer "en is het eerste gesprekspunt": twee onderwerpen kunnen niet samen het eerste gesprekspunt zijn, dus het startpunt wordt apart genoemd.
- regels 94-95 (startpunt culture) → `f"{L('compensation')} en {L('leadership')} delen de laagste score (5.8/10); als eerste gesprekspunt kiest Loep {L('culture')}."`.
- regel 302: `assert "aandacht op één onderwerp" in html` → `assert "aandacht op één kwetsbaar onderwerp" in html`, en de `kernzin=`-fixture in diezelfde test krijgt de nieuwe zin `"Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.5/10)."`.

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_kernzin.py -q
```
Verwacht: de vier nieuwe tests en de bijgewerkte pins falen.

- [ ] **Stap 3: Implementeer**

Vervang `_p02_flat_sentence` (`:356-373`) door:

```python
def _p02_laagste_namen(shape: dict[str, Any], labels: dict[str, str]) -> list[str]:
    """Alle onderwerpen die de laagste GETOONDE score delen, laagst-eerst.

    Ronde 2 punt (a): de vlakke zin vergeleek op de ruwe waarde en noemde in
    scenario 06 één onderwerp "laagste" terwijl er drie 6.2 tonen. De lezer ziet
    de getoonde score, dus die telt. De volgorde blijft die van
    factors_low_to_high (onafgerond, dan factorsleutel).
    """
    pairs = shape["factors_low_to_high"]
    if not pairs:
        return []
    low = pairs[0][1]
    return [labels[fk] for fk, v in pairs if v == low]


def _p02_flat_sentence(shape: dict[str, Any], labels: dict[str, str]) -> str:
    """De vlak-profiel-zin op pagina twee (spec ronde 2 par. 2.2, plan 3a taak 3).

    Zegt expliciet dat er niets uitspringt, met de echte uiterste waarden erbij,
    zodat de lezer de conclusie zelf kan narekenen. Delen meerdere onderwerpen
    de laagste getoonde score, dan staan ze allemaal in de zin.
    """
    if not shape["flat"]:
        raise ValueError("_p02_flat_sentence: alleen bij een vlak profiel")
    telwoord = _TELWOORD[shape["n_factors"]]
    laagste = _opsomming(_p02_laagste_namen(shape, labels))
    high = labels[shape["high_key"]]
    return (f"Geen enkel onderwerp springt eruit: alle {telwoord} liggen binnen "
            f"{_flat_span_woorden()} van elkaar "
            f"(laagste {laagste} {_score_str(shape['low_score'])}, "
            f"hoogste {high} {_score_str(shape['high_score'])}). "
            f"Dat is zelf de bevinding.")
```

In `_p02_opening` (`:524-600`) vervang het blok vanaf `    elif k == 0:` t/m de regel `                f"{kiest_gp} {labels[primary_key]}.")` (regels 553-576) door:

```python
    elif k == 0:
        # De laagst scorende factor is NIET altijd het startpunt (vertrekreden-
        # weging, tie-breaks). Delen meerdere onderwerpen de laagste getoonde
        # score, dan noemt de zin ze allemaal (spec 16-9 par. 4 blok 1) en kan
        # geen van beide alleen "het eerste gesprekspunt" zijn.
        namen = _p02_laagste_namen(shape, labels)
        if len(namen) > 1:
            laagste_clause = (f"{_opsomming(namen)} delen de laagste score "
                              f"({_score_str(shape['low_score'])})")
        else:
            laagste_clause = f"{namen[0]} scoort het laagst"
        gesprekspunt = ("een mogelijk eerste gesprekspunt" if indicatief
                        else "het eerste gesprekspunt")
        kiest_gp = ("als mogelijk eerste gesprekspunt kiest Loep" if indicatief
                    else "als eerste gesprekspunt kiest Loep")
        if len(namen) == 1 and shape["low_key"] == primary_key:
            return (f"Geen onderwerp scoort kwetsbaar. {laagste_clause} "
                    f"en is {gesprekspunt}.")
        return (f"Geen onderwerp scoort kwetsbaar. {laagste_clause}; "
                f"{kiest_gp} {labels[primary_key]}.")
```

en het blok vanaf `    elif k <= 2:` t/m `        kop = f"{zacht} {onderwerp}: {namen}."` (regels 577-591) door:

```python
    elif k <= 2:
        vuln = [(fk, v) for fk, v in shape["factors_low_to_high"] if v < ZONE_LOW]
        onderwerp = "één kwetsbaar onderwerp" if k == 1 else "twee kwetsbare onderwerpen"
        namen = ", ".join(f"{labels[fk]} ({_score_str(v)})" for fk, v in vuln)
        kop = f"{zacht} {onderwerp}: {namen}."
        # H17: "één onderwerp" beloofde rust die de oranje balken niet
        # waarmaken. De aandachtspunten (5,0 tot 6,5) staan daarom in dezelfde adem.
        aandacht = [(fk, v) for fk, v in shape["factors_low_to_high"]
                    if ZONE_LOW <= v < ZONE_HIGH]
        if aandacht:
            lijst = _opsomming([f"{labels[fk]} ({_score_str(v)})" for fk, v in aandacht])
            werkwoord = "is" if len(aandacht) == 1 else "zijn"
            kop += f" Daarnaast {werkwoord} {lijst} een aandachtspunt."
```

Vervang het slot van `_p02_opening` (regels 595-600, anker `return f"{kop} " + _p02_startpunt_zin(`) door:

```python
    start = _p02_startpunt_zin(
        labels[primary_key], tie_break_kind=tie_break_kind, change=change,
        change_other=change_other, next_delta=next_delta,
        direction_state_key=direction_state_key,
        primary_is_lowest=shape["low_key"] == primary_key,
        indicatief=indicatief)
    # C11: "...: Groeiperspectief (4.7/10). Als startpunt kiest Loep
    # Groeiperspectief." is één mededeling in twee zinnen. Alleen als het
    # startpunt het eerstgenoemde kwetsbare onderwerp is EN de startpuntzin
    # geen eigen grond draagt (kale vorm), volstaat een korte vervolgzin. Een
    # zin met grond (klein verschil, gelijkstand, richting) zegt iets nieuws en
    # blijft staan.
    kiest = "Als mogelijk startpunt kiest Loep" if indicatief else "Als startpunt kiest Loep"
    if (1 <= k <= 2 and shape["factors_low_to_high"][0][0] == primary_key
            and start == f"{kiest} {labels[primary_key]}."):
        start = ("Daar begint het gesprek waarschijnlijk." if indicatief
                 else "Daar begint het gesprek.")
    return f"{kop} {start}"
```

Verwijder `_p02_shared_low` (`:513-521`); zijn enige aanroeper was de vervangen tak. Controleer: `grep -rn "_p02_shared_low" backend/ tests/` geeft niets.

Lockstep voor C11 (alleen pins waar het startpunt het eerstgenoemde kwetsbare onderwerp is én de zin kaal was):
- `tests/test_report_respons_gevolgen.py` regels 221-224 (`test_kale_keuze_wordt_een_mogelijk_startpunt`): `endswith("Daar begint het gesprek.")` en `endswith("Daar begint het gesprek waarschijnlijk.")`.
- `tests/test_report_respons_gevolgen.py` regel 455 (`test_scenario_16b_...`): `("Daar begint het gesprek waarschijnlijk (op basis van 45 van de 180 genodigden).") in tekst`.
- `tests/test_report_respons_gevolgen.py` regel 475 (`test_staart_hangt_aan_de_claim_...`): `("Daar begint het gesprek (op basis van 45 van de 150 genodigden). Beter aanbod elders is de meest genoemde vertrekreden (9 van de 45).") in tekst`.
- `tests/test_report_p02_kernzin.py` regel 173 en 203 (`VLAK`, k=0) en `tests/test_report_exit_kernzin.py` regel 132 en 154 (startpunt leadership, eerstgenoemd growth): blijven ongewijzigd, de verkorting vuurt daar niet. Draai ze om dat te bevestigen.

- [ ] **Stap 4: Draai, verwacht slagen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_kernzin.py tests/test_report_p02_profielvorm.py tests/test_report_respons_gevolgen.py tests/test_report_degraded_page_two.py -q
```
Verwacht: alles `passed`. `test_report_respons_gevolgen.py` regels 251-255 pinnen `"... scoort het laagst en is het eerste gesprekspunt."` op `_GEEN_KWETSBAAR` (growth 5.1 uniek laagste): blijft gelden.

- [ ] **Stap 5: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py tests/test_report_p02_kernzin.py
git commit -m "fix(rapport): kop p.02 vergelijkt op de getoonde score, noemt gedeelde laagste en de aandachtspunten

test_report_p02_kernzin: pins op 'één onderwerp' en 'deelt de laagste score' bijgewerkt (spec par. 4 blok 1, H17, ronde 2 punt a).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---
## Taak 4: Onderbouwing zonder lege redenen, noemer bij "X van de Y", één gespreksopener

C10: het why-blok op p.02 bevatte twee cellen die geen reden zijn (totaalsignaal, "wat wél werkt"); die verhuizen naar blok 2 (taak 2) respectievelijk vervallen (het overzichtsprofiel toont de sterke onderwerpen al). Cellen met een echte reden komen erbij: spreiding en verdieping, uit de rasterrij van het startpunt. H1: "11 van de 15" krijgt zijn noemer ter plekke. H9: p.02 en de gespreksagenda dragen dezelfde gespreksopener; `_short_mgmt_q` vervalt.

**Files:**
- Modify: `backend/report_html.py:1334-1391` (`def _bestuurlijke_read`), `:2317-2350` (`def _direction_p02_line`), `:2401-2412` (`def _short_mgmt_q`, vervalt), `:2415-2434` (`def _deepening_mgmt_q`), `:1999-2016` (navy slotblok in `_prioriteringsraster`), de drie renderers (`:3773-3880`, `:4189-4309`, `:4654-4761`) en de raster-aanroepen (`:4051-4069`, `:4468-4484`)
- Test: `tests/test_report_p02_mtvel.py` (aanvullen); lockstep: `tests/test_pdf_redesign.py:69-76`, `tests/test_report_html_design.py:22-45, 227-250`, `tests/test_report_leesbaarheid.py:99-104`, `tests/test_report_p02_kernzin.py:291-302, 356-359, 383-395`, `tests/test_report_priority_attribution.py:103-108`, `tests/test_direction_report_block.py:238-253, 460-461`, `tests/test_direction_renderer_wiring.py` (regex op `mq-direction` blijft werken)

- [ ] **Stap 1: Schrijf de falende tests** (toevoegen aan `tests/test_report_p02_mtvel.py`)

```python
from backend.report_html import (
    _bestuurlijke_read,
    _direction_p02_line,
    _gespreksopener,
    _p02_why_extra_cells,
    _mgmt_q,
)
from tests.test_report_priority_render import RANKED

CLEAR = {"lowest_n": 9, "offered": 9, "answered": 8, "skipped": 1,
         "counts": {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}}


def test_bestuurlijke_read_heeft_geen_lege_redenen_meer():
    html = _bestuurlijke_read(kernzin="K.", primary_label="Groeiperspectief",
                              why_cells_html="<td class='why-cell'>x</td>", mgmt_q="V?",
                              cijfers_html="<table class='sg p02-cijfers'><tr><td>c</td></tr></table>")
    assert "wat w&eacute;l werkt" not in html and "Relatief sterk" not in html
    assert "<table class='sg'><tr>" not in html          # de oude onderbouwingsrij
    assert html.index("p02-cijfers") < html.index('class="why"')
    assert "<!-- /why -->" in html


def test_why_extra_cellen_alleen_bij_echte_signalen():
    top = dict(RANKED[0], spread_n=39, spread_below=21, spread_flag=True)
    cells = _tekst(_p02_why_extra_cells(top, "retention"))
    assert "Spreiding 21 van de 39 onder de 5" in cells
    assert "Verdieping 7 van de 13 kozen" in cells
    kaal = dict(RANKED[3], spread_n=6, spread_below=1, spread_flag=False)   # state 5, n<10
    assert _p02_why_extra_cells(kaal, "retention") == ""


def test_direction_p02_line_draagt_de_noemer_ter_plekke():
    zin = _direction_p02_line({"growth": CLEAR}, "growth", "retention", 5.1)
    assert zin.startswith("Wat er volgens 6 van de 8 mensen bij wie dit het laagst scoorde moet gebeuren: ")


def test_een_gespreksopener_voor_p02_en_agenda():
    # Zonder verdiepingsdata: de vaste vraag per onderwerp, op beide plekken dezelfde.
    assert _gespreksopener({}, "retention", "growth") == _mgmt_q("growth", "retention")
    # Met een gedeelde toelichting: de datagedreven vraag. Echte optiesleutels,
    # want agenda_enrichment slaat de agendavraag op sleutel op en faalt hard op
    # een onbekende.
    keys = [o["key"] for o in DEEPENING_SETS["growth"]["options"] if not o["key"].endswith("_other")]
    agg = {"triggered": 17, "offered": 17, "answered": 16, "skipped": 1,
           "primary_counts": {keys[0]: 8, keys[1]: 4, keys[2]: 4},
           "secondary_counts": {}}
    q = _gespreksopener({"growth": agg}, "retention", "growth")
    assert q.startswith("De meest gekozen toelichting was") and "Herkennen jullie dat beeld" in q
```

Importeer bovenaan `from backend.products.shared.deepening import DEEPENING_SETS`. `RANKED[0]` heeft `deepening_state=1` met `top=("growth_no_path", 7, 13)`; `_p02_why_extra_cells` haalt de optietekst met `.get(key, key)`, dus die synthetische sleutel geeft de sleutel zelf terug en de assertie kijkt alleen naar de telling.

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py -q
```
Verwacht: `ImportError` op `_gespreksopener`.

- [ ] **Stap 3: Implementeer**

Vervang `_bestuurlijke_read` (`:1334-1391`) volledig door:

```python
def _bestuurlijke_read(*, kernzin: str, primary_label: str, why_cells_html: str,
                       mgmt_q: str, mgmt_q_source: str = "",
                       cijfers_html: str = "", leidraad_html: str = "",
                       responsbasis_html: str = "", opener_html: str = "",
                       direction_line: str = "", brug_zin: str = "",
                       degraded_note: str = "", why_title: str = "",
                       scope_note: str = "") -> str:
    """Pagina twee als MT-vel (spec 16-9 par. 4), in vaste blokvolgorde:
    1 kernzin, 2 cijfers (cijfers_html, taak 2), 3 startpunt en waarom (why-blok
    met alleen echte redenen, C10), 4 gespreksopener (dezelfde als op de agenda,
    H9), 5 leidraad (leidraad_html, taak 5), 6 meetgegevens (responsbasis_html).

    brug_zin (taak 7) is de zin die organisatiebreed en per afdeling aan elkaar
    knoopt; leeg als er geen afdeling wordt aangewezen.

    Degraded (bug B2): zonder factorprofiel rendert één expliciete alinea in
    plaats van het why-blok; cijfers en meetgegevens blijven staan, want die
    zijn er in die staat wél. De marker <!-- /why --> sluit het why-blok, zodat
    tests de grens niet uit de whitespace hoeven af te leiden.
    """
    if degraded_note:
        body = (f'<div class="card accent">'
                f'<h3>Wat dit rapport wel en niet laat zien</h3>'
                f'<p style="max-width:62ch;margin-bottom:0;">{_h(degraded_note)}</p></div>'
                f'<!-- /why -->')
    else:
        why_title_html = (_h(why_title) if why_title
                          else f"Waarom {_h(primary_label)} bovenaan staat")
        source_html = f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ""
        direction_html = f'<p class="mq-direction">{_h(direction_line)}</p>' if direction_line else ""
        brug_html = f'<p class="mq-brug">{_h(brug_zin)}</p>' if brug_zin else ""
        body = f"""<div class="why">
    <div class="why-title">{why_title_html}</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
    <div class="mq-line"><span class="mq-label">Gespreksopener</span><p>{_h(mgmt_q)}</p>{source_html}{direction_html}{brug_html}</div>
  </div><!-- /why -->"""
    scope_html = (f'<p class="trustline" style="margin-top:-14px;margin-bottom:18px;">'
                  f'{_h(scope_note)}</p>') if scope_note else ""
    return f"""<div class="pb sec" id="p02">
  {opener_html or '<span class="slabel">Bestuurlijke read</span>'}
  <p class="br-kernzin">{_h(kernzin)}</p>
  {scope_html}
  {cijfers_html}
  {body}
  {leidraad_html}
  {responsbasis_html}
</div>"""
```

Voeg in `backend/report_css.py`, direct na de regel `.mq-direction { ... }`, toe:

```css
.mq-brug { font-size: 10.5px; color: #374151; margin: 8px 0 0; }
```

Voeg direct onder `_p02_cijfers_block` toe:

```python
def _p02_why_extra_cells(top_row: dict, scan_type: str) -> str:
    """Extra why-cellen die echt een reden zijn (spec par. 4 blok 3): spreiding
    (alleen boven MIN_DISTRIBUTION_N, dezelfde staffel als de rasterkolom) en de
    gedeelde toelichting uit de verdieping (alleen in celstaat 1). Beide komen
    uit de rasterrij van het startpunt, dus p.02 en het raster tonen dezelfde
    getallen."""
    cells = ""
    if top_row["spread_n"] >= MIN_DISTRIBUTION_N:
        cells += (f'<td class="why-cell"><div class="why-l">Spreiding</div>'
                  f'<div class="why-v" style="color:{_factor_color(top_row["score"])};">'
                  f'{top_row["spread_below"]}</div>'
                  f'<div class="why-b">van de {top_row["spread_n"]} onder de 5</div></td>')
    if top_row["deepening_state"] == 1 and top_row["deepening_top"]:
        key, cnt, answered = top_row["deepening_top"]
        opt = _deepening_option_texts(scan_type, top_row["key"]).get(key, key)
        cells += (f'<td class="why-cell"><div class="why-l">Verdieping</div>'
                  f'<div class="why-v">{cnt}</div>'
                  f'<div class="why-b">van de {answered} kozen: {_h(opt)}</div></td>')
    return cells
```

Vervang `_short_mgmt_q` (`:2401-2412`) door:

```python
def _gespreksopener(deep_agg: dict, scan_type: str, factor_key: str) -> str:
    """De ene gespreksopener van dit rapport (H9): op pagina twee en op de
    gespreksagenda dezelfde zin. Datagedreven zodra de verdieping een gedeelde
    toelichting heeft (_deepening_mgmt_q), anders de vaste vraag per onderwerp."""
    return _deepening_mgmt_q(deep_agg, scan_type, factor_key) or _mgmt_q(factor_key, scan_type)
```

Controleer daarna `grep -rn "_short_mgmt_q" backend/ tests/`: leeg.

In `_direction_p02_line` (`:2330-2336`) vervang de twee zinnen:

```python
    if st["state"] == "clear":
        return (f"Wat er volgens {st['top_n']} van de {n} mensen bij wie dit het laagst "
                f"scoorde moet gebeuren: "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    if st["state"] == "plurality":
        return (f"Wat er volgens de grootste groep moet gebeuren ({st['top_n']} van "
                f"de {n} mensen bij wie dit het laagst scoorde, zonder meerderheid): "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
```

In `_prioriteringsraster` (`:2004-2008`, anker `<div class="agenda-opener">` in het navy slotblok) vervang de `<p ...>{_h(opener_vraag)}</p>`-regel door:

```python
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(opener_vraag)}</p>
      {'<p class="agenda-why" style="margin-top:6px;">Dezelfde opener staat op pagina 2.</p>' if ranked else ''}
```

`ranked` is daar een parameter; zonder rasterrijen staat op p.02 geen opener (degraded), dus dan geen verwijzing.

In de drie renderers:

*Exit* (`:3809-3823`, anker `_short_q = _short_mgmt_q(_deep_agg_early, "exit", tf)`): vervang het `if _short_q: ... else: ...`-blok door:

```python
        why_cells += _p02_why_extra_cells(_raster_rows[0], "exit")
        primary_fkey  = tf
        primary_label = tf_lbl
        br_mgmt_q = _gespreksopener(_deep_agg_early, "exit", tf)
        br_mgmt_q_source = _raster_attribution(_raster_rows, "exit")
```
Verwijder `:3841-3847` (`totaalbeeld = (...)`). In de `_bestuurlijke_read`-aanroep (`:3863-3880`) verwijder `totaalbeeld=`, `strong_label=`, `strong_score=`, `usage_html=`, `signal_cell_html=` en voeg `cijfers_html=_cijfers_html,` toe. In de exit-`Hoofdreden`-cel (`:3797`) vervang de body `van {n} vertrekkers de meest genoemde reden` door de eerlijke variant:

```python
        if er_n:
            _tops, _top_cnt = _vertrekreden_top(data["exit_r_dist"])
            if er_n == _top_cnt and len(_tops) == 1:
                _hr_body = f"van {n} vertrekkers de meest genoemde reden"
            elif er_n == _top_cnt:
                _anderen = _opsomming([r["label"] for r in _tops if r["code"] != tf_code])
                _hr_body = f"van {n} vertrekkers, even vaak genoemd als {_anderen}"
            else:
                _hr_body = f"van {n} vertrekkers; {_tops[0]['label']} vaker ({_top_cnt} keer)"
            why_cells += f'<td class="why-cell"><div class="why-l">Hoofdreden</div><div class="why-v" style="color:{tf_col};">{er_n}&times;</div><div class="why-b">{_h(_hr_body)}</div></td>'
```
In de raster-aanroep (`:4052-4063`) vervang `_enriched_q = (...)` en `mgmt_q=_enriched_q or (...)` door `mgmt_q=(_gespreksopener(deep_agg, "exit", _startpunt_fk) if _startpunt_fk else (nsp.get("first_decision") or ""))`.

*Retention* (`:4214-4220`): idem met `ST`; verwijder `:4274-4278` (`totaalbeeld`); aanroep `:4292-4309` idem; raster-aanroep `:4469-4478` idem.

*Onboarding* (`:4672-4674`): `br_mgmt_q = _mgmt_q(tf, ST)` blijft (geen verdieping); verwijder `:4724-4728`; aanroep `:4743-4761`: verwijder `totaalbeeld=`, `strong_label=`, `strong_score=`, `usage_html=`, `signal_cell_html=`, voeg `cijfers_html=_cijfers_html,` toe. Onboarding heeft geen rasterrij, dus geen `_p02_why_extra_cells`. Het argument `leesroute=GEBRUIKSBLOK_LEESROUTE_ONBOARDING` verdwijnt mee met `usage_html`; de constanten `GEBRUIKSBLOK_*` en `_gebruiksblok` zelf verwijdert taak 5.

- [ ] **Stap 4: Lockstep van de zes testbestanden**

In elke `_bestuurlijke_read(`-aanroep in `tests/test_pdf_redesign.py:69-76`, `tests/test_report_html_design.py:22-30, 36-44, 231-239`, `tests/test_report_leesbaarheid.py:99-103`, `tests/test_report_p02_kernzin.py:291-293, 299-301, 356-359, 383-386, 392-394`, `tests/test_report_priority_attribution.py:103-106`: verwijder de kwargs `totaalbeeld=`, `strong_label=`, `strong_score=`. In `test_report_p02_kernzin.py:383-395` (`test_signaalgetal_verhuist...` en `test_onderbouwingsrij_blijft_weg...`): vervang `signal_cell_html=cel` door `cijfers_html=_p02_cijfers_block([cel])` en de asserties `"<table class='sg'><tr>" in html` / `not in html` door `'class="sg p02-cijfers"' in html` / `not in html` (importeer `_p02_cijfers_block`). In `tests/test_report_html_design.py:240-250` vervang de regel met `why_close = html.index("</div>\n  \n  \n</div>")` door `why_close = html.index("<!-- /why -->")`, verwijder de assertie op `"Relatief sterk"` (die cel bestaat niet meer, C10) en laat de assertie op de managementvraag staan. In `tests/test_direction_report_block.py:238` en `:460-461`: voeg ` mensen bij wie dit het laagst scoorde` toe achter `6 van de 8` respectievelijk `27 van de 62`.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py tests/test_pdf_redesign.py tests/test_report_html_design.py tests/test_report_leesbaarheid.py tests/test_report_p02_kernzin.py tests/test_report_priority_attribution.py tests/test_direction_report_block.py tests/test_direction_renderer_wiring.py tests/test_report_priority_consistency.py tests/test_report_degraded_page_two.py -q
```
Verwacht: alles `passed` behalve `tests/test_report_leesbaarheid.py::test_gebruiksblok_op_openingspagina` (pint het gebruiksblok dat pas in taak 5 wordt vervangen; laat hem tot dan rood en noteer dat in de commit) en `tests/test_report_design_sprong.py::test_openingspagina_bevat_read_en_responsbasis_in_een_sectie` (zoekt "Uitgenodigd" na "Bestuurlijke read"; blijft groen zolang `_responsbasis` nog "Uitgenodigd" rendert, controleer).

- [ ] **Stap 5: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt
```
Verwacht: precies één extra regel, `tests/test_report_leesbaarheid.py::test_gebruiksblok_op_openingspagina` (tijdelijk, taak 5 lost hem op). Elke andere afwijking is een regressie.

```bash
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): p.02 onderbouwing met alleen echte redenen, noemer ter plekke, één gespreksopener

C10/H1/H9. _short_mgmt_q vervangen door _gespreksopener; _bestuurlijke_read zonder totaalbeeld/strong/signal-slots. Lockstep: 6 testbestanden. test_gebruiksblok_op_openingspagina tijdelijk rood tot taak 5.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 5: "Zo leid je dit gesprek in 45 minuten", paginaverwijzingen, meetgegevens met datums

H4: paginanummers overal waar naar een sectie wordt verwezen. H5: de zin over de begeleide managementbespreking verdwijnt; het gebruiksblok wordt de leidraad. H8: meetgegevens met datums. De paginanummers komen uit WeasyPrint (`target-counter`), dus in de HTML staat alleen een leeg `<a class="pref" href="#id"></a>`; de tekst ervoor zegt "pagina ". De test bewaakt de structuur (elke verwijzing wijst naar een bestaande, unieke `id`); de PDF-check in taak 6 bewaakt het resultaat.

**Files:**
- Modify: `backend/report_html.py:1165-1214` (`GEBRUIKSBLOK_*` en `_gebruiksblok`, vervallen), `:1217-1238` (`class _ChapterCounter`), `:1394-1469` (`DATASTATUS_*`, `_responsbasis`), de drie renderers (openers van de secties krijgen `anchor=`), `backend/report_css.py`
- Test: `tests/test_report_p02_mtvel.py` (aanvullen); lockstep: `tests/test_report_leesbaarheid.py:107-113`, `tests/test_report_design_sprong.py:6-30`, `tests/test_report_html_design.py:144-167`, `tests/test_pdf_redesign.py:54-63`, `tests/test_report_respons_gevolgen.py:325-360`, `tests/test_report_onboarding_eerlijk.py:137-149`, `tests/test_report_degraded_page_two.py` (leesroute-pins, zie stap 4)

- [ ] **Stap 1: Schrijf de falende tests** (toevoegen aan `tests/test_report_p02_mtvel.py`)

```python
import re as _re

from backend.report_html import (
    LEIDRAAD_ANKERS,
    _ChapterCounter,
    _leidraad_block,
    _pref,
    _responsbasis,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _fixture as _degraded_fixture
from tests.test_report_distribution import _min_retention_data


def test_pref_is_een_lege_anker_die_weasyprint_vult():
    assert _pref("sec-agenda") == '<a class="pref" href="#sec-agenda"></a>'


def test_opener_zet_het_anker_op_de_hoofdstukkop():
    ch = _ChapterCounter()
    html = ch.opener("Overzichtsprofiel", anchor="sec-overzicht")
    assert '<div class="ch-head" id="sec-overzicht">' in html


def test_leidraad_heeft_vijf_tijdvakken_met_paginaverwijzingen():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True, has_direction=True)
    tekst = _tekst(html)
    assert "Zo leid je dit gesprek in 45 minuten" in tekst
    for tijd in ("0-5 min", "5-12 min", "12-25 min", "25-33 min", "33-45 min"):
        assert tijd in tekst
    assert html.count('class="pref"') >= 5
    assert "begeleide managementbespreking" not in tekst
    assert "pagina " in tekst


def test_leidraad_zonder_afdelingen_valt_terug_op_toelichtingen_of_werkbeleving():
    met_quotes = _tekst(_leidraad_block("retention", has_segments=False, has_quotes=True, has_direction=True))
    assert "Per afdeling" not in met_quotes and "Wat mensen zelf schreven" in met_quotes
    zonder = _tekst(_leidraad_block("retention", has_segments=False, has_quotes=False, has_direction=True))
    assert "Werkbeleving" in zonder


def test_elke_paginaverwijzing_wijst_naar_precies_een_anker():
    for html in (render_retention_report_html(_min_retention_data()),
                 render_exit_report_html(_degraded_fixture("exit", n=12, profile=True)),
                 render_onboarding_report_html(_degraded_fixture("onboarding", n=12, profile=True))):
        body = html.split("</style>")[-1]
        hrefs = _re.findall(r'<a class="pref" href="#([a-z0-9-]+)"></a>', body)
        assert hrefs, "geen paginaverwijzingen gevonden"
        for h in set(hrefs):
            assert body.count(f'id="{h}"') == 1, f"anker {h} moet precies één keer bestaan"


def test_meetgegevens_tonen_datums_of_zeggen_dat_ze_ontbreken():
    met = _tekst(_responsbasis(invited=58, completed=39, period="Loep Behoud Voorjaar 2026",
                               population="Actieve medewerkers", segment_available=True,
                               period_start="9 maart 2026", period_end="30 maart 2026"))
    assert "Meetperiode 9 maart 2026 tot 30 maart 2026" in met
    assert "Uitgenodigd 58" in met and "Ingevuld 39" in met
    zonder = _tekst(_responsbasis(invited=58, completed=39, period="Loep Behoud Voorjaar 2026",
                                  population="Actieve medewerkers", segment_available=True))
    assert "Meetperiode niet vastgelegd" in zonder
    assert "Loep Behoud Voorjaar 2026" in zonder     # de naam van de meting blijft staan


def test_meetgegevens_zeggen_wat_niet_in_dit_rapport_staat():
    html = _tekst(_responsbasis(invited=58, completed=39, period="W", population="P",
                                segment_available=False, segment_reason="te weinig antwoorden per afdeling",
                                enps_available=False))
    assert "Niet in dit rapport: afdelingen (te weinig antwoorden per afdeling), werkgeversaanbeveling (eNPS)" in html
    assert "Segmentstatus" not in html and "Datastatus" not in html and "Populatie" not in html


def test_gebruiksblok_en_begeleide_bespreking_zijn_weg():
    html = render_retention_report_html(_min_retention_data())
    assert "Zo gebruik je dit rapport" not in html
    assert "begeleide managementbespreking" not in html
    assert "Zo leid je dit gesprek in 45 minuten" in html
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py -q
```
Verwacht: `ImportError` op `LEIDRAAD_ANKERS`.

- [ ] **Stap 3: CSS voor paginaverwijzingen**

In `backend/report_css.py`, direct na `.mq-source { ... }`:

```css
/* Paginaverwijzing (H4): WeasyPrint vult het nummer via target-counter; in
   Chromium (stresstest-harnas) blijft het anker leeg. De tekst ervoor zegt
   "pagina ". Geverifieerd in ghcr.io/weasyprint/weasyprint op 2026-09-16. */
a.pref { text-decoration: none; color: inherit; }
a.pref::after { content: target-counter(attr(href), page); }
/* Leidraad (spec par. 4 blok 5) */
.leidraad { margin-top: 18px; border-top: 1px solid """ + HAIRLINE + r"""; padding-top: 12px; }
.leidraad-title { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 13px; color: """ + INK + r"""; margin-bottom: 6px; }
.leidraad table { width: 100%; border-collapse: collapse; }
.leidraad td { font-size: 10px; color: #374151; padding: 3px 6px 3px 0; vertical-align: top; border-bottom: 1px solid """ + HAIRLINE + r"""; line-height: 1.45; }
.leidraad td.lt { width: 13%; font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: """ + STEEL + r"""; white-space: nowrap; }
.leidraad td.lw { width: 34%; font-weight: 600; color: """ + INK + r"""; }
```

- [ ] **Stap 4: Implementeer ankers, leidraad en meetgegevens**

Vervang `_ChapterCounter` (`:1217-1238`) door:

```python
class _ChapterCounter:
    """Afgeleide hoofdstuknummering (designsprong §4). opener() emit de kop op
    het moment dat een sectie echt wordt gerenderd; conditionele secties
    schuiven zo op zonder gaten. anchor zet een id op de kop, zodat een
    paginaverwijzing (_pref) ernaartoe kan wijzen (H4)."""

    def __init__(self) -> None:
        self.n = 0

    def opener(self, title: str, *, kicker: str | None = None,
               anchor: str | None = None) -> str:
        self.n += 1
        kicker_html = f'<span class="ch-kicker">{kicker}</span>' if kicker else ""
        id_attr = f' id="{anchor}"' if anchor else ""
        return (f'<div class="ch-head"{id_attr}><span class="ch-idx">{self.n:02d}</span>'
                f'<h2 class="ch-title">{title}</h2></div><hr class="ch-rule">'
                f'{kicker_html}')

    @staticmethod
    def vervolg(eyebrow: str) -> str:
        return f'<span class="slabel">{eyebrow} (vervolg)</span>'


def _pref(anchor: str) -> str:
    """Lege anker die WeasyPrint met het paginanummer vult (zie a.pref in de CSS)."""
    return f'<a class="pref" href="#{anchor}"></a>'


# Vaste ankers per sectie. Eén bron: de renderers zetten ze op de hoofdstukkop,
# de leidraad en de inline verwijzingen wijzen ernaar. Ontbreekt een sectie in
# een rapport (bijv. geen afdelingen), dan mag er ook geen verwijzing naar staan.
LEIDRAAD_ANKERS = {
    "context": "sec-context",          # vertrekcontext / behoudscontext / checkpointoverzicht
    "overzicht": "sec-overzicht",      # overzichtsprofiel
    "verdieping": "sec-verdieping",    # eerste verdiepingspagina (startpunt)
    "werkbeleving": "sec-werkbeleving",
    "afdelingen": "sec-afdelingen",
    "toelichtingen": "sec-toelichtingen",
    "agenda": "sec-agenda",
    "methodiek": "sec-methodiek",
    "drempels": "sec-drempels",        # drempeltabel op de methodiekpagina (taak 11)
}


def _leidraad_block(scan_type: str, *, has_segments: bool, has_quotes: bool,
                    has_direction: bool) -> str:
    """"Zo leid je dit gesprek in 45 minuten" (spec par. 4 blok 5): vijf regels
    met tijdvak, wat je op tafel legt en de paginaverwijzing. Vervangt het
    gebruiksblok en de zin over de begeleide managementbespreking (H5): de
    HR-manager is de facilitator, dit is haar script.

    Regel 4 volgt de data: afdelingen als die er zijn, anders de open
    toelichtingen, anders de werkbeleving. Nooit een verwijzing naar een
    sectie die dit rapport niet heeft.
    """
    A = LEIDRAAD_ANKERS
    p = _pref
    context = {"exit": "de vertrekredenen", "retention": "de blijfintentie en het behoudssignaal",
               "onboarding": "de checkpointscore"}[scan_type]
    if has_segments:
        rij4 = ("Per afdeling", f"Waar het per afdeling begint, en hoe dat zich verhoudt tot het "
                                f"startpunt (pagina {p(A['afdelingen'])}).")
    elif has_quotes:
        rij4 = ("Wat mensen zelf schreven", f"De open toelichtingen, ongefilterd (pagina {p(A['toelichtingen'])}).")
    else:
        rij4 = ("Werkbeleving", f"Autonomie, competentie en verbondenheid (pagina {p(A['werkbeleving'])}).")
    slot = ("Wat er volgens je mensen moet gebeuren, en het besluit: één prioriteit, één eigenaar, "
            f"een vervolgmoment (pagina {p(A['agenda'])})."
            if has_direction else
            f"Het eerste gesprekspunt en het besluit: één prioriteit, één eigenaar, een vervolgmoment (pagina {p(A['agenda'])}).")
    rijen = [
        ("0-5 min", "Hoe stevig is dit", "De respons en de meetgegevens op deze pagina; de drempels staan op "
                                         f"pagina {p(A['methodiek'])}."),
        ("5-12 min", "Het beeld in één plaatje", f"Het cijferoverzicht (pagina {p(A['overzicht'])}) en {context} "
                                                 f"(pagina {p(A['context'])}). Vraag: verrast dit iemand?"),
        ("12-25 min", "Waar het wringt, en waarom",
         (f"De verdieping van het startpunt: de laagste stelling en wat mensen als toelichting "
          f"kozen (pagina {p(A['verdieping'])}). Open met de gespreksopener hierboven."
          if scan_type != "onboarding" else
          f"Het startpunt: de score en de laagste stelling (pagina {p(A['verdieping'])}). "
          f"Open met de gespreksopener hierboven.")),
        ("25-33 min", *rij4),
        ("33-45 min", "Wat gaan we doen", slot),
    ]
    trs = "".join(f'<tr><td class="lt">{_h(t)}</td><td class="lw">{_h(w)}</td><td>{body}</td></tr>'
                  for t, w, body in rijen)
    return (f'<div class="leidraad"><div class="leidraad-title">Zo leid je dit gesprek in 45 minuten</div>'
            f'<table>{trs}</table>'
            f'<p class="trustline" style="margin-top:6px;">Dit rapport is een groepsbeeld van de organisatie, '
            f'geen beoordeling van personen of afdelingen.</p></div>')
```

De `body`-kolom bevat de `<a class="pref">`-ankers en gaat daarom bewust niet door `_h()`; de andere twee kolommen wel.

Verwijder `GEBRUIKSBLOK_LEESROUTE`, `GEBRUIKSBLOK_LEESROUTE_ONBOARDING`, `GEBRUIKSBLOK_LEESROUTE_DEGRADED` en `_gebruiksblok` (`:1165-1214`). Controleer `grep -rn "GEBRUIKSBLOK\|_gebruiksblok" backend/ tests/`: leeg.

Vervang `DATASTATUS_VERVOLG`, `DATASTATUS_VERVOLG_ONBOARDING` en `_responsbasis` (`:1394-1469`) door:

```python
def _responsbasis(*, invited: int | None, completed: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "",
                  enps_available: bool = True, compact: bool = True,
                  note: str = "", period_start: str | None = None,
                  period_end: str | None = None) -> str:
    """Meetgegevens, blok 6 van pagina twee (spec par. 4): uitgenodigd, ingevuld,
    respons, meetperiode als datums (H8) en één regel met wat niet in dit
    rapport staat. `note` alleen zonder noemer: de zin uit `_respons_noemer`.

    De losse kaarten Populatie, Segmentstatus en Datastatus zijn hierin
    opgegaan (H16: de laatste ervan viel als enige regel op pagina drie).
    `compact` bestaat nog voor aanroepers die de band als eigen sectie willen;
    de drie renderers gebruiken hem compact.
    """
    if invited is None:
        stat_cells = f'<td><div class="sc-l">Ingevuld</div><div class="sc-v">{completed}</div></td>'
    else:
        stat_cells = (
            f'<td><div class="sc-l">Uitgenodigd</div><div class="sc-v">{invited}</div></td>'
            f'<td><div class="sc-l">Ingevuld</div><div class="sc-v">{completed}</div></td>'
            f'<td><div class="sc-l">Respons</div>'
            f'<div class="sc-v">{_respons_pct(completed, invited)}%</div></td>'
        )
    if period_start and period_end:
        periode = f"{period_start} tot {period_end}"
    elif period_start:
        periode = f"vanaf {period_start}, sluitdatum niet vastgelegd"
    elif period_end:
        periode = f"tot {period_end}, startdatum niet vastgelegd"
    else:
        periode = "niet vastgelegd"
    stat_cells += (f'<td><div class="sc-l">Meetperiode</div>'
                   f'<div class="sc-v" style="font-size:12px;">{_h(periode)}</div>'
                   f'<div class="sc-b">{_h(period)} &middot; {_h(population)}</div></td>')

    caution = _respons_caution(completed, invited, note)
    caution_html = (f'<p class="trustline" style="margin-top:6px;">{_h(caution)}</p>'
                    if caution else "")

    ontbreekt: list[str] = []
    if not segment_available:
        ontbreekt.append(f"afdelingen ({segment_reason})" if segment_reason else "afdelingen")
    if not enps_available:
        ontbreekt.append("werkgeversaanbeveling (eNPS)")
    ontbreekt_html = (f'<p class="trustline" style="margin-top:4px;">Niet in dit rapport: '
                      f'{_h(", ".join(ontbreekt))}.</p>') if ontbreekt else ""

    body = f"""<span class="slabel" style="margin-top:18px;">Meetgegevens</span>
  <table class="sg no-break"><tr>{stat_cells}</tr></table>
  {caution_html}{ontbreekt_html}"""
    if compact:
        return f'<div style="margin-top:22px;">{body}</div>'
    return f'<div class="pb sec">\n  {body}\n</div>'
```

In de drie renderers:
- de `_responsbasis(`-aanroepen (`:3849-3861`, `:4280-4290`, `:4730-4741`): voeg `period_start=data.get("period_start"), period_end=data.get("period_end"),` toe; verwijder bij onboarding `datastatus_vervolg=DATASTATUS_VERVOLG_ONBOARDING,`; verander `segment_reason=` naar `"te weinig antwoorden per afdeling"`.
- de `_bestuurlijke_read(`-aanroepen: voeg `leidraad_html=_leidraad_block(...)` toe met `has_segments=bool(data.get("segment_rows"))`, `has_quotes=_should_show_quotes(data["open_texts"])`, `has_direction=bool(direction_agg) and not _geen_profiel` (exit/retention) resp. `has_direction=False` (onboarding). In de degraded staat (`_geen_profiel`) géén leidraad: geef dan `leidraad_html=""`; de degraded alinea zegt zelf wat er wél is.
- de `wel=[...]`-lijsten in de drie `_geen_factorprofiel_note`-aanroepen (`:3834-3838`, `:4235-4239`, `:4688-4692`): vervang `"de responsbasis onderaan deze pagina"` door `"de meetgegevens onderaan deze pagina"`.
- ankers op de hoofdstukkoppen, per renderer (zoek het anker op `ch.opener(`):
  - context: exit `ch.opener("Wat speelde mee bij vertrek?", kicker="Vertrekcontext", anchor=LEIDRAAD_ANKERS["context"])`; retention `ch.opener("Waar staat behoud onder druk?", kicker="Behoudscontext", anchor=...)`; onboarding `ch.opener("Onboardingfases", kicker="Checkpointoverzicht", anchor=...)`.
  - overzicht: alle drie `ch.opener("Overzichtsprofiel", anchor=LEIDRAAD_ANKERS["overzicht"])`.
  - verdieping: alleen de EERSTE (`_i == 0`) opener in de verdiepingslus krijgt `anchor=LEIDRAAD_ANKERS["verdieping"]`; bij de lege staat (`ch.opener("Verdieping: prioritaire factoren")` / `"Factoren met de meeste aandacht"`) ook.
  - werkbeleving: `ch.opener("Werkbeleving", kicker=..., anchor=LEIDRAAD_ANKERS["werkbeleving"])` (bij onboarding alleen als de sectie rendert; de leidraad verwijst er alleen naar via de terugval zonder afdelingen en zonder quotes, en dan is er altijd een werkbelevingssectie in exit/retention; voor onboarding zonder SDT-rijen: geef `has_quotes` en `has_segments` zoals ze zijn, en als beide onwaar zijn én `sdt_overview_rows` leeg is, geef `leidraad_html=""` en zeg dat in een comment: geen verwijzing naar een sectie die er niet is).
  - afdelingen: `_seg_opener = ch.opener("Segmentanalyse per afdeling", anchor=LEIDRAAD_ANKERS["afdelingen"]) if _seg_rows else ch.opener("Segmentanalyse")` (zonder rijen geen anker: de leidraad verwijst dan niet).
  - toelichtingen: `ch.opener("Open toelichtingen", kicker=..., anchor=LEIDRAAD_ANKERS["toelichtingen"])`.
  - agenda: exit/retention `ch.opener("Waar begint het gesprek?", kicker=..., anchor=LEIDRAAD_ANKERS["agenda"])`; onboarding `ch.opener("Gespreksagenda", kicker="Eerste managementspoor", anchor=LEIDRAAD_ANKERS["agenda"])`.
  - methodiek: alle drie `anchor=LEIDRAAD_ANKERS["methodiek"]`.

- [ ] **Stap 5: Lockstep**

- `tests/test_report_leesbaarheid.py:107-113` (`test_gebruiksblok_op_openingspagina`): vervang de body door `html = render_retention_report_html(_min_retention_data()); assert "Zo leid je dit gesprek in 45 minuten" in html; assert html.find("Zo leid je dit gesprek") < html.find("Meetgegevens")` en hernoem naar `test_leidraad_op_openingspagina`.
- `tests/test_report_design_sprong.py:6-15`: de zoekstring `"Uitgenodigd"` blijft; regel 30: `"Responsbasis" in band` → `"Meetgegevens" in band`; regel 25-28: voeg niets toe (nieuwe params hebben defaults).
- `tests/test_report_html_design.py:144-167`: `"Datastatus" in html` → `"Niet in dit rapport" in html`; `"segmentcontrasten" in html` → `"afdelingen" in html`; `"Datastatus" not in html` → `"Niet in dit rapport" not in html`. Regel 105: de literal in `html_correct` mag blijven (staat niet in productiecode).
- `tests/test_pdf_redesign.py:54-63`: assertie `"te weinig responses per groep" in html` blijft waar (staat nu tussen haakjes).
- `tests/test_report_respons_gevolgen.py:339` (`"Uitgenodigd 150 Afgerond 45 Respons 30%"`): → `"Uitgenodigd 150 Ingevuld 45 Respons 30%"`; regel 356 `"Afgerond 45"` → `"Ingevuld 45"`; regel 466 `"Uitgenodigd" not in tekst` blijft.
- `tests/test_report_onboarding_eerlijk.py:137-149` (`test_de_datastatusregel_belooft_bij_loep_start_geen_verdieping`): de Datastatus-regel bestaat niet meer in geen enkel product; vervang de test door een assertie dat `"Niet in dit rapport: werkgeversaanbeveling (eNPS)."` in het onboarding-rapport staat en `"Verdieping opent zodra"` nergens in de openingspagina van alle drie (het segment-lege-staat-blok `SEGMENT_VERVOLG` verderop blijft; taak 13 pakt die tekst).
- `tests/test_report_degraded_page_two.py:194` en `tests/test_report_polariteit_en_opsomming.py:50, 59`: `"de responsbasis onderaan deze pagina"` → `"de meetgegevens onderaan deze pagina"`. Zoek in `test_report_degraded_page_two.py` ook op `"achteraan"` en `"leesroute"`/`GEBRUIKSBLOK`-pins (de degraded leesroute is weg) en verwijder die asserties met een comment dat de leidraad in de degraded staat bewust niet rendert.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py tests/test_report_leesbaarheid.py tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py tests/test_report_respons_gevolgen.py tests/test_report_onboarding_eerlijk.py tests/test_report_degraded_page_two.py tests/test_report_polariteit_en_opsomming.py tests/test_report_degraded_verwijzingen.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 6: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): leidraad 45 minuten met paginaverwijzingen, meetgegevens met datums, gebruiksblok weg

H4/H5/H8. Paginanummers via target-counter (WeasyPrint); ankers op elke hoofdstukkop.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 6: Pagina twee is één A4, pagina drie begint met hoofdstuk 02

H16: pagina drie was leeg op één regel na. Na taak 5 staan Populatie/Segmentstatus/Datastatus niet meer als losse kaarten, maar de regel moet meetbaar zijn: in de WeasyPrint-PDF eindigt pagina 2 met de meetgegevens en begint pagina 3 met de kop "02". Dat meet `scripts/check_pdf_report.py` (PyMuPDF), getest op de drie voorbeelden, scenario 11 (n=180: langste respons- en afdelingsgetallen) en Loep Start (langste onderwerpnamen: "Rolhelderheid en verwachtingen eerste 90 dagen").

**Files:**
- Create: `scripts/check_pdf_report.py`
- Modify: `backend/report_css.py` (compacte p.02), `backend/report_html.py` (alleen als de meting dat afdwingt, zie stap 4)
- Test: `tests/test_report_p02_mtvel.py` (structuurtest)

- [ ] **Stap 1: Schrijf het controlescript**

`scripts/check_pdf_report.py`:

```python
"""Controle op een gerenderde rapport-PDF (WeasyPrint-Docker), zie plan 3a.

Regels:
  1. pagina 2 eindigt met de meetgegevens en pagina 3 begint met hoofdstuk "02" (H16);
  2. geen pagina onder MIN_FILL gevuld, behalve de cover en de laatste pagina (B9);
  3. elke "pagina N"-verwijzing op pagina 2 wijst naar een pagina waarvan de
     eerste tekst het hoofdstuk is dat de leidraad noemt (H4);
  4. optioneel (--thead): een tabelkop herhaalt op de vervolgpagina (ronde 2 punt c).

Gebruik:
  python scripts/check_pdf_report.py docs/examples/voorbeeldrapport_retentiescan.pdf
  python scripts/check_pdf_report.py out.pdf --thead "Onderwerp Score"
Exit 0 als alles klopt, 1 met een regel per overtreding.
"""
from __future__ import annotations

import argparse
import re
import sys

import fitz  # PyMuPDF

MIN_FILL = 0.40
TOP_PT, BOTTOM_PT = 51.0, 57.0      # @page margins 18mm / 20mm in punten
FOOTER_PT = 40.0                    # onderste strook met paginanummer


def page_fill(page: fitz.Page) -> float:
    blocks = [b for b in page.get_text("blocks") if b[4].strip() and b[3] < page.rect.height - FOOTER_PT]
    if not blocks:
        return 0.0
    top = min(b[1] for b in blocks)
    bottom = max(b[3] for b in blocks)
    return (bottom - top) / (page.rect.height - TOP_PT - BOTTOM_PT)


def first_text(page: fitz.Page) -> str:
    blocks = [b for b in page.get_text("blocks") if b[4].strip()]
    return blocks[0][4].strip().replace("\n", " ") if blocks else ""


def check(path: str, thead: str | None) -> list[str]:
    doc = fitz.open(path)
    errors: list[str] = []
    n = doc.page_count
    p2, p3 = doc[1].get_text(), first_text(doc[2])
    if "Meetgegevens" not in p2:
        errors.append("pagina 2 bevat de meetgegevens niet (loopt p.02 over?)")
    if not re.match(r"^0?2\b", p3):
        errors.append(f"pagina 3 begint niet met hoofdstuk 02 maar met: {p3[:60]!r}")
    for i in range(1, n - 1):
        f = page_fill(doc[i])
        if f < MIN_FILL:
            errors.append(f"pagina {i + 1} is {f:.0%} gevuld (< {MIN_FILL:.0%}); begint met {first_text(doc[i])[:50]!r}")
    for ref in set(int(m) for m in re.findall(r"pagina (\d+)", p2)):
        if not (1 <= ref <= n):
            errors.append(f"verwijzing naar pagina {ref} buiten het document ({n} pagina's)")
        elif not re.match(r"^\d{2}\b", first_text(doc[ref - 1])):
            errors.append(f"pagina {ref} begint niet met een hoofdstukkop: {first_text(doc[ref - 1])[:50]!r}")
    if thead:
        pages_with = [i + 1 for i in range(n) if thead in re.sub(r"\s+", " ", doc[i].get_text())]
        if len(pages_with) < 2:
            errors.append(f"tabelkop {thead!r} staat op {pages_with}, niet op twee pagina's")
    return errors


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--thead", default=None)
    args = ap.parse_args()
    errors = check(args.pdf, args.thead)
    for e in errors:
        print(f"FOUT {args.pdf}: {e}")
    print(f"{'OK' if not errors else 'NIET OK'} {args.pdf}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
```

- [ ] **Stap 2: Structuurtest** (toevoegen aan `tests/test_report_p02_mtvel.py`)

```python
def test_pagina_twee_heeft_geen_losse_kaarten_na_de_meetgegevens():
    """Alles wat na de meetgegevens komt hoort bij hoofdstuk 02 (H16). In de
    HTML: tussen "Meetgegevens" en de volgende 'class="pb sec"' staat geen
    <div class="card"> meer."""
    for html in (render_retention_report_html(_min_retention_data()),
                 render_exit_report_html(_degraded_fixture("exit", n=12, profile=True)),
                 render_onboarding_report_html(_degraded_fixture("onboarding", n=12, profile=True))):
        body = html.split("</style>")[-1]
        i = body.index("Meetgegevens")
        j = body.index('class="pb sec"', i)
        assert '<div class="card"' not in body[i:j]
        assert "Segmentstatus" not in body and "Populatie" not in body
```

- [ ] **Stap 3: Compacte p.02 in de CSS**

In `backend/report_css.py`, na `.br-kernzin { ... }`:

```css
/* Pagina twee is één A4 (spec par. 4 slot). Strakkere marges dan de rest van
   het rapport, zodat kernzin + cijfers + waarom + opener + leidraad +
   meetgegevens samen passen; de meting staat in scripts/check_pdf_report.py. */
#p02 .br-kernzin { font-size: 24px; margin-bottom: 18px; }
#p02 .why { padding: 14px 18px 12px; margin-bottom: 12px; }
#p02 .why-grid { margin-bottom: 10px; }
#p02 .sg { margin-bottom: 10px; }
#p02 .sc-v { font-size: 20px; }
#p02 .leidraad { margin-top: 12px; }
```

- [ ] **Stap 4: Meet op de vijf PDF's via WeasyPrint-Docker**

Genereer HTML's (harnas schrijft naar `docs/stresstest/`, generator naar `docs/examples/`; die laatste worden pas in taak 14 gecommit):

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3a
PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe
$PY scripts/stresstest_report.py 11 20
$PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py onboarding
mkdir -p /tmp/pdfcheck && cp docs/stresstest/11_groot_normaal.html docs/stresstest/20_onboarding_sanity.html docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_onboarding.html /tmp/pdfcheck/
for f in /tmp/pdfcheck/*.html; do MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd /tmp/pdfcheck && pwd -W):/data" ghcr.io/weasyprint/weasyprint "/data/$(basename "$f")" "/data/$(basename "${f%.html}").pdf"; echo "exit=$? $(basename "$f")"; done
for f in /tmp/pdfcheck/*.pdf; do $PY scripts/check_pdf_report.py "$f"; done
```
Verwacht: vijf keer `exit=0` met lege WeasyPrint-uitvoer (0 warnings), en per PDF: geen regel `pagina 2 bevat de meetgegevens niet` en geen `pagina 3 begint niet met hoofdstuk 02`. Regel 2 (vulling) mag in deze taak nog `FOUT`-regels geven voor pagina's ná pagina 3: die pakt taak 8. Is p.02 te lang (meetgegevens op p.03), verklein dan in de CSS hierboven `#p02 .br-kernzin` naar 22px en `.leidraad td` naar 9.5px, en meet opnieuw; noteer de gekozen waarden in de commit. Is p.02 te kort (pagina 3 begint met de meetgegevens van hoofdstuk 02 kan niet; wel: p.02 minder dan 80% gevuld), dan is dat geen fout.

- [ ] **Stap 5: Draai de tests, faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_p02_mtvel.py -q
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git checkout -- docs/examples/ frontend/public/examples/ 2>/dev/null; git status --short docs/examples frontend/public/examples
git add scripts/check_pdf_report.py backend/report_css.py tests/test_report_p02_mtvel.py
git commit -m "feat(rapport): pagina twee is één A4; check_pdf_report.py meet vulling, p.03-regel en paginaverwijzingen

H16. Gemeten op de drie voorbeelden, scenario 11 en 20 via WeasyPrint-Docker.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
(`git checkout -- docs/examples/ ...` zet de geregenereerde voorbeeld-HTML's terug; die gaan pas in taak 14 mee. Zijn ze untracked, dan doet dat niets en toont `git status` ze als `??`; laat ze staan.)

---
## Taak 7: Eén startpuntverhaal

B2: twee dingen heetten "startpunt". Het navy segmentblok heet voortaan "Waar het per afdeling begint"; de brugzin (drie varianten, spec par. 5) staat op p.02 én op de gespreksagenda. H20: de restgroep krijgt haar samenstelling en noemer. C8: de cover zegt "Waar het gesprek begint". Ronde 2 punt (b) is al in taak 2 gedaan (vertrekreden-gelijkspel).

**Files:**
- Modify: `backend/report_html.py:3049-3080` (`def _department_segment_rows`), `:3007-3017` (`def _enrich_segment_rows_with_invited`), `:2723-2855` (`def _segment_start_note`), `:2858-2949` (`def _segment_block`), `:1840-2016` (`def _prioriteringsraster`, nieuwe param `brug_zin`), `:1630-1706` (`def _eerste_managementspoor`, idem), de drie renderers (cover-label, brugzin)
- Test: `tests/test_report_startpuntverhaal.py` (nieuw); lockstep: `tests/test_report_segment_startpunt.py:91`, `tests/test_report_design_sprong.py:67-74`, `tests/test_segment_factor_themes.py:201`, `tests/test_cover_label_overflow.py:33`

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_startpuntverhaal.py`:

```python
"""Eén startpuntverhaal (spec 2026-09-16 par. 5): organisatiebreed en per
afdeling mogen verschillende dingen aanwijzen, maar het rapport zegt zelf hoe
die twee zich verhouden (B2). De restgroep krijgt naam en noemer (H20). De
cover gebruikt hetzelfde woord als binnen (C8)."""
import re

from backend.report_html import (
    _brugzin,
    _department_segment_rows,
    _enrich_segment_rows_with_invited,
    _segment_block,
    _segment_start_note,
    _segment_startpunt,
    render_retention_report_html,
)
from tests.test_report_distribution import _min_retention_data


def _row(dept, n, avg, invited=None, pooled=False, members=None):
    r = {"department": dept, "n": n, "avg": avg, "scores": [avg] * n,
         "is_pooled": pooled, "invited": invited}
    if members is not None:
        r["members"] = members
    return r


ROWS = [_row("Operations", 17, 6.0, invited=21), _row("Marketing", 5, 6.3, invited=8),
        _row("Finance", 8, 6.6, invited=10),
        _row("Overige afdelingen", 9, 5.9, invited=19, pooled=True, members=["Facilitair", "Staf"])]
FACTOR_ROWS = {"Operations": {"factors": [("workload", 4.9, 17), ("leadership", 5.2, 17)], "omitted": 0}}


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_segment_startpunt_wijst_alleen_aan_bij_beide_grenzen():
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    assert seg == {"department": "Operations", "score": 6.0, "n": 17, "invited": 21,
                   "low_fk": "workload", "low_avg": 4.9}
    te_klein = [_row("Ops", 7, 5.0), _row("Sales", 9, 6.1)]
    assert _segment_startpunt(te_klein, None) is None
    te_dicht = [_row("Ops", 12, 6.0), _row("Sales", 12, 6.1)]
    assert _segment_startpunt(te_dicht, None) is None


def test_brugzin_drie_varianten():
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    anders = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert anders == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Bij Operations springt "
                      "werkdruk en herstelruimte eruit (4.9/10); neem dat als tweede punt voor die afdeling.")
    zelfde = _brugzin("workload", "Werkdruk en herstelruimte", seg, "retention")
    assert zelfde == ("Bij Operations weegt werkdruk en herstelruimte het zwaarst (4.9/10); daar begint "
                      "het gesprek ook.")
    assert _brugzin("growth", "Groeiperspectief", None, "retention") == ""
    zonder_thema = _brugzin("growth", "Groeiperspectief", dict(seg, low_fk=None, low_avg=None), "retention")
    assert zonder_thema == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Operations scoort het "
                            "laagst van de afdelingen (6.0/10); welk onderwerp daar het zwaarst weegt is "
                            "niet te zeggen, te weinig antwoorden per onderwerp.")


def test_navy_blok_heet_waar_het_per_afdeling_begint():
    html = _segment_start_note(ROWS, FACTOR_ROWS, "retention")
    assert "Waar het per afdeling begint" in html
    assert "Startpunt voor de bespreking" not in html


def test_restgroep_heeft_samenstelling_en_noemer():
    html = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    tekst = _tekst(html)
    assert "Overige afdelingen Facilitair, Staf" in tekst
    assert "9/19" in tekst and "47%" in tekst
    assert ("De restgroep “Overige afdelingen” (Facilitair, Staf; samen 19 uitgenodigd, 9 ingevuld) "
            "scoort lager (5.9/10)") in tekst.replace("&ldquo;", "“").replace("&rdquo;", "”")


def test_department_rows_dragen_de_leden_van_de_restgroep():
    resp = ([{"department": "Ops", "signal_score": 6.0}] * 6
            + [{"department": "Sales", "signal_score": 6.5}] * 5
            + [{"department": "Staf", "signal_score": 5.0}] * 3
            + [{"department": "Facilitair", "signal_score": 5.5}] * 2)
    rows = _department_segment_rows(resp)
    pooled = [r for r in rows if r["is_pooled"]][0]
    assert pooled["members"] == ["Facilitair", "Staf"]
    rows = _enrich_segment_rows_with_invited(rows, [
        {"label": "Ops", "invited_count": 8}, {"label": "Sales", "invited_count": 6},
        {"label": "Staf", "invited_count": 4}, {"label": "Facilitair", "invited_count": 3}])
    assert pooled["invited"] == 7
    # Ontbreekt de noemer van één lid, dan is er geen restgroepnoemer (geen deelsom).
    rows = _enrich_segment_rows_with_invited(rows, [{"label": "Staf", "invited_count": 4}])
    assert pooled["invited"] is None


def test_cover_en_p02_dragen_de_brugzin_en_het_nieuwe_coverlabel():
    d = _min_retention_data()
    d["segment_rows"] = ROWS
    d["segment_factor_rows"] = FACTOR_ROWS
    html = render_retention_report_html(d)
    assert "Waar het gesprek begint" in html and "Eerste aandachtspunt" not in html
    assert html.count("Organisatiebreed begint het gesprek bij") == 2   # p.02 en agenda
    assert 'class="mq-brug"' in html
```

De fixture `_min_retention_data` heeft alleen `workload` als factor; het startpunt is dus workload en Operations heeft workload als laagste → dat zou de "zelfde"-variant geven. Zet in de laatste test daarom `FACTOR_ROWS` op `{"Operations": {"factors": [("leadership", 5.2, 17)], "omitted": 0}}` zodat de "anders"-variant vuurt, en pas de telling aan op `html.count("Organisatiebreed begint het gesprek bij") == 2`.

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_startpuntverhaal.py -q
```
Verwacht: `ImportError` op `_brugzin`.

- [ ] **Stap 3: Implementeer**

In `_department_segment_rows` (`:3075-3079`) vervang het `if len(rest) >= MIN_SEGMENT_N:`-blok door:

```python
    rest = [s for d, v in grouped.items() if d not in eligible for s in v]
    if len(rest) >= MIN_SEGMENT_N:
        rows.append({"department": "Overige afdelingen", "n": len(rest),
                     "avg": round(sum(rest) / len(rest), 2), "scores": sorted(rest),
                     "is_pooled": True,
                     # H20: de restgroep krijgt een naam. Alfabetisch, zodat de
                     # zin niet van de invoervolgorde afhangt.
                     "members": sorted(d for d in grouped if d not in eligible)})
    return rows
```

Vervang `_enrich_segment_rows_with_invited` (`:3007-3017`) door:

```python
def _enrich_segment_rows_with_invited(segment_rows: list[dict],
                                      segment_departments: list[dict] | None) -> list[dict]:
    """Voegt per rij de noemer (invited) toe via label-match op de campagnelijst
    (spec 2026-07-12 §6). De restgroep krijgt de som van haar leden (H20), maar
    alleen als élk lid een noemer heeft: een deelsom zou een te hoog
    responspercentage geven. Anders None (alleen n tonen, geen fake percentage)."""
    invited_by_label = {d.get("label"): d.get("invited_count")
                        for d in (segment_departments or [])}
    for row in segment_rows:
        if row.get("is_pooled"):
            leden = row.get("members") or []
            noemers = [invited_by_label.get(m) for m in leden]
            row["invited"] = sum(noemers) if leden and all(noemers) else None
        else:
            row["invited"] = invited_by_label.get(row["department"])
    return segment_rows
```

Voeg direct boven `_segment_start_note` (`:2723`) toe:

```python
def _segment_startpunt(segment_rows: list[dict],
                       factor_rows: dict[str, dict] | None) -> dict | None:
    """De aangewezen afdeling, of None. Precies de gates van _segment_start_note
    (staat 3: verschil >= SEGMENT_START_MIN_DELTA met de volgende én n >=
    MIN_DISTRIBUTION_N), zodat brugzin en navy blok nooit uiteenlopen."""
    named = sorted((r for r in segment_rows if not r.get("is_pooled", False)),
                   key=lambda r: (r["avg"], -r["n"], r["department"]))
    if len(named) < 2:
        return None
    lowest, runner_up = named[0], named[1]
    low_sc, run_sc = _shown(lowest["avg"]), _shown(runner_up["avg"])
    if round(run_sc - low_sc, 1) < SEGMENT_START_MIN_DELTA or lowest["n"] < MIN_DISTRIBUTION_N:
        return None
    info = (factor_rows or {}).get(lowest["department"]) or {}
    factors = info.get("factors") or []
    return {"department": lowest["department"], "score": low_sc, "n": lowest["n"],
            "invited": lowest.get("invited"),
            "low_fk": factors[0][0] if factors else None,
            "low_avg": factors[0][1] if factors else None}


def _brugzin(startpunt_key: str | None, startpunt_label: str, seg: dict | None,
             scan_type: str) -> str:
    """De zin die organisatiebreed en per afdeling aan elkaar knoopt (spec par. 5).

    Drie varianten: ander onderwerp (tweede punt voor die afdeling), hetzelfde
    onderwerp (daar begint het gesprek ook), of geen onderwerp bekend voor die
    afdeling (te weinig antwoorden per onderwerp). Zonder aangewezen afdeling
    geen zin: het navy blok geeft dan zelf de reden.
    """
    if not seg or not startpunt_key:
        return ""
    dept, score = seg["department"], _score_str(seg["score"])
    if seg["low_fk"] is None:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. {dept} scoort het "
                f"laagst van de afdelingen ({score}); welk onderwerp daar het zwaarst weegt is "
                f"niet te zeggen, te weinig antwoorden per onderwerp.")
    low_lbl = _lc(_fl(seg["low_fk"], scan_type))
    low_sc = _score_str(seg["low_avg"])
    if seg["low_fk"] == startpunt_key:
        return f"Bij {dept} weegt {low_lbl} het zwaarst ({low_sc}); daar begint het gesprek ook."
    return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Bij {dept} springt "
            f"{low_lbl} eruit ({low_sc}); neem dat als tweede punt voor die afdeling.")
```

In `_segment_start_note`:
- de eyebrow (`:2854`): `Startpunt voor de bespreking` → `Waar het per afdeling begint`.
- de restgroepzin (`:2774-2780`): vervang door

```python
    pooled = next((r for r in segment_rows if r.get("is_pooled", False)), None)
    rest_sentence = ""
    if pooled and _shown(pooled["avg"]) < low_sc:
        leden = pooled.get("members") or []
        inv = pooled.get("invited")
        samenstelling = ""
        if leden:
            noemer = f"; samen {inv} uitgenodigd, {pooled['n']} ingevuld" if inv else f"; {pooled['n']} ingevuld"
            samenstelling = f" ({_h(', '.join(leden))}{noemer})"
        rest_sentence = (
            f' De restgroep &ldquo;{_h(pooled["department"])}&rdquo;{samenstelling} scoort lager '
            f'({_shown(pooled["avg"]):.1f}/10), maar is samengesteld uit kleine '
            f'afdelingen en wordt daarom niet als startpunt genoemd.')
```

In `_segment_block` (`:2897-2905`): de naamcel en de n-cel van de restgroep:

```python
        if is_rest:
            leden = row.get("members") or []
            name_html = _h(dept) + (f'<br><span style="{_SEG_MONO}">{_h(", ".join(leden))}</span>' if leden else "")
        else:
            name_html = f"<strong>{_h(dept)}</strong>"
        invited = row.get("invited")
        if invited:
            pct = min(100, round(n_ / invited * 100))
            n_cell = (f'{n_}/{invited}<br>'
                      f'<span style="font-family:\'JetBrains Mono\', monospace;font-size:8px;'
                      f'color:#4A6070;">{pct}%</span>')
        else:
            n_cell = str(n_)
```
(De pooled rij droeg voorheen `invited=None` en dus alleen `n`; nu de som, als die er is.)

`_prioriteringsraster` (`:1840`): voeg parameter `brug_zin: str = ""` toe en render hem direct vóór `{dir_block}` in de returnstring: `{f'<p class="mq-brug" style="margin-top:10px;">{_h(brug_zin)}</p>' if brug_zin else ''}`. `_eerste_managementspoor` (`:1630`): idem, direct na `{intro_html}`.

In de renderers (exit `:3720-3724`, retention `:4182-4186`, onboarding `:4647-4651`): `("Eerste aandachtspunt", ...)` → `("Waar het gesprek begint", ...)`. Bereken vóór de `_bestuurlijke_read`-aanroep:

```python
    _seg = _segment_startpunt(data.get("segment_rows") or [], data.get("segment_factor_rows"))
    _brug = _brugzin(_primary, _raster_primary_label, _seg, "exit")   # retention: ST; onboarding: _primary, primary_label, _seg, ST
```
en geef `brug_zin=_brug` mee aan `_bestuurlijke_read`, aan `_prioriteringsraster` (exit/retention) en aan `_eerste_managementspoor` (onboarding). Zonder factorprofiel (`_geen_profiel`) `brug_zin=""`: er is dan geen startpunt om aan te knopen.

- [ ] **Stap 4: Lockstep**

- `tests/test_report_segment_startpunt.py:91`, `tests/test_report_design_sprong.py:67, 68, 74`, `tests/test_segment_factor_themes.py:201`: `"Startpunt voor de bespreking"` → `"Waar het per afdeling begint"`.
- `tests/test_report_segment_startpunt.py:252, 316, 326` (`_POOLED_ZIN`, handgemaakte rijen zonder `members`): ongewijzigd, de samenstelling rendert alleen met `members`. Draai het bestand om dat te bevestigen.
- `tests/test_cover_label_overflow.py:33`: `("Eerste aandachtspunt", third_value)` → `("Waar het gesprek begint", third_value)`.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_startpuntverhaal.py tests/test_report_segment_startpunt.py tests/test_report_design_sprong.py tests/test_segment_factor_themes.py tests/test_cover_label_overflow.py tests/test_segment_report.py tests/test_report_department_overview_and_exit_playbooks.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 5: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py tests/
git commit -m "feat(rapport): één startpuntverhaal: brugzin op p.02 en agenda, afdelingsblok hernoemd, restgroep met naam en noemer, cover 'Waar het gesprek begint'

B2/H20/C8 (spec par. 5). Lockstep: segment_startpunt, design_sprong, segment_factor_themes, cover_label_overflow.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 8: Paginavulling (B9): eNPS bij de context, flow-secties, werkbeleving en appendix in twee kolommen

Gemeten op main (PyMuPDF, vulling t.o.v. de tekstruimte): Behoud p.03 0,04, p.08 0,49, p.09 0,42, p.11 0,18, p.12 0,21, p.18 0,51; Vertrek p.03 0,18, p.10 0,20, p.11 0,38, p.16 0,38; Start p.03 0,15, p.06 t/m p.08 0,32 tot 0,35, p.14 0,29. Oorzaken: eNPS als eigen pagina (H13), elke verdiepingspagina met een geforceerde paginabreuk, de werkbeleving die met één kaart overloopt, de appendix die met de SDT-tabel overloopt. Regel: geen pagina onder 40% behalve cover en laatste pagina (`scripts/check_pdf_report.py`).

**Files:**
- Modify: `backend/report_html.py` (`build_report_data` eNPS-detail; nieuwe `_enps_block`, `_werkbeleving_section`, `_appendix_section`; `_behoudscontext`, `_vertrekcontext`, `_checkpointoverzicht` krijgen `enps_html=""`; `_ChapterCounter.sub`; de drie renderers), `backend/report_css.py`
- Test: `tests/test_report_paginavulling.py` (nieuw); lockstep: `tests/test_pdf_redesign.py` en `tests/test_report_band_rounding.py` (aanroepen van `_behoudscontext`/`_checkpointoverzicht`/`_vertrekcontext` blijven geldig, nieuwe kwarg heeft default), `tests/test_report_leesbaarheid.py:22-25` (`vervolg` blijft bestaan)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_paginavulling.py`:

```python
"""B9 paginavulling (spec par. 9): geen halflege pagina's. Structuur in de
HTML; de meting op de PDF loopt via scripts/check_pdf_report.py (WeasyPrint)."""
import re
import subprocess
import sys
from pathlib import Path

import pytest

from backend.report_html import (
    _ChapterCounter,
    _enps_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.conftest import requires_weasyprint
from tests.test_report_degraded_page_two import _fixture
from tests.test_report_distribution import _min_retention_data

ROOT = Path(__file__).resolve().parent.parent


def _body(html):
    return html.split("</style>")[-1]


def test_enps_block_toont_aanraders_en_critici():
    html = _enps_block(8, {"n": 39, "promoters": 12, "detractors": 9})
    t = re.sub(r"<[^>]+>", " ", html)
    assert "+8" in t and "12 aanraders" in t and "9 critici" in t and "van 39" in t
    assert _enps_block(None, None) == ""


def test_enps_heeft_geen_eigen_hoofdstuk_meer_en_staat_bij_de_context():
    d = _min_retention_data()
    d["enps_available"], d["enps_score"] = True, 8
    d["enps_detail"] = {"n": 12, "promoters": 4, "detractors": 3}
    body = _body(render_retention_report_html(d))
    assert '<h2 class="ch-title">Werkgeversaanbeveling</h2>' not in body
    ctx = body.index("Waar staat behoud onder druk?")
    volgende = body.index('class="pb sec"', ctx + 10)
    assert "Werkgeversaanbeveling" in body[ctx:volgende]
    assert "4 aanraders" in body[ctx:volgende]


def test_verdiepingspaginas_na_de_eerste_stromen_en_heten_niet_vervolg():
    body = _body(render_exit_report_html(_fixture("exit", n=12, profile=True)))
    assert body.count('class="sec flow"') >= 2
    assert "(vervolg)" not in body.split('<h2 class="ch-title">Werkbeleving</h2>')[0]   # niet bij de verdieping
    body_r = _body(render_retention_report_html(_fixture("retention", n=12, profile=True)))
    assert "(vervolg)" in body_r  # de spreidingspagina van de behoudscontext blijft een echt vervolg


def test_sub_kop_zonder_vervolg():
    assert _ChapterCounter.sub("Werkdruk en balans") == '<span class="slabel">Werkdruk en balans</span>'


def test_werkbeleving_en_appendix_staan_in_twee_kolommen():
    d = _fixture("retention", n=25, profile=True)
    d["sdt_avgs"] = {"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0}
    d["sdt_item_avgs"] = {"B1": 6.1, "B5": 6.4, "B9": 6.0}
    d["sdt_items"] = [("B1", "a"), ("B5", "b"), ("B9", "c")]
    body = _body(render_retention_report_html(d))
    wb = body[body.index("Werkbeleving"):]
    assert 'class="tcol wb-cols"' in wb
    app = body[body.index("Appendix"):]
    assert 'class="tcol app-cols"' in app


@requires_weasyprint
@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_pdf_heeft_geen_pagina_onder_veertig_procent(scan_type, tmp_path):
    from weasyprint import HTML
    html = {"exit": render_exit_report_html, "retention": render_retention_report_html,
            "onboarding": render_onboarding_report_html}[scan_type](_fixture(scan_type, n=25, profile=True))
    pdf = tmp_path / f"{scan_type}.pdf"
    HTML(string=html).write_pdf(str(pdf))
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_pdf_report.py"), str(pdf)],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stdout
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_paginavulling.py -q
```
Verwacht: `ImportError` op `_enps_block`; de laatste test skipt lokaal (geen WeasyPrint).

- [ ] **Stap 3: Implementeer**

**Data.** In `build_report_data` (`:3336-3341`, anker `enps_available = len(enps_vals) >= MIN_QUOTES_N`):

```python
    enps_available = len(enps_vals) >= MIN_QUOTES_N
    enps_score: int | None = None
    enps_detail: dict | None = None
    if enps_available:
        promoters  = sum(1 for v in enps_vals if v >= 9)
        detractors = sum(1 for v in enps_vals if v <= 6)
        enps_score = round((promoters - detractors) / len(enps_vals) * 100)
        enps_detail = {"n": len(enps_vals), "promoters": promoters, "detractors": detractors}
```
en in de `return dict(`: `enps_available=enps_available, enps_score=enps_score, enps_detail=enps_detail,`.

**CSS** (`backend/report_css.py`, na `.sec { margin-bottom: 44px; }`):

```css
/* Flow-sectie (B9): geen geforceerde paginabreuk, wel bij elkaar blijven. Een
   sectie die niet meer past gaat als geheel naar de volgende pagina. */
.sec.flow { break-before: auto; break-inside: avoid; margin-top: 30px; }
/* Werkbeleving en appendix in twee kolommen (B9): halveert de hoogte. */
.tcol.wb-cols .tc-l, .tcol.wb-cols .tc-r { width: 50%; }
.tcol.app-cols .tc-l, .tcol.app-cols .tc-r { width: 50%; }
.enps-inline { margin-top: 18px; }
```

**Helpers** (in `report_html.py`, direct boven `# ─── ExitScan renderer`):

```python
def _enps_block(enps_score: int | None, enps_detail: dict | None) -> str:
    """Werkgeversaanbeveling als blok op de contextpagina (H13, spec par. 9 B9):
    de score met de tellingen erbij, zodat "+0" iets betekent. Leeg zonder
    score. Geen eigen hoofdstuk meer."""
    if enps_score is None or not enps_detail:
        return ""
    ecol = _rag_color(10.0 if enps_score >= 20 else 6.0 if enps_score >= 0 else 4.0)
    n, p, d = enps_detail["n"], enps_detail["promoters"], enps_detail["detractors"]
    return (f'<div class="enps-inline no-break"><span class="eyebrow">Werkgeversaanbeveling</span>'
            f'{_intro("werkgeversaanbeveling")}'
            f'<table class="sg"><tr><td><div class="sc-l">Aanbevelingsscore</div>'
            f'<div class="sc-v" style="color:{ecol};">{enps_score:+d}</div>'
            f'<div class="sc-b">{p} aanraders, {d} critici van {n} (eNPS, &minus;100 tot +100)</div></td>'
            f'</tr></table></div>')


def _werkbeleving_section(sdt_a: dict, sim: dict, sdt_items: list, opener_html: str) -> str:
    """Werkbeleving (SDT) in twee kolommen (B9): links de overzichtsbalken en
    autonomie, rechts competentie en verbondenheid. Eén helper voor de drie
    renderers; voorheen drie keer dezelfde 40 regels."""
    def _item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}{REV if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in sdt_items if k == ik), ik)]
            if ik in sim)
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    def _card(dim: str) -> str:
        sc, tbl = sdt_a.get(dim), _item_tbl(dim)
        if not tbl:
            return ""
        col = _rag_color(sc)
        return (f'<div class="card no-break" style="margin-bottom:12px;">'
                f'<div style="margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:#243247;">'
                f'{_h(SDT_LABELS.get(dim, ""))}</span>'
                f'<span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>'
                f'<span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(_factor_label(sc))}</span></div>'
                f'<div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim, ""))}</div>{tbl}</div>')

    overview = "".join(_factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
                       for dim in ("autonomy", "competence", "relatedness") if sdt_a.get(dim) is not None)
    if not overview:
        return ""
    left = f'<div class="card" style="margin-bottom:14px;">{overview}</div>{_card("autonomy")}'
    right = f'{_card("competence")}{_card("relatedness")}'
    return (f'<div class="pb sec">{opener_html}{_intro("werkbeleving")}'
            f'<div class="tcol wb-cols"><div class="tc-l">{left}</div><div class="tc-r">{right}</div></div></div>')


def _appendix_section(*, fa: dict, oim: dict, sim: dict, factor_items_map: dict, sdt_items: list,
                      scan_type: str, n: int, enps_score: int | None, enps_detail: dict | None,
                      opener_html: str, sdt_title: str) -> str:
    """Appendix in twee kolommen (B9): de onderwerpstabellen verdeeld over
    links en rechts, de SDT-tabel eronder. C7: de eNPS-regel noemt de score en
    de tellingen of zegt dat hij niet is gemeten. Eén helper voor drie renderers."""
    def _rows(items, avgs):
        return "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(avgs.get(ik))};">{avgs[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(avgs.get(ik), _factor_color(avgs.get(ik)), width=70, height=5)}</td></tr>')
            if avgs.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in items)

    def _tbl(title, rows):
        return (f'<div class="no-break" style="margin-bottom:14px;">'
                f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">{title}</div>'
                f'<table class="app-tbl"><tr><th class="aq">Stelling</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

    secties = [_tbl(_h(_fl(fk, scan_type)) + ("&nbsp;&middot;&nbsp;" + _score_str(fa.get(fk)) if fa.get(fk) else ""),
                    _rows(items, oim))
               for fk, items in factor_items_map.items()]
    helft = (len(secties) + 1) // 2
    sdt_rows = _rows(sdt_items, sim)
    sdt_html = _tbl(sdt_title, sdt_rows) if sdt_rows else ""
    if enps_score is not None and enps_detail:
        enps_line = (f"Werkgeversaanbeveling (eNPS): {enps_score:+d}, {enps_detail['promoters']} aanraders en "
                     f"{enps_detail['detractors']} critici van {enps_detail['n']}.")
    else:
        enps_line = "Werkgeversaanbeveling (eNPS): niet gemeten in deze meting."
    return f"""<div class="pb sec">
  {opener_html}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.</p>
  <div class="tcol app-cols"><div class="tc-l">{"".join(secties[:helft])}</div><div class="tc-r">{"".join(secties[helft:])}</div></div>
  {sdt_html}
  <p class="trustline">{_h(enps_line)}</p>
</div>"""
```

`_ChapterCounter` krijgt naast `vervolg` een tweede statische methode:

```python
    @staticmethod
    def sub(title: str) -> str:
        """Kop van een volgend onderwerp in hetzelfde hoofdstuk (C12): geen
        "(vervolg)", want het is geen vervolg van het vorige onderwerp."""
        return f'<span class="slabel">{title}</span>'
```

**Context-secties.** `_behoudscontext` (`:3556`), `_vertrekcontext` (`:3496`) en `_checkpointoverzicht` (`:4544`) krijgen een keyword `enps_html: str = ""` en renderen dat als laatste element van hun eerste `.pb.sec` (bij `_behoudscontext` na `{stat_rows}`; bij `_vertrekcontext` na `{rel_card}`; bij `_checkpointoverzicht` na `{body}`).

**Renderers.** Per renderer:
1. verwijder het eNPS-blok (`:4019-4029`, `:4436-4446`, `:4891-4901`) en geef `enps_html=_enps_block(data["enps_score"], data.get("enps_detail"))` mee aan de context-aanroep (`_vertrekcontext` `:3885`, `_behoudscontext` `:4312`, `_checkpointoverzicht` `:4771`).
2. verdiepingslus (`:3968-3972`, `:4385-4389`, `:4830-4843`): `_opener = ch.opener(...) if _i == 0 else _ChapterCounter.sub(f"Verdieping: {_lbl}")` (onboarding: `_ChapterCounter.sub(_lbl)`), en in `_factor_detail`/`_ret_factor_detail`/`_ob_factor_detail` de openings-`<div class="pb sec">` vervangen door `<div class="{'pb sec' if is_first else 'sec flow'}">` via een nieuwe parameter `is_first: bool = True` die de lus doorgeeft (`is_first=_i == 0`).
3. werkbeleving (`:3976-4017`, `:4393-4434`, `:4847-4889`): vervang door `s += _werkbeleving_section(sdt_a, sim, data["sdt_items"], ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid", anchor=LEIDRAAD_ANKERS["werkbeleving"]))`. Let op de hoofdstukteller: `ch.opener` verhoogt `n` ook als de helper leeg teruggeeft (onboarding zonder SDT). Roep daarom eerst `_werkbeleving_section(..., opener_html="")` aan om te zien of er inhoud is en pas dan met opener; of eenvoudiger: bouw `overview` vooraf zoals de onboarding-renderer nu doet (`if sdt_overview_rows:`) en roep de helper alleen dan aan.
4. appendix (`:4072-4117`, `:4487-4532`, `:4992-5031`): vervang door `s += _appendix_section(fa=fa, oim=oim, sim=sim, factor_items_map=data["factor_items_map"], sdt_items=data["sdt_items"], scan_type="exit", n=n, enps_score=data["enps_score"], enps_detail=data.get("enps_detail"), opener_html=ch.opener("Appendix", kicker="Volledige vraagresultaten"), sdt_title="Werkbeleving (SDT): B1 t/m B12")` (onboarding: `sdt_title="Werkbeleving (SDT): checkpoint-items"`), binnen het bestaande `if _should_show_appendix(...)`.

- [ ] **Stap 4: Meet**

Zelfde vijf PDF's als taak 6 stap 4 (harnas 11 en 20, drie voorbeelden), plus scenario 06 en 18:

```bash
$PY scripts/stresstest_report.py 06 11 18 20
```
en de docker-lus; daarna `check_pdf_report.py` op alle zeven. Verwacht: geen `FOUT`-regels. Blijft een pagina onder 40%: (a) een verdiepingssectie die als geheel naar de volgende pagina verhuist en de vorige pagina leeg laat kan alleen als die vorige pagina zelf < 40% was, dus zoek de oorzaak in die pagina; (b) de laatste appendixpagina telt niet (laatste pagina uitgezonderd is de methodiek; staat de appendix-overloop vóór de methodiek en is die < 40%, verklein dan `.app-tbl` naar `font-size: 8.5px` en `td { padding: 3px 8px }` en meet opnieuw). Noteer de gemeten vullingen per pagina in de commit.

- [ ] **Stap 5: Tests, faalset-diff, commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_paginavulling.py tests/test_pdf_redesign.py tests/test_report_band_rounding.py tests/test_report_leesbaarheid.py tests/test_report_degraded_verwijzingen.py tests/test_report_polariteit_en_opsomming.py -q
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git checkout -- docs/examples/ frontend/public/examples/ 2>/dev/null
git add backend/report_html.py backend/report_css.py tests/test_report_paginavulling.py
git commit -m "feat(rapport): paginavulling: eNPS bij de context met tellingen, flow-verdieping, werkbeleving en appendix in twee kolommen

B9/H13/C5/C7/C12. Vullingen na de ronde: <per pagina, uit check_pdf_report.py>.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 9: Anders-toelichtingen (B13)

Scenario 14: "Anders, namelijk" is de topkeuze en het rapport zegt er niets over. De aggregaties verzamelen de vrije teksten; de rapportlaag anonimiseert ze (dezelfde `anonymize_text` als de open toelichtingen) en toont ze op de verdiepingspagina zodra "Anders" 20% of meer haalt: vanaf vijf de teksten, daaronder alleen het aantal.

**Files:**
- Modify: `backend/products/shared/deepening.py:719-760` (`def aggregate_deepening`), `:801-852` (`def aggregate_direction`)
- Modify: `backend/report_html.py` (`build_report_data` na de aggregaties `:3247-3262`; `_deepening_block` `:2366-2398`; `_direction_card_cell` `:2149-2237`; nieuwe constante en `_anders_block`)
- Test: `tests/test_report_tellingen.py` (nieuw); lockstep: elke test die een volledig aggregaat met `==` vergelijkt (`tests/test_deepening_report.py`, `tests/test_direction_aggregation.py`, `tests/test_deepening_trigger.py`, `tests/test_direction_report_block.py::_agg`): voeg `"other_texts": []` toe aan de verwachte dict.

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_tellingen.py`:

```python
"""B13 Anders-toelichtingen en B14 tellingen met noemer (spec par. 9)."""
import re

from backend.products.shared.deepening import aggregate_deepening, aggregate_direction
from backend.report_html import OTHER_SHARE_MIN, _anders_block

LOW_GROWTH = {f"growth_{i}": 1 for i in (1, 2, 3)} | {f"{fk}_{i}": 5 for fk in
              ("leadership", "culture", "compensation", "workload", "role_clarity") for i in (1, 2, 3)}


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_aggregaties_verzamelen_de_anders_teksten():
    entries = [{"factor_key": "growth", "question_set_version": "v", "status": "answered",
                "primary": "gr_other", "secondary": None, "other_text": "Mijn contract is tijdelijk."}]
    agg = aggregate_deepening([(LOW_GROWTH, entries)], "retention")
    assert agg["growth"]["other_texts"] == ["Mijn contract is tijdelijk."]
    dr = {"factor_key": "growth", "question_set_version": "v", "status": "answered",
          "choice": "grd_other", "other_text": "Een andere functie."}
    dagg = aggregate_direction([(LOW_GROWTH, dr)], "retention")
    assert dagg["growth"]["other_texts"] == ["Een andere functie."]
    # Zonder tekst: geen lege string in de lijst.
    dr["other_text"] = None
    assert aggregate_direction([(LOW_GROWTH, dr)], "retention")["growth"]["other_texts"] == []


def test_anders_drempel_is_benoemd():
    assert OTHER_SHARE_MIN == 0.20


def test_anders_block_toont_teksten_vanaf_vijf():
    teksten = [f"Toelichting {i}." for i in range(5)]
    html = _anders_block(other_n=5, answered=16, texts=teksten)
    t = _tekst(html)
    assert "5 van de 16 kozen “Anders” en schreven een eigen toelichting" in t.replace("&ldquo;", "“").replace("&rdquo;", "”")
    for x in teksten:
        assert x in t


def test_anders_block_alleen_aantal_onder_vijf():
    teksten = ["Toelichting alfa.", "Toelichting beta.", "Toelichting gamma.", "Toelichting delta."]
    t = _tekst(_anders_block(other_n=4, answered=16, texts=teksten))
    assert "4 van de 16 kozen" in t
    assert "tonen we pas vanaf 5" in t
    assert not any(x in t for x in teksten)


def test_anders_block_leeg_onder_de_drempel():
    assert _anders_block(other_n=3, answered=16, texts=["a", "b", "c"]) == ""   # 19% < 20%
    assert _anders_block(other_n=0, answered=16, texts=[]) == ""
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_tellingen.py -q
```
Verwacht: `ImportError` op `OTHER_SHARE_MIN`.

- [ ] **Stap 3: Implementeer**

`deepening.py`, `aggregate_deepening` (`:743-745`): initialiseer `"other_texts": []` in `out[fk]` en voeg in de `answered`-tak na de `secondary`-telling toe:

```python
                if e.get("primary", "").endswith("_other") and (e.get("other_text") or "").strip():
                    agg["other_texts"].append(e["other_text"].strip())
```

`aggregate_direction` (`:822-824`): initialiseer `"other_texts": []` en na `agg["counts"][...] += 1`:

```python
            if (dr.get("choice") or "").endswith("_other") and (dr.get("other_text") or "").strip():
                agg["other_texts"].append(dr["other_text"].strip())
```

`report_html.py`, `build_report_data`, direct na beide campagne-gates (`:3254` en `:3262`):

```python
    # B13: vrije teksten bij "Anders" gaan door dezelfde anonimisering als de
    # open toelichtingen, hier in de rapportlaag (de contentlaag anonimiseert niet).
    for agg in list(deepening_agg.values()) + list(direction_agg.values()):
        agg["other_texts"] = [anonymize_text(t) for t in agg.get("other_texts", [])]
```

Nieuwe constante en helper, direct boven `_deepening_chain` (`:2353`):

```python
# B13: vanaf dit aandeel "Anders" zegt het rapport dat de optieset de
# werkelijkheid niet dekt en toont het de vrije teksten (staffel MIN_QUOTES_N,
# dezelfde als de open toelichtingen). Eén op vijf is de grens waarop een
# restcategorie geen rest meer is maar een eigen antwoord.
OTHER_SHARE_MIN = 0.20


def _anders_block(*, other_n: int, answered: int, texts: list[str]) -> str:
    """"Anders"-toelichtingen onder een verdeling (spec par. 9 B13). Leeg onder
    OTHER_SHARE_MIN; vanaf MIN_QUOTES_N de (geanonimiseerde) teksten, daaronder
    alleen het aantal, om herleidbaarheid te voorkomen."""
    if not answered or other_n / answered < OTHER_SHARE_MIN:
        return ""
    kop = (f'<p style="font-size:10px;margin:8px 0 0;">{other_n} van de {answered} kozen '
           f'&ldquo;Anders&rdquo; en schreven een eigen toelichting: de vaste opties dekten '
           f'hun ervaring niet.</p>')
    if other_n < MIN_QUOTES_N:
        return kop + (f'<p style="font-size:9.5px;color:#64748B;margin:2px 0 0;">De teksten tonen we '
                      f'pas vanaf {MIN_QUOTES_N}, om herleidbaarheid te voorkomen.</p>')
    items = "".join(f'<li>{_h(t)}</li>' for t in texts[:MAX_QUOTES])
    return kop + f'<ul style="font-size:10px;color:#374151;margin:4px 0 0 16px;">{items}</ul>'
```

In `_deepening_block` (`:2378-2391`), na `body = f'<table class="item-tbl" ...>'` en vóór de beperkte-basis-regel: bepaal `other_n = sum(c for k, c in (agg.get("primary_counts") or {}).items() if k.endswith("_other"))` en voeg `body += _anders_block(other_n=other_n, answered=answered, texts=agg.get("other_texts") or [])` toe. In `_direction_card_cell` (`:2219-2229`), na de tabel: `other_n = sum(c for k, c in st["ranked"] if k.endswith("_other"))`; `table += _anders_block(other_n=other_n, answered=n, texts=agg.get("other_texts") or [])`.

- [ ] **Stap 4: Lockstep, tests, faalset-diff, commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_tellingen.py tests/test_deepening_report.py tests/test_deepening_report_html.py tests/test_direction_aggregation.py tests/test_deepening_trigger.py tests/test_direction_report_block.py tests/test_deepening_submit.py tests/test_direction_submit.py -q
```
Faalt een test op een dict-vergelijking met een ontbrekende `other_texts`-sleutel, voeg `"other_texts": []` toe aan de verwachte dict (en aan `_agg`-fabrieken zoals `tests/test_direction_report_block.py::_agg`). Daarna:

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/products/shared/deepening.py backend/report_html.py tests/
git commit -m "feat(rapport): Anders-toelichtingen bij verdieping en richting (B13), staffel vanaf 5

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 10: Vaste tellingsvorm en de sluitende richtingketen (B14, H2, H19)

Elke telling in de verdiepings- en richtingketen krijgt de vorm "X van de Y (Y = ...)"; de richtingketen sluit op het totaal ("39 kregen de vraag, 27 beantwoordden hem, 12 sloegen over") en zegt waar de antwoorden van de mensen met een ander laagste onderwerp zijn gebleven (H19). "verdieptrigger" verdwijnt (H14).

**Files:**
- Modify: `backend/report_html.py:2118-2146` (`def _direction_chain`), `:2149-2237` (`def _direction_card_cell`, bronregel en percentages), `:2240-2269` (`def _wat_moet_gebeuren_block`), `:2353-2363` (`def _deepening_chain`), `:2366-2398` (`def _deepening_block`), de aanroepen van `_deepening_block` in de renderers (`:3952`, `:4370`)
- Test: `tests/test_report_tellingen.py` (aanvullen); lockstep: `tests/test_deepening_report.py:136-163`, `tests/test_deepening_report_html.py:22-23, 111`, `tests/test_direction_report_block.py:37-38, 100, 125, 143-144, 157-195, 283-290, 302-304`, `tests/test_report_direction_degraded.py:94-95, 162-164`

- [ ] **Stap 1: Schrijf de falende tests** (toevoegen aan `tests/test_report_tellingen.py`)

```python
from backend.report_html import (
    _deepening_chain,
    _direction_chain,
    _direction_totals_line,
    _telling,
)

AGG_D = {"triggered": 17, "offered": 17, "answered": 16, "skipped": 1,
         "primary_counts": {}, "secondary_counts": {}, "other_texts": []}


def test_telling_vaste_vorm():
    assert _telling(8, 16, "8 = beantwoorders") == "8 van de 16 (50%)"
    assert _telling(3, 8) == "3 van de 8"           # onder 10 geen percentage
    assert _telling(27, 62) == "27 van de 62 (44%)"


def test_deepening_chain_zonder_jargon_met_noemers():
    zin = _deepening_chain(AGG_D, "retention", "growth", n_total=39)
    assert zin == ("17 van de 39 respondenten kregen de verdiepende vraag over groeiperspectief "
                   "(17 = wie hier laag scoorde); 16 van de 17 beantwoordden die, 1 sloeg over.")
    assert "verdieptrigger" not in zin
    onder_cap = dict(AGG_D, triggered=20, offered=17)
    zin = _deepening_chain(onder_cap, "retention", "growth", n_total=39)
    assert zin.startswith("20 van de 39 respondenten scoorden hier laag; 17 van de 20 kregen de verdiepende "
                          "vraag (de andere 3 zaten al aan het maximum van drie verdiepingen)")


def test_direction_chain_sluit_en_noemt_de_noemer():
    agg = {"lowest_n": 16, "offered": 16, "answered": 15, "skipped": 1, "counts": {"grd_conversation": 11}}
    assert _direction_chain(agg, 39) == ("16 van de 39 respondenten hadden dit als eigen laagste onderwerp; "
                                         "15 van de 16 beantwoordden de vraag, 1 sloeg over.")


def test_direction_totals_line_sluit_op_het_totaal_en_verantwoordt_de_rest():
    dagg = {"growth": {"lowest_n": 16, "offered": 16, "answered": 15, "skipped": 1, "counts": {}},
            "workload": {"lowest_n": 11, "offered": 11, "answered": 10, "skipped": 1, "counts": {}},
            "leadership": {"lowest_n": 8, "offered": 8, "answered": 2, "skipped": 6, "counts": {}},
            "culture": {"lowest_n": 4, "offered": 4, "answered": 0, "skipped": 4, "counts": {}},
            "compensation": {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}},
            "role_clarity": {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}}
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert zin == ("Van de 39 respondenten kregen 39 de vraag, 27 beantwoordden hem, 12 sloegen over. "
                   "16 hadden groeiperspectief als laagste onderwerp, 11 werkdruk en herstelruimte; "
                   "de overige 12 een ander onderwerp (leiderschap en vertrouwen 8, cultuur en psychologische "
                   "veiligheid 4). Die antwoorden gaan over onderwerpen die niet op de agenda staan en zijn "
                   "daarom niet uitgewerkt.")
```

- [ ] **Stap 2: Draai, verwacht falen**

Verwacht: `ImportError` op `_direction_totals_line`.

- [ ] **Stap 3: Implementeer**

Direct boven `_direction_chain` (`:2118`):

```python
def _telling(x: int, y: int, y_is: str = "") -> str:
    """Vaste tellingsvorm (B14): "X van de Y (P%)" vanaf MIN_DISTRIBUTION_N, anders
    zonder percentage (dezelfde staffel als de tabellen). y_is is de uitleg van
    de noemer en wordt door de aanroeper in de zin geplaatst; hij staat hier als
    parameter zodat elke aanroeper eraan herinnerd wordt dat de noemer uitleg
    nodig heeft."""
    pct = f" ({round(x / y * 100)}%)" if y >= MIN_DISTRIBUTION_N else ""
    return f"{x} van de {y}{pct}"
```

Vervang `_direction_chain` door:

```python
def _direction_chain(agg: dict, n_total: int) -> str:
    """Keten laagst -> (aangeboden ->) beantwoord/overgeslagen, in de vaste
    tellingsvorm (B14). Nul-clausules blijven weg ("0 sloegen over" is fout
    Nederlands); zonder lowest_n eindigt de zin bij de constatering."""
    lowest, offered = agg["lowest_n"], agg["offered"]
    answered, skipped = agg["answered"], agg["skipped"]
    if lowest == 0:
        return "Niemand had dit als eigen laagste onderwerp."
    had = "hadden" if lowest != 1 else "had"
    opener = f"{lowest} van de {n_total} respondenten {had} dit als eigen laagste onderwerp"
    parts: list[str] = []
    deels_aangeboden = 0 < offered < lowest
    if deels_aangeboden:
        kreeg = "kregen de vraag" if offered != 1 else "kreeg de vraag"
        parts.append(f"{offered} van de {lowest} {kreeg}")
    noemer = offered if deels_aangeboden else lowest
    if answered:
        werkwoord = ("beantwoordden" if answered != 1 else "beantwoordde")
        voorwerp = "die" if deels_aangeboden else "de vraag"
        parts.append(f"{answered} van de {noemer} {werkwoord} {voorwerp}")
    if skipped:
        parts.append(f"{skipped} sloegen over" if skipped != 1 else "1 sloeg over")
    return f"{opener}." if not parts else f"{opener}; {', '.join(parts)}."


def _direction_totals_line(direction_agg: dict, agenda_keys: list[str], scan_type: str,
                           n_total: int) -> str:
    """De sluitende richtingketen op de gespreksagenda (B14, H19): totaal
    gekregen/beantwoord/overgeslagen, wie het startpunt en het tweede punt als
    laagste had, en waar de rest is gebleven. Elke respondent krijgt precies
    één richtingvraag, dus de som over de onderwerpen is het aantal respondenten."""
    offered = sum(a["offered"] for a in direction_agg.values())
    answered = sum(a["answered"] for a in direction_agg.values())
    skipped = sum(a["skipped"] for a in direction_agg.values())
    if not offered:
        return ""
    zin = f"Van de {n_total} respondenten kregen {offered} de vraag, {answered} beantwoordden hem, {skipped} sloegen over."
    agenda = [(k, direction_agg[k]["lowest_n"]) for k in agenda_keys if k in direction_agg]
    delen: list[str] = []
    for i, (k, cnt) in enumerate(agenda):
        lbl = _lc(_fl(k, scan_type))
        delen.append(f"{cnt} hadden {lbl} als laagste onderwerp" if i == 0 else f"{cnt} {lbl}")
    if delen:
        zin += " " + ", ".join(delen)
    rest = [(k, a["lowest_n"]) for k, a in direction_agg.items() if k not in agenda_keys and a["lowest_n"] > 0]
    rest_n = sum(c for _k, c in rest)
    if rest_n:
        lijst = ", ".join(f"{_lc(_fl(k, scan_type))} {c}" for k, c in sorted(rest, key=lambda kc: (-kc[1], kc[0])))
        zin += (f"; de overige {rest_n} een ander onderwerp ({lijst}). Die antwoorden gaan over "
                f"onderwerpen die niet op de agenda staan en zijn daarom niet uitgewerkt.")
    elif delen:
        zin += "."
    return zin
```

In `_wat_moet_gebeuren_block` (`:2267-2269`): voeg de totaalregel toe tussen intro en kaarten (de aparte `totals_html`-regel is bewust: een geneste f-string met aanhalingstekens in de expressie is geen Python 3.11):

```python
    agenda_keys = [r["key"] for r in ranked if r["agenda_role"] in ("startpunt", "tweede")]
    totals = _direction_totals_line(direction_agg, agenda_keys, scan_type, n_total)
    totals_html = f'<p class="dir-chain" style="margin-bottom:8px;">{_h(totals)}</p>' if totals else ""
    return (f'<div class="dir-block"><span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'
            f'<p class="dir-intro">{DIRECTION_BLOCK_INTRO}</p>'
            f'{totals_html}'
            f'<table class="dir-grid"><tr>{cards}</tr></table></div>')
```

In `_direction_card_cell`: bronregel `clear` (`:2186`) → `src = f"Volgens {_telling(st['top_n'], n)} ({n} = de mensen bij wie {_lc(label)} het laagst scoorde en de vraag beantwoordden)."`; percentages in de tabel (`:2223`) → `pct = _telling(c, n)`; `none_needed`/`plurality`/`split_none`-bronregels: vervang `{st['top_n']} van de {n}` door `{_telling(st['top_n'], n)}`.

`_deepening_chain` (`:2353-2363`) krijgt `n_total: int` als vierde parameter en wordt:

```python
def _deepening_chain(agg: dict, scan_type: str, factor_key: str, n_total: int) -> str:
    """Noemer-keten in de vaste tellingsvorm (B14), zonder "verdieptrigger" (H14)."""
    triggered, offered, answered, skipped = agg["triggered"], agg["offered"], agg["answered"], agg["skipped"]
    lbl = _lc(_fl(factor_key, scan_type))
    beantwoord = (f"{answered} van de {offered} " + ("beantwoordden die" if answered != 1 else "beantwoordde die"))
    over = f", {skipped} " + ("sloegen over" if skipped != 1 else "sloeg over") if skipped else ""
    if offered < triggered:
        rest = triggered - offered
        return (f"{triggered} van de {n_total} respondenten scoorden hier laag; {offered} van de {triggered} "
                f"kregen de verdiepende vraag (de andere {rest} zaten al aan het maximum van drie "
                f"verdiepingen); {beantwoord}{over}.")
    return (f"{triggered} van de {n_total} respondenten kregen de verdiepende vraag over {lbl} "
            f"({triggered} = wie hier laag scoorde); {beantwoord}{over}.")
```

`_deepening_block(agg, scan_type, factor_key, n_total)`: nieuwe vierde parameter, doorgeven aan `_deepening_chain`; percentages in de tabel (`:2384`) → `_telling(cnt, answered)`. Aanroepen in de renderers (`:3952`, `:4370`): `_deepening_block(deep_agg[fk], "exit", fk, n)` resp. `(..., ST, fk, n)`.

- [ ] **Stap 4: Lockstep**

Werk de gepinde zinnen bij naar de nieuwe vormen, letterlijk uit de functies hierboven: `tests/test_deepening_report.py:136-163` (vier ketens; die tests roepen `_deepening_chain` met drie argumenten aan, voeg `n_total=` toe met een getal dat de test zelf kiest, bijv. 12); `tests/test_deepening_report_html.py:22-23, 111` (`_deepening_block` krijgt een vierde argument; verwacht "8 van de 12 respondenten kregen" met `n_total=12`); `tests/test_direction_report_block.py:37-38, 100, 125 ("7 van de 10 (70%)"), 143-144, 157-195, 283-290, 302-304`; `tests/test_report_direction_degraded.py:94-95, 162-164` (`_direction_degraded_line` is ongewijzigd; controleer en laat staan als groen).

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_tellingen.py tests/test_deepening_report.py tests/test_deepening_report_html.py tests/test_direction_report_block.py tests/test_report_direction_degraded.py tests/test_direction_renderer_wiring.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 5: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_python311_syntax_guard.py -q
git add backend/report_html.py tests/
git commit -m "feat(rapport): vaste tellingsvorm X van de Y en sluitende richtingketen (B14, H2, H19)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---
## Taak 11: Drempeltabel (B20), tabelkoppen in `thead` (punt c, C9), "vrijwel gelijk" onder de tabel (C13)

H18: vier drempels (3, 5, 8, 10) op drie pagina's, alleen de 3 verklaard. Eén drempeltabel op de methodiekpagina met per drempel één zin waarom; elke inline drempel verwijst ernaar met dezelfde woorden en een paginanummer. Ronde 2 observatie 4: de ranglijstkop staat in een `tbody` en herhaalt niet op een vervolgpagina. C9: de afdelingstabel heeft geen kolomkoppen. C13: "vrijwel gelijk aan X" stond in de kolom Agenda.

**Files:**
- Modify: `backend/report_html.py:2469-2572` (`def _trust_page`), `:1840-2016` (`def _prioriteringsraster`: `thead`, `_agenda_cell`, near-tie-regel, drempelverwijzing), `:2858-2949` (`def _segment_block`: `thead`, drempelverwijzing), `:2366-2398` (`def _deepening_block`: caveat met verwijzing), `:2149-2237` (`def _direction_card_cell`: caveat met verwijzing), `backend/report_css.py` (`.raster-tbl thead`, `.item-tbl th`)
- Test: `tests/test_report_drempels_en_koppen.py` (nieuw); lockstep: `tests/test_report_priority_render.py:162`, `tests/test_direction_report_block.py` (asserties op `"Richtingvraag"` in `_trust_page` blijven), `tests/test_report_degraded_verwijzingen.py:171` (`"patroonduiding"` mag niet meer voorkomen, assertie blijft waar)

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_drempels_en_koppen.py`:

```python
"""B20 drempeltabel, herhaalde tabelkoppen (thead), C9, C13."""
import re

from backend.products.shared.deepening import DEEPENING_MIN_N, DIRECTION_MIN_N
from backend.report_distribution import MIN_DISTRIBUTION_N
from backend.report_html import (
    LEIDRAAD_ANKERS,
    _drempeltabel,
    _prioriteringsraster,
    _segment_block,
    _trust_page,
)
from backend.scoring_config import MIN_AGGREGATE_N, MIN_SEGMENT_N
from tests.test_report_priority_render import RANKED, RESP
from tests.test_report_startpuntverhaal import FACTOR_ROWS, ROWS


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_drempeltabel_noemt_elke_drempel_met_een_waarom():
    t = _tekst(_drempeltabel("retention"))
    for n in (DIRECTION_MIN_N, MIN_SEGMENT_N, DEEPENING_MIN_N, MIN_AGGREGATE_N):
        assert f" {n} " in f" {t} "
    assert "richtingvraag" in t and "afdeling" in t and "verdieping" in t and "profiel per onderwerp" in t
    assert "omdat" in t or "zodat" in t
    assert f'id="{LEIDRAAD_ANKERS["drempels"]}"' in _drempeltabel("retention")
    # Loep Start heeft geen richtingvraag en geen verdieping: die rijen ontbreken.
    ob = _tekst(_drempeltabel("onboarding"))
    assert "richtingvraag" not in ob and "verdieping" not in ob


def test_methodiekpagina_draagt_de_drempeltabel_en_geen_drempelwaarden_cel():
    html = _trust_page("retention", direction_active=True)
    assert 'id="sec-drempels"' in html
    assert "Drempelwaarden" not in html and "patroonduiding" not in html
    assert MIN_DISTRIBUTION_N == MIN_AGGREGATE_N   # één tien, niet twee


def test_ranglijst_kop_staat_in_thead_en_heet_onderwerp():
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="V?", review_when="R.",
                                opener_html="<h2>A</h2>")
    assert '<table class="raster-tbl"><thead><tr>' in html
    assert "<th" in html.split("<thead>")[1].split("</thead>")[0]
    assert ">Onderwerp</th>" in html and ">Factor</th>" not in html


def test_vrijwel_gelijk_staat_onder_de_tabel_niet_in_de_agendakolom():
    html = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="V?", review_when="R.",
                                opener_html="<h2>A</h2>")
    tabel_einde = html.index("</table>")
    i = html.index("vrijwel gelijk aan Werkdruk en herstelruimte")
    assert i > tabel_einde
    assert "Leiderschap staat vrijwel gelijk aan Werkdruk en herstelruimte" in html


def test_ranglijst_en_afdelingen_verwijzen_naar_de_drempeltabel():
    raster = _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                  deepening_active=True, mgmt_q="V?", review_when="R.",
                                  opener_html="<h2>A</h2>")
    assert 'href="#sec-drempels"' in raster and "drempeltabel op pagina" in _tekst(raster)
    seg = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    assert 'href="#sec-drempels"' in seg


def test_afdelingstabel_heeft_kolomkoppen():
    html = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    kop = html.split("<thead>")[1].split("</thead>")[0]
    for h in ("Afdeling", "Ingevuld", "Score", "Laagste onderwerp", "Spreiding"):
        assert h in kop
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_drempels_en_koppen.py -q
```
Verwacht: `ImportError` op `_drempeltabel`.

- [ ] **Stap 3: Implementeer**

Direct boven `_trust_page` (`:2469`):

```python
def _drempeltabel(scan_type: str) -> str:
    """Eén drempeltabel voor het hele rapport (B20, H18): elke drempel met de
    plek waar hij werkt en één zin waarom. De getallen komen uit de constanten
    die ze sturen; de inline verwijzingen in het rapport noemen deze tabel met
    een paginanummer (_pref naar LEIDRAAD_ANKERS["drempels"])."""
    rijen: list[tuple[int, str, str]] = [
        (MIN_AGGREGATE_N, "profiel per onderwerp, spreiding, en een afdeling als startpunt",
         "onder de tien antwoorden bepaalt één persoon te veel het gemiddelde, en is een "
         "spreidingsbeeld geen beeld maar een handvol stippen"),
        (MIN_SEGMENT_N, "een afdeling apart in de tabel, en de open toelichtingen",
         "onder de vijf zijn antwoorden herleidbaar tot personen, ook zonder naam"),
    ]
    if scan_type in DIRECTION_SCAN_TYPES:
        rijen.append((DEEPENING_MIN_N, "een gedeelde toelichting uit de verdieping op de agenda",
                      "onder de acht kan \"geen duidelijke meerderheid\" toevallig zijn; vanaf acht "
                      "telt een voorsprong van twee als signaal"))
        rijen.append((DIRECTION_MIN_N, "de richtingvraag per onderwerp",
                      "lager dan de vijf voor afdelingen, omdat niemand in de organisatie kan zien "
                      "wie een onderwerp als laagste had; bij drie of vier staat er een "
                      "beperkte-basis-regel bij"))
    rijen.sort()
    trs = "".join(f'<tr><td class="is" style="width:8%;text-align:left;">{n}</td>'
                  f'<td class="iq" style="width:38%;">{_h(waar)}</td><td>{_h(waarom)}</td></tr>'
                  for n, waar, waarom in rijen)
    return (f'<div class="card" id="{LEIDRAAD_ANKERS["drempels"]}" style="margin-top:10px;">'
            f'<h3>Drempels in dit rapport</h3>'
            f'<p style="font-size:10px;color:#374151;">Loep toont pas iets vanaf een minimumaantal '
            f'antwoorden. Dit zijn de drempels, waar ze werken en waarom.</p>'
            f'<table class="item-tbl"><thead><tr><th>Vanaf</th><th>Waar het geldt</th><th>Waarom</th></tr></thead>'
            f'<tbody>{trs}</tbody></table></div>')
```

In `_trust_page`: verwijder in `cells_r1` de tuple `("Drempelwaarden", ...)` (retention `:2497`, exit `:2525`; onboarding heeft er geen) en render `{_drempeltabel(scan_type)}` direct na de eerste `<table class="tg">` in de returnstring. Verwijder de zin "Dit blok toont een richting vanaf 3 antwoorden, lager dan de 5 die voor afdelingen geldt, omdat niemand in de organisatie kan zien wie een onderwerp als laagste had. Bij kleine aantallen kan het beeld toevallig zijn; herleidbaar is het niet. Daarom staat er dan een beperkte-basis-regel bij." uit de Richtingvraag-cel (`:2550-2554`) en vervang hem door "De drempel van 3 staat in de drempeltabel hierboven." (`tests/test_direction_report_block.py` pint alleen `"Richtingvraag"` in/niet in de pagina; controleer met grep op `"lager dan de 5"` in tests en werk een eventuele pin bij).

CSS (`backend/report_css.py`): na `.raster-tbl th { ... }` toevoegen `.raster-tbl thead { display: table-header-group; }` en na `.item-tbl .is { ... }`: `.item-tbl th { text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: """ + STEEL + r"""; border-bottom: 1.5px solid """ + NAVY + r"""; padding: 4px 8px; }` en `.item-tbl thead { display: table-header-group; }`.

In `_prioriteringsraster`:
- `_agenda_cell` (`:1899-1909`): verwijder de `near_tie_with`-tak; de functie geeft alleen `<b>Startpunt</b>` / `<b>Tweede punt</b>` / leeg.
- de tabel (`:1982-1985`): `<table class="raster-tbl"><thead><tr><th style="width:{w_factor}">Onderwerp</th><th style="width:12%">Score</th>{reason_th}<th style="width:{w_spread}">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th></tr></thead>{body}</table>`.
- na de tabel, vóór `{legenda}`: een near-tie-regel:

```python
    ties = [f'{_h(r["label"])} staat vrijwel gelijk aan '
            f'{_h(next(x["label"] for x in ranked if x["key"] == r["near_tie_with"]))}'
            for r in ranked if r["near_tie_with"]]
    ties_html = f'<p class="r-legend">{"; ".join(ties)}.</p>' if ties else ""
```
en in `raster_uitleg` (`:1791-1799`): vervang het `drempels`-deel (de lijst plus de afsluitende `f'{"; ".join(drempels)}.'`) door één slotzin ZONDER punt: `f"De drempels (spreiding vanaf {MIN_DISTRIBUTION_N}" + (f", verdieping vanaf {DEEPENING_MIN_N}" if deepening_active else "") + (f", richting vanaf {DIRECTION_MIN_N}" if direction_active else "") + ") staan uitgelegd in de drempeltabel"`. `raster_uitleg` blijft een kale string (de contract-test pint de volledige string); de punt en de paginaverwijzing zet `_prioriteringsraster` erachter: `<div class="r-uitleg">{raster_uitleg(...)} op pagina {_pref(LEIDRAAD_ANKERS["drempels"])}.</div>`. Werk `test_report_priority_render.py`-asserties die op `raster_uitleg()` pinnen bij als ze de oude drempelzin letterlijk bevatten (de test rekent de string uit via de functie; controleer).

In `_segment_block` (`:2944`): `<table class="item-tbl"><thead><tr><th>Afdeling</th><th>Ingevuld / uitgenodigd</th><th>Score</th><th>Band</th><th>Laagste onderwerp</th><th>Spreiding</th></tr></thead>{rows_html}</table>` en na `_intro("segmentanalyse")` een regel `<p class="trustline">Afdelingen vanaf {MIN_SEGMENT_N} antwoorden, het onderwerpbeeld vanaf {MIN_DISTRIBUTION_N}: zie de drempeltabel op pagina {_pref(LEIDRAAD_ANKERS["drempels"])}.</p>`.

In `_deepening_block` (`:2388-2391`) en `_direction_card_cell` (`:2227-2229`): de caveat wordt `Beperkte basis: gebruik dit als gesprekshaakje, niet als conclusie (drempels: pagina {_pref(LEIDRAAD_ANKERS["drempels"])}).`

- [ ] **Stap 4: Lockstep en tests**

`tests/test_report_priority_render.py:162`: `assert "vrijwel gelijk aan Werkdruk en herstelruimte" in html` blijft waar; voeg toe `assert html.index("vrijwel gelijk aan") > html.index("</table>")`.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_drempels_en_koppen.py tests/test_report_priority_render.py tests/test_direction_report_block.py tests/test_report_degraded_verwijzingen.py tests/test_report_segment_startpunt.py tests/test_segment_factor_themes.py tests/test_report_priority_consistency.py -q
```
Verwacht: alles `passed`.

- [ ] **Stap 5: Herhaalde tabelkop bewijzen in WeasyPrint**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3a
PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe
$PY scripts/stresstest_report.py 06
$PY - <<'EOF'
from pathlib import Path
src = Path("docs/stresstest/06_een_afdeling_laag.html").read_text(encoding="utf-8")
forced = src.replace('<table class="raster-tbl">', '<div style="height:560px"></div><table class="raster-tbl">', 1)
Path("/tmp/pdfcheck/06_forced.html").write_text(forced, encoding="utf-8")
EOF
MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd /tmp/pdfcheck && pwd -W):/data" ghcr.io/weasyprint/weasyprint /data/06_forced.html /data/06_forced.pdf
$PY scripts/check_pdf_report.py /tmp/pdfcheck/06_forced.pdf --thead "Onderwerp Score"
```
Verwacht: WeasyPrint exit 0 zonder uitvoer; de check meldt geen `tabelkop ... niet op twee pagina's` (de vullingsregel mag hier klagen over de kunstmatig lege pagina: dat is de proef, niet het rapport). Noteer de twee paginanummers in de commit.

- [ ] **Stap 6: Faalset-diff en commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): drempeltabel op de methodiekpagina met inline verwijzingen; tabelkoppen in thead; vrijwel-gelijk onder de tabel

B20/H18/C9/C13, ronde 2 punt c. Herhaalde kop bewezen in WeasyPrint (scenario 06, pagina's <x> en <y>).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 12: Anonimiseringslabel één keer (C2), bandlijst weg (C3), trema en streepjes (C6), verspreidingsregel (H15)

**Files:**
- Modify: `backend/report_html.py:2952-2986` (`def _themed_quotes`), `:3428-3491` (`def _overzichtsprofiel`), `:985-1003` (`def _cover`), `:2469-2572` (`def _trust_page`), de drie renderers (aanroepen)
- Modify: `backend/products/exit/definition.py:56, 64`, `backend/products/retention/definition.py:57, 65`
- Test: `tests/test_report_taal_guard.py` (nieuw, wordt in taak 13 uitgebreid); lockstep: `tests/test_pdf_redesign.py` (aanroepen `_cover`/`_trust_page`/`_overzichtsprofiel`: nieuwe kwargs hebben defaults), `tests/test_cover_label_overflow.py` (idem), `tests/test_report_html_design.py:168-184`

- [ ] **Stap 1: Schrijf de falende tests**

`tests/test_report_taal_guard.py`:

```python
"""Taal en typografie van het klantrapport (spec par. 9 C2/C3/C6, par. 10 H15;
taak 13 vult de source-guard aan)."""
import re

from backend.report_html import (
    VERSPREIDINGSREGEL,
    _cover,
    _overzichtsprofiel,
    _themed_quotes,
    _trust_page,
    _verspreidingsregel,
)
from backend.scan_definitions import get_scan_definition


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_anonimiseringslabel_staat_een_keer_boven_de_quotes():
    html = _themed_quotes([f"Tekst {i}." for i in range(6)], "retention")
    assert html.count("Automatisch geanonimiseerd") == 1
    assert html.index("Automatisch geanonimiseerd") < html.index("Tekst 0.")


def test_overzichtsprofiel_zonder_bandlijst():
    html = _overzichtsprofiel([("Groeiperspectief", 4.2), ("Leiderschap", 7.0)],
                              summary="S.", scan_type="retention")
    assert "kwetsbaar punt (1)" not in html and "relatief sterk (1)" not in html
    assert "fbar-row" in html   # de balken blijven


def test_stellingteksten_zonder_los_streepje_en_met_trema():
    for st in ("exit", "retention"):
        teksten = [t for _k, t in get_scan_definition(st)["sdt_items"]]
        assert not any(" - " in t for t in teksten), st
        assert not any("geinteresseerd" in t for t in teksten), st
        assert any("geïnteresseerd" in t for t in teksten), st


def test_verspreidingsregel_op_cover_en_slotpagina():
    assert _verspreidingsregel("TechBouw B.V.") == (
        "Voor het MT en HR van TechBouw B.V. Deel dit rapport niet met individuele medewerkers; "
        "de toelichtingen zijn geanonimiseerd maar herkenbaar in kleine teams.")
    assert _verspreidingsregel("") == VERSPREIDINGSREGEL.format(org="de organisatie")
    cover = _cover(scan_label="Loep Behoud", scan_type="retention", org_name="TechBouw B.V.",
                   period="W", opening_question="Q?", stats=[("a", "1")])
    assert "Deel dit rapport niet met individuele medewerkers" in _tekst(cover)
    slot = _trust_page("retention", org_name="TechBouw B.V.")
    assert "Voor het MT en HR van TechBouw B.V." in _tekst(slot)
    assert "Uitsluitend bestemd voor geautoriseerde gebruikers" not in slot
```

- [ ] **Stap 2: Draai, verwacht falen**

Verwacht: `ImportError` op `VERSPREIDINGSREGEL`.

- [ ] **Stap 3: Implementeer**

`_themed_quotes` (`:2974-2986`): haal `<div class="quote-anon">...</div>` uit elke kaart en zet vóór de kaarten éénmaal `<p class="quote-anon" style="margin-bottom:10px;">Automatisch geanonimiseerd: herkende namen en contactgegevens verwijderd.</p>`.

`_overzichtsprofiel` (`:3428-3491`): verwijder de parameter `bands` en het hele `breakdown_html`-blok (`:3448-3470`); de returnstring wordt `<div class="card">{rows}{legend}</div>`. Werk de drie aanroepen (`:3894`, `:4325`, `:4767`) bij: laat `bands=_overzicht_bands` weg en vervang `_overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(...)` door `_overzicht_summary, _ = _overzicht_summary_and_bands(...)`.

Definities: `backend/products/exit/definition.py:56` `"Ik ervoer mijn werk als opgelegd - ik had ..."` → `"Ik ervoer mijn werk als opgelegd: ik had ..."`; `:64` `geinteresseerd` → `geïnteresseerd`; `backend/products/retention/definition.py:57` en `:65` idem. Dit zijn stellingteksten die ook de respondent ziet; de wijziging is puur typografisch.

Verspreidingsregel, direct boven `_cover` (`:985`):

```python
VERSPREIDINGSREGEL = ("Voor het MT en HR van {org}. Deel dit rapport niet met individuele "
                      "medewerkers; de toelichtingen zijn geanonimiseerd maar herkenbaar in kleine teams.")


def _verspreidingsregel(org_name: str) -> str:
    """H15: één zin op cover en slotpagina over wie dit mag zien. Zonder
    organisatienaam (tests, oude aanroepen) "de organisatie"."""
    return VERSPREIDINGSREGEL.format(org=org_name or "de organisatie")
```

`_cover`: na de `.csub`-regel: `<div class="cdist">{_h(_verspreidingsregel(org_name))}</div>`; CSS: `.cdist { font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 10px; max-width: 60ch; line-height: 1.5; }`.

`_trust_page`: nieuwe kwarg `org_name: str = ""`; de cel `("Privacywaarborg", "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers.")` (drie keer) wordt `("Wie dit mag zien", f"Verwerking conform AVG. {_verspreidingsregel(org_name)}")`. Geef in de drie renderers `org_name=data["org_name"]` mee.

- [ ] **Stap 4: Tests, faalset-diff, commit**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_taal_guard.py tests/test_pdf_redesign.py tests/test_cover_label_overflow.py tests/test_report_html_design.py tests/test_report_band_rounding.py tests/test_retention_copy_parity.py tests/test_direction_report_block.py -q
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
git add backend/ tests/test_report_taal_guard.py tests/
git commit -m "fix(rapport): anonimiseringslabel eenmaal, bandlijst weg, trema en streepjes, verspreidingsregel op cover en slot

C2/C3/C6/H15.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 13: Taalronde (H14, bijlage B, terminologie)

Bijlage B: "Bestuurlijke read" → "Het antwoord in het kort"; "responsbasis" → "respons" (al gedaan: "Meetgegevens"); "verdieptrigger" → weg (taak 10); "interventieprescriptie" → "advies"; "managementread" → "samenvatting voor het MT" (komt in dit rapport niet voor; de guard bewaakt het). Terminologie: "onderwerp" voor de zes gemeten thema's, "stelling" voor de losse vragen, "afdeling" voor segmenten; "factor", "thema", "item" en "segment" verdwijnen uit klantcopy. De source-guard rendert de drie rapporten en zoekt de verboden woorden in de zichtbare tekst.

**Files:**
- Modify: `backend/report_html.py` (alle onderstaande ankers), `backend/report_priority.py:44-47` (`CELL_*`-copy)
- Test: `tests/test_report_taal_guard.py` (aanvullen); lockstep: `tests/test_report_degraded_page_two.py:120, 194`, `tests/test_report_degraded_verwijzingen.py:45, 121, 162-164, 171, 194-195`, `tests/test_report_design_sprong.py:9-11`, `tests/test_report_priority_consistency.py:145-146`, `tests/test_report_onboarding_degraded_agenda.py:81-82`, `tests/test_report_leesbaarheid.py:17-18, 24`, `tests/test_report_html_design.py:105-107` (literals in de test zelf), `tests/test_report_polariteit_en_opsomming.py:50, 59`, `tests/test_report_priority_render.py` (`CELL_*`), `tests/test_report_segment_startpunt.py:411-433`, `tests/test_segment_factor_themes.py:31, 175, 186, 202`, `tests/test_report_onboarding_eerlijk.py`, `tests/test_report_direction_degraded.py`, `tests/test_direction_report_block.py:520-528`, `tests/test_report_exit_kernzin.py:136-139`

- [ ] **Stap 1: Schrijf de falende guard** (toevoegen aan `tests/test_report_taal_guard.py`)

```python
from backend.report_html import (
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _fixture
from tests.test_report_distribution import _min_retention_data
from tests.test_report_startpuntverhaal import FACTOR_ROWS, ROWS

# Bijlage B van de spec plus de terminologieregel (par. 10). Substrings, bewust
# ruim: "werkfactoren" en "segmentanalyse" horen er ook uit. "item" alleen als
# los woord: "limiet" en "kritiek" bevatten de letters ook.
VERBODEN = [r"bestuurlijke read", r"responsbasis", r"verdieptrigger", r"interventieprescriptie",
            r"managementread", r"factor", r"thema", r"segment", r"\bitems?\b",
            r"patroonduiding", r"claimgrenzen", r"begeleide managementbespreking"]


def _zichtbaar(html: str) -> str:
    body = html.split("</style>")[-1]
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body)).lower()


def _alle_rapporten():
    d = _min_retention_data()
    d["segment_rows"], d["segment_factor_rows"] = ROWS, FACTOR_ROWS
    yield "retention+afdelingen", render_retention_report_html(d)
    for st, fn in (("exit", render_exit_report_html), ("retention", render_retention_report_html),
                   ("onboarding", render_onboarding_report_html)):
        yield st, fn(_fixture(st, n=25, profile=True))
        yield f"{st}-degraded", fn(_fixture(st, n=8, profile=False))


def test_geen_verboden_woorden_in_klantcopy():
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        for pat in VERBODEN:
            m = re.search(pat, tekst)
            assert m is None, f"{naam}: {pat!r} gevonden bij ...{tekst[max(0, m.start() - 60):m.end() + 60]}..."


def test_geen_em_dashes_en_geen_losse_streepjes():
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        assert "—" not in tekst, naam
        assert " - " not in tekst, naam
```

- [ ] **Stap 2: Draai, verwacht falen**

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_taal_guard.py -q -x
```
Verwacht: `test_geen_verboden_woorden_in_klantcopy` faalt met de eerste vindplaats (waarschijnlijk "bestuurlijke read").

- [ ] **Stap 3: Vervangen, per anker**

Werk de lijst af; draai na elke groep de guard opnieuw (`-x` toont de volgende vindplaats). Regelnummers zijn de stand op main; zoek op het anker.

| Anker (main) | Nu | Wordt |
|---|---|---|
| `:1384` en de drie `ch.opener("Bestuurlijke read")` (`:3873`, `:4302`, `:4753`) | Bestuurlijke read | Het antwoord in het kort |
| `_MGMT_Q_RETENTION["role_clarity"]` `:223` | ... een thema? | ... een onderwerp? |
| `SECTION_INTROS["behoudscontext"]` `:1024` | de werkfactoren en de werkbeleving samen | de zes onderwerpen over het werk en de werkbeleving samen |
| `SECTION_INTROS["vertrekcontext"]` `:1039` | Samen met de factorscores verderop | Samen met de scores per onderwerp verderop |
| `SECTION_INTROS["overzichtsprofiel"]` `:1069-1072` | Elke factor hieronder is een thema, gemeten met drie stellingen over hetzelfde thema; | Elk onderwerp hieronder is gemeten met drie stellingen; |
| `SECTION_INTROS["verdieping"]` `:1075-1079` | laag scoorden op dit thema ... d&aacute;t een thema laag scoort | laag scoorden op dit onderwerp ... d&aacute;t een onderwerp laag scoort |
| `SECTION_INTROS["werkbeleving"]` `:1082-1087` | Naast de werkfactoren ... Werkfactoren alleen ... Een lage werkfactor | Naast de zes onderwerpen over het werk ... Die onderwerpen alleen ... Een laag onderwerp |
| `SECTION_INTROS["segmentanalyse"]` `:1096-1106` | De kolom met het laagste thema toont per afdeling de werkfactor ... het volledige factorbeeld per afdeling | De kolom met het laagste onderwerp toont per afdeling het onderwerp ... het volledige onderwerpbeeld per afdeling |
| `SECTION_INTROS["appendix"]` `:1115-1117` | van de factorscores ... waar een factorscore vandaan komt | van de scores per onderwerp ... waar een score vandaan komt |
| `OVERZICHTSPROFIEL_RANGORDE["exit"]` `:1143-1145` | Welke factor het gesprek begint ... per factor welke signalen | Welk onderwerp het gesprek begint ... per onderwerp welke signalen |
| `OVERZICHTSPROFIEL_RANGORDE["onboarding"]` `:1150-1152` | het thema dat ... de thema&#x27;s met de meeste aandacht | het onderwerp dat ... de onderwerpen met de meeste aandacht |
| `GEEN_FACTORPROFIEL_LBL` `:1243` | Nog geen factorprofiel | Nog geen profiel per onderwerp |
| `VERDIEPING_GEEN_RANGORDE` `:1258` | geen scores per factor | geen scores per onderwerp |
| `ONBOARDING_GEEN_RANGORDE` `:1266-1267` | geen scores per factor ... de factoren met de meeste aandacht | geen scores per onderwerp ... de onderwerpen met de meeste aandacht |
| `_geen_factorprofiel_note` `:1326, 1329` | geen profiel per factor / geen scores per factor | geen profiel per onderwerp / geen scores per onderwerp |
| `AGENDA_OPENER_GEEN_PROFIEL` `:1568` | geen thema aan | geen onderwerp aan |
| `_laagste_stelling_zin` `:1625` | van dit thema | van dit onderwerp |
| `_SIGNAL_EXIT_REASON`, `_SIGNAL_DIRECTION` `:1720, 1723` | een factor | een onderwerp |
| `raster_intro` `:1766` | alle zes factoren | alle zes onderwerpen |
| `raster_uitleg` `:1778, 1786, 1794, 1797` | een factor / per factor | een onderwerp / per onderwerp |
| `RASTER_LEGENDA` `:1804` | deze factor | dit onderwerp |
| `RASTER_INTRO_EMPTY` `:1823-1824` | alle zes factoren ... profiel per factor | alle zes onderwerpen ... profiel per onderwerp |
| `_raster_attribution` `:2053-2055` | dit thema ... de laagst scorende factor | dit onderwerp ... het laagst scorende onderwerp |
| `DIRECTION_DEGRADED_TAIL` `:2102` | profiel per factor | profiel per onderwerp |
| `_BANDEN_RANGORDE`, `_BANDEN_GEEN_RANGORDE` `:2443-2447` | de eigen factoren ... geen factorscores | de eigen onderwerpen ... geen scores per onderwerp |
| `_trust_page` retention intro `:2492-2494` | actieve-medewerkerresponses ... werkfactoren ... verlooppredicties | antwoorden van huidige medewerkers ... de onderwerpen over het werk ... voorspellingen over vertrek |
| `_trust_page` cellen `:2502, 2516, 2530` | ("Claimgrenzen", "... actieve-populatie groepssignaal. Geen causale claims, geen interventieprescriptie.") | ("Wat dit rapport niet doet", "Loep Behoud is een groepsbeeld van de huidige medewerkers. Geen uitspraken over oorzaken, geen advies over maatregelen.") en analoog voor onboarding ("... Geen uitspraken over oorzaken, geen voorspelling van uitval.") en exit ("... Geen uitspraken over oorzaken, geen oordeel over vermijdbaarheid, geen voorspellingen over vertrek.") |
| `_trust_page` exit `:2526` | Altijd combineren met managementgesprek. | Altijd combineren met het gesprek in het MT. |
| `_segment_status_block` `:2589, 2597, 2607, 2609` en `SEGMENT_VERVOLG*` `:2578-2580` | Segmentanalyse / Segmentanalyse beschikbaar / Segmentverschillen | Per afdeling / Per afdeling beschikbaar / Verschillen tussen afdelingen |
| `_segment_theme_cell` `:2665, 2680`, `_segment_factor_subblocks` `:2708, 2717`, `_segment_start_note` `:2842, 2845` | thema(&#39;s) ... Factorbeeld per afdeling ... Het laagst scorende thema | onderwerp(en) ... Onderwerpbeeld per afdeling ... Het laagst scorende onderwerp |
| `_segment_block` `:2941` en `_seg_opener` (`:4035`, `:4452`, `:4905`) | Segmentanalyse per afdeling / Segmentanalyse | Per afdeling |
| `_overzicht_summary_and_bands` `:3412-3416` | geen enkele factor ... Geen factor scoort kritisch ... Factorprofiel toont | geen enkel onderwerp ... Geen onderwerp scoort kritisch ... Het profiel toont |
| `_vertrekcontext` `:3533-3535` | de factorscores ... De factoren ... in de factordiepte hierna | de scores per onderwerp ... De onderwerpen ... in de verdieping hierna |
| why-cellen `:3799`, `:4206`, `:4666` | stellingen over dit thema | stellingen over dit onderwerp |
| `_factor_detail` e.a. `:3926`, `:4355`, `:4805` | Itemscores niet beschikbaar in deze wave. | Scores per stelling niet beschikbaar in deze meting. |
| `:3944`, `:4363`, `:4813` | Hoogste item binnen deze factor / Relatief sterkste item | Hoogste stelling binnen dit onderwerp / Relatief sterkste stelling |
| `:3963`, `:4380`, `:4826` | Alle stellingen in deze factor | Alle stellingen over dit onderwerp |
| `:3974`, `:4391` / `:4845` | Verdieping: prioritaire factoren / Factoren met de meeste aandacht | Verdieping: onderwerpen met de meeste aandacht / Onderwerpen met de meeste aandacht |
| `:4822` | Lager op deze factor = meer frictie | Lager op dit onderwerp = meer frictie |
| `review_when` `:4064`, `:4479`, `:4984` | of dit thema nog voorrang verdient | of dit onderwerp nog voorrang verdient |
| `_agenda_degraded_note` `:4967` | Een score per thema ontbreekt | Een score per onderwerp ontbreekt |
| `_second_why` `:4977` | Tweede laagste factorscore | Tweede laagste score |
| `_behoudscontext` sigrow `:3577` | Werkfactoren en werkbeleving samengebracht op groepsniveau. | De zes onderwerpen over het werk en de werkbeleving samengebracht op groepsniveau. |
| kernzin-terugval `:3764`, `:4267`, `:4717` | Zie de vertrekcontext / behoudscontext / het checkpointoverzicht en de responsbasis voor wat dit rapport wel toont. | ... en de meetgegevens voor wat dit rapport wel toont. (`tests/test_report_respons_gevolgen.py:316` geeft die zin zelf als invoer aan `_p02_met_respons` en blijft groen) |
| `_appendix_section`-aanroep onboarding (taak 8) | sdt_title="Werkbeleving (SDT): checkpoint-items" | sdt_title="Werkbeleving (SDT): checkpointstellingen" |
| `report_priority.py:44-47` `CELL_*` | ... verdiepingen per respondent bereikt (geen verboden woord) | ongewijzigd; controleer alleen |
| `_deepening_block` `:2396` | Welke toelichting respondenten kozen | ongewijzigd |
| `_responsbasis` (taak 5), `_leidraad_block` (taak 5), `_drempeltabel` (taak 11), `_direction_totals_line` (taak 10) | al in de nieuwe terminologie | controleer via de guard |

Ook de cover-`opening_question` en de `scan_lbl` bevatten geen verboden woorden. De `scan_meta["product_name"]` komt uit de productdefinities (Loep Vertrek/Behoud/Start): schoon.

- [ ] **Stap 4: Lockstep**

Werk de gepinde strings bij, één-op-één met de tabel: `test_report_degraded_page_two.py:194` en `test_report_polariteit_en_opsomming.py:50, 59` ("de meetgegevens onderaan deze pagina" staat er sinds taak 5; controleer); `test_report_degraded_page_two.py:275` `"Nog geen factorprofiel" not in body` → `"Nog geen profiel per onderwerp" not in body`; `test_report_degraded_verwijzingen.py:45` (`"Elke factor hieronder is een thema"` → `"Elk onderwerp hieronder is gemeten"`), `:121` (`"de zes onderwerpen over het werk en de werkbeleving samen"`), `:162-164` en `:194` (nieuwe hoofdstuknamen), `:195` (`"geen rangorde om een verdieping aan op te hangen"` blijft); `test_report_design_sprong.py:11` (`html.find("Bestuurlijke read")` → `"Het antwoord in het kort"`); `test_report_priority_consistency.py:145-146` (comment; `why_marker` blijft "Waarom X bovenaan staat"); `test_report_onboarding_degraded_agenda.py:81-82` ("Een score per onderwerp ontbreekt"); `test_report_leesbaarheid.py:17-18` (kicker "Eerste managementspoor" is een testliteral, mag blijven) en `:24` (`vervolg("Verdieping: Werkdruk")` blijft); `test_report_segment_startpunt.py:411, 416, 428-429` ("Het laagst scorende onderwerp daar is", "2 onderwerpen zijn daar niet beoordeelbaar"); `test_segment_factor_themes.py:175, 186` (`"2 onderwerp"`, `"1 onderwerp"`), `:202`; `test_report_exit_kernzin.py:136-139` (`"Gebaseerd op de score en hoe vaak dit onderwerp als vertrekreden is genoemd."`, `"Gebaseerd op het laagst scorende onderwerp."`); `test_report_priority_attribution.py:30, 79, 153` (idem); `test_direction_report_block.py:520-528` (`SECTION_INTROS["verdieping"]`: `"toelichting past het best"` blijft; `:528` blijft); `test_report_onboarding_eerlijk.py` en `test_report_direction_degraded.py`: grep op `factor`/`thema` in hun asserties en werk bij; `test_report_generation_smoke.py:490, 575, 658, 662` (`'Segmentanalyse'`) betreft de legacy ReportLab-renderer (`backend/report.py`) en blijft ongemoeid.

```bash
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/test_report_taal_guard.py -q
/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
```
Verwacht: guard groen; `GEEN_REGRESSIES`.

- [ ] **Stap 5: Commit**

```bash
git add backend/ tests/
git commit -m "refactor(rapport): taalronde: bijlage B en terminologie onderwerp/stelling/afdeling, met source-guard

H14, spec par. 10. Lockstep: 16 testbestanden (zie diff).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Taak 14: Eindverificatie: seeds, 21 scenario's, matrix "Na plan 3a", WeasyPrint-Docker, voorbeeldrapporten, guards, faalset

**Files:**
- Modify: `scripts/stresstest_report.py:597-642` (`run_scenario`: delivery record en sluitdatum), `generate_voorbeeldrapport.py:997-1006, 1140-1142` (idem)
- Modify: `docs/rapport-stresstest-2026-09-10.md` (nieuwe sectie "Na plan 3a" vóór "## Reproduceren"), `docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md` (afwijkingen)
- Regenerate: `docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.{html,pdf}`, `frontend/public/examples/` idem

- [ ] **Stap 1: Seeds voor datums en noemer**

`scripts/stresstest_report.py`, na `db.add(campaign); db.flush()` (`:600-601`):

```python
    # Meetgegevens (plan 3a, H8): start en sluiting vast per scenario, zodat
    # pagina twee echte datums toont; invited_count als noemer, gelijk aan het
    # aantal respondentrijen dat hieronder wordt aangemaakt.
    from datetime import date
    from backend.models import CampaignDeliveryRecord
    invited = sc.invited if sc.invited is not None else max(sc.n, round(sc.n / 0.7))
    campaign.closed_at = datetime(2026, 3, 30, 12, 0, tzinfo=timezone.utc)
    db.add(CampaignDeliveryRecord(organization_id=org.id, campaign_id=campaign.id,
                                  invited_count=invited, launch_date=date(2026, 3, 9)))
    db.flush()
```
en verwijder de latere dubbele `invited = ...`-regel (`:603`). `generate_voorbeeldrapport.py`: hetzelfde blok na `db.add(campaign); db.flush()` (`:1005-1006`) met `invited = int(config["invited"])`, `launch_date=date(2026, 3, 9)`, `closed_at=datetime(2026, 4, 3, 12, 0, tzinfo=timezone.utc)`; de bestaande `invited = int(config["invited"])`-regel erna mag blijven. Bij het opruimen (`_purge_campaign`) verwijdert de cascade op `Campaign.delivery_record` het record mee.

- [ ] **Stap 2: Alle 21 scenario's en de drie voorbeelden**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight/.worktrees/rapport-3a
PY=/c/Users/larsh/Desktop/Business/Verisight/.venv/Scripts/python.exe
$PY scripts/stresstest_report.py
$PY generate_voorbeeldrapport.py exit && $PY generate_voorbeeldrapport.py retention && $PY generate_voorbeeldrapport.py onboarding
```
Verwacht: 21 regels `[nn] ...` zonder traceback; drie keer "Rapport opgeslagen (HTML)" met paden in `docs/examples/` en `frontend/public/examples/`.

- [ ] **Stap 3: WeasyPrint-Docker op de drie voorbeelden en op 06, 11, 18; controle op alle zes**

```bash
mkdir -p /tmp/pdfcheck && rm -f /tmp/pdfcheck/*
cp docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_onboarding.html docs/stresstest/06_een_afdeling_laag.html docs/stresstest/11_groot_normaal.html docs/stresstest/18_vlak_n12.html /tmp/pdfcheck/
for f in /tmp/pdfcheck/*.html; do out="/tmp/pdfcheck/wp_$(basename "$f").log"; MSYS_NO_PATHCONV=1 docker run --rm -v "$(cd /tmp/pdfcheck && pwd -W):/data" ghcr.io/weasyprint/weasyprint "/data/$(basename "$f")" "/data/$(basename "${f%.html}").pdf" >"$out" 2>&1; echo "exit=$? warnings=$(wc -l < "$out") $(basename "$f")"; done
for f in /tmp/pdfcheck/*.pdf; do $PY scripts/check_pdf_report.py "$f"; done
$PY - <<'EOF'
import fitz, glob
for p in sorted(glob.glob("/tmp/pdfcheck/*.pdf")):
    d = fitz.open(p); txt = "".join(pg.get_text() for pg in d)
    print(p.split("/")[-1], d.page_count, "pag.", "em-dashes:", txt.count("—"), "pagina-verwijzingen p2:", d[1].get_text().count("pagina "))
EOF
```
Verwacht: zes keer `exit=0 warnings=0`; zes keer `OK`; nul em-dashes; op pagina 2 minstens vijf "pagina "-verwijzingen. Kopieer de PDF's van de drie voorbeelden naar hun plek:

```bash
cp /tmp/pdfcheck/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_loep.pdf && cp /tmp/pdfcheck/voorbeeldrapport_loep.pdf frontend/public/examples/voorbeeldrapport_loep.pdf
cp /tmp/pdfcheck/voorbeeldrapport_retentiescan.pdf docs/examples/ && cp /tmp/pdfcheck/voorbeeldrapport_retentiescan.pdf frontend/public/examples/
cp /tmp/pdfcheck/voorbeeldrapport_onboarding.pdf docs/examples/ && cp /tmp/pdfcheck/voorbeeldrapport_onboarding.pdf frontend/public/examples/
```

- [ ] **Stap 4: Matrix "Na plan 3a"**

Beoordeel alle 21 scenario's opnieuw langs de zes vragen, zoals in "Na ronde 2" (dezelfde beoordelingsregel: een cel beweegt alleen als de bevindingen die hem droegen tot de gefixte horen). Voeg vóór `## Reproduceren` in `docs/rapport-stresstest-2026-09-10.md` een sectie toe:

```markdown
## Na plan 3a (<datum>)

Branch `feature/rapport-3a`. In scope: spec 2026-09-16 onderdelen 1, 2, 6 en 7 (B9, B13,
B14, B20, ronde-2-punten a/b/c, de leesronde-gaten B1, B2, H1 t/m H5, H8 t/m H10, H13
t/m H20, C2, C3, C6 t/m C13) plus de responsnoemer uit spec 11-9 par. 4.6.

### Matrix na plan 3a

| # | Scenario | n | Q1 antwoord p2 | Q2 startpunt | Q3 wat moet gebeuren | Q4 holle pagina's | Q5 tegenspraak | Q6 overclaim |
|---|----------|---|----|----|----|----|----|----|
| 01 | ... |

Score (21 rijen): Q1 .. · Q2 .. · Q3 .. · Q4 .. · Q5 .. · Q6 ...
Was (na ronde 2): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/9~/2✗ · Q4 0✓/0~/21✗ · Q5 12✓/7~/2✗ · Q6 16✓/3~/2✗.

### De kop van pagina twee, per scenario

Letterlijk, uit het gegenereerde rapport (de kernzin inclusief de blijfintentie- en vertrekredenzin).

- **01** ...

### Wat er per bevinding veranderde

| # | Status | Bewijs |
|---|---|---|
| B9 | ... | vullingen per pagina uit scripts/check_pdf_report.py op 06, 11, 18 en de drie voorbeelden |
| B13 | ... | scenario 14: ... |
| B14 | ... | scenario 01 en 05: ... |
| B20 | ... | scenario 07: ... |
| punt (a) | ... | scenario 06: ... |
| punt (b) | ... | scenario 08: ... |
| punt (c) | ... | 06 geforceerd: kop op pagina x en y |

### Verificatie van de ronde

Backend <n> failed / <n> passed / <n> skipped, faalset byte-identiek aan
`docs/superpowers/plans/plan3a-baseline-failset.txt`. Python 3.11-guard groen. WeasyPrint-Docker:
zes keer exit 0, nul warnings (drie voorbeelden, 06, 11, 18). Tekstlaag nul em-dashes.
Pagina's: Vertrek <n>, Behoud <n>, Start <n>.
```
Vul elke `...` in met wat je in de rapporten ziet; een lege cel is geen matrix. Q4 moet nu per scenario ✓ zijn waar `check_pdf_report.py` `OK` gaf (06, 11, 18 gemeten; de overige achttien via de Chromium-PDF van het harnas, `--pdf`, als benadering: noteer dat expliciet).

- [ ] **Stap 5: Guards en faalset**

```bash
$PY -m pytest tests/test_python311_syntax_guard.py tests/test_report_taal_guard.py -q
$PY -m pytest tests/ -q -rf 2>&1 | tail -3
$PY -m pytest tests/ -q -rf 2>&1 | grep "^FAILED" | sed "s/ - .*//" | sort > /tmp/na.txt; diff docs/superpowers/plans/plan3a-baseline-failset.txt /tmp/na.txt && echo GEEN_REGRESSIES
grep -c "verdieptrigger\|Bestuurlijke read\|interventieprescriptie\|begeleide managementbespreking" docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_onboarding.html
```
Verwacht: guards `passed`; `25 failed` in de samenvatting; `GEEN_REGRESSIES`; drie keer `0`.

- [ ] **Stap 6: Spec-afwijkingen aanvullen en committen**

Voeg onder "Afwijkingen bij plan 3a" in de spec toe wat tijdens de bouw afweek (minimaal: de gespreksopener staat op p.02 én op de agenda als dezelfde zin met een verwijzing, niet alleen op p.02; de vlakke-profiel-zin noemt alle onderwerpen op de laagste getoonde score; de restgroep toont haar samenstelling alleen als de datalaag de leden kent).

```bash
git add scripts/stresstest_report.py generate_voorbeeldrapport.py docs/rapport-stresstest-2026-09-10.md docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md docs/examples/voorbeeldrapport_loep.html docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.html docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.html docs/examples/voorbeeldrapport_onboarding.pdf frontend/public/examples/voorbeeldrapport_loep.html frontend/public/examples/voorbeeldrapport_loep.pdf frontend/public/examples/voorbeeldrapport_retentiescan.html frontend/public/examples/voorbeeldrapport_retentiescan.pdf frontend/public/examples/voorbeeldrapport_onboarding.html frontend/public/examples/voorbeeldrapport_onboarding.pdf
git commit -m "docs(rapport): plan 3a afgerond: seeds met meetdatums, matrix na plan 3a, voorbeeldrapporten geregenereerd

WeasyPrint-Docker 6x exit 0 / 0 warnings; check_pdf_report.py OK op alle zes; backend 25 = baseline.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Daarna: klaar voor review en merge naar main (Railway-redeploy nodig voor de Python-wijzigingen; geen DB-migratie). De stresstest-uitvoer in `docs/stresstest/` staat in `.gitignore` en wordt niet gecommit.

---

## Zelfreview (afgerond door de coördinator, 2026-09-17)

De plan-schrijver stopte op een sessielimiet vlak voor deze sectie; het plan zelf is volledig (taak 0 t/m 14, 220 code-fences in balans, geen placeholders).

**Spec-dekking** (`docs/superpowers/specs/2026-09-16-rapport-onbegeleid-design.md`):

| Spec | Taak |
|---|---|
| Noemer uit het delivery record (spec 11-9 par. 4.6) + meetdatums | 1 |
| Par. 4 blok 2: blijfintentie met zones, respons met oordeel, vertrekreden-gelijkspel | 2 |
| Par. 4 blok 1: kop op getoonde score, gedeelde laagste, "één onderwerp" alleen bij één | 3 |
| Par. 4 blok 3 en 4: onderbouwing zonder lege redenen, noemer ter plekke, één opener | 4 |
| Par. 4 blok 5 en 6: 45-minutenleidraad, paginaverwijzingen, meetgegevens, zin over begeleide bespreking weg | 5 |
| Par. 4 slot (H16): pagina twee één A4, pagina drie niet bijna leeg, meetbaar via `scripts/check_pdf_report.py` | 6 |
| Par. 5: segmentblok hernoemd, brugzin, restgroep met noemer, coverformulering | 7 |
| Par. 9 B9: paginavulling, eNPS bij de context | 8 |
| Par. 9 B13: Anders-toelichtingen | 9 |
| Par. 9 B14: vaste tellingsvorm, sluitende richtingketen | 10 |
| Par. 9 B20, punt c, C9, C13: drempeltabel, `thead`, kolomkoppen | 11 |
| Par. 9 C2, C3, C6 en par. 10 H15: label, bandlijst, typografie, verspreidingsregel | 12 |
| Par. 10: taalronde en terminologie met source-guard | 13 |
| Par. 12: 21 scenario's, matrix, WeasyPrint-Docker, voorbeeldrapporten, guards, faalset | 14 |

**Buiten dit plan** (bewust): werkvragen, besluitpagina, `campaign_decisions` (plan 3b) en de vervolgmeting (plan 3c).

**Attributie:** de Co-Authored-By-regels in de commitblokken zijn voorbeelden; gebruik de regel uit je eigen sessie-instructies.
