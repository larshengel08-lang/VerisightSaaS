"""Opschoning van leads en leerdossiers na twee jaar zonder contact (fixronde
24-9, Deel C, amendement A4 punt 2; Taak 17b).

Altijd tegen een in-memory SQLite, nooit tegen productie. contact_requests,
pilot_learning_dossiers en pilot_learning_checkpoints staan op het ORM-model;
action_center_review_decisions (verwijst naar een checkpoint) niet en krijgt
hier een minimale vorm.
"""
from datetime import date, datetime, timezone

import pytest
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from backend import data_retention as dr
from backend.models import (
    CampaignDeliveryRecord, ContactRequest, PilotLearningCheckpoint, PilotLearningDossier,
)
from tests.test_data_retention import VANDAAG, _engine, _gesloten, _meting

OUD = _gesloten(2026, 1, 1)          # verloopt 1 januari 2028, ruim voor VANDAAG (15 juni 2028)
RECENT = _gesloten(2027, 3, 1)       # verloopt 1 maart 2029

PII = ("Sanne", "sanne@", "Bakkerij", "Piet", "Jansen", "lead.nl")


@pytest.fixture()
def fabriek():
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("create table action_center_review_decisions (id varchar(36) primary key, "
                         "route_source_id char(36), checkpoint_id char(36) not null, "
                         "created_at timestamp, updated_at timestamp)"))
    yield sessionmaker(bind=engine, autocommit=False, autoflush=False)
    engine.dispose()


def _lead(fabriek, *, created: datetime | None = OUD, **tijden) -> str:
    db = fabriek()
    lead = ContactRequest(name="Sanne de Vries", work_email="sanne@lead.nl",
                          organization="Bakkerij Jansen", employee_count="100 - 150",
                          current_question="Piet vertrekt, wat nu?", created_at=created, **tijden)
    db.add(lead)
    db.commit()
    lid = lead.id
    db.close()
    return lid


def _dossier(fabriek, *, created: datetime = OUD, updated: datetime = OUD,
             checkpoints: tuple[tuple[datetime, datetime], ...] = ((OUD, OUD),),
             lead_id: str | None = None) -> str:
    db = fabriek()
    dossier = PilotLearningDossier(title="Pilot Bakkerij Jansen", lead_contact_name="Sanne de Vries",
                                   lead_organization_name="Bakkerij Jansen",
                                   lead_work_email="sanne@lead.nl", buyer_question="Piet vertrekt",
                                   contact_request_id=lead_id, created_at=created, updated_at=updated)
    db.add(dossier)
    db.flush()
    sleutels = ("lead_route_hypothesis", "implementation_intake", "launch_output")
    for sleutel, (c_at, u_at) in zip(sleutels, checkpoints):
        db.add(PilotLearningCheckpoint(dossier_id=dossier.id, checkpoint_key=sleutel,
                                       owner_label="Sanne", qualitative_notes="Piet zei nee",
                                       created_at=c_at, updated_at=u_at))
    db.commit()
    did = dossier.id
    db.close()
    return did


def _bestaat(fabriek, model, rid) -> bool:
    db = fabriek()
    try:
        return db.get(model, rid) is not None
    finally:
        db.close()


def _status(lijst, rid) -> str:
    return next(c.status for c in lijst if c.id == rid)


def _checkpoints(fabriek, did) -> int:
    db = fabriek()
    try:
        return db.query(PilotLearningCheckpoint).filter_by(dossier_id=did).count()
    finally:
        db.close()


# --- Leads ------------------------------------------------------------------

