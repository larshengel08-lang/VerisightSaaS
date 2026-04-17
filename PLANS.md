# PLANS.md — Verisight Dashboard Review & Redesign Plan

## Status
- Scope: klantdashboard voor ExitScan en RetentieScan
- Source of truth: deze `PLANS.md`
- Huidige uitvoerstatus: milestones 1, 2, 3, 4, 5 en 6 afgerond
- Deze run bevat milestone-6-wijzigingen aan de productspecifieke campaign detail-flow en finale QA, zonder inhoudelijke contractwijzigingen

## Executive Summary
Dit plan brengt het Verisight-klantdashboard stapsgewijs dichter bij de logica van de rapporten, zonder inhoudelijke wijzigingen in berekeningen, scores, mappings, classificaties, thresholds, surveylogica, rapportlogica of methodische claims. De uitvoering binnen dit plan is nu afgerond tot en met milestone 6: shared dashboard-branding, report-order campaign detail, gerichte interactie, cockpit overview en een expliciete product-pass voor ExitScan en RetentieScan.

De inhoudelijke navigatieruggengraat voor latere uitvoering blijft:
1. Executive summary
2. Bestuurlijke handoff
3. Wat drijft dit beeld?
4. Waar eerst op handelen
5. 30–90 dagenroute / managementroute
6. Methodiek / privacy / leeswijzer als secundaire verdieping

## Huidige Dashboardreview
### Campaign detail
De huidige detailpagina in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` volgt nu grofweg deze volgorde:
1. hero
2. warnings
3. adoptie / eerste managementgebruik
4. admin learning
5. beslisoverzicht
6. managementduiding en prioritering
7. operatie / launchcontrole
8. analyse en drivers
9. van signaal naar gesprek en actie
10. respondenten
11. methodologie

### Dashboard overview
De overview in `frontend/app/(dashboard)/dashboard/page.tsx` werkt al als operationeel overzicht, maar is nog geen volledig cockpit-achtige management/ops-routinglaag. Campagnes worden wel gegroepeerd op next action, maar de visuele hiërarchie en merkconsistentie zijn nog beperkt.

### Shared dashboardlaag
De gedeelde primitives in `frontend/components/dashboard/dashboard-primitives.tsx` en de omliggende dashboardcomponenten vormen al een bruikbare basis, maar ze drukken executive, analyse en utility nog niet sterk genoeg uit als verschillende informatielagen.

## Milestone 1 — Baseline Review En Dashboard Contract Freeze
### Doel
De huidige dashboardflow, inhoudelijke invarianten en hergebruikbare componenten expliciet vastleggen voordat er visuele of interactionele herbouw plaatsvindt.

### Afgerond
- [x] Scope bevestigd: alleen dashboard/app-ervaring voor ExitScan en RetentieScan
- [x] Huidige entrypoints geïnventariseerd:
  - `frontend/app/(dashboard)/dashboard/page.tsx`
  - `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
  - ondersteunende componenten in `frontend/components/dashboard/*`
- [x] Huidige campaign detail-volgorde vastgelegd
- [x] Huidige overview-rol vastgelegd
- [x] Shared vs product-specifieke dashboardverantwoordelijkheden in kaart gebracht
- [x] Inhoudelijke invarianten expliciet bevroren
- [x] Huidige UX-problemen, managementfrictie en merkproblemen gedocumenteerd
- [x] Uitvoeringsscope voor latere milestones aangescherpt zonder al code te wijzigen

### Inhoudelijke Invarianten (Contract Freeze)
Deze ronde en alle vervolg-milestones binnen dit plan wijzigen niet:
- berekeningen
- scores
- mappings
- classificaties
- thresholds
- surveylogica
- rapportlogica
- methodische claims
- betekenis van teksten, inzichten, hypothesen of managementduiding

Wel in scope voor latere milestones:
- dashboardlayout
- componentstructuur
- interactie
- visuele hiërarchie
- merkconsistentie
- scanbaarheid
- volgorde en plaatsing van bestaande inhoud

### Shared vs Product-Specifieke Inventarisatie
#### Shared
- dashboardshell en layout
- section- en panelcomponenten
- KPI-weergave
- charts en tabellen als presentatielaag
- respondentweergave
- methodologie-disclosure
- onboarding-/guidecomponenten
- operationele campaign controls

#### ExitScan-specifiek
- vertrekbeeld
- werkfrictie / preventability-duiding
- exitredenenlogica in de presentatielaag
- reviewmoment- en managementgesprekframing

#### RetentieScan-specifiek
- retentiesignaal + aanvullende signalen
- trendlaag
- segment/playbook-verdieping
- privacy-/niet-predictive framing

## Grootste Huidige UX- en Dashboardproblemen
- De volgorde volgt de rapportlogica nog niet strak genoeg.
- Executive, onboarding, analyse en operations lopen nog te veel door elkaar.
- De pagina voelt deels als rapport-export in webvorm.
- De belangrijkste managementinformatie is niet persistent genoeg zichtbaar.
- Methodiek/privacy is secundair gemaakt, maar de tussenlagen erboven zijn nog niet scherp genoeg geordend.
- De visuele hiërarchie leunt nog te veel op generieke utility-styling in plaats van Verisight-branding.
- Overview en detail voelen nog niet duidelijk als twee verschillende gebruiksmodi: cockpit versus managementread.

