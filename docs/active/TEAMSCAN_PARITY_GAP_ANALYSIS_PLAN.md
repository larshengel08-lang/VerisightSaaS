# TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de **parity gap analysis** van `TeamScan` tegen de volwassenheidslat van `ExitScan` en `RetentieScan`.

Het doel is niet om TeamScan kunstmatig groter te maken, maar om scherp vast te leggen:

- waar TeamScan nu al paritywaardig is
- waar TeamScan nog onder de volwassenheidslat zit
- welke gaps echte productvolwassenheid raken
- welke bounded keuzes gewoon mogen blijven bestaan

Deze analyse is expliciet gebaseerd op de huidige repo-realiteit:

- `TeamScan` is al gebouwd als eigen `scan_type`
- `TeamScan` heeft dashboardoutput, bounded prioritering en managementhandoff
- `TeamScan` staat buyer-facing live als controlled follow-on route
- `TeamScan` blijft bewust `department`-first, privacy-first en non-managerial

Belangrijk:

- parity betekent hier **gelijke kwaliteit en volwassenheid**
- parity betekent hier **niet**: manager ranking, hierarchy, named leaders, location models of brede team software
- `ExitScan` en `RetentieScan` blijven de referentielat voor volwassenheid, niet de inhoudelijke template

Deze stap bouwt nog niets. Ze levert alleen het huidige TeamScan parity-profiel op.

---

## 2. Current TeamScan Baseline

### Current product position

TeamScan staat nu in de suite als:

- runtime-product met eigen `scan_type = team`
- bounded follow-on route
- department-first lokalisatielaag na een breder zichtbaar signaal
- managementproduct voor:
  - waar speelt het nu het scherpst
  - waar is eerst verificatie logisch
  - waar is eerste lokale actie logisch

TeamScan is expliciet **niet**:

- een generieke teamscan
- een leiderschapsscan
- een manager-oordeel
- een performance-instrument
- een herlabelde `Segment Deep Dive`

### Current bounded truths that should remain bounded

Deze keuzes zijn nu geen parityprobleem op zichzelf:

- `department` als primaire TeamScan-v1 boundary
- geen manager ranking
- geen named people output
- geen hierarchy/reporting line logic
- geen PDF/report-parity vandaag
- suppressie-aware local read

Dat zijn alleen paritygaps als de output daardoor te zwak, te dun of intern inconsistent blijft.

---

## 3. Reference Parity Standard

TeamScan wordt in deze analyse langs dezelfde volwassenheidslagen gelegd als `ExitScan` en `RetentieScan`:

1. Method and instrument quality
2. Scoring and interpretation quality
3. Dashboard and decision support quality
4. Report quality
5. Buyer-facing clarity
6. Trust, privacy, and boundaries
7. Operational and QA maturity

---

## 4. Current Strengths

### A. Product role is already strategically coherent

TeamScan heeft nu een duidelijke plek in de suite:

- na een breder organisatiebeeld
- als lokalisatielaag
- als eerste stap naar lokale verificatie of actie

Dat is sterker dan een losse add-on en ook scherper dan een generieke “teammodule”.

### B. Runtime boundary is unusually disciplined

De huidige TeamScan-grenzen zijn inhoudelijk verdedigbaar:

- group-level only
- suppressie-aware
- `department`-first
- geen named leaders
- geen causaliteitsclaim

Dat maakt TeamScan methodisch veiliger dan veel te brede teamproducten.

### C. Dashboard path already has a usable management shape

Door `WAVE_02` en `WAVE_03` heeft TeamScan al:

- bounded prioritering
- first verify / watch next / monitor only logica
- eerste eigenaar
- eerste actie
- review boundary

Dat betekent dat TeamScan niet alleen data toont, maar al een echte managementrichting heeft.

### D. Buyer-facing route is already better bounded than most early follow-on products

De publieke TeamScan-route maakt nu expliciet:

- wanneer TeamScan logisch is
- wanneer TeamScan niet logisch is
- dat het geen brede teamscan of leiderschapstool is

Dat is een sterke basis voor parity, omdat veel parityproblemen normaal juist ontstaan in te brede buyer-facing copy.

### E. Trust posture is already relatively mature

TeamScan heeft al een sterk trustfundament:

- suppressie en groepsgrenzen zijn expliciet
- lokalisatie is geen oordeel
- output is geformuleerd als verificatie- en actiestart, niet als eindconclusie

