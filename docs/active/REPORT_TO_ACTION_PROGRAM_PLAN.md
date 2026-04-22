# REPORT_TO_ACTION_PROGRAM_PLAN.md

Status: active implementation plan, non-canon.
Precedence: dit plan beschrijft de report-to-action tranche, maar bepaalt niet zelfstandig report truth, structure canon of methodology canon. Bij conflict wint `docs/reporting/*`.

## 1. Summary

Dit traject scherpt de stap van rapport en dashboard naar concreet managementgedrag aan binnen Verisight, op basis van de actuele repo-implementatie in `backend/report.py`, de productspecifieke report-content modules, de dashboard campaign page, `RecommendationList`, `ActionPlaybookList`, preview-copy en parity-tests.

De uitgevoerde richting in deze tranche is:

- één gedeelde report-to-action contractlaag toevoegen over rapport en dashboard:
  - prioriteit nu
  - eerste gesprek
  - wie moet aan tafel
  - eerste eigenaar
  - eerste actie
  - reviewmoment
- ExitScan scherper maken van vertrekduiding naar eerste managementsessie, eigenaar en verbeteractie
- RetentieScan verification-first houden, maar explicieter laten landen in verificatiegesprek, eerste interventie en reviewmoment
- focusvragen en playbooks niet meer los laten voelen van de gekozen owner/action-route
- PDF-closeout en dashboard dezelfde eerste managementsessie laten sturen
- buyer-facing preview, productcopy en onboardingtaal laten aansluiten op dezelfde vervolgroute
- regressiebescherming toevoegen op follow-through contract, parity en PDF-smoke

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- de brede actionability-laag was al aanwezig via `Eerste besluit`, `Eerste eigenaar`, `Eerste logische stap`, focusvragen en playbooks
- de resterende gap zat vooral in samenhang en gebruiksvolgorde: vragen, hypotheses, playbooks en vervolgstappen bestonden, maar vormden nog niet overal één compacte route
- `RecommendationList` eindigde nog op vragen, terwijl `ActionPlaybookList` als parallel spoor voelde
- de PDF-rapporten hadden al hypotheses, gespreksagenda en vervolgstappen, maar nog geen strakke eerste managementsessie na oplevering
- preview-copy, productpagina’s en onboarding spraken al managementtaal, maar nog niet overal dezelfde follow-through taal

Status 2026-04-15:

- Uitgevoerd in deze ronde:
  - gedeelde follow-through types toegevoegd in frontend productcontracten
  - ExitScan- en RetentieScan-dashboard uitgebreid met `followThroughTitle`, `followThroughIntro` en zes vaste `followThroughCards`
  - campaign dashboard uitgebreid met expliciete sectie voor de eerste managementsessie
  - `RecommendationList` uitgebreid met gesprek, eigenaar, eerste actie en reviewmoment per prioriteitsfactor
  - `ActionPlaybookList` uitgebreid met expliciet reviewmoment
  - backend next-step payloads uitgebreid met `session_title`, `session_intro`, `session_cards` en leesgrens
  - PDF-closeout uitgebreid met een vaste sectie `Eerste managementsessie na oplevering`
  - retention playbooks en segment-playbooks in PDF uitgebreid met `Reviewmoment`
  - onboarding, preview-copy, marketing product output en productpagina’s aangepast op dezelfde route
  - scoring-, parity-, dashboard- en PDF-smoketests uitgebreid en groen herbevestigd
  - gerichte frontend lint-check en production build groen herbevestigd
- Bewust niet uitgevoerd in deze ronde:
  - geen scoring-herontwerp
  - geen nieuwe survey-items
  - geen CRM- of taakworkflow-systeem
  - geen aparte HR- versus directie-weergaven
  - geen automatische reminders of workflow-automation

## 2. Milestones

### Milestone 0 - Freeze Current Report-To-Action Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-15: baseline vastgelegd via actuele report-, dashboard- en testbestanden.

#### Tasks
- [x] Huidige route vastgelegd over management summary, bestuurlijke handoff, hypotheses, gespreksagenda, vervolgstappen, `RecommendationList` en `ActionPlaybookList`.
- [x] Vastgelegd waar de flow nog eindigde in vraag zonder eigenaar, actie zonder prioriteitskeuze of samenvatting zonder gebruiksvolgorde.
- [x] Grens vastgelegd tussen eerder `MANAGEMENT_ACTIONABILITY`-werk en deze tranche.

#### Definition of done
- [x] Er lag één repo-gebaseerd baselinebeeld van de report-to-action route.
- [x] Het verschil tussen actionability-copy en echte managementrouting was expliciet.

#### Validation
- [x] Observaties waren herleidbaar naar actuele report-, dashboard- en parity-bestanden.

