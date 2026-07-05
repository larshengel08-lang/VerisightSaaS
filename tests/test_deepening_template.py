"""Render-checks voor de verduidelijkingsstap in de survey-pagina."""
from __future__ import annotations

from sqlalchemy.orm import Session

from tests.test_api_flows import _create_campaign, _create_org, _create_respondent


def _survey_page(client, db_session: Session, scan_type: str) -> str:
    org = _create_org(db_session, api_key=f"deepening-template-{scan_type}")
    campaign = _create_campaign(db_session, org, name=f"Verdieping {scan_type}", scan_type=scan_type)
    respondent = _create_respondent(db_session, campaign, email=f"tmpl-{scan_type}@example.com")
    response = client.get(f"/survey/{respondent.token}")
    assert response.status_code == 200
    return response.text


def test_retention_survey_contains_deepening_step(client, db_session: Session):
    html = _survey_page(client, db_session, "retention")
    assert 'id="deepening-step"' in html
    assert "__DEEPENING_SETS" in html
    # Retention-cap 2->3 per spec 2026-07-05 (gespreksrichting-ronde).
    assert "__DEEPENING_CAP = 3" in html
    assert "Soms stellen we een korte verduidelijkingsvraag" in html
    # Scan-specifieke tekst (tegenwoordige tijd) meegeleverd in de JSON.
    assert "Welke omschrijving past het best bij jouw ervaring met werkbelasting?" in html


def test_exit_survey_contains_deepening_step_with_exit_cap(client, db_session: Session):
    html = _survey_page(client, db_session, "exit")
    assert 'id="deepening-step"' in html
    assert "__DEEPENING_CAP = 3" in html
    # Verleden tijd voor exit.
    assert "werkbelasting destijds" in html


def test_direction_step_rendered_for_retention(client, db_session: Session):
    html = _survey_page(client, db_session, "retention")
    assert 'id="direction-step"' in html
    assert "Gespreksrichting" in html
    assert "geen toezegging" in html            # introductieregel
    assert "__DIRECTION_SETS" in html


def test_direction_step_absent_for_exit(client, db_session: Session):
    html = _survey_page(client, db_session, "exit")
    # De gedeelde survey-JS noemt de id wel; het DOM-element en de
    # data-injectie mogen er niet zijn (gespreksrichting = retention-only).
    assert 'id="direction-step"' not in html
    assert "window.__DIRECTION_SETS = {" not in html


def test_pulse_survey_has_no_deepening_step(client, db_session: Session):
    html = _survey_page(client, db_session, "pulse")
    # De gedeelde survey-JS noemt de id en __DEEPENING_SETS wel; het DOM-element
    # en de data-injectie mogen er niet zijn.
    assert 'id="deepening-step"' not in html
    assert "window.__DEEPENING_SETS = {" not in html
    assert "window.__DEEPENING_CAP = " not in html
