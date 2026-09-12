"""Verdiepingsvragen bij lage factorscores (spec: docs/superpowers/specs/2026-07-03-verdiepingsvragen-design.md).

Content + pure logica. Geen invloed op scoring.
"""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

DEEPENING_FACTOR_KEYS = [
    "leadership", "culture", "growth", "compensation", "workload", "role_clarity",
]

# Cap op aantal verdiepingen per respondent; gebruikt door triggerlogica.
# Retention 2->3 per spec 2026-07-05 (gespreksrichting-ronde).
DEEPENING_CAP = {"exit": 3, "retention": 3}

# Autoritatief antwoord op "welke scans hebben verdiepingsvragen".
DEEPENING_SCAN_TYPES = frozenset(DEEPENING_CAP)

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


SAME = object()
"""Sentinel: de exit-tekst is bewust identiek aan de behoud-tekst."""


def _t(retention: str, exit_text: str | object) -> dict[str, str]:
    """Respondenttekst per scan. Geef SAME door als de exit-tekst bewust
    gelijk is; nooit impliciet, zodat een vergeten verleden tijd opvalt.
    """
    return {"retention": retention,
            "exit": retention if exit_text is SAME else exit_text}


def _q(onderwerp: str) -> dict[str, str]:
    return {
        "retention": (f"Van deze onderwerpen scoorde {onderwerp} bij jou het laagst. "
                      "Wat zou hier volgens jou het meest helpen?"),
        "exit": (f"Van deze onderwerpen scoorde {onderwerp} bij jou het laagst. "
                 "Wat had hier volgens jou het meest geholpen?"),
    }


def _none(prefix: str) -> dict[str, Any]:
    return {"key": f"{prefix}_none",
            "text": _t("Niets, dit zit hier goed", "Niets, dit zat hier goed"),
            "imperative": None}


def _other(prefix: str) -> dict[str, Any]:
    return {"key": f"{prefix}_other", "text": _t("Anders, namelijk…", SAME), "imperative": None}


# Versie per scan: retention v1 -> v2 (optieset gewijzigd: *_none toegevoegd,
# vraag herformuleerd, losgekoppeld van de verdieping); exit is nieuw.
DIRECTION_VERSION: dict[str, str] = {"retention": "v2", "exit": "v1"}

# Autoritatief antwoord op "welke scans hebben de gespreksrichting-vraag".
DIRECTION_SCAN_TYPES = frozenset(DIRECTION_VERSION)

