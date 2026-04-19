# CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

## 1. Summary

Dit traject maakt van de eerder verspreide buyer journey, onboarding-, pricing-, dashboard- en vervolglogica van Verisight een expliciet customer lifecycle- en expansionmodel dat repo-breed hetzelfde verhaal vertelt.

Bewuste defaults:

- [x] ExitScan blijft de primaire eerste koop en wedge.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Expansion mag alleen landen als geloofwaardige vervolgstap op basis van eerdere waarde, niet als losse upsell.
- [x] De eerste koop blijft een betaald baseline-traject; geen gratis pilot als standaard.
- [x] De lifecycle blijft assisted/productized en niet pseudo-SaaS.
- [x] `scan_type`, `delivery_mode` en `segment_deep_dive` blijven de dragende productprimitieven; deze tranche voegt geen billing-, plan-, seat- of subscriptionmodel toe.
- [x] Combinatie blijft een portfolioroute op aanvraag, geen derde standaard instappakket.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Een actieve source of truth toegevoegd in `docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`.
- [x] Buyer-facing lifecycle-content gecentraliseerd in `frontend/components/marketing/site-content.ts`.
- [x] Pricing en aanpak explicieter gemaakt over eerste koop, logische vervolgvorm en expansiongrenzen.
- [x] Productpagina's aangescherpt op ExitScan -> RetentieScan, RetentieScan -> ritme en combinatie pas na eerdere waarde.
- [x] Contactflow explicieter gemaakt dat vervolgvormen en combinatie pas na eerste managementwaarde concreet worden.
- [x] In-product lifecyclelogica toegevoegd in onboarding- en dashboardlagen via `frontend/lib/client-onboarding.ts`, `frontend/components/dashboard/onboarding-panels.tsx` en `frontend/app/(dashboard)/campaigns/[id]/page.tsx`.
- [x] Pilot-learning aangescherpt zodat follow-up review expliciet repeat- en expansionkeuzes koppelt aan eerdere managementwaarde.
- [x] Regressietests toegevoegd voor marketing, onboarding, learning en prompt-closure.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt en roadmap opnieuw gesynchroniseerd.

Bewust niet uitgevoerd in deze tranche:

- [ ] Geen nieuwe billing- of accountlaag.
- [ ] Geen persistente lifecycle-engine, renewal-engine of customer state machine.
- [ ] Geen CRM-automatisering of action-tracking platform.
- [ ] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en combinatie.

## 2. Milestones

### Milestone 0 - Freeze Current Lifecycle Truth
Dependency: none

#### Tasks
- [x] De huidige lifecycle vastgelegd van routekeuze naar eerste sale, onboarding, eerste managementread, opvolging, herhaalgebruik en expansion.
- [x] Expliciet gemaakt welke lifecycle-signalen al bestonden in marketing, contact, onboarding, implementation readiness, dashboard, report-to-action en pilot learning.
- [x] De bestaande canonieke vervolgroutes bevestigd:
  - `ExitScan Baseline -> ExitScan ritmeroute`
  - `RetentieScan Baseline -> RetentieScan ritmeroute`
  - `segment_deep_dive`
  - `ExitScan -> RetentieScan`
  - `RetentieScan -> ExitScan`
  - `Combinatie op aanvraag`
- [x] Vastgelegd waar lifecycle eerder nog impliciet, handmatig of alleen in copy aanwezig was.
- [x] Buyer-facing versus assisted-only lifecycletermen expliciet gescheiden.

#### Definition of done
- [x] Er ligt een repo-gebaseerd beeld van de customer lifecycle en expansionshape.
- [x] Het verschil tussen eerste koop, vervolgvorm, add-on, herhaalbeweging en portfolioroute is expliciet.
- [x] Geen lifecycleconclusie leunt op generieke SaaS-aannames buiten repo-truth.

#### Validation
- [x] Observaties zijn herleidbaar naar pricing, marketing, onboarding, dashboard, backend/types en actieve plannen.
- [x] ExitScan-first en RetentieScan-complementair blijven zichtbaar.
- [x] De lifecycle blijft benoemd als assisted/productized en niet als verborgen subscriptionmodel.

### Milestone 1 - Define The Canonical Lifecycle And Expansion Architecture
Dependency: Milestone 0

