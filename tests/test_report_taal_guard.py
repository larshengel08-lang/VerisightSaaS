"""Taal en typografie van het klantrapport (spec par. 9 C2/C3/C6, par. 10 H15;
taak 13 vult de source-guard aan)."""
import re

from backend.report_html import (
    VERSPREIDINGSREGEL,
    _cover,
    _overzichtsprofiel,
    _themed_quotes,
    _trust_page,
    _verspreidingsregel,
)
from backend.scan_definitions import get_scan_definition


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_anonimiseringslabel_staat_een_keer_boven_de_quotes():
    html = _themed_quotes([f"Tekst {i}." for i in range(6)], "retention")
    assert html.count("Automatisch geanonimiseerd") == 1
    assert html.index("Automatisch geanonimiseerd") < html.index("Tekst 0.")


def test_overzichtsprofiel_zonder_bandlijst():
    html = _overzichtsprofiel([("Groeiperspectief", 4.2), ("Leiderschap", 7.0)],
                              summary="S.", scan_type="retention")
    assert "kwetsbaar punt (1)" not in html and "relatief sterk (1)" not in html
    assert "fbar-row" in html   # de balken blijven


def test_stellingteksten_zonder_los_streepje_en_met_trema():
    for st in ("exit", "retention"):
        teksten = [t for _k, t in get_scan_definition(st)["sdt_items"]]
        assert not any(" - " in t for t in teksten), st
        assert not any("geinteresseerd" in t for t in teksten), st
        assert any("geïnteresseerd" in t for t in teksten), st


def test_verspreidingsregel_op_cover_en_slotpagina():
    assert _verspreidingsregel("TechBouw B.V.") == (
        "Voor het MT en HR van TechBouw B.V. Deel dit rapport niet met individuele medewerkers; "
        "de toelichtingen zijn geanonimiseerd maar herkenbaar in kleine teams.")
    assert _verspreidingsregel("") == VERSPREIDINGSREGEL.format(org="de organisatie")
    cover = _cover(scan_label="Loep Behoud", scan_type="retention", org_name="TechBouw B.V.",
                   period="W", opening_question="Q?", stats=[("a", "1")])
    assert "Deel dit rapport niet met individuele medewerkers" in _tekst(cover)
    slot = _trust_page("retention", org_name="TechBouw B.V.")
    assert "Voor het MT en HR van TechBouw B.V." in _tekst(slot)
    assert "Uitsluitend bestemd voor geautoriseerde gebruikers" not in slot
