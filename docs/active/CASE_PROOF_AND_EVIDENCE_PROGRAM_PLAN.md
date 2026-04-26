# CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md

Status: uitgevoerd in repo
Last updated: 2026-04-15
Source of truth: dit bestand is leidend voor deze tranche.

Historical boundary note:

- dit plan blijft leidend voor de bewijsarchitectuur binnen deze tranche, maar niet voor de huidige first-buy hiërarchie of publieke routepromotie
- lees oudere formuleringen zoals `ExitScan` primair / `RetentieScan` complementair ondergeschikt aan [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md), [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md) en [COMMERCIAL_AND_ONBOARDING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md)
- actuele bewijs- en claimtoepassing wint in [CASE_PROOF_AND_EVIDENCE_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md), [SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md) en [TRUST_AND_CLAIMS_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/TRUST_AND_CLAIMS_MATRIX.md)

## 1. Summary

Deze tranche maakt van case-proof en evidence bij Verisight een expliciet systeem bovenop de bestaande sample-output-, pilot-learning-, trust- en saleslagen.

De repo had al sterke deliverable-proof en trustproof, maar nog geen vaste case-proofarchitectuur. Daarom is in deze tranche niet geprobeerd om fictieve of premature klantclaims buyer-facing te maken. In plaats daarvan is de repo uitgerust met:

- een canonieke evidence-taxonomie
- een approval- en surface-model
- case-readiness capture in de learninglaag
- vaste playbooks en templates voor case-opbouw
- expliciete scheiding tussen sample-output en klantbewijs
- regressietests en acceptancechecks voor de nieuwe bewijslaag

Bewuste defaults:

- [x] ExitScan blijft de primaire case- en bewijsroute.
- [x] RetentieScan blijft complementair en verification-first.
- [x] Sample-output blijft deliverable-proof en trustproof, niet case-proof.
- [x] Synthetische, dummy- en showcase-data tellen nooit als market evidence.
- [x] Internal-only lessons en dossierdata worden pas buyer-facing na expliciete bewijs- en claimreview.
- [x] De eerste publieke prooflaag groeit gefaseerd: anonieme of minimaal herleidbare casevormen eerst.
- [x] Dit planbestand is de source of truth; `PROMPT_CHECKLIST.xlsx` is administratief bijgewerkt.

## 1A. Repo Implementation Status

Uitgevoerd in deze tranche:

- [x] Referentiedoc toegevoegd voor de canonieke evidence-taxonomie in `docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md`.
- [x] Acceptance checklist toegevoegd in `docs/reference/CASE_PROOF_AND_EVIDENCE_ACCEPTANCE_CHECKLIST.md`.
- [x] Shared evidence-contracten toegevoegd in `frontend/lib/case-proof-evidence.ts`.
- [x] Buyer-facing sample-assets gekoppeld aan expliciete evidence-tiers via `frontend/lib/sample-showcase-assets.ts`.
- [x] Marketing sample cards tonen nu evidence-tier en intended buyer use zonder sample-output als case-proof te framen.
- [x] Pilot-learningcontracten uitgebreid met case-readiness capture, approvalstatus, toestemmingstatus, outcome-klassen en closure-status.
- [x] Admin API-routes, ORM en Supabase-schema aligned op de nieuwe case-capture velden.
- [x] Learning workbench uitgebreid zodat case-candidates en outcome capture vanuit echte dossiers beheerd kunnen worden.
- [x] Ops-playbooks en templates toegevoegd voor case-capture en approval.
- [x] Sales- en sample-output-documentatie aligned op de nieuwe evidence-taxonomie.
- [x] Tests toegevoegd en bijgewerkt voor evidence-contracten, docs en persistence.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.

Bewust niet uitgevoerd in deze tranche:

- [ ] Geen verzonnen testimonials, klantlogo's of ROI-verhalen.
- [ ] Geen buyer-facing approved cases zonder echte klantbasis.
- [ ] Geen named references op de website.
- [ ] Geen brede website-herbouw buiten evidence labeling en guardrails.

## 2. Milestones

### Milestone 0 - Freeze The Current Proof Baseline
Dependency: none

