# ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

## 1. Summary

Deze tranche legt vast wat eerst waar moet zijn voordat Verisight verantwoord richting SaaS kan bewegen. De repo laat nu een sterk assisted/productized model zien met echte productbasis, maar zonder billing, self-service provisioning, planlogica of volwassen lifecycle-automation.

Bewuste defaults:

- [x] ExitScan blijft de primaire entreepropositie.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Assisted delivery blijft voorlopig de verkochte waarheid.
- [x] Semi-self-service mag alleen ontstaan waar dat de assisted route ondersteunt, niet vervangt.
- [x] Billing, subscriptions, plans, seats en no-touch onboarding blijven uit scope tot de readiness-gates zijn gehaald.
- [x] Deze tranche doet geen product- of schemawijzigingen; ze legt gates, grenzen en volgorde vast.
- [x] Bestaande publieke en interne interfaces blijven leidend:
  - `campaigns.delivery_mode`
  - rollen `owner` / `member` / `viewer`
  - admin-first setup-, import-, invite- en rapportflows
  - contact -> intake -> setup -> dashboard/readout als assisted keten

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Actief source-of-truth planbestand toegevoegd voor assisted-to-SaaS readiness.
- [x] Current assisted reality repo-gebaseerd vastgelegd over marketing, pricing, onboarding, implementation, demo, dashboard, rapport en learning.
- [x] Assisted, semi-self-service en later-SaaS grenzen expliciet geclassificeerd.
- [x] Readiness gates vastgelegd voor product, commercie, trust, onboarding, delivery, evidence en account/billing.
- [x] Volgorde vastgelegd voor de open Phase F-vervolgtrajecten.
- [x] False-SaaS guardrails expliciet gemaakt voor copy, UX, pricing en planning.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.
- [x] Roadmap opnieuw gesynchroniseerd via `sync_planning_artifacts.py`.

Bewust niet uitgevoerd in deze tranche:

- [ ] Geen wijzigingen aan frontend, backend, schema of productcopy.
- [ ] Geen billing-, lifecycle- of self-service implementatie.
- [ ] Geen nieuw accountmodel, planmodel of usage-logica.
- [ ] Geen nieuwe tests of runtime-capabilities buiten de planninglaag.

## 2. Milestones

### Milestone 0 - Freeze The Current Assisted Reality
Dependency: none

#### Tasks
- [x] De huidige assisted waarheid vastgelegd over marketing, pricing, onboarding, implementation, demo, dashboard, rapport en learning.
- [x] Expliciet benoemd welke stappen nu buyer-facing zijn, welke intern zijn en welke shared handoff-momenten vormen.
- [x] Vastgelegd welke onderdelen al productized en herhaalbaar zijn, en welke nog sterk operator- of founder-dependent blijven.
- [x] Vastgelegd welke repo-signalen nu al SaaS-achtig ogen, maar nog geen echte self-service capability dragen.
- [x] De huidige source-of-truth hierarchie bevestigd tussen promptchecklist, roadmap, strategy en actieve plannen.

#### Definition of done
- [x] Er ligt een repo-gebaseerd beeld van de huidige assisted operating model.
- [x] Het verschil tussen productfundament en echte SaaS-readiness is expliciet gemaakt.
- [x] Geen conclusie leunt op generieke SaaS-aannames buiten de repo.

#### Validation
- [x] Observaties zijn herleidbaar naar marketing, dashboard, backend, schema en actieve programmaplannen.
- [x] ExitScan-first en RetentieScan-complementair blijven zichtbaar.
- [x] De huidige vorm wordt benoemd als assisted/productized en niet als verborgen self-service.

### Milestone 1 - Classify Assisted, Semi-Self-Service And Later-SaaS Boundaries
Dependency: Milestone 0

#### Tasks
- [x] De huidige keten opgesplitst in drie expliciete zones:
  - assisted moet blijven
  - semi-self-service kan nu of binnenkort
  - pas later logisch als echte SaaS-capability
- [x] Per zone minimaal beoordeeld:
  - leadcapture en routekeuze
  - org/campaign provisioning
  - respondentimport
  - invites en reminders
  - klantactivatie
  - dashboardgebruik
  - rapportdownload
  - demo/sample usage
  - learning capture
- [x] Vastgelegd welke stappen bewust operator-owned blijven zolang trust, delivery of evidence nog niet sterk genoeg zijn.
- [x] Vastgelegd welke buyer- of klantacties al veilig zonder operator-interventie kunnen.
- [x] Expliciet gedefinieerd welke false-SaaS signalen nu vermeden moeten worden in copy, UI en roadmap.

