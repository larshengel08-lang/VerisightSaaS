# WAVE_04_SUITE_NORMALIZATION_CLOSEOUT.md

## 1. Title

Formally close out post-parity suite normalization by confirming that the current Verisight suite now behaves, sells, and explains itself as one coherent core-first product system.

## 2. Korte Summary

Deze wave volgt direct op:

- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)
- [WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md)
- [WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md)

De normalisatiefase had vier doelen:

- de actuele suitehiërarchie expliciet en centraal maken
- CTA-, pricing- en intakeframing core-first normaliseren
- trust-, proof- en outputtaal suitebreed alignen
- daarna pas formeel vastleggen dat de post-parity suite nu als nieuwe baseline mag gelden

Status:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed track after green completion: een nieuwe expliciete keuze buiten suite normalization

Close-out uitkomst:

- `ExitScan` blijft expliciet de default wedge
- `RetentieScan` blijft expliciet de enige situationeel primaire uitzondering
- `Combinatie` blijft een portfolioroute en geen derde kernproduct
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` zijn nu niet alleen paritywaardig, maar ook suitebreed genormaliseerd als bounded follow-on routes
- routehiërarchie, CTA/pricing/intake en trust/proof/output spreken nu dezelfde core-first taal

Repo-brede validatie waarop deze close-out steunt:

- `cmd /c npm test` -> `99 passed`
- `cmd /c npm run build` -> groen
- `cmd /c npx next typegen` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -q` -> `3 passed`

---

## 3. Why This Closeout Now

Na `WAVE_03` zijn de drie open normalisatievragen inhoudelijk dicht:

- de suite-registratie en live routehiërarchie zijn gecorrigeerd
- de commerciële laag stuurt rustiger op de juiste eerste route
- de trust- en prooflaag verkoopt niet rijker of vlakker dan de huidige output werkelijk draagt

Daardoor is er geen actieve normalisatiegap meer die nog een aparte wave vraagt binnen deze fase.

---

## 4. Planned User Outcome

Na deze close-out is voor Verisight expliciet duidelijk:

- wat de nieuwe suite-baseline is
- welke bounded asymmetrieën bewust blijven bestaan
- dat de suite nu weer geschikt is als vertrekpunt voor een volgende expliciete strategische keuze

---

## 5. Scope In

- formele suite-normalization closeout
- closeout verdict per normalisatielaag
- bounded verschillen-check
- docs- en QA-sync op suitebaseline

## 6. Scope Out

- nieuwe productlijnen
- nieuwe scale-up of billing-uitbreiding
- nieuwe paritytracks
- nieuwe suitewaves binnen deze fase

---

## 7. Normalization Verdict By Layer

### Layer 1 - Suite Positioning And Route Hierarchy

Verdict: genormaliseerd

Waarom:

- de centrale marketingregistratie en live suite spreken dezelfde taal
- follow-on routes zijn live en bounded, niet meer semantisch gereserveerd

### Layer 2 - CTA, Pricing, And Funnel Logic

Verdict: genormaliseerd

Waarom:

- de commerciële laag houdt `ExitScan` als default wedge
- contactintake en pricing maken follow-on routes kleiner en later leesbaar

### Layer 3 - Trust, Proof, And Output Alignment

Verdict: genormaliseerd

Waarom:

- publieke deliverable-proof blijft bewust core-first
- bounded follow-on output is eerlijk gepositioneerd zonder sample-parity te veinzen
- trust, preview en llms/public summary vertellen hetzelfde evidenceverhaal

---

## 8. Bounded Differences That Stay Locked

Deze verschillen mogen expliciet blijven zonder de suite-normalisatie te schaden:

- `ExitScan` en `RetentieScan` blijven de enige kernproducten
- `Combinatie` blijft een portfolioroute, geen kernproduct
- publieke sample-proof blijft bewust op `ExitScan` en `RetentieScan`
- follow-on routes blijven bounded en worden niet gelijkgetrokken tot vlakke first-intake producten

Oordeel:

- dit zijn bewuste suitekeuzes
- dit zijn geen resterende normalisatiegaps

---

## 9. Work Breakdown

### Track 1 - Final Suite Review

Tasks:

- [x] De suite nog eenmaal langs alle normalisatielagen gelopen.
- [x] Bevestigd welke gaps echt dicht zijn.
- [x] Bevestigd welke bounded verschillen expliciet mogen blijven.

Definition of done:

- [x] Er is een expliciet close-out oordeel per laag.
- [x] Er is geen impliciete "bijna genormaliseerd" status meer.

### Track 2 - Acceptance And Baseline Sync

Tasks:

- [x] Bevestigd dat code, docs, tests en build op dezelfde suite-baseline staan.
- [x] Bevestigd dat de buyer-facing suite weer als één coherent productsysteem leest.
- [x] Vastgelegd dat een volgende stap nu weer een expliciete keuze moet zijn, niet een automatische vervolgwave.

Definition of done:

- [x] De post-parity suitebaseline is formeel dichtgezet.
- [x] De volgende fase kan starten vanuit expliciete suitewaarheid in plaats van losse deelcorrecties.

---

## 10. Acceptance

### Product acceptance
- [x] De suite leest weer als één core-first productsysteem.

### Codebase acceptance
- [x] Registries, pricing/intake en trust/proof spreken dezelfde suitewaarheid.

### Runtime acceptance
- [x] Buyer-facing claims blijven binnen de huidige outputgrenzen.

### QA acceptance
- [x] Relevante regressies en buildgates zijn groen.

### Documentation acceptance
- [x] De close-out is expliciet en synchroon vastgelegd.

---

## 11. Exit Gate

Deze wave is klaar wanneer:

- [x] de normalisatie per laag expliciet bevestigd is
- [x] bounded verschillen expliciet gelockt zijn
- [x] code, docs, tests en build samen een coherente suitebaseline dragen
- [x] er geen automatische vervolg-wave binnen deze fase meer openstaat

---

## 12. Next Allowed Step

Na deze close-out opent er geen automatische nieuwe buildwave.

De volgende stap moet nu weer expliciet gekozen worden, bijvoorbeeld:

- verdere commercialization of scale-up implementatie
- nieuwe suite-consolidatie buiten deze fase
- of een nieuwe strategische product/ops-keuze
