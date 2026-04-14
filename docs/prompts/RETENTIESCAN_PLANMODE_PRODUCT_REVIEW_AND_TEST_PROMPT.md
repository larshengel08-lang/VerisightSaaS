# RetentieScan Planmodus Prompt - Product Review And Test

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` voor een volledige review en testanalyse van RetentieScan.

Belangrijk:
- `RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige codebase, copy, survey, scoring, dashboard, rapport en testlaag van RetentieScan
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
- [EXITSCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_PRODUCT_SHARPENING_PLAN.md)

Scope:
- alleen RetentieScan
- survey
- scoring
- interpretatielogica
- dashboardduiding
- rapportstructuur
- productcopy en commerciele positionering waar direct relevant
- testdekking en QA
- ExitScan alleen meenemen waar vergelijking nodig is om RetentieScan complementair en scherper te positioneren

Doel:
Maak een plan om RetentieScan inhoudelijk, methodisch, commercieel en qua testbescherming scherper te beoordelen en daarna uitvoerbaar te verbeteren, zodat:
- het product duidelijker en sterker gepositioneerd is
- survey, scoring, dashboard en rapport beter op elkaar aansluiten
- test- en QA-gaten expliciet zichtbaar worden
- het product commercieel scherp blijft zonder onware claims
- RetentieScan duidelijk complementair blijft aan ExitScan

Wat expliciet beoordeeld en meegenomen moet worden:
1. de huidige RetentieScan-propositie
2. surveyvragen en of de juiste dingen worden gemeten
3. wat ontbreekt in de survey voor sterkere behoudssignalering
4. scoring- en interpretatielogica
5. hoe retentiesignaal, stay-intent, vertrekintentie en handelingsperspectief nu worden gebruikt
6. dashboard decision support
7. rapportstructuur en managementbruikbaarheid
8. commerciele positionering en onderscheid ten opzichte van ExitScan
9. wat RetentieScan nu sterk maakt
10. wat RetentieScan nu zwak, diffuus of te generiek maakt
11. waar privacy, interpretatie of overclaiming risico zit
12. waar copy, UX en productmethodiek niet goed aligned zijn
13. welke tests, QA en acceptatiechecks nodig zijn
14. wat eerst gereviewd en getest moet worden

Neem in elk geval mee:
- `backend/products/retention/definition.py`
- `backend/products/retention/scoring.py`
- `backend/report.py`
- `backend/main.py`
- `backend/schemas.py`
- `backend/scoring.py`
- `templates/survey.html`
- `templates/survey/retention-signals.html`
- `frontend/lib/products/retention/definition.ts`
- `frontend/lib/products/retention/dashboard.ts`
- `frontend/lib/products/retention/focus-questions.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/components/dashboard/risk-charts.tsx`
- `frontend/components/dashboard/recommendation-list.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/lib/marketing-products.ts`
- `frontend/components/marketing/site-content.ts`
- `tests/test_scoring.py`
- `tests/test_api_flows.py`

Vereisten voor `RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`:
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
- risico op overlap of verwarring met ExitScan
- risico dat RetentieScan te veel als generieke MTO of pseudo-voorspeller leest
- risico dat review en testdekking belangrijke regressies missen

Structuur van `RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`:
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
- maak alleen `RETENTIESCAN_PRODUCT_REVIEW_AND_TEST_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat mooier kan, maar ook wat inhoudelijk, methodisch of commercieel echt scherper moet worden
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
