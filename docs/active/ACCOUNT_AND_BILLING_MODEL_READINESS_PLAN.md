# ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

Historical boundary note:

- dit plan blijft leidend voor account- en billing-readiness binnen zijn eigen tranche
- buyer-facing routewoorden in dit document kunnen pre-normalisatie labels bevatten zoals `ExitScan Live` en `RetentieScan ritme`
- lees die labels in de huidige hardeningcontext als `ExitScan ritmeroute` en `RetentieScan ritmeroute`
- bij conflict met de actuele taal- of reportcanon winnen [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md) en [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)

## 1. Summary

Dit traject maakt van de huidige combinatie van tenantlogica, access control, pricingcopy, assisted onboarding en handmatige facturatie een expliciet account- en billingmodel voor Verisight, zonder nu al Stripe, subscriptions of self-service billing te bouwen.

Bewuste defaults:

- [x] ExitScan blijft de primaire commerciële wedge en de eerste account-/billingtoetssteen.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Assisted verkoop, admin-first provisioning en handmatige facturatie blijven voorlopig de operationele waarheid.
- [x] `organization` blijft in v1 zowel tenantgrens als primaire accounteenheid.
- [x] Een bovenliggende multi-org billing account blijft buiten scope voor v1 en wordt nu alleen als latere enterprise-uitzondering erkend.
- [x] Rollen `owner` / `member` / `viewer` blijven toegangsrollen en zijn geen seats of licenties.
- [x] `campaign` blijft fulfillment- en operationele eenheid, niet automatisch billing- of subscriptioneenheid.
- [x] `scan_type`, `delivery_mode` en `segment_deep_dive` blijven de dragende runtime-primitives, maar vormen samen nog geen volwaardig plan- of billingmodel.
- [x] ExitScan Live en RetentieScan ritme blijven voorlopig guided, quote-only of assisted vervolgconstructies en geen recurring self-serve plans.
- [x] Deze tranche legt modelkeuzes, grenzen en readiness-gates vast; ze bouwt geen nieuwe runtime-entiteiten zoals `billing_account`, `subscription`, `seat` of `usage_record`.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Een actieve source of truth toegevoegd in `docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`.
- [x] De huidige tenant-, access-, pricing-, onboarding- en legaltruth repo-gebaseerd samengebracht tot één account- en billingmodel.
- [x] De runtime-betekenis van dit model vastgezet in `docs/reference/ARCHITECTURE.md`.
- [x] De v1-accountgrens, access-vs-seatgrens en fulfillment-vs-billinggrens expliciet gemaakt in `frontend/lib/types.ts`.
- [x] Buyer-facing legal copy aangescherpt in `frontend/app/voorwaarden/page.tsx` zodat assisted levering en handmatige facturatie expliciet blijven.
- [x] Een gerichte parity check toegevoegd in `tests/test_account_billing_model_readiness.py`.
- [x] Expliciet vastgelegd dat `organization` in v1 de primaire accounteenheid blijft en dat multi-org billing nog buiten scope valt.
- [x] Expliciet vastgelegd welke commerciële package-eenheden later mogelijk entitlement- of billingrelevantie krijgen en welke voorlopig alleen verkoopstructuur blijven.
- [x] Expliciet vastgelegd dat rollen geen seats zijn en dat campaigns, respondenten en responses nog geen bewezen billingdrivers zijn.
- [x] Assisted uitzonderingen en provisioninggrenzen vastgelegd voor org-aanmaak, campaign setup, respondentimport, invite-timing, klantactivatie en rapportrelease.
- [x] Billing-readiness gates en no-go rules vastgelegd vóór Stripe, self-service billing of recurring plans.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.
- [x] Roadmap opnieuw gesynchroniseerd via `sync_planning_artifacts.py`.

Bewust niet uitgevoerd in deze tranche:

- [x] Geen backend- of schemawijzigingen.
- [x] Geen implementatie van Stripe, checkout, subscriptionbeheer of payment collection.
- [x] Geen nieuwe schema-, type- of API-entiteiten voor billing, plans, seats of usage.
- [x] Geen zichtbare factuur- of betaalstatus in-product.
- [x] Geen nieuwe runtime-capabilities buiten docs, type-semantiek, legal copy en parity checks.

## 2. Milestones

### Milestone 0 - Freeze The Current Repo Truth
Dependency: none

