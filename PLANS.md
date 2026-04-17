# PLANS.md — Verisight Dashboard Review & Redesign Plan

## Management Language & Sectierollen — 2026-04-17
### Wat Is Afgerond
- [x] één gedeelde managementtaal ingevoerd voor buyer-facing labels in backend-reporting, dashboardcomponenten en report preview copy:
  - `Voorlopig stabiel`
  - `Aandacht nodig`
  - `Direct aandachtspunt`
  - `Meenemen in verificatie`
  - `Stabiliserende factor`
- [x] centrale backend-resolver toegevoegd in `backend/products/shared/management_language.py`
- [x] centrale frontend-resolver toegevoegd in `frontend/lib/management-language.ts`
- [x] actieve PDF-route aangescherpt zodat:
  - managementsamenvatting alleen het huidige beeld en de bestuurlijke relevantie draagt
  - factoranalyse verklarend blijft
  - focusvragen alleen verificatievragen tonen
  - `Wat nu` de enige laag blijft voor route, eigenaar, eerste stap en reviewmoment
- [x] oude buyer-facing labels verwijderd uit actieve reportflow, dashboardbadges, risk charts, factor tables, recommendation/playbook-lagen en report preview copy
- [x] canonieke voorbeeldrapporten opnieuw gegenereerd en gespiegeld naar `docs/examples` en `frontend/public/examples`

### Aangepaste Bestanden
- `backend/products/shared/management_language.py`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `backend/report.py`
- `backend/scoring.py`
- `frontend/lib/management-language.ts`
- `frontend/lib/report-preview-copy.ts`
- `frontend/lib/products/retention/dashboard.ts`
- `frontend/lib/products/team/dashboard.ts`
- `frontend/lib/products/exit/action-playbooks.ts`
- `frontend/lib/products/retention/action-playbooks.ts`
- `frontend/lib/client-onboarding.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/components/ui/risk-badge.tsx`
- `frontend/components/dashboard/factor-table.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/risk-charts.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`
- `frontend/components/dashboard/respondent-table.tsx`
- `docs/examples/voorbeeldrapport_verisight.pdf`
- `docs/examples/voorbeeldrapport_retentiescan.pdf`
- `frontend/public/examples/voorbeeldrapport_verisight.pdf`
- `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

### QA Uitgevoerd
- gerichte repo-zoekchecks op legacy buyer-facing labels:
  - `Gemengd signaal`
  - `Beperkt signaal`
  - `Sterke factor`
  - `Laag aandachtssignaal`
  - `Verhoogd aandachtssignaal`
  - `Sterk aandachtssignaal`
  - `Nu bespreken`
  - `Verder bekijken`
  - `Eerst verifieren`
- `python -m py_compile` op:
  - `backend/report.py`
  - `backend/products/exit/report_content.py`
  - `backend/products/retention/report_content.py`
  - `backend/products/shared/management_language.py`
  - `backend/scoring.py`
- voorbeeldgenerator groen via:
  - `python generate_voorbeeldrapport.py exit`
  - `python generate_voorbeeldrapport.py retention`
- PDF-paginacheck:
  - ExitScan voorbeeldrapport = 7 pagina’s
  - RetentieScan voorbeeldrapport = 7 pagina’s
- hashcontrole:
  - `docs/examples/voorbeeldrapport_verisight.pdf` == `frontend/public/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf` == `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

### Wat Nog Openstaat
- geen functionele vervolgslag binnen deze implementatie; de gedeelde managementtaal en sectierollen staan nu actief in de buyer-facing hoofdflow

### Risico’s En Follow-ups
- in `backend/report.py` bestaan nog legacy/unreachable fallbackblokken naast de actieve rebrand-route; een deel daarvan bevat oude interne terminologie die niet meer in de actuele buyer-facing output verschijnt
- `backend/products/exit/report_content.py` bevat nog een oudere fallbackkaartlaag buiten de actieve rebrand-weergave; die is nu niet leidend voor de gegenereerde voorbeeldrapporten, maar verdient later een gerichte cleanup zodat documentatie, actieve flow en fallbackcode volledig gelijklopen
- frontend lint is in deze workspace niet uitgevoerd omdat er op repo-root geen `package.json` staat; backend compile- en generatorchecks zijn wel groen

