"""Taal en typografie van het klantrapport (spec par. 9 C2/C3/C6, par. 10 H15;
taak 13 vult de source-guard aan)."""
import re

from backend.products.shared.deepening import (
    get_deepening_sets,
    get_direction_sets,
)
from backend.report_html import (
    VERSPREIDINGSREGEL,
    _cover,
    _overzichtsprofiel,
    _themed_quotes,
    _trust_page,
    _verspreidingsregel,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from backend.scan_definitions import get_scan_definition
from tests.test_report_degraded_page_two import _fixture
from tests.test_report_distribution import _min_retention_data
from tests.test_report_startpuntverhaal import FACTOR_ROWS, ROWS


def _tekst(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def test_anonimiseringslabel_staat_een_keer_boven_de_quotes():
    html = _themed_quotes([f"Tekst {i}." for i in range(6)], "retention")
    assert html.count("Automatisch geanonimiseerd") == 1
    assert html.index("Automatisch geanonimiseerd") < html.index("Tekst 0.")


def test_overzichtsprofiel_zonder_bandlijst():
    html = _overzichtsprofiel([("Groeiperspectief", 4.2), ("Leiderschap", 7.0)],
                              summary="S.", scan_type="retention")
    assert "kwetsbaar punt (1)" not in html and "relatief sterk (1)" not in html
    assert "fbar-row" in html   # de balken blijven


def test_stellingteksten_zonder_los_streepje_en_met_trema():
    for st in ("exit", "retention"):
        teksten = [t for _k, t in get_scan_definition(st)["sdt_items"]]
        assert not any(" - " in t for t in teksten), st
        assert not any("geinteresseerd" in t for t in teksten), st
        assert any("geïnteresseerd" in t for t in teksten), st


def test_verspreidingsregel_op_cover_en_slotpagina():
    # De regel noemt geen toelichtingen: hij staat ook in een rapport zonder
    # toelichtingen en zonder verdieping (stresstest 07), en beloofde daar iets
    # over een blok dat er niet is (taalronde, taak 13).
    assert _verspreidingsregel("TechBouw B.V.") == (
        "Voor het MT en HR van TechBouw B.V. Deel dit rapport niet met individuele medewerkers; "
        "in kleine teams zijn uitkomsten herkenbaar, ook al noemt dit rapport geen namen.")
    assert _verspreidingsregel("") == VERSPREIDINGSREGEL.format(org="de organisatie")
    cover = _cover(scan_label="Loep Behoud", scan_type="retention", org_name="TechBouw B.V.",
                   period="W", opening_question="Q?", stats=[("a", "1")])
    assert "Deel dit rapport niet met individuele medewerkers" in _tekst(cover)
    slot = _trust_page("retention", org_name="TechBouw B.V.")
    assert "Voor het MT en HR van TechBouw B.V." in _tekst(slot)
    assert "Uitsluitend bestemd voor geautoriseerde gebruikers" not in slot


# ── Source-guard op de verboden woorden (taak 13, bijlage B + par. 10) ────────
#
# Bijlage B van de spec plus de terminologieregel (par. 10). Substrings, bewust
# ruim: "werkfactoren" en "segmentanalyse" horen er ook uit. "item" alleen als
# los woord: "limiet" en "kritiek" bevatten de letters ook.
VERBODEN = [r"bestuurlijke read", r"responsbasis", r"verdieptrigger",
            r"interventieprescriptie", r"managementread", r"factor", r"thema",
            r"segment", r"\bitems?\b", r"patroonduiding", r"claimgrenzen",
            r"begeleide managementbespreking"]


def _zichtbaar(html: str) -> str:
    """De zichtbare tekst van een gerenderd rapport.

    De guard moet de KLANTCOPY bewaken en niet de code: het stylesheet en het
    ontwikkelaarscommentaar erin staan vol met "factor" en "item" (klassenamen,
    toelichtingen), en een sweep over de bron zou dus altijd rood staan of juist
    zo veel uitzonderingen krijgen dat hij niets meer meet. Daarom: renderen,
    de <style>-blokken eraf, de tags eruit, en zoeken in wat de lezer ziet.
    """
    body = html.split("</style>")[-1]
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body)).lower()


