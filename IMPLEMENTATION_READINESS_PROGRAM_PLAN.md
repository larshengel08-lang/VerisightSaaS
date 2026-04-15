# IMPLEMENTATION_READINESS_PROGRAM_PLAN

## 1. Summary

Dit plan is uitgevoerd vanuit de huidige admin-assisted Verisight-flow:
- Verisight zet organisatie, campaign, respondentimport, uitnodigingen en klanttoegang op
- ExitScan Baseline is de standaard eerste route
- RetentieScan gebruikt dezelfde operationele basis met extra metadata-discipline
- live/ritme blijft een bewuste vervolgroute, niet de standaard eerste setup

In deze tranche zijn de high-impact blockers en readiness-gaten als eerste aangepakt:
- `delivery_mode` bestaat nu expliciet in backend-schema's, frontend-types, campaign setup en campaign-weergave
- campaign setup, respondentimport en klantactivatie gebruiken nu dezelfde readiness-taal
- launch- en acceptance-checks zijn uitgebreid van losse signalen naar een vaste checkliststructuur
- interne en klantgerichte handover-assets zijn toegevoegd aan de repo
- de backend-flow heeft extra smoke- en contracttests gekregen voor implementation readiness

Wat bewust praktisch en proportioneel is gehouden:
- geen grote backend-herarchitectuur
- geen self-service onboarding
- geen async invite queue
- geen nieuwe campaign lifecycle-statussen buiten de bestaande active/archive-structuur

---

## 2. Milestones

### Milestone 0 - Freeze Current Implementation Baseline
Dependency: none

#### Tasks
- [x] Leg de huidige implementation flow vast zoals die nu echt bestaat tussen beheer, import, invites, dashboard en rapport.
- [x] Maak expliciet onderscheid tussen wat al structureel in product zit en wat nu nog op impliciete operator-kennis leunt.
- [x] Documenteer de huidige standaardroute:
  - ExitScan Baseline eerst
  - RetentieScan waar relevant
  - Live als secundaire route
- [x] Leg vast waar `delivery_mode`, checklisting en acceptatie nu al bestaan of juist nog ontbreken.

#### Definition of done
- [x] Er is één controleerbaar baselinebeeld van de huidige implementation chain.
- [x] De grootste fricties en handmatige afhankelijkheden zijn expliciet benoemd.
- [x] Het vervolgplan start vanuit repo-observaties en bestaande documentatie.

#### Validation
- [x] Baseline is herleidbaar naar beheerflow, import/invite-routes, campaign detail en tests.
- [x] ExitScan-first en RetentieScan-complementair zijn operationeel scherp genoeg afgebakend.

---

### Milestone 1 - Define The Canonical Manual-First Operating Model
Dependency: Milestone 0

#### Tasks
- [x] Maak van de huidige admin-assisted flow één expliciet operating model.
- [x] Leg vaste rollen vast:
  - Verisight admin
  - interne operator/beheerder
  - klantgebruiker viewer/member
- [x] Bepaal het standaard implementatiepad vanaf klantakkoord tot eerste bruikbare output.
- [x] Maak duidelijk waar klantcommunicatie start, welke contactmomenten vast zijn en wanneer klanttoegang logisch wordt geactiveerd.

#### Definition of done
- [x] De implementatieflow is niet langer impliciete teamkennis.
- [x] Rollen en overdrachtsmomenten zijn expliciet en uitvoerbaar.
- [x] Er is één standaardroute die later in UI, docs en checks gespiegeld kan worden.

#### Validation
- [x] Een nieuwe operator kan de flow stap voor stap volgen zonder mondelinge uitleg.
- [x] Er is geen onduidelijkheid meer over wanneer een campagne “klaar voor livegang” is.

---

### Milestone 2 - Harden Campaign Setup And Configuration Defaults
Dependency: Milestone 1

#### Tasks
- [x] Maak campaign setup consistenter voor productkeuze, campagnenaam, modules/add-ons en `delivery_mode`.
- [x] Trek `delivery_mode` strak tussen database, schema’s, types, forms en campaign-read model.
- [x] Definieer standaard defaults:
  - ExitScan Baseline als default
  - RetentieScan Baseline met extra metadata-waarschuwing
  - Live alleen als bewuste afwijking
