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
een eigen rapportage: metingen (opschonen, Rapportage) en leads en leerdossiers
(opschonen_contacten, ContactRapportage). Voor beide geldt: dry-run standaard,
één transactie per eenheid die eerst opnieuw toetst, tweede run doet niets.
De periodieke run (zonder --campagne of --organisatie) doet allebei; een
verzoek per meting of organisatie raakt alleen metingen.

Per meting, bovenop Deel C.1 (Taak 17b, onderzocht in
migrations/2026_04_27_add_real_usage_registry_tables.sql en de schrijvers in
frontend/lib/telemetry/store.ts en frontend/lib/proof-registry-server.ts):

| Tabel | Wat erin staat | Na de termijn | Waarom |
|---|---|---|---|
| suite_telemetry_events | gebeurtenis per meting (type, actor_id = gebruikers-id, payload als vrije JSON van de aanroeper) | verwijderen (rijen van deze meting) | Operationele meting van het gebruik; na de termijn geen doel meer, en de payload is ongecontroleerd. |
| case_proof_registry | intern bewijsregister per meting: summary en claimable_observation (vrije tekst over de uitkomst bij de klant), supporting_artifacts | verwijderen (rijen van deze meting) | Alleen voor Loep-beheerders; vrije tekst over de klant en de meting. Leegmaken laat een rij zonder inhoud staan, dus verwijderen. |

Beide hangen via campaign_id (on delete set null) aan een meting en gaan mee in
NIET_ORM_TABELLEN, niet als eigen termijn. Rijen zonder campaign_id (alleen een
organisatie) raakt deze opschoning niet.

Leads en leerdossiers (amendement A4 punt 2): termijn twee jaar
(CONTACT_TERMIJN_MAANDEN) na het laatste contact, met dezelfde vooruitblik als
metingen. Het laatste contact is het laatste van de tijdstempels die de eenheid
heeft; kolommen die in een database ontbreken tellen niet mee.

| Tabel | Wat erin staat | Laatste contact | Na de termijn | Waarom |
|---|---|---|---|---|
| contact_requests (lead) | naam, werk-e-mail, organisatie, omvang, vraag (vrije tekst), ops- en kwalificatienotities met namen | created_at, last_contacted_at (laatste ops-update), qualification_reviewed_at, commercial_agreement_confirmed_at, commercial_readiness_reviewed_at | verwijderen; de verwijzing in campaign_delivery_records en pilot_learning_dossiers (contact_request_id) wordt leeg | Een lead is als geheel persoonsgegevens; anonimiseren laat niets bruikbaars over. Geen uitzondering voor leads die klant werden: de organisatie en de meting hebben hun eigen gegevens en termijn. |
| pilot_learning_dossiers (dossier) | leadgegevens (naam, e-mail, organisatie) plus interne vrije tekst over koopreden, uitkomst en lessen | created_at en updated_at van het dossier en van elk checkpoint | verwijderen, met de checkpoints | Idem: intern en commercieel, zonder de namen blijft er geen bruikbaar dossier over. |
| pilot_learning_checkpoints | notities per checkpoint (owner_label, observaties, lessen) | telt mee voor het dossier | verwijderen met het dossier | Hoort bij het dossier. |
| action_center_review_decisions (via checkpoint_id) | reviewbesluit dat aan een checkpoint hangt | telt niet mee | verwijderen met het dossier | Op Postgres doet de cascade dit ook; hier expliciet, zodat het in de uitvoer staat. |

contact_requests heeft geen updated_at: een wijziging die geen van de vijf
tijdstempels zet, telt niet als contact. Opschonen op verzoek van één lead of
dossier bestaat niet (YAGNI); dat kan via de beheeromgeving.
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
    StringGUID,
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
    # Taak 17b: telemetrie en het interne bewijsregister (zie de docstring).
    ("suite_telemetry_events", "campaign_id"),
    ("case_proof_registry", "campaign_id"),
)

# Leads en leerdossiers (Taak 17b). Tabel- en kolomnamen zijn vaste
# constanten, geen invoer: ze mogen in de SQL-tekst.
CONTACT_TERMIJN_MAANDEN = 24
LEAD_TABEL = "contact_requests"
LEAD_TIJDSTEMPELS = ("created_at", "last_contacted_at", "qualification_reviewed_at",
                     "commercial_agreement_confirmed_at", "commercial_readiness_reviewed_at")
