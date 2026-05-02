# Action Center Governance and Rights Hardening Plan

## Objective
Execute a focused governance hardening slice for Action Center route-level writes without expanding scope into a full permissions redesign.

## Task 1: Unify HR/admin write resolution
- Add a shared governance helper that resolves whether a user can perform HR/admin route writes for a given org.
- Preserve exact resolved audit roles instead of flattening everything to generic `hr`.

Verification:
- helper-level tests cover admin, org owner, workspace HR member, and denied access

## Task 2: Align closeout and reopen writes
- Update route closeout API to use the shared helper.
- Update route reopen API to use the shared helper.
- Persist the resolved governance role into `closed_by_role` and `reopened_by_role`.
- Ensure route projections still accept legacy values for compatibility.

Verification:
- closeout tests cover denied actor, org-owner actor, and workspace `hr_member`
- reopen tests cover denied actor, org-owner actor, and workspace `hr_member`

## Task 3: Align follow-up write audit truth
- Update follow-up route trigger API to use the same shared resolver.
- Persist `recorded_by_role` as the exact resolved role.
- Keep the cross-org and scope-safety fixes intact from earlier waves.

Verification:
- follow-up tests prove `hr_member` and `hr_owner` persistence
- no existing follow-up trust regressions

## Task 4: Add repo-side SQL compatibility patch
- Add a dedicated SQL patch file that broadens role-check constraints for route-governance tables to include:
  - `verisight_admin`
  - `hr_owner`
  - `hr_member`
- Keep legacy compatibility values accepted where runtime still reads them.

Verification:
- patch is idempotent and scoped only to route-governance role constraints

## Task 5: Verify and package Wave 4
- Run focused API/helper tests.
- Run ESLint on touched files.
- Run `npm run build`.
- Commit on the isolated governance branch.
- Push and open a draft PR.

Stop conditions:
- repeated failing verification without a clear local fix
- incompatible schema assumptions that require product decisions
