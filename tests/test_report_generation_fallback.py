"""_generate_report_pdf: geen stille terugval naar legacy ReportLab voor
scan-types die report_html.py (loep-v6) als enige juiste ontwerp hebben
(exit/retention/onboarding) — die missen verdiepingsvragen en gespreks-
richting en zouden een klant een verouderd rapport geven zonder dat
iemand het merkt. Voor scan-types waar ReportLab de enige implementatie
is (team/leadership/culture_assessment) verandert er niets."""
from __future__ import annotations

from unittest.mock import patch

import pytest

from tests.test_api_flows import _create_campaign, _create_org

from backend.main import _generate_report_pdf


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_weasyprint_failure_fails_loud_for_loep_v6_scan_types(db_session, scan_type):
    org = _create_org(db_session, name=f"Org {scan_type}", slug=f"org-{scan_type}-floud")
    campaign = _create_campaign(db_session, org, scan_type=scan_type)

    with patch(
        "backend.report_html.generate_campaign_report_html",
        side_effect=RuntimeError("weasyprint kapot"),
    ):
        with pytest.raises(RuntimeError, match="weasyprint kapot"):
            _generate_report_pdf(campaign.id, db_session)


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_legacy_reportlab_never_called_for_loep_v6_scan_types(db_session, scan_type):
    org = _create_org(db_session, name=f"Org2 {scan_type}", slug=f"org2-{scan_type}-floud")
    campaign = _create_campaign(db_session, org, scan_type=scan_type)

    with patch(
        "backend.report_html.generate_campaign_report_html",
        side_effect=RuntimeError("weasyprint kapot"),
    ):
        with patch("backend.report.generate_campaign_report") as legacy_mock:
            with pytest.raises(RuntimeError):
                _generate_report_pdf(campaign.id, db_session)
            legacy_mock.assert_not_called()


def test_other_scan_types_still_use_legacy_reportlab_directly(db_session):
    """team/leadership/culture_assessment: ReportLab is hier de enige
    implementatie, geen fallback — dit gedrag blijft ongewijzigd."""
    org = _create_org(db_session, name="Org Team", slug="org-team-floud")
    campaign = _create_campaign(db_session, org, scan_type="team")

    with patch("backend.report_html.generate_campaign_report_html") as html_mock:
        with patch("backend.report.generate_campaign_report", return_value=b"%PDF-legacy") as legacy_mock:
            pdf_bytes, design = _generate_report_pdf(campaign.id, db_session)

    html_mock.assert_not_called()
    legacy_mock.assert_called_once()
    assert design == "legacy"
    assert pdf_bytes == b"%PDF-legacy"


def test_unknown_campaign_raises_value_error(db_session):
    with pytest.raises(ValueError):
        _generate_report_pdf("00000000-0000-0000-0000-000000000000", db_session)