# Verwijzingen naar een lead die bij verwijderen leeg worden. Op Postgres doet
# de FK (on delete set null) dit ook; hier expliciet, zodat het op elke
# database gelijk gaat en de uitvoer het telt.
LEAD_VERWIJZINGEN: tuple[tuple[str, str], ...] = (
    ("campaign_delivery_records", "contact_request_id"),
    ("pilot_learning_dossiers", "contact_request_id"),
)
DOSSIER_TABEL = "pilot_learning_dossiers"
CHECKPOINT_TABEL = "pilot_learning_checkpoints"
DOSSIER_TIJDSTEMPELS = ("created_at", "updated_at")
# Rijen die via een checkpoint aan een dossier hangen (on delete cascade).
CHECKPOINT_VERWIJZINGEN: tuple[tuple[str, str], ...] = (
    ("action_center_review_decisions", "checkpoint_id"),
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


class ContactVeranderd(MetingVeranderd):
    """Zelfde betekenis voor een lead of dossier: in de opschoontransactie
    voldoet hij niet meer (bijvoorbeeld recent contact of al verwijderd)."""


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


def _termijn_verstreken(verloopt_op: date, vandaag: date) -> bool:
    """Valt de einddatum binnen deze cronperiode (vooruitblik)? Zie de docstring."""
    return verloopt_op <= _plus_maanden(vandaag, VOORUITBLIK_MAANDEN)


_VOORUITBLIK_REDEN = ("termijn, loopt af binnen " + str(VOORUITBLIK_MAANDEN)
                      + " maand (vooruitblik)")


def _beoordeel(m: Meting, *, is_active: bool | None, closed_at: datetime | None,
               purged: datetime | None, vandaag: date, op_verzoek: bool,
               termijn: Callable[[], int], respondenten: Callable[[], int]) -> None:
    """De regels voor één meting; één bron voor de inventaris en de hercontrole."""
    if purged is not None:
        if is_active:
            m.status = "heropend_na_opschoning"
        elif ((closed_at is not None and _utc(closed_at) > _utc(purged))
              or respondenten() > 0):
            # Na de opschoning heropend en weer gesloten, of er staan weer
            # respondenten bij (ook als closed_at niet verschoof): er kunnen
            # nieuwe antwoorden zijn. Niet automatisch wissen (de markering
            # staat al), maar ook niet stil laten liggen: de operator beslist.
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
        elif _termijn_verstreken(m.verloopt_op, vandaag):
            m.status = "verlopen"
            if m.verloopt_op > vandaag:
                m.reden = _VOORUITBLIK_REDEN
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
               termijn=lambda: _termijn(db, rij.organization_id, True),
               respondenten=lambda: db.query(Respondent).filter(
                   Respondent.campaign_id == m.campaign_id).count())
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


def _in_eigen_transactie(session_factory: Callable[[], Session], eenheid, soort: str, eid: str, *,
                         apply: bool, hercontrole: Callable[[Session], None],
                         tellen: Callable[[Session, str], dict[str, int]],
                         schoon_op: Callable[[Session, str], None]) -> None:
    """Eén verlopen eenheid (meting, lead of dossier) in een eigen transactie.

    Met apply: eerst opnieuw toetsen (en vergrendelen), dan tellen en
    opschonen, dan commit. Zonder apply: een alleen-lezen transactie die alleen
    telt. Een fout rolt alleen deze eenheid terug; de eenheid krijgt status
    "fout" en een foutcode zonder inhoud.
    """
    db = session_factory()
    try:
        if apply:
            hercontrole(db)
        else:
            _alleen_lezen(db)
        eenheid.tellingen = tellen(db, eid)
        if apply:
            schoon_op(db, eid)
            db.commit()
            eenheid.status = "opgeschoond"
        else:
            db.rollback()
    except Exception as exc:
        db.rollback()
        eenheid.status = "fout"
        eenheid.fout = _foutcode(exc)
        # Bewust zonder exc_info: de traceback bevat de melding zelf.
        logger.error("opschoning mislukt voor %s %s: %s", soort, eid, eenheid.fout)
    finally:
        db.close()


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

        def respondenten(m=m) -> int:
            # De bestaande tellingen: ze komen ook in de uitvoerregel.
            m.tellingen = _tellingen(db, m.campaign_id)
            return m.tellingen["respondenten"]

        _beoordeel(m, is_active=c.is_active, closed_at=c.closed_at,
                   purged=data_purged_at(db, c.id) if gedraaid else None,
                   vandaag=vandaag, op_verzoek=op_verzoek,
                   termijn=lambda c=c: _termijn(db, c.organization_id, gedraaid),
                   respondenten=respondenten)
        if m.status != "opnieuw_gesloten_na_opschoning":
            m.tellingen = {}
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
    op_verzoek = bool(campagne_ids or organisatie_ids)
    for m in metingen:
        if m.status == "verlopen":
            _in_eigen_transactie(
                session_factory, m, "campagne", m.campaign_id, apply=apply,
                hercontrole=lambda db, m=m: _controleer_opnieuw(
                    db, m, vandaag=vandaag, op_verzoek=op_verzoek,
                    organisatie_ids=organisatie_ids),
                tellen=_tellingen,
                schoon_op=lambda db, cid: _schoon_op(db, cid, nu))
    return Rapportage(migratie_gedraaid=gedraaid, apply=apply, metingen=metingen,
                      organisaties=organisaties)


