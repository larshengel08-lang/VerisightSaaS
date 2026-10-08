"""Mislukte rapportgeneratie komt precies één keer in Sentry, getagd, zonder
persoonsgegevens, en de klant krijgt een vaste melding (spec 2026-10-08, punt 2).

De tests zetten Sentry aan met een vangende transport en de echte FastAPI-
integratie, zodat ook een tweede event van de integratie zelf zou opvallen."""
from __future__ import annotations

import json
import logging
from typing import Any

import pytest
import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sentry_sdk.transport import Transport

from backend import observability


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
