"""Mislukte rapportgeneratie komt precies één keer in Sentry, getagd, zonder
persoonsgegevens, en de klant krijgt een vaste melding (spec 2026-10-08, punt 2).

De tests zetten Sentry aan met een vangende transport en de echte FastAPI-
integratie, zodat ook een tweede event van de integratie zelf zou opvallen."""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any
from unittest.mock import patch

import pytest
import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sentry_sdk.transport import Transport
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend import observability
from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse


# Geheimen worden samengesteld, zodat ze nooit letterlijk in de broncode staan:
# Sentry stuurt broncoderegels rond elk stackframe mee (context_line), en een
# letterlijke waarde in deze testfile zou dan een vals alarm geven.
_ADMIN = "ADMIN" + "SECRET"
_KEY = "KEY" + "SECRET"
_TOKEN = "TOKEN" + "SECRET"
_EMAIL = "a" + "@" + "b.nl"
_ORG = "Bos" + "man BV"
_HR_EMAIL = "hr" + "@" + "bosman.nl"
_VERBODEN_REQUEST = (_ADMIN, _KEY, _TOKEN, _EMAIL, _EMAIL.replace("@", "%40"))


class _Vanger(Transport):
    """Vangt events en transacties (performance traces): die laatste gaan niet
    door before_send, dus ze moeten apart bewaakt worden."""

    def __init__(self, options: dict[str, Any] | None = None) -> None:
        super().__init__(options)
        self.events: list[dict[str, Any]] = []
        self.transactions: list[dict[str, Any]] = []

    def capture_envelope(self, envelope) -> None:  # type: ignore[override]
        for item in envelope.items:
            if item.type == "event":
                self.events.append(item.payload.json)
            elif item.type == "transaction":
                self.transactions.append(item.payload.json)


def _start_vanger(traces_sample_rate: float):
    vanger = _Vanger()
    observability.init_sentry(
        dsn="https://publiek@sentry.invalid/1",
        environment="test",
        transport=vanger,
        traces_sample_rate=traces_sample_rate,
    )
    # Bewust: de integratie patcht bij init Starlette-klassen, en Starlette
    # bouwt de middleware-stack lui bij het eerste request. Een stack die een
    # eerdere test al bouwde, mist de patch; leegmaken dwingt een herbouw af.
    from backend.main import app

    app.middleware_stack = None
    try:
        yield vanger
    finally:
        sentry_sdk.flush()
        sentry_sdk.get_client().close()
        # Zelfde eindtoestand als zonder SENTRY_DSN: geen DSN, geen transport,
        # zodat andere tests geen actieve client erven.
        sentry_sdk.init(dsn=None)
        app.middleware_stack = None


@pytest.fixture()
def sentry_vanger():
    yield from _start_vanger(0.0)


@pytest.fixture()
def sentry_vanger_traces():
    yield from _start_vanger(1.0)


def _alles_json(vanger: _Vanger) -> str:
    sentry_sdk.flush()
    return json.dumps({"events": vanger.events, "transactions": vanger.transactions}, default=str)


def test_sentry_opties_sturen_geen_lokale_variabelen_body_of_pii():
    opties = observability.sentry_options(dsn="https://publiek@sentry.invalid/1", environment="test")
    assert opties["send_default_pii"] is False
    assert opties["include_local_variables"] is False
    assert opties["max_request_body_size"] == "never"
    assert opties["before_send"] is observability.scrub_event
    assert opties["before_send_transaction"] is observability.scrub_event


def test_scrub_event_houdt_alleen_methode_en_url_zonder_query():
    event = {
        "transaction": "/api/campaigns/{campaign_id}/report",
        "transaction_info": {"source": "route"},
        "request": {
            "method": "GET",
            "url": "https://api.test/api/campaigns/abc/report",
            "query_string": "format=pdf",
            "headers": {"x-api-key": "geheim", "cookie": "sessie"},
            "cookies": {"sessie": "x"},
            "data": {"open_text": "tekst"},
            "env": {"REMOTE_ADDR": "1.2.3.4"},
        }
    }
    uit = observability.scrub_event(event, {})
    assert uit["request"] == {"method": "GET", "url": "https://api.test/api/campaigns/{campaign_id}/report"}


