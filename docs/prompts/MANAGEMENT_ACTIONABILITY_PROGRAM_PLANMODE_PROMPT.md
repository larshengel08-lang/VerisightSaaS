# Management Actionability Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `MANAGEMENT_ACTIONABILITY_PLAN.md` voor een volledige aanscherping van de management-actionability van Verisight.

Belangrijk:
- `MANAGEMENT_ACTIONABILITY_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst hoe dashboard, rapport, focusvragen, aanbevelingen en samenvattingen nu wel of niet leiden tot concreet managementgedrag
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [frontend/lib/products/exit/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/dashboard.ts)
- [frontend/lib/products/retention/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/dashboard.ts)
- [frontend/lib/products/exit/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/focus-questions.ts)
- [frontend/lib/products/retention/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/focus-questions.ts)
- [frontend/components/dashboard/recommendation-list.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/recommendation-list.tsx)

Scope:
- ExitScan decision support
- RetentieScan decision support
- dashboardsamenvattingen
- focusvragen en hypothesen
- aanbevelingen en vervolgstappen
- rapportoutput waar die managementactie stuurt
- acceptancecriteria voor bruikbare besluitvorming

Doel:
Maak een plan om de stap van inzicht naar managementvraag, besluit en actie scherper te maken, zodat:
- HR sneller weet wat eerst besproken moet worden
- directie sneller begrijpt welke besluiten logisch zijn
- output minder blijft hangen op analyse en signalering
- vervolgacties concreter en beter prioriteerbaar worden
- het product meer voelt als stuurinstrument

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige managementread in dashboard
2. huidige managementread in rapport
3. focusvragen en hun kwaliteit
4. aanbevelingen versus echte acties
5. hypothesen versus schijnzekerheid
6. productspecifieke verschillen tussen ExitScan en RetentieScan
7. waar de stap van inzicht naar gesprek nu te zwak is
8. waar de stap van gesprek naar actie nu ontbreekt
9. besluittaal voor HR versus directie
10. risico op te consultant-achtige output
11. risico op te generieke HR-taal
12. risico op actie suggereren zonder voldoende basis
13. welke verbeteringen de meeste managementwaarde geven
14. welke tests en acceptancechecks nodig zijn

Vereisten voor `MANAGEMENT_ACTIONABILITY_PLAN.md`:
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
- risico op analysekracht zonder actiekracht
- risico op te abstracte managementtaal
- risico op inconsistentie tussen rapport en dashboard
- risico op te veel consultancy-framing
- risico op schijnzekerheid in vervolgstappen

Structuur van `MANAGEMENT_ACTIONABILITY_PLAN.md`:
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
- maak alleen `MANAGEMENT_ACTIONABILITY_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