def test_lead_zonder_contact_in_twee_jaar_wordt_verwijderd_ook_als_hij_klant_werd(fabriek):
    # Geen uitzondering voor leads die tot een organisatie leidden: de
    # koppeling in de levering en in een (jonger) dossier gaat leeg, de rest blijft.
    lid = _lead(fabriek)
    cid, _org = _meting(fabriek, slug="klant", gesloten=None, actief=True)
    db = fabriek()
    rec = db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one()
    rec.contact_request_id = lid
    db.commit()
    db.close()
    oud_dossier = _dossier(fabriek, lead_id=lid)

    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    lead = next(c for c in rapport.leads if c.id == lid)
    assert lead.status == "opgeschoond"
    assert lead.tellingen == {"campaign_delivery_records.contact_request_id": 1,
                              "pilot_learning_dossiers.contact_request_id": 1}
    assert not _bestaat(fabriek, ContactRequest, lid)
    db = fabriek()
    assert db.query(CampaignDeliveryRecord).filter_by(campaign_id=cid).one().contact_request_id is None
    db.close()
    assert _status(rapport.dossiers, oud_dossier) == "opgeschoond"


@pytest.mark.parametrize("waar", ["dossier", "checkpoint"])
def test_lead_met_een_recent_gekoppeld_dossier_blijft_staan(fabriek, waar):
    # Het dossier bewaart een kopie van naam en e-mail van de lead: zolang het
    # dossier leeft, telt zijn laatste contact ook voor de lead.
    lid = _lead(fabriek)
    if waar == "dossier":
        did = _dossier(fabriek, updated=RECENT, checkpoints=(), lead_id=lid)
    else:
        did = _dossier(fabriek, checkpoints=((OUD, RECENT),), lead_id=lid)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    lead = next(c for c in rapport.leads if c.id == lid)
    assert lead.status == "binnen_termijn" and lead.laatste_contact == date(2027, 3, 1)
    assert _bestaat(fabriek, ContactRequest, lid)
    db = fabriek()
    assert db.get(PilotLearningDossier, did).contact_request_id == lid
    db.close()


@pytest.mark.parametrize("kolom", ["last_contacted_at", "qualification_reviewed_at",
                                   "commercial_agreement_confirmed_at",
                                   "commercial_readiness_reviewed_at"])
def test_lead_met_een_recent_contact_blijft_staan(fabriek, kolom):
    lid = _lead(fabriek, created=_gesloten(2024, 1, 1), **{kolom: RECENT})
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    lead = next(c for c in rapport.leads if c.id == lid)
    assert lead.status == "binnen_termijn"
    assert lead.laatste_contact == date(2027, 3, 1)
    assert _bestaat(fabriek, ContactRequest, lid)


def test_grens_laatste_contact_in_nederlandse_tijd_min_een_cronperiode(fabriek):
    # Laatste contact 15 juni 2026 om 23:30 UTC = 16 juni 01:30 Nederlandse
    # tijd: termijn loopt af op 16 juni 2028; de maandelijkse run pakt hem
    # vanaf 16 mei 2028 (zelfde vooruitblik als bij metingen).
    lid = _lead(fabriek, created=_gesloten(2025, 1, 1),
                last_contacted_at=datetime(2026, 6, 15, 23, 30, tzinfo=timezone.utc))
    binnen = dr.opschonen_contacten(fabriek, vandaag=date(2028, 5, 15), apply=False)
    assert _status(binnen.leads, lid) == "binnen_termijn"
    verlopen = dr.opschonen_contacten(fabriek, vandaag=date(2028, 5, 16), apply=False)
    lead = next(c for c in verlopen.leads if c.id == lid)
    assert lead.status == "verlopen"
    assert lead.laatste_contact == date(2028 - 2, 6, 16)
    assert lead.verloopt_op == date(2028, 6, 16)
    assert "vooruitblik" in lead.reden


def test_dry_run_schrijft_niets_en_telt_wel(fabriek):
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=False)
    assert _status(rapport.leads, lid) == "verlopen"
    dossier = next(c for c in rapport.dossiers if c.id == did)
    assert dossier.status == "verlopen"
    assert dossier.tellingen["checkpoints"] == 1
    assert _bestaat(fabriek, ContactRequest, lid)
    assert _bestaat(fabriek, PilotLearningDossier, did) and _checkpoints(fabriek, did) == 1


