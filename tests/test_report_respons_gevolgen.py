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

from backend.report_html import (
    RESPONSE_CAUTION_RATE,
    RESPONSE_INDICATIVE_RATE,
    _cover_respons_stat,
    _p02_met_respons,
    _p02_respons_prefix,
    _respons_caution,
    _respons_kernzin_staart,
    _respons_noemer,
    _responsbasis,
    render_exit_report_html,
)

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


def _tekst(html: str) -> str:
    """Wat de lezer op de pagina ziet: zonder <style> en zonder markup.

    Een documentbrede assertie op de ruwe HTML toetst niets: CSS-commentaar
    bevat zelf percentages en em-dashes ("100% daar tegenaf", "te zwak voor de
    hoofdtitel"), en elke SVG-balk draagt width="100%".
    """
    zonder_css = re.sub(r"<style.*?</style>", " ", html, flags=re.S)
    return re.sub(r"<[^>]+>", " ", zonder_css)


def _fixture(*, completed: int, invited: int | None):
    data = exit_report_data(factor_avgs=_FACTOR_AVGS, factor_items_map=_ITEM_MAP,
                            n=completed)
    data["n_invited"] = invited
    data["completion_pct"] = (round(100.0 * completed / invited, 1)
                              if invited else None)
    return data


# ── Drempels en de twee copy-bouwstenen ──────────────────────────────────────

def test_drempels_zijn_benoemde_constanten():
    assert RESPONSE_CAUTION_RATE == 0.5
    assert RESPONSE_INDICATIVE_RATE == 0.3


def test_geen_waarschuwing_bij_voldoende_respons():
    assert _respons_caution(45, 50) == ""
    assert _respons_kernzin_staart(45, 50) == ("", False)


def test_waarschuwing_onder_de_helft():
    zin = _respons_caution(45, 150)
    assert zin == ("Minder dan de helft heeft ingevuld (45 van de 150). Lees de "
                   "uitkomsten als het beeld van wie meedeed, niet van de hele "
                   "organisatie.")


def test_staart_onder_de_helft_maar_niet_indicatief():
    # Scenario 16: 45 van de 150 is precies 30%, en dat is NIET onder de
    # indicatieve drempel van 0,3. Alleen de caution-staart dus.
    assert 45 / 150 == RESPONSE_INDICATIVE_RATE
    staart, indicatief = _respons_kernzin_staart(45, 150)
    assert staart == " (op basis van 45 van de 150 genodigden)"
    assert indicatief is False


def test_indicatief_onder_de_dertig_procent():
    # Scenario 16b: 45 van de 180 is 25%.
    staart, indicatief = _respons_kernzin_staart(45, 180)
    assert staart == " (op basis van 45 van de 180 genodigden)"
    assert indicatief is True


def test_exacte_grens_van_de_helft_geeft_geen_waarschuwing():
    # Strikt kleiner dan: precies 50% is geen "minder dan de helft".
    assert _respons_caution(50, 100) == ""
    assert _respons_kernzin_staart(50, 100) == ("", False)
    # Eén afgeronde vragenlijst minder valt er wél onder.
    assert _respons_caution(49, 100).startswith("Minder dan de helft")


def test_noemer_onbekend_geeft_geen_percentage_maar_een_zin():
    zin = _respons_caution(45, None)
    assert zin == ("Het aantal genodigden is niet vastgelegd; het "
                   "responspercentage is daarom niet bekend.")
    assert "%" not in zin
    staart, indicatief = _respons_kernzin_staart(45, None)
    assert staart == ""
    assert indicatief is False


def test_geen_em_dashes_in_de_responscopy():
    teksten = [_respons_caution(45, 150), _respons_caution(45, None),
               _respons_kernzin_staart(45, 150)[0],
               _p02_respons_prefix("Als startpunt kiest Loep X.", indicatief=True)]
    for t in teksten:
        assert "—" not in t and "--" not in t, t
        assert "ik " not in t.lower()


# ── De kernzin ───────────────────────────────────────────────────────────────

def test_indicatief_beeld_verzacht_het_startpunt():
    zin = _p02_respons_prefix("Als startpunt kiest Loep Groeiperspectief.",
                              indicatief=True)
    assert zin.startswith("Indicatief beeld:")
    assert "mogelijk startpunt" in zin
    assert "Als startpunt" not in zin


def test_kernzin_onaangetast_bij_voldoende_respons():
    zin = "Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.5/10)."
    assert _p02_met_respons(zin, completed=45, invited=50) == zin
    assert _p02_met_respons(zin, completed=45, invited=None) == zin


def test_staart_staat_binnen_de_laatste_zin_en_niet_erachter():
    # Achter de punt zou een losse haakjeszin overblijven; hij hoort binnen de
    # zin die hij relativeert.
    zin = "Als startpunt kiest Loep Groeiperspectief."
    uit = _p02_met_respons(zin, completed=45, invited=150)
    assert uit == ("Als startpunt kiest Loep Groeiperspectief (op basis van 45 "
                   "van de 150 genodigden).")


def test_indicatief_beeld_en_staart_samen():
    uit = _p02_met_respons("Als startpunt kiest Loep Groeiperspectief.",
                           completed=45, invited=180)
    assert uit == ("Indicatief beeld: Als mogelijk startpunt kiest Loep "
                   "Groeiperspectief (op basis van 45 van de 180 genodigden).")


# ── De noemer ────────────────────────────────────────────────────────────────

def test_noemer_komt_uit_het_delivery_record():
    assert _respons_noemer(150, rows=45, completed=45) == 150