## Gewenste Architectuur Voor Vervolg
### Doelvolgorde campaign detail
1. Executive summary
2. Bestuurlijke handoff
3. Drivers
4. Prioriteiten / eerste acties
5. 30–90 dagenroute
6. Methodiek / privacy / leeswijzer
7. Operations en respondentdetails als utilitylaag

### Interactieprincipes voor latere milestones
- sticky executive summary bar
- sticky section navigation
- selectieve tabs of subviews binnen drivers
- expandable cards waar actie/verdieping helpt
- collapsible methodiek/privacy
- utilitylaag buiten de primaire managementflow

## Milestones
- [x] Milestone 1 — Baseline review en dashboard contract freeze
- [x] Milestone 2 — Shared dashboard design system en branded primitives
- [x] Milestone 3 — Campaign detail herstructureren naar report-order
- [x] Milestone 4 — Interactieve verdieping per sectie
- [x] Milestone 5 — Overview cockpit en utilitylaag
- [x] Milestone 6 — Product-specifieke pass en finale QA

## Wat Is Afgerond In Deze Run
### Milestone 6
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx` product-specifieker gemaakt binnen de gedeelde dashboardshell:
  - ExitScan leest nu bovenin explicieter als vertrekduiding en beinvloedbare frictie
  - RetentieScan leest nu bovenin explicieter als groepssignaal en verification-first managementread
  - de eerste executive cards zijn per product al boven de handoff gepromoveerd, zodat de campaign binnen één scherm herkenbaar leest
- drivervolgorde en drivertitels zijn nu productspecifiek:
  - ExitScan start bij factoren en vertrekdrivers
  - RetentieScan start bij retentiesignaal en trend, daarna pas factoren en aanvullende signalen
- actie-, playbook- en routeblokken hebben nu productspecifieke titels en introcopy zonder inhoudelijke contractwijziging
- finale QA voor milestone 6 uitgevoerd en de standaard frontend-build is nu groen

### Milestone 5
- `frontend/app/(dashboard)/dashboard/page.tsx` omgezet van algemeen campagne-overzicht naar duidelijkere cockpit met:
  - statuskaarten bovenaan
  - scherpere statusgroepen
  - expliciete next-action routing
  - duidelijkere scheiding tussen managementklare campagnes, opbouw, setup en gesloten campaigns
- campaign rows opnieuw opgebouwd zodat scan type, readiness, next action, kernmetrics en quick actions sneller samen leesbaar zijn
- onderaan een expliciete utilitylaag toegevoegd voor:
  - admin: beheer, handoff en learning-workbench
  - viewer: support, rapportgebruik en volgende stap
- overview visueel dichter bij de Verisight-branding gebracht zonder campaign detail, productspecifieke logica of utilitycomponenten inhoudelijk te wijzigen

### Milestone 4
- drivers-sectie in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` omgezet naar compacte tabbed subviews via `DashboardTabs`
- signaalverdeling, factoren, aanvullende signalen en trendlagen blijven inhoudelijk gelijk, maar zijn nu interactioneel geordend in plaats van als lange stapel
- actie-sectie interactiever gemaakt via rustige expandable cards in:
  - `frontend/components/dashboard/recommendation-list.tsx`
  - `frontend/components/dashboard/action-playbook-list.tsx`
  - `frontend/components/dashboard/segment-playbook-list.tsx`
- 30–90 dagenroute omgezet naar een echte timeline-flow via `DashboardTimeline`
- kleine bronopschoning in `campaigns/[id]/page.tsx` uitgevoerd voor een paar beschadigde labels/tekens die deze nieuwe interactionele laag raakten
- methodiek/privacy bewust secundair en collapsible gelaten; utilitylaag en overview niet meegenomen

### Milestone 3
- campaign detail in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` herschikt naar rapportvolgorde:
  - executive summary
  - bestuurlijke handoff
  - drivers
  - prioriteiten / eerste acties
  - 30–90 dagenroute
  - methodiek / privacy / leeswijzer
  - operations en respondentdetails als utilitylaag
- sticky `DashboardSummaryBar` en section anchors ingezet in de echte paginaflow
- adoptie/onboarding verplaatst uit de topflow naar de route-sectie
- operations, respondenten en admin learning losgetrokken van de primaire managementread
- bestaande content behouden, maar opnieuw geordend en gegroepeerd in de rapportlogica

### Milestone 2
- gedeelde dashboard primitives visueel gelijkgetrokken met de Verisight-branding
- tone-system voor `slate`, `blue`, `emerald` en `amber` herschaald naar de warmere merkpalette
- dashboard-shell in `frontend/app/(dashboard)/layout.tsx` omgezet van generiek blauw/grijs naar merkconsistent warm oppervlak
- mobiele dashboardnavigatie visueel gelijkgetrokken met dezelfde shell-stijl
- globale dashboard surface- en shadow-basis toegevoegd in `frontend/app/globals.css`
- nieuwe gedeelde primitives voorbereid voor latere milestones:
  - `DashboardSummaryBar`
  - `DashboardTimeline`
- `DashboardSection` uitgebreid met `id` en `tone`, zodat milestone 3 de rapportvolgorde kan implementeren zonder opnieuw de shared layer te verbouwen

### Eerder afgerond
- baseline review van de huidige dashboardstructuur
- contract freeze van alle inhoudelijke en methodische invarianten
- documentatie van huidige campaign detail-volgorde
- documentatie van shared vs product-specifieke componentlaag
- vastlegging van huidige UX-problemen en vervolgarchitectuur

## Welke Bestanden Zijn Aangepast
- `PLANS.md`
- `frontend/components/dashboard/dashboard-primitives.tsx`
- `frontend/app/(dashboard)/layout.tsx`
- `frontend/components/ui/mobile-nav.tsx`
- `frontend/app/globals.css`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`
- `frontend/components/dashboard/segment-playbook-list.tsx`

