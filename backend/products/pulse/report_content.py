from __future__ import annotations

from typing import Any

from backend.products.shared.management_language import management_band_label
from backend.products.pulse.definition import SCAN_DEFINITION


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]
PULSE_THRESHOLD_NOTE = (
    "Vanaf 5 responses lees je Pulse als eerste indicatieve groepsread; "
    "vanaf 10 responses mogen patroonlaag en grafieken steviger meewegen."
)

PULSE_DECISION_BY_FACTOR = {
    "leadership": "Beslis waar richting, steun of bereikbaarheid nu als eerste een kleine managementcorrectie vraagt.",
    "culture": "Beslis waar bespreekbaarheid, veiligheid of samenwerking nu eerst een bounded review nodig hebben.",
    "growth": "Beslis waar perspectief, feedback of ontwikkelruimte nu het eerst herijkt moeten worden.",
    "compensation": "Beslis of dit signaal nu eerst een fairness- of uitlegbaarheidscheck vraagt.",
    "workload": "Beslis welke prioriteit, drukbron of ontlasting nu het eerst moet worden bijgestuurd.",
    "role_clarity": "Beslis waar prioriteiten, rolgrenzen of eigenaarschap nu eerst explicieter moeten worden.",
}

PULSE_OWNER_BY_FACTOR = {
    "leadership": "HR met betrokken leidinggevende",
    "culture": "HR lead met teamlead",
    "growth": "HR development-owner met leidinggevende",
    "compensation": "HR lead",
    "workload": "Leidinggevende met HR",
    "role_clarity": "Leidinggevende met HR business partner",
}

PULSE_VALIDATE_BY_FACTOR = {
    "leadership": "Toets waar richting, steun of bereikbaarheid in de huidige werkcontext nu het minst stevig voelen.",
    "culture": "Toets waar zorgen, frictie of samenwerking nu te laat of te onveilig bespreekbaar worden.",
    "growth": "Toets of de spanning vooral zit in perspectief, feedback of zicht op een volgende stap.",
    "compensation": "Toets of dit signaal vooral draait om ervaren eerlijkheid, voorwaarden of uitlegbaarheid.",
    "workload": "Toets of de druk vooral zit in prioritering, tempo, piekbelasting of gebrek aan herstelruimte.",
    "role_clarity": "Toets waar prioriteiten, verwachtingen of eigenaarschap nu het minst helder zijn.",
}

PULSE_ACTION_BY_FACTOR = {
    "leadership": "Plan binnen 2 weken een gerichte review op richting, steun en bereikbaarheid.",
    "culture": "Plan een korte review op bespreekbaarheid, veiligheid en samenwerking.",
    "growth": "Maak binnen 30 dagen een concrete feedback- of perspectiefstap zichtbaar.",
    "compensation": "Doe een gerichte check op fairness of uitlegbaarheid van de meest genoemde spanning.",
    "workload": "Voer binnen 2 weken een korte review uit op prioritering, druk of ontlasting.",
    "role_clarity": "Maak binnen 30 dagen prioriteiten, rolgrenzen en eigenaarschap explicieter.",
}

PULSE_REVIEW_BY_FACTOR = {
    "leadership": "Gebruik een volgende Pulse alleen als bounded hercheck nadat de eerste managementcorrectie expliciet is belegd.",
    "culture": "Gebruik een volgende Pulse om te toetsen of de gekozen review of correctie merkbaar effect heeft op de samenwerking.",
    "growth": "Gebruik een volgende Pulse om te toetsen of de extra feedback- of perspectiefstap zichtbaar is geland.",
    "compensation": "Gebruik een volgende Pulse pas nadat de fairness- of uitlegbaarheidscheck expliciet is uitgevoerd.",
    "workload": "Toets binnen 30-45 dagen of de gekozen ontlasting of herprioritering echt merkbaar was.",
    "role_clarity": "Gebruik een volgende Pulse om te toetsen of prioriteiten en eigenaarschap merkbaar helderder zijn geworden.",
}

