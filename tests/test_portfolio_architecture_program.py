from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_report_engine_primary_anchors_stay_product_specific():
    exit_report_content = _read("backend/products/exit/report_content.py")
    retention_report_content = _read("backend/products/retention/report_content.py")

    assert "frictiescore nu" in exit_report_content
    assert '"title": "vertrekbeeld nu"' not in exit_report_content
    assert "werkfrictie" in exit_report_content
    assert "retentiesignaal nu" in retention_report_content
    assert '"title": "groepsbeeld nu"' not in retention_report_content
    assert "stay-intent" in retention_report_content
    assert "aanvullende signalen" in retention_report_content


def test_report_engine_runtime_keeps_product_specific_paths_explicit():
    report = _read("backend/report.py")

    assert "def _build_exit_embedded_story" in report
    assert "def _build_retention_embedded_story" in report
    assert "def _append_exit_handoff_page" in report
    assert "def _append_retention_handoff_page" in report
    assert "def _append_exit_signal_synthesis_page" in report
    assert "def _append_retention_signal_synthesis_page" in report
    assert "frictiescore" in report
    assert "retentiesignaal" in report


def test_backend_report_test_cluster_no_longer_reaches_into_frontend_or_docs():
    reporting_parity = _read("tests/test_reporting_system_parity.py")
    smoke_tests = _read("tests/test_report_generation_smoke.py")

    for source in (reporting_parity, smoke_tests):
        assert '_read("frontend/' not in source
        assert '_read("docs/' not in source
        assert '_read("migrations/' not in source
