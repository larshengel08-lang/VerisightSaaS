# Loep Culture Assessment Design

**Date:** 2026-05-17  
**Status:** implementation-ready design spec (pre-build)  
**Original brainstorm direction:** approved  
**English product name:** Loep Culture Assessment  
**Dutch product name:** Loep Cultuurbeeld  
**Primary index name:** Loep Culture Index / Loep Cultuurindex

---

## 1. Purpose

`Loep Culture Assessment` / `Loep Cultuurbeeld` is a new **primary enterprise route** inside the existing Loep/Verisight portfolio.

It is designed as:

- a yearly broad culture and engagement baseline
- a board- and executive-readable primary route
- a premium report-led product with governed drilldown
- a route for broad organization-wide questions, not a narrow follow-on measurement

It is explicitly **not**:

- a RetentieScan variant
- a Pulse route
- a TeamScan route
- a manager ranking tool
- a self-serve survey platform

The route must be strong enough to function as a standalone annual primary route, while still leaving room for later governed follow-on motion such as `Pulse`.

---

## 2. Product Identity

```yaml
product_identity:
  brand: "Loep"
  product_id: "culture_assessment"
  product_name: "Loep Culture Assessment"
  dutch_name: "Loep Cultuurbeeld"
  route_type: "primary_route"
  default_delivery_model: "annual_enterprise_baseline"
  primary_buyer: "board_executive"
  implementation_partner: "hr"
```

Implementation rule:

- use `culture_assessment` as the canonical internal identifier for route, campaign, report, dashboard, and export mapping
- do not reuse `retention`, `pulse`, `team`, or other existing route identifiers for this product

---

## 3. Management Question

Canonical management question:

> "Welke brede cultuur- en engagementpatronen vragen op organisatieniveau bestuurlijke aandacht, en waar zitten de belangrijkste verschillen tussen onderdelen van de organisatie?"

This question is the top-level route selector and should anchor:

- buyer-facing route framing
- dashboard executive view
- board-read agenda
- report introductions
- sales routing

---

## 4. Product Boundaries

```yaml
product_boundaries:
  not_retention_scan: true
  not_pulse: true
  not_team_scan: true
  not_manager_ranking: true
  not_self_serve_survey_platform: true
  not_benchmark_first: true
  not_individual_monitoring: true
  no_causal_claims: true
  no_individual_predictions: true
```

Boundary interpretation:

- the route may show broad culture and engagement patterns, but must not present itself as a retention predictor
- the route may support later review rhythm, but is not itself a repeat rhythm product
- the route may offer drilldown, but drilldown is never a ranking product
- the route may become benchmark-ready later, but benchmark is not active in v1
- the route may produce descriptive board attention points, but not causal diagnosis

---

## 5. Canonical Product Relation

`Loep Culture Assessment` becomes a new primary route and must be canonically differentiated from the rest of the suite.

| Product | Canonical role | What it answers | What it is not |
| --- | --- | --- | --- |
| `Loep Culture Assessment` | primary route | broad annual culture and engagement baseline across the organization | not retention-first, not pulse, not local-only verification |
| `ExitScan` | primary route | departure patterns and retrospective exit signals | not a broad annual culture baseline |
| `RetentieScan` | primary route | retention pressure and active-population signals | not a broad culture baseline |
| `TeamScan` | bounded/local route | local verification after an existing signal | not an organization-wide primary route |
| `Onboarding 30-60-90` | bounded peer route | early landing of new employees | not a broad culture route |
| `Pulse` | follow-on route | repeat review or re-measurement after a baseline or action | not the primary annual baseline |
| `Leadership Scan` | follow-on bounded route | management-context read after an existing signal | not a ranking instrument and not a broad culture baseline |

Route hierarchy rule:

- `Loep Culture Assessment` joins `ExitScan` and `RetentieScan` as a primary route
- `Pulse` remains a follow-on route
- `TeamScan`, `Onboarding 30-60-90`, and `Leadership Scan` remain bounded routes with narrower jobs

---

## 6. Product Role Inside Loep

`Loep Culture Assessment` is the primary Loep route when the question is broad, organization-wide, and centered on culture, engagement, trust, collaboration, leadership context, and work experience.

Use this route when the buyer wants:

- a yearly broad baseline
- an organization-wide read
- strong executive output
- differences between locations, departments, teams, or governed manager layers

Do not collapse this route into:

- retention signal logic
- pulse rhythm logic
- local validation logic
- manager evaluation logic

---

## 7. Delivery Model

### 7.1 Default delivery

```yaml
default_delivery:
  model: "annual_enterprise_baseline"
  collection_mode: "organization_wide_census"
  output_core:
    - "board_report_pdf"
    - "board_read_session"
    - "executive_dashboard_view"
    - "governed_segment_views"
```

### 7.2 Follow-on motion

```yaml
follow_on_motion:
  pulse_allowed_after_baseline: true
  pulse_part_of_baseline: false
  benchmark_part_of_baseline: false
```

### 7.3 Survey shape

```yaml
instrument_shape:
  default_model: "enterprise"
  lighter_optional_model_allowed_later: true
  questionnaire_modular_by_default: false
```

Interpretation:

- the enterprise model is the default commercial package
- a lighter `volwaardig` package may be introduced later
- v1 must not add a survey builder or client-configurable module system

---

## 8. Domain Model

The route uses one fixed domain model for v1. These domains are implementation-facing and must be stable across report, dashboard, export, and acceptance logic.

```yaml
domain_model:
  - id: "engagement_involvement"
    label_nl: "Betrokkenheid en inzet"
    label_en: "Engagement and involvement"
    short_description: "Mate van actieve betrokkenheid, energie en bereidheid om zich in te zetten voor het werk en de organisatie."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "trust_psychological_safety"
    label_nl: "Vertrouwen en psychologische veiligheid"
    label_en: "Trust and psychological safety"
    short_description: "Mate waarin medewerkers vertrouwen ervaren, zich veilig voelen om zich uit te spreken en spanningen bespreekbaar zijn."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "leadership_direction"
    label_nl: "Leiderschap en richting"
    label_en: "Leadership and direction"
    short_description: "Mate van ervaren richting, bestuurlijke helderheid en vertrouwen in aansturing en besluitvorming."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "collaboration_alignment"
    label_nl: "Samenwerking en afstemming"
    label_en: "Collaboration and alignment"
    short_description: "Mate waarin samenwerking, onderlinge afstemming en verbinding tussen teams of onderdelen werkbaar en effectief zijn."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "workload_capacity"
    label_nl: "Werkdruk en draagkracht"
    label_en: "Workload and capacity"
    short_description: "Mate waarin werkbelasting, volhoudbaarheid en ervaren ruimte in balans zijn."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "autonomy_role_clarity"
    label_nl: "Autonomie en rolhelderheid"
    label_en: "Autonomy and role clarity"
    short_description: "Mate waarin medewerkers ruimte ervaren om hun werk goed te doen en begrijpen wat er van hun rol verwacht wordt."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "growth_development"
    label_nl: "Groei en ontwikkeling"
    label_en: "Growth and development"
    short_description: "Mate waarin medewerkers ontwikkelkansen, feedback en perspectief ervaren."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "change_readiness"
    label_nl: "Veranderbereidheid"
    label_en: "Change readiness"
    short_description: "Mate waarin de organisatie en haar medewerkers veranderingen kunnen dragen, volgen en omzetten in werkbare praktijk."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "reward_conditions"
    label_nl: "Beloning en voorwaarden"
    label_en: "Reward and conditions"
    short_description: "Mate waarin arbeidsvoorwaarden, beloningsbeleving en randvoorwaarden als werkbaar en eerlijk worden ervaren."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
  - id: "organizational_connection_intent"
    label_nl: "Organisatieverbinding en intentie"
    label_en: "Organizational connection and intent"
    short_description: "Mate van verbondenheid met de organisatie, de bereidheid om te blijven en de ervaren aansluiting bij missie en context."
    score_direction: "higher_is_more_favorable_pattern"
    visible_in_executive_view: true
    visible_in_hr_view: true
```

Implementation rule:

- do not ship a reduced or renamed domain list in v1 without explicit spec update
- all domain identifiers must be available across backend, frontend, demo data, report generation, and tests

---

## 9. Culture Index

```yaml
culture_index:
  id: "culture_index"
  label_en: "Loep Culture Index"
  label_nl: "Loep Cultuurindex"
  type: "navigation_signal"
  is_total_judgment: false
  supports_individual_reading: false
  supports_causal_claims: false
```

Canonical copy:

> De Loep Culture Index is een navigatiesignaal voor het organisatiebeeld. De index is geen eindoordeel over cultuur, geen individuele beoordeling en geen bewijs van oorzaak-gevolg. Lees de index altijd samen met domeinen, segmentpatronen, responsbasis en governancegrenzen.

