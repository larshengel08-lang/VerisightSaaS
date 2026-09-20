"""SQL-guard op de migratie van plan 3b (spec 2026-09-16 par. 7 en 11).

De migratie kan lokaal niet tegen Postgres draaien; deze tests pinnen daarom de
tekst: RLS aan, leden lezen, alleen eigenaar en operator schrijven, geen delete
voor klanten, alles idempotent, en supabase/schema.sql in lockstep (schema-drift
was bevinding H3 van de security-audit van 2026-07-13).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIE = ROOT / "migrations" / "2026_09_19_add_campaign_decisions.sql"
SCHEMA = ROOT / "supabase" / "schema.sql"

KOLOMMEN = ("campaign_id", "organization_id", "decided_at", "primary_topic", "primary_action",
            "owner", "follow_up_date", "secondary_topic", "secondary_action",
            "feedback_plan", "success_criterion", "recorded_by", "created_at", "updated_at")


def _sql() -> str:
    return re.sub(r"\s+", " ", MIGRATIE.read_text(encoding="utf-8")).lower()


def test_tabel_heeft_de_kolommen_uit_de_spec():
    sql = _sql()
    assert "create table if not exists public.campaign_decisions" in sql
    for kolom in KOLOMMEN:
        assert re.search(r"\b" + kolom + r"\b", sql), kolom


def test_een_rij_per_meting():
    """campaign_id is de primaire sleutel: de upsert in de frontend leunt daarop."""
    assert re.search(r"campaign_id uuid primary key references public\.campaigns\(id\) on delete cascade",
                     _sql())


def test_rls_staat_aan_en_leden_lezen():
    sql = _sql()
    assert "alter table public.campaign_decisions enable row level security" in sql
    assert re.search(r"for select using \(public\.is_org_member\(organization_id\) "
                     r"or public\.is_verisight_admin_user\(\)\)", sql)


def test_alleen_eigenaar_en_operator_schrijven():
    sql = _sql()
    for soort in ("insert", "update"):
        assert re.search(r"for " + soort + r"\b[^;]*public\.is_org_owner\(organization_id\) "
                         r"or public\.is_verisight_admin_user\(\)", sql), soort
    # is_org_manager omvat ook de rol 'member' (meelezer): die mag hier niet schrijven.
    assert "is_org_manager" not in sql


def test_update_policy_heeft_using_en_with_check():
    """Zonder with check kan een eigenaar een rij naar een andere organisatie omhangen."""
    blok = re.search(r"create policy \"org_owners_can_update_decisions\".*?;", _sql()).group(0)
    assert " using (" in blok and " with check (" in blok


def test_klanten_kunnen_geen_besluit_verwijderen():
    sql = _sql()
    assert "revoke delete on public.campaign_decisions from authenticated" in sql
    assert "for delete" not in sql


def test_organisatie_van_het_besluit_is_die_van_de_meting():
    """De policies kijken naar organization_id op de besluitrij. Zonder deze
    trigger kan een eigenaar van organisatie A een rij schrijven met
    campaign_id van organisatie B en organization_id van A."""
    sql = _sql()
    assert "create or replace function public.campaign_decisions_org_guard()" in sql
    assert "create trigger campaign_decisions_org_guard_trg" in sql
    assert "drop trigger if exists campaign_decisions_org_guard_trg" in sql
    # De trigger moet op beide events vuren: alleen 'insert' zou een latere
    # update (bijv. het omhangen van organization_id) ongecontroleerd laten.
    assert re.search(r"before insert or update on public\.campaign_decisions", sql)


def test_previous_campaign_id_zit_in_dezelfde_migratie():
    sql = _sql()
    assert ("alter table public.campaigns add column if not exists previous_campaign_id uuid "
            "references public.campaigns(id) on delete set null") in sql


def test_migratie_is_idempotent():
    sql = _sql()
    assert sql.count("create policy") == sql.count("drop policy if exists")
    assert "create table public." not in sql.replace("create table if not exists public.", "")
    assert "create index if not exists" in sql


def test_schema_sql_draagt_hetzelfde_blok():
    schema = re.sub(r"\s+", " ", SCHEMA.read_text(encoding="utf-8")).lower()
    assert "create table if not exists public.campaign_decisions" in schema
    assert "alter table public.campaign_decisions enable row level security" in schema
    assert "org_owners_can_update_decisions" in schema
    assert "previous_campaign_id" in schema
