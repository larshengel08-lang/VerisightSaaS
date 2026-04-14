# Product Terminology And Taxonomy System Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md` voor een volledige harmonisatie van productterminologie en taxonomie binnen Verisight.

Belangrijk:
- `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige terminologie in website, dashboard, rapport, survey, marketing en externe docs
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring.py)

Scope:
- productnamen
- scoretermen
- signaleringstermen
- dashboardlabels
- rapportlabels
- commerciële taal
- ExitScan en RetentieScan begrippenkader

Doel:
Maak een plan om producttaal over alle lagen heen consistenter te maken, zodat:
- dezelfde termen overal hetzelfde betekenen
- productverwarring afneemt
- commerciële, methodische en UX-taal beter op elkaar aansluiten
- ExitScan en RetentieScan scherper onderscheiden blijven
- toekomstige copy- en productwerk minder drift veroorzaakt

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige productnamen
2. score- en signaaltaal
3. ExitScan-terminologie
4. RetentieScan-terminologie
5. marketing- versus producttaal
6. labels in rapport en dashboard
7. inconsistenties in externe docs
8. termen die nu te hard of te zacht zijn
9. termen die te technisch zijn
10. termen die niet bestuurlijk genoeg zijn
11. wat intern technisch mag blijven
12. wat extern geharmoniseerd moet worden
13. hoe een woordenlijst geborgd moet worden
14. welke parity- en QA-checks nodig zijn

Vereisten voor `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md`:
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
- risico op terminologiedrift
- risico op mismatch tussen marketing en product
- risico op productverwarring tussen ExitScan en RetentieScan
- risico op te harde of te onduidelijke scoretaal
- risico dat externe docs oude taal blijven aanjagen

Structuur van `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md`:
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
- maak alleen `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
