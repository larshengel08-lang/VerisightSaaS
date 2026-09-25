"""Bewaartermijn van metinggegevens (fixronde 24-9, Deel C; open punt L6 uit de
security-audit van juli).

De privacyverklaring (P6) en de verwerkersovereenkomst (D5) beloven: uiterlijk
twee jaar na het sluiten van een meting verwijdert of anonimiseert Loep de
gegevens, of eerder op verzoek, tenzij schriftelijk een andere termijn is
afgesproken. Deze module doet dat. Wat er per tabel gebeurt en waarom staat in
docs/superpowers/plans/2026-09-24-fixronde-leesronde.md, Deel C.1.

Gebruik (standaard dry-run, schrijft niets):
    python -m backend.data_retention
    python -m backend.data_retention --campagne <uuid> [--campagne <uuid>]
    python -m backend.data_retention --organisatie <uuid>
    python -m backend.data_retention --apply

campaigns.data_purged_at en organizations.retention_months (migratie
2026_09_24_add_data_retention.sql) staan bewust NIET op het ORM-model: een
kolom op het model komt in elke SELECT op die tabel, en een niet-gedraaide
migratie legde op 13 september elk rapport plat. Deze module leest en schrijft
ze met losse SQL en controleert eerst of ze bestaan.

Periodiek: maandelijks, als Railway-cronservice uit hetzelfde Dockerfile met
schema `0 3 1 * *` (de 1e van de maand, 03:00 UTC) en startcommando
`python -m backend.data_retention --apply`. Een run is idempotent: wat al is
opgeschoond, slaat hij over. Aanzetten doet Lars, na de migratie en na één
handmatige dry-run.

Vooruitblik: de maandelijkse run schoont een meting al op als haar termijn
binnen één cronperiode (VOORUITBLIK_MAANDEN, een maand) afloopt. Zonder die
vooruitblik zou een termijn die net na een run afloopt pas bij de volgende run
worden opgeschoond, tot een maand na "uiterlijk twee jaar". Zo is de opschoning
nooit te laat en hooguit een maand vroeg. Opschonen op verzoek kijkt niet naar
de termijn en heeft dus ook geen vooruitblik.

Indeling: per soort gegevens een eigen inventaris-, tel- en opschoonfunctie en
een eigen Rapportage. Nu alleen metingen (opschonen); leads en leerdossiers
(contact_requests, pilot_learning_*) komen er als eigen functies naast, met
dezelfde regels: dry-run standaard, één transactie per eenheid, tweede run
doet niets.
"""
from __future__ import annotations

import argparse
import calendar
import logging
import sys
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Callable, Iterable

from sqlalchemy import Boolean, DateTime, Integer, bindparam, inspect, select, text
from sqlalchemy.orm import Session

from backend.models import (
    GUID,
    Campaign,
    CampaignDecision,
    CampaignDeliveryCheckpoint,
    CampaignDeliveryRecord,
    Organization,
    Respondent,
    SurveyResponse,
)
from backend.survey_window import AMSTERDAM, today_amsterdam

logger = logging.getLogger(__name__)

STANDAARD_TERMIJN_MAANDEN = 24
# Eén cronperiode: de periodieke run draait maandelijks (Railway, 0 3 1 * *).
# Verandert het schema, dan verandert deze constante mee. Zie de docstring.
VOORUITBLIK_MAANDEN = 1
MIGRATIE = "migrations/2026_09_24_add_data_retention.sql"

