"""Opschoning na de bewaartermijn (fixronde 24-9, Deel C).

Altijd tegen een in-memory SQLite, nooit tegen productie. De twee kolommen van
de migratie staan niet op het ORM-model; de fixture voegt ze toe zoals de
migratie dat op Postgres doet. Twee tabellen buiten het ORM
(campaign_action_audit_events, action_center_manager_responses) krijgen een
minimale vorm, zodat de verwijdering ervan getest wordt.
"""
from datetime import date, datetime, timezone

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import data_retention as dr
from backend.database import Base
from backend.models import (
    Campaign, CampaignDecision, CampaignDeliveryRecord, Organization, Respondent, SurveyResponse,
)

VANDAAG = date(2028, 6, 15)


def _engine(*, migratie: bool = True, extra_tabellen: bool = True):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    with engine.begin() as con:
        if migratie:
            con.execute(text("alter table campaigns add column data_purged_at timestamp"))
            con.execute(text("alter table organizations add column retention_months integer"))
        if extra_tabellen:
            con.execute(text("create table campaign_action_audit_events "
                             "(id varchar(36) primary key, campaign_id char(36) not null)"))
            con.execute(text("create table action_center_manager_responses "
                             "(id varchar(36) primary key, campaign_id char(36) not null)"))
    return engine


@pytest.fixture()
def fabriek():
    engine = _engine()
    yield sessionmaker(bind=engine, autocommit=False, autoflush=False)
    engine.dispose()


def _meting(fabriek, *, slug: str, gesloten: datetime | None, actief: bool = False,
            n: int = 3, termijn: int | None = None) -> tuple[str, str]:
    db = fabriek()
    org = Organization(name="Org " + slug, slug=slug, contact_email="hr@" + slug + ".nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Meting " + slug, scan_type="retention",
                    is_active=actief, closed_at=gesloten)
    db.add(camp)
    db.flush()
    for i in range(n):
        r = Respondent(campaign=camp, department="Zorg", completed=True,
                       email="persoon" + str(i) + "@" + slug + ".nl")
        db.add(r)
        db.add(SurveyResponse(respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                              pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                              open_text_raw="Mijn leidinggevende Piet luistert niet.",
                              risk_score=5.5, risk_band="MIDDEN"))
    db.add(CampaignDeliveryRecord(organization_id=org.id, campaign_id=camp.id, invited_count=10,
                                  operator_notes="Gebeld met Sanne", customer_handoff_note="Sanne",
                                  self_send_config={"senderName": "Sanne de Vries"}))
    db.add(CampaignDecision(campaign_id=camp.id, organization_id=org.id,
                            primary_topic="Groeiperspectief", primary_action="Sanne plant gesprekken",
                            owner="Sanne de Vries", success_criterion="Iedereen heeft een gesprek"))
    db.flush()
    db.execute(text("insert into campaign_action_audit_events (id, campaign_id) values (:i, :c)"),
               {"i": "a-" + slug, "c": camp.id})
    db.execute(text("insert into action_center_manager_responses (id, campaign_id) values (:i, :c)"),
               {"i": "m-" + slug, "c": camp.id})
    if termijn is not None:
        db.execute(text("update organizations set retention_months = :t where id = :o"),
                   {"t": termijn, "o": org.id})
    db.commit()
    ids = (camp.id, org.id)
    db.close()
    return ids


def _tel(fabriek, campaign_id: str) -> dict[str, int]:
    db = fabriek()
    try:
        resp_ids = [r.id for r in db.query(Respondent).filter(Respondent.campaign_id == campaign_id)]
        return {
            "respondenten": len(resp_ids),
            "antwoorden": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).count() if resp_ids else 0,
            "audit": db.execute(text("select count(*) from campaign_action_audit_events where campaign_id = :c"),
                                {"c": campaign_id}).scalar(),
            "action_center": db.execute(text("select count(*) from action_center_manager_responses where campaign_id = :c"),
                                        {"c": campaign_id}).scalar(),
        }
    finally:
        db.close()


def _gesloten(jaar: int, maand: int, dag: int) -> datetime:
    return datetime(jaar, maand, dag, 10, 0, tzinfo=timezone.utc)


def _status(rapport, campaign_id: str) -> str:
    return next(m.status for m in rapport.metingen if m.campaign_id == campaign_id)


