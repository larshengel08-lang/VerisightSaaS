# Demo And Sample Environment Program Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md` voor een volledige aanscherping van demo- en sampleomgevingen binnen Verisight.

Belangrijk:
- `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige demo-tenant, voorbeeldcampagnes, voorbeeldrapporten en veilige demo-inzet
- baseer je plan op de huidige implementatie, niet op algemene aannames
Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [docs/examples/voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
- [docs/examples/voorbeeldrapport_retentiescan.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_retentiescan.pdf)
- [create_demo_tenant.py](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/99_Archief/Repo_Werkbestanden_2026-04-12/create_demo_tenant.py)

Scope:
- demo-tenant
- voorbeeldcampagnes
- sampledata
- voorbeeldrapporten
- demo-flow
- veiligheid van demo-omgevingen
- onderhoud van demo-assets

Doel:
Maak een plan om demo- en sampleomgevingen betrouwbaarder en verkoopbaarder te maken, zodat:
- demo's sneller inzetbaar zijn
- voorbeelden geloofwaardig maar veilig blijven
- productdemonstraties minder kwetsbaar zijn
- sales en website beter ondersteund worden
- sample-assets gemakkelijker bijgehouden kunnen worden

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige demo-tenant
2. voorbeeldcampagnes
3. voorbeeldrapporten
4. sampledata
5. veiligheid en privacy van demo-assets
6. parity met echte productoutput
7. demo-scripts en flow
8. welke demo-elementen ontbreken
9. onderhoudslast
10. risico op verouderde of kapotte demo's
11. risico op gevoelige data in demo-assets
12. wat per product minimaal nodig is
13. welke omgeving of tooling nodig is
14. welke smoke-checks nodig zijn

Vereisten voor `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md`:
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
- risico op kapotte of verouderde demo's
- risico op te veel handmatig demo-werk
- risico op sampledata die niet representatief is
- risico op gevoelige data in demo-omgevingen
- risico op mismatch tussen demo en echt product

Structuur van `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md`:
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
- maak alleen `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
