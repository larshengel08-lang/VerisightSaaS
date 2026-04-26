from __future__ import annotations

from typing import Any

from backend.products.shared.management_language import (
    MANAGEMENT_BAND_LABELS,
    management_band_label,
)
from backend.products.team.definition import SCAN_DEFINITION


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]
MIN_SAFE_TEAM_GROUP = 5

TEAM_DECISION_BY_FACTOR = {
    "leadership": (
        "Beslis welke afdeling nu eerst een lokale check op richting, steun of escalatie vraagt."
    ),
    "culture": (
        "Beslis welke afdeling nu eerst expliciet op veiligheid en samenwerking moet worden getoetst."
    ),
    "growth": (
        "Beslis welke afdeling nu eerst zicht op ontwikkeling of perspectief moet terugkrijgen."
    ),
    "compensation": (
        "Beslis of dit lokaal vooral een fairness-, voorwaarden- of uitlegbaarheidsspoor is."
    ),
    "workload": (
        "Beslis welke afdeling nu direct drukbron, planning of prioritering moet verlichten."
    ),
    "role_clarity": (
        "Beslis welke afdeling nu direct prioriteiten, rolgrenzen of eigenaarschap moet verduidelijken."
    ),
}

TEAM_OWNER_BY_FACTOR = {
    "leadership": "HR business partner met verantwoordelijke afdelingsleider",
    "culture": "HR lead met afdelingsverantwoordelijke",
    "growth": "HR development-owner met afdelingslead",
    "compensation": "HR lead",
    "workload": "Afdelingsleider met HR en operations",
    "role_clarity": "Afdelingsleider met HR business partner",
}

TEAM_VALIDATE_BY_FACTOR = {
    "leadership": "Toets waar medewerkers vooral richting, beschikbaarheid of steun missen in hun directe werkcontext.",
    "culture": "Toets waar zorgen of frictie in de directe werkcontext te laat of te onveilig bespreekbaar worden.",
    "growth": "Toets of medewerkers lokaal vooral meer perspectief, gesprek of feitelijke ruimte missen.",
    "compensation": "Toets waar voorwaarden of ervaren eerlijkheid nu het sterkst schuren in de directe werkcontext.",
    "workload": "Toets of het om structurele overbelasting, piekdruk of gebrek aan herstel gaat.",
    "role_clarity": "Toets waar tegenstrijdige opdrachten of rolgrenzen lokaal het meeste frictie geven.",
}

TEAM_ACTION_BY_FACTOR = {
    "leadership": "Plan binnen 2 weken een kort afdelingsgesprek over richting, steun en escalatie.",
    "culture": "Plan een korte afdelingsreview op veiligheid en samenwerking.",
    "growth": "Maak binnen 30 dagen een concrete vervolgstap of perspectiefgesprek zichtbaar voor de betrokken afdeling.",
    "compensation": "Doe een gerichte check op de meest afwijkende afdeling of rolcontext.",
    "workload": "Voer binnen 2 weken een korte lokale werklastreview uit.",
    "role_clarity": "Maak binnen 30 dagen prioriteiten en rolgrenzen expliciet voor de betrokken afdeling.",
}

TEAM_REVIEW_BY_FACTOR = {
    "leadership": "Doe binnen 30-45 dagen een lokale hercheck of dit afdelingsspoor echt rustiger is geworden.",
    "culture": "Plan binnen 30-45 dagen een hercheck op dezelfde lokale context.",
    "growth": "Kijk binnen 30-45 dagen opnieuw of dit lokale groeisignaal minder scherp is.",
    "compensation": "Herlees dit signaal pas nadat de lokale check op fairness of voorwaarden is gedaan.",
    "workload": "Plan binnen 30 dagen een lokale check of de ontlasting echt voelbaar was.",
    "role_clarity": "Plan een lokale hercheck of de rolverwarring ook echt kleiner is geworden.",
}

