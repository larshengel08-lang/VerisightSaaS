# Action Center Pilot Operationalisering Plan

## Goal

Implement a small pilot-operating layer for Action Center that makes onboarding, support, and go / no-go checks easier to run from the current product state.

## Scope

In scope:

- one pilot playbook document
- one pilot readiness checklist document
- one compact readiness section on `beheer/health`
- targeted test coverage for the new readiness surface

Out of scope:

- new route semantics
- new action workflow
- customer-facing training product
- additional write paths

## Steps

1. Write the pilot playbook
- Create a compact doc that explains positioning, onboarding-light, support path, and ownership.

2. Write the pilot readiness checklist
- Turn the roadmap exit criteria into a bounded internal go / no-go checklist.

3. Add pilot-readiness section to admin health
- Surface the playbook and checklist inside the existing health review page with concise supporting copy.

4. Add test coverage
- Extend the health page test so the new readiness section is explicitly asserted.

5. Verify
- Run targeted Vitest
- Run ESLint on touched files
- Run `npm run build`

6. Finish branch
- Commit
- Push
- Open draft PR
- Merge if verification is clean
