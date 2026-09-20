"""Noemer en meetdatums uit het delivery record (spec 11-9 par. 4.6, spec 16-9 par. 4 blok 6).

De noemer-logica bestaat sinds ronde 2 (_respons_noemer); deze tests pinnen het
self_send-pad expliciet, zodat het niet stil kan terugvallen op len(respondents)
en een verzonnen 100% kan tonen. De datums zijn nieuw: launch_date (delivery
record) en closed_at (campagne), als Nederlandse tekst of None. Nooit een
verzonnen datum.
"""
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from backend.models import Campaign, CampaignDeliveryRecord, Organization, Respondent, SurveyResponse
from backend.report_html import _datum_nl, build_report_data


def _campagne(db: Session, *, comms_mode: str, completed: int, rows: int,
              invited_count: int | None, launch_date: date | None,
              closed_at: datetime | None) -> str:
    org = Organization(name="TestOrg", slug="testorg", contact_email="hr@test.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type="retention",
                    comms_mode=comms_mode, closed_at=closed_at)
    db.add(camp)
    db.flush()
    if invited_count is not None or launch_date is not None:
        db.add(CampaignDeliveryRecord(organization_id=org.id, campaign_id=camp.id,
                                      invited_count=invited_count, launch_date=launch_date))
    for i in range(rows):
        klaar = i < completed
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker", completed=klaar)
        db.add(r)
        if klaar:
            db.add(SurveyResponse(
                respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                risk_score=5.5, risk_band="MIDDEN"))
    db.commit()
    return camp.id


def test_datum_nl_formatteert_nederlands():
    assert _datum_nl(date(2026, 3, 9)) == "9 maart 2026"
    assert _datum_nl(None) is None


def test_datum_nl_leest_timestamps_in_nederlandse_tijd():
    # closed_at is UTC; de kalenderdag moet de Nederlandse zijn.
    assert _datum_nl(datetime(2026, 4, 30, 23, 59, tzinfo=timezone.utc)) == "1 mei 2026"
    # naive datetime telt als UTC
    assert _datum_nl(datetime(2026, 4, 30, 23, 59)) == "1 mei 2026"
    # 29 maart 2026 is de laatste zondag van maart: 30 maart 22:30 UTC = 31 maart 00:30 CEST
    assert _datum_nl(datetime(2026, 3, 30, 22, 30, tzinfo=timezone.utc)) == "31 maart 2026"
    # winter: UTC+1
    assert _datum_nl(datetime(2026, 1, 15, 23, 30, tzinfo=timezone.utc)) == "16 januari 2026"
    # DST-grens: 25 oktober 2026 00:30 UTC is nog zomertijd (02:30 CEST)
    assert _datum_nl(datetime(2026, 10, 25, 0, 30, tzinfo=timezone.utc)) == "25 oktober 2026"
    # net na de grens: 25 oktober 23:30 UTC = 26 oktober 00:30 CET
    assert _datum_nl(datetime(2026, 10, 25, 23, 30, tzinfo=timezone.utc)) == "26 oktober 2026"
    # vóór de maartgrens (wintertijd): 29 maart 00:30 UTC = 01:30 CET
    assert _datum_nl(datetime(2026, 3, 29, 0, 30, tzinfo=timezone.utc)) == "29 maart 2026"


def test_self_send_gebruikt_het_vastgelegde_aantal(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=39, rows=39,
                    invited_count=58, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] == 58
    assert data["completion_pct"] == 67.2
    assert data["n_invited_note"] == ""


def test_self_send_zonder_aantal_verzint_geen_honderd_procent(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=39, rows=39,
                    invited_count=None, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] is None
    assert data["completion_pct"] is None
    assert "niet vaststellen hoeveel mensen zijn uitgenodigd" in data["n_invited_note"]


def test_datums_uit_delivery_record_en_campagne(db_session: Session):
    cid = _campagne(db_session, comms_mode="self_send", completed=12, rows=12,
                    invited_count=20, launch_date=date(2026, 3, 9),
                    closed_at=datetime(2026, 3, 30, 12, 0, tzinfo=timezone.utc))
    data = build_report_data(cid, db_session)
    assert data["period_start"] == "9 maart 2026"
    assert data["period_end"] == "30 maart 2026"


def test_ontbrekende_datums_zijn_none_niet_verzonnen(db_session: Session):
    cid = _campagne(db_session, comms_mode="managed", completed=12, rows=15,
                    invited_count=None, launch_date=None, closed_at=None)
    data = build_report_data(cid, db_session)
    assert data["period_start"] is None
    assert data["period_end"] is None


def test_nederlandse_dag_heeft_een_bron():
    """Plan 3b: de eigen zomertijdregel uit 3a is weg; het rapport en de
    sluitdatum van de survey lezen dezelfde tijdzone."""
    from backend import report_html, survey_window
    assert not hasattr(report_html, "_laatste_zondag_utc")
    assert report_html.AMSTERDAM is survey_window.AMSTERDAM
