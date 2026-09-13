"""Vaste, herhaalbaar te resetten testklant voor Loep.

NIET-PRODUCTIE-DATA, WEL DE PRODUCTIE-DATABASE. Dit script zet één afgebakende
testorganisatie (`slug = loep-testklant`) neer met drie campagnes, zodat een
sessie zelf kan inloggen en de klantflow in de browser kan doorlopen. Alles wat
een klant te zien krijgt begint met "TEST".

Waarom dit bestaat: zonder testinloggegevens eindigt elk plan met "Lars checkt
handmatig". Met deze tenant kan elke sessie de klantzijde zelf verifiëren.

Gebruik
-------
    # 1. Altijd eerst: volledige seed tegen een wegwerp-SQLite, inclusief
    #    rapportrender. Raakt productie niet aan.
    python scripts/seed_test_tenant.py --dry-run

    # 2. Productie. Idempotent: bestaat de testorg al, dan gebeurt er niets.
    python scripts/seed_test_tenant.py

    # 3. Verversen: verwijdert uitsluitend de rijen van de testorganisatie en
    #    zet ze opnieuw.
    python scripts/seed_test_tenant.py --reset

Veiligheid (Fail Loud, nooit stil doorgaan)
------------------------------------------
* Elke DELETE en UPDATE is gescoped op de org die bij `TEST_ORG_SLUG` hoort.
  De org-id wordt uit de database gelezen; is die niet te vinden, dan wordt er
  niets verwijderd.
* Het script telt vóór en na de transactie de rijen van ALLE andere
  organisaties. Wijkt één telling af, dan rolt de transactie terug en eindigt
  het script met een foutmelding.
* `auth.users` mag met hoogstens één rij groeien, en alleen voor het
  testadres.
* Er worden geen migraties gedraaid, geen RLS-regels en geen policies
  aangepast.

Waarom de service-role / de `postgres`-rol
------------------------------------------
De klantflow zelf loopt via de anon-key onder RLS. Seeden kan daar niet:
`survey_responses` en `respondents` zijn sinds migratie 2026_07_13 op
kolomniveau dichtgezet voor `authenticated`, en alleen een Loep-operator mag
organisaties aanmaken. Dat is precies dezelfde reden waarom de bestaande
operator-paden (`frontend/app/(dashboard)/beheer/respondent-actions.ts`) de
service-role gebruiken. Dit script volgt dat pad in plaats van een regel te
verzwakken.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import re
import secrets
import string
import sys
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# ─── Vaste identiteit van de testklant ───────────────────────────────────────

TEST_ORG_SLUG = "loep-testklant"
TEST_ORG_NAME = "TEST Loep Testklant"
TEST_OWNER_EMAIL = "larshengel08+loeptest@hotmail.com"
TEST_OWNER_NAME = "TEST Eigenaar"

CAMPAIGN_A_NAME = "TEST Loep Behoud - gesloten met rapport"
CAMPAIGN_B_NAME = "TEST Loep Behoud - lopend"
CAMPAIGN_C_NAME = "TEST Loep Vertrek - nog in te richten"

# Afdelingen van campagne A: (label, uitgenodigd, aantal afgeronde responses).
# Elke afdeling haalt MIN_SEGMENT_N (=5), zodat de segmentpagina vult.
CAMPAIGN_A_DEPARTMENTS: list[tuple[str, int, int]] = [
    ("TEST Zorg", 12, 6),
    ("TEST Kantoor", 10, 6),
    ("TEST Techniek", 8, 6),
]
CAMPAIGN_B_INVITED = 30
CAMPAIGN_B_COMPLETED = 6

# Factorprofiel campagne A (gemiddelde op de 10-schaal, spreiding).
# Twee duidelijk lage factoren, zodat (a) de verdieping vuurt, (b) de ranglijst
# een startpunt en een tweede punt heeft, en (c) genoeg respondenten groei dan
# wel werkdruk als hún laagste factor hebben voor het richtingblok.
CAMPAIGN_A_FACTORS: dict[str, tuple[float, float]] = {
    "leadership": (6.9, 0.9),
    "culture": (7.2, 0.9),
    "growth": (4.0, 1.0),
    "compensation": (6.4, 0.9),
    "workload": (4.8, 1.0),
    "role_clarity": (7.0, 0.9),
}
CAMPAIGN_B_FACTORS: dict[str, tuple[float, float]] = {
    "leadership": (6.5, 1.0),
    "culture": (6.8, 1.0),
    "growth": (5.1, 1.0),
    "compensation": (6.2, 1.0),
    "workload": (5.4, 1.0),
    "role_clarity": (6.7, 1.0),
}

SEED = 20260913

# Vaste UUID-namespace: een --reset levert exact dezelfde org-, campagne- en
# surveytokens op. Zonder dit zou elke reset de campagne-id's in
# docs/testklant.md en in opgeslagen browserlinks ongeldig maken.
UUID_NS = uuid.UUID("5f3c1d74-2a58-4f6b-9c0e-7b1a2d4e6f80")


def stable_uuid(*parts: str) -> str:
    return str(uuid.uuid5(UUID_NS, "/".join(("loep-testklant",) + parts)))

ENV_EMAIL_KEY = "TEST_OWNER_EMAIL"
ENV_PASSWORD_KEY = "TEST_OWNER_PASSWORD"


# ─── Generatoren: hergebruik van het bestaande stresstest-harnas ─────────────
# Niets aan de scoring wordt hier nagebouwd. `_retention_payload` roept de echte
# compute_*-functies aan, en welke verdiepingsvragen een respondent krijgt
# (compute_deepening_offers) en op welke factor de richtingvraag valt
# (compute_direction_factor) komen uit de productielogica.

from scripts.stresstest_report import (  # noqa: E402
    Scenario,
    _org_items_for,
    _retention_payload,
)
from backend.segments import _slugify as slugify_department  # noqa: E402


# ─── Datasetmodel (writer-onafhankelijk) ─────────────────────────────────────

@dataclass
class RespondentRow:
    id: str
    campaign_key: str
    department: str | None
    token: str
    dedup_key_hash: str
    completed: bool
    sent_at: datetime
    opened_at: datetime | None
    completed_at: datetime | None
    response: dict[str, Any] | None


@dataclass
class CampaignRow:
    key: str
    id: str
    name: str
    scan_type: str
    is_active: bool
    comms_mode: str
    delivery_mode: str | None
    public_survey_token: str
    enabled_modules: list[str] | None
    segment_departments: list[dict[str, Any]] | None
    created_at: datetime
    closed_at: datetime | None
    closes_at: date | None
    # Delivery record; None betekent: laat de rij die de trigger aanmaakt leeg.
    launch_date: date | None
    launch_confirmed_at: datetime | None
    invited_count: int | None
    lifecycle_stage: str


@dataclass
class Dataset:
    org_id: str
    campaigns: list[CampaignRow]
    respondents: list[RespondentRow] = field(default_factory=list)

    def campaign(self, key: str) -> CampaignRow:
        for c in self.campaigns:
            if c.key == key:
                return c
        raise KeyError(key)


def _scenario(
    scan_type: str,
    factors: dict[str, tuple[float, float]],
    n: int,
    *,
    deepening_skip: float = 0.12,
    direction_skip: float = 0.10,
) -> Scenario:
    """Minimale Scenario-huls; alleen de velden die de generatoren lezen."""
    return Scenario(
        key=f"testklant_{scan_type}",
        title="Testklant",
        doel="Vaste testdata",
        factors=factors,
        scan_type=scan_type,
        n=n,
        deepening_skip=deepening_skip,
        direction_skip=direction_skip,
    )


def build_dataset(now: datetime, seed: int = SEED) -> Dataset:
    """Bouwt de volledige testklant als platte rijen. Pure functie: geen I/O."""
    rng = random.Random(seed)
    org_id = stable_uuid("org")

    a_departments = [
        {"label": label, "slug": slugify_department(label), "invited_count": invited}
        for label, invited, _ in CAMPAIGN_A_DEPARTMENTS
    ]
    a_invited_total = sum(invited for _, invited, _ in CAMPAIGN_A_DEPARTMENTS)

    a_launch = (now - timedelta(days=45)).date()
    a_closed = now - timedelta(days=17)
    b_launch = (now - timedelta(days=4)).date()

    campaigns = [
        CampaignRow(
            key="A",
            id=stable_uuid("campaign", "A"),
            name=CAMPAIGN_A_NAME,
            scan_type="retention",
            is_active=False,
            comms_mode="self_send",
            delivery_mode="baseline",
            public_survey_token=stable_uuid("survey-token", "A"),
            enabled_modules=None,
            segment_departments=a_departments,
            created_at=now - timedelta(days=60),
            closed_at=a_closed,
            closes_at=a_closed.date(),
            launch_date=a_launch,
            launch_confirmed_at=now - timedelta(days=45),
            invited_count=a_invited_total,
            lifecycle_stage="first_value_reached",
        ),
        CampaignRow(
            key="C",
            id=stable_uuid("campaign", "C"),
            name=CAMPAIGN_C_NAME,
            scan_type="exit",
            is_active=True,
            comms_mode="self_send",
            delivery_mode="baseline",
            public_survey_token=stable_uuid("survey-token", "C"),
            enabled_modules=None,
            segment_departments=None,
            created_at=now - timedelta(days=20),
            closed_at=None,
            closes_at=None,
            launch_date=None,
            launch_confirmed_at=None,
            invited_count=None,
            lifecycle_stage="setup_in_progress",
        ),
        # B is als laatste aangemaakt: het dashboard toont één campagne
        # (`order created_at desc limit 1`), en dat moet de lopende meting zijn.
        CampaignRow(
            key="B",
            id=stable_uuid("campaign", "B"),
            name=CAMPAIGN_B_NAME,
            scan_type="retention",
            is_active=True,
            comms_mode="self_send",
            delivery_mode="baseline",
            public_survey_token=stable_uuid("survey-token", "B"),
            enabled_modules=None,
            segment_departments=None,
            created_at=now - timedelta(days=6),
            closed_at=None,
            closes_at=None,
            launch_date=b_launch,
            launch_confirmed_at=now - timedelta(days=4),
            invited_count=CAMPAIGN_B_INVITED,
            lifecycle_stage="invites_live",
        ),
    ]

    dataset = Dataset(org_id=org_id, campaigns=campaigns)

    # ── Campagne A: 18 afgeronde respondenten over drie afdelingen ──────────
    # Lage overslagkans voor campagne A: bij 18 respondenten moet de
    # verdieping op het startpunt over DEEPENING_MIN_N (=8) heen komen, anders
    # toont de rasterkolom "te weinig beantwoorders voor duiding" en mist de
    # testklant juist de copy die we willen kunnen controleren. Het is een
    # dataconditie van de generator, geen ingreep in de rapportlogica.
    sc_a = _scenario(
        "retention",
        CAMPAIGN_A_FACTORS,
        sum(c for _, _, c in CAMPAIGN_A_DEPARTMENTS),
        deepening_skip=0.05,
        direction_skip=0.05,
    )
    idx = 0
    for label, _invited, completed in CAMPAIGN_A_DEPARTMENTS:
        for _ in range(completed):
            idx += 1
            filled_at = now - timedelta(days=rng.randint(18, 42), hours=rng.randint(0, 23))
            org_raw = _org_items_for(sc_a, label, rng)
            dataset.respondents.append(
                RespondentRow(
                    id=stable_uuid("respondent", "A", str(idx)),
                    campaign_key="A",
                    department=label,
                    token=stable_uuid("respondent-token", "A", str(idx)),
                    dedup_key_hash=_dedup_hash(seed, "A", idx),
                    completed=True,
                    sent_at=filled_at - timedelta(minutes=12),
                    opened_at=filled_at - timedelta(minutes=11),
                    completed_at=filled_at,
                    response=_retention_payload(sc_a, org_raw, rng),
                )
            )

    # ── Campagne B: 6 afgeronde respondenten, geen afdelingen ──────────────
    sc_b = _scenario("retention", CAMPAIGN_B_FACTORS, CAMPAIGN_B_COMPLETED)
    for i in range(CAMPAIGN_B_COMPLETED):
        filled_at = now - timedelta(days=rng.randint(0, 3), hours=rng.randint(0, 23))
        org_raw = _org_items_for(sc_b, "", rng)
        dataset.respondents.append(
            RespondentRow(
                id=stable_uuid("respondent", "B", str(i + 1)),
                campaign_key="B",
                department=None,
                token=stable_uuid("respondent-token", "B", str(i + 1)),
                dedup_key_hash=_dedup_hash(seed, "B", i + 1),
                completed=True,
                sent_at=filled_at - timedelta(minutes=9),
                opened_at=filled_at - timedelta(minutes=8),
                completed_at=filled_at,
                response=_retention_payload(sc_b, org_raw, rng),
            )
        )

    # Campagne C heeft bewust geen respondenten: hij is nog niet gelanceerd.
    return dataset


def _dedup_hash(seed: int, campaign_key: str, index: int) -> str:
    """Deterministische stand-in voor de sha256 van een client-UUID."""
    return hashlib.sha256(f"loep-testklant-{seed}-{campaign_key}-{index}".encode()).hexdigest()


# ─── Wachtwoord en env-bestand ───────────────────────────────────────────────

def generate_password() -> str:
    alphabet = string.ascii_letters + string.digits + "!@#%^&*-_=+"
    while True:
        pw = "".join(secrets.choice(alphabet) for _ in range(28))
        if (any(c.islower() for c in pw) and any(c.isupper() for c in pw)
                and any(c.isdigit() for c in pw) and any(c in "!@#%^&*-_=+" for c in pw)):
            return pw


def read_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        out[key.strip()] = value.strip()
    return out


def write_env_values(path: Path, values: dict[str, str]) -> None:
    """Zet (of vervangt) sleutels in een .env-bestand zonder de rest te raken.

    Het bestand moet gitignored zijn; anders stopt het script. Het wachtwoord
    hoort nergens anders terecht te komen dan hier.
    """
    _assert_gitignored(path)
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    for key, value in values.items():
        pattern = re.compile(rf"^{re.escape(key)}=")
        replaced = False
        for i, line in enumerate(lines):
            if pattern.match(line.strip()):
                lines[i] = f"{key}={value}"
                replaced = True
                break
        if not replaced:
            lines.append(f"{key}={value}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")


def _assert_gitignored(path: Path) -> None:
    import subprocess

    result = subprocess.run(
        ["git", "check-ignore", "-q", str(path)],
        cwd=str(ROOT),
        capture_output=True,
    )
    if result.returncode != 0:
        raise SystemExit(
            f"WEIGERING: {path} is niet gitignored. Het testwachtwoord mag nooit "
            f"in een gecommit bestand belanden."
        )


# ─── Dry run: wegwerp-SQLite + echte rapportrender ───────────────────────────

def run_dry(dataset: Dataset, out_dir: Path) -> int:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool

    from backend.database import Base
    from backend.models import Campaign, Organization, Respondent, SurveyResponse
    from backend.report_html import build_report_data, render_report_html

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    db = sessionmaker(autocommit=False, autoflush=False, bind=engine)()

    db.add(
        Organization(
            id=dataset.org_id,
            name=TEST_ORG_NAME,
            slug=TEST_ORG_SLUG,
            contact_email=TEST_OWNER_EMAIL,
            is_active=True,
        )
    )
    db.flush()

    for c in dataset.campaigns:
        db.add(
            Campaign(
                id=c.id,
                organization_id=dataset.org_id,
                name=c.name,
                scan_type=c.scan_type,
                delivery_mode=c.delivery_mode,
                comms_mode=c.comms_mode,
                public_survey_token=c.public_survey_token,
                is_active=c.is_active,
                enabled_modules=c.enabled_modules,
                segment_departments=c.segment_departments,
                created_at=c.created_at,
                closed_at=c.closed_at,
            )
        )
    db.flush()

    for r in dataset.respondents:
        db.add(
            Respondent(
                id=r.id,
                campaign_id=dataset.campaign(r.campaign_key).id,
                token=r.token,
                department=r.department,
                sent_at=r.sent_at,
                opened_at=r.opened_at,
                completed=r.completed,
                completed_at=r.completed_at,
                dedup_key_hash=r.dedup_key_hash,
            )
        )
        db.flush()
        if r.response is not None:
            db.add(SurveyResponse(id=stable_uuid("response", r.campaign_key, r.id), respondent_id=r.id, **r.response))
    db.commit()

    print("== Dry run op wegwerp-SQLite " + "=" * 38)
    print(f"organisatie      {TEST_ORG_NAME} ({TEST_ORG_SLUG})")
    for c in dataset.campaigns:
        n = sum(1 for r in dataset.respondents if r.campaign_key == c.key)
        done = sum(1 for r in dataset.respondents if r.campaign_key == c.key and r.completed)
        print(
            f"campagne {c.key}       {c.name}\n"
            f"                 scan_type={c.scan_type} actief={c.is_active} "
            f"comms={c.comms_mode} respondenten={n} afgerond={done} "
            f"uitgenodigd={c.invited_count} afdelingen="
            f"{len(c.segment_departments) if c.segment_departments else 0}"
        )

    a = dataset.campaign("A")
    data = build_report_data(a.id, db)
    html = render_report_html(data)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "dry-run-campagne-a.html"
    out_path.write_text(html, encoding="utf-8")

    print("\n── Rapport campagne A (echte rapportgenerator) ───────────────────")
    print(f"has_pattern      {data.get('has_pattern')}")
    avgs = data.get("factor_avgs") or {}
    print("factorgemiddelden " + "  ".join(f"{k}={v:.1f}" for k, v in sorted(avgs.items())))
    deep = data.get("deepening_agg") or {}
    for fk, agg in sorted(deep.items()):
        print(
            f"  verdieping {fk:14s} getriggerd={agg['triggered']:>2} "
            f"aangeboden={agg['offered']:>2} beantwoord={agg['answered']:>2} "
            f"overgeslagen={agg['skipped']:>2}"
        )
    direction = data.get("direction_agg") or {}
    for fk, agg in sorted(direction.items()):
        print(
            f"  richting   {fk:14s} laagste_bij={agg['lowest_n']:>2} "
            f"aangeboden={agg['offered']:>2} beantwoord={agg['answered']:>2}"
        )
    rows = data.get("segment_rows") or []
    print(f"segmentrijen     {len(rows)}")

    checks = {
        "Verdiepingspagina": "Verdieping:" in html,
        "Blok 'Wat er moet gebeuren'": 'class="dir-block"' in html,
        "Richtingkaart met opdracht (geen degraded blok)": 'class="dir-card dir-clear"' in html
        or 'dir-card dir-plurality' in html,
        "Gespreksagenda": "Waar begint het gesprek" in html,
        "Segmentblok": bool(rows),
        # Het raster toont per factor welke toelichting het vaakst gekozen is.
        # Dat vraagt DEEPENING_MIN_N (=8) beantwoorders op die factor; komt de
        # startpuntfactor daar niet overheen, dan mist de testklant precies de
        # copy die we willen kunnen controleren.
        "Verdiepingsduiding in het raster": "kozen:" in html,
    }
    print()
    for label, ok in checks.items():
        print(f"  [{'x' if ok else ' '}] {label}")
    print(f"\nHTML weggeschreven naar {out_path}")

    db.close()
    engine.dispose()

    missing = [k for k, v in checks.items() if not v]
    if missing:
        print(f"\nFAAL: ontbrekend in het rapport: {', '.join(missing)}")
        return 1
    print("\nDry run geslaagd. Geen productiedata aangeraakt.")
    return 0


# ─── Productie ───────────────────────────────────────────────────────────────

CENSUS_QUERIES: dict[str, str] = {
    "organizations": "select count(*) from organizations where slug <> %(slug)s",
    "organization_secrets": (
        "select count(*) from organization_secrets s "
        "join organizations o on o.id = s.org_id where o.slug <> %(slug)s"
    ),
    "org_members": (
        "select count(*) from org_members m "
        "join organizations o on o.id = m.org_id where o.slug <> %(slug)s"
    ),
    "org_invites": (
        "select count(*) from org_invites i "
        "join organizations o on o.id = i.org_id where o.slug <> %(slug)s"
    ),
    "campaigns": (
        "select count(*) from campaigns c "
        "join organizations o on o.id = c.organization_id where o.slug <> %(slug)s"
    ),
    "campaign_delivery_records": (
        "select count(*) from campaign_delivery_records d "
        "join organizations o on o.id = d.organization_id where o.slug <> %(slug)s"
    ),
    "campaign_delivery_checkpoints": (
        "select count(*) from campaign_delivery_checkpoints cp "
        "join campaign_delivery_records d on d.id = cp.delivery_record_id "
        "join organizations o on o.id = d.organization_id where o.slug <> %(slug)s"
    ),
    "respondents": (
        "select count(*) from respondents r "
        "join campaigns c on c.id = r.campaign_id "
        "join organizations o on o.id = c.organization_id where o.slug <> %(slug)s"
    ),
    "survey_responses": (
        "select count(*) from survey_responses sr "
        "join respondents r on r.id = sr.respondent_id "
        "join campaigns c on c.id = r.campaign_id "
        "join organizations o on o.id = c.organization_id where o.slug <> %(slug)s"
    ),
    "auth_users_other": "select count(*) from auth.users where lower(email) is distinct from %(email)s",
    "profiles_other": (
        "select count(*) from profiles p "
        "where p.id not in (select id from auth.users where lower(email) = %(email)s)"
    ),
}


def census(cur) -> dict[str, int]:
    out: dict[str, int] = {}
    params = {"slug": TEST_ORG_SLUG, "email": TEST_OWNER_EMAIL.lower()}
    for name, sql in CENSUS_QUERIES.items():
        cur.execute(sql, params)
        out[name] = cur.fetchone()[0]
    return out


def ensure_auth_user(supabase_url: str, service_key: str, password: str) -> str:
    """Maakt (of hergebruikt) de auth-user via de Supabase Admin API.

    `email_confirm=True` en een wachtwoord: geen magic link, want niemand leest
    die mailbox. Bestaat de user al, dan wordt het wachtwoord opnieuw gezet en
    de bevestiging afgedwongen, zodat een reset altijd een werkende login geeft.
    """
    import httpx

    base = supabase_url.rstrip("/")
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=30.0) as client:
        # Zoeken. De Admin API heeft geen getUserByEmail; wel een filter.
        found: str | None = None
        page = 1
        while page <= 20:
            resp = client.get(
                f"{base}/auth/v1/admin/users",
                headers=headers,
                params={"page": page, "per_page": 200},
            )
            resp.raise_for_status()
            users = resp.json().get("users", [])
            for u in users:
                if (u.get("email") or "").lower() == TEST_OWNER_EMAIL.lower():
                    found = u["id"]
                    break
            if found or len(users) < 200:
                break
            page += 1

        if found:
            resp = client.put(
                f"{base}/auth/v1/admin/users/{found}",
                headers=headers,
                json={"password": password, "email_confirm": True},
            )
            resp.raise_for_status()
            return found

        resp = client.post(
            f"{base}/auth/v1/admin/users",
            headers=headers,
            json={
                "email": TEST_OWNER_EMAIL,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": TEST_OWNER_NAME, "loep_test_account": True},
            },
        )
        resp.raise_for_status()
        return resp.json()["id"]


def print_login_link(base_url: str) -> int:
    """Eenmalige inloglink voor de testklant via de Supabase Admin API.

    Bedoeld voor browserverificatie door een sessie: zo hoeft het wachtwoord
    nergens in een formulier of in een logregel terecht te komen. De link is
    kortlevend en eenmalig bruikbaar; draai dit opnieuw voor een nieuwe.

    De link wijst naar /complete-account met een `token_hash`. Dat is dezelfde
    route die de echte activatiemail gebruikt: die pagina wisselt het token in
    met verifyOtp, wat onafhankelijk van de pkce/implicit-flow werkt. Het kale
    `action_link` van Supabase landt op de Site URL (de marketinghomepage) en
    laat daar geen sessie achter.
    """
    import httpx

    supabase_url = os.environ.get("SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_key:
        raise SystemExit("SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten gezet zijn.")

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{supabase_url.rstrip('/')}/auth/v1/admin/generate_link",
            headers=headers,
            json={"type": "magiclink", "email": TEST_OWNER_EMAIL},
        )
    if resp.status_code >= 400:
        raise SystemExit(f"Supabase gaf {resp.status_code}: {resp.text[:400]}")
    body = resp.json()
    props = body.get("properties") or body
    token_hash = props.get("hashed_token")
    if not token_hash:
        raise SystemExit(f"Geen hashed_token in het antwoord: {json.dumps(body)[:400]}")
    print(f"{base_url.rstrip('/')}/complete-account?token_hash={token_hash}&type=magiclink")
    return 0


def run_production(dataset: Dataset, *, reset: bool, password: str, now: datetime) -> int:
    import psycopg2
    from psycopg2.extras import Json

    database_url = os.environ.get("DATABASE_URL", "").strip()
    supabase_url = os.environ.get("SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not database_url or not supabase_url or not service_key:
        raise SystemExit(
            "DATABASE_URL, SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten gezet "
            "zijn (zie .env in de repo-root)."
        )

    operator_id = _resolve_operator_id(database_url)
    owner_user_id = ensure_auth_user(supabase_url, service_key, password)
    print(f"auth-user testklant  {owner_user_id}")
    print(f"Loep-operator        {operator_id}")

    conn = psycopg2.connect(database_url, connect_timeout=20)
    conn.autocommit = False
    try:
        cur = conn.cursor()
        before = census(cur)

        cur.execute("select id from organizations where slug = %s", (TEST_ORG_SLUG,))
        row = cur.fetchone()
        existing_org_id = row[0] if row else None

        if existing_org_id and not reset:
            conn.rollback()
            print(
                f"\nDe testorganisatie bestaat al (org_id {existing_org_id}). "
                f"Er is niets gewijzigd.\nGebruik --reset om hem te verversen."
            )
            _print_existing(database_url, existing_org_id)
            return 0

        if existing_org_id:
            # Uitsluitend deze organisatie. Alles onder organizations cascadeert:
            # campagnes, delivery records, checkpoints, respondenten, responses,
            # memberships, invites en het org-secret.
            cur.execute("delete from organizations where id = %s and slug = %s",
                        (existing_org_id, TEST_ORG_SLUG))
            print(f"verwijderd           org {existing_org_id} ({cur.rowcount} rij)")

        # De triggers `on_org_created` en `organizations_create_secret` lezen
        # auth.uid(). Zonder JWT-claim is die NULL en faalt de eerste op een
        # NOT NULL-kolom. We zetten de claim transactie-lokaal op de
        # Loep-operator: dat is exact wat er gebeurt als de operator de
        # organisatie via /beheer aanmaakt, en levert meteen het
        # operator-lidmaatschap op dat /beheer nodig heeft.
        cur.execute(
            "select set_config('request.jwt.claims', %s, true)",
            (json.dumps({"sub": operator_id, "role": "authenticated"}),),
        )

        cur.execute(
            "insert into organizations (id, name, slug, contact_email, is_active, created_at) "
            "values (%s, %s, %s, %s, true, %s)",
            (dataset.org_id, TEST_ORG_NAME, TEST_ORG_SLUG, TEST_OWNER_EMAIL,
             now - timedelta(days=61)),
        )

        # Eigenaarsaccount: org_invites (bron voor de rapport-klaar-mail) en
        # org_members (bron voor het dashboard). Beide, want de app leest ze
        # allebei en de invite-sync draait pas bij het eerste dashboardbezoek.
        cur.execute(
            "insert into org_invites (org_id, email, full_name, role, invited_by, invited_at, accepted_at) "
            "values (%s, %s, %s, 'owner', %s, %s, %s)",
            (dataset.org_id, TEST_OWNER_EMAIL.lower(), TEST_OWNER_NAME, operator_id,
             now - timedelta(days=61), now - timedelta(days=61)),
        )
        cur.execute(
            "insert into org_members (org_id, user_id, role) values (%s, %s, 'owner') "
            "on conflict (org_id, user_id) do update set role = excluded.role",
            (dataset.org_id, owner_user_id),
        )
        # De operator staat er al in via de trigger; expliciet bevestigen maakt
        # het script onafhankelijk van dat triggergedrag.
        cur.execute(
            "insert into org_members (org_id, user_id, role) values (%s, %s, 'owner') "
            "on conflict (org_id, user_id) do update set role = excluded.role",
            (dataset.org_id, operator_id),
        )

        has_direction_column = _has_direction_column(cur)

        for c in dataset.campaigns:
            cur.execute(
                "insert into campaigns (id, organization_id, name, scan_type, delivery_mode, "
                "comms_mode, public_survey_token, is_active, enabled_modules, "
                "segment_departments, closes_at, created_at, closed_at) "
                "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (
                    c.id, dataset.org_id, c.name, c.scan_type, c.delivery_mode,
                    c.comms_mode, c.public_survey_token, c.is_active,
                    Json(c.enabled_modules) if c.enabled_modules is not None else None,
                    Json(c.segment_departments) if c.segment_departments is not None else None,
                    c.closes_at, c.created_at, c.closed_at,
                ),
            )
            # De trigger on_campaign_created heeft zojuist een leeg delivery
            # record + 7 checkpoints aangemaakt. Campagne C blijft bewust zoals
            # de trigger hem achterlaat: dat is de echte "nog in te richten"-
            # toestand. Voor A en B vullen we de wizardvelden bij.
            if c.launch_date is not None or c.invited_count is not None:
                cur.execute(
                    "update campaign_delivery_records set launch_date = %s, "
                    "launch_confirmed_at = %s, invited_count = %s, lifecycle_stage = %s, "
                    "updated_at = now() where campaign_id = %s",
                    (c.launch_date, c.launch_confirmed_at, c.invited_count,
                     c.lifecycle_stage, c.id),
                )
                if cur.rowcount != 1:
                    raise RuntimeError(
                        f"Delivery record voor campagne {c.key} niet gevonden "
                        f"(rowcount={cur.rowcount}). Is de trigger on_campaign_created weg?"
                    )

        response_columns = [
            "tenure_years", "exit_reason_category", "exit_reason_code", "stay_intent_score",
            "sdt_raw", "sdt_scores", "org_raw", "org_scores", "pull_factors_raw",
            "open_text_raw", "uwes_raw", "uwes_score", "turnover_intention_raw",
            "turnover_intention_score", "risk_score", "risk_band", "preventability",
            "replacement_cost_eur", "full_result", "deepening_responses",
        ]
        if has_direction_column:
            response_columns.append("direction_response")
        json_columns = {
            "sdt_raw", "sdt_scores", "org_raw", "org_scores", "pull_factors_raw",
            "uwes_raw", "turnover_intention_raw", "full_result", "deepening_responses",
            "direction_response",
        }

        for r in dataset.respondents:
            campaign = dataset.campaign(r.campaign_key)
            cur.execute(
                "insert into respondents (id, campaign_id, token, department, sent_at, "
                "opened_at, completed, completed_at, dedup_key_hash, token_expires_at) "
                "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (r.id, campaign.id, r.token, r.department, r.sent_at, r.opened_at,
                 r.completed, r.completed_at, r.dedup_key_hash,
                 (r.completed_at or now) + timedelta(days=90)),
            )
            if r.response is None:
                continue
            values = []
            for col in response_columns:
                v = r.response.get(col)
                values.append(Json(v) if col in json_columns and v is not None else v)
            placeholders = ", ".join(["%s"] * (len(response_columns) + 3))
            cur.execute(
                f"insert into survey_responses (id, respondent_id, {', '.join(response_columns)}, submitted_at) "
                f"values ({placeholders})",
                [stable_uuid("response", r.campaign_key, r.id), r.id, *values, r.completed_at],
            )

        after = census(cur)
        drift = {k: (before[k], after[k]) for k in before if before[k] != after[k]}
        if drift:
            conn.rollback()
            raise SystemExit(
                "AFGEBROKEN: rijen van andere organisaties zijn veranderd. "
                f"Niets gecommit. Verschillen (voor, na): {drift}"
            )

        conn.commit()
        print(f"\nControle           {len(before)} tellingen van andere organisaties ongewijzigd")
    finally:
        conn.close()

    print(f"\norg_id             {dataset.org_id}")
    for c in dataset.campaigns:
        print(f"campagne {c.key}         {c.id}  {c.name}")

    if not has_direction_column:
        print(
            "\nOMGEVINGSPROBLEEM (geen scriptfout): de kolom "
            "survey_responses.direction_response bestaat niet in deze database. "
            "De richtingantwoorden zijn daarom NIET weggeschreven en het "
            "rapportblok 'Wat er moet gebeuren' blijft leeg. Draai "
            "migrations/2026_09_07_add_direction_response.sql in de Supabase "
            "SQL Editor en daarna dit script met --reset."
        )
    return 0


def _has_direction_column(cur) -> bool:
    cur.execute(
        "select 1 from information_schema.columns where table_schema = 'public' "
        "and table_name = 'survey_responses' and column_name = 'direction_response'"
    )
    return cur.fetchone() is not None


def _resolve_operator_id(database_url: str) -> str:
    import psycopg2

    with psycopg2.connect(database_url, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute("select id from profiles where is_verisight_admin order by created_at limit 2")
            rows = cur.fetchall()
    if not rows:
        raise SystemExit(
            "Geen Loep-operator gevonden (profiles.is_verisight_admin). Zonder "
            "operator kan de testorganisatie niet in /beheer verschijnen."
        )
    if len(rows) > 1:
        print("LET OP: meerdere operators gevonden; de oudste wordt gebruikt.")
    return str(rows[0][0])


def _print_existing(database_url: str, org_id: str) -> None:
    import psycopg2

    with psycopg2.connect(database_url, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "select id, name, scan_type, is_active from campaigns "
                "where organization_id = %s order by created_at",
                (org_id,),
            )
            for cid, name, scan, active in cur.fetchall():
                print(f"  campagne {cid}  {name}  ({scan}, actief={active})")


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main() -> int:
    try:  # Windows-console valt anders terug op cp1252 en breekt op accenten.
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true",
                    help="Seed tegen een wegwerp-SQLite en render het rapport. Raakt productie niet.")
    ap.add_argument("--login-link", action="store_true",
                    help="Print een eenmalige inloglink voor de testklant en stop. "
                         "Zo hoeft het wachtwoord niet in een formulier.")
    ap.add_argument("--login-base-url", default="https://www.getloep.nl",
                    help="Basis-URL waar --login-link naartoe wijst.")
    ap.add_argument("--reset", action="store_true",
                    help="Verwijder de rijen van de testorganisatie en zet ze opnieuw.")
    ap.add_argument("--env-file", default=str(ROOT / "frontend" / ".env.local"),
                    help="Gitignored bestand waarin de inloggegevens komen te staan.")
    ap.add_argument("--out-dir", default=str(ROOT / ".tmp" / "testklant"),
                    help="Map voor de dry-run-HTML (gitignored; het bestand is ~3 MB).")
    args = ap.parse_args()

    if args.dry_run and args.reset:
        raise SystemExit("--dry-run en --reset sluiten elkaar uit.")

    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")

    if args.login_link:
        return print_login_link(args.login_base_url)

    now = datetime.now(timezone.utc)
    dataset = build_dataset(now)

    if args.dry_run:
        return run_dry(dataset, Path(args.out_dir))

    env_path = Path(args.env_file)
    existing = read_env_file(env_path)
    password = existing.get(ENV_PASSWORD_KEY, "").strip() or generate_password()

    code = run_production(dataset, reset=args.reset, password=password, now=now)
    if code == 0:
        write_env_values(env_path, {ENV_EMAIL_KEY: TEST_OWNER_EMAIL, ENV_PASSWORD_KEY: password})
        print(f"\nInloggegevens      {ENV_EMAIL_KEY} en {ENV_PASSWORD_KEY} in {env_path}")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
