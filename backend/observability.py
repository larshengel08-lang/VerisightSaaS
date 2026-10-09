"""Sentry voor de backend: init zonder persoonsgegevens, en één plek die een
mislukte rapportgeneratie meldt (spec 2026-10-08, punt 2).

Privacy. Wat níet naar Sentry gaat, in events en in transacties (performance
traces):
- lokale variabelen (in de rapportrenderer staan daar open antwoorden en
  organisatienamen in);
- de request-body;
- headers en cookies (x-api-key en x-admin-token zijn sleutels);
- de querystring;
- tokens in het pad: de url krijgt het routesjabloon (/survey/{token}), en
  zonder gematchte route een vaste plaatshouder; dat geldt ook voor de
  transactienaam;
- de tekst van log-breadcrumbs (logregels noemen soms organisaties of
  e-mailadressen). SQL-breadcrumbs blijven, zonder parameters;
- de ingevulde waarden van een logregel die zelf een event wordt: alleen het
  sjabloon ("fout voor %s") gaat mee. Zet daarom nooit persoonsgegevens in
  het sjabloon zelf, altijd als parameter.
Wat wél meegaat: de fout, de stacktrace met broncoderegels, de methode, de url
zonder query en de tags die report_generation_failed() zet.
"""
from __future__ import annotations

import logging
from typing import Any
from urllib.parse import urlsplit, urlunsplit

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


# Plaatshouder voor het pad als er geen routesjabloon is (bijvoorbeeld een url
# die geen route matcht): het echte pad kan dan een token bevatten.
ONBEKENDE_ROUTE = "/<onbekende route>"


def _transaction_source(event: dict[str, Any]) -> str | None:
    info = event.get("transaction_info")
    source = info.get("source") if isinstance(info, dict) else None
    # TransactionSource is een str-enum; .value geeft de kale tekst.
    return getattr(source, "value", source)


def _scrub_request(event: dict[str, Any]) -> None:
    request = event.get("request")
    if not isinstance(request, dict):
        return
    kept = {key: request[key] for key in ("method", "url") if key in request}
    source = _transaction_source(event)
    transaction = event.get("transaction")
    is_template = source == "route" and isinstance(transaction, str) and transaction.startswith("/")
    url = kept.get("url")
    if isinstance(url, str):
        parts = urlsplit(url)
        # Alleen een routesjabloon (/survey/{token}) is veilig als pad; anders
        # de vaste plaatshouder. Query en fragment gaan er altijd af.
        path = transaction if is_template else ONBEKENDE_ROUTE
        kept["url"] = urlunsplit((parts.scheme, parts.netloc, path, "", ""))
    # Zonder route matcht Starlette de ruwe url als transactienaam (bron "url").
    # Een componentnaam (bron "component") bevat geen pad en mag blijven.
    if source not in ("route", "component") and isinstance(transaction, str):
        event["transaction"] = ONBEKENDE_ROUTE
    event["request"] = kept


def _scrub_logentry(event: dict[str, Any]) -> None:
    # Een logregel op error-niveau wordt een eigen event; formatted en params
    # bevatten dan de ingevulde waarden. Alleen het sjabloon blijft over.
    logentry = event.get("logentry")
    if isinstance(logentry, dict):
        event["logentry"] = {key: logentry[key] for key in ("message",) if key in logentry}


def _scrub_breadcrumbs(event: dict[str, Any]) -> None:
    breadcrumbs = event.get("breadcrumbs")
    values = breadcrumbs.get("values") if isinstance(breadcrumbs, dict) else breadcrumbs
    if not isinstance(values, list):
        return
    for crumb in values:
        if isinstance(crumb, dict) and crumb.get("category") != "query":
            crumb.pop("message", None)
            crumb.pop("data", None)


def scrub_event(event: dict[str, Any], hint: dict[str, Any]) -> dict[str, Any]:
    """before_send én before_send_transaction: van het request blijven alleen
    de methode en de url zonder query over (pad als routesjabloon, anders een
    vaste plaatshouder), breadcrumbs verliezen hun tekst behalve SQL-
    breadcrumbs, en van een logregel blijft alleen het sjabloon."""
    _scrub_request(event)
    _scrub_breadcrumbs(event)
    _scrub_logentry(event)
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
        "before_send": scrub_event,
        # Transacties gaan niet door before_send en dragen anders headers mee.
        "before_send_transaction": scrub_event,
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
    exceptie terug die de route moet gooien: `raise report_generation_failed(...) from exc`.

    reported=True betekent dat de SDK het event heeft aangenomen en in de
    wachtrij gezet, niet dat het gegarandeerd bij Sentry is aangekomen."""
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
    # Als hetzelfde exceptie-object eerder al is gemeld, laat Sentry's dedupe dit event vallen; dan is reported False en zegt de melding eerlijk dat er geen melding is.
    return ReportGenerationFailed(reported=event_id is not None)
