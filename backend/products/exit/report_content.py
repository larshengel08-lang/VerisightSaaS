from __future__ import annotations

from typing import Any

from backend.products.exit.definition import SCAN_DEFINITION
from backend.products.shared.management_language import (
    MANAGEMENT_BAND_LABELS,
    management_context_label,
)


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]


EXIT_DECISION_BY_FACTOR = {
    "leadership": (
        "Beslis eerst of dit vooral een leidinggevend patroon in enkele teams is of een breder MT-thema dat gezamenlijke opvolging vraagt."
    ),
    "culture": (
        "Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat MT-aandacht en opvolging vraagt."
    ),
    "growth": (
        "Beslis of de grootste ingreep nu moet zitten in zicht op perspectief, het gesprek daarover of feitelijke ontwikkelruimte."
    ),
    "compensation": (
        "Beslis of de kern nu ligt in hoogte, ervaren fairness of uitlegbaarheid van voorwaarden en welke groep eerst opvolging vraagt."
    ),
    "workload": (
        "Beslis eerst waar structurele druk echt verlicht moet worden en welk team of welke rol als eerste managementingreep vraagt."
    ),
    "role_clarity": (
        "Beslis of het probleem nu vooral zit in prioriteiten, rolgrenzen of onduidelijke besluitvorming, en waar dat eerst hersteld moet worden."
    ),
}

EXIT_OWNER_BY_FACTOR = {
    "leadership": "HR business partner met betrokken leidinggevende",
    "culture": "HR lead met betrokken MT-lid",
    "growth": "HR development-owner met betrokken leidinggevende",
    "compensation": "HR lead met MT of directie",
    "workload": "Betrokken leidinggevende met HR en operations",
    "role_clarity": "Betrokken leidinggevende met HR business partner",
}


