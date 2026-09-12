"""
Loep — HTML→PDF rapportgenerator (WeasyPrint) v6
================================================
Product-hardened: eigen copy, labels en structuur per scan-type.
  ExitScan    — terugkijkende vertrekduiding
  RetentieScan — actieve-populatie behoudssignaal / vroegsignalering
  Onboarding  — 30/60/90 onboardingervaring en eerste werkperiode
Parallel pad naast report.py. report.py blijft onaangeroerd.
"""

from __future__ import annotations

import logging
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from html import escape as _esc
from statistics import mean as _mean
from typing import Any

from sqlalchemy.orm import Session, joinedload, selectinload

from backend.models import Campaign, Respondent, SurveyResponse
from backend.report_css import build_css, RAG_HIGH, RAG_MID, RAG_LOW
from backend.report_distribution import (
    MIN_DISTRIBUTION_N,
    ZONE_HIGH,
    ZONE_LOW,
    distribution_block,
    shown as _shown,
    zone_color,
)
from backend.products.shared.deepening import (
    DEEPENING_MIN_N,
    DIRECTION_CAVEAT_MAX_N,
    DIRECTION_MIN_N,
    DIRECTION_SCAN_TYPES,
    TOP_CHOICE_MIN_LEAD,
    agenda_enrichment,
    aggregate_deepening,
    aggregate_direction,
    direction_imperative,
    direction_none_needed_view,
    direction_option_texts,
    direction_state,
    get_deepening_sets,
)
from backend.products.shared.registry import get_product_module
from backend.report_priority import (
    CELL_CAP_REACHED, CELL_NO_MAJORITY, CELL_NOT_TRIGGERED, CELL_TOO_FEW,
    FLAT_PROFILE_SPAN,
    PRIORITY_TIE_MARGIN,
    rank_factors,
)
from backend.scan_definitions import get_scan_definition
from backend.scoring import (
    ORG_FACTOR_KEYS,
    anonymize_text,
    compute_retention_signal_profile,
    detect_patterns,
)
from backend.scoring_config import (
    EXIT_REASON_LABELS_NL,
    FACTOR_LABELS_NL,
    RISK_HIGH,
    RISK_MEDIUM,
    MIN_AGGREGATE_N,
    MIN_SEGMENT_N,
    SDT_DIMENSION_ITEMS,
    SDT_REVERSE_ITEMS,
)

# ─── Constanten ───────────────────────────────────────────────────────────────

logger = logging.getLogger(__name__)

MIN_QUOTES_N = 5
MAX_QUOTES   = 12


def _should_show_quotes(open_texts: list[str]) -> bool:
    """Gate: toon Open toelichtingen alleen als ≥ MIN_QUOTES_N niet-lege teksten."""
    return len([t for t in open_texts if t and t.strip()]) >= MIN_QUOTES_N


def _should_show_appendix(n: int, n_factors: int) -> bool:
    """Gate: toon Appendix alleen bij dataset > 20 respondenten EN > 5 factoren."""
    return n > 20 and n_factors > 5


# ── Product-specifieke factor labels ─────────────────────────────────────────

_FACTOR_EXIT_LABEL: dict[str, str] = {
    "leadership":   "Leiderschap en feedback",
    "culture":      "Cultuur en veiligheid",
    "growth":       "Groeiperspectief",
    "compensation": "Beloning en voorwaarden",
    "workload":     "Werkdruk en balans",
    "role_clarity": "Rolhelderheid",
}
_FACTOR_RETENTION_LABEL: dict[str, str] = {
    "leadership":   "Leiderschap en vertrouwen",
    "culture":      "Cultuur en psychologische veiligheid",
    "growth":       "Groeiperspectief",
    "compensation": "Beloning en eerlijkheid",
    "workload":     "Werkdruk en herstelruimte",
    "role_clarity": "Rolhelderheid en eigenaarschap",
}
_FACTOR_ONBOARDING_LABEL: dict[str, str] = {
    "leadership":   "Begeleiding en bereikbaarheid",
    "culture":      "Sociale landing en cultuurbegrip",
    "growth":       "Ontwikkelruimte en eerste succeservaring",
    "compensation": "Praktische afspraken en startcondities",
    "workload":     "Informatiedichtheid en werktempo",
    "role_clarity": "Rolhelderheid en verwachtingen eerste 90 dagen",
}

def _fl(fk: str, scan_type: str = "exit") -> str:
    """Factor label voor een specifiek product — nooit snake_case naar output."""
    if scan_type == "retention":
        return _FACTOR_RETENTION_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))
    if scan_type == "onboarding":
        return _FACTOR_ONBOARDING_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))
    return _FACTOR_EXIT_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))

# ── Product-specifieke band labels ────────────────────────────────────────────

_EXIT_BANDS = {
    "HOOG":   ("Sterk frictiebeeld",       "#C0392B"),
    "MIDDEN": ("Gemengd vertrekbeeld",      "#C17C00"),
    "LAAG":   ("Laag frictiebeeld",         "#3C8D8A"),
}
_RETENTION_BANDS = {
    "HOOG":   ("Behoud onder druk",          "#C0392B"),
    "MIDDEN": ("Behoud vraagt aandacht",    "#C17C00"),
    "LAAG":   ("Behoudsklimaat stabiel",    "#3C8D8A"),
}
_ONBOARDING_BANDS = {
    "HOOG":   ("Onboardingbasis vraagt aandacht", "#C0392B"),
    "MIDDEN": ("Gemengd onboardingsbeeld",         "#C17C00"),
    "LAAG":   ("Onboardingbasis stabiel",           "#3C8D8A"),
}

def _signal_health(avg_risk: float | None) -> float | None:
    """Behoudssignaal / checkpointscore zoals het rapport 'm toont: health = 11 - avg_risk.

    B4: de opgeslagen risk_score (DB, API, campaign_stats) staat op de
    RISICO-schaal (hoog = slecht; per factor 11 - score, zie
    compute_retention_risk / compute_onboarding_risk). Elk ander "/10"-getal in
    het rapport is een GEZONDHEIDS-score (hoog = goed) en de uitleg naast het
    signaal beschrijft de gezondheidsladder (onder 5,0 kwetsbaar, 5,0 tot 6,5
    aandachtspunt, vanaf 6,5 relatief sterk). Het signaal werd echter ongekeerd
    getoond: "alles hoog" gaf "3.0/10 · sterk", "alles laag" "6.9/10 · vraagt
    aandacht". Deze helper is de enige plek in deze renderer waar de omkering
    gebeurt; ook het segmentblok in build_report_data (signal_score) loopt
    hierlangs. De opslag blijft onaangeraakt. Loep Vertrek (frictiescore) valt
    hier buiten: die toont bewust de risicoschaal.

    Let op: de legacy ReportLab-renderer (backend/report.py, dood pad voor
    retention/onboarding sinds de fail-loud fix) koppelt dashboard_signal_help
    nog aan de ruwe risk_score; die copy is nu op de gezondheidsschaal en mag
    daar niet ongewijzigd hergebruikt worden.
    """
    if avg_risk is None:
        return None
    return round(11.0 - avg_risk, 2)


def _band_key(score: float | None, scan_type: str = "exit") -> str | None:
    """Bandsleutel HOOG/MIDDEN/LAAG voor een totaalscore, of None zonder data.

    Polariteit per product (B4):
    - exit: RISICO-schaal (frictiescore, hoog = meer frictie):
      >= RISK_HIGH -> HOOG, >= RISK_MEDIUM -> MIDDEN, anders LAAG.
    - retention / onboarding: GEZONDHEIDS-schaal (behoudssignaal /
      checkpointscore via _signal_health, hoog = goed), dezelfde ladder als
      _factor_label: < 5,0 -> HOOG (onder druk), < 6,5 -> MIDDEN, anders LAAG.
    HOOG betekent in beide gevallen "meeste aandacht nodig" (rood).
    Vergelijkt op de getoonde (afgeronde) score, zie _shown (B15)."""
    if score is None:
        return None
    score = _shown(score)
    if scan_type in ("retention", "onboarding"):
        return "HOOG" if score < 5.0 else "MIDDEN" if score < 6.5 else "LAAG"
    return "HOOG" if score >= RISK_HIGH else "MIDDEN" if score >= RISK_MEDIUM else "LAAG"


def _band(score: float | None, scan_type: str = "exit") -> tuple[str, str]:
    """(label, kleur) voor een totaalscore — product-specifiek, nooit gedeeld.

    Retention en onboarding verwachten hier de GEZONDHEIDS-waarde
    (_signal_health(avg_risk)), exit de frictiescore zelf; zie _band_key."""
    table = (_RETENTION_BANDS if scan_type == "retention"
             else _ONBOARDING_BANDS if scan_type == "onboarding"
             else _EXIT_BANDS)
    k = _band_key(score, scan_type)
    if k is None:
        return ("Geen data", "#94A3B8")
    return table[k]

# ── Managementvragen per product ──────────────────────────────────────────────

_MGMT_Q_EXIT: dict[str, str] = {
    # leadership: "ontwikkelgesprekken" hoort bij groeiperspectief, niet bij
    # aansturing -> vervangen door "zichtbare steun" (matcht ld_support/ld_availability).
    "leadership":   "Gaat het signaal vooral over feedback, zichtbare steun of vertrouwen?",
    "culture":      "Is dit beeld over psychologische veiligheid, teamdynamiek of cultuurfit?",
    # growth: "erkenning" wordt niet gemeten (vandaar eerder al de factorlabel-
    # hernoeming van "Groeiperspectief en erkenning" naar "Groeiperspectief") ->
    # vervangen door thema's die wel in de verdiepingsset zitten (zichtbaarheid,
    # concrete ontwikkelgesprekken, plafond/stagnatie).
    "growth":       "Gaat het over zichtbaar perspectief, concrete ontwikkelgesprekken of stagnatie in doorgroei?",
    "compensation": "Is de kern hier salaris, ervaren fairness of uitlegbaarheid van voorwaarden?",
    "workload":     "Speelt de werkdruk in bepaalde teams, functies of als structureel patroon?",
    "role_clarity": "Gaat de onduidelijkheid over prioriteiten, eigenaarschap of beslisruimte?",
}
_MGMT_Q_RETENTION: dict[str, str] = {
    "leadership":   "Gaat het behoudssignaal over vertrouwen in leiding, feedback of zichtbare steun?",
    "culture":      "Is dit beeld over psychologische veiligheid, teambinding of cultuurmatch?",
    "growth":       "Speelt ontbrekend perspectief, te weinig concrete ontwikkelgesprekken of stagnatie een rol?",
    "compensation": "Is de kern hier ervaren fairness, uitlegbaarheid of beloningshoogte?",
    "workload":     "Speelt structurele werkdruk, gebrek aan herstelruimte of onbalans mee?",
    "role_clarity": "Is onduidelijkheid over eigenaarschap, prioriteiten of beslisruimte een thema?",
}
_MGMT_Q_ONBOARDING: dict[str, str] = {
    "leadership":   "Is de frictie over bereikbaarheid, richting of concrete steun in de eerste periode?",
    "culture":      "Gaat het over inbedding in het team, psychologische veiligheid of culturele codes?",
    "growth":       "Hebben nieuwe medewerkers voldoende zicht op wat succes betekent in hun rol?",
    "compensation": "Schuren praktische afspraken, tools of startcondities in deze vroege fase?",
    "workload":     "Is de informatiedichtheid of het werktempo hoog voor een eerste werkperiode?",
    "role_clarity": "Zijn rolverwachtingen en prioriteiten voor de eerste 90 dagen helder genoeg?",
}

def _mgmt_q(fk: str, scan_type: str = "exit") -> str:
    if scan_type == "retention": return _MGMT_Q_RETENTION.get(fk, "")
    if scan_type == "onboarding": return _MGMT_Q_ONBOARDING.get(fk, "")
    return _MGMT_Q_EXIT.get(fk, "")

# ── Overige constanten ────────────────────────────────────────────────────────

FACTOR_EXIT_CODE: dict[str, str] = {
    "leadership": "P1", "culture": "P2", "growth": "P3",
    "compensation": "P4", "workload": "P5", "role_clarity": "P6",
}


def _select_priority_factors(factor_avgs: dict[str, float],
                             exit_reason_counts: dict[str, int],
                             max_n: int = 3) -> list[str]:
    """Prioriteit = lage score + frequentie als vertrekreden. Niet puur laagste.

    Alleen organisatiefactoren: scoring.py's factor_averages bevat ook de
    SDT-dimensies (autonomy/competence/relatedness), maar die hebben geen
    stellingen in de verdieping-template — een SDT-dimensie als "prioritaire
    factor" rendert een lege verdiepingspagina (bug gevonden 2026-07-13)."""
    def _priority(fk: str) -> float:
        score = factor_avgs.get(fk, 10.0)
        reason = exit_reason_counts.get(fk, 0)
        return (10.0 - score) * 1.0 + reason * 0.4
    keys = [fk for fk in factor_avgs
            if factor_avgs.get(fk) is not None and fk in ORG_FACTOR_KEYS]
    return sorted(keys, key=_priority, reverse=True)[:max_n]


# Behoudsrelevantie per factor (voor retention prioriteitenmatrix)
_RETENTION_RELEVANCE: dict[str, float] = {
    "workload": 0.85, "leadership": 0.82, "growth": 0.78,
    "role_clarity": 0.72, "culture": 0.68, "compensation": 0.62,
}

SDT_LABELS = {"autonomy": "Autonomie", "competence": "Competentie", "relatedness": "Verbondenheid"}
SDT_HELP   = {
    "autonomy":    "Mate van ervaren regie over de eigen werkwijze",
    "competence":  "Mate van ervaren bekwaamheid en effectiviteit",
    "relatedness": "Mate van verbondenheid met collega's en organisatie",
}


# ─── Label systeem ────────────────────────────────────────────────────────────

# Behoud backward-compat aliases (alleen intern gebruikt in exit renderer)
def _friction_label(score: float | None) -> str:
    return _band(score, "exit")[0]

def _friction_color(score: float | None) -> str:
    return _band(score, "exit")[1]

def _factor_label(score: float | None) -> str:
    # Drempels op de getoonde score (1 decimaal), zie _shown (B15).
    if score is None:  return "Geen data"
    score = _shown(score)
    if score < 5.0:    return "Kwetsbaar punt"
    if score < 6.5:    return "Aandachtspunt"
    return "Relatief sterk"


def profile_shape(factor_avgs: dict[str, float | None]) -> dict[str, Any]:
    """De vorm van het factorprofiel: hoeveel kwetsbaar, en ligt alles dicht bijeen.

    Telt op de getoonde (afgeronde) score via _shown en tegen dezelfde
    kwetsbaar-grens als de spreidingsstrook (ZONE_LOW), zodat deze telling nooit
    kan botsen met het bandlabel dat de lezer ernaast ziet (ronde 1, B15). Dat
    geldt ook voor de span: twee factoren die als 5.0 en 6.0 op de pagina staan
    liggen voor de lezer exact een punt uit elkaar, niet minder. De span wordt
    afgerond omdat 8.2 - 7.2 in binaire drijvende komma 0.99999... is, en dat
    profiel anders "niets springt eruit" zou heten terwijl het een punt spant.

    De volgorde loopt over de onafgeronde waarde, zodat een gedeelde getoonde
    score (5,67 en 5,70 tonen allebei 5,7) op de echte waarde wordt beslist en
    niet alfabetisch; bij exact gelijke waarden beslist de factorsleutel, zodat
    de uitkomst niet van de invoervolgorde afhangt.

    low_key is de laagst scorende factor. Dat is bewust iets anders dan het
    startpunt dat rank_factors bovenaan zet: die sorteert op base (bij Loep
    Vertrek inclusief de vertrekredenweging) en laat binnen een gelijkspelgroep
    de richtingvraag, de spreiding en de verdieping de volgorde bepalen. Wie het
    startpunt nodig heeft, leest dat uit de ranglijst en niet hieruit.
    Alleen organisatiefactoren; SDT-dimensies horen hier niet in.
    """
    ranked = sorted(
        ((fk, _shown(v), v) for fk, v in factor_avgs.items()
         if fk in ORG_FACTOR_KEYS and v is not None),
        key=lambda t: (t[2], t[0]),
    )
    if not ranked:
        return {"n_factors": 0, "n_vulnerable": 0, "flat": False, "span": None,
                "low_key": None, "low_score": None, "high_key": None,
                "high_score": None, "factors_low_to_high": []}
    low_key, low_score, _low_raw = ranked[0]
    high_key, high_score, _high_raw = ranked[-1]
    span = round(high_score - low_score, 2)
    return {
        "n_factors": len(ranked),
        "n_vulnerable": sum(1 for _fk, shown, _raw in ranked if shown < ZONE_LOW),
        "flat": len(ranked) > 1 and span < FLAT_PROFILE_SPAN,
        "span": span,
        "low_key": low_key, "low_score": low_score,
        "high_key": high_key, "high_score": high_score,
        # Taak 3 somt hieruit de kwetsbare onderwerpen op, zonder de invoer
        # opnieuw te filteren: (factorsleutel, getoonde score), laagst eerst.
        "factors_low_to_high": [(fk, shown) for fk, shown, _raw in ranked],
    }


def _flat_span_woorden() -> str:
    """De vlak-drempel in klantcopy, uit de constante die hem ook echt stuurt,
    zodat de zin niet kan gaan liegen als de drempel verandert. Een hele punt
    schrijven we als telwoord ("één punt"), zodat het niet als lidwoord leest;
    een andere waarde krijgt het getal met een komma ("1,5 punt")."""
    span = FLAT_PROFILE_SPAN
    if span == 1.0:
        return "één punt"
    return f"{span:.1f} punt".replace(".", ",")


def _p02_flat_sentence(shape: dict[str, Any], labels: dict[str, str]) -> str:
    """De vlak-profiel-zin op pagina twee (spec ronde 2 par. 2.2).

    Zegt expliciet dat er niets uitspringt, met de echte uiterste waarden erbij,
    zodat de lezer de conclusie zelf kan narekenen. Een ontbrekend factorlabel
    is een bug en geen reden om de interne sleutel in klantcopy te zetten, dus
    die opzoeking faalt hard.
    """
    if not shape["flat"]:
        raise ValueError("_p02_flat_sentence: alleen bij een vlak profiel")
    telwoord = _TELWOORD[shape["n_factors"]]
    low = labels[shape["low_key"]]
    high = labels[shape["high_key"]]
    return (f"Geen enkel onderwerp springt eruit: alle {telwoord} liggen binnen "
            f"{_flat_span_woorden()} van elkaar "
            f"(laagste {low} {_score_str(shape['low_score'])}, "
            f"hoogste {high} {_score_str(shape['high_score'])}). "
            f"Dat is zelf de bevinding.")


# Onderwerpwoord per product voor de kernzin (spec ronde 2 par. 5.2, verfijnd
# naar drie producten): dezelfde structuur, de taal van het product. Per scan
# (zachte variant bij een of twee kwetsbare onderwerpen, brede variant vanaf
# drie). Indexeren en niet .get(): een onbekend product hoort hard te falen in
# plaats van de retention-copy in een ander rapport te zetten.
_P02_DRUKWOORD = {
    "retention": ("Behoud vraagt aandacht op", "Behoud staat breed onder druk"),
    "exit": ("Het vertrekbeeld wijst naar", "Het vertrekbeeld is breed"),
    "onboarding": ("De landing van nieuwe medewerkers vraagt aandacht op",
                   "De landing van nieuwe medewerkers staat breed onder druk"),
}

# Kop boven het why-blok bij een vlak profiel waarin zelfs de laagste factor
# relatief sterk scoort (spec ronde 2 par. 2.2): daar staat niets bovenaan
# omdat het slecht scoort, dus "Waarom X bovenaan staat" is de verkeerde vraag.
P02_WHY_TITLE_FLAT = "Waar Loep zou beginnen, en waarom"


def _p02_why_title(shape: dict[str, Any]) -> str:
    """De afwijkende why-kop, of leeg voor de gewone kop (spec ronde 2 par. 2.2).

    Alleen bij een vlak profiel waarin de laagste factor al in de bovenste band
    valt. ZONE_HIGH is dezelfde grens als _factor_label gebruikt voor "relatief
    sterk", dus de kop kan niet uit de pas lopen met de bandcel eronder.
    """
    return (P02_WHY_TITLE_FLAT
            if shape["flat"] and shape["low_score"] is not None
            and shape["low_score"] >= ZONE_HIGH
            else "")


def _p02_direction_key(direction_agg: dict[str, Any] | None,
                       primary_key: str | None) -> str | None:
    """"Niets nodig" alleen als dat over het hele profiel waar is.

    _p02_startpunt_zin schrijft bij none_needed dat je mensen NERGENS om
    verandering vragen. direction_state werkt per factor, dus die sleutel wordt
    hier alleen afgegeven als het startpunt in die staat staat en geen enkele
    andere factor met genoeg beantwoorders een andere richting laat zien.
    Anders geen sleutel: de per-factor-nuance staat al in _direction_p02_line,
    een paar regels lager op dezelfde pagina.

    REIKWIJDTE: dit evalueert direction_state voor elke factor, niet alleen voor
    het startpunt, en dat is nodig om "nergens" waar te maken. Het verbreedt wel
    een bestaande fail-loud: direction_state werpt ValueError bij answered >=
    DIRECTION_MIN_N met lege counts, en de submit-validatie laat een inzending
    met status answered zonder keuze toe. Drie daarvan op een willekeurige
    factor laten nu de hele rapportgeneratie falen, ook als die factor in geen
    enkele zin voorkomt. De echte oplossing ligt in die validatie (een status
    answered hoort een keuze te hebben), niet hier: stil overslaan zou van deze
    fail-loud een fail-fake maken.
    """
    if not direction_agg or not primary_key or primary_key not in direction_agg:
        return None
    # Via de smallere ingang, want deze functie heeft geen factorscore en
    # heeft er ook geen nodig: hij kijkt alleen of elke leesbare factor
    # none_needed zegt, en die staat wordt geevalueerd vóór split_none, de
    # enige score-afhankelijke staat (ronde 2 par. 4). direction_state zelf
    # eist de score, zodat een renderer hem niet stil kan vergeten.
    states = {fk: direction_none_needed_view(agg, fk) for fk, agg in direction_agg.items()}
    # too_few zegt niets over de richting en spreekt "nergens" dus ook niet tegen.
    leesbaar = [s for s in states.values() if s != "too_few"]
    if states[primary_key] == "none_needed" and all(s == "none_needed" for s in leesbaar):
        return "none_needed"
    return None


def _p02_startpunt_zin(primary_label: str, *, tie_break_kind: str | None,
                       change: tuple[int, int] | None,
                       change_other: tuple[str, int, int] | None,
                       next_delta: float | None,
                       direction_state_key: str | None,
                       primary_is_lowest: bool,
                       indicatief: bool = False) -> str:
    """Welk onderwerp Loep als startpunt kiest, met de grond erbij.

    Elke tak eist zijn eigen grond expliciet, zodat geen enkele zin iets beweert
    wat in deze meting niet meespeelde:

    - de vraag om verandering is comparatief, met beide tellingen, precies zoals
      de markeringsregel onder de rasterrij (_tie_break_note). Absoluut
      geformuleerd ("daar vragen de meeste mensen om verandering") kan dezelfde
      tie-break een minderheid als meerderheid presenteren: 2 van de 5 wint het
      van 0 van de 4 en beslist de volgorde terecht, maar is niet "de meeste".
      Een meerderheidseis zou de grond laten wegvallen terwijl het raster wel op
      dit signaal besliste, waarna p.02 en het raster elkaar tegenspreken.
    - "de laagste score" alleen als het startpunt ook echt de laagste factor is.
      Bij Loep Vertrek tilt de vertrekredenweging het startpunt daar weg, en
      binnen een gelijkspelgroep doet een tie-break dat ook.
    - "het verschil is klein" alleen binnen PRIORITY_TIE_MARGIN, de marge waarop
      de rangorde zelf van gelijkspel spreekt. Anders zou het getal in de zin de
      zin tegenspreken.
    - bij een exacte gelijkstand is de laagste score niet van dit onderwerp
      alleen, en "het verschil is klein (0,00)" oogt als een formatteerfout in
      plaats van als informatie. Die stand krijgt daarom haar eigen zin, die de
      gelijkstand benoemt in plaats van hem weg te rekenen: het verschil
      verzwijgen zou dezelfde stelligheid opleveren als voor ronde 2.

    Haalt geen enkele tak zijn voorwaarde, dan blijft de kale keuze over: die is
    altijd waar.

    `indicatief` (respons onder RESPONSE_INDICATIVE_RATE, spec par. 6.1) laat
    elke tak zichzelf voorzichtiger formuleren. Achteraf een tekenreeks
    vervangen werkte alleen in de takken waarin die reeks letterlijk voorkwam.
    """
    kiest = "Als mogelijk startpunt kiest Loep" if indicatief else "Als startpunt kiest Loep"
    if direction_state_key == "none_needed":
        # Indicatief blijft de waarneming staan, maar begrensd tot wat er ligt:
        # "je mensen" is bij een kwart van de groep een uitspraak over mensen
        # die niets hebben ingevuld.
        wie = "In wat is ingevuld vraagt niemand" if indicatief else "Je mensen vragen nergens"
        return (f"{wie} dringend om verandering. Bespreek of een "
                f"startpunt nu nodig is, of dat dit beeld eerst gedeeld wordt.")
    if tie_break_kind == "direction" and change and change_other:
        a, b = change
        ander_label, c, d = change_other
        return (f"{kiest} {primary_label}: daar vragen meer mensen "
                f"om verandering dan bij {ander_label} ({a} van de {b} tegen {c} van "
                f"de {d}).")
    if tie_break_kind is None and primary_is_lowest and next_delta is not None:
        if next_delta == 0.0:
            return (f"{kiest} {primary_label}. Dat onderwerp deelt "
                    f"de laagste score met het volgende; weeg die gelijkstand mee "
                    f"in de bespreking.")
        if 0.0 < next_delta < PRIORITY_TIE_MARGIN:
            # Komma en het woord "punt", zoals _flat_span_woorden en de
            # sectie-intro's ("onder de 5,0"): dit is een prozagetal over de
            # grootte van een gat, geen score. Scores houden in dezelfde alinea
            # hun punt en hun /10, zodat de twee soorten getallen uit elkaar te
            # houden zijn in plaats van als typefout te lezen.
            delta = f"{next_delta:.2f}".replace(".", ",")
            return (f"{kiest} {primary_label}, de laagste score. Het "
                    f"verschil met de volgende is klein, {delta} punt; weeg dat mee "
                    f"in de bespreking.")
    return f"{kiest} {primary_label}."


def _p02_shared_low(shape: dict[str, Any]) -> bool:
    """Deelt de laagst scorende factor zijn getoonde score met de volgende?

    Op de getoonde score, want dat is wat de lezer verderop in het
    overzichtsprofiel naast elkaar ziet staan. Zolang dat waar is, is "X scoort
    het laagst" geen uitspraak over X alleen.
    """
    pairs = shape["factors_low_to_high"]
    return len(pairs) > 1 and pairs[0][1] == pairs[1][1]