def test_verlopen_meting_wordt_opgeschoond(fabriek):
    cid, _org = _meting(fabriek, slug="a", gesloten=_gesloten(2026, 5, 1))
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "opgeschoond"
    assert _tel(fabriek, cid) == {"respondenten": 0, "antwoorden": 0, "audit": 0, "action_center": 0}
    db = fabriek()
    rec = db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one()
    assert rec.invited_count == 10
    assert rec.operator_notes is None and rec.customer_handoff_note is None
    assert rec.self_send_config == {}
    besluit = db.get(CampaignDecision, cid)
    assert besluit.primary_topic == "Groeiperspectief"
    assert besluit.owner == "" and besluit.primary_action == "" and besluit.success_criterion == ""
    assert db.get(Campaign, cid) is not None
    assert dr.data_purged_at(db, cid) is not None
    db.close()


def test_niets_jonger_dan_de_termijn_wordt_geraakt(fabriek):
    # Termijn loopt af op 1 augustus 2028, na de vooruitblik (15 juli 2028).
    cid, _ = _meting(fabriek, slug="b", gesloten=_gesloten(2026, 8, 1))
    voor = _tel(fabriek, cid)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "binnen_termijn"
    assert _tel(fabriek, cid) == voor


def test_grens_valt_op_de_dag_zelf_in_nederlandse_tijd_min_een_cronperiode(fabriek):
    # Gesloten op 15 juni 2026 om 23:30 UTC = 16 juni 01:30 Nederlandse tijd,
    # dus de termijn loopt af op 16 juni 2028. De maandelijkse run schoont op
    # zodra dat binnen een maand valt: vanaf 16 mei 2028.
    assert dr.VOORUITBLIK_MAANDEN == 1
    cid, _ = _meting(fabriek, slug="c", gesloten=datetime(2026, 6, 15, 23, 30, tzinfo=timezone.utc))
    binnen = dr.opschonen(fabriek, vandaag=date(2028, 5, 15), apply=False)
    assert _status(binnen, cid) == "binnen_termijn"
    verlopen = dr.opschonen(fabriek, vandaag=date(2028, 5, 16), apply=False)
    assert _status(verlopen, cid) == "verlopen"
    meting = next(m for m in verlopen.metingen if m.campaign_id == cid)
    assert meting.verloopt_op == date(2028, 6, 16)    # de echte einddatum, niet de vooruitblik


def test_maandelijkse_run_is_nooit_te_laat(fabriek):
    # Runs op de 1e van elke maand: elke termijn die tussen twee runs afloopt,
    # is bij de eerste van die twee al opgeschoond.
    cid, _ = _meting(fabriek, slug="c2", gesloten=_gesloten(2026, 6, 20))   # verloopt 20 juni 2028
    assert _status(dr.opschonen(fabriek, vandaag=date(2028, 5, 1), apply=False), cid) == "binnen_termijn"
    assert _status(dr.opschonen(fabriek, vandaag=date(2028, 6, 1), apply=False), cid) == "verlopen"


def test_open_metingen_nooit_ook_niet_op_verzoek(fabriek):
    lopend, _ = _meting(fabriek, slug="d", gesloten=None, actief=True)
    zonder_datum, _ = _meting(fabriek, slug="e", gesloten=None, actief=False)
    oud_maar_actief, _ = _meting(fabriek, slug="f", gesloten=_gesloten(2024, 1, 1), actief=True)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, lopend) == "open"
    assert _status(rapport, oud_maar_actief) == "open"
    assert _status(rapport, zonder_datum) == "gestopt_zonder_sluitdatum"
    for cid in (lopend, zonder_datum, oud_maar_actief):
        assert _tel(fabriek, cid)["respondenten"] == 3
    op_verzoek = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True,
                              campagne_ids=[lopend, zonder_datum])
    assert _status(op_verzoek, lopend) == "geweigerd_open"
    assert _status(op_verzoek, zonder_datum) == "geweigerd_open"
    for cid in (lopend, zonder_datum):
        assert _tel(fabriek, cid)["respondenten"] == 3


def test_andere_organisaties_nooit(fabriek):
    a, org_a = _meting(fabriek, slug="g", gesloten=_gesloten(2027, 1, 1))   # binnen termijn
    b, _ = _meting(fabriek, slug="h", gesloten=_gesloten(2025, 1, 1))       # verlopen, andere org
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, organisatie_ids=[org_a])
    assert [m.campaign_id for m in rapport.metingen] == [a]
    assert _status(rapport, a) == "opgeschoond"                          # op verzoek: termijn telt niet
    assert _tel(fabriek, b)["respondenten"] == 3


