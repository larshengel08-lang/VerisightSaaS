# Action Center / MTO Improvement Review

Date: 2026-04-19
Scope: `Action Center / MTO-cockpit` only
Review type: Product/UX + code/architecture
Primary goal: prioritized improvement backlog with emphasis on improvement opportunities
Boundary note: suite coupling stays in scope as a required future capability, but not as an immediate live rollout for existing scans

## Top Findings

### P1. The cockpit still feels stacked rather than orchestrated.
- Evidence:
  - `frontend/components/dashboard/action-center/mto-manager-cockpit.tsx:35-64`
  - `frontend/components/dashboard/action-center/mto-theme-panel.tsx:28-59`
- Why it matters:
  - The current main screen is a vertical sequence of overview, mini-stats, theme cards, action cards and a review queue.
  - That makes the experience readable, but not yet strongly "department cockpit first".
  - A manager still has to scan several equal-weight blocks to answer the core questions: what needs attention, what is already running, and what needs review now.
- Recommended direction:
  - Restructure the cockpit around one dominant department follow-through zone.
  - Merge theme urgency, open action health and next review into one tighter management surface before dropping into detailed action editing.

### P1. Action creation is too thin for a mature management product.
- Evidence:
  - `frontend/components/dashboard/action-center/mto-action-composer.tsx:18-84`
  - `frontend/lib/management-actions.ts:129-173`
- Why it matters:
  - Creating an action is currently almost a one-click seed with optional question selection.
  - That keeps friction low, but it under-shapes action quality.
  - Managers are not asked for the first owner commitment, review moment, intended outcome or a sharper reason why this action is the right response now.
- Recommended direction:
  - Keep the entry light, but make creation a guided first commitment.
  - Add a compact creation sheet with required `owner`, `review date`, and a short "what should improve" field.
  - Pre-fill title/context from the theme, but let the manager sharpen it before the item opens.

### P1. The improvement lifecycle is split across disconnected surfaces instead of feeling like one dossier.
- Evidence:
  - `frontend/components/dashboard/action-center/mto-action-list.tsx:170-266`
  - `frontend/components/dashboard/action-center/mto-review-queue.tsx:67-124`
- Why it matters:
  - Action editing, progress updates and review logging currently live in separate zones.
  - That is functionally correct, but it fragments the mental model.
  - A manager should experience one improvement item with context, progress, blockers, review and outcome, not a record in one list and a separate review task elsewhere.
- Recommended direction:
  - Move toward a dossier-backed action detail pattern.
  - The cockpit can stay summary-first, but opening an action should reveal one consolidated improvement record with tabs/sections for context, updates, blockers, review history and next step.

### P1. The rights model is still organization-role based, not truly department-scoped.
- Evidence:
  - `frontend/lib/management-actions.ts:111-127`
- Why it matters:
  - The intended operating model is HR central and managers limited to their own department.
  - The current rules allow `owner` and `member` roles to view and edit broadly, while only `viewer` is restricted to owner email matching.
  - That is a reasonable placeholder, but not yet the bounded manager model the product vision calls for.
- Recommended direction:
  - Introduce an explicit action-access layer that can enforce department-scoped visibility and editability.
  - Keep HR-wide access, but stop relying on generic org membership as the long-term guardrail.

### P1. The MTO Action Center still depends on a very large dashboard page orchestration layer.
- Evidence:
  - `frontend/app/(dashboard)/campaigns/[id]/page.tsx:306-345`
  - `frontend/app/(dashboard)/campaigns/[id]/page.tsx:1704-1723`
- Why it matters:
  - The Action Center is correctly bounded to MTO, but its data loading still hangs off the already-large campaign page.
  - That makes the product harder to evolve and test independently.
  - It also increases the risk that future cockpit work drags the broader dashboard page into avoidable complexity.
- Recommended direction:
  - Extract an MTO Action Center server-side loader or dedicated dashboard sub-boundary.
  - Keep the page responsible for composition, but move MTO-specific orchestration into a narrower module.

### P1. Future suite coupling is still protected, but not yet explicit enough as a first-class architectural goal.
- Evidence:
  - `frontend/lib/management-actions.ts:26-55`
  - `frontend/lib/management-actions.ts:129-173`
  - `frontend/lib/action-center/mto-cockpit.ts:47-99`