---

### Milestone 1 - Define The Report-To-Action Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: gedeelde vervolgcontractlaag toegevoegd in frontend- en backend-productmodellen.

#### Tasks
- [x] Minimale vervolgrouting gestandaardiseerd op prioriteit, gesprek, deelnemers, eigenaar, eerste actie en reviewmoment.
- [x] Frontend dashboardcontract en backend report payloads dezelfde begrippen laten gebruiken.
- [x] Productverschil expliciet gehouden:
  - ExitScan = vertrekduiding -> managementgesprek -> eerste verbeteractie
  - RetentieScan = groepssignaal -> verificatiegesprek -> eerste interventie -> vervolgmeting

#### Definition of done
- [x] Er is één decision-complete report-to-action contract voor rapport en dashboard.
- [x] Vragen, hypotheses en acties kunnen minder makkelijk uit elkaar driften.

#### Validation
- [x] Contract blijft binnen claimsgrenzen en verification-first guardrails.

---

### Milestone 2 - Rebuild The Report Follow-Through Layer
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: report closeout uitgebreid met eerste managementsessie en expliciet reviewmoment.

#### Tasks
- [x] Rapport-closeout herbouwd naar prioriteit -> gesprek -> eigenaar -> actie -> reviewmoment.
- [x] ExitScan aangescherpt op vertrekspoor, managementgesprek en eerste verbeteractie.
- [x] RetentieScan aangescherpt op verificatiespoor, eerste interventie en vervolgmeting.
- [x] PDF-playbooks uitgebreid met expliciet reviewmoment.

#### Definition of done
- [x] Het rapport sluit af als managementroute in plaats van als losse analyse plus actieblok.
- [x] De brug van bevinding naar gesprek en vervolgactie is expliciet per product.

#### Validation
- [x] PDF smoke bevestigt zichtbare output van de nieuwe route.

---

### Milestone 3 - Rebuild The Dashboard From Signal Layer To Action Layer
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: campaign dashboard uitgebreid met vaste managementsessielaag en gekoppelde factor-follow-through.

#### Tasks
- [x] `RecommendationList`, dashboard decision layer en playbooks in vaste volgorde gebracht.
- [x] `RecommendationList` gekoppeld aan owner/action/review-route.
- [x] `ActionPlaybookList` laten landen als uitvoeringsverdieping van gekozen prioriteit.
- [x] Campaign page explicieter gemaakt in eerst lezen, dan kiezen, dan handelen.

#### Definition of done
- [x] Het dashboard helpt niet alleen interpreteren, maar ook structureren wat het eerste managementgebruik moet zijn.
- [x] Vragen, playbooks en next-step copy vormen één stuurverhaal.

#### Validation
- [x] Frontend dashboardtests dekken de nieuwe routevolgorde en productverschillen.

---

### Milestone 4 - Add A Client-Usable First Management Session Layer
Dependency: Milestone 2 and Milestone 3

- [x] Uitgevoerd op 2026-04-15: eerste managementsessie verankerd in dashboard, rapport, onboarding en buyer-facing parity.

#### Tasks
- [x] Klantbruikbare laag toegevoegd met eerste gesprek, deelnemers, eigenaar, eerste actie en reviewmoment.
- [x] Onboardingtaal bijgewerkt zodat eerste managementgebruik dezelfde route volgt.
- [x] Preview- en marketingcopy bijgewerkt zodat verkoop, rapport en dashboard dezelfde verwachting scheppen.

#### Definition of done
- [x] Verisight-output helpt sneller van oplevering naar eerste zinvolle managementsessie.
- [x] De laag blijft compact en productspecifiek zonder consultancy-overspraak.

#### Validation
- [x] Preview-copy, marketing copy en productpagina’s blijven parity houden met report- en dashboardtaal.

---

### Milestone 5 - QA, Acceptance And Prompt-System Closure
Dependency: Milestone 4

- [x] Uitgevoerd op 2026-04-15: tests uitgebreid, owner-document vastgelegd en checklist bijgewerkt.

#### Tasks
- [x] Backend scoring/paritytests uitgebreid op follow-through contractvelden.
- [x] Frontend dashboard-, onboarding- en previewtests uitgebreid op routeconsistentie.
- [x] PDF smoke-validatie uitgebreid zodat de nieuwe late report-secties daadwerkelijk worden meegenomen.
- [x] Relevante frontend lint- en buildvalidatie uitgevoerd op de aangepaste paden.
- [x] `REPORT_TO_ACTION_PROGRAM_PLAN.md` vastgelegd als actieve owner-document.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor `REPORT_TO_ACTION_PROGRAM_PLANMODE_PROMPT.md`.

