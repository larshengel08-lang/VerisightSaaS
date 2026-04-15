# Verisight Customer Journey Funnel Acceptance Checklist

Repo-referentie voor de tranche `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN`.
Laatste update: 2026-04-15

## Doel

Gebruik deze checklist om te controleren of website, contactflow, intake-overdracht en eerste waarde nog steeds als een logische funnel samenwerken.

## Acceptance checks

### Routekeuze

- Home stuurt standaard naar een route-aware kennismaking met ExitScan als default eerste context.
- Productpagina ExitScan opent contact met `route_interest = exitscan`.
- Productpagina RetentieScan opent contact met `route_interest = retentiescan`.
- Productpagina Combinatie opent contact met `route_interest = combinatie`.
- Productoverzicht en pricing houden de combinatie secundair en ExitScan als default eerste route.

### CTA-consistentie

- `Plan kennismaking` blijft de primaire CTA.
- CTA's dragen `cta_source` mee zodat herkomst van de lead zichtbaar blijft.
- Geen publieke CTA suggereert self-serve checkout, kalenderbooking of directe tooltoegang.
- `Aanpak` blijft de buyer-facing handofflaag voor wat er na het gesprek gebeurt.

### Contacthandoff

- Contactformulier vraagt om routekeuze, gewenste timing en managementvraag.
- Frontend API normaliseert `route_interest`, `cta_source` en `desired_timing` voordat de lead wordt doorgestuurd.
- Backend slaat dezelfde velden op in `contact_requests`.
- Interne notificatiemail toont route, timing en CTA-bron.
- Beheerlijst toont route, timing en CTA-bron naast notificatiestatus.

### Intakeverwachting

- De successtate van het formulier noemt reactie binnen 1 werkdag.
- De successtate maakt duidelijk dat eerst route, intake en databasis worden getoetst.
- De successtate maakt duidelijk dat er nog geen live inrichting of definitieve offerte zonder intake volgt.
- Pricing en aanpak benoemen dat een baseline of vervolgvorm pas na route- en databasischeck wordt bevestigd.

### First-value verwachting

- Buyer-facing copy benoemt dat eerste signalen zichtbaar worden na de eerste responses.
- Buyer-facing copy benoemt dat detailweergave pas bruikbaar wordt vanaf ongeveer 5 responses.
- Buyer-facing copy benoemt dat een steviger patroonbeeld pas ontstaat vanaf ongeveer 10 responses.
- Geen pagina claimt directe inzichten zonder responsbasis.

### Productonderscheid

- ExitScan blijft de default eerste wedge.
- RetentieScan blijft complementair en verification-first.
- Combinatie blijft een bewuste portfolioroute en geen standaard eerste pitch.
- Salesdocs volgen dezelfde defaults in proposal spines en decision tree.

## Handmatige walkthroughs

- ExitScan-first buyer: home -> ExitScan -> contact -> lead zichtbaar met `route_interest = exitscan`.
- RetentieScan-first buyer: productpagina -> contact -> lead zichtbaar met `route_interest = retentiescan`.
- Combinatie-buyer: combinatiepagina -> contact -> sales volgt op met gefaseerde routecheck.
- Lage respons: dashboard blijft terughoudend en verkoopt geen te hard patroonbeeld.
- Eerste rapport beschikbaar: rapport, dashboard en pre-sale copy voelen als dezelfde managementleeslijn.

## V1 funnel metrics

Deze tranche gebruikt vooral interne funnelwaarheid in plaats van een zware analytics-stack.

- `route-page to contact start`: afgeleid uit CTA-bron en formulierstarts tijdens handmatige QA of toekomstige lichte eventlogging.
- `contact submit`: aantal records in `contact_requests`.
- `lead with route context`: aandeel contactrequests met gevulde `route_interest`, `cta_source` en `desired_timing`.
- `lead to active campaign`: handmatige of operationele vergelijking tussen contactrequests en later aangemaakte campaigns.
- `active campaign to first report`: tijd tussen campaign-creatie en eerste rapportdownload of rapportbeschikbaarheid.
