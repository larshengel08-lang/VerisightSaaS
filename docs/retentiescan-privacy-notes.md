# RetentieScan Privacy Notes

## Doel

Deze notitie legt de minimale privacyafspraken vast voor RetentieScan v1.

## Kernafspraken

- RetentieScan is bedoeld voor groeps- en segmentinzichten
- managementoutput bevat geen individuele retention-scores
- managementoutput bevat geen individuele vertrekintentie
- kleine segmenten blijven onderdrukt
- uitkomsten zijn gespreksinput en geen besluitvormingsbasis op persoonsniveau

## Waarom dit strenger is dan ExitScan

- de doelgroep bestaat uit actieve medewerkers
- de interpretatierisico's zijn groter dan bij retrospectieve exitdata
- fout gebruik kan vertrouwen schaden en AVG-risico vergroten

## Toegestaan gebruik

- groepsduiding voor HR, MT en directie
- prioritering van beinvloedbare werkfactoren
- evaluatie van acties op groepsniveau
- segmentvergelijking vanaf voldoende n

## Niet-toegestaan gebruik

- individuele beoordeling
- performance management
- selectie voor interventies op persoonsniveau
- voorspellen wie waarschijnlijk vertrekt

## Minimale productafspraken

- retentiesignaal blijft een intern samenvattend signaal
- bevlogenheid en vertrekintentie worden alleen gemiddeld gepresenteerd
- open tekst wordt geanonimiseerd en alleen in groepsduiding gebruikt
- documentatie en salescopy blijven expliciet over deze grenzen

## Verdieping en gespreksrichting — doelbinding (2026-07-05)

Spec: `docs/superpowers/specs/2026-07-05-richtingsvraag-behoud-design.md` §8.

- **Doel:** groepsduiding ten behoeve van het managementgesprek. De oorzaak-
  verdieping en de gespreksrichting-vraag leveren uitsluitend input voor de
  gespreksagenda op groepsniveau.
- **Geen individuele opvolging:** antwoorden worden nooit gebruikt om
  individuele respondenten te identificeren, te benaderen of op te volgen.
- **Geen besluitvorming op persoonsniveau:** gespreksrichting-data (waaronder
  richtingen rond beloning en voorwaarden) vormt geen grondslag voor
  arbeidsrechtelijke of beloningsbesluiten jegens individuen.
- **Weergavegrenzen:** verdieping- en richtingdata worden in v1 uitsluitend
  op campagne-totaalniveau getoond (geen segmenten), met de bestaande
  n-drempels; "Anders"-teksten worden geanonimiseerd opgeslagen en komen
  nooit ongereviewd in een rapport.