def test_tweede_run_doet_niets(fabriek):
    cid, _ = _meting(fabriek, slug="i", gesloten=_gesloten(2026, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    db = fabriek()
    eerste = dr.data_purged_at(db, cid)
    db.close()
    tweede = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(tweede, cid) == "al_opgeschoond"
    db = fabriek()
    assert dr.data_purged_at(db, cid) == eerste
    db.close()


def test_dry_run_schrijft_niets_en_telt_wel(fabriek):
    cid, _ = _meting(fabriek, slug="j", gesloten=_gesloten(2026, 1, 1), n=4)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    meting = next(m for m in rapport.metingen if m.campaign_id == cid)
    assert meting.status == "verlopen"
    assert meting.tellingen["respondenten"] == 4
    assert meting.tellingen["open_tekst"] == 4
    assert _tel(fabriek, cid)["respondenten"] == 4
    db = fabriek()
    assert dr.data_purged_at(db, cid) is None
    db.close()


def test_afwijkende_termijn_per_organisatie(fabriek):
    lang, _ = _meting(fabriek, slug="k", gesloten=_gesloten(2026, 1, 1), termijn=36)
    kort, _ = _meting(fabriek, slug="l", gesloten=_gesloten(2027, 5, 1), termijn=12)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    assert _status(rapport, lang) == "binnen_termijn"
    assert _status(rapport, kort) == "verlopen"


def test_apply_zonder_migratie_weigert_dry_run_zegt_het():
    engine = _engine(migratie=False)
    fabriek = sessionmaker(bind=engine)
    cid, _ = _meting(fabriek, slug="m", gesloten=_gesloten(2025, 1, 1))
    with pytest.raises(dr.RetentieMigratieOntbreekt):
        dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    assert rapport.migratie_gedraaid is False
    assert _status(rapport, cid) == "verlopen"
    assert _tel(fabriek, cid)["respondenten"] == 3
    engine.dispose()


def test_ontbrekende_tabel_buiten_het_orm_wordt_overgeslagen():
    engine = _engine(extra_tabellen=False)
    fabriek = sessionmaker(bind=engine)
    db = fabriek()
    org = Organization(name="Org n", slug="n", contact_email="hr@n.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Meting n", scan_type="retention", is_active=False,
                    closed_at=_gesloten(2025, 1, 1))
    db.add(camp)
    db.commit()
    cid = camp.id
    db.close()
    assert _status(dr.opschonen(fabriek, vandaag=VANDAAG, apply=True), cid) == "opgeschoond"
    engine.dispose()


def test_fout_in_een_meting_rolt_alleen_die_terug(fabriek, monkeypatch):
    kapot, _ = _meting(fabriek, slug="o", gesloten=_gesloten(2025, 1, 1))
    goed, _ = _meting(fabriek, slug="p", gesloten=_gesloten(2025, 1, 1))
    echte = dr._schoon_op

    def soms_kapot(db, campaign_id, nu):
        echte(db, campaign_id, nu)
        if campaign_id == kapot:
            raise RuntimeError("testfout")

    monkeypatch.setattr(dr, "_schoon_op", soms_kapot)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, kapot) == "fout"
    assert _tel(fabriek, kapot)["respondenten"] == 3          # teruggerold
    assert _status(rapport, goed) == "opgeschoond"
    assert _tel(fabriek, goed)["respondenten"] == 0


def test_onbekende_campagne_op_verzoek_is_een_regel(fabriek):
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False,
                           campagne_ids=["00000000-0000-0000-0000-000000000001"])
    assert [(m.campaign_id, m.status) for m in rapport.metingen] == [
        ("00000000-0000-0000-0000-000000000001", "onbekend")]


def test_plus_maanden_klemt_op_de_laatste_dag():
    assert dr._plus_maanden(date(2026, 1, 31), 1) == date(2026, 2, 28)
    assert dr._plus_maanden(date(2028, 2, 29), 12) == date(2029, 2, 28)
    assert dr._plus_maanden(date(2026, 3, 15), 24) == date(2028, 3, 15)


# --- Aanvullend: alle tabellen buiten het ORM, verzoekargumenten, CLI ---------

