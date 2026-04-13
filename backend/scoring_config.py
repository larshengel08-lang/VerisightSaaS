from __future__ import annotations

# Scale-related config
SDT_REVERSE_ITEMS = {"B4", "B8", "B12"}

SDT_DIMENSION_ITEMS: dict[str, list[str]] = {
    "autonomy": ["B1", "B2", "B3", "B4"],
    "competence": ["B5", "B6", "B7", "B8"],
    "relatedness": ["B9", "B10", "B11", "B12"],
}

ORG_FACTOR_KEYS = [
    "leadership",
    "culture",
    "growth",
    "compensation",
    "workload",
    "role_clarity",
]

EXIT_SCAN_WEIGHTS: dict[str, float] = {
    "leadership": 2.5,
    "culture": 1.5,
    "growth": 1.5,
    "compensation": 1.0,
    "workload": 1.0,
    "role_clarity": 1.0,
}

RETENTION_SCAN_WEIGHTS: dict[str, float] = {
    "leadership": 1.0,
    "culture": 1.0,
    "growth": 1.0,
    "compensation": 1.0,
    "workload": 1.0,
    "role_clarity": 1.0,
}

ROLE_MULTIPLIERS: dict[str, float] = {
    "uitvoerend": 0.50,
    "specialist": 1.00,
    "senior": 1.50,
    "manager": 2.00,
    "director": 2.50,
    "c_level": 3.00,
}
DEFAULT_ROLE_MULTIPLIER = 1.00

RISK_HIGH = 7.0
RISK_MEDIUM = 4.5
SCORING_VERSION = "v1.1"

MIN_AGGREGATE_N = 10
MIN_SEGMENT_N = 5

FACTOR_LABELS_NL: dict[str, str] = {
    "leadership": "Leiderschap",
    "culture": "Psychologische veiligheid & cultuurmatch",
    "growth": "Groeiperspectief",
    "compensation": "Beloning & voorwaarden",
    "workload": "Werkbelasting",
    "role_clarity": "Rolhelderheid",
    "sdt": "Werkbeleving (SDT)",
    "autonomy": "Autonomie",
    "competence": "Competentie",
    "relatedness": "Verbondenheid",
}

EXIT_REASON_LABELS_NL: dict[str, str] = {
    "P1": "Leiderschap / management",
    "P2": "Organisatiecultuur",
    "P3": "Gebrek aan groei",
    "P4": "Beloning",
    "P5": "Werkdruk / stress",
    "P6": "Rolonduidelijkheid",
    "PL1": "Beter aanbod elders",
    "PL2": "Carrièreswitch",
    "PL3": "Ondernemerschap",
    "S1": "Persoonlijke omstandigheid",
    "S2": "Verhuizing / partner",
    "S3": "Studie / pensioen",
}

RECOMMENDATIONS: dict[str, dict[str, list[str]]] = {
    "leadership": {
        "HOOG": [
            "Implementeer direct een 1:1 check-in structuur (wekelijks, 30 min).",
            "Start leiderschapstraject gericht op coachend management (SDT-based).",
            "Overweeg 360°-feedback voor direct leidinggevenden binnen 30 dagen.",
            "Evalueer span-of-control: is het aantal directe rapporten beheersbaar?",
        ],
        "MIDDEN": [
            "Plan kwartaalgesprekken over ontwikkeling en werkbeleving.",
            "Introduceer concrete feedbackmomenten in bestaande teamoverleggen.",
            "Zorg voor heldere escalatiepaden bij spanningen tussen medewerker en manager.",
        ],
        "LAAG": [
            "Leiderschapskwaliteit scoort goed; periodiek monitoren volstaat.",
            "Deel best practices van sterke managers intern.",
        ],
    },
    "culture": {
        "HOOG": [
            "Voer cultuuraudit uit (psychologische veiligheid - Edmondson-instrument).",
            "Stel actieplan op voor inclusie en respect op de werkplek.",
            "Adresseer specifieke cultuurklachten uit open teksten binnen 2 weken.",
        ],
        "MIDDEN": [
            "Organiseer teamsessies rondom waarden en gedragsnormen.",
            "Meet psychologische veiligheid periodiek en vergelijk vooral met eerdere eigen metingen.",
        ],
        "LAAG": [
            "Cultuurscores zijn positief; bewaken bij organisatieveranderingen.",
        ],
    },
    "growth": {
        "HOOG": [
            "Stel binnen 30 dagen persoonlijk ontwikkelplan op voor iedere medewerker.",
            "Introduceer of activeer mentoring- en interne mobiliteitsprogramma.",
            "Maak loopbaanpaden zichtbaar en bespreekbaar (carriere-architectuur).",
        ],
        "MIDDEN": [
            "Evalueer of L&D-budget effectief wordt ingezet.",
            "Voeg groeigesprek toe aan de jaarcyclus (naast beoordelingsgesprek).",
        ],
        "LAAG": [
            "Groeimogelijkheden worden gewaardeerd; behoud de huidige aanpak.",
        ],
    },
    "compensation": {
        "HOOG": [
            "Voer een marktvergelijking uit voor beloning en voorwaarden.",
            "Onderzoek non-financiele arbeidsvoorwaarden als aanvulling.",
            "Communiceer transparant over beloningsstructuur en groeipaden.",
        ],
        "MIDDEN": [
            "Evalueer arbeidsvoorwaarden bij de volgende CAO-ronde of budgetcyclus.",
            "Overweeg flexibele benefits (keuzebudget).",
        ],
        "LAAG": [
            "Beloning wordt als marktconform ervaren; geen directe actie vereist.",
        ],
    },
    "workload": {
        "HOOG": [
            "Urgent: analyseer werklastklachten en stel concrete capaciteitsmaatregelen in.",
            "Voer JD-R resources-scan uit - zijn er voldoende taakhulpbronnen?",
            "Overweeg tijdelijke capaciteitsuitbreiding of herindeling van taken.",
        ],
        "MIDDEN": [
            "Monitor werklastbeleving maandelijks via een korte pulse-meting.",
            "Bespreek werkdruk actief in teamoverleg.",
        ],
        "LAAG": [
            "Werkbelasting is in balans; handhaaf de huidige aanpak.",
        ],
    },
    "role_clarity": {
        "HOOG": [
            "Herschrijf functiebeschrijvingen en bespreek deze individueel.",
            "Introduceer een RACI-model voor cruciale processen.",
            "Zorg dat verwachtingen aantoonbaar schriftelijk zijn gecommuniceerd.",
        ],
        "MIDDEN": [
            "Verhelder taken en verantwoordelijkheden in teamoverleg.",
            "Controleer of KPI's en doelen voor iedereen helder zijn.",
        ],
        "LAAG": [
            "Rolhelderheid is goed; geen directe actie vereist.",
        ],
    },
}
