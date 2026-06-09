# ExitScan Report Copy Review Diff

Doel: trust- en disclaimertekst centraler en rustiger maken zonder die nu automatisch in `backend/products/exit/report_content.py` door te voeren.

Status:
- structuurfixes zijn uitvoerbaar en staan los van deze tekstvoorstellen
- onderstaande voorstellen zijn **niet** toegepast
- gebruik dit document als human-review gate voor een latere copy-pass

## 1. `get_management_summary_payload()` — `executive_intro`

**Origineel**

```text
ExitScan maakt het vertrekbeeld bestuurlijk leesbaar: {top_reason_text} is nu het eerste vertrekhaakje, terwijl {top_factor_text} laten zien waar management het meeste kan toetsen en verbeteren.

De antwoorden wijzen daarbij relatief breed op beïnvloedbare werkfrictie, wat het rapport vooral bruikbaar maakt voor prioritering, eigenaarschap en een gericht managementgesprek.
```

of, in de lichtere variant:

```text
Gebruik dit rapport daarom als vertrekduiding en verificatiespoor, niet als sluitende oorzaakverklaring.
```

**Voorgesteld**

```text
ExitScan maakt het huidige vertrekbeeld bestuurlijk leesbaar: {top_reason_text} is nu het eerste vertrekhaakje, terwijl {top_factor_text} laten zien waar management het eerst moet toetsen en kiezen.

Gebruik deze samenvatting om prioriteit, eigenaarschap en het eerste managementgesprek te richten. De methodische leesgrenzen staan gebundeld in de leeswijzer verderop in het rapport.
```

**Waarom**
- haalt de boundary uit de openingsparagraaf zonder hem te verliezen
- stuurt sneller naar bestuurlijke keuze
- verwijst grenzen door naar de leeswijzer in plaats van ze hier opnieuw uit te spellen

## 2. `get_management_summary_payload()` — `trust_note`

**Origineel**

```text
Lees ExitScan als managementsamenvatting van vertrekpatronen. Het rapport bundelt signalen, werkfactoren en hypotheses tot een bestuurlijk gesprek, zonder causaliteit, diagnose of harde voorspellingen te claimen. De uitkomst is indicatief, gegroepeerd en bedoeld voor prioritering en verificatie. Detailweergave start pas vanaf 5 responses, patroonanalyse pas vanaf 10 en segmenten verschijnen alleen bij voldoende n. ExitScan is methodisch verdedigbaar, maar niet extern gevalideerd als diagnostisch instrument.
```

**Voorgesteld**

```text
Lees ExitScan als gegroepeerde managementsamenvatting van vertrekpatronen. Het rapport helpt prioriteren, toetsen en het eerste managementgesprek richten. Privacygrenzen, minimale n en methodische claimsgrenzen blijven gelden en zijn verderop compact uitgewerkt in de leeswijzer.
```

**Waarom**
- behoudt trust en privacy
- stopt met de volledige grensenset al op deze pagina uit te schrijven
- maakt de samenvatting rustiger en deelbaarder

## 3. `get_management_summary_payload()` — `boardroom_watchout`

**Origineel**

```text
Lees dit niet als bewijs van de ene oorzaak van vertrek en ook niet als garantie dat een interventie het patroon oplost. ExitScan helpt sneller wegen waar management moet toetsen en kiezen, niet om achteraf absolute zekerheid te claimen.
```

**Voorgesteld**

```text
Gebruik deze handoff niet om één sluitende vertrekoorzaak vast te zetten. Gebruik hem om te bepalen welk managementspoor nu eerst verificatie en opvolging vraagt.
```

**Waarom**
- korter
- minder defensief
- sterker gericht op bestuurlijke actie

## 4. `get_methodology_payload()` — `intro_text`

**Origineel**

```text
Dit rapport vertaalt exitdata naar vertrekduiding die bestuurlijk leesbaar is. De methodiek is compact en nadrukkelijk geen volledig diagnostisch instrument; de uitkomst is bedoeld voor prioritering, gesprek en opvolging. De labels hieronder zijn managementtaal bovenop ongewijzigde interne scorebanden.
```

**Voorgesteld**

```text
Dit rapport vertaalt exitdata naar compacte vertrekduiding voor prioritering, gesprek en opvolging. De methodiek is pragmatisch en gegroepeerd: bedoeld voor managementlezing, niet voor individuele beoordeling of diagnostische zekerheid. De labels hieronder zijn managementtaal bovenop ongewijzigde interne scorebanden.
```

**Waarom**
- maakt deze pagina de primaire plek voor claimsgrenzen
- sluit beter aan op de gekozen rol van P10 als centrale trustlaag

## 5. `get_hypotheses_payload()` — `intro_text`

**Origineel**

```text
Onderstaande hypothesen zijn afgeleid van scorepatronen, vertrekredenen, meespelende factoren en eerdere signalering. Ze zijn bedoeld om vertrekduiding te toetsen in gesprek met HR, leidinggevenden of aanvullende data, niet om achteraf één sluitende oorzaak vast te stellen.
```

**Voorgesteld**

```text
Onderstaande hypothesen vertalen het vertrekbeeld naar toetsbare managementvragen. Gebruik ze om in gesprek, aanvullende data of gerichte opvolging te bepalen welk spoor het eerst bevestiging of bijstelling vraagt.
```

**Waarom**
- houdt de niet-causale grens impliciet in stand
- leest minder als disclaimer, meer als werkinstructie

## 6. `get_next_steps_payload()` — `session_watchout`

**Origineel**

```text
Gebruik deze sessie om prioriteit, gesprek en actie te kiezen, niet om achteraf de ene oorzaak van vertrek te bewijzen.
```

**Voorgesteld**

```text
Gebruik deze sessie om prioriteit, eigenaar en eerste stap vast te zetten. Vermijd dat het gesprek verzandt in terugredeneren naar één definitieve vertrekoorzaak.
```

**Waarom**
- blijft streng op leesgrens
- sluit beter aan op de structuur van P9
- maakt het risico concreter: analyseverlamming in plaats van alleen ‘niet bewijzen’