Dat maakt TeamScan inhoudelijk verdedigbaarder dan de gemiddelde vroege follow-on route.

---

## 5. Current Gaps By Layer

### Layer 1 - Method And Instrument Quality

#### What is already strong

- TeamScan heeft een duidelijke managementvraag
- de surveyflow en bounded scoring sluiten aan op die vraag
- het product is klein genoeg om methodisch verdedigbaar te blijven

#### Main gaps

- TeamScan leunt nog relatief sterk op bestaande factorstructuren en een smalle local read, waardoor de productspecifieke meetidentiteit nog dun is
- de stap van “breder signaal” naar “lokale verificatie” is logisch, maar nog niet overal even expliciet vertaald in het instrument zelf
- het onderscheid met segmentverdieping is buyer-facing scherper dan methodisch/meetkundig

#### Parity judgment

Nog **onder parity**. Niet omdat TeamScan te klein is, maar omdat het meetinstrument nog niet volledig als een zelfstandig, volwassen product leest.

---

### Layer 2 - Scoring And Interpretation Quality

#### What is already strong

- suppressie-aware local read
- bounded prioriteringslogica
- geen causale overclaim
- heldere categorieën voor first verify / watch next / monitor only

#### Main gaps

- de interpretatielaag is bruikbaar, maar nog relatief compact vergeleken met de volwassenheid van ExitScan/RetentieScan
- TeamScan mist nog een rijkere productspecifieke interpretatiediepte per lokale uitkomst
- de vertaalslag van ruwe teamsignalen naar bestuurlijke betekenis is nog niet overal even sterk of rustig

#### Parity judgment

**Deels paritywaardig**, maar nog niet volledig. TeamScan is veilig genoeg, maar nog niet rijk genoeg in duiding.

---

### Layer 3 - Dashboard And Decision Support Quality

#### What is already strong

- duidelijke local priority-output
- eerste eigenaar en eerste actie zijn ingebouwd
- managementhandoff bestaat al echt

#### Main gaps

- TeamScan-dashboard is nog meer een scherpe readlaag dan een volledig volwassen managementinstrument
- de local-read output en de bredere managementbeslissing zijn nog niet altijd even elegant aan elkaar gekoppeld
- het product helpt al bij eerste actie, maar nog minder bij het structureren van de vervolgronde dan ExitScan/RetentieScan doen

#### Parity judgment

Nog **onder parity**, maar dicht in de buurt. Dit is waarschijnlijk de snelst te dichten gap.

---

### Layer 4 - Report Quality

#### What is already strong

- er is buyer-facing routeactivatie
- er is dashboardoutput die als basis voor rapportvolwassenheid kan dienen

#### Main gaps

- TeamScan heeft nog geen paritywaardige rapportlaag
- zolang PDF/report-output bewust ontbreekt of `422` blijft, blijft TeamScan onder de volwassenheidslat van ExitScan en RetentieScan
- managementbruikbaarheid is daardoor nog sterker in dashboard dan in formele output

#### Parity judgment

**Duidelijk onder parity**. Dit is de grootste objectieve parity-gap van TeamScan.

---

### Layer 5 - Buyer-Facing Clarity

#### What is already strong

- TeamScan heeft een duidelijke bounded positionering
- verwarring met leiderschap en generieke teamscans is actief afgebakend
- de follow-on rol is expliciet

#### Main gaps

- buyer-facing helderheid is beter dan de formele outputvolwassenheid; dat creëert risico dat de route commerciëler oogt dan de productoutput nog volledig ondersteunt
- het onderscheid met `Segment Deep Dive` is inhoudelijk goed begrensd, maar moet waarschijnlijk nog sterker productmatig bewezen worden in output, niet alleen in copy

#### Parity judgment

**Vrij sterk**, maar nog niet volledig paritywaardig zolang rapport/output achterloopt.

---

### Layer 6 - Trust, Privacy, And Boundaries

#### What is already strong

- suppressie en groepsgrenzen zijn expliciet
- geen named people output
- geen manager/performance framing
- geen causale claim

#### Main gaps

- zodra TeamScan volwassener wordt, moet trust ook sterker zichtbaar terugkomen in formele output en acceptance
- privacy- en suppressie-gedrag moeten paritywaardig blijken in alle outputlagen, niet alleen in dashboardlogica en copy

#### Parity judgment

