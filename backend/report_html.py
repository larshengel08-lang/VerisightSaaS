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
from datetime import date, datetime, timedelta, timezone
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
    score_distribution,
    shown as _shown,
    zone_color,
)
from backend.products.shared.deepening import (
    DEEPENING_CAP,
    DEEPENING_MIN_N,
    DIRECTION_CAVEAT_MAX_N,
    DIRECTION_MIN_N,
    DIRECTION_SCAN_TYPES,
    TOP_CHOICE_MIN_LEAD,
    TRIGGER_AVG_MAX,
    TRIGGER_LOW_ITEM_COUNT,
    TRIGGER_LOW_ITEM_MAX,
    TRIGGER_WITH_ONE_AVG_MAX,
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
    "role_clarity": "Speelt onduidelijkheid over eigenaarschap, prioriteiten of beslisruimte mee?",
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


def _p02_laagste_keys(shape: dict[str, Any]) -> list[str]:
    """Alle onderwerpen die de laagste GETOONDE score delen, laagst-eerst.

    Ronde 2 punt (a): de vlakke zin vergeleek op de ruwe waarde en noemde in
    scenario 06 één onderwerp "laagste" terwijl er drie 6.2 tonen. De lezer ziet
    de getoonde score, dus die telt. De volgorde blijft die van
    factors_low_to_high (onafgerond, dan factorsleutel).
    """
    pairs = shape["factors_low_to_high"]
    if not pairs:
        return []
    low = pairs[0][1]
    return [fk for fk, v in pairs if v == low]


def _p02_flat_sentence(shape: dict[str, Any], labels: dict[str, str]) -> str:
    """De vlak-profiel-zin op pagina twee (spec ronde 2 par. 2.2, plan 3a taak 3).

    Zegt expliciet dat er niets uitspringt, met de echte uiterste waarden erbij,
    zodat de lezer de conclusie zelf kan narekenen. Delen meerdere onderwerpen
    de laagste getoonde score, dan staan ze allemaal in de zin. Een ontbrekend
    factorlabel is een bug en geen reden om de interne sleutel in klantcopy te
    zetten, dus die opzoeking faalt hard.

    Gedeelde laagste score: telwoord, dubbele punt en komma's, geen "en" tussen
    de labels. Bijna elk label bevat zelf al "en", en "Leiderschap en vertrouwen
    en Cultuur en psychologische veiligheid" leest als één lang label.
    Tonen alle onderwerpen dezelfde score, dan heet geen enkel onderwerp
    laagste of hoogste: dan zou hetzelfde onderwerp beide zijn.
    """
    if not shape["flat"]:
        raise ValueError("_p02_flat_sentence: alleen bij een vlak profiel")
    laagste_keys = _p02_laagste_keys(shape)
    if len(laagste_keys) == shape["n_factors"]:
        return (f"Geen enkel onderwerp springt eruit: "
                f"{_alle_onderwerpen(shape['n_factors'])} scoren "
                f"{_score_str(shape['low_score'])}. Dat is zelf de bevinding.")
    high = labels[shape["high_key"]]
    if len(laagste_keys) > 1:
        laagste = (f"laagste score {_score_str(shape['low_score'])}, gedeeld door "
                   f"{_TELWOORD[len(laagste_keys)]} onderwerpen: "
                   f"{', '.join(labels[fk] for fk in laagste_keys)}; ")
    else:
        laagste = (f"laagste {labels[laagste_keys[0]]} "
                   f"{_score_str(shape['low_score'])}, ")
    return (f"Geen enkel onderwerp springt eruit: "
            f"{_alle_onderwerpen(shape['n_factors'], kaal=True)} liggen binnen "
            f"{_flat_span_woorden()} van elkaar "
            f"({laagste}hoogste {high} {_score_str(shape['high_score'])}). "
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
                       gelijk_met: list[str] | None = None,
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
        # next_delta is het verschil tussen GETOONDE scores (B15), dus 0 als de
        # lezer twee keer hetzelfde getal ziet. De gelijke onderwerpen komen uit
        # het profiel (gelijk_met), niet uit "de volgende rij": na een tie-break
        # hoeft die niet de gelijke te zijn. Bij drie of meer gelijke onderwerpen
        # een telwoord, zodat de zin geen lange opsomming wordt. Zonder bekende
        # gelijke onderwerpen (alle onderwerpen gelijk: de kop zegt dat al) geen
        # gelijkstandzin maar de kale keuze.
        if next_delta == 0.0:
            if not gelijk_met:
                return f"{kiest} {primary_label}."
            met = (gelijk_met[0] if len(gelijk_met) == 1
                   else f"{_TELWOORD[len(gelijk_met)]} andere onderwerpen")
            return (f"{kiest} {primary_label}. Dat onderwerp deelt "
                    f"de laagste score met {met}; weeg die gelijkstand mee "
                    f"in de bespreking.")
        if not gelijk_met and 0.0 < next_delta < PRIORITY_TIE_MARGIN:
            # Komma en het woord "punt", zoals _flat_span_woorden en de
            # sectie-intro's ("onder de 5,0"): dit is een prozagetal over de
            # grootte van een gat, geen score. Scores houden in dezelfde alinea
            # hun punt en hun /10, zodat de twee soorten getallen uit elkaar te
            # houden zijn in plaats van als typefout te lezen.
            delta = f"{next_delta:.1f}".replace(".", ",")
            return (f"{kiest} {primary_label}, de laagste score. Het "
                    f"verschil met de volgende is klein, {delta} punt; weeg dat mee "
                    f"in de bespreking.")
    return f"{kiest} {primary_label}."


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
    aandacht: list[tuple[str, float]] = []
    if k == 0 and shape["flat"]:
        kop = _p02_flat_sentence(shape, labels)
    elif k == 0:
        # De laagst scorende factor is NIET altijd het startpunt: bij Loep
        # Vertrek verschuift de vertrekredenweging de base, en binnen een
        # gelijkspelgroep kan richting, spreiding of verdieping de volgorde
        # bepalen. Delen meerdere onderwerpen de laagste getoonde score, dan
        # noemt de zin ze allemaal (spec 16-9 par. 4 blok 1) en kan geen van
        # beide alleen "het eerste gesprekspunt" zijn: dan wordt het startpunt
        # apart genoemd.
        laagste_keys = _p02_laagste_keys(shape)
        if len(laagste_keys) > 1:
            # Telwoord, dubbele punt en komma's: zie _p02_flat_sentence.
            laagste_clause = (f"{_TELWOORD[len(laagste_keys)].capitalize()} "
                              f"onderwerpen delen de laagste score "
                              f"({_score_str(shape['low_score'])}): "
                              f"{', '.join(labels[fk] for fk in laagste_keys)}")
        else:
            laagste_clause = f"{labels[laagste_keys[0]]} scoort het laagst"
        # Deze tak noemt het startpunt "gesprekspunt" in plaats van "startpunt",
        # dus hij heeft zijn eigen indicatieve vorm nodig.
        gesprekspunt = ("een mogelijk eerste gesprekspunt" if indicatief
                        else "het eerste gesprekspunt")
        kiest_gp = ("als mogelijk eerste gesprekspunt kiest Loep" if indicatief
                    else "als eerste gesprekspunt kiest Loep")
        if len(laagste_keys) == 1 and shape["low_key"] == primary_key:
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
        # en zonder accent leest "een" als lidwoord in plaats van als telwoord.
        onderwerp = "één kwetsbaar onderwerp" if k == 1 else "twee kwetsbare onderwerpen"
        # Komma en geen "en": bijna elk echt factorlabel bevat zelf al "en"
        # ("Rolhelderheid en verwachtingen eerste 90 dagen"), en met een
        # voegwoord ertussen staat er vier keer "en" in één opsomming. Na de
        # dubbele punt leest dit als lijst, niet als nevenschikking.
        namen = ", ".join(f"{labels[fk]} ({_score_str(v)})" for fk, v in vuln)
        kop = f"{zacht} {onderwerp}: {namen}."
        # H17: "één onderwerp" beloofde rust die de oranje balken niet
        # waarmaken. De aandachtspunten (5,0 tot 6,5) staan daarom in dezelfde adem.
        aandacht = [(fk, v) for fk, v in shape["factors_low_to_high"]
                    if ZONE_LOW <= v < ZONE_HIGH]
        if aandacht:
            lijst = _opsomming([f"{labels[fk]} ({_score_str(v)})" for fk, v in aandacht])
            rest = ("is " + lijst + " een aandachtspunt" if len(aandacht) == 1
                    else "zijn " + lijst + " aandachtspunten")
            kop += f" Daarnaast {rest}."
    else:
        kop = (f"{breed}: {k} van de {shape['n_factors']} onderwerpen scoren "
               f"kwetsbaar.")
    laagste_keys = _p02_laagste_keys(shape)
    # "Laagste" op de getoonde score: het startpunt hoort bij de onderwerpen die
    # de laagste score tonen. De onderwerpen die die score met het startpunt
    # delen gaan mee naar de gelijkstandzin. Tonen alle onderwerpen dezelfde
    # score en is de kop de vlakke zin, dan zegt die kop dat al en blijft de lijst
    # leeg. De kop "6 van de 6 onderwerpen scoren kwetsbaar" zegt dat niet, dus
    # daar blijft de gelijkstandzin staan.
    primary_is_lowest = primary_key in laagste_keys
    kop_noemt_gelijkstand = (k == 0 and shape["flat"]
                             and len(laagste_keys) == shape["n_factors"])
    gelijk_met = ([] if kop_noemt_gelijkstand else
                  [labels[fk] for fk in laagste_keys if fk != primary_key])
    start = _p02_startpunt_zin(
        labels[primary_key], tie_break_kind=tie_break_kind, change=change,
        change_other=change_other, next_delta=next_delta,
        direction_state_key=direction_state_key,
        primary_is_lowest=primary_is_lowest,
        gelijk_met=gelijk_met,
        indicatief=indicatief)
    # C11: "...: Groeiperspectief (4.5/10). Als startpunt kiest Loep
    # Groeiperspectief." is één mededeling in twee zinnen. Alleen als de kop
    # precies één kwetsbaar onderwerp noemt, dat het startpunt is, er geen
    # "Daarnaast"-zin tussen staat EN de startpuntzin geen eigen grond draagt
    # (kale vorm), volstaat een korte vervolgzin. Bij twee kwetsbare onderwerpen
    # of een aandachtspuntenzin zou "Daar" naar meer dan het startpunt wijzen.
    # Een zin met grond (klein verschil, gelijkstand, richting) zegt iets nieuws
    # en blijft staan.
    kiest = "Als mogelijk startpunt kiest Loep" if indicatief else "Als startpunt kiest Loep"
    if (k == 1 and shape["factors_low_to_high"][0][0] == primary_key
            and not aandacht
            and start == f"{kiest} {labels[primary_key]}."):
        start = ("Daar begint het gesprek waarschijnlijk." if indicatief
                 else "Daar begint het gesprek.")
    return f"{kop} {start}"


def _getoond_verschil(laag: float, hoog: float) -> float:
    """Het verschil tussen twee scores zoals de lezer ze ziet (B15).

    Eén helper voor alle drie de scans: 4.94 en 4.96 staan als 4.9 en 5.0 op de
    pagina, dus het verschil is 0,1 en niet 0,02; 5.46 en 5.54 staan allebei als
    5.5, dus 0. Afgerond op 0,1 omdat 5.0 - 4.9 in drijvende komma 0.0999... is.
    """
    return round(_shown(hoog) - _shown(laag), 1)


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
    # Op de GETOONDE scores (B15): 4.94 en 4.96 staan als 4.9 en 5.0 in het
    # raster, en "klein, 0,02 punt" klopt dan niet met wat de lezer ziet. Een
    # getoond verschil van 0 wordt vanzelf de gelijkstandzin. De gate "klein"
    # (onder PRIORITY_TIE_MARGIN) blijft dezelfde, maar werkt op dit getal.
    delta = (_getoond_verschil(top["score"], raster_rows[1]["score"])
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


def _p02_cijfers_block(cells: list[str]) -> str:
    """Blok 2 van pagina twee (spec 16-9 par. 4): de cijfers die het MT wakker
    maken, als één statrij. Lege cellen vallen weg; zonder cellen geen tabel."""
    tds = "".join(c for c in cells if c)
    if not tds:
        return ""
    return f'<table class="sg p02-cijfers"><tr>{tds}</tr></table>'


def _hoofdreden_cell(*, er_n: int, er_top: list[dict], gegeven: int | None, n: int,
                     tf_code: str | None, color: str) -> str:
    """Why-cel over de vertrekreden die bij het startpunt hoort (exit).

    Staat de reden van het startpunt bij de meest genoemde (alleen of in een
    gelijkspel), dan draagt blok 2 (cijfersrij) die reden al met getal en de
    kernzin ook: deze cel maakt dan alleen de koppeling, zonder getal
    (codereview taak 4). Staat een andere reden hoger, dan toont de cel hoe vaak
    de reden van het startpunt genoemd is en welke reden vaker genoemd is.
    Gelijkspel en noemer komen uit dezelfde volledige teller als blok 2
    (exit_r_top/exit_r_given)."""
    if not er_n:
        return ""
    tops, top_cnt = _vertrekreden_top(er_top)
    if tf_code in {r["code"] for r in tops}:
        if len(tops) == 1:
            lbl, v, body = ("Hoofdreden", "Meest genoemd",
                            "dit onderwerp hangt samen met de meest genoemde hoofdreden van vertrek")
        else:
            lbl, v, body = ("Als hoofdreden genoemd", "Even vaak",
                            "dit onderwerp hangt samen met een van de meest genoemde hoofdredenen van vertrek")
        return (f'<td class="why-cell"><div class="why-l">{lbl}</div>'
                f'<div class="why-v" style="color:{color};font-size:14px;">{v}</div>'
                f'<div class="why-b">{_h(body)}</div></td>')
    noemer = (f"van de {gegeven} vertrekkers die een reden gaven"
              if (gegeven is not None and gegeven < n) else f"van de {n} vertrekkers")
    werkwoord = "is" if len(tops) == 1 else "zijn"
    body = (f"{noemer}; {_opsomming([r['label'] for r in tops])} {werkwoord} "
            f"vaker als hoofdreden genoemd ({top_cnt} keer)")
    return (f'<td class="why-cell"><div class="why-l">Als hoofdreden genoemd</div>'
            f'<div class="why-v" style="color:{color};">{er_n}&times;</div>'
            f'<div class="why-b">{_h(body)}</div></td>')


def _opener_toelichting(deep_agg: dict, scan_type: str, factor_key: str) -> str | None:
    """De optiesleutel die de datagedreven gespreksopener noemt, of None als
    de opener de vaste vraag per onderwerp is. Zelfde gate als _deepening_mgmt_q."""
    agg = deep_agg.get(factor_key)
    if not agg:
        return None
    enr = agenda_enrichment(agg, scan_type, factor_key)
    return enr["option_key"] if enr else None


def _p02_why_extra_cells(top_row: dict, scan_type: str,
                         opener_toelichting: str | None = None) -> str:
    """Extra why-cellen die echt een reden zijn (spec par. 4 blok 3), uit de
    rasterrij van het startpunt, zodat p.02 en het raster dezelfde getallen tonen.

    Spreiding alleen als die voor dit startpunt een signaal is: de rij heeft de
    spreidingsvlag of de spreiding besliste de volgorde (codereview taak 4; zonder
    signaal stond er "0 van de 45 onder de 5", wat geen reden is). De staffel
    MIN_DISTRIBUTION_N blijft gelden. Verdieping alleen in celstaat 1 en niet als
    de gespreksopener dezelfde toelichting al noemt (opener_toelichting).
    Een onbekende optiesleutel is een fout, geen rauwe sleutel in een klant-PDF."""
    cells = ""
    decided = top_row.get("decided_by") or {}
    spread_signaal = top_row["spread_flag"] or decided.get("kind") == "spread"
    if spread_signaal and top_row["spread_n"] >= MIN_DISTRIBUTION_N:
        cells += (f'<td class="why-cell"><div class="why-l">Spreiding</div>'
                  f'<div class="why-v" style="color:{_factor_color(top_row["score"])};">'
                  f'{top_row["spread_below"]}</div>'
                  f'<div class="why-b">van de {top_row["spread_n"]} onder de 5</div></td>')
    if top_row["deepening_state"] == 1 and top_row["deepening_top"]:
        key, cnt, answered = top_row["deepening_top"]
        if key != opener_toelichting:
            texts = _deepening_option_texts(scan_type, top_row["key"])
            if key not in texts:
                raise KeyError(f"deepening: onbekende optiesleutel {key!r} voor "
                               f"{top_row['key']!r} ({scan_type})")
            cells += (f'<td class="why-cell"><div class="why-l">Verdieping</div>'
                      f'<div class="why-v">{cnt}</div>'
                      f'<div class="why-b">van de {answered} kozen: {_h(texts[key])}</div></td>')
    return cells


def _blijfintentie_zones(stay_scores: list[float]) -> tuple[int, int, int, int]:
    """(onder 5, 5 tot 6,5, vanaf 6,5, n) op de individuele blijfintentiescores."""
    vals = [v for v in stay_scores if v is not None]
    low, mid, high = score_distribution(vals)["zones"]
    return low, mid, high, len(vals)


def _blijfintentie_cell(avg_si: float | None, stay_scores: list[float]) -> str:
    """Blijfintentie met dezelfde band als de onderwerpen en de zone-verdeling (B1).

    "Blijfintentie 3.9/10: kwetsbaar. 25 van de 39 zitten onder de 5." De band
    komt uit _factor_label (dus op de getoonde score, B15), de zones uit
    score_distribution: dezelfde grenzen als de spreidingsstrook verderop.
    """
    if avg_si is None:
        return ""
    low, _mid, _high, n = _blijfintentie_zones(stay_scores)
    band = _factor_label(avg_si).lower()
    zones = _onder_de_vijf(low, n) if n else "geen losse scores beschikbaar"
    return (f'<td><div class="sc-l">Blijfintentie</div>'
            f'<div class="sc-v" style="color:{_factor_color(avg_si)};">{_score_str(avg_si)}</div>'
            f'<div class="sc-b">{_h(band)}: {_h(zones)}</div></td>')


def _onder_de_vijf(low: int, n: int) -> str:
    """"1 van de 39 zit onder de 5" / "25 van de 39 zitten onder de 5"."""
    werkwoord = "zit" if low == 1 else "zitten"
    return f"{low} van de {n} {werkwoord} onder de 5"


def _blijfintentie_kopzin(avg_si: float | None, stay_scores: list[float], *,
                          na_kwetsbaar_onderwerp: bool = True) -> str:
    """De zin die de kop krijgt zodra de blijfintentie kwetsbaar is (spec par. 4 blok 2).

    Alleen dan: een blijfintentie die aandachtspunt of relatief sterk is hoort
    in blok 2, niet in de kop. Leeg als er geen score is, en ook zonder losse
    scores: een kop met "0 van de 0" is een kaal getal, de cel in blok 2 zegt
    dan al dat die scores ontbreken.

    na_kwetsbaar_onderwerp: staat er in de kop al een kwetsbaar onderwerp? Zo
    niet, dan zegt de kop "Geen onderwerp scoort kwetsbaar." en zou "Ook" die
    zin tegenspreken; dan wordt het "Wel is de blijfintentie kwetsbaar".
    """
    if avg_si is None or _factor_label(avg_si) != "Kwetsbaar punt":
        return ""
    low, _mid, _high, n = _blijfintentie_zones(stay_scores)
    if not n:
        return ""
    opening = ("Ook de blijfintentie is kwetsbaar" if na_kwetsbaar_onderwerp
               else "Wel is de blijfintentie kwetsbaar")
    return f"{opening}: {_score_str(avg_si)}, {_onder_de_vijf(low, n)}."


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


def _respons_oordeel(completed: int, invited: int | None) -> str:
    """Eén zin die zegt of de respons genoeg is (H3), op dezelfde drempels als
    _respons_caution en _respons_kernzin_staart, zodat blok 2 en de kernzin
    nooit verschillend kunnen oordelen over hetzelfde getal."""
    if not invited:
        # Niet "niet vastgelegd": zonder noemer kan er ook een te laag aantal
        # vastgelegd zijn, of een managed campagne waarin iedereen invulde
        # (_respons_noemer). De zin zegt alleen wat zeker is.
        zin = (f"{completed} ingevuld; Loep kan het aantal uitgenodigden niet "
               f"vaststellen, dus staat er geen percentage.")
        if completed < MIN_AGGREGATE_N:
            zin += (f" Te weinig voor een profiel per onderwerp, daarvoor zijn er "
                    f"minimaal {MIN_AGGREGATE_N} nodig.")
        return zin
    pct = _respons_pct(completed, invited)
    kop = f"{completed} van de {invited} ingevuld ({pct}%)"
    if completed < MIN_AGGREGATE_N:
        return (f"{kop}: te weinig voor een profiel per onderwerp, daarvoor zijn er "
                f"minimaal {MIN_AGGREGATE_N} nodig.")
    rate = _response_rate(completed, invited)
    if rate < RESPONSE_INDICATIVE_RATE:
        return f"{kop}: indicatief, geen vastgesteld startpunt."
    if rate < RESPONSE_CAUTION_RATE:
        return f"{kop}: het beeld van wie meedeed, niet van de hele organisatie."
    return f"{kop}: genoeg voor een betrouwbaar groepsbeeld."


def _respons_cell(completed: int, invited: int | None) -> str:
    pct = _respons_pct(completed, invited)
    value = f"{pct}%" if pct is not None else "n.b."
    return (f'<td><div class="sc-l">Respons</div><div class="sc-v">{value}</div>'
            f'<div class="sc-b">{_h(_respons_oordeel(completed, invited))}</div></td>')


def _exit_reason_count(data: dict, code: str) -> int:
    """Hoe vaak vertrekreden `code` is genoemd, uit de volledige teller.

    `exit_r_dist` is de top 5 van de tabel; een reden die daarbuiten valt kwam
    daar als 0 uit. Dat maakte de why-cel op p.02 onzichtbaar in precies het
    geval waarin ze "Even vaak" moest melden (meer dan vijf redenen met dezelfde
    hoogste telling). `exit_r_counts` is de hele Counter; fixtures van vóór die
    sleutel vallen terug op de top 5 plus het volledige gelijkspel
    (`exit_r_top`), wat de bekende gevallen dekt zonder een getal te verzinnen.
    """
    counts = data.get("exit_r_counts")
    if counts:
        return int(counts.get(code, 0))
    fallback = list(data.get("exit_r_dist") or []) + list(data.get("exit_r_top") or [])
    return next((r["count"] for r in fallback if r["code"] == code), 0)


def _vertrekreden_top(exit_r_dist: list[dict]) -> tuple[list[dict], int]:
    """(alle redenen met de hoogste telling, die telling). Leeg zonder redenen."""
    if not exit_r_dist:
        return [], 0
    top = max(r["count"] for r in exit_r_dist)
    return [r for r in exit_r_dist if r["count"] == top], top


def _vertrekreden_delen(exit_r_top: list[dict], n: int,
                        gegeven: int | None = None) -> dict[str, str] | None:
    """Eén vertakking (enkel/gelijkspel) voor zin en cel, zodat ze niet uiteenlopen.

    exit_r_top: alle redenen met de hoogste telling (build_report_data zet ze op
    de volledige teller; een lijst met lagere tellingen erbij mag ook, de
    hoogste telling wordt hier opnieuw bepaald).
    gegeven: hoeveel respondenten een vertrekreden gaven. De reden is optioneel,
    dus dat kan minder zijn dan n; dan zegt de noemer dat erbij. None betekent
    onbekend (oude fixture) en valt terug op n.
    """
    tops, cnt = _vertrekreden_top(exit_r_top)
    if not tops:
        return None
    noemer = gegeven if gegeven is not None else n
    deel = f"{cnt} van de {noemer}"
    gedeeltelijk = noemer < n
    labels = [r["label"] for r in tops]
    if len(tops) == 1:
        telling = deel + (" die een reden gaven" if gedeeltelijk else "")
        return {"label": labels[0],
                "zin": labels[0] + f" is de meest genoemde hoofdreden van vertrek ({telling}).",
                "cel": f"meest genoemde hoofdreden van vertrek, {telling}"}
    telling = (f"elk {deel} die een reden gaven" if gedeeltelijk else f"{deel} elk")
    aantal = _TELWOORD.get(len(tops), str(len(tops)))
    namen = _opsomming(labels)
    return {"label": namen,
            "zin": (f"{aantal[0].upper()}{aantal[1:]} redenen zijn even vaak als hoofdreden genoemd "
                    f"({telling}): {namen}."),
            "cel": f"even vaak als hoofdreden genoemd, {telling}"}


def _vertrekreden_zin(exit_r_top: list[dict], n: int, *, gegeven: int | None = None) -> str:
    """De meest genoemde vertrekreden met noemer; bij een gelijkspel alle
    gelijke redenen (ronde 2 punt b, scenario 08: 4 om 4)."""
    delen = _vertrekreden_delen(exit_r_top, n, gegeven)
    return delen["zin"] if delen else ""


def _vertrekreden_cell(exit_r_top: list[dict], n: int, *, gegeven: int | None = None) -> str:
    delen = _vertrekreden_delen(exit_r_top, n, gegeven)
    if not delen:
        return ""
    return (f'<td><div class="sc-l">Hoofdreden van vertrek</div>'
            f'<div class="sc-v" style="font-size:14px;">{_h(delen["label"])}</div>'
            f'<div class="sc-b">{_h(delen["cel"])}</div></td>')


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

    Een punt en geen dubbele punt achter het label (taalronde, taak 13): de
    kernzin draagt zelf al een dubbele punt zodra hij de kwetsbare onderwerpen
    opsomt, en "Indicatief beeld: Behoud vraagt aandacht op een kwetsbaar
    onderwerp: werkdruk" zette er twee in een zin.
    """
    return f"Indicatief beeld. {zin}" if indicatief else zin


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


_MAANDEN_NL = ("januari", "februari", "maart", "april", "mei", "juni", "juli",
               "augustus", "september", "oktober", "november", "december")


def _laatste_zondag_utc(jaar: int, maand: int) -> datetime:
    """01:00 UTC op de laatste zondag van de maand (EU-zomertijdgrens)."""
    volgende = datetime(jaar + (maand == 12), maand % 12 + 1, 1, tzinfo=timezone.utc)
    laatste_dag = volgende - timedelta(days=1)
    zondag = laatste_dag - timedelta(days=(laatste_dag.weekday() - 6) % 7)
    return zondag.replace(hour=1)


def _nl_tijd(d: datetime) -> datetime:
    """Zet een timestamp om naar Nederlandse tijd zonder tzdata-afhankelijkheid.

    closed_at wordt als UTC opgeslagen (frontend: new Date().toISOString()); een
    naive datetime behandelen we daarom als UTC. EU-regel: zomertijd (UTC+2) van
    de laatste zondag van maart 01:00 UTC tot de laatste zondag van oktober
    01:00 UTC, daarbuiten wintertijd (UTC+1). ZoneInfo is bewust niet gebruikt:
    tzdata staat niet in het venv en mogelijk niet op Railway.
    """
    utc = d.replace(tzinfo=timezone.utc) if d.tzinfo is None else d.astimezone(timezone.utc)
    zomer = _laatste_zondag_utc(utc.year, 3) <= utc < _laatste_zondag_utc(utc.year, 10)
    return utc + timedelta(hours=2 if zomer else 1)


def _datum_nl(d: date | datetime | None) -> str | None:
    """Datum als Nederlandse tekst ("9 maart 2026"), of None als er geen datum is.

    Meetgegevens op pagina twee (H8). Een datetime (UTC-timestamp) wordt eerst
    naar Nederlandse tijd omgezet en dan op de kalenderdag gelezen, zodat een
    meting die om 00:30 Nederlandse tijd sluit niet een dag te vroeg staat. Een
    date blijft zoals hij is. Een ontbrekende datum blijft None, zodat de
    renderer er in één zin bij kan zeggen dat hij niet is vastgelegd in plaats
    van iets te verzinnen.
    """
    if d is None:
        return None
    d = _kalenderdag(d)
    return f"{d.day} {_MAANDEN_NL[d.month - 1]} {d.year}"


def _kalenderdag(d: date | datetime) -> date:
    """De kalenderdag zoals `_datum_nl` hem afdrukt.

    Eén bron, zodat een vergelijking tussen twee datums (loopt de meetperiode
    de goede kant op?) dezelfde dag gebruikt als de tekst eronder. Een
    UTC-timestamp gaat eerst naar Nederlandse tijd; `datetime` is een subklasse
    van `date`, dus die check staat vooraan.
    """
    return _nl_tijd(d).date() if isinstance(d, datetime) else d


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


# H15: wie dit rapport mag zien, in één zin op de cover en op de slotpagina.
# Het rapport gaat over groepen maar de toelichtingen komen van mensen; in een
# klein team is een geanonimiseerde regel nog steeds herkenbaar. Dat stond
# nergens, terwijl de HR-manager het rapport zelf doorstuurt.
#
# De regel noemt geen toelichtingen meer (taalronde, taak 13): hij staat op de
# cover en op de slotpagina van elk rapport, ook in een meting zonder open
# toelichtingen en zonder verdieping (stresstest 07), en dan beloofde hij iets
# over een blok dat er niet is. "Dit rapport noemt geen namen" is waar in elk
# rapport, en het is precies de reden waarom een klein team alsnog herkenbaar is.
VERSPREIDINGSREGEL = ("Voor het MT en HR van {org}. Deel dit rapport niet met individuele "
                      "medewerkers; in kleine teams zijn uitkomsten herkenbaar, ook al noemt "
                      "dit rapport geen namen.")


def _verspreidingsregel(org_name: str) -> str:
    """H15: één zin op cover en slotpagina over wie dit mag zien. Zonder
    organisatienaam (tests, oude aanroepen) "de organisatie"."""
    org = (org_name or "").strip() or "de organisatie"
    regel = VERSPREIDINGSREGEL.format(org=org)
    # Een naam die zelf op een punt eindigt ("TechBouw B.V.") kreeg er een
    # tweede achter, en twee punten achter elkaar lezen als een typefout.
    return regel.replace(org + ".", org, 1) if org.endswith(".") else regel


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
  <div class="cdist">{_h(_verspreidingsregel(org_name))}</div>
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
        "Het behoudssignaal is een samenvattende groepsscore: de zes onderwerpen over "
        "het werk en de werkbeleving samen, teruggebracht tot &eacute;&eacute;n getal "
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
        "scores per onderwerp verderop laat dit zien of de opgegeven redenen en het bredere werkbeeld "
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
        "Elk onderwerp hieronder is gemeten met drie stellingen; "
        "de score is het groepsgemiddelde daarvan. De kleuren volgen vaste drempels "
        "(kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, relatief sterk vanaf 6,5) "
        "en zijn geen vergelijking met andere organisaties."
    ),
    "verdieping": (
        "Respondenten die op dit onderwerp duidelijk laag antwoordden kregen automatisch een korte vervolgvraag: "
        "welke toelichting past het best bij hun ervaring? De aantallen hieronder zijn tellingen "
        "van wat respondenten zelf kozen, geen interpretatie achteraf. Zo zie je niet alleen "
        "d&aacute;t een onderwerp laag scoort, maar ook wat de groep zelf als reden aandraagt. "
        "Wat er volgens hen moet gebeuren staat bij de gespreksagenda."
    ),
    "werkbeleving": (
        "Naast de onderwerpen over het werk meten we drie psychologische basisbehoeften: autonomie (regie "
        "over de eigen werkwijze), competentie (ervaren bekwaamheid) en verbondenheid (de band "
        "met collega's en organisatie). Onderzoek naar werkmotivatie laat consistent zien dat "
        "deze drie bepalen hoe duurzaam iemand op zijn plek zit. De onderwerpen over het werk "
        "alleen vertellen niet het hele verhaal. Een lage score op een onderwerp, met een "
        "gezonde werkbeleving, vraagt een ander gesprek dan wanneer beide onder druk staan."
    ),
    "werkgeversaanbeveling": (
        "De aanbevelingsscore (eNPS) meet &eacute;&eacute;n ding: zouden medewerkers deze "
        "organisatie aanraden als werkgever? De score loopt van &minus;100 tot +100 en is het "
        "verschil tussen het aandeel uitgesproken aanraders en het aandeel critici. "
        "Lees dit als aanvullende context: het zegt iets over het totaalgevoel, niet waar "
        "dat gevoel vandaan komt."
    ),
    "segmentanalyse": (
        "Deze tabel splitst het beeld uit per afdeling: het aantal ingevulde vragenlijsten "
        "tegenover het aantal uitgenodigden, de gemiddelde score en, bij voldoende "
        "antwoorden, de spreiding. Afdelingen met minder dan vijf antwoorden worden "
        "gebundeld onder &ldquo;Overige afdelingen&rdquo;, zodat antwoorden nooit herleidbaar "
        "zijn tot personen. Verschillen tussen afdelingen zijn gesprekstof: ze vertellen waar "
        "je als eerste gaat kijken, niet welke afdeling het &ldquo;slecht doet&rdquo;. "
        "De kolom met het laagste onderwerp toont per afdeling het onderwerp dat daar het laagst "
        "scoort. Bij kleine afdelingen (5 tot 9 antwoorden) tonen we bewust alleen een "
        "duidingslabel, geen cijfer achter de komma; alle onderwerpen per afdeling met hun "
        "scores staan er vanaf 10 antwoorden."
    ),
    "open_toelichtingen": (
        "Dit zijn de open antwoorden zoals respondenten ze zelf schreven, alleen ontdaan van "
        "herkende namen, e-mailadressen, telefoonnummers en postcodes. Ze staan in ontvangstvolgorde: er is niet geselecteerd "
        "op inhoud en er is geen automatische duiding op losgelaten. De stemmen hieronder geven "
        "kleur aan de cijfers; wat ze betekenen en hoe zwaar ze wegen, bepaal je in de bespreking."
    ),
    "appendix": (
        "Hier staat elke stelling met haar groepsgemiddelde: de volledige onderbouwing "
        "van de scores per onderwerp eerder in dit rapport. Gebruik deze pagina's om te controleren "
        "waar een score vandaan komt of om een specifieke stelling terug te vinden die "
        "in de bespreking ter sprake komt."
    ),
    "gespreksagenda": (
        "Alles wat je tot hier las is de onderbouwing; hier begint het gesprek. Deze agenda "
        "vat samen wat als eerste op tafel hoort, waarom juist dat, en wanneer je erop "
        "terugkomt. Het is bewust geen kant-en-klaar actieplan: de keuzes (wat pakken "
        "we op, wie is eigenaar) maken jullie in de bespreking zelf, met dit "
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
        "Belangrijker dan de absolute kleur is de rangorde. Welk onderwerp het gesprek "
        "begint, bepaalt Loep niet op de score alleen: bij de gespreksagenda verderop "
        "zie je per onderwerp welke signalen meewogen in de volgorde."
    ),
    # "als eerste in de verdieping" verwees naar een hoofdstuk dat in dit rapport
    # niet meer zo heet (spec ronde 2 par. 7): Loep Start heeft geen verdieping.
    "onboarding": (
        "Belangrijker dan de absolute kleur is de rangorde: het onderwerp dat binnen jullie "
        "eigen beeld het laagst scoort, staat verderop vooraan bij de onderwerpen met de "
        "meeste aandacht en in de gespreksagenda."
    ),
}
# Loep Behoud deelt de raster-variant met Loep Vertrek: beide renderen
# _prioriteringsraster. Als alias, niet als kopie, zodat de twee niet uit
# elkaar kunnen lopen bij een copy-wijziging.
OVERZICHTSPROFIEL_RANGORDE["retention"] = OVERZICHTSPROFIEL_RANGORDE["exit"]


def _intro(key: str) -> str:
    return f'<p class="sec-intro">{SECTION_INTROS[key]}</p>'


class _ChapterCounter:
    """Afgeleide hoofdstuknummering (designsprong §4). opener() emit de kop op
    het moment dat een sectie echt wordt gerenderd; conditionele secties
    schuiven zo op zonder gaten. vervolg() geeft het compacte label voor
    doorlooppagina's (verdieping 2+). anchor zet een id op de kop, zodat een
    paginaverwijzing (_pref) ernaartoe kan wijzen (H4)."""

    def __init__(self) -> None:
        self.n = 0

    def opener(self, title: str, *, kicker: str | None = None,
               anchor: str | None = None) -> str:
        # Titel naast het hoofdstuknummer, beide in dezelfde amber (feedback
        # 2026-07-16): de titel is het dominante element van de paginakop, de
        # kicker eronder blijft klein en ondergeschikt.
        self.n += 1
        kicker_html = f'<span class="ch-kicker">{kicker}</span>' if kicker else ""
        id_attr = f' id="{anchor}"' if anchor else ""
        return (f'<div class="ch-head"{id_attr}><span class="ch-idx">{self.n:02d}</span>'
                f'<h2 class="ch-title">{title}</h2></div><hr class="ch-rule">'
                f'{kicker_html}')

    @staticmethod
    def vervolg(eyebrow: str) -> str:
        return f'<span class="slabel">{eyebrow} (vervolg)</span>'

    @staticmethod
    def sub(title: str) -> str:
        """Kop van een volgend onderwerp in hetzelfde hoofdstuk (C12): geen
        "(vervolg)", want het is geen vervolg van het vorige onderwerp."""
        return f'<span class="slabel">{title}</span>'


def _pref(anchor: str) -> str:
    """Lege anker die WeasyPrint met het paginanummer vult (zie a.pref in de CSS)."""
    return f'<a class="pref" href="#{anchor}"></a>'


# Vaste ankers per sectie. Eén bron: de renderers zetten ze op de hoofdstukkop,
# de leidraad wijst ernaar. Ontbreekt een sectie in een rapport (bijv. geen
# afdelingen), dan mag er ook geen verwijzing naar staan.
LEIDRAAD_ANKERS = {
    "context": "sec-context",          # vertrekcontext / behoudscontext / checkpointoverzicht
    "overzicht": "sec-overzicht",      # overzichtsprofiel
    "verdieping": "sec-verdieping",    # eerste verdiepingspagina (startpunt)
    "werkbeleving": "sec-werkbeleving",
    "afdelingen": "sec-afdelingen",
    "toelichtingen": "sec-toelichtingen",
    "agenda": "sec-agenda",
    "methodiek": "sec-methodiek",
    "drempels": "sec-drempels",        # drempeltabel op de methodiekpagina (taak 11)
}


def _leidraad_block(scan_type: str, *, has_segments: bool, has_quotes: bool,
                    has_direction: bool, has_deepening: bool) -> str:
    """"Zo leid je dit gesprek in 45 minuten" (spec par. 4 blok 5): vijf regels
    met tijdvak, wat je op tafel legt en de paginaverwijzing. Vervangt het
    gebruiksblok en de zin over de begeleide managementbespreking (H5): de
    HR-manager is de facilitator, dit is haar script.

    Regel 4 volgt de data: afdelingen als die er zijn, anders de open
    toelichtingen, anders de werkbeleving. Nooit een verwijzing naar een
    sectie die dit rapport niet heeft; de aanroeper geeft geen leidraad mee
    als ook de werkbeleving ontbreekt.

    has_deepening en has_direction volgen dezelfde regel voor regel 3 en 5.
    Een meting van voor de verdiepings- en richtingvraag (campagne-gate, juli
    2026) rendert die blokken niet; de leidraad mag ze dan ook niet beloven.
    Loep Start heeft geen van beide en zegt dat zo.
    """
    A = LEIDRAAD_ANKERS
    p = _pref
    context = {"exit": "de vertrekredenen", "retention": "de blijfintentie en het behoudssignaal",
               "onboarding": "de checkpointscore"}[scan_type]
    if has_segments:
        rij4 = ("Per afdeling", "Waar het per afdeling begint, en hoe dat zich verhoudt tot het "
                                f"startpunt (pagina {p(A['afdelingen'])}).")
    elif has_quotes:
        rij4 = ("Wat mensen zelf schreven", f"De open toelichtingen, ongefilterd (pagina {p(A['toelichtingen'])}).")
    else:
        rij4 = ("Werkbeleving", f"Autonomie, competentie en verbondenheid (pagina {p(A['werkbeleving'])}).")
    slot = ("Wat er volgens je mensen moet gebeuren, en het besluit: &eacute;&eacute;n prioriteit, "
            f"&eacute;&eacute;n eigenaar, een vervolgmoment (pagina {p(A['agenda'])})."
            if has_direction else
            "Het eerste gesprekspunt en het besluit: &eacute;&eacute;n prioriteit, &eacute;&eacute;n "
            f"eigenaar, een vervolgmoment (pagina {p(A['agenda'])}).")
    if scan_type == "onboarding":
        rij3 = (f"Het startpunt: de score en de laagste stelling (pagina {p(A['verdieping'])}). "
                "Open met de gespreksopener hierboven.")
    elif has_deepening:
        rij3 = ("De verdieping van het startpunt: de laagste stelling en wat mensen als toelichting "
                f"kozen (pagina {p(A['verdieping'])}). Open met de gespreksopener hierboven.")
    else:
        rij3 = ("De verdieping van het startpunt: de laagste stelling en de score van elke stelling "
                f"(pagina {p(A['verdieping'])}). Open met de gespreksopener hierboven.")
    # Regel 1 wees tot taak 11 naar de methodiekpagina, met een tweedeling omdat
    # alleen Vertrek en Behoud daar een cel Drempelwaarden hadden (codereview
    # taak 5). Sinds taak 11 staat op alle drie de methodiekpagina's dezelfde
    # drempeltabel (_drempeltabel), dus verwijzen alle drie de producten nu naar
    # dat anker; die tweedeling is daarmee vervallen.
    rij1 = ("De respons en de meetgegevens op deze pagina; de drempels staan op "
            f"pagina {p(A['drempels'])}.")
    rijen = [
        ("0-5 min", "Hoe stevig is dit", rij1),
        ("5-12 min", "Het beeld in één plaatje", f"Het cijferoverzicht (pagina {p(A['overzicht'])}) en {context} "
                                                 f"(pagina {p(A['context'])}). Vraag: verrast dit iemand?"),
        ("12-25 min", "Waar het wringt, en waarom", rij3),
        ("25-33 min", *rij4),
        ("33-45 min", "Wat gaan we doen", slot),
    ]
    # De body-kolom draagt de <a class="pref">-ankers en gaat daarom bewust
    # niet door _h(); het is vaste copy zonder data.
    trs = "".join(f'<tr><td class="lt">{_h(t)}</td><td class="lw">{_h(w)}</td><td>{body}</td></tr>'
                  for t, w, body in rijen)
    return (f'<div class="leidraad"><div class="leidraad-title">Zo leid je dit gesprek in 45 minuten</div>'
            f'<table>{trs}</table>'
            f'<p class="trustline" style="margin-top:6px;">Dit rapport is een groepsbeeld van de organisatie, '
            f'geen beoordeling van personen of afdelingen.</p></div>')


def _heeft_werkbeleving(sdt_avgs: dict) -> bool:
    """Levert de werkbelevingssectie echt rijen op?

    Dezelfde dimensies en dezelfde None-check als die sectie zelf (de sleutels
    van SDT_LABELS), zodat de leidraad niet naar een pagina met lege kaarten
    verwijst (codereview taak 5).
    """
    return any(sdt_avgs.get(dim) is not None for dim in SDT_LABELS)


def _leidraad_html(scan_type: str, *, data: dict, deep_agg: dict, direction_agg: dict,
                   startpunt_fk: str | None, has_sdt: bool, geen_profiel: bool) -> str:
    """Kiest de vlaggen van de leidraad uit de data van dit rapport.

    Eén plek voor de drie renderers (codereview taak 5), zodat ze niet uit
    elkaar lopen: elke vlag hangt aan de gate van de sectie waar de leidraad
    naar verwijst.

    - Zonder factorprofiel geen leidraad: hij zou sturen naar een startpunt,
      een verdieping en een volgorde die er niet zijn.
    - Regel 4 kiest afdelingen, anders de open toelichtingen, anders de
      werkbeleving. Bestaat geen van die drie, dan vervalt de hele leidraad:
      die regel heeft dan geen sectie om naar te verwijzen.
    - Regel 3 belooft de toelichtingen alleen als het verdiepingsblok van het
      startpunt er echt een verdeling van toont (`_deepening_shows_distribution`).
    - Regel 5 volgt `direction_agg`: bij te weinig antwoorden rendert het blok
      "Wat er moet gebeuren" nog wel, met de eerlijke tellingen, dus die
      verwijzing blijft staan.
    """
    if geen_profiel:
        return ""
    has_segments = bool(data.get("segment_rows"))
    has_quotes = _should_show_quotes(data["open_texts"])
    if not (has_segments or has_quotes or has_sdt):
        return ""
    return _leidraad_block(
        scan_type, has_segments=has_segments, has_quotes=has_quotes,
        has_direction=bool(direction_agg),
        has_deepening=_deepening_shows_distribution(
            deep_agg.get(startpunt_fk) if startpunt_fk else None))


# Standaardwaarde voor het derde coverstatistiek als er geen factorprofiel is
# (bug B2): de cover toonde daar een kale streep waar een factornaam hoort.
GEEN_FACTORPROFIEL_LBL = "Nog geen profiel per onderwerp"

# Lege staat van het verdiepingshoofdstuk (review ronde 2). Stond nog op
# "Factor detail beschikbaar na voldoende patroonduiding", terwijl pagina twee
# in diezelfde staat zegt dat een verdieping per thema en een volgorde van
# thema's er nog niet in staan. Nu dezelfde vorm als de andere lege staten
# ("Voor deze meting zijn er geen scores per ..."), met de reden erbij.
#
# Het hoofdstuk blijft bestaan in plaats van te verdwijnen: net als de
# rasterpagina, die bij lege data ook blijft staan en zelf benoemt dat er geen
# rangorde is. Onderdrukken zou het hoofdstuk ook laten verdwijnen in de staat
# waarin er wel factorscores zijn maar geen prioritaire selectie -- daar
# verwijst regel 3 van de leidraad op pagina twee ernaar, en die verwijzing
# hangt aan het anker op deze hoofdstukkop (LEIDRAAD_ANKERS["verdieping"]):
# zonder hoofdstuk wijst het paginanummer nergens heen.
VERDIEPING_GEEN_RANGORDE = (
    "Voor deze meting zijn er geen scores per onderwerp berekend. Zonder die "
    "scores is er geen rangorde om een verdieping aan op te hangen."
)

# Dezelfde lege staat, maar in de woorden van Loep Start (spec ronde 2 par. 7):
# dat rapport heeft geen verdieping om aan een rangorde op te hangen, dus die
# belofte hoort hier niet.
ONBOARDING_GEEN_RANGORDE = (
    "Voor deze meting zijn er geen scores per onderwerp berekend. Zonder die "
    "scores is er geen volgorde om de onderwerpen met de meeste aandacht aan te wijzen."
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

# Zonder factorprofiel weerlegt de tweede helft zichzelf binnen drie zinnen: het
# degraded blok eronder zegt juist dat Loep bij dit aantal antwoorden nog geen
# profiel per factor toont, dus "laat zien waar het wringt" is dan geen belofte
# die dit rapport waarmaakt. De eerste zin gaat over het product en blijft waar;
# die blijft staan, met alleen het deel over de volgende versie erachter.
ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED = (
    "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Wat er "
    "volgens nieuwe medewerkers moet gebeuren volgt in een volgende versie."
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
        kop = (f"Met {n} {antwoorden} toont Loep nog geen profiel per onderwerp. "
               f"{drempelzin}")
    else:
        kop = ("Voor deze meting zijn er geen scores per onderwerp berekend. "
               f"Aan het aantal antwoorden ligt het niet: dat zijn er {n}.")
    return f"{kop} Wat dit rapport wel laat zien: {_opsomming(wel)}."


# Boven dit aantal tekens krijgt de kernzin op p.02 een kleinere letter
# (#p02 .kz-lang in report_css.py). De langste koppen in de stresstest tellen
# 476 tot 480 tekens (01, 09, 19: vlak profiel met een gelijkstand) en passen op
# 20px; de krapste pagina is 08 (413 tekens, plus vijf why-cellen en een
# gelijkspel tussen vertrekredenen). Op die pagina past ook een kop van 500
# tekens nog op 20px (7,8pt over); daarboven is 18px de rem, gemeten met een kop
# van 562 tekens op dezelfde pagina (19pt over; fixronde na plan 3a).
KERNZIN_LANG = 500


def _bestuurlijke_read(*, kernzin: str, primary_label: str, why_cells_html: str,
                       mgmt_q: str, mgmt_q_source: str = "",
                       cijfers_html: str = "", leidraad_html: str = "",
                       responsbasis_html: str = "", opener_html: str = "",
                       direction_line: str = "", brug_zin: str = "",
                       degraded_note: str = "", why_title: str = "",
                       scope_note: str = "") -> str:
    """Pagina twee als MT-vel (spec 16-9 par. 4), in vaste blokvolgorde:
    1 kernzin, 2 cijfers (cijfers_html, taak 2), 3 startpunt en waarom (why-blok
    met alleen echte redenen, C10), 4 gespreksopener (dezelfde als op de agenda,
    H9), 5 leidraad (leidraad_html, taak 5), 6 meetgegevens (responsbasis_html).

    brug_zin (taak 7) is de zin die organisatiebreed en per afdeling aan elkaar
    knoopt; leeg als er geen afdeling wordt aangewezen.

    scope_note (spec ronde 2 par. 7): één regel direct onder de kernzin over wat
    dit product nog niet levert; rendert in beide staten.

    Degraded (bug B2): zonder factorprofiel rendert één expliciete alinea in
    plaats van het why-blok; cijfers en meetgegevens blijven staan, want die
    zijn er in die staat wél. De marker <!-- /why --> sluit het why-blok, zodat
    tests de grens niet uit de whitespace hoeven af te leiden.
    """
    if degraded_note:
        body = (f'<div class="card accent">'
                f'<h3>Wat dit rapport wel en niet laat zien</h3>'
                f'<p style="max-width:62ch;margin-bottom:0;">{_h(degraded_note)}</p></div>'
                f'<!-- /why -->')
    else:
        why_title_html = (_h(why_title) if why_title
                          else f"Waarom {_h(primary_label)} bovenaan staat")
        source_html = f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ""
        direction_html = f'<p class="mq-direction">{_h(direction_line)}</p>' if direction_line else ""
        brug_html = f'<p class="mq-brug">{_h(brug_zin)}</p>' if brug_zin else ""
        body = f"""<div class="why">
    <div class="why-title">{why_title_html}</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
    <div class="mq-line"><span class="mq-label">Gespreksopener</span><p>{_h(mgmt_q)}</p>{source_html}{direction_html}{brug_html}</div>
  </div><!-- /why -->"""
    scope_html = (f'<p class="trustline" style="margin-top:-14px;margin-bottom:18px;">'
                  f'{_h(scope_note)}</p>') if scope_note else ""
    # Een uitzonderlijk lange kop (meer dan KERNZIN_LANG tekens) krijgt een
    # kleinere letter via de wrapper, zodat p.02 op een vel blijft (H16).
    kernzin_html = f'<p class="br-kernzin">{_h(kernzin)}</p>'
    if len(kernzin) > KERNZIN_LANG:
        kernzin_html = f'<div class="kz-lang">{kernzin_html}</div>'
    return f"""<div class="pb sec" id="p02">
  {opener_html or '<span class="slabel">Het antwoord in het kort</span>'}
  {kernzin_html}
  {scope_html}
  {cijfers_html}
  {body}
  {leidraad_html}
  {responsbasis_html}
</div>"""


def _responsbasis(*, invited: int | None, completed: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "",
                  enps_available: bool = True, note: str = "",
                  period_start: str | None = None, period_end: str | None = None,
                  period_conflict: bool = False) -> str:
    """Meetgegevens, blok 6 van pagina twee (spec par. 4): uitgenodigd, ingevuld,
    respons, meetperiode als datums (H8) en één regel met wat niet in dit
    rapport staat. `note` alleen zonder noemer: de zin uit `_respons_noemer`.

    Het percentage is GEEN parameter: deze functie berekent het en de
    waarschuwingszin uit `invited` en `completed`, zodat die twee niet uit
    elkaar kunnen lopen.

    `period_conflict` komt uit `build_report_data` (`period_dates_conflict`):
    een sluitdatum vóór de startdatum is geen meetperiode maar een fout in de
    vastlegging, en die wordt gemeld in plaats van afgedrukt.

    De losse kaarten Populatie, Segmentstatus en Datastatus zijn hierin
    opgegaan (H16: de laatste ervan viel als enige regel op pagina drie). De
    band hoort altijd op pagina twee, dus er is geen variant met een eigen
    pagina meer (codereview taak 5: die tak had geen aanroeper).
    """
    # Zonder noemer vervallen de cellen "Uitgenodigd" en "Respons": een leeg
    # vakje of een 0% zou een meting suggereren die niet bestaat (spec ronde 2
    # par. 6.1). De regel onder de tabel zegt in een hele zin wat er ontbreekt.
    if invited is None:
        stat_cells = f'<td><div class="sc-l">Ingevuld</div><div class="sc-v">{completed}</div></td>'
    else:
        stat_cells = (
            f'<td><div class="sc-l">Uitgenodigd</div><div class="sc-v">{invited}</div></td>'
            f'<td><div class="sc-l">Ingevuld</div><div class="sc-v">{completed}</div></td>'
            f'<td><div class="sc-l">Respons</div>'
            f'<div class="sc-v">{_respons_pct(completed, invited)}%</div></td>'
        )
    if period_conflict:
        periode = "niet betrouwbaar vastgelegd"
    elif period_start and period_end:
        periode = f"{period_start} tot {period_end}"
    elif period_start:
        periode = f"vanaf {period_start}, sluitdatum niet vastgelegd"
    elif period_end:
        periode = f"tot {period_end}, startdatum niet vastgelegd"
    else:
        periode = "niet vastgelegd"
    stat_cells += (f'<td><div class="sc-l">Meetperiode</div>'
                   f'<div class="sc-v" style="font-size:12px;">{_h(periode)}</div>'
                   f'<div class="sc-b">{_h(period)} &middot; {_h(population)}</div></td>')

    caution = _respons_caution(completed, invited, note)
    caution_html = (f'<p class="trustline" style="margin-top:6px;">{_h(caution)}</p>'
                    if caution else "")
    conflict_html = ('<p class="trustline" style="margin-top:4px;">De start- en sluitdatum van '
                     'deze meting staan in de verkeerde volgorde vastgelegd; daarom noemt Loep '
                     'hier geen meetperiode.</p>') if period_conflict else ""

    ontbreekt: list[str] = []
    if not segment_available:
        ontbreekt.append(f"afdelingen ({segment_reason})" if segment_reason else "afdelingen")
    if not enps_available:
        ontbreekt.append("werkgeversaanbeveling (eNPS)")
    ontbreekt_html = (f'<p class="trustline" style="margin-top:4px;">Niet in dit rapport: '
                      f'{_h(", ".join(ontbreekt))}.</p>') if ontbreekt else ""

    # De statregel blijft als geheel bij elkaar (spec §1 randgeval).
    body = f"""<span class="slabel">Meetgegevens</span>
  <table class="sg no-break"><tr>{stat_cells}</tr></table>
  {caution_html}{conflict_html}{ontbreekt_html}"""
    # Maten via .meet-blok (#p02 in report_css.py), niet inline: de witruimte
    # boven dit blok was 40px en liet p.02 overlopen (observatie 9).
    return f'<div class="meet-blok">{body}</div>'


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
                      "zijn de eerste onderwerpen om gericht te bespreken")
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
    "Dit rapport wijst nog geen onderwerp aan om mee te beginnen. Wat herkennen "
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


def _laagste_stelling_reikwijdte(score: float | None,
                                 alle_scores: list[float | None]) -> tuple[bool, bool]:
    """(laagste_van_alles, uniek) voor de claim over de laagst scorende stelling.

    Twee onafhankelijke vragen, en de zin heeft ze allebei nodig:

    * Is dit de laagste van alle gemeten stellingen? De gekozen stelling is de
      laagste *binnen het startthema*, en het startthema is de laagste factor op
      het gemiddelde. Een gemiddelde verbergt zijn spreiding: werkdruk 5,1 uit
      5,6 en 4,6 is de laagste factor, terwijl groei 5,9 uit 8,0 en 3,8 een
      lagere losse stelling heeft. Dan is 4,6 niet de laagste van het rapport,
      en is ook "een van de laagste" onwaar; de zin beperkt zich dan tot het
      thema.
    * Is de waarde uniek? Zo niet, dan is elke exclusieve formulering onwaar en
      spreekt de appendix het rapport tegen.

    Vergelijken gaat over de GETOONDE score (zie _shown, B15): 5.14 en 5.09
    staan allebei als 5.1 in de tabel, en dan leest "de laagst scorende
    stelling" als een fout.
    """
    getoond = [_shown(v) for v in alle_scores if v is not None]
    doel = _shown(score)
    if doel is None or not getoond:
        return False, False
    return doel == min(getoond), getoond.count(doel) == 1


def _laagste_stelling_zin(factor_label: str, stelling: str, score: float,
                          *, laagste_van_alles: bool, uniek: bool) -> str:
    """Een constatering over de laagst scorende stelling, precies één keer.

    Vier uitkomsten uit twee onafhankelijke booleans (zie
    _laagste_stelling_reikwijdte). uniek slaat op de reikwijdte die de zin
    noemt: bij laagste_van_alles op alle gemeten stellingen, anders op het
    thema, waar de gekozen stelling per definitie de laagste is.
    """
    welke = ("de laagst scorende stelling" if uniek
             else "een van de laagst scorende stellingen")
    waar = "in het cijferbeeld" if laagste_van_alles else "van dit onderwerp"
    return (f"Bespreek eerst ‘{stelling}’ binnen {factor_label.lower()} "
            f"({score:.1f}/10). Dat is {welke} {waar}.")


def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            review_when: str,
                            primary_why: str | None = None,
                            second_why: str | None = None,
                            opener_html: str = "",
                            degraded_note: str = "",
                            opener_op_p02: bool = False,
                            brug_zin: str = "") -> str:
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

    brug_zin (taak 7, B2): dezelfde zin als op pagina twee, die het ene
    organisatiebrede startpunt verbindt met wat de aangewezen afdeling laag
    heeft. Leeg als geen afdeling wordt aangewezen.

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
            f'<td class="step"><div class="step-no">Primair onderwerp</div>'
            f'<div class="step-body">{_h(primary_theme)}</div>{_why(primary_why)}</td>'
            f'\n    <td class="step"><div class="step-no">Tweede aandachtspunt</div>'
            f'<div class="step-body">{_h(second_point)}</div>{_why(second_why)}</td>')
        opener_vraag = mgmt_q
        review_hint = review_when
    # Alleen als p.02 dezelfde opener toont (de aanroeper vergelijkt); zonder
    # profiel staat op p.02 geen opener.
    verwijzing_html = ('<p class="agenda-why" style="margin-top:6px;">Dezelfde opener '
                       f'staat op pagina {_pref("p02")}.</p>'
                       ) if (opener_op_p02 and not degraded_note) else ""

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Eerste managementspoor</span>'}
  {intro_html}
  {f'<p class="mq-brug mq-brug-sec">{_h(brug_zin)}</p>' if brug_zin else ''}
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
    {verwijzing_html}
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
_SIGNAL_EXIT_REASON = "hoe vaak een onderwerp als hoofdreden van vertrek is genoemd"
_SIGNAL_SPREAD = "de spreiding tussen respondenten"
_SIGNAL_DEEPENING = "wat respondenten in de verdieping als toelichting kozen"
_SIGNAL_DIRECTION = "hoeveel mensen bij een onderwerp om verandering vragen"
# Aantalwoorden in klantcopy: het aantal signalen in de rasterintro hieronder
# (2 tot 5) en het aantal factoren in de vlak-profiel-zin op p.02 (2 tot 6, want
# een vlak profiel heeft er minstens twee); "alle zes" leest beter dan "alle 6".
# Een dict, geen tweede kopie bij profile_shape: twee definities van dezelfde
# naam in een module overschrijven elkaar stil. Bewust hard indexeren: een
# aantal buiten dit bereik is een bug, geen reden om "alle 7" te drukken.
_TELWOORD = {2: "twee", 3: "drie", 4: "vier", 5: "vijf", 6: "zes"}


def _alle_onderwerpen(n: int, *, kaal: bool = False) -> str:
    """"alle zes onderwerpen" tegenover "beide onderwerpen" (taalronde, taak 13).

    "alle twee onderwerpen scoren 6.2/10" is geen Nederlands; bij precies twee
    hoort "beide". Met kaal=True blijft het woord onderwerpen weg, voor een zin
    die het er zelf al bij zegt.
    """
    kern = "beide" if n == 2 else f"alle {_TELWOORD[n]}"
    return kern if kaal else f"{kern} onderwerpen"

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
    return (f"Dit overzicht weegt alle zes onderwerpen tegen elkaar af op "
            f"{_TELWOORD[len(signals)]} signalen: {lijst}. {waar}{staart} Zo is de "
            "volgorde navolgbaar. De bespreking beslist; dit raster structureert.")


def raster_uitleg(scan_type: str, deepening_active: bool,
                  direction_active: bool) -> str:
    """Sorteerregel onder de tabel. De regel zelf blijft een zin; daarna volgt
    één slotzin die de drempels van deze meting opsomt en naar de drempeltabel
    op de methodiekpagina wijst (B20/H18): vier drempels op drie pagina's, maar
    de uitleg staat één keer. De getallen komen uit de constanten die ze ook echt
    sturen, zodat de copy niet kan gaan liegen als een drempel verandert.

    De slotzin eindigt bewust ZONDER punt: _prioriteringsraster zet daar de
    paginaverwijzing (_pref) achter. Deze functie blijft een kale string, want de
    contract-test pint de volledige string als substring van de HTML-output en
    een anker erin zou daar letterlijk in belanden."""
    marge = str(PRIORITY_TIE_MARGIN).replace(".", ",")
    reden = (", waarbij ook meeweegt hoe vaak een onderwerp als hoofdreden van vertrek is genoemd"
             if scan_type == "exit" else "")
    # "of", niet "en": de sleutel past ze na elkaar toe, allebei tegelijk hoeft niet.
    terugval = ("geeft een grote spreiding of een gedeelde toelichting uit de "
                "verdieping de doorslag" if deepening_active
                else "geeft een grote spreiding de doorslag")
    if direction_active:
        regel = (f"Liggen scores binnen {marge} van elkaar, dan telt eerst waar de "
                 "meeste mensen om verandering vragen, en alleen als een onderwerp er "
                 f"minstens {TOP_CHOICE_MIN_LEAD} mensen bovenuit steekt; anders "
                 f"{terugval}.")
    else:
        regel = f"Liggen scores binnen {marge} van elkaar, dan {terugval}."
    drempels = (f"De drempels (spreiding vanaf {MIN_DISTRIBUTION_N}"
                + (f", verdieping vanaf {DEEPENING_MIN_N}" if deepening_active else "")
                + (f", richting vanaf {DIRECTION_MIN_N}" if direction_active else "")
                + ") staan uitgelegd in de drempeltabel")
    return (f"Hoe deze volgorde tot stand komt: gesorteerd op score{reden}. {regel} "
            f"{drempels}")


RASTER_LEGENDA = (
    "Het blokje in de spreidingsbalk markeert het groepsgemiddelde; de "
    "telling eronder toont hoeveel respondenten dit onderwerp onder de 5 "
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
    "Dit overzicht weegt normaal alle zes onderwerpen tegen elkaar af. Voor deze "
    "meting is er nog geen profiel per onderwerp, dus ook geen volgorde en geen "
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
                         direction_block_html: str | None = None,
                         brug_zin: str = "") -> str:
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

    brug_zin (taak 7, B2): dezelfde zin als op pagina twee, die het ene
    organisatiebrede startpunt verbindt met wat de aangewezen afdeling laag
    heeft. Leeg als geen afdeling wordt aangewezen.

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
            return '<span class="r-mono">spreiding vanaf 10 antwoorden</span>'
        strip = distribution_svg(scores, width=200, height=22)
        return (f'{strip}<br><span class="r-mono">'
                f'{row["spread_below"]} van {row["spread_n"]} onder de 5</span>')

    def _agenda_cell(row: dict) -> str:
        """Alleen de rol. De near-tie-regel stond hier ook (C13), maar "vrijwel
        gelijk aan Werkdruk en herstelruimte" in een kolom van 14% brak over vier
        regels en las als een label bij de agenda-rol. Die regels staan nu als
        volle zin onder de tabel."""
        if row["agenda_role"] == "startpunt":
            return "<b>Startpunt</b>"
        if row["agenda_role"] == "tweede":
            return "<b>Tweede punt</b>"
        return ""

    is_exit = scan_type == "exit"
    reason_th = '<th style="width:13%">Als hoofdreden genoemd</th>' if is_exit else ""
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

    # C13: de gelijkspel-meldingen als volle zinnen onder de tabel, in dezelfde
    # volgorde als de rijen. De fallback op de sleutel blijft staan (zoals in de
    # oude agendacel): near_tie_with hoort naar een rij in deze lijst te wijzen,
    # maar een ontbrekende rij mag geen StopIteration in een klantrapport geven.
    ties = [f'{_h(r["label"])} staat vrijwel gelijk aan '
            + _h(next((x["label"] for x in ranked if x["key"] == r["near_tie_with"]),
                      r["near_tie_with"]))
            for r in ranked if r["near_tie_with"]]
    ties_html = f'<p class="r-legend">{"; ".join(ties)}.</p>' if ties else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    # Kop in een <thead> (ronde 2 observatie 4): in een <tbody> herhaalt WeasyPrint
    # hem niet, dus stond de tabel op een vervolgpagina zonder kolomnamen.
    # "Onderwerp" en niet "Factor": dat is de term die de rest van het rapport
    # gebruikt.
    tabel = f"""<table class="raster-tbl"><thead><tr><th style="width:{w_factor}">Onderwerp</th><th style="width:12%">Score</th>{reason_th}<th style="width:{w_spread}">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th></tr></thead>{body}</table>
  {ties_html}
  {legenda}
  {gate}
  <div class="r-uitleg">{raster_uitleg(scan_type, deepening_active, direction_active)} op pagina {_pref(LEIDRAAD_ANKERS["drempels"])}.</div>""" if ranked else ""

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
  {f'<p class="mq-brug mq-brug-sec">{_h(brug_zin)}</p>' if brug_zin else ''}
  {dir_block}
  <div class="no-break agenda-slot">
  <div class="agenda-dark" style="margin-top:16px;">
    <div class="agenda-opener">
      <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(opener_vraag)}</p>
      {f'<p class="agenda-why" style="margin-top:6px;">Dezelfde opener staat op pagina {_pref("p02")}.</p>' if ranked else ''}
    </div>
    <table class="steps fill-steps"><tr>
      <td class="step">{_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}</td>
      <td class="step">{_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}</td>
      <td class="step">{_fill_row("Vervolgmoment", review_hint)}</td>
    </tr></table>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
  </div>
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
        return ("Gebaseerd op de score en hoe vaak dit onderwerp als "
                "hoofdreden van vertrek is genoemd.")
    return _bron_laagste_score(top["score"], [(r["label"], r["score"]) for r in rows[1:]])


def _bron_laagste_score(score: float, overige: list[tuple[str, float]]) -> str:
    """Bronregel "op de laagste score", eerlijk bij een gedeelde laagste.

    Delen meer onderwerpen de laagste GETOONDE score (B15), dan is "de laagst
    scorende factor" niet één onderwerp: zeg met wie het die score deelt, zoals
    de kop erboven (plan 3a taak 4, open punt uit taak 3). overige: (label,
    score) van de andere onderwerpen."""
    if score is None:
        return "Gebaseerd op het laagst scorende onderwerp."
    gelijk = [lbl for lbl, sc in overige if sc is not None and _shown(sc) == _shown(score)]
    if len(gelijk) == 1:
        return f"Gebaseerd op de laagste score; die deelt dit onderwerp met {gelijk[0]}."
    if gelijk:
        aantal = _TELWOORD.get(len(gelijk), str(len(gelijk)))
        return f"Gebaseerd op de laagste score; die deelt dit onderwerp met {aantal} andere onderwerpen."
    return "Gebaseerd op het laagst scorende onderwerp."


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
    return f"{n} {_werkwoord(n, enkelvoud, meervoud)}"


def _werkwoord(n: int, enkelvoud: str, meervoud: str) -> str:
    """Alleen het werkwoord, voor de zinnen waarin het getal er niet direct
    voor staat ("6 van de 12 kozen"). Eén regel voor de vervoeging, twee vormen:
    _tel plakt het getal eraan vast, deze laat de zin ertussen."""
    return enkelvoud if n == 1 else meervoud


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
    "Zonder profiel per onderwerp is er nog geen startpunt om die antwoorden aan "
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


def _telling(x: int, y: int) -> str:
    """Vaste tellingsvorm (B14): "X van de Y (P%)" vanaf MIN_DISTRIBUTION_N,
    anders zonder percentage (dezelfde staffel als de tabellen; onder tien
    antwoorden suggereert een percentage precisie die er niet is).

    De uitleg van de noemer hoort in de zin en niet hier: die verschilt per
    plaats (_dir_n_wie voor de richtingkaarten, "= wie hier duidelijk laag antwoordde" in de
    verdiepingsketen). Een parameter die alleen bedoeld was als herinnering deed
    niets met zijn waarde en suggereerde dat hij in de output landde.

    Zonder noemer bestaat de vorm niet: dat is precies de kale telling die B14
    verbiedt, en "3 van de 0" afdrukken in een klant-PDF is erger dan omvallen.
    """
    if y <= 0:
        raise ValueError(f"_telling: telling {x} zonder noemer (y={y})")
    pct = f" ({round(x / y * 100)}%)" if y >= MIN_DISTRIBUTION_N else ""
    return f"{x} van de {y}{pct}"


def _respondenten(n: int) -> str:
    """"1 respondent" tegenover "39 respondenten"; de noemer van elke keten."""
    return f"{n} " + _werkwoord(n, "respondent", "respondenten")


def _statusrest(offered: int, answered: int, skipped: int) -> str:
    """Sluitregel van een keten (B14, H19): beantwoord + overgeslagen moet het
    aanbod dekken. De aggregaties garanderen dat (elke entry is answered of
    skipped), dus een verschil betekent beschadigde data. Dan staat er wat er
    ontbreekt, in plaats van een keten waarin mensen stil verdwijnen.
    """
    rest = offered - answered - skipped
    if rest <= 0:
        return ""
    return (f"; van {rest} {_werkwoord(rest, 'antwoord', 'antwoorden')} is niet "
            "vastgelegd of de vraag is beantwoord")


def _dir_n_wie(label: str | None = None) -> str:
    """Wie de noemer van een richtingkaart zijn (codereview taak 10).

    `n` is `agg["answered"]`, dus niet iedereen bij wie dit onderwerp het laagst
    scoorde: wie oversloeg zit er niet in, en dan is `lowest_n` groter. Alleen de
    clear-tak zei dat; de vier andere staten en pagina twee noemden hetzelfde
    getal "bij wie dit het laagst scoorde", drie regels boven een keten die de
    twee getallen los van elkaar toont. Eén bron voor die bijzin, zodat de zes
    plaatsen niet elk hun eigen omschrijving kunnen krijgen.
    """
    return (f"bij wie {_lc(label)} het laagst scoorde en die de vraag beantwoordden"
            if label else
            "bij wie dit het laagst scoorde en die de vraag beantwoordden")


def _dir_noemer_zin(n: int, label: str | None = None, *, los: bool = True) -> str:
    """De noemer van een richtingkaart ACHTER de telling in plaats van erin
    (taalronde, taak 13).

    De clear-tak had deze vorm al: "Volgens 20 van de 32; die 32 zijn de mensen
    bij wie X het laagst scoorde en die de vraag beantwoordden." De drie andere
    staten zetten diezelfde bijzin tussen het onderwerp en het werkwoord ("27 van
    de 62 (44%) bij wie groeiperspectief het laagst scoorde en die de vraag
    beantwoordden kozen die richting"): een tangconstructie van tien woorden.
    Dezelfde woorden en dezelfde noemer, maar als eigen zin erachter.

    los=False hangt hem met een puntkomma aan de clausule ervoor; dat is de
    clear-tak, die één bron met de andere drie deelt zodat het noemerlabel niet
    op vijf plaatsen los kan gaan lopen.
    """
    return ("D" if los else "d") + f"ie {n} zijn de mensen {_dir_n_wie(label)}."


# Zelfde claim in de vorm die achter "de {n}" past (pagina twee en de
# divided-kaart): "de 10 die dit het laagst scoorden en de vraag beantwoordden".
DIR_N_DIE_WIE = "die dit het laagst scoorden en de vraag beantwoordden"


def _beperkte_basis_note() -> str:
    """De beperkte-basis-regel onder een verdeling, met de verwijzing naar de
    drempeltabel (B20/H18).

    Eén bron voor twee plekken: onder de verdiepingsverdeling (_deepening_block,
    onder MIN_AGGREGATE_N antwoorden) en onder een richtingkaart
    (_direction_card_cell, bij DIRECTION_MIN_N of DIRECTION_CAVEAT_MAX_N). De twee
    hadden dezelfde bedoeling in twee formuleringen ("Beperkte antwoordbasis" en
    "Beperkte basis") en de drempel erachter stond nergens uitgelegd. De opmaak
    zit in .dir-caveat in het stylesheet (codereview taak 9, bevinding 3).
    """
    return ('<p class="dir-caveat">Beperkte basis: gebruik dit als gesprekshaakje, '
            f'niet als conclusie (drempels: pagina {_pref(LEIDRAAD_ANKERS["drempels"])}).</p>')


def _direction_chain(agg: dict, n_total: int) -> str:
    """Keten laagst -> (aangeboden ->) beantwoord/overgeslagen, in de vaste
    tellingsvorm (B14, H2): elke stap noemt zijn eigen noemer, en de stappen
    tellen op.

    Bij lowest_n == 0 (mogelijk bij kleine n: iemands eigen laagste factor is
    niet per se de groeps-startpuntfactor) is er geen keten om te tonen. Een
    clausule met telling 0 ("0 kregen de vraag") is altijd fout Nederlands en
    wordt dus overgeslagen; kreeg niemand de vraag terwijl dit wél iemands
    laagste onderwerp was, dan zegt de keten dat met woorden (H19: die mensen
    mogen niet spoorloos zijn).

    Is er méér aangeboden dan er nu een laagste onderwerp hebben, dan opent de
    keten vanaf het aanbod en zegt ze wat er niet klopt. Zie de toelichting bij
    die tak: dat is versiedrift, geen onmogelijkheid.

    De clausules dragen bewust geen percentage: vier percentages achter elkaar
    zijn ruis. Het percentage hoort bij de vergelijking van groepen, en staat
    daarom in de bronregel en de verdelingstabel (_telling).
    """
    lowest, offered = agg["lowest_n"], agg["offered"]
    answered, skipped = agg["answered"], agg["skipped"]
    # Versiedrift, en daarmee bereikbaar met echte data: `offered` komt uit de
    # opgeslagen antwoorden, terwijl `lowest_n` bij elke render opnieuw uit de
    # ruwe scores wordt berekend (aggregate_direction tolereert en logt deze
    # staat om precies die reden). Verandert de rekenregel voor het laagste
    # onderwerp, dan kan iemand de vraag hebben gekregen over een onderwerp dat
    # nu niet meer zijn laagste is. Hard falen zou de download van een
    # historisch rapport laten mislukken; renderen alsof er niets aan de hand is
    # gaf "10 van de 10 beantwoordden de vraag" onder "9 hadden dit als
    # laagste". Dus: een zichtbaar gedegradeerde keten die beide getallen noemt
    # (Fail Loud trap 2), in dezelfde vorm als _deepening_chain bij
    # offered > triggered.
    drift = offered > lowest
    if drift:
        nu = _respondenten(lowest) if lowest else "geen enkele respondent"
        opener = (f"{offered} van de {_respondenten(n_total)} "
                  + _werkwoord(offered, "kreeg", "kregen")
                  + " de vraag over dit onderwerp "
                  + f"(met de rekenregels van nu is dit bij {nu} het laagste onderwerp, "
                  + "dus die twee tellingen sluiten niet op elkaar)")
    elif lowest == 0:
        return "Niemand had dit als eigen laagste onderwerp."
    else:
        had = _werkwoord(lowest, "had", "hadden")
        opener = (f"{lowest} van de {_respondenten(n_total)} {had} dit als eigen "
                  "laagste onderwerp")
    parts: list[str] = []
    # Bij drift is offered groter dan lowest, dus is er niets "deels aangeboden"
    # en is offered nooit 0.
    deels_aangeboden = 0 < offered < lowest
    if deels_aangeboden:
        parts.append(f"{offered} van de {lowest} "
                     + _werkwoord(offered, "kreeg de vraag", "kregen de vraag"))
    elif offered == 0:
        return f"{opener}; niemand van hen kreeg de vraag."
    # De noemer van "beantwoordden" is wie de vraag kreeg; bij offered == lowest
    # is dat hetzelfde getal. Bij drift (offered > lowest) blijft het het aanbod,
    # zodat de clausule nooit "10 van de 9" wordt; de opener heeft dan al gezegd
    # dat de twee tellingen uiteen lopen.
    noemer = offered
    if answered:
        voorwerp = "die" if deels_aangeboden else "de vraag"
        if noemer == 1:
            # "1 van de 1 beantwoordde de vraag" is de vorm zonder inhoud; met
            # één iemand is de noemer de persoon zelf.
            parts.append("die ene beantwoordde hem")
        else:
            parts.append(f"{answered} van de {noemer} "
                         + _werkwoord(answered, "beantwoordde", "beantwoordden")
                         + f" {voorwerp}")
    if skipped:
        parts.append(f"{skipped} " + _werkwoord(skipped, "sloeg over", "sloegen over"))
    if not parts:
        return f"{opener}."
    return f"{opener}; {', '.join(parts)}{_statusrest(offered, answered, skipped)}."


def _direction_totals(direction_agg: dict) -> tuple[int, int, int]:
    """Aangeboden, beantwoord en overgeslagen over alle onderwerpen samen.

    Eén bron voor die drie sommen: zowel de totaalregel op de gespreksagenda als
    het degraded blok verantwoorden hiermee alle richtingantwoorden, en twee
    kopieën van dezelfde optelling kunnen stil uiteen lopen.

    Direct geïndexeerd, zonder .get-fallback, om dezelfde reden als in
    _wat_moet_gebeuren_block: aggregate_direction vult elke factor met alle drie
    de sleutels, dus een ontbrekende sleutel is een codebug die hoort te
    KeyError'en in plaats van stil als nul mee te tellen in een zin die de klant
    leest als volledige verantwoording.
    """
    return (sum(a["offered"] for a in direction_agg.values()),
            sum(a["answered"] for a in direction_agg.values()),
            sum(a["skipped"] for a in direction_agg.values()))


def _direction_totals_line(direction_agg: dict, agenda_keys: list[str], scan_type: str,
                           n_total: int) -> str:
    """De sluitende richtingketen op de gespreksagenda (B14, H19): totaal
    gekregen/beantwoord/overgeslagen, wie het startpunt en het tweede punt als
    laagste had, en waar de rest is gebleven. Elke respondent krijgt precies één
    richtingvraag, dus de som over de onderwerpen is het aantal respondenten.

    Sluit die som niet, dan staat er wat er ontbreekt. Dat kan op twee manieren,
    en beide zijn met echte data bereikbaar:

    1. een respondent die geen enkele stelling over deze onderwerpen invulde
       heeft geen laagste onderwerp (`compute_direction_factor` geeft `None`),
       dus de onderwerpen tellen niet op tot het aantal respondenten;
    2. een respondent bij wie dit onderwerp wél het laagst scoorde kreeg de vraag
       nooit (`lowest_n > offered`, bij een campagne die over de deploy heen
       liep). Zin 1 telt `offered` en zin 2 telt `lowest_n`, dus zonder deze
       melding staat "kregen 28 de vraag" naast "de overige 11 een ander
       onderwerp ... daarom niet uitgewerkt" over elf mensen zonder antwoord.
       Die groep valt bij drift in tweeën: hoogstens het overschot kreeg de vraag
       over een ánder onderwerp (dat staat in de overschotmelding, met zijn eigen
       getal), en alleen wat daarna overblijft kreeg zeker geen vraag. Alleen
       over dát deel zegt de regel dat er geen antwoord van is;
    3. de omgekeerde drift: er is méér aangeboden dan er nu een laagste onderwerp
       hebben (`offered > toegewezen`). Dan hebben mensen zonder herberekend
       laagste onderwerp de vraag wél gekregen, en mag de slotzin niet beweren
       dat zij geen stelling invulden.

    In alle gevallen vervalt het woord "overige" en volgt de reden. Nooit een
    getal bijschatten om de som te laten kloppen (H19 ging er juist over dat
    twaalf mensen nergens stonden).

    Alleen `toegewezen > n_total` blijft een harde fout: dat is rekenkundig
    onmogelijk (elke respondent draagt aan ten hoogste één onderwerp bij), dus
    geen drift maar een codebug of een inconsistente aanroep.
    """
    offered, answered, skipped = _direction_totals(direction_agg)
    if not offered:
        return ""
    delen = []
    if answered:
        delen.append(f"{answered} "
                     + _werkwoord(answered, "beantwoordde hem", "beantwoordden hem"))
    if skipped:
        delen.append(f"{skipped} " + _werkwoord(skipped, "sloeg over", "sloegen over"))
    zin = (f"Van de {_respondenten(n_total)} "
           + _werkwoord(offered, "kreeg", "kregen") + f" {offered} de vraag")
    if delen:
        zin += ", " + ", ".join(delen)
    zin += "."

    agenda = [(k, direction_agg[k]["lowest_n"]) for k in agenda_keys if k in direction_agg]
    toegewezen = sum(a["lowest_n"] for a in direction_agg.values())
    # Wie dit als laagste had maar de vraag nooit kreeg. Per onderwerp gemeten:
    # één onderwerp met een gat mag niet worden weggepoetst door een ander
    # onderwerp waar offered hoger uitkomt.
    niet_gevraagd = sum(max(0, a["lowest_n"] - a["offered"]) for a in direction_agg.values())
    if toegewezen > n_total:
        # Onbereikbaar met echte data (elke respondent draagt aan ten hoogste
        # één onderwerp bij), dus een codebug of een inconsistente aanroep. De
        # zin zou dan onzin zijn ("de overige" uit een som die niet kan), dus
        # stopt de generatie hier in plaats van hem te renderen.
        raise ValueError(
            f"_direction_totals_line: laagste-onderwerptelling {toegewezen} groter dan "
            f"het aantal respondenten {n_total}")
    # Meer aanbod dan laagste-onderwerpen: dezelfde versiedrift als in
    # _direction_chain. Per onderwerp gemeten, net als niet_gevraagd hierboven en
    # om dezelfde reden (codereview taak 11): de waarschijnlijkste drift laat
    # respondenten tússen onderwerpen schuiven, dus blijft de som gelijk en zag
    # een meting op de som niets. Dan stond er "kregen 16 de vraag, 16
    # beantwoordden hem" naast "Bij 8 van de 16 is die vraag niet gesteld".
    overschot = sum(max(0, a["offered"] - a["lowest_n"]) for a in direction_agg.values())
    sluit = toegewezen == n_total and niet_gevraagd == 0 and overschot == 0
    delen2: list[str] = []
    for i, (k, cnt) in enumerate(agenda):
        lbl = _lc(_fl(k, scan_type))
        if i == 0:
            # Alleen het eerste deel draagt het werkwoord en de uitleg van de
            # noemer; de rest hangt eraan ("16 hadden X als laagste onderwerp,
            # 11 Y").
            delen2.append(f"{cnt} " + _werkwoord(cnt, "had", "hadden")
                          + f" {lbl} als laagste onderwerp")
        else:
            delen2.append(f"{cnt} {lbl}")
    if delen2:
        zin += " " + ", ".join(delen2)
    rest = [(k, a["lowest_n"]) for k, a in direction_agg.items()
            if k not in agenda_keys and a["lowest_n"] > 0]
    rest_n = sum(c for _k, c in rest)
    if rest_n:
        lijst = ", ".join(f"{_lc(_fl(k, scan_type))} {c}"
                          for k, c in sorted(rest, key=lambda kc: (-kc[1], kc[0])))
        overige = f"de overige {rest_n}" if sluit else str(rest_n)
        zin += f"; {overige} een ander onderwerp ({lijst})."
        # "Die antwoorden ... niet uitgewerkt" alleen als er buiten de agenda
        # echt antwoorden zijn: kreeg niemand van hen de vraag, dan bestaan die
        # antwoorden niet en zou de zin een keuze suggereren die Loep niet had.
        rest_antwoorden = sum(a["answered"] for k, a in direction_agg.items()
                              if k not in agenda_keys)
        if rest_antwoorden:
            zin += (" Die antwoorden gaan over onderwerpen die niet op de agenda staan "
                    "en zijn daarom niet uitgewerkt.")
    elif delen2:
        zin += "."
    # Van de groep zonder aanbod op het eigen laagste onderwerp kan hoogstens het
    # overschot de vraag over een ánder onderwerp hebben gekregen; wat overblijft
    # kreeg zeker geen vraag, en alleen over dat deel mag hier staan dat er geen
    # antwoord van is. Eén globale vlag rekende eerst de hele groep naar de
    # verschoven kant, en dat klopte alleen zolang er twee onderwerpen in het
    # spel waren (review taak 12): bij groeiperspectief 15/20, werkdruk 8/8 en
    # leiderschap 16/0 stond er "Bij 16 van de 39 is de vraag niet over hun
    # laagste onderwerp gesteld", terwijl er 28 aanbiedingen waren en dus elf
    # mensen helemaal geen vraag kregen. De verschoven mensen staan met hun eigen
    # getal in de overschotmelding hieronder, dus ze vallen nergens weg.
    zonder_vraag = max(0, niet_gevraagd - overschot)
    if zonder_vraag:
        zin += (f" Bij {zonder_vraag} van de {n_total} is die vraag niet gesteld; "
                "van hen is er dus geen antwoord.")
    # Twee losse meldingen, want het zijn twee losse feiten (codereview taak 11):
    # het overschot hoeft niet in de groep zonder herberekend laagste onderwerp te
    # passen, dus een zin als "en 8 van hen kregen de vraag toch" kan over één
    # mens gaan. De reden "zij vulden geen van de stellingen in" staat er alleen
    # zonder drift: met drift kregen mensen de vraag wél, en dan leest die reden
    # als een tegenspraak.
    if toegewezen < n_total:
        ontbreekt = n_total - toegewezen
        if overschot:
            zin += (f" Bij {_respondenten(ontbreekt)} kon Loep met de rekenregels van nu "
                    "geen laagste onderwerp vaststellen.")
        else:
            zin += (f" Bij {_respondenten(ontbreekt)} kon Loep geen laagste onderwerp "
                    "vaststellen: zij vulden geen van de stellingen over deze onderwerpen in.")
    if overschot:
        zin += (f" Bij {overschot} van de {n_total} ging de vraag over een onderwerp dat "
                "met de rekenregels van nu niet hun laagste onderwerp is; die telling "
                "sluit daarom niet op de verdeling hierboven.")
    return zin


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
        # Vaste tellingsvorm met uitleg van de noemer (B14): "de mensen bij wie
        # dit het laagst scoorde" is een andere selectie dan de respondenten en
        # dan wie hier duidelijk laag antwoordde, en die drie stonden ongelabeld naast elkaar
        # (H2).
        # Niet twee haakjes achter elkaar ("(53%) (36 = ...)"): de uitleg van de
        # noemer staat als bijzin achter de telling.
        src = (f"Volgens {_telling(st['top_n'], n)}; "
               f"{_dir_noemer_zin(n, label, los=False)}")
    elif st["state"] == "none_needed":
        head = DIRECTION_HEAD_NONE_NEEDED
        opt = _opt(st["top_key"])
        src = (f"{_telling(st['top_n'], n)} kozen ‘{opt}’. "
               f"{_dir_noemer_zin(n, label)} Bespreek of dit dan {which} moet zijn.")
    elif st["state"] == "plurality":
        head = DIRECTION_HEAD_PLURALITY.format(opt=_opt(st["top_key"]))
        # De tweede optie komt uit ranked zelf en niet uit second_n, zodat de
        # zin de optie noemt die bij dat getal hoort. Is er geen tweede optie
        # (mogelijk als answered hoger ligt dan de som van de keuzes), dan komt
        # die clausule er niet; een tweede groep verzinnen mag niet.
        rest = [(k, c) for k, c in st["ranked"] if k != st["top_key"]]
        tweede = (f"; {_tel(rest[0][1], 'koos', 'kozen')} ‘{_opt(rest[0][0])}’"
                  if rest else "")
        src = (f"{_telling(st['top_n'], n)} kozen die richting{tweede}. "
               f"{_dir_noemer_zin(n, label)} Wat er volgens de grootste groep moet "
               f"gebeuren: {direction_imperative(scan_type, factor_key, st['top_key'])}")
    elif st["state"] == "split_none":
        # "even groot" alleen als de twee groepen echt gelijk zijn; zie de
        # toelichting bij DIRECTION_HEAD_SPLIT_NONE.
        deel = "even groot" if st["none_n"] == st["top_n"] else "ander"
        head = DIRECTION_HEAD_SPLIT_NONE.format(deel=deel, opt=_opt(st["top_key"]))
        # Noemer op de eerste telling, zoals in de plurality-tak: twee kale
        # tellingen naast elkaar lezen bij 14 en 14 uit 31 als een groep van 28
        # (B14). De tweede hangt aan diezelfde noemer.
        src = (f"{_telling(st['none_n'], n)} "
               f"{_werkwoord(st['none_n'], 'koos', 'kozen')} ‘{_opt(st['none_key'])}’; "
               f"{_tel(st['top_n'], 'koos', 'kozen')} "
               f"‘{_opt(st['top_key'])}’. {_dir_noemer_zin(n, label)} "
               f"Op een onderwerp dat laag scoort "
               f"({_score_str(factor_score)}) is dat verschil van inzicht zelf het "
               f"gesprek. Wat die andere groep vraagt: "
               f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    else:
        head = DIRECTION_HEAD_DIVIDED
        src = f"De {n} {DIR_N_DIE_WIE} kozen verschillend."

    table = ""
    if st["state"] != "too_few":
        row_htmls = []
        for k, c in st["ranked"]:
            # Vaste tellingsvorm (B14): dezelfde "X van de Y (P%)" als de
            # bronregel erboven en de verdiepingstabel, in plaats van "70% (7)"
            # naast een kaal aantal onder de staffel.
            row_htmls.append(f'<tr><td class="iq">{_h(_opt(k))}</td>'
                             f'<td class="is">{_telling(c, n)}</td></tr>')
        rows = "".join(row_htmls)
        table = f'<table class="item-tbl dir-tbl">{rows}</table>'
        if n <= DIRECTION_CAVEAT_MAX_N:
            table += _beperkte_basis_note()
        # B13, zelfde blok als onder de verdiepingsverdeling, en net als daar na
        # de beperkte-basis-regel (die hoort bij de verdeling). Bewust binnen
        # deze tak: in de staat too_few toont de kaart geen enkele telling, en
        # daar hoort ook geen aantal "Anders" bij te komen.
        table += _anders_block(
            other_n=sum(c for k, c in st["ranked"] if k.endswith("_other")),
            answered=n, texts=agg.get("other_texts") or [])
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
    # H19: de kaarten tonen twee onderwerpen, maar iedereen kreeg de vraag. Zonder
    # deze regel verdwenen de antwoorden van wie een ander onderwerp als laagste
    # had spoorloos. De aparte totals_html-regel is bewust: een geneste f-string
    # met aanhalingstekens in de expressie is geen Python 3.11.
    agenda_keys = [r["key"] for r in ranked if r["agenda_role"] in ("startpunt", "tweede")]
    totals = _direction_totals_line(direction_agg, agenda_keys, scan_type, n_total)
    totals_html = f'<p class="dir-chain dir-totals">{_h(totals)}</p>' if totals else ""
    return (f'<div class="dir-block"><span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'
            f'<p class="dir-intro">{DIRECTION_BLOCK_INTRO}</p>'
            f'{totals_html}'
            f'<table class="dir-grid"><tr>{cards}</tr></table></div>')


def _direction_degraded_line(direction_agg: dict, n_total: int) -> str:
    """Eerlijke totalen over alle factoren samen: aangeboden, beantwoord,
    overgeslagen. Elke respondent krijgt precies één richtingvraag, dus de som
    over de factoren is het aantal respondenten.

    Enkelvoud/meervoud per telling en het weglaten van nul-clausules volgen
    _direction_chain: "0 sloegen over" is altijd fout Nederlands.

    De drie sommen komen uit _direction_totals, dezelfde bron als de totaalregel
    op de gespreksagenda; twee kopieën van die optelling konden stil uiteen
    lopen. De wording verschilt wel: hier ontbreekt de agenda, dus is er geen
    startpunt om de tellingen aan te hangen.
    """
    offered, answered, skipped = _direction_totals(direction_agg)
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
    # Dezelfde tellingsvorm (_telling) en hetzelfde noemerlabel (DIR_N_DIE_WIE)
    # als de kaart op de gespreksagenda: n is het aantal beantwoorders, niet
    # iedereen bij wie dit het laagst scoorde, en die twee lopen uiteen zodra
    # iemand overslaat (codereview taak 10). "Wat er moet gebeuren volgens ..."
    # in plaats van "Wat er volgens ... moet gebeuren": met de bijzin erin stond
    # het werkwoord anders twaalf woorden van zijn onderwerp.
    if st["state"] == "clear":
        return (f"Wat er moet gebeuren volgens {_telling(st['top_n'], n)} "
                f"{DIR_N_DIE_WIE}: "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    if st["state"] == "plurality":
        # Geen haakje om een telling die zelf een percentage tussen haakjes
        # draagt: "(27 van de 62 (44%) die dit ..., zonder meerderheid)" zette
        # twee haakjesniveaus in elkaar (taalronde, taak 13). Zelfde vorm als de
        # clear-tak, met de nuance als bijstelling tussen komma's.
        return (f"Wat er moet gebeuren volgens de grootste groep, "
                f"{_telling(st['top_n'], n)} {DIR_N_DIE_WIE}, zonder meerderheid: "
                f"{direction_imperative(scan_type, factor_key, st['top_key'])}")
    if st["state"] == "split_none":
        texts = direction_option_texts(scan_type, factor_key)
        # Met noemer, zoals de drie andere takken: twee kale tellingen naast
        # elkaar lezen bij 10 en 4 uit 25 als een groep van 14.
        return (f"Wat er moet gebeuren: de {n} {DIR_N_DIE_WIE} zijn "
                f"hierover verdeeld. {_tel(st['none_n'], 'zegt', 'zeggen')} dat "
                f"hier niets hoeft, {_tel(st['top_n'], 'vraagt', 'vragen')} om "
                f"‘{texts[st['top_key']]}’.")
    if st["state"] == "divided":
        return (f"Over wat hier moet gebeuren zijn de {n} {DIR_N_DIE_WIE} "
                "verdeeld. Zie de gespreksagenda.")
    if st["state"] == "none_needed":
        return (f"{_telling(st['top_n'], n)} {DIR_N_DIE_WIE} zeggen: "
                "hier hoeft niets.")
    return ""


# B13: vanaf dit aandeel "Anders" zegt het rapport dat de optieset de
# werkelijkheid niet dekt en toont het de vrije teksten (staffel MIN_QUOTES_N,
# dezelfde als de open toelichtingen). Één op vijf is de grens waarop een
# restcategorie geen rest meer is maar een eigen antwoord.
OTHER_SHARE_MIN = 0.20

# Absolute vloer naast dat aandeel: op de minimumbasis van dit rapport haalt
# één respondent het aandeel al (1 van de 3 is 33%), en van één mens is geen
# conclusie te trekken over de optieset. Twee is de kleinste groep die "de
# opties dekken dit niet" kan dragen. Bewust een eigen getal en niet
# MIN_QUOTES_N: die staffel bepaalt of de teksten zichtbaar worden, deze of er
# een blok staat.
OTHER_MIN_N = 2

# Eén bron voor de zin waarmee het Anders-blok zijn tekststaffel uitlegt. De
# drempeltabel op de methodiekpagina (_drempeltabel, taak 11) noemt dezelfde
# drempel met dezelfde woorden; twee kopieën van deze zin kunnen stil uiteen
# lopen, en dan legt de tabel iets anders uit dan het blok doet.
ANDERS_TEKST_DREMPEL = (
    f"De teksten tonen we pas vanaf {MIN_QUOTES_N}, om herleidbaarheid te voorkomen")

# Precies wat backend.scoring.anonymize_text weghaalt (_PATTERNS: [NAAM],
# [EMAIL], [TELEFOON], [POSTCODE]); geen "locaties", want plaatsnamen blijven
# staan (eindreview plan 3a punt 2). Eén bron voor de labels onder de teksten
# én de methodiekcel; test_report_tellingen pint de koppeling aan _PATTERNS.
ANON_NOTE = ("Automatisch geanonimiseerd: herkende namen, e-mailadressen, telefoonnummers "
             "en postcodes verwijderd")


def _anders_block(*, other_n: int, answered: int, texts: list[str]) -> str:
    """"Anders"-toelichtingen onder een verdeling (spec par. 9 B13). Leeg onder
    OTHER_SHARE_MIN of OTHER_MIN_N; vanaf MIN_QUOTES_N de (geanonimiseerde)
    teksten, daaronder alleen het aantal, om herleidbaarheid te voorkomen.

    De staffel telt de teksten en niet de keuzes: bij de verdieping mag "Anders"
    zonder toelichting (schemas.py), dus vier teksten van zes keuzes blijven
    onzichtbaar. Dat is dezelfde ondergrens als _should_show_quotes hanteert voor
    de open toelichtingen, en om dezelfde reden: onder vijf teksten is een
    toelichting te makkelijk aan een persoon te koppelen.

    Schreef niemand iets, dan rendert het blok niet: er is dan niets te melden en
    het aantal "Anders" staat al in de verdelingstabel erboven. Schreef een deel
    van hen iets, dan zegt de kop dat (Fail Loud), en hetzelfde geldt voor de
    afkapping op MAX_QUOTES: niets valt stil weg.
    """
    if not answered or other_n < OTHER_MIN_N or other_n / answered < OTHER_SHARE_MIN:
        return ""
    schoon = [t for t in texts if t and t.strip()]
    if not schoon:
        return ""
    # "; 4 schreven een toelichting" miste het antecedent: vier van wie? De
    # deelzin hangt aan de groep die "Anders" koos, dus "van hen" (B14: elke
    # telling noemt zijn noemer, ook als die in de zin ervoor staat).
    geschreven = (" en schreven een eigen toelichting"
                  if len(schoon) >= other_n else
                  f"; {len(schoon)} van hen "
                  + _werkwoord(len(schoon), "schreef", "schreven") + " een toelichting")
    kop = (f'<p class="anders-kop">{other_n} van de {answered} '
           f'{_werkwoord(other_n, "koos", "kozen")} &lsquo;Anders&rsquo;{geschreven}: '
           f'de vaste opties dekten hun ervaring niet.</p>')
    if len(schoon) < MIN_QUOTES_N:
        return kop + f'<p class="anders-note">{ANDERS_TEKST_DREMPEL}.</p>'
    note = ""
    if len(schoon) > MAX_QUOTES:
        note = (f'<p class="anders-note">Getoond: de eerste {MAX_QUOTES} van '
                f'{len(schoon)} in ontvangstvolgorde, geen inhoudelijke selectie.</p>')
    items = "".join(f'<li>{_h(t)}</li>' for t in schoon[:MAX_QUOTES])
    # Hetzelfde label als onder de open toelichtingen (_themed_quotes), hier
    # één keer onder de lijst in plaats van per regel.
    return (kop + note + f'<ul class="anders-list">{items}</ul>'
            f'<p class="anders-anon">{ANON_NOTE}</p>')


def _komma(x: float) -> str:
    """2.5 -> "2,5" voor een getal in lopende Nederlandse tekst."""
    return f"{x:g}".replace(".", ",") if x != int(x) else f"{int(x)},0"


def _trigger_regel() -> str:
    """De triggerregel van de verdiepende vraag in gewone taal (eindreview plan
    3a punt 1). De keten telde "wie hier laag scoorde" terwijl de spreiding
    erboven "onder de 5" als kwetsbaar telt; in stresstest 08 stond "Kwetsbaar
    7" boven "(3 = wie hier laag scoorde)". Het zijn twee regels: de
    vervolgvraag volgt uit de ruwe antwoorden (schaal 1 tot 5) op de stellingen
    van dat onderwerp, niet uit de score op tien. Iemand met 3, 3 en 2 zit
    onder de 5 zonder vervolgvraag; iemand met 2, 2 en 5 krijgt hem boven de 5.
    Daarom "duidelijk laag" met de regel erbij, en de getallen uit de
    constanten die _is_triggered echt gebruikt."""
    cnt = _TELWOORD.get(TRIGGER_LOW_ITEM_COUNT, str(TRIGGER_LOW_ITEM_COUNT))
    return (f"Duidelijk laag betekent hier: op de antwoordschaal van 1 tot 5 gemiddeld "
            f"{_komma(TRIGGER_AVG_MAX)} of lager, minstens {cnt} stellingen op "
            f"{TRIGGER_LOW_ITEM_MAX} of lager, of een 1 bij een gemiddelde van "
            f"{_komma(TRIGGER_WITH_ONE_AVG_MAX)} of lager. Dat is een andere regel dan "
            f"‘onder de 5’ (kwetsbaar) in de spreiding, dus de aantallen kunnen verschillen.")


def _deepening_chain(agg: dict, scan_type: str, factor_key: str, n_total: int) -> str:
    """Noemer-keten in de vaste tellingsvorm (B14, H2), zonder "verdieptrigger"
    (H14): laag gescoord -> aangeboden -> beantwoord/overgeslagen, elke stap met
    zijn eigen noemer en met het aantal respondenten als begin.

    Enkelvoud/meervoud per telling, geen nul-clausules, en geen stap die stil
    wegvalt: kreeg niemand de vraag (elke respondent zat al aan het maximum),
    dan staat dat er met woorden in plaats van als "0 van de 0".

    Het maximum komt uit DEEPENING_CAP en staat niet als los getal in de copy:
    anders kan de klantzin stil afwijken van de vragenlijst.
    """
    triggered, offered = agg["triggered"], agg["offered"]
    answered, skipped = agg["answered"], agg["skipped"]
    lbl = _lc(_fl(factor_key, scan_type))
    parts: list[str] = []
    if answered:
        # Zie _direction_chain: bij één aangeboden verdieping is "1 van de 1" de
        # vorm zonder inhoud.
        parts.append("die ene beantwoordde hem" if offered == 1 else
                     f"{answered} van de {offered} "
                     + _werkwoord(answered, "beantwoordde die", "beantwoordden die"))
    if skipped:
        parts.append(f"{skipped} " + _werkwoord(skipped, "sloeg over", "sloegen over"))
    staart = (("; " + ", ".join(parts)) if parts else "")
    if offered:
        staart += _statusrest(offered, answered, skipped)
    staart += ". " + _trigger_regel()
    if offered > triggered:
        # Historische data: de triggerregels of de optieset zijn na deze meting
        # veranderd (aggregate_deepening tolereert dat bewust). De keten mag dan
        # niet zeggen dat triggered de vraag kreeg; dat getal is kleiner dan het
        # aantal dat hem echt kreeg.
        return (f"{offered} van de {_respondenten(n_total)} "
                + _werkwoord(offered, "kreeg", "kregen")
                # Niet "van hen": triggered is over alle respondenten geteld, niet
                # over de groep die de vraag kreeg.
                + f" de verdiepende vraag over {lbl} ({offered} = wie de vraag kreeg; "
                + f"met de regel van nu antwoorden {triggered} respondenten hier duidelijk laag)"
                + staart)
    if offered < triggered:
        cap = DEEPENING_CAP[scan_type]
        cap_woord = _TELWOORD.get(cap, str(cap))
        opener = (f"{triggered} van de {_respondenten(n_total)} "
                  + _werkwoord(triggered, "antwoordde", "antwoordden") + " hier duidelijk laag; ")
        if not offered:
            return (f"{opener}niemand kreeg de verdiepende vraag (zij zaten allemaal al "
                    f"aan het maximum van {cap_woord} verdiepingen){staart}")
        rest = triggered - offered
        return (f"{opener}{offered} van de {triggered} "
                + _werkwoord(offered, "kreeg", "kregen")
                + f" de verdiepende vraag (de andere {rest} "
                + _werkwoord(rest, "zat", "zaten")
                + f" al aan het maximum van {cap_woord} verdiepingen){staart}")
    return (f"{triggered} van de {_respondenten(n_total)} "
            + _werkwoord(triggered, "kreeg", "kregen")
            + f" de verdiepende vraag over {lbl} "
            + f"({triggered} = wie hier duidelijk laag antwoordde){staart}")


# Vanaf hoeveel beantwoorde verdiepingsvragen toont een onderwerp de verdeling
# van gekozen toelichtingen? Deze staffel stond als kale 5 in
# _deepening_shows_distribution en levert de meest getoonde onderdrukking van het
# rapport ("Te weinig verdiepingsantwoorden om een verdeling te tonen", in acht
# van de 21 stresstestrenders), terwijl hij in geen enkele uitleg stond
# (codereview taak 11). Nu een benoemde constante, zodat de drempeltabel hem kan
# noemen zonder het getal te herhalen. Geen nieuwe drempel en geen andere waarde:
# dezelfde 5 als voorheen. Los van MIN_QUOTES_N, dat over geschreven teksten gaat
# en om een andere reden op 5 staat (herleidbaarheid, niet stabiliteit).
DEEPENING_DISTRIBUTION_MIN_N = 5


def _deepening_shows_distribution(agg: dict | None) -> bool:
    """Toont `_deepening_block` voor dit onderwerp echt een verdeling?

    Eén bron voor die staffel (codereview taak 5): de leidraad op pagina twee
    beloofde "wat mensen als toelichting kozen" zodra de meting verdiepingsdata
    had, terwijl de pagina bij minder dan vijf antwoorden alleen zegt dat het er
    te weinig zijn. Geen nieuwe drempel: dit is de staffel die hieronder al
    gold, sinds taak 11 met een naam (DEEPENING_DISTRIBUTION_MIN_N).
    """
    return bool(agg and agg.get("triggered")
                and agg.get("answered", 0) >= DEEPENING_DISTRIBUTION_MIN_N)


def _deepening_block(agg: dict, scan_type: str, factor_key: str, n_total: int) -> str:
    """Toelichtingsblok onder een factor (spec 6.1 + 6.2), gestaffeld op n=answered.

    n_total is het aantal respondenten en is verplicht: de keten begint ermee
    (B14), en zonder dat getal staan de tellingen van dit blok los van de rest
    van het rapport (H2)."""
    if not agg.get("triggered"):
        return ""
    answered = agg.get("answered", 0)
    opt_text = _deepening_option_texts(scan_type, factor_key)
    chain = _deepening_chain(agg, scan_type, factor_key, n_total)

    if not _deepening_shows_distribution(agg):
        # De verwijzing hoort hier (codereview taak 11): dit is de meest getoonde
        # onderdrukking van het rapport, en de drempel erachter staat in de tabel.
        body = ('<p style="font-size:9px;color:#64748B;margin:6px 0 0;">'
                'Te weinig verdiepingsantwoorden om een verdeling te tonen '
                f'(drempels: pagina {_pref(LEIDRAAD_ANKERS["drempels"])}). '
                'Bespreek dit onderwerp in het MT.</p>')
    else:
        ranked = sorted((agg.get("primary_counts") or {}).items(),
                        key=lambda kv: (-kv[1], kv[0]))
        # Vaste tellingsvorm (B14), dezelfde als de richtingtabel en de
        # bronregels: "8 van de 12 (67%)" in plaats van "67% (8)" naast een kaal
        # aantal onder de staffel. De staffel zelf zit in _telling.
        rows = "".join(
            f'<tr><td class="iq">{_h(opt_text.get(key, key))}</td>'
            f'<td class="is" style="color:#0D1B2A;">{_telling(cnt, answered)}</td></tr>'
            for key, cnt in ranked)
        body = f'<table class="item-tbl" style="margin-top:6px;">{rows}</table>'
        if answered < MIN_AGGREGATE_N:
            body += _beperkte_basis_note()
        # B13: haalt "Anders" een vijfde van de antwoorden, dan dekt de optieset
        # de werkelijkheid niet en zijn de eigen woorden het antwoord. Na de
        # beperkte-basis-regel: die hoort bij de verdeling erboven, niet bij de
        # toelichtingen.
        body += _anders_block(
            other_n=sum(c for k, c in (agg.get("primary_counts") or {}).items()
                        if k.endswith("_other")),
            answered=answered, texts=agg.get("other_texts") or [])

    # De "Daarnaast werden vooral X en Y genoemd"-samenvatting is bewust weg
    # (feedback 2026-07-16): de regel dupliceerde de tabel met aantallen die
    # er direct boven staat. secondary_counts blijft in de aggregatie bestaan.
    return (f'<div class="card"><span class="eyebrow">Welke toelichting respondenten kozen</span>'
            f'<p style="font-size:10px;margin:4px 0 0;">{_h(chain)}</p>'
            f'{body}</div>')


def _gespreksopener(deep_agg: dict, scan_type: str, factor_key: str) -> str:
    """De ene gespreksopener van dit rapport (H9): op pagina twee en op de
    gespreksagenda dezelfde zin. Datagedreven zodra de verdieping een gedeelde
    toelichting heeft (_deepening_mgmt_q), anders de vaste vraag per onderwerp."""
    return _deepening_mgmt_q(deep_agg, scan_type, factor_key) or _mgmt_q(factor_key, scan_type)


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
    "De rangorde tussen de eigen onderwerpen weegt zwaarder dan de absolute kleur. "
)
_BANDEN_GEEN_RANGORDE = (
    "In dit rapport staat nog geen rangorde tussen de eigen onderwerpen: daarvoor "
    "zijn er geen scores per onderwerp berekend. "
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


def _drempeltabel(scan_type: str, *, direction_active: bool = True,
                  direction_degraded: bool = False,
                  deepening_active: bool = True, ranking_active: bool = True) -> str:
    """Eén drempeltabel voor het hele rapport (B20, H18): elke drempel met de
    plek waar hij werkt en één zin waarom.

    De getallen komen uit de constanten die ze ook echt sturen, zodat deze uitleg
    niet kan gaan liegen zodra een gate verschuift. De inline verwijzingen in het
    rapport (ranglijst, afdelingen, beperkte-basis-regels, de melding bij een te
    kleine verdiepingsverdeling, leidraad) noemen deze tabel met een paginanummer
    via LEIDRAAD_ANKERS["drempels"].

    Elke rij hangt aan de sectie waarin zijn drempel werkt; een drempel die in
    dit rapport nergens iets doet hoort hier niet te staan (codereview taak 11:
    in een meting waarin niemand een verdieping triggerde stonden de
    verdiepingsrijen er toch). Loep Start kent geen verdieping en geen
    richtingvraag (niet in DIRECTION_SCAN_TYPES); `deepening_active` is dezelfde
    vlag als de uitlegregel onder de ranglijst gebruikt (`bool(deep_agg)`) en
    `direction_active` zegt of DEZE meting de richtingvraag stelde. Het
    Anders-blok hangt aan beide: het staat onder de verdiepingsverdeling én onder
    een richtingkaart, dus de drempel werkt ook in een meting zonder
    verdiepingsdata maar met richtingantwoorden.

    De verdiepingsrijen hangen ook aan `ranking_active`: zonder factorprofiel
    (stresstest 07) rendert er geen ranglijst en geen verdiepingsblok, en dan
    beloofde de rij van DEEPENING_MIN_N nog "de kolom Verdieping in de ranglijst"
    en de rij van de verdeelstaffel een verdeling die nergens staat. Het Anders-
    blok volgt diezelfde verdiepingsvlag (het staat onder de verdiepings-
    verdeling) naast de richtingvraag. `direction_degraded` is daar nog een
    niveau fijner (review ronde 2): in de degraded richtingstaat rendert
    _direction_degraded_block alleen tellingen en geen kaarten, dus staat er ook
    geen Anders-blok onder een richtingkaart en werkt die drempel daar niet.

    Drie rijen kunnen hetzelfde getal dragen (MIN_SEGMENT_N, MIN_QUOTES_N en
    DEEPENING_DISTRIBUTION_MIN_N staan alle drie op 5): ze worden bewust niet
    samengevoegd, want het zijn losse constanten die uiteen kunnen lopen, en ze
    gelden op een andere plek en om een andere reden. De sortering is daarom op
    het getal alleen, zodat de invoegvolgorde bij gelijke getallen blijft staan.
    """
    pct = round(OTHER_SHARE_MIN * 100)
    # Het verdiepingsblok hangt aan de ranglijst: priority_fkeys komt uit de
    # rasterrijen, dus zonder profiel wordt geen enkele verdieping gerenderd.
    verdieping_actief = deepening_active and ranking_active
    # Het Anders-blok staat onder de verdiepingsverdeling EN onder een
    # richtingkaart; in de degraded richtingstaat zijn er geen kaarten, dus
    # levert de richtingvraag daar geen Anders-blok op.
    richting_kaarten = direction_active and not direction_degraded
    anders_actief = scan_type in DIRECTION_SCAN_TYPES and (verdieping_actief or richting_kaarten)
    # De twee tien-rijen lezen elk de constante die hun gate echt stuurt
    # (eindreview plan 3a punt 3): het profiel draait op MIN_AGGREGATE_N,
    # spreiding, afdelingsscores en een afdeling als startpunt op
    # MIN_DISTRIBUTION_N. Nu allebei 10, maar het zijn losse constanten; één
    # rij met één van beide kon stil gaan afwijken. "tien" alleen lokaal:
    # _TELWOORD stopt bewust bij zes (boven zes staat het cijfer).
    def _tw(n: int) -> str:
        return {10: "tien"}.get(n, _TELWOORD.get(n, str(n)))

    rijen: list[tuple[int, str, str]] = [
        (MIN_AGGREGATE_N, "profiel per onderwerp",
         f"Onder de {_tw(MIN_AGGREGATE_N)} antwoorden bepaalt één persoon te veel het "
         "gemiddelde."),
        (MIN_DISTRIBUTION_N,
         "spreiding, scores per onderwerp per afdeling, en een afdeling als startpunt",
         f"Onder de {_tw(MIN_DISTRIBUTION_N)} is een spreidingsbeeld geen beeld maar een "
         "handvol stippen, en weegt één persoon te zwaar in de score van een afdeling."),
        (MIN_SEGMENT_N, "een afdeling apart in de tabel",
         "Onder de vijf zijn antwoorden herleidbaar tot personen, ook zonder naam."),
        (MIN_QUOTES_N,
         "de open toelichtingen" + (" en de teksten bij ‘Anders’" if anders_actief else ""),
         ANDERS_TEKST_DREMPEL + ": een geschreven antwoord is makkelijker aan een "
         "persoon te koppelen dan een cijfer."),
    ]
    if anders_actief:
        rijen.append(
            (OTHER_MIN_N, "het blok met de toelichtingen bij ‘Anders’",
             f"Dat blok verschijnt zodra ‘Anders’ minstens {pct}% van de antwoorden haalt "
             f"en minstens {OTHER_MIN_N} mensen het kozen: op de kleinste basis van dit "
             "rapport haalt één mens dat aandeel al, en van één mens is geen conclusie "
             "over de vraagopties te trekken. Schreef niemand van hen een toelichting, "
             "dan blijft het blok weg: het aantal staat dan al in de verdeling erboven."))
    if scan_type in DIRECTION_SCAN_TYPES and verdieping_actief:
        rijen.append(
            (DEEPENING_DISTRIBUTION_MIN_N, "de verdeling van toelichtingen onder een onderwerp",
             "Onder de vijf antwoorden zegt een verdeling meer over wie er toevallig "
             "antwoordde dan over het onderwerp; dan staat er alleen hoeveel mensen de "
             "vraag kregen en beantwoordden."))
        rijen.append(
            (DEEPENING_MIN_N,
             "de kolom Verdieping in de ranglijst en een gedeelde toelichting uit de "
             "verdieping op de agenda",
             "Onder de acht kan ‘geen duidelijke meerderheid’ toevallig zijn; vanaf acht "
             "telt een voorsprong van twee als signaal."))
    if scan_type in DIRECTION_SCAN_TYPES and direction_active:
        rijen.append(
            (DIRECTION_MIN_N, "de richtingvraag per onderwerp",
             f"Lager dan de {_TELWOORD.get(MIN_SEGMENT_N, MIN_SEGMENT_N)} voor "
             "afdelingen, omdat niemand in de organisatie kan zien wie een onderwerp "
             f"als laagste had; bij {_TELWOORD.get(DIRECTION_MIN_N, DIRECTION_MIN_N)} of "
             f"{_TELWOORD.get(DIRECTION_CAVEAT_MAX_N, DIRECTION_CAVEAT_MAX_N)} antwoorden "
             "staat er een beperkte-basis-regel bij."))
    rijen.sort(key=lambda rij: rij[0])
    trs = "".join(f'<tr><td class="is" style="width:8%;text-align:left;">{n}</td>'
                  f'<td class="iq" style="width:38%;">{_h(waar)}</td><td>{_h(waarom)}</td></tr>'
                  for n, waar, waarom in rijen)
    return (f'<div class="card" id="{LEIDRAAD_ANKERS["drempels"]}" style="margin-top:10px;">'
            f'<h3>Drempels in dit rapport</h3>'
            f'<p style="font-size:10px;color:#374151;">Loep toont pas iets vanaf een '
            f'minimumaantal antwoorden. Dit zijn de drempels, waar ze werken en waarom.</p>'
            f'<table class="item-tbl"><thead><tr><th style="width:8%">Vanaf</th>'
            f'<th style="width:38%">Waar het geldt</th><th>Waarom</th></tr></thead>'
            f'<tbody>{trs}</tbody></table></div>')


def _trust_page(scan_type: str = "exit", opener_html: str = "",
                direction_active: bool = False,
                direction_degraded: bool = False,
                ranking_active: bool = True,
                deepening_active: bool = False,
                org_name: str = "") -> str:
    """Product-specifieke methodiekpagina — nooit gedeelde ExitScan-copy buiten ExitScan.

    Draagt de drempeltabel (_drempeltabel, B20/H18): de losse cel Drempelwaarden
    ("5+ responses indicatief · 10+ voor patroonduiding · ...") is daarin
    opgegaan. Die cel noemde vier getallen zonder uitleg en in jargon, en stond
    alleen op de pagina van Vertrek en Behoud; de tabel staat op alle drie en legt
    elke drempel uit op de plek waar het rapport naar verwijst.

    direction_active volgt het patroon van _prioriteringsraster's
    deepening_active: de Richtingvraag-rij mag alleen beloven wat dit
    specifieke rapport ook echt bevat. scan_type in DIRECTION_SCAN_TYPES
    zegt alleen dat het PRODUCT de vraag ooit kan stellen; de campagnegate
    in build_report_data kan direction_agg voor DEZE meting alsnog leeg
    maken (niemand aangeboden). Beide moeten dus waar zijn.

    deepening_active volgt dezelfde gedachte voor de verdiepingsrijen van die
    tabel en komt uit exact dezelfde waarde als de uitlegregel onder de ranglijst
    (`bool(deep_agg)`): triggerde niemand een verdieping, dan werkt geen van die
    drempels in dit rapport en hoort er ook geen rij over te staan.

    direction_degraded is dezelfde gate één niveau fijner (review ronde 2):
    zonder factorprofiel rendert _wat_moet_gebeuren_block alleen tellingen,
    geen kaarten. De volle cel beloofde daar nog een opdrachtvorm, een
    richting vanaf 3 antwoorden en een beperkte-basis-regel -- drie dingen die
    in dat blok niet voorkomen. Zie _direction_degraded_block.

    ranking_active is dezelfde gedachte voor de cel "Hoe de banden werken":
    zonder factorprofiel is er geen rangorde tussen factoren om naar te
    verwijzen. Zie _banden_cel. Diezelfde vlag hangt de verdiepingsrijen van de
    drempeltabel aan hun sectie: zonder rangorde rendert er geen verdiepingsblok
    en geen kolom Verdieping, dus werken die twee drempels in dit rapport niet
    (restpunt uit de review van taak 11, zichtbaar in stresstest 07).

    org_name draagt de verspreidingsregel (H15): dezelfde zin als op de cover,
    zodat de laatste pagina ook zegt voor wie dit rapport bedoeld is. Zonder naam
    "de organisatie", nooit een lege plek."""
    # De cel "Wie dit mag zien" opent met het antwoord op die vraag en sluit met
    # de AVG-regel (taalronde, taak 13): de titel vraagt wie het mag zien en het
    # eerste dat er stond was "Verwerking conform AVG".
    def _wie_mag_zien() -> tuple[str, str]:
        return ("Wie dit mag zien", f"{_verspreidingsregel(org_name)} Verwerking conform AVG.")

    if scan_type == "retention":
        intro = ("Dit rapport bundelt patronen uit de antwoorden van huidige medewerkers tot een "
                 "groepsbeeld van behoud, vertrekdenken en de onderwerpen over het werk. Geen "
                 "individuele risicoscore, geen voorspelling en geen diagnose.")
        cells_r1 = [
            ("Groepsniveau",     "Alle scores zijn groepsgemiddelden van de huidige medewerkers. Geen individuele gegevens."),
            ("Geen voorspelling","Scores geven een huidig signaal, geen voorspellingen over vertrek en geen individuele risicobeoordeling."),
        ]
        cells_r2 = [
            ("Open toelichtingen", f"{ANON_NOTE}. Alleen getoond vanaf {MIN_QUOTES_N} toelichtingen."),
            ("Wat dit rapport niet doet",
             "Loep Behoud is een groepsbeeld van de huidige medewerkers. Loep stelt zelf geen oorzaken "
             "vast: de redenen in dit rapport komen van je mensen. Geen kant-en-klaar actieplan: "
             "wat er gebeurt, beslist het MT."),
            _wie_mag_zien(),
        ]
        cells_r3 = [_banden_cel(ranking_active)]
    elif scan_type == "onboarding":
        intro = ("Dit rapport bundelt patronen uit de checkpoints van nieuwe medewerkers tot een "
                 "groepsbeeld van de eerste werkperiode. Geen prestatiebeoordeling, geen individuele "
                 "beoordeling en geen voorspelling van uitval.")
        cells_r1 = [
            ("Groepsniveau",       "Alle scores zijn groepsgemiddelden van de instroomgroep. Geen individuele gegevens."),
            ("Eén meetmoment",     "Dit is een enkel meetmoment (30/60/90). Een volgende meting bespreken we los van dit rapport."),
            ("Geen beoordeling",   "Scores duiden de ervaring van nieuwe medewerkers op groepsniveau. Geen prestatiebeoordeling van individuen of managers."),
        ]
        cells_r2 = [
            ("Open toelichtingen", f"{ANON_NOTE}. Alleen getoond vanaf {MIN_QUOTES_N} toelichtingen."),
            ("Wat dit rapport niet doet",
             "Loep Start is een groepsbeeld van de eerste werkperiode. Loep stelt zelf geen oorzaken "
             "vast en voorspelt geen uitval. Geen kant-en-klaar actieplan: wat er gebeurt, "
             "beslist het MT."),
            _wie_mag_zien(),
        ]
        cells_r3 = [_banden_cel(ranking_active)]
    else:  # exit
        intro = ("Dit rapport bundelt patronen uit de vragenlijsten van vertrekkers tot een groepsbeeld "
                 "van vertrek. Geen diagnose, geen individuele beoordeling, geen uitspraak over oorzaken "
                 "en geen voorspelling.")
        cells_r1 = [
            ("Groepsniveau",    "Alle scores zijn groepsgemiddelden. Geen individuele gegevens in dit rapport."),
            ("Geen diagnose",   "Scores zijn methodisch verantwoord maar niet extern gevalideerd. Altijd combineren met het gesprek in het MT."),
        ]
        cells_r2 = [
            ("Open toelichtingen", f"{ANON_NOTE}. Alleen getoond vanaf {MIN_QUOTES_N} toelichtingen."),
            ("Wat dit rapport niet doet",
             "Loep Vertrek is een terugkijkende groepsmeting op vertrek. Loep stelt zelf geen oorzaken "
             "vast: de redenen in dit rapport komen van je mensen. Geen oordeel over "
             "vermijdbaarheid en geen voorspellingen over vertrek. Geen kant-en-klaar "
             "actieplan: wat er gebeurt, beslist het MT."),
            _wie_mag_zien(),
        ]
        cells_r3 = [_banden_cel(ranking_active)]

    cells_r4: list[tuple[str, str] | tuple[str, str, str]] = []
    if scan_type in DIRECTION_SCAN_TYPES and direction_active and direction_degraded:
        cells_r4 = [
            ("Richtingvraag",
             "Elke respondent kreeg één vraag over het onderwerp dat bij die respondent het laagst "
             "scoorde: wat zou hier het meest helpen? In dit rapport hangt er geen richting aan die "
             "antwoorden: zonder profiel per onderwerp is er geen startpunt om ze aan te koppelen, en "
             "per onderwerp zijn het er te weinig om te tonen. Het blok ‘Wat er moet gebeuren’ toont "
             "daarom alleen hoeveel respondenten de vraag kregen, beantwoordden en oversloegen."),
        ]
    elif scan_type in DIRECTION_SCAN_TYPES and direction_active:
        cells_r4 = [
            ("Richtingvraag",
             "Elke respondent kreeg één vraag over het onderwerp dat bij die respondent het laagst "
             "scoorde: wat zou hier het meest helpen? De opdrachtvorm in ‘Wat er moet gebeuren’ "
             f"geeft de keuze van die respondenten weer, geen advies van Loep. De drempel van "
             f"{DIRECTION_MIN_N} staat in de drempeltabel op pagina",
             # Derde element: HTML die NIET door _h() gaat. "in de drempeltabel
             # hierboven" was een positieclaim die al breekt zodra de
             # methodieksectie over twee pagina's loopt, met de tabel op de eerste
             # en deze cel op de tweede (codereview taak 11). Een paginanummer
             # kan niet in de geescapete celtekst zelf: _pref levert een anker en
             # _h() zou dat letterlijk afdrukken. Daarom deze staart, die alleen
             # hier wordt gebouwd en verder niets anders kan bevatten.
             f' {_pref(LEIDRAAD_ANKERS["drempels"])}.'),
        ]

    def _cells(pairs: list[tuple[str, ...]], full: bool = False) -> str:
        """Cellen van de methodiekpagina. Titel en tekst gaan door _h(); een
        eventueel derde element is al HTML en wordt achter de tekst gezet (zie de
        toelichting bij de Richtingvraag-cel)."""
        cls = "tc-full" if full else "tc"
        return "".join(
            f'<td class="{cls}"><div class="tt">{_h(pair[0])}</div>'
            f'<div class="tb">{_h(pair[1])}{pair[2] if len(pair) > 2 else ""}</div></td>'
            for pair in pairs)

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Methodiek, privacy &amp; interpretatiegrenzen</span>'}
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;">{_h(intro)}</p>
  </div>
  <table class="tg"><tr>{_cells(cells_r1)}</tr></table>
  {_drempeltabel(scan_type, direction_active=direction_active, direction_degraded=direction_degraded, deepening_active=deepening_active, ranking_active=ranking_active)}
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r2)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r3, full=True)}</tr></table>
  {f'<table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r4, full=True)}</tr></table>' if cells_r4 else ''}
</div>"""


# Vijfde plek met dezelfde belofte (spec ronde 2 par. 7): dit blok staat ook in
# het Loep Start-rapport, dat geen verdieping heeft die kan openen. Exit en
# retention houden hun eigen zin.
SEGMENT_VERVOLG = "De tabel per afdeling verschijnt zodra er per afdeling genoeg antwoorden zijn."
SEGMENT_VERVOLG_ONBOARDING = (
    "De tabel per afdeling verschijnt zodra er per afdeling genoeg antwoorden zijn.")


def _segment_status_block(n: int, has_segment_data: bool = False,
                           reason: str = "n-grens", opener_html: str = "",
                           scan_type: str = "exit") -> str:
    """Segmentstatus — altijd zichtbaar, ook als segmenten niet worden getoond."""
    if has_segment_data:
        return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Per afdeling</span>'}
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
        # no-break: de kop blijft bij de melding. Zonder die regel stond "06 Per
        # afdeling" als laatste regel onder de werkbeleving en de melding
        # alleen op het volgende vel (fixronde na plan 3a). seg-leeg houdt het
        # blok compact genoeg om na een volle werkbelevingspagina te passen.
        return f"""<div class="sec no-break seg-status">
  {opener_html or '<span class="slabel">Per afdeling</span>'}
  <div class="empty-state seg-leeg">
    <p style="margin-bottom:2px;">Verschillen tussen afdelingen zijn niet getoond om herleidbaarheid te voorkomen.</p>
    <p style="margin-bottom:0;">{_h(SEGMENT_VERVOLG_ONBOARDING if scan_type == "onboarding" else SEGMENT_VERVOLG)}</p>
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
            return (f'<span style="{_SEG_MONO}">{_tel(omitted, "onderwerp", "onderwerpen")} '
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
        cell += (f'<br><span style="{_SEG_MONO}">{_tel(omitted, "onderwerp", "onderwerpen")} '
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
    subs: list[str] = []
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
                      f'{_tel(info["omitted"], "onderwerp", "onderwerpen")} niet beoordeelbaar: '
                      f'te weinig antwoorden</div>')
        subs.append(f'<div class="no-break" style="margin-top:10px;">'
                 f'<div style="font-family:\'Inter Tight\', sans-serif;font-weight:700;'
                 f'font-size:11px;margin-bottom:4px;">{_h(row["department"])} (n={row["n"]})</div>'
                 f'<table class="item-tbl seg-tbl">{frows}</table>{omline}</div>')
    if not subs:
        return ""
    intro = ('<p style="font-size:10px;color:#64748B;margin:10px 0 0;">'
             'Alle onderwerpen per afdeling: dezelfde vaste drempels als in het '
             'overzichtsprofiel (kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, '
             'relatief sterk vanaf 6,5).</p>')
    # De uitlegregel blijft bij het eerste subblok: los onderaan een pagina
    # beschrijft ze een uitsplitsing die pas op het volgende vel begint.
    if len(subs) == 1:
        return f'<div class="no-break">{intro}{subs[0]}</div>'
    # Twee of meer afdelingen: twee subblokken naast elkaar. Elk subblok is een
    # smalle tabel (onderwerp, score, band); onder elkaar werd de sectie bij
    # een grote populatie drie vellen met een staart van 17% (scenario 11,
    # fixronde na plan 3a). Elk paar in een eigen tbody, zodat een paar niet
    # over een pagina-einde breekt (zelfde patroon als tbody.seg-grp).
    paren = [subs[i:i + 2] for i in range(0, len(subs), 2)]
    groepen = []
    for i, paar in enumerate(paren):
        kop = f'<tr><td colspan="2">{intro}</td></tr>' if i == 0 else ""
        rechts = paar[1] if len(paar) > 1 else ""
        groepen.append(f'<tbody class="sub-grp">{kop}<tr><td>{paar[0]}</td>'
                       f'<td>{rechts}</td></tr></tbody>')
    return f'<table class="sub-cols">{"".join(groepen)}</table>'


def _pooled_lager(segment_rows: list[dict], low_sc: float | None) -> dict | None:
    """De gepoolde restgroep, als die onder de aangewezen afdeling uitkomt.

    Eén bron voor het navy blok en voor de brugzin: beide moeten precies in dit
    geval de claim "de laagste afdeling" kwalificeren, anders wordt die door de
    tabel eronder weerlegd.
    """
    pooled = next((r for r in segment_rows if r.get("is_pooled", False)), None)
    if pooled and low_sc is not None and _shown(pooled["avg"]) < low_sc:
        return pooled
    return None


def _segment_startpunt(segment_rows: list[dict],
                       factor_rows: dict[str, dict] | None) -> dict | None:
    """De aangewezen afdeling, of None.

    De enige gate voor staat 3 van `_segment_start_note` (verschil >=
    SEGMENT_START_MIN_DELTA met de volgende én n >= MIN_DISTRIBUTION_N), zodat
    de brugzin op pagina twee en het navy blok onder de tabel nooit uiteen
    kunnen lopen: dat blok leest deze functie ook (een tweede kopie van de
    gates zou stil kunnen afwijken).
    """
    named = sorted((r for r in segment_rows if not r.get("is_pooled", False)),
                   key=lambda r: (r["avg"], -r["n"], r["department"]))
    if len(named) < 2:
        return None
    lowest, runner_up = named[0], named[1]
    low_sc, run_sc = _shown(lowest["avg"]), _shown(runner_up["avg"])
    if round(run_sc - low_sc, 1) < SEGMENT_START_MIN_DELTA or lowest["n"] < MIN_DISTRIBUTION_N:
        return None
    info = (factor_rows or {}).get(lowest["department"]) or {}
    factors = info.get("factors") or []
    return {"department": lowest["department"], "score": low_sc, "n": lowest["n"],
            "invited": lowest.get("invited"),
            "low_fk": factors[0][0] if factors else None,
            "low_avg": factors[0][1] if factors else None,
            # Staat de restgroep lager, dan mag ook de brugzin niet kaal "de
            # laagste afdeling" zeggen (codereview taak 7, defect 1).
            "rest_lager": _pooled_lager(segment_rows, low_sc) is not None}


def _brugzin(startpunt_key: str | None, startpunt_label: str, seg: dict | None,
             scan_type: str) -> str:
    """De zin die organisatiebreed en per afdeling aan elkaar knoopt (spec par. 5).

    Bevinding B2: twee dingen heetten "startpunt". Het rapport heeft er één,
    organisatiebreed; wat een afdeling laag heeft is een tweede punt voor die
    afdeling. Deze zin zegt dat met zoveel woorden, op pagina twee en op de
    gespreksagenda.

    Drie varianten: ander onderwerp (bespreek dat voor die afdeling na het
    startpunt; niet "tweede punt", want zo heet op de gespreksagenda de kaart
    van de organisatie, eindreview plan 3a), hetzelfde
    onderwerp (daar begint het gesprek ook), of geen onderwerp bekend voor die
    afdeling (te weinig antwoorden per onderwerp). Zonder aangewezen afdeling
    geen zin: het navy blok geeft dan zelf de reden. Zonder organisatiebreed
    startpunt ook niet: dan is er niets om aan te knopen.

    Twee correcties uit de codereview van taak 7:

    * De variant zonder thema nam de kale claim "scoort het laagst van de
      afdelingen" over. Die wordt weerlegd door de tabel zodra de gepoolde
      restgroep lager staat, en het navy blok kwalificeert daar precies om die
      reden ("van de afdelingen die apart getoond worden") en noemt de restgroep.
      Deze zin doet nu hetzelfde.
    * "Springt eruit, neem dat als tweede punt" overdrijft bij een thema dat
      relatief sterk scoort, en draaide de bewuste band-neutrale keuze van het
      navy blok terug. Boven de aandachtspuntgrens volgt daarom de neutrale
      vorm, met de band erbij in plaats van een opdracht. De grens komt uit
      _factor_label; geen nieuwe drempel.

    Beide onderwerpen staan met een hoofdletter: de zin noemt er twee, en de
    kernzin en de cover op dezelfde pagina schrijven het startpunt ook zo.
    """
    if not seg or not startpunt_key:
        return ""
    dept, score = seg["department"], _score_str(seg["score"])
    rest_zin = (" De restgroep scoort lager, maar bestaat uit kleine afdelingen en "
                "telt daarom niet als startpunt." if seg.get("rest_lager") else "")
    if seg["low_fk"] is None:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. {dept} scoort het "
                f"laagst van de afdelingen die apart getoond worden ({score}); welk onderwerp "
                f"daar het zwaarst weegt is niet te zeggen, te weinig antwoorden per "
                f"onderwerp.{rest_zin}")
    low_lbl = _fl(seg["low_fk"], scan_type)
    low_sc = _score_str(seg["low_avg"])
    zwaar = _factor_label(seg["low_avg"]) != "Relatief sterk"
    if seg["low_fk"] == startpunt_key:
        if zwaar:
            return f"Bij {dept} weegt {low_lbl} het zwaarst ({low_sc}); daar begint het gesprek ook."
        return (f"Bij {dept} is {low_lbl} het laagst scorende onderwerp ({low_sc}); daar begint "
                f"het gesprek ook.")
    if zwaar:
        return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Bij {dept} springt "
                f"{low_lbl} eruit ({low_sc}); bespreek dat voor die afdeling na het startpunt.")
    return (f"Organisatiebreed begint het gesprek bij {startpunt_label}. Het laagst scorende "
            f"onderwerp bij {dept} is {low_lbl} ({low_sc}), en dat scoort daar "
            f"{_factor_label(seg['low_avg']).lower()}.")


def _segment_start_note(segment_rows: list[dict],
                        factor_rows: dict[str, dict] | None,
                        scan_type: str) -> str:
    """Het navy-blok "Waar het per afdeling begint" onder de segmenttabel.

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
    # omvangeis geldt alleen voor de afdeling die genoemd zou worden en zit in
    # _segment_startpunt; hier is `delta` alleen nog nodig om te weten WELKE van
    # de twee redenen gold.
    marge = str(SEGMENT_START_MIN_DELTA).replace(".", ",")

    # H20: de restgroep krijgt haar samenstelling en haar noemer, zodat
    # "scoort lager" niet over een naamloze groep gaat. Zonder volledige
    # noemer (geen deelsom, zie _enrich_segment_rows_with_invited) alleen het
    # aantal ingevulde vragenlijsten.
    pooled = _pooled_lager(segment_rows, low_sc)
    rest_sentence = ""
    if pooled:
        leden = pooled.get("members") or []
        inv = pooled.get("invited")
        samenstelling = ""
        if leden:
            # Zonder volledige noemer geen percentage, maar wél de reden: een
            # deelsom zou een te hoog responspercentage geven (Fail Loud).
            noemer = (f"; samen {inv} uitgenodigd, {pooled['n']} ingevuld" if inv
                      else f"; {pooled['n']} ingevuld, hoeveel mensen hier zijn "
                           f"uitgenodigd is niet volledig vastgelegd")
            samenstelling = f' ({_h(", ".join(leden))}{noemer})'
        rest_sentence = (
            f' De restgroep &ldquo;{_h(pooled["department"])}&rdquo;{samenstelling} scoort lager '
            f'({_shown(pooled["avg"]):.1f}/10), maar is samengesteld uit kleine '
            f'afdelingen en wordt daarom niet als startpunt genoemd.')

    # Eén gate voor staat 3, gedeeld met de brugzin (_segment_startpunt).
    # Is die None, dan is de reden hier per definitie een van de twee
    # hieronder: de rij-eis (minstens twee benoemde afdelingen) is boven al
    # afgevangen.
    aangewezen = _segment_startpunt(segment_rows, factor_rows)

    if aangewezen is None and delta < SEGMENT_START_MIN_DELTA:
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
    elif aangewezen is None:
        # "van de afdelingen die apart getoond worden": de gepoolde restgroep kan
        # lager staan, en dan zou een kale "scoort het laagst" in dezelfde alinea
        # worden weerlegd door de restgroep-zin eronder. Zonder restgroep is de
        # toevoeging ook waar (elke getoonde afdeling staat apart in de tabel).
        body = (f'{_h(lowest["department"])} scoort het laagst van de afdelingen die '
                f'apart getoond worden ({low_sc:.1f}/10), maar '
                f'heeft {lowest["n"]} antwoorden. Loep wijst een afdeling pas aan vanaf '
                f'{MIN_DISTRIBUTION_N} antwoorden, zodat de conclusie niet op een handvol '
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
        _low_inv = aangewezen["invited"]
        _low_basis = (f'{aangewezen["n"]} van de {_low_inv} uitgenodigden vulden in'
                      if _low_inv else f'{aangewezen["n"]} antwoorden')
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
        low_info = (factor_rows or {}).get(aangewezen["department"]) or {}
        if aangewezen["low_fk"] is not None:
            _omitted = low_info.get("omitted", 0)
            _voorbehoud = ""
            if _omitted > 0:
                _woord = "onderwerp is" if _omitted == 1 else "onderwerpen zijn"
                _voorbehoud = (f' Daarbij past een voorbehoud: {_omitted} {_woord} '
                               f'daar niet beoordeelbaar, te weinig antwoorden.')
            theme_sentence = (f' Het laagst scorende onderwerp daar is '
                              f'{_h(_lc(_fl(aangewezen["low_fk"], scan_type)))} '
                              f'({aangewezen["low_avg"]:.1f}/10).{_voorbehoud}')
        body = (f'<strong>{_h(aangewezen["department"])}</strong> heeft de laagste score '
                f'van de afdelingen die apart getoond worden '
                f'({aangewezen["score"]:.1f}/10; {_low_basis}). Gebruik dit om te toetsen wat hier '
                f'speelt, geen ranking of oordeel.{theme_sentence}')

    # C8/B2: dit blok gaat over de afdelingen, niet over het ene startpunt van
    # het rapport. Dat staat op pagina twee en op de gespreksagenda.
    return (f'<div class="navy-anchor">'
            f'<div class="navy-anchor-eyebrow">Waar het per afdeling begint</div>'
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
        return _segment_status_block(0, has_segment_data=False, opener_html=opener_html,
                                    scan_type=scan_type)

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
            strip = f'<span style="{_SEG_MONO}">spreiding vanaf 10 antwoorden</span>'
        if is_rest:
            # H20: de restgroep noemt haar leden, zodat "Overige afdelingen"
            # geen naamloze groep is waarover het rapport wel conclusies trekt.
            leden = row.get("members") or []
            name_html = _h(dept) + (f'<br><span style="{_SEG_MONO}">{_h(", ".join(leden))}</span>'
                                    if leden else "")
        else:
            name_html = f"<strong>{_h(dept)}</strong>"
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
            f'<tbody class="seg-grp"><tr><td class="iq" style="width:17%;">{name_html}</td>'
            f'<td style="width:9%;">{n_cell}</td>'
            f'<td class="is" style="width:8%;text-align:left;color:{col};">{avg:.1f}</td>'
            f'<td style="width:13%;color:{col};font-size:9.5px;">{_h(_factor_label(avg))}</td>'
            f'<td class="lt" style="width:27%;">{theme_cell}</td>'
            f'<td style="width:26%;">{strip}</td></tr></tbody>'
        )

    subblocks = _segment_factor_subblocks(segment_rows, factor_rows, scan_type)

    # De conclusie staat direct onder de tabel, vóór de uitsplitsing per
    # afdeling. Onderaan paste ze in vijftien van de 21 stresstest-scenario's
    # niet meer op de pagina en stond ze als los navy blok op een eigen vel (7
    # tot 10% gevuld; stresstest na plan 3a, observatie 10). Nu loopt ze mee
    # met de tabel waar ze over gaat; wat eventueel doorschuift is de
    # uitsplitsing, het detail.
    low_note = _segment_start_note(segment_rows, factor_rows, scan_type)

    # Fail Loud: niet tonen mag, verzwijgen niet. Halen de kleine afdelingen
    # samen de grens voor een restgroep niet, dan staan hun responses nergens
    # in deze tabel; zonder deze regel klopt de sectie-intro in dat geval niet.
    hidden_note = ""
    if hidden_n > 0:
        _aantal = ("Eén antwoord valt" if hidden_n == 1
                   else f"{hidden_n} antwoorden vallen")
        _horen = "die hoort" if hidden_n == 1 else "ze horen elk"
        hidden_note = (
            f'<p style="font-size:10px;color:#4A6070;margin:10px 0 0;">'
            f'{_aantal} buiten deze tabel: {_horen} bij een afdeling met minder dan '
            f'{MIN_SEGMENT_N} antwoorden, en dat zijn er te weinig om samen als '
            f'restgroep te tonen.</p>')

    # C9: de tabel had geen kolomkoppen, dus was per kolom niet te zien wat er
    # stond (de sectie-intro benoemde ze in proza). In een <thead>, zodat
    # WeasyPrint hem op een vervolgpagina herhaalt.
    kop = ('<thead><tr><th style="width:17%">Afdeling</th>'
           '<th style="width:9%">Ingevuld / uitgenodigd</th>'
           '<th style="width:8%">Score</th><th style="width:13%">Band</th>'
           '<th style="width:27%">Laagste onderwerp</th>'
           '<th style="width:26%">Spreiding</th></tr></thead>')
    # Alleen de verwijzing, geen tweede uitleg: de sectie-intro hierboven noemt de
    # bundeling vanaf vijf en de staffel van 5 tot 9 al, en de tabel doet de rest
    # (codereview taak 11).
    drempelregel = ('<p class="trustline">De drempels die hier gelden staan in de '
                    f'drempeltabel op pagina {_pref(LEIDRAAD_ANKERS["drempels"])}.</p>')
    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Per afdeling</span>'}
  {_intro("segmentanalyse")}
  {drempelregel}
  <div class="card">
    <table class="item-tbl seg-tbl">{kop}{rows_html}</table>
    {hidden_note}
    {low_note}
    {subblocks}
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
            f'<div class="quote-txt">{_h(t)}</div></div>'
        )
    # C2: het anonimiseringslabel stond onder elke kaart en werd zo bij twaalf
    # toelichtingen twaalf keer afgedrukt. Het geldt voor de hele lijst, dus
    # staat het één keer bovenaan (zelfde constante als het Anders-blok, dat het
    # om dezelfde reden één keer onder zijn lijst zet).
    label = f'<p class="quote-anon" style="margin-bottom:10px;">{ANON_NOTE}.</p>'
    return f'{note}{label}{cards}'


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
    (spec 2026-07-12 §6).

    De restgroep krijgt de som van haar leden (H20), maar alleen als élk lid een
    noemer heeft: een deelsom zou een te hoog responspercentage geven, en dan
    volgt None (alleen n tonen, met de reden in de zin eronder).

    De ledenlijst van de restgroep komt NIET alleen uit de respondenten
    (codereview taak 7, defect 3). `_department_segment_rows` kent alleen
    afdelingen waar iemand antwoordde, dus een afdeling die wel is uitgenodigd
    maar waar niemand invulde viel buiten de noemer: 6 van de 8 (75%) waar het 6
    van de 14 (43%) is. Elk label uit de campagnelijst zonder eigen rij hoort in
    de restgroep, inclusief die met nul respons. De respondentkant wordt bij de
    eerste aanroep vastgelegd (`members_resp`), zodat een tweede aanroep met een
    andere lijst niet op zijn eigen uitkomst verder rekent.
    """
    invited_by_label = {d.get("label"): d.get("invited_count")
                        for d in (segment_departments or [])}
    eigen_rij = {r["department"] for r in segment_rows if not r.get("is_pooled")}
    for row in segment_rows:
        if row.get("is_pooled"):
            leden_resp = row.setdefault("members_resp", list(row.get("members") or []))
            uit_lijst = [lbl for lbl in invited_by_label if lbl and lbl not in eigen_rij]
            leden = sorted(set(leden_resp) | set(uit_lijst))
            row["members"] = leden
            noemers = [invited_by_label.get(m) for m in leden]
            row["invited"] = sum(noemers) if leden and all(noemers) else None
        else:
            row["invited"] = invited_by_label.get(row["department"])
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


def _segment_absent_reason(respondents: list[dict]) -> str:
    """Waarom er geen afdelingstabel is, voor de regel "Niet in dit rapport".

    Twee verschillende dingen (codereview taak 5): er zijn geen afdelingen
    vastgelegd, of ze zijn wel vastgelegd maar geen twee ervan halen
    MIN_SEGMENT_N. De meetgegevens noemden altijd het tweede, ook als de
    organisatie nooit een afdeling had ingevuld. Leeg zodra de tabel wél kan
    renderen, dan is er niets uit te leggen.
    """
    grouped = _department_grouping(respondents)
    if not grouped:
        # Leest in de regel als "afdelingen (niet vastgelegd bij deze meting)".
        return "niet vastgelegd bij deze meting"
    if len({d for d, v in grouped.items() if len(v) >= MIN_SEGMENT_N}) < 2:
        return "te weinig antwoorden per afdeling"
    return ""


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
                     "is_pooled": True,
                     # H20: de restgroep krijgt een naam. Alfabetisch, zodat de
                     # zin niet van de invoervolgorde afhangt.
                     "members": sorted(d for d in grouped if d not in eligible)})
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

    # Meetdatums (spec 16-9 par. 4 blok 6, H8): start uit het delivery record,
    # sluiting uit de campagne zelf (closed_at staat op Campaign). Beide mogen
    # ontbreken; dan zegt de meetgegevensregel dat, en verzint het rapport niets.
    _raw_period_start = _record.launch_date if _record is not None else None
    _raw_period_end = camp.closed_at
    period_start = _datum_nl(_raw_period_start)
    period_end = _datum_nl(_raw_period_end)
    # Een sluitdatum vóór de startdatum is een fout in de vastlegging, geen
    # meetperiode (codereview taak 5). Letterlijk afdrukken ("30 maart 2026 tot
    # 9 maart 2026") laat het rapport onzin beweren; beide datums vervallen en
    # de meetgegevens zeggen in één regel waarom.
    period_dates_conflict = bool(
        _raw_period_start and _raw_period_end
        and _kalenderdag(_raw_period_end) < _kalenderdag(_raw_period_start))
    if period_dates_conflict:
        period_start = period_end = None

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
    # Gelijkspel op de VOLLEDIGE teller: most_common(5) kapt een gelijkspel van
    # meer dan vijf redenen af. Zelfde volgorde als exit_r_dist (most_common is
    # stabiel), zodat tabel en p.02 dezelfde redenen eerst noemen.
    _exit_r_all = exit_r_cnt.most_common()
    exit_r_top = ([{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in _exit_r_all if n_ == _exit_r_all[0][1]]
                  if _exit_r_all else [])
    # De vertrekreden is optioneel: de noemer is wie er een gaf, niet n_completed.
    exit_r_given = sum(exit_r_cnt.values())
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

    # B13: vrije teksten bij "Anders" gaan door dezelfde anonimisering als de
    # open toelichtingen. De submit-route doet dat al bij opslag (main.py), maar
    # rijen van vóór die sanitizer of uit een ander pad zouden hier ongefilterd
    # in een klant-PDF belanden; anonymize_text is idempotent, dus dubbel mag.
    for agg in list(deepening_agg.values()) + list(direction_agg.values()):
        agg["other_texts"] = [anonymize_text(t) for t in agg.get("other_texts", [])]

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
    # Waarom de tabel ontbreekt, uit de data en niet uit een vaste zin in de
    # renderer (codereview taak 5).
    segment_reason = _segment_absent_reason(_segment_input)

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
    # De tellingen achter de score (B9/C7): "+0" zegt niets zolang de lezer niet
    # weet of dat 0 aanraders en 0 critici is of 12 tegen 12.
    enps_detail: dict | None = None
    if enps_available:
        promoters  = sum(1 for v in enps_vals if v >= 9)
        detractors = sum(1 for v in enps_vals if v <= 6)
        enps_score = round((promoters - detractors) / len(enps_vals) * 100)
        enps_detail = {"n": len(enps_vals), "promoters": promoters, "detractors": detractors}

    return dict(
        campaign_id=campaign_id, scan_type=scan_type, scan_lbl=scan_lbl,
        org_name=org.name if org else "", campaign_name=camp.name,
        generated_at=now_str, delivery_mode=mode_lbl,
        n_invited=n_invited, n_invited_note=n_invited_note,
        n_completed=n_completed, completion_pct=completion,
        period_start=period_start, period_end=period_end,
        period_dates_conflict=period_dates_conflict,
        avg_risk=avg_risk, avg_eng=avg_eng, avg_to=avg_to, avg_si=avg_si,
        band_counts=band_counts, has_pattern=has_pattern,
        factor_avgs=factor_avgs, top_risks=top_risks,
        top_fkeys=top_fkeys, top_flabels=top_flabels,
        strong_work=strong_work, top_exit_lbl=top_exit_lbl, top_cont_lbl=top_cont_lbl,
        sig_vis=sig_vis, sdt_avgs=sdt_avgs,
        sdt_item_avgs=sdt_item_avgs, org_item_avgs=org_item_avgs,
        exit_r_dist=exit_r_dist, exit_r_top=exit_r_top, exit_r_given=exit_r_given,
        # De volledige teller, niet alleen de top 5 van de tabel: de why-cel op
        # p.02 moet ook de telling van een reden kennen die buiten die top valt.
        exit_r_counts=dict(exit_r_cnt),
        cont_dist=cont_dist,
        prev_dist=prev_dist, open_texts=open_texts,
        deepening_agg=deepening_agg,
        direction_agg=direction_agg,
        retention_profile=retention_profile,
        exit_pbs=exit_pbs, ret_pbs=ret_pbs, msp=msp, nsp=nsp,
        factor_items_map=factor_items_map, sdt_items=sdt_items,
        enps_available=enps_available, enps_score=enps_score, enps_detail=enps_detail,
        factor_resp_scores=factor_resp_scores,
        intent_resp={"stay": si_sc, "turnover": to_sc, "engagement": eng_sc},
        segment_rows=segment_rows,
        segment_factor_rows=segment_factor_rows,
        segment_hidden_n=segment_hidden_n,
        segment_reason=segment_reason,
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


def _overzicht_summary_and_bands(profile_factors: list[tuple[str, float | None]],
                                 *, laagste: list[str]) -> tuple[str, dict[str, list[str]]]:
    """Bouwt de samenvattingszin + band-indeling voor het overzichtsprofiel.

    Sorteert eerst op score: voorheen werd de eerste factor in kolomvolgorde
    genoemd ("Leiderschap vraagt als eerste aandacht") terwijl de rest van het
    rapport de laagst scorende factor vooropzet: het rapport sprak zichzelf tegen.

    laagste: de labels van ALLE onderwerpen die de laagste getoonde score delen,
    in de volgorde van de kop op pagina twee. De renderers leveren die uit
    _p02_laagste_keys(profile_shape(fa)), dezelfde bron als de kop, zodat beide
    zinnen dezelfde gelijkstand noemen in dezelfde vorm (telwoord, dubbele punt,
    komma's; zie _p02_flat_sentence). Verplicht en zonder default: een stille
    terugval op "het eerste onderwerp" was precies de fout (stresstest na plan
    3a, observatie 1: scenario 06 noemde één van drie onderwerpen op 6.2).
    Het bandwoord is "kwetsbaar", zoals overal in het rapport, niet "kritisch".
    """
    ranked = sorted([(l, s) for l, s in profile_factors if s is not None], key=lambda x: x[1])
    # Indeling via _factor_label: zelfde (afgeronde) drempels als de balken (B15).
    kwetsbaar = [l for l, s in ranked if _factor_label(s) == "Kwetsbaar punt"]
    aandacht  = [l for l, s in ranked if _factor_label(s) == "Aandachtspunt"]
    sterk     = [l for l, s in ranked if _factor_label(s) == "Relatief sterk"]
    laag_sc = ranked[0][1] if ranked else None
    if ranked and len(laagste) == len(ranked) and len(ranked) > 1:
        laagste_zin = (f"{_alle_onderwerpen(len(ranked)).capitalize()} scoren "
                       f"{_score_str(_shown(laag_sc))}.")
    elif len(laagste) > 1:
        bijv = "kwetsbare " if kwetsbaar else ""
        laagste_zin = (f"{_TELWOORD[len(laagste)].capitalize()} {bijv}onderwerpen "
                       f"delen de laagste score ({_score_str(_shown(laag_sc))}): "
                       f"{', '.join(laagste)}.")
    elif kwetsbaar:
        laagste_zin = (f"{kwetsbaar[0]} is het "
                       f"{'enige' if len(kwetsbaar) == 1 else 'duidelijkste'} "
                       f"kwetsbare punt.")
    elif laagste:
        laagste_zin = f"{laagste[0]} scoort het laagst."
    else:
        laagste_zin = ""
    if kwetsbaar and sterk:
        summary = f"{laagste_zin} {sterk[-1]} vormt een relatief sterke basis."
    elif kwetsbaar:
        summary = laagste_zin[:-1] + "; geen enkel onderwerp scoort relatief sterk."
    elif aandacht:
        summary = f"Geen onderwerp scoort kwetsbaar. {laagste_zin}"
    elif sterk:
        summary = "Het profiel toont een overwegend relatief sterk beeld."
    else:
        # Geen enkele factorscore beschikbaar: eerlijk degraderen i.p.v. een
        # positieve claim zonder data (fail-loud). Bewust zonder "(<10)": de
        # lege staat hangt aan een leeg factorprofiel, niet aan het
        # responsaantal -- scoring.factor_averages laat ook een factor zonder
        # waarden weg. Zie _geen_factorprofiel_note voor dezelfde correctie.
        summary = ("Voor deze meting zijn er geen scores per onderwerp berekend, "
                   "dus staat hier nog geen profiel.")
    return summary, {"kwetsbaar": kwetsbaar, "aandacht": aandacht, "sterk": list(reversed(sterk))}


def _overzichtsprofiel(factors: list[tuple[str, float | None]],
                       summary: str = "", opener_html: str = "", *, scan_type: str,
                       stroom_zonder_profiel: bool = True) -> str:
    """scan_type is verplicht en heeft bewust geen default: de rangorde-zin in
    de intro is scan-afhankelijk (zie OVERZICHTSPROFIEL_RANGORDE) en een stille
    terugval zou in een van de drie rapporten een onware regel afdrukken.

    C3: de uitsplitsing per band (drie lijstjes met dezelfde labels die in de
    balken erboven al staan, elk met zijn aantal) is verdwenen. Die lijst zei
    niets wat de balken en de samenvattingszin niet al zeggen, en herhaalde de
    bandtermen een derde keer op dezelfde pagina. _overzicht_summary_and_bands
    levert de indeling nog wel (de banden komen uit dezelfde afgeronde drempels
    als de balken, en dat is elders getest); de renderers gebruiken alleen de
    zin."""
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
        sec_cls = "pb sec"
    else:
        intro_html = ""
        legend = ""
        # Zonder profiel is dit hoofdstuk één zin; op een eigen vel was dat een
        # pagina van 10% (stresstest 07, fixronde 2 na plan 3a). Het stroomt dan
        # onder het vorige hoofdstuk, kop en zin bij elkaar. Niet bij Loep Start:
        # daar is dit hoofdstuk 02 en volgt het direct op pagina twee, die op
        # één vel moet blijven en hoofdstuk 02 op pagina drie laat beginnen (H16).
        sec_cls = "sec flow" if stroom_zonder_profiel else "pb sec"
    return f"""<div class="{sec_cls}">
  {opener_html or '<span class="slabel">Overzichtsprofiel</span>'}
  {intro_html}
  {summary_html}
  <div class="card">{rows}{legend}</div>
</div>"""


# ─── Vertrekcontext (T7) ──────────────────────────────────────────────────────

def _vertrekcontext(*, exit_reasons: list[tuple[str, int]],
                    contributing: list[tuple[str, int]], n: int,
                    primary_factor_label: str, opener_html: str = "",
                    has_profile: bool = True, enps_html: str = "") -> str:
    """has_profile volgt dezelfde schakelaar als de degraded p.02-alinea.

    Zonder factorprofiel verwijzen twee zinnen op deze pagina naar iets dat er
    niet is: de sectie-intro belooft factorscores verderop, en de kaart
    "Relatie met het overzichtsprofiel" noemt "de factoren die bovenaan de
    rangorde staan" en "de factordiepte hierna". De redenen zelf blijven staan
    -- die komen rechtstreeks uit de antwoorden en zijn er wel."""
    # Hoofdredenen: alle rijen die build_report_data levert (exit_r_dist, de top
    # 5). Daar komt ook de telling in de ranglijstkolom "Als hoofdreden genoemd"
    # en op de verdiepingskaarten vandaan, dus elk getal dat de lezer daar ziet,
    # staat hier terug te vinden. Met alleen de top 3 stond er "Werkdruk en
    # balans 5x" in de ranglijst terwijl Werkdruk hier ontbrak (stresstest na
    # plan 3a, observatie 3). Hetzelfde geldt voor de meespelende redenen: de
    # why-cel "Speelt ook mee" op pagina twee telt uit cont_dist (ook een top
    # 5), dus ook die lijst staat hier volledig.
    def _reason_rows(items: list[tuple[str, int]]) -> str:
        return "".join(
            f'<tr><td class="iq">{_h(lbl)}</td>'
            f'<td class="is">{cnt}&times;</td></tr>'
            for lbl, cnt in items
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
               f"in de rangorde en is tegelijk de meest genoemde hoofdreden van vertrek.</p>")
    else:
        # Geen substring-match tussen hoofdreden en startpunt: benoem beide
        # feiten zonder een verbandclaim ("versterken elkaar") die de data niet
        # draagt. De factordiepte toont de bovenste rasterrijen, niet per se de
        # laagst scorende factor -- dus verwijst deze zin naar de rangorde.
        rel = (f"<p style='margin-bottom:0;'>De meest genoemde hoofdreden en de scores per onderwerp "
               f"belichten elk een eigen invalshoek. De onderwerpen die bovenaan de "
               f"rangorde staan, komen terug in de verdieping hierna.</p>")

    rel_card = (f'<div class="card navy" style="background:#fff;">'
                f'<h3>Relatie met het overzichtsprofiel</h3>{rel}</div>'
                ) if has_profile else ""

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Vertrekcontext</span>'}
  {_intro("vertrekcontext" if has_profile else "vertrekcontext_geen_profiel")}
  <div class="tcol">
    <div class="tc-l"><div class="card accent"><h3>Hoofdredenen van vertrek</h3>
      <table class="item-tbl">{_reason_rows(exit_reasons)}</table></div></div>
    <div class="tc-r"><div class="card"><h3>Speelde ook mee</h3>
      <table class="item-tbl">{_reason_rows(contributing)}</table></div></div>
  </div>
  {rel_card}
  {enps_html}
</div>"""


# ─── Behoudscontext (T7-retention) ───────────────────────────────────────────

def _behoudscontext(*, retention_score: float | None, stay_intent: float | None,
                    turnover: float | None, engagement: float | None,
                    intent_resp: dict | None = None,
                    opener_html: str = "", enps_html: str = "") -> str:
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
                 f'<div class="sigrow-body">De zes onderwerpen over het werk en de werkbeleving samengebracht op groepsniveau.</div>'
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
  {enps_html}
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


# ─── Gedeelde secties: werkgeversaanbeveling, werkbeleving, appendix ─────────

def _enps_cijfers(data: dict) -> tuple[int | None, dict | None]:
    """Eén gate voor de werkgeversaanbeveling (codereview taak 8).

    Het contextblok, de appendixregel en de meetgegevens hingen elk aan hun
    eigen spelling van dezelfde voorwaarde; drie spellingen kunnen stil
    uiteenlopen en dan zegt de ene pagina "niet in dit rapport" terwijl de
    andere een score toont. `enps_available` is de drempel (`MIN_QUOTES_N`);
    haalt een meting die niet, dan rapporteert dit rapport geen score, ook niet
    als er een berekende waarde in de data staat.

    Fail Loud: een gerapporteerde score zonder tellingen is een datafout, niet
    "niet gemeten". Stil terugvallen zou een gemeten score laten verdwijnen.
    """
    if not data.get("enps_available") or data.get("enps_score") is None:
        return None, None
    detail = data.get("enps_detail")
    if not detail:
        raise ValueError(
            "enps_score zonder enps_detail: de tellingen achter de "
            "werkgeversaanbeveling ontbreken, dus kan het rapport de score niet "
            "onderbouwen (build_report_data zet beide samen)")
    return data["enps_score"], detail


def _enps_str(score: int) -> str:
    """eNPS met teken, en bij een negatieve score een echt minteken (U+2212),
    zoals "−100 tot +100" elders in het rapport (eindreview plan 3a punt 4).
    Een los koppelteken las als streepje, niet als min."""
    return f"{score:+d}".replace("-", "−")


def _enps_block(enps_score: int | None, enps_detail: dict | None) -> str:
    """Werkgeversaanbeveling als blok op de contextpagina (H13, spec par. 9 B9):
    de score met de tellingen erbij, zodat "+0" iets betekent. Leeg zonder
    score. Geen eigen hoofdstuk meer."""
    if enps_score is None or not enps_detail:
        return ""
    ecol = _rag_color(10.0 if enps_score >= 20 else 6.0 if enps_score >= 0 else 4.0)
    n, p, d = enps_detail["n"], enps_detail["promoters"], enps_detail["detractors"]
    return (f'<div class="enps-inline no-break"><span class="eyebrow">Werkgeversaanbeveling</span>'
            f'{_intro("werkgeversaanbeveling")}'
            f'<table class="sg"><tr><td><div class="sc-l">Aanbevelingsscore</div>'
            f'<div class="sc-v" style="color:{ecol};">{_enps_str(enps_score)}</div>'
            f'<div class="sc-b">{p} aanraders, {d} critici van {n} (eNPS, &minus;100 tot +100)</div></td>'
            f'</tr></table></div>')


def _werkbeleving_section(sdt_a: dict, sim: dict, sdt_items: list, opener_html: str) -> str:
    """Werkbeleving (SDT), één helper voor de drie renderers; voorheen drie keer
    dezelfde 40 regels.

    Twee kolommen (B9) alleen als er echt iets te halveren is: bij een volle
    SDT-set (vier stellingen per dimensie) ging deze sectie van 287mm naar 233mm
    en dus van twee pagina's naar één. Loep Start meet drie werkbelevingsitems,
    dus één stelling per dimensie; twee kolommen halveren daar een sectie die al
    dun was (0,32 tot 0,35 vulling gemeten op main) en maken het probleem groter
    in plaats van kleiner. De keuze hangt daarom aan de data en niet aan het
    scantype: zodra geen enkele kaart meer dan één stelling draagt, staat alles
    onder elkaar (codereview taak 8).

    Dimensies komen uit SDT_LABELS, dezelfde lijst die _heeft_werkbeleving
    leest: met een hardcoded drietal zou een nieuwe dimensie wel de gate halen
    en niet in de sectie staan, en dan verwijst de leidraad naar een pagina die
    hem niet toont.

    Leeg zonder dimensiescores. De aanroeper gate't daarom op
    _heeft_werkbeleving, zodat ch.opener geen hoofdstuknummer opeist voor een
    sectie die niets toont.
    """
    def _keys(dim: str) -> list[str]:
        return [ik for ik in SDT_DIMENSION_ITEMS.get(dim, []) if ik in sim]

    def _item_tbl(dim: str) -> str:
        REV = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}{REV if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=balk, height=6)}</td></tr>'
            for ik in _keys(dim)
            for q in [next((t for k, t in sdt_items if k == ik), ik)])
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    def _card(dim: str) -> str:
        sc, tbl = sdt_a.get(dim), _item_tbl(dim)
        if not tbl:
            return ""
        col = _rag_color(sc)
        # In twee kolommen komt de marge uit .wb-cols .card (compacter).
        marge = "" if twee_kolommen else ' style="margin-bottom:12px;"'
        return (f'<div class="card no-break"{marge}>'
                f'<div style="margin-bottom:8px;"><span style="font-size:12px;font-weight:700;color:#243247;">'
                f'{_h(SDT_LABELS.get(dim, ""))}</span>'
                f'<span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>'
                f'<span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(_factor_label(sc))}</span></div>'
                f'<div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim, ""))}</div>{tbl}</div>')

    dims = [dim for dim in SDT_LABELS if sdt_a.get(dim) is not None]
    overview = "".join(_factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim)) for dim in dims)
    if not overview:
        return ""
    twee_kolommen = any(len(_keys(dim)) > 1 for dim in dims)
    # In een halve kolom krijgt de stelling de ruimte en blijft de balk kort;
    # een balk van 80px liet de stelling over drie regels lopen.
    balk = 44 if twee_kolommen else 80
    kaarten = [k for k in (_card(dim) for dim in dims) if k]
    overzichtskaart = f'<div class="card" style="margin-bottom:14px;">{overview}</div>'
    if not twee_kolommen:
        inhoud = overzichtskaart + "".join(kaarten)
    else:
        # De overzichtskaart staat over de volle breedte boven de kolommen, niet
        # in de linkerkolom. Daar was de balkenkaart (naam, balk, score en
        # bandlabel op een regel) breder dan een halve kolom: de linkercel
        # groeide, duwde de rechterkolom van het vel en WeasyPrint sneed die
        # tekst af (stresstest na plan 3a, observatie 8; alleen op de echte
        # render te zien). Zonder de balken dragen beide kolommen alleen
        # kaarten, en `table-layout: fixed` op .wb-cols houdt ze elk op de helft.
        # De eerste kolom krijgt de grootste helft: de kaarten zijn ongeveer
        # even hoog, dus zo lopen de kolommen het gelijkst af.
        helft = (len(kaarten) + 1) // 2
        inhoud = (f'{overzichtskaart}<div class="tcol wb-cols">'
                  f'<div class="tc-l">{"".join(kaarten[:helft])}</div>'
                  f'<div class="tc-r">{"".join(kaarten[helft:])}</div></div>')
    return f'<div class="pb sec">{opener_html}{_intro("werkbeleving")}{inhoud}</div>'


