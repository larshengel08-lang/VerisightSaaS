"""Segmentstartpunt en rij-cap (spec ronde 2 par. 3).

B7: het navy-blok "Startpunt voor de bespreking" wees een afdeling aan op grond
van 0,00 tot 0,30 punt verschil, twee keer met een claim die de tabel erboven
tegensprak (de gepoolde restgroep stond lager dan de aangewezen afdeling).
B8: een rijlimiet van acht liet afdelingen met 7 tot 9 responses verdwijnen in
de restgroep, tegen een intro die vijf als enige grens noemt.
"""
import re

from backend.report_distribution import MIN_DISTRIBUTION_N
from backend.report_html import (
    SEGMENT_START_MIN_DELTA,
    _department_segment_rows,
    _segment_block,
)


def _resp(dept, n, score):
    return [{"department": dept, "signal_score": score} for _ in range(n)]


def _rows(*specs):
    out = []
    for dept, n, score in specs:
        out.extend(_resp(dept, n, score))
    return out


def _anchor(html):
    """De tekst van het navy-blok, zonder tags: elke claim in één string."""
    m = re.search(r'<div class="navy-anchor">(.*?)</p>', html, re.S)
    if not m:
        return ""
    return re.sub(r"<[^>]+>", "", m.group(1))


# ─── 1. Drempels ─────────────────────────────────────────────────────────────

def test_drempel_is_een_benoemde_constante():
    assert SEGMENT_START_MIN_DELTA == 0.3


# ─── 2. Rij-cap (B8) ─────────────────────────────────────────────────────────

def test_alle_afdelingen_met_genoeg_respons_krijgen_een_rij():
    # Scenario 10: twaalf afdelingen van 7 tot 9. Geen enkele mag verdwijnen.
    specs = [(f"Afdeling {i}", 7 + (i % 3), 5.0 + i * 0.1) for i in range(12)]
    rows = _department_segment_rows(_rows(*specs))
    assert len(rows) == 12
    assert not any(r["is_pooled"] for r in rows)
    namen = {r["department"] for r in rows}
    assert namen == {s[0] for s in specs}


def test_grootste_afdeling_verdwijnt_niet_in_de_restgroep():
    # B8 letterlijk: de grootste afdeling van de meting stond op plek 9 in de
    # sortering en werd daardoor gepoold. Nu staat ze in de tabel.
    specs = [(f"Afdeling {i}", 7, 5.0 + i * 0.1) for i in range(8)]
    specs.append(("Customer Success", 9, 8.5))
    rows = _department_segment_rows(_rows(*specs))
    cs = [r for r in rows if r["department"] == "Customer Success"]
    assert len(cs) == 1 and cs[0]["n"] == 9 and not cs[0]["is_pooled"]


def test_te_kleine_afdelingen_blijven_gebundeld():
    rows = _department_segment_rows(_rows(("Operations", 10, 6.0), ("Sales", 8, 6.5),
                                          ("Finance", 3, 4.0), ("Marketing", 3, 4.0)))
    assert [r["department"] for r in rows if r["is_pooled"]] == ["Overige afdelingen"]
    assert {r["department"] for r in rows if not r["is_pooled"]} == {"Operations", "Sales"}


def test_restgroep_bundelt_alleen_de_te_kleine_afdelingen():
    # Zonder cap komt er niets méér in de restgroep dan wat onder de vijf zit:
    # 3 + 4 = 7, en niet de scores van een gepasseerde grote afdeling.
    rows = _department_segment_rows(
        _rows(*[(f"Afdeling {i}", 6, 5.0 + i * 0.1) for i in range(9)],
              ("Finance", 3, 2.0), ("Marketing", 4, 2.0)))
    pooled = next(r for r in rows if r["is_pooled"])
    assert pooled["n"] == 7
    assert len(rows) == 10


# ─── 3. Startpunt alleen bij een echt verschil (B7) ──────────────────────────

def test_startpunt_alleen_bij_voldoende_verschil_en_omvang():
    # Verschil 2,5, beide n >= 10: wel een startpunt.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 14, 4.5), ("Sales", 12, 7.0))), scan_type="retention")
    assert "Startpunt voor de bespreking" in html
    assert "<strong>Operations</strong> heeft de laagste score (4.5/10" in html