def test_dry_run_zet_elke_sessie_op_alleen_lezen_en_apply_niet(fabriek, monkeypatch):
    _lead(fabriek)
    _dossier(fabriek)
    sessies, alleen_lezen = [], []

    def tellende_fabriek():
        db = fabriek()
        sessies.append(db)
        return db

    monkeypatch.setattr(dr, "_alleen_lezen", lambda db: alleen_lezen.append(db))
    dr.opschonen_contacten(tellende_fabriek, vandaag=VANDAAG, apply=False)
    assert len(sessies) == 3                      # inventaris + lead + dossier
    assert alleen_lezen == sessies
    sessies.clear()
    alleen_lezen.clear()
    dr.opschonen_contacten(tellende_fabriek, vandaag=VANDAAG, apply=True)
    assert len(sessies) == 3 and alleen_lezen == []


def test_tweede_run_doet_niets(fabriek):
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    blijft = _lead(fabriek, created=RECENT)
    eerste = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(eerste.leads, lid) == "opgeschoond"
    assert _status(eerste.dossiers, did) == "opgeschoond"
    tweede = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert [(c.id, c.status) for c in tweede.leads] == [(blijft, "binnen_termijn")]
    assert tweede.dossiers == []


def _kale_leadtabel(engine, kolommen: tuple[str, ...]) -> None:
    """Een contact_requests met alleen deze tijdstempelkolommen, allemaal nullable
    (op Postgres is created_at nullable; het ORM maakt hem op SQLite NOT NULL)."""
    with engine.begin() as con:
        con.execute(text("drop table contact_requests"))
        con.execute(text("create table contact_requests (id char(36) primary key, name varchar(120)"
                         + "".join(", " + k + " timestamp" for k in kolommen) + ")"))


ZONDER, OUDE = "44444444-4444-4444-4444-444444444444", "55555555-5555-5555-5555-555555555555"


def test_lead_zonder_enig_tijdstempel_wordt_niet_geraakt_en_is_rood(capsys):
    engine = _engine()
    _kale_leadtabel(engine, dr.LEAD_TIJDSTEMPELS)
    with engine.begin() as con:
        con.execute(text("insert into contact_requests (id, name) values (:i, 'Sanne')"), {"i": ZONDER})
        con.execute(text("insert into contact_requests (id, name, created_at) values "
                         "(:i, 'Piet', '2026-01-01 10:00:00')"), {"i": OUDE})
    fabriek = sessionmaker(bind=engine)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert _status(rapport.leads, ZONDER) == "zonder_datum"
    assert _status(rapport.leads, OUDE) == "opgeschoond"          # NULL's tellen niet mee
    assert rapport.onvolledig == []
    with engine.connect() as con:
        assert con.execute(text("select id from contact_requests")).scalars().all() == [ZONDER]
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert "ZONDER DATUM" in uit and ("lead=" + ZONDER) in uit and "Sanne" not in uit
    engine.dispose()


def test_ontbrekende_tijdstempelkolom_slaat_leads_over_en_is_rood(capsys):
    # Zonder last_contacted_at zou elke oude lead verlopen lijken, ook als er
    # gisteren nog contact was. Een ontbrekende kolom is geen lege waarde.
    engine = _engine()
    _kale_leadtabel(engine, ("created_at",))
    with engine.begin() as con:
        con.execute(text("insert into contact_requests (id, name, created_at) values "
                         "(:i, 'Piet', '2026-01-01 10:00:00')"), {"i": OUDE})
    fabriek = sessionmaker(bind=engine)
    did = _dossier(fabriek)                                     # dossiers gaan gewoon door
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert rapport.leads == []
    assert rapport.onvolledig == ["tabel contact_requests mist last_contacted_at, "
                                  "qualification_reviewed_at, commercial_agreement_confirmed_at, "
                                  "commercial_readiness_reviewed_at; leads overgeslagen"]
    assert _status(rapport.dossiers, did) == "opgeschoond"
    for argv in ([], ["--apply"]):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 1
        uit = capsys.readouterr().out
        assert "LET OP: tabel contact_requests mist last_contacted_at" in uit
        assert ("lead=" + OUDE) not in uit
    with engine.connect() as con:
        assert con.execute(text("select id from contact_requests")).scalars().all() == [OUDE]
    engine.dispose()


