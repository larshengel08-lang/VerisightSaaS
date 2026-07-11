"""Spreidingsaggregatie (spec: docs/superpowers/specs/2026-07-11-rapport-spreiding-design.md)."""
from backend.report_distribution import score_distribution, distribution_block, distribution_svg


def test_zones_volgen_factor_label_drempels():
    # 4.99 = laag (kwetsbaar), 5.0 = midden (aandacht), 6.5 = hoog (sterk)
    d = score_distribution([4.99, 5.0, 6.49, 6.5])
    assert d["zones"] == (1, 2, 1)


def test_polarisatie_beide_buitenzones_25pct_en_samen_60pct():
    # 4 laag + 4 hoog + 2 midden van 10: 40%/40%, samen 80% -> gepolariseerd
    vals = [2.0] * 4 + [8.0] * 4 + [5.5] * 2
    assert score_distribution(vals)["polarized"] is True


def test_geen_polarisatie_bij_eenzijdig_beeld():
    # 8 laag + 2 hoog: hoog < 25% -> niet gepolariseerd
    vals = [2.0] * 8 + [8.0] * 2
    assert score_distribution(vals)["polarized"] is False


def test_geen_polarisatie_bij_breed_midden():
    # buitenzones samen 40% < 60% -> niet gepolariseerd
    vals = [2.0] * 2 + [8.0] * 2 + [5.5] * 6
    assert score_distribution(vals)["polarized"] is False


def test_lege_input():
    d = score_distribution([])
    assert d["zones"] == (0, 0, 0)
    assert d["polarized"] is False
    assert d["mean"] is None


def test_mean_en_dots():
    d = score_distribution([2.0, 8.0])
    assert d["mean"] == 5.0
    assert d["dots"] == [2.0, 8.0]


def test_block_leeg_onder_n10():
    assert distribution_block([5.0] * 9) == ""


def test_block_bevat_svg_en_aantallen_vanaf_n10():
    html = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "<svg" in html
    assert "Kwetsbaar 5" in html
    assert "Sterk 5" in html
    assert "GEM 5.0" in html


def test_duidingszin_alleen_bij_polarisatie():
    gepolariseerd = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "Verdeeld beeld" in gepolariseerd
    normaal = distribution_block([5.5] * 10)
    assert "Verdeeld beeld" not in normaal


def test_jitter_deterministisch():
    # Zelfde input -> byte-identieke output (geen random; WeasyPrint-stabiel).
    vals = [2.0, 3.0, 5.5, 7.0, 8.0] * 2
    assert distribution_block(vals) == distribution_block(vals)


def test_distribution_svg_kleine_hoogte_geen_crash():
    # height=15 -> band_h - 8 <= 0; moet niet crashen (zero-guard).
    svg = distribution_svg([5.0] * 10, height=15)
    assert "<svg" in svg


from backend.report_html import _per_respondent_factor_scores


def test_per_respondent_factor_scores():
    factor_items_map = {"workload": [("W1", "vraag 1"), ("W2", "vraag 2")]}
    org_raws = [
        {"W1": 1, "W2": 2},   # gem raw 1.5 -> _scale_to_10 -> 2.12 (Python banker's rounding op 2.125)
        {"W1": 5, "W2": 5},   # gem raw 5.0 -> 10.0
        {"W1": 3},            # gem raw 3.0 -> 5.5 (ontbrekend item overslaan)
        {},                   # geen data -> geen bijdrage
    ]
    out = _per_respondent_factor_scores(factor_items_map, org_raws)
    assert [round(v, 2) for v in out["workload"]] == [2.12, 10.0, 5.5]


# ── Task 4: wiring van distribution_block in de renderers ──────────────────

from backend.report_html import render_retention_report_html


def _min_retention_data(factor_resp_scores=None, intent_resp=None, n=12):
    """Minimale data-dict voor de retention-renderer.

    Alle keys die render_retention_report_html() aanspreekt (via data[...] of
    data.get(...)) zijn hier aanwezig — zie backend/report_html.py rond regel
    1656 voor de volledige lijst.
    """
    fa = {"workload": 5.0}
    return dict(
        campaign_id="c1", scan_type="retention", scan_lbl="Loep Behoud",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-07-2026",
        delivery_mode="Baseline", n_invited=n + 3, n_completed=n,
        completion_pct=80.0, avg_risk=5.0, avg_eng=6.0, avg_to=5.0, avg_si=5.0,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=True,
        factor_avgs=fa, top_risks=[("workload", 5.0)],
        top_fkeys=["workload"], top_flabels=["Werkdruk en herstelruimte"],
        strong_work=None, top_exit_lbl=None, top_cont_lbl=None, sig_vis=None,
        sdt_avgs={}, sdt_item_avgs={}, org_item_avgs={"W1": 5.0},
        exit_r_dist=[], cont_dist=[], prev_dist={}, open_texts=[],
        deepening_agg={}, retention_profile=None, exit_pbs=[], ret_pbs=[],
        msp=None, nsp={},
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")]},
        sdt_items=[], enps_available=False, enps_score=None,
        factor_resp_scores=factor_resp_scores or {"workload": [2.0] * 6 + [8.0] * 6},
        intent_resp=intent_resp or {"stay": [2.0] * 6 + [8.0] * 6,
                                    "turnover": [5.0] * 12, "engagement": [6.0] * 12},
    )


