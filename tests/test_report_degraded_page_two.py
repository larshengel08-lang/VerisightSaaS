"""Pagina twee moet eerlijk degraderen als er geen factorprofiel is (bug B2).

Bron: docs/rapport-stresstest-2026-09-10.md, scenario 07 (Loep Vertrek, n=8).

Onder MIN_AGGREGATE_N afgeronde antwoorden geeft detect_patterns
`sufficient_data: False` terug, waardoor build_report_data `factor_avgs` leeg
laat. Het normale p.02-sjabloon werd toen nog steeds gerenderd, maar zonder
onderwerp: cover "Eerste aandachtspunt: —", kernzin "Bovenaan staat —
(&amp;#x2014;)" (de HTML-entity uit _score_str(None) die door _h() nogmaals
geescaped werd), de kop "Waarom  bovenaan staat" zonder factor, en een lege
Gespreksopener. Drie van die vier schenden Fail Loud (nooit stil degraderen,
nooit een kaal veld laten staan) en de streep schendt bovendien de regel dat
er geen em-dashes in klantcopy staan.

Deze tests pinnen de expliciete degraded-variant: één echte zin over wat Loep
bij dit aantal antwoorden wel en niet kan zeggen, en géén sjabloon met gaten.
"""
import pytest

from backend.products.shared.registry import get_product_module
from backend.report_html import (
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from backend.scoring_config import MIN_AGGREGATE_N

# Volledig profiel voor de positieve controle: zes factoren, duidelijke
# spreiding (zelfde patroon als tests/test_report_priority_consistency.py).
_FACTOR_AVGS = {
    "workload": 5.1,
    "growth": 5.9,
    "role_clarity": 6.2,
    "leadership": 6.4,
    "culture": 6.8,
    "compensation": 7.1,
}
_ITEM_MAP = {
    "growth":        [("GR1", "Ik zie voldoende ontwikkelmogelijkheden")],
    "workload":      [("WL1", "Mijn werkdruk is behapbaar")],
    "leadership":    [("LD1", "Mijn leidinggevende geeft duidelijke feedback")],
    "culture":       [("CU1", "Ik voel me veilig om kritiek te uiten")],
    "compensation":  [("CO1", "Mijn beloning past bij mijn werk")],
    "role_clarity":  [("RC1", "Mijn rol en verwachtingen zijn helder")],
}
_ITEM_AVGS = {items[0][0]: _FACTOR_AVGS[fk] for fk, items in _ITEM_MAP.items()}

_SCAN_LBL = {"exit": "Loep Vertrek", "retention": "Loep Behoud",
             "onboarding": "Loep Start"}
_RENDERERS = {"exit": render_exit_report_html,
              "retention": render_retention_report_html,
              "onboarding": render_onboarding_report_html}


def _nsp(scan_type: str, top_fkeys: list[str], top_flabels: list[str]) -> dict:
    """Productievorm van data["nsp"].

    build_report_data roept dit altijd aan (report_html.py, get_next_steps_payload),
    ook zonder factorprofiel: top_focus_* zijn dan leeg en de payload valt terug
    op zijn generieke per-product tekst. Een fixture met nsp={} pinde dus een
    pagina die in productie niet bestaat -- en liet de generieke
    "first_decision"-jargonzin ongezien doorrenderen.
    """
    return get_product_module(scan_type).get_next_steps_payload(
        top_focus_labels=top_flabels, top_focus_keys=top_fkeys)


def _fixture(scan_type: str, *, n: int, profile: bool) -> dict:
    """Eén fixture-vorm voor alle drie de scans.

    profile=False bootst na wat build_report_data doet bij n < MIN_AGGREGATE_N:
    factor_avgs/top_risks/top_fkeys leeg, has_pattern False. De rest van de
    data (avg_risk, SDT-gemiddelden, item-gemiddelden, vertrekredenen) komt
    daar juist wél uit -- die worden buiten de has_pattern-gate berekend.
    """
    fa = dict(_FACTOR_AVGS) if profile else {}
    _tk = ["workload"] if profile else []
    _tl = ["Werkdruk en herstelruimte"] if profile else []
    return dict(
        campaign_id="c1", scan_type=scan_type, scan_lbl=_SCAN_LBL[scan_type],
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-09-2026",
        delivery_mode="Baseline", n_invited=n + 6, n_invited_note="", n_completed=n,
        completion_pct=57.1 if not profile else 80.0,
        avg_risk=5.5, avg_eng=6.0, avg_to=4.0, avg_si=6.5,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=profile,
        factor_avgs=fa,
        top_risks=[("workload", _FACTOR_AVGS["workload"])] if profile else [],
        top_fkeys=_tk, top_flabels=_tl,
        strong_work=None, top_exit_lbl=None, top_cont_lbl=None, sig_vis=None,
        sdt_avgs={"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0},
        sdt_item_avgs={"B1": 6.1}, org_item_avgs=dict(_ITEM_AVGS),
        exit_r_dist=[{"code": "P4", "label": "Organisatiecultuur", "count": 3}],
        cont_dist=[], prev_dist={}, open_texts=[],
        deepening_agg={}, direction_agg={}, retention_profile=None,
        exit_pbs=[], ret_pbs=[], msp=None, nsp=_nsp(scan_type, _tk, _tl),
        factor_items_map={fk: list(v) for fk, v in _ITEM_MAP.items()} if profile else {},
        sdt_items=[("B1", "Testvraag autonomie")],
        enps_available=False, enps_score=None,
        factor_resp_scores={fk: [sc] * n for fk, sc in fa.items()},
        intent_resp={"stay": [6.5] * n, "turnover": [4.0] * n,
                     "engagement": [6.0] * n},
        segment_rows=[], segment_factor_rows=None,
    )


def _body(html: str) -> str:
    """Alleen het gerenderde document, zonder de <style>-blokken.

    De CSS bevat ontwikkelaarscommentaar met em-dashes; dat is geen klantcopy
    en mag de em-dash-assertie niet vervuilen.
    """
    return html.split("</style>")[-1]


def _render(scan_type: str, *, n: int, profile: bool) -> str:
    return _RENDERERS[scan_type](_fixture(scan_type, n=n, profile=profile))


def _page_two(html: str) -> str:
    """Alleen de Bestuurlijke read -- het eerste .pb-blok na de cover.

    "Gespreksopener" komt verderop in het rapport legitiem terug (de sluitende
    gespreksagenda); een assertie op het hele document zou daarop afketsen.
    """
    body = _body(html)
    i = body.find('<div class="pb sec">')
    assert i != -1, "pagina twee niet gevonden"
    j = body.find('<div class="pb sec">', i + 10)
    return body[i:j if j != -1 else len(body)]


_N_DEGRADED = 8
assert _N_DEGRADED < MIN_AGGREGATE_N, "fixture moet onder de patroondrempel zitten"

SCANS = ["exit", "retention", "onboarding"]


# ── De vier symptomen uit B2 zijn weg ────────────────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_geen_kale_streep_of_dubbel_geescapete_entity(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    assert "—" not in body
    assert "&#x2014;" not in body
    assert "&amp;#x2014;" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_geen_onderwerploze_why_kop(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    assert "Waarom  bovenaan" not in body
    assert "bovenaan staat" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_geen_lege_gespreksopener(scan_type):
    p2 = _page_two(_render(scan_type, n=_N_DEGRADED, profile=False))
    assert '<span class="mq-label">Gespreksopener</span><p></p>' not in p2
    assert "Gespreksopener" not in p2


@pytest.mark.parametrize("scan_type", SCANS)
def test_geen_claim_over_de_laagste_score(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    assert "scoort het laagst" not in body
    assert "is het eerste gesprekspunt" not in body


# ── De eerlijke zin staat er wél, met het echte aantal en de drempel ─────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_eerlijke_zin_noemt_aantal_en_drempel(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    assert f"Met {_N_DEGRADED} antwoorden toont Loep nog geen profiel per factor." in body
    assert f"minimaal {MIN_AGGREGATE_N} antwoorden" in body
    assert "Wat dit rapport wel laat zien:" in body
    # Loep als onderwerp, geen "ik", geen jargon.
    i = body.find(f"Met {_N_DEGRADED} antwoorden")
    note = body[i:i + 400]
    assert " ik " not in note.lower()


@pytest.mark.parametrize("scan_type,belofte", [
    ("exit", "de opgegeven vertrekredenen"),
    ("retention", "de behoudscontext"),
    ("onboarding", "het checkpointoverzicht"),
])
def test_eerlijke_zin_is_per_product_toegesneden(scan_type, belofte):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    i = body.find(f"Met {_N_DEGRADED} antwoorden")
    assert i != -1
    note = body[i:i + 500]
    assert belofte in note
    assert "de responsbasis onderaan deze pagina" in note


# ── De drempelzin mag zichzelf niet tegenspreken ────────────────────────────
# De degraded staat wordt getriggerd door een LEEG factorprofiel, niet door het
# responsaantal: scoring.factor_averages laat een factor zonder waarden weg, dus
# een meting met 14 antwoorden maar zonder gescoorde organisatiefactoren kwam
# hier ook terecht -- en las dan "Met 14 antwoorden ... Daarvoor zijn minimaal
# 10 antwoorden nodig". Boven de drempel hoort de zin dus de drempel niet te
# noemen.

_N_GEEN_SCORES = 14
assert _N_GEEN_SCORES >= MIN_AGGREGATE_N, "fixture moet BOVEN de patroondrempel zitten"

_GEEN_SCORES_ZIN = (
    "Voor deze meting zijn er geen scores per factor berekend. "
    f"Aan het aantal antwoorden ligt het niet: dat zijn er {_N_GEEN_SCORES}.")


def _note(body: str) -> str:
    """De degraded alinea op p.02, van eerste woord tot </p>."""
    kop = '<h3>Wat dit rapport wel en niet laat zien</h3>'
    i = body.find(kop)
    assert i != -1, "degraded alinea niet gevonden"
    j = body.find(">", body.find("<p", i)) + 1
    return body[j:body.find("</p>", j)]


@pytest.mark.parametrize("scan_type", SCANS)
def test_boven_de_drempel_noemt_de_zin_de_drempel_niet(scan_type):
    body = _body(_render(scan_type, n=_N_GEEN_SCORES, profile=False))
    note = _note(body)
    assert _GEEN_SCORES_ZIN in note
    assert f"minimaal {MIN_AGGREGATE_N}" not in note
    assert "Wat dit rapport wel laat zien:" in note


@pytest.mark.parametrize("scan_type", SCANS)
def test_onder_de_drempel_noemt_de_zin_de_drempel_nog_steeds(scan_type):
    note = _note(_body(_render(scan_type, n=_N_DEGRADED, profile=False)))
    assert f"Met {_N_DEGRADED} antwoorden toont Loep nog geen profiel per factor." in note
    assert f"minimaal {MIN_AGGREGATE_N} antwoorden" in note
    assert _GEEN_SCORES_ZIN not in note


@pytest.mark.parametrize("scan_type", SCANS)
def test_de_kop_boven_de_alinea_wijst_niet_naar_het_aantal(scan_type):
    """De kop stond op "Wat dit aantal antwoorden wel en niet toelaat" en deed
    daarmee dezelfde onjuiste toeschrijving als de drempelzin."""
    for n in (_N_DEGRADED, _N_GEEN_SCORES):
        body = _body(_render(scan_type, n=n, profile=False))
        assert "Wat dit aantal antwoorden wel en niet toelaat" not in body
        assert "<h3>Wat dit rapport wel en niet laat zien</h3>" in body


def test_de_drie_zinnen_zijn_niet_drie_keer_dezelfde():
    notes = set()
    for scan_type in SCANS:
        body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
        i = body.find(f"Met {_N_DEGRADED} antwoorden")
        notes.add(body[i:body.find("</p>", i)])
    assert len(notes) == 3


# ── Cover draagt een eerlijke waarde in plaats van een streep ────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_cover_toont_geen_streep_maar_een_eerlijke_waarde(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False))
    # cmv-long: "Nog geen factorprofiel" is langer dan _COVER_VALUE_LONG_CHARS,
    # dus de bestaande overflow-guard uit B10 pakt 'm op.
    assert ">Nog geen factorprofiel</div>" in body
    assert '<div class="cmv cmv-long">Nog geen factorprofiel</div>' in body


# ── Positieve controle: met profiel is de pagina NIET degraded ──────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_met_profiel_is_pagina_twee_niet_degraded(scan_type):
    body = _body(_render(scan_type, n=12, profile=True))
    assert "toont Loep nog geen profiel per factor" not in body
    assert "Nog geen factorprofiel" not in body
    assert "bovenaan staat" in body
    p2 = _page_two(_render(scan_type, n=12, profile=True))
    assert "Gespreksopener" in p2
    assert '<span class="mq-label">Gespreksopener</span><p></p>' not in p2
    # De degraded-fix mag geen em-dashes terugbrengen in het normale rapport.
    assert "—" not in body
    assert "&amp;#x2014;" not in body


# ── het totaalsignaal blijft op p.02 staan zonder factorprofiel ─────────────
# Sinds ronde 2 (taak 3) draagt de onderbouwingsrij onder het why-blok het
# totaalsignaal met zijn band, en opent p.02 met een zin over de vorm van het
# profiel. Zonder factorprofiel rendert die rij niet (het why-blok maakt plaats
# voor de degraded alinea) en levert de vormzin leeg op. De degraded terugval in
# de drie renderers is dan de enige plek waar het getal nog staat; valt die weg,
# dan verdwijnt het signaal stilzwijgend van de pagina.

_DEGRADED_SIGNAAL = {
    "exit": "De frictiescore van 5.5/10 wijst op een",
    "retention": "(behoudssignaal 5.5/10).",
    "onboarding": "(checkpointscore 5.5/10).",
}


@pytest.mark.parametrize("scan_type", SCANS)
def test_totaalsignaal_blijft_in_de_kernzin_zonder_factorprofiel(scan_type):
    p2 = _page_two(_render(scan_type, n=_N_DEGRADED, profile=False))
    # De onderbouwingsrij die het getal normaal draagt bestaat hier niet.
    assert "<table class='sg'><tr>" not in p2
    assert _DEGRADED_SIGNAAL[scan_type] in p2


@pytest.mark.parametrize("scan_type", SCANS)
def test_totaalsignaal_staat_met_profiel_in_de_onderbouwingsrij(scan_type):
    """Het spiegelbeeld: mét profiel draagt de rij het getal en herhaalt de
    kernzin het niet meer."""
    p2 = _page_two(_render(scan_type, n=12, profile=True))
    assert "<table class='sg'><tr>" in p2
    assert '<div class="sc-v">5.5/10</div>' in p2
    assert _DEGRADED_SIGNAAL[scan_type] not in p2