## Report Rebrand Status
- Scope: visuele en structurele rebrand van ExitScan- en RetentieScan-PDF-rapporten
- Source of truth voor deze run:
  - `PLANS.md`
  - `docs/superpowers/specs/2026-04-17-report-redesign-design.md`
  - `backend/report.py`
  - `backend/report_design.py`
  - `docs/examples/*.pdf`
- Huidige uitvoerstatus: milestones 1, 2, 3, 4, 5 en 6 uitgevoerd, plus afgeronde post-plan paginacount-recalibratie

## Report Rebrand Executive Summary
Milestone 1, 2, 3, 4, 5 en 6 zijn nu afgerond voor de rapportrebrand. De baseline, inhoudelijke contract freeze en uitvoeringsgrenzen zijn vastgelegd, de centrale PDF design system-laag voor de page shell is technisch aangescherpt, de actieve rebrand story builder leunt consequenter op gedeelde reportcomponenten, de vier kernpagina’s zijn verder hergecomponeerd volgens de goedgekeurde spec, de productspecifieke middenpagina’s volgen nu explicieter de afgesproken page-flow met gecontroleerde overflow, en de canonieke buyer-facing voorbeeld-PDF’s zijn opnieuw gegenereerd en gespiegeld zonder inhoudelijke wijziging van de rapporten.

Na milestone 6 is ook de open follow-up op paginatelling uitgevoerd. De buyer-facing voorbeeldrapporten zijn teruggebracht van 15/14 pagina’s naar 7/7 pagina’s door puur structurele compactie van executive, factor-, focus-, risico-, actie- en methodieksecties en door het absorberen van de laatste overflowpagina’s in de hoofdflow. De inhoud en rapportlogica zijn daarbij ongewijzigd gebleven; alleen de visuele verpakking en de dichtheid van de layout zijn aangepast.

In deze milestone-run zijn alleen visuele en structurele shellaanpassingen gedaan in de gedeelde PDF-laag:
- centrale shell-constanten voor cover/body frames vastgelegd in `backend/report_design.py`
- footer- en header-shelltekst gecentraliseerd
- actieve frame-offsets in `generate_campaign_report(...)` gekoppeld aan gedeelde constants in plaats van losse magic numbers
- actieve rebrand-pagina’s gekoppeld aan gedeelde componenthelpers voor:
  - kolomlayouts
  - datatabellen
  - focusvraagblokken
  - badge-achtergronden en actieve accentkleuren
- milestone-4 hercompositie aangescherpt voor:
  - cover
  - executive summary
  - factoranalyse
  - methodiek & verantwoording
- milestone-5 productspecifieke middenpaginaflow aangescherpt voor:
  - ExitScan risico- en preventiecontinuatie voor open survey-signalen
  - RetentieScan behoudsplaybooks als aparte vervolgpagina
  - gecontroleerde overflow tussen hoofdroute en vervolgpagina’s per product
- milestone-6 finale regressie en voorbeeldassets afgerond voor:
  - canonieke voorbeeld-PDF’s opnieuw gegenereerd via de bestaande generatorroute
  - synchronisatie tussen `docs/examples` en `frontend/public/examples`
  - finale regressiecheck op actieve output, page-counts en productspecifieke vervolglabels

Niet gewijzigd in deze run:
- berekeningen
- scores
- mappings
- classificaties
- thresholds
- methodische claims
- surveylogica
- productlogica
- productspecifieke inhoud van ExitScan of RetentieScan

De baseline bevestigt:
- de actieve PDF-pipeline loopt via `backend/main.py` → `generate_campaign_report(...)` in `backend/report.py`
- de echte paginacompositie wordt in de huidige codebase opgebouwd in `backend/report.py`
- `backend/report_design.py` is de bedoelde plek voor gedeelde PDF-tokens, typografie en page shell
- productspecifieke inhoud blijft komen uit:
  - `backend/products/exit/report_content.py`
  - `backend/products/retention/report_content.py`
  - `backend/scan_definitions.py`
- de buyer-facing inhoudelijke referentie blijft de huidige output in `docs/examples/*.pdf`

