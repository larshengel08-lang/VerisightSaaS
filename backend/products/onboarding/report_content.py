from __future__ import annotations

from typing import Any

from backend.products.shared.management_language import management_band_label
from backend.products.onboarding.definition import SCAN_DEFINITION


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]
CHECKPOINT_THRESHOLD_NOTE = (
    "Vanaf 5 responses lees je onboarding als eerste indicatieve checkpointread; "
    "vanaf 10 responses mogen patroonlaag en grafieken voluit meewegen."
)

ONBOARDING_DECISION_BY_FACTOR = {
    "leadership": "Beslis waar nieuwe medewerkers nu eerst meer richting, bereikbaarheid of steun nodig hebben.",
    "culture": "Beslis waar bespreekbaarheid, veiligheid of teaminbedding nu eerst versterkt moet worden.",
    "growth": "Beslis waar begeleiding, leerruimte of perspectief nu eerst explicieter zichtbaar moet worden.",
    "compensation": "Beslis of dit checkpoint nu vooral vraagt om duidelijkere afspraken of praktische startersupport.",
    "workload": "Beslis welke informatie- of werkdrukbron in deze fase nu direct omlaag moet.",
    "role_clarity": "Beslis welke rolverwachting, prioriteit of succesmaat nu direct explicieter moet worden.",
}

ONBOARDING_OWNER_BY_FACTOR = {
    "leadership": "HR met betrokken leidinggevende",
    "culture": "HR lead met teamlead",
    "growth": "HR development-owner",
    "compensation": "HR lead",
    "workload": "Leidinggevende met HR",
    "role_clarity": "Leidinggevende met HR business partner",
}

ONBOARDING_VALIDATE_BY_FACTOR = {
    "leadership": "Toets waar richting, steun of bereikbaarheid van leiding in deze vroege fase het minst duidelijk is.",
    "culture": "Toets waar nieuwe medewerkers vragen, onzekerheid of fouten nog niet veilig genoeg bespreekbaar voelen.",
    "growth": "Toets of de frictie vooral zit in begeleiding, oefenruimte of zicht op succes in de rol.",
    "compensation": "Toets waar praktische afspraken, ondersteuning of voorwaarden in deze startfase nog schuren.",
    "workload": "Toets of de druk vooral zit in informatiedichtheid, tempo of feitelijke werkbelasting.",
    "role_clarity": "Toets waar rol, prioriteiten of succescriteria in deze fase nog te diffuus zijn.",
}

ONBOARDING_ACTION_BY_FACTOR = {
    "leadership": "Plan binnen 2 weken een gerichte check op verwachtingen, support en escalatieroutes voor deze instroomgroep.",
    "culture": "Plan een korte teamcheck op inbedding en bespreekbaarheid.",
    "growth": "Maak binnen 30 dagen een concrete begeleidings- of leerstap zichtbaar.",
    "compensation": "Doe een gerichte check op de meest voorkomende praktische startfrictie.",
    "workload": "Voer binnen 2 weken een korte review uit op tempo, verwachtingen en prioriteiten.",
    "role_clarity": "Maak binnen 30 dagen prioriteiten en succescriteria expliciet voor deze instroomgroep.",
}

ONBOARDING_REVIEW_BY_FACTOR = {
    "leadership": "Gebruik een volgend checkpoint alleen als bounded vervolg nadat de begeleidings- of check-in afspraak expliciet is belegd.",
    "culture": "Gebruik het volgende checkpoint om te toetsen of de gekozen inbeddingsactie merkbaar verschil maakt.",
    "growth": "Gebruik het volgende checkpoint om te toetsen of de extra begeleiding of ontwikkelstap merkbaar is geland.",
    "compensation": "Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste verduidelijking aantoonbaar is opgepakt.",
    "workload": "Toets op het volgende checkpoint of de gekozen ontlasting echt merkbaar was.",
    "role_clarity": "Toets op het volgende checkpoint of de extra rolduidelijkheid ook merkbaar is voor nieuwe medewerkers.",
}