PULSE_HYPOTHESIS_BODY_BY_FACTOR = {
    "leadership": "Deze Pulse laat vooral zien dat richting, steun of bereikbaarheid in de huidige werkcontext extra review vragen.",
    "culture": "Deze Pulse wijst vooral op een werkcontext waarin bespreekbaarheid, veiligheid of samenwerking nu te veel onder druk staan.",
    "growth": "Deze Pulse laat vooral zien dat perspectief, feedback of ontwikkelruimte op dit meetmoment te weinig zichtbaar voelen.",
    "compensation": "Deze Pulse vraagt eerst verificatie of ervaren eerlijkheid, voorwaarden of uitlegbaarheid nu de grootste spanning dragen.",
    "workload": "Deze Pulse laat vooral zien dat prioritering, tempo of werkdruk de huidige werkcontext nu zichtbaar onder spanning zetten.",
    "role_clarity": "Deze Pulse wijst vooral op diffuse prioriteiten, rolgrenzen of eigenaarschap in de huidige werkcontext.",
}


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    avg_stay_intent: float | None = None,
    **_: Any,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de huidige werkcontext"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = PULSE_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke kleine correctie nu als eerste nodig is rond {top_factor_text}.",
    )
    first_owner = PULSE_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR met betrokken leidinggevende",
    )
    first_action = PULSE_ACTION_BY_FACTOR.get(
        lead_factor_key,
        "Beleg nu een kleine, zichtbare correctie die binnen 30 dagen merkbaar moet zijn.",
    )
    review_moment = PULSE_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgende Pulse alleen als bounded hercheck nadat de eerste correctie expliciet is belegd.",
    )

    direction_body = (
        f"De richtingsvraag staat nu op {avg_stay_intent:.1f}/10. "
        "Lees die score samen met werkbeleving en actieve werkfactoren als check of de huidige werkcontext de goede kant op beweegt."
        if avg_stay_intent is not None
        else "De richtingsvraag helpt bepalen of de huidige werkcontext in de goede richting beweegt."
    )

    trust_note = (
        "Lees Pulse als bounded reviewmoment en compacte managementhandoff op groepsniveau. "
        f"{PULSE_THRESHOLD_NOTE} "
        "Het rapport helpt kiezen wat nu de eerste reviewvraag is, welke kleine correctie logisch is, wie die trekt en wanneer je bewust opnieuw kijkt. "
        "Dit is geen brede diagnose, geen trendmachine, geen effectbewijs en geen bredere behoudsroute."
    )

    executive_intro = (
        f"Pulse vertaalt dit meetmoment naar een compacte managementhandoff. "
        f"Op dit moment vraagt {top_factor_text} de eerste bounded review en kleine correctie. "
        "Gebruik het rapport om direct eigenaar, eerste stap en reviewmoment expliciet te maken zonder Pulse groter te maken dan deze bounded reviewread."
    )

    return {
        "section_title": "Compacte managementhandoff",
        "distribution_title": "Verdeling van het pulssignaal",
        "findings_title": "Scherpste reviewlezing",
        "executive_title": "Compacte managementhandoff voor HR en leiding",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor management",
        "trust_note": trust_note,
        "boardroom_title": "Compacte managementhandoff",
        "boardroom_intro": (
            "Deze handoff helpt snel zien wat dit huidige Pulse-beeld bestuurlijk betekent, "
            "welk werkspoor nu voorop staat en welke bounded vervolgstap logisch is."
        ),
        "boardroom_cards": [
            {
                "title": "Wat speelt nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"De scherpste reviewvraag zit nu vooral in {top_factor_text}. Gebruik dat als eerste bounded spoor.",
            },
            {
                "title": "Primair werkspoor",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": f"{top_factor_text.capitalize()} kleuren nu het sterkst welke kleine correctie of review eerst aandacht vraagt.",
            },
            {
                "title": "Richting nu",
                "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "Nog niet zichtbaar",
                "body": direction_body,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg deze Pulse eerst bij HR met de betrokken leidinggevende, zodat de groepsread direct naar actie vertaalt.",
            },
            {
                "title": "Volgende check",
                "value": "30-45 dagen",
                "body": review_moment,
            },
        ],
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": (
            "Lees Pulse niet als brede diagnose, trendbewijs of quasi-peer rapport. "
            "De waarde zit in een actuele groepsread, een kleine correctie en een begrensde hercheck."
        ),
        "highlight_cards": [
            {
                "title": "Pulsesignaal nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"Gebruik {top_factor_text} als eerste bounded reviewspoor.",
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_value,
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Maak expliciet wie deze correctie trekt en wanneer je samen opnieuw kijkt.",
            },
        ],
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport vertaalt Pulse naar een formeel leesbare compacte managementhandoff. "
            "De methodiek blijft bewust smal: Pulse helpt reviewen, begrenzen en een kleine correctie kiezen, "
            "niet om een trendmachine, effectbewijs of bredere diagnose te openen. "
            f"{PULSE_THRESHOLD_NOTE}"
        ),
        "method_text": (
            "Pulse berekent per response een pulssignaal op een schaal van 1 tot 10. "
            "Dat signaal combineert drie korte werkbelevingsitems, de actieve Pulse-factoren in deze campaign "
            "en een richtingsvraag. Een hogere score betekent een scherper reviewsignaal dat nu een expliciete managementreview en kleine correctie vraagt."
        ),
        "weight_rows": [
            ["Bron", "Bijdrage", "Hoe te lezen"],
            ["Korte werkbeleving", "1.0 x", "Compacte read op werkbaarheid, toerusting en ervaren verbinding op dit meetmoment."],
            ["Actieve werkfactoren", "1.0 x", "De geselecteerde Pulse-factoren laten zien waar het eerste werkspoor nu het scherpst zit."],
            ["Richtingsvraag", "Contextlaag", "Laat zien of de huidige werkcontext de goede kant op beweegt; bedoeld als extra bounded duiding."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["Laag", "< 4.5", "Overwegend stabiele groepsread; vooral bewaken wat werkt en alleen bounded herlezen als daar reden voor is."],
            ["Midden", "4.5-7.0", "Pulse vraagt bounded review of kleine correctie voordat je er meer van maakt dan dit meetmoment draagt."],
            ["Hoog", ">= 7.0", "Scherp reviewsignaal dat nu een expliciete eigenaar, kleine correctie en begrensd reviewmoment verdient."],
        ],
        "trust_rows": [
            ["Wat dit product wel is", TRUST_CONTRACT["what_it_is"]],
            ["Niet voor bedoeld", TRUST_CONTRACT["what_it_is_not"]],
            ["Hoe je de output leest", TRUST_CONTRACT["how_to_read"]],
            ["Privacy & rapportage", TRUST_CONTRACT["privacy_boundary"]],
            ["Bewijsstatus nu", TRUST_CONTRACT["evidence_status"]],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None, **_: Any) -> dict[str, Any]:
    return {
        "title": "Pulsesignaal en current-cycle context",
        "intro": (
            "Deze pagina laat zien hoe het pulssignaal, de richtingsvraag en de scherpste actieve werkfactoren op dit meetmoment samenkomen. "
            "Lees dit als bounded reviewmoment op groepsniveau."
        ),
        "summary_title": "Current-cycle context in samenhang",
        "signal_profile_title": "Hoe lees je deze groepsread?",
        "signal_profile_text": (
            "Gebruik het pulssignaal om te kiezen welke reviewvraag nu het eerst aan tafel moet komen. "
            "De richtingsvraag en de scherpste werkfactoren helpen daarna bepalen welke kleine correctie logisch is. "
            "Lees dit als current-cycle groepsread, niet als trendbewijs of effectclaim."
        ),
        "section_intro": (
            "Deze pagina verbindt pulssignaal, richtingsvraag en actieve werkfactoren tot één bounded managementlezing."
        ),
        "section_how_to_read": "Lees eerst het pulssignaal, daarna de richtingsvraag en pas daarna de actieve werkfactoren van deze cycle.",
        "section_why_it_matters": "Zo blijft zichtbaar wat nu review vraagt zonder van deze groepsread een bredere trend- of effectclaim te maken.",
    }


def get_signal_page_cards_payload(
    *,
    responses: list[Any],
    avg_signal: float | None,
    avg_stay_intent: float | None,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    **_: Any,
) -> list[dict[str, str]]:
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    factor_text = top_factor_labels[0] if top_factor_labels else "Werkcontext"
    return [
        {
            "title": "Pulsesignaal",
            "value": f"{avg_signal:.1f}/10" if avg_signal is not None else "-",
            "body": "Samenvattend reviewsignaal op basis van korte werkbeleving en actieve Pulse-factoren.",
        },
        {
            "title": "Richting nu",
            "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "-",
            "body": "Lees deze richtingsvraag samen met het pulssignaal als check of de huidige werkcontext de goede kant op beweegt.",
        },
        {
            "title": "Productgrens",
            "value": "Current-cycle only",
            "body": "Deze Pulse-PDF blijft een compacte groepsread van deze cycle; geen standaard vorige-meting-laag, geen trendmachine en geen brede diagnose.",
        },
        {
            "title": "Primair werkspoor",
            "value": factor_text,
            "body": PULSE_VALIDATE_BY_FACTOR.get(
                lead_factor_key,
                "Gebruik deze factor als eerste bounded reviewspoor op dit meetmoment.",
            ),
        },
    ]


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Reviewhypothesen",
        "intro_text": (
            "Onderstaande hypotheses helpen bepalen welk werkspoor deze Pulse nu eerst opent. "
            "Ze zijn bedoeld voor een bounded managementreview, niet als bewijs van een brede diagnose of hard actie-effect."
        ),
    }