def test_drempel_precies_gehaald_wijst_wel_aan():
    # Exacte grens: 6.0 tegen 6.3 is 0,3 verschil.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 6.0), ("Sales", 12, 6.3))), scan_type="retention")
    assert "<strong>Operations</strong> heeft de laagste score (6.0/10" in html


def test_net_onder_de_drempel_wijst_niet_aan():
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 6.0), ("Sales", 12, 6.2))), scan_type="retention")
    assert "heeft de laagste score" not in html


def test_drempel_telt_op_de_getoonde_score():
    # Ruwe waarden 6.04 en 6.26 liggen 0,22 uit elkaar, maar de tabel toont
    # 6.0 en 6.3: de lezer ziet 0,3 verschil, dus de drempel telt daarop.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 6.04), ("Sales", 12, 6.26))), scan_type="retention")
    assert "Operations</strong> heeft de laagste score (6.0/10" in html


def test_geen_startpunt_bij_een_klein_verschil():
    # Scenario 01: 6.02 tegen 6.10, verschil 0,08 op de getoonde score.
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 13, 6.02), ("Finance", 12, 6.10))), scan_type="retention")
    a = _anchor(html)
    assert "heeft de laagste score" not in html
    assert ("De twee laagste afdelingen liggen dicht bij elkaar "
            "(Sales 6.0/10 en Finance 6.1/10). Loep wijst pas een afdeling aan bij "
            "een verschil van minstens 0,3 punt met de volgende. Geen afdeling vraagt "
            "als eerste aandacht; kijk naar het organisatiebeeld.") in a
    # De omvangdrempel speelde hier niet mee en mag dus niet genoemd worden.
    assert "responses hebben" not in a


def test_geen_startpunt_bij_een_exacte_gelijkspel():
    # Scenario 02 en 19: twee afdelingen exact gelijk. "Dicht bij elkaar" is
    # dan de verkeerde zin: ze zijn gelijk.
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 12, 6.0), ("Finance", 12, 6.0))), scan_type="retention")
    a = _anchor(html)
    assert "heeft de laagste score" not in html
    # Gelijke score: alfabetisch, zelfde tie-break als de tabelsortering.
    assert ("De twee laagste afdelingen komen op dezelfde score uit "
            "(Finance en Sales, beide 6.0/10). Loep wijst pas een afdeling aan bij "
            "een verschil van minstens 0,3 punt met de volgende. Geen afdeling vraagt "
            "als eerste aandacht; kijk naar het organisatiebeeld.") in a


def test_gelijkspel_op_de_getoonde_score_is_ook_gelijkspel():
    # 6.02 en 6.04 tonen beide 6.0: de lezer ziet geen verschil.
    html = _segment_block(_department_segment_rows(
        _rows(("Sales", 12, 6.02), ("Finance", 12, 6.04))), scan_type="retention")
    assert "komen op dezelfde score uit (Sales en Finance, beide 6.0/10)" in _anchor(html)


def test_kleine_tweede_afdeling_blokkeert_de_aanwijzing_niet():
    # Scenario 06 en de resolutie van de tegenspraak tussen spec par. 3.1 en
    # 3.3 (besluit Lars 2026-09-12): de omvangeis geldt voor de AANGEWEZEN
    # afdeling. Operations (n=12) staat 2,5 punt onder Sales (n=6); die zes
    # antwoorden hoeven de conclusie niet te dragen, ze stellen alleen vast
    # dat het verschil er is.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 4.5), ("Sales", 6, 7.0))), scan_type="retention")
    a = _anchor(html)
    assert "<strong>Operations</strong> heeft de laagste score (4.5/10" in html
    assert "dicht bij elkaar" not in a
    # De omvang van de tweede afdeling is geen argument in de copy.
    assert "6 responses" not in a


