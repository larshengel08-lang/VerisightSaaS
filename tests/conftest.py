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


# ─── Gedeelde rapport-fixtures ───────────────────────────────────────────────

def exit_report_data(*, factor_avgs: dict[str, float],
                     factor_items_map: dict[str, list[tuple[str, str]]],
                     exit_r_dist: list[dict] | None = None,
                     n: int = 12) -> dict:
    """Minimale, volledige data-dict voor render_exit_report_html.

    Gebouwd door alle data[...]/data.get(...)-toegangen in
    render_exit_report_html (backend/report_html.py) te lezen; er bestaat geen
    productie-equivalent dat een echte rapport-payload opbouwt zonder database.

    Gedeeld door tests/test_report_priority_consistency.py (startpunt == p.02)
    en tests/test_report_exit_kernzin.py (startpunt != laagste score). Beide
    hadden een byte-voor-byte identieke dict-vorm; alleen de *data* verschilt,
    en die geeft de aanroeper mee. Item-gemiddelden worden afgeleid van de
    factorscore, zodat een factor en zijn stellingen niet uit elkaar kunnen
    lopen -- voor ELK item, niet alleen het eerste: met twee items per factor
    kreeg het tweede stilzwijgend "n.b." in de gerenderde tabellen.

    top_fkeys/top_flabels en completion_pct zijn afgeleid in plaats van vast.
    Productie (build_report_data) zet top_fkeys op de twee laagst scorende
    factoren en berekent het responspercentage uit n en n_invited; een
    hardgecodeerde "growth" en een vaste 80,0% spraken de meegegeven data
    tegen zodra een aanroeper andere scores of een andere n koos.
    """
    from backend.report_html import _fl

    item_avgs = {ik: factor_avgs[fk]
                 for fk, items in factor_items_map.items()
                 for ik, _ in items}
    invited = n + 3
    top_fkeys = sorted(factor_avgs, key=lambda fk: (factor_avgs[fk], fk))[:2]
    return dict(
        campaign_id="c1", scan_type="exit", scan_lbl="Loep Vertrek",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-09-2026",
        n_invited=invited, n_completed=n,
        completion_pct=round(100.0 * n / invited, 1), avg_risk=5.5,
        factor_avgs=dict(factor_avgs),
        top_fkeys=top_fkeys,
        top_flabels=[_fl(fk, "exit") for fk in top_fkeys],
        factor_items_map={fk: list(items) for fk, items in factor_items_map.items()},
        org_item_avgs=item_avgs,
        sdt_item_avgs={}, sdt_avgs={}, nsp={},
        exit_r_dist=list(exit_r_dist or []), cont_dist=[],
        deepening_agg={}, factor_resp_scores={},
        segment_rows=[], segment_factor_rows=None,
        enps_available=False, enps_score=None,
        sdt_items=[], open_texts=[],
    )
