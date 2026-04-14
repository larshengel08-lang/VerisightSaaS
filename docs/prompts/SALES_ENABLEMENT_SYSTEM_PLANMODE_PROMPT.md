# Sales Enablement System Planmodus Prompt

```text
Analyseer deze codebase, website en relevante productdocumentatie en maak een uitvoerbaar planbestand `SALES_ENABLEMENT_SYSTEM_PLAN.md` voor een volledig Sales Enablement System rond Verisight.

Belangrijk:
- `SALES_ENABLEMENT_SYSTEM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige producten, copy, productpagina's, salesrichting en strategiedocumenten
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
- [EXITSCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_PRODUCT_SHARPENING_PLAN.md)

Scope:
- productnarratief
- commerciele positionering
- vergelijking tussen producten
- discovery en intake
- demo-structuur
- offerte- en voorstelstructuur
- bezwaren en twijfels
- beslisboom welk product wanneer past
- salesmateriaal dat logisch uit de bestaande codebase en productlogica volgt

Doel:
Maak een plan om ExitScan, RetentieScan en de combinatie eenvoudiger, consistenter en commercieler verkoopbaar te maken, zodat:
- salesgesprekken strakker en geloofwaardiger worden
- productverschillen makkelijker uit te leggen zijn
- methode, copy en commercie elkaar niet tegenspreken
- goede productbouw niet verloren gaat in zwakke uitleg

Wat expliciet beoordeeld en meegenomen moet worden:
1. hoe verkoopbaar ExitScan nu is
2. hoe verkoopbaar RetentieScan nu is
3. waar de uitleg tussen producten diffuus wordt
4. welke commerciele tegenwerpingen logisch zijn
5. waar methodische nuance sales nu afremt of juist geloofwaardigheid geeft
6. welke productclaims veilig en sterk genoeg zijn
7. welke claims te vaag of te hard zijn
8. hoe de combinatiepropositie werkt zonder productverwarring
9. welke sales-assets nu ontbreken
10. welke standaard salesflow logisch is van eerste gesprek tot voorstel
11. hoe demo's per product ingericht moeten worden
12. welke vergelijkingstabellen, scripts of one-pagers het meeste opleveren
13. welke veelgestelde bezwaren standaard beantwoord moeten worden
14. hoe je voorkomt dat goede productbouw verloren gaat in slappe commerciele gesprekken

Vereisten voor `SALES_ENABLEMENT_SYSTEM_PLAN.md`:
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
- commerciele risico's
- positioneringsrisico's
- risico op productverwarring tussen ExitScan, RetentieScan en combinatie
- risico op te harde of te vage claims
- risico dat salesuitleg niet aansluit op het echte product

Structuur van `SALES_ENABLEMENT_SYSTEM_PLAN.md`:
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
- maak alleen `SALES_ENABLEMENT_SYSTEM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat nuttig zou zijn, maar ook wat commercieel het meeste verschil maakt
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