Na afronding van de rebrand is ook de resterende generatorblokker buiten de reportflow pragmatisch afgevangen zonder inhoudelijke productwijziging:
- `backend/models.py` is verder uitgelijnd op UUID/GUID-gedrag zodat ORM-verwachtingen beter aansluiten op de echte schema-intentie
- `generate_voorbeeldrapport.py` gebruikt nu automatisch een geisoleerde lokale SQLite demo-database wanneer de app op Postgres/Supabase staat
- canonieke voorbeeldrapporten kunnen daardoor weer standaard worden gegenereerd zonder handmatige `DATABASE_URL`-override en zonder writes naar de live database

## Report Rebrand Milestone 1 — Baseline Mapping En Contract Freeze
### Wat Is Afgerond
- [x] bronhiërarchie bevestigd:
  - goedgekeurde Claude redesign spec als design source of truth
  - echte Verisight repo als technische source of truth
  - huidige ExitScan- en RetentieScan-rapporten als inhoudelijke source of truth
- [x] huidige technische opzet in kaart gebracht:
  - PDF-entry via `backend/main.py`
  - report-opbouw in `backend/report.py`
  - gedeelde designlaag in `backend/report_design.py`
  - productspecifieke inhoudsmodules in `backend/products/*/report_content.py`
- [x] huidige rapportvolgorde per product vastgesteld via codelezing en tekstextractie van de voorbeeld-PDF’s
- [x] gedeelde versus productspecifieke reportcomponenten geïnventariseerd
- [x] inhoudelijke contract freeze vastgelegd:
  - geen wijzigingen aan berekeningen
  - geen wijzigingen aan scores
  - geen wijzigingen aan mappings
  - geen wijzigingen aan classificaties
  - geen wijzigingen aan thresholds
  - geen wijzigingen aan methodische claims
  - geen wijzigingen aan surveylogica
  - geen wijzigingen aan productlogica
  - geen betekeniswijziging van teksten, inzichten, hypothesen, managementduiding of besluiten
- [x] milestonevolgorde en gewenste doelstructuur vastgelegd in het plan

### Huidige Technische Opzet
- actieve renderroute:
  - `backend/main.py` roept `generate_campaign_report(...)` aan
  - `backend/report.py` assembleert de PDF via ReportLab
- gedeelde presentatielaag:
  - `backend/report_design.py` bevat fonts, tokens, styles en page callbacks
- inhoudelijke bronnen:
  - `backend/products/exit/report_content.py`
  - `backend/products/retention/report_content.py`
  - `backend/scan_definitions.py`
