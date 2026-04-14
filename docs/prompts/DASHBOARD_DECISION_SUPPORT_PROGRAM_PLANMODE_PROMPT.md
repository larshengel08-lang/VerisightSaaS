# Dashboard Decision Support Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLAN.md` voor een volledige aanscherping van dashboard decision support binnen Verisight.

Belangrijk:
- `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige dashboards, interpretatielogica, managementsamenvattingen, decision support, CTA's en gebruikersflow
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
- dashboardervaring voor ExitScan en RetentieScan
- top-level managementread
- signalen, samenvattingen en prioritering
- focusvragen, aanbevelingen en vervolgstappen
- klikflow, leesvolgorde en decision support
- shared versus product-specifieke dashboardlagen
- tests en acceptatiechecks waar relevant

Doel:
Maak een plan om dashboard decision support scherper, bruikbaarder en managementgerichter te maken, zodat:
- gebruikers sneller begrijpen wat ze zien
- signalen beter worden geprioriteerd
- dashboards minder generiek aanvoelen
- handelingsperspectief concreter wordt
- ExitScan en RetentieScan elk hun eigen decision-supportlaag krijgen zonder onnodige overlap

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige dashboardhiÃ«rarchie
2. eerste managementread bovenaan het scherm
3. interpretatie van signalen, scores en labels
4. topfactoren, topredenen en prioritering
5. focusvragen en aanbevelingen
6. decision support per product
7. waar dashboards te generiek of te abstract zijn
8. waar dashboards inhoudelijk te druk of te dun zijn
9. waar de volgorde van informatie niet logisch is
10. waar gebruikers moeten nadenken terwijl dat niet nodig is
11. welke componenten shared kunnen blijven
12. welke componenten productspecifiek moeten worden
13. welke tests, QA en parity-checks nodig zijn
14. welke verbeteringen de meeste managementwaarde opleveren

Vereisten voor `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLAN.md`:
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
- UX- en interpretatierisico's
- risico op generieke dashboards
- risico op te zwakke managementduiding
- risico op inconsistentie tussen product en dashboard
- risico dat handelingsperspectief onvoldoende scherp is

Structuur van `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLAN.md`:
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
- maak alleen `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