def test_noemer_valt_terug_op_respondentrijen_alleen_als_die_meer_zijn():
    # Managed flow: er bestaan rijen voor wie niet invulde.
    assert _respons_noemer(None, rows=48, completed=45) == 48
    # Self-send: elke rij is een ingevulde vragenlijst, dus geen 100%-claim.
    assert _respons_noemer(None, rows=45, completed=45) is None
    assert _respons_noemer(0, rows=45, completed=45) is None


def test_noemer_kleiner_dan_het_aantal_afgeronde_vragenlijsten_telt_niet():
    # Een handmatig ingevoerde noemer van 40 bij 45 afgeronde vragenlijsten
    # zou 113% respons opleveren. Liever geen getal dan een onwaar getal.
    assert _respons_noemer(40, rows=45, completed=45) is None
    assert _respons_noemer(40, rows=48, completed=45) == 48
    # Precies gelijk mag wel: dat is 100% en kan waar zijn.
    assert _respons_noemer(45, rows=45, completed=45) == 45


# ── De responsbasis ──────────────────────────────────────────────────────────

def _basis(**kw):
    base = dict(period="apr-mei 2026", population="Actieve medewerkers",
                segment_available=True, enps_available=True)
    base.update(kw)
    return _responsbasis(**base)


def test_responsbasis_toont_de_waarschuwing_onder_de_helft():
    html = _basis(invited=150, completed=45, pct=30)
    assert "Uitgenodigd" in html and ">150<" in html and ">30%<" in html
    assert ("Minder dan de helft heeft ingevuld (45 van de 150). Lees de "
            "uitkomsten als het beeld van wie meedeed, niet van de hele "
            "organisatie.") in html


def test_responsbasis_zwijgt_bij_voldoende_respons():
    html = _basis(invited=50, completed=45, pct=90)
    assert "Minder dan de helft" not in html
    assert "niet vastgelegd" not in html


def test_responsbasis_zonder_noemer_toont_geen_percentage():
    html = _basis(invited=None, completed=45, pct=None)
    assert "Uitgenodigd" not in html
    assert "%" not in html
    assert "Afgerond" in html and ">45<" in html
    assert ("Het aantal genodigden is niet vastgelegd; het responspercentage "
            "is daarom niet bekend.") in html


def test_cover_toont_geen_nul_procent_zonder_noemer():
    assert _cover_respons_stat(_fixture(completed=45, invited=150)) == ("Respons", "30%")
    label, waarde = _cover_respons_stat(_fixture(completed=45, invited=None))
    assert label == "Respons"
    assert waarde == "Onbekend"
    assert "%" not in waarde


# ── Rendertests: scenario 16, 16b, 17 en de onbekende noemer ─────────────────

def test_scenario_17_negentig_procent_blijft_ongewijzigd():
    html = _tekst(render_exit_report_html(_fixture(completed=45, invited=50)))
    assert "op basis van" not in html
    assert "Indicatief beeld" not in html
    assert "Minder dan de helft" not in html


def test_scenario_16_dertig_procent_remt_de_kernzin():
    html = _tekst(render_exit_report_html(_fixture(completed=45, invited=150)))
    assert "(op basis van 45 van de 150 genodigden)." in html
    assert "Minder dan de helft heeft ingevuld (45 van de 150)." in html
    # 30% is niet onder de indicatieve drempel.
    assert "Indicatief beeld" not in html


def test_scenario_16b_vijfentwintig_procent_is_indicatief():
    html = _tekst(render_exit_report_html(_fixture(completed=45, invited=180)))
    assert "Indicatief beeld:" in html
    assert "mogelijk startpunt" in html
    assert "(op basis van 45 van de 180 genodigden)." in html


def test_render_zonder_noemer_noemt_nergens_een_responspercentage():
    tekst = _tekst(render_exit_report_html(_fixture(completed=45, invited=None)))
    assert re.search(r"\d+%", tekst) is None, "geen percentage zonder noemer"
    assert "Uitgenodigd" not in tekst
    assert "Het aantal genodigden is niet vastgelegd; het responspercentage is daarom niet bekend." in re.sub(r"\s+", " ", tekst)
    assert "Onbekend" in tekst


@pytest.mark.parametrize("invited", [50, 150, 180, None])
def test_gerenderde_responscopy_blijft_zonder_em_dash(invited):
    html = _tekst(render_exit_report_html(_fixture(completed=45, invited=invited)))
    assert "—" not in html


def test_staart_hangt_aan_de_laatste_zin_van_de_kernzin():
    # Bij Loep Vertrek plakt de renderer nog een zin over de meest genoemde
    # vertrekreden achter de kernzin. De staart hoort daar binnen, want die
    # telling komt uit precies dezelfde 45 ingevulde vragenlijsten.
    data = _fixture(completed=45, invited=150)
    data["exit_r_dist"] = [{"code": "PL1", "label": "Beter aanbod elders", "count": 9}]
    tekst = _tekst(render_exit_report_html(data))
    assert ("Beter aanbod elders is de meest genoemde vertrekreden (op basis van "
            "45 van de 150 genodigden).") in tekst


def test_ook_een_rapport_zonder_factorprofiel_draagt_zijn_responsbasis():
    # Zonder factorprofiel valt de kernzin terug op de frictiescore (bug B2).
    # Juist daar is de basis dun, dus de respons hoort er ook in te staan.
    data = _fixture(completed=45, invited=180)
    data["factor_avgs"] = {}
    data["factor_items_map"] = {}
    tekst = _tekst(render_exit_report_html(data))
    assert ("Indicatief beeld: De frictiescore van 5.5/10 wijst op een "
            "gemengd vertrekbeeld (op basis van 45 van de 180 genodigden).") in tekst
