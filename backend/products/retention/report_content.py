from __future__ import annotations

from typing import Any


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    retention_signal_profile: str | None,
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
    retention_theme_title: str | None,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de laagst scorende werkfactoren"
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"

    if retention_signal_profile == "scherp_aandachtssignaal":
        group_body = (
            f"Meerdere behoudssignalen wijzen dezelfde kant op. De scherpste managementduiding zit nu vooral in {top_factor_text}, "
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
    metric_text = ", ".join(metrics) if metrics else "de aanvullende behoudssignalen"

    verification_body = (
        f"Toets eerst hoe {top_factor_text} samenhangen met {metric_text}. "
        "Gebruik segmenten en open signalen daarna pas als gecontroleerde verdieping."
    )
    if retention_theme_title:
        verification_body += f" In open antwoorden komt {retention_theme_title.lower()} nu het vaakst terug."

    next_step = (
        f"Gebruik {top_factor_text} als eerste managementspoor en koppel daar één verificatiegesprek en één 30-90 dagenactie aan. "
        "Zo blijft RetentieScan een route van signalering naar gerichte opvolging."
    )

    signal_profile_copy = {
        "scherp_aandachtssignaal": (
            "Meerdere behoudssignalen wijzen dezelfde kant op. Dat vraagt snelle verificatie en duidelijke eigenaarschap op groepsniveau."
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
        "geen individueel performance-instrument en geen gevalideerde voorspeller van vrijwillig vertrek."
    )

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van behoudssignalen",
        "findings_title": "Scherpste managementlezing",
        "executive_title": "Behoudssignalen voor HR, MT en directie",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor bestuur en management",
        "trust_note": trust_note,
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
            "Bevlogenheid, vertrekintentie en stay-intent worden daarnaast apart gerapporteerd als aanvullende behoudssignalen."
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
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    profile_copy = {
        "scherp_aandachtssignaal": "De combinatie van retentiesignaal, bevlogenheid, stay-intent en vertrekintentie wijst op een scherp groepssignaal dat behoud nu aandacht vraagt. Lees dit niet als individuele voorspelling, maar als prioritering voor verificatie en actie.",
        "vertrekdenken_zichtbaar": "De uitkomst laat expliciet vertrekdenken op groepsniveau zien. Dat vraagt snelle verificatie in combinatie met de laagst scorende werkfactoren en open verbetersignalen.",
        "vroegsignaal": "De uitkomst wijst op een vroegsignaal: er zijn aandachtspunten zichtbaar, maar nog niet elk signaal hoeft al op direct vertrekdenken te wijzen.",
        "overwegend_stabiel": "Het totaalbeeld oogt overwegend stabiel. Controleer vooral of de laagst scorende werkfactoren en open signalen aansluiten op wat teams nu nodig hebben.",
    }
    return {
        "title": "Behoudssignalen in samenhang",
        "intro": (
            "Deze pagina laat zien hoe retentiesignaal, bevlogenheid, stay-intent en vertrekintentie zich tot elkaar verhouden. "
            "Lees dit als groepsinformatie over waar behoud onder druk staat en welke werkfactoren nu als eerste verificatie vragen, niet als individuele beoordeling of voorspelling."
        ),
        "summary_title": "Behoudssignalen in samenhang",
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
            "Onderstaande hypothesen zijn afgeleid van werkfactoren, behoudssignalen en open verbetersignalen. "
            "Ze helpen bepalen wat eerst geverifieerd moet worden voordat je acties opschaalt."
        ),
    }


def get_next_steps_payload(*, top_focus_labels: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de scherpste werkfactoren"
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik RetentieScan eerst om scherp te prioriteren en te verifiëren. Pas daarna schaal je acties op of trek je bredere conclusies over behoud."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Valideer binnen 2 weken het groepsbeeld",
                "body": (
                    f"Bespreek het rapport met HR en betrokken leidinggevenden en gebruik {focus_text} als eerste verificatiespoor. "
                    "Toets vooral of het signaal breed speelt of geconcentreerd zit in enkele teams of rollen."
                ),
            },
            {
                "number": "2",
                "title": "Koppel elk aandachtspunt aan een eigenaar",
                "body": (
                    "Wijs per thema één eigenaar aan voor verificatie en opvolging. "
                    "Zo voorkom je dat RetentieScan blijft hangen in observatie zonder vervolg."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal verificatie naar maximaal 3 gerichte acties",
                "body": (
                    "Kies alleen acties die logisch volgen uit het groepsbeeld, de topfactoren en de aanvullende behoudssignalen. "
                    "Voorkom dat open antwoorden of segmenten de hoofdlijn gaan overschrijven."
                ),
            },
            {
                "number": "4",
                "title": "Plan direct een evaluatie- of vervolgmeting",
                "body": (
                    "Leg nu al vast wanneer je terugkijkt of acties effect hebben en of retentiesignalen, stay-intent en vertrekintentie verschuiven."
                ),
            },
        ],
    }


