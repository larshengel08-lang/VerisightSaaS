"""Sentry voor de backend: init zonder persoonsgegevens, en één plek die een
mislukte rapportgeneratie meldt (spec 2026-10-08, punt 2).

Privacy: geen lokale variabelen (in de rapportrenderer staan daar open
antwoorden en organisatienamen in), geen request-body, geen headers of cookies
(x-api-key en x-admin-token zijn sleutels). Een event bevat alleen de fout, de
stacktrace, de methode en het pad.
"""
from __future__ import annotations

import logging
from typing import Any

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# Eigen logger voor de logregel in report_generation_failed(). Die helper
# stuurt zelf het getagde event naar Sentry; zonder ignore_logger maakt de
# standaard LoggingIntegration van dezelfde logger.error een tweede, ongetagd
# event. Alleen deze naam wordt genegeerd: "loep.report" zelf (o.a. de
# WeasyPrint-check in /api/health) blijft gewoon naar Sentry gaan.
_GEMELD_LOGGER = "loep.report.gemeld"
ignore_logger(_GEMELD_LOGGER)
logger = logging.getLogger(_GEMELD_LOGGER)

# De frontend herkent de melding aan deze openingszin
# (frontend/lib/report-download-error.ts, REPORT_FAILED_PREFIX).
REPORT_FAILED_PREFIX = "Het rapport kon niet worden gemaakt."
REPORT_FAILED_REPORTED = (
    REPORT_FAILED_PREFIX
    + " Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging."
    + " Je hoeft verder niets te doen. Probeer het later gerust opnieuw."
)
# Zonder Sentry (geen DSN) kan Loep niet beloven dat er een melding is.
REPORT_FAILED_UNREPORTED = (
    REPORT_FAILED_PREFIX
    + " Probeer het later opnieuw. Lukt het dan nog niet, mail dan naar hallo@getloep.nl."
)


def strip_request_details(event: dict[str, Any], hint: dict[str, Any]) -> dict[str, Any]:
    """before_send: van het request blijven alleen methode en url (zonder query) over."""
    request = event.get("request")
    if isinstance(request, dict):
        event["request"] = {key: request[key] for key in ("method", "url") if key in request}
    return event


def sentry_options(*, dsn: str, environment: str) -> dict[str, Any]:
    return {
        "dsn": dsn,
        "integrations": [FastApiIntegration(), SqlalchemyIntegration()],
        "traces_sample_rate": 0.2,
        "environment": environment,
        "send_default_pii": False,
        "include_local_variables": False,
        "max_request_body_size": "never",
        "before_send": strip_request_details,
    }


def init_sentry(*, dsn: str, environment: str, **overrides: Any) -> None:
    sentry_sdk.init(**{**sentry_options(dsn=dsn, environment=environment), **overrides})


class ReportGenerationFailed(Exception):
    """Rapportgeneratie mislukt en is al gemeld. De handler in backend/main.py
    maakt er een 500 met vaste tekst van. Bewust zonder status_code-attribuut:
    dan meldt de FastAPI-integratie hem niet nog een keer."""

    def __init__(self, *, reported: bool) -> None:
        self.reported = reported
        super().__init__(REPORT_FAILED_REPORTED if reported else REPORT_FAILED_UNREPORTED)

    @property
    def detail(self) -> str:
        return REPORT_FAILED_REPORTED if self.reported else REPORT_FAILED_UNREPORTED


def report_generation_failed(
    exc: BaseException, *, campaign_id: str, scan_type: str | None, route: str
) -> ReportGenerationFailed:
    """Meldt de fout bij Sentry (tags, geen persoonsgegevens) en geeft de
    exceptie terug die de route moet gooien: `raise report_generation_failed(...) from exc`."""
    logger.error(
        "Rapportgeneratie mislukt (campaign_id=%s, scan_type=%s, route=%s): %r",
        campaign_id,
        scan_type,
        route,
        exc,
    )
    with sentry_sdk.new_scope() as scope:
        scope.set_tag("campaign_id", campaign_id)
        scope.set_tag("scan_type", scan_type or "onbekend")
        scope.set_tag("report_route", route)
        event_id = scope.capture_exception(exc)
    return ReportGenerationFailed(reported=event_id is not None)