ONBOARDING_HYPOTHESIS_BODY_BY_FACTOR = {
    "leadership": "Het checkpoint wijst vooral op een vroege ondersteunings- of bereikbaarheidsfrictie in de directe leidingcontext.",
    "culture": "Het checkpoint wijst vooral op teaminbedding of bespreekbaarheid die in deze vroege fase nog niet stabiel genoeg voelt.",
    "growth": "Het checkpoint laat vooral zien dat begeleiding, leerruimte of perspectief in deze fase nog te weinig zichtbaar is.",
    "compensation": "Het checkpoint vraagt eerst verificatie of praktische startersupport of voorwaarden nu de grootste frictiebron zijn.",
    "workload": "Het checkpoint laat vooral zien dat tempo, informatiedruk of werkbelasting de landing nu onder druk zet.",
    "role_clarity": "Het checkpoint wijst vooral op onduidelijke prioriteiten, verwachtingen of succescriteria in de startfase.",
}


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    avg_stay_intent: float | None = None,
    **_: Any,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de vroege werkcontext"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = ONBOARDING_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke kleine correctie of verificatie nu eerst nodig is rond {top_factor_text}.",
    )
    first_owner = ONBOARDING_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR met onboarding-owner",
    )
    first_action = ONBOARDING_ACTION_BY_FACTOR.get(
        lead_factor_key,
        "Beleg nu een kleine, zichtbare correctie of explicitering voor deze instroomgroep.",
    )
    review_moment = ONBOARDING_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste corrigerende stap expliciet is belegd.",
    )

    direction_body = (
        f"De checkpoint-richtingsvraag staat nu op {avg_stay_intent:.1f}/10. "
        "Lees die score samen met werkbeleving en vroege werkfactoren als check of de landing in deze fase houdbaar voelt."
        if avg_stay_intent is not None
        else "De checkpoint-richtingsvraag helpt bepalen of de landing in deze fase houdbaar en kansrijk voelt."
    )

    trust_note = (
        "Lees onboarding als bounded single-checkpoint lifecycle-read op groepsniveau. "
        "Het rapport helpt bepalen hoe nieuwe medewerkers nu landen, wie de eerste handoff trekt en welke kleine borg- of correctiestap logisch is. "
        f"{CHECKPOINT_THRESHOLD_NOTE} "
        "Dit is geen client onboarding-route, geen journey-engine, geen performance-instrument en geen retentievoorspeller."
    )

    executive_intro = (
        f"Onboarding 30-60-90 vertaalt dit ene meetmoment naar een compacte managementread. "
        f"Op dit checkpoint ligt het eerste werkspoor vooral in {top_factor_text}. "
        "Gebruik het rapport om de eerste managementhuddle te richten, een eigenaar te benoemen en een kleine bounded stap te kiezen."
    )

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van het checkpointsignaal",
        "findings_title": "Scherpste checkpointlezing",
        "executive_title": "Vroege landingsduiding voor HR, MT en directie",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor management",
        "trust_note": trust_note,
        "boardroom_title": "Bestuurlijke handoff",
        "boardroom_intro": (
            "Deze handoff brengt dit checkpoint terug tot een bestuurlijke managementread: "
            "wat speelt nu, waarom telt dat, welk werkspoor vraagt eerst eigenaarschap en wanneer moet bewust worden herijkt."
        ),
        "boardroom_cards": [
            {
                "title": "Wat speelt nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"De scherpste vroege frictie of borging zit nu vooral in {top_factor_text}. Gebruik dat als eerste managementread van deze instroomgroep.",
            },
            {
                "title": "Waarom telt dit nu",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": f"{top_factor_text.capitalize()} kleuren nu het sterkst waar vroege landing onder druk staat of expliciet geborgd moet worden voordat dit checkpoint doorschuift.",
            },
            {
                "title": "Eerste werkspoor",
                "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "Nog niet zichtbaar",
                "body": direction_body,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg direct wie deze checkpointhuddle trekt, zodat onboarding niet blijft hangen als nette momentopname zonder eigenaar.",
            },
            {
                "title": "Reviewmoment",
                "value": "Volgend checkpoint",
                "body": review_moment,
            },
        ],
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": (
            "Lees onboarding niet als client onboarding-route, volledige 30-60-90 route, individuele beoordeling of bewijs van latere retentie-uitkomst. "
            "De waarde zit in een begrensde managementread van dit ene checkpoint."
        ),
        "highlight_cards": [
            {
                "title": "Onboardingsignaal nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"Gebruik {top_factor_text} als eerste werkspoor voor de managementhuddle.",
            },
            {
                "title": "Primair checkpointspoor",
                "value": top_factor_value,
                "body": direction_body,
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Deze combinatie trekt de eerste handoff en bewaakt tegelijk de bounded productgrens.",
            },
            {
                "title": "Eerste bounded stap",
                "value": "Checkpointactie",
                "body": first_action,
            },
            {
                "title": "Reviewgrens",
                "value": "Volgend checkpoint",
                "body": review_moment,
            },
        ],
        "cards": [
            {
                "title": "Checkpointbetekenis",
                "body": (
                    "Gebruik dit rapport als managementread van een enkel meetmoment. "
                    "Het helpt kiezen wat nu eerst aandacht vraagt, niet om een volledige journey of cohortbeeld te claimen."
                ),
            },
            {
                "title": "Eerste verificatiespoor",
                "body": ONBOARDING_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {top_factor_text} als eerste bounded check in deze onboardingfase.",
                ),
            },
            {
                "title": "Eerste bounded actie",
                "body": first_action,
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport vertaalt Onboarding 30-60-90 naar een formeel leesbare checkpoint-handoff. "
            "De methodiek blijft compact en bounded: onboarding helpt een vroege lifecycle-read te structureren, "
            "niet om een journey-engine, retentievoorspelling of client onboarding-route te vervangen. "
            f"{CHECKPOINT_THRESHOLD_NOTE}"
        ),
        "method_text": (
            "Onboarding berekent per response een onboardingsignaal op een schaal van 1 tot 10. "
            "Dat signaal combineert drie korte checkpointitems, de actieve vroege werkfactoren in deze campaign "
            "en een checkpoint-richtingsvraag. Een hogere score betekent een scherper vroeg aandachtssignaal "
            "dat een expliciete managementhuddle en begrensde vervolgstap vraagt."
        ),
        "weight_rows": [
            ["Bron", "Bijdrage", "Hoe te lezen"],
            ["Korte checkpointcheck", "1.0 x", "Compacte read op hoe nieuwe medewerkers nu landen in hun eerste werkcontext."],
            ["Actieve werkfactoren", "1.0 x", "De geselecteerde vroege werkfactoren laten zien waar het eerste werkspoor nu het scherpst zit."],
            ["Checkpoint-richtingsvraag", "Contextlaag", "Laat zien of deze landing in de komende periode werkbaar en kansrijk voelt; bedoeld als extra managementduiding."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["Laag", "< 4.5", "Overwegend stabiele landing; vooral borgen wat werkt en beperkt herlezen op een later checkpoint."],
            ["Midden", "4.5-7.0", "Checkpoint vraagt bounded verificatie of kleine correctie voordat je groter maakt wat het product zegt."],
            ["Hoog", ">= 7.0", "Scherp vroegsignaal dat nu een expliciete eigenaar, kleine correctie en reviewgrens verdient."],
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
        "title": "Onboardingsignaal en checkpointcontext",
        "intro": (
            "Deze pagina laat zien hoe het onboardingsignaal, de checkpoint-richtingsvraag en de scherpste vroege werkfactoren samenkomen. "
            "Lees dit als bounded managementread van een enkel checkpoint op groepsniveau."
        ),
        "summary_title": "Checkpointcontext in samenhang",
        "signal_profile_title": "Hoe lees je dit checkpoint?",
        "signal_profile_text": (
            "Gebruik het onboardingsignaal om te kiezen wat in deze fase nu eerst een managementhuddle vraagt. "
            "De richtingsvraag en de scherpste werkfactoren helpen daarna bepalen welke kleine borg- of correctiestap logisch is. "
            "Lees dit als enkel checkpoint op groepsniveau, niet als journey-engine of retentiepredictie."
        ),
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
            "title": "Onboardingsignaal",
            "value": f"{avg_signal:.1f}/10" if avg_signal is not None else "-",
            "body": "Samenvattend checkpointsignaal op basis van vroege werkbeleving en actieve werkfactoren.",
        },
        {
            "title": "Checkpoint-richting",
            "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "-",
            "body": "Lees deze richtingsvraag samen met het checkpointsignaal als check of de landing in deze fase werkbaar voelt.",
        },
        {
            "title": "Productgrens",
            "value": "Enkel checkpoint",
            "body": "Deze onboarding-wave leest precies één checkpoint per campaign; geen hire-date model of multi-checkpoint journey.",
        },
        {
            "title": "Primair werkspoor",
            "value": factor_text,
            "body": ONBOARDING_VALIDATE_BY_FACTOR.get(
                lead_factor_key,
                "Gebruik deze factor als eerste bounded verificatieroute in deze fase.",
            ),
        },
    ]


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Checkpoint-hypothesen",
        "intro_text": (
            "Onderstaande hypotheses helpen bepalen welk eerste werkspoor dit checkpoint nu opent. "
            "Ze zijn bedoeld voor een bounded managementhuddle, niet als bewijs van een volledige journey of latere retentie-uitkomst."
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
                "title": f"Hypothese: {factor_label.lower()} vraagt nu de eerste checkpoint-huddle",
                "body": ONBOARDING_HYPOTHESIS_BODY_BY_FACTOR.get(
                    factor,
                    "Het checkpoint laat zien dat dit werkspoor nu als eerste bounded verificatie of correctie vraagt.",
                ),
                "question": ONBOARDING_VALIDATE_BY_FACTOR.get(
                    factor,
                    f"Welke kleine check of correctie hoort nu eerst bij {factor_label.lower()}?",
                ),
                "action": ONBOARDING_ACTION_BY_FACTOR.get(
                    factor,
                    "Beleg nu een kleine, zichtbare correctie of explicitering voor deze instroomgroep.",
                ),
                "owner": ONBOARDING_OWNER_BY_FACTOR.get(
                    factor,
                    "HR met onboarding-owner",
                ),
            }
        )

    if not items and top_factor_labels:
        items.append(
            {
                "title": f"Hypothese: {top_factor_labels[0].lower()} vraagt nu eerst checkpointduiding",
                "body": "Onboarding laat zien welk vroege werkspoor nu het eerste managementgesprek verdient, zonder de route groter te maken dan dit checkpoint.",
                "question": f"Welke kleine managementstap hoort nu eerst bij {top_factor_labels[0].lower()}?",
                "action": "Plan nu een beperkte managementhuddle en leg een eerste eigenaar, actie en reviewgrens vast.",
                "owner": "HR met onboarding-owner",
            }
        )

    return items


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de vroege werkcontext"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = ONBOARDING_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke kleine correctie of verificatie nu eerst nodig is rond {focus_text.lower()}.",
    )
    first_owner = ONBOARDING_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR met onboarding-owner",
    )
    first_action = ONBOARDING_ACTION_BY_FACTOR.get(
        lead_factor_key,
        f"Beleg nu een kleine, zichtbare stap rond {focus_text.lower()}.",
    )
    review_moment = ONBOARDING_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste stap expliciet is belegd.",
    )
    return {
        "section_title": "Route en actie",
        "intro_text": (
            "Gebruik onboarding om snel te kiezen wat dit checkpoint nu bestuurlijk vraagt, wie de eerste handoff trekt en wanneer de route juist klein moet blijven. "
            "Houd de read single-checkpoint, assisted en expliciet non-predictive."
        ),
        "session_title": "Eerste managementsessie",
        "session_intro": (
            "Houd de eerste sessie klein en bounded: kies eerst het primaire werkspoor, benoem daarna eigenaar, eerste stap en reviewgrens."
        ),
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste checkpointspoor.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste bounded stap",
                "body": ONBOARDING_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {focus_text.lower()} als eerste bounded check in deze fase.",
                ),
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementhuddle",
        "session_watchout": (
            "Gebruik deze sessie om te duiden, begrenzen en opvolgen. Onboarding is geen journey-engine, geen client onboarding-route en geen voorspeller van latere retentie. "
            "Maak ook expliciet of dit checkpoint nog indicatief is of al als patroonread gelezen mag worden."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies nu het primaire checkpointspoor",
                "body": first_decision,
            },
            {
                "number": "2",
                "title": "Beleg direct een bounded eigenaar",
                "body": (
                    f"Benoem expliciet wie dit checkpointspoor trekt: {first_owner}. "
                    "Zo blijft onboarding een bestuurlijke handoff in plaats van alleen een nette momentopname."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal het checkpoint naar 1 kleine corrigerende stap",
                "body": first_action,
            },
            {
                "number": "4",
                "title": "Leg review en productgrens expliciet vast",
                "body": review_moment,
            },
        ],
    }
