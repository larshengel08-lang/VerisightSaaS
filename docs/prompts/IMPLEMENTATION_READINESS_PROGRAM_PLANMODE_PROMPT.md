# Implementation Readiness Program Planmodus Prompt

```text
Analyseer deze codebase, productflow en operationele inrichting en maak een uitvoerbaar planbestand `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md` voor implementation readiness binnen Verisight.

Belangrijk:
- `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige onboarding, campaign setup, respondentimport, invites, livegangflow, supportmomenten en operationele afhankelijkheden
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
- onboardingflow
- campaign setup
- respondentimport
- inviteflow
- contactmomenten en klantcommunicatie
- interne operationele checklist
- implementatierisico's en acceptatiechecks
- ExitScan en RetentieScan waar relevant

Doel:
Maak een plan om Verisight implementatieklaar te maken voor echte klanten, zodat:
- onboarding voorspelbaar en herhaalbaar wordt
- operationele fouten vroeg zichtbaar worden
- klantinrichting minder frictie kent
- livegangen minder afhankelijk zijn van improvisatie
- er een duidelijke checklist komt voor interne uitvoering en klantacceptatie

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige onboardingflow
2. interne setup- en beheerflow
3. campaign aanmaken en configureren
4. respondentimport en validatie
5. invite- en activatieflow
6. operationele afhankelijkheden en handmatige stappen
7. waar implementatie nu foutgevoelig is
8. waar klanten kunnen vastlopen
9. waar interne kennis te impliciet is
10. welke checklists nu ontbreken
11. welke rollen en verantwoordelijkheden duidelijker moeten
12. welke acceptatiechecks nodig zijn voor livegang
13. welke tests en QA hierbij horen
14. welke verbeteringen de meeste implementatiewaarde opleveren

Vereisten voor `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`:
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
- operationele risico's
- onboardingrisico's
- livegangrisico's
- afhankelijkheid van handmatige kennis of handwerk
- risico dat goede productbouw strandt in stroeve implementatie

Structuur van `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`:
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
- maak alleen `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
