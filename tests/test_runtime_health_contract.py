from __future__ import annotations

import pytest
from fastapi import HTTPException

from backend.runtime import require_backend_admin_token, validate_runtime_config


def test_admin_token_enforced_when_configured_even_outside_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Fail-closed: als het token gezet is, wordt het afgedwongen ongeacht ENVIRONMENT."""
    monkeypatch.setenv("BACKEND_ADMIN_TOKEN", "geheim")

    # Ontbrekend/verkeerd token wordt geweigerd, óók als is_production False is
    # (bijv. wanneer ENVIRONMENT ontbreekt of verkeerd gespeld is).
    with pytest.raises(HTTPException) as exc_info:
        require_backend_admin_token(None, is_production=False)
    assert exc_info.value.status_code == 403

    with pytest.raises(HTTPException) as exc_info:
        require_backend_admin_token("fout", is_production=False)
    assert exc_info.value.status_code == 403

    # Correct token wordt geaccepteerd (geen exception).
    require_backend_admin_token("geheim", is_production=False)


def test_admin_token_missing_config_fails_closed_in_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("BACKEND_ADMIN_TOKEN", raising=False)

    # Productie zonder geconfigureerd token: 503 (misconfiguratie, fail-closed).
    with pytest.raises(HTTPException) as exc_info:
        require_backend_admin_token("iets", is_production=True)
    assert exc_info.value.status_code == 503

    # Buiten productie zonder token: toegestaan (dev-gemak).
    require_backend_admin_token(None, is_production=False)


def test_validate_runtime_config_requires_only_database_url_in_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://example")
    monkeypatch.delenv("FRONTEND_URL", raising=False)
    monkeypatch.delenv("BACKEND_URL", raising=False)
    monkeypatch.delenv("RESEND_API_KEY", raising=False)

    validate_runtime_config(is_production=True)


def test_health_is_liveness_friendly_when_database_is_down(
    client,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("backend.main.check_db_connection", lambda: False)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "degraded", "checks": {"database": False}}


def test_ready_stays_strict_when_database_is_down(
    client,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("backend.main.check_db_connection", lambda: False)

    response = client.get("/api/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "degraded", "checks": {"database": False}}