# --- Leads en leerdossiers (Taak 17b) -----------------------------------------

@dataclass
class Contact:
    """Een lead (contact_requests) of een leerdossier (met zijn checkpoints)."""

    soort: str    # "lead" | "dossier"
    id: str
    # verlopen | opgeschoond | binnen_termijn | zonder_datum | fout
    status: str
    reden: str = "termijn"
    laatste_contact: date | None = None
    verloopt_op: date | None = None
    tellingen: dict[str, int] = field(default_factory=dict)
    fout: str = ""


@dataclass
class ContactRapportage:
    apply: bool
    leads: list[Contact]
    dossiers: list[Contact]
    ontbrekende_tabellen: list[str] = field(default_factory=list)


def _tijdstempels(db: Session, tabel: str, gewenst: tuple[str, ...]) -> list[str]:
    """De tijdstempelkolommen die in deze database bestaan, in vaste volgorde."""
    bestaand = _kolommen(db, tabel)
    return [k for k in gewenst if k in bestaand]


def _laatste(momenten: Iterable[datetime | None]) -> datetime | None:
    """Het laatste moment; een naive datetime (SQLite) is UTC."""
    gevuld = [_utc(m) for m in momenten if m is not None]
    return max(gevuld) if gevuld else None


def _beoordeel_contact(c: Contact, laatste: datetime | None, vandaag: date) -> None:
    """De regels voor een lead of dossier; een bron voor inventaris en hercontrole."""
    if laatste is None:
        # Geen enkel tijdstempel: de termijn is niet te bepalen. Niet raden.
        c.status = "zonder_datum"
        return
    c.laatste_contact = _sluitdag(laatste)       # zelfde omrekening naar NL-tijd
    c.verloopt_op = _plus_maanden(c.laatste_contact, CONTACT_TERMIJN_MAANDEN)
    if _termijn_verstreken(c.verloopt_op, vandaag):
        c.status = "verlopen"
        if c.verloopt_op > vandaag:
            c.reden = _VOORUITBLIK_REDEN
    else:
        c.status = "binnen_termijn"


def _q_tijden(tabel: str, sleutel: str, kolommen: list[str], sleutel_type, *,
              waar: str | None = None, for_update: bool = False):
    """select <sleutel>, <tijdstempels> from <tabel> [where <waar> = :id] [for update].

    sleutel_type is ook het type van :id (de sleutel en waar zijn van dezelfde soort).
    """
    sql = "select " + ", ".join([sleutel] + kolommen) + " from " + tabel
    if waar is not None:
        sql += " where " + waar + " = :id"
    sql += " order by " + sleutel
    if for_update:
        sql += " for update"
    q = text(sql).columns(**{sleutel: sleutel_type},
                          **{k: DateTime(timezone=True) for k in kolommen})
    if waar is not None:
        q = q.bindparams(bindparam("id", type_=sleutel_type))
    return q


