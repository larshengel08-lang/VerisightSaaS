from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md"


def test_billing_self_serve_contract_locks_bounded_runtime_truth():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "organization-first" in text
    assert "geen Stripe" in text
    assert "geen plans of seats" in text
    assert "admin-only billing registry" in text
    assert "customer-facing readiness signal" in text
