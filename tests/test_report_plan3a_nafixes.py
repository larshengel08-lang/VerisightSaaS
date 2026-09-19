"""Nafixes op plan 3a: drie plekken waar een klant-PDF iets onwaars zei.

Gevonden bij het herlezen van de stresstest-scenario's en de voorbeeldrapporten
(docs/rapport-stresstest-2026-09-10.md, sectie "Na plan 3a", observaties 1, 3
en 4):

1. De samenvattingszin van het overzichtsprofiel noemde bij een gedeelde laagste
   score één onderwerp, terwijl pagina twee ze allemaal noemt, en zei "kritisch"
   waar de rest van het rapport "kwetsbaar" zegt.
2. Loep Vertrek telde "als vertrekreden genoemd" alleen als hoofdreden, naast een
   pagina die ook de meespelende redenen toont. Het label zegt nu wat er geteld
   wordt, en elke telling staat terug te vinden in de vertrekcontext.
3. Loep Start noemde een onderwerp dat de laagste score deelt de "tweede laagste".
"""

import re
from html import unescape

from backend.report_html import (
    _overzicht_summary_and_bands,
    _vertrekcontext,
    _vertrekreden_delen,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _fixture


def _tekst(html: str) -> str:
    body = html.split("</style>")[-1]
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", body)))


def _met_scores(scan_type: str, fa: dict, *, n: int = 20) -> dict:
    d = _fixture(scan_type, n=n, profile=True)
    d["factor_avgs"] = dict(fa)
    d["factor_resp_scores"] = {fk: [sc] * n for fk, sc in fa.items()}
    low = min(fa, key=fa.get)
    d["top_risks"] = [(low, fa[low])]
    return d


# ── 1. overzichtsprofiel: gedeelde laagste score + bandwoord ────────────────

def test_samenvatting_noemt_alle_onderwerpen_op_de_gedeelde_laagste_score():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 6.21), ("B", 6.18), ("C", 6.24), ("D", 6.6)],
        laagste=["B", "A", "C"])
    assert summary == ("Geen onderwerp scoort kwetsbaar. Drie onderwerpen delen "
                       "de laagste score (6.2/10): B, A, C.")


def test_samenvatting_zonder_gelijkstand_noemt_een_onderwerp():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 6.0), ("B", 6.4)], laagste=["A"])
    assert summary == "Geen onderwerp scoort kwetsbaar. A scoort het laagst."


def test_samenvatting_kwetsbaar_gelijkstand_heet_niet_duidelijkste():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 4.5), ("B", 4.52), ("C", 7.0)], laagste=["A", "B"])
    assert "duidelijkste" not in summary and "enige" not in summary
    assert summary.startswith("Twee kwetsbare onderwerpen delen de laagste "
                              "score (4.5/10): A, B.")
    assert "C vormt een relatief sterke basis." in summary


def test_samenvatting_alles_gelijk():
    summary, _ = _overzicht_summary_and_bands(
        [("A", 6.2), ("B", 6.2), ("C", 6.2)], laagste=["A", "B", "C"])
    assert summary == "Geen onderwerp scoort kwetsbaar. Alle drie onderwerpen scoren 6.2/10."


def test_samenvatting_zegt_nooit_kritisch():
    for fa in ([("A", 6.0), ("B", 6.4)], [("A", 4.0), ("B", 7.0)],
               [("A", 4.0)], [("A", 7.0)]):
        summary, _ = _overzicht_summary_and_bands(fa, laagste=[fa[0][0]])
        assert "kritisch" not in summary


_GELIJK = {"growth": 6.21, "culture": 6.18, "compensation": 6.24,
           "workload": 6.4, "leadership": 7.0, "role_clarity": 7.3}


def test_overzichtsprofiel_en_pagina_twee_noemen_dezelfde_gelijkstand():
    for st, render in (("retention", render_retention_report_html),
                       ("exit", render_exit_report_html),
                       ("onboarding", render_onboarding_report_html)):
        t = _tekst(render(_met_scores(st, _GELIJK)))
        assert t.count("Drie onderwerpen delen de laagste score (6.2/10)") >= 2, st
        assert "De laagste score zit bij" not in t, st
        assert "scoort kritisch" not in t, st


# ── 2. Loep Vertrek: hoofdreden, niet "vertrekreden" ────────────────────────