def _p02_opening(*, scan_type: str, shape: dict[str, Any], labels: dict[str, str],
                 primary_key: str | None,
                 tie_break_kind: str | None = None,
                 change: tuple[int, int] | None = None,
                 change_other: tuple[str, int, int] | None = None,
                 next_delta: float | None = None,
                 direction_state_key: str | None = None,
                 indicatief: bool = False) -> str:
    """De eerste zin van pagina twee (spec ronde 2 par. 2.2 en par. 5.2).

    Beweegt mee met hoeveel onderwerpen kwetsbaar scoren, en zegt het expliciet
    als er niets uitspringt. Voorheen volgde deze zin alleen de band van het
    totaalsignaal, waardoor "geen enkele factor kwetsbaar" en "alle zes
    kwetsbaar" structureel dezelfde zin kregen (bevinding B17).

    Zonder factorprofiel leeg: de degraded tak van _bestuurlijke_read (ronde 1,
    B2) draagt dan het verhaal.

    `indicatief` (respons onder RESPONSE_INDICATIVE_RATE, spec par. 6.1) reist
    door naar elke tak die een startpunt aanwijst, zodat die zich in de
    voorzichtige vorm OPBOUWT. Achteraf verzachten raakte alleen de takken
    waarin toevallig de vervangen tekenreeks stond.
    """
    if not shape["n_factors"] or primary_key is None:
        return ""
    k = shape["n_vulnerable"]
    zacht, breed = _P02_DRUKWOORD[scan_type]
    if k == 0 and shape["flat"]:
        kop = _p02_flat_sentence(shape, labels)
    elif k == 0:
        # De laagst scorende factor is NIET altijd het startpunt: bij Loep
        # Vertrek verschuift de vertrekredenweging de base, en binnen een
        # gelijkspelgroep kan richting, spreiding of verdieping de volgorde
        # bepalen. Vallen ze samen, dan mag de zin dat zeggen; verschillen ze,
        # dan noemt de zin ze apart en legt de bronregel eronder uit waarom.
        laagste = labels[shape["low_key"]]
        # Staan er twee onderwerpen op dezelfde getoonde score, dan is de laagste
        # score niet van dit onderwerp alleen; het overzichtsprofiel verderop
        # toont ze naast elkaar. Zelfde behandeling als de gelijkstand in
        # _p02_startpunt_zin.
        laagste_clause = (f"{laagste} deelt de laagste score met het volgende onderwerp"
                          if _p02_shared_low(shape) else f"{laagste} scoort het laagst")
        # Deze tak noemt het startpunt "gesprekspunt" in plaats van "startpunt",
        # dus hij heeft zijn eigen indicatieve vorm nodig.
        gesprekspunt = ("een mogelijk eerste gesprekspunt" if indicatief
                        else "het eerste gesprekspunt")
        kiest_gp = ("als mogelijk eerste gesprekspunt kiest Loep" if indicatief
                    else "als eerste gesprekspunt kiest Loep")
        if shape["low_key"] == primary_key:
            return (f"Geen onderwerp scoort kwetsbaar. {laagste_clause} "
                    f"en is {gesprekspunt}.")
        return (f"Geen onderwerp scoort kwetsbaar. {laagste_clause}; "
                f"{kiest_gp} {labels[primary_key]}.")
    elif k <= 2:
        # factors_low_to_high staat al in de canonieke volgorde (laagst eerst,
        # op de onafgeronde waarde), dus hier alleen filteren: opnieuw sorteren
        # op de getoonde score zou twee gelijk getoonde factoren omdraaien.
        vuln = [(fk, v) for fk, v in shape["factors_low_to_high"] if v < ZONE_LOW]
        # "één" met accent, zoals _flat_span_woorden: hier telt het onderwerpen,
        # en zonder accent leest "een onderwerp" als lidwoord in plaats van als
        # telwoord tegenover "twee onderwerpen".
        onderwerp = "één onderwerp" if k == 1 else "twee onderwerpen"
        # Komma en geen "en": bijna elk echt factorlabel bevat zelf al "en"
        # ("Rolhelderheid en verwachtingen eerste 90 dagen"), en met een
        # voegwoord ertussen staat er vier keer "en" in één opsomming. Na de
        # dubbele punt leest dit als lijst, niet als nevenschikking.
        namen = ", ".join(f"{labels[fk]} ({_score_str(v)})" for fk, v in vuln)
        kop = f"{zacht} {onderwerp}: {namen}."
    else:
        kop = (f"{breed}: {k} van de {shape['n_factors']} onderwerpen scoren "
               f"kwetsbaar.")
    return f"{kop} " + _p02_startpunt_zin(
        labels[primary_key], tie_break_kind=tie_break_kind, change=change,
        change_other=change_other, next_delta=next_delta,
        direction_state_key=direction_state_key,
        primary_is_lowest=shape["low_key"] == primary_key,
        indicatief=indicatief)


def _p02_startpunt_gronden(
        raster_rows: list[dict[str, Any]],
) -> tuple[str | None, tuple[int, int] | None, tuple[str, int, int] | None, float | None]:
    """De grond onder de startpuntregel op p.02, uit de rangorde zelf.

    Levert (tie-break-signaal, richtingtelling van het startpunt, richtingtelling
    van de rij waartegen dat besliste, afstand tot de volgende rij). decided_by
    komt uit rank_factors, dus de grond in de kernzin kan niet afwijken van de
    volgorde die de lezer verderop in het raster ziet, en de vergelijkingsrij is
    dezelfde die de markeringsregel onder die rij noemt.

    Ontbreekt een van beide tellingen, dan blijven ze allebei leeg: een
    comparatieve zin met maar een kant is geen vergelijking.
    """
    if not raster_rows:
        return None, None, None, None
    top = raster_rows[0]
    decided = top["decided_by"]
    kind = decided["kind"] if decided else None
    change = change_other = None
    if kind == "direction":
        ander = next((r for r in raster_rows if r["key"] == decided["other"]), None)
        if (top["direction_change"] is not None and ander is not None
                and ander["direction_change"] is not None):
            change = (top["direction_change"], top["direction_answered"])
            change_other = (ander["label"], ander["direction_change"],
                            ander["direction_answered"])
    delta = (round(raster_rows[1]["score"] - top["score"], 2)
             if len(raster_rows) > 1 else None)
    return kind, change, change_other, delta


def _p02_signal_cell(label: str, value: str, band: str) -> str:
    """Het totaalsignaal met zijn band, als cel in de onderbouwingsrij van p.02.

    Stond tot ronde 2 in de kernzin; die plek is nu van de zin over de vorm van
    het profiel. Leeg zonder waarde of band: een cel met een gat erin is geen
    eerlijke degradatie maar een kaal veld.
    """
    if not value or not band:
        return ""
    return (f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v">{_h(value)}</div>'
            f'<div class="sc-b">{_h(band)}</div></td>')


# ─── Respons heeft gevolgen (spec ronde 2 par. 6) ────────────────────────────
# Bevinding B19: 30% respons en 90% respons leverden structureel hetzelfde
# rapport op. Onder de helft is het beeld dat van wie meedeed, niet van de
# organisatie; onder de 30% is het hooguit indicatief. Beide vergelijken STRIKT
# kleiner dan, zodat precies de helft geen waarschuwing krijgt en precies 30%
# (scenario 16) wel de waarschuwing maar niet het indicatieve label haalt.
RESPONSE_CAUTION_RATE = 0.5
RESPONSE_INDICATIVE_RATE = 0.3


def _respons_noemer(record_invited: int | None, *, rows: int,
                    completed: int) -> tuple[int | None, str]:
    """(aantal genodigden, zin die zegt waarom dat aantal er niet is).

    Volgorde (spec ronde 2 par. 6.1):

    1. het handmatig vastgelegde aantal uit het delivery record, mits dat niet
       lager is dan het aantal ingevulde vragenlijsten (dat zou meer dan 100%
       respons opleveren; bij self-send is het aantal handmatig ingevoerd en de
       campagnelink open, dus die stand is bereikbaar);
    2. anders het aantal respondentrijen, maar alleen als dat groter is dan het
       aantal afgeronde vragenlijsten. Bij de self-send-flow bestaat er geen rij
       voor wie niet invulde, dus daar is elke rij een ingevulde vragenlijst en
       zou deze noemer een respons van 100% suggereren;
    3. anders onbekend. Liever geen getal dan een onwaar getal.

    Regel 1 gaat vóór regel 2: bij een managed campagne met een handmatig
    ingevuld aantal zijn ze allebei waar, en dan is het vastgelegde aantal de
    bedoelde noemer.

    Zodra er een noemer is, is de tweede waarde leeg. Is die er niet, dan zegt
    de zin WELKE van de twee redenen dat is. "Geen noemer" dekt namelijk twee
    verschillende werkelijkheden, en er één van beweren is precies de
    stelligheid die deze ronde wegneemt:

    - er is een aantal vastgelegd, maar dat is LAGER dan het aantal ingevulde
      vragenlijsten (meer dan 100% respons, dus onbruikbaar). Dan noemt de zin
      beide getallen, zodat de operator ziet wat er niet klopt en het kan
      herstellen. "Niet vastgelegd" zou juist hem op het verkeerde been zetten;
    - er is niets vastgelegd en er zijn evenveel deelnemers bekend als
      ingevulde vragenlijsten. Dat is self-send zonder ingevuld aantal, maar het
      is ook een managed campagne waarin iedereen invulde, en die twee zijn in
      de data niet uit elkaar te houden. De zin zegt daarom alleen wat zeker is:
      Loep kan het aantal genodigden niet vaststellen.
    """
    if record_invited and record_invited >= completed:
        return record_invited, ""
    if rows > completed:
        return rows, ""
    if record_invited:
        # Hier alleen bereikbaar als het vastgelegde aantal te laag is én er
        # geen echte non-responderrijen zijn: pas dan valt er niets te rekenen.
        return None, (f"Het vastgelegde aantal genodigden ({record_invited}) is lager "
                      f"dan het aantal ingevulde vragenlijsten ({completed}). Loep "
                      f"rekent daar geen responspercentage uit; controleer het "
                      f"vastgelegde aantal.")
    return None, ("Loep kan niet vaststellen hoeveel mensen zijn uitgenodigd: er is "
                  "geen aantal genodigden vastgelegd. Het responspercentage staat "
                  "daarom niet in dit rapport.")


def _response_rate(completed: int, invited: int | None) -> float | None:
    """Responsgraad, of None als het aantal genodigden niet bekend is."""
    if not invited or invited <= 0:
        return None
    return completed / invited


def _respons_pct(completed: int, invited: int | None) -> int | None:
    """Het afgeronde responspercentage, of None zonder noemer."""
    rate = _response_rate(completed, invited)
    return None if rate is None else round(rate * 100)


def _respons_caution(completed: int, invited: int | None, note: str) -> str:
    """De zin bij de responsbasis; leeg zodra de respons de helft haalt.

    Zonder noemer is `note` de zin uit `_respons_noemer` die zegt waarom er geen
    percentage staat. Ontbreekt die, dan is dat een bug en geen reden om het
    zwijgend zonder uitleg te laten: de responsbasis toont dan een tabel waar
    twee cellen uit verdwenen zijn en niets dat zegt waarom.
    """
    rate = _response_rate(completed, invited)
    if rate is None:
        if not note:
            raise ValueError("_respons_caution: zonder noemer hoort er een note te zijn")
        return note
    if rate >= RESPONSE_CAUTION_RATE:
        return ""
    zin = (f"Minder dan de helft heeft ingevuld ({completed} van de {invited}). "
           f"Lees de uitkomsten als het beeld van wie meedeed, niet van de hele "
           f"organisatie.")
    if rate < RESPONSE_INDICATIVE_RATE:
        # De halve-drempel legt zichzelf uit ("minder dan de helft"); de
        # 30%-drempel niet. Hij werkt op de eerste zin van dit rapport, dus
        # staat hier in één zin wat hij daar doet.
        zin += (f" Onder de {round(RESPONSE_INDICATIVE_RATE * 100)}% noemt Loep het "
                f"beeld indicatief: de eerste zin van dit rapport wijst dan een "
                f"mogelijk startpunt aan, geen vastgesteld startpunt.")
    return zin


def _respons_kernzin_staart(completed: int, invited: int | None) -> tuple[str, bool]:
    """(staart achter de kernzin, is het beeld indicatief).

    Zonder noemer geen staart: die zou een getal moeten noemen dat er niet is.
    De responsbasis zegt daar in een hele zin wat er niet bekend is.
    """
    rate = _response_rate(completed, invited)
    if rate is None or rate >= RESPONSE_CAUTION_RATE:
        return "", False
    return (f" (op basis van {completed} van de {invited} genodigden)",
            rate < RESPONSE_INDICATIVE_RATE)


def _respons_indicatief(completed: int, invited: int | None) -> bool:
    """Is het beeld indicatief? Stuurt de formulering van de kernzin zelf.

    Los opvraagbaar omdat _p02_opening de zin met die stand moet OPBOUWEN.
    Achteraf een tekenreeks vervangen raakte alleen de takken waarin die reeks
    letterlijk voorkwam, waardoor drie van de vijf varianten (de tak zonder
    kwetsbare onderwerpen en de "nergens dringend"-tak) even stellig bleven.
    """
    return _respons_kernzin_staart(completed, invited)[1]


def _p02_respons_prefix(zin: str, *, indicatief: bool) -> str:
    """Het label voor de kernzin bij een zeer lage respons.

    Alleen het label: de zin zelf is al in de indicatieve vorm opgebouwd.
    """
    return f"Indicatief beeld: {zin}" if indicatief else zin


def _p02_met_respons(zin: str, *, completed: int, invited: int | None,
                     verwijzing: bool = False) -> str:
    """De kernzin met de gevolgen van de respons erin verwerkt.

    Aangeroepen door alle drie de renderers, ná de terugval zonder
    factorprofiel (bug B2): juist een rapport zonder factorprofiel staat op een
    dunne basis, dus daar hoort de noemer ook in de kernzin te staan.

    De staart gaat BINNEN de laatste zin, niet erachter: achter de punt blijft
    een losse haakjeszin over, terwijl hij juist de zin relativeert waar hij
    aan hangt.

    `verwijzing=True` voor de ene terugval die geen uitspraak doet maar alleen
    doorverwijst ("Zie de vertrekcontext ... voor wat dit rapport wel toont").
    Daar hoort de responsbasis als eigen mededeling vóór de verwijzing, niet als
    haakje erachter: een haakje relativeert een claim, en die staat er niet.
    """
    staart, indicatief = _respons_kernzin_staart(completed, invited)
    if verwijzing:
        if not staart:
            return zin
        return f"Dit rapport rust op {completed} van de {invited} genodigden. {zin}"
    zin = _p02_respons_prefix(zin, indicatief=indicatief)
    if not staart:
        return zin
    if zin.endswith("."):
        return f"{zin[:-1]}{staart}."
    return f"{zin}{staart}"


def _cover_respons_stat(completion_pct: float | None) -> tuple[str, str]:
    """De responstegel op de cover, afgerond zoals de responsbasis hem toont.

    Zonder noemer staat er geen percentage: completion_pct is dan None en een
    0% op de cover zou een getal zijn dat niemand heeft gemeten.
    """
    if completion_pct is None:
        return ("Respons", "Onbekend")
    return ("Respons", f"{round(completion_pct)}%")


def _factor_color(score: float | None) -> str:
    # Zelfde gedempte RAG-set als de balken (_rag_color): voorheen gebruikte deze
    # functie felle tailwind-tinten (#EF4444/#F59E0B/#22C55E), waardoor er drie
    # ambers in het rapport zaten (merk #E8A020, fel #F59E0B, RAG #C17C00) en een
    # waarschuwingskleur eerder als huisstijl las. Eén betekenis-set, visueel
    # onderscheiden van het merkaccent. Drempels op de getoonde score (B15).
    # Zelfde ladder als de spreidingsstrook, via zone_color (dat afrondt, B15);
    # alleen de kleur voor "geen score" wijkt af van _rag_color.
    if score is None:  return "#94A3B8"
    return zone_color(score)

def _h(s: Any) -> str:
    return "" if s is None else _esc(str(s))

def _score_str(v: float | None) -> str:
    # "n.b." en niet "&#x2014;" (bug B2): de oude waarde was een HTML-entity in
    # een str, dus alleen veilig in een niet-geescapete f-string. Zodra de
    # uitkomst door _h() ging (kernzin p.02) verscheen "&amp;#x2014;" letterlijk
    # op de pagina. "n.b." overleeft escaping en is bovendien de placeholder
    # die de appendix- en segmenttabellen al gebruiken.
    return f"{v:.1f}/10" if v is not None else "n.b."

def _scale_to_10(raw: float, reverse: bool = False) -> float:
    r = 6.0 - raw if reverse else raw
    return round((r - 1) / 4 * 9 + 1, 2)


# ─── SVG visualisaties ────────────────────────────────────────────────────────

def _gauge_svg(score: float | None, label: str, color: str, width: int = 240) -> str:
    """SVG halve-cirkel meter. Score 1-10, vult van links naar rechts via de top."""
    s  = score or 1.0
    cx = width // 2
    cy = int(width * 0.42)
    r  = int(width * 0.31)
    sw = 16

    proportion = max(0.01, min(0.99, (s - 1) / 9.0))
    angle      = math.pi * (1.0 - proportion)
    ex = cx + r * math.cos(angle)
    ey = cy - r * math.sin(angle)

    h  = cy + 38
    return (
        f'<svg width="{width}" height="{h}" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {cx+r} {cy}" '
        f'fill="none" stroke="#E8E0D0" stroke-width="{sw}" stroke-linecap="round"/>'
        f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {ex:.1f} {ey:.1f}" '
        f'fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>'
        f'<text x="{cx}" y="{cy-8}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="#243247">{s:.1f}</text>'
        f'<text x="{cx}" y="{cy+10}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#94A3B8">/10</text>'
        f'<text x="{cx}" y="{cy+30}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="{color}">{_h(label)}</text>'
        f'<text x="{cx-r-4}" y="{cy+5}" text-anchor="end" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="8" fill="#CBD5E1">1</text>'
        f'<text x="{cx+r+4}" y="{cy+5}" text-anchor="start" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="8" fill="#CBD5E1">10</text>'
        f'</svg>'
    )


def _bar_chart_svg(items: list[tuple[str, float, str]], max_val: float = 10.0,
                   width: int = 380, bar_h: int = 22, gap: int = 10) -> str:
    """Horizontale barchart als SVG. items = [(label, value, color)]"""
    lbl_w  = 160
    val_w  = 40
    bar_w  = width - lbl_w - val_w - 20
    total_h = len(items) * (bar_h + gap) + 4
    rows   = ""
    for i, (lbl, val, col) in enumerate(items):
        y     = i * (bar_h + gap)
        fill_w = round(max(2, val / max_val * bar_w))
        rows += (
            f'<text x="{lbl_w - 8}" y="{y + bar_h*0.68:.0f}" text-anchor="end" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#374151">{_h(lbl[:28])}</text>'
            f'<rect x="{lbl_w}" y="{y}" width="{bar_w}" height="{bar_h}" rx="3" fill="#F1F5F9"/>'
            f'<rect x="{lbl_w}" y="{y}" width="{fill_w}" height="{bar_h}" rx="3" fill="{col}"/>'
            f'<text x="{lbl_w + bar_w + 6}" y="{y + bar_h*0.68:.0f}" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" fill="{col}">{val:.1f}</text>'
        )
    return (f'<svg width="{width}" height="{total_h}" xmlns="http://www.w3.org/2000/svg">'
            f'{rows}</svg>')


def _reason_chart_svg(items: list[tuple[str, int]], total: int,
                      width: int = 400, bar_h: int = 18, gap: int = 8) -> str:
    """Horizontale barchart voor vertrekredenen. items = [(label, count)]"""
    lbl_w  = 170
    pct_w  = 65
    bar_w  = width - lbl_w - pct_w - 10
    total_h = len(items) * (bar_h + gap) + 4
    rows   = ""
    max_n  = max(c for _, c in items) if items else 1
    for i, (lbl, cnt) in enumerate(items):
        y     = i * (bar_h + gap)
        pct   = cnt / total * 100 if total else 0
        fill_w = round(max(2, cnt / max_n * bar_w))
        rows += (
            f'<text x="{lbl_w - 8}" y="{y + bar_h*0.72:.0f}" text-anchor="end" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#374151">{_h(lbl[:30])}</text>'
            f'<rect x="{lbl_w}" y="{y}" width="{bar_w}" height="{bar_h}" rx="3" fill="#F1F5F9"/>'
            f'<rect x="{lbl_w}" y="{y}" width="{fill_w}" height="{bar_h}" rx="3" fill="#1E293B"/>'
            f'<text x="{lbl_w + bar_w + 6}" y="{y + bar_h*0.72:.0f}" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#64748B">{pct:.0f}% ({cnt}x)</text>'
        )
    return (f'<svg width="{width}" height="{total_h}" xmlns="http://www.w3.org/2000/svg">'
            f'{rows}</svg>')


def _stacked_bar_svg(segments: list[tuple[str, int, str]],
                     total: int, width: int = 460, height: int = 26) -> str:
    """Horizontale gestapelde balk. segments = [(label, count, color)]"""
    parts = ""
    x = 0
    for lbl, cnt, col in segments:
        if cnt == 0: continue
        w = round(cnt / total * width)
        pct = round(cnt / total * 100)
        if w > 20:
            parts += (f'<rect x="{x}" y="0" width="{w}" height="{height}" fill="{col}"/>'
                      f'<text x="{x + w//2}" y="{height*0.68:.0f}" text-anchor="middle" '
                      f'font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#FFF">{pct}%</text>')
        else:
            parts += f'<rect x="{x}" y="0" width="{w}" height="{height}" fill="{col}"/>'
        x += w
    return (f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
            f'<rect x="0" y="0" width="{width}" height="{height}" rx="4" fill="#E8E0D0"/>'
            f'{parts}</svg>')


def _mini_bar_svg(score: float | None, color: str, width: int = 70, height: int = 6) -> str:
    if score is None: return ""
    w = round(max(2, score / 10 * width))
    return (f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
            f'<rect x="0" y="0" width="{width}" height="{height}" rx="2" fill="#E8E0D0"/>'
            f'<rect x="0" y="0" width="{w}" height="{height}" rx="2" fill="{color}"/>'
            f'</svg>')


# ─── Document wrapper ─────────────────────────────────────────────────────────

def _doc(title: str, body: str, scan_type: str = "exit") -> str:
    return (f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">'
            f'<title>{_h(title)}</title><style>{build_css(scan_type)}</style></head>'
            f'<body>{body}</body></html>')


# ─── Shared blocks ────────────────────────────────────────────────────────────

# B10: langer dan dit -> kleiner corps, breekt binnen de kolom. 18 tekens is
# ongeveer een volle regel Inter Tight 700 op 22px in een kolom van een derde
# van de covermeta (~209px); bij een ander corps of andere padding opnieuw meten.
_COVER_VALUE_LONG_CHARS = 18


def _cover_value_class(value: str) -> str:
    return "cmv cmv-long" if len(value) > _COVER_VALUE_LONG_CHARS else "cmv"


def _cover(*, scan_label: str, scan_type: str, org_name: str, period: str,
           opening_question: str, stats: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<div class="cmc"><div class="cml">{_h(label)}</div>'
        f'<div class="{_cover_value_class(value)}">{_h(value)}</div></div>'
        for label, value in stats[:3]
    )
    return f"""<div class="cover">
  <div class="cover-rings"></div>
  <div class="cover-top">
    <div class="cwm">Loep<span class="dot">.</span></div>
    <div class="cconf">VERTROUWELIJK</div>
  </div>
  <div class="ceyebrow">{_h(scan_label)}</div>
  <div class="cbar"></div>
  <h1 class="ctitle">{_h(opening_question)}</h1>
  <div class="csub">{_h(org_name)} &nbsp;&middot;&nbsp; {_h(period)} &nbsp;&middot;&nbsp; Managementrapport</div>
  <div class="cmeta"><div class="cmeta-row">{cells}</div></div>
</div>"""


# ─── Zelfuitleg-laag (spec 2026-07-13 §2) ────────────────────────────────────
# Elke sectie legt zichzelf uit: wat zie je, waarom meten we dit, hoe lees je
# het. Uitleg is een vertrouwensdrager — ruim en helder, geen disclaimers.
#
# LET OP bij het schrijven of verplaatsen van copy: _intro() rendert deze
# waarden UNESCAPED — non-ASCII moet hier dus als HTML-entity (&eacute;,
# &ldquo;, &minus;, ...). Dat is het omgekeerde van _trust_page-cellen, die
# door _h() gaan en juist letterlijke Unicode nodig hebben. Een string die
# tussen de twee verhuist zonder die aanpassing is precies de fout die dit
# codereview-taak (9) maakte.

SECTION_INTROS: dict[str, str] = {
    # Zonder factorprofiel is het hoofdstuk overzichtsprofiel leeg (het zegt
    # daar zelf dat er geen scores per factor berekend zijn). De verwijzing
    # naar dat hoofdstuk stuurde de lezer dan naar een lege pagina; de
    # samenstelling van het signaal blijft zonder die verwijzing gewoon waar,
    # dus vervalt hij in beide staten (review ronde 2).
    "behoudscontext": (
        "Het behoudssignaal is een samenvattende groepsscore: de werkfactoren en de "
        "werkbeleving samen, teruggebracht tot &eacute;&eacute;n getal "
        "tussen 1 en 10. Hoe hoger, hoe beter. "
        "Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een "
        "aandachtspunt, vanaf 6,5 relatief sterk. De drie signalen daaronder geven context: "
        "bij vertrekintentie leest een hoge score juist als meer vertrekgedachten, bij de "
        "andere twee is hoog weer beter. "
        "Blijfintentie en vertrekintentie zijn geen spiegelbeeld van elkaar (iemand kan "
        "beide tegelijk voelen), en bevlogenheid staat daar los van: bevlogen medewerkers "
        "vertrekken soms toch. Dit rapport wijst aan waar het gesprek moet beginnen. "
        "Het doet bewust geen uitspraken over individuen."
    ),
    "vertrekcontext": (
        "Deze pagina zet de vertrekredenen op een rij zoals vertrokken medewerkers ze zelf "
        "opgaven: eerst de hoofdreden, daarna wat er volgens hen meespeelde. Samen met de "
        "factorscores verderop laat dit zien of de opgegeven redenen en het bredere werkbeeld "
        "hetzelfde verhaal vertellen. Lees dit als de context waarin de rest van het rapport "
        "staat: het beschrijft waarom mensen zeggen te vertrekken, niet wie er nog zal vertrekken."
    ),
    # Zonder factorprofiel valt de middelste zin weg: die belooft factorscores
    # verderop in een rapport dat ze niet heeft (eind-tot-eind-lezing van
    # stresstest 07). De rest van de alinea blijft woordelijk gelijk.
    "vertrekcontext_geen_profiel": (
        "Deze pagina zet de vertrekredenen op een rij zoals vertrokken medewerkers ze zelf "
        "opgaven: eerst de hoofdreden, daarna wat er volgens hen meespeelde. Lees dit als de "
        "context waarin de rest van het rapport staat: het beschrijft waarom mensen zeggen te "
        "vertrekken, niet wie er nog zal vertrekken."
    ),
    # Zelfde correctie als bij behoudscontext: de landingskwaliteit staat
    # direct onder deze intro en zegt bij een leeg profiel "geen scores per
    # domein berekend". "uit dit rapport" beloofde daar domeinen die op die
    # pagina ontbreken.
    "checkpointoverzicht": (
        "De checkpointscore vat samen hoe nieuwe medewerkers hun eerste werkperiode ervaren: "
        "de landingsdomeinen samengebracht tot &eacute;&eacute;n getal tussen "
        "1 en 10. Hoe hoger, hoe beter. "
        "Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een "
        "aandachtspunt, vanaf 6,5 relatief sterk. Dit is een momentopname van de landing: "
        "een startpunt voor het gesprek over onboarding, geen beoordeling van individuele "
        "starters of hun begeleiders."
    ),
    # Alleen het gedeelde deel; de rangorde-zin is scan-afhankelijk en staat in
    # OVERZICHTSPROFIEL_RANGORDE hieronder. _overzichtsprofiel plakt de twee
    # aan elkaar in dezelfde <p>.
    "overzichtsprofiel": (
        "Elke factor hieronder is een thema, gemeten met drie stellingen over hetzelfde thema; "
        "de score is het groepsgemiddelde daarvan. De kleuren volgen vaste drempels "
        "(kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, relatief sterk vanaf 6,5) "
        "en zijn geen vergelijking met andere organisaties."
    ),
    "verdieping": (
        "Respondenten die laag scoorden op dit thema kregen automatisch een korte vervolgvraag: "
        "welke toelichting past het best bij hun ervaring? De aantallen hieronder zijn tellingen "
        "van wat respondenten zelf kozen, geen interpretatie achteraf. Zo zie je niet alleen "
        "d&aacute;t een thema laag scoort, maar ook wat de groep zelf als reden aandraagt. "
        "Wat er volgens hen moet gebeuren staat bij de gespreksagenda."
    ),
    "werkbeleving": (
        "Naast de werkfactoren meten we drie psychologische basisbehoeften: autonomie (regie "
        "over de eigen werkwijze), competentie (ervaren bekwaamheid) en verbondenheid (de band "
        "met collega's en organisatie). Onderzoek naar werkmotivatie laat consistent zien dat "
        "deze drie bepalen hoe duurzaam iemand op zijn plek zit. Werkfactoren alleen "
        "vertellen niet het hele verhaal. Een lage werkfactor met een gezonde werkbeleving "
        "vraagt een ander gesprek dan wanneer beide onder druk staan."
    ),
    "werkgeversaanbeveling": (
        "De aanbevelingsscore (eNPS) meet &eacute;&eacute;n ding: zouden medewerkers deze "
        "organisatie aanraden als werkgever? De score loopt van &minus;100 tot +100 en is het "
        "verschil tussen het aandeel uitgesproken aanraders en het aandeel criticasters. "
        "Lees dit als aanvullende context: het zegt iets over het totaalgevoel, niet waar "
        "dat gevoel vandaan komt."
    ),
    "segmentanalyse": (
        "Deze tabel splitst het beeld uit per afdeling: het aantal ingevulde vragenlijsten "
        "tegenover het aantal uitgenodigden, de gemiddelde score en, bij voldoende "
        "responses, de spreiding. Afdelingen met minder dan vijf responses worden "
        "gebundeld onder &ldquo;Overige afdelingen&rdquo;, zodat antwoorden nooit herleidbaar "
        "zijn tot personen. Verschillen tussen afdelingen zijn gesprekstof: ze vertellen waar "
        "je als eerste gaat kijken, niet welke afdeling het &ldquo;slecht doet&rdquo;. "
        "De kolom met het laagste thema toont per afdeling de werkfactor die daar het laagst "
        "scoort. Bij kleine afdelingen (5 tot 9 responses) tonen we bewust alleen een "
        "duidingslabel, geen cijfer achter de komma; het volledige factorbeeld per afdeling "
        "opent vanaf 10 responses."
    ),
    "open_toelichtingen": (
        "Dit zijn de open antwoorden zoals respondenten ze zelf schreven, alleen ontdaan van "
        "namen en contactgegevens. Ze staan in ontvangstvolgorde: er is niet geselecteerd "
        "op inhoud en er is geen automatische duiding op losgelaten. De stemmen hieronder geven "
        "kleur aan de cijfers; wat ze betekenen en hoe zwaar ze wegen, bepaal je in de bespreking."
    ),
    "appendix": (
        "Hier staat elke stelling met haar groepsgemiddelde: de volledige onderbouwing "
        "van de factorscores eerder in dit rapport. Gebruik deze pagina's om te controleren "
        "waar een factorscore vandaan komt of om een specifieke stelling terug te vinden die "
        "in de bespreking ter sprake komt."
    ),
    "gespreksagenda": (
        "Alles wat je tot hier las is de onderbouwing; hier begint het gesprek. Deze agenda "
        "vat samen wat als eerste op tafel hoort, waarom juist dat, en wanneer je erop "
        "terugkomt. Het is bewust geen kant-en-klaar actieplan: de keuzes (wat pakken "
        "we op, wie is eigenaar) maak je in de begeleide managementbespreking, met dit "
        "rapport als gedeelde basis."
    ),
}


