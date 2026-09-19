"""Eén startpuntverhaal (spec 2026-09-16 par. 5): organisatiebreed en per
afdeling mogen verschillende dingen aanwijzen, maar het rapport zegt zelf hoe
die twee zich verhouden (B2). De restgroep krijgt naam en noemer (H20). De
cover gebruikt hetzelfde woord als binnen (C8)."""
import re

from backend.report_html import (
    _brugzin,
    _department_segment_rows,
    _enrich_segment_rows_with_invited,
    _exit_reason_count,
    _hoofdreden_cell,
    _segment_block,
    _segment_start_note,
    _segment_startpunt,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.conftest import exit_report_data
from tests.test_report_distribution import _min_retention_data


def _row(dept, n, avg, invited=None, pooled=False, members=None):
    r = {"department": dept, "n": n, "avg": avg, "scores": [avg] * n,
         "is_pooled": pooled, "invited": invited}
    if members is not None:
        r["members"] = members
    return r


ROWS = [_row("Operations", 17, 6.0, invited=21), _row("Marketing", 5, 6.3, invited=8),
        _row("Finance", 8, 6.6, invited=10),
        _row("Overige afdelingen", 9, 5.9, invited=19, pooled=True, members=["Facilitair", "Staf"])]
FACTOR_ROWS = {"Operations": {"factors": [("workload", 4.9, 17), ("leadership", 5.2, 17)], "omitted": 0}}


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_segment_startpunt_wijst_alleen_aan_bij_beide_grenzen():
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    assert seg == {"department": "Operations", "score": 6.0, "n": 17, "invited": 21,
                   "low_fk": "workload", "low_avg": 4.9, "rest_lager": True}
    te_klein = [_row("Ops", 7, 5.0), _row("Sales", 9, 6.1)]
    assert _segment_startpunt(te_klein, None) is None
    te_dicht = [_row("Ops", 12, 6.0), _row("Sales", 12, 6.1)]
    assert _segment_startpunt(te_dicht, None) is None


def test_brugzin_drie_varianten():
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    anders = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert anders == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Bij Operations springt "
                      "Werkdruk en herstelruimte eruit (4.9/10); bespreek dat voor die afdeling na het startpunt.")
    # "Tweede punt" is op de agenda de kaart van de organisatie; de brugzin mag
    # dat woord niet voor een afdeling gebruiken (eindreview plan 3a, punt 5).
    assert "tweede punt" not in anders.lower()
    zelfde = _brugzin("workload", "Werkdruk en herstelruimte", seg, "retention")
    assert zelfde == ("Bij Operations weegt Werkdruk en herstelruimte het zwaarst (4.9/10); daar begint "
                      "het gesprek ook.")
    assert _brugzin("growth", "Groeiperspectief", None, "retention") == ""
    zonder_thema = _brugzin("growth", "Groeiperspectief", dict(seg, low_fk=None, low_avg=None), "retention")
    assert zonder_thema == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Operations scoort het "
                            "laagst van de afdelingen die apart getoond worden (6.0/10); welk onderwerp "
                            "daar het zwaarst weegt is niet te zeggen, te weinig antwoorden per onderwerp. "
                            "De restgroep scoort lager, maar bestaat uit kleine afdelingen en telt daarom "
                            "niet als startpunt.")


def test_brugzin_zonder_startpunt_blijft_leeg():
    # Zonder factorprofiel is er geen organisatiebreed startpunt om aan te
    # knopen; dan mag de zin niet over "het gesprek" beginnen.
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    assert _brugzin(None, "", seg, "retention") == ""


def test_navy_blok_heet_waar_het_per_afdeling_begint():
    html = _segment_start_note(ROWS, FACTOR_ROWS, "retention")
    assert "Waar het per afdeling begint" in html
    assert "Startpunt voor de bespreking" not in html


def test_restgroep_heeft_samenstelling_en_noemer():
    html = _segment_block(ROWS, FACTOR_ROWS, scan_type="retention")
    tekst = _tekst(html)
    assert "Overige afdelingen Facilitair, Staf" in tekst
    assert "9/19" in tekst and "47%" in tekst
    assert ("De restgroep “Overige afdelingen” (Facilitair, Staf; samen 19 uitgenodigd, 9 ingevuld) "
            "scoort lager (5.9/10)") in tekst.replace("&ldquo;", "“").replace("&rdquo;", "”")


