# RetentieScan v1.1 Validation Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `RETENTIESCAN_V1_1_VALIDATION_PLAN.md` voor een volledige validatie-aanpak van RetentieScan v1.1.

Belangrijk:
- `RETENTIESCAN_V1_1_VALIDATION_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige codebase, survey, scoring, dashboard, rapport en testlaag van RetentieScan
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
- survey
- scoring
- interpretatie
- dashboard
- rapport
- methodologische aannames
- validatievragen
- echte databehoefte
- test- en QA-vereisten
- commerciele positionering voor v1.1 waar relevant

Doel:
Maak een plan om RetentieScan verantwoord door te ontwikkelen naar een sterkere v1.1, met nadruk op validatie in plaats van alleen productbouw, zodat:
- de belangrijkste aannames expliciet getoetst worden
- methode en productclaims beter onderbouwd raken
- duidelijk is wat eerst data nodig heeft en wat nu al verantwoord aangescherpt kan worden
- v1.1 geloofwaardiger en commercieel bruikbaar wordt zonder pseudo-wetenschappelijke claims

Wat expliciet beoordeeld en meegenomen moet worden:
1. wat RetentieScan v1.0 nu al goed doet
2. welke aannames nu nog onvoldoende gevalideerd zijn
3. welke onderdelen eerst echte data nodig hebben
4. welke metrics of combinaties het meest kritisch zijn om te valideren
5. waar interpretatie nu te vroeg of te ambitieus kan zijn
6. welke surveyonderdelen methodisch sterk of juist zwak zijn
7. welke scoringuitkomsten later pas harder gemaakt mogen worden
8. welke dashboardduiding eerst door praktijkgebruik getoetst moet worden
9. welke rapportduiding zonder validatie te ver kan gaan
10. welke tests, logging, analyses en kwaliteitschecks nodig zijn
11. wat een zinvolle v1.1-scope is en wat nog niet
12. hoe commerciele scherpte behouden kan blijven zonder pseudo-wetenschappelijke claims
13. hoe ExitScan als referentiekader helpt om RetentieScan zuiver te positioneren
14. welke acceptatiecriteria nodig zijn voor een geloofwaardige v1.1

Vereisten voor `RETENTIESCAN_V1_1_VALIDATION_PLAN.md`:
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
- validatierisico's
- methodische risico's
- interpretatie- en dashboardrisico's
- commerciele risico's
- risico dat v1.1 te snel te hard geclaimd wordt

Structuur van `RETENTIESCAN_V1_1_VALIDATION_PLAN.md`:
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
- maak alleen `RETENTIESCAN_V1_1_VALIDATION_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat onderzocht kan worden, maar ook wat eerst echt gevalideerd moet worden
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
