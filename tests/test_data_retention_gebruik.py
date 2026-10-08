"""Opschoning van gebruiksgegevens zonder meting (vervolgronde 7-10, Taak 11).

Rijen in suite_telemetry_events en case_proof_registry zonder campaign_id
(nooit gekoppeld, of losgeraakt via on delete set null) worden twee jaar na
aanmaken verwijderd. Rijen met een meting gaan mee met die meting en worden
hier niet geraakt.

Altijd tegen een in-memory SQLite, nooit tegen productie. Beide tabellen
staan niet op het ORM-model en krijgen hier een minimale vorm.
"""
import uuid
from datetime import date, datetime, timedelta, timezone

import pytest
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from backend import data_retention as dr
from tests.test_data_retention import VANDAAG, _engine, _gesloten, _meting

TABELLEN = ("suite_telemetry_events", "case_proof_registry")
OUD = _gesloten(2026, 5, 15)         # 25 maanden voor VANDAAG (15 juni 2028)
# Net geen 23 maanden: verloopt 16 juli 2028, net buiten de vooruitblik van
# een maand. Een rij van precies 23 maanden valt er wel in (zie de grenstest).
JONG = _gesloten(2026, 7, 16)
HEEL_OUD = _gesloten(2026, 1, 1)     # 30 maanden
INHOUD = ("Sanne", "Piet", "sanne@")


def _maak_tabellen(engine, tabellen=TABELLEN, *, met_created_at: bool = True) -> None:
    with engine.begin() as con:
        for tabel in tabellen:
            con.execute(text("create table " + tabel + " (id char(36) primary key, "
                             "campaign_id char(36), payload text"
                             + (", created_at timestamp" if met_created_at else "") + ")"))


@pytest.fixture()
def engine():
    eng = _engine()
    _maak_tabellen(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def fabriek(engine):
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)


def _rij(engine, tabel: str, created: datetime | None, campaign_id: str | None = None) -> str:
    rid = str(uuid.uuid4())
    with engine.begin() as con:
        con.execute(text("insert into " + tabel + " (id, campaign_id, payload, created_at) "
                         "values (:i, :c, :p, :t)"),
                    {"i": rid, "c": campaign_id, "p": '{"door": "Sanne", "over": "Piet"}',
                     "t": created})
    return rid


def _ids(engine, tabel: str) -> set[str]:
    with engine.connect() as con:
        return {r[0] for r in con.execute(text("select id from " + tabel))}


def _regel(rapport, tabel: str):
    return next(r for r in rapport if r.tabel == tabel)