Implementation rule:

- never label the index as a health score
- never label the index as a final culture verdict
- never use the index as a ranking header

---

## 10. Thresholds

```yaml
thresholds:
  organization_min_n: 30
  location_min_n: 10
  department_min_n: 10
  team_min_n: 8
  function_group_min_n: 10
  manager_named_min_n: 15
  open_text_cluster_min_n: 5
  pattern_analysis_min_n: 30
  segment_comparison_min_n: 10
```

Threshold rules:

- below minimum `n`, results must not render as visible result content
- below segment threshold, segment views must suppress or collapse
- named manager layer is stricter than all standard segment layers
- open text must not render raw cluster output under `open_text_cluster_min_n`

---

## 11. Roles and Visibility Rules

```yaml
roles:
  - executive
  - hr_partner
  - business_unit_lead
  - manager_limited
  - admin
```

```yaml
visibility_rules:
  executive:
    sees:
      - board_overview
      - executive_culture_read
      - culture_index
      - board_attention_points
      - domain_overview
      - approved_segment_contrasts
      - report_status
    does_not_see:
      - ranking_tables
      - named_manager_layer
      - raw_open_text
      - respondent_level_exports
  hr_partner:
    sees:
      - board_overview
      - executive_culture_read
      - culture_index
      - domain_overview
      - pattern_analysis
      - approved_segment_contrasts
      - governed_drilldown
      - report_status
      - export_status
    does_not_see_by_default:
      - named_manager_layer
      - respondent_level_exports
  business_unit_lead:
    sees:
      - safe_business_unit_overview
      - safe_subsegment_views
      - relevant_domain_patterns
      - report_status_when_scoped
    does_not_see:
      - organization_wide_hr_analysis
      - cross_unit_hidden_segments
      - named_manager_layer
      - raw_open_text
  manager_limited:
    sees:
      - own_safe_aggregate_layer
      - own_team_visible_domains_when_threshold_met
      - safe_follow_up_summary
    does_not_see:
      - cross_org_segments
      - hidden_threshold_segments
      - named_manager_layer
      - raw_open_text
      - ranking_views
  admin:
    sees:
      - configuration
      - field_status
      - export_status
      - report_generation_status
      - threshold_and_governance_flags
    does_not_see_by_default:
      - analytical_board_read
      - named_manager_layer
      - respondent_level_content
```

Named manager layer rule:

```yaml
named_manager_layer:
  default_state: "locked"
  visible_by_default: false
  requires_governance_approval: true
  requires_threshold: "manager_named_min_n"
```

---

## 12. State Mapping

The following states are canonical for dashboard, report gating, and empty-state behavior.

```yaml
state_mapping:
  - collecting_responses
  - insufficient_response
  - results_available
  - segment_suppressed
  - manager_layer_locked
  - open_text_disabled
  - open_text_suppressed
  - report_generating
  - report_available
  - benchmark_not_available
```

### 12.1 `collecting_responses`

```yaml
state_id: "collecting_responses"
when_this_applies: "Campaign is live and minimum thresholds are not yet reached for full organization result release."
visible_components:
  - response_coverage
  - report_export_methodology
hidden_components:
  - executive_culture_read
  - culture_index
  - board_attention_points
  - domain_view
  - pattern_view
  - segment_contrasts
  - drilldown_layers
  - open_signals
user_message: "Responses are still being collected. Results will appear once the minimum response base is reached."
primary_action: "Monitor response coverage"
secondary_action: "Send reminder or review collection progress"
privacy_reason_required: false
```

### 12.2 `insufficient_response`

```yaml
state_id: "insufficient_response"
when_this_applies: "Collection has ended or paused without reaching organization_min_n or another required release threshold."
visible_components:
  - response_coverage
  - report_export_methodology
hidden_components:
  - executive_culture_read
  - culture_index
  - board_attention_points
  - domain_view
  - pattern_view
  - segment_contrasts
  - drilldown_layers
  - open_signals
user_message: "There are not enough responses to release safe organization-wide results."
primary_action: "Review whether an additional response round is possible"
secondary_action: "Escalate to HR partner for release decision"
privacy_reason_required: true
```

### 12.3 `results_available`

