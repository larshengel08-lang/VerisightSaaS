from __future__ import annotations

from collections.abc import Generator
from functools import lru_cache

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base
from backend.email import EmailSendResult
from backend.main import _contact_request_buckets, app, get_db


@lru_cache(maxsize=1)
def _weasyprint_can_render() -> bool:
    """Doet een echte render, niet alleen een import-check.

    WeasyPrint importeert soms zonder fout maar faalt pas bij het laden van
    GTK/Pango (libgobject e.d.) — met name op Windows zonder GTK3-runtime.
    Tests die een echt "loep-v6" PDF verwachten, slaan over als dit False is,
    i.p.v. vals te slagen tegen de legacy ReportLab-fallback (die sinds de
    Fail-Loud-fix niet meer stilzwijgend inspringt). Zie CLAUDE.md: lokale
    PDF-validatie op Windows via de WeasyPrint-Docker-image
    (ghcr.io/weasyprint/weasyprint), productie via Railway/nixpacks-GTK.
    """
    try:
        from weasyprint import HTML
        HTML(string="<html><body>weasyprint-check</body></html>").write_pdf()
        return True
    except Exception:
        return False


requires_weasyprint = pytest.mark.skipif(
    not _weasyprint_can_render(),
    reason="WeasyPrint (GTK/Pango) kan hier niet renderen — valideer lokaal via "
           "de WeasyPrint-Docker-image, zie CLAUDE.md.",
)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session: Session, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    monkeypatch.setattr("backend.main.send_hr_notification", lambda **kwargs: True)
    monkeypatch.setattr("backend.main.send_contact_request_result", lambda **kwargs: EmailSendResult(ok=True))
    _contact_request_buckets.clear()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        _contact_request_buckets.clear()