#### Definition of done
- [x] De grens tussen assisted, semi-self-service en later-SaaS is decision-complete.
- [x] Elk belangrijk onderdeel van de klant- en deliveryketen heeft een expliciete status.
- [x] Er blijft geen impliciete ruimte over voor premature self-service interpretatie.

#### Validation
- [x] De indeling botst niet met strategy, pricing, onboarding of implementation readiness.
- [x] Geen semi-self-service stap veronderstelt al billing, plans of no-touch provisioning.
- [x] De classificatie blijft commercieel scherp en methodisch eerlijk.

### Milestone 2 - Define SaaS-Readiness Gates Before Any Billing Or Self-Service Expansion
Dependency: Milestone 1

#### Tasks
- [x] Vaste gates gedefinieerd voor een latere SaaS-stap op minimaal deze assen:
  - productgereedheid
  - commerciele gereedheid
  - trust- en claimsgereedheid
  - onboarding- en implementationgereedheid
  - delivery- en opsgereedheid
  - bewijs- en caselayer
  - account- en billinggereedheid
- [x] Per gate concrete minimumvoorwaarden vastgelegd.
- [x] Vastgelegd welke gates eerst voor ExitScan gehaald moeten worden voordat RetentieScan dezelfde stap logisch mag zetten.
- [x] Expliciet gemaakt dat polished UI, auth en dashboards op zichzelf geen SaaS-gate zijn.
- [x] Vastgelegd welke readiness-signalen eerst uit echte klanten, pilots en follow-up moeten komen.

#### Definition of done
- [x] Verisight heeft een expliciet gate-model voor assisted-to-SaaS readiness.
- [x] Billing en self-service zijn duidelijk afhankelijk gemaakt van eerdere readinessvoorwaarden.
- [x] De gates zijn streng genoeg om premature schaalframing te blokkeren.

#### Validation
- [x] Gates sluiten aan op de huidige open Phase F-prompts.
- [x] Gates vereisen echte case-, ops- en deliveryvolwassenheid en niet alleen productpolish.
- [x] ExitScan en RetentieScan blijven logisch geordend binnen dezelfde gate-structuur.

### Milestone 3 - Convert The Gates Into An Execution Order Across Subsystems
Dependency: Milestone 2

#### Tasks
- [x] De gates vertaald naar een uitvoerbare volgorde over subsystemen.
- [x] De open vervolgtrajecten expliciet gekoppeld aan deze readinesslogica:
  - Ops And Delivery System
  - Case Proof And Evidence
  - Customer Lifecycle And Expansion Model
  - Account And Billing Model Readiness
  - Portfolio Architecture
  - Content Operating System
- [x] Vastgelegd welke trajecten eerst nodig zijn en welke pas na bewijs of tractie mogen starten.
- [x] Per subsystem benoemd welke bestaande repo-interfaces voorlopig stabiel moeten blijven.
- [x] Gedefinieerd welke nieuwe capability-categorieen later wel logisch worden:
  - lifecycle instrumentation
  - customer-owned setup states
  - billing abstractions
  - usage or seat logic
  - automated customer operations

#### Definition of done
- [x] De schaalfase is opgesplitst in logische, afhankelijke trajecten.
- [x] Er is geen onduidelijkheid meer over wat voor billing en lifecycle moet gebeuren.
- [x] Bestaande flows worden beschermd tegen te vroege uitbreidingen.

#### Validation
- [x] De volgorde sluit aan op roadmap en promptchecklist.
- [x] Geen vervolgtraject wordt naar voren gehaald zonder gate-onderbouwing.
- [x] De uitvoering blijft consistent met de huidige assisted verkoopvorm.

### Milestone 4 - Add Guardrails Against False SaaS Moves
Dependency: Milestone 3

#### Tasks
- [x] Expliciete no-go's gedefinieerd voor copy, UX, pricing en roadmap.
- [x] Vastgelegd welke woorden, UI-patronen en commerciele signalen nu misleidend zouden zijn.
- [x] Vastgelegd welke vormen van self-service voorlopig alleen intern of admin-first mogen blijven.
- [x] Een compacte acceptance-laag gemaakt voor toekomstige reviews:
  - geen planmatrix zonder accountmodel
  - geen checkout zonder billinglogica
  - geen self-serve setup zonder operational hardening
  - geen claims over scale of automation die de repo niet draagt
