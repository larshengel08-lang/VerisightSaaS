from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_campaign_delivery_records_keep_launch_control_fields_in_schema_and_model():
    schema = _read("supabase/schema.sql")
    models = _read("backend/models.py")

    assert "launch_date" in schema
    assert "launch_confirmed_at" in schema
    assert "participant_comms_config" in schema
    assert "reminder_config" in schema

    assert "launch_date" in models
    assert "launch_confirmed_at" in models
    assert "participant_comms_config" in models
    assert "reminder_config" in models
