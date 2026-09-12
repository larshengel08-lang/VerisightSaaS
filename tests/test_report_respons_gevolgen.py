"""Responspercentage heeft gevolgen voor de stelligheid (spec ronde 2 par. 6).

Bevinding B19: scenario 16 (30% respons) en scenario 17 (90%) leverden
structureel identieke rapporten op. Het responspercentage stond in de
responsbasis en verder nergens. Bij een uitstroommeting waar 105 van de 150
mensen niets invulden is dat de eerste vraag die een MT-lid stelt.

De rendertests gebruiken de gedeelde fixture met de echte factorlabels (_fl),
zodat een copy-probleem met een echt label hier niet achter een korte,
verzonnen naam wegvalt.
"""
import re

import pytest
from sqlalchemy.orm import Session

from backend.models import Campaign, CampaignDeliveryRecord, Organization, Respondent, SurveyResponse
from backend.report_html import (
    RESPONSE_CAUTION_RATE,
    RESPONSE_INDICATIVE_RATE,
    _cover_respons_stat,
    _fl,
    _p02_met_respons,
    _p02_opening,
    _p02_respons_prefix,
    _respons_caution,
    _respons_indicatief,
    _respons_kernzin_staart,
    _respons_noemer,
    _responsbasis,
    build_report_data,
    profile_shape,
    render_exit_report_html,
)
from backend.scoring_config import ORG_FACTOR_KEYS

from tests.conftest import exit_report_data

_FACTOR_AVGS = {
    "leadership":   6.80,
    "growth":       4.50,
    "workload":     5.90,
    "role_clarity": 6.20,
    "culture":      6.40,
    "compensation": 7.10,
}

_ITEM_MAP = {
    "leadership":    [("LD1", "Mijn leidinggevende geeft duidelijke feedback")],
    "growth":        [("GR1", "Ik zie voldoende ontwikkelmogelijkheden")],
    "workload":      [("WL1", "Mijn werkdruk is behapbaar")],
    "culture":       [("CU1", "Ik voel me veilig om kritiek te uiten")],
    "compensation":  [("CO1", "Mijn beloning past bij mijn werk")],
    "role_clarity":  [("RC1", "Mijn rol en verwachtingen zijn helder")],
}

_NIET_VASTGELEGD = ("Loep kan niet vaststellen hoeveel mensen zijn uitgenodigd: er is "
                    "geen aantal genodigden vastgelegd. Het responspercentage staat "
                    "daarom niet in dit rapport.")