- huidige buyer-facing output:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`

### Shared Component Mapping
#### Bestaand Hergebruik
- `_risk_gauge_image`
- `_radar_image`
- `_factor_bar_image`
- `_preventability_image`
- bestaande productpayloads voor executive, signalen, hypotheses, next steps en methodiek

#### Nog Niet Uitgevoerd In Milestone 1
- `PageHeader`
- `PageFooter`
- `CoverBlock`
- `SectionEyebrow`
- `InfoCard`
- `HighlightCard`
- `RiskBadge`
- `DataTable`
- `MetricBand`
- `EmphasisNote`
- `ChartFrame`
- `FocusQuestionBlock`

## Report Rebrand Milestone 2 — Shared PDF Design System En Page Shell
### Wat Is Afgerond
- [x] centrale page-shell constants toegevoegd in `backend/report_design.py` voor:
  - body frame gap
  - cover frame inset
  - header wordmark padding
  - header meta gap
  - footer rule gap
- [x] footer- en header-shellcopy gecentraliseerd in `backend/report_design.py`
- [x] actieve frame-layout in `generate_campaign_report(...)` gekoppeld aan gedeelde shell constants in plaats van losse offsets
- [x] page shell opgeschoond zonder wijziging van productspecifieke inhoud, berekeningen of rapportlogica
- [x] bestaande fontfallback expliciet behouden:
  - `IBM Plex Sans Light` is nog niet aanwezig in `backend/assets/fonts`
  - covertypografie valt daarom gecontroleerd terug op de bestaande IBM Plex Sans-registratie

### Binnen Scope Uitgevoerd
- gedeelde PDF-shell
- cover/body frame-layout
- header/footer shelltekst
- design-system centralisatie voor page shell

### Bewust Niet Uitgevoerd In Deze Milestone
- geen wijziging van pagina-inhoud of paginavolgorde
- geen componentrefactor van cards, tabellen of chartblokken
- geen wijziging van productspecifieke payloads
- geen regeneratie van canonieke voorbeeldrapporten

## Report Rebrand Milestone 3 — Shared Componentlaag In De Actieve Story Builder
### Wat Is Afgerond
- [x] gedeelde kolomlayout-helper toegevoegd en toegepast in de actieve rebrand-flow
- [x] gedeelde data-table helper toegevoegd en toegepast voor actieve factor- en distributietabellen
- [x] gedeeld `FocusQuestionBlock`-patroon toegevoegd voor de actieve focusvragenpagina
- [x] actieve quote-weergave hergebruikt nu de gedeelde quote-card helper
- [x] actieve risk-badge achtergronden en actieve accentkleuren omgeleid naar centrale tokens in plaats van losse kleurcodes
- [x] actieve rebrand-flow smoke-tested voor zowel ExitScan als RetentieScan via de live `_build_rebrand_story`-route

### Binnen Scope Uitgevoerd
- componentrefactor in de actieve reportflow
- hergebruik van gedeelde cards/badges/tables/layouts in de live rebrand-route
- verwijdering van actieve hardcoded componentkleuren in de live rebrand-route waar milestone 3 ze raakte

### Bewust Niet Uitgevoerd In Deze Milestone
- geen nieuwe paginavolgorde per product
- geen inhoudelijke herschrijving van hypotheses, managementduiding of methodiektekst
- geen wijziging van berekeningen, scores, mappings, classificaties, thresholds, surveylogica of productlogica
- geen opschoning van de legacy/unreachable reporttak buiten de actieve route

## Report Rebrand Milestone 4 — Core Pagina-Hercompositie Volgens De Goedgekeurde Spec
### Wat Is Afgerond
- [x] cover vereenvoudigd naar een strakkere `CoverBlock`-compositie:
  - product-pill
  - hoofdtitel
  - subtitelregel
  - meta onderaan
  - geen executive- of metricblokken meer op de cover
- [x] executive summary herschikt zodat de linker kolom nu expliciet de bestaande managementprose uit `management_summary_payload["executive_intro"]` draagt
- [x] responsoverzicht en trend omgezet naar een `MetricBand`-achtige compositie in de executive page in plaats van losse covercards
- [x] factoranalyse-pagina gecorrigeerd naar een expliciete `Factoranalyse`-hoofdpagina in plaats van hergebruik van productspecifieke signal-page titels
- [x] factorcards op de factoranalyse-pagina omgezet naar een rustiger `InfoCard`-achtige grid via gedeelde card flowables
- [x] methodiekpagina hercomposed naar:
  - info-cards voor leeswijzer en methodische notities
  - data tables voor opbouw en bandinterpretatie
  - behoud van bestaande methodische trust-notes zonder inhoudsverlies

### Binnen Scope Uitgevoerd
- visuele en structurele hercompositie van de vier kernpagina’s
- verplaatsing van bestaande inhoud tussen cover en executive page zonder semantische wijziging
- verdere uitlijning van de actieve rebrand-flow op de goedgekeurde designspec

### Bewust Niet Uitgevoerd In Deze Milestone
- geen productspecifieke middenpagina-herordening
- geen wijziging van risico-/preventiepagina of wat-nu-pagina buiten wat al in milestone 3 bestond
- geen overflowlogica of productspecifieke pagina-5/6/6B-pass uit milestone 5

## Report Rebrand Milestone 5 — Productspecifieke Middenpagina’s En Overflowlogica
### Wat Is Afgerond
- [x] ExitScan risico- en preventieflow aangescherpt zodat open survey-signalen niet meer in de hoofdkaart geperst worden maar als expliciete vervolgpagina landen binnen dezelfde sectie
- [x] RetentieScan risico- en preventiepagina opgeschoond zodat de hoofdsectie gericht blijft op gauge, distributie en signaalduiding zonder dubbele trendherhaling
- [x] RetentieScan `Behoudsplaybooks` verplaatst naar een aparte vervolgpagina na `Wat nu?`, conform de afgesproken 6B-logica
- [x] `Segment deep dive` bewust secundair gehouden als aanvullende noot binnen de retention-vervolglaag in plaats van een nieuwe hoofdsectie
- [x] actieve rebrand-route smoke-tested op beide productspecifieke overflowpaden zonder wijziging van inhoudelijke payloads of rapportlogica

### Binnen Scope Uitgevoerd
- productspecifieke visuele en structurele herordening van middenpagina’s binnen de actieve rebrand-route
- gecontroleerde vervolgpagina’s voor bestaande inhoud zodra behoud van leesbaarheid daarom vroeg
- expliciete productscheiding tussen ExitScan open signalen en RetentieScan playbooks

### Bewust Niet Uitgevoerd In Deze Milestone
- geen wijziging van berekeningen, scores, mappings, classificaties, thresholds, methodische claims, surveylogica of productlogica
- geen inhoudelijke herschrijving van quotes, hypotheses, managementduiding, inzichten of playbooktekst
- geen regeneratie van canonieke voorbeeldrapporten zolang de bestaande generatorblokker buiten report-scope actief blijft

## Report Rebrand Milestone 6 — Finale Regressie, Voorbeeldassets En Planvastlegging
### Wat Is Afgerond
- [x] canonieke ExitScan- en RetentieScan-voorbeeldrapporten opnieuw gegenereerd via `generate_voorbeeldrapport.py`
- [x] buyer-facing docs-assets en publieke websitekopieën opnieuw gesynchroniseerd:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`
  - `frontend/public/examples/voorbeeldrapport_verisight.pdf`
  - `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`