# Tabellen buiten het ORM met rijen per meting. Alleen geraakt als de tabel en
# de kolom bestaan (in een verse of lokale database ontbreken ze vaak). De
# namen zijn vaste constanten, geen invoer: ze mogen in de SQL-tekst.
NIET_ORM_TABELLEN: tuple[tuple[str, str], ...] = (
    ("campaign_action_audit_events", "campaign_id"),
    # Eerst de acties (cascade: action_reviews), dan de managerreacties. Op
    # Postgres ruimt de cascade vanuit manager_responses de acties ook op, maar
    # een actie heeft een eigen campaign_id; zo hangt het niet van die ene
    # koppeling af.
    ("action_center_route_actions", "campaign_id"),
    ("action_center_manager_responses", "campaign_id"),
    ("action_center_route_relations", "source_campaign_id"),
    ("action_center_route_relations", "target_campaign_id"),
    ("action_center_review_decisions", "route_source_id"),
    # Tabellen met route_source_id naar de meting (gecontroleerd tegen
    # supabase/schema.sql): mailadressen van ontvangers en organisatoren,
    # redenen en wie iets wijzigde, gebruikers-id's in gebeurtenissen.
    ("action_center_follow_through_mail_events", "route_source_id"),
    ("action_center_graph_calendar_links", "route_source_id"),
    ("action_center_review_schedule_revisions", "route_source_id"),
    ("action_center_adoption_events", "route_source_id"),
    ("action_center_bounded_execution_events", "route_source_id"),
    ("action_center_review_rhythm_configs", "route_source_id"),
    ("action_center_governance_interventions", "route_source_id"),
)

_Q_PURGED = (text("select data_purged_at from campaigns where id = :id")
             .bindparams(bindparam("id", type_=GUID()))
             .columns(data_purged_at=DateTime(timezone=True)))
# Alleen van leeg naar gevuld: een tweede opschoning van dezelfde meting (door
# een parallelle run) raakt 0 rijen en rolt dan alles terug.
_U_PURGED = text("update campaigns set data_purged_at = :ts where id = :id "
                 "and data_purged_at is null").bindparams(
    bindparam("id", type_=GUID()), bindparam("ts", type_=DateTime(timezone=True)))
_SQL_CAMPAGNE = ("select is_active, closed_at, data_purged_at, organization_id "
                 "from campaigns where id = :id")
_Q_TERMIJN = (text("select retention_months from organizations where id = :id")
              .bindparams(bindparam("id", type_=GUID()))
              .columns(retention_months=Integer()))


class RetentieMigratieOntbreekt(RuntimeError):
    """--apply zonder de kolommen van de migratie: stoppen, niets raden."""


class MetingVeranderd(RuntimeError):
    """De meting voldoet in de opschoontransactie niet meer aan de voorwaarden.

    Bijvoorbeeld heropend of een langere termijn gekregen tussen de inventaris
    en de opschoning. De transactie rolt terug; de meting staat als fout in de
    uitvoer. `nu` is een status uit een vaste lijst, geen inhoud.
    """

    def __init__(self, nu: str) -> None:
        self.nu = nu
        super().__init__("meting veranderde na de inventaris: nu " + nu)


class ReportDataPurged(Exception):
    """Het rapport kan niet meer gemaakt worden: de gegevens zijn verwijderd."""

    def __init__(self, purged_at: datetime) -> None:
        from backend.report_html import _datum_nl
        self.purged_at = purged_at
        super().__init__(
            "De gegevens van deze meting zijn op " + (_datum_nl(purged_at) or "een onbekende datum")
            + " verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. "
            "Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is "
            "gedownload, blijft geldig.")


def _kolommen(db: Session, tabel: str) -> set[str]:
    """Kolommen van een tabel, leeg als de tabel niet bestaat.

    Via de verbinding van de sessie zelf, niet via de engine: een inspector op
    de engine haalt een verbinding uit de pool en geeft hem terug met een
    rollback. Bij één gedeelde verbinding (SQLite StaticPool in de tests) zou
    dat de lopende opschoning halverwege terugdraaien.
    """
    insp = inspect(db.connection())
    if not insp.has_table(tabel):
        return set()
    return {c["name"] for c in insp.get_columns(tabel)}


def migratie_gedraaid(db: Session) -> bool:
    return ("data_purged_at" in _kolommen(db, "campaigns")
            and "retention_months" in _kolommen(db, "organizations"))


def data_purged_at(db: Session, campaign_id: str) -> datetime | None:
    """Wanneer de gegevens van deze meting zijn verwijderd, of None.

    Zonder de kolom kan er niets zijn opgeschoond: opschonen() weigert --apply
    zonder migratie. None is dan de waarheid, geen terugval.
    """
    if "data_purged_at" not in _kolommen(db, "campaigns"):
        return None
    return db.execute(_Q_PURGED, {"id": campaign_id}).scalar()