## Welke Bestanden Zijn Beoordeeld
- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/components/dashboard/dashboard-primitives.tsx`
- `frontend/components/dashboard/dashboard-tabs.tsx`
- `frontend/components/dashboard/factor-table.tsx`
- `frontend/components/dashboard/risk-charts.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`
- `frontend/components/dashboard/segment-playbook-list.tsx`
- `frontend/components/dashboard/respondent-table.tsx`
- `frontend/components/dashboard/onboarding-panels.tsx`
- `frontend/components/dashboard/preflight-checklist.tsx`
- `frontend/app/globals.css`
- `backend/report.py` als inhoudelijke volgorde-reference

## QA Die Is Uitgevoerd
- statische review van overview en campaign detail
- mapping van huidige campaign detail-volgorde naar gewenste rapportvolgorde
- controle van shared versus product-specifieke dashboardcomponenten
- controle dat milestone 2 geen inhoudelijke of methodische codewijzigingen bevat
- gerichte lint op aangepaste dashboardbestanden:
  - `app/(dashboard)/layout.tsx`
  - `components/dashboard/dashboard-primitives.tsx`
  - `components/ui/mobile-nav.tsx`
- gerichte lint op campaign detail:
  - `app/(dashboard)/campaigns/[id]/page.tsx`
- gerichte lint op overview cockpit:
  - `app/(dashboard)/dashboard/page.tsx`
- gerichte lint op milestone-4-componenten:
  - `components/dashboard/recommendation-list.tsx`
  - `components/dashboard/action-playbook-list.tsx`
  - `components/dashboard/segment-playbook-list.tsx`
  - `components/dashboard/dashboard-tabs.tsx`
- gerichte lint op milestone-6-detailpagina:
  - `app/(dashboard)/campaigns/[id]/page.tsx`
- buildverificatie uitgevoerd via:
  - `npx.cmd next build --no-lint`
- `npm.cmd run lint -- "app/(dashboard)/campaigns/[id]/page.tsx"` slaagt
- de standaard Next-build slaagt nu weer op de ondersteunde workflow
- repo-brede lintvalidatie is in deze milestone niet opnieuw volledig gedraaid

## Wat Nog Openstaat
- geen open dashboard-milestones binnen dit plan
- volledige repo-brede lintvalidatie als aparte follow-up buiten deze milestone-close-out

## Risico’s En Follow-ups Ontdekt
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx` heeft nu al veel inhoud, waardoor herordenen zonder regressie nauwkeurig componentwerk vraagt.
- `frontend/components/dashboard/dashboard-primitives.tsx` is een logische hefboom voor milestone 2; zonder shared restyle dreigen vervolgwijzigingen gefragmenteerd te raken.
- Onboarding-, operations- en managementlagen zitten inhoudelijk dicht op elkaar; bij milestone 3 moet scherp bewaakt worden dat de utilitylaag niet opnieuw in de hoofdlijn lekt.
- RetentieScan vraagt extra zorg om privacy- en interpretatiegrenzen visueel expliciet te houden terwijl de flow compacter wordt.
- Overview en campaign detail hebben verschillende doelen; dat onderscheid moet in latere milestones bewust bewaakt blijven.
- `DashboardTabs` blijft bewust alleen op de driverlaag ingezet; verdere interactie-uitbreiding moet voorkomen dat overview en campaign detail dezelfde dichtheid krijgen.
- De overview-groepering gebruikt nog steeds dezelfde bestaande response-/readinessgrenzen; dat blijft bewust gedeeld gedrag tussen beide producten.
- Pulse blijft in deze shell op de fallback-route hangen; dat is acceptabel binnen scope, maar verdient een aparte product-pass als Pulse later weer actieve dashboardscope krijgt.

## Buiten Scope
- wijzigingen in scoring, thresholds, mappings of surveylogica
- wijzigingen in rapportinhoud of methodische claims
- nieuwe producten
- grote backend-herarchitectuur
- inhoudelijke herformulering van insights of hypothesen
- nieuwe segmentlogica of nieuwe managementclaims
