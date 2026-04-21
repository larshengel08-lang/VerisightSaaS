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


def _extract_pdf_text(pdf_bytes: bytes, max_pages: int = 20) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages[:max_pages]:
        text_parts.append((page.extract_text() or '').replace('\n', ' '))
    return ' '.join(' '.join(text_parts).split())


def _extract_pdf_pages(pdf_bytes: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return [' '.join((page.extract_text() or '').split()) for page in reader.pages]


def _page_index(pages: list[str], needle: str) -> int:
    return next(idx for idx, page in enumerate(pages) if needle in page)


def _assert_page_has_no_visible_overflow_markers(page_text: str) -> None:
    lowered = page_text.lower()
    assert "…" not in page_text
    assert "..." not in page_text
    assert " pri oriteren" not in lowered
    assert " huidig e" not in lowered


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
    assert 'Door Verisight' in pages[0]
    assert 'Segment deep dive' in pages[0]
    assert 'Niet opgenomen' in pages[0]
    assert 'Wat speelt nu' not in pages[0]
    assert 'Respons' in pages[1]
    assert 'Uitgenodigd' in pages[1]
    assert 'Ingevuld' in pages[1]
    assert 'Respons in context' in pages[1]
    assert 'Bestuurlijke handoff' in pages[2]
    assert 'Wat je hieruit moet concluderen' in pages[2]
    friction_page = pages[_page_index(pages, 'Verdeling van het vertrekbeeld')]
    synthesis_page = pages[_page_index(pages, 'Signalen in samenhang')]
    drivers_page = pages[_page_index(pages, 'Drivers & prioriteitenbeeld')]
    action_page = pages[_page_index(pages, 'Wat besluiten en doen we als eerste')]
    methodology_page = pages[-2]
    appendix_page = pages[-1]
    methodology_index = len(pages) - 2
    assert 'Frictiescore' in friction_page
    assert 'Hoe lees je dit?' in friction_page
    assert 'Signalen in samenhang' in synthesis_page
    assert 'Eerdere signalering' in ' '.join(pages)
    assert 'Drivers & prioriteitenbeeld' in drivers_page
    assert 'Hoe lees je dit?' in drivers_page
    assert 'Wat besluiten en doen we als eerste' in action_page
    assert 'Review' in action_page
    assert 'METHODIEK' in methodology_page
    assert 'Technische verantwoording' in appendix_page
    assert 'Onderliggende psychologische laag (SDT)' in appendix_page
    assert _page_index(pages, 'Bestuurlijke handoff') < _page_index(pages, 'Drivers & prioriteitenbeeld')
    assert _page_index(pages, 'Drivers & prioriteitenbeeld') < _page_index(pages, 'Verdeling van het vertrekbeeld')
    assert _page_index(pages, 'Verdeling van het vertrekbeeld') < _page_index(pages, 'Wat besluiten en doen we als eerste')
    assert _page_index(pages, 'Wat besluiten en doen we als eerste') < methodology_index
    assert 'Vertrouwelijk' in ' '.join(pages)


def test_generate_exit_report_priority_pages_are_text_safe(db_session: Session):
    org = Organization(name="Tekstveilig BV", slug="tekstveilig-bv", contact_email="hr@tekstveilig.nl")
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
    pages = _extract_pdf_pages(pdf_bytes)

    for page_number in (1, 2, 3, 4, 9, 11):
        _assert_page_has_no_visible_overflow_markers(pages[page_number - 1])


def test_generate_exit_report_focus_pages_follow_corrected_reading_order(db_session: Session):
    org = Organization(name="Compositie BV", slug="compositie-bv", contact_email="hr@compositie.nl")
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
    pages = _extract_pdf_pages(pdf_bytes)

    response_page = pages[1]
    assert response_page.index("Responsverhouding") < response_page.index("Wat respons zegt")
    assert response_page.index("Wat respons zegt") < response_page.index("Wat lage respons kan betekenen")
    assert response_page.index("Wat lage respons kan betekenen") < response_page.index("Wat hoge respons kan betekenen")
    assert response_page.index("Wat hoge respons kan betekenen") < response_page.index("Respons in context")
    assert response_page.index("Respons in context") < response_page.index("Optionele context")

    handoff_page = pages[2]
    assert "Waarom dit de eerste route is" not in handoff_page
    assert handoff_page.index("Sterkste signaal") < handoff_page.index("Waarom dit nu telt")
    assert handoff_page.index("Waarom dit nu telt") < handoff_page.index("Wat nu eerst doen")
    assert handoff_page.index("Wat nu eerst doen") < handoff_page.index("Wat je hieruit moet concluderen")
    assert "Waarom dit nu telt Bestuurlijke relevantie" in handoff_page
    assert "Wat nu eerst doen Eerste route" in handoff_page
    assert "Wat je hieruit moet concluderen Conclusie" in handoff_page

    friction_page = pages[_page_index(pages, "Verdeling van het vertrekbeeld")]
    assert friction_page.index("Frictiescore") < friction_page.index("Verdeling van het vertrekbeeld")
    assert friction_page.index("Verdeling van het vertrekbeeld") < friction_page.index("Band n / %")


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
    assert len(pages) == 9
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
    assert len(pages) == 11
    assert 'Door Verisight' in pages[0]
    assert 'Segment deep dive' not in pages[0]
    assert 'Bron' in pages[0]
    assert 'Wat speelt nu' not in pages[0]
    assert 'Respons' in pages[1]
    assert 'Uitgenodigd' in pages[1]
    assert 'Ingevuld' in pages[1]
    assert 'Respons in context' in pages[1]
    assert 'Bestuurlijke handoff' in pages[2]
    assert 'Wat je hieruit moet concluderen' in pages[2]
    assert 'Retentiesignaal' in pages[3]
    assert 'Verdeling van het' in pages[3]
    assert 'Signalen in samenhang' in pages[4]
    assert 'Open signalen met besliswaarde' in pages[4]
    page_index = lambda needle: next(idx for idx, page in enumerate(pages) if needle in page)
    assert page_index('Drivers & prioriteitenbeeld') > page_index('Signalen in samenhang')
    assert page_index('SDT-basisbehoeften') > page_index('Drivers & prioriteitenbeeld')
    assert page_index('Organisatiefactoren') > page_index('SDT-basisbehoeften')
    assert page_index('Eerste route & actie') > page_index('Organisatiefactoren')
    assert page_index('Methodiek / leeswijzer') > page_index('Eerste route & actie')
    assert 'Review' in pages[page_index('Eerste route & actie')]
    assert 'Technische verantwoording' in pages[10]
    assert 'Onderliggende psychologische laag (SDT)' in pages[10]
    assert 'Segmentanalyse' not in ' '.join(pages)


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
    assert len(pages) == 11
    assert 'Segmentanalyse' not in ' '.join(pages[:-1])
    assert 'Respons' in pages[1]
    assert 'Bestuurlijke handoff' in pages[2]
    assert 'Organisatiefactoren' in pages[7]
    assert 'Methodiek / leeswijzer' in pages[9]
    assert 'Technische verantwoording' in pages[-1]
    assert 'Segmentanalyse niet beschikbaar' not in ' '.join(pages)


def test_generate_retention_report_uses_product_correct_language_and_clean_appendix_copy(db_session: Session):
    org = Organization(name="Retentie Taal BV", slug="retentie-taal-bv", contact_email="people@retentietaal.nl")
    db_session.add(org)
    db_session.flush()

    campaign = _build_campaign(
        db_session,
        organization=org,
        name="Retentie Taalcheck 2026",
        scan_type="retention",
        created_at=datetime.now(timezone.utc),
    )

    for idx in range(10):
        _add_response(
            db_session,
            campaign=campaign,
            idx=idx,
            department="Product" if idx < 5 else "People",
            role_level="manager" if idx < 5 else "specialist",
            exit_reason_code=None,
            risk_score=5.9 + (idx % 3) * 0.2,
            risk_band="MIDDEN",
            preventability=None,
            stay_intent_score=2,
            uwes_score=5.2,
            turnover_intention_score=5.8,
            open_text_raw="Werkdruk en groeiperspectief vragen snelle verificatie en opvolging.",
        )

    db_session.commit()

    pdf_bytes = generate_campaign_report(campaign.id, db_session)
    pages = _extract_pdf_pages(pdf_bytes)
    full_text = " ".join(pages)

    assert len(pages) == 11
    assert "Retentiesignaal / groepsduiding" in pages[3]
    assert "retentiesignaal" in full_text.lower()
    assert "stay-intent" in full_text.lower()
    assert "vertrekintentie" in full_text.lower()
    assert "bevlogenheid" in full_text.lower()
    assert "frictiescore" not in full_text.lower()
    assert "vertrekbeeld" not in full_text.lower()
    assert "exitbatch" not in full_text.lower()
    assert "Ã" not in full_text
    assert "�" not in full_text
    assert "verificatie of een eerste interventiestap" in pages[8].lower()
    assert "samenkomen in het retentiesignaal" in pages[10].lower()
    assert "samenkomen in de retentiesignaal" not in pages[10].lower()
    assert "opgenomen in het retentiesignaal" in pages[10].lower()
