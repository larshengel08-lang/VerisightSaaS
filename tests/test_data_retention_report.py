"""Een rapportaanvraag na de opschoning geeft een nette melding (fixronde 24-9, Deel C).
SQLite via de gedeelde fixtures; nooit productie."""
from datetime import datetime, timezone

import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend import data_retention as dr
from backend.models import Campaign, Organization, OrganizationSecret


def _campagne(db: Session, *, met_kolom: bool, opgeschoond: bool,
              slug: str = "org-410", api_key: str | None = None) -> str:
    if met_kolom:
        db.execute(text("alter table campaigns add column data_purged_at timestamp"))
    org = Organization(name="Org", slug=slug, contact_email="hr@org.nl")
    db.add(org)
    db.flush()
    if api_key:
        db.add(OrganizationSecret(org_id=org.id, api_key=api_key))
    camp = Campaign(organization=org, name="Meting", scan_type="retention", is_active=False,
                    closed_at=datetime(2025, 1, 1, tzinfo=timezone.utc))
    db.add(camp)
    db.commit()
    if opgeschoond:
        db.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                   {"ts": datetime(2027, 1, 2, 3, 0), "id": camp.id})
        db.commit()
    return camp.id


def _assert_melding(detail: str) -> None:
    assert "zijn op 2 januari 2027 verwijderd" in detail
    assert "Een nieuw rapport maken kan daarom niet meer." in detail
    assert "blijft geldig" in detail


def test_interne_rapportroute_geeft_410_met_reden(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    res = client.get("/api/internal/campaigns/" + cid + "/report")
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


def test_interne_segment_export_geeft_ook_410(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    res = client.get("/api/internal/campaigns/" + cid + "/report?format=segment_summary")
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


def test_klantroute_geeft_410_met_reden(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True, api_key="key-410")
    res = client.get("/api/campaigns/" + cid + "/report", headers={"x-api-key": "key-410"})
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


def test_andere_organisatie_krijgt_404_en_geen_410(client, db_session: Session):
    """Autorisatie eerst: wie de meting niet mag zien, leert via de 410 niet
    dat ze bestaat of is opgeschoond."""
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True, api_key="key-eigen")
    ander = Organization(name="Ander", slug="ander-410", contact_email="hr@ander.nl")
    db_session.add(ander)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=ander.id, api_key="key-ander"))
    db_session.commit()
    res = client.get("/api/campaigns/" + cid + "/report", headers={"x-api-key": "key-ander"})
    assert res.status_code == 404
    assert "verwijderd" not in res.text


@pytest.mark.parametrize("pad", ["/api/internal/campaigns/{id}/report",
                                 "/api/campaigns/{id}/report-preview",
                                 "/api/campaigns/{id}/report-html"])
def test_admin_routes_eerst_token_dan_410(client, db_session: Session, monkeypatch, pad):
    monkeypatch.setenv("BACKEND_ADMIN_TOKEN", "geheim")
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    zonder = client.get(pad.format(id=cid))
    assert zonder.status_code == 403
    assert "verwijderd" not in zonder.text
    met = client.get(pad.format(id=cid), headers={"x-admin-token": "geheim"})
    assert met.status_code == 410
    _assert_melding(met.json()["detail"])


def test_preview_geeft_ook_410(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    res = client.get("/api/campaigns/" + cid + "/report-preview")
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


def test_report_html_geeft_ook_410(client, db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    res = client.get("/api/campaigns/" + cid + "/report-html")
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


def test_zonder_kolom_of_zonder_opschoning_geen_410(db_session: Session):
    cid = _campagne(db_session, met_kolom=False, opgeschoond=False)
    dr.ensure_report_data_available(db_session, cid)   # geen uitzondering


def test_met_kolom_maar_niet_opgeschoond_geen_410(db_session: Session):
    cid = _campagne(db_session, met_kolom=True, opgeschoond=False)
    dr.ensure_report_data_available(db_session, cid)   # geen uitzondering


def test_niet_opgeschoonde_meting_gaat_door_naar_de_rapportgeneratie(client, db_session: Session):
    """Zonder opschoning geen 410: de preview komt bij de gewone rapportgeneratie
    (die hier op een lege meting 422 of 200 geeft, maar nooit 410)."""
    cid = _campagne(db_session, met_kolom=True, opgeschoond=False)
    res = client.get("/api/campaigns/" + cid + "/report-preview")
    assert res.status_code != 410


def test_generate_report_pdf_weigert_ook_rechtstreeks(db_session: Session):
    from backend.main import _generate_report_pdf
    cid = _campagne(db_session, met_kolom=True, opgeschoond=True)
    with pytest.raises(dr.ReportDataPurged):
        _generate_report_pdf(cid, db_session)
