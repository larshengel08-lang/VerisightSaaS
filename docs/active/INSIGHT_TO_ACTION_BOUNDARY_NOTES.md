# INSIGHT_TO_ACTION_BOUNDARY_NOTES

Last updated: 2026-04-19
Status: active
Source of truth: these notes bind the generator to the fixed ExitScan report canon, the current product language hierarchy, the report-to-action contract, and the live claims boundaries in backend definitions and report content.

## Titel

Insight-to-Action Generator - Boundary Notes

## Korte samenvatting

De Insight-to-Action Generator mag Verisight helpen van interpretatie naar eerste opvolging te gaan, maar alleen als begrensde afleiding van bestaand product truth. De generator mag geen nieuwe diagnose, causaliteit, voorspelclaim of interventiezekerheid introduceren. Hij mag structureren, prioriteren en verwoorden; hij mag niet "bewijzen", "verklaren" of "garanderen".

## Wat is geaudit

- `docs/active/REPORT_STRUCTURE_CANON.md`
- `docs/active/PRODUCT_LANGUAGE_CANON.md`
- `docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md`
- `docs/active/MANAGEMENT_ACTIONABILITY_PLAN.md`
- `docs/ops/CLIENT_REPORT_TO_ACTION_FLOW.md`
- `docs/reference/METHODOLOGY.md`
- local hardening reference observed outside this git baseline: `docs/reporting/REPORT_METHODOLOGY_CANON.md`
- `backend/products/exit/definition.py`
- `backend/products/retention/definition.py`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `frontend/lib/report-preview-copy.ts`
- `tests/test_scoring.py`
- `tests/test_reporting_system_parity.py`

## Belangrijkste bevindingen

- ExitScan language is explicitly bounded to:
  - terugkijkende vertrekduiding
  - signalen van werkfrictie
  - managementprioritering
  - geen diagnose
  - geen causale verklaring
  - geen individuele voorspelling
- RetentieScan language is explicitly bounded to:
  - vroegsignalering op behoud
  - groeps- en segmentduiding
  - verificatie en opvolging
  - geen brede MTO
  - geen individuele predictor
  - geen performance-instrument
- De bestaande route gebruikt al "verification-first" en "managementread" framing. De generator moet die lijn versterken en nooit overschrijven.
- De methodologische grens is niet alleen inhoudelijk maar ook structureel:
  - score-uitleg en trust blijven in de methodieklaag
  - actie blijft in route- en managementlaag
  - technische diepte blijft in de appendix
- De rapportarchitectuurgrens is hard:
  - ExitScan blijft `P1-P10 + Appendix`
  - `P9 - Eerste route & actie` is de primaire reportlandingsplek voor extra action synthesis
  - `P10` en `Appendix` blijven onaangeraakt in rol en volgorde

## Belangrijkste risico's

- Overclaiming risk:
  - prioriteiten formuleren als "dit is de oorzaak"
  - acties formuleren als "dit zal het probleem oplossen"
  - follow-up formuleren als "impactmeting" zonder gedragen bewijsbasis
- Drift risk:
  - generatorcopy wijkt af van bestaande dashboard- en reporttaal
  - output gebruikt termen die niet in de product language canon passen
- Architecture risk:
  - extra reportblokken of page-order veranderingen om de generator zichtbaar te maken
- Method risk:
  - generator gebruikt open signalen of topfactoren alsof ze sluitend bewijs zijn
  - generator combineert signalen tot zekerheidsclaims die de huidige methodologie niet ondersteunt
- UX risk:
  - output wordt te lang, te herhalend of te "consultancy-heavy" en verliest managementbruikbaarheid

## Beslissingen / canonvoorstellen

- De generator mag wel:
  - bestaande topprioriteiten compacter rangschikken
  - bestaande verificatievragen selecteren en herordenen
  - bestaande eerste acties bundelen tot een bounded keuze-set
  - een proportionele 30-60-90 structuur voorstellen als management-review ritme
  - expliciet benoemen wat nog verificatie vraagt
- De generator mag niet:
  - nieuwe metriclogica of risicodrempels introduceren
  - nieuwe oorzaken, diagnosen of voorspelclaims afleiden
  - named owners, teamnamen of persoonsgerichte interventies verzinnen
  - effectclaims, ROI-claims of succesverwachtingen toevoegen
  - ExitScan buiten `P9`/route-output of bestaande dashboard action slots laten treden
- Canonieke taalregels voor de generator:
  - gebruik woorden als `prioriteit`, `verificatie`, `eerste stap`, `mogelijke actie`, `reviewmoment`, `follow-up`
  - vermijd woorden als `oorzaak`, `bewijs`, `garantie`, `zal leiden tot`, `oplossen`, `voorspelt`
- Outputstatus:
  - ondersteunend
  - management-bruikbaar
  - proportioneel
  - niet-beslissend

## Concrete wijzigingen

- Nieuwe boundaryfile toegevoegd: `docs/active/INSIGHT_TO_ACTION_BOUNDARY_NOTES.md`
- Harde no-go zones vastgelegd voor:
  - claims
  - architectuur
  - methodiek
  - storage/render scope
- Toegestane generatorhandelingen vastgelegd als bounded derivation rules

## Validatie

- De boundaries sluiten rechtstreeks aan op bestaande productdefinitions, report content en paritytests.
- De notes houden ExitScan expliciet binnen de vaste architectuur en beschermen RetentieScan als verification-first route.
- De notes introduceren geen nieuwe productclaim, metric of maturitylabel.

## Assumptions / defaults

- De generator blijft in MVP een tekstuele managementstructuur en geen workflow engine.
- `30-60-90` wordt gelezen als opvolgstructuur of reviewritme, niet als bewijs van interventie-impact.
- "Mogelijke eerste acties" betekent expliciet: opties die logisch volgen uit bestaand groepsbeeld, niet aanbevolen zekerheden.
- Als input te indicatief is, moet de generator compacter en voorzichtiger formuleren in plaats van inventiever.

## Next gate

Generator Design And Canon: van boundary notes naar expliciete input mapping, output canon, renderplaats en dedupe-regels voor MVP-implementatie.
