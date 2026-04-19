# INSIGHT_TO_ACTION_GUARDRAILS

Last updated: 2026-04-19
Status: active
Source of truth: these guardrails reflect the hardened generator behavior now implemented in backend and frontend helpers.

## Titel

Insight-to-Action Generator - Guardrails

## Korte samenvatting

De generator is nu expliciet gehard tegen drie risico's: overclaiming, repetitie en te zware follow-up framing. De guardrails werken op vorm, selectie en taal. Daarmee blijft de output management-bruikbaar zonder te verschuiven naar diagnose, zekerheid of interventiegarantie.

## Wat is geaudit

- `backend/insight_to_action.py`
- `frontend/lib/products/shared/insight-to-action.ts`
- `tests/test_insight_to_action.py`
- `frontend/lib/products/shared/insight-to-action.test.ts`
- `docs/active/INSIGHT_TO_ACTION_BOUNDARY_NOTES.md`
- `docs/active/INSIGHT_TO_ACTION_OUTPUT_CANON.md`

## Belangrijkste bevindingen

- De eerste MVP was inhoudelijk correct, maar had baat bij explicietere post-processing voor taalverzachting.
- Dedupe is nodig omdat bronvragen en bronacties gemakkelijk dubbel terugkomen als topfactoren of heuristieken overlappen.
- Copy-guardrails werken beter als ze in helper-code zitten dan alleen in docs of tests.

## Belangrijkste risico's

- Zonder hardening kunnen bronstrings in latere productupdates te assertief worden overgenomen.
- Zonder dedupe voelt de output snel repetitief en daardoor minder management-waardig.
- Zonder expliciete softening kan een 30-60-90 follow-up te veel als implementatieplan voelen.

## Beslissingen / canonvoorstellen

- Harden op drie lagen:
  - `shape guardrails`
  - `language guardrails`
  - `render guardrails`
- Shape guardrails:
  - exact 3 managementprioriteiten
  - exact 5 verificatievragen wanneer bronmateriaal dat toelaat
  - exact 3 mogelijke eerste acties
  - exact 3 follow-up checkpoints
- Language guardrails:
  - vervang of verzacht hardere formuleringen zoals:
    - `oorzaak` -> `spoor`
    - `bewijs` -> `onderbouwing`
    - `oplossen` -> `gericht opvolgen`
    - `garanderen` -> `ondersteunen`
    - `zal leiden tot` -> `kan helpen bij`
- Render guardrails:
  - reportweergave blijft compact
  - generator vervangt route-duplicatie en stapelt niet onnodig bovenop bestaande actiekaarten
  - dashboardweergave blijft in de bestaande route-sectie

## Concrete wijzigingen

- Guardrail replacements toegevoegd in:
  - `backend/insight_to_action.py`
  - `frontend/lib/products/shared/insight-to-action.ts`
- Dedupe expliciet toegepast op verificatievragen en mogelijke eerste acties
- Hardeningtests toegevoegd voor:
  - duplicate input
  - assertievere bronwoorden
  - veilige softening in output

## Validatie

- groen:
  - `python -m pytest tests/test_insight_to_action.py tests/test_report_generation_smoke.py -q`
  - `npm.cmd test -- --run lib/products/shared/insight-to-action.test.ts lib/products/exit/dashboard.test.ts lib/products/retention/dashboard.test.ts`
- bevestigd:
  - output telt correct af naar 3/5/3/30-60-90
  - duplicaten worden verwijderd
  - hardere formuleringen worden afgezwakt voor renderoutput

## Assumptions / defaults

- Softening werkt op generatoroutput, niet als repo-brede text-normalizer.
- Negatieve guardrail-notes zoals `geen diagnose` of `geen individuele predictor` blijven toegestaan en worden niet afgezwakt.
- Verdere inhoudelijke hardening hoort thuis in productmodules, niet in deze generatorhelper.

## Next gate

Hardening signoff en final validation vastleggen op basis van de geverifieerde helpertests, PDF-smoke en frontend regressiepaden.
