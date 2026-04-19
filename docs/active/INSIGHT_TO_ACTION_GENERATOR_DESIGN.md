# INSIGHT_TO_ACTION_GENERATOR_DESIGN

Last updated: 2026-04-19
Status: active
Source of truth: this design sits on top of the phase-1 project scan, the fixed ExitScan report canon, and the current report-to-action contract in backend and frontend product modules.

## Titel

Insight-to-Action Generator - Generator Design And Canon

## Korte samenvatting

De Insight-to-Action Generator wordt een bounded derivation layer bovenop bestaande Verisight-output. Hij voegt geen nieuwe analyse toe, maar maakt een compacte managementbrug van bestaand rapportmateriaal naar eerste opvolging. De generator leest bestaande signalen, vragen, acties en reviewlogica en herschikt die in een vaste managementset: 3 managementprioriteiten, 5 verificatievragen, 3 mogelijke eerste acties en een 30-60-90 follow-up structuur.

## Wat is geaudit

- `docs/active/INSIGHT_TO_ACTION_PROJECT_SCAN.md`
- `docs/active/INSIGHT_TO_ACTION_BOUNDARY_NOTES.md`
- `docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md`
- `docs/active/MANAGEMENT_ACTIONABILITY_PLAN.md`
- `docs/active/REPORT_STRUCTURE_CANON.md`
- `docs/active/PRODUCT_LANGUAGE_CANON.md`
- `backend/report.py`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `frontend/lib/products/exit/focus-questions.ts`
- `frontend/lib/products/exit/action-playbooks.ts`
- `frontend/lib/products/retention/focus-questions.ts`
- `frontend/lib/products/retention/action-playbooks.ts`
- `frontend/lib/products/exit/dashboard.ts`
- `frontend/lib/products/retention/dashboard.ts`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`

## Belangrijkste bevindingen

- De generator hoeft geen nieuwe inhoudelijke bron te introduceren; de benodigde input bestaat al in:
  - topfactorprioritering
  - bestaand `first_decision` / `first_action` / `review_moment`
  - focusvragen per factor en band
  - action playbooks per factor en band
  - hypotheses in de reportlaag
- Backend en frontend hebben niet exact dezelfde bronvorm, maar wel dezelfde truth-familie. De designdoelstelling moet daarom structurele parity zijn, geen letterlijke tekstparity.
- De huidige UX bevat al alle losse bouwstenen, maar nog niet als een vaste compacte management-output met exact 3/5/3/30-60-90.
- De beste ontwerpkeuze is een pure derivation helper per runtime:
  - backend helper voor report/PDF
  - frontend helper voor dashboard
  - beide helpers volgen dezelfde outputcanon en guardrails
- De generator moet expliciet "possible / bounded / verification-first" blijven, vooral bij RetentieScan en bij indicatieve responsniveaus.

## Belangrijkste risico's

- Een te vrije samenvatting maakt van bestaande signaallaag alsnog een impliciet adviesmodel.
- Exact 3/5/3 output afdwingen kan leiden tot vulling met zwakke of repetitieve items als dedupe en fallback ontbreken.
- Dashboard- en reportimplementaties kunnen uit elkaar gaan lopen als alleen de vorm en niet ook de selectiecanon wordt vastgelegd.
- Een 30-60-90 structuur kan onbedoeld als interventie-roadmap of effectgarantie gelezen worden in plaats van reviewritme.

## Beslissingen / canonvoorstellen

### 1. Wat de generator wel mag afleiden

- De generator mag bestaande prioriteiten rangschikken op basis van al gekozen topfactoren en bestaande routevelden.
- De generator mag verificatievragen selecteren, inkorten en dedupliceren uit bestaande vraagensets en hypothesevragen.
- De generator mag mogelijke eerste acties selecteren uit bestaande playbook-acties, `first_action`-velden en bestaande report action-lines.
- De generator mag een 30-60-90 follow-up structureren als bounded managementritme rond:
  - eerste toets
  - eerste review
  - herweging of vervolgmeting

### 2. Wat de generator niet mag afleiden

- Geen nieuwe factorrangorde
- Geen nieuwe diagnose
- Geen nieuwe causale uitleg
- Geen interventiezekerheid
- Geen effect- of ROI-claim
- Geen named owner of teamtoewijzing die niet al expliciet in de bestaande output zit

### 3. Canonieke inputs

- `scan_type`
- top focus labels / top focus keys
- bestaande managementroutevelden:
  - `first_decision`
  - `first_owner`
  - `first_action`
  - `review_moment`
  - `session_cards`
  - `steps`
- bestaande verificatiebronnen:
  - frontend focus questions
  - backend hypothesis questions
- bestaande actiedragers:
  - frontend action playbooks
  - backend hypothesis actions
  - `first_action`
- context flags:
  - voldoende respons voor patroonbeeld ja/nee
  - scan-specific mode: `exit` of `retention`

### 4. Canonieke outputlogica

- `management_priorities`
  - exact 3
  - prioriteit 1 = first route / top factor
  - prioriteit 2 = verificatie- of afbakeningsspoor
  - prioriteit 3 = owner/review discipline
- `verification_questions`
  - exact 5 wanneer bronmateriaal dat toelaat
  - anders zo veel mogelijk tot 5 zonder nieuwe inhoud te verzinnen
  - volgorde: top factor eerst, verbredende context daarna
- `possible_first_actions`
  - exact 3 wanneer bronmateriaal dat toelaat
  - formuleer altijd als mogelijke, begrensde eerste stap
  - geen programma-, transformatie- of suite-achtige taal
- `follow_up_30_60_90`
  - altijd 3 bounded checkpoints
  - 30 = toets en explicitering
  - 60 = review van gekozen stap en vroege beweging
  - 90 = herweging, vervolgmeting of bewust stoppen

### 5. Indicative-mode gedrag

- Bij minder robuuste basis mag de generator:
  - compacter zijn
  - meer verificatie- en minder actietaal gebruiken
  - explicieter begrenzen
- Bij minder robuuste basis mag de generator niet:
  - extra speculeren om alsnog 3 sterke prioriteiten te "vullen"

## Concrete wijzigingen

- Nieuw ontwerpbestand toegevoegd: `docs/active/INSIGHT_TO_ACTION_GENERATOR_DESIGN.md`
- Generatorcanon vastgelegd als bounded derivation model
- Exacte do-not-infer regels vastgelegd voor MVP en latere hardening

## Validatie

- Het ontwerp leunt volledig op bestaande producttruth-sources en vraagt geen wijziging in metriclogica.
- Het ontwerp houdt structural parity mogelijk tussen report en dashboard zonder een nieuw storage- of scoringmodel af te dwingen.
- Het ontwerp laat de ExitScan architectuur ongemoeid en positioneert de generator als route-afleiding, niet als architectuurwijziging.

## Assumptions / defaults

- MVP scope blijft `exit` en `retention`.
- Structural parity is voldoende zolang dezelfde broncategorieen en guardrails gelden.
- De generator hoeft in MVP geen literal copy parity tussen report en dashboard te bereiken.
- Als bestaande broninput minder dan 5 niet-repetitieve vragen of 3 bruikbare acties biedt, wint bounded eerlijkheid boven kunstmatige opvulling.

## Next gate

Output canon en implementation plan formaliseren: exact schema, rendering rules, trigger moment, storage strategy en file-level landingsstructuur vastleggen.
