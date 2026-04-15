# Pilot Learning Playbook

Last updated: 2026-04-15
Status: active

## Purpose

Dit document beschrijft hoe Verisight pilots en vroege klanttrajecten systematisch vastlegt als leerlus voor product, report, onboarding, sales en operations.

Belangrijke defaults:

- ExitScan blijft de primaire eerste route.
- RetentieScan blijft complementair en verification-first.
- De learninglaag is internal-only en admin-first.
- Manual-first is acceptabel, zolang de les persistente capture krijgt.
- Een lesson sluit pas wanneer repo-bestemming of bewuste afwijzing expliciet is.

## Canonieke workflow

### 1. Start vanuit lead of campaign

- Gebruik `/beheer/contact-aanvragen` voor nieuwe buyer-signalen.
- Gebruik `/beheer/klantlearnings` om direct een dossier te starten.
- Koppel een campaign zodra implementation, launch of managementgebruik al in de echte route zitten.

### 2. Leg de vaste dossierbasis vast

Minimaal invullen:

- route
- buyer-vraag
- verwachte eerste waarde
- koopreden
- trust- of koopfrictie
- implementationrisico

### 3. Doorloop de vijf vaste checkpoints

1. Lead en routehypothese
2. Implementation intake
3. Launch en eerste output
4. Eerste managementgebruik
5. 30-90 dagen review

Per checkpoint leg je vast:

- objective signals
- qualitative notes
- interpreted observation
- confirmed lesson
- status
- lesson strength
- destination areas

### 4. Gebruik triage expliciet

- `nieuw`: net vastgelegd, nog niet bevestigd
- `bevestigd`: patroon of les moet actief terug de repo in
- `geparkeerd`: relevant, maar nog niet aan de beurt
- `uitgevoerd`: les is verwerkt in repo, flow of bewuste werkwijze
- `verworpen`: observatie bleek geen bruikbare les

### 5. Dwing bestemming af

Elke confirmed lesson hoort minimaal één bestemming te krijgen:

- `product`
- `report`
- `onboarding`
- `sales`
- `operations`

### 6. Sluit pas als reflected

Een lesson is pas echt gesloten wanneer:

- repo-bestemming is aangepast, of
- expliciet is vastgelegd waarom de les bewust niet wordt doorvertaald

## Objective signal guidance

Gebruik bestaande repo-signalen eerst:

- `route_interest`
- `desired_timing`
- `cta_source`
- `delivery_mode`
- `total_invited`
- `total_completed`
- invite/open/complete-signalen
- first-value drempels
- klanttoegang of open invites

Pas daarna voeg je interpretatie toe.

## Governance

- Eerst plan en docs aanpassen
- Daarna data- of UI-contracten aanpassen
- Daarna tests draaien
- Daarna `PROMPT_CHECKLIST.xlsx` bijwerken