def test_scrub_event_vervangt_pad_door_routesjabloon():
    event = {
        "transaction": "/survey/{token}",
        "transaction_info": {"source": "route"},
        "request": {"method": "GET", "url": "https://api.test/survey/geheim-token-123?x=1"},
    }
    uit = observability.scrub_event(event, {})
    assert uit["request"] == {"method": "GET", "url": "https://api.test/survey/{token}"}


def test_scrub_event_zonder_routesjabloon_krijgt_vaste_plaatshouder():
    """Zonder gematchte route zet Starlette de volledige ruwe url als
    transactienaam (bron "url"); het token in het pad mag dan nergens blijven."""
    event = {
        "transaction": "https://api.test/onbekend/geheim-token-123",
        "transaction_info": {"source": "url"},
        "request": {"method": "GET", "url": "https://api.test/onbekend/geheim-token-123?x=1"},
    }
    uit = observability.scrub_event(event, {})
    assert uit["request"] == {"method": "GET", "url": "https://api.test/<onbekende route>"}
    assert uit["transaction"] == "/<onbekende route>"


def test_scrub_event_zonder_bron_krijgt_ook_de_plaatshouder():
    event = {
        "transaction": "backend.main.download_report",
        "request": {"method": "GET", "url": "https://api.test/api/campaigns/abc/report"},
    }
    uit = observability.scrub_event(event, {})
    assert uit["request"]["url"] == "https://api.test/<onbekende route>"
    assert uit["transaction"] == "/<onbekende route>"


def test_scrub_event_houdt_alleen_het_sjabloon_van_een_logregel():
    event = {
        "logger": "loep.test",
        "logentry": {
            "message": "fout voor %s",
            "formatted": "fout voor Bosman BV",
            "params": ["Bosman BV"],
        },
    }
    uit = observability.scrub_event(event, {})
    assert uit["logentry"] == {"message": "fout voor %s"}


def test_scrub_event_haalt_tekst_uit_breadcrumbs_behalve_sql():
    event = {
        "breadcrumbs": {
            "values": [
                {"type": "log", "category": "loep.test", "level": "warning",
                 "timestamp": "t", "message": "Bosman BV", "data": {"email": "hr@bosman.nl"}},
                {"type": "default", "category": "query", "message": "SELECT 1", "data": {}},
            ]
        }
    }
    uit = observability.scrub_event(event, {})
    log, query = uit["breadcrumbs"]["values"]
    assert log == {"type": "log", "category": "loep.test", "level": "warning", "timestamp": "t"}
    assert query["message"] == "SELECT 1"


def test_transactie_bevat_geen_headers_query_of_token(sentry_vanger_traces):
    los = FastAPI()

    @los.get("/survey/{token}")
    async def survey(token: str):
        return {"ok": True}

    with TestClient(los) as c:
        res = c.get(
            f"/survey/{_TOKEN}?email={_EMAIL}",
            headers={"x-admin-token": _ADMIN, "x-api-key": _KEY},
        )
        assert res.status_code == 200
    tekst = _alles_json(sentry_vanger_traces)
    assert sentry_vanger_traces.transactions, "geen transactie gevangen: de test bewijst dan niets"
    for verboden in _VERBODEN_REQUEST:
        assert verboden not in tekst, verboden


def test_fout_in_request_bevat_geen_headers_query_of_token(sentry_vanger_traces):
    los = FastAPI()

    @los.get("/survey/{token}")
    async def survey(token: str):
        raise HTTPException(status_code=500, detail="x")

    with TestClient(los) as c:
        res = c.get(
            f"/survey/{_TOKEN}?email={_EMAIL}",
            headers={"x-admin-token": _ADMIN, "x-api-key": _KEY},
        )
        assert res.status_code == 500
    tekst = _alles_json(sentry_vanger_traces)
    assert sentry_vanger_traces.events, "geen event gevangen: de test bewijst dan niets"
    for verboden in _VERBODEN_REQUEST:
        assert verboden not in tekst, verboden


def test_onbekende_route_lekt_geen_token(sentry_vanger_traces):
    los = FastAPI()

    @los.get("/survey/{token}")
    async def survey(token: str):
        return {"ok": True}

    with TestClient(los) as c:
        res = c.get(f"/onbekend/{_TOKEN}?email={_EMAIL}", headers={"x-admin-token": _ADMIN})
        assert res.status_code == 404
    tekst = _alles_json(sentry_vanger_traces)
    assert sentry_vanger_traces.transactions, "geen transactie gevangen: de test bewijst dan niets"
    assert sentry_vanger_traces.transactions[0]["transaction"] == "/<onbekende route>"
    for verboden in _VERBODEN_REQUEST:
        assert verboden not in tekst, verboden


