from __future__ import annotations

from pathlib import Path

from backend.products.exit.report_content import (
    get_management_summary_payload as get_exit_management_summary_payload,
)
from backend.products.pulse.report_content import (
    get_management_summary_payload as get_pulse_management_summary_payload,
)
from backend.products.retention.report_content import (
    get_management_summary_payload as get_retention_management_summary_payload,
)
from backend.report import _build_exit_hypotheses, _build_retention_action_hypotheses


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def _function_slice(source: str, function_name: str) -> str:
    marker = f"def {function_name}("
    start = source.index(marker)
    next_def = source.find("\ndef ", start + len(marker))
    return source[start:] if next_def == -1 else source[start:next_def]


def test_report_management_payloads_expose_executive_contract_fields():
    exit_payload = get_exit_management_summary_payload(
        top_factor_labels=["Leiderschap", "Groei"],
        top_factor_keys=["leadership", "growth"],
        top_exit_reason_label="Leiderschap / management",
        top_contributing_reason_label="Gebrek aan groei",
        strong_work_signal_pct=62,
        signal_visibility_average=2.6,
    )
    retention_payload = get_retention_management_summary_payload(
        top_factor_labels=["Werkbelasting", "Leiderschap"],
        top_factor_keys=["workload", "leadership"],
        retention_signal_profile="scherp_aandachtssignaal",
        avg_engagement=5.1,
        avg_turnover_intention=6.1,
        avg_stay_intent=4.8,
        retention_theme_title="Werkdruk en planning",
    )
    pulse_payload = get_pulse_management_summary_payload(
        top_factor_labels=["Werkbelasting", "Leiderschap"],
        top_factor_keys=["workload", "leadership"],
        avg_stay_intent=4.8,
    )

    for payload in (exit_payload, retention_payload, pulse_payload):
        assert payload["executive_title"]
        assert payload["executive_intro"]
        assert payload["trust_note_title"]
        assert payload["trust_note"]
        assert payload["boardroom_title"]
        assert payload["boardroom_intro"]
        assert payload["boardroom_watchout"]
        assert len(payload["boardroom_cards"]) >= 5
        assert len(payload["highlight_cards"]) >= 3
        assert any(card["title"] == "Eerste besluit" for card in payload["highlight_cards"])
        assert any(card["title"] == "Eerste eigenaar" for card in payload["highlight_cards"])


def test_pulse_report_content_stays_bounded_and_non_parity_like():
    pulse_report_content = _read("backend/products/pulse/report_content.py")

    assert "compacte managementhandoff" in pulse_report_content
    assert "bounded hercheck" in pulse_report_content
    assert "frictiescore" not in pulse_report_content
    assert "retentiesignaal" not in pulse_report_content
    assert "vertrekintentie" not in pulse_report_content
    assert "bevlogenheid" not in pulse_report_content
    assert "segmentanalyse" not in pulse_report_content


def test_report_hypotheses_include_owner_and_actionability():
    exit_hypotheses = _build_exit_hypotheses(
        top_risks=[("leadership", 6.7), ("growth", 6.2)],
        top_exit_reasons=[{"code": "P1", "label": "Leiderschap / management", "count": 4}],
        top_contributing_reasons=[{"label": "Gebrek aan groei", "count": 3}],
        factor_avgs={"leadership": 4.3, "growth": 4.8},
    )
    retention_hypotheses = _build_retention_action_hypotheses(
        top_risks=[("workload", 6.6), ("leadership", 6.0)],
        retention_signal_profile="scherp_aandachtssignaal",
        retention_themes=[{"key": "workload", "title": "Werkdruk", "count": 5, "sample_quote": "..."}],
        avg_engagement=5.2,
        avg_turnover_intention=6.0,
        avg_stay_intent=4.7,
        factor_avgs={"workload": 4.9, "leadership": 5.3},
    )

    assert exit_hypotheses[0]["owner"]
    assert exit_hypotheses[0]["action"]
    assert retention_hypotheses[0]["owner"]
    assert retention_hypotheses[0]["action"]


def test_report_layers_keep_primary_management_language_backend_only():
    exit_report_content = _read("backend/products/exit/report_content.py")
    retention_report_content = _read("backend/products/retention/report_content.py")
    report = _read("backend/report.py")
    report_design = _read("backend/report_design.py")

    assert "vertrekduiding voor hr, mt en directie" in exit_report_content
    assert "vroegsignalering op behoud voor hr, mt en directie" in retention_report_content
    assert "wat je hier niet uit moet concluderen" in exit_report_content
    assert "wat je hier niet uit moet concluderen" in retention_report_content
    assert '"title": "frictiescore nu"' in exit_report_content
    assert '"title": "retentiesignaal nu"' in retention_report_content
    assert "bestuurlijke handoff" in report
    assert "session_title" in report
    assert "eerste managementsessie na oplevering" in exit_report_content
    assert "eerste managementsessie na oplevering" in retention_report_content
    assert "eerste eigenaar" in report
    assert "eerste besluit" in report
    assert "reviewmoment" in report
    assert "linebefore" in report
    assert "trust, interpretatie & claimsgrens" in report
    assert "niet voor diagnostiek of sluitende causaliteit" in exit_report_content
    assert "v1-werkmodel" in retention_report_content
    assert "detailweergave start pas vanaf 5 responses" in exit_report_content
    assert "minimale n-grenzen" in retention_report_content
    assert "#2f5bea" in report_design


