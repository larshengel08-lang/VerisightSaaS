"""Uitzonderingen rond rapportgeneratie die geen fout zijn."""
from __future__ import annotations


class ReportNotAvailable(ValueError):
    """Het rapport bestaat volgens een bedrijfsregel (nog) niet, bijvoorbeeld
    omdat de meting nog open staat of er te weinig antwoorden zijn.

    De melding is vaste tekst (hooguit met een ingesteld getal) en mag zo naar
    de klant: de route maakt er een 422 van, zonder Sentry-melding. Gebruik
    hem nooit voor een bug; een onverwachte fout hoort een gemelde 500 te
    worden."""
