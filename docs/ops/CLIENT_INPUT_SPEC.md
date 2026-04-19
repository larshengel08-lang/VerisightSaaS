# Client Input Spec

Last updated: 2026-04-16
Status: active

## Purpose

Dit document beschrijft in gewone taal welke data een klant minimaal en idealiter aanlevert om een ExitScan- of RetentieScan-campagne voorspelbaar te starten.

Gebruik dit document voor:

- onboarding
- offerte- en kickoffsituaties
- import QA
- voorbereiding van respondenttemplates

## Minimum required

Minimaal nodig:

- organisatienaam
- campagnenaam
- bevestiging van scanroute:
  - ExitScan
  - RetentieScan

Daarnaast geldt:

- `email` is verplicht als Verisight uitnodigingen verstuurt
- als de klant zelf met anonieme survey-links distribueert, moet het gewenste aantal links expliciet zijn afgestemd

## Supported respondent fields

De huidige productlogica ondersteunt deze velden:

- `email`
- `department`
- `role_level`
- `annual_salary_eur`
- `exit_month`

## Required versus optional

### Always required in invited flows

- `email`

### Strongly recommended

- `department`
- `role_level`

### Optional

- `annual_salary_eur`

### Route-specific

- ExitScan Baseline:
  - `exit_month` sterk aanbevolen en in praktijk de standaard voor retrospectieve batches
- ExitScan ritmeroute:
  - `exit_month` mag mee als referentie, maar is minder cruciaal
- RetentieScan:
  - `annual_salary_eur` optioneel
  - geen extra verplicht veld boven de basisset

## Recommended file format

- elke respondent op een eigen rij
- gebruik exact deze kolomnamen waar mogelijk:
  - `email`
  - `department`
  - `role_level`
  - `annual_salary_eur`
  - `exit_month`
- laat optionele velden leeg als ze niet beschikbaar zijn
- geen extra tabbladen
- geen samengevoegde cellen
- `.xlsx` of `.csv`

## Role level mapping

Gebruik bij voorkeur deze vaste waarden:

- `uitvoerend`
- `specialist`
- `senior`
- `manager`
- `director`
- `c_level`

Als een klant andere termen gebruikt:

- mapt Verisight die tijdens import of QA naar deze waardelijst
- zonder nette mapping verliest segmentvergelijking waarde

## Scan period and campaign expectation

Maak vooraf altijd expliciet:

- of de scan als ritmeroute vanaf start loopt
- of bewust als baseline wordt opgezet

Belangrijke default:

- een campaign meet standaard live vanaf het moment dat uitnodigingen worden verstuurd
- een retrospectief 12-maandsbeeld ontstaat alleen als dat expliciet zo is ingericht

## Deep dive guardrail

`segment_deep_dive` is alleen logisch wanneer:

- `department` en `role_level` redelijk gevuld zijn
- segmentatie inhoudelijk zinvol is
- aantallen voldoende zijn voor veilige duiding

Bij onvoldoende metadata:

- deep dive terugschalen
- of klant expliciet laten aanvullen

## QA rule

Verisight verstuurt geen uitnodigingen voordat:

- het bestand is gecontroleerd
- verplichte kolommen kloppen
- preview logisch oogt
- eventuele mappingvragen zijn opgelost