- [x] finale regressie uitgevoerd op:
  - generatorroute
  - productspecifieke vervolglabels
  - paginatelling
  - byte-for-byte gelijkheid tussen docs- en public-kopieën
- [x] planvastlegging bijgewerkt met milestone-6-uitkomst, QA en vervolgpunten

### Binnen Scope Uitgevoerd
- regeneratie van buyer-facing voorbeeldassets met bestaande rapportinhoud en bestaande synthetische datalogica
- synchronisatie van de repo-normset en de publieke showcasekopieën
- regressievalidatie op de actieve report-output zonder wijziging van API-contracten of inhoudelijke productlogica

### Bewust Niet Uitgevoerd In Deze Milestone
- geen wijziging van berekeningen, scores, mappings, classificaties, thresholds, methodische claims, surveylogica of productlogica
- geen inhoudelijke herschrijving van buyer-facing copy, hypotheses, managementduiding of methodiek
- geen schemafix voor de bestaande Postgres-generatorroute buiten report-scope; de succesvolle regeneratie liep via een tijdelijke SQLite-override

## Report Rebrand Follow-up — Buyer-facing Paginacount Recalibratie
### Wat Is Afgerond
- [x] actieve rebrand-flow compacter gemaakt zonder inhoudelijke wijzigingen aan payloads, berekeningen of productlogica
- [x] executive, factoranalyse, focusvragen, risico-/preventie, actie- en methodieksecties structureel gecompacteerd
- [x] canonieke ExitScan- en RetentieScan-voorbeeldrapporten opnieuw gegenereerd na de compactie
- [x] buyer-facing paginatelling teruggebracht van:
  - ExitScan: 15 → 7 pagina’s
  - RetentieScan: 14 → 7 pagina’s
- [x] laatste overflowpagina’s geabsorbeerd in de hoofdflow:
  - ExitScan: open survey-signalen nu binnen de risico-/actie-overgang
  - RetentieScan: `Behoudsplaybooks` nu binnen de actiehoofdpagina

### Binnen Scope Uitgevoerd
- compactere tabellen, cards, spacings en typografische schaal in de actieve rebrand-route
- omzetting van sommige stacked card-secties naar compactere tabellen of metric bands
- herverpakking van bestaande inhoud zonder wijziging van betekenis, scores, methodiek of surveylogica
- verwijdering van de laatste harde page breaks waar de inhoud na compacte hercompositie binnen de hoofdflow paste

### Bewust Niet Uitgevoerd In Deze Follow-up
- geen wijziging van berekeningen, scores, mappings, classificaties, thresholds, methodische claims, surveylogica of productlogica
- geen schrappen van inhoud; alleen compactere visualisatie en minder duplicatieve spill tussen pagina’s
- geen schemafix voor de standaard Postgres-generatorroute buiten report-scope

## Report Rebrand QA
### Welke QA Is Uitgevoerd
- statische codelezing van:
  - `backend/report.py`
  - `backend/report_design.py`
  - `backend/products/exit/report_content.py`
  - `backend/products/retention/report_content.py`
  - `backend/scan_definitions.py`
