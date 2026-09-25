"""Guard op de gated content van plan 3b: de 72 vertaalvragen en de verdeeld-zinnen.

Bron: docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md, goedgekeurd
door Lars (versie 2, inclusief het amendement in sectie 7). Deze tests bewaken
de vorm, niet de inhoud: volledigheid tegenover DIRECTION_SETS, geen
streepjes, Vertrek in de tegenwoordige tijd met een terugblik-toets, geen
dubbele vragen. Dat vijf routeparen inhoudelijk overlappen (o.a.
ldd_mandate/rcd_mandate) is een eigenschap van de routesets en wordt hier
bewust niet getest.
"""
import re

from backend.products.shared.deepening import (
    DIRECTION_SETS,
    WERKVRAGEN_AANSTURING_HINT,
    WORK_QUESTION_VARIANTS,
    WORK_QUESTIONS,
    work_question,
    work_questions_ready,
)
from backend.report_html import _FACTOR_EXIT_LABEL, _FACTOR_RETENTION_LABEL

SCANS = ("retention", "exit")

# Amendement plan 3b Taak 13 (concept-sectie 7 punt 2): elke Vertrek-vraag
# bevat een terugblik in een van deze vormen. Amendement 24-9 (A1, fixronde
# leesronde, formulering Lars 25-9): "toen de vertrekkers er nog werkten" is
# vervangen door "in de periode waar deze meting over gaat"; de oude vorm is
# geen toegestane terugblik meer (zie test_vertrek_heeft_geen_oud_tijdsanker_meer).
TERUGBLIK_VORMEN = (
    "in de periode waar deze meting over gaat", "een jaar geleden", "het afgelopen jaar",
    "sindsdien", "voor het laatst", "de laatste wijziging", "het vorige",
)


def _routes(factor_key: str) -> set[str]:
    return {o["key"] for o in DIRECTION_SETS[factor_key]["options"] if o["imperative"]}


def _alle_vragen() -> list[tuple[str, str, str, str]]:
    return [(fk, rk, scan, tekst)
            for fk, routes in WORK_QUESTIONS.items()
            for rk, per_scan in routes.items()
            for scan, tekst in per_scan.items()]


def test_de_set_is_gevuld():
    """Een lege set betekent: het rapport toont geen enkele vertaalvraag. Dat is
    alleen voor de reviewgate toegestaan."""
    assert work_questions_ready()
    assert len(_alle_vragen()) == 72


def test_elke_inhoudelijke_route_heeft_precies_een_vraag_per_scan_en_omgekeerd():
    assert set(WORK_QUESTIONS) == set(DIRECTION_SETS)
    for fk in DIRECTION_SETS:
        assert set(WORK_QUESTIONS[fk]) == _routes(fk), fk
        assert len(_routes(fk)) == 6, fk
        for rk, per_scan in WORK_QUESTIONS[fk].items():
            assert set(per_scan) == set(SCANS), (fk, rk)


def test_niets_en_anders_hebben_geen_vraag():
    for fk, routes in WORK_QUESTIONS.items():
        for rk in routes:
            assert not rk.endswith(("_none", "_other")), (fk, rk)


def test_elke_vraag_is_een_vraag_zonder_streepjes_en_zonder_reviewresten():
    for fk, rk, scan, tekst in _alle_vragen():
        waar = (fk, rk, scan)
        assert tekst == tekst.strip() and tekst.endswith("?"), waar
        assert "—" not in tekst and "–" not in tekst, waar
        assert "akkoord" not in tekst.lower(), waar
        assert "  " not in tekst and "|" not in tekst, waar


def test_vertrek_staat_niet_in_de_tegenwoordige_tijd_vorm():
    for fk, rk, scan, tekst in _alle_vragen():
        if scan == "exit":
            assert "Wat is bij jullie" not in tekst, (fk, rk)


def test_vertrek_bevat_altijd_een_terugblik():
    """Amendement plan 3b Taak 13: Vertrek-vragen staan in de tegenwoordige
    tijd (Lars, review 21-9), maar elke vraag toetst dat aan het verleden."""
    for fk, rk, scan, tekst in _alle_vragen():
        if scan != "exit":
            continue
        laag = tekst.lower()
        assert any(vorm in laag for vorm in TERUGBLIK_VORMEN), (fk, rk, tekst)


def test_geen_twee_vragen_zijn_identiek():
    teksten = [t for _fk, _rk, _scan, t in _alle_vragen()]
    dubbel = sorted({t for t in teksten if teksten.count(t) > 1})
    assert dubbel == []


def test_vragen_noemen_het_onderwerp_niet_bij_naam():
    """Spec, respondentvraag en rapportlabels gebruiken drie verschillende namen;
    het blok eromheen levert de naam via _fl."""
    labels = {l.lower() for l in list(_FACTOR_EXIT_LABEL.values()) + list(_FACTOR_RETENTION_LABEL.values())}
    for fk, rk, scan, tekst in _alle_vragen():
        for label in labels:
            assert label not in tekst.lower(), (fk, rk, scan, label)


def test_vragen_spreken_het_mt_aan_en_niet_loep():
    for fk, rk, scan, tekst in _alle_vragen():
        assert not re.search(r"\b(ik|wij|loep)\b", tekst.lower()), (fk, rk, scan)


