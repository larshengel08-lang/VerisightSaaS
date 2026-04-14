# Website Redesign And Flow Planmodus Prompt

```text
Analyseer deze website en codebase en maak een uitvoerbaar planbestand `WEBSITE_REDESIGN_AND_FLOW_PLAN.md` voor een volledige aanscherping van de Verisight-website.

Belangrijk:
- `WEBSITE_REDESIGN_AND_FLOW_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- analyseer eerst de huidige website, copy, visuele hiÃ«rarchie, componentstructuur, CTA-flow en responsive gedrag
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
- gebruik [TailGrids Play](https://play-tailwind.tailgrids.com/) als referentie voor visuele flow, ritme en commerciÃ«le opbouw
- behoud duidelijk de identiteit van Verisight; het doel is niet kopiÃ«ren, maar een vergelijkbare klasse van flow en compositie

Scope:
- publieke website
- homepage
- productpagina's
- commerciÃ«le sectievolgorde
- visuele flow en ritme
- CTA-structuur
- pricing- en contactflow
- spacing, responsiveness en consistentie

Doel:
Maak een plan om de website visueel, inhoudelijk en commercieel veel sterker te maken, zodat:
- de site duidelijker en professioneler aanvoelt
- de sectievolgorde logischer wordt
- de visuele flow sterker en rustiger wordt
- kopers sneller begrijpen wat Verisight is en waarom het relevant is
- de site beter converteert zonder de merkidentiteit kwijt te raken

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige informatiearchitectuur
2. huidige sectievolgorde
3. hero en bovenste commerciÃ«le flow
4. benefits, hoe-het-werkt en outputblokken
5. trustlaag, CTA's, pricing en contactflow
6. copyflow en commerciÃ«le scherpte
7. visuele hiÃ«rarchie
8. spacing, alignment en compositie
9. consistentie van componenten, knoppen en typografie
10. scanbaarheid en onrust
11. responsive gedrag en mobiele bruikbaarheid
12. waar de site onduidelijk, visueel onpraktisch of niet-kloppend voelt
13. hoe TailGrids-flow als referentie bruikbaar is zonder Verisight-identiteit te verliezen
14. welke verbeteringen de meeste impact hebben op duidelijkheid en conversie

Neem in elk geval mee:
- `frontend/app/page.tsx`
- `frontend/app/product/page.tsx`
- `frontend/app/aanpak/page.tsx`
- `frontend/app/tarieven/page.tsx`
- `frontend/app/producten/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/components/marketing/site-content.ts`
- `frontend/components/marketing/public-header.tsx`
- `frontend/components/marketing/public-footer.tsx`
- `frontend/components/marketing/marketing-page-shell.tsx`
- `frontend/components/marketing/*.tsx`
- `frontend/lib/marketing-products.ts`

Vereisten voor `WEBSITE_REDESIGN_AND_FLOW_PLAN.md`:
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
- UX-risico's
- conversierisico's
- visuele en hiÃ«rarchische risico's
- copy- en positioneringsrisico's
- risico dat de site rommelig of onvoldoende premium aanvoelt

Structuur van `WEBSITE_REDESIGN_AND_FLOW_PLAN.md`:
1. Summary
2. Milestones
3. Execution Breakdown By Subsystem
4. Current Product Risks
5. Open Questions
6. Follow-up Ideas
7. Out of Scope For Now
8. Defaults Chosen

Gebruik minimaal deze milestones:

### Milestone 1 - Informatiearchitectuur En Sectievolgorde
Dependency: none

#### Tasks
- [ ] Analyseer de huidige publieke informatiearchitectuur en sectievolgorde.
- [ ] Bepaal welke pagina's en secties inhoudelijk te veel overlap hebben.
- [ ] Stel een scherpere commerciÃ«le volgorde voor per hoofdpagina.

#### Definition of done
- [ ] Er ligt een duidelijke, logisch opgebouwde publieke structuur.
- [ ] De volgorde van secties ondersteunt begrip en conversie beter dan nu.

#### Validation
- [ ] Een nieuwe bezoeker kan sneller begrijpen wat Verisight doet.
- [ ] Overlap en dode momenten in de flow zijn expliciet verminderd.

### Milestone 2 - Hero + Bovenste CommerciÃ«le Flow
Dependency: Milestone 1

#### Tasks
- [ ] Herzie de hero-opbouw, headline, supporting copy en CTA-structuur.
- [ ] Bepaal welke eerste scrollblokken direct onder de hero moeten volgen.
- [ ] Maak de bovenste commerciÃ«le flow scanbaarder en overtuigender.

#### Definition of done
- [ ] De hero en bovenste flow vertellen in enkele seconden wat Verisight is.
- [ ] De eerste CTA's en argumenten zijn duidelijker en sterker.

#### Validation
- [ ] De bovenste schermen voelen commercieel sterker en minder diffuus.
- [ ] De eerste indruk sluit beter aan op de productrealiteit.

### Milestone 3 - Benefits / Hoe Het Werkt / Output
Dependency: Milestone 2

#### Tasks
- [ ] Herstructureer benefits, hoe-het-werkt en output-secties.
- [ ] Verwijder overlap en maak de kernwaarde per sectie explicieter.
- [ ] Zorg dat deze blokken samen Ã©Ã©n logische uitlegroute vormen.

#### Definition of done
- [ ] Benefits, werking en output vullen elkaar aan in plaats van elkaar te herhalen.
- [ ] De productwaarde is sneller en rustiger te begrijpen.

#### Validation
- [ ] Een bezoeker hoeft minder te interpreteren wat hij krijgt.
- [ ] De uitlegroute ondersteunt koopbegrip beter.

### Milestone 4 - Trust, CTA's, Pricing Of Contactflow
Dependency: Milestone 3

#### Tasks
- [ ] Herzie trustblokken, CTA-logica, pricingpresentatie en contactflow.
- [ ] Bepaal welke trust cues nodig zijn en welke juist onnodige ruis geven.
- [ ] Maak de onderkant van de flow sterker richting contact of volgende stap.

#### Definition of done
- [ ] Vertrouwen en conversie zijn duidelijker ondersteund.
- [ ] Pricing en contactflow voelen logischer en minder stroef.

#### Validation
- [ ] De site bouwt geloofwaardigheid op zonder theater.
- [ ] CTA's en contactmomenten voelen natuurlijker en sterker.

### Milestone 5 - Copy Polish, Alignment, Spacing, Responsive Fixes
Dependency: Milestone 4

#### Tasks
- [ ] Poets copy, terminologie en onderlinge alignment op.
- [ ] Herzie spacing, ritme, componentafstanden en mobiele weergave.
- [ ] Bepaal welke responsive fixes nodig zijn voor een rustiger geheel.

#### Definition of done
- [ ] Copy, spacing en componentritme zijn zichtbaar consistenter.
- [ ] De site voelt minder rommelig en beter afgewerkt op desktop en mobiel.

#### Validation
- [ ] Visuele ruis en oneffenheden zijn aantoonbaar verminderd.
- [ ] Mobile en desktop geven dezelfde commerciÃ«le hoofdindruk.

### Milestone 6 - Eindcheck Op Consistentie En Conversie
Dependency: Milestone 5

#### Tasks
- [ ] Controleer het totaalbeeld op consistentie, geloofwaardigheid en conversiekracht.
- [ ] Loop alle hoofdflows en CTA-paden nog Ã©Ã©n keer na.
- [ ] Formuleer de laatste acceptance checks voor uitvoering.

#### Definition of done
- [ ] Er ligt een samenhangend redesignplan dat uitvoerbaar is.
- [ ] De belangrijkste conversie- en flowproblemen zijn geprioriteerd.

#### Validation
- [ ] Het plan kan direct milestone voor milestone worden uitgevoerd.
- [ ] De sitekoers is duidelijker, sterker en visueel samenhangender.

Extra regels:
- wijzig nog geen code
- maak alleen `WEBSITE_REDESIGN_AND_FLOW_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
