# MANAGEMENT_ACTIONABILITY_PLAN.md

## 1. Summary

Dit traject scherpt de **management-actionability van Verisight** aan op basis van de actuele repo-implementatie in dashboard, rapport, focusvragen, playbooks, hypotheses en parity-tests.

De uitgevoerde richting in deze tranche is:

- ExitScan explicieter maken als primair managementinstrument voor vertrekduiding, keuze en eerste eigenaarschap
- RetentieScan compacter en hiërarchischer maken van vroegsignaal naar besluit, eigenaar en 30-90 dagenactie
- dashboard en rapport laten openen met dezelfde actionability-contracten:
  - eerste managementvraag
  - eerste besluit
  - eerste eigenaar
  - eerste logische stap
- focusvragen en playbooks minder laten eindigen op analyse alleen, en sterker laten sturen op verificatie, keuze en opvolging
- regressiebescherming toevoegen op actionability-taal en parity

Belangrijkste repo-observaties waarop deze uitvoering is gebaseerd:

- de dashboard decision-supportlaag was al sterk verbeterd, maar ExitScan had nog geen expliciete playbook- of owner-routing in het dashboard
- RetentieScan had rijkere actionability-lagen, maar die konden nog compacter en duidelijker worden geordend rond keuze en eigenaarschap
- de reportlaag bevatte al hypotheses met eigenaar en actie, maar de executive managementsamenvatting benoemde die route nog niet expliciet genoeg
- actionability-termen zaten verspreid over frontend builders, playbooks, focusvragen en backend report-content

Status 2026-04-14:

- Uitgevoerd in deze ronde:
  - gedeeld actionability-contract aangescherpt in dashboard- en playbook-types
  - ExitScan-dashboard uitgebreid met besluit- en eigenaarschapsrouting plus lichte action playbooks
  - RetentieScan-dashboard aangescherpt rond groepsbeeld, eerste besluit, eerste eigenaar en eerste actie
  - focusvragen voor ExitScan en RetentieScan herschreven naar validatie-, besluit- en opvolgvragen
  - retention en segment playbooks uitgebreid met expliciet `decision` en `owner`
  - report management summaries uitgebreid met `Eerste besluit` en `Eerste eigenaar`
  - report next-steps voor beide producten herschikt naar keuze -> eigenaar -> actie -> evaluatie
  - parity- en scoringtests uitgebreid en groen herbevestigd
  - frontend build en lint groen herbevestigd
- Bewust niet uitgevoerd in deze ronde:
  - geen scoring-herontwerp
  - geen nieuwe survey-items
  - geen aparte HR-vs-directie view
  - geen los `REPORT_TO_ACTION` vervolgprogramma

## 2. Milestones

### Milestone 0 - Freeze Current Actionability Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-14: huidige actionability-gap vastgelegd via dashboard-, report- en prompt-system context.

#### Tasks
- [x] Huidige actionability-pad voor beide producten gereconstrueerd over dashboard en rapport.
- [x] Vastgelegd waar ExitScan zwakker was dan RetentieScan in concrete vervolgactie.
- [x] Shared versus productspecifieke actionability-ownership in kaart gebracht.

#### Definition of done
- [x] Er lag een repo-gebaseerd baselinebeeld van de huidige management-actionability.
- [x] De belangrijkste brug van inzicht naar keuze, eigenaar en actie was per product zichtbaar.

#### Validation
- [x] Observaties waren herleidbaar naar dashboard-, report- en checklistbestanden.

---

### Milestone 1 - Define The Management-Actionability Contract
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-14: dashboard- en playbook-contracten uitgebreid met expliciet besluit en eigenaar.

#### Tasks
- [x] Minimale beslisroute gestandaardiseerd op:
  - wat zie je nu
  - welk besluit hoort eerst
  - wie is eerste eigenaar
  - wat is de eerste logische stap
- [x] Contract verankerd in frontend action playbooks en backend report payloads.
- [x] Guardrails behouden: verificatiegericht, geen causaliteits- of voorspellingstaal.

#### Definition of done
- [x] Er is een duidelijke actionability-structuur voor dashboard en rapport.
- [x] Het contract dwingt besluittaal, eigenaar en eerste stap af zonder overclaiming.

#### Validation
- [x] Contract sluit aan op bestaande methodologische guardrails en productverschillen.

---

