# Loep Culture Assessment V1 Standalone Commercial Product Launch Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Execute this plan as a bounded V1 product launch, not as open-ended platform expansion.

## Goal

Launch `Loep Culture Assessment` / `Loep Cultuurbeeld` as a **standalone heavy culture and engagement product** with canonical route id `culture_assessment`.

V1 must be:

- a new **primary route**
- commercially explainable as a serious boardroom product
- enterprise-grade in governance and outputs
- deployable for both enterprise and MKB customers through **deployment profiles**, not through separate product logic
- baseline-only

V1 must **not** become:

- RetentieScan-by-another-name
- Pulse runtime
- TeamScan runtime
- a manager ranking tool
- a self-serve survey platform
- a benchmark-first product
- an individual monitoring or prediction product

## Reframe

This is not a narrow runtime implementation pass.

This is a **V1 Standalone Commercial Product Launch** with three equal build pillars:

1. Runtime & data
2. Result environment
3. Premium delivery package

All three pillars depend on three required pre-build packages:

- **WP0. Questionnaire & scoring lock**
- **WP0.5. Commercial product frame lock**
- **WP0.6. Premium output blueprint**

Without those locks, the product is still a route shell instead of a real standalone baseline product.

---

## V1 Architecture

V1 ships one fixed heavy baseline product with:

- one fixed enterprise questionnaire
- one shared canonical route id: `culture_assessment`
- one annual baseline runtime path
- one executive result environment
- one premium delivery suite
- one core instrument for both enterprise and MKB deployment profiles

V1 does **not** ship:

- survey builder
- benchmark engine
- billing layer
- self-service onboarding
- manager performance module
- custom modules
- customer theme packs
- Pulse runtime path

---

## Required Pre-Build Package

### WP0. Questionnaire & Scoring Lock

**Purpose**

Freeze the actual measurement product before runtime, dashboard, report, or sales outputs are expanded further.

**Files likely touched**

- `docs/superpowers/specs/2026-05-17-loep-culture-assessment-design.md`
- `frontend/lib/products/culture_assessment/contract.ts`
- `frontend/lib/products/culture_assessment/definition.ts`
- `backend/products/culture_assessment/definition.py`
- `backend/products/culture_assessment/scoring.py`
- `backend/products/culture_assessment/report_content.py`
- new questionnaire/scoring fixtures and tests

**Scope**

- final fixed enterprise questionnaire
- item quality review
- no duplicated or overlapping items
- minimum item count per domain
- item-to-domain mapping
- answer scales
- answer scale consistency
- reverse scoring where needed
- reverse scoring checks
- plain Dutch business language
- no suggestive questions
- target completion time defined
- pilot-test with a small internal sample before first customer use
- Culture Index calculation
- domain score calculation
- minimum valid response rules
- deterministic `board_attention_logic`
- explicit no-causal-claims rule
- explicit no-individual-predictions rule
- explicit no-manager-ranking rule

**Board attention logic requirement**

Inputs:

- domain scores
- segment spread
- response coverage
- contrast strength
- recurring theme pairs
- safe open text clusters

Outputs:

- maximum 5 attention points
- priority reason
- confidence label
- what to verify next

Forbidden outputs:

- causal diagnosis
- automatic intervention advice
- manager blame

**Dependencies**

- none

**Acceptance criteria**

- there is one final canonical enterprise questionnaire for V1
- questionnaire items have passed an item quality review
- no duplicated or materially overlapping items remain
- every domain has a minimum viable item count defined and met
- answer scales are consistent unless a justified exception is documented
- reverse scoring rules are explicit and tested
- questionnaire copy uses plain Dutch business language
- no question is suggestive or leading
- target completion time is explicitly defined
- the instrument is pilot-tested with a small internal sample before first customer use
- every item maps deterministically to a domain or index logic
- Culture Index calculation is explicit and testable
- domain score calculation is explicit and testable
- minimum valid response rules are explicit and testable
- board attention point logic is deterministic and pattern-based, not consultant-freeform
- board attention outputs never produce causal diagnosis, automatic intervention advice, or manager blame
- no output path can produce causal claims
- no output path can produce individual predictions
- no output path can produce manager ranking logic

**Out of scope**

- alternative questionnaires
- client-specific modules
- sector-specific instrument variants
- Pulse logic

