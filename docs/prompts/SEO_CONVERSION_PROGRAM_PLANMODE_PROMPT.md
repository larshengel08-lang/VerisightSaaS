# SEO + Conversion Program Planmodus Prompt

```text
Analyseer deze website en codebase en maak een uitvoerbaar planbestand `SEO_CONVERSION_PROGRAM_PLAN.md` voor een volledig SEO- en conversieprogramma.

Belangrijk:
- `SEO_CONVERSION_PROGRAM_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige site, copy, navigatie, metadata, CTA-structuur en conversieroutes
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
- homepage
- productpagina's
- aanpak, tarieven en producten
- metadata, sitemap en indexeerbare pagina's
- interne linkstructuur
- CTA-plaatsing
- contactflow en kennismakingsflow
- conversieroutes per product
- ExitScan als primaire landingsroute
- RetentieScan als complementair product

Doel:
Maak een plan om de bestaande website beter te laten presteren op organisch verkeer, commerciele relevantie en conversie, zodat:
- de sterkste productpagina's beter gevonden worden
- bezoekers logischer doorstromen naar contact of kennismaking
- bestaande traffic commercieel beter wordt benut
- SEO en conversie elkaar versterken in plaats van tegenwerken

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige informatiearchitectuur
2. of de site logisch opgebouwd is voor SEO en conversie
3. welke pagina's nu de meeste commerciele waarde moeten dragen
4. welke zoekintenties logisch zijn voor ExitScan, RetentieScan en combinatie
5. waar huidige copy te breed, te dun of te weinig zoek- en koopgericht is
6. metadata, titles, descriptions, headings en structured data
7. interne linking en navigatie
8. CTA-hierarchie en contact- en conversiepad
9. waar verkeer nu zou landen maar niet goed doorstroomt
10. waar de site informatief is maar commercieel te zwak
11. welke nieuwe pagina's of contentformats logisch zijn en welke juist niet
12. welke technische SEO-punten nu relevant zijn
13. welke conversie-experimenten de meeste opbrengst kunnen geven
14. hoe ExitScan als primaire landingsroute sterker kan worden benut

Vereisten voor `SEO_CONVERSION_PROGRAM_PLAN.md`:
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
- SEO-risico's
- conversierisico's
- copy- en positioneringsrisico's
- risico dat traffic op de verkeerde pagina's landt
- risico dat sterke productbouw commercieel onvoldoende benut wordt

Structuur van `SEO_CONVERSION_PROGRAM_PLAN.md`:
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
- maak alleen `SEO_CONVERSION_PROGRAM_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat mooier kan, maar ook wat commercieel echt meer rendement kan geven
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
