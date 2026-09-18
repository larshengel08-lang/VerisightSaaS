"""B13 Anders-toelichtingen en B14 tellingen met noemer (spec par. 9)."""
import re

from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.shared.deepening import aggregate_deepening, aggregate_direction
from backend.report_html import (
    MAX_QUOTES,
    MIN_QUOTES_N,
    OTHER_MIN_N,
    _anders_block,
    _deepening_block,
    _direction_card_cell,
    build_report_data,
)

LOW_GROWTH = {f"growth_{i}": 1 for i in (1, 2, 3)} | {f"{fk}_{i}": 5 for fk in
              ("leadership", "culture", "compensation", "workload", "role_clarity") for i in (1, 2, 3)}

ANON_LABEL = "Automatisch geanonimiseerd: herkende namen en contactgegevens verwijderd"


def _plain(html):
    """Tags eruit, witruimte BEWUST intact: een dubbele spatie of een spatie
    voor een puntkomma moet in een assert opvallen (codereview taak 9)."""
    return re.sub(r"<[^>]+>", "", html).replace("&lsquo;", "‘").replace("&rsquo;", "’")


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


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


def test_anders_block_toont_teksten_vanaf_vijf():
    teksten = [f"Toelichting {i}." for i in range(5)]
    html = _anders_block(other_n=5, answered=16, texts=teksten)
    assert ("5 van de 16 kozen ‘Anders’ en schreven een eigen toelichting: "
            "de vaste opties dekten hun ervaring niet.") in _plain(html)
    for x in teksten:
        assert x in _plain(html)
    assert ANON_LABEL in _plain(html)


def test_anders_block_alleen_aantal_onder_vijf():
    teksten = ["Toelichting alfa.", "Toelichting beta.", "Toelichting gamma.", "Toelichting delta."]
    t = _plain(_anders_block(other_n=4, answered=16, texts=teksten))
    assert "4 van de 16 kozen ‘Anders’ en schreven een eigen toelichting" in t
    assert "De teksten tonen we pas vanaf 5, om herleidbaarheid te voorkomen." in t
    assert not any(x in t for x in teksten)
    # Zonder teksten ook geen anonimiseringslabel: er staat niets om te anonimiseren.
    assert ANON_LABEL not in t


def test_anders_block_leeg_onder_de_drempel():
    assert _anders_block(other_n=3, answered=16, texts=["a", "b", "c"]) == ""   # 19% < 20%
    assert _anders_block(other_n=0, answered=16, texts=[]) == ""


def test_anders_block_zonder_noemer_is_leeg():
    assert _anders_block(other_n=2, answered=0, texts=["a", "b"]) == ""


def test_anders_block_zwijgt_als_niemand_iets_schreef():
    """Bij de verdieping mag "Anders" zonder toelichting: dan is er niets te
    melden en staat de telling al in de verdelingstabel erboven."""
    assert _anders_block(other_n=3, answered=10, texts=[]) == ""
    assert _anders_block(other_n=3, answered=10, texts=["", "   "]) == ""


def test_anders_block_heeft_een_absolute_vloer():
    """Eén respondent op de minimumbasis is geen bevinding: 1 van de 3 haalt het
    aandeel wel, maar OTHER_MIN_N houdt het blok dicht."""
    assert OTHER_MIN_N == 2
    assert _anders_block(other_n=1, answered=3, texts=["Alleen ik."]) == ""
    assert _anders_block(other_n=2, answered=3, texts=["Alfa.", "Beta."]) != ""


def test_anders_block_zonder_em_dash():
    t = _tekst(_anders_block(other_n=6, answered=12, texts=[f"Tekst {i}." for i in range(6)]))
    assert "—" not in t and "&mdash;" not in t


def test_anders_block_belooft_geen_teksten_die_er_niet_zijn():
    """other_n kan hoger zijn dan het aantal teksten (Anders zonder toelichting).
    Dan claimt de kop niet dat ze allemaal iets schreven, en staat er geen spatie
    voor de puntkomma."""
    t = _plain(_anders_block(other_n=6, answered=12,
                             texts=["Alfa.", "Beta.", "Gamma.", "Delta."]))
    assert ("6 van de 12 kozen ‘Anders’; 4 schreven een toelichting: "
            "de vaste opties dekten hun ervaring niet.") in t
    assert "‘Anders’ ;" not in t
    assert "en schreven een eigen toelichting" not in t


