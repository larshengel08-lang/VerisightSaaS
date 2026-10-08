from backend.exit_month import MAANDEN_NL
from backend.report_html import UITSTROOM_RAND_MIN, UITSTROOM_RAND_TE_KLEIN, _uitstroomperiode


def test_randen_van_twee_tonen_periode():
    maanden = ["2026-01", "2026-01", "2026-02", "2026-03", "2026-03"]
    regel, ontbreekt = _uitstroomperiode(maanden, 5)
    assert regel == "Uitstroomperiode: vertrek tussen januari 2026 en maart 2026."
    assert ontbreekt is None


def test_vroegste_maand_van_een_persoon_laat_periode_weg():
    maanden = ["2025-11", "2026-01", "2026-01", "2026-03", "2026-03", "2026-03"]
    regel, ontbreekt = _uitstroomperiode(maanden, 8)
    assert regel is None
    assert ontbreekt == UITSTROOM_RAND_TE_KLEIN


def test_laatste_maand_van_een_persoon_laat_periode_weg():
    maanden = ["2026-01"] * 4 + ["2026-04"]
    assert _uitstroomperiode(maanden, 5) == (None, UITSTROOM_RAND_TE_KLEIN)


def test_reden_noemt_geen_aantallen_of_maanden():
    assert not any(ch.isdigit() for ch in UITSTROOM_RAND_TE_KLEIN)
    for maand in MAANDEN_NL:
        assert maand not in UITSTROOM_RAND_TE_KLEIN
    assert "\u2013" not in UITSTROOM_RAND_TE_KLEIN and "\u2014" not in UITSTROOM_RAND_TE_KLEIN


def test_een_maand_voor_iedereen():
    assert _uitstroomperiode(["2026-02"] * 5, 7)[0] == (
        "Uitstroomperiode: vertrek in februari 2026 (bij 5 van de 7 vastgelegd).")


def test_grens_van_vijf_blijft_eerst():
    regel, ontbreekt = _uitstroomperiode(["2026-01", "2026-01", "2026-02", "2026-02"], 9)
    assert regel is None and "bij 4 van de 9 vastgelegd" in ontbreekt


def test_randminimum_is_twee():
    assert UITSTROOM_RAND_MIN == 2