def _tekst(html: str) -> str:
    """Wat de lezer op de pagina ziet: zonder <style> en zonder markup.

    Een documentbrede assertie op de ruwe HTML toetst niets: CSS-commentaar
    bevat zelf percentages en em-dashes ("100% daar tegenaf", "te zwak voor de
    hoofdtitel"), en elke SVG-balk draagt width="100%".
    """
    zonder_css = re.sub(r"<style.*?</style>", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", zonder_css))


def _fixture(*, completed: int, invited: int | None, note: str = ""):
    data = exit_report_data(factor_avgs=_FACTOR_AVGS, factor_items_map=_ITEM_MAP,
                            n=completed)
    data["n_invited"] = invited
    data["n_invited_note"] = note or ("" if invited else _NIET_VASTGELEGD)
    data["completion_pct"] = (round(100.0 * completed / invited, 1)
                              if invited else None)
    return data


# ── Drempels en de twee copy-bouwstenen ──────────────────────────────────────

def test_drempels_zijn_benoemde_constanten():
    assert RESPONSE_CAUTION_RATE == 0.5
    assert RESPONSE_INDICATIVE_RATE == 0.3


def test_geen_waarschuwing_bij_voldoende_respons():
    assert _respons_caution(45, 50, "") == ""
    assert _respons_kernzin_staart(45, 50) == ("", False)


def test_waarschuwing_onder_de_helft():
    assert _respons_caution(45, 150, "") == (
        "Minder dan de helft heeft ingevuld (45 van de 150). Lees de uitkomsten "
        "als het beeld van wie meedeed, niet van de hele organisatie.")


def test_indicatieve_drempel_legt_zichzelf_uit():
    # Projectregel: elke drempel wordt in één zin uitgelegd op de plek waar hij
    # werkt. "Minder dan de helft" legt de halve drempel zelf uit; de 30%-grens
    # deed dat nergens.
    zin = _respons_caution(45, 180, "")
    assert zin == (
        "Minder dan de helft heeft ingevuld (45 van de 180). Lees de uitkomsten "
        "als het beeld van wie meedeed, niet van de hele organisatie. "
        "Onder de 30% noemt Loep het beeld indicatief: de eerste zin van dit "
        "rapport wijst dan een mogelijk startpunt aan, geen vastgesteld startpunt.")
    # Precies 30% haalt die uitleg niet, want die stand is niet indicatief.
    assert "indicatief" not in _respons_caution(45, 150, "")


def test_staart_onder_de_helft_maar_niet_indicatief():
    # Scenario 16: 45 van de 150 is precies 30%, en dat is NIET onder de
    # indicatieve drempel van 0,3. Alleen de caution-staart dus.
    assert 45 / 150 == RESPONSE_INDICATIVE_RATE
    staart, indicatief = _respons_kernzin_staart(45, 150)
    assert staart == " (op basis van 45 van de 150 genodigden)"
    assert indicatief is False
    assert _respons_indicatief(45, 150) is False


def test_indicatief_onder_de_dertig_procent():
    # Scenario 16b: 45 van de 180 is 25%.
    staart, indicatief = _respons_kernzin_staart(45, 180)
    assert staart == " (op basis van 45 van de 180 genodigden)"
    assert indicatief is True
    assert _respons_indicatief(45, 180) is True


def test_exacte_grens_van_de_helft_geeft_geen_waarschuwing():
    # Strikt kleiner dan: precies 50% is geen "minder dan de helft".
    assert _respons_caution(50, 100, "") == ""
    assert _respons_kernzin_staart(50, 100) == ("", False)
    # Eén afgeronde vragenlijst minder valt er wél onder.
    assert _respons_caution(49, 100, "").startswith("Minder dan de helft")


def test_zonder_noemer_geen_staart():
    assert _respons_kernzin_staart(45, None) == ("", False)


def test_geen_em_dashes_in_de_responscopy():
    teksten = [_respons_caution(45, 150, ""), _respons_caution(45, 180, ""),
               _respons_caution(45, None, _NIET_VASTGELEGD),
               _respons_noemer(40, rows=45, completed=45)[1],
               _respons_noemer(None, rows=45, completed=45)[1],
               _respons_kernzin_staart(45, 150)[0],
               _p02_respons_prefix("Als startpunt kiest Loep X.", indicatief=True)]
    for t in teksten:
        assert "—" not in t and "--" not in t, t
        assert "ik " not in t.lower(), t


# ── De noemer: welke reden, en in welke volgorde ─────────────────────────────

def test_noemer_komt_uit_het_delivery_record():
    assert _respons_noemer(150, rows=45, completed=45) == (150, "")


def test_record_wint_van_de_respondentrijen():
    # Managed campagne met een handmatig ingevuld aantal: allebei de regels
    # zijn waar, en dan moet regel 1 winnen. Zonder deze assert blijft de
    # suite groen als de twee regels worden omgedraaid.
    assert _respons_noemer(150, rows=60, completed=45) == (150, "")


def test_noemer_valt_terug_op_respondentrijen_alleen_als_die_meer_zijn():
    # Managed flow: er bestaan rijen voor wie niet invulde.
    assert _respons_noemer(None, rows=48, completed=45) == (48, "")
    # Self-send: elke rij is een ingevulde vragenlijst, dus geen 100%-claim.
    assert _respons_noemer(None, rows=45, completed=45) == (None, _NIET_VASTGELEGD)
    assert _respons_noemer(0, rows=45, completed=45) == (None, _NIET_VASTGELEGD)


def test_te_laag_vastgelegd_aantal_noemt_beide_getallen():
    # "Niet vastgelegd" zou precies de persoon die de invoerfout kan herstellen
    # op het verkeerde been zetten: er IS iets ingevuld, het klopt alleen niet.
    noemer, note = _respons_noemer(40, rows=45, completed=45)
    assert noemer is None
    assert note == ("Het vastgelegde aantal genodigden (40) is lager dan het aantal "
                    "ingevulde vragenlijsten (45). Loep rekent daar geen "
                    "responspercentage uit; controleer het vastgelegde aantal.")
    # Zijn er wél echte non-responderrijen, dan is er gewoon een noemer.
    assert _respons_noemer(40, rows=48, completed=45) == (48, "")
    # Precies gelijk mag wel: dat is 100% en kan waar zijn.
    assert _respons_noemer(45, rows=45, completed=45) == (45, "")


def test_ontbrekende_reden_zonder_noemer_faalt_hard():
    # Een lege note zou een tabel opleveren waar twee cellen uit verdwenen zijn
    # en niets dat zegt waarom.
    with pytest.raises(ValueError):
        _respons_caution(45, None, "")


# ── De kernzin ───────────────────────────────────────────────────────────────

def _open(avgs, *, scan="retention", primary=None, indicatief=False, **kw):
    shape = profile_shape(avgs)
    return _p02_opening(scan_type=scan, shape=shape,
                        labels={fk: _fl(fk, scan) for fk in ORG_FACTOR_KEYS},
                        primary_key=primary or shape["low_key"],
                        indicatief=indicatief, **kw)


# Eén kwetsbaar onderwerp; laagste factor is ook het startpunt.
_EEN_LAAG = {"leadership": 6.8, "culture": 7.2, "growth": 4.5,
             "compensation": 6.6, "workload": 7.0, "role_clarity": 7.5}
# Niets kwetsbaar, niet vlak: de tak die "het eerste gesprekspunt" zegt.
_GEEN_KWETSBAAR = {"leadership": 5.2, "culture": 7.4, "growth": 5.1,
                   "compensation": 6.6, "workload": 6.0, "role_clarity": 7.0}
# Vlak profiel: de tak zonder startpuntclaim.
_VLAK = {"leadership": 6.17, "culture": 6.33, "growth": 5.67,
         "compensation": 5.70, "workload": 6.05, "role_clarity": 6.20}


def test_kale_keuze_wordt_een_mogelijk_startpunt():
    assert _open(_EEN_LAAG, primary="growth").endswith(
        f"Als startpunt kiest Loep {_fl('growth', 'retention')}.")
    assert _open(_EEN_LAAG, primary="growth", indicatief=True).endswith(
        f"Als mogelijk startpunt kiest Loep {_fl('growth', 'retention')}.")


def test_gelijkstandzin_wordt_een_mogelijk_startpunt():
    zin = _open(_EEN_LAAG, primary="growth", indicatief=True, next_delta=0.0)
    assert f"Als mogelijk startpunt kiest Loep {_fl('growth', 'retention')}. " \
           f"Dat onderwerp deelt de laagste score met het volgende" in zin


def test_kleinverschilzin_wordt_een_mogelijk_startpunt():
    zin = _open(_EEN_LAAG, primary="growth", indicatief=True, next_delta=0.05)
    assert f"Als mogelijk startpunt kiest Loep {_fl('growth', 'retention')}, " \
           f"de laagste score." in zin


def test_richtinggrond_wordt_een_mogelijk_startpunt():
    zin = _open(_EEN_LAAG, primary="growth", indicatief=True,
                tie_break_kind="direction", change=(5, 9),
                change_other=(_fl("workload", "retention"), 2, 8))
    assert f"Als mogelijk startpunt kiest Loep {_fl('growth', 'retention')}: daar " \
           f"vragen meer mensen om verandering" in zin


def test_tak_zonder_kwetsbare_onderwerpen_wordt_voorzichtig():
    # Deze tak zegt "het eerste gesprekspunt" en bevat de reeks "Als startpunt
    # kiest Loep" niet; achteraf vervangen liet hem even stellig.
    stellig = _open(_GEEN_KWETSBAAR, primary="growth")
    assert stellig.endswith(f"{_fl('growth', 'retention')} scoort het laagst en is "
                            f"het eerste gesprekspunt.")
    zacht = _open(_GEEN_KWETSBAAR, primary="growth", indicatief=True)
    assert zacht.endswith(f"{_fl('growth', 'retention')} scoort het laagst en is "
                          f"een mogelijk eerste gesprekspunt.")


def test_tak_zonder_kwetsbare_onderwerpen_met_afwijkend_startpunt():
    zacht = _open(_GEEN_KWETSBAAR, scan="exit", primary="leadership", indicatief=True)
    assert zacht.endswith(f"als mogelijk eerste gesprekspunt kiest Loep "
                          f"{_fl('leadership', 'exit')}.")


def test_niets_nodig_tak_begrenst_zich_tot_wat_is_ingevuld():
    # "Je mensen vragen nergens" is bij een kwart van de groep een uitspraak
    # over mensen die niets hebben ingevuld.
    stellig = _open(_EEN_LAAG, primary="growth", direction_state_key="none_needed")
    assert "Je mensen vragen nergens dringend om verandering." in stellig
    zacht = _open(_EEN_LAAG, primary="growth", direction_state_key="none_needed",
                  indicatief=True)
    assert "In wat is ingevuld vraagt niemand dringend om verandering." in zacht
    assert "Je mensen vragen nergens" not in zacht


def test_vlakke_tak_verzacht_alleen_zijn_startpuntzin():
    # De vlak-zin zelf is een waarneming over de spreiding, met de uiterste
    # waarden erbij; die blijft staan. De startpuntzin erachter verzacht wel.
    zacht = _open(_VLAK, indicatief=True)
    assert zacht.startswith("Geen enkel onderwerp springt eruit")
    assert "Dat is zelf de bevinding." in zacht
    assert zacht.endswith(f"Als mogelijk startpunt kiest Loep "
                          f"{_fl('growth', 'retention')}.")


def test_prefix_zet_alleen_het_label():
    zin = "Als mogelijk startpunt kiest Loep Groeiperspectief."
    assert _p02_respons_prefix(zin, indicatief=True) == f"Indicatief beeld: {zin}"
    assert _p02_respons_prefix(zin, indicatief=False) == zin


def test_kernzin_onaangetast_bij_voldoende_respons():
    zin = "Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.5/10)."
    assert _p02_met_respons(zin, completed=45, invited=50) == zin
    assert _p02_met_respons(zin, completed=45, invited=None) == zin


def test_staart_staat_binnen_de_laatste_zin_en_niet_erachter():
    # Achter de punt zou een losse haakjeszin overblijven; hij hoort binnen de
    # zin die hij relativeert.
    uit = _p02_met_respons("Als startpunt kiest Loep Groeiperspectief.",
                           completed=45, invited=150)
    assert uit == ("Als startpunt kiest Loep Groeiperspectief (op basis van 45 "
                   "van de 150 genodigden).")


def test_indicatief_beeld_en_staart_samen():
    uit = _p02_met_respons("Als mogelijk startpunt kiest Loep Groeiperspectief.",
                           completed=45, invited=180)
    assert uit == ("Indicatief beeld: Als mogelijk startpunt kiest Loep "
                   "Groeiperspectief (op basis van 45 van de 180 genodigden).")


def test_verwijzing_krijgt_een_eigen_mededeling_in_plaats_van_een_haakje():
    # Een haakje relativeert een claim; deze terugval doet geen uitspraak maar
    # wijst alleen de weg.
    zin = "Zie de behoudscontext en de responsbasis voor wat dit rapport wel toont."
    assert _p02_met_respons(zin, completed=45, invited=150, verwijzing=True) == (
        f"Dit rapport rust op 45 van de 150 genodigden. {zin}")
    assert _p02_met_respons(zin, completed=45, invited=50, verwijzing=True) == zin
    assert _p02_met_respons(zin, completed=45, invited=None, verwijzing=True) == zin
    assert "Indicatief beeld" not in _p02_met_respons(zin, completed=45, invited=180,
                                                      verwijzing=True)


# ── De responsbasis ──────────────────────────────────────────────────────────

def _basis(**kw):
    base = dict(period="apr-mei 2026", population="Actieve medewerkers",
                segment_available=True, enps_available=True)
    base.update(kw)
    return _responsbasis(**base)


def test_responsbasis_leidt_het_percentage_zelf_af():
    # Eén bron voor dat getal: met een meegegeven percentage kon de tabel iets
    # anders tonen dan de waarschuwingszin eronder berekende.
    tekst = _tekst(_basis(invited=150, completed=45))
    assert "Uitgenodigd 150 Afgerond 45 Respons 30%" in tekst
    assert ("Minder dan de helft heeft ingevuld (45 van de 150). Lees de "
            "uitkomsten als het beeld van wie meedeed, niet van de hele "
            "organisatie.") in tekst


def test_responsbasis_zwijgt_bij_voldoende_respons():
    tekst = _tekst(_basis(invited=50, completed=45))
    assert "Respons 90%" in tekst
    assert "Minder dan de helft" not in tekst
    assert "vastgelegd" not in tekst


def test_responsbasis_zonder_noemer_toont_geen_percentage():
    tekst = _tekst(_basis(invited=None, completed=45, note=_NIET_VASTGELEGD))
    assert "Uitgenodigd" not in tekst
    assert re.search(r"\d+%", tekst) is None
    assert "Afgerond 45" in tekst
    assert _NIET_VASTGELEGD in tekst


def test_responsbasis_toont_de_reden_van_een_te_laag_vastgelegd_aantal():
    _, note = _respons_noemer(40, rows=45, completed=45)
    tekst = _tekst(_basis(invited=None, completed=45, note=note))
    assert "Het vastgelegde aantal genodigden (40) is lager" in tekst
    assert "niet vastgelegd" not in tekst


def test_cover_toont_geen_nul_procent_zonder_noemer():
    assert _cover_respons_stat(30.0) == ("Respons", "30%")
    assert _cover_respons_stat(None) == ("Respons", "Onbekend")


# ── build_report_data: de noemer komt echt uit het delivery record ───────────

def _campagne(db_session: Session, *, completed: int, rows: int,
              invited_count: int | None) -> str:
    org = Organization(name="TestOrg", slug="testorg", contact_email="hr@test.nl")
    db_session.add(org)
    db_session.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type="exit",
                    delivery_mode="baseline")
    db_session.add(camp)
    db_session.flush()
    if invited_count is not None:
        db_session.add(CampaignDeliveryRecord(organization_id=org.id,
                                              campaign_id=camp.id,
                                              invited_count=invited_count))
    for i in range(rows):
        klaar = i < completed
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker",
                       completed=klaar)
        db_session.add(r)
        if klaar:
            db_session.add(SurveyResponse(
                respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                risk_score=5.5, risk_band="MIDDEN"))
    db_session.commit()
    return camp.id


