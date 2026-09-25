"""Een opgeschoonde meting is ook via de org-API eerlijk (fixronde 24-9, Deel C,
Taak 20c). Na de opschoning zijn respondents en survey_responses weg; zonder
deze check gaven /stats en /respondents "0 ingevuld" en een lege lijst, alsof de
meting te weinig antwoorden had. SQLite via de gedeelde fixtures; nooit productie.

Onderaan: de pariteitstest tussen de 410-zin van de backend en de frontend.
"""
import re
from datetime import datetime, timezone
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend import data_retention as dr
from backend.data_retention import ReportDataPurged
from backend.models import Campaign, Organization, OrganizationSecret, Respondent

PADEN = ["/api/campaigns/{id}/stats", "/api/campaigns/{id}/respondents"]


def _meting(db: Session, *, met_kolom: bool, opgeschoond: bool, slug: str = "org-api",
            api_key: str = "key-api") -> str:
    if met_kolom:
        db.execute(text("alter table campaigns add column data_purged_at timestamp"))
    org = Organization(name="Org", slug=slug, contact_email="hr@org.nl")
    db.add(org)
    db.flush()
    db.add(OrganizationSecret(org_id=org.id, api_key=api_key))
    camp = Campaign(organization=org, name="Meting", scan_type="retention", is_active=False,
                    closed_at=datetime(2025, 1, 1, tzinfo=timezone.utc))
    db.add(camp)
    db.flush()
    if not opgeschoond:
        db.add(Respondent(campaign_id=camp.id, department="Zorg"))
    db.commit()
    if opgeschoond:
        db.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                   {"ts": datetime(2027, 1, 2, 3, 0), "id": camp.id})
        db.commit()
    return camp.id


def _assert_melding(detail: str) -> None:
    assert "zijn op 2 januari 2027 verwijderd" in detail
    assert "volgens de bewaartermijn of op verzoek van jullie organisatie" in detail


@pytest.mark.parametrize("pad", PADEN)
def test_opgeschoonde_meting_geeft_410_met_reden(client, db_session: Session, pad):
    cid = _meting(db_session, met_kolom=True, opgeschoond=True)
    res = client.get(pad.format(id=cid), headers={"x-api-key": "key-api"})
    assert res.status_code == 410
    _assert_melding(res.json()["detail"])


@pytest.mark.parametrize("pad", PADEN)
def test_andere_organisatie_krijgt_404_en_leert_niets(client, db_session: Session, pad):
    """Autorisatie eerst: wie de meting niet mag zien, leert via de 410 niet
    dat ze bestaat of is opgeschoond."""
    cid = _meting(db_session, met_kolom=True, opgeschoond=True)
    ander = Organization(name="Ander", slug="ander-api", contact_email="hr@ander.nl")
    db_session.add(ander)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=ander.id, api_key="key-ander"))
    db_session.commit()
    res = client.get(pad.format(id=cid), headers={"x-api-key": "key-ander"})
    assert res.status_code == 404
    assert "verwijderd" not in res.text


@pytest.mark.parametrize("pad", PADEN)
def test_onbekende_sleutel_krijgt_geen_410(client, db_session: Session, pad):
    cid = _meting(db_session, met_kolom=True, opgeschoond=True)
    res = client.get(pad.format(id=cid), headers={"x-api-key": "fout"})
    assert res.status_code == 401
    assert "verwijderd" not in res.text


