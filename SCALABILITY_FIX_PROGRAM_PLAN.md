# Scalability Fix Program Plan

Last updated: 2026-04-17
Status: active

## Summary

Dit plan is de actieve source of truth voor het 90-dagen fix-programma dat Verisight bestuurbaar, zichtbaar en minder founder-fragiel moet maken zonder een nieuw breed programmamodel te starten.

Command window:

- dag 0-90
- dominante lijn: `Phase 1 - Revenue Proof Engine`
- parallelle stabilisatielaag: `Phase 2 - Delivery Stability Engine`

Leidende fix-volgorde:

1. commercial rhythm
2. governance execution
3. operational tooling visibility
4. founder dependency reduction

Werkmodel voor wave 1:

- `Verisight_CRM.xlsx` is de primaire live leadpipeline
- `/beheer`, `/beheer/contact-aanvragen`, `/beheer/klantlearnings` en `/campaigns/[id]` zijn de primaire delivery- en learninglaag
- `CEO_WEEKLY_SCORECARD.xlsx` is de wekelijkse governance- en reviewlaag
- `SCALABILITY_REVIEW_WORKBOOK.xlsx` is het gate- en evidencewerkboek

Dit programma doet in wave 1 expliciet nog niet:

- geen nieuw CRM-systeem
- geen nieuwe automationlaag
- geen billing- of self-serve-project
- geen nieuw breed website-, SEO- of contentprogramma
- geen nieuwe productfamilies buiten ExitScan en RetentieScan

## Operating interfaces

| Interface | Rol in het fix-programma | Harde regel |
| --- | --- | --- |
| `Docs_External/.../Verisight_CRM.xlsx` | Primaire live leadpipeline | Elke actieve lead heeft fase, route, owner, volgende actie en deadline. |
| `docs/ops/CEO_WEEKLY_SCORECARD.xlsx` | Wekelijkse governance- en reviewlaag | Samenvattend stuurinstrument; geen tweede live CRM of deliveryboard. |
| `/beheer` en `/campaigns/[id]` | Primaire delivery- en checkpointlaag | Elke actieve campaign heeft lifecycle, owner, next step en exception-status. |
| `/beheer/klantlearnings` | Primaire learning- en proof-capturelaag | Relevante lead- of campaignlessen worden daar vastgelegd zodra ze leer- of bewijswaarde hebben. |
| `docs/ops/MONTHLY_PHASE_REVIEW.md` | Maandelijkse gate review | Geen wave-overgang zonder ingevulde review en expliciete go/no-go. |
| `docs/ops/SCALABILITY_REVIEW_WORKBOOK.xlsx` | Evidenceregister voor wave-gates | Geen dagelijkse operatie; wel maandelijkse bewijslaag. |
| `docs/ops/SOURCE_OF_TRUTH_CHARTER.md` | Updatevolgorde en mirrorregels | Bij conflict wint altijd het primaire systeem. |

## Execution status on 2026-04-17

- [x] Het planbestand is geconsolideerd naar de repo-root als enige actieve fix-program source of truth.
- [x] Step 1.4 is structureel uitgevoerd: `FOUNDER_CAPACITY_MAP.md` bevat nu maxima, guardrails en escalatiedrempels.
- [x] Step 1.5 is structureel uitgevoerd: `SOURCE_OF_TRUTH_CHARTER.md` bestaat en gekoppelde repo-docs/workbooks zijn geharmoniseerd.
- [x] De structurele enablement voor Step 1.1, 1.2 en 1.3 is aangezet in CRM-, scorecard- en reviewartefacten.
- [ ] Step 1.1 is nog niet evidence-complete: twee opeenvolgende live CRM-weken met echte leadupdates zijn nog niet aantoonbaar vastgelegd.
- [ ] Step 1.2 is nog niet evidence-complete: drie volledige weekcycli in `CEO_WEEKLY_SCORECARD.xlsx` bestaan nog niet.
- [ ] Step 1.3 is nog niet evidence-complete: actuele app-deliverystatus per actieve campaign is nog niet vanuit echte runtime-load bewezen.
- [ ] Step 1.6 is nog niet uitgevoerd: de eerste echte maandreview met wave-1 go/no-go moet nog plaatsvinden.

## Milestones

### Milestone 1 - Wave 1 Stabilize
Dependency: none

Doel: bestaande commerciele, governance- en deliverylagen echt leidend maken.