### Milestone 2 - Rebuild ExitScan Around Management Choice And Ownership
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: ExitScan kreeg expliciete besluit- en owner-routing in dashboard, focuslaag en report executive layer.

#### Tasks
- [x] ExitScan-dashboardtaal aangescherpt naar keuze, eigenaar en eerste actie.
- [x] Nieuwe lichte ExitScan action playbooks toegevoegd.
- [x] ExitScan-focusvragen herschreven naar validatie- en besluitvragen.
- [x] ExitScan-report management summary uitgebreid met `Eerste besluit` en `Eerste eigenaar`.
- [x] ExitScan-next-steps herschikt naar keuze -> eigenaar -> actie -> evaluatie.

#### Definition of done
- [x] ExitScan helpt management explicieter kiezen wat nu eerst moet gebeuren.
- [x] ExitScan-output bevat een zichtbare brug naar eigenaar en eerste actie.
- [x] Dashboard en rapport vertellen voor ExitScan dezelfde beslisroute.

#### Validation
- [x] Tests bevestigen aangescherpte top-summary, next-step en report payload-contracten.

---

### Milestone 3 - Tighten RetentieScan From Rich Guidance To Decision-Grade Actionability
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-14: RetentieScan werd compacter geordend rond groepsbeeld, eerste besluit, eerste eigenaar en eerste actie.

#### Tasks
- [x] RetentieScan-dashboard herordend rond keuze en eigenaar.
- [x] RetentieScan-playbooks uitgebreid met `decision` en `owner`.
- [x] Segment-playbooks en renderers aangepast aan hetzelfde contract.
- [x] RetentieScan-focusvragen herschreven naar validatie- en opvolgvragen.
- [x] RetentieScan-report management summary en next-steps aangescherpt op dezelfde lijn.

#### Definition of done
- [x] RetentieScan blijft rijk, maar voelt bestuurlijk strakker en minder diffuus.
- [x] De top-laag dwingt prioritering in plaats van alleen veel mogelijke vervolgstappen.
- [x] Eigenaarschap en eerstvolgende stap zijn explicieter zichtbaar.

#### Validation
- [x] Dashboardtests, paritytests en build bevestigen de nieuwe route.

---

### Milestone 4 - Align Dashboard And Report Into One Steering Story
Dependency: Milestone 2 and Milestone 3

- [x] Uitgevoerd op 2026-04-14: dashboard en report payloads delen nu explicieter dezelfde actionability-termen.

#### Tasks
- [x] Per product parity aangebracht op eerste besluit, eerste eigenaar en eerste logische stap.
- [x] Report playbook rendering uitgebreid met besluit- en owner-regels.
- [x] Dashboard action playbooks en report next-steps op dezelfde volgorde gebracht.

#### Definition of done
- [x] Dashboard en rapport suggereren niet langer twee verschillende managementroutes.
- [x] Het stuurverhaal is per product herkenbaar over beide lagen heen.

#### Validation
- [x] Backend paritytests dekken executive contractvelden en actionability-termen.

---

### Milestone 5 - Make Decision Language Audience-Aware
Dependency: Milestone 4

- [x] Deels uitgevoerd op 2026-04-14: de taal is concreter gemaakt voor HR, MT en directie via expliciete besluit- en eigenaarschapsframing.

#### Tasks
- [x] Besluittaal per product aangescherpt in dashboard en report executive layer.
- [x] Te generieke managementtaal teruggedrongen in focusvragen en playbooks.
- [x] ExitScan en RetentieScan beter naar decision-read getrokken zonder boardroom-overclaiming.

#### Definition of done
- [x] De top-laag helpt HR sneller intern doorvertalen en helpt MT/directie sneller kiezen.
- [x] Besluittaal is scherper zonder overclaiming.

#### Validation
- [x] Frontend dashboardtests en backend reporttests borgen de nieuwe taalcontracten.

---

### Milestone 6 - QA, Acceptance And Prompt-System Closure
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-14: tests, lint en build zijn groen; planbestand en checklist zijn bijgewerkt.

#### Tasks
- [x] Frontend dashboardtests uitgebreid op actionability-contracten.
- [x] Backend parity- en report-content-tests uitgebreid op `Eerste besluit` en `Eerste eigenaar`.
- [x] Frontend build en lint succesvol gedraaid.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor deze prompt.

#### Definition of done
- [x] De aangescherpte actionability-laag is testbaar en reviewbaar.
- [x] Regressies in besluittaal, eigenaar-routing en parity kunnen minder makkelijk ongemerkt doorslippen.

