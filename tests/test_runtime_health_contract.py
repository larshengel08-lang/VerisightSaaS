from __future__ import annotations

import pytest

from backend.runtime import validate_runtime_config


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