def _dossier_tijden(db: Session, dossier_id: str | None, *, for_update: bool = False
                    ) -> dict[str, list[datetime | None]]:
    """Per dossier alle tijdstempels van het dossier en zijn checkpoints.

    Zonder dossier_id: alle dossiers (inventaris). Met dossier_id: alleen dat
    dossier, met FOR UPDATE op het dossier en zijn checkpoints (hercontrole).
    """
    params = {} if dossier_id is None else {"id": dossier_id}
    uit: dict[str, list[datetime | None]] = {}
    kol = _tijdstempels(db, DOSSIER_TABEL, DOSSIER_TIJDSTEMPELS)
    q = _q_tijden(DOSSIER_TABEL, "id", kol, GUID(),
                  waar=None if dossier_id is None else "id", for_update=for_update)
    for rij in db.execute(q, params):
        uit[rij[0]] = list(rij[1:])
    if _kolommen(db, CHECKPOINT_TABEL):
        kol = _tijdstempels(db, CHECKPOINT_TABEL, DOSSIER_TIJDSTEMPELS)
        q = _q_tijden(CHECKPOINT_TABEL, "dossier_id", kol, GUID(),
                      waar=None if dossier_id is None else "dossier_id", for_update=for_update)
        for rij in db.execute(q, params):
            if rij[0] in uit:
                uit[rij[0]].extend(rij[1:])
    return uit


def _inventaris_contacten(db: Session, *, vandaag: date
                          ) -> tuple[list[Contact], list[Contact], list[str]]:
    leads: list[Contact] = []
    dossiers: list[Contact] = []
    ontbrekend = [t for t in (LEAD_TABEL, DOSSIER_TABEL, CHECKPOINT_TABEL) if not _kolommen(db, t)]
    if LEAD_TABEL not in ontbrekend:
        kol = _tijdstempels(db, LEAD_TABEL, LEAD_TIJDSTEMPELS)
        for rij in db.execute(_q_tijden(LEAD_TABEL, "id", kol, StringGUID())):
            c = Contact(soort="lead", id=rij[0], status="")
            _beoordeel_contact(c, _laatste(rij[1:]), vandaag)
            leads.append(c)
    if DOSSIER_TABEL not in ontbrekend:
        for did, momenten in _dossier_tijden(db, None).items():
            c = Contact(soort="dossier", id=did, status="")
            _beoordeel_contact(c, _laatste(momenten), vandaag)
            dossiers.append(c)
    return leads, dossiers, ontbrekend


def _controleer_contact_opnieuw(c: Contact, laatste: datetime | None, vandaag: date) -> None:
    nieuw = Contact(soort=c.soort, id=c.id, status="")
    _beoordeel_contact(nieuw, laatste, vandaag)
    if nieuw.status != "verlopen":
        raise ContactVeranderd(nieuw.status)


def _controleer_lead_opnieuw(db: Session, c: Contact, *, vandaag: date) -> None:
    """Eerste stap van de transactie: vergrendel de lead en toets opnieuw.

    Tussen de inventaris en deze transactie kan een operator contact
    vastleggen. Op Postgres houdt FOR UPDATE de rij vast tot de commit.
    """
    kol = _tijdstempels(db, LEAD_TABEL, LEAD_TIJDSTEMPELS)
    q = _q_tijden(LEAD_TABEL, "id", kol, StringGUID(), waar="id",
                  for_update=db.get_bind().dialect.name == "postgresql")
    rij = db.execute(q, {"id": c.id}).one_or_none()
    if rij is None:
        raise ContactVeranderd("onbekend")
    _controleer_contact_opnieuw(c, _laatste(rij[1:]), vandaag)


def _controleer_dossier_opnieuw(db: Session, c: Contact, *, vandaag: date) -> None:
    """Idem voor een dossier: vergrendelt het dossier en zijn checkpoints.

    Een nieuw checkpoint wacht op Postgres op de vergrendeling van het dossier
    (de FK-controle) en faalt daarna, omdat het dossier weg is.
    """
    tijden = _dossier_tijden(db, c.id, for_update=db.get_bind().dialect.name == "postgresql")
    if c.id not in tijden:
        raise ContactVeranderd("onbekend")
    _controleer_contact_opnieuw(c, _laatste(tijden[c.id]), vandaag)


def _tel_verwijzingen(db: Session, verwijzingen: tuple[tuple[str, str], ...], voorwaarde: str,
                      eid: str, id_type) -> dict[str, int]:
    """Per (tabel, kolom) het aantal rijen waar `kolom <voorwaarde>` geldt."""
    uit: dict[str, int] = {}
    for tabel, kolom in verwijzingen:
        if kolom in _kolommen(db, tabel):
            q = text("select count(*) from " + tabel + " where " + kolom + " " + voorwaarde
                     ).bindparams(bindparam("id", type_=id_type))
            uit[tabel + "." + kolom] = int(db.execute(q, {"id": eid}).scalar() or 0)
    return uit