```yaml
state_id: "results_available"
when_this_applies: "Organization-wide thresholds are met and the route is cleared for executive and HR reading."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - board_attention_points
  - domain_view
  - pattern_view
  - board_read_follow_on
  - report_export_methodology
hidden_components: []
user_message: "Organization-wide results are available."
primary_action: "Review executive culture read"
secondary_action: "Prepare board-read session"
privacy_reason_required: false
```

### 12.4 `segment_suppressed`

```yaml
state_id: "segment_suppressed"
when_this_applies: "One or more requested segment views are below threshold or unsafe to show."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - board_attention_points
  - domain_view
  - pattern_view
hidden_components:
  - segment_contrasts
  - suppressed_drilldown_layers
user_message: "Some segment views are hidden because the response base is too small or not safe enough to display."
primary_action: "Review visible organization-level and safe segment patterns"
secondary_action: "Check governance and threshold status"
privacy_reason_required: true
```

### 12.5 `manager_layer_locked`

```yaml
state_id: "manager_layer_locked"
when_this_applies: "Named manager layer is not approved, not threshold-safe, or intentionally disabled."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - domain_view
hidden_components:
  - manager_named_layer
user_message: "Named manager detail is locked in this route by default."
primary_action: "Use safe aggregate layers instead"
secondary_action: "Request governance review if justified"
privacy_reason_required: true
```

### 12.6 `open_text_disabled`

```yaml
state_id: "open_text_disabled"
when_this_applies: "Open text was not enabled for this campaign."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - domain_view
hidden_components:
  - open_text_appendix
user_message: "Open text is not part of this assessment."
primary_action: "Use structured domain and pattern views"
secondary_action: "None"
privacy_reason_required: false
```

### 12.7 `open_text_suppressed`

```yaml
state_id: "open_text_suppressed"
when_this_applies: "Open text exists but cannot be safely shown because clustering or privacy thresholds are not met."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - domain_view
hidden_components:
  - open_text_appendix
user_message: "Open text is hidden because it cannot yet be clustered and displayed safely."
primary_action: "Use structured findings instead"
secondary_action: "Review privacy-safe clustering status"
privacy_reason_required: true
```

### 12.8 `report_generating`

```yaml
state_id: "report_generating"
when_this_applies: "Report pipeline has started but PDF outputs are not yet ready."
visible_components:
  - response_coverage
  - report_export_methodology
hidden_components:
  - board_report_pdf
  - hr_appendix_pdf
user_message: "Reports are being generated."
primary_action: "Wait for report availability"
secondary_action: "Check generation status"
privacy_reason_required: false
```

### 12.9 `report_available`

```yaml
state_id: "report_available"
when_this_applies: "Report outputs are generated and approved for release."
visible_components:
  - response_coverage
  - executive_culture_read
  - culture_index
  - board_attention_points
  - domain_view
  - pattern_view
  - report_export_methodology
  - board_report_pdf
  - hr_appendix_pdf
hidden_components: []
user_message: "Reports are available."
primary_action: "Open report output"
secondary_action: "Schedule or review board-read session"
privacy_reason_required: false
```

### 12.10 `benchmark_not_available`

```yaml
state_id: "benchmark_not_available"
when_this_applies: "The route is running in v1 mode where benchmark is intentionally inactive."
visible_components:
  - benchmark_panel_inactive_state
hidden_components:
  - benchmark_comparisons
  - benchmark_rankings
  - peer_tables
user_message: "Benchmark is not available in this version of the route."
primary_action: "Use own-organization patterns and segment contrasts"
secondary_action: "None"
privacy_reason_required: false
```

---

## 13. Canonical Block Order

The fixed page / dashboard / report order is:

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

Implementation rule:

- do not reorder these blocks in the executive route without explicit design change
- empty states may suppress blocks, but must not invent an alternative block sequence

---

## 14. Claims and Method Copy

```yaml
allowed_claims:
  - "Broad annual culture and engagement baseline"
  - "Board-level organization picture"
  - "Descriptive attention points based on visible patterns"
  - "Governed drilldown where thresholds and roles allow it"
  - "Optional follow-on pulse rhythm after the annual baseline"
```

```yaml
forbidden_claims:
  - "cultuur is goed/slecht"
  - "manager X functioneert slecht"
  - "dit verklaart oorzaak-gevolg"
  - "individuele voorspellingen"
  - "benchmarkclaims in v1"
```