def test_build_report_data_gebruikt_het_vastgelegde_aantal(db_session: Session):
    cid = _campagne(db_session, completed=45, rows=45, invited_count=150)
    data = build_report_data(cid, db_session)
    assert data["n_completed"] == 45
    assert data["n_invited"] == 150       # niet 45: de self-send-rijen zijn geen noemer
    assert data["completion_pct"] == 30.0
    assert data["n_invited_note"] == ""


def test_build_report_data_zonder_delivery_record(db_session: Session):
    # Self-send zonder ingevuld aantal: geen rij voor wie niet invulde, dus geen
    # noemer. De oude regel (len(respondents)) gaf hier 100%.
    cid = _campagne(db_session, completed=45, rows=45, invited_count=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] is None
    assert data["completion_pct"] is None
    assert data["n_invited_note"] == _NIET_VASTGELEGD


def test_build_report_data_valt_terug_op_de_respondentrijen(db_session: Session):
    cid = _campagne(db_session, completed=45, rows=60, invited_count=None)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] == 60
    assert data["completion_pct"] == 75.0


def test_build_report_data_negeert_een_te_laag_vastgelegd_aantal(db_session: Session):
    cid = _campagne(db_session, completed=45, rows=45, invited_count=40)
    data = build_report_data(cid, db_session)
    assert data["n_invited"] is None
    assert "Het vastgelegde aantal genodigden (40) is lager" in data["n_invited_note"]