#### Tasks
- [x] De huidige accountachtige repo-primitives expliciet vastgelegd over `organizations`, `org_members`, `org_invites`, `profiles`, `campaigns`, `organization_secrets` en invite-acceptatie.
- [x] De huidige commerciële primitives vastgelegd over pricing, eerste trajecten, vervolgvormen, add-ons en combinatieroute.
- [x] Expliciet onderscheid gemaakt tussen huidige tenant/access-werkelijkheid en ontbrekende billing/account-capabilities.
- [x] Vastgelegd welke assisted handelingen nu de ontbrekende billing- en lifecyclelaag opvangen.
- [x] Benoemd waar site, voorwaarden, onboarding en dashboard al verwachtingen wekken die later een account- of billingmodel zullen raken.

#### Definition of done
- [x] Er ligt één repo-gebaseerd startbeeld van de huidige account-, access-, packaging- en provisioningrealiteit.
- [x] Het verschil tussen tenantmodel, accessmodel en commercieel accountmodel is expliciet gemaakt.
- [x] Er blijven geen impliciete aannames over billing of accountstructuur verborgen in copy of code.

#### Validation
- [x] Observaties zijn herleidbaar naar schema, frontend flows, backend routes, pricingcopy, voorwaarden en actieve plannen.
- [x] De beschrijving blijft eerlijk assisted/productized en claimt geen model dat nog niet bestaat.
- [x] ExitScan-first en RetentieScan-complementair blijven ook in de accountanalyse zichtbaar.

### Milestone 1 - Define The Canonical Verisight Account Architecture
Dependency: Milestone 0

#### Tasks
- [x] De canonieke entiteiten voor Verisight gedefinieerd: legal customer, buyer contact, billing account, tenant organization, user identity, membership, invite, campaign, package contract en add-on.
- [x] Beslist dat de huidige `organization` in v1 de primaire accounteenheid blijft en niet slechts een tenantlaag onder een aparte billing account.
- [x] Beslist dat meerdere organisaties onder één betalende klant in v1 buiten scope blijven en alleen als latere enterprise-uitzondering conceptueel worden erkend.
- [x] Vastgelegd welke relatie hoort te bestaan tussen account, org, campaign en commerciële route.
- [x] Vastgelegd welke concepten bewust nog níet bestaan in v1, zodat implementatie niet prematuur gaat abstraheren.

#### Definition of done
- [x] Verisight heeft één expliciet accountmodel dat past bij de huidige product- en klantrealiteit.
- [x] Tenant, customer account en billing account zijn logisch samengevoegd voor v1 en tegelijk voldoende afgebakend voor latere uitbreiding.
- [x] Toekomstige implementatie hoeft niet meer te raden welke entiteit later eigenaar van billing of provisioning wordt.

#### Validation
- [x] Het accountmodel botst niet met huidige RLS-, invite-, dashboard- of onboardinglogica.
- [x] Het model ondersteunt assisted verkoop zonder fake-SaaS framing.
- [x] Het model blijft klein genoeg voor de huidige fase en groot genoeg om latere billing niet te blokkeren.

### Milestone 2 - Define Package, Plan, Seat And Usage Boundaries
Dependency: Milestone 1

#### Tasks
- [x] De huidige commerciële boom vertaald naar expliciete modelregels voor eerste traject, vervolgvorm, add-on en combinatieroute.
- [x] Beslist welke huidige package-eenheden later entitlement- of billingrelevantie mogen krijgen en welke bewust alleen verkoopstructuur blijven.
- [x] Expliciet beoordeeld of campaigns, respondents, responses, gebruikers, rollen of accessrechten logische seat- of usage-eenheden zijn.
- [x] Vastgelegd dat `owner` / `member` / `viewer` toegangsrollen zijn en niet automatisch seats of facturabele licenties.
- [x] Vastgelegd welke usage-signalen wel operationeel relevant zijn, maar nog geen billing driver mogen worden.

#### Definition of done
- [x] Verisight heeft een expliciete grens tussen package-taal, runtime-primitives, seats en usage.
- [x] Er is duidelijk welke eenheden later factureerbaar kunnen worden en welke niet.
- [x] De commerciële pricinglaag is koppelbaar aan techniek zonder haar nu al in een subscriptionmodel te forceren.

#### Validation
- [x] Geen keuze forceert nu al Stripe-, checkout-, planmatrix- of seat-UI.
- [x] Pricing, lifecycle en technische primitives blijven semantisch consistent.
- [x] Het model maakt duidelijk waarom `scan_type`, `delivery_mode` en `segment_deep_dive` nu nog niet genoeg zijn als volwaardig billingmodel.

### Milestone 3 - Define Assisted Exceptions And Provisioning Contracts
Dependency: Milestone 2

