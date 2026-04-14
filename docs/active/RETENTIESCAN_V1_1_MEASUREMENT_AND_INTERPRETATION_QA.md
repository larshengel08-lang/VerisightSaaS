# RETENTIESCAN_V1_1_MEASUREMENT_AND_INTERPRETATION_QA

## Purpose

Dit document koppelt de huidige RetentieScan-survey en afgeleide metrics aan hun bedoelde outputlaag. Gebruik dit als vaste referentie voor dashboard-, rapport- en handmatige interpretatie-QA.

## Survey To Output Map

| Blok | Huidige inhoud | Hoofdrol | Hoofdoutput | Niet voor bedoeld |
|---|---|---|---|---|
| SDT | 12 items | Kernlaag van werkbeleving | retentiesignaal, methodologie, SDT-duiding | individuele diagnose |
| Organisatiefactoren | 6 factoren x 3 items | beinvloedbare werkcontext zichtbaar maken | topfactoren, playbooks, focusvragen | causale bewijsvoering |
| UWES-3 | 3 items | aanvullende energie-/bevlogenheidslaag | dashboard samenvatting, trend, signal profile | volledige engagementdiagnose |
| Turnover intention | 2 items | expliciet vertrekdenken op groepsniveau zichtbaar maken | dashboard, rapport, signal profile | individuele vertrekvoorspelling |
| Stay-intent | 1 item | expliciete bereidheid om te blijven zichtbaar maken | dashboard, rapport, trend | harde loyaliteitsclaim |
| Open behoudsvraag | 1 vraag | richting geven voor verificatie en actie | open-signaalclustering, hypothesen, managementduiding | losse klachtenlijst of persoonsfeedback |

## Derived Metrics

| Metric | Betekenis in v1.1 | Huidige status | Interpretatiegrens |
|---|---|---|---|
| `retention_signal_score` | gelijkgewogen samenvatting van SDT en organisatiefactoren | v1-werkmodel | groepssignaal, geen predictor |
| `engagement_score` | genormaliseerde UWES-3 score | aanvullende behoudssignaal | samen lezen met retentiesignaal |
| `turnover_intention_score` | genormaliseerde vertrekintentiescore | aanvullende behoudssignaal | geen individuele vertrekclaim |
| `stay_intent_score_norm` | genormaliseerde stay-intent score | aanvullende behoudssignaal | geen bewijs van blijfkans |
| `signal_profile` | samenvattende leeslens over combinatie van signalen | v1-heuristiek | alleen gebruiken voor verificatie en prioritering |

## Current Thresholds

- Minder dan 5 responses:
  - geen veilige detailweergave
  - geen rijke analyse tonen
- 5 tot en met 9 responses:
  - indicatief beeld
  - gebruiken voor voorlopige vervolgvragen
- Vanaf 10 responses:
  - patroonanalyse en rijkere managementduiding toegestaan
- Segmentweergave:
  - minimaal 5 responses per groep
  - alleen tonen bij relevante afwijking ten opzichte van organisatieniveau

## Dashboard Interpretation Boundaries

### Beslisoverzicht

- Mag gelezen worden als samenvattend groepsbeeld.
- Mag niet gelezen worden als hard bewijs voor oorzaken of individuele risico's.

### Managementduiding

- Mag gelezen worden als prioriterings- en verificatiehulp.
- Mag niet gelezen worden als sluitende diagnose.

### Trend

- Mag gelezen worden als richting ten opzichte van vorige meting.
- Mag niet gelezen worden als bewijs dat een interventie al causaal werkte.

### Action Playbooks

- Mag gelezen worden als eerste handelingskader.
- Mag niet gelezen worden als empirisch bewezen interventieselectie.

### Segment Playbooks

- Mag gelezen worden als beschrijvende verfijning bij voldoende n.
- Mag niet gelezen worden als bewijs dat een segment structureel problematisch is.

### Open-Signaalclustering

- Mag gelezen worden als richting voor verificatie en gesprek.
- Mag niet gelezen worden als representatieve of complete klachtencatalogus.

## Report Interpretation Boundaries

### Management Summary

- Doel: snel groepsbeeld en bestuurlijke prioriteiten
- Niet: wetenschappelijk besluitdocument

### Signaalprofiel

- Doel: leeshulp voor de combinatie van metrics
- Niet: classificatiesysteem met voorspellende status

### Hypothesen

- Doel: gerichte verificatievragen
- Niet: gevalideerde verklaringen

### Behoudsplaybooks

- Doel: praktische eerste actieroute
- Niet: bewezen interventievolgorde

### Segment Deep Dive

- Doel: beschrijvende contrastlaag
- Niet: harde segmentdiagnose

## Report Parts That Need Extra Evidence Or Cautious Wording

- Signaalprofiel:
  - behouden als leeshulp
  - niet framen als classificatiemodel met voorspellende status
- Trend sinds vorige meting:
  - behouden als richtinggevende vergelijking
  - niet framen als bewijs dat een interventie al werkte
- Behoudsplaybooks:
  - behouden als eerste actieroute
  - niet framen als outcome-geijkte interventies
- Segment deep dive:
  - behouden als beschrijvende contrastlaag
  - niet framen als harde segmentdiagnose
- Open-antwoordthema's:
  - behouden als verificatiehulp
  - niet framen als representatieve of uitputtende verklaring

## Manual QA Checklist

Gebruik deze checklist voor elke belangrijke RetentieScan-review van dashboard of rapport:

- [ ] Leest de output op groeps- en segmentniveau, niet op persoonsniveau?
- [ ] Wordt het retentiesignaal uitgelegd als v1-werkmodel en niet als predictor?
- [ ] Zijn bevlogenheid, stay-intent en vertrekintentie zichtbaar als aanvullende signalen en niet als sluitend bewijs?
- [ ] Staat ergens impliciet of expliciet causaliteit die de huidige data niet dragen?
- [ ] Worden signal profiles, playbooks en open-signalen gepresenteerd als verificatiehulp?
- [ ] Zijn segmenten alleen zichtbaar bij voldoende n en duidelijke beschrijvende relevantie?
- [ ] Zijn trenduitspraken terughoudend genoeg geformuleerd?
- [ ] Gebruiken dashboard en rapport dezelfde betekenis voor dezelfde term?

## Current Review Outcome

Op basis van de huidige repo is de hoofdconclusie:

- survey -> scoring -> dashboard -> rapport sluit inhoudelijk al goed op elkaar aan
- de grootste resterende risico's zitten niet in ontbrekende productlagen, maar in te ambitieuze lezing van bestaande output
- daarom blijft interpretatie-QA in v1.1 net zo belangrijk als statistische validatie
