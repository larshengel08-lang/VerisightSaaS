from __future__ import annotations

from typing import Any

from backend.products.retention.definition import SCAN_DEFINITION


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]


RETENTION_DECISION_BY_FACTOR = {
    "leadership": (
        "Beslis eerst in welke teams dit nu een direct managementgesprek vraagt en of het spoor vooral over feedback, richting of autonomie-ondersteuning gaat."
    ),
    "culture": (
        "Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat direct MT-opvolging verdient."
    ),
    "growth": (
        "Beslis of de eerste ingreep nu moet zitten in zicht op perspectief, feitelijke ontwikkelruimte of het gesprek daarover."
    ),
    "compensation": (
        "Beslis of het dominante vraagstuk nu hoogte, ervaren fairness of uitlegbaarheid van voorwaarden is en welke groep eerst opvolging vraagt."
    ),
    "workload": (
        "Beslis eerst in welke teams werk of prioriteit direct omlaag moet en welk deel van de druk nu structureel onhoudbaar is."
    ),
    "role_clarity": (
        "Beslis eerst waar prioriteiten, rolgrenzen of besluitvorming het meest uit elkaar lopen en welk team als eerste herstel vraagt."
    ),
}

RETENTION_OWNER_BY_FACTOR = {
    "leadership": "HR business partner met betrokken leidinggevende",
    "culture": "HR lead met betrokken MT-lid",
    "growth": "HR development-owner met betrokken leidinggevende",
    "compensation": "HR lead met MT of directie",
    "workload": "Betrokken leidinggevende met HR en operations",
    "role_clarity": "Betrokken leidinggevende met HR business partner",
}


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    retention_signal_profile: str | None,
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
    retention_theme_title: str | None,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de laagst scorende werkfactoren"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = (
        RETENTION_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Beslis eerst of {top_factor_text} nu vooral snelle verificatie of al gerichte 30-90 dagenopvolging vraagt."
    )
    first_owner = (
        RETENTION_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR lead met betrokken leidinggevende"

    if retention_signal_profile == "scherp_aandachtssignaal":
        group_body = (
            f"Het retentiesignaal en de aanvullende signalen wijzen dezelfde kant op. De scherpste managementduiding zit nu vooral in {top_factor_text}, "
            "in combinatie met aanvullende signalen die snelle verificatie vragen."
        )
    elif retention_signal_profile == "vertrekdenken_zichtbaar":
        group_body = (
            f"Expliciet vertrekdenken is zichtbaar op groepsniveau. Gebruik {top_factor_text} als eerste verificatiespoor om te bepalen waar behoud nu het meest onder druk staat."
        )
    elif retention_signal_profile == "overwegend_stabiel":
        group_body = (
            f"Het totaalbeeld oogt overwegend stabiel, maar {top_factor_text} bepalen nog steeds waar management de meeste winst kan boeken."
        )
    else:
        group_body = (
            f"Er is een vroegsignaal zichtbaar: nog geen breed crisisbeeld, maar wel genoeg reden om {top_factor_text} eerst te valideren."
        )

    metrics = []
    if avg_turnover_intention is not None:
        metrics.append(f"vertrekintentie {avg_turnover_intention:.1f}/10")
    if avg_stay_intent is not None:
        metrics.append(f"stay-intent {avg_stay_intent:.1f}/10")
    if avg_engagement is not None:
        metrics.append(f"bevlogenheid {avg_engagement:.1f}/10")
    metric_text = ", ".join(metrics) if metrics else "de aanvullende signalen rond behoud"

    verification_body = (
        f"Toets eerst hoe {top_factor_text} samenhangen met {metric_text}. "
        "Gebruik segmenten en open signalen daarna pas als gecontroleerde verdieping."
    )
    if retention_theme_title:
        verification_body += f" In open antwoorden komt {retention_theme_title.lower()} nu het vaakst terug."

    next_step = (
        f"Gebruik {top_factor_text} als eerste managementspoor, beleg {first_owner.lower()} als eigenaar "
        "en koppel daar direct een verificatiegesprek en een 30-90 dagenactie aan."
    )

    signal_profile_copy = {
        "scherp_aandachtssignaal": (
            "Retentiesignaal en aanvullende signalen wijzen dezelfde kant op. Dat vraagt snelle verificatie en duidelijke eigenaarschap op groepsniveau."
        ),
        "vertrekdenken_zichtbaar": (
            "Expliciet vertrekdenken is zichtbaar. Gebruik dit vooral om te bepalen waar een managementgesprek nu niet langer kan wachten."
        ),
        "overwegend_stabiel": (
            "Het totaalbeeld oogt overwegend stabiel, maar de laagst scorende werkfactoren bepalen nog steeds waar management de meeste winst kan boeken."
        ),
        "vroegsignaal": (
            "Er is een vroegsignaal zichtbaar: nog geen breed crisisbeeld, maar wel genoeg reden om prioriteiten en verificatie scherp te zetten."
        ),
    }
    signal_profile_value = {
        "scherp_aandachtssignaal": "Scherp aandachtssignaal",
        "vertrekdenken_zichtbaar": "Vertrekdenken zichtbaar",
        "overwegend_stabiel": "Overwegend stabiel",
        "vroegsignaal": "Vroegsignaal",
    }.get(retention_signal_profile, "Vroegsignaal")

    executive_intro = (
        f"RetentieScan maakt zichtbaar waar behoud op groepsniveau onder druk staat. Op dit moment zitten de scherpste signalen vooral in {top_factor_text}, "
        f"gelezen in samenhang met {metric_text}."
    )
    if retention_theme_title:
        executive_intro += f" In open antwoorden komt {retention_theme_title.lower()} nu het vaakst terug."

    trust_note = (
        "Lees RetentieScan als groeps- en segmentduiding voor verificatie en opvolging. Het rapport is geen brede MTO, "
        "geen individueel performance-instrument en geen gevalideerde voorspeller van vrijwillig vertrek. "
        "Dit blijft een v1-werkmodel: management ziet groepssignalen, geen individuele scores of persoonsgerichte interventieroutes. "
        "Detailweergave en segmentvergelijking blijven gekoppeld aan minimale n-grenzen zodat privacy, interpretatie en herleidbaarheid bewaakt blijven."
    )

    if retention_signal_profile == "scherp_aandachtssignaal":
        boardroom_relevance = (
            f"Retentiesignaal en aanvullende signalen wijzen dezelfde kant op. Daardoor verschuift {top_factor_text} van HR-signaal naar bestuurlijk aandachtspunt "
            "voor teamcontinuiteit, leiding en uitvoerbaarheid."
        )
    elif retention_signal_profile == "vertrekdenken_zichtbaar":
        boardroom_relevance = (
            f"Expliciet vertrekdenken is zichtbaar op groepsniveau. Dat maakt dit relevant voor prioritering en opvolging voordat druk op teams, "
            f"leiding of continuiteit verder oploopt rond {top_factor_text}."
        )
    else:
        boardroom_relevance = (
            f"Het beeld is vooral een vroegsignaal. Juist daarom vraagt {top_factor_text} nu bestuurlijke weging: wat moet eerst gevalideerd worden "
            "en wat kan nog wachten."
        )

    if avg_turnover_intention is not None and avg_turnover_intention >= 5.5:
        continuity_body = (
            "Vertrekintentie is zichtbaar genoeg om dit niet alleen als HR-signaal te behandelen. "
            "Zonder snelle verificatie en eigenaarschap groeit de kans dat teamcontinuiteit of leiderschapsbelasting onder druk komen te staan."
        )
    else:
        continuity_body = (
            "Het risico zit nu vooral in gemiste verificatie: te laat reageren maakt van een corrigeerbaar vroegsignaal sneller een breder behoudsvraagstuk."
        )

    boardroom_watchout = (
        "Lees dit niet als individuele risicolijst, predictor of performance-oordeel. "
        "RetentieScan helpt sneller wegen waar behoud op groepsniveau verificatie en opvolging vraagt, maar blijft een v1-werkmodel."
    )

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van het retentiesignaal",
        "findings_title": "Scherpste managementlezing",
        "executive_title": "Vroegsignalering op behoud voor HR, MT en directie",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor bestuur en management",
        "trust_note": trust_note,
        "boardroom_title": "Bestuurlijke handoff",
        "boardroom_intro": (
            "Deze bestuurlijke handoff helpt een sponsor, MT of directie snel zien waar behoudsdruk nu oploopt, "
            "waarom dat bestuurlijk telt, welk besluit eerst hoort en wat de eerste vervolgrichting is."
        ),
        "boardroom_cards": [
            {
                "title": "Wat speelt nu",
                "value": signal_profile_value,
                "body": group_body,
            },
            {
                "title": "Wat als je niets doet",
                "value": "Continuiteitsdruk",
                "body": continuity_body,
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg meteen wie verificatie en eerste opvolging trekt, zodat het groepssignaal niet tussen HR en management blijft hangen.",
            },
            {
                "title": "Eerste stap",
                "value": "Binnen 30-90 dagen",
                "body": next_step,
            },
            {
                "title": "Waarom telt dit nu",
                "value": "Bestuurlijke relevantie",
                "body": boardroom_relevance,
            },
        ],
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": boardroom_watchout,
        "highlight_cards": [
            {
                "title": "Groepsbeeld nu",
                "value": signal_profile_value,
                "body": group_body,
            },
            {
                "title": "Scherpste werkfactoren",
                "value": top_factor_value,
                "body": verification_body,
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg meteen wie verificatie en eerste opvolging trekt, zodat RetentieScan niet blijft hangen in alleen signalering.",
            },
            {
                "title": "Eerste managementspoor",
                "value": signal_profile_value,
                "body": signal_profile_copy.get(retention_signal_profile, signal_profile_copy["vroegsignaal"]),
            },
        ],
        "cards": [
            {
                "title": "Groepsbeeld nu",
                "body": group_body,
            },
            {
                "title": "Eerste verificatiespoor",
                "body": verification_body,
            },
            {
                "title": "Eerste besluit",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
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
            "Dit rapport is opgebouwd uit verkorte vraagblokken die inhoudelijk zijn geinspireerd door bestaande wetenschappelijke literatuur. "
            "Het gaat nadrukkelijk niet om volledige schaalafnames, een brede MTO of een diagnostisch instrument. "
            "De uitkomsten zijn bedoeld voor prioritering en gesprek op groepsniveau, niet voor een individueel oordeel of harde voorspelling."
        ),
        "method_text": (
            "In de analyse wordt per response een retentiesignaal op een schaal van 1 tot 10 berekend. "
            "Een hogere score betekent een sterker samenvattend groepssignaal dat behoud aandacht vraagt. "
            "De score is indicatief en bedoeld als gespreksinput, niet als causale voorspelling, benchmark of objectief oordeel. "
            "Voor RetentieScan is dit in v1 een gelijkgewogen samenvatting van SDT-werkbeleving en zes beinvloedbare werkfactoren. "
            "Bevlogenheid, vertrekintentie en stay-intent worden daarnaast apart gerapporteerd als aanvullende signalen rond behoud."
        ),
        "weight_rows": [
            ["Factor", "Bijdrage", "Hoe te lezen"],
            ["SDT Werkbeleving", "1.0 x", "Verklarende kernlaag voor autonomie, competentie en verbondenheid"],
            ["Leiderschap", "1.0 x", "Coachend leiderschap en autonomie-ondersteuning als beinvloedbare werkfactor"],
            ["Psychologische veiligheid & cultuurmatch", "1.0 x", "Pragmatisch signaal voor veiligheid, samenwerking en cultuurfit, geen volledige cultuurdiagnose"],
            ["Groeiperspectief", "1.0 x", "Ervaren ontwikkelruimte en perspectief binnen de organisatie"],
            ["Beloning & voorwaarden", "1.0 x", "Ervaren passendheid, uitlegbaarheid en bruikbaarheid van beloning en voorwaarden"],
            ["Werkbelasting", "1.0 x", "Acceptabele werkdruk en herstelmogelijkheden"],
            ["Rolhelderheid", "1.0 x", "Duidelijkheid over prioriteiten, verwachtingen en tegenstrijdige opdrachten"],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            ["Laag aandachtssignaal", "< 4.5", "Overwegend stabiel beeld. Er zijn relatief weinig directe signalen dat behoud nu breed onder druk staat."],
            ["Verhoogd aandachtssignaal", "4.5-7.0", "Gemengd beeld. Er zijn meerdere aandachtspunten die verificatie en prioritering vragen."],
            ["Sterk aandachtssignaal", ">= 7.0", "Een relatief scherp groepssignaal dat behoud aandacht vraagt. Dit is geen individuele voorspelling of causaliteitsclaim."],
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
    profile_copy = {
        "scherp_aandachtssignaal": "De combinatie van retentiesignaal, bevlogenheid, stay-intent en vertrekintentie wijst op een scherp groepssignaal dat behoud nu aandacht vraagt. Lees dit niet als individuele voorspelling, maar als prioritering voor verificatie en actie.",
        "vertrekdenken_zichtbaar": "De uitkomst laat expliciet vertrekdenken op groepsniveau zien. Dat vraagt snelle verificatie in combinatie met de laagst scorende werkfactoren en open verbetersignalen.",
        "vroegsignaal": "De uitkomst wijst op een vroegsignaal: er zijn aandachtspunten zichtbaar, maar nog niet elk signaal hoeft al op direct vertrekdenken te wijzen.",
        "overwegend_stabiel": "Het totaalbeeld oogt overwegend stabiel. Controleer vooral of de laagst scorende werkfactoren en open signalen aansluiten op wat teams nu nodig hebben.",
    }
    return {
        "title": "Retentiesignaal en aanvullende signalen",
        "intro": (
            "Deze pagina laat zien hoe retentiesignaal, bevlogenheid, stay-intent en vertrekintentie zich tot elkaar verhouden. "
            "Lees dit als groepsinformatie over waar behoud onder druk staat en welke werkfactoren nu als eerste verificatie vragen, niet als individuele beoordeling of voorspelling."
        ),
        "summary_title": "Retentiesignaal en aanvullende signalen",
        "signal_profile_title": "Hoe lees je deze combinatie?",
        "signal_profile_text": profile_copy.get(
            retention_signal_profile,
            "Lees deze combinatie als groepssignaal: werkfactoren laten zien waar aandacht nodig is, bevlogenheid, stay-intent en vertrekintentie helpen bepalen hoe scherp het aandachtspunt is.",
        ),
    }


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Werkhypothesen",
        "intro_text": (
            "Onderstaande hypothesen zijn afgeleid van werkfactoren, het retentiesignaal, aanvullende signalen rond behoud en open verbetersignalen. "
            "Ze helpen bepalen wat eerst geverifieerd moet worden voordat je acties opschaalt."
        ),
    }


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de scherpste werkfactoren"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = (
        RETENTION_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Beslis eerst of {focus_text.lower()} nu vooral snelle verificatie of al gerichte 30-90 dagenopvolging vragen."
    )
    first_owner = (
        RETENTION_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR lead met betrokken leidinggevende"
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik RetentieScan eerst om scherp te prioriteren en te verifieren. Pas daarna schaal je acties op of trek je bredere conclusies over behoud."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies binnen 2 weken het eerste managementspoor",
                "body": (
                    f"Bespreek het rapport met HR en betrokken leidinggevenden en maak expliciet welk besluit nu eerst telt: {first_decision}"
                ),
            },
            {
                "number": "2",
                "title": "Koppel elk aandachtspunt aan een eerste eigenaar",
                "body": (
                    f"Wijs {first_owner.lower()} aan als eerste eigenaar van {focus_text.lower()}. "
                    "Zo voorkom je dat RetentieScan blijft hangen in observatie zonder vervolg."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal verificatie naar maximaal 3 gerichte acties",
                "body": (
                    "Kies alleen acties die logisch volgen uit het groepsbeeld, de topfactoren en de aanvullende signalen rond behoud. "
                    "Voorkom dat open antwoorden of segmenten de hoofdlijn gaan overschrijven."
                ),
            },
            {
                "number": "4",
                "title": "Plan direct een evaluatie- of vervolgmeting",
                "body": (
                    "Leg nu al vast wanneer je terugkijkt of acties effect hebben en of het retentiesignaal, stay-intent en vertrekintentie verschuiven."
                ),
            },
        ],
    }