def ensure_report_data_available(db: Session, campaign_id: str) -> None:
    """Fail Loud voor elke rapportroute: na de opschoning een leesbare reden."""
    purged = data_purged_at(db, campaign_id)
    if purged is not None:
        raise ReportDataPurged(purged)


def _plus_maanden(d: date, maanden: int) -> date:
    totaal = d.year * 12 + (d.month - 1) + maanden
    jaar, maand0 = divmod(totaal, 12)
    maand = maand0 + 1
    return date(jaar, maand, min(d.day, calendar.monthrange(jaar, maand)[1]))


def _utc(moment: datetime) -> datetime:
    """Een naive datetime (SQLite) is UTC, net als in _sluitdag."""
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def _sluitdag(closed_at: datetime) -> date:
    """De dag van sluiten in Nederlandse tijd; een naive datetime is UTC."""
    moment = _utc(closed_at)
    return moment.astimezone(AMSTERDAM).date()


@dataclass
class Meting:
    campaign_id: str
    organization_id: str | None
    # verlopen | opgeschoond | binnen_termijn | open | gestopt_zonder_sluitdatum |
    # al_opgeschoond | heropend_na_opschoning | opnieuw_gesloten_na_opschoning |
    # geweigerd_open | onbekend | fout
    status: str
    reden: str = ""            # "termijn", "verzoek" of de termijn met vooruitblik
    gesloten_op: date | None = None
    verloopt_op: date | None = None
    termijn_maanden: int | None = None
    tellingen: dict[str, int] = field(default_factory=dict)
    fout: str = ""


@dataclass
class Organisatieregel:
    """Een organisatie uit een verzoek die zelf een regel krijgt."""

    organization_id: str
    status: str   # onbekend | geen_metingen


@dataclass
class Rapportage:
    migratie_gedraaid: bool
    apply: bool
    metingen: list[Meting]
    organisaties: list[Organisatieregel] = field(default_factory=list)


def _beoordeel(m: Meting, *, is_active: bool | None, closed_at: datetime | None,
               purged: datetime | None, vandaag: date, op_verzoek: bool,
               termijn: Callable[[], int]) -> None:
    """De regels voor één meting; één bron voor de inventaris en de hercontrole."""
    if purged is not None:
        if is_active:
            m.status = "heropend_na_opschoning"
        elif closed_at is not None and _utc(closed_at) > _utc(purged):
            # Na de opschoning heropend en weer gesloten: er kunnen nieuwe
            # antwoorden zijn. Niet automatisch wissen (de markering staat al),
            # maar ook niet stil laten liggen: de operator beslist.
            m.status = "opnieuw_gesloten_na_opschoning"
        else:
            m.status = "al_opgeschoond"
    elif is_active:
        m.status = "geweigerd_open" if op_verzoek else "open"
    elif closed_at is None:
        m.status = "geweigerd_open" if op_verzoek else "gestopt_zonder_sluitdatum"
    else:
        m.gesloten_op = _sluitdag(closed_at)
        m.termijn_maanden = termijn()
        m.verloopt_op = _plus_maanden(m.gesloten_op, m.termijn_maanden)
        if op_verzoek:
            m.status = "verlopen"
        elif m.verloopt_op <= _plus_maanden(vandaag, VOORUITBLIK_MAANDEN):
            m.status = "verlopen"
            if m.verloopt_op > vandaag:
                m.reden = ("termijn, loopt af binnen " + str(VOORUITBLIK_MAANDEN)
                           + " maand (vooruitblik)")
        else:
            m.status = "binnen_termijn"


def _termijn(db: Session, organization_id: str, gedraaid: bool) -> int:
    if not gedraaid:
        return STANDAARD_TERMIJN_MAANDEN
    waarde = db.execute(_Q_TERMIJN, {"id": organization_id}).scalar()
    return waarde or STANDAARD_TERMIJN_MAANDEN


