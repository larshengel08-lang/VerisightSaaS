from __future__ import annotations

from typing import Any

from backend.products.shared.management_language import management_band_label
from backend.products.leadership.definition import SCAN_DEFINITION


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]
LEADERSHIP_THRESHOLD_NOTE = (
    "Vanaf 5 responses lees je Leadership Scan als eerste indicatieve managementread; "
    "vanaf 10 responses mogen patroonlaag en grafieken voluit meewegen."
)

LEADERSHIP_DECISION_BY_FACTOR = {
    "leadership": "Beslis welke managementroutine rond richting, steun of bereikbaarheid nu eerst verificatie vraagt.",
    "culture": "Beslis welke managementcontext nu eerst veiligheid, bespreekbaarheid of samenwerking explicieter moet borgen.",
    "growth": "Beslis waar management nu eerst perspectief, feedback of ontwikkelruimte helderder moet maken.",
    "compensation": "Beslis of dit leadershipbeeld nu vooral een fairness-, voorwaarden- of uitlegbaarheidsspoor vraagt.",
    "workload": "Beslis welke managementkeuze rond prioritering, druk of planning nu als eerste correctie vraagt.",
    "role_clarity": "Beslis waar management nu eerst prioriteiten, rolgrenzen of eigenaarschap explicieter moet maken.",
}

LEADERSHIP_OWNER_BY_FACTOR = {
    "leadership": "HR lead met MT-sponsor",
    "culture": "HR lead met directie- of MT-owner",
    "growth": "HR development-owner met MT-sponsor",
    "compensation": "HR lead",
    "workload": "Operations- of businesslead met HR",
    "role_clarity": "Businesslead met HR business partner",
}

LEADERSHIP_VALIDATE_BY_FACTOR = {
    "leadership": "Toets waar medewerkers vooral richting, steun of escalatieduidelijkheid missen in de huidige managementcontext.",
    "culture": "Toets waar de managementcontext bespreekbaarheid, veiligheid of samenwerking nog niet voldoende draagt.",
    "growth": "Toets of medewerkers vooral meer feedback, perspectief of ontwikkelruimte van management missen.",
    "compensation": "Toets of dit signaal vooral draait om fairness, voorwaarden of uitlegbaarheid in managementkeuzes.",
    "workload": "Toets of de spanning vooral zit in managementprioritering, piekdruk of gebrek aan herstelruimte.",
    "role_clarity": "Toets waar management vooral onduidelijke prioriteiten, rolgrenzen of eigenaarschap laat bestaan.",
}

LEADERSHIP_ACTION_BY_FACTOR = {
    "leadership": "Plan binnen 2 weken een gerichte managementreview op richting, steun en escalatie.",
    "culture": "Plan een korte managementreview op veiligheid, feedbackritme en samenwerking.",
    "growth": "Maak binnen 30 dagen een concrete managementstap zichtbaar rond feedback of ontwikkelruimte.",
    "compensation": "Doe een gerichte check op fairness of uitlegbaarheid van de relevante managementkeuzes.",
    "workload": "Voer binnen 2 weken een korte review uit op prioritering, tempo en werkdrukbesluiten.",
    "role_clarity": "Maak binnen 30 dagen prioriteiten, verwachtingen en eigenaarschap explicieter.",
}

LEADERSHIP_REVIEW_BY_FACTOR = {
    "leadership": "Gebruik een volgende review alleen als bounded vervolg nadat de eerste managementcorrectie expliciet is belegd.",
    "culture": "Gebruik een volgende review om te toetsen of de gekozen managementactie merkbaar verschil maakt.",
    "growth": "Gebruik een volgende review om te toetsen of de extra feedback- of ontwikkelstap merkbaar is geland.",
    "compensation": "Herlees dit signaal pas nadat de fairness- of uitlegbaarheidscheck expliciet is uitgevoerd.",
    "workload": "Toets binnen 30-45 dagen of de gekozen ontlasting of herprioritering echt merkbaar was.",
    "role_clarity": "Gebruik een volgende review om te toetsen of prioriteiten en eigenaarschap merkbaar helderder zijn geworden.",
}

