"""Sluitdatum van een meting (amendement spec 2026-09-16 par. 4.3a, besluit Lars 18-9).

`campaigns.closes_at` is een date. De deur gaat dicht na het einde van die dag
in Europe/Amsterdam: invullen mag zolang today_amsterdam() <= closes_at.
Null betekent geen deadline (bestaand gedrag). `is_active` blijft de harde
schakelaar en wint altijd van de datum. Dit is de enige plek waar die twee
regels samen staan; de vier open-survey-endpoints in backend/main.py roepen
alleen `is_survey_open` aan.

Let op Railway (Python 3.11): geen PEP 701-f-strings hieronder.
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

AMSTERDAM = ZoneInfo("Europe/Amsterdam")

# Eén set copy voor de gesloten meting, voor de statuspagina (GET) en voor de
# 410 van /survey/submit (POST), zodat een respondent met een open tabblad
# hetzelfde leest als een respondent die de link nu pas opent.
SURVEY_CLOSED_TITLE = "Meting gesloten"
SURVEY_CLOSED_HEADING = "Deze meting is gesloten"
SURVEY_CLOSED_MESSAGE = "Deze meting is gesloten. Bedankt voor je interesse."
SURVEY_CLOSED_HINT = "Heb je vragen? Neem dan contact op met de HR-afdeling van je organisatie."


def today_amsterdam(now: datetime | None = None) -> date:
    """De kalenderdag in Nederland. Een naive datetime wordt als UTC gelezen."""
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(AMSTERDAM).date()


def is_survey_open(*, is_active: bool, closes_at: date | None, today: date | None = None) -> bool:
    """True zolang de meting actief is en de sluitdag nog niet voorbij is."""
    if not is_active:
        return False
    if closes_at is None:
        return True
    return (today or today_amsterdam()) <= closes_at
