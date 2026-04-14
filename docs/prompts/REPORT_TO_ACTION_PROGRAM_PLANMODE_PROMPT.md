# Report To Action Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `REPORT_TO_ACTION_PROGRAM_PLAN.md` voor een volledige aanscherping van de stap van rapport naar actie binnen Verisight.

Belangrijk:
- `REPORT_TO_ACTION_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst hoe rapport, dashboard, aanbevelingen en opvolging nu wel of niet leiden tot concrete vervolgactie
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [REPORTING_SYSTEM_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/REPORTING_SYSTEM_SHARPENING_PLAN.md)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [frontend/components/dashboard/recommendation-list.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/recommendation-list.tsx)

Scope:
- rapport naar managementgesprek
- managementgesprek naar vervolgstap
- aanbevelingen
- hypothesen
- opvolgrichting
- ExitScan en RetentieScan verschillen
- klantbruikbaarheid na oplevering

Doel:
Maak een plan om de stap van rapport naar concreet vervolggedrag scherper te maken, zodat:
- output minder eindpunt en meer startpunt wordt
- HR en MT sneller tot zinvolle vervolgstappen komen
- aanbevelingen en hypothesen beter bruikbaar worden
- Verisight meer managementwaarde levert na oplevering
- opvolging consistenter wordt ingericht

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige aanbevelingen
2. huidige werkhypothesen
3. rapportduiding versus vervolgstap
4. dashboardduiding versus vervolgstap
5. ExitScan-actierichting
6. RetentieScan-actierichting
7. waar rapporten nu eindigen zonder vervolgbrug
8. welke formats of vragen helpen
9. risico op te veel advies zonder basis
10. risico op te weinig handelingsperspectief
11. waar actionability dubbel werk doet met andere programma's
12. welke minimale vervolgstaplaag nodig is
13. welke acceptancecriteria bruikbare opvolging aantonen
14. welke QA-checks nodig zijn

Vereisten voor `REPORT_TO_ACTION_PROGRAM_PLAN.md`:
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
- risico dat rapporten eindigen zonder vervolg
- risico op te abstracte vervolgstappen
- risico op te veel pseudo-advies
- risico op overlap met actionability-werk
- risico op inconsistente opvolging per product

Structuur van `REPORT_TO_ACTION_PROGRAM_PLAN.md`:
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
- maak alleen `REPORT_TO_ACTION_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