def test_kernzin_en_cel_zeggen_hoofdreden():
    enkel = _vertrekreden_delen([{"code": "P3", "label": "Gebrek aan groei", "count": 14}], 35)
    assert enkel["zin"] == "Gebrek aan groei is de meest genoemde hoofdreden van vertrek (14 van de 35)."
    assert "hoofdreden" in enkel["cel"]
    gelijk = _vertrekreden_delen([{"code": "P3", "label": "A", "count": 4},
                                  {"code": "P1", "label": "B", "count": 4}], 12)
    assert "even vaak als hoofdreden genoemd" in gelijk["zin"]
    assert "hoofdreden" in gelijk["cel"]


def test_vertrekcontext_toont_elke_getelde_hoofdreden():
    """De ranglijstkolom telt uit exit_r_dist (top 5); de tabel moet die
    telling dus allemaal tonen, niet alleen de top 3."""
    reasons = [("Gebrek aan groei", 14), ("Persoonlijke omstandigheid", 6),
               ("Leiderschap / management", 6), ("Werkdruk / stress", 5),
               ("Beloning", 2)]
    html = _vertrekcontext(exit_reasons=reasons, contributing=[("Beloning", 18)],
                           n=35, primary_factor_label="Groeiperspectief")
    t = _tekst(html)
    assert "Werkdruk / stress 5×" in t
    assert "Beloning 2×" in t
    assert "(top 3)" not in t


def test_vertrekcontext_toont_elke_getelde_meespelende_reden():
    """De why-cel "Speelt ook mee" op pagina twee telt uit cont_dist (top 5),
    dus die telling moet in de vertrekcontext terug te vinden zijn."""
    cont = [("Leiderschap / management", 19), ("Beloning", 18),
            ("Rolonduidelijkheid", 11), ("Gebrek aan groei", 10)]
    t = _tekst(_vertrekcontext(exit_reasons=[("Gebrek aan groei", 14)],
                               contributing=cont, n=35,
                               primary_factor_label="Groeiperspectief"))
    assert "Gebrek aan groei 10×" in t.split("Speelde ook mee")[1]


def test_exitrapport_zegt_nergens_als_vertrekreden_genoemd():
    d = _met_scores("exit", {"growth": 4.1, "leadership": 5.7, "workload": 6.0,
                             "role_clarity": 7.0, "culture": 6.5, "compensation": 6.8})
    d["exit_r_dist"] = [
        {"code": "P3", "label": "Gebrek aan groei", "count": 14},
        {"code": "S1", "label": "Persoonlijke omstandigheid", "count": 6},
        {"code": "P1", "label": "Leiderschap / management", "count": 6},
        {"code": "P5", "label": "Werkdruk / stress", "count": 5}]
    d["exit_r_counts"] = {r["code"]: r["count"] for r in d["exit_r_dist"]}
    d["exit_r_top"] = d["exit_r_dist"][:1]
    d["exit_r_given"] = 31
    d["cont_dist"] = [{"code": "P1", "label": "Leiderschap / management", "count": 19},
                      {"code": "P4", "label": "Beloning", "count": 18}]
    t = _tekst(render_exit_report_html(d))
    assert "Als vertrekreden genoemd" not in t
    assert "als vertrekreden is genoemd" not in t
    assert "genoemd als vertrekreden" not in t
    assert "meest genoemde vertrekreden" not in t
    assert "Als hoofdreden genoemd" in t
    assert "Werkdruk / stress 5×" in t


# ── 3. Loep Start: gedeelde laagste is niet "tweede laagste" ────────────────

def test_onboarding_tweede_punt_op_gedeelde_laagste_score():
    fa = {"growth": 5.31, "role_clarity": 5.28, "culture": 6.0,
          "workload": 6.4, "leadership": 7.0, "compensation": 7.3}
    t = _tekst(render_onboarding_report_html(_met_scores("onboarding", fa)))
    assert "Tweede laagste score in het overzichtsprofiel" not in t
    assert "Deelt de laagste score (5.3/10) met" in t


def test_onboarding_tweede_punt_zonder_gelijkstand_blijft_tweede_laagste():
    fa = {"growth": 5.0, "role_clarity": 5.6, "culture": 6.0,
          "workload": 6.4, "leadership": 7.0, "compensation": 7.3}
    t = _tekst(render_onboarding_report_html(_met_scores("onboarding", fa)))
    assert "Tweede laagste score in het overzichtsprofiel." in t