_VOL_N = 60


def _op_score(data: dict) -> list[str]:
    """Onderwerpen van laag naar hoog, zoals het rapport ze rangschikt.

    De verdieping en de richtingkaarten renderen alleen voor het startpunt en
    het tweede punt, dus moet de rijke data op de LAAGST scorende onderwerpen
    zitten. Op de dict-volgorde van de contentset vertrouwen ging mis: daar
    staan leadership en culture vooraan en die vallen in dit profiel buiten de
    agenda, waardoor de gerenderde tekst juist de dunne staten toonde.
    """
    fa = data["factor_avgs"]
    return sorted(fa, key=lambda fk: (fa[fk], fk))


def _deep_agg(scan_type: str, keys_op_score: list[str]) -> dict:
    """Verdiepingsaggregaat met echte optiesleutels uit de contentset.

    De twee laagst scorende onderwerpen (startpunt en tweede punt) zijn zo vol
    dat elke conditionele tak van het verdiepingsblok rendert: een verdeling
    (vanaf DEEPENING_DISTRIBUTION_MIN_N), een gedeelde toelichting (vanaf
    DEEPENING_MIN_N) en het Anders-blok met teksten (aandeel boven
    OTHER_SHARE_MIN, minstens OTHER_MIN_N mensen, minstens MIN_QUOTES_N
    teksten). De rest blijft dun, zodat ook de melding "te weinig om een
    verdeling te tonen" in de sweep zit. Verzonnen sleutels horen te
    KeyErroren, dus ze komen uit get_deepening_sets.
    """
    sets = get_deepening_sets(scan_type)
    rijk = [fk for fk in keys_op_score if fk in sets][:2]
    out = {}
    for fk, spec in sets.items():
        keys = [o["key"] for o in spec["options"]]
        other = next(k for k in keys if k.endswith("_other"))
        if fk in rijk:
            counts = {keys[0]: 7, keys[1]: 3, other: 6}
            teksten = [f"Toelichting {j} van een respondent." for j in range(6)]
            triggered, skipped = 20, 2
        else:
            counts = {keys[0]: 2}
            teksten = []
            triggered, skipped = 4, 1
        answered = sum(counts.values())
        out[fk] = {"triggered": triggered, "offered": answered + skipped,
                   "answered": answered, "skipped": skipped,
                   "primary_counts": counts, "secondary_counts": {keys[2]: 2},
                   "other_texts": teksten}
    return out


def _dir_agg(scan_type: str, keys_op_score: list[str] | None = None,
             *, split_none_op: str | None = None) -> dict:
    """Richtingaggregaat met echte optiesleutels.

    Vier staten in één rapport: clear (grote meerderheid) op het startpunt,
    plurality (grootste groep zonder meerderheid) op het tweede punt, daarna
    none_needed (de niets-optie wint) en too_few (onder DIRECTION_MIN_N). De som
    van lowest_n blijft onder het aantal respondenten; hoger kan met echte data
    niet en laat de renderer terecht omvallen.
    """
    sets = get_direction_sets(scan_type)
    orde = [fk for fk in (keys_op_score or []) if fk in sets]
    orde += [fk for fk in sets if fk not in orde]
    out = {}
    for i, fk in enumerate(orde):
        keys = [o["key"] for o in sets[fk]["options"]]
        geen = next(k for k in keys if k.endswith("_none"))
        echt = [k for k in keys if k != geen]
        if fk == split_none_op:
            counts = {geen: 5, echt[0]: 5}                 # split_none
        elif i == 0:
            counts = {echt[0]: 13, echt[1]: 3}             # clear
        elif i == 1:
            counts = {echt[0]: 5, echt[1]: 3, echt[2]: 3}  # plurality
        elif i == 2:
            counts = {geen: 6, echt[0]: 2}                 # none_needed
        else:
            counts = {echt[0]: 2}                          # too_few
        answered = sum(counts.values())
        out[fk] = {"lowest_n": answered + 1, "offered": answered + 1,
                   "answered": answered, "skipped": 1, "counts": counts}
    return out