- [x] Vastgelegd hoe deze guardrails in toekomstige prompts en reviews terug moeten komen.

#### Definition of done
- [x] False-SaaS risico's zijn expliciet benoemd en afgekaderd.
- [x] Toekomstige trajecten kunnen niet ongemerkt de assisted waarheid ondergraven.
- [x] Marketing en product kunnen scherper werken zonder onwaar te worden.

#### Validation
- [x] Guardrails sluiten aan op trust-, pricing- en onboardingtruth.
- [x] Geen guardrail blokkeert legitieme semi-self-service waar die al past.
- [x] De guardrails zijn concreet genoeg voor toekomstige plan- en reviewrondes.

### Milestone 5 - Close The Planning Layer And Governance
Dependency: Milestone 4

#### Tasks
- [x] Dit plan vastgelegd als leidende source of truth voor assisted-to-SaaS readiness.
- [x] Expliciet benoemd welke vervolgprompt logisch als eerste komt na dit plan.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt naar de echte status van dit traject.
- [x] Vastgelegd hoe toekomstige Phase F-plannen naar dit document moeten verwijzen.
- [x] De huidige defaults, out-of-scope grenzen en open vervolgvragen genoteerd.

#### Definition of done
- [x] Dit plan is het leidende document voor dit onderwerp.
- [x] Het prompt-systeem weerspiegelt dat deze readinesslaag nu expliciet bestaat.
- [x] Vervolgplannen kunnen niet meer om deze readinessdefinitie heen.

#### Validation
- [x] Checklist, roadmap en planbestand wijzen dezelfde richting op.
- [x] De volgende promptkeuze is logisch uit dit document af te leiden.
- [x] Er is geen overlap of conflict met bestaande actieve source-of-truth plannen.

## 3. Execution Breakdown By Subsystem

### Product and positioning
- [x] Assisted/productized blijft de kernwaarheid.
- [x] ExitScan is de eerste readinessdrager; RetentieScan volgt later of beperkter waar nodig.
- [x] Geen nieuwe productfamilies of verbrede suite-framing in deze tranche.

### Marketing, pricing and buyer journey
- [x] Publieke routekeuze, pricing en trust blijven compact en assisted.
- [x] Sample output, trusthub en pricing zijn benoemd als readiness-enablers en niet als bewijs van self-service maturity.
- [x] De site moet beschermd blijven tegen planmatrix-, checkout- of start-direct-framing.

### Onboarding, implementation and delivery
- [x] De huidige admin-first setup, importcontrole, invitekeuze en klantactivatie blijven de norm.
- [x] Semi-self-service mag alleen rond lezen, activeren, rapport gebruiken en buyer self-education ontstaan.
- [x] No-touch onboarding blijft geblokkeerd tot ops-, evidence- en lifecycle-gates gehaald zijn.

### Dashboard, report and adoption
- [x] Dashboard en rapport blijven eerst managementinstrumenten en geen setup- of adminproduct voor klanten.
- [x] Viewer-ervaring blijft read-first en assisted.
- [x] Adoption readiness telt pas mee als eerste managementgebruik echt herhaalbaar is.

### Data, tenancy, roles and platform model
- [x] Huidige org/campaign/respondent/response-architectuur is een goede basis, maar nog geen accountmodel.
- [x] Rollen `owner` / `member` / `viewer` blijven voorlopig voldoende; geen plans, seats of usage abstraheren in deze tranche.
- [x] Bestaande admin-proxy's en organization secrets blijven ondersteunde tussenlaag zolang self-service ontbreekt.

### Billing, lifecycle and customer operations
- [x] Geen implementatie van Stripe, subscriptions, invoices, seats of usage.
- [x] Eerst account- en billingmodel uitwerken als apart vervolgtraject.
- [x] Eerst customer lifecycle en expansion model expliciteren voor automation of billing-UI.

### Demo, proof and evidence
- [x] Demo/sample-omgeving blijft sales- en validation-infrastructuur en geen publieke self-serve demo-tenant.
- [x] Echte case-proof en follow-up outcomes blijven harde voorwaarden voor geloofwaardige SaaS-opschuiving.
- [x] Pilot-learning blijft de inputlaag voor readiness en niet alleen een intern archief.

