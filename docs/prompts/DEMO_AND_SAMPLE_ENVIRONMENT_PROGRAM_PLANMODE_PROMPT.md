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
- [docs/active/SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md)
- [docs/examples/README.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/README.md)
- [docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md)
- [docs/reference/DEMO_AND_SAMPLE_ENVIRONMENT_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/DEMO_AND_SAMPLE_ENVIRONMENT_SYSTEM.md)
- [docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md)
- [generate_voorbeeldrapport.py](/C:/Users/larsh/Desktop/Business/Verisight/generate_voorbeeldrapport.py)
- [seed_exit_live_test_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/seed_exit_live_test_environment.py)
- [seed_retention_demo_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/seed_retention_demo_environment.py)
- [simulate_retention_validation_pilot.py](/C:/Users/larsh/Desktop/Business/Verisight/simulate_retention_validation_pilot.py)
- [manage_demo_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/manage_demo_environment.py)
- [demo_environment.py](/C:/Users/larsh/Desktop/Business/Verisight/demo_environment.py)

Scope:
- demo-tenant
- internal sales demo
- QA/live-test fixtures
- validation/pilot sandbox
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
- sales, onboarding en website beter ondersteund worden
- sample-assets en demo-scenario's gemakkelijker bijgehouden kunnen worden

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige buyer-facing sample-output
2. huidige internal demo-scenario's
3. huidige QA/live-test fixtures
4. huidige validation/pilot sandbox
5. voorbeeldcampagnes en campaign states
6. sampledata en veilige demo-identiteiten
7. parity met echte productoutput
8. demo-scripts en flow
9. welke demo-elementen ontbreken
10. onderhoudslast
11. risico op verouderde of kapotte demo's
12. risico op gevoelige data in demo-assets
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
