from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "docs" / "active" / "SUITE_PROOF_AND_PILOT_EXECUTION_CONTRACT.md"


def test_proof_and_pilot_contract_locks_approval_ladder():
    text = CONTRACT.read_text(encoding="utf-8")
    assert "lesson_only" in text
    assert "internal_proof_only" in text
    assert "sales_usable" in text
    assert "public_usable" in text
