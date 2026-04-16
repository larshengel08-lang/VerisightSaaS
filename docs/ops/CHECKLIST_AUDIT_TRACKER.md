# CHECKLIST_AUDIT_TRACKER

Eerste auditbasis voor de Verisight-checklist.

Doel:
- niet vertrouwen op alleen `Voldaan` in `PROMPT_CHECKLIST.xlsx`
- per traject toetsen of repo-, main-, deploy- en livebewijs sterk genoeg zijn
- snel zichtbaar maken welke items echt klaar zijn en welke nog een gerichte hercontrole nodig hebben

Laatste auditbasis: 2026-04-16

## 1. Baseline

- Checkliststatus: `33 van 33` regels staan op `Voldaan`
- Roadmapstatus: [docs/strategy/ROADMAP.md](C:\Users\larsh\Desktop\Business\Verisight\docs\strategy\ROADMAP.md) is in sync met de checklist en toont nu alleen nog afgesloten fases
- Repo-status: schoon na cleanup op 2026-04-16

## 2. Verdict Labels

- `A - sterk bevestigd`
  Repo/main en livebewijs zijn voldoende sterk voor nu.
- `B - waarschijnlijk ok`
  Repo/main lijkt plausibel; livebewijs is niet altijd nodig of de tranche was vooral docs/structuur.
- `C - gerichte hercontrole nodig`
  De checklisttekst is te zwak, legacy, ambigu of mist duidelijke repo/main/live-borging.
- `D - eerst repo hygiëne`
  Niet inhoudelijk afkeuren, maar eerst worktree opschonen voor verdere audit.

## 3. Repo-Hygiëne

Opgeruimd op 2026-04-16:

- lokale restwijziging in [docs/active/WEBSITE_REDESIGN_AND_FLOW_PLAN.md](C:\Users\larsh\Desktop\Business\Verisight\docs\active\WEBSITE_REDESIGN_AND_FLOW_PLAN.md) teruggezet naar HEAD
- `.codex-artifacts/` verwijderd uit de worktree
- `.codex-artifacts/` toegevoegd aan [.gitignore](C:\Users\larsh\Desktop\Business\Verisight\.gitignore)

Vervolgregel:

- houd browserprofielen, screenshots en QA-output buiten git tenzij expliciet als artefact nodig

## 4. Audit-Order

Volgorde voor gerichte hercontrole:

1. Alle `C`-items met live-impact
2. Alle `C`-items met onduidelijke `main`-status
3. Daarna steekproef op `B`-items
4. `A`-items alleen heropenen als er inhoudelijke twijfel ontstaat

## 5. Eerste Auditverdict Per Checklistitem

### Phase A - Product Credibility Foundation

- `EXITSCAN_PLANMODE_PRODUCT_REVIEW_AND_TEST_PROMPT.md` -> `C`
  Waarom: naar main gepusht, maar live-status historisch niet apart vastgelegd.
- `EXITSCAN_PLANMODE_LIVE_TEST_PROMPT.md` -> `A`
  Waarom: live bevestigd en kernfixes hergevalideerd.
- `RETENTIESCAN_PLANMODE_PRODUCT_REVIEW_AND_TEST_PROMPT.md` -> `C`
  Waarom: naar main gepusht, maar live-status historisch niet apart vastgelegd.
- `RETENTIESCAN_PLANMODE_LIVE_TEST_PROMPT.md` -> `A`
  Waarom: live bevestigd; alleen oude externe deliverability-note blijft context.
- `RETENTIESCAN_PLANMODE_PRODUCT_SHARPENING_PROMPT.md` -> `C`
  Waarom: historisch wel gepusht, maar geen aparte liveverificatie.
- `DASHBOARD_DECISION_SUPPORT_PROGRAM_PLANMODE_PROMPT.md` -> `C`
  Waarom: live-impact vermoedelijk aanwezig, maar checklist noemt alleen pushhistorie.
- `RETENTIESCAN_V1_1_VALIDATION_PLANMODE_PROMPT.md` -> `B`
  Waarom: validatiegericht traject; live-impact minder direct, maar geen aparte livecheck.
- `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md` -> `B`
  Waarom: commit staat op `origin/main`, rapport-/paritytests zijn expliciet vastgelegd en buyer-facing reporttaal is publiek zichtbaar, maar authenticated rapportgeneratie is niet opnieuw live geverifieerd.
