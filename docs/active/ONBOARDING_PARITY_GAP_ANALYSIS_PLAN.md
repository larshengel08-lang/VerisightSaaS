# ONBOARDING_PARITY_GAP_ANALYSIS_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de **parity gap analysis** van `Onboarding 30-60-90` tegen de volwassenheidslat van `ExitScan` en `RetentieScan`.

Het doel is niet om `Onboarding 30-60-90` kunstmatig te verbreden naar lifecycle software, maar om scherp vast te leggen:

- waar `Onboarding 30-60-90` nu al paritywaardig is
- waar het nog onder de volwassenheidslat zit
- welke gaps echte productvolwassenheid raken
- welke bounded keuzes gewoon mogen blijven bestaan

Deze analyse is expliciet gebaseerd op de huidige repo-realiteit:

- `Onboarding 30-60-90` is gebouwd als eigen `scan_type = onboarding`
- het product heeft dashboardoutput, checkpointinterpretatie en managementhandoff
- het staat buyer-facing live als bounded follow-on route
- het blijft bewust single-checkpoint-per-campaign, assisted en non-journey
- de reportroute geeft vandaag nog bewust `422` voor onboarding-PDF

Belangrijk:

- parity betekent hier **gelijke kwaliteit en volwassenheid**
- parity betekent hier **niet**: journey engine, hire-date orchestration of brede onboarding software
- `ExitScan` en `RetentieScan` blijven de referentielat voor volwassenheid, niet de inhoudelijke template

Status van deze analyse:

- Analysis status: completed
- Active source of truth after approval: dit document
- Build permission: not started
- Next allowed step: `ONBOARDING_PARITY_WAVE_STACK_PLAN.md`

Belangrijkste uitkomst:

- onboarding is al relatief sterk in bounded positionering, checkpoint-interpretatie en buyer-facing discipline
- de grootste objectieve parity-gap zit nu in **report/formal output parity**
- daarnaast zijn er middelgrote gaps in **methodische checkpointdiepte** en **managementwaarde van een enkel checkpoint**
- bounded keuzes zoals single-checkpoint, assisted delivery en non-journey mogen expliciet blijven bestaan

---

## 2. Current Onboarding Baseline

### Current product position

`Onboarding 30-60-90` staat nu in de suite als:

- runtime-product met eigen `scan_type = onboarding`
- bounded follow-on route
- assisted single-checkpoint lifecycle-check voor nieuwe medewerkers
- managementproduct voor:
  - hoe het eerste onboardingmoment nu landt
  - waar eerste onboardingfrictie zit
  - welke eerste herstel- of verduidelijkingsactie logisch is

`Onboarding 30-60-90` is expliciet niet:

- een brede onboarding suite
- een journey engine
- hire-date orchestration
- multi-checkpoint lifecycle automation
- client onboarding tooling

### Current bounded truths that should remain bounded

Deze keuzes zijn nu geen parityprobleem op zichzelf:

- single-checkpoint per campaign
- geen hire-date model
- geen journey-state machine
- geen brede lifecycle orchestration
- assisted productvorm

Dat zijn alleen paritygaps als de output daardoor te zwak, te dun of intern inconsistent blijft.

---

## 3. Reference Parity Standard

Onboarding wordt in deze analyse langs dezelfde volwassenheidslagen gelegd als `ExitScan` en `RetentieScan`:

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

Onboarding heeft nu een duidelijke plek in de suite:

- vroege lifecycle-route
- bounded checkpoint in plaats van brede onboarding-software
- eerste managementhandoff rond nieuwe instroom

Dat is strategisch scherp en voorkomt dat onboarding te vroeg als brede journey-suite leest.

### B. Buyer-facing route is unusually disciplined

De publieke onboardingroute is al opvallend strak begrensd:

- expliciet geen client onboarding-tool
- expliciet geen journey-engine
- expliciet geen brede employee lifecycle-suite
- expliciet assisted single-checkpoint read

Dat is sterk, omdat veel parityproblemen normaal juist beginnen bij te brede buyer-facing beloftes.

### C. Dashboard interpretation is already meaningfully product-specific

De huidige dashboardlaag in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts) doet al meer dan alleen signalen tonen:

- `stable_checkpoint`, `attention_checkpoint` en `high_attention_checkpoint`
- expliciete managementBandOverride
- eerste eigenaar
- eerste actie
- review- en escalatiegrens

Daardoor voelt onboarding al als managementroute en niet alleen als losse snapshot.

