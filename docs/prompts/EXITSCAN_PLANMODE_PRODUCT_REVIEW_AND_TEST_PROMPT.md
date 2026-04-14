# ExitScan Planmodus Prompt - Product Review And Test

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` voor een volledige review en testanalyse van ExitScan.

Belangrijk:
- `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige codebase, copy, survey, scoring, dashboard, rapport en testlaag van ExitScan
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring.py)
- [AUDIT_IMPLEMENTATION_ROSTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/AUDIT_IMPLEMENTATION_ROSTER.md)
- [EXITSCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/EXITSCAN_PRODUCT_SHARPENING_PLAN.md)

Scope:
- alleen ExitScan
- survey
- scoring
- interpretatielogica
- dashboardduiding
- rapportstructuur
- productcopy en commerciele positionering waar direct relevant
- testdekking en QA
- RetentieScan alleen meenemen waar vergelijking nodig is om ExitScan scherper te positioneren

Doel:
Maak een plan om ExitScan inhoudelijk, methodisch, commercieel en qua testbescherming scherper te beoordelen en daarna uitvoerbaar te verbeteren, zodat:
- het product duidelijker en sterker gepositioneerd is
- survey, scoring, dashboard en rapport beter op elkaar aansluiten
- test- en QA-gaten expliciet zichtbaar worden
- het product commercieel scherp blijft zonder onware claims
- ExitScan duidelijk complementair blijft aan RetentieScan

Wat expliciet beoordeeld en meegenomen moet worden:
1. de huidige ExitScan-propositie
2. surveyvragen en of de juiste dingen worden gemeten
3. wat ontbreekt in de survey voor een sterkere ExitScan-reviewbasis
4. scoring- en interpretatielogica
5. hoe frictiescore, preventability / werksignaal en handelingsperspectief nu worden gebruikt
6. dashboard decision support
7. rapportstructuur en managementbruikbaarheid
8. commerciele positionering en onderscheid ten opzichte van RetentieScan
9. wat ExitScan nu sterk maakt
10. wat ExitScan nu zwak, diffuus of te generiek maakt
11. waar privacy, interpretatie of overclaiming risico zit
12. waar copy, UX en productmethodiek niet goed aligned zijn
13. welke tests, QA en acceptatiechecks nodig zijn
14. wat eerst gereviewd en getest moet worden

Neem in elk geval mee:
- `backend/products/exit/definition.py`
- `backend/products/exit/scoring.py`
- `backend/products/exit/report_content.py`
- `backend/report.py`
- `backend/main.py`
- `backend/schemas.py`
- `backend/scoring.py`
- `templates/survey.html`
- `templates/survey/exit-context.html`
- `frontend/lib/products/exit/definition.ts`
- `frontend/lib/products/exit/dashboard.ts`
- `frontend/lib/products/exit/focus-questions.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/components/dashboard/risk-charts.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/lib/marketing-products.ts`
- `frontend/components/marketing/site-content.ts`
- `tests/test_scoring.py`
- `tests/test_api_flows.py`
- `EXITSCAN_PRODUCT_SHARPENING_PLAN.md`

Vereisten voor `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`:
- breek het werk op in logische milestones en kleine subtaken
- geef afhankelijkheden aan
- geef per stap een definition of done
- voeg checkboxes toe
- voeg per milestone ook een validatiesectie toe
- voeg een aparte sectie toe:
  - Current Product Risks
  - Open Questions
  - Follow-up Ideas
  - Out of Scope For Now
  - Defaults Chosen

Neem in `Current Product Risks` expliciet mee:
- methodische risico's
- commerciele risico's
- UX- en interpretatierisico's
- risico op overlap of verwarring met RetentieScan
- risico dat ExitScan te veel als generieke exit-enquete leest
- risico dat review en testdekking belangrijke regressies missen

Structuur van `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`:
1. Summary
2. Milestones
3. Execution Breakdown By Subsystem
4. Current Product Risks
5. Open Questions
6. Follow-up Ideas
7. Out of Scope For Now
8. Defaults Chosen

Extra regels:
- wijzig nog geen code
- maak alleen `EXITSCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat mooier kan, maar ook wat inhoudelijk, methodisch of commercieel echt scherper moet worden
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