### WP0.5. Commercial Product Frame Lock

**Purpose**

Lock the commercial product frame before runtime and output implementation so V1 ships as a coherent offer instead of a technically complete but commercially blurry route.

**Files likely touched**

- `docs/superpowers/specs/2026-05-17-loep-culture-assessment-design.md`
- `docs/superpowers/plans/2026-05-17-loep-culture-assessment-primary-route.md`
- packaging, pricing, and routing canon docs where relevant
- sample product messaging notes or launch-facing templates

**Scope**

- enterprise deployment profile boundaries
- MKB deployment profile boundaries
- package logic
- package decision section
- buyer promise
- standard included outputs
- optional outputs
- sales routing
- board-read promise
- what is explicitly not sold in V1

**Package decision section**

Force explicit decisions on:

- default V1 package name
- whether board-read is always included
- whether HR appendix is default or only in governed/enterprise package
- whether segment summary export is default or only in governed/enterprise package
- whether Pulse remains follow-on only
- what is standard included vs optional

Suggested package candidates:

- `Loep Cultuurbeeld Board Baseline`
- `Loep Cultuurbeeld Governed`
- `Loep Cultuurbeeld Enterprise`

**Locked V1 commercial frame**

- default V1 package name: `Loep Cultuurbeeld Board Baseline`
- board-read is always included in the default V1 package
- HR appendix is not default; it belongs to governed / enterprise delivery only
- segment summary export is not default; it belongs to governed / enterprise delivery only
- Pulse remains follow-on only

Standard included in `Loep Cultuurbeeld Board Baseline`:

- annual culture assessment baseline
- executive dashboard view
- board report PDF
- boardroom PowerPoint deck
- executive one-pager
- guided board-read session

Optional / governed add-ons:

- HR appendix PDF
- segment summary export
- governed drilldown
- HR deepening handout
- manager cascade handout when threshold-safe
- Pulse follow-on after baseline

What is explicitly not sold in V1:

- benchmark package
- self-serve survey platform
- manager ranking or manager performance layer
- custom questionnaire modules
- live/pulse runtime inside the baseline

**Dependencies**

- depends on `WP0`

**Acceptance criteria**

- enterprise and MKB profile boundaries are explicit before build starts
- package logic is fixed and does not depend on custom product branching
- package decisions are explicitly locked before build starts
- buyer promise is explicit and claim-safe
- standard included outputs are fixed
- optional outputs are fixed
- sales routing is fixed before route activation work continues
- board-read promise is explicit and bounded
- the plan explicitly states what is not sold in V1
- the commercial frame does not imply benchmark-first, manager ranking, self-serve tooling, or Pulse runtime

**Out of scope**

- separate MKB product logic
- bespoke package variants per customer
- benchmark-led commercial framing

### WP0.6. Premium Output Blueprint

**Purpose**

Define the structure of premium outputs before build so reports, decks, and handouts are designed as one product system instead of assembled late as disconnected artifacts.

**Files likely touched**

- `docs/superpowers/specs/2026-05-17-loep-culture-assessment-design.md`
- report template outlines
- PowerPoint/deck structure docs
- output blueprint docs or templates

**Scope**

Define the content structure before build for:

- board report PDF
- HR appendix PDF
- boardroom PowerPoint deck
- executive one-pager
- HR deepening handout
- manager cascade handout
- board-read facilitator script
- sample output pack

**Locked premium output blueprint**

`board_report_pdf`

1. Context and scope
2. Response base and coverage
3. Executive culture read
4. Loep Culture Index
5. Domain picture
6. Board attention points
7. Safe segment contrasts
8. What not to conclude
9. Follow-on route options
10. Method and governance note

`hr_appendix_pdf`

1. Scope and governance boundary
2. Response base by safe segment
3. Domain detail by safe segment
4. Pattern analysis and recurring theme pairs
5. Safe open-text cluster summary when enabled
6. Suppressed segments and why they are hidden
7. Practical follow-up boundaries

`boardroom_powerpoint_deck`

1. Title and context
2. What was measured
3. Response and coverage
4. Executive read
5. Culture Index as navigation signal
6. Domain picture
7. 3-5 board attention points
8. Segment contrasts where safe
9. What not to conclude
10. Board decision questions
11. Follow-on route options