def test_verdeeld_zinnen_zijn_vaste_teksten_zonder_citaat():
    """Amendement plan 3b Taak 13 (concept-sectie 7 punt 1): de vier zinnen zijn
    vast, zonder plaatshouders {a}/{b} en zonder de routeteksten te citeren."""
    assert set(WORK_QUESTION_VARIANTS) == {"divided", "split_none"}
    for soort, per_scan in WORK_QUESTION_VARIANTS.items():
        assert set(per_scan) == set(SCANS), soort
        for scan, tekst in per_scan.items():
            waar = (soort, scan)
            assert tekst.endswith("?"), waar
            assert "—" not in tekst and "–" not in tekst, waar
            assert "{" not in tekst and "}" not in tekst, waar
    # Vertrek: de mensen zijn weg, dus niet "zijn verdeeld".
    assert "zijn verdeeld" not in WORK_QUESTION_VARIANTS["divided"]["exit"]
    assert "zijn verdeeld" not in WORK_QUESTION_VARIANTS["split_none"]["exit"]


def test_ophaalfunctie_levert_voor_elke_route_en_scan_de_juiste_tekst():
    for fk in DIRECTION_SETS:
        for rk in _routes(fk):
            for scan in SCANS:
                assert work_question(scan, fk, rk) == WORK_QUESTIONS[fk][rk][scan]


def test_aansturing_hint_is_een_vaste_niet_lege_regel():
    """Amendement plan 3b Taak 13 (concept-sectie 6 punt 4): de constante zelf,
    los van waar _werkvragen_block hem rendert (zie tests/test_report_werkvragen.py)."""
    assert WERKVRAGEN_AANSTURING_HINT.strip() == WERKVRAGEN_AANSTURING_HINT
    assert WERKVRAGEN_AANSTURING_HINT.endswith(".")
    assert "—" not in WERKVRAGEN_AANSTURING_HINT and "–" not in WERKVRAGEN_AANSTURING_HINT
    assert "leidinggevenden" in WERKVRAGEN_AANSTURING_HINT.lower()


# ── Amendement 24-9 (A1): tijdsanker Vertrek vervangen ──────────────────────
# Leesronde V1: "toen de vertrekkers er nog werkten" stuurt het MT naar de
# personen die vertrokken. Veertien Vertrek-vragen kregen een ander slot; de
# rest van elke vraag en alle Behoud-vragen bleven letterlijk gelijk.

import hashlib  # noqa: E402
import json  # noqa: E402

OUD_TIJDSANKER = "toen de vertrekkers er nog werkten"
# Tussenformulering van 24-9, op 25-9 door Lars vervangen: noemde nog de
# mensen die vertrokken. Mag ook niet meer voorkomen.
TUSSENVORM_TIJDSANKER = "deze mensen vertrokken"
NIEUW_TIJDSANKER = "in de periode waar deze meting over gaat"
A1_SLOTEN = {
    "ldd_feedback": "En in de periode waar deze meting over gaat?",
    "ldd_escalation": "En in de periode waar deze meting over gaat?",
    "ldd_availability": "En in de periode waar deze meting over gaat?",
    "cud_safety": "En in de periode waar deze meting over gaat?",
    "cud_conflict": "En in de periode waar deze meting over gaat?",
    "cud_crossteam": "En in de periode waar deze meting over gaat?",
    "wld_scope": "En in de periode waar deze meting over gaat?",
    "wld_recovery": "En in de periode waar deze meting over gaat?",
    "rcd_alignment": "En in de periode waar deze meting over gaat?",
    "rcd_information": "En in de periode waar deze meting over gaat?",
    "grd_criteria": "Stond dat er al in de periode waar deze meting over gaat?",
    "wld_peaks": "Wie mocht dat zeggen in de periode waar deze meting over gaat?",
    "wld_friction": "Wat ervan bestond al in de periode waar deze meting over gaat?",
    "rcd_expectations": "Stonden ze er al in de periode waar deze meting over gaat?",
}
# sha256 over json.dumps({"<factor>.<route>": tekst}, sort_keys=True,
# ensure_ascii=False). RETENTION: de Behoud-teksten op main 37059706 (vóór de
# fixronde). EXIT: de Vertrek-teksten van 37059706 met precies de veertien
# vervangingen uit A1_SLOTEN toegepast, en verder niets.
RETENTION_SHA_MAIN = "9bec2159e84a2ec73cb6c10b230e169fac17ddc69bc07880eeadb8e11534a341"
EXIT_SHA_NA_A1 = "a7784fa1da84f3a8b4fab1b78439024301953eced319d6f8e21835c8201c0749"


def _sha(scan: str) -> str:
    teksten = {f"{fk}.{rk}": per_scan[scan]
               for fk, routes in WORK_QUESTIONS.items() for rk, per_scan in routes.items()}
    return hashlib.sha256(json.dumps(teksten, sort_keys=True, ensure_ascii=False)
                          .encode("utf-8")).hexdigest()


def test_vertrek_heeft_geen_oud_tijdsanker_meer():
    for fk, rk, scan, tekst in _alle_vragen():
        if scan == "exit":
            assert OUD_TIJDSANKER not in tekst.lower(), (fk, rk, tekst)
            assert TUSSENVORM_TIJDSANKER not in tekst.lower(), (fk, rk, tekst)


def test_precies_de_veertien_vragen_dragen_het_nieuwe_tijdsanker():
    met_anker = {rk for _fk, rk, scan, tekst in _alle_vragen()
                 if scan == "exit" and NIEUW_TIJDSANKER in tekst}
    assert met_anker == set(A1_SLOTEN)
    for fk, rk, scan, tekst in _alle_vragen():
        if scan == "exit" and rk in A1_SLOTEN:
            assert tekst.endswith(" " + A1_SLOTEN[rk]), (fk, rk, tekst)
            assert tekst.count(NIEUW_TIJDSANKER) == 1, (fk, rk, tekst)


def test_behoud_teksten_zijn_byte_identiek_aan_main():
    assert _sha("retention") == RETENTION_SHA_MAIN


def test_vertrek_teksten_veranderden_alleen_in_het_tijdsanker():
    assert _sha("exit") == EXIT_SHA_NA_A1