#### Tasks
- [x] Canonieke lifecyclefasen vastgelegd over eerste routekeuze, betaald eerste traject, implementation/start, eerste veilige output, eerste managementsessie, reviewmoment en repeat/expansionkeuze.
- [x] Per product de vaste lifecycleladder gedefinieerd in marketing- en onboardingcontent.
- [x] ExitScan expliciet vastgezet als primaire first-sale ladder:
  - standaard: `ExitScan Baseline`
  - vervolg: `ExitScan ritmeroute` alleen bij volume, proces en eigenaar
  - expansion: `RetentieScan Baseline` zodra de vraag verschuift van vertrekduiding naar behoudsvroegsignalering
  - verdieping: `segment_deep_dive` alleen bij sterke metadata- en segmentvraag
- [x] RetentieScan expliciet vastgezet als complementaire ladder:
  - eerste koop alleen bij expliciete actieve-populatievraag
  - standaard vervolg: `RetentieScan ritmeroute`
  - compacte vervolgmeting blijft binnen die ritmelaag
  - expansion naar ExitScan alleen wanneer retrospectieve vertrekduiding alsnog nodig blijkt
- [x] Combinatie vastgezet als portfolioroute, niet als automatische upsell.
- [x] Expansiontriggers expliciet gemaakt: bewezen eerste waarde, eigenaar, eerste actie, reviewmoment en een vervolgvraag die de huidige route niet volledig afdekt.

#### Definition of done
- [x] Verisight heeft een decision-complete lifecycle- en expansionarchitectuur.
- [x] Elke expansionroute heeft een duidelijke aanleiding, volgorde en grens.
- [x] Geen expansionvorm voelt als losse upsell of verkapte planmatrix.

#### Validation
- [x] De lifecycle-architectuur botst niet met pricing, onboarding, implementation readiness of assisted-to-SaaS guardrails.
- [x] ExitScan blijft de primaire eerste koop.
- [x] RetentieScan blijft een eigen product en geen feature of goedkoper vervolg.

### Milestone 2 - Rebuild Buyer-Facing Lifecycle Surfaces Around The Canonical Model
Dependency: Milestone 1

#### Tasks
- [x] Buyer-facing lifecyclecopy herschreven rond eerste koop, logische vervolgstap, geloofwaardige expansion en portfolio pas na eerdere waarde.
- [x] Publieke surfaces expliciteren nu wat de eerste koop is per route.
- [x] Publieke surfaces expliciteren nu wat de logische vervolgvorm is per route.
- [x] `ExitScan -> RetentieScan` explicieter gemaakt als inhoudelijke productdoorstroom.
- [x] `RetentieScan -> ExitScan` publiek gepositioneerd als terugkijkende verdieping, niet als standaard tweede stap.
- [x] Combinatie publiek routegebonden en op aanvraag gehouden, niet als bundel of korting.
- [x] Contact- en intakecopy dragen nu de lifecycle mee: eerste route, timing, eerste stap en mogelijke vervolgvorm pas na intake en eerste waarde.

#### Definition of done
- [x] Buyer-facing surfaces vertellen een lifecycleverhaal van eerste koop naar herhaalgebruik en expansion.
- [x] Eerste koop, vervolgvorm en portfoliostap zijn publiek begrijpelijk zonder productverwarring.
- [x] Geen publieke copy suggereert self-serve renewal, account plans of automatische upsell.

#### Validation
- [x] Een first-time buyer begrijpt waarom ExitScan meestal de eerste koop is.
- [x] Een RetentieScan-first buyer begrijpt waarom dat een specifieke route is en geen standaard instap voor iedereen.
- [x] Een buyer begrijpt waarom combinatie meestal pas logisch wordt nadat de eerste route helder staat.

### Milestone 3 - Rebuild In-Product And Internal Lifecycle Support
Dependency: Milestone 2

#### Tasks
- [x] Het canonieke lifecyclemodel vertaald naar onboarding-, readiness- en dashboardlagen.
- [x] De lifecycle in-product explicieter gemaakt rond response-opbouw, eerste managementread, eerste actie, reviewmoment en keuze voor repeat of expansion.
- [x] Dashboard en report-to-action landen nu explicieter op een lifecyclebesluit: blijven, verdiepen, herhalen of uitbreiden.
- [x] Bestaande readiness- en onboardinglagen gebruikt als lifecyclebrug in plaats van nieuwe setup- of billingflows.
- [x] Bestaande pilot-learninglaag gebruikt als interne capturelaag voor gekozen vervolgrichting en waarom die logisch was.
- [x] Productspecifieke repeatlogica explicieter gemaakt:
  - ExitScan repeat als guided vervolg of logische live-stap
  - RetentieScan repeat als ritme-, review- en effectmeting