# Richtingsets (spec 2026-09-07 par. 8). `imperative` is de opdrachtvorm voor het
# rapportblok "Wat er moet gebeuren": tijd-neutraal, de stem van de respondenten.
DIRECTION_SETS: dict[str, dict[str, Any]] = {
    "workload": {
        "question": _q("werkbelasting"),
        "options": [
            _none("wld"),
            {"key": "wld_scope",
             "text": _t("Takenpakket en werkvolume beter afbakenen", SAME),
             "imperative": "Baken het takenpakket en het werkvolume scherper af."},
            {"key": "wld_planning",
             "text": _t("Planning en bezetting beter laten aansluiten op het werk dat er ligt", SAME),
             "imperative": "Laat planning en bezetting beter aansluiten op het werk dat er ligt."},
            {"key": "wld_peaks",
             "text": _t("Piekmomenten en spoedwerk eerder plannen, verdelen of begrenzen", SAME),
             "imperative": "Plan piekmomenten en spoedwerk eerder, verdeel ze beter of begrens ze."},
            {"key": "wld_recovery",
             "text": _t("Meer ruimte om te herstellen en werk goed af te ronden", SAME),
             "imperative": "Maak meer ruimte om te herstellen en werk goed af te ronden."},
            {"key": "wld_priorities",
             "text": _t("Duidelijkere keuzes over wat voorrang heeft en wat kan wachten", SAME),
             "imperative": "Maak duidelijker wat voorrang heeft en wat kan wachten."},
            {"key": "wld_friction",
             "text": _t("Minder dubbel werk, systeemgedoe of fouten in overdracht", SAME),
             "imperative": "Haal dubbel werk, systeemgedoe en fouten in de overdracht weg."},
            _other("wld"),
        ],
    },
    "leadership": {
        "question": _q("de aansturing"),
        "options": [
            _none("ldd"),
            {"key": "ldd_feedback",
             "text": _t("Meer bruikbare feedback en richting", SAME),
             "imperative": "Geef meer bruikbare feedback en richting."},
            {"key": "ldd_mandate",
             "text": _t("Duidelijker wat ik zelf mag beslissen in mijn werk",
                        "Duidelijker wat ik zelf mocht beslissen in mijn werk"),
             "imperative": "Maak duidelijker wat medewerkers zelf mogen beslissen."},
            {"key": "ldd_escalation",
             "text": _t("Duidelijkere steun als er spanningen zijn of situaties vastlopen",
                        "Duidelijkere steun als er spanningen waren of situaties vastliepen"),
             "imperative": "Bied duidelijkere steun als er spanningen zijn of situaties vastlopen."},
            {"key": "ldd_recognition",
             "text": _t("Concretere terugkoppeling op wat goed gaat en wat wordt gewaardeerd",
                        "Concretere terugkoppeling op wat goed ging en wat werd gewaardeerd"),
             "imperative": "Koppel concreter terug wat goed gaat en wat wordt gewaardeerd."},
            {"key": "ldd_availability",
             "text": _t("Meer beschikbaarheid en zichtbaarheid van mijn leidinggevende", SAME),
             "imperative": "Zorg dat leidinggevenden beschikbaarder en zichtbaarder zijn."},
            {"key": "ldd_consistency",
             "text": _t("Stabielere en beter uitlegbare besluiten en verwachtingen", SAME),
             "imperative": "Maak besluiten en verwachtingen stabieler en beter uitlegbaar."},
            _other("ldd"),
        ],
    },
    "culture": {
        "question": _q("de samenwerking in het team"),
        "options": [
            _none("cud"),
            {"key": "cud_safety",
             "text": _t("Fouten of twijfels makkelijker en veiliger kunnen bespreken", SAME),
             "imperative": "Maak het makkelijker en veiliger om fouten of twijfels te bespreken."},
            {"key": "cud_dissent",
             "text": _t("Meer ruimte voor kritische vragen en afwijkende meningen", SAME),
             "imperative": "Geef kritische vragen en afwijkende meningen meer ruimte."},
            {"key": "cud_conflict",
             "text": _t("Spanningen of conflicten eerder bespreekbaar maken", SAME),
             "imperative": "Maak spanningen of conflicten eerder bespreekbaar."},
            {"key": "cud_agreements",
             "text": _t("Duidelijkere teamafspraken over gedrag, samenwerking en opvolging", SAME),
             "imperative": "Maak duidelijkere teamafspraken over gedrag, samenwerking en opvolging."},
            {"key": "cud_involvement",
             "text": _t("Eerder betrokken worden bij besluiten of veranderingen die het team raken",
                        "Eerder betrokken worden bij besluiten of veranderingen die het team raakten"),
             "imperative": "Betrek medewerkers eerder bij besluiten of veranderingen die het team raken."},
            {"key": "cud_crossteam",
             "text": _t("Betere samenwerking tussen teams of afdelingen", SAME),
             "imperative": "Verbeter de samenwerking tussen teams of afdelingen."},
            _other("cud"),
        ],
    },
    "growth": {
        "question": _q("groeiperspectief"),
        "options": [
            _none("grd"),
            {"key": "grd_visibility",
             "text": _t("Beter zicht op welke mogelijkheden er voor mij zijn",
                        "Beter zicht op welke mogelijkheden er voor mij waren"),
             "imperative": "Maak zichtbaar welke mogelijkheden er voor medewerkers zijn."},
            {"key": "grd_conversation",
             "text": _t("Een concreter gesprek over mijn ontwikkeling", SAME),
             "imperative": "Voer een concreter gesprek over ontwikkeling."},
            {"key": "grd_followthrough",
             "text": _t("Ontwikkelafspraken concreter vastleggen en zichtbaar opvolgen", SAME),
             "imperative": "Leg ontwikkelafspraken concreter vast en volg ze zichtbaar op."},
            {"key": "grd_time",
             "text": _t("Ontwikkeling beter inplannen naast het reguliere werk", SAME),
             "imperative": "Plan ontwikkeling in naast het reguliere werk."},
            {"key": "grd_criteria",
             "text": _t("Duidelijkere criteria voor hoe doorgroei wordt bepaald",
                        "Duidelijkere criteria voor hoe doorgroei werd bepaald"),
             "imperative": "Maak duidelijker hoe doorgroei wordt bepaald."},
            {"key": "grd_nextstep",
             "text": _t("Een open en concreet gesprek over realistische vervolgstappen binnen de organisatie", SAME),
             "imperative": "Voer een open en concreet gesprek over realistische vervolgstappen binnen de organisatie."},
            _other("grd"),
        ],
    },
    "compensation": {
        "question": _q("beloning en voorwaarden"),
        "options": [
            _none("cpd"),
            {"key": "cpd_insight",
             "text": _t("Beter inzicht in hoe beloning zich verhoudt tot vergelijkbaar werk elders",
                        "Beter inzicht in hoe beloning zich verhield tot vergelijkbaar werk elders"),
             "imperative": "Geef inzicht in hoe de beloning zich verhoudt tot vergelijkbaar werk elders."},
            {"key": "cpd_explain",
             "text": _t("Meer uitlegbaarheid van verschillen tussen vergelijkbare functies", SAME),
             "imperative": "Leg verschillen tussen vergelijkbare functies beter uit."},
            {"key": "cpd_review",
             "text": _t("Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk",
                        "Beter kijken of beloning paste bij de zwaarte en verantwoordelijkheid van mijn werk"),
             "imperative": "Kijk opnieuw of de beloning past bij de zwaarte en verantwoordelijkheid van het werk."},
            {"key": "cpd_path",
             "text": _t("Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing", SAME),
             "imperative": "Geef duidelijkheid over mogelijke salarisgroei, voorwaarden en timing."},
            {"key": "cpd_clarity",
             "text": _t("Meer duidelijkheid over hoe beloning en groei worden bepaald",
                        "Meer duidelijkheid over hoe beloning en groei werden bepaald"),
             "imperative": "Maak duidelijk hoe beloning en groei worden bepaald."},
            {"key": "cpd_flex",
             "text": _t("Meer duidelijkheid of ruimte rond rooster, werktijden of flexibiliteit", SAME),
             "imperative": "Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit."},
            _other("cpd"),
        ],
    },
    "role_clarity": {
        "question": _q("duidelijkheid over je rol"),
        "options": [
            _none("rcd"),
            {"key": "rcd_priorities",
             "text": _t("Duidelijkere prioriteiten binnen mijn rol", SAME),
             "imperative": "Maak de prioriteiten binnen rollen duidelijker."},
            {"key": "rcd_expectations",
             "text": _t("Duidelijkheid over verwachtingen en waarop ik word aangesproken",
                        "Duidelijkheid over verwachtingen en waarop ik werd aangesproken"),
             "imperative": "Maak duidelijk wat er wordt verwacht en waarop medewerkers worden aangesproken."},
            {"key": "rcd_alignment",
             "text": _t("Eenduidigere opdrachten en betere afstemming tussen betrokkenen", SAME),
             "imperative": "Maak opdrachten eenduidiger en stem beter af tussen betrokkenen."},
            {"key": "rcd_scope",
             "text": _t("Duidelijke afspraken als mijn takenpakket verandert",
                        "Duidelijke afspraken als mijn takenpakket veranderde"),
             "imperative": "Maak duidelijke afspraken wanneer een takenpakket verandert."},
            {"key": "rcd_mandate",
             "text": _t("Duidelijkheid over wat ik zelf mag beslissen",
                        "Duidelijkheid over wat ik zelf mocht beslissen"),
             "imperative": "Maak duidelijk wat medewerkers zelf mogen beslissen."},
            {"key": "rcd_information",
             "text": _t("Betere informatie, context en overdracht voor mijn werk", SAME),
             "imperative": "Zorg voor betere informatie, context en overdracht."},
            _other("rcd"),
        ],
    },
}


