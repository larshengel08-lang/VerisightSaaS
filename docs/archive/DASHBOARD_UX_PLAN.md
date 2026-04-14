# DASHBOARD_UX_PLAN.md - Verisight Dashboard UX Redesign Plan

## Summary
This plan redesigned the **dashboard/app experience only** for the two current products: **ExitScan** and **RetentieScan**. The redesign kept one shared app shell and the existing `scan_type` split, but reworked the UX from a long, report-like stack into a calmer, more decision-first dashboard structure.

The implemented outcome:
- clearer first-read priority on campaign detail
- stronger product-specific reading flow for ExitScan vs RetentieScan
- progressive disclosure for analysis, respondents, and methodology
- safer RetentieScan interpretation and privacy framing
- a more operational campaign overview
- a tighter setup-to-insight path through campaign creation, preflight, and management actions

Important execution boundaries that were kept:
- only ExitScan and RetentieScan
- marketing website out of scope
- no new products
- no backend rearchitecture
- only lightweight frontend/product-module interface changes where the dashboard UX needed them

---

## Milestone 0 - Freeze Scope And Baseline Audit
Dependency: none

### Tasks
- [x] Confirm the redesign scope covers only the dashboard/app experience for `ExitScan` and `RetentieScan`.
- [x] Record the current dashboard entrypoints and ownership.
- [x] Document the current section order on campaign detail and classify the blocks.
- [x] Inventory current dashboard components as shared or product-specific.
- [x] Record baseline UX pain points.
- [x] Record mobile/responsive risks for dense dashboard sections.

### Definition of done
- [x] One baseline of the current dashboard UX and scope exists.
- [x] The current page structure was mapped before redesign work started.
- [x] Shared vs product-specific dashboard responsibilities were explicitly listed.

### Validation
- [x] Static repo review completed for dashboard overview, campaign detail, and setup components.
- [x] Baseline notes were based on the actual implementation.

### Completion notes
- Completed:
  - current entrypoints and dashboard component map were reviewed before implementation
  - campaign detail, overview, setupflow, privacy surfaces, and product modules were grounded in the real codebase
- Still open after this milestone:
  - no open scope questions remained
- New follow-up ideas discovered:
  - [ ] optionally separate a future deep-dive route for segment analysis if campaign detail grows again

---

## Milestone 1 - Dashboard Information Architecture
Dependency: Milestone 0

### Tasks
- [x] Define the target dashboard IA around status/actions, primary decision signals, interpretation, analysis, and operations.
- [x] Define a single target structure for campaign detail.
- [x] Define what is first-screen visible versus lower, collapsible, or secondary.
- [x] Define a consistent internal navigation model.
- [x] Redefine the campaign overview as an operational cockpit.
- [x] Define which dashboard behaviors stay shared and which become product-specific.

### Definition of done
- [x] Campaign overview and campaign detail each have one clear job.
- [x] Campaign detail now has a fixed section hierarchy.
- [x] First-screen priority vs secondary detail is explicit in the UI.
- [x] Shared vs product-specific IA decisions were implemented.

### Validation
- [x] The new IA maps all current critical blocks.
- [x] No critical action lost a discoverable place.

### Completion notes
- Completed:
  - campaign detail now follows: hero/actions -> decisieoverzicht -> interpretatie -> operatie -> disclosures
  - campaign overview now groups campaigns by status/action instead of showing only a flat card grid
  - shared dashboard primitives were introduced for hero, sections, disclosures, chips, and summary panels
- Still open after this milestone:
  - no blocking IA items remain inside current scope
- New follow-up ideas discovered:
  - [ ] consider a user preference for remembered open/closed disclosure state

---

## Milestone 2 - Decision-First Campaign Detail Redesign
Dependency: Milestone 1

### Tasks
- [x] Redesign the campaign detail page from a stacked report into a decision-first page.
- [x] Define a top-of-page summary layout.
- [x] Reduce first-read KPI weight to a smaller decision layer.
- [x] Move methodology, factor detail, respondent detail, and long action text out of the primary path.
- [x] Re-sequence charts, factors, themes, and playbooks.
- [x] Introduce explicit progressive disclosure patterns.
- [x] Define a fixed placement model for trend, playbooks, methodology, respondent detail, and report actions.

