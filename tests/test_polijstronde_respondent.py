"""Spec 2026-10-09 par. 4: respondentflow in gewone taal, een bron voor de invultijd.

Plan polijstronde, Taak 12. Wat een respondent leest (startpagina, vragenlijst,
bedankpagina, statuspagina's, foutmeldingen na versturen) is Nederlands, zonder
em- of en-dashes, zonder "survey" en zonder jargon, en de invultijd komt overal
uit `survey_minutes` in de productdefinitie.
"""
from __future__ import annotations

import re
import uuid
from datetime import date
from html import unescape
from pathlib import Path

import pytest

from backend.models import Campaign, Organization, OrganizationSecret, Respondent
from backend.products.exit.definition import SCAN_DEFINITION as EXIT
from backend.products.onboarding.definition import SCAN_DEFINITION as ONB
from backend.products.retention.definition import SCAN_DEFINITION as RET

ROOT = Path(__file__).resolve().parent.parent
RESPONDENT = [ROOT / "templates" / n for n in ("survey-intro.html", "survey.html",
              "complete.html", "survey-status.html")] + sorted((ROOT / "templates" / "survey").glob("*.html"))

EM = chr(0x2014)
EN = chr(0x2013)
# Mojibake van UTF-8 dat als cp1252 is gelezen: "â€" (zoals in "â€”") en "â—".
KAPOT = (chr(0xE2) + chr(0x20AC), chr(0xE2) + chr(0x2014))


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_streepjes_in_respondenttemplates(pad):
    tekst = pad.read_text(encoding="utf-8")
    assert EM not in tekst and EN not in tekst


@pytest.mark.parametrize("pad", RESPONDENT, ids=lambda p: p.name)
def test_geen_kapotte_tekens(pad):
    tekst = pad.read_text(encoding="utf-8")
    for kapot in KAPOT:
        assert kapot not in tekst


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
    """SURVEY_MINUTES in campaign-setup.ts en survey_minutes in de definities: in
    beide richtingen dezelfde scans met dezelfde getallen."""
    from backend.scan_definitions import SCAN_DEFINITIONS

    ts = (ROOT / "frontend" / "lib" / "campaign-setup.ts").read_text(encoding="utf-8")
    m = re.search(r"export const SURVEY_MINUTES\b[^=]*=\s*\{([^}]*)\}", ts)
    assert m, "export const SURVEY_MINUTES niet gevonden in frontend/lib/campaign-setup.ts"
    frontend = {k: int(v) for k, v in re.findall(r"(\w+)\s*:\s*(\d+)", m.group(1))}
    backend = {scan: d["survey_minutes"] for scan, d in SCAN_DEFINITIONS.items() if "survey_minutes" in d}
    assert frontend == backend
    assert backend == {"exit": 8, "retention": 6, "onboarding": 3}


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


def _start(client, db_session, campaign: Campaign):
    """Start de open flow; geeft (redirect-response, respondent) terug."""
    start = client.post("/survey/open/" + campaign.public_survey_token + "/start",
                        data={}, follow_redirects=False)
    assert start.status_code == 303
    respondent = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).one()
    return start, respondent


def _zichtbare_tekst(html: str) -> str:
    """Wat een respondent leest: scripts, styles, commentaar en tags eruit.

    Attribuutwaarden die op het scherm komen (data-label voedt het
    voortgangslabel, placeholder, title) tellen mee, en entiteiten worden
    gedecodeerd zodat ook `&mdash;` of `&#8211;` opvalt."""
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style\b.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    attrs = re.findall(r'\b(?:data-label|placeholder|title)\s*=\s*"([^"]*)"', html)
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", unescape(html + " " + " ".join(attrs)))


def test_zichtbare_tekst_vangt_attributen_en_entiteiten():
    html = '<div data-label="Stap &mdash; x"><input placeholder="a &#8211; b"></div>'
    tekst = _zichtbare_tekst(html)
    assert EM in tekst and EN in tekst


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
    assert EM not in tekst and EN not in tekst


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


def test_startpagina_noemt_de_sluitdag(client, db_session):
    campaign = _make_campaign(db_session, "retention", "acme-sluitdag")
    campaign.closes_at = date(2099, 10, 8)
    db_session.commit()
    r = client.get("/survey/open/" + campaign.public_survey_token)
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "Invullen kan tot en met 8 oktober 2099." in tekst
    assert "90 dagen" not in tekst


def test_startpagina_zonder_sluitdatum_belooft_geen_termijn(client, db_session):
    campaign = _make_campaign(db_session, "retention", "acme-geen-sluitdag")
    r = client.get("/survey/open/" + campaign.public_survey_token)
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "tot en met" not in tekst
    assert "90 dagen" not in tekst


def test_format_closes_at_gelijk_aan_de_uitnodiging():
    """Zelfde vorm als "Invullen kan tot en met 8 oktober 2026." in
    frontend/lib/self-send-comms.test.ts."""
    from backend.survey_window import format_closes_at

    assert format_closes_at(date(2026, 10, 8)) == "8 oktober 2026"
    assert format_closes_at(date(2027, 1, 31)) == "31 januari 2027"


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_vragenlijst_zonder_streepjes_survey_en_jargon(client, db_session, scan_type):
    campaign = _make_campaign(db_session, scan_type, "acme-vl-" + scan_type)
    start, _ = _start(client, db_session, campaign)
    r = client.get(start.headers["location"])
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    for verboden in (EM, EN, "Stay-intent", "(push)", "(pull)", chr(0xE2), "Organisatiefactoren"):
        assert verboden not in tekst, verboden
    assert "survey" not in tekst.lower()
    assert "Verstuur je antwoorden" in tekst
    assert "Je werksituatie" in tekst
    if scan_type == "exit":
        assert "Stap 1: Over je vertrek" in tekst
        assert "Kies een antwoord" in tekst
        assert "3 tot 6 maanden" in tekst
        assert "Vertrekcontext" not in tekst
    else:
        assert "Werkplezier en blijven" in tekst
        assert "Behoudssignalen" not in tekst


