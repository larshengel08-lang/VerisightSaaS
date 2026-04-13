from __future__ import annotations

from typing import Any


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport is opgebouwd uit verkorte vraagblokken die inhoudelijk zijn geïnspireerd door bestaande wetenschappelijke literatuur. "
            "Het gaat nadrukkelijk niet om volledige schaalafnames of een diagnostisch instrument. "
            "De uitkomsten zijn bedoeld voor prioritering en gesprek, niet voor een individueel oordeel of harde voorspelling."
        ),
        "method_text": (
            "Elke respondent krijgt een frictiescore op een schaal van 1 tot 10. "
            "Een hogere score betekent meer signalen van ontevredenheid of frictie in de werkomgeving. "
            "De score is indicatief en bedoeld als gespreksinput, niet als causale voorspelling, benchmark of objectief oordeel. "
            "De score is een gewogen gemiddelde van zeven factoren:"
        ),
        "weight_rows": [
            ["Factor", "Gewicht", "Richting in literatuur"],
            ["Leiderschap", "2.5 ×", "In de literatuur sterk geassocieerd met vrijwillig verloop (o.a. LMX-onderzoek)"],
            ["SDT Werkbeleving", "2.0 ×", "Breed signaal voor motivatie, betrokkenheid en retentie"],
            ["Psychologische veiligheid & cultuurmatch", "1.5 ×", "Psychologische veiligheid en waardenfit hangen samen met retentie"],
            ["Groeiperspectief", "1.5 ×", "Ontwikkel- en perspectiefsignaal in de literatuur (JD-R)"],
            ["Beloning & voorwaarden", "1.0 ×", "Hygiënefactor — drempelwaarde-effect"],
            ["Werkbelasting", "1.0 ×", "Werkbelasting werkt vaak als versterkende contextfactor (JD-R)"],
            ["Rolhelderheid", "1.0 ×", "Basale verwachting (Rizzo, House & Lirtzman, 1970)"],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["LAAG", "< 4.5", "Overwegend positief beeld. Er zijn relatief weinig signalen van werkfrictie in de antwoorden."],
            ["MIDDEN", "4.5–7.0", "Gemengd beeld. Er zijn meerdere aandachtspunten, maar de uitkomst vraagt vooral nadere verificatie."],
            ["HOOG", "≥ 7.0", "Sterk signaal van ervaren werkfrictie. Dit vraagt om nadere analyse, niet automatisch om een harde conclusie."],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    return {
        "title": "Patronen & Vertrekreden",
        "intro": (
            "Deze pagina combineert hoofdredenen, meespelende factoren en een indicatieve duiding van werkinvloed. "
            "De uitkomsten helpen om patronen te verkennen, niet om één causale vertrekverklaring vast te stellen."
        ),
        "summary_title": None,
        "signal_profile_text": None,
    }
