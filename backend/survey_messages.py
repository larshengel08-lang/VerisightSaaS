"""Foutmeldingen die een respondent letterlijk leest na het versturen.

De vragenlijst (templates/survey.html) toont een string-`detail` van een
HTTPException ongewijzigd in de statusregel boven het formulier. Technische
redenen (vragenset-versie, onbekende optiesleutel, ontbrekende itemcodes)
zeggen een respondent niets; die krijgt een zin waar hij iets mee kan, en de
precieze reden gaat als warning naar de log (Fail Loud voor de operator).
Spec 2026-10-09 par. 4, plan polijstronde Taak 12.

Let op Railway (Python 3.11): geen PEP 701-f-strings hieronder.
"""
from __future__ import annotations

import logging

from fastapi import HTTPException

logger = logging.getLogger("loep.survey")

# Het formulier op het scherm past niet meer bij wat de server verwacht
# (oude vragenset, verkeerde factor, onbekende optie): opnieuw laden helpt.
SURVEY_RELOAD_MESSAGE = (
    "Een deel van je antwoorden past niet meer bij de vragen op je scherm. "
    "Vernieuw de pagina, kijk je antwoorden na en verstuur opnieuw."
)

# Een verplichte vraag ontbreekt in de inzending.
SURVEY_INCOMPLETE_MESSAGE = (
    "Een of meer verplichte vragen zijn nog niet beantwoord. "
    "Ga terug door de stappen en vul ze aan."
)


# De redenen bevatten waarden die de client zelf meestuurt (factor_key,
# optiesleutels, question_set_version; geen lengtegrens in het schema). Die
# gaan nooit onbewerkt de log of de Sentry-breadcrumbs in: controletekens
# worden ge-escaped (geen nep-logregels via een newline) en de reden wordt
# begrensd. Langste vaste reden is ~70 tekens, dus 160 laat ruimte voor een
# normale sleutel en kapt alleen misbruik af.
LOG_REASON_MAX = 160


def _log_veilig(reason: str) -> str:
    """Eén regel, begrensd: repr() escapet newlines en andere controletekens."""
    veilig = repr(str(reason))[1:-1]
    if len(veilig) > LOG_REASON_MAX:
        veilig = veilig[:LOG_REASON_MAX] + "...[afgekapt]"
    return veilig


def reject_stale_answers(reason: str, *, campaign_id: object = None) -> HTTPException:
    """422 met SURVEY_RELOAD_MESSAGE; de precieze reden staat in de log."""
    logger.warning("Inzending geweigerd (campagne %s): %s", campaign_id, _log_veilig(reason))
    return HTTPException(status_code=422, detail=SURVEY_RELOAD_MESSAGE)


def reject_incomplete(reason: str) -> HTTPException:
    """422 met SURVEY_INCOMPLETE_MESSAGE; de precieze reden staat in de log."""
    logger.warning("Onvolledige inzending geweigerd: %s", _log_veilig(reason))
    return HTTPException(status_code=422, detail=SURVEY_INCOMPLETE_MESSAGE)
