from __future__ import annotations

from typing import Any

from backend.products.shared.definitions import build_org_sections

DEFAULT_ONBOARDING_MODULES = ["leadership", "role_clarity", "culture", "growth"]

SCAN_DEFINITION: dict[str, Any] = {
    "product_name": "Onboarding 30-60-90",
    "signal_label": "Onboardingsignaal",
    "signal_short_label": "onboardingsignaal",
    "trust_contract": {
        "what_it_is": (
            "Een vroege lifecycle-scan op groepsniveau die helpt zien hoe nieuwe medewerkers op een enkel "
            "onboardingcheckpoint landen in rol, leiding, samenwerking en eerste werkcontext."
        ),
        "what_it_is_not": (
            "Geen client onboarding-check, geen individuele beoordeling, geen performance-instrument en geen "
            "volledige employee journey of retentievoorspeller."
        ),
        "how_to_read": (
            "Lees onboarding als checkpoint-read: welke vroege succesvoorwaarden zijn zichtbaar, waar zit frictie "
            "in de eerste periode en welke eerste managementvraag hoort daar nu bij. Gebruik het als single-checkpoint "
            "lifecycle triage, niet als journeymodel."
        ),
        "privacy_boundary": (
            "Management ziet alleen groepsinformatie. De read blijft bewust compact en op groepsniveau; kleine "
            "aantallen vragen terughoudendheid in detailweergave."
        ),
        "evidence_status": (
            "Onboarding 30-60-90 is in deze eerste wave een begrensde checkpoint-laag binnen de bestaande "
            "Verisight-methodiek. De output helpt vroege integratie, eerste frictie, eigenaar, eerste stap en reviewgrens "
            "duiden, maar is nog geen multi-checkpoint journey-, automation- of retentiemodel en ook geen client onboarding-route."
        ),
    },
    "survey_intro": (
        "Deze onboarding-scan is een korte check op hoe nieuwe medewerkers op dit moment landen in hun rol, team en "
        "werkcontext. De uitkomst wordt alleen op groepsniveau gebruikt als managementread voor dit ene checkpoint. "
        "Invullen kost circa 3 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen op groepsniveau gebruikt. Deze meting helpt de "
        "organisatie zien waar vroege integratie of duidelijkheid aandacht vraagt, niet om personen te beoordelen. "
        "Als je tussentijds stopt, bewaart deze browser tijdelijk een concept op dit apparaat totdat je verzendt of "
        "het concept wist."
    ),
    "sdt_intro": (
        "Deze drie stellingen geven een korte momentopname van hoe je nu in je nieuwe werkcontext landt. Geef aan in "
        "welke mate elke stelling voor jou van toepassing is (1 = helemaal niet mee eens, 5 = helemaal mee eens)."
    ),
    "org_intro": (
        "De volgende vragen gaan over de werkfactoren die in dit onboardingcheckpoint actief zijn. Geef per thema aan "
        "hoe dit nu voor jou voelt in je eerste periode."
    ),
    "stay_section_title": "Checkpoint richting nu",
    "stay_intro": (
        "Deze vraag helpt om de huidige instroomervaring te lezen als vroeg signaal: beweegt jouw start nu in een "
        "richting die houdbaar en kansrijk voelt?"
    ),
    "stay_item": (
        "stay_intent",
        "Als het zo doorgaat, voelt mijn start in deze organisatie over de komende maanden nog steeds kansrijk en werkbaar.",
    ),
    "open_text_label": "Welke ene verandering zou voor nieuwe medewerkers in deze fase het meeste verschil maken?",
    "open_text_placeholder": "Welke verandering zou in deze fase het meeste verschil maken?",
    "open_text_help": (
        "Je antwoord wordt geanonimiseerd opgeslagen en alleen als groepssignaal gebruikt om vroege frictie of "
        "verbeterpunten te richten."
    ),
    "invite_intro": (
        "Je bent uitgenodigd voor een korte onboarding-check over hoe je nu landt in je rol, team en werkcontext. "
        "Deze compacte meting helpt de organisatie zien waar nieuwe medewerkers in deze fase steun of duidelijkheid nodig hebben."
    ),
    "invite_duration": "3-5 minuten",
    "contact_subject": "Kennismakingsaanvraag Onboarding 30-60-90",
    "dashboard_signal_help": (
        "Onboardingsignaal 1-10: samenvattend checkpointsignaal van korte werkbeleving en geselecteerde werkfactoren "
        "in deze campaign. Hogere score = scherper vroeg aandachtssignaal dat nu bestuurlijke opvolging vraagt."
    ),
    "report_repeat_title": "Een checkpoint per campaign",
    "report_repeat_body": (
        "Deze eerste onboarding-wave levert alleen een actuele checkpoint-read op. Vergelijking tussen 30, 60 en 90 "
        "dagen en bredere journeylogica horen pas in latere waves."
    ),
    "sdt_items": [
        ("B1", "Ik voel me in deze eerste periode voldoende vrij om mijn werk op een werkbare manier op te pakken."),
        ("B5", "Ik voel me in deze eerste periode voldoende toegerust om mijn rol goed te starten."),
        ("B9", "Ik voel me in deze eerste periode voldoende verbonden met de mensen met wie ik samenwerk."),
    ],
    "org_sections": build_org_sections("onboarding"),
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