def test_grote_afdeling_met_klein_verschil_wordt_nog_steeds_niet_aangewezen():
    # De ruisbescherming blijft volledig staan: n is ruim boven de grens, maar
    # het verschil met de volgende is 0,1. Dit is het geval waar B7 over gaat.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 40, 6.0), ("Sales", 38, 6.1))), scan_type="retention")
    a = _anchor(html)
    assert "heeft de laagste score" not in html
    assert "De twee laagste afdelingen liggen dicht bij elkaar" in a
    # De omvanggrens speelde hier niet mee en mag dus niet genoemd worden.
    assert "responses" not in a


def test_kleine_laagste_afdeling_met_groot_verschil_wordt_niet_aangewezen():
    # De andere kant van het besluit: het verschil is 2,5 punt, maar de
    # afdeling die genoemd zou worden heeft er 8. Dan draagt een handvol
    # antwoorden de conclusie, en dat is precies wat de omvangeis tegenhoudt.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 8, 4.5), ("Sales", 20, 7.0))), scan_type="retention")
    a = _anchor(html)
    assert "heeft de laagste score" not in html
    assert "dicht bij elkaar" not in a
    assert ("Operations scoort het laagst (4.5/10), maar heeft 8 responses. Loep "
            "wijst een afdeling pas aan vanaf 10 responses, zodat de conclusie niet "
            "op een handvol antwoorden rust. Kijk voor de eerste prioriteit naar het "
            "organisatiebeeld.") in a


def test_omvangdrempel_precies_gehaald_wijst_wel_aan():
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", MIN_DISTRIBUTION_N, 4.5),
              ("Sales", MIN_DISTRIBUTION_N, 7.0))), scan_type="retention")
    assert "Operations</strong> heeft de laagste score" in html


def test_net_onder_de_omvangdrempel_wijst_niet_aan():
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", MIN_DISTRIBUTION_N - 1, 4.5),
              ("Sales", MIN_DISTRIBUTION_N, 7.0))), scan_type="retention")
    assert "heeft de laagste score" not in html
    assert "maar heeft 9 responses." in _anchor(html)


def test_startpunt_gaat_over_de_twee_laagste_niet_over_de_hele_reeks():
    # 5.0, 5.1 en 8.0: de twee laagste liggen dicht bij elkaar, maar de reeks
    # als geheel niet. De zin mag dus niet over "de afdelingen" gaan.
    html = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 5.0), ("Sales", 12, 5.1),
              ("Customer Success", 12, 8.0))), scan_type="retention")
    a = _anchor(html)
    assert "De twee laagste afdelingen liggen dicht bij elkaar (Operations 5.0/10 en Sales 5.1/10)" in a
    assert "8.0" not in a


def test_zin_noemt_de_werkelijk_laagste_afdeling_ook_bij_ongesorteerde_rijen():
    # _segment_block krijgt in bestaande aanroepen ook ongesorteerde rijen; de
    # zin moet dan nog steeds over de laagste gaan, niet over de eerste rij.
    rows = [
        {"department": "Sales", "n": 12, "avg": 6.5, "scores": [6.5] * 12, "is_pooled": False},
        {"department": "Operations", "n": 12, "avg": 3.9, "scores": [3.9] * 12, "is_pooled": False},
    ]
    a = _anchor(_segment_block(rows, scan_type="retention"))
    assert "Operations" in a.split("heeft de laagste score")[0]
    assert "(3.9/10" in a


# ─── 4. Gepoolde restgroep die lager uitkomt ─────────────────────────────────

_POOLED_ZIN = ('De restgroep &ldquo;Overige afdelingen&rdquo; scoort lager (4.0/10), '
               'maar is samengesteld uit kleine afdelingen en wordt daarom niet als '
               'startpunt genoemd.')


def test_restgroep_wordt_genoemd_als_die_lager_uitkomt():
    # Scenario 01: "Overige afdelingen" onder de aangewezen laagste afdeling.
    rows = _department_segment_rows(
        _rows(("Sales", 13, 5.0), ("Finance", 12, 7.0),
              ("Marketing", 3, 4.0), ("Customer Success", 3, 4.0)))
    html = _segment_block(rows, scan_type="retention")
    assert "Sales</strong> heeft de laagste score (5.0/10" in html
    assert _POOLED_ZIN in html


