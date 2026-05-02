# Action Center Pilot Ops Runbook

## Doel
Dit runbook is de bounded supportlaag voor pilotgebruik van Action Center.
Het is bedoeld voor Verisight-operators die moeten controleren of de kernflow nog geloofwaardig werkt zonder eerst in losse tabellen of browserworkarounds te verdwalen.

## Dagelijkse health check
Controleer in `Beheer -> Health review` minimaal:
- `Action Center pilot-ops`
- `Kritieke flow coverage`
- laatste Action Center evidence timestamp

Voor een gezonde pilotset wil je minimaal evidence kunnen teruglezen voor:
- `Route geopend`
- `Manager toegewezen`
- `Review gepland`

`Closeout vastgelegd` mag nog nul zijn in een jonge pilot, maar moet later zichtbaar kunnen worden.

## Als HR meldt dat opvolging niet lijkt te landen
Controleer in deze volgorde:
1. bestaat er recente `Route geopend` evidence
2. bestaat er recente `Manager toegewezen` evidence
3. bestaat er een `Review gepland` event
4. is de route in Action Center zichtbaar met de juiste owner en lineagecontext

Als stap 1 of 2 ontbreekt:
- controleer de route-open of follow-up write-path
- controleer governance-role truth op de laatste write

Als stap 3 ontbreekt:
- controleer of de managerhandeling of reviewplanning daadwerkelijk is opgeslagen

## Als manager aangeeft dat een route “verdwenen” is
Controleer:
1. `?focus=` navigatie of directe routefocus
2. of de route gesloten, heropend of opgevolgd is
3. of lineage alleen context geeft en niet per ongeluk de actuele route overschrijft
4. of recente telemetry nog nieuw Action Center gebruik laat zien

## Recovery-lijn
Gebruik bij twijfel deze bounded herstelvolgorde:
1. health review
2. pilot seed opnieuw draaien in testomgeving
3. kritieke route-API tests draaien
4. browserflow opnieuw controleren
5. pas daarna live data of schema-issues onderzoeken

## Niet doen
- niet meteen aannemen dat ontbrekende telemetry hetzelfde is als ontbrekende route-truth
- niet direct productsemantiek aanpassen voor een operationeel incident
- niet meerdere handmatige follow-up writes uitvoeren om een ontbrekende route te “forceren”
