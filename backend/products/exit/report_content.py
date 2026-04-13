from __future__ import annotations

from typing import Any


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport gebruikt verkorte vraagblokken die inhoudelijk zijn geïnspireerd door bestaande wetenschappelijke literatuur. "
            "Het gaat nadrukkelijk niet om volledige schaalafnames of een diagnostisch instrument. "
            "De uitkomsten zijn bedoeld voor vertrekduiding, prioritering en managementgesprek, niet voor een individueel oordeel of harde voorspelling."
        ),
        "method_text": (
            "Elke respondent krijgt een frictiescore op een schaal van 1 tot 10. "
            "Een hogere score betekent meer signalen van ervaren werkfrictie rondom vertrek. "
            "De score is indicatief en bedoeld als gespreksinput, niet als causale voorspelling, benchmark of objectief oordeel. "
            "De score is een gewogen gemiddelde van zeven factoren:"
        ),
        "weight_rows": [
            ["Factor", "Gewicht", "Richting in literatuur"],
            ["Leiderschap", "2.5 ×", "Sterk gekoppeld aan vrijwillig verloop in de literatuur en vaak direct relevant in vertrekduiding."],
            ["SDT-werkbeleving", "2.0 ×", "Breed signaal voor autonomie, competentie en verbondenheid in de werksituatie."],
            ["Psychologische veiligheid & cultuurmatch", "1.5 ×", "Veiligheid, fit en cultuur beïnvloeden of signalen bespreekbaar worden en of mensen willen blijven."],
            ["Groeiperspectief", "1.5 ×", "Ontwikkelruimte en perspectief keren vaak terug in vrijwillig vertrek."],
            ["Beloning & voorwaarden", "1.0 ×", "Beloning werkt vaak als drempel- of fairnessfactor, niet altijd als enige verklaring."],
            ["Werkbelasting", "1.0 ×", "Werkdruk werkt vaak als versterkende contextfactor."],
            ["Rolhelderheid", "1.0 ×", "Onduidelijkheid in prioriteiten of verwachtingen kan vertrek versnellen."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["LAAG", "< 4.5", "Overwegend positief beeld. Er zijn relatief weinig signalen van terugkerende werkfrictie rondom vertrek."],
            ["MIDDEN", "4.5–7.0", "Gemengd beeld. Er zijn meerdere aandachtspunten, maar de uitkomst vraagt vooral nadere verificatie."],
            ["HOOG", "≥ 7.0", "Sterk signaal van ervaren werkfrictie. Dit vraagt om nadere analyse, niet automatisch om een harde conclusie."],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    return {
        "title": "Vertrekredenen & werksignalen",
        "intro": (
            "Deze pagina combineert hoofdredenen, meespelende factoren, eerdere signalering en een indicatieve duiding van werkinvloed. "
            "De uitkomsten helpen om vertrekpatronen te verkennen en managementvragen te richten, niet om één causale vertrekverklaring vast te stellen."
        ),
        "summary_title": None,
        "signal_profile_text": None,
    }