LEADERSHIP_HYPOTHESIS_BODY_BY_FACTOR = {
    "leadership": "Het leadershipbeeld wijst vooral op frictie in richting, steun of bereikbaarheid binnen de huidige managementcontext.",
    "culture": "Het leadershipbeeld wijst vooral op een managementcontext die veiligheid, bespreekbaarheid of samenwerking nog niet stabiel genoeg draagt.",
    "growth": "Het leadershipbeeld laat vooral zien dat management nu te weinig perspectief, feedback of ontwikkelruimte zichtbaar maakt.",
    "compensation": "Het leadershipbeeld vraagt eerst verificatie of fairness, voorwaarden of uitlegbaarheid van managementkeuzes nu de grootste frictiebron zijn.",
    "workload": "Het leadershipbeeld laat vooral zien dat managementprioritering, tempo of druk de context nu onder spanning zet.",
    "role_clarity": "Het leadershipbeeld wijst vooral op diffuse prioriteiten, onheldere rolgrenzen of zwak eigenaarschap in managementkeuzes.",
}


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    avg_stay_intent: float | None = None,
    **_: Any,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de managementcontext"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = LEADERSHIP_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke managementcontext nu eerst bounded verificatie vraagt rond {top_factor_text}.",
    )
    first_owner = LEADERSHIP_OWNER_BY_FACTOR.get(lead_factor_key, "HR lead met MT-sponsor")
    first_action = LEADERSHIP_ACTION_BY_FACTOR.get(
        lead_factor_key,
        "Beleg nu een kleine, zichtbare managementcorrectie of explicitering.",
    )
    review_moment = LEADERSHIP_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgende review alleen als bounded vervolg nadat de eerste managementstap expliciet is belegd.",
    )

    direction_body = (
        f"De managementrichtingsvraag staat nu op {avg_stay_intent:.1f}/10. "
        "Lees die score samen met werkbeleving en managementfactoren als check of de huidige aansturing werkbaar voelt."
        if avg_stay_intent is not None
        else "De managementrichtingsvraag helpt bepalen of de huidige managementcontext werkbaar en steunend voelt."
    )

    trust_note = (
        "Lees Leadership Scan als geaggregeerde management-context triage op groepsniveau. "
        f"{LEADERSHIP_THRESHOLD_NOTE} "
        "Het rapport helpt bepalen welke managementcontext nu eerst duiding, eigenaar en een begrensde eerste stap vraagt. "
        "Dit is geen named leader model, geen manager ranking, geen 360-tool en geen performance-instrument."
    )

    executive_intro = (
        "Leadership Scan blijft een compacte managementread bovenop een bestaand people-signaal. "
        f"In deze campaign kleurt {top_factor_text} nu het sterkst welke managementcontext eerst een begrensde check vraagt. "
        "Gebruik het rapport om die context te duiden, klein te houden en expliciet op groepsniveau te houden."
    )

    return {
        "section_title": "Management-handoff",
        "distribution_title": "Verdeling van het leadershipsignaal",
        "findings_title": "Scherpste managementlezing",
        "executive_title": "Begrensde managementcontext",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor management",
        "trust_note": trust_note,
        "boardroom_title": "Management-handoff",
        "boardroom_intro": (
            "Deze handoff houdt Leadership Scan bewust compact: "
            "welke managementcontext kleurt het bestaande people-signaal nu mee en welke eerstvolgende check volstaat?"
        ),
        "boardroom_cards": [
            {
                "title": "Managementread nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"De scherpste managementspanning of borging zit nu vooral in {top_factor_text}. Gebruik dat als eerste contextspoor.",
            },
            {
                "title": "Managementcontext nu",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": f"{top_factor_text.capitalize()} kleuren nu het sterkst welke beperkte managementcheck het eerst aandacht vraagt.",
            },
            {
                "title": "Managementrichting",
                "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "Nog niet zichtbaar",
                "body": direction_body,
            },
            {
                "title": "Eerstvolgende check",
                "value": "Begrensde vervolgstap",
                "body": first_action,
            },
        ],
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": (
            "Lees Leadership Scan niet als named leader oordeel, manager ranking, 360-laag, performance-oordeel of bewijs van individuele leiderschapskwaliteit. "
            "De waarde zit in een begrensde managementread op groepsniveau."
        ),
        "highlight_cards": [
            {
                "title": "Leadershipsignaal nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"Gebruik {top_factor_text} als eerste spoor voor een begrensde managementcheck.",
            },
            {
                "title": "Managementcontext",
                "value": top_factor_value,
                "body": f"{top_factor_text.capitalize()} kleuren nu het sterkst welke context het bestaande people-signaal mee verklaart.",
            },
            {
                "title": "Eerstvolgende check",
                "value": "Begrensde vervolgstap",
                "body": first_action,
            },
            {
                "title": "Reviewgrens",
                "value": "Volgende review",
                "body": review_moment,
            },
        ],
        "cards": [
            {
                "title": "Managementbetekenis",
                "body": (
                    "Gebruik dit rapport als managementread op groepsniveau van deze campaign. "
                    "Het helpt kiezen welke managementcontext nu eerst aandacht vraagt, niet om named leaders of individuele kwaliteit te claimen."
                ),
            },
            {
                "title": "Eerste verificatiespoor",
                "body": LEADERSHIP_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {top_factor_text} als eerste bounded check in deze managementcontext.",
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
            "Deze compacte managementread houdt Leadership Scan bewust klein. "
            "De methodiek blijft compact en bounded: Leadership Scan helpt een geaggregeerde managementcontext te structureren, "
            "niet om named leaders, 360-logica of performance-uitspraken te openen. "
            f"{LEADERSHIP_THRESHOLD_NOTE}"
        ),
        "method_text": (
            "Leadership Scan berekent per response een leadershipsignaal op een schaal van 1 tot 10. "
            "Dat signaal combineert drie korte contextitems, de actieve leiderschaps- en werkfactoren in deze campaign "
            "en een managementrichtingsvraag. Een hogere score betekent een scherper aandachtssignaal op groepsniveau "
            "dat een expliciete managementhuddle en begrensde vervolgstap vraagt."
        ),
        "weight_rows": [
            ["Bron", "Bijdrage", "Hoe te lezen"],
            ["Korte contextcheck", "1.0 x", "Compacte read op hoe werkbaar, steunend en richtinggevend de managementcontext nu voelt."],
            ["Actieve werkfactoren", "1.0 x", "De geselecteerde leadershipfactoren laten zien waar het eerste managementspoor nu het scherpst zit."],
            ["Managementrichtingsvraag", "Contextlaag", "Laat zien of de huidige aansturing werkbaar en steunend voelt; bedoeld als extra managementduiding."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["Laag", "< 4.5", "Overwegend stabiel leadershipbeeld; vooral borgen wat werkt en beperkt herlezen op een later reviewmoment."],
            ["Midden", "4.5-7.0", "Managementbeeld vraagt bounded verificatie of kleine correctie voordat je groter maakt wat het product zegt."],
            ["Hoog", ">= 7.0", "Scherp managementsignaal dat nu een kleine, zichtbare check vraagt zonder named leader-zwaarte te openen."],
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
        "title": "Leadershipsignaal en managementcontext",
        "intro": (
            "Deze pagina laat zien hoe het leadershipsignaal, de managementrichtingsvraag en de scherpste managementfactoren samenkomen. "
            "Lees dit als bounded managementread op groepsniveau, niet als named leader oordeel of 360-output."
        ),
        "summary_title": "Managementcontext in samenhang",
        "signal_profile_title": "Hoe lees je dit managementbeeld?",
        "signal_profile_text": (
            "Gebruik het leadershipsignaal om te kiezen welke managementcontext nu eerst een managementhuddle vraagt. "
            "De richtingsvraag en de scherpste werkfactoren helpen daarna bepalen welke kleine verificatie of correctie logisch is. "
            "Lees dit als geaggregeerde management-context triage, niet als named leader of performance-read."
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
    factor_text = top_factor_labels[0] if top_factor_labels else "Managementcontext"
    return [
        {
            "title": "Leadershipsignaal",
            "value": f"{avg_signal:.1f}/10" if avg_signal is not None else "-",
            "body": "Samenvattend managementsignaal op basis van contextbeleving en actieve leiderschapsfactoren.",
        },
        {
            "title": "Managementrichting",
            "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "-",
            "body": "Lees deze richtingsvraag samen met het leadershipsignaal als check of de huidige aansturing werkbaar voelt.",
        },
        {
            "title": "Productgrens",
            "value": "Alleen groepsniveau",
            "body": "Leadership Scan blijft een geaggregeerde managementread zonder named leaders, hierarchy, 360-output of performanceframing.",
        },
        {
            "title": "Primair managementspoor",
            "value": factor_text,
            "body": LEADERSHIP_VALIDATE_BY_FACTOR.get(
                lead_factor_key,
                "Gebruik deze factor als eerste bounded verificatieroute in de managementcontext.",
            ),
        },
    ]


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Managementhypothesen",
        "intro_text": (
            "Onderstaande hypotheses helpen bepalen welk eerste managementspoor dit leadershipbeeld nu opent. "
            "Ze zijn bedoeld voor een bounded managementhuddle op groepsniveau, niet als bewijs van named leader kwaliteit."
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
                "title": f"Hypothese: {factor_label.lower()} vraagt nu de eerste managementhuddle",
                "body": LEADERSHIP_HYPOTHESIS_BODY_BY_FACTOR.get(
                    factor,
                    "Het leadershipbeeld laat zien dat dit managementspoor nu als eerste bounded verificatie of correctie vraagt.",
                ),
                "question": LEADERSHIP_VALIDATE_BY_FACTOR.get(
                    factor,
                    f"Welke beperkte managementcheck hoort nu eerst bij {factor_label.lower()}?",
                ),
                "action": LEADERSHIP_ACTION_BY_FACTOR.get(
                    factor,
                    "Beleg nu een kleine, zichtbare managementcorrectie of explicitering.",
                ),
                "owner": LEADERSHIP_OWNER_BY_FACTOR.get(
                    factor,
                    "HR lead met MT-sponsor",
                ),
            }
        )

    if not items and top_factor_labels:
        items.append(
            {
                "title": f"Hypothese: {top_factor_labels[0].lower()} vraagt nu eerst managementduiding",
                "body": "Leadership Scan laat zien welk managementspoor nu het eerste bestuurlijke gesprek verdient, zonder de route groter te maken dan een bounded read op groepsniveau.",
                "question": f"Welke kleine managementstap hoort nu eerst bij {top_factor_labels[0].lower()}?",
                "action": "Plan nu een beperkte managementhuddle en leg een eerste eigenaar, actie en reviewgrens vast.",
                "owner": "HR lead met MT-sponsor",
            }
        )

    return items


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de managementcontext"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = LEADERSHIP_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke managementcontext nu als eerste bounded verificatie vraagt rond {focus_text.lower()}.",
    )
    first_owner = LEADERSHIP_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR lead met MT-sponsor",
    )
    first_action = LEADERSHIP_ACTION_BY_FACTOR.get(
        lead_factor_key,
        f"Beleg nu een kleine, zichtbare managementstap rond {focus_text.lower()}.",
    )
    review_moment = LEADERSHIP_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Gebruik een volgende review alleen als bounded vervolg nadat de eerste managementstap expliciet is belegd.",
    )
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik Leadership Scan om één begrensde check te kiezen die past bij het bestaande people-signaal en de huidige managementcontext."
        ),
        "session_title": "Eerste begrensde check na oplevering",
        "session_intro": (
            "Houd de eerste sessie klein en bounded: kies eerst het primaire contextspoor, spreek daarna een kleine check af en leg de reviewgrens vast."
        ),
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste managementspoor.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste bounded stap",
                "body": LEADERSHIP_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {focus_text.lower()} als eerste bounded managementcheck.",
                ),
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementhuddle",
        "session_watchout": (
            "Gebruik deze sessie om te duiden, begrenzen en opvolgen. Leadership Scan blijft op groepsniveau, geen named leader route, geen 360-tool en geen performance-oordeel."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies nu het primaire managementspoor",
                "body": first_decision,
            },
            {
                "number": "2",
                "title": "Beleg direct een bounded eigenaar",
                "body": (
                    f"Benoem expliciet wie deze begrensde check trekt: {first_owner}. "
                    "Zo blijft Leadership Scan een compacte support-read in plaats van een open managementroute."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal het signaal naar 1 kleine corrigerende stap",
                "body": first_action,
            },
            {
                "number": "4",
                "title": "Leg review en productgrens expliciet vast",
                "body": review_moment,
            },
        ],
    }