def test_ontbrekende_tijdstempelkolom_bij_dossiers_slaat_dossiers_en_leads_over():
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("create table action_center_review_decisions (id varchar(36) primary key, "
                         "checkpoint_id char(36) not null, created_at timestamp)"))
    fabriek = sessionmaker(bind=engine)
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert rapport.leads == [] and rapport.dossiers == []
    assert rapport.onvolledig == ["tabel action_center_review_decisions mist updated_at; "
                                  "dossiers en leads overgeslagen"]
    assert _bestaat(fabriek, ContactRequest, lid) and _bestaat(fabriek, PilotLearningDossier, did)
    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 1
    engine.dispose()


def test_reviewtabel_zonder_checkpoint_id_hoeft_geen_tijdstempels():
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("create table action_center_review_decisions (id varchar(36) primary key, "
                         "route_source_id char(36))"))
    fabriek = sessionmaker(bind=engine)
    did = _dossier(fabriek)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert rapport.onvolledig == [] and _status(rapport.dossiers, did) == "opgeschoond"
    engine.dispose()


# --- Leerdossiers -------------------------------------------------------------

def test_dossier_zonder_contact_wordt_met_checkpoints_verwijderd(fabriek):
    did = _dossier(fabriek, checkpoints=((OUD, OUD), (OUD, OUD)))
    db = fabriek()
    cps = [c.id for c in db.query(PilotLearningCheckpoint).filter_by(dossier_id=did)]
    db.execute(text("insert into action_center_review_decisions values ('rd-1', null, :c, :t, :t)"),
               {"c": cps[0], "t": OUD})
    db.execute(text("insert into action_center_review_decisions values ('rd-2', null, :c, :t, :t)"),
               {"c": "33333333-3333-3333-3333-333333333333", "t": OUD})
    db.commit()
    db.close()
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    dossier = next(c for c in rapport.dossiers if c.id == did)
    assert dossier.status == "opgeschoond"
    assert dossier.tellingen == {"checkpoints": 2, "action_center_review_decisions.checkpoint_id": 1}
    assert not _bestaat(fabriek, PilotLearningDossier, did)
    assert _checkpoints(fabriek, did) == 0
    db = fabriek()
    assert db.execute(text("select id from action_center_review_decisions")).scalars().all() == ["rd-2"]
    db.close()


@pytest.mark.parametrize("welke", ["created", "updated"])
def test_dossier_met_een_recent_checkpoint_blijft_staan(fabriek, welke):
    recent = (RECENT, OUD) if welke == "created" else (OUD, RECENT)
    did = _dossier(fabriek, checkpoints=((OUD, OUD), recent))
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    dossier = next(c for c in rapport.dossiers if c.id == did)
    assert dossier.status == "binnen_termijn"
    assert dossier.laatste_contact == date(2027, 3, 1)
    assert _bestaat(fabriek, PilotLearningDossier, did) and _checkpoints(fabriek, did) == 2


@pytest.mark.parametrize("kolom", ["created_at", "updated_at"])
def test_oud_dossier_met_een_recent_reviewbesluit_blijft_staan(fabriek, kolom):
    did = _dossier(fabriek)
    db = fabriek()
    cp = db.query(PilotLearningCheckpoint).filter_by(dossier_id=did).one().id
    tijden = {"created_at": OUD, "updated_at": OUD, kolom: RECENT}
    db.execute(text("insert into action_center_review_decisions values ('rd-r', null, :c, :a, :u)"),
               {"c": cp, "a": tijden["created_at"], "u": tijden["updated_at"]})
    db.commit()
    db.close()
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    dossier = next(c for c in rapport.dossiers if c.id == did)
    assert dossier.status == "binnen_termijn" and dossier.laatste_contact == date(2027, 3, 1)
    assert _bestaat(fabriek, PilotLearningDossier, did) and _checkpoints(fabriek, did) == 1
    db = fabriek()
    assert db.execute(text("select count(*) from action_center_review_decisions")).scalar() == 1
    db.close()