def get_hypothesis_rows(
    *,
    top_risks: list[tuple[str, float]],
    factor_avgs: dict[str, float],
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    **_: Any,
) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for factor, signal_value in top_risks[:3]:
        factor_label = next(
            (label for key, label in zip(top_factor_keys, top_factor_labels) if key == factor),
            factor.replace("_", " ").title(),
        )
        items.append(
            {
                "title": f"Hypothese: {factor_label.lower()} vraagt nu de eerste review",
                "body": PULSE_HYPOTHESIS_BODY_BY_FACTOR.get(
                    factor,
                    "Deze Pulse laat zien dat dit werkspoor nu als eerste bounded review of kleine correctie vraagt.",
                ),
                "question": PULSE_VALIDATE_BY_FACTOR.get(
                    factor,
                    f"Welke beperkte review hoort nu eerst bij {factor_label.lower()}?",
                ),
                "action": PULSE_ACTION_BY_FACTOR.get(
                    factor,
                    "Beleg nu een kleine, zichtbare correctie die binnen 30 dagen merkbaar moet zijn.",
                ),
                "owner": PULSE_OWNER_BY_FACTOR.get(
                    factor,
                    "HR met betrokken leidinggevende",
                ),
            }
        )

    if not items and top_factor_labels:
        items.append(
            {
                "title": f"Hypothese: {top_factor_labels[0].lower()} vraagt nu eerst review",
                "body": "Pulse laat zien welk werkspoor nu als eerste managementreview verdient, zonder de route groter te maken dan deze bounded groepsread.",
                "question": f"Welke kleine correctie hoort nu eerst bij {top_factor_labels[0].lower()}?",
                "action": "Plan nu een beperkte managementreview en leg eigenaar, eerste stap en reviewgrens vast.",
                "owner": "HR met betrokken leidinggevende",
            }
        )

    return items


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de huidige werkcontext"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = PULSE_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke kleine correctie nu als eerste nodig is rond {focus_text.lower()}.",
    )
    first_owner = PULSE_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR met betrokken leidinggevende",
    )
    first_action = PULSE_ACTION_BY_FACTOR.get(
        lead_factor_key,
        f"Beleg nu een kleine, zichtbare stap rond {focus_text.lower()}.",
    )
    review_moment = PULSE_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgende Pulse alleen als bounded hercheck nadat de eerste correctie expliciet is belegd.",
    )
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik Pulse om snel te kiezen wat dit meetmoment nu bestuurlijk vraagt, wie de eerste handoff trekt en wanneer de route bewust klein moet blijven."
        ),
        "session_title": "Eerste managementreview na oplevering",
        "session_intro": (
            "Houd de eerste sessie klein en bounded: kies eerst het primaire werkspoor, benoem daarna eigenaar, eerste stap en reviewgrens."
        ),
        "priority_now": f"{focus_text} vormen nu het eerste reviewspoor.",
        "first_route": "Gebruik deze eerste route om review, kleine correctie en bounded hercheck compact te houden.",
        "decision_now": "Leg direct vast wie trekt, wat eerst gebeurt en wanneer opnieuw wordt gewogen.",
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste reviewspoor.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste bounded stap",
                "body": PULSE_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {focus_text.lower()} als eerste bounded reviewspoor.",
                ),
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementreview",
        "session_watchout": (
            "Gebruik deze sessie om te reviewen, begrenzen en opvolgen. Pulse is geen brede diagnose, geen trendmachine en geen quasi-peer rapport."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies nu het primaire reviewspoor",
                "body": first_decision,
            },
            {
                "number": "2",
                "title": "Beleg direct een bounded eigenaar",
                "body": (
                    f"Benoem expliciet wie dit reviewspoor trekt: {first_owner}. "
                    "Zo blijft Pulse een compacte managementhandoff in plaats van alleen een nette momentopname."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal het signaal naar 1 kleine correctie",
                "body": first_action,
            },
            {
                "number": "4",
                "title": "Leg review en bounded hercheck expliciet vast",
                "body": review_moment,
            },
        ],
    }
