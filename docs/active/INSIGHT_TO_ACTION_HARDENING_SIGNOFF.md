# INSIGHT_TO_ACTION_HARDENING_SIGNOFF

Last updated: 2026-04-19
Status: active
Source of truth: this signoff reflects the hardened generator behavior after copy-softening, dedupe and compact report rendering were added.

## Titel

Insight-to-Action Generator - Hardening Signoff

## Korte samenvatting

De hardeningronde is afgerond. De generator heeft nu expliciete taalfilters, dedupe-regels en compactere reportrendering waardoor de output proportioneel blijft en de ExitScan-architectuur niet oprekt.

## Wat is gebouwd

- copy-softening toegevoegd aan backend en frontend generatorhelpers
- dedupe expliciet gemaakt voor verificatievragen en mogelijke eerste acties
- reportweergave compacter gemaakt zodat de routepagina geen extra pagina toevoegt
- extra hardeningtests toegevoegd voor assertievere input en duplicate bronstrings

## Belangrijkste bevindingen

- De hardening was functioneel nodig; zonder compacte reportweergave schoof de routeoutput een extra pagina in.
- De gekozen softening-set is klein maar effectief: gericht op de woorden die het snelst overclaiming veroorzaken.
- De bestaande guardrail note blijft belangrijk als expliciete leesgrens naast de stillere softeninglaag.

## Belangrijkste risico's

- Toekomstige productcopy kan nog steeds nieuwe assertieve termen introduceren buiten de huidige replacement-set.
- Dashboard en report blijven twee runtimes; parity blijft dus afhankelijk van tests en canonbewaking.
- Er zijn nog bestaande scoring-tests die losstaan van deze feature en rood blijven.

## Beslissingen / canonvoorstellen

- Hardening hoeft niet slim of probabilistisch te zijn; simpele expliciete vervangingen en dedupe zijn voor MVP betrouwbaarder.
- Reportcompactheid wint boven volledigheid zolang de 3/5/3/30-60-90 shape zichtbaar blijft.
- Guardrail failures buiten deze replacement-set moeten eerst via tests zichtbaar worden gemaakt voordat meer normalisatie wordt toegevoegd.

## Concrete wijzigingen

- Nieuw bestand toegevoegd: `docs/active/INSIGHT_TO_ACTION_HARDENING_SIGNOFF.md`
- Hardeningcode in:
  - `backend/insight_to_action.py`
  - `frontend/lib/products/shared/insight-to-action.ts`
- Hardeningtests in:
  - `tests/test_insight_to_action.py`
  - `frontend/lib/products/shared/insight-to-action.test.ts`

## Validatie

- groen:
  - `python -m pytest tests/test_insight_to_action.py tests/test_report_generation_smoke.py -q`
  - `npm.cmd test -- --run lib/products/shared/insight-to-action.test.ts lib/products/exit/dashboard.test.ts lib/products/retention/dashboard.test.ts`
  - `npm.cmd run lint -- "app/(dashboard)/campaigns/[id]/page.tsx" "components/dashboard/insight-to-action-panel.tsx" "lib/products/shared/insight-to-action.ts" "lib/products/shared/insight-to-action.test.ts"`
- gecontroleerd, maar niet featureblokkerend:
  - `python -m pytest tests/test_scoring.py tests/test_report_generation_smoke.py -q`
    - 4 pre-existente failures buiten deze feature

## Assumptions / defaults

- De huidige replacement-set is bedoeld als bounded hardening, niet als volledige taalpolicy-engine.
- Pre-existente failures in `tests/test_scoring.py` blijven buiten scope van deze signoff.
- Frontend build blijft afhankelijk van externe Supabase environment variables.

## Next gate

Final Validation: end-to-end beoordelen of de generator nu bruikbaar, proportioneel en architectuurveilig in report en dashboard landt.
