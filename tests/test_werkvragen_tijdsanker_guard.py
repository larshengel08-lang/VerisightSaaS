"""Guard (eindreview polijstronde, V11): de Vertrek-werkvragen en de constante
WERKVRAGEN_TIJDSANKER lopen niet uit elkaar.

_werkvraag_tijdsanker vervangt de constante letterlijk door het uitstroomanker
van pagina twee. Wordt een vraag in deepening.py herschreven ("in de periode
waarin deze meting ..." of een andere spelling), dan valt die vervanging stil
weg en staan er in één rapport twee verschillende tijdsankers. Deze test faalt
dan, in plaats van dat het pas in een klant-PDF opvalt.
"""
import re

from backend.products.shared.deepening import WORK_QUESTIONS, WORK_QUESTION_VARIANTS
from backend.report_html import WERKVRAGEN_TIJDSANKER, _uitstroom_bereik, _werkvraag_tijdsanker

KERN = "periode waar deze meting over gaat"


def _exit_teksten() -> list[tuple[str, str]]:
    teksten = []
    for factor, routes in WORK_QUESTIONS.items():
        for route, per_scan in routes.items():
            if "exit" in per_scan:
                teksten.append((f"{factor}.{route}", per_scan["exit"]))
    for kind, per_scan in WORK_QUESTION_VARIANTS.items():
        if "exit" in per_scan:
            teksten.append((f"variant.{kind}", per_scan["exit"]))
    return teksten


def test_constante_bevat_de_kern():
    assert KERN in WERKVRAGEN_TIJDSANKER


def test_elke_vraag_met_het_anker_draagt_precies_de_constante():
    met_anker = [(naam, t) for naam, t in _exit_teksten() if KERN in t]
    # Niet vacuüm: op 11-10 dragen vijftien Vertrek-vragen het anker, na A3
    # (beslisronde 12-10) negenentwintig.
    assert len(met_anker) >= 29
    for naam, tekst in met_anker:
        assert tekst.count(WERKVRAGEN_TIJDSANKER) == 1, naam
        assert tekst.count(KERN) == 1, naam


def test_vervanging_raakt_elke_vraag_met_het_anker():
    for naam, tekst in _exit_teksten():
        if KERN not in tekst:
            continue
        uit = _werkvraag_tijdsanker(tekst, ("oktober 2025", "maart 2026"))
        assert KERN not in uit, naam
        assert "in de uitstroomperiode (tussen oktober 2025 en maart 2026)" in uit, naam


# ── A3 (beslisronde 12-10): extra controles, eis Lars ───────────────────────
# Dezelfde aanroepketen als _werkvragen_block: _uitstroom_bereik over de
# vertrekmaanden, daarna _werkvraag_tijdsanker per vraag.
BEREIK_TWEE_MAANDEN = ["2025-10", "2025-10", "2025-12", "2026-03", "2026-03"]
BEREIK_EEN_MAAND = ["2026-03"] * 5
GEEN_BEREIK = ["2025-10", "2025-12", "2026-03", "2026-03"]  # te weinig maanden

VERDWAALD = (" ?", ",?", ", ?", " ,", " .", "..", "( ", " )", "()", "?.", ".?", ",,")


def _met_anker() -> list[tuple[str, str]]:
    return [(naam, t) for naam, t in _exit_teksten() if KERN in t]


def _laatste_zin(tekst: str) -> str:
    """Alles na het laatste zinseinde vóór het slot-vraagteken."""
    delen = re.split(r"(?<=[.?!])\s+", tekst)
    return delen[-1]


def _controleer_lopende_vraag(naam: str, voor: str, na: str, periode: str):
    assert na.endswith("?"), (naam, na)
    assert na == na.strip(), (naam, na)
    assert periode in na, (naam, na)
    assert "  " not in na, (naam, na)
    for teken in VERDWAALD:
        assert teken not in na, (naam, teken, na)
    # Eén lopende zin: de vervanging voegt geen zinseinde toe of weg, en de
    # periode staat in dezelfde (laatste) zin als het slot-vraagteken.
    assert len(re.findall(r"[.?!]", na)) == len(re.findall(r"[.?!]", voor)), (naam, na)
    assert periode in _laatste_zin(na), (naam, na)
    assert na.count("(") == na.count(")") == voor.count("(") + 1, (naam, na)
    assert "—" not in na and "–" not in na, (naam, na)


def test_a3_negenentwintig_vragen_met_het_anker():
    assert len(_met_anker()) == 29


def test_a3_vervanging_met_twee_maanden_blijft_een_lopende_vraag():
    uitstroom = _uitstroom_bereik(BEREIK_TWEE_MAANDEN)
    assert uitstroom == ("oktober 2025", "maart 2026")
    periode = "in de uitstroomperiode (tussen oktober 2025 en maart 2026)"
    for naam, tekst in _met_anker():
        _controleer_lopende_vraag(naam, tekst, _werkvraag_tijdsanker(tekst, uitstroom), periode)


def test_a3_vervanging_met_een_maand_blijft_een_lopende_vraag():
    uitstroom = _uitstroom_bereik(BEREIK_EEN_MAAND)
    assert uitstroom == ("maart 2026", "maart 2026")
    periode = "in de uitstroomperiode (maart 2026)"
    for naam, tekst in _met_anker():
        na = _werkvraag_tijdsanker(tekst, uitstroom)
        _controleer_lopende_vraag(naam, tekst, na, periode)
        assert "(tussen" not in na, (naam, na)


def test_a3_onbekende_periode_laat_de_terugvaltekst_staan():
    uitstroom = _uitstroom_bereik(GEEN_BEREIK)
    assert uitstroom is None
    for naam, tekst in _met_anker():
        na = _werkvraag_tijdsanker(tekst, uitstroom)
        assert na == tekst, naam
        assert WERKVRAGEN_TIJDSANKER in na and na.endswith("?"), (naam, na)
        assert "uitstroomperiode" not in na, (naam, na)
        assert "  " not in na, (naam, na)
        for teken in VERDWAALD:
            assert teken not in na, (naam, teken, na)
        assert WERKVRAGEN_TIJDSANKER in _laatste_zin(na), (naam, na)
