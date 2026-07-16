from __future__ import annotations

from typing import Any

from backend.products.exit.definition import SCAN_DEFINITION
from backend.products.shared.management_language import (
    MANAGEMENT_BAND_LABELS,
    management_band_label,
)


TRUST_CONTRACT = SCAN_DEFINITION["trust_contract"]


EXIT_DECISION_BY_FACTOR = {
    "leadership": (
        "Beslis eerst of dit vooral een leidinggevend patroon in enkele teams is of een breder MT-thema dat gezamenlijke opvolging vraagt."
    ),
    "culture": (
        "Beslis of dit vooral een teamspecifiek veiligheidsspoor is of een breder cultuurthema dat MT-aandacht en opvolging vraagt."
    ),
    "growth": (
        "Beslis of de grootste ingreep nu moet zitten in zicht op perspectief, het gesprek daarover of feitelijke ontwikkelruimte."
    ),
    "compensation": (
        "Beslis of de kern nu ligt in hoogte, ervaren fairness of uitlegbaarheid van voorwaarden en welke groep eerst opvolging vraagt."
    ),
    "workload": (
        "Beslis eerst waar structurele druk echt verlicht moet worden en welk team of welke rol als eerste managementingreep vraagt."
    ),
    "role_clarity": (
        "Beslis of het probleem nu vooral zit in prioriteiten, rolgrenzen of onduidelijke besluitvorming, en waar dat eerst hersteld moet worden."
    ),
}

EXIT_OWNER_BY_FACTOR = {
    "leadership": "HR business partner met betrokken leidinggevende",
    "culture": "HR lead met betrokken MT-lid",
    "growth": "HR development-owner met betrokken leidinggevende",
    "compensation": "HR lead met MT of directie",
    "workload": "Betrokken leidinggevende met HR en operations",
    "role_clarity": "Betrokken leidinggevende met HR business partner",
}