def _vol(scan_type: str, *, kwetsbaar: bool = False) -> dict:
    """Een rapport waarin elk conditioneel blok rendert.

    Zonder verdieping, richting, open toelichtingen, afdelingen en eNPS blijft
    een groot deel van de copy ongerenderd, en dan bewaakt de guard die woorden
    niet. Loep Start kent geen verdieping en geen richtingvraag (niet in
    DEEPENING_CAP), dus daar blijven die twee leeg: dat is de productiestaat.

    kwetsbaar zet het startpunt onder de 5,0. Dat is de enige manier om de
    split_none-kaart te laten renderen (die eist een kwetsbare score), en dus de
    enige manier waarop de guard die copy te zien krijgt.
    """
    d = _fixture(scan_type, n=_VOL_N, profile=True)
    d["open_texts"] = [f"Een open toelichting nummer {i}." for i in range(6)]
    d["segment_rows"], d["segment_factor_rows"] = ROWS, FACTOR_ROWS
    d["enps_available"], d["enps_score"] = True, 12
    d["enps_detail"] = {"n": _VOL_N, "promoters": 25, "passives": 22, "detractors": 13}
    laagste = _op_score(d)[0]
    if kwetsbaar:
        # Score, stellinggemiddelden en respondentscores in één keer, anders
        # spreekt de balk de tabel eronder tegen.
        d["factor_avgs"] = {**d["factor_avgs"], laagste: 4.2}
        d["top_risks"] = [(laagste, 4.2)]
        d["org_item_avgs"] = {**d["org_item_avgs"],
                              **{ik: 4.2 for ik, _t in d["factor_items_map"][laagste]}}
        d["factor_resp_scores"] = {fk: [sc] * _VOL_N
                                   for fk, sc in d["factor_avgs"].items()}
    if scan_type in ("exit", "retention"):
        op_score = _op_score(d)
        d["deepening_agg"] = _deep_agg(scan_type, op_score)
        d["direction_agg"] = _dir_agg(scan_type, op_score,
                                      split_none_op=laagste if kwetsbaar else None)
    return d


_RENDER = {"exit": render_exit_report_html, "retention": render_retention_report_html,
           "onboarding": render_onboarding_report_html}


def _alle_rapporten():
    d = _min_retention_data()
    d["segment_rows"], d["segment_factor_rows"] = ROWS, FACTOR_ROWS
    yield "retention+afdelingen", render_retention_report_html(d)
    for st, fn in _RENDER.items():
        yield st, fn(_fixture(st, n=25, profile=True))
        yield f"{st}-degraded", fn(_fixture(st, n=8, profile=False))
        yield f"{st}-vol", fn(_vol(st))
        yield f"{st}-vol-kwetsbaar", fn(_vol(st, kwetsbaar=True))
    # Zonder factorprofiel maar mét richtingantwoorden: de degraded richtingstaat
    # (stresstest 07), waar het blok alleen tellingen toont.
    for st in ("exit", "retention"):
        d = _fixture(st, n=8, profile=False)
        d["direction_agg"] = _dir_agg(st)
        yield f"{st}-richting-degraded", _RENDER[st](d)


def test_geen_verboden_woorden_in_klantcopy():
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        for pat in VERBODEN:
            m = re.search(pat, tekst)
            assert m is None, (
                f"{naam}: {pat!r} gevonden bij "
                f"...{tekst[max(0, m.start() - 60):m.end() + 60]}...")


def test_geen_em_dashes_en_geen_losse_streepjes():
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        assert "—" not in tekst, naam
        assert " - " not in tekst, naam


# ── Zinsbouw uit de reviews van taak 13 ──────────────────────────────────────

