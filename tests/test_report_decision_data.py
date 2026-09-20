"""Het besluit van het MT in de rapportdata (plan 3b, spec 16-9 par. 7 en 11).

Bron is de tabel campaign_decisions, een rij per meting, geschreven door de
frontend. De backend leest alleen. Ontbreekt de tabel (migratie niet gedraaid),
dan valt het rapport niet om maar zegt de data dat het besluit niet te lezen was.
"""
import logging
from datetime import date

from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import Session

from backend.models import Campaign, CampaignDecision
from backend.report_decision import load_decision
from backend.report_html import build_report_data
from tests.test_report_meetgegevens import _campagne


def _cid(db: Session) -> str:
    return _campagne(db, comms_mode="self_send", completed=12, rows=12,
                     invited_count=20, launch_date=date(2026, 3, 9), closed_at=None)


def _besluit(db: Session, cid: str, **velden) -> None:
    camp = db.query(Campaign).filter(Campaign.id == cid).one()
    basis = dict(campaign_id=cid, organization_id=camp.organization_id,
                 decided_at=date(2026, 4, 2), primary_topic="Groeiperspectief",
                 primary_action="Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.",
                 owner="Sanne de Vries", follow_up_date=date(2026, 6, 15))
    basis.update(velden)
    db.add(CampaignDecision(**basis))
    db.commit()


def test_zonder_rij_is_er_geen_besluit(db_session: Session):
    cid = _cid(db_session)
    assert load_decision(db_session, cid) == (None, False)


def test_rij_komt_terug_als_dict_met_alle_velden(db_session: Session):
    cid = _cid(db_session)
    _besluit(db_session, cid, secondary_topic="Werkdruk", secondary_action="Piekrooster herzien.",
             feedback_plan="HR vertelt het in het teamoverleg van mei.",
             success_criterion="Iedereen heeft een afspraak op papier.")
    besluit, unavailable = load_decision(db_session, cid)
    assert unavailable is False
    assert besluit["primary_topic"] == "Groeiperspectief"
    assert besluit["primary_action"].startswith("Elke leidinggevende")
    assert besluit["owner"] == "Sanne de Vries"
    assert besluit["decided_at"] == date(2026, 4, 2)
    assert besluit["follow_up_date"] == date(2026, 6, 15)
    assert besluit["secondary_topic"] == "Werkdruk"
    assert besluit["feedback_plan"].startswith("HR vertelt")
    assert besluit["success_criterion"].startswith("Iedereen")
    assert besluit["updated_at"] is not None
    # Wie het vastlegde is een gebruikers-id en hoort niet in een klant-PDF.
    assert "recorded_by" not in besluit


def test_een_lege_rij_telt_niet_als_besluit(db_session: Session):
    """De frontend weigert een besluit zonder 'wat precies', maar een rij die
    toch leeg is mag geen voorgedrukte lege pagina met 'Vastgelegd op' opleveren."""
    cid = _cid(db_session)
    _besluit(db_session, cid, decided_at=None, primary_topic="", primary_action="  ",
             owner="", follow_up_date=None)
    assert load_decision(db_session, cid) == (None, False)


def test_ontbrekende_tabel_legt_het_rapport_niet_plat(db_session: Session, caplog):
    cid = _cid(db_session)
    CampaignDecision.__table__.drop(bind=db_session.get_bind())
    with caplog.at_level(logging.ERROR, logger="backend.report_decision"):
        besluit, unavailable = load_decision(db_session, cid)
    assert (besluit, unavailable) == (None, True)
    assert "campaign_decisions" in caplog.text
    # De sessie is na de rollback nog bruikbaar: het rapport moet verder kunnen.
    assert db_session.query(Campaign).filter(Campaign.id == cid).count() == 1


def test_programmingerror_wordt_ook_afgevangen(db_session: Session, caplog, monkeypatch):
    """De docstring van load_decision claimt ook het Postgres-gedrag
    (ProgrammingError, bijvoorbeeld 'relation ... does not exist' of een
    ontbrekende kolom); de andere test raakt alleen SQLite's OperationalError."""
    cid = _cid(db_session)
    rollback_calls: list[bool] = []
    origineel_rollback = db_session.rollback

    def _rollback_gespied():
        rollback_calls.append(True)
        origineel_rollback()

    def _boom(*args, **kwargs):
        raise ProgrammingError(
            "select * from campaign_decisions",
            None,
            Exception('relation "campaign_decisions" does not exist'),
        )

    monkeypatch.setattr(db_session, "query", _boom)
    monkeypatch.setattr(db_session, "rollback", _rollback_gespied)
    with caplog.at_level(logging.ERROR, logger="backend.report_decision"):
        besluit, unavailable = load_decision(db_session, cid)
    assert (besluit, unavailable) == (None, True)
    assert "campaign_decisions" in caplog.text
    assert "does not exist" in caplog.text
    assert rollback_calls == [True]


def test_build_report_data_levert_het_besluit(db_session: Session):
    cid = _cid(db_session)
    _besluit(db_session, cid)
    data = build_report_data(cid, db_session)
    assert data["decision"]["owner"] == "Sanne de Vries"
    assert data["decision_unavailable"] is False


def test_build_report_data_zonder_besluit(db_session: Session):
    data = build_report_data(_cid(db_session), db_session)
    assert data["decision"] is None
    assert data["decision_unavailable"] is False


def test_campaign_model_draagt_previous_campaign_id_nog_niet():
    """Bewust: een kolom in het model zit in elke SELECT op campaigns. Staat de
    migratie nog niet op productie, dan valt elke campagnequery om (incident
    2026-09-13). Plan 3c voegt de kolom toe zodra hij gebruikt wordt."""
    assert "previous_campaign_id" not in Campaign.__table__.columns
