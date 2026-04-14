from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections


SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "RetentieScan",
    "signal_label": "Retentiesignaal",
    "signal_short_label": "retentiesignaal",
    "survey_intro": "Jouw mening telt. Deze RetentieScan is een compacte behoudsscan die kijkt naar groepssignalen over werkbeleving en behoud - niet naar individuele beoordeling of voorspelling. Invullen kost circa 6 minuten.",
    "survey_privacy_note": "Je antwoorden worden vertrouwelijk verwerkt en alleen op groeps- of segmentniveau gerapporteerd. De uitkomsten zijn bedoeld als managementinformatie over werkbeleving en behoud, niet als individueel oordeel, brede tevredenheidsmeting of voorspelling. Als je tussentijds stopt, bewaart deze browser tijdelijk een concept op dit apparaat totdat je verzendt of het concept wist.",
    "sdt_intro": "De volgende stellingen gaan over hoe jij je werk nu ervaart. Geef aan in welke mate elke stelling voor jou van toepassing is (1 = helemaal niet mee eens, 5 = helemaal mee eens).",
    "org_intro": "Geef aan in welke mate de volgende uitspraken van toepassing zijn op jouw huidige werksituatie.",
    "stay_intro": "De volgende stelling gaat over jouw bereidheid om te blijven en de kans dat je hier op langere termijn wilt blijven werken.",
    "stay_item": ("stay_intent", "Als het aan mij ligt, werk ik over 12 maanden nog steeds bij deze organisatie."),
    "open_text_label": "Welke verandering in je werk, leiding of samenwerking zou jouw bereidheid om te blijven het meest versterken?",
    "open_text_placeholder": "Welke verandering zou behoud voor jou het meest versterken?",
    "open_text_help": "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal voor verificatie en opvolging gebruikt.",
    "invite_intro": "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen over jouw werkbeleving en retentiesignalen. Jouw input wordt vertrouwelijk verwerkt en helpt de organisatie eerder bij te sturen op groepsniveau.",
    "invite_duration": "6-10 minuten",
    "contact_subject": "Kennismakingsaanvraag RetentieScan",
    "dashboard_signal_help": "Retentiesignaal 1-10: een gelijkgewogen v1-samenvatting van SDT-werkbeleving en beinvloedbare werkfactoren. Hogere score = sterker samenvattend groepssignaal dat behoud aandacht vraagt.",
    "report_repeat_title": "Herhaal de RetentieScan - bijvoorbeeld per kwartaal of halfjaar",
    "report_repeat_body": "Deze meting geeft een momentopname van retentiesignalen. Door periodiek te meten zie je of werkbeleving, stay-intent, vertrekintentie en prioriteiten daadwerkelijk verbeteren.",
    "sdt_items": [
        ("B1", "In mijn werk heb ik het gevoel dat ik zelf keuzes kan maken over hoe ik mijn taken uitvoer."),
        ("B2", "Ik heb de vrijheid om mijn werkzaamheden op mijn eigen manier aan te pakken."),
        ("B3", "Mijn werksituatie laat mij toe om initiatieven te nemen in mijn functie."),
        ("B4", "Ik ervaar mijn werk als opgelegd - ik heb weinig inspraak over hoe ik taken uitvoer."),
        ("B5", "Ik voel me competent in mijn werk."),
        ("B6", "Ik heb het gevoel dat ik mijn vaardigheden en talenten goed kan inzetten."),
        ("B7", "Ik ben in staat effectief te zijn in mijn werk."),
        ("B8", "Ik twijfel regelmatig aan mijn vermogen om mijn werkzaamheden goed uit te voeren."),
        ("B9", "Ik heb een goede band met mijn collega's."),
        ("B10", "Ik voel me verbonden met de mensen waarmee ik samenwerk."),
        ("B11", "Ik voel me geaccepteerd door de mensen in mijn directe werkomgeving."),
        ("B12", "Ik heb het gevoel dat collega's niet echt in mij geinteresseerd zijn."),
    ],
    "org_sections": build_org_sections("retention"),
    "uwes_items": [
        ("uwes_1", "Op mijn werk bruis ik van energie."),
        ("uwes_2", "Mijn werk inspireert mij."),
        ("uwes_3", "Als ik 's ochtends opsta, heb ik zin om naar mijn werk te gaan."),
    ],
    "turnover_items": [
        ("ti_1", "Ik denk er serieus over na om deze organisatie te verlaten."),
        ("ti_2", "Ik ben actief op zoek naar een andere baan."),
    ],
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