def test_anders_block_enkelvoud_bij_een_toelichting():
    t = _plain(_anders_block(other_n=4, answered=10, texts=["Alleen ik schreef iets."]))
    assert "4 van de 10 kozen ‘Anders’; 1 schreef een toelichting:" in t


def test_anders_block_toont_geen_teksten_onder_de_quote_staffel():
    """De privacystaffel telt de teksten, niet de keuzes: vier toelichtingen
    blijven onzichtbaar, ook als zes mensen "Anders" kozen."""
    teksten = ["Alfa.", "Beta.", "Gamma.", "Delta."]
    t = _plain(_anders_block(other_n=6, answered=12, texts=teksten))
    assert f"De teksten tonen we pas vanaf {MIN_QUOTES_N}" in t
    assert not any(x in t for x in teksten)


def test_anders_block_meldt_dat_het_afkapt():
    teksten = [f"Toelichting {i}." for i in range(MAX_QUOTES + 3)]
    t = _plain(_anders_block(other_n=len(teksten), answered=40, texts=teksten))
    assert (f"Getoond: de eerste {MAX_QUOTES} van {len(teksten)} in ontvangstvolgorde, "
            "geen inhoudelijke selectie.") in t
    assert teksten[MAX_QUOTES] not in t


def test_anders_block_escapet_de_teksten():
    html = _anders_block(other_n=5, answered=10,
                         texts=["<script>x</script>", "b.", "c.", "d.", "e."])
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


def test_anders_block_gebruikt_klassen_geen_inline_styles():
    """De regels moeten kunnen afbreken (200 tekens vrije tekst in een halve
    kolom, zie het commentaar bij .cmeta in report_css.py); die opmaak staat in
    het stylesheet, niet in een inline style."""
    html = _anders_block(other_n=5, answered=10, texts=[f"T{i}." for i in range(5)])
    assert "style=" not in html
    for klasse in ("anders-kop", "anders-list", "anders-anon"):
        assert klasse in html


# ── Wiring: de twee aanroepplekken ───────────────────────────────────────────

def _deep_agg(**counts):
    n = sum(counts.values())
    return {"triggered": n, "offered": n, "answered": n, "skipped": 0,
            "primary_counts": counts, "secondary_counts": {},
            "other_texts": [f"Iets eigens {i}." for i in range(counts.get("gr_other", 0))]}


def test_verdiepingsblok_toont_de_anders_toelichtingen():
    html = _deepening_block(_deep_agg(gr_other=6, gr_visibility=5, gr_time=5),
                            "retention", "growth")
    t = _plain(html)
    assert "6 van de 16 kozen ‘Anders’ en schreven een eigen toelichting" in t
    assert "Iets eigens 0." in t


def test_verdiepingsblok_zet_de_beperkte_basis_regel_voor_de_lijst():
    """"Beperkte antwoordbasis" hoort bij de verdeling erboven, niet bij de
    toelichtingen eronder."""
    html = _deepening_block(_deep_agg(gr_other=5, gr_visibility=2), "retention", "growth")
    t = _plain(html)
    assert t.index("Beperkte antwoordbasis") < t.index("kozen ‘Anders’")


def test_richtingkaart_toont_de_anders_toelichtingen_na_de_caveat():
    agg = {"lowest_n": 14, "offered": 13, "answered": 12, "skipped": 1,
           "counts": {"grd_other": 5, "grd_visibility": 4, "grd_time": 3},
           "other_texts": [f"Eigen richting {i}." for i in range(5)]}
    t = _plain(_direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                    scan_type="retention", factor_key="growth",
                                    n_total=39, factor_score=4.9))
    assert "5 van de 12 kozen ‘Anders’ en schreven een eigen toelichting" in t
    assert "Eigen richting 0." in t
    # De keten sluit het blok af, de toelichtingen staan ervoor.
    assert t.index("kozen ‘Anders’") < t.index("Van de 39 respondenten")


def test_richtingkaart_zwijgt_over_anders_bij_te_weinig_antwoorden():
    """In de staat too_few toont de kaart geen enkele telling; dan hoort er ook
    geen aantal "Anders" bij te komen."""
    agg = {"lowest_n": 3, "offered": 2, "answered": 2, "skipped": 0,
           "counts": {"grd_other": 2},
           "other_texts": ["Eigen richting a.", "Eigen richting b."]}
    t = _plain(_direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                    scan_type="retention", factor_key="growth",
                                    n_total=39, factor_score=4.9))
    assert "Anders" not in t
    assert "Eigen richting" not in t


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
