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
    # Twee vaste triggers plus de lus voor de tabellen per meting.
    assert sql.count("drop trigger if exists") == 3
    for verboden in ("drop table", "drop column", "delete from", "truncate", "alter column"):
        assert verboden not in sql, verboden


# Precies de tabellen per meting die een klant via RLS mag schrijven (insert of
# update), zie het commentaar in de migratie.
TABELLEN_PER_METING = (
    "respondents", "campaign_delivery_records", "campaign_delivery_checkpoints",
    "campaign_decisions", "campaign_action_audit_events",
    "action_center_manager_responses", "action_center_route_actions",
    "action_center_action_reviews", "action_center_route_relations",
    "action_center_review_rhythm_configs", "action_center_governance_interventions",
)


def test_opgeschoonde_meting_is_voor_klanten_dicht():
    """Na de opschoning slaat de opschoning een meting voor altijd over. Wat een
    klant daarna nog schrijft (een eigenaarnaam in een besluit) zou dus nooit
    meer verdwijnen: de trigger weigert dat voor klanten."""
    sql = _sql()
    assert "create or replace function public.guard_purged_campaign_writes()" in sql
    functie = sql.split("create or replace function public.guard_purged_campaign_writes()", 1)[1]
    functie = functie.split("$$;", 1)[0]
    assert "security definer set search_path = public" in functie
    assert "coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_verisight_admin_user()" in functie
    assert "de gegevens van deze meting zijn verwijderd; hier kan niets meer bij." in functie
    assert "c.data_purged_at is not null" in functie
    # Bij een update telt ook de meting waar de rij vandaan komt.
    assert "array_append(rijen, to_jsonb(old))" in functie
    # Alle manieren waarop een rij aan een meting hangt.
    for sleutel in ("'campaign_id'", "'source_campaign_id'", "'target_campaign_id'",
                    "'route_source_id'", "'delivery_record_id'", "'action_id'"):
        assert sleutel in functie, sleutel
    lus = sql.split("foreach t in array array[", 1)[1].split("] loop", 1)[0]
    genoemd = {t.strip().strip("'") for t in lus.replace("\n", " ").split(",")}
    assert genoemd == set(TABELLEN_PER_METING)
    # Een tabel die op deze omgeving niet bestaat, wordt overgeslagen.
    assert "if to_regclass('public.' || t) is not null then" in sql
    assert "before insert or update on public.%i" in sql


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
    # Ook 'anon' telt als klant (verdediging in de diepte).
    assert "coalesce(auth.role(), '') in ('anon', 'authenticated')" in sql


def test_trigger_bewaakt_de_klok_van_de_bewaartermijn():
    """De termijn loopt vanaf closed_at. Kan een klant een gesloten meting
    heropenen of closed_at verschuiven, dan slaat de opschoning hem voor altijd
    over. Voor een klant is de database eigenaar van het sluitmoment: gaat
    closed_at van leeg naar gevuld, dan wordt het now(), wat de client ook
    stuurt. In de toekomst zou de termijn uitstellen, in het verleden zou de
    meting bij de volgende opschoning onherroepelijk wissen."""
    sql = _sql()
    assert "if old.closed_at is not null then" in sql
    assert "new.closed_at is distinct from old.closed_at" in sql
    assert "coalesce(new.is_active, false) and not coalesce(old.is_active, false)" in sql
    # Insert-tak en update-tak (closed_at was leeg): altijd now(), geen
    # eenzijdige begrenzing op de toekomst meer.
    assert sql.count("new.closed_at := now();") == 2
    assert "        if new.closed_at is not null then\n          new.closed_at := now();" in sql
    assert "        elsif new.closed_at is not null then\n          new.closed_at := now();" in sql
    assert "new.closed_at > now()" not in sql
    # Stopzetten zonder sluitmoment: zo'n meting raakt de opschoning nooit.
    assert "coalesce(old.is_active, false) and new.is_active is false and new.closed_at is null" in sql
    assert "sluit een meting met een sluitmoment" in sql
    # Ook bij aanmaken: een meting die meteen stopgezet is zonder closed_at.
    assert "if new.is_active is false and new.closed_at is null then" in sql
    assert sql.count("sluit een meting met een sluitmoment") == 2


def test_migratie_geeft_lars_een_controle_op_auth_role():
    sql = _sql()
    assert "-- select pg_get_functiondef('auth.role'::regproc) like '%request.jwt.claims%';" in sql


def test_gedragscontrole_is_alleen_lokaal():
    check = (ROOT / "migrations" / "checks" / "2026_09_24_data_retention_gedrag.sql")
    tekst = check.read_text(encoding="utf-8")
    assert tekst.startswith("-- ALLEEN LOKAAL, NOOIT TEGEN PRODUCTIE")
    for geval in ("heropenen", "closed_at verschuiven", "sluitmoment in de toekomst", "anon",
                  "stopzetten zonder sluitmoment", "stopgezet aanmaken zonder sluitmoment",
                  "sluitmoment in het verleden bij sluiten", "sluitmoment in het verleden bij aanmaken",
                  "sluitmoment in het verleden invullen op oude inactieve meting",
                  "besluit bijwerken op opgeschoonde meting", "via ouderrij op opgeschoonde meting",
                  "routerelatie met opgeschoonde meting als doel",
                  "directe verbinding (de opschoning)"):
        assert geval in tekst, geval


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
    assert "if old.closed_at is not null then" in schema
    # Het blok in schema.sql is de migratie zonder de kopcommentaarregels.
    migratie_zonder_kop = _sql().split("\n\n", 1)[1].strip()
    assert migratie_zonder_kop in schema


def test_kolommen_staan_bewust_niet_op_het_orm_model():
    """Een kolom op het model komt in elke SELECT; een niet-gedraaide migratie
    legde op 13 september elk rapport plat. backend/data_retention.py leest ze
    met losse SQL en controleert eerst of ze bestaan."""
    assert "data_purged_at" not in Campaign.__table__.columns
    assert "retention_months" not in Organization.__table__.columns