def test_dry_run_telt_verlopen_en_verwijdert_niets(engine, fabriek, capsys):
    oud = _rij(engine, "suite_telemetry_events", OUD)
    rapport = dr.opschonen_gebruik(fabriek, vandaag=VANDAAG, apply=False)
    regel = _regel(rapport, "suite_telemetry_events")
    assert (regel.status, regel.verlopen, regel.verwijderd) == ("ok", 1, 0)
    assert oud in _ids(engine, "suite_telemetry_events")
    assert dr.main([], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    assert ("GEBRUIK".ljust(15) + "tabel=suite_telemetry_events zonder meting: verlopen=1 "
            "binnen_termijn=0 zonder_datum=0 | dry-run: niets gewijzigd") in uit
    assert oud in _ids(engine, "suite_telemetry_events")


def test_dry_run_zet_elke_sessie_op_alleen_lezen_en_apply_niet(engine, fabriek, monkeypatch):
    _rij(engine, "suite_telemetry_events", OUD)
    sessies, alleen_lezen = [], []

    def tellende_fabriek():
        db = fabriek()
        sessies.append(db)
        return db

    monkeypatch.setattr(dr, "_alleen_lezen", lambda db: alleen_lezen.append(db))
    dr.opschonen_gebruik(tellende_fabriek, vandaag=VANDAAG, apply=False)
    assert len(sessies) == 2 and alleen_lezen == sessies          # een per tabel
    sessies.clear()
    alleen_lezen.clear()
    dr.opschonen_gebruik(tellende_fabriek, vandaag=VANDAAG, apply=True)
    assert len(sessies) == 2 and alleen_lezen == []


def test_apply_verwijdert_alleen_verlopen_rijen_zonder_meting(engine, fabriek, capsys):
    cid, _org = _meting(fabriek, slug="g1", gesloten=None, actief=True)
    weg, blijft, met_meting = {}, {}, {}
    for tabel in TABELLEN:
        weg[tabel] = _rij(engine, tabel, OUD)
        blijft[tabel] = _rij(engine, tabel, JONG)
        met_meting[tabel] = _rij(engine, tabel, HEEL_OUD, campaign_id=cid)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    for tabel in TABELLEN:
        assert _ids(engine, tabel) == {blijft[tabel], met_meting[tabel]}
        assert ("GEBRUIK".ljust(15) + "tabel=" + tabel + " zonder meting: verlopen=1 binnen_termijn=1 "
                "zonder_datum=0 | verwijderd=1") in uit
    assert ("SAMENVATTING GEBRUIKSGEGEVENS ZONDER METING (opgeschoond): suite_telemetry_events: "
            "1 verlopen, 1 verwijderd, 1 binnen de termijn, 0 zonder datum; case_proof_registry: "
            "1 verlopen, 1 verwijderd, 1 binnen de termijn, 0 zonder datum.") in uit


def test_tweede_apply_doet_niets(engine, fabriek, capsys):
    for tabel in TABELLEN:
        _rij(engine, tabel, OUD)
        _rij(engine, tabel, JONG)
    eerste = dr.opschonen_gebruik(fabriek, vandaag=VANDAAG, apply=True)
    assert all(r.verwijderd == 1 for r in eerste)
    tweede = dr.opschonen_gebruik(fabriek, vandaag=VANDAAG, apply=True)
    for r in tweede:
        assert (r.status, r.verlopen, r.verwijderd, r.binnen_termijn) == ("ok", 0, 0, 1)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    assert ("suite_telemetry_events: 0 verlopen, 0 verwijderd, 1 binnen de termijn"
            in capsys.readouterr().out)


def test_grens_volgt_dezelfde_dagberekening_en_vooruitblik_als_leads(engine, fabriek):
    # Aangemaakt 15 juni 2026 om 23:30 UTC = 16 juni 01:30 Nederlandse tijd.
    aangemaakt = datetime(2026, 6, 15, 23, 30, tzinfo=timezone.utc)
    rid = _rij(engine, "case_proof_registry", aangemaakt)
    verloopt = dr._plus_maanden(dr._sluitdag(aangemaakt), dr.GEBRUIK_TERMIJN_MAANDEN)
    # De eerste dag waarop de run hem pakt, afgeleid uit de gedeelde regel.
    kandidaten = [verloopt - timedelta(days=d) for d in range(80, -1, -1)]
    grens = next(d for d in kandidaten if dr._termijn_verstreken(verloopt, d))
    assert not dr._termijn_verstreken(verloopt, grens - timedelta(days=1))
    assert grens < verloopt                       # de vooruitblik doet mee
    assert dr.VOORUITBLIK_MAANDEN == 1

    ervoor = dr.opschonen_gebruik(fabriek, vandaag=grens - timedelta(days=1), apply=True)
    assert _regel(ervoor, "case_proof_registry").binnen_termijn == 1
    assert rid in _ids(engine, "case_proof_registry")
    erop = dr.opschonen_gebruik(fabriek, vandaag=grens, apply=True)
    regel = _regel(erop, "case_proof_registry")
    assert (regel.verlopen, regel.verwijderd) == (1, 1)
    assert rid not in _ids(engine, "case_proof_registry")


def test_rij_zonder_aanmaakdatum_wordt_niet_geraakt_en_is_rood(engine, fabriek, capsys):
    zonder = _rij(engine, "suite_telemetry_events", None)
    oud = _rij(engine, "suite_telemetry_events", OUD)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert _ids(engine, "suite_telemetry_events") == {zonder}
    assert oud not in _ids(engine, "suite_telemetry_events")
    assert "zonder_datum=1 | verwijderd=1" in uit
    rapport = dr.opschonen_gebruik(fabriek, vandaag=VANDAAG, apply=False)
    assert _regel(rapport, "suite_telemetry_events").zonder_datum == 1


def test_ontbrekende_tabel_wordt_gemeld_en_de_andere_gaat_door(capsys):
    engine = _engine()
    _maak_tabellen(engine, ("case_proof_registry",))
    fabriek = sessionmaker(bind=engine)
    oud = _rij(engine, "case_proof_registry", OUD)
    assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 0
    uit = capsys.readouterr().out
    assert "LET OP: tabel suite_telemetry_events bestaat niet in deze database; overgeslagen." in uit
    assert "tabel=suite_telemetry_events" not in uit
    assert oud not in _ids(engine, "case_proof_registry")
    assert "suite_telemetry_events: tabel bestaat niet;" in uit
    engine.dispose()


def test_tabel_zonder_aanmaakkolom_wordt_overgeslagen_en_is_rood(capsys):
    engine = _engine()
    _maak_tabellen(engine, ("suite_telemetry_events",), met_created_at=False)
    _maak_tabellen(engine, ("case_proof_registry",))
    fabriek = sessionmaker(bind=engine)
    with engine.begin() as con:
        con.execute(text("insert into suite_telemetry_events (id, payload) values (:i, 'Sanne')"),
                    {"i": str(uuid.uuid4())})
    oud = _rij(engine, "case_proof_registry", OUD)
    for argv in ([], ["--apply"]):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 1
        uit = capsys.readouterr().out
        assert "LET OP: tabel suite_telemetry_events mist created_at" in uit
        assert "tabel=suite_telemetry_events" not in uit
    assert len(_ids(engine, "suite_telemetry_events")) == 1
    assert oud not in _ids(engine, "case_proof_registry")
    engine.dispose()


def test_fout_bij_verwijderen_rolt_alleen_die_tabel_terug(engine, fabriek, monkeypatch, capsys,
                                                         caplog):
    kapot = _rij(engine, "suite_telemetry_events", OUD)
    goed = _rij(engine, "case_proof_registry", OUD)
    echte = dr._verwijder_gebruik

    class NepDbFout(Exception):
        pgcode = "23503"

    def soms_kapot(db, tabel, ids):
        aantal = echte(db, tabel, ids)
        if tabel == "suite_telemetry_events":
            raise NepDbFout('DETAIL: Failing row contains ({"door": "Sanne", "over": "Piet"})')
        return aantal

    monkeypatch.setattr(dr, "_verwijder_gebruik", soms_kapot)
    with caplog.at_level("DEBUG", logger="backend.data_retention"):
        assert dr.main(["--apply"], session_factory=fabriek, vandaag=VANDAAG) == 1
    uit = capsys.readouterr().out
    assert kapot in _ids(engine, "suite_telemetry_events")          # teruggerold
    assert goed not in _ids(engine, "case_proof_registry")
    regel = next(r for r in uit.splitlines() if "tabel=suite_telemetry_events" in r)
    assert regel.startswith("FOUT") and "NepDbFout pgcode=23503 (teruggedraaid)" in regel
    log = caplog.text + "".join(str(r.exc_info) + str(r.args) for r in caplog.records)
    for tekst in (uit, log):
        for verboden in INHOUD + ("Failing row",):
            assert verboden not in tekst, verboden


def test_op_verzoek_raakt_geen_gebruiksgegevens(engine, fabriek, capsys):
    rid = _rij(engine, "suite_telemetry_events", OUD)
    cid, org = _meting(fabriek, slug="gv", gesloten=_gesloten(2025, 1, 1))
    for argv in (["--apply", "--campagne", cid], ["--apply", "--organisatie", org]):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 0
        uit = capsys.readouterr().out
        assert "GEBRUIK" not in uit and "GEBRUIKSGEGEVENS" not in uit
    assert rid in _ids(engine, "suite_telemetry_events")


def test_samenvattingen_onderaan_en_de_metingen_als_laatste(engine, fabriek, capsys):
    for tabel in TABELLEN:
        _rij(engine, tabel, OUD)
    uitvoer = {}
    for argv in ([], ["--apply"]):
        assert dr.main(argv, session_factory=fabriek, vandaag=VANDAAG) == 0
        uit = uitvoer[bool(argv)] = capsys.readouterr().out
        regels = uit.splitlines()
        # De samenvatting van de metingen blijft de laatste regel (Deel C.3);
        # die van de gebruiksgegevens staat direct na die van leads en dossiers.
        assert regels[-1].startswith("SAMENVATTING (")
        assert regels[-2].startswith("SAMENVATTING GEBRUIKSGEGEVENS ZONDER METING (")
        assert regels[-3].startswith("SAMENVATTING LEADS EN DOSSIERS (")
        for verboden in INHOUD:
            assert verboden not in uit, verboden
    assert ("SAMENVATTING GEBRUIKSGEGEVENS ZONDER METING (dry-run): suite_telemetry_events: "
            "1 verlopen, 0 verwijderd, 0 binnen de termijn, 0 zonder datum; case_proof_registry: "
            "1 verlopen, 0 verwijderd, 0 binnen de termijn, 0 zonder datum.") in uitvoer[False]