### Definition of done
- [x] Campaign detail has a fixed decision-first section order.
- [x] Primary vs secondary information is visibly separated.
- [x] Methodology and operational detail no longer compete with first-read insights.
- [x] The page no longer behaves like a stitched report.

### Validation
- [x] The top 3 actions/insights are identifiable from the first screen.
- [x] Existing current sections either have a new place or were intentionally collapsed into disclosures.

### Completion notes
- Completed:
  - campaign detail was rebuilt around a decision-first hero and summary layer
  - analysis, respondents, and methodology are now disclosure-based rather than always-open stacks
  - campaign health and preflight were moved into a distinct operations band
- Still open after this milestone:
  - no blocking layout items remain within the current campaign detail scope
- New follow-up ideas discovered:
  - [ ] optionally add remembered disclosure state per user later

---

## Milestone 3 - Product-Specific UX Flows
Dependency: Milestone 2

### Tasks
- [x] Define a distinct ExitScan decision flow.
- [x] Define a distinct RetentieScan decision flow.
- [x] Keep shared components only where the interaction model genuinely overlaps.
- [x] Split product interpretation where needed.
- [x] Ensure the first-read experience is not “same page, different labels”.
- [x] Define product-specific low-data and early-response behavior.

### Definition of done
- [x] ExitScan and RetentieScan each have a distinct reading order.
- [x] Product-specific interpretation is visible in structure, not only in copy.
- [x] Shared components are limited to justified overlap.

### Validation
- [x] Within one screen the user can tell whether the campaign is ExitScan or RetentieScan.
- [x] The two product flows reflect the meaning of each product correctly.

### Completion notes
- Completed:
  - ExitScan now gets product-specific managementduiding through the exit dashboard view model
  - RetentieScan keeps its richer signaal/profiel/trend/playbook flow, but inside the new hierarchy
  - shared primitives stay shared while interpretation is product-specific
- Still open after this milestone:
  - no in-scope blockers remain
- New follow-up ideas discovered:
  - [ ] consider a future per-role variant if admin and viewer reading order should diverge further

---

## Milestone 4 - RetentieScan Privacy And Interpretation UX
Dependency: Milestone 3

### Tasks
- [x] Define visual and interaction rules that prevent RetentieScan from reading like an individual prediction tool.
- [x] Define stricter placement and gating for sensitive views.
- [x] Define how privacy and interpretation guidance should appear.
- [x] Define minimum-n and suppression UX behavior.
- [x] Define how signal/attention/validation should be visualized.
- [x] Define how trend, profile, and playbook layers simplify when data is thin.

### Definition of done
- [x] RetentieScan has explicit privacy-safe display and interpretation rules.
- [x] Sensitive details are gated consistently.
- [x] Warning copy supports understanding without overwhelming the primary UX.

### Validation
- [x] Planned UI prevents obvious individual-risk interpretation.
- [x] Small-group and low-response behavior is defined for relevant surfaces.

### Completion notes
- Completed:
  - RetentieScan now keeps respondent detail operational while group interpretation remains in the main dashboard layers
  - low-data states stay compact and visibly cautionary
  - methodology/privacy messaging moved lower into a contextual disclosure
- Still open after this milestone:
  - future empirical calibration remains out of scope for this UX pass
- New follow-up ideas discovered:
  - [ ] consider moving segment playbooks to a future dedicated deep-dive screen if needed

---

## Milestone 5 - Campaign Overview And Internal Navigation
Dependency: Milestone 1

### Tasks
- [x] Redefine the campaign overview page as an operating dashboard instead of a card list.
- [x] Group campaigns by meaningful state.
- [x] Use clearer groupings and next-action language.
- [x] Expose next actions directly from overview.
- [x] Surface scan type without clutter.
- [x] Improve internal navigation between overview, setup, dashboard, and report actions.

### Definition of done
- [x] Overview has a clear operational purpose.
- [x] Campaign state and next action are visible without opening every campaign.
- [x] Internal movement between dashboard states is simpler.

### Validation
- [x] A reviewer can identify what to do next for each campaign directly from overview.
- [x] Product type, status, and readiness are visible without overload.