EXIT_PLAYBOOKS = {

    # ─── ORGANISATIEFACTOREN ───────────────────────────────────────────

    "leadership": {
        "HOOG": {
            "title": "Leiderschap als vertrekdriver: directe managementvraag",
            "signal": "Vertrekkers ervoeren leiderschap als ontoereikend. Dit was een van de sterkste drivers van hun vertrek.",
            "implication": "Huidige medewerkers in dezelfde omgeving lopen een vergelijkbaar risico. Dit vraagt een reactie voordat het volgende vertrek plaatsvindt.",
            "decision": "Beslis welk leiderschapsgedrag structureel anders moet, en wie daarvoor verantwoordelijk is.",
            "owner": "Directie / HR-directeur",
            "actions": [
                "Identificeer in welke teams of lagen het signaal zich concentreert.",
                "Voer een korte toets met 2–3 huidige medewerkers: wat hebben zij nodig van hun leidinggevende?",
                "Maak één concrete gedragsafspraak met de betrokken leidinggevende: geen training, maar een eerste zichtbare stap.",
                "Plan een reviewmoment in over 6–8 weken.",
            ],
            "caution": "Gebruik de exitdata niet als aanklacht. Gebruik het als spiegel voor een toekomstgesprek, niet als dossier.",
        },
        "MIDDEN": {
            "title": "Leiderschap als bijdragende factor: toetsen en volgen",
            "signal": "Leiderschap droeg bij aan vertrek, maar was niet de dominante driver.",
            "implication": "Het signaal is te aanwezig om te negeren, maar rechtvaardigt geen grote interventie.",
            "decision": "Toets of dit een structureel of situationeel patroon is voordat je handelt.",
            "owner": "HR-manager",
            "actions": [
                "Check of het signaal bij één team concentreert of breed verspreid is.",
                "Neem het mee als gespreksthema in het eerstvolgende leiderschaps- of functioneringsgesprek.",
            ],
            "caution": "Maak dit niet groter dan het is. Een midden-signaal vraagt aandacht, geen incident.",
        },
        "LAAG": {
            "title": "Leiderschap geen vertrekdriver: bevestig wat werkt",
            "signal": "Leiderschap was geen relevante factor in het vertrekpatroon.",
            "implication": "Positief signaal. Leidinggevenden in dit beeld doen iets goed.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [
                "Deel het positieve beeld met betrokken leidinggevenden als erkenning.",
            ],
            "caution": "Ga er niet van uit dat dit permanent is. Herhaal de meting bij nieuwe uitstroom.",
        },
    },

    "culture": {
        "HOOG": {
            "title": "Cultuur als vertrekdriver: breed organisatiesignaal",
            "signal": "Vertrekkers ervoeren de organisatiecultuur als een reden om te gaan. Dit is geen individuele managementvraag maar een collectief patroon.",
            "implication": "Cultuur raakt iedereen. Dit signaal is moeilijker te adresseren dan één leidinggevende, maar ook gevaarlijker om te negeren.",
            "decision": "Beslis of jullie dit actief willen benoemen en aanpakken, of accepteren dat het een structureel vertrekrisico blijft.",
            "owner": "Directie / MT",
            "actions": [
                "Breng het cultuurthema expliciet op in een MT-sessie, niet als probleem maar als strategische vraag.",
                "Selecteer één concreet cultuuraspect (bijv. feedback, samenwerking, psychologische veiligheid) voor een eerste gesprek.",
                "Gebruik de RetentieScan als vervolgstap om te toetsen of huidige medewerkers hetzelfde beeld herkennen.",
            ],
            "caution": "Vermijd brede cultuurprogramma's als directe reactie. Begin met één benoembaar aspect, niet met een transformatietraject.",
        },
        "MIDDEN": {
            "title": "Cultuur als bijdragende factor: bewust volgen",
            "signal": "Cultuur speelde een rol bij vertrek, maar was niet de kern.",
            "implication": "Het signaal is diffuus genoeg om meerdere interpretaties toe te laten. Validatie is nodig voordat je handelt.",
            "decision": "Houd dit op de radar en toets bij de volgende meting of het signaal sterker wordt.",
            "owner": "HR-manager",
            "actions": [
                "Noteer het als aandachtspunt voor de eerstvolgende teamreview of medewerkersbespreking.",
            ],
            "caution": "Cultuur is makkelijk als catch-all te gebruiken. Wees specifiek over welk aspect van cultuur dit signaal raakt.",
        },
        "LAAG": {
            "title": "Cultuur geen vertrekdriver: stabiel beeld",
            "signal": "Cultuur werd door vertrekkers niet als reden van vertrek benoemd.",
            "implication": "De beleefde cultuur was voor deze groep geen drempel.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Cultuurbeelden kunnen verschuiven bij teamsamenstelling of leiderschapswisselingen. Monitor bij significante organisatiewijzigingen.",
        },
    },

    "growth": {
        "HOOG": {
            "title": "Groei en ontwikkeling als vertrekdriver: ambitieuze mensen zagen geen pad",
            "signal": "Vertrekkers ervoeren onvoldoende ruimte voor groei, ontwikkeling of doorstroom. Ze vertrokken (deels) omdat ze elders meer perspectief zagen.",
            "implication": "Huidige medewerkers met vergelijkbare ambities zitten in dezelfde situatie. Dit is een actief retentierisico voor je beste mensen.",
            "decision": "Beslis of jullie groeipad en ontwikkelingsmogelijkheden zichtbaar genoeg zijn voor huidige medewerkers.",
            "owner": "Directleidinggevende / HR-manager",
            "actions": [
                "Voer binnen 4 weken een kort gesprek met 2–3 medewerkers over hun groeiverwachting.",
                "Inventariseer welke ontwikkelmogelijkheden er zijn, en of die actief worden gecommuniceerd.",
                "Maak voor ten minste één medewerker een concreet groeigesprek met een eerste zichtbare stap.",
            ],
            "caution": "Beloof geen groeipaden die er niet zijn. Een eerlijk gesprek over begrensde mogelijkheden is beter dan een valse belofte.",
        },
        "MIDDEN": {
            "title": "Groei als bijdragende factor: verwachtingsmanagement toetsen",
            "signal": "Ontwikkeling speelde een rol bij vertrek, maar was niet de dominante reden.",
            "implication": "Mogelijk is er een kloof tussen wat medewerkers verwachten en wat de organisatie biedt. Dat hoeft geen probleem te zijn als het wordt besproken.",
            "decision": "Toets of de groeiverwachting van huidige medewerkers realistisch is afgestemd.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Neem groeiverwachting op als vast gespreksthema in functionerings- of ontwikkelgesprekken.",
            ],
            "caution": "Niet elk vertrek op groeigebied is te voorkomen. Sommige mensen vertrekken om extern te groeien. Dat is geen fout.",
        },
        "LAAG": {
            "title": "Groei geen vertrekdriver: ontwikkelklimaat voldoende",
            "signal": "Vertrekkers benoemden groei niet als relevante driver.",
            "implication": "Het ontwikkelklimaat werd niet als drempel ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Dit zegt niets over de kwaliteit van je ontwikkelaanbod, alleen dat het voor deze vertrekkers geen reden was.",
        },
    },

    "compensation": {
        "HOOG": {
            "title": "Beloning als vertrekdriver: marktpositie of eerlijkheidsvraag",
            "signal": "Vertrekkers ervoeren beloning als ontoereikend of niet eerlijk. Dit was een concrete bijdrage aan hun vertrekbeslissing.",
            "implication": "Als beloning een vertrekdriver is, zijn huidige medewerkers in vergelijkbare functies waarschijnlijk dezelfde marktdruk blootgesteld.",
            "decision": "Beslis of jullie beloningsbeleid marktconform is én of medewerkers dat als eerlijk ervaren.",
            "owner": "Directie / HR-directeur",
            "actions": [
                "Voer een marktcheck uit voor de functies waar de meeste uitstroom was.",
                "Onderscheid: is het een absolute beloningsvraag (te laag) of een ervaringsvraag (niet transparant, niet eerlijk)?",
                "Als er ruimte is: communiceer proactief over beloningssystematiek: transparantie verlaagt de perceptie van oneerlijkheid.",
            ],
            "caution": "Verhoog salaris alleen als de marktcheck dit rechtvaardigt. Incidentele correcties zonder beleid creëren nieuwe ongelijkheid.",
        },
        "MIDDEN": {
            "title": "Beloning als bijdragende factor: transparantie toetsen",
            "signal": "Beloning speelde een rol, maar was niet de primaire vertrekreden.",
            "implication": "Mogelijk is het geen absolute beloningsvraag maar een perceptievraag: worden medewerkers meegenomen in wat ze kunnen verwachten?",
            "decision": "Toets of het beloningsgesprek structureel genoeg plaatsvindt.",
            "owner": "HR-manager / direct leidinggevende",
            "actions": [
                "Zorg dat beloning een vast onderdeel is van het jaarlijkse gesprekscyclus.",
            ],
            "caution": "Ga niet uit van een marktprobleem als de data dit niet eenduidig aangeeft.",
        },
        "LAAG": {
            "title": "Beloning geen vertrekdriver: beloningsbeleving stabiel",
            "signal": "Beloning werd door vertrekkers niet als reden van vertrek benoemd.",
            "implication": "Geen actie vereist op beloningsgebied.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Beloningsbeleving is conjunctuurgevoelig. Monitor bij arbeidsmarktverschuivingen of functieherwaarderingen.",
        },
    },

    "workload": {
        "HOOG": {
            "title": "Werkbelasting als vertrekdriver: duurzaamheidsvraag",
            "signal": "Vertrekkers ervoeren de werkbelasting als te hoog of structureel onhoudbaar. Dit was een directe bijdrage aan hun vertrek.",
            "implication": "Dit is een urgent signaal. Huidige medewerkers in dezelfde context zitten waarschijnlijk in dezelfde situatie, nu.",
            "decision": "Beslis of de huidige werkdruk duurzaam is en wie er nu al aan het einde van zijn of haar belastbaarheid zit.",
            "owner": "Direct leidinggevende / directie",
            "actions": [
                "Voer binnen twee weken een korte check met het team: hoe ervaren zij de huidige werkdruk?",
                "Inventariseer of de hoge belasting structureel is (te weinig mensen) of situationeel (tijdelijke piek).",
                "Maak één concrete keuze: wat laten we los, wat verdelen we anders, of wat vragen we extra capaciteit voor?",
            ],
            "caution": "Zeg niet 'het gaat beter worden' zonder dat er een concrete verandering op tafel ligt. Medewerkers herkennen holle beloftes.",
        },
        "MIDDEN": {
            "title": "Werkbelasting als bijdragende factor: duurzaamheid volgen",
            "signal": "Werkbelasting speelde een rol bij vertrek maar was niet de dominante driver.",
            "implication": "Mogelijk is het een grensgebied-situatie: het werkt, maar er is weinig marge.",
            "decision": "Houd de belastbaarheid actief in beeld bij de betrokken teams.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Maak werkdruk een terugkerend bespreekpunt in teamoverleg, niet als klachtkanaal maar als managementinformatie.",
            ],
            "caution": "Negeer midden-signalen op werkbelasting niet. Ze escaleren sneller dan andere factoren.",
        },
        "LAAG": {
            "title": "Werkbelasting geen vertrekdriver: belastbaarheid in balans",
            "signal": "Werkbelasting werd niet als vertrekreden benoemd.",
            "implication": "De werkdruk werd als hanteerbaar ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Werkbelasting kan snel omslaan bij bezettingswijzigingen of pieken. Monitor actief.",
        },
    },

    "role_clarity": {
        "HOOG": {
            "title": "Rolhelderheid als vertrekdriver: verwachtingen niet gedeeld",
            "signal": "Vertrekkers waren onvoldoende helder over hun rol, mandaat of wat er van hen verwacht werd. Dit droeg bij aan hun vertrek.",
            "implication": "Onduidelijkheid over rollen is een managementprocesvraag, geen persoonsvraag. Huidige medewerkers ervaren waarschijnlijk dezelfde onduidelijkheid.",
            "decision": "Beslis of rollen en verwachtingen expliciet genoeg zijn belegd, en of dat actief wordt bijgehouden bij functiewijzigingen.",
            "owner": "Direct leidinggevende / HR-manager",
            "actions": [
                "Selecteer 2–3 sleutelfuncties en toets per gesprek: zijn rol, mandaat en verwachting helder?",
                "Maak een eenvoudige check: kan de medewerker in eigen woorden zeggen wat succes er in zijn of haar rol uitziet?",
                "Voer bij nieuwe medewerkers of functiewijzigingen een standaard rolverduidelijkingsgesprek in.",
            ],
            "caution": "Rolhelderheid is geen document. Een functiebeschrijving lost dit niet op, een gesprek wel.",
        },
        "MIDDEN": {
            "title": "Rolhelderheid als bijdragende factor: verwachtingscheck",
            "signal": "Rolonduidelijkheid speelde mee bij vertrek, maar was niet de kern.",
            "implication": "Mogelijk was het rolhelderheid als symptoom van iets anders: veranderende organisatie, wisselende prioriteiten.",
            "decision": "Toets of verwachtingen bij huidige medewerkers voldoende zijn afgestemd.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Neem rolhelderheid op als standaard gespreksonderwerp bij elk functioneringsgesprek.",
            ],
            "caution": "Niet elk rolprobleem is op te lossen met een gesprek. Soms vraagt het een organisatorische keuze.",
        },
        "LAAG": {
            "title": "Rolhelderheid geen vertrekdriver: verwachtingen helder",
            "signal": "Rolonduidelijkheid was geen relevante factor in het vertrekpatroon.",
            "implication": "Verwachtingen werden als voldoende helder ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Rolhelderheid verslechtert bij reorganisaties en groei. Houd het actief bij grote veranderingen.",
        },
    },

    # ─── SDT-DIMENSIES ─────────────────────────────────────────────────

    "autonomy": {
        "HOOG": {
            "title": "Autonomie als vertrekdriver: ruimte ontbrak",
            "signal": "Vertrekkers ervoeren onvoldoende ruimte om zelf beslissingen te nemen, hun werk in te richten of eigen inbreng te hebben.",
            "implication": "Laag autonomiegevoel correleert sterk met uitstroom bij medewerkers die zichzelf kunnen redden. Wie dit mist, zoekt het elders.",
            "decision": "Beslis of de huidige mate van controle en afstemming past bij het niveau en de ambitie van je mensen.",
            "owner": "Direct leidinggevende / directie",
            "actions": [
                "Vraag huidige medewerkers expliciet: in welk onderdeel van je werk zou je meer ruimte willen?",
                "Identificeer één beslissingsdomein waar je als leidinggevende stap terug kunt doen.",
            ],
            "caution": "Meer autonomie zonder kader werkt averechts. Geef ruimte binnen heldere verwachtingen.",
        },
        "MIDDEN": {
            "title": "Autonomie als bijdragende factor: balans toetsen",
            "signal": "Autonomiegevoel speelde mee maar was niet dominant.",
            "implication": "Mogelijk zit er een perceptiekloof tussen wat de leidinggevende denkt te geven en wat de medewerker ervaart.",
            "decision": "Toets de perceptie bij huidige medewerkers in een open gesprek.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Neem autonomie op als gespreksthema in het eerstvolgende ontwikkelgesprek.",
            ],
            "caution": "Niet elke behoefte aan autonomie is even groot. Differentieer per medewerker.",
        },
        "LAAG": {
            "title": "Autonomie geen vertrekdriver: ruimte als voldoende ervaren",
            "signal": "Autonomiegebrek was geen vertrekreden.",
            "implication": "De huidige mate van zelfbeschikking werd als toereikend ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Autonomiebehoefte groeit met senioriteit. Monitor bij doorgroeiers.",
        },
    },

    "competence": {
        "HOOG": {
            "title": "Competentiebenutting als vertrekdriver: talent niet ingezet",
            "signal": "Vertrekkers ervoeren dat hun competenties onvoldoende werden benut of erkend. Ze vertrokken naar een plek waar ze meer konden laten zien.",
            "implication": "Dit is een signaal dat je talent verliest niet aan salaris maar aan onderbenutte capaciteit. Huidige topmedewerkers lopen hetzelfde risico.",
            "decision": "Beslis of de huidige rolverdeling de beste inzet van beschikbare talenten mogelijk maakt.",
            "owner": "Direct leidinggevende / HR-manager",
            "actions": [
                "Voer een 'sterktecheck' met je team: in welk deel van hun werk voelen mensen zich het meest competent?",
                "Zoek naar ten minste één aanpassing in takenpakket of project waarmee iemand meer van zijn of haar sterktes kan inzetten.",
            ],
            "caution": "Niet elk competentietekort is op te lossen zonder roldefinitie of budget. Wees eerlijk over de ruimte die er is.",
        },
        "MIDDEN": {
            "title": "Competentiebenutting als bijdragende factor: erkenning toetsen",
            "signal": "Competentiebenutting speelde een rol maar was niet de kern van het vertrek.",
            "implication": "Mogelijk is het een erkenningsvraag: worden bijdragen gezien en benoemd?",
            "decision": "Toets of erkenning en talentontwikkeling voldoende zichtbaar zijn.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Neem bewuste erkenning van individuele bijdragen op als terugkerend aandachtspunt.",
            ],
            "caution": "Erkenning werkt alleen als het specifiek en oprecht is, niet als ritueel compliment.",
        },
        "LAAG": {
            "title": "Competentiebenutting geen vertrekdriver: talent ingezet",
            "signal": "Vertrekkers ervoeren competentiebenutting niet als pijnpunt.",
            "implication": "Talent werd als voldoende ingezet en erkend ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Competentiebehoefte evolueert. Houd het in beeld bij functiegroei en senioriteit.",
        },
    },

    "relatedness": {
        "HOOG": {
            "title": "Verbondenheid als vertrekdriver: sociale basis onvoldoende",
            "signal": "Vertrekkers ervoeren onvoldoende verbondenheid met collega's of de organisatie. Ze voelden zich niet echt onderdeel van het geheel.",
            "implication": "Verbondenheid is de meest onderschatte retentiefactor. Als mensen niet voelen dat ze erbij horen, zoeken ze dat gevoel elders, ook zonder concreet vertrekplan.",
            "decision": "Beslis of de sociale cohesie in het team voldoende aandacht krijgt als managementtaak.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Voer individuele korte check-ins in (10–15 min): niet over werk maar over hoe iemand zich voelt in het team.",
                "Creëer ten minste één moment van teamverbinding per maand dat niet werkinhoudelijk is.",
            ],
            "caution": "Verbondenheid forceer je niet met teamuitjes. Het gaat om dagelijkse micro-erkenning en echte interesse in de persoon achter de functie.",
        },
        "MIDDEN": {
            "title": "Verbondenheid als bijdragende factor: sociale cohesie volgen",
            "signal": "Verbondenheid speelde een rol maar was niet dominant.",
            "implication": "Mogelijk is er een subgroep die minder goed is geïntegreerd of geïsoleerd begint te raken.",
            "decision": "Let bewust op wie in het team minder zichtbaar of betrokken lijkt.",
            "owner": "Direct leidinggevende",
            "actions": [
                "Identificeer of er medewerkers zijn die opvallend weinig sociaal contact hebben in het team.",
            ],
            "caution": "Introversie is geen gebrek aan verbondenheid. Kijk naar gedragsverandering, niet naar persoonlijkheid.",
        },
        "LAAG": {
            "title": "Verbondenheid geen vertrekdriver: sociale basis stabiel",
            "signal": "Vertrekkers benoemden gebrek aan verbondenheid niet als reden.",
            "implication": "De sociale basis van het team werd als voldoende ervaren.",
            "decision": "Geen actie vereist.",
            "owner": "—",
            "actions": [],
            "caution": "Verbondenheid is kwetsbaar bij snelle groei of hybride werk. Monitor actief bij teamwijzigingen.",
        },
    },
}


