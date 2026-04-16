# Content Operating System Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `CONTENT_OPERATING_SYSTEM_PLAN.md` voor een volledige content-operating-system aanpak binnen Verisight.

Belangrijk:
- `CONTENT_OPERATING_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst hoe site, SEO, thought leadership, demo-content, cases en salescontent zich nu tot elkaar verhouden
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [SEO_CONVERSION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEO_CONVERSION_PROGRAM_PLAN.md)

Scope:
- sitecontent
- SEO-content
- thought leadership
- demo- en samplecontent
- salescontent
- contentgovernance
- hergebruik van inhoud over kanalen

Doel:
Maak een plan om content als systeem in te richten, zodat:
- website, SEO en sales niet los van elkaar werken
- Verisight met minder versnippering kan communiceren
- content herbruikbaar wordt over kanalen heen
- thought leadership later logisch kan groeien
- commerciële en inhoudelijke consistentie beter bewaakt wordt

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige sitecontent
2. huidige salescontent
3. relatie met SEO
4. relatie met cases en sample output
5. ontbrekende contenttypes
6. hergebruiksmogelijkheden
7. governance van claims en termen
8. risico op versnipperde contentproductie
9. welke content pas zin heeft na tractie
10. welke content nu al hoge waarde heeft
11. hoe content een operating system wordt in plaats van losse assets
12. welke ownership en updatecycli nodig zijn
13. wat nu buiten scope moet blijven
14. welke acceptancecriteria een bruikbaar content-systeem aantonen

Vereisten voor `CONTENT_OPERATING_SYSTEM_PLAN.md`:
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
- risico op contentversnippering
- risico op te vroege schaalcontent
- risico op inconsistente claims en terminologie
- risico op lage herbruikbaarheid van assets
- risico dat content harder loopt dan product en bewijs

Structuur van `CONTENT_OPERATING_SYSTEM_PLAN.md`:
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
- maak alleen `CONTENT_OPERATING_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
