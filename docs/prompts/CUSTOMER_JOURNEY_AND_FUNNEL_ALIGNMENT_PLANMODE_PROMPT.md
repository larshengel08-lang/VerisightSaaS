# Customer Journey And Funnel Alignment Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md` voor een volledige alignment van klantreis en commerciële funnel binnen Verisight.

Belangrijk:
- `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige route van sitebezoek naar contact, demo, intake, livegang en rapportgebruik
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [docs/examples/voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)

Scope:
- website
- CTA's en contactflow
- demo-instroom
- intake en onboardingovergang
- livegangverwachtingen
- rapportgebruik na oplevering
- commerciële funnelconsistentie

Doel:
Maak een plan om de klantreis van eerste interesse tot eerste productwaarde strakker te maken, zodat:
- prospects minder frictie ervaren
- website en salesverhaal beter op elkaar aansluiten
- demo en intake natuurlijker opvolgen
- deliveryverwachtingen eerder helder zijn
- eerste waarde sneller en begrijpelijker aankomt

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige instroomroutes
2. CTA-architectuur
3. eerste contactmoment
4. demo-overgang
5. intake-overgang
6. livegangverwachting
7. rapportgebruik en follow-up
8. ExitScan versus RetentieScan in de klantreis
9. waar prospects nu afhaken
10. waar interne overdrachten zwak zijn
11. welke tussenstappen ontbreken
12. welke assets of pagina's nodig zijn
13. welke metrics of signalen de funnel moet ondersteunen
14. welke acceptancecriteria funnelalignment bewijzen

Vereisten voor `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md`:
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
- risico op afhakende prospects
- risico op losse overgangen tussen marketing, sales en delivery
- risico op verkeerde verwachtingen
- risico op te veel afhankelijkheid van handmatige uitleg
- risico op overlap of verwarring tussen producten

Structuur van `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md`:
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
- maak alleen `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
