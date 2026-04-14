# Boardroom Readiness Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `BOARDROOM_READINESS_PLAN.md` voor een volledige aanscherping van de boardroom-readiness van Verisight.

Belangrijk:
- `BOARDROOM_READINESS_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst hoe output, copy, rapporten, dashboards en demo-assets nu landen bij directie, bestuur en senior beslissers
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [docs/examples/voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)

Scope:
- rapporten
- dashboardsamenvatting
- commerciële framing
- besluittaal
- directiegeschiktheid van output
- buyer-facing voorbeeldmateriaal
- trust en bestuurlijke bruikbaarheid

Doel:
Maak een plan om Verisight-output beter geschikt te maken voor directie en bestuur, zodat:
- output sneller bestuurlijk leesbaar is
- rapporten en demo's serieuzer en besluitgerichter aanvoelen
- HR het verhaal makkelijker intern kan doorvertellen
- de propositie beter past bij budget- en prioriteitsgesprekken
- de stap naar pilot of aankoop overtuigender wordt

Wat expliciet beoordeeld en meegenomen moet worden:
1. directieleesbaarheid
2. executive summary
3. besluittaal
4. bestuurlijke framing van waarde
5. mate van theoretische of survey-achtige toon
6. hoe risico, urgentie en prioriteit nu worden gecommuniceerd
7. wat CFO of directie vermoedelijk nog mist
8. welke output nu te operationeel of te detailrijk is
9. waar producttaal nog te weinig boardroom-geschikt is
10. hoe ExitScan en RetentieScan bestuurlijk verschillen
11. welke trust-elementen nodig zijn voor senior beslissers
12. welke visuals of samenvattingen helpen
13. welke commerciële claims verdedigbaar blijven
14. welke acceptancecriteria boardroom-readiness aantonen

Vereisten voor `BOARDROOM_READINESS_PLAN.md`:
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
- risico op te operationele of te theoretische output
- risico dat directie de waarde niet snel genoeg ziet
- risico op te veel HR-vaktaal
- risico op overclaiming in boardroom-framing
- risico dat voorbeeldoutput niet overtuigt op senior niveau

Structuur van `BOARDROOM_READINESS_PLAN.md`:
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
- maak alleen `BOARDROOM_READINESS_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