- tekstextractie en vergelijking van:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`
- controle van de huidige render-entry via `backend/main.py`
- controle van de huidige worktree op al aanwezige reportwijzigingen
- `python -m py_compile backend/report.py backend/report_design.py`
- standalone milestone-2 shell smoke render naar:
  - `Verisight/.codex-logs/report-shell-smoke.pdf`
- gerichte controle op resterende header/footer encoding-artefacten in:
  - `backend/report_design.py`
- actieve milestone-3 smoke renders via `_build_rebrand_story` naar:
  - `Verisight/.codex-logs/milestone3-exit-smoke.pdf`
  - `Verisight/.codex-logs/milestone3-retention-smoke.pdf`
- actieve milestone-4 smoke renders via `_build_rebrand_story` naar:
  - `Verisight/.codex-logs/milestone4-exit-smoke.pdf`
  - `Verisight/.codex-logs/milestone4-retention-smoke.pdf`
- actieve milestone-5 smoke renders via `_build_rebrand_story` naar:
  - `Verisight/.codex-logs/milestone5-exit-smoke.pdf`
  - `Verisight/.codex-logs/milestone5-retention-smoke.pdf`
- milestone-6 canonieke voorbeeldgeneratie via `generate_voorbeeldrapport.py` met tijdelijke `DATABASE_URL`-override naar lokale SQLite:
  - ExitScan opnieuw gegenereerd naar `docs/examples/voorbeeldrapport_verisight.pdf` en `frontend/public/examples/voorbeeldrapport_verisight.pdf`
  - RetentieScan opnieuw gegenereerd naar `docs/examples/voorbeeldrapport_retentiescan.pdf` en `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`
- post-plan generatorherstel zonder handmatige override:
  - `python -m py_compile backend/models.py generate_voorbeeldrapport.py`
  - `python generate_voorbeeldrapport.py exit` slaagt nu op een automatisch geisoleerde SQLite demo-database
  - `python generate_voorbeeldrapport.py retention` slaagt nu op een automatisch geisoleerde SQLite demo-database
  - directe Postgres/Supabase writes voor demo-generatie worden bewust vermeden
  - na regeneratie blijven de canonieke buyer-facing PDFs op 7 pagina's per product
  - na regeneratie blijven `docs/examples` en `frontend/public/examples` per product byte-for-byte gelijk
- gerichte controle dat de actieve rebrand-route nu gedeelde helpers gebruikt voor:
  - kolomlayouts
  - datatabellen
  - focusvraagblokken
- gerichte controle dat de milestone-4 compositie nu:
  - covercontent slanker maakt
  - managementprose op de executive page zet
  - factoranalyse een vaste H1 geeft
  - methodieknotities als info-cards structureert
- gerichte controle op resterende hardcoded kleuren/fonts in de actieve rebrand-route:
  - resterende oude `Helvetica`/blauwrefs zitten nog in legacy helperblokken buiten de actieve `_build_rebrand_story`-route
- PDF-tekstcontrole op productspecifieke vervolglabels:
  - `milestone5-exit-smoke.pdf` bevat `Risico- en preventieanalyse (vervolg)` en bevat geen `Behoudsplaybooks`
  - `milestone5-retention-smoke.pdf` bevat `Behoudsplaybooks` en `Segment deep dive` en bevat geen `Risico- en preventieanalyse (vervolg)`
- finale hash- en bestandscontrole:
  - `docs/examples/voorbeeldrapport_verisight.pdf` en `frontend/public/examples/voorbeeldrapport_verisight.pdf` zijn byte-for-byte gelijk
  - `docs/examples/voorbeeldrapport_retentiescan.pdf` en `frontend/public/examples/voorbeeldrapport_retentiescan.pdf` zijn byte-for-byte gelijk
- milestone-6 eerste paginapass op canonieke voorbeeldrapporten:
  - ExitScan buyer-facing voorbeeldrapport telde 15 pagina’s en bevatte `Risico- en preventieanalyse (vervolg)`
  - RetentieScan buyer-facing voorbeeldrapport telde 14 pagina’s en bevatte `Behoudsplaybooks`
- expliciete generatorvalidatie:
  - standaardrun via de bestaande Postgres-config faalt nog steeds op de bestaande schema mismatch buiten report-scope
  - tijdelijke SQLite-override maakt canonieke regeneratie wel mogelijk zonder codewijziging
- post-plan paginacount-recalibratie:
  - `python -m py_compile backend/report.py backend/report_design.py`
  - canonieke voorbeeldgeneratie via `generate_voorbeeldrapport.py` met tijdelijke SQLite-override na compacte hercompositie
  - tussenliggende buyer-facing paginacontrole na compacte hercompositie:
    - ExitScan telde 8 pagina’s
    - RetentieScan telde 8 pagina’s
  - finale buyer-facing paginacontrole na laatste overflowabsorptie:
    - ExitScan telt nu 7 pagina’s
    - RetentieScan telt nu 7 pagina’s
  - finale productspecifieke inhoudscontrole:
    - ExitScan bevat nog steeds open survey-signalen, maar niet meer als losse vervolgpagina
    - RetentieScan bevat nog steeds `Behoudsplaybooks`, maar niet meer als losse vervolgpagina
  - finale hashcontrole:
    - `docs/examples/voorbeeldrapport_verisight.pdf` en `frontend/public/examples/voorbeeldrapport_verisight.pdf` blijven byte-for-byte gelijk
    - `docs/examples/voorbeeldrapport_retentiescan.pdf` en `frontend/public/examples/voorbeeldrapport_retentiescan.pdf` blijven byte-for-byte gelijk

### Welke Bestanden Zijn Aangepast
- `PLANS.md`
- `backend/report.py`
- `backend/report_design.py`
- `backend/models.py`
- `generate_voorbeeldrapport.py`
- `docs/examples/voorbeeldrapport_verisight.pdf`
- `docs/examples/voorbeeldrapport_retentiescan.pdf`
- `frontend/public/examples/voorbeeldrapport_verisight.pdf`
- `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

