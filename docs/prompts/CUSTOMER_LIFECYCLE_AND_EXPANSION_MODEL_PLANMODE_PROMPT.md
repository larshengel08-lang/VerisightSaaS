# Customer Lifecycle And Expansion Model Planmodus Prompt

```text
Analyseer deze codebase, productstructuur, website en commerciële documentatie en maak een uitvoerbaar planbestand `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md` voor de route van eerste sale naar herhaalgebruik, uitbreiding en productdoorstroom binnen Verisight.

Belangrijk:
- `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige customer journey, productcombinaties, demo/output-assets en adoptieroute
- baseer je plan op de huidige implementatie, niet op algemene expansion-aannames

Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [docs/examples/README.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/README.md)
- [docs/examples/voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
- [docs/examples/voorbeeldrapport_retentiescan.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_retentiescan.pdf)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)

Scope:
- eerste verkoop
- onboarding naar eerste rapport
- herhaalgebruik
- ExitScan naar RetentieScan doorstroom
- combinatiepropositie
- renewal-, uitbreiding- en opvolglogica

Doel:
Maak een plan om de klantlevenscyclus en expansion-route scherp te krijgen, zodat:
- het duidelijk is hoe een eerste klant verder groeit binnen Verisight
- ExitScan en RetentieScan logisch op elkaar kunnen volgen
- uitbreiding geen productverwarring veroorzaakt
- assisted sales en latere schaalmodellen beter op echte lifecycle-logica aansluiten

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige instappunten
2. huidige productvolgorde
3. waar herhaalgebruik logisch is
4. waar expansion commercieel geloofwaardig is
5. hoe ExitScan naar RetentieScan route werkt
6. hoe combinatieproposities zonder verwarring kunnen landen
7. welke lifecycle-assets of momenten nu ontbreken
8. welke triggers of klantmomenten expansion logisch maken
9. welke risico's er zijn op te vroege of te harde expansion

Vereisten voor `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`:
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
- risico op productverwarring
- risico op geforceerde expansion zonder echte klantlogica
- risico op mismatch tussen salesverhaal en werkelijke vervolgstappen
- risico dat lifecycle-denken te vroeg als SaaS-retentieframe wordt geforceerd

Structuur van `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`:
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
- maak alleen `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