TEAM_HYPOTHESIS_BODY_BY_FACTOR = {
    "leadership": "De scherpste lokale spanning lijkt nu te zitten in richting, steun of escalatie in een beperkt aantal afdelingen.",
    "culture": "Het lokale signaal wijst vooral op veiligheid, bespreekbaarheid of samenwerkingsritme dat per afdeling uit elkaar loopt.",
    "growth": "Het lokale signaal lijkt vooral te draaien om zicht op perspectief of ontwikkelruimte in een beperkt deel van de organisatie.",
    "compensation": "Het lokale signaal vraagt eerst verificatie of het vooral om fairness, voorwaarden of uitlegbaarheid in enkele afdelingen gaat.",
    "workload": "De grootste lokale spanning lijkt nu te zitten in werkdruk, prioritering of herstel in een beperkt aantal afdelingen.",
    "role_clarity": "Het lokale signaal wijst vooral op onduidelijke prioriteiten, rolgrenzen of eigenaarschap in enkele afdelingen.",
}


def _get_team_safe_group_stats(*, responses: list[Any]) -> tuple[int, int]:
    groups: dict[str, int] = {}
    for response in responses:
        respondent = getattr(response, "respondent", None)
        department = getattr(respondent, "department", None)
        if not department or not str(department).strip():
            continue
        key = str(department).strip()
        groups[key] = groups.get(key, 0) + 1

    safe_groups = sum(1 for count in groups.values() if count >= MIN_SAFE_TEAM_GROUP)
    return safe_groups, len(groups)


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    responses: list[Any] | None = None,
    avg_stay_intent: float | None = None,
    **_: Any,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de lokale werkcontext"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = TEAM_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke afdeling nu als eerste een bounded lokale check op {top_factor_text} vraagt.",
    )
    first_owner = TEAM_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR business partner met verantwoordelijke afdelingsleider",
    )
    first_action = TEAM_ACTION_BY_FACTOR.get(
        lead_factor_key,
        "Plan binnen 2 weken een korte lokale check op de afdeling die nu het sterkst afwijkt.",
    )
    review_moment = TEAM_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Plan binnen 30-45 dagen een lokale hercheck en kies dan expliciet of TeamScan nog een tweede bounded stap verdient.",
    )

    safe_groups, total_groups = _get_team_safe_group_stats(responses=responses or [])
    if safe_groups == 0:
        local_state_value = "Lokale read in opbouw"
        local_state_body = (
            "Er is nog geen veilige afdelingsvergelijking zichtbaar. Lees TeamScan nu vooral als bounded lokale contextlaag "
            "en verbeter eerst respons of department-metadata voordat je afdelingen tegen elkaar afzet. "
            "Schakel hier terug naar bredere duiding in plaats van lokale volgorde te suggereren."
        )
    elif safe_groups == 1:
        local_state_value = "1 veilige afdeling zichtbaar"
        local_state_body = (
            "Er is nu 1 afdeling veilig leesbaar. Gebruik die afdeling als eerste lokale verificatiehaak, "
            "maar claim nog geen brede volgorde tussen afdelingen."
        )
    else:
        suppressed_groups = max(total_groups - safe_groups, 0)
        local_state_value = f"{safe_groups} veilige afdelingen"
        local_state_body = (
            f"{safe_groups} van {total_groups} afdelingen zijn nu veilig leesbaar. Gebruik dit om te kiezen "
            "welke afdeling eerst verificatie vraagt, niet om managerranking of harde causaliteit te suggereren."
            f" {suppressed_groups} kleinere afdeling(en) blijven bewust onderdrukt."
        )

    direction_body = (
        f"De lokale richtingsvraag staat nu op {avg_stay_intent:.1f}/10. "
        "Lees die score samen met werkbeleving en actieve werkfactoren als check of de directe werkcontext nu houdbaar voelt."
        if avg_stay_intent is not None
        else "De lokale richtingsvraag helpt bepalen of de directe werkcontext nu houdbaar en steunend voelt."
    )

    trust_note = (
        "Lees TeamScan als veilige department-first lokalisatielaag. Het rapport helpt kiezen waar een eerste lokale check nodig is, "
            "wie die trekt en wanneer je weer terugschakelt naar bredere duiding. Dit is geen managerbeoordeling, geen named-leader output, "
        "geen hierarchy-model en geen bewijs dat een lokale oorzaak vaststaat. Kleine groepen blijven onderdrukt."
    )

    executive_intro = (
        f"TeamScan vertaalt een bestaand signaal naar een bounded lokale managementread. Op dit moment zit de scherpste lokale verificatieroute vooral in {top_factor_text}. "
        "Gebruik het rapport om afdelingen veilig te vergelijken, een eerste eigenaar te benoemen en een bounded lokale check te starten."
    )

    return {
        "section_title": "Lokale handoff",
        "distribution_title": "Verdeling van het teamsignaal",
        "findings_title": "Scherpste lokale managementlezing",
        "executive_title": "Lokale duiding voor HR en afdelingsleiding",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor management",
        "trust_note": trust_note,
        "boardroom_title": "Lokale handoff",
        "boardroom_intro": (
            "Deze handoff helpt snel zien waar het teamsignaal lokaal het scherpst speelt, "
            "welke afdeling eerst een bounded check vraagt en hoe TeamScan bewust begrensd blijft."
        ),
        "boardroom_cards": [
            {
                "title": "Wat speelt nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"De scherpste lokale spanning zit nu vooral in {top_factor_text}. Gebruik dat als eerste bounded verificatiespoor.",
            },
            {
                "title": "Waar zit de meeste druk",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": f"{top_factor_text.capitalize()} kleuren nu het sterkst waar TeamScan eerst lokaal moet worden geverifieerd.",
            },
            {
                "title": "Lokale leesbaarheid",
                "value": local_state_value,
                "body": local_state_body,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg direct wie de eerste lokale managementcheck trekt, zodat TeamScan geen losse lokalisatietabel blijft.",
            },
            {
                "title": "Reviewmoment",
                "value": "30-45 dagen",
                "body": review_moment,
            },
        ],
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": (
            "Lees TeamScan niet als managerranking, named-leader oordeel of bewijs dat een afdelingsoorzaak vaststaat. "
            "De waarde zit in lokaliseren, verifieren en daarna bewust begrenzen."
        ),
        "highlight_cards": [
            {
                "title": "Teamsignaal nu",
                "value": management_band_label(band="MIDDEN"),
                "body": f"Gebruik {top_factor_text} als eerste lokale verificatieroute.",
            },
            {
                "title": "Primair lokaal spoor",
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
                "body": "Deze combinatie trekt de eerste bounded lokale check en bewaakt tegelijk de productgrens.",
            },
            {
                "title": "Eerste bounded stap",
                "value": "Lokale verificatie",
                "body": first_action,
            },
            {
                "title": "Reviewmoment",
                "value": "Binnen 30-45 dagen",
                "body": review_moment,
            },
        ],
        "cards": [
            {
                "title": "Lokale leesbaarheid",
                "body": local_state_body,
            },
            {
                "title": "Eerste verificatiespoor",
                "body": TEAM_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {top_factor_text} als eerste bounded check op afdelingsniveau.",
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
            "Dit rapport vertaalt TeamScan naar een formeel leesbare lokale managementoutput. "
            "De methodiek blijft compact en bounded: TeamScan helpt lokaliseren, verifieren en begrenzen, "
            "niet om brede teamdiagnose, managerranking of hierarchy-uitspraken te doen."
        ),
        "method_text": (
            "TeamScan berekent per response een teamsignaal op een schaal van 1 tot 10. "
            "Het teamsignaal combineert drie korte werkbelevingsitems, de actieve werkfactoren in deze campaign "
            "en een lokale richtingsvraag. Hogere score betekent een scherper lokaal aandachtssignaal dat eerst "
            "verificatie op afdelingsniveau vraagt."
        ),
        "weight_rows": [
            ["Bron", "Bijdrage", "Hoe te lezen"],
            ["Korte werkbeleving", "1.0 x", "Compacte read op werkbaarheid, toerusting en ervaren steun in de directe werkcontext."],
            ["Actieve werkfactoren", "1.0 x", "De geselecteerde TeamScan-factoren laten zien waar het lokale signaal inhoudelijk het scherpst zit."],
            ["Lokale richtingsvraag", "Contextlaag", "Laat zien of de directe werkcontext nu houdbaar en steunend voelt; bedoeld als extra lokale duiding."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            [MANAGEMENT_BAND_LABELS["LAAG"], "< 4.5", "Nog geen scherp lokaal aandachtssignaal; vooral monitoren en later herlezen."],
            [MANAGEMENT_BAND_LABELS["MIDDEN"], "4.5-7.0", "Lokaal aandachtspunt dat eerst bounded verificatie vraagt voordat je verder lokaliseert."],
            [MANAGEMENT_BAND_LABELS["HOOG"], ">= 7.0", "Lokale spanning die nu als eerste afdelingscheck moet worden gewogen, zonder managerclaim of causale zekerheid."],
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
        "title": "Teamsignaal en lokale context",
        "intro": (
            "Deze pagina laat zien hoe het teamsignaal, de lokale richtingsvraag en de scherpste werkfactoren samenkomen. "
            "Lees dit als bounded lokale managementread op afdelingsniveau, niet als manageroordeel of brede teamdiagnose."
        ),
        "summary_title": "Lokale context in samenhang",
        "signal_profile_title": "Hoe lees je dit lokale beeld?",
        "signal_profile_text": (
            "Gebruik het teamsignaal om te kiezen waar eerst een afdelingscheck nodig is. "
            "De lokale richtingsvraag en de scherpste werkfactoren helpen daarna bepalen welke bounded check logisch is."
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
    safe_groups, total_groups = _get_team_safe_group_stats(responses=responses)
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    factor_text = top_factor_labels[0] if top_factor_labels else "Werkcontext"
    coverage_value = (
        "Nog in opbouw"
        if safe_groups == 0
        else f"{safe_groups} veilige afdeling(en)"
    )
    coverage_body = (
        "Er zijn nog geen afdelingen met voldoende responses voor veilige lokale vergelijking. "
            "Schakel terug naar bredere duiding totdat lokale leesbaarheid eerlijk gedragen wordt."
        if safe_groups == 0
        else f"{safe_groups} van {total_groups} afdelingen zijn veilig leesbaar in deze TeamScan; kleinere groepen blijven bewust onderdrukt."
    )
    return [
        {
            "title": "Teamsignaal",
            "value": f"{avg_signal:.1f}/10" if avg_signal is not None else "-",
            "body": "Samenvattend lokaal signaal op basis van werkbeleving en actieve werkfactoren.",
        },
        {
            "title": "Lokale richting",
            "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "-",
            "body": "Lees deze richtingsvraag samen met teamsignaal en werkfactoren als check of de directe werkcontext houdbaar voelt.",
        },
        {
            "title": "Veilige afdelingsread",
            "value": coverage_value,
            "body": coverage_body,
        },
        {
            "title": "Primair lokaal spoor",
            "value": factor_text,
            "body": TEAM_VALIDATE_BY_FACTOR.get(
                lead_factor_key,
                "Gebruik deze factor als eerste bounded verificatieroute op afdelingsniveau.",
            ),
        },
    ]


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Lokale werkhypothesen",
        "intro_text": (
            "Onderstaande hypotheses helpen bepalen waar TeamScan eerst een bounded lokale check vraagt. "
            "Ze zijn bedoeld voor verificatie op afdelingsniveau, niet als bewijs dat een teamoorzaak al vaststaat."
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
                "title": f"Hypothese: {factor_label.lower()} concentreert zich lokaal",
                "body": TEAM_HYPOTHESIS_BODY_BY_FACTOR.get(
                    factor,
                    "Het lokale signaal lijkt vooral in een beperkt aantal afdelingen samen te komen.",
                ),
                "question": TEAM_VALIDATE_BY_FACTOR.get(
                    factor,
                    f"Welke afdeling vraagt nu als eerste een bounded check op {factor_label.lower()}?",
                ),
                "action": TEAM_ACTION_BY_FACTOR.get(
                    factor,
                    "Plan binnen 2 weken een korte lokale check en leg een eerste beperkte correctie vast.",
                ),
                "owner": TEAM_OWNER_BY_FACTOR.get(
                    factor,
                    "HR business partner met verantwoordelijke afdelingsleider",
                ),
            }
        )

    if not items and top_factor_labels:
        items.append(
            {
                "title": f"Hypothese: {top_factor_labels[0].lower()} vraagt eerst lokale verificatie",
                "body": "TeamScan laat zien waar eerst een bounded lokale check nodig is voordat de organisatie bredere conclusies trekt.",
                "question": f"Welke afdeling moet nu als eerste worden geverifieerd op {top_factor_labels[0].lower()}?",
                "action": "Plan binnen 2 weken een beperkte lokale managementcheck en leg daarna een reviewmoment vast.",
                "owner": "HR business partner met verantwoordelijke afdelingsleider",
            }
        )

    return items


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de lokale werkcontext"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = TEAM_DECISION_BY_FACTOR.get(
        lead_factor_key,
        f"Beslis welke afdeling nu als eerste een bounded lokale check op {focus_text.lower()} vraagt.",
    )
    first_owner = TEAM_OWNER_BY_FACTOR.get(
        lead_factor_key,
        "HR business partner met verantwoordelijke afdelingsleider",
    )
    first_action = TEAM_ACTION_BY_FACTOR.get(
        lead_factor_key,
        f"Plan binnen 2 weken een beperkte lokale check op {focus_text.lower()}.",
    )
    review_moment = TEAM_REVIEW_BY_FACTOR.get(
        lead_factor_key,
        "Plan binnen 30-45 dagen een lokale hercheck en kies dan expliciet of TeamScan nog een tweede bounded stap verdient.",
    )
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik TeamScan om snel te kiezen waar eerst een afdelingscheck nodig is, wie die trekt en wanneer je weer terugschakelt naar bredere duiding."
        ),
        "session_title": "Eerste lokale managementsessie na oplevering",
        "session_intro": (
            "Houd de eerste sessie klein en bounded: kies eerst de afdeling voor verificatie, maak daarna eigenaar, eerste stap en reviewmoment expliciet."
        ),
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste lokale verificatiespoor.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste bounded check",
                "body": TEAM_VALIDATE_BY_FACTOR.get(
                    lead_factor_key,
                    f"Gebruik {focus_text.lower()} als eerste bounded lokale check.",
                ),
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementsessie",
        "session_watchout": (
            "Gebruik deze sessie om te lokaliseren, verifieren en begrenzen. TeamScan is geen managerranking, geen named-leader route en geen brede teamdiagnose."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies binnen 2 weken de eerste afdeling voor verificatie",
                "body": first_decision,
            },
            {
                "number": "2",
                "title": "Beleg direct een bounded eigenaar",
                "body": (
                    f"Wijs {first_owner.lower()} aan als eerste eigenaar van dit lokale spoor, zodat TeamScan niet blijft hangen in alleen lokalisatie."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal het signaal naar 1 beperkte lokale correctie",
                "body": first_action,
            },
            {
                "number": "4",
                "title": "Leg expliciet het reviewmoment vast",
                "body": review_moment,
            },
        ],
    }
