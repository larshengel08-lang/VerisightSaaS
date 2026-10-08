"""Vervolgronde taak 8 (spec 2026-10-07 par. 4): de werkvragen ("Zo maak je er
een besluit van") kunnen op een andere PDF-pagina landen dan de richtingkaart
("Wat er moet gebeuren"). Tekst die daar met "hierboven" naar verwijst, wijst
dan mogelijk naar niets zichtbaars. Twee plekken citeren de richtingkaart met
"hierboven": de vaste verdeeld-zin in deepening.py en de weegzin in
_richtingen_weging (report_html.py). Beide wijzen nu naar het blok met zijn
eigen naam, ‘Wat er moet gebeuren’, in plaats van met een plaatsaanduiding."""
import pytest

from backend.products.shared.deepening import WORK_QUESTION_VARIANTS, direction_state


def test_verdeeld_zin_verwijst_naar_het_blok():
    for scan, zin in WORK_QUESTION_VARIANTS["divided"].items():
        assert "hierboven" not in zin, (scan, zin)
        assert "bij ‘Wat er moet gebeuren’" in zin, (scan, zin)


def test_geen_werkvraagzin_noemt_nog_hierboven():
    """Guard: geen klantzichtbare tekstconstante in WORK_QUESTION_VARIANTS mag
    nog "boven" bevatten -- de werkvragen staan op een eigen pagina (plan 3b),
    dus elke pagina-aanduiding moet met een naam of paginanummer werken."""
    for per_scan in WORK_QUESTION_VARIANTS.values():
        for zin in per_scan.values():
            assert "boven" not in zin, zin


def _agg(**counts):
    n = sum(counts.values())
    return {"lowest_n": n, "offered": n, "answered": n, "skipped": 0, "counts": counts,
            "other_texts": []}


def test_richtingen_weging_verwijst_naar_het_blok_met_zijn_naam():
    from backend.report_html import _richtingen_weging

    st = direction_state(
        _agg(grd_visibility=3, grd_conversation=2, grd_followthrough=1, grd_none=2),
        "growth", 6.2)
    assert st["state"] == "divided"
    zin = _richtingen_weging(st, "retention", "growth")
    assert "hierboven" not in zin
    assert "op de kaart bij ‘Wat er moet gebeuren’." in zin


def test_drempeltabel_verwijst_niet_meer_met_erboven_of_hierboven():
    """Controllerbevinding: de OTHER_MIN_N-rij van de drempeltabel (de
    methodiekpagina) zei "het aantal staat dan al in de verdeling erboven" --
    op een pagina die losstaat van waar die verdeling echt staat, is "erboven"
    net zo'n loze plaatsaanduiding als "hierboven" elders. Nu "de verdeling
    zelf"."""
    from backend.report_html import _drempeltabel

    for scan_type in ("retention", "exit", "onboarding"):
        html = _drempeltabel(scan_type)
        assert "erboven" not in html, (scan_type, html)
        assert "hierboven" not in html, (scan_type, html)
