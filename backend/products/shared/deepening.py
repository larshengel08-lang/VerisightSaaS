"""Verdiepingsvragen bij lage factorscores (spec: docs/superpowers/specs/2026-07-03-verdiepingsvragen-design.md).

Content + pure logica. Geen invloed op scoring.
"""
from __future__ import annotations

from typing import Any

DEEPENING_FACTOR_KEYS = [
    "leadership", "culture", "growth", "compensation", "workload", "role_clarity",
]

DEEPENING_CAP = {"exit": 3, "retention": 2}

DEEPENING_SETS: dict[str, dict[str, Any]] = {
    "workload": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met werkbelasting?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met werkbelasting destijds?",
        },
        "options": [
            {
                "key": "wl_volume",
                "text": {
                    "retention": "Binnen mijn rol ligt er structureel meer werk dan redelijk is",
                    "exit": "Binnen mijn rol lag er structureel meer werk dan redelijk was",
                },
                "agenda": "Past het takenpakket binnen deze rollen nog bij wat redelijk is?",
            },
            {
                "key": "wl_recovery",
                "text": {
                    "retention": "Er is te weinig ruimte om te herstellen of werk goed af te ronden",
                    "exit": "Er was te weinig ruimte om te herstellen of werk goed af te ronden",
                },
                "agenda": "Hoe bewaken we herstel en afronding na piekperioden?",
            },
            {
                "key": "wl_priorities",
                "text": {
                    "retention": "Onduidelijke prioriteiten maken het zwaarder dan nodig",
                    "exit": "Onduidelijke prioriteiten maakten het zwaarder dan nodig",
                },
                "agenda": "Hoe maken we prioriteiten explicieter zodat werkdruk niet onnodig oploopt?",
            },
            {
                "key": "wl_capacity",
                "text": {
                    "retention": "De bezetting of planning sluit niet aan op het werk dat gedaan moet worden",
                    "exit": "De bezetting of planning sloot niet aan op het werk dat gedaan moest worden",
                },
                "agenda": "Sluiten bezetting en planning aan op het werkaanbod in de betrokken teams?",
            },
            {
                "key": "wl_peaks_adhoc",
                "text": {
                    "retention": "Piekmomenten, spoedwerk of druk vanuit klanten/productie maken het zwaar",
                    "exit": "Piekmomenten, spoedwerk of druk vanuit klanten/productie maakten het zwaar",
                },
                "agenda": "Hoe vangen we piek- en spoeddruk op zonder dat die structureel wordt?",
            },
            {
                "key": "wl_process",
                "text": {
                    "retention": "Processen, systemen of overdrachten kosten onnodig veel energie",
                    "exit": "Processen, systemen of overdrachten kostten onnodig veel energie",
                },
                "agenda": "Welke processen of systemen kosten nu de meeste onnodige energie?",
            },
            {
                "key": "wl_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
    "leadership": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met de aansturing?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met de aansturing destijds?",
        },
        "options": [
            {
                "key": "ld_feedback",
                "text": {
                    "retention": "Ik krijg te weinig bruikbare feedback of richting",
                    "exit": "Ik kreeg te weinig bruikbare feedback of richting",
                },
                "agenda": "Krijgen medewerkers genoeg bruikbare feedback en richting van hun leidinggevende?",
            },
            {
                "key": "ld_autonomy",
                "text": {
                    "retention": "Ik krijg te weinig ruimte om zelfstandig keuzes te maken",
                    "exit": "Ik kreeg te weinig ruimte om zelfstandig keuzes te maken",
                },
                "agenda": "Geven we medewerkers genoeg ruimte om zelfstandig keuzes te maken?",
            },
            {
                "key": "ld_support",
                "text": {
                    "retention": "Ik voel me onvoldoende gesteund als er problemen of spanningen zijn",
                    "exit": "Ik voelde me onvoldoende gesteund als er problemen of spanningen waren",
                },
                "agenda": "Voelen medewerkers zich gesteund als er problemen of spanningen zijn?",
            },
            {
                "key": "ld_recognition",
                "text": {
                    "retention": "Mijn inzet of bijdrage wordt te weinig gezien of gewaardeerd",
                    "exit": "Mijn inzet of bijdrage werd te weinig gezien of gewaardeerd",
                },
                "agenda": "Hoe zorgen we dat inzet en bijdrage zichtbaar gewaardeerd worden?",
            },
            {
                "key": "ld_availability",
                "text": {
                    "retention": "Mijn leidinggevende is te weinig beschikbaar of zichtbaar",
                    "exit": "Mijn leidinggevende was te weinig beschikbaar of zichtbaar",
                },
                "agenda": "Is de beschikbaarheid van leidinggevenden voldoende voor de omvang van hun teams?",
            },
            {
                "key": "ld_consistency",
                "text": {
                    "retention": "Besluiten of verwachtingen wisselen te vaak of zijn niet uitlegbaar",
                    "exit": "Besluiten of verwachtingen wisselden te vaak of waren niet uitlegbaar",
                },
                "agenda": "Zijn besluiten en verwachtingen consistent en uitlegbaar voor medewerkers?",
            },
            {
                "key": "ld_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
    "culture": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met de samenwerking in het team?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met de samenwerking in het team destijds?",
        },
        "options": [
            {
                "key": "cu_mistakes",
                "text": {
                    "retention": "Fouten of twijfels benoemen voelt niet veilig",
                    "exit": "Fouten of twijfels benoemen voelde niet veilig",
                },
                "agenda": "Is het veilig genoeg om fouten en twijfels te benoemen?",
            },
            {
                "key": "cu_dissent",
                "text": {
                    "retention": "Kritische vragen of afwijkende meningen krijgen weinig ruimte",
                    "exit": "Kritische vragen of afwijkende meningen kregen weinig ruimte",
                },
                "agenda": "Krijgen kritische vragen en afwijkende meningen genoeg ruimte?",
            },
            {
                "key": "cu_exclusion",
                "text": {
                    "retention": "Ik voel me onvoldoende betrokken of gehoord",
                    "exit": "Ik voelde me onvoldoende betrokken of gehoord",
                },
                "agenda": "Voelen medewerkers zich voldoende betrokken en gehoord?",
            },
            {
                "key": "cu_conflict",
                "text": {
                    "retention": "Spanningen of conflicten blijven te lang onbesproken",
                    "exit": "Spanningen of conflicten bleven te lang onbesproken",
                },
                "agenda": "Worden spanningen en conflicten op tijd besproken en opgepakt?",
            },
            {
                "key": "cu_behavior",
                "text": {
                    "retention": "Gedrag of afspraken worden niet consequent aangesproken",
                    "exit": "Gedrag of afspraken werden niet consequent aangesproken",
                },
                "agenda": "Worden gedrag en afspraken consequent aangesproken?",
            },
            {
                "key": "cu_cross_team",
                "text": {
                    "retention": "Samenwerking tussen teams of afdelingen loopt stroef",
                    "exit": "Samenwerking tussen teams of afdelingen liep stroef",
                },
                "agenda": "Waar loopt de samenwerking tussen teams of afdelingen vast?",
            },
            {
                "key": "cu_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
    "growth": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met groeiperspectief?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met groeiperspectief destijds?",
        },
        "options": [
            {
                "key": "gr_visibility",
                "text": {
                    "retention": "Ik zie niet welke mogelijkheden er voor mij zijn",
                    "exit": "Ik zag niet welke mogelijkheden er voor mij waren",
                },
                "agenda": "Zijn ontwikkelmogelijkheden zichtbaar genoeg voor medewerkers?",
            },
            {
                "key": "gr_conversation",
                "text": {
                    "retention": "Er wordt te weinig concreet met mij over ontwikkeling gesproken",
                    "exit": "Er werd te weinig concreet met mij over ontwikkeling gesproken",
                },
                "agenda": "Wordt er concreet genoeg met medewerkers over ontwikkeling gesproken?",
            },
            {
                "key": "gr_follow_through",
                "text": {
                    "retention": "Eerdere afspraken of verwachtingen over ontwikkeling komen niet van de grond",
                    "exit": "Eerdere afspraken of verwachtingen over ontwikkeling kwamen niet van de grond",
                },
                "agenda": "Komen gemaakte ontwikkelafspraken daadwerkelijk van de grond?",
            },
            {
                "key": "gr_time",
                "text": {
                    "retention": "Er is te weinig tijd of ruimte om mij te ontwikkelen",
                    "exit": "Er was te weinig tijd of ruimte om mij te ontwikkelen",
                },
                "agenda": "Is er in het werk genoeg tijd en ruimte voor ontwikkeling?",
            },
            {
                "key": "gr_criteria",
                "text": {
                    "retention": "Het is onduidelijk of inconsistent hoe doorgroei wordt bepaald",
                    "exit": "Het was onduidelijk of inconsistent hoe doorgroei werd bepaald",
                },
                "agenda": "Zijn de criteria voor doorgroei duidelijk en consistent?",
            },
            {
                "key": "gr_ceiling",
                "text": {
                    "retention": "Ik zit aan het plafond van wat hier voor mij mogelijk is",
                    "exit": "Ik zat aan het plafond van wat daar voor mij mogelijk was",
                },
                "agenda": "Welke perspectieven kunnen we bieden aan medewerkers die aan hun plafond zitten?",
            },
            {
                "key": "gr_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
    "compensation": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met beloning en voorwaarden?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met beloning en voorwaarden destijds?",
        },
        "options": [
            {
                "key": "cp_external",
                "text": {
                    "retention": "Mijn beloning voelt niet passend vergeleken met vergelijkbaar werk elders",
                    "exit": "Mijn beloning voelde niet passend vergeleken met vergelijkbaar werk elders",
                },
                "agenda": "Hoe verhoudt onze beloning zich tot vergelijkbaar werk elders?",
            },
            {
                "key": "cp_internal",
                "text": {
                    "retention": "De beloning voelt oneerlijk vergeleken met collega's of vergelijkbare functies",
                    "exit": "De beloning voelde oneerlijk vergeleken met collega's of vergelijkbare functies",
                },
                "agenda": "Is de interne verhouding tussen beloningen uitlegbaar?",
            },
            {
                "key": "cp_responsibility",
                "text": {
                    "retention": "De beloning past niet bij de zwaarte of verantwoordelijkheid van mijn werk",
                    "exit": "De beloning paste niet bij de zwaarte of verantwoordelijkheid van mijn werk",
                },
                "agenda": "Past de beloning bij de zwaarte en verantwoordelijkheid van het werk?",
            },
            {
                "key": "cp_growth",
                "text": {
                    "retention": "Er is te weinig perspectief op salarisgroei",
                    "exit": "Er was te weinig perspectief op salarisgroei",
                },
                "agenda": "Bieden we genoeg perspectief op salarisgroei?",
            },
            {
                "key": "cp_clarity",
                "text": {
                    "retention": "Het is onduidelijk hoe beloning of groei wordt bepaald",
                    "exit": "Het was onduidelijk hoe beloning of groei werd bepaald",
                },
                "agenda": "Is uitlegbaar hoe beloning en groei worden bepaald?",
            },
            {
                "key": "cp_flexibility",
                "text": {
                    "retention": "Rooster, werktijden of flexibiliteit sluiten onvoldoende aan bij wat ik nodig heb",
                    "exit": "Rooster, werktijden of flexibiliteit sloten onvoldoende aan bij wat ik nodig had",
                },
                "agenda": "Sluiten rooster, werktijden en flexibiliteit aan op wat medewerkers nodig hebben?",
            },
            {
                "key": "cp_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
    "role_clarity": {
        "question": {
            "retention": "Welke omschrijving past het best bij jouw ervaring met rolhelderheid?",
            "exit": "Welke omschrijving past het best bij jouw ervaring met rolhelderheid destijds?",
        },
        "options": [
            {
                "key": "rc_priorities",
                "text": {
                    "retention": "Binnen mijn rol is onduidelijk wat nu de belangrijkste prioriteiten zijn",
                    "exit": "Binnen mijn rol was onduidelijk wat de belangrijkste prioriteiten waren",
                },
                "agenda": "Weten medewerkers wat binnen hun rol de belangrijkste prioriteiten zijn?",
            },
            {
                "key": "rc_expectations",
                "text": {
                    "retention": "Het is mij onvoldoende duidelijk waarop ik word beoordeeld of aangesproken",
                    "exit": "Het was mij onvoldoende duidelijk waarop ik werd beoordeeld of aangesproken",
                },
                "agenda": "Is duidelijk waarop medewerkers worden beoordeeld en aangesproken?",
            },
            {
                "key": "rc_conflicting",
                "text": {
                    "retention": "Ik krijg tegenstrijdige opdrachten of verwachtingen",
                    "exit": "Ik kreeg tegenstrijdige opdrachten of verwachtingen",
                },
                "agenda": "Waar ontstaan tegenstrijdige opdrachten of verwachtingen?",
            },
            {
                "key": "rc_scope",
                "text": {
                    "retention": "Mijn takenpakket groeit of verschuift zonder duidelijke afspraken",
                    "exit": "Mijn takenpakket groeide of verschoof zonder duidelijke afspraken",
                },
                "agenda": "Maken we duidelijke afspraken als takenpakketten groeien of verschuiven?",
            },
            {
                "key": "rc_mandate",
                "text": {
                    "retention": "Het is onduidelijk wat ik zelf mag beslissen",
                    "exit": "Het was onduidelijk wat ik zelf mocht beslissen",
                },
                "agenda": "Is duidelijk wat medewerkers zelf mogen beslissen?",
            },
            {
                "key": "rc_information",
                "text": {
                    "retention": "Ik mis informatie, context of overdracht om mijn werk goed te kunnen doen",
                    "exit": "Ik miste informatie, context of overdracht om mijn werk goed te kunnen doen",
                },
                "agenda": "Krijgen medewerkers de informatie en overdracht die hun werk vraagt?",
            },
            {
                "key": "rc_other",
                "text": {"retention": "Anders, namelijk…", "exit": "Anders, namelijk…"},
                "agenda": None,
            },
        ],
    },
}


def get_deepening_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question_set_version, question, options (scan-specific text)."""
    out: dict[str, dict[str, Any]] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        raw = DEEPENING_SETS[fk]
        out[fk] = {
            "question_set_version": f"{scan_type}_{fk}_v1",
            "question": raw["question"][scan_type],
            "options": [{"key": o["key"], "text": o["text"][scan_type]} for o in raw["options"]],
        }
    return out


def get_agenda_question(scan_type: str, factor_key: str, option_key: str) -> str | None:
    for o in DEEPENING_SETS[factor_key]["options"]:
        if o["key"] == option_key:
            return o["agenda"]
    return None
