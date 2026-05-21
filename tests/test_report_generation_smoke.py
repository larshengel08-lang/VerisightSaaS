from __future__ import annotations

import io
from datetime import datetime, timedelta, timezone

from pypdf import PdfReader
from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.culture_assessment.report_content import get_board_report_sections
from backend.report import generate_campaign_report, generate_culture_assessment_segment_summary_export


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


def _extract_pdf_text(pdf_bytes: bytes, max_pages: int = 20) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages[:max_pages]:
        text_parts.append((page.extract_text() or '').replace('\n', ' '))
    return ' '.join(' '.join(text_parts).split())


def _extract_pdf_pages(pdf_bytes: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return [' '.join((page.extract_text() or '').split()) for page in reader.pages]


def _culture_board_pages(pdf_bytes: bytes) -> tuple[list[dict[str, str]], list[str]]:
    sections = get_board_report_sections()
    pages = _extract_pdf_pages(pdf_bytes)
    return sections, pages


def _culture_domain_scores(base: float) -> dict[str, float]:
    return {
        "engagement_involvement": round(base - 0.2, 1),
        "trust_psychological_safety": round(base - 0.5, 1),
        "leadership_direction": round(base - 0.6, 1),
        "collaboration_alignment": round(base - 0.3, 1),
        "workload_capacity": round(base - 0.7, 1),
        "autonomy_role_clarity": round(base - 0.4, 1),
        "growth_development": round(base - 0.5, 1),
        "change_readiness": round(base - 0.4, 1),
        "reward_conditions": round(base - 0.6, 1),
        "organizational_connection_intent": round(base - 0.2, 1),
    }


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
    pages = _extract_pdf_pages(pdf_bytes)
    assert len(pages) == 11
    assert 'Door Loep' in pages[0]
    assert 'Segment deep dive' in pages[0]
    assert 'Niet opgenomen' in pages[0]
    assert 'Wat speelt nu' not in pages[0]
    assert 'Respons' in pages[1]
    assert 'Uitgenodigd' in pages[1]
    assert 'Ingevuld' in pages[1]
    assert 'Respons in context' in pages[1]
    assert 'Bestuurlijke handoff' in pages[2]
    assert 'Wat je hieruit moet concluderen' in pages[2]
    assert 'Frictiescore' in pages[3]
    assert 'Verdeling van het vertrekbeeld' in pages[3]
    assert 'Hoe lees je dit?' in pages[3]
    assert 'Signalen in samenhang' in pages[4]
    assert 'Eerdere signalering' in pages[4]
    assert 'Drivers & prioriteitenbeeld' in pages[5]
    assert 'Hoe lees je dit?' in pages[5]
    assert 'SDT Basisbehoeften' in pages[6]
    assert 'Autonomie' in pages[6]
    assert 'Organisatiefactoren' in pages[7]
    assert 'Belevingsscore' in pages[7]
    assert 'Eerste route & actie' in pages[8]
    assert 'Review' in pages[8]
    assert 'Methodiek / leeswijzer' in pages[9]
    assert 'Technische verantwoording' in pages[10]
    assert 'Onderliggende psychologische laag (SDT)' in pages[10]
    assert 'Vertrouwelijk' in ' '.join(pages)


def test_generate_culture_assessment_report_smoke(db_session: Session):
    org = Organization(name="Cultuurgroep Zonder Drilldown", slug="cultuurgroep-zonder-drilldown", contact_email="board@cultuurgroep.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Loep Cultuurbeeld 2026",
        scan_type="culture_assessment",
        created_at=datetime.now(timezone.utc),
    )
    campaign.is_active = False

    for idx in range(30):
        respondent = Respondent(
            campaign=campaign,
            department="Operatie" if idx < 15 else "Support",
            role_level="manager" if idx % 3 == 0 else "specialist",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            email=f"cultuur-zonder-drilldown-{idx}@voorbeeld.nl",
        )
        domain_scores = _culture_domain_scores(6.4 + (idx % 3) * 0.1)
        response = SurveyResponse(
            respondent=respondent,
            sdt_raw={},
            sdt_scores={"culture_index": round(sum(domain_scores.values()) / len(domain_scores), 2)},
            org_raw={},
            org_scores=domain_scores,
            pull_factors_raw={},
            open_text_raw="Meer duidelijkheid, vertrouwen en betere samenwerking helpt." if idx < 8 else None,
            uwes_raw={},
            turnover_intention_raw={},
            risk_score=round(sum(domain_scores.values()) / len(domain_scores), 2),
            risk_band="MIDDEN",
            full_result={
                "culture_index": round(sum(domain_scores.values()) / len(domain_scores), 2),
                "domain_scores": domain_scores,
            },
        )
        db_session.add_all([respondent, response])

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 5000
    sections, pages = _culture_board_pages(pdf_bytes)
    assert len(pages) == 10
    assert len(sections) == 10
    assert "Loep Culture Assessment - Board Baseline" in pages[0]
    for page_text, section in zip(pages[1:], sections[1:]):
        assert section["title"] in page_text
        assert section["anchor"] in page_text
    assert "Governed drilldown voor HR" not in " ".join(pages)
    assert "Afdeling Operatie: n=15, Culture Index" not in pages[7]


def test_generate_culture_assessment_report_smoke_with_governed_drilldown(db_session: Session):
    org = Organization(name="Cultuurgroep", slug="cultuurgroep", contact_email="board@cultuurgroep.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Loep Cultuurbeeld 2026",
        scan_type="culture_assessment",
        created_at=datetime.now(timezone.utc),
        enabled_modules=["segment_deep_dive"],
    )
    campaign.is_active = False

    for idx in range(30):
        respondent = Respondent(
            campaign=campaign,
            department="Operatie" if idx < 15 else "Support",
            role_level="manager" if idx % 3 == 0 else "specialist",
            completed=True,
            completed_at=datetime.now(timezone.utc),
            email=f"cultuur{idx}@voorbeeld.nl",
        )
        domain_scores = _culture_domain_scores(6.4 + (idx % 3) * 0.1)
        response = SurveyResponse(
            respondent=respondent,
            sdt_raw={},
            sdt_scores={"culture_index": round(sum(domain_scores.values()) / len(domain_scores), 2)},
            org_raw={},
            org_scores=domain_scores,
            pull_factors_raw={},
            open_text_raw="Meer duidelijkheid, vertrouwen en betere samenwerking helpt." if idx < 8 else None,
            uwes_raw={},
            turnover_intention_raw={},
            risk_score=round(sum(domain_scores.values()) / len(domain_scores), 2),
            risk_band="MIDDEN",
            full_result={
                "culture_index": round(sum(domain_scores.values()) / len(domain_scores), 2),
                "domain_scores": domain_scores,
            },
        )
        db_session.add_all([respondent, response])

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)

    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 5000
    sections, pages = _culture_board_pages(pdf_bytes)
    assert len(pages) == 10
    assert len(sections) == 10
    assert "Loep Culture Assessment - Board Baseline" in pages[0]
    for page_text, section in zip(pages[1:], sections[1:]):
        assert section["title"] in page_text
        assert section["anchor"] in page_text
    assert "Afdeling Operatie: n=15, Culture Index" in pages[7]
    assert "Benchmarking blijft in v1 bewust niet actief." in pages[9]