def test_restgroep_zonder_noemer_meldt_alleen_het_aantal():
    # Ontbreekt de noemer van één lid, dan geen deelsom en dus geen percentage:
    # alleen het aantal ingevulde vragenlijsten.
    rows = [r.copy() for r in ROWS]
    rows[-1]["invited"] = None
    tekst = _tekst(_segment_block(rows, FACTOR_ROWS, scan_type="retention"))
    assert ("(Facilitair, Staf; 9 ingevuld, hoeveel mensen hier zijn uitgenodigd is niet "
            "volledig vastgelegd) scoort lager") in tekst
    assert "uitgenodigd, 9 ingevuld" not in tekst


def test_department_rows_dragen_de_leden_van_de_restgroep():
    resp = ([{"department": "Ops", "signal_score": 6.0}] * 6
            + [{"department": "Sales", "signal_score": 6.5}] * 5
            + [{"department": "Staf", "signal_score": 5.0}] * 3
            + [{"department": "Facilitair", "signal_score": 5.5}] * 2)
    rows = _department_segment_rows(resp)
    pooled = [r for r in rows if r["is_pooled"]][0]
    assert pooled["members"] == ["Facilitair", "Staf"]
    rows = _enrich_segment_rows_with_invited(rows, [
        {"label": "Ops", "invited_count": 8}, {"label": "Sales", "invited_count": 6},
        {"label": "Staf", "invited_count": 4}, {"label": "Facilitair", "invited_count": 3}])
    assert pooled["invited"] == 7
    # Ontbreekt de noemer van één lid, dan is er geen restgroepnoemer (geen deelsom).
    rows = _enrich_segment_rows_with_invited(rows, [{"label": "Staf", "invited_count": 4}])
    assert pooled["invited"] is None


def test_cover_en_p02_dragen_de_brugzin_en_het_nieuwe_coverlabel():
    d = _min_retention_data()
    d["segment_rows"] = ROWS
    # De fixture heeft alleen workload; met workload als laagste thema van
    # Operations zou de "zelfde"-variant vuren. Leiderschap geeft de
    # "anders"-variant, die de brug tussen twee onderwerpen laat zien.
    d["segment_factor_rows"] = {"Operations": {"factors": [("leadership", 5.2, 17)], "omitted": 0}}
    html = render_retention_report_html(d)
    assert "Waar het gesprek begint" in html and "Eerste aandachtspunt" not in html
    assert html.count("Organisatiebreed begint het gesprek bij") == 2   # p.02 en agenda
    assert 'class="mq-brug"' in html
    # Niet alleen "twee keer in het document": één ervan hoort op pagina twee.
    from tests.test_report_degraded_page_two import _page_two
    p02 = _page_two(html)
    assert p02.count("Organisatiebreed begint het gesprek bij") == 1
    assert 'class="mq-brug"' in p02
    # De marge van de sectievariant staat in report_css.py, niet inline.
    assert 'class="mq-brug mq-brug-sec"' in html
    assert not re.search(r'class="mq-brug[^"]*"\s+style=', html)
    # Em-dash-guard op de nieuwe copy van deze taak (vaste regel 2).
    nieuw = [_tekst(p) for p in re.findall(r'<p class="mq-brug"[^>]*>(.*?)</p>', html, re.S)]
    nieuw.append(_tekst(_segment_start_note(ROWS, FACTOR_ROWS, "retention")))
    nieuw.append(_tekst(_segment_block(ROWS, FACTOR_ROWS, scan_type="retention")))
    assert nieuw and all("—" not in t and "&#x2014;" not in t for t in nieuw)


# ── De vertrekreden van het startpunt komt uit de volledige teller ───────────
# Hoort bij hetzelfde startpuntverhaal: de why-cel op p.02 onderbouwt waarom
# dit onderwerp het startpunt is. Hij las de telling uit exit_r_dist, de top 5
# van de tabel; zijn meer dan vijf redenen even vaak genoemd en valt die van het
# startpunt buiten die top 5, dan zag de cel 0 en verdween hij, terwijl hij
# juist "Even vaak" moest melden.

_ZES_GELIJK = ["P1", "P2", "P3", "P4", "P5", "P6"]
_DIST_TOP5 = [{"code": c, "label": f"Reden {c}", "count": 2} for c in _ZES_GELIJK[:5]]
_TOP_VOLLEDIG = [{"code": c, "label": f"Reden {c}", "count": 2} for c in _ZES_GELIJK]


