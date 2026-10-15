"""Fixronde 15-10, onderdeel B (besluit Lars 15-10): één afdeling met een
cijfer wordt vergeleken met de hele organisatie.

Sinds fixronde 14-10 (punt 10) doen alleen afdelingen met een cijfer (minstens
10 antwoorden) mee aan de vergelijking. Had alleen Operations een cijfer, dan
zei het rapport "Er valt dus niets te vergelijken". Nu vergelijkt de conclusie
die afdeling met de score van de hele organisatie: het cijfer van pagina twee,
dus controleerbaar. Zelfde verschilgrens (SEGMENT_START_MIN_DELTA, 0,3) op de
getoonde scores. Bij Loep Vertrek is de frictiescore de maat: de afdeling wordt
aangewezen als haar frictiescore minstens 0,3 HOGER is.
"""
import html as htmllib
import re

import pytest

from backend.report_html import (
    SEGMENT_START_MIN_DELTA,
    _brugzin,
    _department_segment_rows,
    _segment_block,
    _segment_startpunt,
)
from scripts import stresstest_report as st


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend({"department": dept, "signal_score": score} for _ in range(n))
    return _department_segment_rows(out)


def _plain(fragment: str) -> str:
    t = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)))
    return re.sub(r"\s+([).;,])", r"\1", t.replace("­", "")).strip()


def _anchor(html):
    m = re.search(r'<div class="navy-anchor">(.*?)</p>', html, re.S)
    return _plain(m.group(1)) if m else ""


def _note(rows, org, scan_type="retention"):
    return _anchor(_segment_block(rows, scan_type=scan_type, org_signal=org))


EEN = (("Operations", 14, 4.5), ("Sales", 9, 7.0), ("IT", 6, 7.5))


# -- Loep Behoud ---------------------------------------------------------------

def test_drempel_ongewijzigd():
    assert SEGMENT_START_MIN_DELTA == 0.3


def test_behoud_lager_dan_organisatie_wijst_aan():
    rows = _rows(*EEN)
    seg = _segment_startpunt(rows, None, org_signal=6.9, scan_type="retention")
    assert seg and seg["department"] == "Operations"
    assert seg["tegen_org"] == 6.9
    a = _note(rows, 6.9)
    assert "Operations scoort lager dan de organisatie als geheel (4.5/10 tegen 6.9/10" in a
    assert "niets te vergelijken" not in a
    assert "Sales" not in a and "IT" not in a
    assert "—" not in a and "–" not in a and "thema" not in a.lower()


def test_behoud_precies_op_de_grens_wijst_aan():
    rows = _rows(("Operations", 12, 6.6), ("Sales", 8, 7.0))
    assert _segment_startpunt(rows, None, org_signal=6.9, scan_type="retention") is not None
    assert "scoort lager dan de organisatie als geheel (6.6/10 tegen 6.9/10" in _note(rows, 6.9)


def test_behoud_net_niet_wijst_niet_aan():
    rows = _rows(("Operations", 12, 6.7), ("Sales", 8, 7.0))
    assert _segment_startpunt(rows, None, org_signal=6.9, scan_type="retention") is None
    a = _note(rows, 6.9)
    assert "Die scoort 6.7/10, minder dan 0,3 punt onder de organisatie als geheel (6.9/10)." in a
    assert ("Loep wijst pas een afdeling aan vanaf 0,3 punt verschil; begin dus bij het "
            "organisatiebeeld.") in a
    assert "organisatiebeeld" in a
    assert "scoort lager dan de organisatie" not in a


def test_behoud_vergelijkt_op_de_getoonde_scores():
    # 6.64 toont 6.6, 6.86 toont 6.9: de lezer ziet 0,3 verschil.
    rows = _rows(("Operations", 12, 6.64), ("Sales", 8, 7.0))
    assert _segment_startpunt(rows, None, org_signal=6.86, scan_type="retention") is not None
    # 6.66 toont 6.7, 6.94 toont 6.9: de lezer ziet 0,2, ondanks 0,28 ruw.
    rows = _rows(("Operations", 12, 6.66), ("Sales", 8, 7.0))
    assert _segment_startpunt(rows, None, org_signal=6.94, scan_type="retention") is None