```yaml
privacy_disclaimers:
  - "Results are shown only when minimum response thresholds are met."
  - "Hidden segments do not indicate absence of signal; they indicate insufficient safe display basis."
  - "Named manager detail is not part of the default route and remains governance-locked."
```

```yaml
open_text_rules:
  - "Open text is optional, not default."
  - "Open text is only shown when clustering and privacy thresholds are met."
  - "Open text must be anonymized and clustered."
  - "Raw respondent comments must not render in executive or manager-limited views."
```

```yaml
manager_layer_rules:
  - "Named manager layer is locked by default."
  - "Named manager layer requires governance approval."
  - "Named manager layer requires manager_named_min_n."
  - "No manager ranking, leaderboard, or health label is allowed."
```

```yaml
benchmark_rules:
  - "Benchmark is not active in v1."
  - "Benchmark UI may show an inactive state only."
  - "No cross-client, peer, or ranking benchmark claims may be shown in v1."
```

---

## 15. Exports

```yaml
exports:
  - board_report_pdf
  - hr_appendix_pdf
  - segment_summary_export
  - open_text_appendix_when_enabled
  - no_individual_data_export
```

Export interpretation:

- `board_report_pdf` is the executive-safe primary report
- `hr_appendix_pdf` may include additional governed detail
- `segment_summary_export` must remain aggregate and threshold-safe
- `open_text_appendix_when_enabled` must respect open text clustering and suppression rules
- individual respondent data export is forbidden in this route

---

## 16. Portfolio Canon Impact

`Loep Culture Assessment` / `Loep Cultuurbeeld` becomes a **new primary route**.

This changes the current product hierarchy from:

- primary routes: `ExitScan`, `RetentieScan`

to:

- primary routes: `ExitScan`, `RetentieScan`, `Loep Culture Assessment`

This does **not** change:

- `Pulse` remains a follow-on route
- `TeamScan` remains a local verification route
- `Onboarding 30-60-90` remains a bounded peer route
- `Leadership Scan` remains a bounded management-context route

Later documents and app surfaces that must be updated after this spec is approved:

- strategy
- roadmap
- product navigation
- pricing
- website product cards
- sales routing
- dashboard routes
- report templates

Implementation note:

- this spec does not itself update those documents or routes
- it defines the canonical target they must later align to

---

## 17. Commercial Packaging

### 17.1 Canonical packages

```yaml
commercial_packaging:
  - package_id: "culture_assessment_baseline"
    label: "Culture Assessment Baseline"
    includes:
      - "annual enterprise survey baseline"
      - "executive dashboard view"
      - "board-safe aggregate output"
    excludes:
      - "board-read session"
      - "governed deep drilldown"
      - "pulse rhythm"
  - package_id: "culture_assessment_board_read"
    label: "Culture Assessment + Board Read"
    includes:
      - "annual enterprise survey baseline"
      - "executive dashboard view"
      - "board report pdf"
      - "board-read session"
    excludes:
      - "governed deep drilldown"
      - "pulse rhythm"
  - package_id: "culture_assessment_governed_drilldown"
    label: "Culture Assessment + Governed Drilldown"
    includes:
      - "annual enterprise survey baseline"
      - "executive dashboard view"
      - "board report pdf"
      - "board-read session"
      - "approved segment contrasts"
      - "governed drilldown"
    excludes:
      - "pulse rhythm"
  - package_id: "culture_assessment_pulse_rhythm"
    label: "Culture Assessment + Pulse Rhythm"
    includes:
      - "annual enterprise survey baseline"
      - "board-read session"
      - "pulse follow-on after baseline"
    excludes:
      - "pulse as part of initial baseline"
```

Packaging rule:

- `Pulse` is not part of the baseline package by default
- `Pulse` is a follow-on after the annual culture assessment baseline

---

## 18. Board-Read Session Model

The board-read is a canonical product component, not an optional facilitation afterthought.

### 18.1 Goal

- structure the executive reading of the culture baseline
- identify first board-level attention points
- determine what follow-up, if any, should happen after the annual baseline

### 18.2 Participants

- board / executive participants
- HR partner
- optional sponsor or people lead
- no broad manager audience by default

### 18.3 Preparation

- response base and governance status verified
- executive report ready
- hidden segments and suppression reasons clearly marked
- no unresolved privacy exceptions

### 18.4 Fixed agenda

1. Response base and measurement coverage
2. Executive culture read
3. Loep Culture Index
4. Domain view
5. Board attention points
6. Segment contrasts and governed deepening
7. Follow-up route discussion