- Why it matters:
  - The current track correctly stays MTO-first and avoids premature coupling.
  - But the next design steps should not accidentally harden the UI and orchestration so deeply around MTO that later `ExitScan` and `RetentieScan` adapters become awkward.
  - Suite capability should remain in scope now as an architectural constraint, even if live coupling is not the next implementation step.
- Recommended direction:
  - Keep product-native insight layers, but make shared follow-through seams explicit:
    - source traceability contract
    - adapter boundary per product
    - reusable action dossier primitives
    - shared action-access policy shape
  - Avoid building MTO-only assumptions into future action detail and cockpit infrastructure where a neutral contract would work.

## Prioritized Improvement Backlog

### P1

#### 1. Reframe the main screen into a true department follow-through cockpit.
- Domain: Cockpit clarity
- Problem:
  - The current layout presents multiple peer sections instead of one strongly guided management workspace.
- Impact:
  - Reduces first-glance clarity and weakens daily-use confidence for managers.
- Recommended change:
  - Create a dominant top section per department with:
    - department state
    - top themes needing attention
    - open action health
    - review urgency
  - Relegate raw action maintenance to secondary depth.
- Now or later: Next build phase

#### 2. Upgrade action creation from seed action to first-quality commitment.
- Domain: Manager UX and usability
- Problem:
  - Creation asks too little at the moment the manager still has context.
- Impact:
  - Leads to vague titles, empty review dates and weaker accountability downstream.
- Recommended change:
  - Add a compact create flow requiring:
    - owner
    - first review date
    - expected outcome
  - Keep optional question linkage, but make it clearly supportive rather than central.
- Now or later: Next build phase

#### 3. Introduce dossier-backed action detail.
- Domain: Action lifecycle and review discipline
- Problem:
  - Edit, update and review are fragmented.
- Impact:
  - Makes the lifecycle feel administrative instead of coherent and management-grade.
- Recommended change:
  - Introduce an action detail view/panel where context, updates, blockers, reviews and next steps live together.
- Now or later: Next build phase

#### 4. Replace generic org-role permissions with department-aware access rules.
- Domain: Suite readiness without premature coupling
- Problem:
  - Current visibility/editability is not aligned with the target HR-plus-own-department model.
- Impact:
  - Creates policy drift between product promise and actual access behavior.
- Recommended change:
  - Add a department-scoped permission contract for Action Center access.
  - Keep it MTO-only in this phase; do not generalize suite-wide yet.
- Now or later: Before broader internal rollout

#### 5. Extract MTO Action Center orchestration out of the main dashboard page.
- Domain: Code and component architecture
- Problem:
  - Too much Action Center data loading stays inside the large page boundary.
- Impact:
  - Slows iteration and raises accidental coupling risk.
- Recommended change:
  - Create a dedicated loader/builder for MTO Action Center campaign data and pass a single prepared model into the cockpit.
- Now or later: Next build phase

#### 6. Make suite-coupling capability an explicit non-breaking architecture track inside the next phase.
- Domain: Suite readiness without premature coupling
- Problem:
  - The review protected against premature rollout, but should also protect for later adapter-based adoption by other scan types.
- Impact:
  - Without this, the Action Center can become polished for MTO while still becoming harder to connect safely to `retention` and `exit` later.
- Recommended change:
  - In the next phase, explicitly define:
    - product adapter interface
    - shared action dossier primitives
    - neutral traceability payload shape
    - shared permission envelope with product-specific enforcement
  - Keep implementation live only for MTO unless a later gate opens more.
- Now or later: Next build phase

### P2

#### 7. Prioritize and sort theme cards instead of preserving raw source order.
- Domain: Cockpit clarity
- Evidence:
  - `frontend/lib/action-center/mto-cockpit.ts:59-99`
- Problem:
  - `themeCards` keep department-read order and `topThemes` simply slices the first three.
- Impact:
  - Important themes can appear below less urgent items, weakening executive scan value.
- Recommended change:
  - Sort by urgency signal, action pressure and pending review state before rendering.
- Now or later: Soon after P1 cockpit restructuring

#### 8. Make theme cards show action health, not only action count.
- Domain: Product/UX
- Evidence:
  - `frontend/components/dashboard/action-center/mto-theme-panel.tsx:37-46`
- Problem:
  - Managers see whether a theme has actions, but not whether those actions are healthy, overdue or blocked.