- [x] Voeg setup-waarschuwingen toe waar operatoren nu te makkelijk onvolledige of verwarrende campagnes kunnen aanmaken.

#### Definition of done
- [x] Campaign setup heeft één consistent contract en één standaardroute.
- [x] `delivery_mode` is geen doc/test-only concept meer.
- [x] Product- en setupdefaults verlagen operatorfrictie en foutkans.

#### Validation
- [x] Een nieuwe campaign kan niet meer “half gedefinieerd” aanvoelen.
- [x] ExitScan en RetentieScan volgen dezelfde setupstructuur zonder productverwarring.

---

### Milestone 3 - Make Respondent Import Operationally Safe
Dependency: Milestone 2

#### Tasks
- [x] Maak respondentimport leidend als gecontroleerde stap, niet als losse uploadactie.
- [x] Veranker de preview/dry-run flow als expliciete kwaliteitsstap vóór definitieve import.
- [x] Maak ontbrekende of zwakke metadata zichtbaarder als implementatierisico.
- [x] Leg vast wanneer direct uitnodigen wel of niet de standaard is.
- [x] Voeg operationele checks toe voor duplicaten, ontbrekende e-mails, ontbrekende segmentmetadata en onbruikbare imports voor rapport of dashboard.

#### Definition of done
- [x] Import heeft een expliciete kwaliteitsdrempel vóór live versturen.
- [x] Operators zien sneller of een bestand bruikbaar is voor de gekozen campaign.
- [x] Importuitkomsten zijn bruikbaar voor checklisting en livegangbeslissingen.

#### Validation
- [x] Een foutief bestand strandt vroeg en uitlegbaar.
- [x] Een goed bestand kan zonder improvisatie door naar invitefase.

---

### Milestone 4 - Standardize Invite, Activation And Customer Communication
Dependency: Milestone 3

#### Tasks
- [x] Trek de inviteflow strak tussen respondentuitnodigingen en klantdashboardtoegang.
- [x] Maak vaste operatorbeslissingen expliciet:
  - wanneer respondentinvites direct uit mogen
  - wanneer klanttoegang pas later geactiveerd wordt
  - wanneer resend logisch is
- [x] Definieer standaard klantcontactmomenten:
  - bevestiging na setup
  - import gereed / uitnodigingen uit
  - livegang bevestigd
  - dashboardtoegang geactiveerd
- [x] Maak fout- en wachttijdscenario’s expliciet voor activatielinks, resend-cooldown en gemiste uitnodigingen.

#### Definition of done
- [x] Invite- en activatielogica zijn operationeel helderder en minder ad hoc.
- [x] Klantcommunicatie volgt vaste triggerpunten.
- [x] Interne support weet wanneer welk bericht of welke vervolgstap hoort.

#### Validation
- [x] Een operator kan exact uitleggen wat er gebeurt na import en na klantinvite.
- [x] Klantverwachtingen rond toegang, activatie en timing zijn voorspelbaar.

---

### Milestone 5 - Build A Launch And Acceptance System
Dependency: Milestone 4

#### Tasks
- [x] Maak van de bestaande preflight-signalen één echte launch checklist.
- [x] Voeg acceptatiechecks toe voor campaignconfiguratie, importkwaliteit, invite-status, surveybereikbaarheid, dashboardstats, PDF-rapport en klanttoegang.
- [x] Maak expliciet onderscheid tussen:
  - setup compleet
  - uitnodigingen live
  - eerste output bruikbaar
  - klantacceptatie rond
- [ ] Borg wanneer een campagne actief mag blijven, gepauzeerd moet worden of intern eerst herstel nodig heeft.
  Niet uitgevoerd in deze tranche; de bestaande active/archive-structuur is bewust niet uitgebreid.

#### Definition of done
- [x] Livegang is een controleerbaar moment in plaats van een informele inschatting.
- [x] Acceptatie is zowel technisch als operationeel gedefinieerd.
- [x] Dashboard/preflight ondersteunt echte operatorbeslissingen.

