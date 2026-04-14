from __future__ import annotations

from typing import Any


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    strong_work_signal_pct: float | None,
    signal_visibility_average: float | None,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de scherpste werkfactoren"
    top_reason_text = (top_exit_reason_label or "het huidige vertrekbeeld").lower()

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        profile_body = (
            f"{top_reason_text.capitalize()} komt relatief vaak terug en valt samen met een breed werksignaal. "
            f"De scherpste managementduiding zit nu vooral in {top_factor_text}."
        )
    elif strong_work_signal_pct is not None:
        profile_body = (
            f"{top_reason_text.capitalize()} is zichtbaar, maar het werkgerelateerde beeld blijft gemengd. "
            f"Gebruik vooral {top_factor_text} om te toetsen waar het vertrekverhaal bestuurlijk het meest beïnvloedbaar lijkt."
        )
    else:
        profile_body = (
            f"{top_reason_text.capitalize()} geeft het eerste vertrekhaakje. "
            f"Gebruik {top_factor_text} om te bepalen welk deel van dit vertrekbeeld vooral managementverificatie vraagt."
        )

    if signal_visibility_average is not None and signal_visibility_average < 3:
        management_question = (
            f"Welke signalen rond {top_reason_text} kwamen te laat of onvoldoende veilig boven tafel, "
            f"en hoe hangt dat samen met {top_factor_text}?"
        )
    elif top_contributing_reason_label:
        management_question = (
            f"Wijst {top_reason_text} vooral op een breed werkgerelateerd vertrekbeeld, "
            f"of laat {top_contributing_reason_label.lower()} zien waar management eerst dieper moet toetsen?"
        )
    else:
        management_question = (
            f"Welk deel van {top_reason_text} valt nu het duidelijkst samen met {top_factor_text} "
            "en dus met beïnvloedbare werkfrictie?"
        )

    next_step = (
        f"Gebruik {top_factor_text} als eerste managementspoor en voer daar één gericht gesprek over met HR, MT of betrokken leidinggevenden. "
        "Koppel die verificatie daarna direct aan een concrete 30-90 dagenactie."
    )

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van het vertrekbeeld",
        "findings_title": "Scherpste managementlezing",
        "cards": [
            {
                "title": "Vertrekbeeld nu",
                "body": profile_body,
            },
            {
                "title": "Eerste managementvraag",
                "body": management_question,
            },
            {
                "title": "Eerste logische stap",
                "body": next_step,
            },
        ],
    }


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
        "summary_title": "Vertrekbeeld in samenhang",
        "signal_profile_title": "Hoe lees je dit vertrekbeeld?",
        "signal_profile_text": (
            "Lees hoofdredenen, meespelende factoren, eerdere signalering en werksignalen als één managementverhaal. "
            "De hoofdreden geeft het eerste vertrekhaakje; de werkfactoren en werksignalen laten zien waar vervolgvragen bestuurlijk het meeste opleveren."
        ),
    }


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Werkhypothesen",
        "intro_text": (
            "Onderstaande hypothesen zijn afgeleid van scorepatronen, vertrekredenen, meespelende factoren en eerdere signalering. "
            "Ze zijn bedoeld om vertrekduiding te toetsen in gesprek met HR, leidinggevenden of aanvullende data, niet om achteraf één sluitende oorzaak vast te stellen."
        ),
    }


def get_next_steps_payload(*, top_focus_labels: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de scherpste werkfactoren"
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik ExitScan niet alleen als terugblik, maar als managementinstrument om het vertrekbeeld te toetsen, te prioriteren en te vertalen naar zichtbare verbeteracties."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Voer binnen 2 weken één gericht managementgesprek",
                "body": (
                    f"Deel de managementsamenvatting met MT en betrokken leidinggevenden en focus het eerste gesprek expliciet op {focus_text}. "
                    "Gebruik het rapport om te bepalen welke hypothese eerst getoetst moet worden."
                ),
            },
            {
                "number": "2",
                "title": "Koppel het vertrekbeeld aan één eigenaar per thema",
                "body": (
                    "Wijs per aandachtspunt een verantwoordelijke aan. "
                    "Zonder eigenaar blijft vertrekduiding een constatering in plaats van een verbeterroute."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal de duiding naar maximaal 3 gerichte acties",
                "body": (
                    "Kies alleen acties die logisch voortkomen uit de getoetste hypothesen en de scherpste werkfactoren. "
                    "Vermijd brede programma's voordat duidelijk is waar het patroon echt zit."
                ),
            },
            {
                "number": "4",
                "title": "Leg een evaluatiemoment vast binnen 90 dagen",
                "body": (
                    "Plan direct wanneer je terugkijkt of de gekozen acties zijn uitgevoerd en of dezelfde signalen in een volgende exitbatch terugkeren."
                ),
            },
        ],
    }
