from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections


SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "Loep Behoud",
    "signal_label": "Retentiesignaal",
    "signal_short_label": "retentiesignaal",
    "trust_contract": {
        "what_it_is": (
            "Een compacte scan voor vroegsignalering op behoud op groeps- en segmentniveau, bedoeld om eerder zichtbaar "
            "te maken waar behoud aandacht vraagt in actieve populaties."
        ),
        "what_it_is_not": (
            "Geen brede MTO, geen individuele voorspeller, geen performance-instrument en geen "
            "selectie- of interventietool op persoonsniveau."
        ),
        "how_to_read": (
            "Lees het retentiesignaal samen met bevlogenheid, stay-intent, vertrekintentie en "
            "topfactoren als verificatiehulp. De uitkomst is een managementroute, geen hard classificatiemodel."
        ),
        "privacy_boundary": (
            "Management ziet alleen groeps- en segmentinzichten. Individuele signalen, individuele "
            "vertrekintentie en open tekst op persoonsniveau blijven buiten beeld; segmenten verschijnen alleen bij voldoende n."
        ),
        "evidence_status": (
            "Loep Behoud is een v1-werkmodel: inhoudelijk plausibel, intern consistent en "
            "testmatig beschermd. Het product is nadrukkelijk geen pragmatisch bewezen of wetenschappelijk gevalideerde predictor van vrijwillig vertrek."
        ),
    },
    "survey_intro": "Jouw mening telt. Deze vragenlijst gaat over hoe jij je werk ervaart en wat maakt dat je blijft of zou vertrekken. Je antwoorden worden alleen per groep bekeken, nooit per persoon. Invullen kost ongeveer 6 minuten.",
    "survey_privacy_note": "Je antwoorden zijn vertrouwelijk en worden alleen per groep gerapporteerd, nooit per persoon. Ze zijn bedoeld om te zien waar het in de organisatie wringt, niet om jou te beoordelen of iets over jou te voorspellen. Als je tussentijds stopt, bewaart deze browser tijdelijk een concept op dit apparaat zolang je dit tabblad open houdt.",
    "sdt_intro": "De volgende stellingen gaan over hoe jij je werk nu ervaart. Geef aan in welke mate elke stelling voor jou van toepassing is (1 = helemaal niet mee eens, 5 = helemaal mee eens).",
    "org_intro": "Geef aan in welke mate de volgende uitspraken van toepassing zijn op jouw huidige werksituatie.",
    "stay_intro": "De volgende stelling gaat over jouw bereidheid om te blijven en de kans dat je hier op langere termijn wilt blijven werken.",
    "stay_item": ("stay_intent", "Als het aan mij ligt, werk ik over 12 maanden nog steeds bij deze organisatie."),
    "enps_item": (
        "enps_score",
        "Hoe waarschijnlijk is het dat je deze organisatie als werkgever zou aanraden aan iemand die je kent?",
    ),
    "open_text_label": "Welke verandering in je werk, leiding of samenwerking zou jouw bereidheid om te blijven het meest versterken?",
    "open_text_placeholder": "Welke verandering zou behoud voor jou het meest versterken?",
    "open_text_help": "Je antwoord wordt anoniem bewaard en alleen per groep bekeken, nooit per persoon. Noem liever geen namen.",
    "invite_intro": "Je leidinggevende of HR nodigt je uit voor een korte vragenlijst over hoe jij je werk ervaart. Je antwoorden zijn vertrouwelijk en worden alleen per groep bekeken. Zo weet de organisatie eerder waar het wringt.",
    "invite_duration": "6-10 minuten",
    "contact_subject": "Kennismakingsaanvraag Loep Behoud",
    "dashboard_signal_help": "Retentiesignaal 1-10: werkfactoren en werkbeleving samengebracht tot een groepsscore. Hoe hoger, hoe beter; onder de 5,0 vraagt behoud aandacht.",
    "report_repeat_title": "Herhaal Loep Behoud, bijvoorbeeld per kwartaal of halfjaar",
    "report_repeat_body": "Deze meting geeft een momentopname van het retentiesignaal en de aanvullende signalen rond behoud. Door periodiek te meten zie je hoe werkbeleving, stay-intent, vertrekintentie en prioriteiten verschuiven en waar management bevestiging of bijstelling nodig heeft.",
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