def test_vertrekredentelling_komt_uit_de_volledige_teller():
    data = {"exit_r_dist": _DIST_TOP5, "exit_r_top": _TOP_VOLLEDIG,
            "exit_r_counts": {c: 2 for c in _ZES_GELIJK}}
    assert _exit_reason_count(data, "P6") == 2
    assert _exit_reason_count(data, "P9") == 0
    # Fixture van vóór exit_r_counts: terugval op de top 5 plus het volledige
    # gelijkspel, zonder een getal te verzinnen.
    assert _exit_reason_count({"exit_r_dist": _DIST_TOP5, "exit_r_top": _TOP_VOLLEDIG},
                             "P6") == 2
    assert _exit_reason_count({"exit_r_dist": _DIST_TOP5}, "P6") == 0
    cel = _tekst(_hoofdreden_cell(er_n=_exit_reason_count(data, "P6"),
                                 er_top=_TOP_VOLLEDIG, gegeven=None, n=12,
                                 tf_code="P6", color="#000"))
    assert "Even vaak" in cel


def test_exit_renderer_laat_de_cel_niet_wegvallen_buiten_de_top_vijf():
    # role_clarity heeft code P6 en is hier het startpunt (laagste score);
    # zijn vertrekreden staat buiten de top 5 van de tabel, maar in het
    # gelijkspel.
    fa = {"role_clarity": 4.2, "leadership": 6.0, "culture": 6.1,
          "growth": 6.2, "compensation": 6.3, "workload": 6.4}
    d = exit_report_data(
        factor_avgs=fa,
        factor_items_map={fk: [(f"{fk}_1", f"Stelling {fk}")] for fk in fa},
        exit_r_dist=_DIST_TOP5)
    d["exit_r_top"] = _TOP_VOLLEDIG
    d["exit_r_counts"] = {c: 2 for c in _ZES_GELIJK}
    tekst = _tekst(render_exit_report_html(d))
    assert "Even vaak" in tekst
    assert "een van de meest genoemde hoofdredenen van vertrek" in tekst


def test_loep_start_cover_en_pagina_twee_noemen_hetzelfde_startpunt():
    # Eén bron voor cover, p.02 en de gespreksagenda (C8): de cover zegt
    # "Waar het gesprek begint", en dan mag dat niet een ander onderwerp zijn
    # dan waar de agenda begint. Een fixture met een top_fkeys die niet bij
    # factor_avgs past mag het rapport niet met zichzelf in tegenspraak brengen.
    from tests.test_report_degraded_page_two import _fixture
    d = _fixture("onboarding", n=12, profile=True)
    fa = {"growth": 4.1, "workload": 6.0, "role_clarity": 6.2,
          "leadership": 6.4, "culture": 6.8, "compensation": 7.1}
    d["factor_avgs"] = fa
    d["factor_resp_scores"] = {fk: [sc] * 12 for fk, sc in fa.items()}
    d["factor_items_map"] = {fk: [(f"{fk}_1", f"Stelling {fk}")] for fk in fa}
    d["org_item_avgs"] = {f"{fk}_1": sc for fk, sc in fa.items()}
    d["top_fkeys"] = ["culture"]          # bewust inconsistent met factor_avgs
    d["top_flabels"] = ["Cultuur"]
    html = render_onboarding_report_html(d)
    from backend.report_html import _fl
    verwacht = _fl("growth", "onboarding")
    cover = html[html.index("Waar het gesprek begint"):][:400]
    assert verwacht in cover
    assert _fl("culture", "onboarding") not in cover


# ── Codereview taak 7: drie defecten in de brugzin en de restgroepnoemer ─────

def test_variant_zonder_thema_hedget_net_als_het_navy_blok():
    # Defect 1: "Operations scoort het laagst van de afdelingen (6.0/10)" is
    # onwaar zodra de gepoolde restgroep lager staat, en het navy blok zegt in
    # precies deze situatie "van de afdelingen die apart getoond worden".
    seg = dict(_segment_startpunt(ROWS, FACTOR_ROWS), low_fk=None, low_avg=None)
    assert seg["rest_lager"] is True
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "scoort het laagst van de afdelingen die apart getoond worden (6.0/10)" in zin
    assert ("De restgroep scoort lager, maar bestaat uit kleine afdelingen en telt "
            "daarom niet als startpunt.") in zin


