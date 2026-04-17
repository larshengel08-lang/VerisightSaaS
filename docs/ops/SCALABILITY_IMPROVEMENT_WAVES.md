# Scalability Improvement Waves

Last updated: 2026-04-17
Status: active

## Summary

Dit document vertaalt de review naar drie opeenvolgende verbeterwaves.

Leidende regel:

- eerst stabiliseren
- dan systemiseren
- pas daarna beperkte scale readiness

Geen van deze waves is bedoeld om Verisight nu al als volwaardige self-serve SaaS te organiseren.

## Wave 1 - Stabilize

Periode:

- dag 0-30

Doel:

- de grootste governance- en operationslekken dichten zodat de huidige founder-led route echt bestuurbaar wordt

Scope:

- live pipeline discipline
- wekelijkse scorecard in gebruik
- eerste maandreview uitvoeren
- deliveryboard of equivalent overzicht invoeren
- echte maxima invullen in de capacity map
- source-of-truth charter vastleggen
- hybride werklaag hard maken:
  - CRM primair voor leads
  - app primair voor delivery
  - scorecard als weekmirror

Expliciet niet doen:

- geen nieuwe automationlaag
- geen nieuw CRM-systeem
- geen nieuw billing- of websiteproject
- geen verbreding naar extra productfamilies

Proceswijzigingen:

- alle actieve leads krijgen een volgende actie en een deadline in de primaire pipeline
- alle actieve klanttrajecten krijgen checkpointstatus voor intake, import, activation, report delivery en first management use
- wekelijkse CEO review wordt hard ritme
- maandreview wordt aan het eind van wave 1 echt ingevuld

Tooling/data-wijzigingen:

- gebruik [CEO_WEEKLY_SCORECARD.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CEO_WEEKLY_SCORECARD.xlsx) als leidend weekinstrument
- gebruik [Verisight_CRM.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_CRM.xlsx) als enige live pipelinebron voor leads
- gebruik `/beheer` en `/campaigns/[id]` als primaire deliveryboard
- houd `Deals` en `Clients` in de scorecard alleen als weekmirror

Docs/source-of-truth-wijzigingen:

- maak een korte `source-of-truth charter` met updatevolgorde voor repo, workbook, CRM en external docs
- maak [SCALABILITY_FIX_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/SCALABILITY_FIX_PROGRAM_PLAN.md) de actieve tranchebron voor dit programma
- update [FOUNDER_CAPACITY_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/FOUNDER_CAPACITY_MAP.md) met echte maxima
- update [DECISION_LOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/DECISION_LOG.md) na de eerste maandreview

Acceptance criteria:

- scorecard is minimaal 3 weken achter elkaar ingevuld
- er is een actuele pipeline met echte volgende acties
- er is een actuele lijst van actieve klanttrajecten met checkpointstatus
- capacity map bevat ingevulde maxima
- source-of-truth charter is expliciet en gedeeld
- de weekreview gebruikt geen concurrerende tweede live waarheid voor leads of delivery

Owner:

- Founder

Reviewmoment:

- dag 30

## Wave 2 - Systemize

Periode:

- dag 30-60

Doel:

- ritmes, ownership en operationele stuurinformatie harder maken zodat overdraagbaarheid echt getest kan worden

Scope:

- role clarity
- delivery owner logic
- proof capture in het ritme verankeren
- defect-, queue- en cycle-time review
- eerste delegated run

Expliciet niet doen:

- geen brede automation
- geen toolbouw zonder vooraf gemeten handmatige pijn
- geen extra proceslagen die het ritme zwaarder maken dan nodig

Proceswijzigingen:

- definieer welk werk door founder moet gebeuren en wat door een operator kan
- voeg proof capture checkpoints toe aan proposal, livegang en first management use
- voer wekelijks een korte delivery risk review uit naast de scorecard
- test een gedelegeerde salesrun en een gedelegeerde deliveryrun

Tooling/data-wijzigingen:

- voeg een eenvoudige defectlog en queue-review toe
- verzamel rolling 30-day metrics voor:
  - gekwalificeerde gesprekken
  - proposals
  - dealdoorlooptijd
  - trajecten met risico
  - delivery defects
- werk workbook of bord bij zodat delegated use mogelijk is
- gebruik `SCALABILITY_REVIEW_WORKBOOK.xlsx` als gate-evidence laag, niet als dagelijkse operatie

Docs/source-of-truth-wijzigingen:

- leg ownerregels vast per route
- verscherp [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md) en [OPS_DELIVERY_FAILURE_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OPS_DELIVERY_FAILURE_MATRIX.md) alleen op punten die in wave 1 zijn vastgelopen
- documenteer delegated run-learnings

Acceptance criteria:

- een niet-founder heeft een sales- of deliveryslice succesvol uitgevoerd
- rolling metrics zijn beschikbaar voor 30 dagen
- proof capture gebeurt niet meer alleen achteraf
- terugkerende delivery defects zijn zichtbaar in een log

Owner:

- Founder + future operator

Reviewmoment:

- dag 60

## Wave 3 - Scale Readiness

Periode:

- dag 60-90

Doel:

- alleen die standaardisatie toevoegen die bewezen knelpunten verlaagt

Scope:

- lichte automation shortlist
- rolverdeling aanscherpen
- intake- en deliverycontrols standaardiseren
- dashboarding of workbookstructuur verbeteren waar dat direct tijd wint

Expliciet niet doen:

- geen Stripe-first of billingtraject
- geen self-serve onboarding push
- geen automation van onduidelijke of instabiele stappen

Proceswijzigingen:

- zet alleen gestandaardiseerde stappen om naar tooling of semi-automation
- herbevestig welke escalaties altijd founder-only blijven
- beslis of een vaste ops-owner logisch wordt

Tooling/data-wijzigingen:

- maak een automation shortlist met businesscase per kandidaat
- verbeter alleen tooling voor:
  - pipeline update friction
  - delivery checkpoint friction
  - proof capture friction

Docs/source-of-truth-wijzigingen:

- update CEO Growth System of capacity map alleen als de praktijk daarom vraagt
- documenteer welke stappen bewust manual-first blijven

Acceptance criteria:

- elke automationkandidaat heeft een vooraf gemeten pijnpunt
- delegated run laat geen grote kwaliteitsval meer zien
- 2x volume-simulatie levert concrete grenzen en mitigaties op

Owner:

- Founder + ops/product

Reviewmoment:

- dag 90

## Success signal after 90 days

Dit verbeterprogramma is geslaagd als:

- pipeline en delivery niet meer primair op geheugen draaien
- week- en maandritme aantoonbaar worden uitgevoerd
- founder dependency kleiner en explicieter is geworden
- er een rationele basis is om pas daarna automation te kiezen

## Assumptions and defaults

- `Stabilize` gaat voor `Systemize`.
- `Systemize` gaat voor `Automation`.
- Als wave 1 niet slaagt, start wave 2 niet.
