# Pilot And Manager Action Center Hardening

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` or `superpowers:subagent-driven-development` when implementing these phases. Keep each phase bounded, reviewable, and independently verifiable.

## Goal

Move the now-live dashboard and Action Center from "technically working family" to a mature suite shape where:

- HR / klant werkt vanuit één ingelogde suite-omgeving
- dezelfde shell toegang geeft tot:
  - survey-resultaten / dashboard
  - rapporten
  - Action Center
- managers toegang kunnen krijgen tot alleen hun toegewezen Action Center-werkruimte
- managers geen inzicht krijgen in survey-uitkomsten, metrics of rapporten
- de productfamilie daarna in een kleine live of semireële pilot wordt gevalideerd

## Product And Permission Intent

Treat this as one suite with two modulefamilies:

- **Insights module family**
  - dashboard
  - campaign result pages
  - reports
- **Follow-through module family**
  - Action Center

The mature permission model is **not** "hide one link in the menu."
It is:

1. one shared authenticated suite shell
2. explicit capabilities per user persona
3. module-level access decisions
4. department-scoped Action Center access for manager assignees
5. explicit denied states for out-of-scope routes

## Target Personas

### HR / klant owner

- can view dashboard, campaign pages, reports, and Action Center
- can assign managers to departments
- can create or confirm review moments
- can see cross-department coordination

### HR / klant member/viewer

- can read dashboard and reports per current product truth
- can read Action Center where current role truth allows
- cannot create unrestricted new workflow truth unless explicitly permitted

### Manager assignee

- can access only the Action Center module
- only sees items for assigned departments or assigned follow-through items
- cannot access `/dashboard`, `/reports`, or `/campaigns/[id]`
- can update bounded follow-through states only where explicitly allowed

## Mature Technical Shape

### 1. Shared shell, filtered navigation

Keep one suite shell and one login.
Render navigation from capabilities, not from hardcoded role shortcuts.

- HR / klant owner sees:
  - Overview
  - product routes
  - Reports
  - Action Center
- Manager assignee sees:
  - Action Center
  - possibly a minimal home / landing card
  - no insights navigation

### 2. Separate capability model

Do not overload `org_members.role` alone.
Introduce or formalize an Action Center-specific access layer such as:

- `action_center_workspace_members`
  - `org_id`
  - `user_id`
  - `access_role`
  - `scope_type` (`org`, `department`, `item`)
  - `scope_value`
  - `can_view`
  - `can_update`
  - `can_assign`
  - `can_schedule_review`

This lets Verisight keep:

- dashboard/report access on one axis
- Action Center access on a second axis

That separation is the adult version of the product.

### 3. Department assignment backbone

HR / klant must be able to assign:

- manager X -> department Y

Then Action Center items must resolve:

- relevant department
- current assignee
- review owner
- next review date

### 4. Explicit denied routing

Manager users must not silently hang or half-render on insight routes.

Required behavior:

- `/dashboard` -> denied or reroute to `/action-center`
- `/reports` -> denied
- `/campaigns/[id]` -> denied
- all denied states must be explicit, not indefinite loading states

## Phase Order

### LH-0 Capability and route contract

- freeze the mature target behavior in code and docs
- list personas, capabilities, allowed routes, and denied routes
- define what "same shell, different module visibility" means

### LH-1 Pilot test matrix and seedable scenarios

- create the scenario matrix for:
  - HR owner
  - HR member/viewer
  - manager assignee
  - no-access user
- define expected route outcomes and visible modules

### LH-2 Shared shell persona gating

- refactor navigation and shell access around capabilities
- keep one shell
- make menu visibility persona-driven

### LH-3 Department assignment backbone

- implement or formalize manager-to-department assignment truth
- ensure Action Center items can resolve departmental ownership
- keep it bounded and auditable

### LH-4 Manager-only Action Center workspace

- create the manager path inside the same authenticated environment
- Action Center only
- department-filtered
- no insights module access

### LH-5 Hardening and denied states

- explicit denied / reroute states on out-of-scope routes
- auditability
- owner / reviewer clarity
- no loading dead-ends

### LH-6 Live or semireal pilot round

- observe 2-4 real or semireal flows across:
  - HR owner
  - manager assignee
- validate both:
  - "one suite, two modules"
  - "manager follow-through without insight leakage"

### LH-7 Family closeout

- summarize whether the suite is mature enough on:
  - module access
  - manager assignment
  - Action Center-only manager access
  - route hardening
- identify only the remaining bounded gaps

## Guardrails

- No second app.
- No fake "manager portal" disconnected from the shared suite shell.
- No route hiding as the only protection.
- No broad multi-product rebuild.
- No re-opening of dashboard design truth unless pilot evidence forces it.

## Success Criteria

- HR / klant can use dashboard and Action Center from one suite environment.
- Managers can be assigned to departments.
- Managers can log in and access only the Action Center scope relevant to them.
- Managers cannot access insights or reports.
- Denied states are explicit and calm.
- A pilot confirms the model is operationally logical, not only technically possible.
