"""Spec 2026-10-09 par. 4: respondentflow in gewone taal, een bron voor de invultijd.

Plan polijstronde, Taak 12. Wat een respondent leest (startpagina, vragenlijst,
bedankpagina, statuspagina's) is Nederlands, zonder em- of en-dashes, zonder
"survey" en zonder jargon, en de invultijd komt overal uit `survey_minutes`
in de productdefinitie.
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

from backend.models import Campaign, Organization, OrganizationSecret
from backend.products.exit.definition import SCAN_DEFINITION as EXIT
from backend.products.onboarding.definition import SCAN_DEFINITION as ONB
from backend.products.retention.definition import SCAN_DEFINITION as RET

ROOT = Path(__file__).resolve().parent.parent
RESPONDENT = [ROOT / "templates" / n for n in ("survey-intro.html", "survey.html",
              "complete.html", "survey-status.html")] + sorted((ROOT / "templates" / "survey").glob("*.html"))


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_streepjes_in_respondenttemplates(pad):
    tekst = pad.read_text(encoding="utf-8")
    assert "—" not in tekst and "–" not in tekst


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_kapotte_tekens(pad):
    tekst = pad.read_text(encoding="utf-8")
    assert "â€" not in tekst and "â—" not in tekst


def test_startknop_nederlands():
    intro = (ROOT / "templates" / "survey-intro.html").read_text(encoding="utf-8")
    assert "Survey starten" not in intro and "Begin met invullen" in intro
    assert "gecontroleerd op herleidbare informatie" not in intro


def test_anonimiseringszin_noemt_wat_anonymize_text_doet():
    """De zin op de startpagina belooft precies wat backend/scoring.py:_PATTERNS weghaalt."""
    from backend.scoring import anonymize_text

    intro = (ROOT / "templates" / "survey-intro.html").read_text(encoding="utf-8")
    assert ("Herkende namen, e-mailadressen, telefoonnummers en postcodes haalt Loep "
            "automatisch uit open antwoorden") in re.sub(r"\s+", " ", intro)
    uit = anonymize_text("Mail Jan Jansen op jan@acme.nl of 0612345678, 8301 AB")
    for vervanger in ("[NAAM]", "[EMAIL]", "[TELEFOON]", "[POSTCODE]"):
        assert vervanger in uit


@pytest.mark.parametrize("definitie,minuten", [(EXIT, 8), (RET, 6), (ONB, 3)])
def test_invultijd_een_bron(definitie, minuten):
    assert definitie["survey_minutes"] == minuten
    assert "ongeveer " + str(minuten) + " minuten" in definitie["survey_intro"]
    assert definitie["invite_duration"] == "ongeveer " + str(minuten) + " minuten"


def test_frontend_minuten_gelijk_aan_backend():
    ts = (ROOT / "frontend" / "lib" / "campaign-setup.ts").read_text(encoding="utf-8")
    m = re.search(r"SURVEY_MINUTES[^=]*=\s*\{([^}]*)\}", ts)
    assert m, "SURVEY_MINUTES niet gevonden in frontend/lib/campaign-setup.ts"
    blok = m.group(1)
    for scan, d in (("exit", EXIT), ("retention", RET), ("onboarding", ONB)):
        assert re.search(r"\b" + scan + r"\s*:\s*" + str(d["survey_minutes"]) + r"\b", blok), scan


def test_onboarding_intro_zonder_jargon():
    intro = ONB["survey_intro"]
    assert "onboarding-scan" not in intro
    assert "managementread" not in intro
    assert "checkpoint" not in intro


# ── Gerenderde pagina's ──────────────────────────────────────────────────────

def _make_campaign(db_session, scan_type: str, slug: str) -> Campaign:
    org = Organization(name="Acme BV " + slug, slug=slug, contact_email="hr@acme.nl")
    db_session.add(org)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=org.id, api_key="key-" + slug))
    campaign = Campaign(
        organization_id=org.id,
        name="Meting " + scan_type,
        scan_type=scan_type,
        delivery_mode="baseline",
        comms_mode="self_send",
        is_active=True,
    )
    db_session.add(campaign)
    db_session.commit()
    db_session.refresh(campaign)
    return campaign


def _zichtbare_tekst(html: str) -> str:
    """Wat een respondent leest: scripts, styles, commentaar en tags eruit."""
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style\b.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", html)


@pytest.mark.parametrize("scan_type,minuten,aanhef", [
    ("exit", 8, "De organisatie waar je werkt of werkte, heeft Loep gevraagd"),
    ("retention", 6, "Je organisatie heeft Loep gevraagd"),
    ("onboarding", 3, "Je organisatie heeft Loep gevraagd"),
])
def test_startpagina_toont_invultijd_en_juiste_aanhef(client, db_session, scan_type, minuten, aanhef):
    campaign = _make_campaign(db_session, scan_type, "acme-" + scan_type)
    r = client.get("/survey/open/" + campaign.public_survey_token)
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "Invullen kost ongeveer " + str(minuten) + " minuten." in tekst
    assert aanhef in tekst
    assert "Begin met invullen" in tekst
    assert "Je werkgever" not in tekst
    assert "10 tot 15" not in tekst
    assert "survey" not in tekst.lower()
    assert "—" not in tekst and "–" not in tekst


def test_startpagina_zonder_survey_minutes_noemt_geen_tijd(client, db_session, monkeypatch):
    """Een scan zonder survey_minutes (niet verkocht) krijgt geen verzonnen getal."""
    import backend.main as main_mod

    campaign = _make_campaign(db_session, "retention", "acme-zonder-tijd")
    zonder = {k: v for k, v in RET.items() if k != "survey_minutes"}
    monkeypatch.setattr(main_mod, "get_scan_definition", lambda scan_type: zonder)
    r = client.get("/survey/open/" + campaign.public_survey_token)
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "minuten" not in tekst
    assert "Je organisatie heeft Loep gevraagd" in tekst


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_vragenlijst_zonder_streepjes_survey_en_jargon(client, db_session, scan_type):
    campaign = _make_campaign(db_session, scan_type, "acme-vl-" + scan_type)
    start = client.post("/survey/open/" + campaign.public_survey_token + "/start",
                        data={}, follow_redirects=False)
    assert start.status_code == 303
    r = client.get(start.headers["location"])
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    for verboden in ("—", "–", "Stay-intent", "(push)", "(pull)", "â"):
        assert verboden not in tekst, verboden
    assert "survey" not in tekst.lower()
    assert "Verstuur je antwoorden" in tekst
    if scan_type == "exit":
        assert "Kies een antwoord" in tekst
        assert "3 tot 6 maanden" in tekst
        assert "Vertrekcontext" not in tekst
    else:
        assert "Werkplezier en blijven" in tekst
        assert "Behoudssignalen" not in tekst


def test_bedankpagina_en_al_ingevuld_in_gewone_taal(client, db_session):
    r = client.get("/survey/complete")
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "survey" not in tekst.lower() and "responses" not in tekst
    assert "—" not in tekst and "–" not in tekst


def test_statuspagina_ongeldige_link(client):
    import uuid

    r = client.get("/survey/open/" + str(uuid.uuid4()))
    assert r.status_code == 404
    tekst = _zichtbare_tekst(r.text)
    assert "Deze link naar de vragenlijst klopt niet" in tekst
    assert "survey" not in tekst.lower()


def test_al_ingevuld_in_gewone_taal(client, db_session):
    campaign = _make_campaign(db_session, "exit", "acme-al-ingevuld")
    start = client.post("/survey/open/" + campaign.public_survey_token + "/start",
                        data={}, follow_redirects=False)
    from backend.models import Respondent

    respondent = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).one()
    respondent.completed = True
    db_session.commit()
    r = client.get(start.headers["location"])
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "Je hebt deze vragenlijst al eerder ingevuld. Je antwoorden" in tekst
    assert "survey" not in tekst.lower()
    assert "—" not in tekst and "–" not in tekst


def test_main_respondentteksten_zonder_survey_en_u():
    """De statuspagina's en foutteksten in main.py die een respondent leest."""
    src = (ROOT / "backend" / "main.py").read_text(encoding="utf-8")
    for oud in ("Survey-link", "survey-link klopt", "U heeft deze vragenlijst",
                "uw eerdere antwoorden", "Survey al ingevuld", "De survey is niet opgeslagen",
                "Opslaan van survey-antwoorden", "invullen van de survey",
                "de survey alsnog wilt invullen", "Ongeldige token."):
        assert oud not in src, oud
