# RetentieScan Planmodus Prompt - Product Sharpening

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md` voor een volledige inhoudelijke en productmatige aanscherping van RetentieScan.

Belangrijk:
- `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige codebase, copy, survey, scoring, rapportlogica, dashboardduiding en commerciele positionering van RetentieScan
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
- alleen RetentieScan
- focus op productinhoud, methodiek, rapportduiding, dashboardinterpretatie, commerciele scherpte en onderlinge consistentie
- ExitScan alleen meenemen waar vergelijking nodig is om RetentieScan duidelijker te positioneren, maar ExitScan zelf niet wijzigen
- marketingwebsite mag alleen meegenomen worden waar RetentieScan-positionering of copy direct onderdeel is van de productaanscherping
- geen nieuwe producten meenemen
- geen grote backend-herarchitectuur meenemen, behalve als iets direct nodig is om RetentieScan inhoudelijk scherper of consistenter te maken
- geen scopelek naar losse brainstorms of extra productideeen

Doel:
Maak een plan om RetentieScan inhoudelijk, methodisch, commercieel en UX-matig scherper te maken, zodat het product:
- duidelijker en sterker gepositioneerd is
- methodisch verdedigbaar blijft
- in survey, scoring, dashboard en rapport beter op elkaar aansluit
- voor een kopende HR-manager overtuigender en bruikbaarder is
- duidelijk complementair blijft aan ExitScan zonder inhoudelijke overlap of verwarring

Wat expliciet beoordeeld en meegenomen moet worden:
1. de huidige RetentieScan-propositie
2. surveyvragen en of de juiste dingen worden gemeten
3. wat ontbreekt in de survey voor een sterker RetentieScan-product
4. scoring- en interpretatielogica
5. hoe retentiesignaal, stay-intent, vertrekintentie en handelingsperspectief nu worden gebruikt
6. dashboardduiding en decision support
7. rapportstructuur en managementbruikbaarheid
8. commerciele positionering en onderscheid ten opzichte van ExitScan
9. wat RetentieScan nu sterk maakt
10. wat RetentieScan nu zwak, diffuus of te generiek maakt
11. waar privacy, interpretatie of overclaiming risico zit
12. waar copy, UX en productmethodiek niet goed aligned zijn
13. wat shared kan blijven en wat RetentieScan-specifiek moet zijn
14. welke tests, QA en acceptatiechecks nodig zijn

Vereisten voor `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md`:
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
- risico dat RetentieScan te veel als generieke MTO of pseudo-voorspelling leest in plaats van scherp product

Structuur van `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md`:
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
- maak alleen `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat mooier kan, maar ook wat inhoudelijk of commercieel echt scherper moet worden
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