def test_alle_tabellen_buiten_het_orm_worden_per_meting_opgeschoond():
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("create table action_center_route_actions "
                         "(id varchar(36) primary key, campaign_id char(36) not null)"))
        con.execute(text("create table action_center_route_relations (id varchar(36) primary key, "
                         "source_campaign_id char(36) not null, target_campaign_id char(36) not null)"))
        con.execute(text("create table action_center_review_decisions "
                         "(id varchar(36) primary key, route_source_id char(36) not null)"))
    fabriek = sessionmaker(bind=engine)
    oud, _ = _meting(fabriek, slug="q", gesloten=_gesloten(2025, 1, 1))
    jong, _ = _meting(fabriek, slug="r", gesloten=_gesloten(2028, 1, 1))
    with engine.begin() as con:
        for cid, tag in ((oud, "oud"), (jong, "jong")):
            con.execute(text("insert into action_center_route_actions values (:i, :c)"),
                        {"i": "ra-" + tag, "c": cid})
            con.execute(text("insert into action_center_review_decisions values (:i, :c)"),
                        {"i": "rd-" + tag, "c": cid})
        # Een relatie tussen de oude meting (bron) en de jonge (doel), en omgekeerd.
        con.execute(text("insert into action_center_route_relations values ('rr-1', :a, :b)"),
                    {"a": oud, "b": jong})
        con.execute(text("insert into action_center_route_relations values ('rr-2', :a, :b)"),
                    {"a": jong, "b": oud})
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, oud) == "opgeschoond"
    assert _status(rapport, jong) == "binnen_termijn"
    with engine.connect() as con:
        def tel(sql):
            return con.execute(text(sql)).scalar()
        assert tel("select count(*) from action_center_route_actions") == 1
        assert tel("select campaign_id from action_center_route_actions") == jong
        assert tel("select count(*) from action_center_review_decisions") == 1
        assert tel("select count(*) from action_center_route_relations") == 0
        assert tel("select count(*) from campaign_action_audit_events") == 1
        assert tel("select count(*) from action_center_manager_responses") == 1
    engine.dispose()


def test_campagne_en_organisatie_samen_wordt_geweigerd(fabriek):
    cid, org = _meting(fabriek, slug="s", gesloten=_gesloten(2025, 1, 1))
    with pytest.raises(ValueError):
        dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, campagne_ids=[cid], organisatie_ids=[org])
    assert _tel(fabriek, cid)["respondenten"] == 3
    with pytest.raises(SystemExit) as exc:
        dr.main(["--campagne", cid, "--organisatie", org], session_factory=fabriek, vandaag=VANDAAG)
    assert exc.value.code == 2


def test_cli_zonder_migratie_apply_exitcode_2_en_dry_run_zegt_het_bovenaan(capsys):
    engine = _engine(migratie=False)
    fabriek = sessionmaker(bind=engine)
    cid, _ = _meting(fabriek, slug="t", gesloten=_gesloten(2025, 1, 1))
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 2
    uit = capsys.readouterr().out
    assert "GESTOPT" in uit and dr.MIGRATIE in uit
    assert _tel(fabriek, cid)["respondenten"] == 3

    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 0
    regels = capsys.readouterr().out.splitlines()
    let_op = next(i for i, r in enumerate(regels) if r.startswith("LET OP"))
    eerste_meting = next(i for i, r in enumerate(regels) if cid in r)
    assert let_op < eerste_meting
    assert "24 maanden" in regels[let_op]
    assert regels[-1].startswith("SAMENVATTING (dry-run)")
    engine.dispose()


def test_cli_uitvoer_bevat_alleen_ids_datums_en_aantallen(fabriek, capsys):
    cid, org = _meting(fabriek, slug="u", gesloten=_gesloten(2025, 1, 1))
    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 0
    droog = capsys.readouterr().out
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    echt = capsys.readouterr().out
    for uit in (droog, echt):
        assert cid in uit and org in uit
        for verboden in ("Piet", "Sanne", "persoon0", "@u.nl", "Org u", "Meting u",
                         "Groeiperspectief", "Zorg"):
            assert verboden not in uit, verboden
    assert "dry-run: niets gewijzigd" in droog
    assert "OPGESCHOOND" in echt and "SAMENVATTING (opgeschoond)" in echt
    # Tweede run: niets te doen, exitcode 0.
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    assert "AL OPGESCHOOND" in capsys.readouterr().out


def test_cli_onbekende_of_open_meting_op_verzoek_geeft_exitcode_1(fabriek, capsys):
    lopend, _ = _meting(fabriek, slug="v", gesloten=None, actief=True)
    assert dr.main(["--campagne", "00000000-0000-0000-0000-000000000002"],
                   session_factory=fabriek, vandaag=VANDAAG) == 1
    assert dr.main(["--apply", "--campagne", lopend], session_factory=fabriek, vandaag=VANDAAG) == 1
    assert "GEWEIGERD" in capsys.readouterr().out
    assert _tel(fabriek, lopend)["respondenten"] == 3


def test_cli_fout_in_een_meting_geeft_exitcode_1(fabriek, monkeypatch, capsys):
    cid, _ = _meting(fabriek, slug="w", gesloten=_gesloten(2025, 1, 1))

    def kapot(db, campaign_id, nu):
        raise RuntimeError("testfout")

    monkeypatch.setattr(dr, "_schoon_op", kapot)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    assert "(teruggedraaid)" in capsys.readouterr().out
    assert _tel(fabriek, cid)["respondenten"] == 3


