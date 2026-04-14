# Pricing And Packaging Program Planmodus Prompt

```text
Analyseer deze website, productstructuur en commerciÃ«le logica en maak een uitvoerbaar planbestand `PRICING_AND_PACKAGING_PROGRAM_PLAN.md` voor pricing en packaging binnen Verisight.

Belangrijk:
- `PRICING_AND_PACKAGING_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige producten, Baseline versus Live-logica, add-ons, prijsstructuur, tariefpagina's en commerciÃ«le uitleg
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
- ExitScan pricing
- RetentieScan pricing waar relevant
- Baseline en Live positionering
- add-ons en combinatiepropositie
- tariefpagina's en commerciÃ«le uitleg
- packaginglogica
- scope- en verwachtingsmanagement richting kopers

Doel:
Maak een plan om pricing en packaging scherper, eenvoudiger en commercieel sterker te maken, zodat:
- kopers sneller begrijpen wat ze kopen
- productstructuur en prijslogica beter op elkaar aansluiten
- Baseline, Live en add-ons minder verwarring geven
- commerciÃ«le gesprekken consistenter worden
- pricing commercieel stevig is zonder ongeloofwaardig te worden

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige prijsstructuur
2. huidige packaging per product
3. Baseline versus Live-logica
4. add-ons en combinatiepropositie
5. hoe prijs en propositie nu samenkomen op de site
6. waar prijsuitleg te vaag of te complex is
7. waar productstructuur commercieel verwart
8. waar pricing geloofwaardig sterk kan worden aangescherpt
9. welke prijs- en pakketclaims veilig zijn
10. welke tarief- en pakketpagina's scherper moeten
11. welke shared versus productspecifieke packaging logisch is
12. welke verkoopondersteuning hierbij nodig is
13. welke tests of QA-checks hierbij relevant zijn
14. welke verbeteringen de meeste commerciÃ«le impact geven

Vereisten voor `PRICING_AND_PACKAGING_PROGRAM_PLAN.md`:
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
- risico op pakketverwarring
- risico op ongeloofwaardige prijsframes
- risico dat pricing het product onnodig ingewikkeld maakt

Structuur van `PRICING_AND_PACKAGING_PROGRAM_PLAN.md`:
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
- maak alleen `PRICING_AND_PACKAGING_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
