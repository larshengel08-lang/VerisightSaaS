"""Sluitdatum afdwingen (amendement spec 2026-09-16 par. 4.3a, besluit Lars 18-9).

De deur gaat dicht na het einde van de sluitdag in Europe/Amsterdam. Deze tests
pinnen de daggrens (zomer- en wintertijd) en de open/dicht-matrix, los van
FastAPI en de database.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from backend.survey_window import (
    SURVEY_CLOSED_MESSAGE,
    is_survey_open,
    today_amsterdam,
)


def test_today_amsterdam_zomertijd_daggrens():
    # 30 september 2026 21:59:59 UTC is nog 30 september in Amsterdam (UTC+2).
    assert today_amsterdam(datetime(2026, 9, 30, 21, 59, 59, tzinfo=timezone.utc)) == date(2026, 9, 30)
    # 22:00 UTC is al 1 oktober in Amsterdam.
    assert today_amsterdam(datetime(2026, 9, 30, 22, 0, 0, tzinfo=timezone.utc)) == date(2026, 10, 1)


def test_today_amsterdam_wintertijd_daggrens():
    # 15 december 2026 22:59:59 UTC is nog 15 december in Amsterdam (UTC+1).
    assert today_amsterdam(datetime(2026, 12, 15, 22, 59, 59, tzinfo=timezone.utc)) == date(2026, 12, 15)
    assert today_amsterdam(datetime(2026, 12, 15, 23, 0, 0, tzinfo=timezone.utc)) == date(2026, 12, 16)


def test_today_amsterdam_behandelt_naive_als_utc():
    assert today_amsterdam(datetime(2026, 9, 30, 22, 0, 0)) == date(2026, 10, 1)


def test_open_zonder_sluitdatum_zolang_actief():
    assert is_survey_open(is_active=True, closes_at=None, today=date(2026, 9, 18)) is True
    assert is_survey_open(is_active=False, closes_at=None, today=date(2026, 9, 18)) is False


def test_open_tot_en_met_de_sluitdag_zelf():
    closes = date(2026, 10, 8)
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 7)) is True
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 8)) is True
    assert is_survey_open(is_active=True, closes_at=closes, today=date(2026, 10, 9)) is False


def test_inactief_wint_altijd_van_de_datum():
    assert is_survey_open(is_active=False, closes_at=date(2099, 1, 1), today=date(2026, 9, 18)) is False


def test_gesloten_copy_is_je_jij_zonder_streepjes():
    assert SURVEY_CLOSED_MESSAGE == "Deze meting is gesloten. Bedankt voor je interesse."
    assert "—" not in SURVEY_CLOSED_MESSAGE
    assert "–" not in SURVEY_CLOSED_MESSAGE