- [x] Vastgelegd dat v1 geen nieuwe persistente lifecycle-engine of action tracker bouwt.

#### Definition of done
- [x] Lifecyclelogica leeft niet alleen in marketingcopy, maar ook in adoption-, readiness- en dashboardlagen.
- [x] Eerste managementgebruik, review en vervolgbesluit vormen een herkenbare keten.
- [x] Interne teams kunnen expansion verklaren vanuit eerdere waarde in plaats van losse salesdruk.

#### Validation
- [x] Dashboard blijft productspecifiek: ExitScan stuurt op vertrekduiding, RetentieScan op verificatie en behoudsopvolging.
- [x] Geen in-product laag suggereert automatische renewals of klantgedreven self-serve provisioning.
- [x] De lifecycleondersteuning blijft assisted en boardroom-geschikt.

### Milestone 4 - Add Lifecycle QA, Acceptance And Governance
Dependency: Milestone 3

#### Tasks
- [x] Regressiebescherming toegevoegd voor lifecycle- en expansionpariteit over marketing, pricing, contact, onboarding en dashboard.
- [x] Acceptance-scenario's afgedekt in tests voor ExitScan-first, RetentieScan-first, ExitScan naar Live, ExitScan naar RetentieScan, RetentieScan naar ritme en geen forced upsell.
- [x] Governance vastgelegd: eerst lifecycle source of truth, daarna public surfaces, internal surfaces en tests.
- [x] Bescherming toegevoegd tegen false-lifecycle moves zoals combinatie als default upsell of ExitScan ritmeroute als standaard eerste package.
- [x] Prompt-systeem administratief afgesloten:
  - dit planbestand is source of truth
  - `PROMPT_CHECKLIST.xlsx` is bijgewerkt
  - roadmap is opnieuw gegenereerd

#### Definition of done
- [x] Lifecycle en expansion zijn inhoudelijk, commercieel en regressietechnisch reviewbaar.
- [x] Toekomstige wijzigingen kunnen niet ongemerkt lifecycleverwarring terugbrengen.
- [x] Het prompt-systeem weerspiegelt dat deze lifecyclelaag nu expliciet bestaat.

#### Validation
- [x] Tests beschermen eerste koop, vervolglogica en expansiongrenzen.
- [x] Geen acceptance-scenario beloont forced upsell of pseudo-SaaS copy.
- [x] Checklist, plan en roadmap wijzen dezelfde lifecyclevolgorde op.

## 3. Execution Breakdown By Subsystem

### Product and commercial architecture
- [x] Een vaste boom vastgelegd met eerste koop, vervolgvorm, add-on, productdoorstroom en portfolioroute.
- [x] Asymmetrie per product beschermd: ExitScan als wedge, RetentieScan als complementaire behoudsroute.
- [x] Expansion route-based en value-based gehouden, niet feature-based.

### Buyer-facing marketing, pricing and contact
- [x] Public copy verduidelijkt eerst de eerste koop en pas daarna repeat en expansion.
- [x] `ExitScan ritmeroute` blijft quote-only vervolg.
- [x] `RetentieScan ritmeroute` blijft de vaste buyer-facing repeatvorm.
- [x] Combinatie blijft op aanvraag en pas logisch zodra beide vragen bestaan.
- [x] Contactflow blijft route-aware en lifecycle-aware, zonder checkout- of planframing.

### Onboarding, implementation and adoption
- [x] Lifecycle sluit aan op de bestaande assisted keten: intake -> setup -> output -> eerste managementsessie -> review.
- [x] Expansion komt pas in beeld nadat eerste managementwaarde en eerste eigenaar expliciet zijn.
- [x] Geen nieuwe self-service onboarding of customer-owned provisioning.

### Dashboard, report and follow-through
- [x] Dashboard en rapport vormen explicieter de brug van eerste inzicht naar review- en vervolgkeuze.
- [x] ExitScan follow-through vertaalt nu door naar ritmeroute of expansion, niet alleen eerste actie.
- [x] RetentieScan follow-through vertaalt nu door naar ritmeroute of tweede product waar relevant.
- [x] Geen action-tracking platform toegevoegd; wel duidelijke lifecyclebesluiten en capture.

