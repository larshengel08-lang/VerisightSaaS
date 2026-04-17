# Source Of Truth Charter

Last updated: 2026-04-17
Status: active

## Purpose

Dit charter legt voor het schaalbaarheids-fix-programma vast welk systeem per informatietype leidend is, welke artefacten alleen mirror of reviewlaag zijn, en in welke updatevolgorde Verisight werkt.

Kernregel:

- eerst het primaire systeem bijwerken
- daarna pas de samenvattende mirror
- bij conflict wint altijd het primaire systeem

## Current operating rule

Voor wave 1 van het fix-programma werkt Verisight hybride:

- leadpipeline primair in `Verisight_CRM.xlsx`
- delivery primair in de app-surfaces
- learning primair in `/beheer/klantlearnings`
- governance primair in scorecard, maandreview, decision log en capacity map
- evidence primair in `SCALABILITY_REVIEW_WORKBOOK.xlsx`

## Primary systems by information type

| Informatietype | Primair systeem | Samenvattende mirror | Niet als primair gebruiken |
| --- | --- | --- | --- |
| Actieve leads en deals | `Docs_External/.../Verisight_CRM.xlsx` | `CEO_WEEKLY_SCORECARD.xlsx` tab `Deals` | prospectlijst, losse notities, maandreview |
| Seed prospects en outbound-voorraad | `Verisight_Prospectlijst_2026-04-10.xlsx` | geen vaste mirror nodig | CRM-pipeline zodra een prospect nog niet actief is |
| Actieve klanttrajecten | `/beheer` en `/campaigns/[id]` | `CEO_WEEKLY_SCORECARD.xlsx` tab `Clients` | onboardingflow-workbooks, losse checklists |
| Delivery exceptions en checkpoints | `/beheer` en `/campaigns/[id]` | weekreview en maandreview | losse e-mails of operatorgeheugen |
| Learning en vroege proof | `/beheer/klantlearnings` | maandreview en case-proof docs | losse notities |
| Wekelijkse prioriteiten en stopregels | `CEO_WEEKLY_SCORECARD.xlsx` | `DECISION_LOG.md` waar nodig | CRM of deliverysurfaces |
| Maandelijkse gates en wave-overgangen | `MONTHLY_PHASE_REVIEW.md` | `DECISION_LOG.md`, `SCALABILITY_REVIEW_WORKBOOK.xlsx` | roadmap of losse statusupdates |
| Capaciteitsgrenzen | `FOUNDER_CAPACITY_MAP.md` | scorecard cash and capacity | impliciet gevoel |
| Strategische hoofdrichting | `CEO_GROWTH_SYSTEM_2026.md` | `ROADMAP.md` als audit/fase-overzicht | externe roadmaps |

## Required update order

### 1. Lead and sales updates

Werk in deze volgorde:

1. update `Verisight_CRM.xlsx`
2. trek de weeksamenvatting door naar `CEO_WEEKLY_SCORECARD.xlsx`
3. leg alleen meerweekse of koersgevende besluiten vast in `DECISION_LOG.md`

### 2. Delivery updates

Werk in deze volgorde:

1. update deliveryrecord en checkpoints in de app
2. zet alleen de wekelijkse samenvatting in `CEO_WEEKLY_SCORECARD.xlsx`
3. gebruik `MONTHLY_PHASE_REVIEW.md` voor terugkerende fricties of gates

### 3. Learning and proof updates

Werk in deze volgorde:

1. update `/beheer/klantlearnings`
2. trek relevante patroonlessen door naar maandreview
3. gebruik case-proof docs pas als bewijs of claimruimte echt hard genoeg is

### 4. Governance updates

Werk in deze volgorde:

1. wekelijkse scorecard
2. decision log waar nodig
3. maandreview aan het eind van de cyclus
4. capacity map bij echte load- of prioriteitswijziging

## Mirror rules

- `Deals` in `CEO_WEEKLY_SCORECARD.xlsx` is een weekmirror van de CRM-pipeline.
- `Clients` in `CEO_WEEKLY_SCORECARD.xlsx` is een weekmirror van de app-deliverylaag.
- `SCALABILITY_REVIEW_WORKBOOK.xlsx` is geen dagelijkse operatie, maar een gate- en evidenceregister.
- `ROADMAP.md` en `ROADMAP_WORKBOOK.xlsx` blijven fase- en auditlaag, niet de live fix-werklaag.
- `Docs_External` mag referentie of assetlaag zijn, maar geen autonome prioriteitenlaag.

## Forbidden drift

Niet doen:

- actieve leads alleen in de prospectlijst laten staan
- deliverystatus alleen in scorecard of losse notities bijhouden
- maandreview invullen zonder terug te wijzen naar echte CRM-, app- of workbookevidence
- externe workbooks of documenten laten afwijken van de actieve repo-playbooks zonder expliciete sync
- een mirror gebruiken om het primaire systeem te overrulen

## Acceptance

Dit charter werkt pas echt als:

- elke actieve lead exact een primaire plek heeft
- elke actieve campaign exact een primaire deliveryplek heeft
- de CEO in 15 minuten pipeline, deliveryrisico en capaciteit kan lezen
- maandreviews en wave-gates alleen nog op echte systeemdata leunen