#### Validation
- [x] Een campagne kan objectief als klaar/niet-klaar worden beoordeeld.
- [x] Productkwaliteit strandt niet meer op een stroeve implementatie.

---

### Milestone 6 - Add End-To-End QA And Smoke Protection
Dependency: Milestone 5

#### Tasks
- [x] Breid testbescherming uit van losse API-cases naar echte implementation paths.
- [x] Voeg minimaal één end-to-end smoke flow toe voor admin setup, import, respondentsubmit, dashboardstats en PDF.
- [x] Maak negatieve tests expliciet voor de meest risicovolle implementation failures.
- [x] Veranker de live hardening smoke test als vaste acceptatiestap vóór echte klantlivegang.

#### Definition of done
- [x] De belangrijkste implementation chain is regressiebestendig.
- [x] QA dekt niet alleen survey/product, maar ook operationele livegang.
- [x] Handmatige smoke tests en geautomatiseerde checks versterken elkaar.

#### Validation
- [x] Kritieke flows falen niet stilletjes na wijzigingen.
- [x] De eerste-klantflow is toetsbaar van beheer tot rapport.

---

### Milestone 7 - Capture Internal Checklists And Handover Assets
Dependency: Milestone 6

#### Tasks
- [x] Maak één interne implementation checklist voor operators.
- [x] Maak één klantgerichte onboarding/checkliststructuur voor wat de klant moet aanleveren of verwachten.
- [x] Leg standaard templates vast voor:
  - import-aanlevering
  - livegangbevestiging
  - toegang/activatie
  - eerste opvolgmoment
- [x] Zorg dat docs, UI-waarschuwingen en QA dezelfde volgorde en taal gebruiken.

#### Definition of done
- [x] De implementation flow is overdraagbaar en herhaalbaar.
- [x] Interne en externe communicatie lopen in dezelfde volgorde.
- [x] De operationele laag is niet langer afhankelijk van losse herinnering of improvisatie.

#### Validation
- [x] Een tweede operator kan een traject draaien met dezelfde kwaliteit.
- [x] Klanten krijgen een consistenter verloop van setup tot eerste inzichten.

---

## 3. Execution Breakdown By Subsystem

### Operating Model
- [x] Eén canonieke implementation route vastgelegd vanaf klantakkoord.
- [x] Rollen, verantwoordelijkheden en overdrachtsmomenten expliciet gemaakt.
- [x] ExitScan Baseline als default implementatiepad verankerd.

### Campaign Setup
- [x] `delivery_mode` end-to-end consistent gemaakt.
- [x] Defaults voor ExitScan, RetentieScan en Live expliciet gemaakt.
- [x] Setup-waarschuwingen toegevoegd voor risicovolle configuraties.

### Respondent Import
- [x] Preview/dry-run als kwaliteitsstap behandeld.
- [x] Metadata-volledigheid expliciet meegenomen in readiness.
- [x] Importuitkomsten gekoppeld aan checklist- en livegangbeslissingen.

### Invites And Client Access
- [x] Respondentinvites en klantactivatie als twee aparte operationele sporen zichtbaar gemaakt.
- [x] Cooldown/resend/foutscenario’s explicieter afgevangen in UI en docs.
- [x] Vaste klantcommunicatiemomenten gedefinieerd.

### Launch Control
- [x] Bestaande preflight-signalen omgezet naar echte acceptatielogica.
- [x] Setup, survey, dashboard, PDF en klanttoegang onder één launchcheck gebracht.
- [x] Klaar/niet-klaar-status objectiever gemaakt.

### QA And Testing
- [x] Negatieve implementation tests behouden en uitgebreid.
- [x] End-to-end smoke flow toegevoegd voor de hele keten.
- [x] Live hardening checklist als release-/livegangcontrole geborgd in docs en tests.

### Documentation And Handover
- [x] Interne operatorchecklist toegevoegd.
- [x] Klantchecklist en contactmomenten gestandaardiseerd.
- [x] Taal tussen docs, UI en supportmomenten geharmoniseerd.

---

## 4. Current Product Risks

### Operationele risico's
- [x] Verminderd: de flow leunt minder op impliciete operatorkennis.
- [x] Verminderd: campaign setup heeft nu een explicieter readiness-contract.
- [x] Verminderd: `delivery_mode` leeft niet meer alleen in docs/tests.