# Rangorde-zin van het overzichtsprofiel, per scan (bug B1, stresstest ronde 1).
# De oude gedeelde zin ("de factor die het laagst scoort, is het logische begin
# van het gesprek") is bij Loep Vertrek en Loep Behoud onwaar: daar bepaalt
# _prioriteringsraster het startpunt, en een spreidings- of verdiepingsvlag
# (of bij Vertrek de vertrekreden-weging) kan een andere factor dan de laagste
# bovenaan zetten. Loep Start heeft geen raster en rangschikt wel puur op score
# (_select_priority_factors met lege vertrekredenen), dus daar klopt de oude
# regel juist. Een zin die voor alle drie waar is, bestaat niet.
#
# Deze waarden worden net als SECTION_INTROS UNESCAPED gerenderd: non-ASCII
# hier als HTML-entity (&ldquo;, &rdquo;, ...).
OVERZICHTSPROFIEL_RANGORDE: dict[str, str] = {
    "exit": (
        "Belangrijker dan de absolute kleur is de rangorde. Welke factor het gesprek "
        "begint, bepaalt Loep niet op de score alleen: bij de gespreksagenda verderop "
        "zie je per factor welke signalen meewogen in de volgorde."
    ),
    "onboarding": (
        "Belangrijker dan de absolute kleur is de rangorde: het thema dat binnen jullie "
        "eigen beeld het laagst scoort, staat verderop als eerste in de verdieping en in "
        "de gespreksagenda."
    ),
}
# Loep Behoud deelt de raster-variant met Loep Vertrek: beide renderen
# _prioriteringsraster. Als alias, niet als kopie, zodat de twee niet uit
# elkaar kunnen lopen bij een copy-wijziging.
OVERZICHTSPROFIEL_RANGORDE["retention"] = OVERZICHTSPROFIEL_RANGORDE["exit"]


def _intro(key: str) -> str:
    return f'<p class="sec-intro">{SECTION_INTROS[key]}</p>'


GEBRUIKSBLOK_LEESROUTE = (
    "Lees het van voor naar achter: eerst het beeld (context en "
    "overzichtsprofiel), dan de verdieping per thema, en achteraan de "
    "gespreksagenda: d&aacute;&aacute;r begint het gesprek.")

# Loep Start-variant (spec ronde 2 par. 7): die hoofdstukken heten geen
# "Verdieping" meer, want er zijn geen verdiepingsvragen. De leesroute noemt de
# hoofdstukken zoals ze in het rapport heten, anders stuurt hij naar een
# hoofdstuk dat onder die naam niet bestaat.
GEBRUIKSBLOK_LEESROUTE_ONBOARDING = (
    "Lees het van voor naar achter: eerst het beeld (context en "
    "overzichtsprofiel), dan de thema&#x27;s met de meeste aandacht, en "
    "achteraan de gespreksagenda: d&aacute;&aacute;r begint het gesprek.")

# Degraded leesroute (bug B3): zonder factorprofiel is er geen verdieping per
# thema en geen volgorde van thema's. De normale zin stuurde de lezer dan naar
# twee secties die leeg of gedegradeerd zijn. De gespreksagenda-pagina zelf
# bestaat wél in elke staat (met gespreksopener, en bij richtingdata het
# degraded richtingblok), dus daar mag de zin nog naar verwijzen.
GEBRUIKSBLOK_LEESROUTE_DEGRADED = (
    "Lees het van voor naar achter: eerst wat dit rapport wel en niet laat "
    "zien, daarna de context en de werkbeleving. Een verdieping per "
    "thema en een volgorde van thema&#x27;s staan er nog niet in; achteraan "
    "lees je waar het gesprek kan beginnen.")


def _gebruiksblok(scan_lbl: str, *, degraded: bool = False,
                  leesroute: str = "") -> str:
    """'Zo gebruik je dit rapport' (spec 2026-07-13 §5) — leesroute + beoogd
    besluit. Geen bespreekscript: de begeleide bespreking blijft het product.

    degraded volgt dezelfde schakelaar als de degraded p.02-alinea
    (_geen_factorprofiel_note): de leesroute mag alleen naar secties sturen
    die in deze staat ook echt iets bevatten.

    leesroute overschrijft de standaardroute voor een product waar de
    hoofdstukken anders heten (Loep Start, spec ronde 2 par. 7). De degraded
    route gaat voor: die zegt zelf al dat een verdieping per thema ontbreekt."""
    leesroute = (GEBRUIKSBLOK_LEESROUTE_DEGRADED if degraded
                 else (leesroute or GEBRUIKSBLOK_LEESROUTE))
    return f"""<div style="margin-top:24px;">
  <span class="eyebrow">Zo gebruik je dit rapport</span>
  <p class="sec-intro" style="margin-top:6px;margin-bottom:0;">
    Dit rapport is een groepsbeeld van de organisatie, geen beoordeling van personen
    of afdelingen. {leesroute} De {scan_lbl}-uitkomsten worden besproken in een
    begeleide managementbespreking: het rapport levert de onderbouwing, de bespreking de
    keuzes. Het doel aan het eind van die bespreking is meestal simpel: &eacute;&eacute;n prioriteit,
    &eacute;&eacute;n eigenaar en een vervolgmoment.
  </p>
</div>"""


class _ChapterCounter:
    """Afgeleide hoofdstuknummering (designsprong §4): elke renderer maakt één
    instantie en roept opener() aan op het moment dat een sectie daadwerkelijk
    wordt geëmit — conditionele secties schuiven zo op zonder gaten.
    vervolg() geeft het compacte label voor doorlooppagina's (verdieping 2+)."""

    def __init__(self) -> None:
        self.n = 0

    def opener(self, title: str, *, kicker: str | None = None) -> str:
        # Titel naast het hoofdstuknummer, beide in dezelfde amber (feedback
        # 2026-07-16): de titel is het dominante element van de paginakop, de
        # kicker eronder blijft klein en ondergeschikt.
        self.n += 1
        kicker_html = f'<span class="ch-kicker">{kicker}</span>' if kicker else ""
        return (f'<div class="ch-head"><span class="ch-idx">{self.n:02d}</span>'
                f'<h2 class="ch-title">{title}</h2></div><hr class="ch-rule">'
                f'{kicker_html}')

    @staticmethod
    def vervolg(eyebrow: str) -> str:
        return f'<span class="slabel">{eyebrow} (vervolg)</span>'


# Standaardwaarde voor het derde coverstatistiek als er geen factorprofiel is
# (bug B2): de cover toonde daar een kale streep waar een factornaam hoort.
GEEN_FACTORPROFIEL_LBL = "Nog geen factorprofiel"

# Lege staat van het verdiepingshoofdstuk (review ronde 2). Stond nog op
# "Factor detail beschikbaar na voldoende patroonduiding", terwijl pagina twee
# in diezelfde staat zegt dat een verdieping per thema en een volgorde van
# thema's er nog niet in staan. Nu dezelfde vorm als de andere lege staten
# ("Voor deze meting zijn er geen scores per ..."), met de reden erbij.
#
# Het hoofdstuk blijft bestaan in plaats van te verdwijnen: net als de
# rasterpagina, die bij lege data ook blijft staan en zelf benoemt dat er geen
# rangorde is. Onderdrukken zou het hoofdstuk ook laten verdwijnen in de staat
# waarin er wel factorscores zijn maar geen prioritaire selectie -- daar toont
# pagina twee nog de normale leesroute ("dan de verdieping per thema") en zou
# een ontbrekend hoofdstuk een nieuwe tegenstrijdigheid opleveren.
VERDIEPING_GEEN_RANGORDE = (
    "Voor deze meting zijn er geen scores per factor berekend. Zonder die "
    "scores is er geen rangorde om een verdieping aan op te hangen."
)

# Dezelfde lege staat, maar in de woorden van Loep Start (spec ronde 2 par. 7):
# dat rapport heeft geen verdieping om aan een rangorde op te hangen, dus die
# belofte hoort hier niet.
ONBOARDING_GEEN_RANGORDE = (
    "Voor deze meting zijn er geen scores per factor berekend. Zonder die "
    "scores is er geen volgorde om de factoren met de meeste aandacht aan te wijzen."
)

# Loep Start levert de verdiepings- en richtinglaag nog niet (spec ronde 2
# par. 7, B18). Loep Vertrek en Loep Behoud vragen door op een lage score
# (waarom scoort dit zo, volgens de respondent) en stellen daarna de
# richtingvraag (wat zou hier het meest helpen); die twee vullen samen het blok
# "Wat er moet gebeuren". Loep Start heeft geen van beide. Zolang dat zo is,
# zegt het rapport dat zelf, op de plek waar de lezer anders naar die laag zou
# zoeken. Dezelfde zin staat op de site (home-page-content.tsx,
# producten-content.tsx): rapport en site zeggen hetzelfde.
ONBOARDING_GEEN_VERDIEPING_NOTE = (
    "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Het rapport "
    "laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet "
    "gebeuren volgt in een volgende versie."
)


def _opsomming(items: list[str]) -> str:
    """"a", "a en b", "a, b en c" -- Nederlandse opsomming zonder Oxford-komma."""
    schoon = [i for i in items if i]
    return f"{', '.join(schoon[:-1])} en {schoon[-1]}" if len(schoon) > 1 else schoon[0]


def _geen_factorprofiel_note(n: int, *, drempelzin: str, wel: list[str]) -> str:
    """De degraded p.02-alinea als er geen factorprofiel is (bug B2).

    Onder MIN_AGGREGATE_N afgeronde antwoorden geeft detect_patterns
    `sufficient_data: False`; build_report_data laat factor_avgs dan leeg.
    Het normale sjabloon had daarna geen onderwerp meer ("Waarom  bovenaan
    staat", lege Gespreksopener, kale streep als score). Fail Loud: benoem het
    aantal, de drempel en wat het rapport wél bevat.

    De drempel wordt alléén genoemd als het responsaantal er daadwerkelijk
    onder zit (review ronde 2). De degraded staat hangt namelijk aan een LEEG
    factorprofiel, niet aan n: scoring.factor_averages laat een factor zonder
    waarden weg, dus een meting met 14 antwoorden zonder gescoorde
    organisatiefactoren belandde hier ook -- en las dan "Met 14 antwoorden ...
    Daarvoor zijn minimaal 10 antwoorden nodig", een zin die zichzelf
    tegenspreekt op de openingspagina. Boven de drempel zegt Loep dus gewoon
    dat er geen factorscores berekend zijn, zonder een oorzaak te suggereren
    die niet klopt.

    `wel` bevat alleen secties die in deze staat daadwerkelijk renderen -- de
    aanroeper schakelt ze op de data die hij heeft, zodat de zin niets belooft
    wat niet op de pagina staat.
    """
    if n < MIN_AGGREGATE_N:
        antwoorden = "antwoord" if n == 1 else "antwoorden"
        kop = (f"Met {n} {antwoorden} toont Loep nog geen profiel per factor. "
               f"{drempelzin}")
    else:
        kop = ("Voor deze meting zijn er geen scores per factor berekend. "
               f"Aan het aantal antwoorden ligt het niet: dat zijn er {n}.")
    return f"{kop} Wat dit rapport wel laat zien: {_opsomming(wel)}."


def _bestuurlijke_read(*, kernzin: str, totaalbeeld: str,
                       primary_label: str,
                       why_cells_html: str, strong_label: str, strong_score: float | None,
                       mgmt_q: str, mgmt_q_source: str = "",
                       responsbasis_html: str = "", opener_html: str = "",
                       usage_html: str = "", direction_line: str = "",
                       degraded_note: str = "", why_title: str = "",
                       signal_cell_html: str = "", scope_note: str = "") -> str:
    # scope_note (spec ronde 2 par. 7): één regel direct onder de kernzin over
    # wat dit product nog niet levert. Staat bewust vóór het why-blok, want daar
    # begint de lezer te zoeken naar de laag die er niet is. Rendert in beide
    # staten (met en zonder factorprofiel): de zin gaat over het product, niet
    # over deze meting, en blijft dus ook waar zonder profiel.
    # Degraded variant (bug B2): zonder factorprofiel heeft het why-blok geen
    # onderwerp en de Gespreksopener geen vraag. Dan rendert hier één
    # expliciete alinea in plaats van het gewone blok met gaten erin;
    # primary_label/why_cells_html/strong_*/mgmt_q/direction_line én
    # totaalbeeld worden dan bewust genegeerd (de aanroeper heeft ze in die
    # staat ook niet, en de alinea draagt de reikwijdte-uitleg al -- diezelfde
    # verwijzing twee keer op één pagina leest als een gat).
    if degraded_note:
        body = (f'<div class="card accent">'
                f'<h3>Wat dit rapport wel en niet laat zien</h3>'
                f'<p style="max-width:62ch;margin-bottom:0;">{_h(degraded_note)}</p></div>')
    else:
        # Onderbouwingsrij onder het why-blok. Sinds ronde 2 (taak 3) draagt die
        # ook het totaalsignaal met zijn band: dat getal stond in de kernzin, en
        # die plek is nu ingenomen door de zin over de vorm van het profiel.
        strong_cell = (
            f"<td><div class='sc-l'>Relatief sterk</div>"
            f"<div class='sc-v'>{_score_str(strong_score)}</div>"
            f"<div class='sc-b'>{_h(strong_label)}: wat w&eacute;l werkt</div></td>"
        ) if (strong_label and _factor_label(strong_score) == "Relatief sterk") else ""
        sg_row = (f"<table class='sg'><tr>{signal_cell_html}{strong_cell}</tr></table>"
                  if (signal_cell_html or strong_cell) else "")
        why_title_html = (_h(why_title) if why_title
                          else f"Waarom {_h(primary_label)} bovenaan staat")
        body = f"""<div class="why">
    <div class="why-title">{why_title_html}</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
    {sg_row}
    <div class="mq-line"><span class="mq-label">Gespreksopener</span><p>{_h(mgmt_q)}</p>{f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ''}{f'<p class="mq-direction">{_h(direction_line)}</p>' if direction_line else ''}</div>
  </div>"""
    # Lege subtekst levert geen lege <p> meer op.
    totaalbeeld_html = (f'<p style="font-size:11px;color:#374151;max-width:62ch;'
                        f'margin-bottom:22px;">{_h(totaalbeeld)}</p>'
                        ) if (totaalbeeld and not degraded_note) else ""
    scope_html = (f'<p class="trustline" style="margin-top:-14px;margin-bottom:18px;">'
                  f'{_h(scope_note)}</p>') if scope_note else ""
    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Bestuurlijke read</span>'}
  <p class="br-kernzin">{_h(kernzin)}</p>
  {scope_html}
  {totaalbeeld_html}
  {body}
  {usage_html}
  {responsbasis_html}
</div>"""


def _responsbasis(*, invited: int | None, completed: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "",
                  enps_available: bool = True, compact: bool = False,
                  note: str = "") -> str:
    """`note` alleen zonder noemer: de zin uit `_respons_noemer` die zegt waarom.

    Het percentage is GEEN parameter meer. Het werd naast `invited` en
    `completed` meegegeven terwijl deze functie de waarschuwingszin uit die twee
    zelf berekent: twee bronnen voor hetzelfde getal, die uit elkaar konden
    lopen (een bekend aantal met een leeg percentage rendeerde letterlijk
    "None%").
    """
    seg = ("Beschikbaar: segmentbeeld verderop in dit rapport." if segment_available
           else f"Niet beschikbaar: {_h(segment_reason)}.")

    not_available: list[str] = []
    if not segment_available:
        not_available.append("segmentcontrasten")
    if not enps_available:
        not_available.append("werkgeversaanbeveling (eNPS)")

    if not_available:
        items_html = " &middot; ".join(_h(x) for x in not_available)
        datastatus_html = (
            f'<div class="card" style="margin-top:14px;">'
            f'<span class="eyebrow">Datastatus</span>'
            f'<p style="margin-top:4px;margin-bottom:0;">Niet beschikbaar in deze wave: {items_html}. '
            f'Verdieping opent zodra voldoende responses beschikbaar zijn.</p>'
            f'</div>'
        )
    else:
        datastatus_html = ""

    # Zonder noemer vervallen de cellen "Uitgenodigd" en "Respons": een leeg
    # vakje of een 0% zou een meting suggereren die niet bestaat. Wat er wél is
    # (het aantal afgeronde vragenlijsten) blijft staan, en de regel onder de
    # tabel zegt in een hele zin wat er ontbreekt (spec ronde 2 par. 6.1).
    if invited is None:
        stat_cells = f'<td><div class="sc-l">Afgerond</div><div class="sc-v">{completed}</div></td>'
    else:
        stat_cells = (
            f'<td><div class="sc-l">Uitgenodigd</div><div class="sc-v">{invited}</div></td>'
            f'<td><div class="sc-l">Afgerond</div><div class="sc-v">{completed}</div></td>'
            f'<td><div class="sc-l">Respons</div>'
            f'<div class="sc-v">{_respons_pct(completed, invited)}%</div></td>'
        )

    caution = _respons_caution(completed, invited, note)
    caution_html = (f'<p class="trustline" style="margin-top:6px;">{_h(caution)}</p>'
                    if caution else "")

    # De statregel blijft als geheel bij elkaar; de band als geheel mag wél
    # doorbreken naar de volgende pagina (spec §1 randgeval).
    body = f"""<span class="slabel">Responsbasis &amp; reikwijdte</span>
  <table class="sg no-break"><tr>
    {stat_cells}
    <td><div class="sc-l">Meetperiode</div><div class="sc-v" style="font-size:14px;">{_h(period)}</div></td>
  </tr></table>
  {caution_html}
  <div class="card"><h3>Populatie</h3><p>{_h(population)}</p>
    <h3 style="margin-top:10px;">Segmentstatus</h3><p style="margin-bottom:0;">{seg}</p></div>
  {datastatus_html}"""

    if compact:
        return f'<div style="margin-top:28px;">{body}</div>'
    return f'<div class="pb sec">\n  {body}\n</div>'


def _stat4(cards: list[dict]) -> str:
    tds = "".join(
        f'<td><div class="sc-l">{_h(c["title"])}</div>'
        f'<div class="sc-v">{_h(c["value"])}</div>'
        f'<div class="sc-b">{_h(c["body"])}</div></td>'
        for c in cards)
    return f'<table class="sg"><tr>{tds}</tr></table>'


def _playbook_card(row: dict) -> str:
    rb  = str(row.get("band", "MIDDEN")).upper()
    bk  = rb if rb in ("HOOG","MIDDEN","LAAG") else "MIDDEN"
    col = _factor_color({"HOOG": 2.0, "MIDDEN": 5.5, "LAAG": 8.0}[bk])
    bl  = {"HOOG": "Kwetsbaar punt", "MIDDEN": "Gemengd beeld", "LAAG": "Relatief sterk"}[bk]
    lbl = row.get("label", row.get("factor",""))
    acts = "".join(f"<li>{_h(a)}</li>" for a in row.get("actions",[]))

    # Saniteer oude actietaal
    decision = row.get("decision","").replace("gerichte verbeteractie","managementgesprek of data-check")
    validate = row.get("validate","")
    review   = row.get("review","").replace("gerichte verbeteractie","eerste vervolgstap")
    # Eigenaarschap is bewust geen Loep-suggestie (geen aanname wie dit oppakt) —
    # altijd een invulbare lege regel, ongeacht wat er berekend is in de row-data.

    return f"""<div class="play" style="border-left-color:{col};">
  <div class="play-hdr">
    <div class="play-bdg"><span style="background:{col};">{_h(bl)}</span></div>
    <div class="play-ttl">{_h(lbl)} &middot; {_h(row.get("title",""))}</div>
  </div>
  {"<div class='sub-l'>Eerste managementvraag</div><p style='font-size:10.5px;'>" + _h(decision) + "</p>" if decision else ""}
  {"<div class='sub-l'>Waar te beginnen</div><p style='font-size:10.5px;'>" + _h(validate) + "</p>" if validate else ""}
  {"<div class='sub-l'>Mogelijke stappen</div><ul class='act-lst'>" + acts + "</ul>" if acts else ""}
  <div class='sub-l'>Eigenaar</div><div class="step-fill"></div><div class="step-fill-hint">In te vullen tijdens de bespreking</div>
  {"<div class='sub-l'>Reviewmoment</div><p style='font-size:10.5px;'>" + _h(review) + "</p>" if review else ""}
