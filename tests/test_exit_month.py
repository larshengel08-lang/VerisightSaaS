from datetime import date

import pytest

from backend import exit_month as em


def test_maandlabel():
    assert em.maand_label("2026-03") == "maart 2026"


def test_keuzelijst_nieuwste_eerst_met_venster():
    opties = em.exit_month_options(date(2026, 10, 7))
    assert opties[0] == {"value": "2027-04", "label": "april 2027"}     # 6 vooruit
    assert opties[-1] == {"value": "2024-10", "label": "oktober 2024"}  # 24 terug
    assert len(opties) == em.EXIT_MONTH_FUTURE_MONTHS + em.EXIT_MONTH_PAST_MONTHS + 1
    assert {"value": "2026-10", "label": "oktober 2026"} in opties


def test_keuzelijst_over_de_jaargrens():
    opties = em.exit_month_options(date(2026, 1, 15))
    waarden = [o["value"] for o in opties]
    assert "2025-12" in waarden and "2026-07" in waarden and "2024-01" in waarden


@pytest.mark.parametrize("waarde", ["2026-10", "2024-10", "2027-04", "2024-09", "2027-05"])
def test_validatie_binnen_venster_met_een_maand_speling(waarde):
    assert em.validate_survey_exit_month(waarde, date(2026, 10, 7)) == waarde


@pytest.mark.parametrize("waarde", ["2024-08", "2027-06", "2026-13", "2026-00", "2026-1",
                                    "liever_niet", "", "2026/10", 202610, None])
def test_validatie_weigert(waarde):
    with pytest.raises(ValueError):
        em.validate_survey_exit_month(waarde, date(2026, 10, 7))


def test_normalisatie_import_is_streng():
    from backend.main import _normalize_exit_month
    assert _normalize_exit_month("2026/03") == "2026-03"
    assert _normalize_exit_month("2026-13") is None
    assert _normalize_exit_month("2026-00") is None
    assert _normalize_exit_month(date(2026, 3, 1)) == "2026-03"


def test_rapport_gebruikt_dezelfde_bron():
    from backend import report_html
    assert report_html._MAANDEN_NL is em.MAANDEN_NL
    assert report_html._EXIT_MONTH_RE is em.EXIT_MONTH_RE