**Bijna paritywaardig**. Trust is geen zwakte van TeamScan, maar moet bij parity-upgrade wel mee verankerd blijven.

---

### Layer 7 - Operational And QA Maturity

#### What is already strong

- TeamScan is door gecontroleerde waves gebouwd
- tests en buildgates zijn aanwezig
- bounded scope is duidelijk

#### Main gaps

- zolang TeamScan geen paritywaardige report/outputlaag heeft, is de totale acceptance nog asymmetrisch
- de productvolwassenheid is nu nog sterker in runtime/dashboard dan in formele delivery artefacts
- de QA-lat moet uiteindelijk product, rapport, trust en buyer-facing parity in één groene close-out meenemen

#### Parity judgment

Nog **onder parity**, vooral door output/report-asymmetrie.

---

## 6. TeamScan Parity Gap Summary

### Already close to parity

- suite role and product logic
- trust/privacy posture
- bounded positioning
- first management handoff

### Clear medium gaps

- productspecifieke methodische identiteit
- interpretatierijkdom
- dashboard-to-management depth
- operational acceptance as a full product

### Largest parity gap

- **report quality / formal output parity**

Zolang TeamScan geen volwassen rapport- en managementoutput heeft die vergelijkbaar stevig is als bij `ExitScan` en `RetentieScan`, blijft het product onder de parity-lat hangen.

---

## 7. What Should Stay Bounded

Deze onderdelen hoeven niet “geopend” te worden om parity te halen:

- geen manager ranking
- geen named leaders
- geen hierarchy/reporting line model
- geen location parity puur om meer te lijken
- geen brede team software
- geen performance- of accountability instrument

Parity voor TeamScan is dus:

- **betere kwaliteit**
- **rijkere output**
- **sterkere methodische en managementmatige volwassenheid**

en níet:

- bredere feature-scope

---

## 8. Recommended Next Wave Themes

Op basis van deze gap analysis horen TeamScan parity-waves waarschijnlijk rond deze thema’s te worden opgebouwd:

1. Method and interpretation parity
2. Dashboard and management-depth parity
3. Report/output parity
4. Trust/suppression/QA parity
5. Buyer-facing parity closeout

De exacte stack wordt nog niet in dit document geopend; dat hoort in de volgende stap.

---

## 9. Testplan

### Product acceptance
- [ ] Dit document legt het huidige TeamScan parity-profiel scherp en repo-gebaseerd vast.
- [ ] Het onderscheid tussen echte parity-gaps en bewuste bounded scope is expliciet.
- [ ] Het document maakt duidelijk dat parity geen feature inflation betekent.

### Codebase acceptance
- [ ] Observaties zijn herleidbaar naar huidige TeamScan code, docs, tests en routeactivatie.
- [ ] Het plan opent nog geen implementatie.
- [ ] Er is nog geen scopelek naar manager-, hierarchy- of broader team tooling.

### Runtime acceptance
- [ ] Het parity-profiel sluit aan op de huidige TeamScan-runtime, niet op gewenste toekomstbeelden.
- [ ] Dashboard, output, trust en buyer-facing laag zijn allemaal meegenomen.

### QA acceptance
- [ ] De grootste parity-gap is expliciet benoemd.
- [ ] De huidige sterke delen zijn ook expliciet benoemd.
- [ ] Het document is bruikbaar als startpunt voor een parity-wave stack.

### Documentation acceptance
- [ ] Dit document functioneert als actieve source of truth voor TeamScan parity gap analysis.
- [ ] Het sluit aan op [PRODUCT_PARITY_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_PARITY_PROGRAM_PLAN.md).
- [ ] De volgende toegestane stap is helder begrensd.

---

## 10. Assumptions / Defaults

- TeamScan blijft een bounded follow-on route.
- `department`-first mag blijven bestaan in parity-vorm.
- Report parity is de grootste objectieve volwassenheidsgap.
- Trust en privacy zijn eerder sterke punten dan zwakke punten van TeamScan.
- We verbeteren TeamScan eerst in volwassenheid, niet in breedte.

---

## 11. Next Allowed Step

De eerstvolgende toegestane stap is:

- `TEAMSCAN_PARITY_WAVE_STACK_PLAN.md`

Nog niet toegestaan:

- TeamScan parity-implementatie zonder wave stack
- Onboarding parity-openzet vóór TeamScan parity stack is vastgezet
- nieuwe TeamScan-scope buiten de huidige bounded productdefinitie
