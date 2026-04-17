# PRODUCT_PARITY_PROGRAM_PLAN.md

## 1. Summary

Dit plan brengt `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` gecontroleerd naar een **vergelijkbaar volwassenheidsniveau** als `ExitScan` en `RetentieScan`, zonder ze kunstmatig naar dezelfde vorm te dwingen en zonder opnieuw breed uit te bouwen.

De hoofdrichting is:

- parity betekent hier **niet**: alle producten even groot maken
- parity betekent wel: elk product moet dezelfde volwassenheidslat halen op:
  - methodiek
  - survey- en interpretatielogica
  - dashboard- en managementoutput
  - rapportkwaliteit
  - buyer-facing positionering
  - trust/privacy/boundaries
  - QA en acceptance discipline
- `ExitScan` en `RetentieScan` zijn de referentielat voor volwassenheid
- `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` worden **één product tegelijk** naar die lat gebracht

Belangrijke huidige repo-realiteit:

- alle drie zijn inmiddels **runtime-producten** met eigen `scan_type`
- alle drie zijn ook **buyer-facing geactiveerd** als bounded follow-on routes
- alle drie zijn bewust nog kleiner en strakker begrensd dan `ExitScan` en `RetentieScan`
- er is al parity-achtig materiaal in de repo aanwezig:
  - [EXITSCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_PRODUCT_SHARPENING_PLAN.md)
  - [RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md)
  - [REPORTING_SYSTEM_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORTING_SYSTEM_SHARPENING_PLAN.md)
  - [METHOD_AND_TRUST_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_AND_TRUST_SYSTEM_PLAN.md)
  - [MANAGEMENT_ACTIONABILITY_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/MANAGEMENT_ACTIONABILITY_PLAN.md)

Dit plan kiest daarom expliciet voor:

- **geen nieuwe productlijnen**
- **geen generieke platformverbreding puur voor later**
- **geen parallelle paritytrajecten op drie producten tegelijk**
- **wel één parity-programma met een vaste volwassenheidslat**
- **wel product-voor-product gap analysis**
- **wel parity-waves per productlijn**

Aanbevolen volgorde:

1. `TeamScan`
2. `Onboarding 30-60-90`
3. `Leadership Scan`

Die volgorde is bewust gekozen:

- `TeamScan` ligt het dichtst bij managementbruikbaarheid, maar heeft nog de meeste lokalisatie-, privacy- en outputdiscipline nodig
- `Onboarding` heeft een heldere lifecycle-logica, maar nog beperkte checkpoint- en reportvolwassenheid
- `Leadership Scan` is commercieel aantrekkelijk, maar ook het gevoeligst voor overclaiming, trustfouten en boundary drift

---

## 2. Milestones

### Milestone 0 - Freeze The Parity Standard
Dependency: none

#### Tasks
- [ ] Leg vast wat “op ExitScan/RetentieScan-niveau” concreet betekent voor Verisight-producten.
- [ ] Definieer één parity-lat met precies deze volwassenheidslagen:
  - methodiek
  - survey/instrument
  - scoring/interpretatie
  - dashboard/decision support
  - rapport/output
  - buyer-facing positionering
  - trust/privacy/boundaries
  - tests/smoke/acceptance
- [ ] Bepaal welke kenmerken van `ExitScan` en `RetentieScan` als referentie gelden:
  - niet hun precieze inhoud
  - wel hun volwassenheid en productdiscipline
- [ ] Leg expliciet vast welke vormen van valse parity we niet nastreven:
  - geen kunstmatige feature-symmetrie
  - geen brede productverbreding puur om gelijk te lijken
  - geen forcing naar identieke reportstructuren als dat inhoudelijk niet klopt

#### Definition of done
- [ ] Er is één expliciete parity-lat voor de drie follow-on producten.
- [ ] Het programma weet wat parity wél en niet betekent.
- [ ] De referentielat is herleidbaar naar de huidige volwassenheid van `ExitScan` en `RetentieScan`.

