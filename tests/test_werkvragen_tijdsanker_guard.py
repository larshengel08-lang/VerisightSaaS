"""Guard (eindreview polijstronde, V11): de Vertrek-werkvragen en de constante
WERKVRAGEN_TIJDSANKER lopen niet uit elkaar.

_werkvraag_tijdsanker vervangt de constante letterlijk door het uitstroomanker
van pagina twee. Wordt een vraag in deepening.py herschreven ("in de periode
waarin deze meting ..." of een andere spelling), dan valt die vervanging stil
weg en staan er in één rapport twee verschillende tijdsankers. Deze test faalt
dan, in plaats van dat het pas in een klant-PDF opvalt.
"""
from backend.products.shared.deepening import WORK_QUESTIONS, WORK_QUESTION_VARIANTS
from backend.report_html import WERKVRAGEN_TIJDSANKER, _werkvraag_tijdsanker

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
    # Niet vacuüm: op 11-10 dragen vijftien Vertrek-vragen het anker.
    assert len(met_anker) >= 15
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
