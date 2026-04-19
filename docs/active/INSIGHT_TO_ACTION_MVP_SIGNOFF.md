# INSIGHT_TO_ACTION_MVP_SIGNOFF

Last updated: 2026-04-19
Status: active
Source of truth: this signoff reflects the MVP implementation currently on branch `codex/insight-to-action-generator`.

## Titel

Insight-to-Action Generator - MVP Signoff

## Korte samenvatting

De MVP van de Insight-to-Action Generator is nu werkend op de branch. De feature bouwt een bounded managementpakket op uit bestaande report- en dashboardsignalen voor `ExitScan` en `RetentieScan`, zonder metriclogica, ExitScan-architectuur of methodische claims te wijzigen.

## Wat is gebouwd

- backend helper toegevoegd in `backend/insight_to_action.py`
- report pipeline uitgebreid zodat `next_steps_payload` een `insight_to_action` blok krijgt
- report routepagina uitgebreid met compacte generatoroutput plus 30-60-90 follow-up weergave
- frontend helper toegevoegd in `frontend/lib/products/shared/insight-to-action.ts`
- dashboard component toegevoegd in `frontend/components/dashboard/insight-to-action-panel.tsx`
- campaign route uitgebreid zodat de nieuwe output in de bestaande route-sectie wordt gerenderd voor `exit` en `retention`
- nieuwe backend en frontend tests toegevoegd voor shape en bounded language
- PDF smoke uitgebreid zodat zichtbaarheid van de nieuwe report-output wordt getoetst

## Belangrijkste bevindingen

- Render-time derivation was voldoende voor MVP; er was geen nieuwe storage- of API-laag nodig.
- De generator kan veilig leunen op bestaande follow-through, hypothesis- en playbookbronnen.
- De eerste PDF-iteratie werd te zwaar en schoof een extra pagina in; de uiteindelijke routepagina is daarom compacter gemaakt door de generator als synthese te tonen in plaats van bovenop de oude actiekaarten.
- Dashboard en report delen nu dezelfde shape, terwijl de tekst per runtime bounded mag blijven verschillen.

## Belangrijkste risico's

- Frontend production build faalt nog zonder Supabase environment variables; dat is een bestaande omgevingsbeperking en geen regressie uit deze feature.
- De bredere Python regressies in `tests/test_scoring.py` blijven bestaan buiten deze feature en vragen los herstel.
- De MVP gebruikt nog runtime-specifieke helpers; drift moet daarom in de hardening- en validation-fase actief bewaakt worden.

## Beslissingen / canonvoorstellen

- MVP-scope blijft beperkt tot `exit` en `retention`.
- Report-output blijft compact binnen de bestaande routepagina om de ExitScan architectuur onaangetast te laten.
- De generator wordt gepositioneerd als managementbridge en niet als adviesengine.
- `30-60-90` blijft een opvolgstructuur en geen effect- of implementatiegarantie.

## Concrete wijzigingen

- Nieuw bestand toegevoegd: `docs/active/INSIGHT_TO_ACTION_MVP_SIGNOFF.md`
- Nieuwe backend code:
  - `backend/insight_to_action.py`
  - `backend/report.py`
- Nieuwe frontend code:
  - `frontend/lib/products/shared/insight-to-action.ts`
  - `frontend/components/dashboard/insight-to-action-panel.tsx`
  - `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Nieuwe of uitgebreide tests:
  - `tests/test_insight_to_action.py`
  - `tests/test_report_generation_smoke.py`
  - `frontend/lib/products/shared/insight-to-action.test.ts`

## Validatie

- groen:
  - `python -m pytest tests/test_insight_to_action.py tests/test_report_generation_smoke.py -q`
  - `npm.cmd test -- --run lib/products/shared/insight-to-action.test.ts lib/products/exit/dashboard.test.ts lib/products/retention/dashboard.test.ts`
- niet groen, maar buiten feature-scope:
  - `python -m pytest tests/test_scoring.py tests/test_report_generation_smoke.py`
    - 4 pre-existente failures in `tests/test_scoring.py`
  - `npm.cmd run build`
    - faalt zonder Supabase env vars op `/signup`

## Assumptions / defaults

- De generator gebruikt bestaande factorprioritering en voegt geen nieuwe rankinglogica toe.
- Compacte reportweergave heeft voorrang boven volledige textual parity met dashboard.
- De hardeningfase scherpt nog taal- en dedupe-guardrails verder aan bovenop de MVP.

## Next gate

Hardening And Guardrails: overclaim- en repetitierisico verder terugdringen, expliciete language filters toevoegen en guardrail docs/signoff afronden.
