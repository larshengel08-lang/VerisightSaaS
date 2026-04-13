from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections


SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "ExitScan",
    "signal_label": "Frictiescore",
    "signal_short_label": "frictiescore",
    "survey_intro": "Bedankt voor je tijd. Je antwoorden helpen de organisatie beter te worden. Dit duurt circa 8 minuten.",
    "survey_privacy_note": "Je antwoorden worden vertrouwelijk verwerkt en alleen op gegroepeerd niveau gerapporteerd. De uitkomsten zijn bedoeld als groepsinzichten en gespreksinput, niet als individueel oordeel of harde voorspelling. Als je tussentijds stopt, bewaart deze browser tijdelijk een concept op dit apparaat totdat je verzendt of het concept wist.",
    "sdt_intro": "De volgende stellingen gaan over hoe jij je werk ervoer. Geef aan in welke mate elke stelling voor jou van toepassing was (1 = helemaal niet mee eens, 5 = helemaal mee eens).",
    "org_intro": "Geef aan in welke mate de volgende uitspraken van toepassing waren op jouw werksituatie.",
    "open_text_label": "Heb je aanvullende opmerkingen of wil je iets toelichten?",
    "open_text_placeholder": "Typ hier je toelichting...",
    "open_text_help": "Je antwoord wordt geanonimiseerd opgeslagen.",
    "invite_intro": "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen over jouw ervaringen binnen de organisatie. Dit helpt de organisatie concreet te verbeteren.",
    "invite_duration": "8-12 minuten",
    "contact_subject": "Kennismakingsaanvraag ExitScan",
    "dashboard_signal_help": "Frictieschaal 1-10: hogere score = sterker signaal van ervaren werkfrictie. HOOG >= 7, MIDDEN 4.5-7, LAAG < 4.5.",
    "report_repeat_title": "Herhaal de ExitScan - elk kwartaal of halfjaarlijks",
    "report_repeat_body": "Eenmalige data is een momentopname. Patroonherkenning ontstaat pas bij meerdere metingen. Continuiteit maakt de investering rendabel.",
    "sdt_items": [
        ("B1", "In mijn werk had ik het gevoel dat ik zelf keuzes kon maken over hoe ik mijn taken uitvoerde."),
        ("B2", "Ik had de vrijheid om mijn werkzaamheden op mijn eigen manier aan te pakken."),
        ("B3", "Mijn werksituatie liet mij toe om initiatieven te nemen in mijn functie."),
        ("B4", "Ik ervoer mijn werk als opgelegd - ik had weinig inspraak over hoe ik taken uitvoerde."),
        ("B5", "Ik voelde me competent in mijn werk."),
        ("B6", "Ik had het gevoel dat ik mijn vaardigheden en talenten goed kon inzetten."),
        ("B7", "Ik was in staat effectief te zijn in mijn werk."),
        ("B8", "Ik twijfelde regelmatig aan mijn vermogen om mijn werkzaamheden goed uit te voeren."),
        ("B9", "Ik had een goede band met mijn collega's."),
        ("B10", "Ik voelde me verbonden met de mensen waarmee ik samenwerkte."),
        ("B11", "Ik voelde me geaccepteerd door de mensen in mijn directe werkomgeving."),
        ("B12", "Ik had het gevoel dat collega's niet echt in mij geinteresseerd waren."),
    ],
    "org_sections": build_org_sections("exit"),
    "uwes_items": [],
    "turnover_items": [],
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