- [x] De repo-baseline vastgelegd over sample-output, trustproof, validation evidence, pilot-learning en sales proof-use.
- [x] Expliciet gemaakt wat nu wel buyer-facing proof is en wat niet.
- [x] Bevestigd dat case-proof het leidende traject is boven de voorbereidende sample-, sales- en learningtranches.

### Milestone 1 - Define The Canonical Evidence Architecture
Dependency: Milestone 0

- [x] Canonieke evidence-taxonomie toegevoegd met `deliverable_proof`, `trust_proof`, `validation_evidence`, `case_candidate`, `approved_case_proof` en `reference_ready`.
- [x] Per tier intended use, claim boundary, approval rule en verboden gebruik vastgelegd in docs en code.
- [x] Evidence-matrix voor site, sales, demo, pricing, trust en follow-up vastgelegd.

### Milestone 2 - Build The Internal Case Candidate And Outcome Capture Layer
Dependency: Milestone 1

- [x] Bestaande learningdossiers uitgebreid met case-readiness velden voor quote-potentie, referentiepotentie, outcome-kwaliteit, toestemming, approvalstatus, claimbare observaties en supporting artifacts.
- [x] Lifecyclecapture expliciet gemaakt voor koopreden, eerste managementwaarde, eerste actie, reviewmoment en vervolguitkomst.
- [x] Outcome-klassen toegevoegd voor kwalitatieve les, operationele uitkomst, managementadoptie, herhaalgebruik en kwantitatieve uitkomst.

### Milestone 3 - Define Reusable Proof Formats And Approval Rules
Dependency: Milestone 2

- [x] Vaste formats vastgelegd voor mini-case, anonieme case, quote card, reference note, outcome summary en objection-proof snippet.
- [x] Approvalflow `draft -> internal_review -> claim_check -> customer_permission -> approved` vastgelegd.
- [x] Playbooks en templates toegevoegd zodat future case-proof niet ad hoc ontstaat.

### Milestone 4 - Map Evidence To Buyer Journeys And Public/Internal Surfaces
Dependency: Milestone 3

- [x] Site, pricing, trust en sales aligned op de nieuwe evidence-tier taal.
- [x] Buyer-facing surfaces bewust sample-first gehouden totdat approved case-proof bestaat.
- [x] ExitScan vastgehouden als eerste case-anchor en RetentieScan als complementaire route.

### Milestone 5 - Governance, Acceptance And Prompt-System Closure
Dependency: Milestone 4

- [x] Acceptancecriteria, playbooks en tests toegevoegd voor bewijsstatus, verboden claims en tier-mismatch.
- [x] Actieve planfile toegevoegd als source of truth.
- [x] `PROMPT_CHECKLIST.xlsx` bijgewerkt.

## 3. Execution Breakdown By Subsystem

### Evidence model and interfaces

- [x] `frontend/lib/case-proof-evidence.ts` toegevoegd als gedeeld evidence-contract.
- [x] Sample showcase registry voorzien van expliciete evidence-tier en buyer-use contracten.
- [x] Publieke proof-contracten gescheiden gehouden van internal case capture.

### Learning, ops and delivery capture

- [x] `frontend/lib/pilot-learning.ts`, `backend/models.py` en `supabase/schema.sql` uitgebreid voor case-readiness.
- [x] Admin routes voor dossierupdates aligned op de nieuwe capturevelden.
- [x] Learning workbench uitgebreid voor closure-status, permission, approval, outcome-klassen en supporting artifacts.

### Buyer-facing proof surfaces

- [x] Buyer-facing sample cards en sample asset registry maken nu expliciet dat sample-output deliverable-proof is.
- [x] Site, trust en pricing blijven sample-first totdat approved case-proof bestaat.
- [x] Geen nieuwe buyer-facing caseblokken toegevoegd zonder echte approved basis.

### Sales and objection handling

- [x] Sales enablement docs aligned op de evidence-taxonomie.
- [x] Nieuwe case-proof docs en acceptancechecklist opgenomen in de sales guardrails.
- [x] Reference-ready gebruik beperkt tot expliciete, warme salescontext.

### Tests and acceptance

- [x] Frontend tests toegevoegd voor evidence-contracten en showcase-tiering.
- [x] Backend persistence-tests uitgebreid voor case-readiness velden.
- [x] Doc-tests toegevoegd voor de nieuwe evidence-laag.