#### Validation
- [x] `pytest tests/test_scoring.py tests/test_reporting_system_parity.py`
- [x] `npm.cmd test -- --run lib/products/exit/dashboard.test.ts lib/products/retention/dashboard.test.ts`
- [x] `npm.cmd run build`
- [x] `npm.cmd run lint`

## 3. Execution Breakdown By Subsystem

### Dashboard decision layer
- [x] ExitScan kreeg expliciete besluit- en eigenaarschapsrouting.
- [x] RetentieScan kreeg compactere top-laag rond groepsbeeld, besluit en eigenaar.
- [x] Action playbooks worden nu op beide producten gebruikt in de focuslaag.

### Focus questions and action layers
- [x] Focusvragen herschreven naar validatie-, besluit- en opvolgvragen.
- [x] Playbooks uitgebreid met `decision` en `owner`.
- [x] Segment-playbooks meegenomen in hetzelfde contract.

### Report actionability layer
- [x] Managementsamenvattingen uitgebreid met `Eerste besluit` en `Eerste eigenaar`.
- [x] Next-step payloads herschikt naar keuze -> eigenaar -> actie -> evaluatie.
- [x] Report playbook-rendering toont nu ook besluit en eigenaar.

### Parity and product language
- [x] ExitScan en RetentieScan gebruiken nu explicieter dezelfde actionability-structuur over dashboard en rapport.
- [x] Productverschil blijft intact: ExitScan vertrekduiding-primair, RetentieScan vroegsignaal-primair.

### Tests and acceptance
- [x] Frontend dashboardtests aangepast.
- [x] Backend scoring- en paritytests aangepast.
- [x] Build en lint herbevestigd.

### Prompt-system closure
- [x] `MANAGEMENT_ACTIONABILITY_PLAN.md` toegevoegd onder `docs/active` als source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor deze prompt.
- [x] `REPORT_TO_ACTION` bewust niet meegenomen in deze tranche.

## 4. Current Product Risks

- [x] Risico op analysekracht zonder actiekracht is verkleind, maar blijft aandacht vragen in toekomstige echte klantfeedback.
- [x] Risico op te abstracte managementtaal is teruggedrongen via expliciet besluit en eerste eigenaar.
- [x] Risico op inconsistentie tussen rapport en dashboard is verkleind via parity-contracten en tests.
- [x] Risico op te veel consultancy-framing is beperkt door compactere top-lagen en explicietere productroutes.
- [x] Risico op schijnzekerheid blijft bewaakt via bestaande non-causal en non-predictive copytests.

## 5. Open Questions

- [ ] Willen we later een aparte HR-vs-directie weergave bovenop deze gezamenlijke actionability-laag?
- [ ] Willen we later een compacte one-page management route of executive handoff als afgeleide export?
- [ ] Willen we later echte usage-feedback uit pilots gebruiken om besluit- en owner-routing verder te ijken?

## 6. Follow-up Ideas

- [ ] Bouw later een expliciete one-page management route op basis van deze contracten.
- [ ] Gebruik pilotdata om te ijken welke owner- en action-routes het meeste managementgedrag opleveren.
- [ ] Laat `REPORT_TO_ACTION` pas aansluiten nadat deze bredere actionability-laag zich in gebruik heeft bewezen.

## 7. Out of Scope For Now

- [x] Geen scoring-herontwerp.
- [x] Geen nieuwe survey-items of productmodules.
- [x] Geen aparte HR-vs-directie UI-variant.
- [x] Geen volledige boardroom-redesign.
- [x] Geen los `REPORT_TO_ACTION` vervolgprogramma in deze tranche.

## 8. Defaults Chosen

- [x] ExitScan blijft het primaire product en krijgt de scherpste management-choice laag.
- [x] RetentieScan blijft complementair en vroegsignaalgericht, maar moet expliciet kiezen en beleggen.
- [x] Dashboard en rapport moeten samen een stuurverhaal vertellen.
- [x] Actionability moet expliciet helpen kiezen wat nu eerst besproken wordt, welk besluit logisch is, wie eerste eigenaar is en wat de eerste 30-90 dagenactie is.
- [x] Claims blijven commercieel scherp, maar mogen niet methodisch onwaar worden.
- [x] Verificatie blijft voor actie staan; actie mag niet als hard bewijs of diagnose worden geframed.
