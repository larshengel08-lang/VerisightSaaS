# Demo And Sample Environment Acceptance Checklist

Gebruik deze checklist wanneer demo-scenario's, seed-scripts, sample-assets of demo-playbooks wijzigen.
Laatste update: 2026-04-15

## Layer separation

- [ ] Buyer-facing showcase blijft gescheiden van internal sales demo.
- [ ] Internal sales demo blijft gescheiden van QA/live-fixtures.
- [ ] Validation-sandbox blijft lokaal en geen buyer-facing of sales-layer.
- [ ] ExitScan blijft de primaire eerste demo-route.
- [ ] RetentieScan blijft complementair en verification-first.

## Buyer-facing sample safety

- [ ] `generate_voorbeeldrapport.py` blijft de buyer-facing sample-pipeline.
- [ ] Actieve sample-pdf's blijven gespiegeld naar `frontend/public/examples`.
- [ ] Buyer-facing sample-assets gebruiken fictieve data en geen vertrouwelijkheidsframing.
- [ ] Geen buyer-facing asset wordt vervangen door een interne demo-tenant.

## Internal sales demo

- [ ] `sales_demo_exit` seedt alleen named campaigns in `verisight-sales-demo`.
- [ ] `sales_demo_retention` seedt alleen named campaigns in `verisight-sales-demo`.
- [ ] Internal sales demo gebruikt alleen veilige demo-maildomeinen.
- [ ] Internal sales demo bevat bruikbare campaign states voor empty, indicative en decision-ready storytelling.

## QA and validation

- [ ] `qa_exit_live_test` blijft action-safe en niet buyer-facing.
- [ ] `qa_retention_demo` blijft een aparte fixturelaag.
- [ ] `validation_retention_pilot` schrijft alleen naar lokale dummy-data paden.
- [ ] QA- en validation-scenario's worden niet als publieke prooflaag of standaard salesdemo ingezet.

## Demo data quality

- [ ] Demo-identiteiten zijn fictief en consistent.
- [ ] Response-drempels blijven zichtbaar:
  - detail vanaf 5
  - patroonbeeld vanaf 10
- [ ] Geen demo-state claimt rijkere segmentatie of hardere inzichten dan de echte productlaag draagt.
- [ ] RetentieScan trend- en segmentverdieping blijven verification-first.

## Docs and prompts

- [ ] `docs/reference/DEMO_AND_SAMPLE_ENVIRONMENT_SYSTEM.md` is actueel.
- [ ] `docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md` is actueel.
- [ ] `docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md` blijft de source of truth.
- [ ] `docs/prompts/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLANMODE_PROMPT.md` verwijst alleen naar actuele repo-truth.
- [ ] `PROMPT_CHECKLIST.xlsx` weerspiegelt de werkelijke repo-status.

## Smoke checks

- [ ] `python manage_demo_environment.py list --format json` werkt.
- [ ] `python manage_demo_environment.py run sales_demo_exit` werkt.
- [ ] `python manage_demo_environment.py run sales_demo_retention` werkt.
- [ ] Wrapper-scenario's voor QA en validation blijven bereikbaar via dezelfde orchestrator.