def _tellingen(db: Session, campaign_id: str) -> dict[str, int]:
    resp_ids = select(Respondent.id).where(Respondent.campaign_id == campaign_id)
    uit = {
        "respondenten": db.query(Respondent).filter(Respondent.campaign_id == campaign_id).count(),
        "antwoorden": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).count(),
        "open_tekst": db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids),
                                                      SurveyResponse.open_text_raw.isnot(None)).count(),
        "besluit": (db.query(CampaignDecision).filter(CampaignDecision.campaign_id == campaign_id).count()
                    if _kolommen(db, "campaign_decisions") else 0),
    }
    for tabel, kolom in NIET_ORM_TABELLEN:
        if kolom in _kolommen(db, tabel):
            q = text("select count(*) from " + tabel + " where " + kolom + " = :id").bindparams(
                bindparam("id", type_=GUID()))
            uit[tabel + "." + kolom] = int(db.execute(q, {"id": campaign_id}).scalar() or 0)
    return uit


def _schoon_op(db: Session, campaign_id: str, nu: datetime) -> None:
    """Alle schrijfacties voor één meting; de aanroeper doet commit of rollback."""
    resp_ids = select(Respondent.id).where(Respondent.campaign_id == campaign_id)
    db.query(SurveyResponse).filter(SurveyResponse.respondent_id.in_(resp_ids)).delete(
        synchronize_session=False)
    db.query(Respondent).filter(Respondent.campaign_id == campaign_id).delete(
        synchronize_session=False)

    rec = db.query(CampaignDeliveryRecord).filter(
        CampaignDeliveryRecord.campaign_id == campaign_id).one_or_none()
    if rec is not None:
        rec.operator_notes = None
        rec.customer_handoff_note = None
        rec.next_step = None
        rec.self_send_config = {}
        rec.participant_comms_config = {}
        rec.self_send_reminders = []
        rec.updated_at = nu
        db.query(CampaignDeliveryCheckpoint).filter(
            CampaignDeliveryCheckpoint.delivery_record_id == rec.id).update(
            {CampaignDeliveryCheckpoint.operator_note: None,
             CampaignDeliveryCheckpoint.last_auto_summary: None},
            synchronize_session=False)

    if _kolommen(db, "campaign_decisions"):
        besluit = db.get(CampaignDecision, campaign_id)
        if besluit is not None:
            besluit.owner = ""
            besluit.primary_action = ""
            besluit.secondary_action = ""
            besluit.feedback_plan = ""
            besluit.success_criterion = ""
            besluit.recorded_by = None
            besluit.updated_at = nu

    for tabel, kolom in NIET_ORM_TABELLEN:
        if kolom in _kolommen(db, tabel):
            q = text("delete from " + tabel + " where " + kolom + " = :id").bindparams(
                bindparam("id", type_=GUID()))
            db.execute(q, {"id": campaign_id})

    if db.execute(_U_PURGED, {"ts": nu, "id": campaign_id}).rowcount != 1:
        raise MetingVeranderd("al_opgeschoond")


def _controleer_opnieuw(db: Session, m: Meting, *, vandaag: date, op_verzoek: bool,
                        organisatie_ids: list[str]) -> None:
    """Eerste stap van de opschoontransactie: vergrendel de meting en toets opnieuw.

    Tussen de inventaris en deze transactie kan een operator de meting
    heropenen of de termijn verlengen. Op Postgres houdt FOR UPDATE de rij vast
    tot de commit; SQLite kent dat niet en heeft het in de tests niet nodig.
    """
    sql = _SQL_CAMPAGNE
    if db.get_bind().dialect.name == "postgresql":
        sql += " for update"
    q = (text(sql).bindparams(bindparam("id", type_=GUID()))
         .columns(is_active=Boolean(), closed_at=DateTime(timezone=True),
                  data_purged_at=DateTime(timezone=True), organization_id=GUID()))
    rij = db.execute(q, {"id": m.campaign_id}).one_or_none()
    if rij is None:
        raise MetingVeranderd("onbekend")
    if organisatie_ids and rij.organization_id not in organisatie_ids:
        raise MetingVeranderd("andere_organisatie")
    nieuw = Meting(campaign_id=m.campaign_id, organization_id=rij.organization_id, status="")
    _beoordeel(nieuw, is_active=rij.is_active, closed_at=rij.closed_at, purged=rij.data_purged_at,
               vandaag=vandaag, op_verzoek=op_verzoek,
               termijn=lambda: _termijn(db, rij.organization_id, True))
    if nieuw.status != "verlopen":
        raise MetingVeranderd(nieuw.status)