def test_logregel_op_error_niveau_stuurt_alleen_het_sjabloon(sentry_vanger):
    logging.getLogger("loep.test").error("fout voor %s", _ORG)
    tekst = _alles_json(sentry_vanger)
    assert len(sentry_vanger.events) == 1, "de logregel werd geen event: de test bewijst dan niets"
    assert sentry_vanger.events[0]["logentry"] == {"message": "fout voor %s"}
    assert _ORG not in tekst


def test_logregel_komt_niet_via_breadcrumb_in_een_later_event(sentry_vanger):
    with sentry_sdk.new_scope():
        logging.getLogger("loep.test").warning("Contactaanvraag voor %s (%s)", _ORG, _HR_EMAIL)
        try:
            _gooi_renderfout()
        except RuntimeError as exc:
            sentry_sdk.capture_exception(exc)
    tekst = _alles_json(sentry_vanger)
    assert len(sentry_vanger.events) == 1
    # De breadcrumb zelf blijft (categorie, niveau), alleen de tekst gaat eruit.
    crumbs = sentry_vanger.events[0]["breadcrumbs"]["values"]
    assert any(c.get("category") == "loep.test" for c in crumbs)
    for verboden in (_ORG, _HR_EMAIL):
        assert verboden not in tekst, verboden


def _gooi_renderfout() -> None:
    raise RuntimeError("weasyprint: lettertype ontbreekt")


def test_helper_meldt_precies_een_getagd_event_zonder_lokale_variabelen(sentry_vanger):
    """Ook de logregel van de helper mag geen tweede event worden (de
    standaard LoggingIntegration maakt van logger.error anders een event)."""
    try:
        _gooi_renderfout()
    except RuntimeError as exc:
        fout = observability.report_generation_failed(
            exc, campaign_id="meting-1", scan_type="exit", route="klant_pdf"
        )
    sentry_sdk.flush()
    assert fout.reported is True
    assert fout.detail == observability.REPORT_FAILED_REPORTED
    assert not hasattr(fout, "status_code")
    assert len(sentry_vanger.events) == 1, json.dumps(sentry_vanger.events, default=str)
    event = sentry_vanger.events[0]
    assert event["tags"] == {"campaign_id": "meting-1", "scan_type": "exit", "report_route": "klant_pdf"}
    frames = event["exception"]["values"][-1]["stacktrace"]["frames"]
    assert frames
    assert all("vars" not in frame for frame in frames)


def test_helper_zonder_scan_type_tagt_onbekend(sentry_vanger):
    try:
        _gooi_renderfout()
    except RuntimeError as exc:
        observability.report_generation_failed(exc, campaign_id="meting-2", scan_type=None, route="intern_pdf")
    sentry_sdk.flush()
    assert sentry_vanger.events[0]["tags"]["scan_type"] == "onbekend"


def test_helper_zonder_sentry_belooft_geen_melding():
    # Zelfde eindtoestand als na de sentry_vanger-fixture: geen DSN, geen transport.
    sentry_sdk.init(dsn=None)
    try:
        _gooi_renderfout()
    except RuntimeError as exc:
        fout = observability.report_generation_failed(exc, campaign_id="meting-3", scan_type="exit", route="klant_pdf")
    assert fout.reported is False
    assert fout.detail == observability.REPORT_FAILED_UNREPORTED
    assert "hallo@getloep.nl" in fout.detail


def test_meldingen_zonder_streepjes_en_met_vaste_opening():
    for tekst in (observability.REPORT_FAILED_REPORTED, observability.REPORT_FAILED_UNREPORTED):
        assert tekst.startswith(observability.REPORT_FAILED_PREFIX)
        assert "\u2014" not in tekst and "\u2013" not in tekst


def test_controle_integratie_is_actief(sentry_vanger):
    """Zonder dit bewijs zou 'precies één event' ook slagen als de integratie
    in deze testrun niet actief was."""
    los = FastAPI()

    @los.get("/kapot")
    async def kapot():
        raise HTTPException(status_code=500, detail="x")

    with TestClient(los) as c:
        assert c.get("/kapot").status_code == 500
    sentry_sdk.flush()
    assert len(sentry_vanger.events) == 1