def test_dry_run_op_postgres_opent_een_read_only_transactie():
    uitgevoerd = []

    class Nep:
        def get_bind(self):
            class Bind:
                class dialect:
                    name = "postgresql"
            return Bind()

        def execute(self, stmt, *args, **kwargs):
            uitgevoerd.append(str(stmt))

    dr._alleen_lezen(Nep())
    assert uitgevoerd == ["SET TRANSACTION READ ONLY"]


def test_dry_run_zet_elke_sessie_op_alleen_lezen_en_apply_niet(fabriek, monkeypatch):
    _meting(fabriek, slug="x", gesloten=_gesloten(2025, 1, 1))
    _meting(fabriek, slug="y", gesloten=_gesloten(2025, 2, 1))
    sessies, alleen_lezen = [], []

    def tellende_fabriek():
        db = fabriek()
        sessies.append(db)
        return db

    monkeypatch.setattr(dr, "_alleen_lezen", lambda db: alleen_lezen.append(db))
    dr.opschonen(tellende_fabriek, vandaag=VANDAAG, apply=False)
    assert len(sessies) == 3                      # inventaris + twee metingen
    assert alleen_lezen == sessies
    sessies.clear()
    alleen_lezen.clear()
    dr.opschonen(tellende_fabriek, vandaag=VANDAAG, apply=True)
    assert len(sessies) == 3 and alleen_lezen == []


# --- Review 25-9: race, dekking, statussen, geen persoonsgegevens in fouten ---

from backend.models import CampaignDeliveryCheckpoint  # noqa: E402


def test_heropend_na_de_inventaris_wordt_niet_gewist(fabriek, monkeypatch):
    cid, _ = _meting(fabriek, slug="race", gesloten=_gesloten(2025, 1, 1))
    echte = dr._inventaris

    def inventaris_dan_heropenen(db, **kw):
        uit = echte(db, **kw)
        andere = fabriek()          # een operator heropent de meting tussendoor
        andere.execute(text("update campaigns set is_active = 1, closed_at = null where id = :c"),
                       {"c": cid})
        andere.commit()
        andere.close()
        return uit

    monkeypatch.setattr(dr, "_inventaris", inventaris_dan_heropenen)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    meting = next(m for m in rapport.metingen if m.campaign_id == cid)
    assert meting.status == "fout"
    assert meting.fout.startswith("MetingVeranderd")
    assert _tel(fabriek, cid)["respondenten"] == 3
    db = fabriek()
    assert dr.data_purged_at(db, cid) is None
    db.close()


def test_verlengde_termijn_na_de_inventaris_wordt_niet_gewist(fabriek, monkeypatch):
    cid, org = _meting(fabriek, slug="race2", gesloten=_gesloten(2026, 1, 1))
    echte = dr._inventaris

    def inventaris_dan_verlengen(db, **kw):
        uit = echte(db, **kw)
        andere = fabriek()
        andere.execute(text("update organizations set retention_months = 60 where id = :o"), {"o": org})
        andere.commit()
        andere.close()
        return uit

    monkeypatch.setattr(dr, "_inventaris", inventaris_dan_verlengen)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "fout"
    assert _tel(fabriek, cid)["respondenten"] == 3


def test_purge_markering_is_voorwaardelijk(fabriek, monkeypatch):
    # Zou de hercontrole iets missen: de markering zet alleen van leeg naar
    # gevuld, en 0 geraakte rijen rolt alles terug.
    cid, _ = _meting(fabriek, slug="cond", gesloten=_gesloten(2025, 1, 1))

    def al_door_een_ander_opgeschoond(db, m, **kw):
        db.execute(text("update campaigns set data_purged_at = '2028-01-01 00:00:00' where id = :c"),
                   {"c": cid})

    monkeypatch.setattr(dr, "_controleer_opnieuw", al_door_een_ander_opgeschoond)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "fout"
    assert _tel(fabriek, cid)["respondenten"] == 3


