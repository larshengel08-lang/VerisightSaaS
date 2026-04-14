from __future__ import annotations

from typing import Any


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport is opgebouwd uit verkorte vraagblokken die inhoudelijk zijn geinspireerd door bestaande wetenschappelijke literatuur. "
            "Het gaat nadrukkelijk niet om volledige schaalafnames, een brede MTO of een diagnostisch instrument. "
            "De uitkomsten zijn bedoeld voor prioritering en gesprek op groepsniveau, niet voor een individueel oordeel of harde voorspelling."
        ),
        "method_text": (
            "Elke respondent krijgt een retentiesignaal op een schaal van 1 tot 10. "
            "Een hogere score betekent een sterker groepssignaal dat behoud aandacht vraagt. "
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
        "title": "Bevlogenheid, Stay-intent & Vertrekintentie",
        "intro": (
            "Deze pagina laat zien hoe retentiesignaal, bevlogenheid, stay-intent en vertrekintentie zich tot elkaar verhouden. "
            "Lees dit als groepsinformatie over waar behoud onder druk staat en welke werkfactoren daarbij waarschijnlijk het meest meespelen, niet als individuele risicoscore."
        ),
        "summary_title": "Behoudssignalen in samenhang",
        "signal_profile_text": profile_copy.get(
            retention_signal_profile,
            "Lees deze combinatie als groepssignaal: werkfactoren verklaren waar aandacht nodig is, bevlogenheid, stay-intent en vertrekintentie laten zien hoe scherp het signaal is.",
        ),
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
