from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections

DEFAULT_LEADERSHIP_MODULES = ["leadership", "role_clarity", "culture", "growth"]

SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "Leadership Scan",
    "signal_label": "Leadershipsignaal",
    "signal_short_label": "leadershipsignaal",
    "trust_contract": {
        "what_it_is": (
            "Een compacte managementcontextscan op groepsniveau die helpt zien hoe leiding, prioritering "
            "en werkcontext samenkomen rond een al zichtbaar people-signaal."
        ),
        "what_it_is_not": (
            "Geen named leader view, geen manager ranking, geen 360-tool en geen performance-instrument."
        ),
        "how_to_read": (
            "Lees Leadership Scan als begrensde managementread: welke leiderschapscontext valt op, welke "
            "werkfactor kleurt dat beeld en waar hoort eerst verificatie of een kleine corrigerende stap bij. "
            "Gebruik het als geaggregeerde management-context triage, niet als named leader read."
        ),
        "privacy_boundary": (
            "Management ziet alleen geaggregeerde groepsinformatie. Kleine groepen blijven onderdrukt en de "
            "output is nooit bedoeld als beoordeling van een individuele leidinggevende."
        ),
        "evidence_status": (
            "Leadership Scan is in deze eerste wave een smalle groepsread binnen de bestaande respondentmetadata. "
            "De output helpt managementcontext duiden en een eerste gesprek richten, maar is geen hierarchy model "
            "en geen bewijs van individuele leiderschapskwaliteit of 360-output."
        ),
    },
    "survey_intro": (
        "Deze Leadership Scan is een korte check op hoe leiding, prioritering en werkcontext nu samenkomen rond een "
        "bestaand people-signaal. De uitkomst wordt alleen op groepsniveau gelezen en helpt bepalen welke "
        "managementcontext eerst duiding of verificatie vraagt. Invullen kost circa 3 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen op groepsniveau gebruikt. Deze meting is niet bedoeld "
        "om individuele leidinggevenden te beoordelen. Als je tussentijds stopt, bewaart deze browser tijdelijk een "
        "concept op dit apparaat totdat je verzendt of het concept wist."
    ),
    "sdt_intro": (
        "Deze drie stellingen geven een korte momentopname van hoe werkbaar, steunend en verbonden je huidige "
        "werkcontext voelt. Geef aan in welke mate elke stelling nu voor jou van toepassing is "
        "(1 = helemaal niet mee eens, 5 = helemaal mee eens)."
    ),
    "org_intro": (
        "De volgende vragen gaan over de leiderschaps- en werkfactoren die in deze Leadership Scan actief zijn. "
        "Geef per thema aan hoe dit nu voelt in jouw werkcontext."
    ),
    "stay_section_title": "Managementrichting nu",
    "stay_intro": (
        "Deze vraag helpt om de huidige managementcontext te lezen: beweegt de manier waarop werk nu wordt aangestuurd "
        "in een richting die werkbaar en steunend voelt?"
    ),
    "stay_item": (
        "stay_intent",
        "Als het zo doorgaat, voelt de manier waarop werk hier wordt aangestuurd over 3 maanden nog steeds werkbaar en steunend.",
    ),
    "open_text_label": "Welke ene verandering in de manier van aansturen of prioriteren zou nu het meeste verschil maken?",
    "open_text_placeholder": "Welke verandering in aansturing of prioritering zou nu het meeste verschil maken?",
    "open_text_help": (
        "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal gebruikt om managementcontext en "
        "vervolgvragen te richten."
    ),
    "invite_intro": (
        "Je bent uitgenodigd voor een korte Leadership Scan over hoe leiding, prioritering en werkcontext nu "
        "samenkomen. Deze compacte meting helpt de organisatie bepalen welke managementcontext eerst duiding of "
        "verificatie vraagt."
    ),
    "invite_duration": "3-5 minuten",
    "contact_subject": "Kennismakingsaanvraag Leadership Scan",
    "dashboard_signal_help": (
        "Leadershipsignaal 1-10: samenvattend groepssignaal van compacte werkbeleving en geselecteerde "
        "leiderschaps- en werkfactoren in deze campaign. Hogere score = scherper managementcontextsignaal dat nu "
        "eerste duiding of verificatie vraagt."
    ),
    "report_repeat_title": "Eerst een geaggregeerde managementread",
    "report_repeat_body": (
        "Deze eerste Leadership Scan-wave levert alleen een actuele groepsread op. Named leaders, hierarchylogica "
        "en uitgebreidere handoff horen pas in latere waves."
    ),
    "sdt_items": [
        ("B1", "Ik kan mijn werk in deze context op dit moment op een werkbare manier doen."),
        ("B5", "Ik voel me in deze context op dit moment voldoende toegerust om mijn werk goed te doen."),
        ("B9", "Ik voel me in deze context op dit moment voldoende gesteund door de mensen om mij heen."),
    ],
    "org_sections": build_org_sections("leadership"),
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