def _derive_band(avg: float) -> str:
    signal_value = 11.0 - float(avg)
    if signal_value >= 7:
        return "HOOG"
    if signal_value >= 4.5:
        return "MIDDEN"
    return "LAAG"


def get_action_playbooks_payload(
    factor_avgs: dict,
    top_risks: list,
) -> list[dict]:
    """
    Retourneert een lijst van playbook-entries voor factoren met
    band HOOG of MIDDEN. Alleen factoren die gescoord zijn (aanwezig
    in factor_avgs) worden meegenomen.

    Banddrempels volgen exact de bestaande logica in report.py via een
    omrekening van belevingsscore naar signaalwaarde voor ExitScan.
    """
    _ = top_risks
    result = []
    for factor_key, avg in factor_avgs.items():
        if factor_key not in EXIT_PLAYBOOKS:
            continue

        band = _derive_band(avg)
        if band == "LAAG":
            continue

        entry = EXIT_PLAYBOOKS[factor_key][band].copy()
        entry["factor_key"] = factor_key
        entry["band"] = band
        entry["score"] = round(float(avg), 1)
        result.append(entry)

    result.sort(key=lambda x: (0 if x["band"] == "HOOG" else 1, x["score"]))
    return result


def _exit_review_moment_text(focus_text: str) -> str:
    return (
        f"Plan binnen 60-90 dagen een review op {focus_text.lower()}: wat is gekozen, wat is uitgevoerd "
        "en welke signalen keren terug in de volgende exitbatch of in managementgesprekken."
    )