### Wat Nog Openstaat
- geen volgende milestone binnen dit report-rebrandplan zonder nieuwe instructie
- post-plan follow-up alleen indien gewenst:
  - als directe demo-seeding in de echte Postgres/Supabase omgeving ooit gewenst is, vraagt dat een aparte scoped aanpak rond auth/triggers en bestaande live-schema-afwijkingen

### Welke Risico’s Of Follow-ups Zijn Ontdekt
- De milestone-5 smoke fixtures zijn bewust inhoudsrijk opgezet om de overflowpaden af te dwingen en renderden daardoor op 14 pagina’s per product. Dat is bruikbaar als structurele QA, maar geen vervanging voor buyer-facing validatie op de canonieke voorbeeldrapporten.
- Milestone 5 splitst ExitScan open survey-signalen nu bewust af naar een vervolgpagina binnen `Risico & Preventie`, en RetentieScan playbooks naar een aparte vervolgpagina na `Wat nu?`. De inhoud blijft gelijk, maar de definitieve buyer-facing paginatelling moet nog worden bevestigd zodra de voorbeeldgenerator weer bruikbaar is.
- De milestone-6 eerste canonieke buyer-facing regeneratie bevestigde dat de actieve rebrand-output inhoud behield, maar toen nog uitkwam op 15 pagina’s voor ExitScan en 14 pagina’s voor RetentieScan. Dat overschreed de bedoelde 7-pagina kernstructuur en vormde de aanleiding voor de latere compactiepass.
- De post-plan compactie heeft dat calibratierisico volledig teruggebracht voor de buyer-facing voorbeeldoutput: beide canonieke voorbeeldrapporten staan nu op 7 pagina’s. Nieuwe regressies op paginatelling moeten vanaf hier als expliciete afwijking worden behandeld.
- De standaard voorbeeldgenerator is niet langer afhankelijk van een handmatige SQLite-override. De huidige structurele oplossing is dat `generate_voorbeeldrapport.py` bij een niet-SQLite `DATABASE_URL` automatisch uitwijkt naar een geisoleerde lokale demo-database.
- Directe writes naar de echte Postgres/Supabase omgeving blijven bewust buiten scope voor deze generatorroute. De live omgeving bevat auth-triggergedrag en resterende schema-afwijkingen die aparte afstemming vragen als dat later alsnog nodig is.
- In `backend/report.py` staat nog steeds een grote legacy/unreachable reporttak; zolang die niet expliciet wordt opgeschoond of afgeschermd blijft dat een implementatierisico voor latere milestones.
- De goedgekeurde design spec vraagt `IBM Plex Sans Light`, maar die fontfile ontbreekt nog in `backend/assets/fonts`; de huidige shell gebruikt daarom gecontroleerde fallback. Als exacte covertypografie vereist is, moet die asset eerst expliciet worden toegevoegd in een latere milestone.
- Een eerste milestone-3 smoke fixture voor RetentieScan miste tijdelijk het veld `key` in de mock `retention_themes`; dat bleek een testfixture-risico en geen fout in de reportflow zelf. De uiteindelijke smoke render is daarna wel groen.
- Een eerste milestone-4 executive compositie met alle 3 risicokaarten plus 2 sterke factoren in één rechterkolom bleek te hoog voor de pagina. De uiteindelijke compositie houdt de hoofd-kolommen renderbaar door de sterke factoren in een aparte volle-breedterij onder de executive hoofdkolommen te plaatsen.

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
## Bestuurlijke Stuurinfo In Rapporten — 2026-04-17
### Wat Is Afgerond
- [x] compacte bestuurlijke stuurinfo methodisch zuiver teruggebracht in de actieve PDF-flow
- [x] ExitScan toont `Eerdere signalering` alleen nog als executive card wanneer `signal_visibility_score` daadwerkelijk aanwezig is in de brondata
- [x] ExitScan-risicopagina claimt `Eerdere signalering` niet meer in de zichtbare intro wanneer die brondata ontbreekt
- [x] RetentieScan toont `Wat als je niets doet` als compacte executive card op basis van bestaande surveygedragen metrics
- [x] open signalen zijn strakker gated:
  - ExitScan toont alleen `Open signalen met besliswaarde` wanneer er voldoende relevante open antwoorden zijn
  - RetentieScan opent geen los open-antwoorden-prioriteitsspoor meer in `Wat nu?`