`executive_one_pager`

1. What this baseline is
2. Response and coverage snapshot
3. Culture Index snapshot
4. Top 3 attention points
5. Safe follow-up framing
6. Governance reminder

`hr_deepening_handout`

1. What HR should read first
2. Safe segment interpretation rules
3. Domain deepening cues
4. Pattern questions for HR follow-up
5. What HR should not conclude

`manager_cascade_handout`

1. What was measured at organization level
2. What managers may safely say to teams
3. Conversation prompts without score defense
4. What managers may not do
5. Escalation path when local detail is hidden

`board_read_facilitator_script`

1. Session objective
2. Setup and governance reminder
3. Slide-by-slide facilitation cues
4. Attention point discussion prompts
5. What not to conclude or speculate
6. Decision capture
7. Follow-on route close

`sample_output_pack`

1. Sample board report PDF
2. Sample boardroom PowerPoint deck
3. Sample executive one-pager
4. Sample HR appendix
5. Sample dashboard screenshots or demo environment
6. Sample invite mail
7. Sample board-read agenda
8. Sample "what you receive after completion" page

**Dependencies**

- depends on `WP0`
- depends on `WP0.5`

**Acceptance criteria**

- every premium output has a defined structure before implementation starts
- board report and HR appendix have explicit section structures
- boardroom deck structure is fixed before asset generation
- executive one-pager structure is fixed
- HR deepening handout structure is fixed
- manager cascade handout structure and governance are fixed
- board-read facilitator script structure is fixed
- sample output pack contents are fixed before sample asset generation
- the output blueprint is aligned to the locked V1 package frame
- default-package outputs and governed-only outputs are explicitly separated

**Out of scope**

- bespoke client theming
- variable report composition per customer

---

## Pillar 1: Runtime & Data

This pillar makes the product actually runnable as a **baseline campaign**, but only after the pre-build packages are locked.

### WP1. Campaign Type And Baseline Runtime Activation

**Purpose**

Turn `culture_assessment` from route-ready into a real baseline campaign type.

**Files likely touched**

- `frontend/lib/types.ts`
- `frontend/lib/products/shared/registry.ts`
- `backend/schemas.py`
- `backend/main.py`
- `backend/products/shared/registry.py`
- campaign creation / campaign lifecycle tests

**Scope**

- add `culture_assessment` campaign type where still missing
- keep baseline-only execution model
- no live runtime path
- no pulse/repeat runtime path

**Dependencies**

- depends on `WP0`
- depends on `WP0.5`

**Acceptance criteria**

- `culture_assessment` campaigns can be created and stored
- only baseline delivery is allowed
- no live/pulse delivery mode can be opened for this route
- route id is canonical and stable across frontend/backend/schema/tests

**Out of scope**

- recurring measurement cadence
- self-serve campaign setup

### WP2. Respondent Import, Invite Flow, Survey Page, Submit Flow

**Purpose**

Open the actual baseline collection lane for the product.

**Files likely touched**

- `backend/main.py`
- respondent import/invite routes
- survey template + submit validation
- `backend/products/culture_assessment/scoring.py`
- frontend setup/admin surfaces where relevant
- tests around import/invite/submit

**Scope**

- respondent import
- invite flow
- survey page
- submit flow
- baseline-only collection behavior

**Dependencies**

- depends on `WP0`
- depends on `WP0.5`
- depends on `WP1`

**Acceptance criteria**

- a culture assessment campaign can import respondents
- invites can be sent for that campaign
- the survey page loads with the fixed instrument
- submit flow validates required answers and valid-response rules
- stored results follow the locked scoring model
- no alternate live/pulse runtime path exists

**Out of scope**

- survey builder
- modular questionnaires
- client-specific instrument composition

### WP3. Campaign Close And Baseline-Only Result Release

**Purpose**

Close the collection loop and release results only through governed baseline logic.

**Files likely touched**

- `backend/main.py`
- result release state logic
- frontend campaign/report state logic
- acceptance tests around release thresholds

**Scope**

- campaign close
- baseline-only result release
- collecting / insufficient / available states

**Dependencies**

- depends on `WP0`
- depends on `WP0.5`
- depends on `WP1`
- depends on `WP2`

