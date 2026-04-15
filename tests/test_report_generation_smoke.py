from __future__ import annotations

import io
from datetime import datetime, timedelta, timezone

from pypdf import PdfReader
from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.report import generate_campaign_report


def _org_scores(base: float) -> dict[str, float]:
    return {
        "leadership": round(base - 1.1, 1),
        "culture": round(base - 0.7, 1),
        "growth": round(base - 1.3, 1),
        "compensation": round(base - 0.3, 1),
        "workload": round(base - 0.9, 1),
        "role_clarity": round(base - 0.5, 1),
    }


def _sdt_scores(base: float) -> dict[str, float]:
    return {
        "autonomy": round(base - 0.6, 1),
        "competence": round(base - 0.3, 1),
        "relatedness": round(base - 0.5, 1),
        "sdt_total": round(base - 0.5, 1),
    }


def _add_response(
    db_session: Session,
    *,
    campaign: Campaign,
    idx: int,
    department: str,
    role_level: str,
    exit_reason_code: str | None,
    risk_score: float,
    risk_band: str,
    preventability: str | None,
    stay_intent_score: int | None,
    uwes_score: float | None,
    turnover_intention_score: float | None,
    open_text_raw: str | None = None,
    signal_visibility_score: float | None = None,
) -> None:
    respondent = Respondent(
        campaign=campaign,
        department=department,
        role_level=role_level,
        completed=True,
        completed_at=datetime.now(timezone.utc),
        exit_month="2026-03",
        annual_salary_eur=52000 + idx * 500,
        email=f"persoon{idx}@voorbeeld.nl",
    )
    response = SurveyResponse(
        respondent=respondent,
        tenure_years=1.5 + idx * 0.1,
        exit_reason_category="push" if exit_reason_code else None,
        exit_reason_code=exit_reason_code,
        stay_intent_score=stay_intent_score,
        sdt_raw={},
        sdt_scores=_sdt_scores(5.2 + (idx % 3) * 0.2),
        org_raw={},
        org_scores=_org_scores(5.0 + (idx % 4) * 0.2),
        pull_factors_raw={"P3": 1, "P5": 1} if exit_reason_code else {},
        open_text_raw=open_text_raw,
        uwes_raw={},
        uwes_score=uwes_score,
        turnover_intention_raw={},
        turnover_intention_score=turnover_intention_score,
        risk_score=risk_score,
        risk_band=risk_band,
        preventability=preventability,
        replacement_cost_eur=6000 + idx * 250 if exit_reason_code else None,
        full_result=(
            {"exit_context_summary": {"signal_visibility_score": signal_visibility_score}}
            if signal_visibility_score is not None
            else {}
        ),
    )
    db_session.add_all([respondent, response])


def _build_campaign(
    db_session: Session,
    *,
    organization: Organization,
    name: str,
    scan_type: str,
    created_at: datetime,
    enabled_modules: list[str] | None = None,
) -> Campaign:
    campaign = Campaign(
        organization=organization,
        name=name,
        scan_type=scan_type,
        delivery_mode="baseline",
        enabled_modules=enabled_modules,
        created_at=created_at,
    )
    db_session.add(campaign)
    db_session.flush()
    return campaign


def _extract_pdf_text(pdf_bytes: bytes, max_pages: int = 6) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages[:max_pages]:
        text_parts.append((page.extract_text() or '').replace('\n', ' '))
    return ' '.join(' '.join(text_parts).split())


def test_generate_exit_report_smoke(db_session: Session):
    org = Organization(name="Voorbeeldzorg", slug="voorbeeldzorg", contact_email="hr@voorbeeldzorg.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Exit Q1 2026",
        scan_type="exit",
        created_at=datetime.now(timezone.utc),
    )

    for idx in range(10):
        _add_response(
            db_session,
            campaign=campaign,
            idx=idx,
            department="Zorg" if idx < 5 else "Support",
            role_level="manager" if idx < 5 else "specialist",
            exit_reason_code="P1" if idx < 6 else "P3",
            risk_score=6.2 + (idx % 3) * 0.2,
            risk_band="MIDDEN" if idx < 7 else "HOOG",
            preventability="STERK_WERKSIGNAAL" if idx < 7 else "GEMENGD_WERKSIGNAAL",
            stay_intent_score=2,
            uwes_score=None,
            turnover_intention_score=None,
            signal_visibility_score=2.2 + (idx % 4) * 0.2,
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 8000
    pdf_text = _extract_pdf_text(pdf_bytes)
    assert 'Bestuurlijke handoff' in pdf_text
    assert 'Wat je hier niet uit moet concluderen' in pdf_text
    assert 'Indicatieve exposure' in pdf_text


def test_generate_exit_report_smoke_with_indicative_batch(db_session: Session):
    org = Organization(name="Indicatieve Org", slug="indicatieve-org", contact_email="hr@indicatief.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Exit Indicatief",
        scan_type="exit",
        created_at=datetime.now(timezone.utc),
    )

    for idx in range(6):
        _add_response(
            db_session,
            campaign=campaign,
            idx=idx,
            department="Operations",
            role_level="specialist",
            exit_reason_code="P5",
            risk_score=5.1 + (idx % 2) * 0.2,
            risk_band="MIDDEN",
            preventability="GEMENGD_WERKSIGNAAL",
            stay_intent_score=3,
            uwes_score=None,
            turnover_intention_score=None,
            signal_visibility_score=2.8,
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 5000
    pdf_text = _extract_pdf_text(pdf_bytes)
    assert 'Bestuurlijke handoff' not in pdf_text


def test_generate_retention_report_smoke_with_trend_and_segment_deep_dive(db_session: Session):
    org = Organization(name="ScaleUp BV", slug="scaleup-bv", contact_email="people@scaleup.nl")
    db_session.add(org)
    db_session.flush()

    previous_campaign = _build_campaign(
        db_session,
        organization=org,
        name="Retentie Najaar 2025",
        scan_type="retention",
        created_at=datetime.now(timezone.utc) - timedelta(days=120),
    )
    current_campaign = _build_campaign(
        db_session,
        organization=org,
        name="Retentie Voorjaar 2026",
        scan_type="retention",
        created_at=datetime.now(timezone.utc),
        enabled_modules=["segment_deep_dive"],
    )

    for idx in range(10):
        department = "Product" if idx < 5 else "Customer Success"
        role_level = "manager" if idx < 5 else "specialist"
        _add_response(
            db_session,
            campaign=previous_campaign,
            idx=idx,
            department=department,
            role_level=role_level,
            exit_reason_code=None,
            risk_score=5.3 + (idx % 3) * 0.1,
            risk_band="MIDDEN",
            preventability=None,
            stay_intent_score=3,
            uwes_score=6.1,
            turnover_intention_score=4.8,
            open_text_raw="Samenwerking is redelijk stabiel maar planning vraagt aandacht.",
        )
        _add_response(
            db_session,
            campaign=current_campaign,
            idx=idx + 20,
            department=department,
            role_level=role_level,
            exit_reason_code=None,
            risk_score=6.1 + (idx % 3) * 0.2,
            risk_band="MIDDEN" if idx < 7 else "HOOG",
            preventability=None,
            stay_intent_score=2,
            uwes_score=5.0,
            turnover_intention_score=6.1,
            open_text_raw="Werkdruk en planning vragen nu snelle verificatie en opvolging.",
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(current_campaign.id, db_session)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 9000
    pdf_text = _extract_pdf_text(pdf_bytes)
    assert 'Bestuurlijke handoff' in pdf_text
    assert 'Wat je hier niet uit moet concluderen' in pdf_text