@pytest.mark.parametrize("met_kolom", [True, False])
def test_niet_opgeschoonde_meting_gaat_gewoon_door(client, db_session: Session, met_kolom):
    """Met de kolom maar zonder opschoning, en zonder de kolom (migratie nog
    niet gedraaid): geen 410 en geen crash, de gewone cijfers."""
    cid = _meting(db_session, met_kolom=met_kolom, opgeschoond=False)
    stats = client.get("/api/campaigns/" + cid + "/stats", headers={"x-api-key": "key-api"})
    assert stats.status_code == 200
    assert stats.json()["total_invited"] == 1
    resp = client.get("/api/campaigns/" + cid + "/respondents", headers={"x-api-key": "key-api"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


# ── Pariteit: backendzin (ReportDataPurged) en frontend ─────────────────────

_FRONTEND = Path(__file__).resolve().parents[1] / "frontend" / "lib"


def _functie(bron: str, naam: str) -> str:
    start = bron.index("export function " + naam + "(")
    einde = bron.find("\nexport ", start + 1)
    return bron[start:] if einde == -1 else bron[start:einde]


def _ts_string(bron: str, naam: str) -> str:
    m = re.search(r"const " + naam + r" = '([^']*)'", bron)
    assert m, naam + " niet gevonden"
    return m.group(1)


def test_dezelfde_zin_in_backend_en_dashboard():
    """De frontend (data-purged.ts) moet exact de 410-zin van de backend tonen,
    zodat campagnepagina, rapportenoverzicht en downloadknop hetzelfde zeggen."""
    backend = str(ReportDataPurged(datetime(2027, 1, 2, 3, 0, tzinfo=timezone.utc)))
    bron = (_FRONTEND / "dashboard" / "data-purged.ts").read_text(encoding="utf-8")
    reden = re.search(r"return `([^`]*)`", _functie(bron, "dataPurgedReason"))
    assert reden, "dataPurgedReason bouwt zijn zin niet uit één template literal"
    staart = _ts_string(bron, "PURGED_REPORT_TAIL")
    frontend = reden.group(1).replace("${dag}", "2 januari 2027") + " " + staart
    assert frontend == backend
    assert "`${dataPurgedReason(purgedAtIso)} ${PURGED_REPORT_TAIL}`" in _functie(bron, "dataPurgedMessage")
    # Zelfde terugval zonder leesbare datum.
    onbekend = reden.group(1).replace("${dag}", "een onbekende datum") + " " + staart
    assert "?? 'een onbekende datum'" in _functie(bron, "dataPurgedReason")
    assert onbekend == str(ReportDataPurged(None))


def test_middernacht_valt_in_beide_op_de_nederlandse_dag():
    """23:30 UTC op 1 januari is 00:30 op 2 januari in Nederland. De backend
    (_datum_nl) leest de Nederlandse kalenderdag; de frontend (formatDutchDate)
    ook, via timeZone Europe/Amsterdam. Beide moeten "2 januari 2027" zeggen."""
    moment = datetime(2027, 1, 1, 23, 30, tzinfo=timezone.utc)
    assert "zijn op 2 januari 2027 verwijderd" in str(ReportDataPurged(moment))
    datum = (_FRONTEND / "dashboard" / "format-dutch-date.ts").read_text(encoding="utf-8")
    assert "timeZone: 'Europe/Amsterdam'" in datum
    test = (_FRONTEND / "dashboard" / "data-purged.test.ts").read_text(encoding="utf-8")
    assert "dataPurgedReason('2027-01-01T23:30:00Z')" in test
    assert "zijn op 2 januari 2027 verwijderd" in test


def test_downloadknop_herkent_de_backendzin():
    backend = str(ReportDataPurged(datetime(2027, 1, 2, 3, 0, tzinfo=timezone.utc)))
    bron = (_FRONTEND / "report-download-error.ts").read_text(encoding="utf-8")
    assert backend.startswith(_ts_string(bron, "PURGED_DETAIL_PREFIX"))


# ── Kolomcheck: één keer "ja" onthouden, "nee" nooit ────────────────────────

def test_kolom_bestaat_wordt_onthouden(db_session: Session, monkeypatch):
    cid = _meting(db_session, met_kolom=True, opgeschoond=True)
    assert dr.data_purged_at(db_session, cid) is not None
    aanroepen: list[str] = []
    echt = dr._kolommen

    def tel(db, tabel):
        aanroepen.append(tabel)
        return echt(db, tabel)

    monkeypatch.setattr(dr, "_kolommen", tel)
    for _ in range(3):
        with pytest.raises(ReportDataPurged):
            dr.ensure_report_data_available(db_session, cid)
    assert aanroepen == []


def test_ontbrekende_kolom_wordt_niet_onthouden(db_session: Session):
    """Zonder kolom: geen opschoning. Draait de migratie daarna, dan ziet
    dezelfde (draaiende) server dat meteen, zonder herstart."""
    cid = _meting(db_session, met_kolom=False, opgeschoond=False)
    assert dr.data_purged_at(db_session, cid) is None
    assert dr.data_purged_at(db_session, cid) is None
    db_session.execute(text("alter table campaigns add column data_purged_at timestamp"))
    db_session.execute(text("update campaigns set data_purged_at = :ts where id = :id"),
                       {"ts": datetime(2027, 1, 2, 3, 0), "id": cid})
    db_session.commit()
    with pytest.raises(ReportDataPurged):
        dr.ensure_report_data_available(db_session, cid)


def test_onthouden_geldt_per_database(db_session: Session):
    """Een andere database zonder de kolom leert niets van de eerste."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from backend.models import Base

    cid = _meting(db_session, met_kolom=True, opgeschoond=True)
    assert dr.data_purged_at(db_session, cid) is not None
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    ander = sessionmaker(bind=engine)()
    try:
        cid2 = _meting(ander, met_kolom=False, opgeschoond=False, slug="org-ander-db")
        assert dr.data_purged_at(ander, cid2) is None   # geen fout op een ontbrekende kolom
    finally:
        ander.close()
        engine.dispose()
