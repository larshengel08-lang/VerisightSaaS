from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections

DEFAULT_TEAM_MODULES = ["leadership", "culture", "workload", "role_clarity"]

SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "TeamScan",
    "signal_label": "Teamsignaal",
    "signal_short_label": "teamsignaal",
    "trust_contract": {
        "what_it_is": (
            "Een compacte lokalisatiescan op groepsniveau die helpt zien waar een al zichtbaar signaal "
            "nu het scherpst speelt op afdelingsniveau en welke lokale context eerst verificatie vraagt."
        ),
        "what_it_is_not": (
            "Geen brede diagnose, geen managerbeoordeling, geen individuele beoordeling en geen bewijs "
            "dat een teamoorzaak definitief vaststaat."
        ),
        "how_to_read": (
            "Lees TeamScan als veilige lokale contextlaag: welke afdelingen vallen op, welke werkfactoren "
            "kleuren dat beeld en waar hoort eerst een managementcheck of lokale verificatie bij."
        ),
        "privacy_boundary": (
            "Management ziet alleen groepsinformatie. Lokale uitsplitsing verschijnt alleen als genoeg responses "
            "en genoeg afdelingsmetadata beschikbaar zijn; kleine groepen blijven onderdrukt."
        ),
        "evidence_status": (
            "TeamScan is in deze eerste wave een begrensde lokalisatielaag op basis van bestaande respondentmetadata. "
            "De output helpt prioriteren en verifiëren, maar is geen manager ranking of causaal bewijs."
        ),
    },
    "survey_intro": (
        "Deze TeamScan helpt zichtbaar maken waar een al bekend werk- of behoudssignaal lokaal het scherpst speelt. "
        "De uitkomst wordt alleen op groepsniveau gelezen en helpt bepalen waar eerst een team- of afdelingsgesprek nodig is. "
        "Invullen kost circa 3 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen op groepsniveau gebruikt. Lokale uitkomsten verschijnen "
        "alleen wanneer er genoeg responses en genoeg afdelingsmetadata beschikbaar zijn. Als je tussentijds stopt, "
        "bewaart deze browser tijdelijk een concept op dit apparaat totdat je verzendt of het concept wist."
    ),
    "sdt_intro": (
        "Deze drie stellingen geven een korte momentopname van je huidige werkbeleving in je directe werkcontext. "
        "Geef aan in welke mate elke stelling nu voor jou van toepassing is (1 = helemaal niet mee eens, 5 = helemaal mee eens)."
    ),
    "org_intro": (
        "De volgende vragen gaan over de werkfactoren die in deze TeamScan actief zijn. Geef per thema aan hoe dit nu voelt "
        "in jouw directe werkcontext."
    ),
    "stay_section_title": "Lokale richting nu",
    "stay_intro": (
        "Deze vraag helpt om de huidige lokale context te lezen: beweegt jouw dagelijkse werkcontext nu in een richting die "
        "houdbaar en werkbaar voelt?"
    ),
    "stay_item": (
        "stay_intent",
        "Als het zo doorgaat, voelt mijn dagelijkse werkcontext over 3 maanden nog steeds werkbaar en steunend.",
    ),
    "open_text_label": "Welke ene verandering in jouw team- of werkcontext zou nu het meeste verschil maken?",
    "open_text_placeholder": "Welke verandering in je directe werkcontext zou nu het meeste verschil maken?",
    "open_text_help": (
        "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal gebruikt om lokale verificatie of vervolgvragen te richten."
    ),
    "invite_intro": (
        "Je bent uitgenodigd voor een korte TeamScan over je huidige werkcontext. Deze compacte meting helpt de organisatie "
        "zien waar een bestaand signaal lokaal het scherpst speelt en waar eerst een team- of afdelingsgesprek nodig is."
    ),
    "invite_duration": "3-5 minuten",
    "contact_subject": "Kennismakingsaanvraag TeamScan",
    "dashboard_signal_help": (
        "Teamsignaal 1-10: samenvattend lokale-contextsignaal van korte werkbeleving en de geselecteerde werkfactoren in deze campaign. "
        "Hogere score = scherper lokaal aandachtssignaal dat eerst verificatie op afdelingsniveau vraagt."
    ),
    "report_repeat_title": "Lokale verdieping eerst veilig en beperkt",
    "report_repeat_body": (
        "Deze eerste TeamScan-wave levert alleen een actuele lokale read op afdelingsniveau. Prioriteitsranking, bredere handoff "
        "en buyer-facing activatie horen pas in volgende waves."
    ),
    "sdt_items": [
        ("B1", "Ik kan mijn werk in mijn directe werkcontext op dit moment op een werkbare manier doen."),
        ("B5", "Ik voel me in mijn directe werkcontext op dit moment voldoende toegerust om mijn werk goed te doen."),
        ("B9", "Ik voel me in mijn directe werkcontext op dit moment voldoende gesteund door de mensen om mij heen."),
    ],
    "org_sections": build_org_sections("team"),
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