# ── Rendertests: scenario 16, 16b, 17 en de onbekende noemer ─────────────────

def test_scenario_17_negentig_procent_blijft_ongewijzigd():
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=50)))
    assert "op basis van" not in tekst
    assert "Indicatief beeld" not in tekst
    assert "Minder dan de helft" not in tekst
    assert "Respons 90%" in tekst


def test_scenario_16_dertig_procent_remt_de_kernzin():
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=150)))
    assert "(op basis van 45 van de 150 genodigden)." in tekst
    assert "Minder dan de helft heeft ingevuld (45 van de 150)." in tekst
    # 30% is niet onder de indicatieve drempel.
    assert "Indicatief beeld" not in tekst
    assert "mogelijk startpunt" not in tekst


def test_scenario_16b_vijfentwintig_procent_is_indicatief():
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=180)))
    assert "Indicatief beeld: Het vertrekbeeld wijst naar" in tekst
    assert ("Als mogelijk startpunt kiest Loep Groeiperspectief (op basis van 45 "
            "van de 180 genodigden).") in tekst
    assert "Onder de 30% noemt Loep het beeld indicatief" in tekst


def test_render_zonder_noemer_noemt_nergens_een_responspercentage():
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=None)))
    assert re.search(r"\d+%", tekst) is None, "geen percentage zonder noemer"
    assert "Uitgenodigd" not in tekst
    assert _NIET_VASTGELEGD in tekst
    assert "Respons Onbekend" in tekst


