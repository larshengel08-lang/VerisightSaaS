"""Contract van migratie 2026_10_08 (campaign_stats zonder respondentscores).

Statisch: leest de SQL-bestanden. Het echte gedrag (rechten, tenancy,
byte-gelijke uitvoer) bewijst migrations/checks/2026_10_08_campaign_stats_gedrag.sql
in een wegwerp-Postgres."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIE = ROOT / "migrations" / "2026_10_08_campaign_stats_zonder_respondentscores.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"


def _sql(path: Path) -> str:
    # Commentaar eruit, zodat een zin in de toelichting een test niet laat slagen.
    text = path.read_text(encoding="utf-8")
    return re.sub(r"--[^\n]*", "", text).lower()


def _view_body(sql: str) -> str:
    start = sql.index("create or replace view public.campaign_stats")
    return sql[start : sql.index(";", start)]


def test_migratie_bestaat_en_heeft_security_definer_functie():
    sql = _sql(MIGRATIE)
    assert "create or replace function public.campaign_risk_summary(target_campaign_id uuid)" in sql
    functie = sql[sql.index("create or replace function public.campaign_risk_summary") :]
    functie = functie[: functie.index("$$;") ]
    assert "security definer" in functie
    assert "set search_path = public" in functie
    assert "public.is_org_member(c.organization_id)" in functie
    assert "public.is_verisight_admin_user()" in functie
    assert "current_setting('role', true)" in functie


def test_functie_niet_uitvoerbaar_voor_public_en_anon():
    sql = _sql(MIGRATIE)
    assert "revoke all on function public.campaign_risk_summary(uuid) from public, anon;" in sql
    assert "grant execute on function public.campaign_risk_summary(uuid) to authenticated, service_role;" in sql


def test_view_blijft_security_invoker_en_leest_survey_responses_niet_meer():
    for path in (MIGRATIE, SCHEMA):
        body = _view_body(_sql(path))
        assert "security_invoker = true" in body, path
        assert "survey_responses" not in body, path
        assert "public.campaign_risk_summary(" in body, path
        assert "c.closed_at" in body and "c.closes_at" in body, path


def test_view_kolomvolgorde_gelijk_aan_productie():
    """create or replace view weigert een andere volgorde; productie heeft de
    kolommen uit migrations/2026_06_17_add_closes_at.sql."""
    verwacht = [
        "campaign_id", "campaign_name", "scan_type", "organization_id", "is_active",
        "created_at", "closed_at", "closes_at", "total_invited", "total_completed",
        "completion_rate_pct", "avg_risk_score", "band_high", "band_medium", "band_low",
    ]
    for path in (MIGRATIE, SCHEMA):
        body = _view_body(_sql(path))
        select = body[body.index("select") : body.index("from (")]
        posities = [select.index(kolom) for kolom in verwacht]
        assert posities == sorted(posities), path


def test_kolomrecht_op_survey_responses_is_weg():
    for path in (MIGRATIE, SCHEMA):
        sql = _sql(path)
        assert "revoke select on public.survey_responses from anon, authenticated;" in sql, path
        assert not re.search(r"grant\s+select\s*\([^)]*\)\s*on\s+public\.survey_responses", sql), path
        assert not re.search(r"grant\s+select\s+on\s+public\.survey_responses\s+to\s+(anon|authenticated)", sql), path


def test_anon_leest_campaign_stats_niet():
    for path in (MIGRATIE, SCHEMA):
        assert "revoke select on public.campaign_stats from anon;" in _sql(path), path


def test_functie_staat_in_schema_voor_de_view():
    sql = _sql(SCHEMA)
    assert sql.index("create or replace function public.campaign_risk_summary") < sql.index(
        "create or replace view public.campaign_stats"
    )


def test_migratie_bevat_geen_drop_view():
    """create or replace houdt grants en afhankelijkheden; een drop zou dat niet."""
    assert "drop view" not in _sql(MIGRATIE)
