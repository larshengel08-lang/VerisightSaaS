from __future__ import annotations

from typing import Any


ORG_SECTIONS = [
    {
        "key": "leadership",
        "title": "Leiderschap",
        "items": [
            ("leadership_1", {
                "exit": "Mijn leidinggevende gaf mij nuttige feedback over mijn functioneren.",
                "retention": "Mijn leidinggevende geeft mij nuttige feedback over mijn functioneren.",
            }),
            ("leadership_2", {
                "exit": "Mijn leidinggevende toonde oprechte interesse in mijn persoonlijke ontwikkeling.",
                "retention": "Mijn leidinggevende geeft mij ruimte om keuzes te maken in hoe ik mijn werk uitvoer.",
            }),
            ("leadership_3", {
                "exit": "Ik had een vertrouwensband met mijn directe leidinggevende.",
                "retention": "Ik ervaar een vertrouwensband met mijn directe leidinggevende.",
            }),
        ],
    },
    {
        "key": "culture",
        "title": "Psychologische veiligheid & cultuurmatch",
        "items": [
            ("culture_1", {
                "exit": "Ik voelde me vrij om fouten toe te geven in dit team.",
                "retention": "Ik voel me vrij om fouten toe te geven in dit team.",
            }),
            ("culture_2", {
                "exit": "Ik kon moeilijke vragen stellen of afwijkende meningen uiten zonder negatieve gevolgen.",
                "retention": "Ik kan moeilijke vragen stellen of afwijkende meningen uiten zonder negatieve gevolgen.",
            }),
            ("culture_3", {
                "exit": "De organisatiecultuur sloot aan bij mijn persoonlijke waarden.",
                "retention": "De manier waarop we hier samenwerken past bij wat ik nodig heb om goed te kunnen blijven werken.",
            }),
        ],
    },
    {
        "key": "growth",
        "title": "Groeiperspectief",
        "items": [
            ("growth_1", {
                "exit": "Er waren voldoende mogelijkheden om te leren en te groeien binnen mijn functie.",
                "retention": "Er zijn voldoende mogelijkheden om te leren en te groeien binnen mijn functie.",
            }),
            ("growth_2", {
                "exit": "De organisatie investeerde in mijn persoonlijke en professionele ontwikkeling.",
                "retention": "De organisatie investeert in mijn persoonlijke en professionele ontwikkeling.",
            }),
            ("growth_3", {
                "exit": "Ik zag voor mijzelf een duidelijk loopbaanperspectief binnen deze organisatie.",
                "retention": "Ik zie voor mijzelf een duidelijk loopbaanperspectief binnen deze organisatie.",
            }),
        ],
    },
    {
        "key": "compensation",
        "title": "Beloning & voorwaarden",
        "items": [
            ("compensation_1", {
                "exit": "Mijn salaris was marktconform voor de werkzaamheden die ik uitvoerde.",
                "retention": "Mijn totale beloning past bij mijn rol en bijdrage.",
            }),
            ("compensation_2", {
                "exit": "De totale arbeidsvoorwaarden (inclusief secundaire) sloten aan bij mijn verwachtingen.",
                "retention": "Ik begrijp hoe beloning en doorgroei binnen deze organisatie worden bepaald.",
            }),
            ("compensation_3", {
                "exit": "Ik ervoer de beloning als eerlijk ten opzichte van collega's in vergelijkbare functies.",
                "retention": "Mijn arbeidsvoorwaarden ondersteunen wat ik nodig heb om mijn werk duurzaam vol te houden.",
            }),
        ],
    },
    {
        "key": "workload",
        "title": "Werkbelasting",
        "items": [
            ("workload_1", {
                "exit": "De hoeveelheid werk die ik moest verzetten was haalbaar binnen mijn werktijd.",
                "retention": "De hoeveelheid werk die ik moet verzetten is haalbaar binnen mijn werktijd.",
            }),
            ("workload_2", {
                "exit": "Ik ervoer mijn werkdruk als acceptabel.",
                "retention": "Ik ervaar mijn werkdruk als acceptabel.",
            }),
            ("workload_3", {
                "exit": "Ik had voldoende hersteltijd na intensieve werkperioden.",
                "retention": "Ik heb voldoende hersteltijd na intensieve werkperioden.",
            }),
        ],
    },
    {
        "key": "role_clarity",
        "title": "Rolhelderheid",
        "items": [
            ("role_clarity_1", {
                "exit": "Mijn taken en verantwoordelijkheden waren duidelijk omschreven.",
                "retention": "Ik weet wat in mijn rol nu de belangrijkste prioriteiten zijn.",
            }),
            ("role_clarity_2", {
                "exit": "Ik wist wat er van mij werd verwacht in mijn functie.",
                "retention": "Ik weet waarop ik in mijn rol word aangesproken en waarop niet.",
            }),
            ("role_clarity_3", {
                "exit": "Er was weinig tegenstrijdigheid in de opdrachten die ik ontving.",
                "retention": "Ik ervaar weinig tegenstrijdigheid in opdrachten of verwachtingen.",
            }),
        ],
    },
]


def build_org_sections(scan_type: str) -> list[dict[str, Any]]:
    return [
        {
            "key": section["key"],
            "title": section["title"],
            "items": [(item_id, item_text[scan_type]) for item_id, item_text in section["items"]],
        }
        for section in ORG_SECTIONS
    ]
