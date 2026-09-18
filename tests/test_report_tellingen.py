"""B13 Anders-toelichtingen en B14 tellingen met noemer (spec par. 9)."""
import re

import pytest
from sqlalchemy.orm import Session

from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.shared.deepening import aggregate_deepening, aggregate_direction
from backend.report_html import (
    MAX_QUOTES,
    MIN_QUOTES_N,
    OTHER_MIN_N,
    _anders_block,
    _deepening_block,
    _deepening_chain,
    _direction_card_cell,
    _direction_chain,
    _direction_totals_line,
    _telling,
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
    assert ("6 van de 12 kozen ‘Anders’; 4 van hen schreven een toelichting: "
            "de vaste opties dekten hun ervaring niet.") in t
    assert "‘Anders’ ;" not in t
    assert "en schreven een eigen toelichting" not in t


def test_anders_block_enkelvoud_bij_een_toelichting():
    t = _plain(_anders_block(other_n=4, answered=10, texts=["Alleen ik schreef iets."]))
    assert "4 van de 10 kozen ‘Anders’; 1 van hen schreef een toelichting:" in t


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
                            "retention", "growth", 39)
    t = _plain(html)
    assert "6 van de 16 kozen ‘Anders’ en schreven een eigen toelichting" in t
    assert "Iets eigens 0." in t


def test_verdiepingsblok_zet_de_beperkte_basis_regel_voor_de_lijst():
    """De beperkte-basis-regel hoort bij de verdeling erboven, niet bij de
    toelichtingen eronder."""
    html = _deepening_block(_deep_agg(gr_other=5, gr_visibility=2), "retention", "growth", 39)
    t = _plain(html)
    assert t.index("Beperkte basis") < t.index("kozen ‘Anders’")


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
    assert t.index("kozen ‘Anders’") < t.index("14 van de 39 respondenten")


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


# ── B14: één tellingsvorm, en een keten die sluit (H2, H19) ──────────────────

AGG_D = {"triggered": 17, "offered": 17, "answered": 16, "skipped": 1,
         "primary_counts": {}, "secondary_counts": {}, "other_texts": []}


def test_telling_vaste_vorm():
    assert _telling(8, 16) == "8 van de 16 (50%)"
    assert _telling(3, 8) == "3 van de 8"           # onder 10 geen percentage
    assert _telling(27, 62) == "27 van de 62 (44%)"


def test_telling_zonder_noemer_is_een_fout():
    """Een telling zonder noemer is precies wat B14 verbiedt; "3 van de 0"
    afdrukken is erger dan omvallen."""
    with pytest.raises(ValueError, match="noemer"):
        _telling(3, 0)


def test_deepening_chain_zonder_jargon_met_noemers():
    zin = _deepening_chain(AGG_D, "retention", "growth", n_total=39)
    assert zin == ("17 van de 39 respondenten kregen de verdiepende vraag over groeiperspectief "
                   "(17 = wie hier laag scoorde); 16 van de 17 beantwoordden die, 1 sloeg over.")
    assert "verdieptrigger" not in zin
    onder_cap = dict(AGG_D, triggered=20, offered=17)
    zin = _deepening_chain(onder_cap, "retention", "growth", n_total=39)
    assert zin.startswith("20 van de 39 respondenten scoorden hier laag; 17 van de 20 kregen de verdiepende "
                          "vraag (de andere 3 zaten al aan het maximum van drie verdiepingen)")


def test_deepening_chain_zonder_aanbod_verzint_geen_noemer():
    """Cap-verdrongen bij élke respondent (offered=0): "0 van de 0 beantwoordden
    die" is geen Nederlands en geen telling. De keten eindigt dan bij het aanbod
    en zegt waarom niemand de vraag kreeg."""
    agg = dict(AGG_D, triggered=5, offered=0, answered=0, skipped=0)
    assert _deepening_chain(agg, "retention", "workload", n_total=39) == (
        "5 van de 39 respondenten scoorden hier laag; niemand kreeg de verdiepende vraag "
        "(zij zaten allemaal al aan het maximum van drie verdiepingen).")


