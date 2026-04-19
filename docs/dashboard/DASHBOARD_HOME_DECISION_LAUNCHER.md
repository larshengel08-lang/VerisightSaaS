# Dashboard Home Decision Launcher

Deze homepage is bewust geen per-campaign managementdashboard en ook geen generieke cockpit. De rol van deze laag is:

- eerst de juiste campaign laten kiezen
- daarna pas portfolio-overzicht geven
- support, route-uitleg en beheer secundair houden

## Beslisvolgorde

De pagina is opgebouwd in drie lagen:

1. `recommendation`
2. `portfolio`
3. `support`

De eerste schermlaag toont altijd eerst:

- de aanbevolen volgende campaign
- waarom die campaign nu relevant is
- de primaire volgende actie
- de secundaire actie wanneer die logisch beschikbaar is
- compacte portfoliostatus als context, niet als hoofdverhaal

## Recommendation logic

De homepage kiest altijd een aanbevolen campaign.

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

Hiermee wordt de homepage een decision-first launcher in plaats van een vlakke campaignlijst.

## Grouping logic

Campaigns worden in vier deterministische groepen gezet:

- `Nu openen`
  Alleen actieve campaigns met genoeg respons voor een stevigere managementread.
- `Nog in opbouw`
  Actieve campaigns die nog respons of livegang moeten opbouwen.
- `Gesloten / rapport beschikbaar`
  De meest recente gesloten campaign per producttype, bedoeld voor follow-up en rapportgebruik.
- `Archief`
  Oudere gesloten campaigns die beschikbaar blijven zonder te concurreren met de huidige campaignkeuze.

Deze grouping maakt direct zichtbaar welke campaigns nu aandacht vragen en welke vooral naslag zijn.

## Dashboard versus PDF

De homepage maakt het actiekeuzeverschil expliciet:

- Dashboard = interactieve lezing, prioritering en follow-up
- PDF = delen, bespreken, boardroom-ready samenvatting en follow-updocument

PDF wordt alleen als echte actie aangeboden wanneer de campaign en het product daar logisch klaar voor zijn. Als PDF nog niet logisch of ondersteund is, toont de homepage een expliciete reden in plaats van een dode knop.

Dashboard wordt ook expliciet verborgen of gedowngraded wanneer een campaign nog niet live genoeg is om zinvol te openen.

## Wat bewust lager is gezet

De volgende zaken zijn expres lager in de hierarchie geplaatst:

- route-uitleg
- rapportgebruik-uitleg
- supportverwachting
- beheer- en operationele taken

Deze content blijft beschikbaar via secundaire blocks en disclosures, maar concurreert niet meer met de hoofdvraag: welke campaign open je nu?

## Visuele hierarchie

De polishlaag maakt deze visuele regels expliciet:

- de recommendation block blijft de duidelijk dominante eerste beslissing
- campaign cards zijn bewust compacter en tonen alleen de kern voor kiezen, niet alle uitleg
- `Gesloten / rapport beschikbaar` blijft actiegericht leesbaar
- `Archief` blijft zichtbaar, maar voelt bewust lager in urgentie en visueel rustiger
- dashboard versus PDF blijft expliciet, maar in compactere copy en lichtere keuzehulpen