def test_dossier_met_recente_eigen_wijziging_blijft_staan(fabriek):
    did = _dossier(fabriek, updated=RECENT)
    assert _status(dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True).dossiers,
                   did) == "binnen_termijn"
    assert _bestaat(fabriek, PilotLearningDossier, did)


# --- Hercontrole, fouten, uitvoer ---------------------------------------------

def test_recent_contact_na_de_inventaris_wordt_niet_gewist(fabriek, monkeypatch):
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    echte = dr._inventaris_contacten

    def inventaris_dan_contact(db, **kw):
        uit = echte(db, **kw)
        andere = fabriek()      # een operator legt tussendoor contact vast
        andere.execute(text("update contact_requests set last_contacted_at = :t where id = :i"),
                       {"t": RECENT, "i": lid})
        andere.add(PilotLearningCheckpoint(dossier_id=did, checkpoint_key="follow_up_review",
                                           owner_label="Loep", created_at=RECENT, updated_at=RECENT))
        andere.commit()
        andere.close()
        return uit

    monkeypatch.setattr(dr, "_inventaris_contacten", inventaris_dan_contact)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    lead = next(c for c in rapport.leads if c.id == lid)
    dossier = next(c for c in rapport.dossiers if c.id == did)
    assert lead.status == "fout" and lead.fout == "ContactVeranderd: nu binnen_termijn"
    assert dossier.status == "fout" and dossier.fout == "ContactVeranderd: nu binnen_termijn"
    assert _bestaat(fabriek, ContactRequest, lid)
    assert _bestaat(fabriek, PilotLearningDossier, did) and _checkpoints(fabriek, did) == 2


def test_contact_via_reviewbesluit_of_gekoppeld_dossier_na_de_inventaris(fabriek, monkeypatch):
    lid = _lead(fabriek)
    gekoppeld = _dossier(fabriek, checkpoints=(), lead_id=lid)
    did = _dossier(fabriek)
    echte = dr._inventaris_contacten

    def inventaris_dan_contact(db, **kw):
        uit = echte(db, **kw)
        andere = fabriek()
        cp = andere.query(PilotLearningCheckpoint).filter_by(dossier_id=did).one().id
        andere.execute(text("insert into action_center_review_decisions values ('rd-n', null, :c, :t, :t)"),
                       {"c": cp, "t": RECENT})
        andere.execute(text("update pilot_learning_dossiers set updated_at = :t where id = :d"),
                       {"t": RECENT, "d": gekoppeld})
        andere.commit()
        andere.close()
        return uit

    monkeypatch.setattr(dr, "_inventaris_contacten", inventaris_dan_contact)
    rapport = dr.opschonen_contacten(fabriek, vandaag=VANDAAG, apply=True)
    assert next(c for c in rapport.leads if c.id == lid).fout == "ContactVeranderd: nu binnen_termijn"
    assert next(c for c in rapport.dossiers if c.id == did).fout == "ContactVeranderd: nu binnen_termijn"
    assert _bestaat(fabriek, ContactRequest, lid) and _bestaat(fabriek, PilotLearningDossier, did)


def test_contact_veranderd_is_geen_meting_veranderd():
    assert not issubclass(dr.ContactVeranderd, dr.MetingVeranderd)
    assert issubclass(dr.ContactVeranderd, dr.EenheidVeranderd)
    assert issubclass(dr.MetingVeranderd, dr.EenheidVeranderd)
    assert dr._foutcode(dr.MetingVeranderd("open")) == "MetingVeranderd: nu open"


