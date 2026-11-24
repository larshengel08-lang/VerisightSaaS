"""Open toelichtingen: de telling volgt mensen, niet unieke teksten.

Bug (toets AI-bestendigheid, 2026-11-23): de data-builder voegde gelijke teksten
samen (dict.fromkeys), waardoor het kopje "9 medewerkersstemmen" toonde bij 31
antwoorden en niet zichtbaar was dat een toelichting meerdere keren voorkwam.
"""
from backend.report_html import _collect_open_texts, _themed_quotes


def test_collect_behoudt_elk_antwoord():
    raw = ["Meer feedback.", "Meer feedback.", "Betere planning.", "  ", None]
    assert _collect_open_texts(raw) == ["Meer feedback.", "Meer feedback.", "Betere planning."]


def test_gelijke_teksten_een_keer_getoond_met_aantal():
    texts = ["Meer feedback."] * 3 + [f"Tekst {i}." for i in range(4)]
    html = _themed_quotes(texts, "retention")
    assert html.count("Meer feedback.") == 1
    assert "3 keer genoemd" in html
    assert "Tekst 0." in html
    assert "1 keer genoemd" not in html  # enkelvoudige teksten krijgen geen aantal


def test_weglatingsregel_telt_verschillende_teksten_en_mensen():
    texts = ["Dubbel."] * 2 + [f"Toelichting nummer {i}" for i in range(14)]
    html = _themed_quotes(texts, "retention")
    # 15 verschillende teksten van 16 mensen; getoond worden de eerste 12 verschillende.
    assert "eerste 12 van 15 verschillende toelichtingen" in html
    assert "16 antwoorden" in html
    assert "Toelichting nummer 10" in html
    assert "Toelichting nummer 11" not in html