- `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: commit staat op `origin/main`, preview/reportcopy is publiek zichtbaar en voorbeeldrapporten zijn live bereikbaar, maar de volledige generated-reportflow is niet opnieuw live geverifieerd.

### Phase B - Decision-Maker Readiness

- `MANAGEMENT_ACTIONABILITY_PROGRAM_PLANMODE_PROMPT.md` -> `C`
  Waarom: wel commit genoemd, maar geen aparte liveverificatie.
- `METHOD_AND_TRUST_SYSTEM_PLANMODE_PROMPT.md` -> `A`
  Waarom: commit staat op `origin/main`, regressietests zijn expliciet vastgelegd en publieke trust/productroutes tonen live de aangescherpte verification-first-, groepsniveau-, privacygrens- en minimale-n-taal.
- `TRUST_SIGNAL_PROGRAM_PLANMODE_PROMPT.md` -> `A`
  Waarom: tests, build en productie smoke checks expliciet genoemd.
- `BOARDROOM_READINESS_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: publieke routes live bevestigd; authenticated output niet apart geverifieerd.
- `FOUNDER_LED_SALES_NARRATIVE_PROGRAM_PLANMODE_PROMPT.md` -> `A`
  Waarom: publieke routes en concrete copy live bevestigd.

### Phase C - Commercial Packaging

- `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLANMODE_PROMPT.md` -> `A`
  Waarom: commit staat op `origin/main` en canonieke termen zijn live bevestigd op homepage, pricing, product- en trustroutes.
- `SALES_ENABLEMENT_SYSTEM_PLANMODE_PROMPT.md` -> `B`
  Waarom: repo-assets-only formulering is plausibel, mits deze tranche echt geen live buyer-surface had.
- `PRICING_AND_PACKAGING_PROGRAM_PLANMODE_PROMPT.md` -> `A`
  Waarom: live route, deployment-id en zichtbare pricingcopy expliciet bevestigd.
- `SAMPLE_OUTPUT_AND_SHOWCASE_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: commit staat op `origin/main` en publieke voorbeeldrapporten reageren live met `200 OK`, maar preview/showcasebewijs kan nog specifieker.

### Phase D - Website And Funnel System

- `WEBSITE_REDESIGN_AND_FLOW_PLANMODE_PROMPT.md` -> `A`
  Waarom: live bevestigd met breakpoint- en compositiepass.
- `CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLANMODE_PROMPT.md` -> `A`
  Waarom: deployment, commit en buyer-facing CTA/funnelcopy expliciet bevestigd.
- `SEO_CONVERSION_PROGRAM_PLANMODE_PROMPT.md` -> `A`
  Waarom: commit `10862d9` staat op `origin/main` en de drie SEO-oplossingsroutes reageren live met `200 OK` en buyer-facing bewijsstrings.

### Phase E - Delivery And Adoption System

- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: commit staat op `origin/main` en buyer-facing onboarding/handoff-copy is live zichtbaar, maar authenticated live-checks op dashboard/onboardingflow ontbreken nog.
- `IMPLEMENTATION_READINESS_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: naar main gepusht; livecheck ontbreekt, maar traject kan deels intern/ops zijn.
- `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: commit staat op `origin/main`, tests zijn expliciet vastgelegd en buyer-facing productlagen tonen live de nieuwe managementsessie-, eerste stap- en reviewmoment-taal, maar authenticated dashboard/reportverificatie ontbreekt nog.
- `PILOT_AND_EARLY_CUSTOMER_LEARNING_SYSTEM_PLANMODE_PROMPT.md` -> `B`
  Waarom: main en Vercel-ready genoemd, maar inhoudelijke livebewijslast blijft licht.
- `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: sterke testbasis en publieke site gecontroleerd, maar deploymentmetadata niet direct geverifieerd.

### Phase F - Scale And Operating System