def test_behoud_gelijkspel():
    rows = _rows(("Operations", 12, 6.9), ("Sales", 8, 7.0))
    assert _segment_startpunt(rows, None, org_signal=6.9, scan_type="retention") is None
    a = _note(rows, 6.9)
    assert "Die komt op dezelfde score uit als de organisatie als geheel (6.9/10)." in a


def test_behoud_hoger_dan_organisatie():
    rows = _rows(("Operations", 12, 7.4), ("Sales", 8, 5.0))
    assert _segment_startpunt(rows, None, org_signal=6.9, scan_type="retention") is None
    a = _note(rows, 6.9)
    assert "Die scoort 7.4/10, niet lager dan de organisatie als geheel (6.9/10)." in a
    assert "Sales" not in a


def test_behoud_zin_zegt_waarom_de_organisatie():
    a = _note(_rows(*EEN), 6.9)
    assert "genoeg antwoorden voor een eigen cijfer" in a
    # Niet aangewezen: ook dan zegt het blok waarom het met de organisatie vergelijkt.
    b = _note(_rows(("Operations", 12, 6.9), ("Sales", 8, 7.0)), 6.9)
    assert "Alleen Operations heeft genoeg antwoorden voor een eigen cijfer. Die " in b


def test_twee_afdelingen_met_cijfer_vergelijken_nog_onderling():
    # Met twee afdelingen met een cijfer verandert niets: Operations tegen
    # Sales, niet tegen de organisatie.
    rows = _rows(("Operations", 14, 4.5), ("Sales", 12, 7.0))
    seg = _segment_startpunt(rows, None, org_signal=4.6, scan_type="retention")
    assert seg and seg["department"] == "Operations" and seg["tegen_org"] is None
    a = _note(rows, 4.6)
    assert "heeft de laagste score van de afdelingen die apart getoond worden" in a
    assert "organisatie als geheel" not in a


def test_zonder_organisatiescore_blijft_de_oude_zin():
    a = _anchor(_segment_block(_rows(*EEN), scan_type="retention"))
    assert "niets te vergelijken" in a
    assert _segment_startpunt(_rows(*EEN), None) is None


def test_restgroep_met_cijfer_die_lager_staat_blijft_genoemd():
    rows = _rows(("Operations", 14, 4.5), ("Sales", 9, 7.0),
                 ("A", 4, 3.0), ("B", 3, 3.0), ("C", 3, 3.0))
    a = _note(rows, 6.0)
    assert "scoort lager dan de organisatie als geheel" in a
    assert "De restgroep" in a and "scoort lager (3.0/10)" in a


def test_themazin_staat_erbij():
    rows = _rows(*EEN)
    fr = {"Operations": {"factors": [("workload", 4.1, 14)], "omitted": 0}}
    a = _anchor(_segment_block(rows, factor_rows=fr, scan_type="retention", org_signal=6.9))
    assert "Het laagst scorende onderwerp daar is werkdruk en herstelruimte (4.1/10)." in a


# -- Loep Vertrek: frictiescore, hoger is slechter -----------------------------
# De segmentrijen staan intern op de gezondheidsschaal (11 min de frictie).

def test_vertrek_hogere_frictiescore_wijst_aan():
    rows = _rows(("Operations", 14, 4.5), ("Sales", 9, 7.0))   # frictie 6.5
    seg = _segment_startpunt(rows, None, org_signal=5.2, scan_type="exit")
    assert seg and seg["tegen_org"] == 5.2
    a = _note(rows, 5.2, "exit")
    assert ("Operations heeft een hogere frictiescore dan de organisatie als geheel "
            "(6.5/10 tegen 5.2/10") in a


def test_vertrek_precies_op_de_grens():
    rows = _rows(("Operations", 14, 5.8), ("Sales", 9, 7.0))   # frictie 5.2
    assert _segment_startpunt(rows, None, org_signal=4.9, scan_type="exit") is not None


def test_vertrek_net_niet():
    rows = _rows(("Operations", 14, 5.9), ("Sales", 9, 7.0))   # frictie 5.1
    assert _segment_startpunt(rows, None, org_signal=4.9, scan_type="exit") is None
    a = _note(rows, 4.9, "exit")
    assert ("Die heeft een frictiescore van 5.1/10, minder dan 0,3 punt boven de "
            "organisatie als geheel (4.9/10).") in a


