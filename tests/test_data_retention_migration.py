"""De migratie voor de bewaartermijn (fixronde 24-9, Deel C): additief, idempotent,
met een trigger die klanten de twee kolommen niet laat wijzigen, en bewust niet
op het ORM-model."""
from pathlib import Path

from backend.models import Campaign, Organization

ROOT = Path(__file__).resolve().parent.parent
MIGRATIE = ROOT / "migrations" / "2026_09_24_add_data_retention.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"


def _sql() -> str:
    return MIGRATIE.read_text(encoding="utf-8").lower()


def test_migratie_is_additief_en_idempotent():
    sql = _sql()
    assert "add column if not exists data_purged_at timestamptz" in sql
    assert "add column if not exists retention_months integer" in sql
    assert "retention_months between 1 and 120" in sql
    assert "create or replace function public.guard_retention_columns()" in sql
    assert sql.count("drop trigger if exists") == 2
    for verboden in ("drop table", "drop column", "delete from", "truncate", "alter column"):
        assert verboden not in sql, verboden


def test_trigger_laat_alleen_loep_de_kolommen_wijzigen():
    sql = _sql()
    assert "auth.role()" in sql
    assert "is_verisight_admin_user()" in sql
    assert "set search_path = public" in sql
    assert "before update on public.organizations" in sql
    # Managers mogen metingen aanmaken (org_managers_can_insert_campaigns). Een
    # nieuwe meting met data_purged_at al gevuld zou de opschoning voor altijd
    # overslaan (een tweede run doet niets bij een gevulde kolom), dus de trigger
    # bewaakt op campaigns ook de insert.
    assert "before insert or update on public.campaigns" in sql
    assert "tg_op = 'insert'" in sql
    assert "new.data_purged_at is not null" in sql


def test_trigger_leest_geen_kolom_van_de_andere_tabel():
    """Eén functie bewaakt twee tabellen. PL/pgSQL rekent
    "tg_table_name = 'campaigns' and new.data_purged_at ..." niet kort: op
    organizations bestaat new.data_purged_at niet en dan faalt elke update van
    een klant (gezien in een wegwerp-Postgres). Een kolomverwijzing via new./old.
    mag daarom nooit in dezelfde expressie staan als een tabel- of operatiecheck."""
    sql = _sql()
    for regel in sql.splitlines():
        if regel.strip().startswith("--"):
            continue
        if "tg_table_name" in regel or "tg_op" in regel:
            assert "new." not in regel and "old." not in regel, regel


def test_schema_sql_heeft_hetzelfde_blok():
    schema = SCHEMA.read_text(encoding="utf-8").lower()
    assert "-- bewaartermijn (migratie 2026_09_24_add_data_retention.sql)" in schema
    assert "add column if not exists data_purged_at timestamptz" in schema
    assert "add column if not exists retention_months integer" in schema
    assert "create or replace function public.guard_retention_columns()" in schema
    assert "before insert or update on public.campaigns" in schema
    # Het blok in schema.sql is de migratie zonder de kopcommentaarregels.
    migratie_zonder_kop = _sql().split("\n\n", 1)[1].strip()
    assert migratie_zonder_kop in schema


def test_kolommen_staan_bewust_niet_op_het_orm_model():
    """Een kolom op het model komt in elke SELECT; een niet-gedraaide migratie
    legde op 13 september elk rapport plat. backend/data_retention.py leest ze
    met losse SQL en controleert eerst of ze bestaan."""
    assert "data_purged_at" not in Campaign.__table__.columns
    assert "retention_months" not in Organization.__table__.columns