def get_management_summary_payload(
    *,
    top_factor_labels: list[str],
    top_factor_keys: list[str],
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    strong_work_signal_pct: float | None,
    signal_visibility_average: float | None,
    enps_summary: dict[str, int] | None = None,
    total_replacement_cost_eur: float | None = None,
) -> dict[str, Any]:
    top_factor_text = " en ".join(label.lower() for label in top_factor_labels[:2]) if top_factor_labels else "de scherpste werkfactoren"
    top_reason_text = (top_exit_reason_label or "het huidige vertrekbeeld").lower()
    top_factor_value = " / ".join(top_factor_labels[:2]) if top_factor_labels else "Nog geen duidelijke topfactor"
    lead_factor_key = top_factor_keys[0] if top_factor_keys else None
    first_decision = (
        EXIT_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Kies eerst of {top_factor_text} vooral een lokaal managementspoor of een breder organisatievraagstuk vormen."
    )
    first_owner = (
        EXIT_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR business partner met betrokken leidinggevende"

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        profile_body = (
            f"{top_reason_text.capitalize()} komt relatief vaak terug en valt samen met een breed werksignaal. "
            f"De scherpste managementduiding zit nu vooral in {top_factor_text}."
        )
    elif strong_work_signal_pct is not None:
        profile_body = (
            f"{top_reason_text.capitalize()} is zichtbaar, maar het werkgerelateerde beeld vraagt nog nadere toetsing. "
            f"Gebruik vooral {top_factor_text} om te toetsen waar het vertrekverhaal bestuurlijk het meest beïnvloedbaar lijkt."
        )
    else:
        profile_body = (
            f"{top_reason_text.capitalize()} geeft het eerste vertrekhaakje. "
            f"Gebruik {top_factor_text} om te bepalen welk deel van dit vertrekbeeld vooral managementverificatie vraagt."
        )

    if signal_visibility_average is not None and signal_visibility_average < 3:
        management_question = (
            f"Welke signalen rond {top_reason_text} kwamen te laat of onvoldoende veilig boven tafel, "
            f"en hoe hangt dat samen met {top_factor_text}?"
        )
    elif top_contributing_reason_label:
        management_question = (
            f"Wijst {top_reason_text} vooral op een breed werkgerelateerd vertrekbeeld, "
            f"of laat {top_contributing_reason_label.lower()} zien waar management eerst dieper moet toetsen?"
        )
    else:
        management_question = (
            f"Welk deel van {top_reason_text} valt nu het duidelijkst samen met {top_factor_text} "
            "en dus met beïnvloedbare werkfrictie?"
        )

    if signal_visibility_average is None:
        visibility_value = "Nog in opbouw"
        visibility_body = (
            "Zodra meer exitresponses binnen zijn laat ExitScan zien of signalen vooraf zichtbaar of bespreekbaar waren."
        )
    elif signal_visibility_average >= 4:
        visibility_value = "Signalen waren zichtbaar"
        visibility_body = (
            "Twijfel of vertrek kwam niet volledig uit de lucht vallen. Toets vooral waar opvolging of escalatie te laat kwam."
        )
    elif signal_visibility_average >= 3:
        visibility_value = "Signalen waren deels zichtbaar"
        visibility_body = (
            "Er waren aanwijzingen, maar nog geen scherp of breed gesprek. Kijk waar opvolging tussen wal en schip viel."
        )
    else:
        visibility_value = "Signalen bleven onder de radar"
        visibility_body = (
            "Gebruik dit om te onderzoeken waar twijfels te laat zichtbaar werden of onvoldoende veilig bespreekbaar waren."
        )

    executive_intro = (
        f"ExitScan maakt het vertrekbeeld bestuurlijk leesbaar: {top_reason_text} is nu het eerste vertrekhaakje, "
        f"terwijl {top_factor_text} laten zien waar management het meeste kan toetsen en verbeteren."
    )
    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        executive_intro += (
            " De antwoorden wijzen daarbij relatief breed op beïnvloedbare werkfrictie, wat het rapport vooral bruikbaar maakt "
            "voor prioritering, eigenaarschap en een gericht managementgesprek."
        )
    else:
        executive_intro += (
            " Gebruik dit rapport daarom als vertrekduiding en verificatiespoor, niet als sluitende oorzaakverklaring."
        )

    trust_note = (
        "Lees ExitScan als managementsamenvatting van vertrekpatronen. Het rapport bundelt signalen, werkfactoren en hypotheses "
        "tot een bestuurlijk gesprek, zonder causaliteit, diagnose of harde voorspellingen te claimen. "
        "De uitkomst is indicatief, gegroepeerd en bedoeld voor prioritering en verificatie. "
        "Detailweergave start pas vanaf 5 responses, patroonanalyse pas vanaf 10 en segmenten verschijnen alleen bij voldoende n. "
        "ExitScan is methodisch verdedigbaar, maar niet extern gevalideerd als diagnostisch instrument."
    )

    if strong_work_signal_pct is not None and strong_work_signal_pct >= 50:
        boardroom_relevance = (
            f"Een relatief groot deel van de exitbatch wijst op beïnvloedbare werkfrictie rond {top_factor_text}. "
            "Daardoor is dit niet alleen HR-nazorg, maar een bestuurlijk prioriteitsspoor voor leiding, inrichting en opvolging."
        )
    else:
        boardroom_relevance = (
            f"Het vertrekbeeld is nog niet breed genoeg voor grote conclusies, maar wel scherp genoeg om {top_factor_text} "
            "als bestuurlijk verificatiespoor te behandelen."
        )

    exposure_value = None
    exposure_body = (
        "Gebruik deze noot alleen als indicatieve exposure op basis van interne vervangingskosten van de huidige exitbatch, "
        "niet als bewezen besparingsclaim of ROI."
    )
    if total_replacement_cost_eur is not None and total_replacement_cost_eur > 0:
        if total_replacement_cost_eur >= 1_000_000:
            exposure_value = f"EUR {total_replacement_cost_eur / 1_000_000:.1f} mln"
        else:
            exposure_value = f"EUR {round(total_replacement_cost_eur / 1000):.0f}k"

    boardroom_cards = [
        {
            "title": "Wat speelt nu",
            "value": top_exit_reason_label or "Nog geen duidelijk vertrekbeeld",
            "body": profile_body,
        },
        {
            "title": "Waarom telt dit nu",
            "value": "Bestuurlijke relevantie",
            "body": boardroom_relevance,
        },
        {
            "title": "Waar zit de meeste druk",
            "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
            "body": f"{top_factor_text.capitalize()} kleuren nu het vertrekbeeld het sterkst en verdienen daarom de meeste managementaandacht.",
        },
        {
            "title": "Wat vraagt verificatie",
            "value": management_band_label(band="MIDDEN"),
            "body": management_question,
        },
        {
            "title": "Eerste besluit",
            "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
            "body": first_decision,
        },
    ]
    if exposure_value:
        boardroom_cards.append({
            "title": "Indicatieve exposure",
            "value": exposure_value,
            "body": exposure_body,
        })

    boardroom_watchout = (
        "Lees dit niet als bewijs van de ene oorzaak van vertrek en ook niet als garantie dat een interventie het patroon oplost. "
        "ExitScan helpt sneller wegen waar management moet toetsen en kiezen, niet om achteraf absolute zekerheid te claimen."
    )

    executive_compact_card = None
    if signal_visibility_average is not None:
        executive_compact_card = {
            "title": "Eerdere signalering",
            "value": visibility_value,
            "body": visibility_body,
        }
    enps_card = None
    if enps_summary is not None:
        enps_card = {
            "title": "eNPS",
            "value": f"{enps_summary['score']:+d}",
            "body": "Aandeel bevelers minus critici. Schaal -100 tot +100.",
        }

    return {
        "section_title": "Managementsamenvatting",
        "distribution_title": "Verdeling van het vertrekbeeld",
        "findings_title": "Scherpste managementlezing",
        "executive_title": "Vertrekduiding voor HR, MT en directie",
        "executive_intro": executive_intro,
        "trust_note_title": "Leeswijzer voor bestuur en management",
        "trust_note": trust_note,
        "executive_compact_card": executive_compact_card,
        "boardroom_title": "Bestuurlijke handoff",
        "boardroom_intro": (
            "Deze bestuurlijke handoff helpt een sponsor, MT of directie snel zien wat nu speelt, waarom het telt, "
            "waar de meeste druk zit en wat vooral eerst geverifieerd moet worden."
        ),
        "boardroom_cards": boardroom_cards,
        "boardroom_watchout_title": "Wat je hier niet uit moet concluderen",
        "boardroom_watchout": boardroom_watchout,
        "highlight_cards": ([
            {
                "title": "Vertrekbeeld nu",
                "value": (top_exit_reason_label or "Nog geen duidelijke hoofdreden"),
                "body": profile_body,
            },
            {
                "title": "Scherpste werkfactoren",
                "value": top_factor_value,
                "body": (
                    f"Gebruik {top_factor_text} als eerste verificatiespoor om te bepalen welk deel van het vertrekverhaal bestuurlijk het meest beïnvloedbaar is."
                ),
            },
            {
                "title": "Wat vraagt verificatie",
                "value": management_band_label(band="MIDDEN"),
                "body": management_question,
            },
            {
                "title": "Eerste besluit",
                "value": top_factor_labels[0] if top_factor_labels else "Nog geen topfactor",
                "body": first_decision,
            },
            {
                "title": "Eerste eigenaar",
                "value": first_owner,
                "body": "Beleg direct wie het eerste verificatiespoor trekt, zodat vertrekduiding niet blijft hangen in analyse of gesprek.",
            },
            {
                "title": "Eerdere signalering",
                "value": visibility_value,
                "body": visibility_body,
            },
        ] + ([enps_card] if enps_card else [])),
        "cards": [
            {
                "title": "Vertrekbeeld nu",
                "body": profile_body,
            },
            {
                "title": "Eerste managementvraag",
                "body": management_question,
            },
            {
                "title": "Waar zit de meeste druk",
                "body": f"{top_factor_text.capitalize()} kleuren nu het vertrekbeeld het sterkst en verdienen daarom de meeste managementaandacht.",
            },
            {
                "title": "Wat vraagt verificatie",
                "body": management_question,
            },
            {
                "title": "Eerste logische stap",
                "body": (
                    f"Vertaal {top_factor_text.lower()} binnen 30 dagen naar één gerichte verbeteractie met duidelijke eigenaar "
                    "en zichtbare opvolging."
                ),
            },
        ],
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "intro_text": (
            "Dit rapport vertaalt exitdata naar vertrekduiding die bestuurlijk leesbaar is. "
            "De methodiek is compact en nadrukkelijk geen volledig diagnostisch instrument; de uitkomst is bedoeld voor prioritering, gesprek en opvolging. "
            "De labels hieronder zijn managementtaal bovenop ongewijzigde interne scorebanden."
        ),
        "method_text": (
            "Elke respondent krijgt een frictiescore op een schaal van 1 tot 10. "
            "Een hogere score betekent meer signalen van ervaren werkfrictie rondom vertrek. "
            "Gebruik de score als samenvatting van het vertrekbeeld, niet als causale voorspelling, benchmark of objectief oordeel. "
            "De score is een gewogen gemiddelde van zeven factoren:"
        ),
        "weight_rows": [
            ["Factor", "Gewicht", "Richting in literatuur"],
            ["Leiderschap", "2.5 x", "Sterk gekoppeld aan vrijwillig verloop in de literatuur en vaak direct relevant in vertrekduiding."],
            ["SDT-werkbeleving", "2.0 x", "Breed signaal voor autonomie, competentie en verbondenheid in de werksituatie."],
            ["Psychologische veiligheid & cultuurmatch", "1.5 x", "Veiligheid, fit en cultuur beïnvloeden of signalen bespreekbaar worden en of mensen willen blijven."],
            ["Groeiperspectief", "1.5 x", "Ontwikkelruimte en perspectief keren vaak terug in vrijwillig vertrek."],
            ["Beloning & voorwaarden", "1.0 x", "Beloning werkt vaak als drempel- of fairnessfactor, niet altijd als enige verklaring."],
            ["Werkbelasting", "1.0 x", "Werkdruk werkt vaak als versterkende contextfactor."],
            ["Rolhelderheid", "1.0 x", "Onduidelijkheid in prioriteiten of verwachtingen kan vertrek versnellen."],
        ],
        "band_rows": [
            ["Band", "Score", "Betekenis voor de organisatie"],
            [MANAGEMENT_BAND_LABELS["LAAG"], "< 4.5", "Dit thema is nu niet leidend, maar blijft relevant om te volgen in het vertrekbeeld."],
            [MANAGEMENT_BAND_LABELS["MIDDEN"], "4.5-7.0", "Dit thema vraagt eerst verificatie voordat management het zwaarder maakt in route of interventie."],
            [MANAGEMENT_BAND_LABELS["HOOG"], ">= 7.0", "Dit thema moet nu bestuurlijk als eerste worden gewogen, zonder automatisch een harde conclusie te bewijzen."],
        ],
        "trust_rows": [
            ["Wat dit product wel is", TRUST_CONTRACT["what_it_is"]],
            ["Niet voor bedoeld", TRUST_CONTRACT["what_it_is_not"]],
            ["Hoe je de output leest", TRUST_CONTRACT["how_to_read"]],
            ["Privacy & rapportage", TRUST_CONTRACT["privacy_boundary"]],
            ["Bewijsstatus nu", TRUST_CONTRACT["evidence_status"]],
        ],
    }


def get_signal_page_payload(*, retention_signal_profile: str | None = None) -> dict[str, Any]:
    return {
        "title": "Vertrekbeeld, redenen & signalen van werkfrictie",
        "intro": (
            "Deze pagina combineert hoofdredenen, meespelende factoren, eerdere signalering en een indicatieve duiding van werkinvloed. "
            "De uitkomsten helpen om vertrekpatronen te verkennen en managementvragen te richten, niet om één causale vertrekverklaring vast te stellen."
        ),
        "summary_title": "Vertrekbeeld in samenhang",
        "signal_profile_title": "Hoe lees je dit vertrekbeeld?",
        "signal_profile_text": (
            "Lees hoofdredenen, meespelende factoren, eerdere signalering en signalen van werkfrictie als een managementverhaal. "
            "De hoofdreden geeft het eerste vertrekhaakje; de werkfactoren en signalen van werkfrictie laten zien waar vervolgvragen bestuurlijk het meeste opleveren."
        ),
    }


def get_hypotheses_payload() -> dict[str, str]:
    return {
        "section_title": "Werkhypothesen",
        "intro_text": (
            "Onderstaande hypothesen zijn afgeleid van scorepatronen, vertrekredenen, meespelende factoren en eerdere signalering. "
            "Ze zijn bedoeld om vertrekduiding te toetsen in gesprek met HR, leidinggevenden of aanvullende data, niet om achteraf één sluitende oorzaak vast te stellen."
        ),
    }


def get_next_steps_payload(*, top_focus_labels: list[str], top_focus_keys: list[str]) -> dict[str, Any]:
    focus_text = " en ".join(top_focus_labels) if top_focus_labels else "de scherpste werkfactoren"
    lead_factor_key = top_focus_keys[0] if top_focus_keys else None
    first_decision = (
        EXIT_DECISION_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or (
        f"Kies eerst of {focus_text.lower()} vooral een lokaal managementspoor of een breder organisatievraagstuk vormen."
    )
    first_owner = (
        EXIT_OWNER_BY_FACTOR.get(lead_factor_key)
        if lead_factor_key
        else None
    ) or "HR business partner met betrokken leidinggevende"
    first_action = (
        f"Vertaal {focus_text.lower()} binnen 30 dagen naar één gerichte verbeteractie met duidelijke eigenaar "
        "en zichtbare opvolging."
    )
    review_moment = _exit_review_moment_text(focus_text)
    return {
        "section_title": "Vervolgstappen",
        "intro_text": (
            "Gebruik ExitScan niet alleen als terugblik, maar als managementinstrument om het vertrekbeeld te toetsen, te prioriteren en te vertalen naar zichtbare verbeteracties."
        ),
        "session_title": "Eerste managementsessie na oplevering",
        "session_intro": (
            "Gebruik deze route om de eerste managementsessie compact en besluitgericht te houden: kies eerst het prioriteitsspoor "
            "en maak daarna expliciet wie trekt, wat de eerste stap is en wanneer je terugkijkt."
        ),
        "first_decision": first_decision,
        "first_owner": first_owner,
        "first_action": first_action,
        "review_moment": review_moment,
        "session_cards": [
            {
                "title": "Prioriteit nu",
                "body": f"{focus_text} vormen nu het eerste vertrekspoor om bestuurlijk te wegen.",
            },
            {
                "title": "Eerste eigenaar",
                "body": first_owner,
            },
            {
                "title": "Eerste stap",
                "body": first_action,
            },
            {
                "title": "Reviewmoment",
                "body": review_moment,
            },
        ],
        "session_watchout_title": "Leesgrens bij de eerste managementsessie",
        "session_watchout": (
            "Gebruik deze sessie om prioriteit, gesprek en actie te kiezen, niet om achteraf de ene oorzaak van vertrek te bewijzen."
        ),
        "steps": [
            {
                "number": "1",
                "title": "Kies binnen 2 weken het eerste managementspoor",
                "body": (
                    f"Deel de managementsamenvatting met MT en betrokken leidinggevenden en maak expliciet welk besluit nu eerst telt: {first_decision}"
                ),
            },
            {
                "number": "2",
                "title": "Beleg direct een eerste eigenaar",
                "body": (
                    f"Bepaal in de managementbespreking wie eerste eigenaar wordt van {focus_text.lower()}. "
                    "Zonder eigenaar blijft vertrekduiding een constatering in plaats van een verbeterroute."
                ),
            },
            {
                "number": "3",
                "title": "Vertaal de duiding naar maximaal 3 gerichte acties",
                "body": (
                    "Kies alleen acties die logisch voortkomen uit de getoetste hypothesen en de scherpste werkfactoren. "
                    "Vermijd brede programma's voordat duidelijk is waar het patroon echt zit."
                ),
            },
            {
                "number": "4",
                "title": "Leg een evaluatiemoment vast binnen 90 dagen",
                "body": (
                    review_moment
                ),
            },
        ],
    }
