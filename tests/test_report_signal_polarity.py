"""B4: behoudssignaal en checkpointscore op de gezondheidsschaal (hoog = goed).

Stresstest-bevinding: het behoudssignaal (Loep Behoud) en de checkpointscore
(Loep Start) werden als avg_risk getoond, een RISICO-getal (hoog = slecht),
terwijl elk ander "/10"-getal in het rapport een GEZONDHEIDS-score is en de
uitleg ernaast de gezondheidsladder beschrijft (onder 5,0 kwetsbaar, 5,0 tot
6,5 aandachtspunt, vanaf 6,5 relatief sterk). Scenario "alles hoog" toonde
"Behoudssignaal 3.0/10 · sterk", scenario "alles laag" "6.9/10 · vraagt
aandacht". Een lezer trok de tegenovergestelde conclusie.

Besluit: display-laag converteert health = 11 - avg_risk (precedent: het
segmentblok in build_report_data). De opgeslagen risk_score blijft op de
risicoschaal. Loep Vertrek (frictiescore, hoog = meer frictie) valt buiten
deze omkering.
"""
from __future__ import annotations


import pytest

from backend.report_html import (
    SECTION_INTROS,
    _band,
    _behoudscontext,
    _checkpointoverzicht,
    _signal_health,
    render_onboarding_report_html,
    render_retention_report_html,
)
from backend.products.retention.definition import SCAN_DEFINITION as RET_DEF
from backend.products.onboarding.definition import SCAN_DEFINITION as ONB_DEF


# ── helper ───────────────────────────────────────────────────────────────────

def test_signal_health_inverts_risk():
    assert _signal_health(3.0) == 8.0
    assert _signal_health(6.9) == 4.1
    assert _signal_health(None) is None


# ── _band: retention/onboarding op de gezondheidsladder, exit ongewijzigd ────

def test_band_retention_follows_health_ladder():
    assert _band(8.0, "retention")[0] == "Behoudsklimaat stabiel"
    assert _band(6.5, "retention")[0] == "Behoudsklimaat stabiel"
    assert _band(6.4, "retention")[0] == "Behoud vraagt aandacht"
    assert _band(5.0, "retention")[0] == "Behoud vraagt aandacht"
    assert _band(4.0, "retention")[0] == "Behoud onder druk"
    assert _band(4.9, "retention")[0] == "Behoud onder druk"


def test_band_onboarding_follows_health_ladder():
    assert _band(6.0, "onboarding")[0] == "Gemengd onboardingsbeeld"
    assert _band(7.0, "onboarding")[0] == "Onboardingbasis stabiel"
    assert _band(3.5, "onboarding")[0] == "Onboardingbasis vraagt aandacht"


def test_band_exit_keeps_risk_polarity():
    assert _band(7.5, "exit")[0] == "Sterk frictiebeeld"
    assert _band(5.0, "exit")[0] == "Gemengd vertrekbeeld"
    assert _band(3.0, "exit")[0] == "Laag frictiebeeld"


# ── _behoudscontext: één ladder voor kleur en note ───────────────────────────

def _sigrow_behoudssignaal(html: str) -> str:
    # Op de sigrow-titel geankerd en niet op het kale woord: sinds ronde 2
    # (taak 3) draagt ook de onderbouwingscel op p.02 het label
    # "Behoudssignaal", en die staat eerder in het document.
    start = html.index('<div class="sigrow-title">Behoudssignaal</div>')
    end = html.index('class="sigrow"', start) if 'class="sigrow"' in html[start:] else len(html)
    return html[start:end]


def test_behoudscontext_strong_signal_is_teal_and_sterk():
    html = _behoudscontext(retention_score=8.0, stay_intent=None, turnover=None, engagement=None)
    row = _sigrow_behoudssignaal(html)
    assert "8.0/10" in row
    assert "#3C8D8A" in row
    assert '<span class="sigrow-note">sterk</span>' in row


def test_behoudscontext_weak_signal_is_red_and_onder_druk():
    html = _behoudscontext(retention_score=3.5, stay_intent=None, turnover=None, engagement=None)
    row = _sigrow_behoudssignaal(html)
    assert "3.5/10" in row
    assert "#C0392B" in row
    assert '<span class="sigrow-note">onder druk</span>' in row


def test_behoudscontext_middle_signal_is_amber_and_vraagt_aandacht():
    html = _behoudscontext(retention_score=5.8, stay_intent=None, turnover=None, engagement=None)
    row = _sigrow_behoudssignaal(html)
    assert "#C17C00" in row
    assert '<span class="sigrow-note">vraagt aandacht</span>' in row


def test_checkpointoverzicht_colour_follows_health_ladder():
    strong = _checkpointoverzicht(checkpoints=[("Huidig checkpoint", 7.2)])
    weak = _checkpointoverzicht(checkpoints=[("Huidig checkpoint", 4.1)])
    assert "#3C8D8A" in strong and "7.2/10" in strong
    assert "#C0392B" in weak and "4.1/10" in weak