def get_action_playbooks_payload() -> dict[str, dict[str, dict[str, Any]]]:
    return {
        "leadership": {
            "HOOG": {
                "title": "Leiderschap vraagt directe opvolging",
                "validate": "Toets in welke teams het vooral gaat om richting, feedback, waardering of autonomie-ondersteuning.",
                "actions": [
                    "Start een vast manager check-in ritme in de meest afwijkende teams.",
                    "Maak coachend leiderschap en autonomie-ondersteuning expliciet onderdeel van het volgende managementgesprek.",
                ],
                "caution": "Behandel dit niet direct als een generiek leiderschapsprobleem zonder team- en contextcheck.",
            },
            "MIDDEN": {
                "title": "Leiderschap is een corrigeerbaar aandachtspunt",
                "validate": "Controleer of het signaal breed speelt of geconcentreerd zit in een paar teams of rollen.",
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
                "validate": "Toets waar medewerkers zich het minst vrij voelen om zorgen, fouten of afwijkende meningen te delen.",
                "actions": [
                    "Plan een teamsessie over veiligheid en samenwerking in de meest afwijkende groepen.",
                    "Maak concreet welk gedrag gewenst is en welk gedrag niet langer acceptabel is.",
                ],
                "caution": "Noem dit niet meteen een organisatiebreed cultuurprobleem als het mogelijk om enkele teams gaat.",
            },
            "MIDDEN": {
                "title": "Cultuursignalen vragen verfijning",
                "validate": "Onderzoek of het vooral gaat om psychologische veiligheid, samenwerking of fit met de huidige manier van werken.",
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
                "validate": "Toets of medewerkers vooral een volgende stap missen of dat ontwikkelruimte in de huidige rol al tekortschiet.",
                "actions": [
                    "Maak groeipaden en interne kansen zichtbaar voor de sterkst afwijkende groepen.",
                    "Laat managers benoemen welke ontwikkelroute realistisch en uitlegbaar is.",
                ],
                "caution": "Beloof geen doorgroei die organisatorisch niet realistisch is.",
            },
            "MIDDEN": {
                "title": "Groei is een oplosbaar aandachtspunt",
                "validate": "Check of medewerkers vooral meer zicht, meer gesprek of meer feitelijke ontwikkelruimte nodig hebben.",
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
                "validate": "Controleer of de pijn vooral zit in hoogte, transparantie of passendheid van voorwaarden.",
                "actions": [
                    "Maak de beloningslogica en groeiregels voor de betrokken groepen beter uitlegbaar.",
                    "Bepaal of een gerichte fairness- of marktcheck nodig is.",
                ],
                "caution": "Ga niet uit van een puur salarisprobleem als uitleg en ervaren eerlijkheid ook meespelen.",
            },
            "MIDDEN": {
                "title": "Beloning speelt mee, maar vraagt nuance",
                "validate": "Onderzoek of medewerkers vooral meer helderheid of feitelijk betere voorwaarden verwachten.",
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
                "validate": "Breng in kaart waar belasting structureel is en waar prioriteiten, planning of bezetting uit balans zijn.",
                "actions": [
                    "Voer direct een werklastreview uit in de meest afwijkende teams.",
                    "Schrap, herprioriteer of verplaats werk binnen 30 dagen waar dat aantoonbaar lucht geeft.",
                ],
                "caution": "Noem het niet alleen een perceptieprobleem als teams feitelijk te weinig ruimte of capaciteit hebben.",
            },
            "MIDDEN": {
                "title": "Werkdruk is zichtbaar, maar nog corrigeerbaar",
                "validate": "Toets of het vooral om piekdruk, structurele overbelasting of onvoldoende regelruimte gaat.",
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
                "validate": "Toets waar verwachtingen, beslisruimte of tegenstrijdige opdrachten nu het minst helder zijn.",
                "actions": [
                    "Maak per team een kort overzicht van prioriteiten, rolgrenzen en escalatiepunten.",
                    "Laat leidinggevenden expliciet benoemen wat nu wel en niet in elke rol wordt verwacht.",
                ],
                "caution": "Probeer dit niet op te lossen met alleen functiebeschrijvingen; dagelijkse prioritering is meestal de echte bron.",
            },
            "MIDDEN": {
                "title": "Rolhelderheid vraagt explicitering",
                "validate": "Onderzoek of het vooral gaat om prioriteiten, eigenaarschap of onduidelijke besluitvorming.",
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
