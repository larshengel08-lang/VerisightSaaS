# Client Onboarding Playbook

Last updated: 2026-04-17
Status: active

## Purpose

Dit document beschrijft de canonieke assisted onboarding- en adoptionroute van Verisight van akkoord naar eerste bruikbare managementwaarde.

Belangrijke defaults:

- ExitScan blijft de primaire eerste route.
- RetentieScan blijft complementair en verification-first.
- Verisight beheert setup, importcontrole, invite-activatie en dashboardtoegang.
- De klant levert input aan en gebruikt daarna dashboard en rapport.
- Activatie telt pas als bevestigd wanneer klanttoegang live is, de Verisight delivery owner vastligt en first management use voorlopig is ingepland.
- Adoptie is pas geslaagd wanneer de klant de output echt gebruikt voor het eerste managementgesprek.
- Follow-up is pas gesloten wanneer eerste eigenaar, eerste actie, reviewmoment en vervolgstatus expliciet zijn vastgelegd.
- Vroege learnings worden voortaan vastgelegd in `/beheer/klantlearnings`.
- Een campaign meet standaard live vanaf campagnestart; een retrospectieve baseline of 12-maandsbeeld moet expliciet zo worden ingericht.
- Voor actieve klanttrajecten is de app-deliverylaag leidend; workbooks zijn alleen samenvatting of governance-mirror.

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
- scanperiode expliciet vastgelegd:
  - ritmeroute vanaf start
  - of bewust als baseline opgezet
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

Aanvullende praktische regels:

- klant levert bij voorkeur `.xlsx` of `.csv`
- gebruik waar mogelijk exact deze kolomnamen:
  - `email`
  - `department`
  - `role_level`
  - `annual_salary_eur`
  - `exit_month`
- geen extra tabbladen of samengevoegde cellen
- bij klantdistributie via anonieme links moet het gewenste aantal links expliciet zijn afgestemd

Voor vaste aanleverspecificatie:

- zie ook [CLIENT_INPUT_SPEC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_INPUT_SPEC.md)

Nuance:

- `segment_deep_dive` vraagt extra datadiscipline.
- Zonder nette metadata verliest segmentverdieping snel waarde.
- `role_level` moet idealiter naar een vaste waardelijst kunnen worden gemapt:
  - `uitvoerend`
  - `specialist`
  - `senior`
  - `manager`
  - `director`
  - `c_level`

### 5. Klantactivatie

- Eigenaar: Verisight
- Type: klantmoment
- Doel: klantaccount activeren, de gebruiker in het juiste dashboard laten landen en first management use voorlopig inplannen

### 6. Eerste dashboardread

- Eigenaar: klant
- Type: klantmoment
- Doel: begrijpen wat al leesbaar is, wat nog indicatief is, welke managementvraag eerst telt en of de managementsessie direct kan worden gehouden

### 7. Rapportuitleg

- Eigenaar: Verisight
- Type: gedeeld
- Doel: dashboard en rapport in dezelfde managementleeslijn gebruiken

### 8. Eerste managementgesprek

- Eigenaar: klant
- Type: gedeeld
- Doel: eerste eigenaar, eerste vraag, eerste vervolgstap en reviewmoment expliciet maken

## Operating cadence

Gebruik voor alle actieve trajecten ook [CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md).

Samengevat:

- activatie is pas bevestigd als eigenaar, toegang en first management use-slot helder zijn
- first management use gebeurt in dezelfde of eerstvolgende managementweek zodra output veilig leesbaar is
- reviewmoment wordt direct in het eerste managementgesprek vastgelegd
- follow-up blijft open totdat vervolgrichting en learning handoff zijn bijgewerkt

## Verplichte learning handoff

Leg bij elk vroeg traject minimaal deze checkpoints vast in `/beheer/klantlearnings`:

- lead en routehypothese
- implementation intake
- launch en eerste output
- eerste managementgebruik
- 30-90 dagen review

Gebruik daarvoor `docs/ops/PILOT_LEARNING_PLAYBOOK.md` en `docs/ops/PILOT_LEARNING_TEMPLATES.md`.

## Productvarianten

### ExitScan Baseline

- Primaire eerste route
- Meestal retrospectieve batch op ex-medewerkers
- Logisch startpunt voor vertrekduiding en nulmeting
- `exit_month` hoort hier praktisch bij de standaard metadata

### ExitScan ritmeroute

- Vervolgroute na baseline
- Alleen logisch zodra proces, volume en eigenaarschap staan
- Geen concurrerend eerste pakket
- Geen standaard hoofdroute in eerste gesprekken

### RetentieScan Baseline

- Complementaire eerste baseline
- Gericht op actieve medewerkers en groepsduiding
- Privacy-first, geen individuele signalen naar management

### RetentieScan ritmeroute

- Vervolgroute na baseline
- Gericht op trendduiding, herhaalmeting en opvolging

## Setup reality

Verisight doet in V1 zelf:

- organisatie aanmaken
- campaign aanmaken
- scanroute en add-ons bevestigen
- import QA en mapping
- uitnodigingen versturen
- dashboardtoegang uitsturen

De klant hoeft in V1 niet zelf:

- organisaties aan te maken
- campaigns te configureren
- importstructuren of validatieregels te begrijpen

Deze managed route blijft bewust de standaard totdat self-service economisch en operationeel logisch is.

## Fix-program operating rule

Voor wave 1 van het schaalbaarheids-fix-programma geldt:

- elke actieve campaign heeft in de app een actuele lifecycle stage
- elke actieve campaign heeft een expliciete owner, next step en exception-status
- deliveryrisk wordt wekelijks beoordeeld naast de CEO-scorecard
- `Clients` in `CEO_WEEKLY_SCORECARD.xlsx` is alleen de weekmirror van de app-laag

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
- een eerste eigenaar, eerste vervolgstap en reviewmoment expliciet zijn gemaakt

## Repo-afhankelijkheden

- Het eerder genoemde externe `.docx` onboardingbestand ontbreekt lokaal.
- De actuele operationele referenties zitten in de nabije `.md`- en `.xlsx`-bronnen in `Docs_External/05_Operations_En_CRM`.
- Voor implementation hardening en workflow-aanscherping volgt daarna `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`.