## 4. Validation Run

Uitgevoerd in deze tranche:

- [x] `python -m pytest tests/test_pilot_learning_system.py tests/test_case_proof_and_evidence_system.py tests/test_sales_enablement_system.py`
- [x] `npm.cmd test -- --run lib/pilot-learning.test.ts lib/case-proof-evidence.test.ts lib/sample-showcase-assets.test.ts lib/marketing-flow.test.ts`
- [x] `npm.cmd run lint -- "app/(dashboard)/beheer/klantlearnings/page.tsx" "components/dashboard/pilot-learning-workbench.tsx" "components/marketing/sample-showcase-card.tsx" "lib/pilot-learning.ts" "lib/case-proof-evidence.ts" "lib/sample-showcase-assets.ts" "app/api/learning-dossiers/route.ts" "app/api/learning-dossiers/[id]/route.ts"`
- [x] `npm.cmd run build`
- [x] Proof/evidence parity checks uitgevoerd via docs- en showcase-regressies:
  - `tests/test_case_proof_and_evidence_system.py`
  - `tests/test_sales_enablement_system.py`
  - `frontend/lib/sample-showcase-assets.test.ts`
  - `frontend/lib/marketing-flow.test.ts`

Niet uitgevoerd:

- [ ] Volledige live browservalidatie van admin-only case-capture
  - Niet nodig voor deze tranche; de verandering is primair contract-, data- en governancegedreven.

## 5. Files That Carry This Tranche

- `frontend/lib/case-proof-evidence.ts`
- `frontend/lib/case-proof-evidence.test.ts`
- `frontend/lib/sample-showcase-assets.ts`
- `frontend/lib/sample-showcase-assets.test.ts`
- `frontend/lib/pilot-learning.ts`
- `frontend/lib/pilot-learning.test.ts`
- `frontend/components/marketing/sample-showcase-card.tsx`
- `frontend/components/dashboard/pilot-learning-workbench.tsx`
- `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- `frontend/app/api/learning-dossiers/route.ts`
- `frontend/app/api/learning-dossiers/[id]/route.ts`
- `backend/models.py`
- `supabase/schema.sql`
- `docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md`
- `docs/reference/CASE_PROOF_AND_EVIDENCE_ACCEPTANCE_CHECKLIST.md`
- `docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md`
- `docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md`
- `docs/reference/SALES_ENABLEMENT_ACCEPTANCE_CHECKLIST.md`
- `docs/ops/PILOT_LEARNING_PLAYBOOK.md`
- `docs/ops/PILOT_LEARNING_TEMPLATES.md`
- `docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md`
- `docs/ops/CASE_PROOF_CAPTURE_TEMPLATES.md`
- `tests/test_case_proof_and_evidence_system.py`
- `tests/test_pilot_learning_system.py`
- `tests/test_sales_enablement_system.py`
- `docs/prompts/PROMPT_CHECKLIST.xlsx`

## 6. Current Product Risks

- [x] Er zijn nog steeds geen echte approved buyer-facing klantcases in de repo; deze tranche bouwt het systeem, niet de fictieve uitkomstverhalen.
- [x] De case-capturelaag blijft admin-first en manual-first; discipline in gebruik blijft belangrijk.
- [x] Site en pricing blijven voorlopig leunen op sample-output en trustproof, zij het nu explicieter binnen de evidence-taxonomie.
- [x] Named proof blijft bewust moeilijker dan anonieme proof; dat houdt claims zuiver maar vertraagt mogelijk publieke proofgroei.

## 7. Open Questions

- [ ] Welke outcome-kwaliteit telt intern als sterk genoeg voor de eerste publieke outcome claim?
- [ ] Moet de eerste approved case eerst alleen in sales-assets landen of ook op de site?
- [ ] Willen we references eerder activeren dan named public proof?

## 8. Follow-up Ideas

- [ ] Voeg later echte approved case-assets toe zodra pilot- en klanttoestemming beschikbaar is.
- [ ] Koppel approved case-proof later aan pricingverfijning en lifecycle-content.
- [ ] Bouw later paritychecks tussen case registry en buyer-facing case surfaces als echte public proof ontstaat.