# ── intro-copy zegt expliciet dat hoog goed is ───────────────────────────────

@pytest.mark.parametrize("key", ["behoudscontext", "checkpointoverzicht"])
def test_intro_says_higher_is_better(key):
    txt = SECTION_INTROS[key].lower()
    assert "hoe hoger, hoe beter" in txt
    assert "onder de 5,0" in txt
    assert "—" not in SECTION_INTROS[key]


# ── dashboard_signal_help op gezondheidspolariteit, labels ongewijzigd ───────

def test_dashboard_signal_help_health_polarity_plain_dutch():
    for d in (RET_DEF, ONB_DEF):
        txt = d["dashboard_signal_help"]
        assert "hoe hoger, hoe beter" in txt.lower()
        assert "onder de 5,0" in txt
        for jargon in ("SDT", "v1", "beinvloedbare", "bestuurlijke"):
            assert jargon not in txt, jargon
        assert "—" not in txt
    assert RET_DEF["signal_label"] == "Retentiesignaal"
    assert ONB_DEF["signal_label"] == "Onboardingsignaal"


# ── volledige renderers: kernzin toont 11 - avg_risk ─────────────────────────

def _min_data(scan_type: str, avg_risk: float, n: int = 12) -> dict:
    fa = {"workload": 6.0, "leadership": 7.0}
    return dict(
        campaign_id="c1", scan_type=scan_type,
        scan_lbl="Loep Behoud" if scan_type == "retention" else "Loep Start",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-09-2026",
        delivery_mode="Baseline", n_invited=n + 3, n_completed=n,
        completion_pct=80.0, avg_risk=avg_risk, avg_eng=6.0, avg_to=4.0, avg_si=6.5,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=True,
        factor_avgs=fa, top_risks=[("workload", 6.0)],
        top_fkeys=["workload"], top_flabels=["Werkdruk en herstelruimte"],
        strong_work=None, top_exit_lbl=None, top_cont_lbl=None, sig_vis=None,
        sdt_avgs={}, sdt_item_avgs={}, org_item_avgs={"W1": 6.0, "L1": 7.0},
        exit_r_dist=[], cont_dist=[], prev_dist={}, open_texts=[],
        deepening_agg={}, direction_agg={}, retention_profile=None,
        exit_pbs=[], ret_pbs=[], msp=None, nsp={},
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")],
                          "leadership": [("L1", "Testvraag leiding")]},
        sdt_items=[], enps_available=False, enps_score=None,
        factor_resp_scores={"workload": [6.0] * n, "leadership": [7.0] * n},
        intent_resp={"stay": [6.5] * n, "turnover": [4.0] * n, "engagement": [6.0] * n},
    )


def _signaalcel(html: str, label: str) -> str:
    """De onderbouwingscel op p.02 die het totaalsignaal draagt.

    Het getal stond tot ronde 2 (taak 3) in de kernzin; die plek is nu van de
    zin over de vorm van het profiel. De cel moet het getal MET zijn band tonen,
    dus deze helper levert de hele cel en niet los het getal: een cel met het
    getal van de ene meting en de band van de andere zou een losse substringtest
    overleven.
    """
    i = html.find(f'<div class="sc-l">{label}</div>')
    assert i != -1, f"onderbouwingscel {label!r} niet gevonden"
    j = html.find("</td>", i)
    return html[i:j]


def test_retention_kernzin_shows_health_value_and_matching_band():
    # avg_risk 3.0 -> behoudssignaal 8.0 (sterk); avg_risk 7.0 -> 4.0 (onder druk)
    html = render_retention_report_html(_min_data("retention", 3.0))
    # De regex op "behoudssignaal 8.0/10" is vervallen: dat woord stond in de
    # kernzin, en het getal draagt zijn duiding nu via het cel-label hieronder.
    cel = _signaalcel(html, "Behoudssignaal")
    assert "8.0/10" in cel and "Behoudsklimaat stabiel" in cel
    assert "3.0/10" not in _sigrow_behoudssignaal(html)

    html_low = render_retention_report_html(_min_data("retention", 7.0))
    cel_low = _signaalcel(html_low, "Behoudssignaal")
    assert "4.0/10" in cel_low and "Behoud onder druk" in cel_low
    assert '<span class="sigrow-note">onder druk</span>' in _sigrow_behoudssignaal(html_low)


def test_onboarding_kernzin_shows_health_value_and_matching_band():
    html = render_onboarding_report_html(_min_data("onboarding", 3.0))
    cel = _signaalcel(html, "Checkpointscore")
    assert "8.0/10" in cel and "Onboardingbasis stabiel" in cel
    html_low = render_onboarding_report_html(_min_data("onboarding", 7.0))
    cel_low = _signaalcel(html_low, "Checkpointscore")
    assert "4.0/10" in cel_low and "Onboardingbasis vraagt aandacht" in cel_low