- Impact:
  - Theme cards under-serve as management surfaces.
- Recommended change:
  - Add a compact health strip for:
    - no action
    - in progress
    - blocked
    - review due
    - follow-up needed
- Now or later: Soon after P1 cockpit restructuring

#### 9. Elevate review urgency beyond three simple tones.
- Domain: Action lifecycle and review discipline
- Evidence:
  - `frontend/lib/action-center/mto-cockpit.ts:72-84`
  - `frontend/components/dashboard/action-center/mto-review-queue.tsx:77-83`
- Problem:
  - Review urgency is flattened into `blue/amber/slate`.
- Impact:
  - The queue works, but does not yet feel like a disciplined leadership review rhythm.
- Recommended change:
  - Distinguish at least:
    - overdue review
    - due soon
    - completed but effect-check missing
    - closed
- Now or later: After dossier-backed action detail lands

#### 10. Separate mutation logic from presentational components.
- Domain: Code and component architecture
- Evidence:
  - `frontend/components/dashboard/action-center/mto-action-composer.tsx:28-58`
  - `frontend/components/dashboard/action-center/mto-action-list.tsx:83-129`
  - `frontend/components/dashboard/action-center/mto-review-queue.tsx:37-57`
- Problem:
  - Fetch calls, local drafts and rendering are tightly mixed inside client components.
- Impact:
  - Makes refinement slower and increases UI-level duplication.
- Recommended change:
  - Introduce a small Action Center client service/hooks layer so the UI can become easier to refactor.
- Now or later: After P1 structural product fixes

#### 11. Sharpen the visual hierarchy toward a calmer executive feel.
- Domain: Visual maturity and information hierarchy
- Problem:
  - The current design is neat, but many panels share similar border/card treatment and equal visual weight.
- Impact:
  - The page reads more like a capable internal tool than a mature leadership workspace.
- Recommended change:
  - Create clearer tiers between:
    - department state
    - urgent themes
    - live actions
    - review pressure
  - Reduce repeated card sameness and make urgency more legible without becoming noisy.
- Now or later: In parallel with cockpit reframing

### P3

#### 12. Add lightweight outcome patterns for stronger management language.
- Domain: Manager UX and usability
- Problem:
  - Expected and measured outcome fields are free text only.
- Impact:
  - Flexible, but harder to compare or coach across managers.
- Recommended change:
  - Add optional prompts such as:
    - "wat willen we binnen 30 dagen zien"
    - "welk gedrag of signaal moet veranderen"
  - Keep them optional and non-template-heavy.
- Now or later: Later polish

#### 13. Add manager-facing copy refinements and terminology pass.
- Domain: Product/UX
- Problem:
  - Some language is still implementation-oriented rather than management-native.
- Impact:
  - Small, but matters for adoption and perceived maturity.
- Recommended change:
  - Run a dedicated copy pass for cockpit labels, button text, review prompts and state language.
- Now or later: Later polish

## Do Not Overbuild

- Do not turn this into a generic cross-product action center yet.
- Do keep neutral adapter seams visible so later suite coupling stays easy.
- Do not add a generic segment explorer in this phase.
- Do not force rigid workflow templates or "project management" behavior.
- Do not bury the cockpit under advanced analytics before the manager flow is excellent.
- Do not refactor the whole dashboard page at once; isolate the MTO Action Center boundary only.

## Recommended Build Order

1. Reframe the cockpit around department follow-through.
2. Upgrade action creation into a first-quality commitment flow.
3. Introduce dossier-backed action detail and unify lifecycle surfaces.
4. Tighten department-aware permissions.
5. Extract MTO Action Center orchestration into its own loader boundary.
6. Refine sorting, urgency modelling and visual hierarchy.
7. In parallel, keep adapter seams explicit so later suite coupling remains straightforward.
8. Only after that consider broader live suite-facing adapter work.

## Review Summary

The current Action Center is a credible bounded internal product, but it still feels closer to a capable action-log plus cockpit shell than to a truly mature management operating surface. The biggest opportunity is not more features; it is stronger orchestration, better action quality at creation, a unified improvement dossier model, stricter department-scoped access and more explicit suite-capable seams. If those areas improve together, the product becomes meaningfully sharper, calmer and more executive-ready without breaking its MTO-first boundaries or closing off later coupling to other scans.