def test_staart_hangt_aan_de_claim_en_niet_aan_de_vertrekredentelling():
    # Bij Loep Vertrek plakt de renderer nog een zin over de meest genoemde
    # vertrekreden achter de kernzin. De noemer hoort bij de claim die hij
    # relativeert (het startpunt), niet bij die redentelling.
    data = _fixture(completed=45, invited=150)
    data["exit_r_dist"] = [{"code": "PL1", "label": "Beter aanbod elders", "count": 9}]
    tekst = _tekst(render_exit_report_html(data))
    assert ("Als startpunt kiest Loep Groeiperspectief (op basis van 45 van de 150 "
            "genodigden). Beter aanbod elders is de meest genoemde vertrekreden.") in tekst


def test_ook_een_rapport_zonder_factorprofiel_draagt_zijn_responsbasis():
    # Zonder factorprofiel valt de kernzin terug op de frictiescore (bug B2).
    # Juist daar is de basis dun, dus de respons hoort er ook in te staan.
    data = _fixture(completed=45, invited=180)
    data["factor_avgs"] = {}
    data["factor_items_map"] = {}
    tekst = _tekst(render_exit_report_html(data))
    assert ("Indicatief beeld: De frictiescore van 5.5/10 wijst op een "
            "gemengd vertrekbeeld (op basis van 45 van de 180 genodigden).") in tekst


def test_verwijzende_terugval_krijgt_geen_haakje():
    data = _fixture(completed=45, invited=150)
    data["factor_avgs"] = {}
    data["factor_items_map"] = {}
    data["avg_risk"] = None
    tekst = _tekst(render_exit_report_html(data))
    assert ("Dit rapport rust op 45 van de 150 genodigden. Zie de vertrekcontext "
            "en de responsbasis voor wat dit rapport wel toont.") in tekst
    assert "toont (op basis van" not in tekst


@pytest.mark.parametrize("invited", [50, 150, 180, None])
def test_gerenderde_responscopy_blijft_zonder_em_dash(invited):
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=invited)))
    assert "—" not in tekst
