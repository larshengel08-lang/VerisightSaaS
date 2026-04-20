# Dashboard Home Decision Launcher

Deze homepage is bewust geen per-campagne managementdashboard en ook geen generieke cockpit. De rol van deze laag is:

- eerst de juiste campagne laten kiezen
- daarna pas portfolio-overzicht geven
- support, route-uitleg en beheer secundair houden

## Beslisvolgorde

De pagina is opgebouwd in drie lagen:

1. `recommendation`
2. `portfolio`
3. `support`

De eerste schermlaag toont altijd eerst:

- de aanbevolen volgende campagne
- waarom die campagne nu relevant is
- de primaire volgende actie
- de secundaire actie wanneer die logisch beschikbaar is
- compacte portfoliostatus als context, niet als hoofdverhaal

## Recommendation logic

De homepage kiest altijd een aanbevolen campagne.

Prioriteit:

1. `Nu openen`
2. `Gesloten / rapport beschikbaar`
3. `Nog in opbouw`
4. `Archief`

Binnen een groep wordt geprioriteerd op:

- sterkste leesniveau
- hoogste respons
- hoogste aantallen ingevulde responses
- daarna pas recency en signaal als tie-breaker

Hiermee wordt de homepage een rustige campagnekeuze in plaats van een vlakke campagnelijst.

## Grouping logic

Campagnes worden in vier deterministische groepen gezet:

- `Nu openen`
  Alleen actieve campagnes met genoeg respons voor een stevigere managementread.
- `Nog in opbouw`
  Actieve campagnes die nog respons of livegang moeten opbouwen.
- `Gesloten / rapport beschikbaar`
  De meest recente gesloten campagne per producttype, bedoeld voor vervolg en rapportgebruik.
- `Archief`
  Oudere gesloten campagnes die beschikbaar blijven zonder te concurreren met de huidige campagnekeuze.

Deze grouping maakt direct zichtbaar welke campagnes nu aandacht vragen en welke vooral naslag zijn.

## Dashboard versus rapport

De homepage maakt het actiekeuzeverschil expliciet:

- Dashboard = interactieve lezing, prioritering en eerste vervolg
- Rapport (PDF) = delen, bespreken en bestuurlijke samenvatting

Rapport (PDF) wordt alleen als echte actie aangeboden wanneer de campagne en het product daar logisch klaar voor zijn. Als rapport nog niet logisch of ondersteund is, toont de homepage een expliciete reden in plaats van een dode knop.

Dashboard wordt ook expliciet verborgen of gedowngraded wanneer een campagne nog niet live genoeg is om zinvol te openen.

## Wat bewust lager is gezet

De volgende zaken zijn expres lager in de hierarchie geplaatst:

- leeshulp
- rapportgebruik-uitleg
- supportverwachting
- beheer- en operationele taken

Deze content blijft beschikbaar via secundaire blocks en disclosures, maar concurreert niet meer met de hoofdvraag: welke campagne open je nu?

## Visuele hierarchie

De polishlaag maakt deze visuele regels expliciet:

- de recommendation block blijft de duidelijk dominante eerste beslissing
- campagnekaarten zijn bewust compacter en tonen alleen de kern voor kiezen, niet alle uitleg
- `Gesloten / rapport beschikbaar` blijft actiegericht leesbaar
- `Archief` blijft zichtbaar, maar voelt bewust lager in urgentie en visueel rustiger
- dashboard versus rapport blijft expliciet, maar in compactere copy en lichtere leeshulpen

## Taalpariteit

De homepage gebruikt bewust kortere interfacecopy dan het rapport, maar leunt in deze baseline wel op dezelfde taalrichting:

- `rapport` waar een deelbaar document wordt bedoeld
- `dashboard` waar interactieve lezing wordt bedoeld
- `campagne` in plaats van systeemtaal als `launcher`
- bestuurlijke en managementgerichte formuleringen boven generieke producttaal