def _tellingen_lead(db: Session, lead_id: str) -> dict[str, int]:
    return _tel_verwijzingen(db, LEAD_VERWIJZINGEN, "= :id", lead_id, StringGUID())


_CHECKPOINTS_VAN = "in (select id from " + CHECKPOINT_TABEL + " where dossier_id = :id)"


def _tellingen_dossier(db: Session, dossier_id: str) -> dict[str, int]:
    uit = {"checkpoints": 0}
    if _kolommen(db, CHECKPOINT_TABEL):
        q = text("select count(*) from " + CHECKPOINT_TABEL + " where dossier_id = :id"
                 ).bindparams(bindparam("id", type_=GUID()))
        uit["checkpoints"] = int(db.execute(q, {"id": dossier_id}).scalar() or 0)
        uit.update(_tel_verwijzingen(db, CHECKPOINT_VERWIJZINGEN, _CHECKPOINTS_VAN,
                                     dossier_id, GUID()))
    return uit


def _schoon_lead_op(db: Session, lead_id: str) -> None:
    """Verwijzingen leeg, dan de lead weg; de aanroeper doet commit of rollback."""
    for tabel, kolom in LEAD_VERWIJZINGEN:
        if kolom in _kolommen(db, tabel):
            db.execute(text("update " + tabel + " set " + kolom + " = null where " + kolom + " = :id"
                            ).bindparams(bindparam("id", type_=StringGUID())), {"id": lead_id})
    weg = db.execute(text("delete from " + LEAD_TABEL + " where id = :id").bindparams(
        bindparam("id", type_=StringGUID())), {"id": lead_id})
    if weg.rowcount != 1:
        raise ContactVeranderd("onbekend")


def _schoon_dossier_op(db: Session, dossier_id: str) -> None:
    """Rijen aan de checkpoints, de checkpoints, dan het dossier."""
    if _kolommen(db, CHECKPOINT_TABEL):
        for tabel, kolom in CHECKPOINT_VERWIJZINGEN:
            if kolom in _kolommen(db, tabel):
                db.execute(text("delete from " + tabel + " where " + kolom + " " + _CHECKPOINTS_VAN
                                ).bindparams(bindparam("id", type_=GUID())), {"id": dossier_id})
        db.execute(text("delete from " + CHECKPOINT_TABEL + " where dossier_id = :id").bindparams(
            bindparam("id", type_=GUID())), {"id": dossier_id})
    weg = db.execute(text("delete from " + DOSSIER_TABEL + " where id = :id").bindparams(
        bindparam("id", type_=GUID())), {"id": dossier_id})
    if weg.rowcount != 1:
        raise ContactVeranderd("onbekend")


def opschonen_contacten(session_factory: Callable[[], Session], *, vandaag: date,
                        apply: bool) -> ContactRapportage:
    """Bepaal welke leads en leerdossiers twee jaar geen contact hadden en
    verwijder ze (alleen met apply). Per lead en per dossier een transactie,
    die eerst opnieuw toetst. Heeft de migratie van de metingen niet nodig."""
    db = session_factory()
    try:
        if not apply:
            _alleen_lezen(db)
        leads, dossiers, ontbrekend = _inventaris_contacten(db, vandaag=vandaag)
    finally:
        db.rollback()
        db.close()
    for c in leads:
        if c.status == "verlopen":
            _in_eigen_transactie(
                session_factory, c, "lead", c.id, apply=apply,
                hercontrole=lambda db, c=c: _controleer_lead_opnieuw(db, c, vandaag=vandaag),
                tellen=_tellingen_lead, schoon_op=_schoon_lead_op)
    for c in dossiers:
        if c.status == "verlopen":
            _in_eigen_transactie(
                session_factory, c, "dossier", c.id, apply=apply,
                hercontrole=lambda db, c=c: _controleer_dossier_opnieuw(db, c, vandaag=vandaag),
                tellen=_tellingen_dossier, schoon_op=_schoon_dossier_op)
    return ContactRapportage(apply=apply, leads=leads, dossiers=dossiers,
                             ontbrekende_tabellen=ontbrekend)



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
        uit = (kop + ": eerder opgeschoond, daarna heropend en opnieuw gesloten of er staan weer "
               "respondenten bij; nieuwe antwoorden niet geraakt, de operator beslist (ook op "
               "verzoek wordt niets gewist)")
        if m.tellingen:
            uit += " | " + " ".join(k + "=" + str(v) for k, v in m.tellingen.items())
        return uit
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


