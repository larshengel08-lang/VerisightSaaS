# INSIGHT_TO_ACTION_PROJECT_SCAN

Last updated: 2026-04-19
Status: active
Source of truth: this scan is grounded in the committed ExitScan and RetentieScan runtime, the active report-to-action program docs, the fixed ExitScan report canon, and the current dashboard decision-support layer.

## Titel

Insight-to-Action Generator - Project Scan And Landing Audit

## Korte samenvatting

Verisight heeft al een stevige report-to-action basis in rapport, dashboard en onboarding. De grootste open ruimte zit niet in "nog meer actiecopy", maar in een compacte afgeleide laag die de bestaande signalen vertaalt naar een management-bruikbare first-step package: 3 managementprioriteiten, 5 verificatievragen, 3 mogelijke eerste acties en een 30-60-90 follow-up structuur. Die laag moet landen als afgeleide van bestaande product truth, niet als nieuwe interpretatiemotor die buiten de huidige methodiek treedt.

## Wat is geaudit

- `docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md`
- `docs/ops/CLIENT_REPORT_TO_ACTION_FLOW.md`
- `docs/active/MANAGEMENT_ACTIONABILITY_PLAN.md`
- `docs/active/REPORT_STRUCTURE_CANON.md`
- `docs/active/PRODUCT_LANGUAGE_CANON.md`
- `docs/reference/METHODOLOGY.md`
- local hardening reference observed outside this git baseline: `docs/reporting/REPORT_METHODOLOGY_CANON.md`
- `backend/report.py`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/components/dashboard/action-playbook-list.tsx`
- `frontend/lib/products/exit/dashboard.ts`
- `frontend/lib/products/retention/dashboard.ts`
- `frontend/lib/products/shared/types.ts`
- `tests/test_scoring.py`
- `tests/test_report_generation_smoke.py`

## Belangrijkste bevindingen

- Rapport -> actie bestaat al op drie lagen:
  - report `next_steps_payload` in `backend/products/*/report_content.py`
  - PDF rendering van `session_cards` en `steps` in `backend/report.py`
  - dashboard `followThroughCards`, focusvragen en playbooks in `frontend/lib/products/*/dashboard.ts` plus de campaign page
- ExitScan is de huidige sterkste embedded baseline voor managementtaal, route-opbouw en claimsgrenzen.
- De vaste ExitScan architectuur `P1-P10 + Appendix` is al expliciet vastgezet en wordt getest in `tests/test_report_generation_smoke.py`.
- De bestaande route bevat al veel van de toekomstige generatorinhoud, maar nog verspreid:
  - dashboard timelines bevatten `Prioriteit nu`, `Eerste gesprek`, `Wie moet aan tafel`, `Eerste eigenaar`, `Eerste actie`, `Reviewmoment`
  - `RecommendationList` bevat verificatievragen per factor
  - `ActionPlaybookList` bevat eerste besluit, eigenaar, validatie, logische acties en reviewmoment
  - report `next_steps_payload` bevat sessie-intro, session cards en een vaste stappenroute
- De open productkans is daarom geen nieuw advieskader, maar een compacte synthese bovenop bestaande signalen en routing-elementen.
- De logischste landingsplek voor de feature is een gedeelde generatorlaag die door zowel report payloads als dashboard view models gevoed kan worden.
- Het huidige systeem bewaart report output vooral als render-afleiding; er is nog geen expliciete opslaglaag voor een "insight-to-action" object.
- Methodologische guardrails zijn inhoudelijk al sterk aanwezig in definitions, report content en tests, maar nog niet als expliciete generatorcanon vastgelegd.
- Een relevante methodologiebron (`docs/reporting/REPORT_METHODOLOGY_CANON.md`) bestaat op dit moment alleen in de hardening workspace en nog niet in deze featurebranch-baseline. Dat maakt boundary-verankering belangrijker dan bron-copy.

## Belangrijkste risico's

- Een generator die te vrij samenvat kan onbedoeld hardere causaliteit, zekerheid of interventie-impact suggereren dan de huidige rapportlaag draagt.
- Een generator die zelfstandig nieuwe "inzichten" bedenkt zou concurreren met de bestaande management summary, bestuurlijke handoff en factor-playbooks.
- Een generator die in ExitScan nieuwe pagina's of andere page-order vraagt, botst direct met de vaste `P1-P10 + Appendix` canon.
- Een generator die zijn input los trekt van productmodules kan drift veroorzaken tussen PDF, dashboard en buyer-facing mirrors.
- Een generator zonder duidelijke dedupe-regels gaat bestaande vragen, acties en reviewcopy herhalen in plaats van structureren.
- Een generator die geen distinction maakt tussen ExitScan en RetentieScan verliest het verschil tussen vertrekduiding en verification-first behoudsduiding.

## Beslissingen / canonvoorstellen

- Bouw de feature als afgeleide generator bovenop bestaande signalen, niet als nieuw scorings- of redeneermodel.
- Houd de eerste scope beperkt tot `exit` en `retention`, omdat daarvoor al de rijkste report-to-action contractlaag bestaat.
- Gebruik alleen bestaande truth inputs:
  - top focus labels / top factor keys
  - bestaande management summary / handoff intent
  - bestaande focusvragen
  - bestaande action playbooks
  - bestaande next-step payloads
  - huidige scan-specific language canon
- Laat de generator landen op twee outputvlakken:
  - report closeout / route-laag als afgeleide van `next_steps_payload`
  - dashboard route-sectie als extra compacte management-bruikbare synthese
- Voeg geen nieuw productverhaal of nieuwe report-architectuur toe; de feature moet in bestaande slots renderen.
- Behandel de generatoroutput als ondersteunende managementstructuur, niet als beslissend advies.

## Concrete wijzigingen

- Nieuwe scanfile toegevoegd: `docs/active/INSIGHT_TO_ACTION_PROJECT_SCAN.md`
- Landingsaudit vastgelegd voor report, dashboard, tests en canonbronnen
- Bestaande generatorkandidaten geclusterd in:
  - signal source layer
  - routing layer
  - render layer
  - validation layer

## Validatie

- De scan is direct herleidbaar naar committed runtimebestanden in backend, frontend en tests.
- De scan bevestigt dat de feature op bestaande product truth kan leunen zonder metriclogica te wijzigen.
- De scan bevestigt dat de ExitScan architectuur onaangetast moet blijven en alleen bestaande route-slots gebruikt mogen worden.

## Assumptions / defaults

- De feature start op de committeerde baseline van `codex/suite-hardening-parity-normalization`, niet op onopgeslagen workspace-wijzigingen.
- De lokale methodologiecanon buiten deze branch wordt alleen als auditinput behandeld, niet als automatisch overgenomen source of truth.
- `ExitScan` en `RetentieScan` zijn de enige verplichte MVP-routes voor deze generator.
- De generator hoeft in de MVP geen database-persistent object te introduceren als render-time afleiding voldoende is.

## Next gate

Generator Design And Canon: expliciet vastleggen wat de generator wel en niet mag afleiden, welke inputset canoniek is, en welke outputvorm management bruikbaar blijft zonder overclaiming.
