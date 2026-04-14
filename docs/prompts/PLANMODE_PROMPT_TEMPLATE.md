# Planmodus Prompt Template

```text
Analyseer deze codebase{{OPTIONAL_EXTRA_SURFACE}} en maak een uitvoerbaar planbestand `{{DELIVERABLE_FILENAME}}` voor {{PRIMARY_OBJECTIVE}}.

Belangrijk:
- `{{DELIVERABLE_FILENAME}}` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige implementatie, copy, logica, UX en relevante tests van {{PRIMARY_SCOPE_LABEL}}
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
- {{SCOPE_ITEM_1}}
- {{SCOPE_ITEM_2}}
- {{SCOPE_ITEM_3}}
- {{SCOPE_ITEM_4}}
- {{SCOPE_ITEM_5}}
- {{SCOPE_ITEM_6}}
- {{SCOPE_ITEM_7}}
- {{COMPARISON_SCOPE_RULE}}

Doel:
Maak een plan om {{PRIMARY_SCOPE_LABEL}} {{CORE_ACTION}}, zodat:
- {{GOAL_OUTCOME_1}}
- {{GOAL_OUTCOME_2}}
- {{GOAL_OUTCOME_3}}
- {{GOAL_OUTCOME_4}}
- {{GOAL_OUTCOME_5}}

Wat expliciet beoordeeld en meegenomen moet worden:
1. {{ANALYSIS_POINT_1}}
2. {{ANALYSIS_POINT_2}}
3. {{ANALYSIS_POINT_3}}
4. {{ANALYSIS_POINT_4}}
5. {{ANALYSIS_POINT_5}}
6. {{ANALYSIS_POINT_6}}
7. {{ANALYSIS_POINT_7}}
8. {{ANALYSIS_POINT_8}}
9. {{ANALYSIS_POINT_9}}
10. {{ANALYSIS_POINT_10}}
11. {{ANALYSIS_POINT_11}}
12. {{ANALYSIS_POINT_12}}
13. {{ANALYSIS_POINT_13}}
14. {{ANALYSIS_POINT_14}}

Neem in elk geval mee:
- `{{FILE_1}}`
- `{{FILE_2}}`
- `{{FILE_3}}`
- `{{FILE_4}}`
- `{{FILE_5}}`
- `{{FILE_6}}`
- `{{FILE_7}}`
- `{{FILE_8}}`
- `{{FILE_9}}`
- `{{FILE_10}}`

Vereisten voor `{{DELIVERABLE_FILENAME}}`:
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
- {{RISK_CATEGORY_1}}
- {{RISK_CATEGORY_2}}
- {{RISK_CATEGORY_3}}
- {{RISK_CATEGORY_4}}
- {{RISK_CATEGORY_5}}

Structuur van `{{DELIVERABLE_FILENAME}}`:
1. Summary
2. Milestones
3. Execution Breakdown By Subsystem
4. Current Product Risks
5. Open Questions
6. Follow-up Ideas
7. Out of Scope For Now
8. Defaults Chosen

Gebruik voor elke milestone dit format:

### Milestone {{N}} - {{MILESTONE_NAME}}
Dependency: {{DEPENDENCY}}

#### Tasks
- [ ] {{TASK_1}}
- [ ] {{TASK_2}}
- [ ] {{TASK_3}}

#### Definition of done
- [ ] {{DONE_1}}
- [ ] {{DONE_2}}

#### Validation
- [ ] {{VALIDATION_1}}
- [ ] {{VALIDATION_2}}

Extra regels:
- wijzig nog geen code
- maak alleen `{{DELIVERABLE_FILENAME}}`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat mooier kan, maar ook wat inhoudelijk, commercieel, UX-matig of methodisch echt scherper moet worden
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map:
  - zet de relevante promptregel op voltooid of niet voltooid
  - vul `Last Updated` bij
  - voeg kort toe wat is opgeleverd of waarom het nog openstaat
```

## Gebruik

Vervang alle `{{PLACEHOLDERS}}` door productspecifieke inhoud.

Handige varianten:
- product review en test
- product sharpening
- live test
- validatieprogramma
- SEO of conversieprogramma
- sales enablement programma

## Minimale checklist

- kies 1 duidelijke deliverable bestandsnaam
- benoem expliciet wat binnen scope valt
- benoem expliciet wat buiten scope valt
- dwing milestone-structuur af
- dwing `Current Product Risks` af
- laat de prompt eindigen in een uitvoerbaar plan, niet in losse analyse
- neem standaard mee dat `PROMPT_CHECKLIST.xlsx` na uitvoering wordt bijgewerkt
