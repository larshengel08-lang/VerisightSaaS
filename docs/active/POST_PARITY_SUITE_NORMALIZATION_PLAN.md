# POST_PARITY_SUITE_NORMALIZATION_PLAN.md

## 1. Summary

Dit document is de uitvoerbare source of truth voor de fase **na** het afgeronde parity-programma.

De kernsituatie is nu:

- `TeamScan` is paritywaardig gesloten
- `Onboarding 30-60-90` is paritywaardig gesloten
- `Leadership Scan` is paritywaardig gesloten
- de suite bevat nu meerdere volwassen productlijnen naast `ExitScan` en `RetentieScan`

Daardoor verschuift de hoofdvraag van:

- "kunnen deze follow-on producten bestaan?"

naar:

- "hoe zorgen we dat de totale suite nu scherp, begrijpelijk, commercieel logisch en intern consistent blijft?"

Dit document opent daarom **geen nieuw product** en **geen nieuwe scale-up buildtrack**.

Het opent wel de volgende gecontroleerde fase:

- suite normalization

Doel van die fase:

- de actuele suite opnieuw als één coherent productsysteem scherp zetten
- productcopy, routehiërarchie, pricinglogica, CTA-logica, trustframing en commercial routing opnieuw uitlijnen
- voorkomen dat de bredere productset buyer-facing diffuus, overlappend of catalogusachtig gaat lezen

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: not started
- Next allowed step: `POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md`

---

## 2. Current Suite Baseline

De suite is nu volwassen op productniveau en bestaat buyer-facing uit:

- `ExitScan`
- `RetentieScan`
- `Combinatie`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`
- `Leadership Scan`

Runtime-producten:

- `exit`
- `retention`
- `pulse`
- `team`
- `onboarding`
- `leadership`

Belangrijke huidige waarheid:

- de suite is nu rijker dan in de fase waarin `ExitScan` en `RetentieScan` nog bijna alleen stonden
- de nieuwe productlijnen zijn niet langer "upcoming" of "experimenteel", maar paritywaardig bounded producten
- juist daardoor moet de totale suite opnieuw worden genormaliseerd

---

## 3. Why Normalization Now

Nu parity bereikt is, ontstaan andere risico’s dan eerder:

- de suite kan commercieel diffuser gaan lezen
- follow-on routes kunnen te veel op elkaar gaan lijken
- pricing, CTA’s en routekeuze kunnen impliciet gaan afwijken van de beoogde suitehiërarchie
- buyer-facing copy kan sterker of breder gaan lijken dan de gewenste intakevolgorde
- interne delivery, trust en proof kunnen productmatig kloppen maar suitebreed nog niet strak genoeg voelen

Dus:

- parity sloot productvolwassenheid
- normalization moet nu suitehelderheid sluiten

---

## 4. What This Phase Is

Deze fase is:

- suite-level productnormalisatie
- commercial architecture refinement
- route- en messaging-alignment
- portfolioherkadering nu alle follow-on routes paritywaardig zijn

Deze fase is niet:

- een nieuw productprogramma
- een nieuwe paritytrack
- een brede enterprise/scale-up build
- een billing/checkout uitbreiding
- een nieuwe roadmap-uitbreiding

---

## 5. Core Questions To Answer

De normalizationfase moet nu expliciet antwoord geven op:

1. Wat is nu de echte suitehiërarchie?
2. Wanneer blijft `ExitScan` de default eerste route?
3. Wanneer mag `RetentieScan` primair zijn?
4. Wanneer is `Combinatie` echt logisch en wanneer niet?
5. Hoe worden `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` buyer-facing gepositioneerd zonder onderlinge overlap?
6. Welke routeclaims zijn nu te breed, te vaag of te vergelijkbaar?
7. Welke pricing- en CTA-logica hoort bij een volwassen core-first suite?
8. Welke trust-, proof- en rapporttaal moet suitebreed worden gelijkgetrokken?

---

## 6. Scope In

- suite messaging normalisatie
- routehiërarchie
- CTA- en funnelnormalisatie
- pricing-/packagingalignment
- trust/proof/rapporttaal op suiteniveau
- commerciële helderheid tussen core routes en follow-on routes
- documentation en gating voor deze normalisatiefase

## 7. Scope Out

- nieuwe productlijnen
- nieuw paritywerk
- scale-up platformbouw
- enterprise controls
- connectors
- identity hardening
- nieuwe billing-uitbreiding
- brede checkoutverbreding

---

## 8. Proposed Execution Order

De eerstvolgende veilige volgorde is:

1. `POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md`
2. `WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md`
3. `WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md`
4. `WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md`
5. `WAVE_04_SUITE_NORMALIZATION_CLOSEOUT.md`

Dat betekent:

- eerst de stack en gates vastzetten
- daarna pas gecontroleerde normalisatie-waves

---

## 9. Defaults Chosen

- `ExitScan` blijft voorlopig de default wedge totdat normalization expliciet anders vastlegt.
- `RetentieScan` blijft de enige situationeel primaire uitzondering.
- `Combinatie` blijft een portfolioroute en geen nieuwe kernroute.
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven volwassen **follow-on routes**, niet gelijkwaardige eerste-intake routes.
- De eerstvolgende fase is normalisatie van de bestaande suite, niet verdere uitbreiding.

---

## 10. Acceptance

### Product acceptance
- [x] Het document maakt duidelijk dat de suite nu een nieuwe fase in gaat: normalisatie in plaats van expansie of parity.

### Codebase acceptance
- [x] Het document sluit aan op de huidige suite-realiteit in de codebase.

### Runtime acceptance
- [x] De huidige buyer-facing en runtime suite wordt als uitgangspunt genomen.

### QA acceptance
- [x] De noodzaak van suitebrede alignment na parity is expliciet gemaakt.

### Documentation acceptance
- [x] Dit document kan direct dienen als startpunt voor de volgende wave stack.

---

## 11. Next Allowed Step

Na dit document mag nu openen:

- `POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md`