#### Tasks
- [x] Per stap vastgelegd wat nu operator-owned blijft: org-aanmaak, campaign setup, respondentimport, invite-timing, klantactivatie, rapportrelease en eerste managementread.
- [x] Vastgelegd welke provisioningacties later account-owned, manager-owned of klant-owned zouden kunnen worden.
- [x] Expliciet access provisioning gescheiden van commercial entitlement en billing state.
- [x] Gedefinieerd welke provisioningimpact een later accountmodel heeft op org-archivering, org-verwijdering, campaign-creatie, invite-acceptatie en dashboardtoegang.
- [x] Vastgelegd welke assisted uitzonderingen ook in een latere billingfase tijdelijk mogen blijven bestaan.

#### Definition of done
- [x] Verisight heeft een expliciete provisioningkaart die past bij de huidige assisted werkelijkheid.
- [x] Toekomstige billingbouw kan niet per ongeluk access provisioning en facturatie door elkaar halen.
- [x] Elke belangrijke provisioningstap heeft een duidelijke eigenaar en toekomstgrens.

#### Validation
- [x] De provisioningcontracten sluiten aan op huidige invites, `complete-account`, dashboardlayout en admin setup.
- [x] Geen toekomstige self-service stap wordt toegestaan zonder operationele onderbouwing.
- [x] Het model blijft consistent met client onboarding, implementation readiness en lifecycle-truth.

### Milestone 4 - Define Billing Readiness Gates And No-Go Rules
Dependency: Milestone 3

#### Tasks
- [x] Vaste readiness-gates gedefinieerd vóór elke latere billingimplementatie op product-, commerciële, ops-, evidence-, legal- en modelas.
- [x] Vastgelegd welke externe randvoorwaarden eerst waar moeten zijn, zoals facturatiebasis, contractlaag, supportbelasting en case-proof.
- [x] Expliciet vastgelegd welke billingkeuzes nu te vroeg zijn: Stripe-checkout, self-serve plans, seat billing, usage billing, renewals, dunning en plan switches.
- [x] Vastgelegd wanneer recurring billing überhaupt logisch mag worden voor ExitScan Live of RetentieScan ritme, en wanneer juist niet.
- [x] Guardrails toegevoegd tegen copy, UI of roadmaptaal die billingvolwassenheid suggereert die de repo nog niet draagt.

#### Definition of done
- [x] Verisight heeft een streng genoeg gate-model vóór Stripe of self-service billing.
- [x] Het onderwerp billing is expliciet ondergeschikt gemaakt aan eerdere model- en evidencevolwassenheid.
- [x] Premature billingautomatisering wordt inhoudelijk en commercieel geblokkeerd.

#### Validation
- [x] Gates sluiten aan op roadmap, strategy, pricing en assisted-to-SaaS guardrails.
- [x] Geen no-go botst met legitieme assisted facturatie of handmatige offerteflow.
- [x] De readinessregels zijn concreet genoeg om latere implementatie- en reviewrondes te sturen.

### Milestone 5 - Convert The Model Into An Execution Sequence
Dependency: Milestone 4

#### Tasks
- [x] Het account- en billingmodel vertaald naar een concrete volgorde voor toekomstige implementatie over docs, schema, types, APIs, UI-copy en tests.
- [x] Benoemd welke repo-oppervlakken later als eerste geraakt mogen worden en welke bewust pas na latere gates.
- [x] Acceptance-scenario's gedefinieerd voor account boundary, inviteflow, entitlementgrenzen, manual billingtruth en geen premature self-service.
- [x] Vastgelegd hoe dit plan zich verhoudt tot `OPS_AND_DELIVERY_SYSTEM`, `CASE_PROOF_AND_EVIDENCE` en latere billing-implementatie.
- [x] De planningslaag afgesloten door dit plan als source of truth te positioneren en `PROMPT_CHECKLIST.xlsx` administratief te koppelen.

#### Definition of done
- [x] Het model is vertaald naar een concrete uitvoervolgorde zonder open implementatiekeuzes.
- [x] Een volgende engineer of agent weet exact welke laag eerst uitgewerkt moet worden en welke juist niet.
- [x] Dit plan staat repo-breed vast als leidend document voor account- en billing readiness.

#### Validation
- [x] De volgorde sluit aan op roadmap en bestaande actieve plans.
- [x] Acceptance-scenario's dekken assisted waarheid, accessgrenzen en toekomstige billingveiligheid.
- [x] De checklist- en governance-afsluiting zijn duidelijk genoeg om vervolgwerk administratief zuiver te houden.

