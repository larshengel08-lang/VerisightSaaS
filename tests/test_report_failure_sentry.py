"""Mislukte rapportgeneratie komt precies één keer in Sentry, getagd, zonder
persoonsgegevens, en de klant krijgt een vaste melding (spec 2026-10-08, punt 2).

De tests zetten Sentry aan met een vangende transport en de echte FastAPI-
integratie, zodat ook een tweede event van de integratie zelf zou opvallen."""
from __future__ import annotations

import json
from typing import Any

import pytest
import sentry_sdk
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sentry_sdk.transport import Transport

from backend import observability


class _Vanger(Transport):
    def __init__(self, options: dict[str, Any] | None = None) -> None:
        super().__init__(options)
        self.events: list[dict[str, Any]] = []

    def capture_envelope(self, envelope) -> None:  # type: ignore[override]
        for item in envelope.items:
            if item.type == "event":
                self.events.append(item.payload.json)


@pytest.fixture()
def sentry_vanger():
    vanger = _Vanger()
    observability.init_sentry(
        dsn="https://publiek@sentry.invalid/1",
        environment="test",
        transport=vanger,
        traces_sample_rate=0.0,
    )
    # De integratie patcht Starlette-klassen; een al gebouwde middleware-stack
    # van eerdere tests moet opnieuw opgebouwd worden.
    from backend.main import app

    app.middleware_stack = None
    try:
        yield vanger
    finally:
        sentry_sdk.flush()
        sentry_sdk.get_client().close()
        sentry_sdk.init(dsn=None)
        app.middleware_stack = None


def test_sentry_opties_sturen_geen_lokale_variabelen_body_of_pii():
    opties = observability.sentry_options(dsn="https://publiek@sentry.invalid/1", environment="test")
    assert opties["send_default_pii"] is False
    assert opties["include_local_variables"] is False
    assert opties["max_request_body_size"] == "never"
    assert opties["before_send"] is observability.strip_request_details


def test_strip_request_details_houdt_alleen_methode_en_pad():
    event = {
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
    uit = observability.strip_request_details(event, {})
    assert uit["request"] == {"method": "GET", "url": "https://api.test/api/campaigns/abc/report"}


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
        assert "—" not in tekst and "–" not in tekst


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
