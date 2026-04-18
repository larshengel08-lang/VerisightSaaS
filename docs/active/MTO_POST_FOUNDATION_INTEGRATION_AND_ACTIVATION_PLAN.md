# MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de fase **na** het groen gesloten MTO-foundation traject.

De kernsituatie is nu:

- `MTO` bestaat technisch en productmatig als bounded nieuwe productlijn
- MTO heeft een eigen survey-, dashboard-, report-to-action- en operatorbasis
- de productlijn is intern groen, maar nog niet suitebreed gekoppeld of buyer-facing geactiveerd
- het bestaande live Verisight-proces is bewust nog niet door MTO overschreven

Daardoor verschuift de hoofdvraag van:

- "kan MTO als nieuwe hoofdmeting technisch en productmatig bestaan?"

naar:

- "hoe koppelen we MTO gecontroleerd aan de suite, openen we het later buyer-facing, en bereiden we de latere hoofdmodeltransitie voor zonder het bestaande proces nu te ontwrichten?"

Dit document opent daarom niet direct:

- live vervanging van bestaande routes
- een brede portfoliorefactor
- of een onmiddellijke buyer-facing hoofdpositionering

Het opent wel de volgende gecontroleerde fase:

- post-foundation MTO integration and activation

Doel van die fase:

- MTO gecontroleerd uit de interne island-status halen
- MTO bounded aan suite-, intake- en portfolio-oppervlakken koppelen
- buyer-facing activatie pas gefaseerd openen
- de latere transitie van MTO naar mogelijk hoofdmodel bestuurlijk voorbereiden zonder die al uit te voeren

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: not started
- Next allowed step: `MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_WAVE_STACK_PLAN.md`

---

## 2. Current MTO Baseline

De foundation track heeft nu aantoonbaar geopend:

- runtime productregistratie voor `scan_type = mto`
- MTO surveydefinitie en scoringbasis
- organisatiebrede MTO dashboardread
- bounded report-to-action en action-log koppeling via bestaande spines
- delivery- en operatorhardening voor MTO

De codebase laat tegelijk zien dat MTO nog **niet** volledig suitegekoppeld of commercieel geopend is:

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/marketing-products.ts) houdt MTO nog op `reserved_future`
- publieke suite-oppervlakken zijn nog niet ingericht op MTO als live route
- de foundation closeout gate houdt buyer-facing activatie en hoofdmodeltransitie expliciet dicht
- portfolio- en intakehiërarchie zijn nog niet opnieuw vastgezet voor een wereld waarin MTO later hoofdmodel kan worden

Belangrijke huidige waarheid:

- MTO is intern productmatig groen
- MTO is nog niet live suitebreed genormaliseerd
- MTO mag nu niet ongemerkt het bestaande kernproces verdringen

---

## 3. Why This Phase Now

Na de foundation closeout ontstaan andere risico’s dan in de eerste MTO-track:

- MTO kan te lang een technisch bestaande maar portfolio-onzichtbare route blijven
- MTO kan te vroeg buyer-facing worden geopend zonder genoeg suite-, intake- en claimdiscipline
- MTO kan te vroeg als nieuw hoofmodel worden geframed zonder governancelaag voor migratie
- losse integratiestappen kunnen het huidige ExitScan/RetentieScan-proces onbedoeld vervuilen

Dus:

- foundation sloot productmatige bestaansvatbaarheid
- deze fase moet gecontroleerde integratie, activatie en transitievoorbereiding sluiten

---

## 4. What This Phase Is

Deze fase is:

- bounded suite integration voor MTO
- interne intake-, sales- en deliveryreadiness voor een later bredere opening
- gecontroleerde buyer-facing activatievoorbereiding
- governance voor latere hoofdmodeltransitie

Deze fase is niet:

- directe live vervanging van `ExitScan` of `RetentieScan`
- een brede platform- of workflowuitbreiding
- een nieuwe surveybuilder of generieke suite-engine
- een onmiddellijke replatforming van de hele Verisight-portfolio

---

## 5. Core Questions To Answer

Deze fase moet nu expliciet antwoord geven op:

1. Hoe wordt MTO bounded zichtbaar in suite-, intake- en portfoliolaag zonder bestaande live routes te breken?
2. Welke interne commerciële, methodische en operationele lagen moeten groen zijn vóór buyer-facing activatie?
3. Hoe openen we een buyer-facing MTO-route zonder al te claimen dat het nieuwe hoofmodel live leidend is?
4. Welke governance en migratieregels zijn nodig voordat MTO ooit de default of het hoofdmodel van Verisight kan worden?
5. Welke bounded verschillen tussen “MTO live naast de suite” en “MTO als toekomstig hoofdmodel” moeten expliciet blijven?

---

## 6. Scope In

- suitekoppeling voor MTO op bounded niveau
- portfolio-, intake- en routehiërarchie voor MTO
- interne commercial/readinesslagen voor latere activatie
- buyer-facing MTO-activatievoorbereiding
- governance voor latere hoofdmodeltransitie
- documentation en gating voor deze hele vervolgfase

## 7. Scope Out

- directe hoofdmodelmigratie
- automatische deprecatie van bestaande routes
- brede billing-, identity- of entitlementuitbreiding
- generieke workflow- of task-engine
- niet-MTO suiteverbreding

---

## 8. Proposed Execution Order

De eerstvolgende veilige volgorde is:

1. `MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_WAVE_STACK_PLAN.md`
2. `WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md`
3. `WAVE_02_MTO_INTERNAL_INTAKE_AND_COMMERCIAL_READINESS.md`
4. `WAVE_03_MTO_BUYER_FACING_GATED_ACTIVATION.md`
5. `WAVE_04_MTO_PORTFOLIO_HIERARCHY_AND_DEFAULT_ROUTE_GOVERNANCE.md`
6. `WAVE_05_MTO_MAINLINE_TRANSITION_GATE_CLOSEOUT.md`

Dat betekent:

- eerst de stack en gates vastzetten
- daarna pas gecontroleerde uitvoering per wave

---

## 9. Defaults Chosen

- MTO blijft na foundation eerst **intern groen maar buyer-facing nog niet leidend**
- suitekoppeling komt vóór buyer-facing activatie
- buyer-facing activatie komt vóór hoofdmodeltransitie
- bestaande live routes blijven leidend totdat een expliciete governancestap iets anders opent
- MTO wordt in deze fase behandeld als toekomstige kernroute-in-opbouw, niet als al-live vervanger

---

## 10. Acceptance

### Product acceptance
- [x] Het document maakt duidelijk dat MTO nu een nieuwe fase in gaat: integratie, activatievoorbereiding en transitiegovernance.

### Codebase acceptance
- [x] Het document haakt aan op de huidige MTO- en suite-oppervlakken in de codebase.

### Runtime acceptance
- [x] De bestaande live suite blijft uitgangspunt en wordt niet impliciet overschreven.

### QA acceptance
- [x] De noodzaak van gefaseerde integratie- en activatiegates is expliciet gemaakt.

### Documentation acceptance
- [x] Dit document kan direct dienen als startpunt voor de volgende wave stack.

---

## 11. Next Allowed Step

Na dit document mag nu openen:

- `MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_WAVE_STACK_PLAN.md`
