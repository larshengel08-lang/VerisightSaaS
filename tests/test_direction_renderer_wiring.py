"""De renderers geven de factorscore mee aan de richtingregel op p.02.

Zonder die koppeling vuurt split_none daar niet en zegt pagina twee "de groep
is verdeeld" terwijl de gespreksagenda twee pagina's verder zegt dat een deel
vindt dat er niets hoeft. Dat was geen fout, geen log en geen rode test: het
kaartblok is los gepind, de p.02-regel was dat niet. Deze test pint hem, voor
beide scans die de richtingvraag kennen.
"""
import re

import pytest

from backend.report_html import render_exit_report_html, render_retention_report_html
from tests.conftest import exit_report_data
from tests.test_report_distribution import _min_retention_data

# Kwetsbaar scorende startpuntfactor + een verdeling waarin de niets-groep de
# gedeeld-grootste keuze is: precies de combinatie die split_none oplevert.
SPLIT_NONE_COUNTS = {"wld_none": 5, "wld_peaks": 5, "wld_scope": 2}
KWETSBAAR = 4.5


def _dir_agg(counts=None):
    counts = SPLIT_NONE_COUNTS if counts is None else counts
    n = sum(counts.values())
    return {"workload": {"lowest_n": n, "offered": n, "answered": n,
                         "skipped": 0, "counts": counts},
            # De tweede rasterrij heeft ook een aggregaat nodig (het blok
            # indexeert direct); leeg betekent hier "te weinig antwoorden".
            "culture": {"lowest_n": 0, "offered": 0, "answered": 0,
                        "skipped": 0, "counts": {}}}


def _p02_direction_line(html: str) -> str:
    m = re.search(r'<p class="mq-direction">(.*?)</p>', html, re.S)
    assert m, "geen richtingregel op p.02"
    return m.group(1)


def _retention_html(score=KWETSBAAR, counts=None):
    data = _min_retention_data()
    data["factor_avgs"] = {"workload": score}
    data["top_risks"] = [("workload", score)]
    data["org_item_avgs"] = {"W1": score}
    data["direction_agg"] = _dir_agg(counts)
    return render_retention_report_html(data)


def _exit_html(score=KWETSBAAR, counts=None):
    return render_exit_report_html(exit_report_data(
        factor_avgs={"workload": score, "culture": 7.0},
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")],
                          "culture": [("C1", "Testvraag cultuur")]},
        direction_agg=_dir_agg(counts)))


VERDEELD = ("5 kozen", "kozen")


@pytest.mark.parametrize("html_fn", [_retention_html, _exit_html],
                         ids=["retention", "exit"])
def test_p02_richtingregel_krijgt_de_factorscore_van_de_renderer(html_fn):
    line = _p02_direction_line(html_fn())
    # De split_none-regel, niet de divided-regel: de renderer heeft de score
    # van de startpuntfactor doorgegeven.
    assert "zijn hierover verdeeld. 5 zeggen dat hier niets hoeft, 5 vragen om" in line
    assert "Zie de gespreksagenda." not in line


@pytest.mark.parametrize("html_fn", [_retention_html, _exit_html],
                         ids=["retention", "exit"])
def test_p02_en_de_kaart_spreken_elkaar_niet_tegen(html_fn):
    """Beide plekken lezen dezelfde staat, dus of ze noemen de verdeeldheid
    beide, of geen van beide."""
    html = html_fn()
    assert "een deel zegt dat hier niets hoeft" in html          # de kaart
    assert "zijn hierover verdeeld" in _p02_direction_line(html)  # p.02


@pytest.mark.parametrize("html_fn", [_retention_html, _exit_html],
                         ids=["retention", "exit"])
def test_niet_kwetsbaar_geeft_op_beide_plekken_de_oude_regel(html_fn):
    """Dezelfde verdeling op een factor die niet kwetsbaar scoort: nergens een
    split_none-zin, zodat deze test ook echt op de score toetst."""
    html = html_fn(score=6.0)
    assert "een deel zegt dat hier niets hoeft" not in html
    assert "Zie de gespreksagenda." in _p02_direction_line(html)