def test_deepening_chain_meer_aangeboden_dan_getriggerd_liegt_niet():
    """Historische data (gewijzigde triggerregels) kan offered > triggered
    opleveren. De keten mag dan niet zeggen dat triggered de vraag kreeg: dat
    getal is kleiner dan het aantal dat hem echt kreeg."""
    zin = _deepening_chain(dict(AGG_D, triggered=9, offered=17), "retention", "growth",
                           n_total=39)
    assert zin == ("17 van de 39 respondenten kregen de verdiepende vraag over groeiperspectief "
                   "(17 = wie de vraag kreeg; met de drempel van nu scoren 9 respondenten hier laag); "
                   "16 van de 17 beantwoordden die, 1 sloeg over.")


def test_deepening_chain_meldt_een_niet_sluitende_status():
    """answered + skipped moet het aanbod dekken. Klopt dat niet, dan staat er
    wat er ontbreekt in plaats van een keten waarin mensen verdwijnen."""
    zin = _deepening_chain(dict(AGG_D, answered=12, skipped=1), "retention", "growth",
                           n_total=39)
    assert zin.endswith("12 van de 17 beantwoordden die, 1 sloeg over; van 4 antwoorden is "
                        "niet vastgelegd of de vraag is beantwoord.")


def test_direction_chain_sluit_en_noemt_de_noemer():
    agg = {"lowest_n": 16, "offered": 16, "answered": 15, "skipped": 1, "counts": {"grd_conversation": 11}}
    assert _direction_chain(agg, 39) == ("16 van de 39 respondenten hadden dit als eigen laagste onderwerp; "
                                         "15 van de 16 beantwoordden de vraag, 1 sloeg over.")


def test_direction_chain_zonder_aanbod_zegt_dat_niemand_de_vraag_kreeg():
    """lowest_n zonder aanbod (rijen van vóór de richtingvraag): de keten moet
    zeggen waar die mensen bleven, niet stil bij de opener eindigen."""
    agg = {"lowest_n": 4, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
    assert _direction_chain(agg, 13) == (
        "4 van de 13 respondenten hadden dit als eigen laagste onderwerp; "
        "niemand van hen kreeg de vraag.")


def test_direction_chain_meldt_een_niet_sluitende_status():
    agg = {"lowest_n": 10, "offered": 10, "answered": 6, "skipped": 1, "counts": {}}
    assert _direction_chain(agg, 39).endswith(
        "6 van de 10 beantwoordden de vraag, 1 sloeg over; van 3 antwoorden is niet "
        "vastgelegd of de vraag is beantwoord.")


def _dagg(**lows):
    """Per factor (lowest_n, offered, answered, skipped); de rest op nul."""
    uit = {fk: {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
           for fk in ("growth", "workload", "leadership", "culture", "compensation",
                      "role_clarity")}
    for fk, (low, off, ans, skip) in lows.items():
        uit[fk] = {"lowest_n": low, "offered": off, "answered": ans, "skipped": skip,
                   "counts": {}}
    return uit


def test_direction_totals_line_sluit_op_het_totaal_en_verantwoordt_de_rest():
    dagg = _dagg(growth=(16, 16, 15, 1), workload=(11, 11, 10, 1),
                 leadership=(8, 8, 2, 6), culture=(4, 4, 0, 4))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert zin == ("Van de 39 respondenten kregen 39 de vraag, 27 beantwoordden hem, 12 sloegen over. "
                   "16 hadden groeiperspectief als laagste onderwerp, 11 werkdruk en herstelruimte; "
                   "de overige 12 een ander onderwerp (leiderschap en vertrouwen 8, cultuur en psychologische "
                   "veiligheid 4). Die antwoorden gaan over onderwerpen die niet op de agenda staan en zijn "
                   "daarom niet uitgewerkt.")


def test_direction_totals_line_laat_geen_nul_clausules_staan():
    """"0 sloegen over" is fout Nederlands; enkelvoud moet enkelvoud zijn."""
    dagg = _dagg(growth=(12, 12, 12, 0), workload=(1, 1, 1, 0))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 13)
    assert zin.startswith("Van de 13 respondenten kregen 13 de vraag, 13 beantwoordden hem. ")
    assert "sloegen over" not in zin
    assert "12 hadden groeiperspectief als laagste onderwerp, 1 werkdruk en herstelruimte." in zin
    een = _direction_totals_line(_dagg(growth=(1, 1, 0, 1)), ["growth"], "retention", 1)
    assert een == ("Van de 1 respondent kreeg 1 de vraag, 1 sloeg over. "
                   "1 had groeiperspectief als laagste onderwerp.")


def test_direction_totals_line_verzint_geen_restgroep():
    """Wie geen enkele stelling over deze onderwerpen invulde heeft geen laagste
    onderwerp. Dan telt de keten niet op tot het aantal respondenten, en staat
    er wat er ontbreekt in plaats van "de overige"."""
    dagg = _dagg(growth=(16, 16, 15, 1), workload=(11, 11, 10, 1), leadership=(8, 8, 8, 0))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert "8 een ander onderwerp (leiderschap en vertrouwen 8)" in zin
    assert "de overige" not in zin
    assert ("Bij 4 respondenten kon Loep geen laagste onderwerp vaststellen: zij vulden "
            "geen van de stellingen over deze onderwerpen in.") in zin


def test_direction_totals_line_zonder_rest_en_zonder_aanbod():
    dagg = _dagg(growth=(9, 9, 9, 0), workload=(4, 4, 3, 1))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 13)
    assert zin.endswith("9 hadden groeiperspectief als laagste onderwerp, 4 werkdruk en "
                        "herstelruimte.")
    assert "ander onderwerp" not in zin
    assert _direction_totals_line(_dagg(), ["growth"], "retention", 13) == ""


