from __future__ import annotations

import re
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


def test_launch_date_type_stays_aligned_between_schema_and_backend_model():
    schema = _read("supabase/schema.sql")
    models = _read("backend/models.py")

    assert re.search(r"launch_date\s+date", schema)
    assert re.search(r"launch_date:\s*mapped\[date\s*\|\s*none\]", models)
    assert re.search(r"launch_date:\s*mapped\[date\s*\|\s*none\]\s*=\s*mapped_column\(date,", models)


def test_live_hardening_patch_keeps_organization_secret_api_key_type_aligned():
    schema = _read("supabase/schema.sql")
    patch = _read("supabase/live_hardening_patch.sql")

    assert re.search(r"api_key\s+text\s+unique\s+default\s+gen_random_uuid\(\)::text", schema)
    assert re.search(r"api_key\s+text\s+unique\s+default\s+gen_random_uuid\(\)::text", patch)