def _exit_review_moment_text(focus_text: str) -> str:
    return (
        f"Plan binnen 60-90 dagen een review op {focus_text.lower()}: wat is gekozen, wat is uitgevoerd "
        "en welke signalen keren terug in de volgende exitbatch of in managementgesprekken."
    )


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    strong_work_signal_pct: float | None,
    signal_visibility_average: float | None,
    total_replacement_cost_eur: float | None = None,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de scherpste werkfactoren"
    top_reason_text = (top_exit_reason_label or "het huidige vertrekbeeld").lower()
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = (
        EXIT_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Kies eerst of {top_factor_text} vooral een lokaal managementspoor of een breder organisatievraagstuk vormen."
    )
    first_owner = (
        EXIT_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR business partner met betrokken leidinggevende"

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        profile_body = (
            f"{top_reason_text.capitalize()} komt relatief vaak terug en valt samen met een breed werksignaal. "
            f"De scherpste managementduiding zit nu vooral in {top_factor_text}."
        )
    elif strong_work_signal_pct is not None:
        profile_body = (
            f"{top_reason_text.capitalize()} is zichtbaar, maar het werkgerelateerde beeld vraagt nog nadere toetsing. "
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

    if signal_visibility_average is None:
        visibility_value = "Nog in opbouw"
        visibility_body = (
            "Zodra meer exitresponses binnen zijn laat ExitScan zien of signalen vooraf zichtbaar of bespreekbaar waren."
        )
    elif signal_visibility_average >= 4:
        visibility_value = "Signalen waren zichtbaar"
        visibility_body = (
            "Twijfel of vertrek kwam niet volledig uit de lucht vallen. Toets vooral waar opvolging of escalatie te laat kwam."
        )
    elif signal_visibility_average >= 3:
        visibility_value = "Signalen waren deels zichtbaar"
        visibility_body = (
            "Er waren aanwijzingen, maar nog geen scherp of breed gesprek. Kijk waar opvolging tussen wal en schip viel."
        )
    else:
        visibility_value = "Signalen bleven onder de radar"
        visibility_body = (
            "Gebruik dit om te onderzoeken waar twijfels te laat zichtbaar werden of onvoldoende veilig bespreekbaar waren."
        )

    executive_intro = (
        f"ExitScan maakt het vertrekbeeld bestuurlijk leesbaar: {top_reason_text} is nu het eerste vertrekhaakje, "
        f"terwijl {top_factor_text} laten zien waar management het meeste kan toetsen en verbeteren."
    )
    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        executive_intro += (
            " De antwoorden wijzen daarbij relatief breed op beïnvloedbare werkfrictie, wat het rapport vooral bruikbaar maakt "
            "voor prioritering, eigenaarschap en een gericht managementgesprek."
        )
    else:
        executive_intro += (
            " Gebruik dit rapport daarom als vertrekduiding en verificatiespoor, niet als sluitende oorzaakverklaring."
        )

    trust_note = (
        "Lees ExitScan als managementsamenvatting van vertrekpatronen. Het rapport bundelt signalen, werkfactoren en hypotheses "
        "tot een bestuurlijk gesprek, zonder causaliteit, diagnose of harde voorspellingen te claimen. "
        "De uitkomst is indicatief, gegroepeerd en bedoeld voor prioritering en verificatie. "
        "Detailweergave start pas vanaf 5 responses, patroonanalyse pas vanaf 10 en segmenten verschijnen alleen bij voldoende n. "
        "ExitScan is methodisch verdedigbaar, maar niet extern gevalideerd als diagnostisch instrument."
    )

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        boardroom_relevance = (
            f"Een relatief groot deel van de exitbatch wijst op beïnvloedbare werkfrictie rond {top_factor_text}. "
            "Daardoor is dit niet alleen HR-nazorg, maar een bestuurlijk prioriteitsspoor voor leiding, inrichting en opvolging."
        )
    else:
        boardroom_relevance = (
            f"Het vertrekbeeld is nog niet breed genoeg voor grote conclusies, maar wel scherp genoeg om {top_factor_text} "
            "als bestuurlijk verificatiespoor te behandelen."
        )

    exposure_value = None
    exposure_body = (
        "Gebruik deze noot alleen als indicatieve exposure op basis van interne vervangingskosten van de huidige exitbatch, "
        "niet als bewezen besparingsclaim of ROI."
    )
    if total_replacement_cost_eur is not None and total_replacement_cost_eur > 0:
        if total_replacement_cost_eur >= 1_000_000:
            exposure_value = f"EUR {total_replacement_cost_eur / 1_000_000:.1f} mln"
        else:
            exposure_value = f"EUR {round(total_replacement_cost_eur / 1000):.0f}k"

    boardroom_cards = [
        {
            "title": "Wat speelt nu",
            "value": top_exit_reason_label or "Nog geen duidelijk vertrekbeeld",
            "body": profile_body,
        },
        {
            "title": "Waarom telt dit nu",
            "value": "Bestuurlijke relevantie",
            "body": boardroom_relevance,
        },
        {
            "title": "Waar zit de meeste druk",
            "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
            "body": f"{top_factor_text.capitalize()} kleuren nu het vertrekbeeld het sterkst en verdienen daarom de meeste managementaandacht.",
        },
        {
            "title": "Wat vraagt verificatie",
            "value": management_context_label("verification"),
            "body": management_question,
        },
        {
            "title": "Eerste besluit",
            "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
            "body": first_decision,
        },
    ]
    if exposure_value:
        boardroom_cards.append({
            "title": "Indicatieve exposure",
            "value": exposure_value,
            "body": exposure_body,
        })

    boardroom_watchout = (
        "Lees dit niet als bewijs van de ene oorzaak van vertrek en ook niet als garantie dat een interventie het patroon oplost. "
        "ExitScan helpt sneller wegen waar management moet toetsen en kiezen, niet om achteraf absolute zekerheid te claimen."
    )

    executive_compact_card = None
    if signal_visibility_average is not None:
        executive_compact_card = {
            "title": "Eerdere signalering",
            "value": visibility_value,
            "body": visibility_body,
        }

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van het vertrekbeeld",
        "findings_title": "Scherpste managementlezing",
        "executive_title": "Vertrekduiding voor HR, MT en directie",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor bestuur en management",
        "trust_note": trust_note,
        "executive_compact_card": executive_compact_card,
        "boardroom_title": "Bestuurlijke handoff",
        "boardroom_intro": (
            "Deze bestuurlijke handoff helpt een sponsor, MT of directie snel zien wat nu speelt, waarom het telt, "
            "waar de meeste druk zit en wat vooral eerst geverifieerd moet worden."
        ),
        "boardroom_cards": boardroom_cards,
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": boardroom_watchout,
        "highlight_cards": [
            {
                "title": "Vertrekbeeld nu",
                "value": (top_exit_reason_label or "Nog geen duidelijke hoofdreden"),
                "body": profile_body,
            },
            {
                "title": "Scherpste werkfactoren",
                "value": top_factor_value,
                "body": (
                    f"Gebruik {top_factor_text} als eerste verificatiespoor om te bepalen welk deel van het vertrekverhaal bestuurlijk het meest beïnvloedbaar is."
                ),
            },
            {
                "title": "Wat vraagt verificatie",
                "value": management_context_label("verification"),
                "body": management_question,
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg direct wie het eerste verificatiespoor trekt, zodat vertrekduiding niet blijft hangen in analyse of gesprek.",
            },
            {
                "title": "Eerdere signalering",
                "value": visibility_value,
                "body": visibility_body,
            },
        ],
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
                "title": "Waar zit de meeste druk",
                "body": f"{top_factor_text.capitalize()} kleuren nu het vertrekbeeld het sterkst en verdienen daarom de meeste managementaandacht.",
            },
            {
                "title": "Wat vraagt verificatie",
                "body": management_question,
            },
            {
                "title": "Eerste logische stap",
                "body": (
                    f"Vertaal {top_factor_text.lower()} binnen 30 dagen naar één gerichte verbeteractie met duidelijke eigenaar "
                    "en zichtbare opvolging."
                ),
            },
        ],
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport vertaalt exitdata naar vertrekduiding die bestuurlijk leesbaar is. "
            "De methodiek is compact en nadrukkelijk geen volledig diagnostisch instrument; de uitkomst is bedoeld voor prioritering, gesprek en opvolging. "
            "De labels hieronder zijn managementtaal bovenop ongewijzigde interne scorebanden."
        ),
        "method_text": (
            "Elke respondent krijgt een frictiescore op een schaal van 1 tot 10. "
            "Een hogere score betekent meer signalen van ervaren werkfrictie rondom vertrek. "
            "Gebruik de score als samenvatting van het vertrekbeeld, niet als causale voorspelling, benchmark of objectief oordeel. "
            "De score is een gewogen gemiddelde van zeven factoren:"
        ),
        "weight_rows": [
            ["Factor", "Gewicht", "Richting in literatuur"],
            ["Leiderschap", "2.5 x", "Sterk gekoppeld aan vrijwillig verloop in de literatuur en vaak direct relevant in vertrekduiding."],
            ["SDT-werkbeleving", "2.0 x", "Breed signaal voor autonomie, competentie en verbondenheid in de werksituatie."],
            ["Psychologische veiligheid & cultuurmatch", "1.5 x", "Veiligheid, fit en cultuur beïnvloeden of signalen bespreekbaar worden en of mensen willen blijven."],
            ["Groeiperspectief", "1.5 x", "Ontwikkelruimte en perspectief keren vaak terug in vrijwillig vertrek."],
            ["Beloning & voorwaarden", "1.0 x", "Beloning werkt vaak als drempel- of fairnessfactor, niet altijd als enige verklaring."],
            ["Werkbelasting", "1.0 x", "Werkdruk werkt vaak als versterkende contextfactor."],
            ["Rolhelderheid", "1.0 x", "Onduidelijkheid in prioriteiten of verwachtingen kan vertrek versnellen."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            [MANAGEMENT_BAND_LABELS["LAAG"], "< 4.5", "Het vertrekbeeld oogt voorlopig stabiel. Er zijn relatief weinig terugkerende signalen van werkfrictie rondom vertrek."],
            [MANAGEMENT_BAND_LABELS["MIDDEN"], "4.5-7.0", "Er zijn zichtbare aandachtspunten die vooral nadere verificatie en prioritering vragen."],
            [MANAGEMENT_BAND_LABELS["HOOG"], ">= 7.0", "De ervaren werkfrictie vraagt directe managementaandacht, zonder automatisch een harde conclusie te bewijzen."],
        ],
        "trust_rows": [
            ["Wat dit product wel is", TRUST_CONTRACT["what_it_is"]],
            ["Niet voor bedoeld", TRUST_CONTRACT["what_it_is_not"]],
            ["Hoe je de output leest", TRUST_CONTRACT["how_to_read"]],
            ["Privacy & rapportage", TRUST_CONTRACT["privacy_boundary"]],
            ["Bewijsstatus nu", TRUST_CONTRACT["evidence_status"]],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    return {
        "title": "Vertrekbeeld, redenen & signalen van werkfrictie",
        "intro": (
            "Deze pagina combineert hoofdredenen, meespelende factoren, eerdere signalering en een indicatieve duiding van werkinvloed. "
            "De uitkomsten helpen om vertrekpatronen te verkennen en managementvragen te richten, niet om één causale vertrekverklaring vast te stellen."
        ),
        "summary_title": "Vertrekbeeld in samenhang",
        "signal_profile_title": "Hoe lees je dit vertrekbeeld?",
        "signal_profile_text": (
            "Lees hoofdredenen, meespelende factoren, eerdere signalering en signalen van werkfrictie als een managementverhaal. "
            "De hoofdreden geeft het eerste vertrekhaakje; de werkfactoren en signalen van werkfrictie laten zien waar vervolgvragen bestuurlijk het meeste opleveren."
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


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de scherpste werkfactoren"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = (
        EXIT_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Kies eerst of {focus_text.lower()} vooral een lokaal managementspoor of een breder organisatievraagstuk vormen."
    )
    first_owner = (
        EXIT_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR business partner met betrokken leidinggevende"
    first_action = (
        f"Vertaal {focus_text.lower()} binnen 30 dagen naar één gerichte verbeteractie met duidelijke eigenaar "
        "en zichtbare opvolging."
    )
    review_moment = _exit_review_moment_text(focus_text)
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik ExitScan niet alleen als terugblik, maar als managementinstrument om het vertrekbeeld te toetsen, te prioriteren en te vertalen naar zichtbare verbeteracties."
        ),
        "session_title": "Eerste managementsessie na oplevering",
        "session_intro": (
            "Gebruik deze route om de eerste managementsessie compact en besluitgericht te houden: kies eerst het prioriteitsspoor "
            "en maak daarna expliciet wie trekt, wat de eerste stap is en wanneer je terugkijkt."
        ),
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste vertrekspoor om bestuurlijk te wegen.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste stap",
                "body": first_action,
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementsessie",
        "session_watchout": (
            "Gebruik deze sessie om prioriteit, gesprek en actie te kiezen, niet om achteraf de ene oorzaak van vertrek te bewijzen."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies binnen 2 weken het eerste managementspoor",
                "body": (
                    f"Deel de managementsamenvatting met MT en betrokken leidinggevenden en maak expliciet welk besluit nu eerst telt: {first_decision}"
                ),
            },
            {
                "number": "2",
                "title": "Beleg direct een eerste eigenaar",
                "body": (
                    f"Wijs {first_owner.lower()} aan als eerste eigenaar van {focus_text.lower()}. "
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
                    review_moment
                ),
            },
        ],
    }