def test_geen_tangconstructie_tussen_telling_en_werkwoord():
    """De richtingkaarten zetten de noemer-bijzin niet meer tussen onderwerp en
    werkwoord ("27 van de 62 (44%) bij wie groeiperspectief het laagst scoorde en
    die de vraag beantwoordden kozen die richting"): tien woorden tussen de twee.
    De noemer staat nu als eigen zin erachter, zoals de clear-tak dat al deed.
    """
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        for tang in ("beantwoordden kozen", "beantwoordden koos",
                     "beantwoordden zeggen", "beantwoordde koos"):
            assert tang not in tekst, f"{naam}: tangconstructie {tang!r}"


def test_geen_haakje_binnen_een_haakje_in_een_telling():
    """Pagina twee zette de telling met haar percentage tussen een tweede paar
    haakjes: "(27 van de 62 (44%) die dit ..., zonder meerderheid)". Elke telling
    met percentage mag dus niet binnen een open haakje staan."""
    for naam, html in _alle_rapporten():
        tekst = _zichtbaar(html)
        for m in re.finditer(r"\(\d+%\)", tekst):
            voor = tekst[max(0, m.start() - 120):m.start()]
            assert voor.rfind("(") <= voor.rfind(")"), (
                f"{naam}: telling met percentage binnen een haakje: "
                f"...{tekst[max(0, m.start() - 120):m.end() + 20]}...")


def test_indicatief_label_eindigt_op_een_punt():
    """De kernzin draagt zelf al een dubbele punt zodra hij de kwetsbare
    onderwerpen opsomt; "Indicatief beeld: ...: ..." zette er twee in een zin."""
    from backend.report_html import _p02_respons_prefix
    zin = "Behoud vraagt aandacht op een kwetsbaar onderwerp: werkdruk."
    assert _p02_respons_prefix(zin, indicatief=True) == f"Indicatief beeld. {zin}"
    assert _p02_respons_prefix(zin, indicatief=False) == zin


def test_geen_alle_twee_in_een_vlak_profiel():
    """"alle twee onderwerpen scoren 6.2/10" is geen Nederlands; bij precies
    twee hoort "beide"."""
    from backend.report_html import _alle_onderwerpen
    assert _alle_onderwerpen(2) == "beide onderwerpen"
    assert _alle_onderwerpen(2, kaal=True) == "beide"
    assert _alle_onderwerpen(6) == "alle zes onderwerpen"
    for naam, html in _alle_rapporten():
        assert "alle twee" not in _zichtbaar(html), naam


def test_slotcel_wie_dit_mag_zien_begint_met_het_antwoord():
    """De cel heette "Wie dit mag zien" en opende met "Verwerking conform AVG":
    het antwoord op de titel stond achteraan."""
    for st in ("exit", "retention", "onboarding"):
        cel = _tekst(_trust_page(st, org_name="TechBouw B.V."))
        i = cel.index("Wie dit mag zien")
        na = cel[i + len("Wie dit mag zien"):].lstrip()
        assert na.startswith("Voor het MT en HR van TechBouw B.V."), st
        assert na.index("Verwerking conform AVG") > 0, st


def test_de_anonimisering_staat_een_keer_op_de_slotpagina():
    """Twee cellen zeiden hetzelfde over geanonimiseerde toelichtingen: de cel
    Open toelichtingen en, via de verspreidingsregel, de cel Wie dit mag zien."""
    for st in ("exit", "retention", "onboarding"):
        tekst = _tekst(_trust_page(st, org_name="TechBouw B.V."))
        assert tekst.count("geanonimiseerd") == 1, st


def test_de_verspreidingsregel_op_de_cover_breekt_af():
    """Die regel draagt een organisatienaam, en een lange naam zonder spatie
    duwde .cdist anders over de marge; .app-tbl td en .item-tbl td hebben deze
    eigenschap al om dezelfde reden."""
    from backend.report_css import build_css
    css = re.sub(r"\s+", " ", build_css())
    regel = css[css.index(".cdist {"):]
    regel = regel[:regel.index("}")]
    assert "overflow-wrap: break-word" in regel