#### Validation
- [ ] De parity-lat is controleerbaar te koppelen aan bestaande active plans en huidige runtime-output.
- [ ] Het plan voorkomt dat parity verward wordt met feature inflation.

---

### Milestone 1 - TeamScan Gap Analysis Against The Parity Standard
Dependency: Milestone 0

#### Tasks
- [ ] Analyseer de huidige `TeamScan`-keten langs alle parity-lagen:
  - methodiek
  - local read / localization logic
  - dashboard
  - management output
  - report boundary
  - buyer-facing route
  - trust/privacy/suppression
- [ ] Vergelijk `TeamScan` niet met een ideaal toekomstbeeld, maar met de volwassenheidsdiscipline van `ExitScan` en `RetentieScan`.
- [ ] Leg exact vast wat al paritywaardig is en wat nog ontbreekt.
- [ ] Splits de gaps in:
  - echt ontbrekende productvolwassenheid
  - bewuste bounded scope die mag blijven
  - intern inconsistente of te zwakke delen

#### Definition of done
- [ ] Er is één scherp, repo-gebaseerd TeamScan parity gap-profiel.
- [ ] Het is duidelijk wat TeamScan nodig heeft om paritywaardig te worden.
- [ ] Het is ook duidelijk wat níet hoeft te groeien om parity te halen.

#### Validation
- [ ] TeamScan-gapobservaties zijn herleidbaar naar huidige code, docs, dashboard, marketing en tests.
- [ ] Privacy- en lokalisatierisico’s zijn expliciet meegenomen.

---

### Milestone 2 - TeamScan Parity Waves
Dependency: Milestone 1

#### Tasks
- [ ] Vertaal TeamScan-gaps naar 3-5 gecontroleerde parity-waves.
- [ ] Houd de waves verticaal en product-first, bijvoorbeeld:
  - method and interpretation parity
  - dashboard/report parity
  - management handoff parity
  - trust/suppression/QA parity
  - buyer-facing parity closeout
- [ ] Leg expliciet vast welke TeamScan-bounded scopes mogen blijven bestaan.
- [ ] Voeg acceptance en green gates per parity-wave toe.

#### Definition of done
- [ ] TeamScan heeft een uitvoerbare parity-wave stack.
- [ ] Er is geen scopelek naar manager tooling, hierarchy of named leaders.
- [ ] De parityroute is klein, logisch en gated.

#### Validation
- [ ] Elke TeamScan parity-wave heeft product, code, docs, tests en smoke in scope.
- [ ] De wave stack schuift geen nieuwe productcategorie mee.

---

### Milestone 3 - Onboarding Gap Analysis Against The Parity Standard
Dependency: Milestone 0, TeamScan parity stack vastgesteld

#### Tasks
- [ ] Analyseer de huidige `Onboarding 30-60-90`-keten langs alle parity-lagen.
- [ ] Leg vast welke volwassenheidsverschillen logisch zijn door het single-checkpoint karakter.
- [ ] Benoem expliciet waar `Onboarding` nog te smal, te dun of te diffuus is in:
  - checkpointbetekenis
  - managementduiding
  - rapportwaarde
  - buyer-facing helderheid
- [ ] Scheid paritygaps van bewuste scopegrenzen:
  - geen journey engine
  - geen hire-date orchestration
  - geen brede lifecycle software

#### Definition of done
- [ ] Er is één scherp Onboarding parity gap-profiel.
- [ ] Het product kan op volwassenheid worden beoordeeld zonder scopelek naar lifecycle platformwerk.

#### Validation
- [ ] Gapobservaties zijn repo-gebaseerd en herleidbaar.
- [ ] `Onboarding` wordt niet oneigenlijk vergeleken met bredere onboarding softwaremarkten.

---

### Milestone 4 - Onboarding Parity Waves
Dependency: Milestone 3

#### Tasks
- [ ] Vertaal Onboarding-gaps naar 3-5 parity-waves.
- [ ] Orden de waves rond:
  - checkpointmethodiek
  - output/report parity
  - management handoff parity
  - trust/boundary parity
  - buyer-facing parity closeout
