# RetentieScan Planmodus Prompt - Live Test

```text
Analyseer deze website, live omgeving en codebase en maak een uitvoerbaar planbestand `RETENTIESCAN_LIVE_TEST_PLAN.md` voor een volledige live test van RetentieScan.

Belangrijk:
- `RETENTIESCAN_LIVE_TEST_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige site, routes, knoppen, CTA's, dashboardinteracties en functionele flows van RetentieScan
- baseer je plan op de huidige implementatie en live gebruikersflow, niet op algemene aannames
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
- alleen RetentieScan
- publieke website waar RetentieScan zichtbaar is
- RetentieScan productpagina
- contact- en kennismakingsflow
- login en relevante auth-routes
- RetentieScan dashboard
- campaign detailpagina
- rapportdownload
- klikbaarheid, links, buttons, states en foutpaden
- ExitScan alleen meenemen waar vergelijking nodig is om RetentieScan live duidelijk complementair te positioneren

Doel:
Maak een plan om RetentieScan live volledig te reviewen en te testen, zodat:
- alle belangrijke klikpaden gecontroleerd worden
- website, CTA's en dashboard logisch op elkaar aansluiten
- dode knoppen, kapotte links en verwarrende interacties zichtbaar worden
- de live flow geschikt is voor demo, pilot en echt klantgebruik
- duidelijk wordt wat eerst getest en daarna eventueel gefixt moet worden

Wat expliciet beoordeeld en meegenomen moet worden:
1. websiteflow en informatiearchitectuur
2. CTA's en navigatie
3. links, buttons en klikgedrag
4. contact- en kennismakingsflow
5. auth-toegang en loginflow
6. dashboardnavigatie en bruikbaarheid
7. campaign detailflow
8. rapportdownload
9. states:
   - leeg
   - indicatief
   - voldoende data
   - fout / geen toegang
10. mobile en desktop klikgedrag
11. copyflow tussen site en dashboard
12. waar gebruikers moeten nadenken of afhaken
13. wat live blocker is en wat niet
14. welke checks per rol nodig zijn

Neem in elk geval mee:
- `frontend/app/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/components/marketing/site-content.ts`
- `frontend/components/marketing/public-header.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/components/dashboard/*`
- `frontend/lib/products/retention/*`
- relevante api-routes en backend-endpoints

Vereisten voor `RETENTIESCAN_LIVE_TEST_PLAN.md`:
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
- live blockers
- UX- en flowrisico's
- conversierisico's
- dashboard- en interactierisico's
- risico op nep-interactie of dode elementen
- risico dat RetentieScan live onduidelijk of stroef voelt

Structuur van `RETENTIESCAN_LIVE_TEST_PLAN.md`:
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
- maak alleen `RETENTIESCAN_LIVE_TEST_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: het plan moet niet alleen benoemen wat getest kan worden, maar ook wat live het meeste risico geeft
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
