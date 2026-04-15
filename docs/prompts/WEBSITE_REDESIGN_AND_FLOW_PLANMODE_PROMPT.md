# Website Redesign And Flow Planmodus Prompt

```text
Analyseer deze website en codebase en maak een uitvoerbaar planbestand `WEBSITE_REDESIGN_AND_FLOW_PLAN.md` voor een inhoudelijk kloppend, visueel sterk en commercieel overtuigend redesign van de Verisight-website.

Belangrijk:
- `WEBSITE_REDESIGN_AND_FLOW_PLAN.md` wordt de source of truth voor de uitvoering
- voer nog geen codewijzigingen uit
- maak nog geen nieuwe designs in code; maak eerst een decision-complete redesignplan
- analyseer eerst de huidige website, copy, visuele hiërarchie, componentstructuur, CTA-flow, responsive gedrag en trust-/conversielaag
- baseer je plan op de huidige implementatie en bestaande repo-truth, niet op algemene designaannames
- het doel is niet “mooier maken” in abstracte zin, maar een website die inhoudelijk klopt, visueel overtuigt en commercieel veel sterker werkt

Lees eerst voor context:
- [PLANMODE_PROMPT_TEMPLATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PLANMODE_PROMPT_TEMPLATE.md)
- [PROMPT_INDEX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_INDEX.md)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [TRUST_AND_CLAIMS_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/TRUST_AND_CLAIMS_MATRIX.md)
- [BOARDROOM_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/BOARDROOM_READINESS_PLAN.md)
- [FOUNDER_LED_SALES_NARRATIVE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/FOUNDER_LED_SALES_NARRATIVE_PLAN.md)
- [REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md)
- [TRUST_SIGNAL_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TRUST_SIGNAL_PROGRAM_PLAN.md)
- [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [frontend/app/aanpak/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/aanpak/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/components/marketing/public-header.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/public-header.tsx)
- [frontend/components/marketing/public-footer.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/public-footer.tsx)
- [frontend/components/marketing/marketing-page-shell.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/marketing-page-shell.tsx)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

Gebruik [TailGrids Play](https://play-tailwind.tailgrids.com/) alleen als referentie voor:
- flow
- ritme
- compositie
- commerciële opbouw

Maar:
- kopieer TailGrids niet
- maak geen generieke SaaS-template
- behoud een herkenbare Verisight-identiteit
- de site moet premium, rustig, zakelijk scherp en geloofwaardig aanvoelen

Design guardrails:
- geen generieke startup- of template-esthetiek
- geen overvolle SaaS-landing met te veel losse blokken
- geen visueel “drukke” of schreeuwerige conversielaag
- geen copy die harder claimt dan trust-, methodiek- en productbasis dragen
- geen Engels denkende copy in Nederlands jasje
- geen wollige consultancytaal
- geen “AI slop”
- wel: premium, rustig, helder, modern, commercieel sterk, inhoudelijk geloofwaardig

Merk- en stijlrichting:
- Verisight moet voelen als een serieuze, moderne B2B-propositie
- de visuele taal moet vertrouwen, scherpte en rust combineren
- typografie, spacing, layout en CTA-ritme moeten samen één duidelijke kwaliteitsindruk geven
- trust is reassurance, niet de eerste pitch
- de eerste schermen moeten primair probleem, route en relevantie communiceren
- Nederlands moet natuurlijk, professioneel en overtuigend zijn

Scope:
- publieke website
- homepage
- productenoverzicht
- productpagina’s
- aanpakpagina
- tarievenpagina
- publieke navigatie en footer
- contactflow en CTA-architectuur
- trustlaag op publieke pagina’s
- visuele flow, compositie, spacing, typografie en responsive gedrag

Doel:
Maak een plan om de website inhoudelijk, visueel en commercieel veel sterker te maken, zodat:
- de site sneller duidelijk maakt wat Verisight is
- de visuele flow premiumer, rustiger en overtuigender wordt
- de commerciële route scherper en logischer wordt
- trust, pricing, sample-output en contactflow elkaar versterken
- de site beter converteert zonder productverwarring of overclaiming
- het Nederlands zichtbaar beter en natuurlijker wordt

Wat expliciet beoordeeld en meegenomen moet worden:
1. huidige informatiearchitectuur
2. huidige sectievolgorde
3. homepage-flow van hero tot contact
4. productenoverzicht en productnavigatie
5. hero en bovenste commerciële flow
6. benefits / hoe het werkt / outputblokken
7. trustlaag, sample-output, pricing en contactflow
8. copyflow, taalregister en commerciële scherpte
9. visuele hiërarchie
10. spacing, alignment, ritme en compositie
11. consistentie van componenten, knoppen, kaarten, grids en typografie
12. scanbaarheid, rust en visuele onrust
13. responsive gedrag en mobiele bruikbaarheid
14. waar de site nu inhoudelijk onduidelijk, visueel zwak of commercieel stroef voelt
15. welke pagina’s het meeste redesigngewicht verdienen
16. hoe TailGrids-flow bruikbaar is zonder Verisight-identiteit kwijt te raken
17. hoe trust-, boardroom- en saleswerk doorvertaald moeten worden naar de site
18. welke verbeteringen de meeste impact hebben op duidelijkheid, premiumgevoel en conversie

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

Voeg daarnaast verplicht deze extra secties toe:
- `Visual Direction`
- `Design Guardrails`
- `Priority Pages`
- `Page-Level Redesign Direction`

Vereisten voor die extra secties:

## Visual Direction
Beschrijf concreet:
- gewenste merkindruk
- kleurhiërarchie
- typografische richting
- spacing- en layoutprincipes
- componentstijl
- CTA-stijl
- beeldgebruik of visual mood
- hoe ExitScan, RetentieScan en trust visueel samenkomen zonder drukte

## Design Guardrails
Leg vast:
- wat het redesign nadrukkelijk niet mag worden
- welke stijlen, patronen en copyregisters vermeden moeten worden
- hoe generieke SaaS-esthetiek wordt voorkomen
- hoe premiumgevoel wordt bereikt zonder enterprise-theater

## Priority Pages
Rangschik minimaal:
1. homepage
2. productpagina’s
3. tarieven
4. aanpak
5. productenoverzicht

En benoem:
- waarom die volgorde logisch is
- waar de grootste visuele en commerciële winst zit

## Page-Level Redesign Direction
Voor elke kernpagina:
- Current issues
- Why it underperforms
- Proposed direction
- Core sections in proposed order
- Visual direction notes
- Copy direction notes
- Primary CTA and conversion role

Gebruik in elk geval deze milestones:

### Milestone 1 - Diagnose En Prioritering Van De Huidige Site
Dependency: none

#### Tasks
- [ ] Analyseer per kernpagina de huidige problemen in structuur, copy, hiërarchie en uitstraling.
- [ ] Benoem de grootste commerciële en visuele breukpunten.
- [ ] Rangschik welke pagina’s en flows het meeste redesigngewicht moeten krijgen.

#### Definition of done
- [ ] De belangrijkste websiteproblemen zijn expliciet en geprioriteerd.
- [ ] Het is duidelijk waar de grootste winst zit in duidelijkheid, premiumgevoel en conversie.

#### Validation
- [ ] Een implementer hoeft niet meer te raden welke pagina’s of problemen het belangrijkst zijn.
- [ ] Er is één heldere redesignprioriteit in plaats van een brede wensenlijst.

### Milestone 2 - Visual Direction En Design Guardrails
Dependency: Milestone 1

#### Tasks
- [ ] Definieer een duidelijke visuele richting voor Verisight.
- [ ] Leg design guardrails vast om generieke SaaS-output te voorkomen.
- [ ] Bepaal hoe premium, trust, rust en commerciële scherpte samenkomen in layout en stijl.

#### Definition of done
- [ ] Er ligt een concrete visual direction die richtinggevend genoeg is voor implementatie.
- [ ] De guardrails maken duidelijk wat wel en niet bij Verisight past.

#### Validation
- [ ] Een uitvoerder kan hiermee ontwerpen zonder opnieuw stijlbeslissingen te moeten nemen.
- [ ] De gekozen richting voelt onderscheidend genoeg ten opzichte van generieke B2B-sites.

### Milestone 3 - Informatiearchitectuur En Paginaflow
Dependency: Milestone 2

#### Tasks
- [ ] Herstructureer de informatiearchitectuur van homepage en kernpagina’s.
- [ ] Bepaal de beste sectievolgorde per prioriteitspagina.
- [ ] Verwijder overlap, dode momenten en onduidelijke routes.

#### Definition of done
- [ ] De publieksflow is logisch, scanbaar en commercieel sterker.
- [ ] Elke kernpagina heeft een duidelijke rol in de buyer journey.

#### Validation
- [ ] Een nieuwe bezoeker begrijpt sneller wat Verisight doet en waar hij verder moet.
- [ ] De flow ondersteunt begrip, trust en conversie beter dan nu.

### Milestone 4 - Hero, Bovenste Flow En Kernboodschap
Dependency: Milestone 3

#### Tasks
- [ ] Herbouw de hero-richting en de eerste scrollblokken.
- [ ] Bepaal de juiste headline-, subcopy- en CTA-logica.
- [ ] Zorg dat de eerste schermen probleem, productroute en relevantie direct overbrengen.

#### Definition of done
- [ ] De bovenste flow vertelt in seconden wat Verisight is en waarom het relevant is.
- [ ] CTA’s en eerste argumenten zijn duidelijk, geloofwaardig en sterk.

#### Validation
- [ ] De bovenste secties voelen minder diffuus en meer premium.
- [ ] De boodschap sluit aan op productrealiteit, trust en salesnarratief.

### Milestone 5 - Benefits, Hoe Het Werkt, Output En Trustlaag
Dependency: Milestone 4

#### Tasks
- [ ] Herstructureer benefits-, werking-, output- en trustblokken tot één logische uitlegroute.
- [ ] Bepaal waar trust zichtbaar moet zijn en waar het juist later moet landen.
- [ ] Zorg dat sample-output, pricing en contactflow logisch voortbouwen op de uitlegroute.

#### Definition of done
- [ ] De midden- en onderkant van de site leggen productwaarde en vervolgstap veel helderder uit.
- [ ] Trust ondersteunt de flow zonder deze te verzwaren.

#### Validation
- [ ] Een bezoeker begrijpt sneller wat hij krijgt, waarom het betrouwbaar is en wat de volgende stap is.
- [ ] De site verkoopt geen trust als theater en geen product als losse featureset.

### Milestone 6 - Copy Polish, Nederlands, Consistentie En Responsive Afwerking
Dependency: Milestone 5

#### Tasks
- [ ] Herzie algehele copy op natuurlijk Nederlands, commerciële scherpte en consistentie.
- [ ] Verwijder anglicismen, consultanttaal en onrustige copypatronen.
- [ ] Leg spacing-, component- en responsive fixes vast voor desktop en mobiel.
- [ ] Formuleer laatste acceptance checks voor visuele, inhoudelijke en commerciële kwaliteit.

#### Definition of done
- [ ] De site leest natuurlijker, consistenter en professioneler.
- [ ] Desktop en mobiel geven dezelfde premium en commerciële hoofdindruk.
- [ ] Het redesignplan is decision-complete voor uitvoering.

#### Validation
- [ ] Copy, layout en responsive gedrag voelen als één samenhangend systeem.
- [ ] Het plan kan direct milestone voor milestone uitgevoerd worden zonder nieuwe ontwerpbeslissingen.

Neem in `Current Product Risks` expliciet mee:
- UX-risico’s
- conversierisico’s
- visuele en hiërarchische risico’s
- copy- en positioneringsrisico’s
- risico op generieke SaaS-uitstraling
- risico dat de site te druk, te voorzichtig of te weinig premium voelt
- risico dat trust te vroeg of te zwaar in de flow komt
- risico dat Nederlands onnatuurlijk, te abstract of te “vertaald” klinkt

Structuur van `WEBSITE_REDESIGN_AND_FLOW_PLAN.md`:
1. Summary
2. Visual Direction
3. Design Guardrails
4. Priority Pages
5. Milestones
6. Page-Level Redesign Direction
7. Execution Breakdown By Subsystem
8. Current Product Risks
9. Open Questions
10. Follow-up Ideas
11. Out of Scope For Now
12. Defaults Chosen

Extra regels:
- wijzig nog geen code
- maak alleen `WEBSITE_REDESIGN_AND_FLOW_PLAN.md`
- houd de volgorde logisch en uitvoerbaar
- zorg dat het plan geschikt is om daarna milestone voor milestone exact uit te voeren
- blijf kritisch: benoem niet alleen wat mooier kan, maar ook wat inhoudelijk, commercieel, visueel en tekstueel echt zwak of diffuus is
- schrijf alle buyer-facing richting in natuurlijk, professioneel Nederlands
- vermijd generieke designclichés en abstracte designtaal zonder concrete vertaalslag
- werk na afronding ook `PROMPT_CHECKLIST.xlsx` bij in dezelfde map
```