- [ ] Leg vast welke bounded karakteristieken expliciet mogen blijven.

#### Definition of done
- [ ] Onboarding heeft een uitvoerbare parity-wave stack.
- [ ] Het pad naar parity is duidelijk zonder productverbreding.

#### Validation
- [ ] Elke wave blijft single-product, uitvoerbaar en acceptatiegedreven.
- [ ] Geen verborgen verschuiving naar lifecycle orchestration.

---

### Milestone 5 - Leadership Scan Gap Analysis Against The Parity Standard
Dependency: Milestone 0, Onboarding parity stack vastgesteld

#### Tasks
- [ ] Analyseer de huidige `Leadership Scan`-keten langs alle parity-lagen.
- [ ] Leg vast waar het product nog te zwak, te gevoelig of te ambigu is op:
  - interpretatie
  - managementoutput
  - buyer-facing belofte
  - trust/privacy/boundaries
- [ ] Gebruik `ExitScan` en `RetentieScan` als volwassenheidsreferentie, niet als inhoudelijke template.
- [ ] Scheid paritygaps van bewuste scopegrenzen:
  - geen named leaders
  - geen 360
  - geen performance framing
  - geen hierarchy/reporting line model

#### Definition of done
- [ ] Er is één scherp Leadership parity gap-profiel.
- [ ] Het is duidelijk welke parity-upgrades nodig zijn zonder overclaiming te vergroten.

#### Validation
- [ ] Gapobservaties zijn repo-gebaseerd en methodisch defensief.
- [ ] Trust- en overclaim-risico’s zijn expliciet meegewogen.

---

### Milestone 6 - Leadership Scan Parity Waves
Dependency: Milestone 5

#### Tasks
- [ ] Vertaal Leadership-gaps naar 3-5 parity-waves.
- [ ] Orden de waves rond:
  - interpretation and method parity
  - output/report parity
  - management handoff parity
  - trust and boundaries parity
  - buyer-facing parity closeout
- [ ] Leg expliciet vast welke bounded scopes hard dicht blijven.

#### Definition of done
- [ ] Leadership Scan heeft een uitvoerbare parity-wave stack.
- [ ] Het product groeit in volwassenheid zonder te verbreden naar 360/performance tooling.

#### Validation
- [ ] Elke wave blijft bounded, uitvoerbaar en acceptance-gedreven.
- [ ] De stack vergroot de productkwaliteit zonder trust erosion.

---

### Milestone 7 - Suite Normalization After Product Parity
Dependency: Milestone 2, 4, 6

#### Tasks
- [ ] Breng na de drie paritystacks de suite opnieuw in lijn op:
  - routehiërarchie
  - pricing / packaging language
  - CTA-logica
  - proof/case framing
  - delivery model
- [ ] Leg vast waar gelijkgetrokken moet worden en waar productverschillen juist expliciet moeten blijven.
- [ ] Bepaal of report parity, management parity en trust parity suitebreed voldoende zijn om de follow-on producten als volwassen te beschouwen.

#### Definition of done
- [ ] Er is één suitebeeld na parity, niet drie losse deelproducten.
- [ ] De suite leest als coherent systeem met een duidelijke wedge en duidelijke follow-on logica.

#### Validation
- [ ] Parity heeft de suite scherper gemaakt, niet diffuser.
- [ ] `ExitScan` blijft de wedge en `RetentieScan` de primaire complementaire uitzondering.

---

## 3. Common Parity Standard

Deze sectie is de vaste volwassenheidslat voor alle drie de producten.

### Layer A - Method And Instrument Quality
- Surveyblokken zijn inhoudelijk verdedigbaar.
- Vraagkwaliteit en respondentbelasting zijn logisch.
- Het product claimt niet meer dan het instrument kan dragen.

### Layer B - Scoring And Interpretation Quality
- Scoring is uitlegbaar en productspecifiek genoeg.
- Interpretatie is rustig, defensief en managementbruikbaar.
- Indicatieve heuristiek leest niet als harde causaliteit.