def _foutcode(exc: BaseException) -> str:
    """Alleen de soort fout en de Postgres-code, nooit de melding zelf.

    Een databasemelding kan de rij bevatten ("Failing row contains (...)") en
    een SQLAlchemy-fout de parameters; beide kunnen persoonsgegevens zijn.
    """
    uit = type(exc).__name__
    if isinstance(exc, MetingVeranderd):
        uit += ": nu " + exc.nu
    orig = getattr(exc, "orig", None)
    code = (getattr(exc, "pgcode", None) or getattr(exc, "sqlstate", None)
            or getattr(orig, "pgcode", None) or getattr(orig, "sqlstate", None))
    if code:
        uit += " pgcode=" + str(code)
    return uit


def _alleen_lezen(db: Session) -> None:
    """Dry-run op Postgres: de transactie kan niet schrijven, ook niet per ongeluk."""
    if db.get_bind().dialect.name == "postgresql":
        db.execute(text("SET TRANSACTION READ ONLY"))


def _inventaris(db: Session, *, vandaag: date, gedraaid: bool, campagne_ids: list[str],
                organisatie_ids: list[str]) -> tuple[list[Meting], list[Organisatieregel]]:
    op_verzoek = bool(campagne_ids or organisatie_ids)
    q = db.query(Campaign)
    if campagne_ids:
        q = q.filter(Campaign.id.in_(campagne_ids))
    elif organisatie_ids:
        q = q.filter(Campaign.organization_id.in_(organisatie_ids))
    campagnes = q.order_by(Campaign.id).all()
    metingen: list[Meting] = []
    gevonden = {c.id for c in campagnes}
    for cid in campagne_ids:
        if cid not in gevonden:
            metingen.append(Meting(campaign_id=cid, organization_id=None, status="onbekend"))
    organisaties: list[Organisatieregel] = []
    if organisatie_ids:
        bestaand = {o for (o,) in db.query(Organization.id).filter(
            Organization.id.in_(organisatie_ids))}
        met_metingen = {c.organization_id for c in campagnes}
        for oid in organisatie_ids:
            if oid not in bestaand:
                organisaties.append(Organisatieregel(oid, "onbekend"))
            elif oid not in met_metingen:
                organisaties.append(Organisatieregel(oid, "geen_metingen"))
    for c in campagnes:
        m = Meting(campaign_id=c.id, organization_id=c.organization_id, status="",
                   reden="verzoek" if op_verzoek else "termijn")
        _beoordeel(m, is_active=c.is_active, closed_at=c.closed_at,
                   purged=data_purged_at(db, c.id) if gedraaid else None,
                   vandaag=vandaag, op_verzoek=op_verzoek,
                   termijn=lambda c=c: _termijn(db, c.organization_id, gedraaid))
        metingen.append(m)
    return metingen, organisaties


def opschonen(session_factory: Callable[[], Session], *, vandaag: date, apply: bool,
              campagne_ids: Iterable[str] = (), organisatie_ids: Iterable[str] = ()) -> Rapportage:
    """Bepaal welke metingen verlopen zijn en schoon ze op (alleen met apply).

    Op verzoek (campagne_ids of organisatie_ids): alleen die metingen, ongeacht
    de termijn, en nooit een open meting. Per meting één transactie, die eerst
    de meting vergrendelt en opnieuw toetst (_controleer_opnieuw).
    """
    campagne_ids = [str(uuid.UUID(str(c))) for c in campagne_ids]
    organisatie_ids = [str(uuid.UUID(str(o))) for o in organisatie_ids]
    if campagne_ids and organisatie_ids:
        # Niet raden of het een doorsnede of een optelsom moet zijn: bij
        # verwijderen is elke gok er één te veel.
        raise ValueError("geef campagne_ids of organisatie_ids, niet allebei")
    db = session_factory()
    try:
        if not apply:
            _alleen_lezen(db)
        gedraaid = migratie_gedraaid(db)
        if apply and not gedraaid:
            raise RetentieMigratieOntbreekt(
                "De kolommen campaigns.data_purged_at en organizations.retention_months "
                "bestaan niet. Draai eerst " + MIGRATIE + " in Supabase.")
        metingen, organisaties = _inventaris(db, vandaag=vandaag, gedraaid=gedraaid,
                                             campagne_ids=campagne_ids,
                                             organisatie_ids=organisatie_ids)
    finally:
        db.rollback()
        db.close()

    nu = datetime.now(timezone.utc)
    for m in metingen:
        if m.status != "verlopen":
            continue
        db = session_factory()
        try:
            if apply:
                _controleer_opnieuw(db, m, vandaag=vandaag,
                                    op_verzoek=bool(campagne_ids or organisatie_ids),
                                    organisatie_ids=organisatie_ids)
            else:
                _alleen_lezen(db)
            m.tellingen = _tellingen(db, m.campaign_id)
            if apply:
                _schoon_op(db, m.campaign_id, nu)
                db.commit()
                m.status = "opgeschoond"
            else:
                db.rollback()
        except Exception as exc:
            db.rollback()
            m.status = "fout"
            m.fout = _foutcode(exc)
            # Bewust zonder exc_info: de traceback bevat de melding zelf.
            logger.error("opschoning mislukt voor campagne %s: %s", m.campaign_id, m.fout)
        finally:
            db.close()
    return Rapportage(migratie_gedraaid=gedraaid, apply=apply, metingen=metingen,
                      organisaties=organisaties)


