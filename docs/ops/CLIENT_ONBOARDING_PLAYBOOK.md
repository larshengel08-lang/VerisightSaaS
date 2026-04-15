# Client Onboarding Playbook

Last updated: 2026-04-15
Status: active

## Purpose

Dit document beschrijft de canonieke assisted onboarding- en adoptionroute van Verisight van akkoord naar eerste bruikbare managementwaarde.

Belangrijke defaults:

- ExitScan blijft de primaire eerste route.
- RetentieScan blijft complementair en verification-first.
- Verisight beheert setup, importcontrole, invite-activatie en dashboardtoegang.
- De klant levert input aan en gebruikt daarna dashboard en rapport.
- Adoptie is pas geslaagd wanneer de klant de output echt gebruikt voor het eerste managementgesprek.

## Canonieke route

### 1. Route en intake

- Eigenaar: Verisight
- Type: buyer-facing
- Doel: bevestigen welke route nu eerst telt, welke timing gewenst is en wie de sponsor of contactpersoon wordt

### 2. Implementation intake

- Eigenaar: Verisight
- Type: handoff
- Doel: scanmodus, doelgroep, scanperiode, metadata en eerste managementdoel expliciet maken

Verplichte intake-inputs:

- gekozen route
- gewenste timing
- scanmodus
- doelgroep
- benodigde metadata
- contactpersoon
- eerste managementdoel

### 3. Campaign setup

- Eigenaar: Verisight
- Type: intern
- Doel: organisatie en campaign correct aanmaken

### 4. Respondentimport en uitnodigingen

- Eigenaar: Verisight
- Type: intern
- Doel: klantbestand controleren, previewen, corrigeren en pas daarna definitief importeren

Canonieke klantaanlevering:

- Verplicht: `email`
- Sterk aanbevolen: `department`, `role_level`
- ExitScan extra: `exit_month`, `annual_salary_eur`
- RetentieScan extra: `annual_salary_eur`

Nuance:

- `segment_deep_dive` vraagt extra datadiscipline.
- Zonder nette metadata verliest segmentverdieping snel waarde.

### 5. Klantactivatie

- Eigenaar: Verisight
- Type: klantmoment
- Doel: klantaccount activeren en de gebruiker in het juiste dashboard laten landen

### 6. Eerste dashboardread

- Eigenaar: klant
- Type: klantmoment
- Doel: begrijpen wat al leesbaar is, wat nog indicatief is en wat de eerstvolgende managementvraag wordt

### 7. Rapportuitleg

- Eigenaar: Verisight
- Type: gedeeld
- Doel: dashboard en rapport in dezelfde managementleeslijn gebruiken

### 8. Eerste managementgesprek

- Eigenaar: klant
- Type: gedeeld
- Doel: eerste eigenaar, eerste vraag en eerste vervolgstap expliciet maken

## Productvarianten

### ExitScan Baseline

- Primaire eerste route
- Meestal retrospectieve batch op ex-medewerkers
- Logisch startpunt voor vertrekduiding en nulmeting

### ExitScan Live

- Vervolgroute na baseline
- Alleen logisch zodra proces, volume en eigenaarschap staan
- Geen concurrerend eerste pakket

### RetentieScan Baseline

- Complementaire eerste baseline
- Gericht op actieve medewerkers en groepsduiding
- Privacy-first, geen individuele signalen naar management

### RetentieScan ritme

- Vervolgroute na baseline
- Gericht op trendduiding, herhaalmeting en opvolging

## First-value drempels

- 0-4 responses: nog geen veilige detailweergave
- 5-9 responses: indicatief beeld
- 10+ responses: steviger patroonbeeld voor eerste managementduiding

Dashboard en rapport zijn vanaf een bruikbare responsbasis het eerste managementinstrument. Zonder voldoende respons blijft uitleg bewust terughoudend.

## Verisight versus klant

### Verisight doet

- route en implementation intake structureren
- organisatie en campaign opzetten
- import previewen en corrigeren
- uitnodigingen en reminders aansturen
- klantaccount activeren
- rapportuitleg en eerste leesroute begeleiden

### Klant doet

- context, timing en contactpersoon bevestigen
- respondentbestand aanleveren
- dashboard en rapport gebruiken voor het eerste managementgesprek
- prioriteiten, verificatievragen en vervolgstappen bepalen

## Adoptie geslaagd

Adoptie is pas geslaagd wanneer:

- de klant kan inloggen
- de juiste campaign zichtbaar is
- dashboard of rapport bruikbaar is binnen de juiste drempel
- een eerste managementread heeft plaatsgevonden
- een eerste eigenaar of vervolgstap expliciet is gemaakt

## Repo-afhankelijkheden

- Het eerder genoemde externe `.docx` onboardingbestand ontbreekt lokaal.
- De actuele operationele referenties zitten in de nabije `.md`- en `.xlsx`-bronnen in `Docs_External/05_Operations_En_CRM`.
- Voor implementation hardening en workflow-aanscherping volgt daarna `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`.