def test_extra_action_center_tabellen_via_route_source_id():
    tabellen = ("action_center_follow_through_mail_events", "action_center_graph_calendar_links",
                "action_center_review_schedule_revisions", "action_center_adoption_events",
                "action_center_bounded_execution_events", "action_center_review_rhythm_configs",
                "action_center_governance_interventions")
    for tabel in tabellen:
        assert (tabel, "route_source_id") in dr.NIET_ORM_TABELLEN
    engine = _engine()
    with engine.begin() as con:
        for tabel in tabellen:
            con.execute(text("create table " + tabel + " (id varchar(60) primary key, "
                             "route_source_id char(36) not null)"))
    fabriek = sessionmaker(bind=engine)
    oud, _ = _meting(fabriek, slug="rs1", gesloten=_gesloten(2025, 1, 1))
    jong, _ = _meting(fabriek, slug="rs2", gesloten=_gesloten(2028, 1, 1))
    with engine.begin() as con:
        for tabel in tabellen:
            for cid in (oud, jong):
                con.execute(text("insert into " + tabel + " values (:i, :c)"),
                            {"i": tabel + cid[:8], "c": cid})
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, oud) == "opgeschoond"
    with engine.connect() as con:
        for tabel in tabellen:
            rest = con.execute(text("select route_source_id from " + tabel)).scalars().all()
            assert rest == [jong], tabel
    engine.dispose()


def test_onbekende_organisatie_is_een_regel_en_exitcode_1(fabriek, capsys):
    _meting(fabriek, slug="z", gesloten=_gesloten(2025, 1, 1))
    onbekend = "11111111-1111-1111-1111-111111111111"
    assert dr.main(["--apply", "--organisatie", onbekend], session_factory=fabriek,
                   vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert "ONBEKEND" in uit and ("organisatie=" + onbekend) in uit
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False, organisatie_ids=[onbekend])
    assert [(o.organization_id, o.status) for o in rapport.organisaties] == [(onbekend, "onbekend")]