_KOPPEN = {
    "verlopen": "VERLOPEN", "opgeschoond": "OPGESCHOOND", "binnen_termijn": "BINNEN TERMIJN",
    "open": "OPEN", "gestopt_zonder_sluitdatum": "GESTOPT", "al_opgeschoond": "AL OPGESCHOOND",
    "heropend_na_opschoning": "HEROPEND",
    "opnieuw_gesloten_na_opschoning": "OPNIEUW GESLOTEN", "geweigerd_open": "GEWEIGERD",
    "onbekend": "ONBEKEND", "fout": "FOUT",
}
_ORG_KOPPEN = {"onbekend": "ONBEKEND", "geen_metingen": "GEEN METINGEN"}


def _org_regel(o: Organisatieregel) -> str:
    kop = _ORG_KOPPEN[o.status].ljust(15) + "organisatie=" + o.organization_id
    if o.status == "onbekend":
        return kop + ": deze id bestaat niet"
    return kop + ": deze organisatie heeft geen metingen, niets te doen"


def _regel(m: Meting, *, apply: bool) -> str:
    """Eén uitvoerregel: id's, datums en aantallen, nooit namen of inhoud."""
    kop = _KOPPEN[m.status].ljust(15) + "campagne=" + m.campaign_id
    if m.organization_id:
        kop += " organisatie=" + m.organization_id
    if m.status == "open":
        return kop + ": loopt nog, niet geraakt"
    if m.status == "geweigerd_open":
        return kop + ": loopt nog of heeft geen sluitdatum, niet geraakt"
    if m.status == "gestopt_zonder_sluitdatum":
        return kop + ": gestopt zonder sluitdatum, niet geraakt (zet eerst een sluitmoment)"
    if m.status == "opnieuw_gesloten_na_opschoning":
        return (kop + ": eerder opgeschoond, daarna heropend en opnieuw gesloten; nieuwe "
                "antwoorden niet geraakt, de operator beslist (ook op verzoek wordt niets gewist)")
    if m.status == "heropend_na_opschoning":
        return kop + ": eerder opgeschoond en daarna heropend, niet opnieuw geraakt"
    if m.status == "onbekend":
        return kop + ": deze id bestaat niet"
    if m.status == "al_opgeschoond":
        return kop + ": eerder opgeschoond, niets te doen"
    kop += (" gesloten=" + str(m.gesloten_op) + " termijn=" + str(m.termijn_maanden)
            + " mnd verloopt=" + str(m.verloopt_op) + " (" + m.reden + ")")
    if m.status == "binnen_termijn":
        return kop
    tellingen = " ".join(k + "=" + str(v) for k, v in m.tellingen.items())
    if m.status == "fout":
        return kop + " | " + tellingen + " | " + m.fout + " (teruggedraaid)"
    return kop + " | " + tellingen + " | " + ("opgeschoond" if apply else "dry-run: niets gewijzigd")