</div>"""


def _step_cards(nsp: dict) -> str:
    import re as _re
    cards = nsp.get("session_cards") or [
        {"title": "Prioriteit",   "body": nsp.get("first_decision","")},
        # Eigenaar: geen Loep-suggestie — bewust altijd een invulbare lege regel (zie _clean/render hieronder).
        {"title": "Eigenaar",     "body": ""},
        {"title": "Eerste stap",  "body": nsp.get("first_action","")},
        {"title": "Reviewmoment", "body": nsp.get("review_moment","")},
    ]

    def _clean(title: str, s: str) -> str:
        # Vervang volledig de "Vertaal X binnen 30 dagen naar..."-formule
        s = _re.sub(
            r'Vertaal .{0,100}binnen \d+ dagen naar [^.]+\.',
            'Kies één managementgesprek of data-check om het beeld te verduidelijken. Bepaal daarna pas of een gerichte stap nodig is.',
            s
        )
        # Prioriteit-kaart: maak hiërarchisch als er twee factoren zijn
        if title in ("Prioriteit nu", "Prioriteit"):
            # "X en Y vormen nu..." → "Start met X. Neem Y mee als tweede aandachtspunt."
            m = _re.match(r'(\w[\w\s&]+?) en ([\w\s&]+?) (vormen|zijn)', s)
            if m:
                s = (f'Start met {m.group(1).strip()}. '
                     f'Neem {m.group(2).strip()} mee als tweede aandachtspunt.')
        # Vervang "vormen nu het eerste vertrekspoor om bestuurlijk te wegen"
        s = s.replace("vormen nu het eerste vertrekspoor om bestuurlijk te wegen",
                      "zijn de eerste factoren om gericht te bespreken")
        # Vervang overige actietaal
        s = (s.replace("gerichte verbeteractie", "managementgesprek of data-check")
               .replace("verbeteractie", "eerste vervolgstap")
               .replace("met duidelijke eigenaar en zichtbare opvolging", ""))
        return s.strip()

    def _card_body_html(title: str, body: str) -> str:
        if title == "Eigenaar":
            return '<div class="step-fill"></div><div class="step-fill-hint">In te vullen tijdens de bespreking</div>'
        return f'<div class="step-body">{_h(_clean(title, body))}</div>'

    tds = "".join(
        f'<td class="step"><div class="step-no">{_h(c.get("title",""))}</div>'
        f'{_card_body_html(c.get("title",""), c.get("body",""))}</td>'
        for c in cards[:4])
    return f'<table class="steps"><tr>{tds}</tr></table>'


# Gespreksopener zonder factorprofiel (review ronde 2). Het navy blok onderaan
# de gespreksagenda drukte hier de generieke nsp["first_decision"] af ("Kies
# eerst of de scherpste werkfactoren vooral een lokaal managementspoor of een
# breder organisatievraagstuk vormen"), twee regels onder de intro die zojuist
# zei dat er geen volgorde en geen startpunt is. Die vraag beweert dus iets dat
# de pagina ontkent, en is bovendien het jargon dat de copy-ronde van 6
# september verbood.
#
# Bewust een vraag en niet niets: het gebruiksblok op p.02 stuurt in deze staat
# naar "achteraan lees je waar het gesprek kan beginnen". Een leeg navy vlak
# zou die verwijzing opnieuw onwaar maken. Deze vraag klopt bij elk aantal: ze
# vraagt naar herkenning van wat er wél staat en naar wat een volgende meting
# nodig heeft. Gedeeld met de onboarding-gespreksagenda (_eerste_managementspoor).
AGENDA_OPENER_GEEN_PROFIEL = (
    "Dit rapport wijst nog geen thema aan om mee te beginnen. Wat herkennen "
    "jullie in wat er wel staat, en wat is er nodig om bij een volgende meting "
    "wel een startpunt te krijgen?")

# Vervolgmoment-hint zonder factorprofiel: de normale hint sluit af met "of dit
# thema nog voorrang verdient", en "dit thema" heeft hier geen onderwerp.
REVIEW_WHEN_GEEN_PROFIEL = (
    "Spreek af wanneer jullie hier opnieuw naar kijken, en met welke meting.")

# Sectie-intro van de gespreksagenda zonder factorprofiel (review ronde 2).
# SECTION_INTROS["gespreksagenda"] belooft een samenvatting van "wat als eerste
# op tafel hoort, waarom juist dat" -- precies wat deze pagina in die staat
# niet heeft.
GESPREKSAGENDA_INTRO_GEEN_PROFIEL = (
    "Deze agenda vat normaal samen wat als eerste op tafel hoort en waarom "
    "juist dat. Dat kan hier nog niet. Wat hieronder staat is daarom geen "
    "uitkomst van de meting, maar een startvraag voor de bespreking.")


def _laagste_stelling_zin(factor_label: str, stelling: str, score: float,
                          *, strikt_laagste: bool) -> str:
    """Een constatering over de laagst scorende stelling, precies één keer.

    strikt_laagste is alleen waar als geen enkele andere stelling in het hele
    rapport dezelfde getoonde score haalt; bij gelijkspel is "het laagst"
    onwaar en spreekt de appendix het rapport tegen. Vergelijken gaat over de
    getoonde score (zie _shown, B15): 5.14 en 5.09 staan allebei als 5.1 in de
    tabel, en dan leest "de laagst scorende stelling" als een fout.
    """
    welke = ("de laagst scorende stelling" if strikt_laagste
             else "een van de laagst scorende stellingen")
    return (f"Bespreek eerst ‘{stelling}’ binnen {factor_label.lower()} "
            f"({score:.1f}/10). Dat is {welke} in het cijferbeeld.")


def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            review_when: str,
                            primary_why: str | None = None,
                            second_why: str | None = None,
                            opener_html: str = "",
                            degraded_note: str = "") -> str:
    """Gespreksagenda voor eerste managementbespreking — geen actieplan, agenda.

    Navy anker (designsprong §2a): kaarten + gespreksopener vormen één donker
    vlak. primary_why/second_why (designsprong §3) zijn feitelijke
    onderbouwingsregels uit bestaande berekeningen — geen nieuwe duiding.
    "Uit de bespreking" (feedback 2026-07-16): de losse Eigenaarschap-kaart is
    vervangen door één blok met drie invulregels (Prioriteit/Eigenaar/
    Vervolgmoment) — spiegelt de doelzin op de openingspagina ("één
    prioriteit, één eigenaar en een vervolgmoment"). De aparte
    Opnieuw-bespreken-kaart is hierin opgegaan: review_when wordt de hint
    onder Vervolgmoment i.p.v. een vierde, altijd-ingevulde kolom.

    TIJDELIJK (spec 2026-07-18 par. 10): sinds het prioriteringsraster
    (_prioriteringsraster) exit en retention heeft overgenomen, wordt deze
    functie alleen nog aangeroepen door de onboarding-renderer (Loep Start
    heeft in v1 nog geen verdiepingsset). Migreert naar _prioriteringsraster
    zodra de Loep Start-verdiepingsset v1.1 landt; deze functie wordt dan
    verwijderd.

    degraded_note (review ronde 2) volgt dezelfde schakelaar als de degraded
    p.02-alinea: zonder factorprofiel is er geen primair thema en geen tweede
    aandachtspunt, en viel primary_theme door naar de letterlijke placeholder
    "het leidende onboardingthema" met een lege cel ernaast. Dan rendert hier
    één kaart met wat er wél gemeten is; primary_theme/second_point/
    primary_why/second_why/mgmt_q/review_when worden bewust genegeerd (de
    aanroeper heeft ze in die staat ook niet).
    """
    def _why(txt: str | None) -> str:
        return f'<span class="agenda-why">{_h(txt)}</span>' if txt else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    if degraded_note:
        intro_html = f'<p class="sec-intro">{GESPREKSAGENDA_INTRO_GEEN_PROFIEL}</p>'
        theme_cells = (f'<td class="step"><div class="step-no">Wat deze meting wel geeft</div>'
                       f'<div class="step-body">{_h(degraded_note)}</div></td>')
        opener_vraag = AGENDA_OPENER_GEEN_PROFIEL
        review_hint = REVIEW_WHEN_GEEN_PROFIEL
    else:
        intro_html = _intro("gespreksagenda")
        theme_cells = (
            f'<td class="step"><div class="step-no">Primair thema</div>'
            f'<div class="step-body">{_h(primary_theme)}</div>{_why(primary_why)}</td>'
            f'\n    <td class="step"><div class="step-no">Tweede aandachtspunt</div>'
            f'<div class="step-body">{_h(second_point)}</div>{_why(second_why)}</td>')
        opener_vraag = mgmt_q
        review_hint = review_when

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Eerste managementspoor</span>'}
  {intro_html}
  <div class="agenda-dark">
  <table class="steps"><tr>
    {theme_cells}
    <td class="step">
      <div class="step-no">Uit de bespreking</div>
      {_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}
      {_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}
      {_fill_row("Vervolgmoment", review_hint)}
    </td>
  </tr></table>
  <div class="agenda-opener">
    <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
    <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(opener_vraag)}</p>
  </div>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
</div>"""


# ── Prioriteringsraster (spec 2026-07-18) ────────────────────────────────────
# Alle copy hieronder is gepind met contract-tests: inkorten = rode test.

# ── Intro, sorteerregel en gate-notitie: samengesteld uit de signalen die deze
# meting werkelijk had ────────────────────────────────────────────────────────
# Vaste regel (ronde 1, herbevestigd in ronde 2 par. 1.3): het raster belooft
# nooit een signaal dat in deze meting niet bestond. Twee signalen kunnen per
# meting aan of uit staan (verdieping, richting), maal twee scan-types: acht
# varianten. Die worden hier samengesteld uit bouwstenen in plaats van als acht
# losse constanten onderhouden.
_SIGNAL_SCORE = "de gemiddelde score"
_SIGNAL_EXIT_REASON = "hoe vaak een factor als vertrekreden is genoemd"
_SIGNAL_SPREAD = "de spreiding tussen respondenten"
_SIGNAL_DEEPENING = "wat respondenten in de verdieping als toelichting kozen"
_SIGNAL_DIRECTION = "hoeveel mensen bij een factor om verandering vragen"
# Aantalwoorden in klantcopy: het aantal signalen in de rasterintro hieronder
# (2 tot 5) en het aantal factoren in de vlak-profiel-zin op p.02 (2 tot 6, want
# een vlak profiel heeft er minstens twee); "alle zes" leest beter dan "alle 6".
# Een dict, geen tweede kopie bij profile_shape: twee definities van dezelfde
# naam in een module overschrijven elkaar stil. Bewust hard indexeren: een
# aantal buiten dit bereik is een bug, geen reden om "alle 7" te drukken.
_TELWOORD = {2: "twee", 3: "drie", 4: "vier", 5: "vijf", 6: "zes"}

# De vraag om verandering heeft bewust geen eigen kolom (spec ronde 2 par. 1.3),
# dus de intro belooft alleen wat er echt staat: de markeringsregel onder de rij
# zodra dit signaal de volgorde bepaalde.
_RASTER_DIRECTION_CLAUSE = (
    "De vraag om verandering telt alleen mee bij vrijwel gelijke scores; gaf die "
    "de doorslag, dan staat dat met de tellingen onder de rij.")


def _raster_signals(scan_type: str, deepening_active: bool,
                    direction_active: bool) -> list[str]:
    """De signalen in de volgorde waarin ze op de pagina staan: eerst de
    kolommen van links naar rechts, de vraag om verandering als laatste omdat
    die geen kolom heeft."""
    signals = [_SIGNAL_SCORE]
    if scan_type == "exit":
        signals.append(_SIGNAL_EXIT_REASON)
    signals.append(_SIGNAL_SPREAD)
    if deepening_active:
        signals.append(_SIGNAL_DEEPENING)
    if direction_active:
        signals.append(_SIGNAL_DIRECTION)
    return signals


def raster_intro(scan_type: str, deepening_active: bool,
                 direction_active: bool) -> str:
    """Intro boven het raster: noemt precies de signalen die meewogen. Loep
    Vertrek telt er een extra: de vertrekredenkolom staat ook in de tabel."""
    signals = _raster_signals(scan_type, deepening_active, direction_active)
    lijst = f'{", ".join(signals[:-1])} en {signals[-1]}'
    # De richting staat altijd als laatste in de lijst en heeft geen kolom.
    waar = (f"De eerste {_TELWOORD[len(signals) - 1]} staan in de tabel."
            if direction_active else "Ze staan allemaal in de tabel.")
    staart = f" {_RASTER_DIRECTION_CLAUSE}" if direction_active else ""
    return (f"Dit overzicht weegt alle zes factoren tegen elkaar af op "
            f"{_TELWOORD[len(signals)]} signalen: {lijst}. {waar}{staart} Zo is de "
            "volgorde navolgbaar. De bespreking beslist; dit raster structureert.")


def raster_uitleg(scan_type: str, deepening_active: bool,
                  direction_active: bool) -> str:
    """Sorteerregel onder de tabel. De regel zelf blijft een zin; daarna volgen
    alleen de drempels van de signalen die in deze meting meespeelden. De
    getallen komen uit de constanten die ze ook echt sturen, zodat de copy niet
    kan gaan liegen als een drempel verandert."""
    marge = str(PRIORITY_TIE_MARGIN).replace(".", ",")
    reden = (", waarbij ook meeweegt hoe vaak een factor als vertrekreden is genoemd"
             if scan_type == "exit" else "")
    # "of", niet "en": de sleutel past ze na elkaar toe, allebei tegelijk hoeft niet.
    terugval = ("geeft een grote spreiding of een gedeelde toelichting uit de "
                "verdieping de doorslag" if deepening_active
                else "geeft een grote spreiding de doorslag")
    if direction_active:
        regel = (f"Liggen scores binnen {marge} van elkaar, dan telt eerst waar de "
                 "meeste mensen om verandering vragen, en alleen als een factor er "
                 f"minstens {TOP_CHOICE_MIN_LEAD} mensen bovenuit steekt; anders "
                 f"{terugval}.")
    else:
        regel = f"Liggen scores binnen {marge} van elkaar, dan {terugval}."
    drempels = [f"Spreiding tonen we vanaf {MIN_DISTRIBUTION_N} responses"]
    if deepening_active:
        drempels.append(f"verdiepingsduiding vanaf {DEEPENING_MIN_N} "
                        "beantwoorders per factor")
    if direction_active:
        drempels.append(f"de vraag om verandering vanaf {DIRECTION_MIN_N} "
                        "beantwoorders per factor")
    return (f"Hoe deze volgorde tot stand komt: gesorteerd op score{reden}. {regel} "
            f'{"; ".join(drempels)}.')


RASTER_LEGENDA = (
    "Het blokje in de spreidingsbalk markeert het groepsgemiddelde; de "
    "telling eronder toont hoeveel respondenten deze factor onder de 5 "
    "scoren.")


def raster_gate_note(direction_active: bool) -> str:
    """Disclosure bij een meting zonder verdiepingsvragen. De richtingvraag staat
    daar los van (elke respondent beantwoordt hem), dus die wordt alleen genoemd
    als hij er in deze meting ook echt was."""
    volgt = ("score, spreiding en de vraag om verandering. Die laatste staat los "
             "van de verdieping: elke respondent beantwoordt hem."
             if direction_active else "score en spreiding.")
    return f"In deze meting waren geen verdiepingsvragen actief; de volgorde volgt {volgt}"


# Derde intro-staat (bug B3): zonder rasterrijen is er geen tabel, geen
# volgorde en geen startpunt. raster_intro() belooft in elke variant een
# afweging van zes factoren die de pagina dan niet toont; dezelfde
# eerlijkheidsfout als de methodiekpagina die het richtingblok beloofde.
RASTER_INTRO_EMPTY = (
    "Dit overzicht weegt normaal alle zes factoren tegen elkaar af. Voor deze "
    "meting is er nog geen profiel per factor, dus ook geen volgorde en geen "
    "startpunt. Wat er wel is, staat hieronder en in de voorgaande "
    "hoofdstukken.")


def _raster_deepening_cell(row: dict, scan_type: str) -> str:
    """Celtekst verdiepingskolom volgens de vijf vaste staten (spec par. 6)."""
    state = row["deepening_state"]
    if state == 1:
        key, cnt, answered = row["deepening_top"]
        opt = _deepening_option_texts(scan_type, row["key"]).get(key, key)
        return f'{cnt} van {answered} kozen: "{_h(opt)}"'
    return _h({2: CELL_NO_MAJORITY, 3: CELL_TOO_FEW,
               4: CELL_CAP_REACHED, 5: CELL_NOT_TRIGGERED}.get(state, ""))


def _prioriteringsraster(*, ranked: list[dict], scan_type: str,
                         factor_resp_scores: dict[str, list[float]],
                         deepening_active: bool,
                         mgmt_q: str, review_when: str,
                         opener_html: str,
                         direction_agg: dict | None = None, n_total: int = 0,
                         direction_block_html: str | None = None) -> str:
    """Prioriteringsraster + geintegreerde gespreksagenda, inclusief het
    richtingblok "Wat er moet gebeuren" (spec par. 2 en par. 6).

    Vervangt _eerste_managementspoor voor exit en retention. De tabel toont
    het afwegingswerk: score, spreiding en verdieping staan elk in een kolom.
    Het signaal dat als enige geen kolom heeft, de vraag om verandering, is
    navolgbaar via de markeringsregel onder de rij, die beide tellingen noemt
    zodra dit signaal de volgorde bepaalde (spec ronde 2 par. 1.3: een kolom
    erbij zou bij Loep Vertrek zeven kolommen met een SVG geven, en dat past
    niet op A4). Het navy slotblok draagt opener + invulregels.

    De uitlegregel wordt PLAIN gerenderd (geen bold-prefix-splitsing): de
    contract-test controleert de letterlijke, volledige string uit
    raster_uitleg() als substring van de HTML-output, dus elke opmaak die de
    string zelf onderbreekt (bijv. een <b>-tag halverwege) breekt die test.
    Intro, uitlegregel en gate-notitie worden samengesteld uit de signalen die
    deze meting had: het raster belooft nooit een signaal dat er niet was.

    direction_block_html (bug B3): de renderers bouwen het richtingblok zelf,
    omdat de methodiekpagina moet weten of het blok daadwerkelijk gerenderd
    is (_trust_page's direction_active). Meegegeven blok wint; zonder dat
    argument bouwt deze functie het blok alsnog uit direction_agg, zodat
    directe aanroepers (tests) niets hoeven te weten van die volgorde.
    """
    # Fail-loud: direction_agg en n_total horen bij elkaar (_direction_chain
    # rekent de noemer-zin uit met n_total) — zonder n_total zou "Van de 0
    # respondenten..." een foute noemer tonen, precies waar dit blok om de
    # geloofwaardigheid van het rapport draait.
    if direction_agg and n_total <= 0:
        raise ValueError("_prioriteringsraster: direction_agg zonder n_total")

    # MIN_DISTRIBUTION_N staat op moduleniveau (regel 25) en wordt ook door
    # raster_uitleg gebruikt; hier alleen nog de renderhelper erbij halen.
    from backend.report_distribution import distribution_svg

    # Onafhankelijk van de renderlus berekend (code-review Taak 5): een
    # nonlocal-neveneffect binnen _spread_cell zou hier onzichtbaar koppelen
    # aan de looprvolgorde en breken zodra deze closure ooit los hergebruikt
    # wordt. Beide kanten gebruiken dezelfde MIN_DISTRIBUTION_N-staffel als
    # _spread_cell, dus het resultaat is identiek.
    any_full_spread = any(
        len([v for v in (factor_resp_scores.get(row["key"]) or []) if v is not None]) >= MIN_DISTRIBUTION_N
        for row in ranked)

    def _spread_cell(row: dict) -> str:
        scores = [v for v in (factor_resp_scores.get(row["key"]) or []) if v is not None]
        if len(scores) < MIN_DISTRIBUTION_N:
            return '<span class="r-mono">spreiding vanaf 10 responses</span>'
        strip = distribution_svg(scores, width=200, height=22)
        return (f'{strip}<br><span class="r-mono">'
                f'{row["spread_below"]} van {row["spread_n"]} onder de 5</span>')

    def _agenda_cell(row: dict) -> str:
        parts = []
        if row["agenda_role"] == "startpunt":
            parts.append("<b>Startpunt</b>")
        elif row["agenda_role"] == "tweede":
            parts.append("<b>Tweede punt</b>")
        if row["near_tie_with"]:
            tie_lbl = next((r["label"] for r in ranked if r["key"] == row["near_tie_with"]),
                           row["near_tie_with"])
            parts.append(f'<span class="r-mono">vrijwel gelijk aan {_h(tie_lbl)}</span>')
        return "<br>".join(parts)

    is_exit = scan_type == "exit"
    reason_th = '<th style="width:13%">Als vertrekreden genoemd</th>' if is_exit else ""
    # Kolombreedtes: Loep Vertrek heeft een kolom extra, dus smaller factor-,
    # spreidings- en verdiepingsveld. De spreidings-SVG is 200px breed en past
    # in beide. Loep Behoud houdt exact de breedtes van voor deze wijziging.
    w_factor, w_spread, w_deep = (("22%", "19%", "23%") if is_exit
                                  else ("27%", "22%", "29%"))
    deep_th = f'<th style="width:{w_deep}">Verdieping</th>' if deepening_active else ""
    n_cols = 4 + int(deepening_active) + int(is_exit)
    body = ""
    for row in ranked:
        # Elke factorrij zit met zijn eventuele markeringsregel in een eigen
        # tbody: die twee mogen niet door een pagina-einde gescheiden worden,
        # anders landt een zin zonder onderwerp boven aan de volgende pagina.
        note = row["tie_break_note"]
        classes = (["r-top"] if row["agenda_role"] else []) + (["r-has-note"] if note else [])
        cls = f' class="{" ".join(classes)}"' if classes else ""
        fl_html = (f'<span class="r-fl">{_h(row["label"])}</span>'
                   if row["agenda_role"] else _h(row["label"]))
        deep_td = (f'<td style="font-size:9.5px;">{_raster_deepening_cell(row, scan_type)}</td>'
                   if deepening_active else "")
        reason_td = (f'<td class="r-mono">{row["exit_reason_n"]}</td>' if is_exit else "")
        body += (f'<tbody class="r-grp"><tr{cls}><td>{fl_html}</td>'
                 f'<td style="color:{_factor_color(row["score"])};">{_score_str(row["score"])}</td>'
                 f'{reason_td}'
                 f'<td>{_spread_cell(row)}</td>'
                 f'{deep_td}'
                 f'<td>{_agenda_cell(row)}</td></tr>')
        # Markeringsregel over de volle breedte (spec ronde 2 par. 1.3): de
        # agendakolom is te smal voor een hele zin, en de regel hoort visueel
        # bij de rij erboven.
        if note:
            body += (f'<tr class="r-note"><td colspan="{n_cols}">'
                     f'{_h(note)}</td></tr>')
        body += "</tbody>"

    # Het richtingblok wordt hier al gebouwd, voor de intro en de uitlegregel:
    # die twee moeten weten of de richtingvraag in deze meting bestond, en de
    # eerlijkste bron daarvoor is wat er daadwerkelijk op de pagina komt te
    # staan, niet of er een aggregaat in de data zit (bug B3, hetzelfde patroon
    # als _trust_page's direction_active, dat deze renderers uit exact dezelfde
    # waarde afleiden). Een aparte parameter zou een tweede waarheid zijn die
    # stil kan afwijken van de pagina.
    dir_block = (direction_block_html if direction_block_html is not None
                 else _wat_moet_gebeuren_block(ranked, direction_agg or {},
                                               scan_type, n_total))
    # Het degraded richtingblok is ook truthy: het staat er juist om te melden
    # dat geen enkele factor de vloer haalde. Dan heeft de vraag om verandering
    # niets kunnen wegen en mag de intro hem niet als signaal opvoeren.
    direction_active = bool(dir_block) and any(
        row["direction_change"] is not None for row in ranked)

    # Zonder rasterrijen is er geen tabel om te tonen (bug B3): de kale
    # tabelkop, de uitlegregel over de sorteervolgorde en de gate-notitie
    # beschrijven dan alle drie een rangorde die de pagina niet heeft.
    if ranked:
        intro = raster_intro(scan_type, deepening_active, direction_active)
    else:
        intro = RASTER_INTRO_EMPTY
    gate = (f'<p class="r-gate">{raster_gate_note(direction_active)}</p>'
            if ranked and not deepening_active else "")
    # Legenda legt de spreidingskolom uit ("... onder de 5 scoren"); zonder een
    # enkele rij met volledige spreidingsdata (n >= 10) is die uitleg niet van
    # toepassing en zou de tekst zelf de degraded-staffel-test doorbreken.
    legenda = f'<p class="r-legend">{RASTER_LEGENDA}</p>' if any_full_spread else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    tabel = f"""<table class="raster-tbl"><tbody><tr>
    <th style="width:{w_factor}">Factor</th><th style="width:12%">Score</th>
    {reason_th}<th style="width:{w_spread}">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th>
  </tr></tbody>{body}</table>
  {legenda}
  {gate}
  <div class="r-uitleg">{raster_uitleg(scan_type, deepening_active, direction_active)}</div>""" if ranked else ""

    # Zonder rasterrijen slaat de meegegeven mgmt_q nergens op: de aanroeper
    # valt daar terug op nsp["first_decision"], de generieke per-product
    # besliszin die "de scherpste werkfactoren" benoemt -- precies wat de intro
    # hierboven zojuist ontkende. Zie AGENDA_OPENER_GEEN_PROFIEL.
    opener_vraag = mgmt_q if ranked else AGENDA_OPENER_GEEN_PROFIEL
    # "of dit thema nog voorrang verdient" heeft zonder rasterrijen geen
    # onderwerp; dezelfde lege verwijzing als de opener hierboven.
    review_hint = review_when if ranked else REVIEW_WHEN_GEEN_PROFIEL

    return f"""<div class="pb sec">
  {opener_html}
  <p class="sec-intro">{intro}</p>
  {tabel}
  {dir_block}
  <div class="agenda-dark" style="margin-top:16px;">
    <div class="agenda-opener">
      <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(opener_vraag)}</p>
    </div>
    <table class="steps"><tr><td class="step">
      {_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}
      {_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}
      {_fill_row("Vervolgmoment", review_hint)}
    </td></tr></table>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
</div>"""


def _raster_attribution(rows: list[dict], scan_type: str) -> str:
    """Bronregel onder de gespreksopener op p.02: benoemt hoe het
    raster-startpunt tot stand kwam. Sinds het prioriteringsraster kan een
    spreidings- of verdiepingsvlag het startpunt binnen PRIORITY_TIE_MARGIN
    voor de strikt laagste factor zetten; een vaste "laagst scorende
    factor"-regel zou p.02 dan het raster laten tegenspreken."""
    if not rows:
        return ""
    top = rows[0]
    kind = top["decided_by"]["kind"] if top["decided_by"] else None
    if kind == "direction":
        return ("De scores lagen vrijwel gelijk; het aantal mensen dat om "
                "verandering vraagt gaf de doorslag.")
    if kind in ("spread", "deepening") or top["base"] > min(r["base"] for r in rows):
        # Een vlag tilde deze rij boven een lagere base, of besliste bij een
        # gelijke base wie bovenaan kwam. In beide gevallen is "de laagst
        # scorende factor" geen volledige verklaring; benoem welk signaal de
        # doorslag gaf, in dezelfde termen als raster_uitleg().
        spread, deep = top["spread_flag"], top["deepening_state"] == 1
        if spread and deep:
            return ("De scores lagen vrijwel gelijk; de spreiding en de "
                    "gedeelde toelichting uit de verdieping gaven de doorslag.")
        if spread:
            return ("De scores lagen vrijwel gelijk; de spreiding tussen "
                    "respondenten gaf de doorslag.")
        if deep:
            return ("De scores lagen vrijwel gelijk; de gedeelde toelichting "
                    "uit de verdieping gaf de doorslag.")
        # Geen van beide vlaggen: dan is er niets te benoemen en zou de
        # verdiepingszin een signaal claimen dat deze meting niet had (K1).
        # Val door naar de generieke regel hieronder.
    if scan_type == "exit" and top["score"] > min(r["score"] for r in rows):
        # De vertrekreden-weging (EXIT_REASON_WEIGHT) zette dit thema bovenaan
        # terwijl een andere factor de laagste kale score heeft.
        return ("Gebaseerd op de score en hoe vaak dit thema als "
                "vertrekreden is genoemd.")
    return "Gebaseerd op de laagst scorende factor."


def _deepening_campaign_active(deepening_agg: dict) -> bool:
    """Campagne-niveau gate: alleen campagnes waar de verdiepingsfeature echt
    draaide (ergens offered > 0) tonen verdiepingsblokken. Historische
    (pre-feature) rapporten blijven zo ongewijzigd; binnen een actieve
    campagne blijft de keten per factor volledig, ook bij offered=0
    (cap-verdrongen) — dat is de 6.1-transparantie."""
    return any(agg.get("offered", 0) > 0 for agg in deepening_agg.values())


def _deepening_option_texts(scan_type: str, factor_key: str) -> dict[str, str]:
    return {o["key"]: o["text"]
            for o in get_deepening_sets(scan_type)[factor_key]["options"]}


def _primary_why_text(low_item_score: float, agg: dict, scan_type: str, factor_key: str) -> str:
    """'Waarom eerst'-onderbouwing bij de Primair-thema-kaart (feedback 2026-07-16
    pt. 1): boven de staffel (answered>=5) wordt de daadwerkelijk meest gekozen
    toelichting genoemd i.p.v. de circulaire "kozen de meest gekozen toelichting"."""
    answered = agg.get("answered", 0)
    top = max((agg.get("primary_counts") or {}).items(), key=lambda kv: (kv[1], kv[0]), default=None)
    if top and answered >= 5:
        opt_text = _deepening_option_texts(scan_type, factor_key).get(top[0], top[0])
        return (f"Laagst scorende stelling in het cijferbeeld ({low_item_score:.1f}/10); "
                f"{top[1]} van de {answered} respondenten met verdieping kozen: '{opt_text}'.")
    return f"Laagst scorende stelling in het cijferbeeld ({low_item_score:.1f}/10)."


def _lc(label: str) -> str:
    """Factorlabel mid-zin: eerste letter lowercase."""
    return label[:1].lower() + label[1:] if label else label


def _tel(n: int, enkelvoud: str, meervoud: str) -> str:
    """Telling met het werkwoord dat erbij hoort: "1 koos" tegenover "3 kozen".

    Met een vloer van DIRECTION_MIN_N (3) beantwoorders is een deelgroep van één
    gewoon bereikbaar, dus elke telling die direct door een werkwoord wordt
    gevolgd loopt hierlangs. Dezelfde regel als _direction_chain al toepast; die
    zet het getal soms achter het werkwoord ("had 1") en kan deze vorm daarom
    niet gebruiken.
    """
    return f"{n} {enkelvoud if n == 1 else meervoud}"


# ── Richtingblok "Wat er moet gebeuren" (spec 2026-09-07 par. 6) ─────────────

DIRECTION_BLOCK_EYEBROW = "Wat er moet gebeuren"
# Eerste zin apart: de degraded variant (bug B3) gebruikt 'm ook, maar mag de
# tweede zin niet overnemen -- die belooft kaarten voor startpunt en tweede
# punt, en precies die kaarten zijn er zonder factorprofiel niet.
DIRECTION_INTRO_VRAAG = (
    "Elke respondent kreeg één vraag over het onderwerp dat bij die respondent het laagst "
    "scoorde: wat zou hier het meest helpen?")
DIRECTION_BLOCK_INTRO = (
    f"{DIRECTION_INTRO_VRAAG} Hieronder staat wat die respondenten kozen "
    "voor het startpunt en het tweede punt. Dit is hun keuze, geen advies van Loep.")
DIRECTION_DEGRADED_TAIL = (
    "Zonder profiel per factor is er nog geen startpunt om die antwoorden aan "
    "te koppelen, en per onderwerp zijn het er te weinig om te tonen.")
DIRECTION_HEAD_TOO_FEW = "Te weinig antwoorden voor een richting."
DIRECTION_HEAD_NONE_NEEDED = "Hier hoeft volgens de meeste betrokkenen niets."
DIRECTION_HEAD_DIVIDED = "Geen eenduidige richting."
# "De grootste groep", nooit "de meeste": deze staat bestaat juist omdat er geen
# meerderheid is (spec ronde 2 par. 4.2).
DIRECTION_HEAD_PLURALITY = "De grootste groep kiest ‘{opt}’, zonder meerderheid."
# {deel} is "even groot" of "ander" (spec ronde 2 par. 4.3). De spec schrijft
# "een even groot deel", maar deze staat vuurt ook als de niets-groep er een
# achter ligt of juist groter is; dan zou die kop worden tegengesproken door de
# tellingen die er in de bronregel onder staan.
DIRECTION_HEAD_SPLIT_NONE = ("Verdeeld: een deel zegt dat hier niets hoeft, een "
                             "{deel} deel vraagt om ‘{opt}’.")


def _direction_chain(agg: dict, n_total: int) -> str:
    """Keten laagst -> (aangeboden ->) beantwoord/overgeslagen (spec par. 6.1).

    Bij lowest_n == 0 (mogelijk bij kleine n: iemands eigen laagste factor is
    niet per se de groeps-startpuntfactor) is er geen keten om te tonen. Een
    clausule met telling 0 ("0 kregen de vraag") is altijd fout Nederlands en
    wordt dus overgeslagen; blijft er dan niets over, dan eindigt de zin bij
    de opener.
    """
    lowest, offered = agg["lowest_n"], agg["offered"]
    answered, skipped = agg["answered"], agg["skipped"]
    if lowest == 0:
        return "Niemand had dit als laagste onderwerp."
    had = f"hadden {lowest}" if lowest != 1 else "had 1"
    parts: list[str] = []
    if offered < lowest:
        if offered:
            parts.append(f"{offered} kregen de vraag" if offered != 1 else "1 kreeg de vraag")
        if answered:
            parts.append(f"{answered} beantwoordden die" if answered != 1 else "1 beantwoordde die")
    else:
        if answered:
            parts.append(f"{answered} beantwoordden de vraag" if answered != 1 else "1 beantwoordde de vraag")
    if skipped:
        parts.append(f"{skipped} sloegen over" if skipped != 1 else "1 sloeg over")
    opener = f"Van de {n_total} respondenten {had} dit als laagste"
    if not parts:
        return f"{opener}."
    return f"{opener}; {', '.join(parts)}."


def _direction_card_cell(role: str, *, label: str, agg: dict, scan_type: str,
                         factor_key: str, n_total: int,
                         factor_score: float | None) -> str:
    """Eén tabelcel (<td>) voor het startpunt of tweede punt, in de zes
    staten van spec par. 6.1 + ronde 2 par. 4. Keyword-only na role:
    scan_type/factor_key en label zijn anders aangrenzende gelijksoortige
    strings die zonder typefout konden transponeren (zelfde reden als
    _bestuurlijke_read en _prioriteringsraster al keyword-only zijn).

    factor_score is verplicht (None alleen voor een factor zonder score) en
    gaat via _shown naar direction_state: de staat moet beslissen op de score
    die de lezer op de pagina ziet, niet op de rauwe waarde (B15). Anders zegt
    de kaart "op een onderwerp dat laag scoort (5.0/10)" naast een legenda die
    kwetsbaar definieert als onder de 5,0."""
    st = direction_state(agg, factor_key, _shown(factor_score))
    texts = direction_option_texts(scan_type, factor_key)
    n = st["n"]

    def _opt(key: str) -> str:
        """Optietekst met een nette fout in plaats van een rauwe sleutel in een
        klant-PDF. Alle takken lopen hierlangs, ook de koppen die vóór de
        verdelingstabel worden opgebouwd: een onbekende sleutel gaf daar anders
        een kale KeyError in plaats van deze melding."""
        if key not in texts:
            raise KeyError(
                f"direction: onbekende optiesleutel {key!r} voor {factor_key!r} ({scan_type})")
        return texts[key]
    if role == "startpunt":
        role_lbl, which = "Startpunt", "het startpunt"
    elif role == "tweede":
        role_lbl, which = "Tweede punt", "het tweede punt"
    else:
        raise ValueError(f"_direction_card_cell: onbekende role {role!r}")
    if st["state"] == "too_few":
        head, src = DIRECTION_HEAD_TOO_FEW, ""
    elif st["state"] == "clear":
        head = direction_imperative(scan_type, factor_key, st["top_key"])
        src = f"Volgens {st['top_n']} van de {n} bij wie {_lc(label)} het laagst scoorde."
    elif st["state"] == "none_needed":
        head = DIRECTION_HEAD_NONE_NEEDED
        opt = _opt(st["top_key"])
        src = (f"{st['top_n']} van de {n} bij wie dit het laagst scoorde kozen "
               f"‘{opt}’. Bespreek of dit dan {which} moet zijn.")
    elif st["state"] == "plurality":
        head = DIRECTION_HEAD_PLURALITY.format(opt=_opt(st["top_key"]))
        # De tweede optie komt uit ranked zelf en niet uit second_n, zodat de
        # zin de optie noemt die bij dat getal hoort. Is er geen tweede optie
        # (mogelijk als answered hoger ligt dan de som van de keuzes), dan komt
        # die clausule er niet; een tweede groep verzinnen mag niet.
        rest = [(k, c) for k, c in st["ranked"] if k != st["top_key"]]
        tweede = (f"; {_tel(rest[0][1], 'koos', 'kozen')} ‘{_opt(rest[0][0])}’"
                  if rest else "")
        src = (f"{st['top_n']} van de {n} bij wie {_lc(label)} het laagst scoorde "
               f"kozen die richting{tweede}. Wat er volgens de grootste groep moet "
               f"gebeuren: {direction_imperative(scan_type, factor_key, st['top_key'])}")
    elif st["state"] == "split_none":
        # "even groot" alleen als de twee groepen echt gelijk zijn; zie de
        # toelichting bij DIRECTION_HEAD_SPLIT_NONE.
        deel = "even groot" if st["none_n"] == st["top_n"] else "ander"
        head = DIRECTION_HEAD_SPLIT_NONE.format(deel=deel, opt=_opt(st["top_key"]))
        src = (f"{_tel(st['none_n'], 'koos', 'kozen')} ‘{_opt(st['none_key'])}’; "
               f"{_tel(st['top_n'], 'koos', 'kozen')} "
               f"‘{_opt(st['top_key'])}’. Op een onderwerp dat laag scoort "
               f"({_score_str(factor_score)}) is dat verschil van inzicht zelf het "
               f"gesprek. Wat die andere groep vraagt: "
               f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    else:
        head = DIRECTION_HEAD_DIVIDED
        src = f"De {n} bij wie dit het laagst scoorde kozen verschillend."

    table = ""
    if st["state"] != "too_few":
        row_htmls = []
        for k, c in st["ranked"]:
            pct = f"{round(c / n * 100)}% ({c})" if n >= MIN_DISTRIBUTION_N else c
            row_htmls.append(f'<tr><td class="iq">{_h(_opt(k))}</td><td class="is">{pct}</td></tr>')
        rows = "".join(row_htmls)
        table = f'<table class="item-tbl dir-tbl">{rows}</table>'
        if n <= DIRECTION_CAVEAT_MAX_N:
            table += ('<p class="dir-caveat">Beperkte basis: gebruik dit als '
                      'gesprekshaakje, niet als conclusie.</p>')
    # head en src worden hier eenmalig samen door _h() gehaald: beide zijn
    # hierboven bewust rauw (ongeescaped) opgebouwd, dus geen asymmetrie meer
    # tussen een vooraf geescapete head en een deels geescapete src.
    src_html = f'<div class="dir-src">{_h(src)}</div>' if src else ""
    return (f'<td class="dir-card dir-{st["state"]}">'
            f'<div class="dir-role">{role_lbl}: {_h(label)}</div>'
            f'<div class="dir-head">{_h(head)}</div>{src_html}{table}'
            f'<div class="dir-chain">{_h(_direction_chain(agg, n_total))}</div></td>')


def _wat_moet_gebeuren_block(ranked: list[dict], direction_agg: dict,
                             scan_type: str, n_total: int) -> str:
    """Twee kaarten (startpunt + tweede punt) onder het raster. Leeg zonder
    richtingdata (campagne-gate zit in build_report_data).

    direction_agg wordt direct geïndexeerd, zonder .get-fallback:
    aggregate_direction vult altijd alle DEEPENING_FACTOR_KEYS, en die lijst
    is gelijk aan ORG_FACTOR_KEYS (gepind in test_direction_factor.py) —
    precies de sleutels die ranked (via rank_factors) gebruikt. Een
    ontbrekende sleutel is dus een codebug elders; die moet KeyError'en, niet
    stil een lege-kaart-tekst tonen. Om dezelfde reden wordt ook r["score"]
    direct geïndexeerd: die score bepaalt of de kaart de split_none-staat mag
    tonen (ronde 2 par. 4.3), en een rasterrij zonder score bestaat niet.
    """
    if not direction_agg:
        return ""
    cards = "".join(
        _direction_card_cell(r["agenda_role"], label=r["label"],
                             agg=direction_agg[r["key"]], scan_type=scan_type,
                             factor_key=r["key"], n_total=n_total,
                             factor_score=r["score"])
        for r in ranked if r["agenda_role"] in ("startpunt", "tweede"))
    if not cards:
        # Geen rasterrijen, dus geen startpunt om een richting aan te hangen
        # (bug B3). Het blok stil laten vallen liet de verzamelde antwoorden
        # spoorloos verdwijnen terwijl de methodiekpagina ze wél beloofde.
        return _direction_degraded_block(direction_agg, n_total)
    return (f'<div class="dir-block"><span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'
            f'<p class="dir-intro">{DIRECTION_BLOCK_INTRO}</p>'
            f'<table class="dir-grid"><tr>{cards}</tr></table></div>')


def _direction_degraded_line(direction_agg: dict, n_total: int) -> str:
    """Eerlijke totalen over alle factoren samen: aangeboden, beantwoord,
    overgeslagen. Elke respondent krijgt precies één richtingvraag, dus de som
    over de factoren is het aantal respondenten.

    Enkelvoud/meervoud per telling en het weglaten van nul-clausules volgen
    _direction_chain: "0 sloegen over" is altijd fout Nederlands.

    De tellingen worden direct geïndexeerd, zonder .get-fallback, om dezelfde
    reden als in _wat_moet_gebeuren_block: aggregate_direction vult elke factor
    met alle drie de sleutels, dus een ontbrekende sleutel is een codebug die
    hoort te KeyError'en in plaats van stil als nul mee te tellen in een zin
    die de klant leest als volledige verantwoording.
    """
    offered = sum(a["offered"] for a in direction_agg.values())
    answered = sum(a["answered"] for a in direction_agg.values())
    skipped = sum(a["skipped"] for a in direction_agg.values())
    if not offered:
        return ""
    kreeg = f"kregen {offered} deze vraag" if offered != 1 else "kreeg 1 deze vraag"
    parts: list[str] = []
    if answered:
        parts.append(f"{answered} beantwoordden die" if answered != 1 else "1 beantwoordde die")
    if skipped:
        parts.append(f"{skipped} sloegen over" if skipped != 1 else "1 sloeg over")
    zin = f"Van de {n_total} respondenten {kreeg}"
    if parts:
        zin += f"; {', '.join(parts)}"
    return f"{zin}. {DIRECTION_DEGRADED_TAIL}"


def _direction_degraded_block(direction_agg: dict, n_total: int) -> str:
    """Degraded richtingblok: geen kaarten, wel de tellingen en de reden.

    Belooft bewust niets over wat er later met de antwoorden gebeurt -- alleen
    wat nu waar is."""
    line = _direction_degraded_line(direction_agg, n_total)
    if not line:
        return ""
    return (f'<div class="dir-block"><span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'
            f'<p class="dir-intro">{DIRECTION_INTRO_VRAAG}</p>'
            f'<div class="card"><p style="font-size:11px;color:#374151;'
            f'max-width:70ch;margin-bottom:0;">{_h(line)}</p></div></div>')


def _direction_p02_line(direction_agg: dict, factor_key: str | None, scan_type: str,
                        factor_score: float | None) -> str:
    """Eén regel over het startpunt op de openingspagina (spec par. 6.2, ronde 2
    par. 4); leeg onder de vloer.

    factor_score is verplicht en gaat via _shown, om dezelfde twee redenen als
    bij _direction_card_cell: een vergeten score gaf hier stil een andere
    klantzin dan de kaart op de gespreksagenda, en de rauwe waarde kon
    kwetsbaar heten terwijl de pagina 5.0 toont."""
    if not direction_agg or not factor_key or factor_key not in direction_agg:
        return ""
    st = direction_state(direction_agg[factor_key], factor_key, _shown(factor_score))
    n = st["n"]
    if st["state"] == "clear":
        return (f"Wat er volgens {st['top_n']} van de {n} moet gebeuren: "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    if st["state"] == "plurality":
        return (f"Wat er volgens de grootste groep moet gebeuren ({st['top_n']} van "
                f"de {n}, zonder meerderheid): "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    if st["state"] == "split_none":
        texts = direction_option_texts(scan_type, factor_key)
        # Met noemer, zoals de drie andere takken: twee kale tellingen naast
        # elkaar lezen bij 10 en 4 uit 25 als een groep van 14.
        return (f"Wat er moet gebeuren: de {n} die dit het laagst scoorden zijn "
                f"hierover verdeeld. {_tel(st['none_n'], 'zegt', 'zeggen')} dat "
                f"hier niets hoeft, {_tel(st['top_n'], 'vraagt', 'vragen')} om "
                f"‘{texts[st['top_key']]}’.")
    if st["state"] == "divided":
        return (f"Over wat hier moet gebeuren zijn de {n} die dit het laagst scoorden "
                "verdeeld. Zie de gespreksagenda.")
    if st["state"] == "none_needed":
        return f"{st['top_n']} van de {n} die dit het laagst scoorden zeggen: hier hoeft niets."
    return ""


def _deepening_chain(agg: dict, scan_type: str, factor_key: str) -> str:
    """Noemer-keten (spec 6.1): getriggerd -> aangeboden -> beantwoord.

    Enkelvoud/meervoud per telling, analoog aan _direction_chain (B16: was
    altijd meervoud, wat bij tellingen van 1 fout Nederlands opleverde)."""
    triggered, offered, answered = agg["triggered"], agg["offered"], agg["answered"]
    resp_word = "respondent" if triggered == 1 else "respondenten"
    offered_clause = "kreeg 1 de verdiepingsvraag" if offered == 1 else f"kregen {offered} de verdiepingsvraag"
    answered_clause = "1 beantwoordde die" if answered == 1 else f"{answered} beantwoordden die"
    return (f"Van de {triggered} {resp_word} met een verdieptrigger op "
            f"{_lc(_fl(factor_key, scan_type))} {offered_clause}; {answered_clause}.")


def _deepening_block(agg: dict, scan_type: str, factor_key: str) -> str:
    """Toelichtingsblok onder een factor (spec 6.1 + 6.2), gestaffeld op n=answered."""
    if not agg.get("triggered"):
        return ""
    answered = agg.get("answered", 0)
    opt_text = _deepening_option_texts(scan_type, factor_key)
    chain = _deepening_chain(agg, scan_type, factor_key)

    if answered < 5:
        body = ('<p style="font-size:9px;color:#64748B;margin:6px 0 0;">'
                'Te weinig verdiepingsantwoorden om een verdeling te tonen. '
                'Bespreek dit onderwerp in de managementbespreking.</p>')
    else:
        ranked = sorted((agg.get("primary_counts") or {}).items(),
                        key=lambda kv: (-kv[1], kv[0]))
        rows = "".join(
            f'<tr><td class="iq">{_h(opt_text.get(key, key))}</td>'
            f'<td class="is" style="color:#0D1B2A;">'
            f'{f"{round(cnt / answered * 100)}% ({cnt})" if answered >= 10 else cnt}'
            f'</td></tr>'
            for key, cnt in ranked)
        body = f'<table class="item-tbl" style="margin-top:6px;">{rows}</table>'
        if answered <= 9:
            body += ('<p style="font-size:10px;color:#92400E;margin:4px 0 0;">'
                     'Beperkte antwoordbasis: gebruik dit als gesprekshaakje, '
                     'niet als conclusie.</p>')

    # De "Daarnaast werden vooral X en Y genoemd"-samenvatting is bewust weg
    # (feedback 2026-07-16): de regel dupliceerde de tabel met aantallen die
    # er direct boven staat. secondary_counts blijft in de aggregatie bestaan.
    return (f'<div class="card"><span class="eyebrow">Welke toelichting respondenten kozen</span>'
            f'<p style="font-size:10px;margin:4px 0 0;">{_h(chain)}</p>'
            f'{body}</div>')


def _short_mgmt_q(deep_agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Korte, datagedreven managementvraag voor de bestuurlijke read (p.02).

    Gebruikt de agenda_question die hoort bij de meest gekozen verdiepings-
    toelichting — inhoud die respondenten zelf kozen, geen vaste template.
    None -> valt terug op de generieke per-factor vraag.
    """
    agg = deep_agg.get(factor_key)
    if not agg:
        return None
    enr = agenda_enrichment(agg, scan_type, factor_key)
    return enr["agenda_question"] if enr else None


def _deepening_mgmt_q(deep_agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Datagedreven gespreksopener (feedback 2026-07-16 pt. 3): noemt de
    daadwerkelijk meest gekozen toelichting i.p.v. de vaste per-factor
    menuvraag (_mgmt_q). None -> de vaste menuvraag blijft de fallback voor
    de Gespreksopener op de gespreksagenda-pagina."""
    agg = deep_agg.get(factor_key)
    if not agg:
        return None
    enr = agenda_enrichment(agg, scan_type, factor_key)
    if enr is None:
        counts = agg.get("primary_counts") or {}
        if counts and agg.get("answered", 0) >= 8:
            top_key = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
            if top_key.endswith("_other"):
                logger.warning(
                    "deepening: *_other is topoptie voor %s - optieset review nodig",
                    factor_key)
        return None
    opt_text = _deepening_option_texts(scan_type, factor_key).get(enr["option_key"], enr["option_key"])
    return f"De meest gekozen toelichting was '{opt_text}'. Herkennen jullie dat beeld, en wat zit erachter?"


_BANDEN_DREMPELS = (
    "Kwetsbaar punt (onder 5,0), aandachtspunt (5,0 tot 6,5) en relatief "
    "sterk (vanaf 6,5) zijn vaste schaaldrempels, geen vergelijking met "
    "andere organisaties. "
)
_BANDEN_RANGORDE = (
    "De rangorde tussen de eigen factoren weegt zwaarder dan de absolute kleur. "
)
_BANDEN_GEEN_RANGORDE = (
    "In dit rapport staat nog geen rangorde tussen de eigen factoren: daarvoor "
    "zijn er geen factorscores berekend. "
)
_BANDEN_MEETLAT = (
    "Doordat de meetlat vast is, zijn meting en vervolgmeting een-op-een "
    "vergelijkbaar."
)


def _banden_cel(ranking_active: bool) -> tuple[str, str]:
    """De cel "Hoe de banden werken" - identiek voor alle drie de producten.

    De rangorde-zin staat er alleen als dit rapport ook echt een rangorde
    heeft (review ronde 2): zonder factorprofiel zegt de rasterpagina dat er
    geen volgorde en geen startpunt is, en beloofde deze cel op de laatste
    pagina alsnog dat die rangorde zwaarder weegt dan de kleur. De drempels
    en de vergelijkbaarheid blijven wel staan: dat zijn eigenschappen van de
    schaal, niet van deze meting.
    """
    midden = _BANDEN_RANGORDE if ranking_active else _BANDEN_GEEN_RANGORDE
    return ("Hoe de banden werken", _BANDEN_DREMPELS + midden + _BANDEN_MEETLAT)


def _trust_page(scan_type: str = "exit", opener_html: str = "",
                direction_active: bool = False,
                direction_degraded: bool = False,
                ranking_active: bool = True) -> str:
    """Product-specifieke methodiekpagina — nooit gedeelde ExitScan-copy buiten ExitScan.

    direction_active volgt het patroon van _prioriteringsraster's
    deepening_active: de Richtingvraag-rij mag alleen beloven wat dit
    specifieke rapport ook echt bevat. scan_type in DIRECTION_SCAN_TYPES
    zegt alleen dat het PRODUCT de vraag ooit kan stellen; de campagnegate
    in build_report_data kan direction_agg voor DEZE meting alsnog leeg
    maken (niemand aangeboden). Beide moeten dus waar zijn.

    direction_degraded is dezelfde gate één niveau fijner (review ronde 2):
    zonder factorprofiel rendert _wat_moet_gebeuren_block alleen tellingen,
    geen kaarten. De volle cel beloofde daar nog een opdrachtvorm, een
    richting vanaf 3 antwoorden en een beperkte-basis-regel -- drie dingen die
    in dat blok niet voorkomen. Zie _direction_degraded_block.

    ranking_active is dezelfde gedachte voor de cel "Hoe de banden werken":
    zonder factorprofiel is er geen rangorde tussen factoren om naar te
    verwijzen. Zie _banden_cel."""
    if scan_type == "retention":
        intro = ("Dit rapport bundelt patronen uit actieve-medewerkerresponses tot een groepsbeeld van "
                 "behoud, vertrekdenken en werkfactoren. Geen individuele risicoscore, geen voorspelling "
                 "en geen diagnose.")
        cells_r1 = [
            ("Groepsniveau",     "Alle scores zijn groepsgemiddelden van de actieve populatie. Geen individuele gegevens."),
            ("Drempelwaarden",   "5+ responses indicatief · 10+ voor patroonduiding · 5+ per groep voor segmentweergave"),
            ("Geen voorspelling","Scores geven een huidig signaal, geen verlooppredicties en geen individuele risicobeoordeling."),
        ]
        cells_r2 = [
            ("Open toelichtingen","Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "Loep Behoud is een actieve-populatie groepssignaal. Geen causale claims, geen interventieprescriptie."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [_banden_cel(ranking_active)]
    elif scan_type == "onboarding":
        intro = ("Dit rapport bundelt patronen uit onboarding-checkpoints tot een groepsbeeld van de eerste "
                 "werkperiode. Geen prestatiebeoordeling, geen individuele beoordeling en geen voorspelling van uitval.")
        cells_r1 = [
            ("Groepsniveau",       "Alle scores zijn groepsgemiddelden van de instroomgroep. Geen individuele gegevens."),
            ("Checkpoint-logica",  "Dit is een enkelvoudig meetmoment (30/60/90). Een volgende meting bespreken we los van dit rapport."),
            ("Geen beoordeling",   "Scores duiden onboarding-ervaring op groepsniveau. Geen prestatiebeoordeling van individuen of managers."),
        ]
        cells_r2 = [
            ("Open toelichtingen", "Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",       "Onboarding is een groepscheck op de eerste werkperiode. Geen causale claims, geen uitvalpredicties."),
            ("Privacywaarborg",    "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [_banden_cel(ranking_active)]
    else:  # exit
        intro = ("Dit rapport bundelt patronen uit exitvragenlijsten tot een groepsbeeld van vertrek. "
                 "Geen diagnose, geen individuele beoordeling, geen causaliteitsclaim en geen voorspelling.")
        cells_r1 = [
            ("Groepsniveau",    "Alle scores zijn groepsgemiddelden. Geen individuele gegevens in dit rapport."),
            ("Drempelwaarden",  "5+ responses indicatief · 10+ voor patroonduiding · 5+ per groep voor segmenten"),
            ("Geen diagnose",   "Scores zijn methodisch verantwoord maar niet extern gevalideerd. Altijd combineren met managementgesprek."),
        ]
        cells_r2 = [
            ("Open toelichtingen","Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "Loep Vertrek is een terugkijkende groepsmeting op uitstroom. Geen causale claims, geen oordeel over vermijdbaarheid, geen verlooppredicties."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [_banden_cel(ranking_active)]

    cells_r4: list[tuple[str, str]] = []
    if scan_type in DIRECTION_SCAN_TYPES and direction_active and direction_degraded:
        cells_r4 = [
            ("Richtingvraag",
             "Elke respondent kreeg één vraag over het onderwerp dat bij die respondent het laagst "
             "scoorde: wat zou hier het meest helpen? In dit rapport hangt er geen richting aan die "
             "antwoorden: zonder profiel per factor is er geen startpunt om ze aan te koppelen, en "
             "per onderwerp zijn het er te weinig om te tonen. Het blok ‘Wat er moet gebeuren’ toont "
             "daarom alleen hoeveel respondenten de vraag kregen, beantwoordden en oversloegen."),
        ]
    elif scan_type in DIRECTION_SCAN_TYPES and direction_active:
        cells_r4 = [
            ("Richtingvraag",
             "Elke respondent kreeg één vraag over het onderwerp dat bij die respondent het laagst "
             "scoorde: wat zou hier het meest helpen? De opdrachtvorm in ‘Wat er moet gebeuren’ "
             "geeft de keuze van die respondenten weer, geen advies van Loep. Dit blok toont een "
             "richting vanaf 3 antwoorden, lager dan de 5 die voor afdelingen geldt, omdat niemand "
             "in de organisatie kan zien wie een onderwerp als laagste had. Bij kleine aantallen "
             "kan het beeld toevallig zijn; herleidbaar is het niet. Daarom staat er dan een "
             "beperkte-basis-regel bij."),
        ]

    def _cells(pairs: list[tuple[str, str]], full: bool = False) -> str:
        cls = "tc-full" if full else "tc"
        return "".join(
            f'<td class="{cls}"><div class="tt">{_h(t)}</div><div class="tb">{_h(b)}</div></td>'
            for t, b in pairs)

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Methodiek, privacy &amp; interpretatiegrenzen</span>'}
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;">{_h(intro)}</p>
  </div>
  <table class="tg"><tr>{_cells(cells_r1)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r2)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r3, full=True)}</tr></table>
  {f'<table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r4, full=True)}</tr></table>' if cells_r4 else ''}
</div>"""


def _segment_status_block(n: int, has_segment_data: bool = False,
                           reason: str = "n-grens", opener_html: str = "") -> str:
    """Segmentstatus — altijd zichtbaar, ook als segmenten niet worden getoond."""
    if has_segment_data:
        return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Segmentanalyse</span>'}
  <div class="card" style="border-left:4px solid #3C8D8A;">
    <div style="display:table;width:100%;">
      <div style="display:table-cell;vertical-align:middle;width:1%;white-space:nowrap;padding-right:14px;">
        <span style="font-size:9px;font-weight:700;background:#3C8D8A;color:#FFF;
          padding:3px 9px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;">Beschikbaar</span>
      </div>
      <div style="display:table-cell;vertical-align:middle;font-size:10px;color:#374151;">
        Segmentanalyse beschikbaar: zie uitgebreide versie.
      </div>
    </div>
  </div>
</div>"""
    else:
        # Bewust GEEN eigen pagina (.pb): de melding is twee regels en sluit aan
        # onder de vorige sectie — voorheen stonden hier twee bijna-lege pagina's
        # achter elkaar (eNPS "niet gemeten" + deze), elk met één zin.
        return f"""<div class="sec">
  {opener_html or '<span class="slabel">Segmentanalyse</span>'}
  <div class="empty-state">
    <p style="margin-bottom:4px;">Segmentverschillen zijn niet getoond om herleidbaarheid te voorkomen.</p>
    <p style="margin-bottom:0;">Verdieping opent zodra voldoende responses per groep beschikbaar zijn.</p>
  </div>
</div>"""


# Mono-labelstijl voor degraded/duiding-regels in de segmenttabel (identiek
# aan de bestaande striplabels).
_SEG_MONO = ("font-family:'JetBrains Mono', monospace;font-size:8px;"
             "letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;")

# ─── Afdelingsstartpunt (spec ronde 2 par. 3.1) ──────────────────────────────
# Bevinding B7: het zwaarste visuele element van het rapport wees een afdeling
# aan op 0,00 tot 0,30 punt verschil met de volgende (16 van de 17 scenario's
# met segmenten), twee keer zelfs terwijl de gepoolde restgroep in dezelfde
# tabel lager stond. Loep wijst daarom pas een afdeling aan als het verschil
# met de volgende dit haalt EN de aangewezen afdeling zelf groot genoeg is voor
# een spreidingsbeeld (MIN_DISTRIBUTION_N, dezelfde grens als de strip in de rij
# ernaast: geen derde magisch getal). Onder de verschilgrens is "de laagste
# afdeling" niet te onderscheiden van de volgende en wordt de conclusie een
# uitspraak over ruis.
#
# De omvangeis geldt alleen voor de AANGEWEZEN afdeling, niet voor beide
# (resolutie van de tegenspraak tussen spec par. 3.1 en 3.3, besluit Lars
# 2026-09-12, uitgewerkt in spec par. 3.4): de conclusie gaat over de genoemde
# afdeling, de tweede dient alleen om vast te stellen dat het verschil echt is,
# en dat kan bij 2,5 punt verschil ook met vijf antwoorden. Met de eis aan beide
# kanten vuurde de regel in nul van de twintig stresstest-scenario's, en een
# regel die nooit vuurt schakelt het blok uit in plaats van het te bewaken.
#
# Vergelijken gebeurt op de GETOONDE score (_shown, B15), zodat de zin nooit een
# verschil claimt dat de lezer in de tabel niet ziet.
SEGMENT_START_MIN_DELTA = 0.3


def _segment_theme_cell(row: dict, factor_rows: dict[str, dict] | None,
                        scan_type: str) -> str:
    """Inhoud van de kolom "Laagste thema" (spec 2026-07-16 §3.2).

    Staffel (amendement 1): bij n=5-9 alleen factorlabel + duidingslabel,
    bewust geen decimale score (schijnprecisie + herleidbaarheid in kleine
    teams); vanaf MIN_DISTRIBUTION_N wel de score. Amendement 2: omitted > 0
    wordt altijd gemeld, ook bij n >= 10 (het getoonde thema is dan "onder
    voorbehoud").
    """
    if row.get("is_pooled", False):
        return f'<span style="{_SEG_MONO}">niet getoond: samengestelde restgroep</span>'
    info = (factor_rows or {}).get(row["department"])
    if not info:
        return f'<span style="{_SEG_MONO}">n.b.</span>'
    if not info.get("factors"):
        # Fail-loud: "alles onder de gate" is een andere staat dan "geen
        # factordata aangeleverd" — als er thema's zijn weggelaten, noem de
        # reden; kaal "n.b." alleen bij echt ontbrekende data.
        omitted = info.get("omitted", 0)
        if omitted > 0:
            return (f'<span style="{_SEG_MONO}">{omitted} thema(&#39;s) '
                    f'niet beoordeelbaar: te weinig antwoorden</span>')
        return f'<span style="{_SEG_MONO}">n.b.</span>'
    fk, avg, _nf = info["factors"][0]
    col = _factor_color(avg)
    if row["n"] >= MIN_DISTRIBUTION_N:
        second = (f'<span style="font-family:\'JetBrains Mono\', monospace;'
                  f'font-size:8px;color:{col};">{avg:.1f}/10</span>')
    else:
        second = (f'<span style="font-family:\'JetBrains Mono\', monospace;'
                  f'font-size:8px;color:#4A6070;">{_h(_factor_label(avg))}</span>')
    cell = (f'<span style="font-size:9.5px;color:{col};">'
            f'{_h(_fl(fk, scan_type))}</span><br>{second}')
    omitted = info.get("omitted", 0)
    if omitted > 0:
        cell += (f'<br><span style="{_SEG_MONO}">{omitted} thema(&#39;s) '
                 f'niet beoordeelbaar: te weinig antwoorden</span>')
    return cell


def _segment_factor_subblocks(segment_rows: list[dict],
                              factor_rows: dict[str, dict] | None,
                              scan_type: str) -> str:
    """Factorbeeld per afdeling (spec 2026-07-16 §3.2 punt 2): volledige
    uitsplitsing alleen voor niet-gepoolde afdelingen met n >= MIN_DISTRIBUTION_N
    én factordata; laagste eerst (volgorde komt uit _department_factor_rows)."""
    if not factor_rows:
        return ""
    subs = ""
    for row in segment_rows:
        if row.get("is_pooled", False) or row["n"] < MIN_DISTRIBUTION_N:
            continue
        info = factor_rows.get(row["department"])
        if not info or not info.get("factors"):
            continue
        frows = "".join(
            f'<tr><td class="iq">{_h(_fl(fk, scan_type))}</td>'
            f'<td class="is" style="width:14%;text-align:left;color:{_factor_color(avg)};">{avg:.1f}</td>'
            f'<td style="width:24%;color:{_factor_color(avg)};font-size:9.5px;">{_h(_factor_label(avg))}</td></tr>'
            for fk, avg, _nf in info["factors"])
        omline = ""
        if info.get("omitted", 0) > 0:
            omline = (f'<div style="{_SEG_MONO}margin-top:4px;">'
                      f'{info["omitted"]} thema(&#39;s) niet beoordeelbaar: '
                      f'te weinig antwoorden</div>')
        subs += (f'<div class="no-break" style="margin-top:14px;">'
                 f'<div style="font-family:\'Inter Tight\', sans-serif;font-weight:700;'
                 f'font-size:11px;margin-bottom:4px;">{_h(row["department"])} (n={row["n"]})</div>'
                 f'<table class="item-tbl">{frows}</table>{omline}</div>')
    if not subs:
        return ""
    intro = ('<p style="font-size:10px;color:#64748B;margin:16px 0 0;">'
             'Factorbeeld per afdeling: dezelfde vaste drempels als in het '
             'overzichtsprofiel (kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, '
             'relatief sterk vanaf 6,5).</p>')
    return intro + subs


def _segment_start_note(segment_rows: list[dict],
                        factor_rows: dict[str, dict] | None,
                        scan_type: str) -> str:
    """Het navy-blok "Startpunt voor de bespreking" onder de segmenttabel.

    Drie staten (spec ronde 2 par. 3.1), elk met de reden die in DEZE meting
    gold en zonder de drempel te noemen die niet meespeelde:

    1. verschil onder SEGMENT_START_MIN_DELTA: de twee laagste afdelingen zijn
       niet van elkaar te onderscheiden (aparte zin bij een exact gelijke
       getoonde score, "dicht bij elkaar" past daar niet);
    2. verschil gehaald, maar de laagste afdeling zelf onder
       MIN_DISTRIBUTION_N: het verschil is er wel, de afdeling is te klein om
       de conclusie te dragen. Dit is bewust NIET de "dicht bij elkaar"-zin:
       die zou worden weersproken door de scores in zijn eigen haakjes;
    3. beide grenzen gehaald: de afdeling wordt genoemd, met noemer en het
       laagst scorende thema daar. De omvang van de op één na laagste afdeling
       telt hier niet mee, zie de toelichting bij SEGMENT_START_MIN_DELTA.

    De zin gaat over de twee LAAGSTE afdelingen, niet over de hele reeks: bij
    5,0 / 5,1 / 8,0 zijn de twee laagste inwisselbaar terwijl de reeks dat niet
    is. De gepoolde restgroep doet aan geen van de drie staten mee (ze is
    samengesteld uit kleine afdelingen), maar kan wel de laagste score van de
    tabel hebben; dan zegt een slotzin dat ze lager staat en waarom ze geen
    startpunt is. Zonder die zin spreekt de tabel de conclusie erboven tegen.
    """
    # Zelf sorteren, niet vertrouwen op de invoervolgorde: bestaande aanroepen
    # geven ook ongesorteerde rijen door (zie tests/test_segment_report.py), en
    # dan zou "de laagste" de verkeerde afdeling noemen. Dezelfde sorteersleutel
    # als _department_segment_rows, zodat "de laagste" hier hetzelfde betekent
    # als daar (de tabel rendert in de volgorde die hij binnenkrijgt).
    named = sorted((r for r in segment_rows if not r.get("is_pooled", False)),
                   key=lambda r: (r["avg"], -r["n"], r["department"]))
    if len(named) < 2:
        # Uit _department_segment_rows komen altijd minstens twee benoemde
        # afdelingen (onder twee kwalificerende afdelingen geeft die functie
        # een lege lijst terug), en alle productie-aanroepen lopen daarlangs.
        # Een tabel met één benoemde rij krijgt geen conclusie: een startpunt
        # is per definitie een vergelijking. De degraded staat zonder
        # segmentdata is afgedekt door _segment_status_block.
        return ""

    lowest, runner_up = named[0], named[1]
    low_sc, run_sc = _shown(lowest["avg"]), _shown(runner_up["avg"])
    delta = round(run_sc - low_sc, 1)
    # Het verschil gaat over de twee laagste afdelingen, niet over de hele
    # tabel: alleen die twee bepalen of er een onderscheid te maken is. De
    # omvangeis geldt alleen voor de afdeling die genoemd zou worden.
    laagste_te_klein = lowest["n"] < MIN_DISTRIBUTION_N
    marge = str(SEGMENT_START_MIN_DELTA).replace(".", ",")

    pooled = next((r for r in segment_rows if r.get("is_pooled", False)), None)
    rest_sentence = ""
    if pooled and _shown(pooled["avg"]) < low_sc:
        rest_sentence = (
            f' De restgroep &ldquo;{_h(pooled["department"])}&rdquo; scoort lager '
            f'({_shown(pooled["avg"]):.1f}/10), maar is samengesteld uit kleine '
            f'afdelingen en wordt daarom niet als startpunt genoemd.')

    if delta < SEGMENT_START_MIN_DELTA:
        if low_sc == run_sc:
            vergelijking = (
                f'De twee laagste afdelingen komen op dezelfde score uit '
                f'({_h(lowest["department"])} en {_h(runner_up["department"])}, '
                f'beide {low_sc:.1f}/10).')
        else:
            vergelijking = (
                f'De twee laagste afdelingen liggen dicht bij elkaar '
                f'({_h(lowest["department"])} {low_sc:.1f}/10 en '
                f'{_h(runner_up["department"])} {run_sc:.1f}/10).')
        # "Geen eerste afdeling aan te wijzen", niet "geen afdeling vraagt
        # aandacht": vastgesteld is alleen dat de twee laagste niet van elkaar
        # te onderscheiden zijn. Bij 5,0 / 5,1 / 9,0 vragen die twee ten
        # opzichte van de hoogste wel degelijk aandacht; de conclusie mag niet
        # breder generaliseren dan de vergelijking in de haakjes ervoor.
        body = (f'{vergelijking} Loep wijst pas een afdeling aan bij een verschil '
                f'van minstens {marge} punt met de volgende. Er is hier dus geen '
                f'eerste afdeling aan te wijzen. Kijk voor de eerste prioriteit '
                f'naar het organisatiebeeld.')
    elif laagste_te_klein:
        # "van de afdelingen die apart getoond worden": de gepoolde restgroep kan
        # lager staan, en dan zou een kale "scoort het laagst" in dezelfde alinea
        # worden weerlegd door de restgroep-zin eronder. Zonder restgroep is de
        # toevoeging ook waar (elke getoonde afdeling staat apart in de tabel).
        body = (f'{_h(lowest["department"])} scoort het laagst van de afdelingen die '
                f'apart getoond worden ({low_sc:.1f}/10), maar '
                f'heeft {lowest["n"]} responses. Loep wijst een afdeling pas aan vanaf '
                f'{MIN_DISTRIBUTION_N} responses, zodat de conclusie niet op een handvol '
                f'antwoorden rust. Kijk voor de eerste prioriteit naar het '
                f'organisatiebeeld.')
    else:
        # Beide grenzen gehaald: verschil >= SEGMENT_START_MIN_DELTA en de
        # laagste afdeling >= MIN_DISTRIBUTION_N. Dit is de enige staat die een
        # afdeling aanwijst.
        #
        # Noemer in de conclusie zelf (feedbackronde 2026-07-13): een manager
        # met een lage score moet niet zelf hoeven ontdekken dat n klein is —
        # het rapport is de "n=5"-discussie voor, i.p.v. er munitie voor te zijn.
        _low_inv = lowest.get("invited")
        _low_basis = (f'{lowest["n"]} van de {_low_inv} uitgenodigden vulden in'
                      if _low_inv else f'{lowest["n"]} responses')
        # Themazin (spec 2026-07-16 §3.2 punt 3): geen factordata = geen zin
        # (geen fake). Band-neutrale formulering: "de druk zit op X" overdrijft
        # wanneer het laagste thema zelf nog relatief sterk scoort. De variant
        # zonder decimaal (n=5-9) is hier vervallen: deze staat eist
        # MIN_DISTRIBUTION_N, dus de score mag altijd getoond worden. De
        # staffel zelf leeft door in de themakolom (_segment_theme_cell).
        #
        # Zijn er thema's die de per-factor-gate niet haalden, dan staat het
        # getoonde thema onder voorbehoud: de themakolom meldt dat al, en die
        # melding hoort ook hier te staan. Zonder dat voorbehoud is deze zin
        # steviger dan de cel ernaast over precies hetzelfde thema.
        theme_sentence = ""
        low_info = (factor_rows or {}).get(lowest["department"])
        if low_info and low_info.get("factors"):
            _lfk, _lavg, _ = low_info["factors"][0]
            _omitted = low_info.get("omitted", 0)
            _voorbehoud = ""
            if _omitted > 0:
                _woord = "thema is" if _omitted == 1 else "thema&#39;s zijn"
                _voorbehoud = (f' Daarbij past een voorbehoud: {_omitted} {_woord} '
                               f'daar niet beoordeelbaar, te weinig antwoorden.')
            theme_sentence = (f' Het laagst scorende thema daar is '
                              f'{_h(_lc(_fl(_lfk, scan_type)))} ({_lavg:.1f}/10).'
                              f'{_voorbehoud}')
        body = (f'<strong>{_h(lowest["department"])}</strong> heeft de laagste score '
                f'van de afdelingen die apart getoond worden '
                f'({low_sc:.1f}/10; {_low_basis}). Gebruik dit om te toetsen wat hier '
                f'speelt, geen ranking of oordeel.{theme_sentence}')

    return (f'<div class="navy-anchor">'
            f'<div class="navy-anchor-eyebrow">Startpunt voor de bespreking</div>'
            f'<p>{body}{rest_sentence}</p></div>')


def _segment_block(segment_rows: list[dict], factor_rows: dict[str, dict] | None = None,
                   scan_type: str = "exit", opener_html: str = "",
                   hidden_n: int = 0) -> str:
    """Segmentanalyse per afdeling: tabel + spreidingsstrip (spec 2026-07-11)
    + factorlaag met laagste thema en uitsplitsing (spec 2026-07-16).

    hidden_n (uit `_segment_hidden_n`) is het aantal responses dat nergens in
    de tabel terechtkomt omdat hun afdeling te klein is en de restgroep de
    grens ook niet haalt; dat wordt onder de tabel gemeld. 0 betekent "niemand
    valt buiten de tabel", de juiste waarde voor aanroepen met handgemaakte
    rijen: die hebben geen verborgen respondenten.

    Strip-gate n>=10 (MIN_DISTRIBUTION_N): rapportbreed EEN regel — bij 5-9
    responses wel de rij (score/band), geen stippen. "Overige afdelingen"
    krijgt nooit een strip (samengestelde restgroep).

    scan_type is geïntroduceerd voor de product-specifieke factorlabels van
    de themalaag (_fl; spec 2026-07-16) — de rest van de tabel blijft
    scanbreed identiek. Zonder factor_rows (oude aanroepen) toont de
    themakolom "n.b." en verschijnen er geen subblokken: geen crash,
    geen fake data.
    """
    from backend.report_distribution import distribution_svg

    if not segment_rows:
        return _segment_status_block(0, has_segment_data=False, opener_html=opener_html)

    rows_html = ""
    for row in segment_rows:
        dept, n_, avg, scores = row["department"], row["n"], row["avg"], row["scores"]
        col = _factor_color(avg)
        is_rest = row.get("is_pooled", False)
        if is_rest:
            strip = f'<span style="{_SEG_MONO}">spreiding niet getoond: samengestelde restgroep</span>'
        elif len(scores) >= MIN_DISTRIBUTION_N:
            strip = distribution_svg(scores, width=200, height=22)
        else:
            strip = f'<span style="{_SEG_MONO}">spreiding vanaf 10 responses</span>'
        name_html = _h(dept) if is_rest else f"<strong>{_h(dept)}</strong>"
        invited = row.get("invited")
        if invited:  # 0 behandeld als "geen noemer" -- voorkomt 0/0, valt terug op alleen n
            pct = min(100, round(n_ / invited * 100))
            n_cell = (f'{n_}/{invited}<br>'
                      f'<span style="font-family:\'JetBrains Mono\', monospace;font-size:8px;'
                      f'color:#4A6070;">{pct}%</span>')
        else:
            n_cell = str(n_)
        theme_cell = _segment_theme_cell(row, factor_rows, scan_type)
        # Elke afdeling in een eigen tbody: sinds de rijlimiet verviel (spec
        # ronde 2 par. 3.2) kan deze tabel over een pagina-einde lopen, en een
        # rij met een spreidingsstrip en twee regels tekst mag daarbij niet
        # halverwege worden afgekapt. break-inside op de <tr> zelf doet onder
        # border-collapse: collapse niets in WeasyPrint; het tbody-patroon van
        # .raster-tbl (tbody.r-grp) werkt wel.
        rows_html += (
            f'<tbody class="seg-grp"><tr><td class="iq" style="width:19%;">{name_html}</td>'
            f'<td style="width:9%;">{n_cell}</td>'
            f'<td class="is" style="width:11%;text-align:left;color:{col};">{avg:.1f}</td>'
            f'<td style="width:14%;color:{col};font-size:9.5px;">{_h(_factor_label(avg))}</td>'
            f'<td class="lt" style="width:20%;">{theme_cell}</td>'
            f'<td style="width:27%;">{strip}</td></tr></tbody>'
        )

    subblocks = _segment_factor_subblocks(segment_rows, factor_rows, scan_type)

    low_note = _segment_start_note(segment_rows, factor_rows, scan_type)

    # Fail Loud: niet tonen mag, verzwijgen niet. Halen de kleine afdelingen
    # samen de grens voor een restgroep niet, dan staan hun responses nergens
    # in deze tabel; zonder deze regel klopt de sectie-intro in dat geval niet.
    hidden_note = ""
    if hidden_n > 0:
        _aantal = ("Eén response valt" if hidden_n == 1
                   else f"{hidden_n} responses vallen")
        _horen = "die hoort" if hidden_n == 1 else "ze horen elk"
        hidden_note = (
            f'<p style="font-size:10px;color:#4A6070;margin:10px 0 0;">'
            f'{_aantal} buiten deze tabel: {_horen} bij een afdeling met minder dan '
            f'{MIN_SEGMENT_N} responses, en dat zijn er te weinig om samen als '
            f'restgroep te tonen.</p>')

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Segmentanalyse per afdeling</span>'}
  {_intro("segmentanalyse")}
  <div class="card">
    <table class="item-tbl">{rows_html}</table>
    {hidden_note}
    {subblocks}
    {low_note}
  </div>
</div>"""


def _themed_quotes(texts: list[str], scan_type: str = "exit",
                   top_fkeys: list[str] | None = None, n_total: int = 0) -> str:
    """Open toelichtingen: alles tonen t/m MAX_QUOTES, geen thema-indeling.

    Trefwoord-classificatie is bewust verwijderd (besluit 2026-04-09 + spec
    2026-07-11): trefwoorden onderscheiden geen negatie ("met mijn leidinggevende
    was niets mis" kreeg het label Leiderschap). Duiding gebeurt in de
    begeleide managementbespreking, niet geautomatiseerd in het rapport.

    top_fkeys/n_total: ongebruikt, alleen behouden voor call-site-compatibiliteit
    (bestaande aanroepen geven ze positioneel door). Niet nodig voor nieuwe callers.
    """
    if len(texts) < MIN_QUOTES_N:
        return (f'<div class="empty-state">Open toelichtingen worden getoond bij minimaal '
                f'{MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>')

    note = ""
    if len(texts) > MAX_QUOTES:
        note = (f'<div class="cbox" style="margin-bottom:12px;font-size:10px;color:#374151;">'
                f'Getoond: de eerste {MAX_QUOTES} van {len(texts)} in ontvangstvolgorde, '
                f'geen inhoudelijke selectie.</div>')

    seen: set[str] = set()
    cards = ""
    for t in texts[:MAX_QUOTES]:
        if t in seen:
            continue
        seen.add(t)
        cards += (
            f'<div class="theme-card">'
            f'<div class="quote-txt">{_h(t)}'
            f'<div class="quote-anon">Automatisch geanonimiseerd: herkende namen en contactgegevens verwijderd</div>'
            f'</div></div>'
        )
    return f'{note}{cards}'


# ─── Data builder ─────────────────────────────────────────────────────────────

def _per_respondent_factor_scores(
        factor_items_map: dict[str, list], org_raws: list[dict]) -> dict[str, list[float]]:
    """Per factor: de individuele factorscore (gem. van de items, geschaald 1-10)
    per respondent. Basis voor de spreidingsweergave; geen invloed op scoring."""
    out: dict[str, list[float]] = {}
    for fk, items in factor_items_map.items():
        keys = [ik for ik, _q in items]
        scores: list[float] = []
        for raw in org_raws:
            vals = [float(raw[k]) for k in keys if raw.get(k) is not None]
            if vals:
                scores.append(_scale_to_10(sum(vals) / len(vals)))
        out[fk] = scores
    return out


def _enrich_segment_rows_with_invited(segment_rows: list[dict],
                                      segment_departments: list[dict] | None) -> list[dict]:
    """Voegt per rij de noemer (invited) toe via label-match op de campagnelijst
    (spec 2026-07-12 §6). Ontbrekende noemer of pooled rij -> invited=None
    (eerlijke degradatie: alleen n tonen, geen fake percentage)."""
    invited_by_label = {d.get("label"): d.get("invited_count")
                        for d in (segment_departments or [])}
    for row in segment_rows:
        row["invited"] = (None if row.get("is_pooled")
                          else invited_by_label.get(row["department"]))
    return segment_rows


def _department_grouping(respondents: list[dict]) -> dict[str, list[float]]:
    """Scores per afdelingsnaam. Respondenten zonder afdeling of zonder score
    tellen niet mee. Eén bron voor de rijen en voor de telling van wat er buiten
    de tabel valt, zodat die twee niet uit elkaar kunnen lopen."""
    grouped: dict[str, list[float]] = {}
    for r in respondents:
        dept, score = r.get("department"), r.get("signal_score")
        if not dept or score is None:
            continue
        grouped.setdefault(str(dept), []).append(float(score))
    return grouped


def _segment_hidden_n(respondents: list[dict]) -> int:
    """Responses die nergens in de segmenttabel terechtkomen.

    Een afdeling onder MIN_SEGMENT_N krijgt geen eigen rij (privacygrens, die
    blijft). Normaal komen die responses samen in "Overige afdelingen", maar
    haalt die restgroep zelf de grens ook niet, dan verdwijnen ze zonder één
    woord: 12 + 10 + 3 geeft twee rijen met samen 22, terwijl de meting er 25
    heeft. Niet tonen mag, verzwijgen niet; `_segment_block` meldt dit aantal
    onder de tabel. Zonder dat is de sectie-intro ("alleen afdelingen met
    minder dan vijf responses worden gebundeld") in dit geval onwaar.
    """
    grouped = _department_grouping(respondents)
    rest = [s for _d, v in grouped.items() if len(v) < MIN_SEGMENT_N for s in v]
    return 0 if len(rest) >= MIN_SEGMENT_N else len(rest)


def _department_segment_rows(respondents: list[dict]) -> list[dict]:
    """Segmentrijen voor het rapport (regels geport uit legacy report.py:1680-1795).

    Input: [{"department": str|None, "signal_score": float}] per afgeronde respondent.
    Kwalificatie: n >= MIN_SEGMENT_N per afdeling; minimaal 2 kwalificerende
    afdelingen (anders []); kleinere groepen samen als "Overige afdelingen"
    (alleen als die bucket zelf ook n >= MIN_SEGMENT_N haalt). Sortering:
    laagste gemiddelde eerst (grootste aandachtspunt bovenaan); "Overige
    afdelingen" altijd onderaan (na de sortering geappend).
    """
    grouped = _department_grouping(respondents)
    eligible = {d: v for d, v in grouped.items() if len(v) >= MIN_SEGMENT_N}
    if len(eligible) < 2:
        return []

    rows = [{"department": d, "n": len(v), "avg": round(sum(v) / len(v), 2),
             "scores": sorted(v), "is_pooled": False} for d, v in eligible.items()]
    rows.sort(key=lambda r: (r["avg"], -r["n"], r["department"]))

    # Geen rijlimiet (spec ronde 2 par. 3.2, bevinding B8): de sectie-intro
    # belooft dat alleen afdelingen onder de vijf responses gebundeld worden, en
    # met een cap van acht rijen was dat aantoonbaar onwaar. In scenario 10
    # verdwenen vijf afdelingen met 7 tot 9 responses in de restgroep, waaronder
    # de grootste afdeling van de meting: negen mensen onvindbaar, met een
    # uitleg die een andere reden noemde. De restgroep bundelt nu uitsluitend de
    # afdelingen die de privacydrempel niet halen.
    rest = [s for d, v in grouped.items() if d not in eligible for s in v]
    if len(rest) >= MIN_SEGMENT_N:
        rows.append({"department": "Overige afdelingen", "n": len(rest),
                     "avg": round(sum(rest) / len(rest), 2), "scores": sorted(rest),
                     "is_pooled": True})
    return rows


def _department_factor_rows(respondents: list[dict],
                            factor_items_map: dict[str, list]) -> dict[str, dict]:
    """Per afdeling: factorscores voor de segment-factorlaag (spec 2026-07-16 §3).

    Input per afgeronde respondent: {"department": str|None, "org_raw": dict}.
    Output per afdeling met >= MIN_SEGMENT_N respondenten:
      {dept: {"factors": [(fk, avg, n_factor)], "omitted": int}}

    Regels:
    - Alleen factoren in ORG_FACTOR_KEYS én factor_items_map doen mee
      (SDT-dimensies nooit; zelfde filter als _select_priority_factors).
    - Individuele factorscore = gemiddelde van de beantwoorde items van die
      respondent, geschaald via _scale_to_10. Geen beantwoorde items =
      respondent telt niet mee voor de n van die factor.
    - Per-factor-gate: factor alleen in "factors" bij n_factor >= MIN_SEGMENT_N;
      wat de gate niet haalt telt als "omitted" (eerlijke meldregel, geen stil gat).
    - "factors" gesorteerd laagste avg eerst; gelijkspel alfabetisch op key.
    """
    participating = [fk for fk in factor_items_map if fk in ORG_FACTOR_KEYS]
    grouped: dict[str, list[dict]] = {}
    for r in respondents:
        dept = r.get("department")
        if not dept:
            continue
        grouped.setdefault(str(dept), []).append(r.get("org_raw") or {})

    out: dict[str, dict] = {}
    for dept, raws in grouped.items():
        if len(raws) < MIN_SEGMENT_N:
            continue
        factors: list[tuple[str, float, int]] = []
        omitted = 0
        for fk in participating:
            keys = [ik for ik, _q in factor_items_map[fk]]
            scores: list[float] = []
            for raw in raws:
                vals = [float(raw[k]) for k in keys if raw.get(k) is not None]
                if vals:
                    scores.append(_scale_to_10(sum(vals) / len(vals)))
            if len(scores) >= MIN_SEGMENT_N:
                factors.append((fk, round(sum(scores) / len(scores), 2), len(scores)))
            else:
                omitted += 1
        factors.sort(key=lambda t: (t[1], t[0]))
        out[dept] = {"factors": factors, "omitted": omitted}
    return out


def build_report_data(campaign_id: str, db: Session) -> dict[str, Any]:
    camp: Campaign = (
        db.query(Campaign)
        .options(joinedload(Campaign.organization),
                 selectinload(Campaign.respondents).selectinload(Respondent.response))
        .filter(Campaign.id == campaign_id).first()
    )
    if not camp:
        raise ValueError(f"Campaign niet gevonden: {campaign_id}")

    org        = camp.organization
    scan_type  = camp.scan_type
    scan_meta  = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)

    _mode    = (camp.delivery_mode or "baseline").lower()
    mode_lbl = "Live" if _mode == "live" else "Baseline"
    scan_lbl = scan_meta.get("report_title",
        f"Loep Vertrek {mode_lbl}" if scan_type == "exit" else scan_meta["product_name"])
    now_str  = datetime.now(timezone.utc).strftime("%d-%m-%Y")

    respondents = camp.respondents
    completed   = [r for r in respondents if r.completed and r.response]
    responses: list[SurveyResponse] = [r.response for r in completed if r.response]
    n_completed = len(responses)
    # Noemer voor het responspercentage (spec ronde 2 par. 6.1). Bij de
    # self-send-flow bestaan er geen rijen voor wie niet invulde, dus daar zou
    # len(respondents) een respons van 100% suggereren. Liever geen getal dan
    # een onwaar getal: zonder noemer blijft completion None en zegt het rapport
    # in een hele zin waarom het percentage er niet staat.
    #
    # Geen getattr-fallback: de relatie delivery_record en de kolom
    # invited_count bestaan allebei in het model, dus een default zou geen
    # ontbrekend record afvangen maar een hernoeming, en dan zou ELK rapport
    # stil zijn responspercentage verliezen.
    _record = camp.delivery_record
    n_invited, n_invited_note = _respons_noemer(
        _record.invited_count if _record is not None else None,
        rows=len(respondents), completed=n_completed)
    completion  = round(n_completed / n_invited * 100, 1) if n_invited else None

    risk_sc  = [r.risk_score for r in responses if r.risk_score is not None]
    avg_risk = round(_mean(risk_sc), 2) if risk_sc else None
    eng_sc   = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_eng  = round(_mean(eng_sc), 2) if eng_sc else None
    to_sc    = [r.turnover_intention_score for r in responses if r.turnover_intention_score is not None]
    avg_to   = round(_mean(to_sc), 2) if to_sc else None
    si_sc    = [round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2)
                for r in responses if r.stay_intent_score is not None]
    avg_si   = round(_mean(si_sc), 2) if si_sc else None

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts: band_counts[r.risk_band] += 1

    pattern_input = [
        {"org_scores": r.response.org_scores, "sdt_scores": r.response.sdt_scores,
         "risk_score": r.response.risk_score, "signal_score": r.response.risk_score,
         "preventability": r.response.preventability,
         "exit_reason_code": r.response.exit_reason_code,
         "stay_intent_score": r.response.stay_intent_score,
         "direction_signal_score": r.response.stay_intent_score,
         "contributing_reason_codes": list((r.response.pull_factors_raw or {}).keys()),
         "department": r.department, "role_level": r.role_level}
        for r in completed
    ]
    pattern     = detect_patterns(pattern_input)
    has_pattern = pattern.get("sufficient_data", False)
    factor_avgs = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks   = pattern.get("top_risk_factors", []) if has_pattern else []
    strong_work = pattern.get("strong_work_signal_pct") if has_pattern else None
    top_exit_lbl = (pattern.get("top_exit_reasons", [{}])[0].get("label")
                    if has_pattern and pattern.get("top_exit_reasons") else None)
    top_cont_lbl = (pattern.get("top_contributing_reasons", [{}])[0].get("label")
                    if has_pattern and pattern.get("top_contributing_reasons") else None)
    top_fkeys   = [f for f, _ in top_risks[:2]]
    top_flabels = [FACTOR_LABELS_NL.get(f, f) for f in top_fkeys]

    sig_vis: float | None = None
    if scan_type == "exit":
        vis = [s.get("signal_visibility_score")
               for s in (((r.full_result or {}).get("exit_context_summary") or {}) for r in responses)
               if isinstance(s.get("signal_visibility_score"), (int, float))]
        if vis: sig_vis = _mean(vis)

    sdt_avgs: dict[str, float] = {}
    for dim in ("autonomy", "competence", "relatedness"):
        if dim in factor_avgs: sdt_avgs[dim] = factor_avgs[dim]
        else:
            vals = [r.sdt_scores.get(dim) for r in responses if r.sdt_scores and r.sdt_scores.get(dim) is not None]
            if vals: sdt_avgs[dim] = round(_mean(vals), 2)

    raw_acc: dict[str, list[float]] = defaultdict(list)
    for r in responses:
        for k, v in (r.sdt_raw or {}).items(): raw_acc[k].append(float(v))
        for k, v in (r.org_raw or {}).items(): raw_acc[k].append(float(v))
    sdt_item_avgs = {k: _scale_to_10(_mean(v), reverse=(k in SDT_REVERSE_ITEMS))
                     for k, v in raw_acc.items() if k.startswith("B")}
    org_item_avgs = {k: _scale_to_10(_mean(v))
                     for k, v in raw_acc.items() if not k.startswith("B")}

    exit_r_cnt  = Counter(r.exit_reason_code for r in responses if r.exit_reason_code)
    exit_r_dist = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in exit_r_cnt.most_common(5)]
    cont_cnt    = Counter()
    for r in responses:
        for k in (r.pull_factors_raw or {}).keys(): cont_cnt[k] += 1
    cont_dist   = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in cont_cnt.most_common(5)]
    prev_cnt    = Counter(r.preventability for r in responses if r.preventability)
    prev_dist   = dict(prev_cnt)

    raw_texts  = [r.open_text_raw for r in responses if r.open_text_raw and r.open_text_raw.strip()]
    open_texts = list(dict.fromkeys(anonymize_text(t) for t in raw_texts))

    # Verdiepingsvragen (spec 6): alleen exit/retention hebben verdiepingsdata.
    deepening_agg: dict[str, Any] = {}
    if scan_type in ("exit", "retention"):
        deepening_agg = aggregate_deepening(
            [(r.org_raw or {}, r.deepening_responses or []) for r in responses],
            scan_type)
        if not _deepening_campaign_active(deepening_agg):
            # Pre-feature campagne: nergens een verdieping aangeboden -> geen blokken.
            deepening_agg = {}

    # Richtingvraag (spec 2026-09-07 par. 5.3): zelfde campagne-gate-idee als de verdieping.
    direction_agg: dict[str, Any] = {}
    if scan_type in DIRECTION_SCAN_TYPES:
        direction_agg = aggregate_direction(
            [(r.org_raw or {}, r.direction_response) for r in responses], scan_type)
        if not any(a["offered"] > 0 for a in direction_agg.values()):
            direction_agg = {}

    is_retention      = scan_type == "retention"
    retention_profile = None
    if is_retention and avg_risk is not None:
        retention_profile = compute_retention_signal_profile(
            risk_score=avg_risk, engagement_score=avg_eng,
            turnover_intention_score=avg_to, stay_intent_score=avg_si)

    from backend.report import _build_exit_playbook_rows, _build_retention_playbook_rows
    exit_pbs = _build_exit_playbook_rows(top_risks=top_risks) if scan_type == "exit" and has_pattern else []
    ret_pbs  = (_build_retention_playbook_rows(top_risks=top_risks,
                    playbooks=product_module.get_action_playbooks_payload())
                if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload") else [])

    if is_retention:
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            retention_signal_profile=retention_profile,
            avg_engagement=avg_eng, avg_turnover_intention=avg_to,
            avg_stay_intent=avg_si, retention_theme_title=None, enps_summary=None)
    elif scan_type == "onboarding":
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            avg_stay_intent=avg_si, top_exit_reason_label=top_exit_lbl,
            top_contributing_reason_label=top_cont_lbl,
            strong_work_signal_pct=strong_work, signal_visibility_average=sig_vis,
            total_replacement_cost_eur=None)
    else:
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            top_exit_reason_label=top_exit_lbl, top_contributing_reason_label=top_cont_lbl,
            strong_work_signal_pct=strong_work, signal_visibility_average=sig_vis,
            enps_summary=None, total_replacement_cost_eur=None)

    nsp = product_module.get_next_steps_payload(
        top_focus_labels=top_flabels, top_focus_keys=top_fkeys)

    org_sections: list[dict] = scan_meta.get("org_sections", [])
    factor_items_map = {sec["key"]: sec["items"] for sec in org_sections
                        if "key" in sec and "items" in sec}
    factor_resp_scores = _per_respondent_factor_scores(
        factor_items_map, [r.org_raw or {} for r in responses])
    sdt_items: list[tuple[str, str]] = scan_meta.get("sdt_items", [])

    # Segment op GEZONDHEID (11 - risk), niet op risk zelf: _department_segment_rows
    # + _segment_block behandelen signal_score als health-schaal (laag = rood =
    # aandachtspunt, sortering laagste eerst). Rechtstreeks de risk-score voeden
    # keerde de polariteit om — de gezondste afdeling werd als grootste
    # aandachtspunt/startpunt gemarkeerd, de slechtste als "relatief sterk".
    _segment_input = [
        {"department": r.department,
         "signal_score": _signal_health(r.response.risk_score)}
        for r in completed
    ]
    segment_rows = _department_segment_rows(_segment_input)
    segment_rows = _enrich_segment_rows_with_invited(segment_rows, camp.segment_departments)
    # Responses die door de privacygrens buiten de tabel vallen zonder in een
    # restgroep te belanden; _segment_block meldt dit aantal onder de tabel.
    segment_hidden_n = _segment_hidden_n(_segment_input)

    # Factorlaag per afdeling (spec 2026-07-16): laagste thema + uitsplitsing.
    segment_factor_rows = _department_factor_rows(
        [{"department": r.department, "org_raw": r.response.org_raw or {}} for r in completed],
        factor_items_map)

    # eNPS staat canoniek in full_result["enps"]["raw_score"] (zoals de submit-flow
    # het wegschrijft, backend/products/*/scoring.py). Voorheen werd hier het
    # topniveau "enps_score" gelezen — een sleutel die de echte flow nooit schrijft,
    # waardoor enps_available voor elke echte campagne False werd en het rapport
    # onterecht "niet gemeten in deze wave" meldde.
    enps_vals = [float(fr["enps"]["raw_score"]) for r in responses
                 if isinstance((fr := (r.full_result or {})).get("enps"), dict)
                 and fr["enps"].get("raw_score") is not None]
    enps_available = len(enps_vals) >= MIN_QUOTES_N
    enps_score: int | None = None
    if enps_available:
        promoters  = sum(1 for v in enps_vals if v >= 9)
        detractors = sum(1 for v in enps_vals if v <= 6)
        enps_score = round((promoters - detractors) / len(enps_vals) * 100)

    return dict(
        campaign_id=campaign_id, scan_type=scan_type, scan_lbl=scan_lbl,
        org_name=org.name if org else "", campaign_name=camp.name,
        generated_at=now_str, delivery_mode=mode_lbl,
        n_invited=n_invited, n_invited_note=n_invited_note,
        n_completed=n_completed, completion_pct=completion,
        avg_risk=avg_risk, avg_eng=avg_eng, avg_to=avg_to, avg_si=avg_si,
        band_counts=band_counts, has_pattern=has_pattern,
        factor_avgs=factor_avgs, top_risks=top_risks,
        top_fkeys=top_fkeys, top_flabels=top_flabels,
        strong_work=strong_work, top_exit_lbl=top_exit_lbl, top_cont_lbl=top_cont_lbl,
        sig_vis=sig_vis, sdt_avgs=sdt_avgs,
        sdt_item_avgs=sdt_item_avgs, org_item_avgs=org_item_avgs,
        exit_r_dist=exit_r_dist, cont_dist=cont_dist,
        prev_dist=prev_dist, open_texts=open_texts,
        deepening_agg=deepening_agg,
        direction_agg=direction_agg,
        retention_profile=retention_profile,
        exit_pbs=exit_pbs, ret_pbs=ret_pbs, msp=msp, nsp=nsp,
        factor_items_map=factor_items_map, sdt_items=sdt_items,
        enps_available=enps_available, enps_score=enps_score,
        factor_resp_scores=factor_resp_scores,
        intent_resp={"stay": si_sc, "turnover": to_sc, "engagement": eng_sc},
        segment_rows=segment_rows,
        segment_factor_rows=segment_factor_rows,
        segment_hidden_n=segment_hidden_n,
    )


# ─── Overzichtsprofiel (T6) ──────────────────────────────────────────────────

def _rag_color(score: float | None) -> str:
    # Drempels op de getoonde score (1 decimaal) via zone_color, dat afrondt
    # (B15). De ladder zelf staat in report_distribution: stond hij ook hier,
    # dan schoof een verzette drempel de balken wel en de spreidingsstrook niet
    # (spec ronde 2 par. 7b). Alleen de kleur voor "geen score" is eigen.
    if score is None: return "#CBD5E1"
    return zone_color(score)


def _factor_bar_row(label: str, score: float | None) -> str:
    pct = int((score or 0) / 10 * 100)
    col = _rag_color(score)
    interp = _factor_label(score)
    track = (f'<svg width="100%" height="14" viewBox="0 0 200 14" preserveAspectRatio="none">'
             f'<rect x="0" y="3" width="200" height="8" fill="#EDE6DA"/>'
             f'<rect x="0" y="3" width="{pct*2}" height="8" fill="{col}"/></svg>')
    return (f'<div class="fbar-row"><div class="fbar-name">{_h(label)}</div>'
            f'<div class="fbar-track">{track}</div>'
            f'<div class="fbar-score" style="color:{col};">{_score_str(score)}</div>'
            f'<div class="fbar-label" style="color:{col};">{_h(interp)}</div></div>')


def _overzicht_summary_and_bands(profile_factors: list[tuple[str, float | None]]) -> tuple[str, dict[str, list[str]]]:
    """Bouwt de samenvattingszin + band-indeling voor het overzichtsprofiel.

    Sorteert eerst op score: voorheen werd de eerste factor in kolomvolgorde
    genoemd ("Leiderschap vraagt als eerste aandacht") terwijl de rest van het
    rapport de laagst scorende factor vooropzet — het rapport sprak zichzelf tegen.
    """
    ranked = sorted([(l, s) for l, s in profile_factors if s is not None], key=lambda x: x[1])
    # Indeling via _factor_label: zelfde (afgeronde) drempels als de balken (B15).
    kwetsbaar = [l for l, s in ranked if _factor_label(s) == "Kwetsbaar punt"]
    aandacht  = [l for l, s in ranked if _factor_label(s) == "Aandachtspunt"]
    sterk     = [l for l, s in ranked if _factor_label(s) == "Relatief sterk"]
    if kwetsbaar and sterk:
        summary = (f"{kwetsbaar[0]} is het {'enige' if len(kwetsbaar) == 1 else 'duidelijkste'} "
                   f"kwetsbare punt. {sterk[-1]} vormt een relatief sterke basis.")
    elif kwetsbaar:
        summary = f"{kwetsbaar[0]} is het duidelijkste kwetsbare punt; geen enkele factor scoort relatief sterk."
    elif aandacht:
        summary = f"Geen factor scoort kritisch. De laagste score zit bij {aandacht[0]}."
    elif sterk:
        summary = "Factorprofiel toont een overwegend relatief sterk beeld."
    else:
        # Geen enkele factorscore beschikbaar: eerlijk degraderen i.p.v. een
        # positieve claim zonder data (fail-loud). Bewust zonder "(<10)": de
        # lege staat hangt aan een leeg factorprofiel, niet aan het
        # responsaantal -- scoring.factor_averages laat ook een factor zonder
        # waarden weg. Zie _geen_factorprofiel_note voor dezelfde correctie.
        summary = ("Voor deze meting zijn er geen scores per factor berekend, "
                   "dus staat hier nog geen profiel.")
    return summary, {"kwetsbaar": kwetsbaar, "aandacht": aandacht, "sterk": list(reversed(sterk))}


def _overzichtsprofiel(factors: list[tuple[str, float | None]],
                       summary: str = "", bands: dict[str, list[str]] | None = None,
                       opener_html: str = "", *, scan_type: str) -> str:
    """scan_type is verplicht en heeft bewust geen default: de rangorde-zin in
    de intro is scan-afhankelijk (zie OVERZICHTSPROFIEL_RANGORDE) en een stille
    terugval zou in een van de drie rapporten een onware regel afdrukken."""
    ranked = sorted(factors, key=lambda x: (x[1] is None, x[1]))
    rows = "".join(_factor_bar_row(lbl, sc) for lbl, sc in ranked)
    # Legendatermen = exact dezelfde woorden als _factor_label (rijlabels, p.02,
    # verdieping-titels). Voorheen zei de legenda "aandachtspunt/gemengd" waar de
    # rijen "Kwetsbaar punt/Aandachtspunt" zeiden — drie labelsets voor dezelfde
    # drempels op één pagina.
    legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
              f'<span style="color:{RAG_HIGH};">&#9632;</span> kwetsbaar punt &nbsp; '
              f'<span style="color:{RAG_MID};">&#9632;</span> aandachtspunt &nbsp; '
              f'<span style="color:{RAG_LOW};">&#9632;</span> relatief sterk</p>')
    summary_html = (
        f'<p style="font-size:11px;color:#374151;max-width:66ch;margin-bottom:18px;">{_h(summary)}</p>'
        if summary else ""
    )
    # Uitsplitsing per band (dezelfde kwetsbaar/aandacht/sterk-indeling die de
    # summary-zin al gebruikt) als leesbare tekst i.p.v. alleen balkjes.
    # Onder elkaar en groter i.p.v. drie smalle kolommen (feedback 2026-07-16):
    # de pagina was half leeg en de kolommen lazen als voetnoot.
    breakdown_html = ""
    if bands:
        blocks = ""
        band_meta = [
            ("kwetsbaar punt", bands.get("kwetsbaar") or [], RAG_HIGH),
            ("aandachtspunt", bands.get("aandacht") or [], RAG_MID),
            ("relatief sterk", bands.get("sterk") or [], RAG_LOW),
        ]
        for title, labels, color in band_meta:
            if not labels:
                continue
            items = "".join(f"<li>{_h(lbl)}</li>" for lbl in labels)
            blocks += (f'<div style="margin-bottom:18px;">'
                       f'<div style="font-family:\'JetBrains Mono\', monospace;font-size:9.5px;letter-spacing:0.1em;'
                       f'text-transform:uppercase;color:{color};margin-bottom:7px;">{_h(title)} ({len(labels)})</div>'
                       f'<ul style="font-size:11.5px;color:#243247;line-height:1.9;margin:0;padding-left:16px;">{items}</ul>'
                       f'</div>')
        if blocks:
            breakdown_html = f'<div style="margin-top:26px;">{blocks}</div>'
    # Niet via _intro(): de rangorde-zin hangt van de scan af, maar hoort in
    # dezelfde alinea als het gedeelde deel (beide UNESCAPED, zie SECTION_INTROS).
    #
    # Zonder factorscores rendert die intro niet (eind-tot-eind-lezing van
    # stresstest 07): hij beschrijft "elke factor hieronder" en belooft dat je
    # verderop per factor ziet welke signalen in de volgorde meewogen -- op een
    # pagina zonder factoren, in een rapport zonder volgorde. De summary-zin
    # draagt dan de hele boodschap. Om dezelfde reden vervalt de legenda: die
    # legt de kleuren van balken uit die er niet zijn.
    if rows:
        intro_html = (f'<p class="sec-intro">{SECTION_INTROS["overzichtsprofiel"]} '
                      f'{OVERZICHTSPROFIEL_RANGORDE[scan_type]}</p>')
    else:
        intro_html = ""
        legend = ""
    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Overzichtsprofiel</span>'}
  {intro_html}
  {summary_html}
  <div class="card">{rows}{legend}{breakdown_html}</div>
</div>"""


# ─── Vertrekcontext (T7) ──────────────────────────────────────────────────────

def _vertrekcontext(*, exit_reasons: list[tuple[str, int]],
                    contributing: list[tuple[str, int]], n: int,
                    primary_factor_label: str, opener_html: str = "",
                    has_profile: bool = True) -> str:
    """has_profile volgt dezelfde schakelaar als de degraded p.02-alinea.

    Zonder factorprofiel verwijzen twee zinnen op deze pagina naar iets dat er
    niet is: de sectie-intro belooft factorscores verderop, en de kaart
    "Relatie met het overzichtsprofiel" noemt "de factoren die bovenaan de
    rangorde staan" en "de factordiepte hierna". De redenen zelf blijven staan
    -- die komen rechtstreeks uit de antwoorden en zijn er wel."""
    def _reason_rows(items: list[tuple[str, int]]) -> str:
        return "".join(
            f'<tr><td class="iq">{_h(lbl)}</td>'
            f'<td class="is">{cnt}&times;</td></tr>'
            for lbl, cnt in items[:3]
        ) or '<tr><td class="iq" style="color:#94A3B8;">Geen reden geregistreerd</td><td class="is"></td></tr>'

    rel = ""
    if exit_reasons and primary_factor_label and \
       primary_factor_label.lower() in exit_reasons[0][0].lower():
        # Positieclaim, geen laagste-claim (bug B1, ronde 2): primary_factor_label
        # is het raster-startpunt (_raster_primary_label), en dat is bij Loep
        # Vertrek niet altijd de laagst scorende factor -- zie de guard bij de
        # kernzin in render_exit_report_html, waarmee deze zin één verhaal vormt.
        #
        # NB deze tak is met de echte EXIT_REASON_LABELS_NL onbereikbaar: geen
        # vertrekredenlabel bevat een volledig factorlabel als substring. Hij
        # blijft staan voor toekomstige copy-wijzigingen aan die labels en wordt
        # met een synthetisch label getest in tests/test_report_exit_kernzin.py.
        rel = (f"<p style='margin-bottom:0;'>{_h(primary_factor_label)} staat bovenaan "
               f"in de rangorde en is tegelijk de meest genoemde vertrekreden.</p>")
    else:
        # Geen substring-match tussen hoofdreden en startpunt: benoem beide
        # feiten zonder een verbandclaim ("versterken elkaar") die de data niet
        # draagt. De factordiepte toont de bovenste rasterrijen, niet per se de
        # laagst scorende factor -- dus verwijst deze zin naar de rangorde.
        rel = (f"<p style='margin-bottom:0;'>De meest genoemde reden en de factorscores "
               f"belichten elk een eigen invalshoek. De factoren die bovenaan de "
               f"rangorde staan, komen terug in de factordiepte hierna.</p>")

    rel_card = (f'<div class="card navy" style="background:#fff;">'
                f'<h3>Relatie met het overzichtsprofiel</h3>{rel}</div>'
                ) if has_profile else ""

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Vertrekcontext</span>'}
  {_intro("vertrekcontext" if has_profile else "vertrekcontext_geen_profiel")}
  <div class="tcol">
    <div class="tc-l"><div class="card accent"><h3>Hoofdredenen van vertrek (top 3)</h3>
      <table class="item-tbl">{_reason_rows(exit_reasons)}</table></div></div>
    <div class="tc-r"><div class="card"><h3>Speelde ook mee</h3>
      <table class="item-tbl">{_reason_rows(contributing)}</table></div></div>
  </div>
  {rel_card}
</div>"""


# ─── Behoudscontext (T7-retention) ───────────────────────────────────────────

def _behoudscontext(*, retention_score: float | None, stay_intent: float | None,
                    turnover: float | None, engagement: float | None,
                    intent_resp: dict | None = None,
                    opener_html: str = "") -> str:
    """Retention-exclusive section: actuele behoudscontext op groepsniveau.

    Signalen staan bewust onder elkaar (niet naast elkaar in één balk): titel
    eerst, dan de uitleg van wat het meet, dan pas de score — anders valt de
    uitleg weg onder de opvallende cijfers (feedback: Behoudssignaal en
    Blijfintentie waren zo nauwelijks te onderscheiden).
    """
    rows = ""
    if retention_score is not None:
        # retention_score = _signal_health(avg_risk): GEZONDHEIDS-schaal, hoog =
        # goed (B4). Note en kleur komen uit dezelfde ladder als de kernzin-band
        # (_band_key), zodat er nooit een derde drempelset naast de intro-copy
        # ("onder de 5,0 kwetsbaar ... vanaf 6,5 relatief sterk") ontstaat.
        _k = _band_key(retention_score, "retention")
        col = _RETENTION_BANDS[_k][1]
        note = {"HOOG": "onder druk", "MIDDEN": "vraagt aandacht", "LAAG": "sterk"}[_k]
        rows += (f'<div class="sigrow"><div class="sigrow-title">Behoudssignaal</div>'
                 f'<div class="sigrow-body">Werkfactoren en werkbeleving samengebracht op groepsniveau.</div>'
                 f'<div><span class="sigrow-score" style="color:{col};">{retention_score:.1f}/10</span>'
                 f'<span class="sigrow-note">{note}</span></div></div>')
    if stay_intent is not None:
        scol = _rag_color(stay_intent)
        rows += (f'<div class="sigrow"><div class="sigrow-title">Blijfintentie</div>'
                  f'<div class="sigrow-body">&ldquo;Als het aan mij ligt, werk ik over 12 maanden nog steeds hier.&rdquo; '
                  f'Enkelvoudige richtingsvraag, indicatief.</div>'
                  f'<div><span class="sigrow-score" style="color:{scol};">{stay_intent:.1f}/10</span></div></div>')
    if turnover is not None:
        _tv = _shown(turnover)  # note + kleur op de getoonde score (B15)
        # Kleur en note komen uit dezelfde zone-as als de spreidingsstrook op de
        # volgende pagina (spec ronde 2 par. 7b). Eerder kleurde deze rij via een
        # eigen spiegeling (_rag_color(10 - _tv)): bij vertrekintentie 4.0 gaf dat
        # een amber rij boven een teal stip, dezelfde tegenspraak als de gespiegelde
        # getallen, alleen in kleur. De grenzen zijn daarom ZONE_LOW en ZONE_HIGH,
        # en strikt kleiner-dan: 5,0 zelf hoort in het midden, 6,5 zelf bovenin,
        # precies zoals de strook de stip indeelt. De grens van 3,0 splitst binnen
        # de laagste zone ("laag" of "beperkt", allebei weinig vertrekgedachten) en
        # valt daarom niet samen met een zonegrens.
        tcol = zone_color(_tv, invert_scale=True)
        note = ("laag" if _tv <= 3.0 else
                "beperkt" if _tv < ZONE_LOW else
                "zichtbaar" if _tv < ZONE_HIGH else
                "hoog: actief vertrekrisico")
        rows += (f'<div class="sigrow"><div class="sigrow-title">Vertrekintentie</div>'
                  f'<div class="sigrow-body">&ldquo;Ik denk er serieus over na te vertrekken&rdquo; + &ldquo;Ik zoek actief.&rdquo; '
                  f'Gemiddelde van 2 stellingen.</div>'
                  f'<div><span class="sigrow-score" style="color:{tcol};">{turnover:.1f}/10</span>'
                  f'<span class="sigrow-note">{note}</span></div></div>')
    if engagement is not None:
        ecol = _factor_color(engagement)
        _ev = _shown(engagement)  # note op de getoonde score (B15)
        note = ("hoog" if _ev >= 7.5 else
                "gemiddeld" if _ev >= 6.0 else
                "laag: geen buffer" if _ev >= 4.5 else
                "zorgelijk laag")
        rows += (f'<div class="sigrow"><div class="sigrow-title">Bevlogenheid</div>'
                  f'<div class="sigrow-body">Energie &middot; Inspiratie &middot; Zin om te gaan (UWES). Gemiddelde van 3 stellingen.</div>'
                  f'<div><span class="sigrow-score" style="color:{ecol};">{engagement:.1f}/10</span>'
                  f'<span class="sigrow-note">{note}</span></div></div>')

    stat_rows = f'<div class="card">{rows}</div>' if rows else ""

    strips = ""
    for key, label, invert in (
        ("stay", "Blijfintentie", False),
        # Vertrekintentie is hoog=slecht; distribution_block is health-georiënteerd
        # (rechts/hoog = teal = sterk). Eerder werd de waarde gespiegeld (11 - v)
        # zodat de kleuren klopten, maar dan toonde de strook 7.6 waar de rij
        # erboven 3.4 zei: twee getallen voor dezelfde vraag. Nu draait alleen de
        # kleurschaal om en blijft het getal hetzelfde (spec ronde 2 par. 7b).
        ("turnover", "Vertrekintentie (hoe hoger, hoe meer vertrekgedachten)", True),
        ("engagement", "Bevlogenheid", False),
    ):
        vals = [v for v in (intent_resp or {}).get(key, []) if v is not None]
        blk = distribution_block(vals, width=660, height=52, dot_r=4.5, label_size=9,
                                 invert_scale=invert)
        if blk:
            strips += (f'<div style="margin-top:26px;"><div class="spread-title">'
                       f'{label}</div>{blk}</div>')

    page = f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Behoudscontext</span>'}
  {_intro("behoudscontext")}
  {stat_rows}
</div>"""

    # Spreidingsbalken samen op een eigen pagina (feedback 2026-07-16): onder
    # de sigrows braken ze onvoorspelbaar over de paginagrens (derde balk
    # verweesd op een eigen pagina) en waren ze klein. Nu: eigen pagina,
    # groot formaat, met een korte leesuitleg.
    if strips:
        page += f"""<div class="pb sec">
  {_ChapterCounter.vervolg("Behoudscontext")}
  <h3>Spreiding per signaal</h3>
  <p class="sec-intro" style="margin-top:2px;">Elke stip is &eacute;&eacute;n respondent; de donkere lijn markeert het
    groepsgemiddelde. Zo zie je of een gemiddelde &eacute;&eacute;n gedeelde ervaring beschrijft
    of juist twee uiteenlopende groepen.</p>
  {strips}
</div>"""
    return page


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    fl          = _friction_label(avg_risk)
    fcol        = _friction_color(avg_risk)
    rdsp        = _score_str(avg_risk)
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fa          = data["factor_avgs"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    ch          = _ChapterCounter()

    # ── Prioriteringsraster-rangorde (spec 2026-07-18 par. 4: één ranking per
    # rapport) — vroeg berekend zodat zowel de Bestuurlijke read (p.02) als de
    # verdieping-detailkeuze én de sluitende gespreksagenda dezelfde volgorde
    # gebruiken. ────────────────────────────────────────────────────────────
    _code_to_count = {r["code"]: r["count"] for r in data["exit_r_dist"]}
    exit_code_counts = {fk: _code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in fa}
    deep_agg = data.get("deepening_agg") or {}
    direction_agg = data.get("direction_agg") or {}
    _raster_labels = {fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS}
    _raster_rows = rank_factors(
        "exit", fa, data.get("factor_resp_scores") or {}, deep_agg,
        exit_reason_counts=exit_code_counts,
        labels=_raster_labels,
        direction_agg=direction_agg)

    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    bottom_2 = [fk for fk, _ in sorted_f[:2]]
    top_2    = [fk for fk, _ in sorted_f[-2:]]
    low_f    = sorted_f[0]  if sorted_f else None
    high_f   = sorted_f[-1] if sorted_f else None

    # ── Executive summary ─────────────────────────────────────────────────────
    low_lbl  = _fl(low_f[0], "exit")  if low_f  else ""
    high_lbl = _fl(high_f[0], "exit") if high_f else ""
    high_sc  = high_f[1]                            if high_f else None

    # Eén waarheid voor "de primaire factor" door het hele rapport heen (spec
    # 2026-07-18 par. 4): cover, vertrekcontext en why-tabel wijzen allemaal de
    # rasterrij bovenaan aan, en niet de ruwe laagste score. Die twee kunnen
    # uiteenlopen zodra een vlag een near-tie beslecht of het vertrekredengewicht
    # de volgorde verschuift; de kernzin noemt ze dan apart (_p02_opening).
    # Kale streep als laatste terugval verwijderd (bug B2): die belandde zo op
    # de cover en in de kernzin. Leeg betekent hier "geen factorprofiel"; de
    # cover en de kernzin vullen dat zelf eerlijk in.
    _raster_primary_label = _raster_rows[0]["label"] if _raster_rows else (low_lbl or high_lbl or "")
    _geen_profiel = not _raster_rows

    # ── Cover ─────────────────────────────────────────────────────────────────
    opening_q = "Wat speelde mee bij vertrek?"
    primary_signal = _raster_primary_label or GEEN_FACTORPROFIEL_LBL
    cover_stats = [
        ("Respondenten", str(n)),
        _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
        ("Eerste aandachtspunt", primary_signal),
    ]
    s = _cover(scan_label=data["scan_lbl"], scan_type="exit", org_name=data["org_name"],
               period=data["campaign_name"], opening_question=opening_q, stats=cover_stats)
    er_top   = data["exit_r_dist"][0]["label"] if data["exit_r_dist"] else ""

    # Directe executive copy
    # Kernzin (ronde 2, B17): volgt de vorm van het profiel, niet de band van de
    # frictiescore. Die score staat nu met haar band in de onderbouwingsrij
    # eronder. De zin claimt bewust NIET dat het startpunt "het laagst scoort"
    # (bug B1, stresstest ronde 1): het raster-startpunt is bij Loep Vertrek by
    # design niet altijd de laagste factor -- de vertrekreden-weging
    # (EXIT_REASON_WEIGHT) en de spreidings-/verdiepingsvlaggen kunnen een
    # andere factor bovenaan zetten. Vallen de laagste factor en het startpunt
    # uiteen, dan noemt _p02_opening ze apart; waarom die factor bovenaan staat,
    # legt _raster_attribution uit in de bronregel onder de gespreksopener op
    # dezelfde pagina.
    _shape = profile_shape(fa)
    _primary = _raster_rows[0]["key"] if _raster_rows else None
    # Score van het startpunt: de richtingregel hieronder heeft 'm nodig om te
    # zien of dit onderwerp kwetsbaar scoort (staat split_none, ronde 2 par. 4.3).
    _primary_score = _raster_rows[0]["score"] if _raster_rows else None
    _tk, _chg, _chg_other, _delta = _p02_startpunt_gronden(_raster_rows)
    exec_line = _p02_opening(
        scan_type="exit", shape=_shape, labels=_raster_labels, primary_key=_primary,
        tie_break_kind=_tk, change=_chg, change_other=_chg_other, next_delta=_delta,
        direction_state_key=_p02_direction_key(direction_agg, _primary),
        indicatief=_respons_indicatief(data["n_completed"], data["n_invited"]))
    _signal_cell = _p02_signal_cell("Frictiescore", rdsp if avg_risk else "",
                                    fl if avg_risk else "")
    # De vertrekredenzin hangt achter de kernzin, maar de noemer hoort bij de
    # claim die hij relativeert (het startpunt), niet bij een redentelling. Hij
    # wordt daarom pas na _p02_met_respons aangehaakt.
    _er_zin = f" {er_top} is de meest genoemde vertrekreden." if (exec_line and er_top) else ""
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not avg_risk
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus de frictiescore blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"De frictiescore van {rdsp} wijst op een {fl.lower()}." if avg_risk
                     else "Zie de vertrekcontext en de responsbasis voor wat dit rapport wel toont.")

    # Sterke factor bewust NIET in de titel: die staat al in de subtekst
    # (totaalbeeld) — voorheen stond dezelfde observatie 2x binnen 4 regels.

    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"],
                                 verwijzing=_verwijst) + _er_zin

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    # Build why_cells for the primary (lowest-scoring) factor
    if _raster_rows:
        tf      = _raster_rows[0]["key"]
        # _fl (niet de generieke FACTOR_LABELS_NL), zelfde bron als
        # _raster_rows[0]["label"]: code-review Taak 6 ving anders een
        # zichtbare labelinconsistentie tussen p.02 en het raster voor
        # dezelfde factor (bijv. "Werkbelasting" vs "Werkdruk en balans").
        # retention/onboarding gebruiken hier al _fl (zie tf_lbl_ verderop).
        tf_lbl  = _fl(tf, "exit")
        tf_sc   = fa.get(tf)
        tf_col  = _factor_color(tf_sc)
        tf_fl   = _factor_label(tf_sc)
        tf_code = FACTOR_EXIT_CODE.get(tf)
        er_n    = next((r["count"] for r in data["exit_r_dist"] if r["code"] == tf_code), 0) if tf_code else 0
        cont_n  = next((r["count"] for r in data["cont_dist"]   if r["code"] == tf_code), 0) if tf_code else 0

        items_in   = fim.get(tf, [])
        i_scores   = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item   = min(i_scores, key=lambda x: x[2]) if i_scores else None

        _deep_agg_early = data.get("deepening_agg") or {}
        why_cells = ""
        if er_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Hoofdreden</div><div class="why-v" style="color:{tf_col};">{er_n}&times;</div><div class="why-b">van {n} vertrekkers de meest genoemde reden</div></td>'
        if tf_sc:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(tf_fl.lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if cont_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Speelt ook mee</div><div class="why-v">{cont_n}&times;</div><div class="why-b">als meespelende context</div></td>'

        primary_fkey  = tf
        primary_label = tf_lbl
        # Datagedreven vraag (uit de meest gekozen verdiepings-toelichting)
        # wanneer beschikbaar; anders de generieke per-factor vraag.
        _short_q = _short_mgmt_q(_deep_agg_early, "exit", tf)
        if _short_q:
            br_mgmt_q = _short_q
            br_mgmt_q_source = "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping."
        else:
            br_mgmt_q = _mgmt_q(tf, "exit")
            br_mgmt_q_source = _raster_attribution(_raster_rows, "exit")
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        br_mgmt_q     = _mgmt_q(low_f[0], "exit") if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Degraded pagina twee (bug B2): geen factorprofiel, dus geen why-blok en
    # geen gespreksopener -- wel een expliciete alinea over wat er bij dit
    # aantal antwoorden wel en niet te zeggen valt.
    br_degraded_note = ""
    if _geen_profiel:
        br_degraded_note = _geen_factorprofiel_note(
            n,
            drempelzin=(f"Dat profiel vraagt minimaal {MIN_AGGREGATE_N} antwoorden; "
                        f"daaronder bepaalt één vertrekker te veel het beeld."),
            wel=["de opgegeven vertrekredenen" if data["exit_r_dist"] else "",
                 "de werkbeleving van de vertrekkers" if sdt_a else "",
                 "de werkgeversaanbeveling" if (data["enps_available"]
                                                and data["enps_score"] is not None) else "",
                 "de responsbasis onderaan deze pagina"],
        )

    # Subtekst herhaalt de titel niet meer: alleen wat NIEUW is — de sterke
    # factor mét score. De responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél werkt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and _raster_primary_label != high_lbl and _factor_label(high_sc) == "Relatief sterk" else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        # Exit meet uitgestroomde medewerkers, niet het hele personeelsbestand —
        # "Alle medewerkers" was feitelijk onjuist op het eerlijkheidsanker (C3).
        population="Uitgestroomde medewerkers",
        segment_available=bool(data.get("segment_rows")),
        segment_reason="te weinig responses per groep voor herleidbaarheid",
        enps_available=data["enps_available"],
        compact=True,
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        totaalbeeld=totaalbeeld,
        primary_label=primary_label,
        why_cells_html=why_cells,
        strong_label=high_lbl,
        strong_score=high_sc,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"], degraded=bool(br_degraded_note)),
        direction_line=_direction_p02_line(direction_agg, _primary, "exit",
                                           factor_score=_primary_score),
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
        signal_cell_html=_signal_cell,
    )

    # ── Vertrekcontext (p.04 — vóór factorprofiel) ───────────────────────────
    exit_reasons = [(r["label"], r["count"]) for r in data["exit_r_dist"]]
    contributing = [(r["label"], r["count"]) for r in data["cont_dist"]]
    s += _vertrekcontext(exit_reasons=exit_reasons, contributing=contributing,
                         n=n, primary_factor_label=_raster_primary_label,
                         opener_html=ch.opener("Wat speelde mee bij vertrek?", kicker="Vertrekcontext"),
                         has_profile=not _geen_profiel)

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, "exit"), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"), scan_type="exit")

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    def _factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        # ── Data logic (preserved from old helper) ──
        lbl    = _fl(fk, "exit")
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Item table rows; het laagste item wordt vet — dat vervangt de aparte
        # "Laagste item"-kaart die bij 3 items pure herhaling van deze tabel was.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): de trefwoord-
        # selectie had dezelfde negatie-blindheid als de classificatie die eerder
        # uit _themed_quotes is verwijderd (besluit 2026-04-09). Alle quotes staan
        # integraal (geanonimiseerd) in de quotes-sectie; duiding in de bespreking.
        # ── Exit reason context block ──
        er_count = exit_code_counts.get(fk, 0)
        if er_count > 0:
            er_context = f'<div class="card accent">{er_count}&times; genoemd als vertrekreden: directe link met vertrekcontext.</div>'
        else:
            er_context = ""
        # ── Lowest / highest item cards — alleen bij >3 items; bij 3 items zijn
        # ze pure herhaling van de itemtabel (2 van de 3 rijen stonden dubbel) ──
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        # NB: het statische "Eerste managementvraag"-navy-blok is hier bewust weg —
        # dezelfde template-vraag stond al op p.02 en 3x op de verdiepingspagina's;
        # de data (items + toelichting + quote) draagt deze pagina zelf.
        deep_block = (_deepening_block(deep_agg[fk], "exit", fk)
                      if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {er_context}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, "exit")
            _opener = ch.opener(f"Verdieping: {_lbl}") if _i == 0 else _ChapterCounter.vervolg(f"Verdieping: {_lbl}")
            s += _factor_detail(_pfk, opener_html=_opener, intro_html=_intro("verdieping") if _i == 0 else "")
    else:
        s += f'<div class="pb sec">{ch.opener("Verdieping: prioritaire factoren")}<div class="empty-state">{VERDIEPING_GEEN_RANGORDE}</div></div>'

    # ── SDT basisbehoeften ────────────────────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

    for dim in ("autonomy", "competence", "relatedness"):
        sc    = sdt_a.get(dim)
        col   = _rag_color(sc)
        fl_   = _factor_label(sc)
        tbl   = _sdt_item_tbl(dim)
        if not tbl: continue
        s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
    s += "</div>"

    # ── eNPS ─────────────────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""
    # Niet gemeten: geen eigen (vrijwel lege) pagina — de Datastatus op de
    # responsbasis-pagina en de appendix-notitie melden dit al (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type="exit", opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} respondentstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, "exit", top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    _enriched_q = (_deepening_mgmt_q(deep_agg, "exit", _startpunt_fk)
                   if _startpunt_fk else None)
    # Het richtingblok wordt hier gebouwd, niet in _prioriteringsraster (bug
    # B3): alleen zo kan de methodiekpagina verderop beloven wat dit rapport
    # daadwerkelijk bevat in plaats van wat er aan data bestaat.
    _dir_block = _wat_moet_gebeuren_block(_raster_rows, direction_agg, "exit", n)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type="exit",
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, "exit") if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
        direction_agg=direction_agg,
        n_total=n,
        direction_block_html=_dir_block,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = _fl(fk, "exit")
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT): B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page("exit", opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"),
                     ranking_active=not _geen_profiel,
                     direction_active=bool(_dir_block),
                     direction_degraded=bool(_dir_block) and not _raster_rows)
    return _doc(f"Loep Vertrek · {data['campaign_name']}", s, scan_type="exit")


# ─── RetentieScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    ST          = "retention"
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    avg_eng     = data["avg_eng"]
    avg_to      = data["avg_to"]
    avg_si      = data["avg_si"]
    # Behoudssignaal op de gezondheidsschaal (B4): één omkering, hier, en
    # daarna overal dezelfde waarde (band, kernzin, behoudscontext).
    signal      = _signal_health(avg_risk)
    band_lbl, band_col = _band(signal, ST)
    fa          = data["factor_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    ch          = _ChapterCounter()

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    low_f       = sorted_f[0]  if sorted_f else None
    high_f      = sorted_f[-1] if sorted_f else None
    low_lbl     = _fl(low_f[0], ST)  if low_f  else ""
    high_lbl    = _fl(high_f[0], ST) if high_f else ""
    high_sc     = high_f[1] if high_f else None

    # ── Prioriteringsraster-rangorde (spec 2026-07-18 par. 4: één ranking per
    # rapport) — vroeg berekend zodat zowel de Bestuurlijke read (p.02) als de
    # verdieping-detailkeuze én de sluitende gespreksagenda dezelfde volgorde
    # gebruiken. ────────────────────────────────────────────────────────────
    deep_agg = data.get("deepening_agg") or {}
    direction_agg = data.get("direction_agg") or {}
    _raster_labels = {fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS}
    _raster_rows = rank_factors(
        "retention", fa, data.get("factor_resp_scores") or {}, deep_agg,
        labels=_raster_labels,
        direction_agg=direction_agg)

    # Eén waarheid voor "de primaire factor" door het hele rapport heen (spec
    # 2026-07-18 par. 4) -- zie identieke fix + toelichting in
    # render_exit_report_html.
    # Kale streep als laatste terugval verwijderd (bug B2), zie identieke fix
    # in render_exit_report_html.
    _raster_primary_label = _raster_rows[0]["label"] if _raster_rows else (low_lbl or high_lbl or "")
    _geen_profiel = not _raster_rows

    # ── Cover ─────────────────────────────────────────────────────────────────
    _ret_primary = _raster_primary_label or GEEN_FACTORPROFIEL_LBL
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Waar staat behoud nu onder druk?",
        stats=[
            ("Respondenten", str(n)),
            _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
            ("Eerste aandachtspunt", _ret_primary),
        ],
    )

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    if _raster_rows:
        tf       = _raster_rows[0]["key"]
        tf_lbl_  = _fl(tf, ST)
        tf_sc    = fa.get(tf)
        tf_col   = _factor_color(tf_sc)
        items_in = fim.get(tf, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item = min(i_scores, key=lambda x: x[2]) if i_scores else None

        _deep_agg_early = data.get("deepening_agg") or {}
        # Alleen cellen die écht verklaren waarom deze factor bovenaan staat.
        # Bevlogenheid en blijfintentie zijn contextsignalen, geen verklaring —
        # die staan volledig uitgelegd op p.04 (behoudscontext); hier stonden ze
        # als vierde/vijfde losse score op een toch al dichte pagina.
        why_cells = ""
        if tf_sc is not None:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        primary_fkey  = tf
        primary_label = tf_lbl_
        _short_q = _short_mgmt_q(_deep_agg_early, ST, tf)
        if _short_q:
            br_mgmt_q = _short_q
            br_mgmt_q_source = "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping."
        else:
            br_mgmt_q = _mgmt_q(tf, ST)
            br_mgmt_q_source = _raster_attribution(_raster_rows, ST)
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Degraded pagina twee (bug B2), zie render_exit_report_html.
    br_degraded_note = ""
    if _geen_profiel:
        br_degraded_note = _geen_factorprofiel_note(
            n,
            drempelzin=(f"Daarvoor zijn minimaal {MIN_AGGREGATE_N} antwoorden nodig; "
                        f"bij minder telt elk los antwoord te zwaar mee."),
            wel=["de behoudscontext op de volgende pagina" if signal is not None else "",
                 "de werkbeleving" if sdt_a else "",
                 "de werkgeversaanbeveling" if (data["enps_available"]
                                                and data["enps_score"] is not None) else "",
                 "de responsbasis onderaan deze pagina"],
        )

    # Kernzin (ronde 2, B17): volgt de vorm van het profiel, niet de band van
    # het behoudssignaal. Dat getal volgde eerder als enige de openingszin,
    # waardoor "geen factor kwetsbaar" en "alle zes kwetsbaar" dezelfde zin
    # kregen; het staat nu met zijn band in de onderbouwingsrij eronder.
    _shape = profile_shape(fa)
    _primary = _raster_rows[0]["key"] if _raster_rows else None
    # Score van het startpunt: de richtingregel hieronder heeft 'm nodig om te
    # zien of dit onderwerp kwetsbaar scoort (staat split_none, ronde 2 par. 4.3).
    _primary_score = _raster_rows[0]["score"] if _raster_rows else None
    _tk, _chg, _chg_other, _delta = _p02_startpunt_gronden(_raster_rows)
    exec_line = _p02_opening(
        scan_type=ST, shape=_shape, labels=_raster_labels, primary_key=_primary,
        tie_break_kind=_tk, change=_chg, change_other=_chg_other, next_delta=_delta,
        direction_state_key=_p02_direction_key(direction_agg, _primary),
        indicatief=_respons_indicatief(data["n_completed"], data["n_invited"]))
    _signal_cell = _p02_signal_cell("Behoudssignaal", _score_str(signal) if signal else "",
                                    band_lbl or "")
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not (signal and band_lbl)
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus het behoudssignaal blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"{band_lbl} (behoudssignaal {_score_str(signal)})."
                     if signal and band_lbl
                     else "Zie de behoudscontext en de responsbasis voor wat dit rapport wel toont.")

    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"], verwijzing=_verwijst)

    # Subtekst herhaalt de titel niet meer: alleen wat nieuw is. De
    # responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél werkt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and _raster_primary_label != high_lbl and _factor_label(high_sc) == "Relatief sterk" else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        population="Actieve medewerkers",
        segment_available=bool(data.get("segment_rows")),
        segment_reason="te weinig responses per groep voor herleidbaarheid",
        enps_available=data["enps_available"],
        compact=True,
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        totaalbeeld=totaalbeeld,
        primary_label=primary_label,
        why_cells_html=why_cells,
        strong_label=high_lbl,
        strong_score=high_sc,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"], degraded=bool(br_degraded_note)),
        direction_line=_direction_p02_line(direction_agg, _primary, ST,
                                           factor_score=_primary_score),
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
        signal_cell_html=_signal_cell,
    )

    # ── Behoudscontext (p.04 — vóór factorprofiel) ───────────────────────────
    s += _behoudscontext(
        retention_score=signal,
        stay_intent=avg_si,
        turnover=avg_to,
        engagement=avg_eng,
        intent_resp=data.get("intent_resp"),
        opener_html=ch.opener("Waar staat behoud onder druk?", kicker="Behoudscontext"),
    )

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"), scan_type=ST)

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    def _ret_factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Laagste item vet in de tabel i.p.v. losse laagste/hoogste-kaarten:
        # bij 3 items per factor waren die kaarten pure herhaling van de tabel.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail hierboven.
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # Statisch "Eerste managementvraag"-blok bewust verwijderd (template-taal;
        # stond ook al op p.02) — het toelichtingsblok draagt de duiding.
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        deep_block = (_deepening_block(deep_agg[fk], ST, fk)
                      if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            _opener = ch.opener(f"Verdieping: {_lbl}") if _i == 0 else _ChapterCounter.vervolg(f"Verdieping: {_lbl}")
            s += _ret_factor_detail(_pfk, opener_html=_opener, intro_html=_intro("verdieping") if _i == 0 else "")
    else:
        s += f'<div class="pb sec">{ch.opener("Verdieping: prioritaire factoren")}<div class="empty-state">{VERDIEPING_GEEN_RANGORDE}</div></div>'

    # ── Werkbeleving (SDT) ────────────────────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

    for dim in ("autonomy", "competence", "relatedness"):
        sc    = sdt_a.get(dim)
        col   = _rag_color(sc)
        fl_   = _factor_label(sc)
        tbl   = _sdt_item_tbl(dim)
        if not tbl: continue
        s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
    s += "</div>"

    # ── eNPS (if available) ───────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""
    # Niet gemeten: geen eigen (vrijwel lege) pagina — de Datastatus op de
    # responsbasis-pagina en de appendix-notitie melden dit al (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    _enriched_q = (_deepening_mgmt_q(deep_agg, ST, _startpunt_fk)
                   if _startpunt_fk else None)
    # Zie render_exit_report_html: blok eerst, methodiekpagina gate erop (B3).
    _dir_block = _wat_moet_gebeuren_block(_raster_rows, direction_agg, ST, n)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type=ST,
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, ST) if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
        direction_agg=direction_agg,
        n_total=n,
        direction_block_html=_dir_block,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = _fl(fk, ST)
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT): B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"),
                     ranking_active=not _geen_profiel,
                     direction_active=bool(_dir_block),
                     direction_degraded=bool(_dir_block) and not _raster_rows)
    return _doc(f"Loep Behoud · {data['campaign_name']}", s, scan_type="retention")


# ─── Onboarding-exclusive helpers ────────────────────────────────────────────

def _checkpointoverzicht(checkpoints: list[tuple[str, float | None]], opener_html: str = "") -> str:
    """Checkpoint-fasevergelijking (30/60/90 dagen) of eerlijke single-measurement degraded view.

    checkpoints — lijst van (fase-label, score | None).
    Als < 2 fasen: render de enkele meting met een .trustline die fasevergelijking benoemt.
    """
    if len(checkpoints) >= 2:
        cells = "".join(
            f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v" style="color:{_rag_color(score)};">{_score_str(score)}</div>'
            f'<div class="sc-b">{_h(_factor_label(score))}</div></td>'
            for label, score in checkpoints
        )
        body = f'<table class="sg"><tr>{cells}</tr></table>'
    else:
        # Single measurement — honest degraded view
        label, score = checkpoints[0] if checkpoints else ("Huidig checkpoint", None)
        body = (
            f'<table class="sg"><tr>'
            f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v" style="color:{_rag_color(score)};">{_score_str(score)}</div>'
            f'<div class="sc-b">Enkelvoudig meetmoment</div></td>'
            f'</tr></table>'
            # Geen belofte over automatische fasevergelijking: geen code-pad aggregeert
            # meerdere checkpoints in één rapport (besluit C2, 2026-07-13 audit).
            f'<p class="trustline">Dit rapport beslaat één meetmoment; een volgende meting bespreken we los.</p>'
        )

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Checkpointoverzicht</span>'}
  {_intro("checkpointoverzicht")}
  {body}
</div>"""


def _landingskwaliteit(domains: list[tuple[str, float | None]]) -> str:
    """Landingskwaliteit per domein — factor bar rows in een card.

    Geen eigen pagina (.pb): sluit aan onder het checkpointoverzicht, dat bij een
    enkelvoudige meting maar één getal bevat — samen vullen ze één pagina i.p.v.
    twee halflege.
    """
    rows = "".join(
        _factor_bar_row(label, score)
        for label, score in domains
        if score is not None
    )
    # Legenda alleen bij balken: zonder domeinscores legt hij kleuren uit die
    # nergens op de pagina staan (zelfde correctie als in _overzichtsprofiel).
    legend = ""
    if rows:
        legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
                  f'<span style="color:{RAG_HIGH};">&#9632;</span> kwetsbaar punt &nbsp; '
                  f'<span style="color:{RAG_MID};">&#9632;</span> aandachtspunt &nbsp; '
                  f'<span style="color:{RAG_LOW};">&#9632;</span> goed geland</p>')
    else:
        rows = ('<div class="empty-state">Voor deze meting zijn er geen scores '
                'per domein berekend.</div>')
    return f"""<div class="sec">
  <span class="slabel">Landingskwaliteit per domein</span>
  <div class="card">{rows}{legend}</div>
</div>"""


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict) -> str:
    ST          = "onboarding"
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    avg_si      = data["avg_si"]
    # Checkpointscore op de gezondheidsschaal (B4), zie _signal_health.
    signal      = _signal_health(avg_risk)
    band_lbl, band_col = _band(signal, ST)
    fa          = data["factor_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    ch          = _ChapterCounter()

    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    low_f    = sorted_f[0]  if sorted_f else None
    high_f   = sorted_f[-1] if sorted_f else None
    low_lbl  = _fl(low_f[0], ST)  if low_f  else ""
    high_lbl = _fl(high_f[0], ST) if high_f else ""
    high_sc  = high_f[1] if high_f else None
    _raster_labels = {fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS}

    # Geen raster bij Loep Start: "geen factorprofiel" == geen enkele factor
    # met een score (zelfde staat die exit/retention via _raster_rows zien).
    _geen_profiel = not sorted_f

    # ── Cover ─────────────────────────────────────────────────────────────────
    # Kale streep als laatste terugval verwijderd (bug B2).
    _ob_primary = low_lbl or high_lbl or GEEN_FACTORPROFIEL_LBL
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Hoe landen nieuwe medewerkers?",
        stats=[
            ("Respondenten", str(n)),
            _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
            ("Eerste aandachtspunt", _ob_primary),
        ],
    )

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    if top_fkeys:
        tf       = top_fkeys[0]
        tf_lbl_  = _fl(tf, ST)
        tf_sc    = fa.get(tf)
        tf_col   = _factor_color(tf_sc)
        items_in = fim.get(tf, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item = min(i_scores, key=lambda x: x[2]) if i_scores else None

        why_cells = ""
        if tf_sc is not None:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        primary_label = tf_lbl_
        br_mgmt_q     = _mgmt_q(tf, ST)
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor."
    else:
        why_cells     = ""
        primary_label = low_lbl
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Degraded pagina twee (bug B2), zie render_exit_report_html.
    br_degraded_note = ""
    if _geen_profiel:
        br_degraded_note = _geen_factorprofiel_note(
            n,
            drempelzin=(f"Een profiel per factor vraagt minimaal {MIN_AGGREGATE_N} "
                        f"antwoorden; daaronder kleurt één antwoord het beeld te sterk."),
            wel=["het checkpointoverzicht" if signal is not None else "",
                 "de werkbeleving van nieuwe medewerkers" if sdt_a else "",
                 "de werkgeversaanbeveling" if (data["enps_available"]
                                                and data["enps_score"] is not None) else "",
                 "de responsbasis onderaan deze pagina"],
        )

    # Kernzin (ronde 2, B17): volgt de vorm van het profiel, niet de band van de
    # checkpointscore. Die staat nu met haar band in de onderbouwingsrij eronder.
    # Loep Start heeft geen prioriteringsraster (de rangorde is puur de score) en
    # geen richtingvraag, dus er is hier geen tie-break of richtingtelling te
    # noemen. Het startpunt is dezelfde factor die het why-blok eronder toont.
    _shape = profile_shape(fa)
    _primary = (top_fkeys[0] if top_fkeys else (low_f[0] if low_f else None))
    _delta = (round(sorted_f[1][1] - sorted_f[0][1], 2) if len(sorted_f) > 1 else None)
    exec_line = _p02_opening(
        scan_type=ST, shape=_shape, labels=_raster_labels, primary_key=_primary,
        next_delta=_delta,
        indicatief=_respons_indicatief(data["n_completed"], data["n_invited"]))
    _signal_cell = _p02_signal_cell("Checkpointscore", _score_str(signal) if signal else "",
                                    band_lbl or "")
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not (signal and band_lbl)
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus de checkpointscore blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"{band_lbl} (checkpointscore {_score_str(signal)})."
                     if signal and band_lbl
                     else "Zie het checkpointoverzicht en de responsbasis voor wat dit rapport wel toont.")

    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"], verwijzing=_verwijst)

    # Subtekst herhaalt de titel niet meer: alleen wat nieuw is. De
    # responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél goed landt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and low_lbl != high_lbl and _factor_label(high_sc) == "Relatief sterk" else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        population="Nieuwe medewerkers in de eerste werkperiode",
        segment_available=bool(data.get("segment_rows")),
        segment_reason="te weinig responses per groep voor herleidbaarheid",
        enps_available=data["enps_available"],
        compact=True,
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        totaalbeeld=totaalbeeld,
        primary_label=primary_label,
        why_cells_html=why_cells,
        strong_label=high_lbl,
        strong_score=high_sc,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"], degraded=bool(br_degraded_note),
                                 leesroute=GEBRUIKSBLOK_LEESROUTE_ONBOARDING),
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
        signal_cell_html=_signal_cell,
        scope_note=ONBOARDING_GEEN_VERDIEPING_NOTE,
    )

    # ── Overzichtsprofiel (p.04) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"), scan_type=ST)

    # ── Checkpointoverzicht (p.05 — onboarding-exclusive) ────────────────────
    s += _checkpointoverzicht(checkpoints=[("Huidig checkpoint", signal)],
                              opener_html=ch.opener("Onboardingfases", kicker="Checkpointoverzicht"))

    # ── Landingskwaliteit per domein (onboarding-exclusive) ───────────────────
    domain_scores = [(_fl(fk, ST), fa.get(fk))
                     for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _landingskwaliteit(domain_scores)

    # ── Factordiepte ×≤3 (prioriteit = laagste score, geen vertrekredenen) ────
    priority_fkeys = _select_priority_factors(fa, {}, max_n=3)

    def _ob_factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Laagste item vet in de tabel; losse kaarten alleen bij >3 items
        # (bij 3 items waren ze herhaling van de tabel). Het statische
        # "Eerste managementvraag"-blok is bewust weg — template-taal.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail (exit-renderer).
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Kwetsbaarste stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Relatief sterkste item</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">{_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  <p style="font-size:10px;color:#64748B;margin-bottom:12px;">Lager op deze factor = meer frictie in de onboardingfase.</p>
  {spread}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            # Geen "Verdieping:" in de paginatitel (spec ronde 2 par. 7): Loep
            # Start heeft geen verdiepingsvragen, deze pagina toont de score en
            # de stellingen van de factor.
            _opener = ch.opener(_lbl) if _i == 0 else _ChapterCounter.vervolg(_lbl)
            # Geen SECTION_INTROS["verdieping"] hier (code-review taak 9, fix A):
            # die tekst belooft een automatische vervolgvraag + een
            # gespreksagenda gevuld met wat respondenten kozen. Onboarding
            # heeft in v1 geen richtingdata (DIRECTION_SCAN_TYPES) en geen
            # deepening-set, dus dat is niet waar voor dit rapport. De
            # factordetailpagina leest prima zonder intro.
            s += _ob_factor_detail(_pfk, opener_html=_opener, intro_html="")
    else:
        s += f'<div class="pb sec">{ch.opener("Factoren met de meeste aandacht")}<div class="empty-state">{ONBOARDING_GEEN_RANGORDE}</div></div>'

    # ── Werkbeleving (SDT) — if present ──────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    if sdt_overview_rows:
        s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

        for dim in ("autonomy", "competence", "relatedness"):
            sc    = sdt_a.get(dim)
            col   = _rag_color(sc)
            fl_   = _factor_label(sc)
            tbl   = _sdt_item_tbl(dim)
            if not tbl: continue
            s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
        s += "</div>"

    # ── eNPS (if present) ────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor / Gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    # Primair thema grounded in het laagst scorende item (zelfde aanpak als
    # exit/retention): geen vaste per-factor beslistekst die nooit meebeweegt.
    _ob_priority_fkeys = _select_priority_factors(fa, {}, max_n=3)
    _ob_primary_fk = _ob_priority_fkeys[0] if _ob_priority_fkeys else None
    _ob_primary_items = ([(ik, q, oim.get(ik)) for ik, q in fim.get(_ob_primary_fk, []) if oim.get(ik) is not None]
                          if _ob_primary_fk else [])
    _ob_primary_low = min(_ob_primary_items, key=lambda x: x[2]) if _ob_primary_items else None
    # "Het laagst van het hele beeld" keek alleen binnen de eerste factor (spec
    # ronde 2 par. 7). Scoort een stelling in een andere factor even laag, dan
    # sprak de appendix die claim tegen. De vergelijking loopt daarom over alle
    # stellingen die dit rapport toont (de factorpagina's en de appendix putten
    # allebei uit factor_items_map) en over de getoonde score, zie _shown.
    _ob_alle_getoond = [_shown(oim[_ik])
                        for _items in fim.values() for _ik, _q in _items
                        if oim.get(_ik) is not None]
    _ob_strikt = (_ob_primary_low is not None
                  and _ob_alle_getoond.count(_shown(_ob_primary_low[2])) == 1)
    _ob_primary_theme = (
        _laagste_stelling_zin(_fl(_ob_primary_fk, ST), _ob_primary_low[1],
                              _ob_primary_low[2], strikt_laagste=_ob_strikt)
    ) if _ob_primary_low else low_lbl

    # Zonder factorprofiel is er geen primair thema en geen tweede
    # aandachtspunt (review ronde 2). De pagina zei dat niet: primary_theme
    # viel door naar de letterlijke placeholder "het leidende onboardingthema"
    # en second_point/mgmt_q bleven leeg, terwijl de intro erboven ongewijzigd
    # een samenvatting van het eerste gesprekspunt beloofde. Nu benoemt de
    # pagina wat er wél gemeten is. De opsomming volgt dezelfde regel als de
    # degraded p.02-alinea: alleen secties die in deze staat echt renderen.
    _agenda_degraded_note = ""
    if _geen_profiel:
        _agenda_wel = _opsomming([
            "het checkpointoverzicht" if signal is not None else "",
            "de werkbeleving van nieuwe medewerkers" if sdt_overview_rows else "",
            "de responsbasis op de openingspagina"])
        _agenda_degraded_note = (
            f"Wat dit rapport wel laat zien: {_agenda_wel}. Een score per thema "
            f"ontbreekt, dus er is geen onderbouwde volgorde en geen eerste "
            f"gesprekspunt dat uit de cijfers volgt.")

    # Geen primary_why meer (spec ronde 2 par. 7): die regel zei "Laagst
    # scorende stelling in het cijferbeeld (5.1/10)" onder een kaart die precies
    # dat al zegt, met hetzelfde getal. Loep Start heeft geen verdiepingsdata,
    # dus de rijkere variant van _primary_why_text (de meest gekozen toelichting)
    # kon hier nooit staan. De constatering staat nu één keer, in de zin erboven.
    _second_why = ("Tweede laagste factorscore in het overzichtsprofiel."
                   if len(sorted_f) > 1 else None)

    s += _eerste_managementspoor(
        primary_theme=_ob_primary_theme,
        second_point=f"{_fl(sorted_f[1][0], ST)} ({_score_str(sorted_f[1][1])})" if len(sorted_f) > 1 else "",
        mgmt_q=_mgmt_q(_ob_priority_fkeys[0], ST) if _ob_priority_fkeys else (nsp.get("first_decision") or ""),
        review_when="Plan een vervolgmoment rond het volgende checkpoint: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        primary_why=None,
        second_why=_second_why,
        opener_html=ch.opener("Gespreksagenda", kicker="Eerste managementspoor"),
        degraded_note=_agenda_degraded_note,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = _fl(fk, ST)
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  {"<div class='no-break' style='margin-bottom:14px;'><div style='font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;'>Werkbeleving (SDT): checkpoint-items</div><table class='app-tbl'><tr><th class='aq'>Vraag</th><th class='as'>Gem.</th><th class='ab'>Beeld</th></tr>" + sdt_rows + "</table></div>" if sdt_rows else ""}
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"),
                     ranking_active=not _geen_profiel)
    return _doc(f"Loep Start · {data['campaign_name']}", s, scan_type="onboarding")


# ─── Dispatcher + PDF ────────────────────────────────────────────────────────

def render_report_html(data: dict) -> str:
    st = data.get("scan_type", "exit")
    if st == "retention":  return render_retention_report_html(data)
    if st == "onboarding": return render_onboarding_report_html(data)
    return render_exit_report_html(data)


def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    return HTML(string=render_report_html(build_report_data(campaign_id, db))).write_pdf()