def test_restgroep_wordt_ook_genoemd_als_er_geen_afdeling_wordt_aangewezen():
    # Scenario 01 in het echt: klein verschil én een lagere restgroep. Zonder
    # deze zin spreekt de tabel ("Overige afdelingen 4.0") de zin erboven tegen.
    rows = _department_segment_rows(
        _rows(("Sales", 13, 6.02), ("Finance", 12, 6.10),
              ("Marketing", 3, 4.0), ("Customer Success", 3, 4.0)))
    html = _segment_block(rows, scan_type="retention")
    assert "dicht bij elkaar" in _anchor(html)
    assert _POOLED_ZIN in html


def test_restgroep_niet_genoemd_als_die_hoger_uitkomt():
    rows = _department_segment_rows(
        _rows(("Sales", 13, 5.0), ("Finance", 12, 7.0),
              ("Marketing", 3, 8.0), ("Customer Success", 3, 8.0)))
    html = _segment_block(rows, scan_type="retention")
    assert "De restgroep" not in html


def test_gepoolde_restgroep_wordt_nooit_zelf_het_startpunt():
    # De restgroep wordt na de sortering toegevoegd, maar kan wel de laagste
    # score van de tabel hebben. Ze mag nooit als startpunt verschijnen.
    rows = _department_segment_rows(
        _rows(("Sales", 13, 5.0), ("Finance", 12, 7.0),
              ("Marketing", 3, 1.5), ("Customer Success", 3, 1.5)))
    a = _anchor(_segment_block(rows, scan_type="retention"))
    kop = a.split("heeft de laagste score")[0]
    assert "Sales" in kop
    assert "Overige afdelingen" not in kop


# ─── 5. Themazin alleen bij een aangewezen afdeling ──────────────────────────

def test_themazin_alleen_als_er_een_afdeling_wordt_genoemd():
    fr = {"Operations": {"factors": [("workload", 3.9, 12)], "omitted": 0},
          "Sales": {"factors": [("culture", 6.4, 12)], "omitted": 0}}
    genoemd = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 4.5), ("Sales", 12, 7.0))),
        factor_rows=fr, scan_type="retention")
    assert ("Het laagst scorende thema daar is werkdruk en herstelruimte (3.9/10)."
            in genoemd)
    niet_genoemd = _segment_block(_department_segment_rows(
        _rows(("Operations", 12, 6.0), ("Sales", 12, 6.1))),
        factor_rows=fr, scan_type="retention")
    assert "Het laagst scorende thema daar is" not in niet_genoemd


# ─── 6. Vorm ─────────────────────────────────────────────────────────────────

def test_geen_em_dashes_in_de_nieuwe_copy():
    for specs in (
        (("Sales", 13, 6.02), ("Finance", 12, 6.10)),        # dicht bij elkaar
        (("Sales", 12, 6.0), ("Finance", 12, 6.0)),          # gelijkspel
        (("Operations", 12, 4.5), ("Sales", 6, 7.0)),        # te klein
        (("Operations", 14, 4.5), ("Sales", 12, 7.0)),       # aangewezen
    ):
        html = _segment_block(_department_segment_rows(_rows(*specs)),
                              scan_type="retention")
        assert "—" not in html
        assert "&mdash;" not in html


def test_elke_rij_blijft_bij_een_paginagrens_heel():
    # De rijlimiet verviel, dus de tabel kan over een pagina lopen. Onder
    # border-collapse werkt break-inside op een <tr> niet in WeasyPrint; de
    # rijen zitten daarom elk in een eigen tbody (patroon van .raster-tbl).
    from backend.report_css import build_css
    html = _segment_block(_department_segment_rows(
        _rows(*[(f"Afdeling {i}", 7, 5.0 + i * 0.1) for i in range(12)])),
        scan_type="retention")
    assert html.count('<tbody class="seg-grp">') == 12
    css = build_css()
    assert ".item-tbl tbody.seg-grp { break-inside: avoid; }" in css


def test_navy_blok_breekt_niet_over_een_pagina():
    from backend.report_css import build_css
    css = build_css()
    anchor_rule = next(line for line in css.splitlines()
                       if line.startswith(".navy-anchor {"))
    assert "break-inside: avoid" in anchor_rule