def test_variant_zonder_thema_zwijgt_over_een_restgroep_die_niet_lager_staat():
    zonder_rest = [r for r in ROWS if not r["is_pooled"]]
    seg = dict(_segment_startpunt(zonder_rest, FACTOR_ROWS), low_fk=None, low_avg=None)
    assert seg["rest_lager"] is False
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "De restgroep" not in zin
    assert "van de afdelingen die apart getoond worden" in zin


_STERK_FR = {"Operations": {"factors": [("compensation", 7.4, 17)], "omitted": 0}}


def test_brugzin_is_bandbewust_bij_een_relatief_sterk_thema():
    # Defect 2: "springt eruit; neem dat als tweede punt" bij 7.4/10 overdrijft,
    # en draait de band-neutrale keuze van het navy blok terug.
    seg = _segment_startpunt(ROWS, _STERK_FR)
    anders = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert anders == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Het laagst "
                      "scorende onderwerp bij Operations is Beloning en eerlijkheid (7.4/10), "
                      "en dat scoort daar relatief sterk.")
    assert "springt" not in anders and "tweede punt" not in anders
    zelfde = _brugzin("compensation", "Beloning en eerlijkheid", seg, "retention")
    assert zelfde == ("Bij Operations is Beloning en eerlijkheid het laagst scorende onderwerp "
                      "(7.4/10); daar begint het gesprek ook.")
    assert "het zwaarst" not in zelfde


def test_aandachtspunt_houdt_de_sterke_vorm():
    # 5.0 tot 6.5 is een aandachtspunt: daar mag de opdrachtvorm ("bespreek dat voor die afdeling") wel.
    seg = _segment_startpunt(ROWS, {"Operations": {"factors": [("compensation", 6.4, 17)],
                                                   "omitted": 0}})
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "springt Beloning en eerlijkheid eruit (6.4/10); bespreek dat voor die afdeling na het startpunt" in zin


def test_brugzin_gebruikt_een_hoofdletter_voor_beide_onderwerpen():
    seg = _segment_startpunt(ROWS, FACTOR_ROWS)
    zin = _brugzin("growth", "Groeiperspectief", seg, "retention")
    assert "Bij Operations springt Werkdruk en herstelruimte eruit" in zin
    assert "werkdruk en herstelruimte" not in zin


def test_restgroepnoemer_telt_afdelingen_zonder_respons_mee():
    # Defect 3: members komt uit de respondenten, dus een afdeling die is
    # uitgenodigd maar niemand liet antwoorden viel buiten de noemer. 6 van de 8
    # (75%) in plaats van 6 van de 14 (43%).
    resp = ([{"department": "Ops", "signal_score": 6.0}] * 12
            + [{"department": "Sales", "signal_score": 6.5}] * 10
            + [{"department": "Staf", "signal_score": 5.0}] * 3
            + [{"department": "Facilitair", "signal_score": 5.5}] * 3)
    lijst = [{"label": "Ops", "invited_count": 15}, {"label": "Sales", "invited_count": 13},
             {"label": "Staf", "invited_count": 4}, {"label": "Facilitair", "invited_count": 4},
             {"label": "Inkoop", "invited_count": 6}]
    rows = _enrich_segment_rows_with_invited(_department_segment_rows(resp), lijst)
    pooled = [r for r in rows if r["is_pooled"]][0]
    assert pooled["members"] == ["Facilitair", "Inkoop", "Staf"]
    assert pooled["invited"] == 14
    tekst = _tekst(_segment_block(rows, None, scan_type="retention"))
    assert "6/14" in tekst and "43%" in tekst
    assert "75%" not in tekst


def test_restgroepnoemer_vervalt_met_reden_als_de_campagnelijst_hem_niet_draagt():
    resp = ([{"department": "Ops", "signal_score": 6.0}] * 12
            + [{"department": "Sales", "signal_score": 6.5}] * 10
            + [{"department": "Staf", "signal_score": 4.0}] * 3
            + [{"department": "Facilitair", "signal_score": 4.2}] * 3)
    rows = _enrich_segment_rows_with_invited(
        _department_segment_rows(resp),
        [{"label": "Ops", "invited_count": 15}, {"label": "Staf", "invited_count": 4}])
    pooled = [r for r in rows if r["is_pooled"]][0]
    assert pooled["invited"] is None
    tekst = _tekst(_segment_start_note(rows, None, "retention"))
    assert ("6 ingevuld, hoeveel mensen hier zijn uitgenodigd is niet volledig "
            "vastgelegd) scoort lager") in tekst
