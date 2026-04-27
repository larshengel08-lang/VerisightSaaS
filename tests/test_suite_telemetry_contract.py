from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "SUITE_TELEMETRY_EVENT_CONTRACT.md"


def test_suite_telemetry_contract_lists_bounded_core_events():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "owner_access_confirmed" in text
    assert "first_value_confirmed" in text
    assert "manager_denied_insights" in text
    assert "action_center_review_scheduled" in text
