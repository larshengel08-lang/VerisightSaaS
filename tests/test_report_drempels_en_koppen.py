"""B20 drempeltabel, herhaalde tabelkoppen (thead), C9, C13.

Eén drempeltabel op de methodiekpagina met per drempel de plek waar hij werkt
en één zin waarom; elke inline drempel verwijst ernaar met een paginanummer.
Verder: de ranglijstkop en de afdelingskop staan in een `thead` (herhalen dus op
een vervolgpagina) en de near-tie-regel staat onder de tabel in plaats van in de
smalle agendakolom.
"""
import re

from backend.products.shared.deepening import DEEPENING_MIN_N, DIRECTION_MIN_N
from backend.report_css import build_css
from backend.report_distribution import MIN_DISTRIBUTION_N
from backend.report_html import (
    LEIDRAAD_ANKERS,
    MIN_QUOTES_N,
    OTHER_MIN_N,
    OTHER_SHARE_MIN,
    _anders_block,
    _drempeltabel,
    _leidraad_block,
    _prioriteringsraster,
    _segment_block,
    _trust_page,
)
from backend.scoring_config import MIN_AGGREGATE_N, MIN_SEGMENT_N
from tests.test_report_priority_render import RANKED, RESP
from tests.test_report_startpuntverhaal import FACTOR_ROWS, ROWS


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _raster():
    return _prioriteringsraster(ranked=RANKED, scan_type="retention", factor_resp_scores=RESP,
                                deepening_active=True, mgmt_q="V?", review_when="R.",
                                opener_html="<h2>A</h2>")


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


def test_drempeltabel_noemt_ook_de_anders_drempels_met_dezelfde_woorden():
    """Opdracht uit taak 9 (spec, kopje "Voor taak 11"): de tabel dekt ook het
    aandeel van 20%, de vloer van 2 waarboven het Anders-blok verschijnt en de 5
    waaronder alleen een aantal wordt getoond, in de woorden van het blok zelf."""
    t = _tekst(_drempeltabel("retention"))
    zelfde_woorden = (f"De teksten tonen we pas vanaf {MIN_QUOTES_N}, om "
                      "herleidbaarheid te voorkomen")
    assert zelfde_woorden in t
    assert zelfde_woorden in _tekst(_anders_block(other_n=2, answered=6, texts=["a", "b"]))
    assert f"{round(OTHER_SHARE_MIN * 100)}%" in t
    assert f" {OTHER_MIN_N} " in f" {t} "
    # De open toelichtingen bestaan ook zonder verdieping; de Anders-drempels niet.
    ob = _tekst(_drempeltabel("onboarding"))
    assert zelfde_woorden in ob
    assert f"{round(OTHER_SHARE_MIN * 100)}%" not in ob


def test_drempeltabel_leest_de_getallen_uit_de_constanten(monkeypatch):
    """De tabel is de plek waar de klant de drempels naleest. Staan de getallen
    hardgecodeerd, dan gaat die uitleg liegen zodra een gate verschuift."""
    import backend.report_html as rh
    assert f"{DIRECTION_MIN_N} de richtingvraag" in _tekst(rh._drempeltabel("retention"))
    monkeypatch.setattr(rh, "DIRECTION_MIN_N", 4)
    assert "4 de richtingvraag" in _tekst(rh._drempeltabel("retention"))


def test_methodiekpagina_draagt_de_drempeltabel_en_geen_drempelwaarden_cel():
    html = _trust_page("retention", direction_active=True)
    assert 'id="sec-drempels"' in html
    assert "Drempelwaarden" not in html and "patroonduiding" not in html
    assert MIN_DISTRIBUTION_N == MIN_AGGREGATE_N   # één tien, niet twee


def test_richtingcel_verwijst_naar_de_drempeltabel_in_plaats_van_zijn_eigen_uitleg():
    html = _trust_page("retention", direction_active=True)
    assert "De drempel van 3 staat in de drempeltabel hierboven." in html
    assert "Dit blok toont een richting vanaf 3 antwoorden" not in html
    # De verantwoording van de lage vloer blijft staan, nu in de tabel.
    assert ("omdat niemand in de organisatie kan zien wie een onderwerp als "
            "laagste had") in html


def test_leidraadregel_wijst_in_alle_drie_de_producten_naar_de_drempeltabel():
    """Taak 5 splitste regel 1 omdat Loep Start geen drempelcel had. Met de
    drempeltabel op alle drie de methodiekpagina's mag die tweedeling weg."""
    for st in ("exit", "retention", "onboarding"):
        html = _leidraad_block(st, has_segments=True, has_quotes=True,
                               has_direction=st != "onboarding",
                               has_deepening=st != "onboarding")
        assert f'href="#{LEIDRAAD_ANKERS["drempels"]}"' in html
        assert "de drempels staan op pagina" in _tekst(html)
        assert "wat Loep uit deze aantallen wel en niet afleidt" not in html


def test_ranglijst_kop_staat_in_thead_en_heet_onderwerp():
    html = _raster()
    assert '<table class="raster-tbl"><thead><tr>' in html
    assert "<th" in html.split("<thead>")[1].split("</thead>")[0]
    assert ">Onderwerp</th>" in html and ">Factor</th>" not in html


def test_vrijwel_gelijk_staat_onder_de_tabel_niet_in_de_agendakolom():
    html = _raster()
    tabel_einde = html.index("</table>")
    i = html.index("vrijwel gelijk aan Werkdruk en herstelruimte")
    assert i > tabel_einde
    assert "Leiderschap staat vrijwel gelijk aan Werkdruk en herstelruimte" in html


def test_ranglijst_en_afdelingen_verwijzen_naar_de_drempeltabel():
    raster = _raster()
    assert 'href="#sec-drempels"' in raster and "drempeltabel op pagina" in _tekst(raster)
    seg = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    assert 'href="#sec-drempels"' in seg


def test_afdelingstabel_heeft_kolomkoppen():
    html = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    kop = html.split("<thead>")[1].split("</thead>")[0]
    for h in ("Afdeling", "Ingevuld", "Score", "Laagste onderwerp", "Spreiding"):
        assert h in kop


def test_css_laat_de_tabelkoppen_herhalen_op_een_vervolgpagina():
    """Een `thead` alleen is niet genoeg: zonder `display: table-header-group`
    behandelt WeasyPrint de groep als een gewone `tbody` en begint een
    vervolgpagina met kolommen zonder naam (ronde 2 observatie 4).

    Deze eis hoort op een echte render gemeten te worden. Dat kon in deze sessie
    niet (geen GTK lokaal, de Docker-engine antwoordt niet), dus staat ze hier op
    de declaratie die het gedrag waarmaakt. In de WeasyPrint van het venv is
    nagelezen dat alleen een groep met `is_header` (gezet op precies deze
    display-waarde, `formatting_structure/build.py`) buiten de paginabreuk-lus
    blijft en per paginafragment opnieuw wordt gelegd (`layout/table.py`).
    """
    css = build_css("retention")
    for sel in (".raster-tbl thead", ".item-tbl thead"):
        blok = re.search(re.escape(sel) + r"\s*\{([^}]*)\}", css)
        assert blok, f"{sel} staat niet in het stylesheet"
        assert "table-header-group" in blok.group(1)


def test_geen_em_dashes_in_de_nieuwe_copy():
    for html in (_drempeltabel("retention"), _drempeltabel("exit"),
                 _drempeltabel("onboarding"), _raster(),
                 _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")):
        assert "—" not in html and "&#x2014;" not in html