_DIST_MARKER = 'class="no-break" style="margin:10px 0 4px;"'  # distribution_block wrapper (uniek genoeg — GEM alleen komt ook toevallig voor in base64-fontdata)


def test_retention_factorverdieping_toont_spreiding():
    html = render_retention_report_html(_min_retention_data())
    assert html.count(_DIST_MARKER) >= 2  # minstens factor + een intentiescore
    assert "Verdeeld beeld" in html  # fixture is gepolariseerd


def test_geen_spreiding_onder_n10():
    d = _min_retention_data(
        factor_resp_scores={"workload": [5.0] * 6},
        intent_resp={"stay": [5.0] * 6, "turnover": [5.0] * 6, "engagement": [5.0] * 6},
        n=6)
    html = render_retention_report_html(d)
    assert _DIST_MARKER not in html


def test_spreiding_verschijnt_pas_vanaf_n10():
    # Zelfde als hierboven maar met precies n=10 -> moet nu WEL verschijnen.
    d = _min_retention_data(
        factor_resp_scores={"workload": [2.0] * 5 + [8.0] * 5},
        intent_resp={"stay": [2.0] * 5 + [8.0] * 5,
                     "turnover": [5.0] * 10, "engagement": [5.0] * 10},
        n=10)
    html = render_retention_report_html(d)
    assert _DIST_MARKER in html


def test_vertrekintentie_label_heeft_duidingssuffix():
    html = render_retention_report_html(_min_retention_data())
    assert "hoger = meer vertrekgedachten" in html


def test_overzichtsprofiel_heeft_drempelvoetregel():
    html = render_retention_report_html(_min_retention_data())
    assert "vaste schaaldrempels" in html
    assert "rangorde" in html.lower()


def test_methodiek_legt_banden_uit():
    html = render_retention_report_html(_min_retention_data())
    assert "Hoe de banden werken" in html
    assert "5,0" in html or "5.0" in html


def test_methodiek_banden_cel_is_niet_33_procent_breed():
    # De "Hoe de banden werken"-rij heeft maar 1 cel (i.p.v. de gebruikelijke
    # 3), dus mag niet de standaard .tc-klasse (width:33%) krijgen - anders
    # rendert de kaart als een smalle 33%-box met dode witruimte ernaast.
    html = render_retention_report_html(_min_retention_data())
    idx = html.find("Hoe de banden werken")
    assert idx != -1
    cell_start = html.rfind("<td", 0, idx)
    assert 'class="tc-full"' in html[cell_start:idx]


from backend.report_html import _themed_quotes


def test_quotes_alles_getoond_tot_12():
    texts = [f"Toelichting nummer {i}" for i in range(8)]
    html = _themed_quotes(texts, "retention")
    for t in texts:
        assert t in html
    assert "Getoond" not in html  # niets weggelaten -> geen weglatingsregel


def test_quotes_cap_12_met_expliciete_regel():
    texts = [f"Toelichting nummer {i}" for i in range(15)]
    html = _themed_quotes(texts, "retention")
    assert "Toelichting nummer 11" in html
    assert "Toelichting nummer 12" not in html
    assert "eerste 12 van 15 in ontvangstvolgorde" in html


def test_quotes_geen_thema_indeling():
    texts = ["Mijn leidinggevende was prima, het zat 'm in de werkdruk"] * 6
    html = _themed_quotes(texts, "retention")
    assert "Thema" not in html
    assert "theme-badge" not in html
    assert "Leiderschap" not in html  # het negatie-voorbeeld mag geen label krijgen


def test_onboarding_cover_zonder_uw():
    import backend.report_html as rh
    import inspect
    src = inspect.getsource(rh)
    assert "Hoe landen uw nieuwe medewerkers" not in src
