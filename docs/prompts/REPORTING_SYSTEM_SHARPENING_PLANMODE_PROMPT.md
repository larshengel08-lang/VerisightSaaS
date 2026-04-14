# Reporting System Sharpening Planmodus Prompt

```text
Analyseer deze codebase en maak een uitvoerbaar planbestand `REPORTING_SYSTEM_SHARPENING_PLAN.md` voor een volledige aanscherping van het rapportagesysteem binnen Verisight.

Belangrijk:
- `REPORTING_SYSTEM_SHARPENING_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige rapportstructuur, managementsamenvattingen, duiding, terminologie, layoutlogica en productspecifieke rapportinhoud
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
- ExitScan-rapporten
- RetentieScan-rapporten
- managementsamenvatting
- scoreduiding en hypothesen
- werkhypothesen, vervolgstappen en methodologie
- shared versus productspecifieke rapportonderdelen
- tests en parity-checks waar relevant

Doel:
Maak een plan om rapporten inhoudelijk, methodisch en commercieel bruikbaarder te maken, zodat:
- directie en HR sneller de kern begrijpen
- rapporten meer managementwaarde leveren
- producttaal rustiger en consistenter wordt
- rapportstructuur beter aansluit op dashboard en survey
- ExitScan en RetentieScan elk een scherpere, eigen rapportidentiteit krijgen

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige rapportstructuur
2. managementsamenvatting
3. scoreduiding en terminologie
4. hypothesen en vervolgstappen
5. methodologiepassages
6. verschil tussen ExitScan- en RetentieScan-rapportage
7. waar rapporten te generiek of te survey-achtig zijn
8. waar rapporten te ambitieus of te voorzichtig formuleren
9. waar kopers of management kunnen afhaken
10. waar rapport en dashboard niet goed aligned zijn
11. welke shared rapportdelen mogen blijven
12. welke productspecifiek moeten worden
13. welke tests, QA en parity-checks nodig zijn
14. welke verbeteringen de meeste managementwaarde geven

Vereisten voor `REPORTING_SYSTEM_SHARPENING_PLAN.md`:
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
- interpretatierisico's
- methodologische risico's
- risico op generieke rapportage
- risico dat managementsamenvatting te zwak of te diffuus is
- risico dat rapport en dashboard verschillende verhalen vertellen

Structuur van `REPORTING_SYSTEM_SHARPENING_PLAN.md`:
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
- maak alleen `REPORTING_SYSTEM_SHARPENING_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