def test_direction_totals_line_zonder_em_dash():
    dagg = _dagg(growth=(16, 16, 15, 1), leadership=(8, 8, 2, 6))
    zin = _direction_totals_line(dagg, ["growth"], "retention", 39)
    assert "—" not in zin and "&#x2014;" not in zin


def test_richtingblok_draagt_de_sluitende_keten():
    """De totaalregel staat in het blok zelf, tussen de intro en de kaarten."""
    from backend.report_html import _wat_moet_gebeuren_block
    from tests.test_report_priority_render import RANKED

    dagg = _dagg(growth=(9, 9, 8, 1), workload=(8, 8, 8, 0), leadership=(9, 9, 8, 1))
    dagg["growth"]["counts"] = {"grd_visibility": 6, "grd_none": 1, "grd_time": 1}
    dagg["workload"]["counts"] = {"wld_peaks": 3, "wld_scope": 3, "wld_none": 2}
    dagg["leadership"]["counts"] = {"ldd_feedback": 8}
    html = _wat_moet_gebeuren_block(RANKED, dagg, "retention", 26)
    # Opmaak in het stylesheet, niet inline (codereview taak 9): deze regel is
    # een eerlijkheidsregel en moet leesbaar zijn, dus niet in de 8.5px mono van
    # de ketens in de kaarten.
    assert '<p class="dir-chain dir-totals">' in html
    assert "style=" not in html.split("<table")[0]
    t = _tekst(html)
    assert ("Van de 26 respondenten kregen 26 de vraag, 24 beantwoordden hem, 2 sloegen over. "
            "9 hadden groeiperspectief als laagste onderwerp, 8 werkdruk en herstelruimte; "
            "de overige 9 een ander onderwerp (leiderschap en vertrouwen 9).") in t
    assert t.index("geen advies van Loep") < t.index("Van de 26 respondenten") < t.index("Startpunt:")


# ── Codereview taak 10: het noemerlabel en de sluiting van de totaalregel ────

def _dir_agg(answered, counts, *, skipped=0, lowest=None, offered=None):
    """Richtingaggregaat dat sluit tenzij anders gevraagd; met skipped > 0 is
    lowest_n groter dan answered, precies de staat waarin het noemerlabel telt."""
    return {"lowest_n": answered + skipped if lowest is None else lowest,
            "offered": answered + skipped if offered is None else offered,
            "answered": answered, "skipped": skipped, "counts": counts,
            "other_texts": []}


# Eén aggregaat per staat van direction_state, elk met overslagers erin, zodat
# lowest_n (13) en answered (10) verschillen.
STATEN = {
    "clear": (_dir_agg(10, {"grd_visibility": 8, "grd_none": 1, "grd_time": 1}, skipped=3), 5.1),
    "none_needed": (_dir_agg(10, {"grd_none": 6, "grd_visibility": 3, "grd_time": 1}, skipped=3), 5.1),
    "plurality": (_dir_agg(10, {"grd_visibility": 4, "grd_none": 2, "grd_time": 2,
                                "grd_criteria": 2}, skipped=3), 5.2),
    "split_none": (_dir_agg(10, {"grd_none": 4, "grd_visibility": 4, "grd_time": 2}, skipped=3), 4.5),
    "divided": (_dir_agg(10, {"grd_visibility": 4, "grd_time": 4, "grd_criteria": 2}, skipped=3), 5.4),
}