def get_action_playbooks_payload() -> dict[str, dict[str, dict[str, Any]]]:
    return {
        "leadership": {
            "HOOG": {
                "title": "Leiderschap vraagt directe opvolging",
                "decision": "Beslis eerst in welke teams dit nu een direct managementgesprek vraagt en of het spoor vooral over feedback, richting of autonomie-ondersteuning gaat.",
                "validate": "Toets in welke teams het vooral gaat om richting, feedback, waardering of autonomie-ondersteuning.",
                "owner": "HR business partner met betrokken leidinggevende",
                "actions": [
                    "Start een vast manager check-in ritme in de meest afwijkende teams.",
                    "Maak coachend leiderschap en autonomie-ondersteuning expliciet onderdeel van het volgende managementgesprek.",
                ],
                "caution": "Behandel dit niet direct als een generiek leiderschapsprobleem zonder team- en contextcheck.",
            },
            "MIDDEN": {
                "title": "Leiderschap is een corrigeerbaar aandachtspunt",
                "decision": "Beslis of dit signaal nu al een gerichte leidinggevende opvolging vraagt, of eerst een beperkt verificatiespoor in enkele teams.",
                "validate": "Controleer of het signaal breed speelt of geconcentreerd zit in een paar teams of rollen.",
                "owner": "HR business partner",
                "actions": [
                    "Voeg een korte check toe op feedback, waardering en ontwikkelgesprekken in de eerstvolgende teamcyclus.",
                    "Laat managers ophalen waar medewerkers nu vooral meer steun of richting nodig hebben.",
                ],
                "caution": "Ga niet te snel uit van een individueel managersprobleem als de context ook meespeelt.",
            },
        },
        "culture": {
            "HOOG": {
                "title": "Veiligheid en samenwerking vragen snelle validatie",
                "decision": "Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat direct MT-opvolging verdient.",
                "validate": "Toets waar medewerkers zich het minst vrij voelen om zorgen, fouten of afwijkende meningen te delen.",
                "owner": "HR lead met betrokken MT-lid",
                "actions": [
                    "Plan een teamsessie over veiligheid en samenwerking in de meest afwijkende groepen.",
                    "Maak concreet welk gedrag gewenst is en welk gedrag niet langer acceptabel is.",
                ],
                "caution": "Noem dit niet meteen een organisatiebreed cultuurprobleem als het mogelijk om enkele teams gaat.",
            },
            "MIDDEN": {
                "title": "Cultuursignalen vragen verfijning",
                "decision": "Beslis welk deel eerst verificatie vraagt: psychologische veiligheid, samenwerking of fit met de huidige manier van werken.",
                "validate": "Onderzoek of het vooral gaat om psychologische veiligheid, samenwerking of fit met de huidige manier van werken.",
                "owner": "HR lead",
                "actions": [
                    "Gebruik teamleadsessies om te toetsen waar medewerkers zich onvoldoende gehoord of veilig voelen.",
                    "Neem cultuur- en veiligheidssignalen mee in de eerstvolgende leidinggevendendialoog.",
                ],
                "caution": "Houd onderscheid tussen brede cultuur en lokale teamdynamiek.",
            },
        },
        "growth": {
            "HOOG": {
                "title": "Groeiperspectief ontbreekt te zichtbaar",
                "decision": "Beslis of de eerste ingreep nu moet zitten in zicht op perspectief, feitelijke ontwikkelruimte of het gesprek daarover.",
                "validate": "Toets of medewerkers vooral een volgende stap missen of dat ontwikkelruimte in de huidige rol al tekortschiet.",
                "owner": "HR development-owner met betrokken leidinggevende",
                "actions": [
                    "Maak groeipaden en interne kansen zichtbaar voor de sterkst afwijkende groepen.",
                    "Laat managers benoemen welke ontwikkelroute realistisch en uitlegbaar is.",
                ],
                "caution": "Beloof geen doorgroei die organisatorisch niet realistisch is.",
            },
            "MIDDEN": {
                "title": "Groei is een oplosbaar aandachtspunt",
                "decision": "Beslis of medewerkers nu vooral meer zicht, meer gesprek of meer feitelijke ontwikkelruimte nodig hebben.",
                "validate": "Check of medewerkers vooral meer zicht, meer gesprek of meer feitelijke ontwikkelruimte nodig hebben.",
                "owner": "HR development-owner",
                "actions": [
                    "Voeg een compacte ontwikkelvraag toe aan de eerstvolgende check-in.",
                    "Maak bestaande leer- of mobiliteitsopties beter zichtbaar.",
                ],
                "caution": "Verwar gebrek aan zicht op groei niet automatisch met gebrek aan loyaliteit.",
            },
        },
        "compensation": {
            "HOOG": {
                "title": "Beloning en voorwaarden vragen bestuurlijke duiding",
                "decision": "Beslis of het dominante vraagstuk nu hoogte, ervaren fairness of uitlegbaarheid van voorwaarden is en welke groep eerst opvolging vraagt.",
                "validate": "Controleer of de pijn vooral zit in hoogte, transparantie of passendheid van voorwaarden.",
                "owner": "HR lead met MT of directie",
                "actions": [
                    "Maak de beloningslogica en groeiregels voor de betrokken groepen beter uitlegbaar.",
                    "Bepaal of een gerichte fairness- of marktcheck nodig is.",
                ],
                "caution": "Ga niet uit van een puur salarisprobleem als uitleg en ervaren eerlijkheid ook meespelen.",
            },
            "MIDDEN": {
                "title": "Beloning speelt mee, maar vraagt nuance",
                "decision": "Beslis of dit eerst een communicatie- en uitlegvraag is of al een inhoudelijk voorwaardenbesluit vraagt.",
                "validate": "Onderzoek of medewerkers vooral meer helderheid of feitelijk betere voorwaarden verwachten.",
                "owner": "HR lead",
                "actions": [
                    "Verduidelijk hoe beloning en voorwaarden samenhangen met rol, groei en verwachtingen.",
                    "Inventariseer of het signaal bij enkele groepen sterker is dan organisatiebreed.",
                ],
                "caution": "Communicatie alleen lost het probleem niet op als de feitelijke passendheid onvoldoende is.",
            },
        },
        "workload": {
            "HOOG": {
                "title": "Werkdruk vraagt directe ontlasting",
                "decision": "Beslis eerst in welke teams werk of prioriteit direct omlaag moet en welk deel van de druk nu structureel onhoudbaar is.",
                "validate": "Breng in kaart waar belasting structureel is en waar prioriteiten, planning of bezetting uit balans zijn.",
                "owner": "Betrokken leidinggevende met HR en operations",
                "actions": [
                    "Voer direct een werklastreview uit in de meest afwijkende teams.",
                    "Schrap, herprioriteer of verplaats werk binnen 30 dagen waar dat aantoonbaar lucht geeft.",
                ],
                "caution": "Noem het niet alleen een perceptieprobleem als teams feitelijk te weinig ruimte of capaciteit hebben.",
            },
            "MIDDEN": {
                "title": "Werkdruk is zichtbaar, maar nog corrigeerbaar",
                "decision": "Beslis of dit vooral piekdruk, structurele overbelasting of een prioriteringsvraag is voordat je acties breder maakt.",
                "validate": "Toets of het vooral om piekdruk, structurele overbelasting of onvoldoende regelruimte gaat.",
                "owner": "Betrokken leidinggevende met HR business partner",
                "actions": [
                    "Maak in teamoverleggen ruimte om werkdruk, planning en herstel expliciet te bespreken.",
                    "Volg 1-2 teams extra nauw in de komende 30-90 dagen.",
                ],
                "caution": "Een gemengd signaal kan snel verslechteren als het genegeerd wordt.",
            },
        },
        "role_clarity": {
            "HOOG": {
                "title": "Prioriteiten en rolgrenzen zijn te diffuus",
                "decision": "Beslis eerst waar prioriteiten, rolgrenzen of besluitvorming het meest uit elkaar lopen en welk team als eerste herstel vraagt.",
                "validate": "Toets waar verwachtingen, beslisruimte of tegenstrijdige opdrachten nu het minst helder zijn.",
                "owner": "Betrokken leidinggevende met HR business partner",
                "actions": [
                    "Maak per team een kort overzicht van prioriteiten, rolgrenzen en escalatiepunten.",
                    "Laat leidinggevenden expliciet benoemen wat nu wel en niet in elke rol wordt verwacht.",
                ],
                "caution": "Probeer dit niet op te lossen met alleen functiebeschrijvingen; dagelijkse prioritering is meestal de echte bron.",
            },
            "MIDDEN": {
                "title": "Rolhelderheid vraagt explicitering",
                "decision": "Beslis welk deel nu eerst scherp moet worden gezet: prioriteiten, eigenaarschap of dagelijkse besluitvorming.",
                "validate": "Onderzoek of het vooral gaat om prioriteiten, eigenaarschap of onduidelijke besluitvorming.",
                "owner": "Betrokken leidinggevende",
                "actions": [
                    "Gebruik teamoverleggen om prioriteiten en rolverwachtingen explicieter te maken.",
                    "Leg voor de meest afwijkende groepen vast waar verwarring nu vooral ontstaat.",
                ],
                "caution": "Zonder expliciete follow-up blijft rolhelderheid vaak een terugkerend sluimerpunt.",
            },
        },
    }


def get_action_playbook_calibration_note() -> str:
    return (
        "Deze playbooks zijn v1-richtlijnen op basis van werkfactoren en signaalpatronen. "
        "We ijken ze na de eerste pilotronde op echte RetentieScan-data, zodat prioriteiten en vervolgacties beter aansluiten op wat in de praktijk het meeste effect heeft."
    )
