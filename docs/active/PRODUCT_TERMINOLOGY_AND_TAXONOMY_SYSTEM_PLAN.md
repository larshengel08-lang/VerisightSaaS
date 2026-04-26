# PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand documenteert de terminologie-tranche; actuele taal- en routewaarheid wint in de huidige canon- en paritydocs.

Historical boundary note:

- dit plan beschrijft de tranche-uitrol van terminologieharmonisatie, maar is niet de hoogste actieve bron voor commerciële first-buy of routehiërarchie
- actuele producttaal wint nu in [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md), [COMMERCIAL_LANGUAGE_PARITY_RECHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_LANGUAGE_PARITY_RECHECK.md) en [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- oudere glossary- en checklistdocs blijven bruikbaar, maar alleen ondergeschikt aan die actieve canon

## 1. Summary

Dit traject heeft de productterminologie en taxonomie van Verisight aangescherpt over reference docs, marketingcopy, preview, dashboard, report-content, surveycopy en paritytests.

Uitgevoerde richting in deze tranche:

- ExitScan verder vastgezet als primaire entreepropositie voor vertrekduiding.
- RetentieScan verder vastgezet als complementair product voor vroegsignalering op behoud, met `retentiesignaal` als vaste hoofdmetric en `behoud` als managementcontext.
- `managementsamenvatting` en `bestuurlijke handoff` vastgehouden als gedeelde outputtermen over site, dashboard, rapport en preview.
- Drift rond `werksignalen`, `behoudssignalen` en `retentiesignalen` teruggedrongen via een canonieke woordenlijst en bijbehorende copy- en testaanpassingen.
- Een blijvende reviewlaag toegevoegd zodat toekomstige sales-, pricing- en websitewijzigingen dezelfde terminologieregels volgen.

Belangrijkste opleveringen:

- [x] `docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md` toegevoegd als canonieke woordenlijst
- [x] `docs/reference/PRODUCT_TERMINOLOGY_REVIEW_CHECKLIST.md` toegevoegd als handmatige reviewbasis
- [x] buyer-facing product-, pricing-, preview- en salescopy geharmoniseerd op dezelfde producthiërarchie
- [x] frontend- en backend-productdefinities aangescherpt op canonieke score- en signaaltaal
- [x] report- en dashboardcopy aangescherpt op canonieke terminologie
- [x] paritytests uitgebreid op terminologiedrift en productonderscheid

Status 2026-04-15:

- Uitgevoerd in deze ronde:
  - canonieke terminologiebron toegevoegd aan de repo-reference laag
  - ExitScan-copy aangescherpt van generiek `werksignalen` naar preciezere taal rond `signalen van werkfrictie`
  - RetentieScan-copy aangescherpt op `retentiesignaal` als hoofdmetric en `behoud` als managementcontext
  - preview-, pricing-, privacy- en saleslagen gelijkgetrokken op dezelfde woordenlijst
  - reporting parity en retention copy parity uitgebreid met terminologiechecks
- Bewust niet uitgevoerd in deze ronde:
  - geen scoring-herontwerp
  - geen nieuwe survey-items
  - geen pricing-herbouw buiten terminologiepariteit
  - geen grote website-redesign
  - geen nieuwe productfamilies
- Validatie uitgevoerd in deze ronde:
  - `vitest` op positioning-, preview- en dashboardparitytests
  - `pytest` op reporting parity, retention copy parity en scoring/report terminology checks
  - `eslint` op de frontend
- `next build` op de frontend
  - terminologiedrift-check via repo-brede grep op oude live termvormen

## 2. Milestones

### Milestone 0 - Freeze The Current Terminology Baseline
Dependency: none

- [x] Uitgevoerd op 2026-04-15: repo-brede terminologiedrift vastgelegd over website, dashboard, rapport, preview, survey, pricing, sales en externe alignment.

#### Tasks
- [x] Drift-hotspots gereconstrueerd rond `vertrekduiding`, `frictiescore`, `werksignalen`, `retentiesignaal`, `behoudssignalen`, `vroegsignalering`, `stay-intent`, `vertrekintentie`, `managementsamenvatting` en `bestuurlijke handoff`.
- [x] Vastgesteld waar producttaal al sterk aligned was en waar semantische overlap bleef bestaan.
- [x] Buyer-facing versus intern-technische termen onderscheiden.

#### Definition of done
- [x] Er lag een controleerbaar repo-startbeeld van terminologiedrift.
- [x] Het verschil tussen betekenisconflict en stilistische variatie was voldoende scherp om door te voeren.

#### Validation
- [x] Observaties kwamen uit `docs/strategy`, `docs/reference`, `docs/active`, `frontend/lib`, `frontend/components`, `frontend/app/producten/[slug]/page.tsx`, `backend/products/*`, `backend/report.py`, `backend/scoring.py` en `Docs_External/ALIGNMENT_AND_GOVERNANCE.md`.

### Milestone 1 - Define The Canonical Verisight Terminology System
Dependency: Milestone 0

- [x] Uitgevoerd op 2026-04-15: een vaste terminologiehierarchie en reviewchecklist ingevoerd.

#### Tasks
- [x] Canonieke woordenlijst vastgelegd voor portfolio-, route-, score-, signaal-, output- en trusttermen.
- [x] Per product vastgelegd welke termen primair, ondersteunend of te vermijden buyer-facing zijn.
- [x] Vastgelegd dat `retentie` de product- en systeemterm blijft en `behoud` de managementcontext.
- [x] Vastgelegd dat `Combinatie` een portfolioroute blijft.

#### Definition of done
- [x] De repo heeft nu een centrale terminologiebron.
- [x] Implementers, copywriters en reviewers hebben een gedeeld uitgangspunt voor woordkeuze.

#### Validation
- [x] De woordenlijst sluit aan op `STRATEGY.md`, `METHODOLOGY.md`, `TRUST_AND_CLAIMS_MATRIX.md`, `BOARDROOM_READINESS_PLAN.md` en `FOUNDER_LED_SALES_NARRATIVE_PLAN.md`.

### Milestone 2 - Canonicalize Product-Level Score And Signal Language
Dependency: Milestone 1

- [x] Uitgevoerd op 2026-04-15: productdefinities en report-content aangescherpt op canonieke score- en signaaltaal.

#### Tasks
- [x] ExitScan aangescherpt op `frictiescore`, `vertrekduiding` en `signalen van werkfrictie`.
- [x] RetentieScan aangescherpt op `retentiesignaal` plus aanvullende signalen rond behoud.
- [x] Verwarrende labels rond aanvullende signalen verduidelijkt.
- [x] Dashboard- en reporttaal gelijkgetrokken op dezelfde begrippen.

#### Definition of done
- [x] Elk product heeft een scherper begrippenkader zonder onnodige overlap.
- [x] Score- en signaaltermen zijn preciezer van elkaar gescheiden.

#### Validation
- [x] `frontend/lib/products/*/definition.ts`, `backend/products/*/definition.py`, `backend/products/*/report_content.py` en `backend/report.py` volgen nu dezelfde termen.

### Milestone 3 - Align Portfolio, Marketing, Pricing And Sales Language
Dependency: Milestone 1 and Milestone 2

- [x] Uitgevoerd op 2026-04-15: marketing-, pricing- en salescopy geharmoniseerd op dezelfde portfoliotaal.

#### Tasks
- [x] Productmetadata, site-content, productpagina's, homepage en tarieven aangescherpt op dezelfde routehierarchie.
- [x] Founder-led sales playbook gekoppeld aan de canonieke woordenlijst.
- [x] Combinatie als portfolioroute bevestigd in buyer-facing copy.
- [x] Packagingtaal rond Baseline, ritme en add-ons terminologisch gelijkgetrokken.

#### Definition of done
- [x] Site, pricing, preview en sales vertellen hetzelfde kernverhaal.
- [x] Productverwarring tussen ExitScan, RetentieScan en Combinatie is teruggedrongen.

#### Validation
- [x] `frontend/lib/marketing-products.ts`, `frontend/components/marketing/site-content.ts`, `frontend/app/page.tsx`, `frontend/app/producten/[slug]/page.tsx`, `frontend/app/tarieven/page.tsx` en `docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md` spreken elkaar niet meer tegen op kerntermen.

### Milestone 4 - Align Dashboard, Report, Survey And Preview Contracts
Dependency: Milestone 2 and Milestone 3

- [x] Uitgevoerd op 2026-04-15: preview-, dashboard-, report- en surveycopy aangescherpt op dezelfde productspecifieke taal.

#### Tasks
- [x] Report preview copy en dashboardviewmodels gealigneerd op canonieke metric- en routebenamingen.
- [x] Survey- en invitecopy voor RetentieScan verduidelijkt op productnaam versus managementcontext.
- [x] Report-content en generic reportcopy opgeschoond waar oude termen terugkwamen.
- [x] Privacycopy aangescherpt op dezelfde retentie-/behoudslogica.

#### Definition of done
- [x] Survey, dashboard, report en preview gebruiken hetzelfde begrippenkader.
- [x] Interne technische termen lekken minder snel door naar buyer-facing taal.

#### Validation
- [x] `frontend/lib/scan-definitions.ts`, `frontend/lib/report-preview-copy.ts`, `frontend/lib/products/retention/dashboard.ts`, `backend/report.py` en `backend/products/*/report_content.py` zijn inhoudelijk in lijn gebracht.

### Milestone 5 - Introduce A Durable Glossary And Terminology Governance Layer
Dependency: Milestone 1, Milestone 3 and Milestone 4

- [x] Uitgevoerd op 2026-04-15: een duurzame glossary- en reviewlaag toegevoegd.

#### Tasks
- [x] Reference-glossary toegevoegd als blijvende terminologiebron.
- [x] Reviewchecklist toegevoegd als handmatige guardrail.
- [x] Externe alignmentdoc gekoppeld aan de nieuwe terminologiebron.

#### Definition of done
- [x] Er is nu een duurzame governance-laag voor producttaal.
- [x] Repo-truth en externe alignment zijn explicieter aan elkaar gekoppeld.

#### Validation
- [x] Een reviewer kan vanuit de nieuwe docs afleiden welke termen buyer-facing leidend of te vermijden zijn.

### Milestone 6 - Add QA Guardrails And Close The Prompt Trajectory
Dependency: Milestone 5

- [x] Uitgevoerd op 2026-04-15: frontend- en backend-tests uitgebreid en prompt-checklist bijgewerkt.

#### Tasks
- [x] Frontend positioning- en previewtests uitgebreid op terminologiecontracten.
- [x] Backend paritytests uitgebreid op report-, retention- en glossaryalignment.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt voor dit traject.

#### Definition of done
- [x] Terminologiedrift is beter regressiebeschermd.
- [x] Het promptsysteem weerspiegelt de repo-status van dit traject.

#### Validation
- [x] Relevante frontend- en backend-tests zijn lokaal groen bevestigd.
- [x] Frontend `lint` is lokaal groen bevestigd.
- [x] Frontend `build` is lokaal groen bevestigd.
- [x] Repo-brede terminology drift check op oude live termvormen is groen bevestigd.

## 3. Execution Breakdown By Subsystem

### Reference, strategy and governance
- [x] Canonieke woordenlijst toegevoegd in `docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md`.
- [x] Handmatige reviewchecklist toegevoegd in `docs/reference/PRODUCT_TERMINOLOGY_REVIEW_CHECKLIST.md`.
- [x] Externe alignmentlaag gekoppeld aan dezelfde terminologiebron.

### Portfolio, marketing and sales
- [x] ExitScan bevestigd als primaire wedge in buyer-facing routes.
- [x] RetentieScan bevestigd als complementair product met `retentiesignaal` als hoofdmetric en `behoud` als managementcontext.
- [x] Combinatie bevestigd als portfolioroute.
- [x] Marketing-, pricing- en salescopy gelijkgetrokken op dezelfde kerntermen.

### Product contracts, dashboard and reports
- [x] Frontend- en backend-productdefinities aangescherpt op canonieke score- en signaaltaal.
- [x] `managementsamenvatting` en `bestuurlijke handoff` behouden als vaste cross-product outputtermen.
- [x] Report- en dashboardcopy aangescherpt waar oude termen terugkwamen.

### Survey, invite and privacy language
- [x] Survey- en invitecopy verduidelijkt op productspecifieke taal.
- [x] Privacycopy beter gekoppeld aan de canonieke retentie-/behoudslogica.

### QA and parity
- [x] Frontend- en backend-paritytests uitgebreid op terminologiedrift.
- [x] Frontend `lint` en `build` uitgevoerd als aanvullende release-validatie.
- [x] Repo-brede grep-check uitgevoerd op oude live termvormen.
- [x] Prompt-checklist bijgewerkt als administratieve afsluiting.

## 4. Current Product Risks

- [x] Risico op terminologiedrift is verkleind, maar blijft gevoelig zodra nieuwe website-, pricing- of sample-outputtranches eigen synoniemen introduceren.
- [x] Risico op mismatch tussen marketing en product is verkleind door de centrale glossary en paritytests.
- [x] Risico op productverwarring tussen ExitScan en RetentieScan is verkleind door strakkere route-, metric- en contexttaal.
- [x] Risico op te harde of te onduidelijke scoretaal is verkleind door `frictiescore` en `retentiesignaal` scherper af te bakenen.
- [x] Risico dat externe docs oude taal blijven aanjagen is verkleind door expliciete koppeling aan repo-truth.

## 5. Open Questions

- [ ] Willen we later een publieke woordenlijst of buyer-facing uitlegpagina over producttaal tonen?
- [ ] Willen we na eerste echte klantgesprekken de woordenlijst herijken op buyer-reacties rond `retentie`, `behoud` en `bestuurlijke handoff`?
- [ ] Willen we toekomstige coming-soon producten pas publiek tonen als hun terminologiecontract klaar is?

## 6. Follow-up Ideas

- [ ] Gebruik deze glossary direct als randvoorwaarde voor `SALES_ENABLEMENT_SYSTEM_PLAN.md`.
- [ ] Gebruik dezelfde terminologiebron voor `PRICING_AND_PACKAGING_PROGRAM_PLAN.md`.
- [ ] Gebruik de woordenlijst als norm voor `SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md`.
- [ ] Gebruik de taxonomy later als input voor `PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md`.

## 7. Out of Scope For Now

- [x] Geen scoring-herontwerp.
- [x] Geen nieuwe survey-items.
- [x] Geen grote website-redesign.
- [x] Geen nieuwe productfamilies.
- [x] Geen verandering aan trust- of claimsgrenzen buiten terminologieharmonisatie.

## 8. Defaults Chosen

- [x] ExitScan blijft de primaire entreepropositie.
- [x] RetentieScan blijft complementair.
- [x] `Combinatie` blijft een portfolioroute.
- [x] `managementsamenvatting` en `bestuurlijke handoff` blijven vaste outputtermen.
- [x] `retentie` blijft product- en systeemtaal; `behoud` blijft domein- en managementtaal daaromheen.
- [x] `frictiescore` blijft de primaire ExitScan-metric.
- [x] `retentiesignaal` blijft de primaire RetentieScan-metric.
