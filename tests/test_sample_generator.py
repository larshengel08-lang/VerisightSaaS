from __future__ import annotations

import generate_voorbeeldrapport as sample_generator
from backend.models import Organization


def test_pick_exit_profile_keeps_exit_reason_fields(monkeypatch):
    monkeypatch.setattr(sample_generator.random, "random", lambda: 0.1)

    profile = sample_generator._pick_profile(sample_generator.EXIT_PROFILES)

    assert profile["name"] == "leiderschap_probleem"
    assert profile["reason_category"] == "leiderschap"
    assert profile["reason_code"] == "P1"
    assert "engagement_base" not in profile


def test_pick_retention_profile_keeps_signal_bases(monkeypatch):
    monkeypatch.setattr(sample_generator.random, "random", lambda: 0.1)

    profile = sample_generator._pick_profile(sample_generator.RETENTION_PROFILES)

    assert profile["name"] == "bevlogen_kern"
    assert profile["engagement_base"] == 4.7
    assert profile["turnover_base"] == 1.4
    assert "reason_category" not in profile


def test_get_or_create_demo_org_uses_fixed_demo_slug(db_session):
    other_org = Organization(name="Andere Org", slug="andere-org", contact_email="hr@andere.nl")
    db_session.add(other_org)
    db_session.commit()

    demo_org, created = sample_generator._get_or_create_demo_org(db_session)

    assert created is True
    assert demo_org.slug == sample_generator.DEMO_ORG_SLUG
    assert demo_org.name == sample_generator.DEMO_ORG_NAME
    assert demo_org.contact_email == sample_generator.DEMO_ORG_EMAIL


def test_get_or_create_demo_org_refreshes_existing_demo_org(db_session):
    existing_demo_org = Organization(
        name="Oude Demo Naam",
        slug=sample_generator.DEMO_ORG_SLUG,
        contact_email="oud@demo.nl",
        is_active=False,
    )
    db_session.add(existing_demo_org)
    db_session.commit()

    demo_org, created = sample_generator._get_or_create_demo_org(db_session)

    assert created is False
    assert demo_org.id == existing_demo_org.id
    assert demo_org.name == sample_generator.DEMO_ORG_NAME
    assert demo_org.contact_email == sample_generator.DEMO_ORG_EMAIL
    assert demo_org.is_active is True


def test_resolved_output_paths_write_to_docs_and_public_examples():
    paths = sample_generator._resolved_output_paths(sample_generator.EXIT_CONFIG)

    normalized_paths = [str(path).replace('\\', '/') for path in paths]

    assert normalized_paths[0].endswith('/docs/examples/voorbeeldrapport_verisight.pdf')
    assert normalized_paths[1].endswith('/frontend/public/examples/voorbeeldrapport_verisight.pdf')