### Internal learning and governance
- [x] Bestaande pilot-learning/workbench en docs gebruikt als capturelaag voor why-now/what-next lifecycle-signalen.
- [x] Geen nieuwe CRM- of billinglaag toegevoegd.
- [x] Governance voor toekomstige wijzigingen loopt via lifecycle source of truth -> public surfaces -> internal surfaces -> tests.

## 4. Validation Run

Uitgevoerd in deze tranche:

- [x] `frontend`: `npm.cmd test -- --run lib/marketing-positioning.test.ts lib/client-onboarding.test.ts lib/pilot-learning.test.ts`
- [x] `frontend`: `npm.cmd run lint -- "app/tarieven/page.tsx" "app/aanpak/page.tsx" "app/producten/[slug]/page.tsx" "app/(dashboard)/campaigns/[id]/page.tsx" "components/dashboard/onboarding-panels.tsx" "components/marketing/contact-form.tsx" "components/marketing/site-content.ts" "lib/client-onboarding.ts" "lib/pilot-learning.ts"`
- [x] `backend/tests`: `python -m pytest tests/test_pricing_packaging_system.py tests/test_customer_lifecycle_and_expansion_model.py`
- [x] `frontend`: `npm.cmd run build`
- [x] `python sync_planning_artifacts.py`

Niet uitgevoerd:

- [ ] Volledige end-to-end flow met echte contact submission, echte dashboardsessie en echte pilot-learning invoer.
  - Niet proportioneel voor deze tranche en afhankelijk van live credentials/data.

## 5. Files That Carry This Tranche

- `docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`
- `frontend/components/marketing/site-content.ts`
- `frontend/app/tarieven/page.tsx`
- `frontend/app/aanpak/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/components/marketing/contact-form.tsx`
- `frontend/lib/client-onboarding.ts`
- `frontend/components/dashboard/onboarding-panels.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/lib/pilot-learning.ts`
- `frontend/lib/marketing-positioning.test.ts`
- `frontend/lib/client-onboarding.test.ts`
- `frontend/lib/pilot-learning.test.ts`
- `tests/test_customer_lifecycle_and_expansion_model.py`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP.md`

## 6. Current Product Risks

- [x] Grootste resterende risico blijft dat repeat en expansion inhoudelijk helder zijn, maar nog niet instrumenteel als aparte lifecycle-engine worden gemeten.
- [x] ExitScan blijft commercieel de wedge; toekomstige wijzigingen mogen die eerste koop niet vervagen.
- [x] RetentieScan heeft nog steeds de rijkere productmatige repeatlogica; ExitScan repeat blijft voorlopig meer guided dan systemisch.
- [x] Combinatie blijft afhankelijk van goede routekeuze en kan bij slordige copy alsnog als bundle voelen.

## 7. Out of Scope For Now

- [x] Geen Stripe, plans, seats, usage of subscription billing.
- [x] Geen self-service renewal flow of checkout.
- [x] Geen nieuwe CRM-automatisering of zware lifecycle automation engine.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en combinatie.
- [x] Geen databasegedreven customer state machine als voorwaarde voor v1-lifecyclehelderheid.
- [x] Geen methodische herbouw van scoring, survey of report-engine buiten wat nodig was voor lifecycle-alignment.

## 8. Defaults Chosen

- [x] `CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLANMODE_PROMPT.md` is de leidende prompt voor dit traject.
- [x] `docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md` is de source of truth.
- [x] ExitScan blijft de primaire eerste koop.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Expansion moet voelen als logische vervolgstap op basis van eerdere waarde, niet als losse upsell.
- [x] Eerste koop blijft een betaald baseline-traject.
- [x] `scan_type`, `delivery_mode` en `segment_deep_dive` blijven de dragende technische primitives; geen billingmodel in deze tranche.
- [x] Combinatie blijft een portfolioroute op aanvraag en geen standaard bundel.
- [x] V1 gebruikt bestaande marketing-, onboarding-, dashboard- en learninglagen in plaats van een nieuwe lifecycle-engine.
- [x] `PROMPT_CHECKLIST.xlsx` is bijgewerkt op de echte repo-status.