def _samenvatting(r: Rapportage) -> str:
    tel = {k: sum(1 for m in r.metingen if m.status == k) for k in _KOPPEN}
    return ("SAMENVATTING (" + ("opgeschoond" if r.apply else "dry-run") + "): "
            + str(tel["verlopen"]) + " verlopen, " + str(tel["opgeschoond"]) + " opgeschoond, "
            + str(tel["binnen_termijn"]) + " binnen de termijn, " + str(tel["open"]) + " open, "
            + str(tel["gestopt_zonder_sluitdatum"]) + " gestopt zonder sluitdatum, "
            + str(tel["al_opgeschoond"]) + " al opgeschoond, "
            + str(tel["heropend_na_opschoning"]) + " heropend na opschoning, "
            + str(tel["opnieuw_gesloten_na_opschoning"]) + " opnieuw gesloten na opschoning, "
            + str(tel["geweigerd_open"]) + " geweigerd, " + str(tel["onbekend"]) + " onbekend, "
            + str(tel["fout"]) + " fouten"
            + ("; organisaties: " + str(sum(1 for o in r.organisaties if o.status == "onbekend"))
               + " onbekend, " + str(sum(1 for o in r.organisaties if o.status == "geen_metingen"))
               + " zonder metingen" if r.organisaties else "")
            + ".")


def _uuid_arg(waarde: str) -> str:
    try:
        return str(uuid.UUID(waarde))
    except ValueError:
        raise argparse.ArgumentTypeError("geen geldige uuid: " + repr(waarde)) from None


def main(argv: list[str] | None = None, *,
         session_factory: Callable[[], Session] | None = None,
         vandaag: date | None = None) -> int:
    ap = argparse.ArgumentParser(
        prog="python -m backend.data_retention",
        description="Schoon metingen op na de bewaartermijn. Zonder --apply schrijft dit niets.",
        epilog="Periodiek draait dit maandelijks als Railway-cron (schema '0 3 1 * *') met --apply.")
    ap.add_argument("--apply", action="store_true",
                    help="Echt opschonen. Zonder deze vlag is het een dry-run.")
    verzoek = ap.add_mutually_exclusive_group()
    verzoek.add_argument("--campagne", action="append", default=[], type=_uuid_arg, metavar="UUID",
                         help="Op verzoek: alleen deze meting, ongeacht de termijn (mag vaker).")
    verzoek.add_argument("--organisatie", action="append", default=[], type=_uuid_arg, metavar="UUID",
                         help="Op verzoek: alle gesloten metingen van deze organisatie (mag vaker).")
    args = ap.parse_args(argv)

    if session_factory is None:
        from backend.database import SessionLocal, engine
        session_factory = SessionLocal
        print("database: " + engine.url.get_backend_name() + " op "
              + (engine.url.host or "een lokaal bestand"))
    print("modus: " + ("--apply, verlopen metingen worden opgeschoond" if args.apply
                       else "dry-run, er wordt niets gewijzigd"))
    try:
        rapport = opschonen(session_factory, vandaag=vandaag or today_amsterdam(), apply=args.apply,
                            campagne_ids=args.campagne, organisatie_ids=args.organisatie)
    except RetentieMigratieOntbreekt as exc:
        print("GESTOPT: " + str(exc))
        return 2
    if not rapport.migratie_gedraaid:
        print("LET OP: de migratie " + MIGRATIE + " is niet gedraaid. Deze dry-run rekent met "
              + str(STANDAARD_TERMIJN_MAANDEN) + " maanden voor elke organisatie en ziet niet "
              "welke metingen al zijn opgeschoond.")
    for o in rapport.organisaties:
        print(_org_regel(o))
    for m in rapport.metingen:
        print(_regel(m, apply=rapport.apply))
    print(_samenvatting(rapport))
    # Rood (exitcode 1) als iemand iets moet doen: een fout, een verzoek dat
    # niet kon, een meting zonder sluitmoment (kan nooit verlopen) of een meting
    # die na de opschoning opnieuw gesloten is (nieuwe antwoorden).
    slecht = {"fout", "onbekend", "geweigerd_open", "gestopt_zonder_sluitdatum",
              "opnieuw_gesloten_na_opschoning"}
    if any(o.status == "onbekend" for o in rapport.organisaties):
        return 1
    return 1 if any(m.status in slecht for m in rapport.metingen) else 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)
    sys.exit(main())