### Completion notes
- Completed:
  - `/dashboard` now behaves as a cockpit with grouped campaign states
  - each campaign row now surfaces response, next action, scan type, and direct dashboard/report actions
  - admin and viewer empty states are calmer and more structured
- Still open after this milestone:
  - no current blockers remain
- New follow-up ideas discovered:
  - [ ] optionally add filters or saved views if campaign volume grows materially

---

## Milestone 6 - Setup Flow, Import Flow, And Onboarding
Dependency: Milestones 1 and 5

### Tasks
- [x] Define the setup lifecycle from create -> import -> preflight -> launch -> monitor.
- [x] Rework onboarding/preflight presentation so setup guidance appears in context.
- [x] Define a clearer UX for campaign creation.
- [x] Keep product-specific setup guidance where needed.
- [x] Make preflight useful early and quieter later.
- [x] Clarify the transition from setup into monitoring and insight states.

### Definition of done
- [x] Setup and analysis feel less mixed together.
- [x] Onboarding is contextual and staged.
- [x] Preflight behaves as a useful checkpoint, not a permanent burden.

### Validation
- [x] The planned setup flow has no dead-end state.
- [x] Users can understand launch prerequisites without opening unrelated areas.

### Completion notes
- Completed:
  - campaign creation form was rewritten with clearer staged copy and product framing
  - preflight checklist was redesigned as a cleaner checkpoint component
  - campaign detail now separates operational launch control from analysis
- Still open after this milestone:
  - `AddRespondentsForm` still works and remains in scope, but was not fully visually rewritten in this pass
- New follow-up ideas discovered:
  - [ ] redesign respondent import/upload flow as a dedicated milestone if setup polish becomes the next priority

---

## Milestone 7 - Component System, Visual Hierarchy, And Responsive Behavior
Dependency: Milestones 2-6

### Tasks
- [x] Define a dashboard visual system for hero, KPI panels, sections, disclosures, warnings, and action blocks.
- [x] Reduce repeated equal-weight bordered cards.
- [x] Define spacing/density rules to separate insight, analysis, and operations.
- [x] Define component boundaries between shared and product-specific layers.
- [x] Define responsive behavior for dense sections.
- [x] Define mobile-first fallbacks for dense dashboard surfaces.

### Definition of done
- [x] The redesign has a clear component and spacing system.
- [x] Shared vs product-specific component boundaries are fixed.
- [x] Mobile behavior is planned for all dense surfaces.

### Validation
- [x] No key dashboard surface was left without a responsive strategy.
- [x] Visual hierarchy now clearly separates primary insight from supporting analysis.

### Completion notes
- Completed:
  - added shared dashboard primitives for hero, sections, disclosures, chips, panels, and key-value blocks
  - reworked recommendations, respondent table, playbooks, and segment playbooks into the new visual system
  - campaign detail and overview now follow the same spacing and hierarchy rules
- Still open after this milestone:
  - no blocking issues remain in the current frontend dashboard scope
- New follow-up ideas discovered:
  - [ ] consider compact tablet-specific chart/table variants if mobile usage grows

---

## Milestone 8 - QA, Accessibility, And Acceptance
Dependency: Milestones 2-7

### Tasks
- [x] Define acceptance outcomes across overview, campaign detail, and setup flow.
- [x] Validate admin/viewer, ExitScan/RetentieScan, low-response and archived states.
- [x] Validate RetentieScan privacy behavior.
- [x] Validate accessibility-significant surfaces.
- [x] Validate responsive behavior.
- [x] Validate lint/build.

### Definition of done
- [x] Acceptance criteria are covered for the main dashboard states.
- [x] QA covers product differences, role differences, privacy behavior, and responsive behavior.
- [x] The redesign is testable milestone by milestone.

### Validation
- [x] `npm.cmd run lint` passed in `frontend`.
- [x] `npm.cmd run build` passed in `frontend`.
- [x] The redesigned dashboard routes compiled successfully with the new product-aware view-model interface.

### Completion notes
- Completed:
  - frontend lint passed
  - frontend production build passed
  - core dashboard surfaces compile with the redesigned hierarchy and product-specific flows
- Still open after this milestone:
  - no additional automated UI tests were added in this pass