# --- Rapportroutes (Task 5) --------------------------------------------------
# Ook hier samengesteld: de geheimen staan in de database van de test, nooit
# letterlijk in deze file (zie de toelichting bij _ADMIN hierboven).
_GEHEIME_ORG = "Bosman " + "Vertrouwelijk BV"
_GEHEIME_METING = "Behoud Q3 " + "Bosman Geheim"
_GEHEIME_TEKST = "Mijn leidinggevende " + "Jan Jansen negeert mij al maanden"
_API_KEY = "sleutel-die-nooit-" + "in-sentry-mag"
_ORG_EMAIL = "hr" + "@" + "bosman-geheim.nl"
_VERBODEN_ROUTE = (_GEHEIME_ORG, _GEHEIME_METING, _GEHEIME_TEKST, _API_KEY, _ORG_EMAIL)


def _meting(db: Session, *, scan_type: str = "retention") -> str:
    """Gesloten meting met één ingevuld antwoord met een open tekst, zodat de
    PII-controle echte gegevens in de database heeft die zouden kunnen lekken."""
    org = Organization(name=_GEHEIME_ORG, slug="org-sentry", contact_email=_ORG_EMAIL)
    db.add(org)
    db.flush()
    db.add(OrganizationSecret(org_id=org.id, api_key=_API_KEY))
    camp = Campaign(organization=org, name=_GEHEIME_METING, scan_type=scan_type, is_active=False,
                    closed_at=datetime(2026, 9, 1, tzinfo=timezone.utc))
    db.add(camp)
    db.flush()
    resp = Respondent(campaign_id=camp.id, completed=True,
                      completed_at=datetime(2026, 8, 1, tzinfo=timezone.utc))
    db.add(resp)
    db.flush()
    db.add(SurveyResponse(respondent_id=resp.id, open_text_raw=_GEHEIME_TEKST))
    db.commit()
    return camp.id


def _renderfout(*args, **kwargs):
    # Bewust zonder persoonsgegevens: de fout zelf mag in Sentry.
    raise RuntimeError("weasyprint: lettertype ontbreekt")


def _assert_een_schoon_event(vanger: _Vanger, *, campaign_id: str, scan_type: str, route: str) -> dict:
    tekst = _alles_json(vanger)
    # Alleen error-events tellen; de vanger houdt transacties apart bij.
    assert len(vanger.events) == 1, tekst
    event = vanger.events[0]
    assert event["tags"]["campaign_id"] == campaign_id
    assert event["tags"]["scan_type"] == scan_type
    assert event["tags"]["report_route"] == route
    assert "lettertype ontbreekt" in tekst  # de foutmelding zit erin
    frames = event["exception"]["values"][-1]["stacktrace"]["frames"]
    assert frames  # en de stacktrace
    for verboden in _VERBODEN_ROUTE:
        assert verboden not in tekst, verboden
    for frame in frames:
        assert "vars" not in frame
    return event


@pytest.fixture()
def zonder_admin_token(monkeypatch):
    # Buiten productie en zonder geconfigureerd token zijn de adminroutes open.
    monkeypatch.delenv("BACKEND_ADMIN_TOKEN", raising=False)


def test_klantroute_pdf_meldt_precies_een_event_en_geeft_vaste_melding(client, db_session, sentry_vanger):
    cid = _meting(db_session)
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    assert "lettertype" not in res.text and cid not in res.text
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="klant_pdf")


def test_interne_route_pdf_meldt_precies_een_event(client, db_session, sentry_vanger, zonder_admin_token):
    cid = _meting(db_session, scan_type="exit")
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/internal/campaigns/{cid}/report")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="exit", route="intern_pdf")


def test_segmentexport_meldt_precies_een_event(client, db_session, sentry_vanger, zonder_admin_token):
    cid = _meting(db_session, scan_type="culture_assessment")
    with patch("backend.report.generate_culture_assessment_segment_summary_export", side_effect=_renderfout):
        res = client.get(f"/api/internal/campaigns/{cid}/report?format=segment_summary")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="culture_assessment", route="intern_segment")


def test_html_preview_en_html_pdf_melden_ook(client, db_session, sentry_vanger, zonder_admin_token):
    cid = _meting(db_session)
    with patch("backend.report_html.build_report_data", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report-preview")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="html_preview")
    sentry_vanger.events.clear()
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report-html")
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    _assert_een_schoon_event(sentry_vanger, campaign_id=cid, scan_type="retention", route="html_pdf")


def test_zonder_sentry_belooft_de_melding_geen_melding(client, db_session):
    sentry_sdk.init(dsn=None)
    cid = _meting(db_session)
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_UNREPORTED}