def test_bedankpagina_in_gewone_taal(client, db_session):
    r = client.get("/survey/complete")
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "Bedankt voor je deelname" in tekst
    assert "survey" not in tekst.lower() and "responses" not in tekst
    assert EM not in tekst and EN not in tekst


def test_statuspagina_ongeldige_link(client):
    r = client.get("/survey/open/" + str(uuid.uuid4()))
    assert r.status_code == 404
    tekst = _zichtbare_tekst(r.text)
    assert "Deze link naar de vragenlijst klopt niet" in tekst
    assert "survey" not in tekst.lower()


def test_al_ingevuld_in_gewone_taal(client, db_session):
    campaign = _make_campaign(db_session, "exit", "acme-al-ingevuld")
    start, respondent = _start(client, db_session, campaign)
    respondent.completed = True
    db_session.commit()
    r = client.get(start.headers["location"])
    assert r.status_code == 200
    tekst = _zichtbare_tekst(r.text)
    assert "Je hebt deze vragenlijst al eerder ingevuld. Je antwoorden" in tekst
    assert "survey" not in tekst.lower()
    assert EM not in tekst and EN not in tekst


def test_main_respondentteksten_zonder_survey_en_u():
    """De statuspagina's en foutteksten in main.py die een respondent leest."""
    src = (ROOT / "backend" / "main.py").read_text(encoding="utf-8")
    for oud in ("Survey-link", "survey-link klopt", "U heeft deze vragenlijst",
                "uw eerdere antwoorden", "Survey al ingevuld", "De survey is niet opgeslagen",
                "Opslaan van survey-antwoorden", "invullen van de survey",
                "de survey alsnog wilt invullen", "Ongeldige token.",
                'detail="Verouderde', 'detail="Onbekende', "niet ondersteund voor dit scantype"):
        assert oud not in src, oud


# ── Foutmeldingen die de vragenlijst letterlijk toont ────────────────────────

def test_onvolledige_inzending_toont_gewone_taal_en_logt_reden(client, db_session, caplog):
    from backend.survey_messages import SURVEY_INCOMPLETE_MESSAGE

    campaign = _make_campaign(db_session, "exit", "acme-onvolledig")
    _, respondent = _start(client, db_session, campaign)
    with caplog.at_level("WARNING", logger="loep.survey"):
        r = client.post("/survey/submit", json={"token": respondent.token, "sdt_raw": {}, "org_raw": {}})
    assert r.status_code == 422
    assert r.json()["detail"] == SURVEY_INCOMPLETE_MESSAGE
    assert "ExitScan vereist alle 12 werkbelevingsitems." in caplog.text


def test_scoringsfout_noemt_vervolgstap():
    src = re.sub(r'"\s+"', "", (ROOT / "backend" / "main.py").read_text(encoding="utf-8"))
    assert ("Je antwoorden konden niet worden verwerkt en zijn niet opgeslagen. "
            "Probeer het over een paar minuten opnieuw. Lukt het dan nog niet, "
            "neem contact op met de HR-afdeling van je organisatie.") in src


def test_respondentmeldingen_zonder_streepjes_en_technische_woorden():
    from backend.survey_messages import SURVEY_INCOMPLETE_MESSAGE, SURVEY_RELOAD_MESSAGE

    for melding in (SURVEY_INCOMPLETE_MESSAGE, SURVEY_RELOAD_MESSAGE):
        assert EM not in melding and EN not in melding
        for woord in ("survey", "versie", "scantype", "optie", "item"):
            assert woord not in melding.lower()


# ── Log-injectie: clientwaarden begrensd en zonder ruwe newline in de log ──────

def test_reden_in_log_is_begrensd_en_een_regel(caplog):
    from backend.survey_messages import LOG_REASON_MAX, reject_stale_answers

    waarde = "x" * 500 + "\nINFO nep-logregel"
    with caplog.at_level("WARNING", logger="loep.survey"):
        reject_stale_answers("Onbekende gespreksrichting-optie (" + waarde + ").", campaign_id="c-1")
    regels = [r.getMessage() for r in caplog.records if r.name == "loep.survey"]
    assert len(regels) == 1
    regel = regels[0]
    assert "\n" not in regel and "\r" not in regel
    assert "nep-logregel" not in regel
    assert "...[afgekapt]" in regel
    assert len(regel) < LOG_REASON_MAX + 80


def test_submit_met_lange_waarde_en_newline_logt_begrensd(client, db_session, caplog):
    """Via het echte endpoint: een richtingkeuze met een lange waarde en een newline."""
    from tests.test_direction_submit import _dr, _org_raw, _retention_payload, _setup

    r = _setup(db_session)
    with caplog.at_level("WARNING", logger="loep.survey"):
        resp = client.post("/survey/submit", json=_retention_payload(
            r.token, org_raw=_org_raw({"workload": 2}),
            direction=_dr(choice="wld_" + "y" * 400 + "\nERROR nep")))
    assert resp.status_code == 422
    regels = [rec.getMessage() for rec in caplog.records if rec.name == "loep.survey"]
    assert len(regels) == 1
    assert "\n" not in regels[0] and "ERROR nep" not in regels[0]
    assert "...[afgekapt]" in regels[0]
    assert str(r.campaign_id) in regels[0]
