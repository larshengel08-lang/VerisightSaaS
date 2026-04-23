# Controlled Launch Communications Design

## Goal

Klanten gecontroleerde launch-, communicatie- en remindercontrole geven zonder vrije survey-operatie, methodedrift of template leakage te openen.

## Context

- De bestaande suite-canon en embedded productdefinities blijven leidend.
- ExitScan en RetentieScan blijven kernroutes.
- Onboarding blijft bounded peer.
- Leadership en Pulse blijven bounded support.
- Guided self-serve bestaat al als bounded execution-laag voor klantgebruik.
- Delivery governance bestaat al als canonieke ops-truth voor launch readiness, activation, first value en follow-up.

## Problem

De huidige klantflow laat wel import, expliciete invite-start en reminders toe, maar nog geen gecontroleerde pre-launch communicatiecontrole. Daardoor zit er een gat tussen:

1. delivery-governance aan Verisight-zijde
2. bounded customer execution in de UI
3. expliciete launchdiscipline rond startdatum, communicatiepreview en reminderinstellingen

Dat gat maakt twee risico's zichtbaar:

- klanten kunnen niet gecontroleerd afstemmen op hun interne communicatiebehoefte
- als we te veel vrijheid geven, kunnen ze templatewaarheid, producttaal of survey-integriteit beschadigen

## Design Decision

We voegen een bounded `launch communication configuration` toe als onderdeel van de bestaande campaign delivery-spine.

Deze configuratie:

- hangt aan de campaign delivery context, niet aan marketingcontent of losse vrije e-mails
- ondersteunt alleen veilige template-aanpasbaarheid
- blijft product- en routebewust
- wordt gebruikt voor preview, launch gating en reminder gating
- opent geen vrije e-mailbuilder

## User-Facing Scope

De klant krijgt in de bestaande guided self-serve flow:

1. een formele startdatum
2. een pre-launch overzicht
3. een preview van deelnemerscommunicatie
4. beperkte template-aanpassing binnen guardrails
5. reminderconfiguratie binnen veilige grenzen
6. een expliciete launchbevestiging

De klant krijgt niet:

- vrije onderwerpregels
- vrije e-mailbody-editors
- vrije remindercadans
- vrije methodetaal of productherpositionering
- controle over surveylogica, thresholds of outputgating

## Data Model

We breiden `campaign_delivery_records` uit met bounded launch-communicatievelden:

- `launch_date`
- `launch_confirmed_at`
- `participant_comms_config` als JSON
- `reminder_config` als JSON

Waarom hier:

- deze data hoort bij delivery governance en launchdiscipline
- de campaign blijft de fulfillment unit, maar delivery record is de juiste plek voor expliciete launch-operatie
- bestaande lifecycle- en warninglogica kan de velden direct meenemen

## Communication Model

De communicatie wordt niet als vrije tekst opgeslagen, maar als een kleine set veilige overrides die op canonieke templates worden toegepast.

Veilige override-velden:

- `sender_name`
- `reply_to_email`
- `intro_context`
- `closing_context`

Beperkingen:

- lengte beperkt
- geen HTML
- geen nieuwe productclaims
- geen methodische of surveytechnische instructies die templateblokken vervangen
- geen vrije onderwerpregels in deze wave

De preview rendert altijd:

1. canonieke basisstructuur
2. route- en delivery-modebewuste kerncopy
3. veilige klantcontext op beperkte invoegpunten
4. expliciete Verisight-framing van uitvoering en verantwoordelijkheid

## Reminder Model

Reminderconfiguratie blijft bounded en preset-based.

Veilige instellingen:

- reminders aan of uit
- eerste reminder delay via beperkte preset
- maximaal aantal reminders via beperkte preset

Niet toegestaan:

- vrije frequentie
- vrije reminderdatums
- vrije remindercopy

De runtime behoudt bestaande pending/remindable logica. De nieuwe configuratie bepaalt alleen welke reminderactie als launch-klaar en klant-bevestigd mag gelden.

## Launch Gating

Launch kan pas worden bevestigd of gestart als:

- er respondenten klaarstaan
- importpreview foutvrij is doorlopen
- `launch_date` gezet is
- communicatieconfiguratie valide is
- reminderconfiguratie valide is
- de klant expliciet bevestigt dat timing en communicatie kloppen

Extra guardrail:

- `startInvites()` en eventuele directe invite-launch vanuit import mogen niet meer door als de launch-config onvolledig is

## UI Integration

De nieuwe controls landen in `GuidedSelfServePanel`, niet in een aparte builder.

Nieuwe blokken:

1. `Pre-launch overzicht`
2. `Deelnemerscommunicatie`
3. `Reminderinstellingen`
4. `Launchbevestiging`

De panelen blijven functioneel en compact. Ze gebruiken de bestaande dashboard-primitives en guided self-serve tone of voice.

## Governance Integration

De delivery governance neemt nieuwe launch-control blockers op in:

- launch readiness samenvatting
- discipline warnings
- preflight checklist

Voorbeelden van blockers:

- startdatum ontbreekt
- communicatiepreview niet bevestigd
- reminderinstelling ontbreekt
- launchbevestiging ontbreekt

Hiermee blijven admin-ops en klant-execution dezelfde waarheid lezen.

## Testing Strategy

Unit:

- nieuwe config-validatie
- preview rendering
- launch gating
- reminder preset-validatie
- readiness/disciplinesamenvattingen

Integration:

- serverroute weigert onveilige of incomplete launch-config
- invite-start faalt zonder expliciete launch confirmation

E2E:

- guided self-serve flow toont pre-launch overzicht
- klant zet startdatum
- klant ziet preview
- klant past veilige velden aan
- klant bevestigt launch
- invites starten pas daarna
- reminderactie respecteert bounded config

## Risks And Mitigations

Risk: template leakage tussen producten  
Mitigatie: routebewuste template-helpers met canonieke basis per scan type

Risk: te veel klantvrijheid  
Mitigatie: alleen preset- en field-level overrides, geen vrije editor

Risk: governance en customer flow lopen uit elkaar  
Mitigatie: opslag en validatie in delivery record, niet in los UI-state

Risk: launch lijkt methodisch zwaarder dan het product kan dragen  
Mitigatie: previewcopy blijft operationeel en bescheiden; geen nieuwe managementclaims

## Out Of Scope

- vrije e-mailbuilder
- losse operator-campaign designer
- route-nieuwe communicatieclaims
- custom remindertekst per klant
- nieuwe lifecycle-states buiten bestaande delivery grammar
- automation-first survey orchestration

## Expected Outcome

De klant kan voortaan gecontroleerd launchen, de communicatie vooraf zien en binnen veilige grenzen afstemmen, terwijl Verisight de methodische en operationele waarheid van de surveyflow blijft bewaken.