#### Definition of done
- [x] Report-to-action is inhoudelijk, UX-matig en methodisch reviewbaar.
- [x] Prompt-systeem en checklist sluiten weer aan op de werkelijke repo-uitvoering.

#### Validation
- [x] `python -m pytest tests/test_scoring.py tests/test_reporting_system_parity.py tests/test_report_generation_smoke.py`
- [x] `npm.cmd test -- --run lib/products/exit/dashboard.test.ts lib/products/retention/dashboard.test.ts lib/client-onboarding.test.ts lib/report-preview-copy.test.ts lib/marketing-positioning.test.ts`
- [x] `npm.cmd run lint -- "lib/products/exit/dashboard.ts" "lib/products/retention/dashboard.ts" "components/dashboard/recommendation-list.tsx" "components/dashboard/action-playbook-list.tsx" "app/(dashboard)/campaigns/[id]/page.tsx" "app/producten/[slug]/page.tsx" "lib/client-onboarding.ts" "lib/report-preview-copy.ts" "lib/marketing-products.ts"`
- [x] `npm.cmd run build`

## 3. Execution Breakdown By Subsystem

### Report content and PDF flow
- [x] Productspecifieke next-step payloads uitgebreid met een vaste eerste managementsessie.
- [x] PDF-closeout uitgebreid met `Eerste managementsessie na oplevering`.
- [x] Retentie-playbooks en segment-playbooks uitgebreid met `Reviewmoment`.

### Dashboard decision and follow-through layer
- [x] Campaign dashboard uitgebreid met productspecifieke follow-through cards.
- [x] `RecommendationList` en `ActionPlaybookList` gekoppeld aan dezelfde owner/action/review-route.
- [x] Geen nieuw task-management systeem toegevoegd; bestaande decision-supportlaag is aangescherpt.

### Product language and parity
- [x] `eerste managementsessie` en `reviewmoment` verankerd in preview, productcopy en onboarding.
- [x] ExitScan primair gehouden als vertrekduiding en verbeterroute.
- [x] RetentieScan verification-first gehouden als verificatie- en behoudsopvolging.

### Tests and acceptance
- [x] Contracttests toegevoegd op session payloads en routevolgorde.
- [x] PDF smoke uitgebreid tot 20 pagina’s extractie zodat late closeout-secties worden gedekt.
- [x] Frontend tests uitgebreid op managementsessielaag en reviewmoment.
- [x] Gerichte lint- en buildvalidatie toegevoegd op de aangepaste frontendlaag.

### Prompt-system closure
- [x] Deze file toegevoegd als actieve owner-document.
- [x] Prompt-checklist bijgewerkt naar `Voldaan`.

## 4. Current Product Risks

- [x] Grootste resterende risico blijft dat Verisight wel de eerste managementsessie stuurt, maar nog geen echte action-tracking of closurelaag heeft.
- [x] Er blijft een claimsrisico als toekomstige copy verder opschuift naar advies zonder verificatie- en methodische grens.
- [x] ExitScan en RetentieScan zijn nu consistenter in follow-through; toekomstige wijzigingen moeten dat productverschil blijven beschermen.

## 5. Open Questions

- [ ] Willen we later bovenop deze tranche ook een echte action-tracking of statuslaag bouwen?
- [ ] Willen we later een één-pagina managementmemo of workshop-sheet als afgeleide export toevoegen?
- [ ] Willen we pilotdata later gebruiken om eigenaar- en actieroutes productspecifiek te ijken op werkelijk managementgedrag?

## 6. Follow-up Ideas

- [ ] Gebruik deze contractlaag als basis voor pilot- en early-customer-learning.
- [ ] Trek dezelfde route later door in onboarding- en delivery-assets buiten het product zelf.
- [ ] Overweeg later een compacte actie-echo in vervolgmetingen: wat is gekozen, wat is uitgevoerd, wat keert terug?

## 7. Out of Scope For Now

- [x] Geen nieuw scoringmodel of surveyherontwerp.
- [x] Geen CRM, ticketing of taakworkflow-systeem.
- [x] Geen aparte HR-view versus directie-view.
- [x] Geen implementation-readiness of brede onboarding-herbouw binnen deze tranche.
- [x] Geen automatische opvolgreminders of workflow-automation als kern van deze ronde.

## 8. Defaults Chosen

- [x] `docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md` is het actieve owner-document voor dit traject.
- [x] Bestaand `MANAGEMENT_ACTIONABILITY`-werk bleef basis; deze tranche bouwt daarop voort.
- [x] ExitScan blijft het primaire product en kreeg de scherpste route van rapport naar managementactie.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Rapport en dashboard gebruiken nu dezelfde minimale route:
  - prioriteit
  - gesprek
  - eigenaar
  - eerste actie
  - reviewmoment
