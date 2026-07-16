"""Rendering van het toelichtingsblok + agenda-verrijking in het HTML-rapport (spec 6.1-6.3)."""
from backend.report_html import _deepening_block, _deepening_campaign_active, _deepening_mgmt_q


def _agg(triggered=14, offered=13, answered=12, skipped=1, primary=None, secondary=None):
    return {"triggered": triggered, "offered": offered, "answered": answered,
            "skipped": skipped, "primary_counts": primary or {}, "secondary_counts": secondary or {}}


def test_block_empty_when_no_triggers():
    assert _deepening_block(_agg(0, 0, 0, 0), "retention", "workload") == ""


def test_block_hidden_below_5():
    html = _deepening_block(_agg(8, 6, 4, 2, {"wl_recovery": 4}), "retention", "workload")
    assert "Te weinig verdiepingsantwoorden" in html
    assert "%" not in html
    assert "wl_recovery" not in html  # no distribution rendered at all


def test_chain_sentence_always_present():
    html = _deepening_block(_agg(8, 6, 4, 2, {"wl_recovery": 4}), "retention", "workload")
    assert "Van de 8 respondenten" in html and "kregen 6" in html and "4 beantwoordden" in html


def test_block_counts_only_5_to_9():
    html = _deepening_block(_agg(10, 9, 7, 2, {"wl_recovery": 4, "wl_volume": 3}), "retention", "workload")
    assert "Beperkte antwoordbasis" in html and "gesprekshaakje" in html
    assert "%" not in html
    assert "Welke toelichting respondenten kozen" in html
    assert "4" in html  # counts shown


def test_block_percentages_from_10():
    html = _deepening_block(_agg(14, 13, 12, 1, {"wl_recovery": 8, "wl_volume": 4}), "retention", "workload")
    assert "67%" in html and "(8)" in html and "33%" in html and "(4)" in html


def test_option_texts_rendered_not_keys():
    html = _deepening_block(_agg(14, 13, 12, 1, {"wl_recovery": 8, "wl_volume": 4}), "retention", "workload")
    assert "herstellen" in html  # wl_recovery text fragment
    assert "wl_recovery" not in html


def test_geen_secondary_samenvattingsregel():
    # "Daarnaast werden vooral X en Y genoemd" is verwijderd (feedback
    # 2026-07-16): de regel dupliceerde de tabel met aantallen erboven.
    # Guard: de regel mag ook bij voldoende secondary-antwoorden niet terugkomen.
    below = _deepening_block(_agg(14, 13, 12, 1, {"wl_recovery": 8}, {"wl_volume": 4}), "retention", "workload")
    assert "Daarnaast" not in below
    at5 = _deepening_block(_agg(14, 13, 12, 1, {"wl_recovery": 8}, {"wl_volume": 3, "wl_process": 2}), "retention", "workload")
    assert "Daarnaast" not in at5


def test_no_forbidden_report_words():
    html = _deepening_block(_agg(14, 13, 12, 1, {"wl_recovery": 8}), "retention", "workload").lower()
    for w in ["betrouwbaar", "aanwijz", "laag gescoord", "oorzaak"]:
        assert w not in html


def test_unknown_option_key_rendered_raw_not_crash():
    html = _deepening_block(_agg(14, 13, 12, 1, {"wl_legacy_key": 8, "wl_volume": 4}), "retention", "workload")
    assert "wl_legacy_key" in html  # historical data: honest raw key i.p.v. crash


# ── agenda-verrijking (spec 6.3) ─────────────────────────────────────────────

def test_mgmt_q_enriched_when_gates_pass():
    agg = _agg(18, 15, 12, 3, {"wl_recovery": 8, "wl_volume": 2})
    q = _deepening_mgmt_q({"workload": agg}, "retention", "workload")
    assert q is not None
    assert "Van de 18 respondenten" in q and "beantwoordden 12" in q and "8 kozen" in q
    assert "Gespreksvraag:" in q
    assert "herstel" in q.lower()


def test_mgmt_q_none_when_gates_fail():
    agg = _agg(18, 15, 7, 3, {"wl_recovery": 5})  # n=7 < 8
    assert _deepening_mgmt_q({"workload": agg}, "retention", "workload") is None


def test_mgmt_q_none_and_warning_when_other_is_top(caplog):
    import logging
    agg = _agg(18, 15, 12, 3, {"wl_other": 8, "wl_volume": 2})
    with caplog.at_level(logging.WARNING):
        assert _deepening_mgmt_q({"workload": agg}, "retention", "workload") is None
    assert any("optieset review" in r.message for r in caplog.records)


def test_mgmt_q_none_for_missing_factor():
    assert _deepening_mgmt_q({}, "retention", "workload") is None


# ── campagne-niveau gate (historische pre-feature campagnes) ─────────────────

def test_campaign_gate_inactive_when_nothing_offered():
    # Historische campagne: triggers uit org-scores maar nergens een verdieping
    # aangeboden -> gate dicht, rapport blijft ongewijzigd.
    agg = {"workload": _agg(5, 0, 0, 0), "growth": _agg(0, 0, 0, 0)}
    assert _deepening_campaign_active(agg) is False


def test_campaign_gate_active_block_renders_for_capped_factor():
    # Feature-actieve campagne (offered>0 op growth): workload-blok met
    # triggered>0/offered=0 (cap-verdrongen) rendert wel — volledige keten.
    agg = {"workload": _agg(5, 0, 0, 0), "growth": _agg(6, 6, 6, 0, {"gr_time": 6})}
    assert _deepening_campaign_active(agg) is True
    html = _deepening_block(agg["workload"], "retention", "workload")
    assert "Van de 5 respondenten" in html and "kregen 0" in html