def _zonder_juiste_claims(tekst):
    """Alles wat over "het laagst scoorde/scoorden" gaat en de noemer correct
    labelt, weggehaald. Blijft er iets staan, dan is dat een kale (onjuiste)
    claim: n is het aantal beantwoorders, niet iedereen bij wie dit het laagst
    scoorde."""
    for goed in ("het laagst scoorde en die de vraag beantwoordden",
                 "het laagst scoorden en de vraag beantwoordden"):
        tekst = tekst.replace(goed, "")
    return tekst


@pytest.mark.parametrize("staat", sorted(STATEN))
def test_richtingkaart_labelt_de_noemer_in_elke_staat(staat):
    agg, score = STATEN[staat]
    html = _direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                scan_type="retention", factor_key="growth",
                                n_total=39, factor_score=score)
    assert f'dir-card dir-{staat}"' in html, "fixture levert een andere staat"
    src = _plain(html.split('class="dir-src">')[1].split("</div>")[0])
    assert "de vraag beantwoordden" in src, src
    assert "het laagst scoor" not in _zonder_juiste_claims(src), src
    # De keten eronder houdt zijn eigen (andere, juiste) noemer.
    assert "13 van de 39 respondenten hadden dit als eigen laagste onderwerp" in _plain(html)


@pytest.mark.parametrize("staat", sorted(STATEN))
def test_p02_regel_labelt_de_noemer_net_als_de_kaart(staat):
    from backend.report_html import _direction_p02_line

    agg, score = STATEN[staat]
    regel = _direction_p02_line({"growth": agg}, "growth", "retention", score)
    assert "de vraag beantwoordden" in regel, regel
    assert "het laagst scoor" not in _zonder_juiste_claims(regel), regel


def test_p02_en_kaart_noemen_hetzelfde_getal_met_percentage():
    from backend.report_html import _direction_p02_line

    agg, score = STATEN["plurality"]
    regel = _direction_p02_line({"growth": agg}, "growth", "retention", score)
    kaart = _plain(_direction_card_cell("startpunt", label="Groeiperspectief", agg=agg,
                                        scan_type="retention", factor_key="growth",
                                        n_total=39, factor_score=score))
    assert "4 van de 10 (40%)" in regel and "4 van de 10 (40%)" in kaart


def test_totaalregel_meldt_wie_de_vraag_niet_kreeg():
    """lowest_n > offered (campagne die over de deploy heen liep): die mensen
    hebben geen antwoord, dus mogen ze niet onder "de overige ... een ander
    onderwerp" verdwijnen alsof hun antwoord bestaat maar niet is uitgewerkt."""
    dagg = _dagg(growth=(20, 20, 20, 0), workload=(8, 8, 8, 0), leadership=(11, 0, 0, 0))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert zin.startswith("Van de 39 respondenten kregen 28 de vraag, 28 beantwoordden hem. ")
    assert "de overige" not in zin
    assert "11 een ander onderwerp (leiderschap en vertrouwen 11)" in zin
    assert ("Bij 11 van de 39 is die vraag niet gesteld; van hen is er dus geen "
            "antwoord.") in zin
    # Niemand buiten de agenda heeft geantwoord, dus niets om "niet uitgewerkt" te noemen.
    assert "niet uitgewerkt" not in zin
    # En de zin sluit: 28 gekregen + 11 niet gesteld = 39.


def test_totaalregel_meldt_ook_een_gat_op_een_agendafactor():
    dagg = _dagg(growth=(20, 15, 14, 1), workload=(8, 8, 8, 0), leadership=(11, 11, 10, 1))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert zin.startswith("Van de 39 respondenten kregen 34 de vraag, 32 beantwoordden hem, "
                          "2 sloegen over. ")
    assert "de overige" not in zin
    assert "11 een ander onderwerp (leiderschap en vertrouwen 11)" in zin
    assert "Die antwoorden gaan over onderwerpen die niet op de agenda staan" in zin
    assert ("Bij 5 van de 39 is die vraag niet gesteld; van hen is er dus geen "
            "antwoord.") in zin


def test_totaalregel_houdt_de_overige_als_alles_sluit():
    dagg = _dagg(growth=(20, 20, 19, 1), workload=(8, 8, 8, 0), leadership=(11, 11, 11, 0))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert "de overige 11 een ander onderwerp" in zin
    assert "niet gesteld" not in zin