def get_direction_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question_set_version, question, options (key+text, scan-specifiek).
    `imperative` blijft server-side (alleen voor het rapport).
    """
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        raw = DIRECTION_SETS[fk]
        out[fk] = {
            "question_set_version": f"{scan_type}_{fk}_direction_{DIRECTION_VERSION[scan_type]}",
            "question": raw["question"][scan_type],
            "options": [{"key": o["key"], "text": o["text"][scan_type]} for o in raw["options"]],
        }
    return out


def direction_option_texts(scan_type: str, factor_key: str) -> dict[str, str]:
    """key -> respondenttekst voor het rapport (verdelingstabel, niets-optie)."""
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    return {o["key"]: o["text"][scan_type] for o in DIRECTION_SETS[factor_key]["options"]}


def direction_imperative(scan_type: str, factor_key: str, option_key: str) -> str | None:
    """Opdrachtvorm van een route; None voor *_none en *_other.

    `scan_type` wordt gevalideerd maar niet gebruikt: de opdrachtvorm is
    tijd-neutraal. Zelfde signatuur als get_agenda_question, zodat callers
    de twee niet door elkaar halen.
    """
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    options = {o["key"]: o["imperative"] for o in DIRECTION_SETS[factor_key]["options"]}
    if option_key not in options:
        raise KeyError(f"unknown option_key {option_key!r} for factor {factor_key!r}")
    return options[option_key]


def _factor_items(org_raw: dict[str, int], factor_key: str) -> list[int]:
    return [v for k, v in org_raw.items()
            if k.startswith(f"{factor_key}_") and isinstance(v, int)]


def _is_triggered(items: list[int]) -> bool:
    if not items:
        return False
    avg = sum(items) / len(items)
    if avg <= 2.5:
        return True
    if min(items) == 1 and avg <= 3.5:
        return True
    if sum(1 for v in items if v <= 2) >= 2:
        return True
    return False


_PriorityKey = tuple[float, int, int, int]


def _priority_key(items: list[int], factor_key: str) -> _PriorityKey:
    """Eén prioriteitsregel per respondent voor verdieping én richting
    (spec 2026-09-07 par. 5.1): laagste gemiddelde -> meeste stellingen <=2 ->
    laagste minimum -> vaste factorvolgorde.

    NB: dit is de respondent-niveau regel. Het rapport ordent factoren op
    groepsniveau met een eigen weging (_select_priority_factors in report_html.py).

    `items` mag niet leeg zijn; beide callers filteren daar zelf op.
    """
    avg = sum(items) / len(items)
    low_count = sum(1 for v in items if v <= 2)
    return (avg, -low_count, min(items), DEEPENING_FACTOR_KEYS.index(factor_key))


def compute_deepening_offers(org_raw: dict[str, int], scan_type: str) -> list[str]:
    """Getriggerde factoren, geprioriteerd via _priority_key en afgekapt op de scan-cap."""
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    triggered: list[tuple[_PriorityKey, str]] = []
    for fk in DEEPENING_FACTOR_KEYS:
        items = _factor_items(org_raw, fk)
        if _is_triggered(items):
            triggered.append((_priority_key(items, fk), fk))
    triggered.sort()
    return [fk for _, fk in triggered[:DEEPENING_CAP[scan_type]]]


def compute_direction_factor(org_raw: dict[str, int]) -> str | None:
    """De eigen laagst scorende werkfactor van een respondent (spec par. 5.1).

    Zelfde sleutel als de verdieping, maar zonder triggerfilter: iedereen met
    minstens één beantwoorde stelling krijgt een factor. None alleen zonder
    stellingen (dan is er geen richtingvraag).
    """
    candidates: list[tuple[_PriorityKey, str]] = []
    for fk in DEEPENING_FACTOR_KEYS:
        items = _factor_items(org_raw, fk)
        if items:
            candidates.append((_priority_key(items, fk), fk))
    if not candidates:
        return None
    return min(candidates)[1]


def get_deepening_sets(scan_type: str) -> dict[str, dict[str, Any]]:
    """Per factor: question_set_version, question, options (scan-specific text)."""
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        raw = DEEPENING_SETS[fk]
        out[fk] = {
            "question_set_version": f"{scan_type}_{fk}_v1",
            "question": raw["question"][scan_type],
            "options": [{"key": o["key"], "text": o["text"][scan_type]} for o in raw["options"]],
        }
    return out


def aggregate_deepening(
    rows: list[tuple[dict[str, int], list[dict] | None]],
    scan_type: str,
) -> dict[str, dict[str, Any]]:
    """Per factor de volledige noemer-keten (spec 6.1) + keuze-verdelingen.

    rows: per respondent (org_raw, deepening_responses).
    triggered = trigger vuurde (ongeacht cap); offered = entry aanwezig;
    answered/skipped = status; counts alleen over answered.

    NB: offered > triggered is mogelijk bij historische data (bijv. gewijzigde
    triggerregels of optiesets) en wordt bewust getolereerd.

    Een eventueel genest `direction`-veld uit het juli-formaat wordt hier genegeerd;
    de richting leeft sinds spec 2026-09-07 in survey_responses.direction_response.
    """
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {
        fk: {"triggered": 0, "offered": 0, "answered": 0, "skipped": 0,
             "primary_counts": {}, "secondary_counts": {}}
        for fk in DEEPENING_FACTOR_KEYS
    }
    for org_raw, entries in rows:
        for fk in DEEPENING_FACTOR_KEYS:
            if _is_triggered(_factor_items(org_raw, fk)):
                out[fk]["triggered"] += 1
        for e in entries or []:
            agg = out.get(e["factor_key"])
            if agg is None:
                continue
            agg["offered"] += 1
            if e["status"] == "answered":
                agg["answered"] += 1
                if e.get("primary"):
                    agg["primary_counts"][e["primary"]] = agg["primary_counts"].get(e["primary"], 0) + 1
                if e.get("secondary"):
                    agg["secondary_counts"][e["secondary"]] = agg["secondary_counts"].get(e["secondary"], 0) + 1
            else:
                agg["skipped"] += 1
    return out


DIRECTION_MIN_N = 3          # vloer voor het rapportblok (spec par. 5.4; bewust lager dan MIN_SEGMENT_N,
                             # zie spec par. 6.3: subgroep onzichtbaar voor de organisatie)
DIRECTION_CAVEAT_MAX_N = 4   # caveat-drempel = DIRECTION_MIN_N + 1 (dekt n in {3, 4}); niet los wijzigen
DIRECTION_OTHER_WARN_N = 8   # vanaf hier een reviewvlag als *_other de topoptie is

# Vloer voor elke uitspraak over de verdiepingskeuzes: onder dit aantal
# beantwoorders kan "geen duidelijke meerderheid" feitelijk onwaar zijn (5 van
# de 6 kozen hetzelfde). Eén keer gedefinieerd en op de drie plekken gebruikt
# waar hij werkt: agenda_enrichment (de verrijkingsstaffel hieronder), de
# verdiepingsstaat in report_priority.py en de uitlegregel onder de ranglijst in
# report_html.py, die het getal in klantcopy noemt. Wijzigen raakt die drie
# samen; dat is de bedoeling.
DEEPENING_MIN_N = 8

# Grootste groep zonder meerderheid (spec ronde 2 par. 4.2). Onder ruim een
# derde van de beantwoorders is "de grootste groep" geen zinvolle uitspraak
# meer; daarboven met een voorsprong van TOP_CHOICE_MIN_LEAD wel.
DIRECTION_PLURALITY_MIN_SHARE = 0.35
# Verdeeld over wel of niets (spec ronde 2 par. 4.3): alleen op een factor die
# kwetsbaar scoort. Dezelfde grens als _factor_label en ZONE_LOW gebruiken,
# zodat er geen tweede kwetsbaar-definitie in het product ontstaat.
DIRECTION_SPLIT_NONE_MAX_SCORE = 5.0

# Voorsprong die de meest gekozen optie op de volgende nodig heeft om als een
# duidelijk signaal te tellen: een verschil van 1 is ruis. Een keer gedefinieerd
# en op alle drie de plekken gebruikt waar hij werkt: direction_state (staat
# `clear`), agenda_enrichment (verrijkingsstaffel) en de richting-tie-break in
# het prioriteringsraster (report_priority.py). Wijzigen raakt die drie samen;
# dat is de bedoeling.
TOP_CHOICE_MIN_LEAD = 2


def aggregate_direction(
    rows: list[tuple[dict[str, int], dict[str, Any] | None]],
    scan_type: str,
) -> dict[str, dict[str, Any]]:
    """Per factor de keten laagst -> aangeboden -> beantwoord/overgeslagen + keuzeverdeling
    (spec 2026-09-07 par. 5.3).

    rows: per respondent (org_raw, direction_response | None).
    lowest_n wordt herberekend uit org_raw (niet uit het opgeslagen veld), zodat de
    keten ook klopt als een oude client niets meestuurde (lowest_n > offered).

    Een status-`answered`-rij zonder `choice` telt als answered maar draagt niet bij
    aan counts (mirrort aggregate_deepening): een datadefect mag nooit als "sloeg
    over" in het rapport belanden (spec par. 6.1). Het gevolg is answered >=
    sum(counts), wat de clear-drempel in direction_state alleen strenger maakt --
    de veilige kant voor een eerlijkheidscontract.
    """
    if scan_type not in DIRECTION_VERSION:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    out: dict[str, dict[str, Any]] = {
        fk: {"lowest_n": 0, "offered": 0, "answered": 0, "skipped": 0, "counts": {}}
        for fk in DEEPENING_FACTOR_KEYS
    }
    for org_raw, dr in rows:
        lowest = compute_direction_factor(org_raw)
        if lowest is not None:
            out[lowest]["lowest_n"] += 1
        if not dr:
            continue
        agg = out.get(dr["factor_key"])
        if agg is None:
            continue
        agg["offered"] += 1
        if dr["status"] == "answered":
            agg["answered"] += 1
            if dr.get("choice"):
                agg["counts"][dr["choice"]] = agg["counts"].get(dr["choice"], 0) + 1
        else:
            agg["skipped"] += 1
    # Tweede lus, bewust apart van de rij-lus hierboven: lowest_n is pas compleet
    # nadat alle respondenten zijn verwerkt, dus deze check kan niet in dezelfde
    # lus als de rij-verwerking worden gevouwen.
    for fk, agg in out.items():
        if agg["offered"] > agg["lowest_n"]:
            # Anders dan offered > triggered bij aggregate_deepening (verwacht bij
            # historische triggerregelwijzigingen), kan dit hier niet ontstaan zonder
            # bug: de servervalidatie staat alleen de eigen laagste factor toe. Deze
            # aggregatie vertrouwt daar bewust niet blind op en logt het als signaal.
            logger.warning("direction: offered > lowest_n voor %s (%d > %d)",
                           fk, agg["offered"], agg["lowest_n"])
    return out


def direction_state(agg: dict[str, Any], factor_key: str,
                    factor_score: float | None = None) -> dict[str, Any]:
    """Staat van het richtingblok voor een factor (spec par. 5.4, uitgebreid in
    stresstest ronde 2 par. 4), geëvalueerd in de volgorde
    too_few -> none_needed -> clear -> split_none -> plurality -> divided.

    factor_score is nodig voor split_none: die staat bestaat alleen op een
    factor die kwetsbaar scoort. Zonder score valt die tak weg en blijft het
    gedrag gelijk aan voor ronde 2.

    Retourneert altijd {state, n, top_key, top_n, second_n, none_n, none_key,
    ranked}; none_key staat erbij zodat de renderer de niets-optie met haar
    eigen (scan-specifieke, dus voor Loep Vertrek verleden-tijd) tekst kan
    citeren in plaats van met een hardgecodeerde zin.
    """
    n = agg["answered"]
    counts: dict[str, int] = agg.get("counts") or {}
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    base: dict[str, Any] = {"n": n, "ranked": ranked, "top_key": None, "top_n": 0,
                            "second_n": 0, "none_n": 0, "none_key": None}
    if n < DIRECTION_MIN_N:
        return {**base, "state": "too_few"}
    if not counts:
        raise ValueError(
            f"direction_state: answered={n} maar geen counts voor {factor_key!r}")
    # Precies één *_none-optie per factor (contentgarantie: de _none()-factory en
    # de prefix-guard in test_direction_content). Eén sleutel, dus top_key, top_n
    # en de ratio verwijzen gegarandeerd naar hetzelfde getal.
    # Strikte meerderheid (> 0.5), niet >= 0.5: de kop van dit blok zegt "volgens
    # de meeste betrokkenen", en precies de helft is niet "de meeste" (B11).
    # Op precies de helft valt de factor door naar de logica hieronder; de
    # clear-tak sluit *_none expliciet uit, dus dat landt op split_none of
    # divided en nooit op een opdrachtvorm die zegt dat er niets hoeft. Ook
    # split_none doet dat niet: die toont het verschil van inzicht en de
    # opdrachtvorm van de veranderoptie, niet die van de niets-optie (die
    # bestaat ook niet: *_none heeft geen imperative).
    none_key = next((k for k in sorted(counts) if k.endswith("_none")), None)
    none_n = counts.get(none_key, 0) if none_key is not None else 0
    base.update(none_key=none_key, none_n=none_n)
    if none_key is not None and none_n / n > 0.5:
        return {**base, "state": "none_needed",
                "top_key": none_key, "top_n": none_n}
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    base.update(top_key=top_key, top_n=top_n, second_n=second_n)
    if top_key.endswith("_other") and n >= DIRECTION_OTHER_WARN_N:
        logger.warning("direction: *_other is topoptie voor %s - optieset review nodig",
                       factor_key)
    if (not top_key.endswith(("_none", "_other"))
            and top_n / n >= 0.5 and top_n - second_n >= TOP_CHOICE_MIN_LEAD):
        return {**base, "state": "clear"}
    # Vanaf hier draait alles om de grootste optie die om verandering vraagt:
    # de niets-optie is dat per definitie niet, en *_other heeft geen
    # opdrachtvorm, dus daar valt niet uit af te leiden wat er moet gebeuren.
    change_ranked = [(k, c) for k, c in ranked if k != none_key]
    if not change_ranked:
        return {**base, "state": "divided"}
    change_key, change_n = change_ranked[0]
    if change_key.endswith("_other"):
        return {**base, "state": "divided"}
    # Verdeeld over wel of niets, op een onderwerp dat laag scoort: het verschil
    # van inzicht tussen die twee groepen is zelf de bevinding (par. 4.3). De
    # niets-groep mag er een achter liggen ("grootste of gedeeld-grootste") en
    # mag ook groter zijn; in beide gevallen is de vraag dezelfde.
    if (factor_score is not None and factor_score < DIRECTION_SPLIT_NONE_MAX_SCORE
            and none_key is not None and none_n >= change_n - 1):
        return {**base, "state": "split_none",
                "top_key": change_key, "top_n": change_n}
    # Grootste groep zonder meerderheid (par. 4.2). De voorsprong wordt tegen
    # ALLE andere opties gemeten, de niets-optie meegerekend, zodat "de grootste
    # groep" letterlijk waar is. Samen met de clear-tak hierboven garandeert dat
    # ook dat deze staat nooit een meerderheid heeft: bij >= 50% met dezelfde
    # voorsprong was de staat al clear.
    rest = [c for k, c in ranked if k != change_key]
    runner_up = max(rest) if rest else 0
    if (change_n / n >= DIRECTION_PLURALITY_MIN_SHARE
            and change_n - runner_up >= TOP_CHOICE_MIN_LEAD):
        return {**base, "state": "plurality",
                "top_key": change_key, "top_n": change_n, "second_n": runner_up}
    return {**base, "state": "divided"}


def agenda_enrichment(agg: dict[str, Any], scan_type: str, factor_key: str) -> dict[str, Any] | None:
    """Spec 6.3: verrijking alleen bij n >= DEEPENING_MIN_N, top >=50%, top >=4,
    voorsprong >= TOP_CHOICE_MIN_LEAD, top niet *_other."""
    n = agg["answered"]
    counts = agg["primary_counts"]
    if n < DEEPENING_MIN_N or not counts:
        return None
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    if top_key.endswith("_other"):
        return None
    # Deler is `answered` per spec 6.1 ("percentages altijd over beantwoorders"),
    # bewust conservatiever dan de "hoofdkeuzes"-formulering in spec 6.3.
    if top_n < 4 or top_n / n < 0.5 or top_n - second_n < TOP_CHOICE_MIN_LEAD:
        return None
    return {
        "option_key": top_key,
        "count": top_n,
        "answered": n,
        "agenda_question": get_agenda_question(scan_type, factor_key, top_key),
    }


def get_agenda_question(scan_type: str, factor_key: str, option_key: str) -> str | None:
    if scan_type not in DEEPENING_CAP:
        raise ValueError(f"unknown scan_type {scan_type!r}")
    options = {o["key"]: o["agenda"] for o in DEEPENING_SETS[factor_key]["options"]}
    if option_key not in options:
        raise KeyError(f"unknown option_key {option_key!r} for factor {factor_key!r}")
    return options[option_key]