- New follow-up ideas discovered:
  - [ ] add UI-level regression coverage for campaign detail disclosures and overview state grouping in a later test milestone

---

## Execution Breakdown By Subsystem

### App IA And Navigation
- [x] Reframe overview as operational cockpit.
- [x] Reframe campaign detail as decision-first page.
- [x] Define explicit hierarchy between summary, deep dive, and operations.
- [x] Tighten internal navigation between setup, analysis, and export.

### Campaign Detail Experience
- [x] Reduce first-read KPI count.
- [x] Move methodology and detail lower or behind disclosure.
- [x] Re-sequence charts, factors, themes, and playbooks.
- [x] Introduce disclosure-based density control.

### Product-Specific Experience
- [x] ExitScan gets a friction/preventability-oriented decision flow.
- [x] RetentieScan gets a cautionary, signal-first, privacy-safe decision flow.
- [x] Shared components remain only where the interaction model overlaps.

### Setup And Lifecycle
- [x] Clarify create -> import -> preflight -> launch -> monitor journey.
- [x] Make onboarding contextual.
- [x] Make preflight useful early and quieter later.

### Tables, Charts, And Deep Dives
- [x] Define which tables stay visible versus secondary.
- [x] Define how charts summarize before detail.
- [x] Define segment/trend/detail panels without overwhelming the page.

### Responsive And Accessibility
- [x] Plan dense-surface fallbacks.
- [x] Improve disclosure/focus hierarchy.
- [x] Keep warnings and privacy messaging understandable on smaller surfaces.

---

## Current UX Risks

### Cross-product risks
- [x] The dashboard no longer behaves primarily like a long report.
- [x] Primary and secondary sections are now visually distinct.
- [x] KPI cards, charts, playbooks, and methodology blocks no longer carry equal visual weight.
- [x] Setup, analysis, and follow-up are more cleanly separated.

### ExitScan risks
- [x] ExitScan now has a more distinct management flow.
- [ ] ExitScan could still benefit later from even richer product-specific visualization beyond the current decision structure.

### RetentieScan risks
- [x] RetentieScan now reads more clearly as a group-level signal product.
- [x] Trend/profile/playbook layers now sit lower in the hierarchy instead of competing with the first read.
- [ ] Segment growth could still pressure page density if future analysis layers expand.

### Privacy and interpretation risks
- [x] RetentieScan respondent detail is operationally present but interpretation remains grouped and cautionary.
- [x] Low-data states now reduce visible depth.
- [ ] Segment detail could still justify a dedicated deep-dive route later if usage grows.

### Mobile and density risks
- [x] Dense surfaces now use disclosure and grouped sections.
- [ ] Very large tables or future segment growth may still justify a later dedicated mobile optimization pass.

---

## Open Questions
- [ ] Should segment playbooks eventually move to a dedicated deep-dive screen if RetentieScan keeps growing?
- [ ] Should admin and viewer eventually get different default disclosure states?
- [ ] Should the respondent import flow get its own dedicated redesign milestone after this dashboard pass?

---

## Follow-up Ideas
- [ ] Add remembered disclosure state per user.
- [ ] Add UI regression tests for overview grouping and campaign detail disclosures.
- [ ] Add a future deep-dive route for segments if the current page becomes too dense again.
- [ ] Add compact tablet variants for charts/tables if usage data supports it.

---

## Out Of Scope For Now
- [ ] Marketing website redesign
- [ ] New products beyond ExitScan and RetentieScan
- [ ] Backend/platform rearchitecture not directly required by dashboard UX
- [ ] Survey UI redesign
- [ ] New analytics or prediction models
- [ ] Major report engine redesign beyond dashboard-related placement and action flow
- [ ] CRM or sales workflow changes outside the app

---

## Defaults Chosen
- [x] One shared dashboard shell remains.
- [x] Campaign detail becomes a decision-first page instead of a report replica.
- [x] Product distinction is visible in structure and priority, not only in copy.
- [x] RetentieScan remains group-level and privacy-cautious in both data display and UX framing.
- [x] Progressive disclosure is preferred over keeping every block fully expanded.
- [x] Campaign overview becomes more operational instead of only more polished.
- [x] Existing frontend product-module boundaries remain the foundation for implementation.