def test_generate_culture_assessment_segment_summary_export_smoke(db_session: Session):
    org = Organization(name="Culture Export BV", slug="culture-export-bv", contact_email="board@culture-export.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Cultuurbeeld Export 2026",
        scan_type="culture_assessment",
        created_at=datetime.now(timezone.utc),
        enabled_modules=["segment_deep_dive"],
    )
    campaign.is_active = False

    for idx in range(30):
        department = "People" if idx < 15 else "Operations"
        role_level = "manager" if idx < 15 else "specialist"
        base_score = 6.0 + (idx % 3) * 0.2
        respondent = Respondent(
            campaign_id=campaign.id,
            email=f"culture-export-{idx}@example.com",
            department=department,
            role_level=role_level,
            completed=True,
            completed_at=datetime.now(timezone.utc),
        )
        db_session.add(respondent)
        db_session.flush()
        response = SurveyResponse(
            respondent_id=respondent.id,
            risk_score=round(base_score, 2),
            risk_band="MIDDEN",
            preventability=None,
            exit_reason_code=None,
            tenure_years=2.0,
            stay_intent_score=3,
            turnover_intention_score=4.9,
            uwes_score=5.8,
            open_text_raw="Vertrouwen en werkdruk vragen aandacht in samenhang.",
            sdt_raw={"CA01": 4},
            sdt_scores={"sdt_total": round(base_score, 2)},
            org_raw={"CA21": 4},
            org_scores=_culture_domain_scores(base_score),
            full_result={
                "culture_index": round(base_score, 2),
                "questionnaire_version": "v1_enterprise_40",
            },
        )
        db_session.add(response)

    db_session.commit()

    csv_bytes = generate_culture_assessment_segment_summary_export(campaign.id, db_session)
    csv_text = csv_bytes.decode("utf-8")

    assert csv_text.startswith("segment_type,segment_label,n,culture_index")
    assert "Afdeling,Operations,15," in csv_text
    assert "Afdeling,People,15," in csv_text
    assert "Functiegroep,manager,15," in csv_text
    assert "Functiegroep,specialist,15," in csv_text


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
    pages = _extract_pdf_pages(pdf_bytes)
    assert len(pages) == 11
    assert 'Segment deep dive' in pages[0]
    assert 'Respons' in pages[1]
    assert 'Bestuurlijke handoff' in pages[2]
    assert 'Technische verantwoording' in pages[-1]
    assert 'Segmentanalyse' not in ' '.join(pages)


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
    pages = _extract_pdf_pages(pdf_bytes)
    assert len(pages) == 8
    assert 'Door Loep' in pages[0]
    assert 'Segment deep dive' in pages[0]
    assert 'Opgenomen' in pages[0]
    assert 'Wat speelt nu' not in pages[0]
    assert 'Bestuurlijke handoff' in pages[1]
    assert 'Uitgenodigd' in pages[1]
    assert 'Ingevuld' in pages[1]
    assert 'Respons' in pages[1]
    assert 'Respons in context' in pages[1]
    assert 'Drivers & prioriteitenbeeld' in pages[2]
    assert 'Wat speelt nu' in pages[2]
    assert 'Scherpste factor' in pages[2]
    assert 'Eerste besluit' in pages[2]
    assert 'Hoe lees je dit?' in pages[2]
    assert 'Kernsignalen in samenhang' in pages[3]
    assert 'Eerdere signalering' in pages[3]
    assert 'Hoe lees je dit?' in pages[3]
    assert 'Eerste route & managementactie' in pages[4]
    assert 'Compacte methodiek / leeswijzer' in pages[5]
    assert 'Hoe lees je dit?' in pages[5]
    assert 'Segmentanalyse' in pages[6]
    assert 'Technische verantwoording' in pages[7]
    assert 'Onderliggende psychologische laag (SDT)' in pages[7]
    assert 'Review' in pages[4]