#### Tasks
- [ ] Step 1.1 - Zet `Verisight_CRM.xlsx` live als enige actieve leadpipeline en houd de prospectlijst alleen als seed-list.
- [ ] Step 1.2 - Zet `CEO_WEEKLY_SCORECARD.xlsx` live als wekelijkse governance- en reviewlaag met echte `Deals`, `Clients` en `Priorities`.
- [ ] Step 1.3 - Maak de app-surfaces leidend voor actieve delivery via lifecycle, owner, exception-status en next step per campaign.
- [x] Step 1.4 - Vul `FOUNDER_CAPACITY_MAP.md` met expliciete maxima en escalatiedrempels voor gezonde founder-led load.
- [x] Step 1.5 - Leg de source-of-truth volgorde vast in `SOURCE_OF_TRUTH_CHARTER.md` en harmoniseer de gekoppelde docs.
- [ ] Step 1.6 - Voer de eerste echte maandreview uit en gebruik die als wave-1 gate.

#### Definition of done
- [ ] Pipeline draait niet meer op geheugen of losse notities.
- [ ] Weekritme is aantoonbaar in gebruik.
- [ ] Actieve delivery is centraal zichtbaar.
- [x] Founder-capaciteit heeft expliciete maxima.
- [x] Source-of-truth volgorde is hard gemaakt.

#### Validation
- [ ] `Commercial`, `Governance` en `Operational tooling` hebben aantoonbare live werklaag, niet alleen templates.
- [ ] Wave 2 start alleen als de maandreview bevestigt dat wave 1 ritmisch werkt.

### Step 1.1 - Commercial rhythm reset
Owner: Founder

Acceptance criteria:

- alle actieve leads staan in `Verisight_CRM.xlsx`
- er is geen actieve lead zonder fase, route, volgende actie en datum
- de prospectlijst blijft seed-list en is niet meer de live pipeline
- bezwaren en proposal-next-steps zijn zichtbaar in dezelfde leadlaag

Evidence check before next step:

- twee opeenvolgende wekelijkse CRM-updates
- nul actieve leads zonder next step
- scorecard `Deals` is een weekmirror van de CRM-pipeline

### Step 1.2 - Weekly governance live zetten
Owner: Founder

Acceptance criteria:

- `CEO_WEEKLY_SCORECARD.xlsx` is drie weken achter elkaar ingevuld
- `Deals`, `Clients` en `Priorities` zijn gebruikt met echte data
- elke week bevat top 3 priorities en explicit not doing
- scorecard, decision log en capacity check lopen in hetzelfde ritme

Evidence check before next step:

- drie volledige weekcycli zijn zichtbaar
- minimaal een besluit of guardrail is doorgezet naar `DECISION_LOG.md`

### Step 1.3 - Delivery visibility activeren
Owner: Founder

Acceptance criteria:

- elke actieve campaign in de app heeft gekoppelde deliveryrecord
- elke actieve campaign heeft lifecycle stage, exception-status, owner en next step
- `Clients` in de scorecard is alleen een wekelijkse samenvatting van de app-laag
- open checkpointgaten en exceptions zijn zichtbaar in de weekreview

Evidence check before next step:

- geen actieve campaign zonder actuele lifecycle of next step
- delivery risk review kan in minder dan 15 minuten worden gedaan

### Step 1.4 - Founder capacity guardrails invullen
Owner: Founder

Acceptance criteria:

- `FOUNDER_CAPACITY_MAP.md` bevat expliciete maxima voor sales, implementaties, high-manual trajecten en interne verbetertrajecten
- er zijn duidelijke trigger thresholds voor de-scope of herprioritering
- capacity check gebruikt echte pipeline- en deliveryload in plaats van gevoel

Evidence check before next step:

- twee weken capaciteitstoetsing tegen echte load
- minimaal een expliciete de-scope of stopregel zodra een drempel geraakt wordt

### Step 1.5 - Source-of-truth charter vastleggen
Owner: Founder

Acceptance criteria:

- `SOURCE_OF_TRUTH_CHARTER.md` legt per informatiesoort het primaire systeem en de samenvattende mirrors vast
- `docs/ops/README.md`, `DOCUMENT_INDEX.md` en `EXTERNAL_DOCS_REGISTER.md` spreken dezelfde taal
- scorecard en workbook claimen geen primair systeem te zijn waar ze alleen mirror zijn

Evidence check before next step:

- bij elk van leadpipeline, delivery, learning en governance is het primaire systeem eenduidig
- er is geen conflict meer tussen repo- en external-doc formuleringen over de live werklaag

### Step 1.6 - Eerste maandreview en wave gate
Owner: Founder

Acceptance criteria:

- `MONTHLY_PHASE_REVIEW.md` is echt ingevuld
- `DECISION_LOG.md` is bijgewerkt
- de wave-1 go/no-go is expliciet vastgelegd
- de maandreview gebruikt echte pipeline-, delivery- en capacity-evidence

Evidence check before next wave:

- maandreview toont aantoonbaar ritme
- actuele pipeline en actuele deliverylijst zijn zichtbaar
- capacity map is ingevuld
- open bottlenecks in `SCALABILITY_GAP_MATRIX.md` hebben owner en evidence status

### Milestone 2 - Wave 2 Systemize
Dependency: Milestone 1

Doel: ownership, metrics en delegatie hard maken op basis van wave-1 bewijs.

#### Tasks
- [ ] Step 2.1 - Voeg rolling metrics en eenvoudige throughput- en defectmeting toe.
- [ ] Step 2.2 - Veranker proof capture in proposal, livegang en first management use.
- [ ] Step 2.3 - Leg founder-only, operator-allowed en escalation-only beslissingen vast.
- [ ] Step 2.4 - Test een eerste gedelegeerde sales-slice en delivery-slice.

#### Definition of done
- [ ] Rolling metrics sturen de review mee.
- [ ] Delivery defects en queue-load zijn zichtbaar.
- [ ] Proof capture zit in het ritme.
- [ ] Delegatie is praktisch getest.

#### Validation
- [ ] Minstens een niet-founder heeft een gecontroleerde slice uitgevoerd.
- [ ] Wave 3 start alleen als metrics en delegated run aantonen dat systemisering werkt.

### Step 2.1 - Throughput- en defectmeting
Owner: Founder

Acceptance criteria:

- rolling 30-day metrics bestaan voor gesprekken, proposals, dealdoorlooptijd, trajectrisico en delivery defects
- dezelfde metrics komen terug in scorecard, maandreview en evidence workbook
- metrics blijven compact genoeg voor founder-led gebruik

Evidence check before next step:

- vier weken metrics beschikbaar zonder grote gaten

### Step 2.2 - Proof capture in kernritme
Owner: Founder + sales

Acceptance criteria:

- proposal, livegang en first management use hebben expliciete proof checkpoints
- proof capture gebeurt niet meer alleen achteraf
- case-readiness en claimruimte worden gekoppeld aan echte trajectmomenten

Evidence check before next step:

- nieuwe trajecten tonen proof capture op meerdere momenten in het traject

### Step 2.3 - Role clarity en escalatiegrenzen
Owner: Founder

Acceptance criteria:

- founder-only, operator-allowed en escalation-only beslissingen zijn per route vastgelegd
- delivery- en saleshandovers verwijzen naar dezelfde beslisgrenzen
- een tweede persoon kan de grenzen lezen zonder extra mondelinge context

Evidence check before next step:

- de rolgrenzen zijn gebruikt in minimaal een echte sales- of deliveryhuddle

### Step 2.4 - Eerste delegated run
Owner: Founder + future operator

Acceptance criteria:

- een sales-slice en een delivery-slice zijn gedelegeerd uitgevoerd
- kwaliteit, zichtbaarheid en next-step discipline blijven overeind
- learnings zijn vastgelegd in learning- en governanceartefacten

Evidence check before next wave:

- delegated run is gedocumenteerd in learnings en maandreview
- metrics laten geen grote kwaliteitsval zien

### Milestone 3 - Wave 3 Scale Readiness
Dependency: Milestone 2

Doel: alleen bewezen frictie standaardiseren of verlichten.

#### Tasks
- [ ] Step 3.1 - Maak een friction shortlist op basis van gemeten pijn.
- [ ] Step 3.2 - Maak per automation- of toolingkandidaat een business case met non-go criteria.
- [ ] Step 3.3 - Voer een 2x volume boundary test uit voor sales, delivery en governance.

#### Definition of done
- [ ] Alleen bewezen knelpunten worden gestandaardiseerd.
- [ ] Assisted kwaliteit blijft leidend.
- [ ] Scale readiness is rationeel onderbouwd, niet aspiratief.

#### Validation
- [ ] Elke standaardisatie verlaagt aantoonbaar frictie of risico.
- [ ] Geen Stripe-first, self-serve of brede automation zonder gatebewijs.

### Step 3.1 - Friction shortlist
Owner: Founder + ops/product

Acceptance criteria:

- alleen pipeline-frictie, delivery checkpoint-frictie en proof capture-frictie komen op de shortlist
- elk item heeft gemeten pijn, impact en tijdwinst

Evidence check before next step:

- elk shortlist-item heeft ten minste een maand aan onderliggende evidence

### Step 3.2 - Selectieve tooling/automation business case
Owner: Founder + ops/product

Acceptance criteria:

- elke automationkandidaat heeft business case, risico en expliciete non-go
- instabiele of onduidelijke stappen blijven bewust manual-first

Evidence check before next step:

- geen automation zonder vooraf gemeten handmatig pijnpunt

### Step 3.3 - 2x volume boundary test
Owner: Founder

Acceptance criteria:

- grenzen en mitigaties voor 2x volume zijn expliciet per sales, delivery en governance
- founder-only stappen zijn herbevestigd of bewust afgebouwd
- er is een expliciet besluit of een vaste ops-owner logisch wordt

Evidence check before next wave:

- grensentest laat zien welke bottlenecks blijven en welke echt oplosbaar zijn

## Execution breakdown by subsystem

### Commercial system

- prospectlijst blijft seed-list
- `Verisight_CRM.xlsx` wordt de enige actieve leadpipeline
- `CEO_WEEKLY_SCORECARD.xlsx` haalt alleen weeksamenvatting op
- bezwaren, routekeuze en next-step discipline moeten in dezelfde leadlaag zichtbaar blijven

### Governance system

- scorecard, maandreview, decision log en capacity map vormen samen het vaste reviewpakket
- roadmap blijft audit- en fase-overzicht, niet de dagelijkse fix-driver
- wave-overgangen gebeuren alleen op expliciete evidence checks

### Delivery system

- runtime-surfaces blijven primair voor actieve campaigns
- `Clients` in de scorecard blijft weekmirror en geen tweede deliveryboard
- exception-taal en checkpointtaal moeten gelijk zijn in docs en app

### Learning and proof system

- `/beheer/klantlearnings` blijft de primaire learninglaag
- proof capture schuift in wave 2 van optioneel naar ritmisch
- evidence wordt alleen claimbaar wanneer de case- en governanceguardrails zijn gehaald

### Founder dependency

- wave 1 maakt load zichtbaar en begrensd
- wave 2 legt beslisgrenzen en delegated slices vast
- wave 3 standaardiseert alleen wat bewezen founderfrictie verlaagt

## Current product risks

- [ ] Lege pipeline-instrumentatie maakt commerciele ritmediscipline nog te zwak.
- [ ] Founder blijft centrale triage- en herstelroute over sales, delivery en governance.
- [ ] Throughput, queue-load en defectfrequentie zijn nog onvoldoende zichtbaar.
- [ ] Governance is ontworpen maar nog niet bewezen in ritme.
- [ ] Meerdere bronlagen kunnen onder druk opnieuw naast elkaar gaan sturen.

## Open questions

- [ ] Wordt later een aparte ops-owner logisch, of blijft de founder de dominante stuurlaag?
- [ ] Welke metricset blijft compact genoeg voor founder-led gebruik zonder nieuwe meetbureaucratie?
- [ ] Welke proof checkpoints blijken in wave 2 echt hoog-leverage en welke zijn overbodig?

## Follow-up ideas

- [ ] Voeg na wave 2 een compacte `Defects & Queue`-laag toe aan de scorecard als de metrics anders te versnipperd blijven.
- [ ] Overweeg pas na wave 2 een apart intern ops command center als `/beheer` plus scorecard te gefragmenteerd blijft.
- [ ] Gebruik maandreviews later als input voor een beperkte automation shortlist.

## Out of scope for now

- [ ] nieuw CRM-systeem
- [ ] website-, SEO- of contentprogramma
- [ ] Stripe, billing of self-serve onboarding
- [ ] nieuwe productfamilies of brede parallelle verbetertrajecten
- [ ] automation van instabiele of onduidelijke stappen
- [ ] teamuitbreiding om onduidelijkheid te maskeren

## Defaults chosen

- [x] Bestandslocatie: `SCALABILITY_FIX_PROGRAM_PLAN.md`
- [x] Operating model wave 1: `hybride`
- [x] Dominante governancefase: `Phase 1 - Revenue Proof Engine`
- [x] Parallelle stabilisatielaag: `Phase 2 - Delivery Stability Engine`
- [x] Lead source of truth: `Verisight_CRM.xlsx`
- [x] Delivery source of truth: app-surfaces in `/beheer` en `/campaigns/[id]`
- [x] Wekelijkse governance source of truth: `CEO_WEEKLY_SCORECARD.xlsx`
- [x] Wave-overgang gebeurt alleen op bewijschecks, niet op intentie of documentvolledigheid