## 3. Execution Breakdown By Subsystem

### Data, tenancy and access
- [x] `organization` expliciet vastgezet als huidige tenantgrens én v1-accounteenheid.
- [x] `org_members`, `org_invites` en `profiles` voorlopig als accesslaag gehouden en niet commercieel hergeïnterpreteerd.
- [x] Vastgelegd dat een latere account- of billingabstractie pas bovenop de bestaande tenancylaag mag landen als multi-org of enterprise-need echt optreedt.

### Commercial packaging and entitlement model
- [x] ExitScan Baseline, RetentieScan Baseline, ExitScan Live, RetentieScan ritme, `segment_deep_dive` en combinatie vertaald naar één modelboom.
- [x] Vastgelegd dat eerste trajecten en vervolgvormen nu vooral commerciële contracten zijn en nog geen runtime plans.
- [x] Vastgelegd dat combinatie structureel buiten een standaard planmodel blijft en routegebonden of quote-only blijft.
- [x] De repo beschermd tegen planmatrix-, license- en seattaal zolang het model dat niet draagt.

### Provisioning, onboarding and lifecycle
- [x] Assisted setup, klantactivatie en dashboardtoegang expliciet gescheiden van toekomstige billingstatus.
- [x] Operator-owned stappen vastgelegd voor org-aanmaak, campaign setup, importcontrole, invite-timing en rapportrelease.
- [x] Latere klant-owned of manager-owned provisioning beperkt tot kleine, veiligere stappen zoals lezen, activatie of mogelijk invitebeheer, niet tot volledige setup.
- [x] Lifecycle-besluiten gekoppeld aan managementwaarde en reviewmoment, niet aan automatische subscriptionlogica.

### Billing operations and legal readiness
- [x] Handmatige facturatie expliciet bevestigd als huidige waarheid naast pricing, voorwaarden en assisted verkoop.
- [x] Vastgelegd dat contract-, offerte-, factuur- en supportsignalen eerst buiten runtime bestaan vóór billing in-product logisch wordt.
- [x] Vastgelegd dat factuur- of betaalstatus voorlopig niet zichtbaar hoeft te zijn in product of dashboard.
- [x] Vastgelegd dat recurring billing voor ExitScan Live of RetentieScan ritme pas logisch wordt na bewijs van stabiele delivery, herhaalgedrag en case-proof.

### Future implementation surfaces
- [x] Verwachte eerste document- en modeldragers later benoemd: actieve source-of-truth docs, schema-notities, gedeelde types, pricing/trust/legal copy, acceptance-checks en paritytests.
- [x] Vastgelegd dat geen nieuwe runtime-entiteiten voor billing, subscription, seat of usage ontstaan zonder expliciete modelbeslissing uit dit plan.
- [x] Vastgelegd dat toekomstige implementatie eerst access, packaging en assisted provisioning moet beschermen vóór payment- of checkoutlogica in beeld komt.

### Validation and acceptance scenarios
- [x] Acceptance vastgelegd dat `organization` in v1 de primaire accounteenheid blijft.
- [x] Acceptance vastgelegd dat `member` voorlopig interne Verisight-rol blijft en niet automatisch klantseat wordt.
- [x] Acceptance vastgelegd dat campaigns fulfillment-eenheid blijven en niet automatisch billable unit worden.
- [x] Acceptance vastgelegd dat geen publieke surface self-service billing, plans, seats of checkout suggereert.
- [x] Acceptance vastgelegd dat invite- en accessflow blijven werken zonder billingstate afhankelijk te maken.

## 4. Current Product Risks

- [x] Risico op te vroege billingautomatisering: huidige assisted operatie kan nog verborgen modelgaten maskeren.
- [x] Risico op verkeerd accountmodel: `organization` is nu tenant én operationele klantcontainer, maar moest nog expliciet als v1-accounteenheid worden gevalideerd.
- [x] Risico op mismatch tussen pricing en technische provisioning: pricing verkoopt route- en packagekeuzes die runtime nog niet als entitlementmodel kent.
- [x] Risico op self-service verwachtingen die het product nog niet kan dragen: invites, auth en dashboardtoegang kunnen sneller volwassen lijken dan de delivery- en supportlaag werkelijk is.
- [x] Risico op te vroeg seat-denken: rollen zijn nu toegangsniveaus, geen licentie-eenheden.
- [x] Risico op te vroeg usage-denken: campaigns, respondenten en responses zijn nu operationele signalen, geen bewezen billingdrivers.
- [x] Risico op commerciële of juridische drift: voorwaarden spreken al over facturatie, terwijl de app nog geen billingstatus of entitlementgrens kent.

