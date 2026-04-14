from __future__ import annotations

from pathlib import Path

from backend.products.exit.report_content import (
    get_management_summary_payload as get_exit_management_summary_payload,
)
from backend.products.retention.report_content import (
    get_management_summary_payload as get_retention_management_summary_payload,
)
from backend.report import _build_exit_hypotheses, _build_retention_action_hypotheses


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_report_management_payloads_expose_executive_contract_fields():
    exit_payload = get_exit_management_summary_payload(
        top_factor_labels=["Leiderschap", "Groei"],
        top_exit_reason_label="Leiderschap / management",
        top_contributing_reason_label="Gebrek aan groei",
        strong_work_signal_pct=62,
        signal_visibility_average=2.6,
    )
    retention_payload = get_retention_management_summary_payload(
        top_factor_labels=["Werkbelasting", "Leiderschap"],
        retention_signal_profile="scherp_aandachtssignaal",
        avg_engagement=5.1,
        avg_turnover_intention=6.1,
        avg_stay_intent=4.8,
        retention_theme_title="Werkdruk en planning",
    )

    for payload in (exit_payload, retention_payload):
        assert payload["executive_title"]
        assert payload["executive_intro"]
        assert payload["trust_note_title"]
        assert payload["trust_note"]
        assert len(payload["highlight_cards"]) >= 3


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
        retention_themes=[{"key": "workload", "title": "Werkdruk", "count": 5, "sample_quote": "..."},],
        avg_engagement=5.2,
        avg_turnover_intention=6.0,
        avg_stay_intent=4.7,
    )

    assert exit_hypotheses[0]["owner"]
    assert exit_hypotheses[0]["action"]
    assert retention_hypotheses[0]["owner"]
    assert retention_hypotheses[0]["action"]


def test_preview_copy_and_report_layers_stay_aligned_on_management_language():
    preview_copy = _read("frontend/lib/report-preview-copy.ts")
    exit_report_content = _read("backend/products/exit/report_content.py")
    retention_report_content = _read("backend/products/retention/report_content.py")
    report = _read("backend/report.py")
    product_page = _read("frontend/app/producten/[slug]/page.tsx")
    marketing_products = _read("frontend/lib/marketing-products.ts")

    assert "managementsamenvatting" in preview_copy
    assert "eerste managementvraag" in preview_copy
    assert "eerste logische stap" in preview_copy
    assert "eerste verificatiespoor" in preview_copy
    assert "vertrekduiding voor hr, mt en directie" in exit_report_content
    assert "behoudssignalen voor hr, mt en directie" in retention_report_content
    assert "eerste eigenaar" in report
    assert "linebefore" in report
    assert "managementsamenvatting, eerste managementvraag en eerste logische stap" in product_page
    assert "managementsamenvatting, eerste verificatiespoor en eerste logische stap" in product_page
    assert "managementsamenvatting, vertrekduiding" in marketing_products
    assert "managementsamenvatting, retentiesignaal" in marketing_products