def test_organisatie_zonder_metingen_krijgt_een_eigen_regel(fabriek, capsys):
    db = fabriek()
    org = Organization(name="Leeg", slug="leeg", contact_email="hr@leeg.nl")
    db.add(org)
    db.commit()
    oid = org.id
    db.close()
    assert dr.main(["--organisatie", oid], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    assert "organisatie=" + oid in uit and "geen metingen" in uit
    assert "Leeg" not in uit


def test_fouttekst_bevat_geen_persoonsgegevens(fabriek, monkeypatch, capsys, caplog):
    cid, _ = _meting(fabriek, slug="pii", gesloten=_gesloten(2025, 1, 1))

    class NepDbFout(Exception):
        pgcode = "23514"

    def kapot(db, campaign_id, nu):
        raise NepDbFout("new row violates check constraint\n"
                        "DETAIL: Failing row contains (Sanne de Vries, sanne@pii.nl)")

    monkeypatch.setattr(dr, "_schoon_op", kapot)
    with caplog.at_level("DEBUG", logger="backend.data_retention"):
        assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    log = caplog.text + "".join(str(r.exc_info) + str(r.args) for r in caplog.records)
    for tekst in (uit, log):
        assert "Sanne" not in tekst and "sanne@" not in tekst and "Failing row" not in tekst
    assert "NepDbFout pgcode=23514" in uit
    assert cid in log
    meting = next(m for m in dr.opschonen(fabriek, vandaag=VANDAAG, apply=True).metingen
                  if m.campaign_id == cid)
    assert meting.fout == "NepDbFout pgcode=23514"


def test_pgcode_uit_de_sqlalchemy_wrapper():
    class Orig(Exception):
        pgcode = "40001"

    from sqlalchemy.exc import OperationalError
    fout = OperationalError("update ...", {"naam": "Sanne"}, Orig("Sanne"))
    assert dr._foutcode(fout) == "OperationalError pgcode=40001"
    assert dr._foutcode(RuntimeError("Sanne")) == "RuntimeError"


def test_gestopt_zonder_sluitdatum_telt_mee_en_kleurt_de_periodieke_run_rood(fabriek, capsys):
    # Zonder sluitmoment kan de termijn nooit verlopen: de maandelijkse run
    # blijft rood tot iemand er een sluitmoment op zet.
    cid, _ = _meting(fabriek, slug="gz", gesloten=None, actief=False)
    for argv in (["--apply"], []):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 1
        uit = capsys.readouterr().out
        assert "GESTOPT" in uit and cid in uit
        assert "1 gestopt zonder sluitdatum" in uit.splitlines()[-1]
    assert _tel(fabriek, cid)["respondenten"] == 3
    # Op verzoek: weigeren zoals altijd (ook exitcode 1).
    assert dr.main(["--apply", "--campagne", cid], session_factory=fabriek, vandaag=VANDAAG) == 1
    assert "GEWEIGERD" in capsys.readouterr().out
    # Met een sluitmoment is de run weer groen.
    db = fabriek()
    db.execute(text("update campaigns set closed_at = :t where id = :c"),
               {"t": _gesloten(2028, 6, 1), "c": cid})
    db.commit()
    db.close()
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0


def test_heropend_na_opschoning_is_zichtbaar_en_wordt_niet_opnieuw_geraakt(fabriek, capsys):
    cid, _ = _meting(fabriek, slug="hn", gesloten=_gesloten(2025, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    db = fabriek()
    eerste = dr.data_purged_at(db, cid)
    db.execute(text("update campaigns set is_active = 1 where id = :c"), {"c": cid})
    db.commit()
    db.close()
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "heropend_na_opschoning"
    op_verzoek = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, campagne_ids=[cid])
    assert _status(op_verzoek, cid) == "heropend_na_opschoning"
    db = fabriek()
    assert dr.data_purged_at(db, cid) == eerste
    db.close()
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    assert "HEROPEND" in uit and "1 heropend na opschoning" in uit.splitlines()[-1]


def test_alle_vrije_tekstvelden_worden_leeg(fabriek):
    cid, _ = _meting(fabriek, slug="vv", gesloten=_gesloten(2025, 1, 1))
    db = fabriek()
    rec = db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one()
    rec.next_step = "Sanne bellen"
    rec.participant_comms_config = {"senderName": "Sanne"}
    rec.self_send_reminders = [{"id": "r1", "kind": "reminder"}]
    db.add(CampaignDeliveryCheckpoint(delivery_record_id=rec.id, checkpoint_key="launch",
                                      operator_note="Sanne belt", last_auto_summary="Sanne zei ja"))
    besluit = db.get(CampaignDecision, cid)
    besluit.secondary_topic = "Werkdruk"
    besluit.secondary_action = "Piet regelt"
    besluit.feedback_plan = "Sanne mailt iedereen"
    besluit.recorded_by = "22222222-2222-2222-2222-222222222222"
    db.commit()
    db.close()

    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)

    db = fabriek()
    rec = db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one()
    assert rec.next_step is None
    assert rec.participant_comms_config == {} and rec.self_send_reminders == []
    cp = db.query(CampaignDeliveryCheckpoint).filter_by(delivery_record_id=rec.id).one()
    assert cp.operator_note is None and cp.last_auto_summary is None
    assert cp.checkpoint_key == "launch"
    besluit = db.get(CampaignDecision, cid)
    assert besluit.secondary_action == "" and besluit.feedback_plan == ""
    assert besluit.recorded_by is None
    assert besluit.secondary_topic == "Werkdruk"      # labels blijven
    db.close()


def test_opnieuw_gesloten_na_opschoning_is_rood_en_wordt_niet_automatisch_gewist(fabriek, capsys):
    cid, _ = _meting(fabriek, slug="og", gesloten=_gesloten(2025, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    db = fabriek()
    eerste = dr.data_purged_at(db, cid)
    # Een operator heropent de meting, er komen nieuwe antwoorden, en hij sluit weer.
    db.add(Respondent(campaign_id=cid, department="Zorg", completed=True))
    db.execute(text("update campaigns set is_active = 0, closed_at = :t where id = :c"),
               {"t": datetime(2028, 6, 1, 9, 0), "c": cid})
    db.commit()
    db.close()

    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, cid) == "opnieuw_gesloten_na_opschoning"
    op_verzoek = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, campagne_ids=[cid])
    assert _status(op_verzoek, cid) == "opnieuw_gesloten_na_opschoning"
    assert _tel(fabriek, cid)["respondenten"] == 1          # nieuwe antwoorden blijven
    db = fabriek()
    assert dr.data_purged_at(db, cid) == eerste
    db.close()

    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert "OPNIEUW GESLOTEN" in uit and cid in uit
    assert "1 opnieuw gesloten na opschoning" in uit.splitlines()[-1]
    assert _tel(fabriek, cid)["respondenten"] == 1


def test_opgeschoond_en_niet_heropend_blijft_al_opgeschoond(fabriek):
    # closed_at van voor de opschoning: gewoon al opgeschoond, exitcode 0.
    cid, _ = _meting(fabriek, slug="ao", gesloten=_gesloten(2025, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(dr.opschonen(fabriek, vandaag=VANDAAG, apply=True), cid) == "al_opgeschoond"
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0


# --- Taak 17b: telemetrie en bewijsregister per meting, weer respondenten -----

def test_telemetrie_en_bewijsregister_van_de_meting_worden_verwijderd():
    assert ("suite_telemetry_events", "campaign_id") in dr.NIET_ORM_TABELLEN
    assert ("case_proof_registry", "campaign_id") in dr.NIET_ORM_TABELLEN
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("create table suite_telemetry_events (id varchar(36) primary key, "
                         "campaign_id char(36), payload text)"))
        con.execute(text("create table case_proof_registry (id varchar(36) primary key, "
                         "campaign_id char(36), summary text not null, claimable_observation text)"))
    fabriek = sessionmaker(bind=engine)
    oud, _ = _meting(fabriek, slug="tp1", gesloten=_gesloten(2025, 1, 1))
    jong, _ = _meting(fabriek, slug="tp2", gesloten=_gesloten(2028, 1, 1))
    with engine.begin() as con:
        for cid, tag in ((oud, "oud"), (jong, "jong"), (None, "los")):
            con.execute(text("insert into suite_telemetry_events values (:i, :c, :p)"),
                        {"i": "t-" + tag, "c": cid, "p": '{"door": "Sanne"}'})
            con.execute(text("insert into case_proof_registry values (:i, :c, :s, :o)"),
                        {"i": "p-" + tag, "c": cid, "s": "Sanne zag verbetering", "o": "Piet bleef"})
    droog = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    meting = next(m for m in droog.metingen if m.campaign_id == oud)
    assert meting.tellingen["suite_telemetry_events.campaign_id"] == 1
    assert meting.tellingen["case_proof_registry.campaign_id"] == 1
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport, oud) == "opgeschoond"
    with engine.connect() as con:
        for tabel in ("suite_telemetry_events", "case_proof_registry"):
            rest = sorted(r[0] for r in con.execute(text("select id from " + tabel)))
            assert len(rest) == 2 and not any(r.endswith("-oud") for r in rest), tabel
    engine.dispose()


def _purge_en_nieuwe_respondent(fabriek, slug):
    cid, _ = _meting(fabriek, slug=slug, gesloten=_gesloten(2025, 1, 1))
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    db = fabriek()
    eerste = dr.data_purged_at(db, cid)
    # Heropend en weer gesloten zonder dat closed_at verschoof: closed_at ligt
    # nog steeds vóór data_purged_at, maar er staat een nieuwe respondent bij.
    db.add(Respondent(campaign_id=cid, department="Zorg", completed=True,
                      email="nieuw@" + slug + ".nl"))
    db.commit()
    db.close()
    return cid, eerste


def test_weer_respondenten_na_opschoning_is_rood_ook_met_oude_sluitdatum(fabriek, capsys):
    cid, eerste = _purge_en_nieuwe_respondent(fabriek, "wr")
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    meting = next(m for m in rapport.metingen if m.campaign_id == cid)
    assert meting.status == "opnieuw_gesloten_na_opschoning"
    assert meting.tellingen["respondenten"] == 1
    op_verzoek = dr.opschonen(fabriek, vandaag=VANDAAG, apply=True, campagne_ids=[cid])
    assert _status(op_verzoek, cid) == "opnieuw_gesloten_na_opschoning"
    assert _tel(fabriek, cid)["respondenten"] == 1
    db = fabriek()
    assert dr.data_purged_at(db, cid) == eerste
    db.close()
    for argv in (["--apply"], []):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 1
        uit = capsys.readouterr().out
        regel = next(r for r in uit.splitlines() if cid in r)
        assert regel.startswith("OPNIEUW GESLOTEN") and "respondenten=1" in regel
        assert "nieuw@wr.nl" not in uit and "Zorg" not in uit
    assert _tel(fabriek, cid)["respondenten"] == 1


def test_heropend_met_nieuwe_respondenten_blijft_heropend(fabriek):
    # Nog open: gewoon zichtbaar als heropend, de meting loopt.
    cid, _ = _purge_en_nieuwe_respondent(fabriek, "hr2")
    db = fabriek()
    db.execute(text("update campaigns set is_active = 1 where id = :c"), {"c": cid})
    db.commit()
    db.close()
    assert _status(dr.opschonen(fabriek, vandaag=VANDAAG, apply=True), cid) == "heropend_na_opschoning"


def test_al_opgeschoond_telt_eerst_alleen_respondenten(fabriek, monkeypatch):
    # De volledige tellingen alleen als er weer respondenten staan.
    leeg, _ = _meting(fabriek, slug="ta1", gesloten=_gesloten(2025, 1, 1))
    weer, _ = _purge_en_nieuwe_respondent(fabriek, "ta2")
    dr.opschonen(fabriek, vandaag=VANDAAG, apply=True)
    geteld = []
    echte = dr._tellingen

    def tellingen(db, campaign_id):
        geteld.append(campaign_id)
        return echte(db, campaign_id)

    monkeypatch.setattr(dr, "_tellingen", tellingen)
    rapport = dr.opschonen(fabriek, vandaag=VANDAAG, apply=False)
    assert _status(rapport, leeg) == "al_opgeschoond"
    assert _status(rapport, weer) == "opnieuw_gesloten_na_opschoning"
    assert geteld == [weer]