def test_generate_exit_report_sample_output_mode_uses_buyer_facing_cover_note(db_session: Session):
    org = Organization(name="Voorbeeldzorg", slug="voorbeeldzorg-sample", contact_email="hr@voorbeeldzorg.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Exit Sample 2026",
        scan_type="exit",
        created_at=datetime.now(timezone.utc),
    )

    for idx in range(10):
        _add_response(
            db_session,
            campaign=campaign,
            idx=idx,
            department="Zorg",
            role_level="specialist",
            exit_reason_code="P1",
            risk_score=6.1,
            risk_band="MIDDEN",
            preventability="STERK_WERKSIGNAAL",
            stay_intent_score=2,
            uwes_score=None,
            turnover_intention_score=None,
            signal_visibility_score=2.5,
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session, sample_output_mode=True)

    pdf_text = _extract_pdf_text(pdf_bytes)
    assert 'Illustratief voorbeeld' in pdf_text
    assert 'fictieve data' in pdf_text.lower()
    assert 'Vertrouwelijk' not in pdf_text


def test_generate_retention_report_omits_segment_appendix_when_any_group_is_below_threshold(db_session: Session):
    org = Organization(name="Low N BV", slug="low-n-bv", contact_email="people@lown.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Retentie Low N 2026",
        scan_type="retention",
        created_at=datetime.now(timezone.utc),
        enabled_modules=["segment_deep_dive"],
    )

    for idx in range(10):
        _add_response(
            db_session,
            campaign=campaign,
            idx=idx,
            department="Product" if idx < 6 else "People",
            role_level="manager" if idx < 5 else "specialist",
            exit_reason_code=None,
            risk_score=5.9 + (idx % 3) * 0.2,
            risk_band="MIDDEN",
            preventability=None,
            stay_intent_score=2,
            uwes_score=5.2,
            turnover_intention_score=5.8,
            open_text_raw="Werkdruk en groeiperspectief vragen snelle verificatie.",
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)

    pages = _extract_pdf_pages(pdf_bytes)
    assert len(pages) == 7
    assert 'Segmentanalyse' not in ' '.join(pages[:-1])
    assert 'Eerdere signalering' not in pages[3]
    assert 'eerdere signalering' not in pages[3].lower()
    assert 'Technische verantwoording' in pages[-1]
    assert 'Segmentanalyse niet beschikbaar' in pages[-1]