### D. Trust and boundary language is already comparatively strong

In [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/definition.ts) en de publieke route blijft onboarding expliciet:

- groepsniveau
- geen individuele beoordeling
- geen performance-instrument
- geen retentievoorspeller
- geen volledige 30-60-90 trend- of cohortmodel

Dat maakt onboarding inhoudelijk defensiever en helderder dan veel vroege lifecycleproducten.

---

## 5. Current Gaps By Layer

### Layer 1 - Method And Instrument Quality

#### What is already strong

- onboarding heeft een duidelijke managementvraag
- de instrumentlogica sluit aan op vroege landing in rol, leiding, team en werkcontext
- de single-checkpoint vorm is methodisch eerlijker dan een halfgebouwde journey

#### Main gaps

- de checkpointmethodiek leest nog relatief compact en smal; het product leunt sterk op één momentread zonder al volledig paritywaardige productspecifieke diepte
- de betekenis van “30-60-90” is buyer-facing sterk, maar methodisch nog bewust teruggebracht naar één checkpoint per campaign
- de vertaalslag van vroege lifecycle-vraag naar precies wat dit instrument meet, en wat nog niet, kan nog rijker en rustiger

#### Parity judgment

Nog **onder parity**, maar verdedigbaar bounded. De kern is niet te breed, maar nog niet volledig zo volwassen als de kernproducten.

---

### Layer 2 - Scoring And Interpretation Quality

#### What is already strong

- onboarding heeft expliciete checkpointstates
- direction read en managementbanden zijn productspecifiek
- de route vermijdt voorspeltaal en overclaiming

#### Main gaps

- de interpretatie is sterk voor een enkele checkpointread, maar nog niet zo rijk of gelaagd als `ExitScan` en `RetentieScan`
- onboarding hangt nog relatief zwaar op managementcopy en handofflogica; de onderliggende interpretatiediepte van een enkel checkpoint kan nog steviger
- de stap van checkpointsignaal naar bredere managementbetekenis is bruikbaar, maar nog wat dun wanneer je die naast de kernproducten legt

#### Parity judgment

**Deels paritywaardig**, maar nog niet volledig. Veilig genoeg, inhoudelijk nog niet helemaal rijk genoeg.

---

### Layer 3 - Dashboard And Decision Support Quality

#### What is already strong

- onboarding-dashboard is duidelijk managementgericht
- eigenaar, eerste actie en reviewgrens zijn ingebouwd
- stable vs attention vs high_attention leest productmatig coherent

#### Main gaps

- de managementwaarde van één checkpoint blijft nog relatief compact
- onboarding helpt goed bij een eerste gesprek, maar nog minder bij het structureren van de vervolgronde dan de kernproducten
- de dashboardlaag is overtuigend, maar de productvolwassenheid rust nog sterk op bounded copy in plaats van op bredere decision support diepte

#### Parity judgment

Nog **onder parity**, maar dichtbij. Dit is een middelgrote gap, geen fundamentele zwakte.

---

### Layer 4 - Report Quality

#### What is already strong

- er is een duidelijke buyer-facing route
- er is dashboardoutput die als basis voor formele output kan dienen

#### Main gaps

- onboarding geeft vandaag nog bewust `422` op de reportroute in [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- daarmee blijft de formele managementoutput objectief achter op de buyer-facing belofte en dashboardkwaliteit
- zolang formele output ontbreekt, blijft onboarding onder de volwassenheidslat van `ExitScan` en `RetentieScan`

#### Parity judgment

**Duidelijk onder parity**. Dit is de grootste objectieve parity-gap van onboarding.

---

### Layer 5 - Buyer-Facing Clarity

#### What is already strong

- de onboarding-route in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) is scherp en eerlijk
- overlap met client onboarding, brede lifecycle tooling en retentievoorspelling wordt actief begrensd
- de route leest als assisted managementread, niet als softwarecatalogus

#### Main gaps

- de buyer-facing route is op dit moment volwassener dan de formele outputlaag
- de productbelofte is inhoudelijk goed, maar nog niet overal volledig gedragen door formele artefacten

#### Parity judgment

**Vrij sterk**, maar nog niet volledig paritywaardig zolang report/output achterloopt.

---

### Layer 6 - Trust, Privacy, And Boundaries

#### What is already strong

- expliciete non-performance en non-predictive taal
- groepsniveau en assisted framing
- duidelijke grens tegen journey- en client-onboarding verwarring

#### Main gaps

