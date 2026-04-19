from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections

DEFAULT_MTO_MODULES = ["leadership", "culture", "growth", "compensation", "workload", "role_clarity"]

SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "MTO",
    "signal_label": "MTO-signaal",
    "signal_short_label": "mto-signaal",
    "trust_contract": {
        "what_it_is": (
            "Een bredere organisatiebrede hoofdmeting die werkbeleving, werkfactoren en "
            "managementrichting bundelt tot een brede organisatieread, plus een veilige afdelingsread "
            "boven de suppressiedrempel."
        ),
        "what_it_is_not": (
            "Geen individueel tevredenheidsoordeel, geen reportlaag, geen volledige shared action engine en "
            "geen publieke hoofdlancering in deze wave."
        ),
        "how_to_read": (
            "Lees MTO als eerste brede hoofdmeting: welke themas vallen nu het meest op, welke brede "
            "managementvraag hoort daarbij en welke veilige afdelingen daarna als eerste bounded route "
            "verdere duiding vragen."
        ),
        "privacy_boundary": (
            "Management ziet alleen geaggregeerde groepsinformatie. Afdelingen openen alleen boven de "
            "veilige suppressiedrempel; kleine groepen blijven onderdrukt en openen geen individuele output."
        ),
        "evidence_status": (
            "MTO is in deze fase een interne hoofdmeting met bounded department intelligence binnen de "
            "bestaande campaign-keten. De uitkomst helpt een brede read en veilige afdelingshandoffs openen, "
            "maar is nog geen formeel rapport, geen volledige action engine en geen buyer-facing hoofdroute."
        ),
    },
    "survey_intro": (
        "Deze MTO is een brede hoofdmeting van werkbeleving, werkfactoren en managementrichting op "
        "groepsniveau. De uitkomst wordt geaggregeerd gelezen en kan daarna veilig per afdeling verdiepen "
        "boven de suppressiedrempel. Invullen kost circa 6 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen geaggregeerd gebruikt. Afdelingsuitkomsten "
        "openen alleen boven de veilige suppressiedrempel. Deze MTO-wave is bedoeld voor een brede "
        "organisatieread en bounded department intelligence, niet voor individuele beoordeling."
    ),
    "sdt_intro": (
        "De volgende stellingen geven een brede momentopname van hoe werkbaar, steunend en verbonden je werk "
        "nu voelt. Geef aan in welke mate elke stelling voor jou van toepassing is "
        "(1 = helemaal niet mee eens, 5 = helemaal mee eens)."
    ),
    "org_intro": (
        "De volgende vragen gaan over de werkfactoren die in deze MTO-wave actief zijn. "
        "Geef per thema aan hoe dit nu voelt in jouw werkcontext."
    ),
    "stay_section_title": "Brede richting nu",
    "stay_intro": (
        "Deze vraag helpt de brede organisatieread te richten: beweegt de huidige manier van werken "
        "in een richting die de komende periode werkbaar en gezond blijft voelen?"
    ),
    "stay_item": (
        "stay_intent",
        "Als het zo doorgaat, voelt werken in deze organisatie over 12 maanden nog steeds werkbaar en gezond.",
    ),
    "open_text_label": "Welke ene verandering in werk, samenwerking of aansturing zou nu het meeste verschil maken?",
    "open_text_placeholder": "Welke ene verandering zou nu het meeste verschil maken?",
    "open_text_help": (
        "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal gebruikt om de brede "
        "organisatieread en veilige afdelingsduiding te richten."
    ),
    "invite_intro": (
        "Je bent uitgenodigd voor een brede MTO over werkbeleving, werkfactoren en managementrichting. "
        "Deze meting helpt de organisatie bepalen welke brede themas en welke afdelingen nu eerst prioriteit verdienen."
    ),
    "invite_duration": "5-7 minuten",
    "contact_subject": "Kennismakingsaanvraag MTO",
    "dashboard_signal_help": (
        "MTO-signaal 1-10: samenvattend groepssignaal van brede werkbeleving en werkfactoren in deze campaign. "
        "Hogere score = scherper breed organisatiethema dat nu eerste managementduiding vraagt."
    ),
    "report_repeat_title": "Eerst een brede hoofdread, nog geen rapportlaag",
    "report_repeat_body": (
        "Deze MTO-wave levert alleen een actuele brede organisatieread plus bounded afdelingsduiding op. "
        "Formele rapportage, volledige action logging en verdere operatorrouting horen pas in latere waves."
    ),
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
    "org_sections": build_org_sections("mto"),
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
