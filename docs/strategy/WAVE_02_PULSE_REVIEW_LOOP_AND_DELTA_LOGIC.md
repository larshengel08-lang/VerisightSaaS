# WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC

## Title

Add a second Pulse slice that turns the current snapshot into a bounded review loop with safe delta reading against the previous Pulse campaign.

## Korte Summary

`WAVE_01` bewees dat Pulse als derde productline technisch en productmatig kan landen binnen de huidige Verisight-runtime: admin setup, surveyflow, scoring, dashboardread en boundary naar report/PDF werken nu end-to-end. Wat nog ontbrak was het kernverschil tussen "een losse korte meting" en "een echte monitoringslaag": management kon nog niet veilig zien of een eerder signaal verbetert, verslechtert of stabiel blijft.

Deze wave voegt daarom geen nieuwe productlijn, geen generieke trendengine en geen nieuwe architectuurlaag toe. In plaats daarvan bouwt `WAVE_02` exact boven op de bestaande Pulse-foundation: gebruik de al aanwezige `previousStats`-haak in de campaign page, haal de vorige relevante Pulse-campaign voor dezelfde organisatie op, bereken een begrensde delta voor top-line Pulse-signaal en richtingsvraag, en toon een Pulse-specifieke reviewsectie die zegt wat er veranderd is, wat eerst opnieuw getoetst moet worden en welke correctie of follow-through nu logisch is.

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md`

Validation snapshot:

- `cmd /c npm test` -> `73 passed`
- `cmd /c npm run build` -> groen
- `cmd /c npx tsc --noEmit` -> groen in seriële run na build
- `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py tests/test_pulse_scoring.py -q` -> `29 passed`
- Twee-cycle Pulse smoke -> groen: `Pulse April` (10 completes, `avg_risk_score 4.75`) naar `Pulse Mei` (10 completes, `avg_risk_score 2.12`), Pulse report blijft bewust `422`
- Dashboard-auth is niet in de smoke omzeild; de reviewdelta zelf is afgedekt via page-integratie plus frontend helpertests op `ready`, `insufficient_data` en shared-factor overlap

## Why This Wave Now

Deze wave volgde direct uit wat al in de codebase bestond:

- de campaign page haalde al `previousStats` op voor dezelfde organisatie en dezelfde `scan_type`
- voor `retention` bestond al een lokaal patroon voor vorige meting, signal averages en trendcards
- voor `pulse` bestond al een eerste snapshot-dashboard, maar nog met expliciete boundary: "geen trendclaim"
- de Pulse-productcopy stuurde al op review en opnieuw kijken, maar de UI leverde die vergelijking nog niet echt

Dat maakte `WAVE_02` de eerstvolgende logische en gecontroleerde uitbreiding:

- niet opnieuw de foundation verbreden
- niet nu al `TeamScan` openen
- eerst de echte Pulse-monitoringwaarde toevoegen binnen dezelfde campaign-centered runtime

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- een Pulse-campaign nog steeds als huidige snapshot kunnen lezen
- daarnaast kunnen zien of de vorige relevante Pulse-cyclus hoger, lager of ongeveer gelijk uitkwam
- kunnen lezen welke gedeelde werkfactoren tussen beide cycli het meest verschoven zijn
- een expliciete reviewrichting zien: wat lijkt te verbeteren, wat vraagt bijsturing, en wat moet opnieuw getoetst worden

Wat deze wave nog niet hoeft te leveren:

- onbeperkte historische trendreeksen
- generieke multi-cycle analytics
- cross-product vergelijking tussen Pulse en RetentieScan
- teamlokalisatie
- publieke route- of pricingactivatie
- Pulse PDF-output

## Scope In

- gebruik van de bestaande vorige-campaign ankerlogica voor Pulse
- ophalen van vorige Pulse responses voor dezelfde organisatie en `scan_type = pulse`
- Pulse-specifieke current-vs-previous helpers voor top-line signalen en gedeelde factorverschuivingen
- een begrensde delta-uitleg in de campaign page voor Pulse
- Pulse review-loop copy: wat is veranderd, wat vraagt review, wat moet eerst bijgestuurd of bevestigd worden
- tests en smoke-validatie voor twee opeenvolgende Pulse-cycli
- docs-update van deze wave en gerelateerde strategy/source-of-truth pointers

## Scope Out

- generieke time-series infrastructuur
- nieuwe backend endpoints of trend APIs
- nieuwe cadence taxonomy voor Pulse
- automatische actieplantracking of task management
- TeamScan- of Onboarding-werk
- Pulse PDF/reportgenerator
- buyer-facing Pulse-productroute

## Dependencies

- [PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md)
- [PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md)
- [PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md)
- [PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md)
- [PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md)
- [WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md)

## Key Changes

- Pulse blijft campaign-centered, maar krijgt nu een bounded comparison met precies één vorige relevante Pulse-campaign.
- De dashboardpagina voor `pulse` toont naast snapshot nu ook een reviewlaag: wat is veranderd sinds de vorige Pulse en wat betekent dat voor de eerstvolgende managementreview.
- Vergelijking blijft bewust smal: alleen vorige Pulse van dezelfde organisatie, alleen gedeelde factoren, alleen voldoende data, geen brede trendclaims.
- De bestaande retention trend-aanpak diende als lokaal implementatiepatroon, maar `WAVE_02` bouwt geen generieke cross-product trendlaag.

## Belangrijke Interfaces/Contracts

### 1. Previous Pulse Anchor Contract

De vorige relevante Pulse-meting wordt bepaald als:

- dezelfde `organization_id`
- dezelfde `scan_type = pulse`
- `created_at < current.created_at`
- meest recente vorige `campaign_stats`-rij

Beslissing:

- gebruik de bestaande `previousStats` queryvorm op de campaign page
- geen nieuwe "baseline_of_record" of "comparison pointer" kolom in deze wave
- geen vergelijking met `retention` of `exit`

### 2. Pulse Comparison Eligibility Contract

Pulse delta mag alleen als echte vergelijking worden getoond wanneer:

- er een vorige Pulse-campaign bestaat
- de huidige campaign minimaal `MIN_N_PATTERNS` responses heeft
- de vorige Pulse-campaign minimaal `MIN_N_PATTERNS` responses heeft

Als wel een vorige campaign bestaat maar een van beide campagnes onder `MIN_N_PATTERNS` zit:

- toon wel dat er een vorige Pulse bestaat
- toon geen kwantitatieve trendclaim
- toon een beperkte boundary-notitie dat de vergelijking nog indicatief of nog niet veilig is

Beslissing:

- geen delta-weergave bij onvoldoende analysekracht
- geen aparte lagere threshold voor "toch een beetje trend"

### 3. Pulse Comparison Surface Contract

`WAVE_02` voegt voor Pulse een aparte review/delta-sectie toe in de huidige campaign page.

De sectie toont minimaal:

- status sinds vorige Pulse: verbeterd / verslechterd / stabiel
- top-line delta op Pulse-signaal
- delta op richtingsvraag (`stay_intent`)
- verschuiving van gedeelde actieve werkfactoren
- bestuurlijke reviewcopy: wat vraagt nu bevestiging, wat vraagt bijsturing, wat wil je vasthouden

Beslissing:

- voeg deze sectie toe als Pulse-specifieke dashboardlaag in `page.tsx` + `page-helpers.tsx`
- breid de gedeelde `ProductModule`-interface in deze wave niet uit voor generieke trendondersteuning

### 4. Pulse Metric Contract

Voor `WAVE_02` gebruikt Pulse alleen metrics die nu al in runtime bestaan:

- `avg_risk_score` of equivalent afgeleid uit huidige responses als Pulse-signaal
- `stay_intent_score`, omgerekend naar dezelfde 1-10 schaal als in `WAVE_01`
- factor averages uit bestaande `org_scores`

Pulse comparison helpers leveren minimaal:

- `pulseSignal`
- `stayIntent`
- `factorAverages`

Beslissing:

- geen nieuwe methodische metrics in deze wave
- geen trend op open-text thema's
- geen nieuwe scoringoutput uit backend nodig zolang frontend de vergelijking uit bestaande response-data kan afleiden

### 5. Shared Factor Delta Contract

Factor-delta mag alleen berekend worden voor factoren die:

- in de huidige Pulse-campaign gemeten zijn
- in de vorige Pulse-campaign ook gemeten zijn
- in beide campagnes een numerieke average hebben

Beslissing:

- vergelijk alleen gedeelde factoren
- verzwijg factoren die slechts in één van beide campaigns actief zijn
- toon een boundary-notitie als de overlap beperkt is, in plaats van geforceerde nul- of placeholdervergelijking

### 6. Delta Interpretation Contract

Interpretatie blijft begrensd:

- `improved` betekent alleen dat de huidige Pulse ten opzichte van de vorige Pulse gunstiger uitvalt op de afgesproken metriek
- `worsened` betekent alleen dat het signaal verslechtert ten opzichte van de vorige Pulse
- `stable` betekent alleen beperkte beweging, niet dat het probleem opgelost is

Beslissing:

- gebruik dezelfde drempelorde als de bestaande retention trendhelpers: een kleine maar expliciete deltaboundary in plaats van elke minieme verschuiving als betekenisvol labelen
- geen causaliteitsclaim over actieplannen of managementinterventies

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts)
- [frontend/lib/products/shared/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/types.ts) only if a new Pulse-only card type is strictly needed

### Existing Runtime Reads To Reuse

- `campaign_stats` lookup for current campaign
- existing previous campaign lookup by `organization_id`, `scan_type`, `created_at`
- existing `survey_responses` + `respondents` joins used by retention comparison

### Test Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts)
- [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts) tests if needed
- backend/API smoke validation kan in [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py) blijven; er was geen nieuw backend trendendpoint nodig

## Work Breakdown

### Track 1 - Previous Pulse Retrieval

Tasks:

- [x] Breid de campaign page uit zodat ook `pulse` de vorige campaign-responses ophaalt wanneer `previousStats` bestaat.
- [x] Houd de bestaande retention-vergelijking intact; geen generieke abstrahering forceren.
- [x] Zorg dat Pulse bij ontbreken van een vorige campaign gewoon snapshot-only blijft renderen.

Definition of done:

- [x] De campaign page kan vorige Pulse-responses ophalen zonder regressie in retention of exit.
- [x] Geen extra API-route of backendcontract is nodig voor deze wave.

### Track 2 - Pulse Delta and Review Helpers

Tasks:

- [x] Voeg Pulse-specifieke helper(s) toe voor current-vs-previous signal averages.
- [x] Voeg helper(s) toe voor gedeelde factor-delta tussen twee Pulse-cycli.
- [x] Voeg Pulse-specifieke delta labels en reviewcopy toe: verbeterd / verslechterd / stabiel.
- [x] Voeg een boundary helper toe voor "vorige Pulse bestaat, maar nog niet veilig vergelijkbaar".

Definition of done:

- [x] De helpers leveren een reproduceerbare Pulse comparison state uit bestaande response-data.
- [x] Shared factor comparison werkt alleen op overlappende factoren.
- [x] De output maakt geen trend- of causaliteitsclaims buiten de gekozen boundary.

### Track 3 - Campaign Page and Dashboard Integration

Tasks:

- [x] Voeg een Pulse review/delta-sectie toe aan de campaign page.
- [x] Gebruik voor Pulse een eigen section of componentpatroon, geïnspireerd op retention trend maar niet generiek gemaakt.
- [x] Werk Pulse-copy bij waar de huidige boundary "geen trendclaim" nu te absoluut of achterhaald is.
- [x] Houd Pulse PDF/report boundary uit `WAVE_01` intact.

Definition of done:

- [x] Een Pulse-campaign met een veilige vorige vergelijking toont een expliciete delta- en reviewlaag.
- [x] Een Pulse-campaign zonder veilige vergelijking toont nog steeds een coherente snapshot-only read.
- [x] Exit en retention pagina-output blijven intact.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg helpertests toe voor Pulse current-vs-previous vergelijking.
- [x] Voeg tests toe voor factor overlap, geen vorige meting, en onvoldoende data.
- [x] Werk dit wave-document en relevante source-of-truth pointers bij tijdens uitvoering.
- [x] Voer een gescripte smoke-flow uit met twee opeenvolgende Pulse-campaigns binnen één organisatie.

Definition of done:

- [x] Alle relevante frontend tests voor Pulse delta/review zijn groen.
- [x] De smoke-flow bewijst twee Pulse-cycli met veilige vergelijking of correcte boundary.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] `computePulseSignalAverages` of equivalent helper berekent current en previous Pulse-waarden correct.
- [x] factor-delta helper vergelijkt alleen gedeelde factoren.
- [x] een vorige Pulse onder `MIN_N_PATTERNS` toont geen kwantitatieve vergelijking.
- [x] geen vorige Pulse -> geen crash, geen lege trendcomponent, wel snapshot-only read.
- [x] retention trendhelpers en retention rendering blijven werken.

### Integration Checks

- [x] Pulse-campaign met vorige Pulse haalt vorige responses correct op.
- [x] Pulse-campaign zonder vorige Pulse rendert zonder regressie.
- [x] Pulse-campaign met andere factorselectie toont alleen shared factor delta of een boundary-notitie.
- [x] report/PDF pad voor Pulse blijft `422` of equivalente veilige afscherming tonen.

### Smoke Path

1. [x] Maak organisatie `X` aan.
2. [x] Maak een eerste Pulse-campaign aan voor organisatie `X`.
3. [x] Voeg voldoende respondenten toe en submit genoeg responses om `MIN_N_PATTERNS` te halen.
4. [x] Maak een tweede Pulse-campaign aan voor dezelfde organisatie.
5. [x] Voeg opnieuw voldoende respondenten toe en submit responses.
6. [x] Valideer de tweede Pulse-campaign data-driven via stats, response-opslag en comparison helpers.
7. [x] Controleer dat:
   - een vorige Pulse wordt herkend
   - Pulse-signaal delta zichtbaar is
   - stay-intent delta zichtbaar is
   - gedeelde factorverschuivingen zichtbaar zijn
   - de reviewrichting expliciet benoemt wat te behouden, te toetsen of bij te sturen is
8. [x] Controleer dat een scenario met onvoldoende vorige data geen trendclaim toont maar wel een boundary-notitie geeft.

## Assumptions/Defaults

- `WAVE_02` blijft volledig binnen de bestaande campaign-centered architectuur.
- De vorige relevante Pulse-campaign wordt bepaald door de bestaande "meest recente eerdere campaign_stats" logica; er komt geen nieuwe comparison pointer.
- Quantitatieve vergelijking wordt pas getoond wanneer zowel current als previous Pulse-campaign minimaal `MIN_N_PATTERNS` responses hebben.
- Delta op factoren gebruikt alleen overlap tussen huidige en vorige actieve Pulse-factoren.
- De bestaande retention trend-aanpak mag als lokaal patroon dienen, maar deze wave bouwt geen generiek cross-product trendframework.
- Pulse blijft ook in `WAVE_02` geen causaliteits- of effectbewijssysteem; de UI benoemt verandering, reviewrichting en follow-through, niet bewezen impact van actieplannen.

## Product Acceptance

- [x] Pulse voelt na deze wave aantoonbaar als monitoringlaag en niet alleen als losse snapshot.
- [x] Management ziet wat veranderd is sinds de vorige Pulse zonder dat het product te veel claimt.
- [x] De reviewrichting vertaalt delta naar bestuurlijke vervolgactie in plaats van alleen naar grafiekjes.

## Codebase Acceptance

- [x] De wave hergebruikt bestaande campaign stats, response reads en helperpatronen zonder generieke trendengine toe te voegen.
- [x] Pulse-specifieke delta-logica zit begrensd in Pulse/dashboard helpers en campaign page integration.
- [x] Exit en retention codepaden blijven intact.

## Runtime Acceptance

- [x] Een tweede Pulse-campaign kan een vorige Pulse-campaign herkennen.
- [x] Bij voldoende data toont het dashboard een veilige Pulse-delta.
- [x] Bij onvoldoende data toont het dashboard een duidelijke boundary in plaats van een misleidende vergelijking.
- [x] Pulse report/PDF blijft buiten scope en veilig begrensd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] De twee-cycle Pulse smoke-flow is succesvol uitgevoerd.
- [x] Pulse-boundaries ten opzichte van RetentieScan blijven intact.
- [x] De vergelijking voelt als review- en follow-through logica, niet als brede trendmachine.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] `WAVE_01` blijft gesloten en groen.
- [x] Het is na afronding duidelijk dat `WAVE_02` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_03` opent pas na expliciete green close-out van deze wave.

## Risks To Watch

- Pulse-delta wordt te snel als trendbewijs of effectmeting gelezen.
- Vergelijking tussen campagnes met verschillende factorselecties wordt te hard of te impliciet gemaakt.
- De campaign page krijgt retention-achtige trendstructuren die Pulse onnodig breed of zwaar maken.
- De implementatie introduceert alsnog een generieke trendlaag "voor later" zonder directe productreden.
- Reviewcopy blijft te vaag waardoor het verschil tussen "verbeterd", "stabiel" en "bijsturen" methodisch onvoldoende scherp is.

## Not In This Wave

- Geen generieke time-series of artifact-history infrastructuur.
- Geen TeamScan-werk.
- Geen Onboarding 30-60-90-werk.
- Geen publieke Pulse-pricing of productroute.
- Geen Pulse PDF-output.
- Geen teamniveau- of leidinggevendelokalisatie.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] een tweede Pulse-campaign een vorige relevante Pulse veilig kan meenemen
- [x] Pulse delta en reviewrichting zichtbaar zijn bij voldoende data
- [x] Pulse snapshot-only boundaries intact blijven bij geen of onvoldoende vorige data
- [x] code, docs, tests en twee-cycle smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md`