### Onboardingrisico's
- [x] Verminderd: de standaardroute vanaf klantakkoord tot livegang is explicieter vastgelegd.
- [ ] Resterend: klantverwachtingen kunnen nog steeds per traject verschillen als message templates niet consequent gebruikt worden.
- [x] Verminderd: RetentieScan metadata-discipline is explicieter zichtbaar gemaakt in de setupflow.

### Livegangrisico's
- [x] Verminderd: livegang hangt minder af van losse checks door de nieuwe readiness- en checklistlaag.
- [x] Verminderd: kritieke flows hebben nu extra end-to-end bescherming.
- [ ] Resterend: invite-, activatie- en rapportpaden zijn nog niet als volledige frontend E2E-flow geautomatiseerd.

### Afhankelijkheid van handmatige kennis of handwerk
- [x] Verminderd: de admin-assisted aanpak is nu beter geformaliseerd.
- [x] Verminderd: operatorbeslissingen zijn vaker zichtbaar gemaakt in UI of docs.
- [ ] Resterend: klantcommunicatie wordt nog handmatig verstuurd, niet productgedreven.

### Risico dat goede productbouw strandt in stroeve implementatie
- [x] Verminderd: setup, import en activatie voelen minder los van dashboard/rapport.
- [x] Verminderd: outputkwaliteit is sterker gekoppeld aan setup- en acceptance-checks.
- [ ] Resterend: campagne lifecycle blijft beperkt tot active/archive en kent nog geen aparte herstel- of pauzestatus.

---

## 5. Open Questions

- [ ] Moet klanttoegang standaard pas ná eerste respons/rapportcheck worden geactiveerd, of al direct na setup?
- [ ] Willen we op termijn een expliciete “implementation owner” rol naast algemene Verisight-admins?
- [ ] Moet `live` later een apart operationeel pad met eigen checklist worden, of voorlopig alleen een afwijkende variant van baseline?
- [ ] Willen we klantcommunicatie later ook deels vanuit het product laten triggeren in plaats van handmatig uitsturen?

---

## 6. Follow-up Ideas

- [ ] Voeg later async queueing toe voor bulk invites nadat manual-first readiness stabiel is.
- [ ] Overweeg later een expliciete implementation timeline-widget in het dashboard.
- [ ] Voeg later een klantinname-template toe voor aanleverbestanden en minimale metadata-eisen.
- [ ] Overweeg later een aparte “eerste 7 dagen na livegang”-supportcheck.
- [ ] Voeg later meetpunten toe voor operationele doorlooptijd en failure-rate per implementatiestap.

---

## 7. Out of Scope For Now

- [x] Self-service onboarding voor klanten.
- [x] Grote herbouw van auth of tenancy buiten wat implementation readiness direct raakt.
- [x] Volledige schaalarchitectuur voor bulk inviteverwerking in de eerste tranche.
- [x] Nieuwe commerciële proposities of productpositionering buiten wat nodig is voor heldere implementatie.
- [x] Grote backend-modularisatie buiten readiness-kritieke aanpassingen.
- [x] Nieuwe productfamilies of uitbreiding buiten ExitScan/RetentieScan.

---

## 8. Defaults Chosen

- [x] Scope start vanaf klantakkoord, niet bij pre-sales of brede sales enablement.
- [x] Prioriteit is manual-first hardening, niet scale-first automatisering.
- [x] ExitScan Baseline is de primaire standaardroute voor implementation readiness.
- [x] RetentieScan blijft complementair en volgt dezelfde operationele basis, met extra nadruk op metadata en validatie.
- [x] `delivery_mode` gebruikt `baseline` als default; `live` is een bewuste tweede route.
- [x] Verisight blijft voorlopig een begeleide dienst met software, niet een self-service implementatieproduct.
- [x] Launch readiness wordt gedefinieerd op ketenniveau:
  - setup
  - import
  - invites
  - survey
  - dashboard
  - PDF
  - klanttoegang
- [x] Async invites, extra automatisering en verdere ops-schaalbaarheid komen na het verharden van de huidige eerste-klantflow.