### Validation and acceptance scenarios
- [x] Marketingroutes blijven assisted en claimen geen self-service product dat niet bestaat.
- [x] Viewer kan lezen en activeren, maar niet provisionen of campagnes inrichten.
- [x] Admin setupflow voor org, campaign, import en invites blijft werken zoals nu.
- [x] `complete-account` blijft expliciet handoff-copy dragen.
- [x] Er ontstaan geen nieuwe schema's, endpoints of UI's voor billing, plans, seats of checkout in deze tranche.
- [x] Vervolgprompt na dit plan wordt pas gekozen op basis van de vastgelegde gates.

## 4. Current Product Risks

- [x] Risico op te vroege SaaS-framing: de buitenkant oogt productmatig genoeg om meer te beloven dan de operating model nu draagt.
- [x] Risico op operationele overbelasting: te vroege self-service schuift QA, importdiscipline, invite-timing en klantuitleg naar de klant of supportlaag.
- [x] Risico op self-service zonder voldoende trust of packaging: auth en dashboard bestaan al, maar dat is nog geen volwassen no-touch propositie.
- [x] Risico op productverwarring tussen assisted en future SaaS-vorm: marketing, pricing of roadmap kunnen anders sneller software-only suggereren.
- [x] Risico op hidden founder/operator dependency: meerdere kritieke stappen zijn wel gestandaardiseerd, maar nog niet ontkoppeld van menselijke beoordeling.
- [x] Risico op te vroege billing-denklijn: account-, plan- en lifecyclelogica ontbreken nog als dragend model.
- [x] Risico op onvoldoende bewijs: zonder cases, follow-up en echte learning-closure blijft scale-framing kwetsbaar.

## 5. Open Questions

- [ ] Moet een latere eerste self-service stap eerder bij buyer self-education liggen dan bij campaign provisioning?
- [ ] Moet ExitScan expliciet eerder readiness-gates mogen halen dan RetentieScan, of blijft een gedeelde gate de norm?
- [ ] Willen we later klant-managed invites eerder toestaan dan klant-managed campaign setup?
- [ ] Wanneer is voldoende evidence sterk genoeg om account- en billingmodel echt prioriteit te geven?

## 6. Follow-up Ideas

- [ ] Gebruik dit plan direct als ingang voor `OPS_AND_DELIVERY_SYSTEM_PLAN.md`.
- [ ] Trek daarna `CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md` naar voren voordat billing of lifecycle wordt uitgewerkt.
- [ ] Gebruik pilot-learning later expliciet als input voor case-proof, pricing-verfijning en lifecycle-denken.
- [ ] Maak later een compacte readiness-scorecard voor ExitScan en RetentieScan apart.

## 7. Out of Scope For Now

- [x] Geen implementatie van self-service onboarding.
- [x] Geen implementatie van Stripe, checkout, subscriptions, plans, seats of usage billing.
- [x] Geen nieuwe publieke API- of developer-platformlaag.
- [x] Geen nieuwe productfamilies buiten ExitScan en RetentieScan.
- [x] Geen grote herbouw van auth, tenancy of backend-orchestratie zonder directe readinessreden.
- [x] Geen brede product analytics-stack als vervanger van de huidige manual-first learninglus.

## 8. Defaults Chosen

- [x] `ASSISTED_TO_SAAS_READINESS_PROGRAM_PLANMODE_PROMPT.md` is de leidende prompt.
- [x] `docs/active/ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md` is de source of truth voor dit onderwerp.
- [x] ExitScan blijft de primaire readinessdrager.
- [x] RetentieScan blijft complementair en mag niet eerder dan ExitScan als SaaS-speerpunt worden geframed.
- [x] Assisted onboarding, implementation en eerste managementread blijven voorlopig de productwaarheid.
- [x] Semi-self-service betekent voorlopig vooral self-education, accountactivatie, lezen en gebruik van output.
- [x] Billing, lifecycle en accountmodel komen pas na readiness- en evidence-gates.
- [x] Na dit plan is de logischste volgende vervolgprompt `OPS_AND_DELIVERY_SYSTEM_PLANMODE_PROMPT.md`.

## 9. Validation Run

Uitgevoerd in deze tranche:

- [x] `python sync_planning_artifacts.py`

Niet uitgevoerd:

- [ ] Frontend- of backendtests
  - Deze tranche voegt alleen documentatie en prompt-governance toe.

## 10. Files That Carry This Tranche

- `docs/active/ASSISTED_TO_SAAS_READINESS_PROGRAM_PLAN.md`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP.md`
