from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.dialects import postgresql
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from backend.database import _repair_contact_request_schema
from backend.main import app
from backend.models import CampaignDeliveryRecord, ContactRequest, PilotLearningDossier


def test_contact_request_schema_repair_upgrades_legacy_table(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE contact_requests (
                    id TEXT PRIMARY KEY,
                    name VARCHAR(120) NOT NULL,
                    work_email VARCHAR(255) NOT NULL,
                    organization VARCHAR(255) NOT NULL,
                    employee_count VARCHAR(80) NOT NULL,
                    current_question TEXT NOT NULL,
                    website VARCHAR(255),
                    notification_sent BOOLEAN NOT NULL DEFAULT 0,
                    created_at DATETIME,
                    notification_error TEXT
                )
                """
            )
        )

    monkeypatch.setattr("backend.database.engine", engine)

    _repair_contact_request_schema()

    repaired_columns = {column["name"] for column in inspect(engine).get_columns("contact_requests")}
    expected_columns = {column.name for column in ContactRequest.__table__.columns}

    assert expected_columns.issubset(repaired_columns)


def test_startup_repairs_contact_request_schema_for_non_sqlite(monkeypatch):
    calls: list[str] = []

    monkeypatch.setattr("backend.main.validate_runtime_config", lambda **kwargs: None)
    monkeypatch.setattr("backend.main._IS_SQLITE", False)
    monkeypatch.setattr(
        "backend.database._repair_contact_request_schema",
        lambda: calls.append("repair"),
    )

    with TestClient(app):
        pass

    assert calls == ["repair"]


def test_contact_request_ids_stay_string_based_on_postgres():
    dialect = postgresql.dialect()

    contact_id_type = ContactRequest.__table__.c.id.type.compile(dialect=dialect)
    delivery_fk_type = CampaignDeliveryRecord.__table__.c.contact_request_id.type.compile(dialect=dialect)
    dossier_fk_type = PilotLearningDossier.__table__.c.contact_request_id.type.compile(dialect=dialect)

    assert contact_id_type.lower() != "uuid"
    assert delivery_fk_type.lower() != "uuid"
    assert dossier_fk_type.lower() != "uuid"
