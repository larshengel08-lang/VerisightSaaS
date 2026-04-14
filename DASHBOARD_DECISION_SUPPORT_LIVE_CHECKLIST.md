# DASHBOARD_DECISION_SUPPORT_LIVE_CHECKLIST

## Doel

Deze checklist borgt de livegang van de dashboard decision-supportaanscherping voor Verisight, met focus op:

- ExitScan als primair managementdashboard
- RetentieScan als complementaire managementlaag
- management-first leesvolgorde op campaign pages
- scherpere CTA-hierarchie
- parity tussen dashboardtaal en productduiding

## Huidige status

- [x] Dashboardwijzigingen zijn lokaal gebouwd en getest
- [x] Dashboardwijzigingen staan op `codex/dashboard-decision-support`
- [x] Branch is gepusht naar GitHub
- [ ] `main` bevat deze wijziging nog niet
- [ ] Productie is nog niet functioneel gevalideerd

## Pre-Live Checks

- [x] `frontend` buildt succesvol
- [x] `frontend` lint succesvol
- [x] frontend unit tests slagen
- [x] relevante backend tests slagen
- [x] feature branch bevat alleen het dashboard decision-supportpakket
- [ ] merge naar `main` uitgevoerd
- [ ] productie-deploy afgerond op Vercel

## Merge And Deploy

1. [ ] Merge `codex/dashboard-decision-support` naar `main`
2. [ ] Push `main` naar `origin`
3. [ ] Wacht op automatische Vercel production deploy
4. [ ] Controleer dat de publieke frontend op productie bereikbaar blijft

## Live Validation

### 1. Dashboard Overview

- [ ] `/dashboard` opent zonder crash
- [ ] overzichtscopy stuurt duidelijker naar managementread in plaats van alleen operatie
- [ ] campaign kaarten voelen compacter en minder generiek

### 2. ExitScan Campaign Page

Gebruik een live ExitScan-campagne met voldoende responses.

- [ ] bovenste schermlaag leest management-first
- [ ] productspecifieke managementsamenvatting staat boven operationele acties
- [ ] primaire vraag staat expliciet en voelt vertrekgericht
- [ ] eerstvolgende stap stuurt op valideren, bespreken en 30-90 dagenactie
- [ ] summary cards tonen geen generieke retention-copy
- [ ] factor- en riskduiding leest als vertrekduiding, niet als generiek scoreoverzicht
- [ ] copy suggereert geen causale zekerheid

### 3. RetentieScan Campaign Page

Gebruik een live RetentieScan-campagne met voldoende responses.

- [ ] bovenste schermlaag leest management-first
- [ ] signaalprofiel en topfactoren staan logisch voor verificatie en actie
- [ ] primaire vraag voelt behoudsgericht en privacy-proof
- [ ] eerstvolgende stap verbindt verificatie aan 30-90 dagenactie
- [ ] bovenlaag blijft compacter dan de onderliggende trend- en verdiepingslagen
- [ ] RetentieScan leest zichtbaar anders dan ExitScan

### 4. CTA And Flow Validation

- [ ] `PDF-rapport` concurreert niet met de primaire managementactie
- [ ] operationele acties zitten niet meer in de primaire beslislaag
- [ ] disclosure-volgorde ondersteunt lezen in plaats van verbergen
- [ ] gebruiker hoeft minder zelf te puzzelen wat eerst relevant is

### 5. Regression Checks

- [ ] report download blijft werken
- [ ] campaign pagina blijft renderen voor beide producten
- [ ] shared dashboardcomponenten breken niet op kleine datasets
- [ ] productmodules geven de juiste copy terug voor ExitScan en RetentieScan

## Evidence To Capture

- [ ] screenshot van `/dashboard`
- [ ] screenshot van live ExitScan campaign hero
- [ ] screenshot van live RetentieScan campaign hero
- [ ] korte notitie per product: klopt de eerste managementread inhoudelijk?
- [ ] korte notitie: klopt CTA-hiërarchie inhoudelijk?

## Rollback

Gebruik alleen als productiegedrag afwijkt of managementduiding duidelijk regressie toont.

1. [ ] identificeer of issue frontend-only is
2. [ ] revert of hotfix op `main`
3. [ ] nieuwe Vercel deploy afwachten
4. [ ] kernroutes opnieuw controleren:
   `/dashboard`, ExitScan-campaign, RetentieScan-campaign

## Resultaatcriteria

De livegang is pas echt afgerond wanneer:

- [ ] `main` is bijgewerkt
- [ ] productie-deploy is afgerond
- [ ] ExitScan live management-first leest
- [ ] RetentieScan live management-first leest
- [ ] CTA-hiërarchie live logisch voelt
- [ ] geen regressies zichtbaar zijn op kernroutes