def test_report_runtime_paths_stay_explicit_and_backend_scoped():
    report = _read("backend/report.py")

    assert "def _build_exit_embedded_story" in report
    assert "def _build_non_exit_runtime_story" in report
    assert "def _build_retention_runtime_story" in report
    assert "def _build_shared_non_exit_runtime_story" in report
    assert "_build_rebrand_story" not in report
    assert "legacy unreachable block below" not in report
    assert "vaste, expliciet vastgezette hoofdstructuur" not in report
    assert "frictiescore" in report


def test_exit_renderer_explicitly_maps_pages_to_visual_master_families():
    report = _read("backend/report.py")

    assert "exit_report_visual_master_map" in report
    assert "retention_report_visual_master_map" in report
    assert "cover / intro" in report
    assert "executive read" in report
    assert "analytical insight" in report
    assert "action / route" in report
    assert "p1_cover" in report
    assert "p2_response" in report
    assert "p3_handoff" in report
    assert "p9_action_route" in report
    assert "appendix_b_technical" in report


def test_reporting_runtime_freezes_primary_product_anchors():
    exit_report_content = _read("backend/products/exit/report_content.py")
    retention_report_content = _read("backend/products/retention/report_content.py")
    report = _read("backend/report.py")

    assert "frictiescore nu" in exit_report_content
    assert '"title": "vertrekbeeld nu"' not in exit_report_content
    assert "retentiesignaal nu" in retention_report_content
    assert '"title": "groepsbeeld nu"' not in retention_report_content
    assert "stay-intent is een aanvullende leeslaag" in report
    assert "werkfrictie" in exit_report_content


def test_report_design_uses_active_visual_blueprint_tokens():
    report_design = _read("backend/report_design.py")

    assert "#2f5bea" in report_design
    assert "#fafaf7" in report_design
    assert "#14161a" in report_design
    assert "#0e8f6e" in report_design
    assert "#b4770e" in report_design
    assert "#c24a2b" in report_design


def test_report_renderer_uses_shared_section_opening_utility_for_master_recipe_pages():
    report = _read("backend/report.py")

    assert "def _append_section_opening(" in report

    for function_name in (
        "_append_exit_friction_page",
        "_append_exit_signal_synthesis_page",
        "_append_exit_drivers_page",
        "_append_exit_sdt_page",
        "_append_exit_org_factors_page",
        "_append_retention_signal_page",
        "_append_retention_signal_synthesis_page",
        "_append_retention_drivers_page",
        "_append_retention_underlayer_page",
        "_append_retention_org_factors_page",
    ):
        assert "_append_section_opening(" in _function_slice(report, function_name)
    methodology_shell = _function_slice(report, "_append_methodology_page_shell")
    assert "_append_section_opening(" in methodology_shell


def test_report_renderer_uses_shared_quiet_note_and_surface_style_builders():
    report = _read("backend/report.py")

    assert "def _append_quiet_note(" in report
    assert "def _build_surface_table_style(" in report
    assert "_build_surface_table_style(" in _function_slice(report, "_append_emphasis_note")
    assert "_build_surface_table_style(" in _function_slice(report, "_build_chart_frame_flowable")
    assert "_append_quiet_note(" in _function_slice(report, "_append_exit_response_page")
    assert "_append_quiet_note(" in _function_slice(report, "_append_retention_signal_synthesis_page")


def test_report_renderer_uses_shared_method_and_appendix_table_builders():
    report = _read("backend/report.py")

    assert "def _build_methodology_read_guide_rows(" in report
    assert "def _append_methodology_read_guide_table(" in report
    assert "def _append_appendix_data_section(" in report
    assert "_build_methodology_read_guide_rows(" in _function_slice(report, "_append_methodology_read_guide_table")
    methodology_shell = _function_slice(report, "_append_methodology_page_shell")
    assert "_append_methodology_read_guide_table(" in methodology_shell
    appendix_slice = _function_slice(report, "_append_rebrand_technical_appendix")
    assert appendix_slice.count("_append_appendix_data_section(") >= 2


def test_report_renderer_uses_shared_methodology_page_shell_for_both_products():
    report = _read("backend/report.py")

    assert "def _append_methodology_page_shell(" in report
    assert "_append_methodology_page_shell(" in _function_slice(report, "_append_exit_methodology_page")
    assert "_append_methodology_page_shell(" in _function_slice(report, "_append_retention_methodology_page")