_CONTACT_KOPPEN = {
    "verlopen": "VERLOPEN", "opgeschoond": "OPGESCHOOND", "binnen_termijn": "BINNEN TERMIJN",
    "zonder_datum": "ZONDER DATUM", "fout": "FOUT",
}


def _contact_regel(c: Contact, *, apply: bool) -> str:
    """Een uitvoerregel: id, datums en aantallen, nooit namen of inhoud."""
    kop = _CONTACT_KOPPEN[c.status].ljust(15) + c.soort + "=" + c.id
    if c.status == "zonder_datum":
        return kop + ": geen enkel tijdstempel, niet geraakt (de operator beslist)"
    kop += (" laatste_contact=" + str(c.laatste_contact) + " termijn="
            + str(CONTACT_TERMIJN_MAANDEN) + " mnd verloopt=" + str(c.verloopt_op)
            + " (" + c.reden + ")")
    if c.status == "binnen_termijn":
        return kop
    tellingen = " ".join(k + "=" + str(v) for k, v in c.tellingen.items())
    if c.status == "fout":
        return kop + " | " + tellingen + " | " + c.fout + " (teruggedraaid)"
    return kop + " | " + tellingen + " | " + ("verwijderd" if apply else "dry-run: niets gewijzigd")


def _contact_samenvatting(r: ContactRapportage) -> str:
    def deel(lijst: list[Contact]) -> str:
        tel = {k: sum(1 for c in lijst if c.status == k) for k in _CONTACT_KOPPEN}
        return (str(tel["verlopen"]) + " verlopen, " + str(tel["opgeschoond"]) + " opgeschoond, "
                + str(tel["binnen_termijn"]) + " binnen de termijn, " + str(tel["zonder_datum"])
                + " zonder datum, " + str(tel["fout"]) + " fouten")
    return ("SAMENVATTING LEADS EN DOSSIERS (" + ("opgeschoond" if r.apply else "dry-run")
            + "): leads: " + deel(r.leads) + "; dossiers: " + deel(r.dossiers) + ".")


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
        description=("Schoon metingen, leads en leerdossiers op na de bewaartermijn. Zonder "
                     "--apply schrijft dit niets."),
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
    periodiek = not (args.campagne or args.organisatie)
    vandaag = vandaag or today_amsterdam()      # een datum voor de hele run
    print("modus: " + (("--apply, verlopen metingen" + (", leads en dossiers" if periodiek else "")
                        + " worden opgeschoond") if args.apply
                       else "dry-run, er wordt niets gewijzigd"))
    try:
        rapport = opschonen(session_factory, vandaag=vandaag, apply=args.apply,
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
    contacten = None
    if periodiek:
        # Leads en leerdossiers alleen in de periodieke run, niet op verzoek.
        contacten = opschonen_contacten(session_factory, vandaag=vandaag,
                                        apply=args.apply)
        for tabel in contacten.ontbrekende_tabellen:
            print("LET OP: tabel " + tabel + " bestaat niet in deze database; overgeslagen.")
        for c in contacten.leads + contacten.dossiers:
            print(_contact_regel(c, apply=contacten.apply))
        print(_contact_samenvatting(contacten))
    # De samenvatting van de metingen blijft de laatste regel (Deel C.3).
    print(_samenvatting(rapport))
    # Rood (exitcode 1) als iemand iets moet doen: een fout, een verzoek dat
    # niet kon, een meting zonder sluitmoment (kan nooit verlopen) of een meting
    # die na de opschoning opnieuw gesloten is (nieuwe antwoorden).
    slecht = {"fout", "onbekend", "geweigerd_open", "gestopt_zonder_sluitdatum",
              "opnieuw_gesloten_na_opschoning"}
    if any(o.status == "onbekend" for o in rapport.organisaties):
        return 1
    # Leads en dossiers: rood bij een fout of als de termijn niet te bepalen is.
    if contacten is not None and any(c.status in ("fout", "zonder_datum")
                                     for c in contacten.leads + contacten.dossiers):
        return 1
    return 1 if any(m.status in slecht for m in rapport.metingen) else 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)
    sys.exit(main())