**Acceptance criteria**

- campaign close works for `culture_assessment`
- results are not visible before valid baseline release conditions are met
- no rolling live-update semantics are introduced
- no pulse-style runtime semantics are introduced

**Out of scope**

- recurring remeasurement cadence
- automated pulse scheduling

---

## Pillar 2: Result Environment

This pillar makes the product readable without requiring the buyer to become a dashboard analyst.

### WP4. Governance, Thresholds, Suppression, And Role Visibility

**Purpose**

Enforce safe release behavior before UI polish or premium outputs.

**Files likely touched**

- `frontend/lib/products/culture_assessment/contract.ts`
- `frontend/lib/products/culture_assessment/dashboard.ts`
- `backend/products/culture_assessment/report_content.py`
- role-gating / export-gating code paths
- tests for thresholds and suppression

**Scope**

- organization and segment minimum-n thresholds
- segment suppression below threshold
- manager layer locked by default
- open text only clustered and safe
- role-based visibility:
  - executive
  - hr_partner
  - business_unit_lead
  - manager_limited
  - admin
- no respondent-level export

**Dependencies**

- depends on `WP0`
- depends on `WP0.5`
- depends on `WP3`

**Acceptance criteria**

- organization-level results do not render below `organization_min_n`
- segments suppress below their threshold
- named manager layer is locked by default
- open text does not render raw or unsafe
- role views are enforced deterministically
- no respondent-level export is available anywhere

**Out of scope**

- named manager unlock workflow beyond locked-by-default groundwork
- benchmark logic

### WP5. Executive Dashboard And Canonical Block Order

**Purpose**

Build the board-readable result environment exactly in the canonical reading sequence.

**Files likely touched**

- `frontend/lib/products/culture_assessment/dashboard.ts`
- `frontend/app/(dashboard)/campaigns/[id]/dashboard-architecture.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/lib/dashboard/report-library.ts`
- relevant tests

**Scope**

Implement this fixed order:

1. Responsbasis & meetdekking
2. Executive culture read
3. Loep Culture Index
4. Board attention points
5. Domeinbeeld
6. Patronen in samenhang
7. Segmentcontrasten
8. Verdiepingslagen
9. Open signalen
10. Board-read & vervolgritme
11. Rapport, export & methodiek

**Dependencies**

- depends on `WP4`
- depends on `WP0.6`

**Acceptance criteria**

- executive result environment follows the canonical block order
- Culture Index is framed as navigation signal, never as health verdict
- 3-5 board attention points can be generated from deterministic pattern logic
- dashboard does not require analyst behavior to understand the product
- no ranking tables appear in executive view

**Out of scope**

- alternate dashboard orders
- benchmark panels beyond inactive state

### WP6. Output Governance Surface

**Purpose**

Ship the minimum governed result output set required for V1 release.

**Files likely touched**

- report/export route code
- `backend/report.py`
- `backend/products/culture_assessment/report_content.py`
- frontend reports surfaces
- export tests

**Scope**

- board report PDF
- HR appendix PDF
- segment summary export
- no individual data export
- benchmark inactive state

**Dependencies**

- depends on `WP4`
- depends on `WP5`
- depends on `WP0.6`

**Acceptance criteria**

- board report PDF works
- HR appendix PDF works
- segment summary export is aggregate-only
- no individual respondent export is possible
- benchmark renders only as inactive state in V1

**Out of scope**

- benchmark comparisons
- peer ranking tables

---

## Pillar 3: Premium Delivery Package

This pillar turns the route into a heavy standalone product, not just a data pipe.

### WP7. Premium Asset Generation

**Purpose**

Generate the premium buyer-facing delivery package around the baseline from the locked output blueprint.

**Files likely touched**

- PDF/report templates
- PowerPoint/deck assets
- output templates under docs/templates/presentations if applicable
- tests or snapshot checks where practical

**Scope**

V1 must include:

- board report PDF
- HR appendix PDF
- boardroom PowerPoint deck
- executive one-pager
- HR deepening handout
- manager cascade handout
- board-read facilitator script

**Manager cascade handout governance**

Manager cascade handout may:

- explain what was measured at organization level
- support safe team communication
- structure follow-up conversation without score defense

Manager cascade handout may not:

- compare teams as ranking
- ask managers to defend low scores
- discuss individual signals
- show local scores below threshold

**Dependencies**

- depends on `WP6`
- depends on `WP0.6`

**Acceptance criteria**

- the board deck exists as a real reusable asset
- the board deck is usable in an executive meeting without extra explanation
- the executive one-pager exists
- the executive one-pager can stand alone
- the HR deepening handout exists
- the HR handout gives enough depth without exposing unsafe detail
- the manager cascade handout exists
- the manager cascade handout follows the locked governance rules
- the manager cascade handout can be used without creating ranking behavior
- the board-read facilitator script exists
- the facilitator script supports a 60-90 minute board-read
- board report copy is claim-safe
- HR appendix copy is privacy-safe
- board deck copy is claim-safe
- executive one-pager copy is claim-safe
- manager cascade handout is governance-safe
- facilitator script avoids causal diagnosis, individual inference, and manager blame
- the product feels like a premium boardroom product, not just a dashboard

**Boardroom PowerPoint deck structure**

1. title/context
2. what was measured
3. response and coverage
4. executive read
5. Culture Index as navigation signal
6. domain picture
7. 3-5 board attention points
8. segment contrasts where safe
9. what not to conclude
10. board decision questions
11. follow-on route options

**Out of scope**

- client theme packs
- benchmark storytelling

### WP8. Sample Output Pack And Demo Organization

**Purpose**

Make the product commercially demoable without a live customer environment.

**Files likely touched**

- demo seed data
- sample reports/decks/one-pagers
- sample-output docs or static assets
- tests/fixtures for fictive data

**Scope**

- sample board report PDF
- sample boardroom PowerPoint deck
- sample executive one-pager
- sample HR appendix
- sample dashboard screenshots or demo environment
- sample invite mail
- sample board-read agenda
- sample "what you receive after completion" page
- demo organization with fictive data
- safe sample dashboard/report/deck outputs

**Dependencies**

- depends on `WP5`
- depends on `WP6`
- depends on `WP7`

**Acceptance criteria**

- sample output can be shown without a live environment
- demo organization exists with fictive, safe data
- sample board report PDF exists
- sample boardroom PowerPoint deck exists
- sample executive one-pager exists
- sample HR appendix exists
- sample dashboard screenshots or demo environment exist
- sample invite mail exists
- sample board-read agenda exists
- sample "what you receive after completion" page exists
- sales can demo the route from sample outputs alone

**Out of scope**

- real customer benchmark examples
- public proof based on live client data

### WP9. Launch Readiness, Deployment Profiles And Sales Framing

**Purpose**

Validate that the locked commercial frame, deployment profiles, and premium outputs are launch-ready for both enterprise and MKB without forking product logic.

**Files likely touched**

- packaging docs
- sales routing docs
- pricing/marketing route surfaces
- deployment copy/config
- acceptance tests where needed

**Scope**

Validate and finalize two deployment profiles using the same core instrument:

- **Enterprise profile**
  - deeper segment layers
  - board deck
  - HR appendix
  - governed drilldown
  - possible later Pulse rhythm

- **MKB profile**
  - organization-wide read is the primary value
  - segmentation only where minimum-n allows
  - no default named manager layer
  - no deep team comparison as default
  - premium MT/board read is more important than dashboard depth
  - same core instrument
  - never positioned as "lite" or as cheaper different product logic

Add delivery readiness requirements for:

- who facilitates the board-read
- expected preparation time per client
- target turnaround time from survey close to board output
- which outputs are manual, semi-automated, or automated
- which outputs may not be manually rewritten because of claim/governance risk

Apply first pilot constraints:

- maximum one organization at a time
- no benchmark
- no manager layer unlock
- open text only if clustering is safe
- maximum two segment dimensions in first pilot
- board-read always guided
- no custom questions

**Dependencies**

- depends on `WP0.5`
- depends on `WP0.6`
- depends on `WP7`
- depends on `WP8`

**Acceptance criteria**

