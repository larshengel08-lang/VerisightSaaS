# DASHBOARD_DECISION_SUPPORT_LIVE_VALIDATION_REPORT

Datum: 2026-04-14

## Samenvatting

De dashboard decision-supportrelease is gemerged naar `main` en gepusht naar `origin`. Publieke productie-routes reageren correct op `www.verisight.nl`, en de auth-gate voor `/dashboard` werkt zonder fout door naar `/login`.

Volledige inhoudelijke live-validatie van de dashboard campaign pages kon in deze werkomgeving nog niet worden afgerond, omdat daarvoor een ingelogde productie-sessie en concrete live ExitScan- en RetentieScan-campagnes nodig zijn.

## Git-status

- `origin/main` bevat de release
- releasebranch: `codex/dashboard-decision-support`
- `main` is fast-forward bijgewerkt vanaf de releasebranch

## Uitgevoerde productiechecks

### Publieke routes

- `https://www.verisight.nl/` → `200 OK`
- `https://www.verisight.nl/producten` → `200 OK`
- `https://www.verisight.nl/producten/exitscan` → `200 OK`
- `https://www.verisight.nl/producten/retentiescan` → `200 OK`
- `https://www.verisight.nl/producten/combinatie` → `200 OK`
- `https://www.verisight.nl/login` → `200 OK`

### Dashboard route

- `https://www.verisight.nl/dashboard` → eindigt unauthenticated op `https://www.verisight.nl/login`
- Geen publieke serverfout of kapotte redirect waargenomen

## Wat hiermee bevestigd is

- De publieke frontend is bereikbaar na push naar `main`
- De productpagina's voor ExitScan en RetentieScan blijven live bereikbaar
- De loginroute leeft
- De dashboardroute breekt niet voor unauthenticated verkeer

## Wat nog openstaat

- Visuele live-check van de aangescherpte management-first dashboardhero
- Visuele live-check van ExitScan decision-supportcopy
- Visuele live-check van RetentieScan decision-supportcopy
- Validatie van CTA-hiërarchie op echte campaign pages
- Validatie van PDF-rapportflow vanuit een ingelogde productiecampagne

## Blockers

- Geen ingelogde productie-sessie beschikbaar in deze terminalomgeving
- Geen concrete live campaign-links of campaign-ID's beschikbaar voor directe routevalidatie

## Aanbevolen laatste handmatige checks

1. Log in op productie.
2. Open een live ExitScan-campagne.
3. Controleer de bovenste managementlaag op productspecifieke samenvatting, primaire vraag en volgende stap.
4. Open een live RetentieScan-campagne.
5. Controleer daar dezelfde managementvolgorde en productscheiding.
6. Open het PDF-rapport vanaf beide campaign pages en controleer dat de CTA-hiërarchie logisch blijft.