### Layer C - Dashboard And Decision Support
- Dashboardoutput helpt een managementbeslissing vooruit.
- Producttaal, signalen en vervolgstappen zijn coherent.
- Dashboard voelt niet als tussenstap, maar als echte productoutput.

### Layer D - Report Quality
- Rapport is managementwaardig.
- Rapport ondersteunt het productspecifieke besluitmoment.
- Rapport, dashboard en marketing spreken inhoudelijk dezelfde taal.

### Layer E - Buyer-Facing Clarity
- Het product is snel begrijpelijk:
  - waarvoor is het
  - wanneer kies je het
  - wanneer juist niet
  - wat krijg je terug
- Buyer-facing claims blijven in lijn met echte output.

### Layer F - Trust, Privacy, And Boundaries
- Privacy/suppressie is expliciet en betrouwbaar.
- Boundaries zijn buyer-facing en runtime consistent.
- Het product roept geen te brede verwachtingen op.

### Layer G - Operational And QA Maturity
- Product, code, docs, tests en smoke zijn synchroon.
- Acceptance is herhaalbaar.
- Het product kan zonder “toelichtingsschuld” draaien.

---

## 4. Sequence Rules

- Er mag altijd maar **één actieve parity-wave tegelijk** openstaan.
- Eerst wordt een parity-gap-profiel vastgesteld.
- Daarna wordt de parity-wave stack voor dat product vastgezet.
- Daarna pas mag de eerste parity-wave gebouwd worden.
- Een product gaat pas uit paritytraject zodra:
  - product
  - code
  - docs
  - tests
  - smoke
  - acceptance
  groen zijn op de parity-lat
- Pas daarna opent het volgende product.

Volgorde:

1. `TeamScan`
2. `Onboarding 30-60-90`
3. `Leadership Scan`
4. daarna pas suite normalization

---

## 5. Testplan

### Product acceptance
- [ ] Voor elk product is parity gedefinieerd als volwassenheidslat, niet als feature inflation.
- [ ] Elk product heeft een eigen gap-profiel en parity-wave stack.
- [ ] De suite wordt na parity scherper in plaats van diffuser.

### Codebase acceptance
- [ ] Parity-waves blijven product-first en bounded.
- [ ] Shared infrastructuur groeit alleen waar daar een directe productreden voor is.
- [ ] Geen parallelle half-afgemaakte paritytrajecten.

### Runtime acceptance
- [ ] Elk paritytraject eindigt pas na echte green close-out.
- [ ] Buyer-facing routes blijven aligned met werkelijke productoutput.
- [ ] Report, dashboard en managementoutput worden meegenomen in parity, niet uitgesteld.

### QA acceptance
- [ ] Er komt per product een concrete smoke- en acceptance set.
- [ ] Trust/privacy/boundaries zijn expliciet onderdeel van parity, niet een latere bijlage.
- [ ] Follow-on producten worden pas “volwassen” genoemd als ook de report- en QA-lagen paritywaardig zijn.

### Documentation acceptance
- [ ] Dit document blijft de source of truth voor het parity-programma.
- [ ] Elke vervolgstap verwijst naar dit programma en één actief productspoor.
- [ ] De parity-volgorde en gatingregels blijven expliciet zichtbaar.

---

## 6. Assumptions / Defaults

- `ExitScan` en `RetentieScan` blijven de volwassenheidsreferentie.
- `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven follow-on producten, ook na parity.
- Parity betekent **gelijke kwaliteit en volwassenheid**, niet gelijke grootte.
- `TeamScan` is de eerste paritykandidaat.
- Report parity is een verplicht onderdeel van volwassenheid; zonder sterke output blijft een product onder de lat hangen.
- We werken product voor product, nooit drie paritysporen tegelijk.

---

## 7. Next Allowed Step

De eerstvolgende toegestane stap is:

- `TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md`

Nog niet toegestaan:

- parallelle parityplannen voor `Onboarding` en `Leadership`
- directe implementatie van parity-waves zonder gap-profiel
- nieuwe productexpansie tijdens dit parity-programma