## 5. Open Questions

- [ ] Wanneer is de eerste echte enterprise- of multi-org klantvorm sterk genoeg om een aparte billing account boven `organization` te rechtvaardigen?
- [ ] Welke guided vervolgroute levert als eerste genoeg stabiel herhaalgedrag op om recurring billing serieus te heroverwegen: ExitScan Live of RetentieScan ritme?
- [ ] Willen we later klant-managed invitebeheer toestaan vóór klant-managed campaign setup?
- [ ] Wanneer wordt factuur- of betaalstatus zinvol genoeg om in runtime zichtbaar te maken zonder de assisted waarheid te verstoren?

## 6. Follow-up Ideas

- [ ] Gebruik dit plan als randvoorwaarde voor een latere implementatietranche op schema-, type- en docsniveau, niet meteen voor Stripe.
- [ ] Gebruik dit plan samen met `OPS_AND_DELIVERY_SYSTEM_PLAN.md` en `CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md` als gate vóór elke echte billingbouw.
- [ ] Maak later een compacte decision matrix `account vs tenant vs billing account` voor enterprise-achtige uitzonderingen.
- [ ] Voeg later acceptance-tests toe die expliciet beschermen tegen planmatrix-, checkout- en seatframing in buyer-facing surfaces.
- [ ] Gebruik echte vroege klantcases later om te ijken of billing eerder campaign-, route- of reviewmoment-gebaseerd moet zijn.

## 7. Out of Scope For Now

- [x] Geen implementatie van Stripe, checkout, payment collection of subscriptionbeheer.
- [x] Geen seat billing, usage billing, proration, dunning of taxlogica.
- [x] Geen self-service org-creatie, self-serve campaign provisioning of klantgedreven packagewissels.
- [x] Geen nieuwe publieke billing- of account-API's.
- [x] Geen brede CRM-, renewal- of revenue-operations engine.
- [x] Geen nieuwe productfamilies buiten ExitScan, RetentieScan en de bestaande combinatieroute.
- [x] Geen zichtbare factuur- of betaalstatus in het huidige product.

## 8. Defaults Chosen

- [x] `ACCOUNT_AND_BILLING_MODEL_READINESS_PLANMODE_PROMPT.md` is de leidende prompt voor dit traject.
- [x] `docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md` is de source of truth.
- [x] `organization` blijft in v1 de primaire tenant- en accounteenheid.
- [x] Een aparte multi-org billing account blijft buiten scope voor v1.
- [x] ExitScan blijft de primaire commerciële wedge en dus ook de primaire account-/billingtoetssteen.
- [x] RetentieScan blijft complementair en mag het model niet complexer maken dan ExitScan eerst al rechtvaardigt.
- [x] Assisted verkoop en handmatige facturatie blijven voorlopig geldige waarheid, maar zijn nu modelmatig expliciet gemaakt.
- [x] Rollen blijven standaard accessrollen en niet automatisch seats.
- [x] `campaign` blijft voorlopig fulfillment- en operationele eenheid, niet automatisch billing- of subscriptioneenheid.
- [x] `segment_deep_dive` blijft voorlopig de enige duidelijk gemodelleerde add-on.
- [x] Combinatie blijft buiten elk standaard planmodel en blijft routegebonden of op aanvraag.
- [x] Factuur- of betaalstatus blijft voorlopig buiten runtime.
- [x] Geen enkele toekomstige implementatie mag publieke self-service billing suggereren zonder expliciete readiness-gates uit dit plan.

## 9. Validation Run

Uitgevoerd in deze tranche:

- [x] `python -m pytest tests/test_account_billing_model_readiness.py tests/test_pricing_packaging_system.py tests/test_customer_lifecycle_and_expansion_model.py`
- [x] `npm.cmd run lint -- app/voorwaarden/page.tsx lib/types.ts`
- [x] `npm.cmd run build`
- [x] `python sync_planning_artifacts.py`

Bewust niet uitgevoerd:

- [x] Geen aparte backendtest-suite buiten parity-checks
  - Deze tranche wijzigt geen backendcode of schema.

## 10. Files That Carry This Tranche

- `docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md`
- `docs/reference/ARCHITECTURE.md`
- `frontend/lib/types.ts`
- `frontend/app/voorwaarden/page.tsx`
- `tests/test_account_billing_model_readiness.py`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP.md`