def _appendix_section(*, fa: dict, oim: dict, sim: dict, factor_items_map: dict, sdt_items: list,
                      scan_type: str, n: int, enps_score: int | None, enps_detail: dict | None,
                      opener_html: str, sdt_title: str) -> str:
    """Appendix: één tabel per onderwerp onder elkaar, de SDT-tabel als laatste.
    Eén helper voor drie renderers; voorheen drie keer dezelfde 45 regels.

    Bewust één kolom (codereview taak 8). Twee kolommen leken de B9-klacht op te
    lossen maar deden dat niet: de appendix ging van 360mm naar 303mm en bleef
    daarmee boven de 259mm van één vel, dus er ging geen pagina af en de
    staartpagina werd juist leger (39% naar 17% vulling) -- precies de verkeerde
    kant voor de regel die B9 meet. Bovendien vroeg die opmaak dat de renderer
    een tabelrij hoger dan een pagina binnen de rij afbreekt; dat pad dekt geen
    draaiende test.

    C7: de eNPS-regel noemt de score met de tellingen, of zegt dat hij niet
    gerapporteerd is. Niet "niet gemeten": onder de rapportagedrempel is de
    vraag wel gesteld. Dat spiegelt de meetgegevens op pagina twee, die ook
    alleen "Niet in dit rapport" zeggen.
    """
    def _rows(items, avgs):
        return "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(avgs.get(ik))};">{avgs[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(avgs.get(ik), _factor_color(avgs.get(ik)), width=70, height=5)}</td></tr>')
            if avgs.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in items)

    def _tbl(title, rows):
        return (f'<div class="no-break" style="margin-bottom:14px;">'
                f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">{title}</div>'
                f'<table class="app-tbl"><tr><th class="aq">Stelling</th><th class="as">Gem.</th>'
                f'<th class="ab">Beeld</th></tr>{rows}</table></div>')

    tabellen = [
        _tbl(_h(_fl(fk, scan_type)) + ("&nbsp;&middot;&nbsp;" + _score_str(fa.get(fk)) if fa.get(fk) else ""),
             _rows(items, oim))
        for fk, items in factor_items_map.items()]
    sdt_rows = _rows(sdt_items, sim)
    sdt_html = _tbl(sdt_title, sdt_rows) if sdt_rows else ""
    if enps_score is not None and enps_detail:
        enps_line = (f"Werkgeversaanbeveling (eNPS): {_enps_str(enps_score)}, {enps_detail['promoters']} aanraders en "
                     f"{enps_detail['detractors']} critici van {enps_detail['n']}.")
    else:
        enps_line = "Werkgeversaanbeveling (eNPS): niet gerapporteerd in dit rapport."
    # De appendix opent geen eigen vel maar stroomt onder het vorige hoofdstuk
    # (fixronde 2 na plan 3a): hij is langer dan een vel, dus met een eigen vel
    # bleef er een staart van 32 tot 36% over (Loep Start, voorbeeld Loep
    # Vertrek). Hij breekt tussen de tabellen (elke tabel blijft heel); kop,
    # intro en eerste tabel blijven samen. Geen leidraadverwijzing wijst naar
    # dit hoofdstuk, dus een kop halverwege een pagina raakt geen verwijzing.
    kop = (f'<div class="no-break">{opener_html}{_intro("appendix")}'
           f'<p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.</p>'
           f'{tabellen[0] if tabellen else ""}</div>')
    secties = "".join(tabellen[1:])
    return f"""<div class="sec">
  {kop}
  {secties}
  {sdt_html}
  <p class="trustline">{_h(enps_line)}</p>
</div>"""


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict) -> str:
    n           = data["n_completed"]
    # Eén gate voor de werkgeversaanbeveling: het contextblok, de
    # appendixregel en de meetgegevens lezen dezelfde twee waarden.
    _enps_score, _enps_detail = _enps_cijfers(data)
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

    # Brugzin (taak 7, B2): één startpuntverhaal. Zelfde zin op p.02 en op de
    # gespreksagenda; leeg zonder aangewezen afdeling of zonder factorprofiel
    # (dan is er niets om aan te knopen en zegt het navy blok zelf de reden).
    _seg_startpunt = _segment_startpunt(data.get("segment_rows") or [],
                                        data.get("segment_factor_rows"))
    _brug = ("" if _geen_profiel else
             _brugzin(_raster_rows[0]["key"], _raster_primary_label, _seg_startpunt, "exit"))

    # ── Cover ─────────────────────────────────────────────────────────────────
    opening_q = "Wat speelde mee bij vertrek?"
    primary_signal = _raster_primary_label or GEEN_FACTORPROFIEL_LBL
    cover_stats = [
        ("Respondenten", str(n)),
        _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
        # C8: één woord voor hetzelfde ding. De cover noemde het "Eerste
        # aandachtspunt" terwijl binnen "startpunt" en "aandachtspunt" twee
        # verschillende dingen zijn (een aandachtspunt is een bandlabel).
        ("Waar het gesprek begint", primary_signal),
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
    # Blok 2 (spec par. 4): vertrekreden met noemer en gelijkspel, respons met
    # oordeel, frictiescore. De vertrekredenzin hangt achter de kernzin, maar de
    # noemer van de respons hoort bij de claim die hij relativeert (het
    # startpunt), dus de zin wordt pas na _p02_met_respons aangehaakt.
    # exit_r_top/exit_r_given komen uit build_report_data; oudere fixtures
    # kennen ze niet en vallen terug op de tabel en op n (plan-regel 12).
    _er_top = data.get("exit_r_top") or data["exit_r_dist"]
    _er_given = data.get("exit_r_given")
    _er_zin = ((" " + _vertrekreden_zin(_er_top, n, gegeven=_er_given))
               if (exec_line and er_top) else "")
    _cijfers_html = _p02_cijfers_block([
        _vertrekreden_cell(_er_top, n, gegeven=_er_given),
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not avg_risk
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus de frictiescore blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"De frictiescore van {rdsp} wijst op een {fl.lower()}." if avg_risk
                     else "Zie de vertrekcontext en de meetgegevens voor wat dit rapport wel toont.")

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
        # Uit de volledige teller, niet uit de top 5 van de tabel: zijn meer dan
        # vijf redenen even vaak genoemd en valt die van het startpunt buiten die
        # top 5, dan zag de cel een telling van 0 en verdween hij, terwijl hij
        # juist "Even vaak" moest melden. Een oude fixture zonder exit_r_counts
        # valt terug op wat er wél is (top 5 plus het volledige gelijkspel).
        er_n    = _exit_reason_count(data, tf_code) if tf_code else 0
        cont_n  = next((r["count"] for r in data["cont_dist"]   if r["code"] == tf_code), 0) if tf_code else 0

        items_in   = fim.get(tf, [])
        i_scores   = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item   = min(i_scores, key=lambda x: x[2]) if i_scores else None

        _deep_agg_early = data.get("deepening_agg") or {}
        why_cells = ""
        why_cells += _hoofdreden_cell(er_n=er_n, er_top=_er_top, gegeven=_er_given,
                                      n=n, tf_code=tf_code, color=tf_col)
        if tf_sc:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit onderwerp ({_h(tf_fl.lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if cont_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Speelt ook mee</div><div class="why-v">{cont_n}&times;</div><div class="why-b">als meespelende context</div></td>'

        why_cells += _p02_why_extra_cells(
            _raster_rows[0], "exit",
            opener_toelichting=_opener_toelichting(_deep_agg_early, "exit", tf))
        primary_fkey  = tf
        primary_label = tf_lbl
        # Eén gespreksopener (H9): dezelfde zin als op de gespreksagenda.
        br_mgmt_q = _gespreksopener(_deep_agg_early, "exit", tf)
        br_mgmt_q_source = _raster_attribution(_raster_rows, "exit")
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        br_mgmt_q     = _mgmt_q(low_f[0], "exit") if low_f else ""
        br_mgmt_q_source = "Gebaseerd op het laagst scorende onderwerp." if low_f else ""

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
                 "de werkgeversaanbeveling" if _enps_score is not None else "",
                 "de meetgegevens onderaan deze pagina"],
        )

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        # Exit meet uitgestroomde medewerkers, niet het hele personeelsbestand —
        # "Alle medewerkers" was feitelijk onjuist op het eerlijkheidsanker (C3).
        population="Uitgestroomde medewerkers",
        segment_available=bool(data.get("segment_rows")),
        segment_reason=data.get("segment_reason") or "",
        # Zelfde gate als het contextblok en de appendixregel (_enps_cijfers).
        enps_available=_enps_score is not None,
        period_start=data.get("period_start"),
        period_end=data.get("period_end"),
        period_conflict=bool(data.get("period_dates_conflict")),
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        primary_label=primary_label,
        why_cells_html=why_cells,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        cijfers_html=_cijfers_html,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Het antwoord in het kort"),
        # De leidraad kiest zijn vlaggen uit de data; zonder factorprofiel of
        # zonder de secties van regel 4 rendert hij bewust niet.
        leidraad_html=_leidraad_html(
            "exit", data=data, deep_agg=deep_agg, direction_agg=direction_agg,
            startpunt_fk=_primary, has_sdt=_heeft_werkbeleving(sdt_a),
            geen_profiel=_geen_profiel),
        direction_line=_direction_p02_line(direction_agg, _primary, "exit",
                                           factor_score=_primary_score),
        brug_zin=_brug,
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
    )

    # ── Vertrekcontext (p.04 — vóór factorprofiel) ───────────────────────────
    exit_reasons = [(r["label"], r["count"]) for r in data["exit_r_dist"]]
    contributing = [(r["label"], r["count"]) for r in data["cont_dist"]]
    s += _vertrekcontext(exit_reasons=exit_reasons, contributing=contributing,
                         n=n, primary_factor_label=_raster_primary_label,
                         opener_html=ch.opener("Wat speelde mee bij vertrek?", kicker="Vertrekcontext", anchor=LEIDRAAD_ANKERS["context"]),
                         has_profile=not _geen_profiel,
                         # eNPS staat bij de context i.p.v. op een eigen,
                         # vrijwel lege pagina (H13, B9).
                         enps_html=_enps_block(_enps_score, _enps_detail))

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, "exit"), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    # C3: alleen de samenvattingszin; de bandlijst onder de balken is weg.
    _overzicht_summary, _ = _overzicht_summary_and_bands(
        profile_factors, laagste=[_raster_labels[fk] for fk in _p02_laagste_keys(_shape)])
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary,
                            opener_html=ch.opener("Overzichtsprofiel", anchor=LEIDRAAD_ANKERS["overzicht"]), scan_type="exit")

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    def _factor_detail(fk: str, opener_html: str = "", intro_html: str = "",
                       is_first: bool = True) -> str:
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
        # Geen backslashes of hergebruikte aanhalingstekens in f-string-expressies:
        # dat is pas geldig sinds Python 3.12 (PEP 701) en Railway draait 3.11.
        # Zie tests/test_python311_syntax_guard.py.
        low_key = low_i[0] if low_i else None
        rows = "".join(
            '<tr><td class="iq"'
            + (' style="font-weight:700;"' if ik == low_key else "")
            + f">{_h(q)}"
            + (' <span class="low-tag">laagste score</span>' if ik == low_key else "")
            + f'</td><td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Scores per stelling niet beschikbaar in deze meting.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): de trefwoord-
        # selectie had dezelfde negatie-blindheid als de classificatie die eerder
        # uit _themed_quotes is verwijderd (besluit 2026-04-09). Alle quotes staan
        # integraal (geanonimiseerd) in de quotes-sectie; duiding in de bespreking.
        # ── Exit reason context block ──
        er_count = exit_code_counts.get(fk, 0)
        if er_count > 0:
            er_context = f'<div class="card accent">{er_count}&times; als hoofdreden van vertrek genoemd; die telling staat ook in de vertrekcontext.</div>'
        else:
            er_context = ""
        # ── Lowest / highest item cards — alleen bij >3 items; bij 3 items zijn
        # ze pure herhaling van de itemtabel (2 van de 3 rijen stonden dubbel) ──
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste stelling binnen dit onderwerp</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        # NB: het statische "Eerste managementvraag"-navy-blok is hier bewust weg —
        # dezelfde template-vraag stond al op p.02 en 3x op de verdiepingspagina's;
        # de data (items + toelichting + quote) draagt deze pagina zelf.
        deep_block = (_deepening_block(deep_agg[fk], "exit", fk, n)
                      if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        # Alleen het eerste onderwerp opent een nieuwe pagina (B9): de volgende
        # verdiepingen stromen door onder hun voorganger en verhuizen als geheel
        # zodra ze niet meer passen.
        # Ook het eerste onderwerp stroomt (fixronde 2 na plan 3a): het hoofdstuk
        # begint onder het overzichtsprofiel als het daar past, en anders op een
        # nieuw vel omdat de sectie als geheel verhuist (.sec.flow). Met een eigen
        # vel bleef het laatste onderwerp alleen op een pagina van 27 tot 37%.
        # is_first bepaalt alleen nog de kop en de intro (aanroeper).
        return f"""<div class="sec flow verd{' verd-eerste' if is_first else ''}">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {er_context}
  {low_card}
  {high_card}
  <h3 class="verd-h3">Alle stellingen over dit onderwerp</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, "exit")
            # Geen "(vervolg)" (C12): het volgende onderwerp is geen vervolg van
            # het vorige, het is een nieuw onderwerp in hetzelfde hoofdstuk.
            _opener = (ch.opener(f"Verdieping: {_lbl}", anchor=LEIDRAAD_ANKERS["verdieping"])
                       if _i == 0 else _ChapterCounter.sub(f"Verdieping: {_lbl}"))
            s += _factor_detail(_pfk, opener_html=_opener,
                                intro_html=_intro("verdieping") if _i == 0 else "",
                                is_first=_i == 0)
    else:
        s += f'<div class="sec flow">{ch.opener("Verdieping: onderwerpen met de meeste aandacht", anchor=LEIDRAAD_ANKERS["verdieping"])}<div class="empty-state">{VERDIEPING_GEEN_RANGORDE}</div></div>'

    # ── SDT basisbehoeften ────────────────────────────────────────────────────
    # Werkbeleving in twee kolommen via de gedeelde helper (B9). De gate is
    # _heeft_werkbeleving, dezelfde die de leidraad gebruikt: zonder
    # dimensiescores toonde deze pagina een lege kaart en eiste ze toch een
    # hoofdstuknummer op.
    if _heeft_werkbeleving(sdt_a):
        s += _werkbeleving_section(
            sdt_a, sim, data["sdt_items"],
            ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid",
                      anchor=LEIDRAAD_ANKERS["werkbeleving"]))

    # Geen eigen eNPS-hoofdstuk meer (H13, B9): één score op een eigen vel was
    # de leegste pagina van het rapport. Het blok staat nu bij de context, met de
    # tellingen erbij; niet gemeten meldt de regel 'Niet in dit rapport' bij de
    # meetgegevens en de appendixregel (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Per afdeling", anchor=LEIDRAAD_ANKERS["afdelingen"]) if _seg_rows else ch.opener("Per afdeling")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type="exit", opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} respondentstemmen", anchor=LEIDRAAD_ANKERS["toelichtingen"])}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, "exit", top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    # Het richtingblok wordt hier gebouwd, niet in _prioriteringsraster (bug
    # B3): alleen zo kan de methodiekpagina verderop beloven wat dit rapport
    # daadwerkelijk bevat in plaats van wat er aan data bestaat.
    _dir_block = _wat_moet_gebeuren_block(_raster_rows, direction_agg, "exit", n)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type="exit",
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=(_gespreksopener(deep_agg, "exit", _startpunt_fk) if _startpunt_fk
                else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit onderwerp nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda", anchor=LEIDRAAD_ANKERS["agenda"]),
        direction_agg=direction_agg,
        n_total=n,
        direction_block_html=_dir_block,
        brug_zin=_brug,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        # Twee kolommen via de gedeelde helper (B9): de onderwerpstabellen naast
        # elkaar in plaats van onder elkaar, zodat de appendix niet met een paar
        # regels op een tweede vel overloopt.
        s += _appendix_section(
            fa=fa, oim=oim, sim=sim, factor_items_map=data["factor_items_map"],
            sdt_items=data["sdt_items"], scan_type="exit", n=n,
            enps_score=_enps_score, enps_detail=_enps_detail,
            opener_html=ch.opener("Appendix", kicker="Volledige vraagresultaten"),
            sdt_title="Werkbeleving: alle stellingen")

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page("exit", opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen", anchor=LEIDRAAD_ANKERS["methodiek"]),
                     ranking_active=not _geen_profiel,
                     direction_active=bool(_dir_block),
                     direction_degraded=bool(_dir_block) and not _raster_rows,
                     deepening_active=bool(deep_agg),
                     org_name=data["org_name"])
    return _doc(f"Loep Vertrek · {data['campaign_name']}", s, scan_type="exit")


# ─── RetentieScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    ST          = "retention"
    # Eén gate voor de werkgeversaanbeveling, zie render_exit_report_html.
    _enps_score, _enps_detail = _enps_cijfers(data)
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

    # Brugzin (taak 7, B2), zie render_exit_report_html.
    _seg_startpunt = _segment_startpunt(data.get("segment_rows") or [],
                                        data.get("segment_factor_rows"))
    _brug = ("" if _geen_profiel else
             _brugzin(_raster_rows[0]["key"], _raster_primary_label, _seg_startpunt, ST))

    # ── Cover ─────────────────────────────────────────────────────────────────
    _ret_primary = _raster_primary_label or GEEN_FACTORPROFIEL_LBL
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Waar staat behoud nu onder druk?",
        stats=[
            ("Respondenten", str(n)),
            _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
            ("Waar het gesprek begint", _ret_primary),  # C8, zie render_exit_report_html
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
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit onderwerp ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        why_cells += _p02_why_extra_cells(
            _raster_rows[0], ST,
            opener_toelichting=_opener_toelichting(_deep_agg_early, ST, tf))
        primary_fkey  = tf
        primary_label = tf_lbl_
        # Eén gespreksopener (H9): dezelfde zin als op de gespreksagenda.
        br_mgmt_q = _gespreksopener(_deep_agg_early, ST, tf)
        br_mgmt_q_source = _raster_attribution(_raster_rows, ST)
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""
        br_mgmt_q_source = "Gebaseerd op het laagst scorende onderwerp." if low_f else ""

    # Degraded pagina twee (bug B2), zie render_exit_report_html.
    br_degraded_note = ""
    if _geen_profiel:
        br_degraded_note = _geen_factorprofiel_note(
            n,
            drempelzin=(f"Daarvoor zijn minimaal {MIN_AGGREGATE_N} antwoorden nodig; "
                        f"bij minder telt elk los antwoord te zwaar mee."),
            wel=["de behoudscontext op de volgende pagina" if signal is not None else "",
                 "de werkbeleving" if sdt_a else "",
                 "de werkgeversaanbeveling" if _enps_score is not None else "",
                 "de meetgegevens onderaan deze pagina"],
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
    _stay_scores = (data.get("intent_resp") or {}).get("stay") or []
    _cijfers_html = _p02_cijfers_block([
        _blijfintentie_cell(avg_si, _stay_scores),
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
    # Zelfde telling als _p02_opening: zonder kwetsbaar onderwerp zegt de kop
    # "Geen onderwerp scoort kwetsbaar.", dus geen "Ook".
    _si_kop = _blijfintentie_kopzin(avg_si, _stay_scores,
                                    na_kwetsbaar_onderwerp=_shape["n_vulnerable"] > 0)
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not (signal and band_lbl)
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus het behoudssignaal blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"{band_lbl} (behoudssignaal {_score_str(signal)})."
                     if signal and band_lbl
                     else "Zie de behoudscontext en de meetgegevens voor wat dit rapport wel toont.")

    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"], verwijzing=_verwijst)
    # Kwetsbare blijfintentie hoort in de kop (B1): het rapport past zijn eigen
    # regel "onder 5,0 is kwetsbaar" toe op zijn slechtste getal. Niet in de
    # degraded staat: daar draagt de alinea van _geen_factorprofiel_note het verhaal.
    if _si_kop and not _geen_profiel:
        exec_line = f"{exec_line} {_si_kop}"

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        population="Actieve medewerkers",
        segment_available=bool(data.get("segment_rows")),
        segment_reason=data.get("segment_reason") or "",
        # Zelfde gate als het contextblok en de appendixregel (_enps_cijfers).
        enps_available=_enps_score is not None,
        period_start=data.get("period_start"),
        period_end=data.get("period_end"),
        period_conflict=bool(data.get("period_dates_conflict")),
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        primary_label=primary_label,
        why_cells_html=why_cells,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        cijfers_html=_cijfers_html,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Het antwoord in het kort"),
        # Vlaggen uit de data, zie render_exit_report_html.
        leidraad_html=_leidraad_html(
            ST, data=data, deep_agg=deep_agg, direction_agg=direction_agg,
            startpunt_fk=_primary, has_sdt=_heeft_werkbeleving(sdt_a),
            geen_profiel=_geen_profiel),
        direction_line=_direction_p02_line(direction_agg, _primary, ST,
                                           factor_score=_primary_score),
        brug_zin=_brug,
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
    )

    # ── Behoudscontext (p.04 — vóór factorprofiel) ───────────────────────────
    s += _behoudscontext(
        retention_score=signal,
        stay_intent=avg_si,
        turnover=avg_to,
        engagement=avg_eng,
        intent_resp=data.get("intent_resp"),
        opener_html=ch.opener("Waar staat behoud onder druk?", kicker="Behoudscontext", anchor=LEIDRAAD_ANKERS["context"]),
        # eNPS bij de context i.p.v. op een eigen, vrijwel lege pagina (H13, B9).
        enps_html=_enps_block(_enps_score, _enps_detail),
    )

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    # C3: alleen de samenvattingszin; de bandlijst onder de balken is weg.
    _overzicht_summary, _ = _overzicht_summary_and_bands(
        profile_factors, laagste=[_raster_labels[fk] for fk in _p02_laagste_keys(_shape)])
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary,
                            opener_html=ch.opener("Overzichtsprofiel", anchor=LEIDRAAD_ANKERS["overzicht"]), scan_type=ST)

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    def _ret_factor_detail(fk: str, opener_html: str = "", intro_html: str = "",
                           is_first: bool = True) -> str:
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
        # Geen backslashes of hergebruikte aanhalingstekens in f-string-expressies:
        # dat is pas geldig sinds Python 3.12 (PEP 701) en Railway draait 3.11.
        # Zie tests/test_python311_syntax_guard.py.
        low_key = low_i[0] if low_i else None
        rows = "".join(
            '<tr><td class="iq"'
            + (' style="font-weight:700;"' if ik == low_key else "")
            + f">{_h(q)}"
            + (' <span class="low-tag">laagste score</span>' if ik == low_key else "")
            + f'</td><td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Scores per stelling niet beschikbaar in deze meting.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail hierboven.
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste stelling binnen dit onderwerp</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # Statisch "Eerste managementvraag"-blok bewust verwijderd (template-taal;
        # stond ook al op p.02) — het toelichtingsblok draagt de duiding.
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        deep_block = (_deepening_block(deep_agg[fk], ST, fk, n)
                      if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        # Alleen het eerste onderwerp opent een nieuwe pagina (B9), zie
        # _factor_detail in de Vertrek-renderer.
        # Ook het eerste onderwerp stroomt (fixronde 2 na plan 3a): het hoofdstuk
        # begint onder het overzichtsprofiel als het daar past, en anders op een
        # nieuw vel omdat de sectie als geheel verhuist (.sec.flow). Met een eigen
        # vel bleef het laatste onderwerp alleen op een pagina van 27 tot 37%.
        # is_first bepaalt alleen nog de kop en de intro (aanroeper).
        return f"""<div class="sec flow verd{' verd-eerste' if is_first else ''}">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {low_card}
  {high_card}
  <h3 class="verd-h3">Alle stellingen over dit onderwerp</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            # Geen "(vervolg)" (C12): een volgend onderwerp, geen vervolg.
            _opener = (ch.opener(f"Verdieping: {_lbl}", anchor=LEIDRAAD_ANKERS["verdieping"])
                       if _i == 0 else _ChapterCounter.sub(f"Verdieping: {_lbl}"))
            s += _ret_factor_detail(_pfk, opener_html=_opener,
                                    intro_html=_intro("verdieping") if _i == 0 else "",
                                    is_first=_i == 0)
    else:
        s += f'<div class="sec flow">{ch.opener("Verdieping: onderwerpen met de meeste aandacht", anchor=LEIDRAAD_ANKERS["verdieping"])}<div class="empty-state">{VERDIEPING_GEEN_RANGORDE}</div></div>'

    # ── Werkbeleving (SDT) ────────────────────────────────────────────────────
    # Werkbeleving in twee kolommen via de gedeelde helper (B9). De gate is
    # _heeft_werkbeleving, dezelfde die de leidraad gebruikt: zonder
    # dimensiescores toonde deze pagina een lege kaart en eiste ze toch een
    # hoofdstuknummer op.
    if _heeft_werkbeleving(sdt_a):
        s += _werkbeleving_section(
            sdt_a, sim, data["sdt_items"],
            ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid",
                      anchor=LEIDRAAD_ANKERS["werkbeleving"]))

    # Geen eigen eNPS-hoofdstuk meer (H13, B9): één score op een eigen vel was
    # de leegste pagina van het rapport. Het blok staat nu bij de context, met de
    # tellingen erbij; niet gemeten meldt de regel 'Niet in dit rapport' bij de
    # meetgegevens en de appendixregel (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Per afdeling", anchor=LEIDRAAD_ANKERS["afdelingen"]) if _seg_rows else ch.opener("Per afdeling")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen", anchor=LEIDRAAD_ANKERS["toelichtingen"])}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    # Zie render_exit_report_html: blok eerst, methodiekpagina gate erop (B3).
    _dir_block = _wat_moet_gebeuren_block(_raster_rows, direction_agg, ST, n)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type=ST,
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=(_gespreksopener(deep_agg, ST, _startpunt_fk) if _startpunt_fk
                else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit onderwerp nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda", anchor=LEIDRAAD_ANKERS["agenda"]),
        direction_agg=direction_agg,
        n_total=n,
        direction_block_html=_dir_block,
        brug_zin=_brug,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        # Twee kolommen via de gedeelde helper (B9): de onderwerpstabellen naast
        # elkaar in plaats van onder elkaar, zodat de appendix niet met een paar
        # regels op een tweede vel overloopt.
        s += _appendix_section(
            fa=fa, oim=oim, sim=sim, factor_items_map=data["factor_items_map"],
            sdt_items=data["sdt_items"], scan_type=ST, n=n,
            enps_score=_enps_score, enps_detail=_enps_detail,
            opener_html=ch.opener("Appendix", kicker="Volledige vraagresultaten"),
            sdt_title="Werkbeleving: alle stellingen")

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen", anchor=LEIDRAAD_ANKERS["methodiek"]),
                     ranking_active=not _geen_profiel,
                     direction_active=bool(_dir_block),
                     direction_degraded=bool(_dir_block) and not _raster_rows,
                     deepening_active=bool(deep_agg),
                     org_name=data["org_name"])
    return _doc(f"Loep Behoud · {data['campaign_name']}", s, scan_type="retention")


# ─── Onboarding-exclusive helpers ────────────────────────────────────────────

def _checkpointoverzicht(checkpoints: list[tuple[str, float | None]], opener_html: str = "",
                         enps_html: str = "") -> str:
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
  {enps_html}
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
    # Eén gate voor de werkgeversaanbeveling, zie render_exit_report_html.
    _enps_score, _enps_detail = _enps_cijfers(data)
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
    # Geen losse laagste/hoogste labels meer: cover, pagina twee en de
    # gespreksagenda lezen sinds taak 7 één startpunt (_ob_startpunt_fk).
    _raster_labels = {fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS}

    # Geen raster bij Loep Start: "geen factorprofiel" == geen enkele factor
    # met een score (zelfde staat die exit/retention via _raster_rows zien).
    _geen_profiel = not sorted_f

    # Eén startpunt voor cover, pagina twee en de gespreksagenda (taak 7, C8).
    # De cover noemt dit voortaan "Waar het gesprek begint", en dan mag dat niet
    # een ander onderwerp zijn dan waar de agenda het gesprek laat beginnen.
    # De agenda las _select_priority_factors, pagina twee en de cover lazen
    # top_fkeys respectievelijk de laagste score; bij Loep Start (geen
    # vertrekredenweging) ordenen die alle drie oplopend op dezelfde afgeronde
    # factorgemiddelden, dus met echte data komen ze op hetzelfde onderwerp uit.
    # Ze hier uit één bron halen maakt dat ook zo voor een fixture waarin
    # top_fkeys niet bij factor_avgs past.
    _ob_priority_fkeys = _select_priority_factors(fa, {}, max_n=3)
    _ob_startpunt_fk = _ob_priority_fkeys[0] if _ob_priority_fkeys else None

    # Brugzin (taak 7, B2), zie render_exit_report_html.
    _seg_startpunt = _segment_startpunt(data.get("segment_rows") or [],
                                        data.get("segment_factor_rows"))
    _brug = ("" if _geen_profiel else
             _brugzin(_ob_startpunt_fk, _fl(_ob_startpunt_fk, ST) if _ob_startpunt_fk else "",
                      _seg_startpunt, ST))

    # ── Cover ─────────────────────────────────────────────────────────────────
    # Kale streep als laatste terugval verwijderd (bug B2).
    _ob_primary = (_fl(_ob_startpunt_fk, ST) if _ob_startpunt_fk
                   else GEEN_FACTORPROFIEL_LBL)
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Hoe landen nieuwe medewerkers?",
        stats=[
            ("Respondenten", str(n)),
            _cover_respons_stat(data["completion_pct"]),  # zelfde noemer als de responsbasis
            ("Waar het gesprek begint", _ob_primary),  # C8, zie render_exit_report_html
        ],
    )

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    if _ob_startpunt_fk:
        tf       = _ob_startpunt_fk
        tf_lbl_  = _fl(tf, ST)
        tf_sc    = fa.get(tf)
        tf_col   = _factor_color(tf_sc)
        items_in = fim.get(tf, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item = min(i_scores, key=lambda x: x[2]) if i_scores else None

        why_cells = ""
        if tf_sc is not None:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit onderwerp ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        primary_label = tf_lbl_
        br_mgmt_q     = _mgmt_q(tf, ST)
        br_mgmt_q_source = _bron_laagste_score(
            tf_sc, [(_fl(fk, ST), sc) for fk, sc in sorted_f if fk != tf])
    else:
        # Dezelfde staat als _geen_profiel: _ob_startpunt_fk is leeg precies
        # wanneer geen enkele organisatiefactor een score heeft. De degraded
        # alinea hieronder vertelt wat er dan wel is.
        why_cells     = ""
        primary_label = ""
        br_mgmt_q     = ""
        br_mgmt_q_source = ""

    # Degraded pagina twee (bug B2), zie render_exit_report_html.
    br_degraded_note = ""
    if _geen_profiel:
        br_degraded_note = _geen_factorprofiel_note(
            n,
            drempelzin=(f"Een profiel per onderwerp vraagt minimaal {MIN_AGGREGATE_N} "
                        f"antwoorden; daaronder kleurt één antwoord het beeld te sterk."),
            wel=["het checkpointoverzicht" if signal is not None else "",
                 "de werkbeleving van nieuwe medewerkers" if sdt_a else "",
                 "de werkgeversaanbeveling" if _enps_score is not None else "",
                 "de meetgegevens onderaan deze pagina"],
        )

    # Kernzin (ronde 2, B17): volgt de vorm van het profiel, niet de band van de
    # checkpointscore. Die staat nu met haar band in de onderbouwingsrij eronder.
    # Loep Start heeft geen prioriteringsraster (de rangorde is puur de score) en
    # geen richtingvraag, dus er is hier geen tie-break of richtingtelling te
    # noemen. Het startpunt is dezelfde factor die het why-blok eronder toont.
    _shape = profile_shape(fa)
    _primary = _ob_startpunt_fk
    # Op de getoonde scores, net als _p02_startpunt_gronden bij de andere scans.
    _delta = (_getoond_verschil(sorted_f[0][1], sorted_f[1][1]) if len(sorted_f) > 1 else None)
    exec_line = _p02_opening(
        scan_type=ST, shape=_shape, labels=_raster_labels, primary_key=_primary,
        next_delta=_delta,
        indicatief=_respons_indicatief(data["n_completed"], data["n_invited"]))
    _signal_cell = _p02_signal_cell("Checkpointscore", _score_str(signal) if signal else "",
                                    band_lbl or "")
    _cijfers_html = _p02_cijfers_block([
        _respons_cell(data["n_completed"], data["n_invited"]),
        _signal_cell,
    ])
    # Deze terugval verwijst alleen, hij doet geen uitspraak (spec par. 6.3).
    _verwijst = not exec_line and not (signal and band_lbl)
    if not exec_line:
        # Geen factorprofiel (bug B2). De onderbouwingsrij rendert in die staat
        # niet, dus de checkpointscore blijft hier staan in plaats van uit het
        # rapport te verdwijnen.
        exec_line = (f"{band_lbl} (checkpointscore {_score_str(signal)})."
                     if signal and band_lbl
                     else "Zie het checkpointoverzicht en de meetgegevens voor wat dit rapport wel toont.")

    exec_line = _p02_met_respons(exec_line, completed=data["n_completed"],
                                 invited=data["n_invited"], verwijzing=_verwijst)

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        note=data["n_invited_note"],
        period=data["campaign_name"],
        population="Nieuwe medewerkers in de eerste werkperiode",
        segment_available=bool(data.get("segment_rows")),
        segment_reason=data.get("segment_reason") or "",
        # Zelfde gate als het contextblok en de appendixregel (_enps_cijfers).
        enps_available=_enps_score is not None,
        period_start=data.get("period_start"),
        period_end=data.get("period_end"),
        period_conflict=bool(data.get("period_dates_conflict")),
    )

    # Leidraad (spec par. 4 blok 5), vlaggen uit de data. Loep Start heeft geen
    # verdiepings- en geen richtingvraag (v1.1), dus die twee aggregaten zijn
    # hier leeg. _ob_has_sdt schakelt ook de werkbelevingssectie verderop, zodat
    # de leidraad en die sectie niet uiteen kunnen lopen.
    _ob_has_sdt = _heeft_werkbeleving(sdt_a)
    _ob_leidraad = _leidraad_html(ST, data=data, deep_agg={}, direction_agg={},
                                  startpunt_fk=None, has_sdt=_ob_has_sdt,
                                  geen_profiel=_geen_profiel)
    s += _bestuurlijke_read(
        kernzin=exec_line,
        primary_label=primary_label,
        why_cells_html=why_cells,
        mgmt_q=br_mgmt_q,
        mgmt_q_source=br_mgmt_q_source,
        cijfers_html=_cijfers_html,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Het antwoord in het kort"),
        leidraad_html=_ob_leidraad,
        brug_zin=_brug,
        degraded_note=br_degraded_note,
        why_title=_p02_why_title(_shape),
        scope_note=(ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED if br_degraded_note
                    else ONBOARDING_GEEN_VERDIEPING_NOTE),
    )

    # ── Overzichtsprofiel (p.04) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    # C3: alleen de samenvattingszin; de bandlijst onder de balken is weg.
    _overzicht_summary, _ = _overzicht_summary_and_bands(
        profile_factors, laagste=[_raster_labels[fk] for fk in _p02_laagste_keys(_shape)])
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary,
                            opener_html=ch.opener("Overzichtsprofiel", anchor=LEIDRAAD_ANKERS["overzicht"]), scan_type=ST, stroom_zonder_profiel=False)

    # ── Checkpointoverzicht (p.05 — onboarding-exclusive) ────────────────────
    s += _checkpointoverzicht(checkpoints=[("Huidig checkpoint", signal)],
                              opener_html=ch.opener("Onboardingfases", kicker="Checkpointoverzicht", anchor=LEIDRAAD_ANKERS["context"]),
                              # eNPS bij de context i.p.v. op een eigen,
                              # vrijwel lege pagina (H13, B9).
                              enps_html=_enps_block(_enps_score, _enps_detail))

    # ── Landingskwaliteit per domein (onboarding-exclusive) ───────────────────
    domain_scores = [(_fl(fk, ST), fa.get(fk))
                     for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _landingskwaliteit(domain_scores)

    # ── Factordiepte ×≤3 (prioriteit = laagste score, geen vertrekredenen) ────
    # Dezelfde rangorde als de cover, pagina twee en de gespreksagenda.
    priority_fkeys = _ob_priority_fkeys

    def _ob_factor_detail(fk: str, opener_html: str = "", intro_html: str = "",
                          is_first: bool = True) -> str:
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
        # Geen backslashes of hergebruikte aanhalingstekens in f-string-expressies:
        # dat is pas geldig sinds Python 3.12 (PEP 701) en Railway draait 3.11.
        # Zie tests/test_python311_syntax_guard.py.
        low_key = low_i[0] if low_i else None
        rows = "".join(
            '<tr><td class="iq"'
            + (' style="font-weight:700;"' if ik == low_key else "")
            + f">{_h(q)}"
            + (' <span class="low-tag">laagste score</span>' if ik == low_key else "")
            + f'</td><td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Scores per stelling niet beschikbaar in deze meting.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail (exit-renderer).
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Kwetsbaarste stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Relatief sterkste stelling</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        # Alleen het eerste onderwerp opent een nieuwe pagina (B9), zie
        # _factor_detail in de Vertrek-renderer.
        # Ook het eerste onderwerp stroomt (fixronde 2 na plan 3a): het hoofdstuk
        # begint onder het overzichtsprofiel als het daar past, en anders op een
        # nieuw vel omdat de sectie als geheel verhuist (.sec.flow). Met een eigen
        # vel bleef het laatste onderwerp alleen op een pagina van 27 tot 37%.
        # is_first bepaalt alleen nog de kop en de intro (aanroeper).
        # Loep Start: compactere binnenmaten (.verd-compact), gemeten: zonder
        # die maten paste het eerste onderwerp niet onder de onboardingfactoren
        # en stond het tweede alleen op een vel (32 tot 34%).
        return f"""<div class="sec flow verd verd-compact{' verd-eerste' if is_first else ''}">
  {opener_html or f'<span class="slabel">{_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  <p style="font-size:10px;color:#64748B;margin-bottom:12px;">Lager op dit onderwerp = meer frictie in de onboardingfase.</p>
  {spread}
  {low_card}
  {high_card}
  <h3 class="verd-h3">Alle stellingen over dit onderwerp</h3>
  <table class="item-tbl">{rows}</table>
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            # Geen "Verdieping:" in de paginatitel (spec ronde 2 par. 7): Loep
            # Start heeft geen verdiepingsvragen, deze pagina toont de score en
            # de stellingen van de factor.
            # Geen "(vervolg)" (C12): een volgend onderwerp, geen vervolg.
            _opener = (ch.opener(_lbl, anchor=LEIDRAAD_ANKERS["verdieping"])
                       if _i == 0 else _ChapterCounter.sub(_lbl))
            # Geen SECTION_INTROS["verdieping"] hier (code-review taak 9, fix A):
            # die tekst belooft een automatische vervolgvraag + een
            # gespreksagenda gevuld met wat respondenten kozen. Onboarding
            # heeft in v1 geen richtingdata (DIRECTION_SCAN_TYPES) en geen
            # deepening-set, dus dat is niet waar voor dit rapport. De
            # factordetailpagina leest prima zonder intro.
            s += _ob_factor_detail(_pfk, opener_html=_opener, intro_html="",
                                   is_first=_i == 0)
    else:
        s += f'<div class="sec flow">{ch.opener("Onderwerpen met de meeste aandacht", anchor=LEIDRAAD_ANKERS["verdieping"])}<div class="empty-state">{ONBOARDING_GEEN_RANGORDE}</div></div>'

    # ── Werkbeleving (SDT) — if present ──────────────────────────────────────
    # Twee kolommen via de gedeelde helper (B9); dezelfde gate als de leidraad.
    if _ob_has_sdt:
        s += _werkbeleving_section(
            sdt_a, sim, data["sdt_items"],
            ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid",
                      anchor=LEIDRAAD_ANKERS["werkbeleving"]))

    # eNPS heeft geen eigen hoofdstuk meer: het blok staat bij het
    # checkpointoverzicht (H13, B9), zie _enps_block.

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Per afdeling", anchor=LEIDRAAD_ANKERS["afdelingen"]) if _seg_rows else ch.opener("Per afdeling")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener,
                        hidden_n=data.get("segment_hidden_n", 0))

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen", anchor=LEIDRAAD_ANKERS["toelichtingen"])}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor / Gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    # Primair thema grounded in het laagst scorende item (zelfde aanpak als
    # exit/retention): geen vaste per-factor beslistekst die nooit meebeweegt.
    # Startpunt uit dezelfde bron als de cover en pagina twee (taak 7).
    _ob_primary_fk = _ob_startpunt_fk
    _ob_primary_items = ([(ik, q, oim.get(ik)) for ik, q in fim.get(_ob_primary_fk, []) if oim.get(ik) is not None]
                          if _ob_primary_fk else [])
    _ob_primary_low = min(_ob_primary_items, key=lambda x: x[2]) if _ob_primary_items else None
    # "Het laagst van het hele beeld" keek alleen binnen de eerste factor (spec
    # ronde 2 par. 7). Scoort een stelling in een andere factor even laag of
    # lager, dan sprak de appendix die claim tegen.
    #
    # De vergelijking loopt bewust over ALLE gemeten stellingen
    # (factor_items_map), ook die van factoren waarvan de detailpagina in dit
    # rapport niet rendert (er zijn er hoogstens drie) en ook wanneer de
    # appendix onder zijn drempel blijft. Breder vergelijken kan de claim alleen
    # verzwakken, nooit versterken: wat de laagste van alles is, is zeker de
    # laagste van wat de lezer ziet. Andersom zou een onzichtbare lagere
    # stelling een exclusieve claim overeind houden die feitelijk niet klopt.
    _ob_alle_scores = [oim.get(_ik) for _items in fim.values() for _ik, _q in _items]
    _ob_thema_scores = [_sc for _ik, _q, _sc in _ob_primary_items]
    _ob_laagste_van_alles, _ob_uniek_in_rapport = _laagste_stelling_reikwijdte(
        _ob_primary_low[2] if _ob_primary_low else None, _ob_alle_scores)
    _, _ob_uniek_in_thema = _laagste_stelling_reikwijdte(
        _ob_primary_low[2] if _ob_primary_low else None, _ob_thema_scores)
    _ob_primary_theme = (
        _laagste_stelling_zin(_fl(_ob_primary_fk, ST), _ob_primary_low[1],
                              _ob_primary_low[2],
                              laagste_van_alles=_ob_laagste_van_alles,
                              uniek=(_ob_uniek_in_rapport if _ob_laagste_van_alles
                                     else _ob_uniek_in_thema))
    ) if _ob_primary_low else _fl(_ob_startpunt_fk, ST) if _ob_startpunt_fk else ""

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
            # Zelfde vlag als de sectie zelf en als de leidraad; sdt_overview_rows
            # bestond hier niet meer nadat de werkbeleving naar de gedeelde
            # helper verhuisde (B9).
            "de werkbeleving van nieuwe medewerkers" if _ob_has_sdt else "",
            "de meetgegevens op de openingspagina"])
        _agenda_degraded_note = (
            f"Wat dit rapport wel laat zien: {_agenda_wel}. Een score per onderwerp "
            f"ontbreekt, dus er is geen onderbouwde volgorde en geen eerste "
            f"gesprekspunt dat uit de cijfers volgt.")

    # Geen primary_why meer (spec ronde 2 par. 7): die regel zei "Laagst
    # scorende stelling in het cijferbeeld (5.1/10)" onder een kaart die precies
    # dat al zegt, met hetzelfde getal. De helper die hem opbouwde had daarna nul
    # aanroepers en is verwijderd; zijn rijkere variant (de meest gekozen
    # toelichting uit de verdieping) kon bij Loep Start sowieso nooit vullen. De
    # constatering staat nu één keer, in de zin erboven.
    # Tweede punt uit dezelfde rangorde als het startpunt (_ob_priority_fkeys),
    # niet uit een tweede sortering op sorted_f: bij Loep Start leveren die
    # dezelfde volgorde, maar twee bronnen kunnen stil gaan afwijken.
    _ob_second_fk = _ob_priority_fkeys[1] if len(_ob_priority_fkeys) > 1 else None
    # Deelt het tweede punt de laagste GETOONDE score met het startpunt, dan is
    # het niet de "tweede laagste": pagina twee noemt beide op die score
    # (stresstest na plan 3a, observatie 4, scenario 20: 5.3 en 5.3). Zelfde
    # bron als de kop, _p02_laagste_keys.
    _ob_laagste = _p02_laagste_keys(_shape)
    if not _ob_second_fk:
        _second_why = None
    elif _ob_second_fk in _ob_laagste:
        _anderen = [_raster_labels[fk] for fk in _ob_laagste if fk != _ob_second_fk]
        _second_why = (f"Deelt de laagste score ({_score_str(_shape['low_score'])}) met "
                       f"{', '.join(_anderen)}.")
    else:
        _second_why = "Tweede laagste score in het overzichtsprofiel."

    _ob_agenda_q = (_mgmt_q(_ob_startpunt_fk, ST) if _ob_startpunt_fk
                    else (nsp.get("first_decision") or ""))
    s += _eerste_managementspoor(
        primary_theme=_ob_primary_theme,
        second_point=(f"{_fl(_ob_second_fk, ST)} ({_score_str(fa.get(_ob_second_fk))})"
                      if _ob_second_fk else ""),
        mgmt_q=_ob_agenda_q,
        # Pagina twee en deze agenda kiezen het startpunt sinds taak 7 uit één
        # bron (_ob_startpunt_fk), dus de opener is dezelfde zin. De
        # gelijkheidstest blijft staan als goedkope guard: hij is er om te
        # voorkomen dat de verwijzing ooit stil onwaar wordt.
        opener_op_p02=(not br_degraded_note and _ob_agenda_q == br_mgmt_q),
        review_when="Plan een vervolgmoment rond het volgende checkpoint: bespreek dan wat er is opgepakt en of dit onderwerp nog voorrang verdient.",
        primary_why=None,
        second_why=_second_why,
        opener_html=ch.opener("Gespreksagenda", kicker="Eerste managementspoor", anchor=LEIDRAAD_ANKERS["agenda"]),
        degraded_note=_agenda_degraded_note,
        brug_zin=_brug,
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        # Twee kolommen via de gedeelde helper (B9): de onderwerpstabellen naast
        # elkaar in plaats van onder elkaar, zodat de appendix niet met een paar
        # regels op een tweede vel overloopt.
        s += _appendix_section(
            fa=fa, oim=oim, sim=sim, factor_items_map=data["factor_items_map"],
            sdt_items=data["sdt_items"], scan_type=ST, n=n,
            enps_score=_enps_score, enps_detail=_enps_detail,
            opener_html=ch.opener("Appendix", kicker="Volledige vraagresultaten"),
            sdt_title="Werkbeleving: stellingen bij het checkpoint")

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen", anchor=LEIDRAAD_ANKERS["methodiek"]),
                     ranking_active=not _geen_profiel,
                     org_name=data["org_name"])
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
