"""De vertrekmaand bij Loep Vertrek (spec 2026-10-07 par. 1 en 2).

Eén bron voor de vorm ("JJJJ-MM"), de Nederlandse maandnamen, het venster dat
de vragenlijst aanbiedt en de servervalidatie. De vertrekmaand is een
quasi-identificerend gegeven: hij staat alleen in respondents.exit_month (geen
kolomgrant voor klanten, migrations/2026_07_13_lock_individual_data_to_operator.sql)
en het rapport toont hem alleen als periode, met de randregel in
report_html._uitstroomperiode.
"""
from __future__ import annotations

import re
from datetime import date

MAANDEN_NL = ("januari", "februari", "maart", "april", "mei", "juni", "juli",
              "augustus", "september", "oktober", "november", "december")
EXIT_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")

# Het venster van de keuzelijst, gerekend vanaf de maand van vandaag (NL-tijd).
# Twee jaar terug dekt een terugblikkende meting; een half jaar vooruit dekt
# wie de vragenlijst invult vóór de laatste werkdag.
EXIT_MONTH_PAST_MONTHS = 24
EXIT_MONTH_FUTURE_MONTHS = 6
# Speling voor de servercontrole: de pagina kan vóór een maandwissel geladen
# zijn en erna verstuurd worden.
_SPELING_MAANDEN = 1


def _verschuif(jaar: int, maand: int, delta: int) -> tuple[int, int]:
    index = jaar * 12 + (maand - 1) + delta
    return index // 12, index % 12 + 1


def _sleutel(jaar: int, maand: int) -> str:
    return "%04d-%02d" % (jaar, maand)


def maand_label(sleutel: str) -> str:
    """"2025-03" -> "maart 2025"."""
    jaar, maand = sleutel.split("-")
    return MAANDEN_NL[int(maand) - 1] + " " + jaar


def exit_month_options(vandaag: date) -> list[dict[str, str]]:
    """De keuzelijst, nieuwste maand eerst."""
    sleutels = [_sleutel(*_verschuif(vandaag.year, vandaag.month, d))
                for d in range(EXIT_MONTH_FUTURE_MONTHS, -EXIT_MONTH_PAST_MONTHS - 1, -1)]
    return [{"value": s, "label": maand_label(s)} for s in sleutels]


def validate_survey_exit_month(waarde: object, vandaag: date) -> str:
    """De maand als hij geldig is, anders ValueError met een leesbare melding.

    "Zeg ik liever niet" komt hier nooit aan: de vragenlijst stuurt dan niets.
    Een andere waarde dan JJJJ-MM is dus een fout en wordt geweigerd, niet stil
    weggegooid.
    """
    if not isinstance(waarde, str) or not EXIT_MONTH_RE.fullmatch(waarde):
        raise ValueError("De vertrekmaand heeft geen geldige vorm.")
    oudste = _sleutel(*_verschuif(vandaag.year, vandaag.month,
                                  -EXIT_MONTH_PAST_MONTHS - _SPELING_MAANDEN))
    nieuwste = _sleutel(*_verschuif(vandaag.year, vandaag.month,
                                    EXIT_MONTH_FUTURE_MONTHS + _SPELING_MAANDEN))
    if not oudste <= waarde <= nieuwste:
        raise ValueError("De vertrekmaand valt buiten de maanden die de vragenlijst aanbiedt.")
    return waarde