def test_fout_in_een_lead_rolt_alleen_die_terug(fabriek, monkeypatch, capsys, caplog):
    kapot = _lead(fabriek)
    goed = _lead(fabriek)
    echte = dr._schoon_lead_op

    class NepDbFout(Exception):
        pgcode = "23503"

    def soms_kapot(db, lead_id):
        echte(db, lead_id)
        if lead_id == kapot:
            raise NepDbFout("DETAIL: Failing row contains (Sanne de Vries, sanne@lead.nl)")

    monkeypatch.setattr(dr, "_schoon_lead_op", soms_kapot)
    with caplog.at_level("DEBUG", logger="backend.data_retention"):
        assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert _bestaat(fabriek, ContactRequest, kapot)          # teruggerold
    assert not _bestaat(fabriek, ContactRequest, goed)
    regel = next(r for r in uit.splitlines() if kapot in r)
    assert regel.startswith("FOUT") and "NepDbFout pgcode=23503 (teruggedraaid)" in regel
    log = caplog.text + "".join(str(r.exc_info) + str(r.args) for r in caplog.records)
    for tekst in (uit, log):
        for verboden in PII + ("Failing row",):
            assert verboden not in tekst, verboden
    assert kapot in log


def test_cli_uitvoer_bevat_alleen_ids_datums_en_aantallen(fabriek, capsys):
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    blijft = _lead(fabriek, created=RECENT)
    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 0
    droog = capsys.readouterr().out
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    echt = capsys.readouterr().out
    for uit in (droog, echt):
        assert ("lead=" + lid) in uit and ("dossier=" + did) in uit and ("lead=" + blijft) in uit
        for verboden in PII + ("Pilot", "wat nu", "100 - 150"):
            assert verboden not in uit, verboden
        regels = uit.splitlines()
        # De samenvatting van de metingen blijft de laatste regel (C.3);
        # de samenvatting van leads en dossiers staat er direct boven.
        assert regels[-1].startswith("SAMENVATTING (")
        assert regels[-2].startswith("SAMENVATTING LEADS EN DOSSIERS (")
    assert "dry-run: niets gewijzigd" in droog
    assert ("SAMENVATTING LEADS EN DOSSIERS (dry-run): leads: 1 verlopen, 0 opgeschoond, "
            "1 binnen de termijn, 0 zonder datum, 0 fouten; dossiers: 1 verlopen, 0 opgeschoond, "
            "0 binnen de termijn, 0 zonder datum, 0 fouten.") in droog
    assert "leads: 0 verlopen, 1 opgeschoond" in echt and "dossiers: 0 verlopen, 1 opgeschoond" in echt
    # Tweede run: niets te doen, exitcode 0.
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    tweede = capsys.readouterr().out
    assert ("lead=" + lid) not in tweede and ("dossier=" + did) not in tweede


def test_op_verzoek_raakt_geen_leads_of_dossiers(fabriek, capsys):
    lid = _lead(fabriek)
    did = _dossier(fabriek)
    cid, org = _meting(fabriek, slug="ov", gesloten=_gesloten(2025, 1, 1))
    for argv in (["--apply", "--campagne", cid], ["--apply", "--organisatie", org]):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 0
        uit = capsys.readouterr().out
        assert "lead=" not in uit and "dossier=" not in uit and "LEADS EN DOSSIERS" not in uit
    assert _bestaat(fabriek, ContactRequest, lid) and _bestaat(fabriek, PilotLearningDossier, did)


def test_cli_zonder_migratie_raakt_ook_geen_leads(capsys):
    engine = _engine(migratie=False)
    fabriek = sessionmaker(bind=engine)
    lid = _lead(fabriek)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 2
    assert _bestaat(fabriek, ContactRequest, lid)
    # De dry-run toont de leads wel: die hebben de migratie niet nodig.
    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 0
    assert ("lead=" + lid) in capsys.readouterr().out
    engine.dispose()


def test_ontbrekende_tabel_wordt_gemeld_en_overgeslagen(capsys):
    engine = _engine()
    with engine.begin() as con:
        con.execute(text("drop table pilot_learning_checkpoints"))
        con.execute(text("drop table pilot_learning_dossiers"))
    fabriek = sessionmaker(bind=engine)
    lid = _lead(fabriek)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    assert "LET OP: tabel pilot_learning_dossiers bestaat niet" in uit
    assert ("lead=" + lid) in uit and not _bestaat(fabriek, ContactRequest, lid)
    engine.dispose()