def test_totaalregel_faalt_op_een_onmogelijke_telling():
    """Meer laagste-onderwerpen dan respondenten kan met echte data niet
    bestaan; dan is de zin onzin en hoort de generatie te stoppen."""
    dagg = _dagg(growth=(20, 20, 20, 0), workload=(30, 30, 30, 0))
    with pytest.raises(ValueError, match="laagste-onderwerptelling"):
        _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)


def test_keten_degradeert_zichtbaar_als_er_meer_is_aangeboden_dan_laagst_scoorde():
    """"10 van de 10 beantwoordden de vraag" onder "9 hadden dit als laagste" is
    onzin, maar de staat zelf is met versiedrift bereikbaar: offered komt uit
    opgeslagen antwoorden en lowest_n wordt bij elke render opnieuw berekend
    (aggregate_direction tolereert en logt dat bewust). Een harde fout zou de
    download van een historisch rapport laten mislukken, dus zegt de keten wat
    er niet klopt (Fail Loud trap 2)."""
    agg = {"lowest_n": 9, "offered": 10, "answered": 10, "skipped": 0, "counts": {}}
    zin = _direction_chain(agg, 13)
    assert zin == ("10 van de 13 respondenten kregen de vraag over dit onderwerp "
                   "(10 = wie de vraag kreeg; met de rekenregels van nu is dit bij "
                   "9 respondenten het laagste onderwerp); 10 van de 10 beantwoordden "
                   "de vraag.")
    assert "—" not in zin


def test_keten_degradeert_ook_als_niemand_het_nu_nog_als_laagste_heeft():
    agg = {"lowest_n": 0, "offered": 3, "answered": 2, "skipped": 1, "counts": {}}
    zin = _direction_chain(agg, 13)
    assert "met de rekenregels van nu is dit bij geen enkele respondent" in zin
    assert "2 van de 3 beantwoordden de vraag, 1 sloeg over." in zin
    # Niet de kale "Niemand had dit als eigen laagste onderwerp."-regel: er zijn
    # wel antwoorden en die mogen niet stil verdwijnen.
    assert not zin.startswith("Niemand")


def test_totaalregel_degradeert_bij_meer_aanbod_dan_laagste_onderwerpen():
    """Zelfde versiedrift over alle onderwerpen samen: 28 kregen de vraag terwijl
    er nu maar 20 respondenten een laagste onderwerp hebben. Dan staat er wat er
    niet klopt, en de reden bij "kon geen laagste onderwerp vaststellen" claimt
    niet langer dat die mensen niets invulden."""
    dagg = _dagg(growth=(12, 20, 20, 0), workload=(8, 8, 8, 0))
    zin = _direction_totals_line(dagg, ["growth", "workload"], "retention", 39)
    assert zin.startswith("Van de 39 respondenten kregen 28 de vraag, 28 beantwoordden hem. ")
    assert "de overige" not in zin
    assert ("Bij 19 respondenten kon Loep met de rekenregels van nu geen laagste "
            "onderwerp vaststellen, en 8 van hen kregen de vraag toch: die twee "
            "tellingen sluiten daarom niet op elkaar.") in zin
    assert "zij vulden geen van de stellingen" not in zin


def test_verdiepingsketen_noemt_de_drempel_zonder_van_hen():
    """triggered is over alle respondenten geteld, niet over wie de vraag kreeg,
    dus "9 van hen" was onjuist."""
    zin = _deepening_chain(dict(AGG_D, triggered=9, offered=17), "retention", "growth",
                           n_total=39)
    assert "met de drempel van nu scoren 9 respondenten hier laag" in zin
    assert "van hen" not in zin


def test_css_laat_de_scorekolom_niet_afbreken():
    """"27 van de 62 (44%)" is te breed voor de kolom die auto-layout aan de
    scorekolom van een halve kaart geeft."""
    from backend.report_css import build_css

    css = build_css("retention")

    def _rule(selector):
        m = re.search(re.escape(selector) + r"\s*\{(.*?)\}", css, re.S)
        assert m, f"geen regel voor {selector}"
        return m.group(1)

    kolom = _rule(".dir-tbl .is")
    assert "white-space: nowrap" in kolom
    assert "width:" in kolom
    # Dezelfde kleur als de intro erboven: dit is gewone leestekst.
    assert "color: #374151" in _rule(".dir-chain.dir-totals")
    assert "color: #374151" in _rule(".dir-intro")