- `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: docs/roadmap/sync-traject; main bevestigd, publieke liveverificatie niet nodig.
- `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLANMODE_PROMPT.md` -> `A`
  Waarom: deployment-id, commit en productie-URL expliciet bevestigd.
- `ACCOUNT_AND_BILLING_MODEL_READINESS_PLANMODE_PROMPT.md` -> `A`
  Waarom: tests en publieke voorwaardenpagina expliciet bevestigd.
- `OPS_AND_DELIVERY_SYSTEM_PLANMODE_PROMPT.md` -> `B`
  Waarom: korte maar plausibele livebevestiging; nog wel geschikt voor spot-check.
- `CASE_PROOF_AND_EVIDENCE_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: main plus publieke prooflaag bevestigd, maar bewijsformulering is nog compact.
- `PORTFOLIO_ARCHITECTURE_PROGRAM_PLANMODE_PROMPT.md` -> `B`
  Waarom: deployment-id op Vercel bevestigd; buyer-facing smoke check kan nog sterker.
- `CONTENT_OPERATING_SYSTEM_PLANMODE_PROMPT.md` -> `B`
  Waarom: main bevestigd; geen duidelijke publieke runtimewijziging, dus livecheck is minder hard nodig.

## 6. Eerste Hercontrole-Backlog

Deze items verdienen als eerste een echte auditpass:

- geen directe `C`-items meer over

## 6A. Auditronde 1 - 2026-04-16

Gerichte audit uitgevoerd op de eerste zwakke of ambigue checklistregels.

### Bevestigd in deze ronde

- `SEO_CONVERSION_PROGRAM_PLANMODE_PROMPT.md`
  - commit `10862d9` staat aantoonbaar op `origin/main`
  - live `200 OK` bevestigd op:
    - `https://www.verisight.nl/oplossingen/verloop-analyse`
    - `https://www.verisight.nl/oplossingen/exitgesprekken-analyse`
    - `https://www.verisight.nl/oplossingen/medewerkersbehoud-analyse`
  - concrete strings bevestigd:
    - `Verloopanalyse`
    - `Exitgesprekken analyseren`
    - `Medewerkersbehoud analyseren`
    - `bestuurlijke handoff`
    - `verification-first`

- `SAMPLE_OUTPUT_AND_SHOWCASE_PROGRAM_PLANMODE_PROMPT.md`
  - commit `d12b35b` staat aantoonbaar op `origin/main`
  - publieke voorbeeldrapporten reageren live met `200 OK`:
    - `https://www.verisight.nl/examples/voorbeeldrapport_verisight.pdf`
    - `https://www.verisight.nl/examples/voorbeeldrapport_retentiescan.pdf`
  - `Content-Type` bevestigd als `application/pdf`

### Nog bewust open gelaten

- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md`
  - commit staat op `origin/main`
  - authenticated live-check ontbreekt nog

- `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md`
  - commit staat op `origin/main`
  - dashboard/report-output controle ontbreekt nog

- `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLANMODE_PROMPT.md`
  - commit staat op `origin/main`
  - zelfstandige termen-audit is nog niet expliciet genoeg vastgelegd

- `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md`
  - historische basis is aanwezig
  - functioneel of live bewijs blijft nog te dun

- `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PROGRAM_PLANMODE_PROMPT.md`
  - commit staat op `origin/main`
  - rapport-/previewbewijs is nog onvoldoende uitgesplitst

## 6C. Auditronde 3 - 2026-04-16

Gerichte audit uitgevoerd op:

- `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLANMODE_PROMPT.md`
- `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md`
- `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PROGRAM_PLANMODE_PROMPT.md`

### Bevestigd in deze ronde

- `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLANMODE_PROMPT.md`
  - commit `82a439c` staat aantoonbaar op `origin/main`
  - canonieke termen live bevestigd op:
    - `https://www.verisight.nl/`
    - `https://www.verisight.nl/tarieven`
    - `https://www.verisight.nl/producten/exitscan`
    - `https://www.verisight.nl/producten/retentiescan`
    - `https://www.verisight.nl/vertrouwen`
  - concrete strings bevestigd:
    - `signalen van werkfrictie`
    - `retentiesignaal`
    - `managementsamenvatting`
    - `bestuurlijke handoff`
    - `frictiescore`
  - conclusie: verdict opgehoogd van `C` naar `A`

