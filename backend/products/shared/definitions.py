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
                "leadership": "Leidinggevenden geven in mijn werkcontext duidelijke richting en bruikbare feedback.",
                "pulse": "Ik krijg op dit moment genoeg richting en steun van mijn leidinggevende om goed te kunnen werken.",
                "onboarding": "Ik krijg in mijn eerste periode hier genoeg richting en steun van mijn leidinggevende om mijn rol goed te starten.",
            }),
            ("leadership_2", {
                "exit": "Mijn leidinggevende toonde oprechte interesse in mijn persoonlijke ontwikkeling.",
                "retention": "Mijn leidinggevende geeft mij ruimte om keuzes te maken in hoe ik mijn werk uitvoer.",
                "leadership": "Besluiten en prioriteiten vanuit leiding zijn in mijn werkcontext voldoende consistent en uitlegbaar.",
                "team": "Ik krijg in mijn directe werkcontext genoeg ruimte om mijn werk op een haalbare manier te organiseren.",
                "onboarding": "Mijn leidinggevende maakt in deze eerste periode duidelijk wat nu het belangrijkst is in mijn rol.",
            }),
            ("leadership_3", {
                "exit": "Ik had een vertrouwensband met mijn directe leidinggevende.",
                "retention": "Ik ervaar een vertrouwensband met mijn directe leidinggevende.",
                "leadership": "Ik kan zorgen of escalaties in mijn werkcontext veilig en tijdig bespreekbaar maken met leiding.",
                "team": "Ik kan in mijn directe werkcontext escaleren of hulp vragen zonder dat dat tegen mij werkt.",
                "onboarding": "Ik kan in deze eerste periode makkelijk hulp vragen of escaleren als iets onduidelijk is.",
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
                "leadership": "De manier van aansturen helpt om zorgen en fouten tijdig bespreekbaar te maken.",
                "pulse": "Ik voel me in mijn team vrij genoeg om zorgen of frictie op tijd te benoemen.",
                "onboarding": "Ik voel me in mijn eerste periode hier vrij genoeg om vragen te stellen of onzekerheid te benoemen.",
            }),
            ("culture_2", {
                "exit": "Ik kon moeilijke vragen stellen of afwijkende meningen uiten zonder negatieve gevolgen.",
                "retention": "Ik kan moeilijke vragen stellen of afwijkende meningen uiten zonder negatieve gevolgen.",
                "leadership": "Leiding stimuleert in mijn werkcontext genoeg openheid voor lastige vragen of afwijkende signalen.",
                "team": "Ik kan in mijn directe werkcontext moeilijke vragen stellen zonder dat dat onveilig voelt.",
                "onboarding": "Ik ervaar mijn team en werkcontext als veilig genoeg om nieuwe dingen te leren en fouten bespreekbaar te maken.",
            }),
            ("culture_3", {
                "exit": "De organisatiecultuur sloot aan bij mijn persoonlijke waarden.",
                "retention": "De manier waarop we hier samenwerken past bij wat ik nodig heb om goed te kunnen blijven werken.",
                "leadership": "De manier waarop leiding en samenwerking samenkomen helpt mijn werkcontext vooruit in plaats van te blokkeren.",
                "team": "De manier waarop we in mijn directe werkcontext samenwerken helpt mij om mijn werk goed te doen.",
                "onboarding": "De manier waarop hier wordt samengewerkt helpt mij om goed in mijn rol te landen.",
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
                "leadership": "Leiding maakt duidelijk genoeg hoe ontwikkeling en doorgroei in mijn werkcontext ondersteund worden.",
                "pulse": "Ik zie op dit moment genoeg perspectief om mij hier verder te ontwikkelen.",
                "onboarding": "Ik zie in deze eerste periode genoeg ruimte om mijn rol snel goed te leren kennen.",
            }),
            ("growth_2", {
                "exit": "De organisatie investeerde in mijn persoonlijke en professionele ontwikkeling.",
                "retention": "De organisatie investeert in mijn persoonlijke en professionele ontwikkeling.",
                "leadership": "Ik krijg vanuit leiding genoeg coaching of ontwikkelruimte om mijn werk goed te blijven doen.",
                "team": "Ik krijg in mijn directe werkcontext genoeg ruimte om te leren of stappen te zetten.",
                "onboarding": "Ik krijg in deze eerste periode genoeg begeleiding of leermomenten om goed in te stromen.",
            }),
            ("growth_3", {
                "exit": "Ik zag voor mijzelf een duidelijk loopbaanperspectief binnen deze organisatie.",
                "retention": "Ik zie voor mijzelf een duidelijk loopbaanperspectief binnen deze organisatie.",
                "leadership": "Leiding helpt voldoende om perspectief, verwachtingen en vervolgstappen begrijpelijk te maken.",
                "team": "Mijn directe werkcontext helpt mij om perspectief te zien in mijn werk hier.",
                "onboarding": "Ik begrijp in deze eerste periode hoe ik hier succesvol kan landen en doorgroeien.",
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
                "leadership": "Leiding en organisatie maken voldoende duidelijk hoe beloning en waardering zich tot mijn werk verhouden.",
                "pulse": "Mijn beloning en voorwaarden passen op dit moment bij wat mijn werk van mij vraagt.",
                "onboarding": "Mijn arbeidsvoorwaarden en praktische afspraken voelen in deze eerste periode passend en duidelijk.",
            }),
            ("compensation_2", {
                "exit": "De totale arbeidsvoorwaarden (inclusief secundaire) sloten aan bij mijn verwachtingen.",
                "retention": "Ik begrijp hoe beloning en doorgroei binnen deze organisatie worden bepaald.",
                "leadership": "Beslissingen over beloning, waardering en verwachtingen voelen vanuit leiding voldoende uitlegbaar.",
                "team": "Ik begrijp voldoende hoe beloning of voorwaarden zich verhouden tot wat mijn werkcontext nu vraagt.",
                "onboarding": "Ik begrijp in deze eerste periode voldoende hoe afspraken, voorwaarden en ondersteuning hier werken.",
            }),
            ("compensation_3", {
                "exit": "Ik ervoer de beloning als eerlijk ten opzichte van collega's in vergelijkbare functies.",
                "retention": "Mijn arbeidsvoorwaarden ondersteunen wat ik nodig heb om mijn werk duurzaam vol te houden.",
                "leadership": "De manier waarop leiding met waardering en voorwaarden omgaat helpt mijn werk duurzaam uitvoerbaar te houden.",
                "team": "Mijn voorwaarden helpen mij om mijn werk in deze context duurzaam vol te houden.",
                "onboarding": "De praktische voorwaarden helpen mij om in deze eerste periode goed van start te gaan.",
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
                "leadership": "Leiding helpt voldoende om prioriteiten en werkdruk werkbaar te houden.",
                "pulse": "Mijn werkdruk is op dit moment haalbaar binnen mijn werktijd.",
                "onboarding": "De hoeveelheid informatie en werk in mijn eerste periode is haalbaar.",
            }),
            ("workload_2", {
                "exit": "Ik ervoer mijn werkdruk als acceptabel.",
                "retention": "Ik ervaar mijn werkdruk als acceptabel.",
                "leadership": "Verstoringen of piekdruk worden vanuit leiding voldoende begrensd of opgevangen.",
                "team": "Pieken of verstoringen in mijn directe werkcontext zijn nu beheersbaar.",
                "onboarding": "Mijn eerste weken voelen qua tempo en verwachtingen beheersbaar.",
            }),
            ("workload_3", {
                "exit": "Ik had voldoende hersteltijd na intensieve werkperioden.",
                "retention": "Ik heb voldoende hersteltijd na intensieve werkperioden.",
                "leadership": "Leiding bewaakt voldoende dat werktempo en herstel in balans blijven.",
                "team": "Ik houd in mijn directe werkcontext genoeg ruimte over om te herstellen van drukke periodes.",
                "onboarding": "Ik houd in deze eerste periode genoeg ruimte over om te leren zonder direct overbelast te raken.",
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
                "leadership": "Leiding maakt voldoende duidelijk wat nu de belangrijkste prioriteiten en keuzes zijn.",
                "pulse": "Ik weet op dit moment wat in mijn rol de belangrijkste prioriteiten zijn.",
                "onboarding": "Ik weet in deze eerste periode wat mijn belangrijkste prioriteiten zijn.",
            }),
            ("role_clarity_2", {
                "exit": "Ik wist wat er van mij werd verwacht in mijn functie.",
                "retention": "Ik weet waarop ik in mijn rol word aangesproken en waarop niet.",
                "leadership": "Ik weet door de manier van aansturen voldoende waarop ik wel en niet word aangesproken.",
                "team": "Ik weet in mijn directe werkcontext waarop ik nu wel en niet word aangesproken.",
                "onboarding": "Ik begrijp in deze eerste periode wat er van mij wordt verwacht en waarop niet.",
            }),
            ("role_clarity_3", {
                "exit": "Er was weinig tegenstrijdigheid in de opdrachten die ik ontving.",
                "retention": "Ik ervaar weinig tegenstrijdigheid in opdrachten of verwachtingen.",
                "leadership": "De manier waarop leiding prioriteiten en besluiten doorgeeft voorkomt onnodige tegenstrijdigheid.",
                "team": "Ik ervaar in mijn directe werkcontext weinig tegenstrijdigheid in opdrachten of verwachtingen.",
                "onboarding": "Ik ervaar in deze eerste periode weinig tegenstrijdigheid in uitleg, opdrachten of verwachtingen.",
            }),
        ],
    },
]


def build_org_sections(scan_type: str) -> list[dict[str, Any]]:
    resolved_scan_type = "retention" if scan_type == "mto" else scan_type
    sections: list[dict[str, Any]] = []
    for section in ORG_SECTIONS:
        items = [
            (item_id, item_text[resolved_scan_type])
            for item_id, item_text in section["items"]
            if resolved_scan_type in item_text
        ]
        if not items:
            continue
        sections.append(
            {
                "key": section["key"],
                "title": section["title"],
                "items": items,
            }
        )
    return sections