def test_410_na_opschoning_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    db_session.execute(text("alter table campaigns add column data_purged_at timestamp"))
    cid = _meting(db_session)
    db_session.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                       {"ts": datetime(2027, 1, 2, 3, 0), "id": cid})
    db_session.commit()
    res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 410
    assert "verwijderd" in res.json()["detail"]
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_410_als_opschoning_tijdens_generatie_landt_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    """De opschoning landt tussen de controle in de route en de generatie:
    _pdf_of_410 maakt er alsnog een 410 van, geen gemelde 500."""
    from backend.data_retention import ReportDataPurged

    cid = _meting(db_session)

    def _opgeschoond(*args, **kwargs):
        raise ReportDataPurged(datetime(2027, 1, 2, 3, 0))

    with patch("backend.main._generate_report_pdf", side_effect=_opgeschoond):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 410
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_422_onbekend_product_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    from backend import main as backend_main

    cid = _meting(db_session)
    with patch.object(backend_main, "_get_report_unavailable_product_name", return_value="Loep Proef"):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 422
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_422_segmentexport_valueerror_is_geen_fout_in_sentry(client, db_session, sentry_vanger, zonder_admin_token):
    cid = _meting(db_session, scan_type="culture_assessment")
    with patch("backend.report.generate_culture_assessment_segment_summary_export",
               side_effect=ValueError("Te weinig respondenten voor een segmentexport.")):
        res = client.get(f"/api/internal/campaigns/{cid}/report?format=segment_summary")
    assert res.status_code == 422
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_422_open_cultuurmeting_via_pdf_route_is_geen_fout_in_sentry(client, db_session, sentry_vanger):
    """Bedrijfsregel van de legacy-renderer (ReportNotAvailable): een open
    meting heeft nog geen rapport. Dat is geen fout en geen melding waard."""
    cid = _meting(db_session, scan_type="culture_assessment")
    db_session.query(Campaign).filter(Campaign.id == cid).update({"is_active": True})
    db_session.commit()
    res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 422
    assert res.json() == {
        "detail": "Loep Culture Assessment boardrapport komt pas beschikbaar na formele sluiting van de baseline."
    }
    sentry_sdk.flush()
    assert sentry_vanger.events == []


def test_gewone_valueerror_uit_legacy_renderer_is_een_gemelde_500(client, db_session, sentry_vanger):
    """Alleen ReportNotAvailable is een 422. Een gewone ValueError is een bug:
    gemeld, en de ruwe waarde gaat niet naar de klant."""
    geheim = "Bosman " + "salaris 98765"
    cid = _meting(db_session, scan_type="culture_assessment")
    with patch("backend.report.generate_campaign_report",
               side_effect=ValueError("could not convert string to float: " + geheim)):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 500
    assert res.json() == {"detail": observability.REPORT_FAILED_REPORTED}
    assert geheim not in res.text
    sentry_sdk.flush()
    assert len(sentry_vanger.events) == 1, json.dumps(sentry_vanger.events, default=str)
    assert sentry_vanger.events[0]["tags"]["report_route"] == "klant_pdf"


def test_mutatie_met_status_code_geeft_twee_events(client, db_session, sentry_vanger, monkeypatch):
    """Bewijst dat de 'precies één event'-tests dubbel melden door de
    integratie op backend.main.app wél zouden zien: met een status_code-
    attribuut meldt de FastAPI-integratie de exceptie nog een keer."""
    monkeypatch.setattr(observability.ReportGenerationFailed, "status_code", 500, raising=False)
    cid = _meting(db_session)
    with patch("backend.report_html.generate_campaign_report_html", side_effect=_renderfout):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 500
    sentry_sdk.flush()
    assert len(sentry_vanger.events) == 2, json.dumps(sentry_vanger.events, default=str)


def test_databasefout_in_pdf_route_wordt_503_zonder_melding(client, db_session, sentry_vanger):
    from sqlalchemy.exc import OperationalError

    cid = _meting(db_session)
    with patch("backend.main._generate_report_pdf", side_effect=OperationalError("x", {}, Exception())):
        res = client.get(f"/api/campaigns/{cid}/report", headers={"x-api-key": _API_KEY})
    assert res.status_code == 503
    sentry_sdk.flush()
    assert sentry_vanger.events == []
