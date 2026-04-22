from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections

DEFAULT_PULSE_MODULES = ["leadership", "growth", "workload"]

SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "Pulse",
    "signal_label": "Pulsesignaal",
    "signal_short_label": "pulsesignaal",
    "trust_contract": {
        "what_it_is": (
            "Een compacte reviewroute op groepsniveau. Pulse helpt zien welke eerder gekozen acties, "
            "prioriteiten of spanningen nu direct herijking vragen."
        ),
        "what_it_is_not": (
            "Geen brede MTO, geen bredere behoudsroute, geen trendbewijs op zichzelf en geen "
            "individuele beoordeling of voorspeller."
        ),
        "how_to_read": (
            "Lees Pulse als compacte managementread: welke werkfactoren en basisbehoeften vragen nu de eerste "
            "review- of herijkingsvraag, en wat moet je eerst bijsturen of opnieuw toetsen."
        ),
        "privacy_boundary": (
            "Management ziet alleen groepsinformatie. Detailweergave blijft terughoudend bij kleine aantallen en "
            "open tekst wordt alleen als geanonimiseerde groepsinput gebruikt."
        ),
        "evidence_status": (
            "Pulse is een compacte signaleringslaag bovenop de bestaande Verisight-methodiek. "
            "De output is bedoeld voor review en koerscorrectie, niet als zelfstandig gevalideerd trend- of predictiemodel."
        ),
    },
    "survey_intro": (
        "Deze Pulse is een korte check-in op werkbeleving en prioritaire werkfactoren. De uitkomst is bedoeld als "
        "groepssignaal voor review en herijking op groepsniveau en niet als individuele beoordeling. Invullen kost circa 3 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen op groepsniveau gebruikt. Pulse is bedoeld om sneller "
        "te zien waar werkbeleving of opvolging aandacht vraagt, niet om personen te beoordelen. Als je tussentijds stopt, "
        "bewaart deze browser tijdelijk een concept op dit apparaat totdat je verzendt of het concept wist."
    ),
    "sdt_intro": (
        "Deze drie stellingen geven een korte check-in op je werkbeleving. Geef aan in welke mate elke stelling "
        "nu voor jou van toepassing is (1 = helemaal niet mee eens, 5 = helemaal mee eens)."
    ),
    "org_intro": (
        "De volgende vragen gaan over de werkfactoren die in deze Pulse actief zijn. Geef per thema aan hoe het nu voor jou voelt."
    ),
    "stay_intro": (
        "Deze vraag helpt om deze compacte review te lezen als reviewsignaal: blijft jouw werkcontext nu in de goede richting bewegen?"
    ),
    "stay_item": ("stay_intent", "Als het zo doorgaat, werk ik over 6 maanden nog steeds met vertrouwen in deze organisatie."),
    "open_text_label": "Welke ene verandering zou op dit moment het meeste verschil maken in jouw werk?",
    "open_text_placeholder": "Welke verandering zou nu het meeste verschil maken?",
    "open_text_help": "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal voor review en opvolging gebruikt.",
    "invite_intro": (
        "Je bent uitgenodigd voor een korte Pulse-check-in over je werkbeleving. Deze compacte meting helpt de organisatie "
        "zien waar opvolging, koerscorrectie of extra aandacht nu nodig is op groepsniveau."
    ),
    "invite_duration": "3-5 minuten",
    "contact_subject": "Kennismakingsaanvraag Pulse",
    "dashboard_signal_help": (
        "Pulsesignaal 1-10: samenvattende groepsread van korte SDT-check-ins en de geselecteerde werkfactoren in deze cycle. "
        "Hogere score = scherper reviewsignaal dat nu bespreking of bijsturing vraagt."
    ),
    "report_repeat_title": "Volgende Pulse-cycle pas na expliciete review",
    "report_repeat_body": (
        "Pulse blijft een bounded reviewroute. Gebruik een volgende Pulse alleen na een expliciete herijking en "
        "alleen als begrensde vergelijking met een vorige vergelijkbare Pulse."
    ),
    "sdt_items": [
        ("B1", "Ik heb op dit moment genoeg ruimte om mijn werk op een werkbare manier te doen."),
        ("B5", "Ik voel me op dit moment capabel genoeg om mijn werk goed uit te voeren."),
        ("B9", "Ik voel me op dit moment voldoende verbonden met de mensen met wie ik samenwerk."),
    ],
    "org_sections": build_org_sections("pulse"),
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