- enterprise and MKB use the same core questionnaire and scoring logic
- enterprise and MKB profile boundaries are implemented as locked deployment framing, not new product logic
- MKB is not presented as a cheaper different product logic
- MKB launch framing prioritizes organization-wide read over deep comparison depth
- segmentation in MKB is only shown where minimum-n allows
- named manager layer is not on by default in MKB
- deep team comparison is not the default MKB story
- board-read facilitation ownership is explicit
- expected preparation time per client is explicit
- target turnaround time from survey close to board output is explicit
- output automation classification is explicit per output
- claim- or governance-sensitive outputs that may not be manually rewritten are explicit
- first pilot constraints are explicit and accepted
- deployment profiles are commercially clear
- the product has a clear buying reason versus a classic MTO
- the route can be explained to a board/HR director in 10 minutes

**Out of scope**

- separate MKB product
- compact/lite questionnaire
- billing model changes

---

## V1 Work Package Order

The required execution order is:

1. `WP0` Questionnaire & scoring lock
2. `WP0.5` Commercial product frame lock
3. `WP0.6` Premium output blueprint
4. `WP1` Campaign type and baseline runtime activation
5. `WP2` Respondent import, invite flow, survey page, submit flow
6. `WP3` Campaign close and baseline-only result release
7. `WP4` Governance, thresholds, suppression, and role visibility
8. `WP5` Executive dashboard and canonical block order
9. `WP6` Output governance surface
10. `WP7` Premium asset generation
11. `WP8` Sample output pack and demo organization
12. `WP9` Launch readiness, deployment profiles, and sales framing

---

## Commercial Acceptance Criteria

### V1 Launch Status

V1 launch status is defined as:

- pilot-ready
- commercially demoable
- operationally executable
- not benchmark-ready
- not self-service scalable
- not fully automated delivery at volume

V1 is only complete if all of the following are true:

- can be explained to a board/HR director in 10 minutes
- sample output can be shown without live environment
- feels like a premium boardroom product
- does not require the buyer to become a dashboard analyst
- creates a clear buying reason compared with a classic MTO
- supports both enterprise and MKB via deployment profiles, not separate product logic

---

## Explicitly Out Of Scope In V1

Do **not** add any of the following:

- survey builder
- benchmark engine
- billing layer
- self-service onboarding
- manager performance module
- custom modules
- customer theme packs
- Pulse runtime
- live/repeat runtime path
- separate lite product logic
- sector-specific questionnaire variants

---

## V1.5 Governed Deepening

After V1 launch, the next layer is:

- richer segment analysis
- better open-text clustering
- HR analysis workspace
- manager cascade tooling
- delivery/admin tooling
- report variant controls

Rule:

- V1.5 may deepen governed reading and delivery operations
- V1.5 may not mutate the locked core instrument without explicit product decision

---

## V2 Benchmark Layer

V2 may introduce:

- anonymous cross-client reference
- sector/peer benchmark
- normalization and governance

Rules:

- no ranking competition framing
- no benchmark-first positioning
- no buyer-facing league-table behavior

---

## V2.5 Product Family Expansion

Possible later expansion:

- optional compact deployment profile
- sector interpretation layers only if they do not change the core questionnaire
- stronger follow-on connection to Pulse only after baseline value is proven

Rules:

- no instrument drift without explicit product decision
- Pulse stays follow-on, never retroactively part of the baseline

---

## Build-Readiness Checklist

Before implementation starts, confirm:

- the final questionnaire is locked
- questionnaire quality has been reviewed
- scoring rules are locked and tested
- Culture Index logic is locked
- domain logic is locked
- board attention logic is locked
- no-causal / no-prediction / no-ranking rails are explicit
- campaign type and baseline-only runtime scope are confirmed
- thresholds and role rules are explicit
- canonical dashboard block order is fixed
- output suite definition is fixed
- board deck structure is fixed
- deployment profiles are fixed
- sample output pack is part of scope
- demo organization is part of scope
- board report copy has been reviewed
- deck copy has been reviewed
- method copy is claim-safe and privacy-safe
- sales copy is claim-safe
- manager handout is claim-safe
- V1 out-of-scope guardrails are accepted

---

## Final Recommendation

Treat `Loep Culture Assessment / Loep Cultuurbeeld` as:

- one **standalone heavy V1 product launch**
- inside a larger roadmap
- with a fixed instrument and premium delivery package
- not as a small runtime enhancement

The product becomes real in V1 only when all three pillars land together:

- Runtime & data
- Result environment
- Premium delivery package
