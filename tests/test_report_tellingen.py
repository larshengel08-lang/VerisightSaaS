"""B13 Anders-toelichtingen en B14 tellingen met noemer (spec par. 9)."""
import re

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.shared.deepening import aggregate_deepening, aggregate_direction
from backend.report_html import (
    MAX_QUOTES,
    MIN_QUOTES_N,
    OTHER_SHARE_MIN,
    _anders_block,
    build_report_data,
)

LOW_GROWTH = {f"growth_{i}": 1 for i in (1, 2, 3)} | {f"{fk}_{i}": 5 for fk in
              ("leadership", "culture", "compensation", "workload", "role_clarity") for i in (1, 2, 3)}


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _quotes(t):
    return t.replace("&ldquo;", "“").replace("&rdquo;", "”")


def test_aggregaties_verzamelen_de_anders_teksten():
    entries = [{"factor_key": "growth", "question_set_version": "v", "status": "answered",
                "primary": "gr_other", "secondary": None, "other_text": "Mijn contract is tijdelijk."}]
    agg = aggregate_deepening([(LOW_GROWTH, entries)], "retention")
    assert agg["growth"]["other_texts"] == ["Mijn contract is tijdelijk."]
    dr = {"factor_key": "growth", "question_set_version": "v", "status": "answered",
          "choice": "grd_other", "other_text": "Een andere functie."}
    dagg = aggregate_direction([(LOW_GROWTH, dr)], "retention")
    assert dagg["growth"]["other_texts"] == ["Een andere functie."]
    # Zonder tekst: geen lege string in de lijst.
    dr["other_text"] = None
    assert aggregate_direction([(LOW_GROWTH, dr)], "retention")["growth"]["other_texts"] == []


def test_anders_drempel_is_benoemd():
    assert OTHER_SHARE_MIN == 0.20


def test_anders_block_toont_teksten_vanaf_vijf():
    teksten = [f"Toelichting {i}." for i in range(5)]
    html = _anders_block(other_n=5, answered=16, texts=teksten)
    t = _tekst(html)
    assert "5 van de 16 kozen “Anders” en schreven een eigen toelichting" in _quotes(t)
    for x in teksten:
        assert x in t


def test_anders_block_alleen_aantal_onder_vijf():
    teksten = ["Toelichting alfa.", "Toelichting beta.", "Toelichting gamma.", "Toelichting delta."]
    t = _tekst(_anders_block(other_n=4, answered=16, texts=teksten))
    assert "4 van de 16 kozen" in t
    assert "tonen we pas vanaf 5" in t
    assert not any(x in t for x in teksten)


def test_anders_block_leeg_onder_de_drempel():
    assert _anders_block(other_n=3, answered=16, texts=["a", "b", "c"]) == ""   # 19% < 20%
    assert _anders_block(other_n=0, answered=16, texts=[]) == ""


def test_anders_block_zonder_noemer_is_leeg():
    assert _anders_block(other_n=2, answered=0, texts=["a", "b"]) == ""


def test_anders_block_zonder_em_dash():
    t = _tekst(_anders_block(other_n=6, answered=12, texts=[f"Tekst {i}." for i in range(6)]))
    assert "—" not in t and "&mdash;" not in t


def test_anders_block_belooft_geen_teksten_die_er_niet_zijn():
    """Bij de verdieping mag "Anders" zonder toelichting (schemas.py laat dat toe),
    dus other_n kan hoger zijn dan het aantal teksten. Dan claimt de kop niet dat
    ze allemaal iets schreven."""
    t = _quotes(_tekst(_anders_block(other_n=6, answered=12,
                                     texts=["Alfa.", "Beta.", "Gamma.", "Delta."])))
    assert "6 van de 12 kozen “Anders”" in t
    assert "4 van hen schreven" in t
    assert "6 van de 12 kozen “Anders” en schreven" not in t


def test_anders_block_toont_geen_teksten_onder_de_quote_staffel():
    """De privacystaffel telt de teksten, niet de keuzes: vier toelichtingen
    blijven onzichtbaar, ook als zes mensen "Anders" kozen."""
    teksten = ["Alfa.", "Beta.", "Gamma.", "Delta."]
    t = _tekst(_anders_block(other_n=6, answered=12, texts=teksten))
    assert f"tonen we pas vanaf {MIN_QUOTES_N}" in t
    assert not any(x in t for x in teksten)


def test_anders_block_meldt_dat_het_afkapt():
    teksten = [f"Toelichting {i}." for i in range(MAX_QUOTES + 3)]
    t = _tekst(_anders_block(other_n=len(teksten), answered=40, texts=teksten))
    assert f"de eerste {MAX_QUOTES} van {len(teksten)}" in t
    assert teksten[MAX_QUOTES] not in t


def test_build_report_data_anonimiseert_de_anders_teksten(db_session: Session):
    """De toelichtingen gaan door dezelfde sanitizer als de open teksten. De
    submit-route doet dat al bij opslag; deze test pint dat de rapportlaag er
    niet op vertrouwt, want historische rijen komen van vóór die sanitizer."""
    org = Organization(name="TestOrg", slug="testorg-anders", contact_email="hr@test.nl")
    db_session.add(org)
    db_session.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type="retention",
                    comms_mode="self_send")
    db_session.add(camp)
    db_session.flush()
    for i in range(3):
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker", completed=True)
        db_session.add(r)
        db_session.add(SurveyResponse(
            respondent=r, sdt_raw={}, sdt_scores={}, org_raw=dict(LOW_GROWTH),
            org_scores={}, pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
            risk_score=5.5, risk_band="MIDDEN",
            deepening_responses=[{
                "factor_key": "growth", "question_set_version": "retention_growth_v1",
                "status": "answered", "primary": "gr_other", "secondary": None,
                "other_text": "Pieter Jansen beloofde mij een pad, mail piet@test.nl."}],
            direction_response={
                "factor_key": "growth",
                "question_set_version": "retention_growth_direction_v1",
                "status": "answered", "choice": "grd_other",
                "other_text": "Vraag het Sanne Bakker, zij weet het."}))
    db_session.commit()

    data = build_report_data(camp.id, db_session)
    deep = data["deepening_agg"]["growth"]["other_texts"]
    direc = data["direction_agg"]["growth"]["other_texts"]
    assert len(deep) == 3 and len(direc) == 3
    for t in deep:
        assert "Pieter Jansen" not in t and "piet@test.nl" not in t
        assert "[NAAM]" in t and "[EMAIL]" in t
    for t in direc:
        assert "Sanne Bakker" not in t and "[NAAM]" in t


def test_anders_block_escapet_de_teksten():
    html = _anders_block(other_n=5, answered=10,
                         texts=["<script>x</script>", "b.", "c.", "d.", "e."])
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
