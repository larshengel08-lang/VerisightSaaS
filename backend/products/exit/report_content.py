from __future__ import annotations

from typing import Any

from backend.products.exit.definition import SCAN_DEFINITION
from backend.products.shared.management_language import (
    MANAGEMENT_BAND_LABELS,
    management_band_label,
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
        "Kies waar het zwaartepunt eerst ligt: bij duidelijkheid over perspectief, bij het gesprek daarover of bij zichtbare ontwikkelruimte."
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
    "leadership": "HR/People-owner met betrokken leidinggevende",
    "culture": "HR lead met betrokken MT-lid",
    "growth": "HR/People-owner met betrokken leidinggevende",
    "compensation": "HR lead met MT of directie",
    "workload": "Betrokken leidinggevende met HR en operations",
    "role_clarity": "Betrokken leidinggevende met HR business partner",
}


def _exit_review_moment_text(focus_text: str) -> str:
    return (
        f"Plan binnen 60-90 dagen een review op {focus_text.lower()}: wat is gekozen, wat is uitgevoerd, "
        "wat daaruit terugkomt en of de lijn moet worden aangescherpt of bijgesteld."
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
    ) or "HR/People-owner met betrokken leidinggevende"

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        profile_body = (
            f"{top_reason_text.capitalize()} komt relatief vaak terug. Tegelijk laat deze groep breed werkfrictie zien, "
            f"vooral in {top_factor_text}."
        )
    elif strong_work_signal_pct is not None:
        profile_body = (
            f"{top_reason_text.capitalize()} komt naar voren, maar vraagt nog nadere duiding. "
            f"Gebruik vooral {top_factor_text} om te bepalen waar het patroon in het werk het duidelijkst terugkomt."
        )
    else:
        profile_body = (
            f"{top_reason_text.capitalize()} geeft het eerste vertrekhaakje. "
            f"Gebruik {top_factor_text} om te bepalen welk deel van dit vertrekbeeld het meest om vervolg vraagt."
        )

    if signal_visibility_average is not None and signal_visibility_average < 3:
        management_question = (
            f"Welke signalen rond {top_reason_text} kwamen te laat of onvoldoende veilig boven tafel, "
            f"en hoe hangt dat samen met {top_factor_text}?"
        )
    elif top_contributing_reason_label:
        management_question = (
            f"Wat draagt dit vertrekbeeld nu het meest: {top_reason_text}, {top_contributing_reason_label.lower()} "
            f"of de werkfrictie rond {top_factor_text}?"
        )
    else:
        management_question = (
            f"Welk deel van {top_reason_text} hangt nu het duidelijkst samen met {top_factor_text} "
            "en vraagt daarom eerst bestuurlijke aandacht?"
        )

    if signal_visibility_average is None:
        visibility_value = "Nog in opbouw"
        visibility_body = (
            "Zodra meer exitresponses binnen zijn laat ExitScan zien of signalen vooraf zichtbaar of bespreekbaar waren."
        )
    elif signal_visibility_average >= 4:
        visibility_value = "Signalen waren zichtbaar"
        visibility_body = (
            "Twijfel of vertrek kwam niet volledig uit de lucht vallen. Kijk vooral waar opvolging te laat kwam."
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
        "ExitScan bundelt vertrekredenen, werkfactoren en werkfrictie tot één groepsbeeld. "
        f"Zo zie je wat nu opvalt, waar het patroon in het werk het duidelijkst terugkomt en hoe {top_factor_text} "
        "het eerste bestuurlijke gesprek richting geven."
    )
    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        executive_intro += (
            " De antwoorden wijzen daarbij relatief breed op beïnvloedbare werkfrictie, wat het rapport vooral bruikbaar maakt "
            "voor prioritering, eigenaarschap en een gericht managementgesprek."
        )
    else:
        executive_intro += (
            " Gebruik dit rapport daarom als groepsbeeld voor gesprek en weging, niet als sluitende oorzaakverklaring."
        )

    trust_note = (
        "Lees ExitScan als groepsbeeld voor gesprek en weging. Het rapport bundelt vertrekredenen, werkfactoren en werkfrictie "
        "voor bestuurlijke bespreking op groepsniveau. Detailweergave start pas vanaf 5 responses, patroonanalyse pas vanaf 10 "
        "en segmenten verschijnen alleen bij voldoende n. Het rapport is geen individueel oordeel, diagnose of sluitend bewijs van oorzaak."
    )

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        boardroom_relevance = (
            f"Een relatief groot deel van de exitbatch wijst op beïnvloedbare werkfrictie rond {top_factor_text}. "
            "Daardoor vraagt dit beeld nu bestuurlijke aandacht in leiding, inrichting en opvolging."
        )
    else:
        boardroom_relevance = (
            f"Het vertrekbeeld is nog niet breed genoeg voor grote conclusies, maar wel scherp genoeg om {top_factor_text} "
            "als eerste bestuurlijke spoor te behandelen."
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
            "value": management_band_label(band="MIDDEN"),
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
        "Lees dit niet als bewijs van één oorzaak van vertrek en ook niet als garantie dat één interventie het patroon oplost. "
        "ExitScan helpt sneller wegen waar management moet kiezen en opvolgen, niet om achteraf absolute zekerheid te claimen."
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
            "Deze bestuurlijke handoff maakt compact zichtbaar wat nu opvalt, waarom het telt, waar de meeste druk zit "
            "en welk eerste besluit logisch is."
        ),
        "boardroom_cards": boardroom_cards,
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": boardroom_watchout,
        "highlight_cards": [
            {
                "title": "Frictiescore nu",
                "value": (top_exit_reason_label or "Nog geen duidelijke hoofdreden"),
                "body": profile_body,
            },
            {
                "title": "Scherpste werkfactoren",
                "value": top_factor_value,
                "body": (
                    f"Gebruik {top_factor_text} om te bepalen waar het vertrekbeeld in het werk het duidelijkst om vervolg vraagt."
                ),
            },
            {
                "title": "Wat vraagt verificatie",
                "value": management_band_label(band="MIDDEN"),
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
                "body": "Maak direct zichtbaar wie de eerste lijn trekt, zodat vervolg en terugkoppeling niet blijven hangen.",
            },
            {
                "title": "Eerdere signalering",
                "value": visibility_value,
                "body": visibility_body,
            },
        ],
        "cards": [
            {
                "title": "Frictiescore nu",
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
            "Deze pagina legt uit hoe je ExitScan leest en gebruikt. Ze vat kort samen wat de frictiescore betekent, "
            "wat de uitkomst wel en niet zegt en welke grenzen gelden voor groepsniveau, detail en segmentatie."
        ),
        "one_liner": (
            "Resultaten worden pas getoond vanaf voldoende responses. Patroonanalyse vraagt minimaal 10 responses. "
            "Segmenten worden pas getoond vanaf minimaal 5 responses per groep."
        ),
        "method_text": (
            "De frictiescore vat samen hoeveel spanning en belemmering in werk, leiding en context in deze groep terugkomt. "
            "Lees die score altijd samen met vertrekredenen, werkfactoren en de rest van het groepsbeeld. "
            "ExitScan is geschikt voor bestuurlijke bespreking op groepsniveau. Het is geen individueel oordeel, geen diagnose en geen sluitend bewijs van oorzaak."
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
            ["Band", "Score", "Betekenis"],
            ["Volgen", "< 4.5", "In beeld houden, maar nu niet als eerste verdiepen."],
            ["Eerst toetsen", "4.5–7.0", "Genoeg signaal om serieus te nemen, maar nog niet genoeg context voor een zware conclusie."],
            ["Direct prioriteren", ">= 7.0", "Vraagt nu als eerste bestuurlijke aandacht."],
        ],
        "trust_rows": [
            ["Wat dit product wel is", "Een rapport dat laat zien welke vertrekpatronen in een groep terugkomen, waar werkfrictie meespeelt en welke factoren bestuurlijk aandacht vragen."],
            ["Niet voor bedoeld", "Geen individueel oordeel. Geen voorspeller van vertrek op persoonsniveau. Geen externe benchmark. Geen bewijs op zichzelf van één oorzaak."],
            ["Hoe je de output leest", "Lees score, vertrekredenen, werkfactoren en route altijd in samenhang."],
            ["Privacy & rapportage", "ExitScan laat patronen op groepsniveau zien. Segmenten worden alleen getoond als dat qua groepsgrootte verantwoord is."],
            ["Bewijsstatus nu", "Geschikt voor bestuurlijke bespreking op groepsniveau, niet voor diagnostiek of sluitende causaliteit."],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    return {
        "title": "Signalen in samenhang",
        "intro": (
            "Hier lees je het vertrekbeeld in samenhang. Eerst zie je wat mensen relatief vaak noemen. Daarna zie je waar werkfrictie in het patroon meespeelt "
            "en welke werkfactoren daar het sterkst mee samenhangen."
        ),
        "summary_title": "Signalen in samenhang",
        "signal_profile_title": "Hoe lees je dit",
        "signal_profile_text": (
            "Lees eerst de hoofdredenen: die laten zien wat in deze groep het vaakst terugkomt. Lees daarna waar werkfrictie in dit vertrekbeeld aanwezig is "
            "en waar die waarschijnlijk beïnvloedbaar is. Gebruik meespelende factoren om beter te begrijpen welke werkfactoren het sterkst met dat vertrekpatroon "
            "samenhangen. Lees citaten als illustratie van het patroon, niet als bewijs op zichzelf."
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
    ) or "HR/People-owner met betrokken leidinggevende"
    first_route = f"Leg de eerste focus bij {focus_text.lower()}."
    priority_now = (
        f"Hier is nu de meeste aandacht nodig, omdat dit patroon op {focus_text.lower()} het duidelijkst om vervolg vraagt."
    )
    first_action = (
        f"Vertaal deze lijn binnen 30 dagen naar één gerichte vervolgactie op {focus_text.lower()}, "
        "met duidelijke eigenaar en zichtbare opvolging."
    )
    review_moment = _exit_review_moment_text(focus_text)
    return {
        "section_title": "Route",
        "intro_text": (
            "P4 hielp bepalen wat eerst beter begrepen en getoetst moest worden. Vanaf hier gaat het niet meer om toetsen, maar om kiezen en uitvoeren."
        ),
        "session_title": "Eerste managementsessie na oplevering",
        "session_intro": (
            "Deze pagina helpt om die eerste managementsessie compact en besluitgericht te maken. Je kiest hier welk spoor nu voorrang krijgt, "
            "welke eerste keuze daarbinnen nodig is en hoe je opvolging zichtbaar maakt."
        ),
        "first_route": first_route,
        "priority_now": priority_now,
        "decision_now": first_decision,
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": priority_now,
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
            "Gebruik deze sessie om richting, keuze en opvolging vast te zetten, niet om achteraf de ene oorzaak van vertrek te bewijzen."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies in de eerste managementsessie het spoor met voorrang",
                "body": (
                    f"Maak expliciet welk spoor nu voorrang krijgt en leg meteen vast welke keuze daarbinnen als eerste telt: {first_decision}"
                ),
            },
            {
                "number": "2",
                "title": "Leg direct het eerste eigenaarschap vast",
                "body": (
                    f"Beleg {first_owner.lower()} als eerste eigenaar van {focus_text.lower()}. "
                    "Zonder eigenaar blijft de route een constatering in plaats van een zichtbaar vervolg."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal de keuze naar één gerichte vervolgactie binnen 30 dagen",
                "body": (
                    f"Zorg voor één gerichte actie op {focus_text.lower()} met duidelijke eigenaar en zichtbare opvolging. "
                    "Vermijd brede programma's voordat de eerste lijn echt loopt."
                ),
            },
            {
                "number": "4",
                "title": "Plan review en herweging binnen 60-90 dagen",
                "body": (
                    review_moment
                ),
            },
        ],
    }