- [x] eigenaar, eerste stap en reviewmoment staan zichtbaar alleen in `Wat nu?`

### Aangepaste Bestanden
- `backend/report.py`
- `backend/products/retention/report_content.py`
- `docs/examples/voorbeeldrapport_verisight.pdf`
- `docs/examples/voorbeeldrapport_retentiescan.pdf`
- `frontend/public/examples/voorbeeldrapport_verisight.pdf`
- `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

### QA Uitgevoerd
- `python -m py_compile` op:
  - `backend/report.py`
  - `backend/products/exit/report_content.py`
  - `backend/products/retention/report_content.py`
- voorbeeldgenerator opnieuw uitgevoerd via:
  - `python generate_voorbeeldrapport.py exit`
  - `python generate_voorbeeldrapport.py retention`
- PDF-tekstcontrole op de actieve output:
  - ExitScan bevat geen zichtbare verwijzing naar `Eerdere signalering` wanneer `signal_visibility_score` ontbreekt in de demo-data
  - RetentieScan bevat wel `Wat als je niets doet` in de executive summary
  - ExitScan bevat `Open signalen met besliswaarde` alleen op de risico-/preventiepagina
  - eigenaar / eerste stap / reviewmoment verschijnen zichtbaar in `Wat nu?`
- paginacontrole:
  - ExitScan voorbeeldrapport = 7 pagina’s
  - RetentieScan voorbeeldrapport = 7 pagina’s
- hashcontrole:
  - `docs/examples/voorbeeldrapport_verisight.pdf` == `frontend/public/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf` == `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

### Wat Nog Openstaat
- geen aanvullende implementatiestap binnen deze scope; de rapport-PDF’s volgen nu de afgesproken scheiding tussen executive stuurinfo, verificatie en routekeuze

### Risico’s En Follow-ups
- de huidige demo-exitdataset bevat geen `signal_visibility_score`; daardoor verschijnt `Eerdere signalering` in het ExitScan-voorbeeld nu bewust niet als executive card
- als toekomstige ExitScan-demo- of echte datasets dit veld wel vullen, verschijnt de executive card automatisch zonder verdere codewijziging
- in `backend/report.py` bestaan nog legacy/fallbackblokken buiten de actieve rebrand-route; die beïnvloeden de buyer-facing voorbeeldrapporten nu niet, maar verdienen later gerichte cleanup
- de actieve RetentieScan-summary noemt open antwoorden niet meer in de executive intro; open tekst blijft alleen zichtbaar waar die verificatie of duiding daadwerkelijk verscherpt
- deze implementatieslag raakt bewust alleen de PDF-rapporten en niet het dashboard
