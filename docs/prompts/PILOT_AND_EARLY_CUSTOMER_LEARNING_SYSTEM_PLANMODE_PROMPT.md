# Pilot And Early Customer Learning System Planmodus Prompt

```text
Analyseer deze codebase, productflow en huidige werkpraktijk en maak een uitvoerbaar planbestand `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md` voor een pilot- en early-customer-learning-systeem binnen Verisight.

Belangrijk:
- `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige producten, feedbackmomenten, livegebruik, testflows, customer signals en mogelijke leerlussen
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
- pilotaanpak
- vroege klantfeedback
- leerloops tussen product, sales en implementatie
- signalen uit dashboard, rapport en support
- validatie- en observatiemomenten
- operationalisering van learnings
- ExitScan en RetentieScan waar relevant

Doel:
Maak een plan om pilots en vroege klanttrajecten structureel te gebruiken als leersysteem, zodat:
- productverbeteringen beter gevoed worden door echte praktijkdata
- signalen uit pilots niet verloren gaan
- sales, implementatie en product van dezelfde learnings profiteren
- de eerste klanttrajecten methodisch en commercieel meer opleveren
- Verisight sneller slimmer wordt zonder ad hoc te werken

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige pilotpraktijk of impliciete werkwijze
2. waar learnings nu ontstaan maar niet geborgd worden
3. welke klantsignalen waardevol zijn om vast te leggen
4. welke productmomenten het meeste inzicht opleveren
5. hoe feedback nu terugstroomt naar product en sales
6. waar early customer feedback te vrijblijvend blijft
7. welke vaste evaluatiemomenten nodig zijn
8. hoe pilots methodisch en commercieel tegelijk waarde kunnen opleveren
9. welke KPI's of observaties nuttig zijn
10. welke rollen en verantwoordelijkheden duidelijker moeten
11. welke tooling of documentatie ontbreekt
12. welke checklists of sjablonen nodig zijn
13. welke QA- of validatiekoppelingen logisch zijn
14. welke verbeteringen de meeste leerwaarde opleveren

Vereisten voor `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md`:
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
- leerrisico's
- risico dat vroege signalen verloren gaan
- risico dat pilots te ad hoc blijven
- risico dat product, sales en implementatie verschillende lessen trekken
- risico dat praktijkfeedback te laat of te zwak in productbesluiten terugkomt

Structuur van `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md`:
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
- maak alleen `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