def test_vertrek_gelijkspel():
    rows = _rows(("Operations", 14, 6.1), ("Sales", 9, 7.0))   # frictie 4.9
    assert _segment_startpunt(rows, None, org_signal=4.9, scan_type="exit") is None
    a = _note(rows, 4.9, "exit")
    assert "Die komt op dezelfde frictiescore uit als de organisatie als geheel (4.9/10)." in a


def test_vertrek_leesrichting_lagere_frictie_wijst_niet_aan():
    # Frictie 5.0 tegen 5.5: Operations is BETER. Op de gezondheidsschaal ligt
    # ze juist lager dan 11 min 5.5; dat mag niet tot een aanwijzing leiden.
    rows = _rows(("Operations", 14, 6.0), ("Sales", 9, 7.0))
    assert _segment_startpunt(rows, None, org_signal=5.5, scan_type="exit") is None
    a = _note(rows, 5.5, "exit")
    assert ("Die heeft een frictiescore van 5.0/10, niet hoger dan de organisatie als "
            "geheel (5.5/10).") in a
    # Omgekeerd: frictie 6.0 tegen 5.5 is 0,5 hoger en wordt wel aangewezen.
    rows = _rows(("Operations", 14, 5.0), ("Sales", 9, 7.0))
    assert _segment_startpunt(rows, None, org_signal=5.5, scan_type="exit") is not None


# -- Brugzin (pagina twee) -----------------------------------------------------

def test_brugzin_noemt_de_vergelijking_met_de_organisatie():
    seg = _segment_startpunt(_rows(*EEN), None, org_signal=6.9, scan_type="retention")
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "Operations scoort lager dan de organisatie als geheel (4.5/10 tegen 6.9/10)" in zin
    assert "van de afdelingen" not in zin


def test_brugzin_vertrek():
    seg = _segment_startpunt(_rows(("Operations", 14, 4.5), ("Sales", 9, 7.0)), None,
                             org_signal=5.2, scan_type="exit")
    zin = _brugzin("growth", "Groeiperspectief", seg, "exit")
    assert ("Operations heeft een hogere frictiescore dan de organisatie als geheel "
            "(6.5/10 tegen 5.2/10)") in zin


# -- Gerenderd -----------------------------------------------------------------

def _body(pad):
    from tests.test_report_degraded_page_two import _body as b
    return b(open(pad, encoding="utf-8").read())


VERTREK_EEN = st.Scenario(
    "t_vertrek_een_afdeling", "Vertrek, één afdeling met een cijfer (n=45)",
    "Test: als 06, maar Loep Vertrek.",
    scan_type="exit", n=45, invited=60, factors=st.flat(7.3, 0.8),
    depts=[("Operations", 14), ("Sales", 9), ("Finance", 7), ("IT", 6),
           ("Customer Success", 5), ("Marketing", 4)],
    dept_shift={"Operations": -2.8})


@pytest.mark.usefixtures("stresstest_naar_tmp")
@pytest.mark.parametrize("scenario,woorden", [
    ("06_een_afdeling_laag", "scoort lager dan de organisatie als geheel"),
    ("t_vertrek_een_afdeling", "heeft een hogere frictiescore dan de organisatie als geheel"),
])
def test_scenario_wijst_operations_aan_tegen_het_cijfer_van_pagina_twee(scenario, woorden):
    sc = VERTREK_EEN if scenario == "t_vertrek_een_afdeling" else \
        {s.key: s for s in st.SCENARIOS}[scenario]
    body = _body(st.run_scenario(sc)["html"])
    a = _anchor(body)
    assert "Operations " + woorden in a, a
    org = re.search(woorden + r" \(\d+\.\d/10 tegen (\d+\.\d)/10", a).group(1)
    # Het organisatiecijfer is het cijfer van pagina twee.
    p02 = _plain(body[body.index('id="p02"'):body.index('id="p02"') + 20000])
    assert org + "/10" in p02[:4000]
    # Pagina twee noemt de afdeling ook (brugzin), en de besluitpagina heeft
    # het afdelingsblok.
    assert "Afspraak per afdeling" in body
    assert "niets te vergelijken" not in body


def test_organisatiescore_zonder_scan_type_faalt_luid():
    with pytest.raises(ValueError):
        _segment_startpunt(_rows(*EEN), None, org_signal=6.9)