### 18.5 Decisions the session should enable

- which broad organization-wide patterns deserve first board attention
- where further governed drilldown is justified
- whether a follow-on `Pulse` rhythm is appropriate
- whether another Loep route is required for a narrower follow-up question

### 18.6 What explicitly does not happen

- no free score interpretation theater
- no manager ranking
- no causal diagnosis
- no individual-level inference

---

## 19. Sales Routing Logic

Use `Loep Culture Assessment` when the question is broad and organization-wide and primarily concerns:

- culture
- engagement
- work experience
- trust
- leadership context
- collaboration

Use `RetentieScan` when the primary question is:

- retention pressure
- active-population risk
- stay intent
- departure intention

Use `ExitScan` when the primary question is:

- retrospective departure patterns
- exit reasons
- historical loss signals

Use `TeamScan` when:

- there is already an existing signal
- local verification is needed
- the question is not broad enough for an organization-wide primary route

Use `Pulse` when:

- an existing baseline already exists
- a prior action must be reviewed or repeated
- the customer wants re-measurement or review rhythm rather than a new broad annual baseline

Routing rule:

- do not route broad culture and engagement questions into `RetentieScan` or `Pulse`
- do not route narrow local verification into `Loep Culture Assessment`

---

## 20. Output Architecture

The route must end in a report-led, board-readable output package rather than a dashboard dump.

Canonical outputs:

- executive culture read
- Loep Culture Index
- board attention points
- domain picture
- pattern view
- segment contrasts
- governed deepening layers
- open signals where enabled and safe
- board-read and follow-on motion
- report, export, and methodology layers

Implementation rule:

- executive view must privilege narrative structure over ranking structure
- if a component is suppressed, show a deterministic state reason rather than a broken empty block

---

## 21. Build Acceptance Criteria

The following criteria are hard acceptance rails for v1:

- results are not visible under minimum `n`
- segments are suppressed under threshold
- manager layer is standard locked
- open text appears only clustered and safe
- benchmark UI shows v1 inactive state
- executive view shows no ranking tables
- export contains no individual respondent data
- Culture Index is never described as a total judgment or health score

Additional acceptance rules:

- hidden components must have deterministic suppression reasons where relevant
- state behavior must match the canonical `state_mapping`
- route labeling must remain `primary_route`

---

## 22. Technical Impact Checklist

This spec implies future implementation work across the following checklist:

```yaml
technical_impact_checklist:
  route_enum:
    required: true
    target: "Add culture_assessment as canonical route id"
  product_type_enum:
    required: true
    target: "Add primary product type mapping for culture_assessment"
  campaign_type:
    required: true
    target: "Support annual enterprise baseline campaign type"
  dashboard_route:
    required: true
    target: "Add primary dashboard route / executive read for culture_assessment"
  report_type:
    required: true
    target: "Add board report and HR appendix routing"
  pdf_template:
    required: true
    target: "Create culture assessment PDF templates"
  role_visibility:
    required: true
    target: "Implement role-based visibility rules from this spec"
  seed_demo_data:
    required: true
    target: "Add demo content for executive, segment, suppressed, and locked states"
  tests:
    required: true
    target: "Add route, threshold, state, export, and role visibility tests"
  empty_states:
    required: true
    target: "Add deterministic collecting/insufficient/suppressed/locked/inactive states"
  export_permissions:
    required: true
    target: "Gate exports by role and suppress respondent-level data"
```

---

## 23. Build Scope Guardrail

Codex must **not** add any of the following as part of this spec implementation pass:

- a new survey builder
- a benchmark engine
- a billing layer
- self-service onboarding
- a manager performance module

This design task is only to make the spec implementation-ready for the new primary route.

---

## 24. Do Not Overbuild

Implementation derived from this spec must stay bounded to:

- route definition
- role visibility
- threshold and state logic
- dashboard and report structure
- governed exports
- packaging and routing readiness

It must not invent adjacent platform scope.

---

## 25. Final Recommendation

Proceed with `Loep Culture Assessment` / `Loep Cultuurbeeld` as a new primary enterprise route that:

- owns the yearly broad culture and engagement baseline
- stays clearly separate from `RetentieScan`, `Pulse`, `TeamScan`, and ranking logic
- gives executives a governed, board-readable organization picture
- allows later follow-on motion such as `Pulse` without making that follow-on part of the baseline
- remains benchmark-inactive and privacy-safe in v1