- trust en interpretatiegrenzen zijn vooral sterk in dashboard en buyer-facing copy; formele output kan dit nog niet volledig dragen omdat die nog ontbreekt
- parity vraagt dat dezelfde trustlaag straks ook in report- en acceptancegedrag zichtbaar wordt

#### Parity judgment

**Bijna paritywaardig**. Trust is hier eerder een kracht dan een zwakte, maar moet later nog formeler worden verankerd.

---

### Layer 7 - Operational And QA Maturity

#### What is already strong

- onboarding is via gecontroleerde waves opgebouwd
- er zijn dashboardtests en API-acceptance rond de bounded route
- de productgrenzen zijn duidelijk

#### Main gaps

- zolang report/output bewust ontbreekt, is de totale acceptance asymmetrisch
- de productvolwassenheid is nu sterker in dashboard en route dan in formele delivery artefacten
- parity-closeout zal later product, report, trust en buyer-facing discipline in één groene close-out moeten meenemen

#### Parity judgment

Nog **onder parity**, vooral door de report/output-asymmetrie.

---

## 6. Onboarding Parity Gap Summary

### Already close to parity

- suite role and bounded lifecycle logic
- buyer-facing clarity
- trust and boundary posture
- first management handoff

### Clear medium gaps

- checkpointmethodiek en productspecifieke diepte
- interpretatierijkdom van een enkel checkpoint
- dashboard-to-management depth van de vervolgronde
- operational acceptance als volledig product

### Largest parity gap

- **report quality / formal output parity**

Zolang onboarding geen paritywaardige formele output heeft, blijft het product onder de volwassenheidslat hangen, ook als buyer-facing route en dashboard al relatief sterk zijn.

---

## 7. What Should Stay Bounded

Deze onderdelen hoeven niet te openen om parity te halen:

- geen journey engine
- geen hire-date orchestration
- geen multi-checkpoint automation
- geen brede lifecycle-suite
- geen client onboarding tooling
- geen individuele onboardingbeoordeling

Parity voor onboarding is dus:

- **betere kwaliteit**
- **rijkere checkpointduiding**
- **volwassenere formele output**
- **sterkere managementwaarde binnen een smalle productvorm**

---

## 8. Work Breakdown

### Track 1 - Current Repo-Based Baseline

Tasks:

- [x] De huidige onboarding-keten langs instrument, dashboard, report, buyer-facing route en trust geanalyseerd.
- [x] Vastgelegd wat de huidige single-checkpoint vorm al sterk maakt.
- [x] Vastgelegd waar het product nog dun of asymmetrisch leest.

Definition of done:

- [x] Er is een scherp repo-gebaseerd onboarding baseline-profiel.
- [x] Het is duidelijk wat huidige kracht is en wat echte parity-gap is.

### Track 2 - Parity Judgment By Layer

Tasks:

- [x] Onboarding per volwassenheidslaag beoordeeld.
- [x] Echte paritygaps gescheiden van bounded keuzes die mogen blijven.
- [x] Expliciet benoemd waar het product nog te smal, te diffuus of te commercieel voorloopt op de output.

Definition of done:

- [x] Er is een expliciet parity-oordeel per laag.
- [x] Bounded scope en onvolwassenheid worden niet door elkaar gehaald.

### Track 3 - Gap Summary And Next Allowed Step

Tasks:

- [x] De grootste parity-gap(s) samengevat.
- [x] Vastgelegd welke laag eerst omhoog moet.
- [x] De opening van `ONBOARDING_PARITY_WAVE_STACK_PLAN.md` voorbereid.

Definition of done:

- [x] Het eerstvolgende onboarding parity-pad is logisch en uitvoerbaar.
- [x] Er is geen scopelek naar lifecycle platformwerk.

---

## 9. Acceptance

### Product acceptance
- [x] Het document maakt duidelijk wat onboarding nu al sterk doet en waar het nog onder de parity-lat zit.

### Codebase acceptance
- [x] Observaties zijn herleidbaar naar de huidige implementatie.

### Runtime acceptance
- [x] Dashboard, output, route en trust worden als een geheel beoordeeld.

### QA acceptance
- [x] Bekende acceptance- of outputasymmetrieen zijn expliciet meegenomen.

### Documentation acceptance
- [x] Dit document kan direct dienen als source of truth voor de onboarding parity-wave stack.

---

## 10. Next Allowed Step

Na afronding van deze analyse mag nu openen:

- `ONBOARDING_PARITY_WAVE_STACK_PLAN.md`