- `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md`
  - commit `026b711` staat aantoonbaar op `origin/main`
  - rapport-/paritytesten zijn expliciet vastgelegd in het plan
  - buyer-facing reporttaal is publiek zichtbaar via:
    - `managementsamenvatting`
    - `bestuurlijke handoff`
    - `eerste managementsessie`
  - conclusie: verdict opgehoogd van `C` naar `B`

- `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PROGRAM_PLANMODE_PROMPT.md`
  - commit `aa73fc7` staat aantoonbaar op `origin/main`
  - publieke productroutes tonen preview/report-taal live met `200 OK`
  - voorbeeldrapporten zijn live bereikbaar met `200 OK`:
    - `https://www.verisight.nl/examples/voorbeeldrapport_verisight.pdf`
    - `https://www.verisight.nl/examples/voorbeeldrapport_retentiescan.pdf`
  - conclusie: verdict opgehoogd van `C` naar `B`

### Resterende nuance

- `REPORTING_SYSTEM_SHARPENING_PLANMODE_PROMPT.md`
  - authenticated of lokaal gegenereerde rapportverificatie is in deze auditronde niet opnieuw uitgevoerd

- `REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PROGRAM_PLANMODE_PROMPT.md`
  - volledige generated-reportflow is in deze auditronde niet opnieuw live geverifieerd

## 6B. Auditronde 2 - 2026-04-16

Gerichte audit uitgevoerd op:

- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md`
- `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md`
- `METHOD_AND_TRUST_SYSTEM_PLANMODE_PROMPT.md`

### Bevestigd in deze ronde

- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md`
  - commit `7559bdc` staat aantoonbaar op `origin/main`
  - publieke route `https://www.verisight.nl/aanpak` reageert live met `200 OK`
  - buyer-facing onboarding/handoff-taal live bevestigd via strings als:
    - `bestuurlijke handoff`
    - `groepsniveau`
    - `minimale n`
    - `reviewmoment`
  - conclusie: verdict opgehoogd van `C` naar `B`

- `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md`
  - commit `632a208` staat aantoonbaar op `origin/main`
  - tests, lint en build zijn expliciet vastgelegd in het plan
  - publieke productroutes reageren live met `200 OK`
  - buyer-facing vervolgtaal live bevestigd via strings als:
    - `eerste managementsessie`
    - `eerste logische stap`
    - `eerste managementvraag`
    - `reviewmoment`
  - conclusie: verdict opgehoogd van `C` naar `B`

- `METHOD_AND_TRUST_SYSTEM_PLANMODE_PROMPT.md`
  - commit `7e512ea` staat aantoonbaar op `origin/main`
  - publieke routes reageren live met `200 OK`:
    - `https://www.verisight.nl/aanpak`
    - `https://www.verisight.nl/privacy`
    - `https://www.verisight.nl/producten/exitscan`
    - `https://www.verisight.nl/producten/retentiescan`
    - `https://www.verisight.nl/vertrouwen`
  - trust/method-stringbewijs bevestigd via:
    - `verification-first`
    - `groepsniveau`
    - `privacygrens`
    - `minimale n`
    - `bestuurlijke handoff`
    - `reviewmoment`
  - conclusie: verdict opgehoogd van `C` naar `A`

### Nog bewust open gelaten

- `CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLANMODE_PROMPT.md`
  - authenticated live-checks op complete-account/dashboard/onboardingflow ontbreken nog

- `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md`
  - expliciete authenticated dashboard- of generated-report verificatie ontbreekt nog

## 7. Audit Method Per Item

Per traject altijd minimaal deze vragen beantwoorden:

1. Bestaat het deliverable-bestand en is het inhoudelijk plausibel?
2. Staat de relevante wijziging aantoonbaar op `main`?
3. Was deploy/liveverificatie nodig voor dit traject?
4. Als liveverificatie nodig was:
   - is er deploybewijs?
   - is er productie-URL-bewijs?
   - zijn er concrete bewijsstrings of functionele checks?
5. Is de checklisttekst specifiek genoeg, of verhult die onzekerheid?

## 8. Best Practice Na Audit

- Pas checklistteksten aan op basis van audituitkomst, niet op basis van geheugen.
- Heropen een traject als `Voldaan` inhoudelijk niet houdbaar blijkt.
- Houd repo-only trajecten expliciet repo-only.
- Houd live-impacttrajecten pas definitief afgerond na repo/main/deploy/live bewijs.
