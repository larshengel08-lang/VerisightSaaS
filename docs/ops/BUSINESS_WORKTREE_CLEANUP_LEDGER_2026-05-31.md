# Business Worktree Cleanup Ledger

Date: 2026-05-31

Purpose: first conservative triage of the Business workspace mess without touching live Loep functionality.

Safety rule: when in doubt, keep it. Nothing in this ledger should be deleted just because it is listed here.

Status labels:
- `KEEP_ACTIVE`: dirty or clearly active; do not touch
- `KEEP_FOR_NOW`: clean, but still unique or not understood well enough
- `ARCHIVE_CANDIDATE`: clean and likely superseded or low-risk to move to `D:` first
- `LOW_PRIORITY_DELETE_CANDIDATE`: clean, small, and apparently already represented elsewhere; only after explicit confirmation

Decision rules used:
- Dirty tracked changes always win over size concerns.
- Registered worktrees are treated as higher risk than ordinary folders.
- If a candidate commit is already contained by `main`, that is strong evidence a newer or equivalent live line exists.
- If a candidate is not contained by `main`, it is treated as unique until proven otherwise.

## Global picture

- Main repo: `C:/Users/larsh/Desktop/Business/Verisight`
- Registered worktrees from the Verisight repo: about 252
- Under `Verisight/.worktrees`: about 240
- Detached worktrees: about 21
- Worktrees or copies with tracked changes: about 20

Implication:
- The real problem is state sprawl, not just disk usage.
- Do not clean inside `Verisight/.worktrees` in bulk.
- First reduce the dirty set and classify root-level copies.

## First-wave candidates

| Path | Type | Size | Branch / state | What it is | Why it exists | Live / newer version signal | Conservative label | Reasoning |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| `C:/Users/larsh/Desktop/Business/Verisight` | main repo | n/a | `codex/add-enps-exit-retention`, dirty tracked `98` | Primary Loep codebase | Current main working repo | This is the live code root, not a copy | `KEEP_ACTIVE` | Never clean this while it is dirty. |
| `C:/Users/larsh/Desktop/Business/content-machine` | independent repo | `0.8 MB` | `feat/verisight-blog-content-machine`, dirty tracked `2` | Separate content/blog publishing repo | Built for blog publish packages | Independent of the main repo; no evidence of superseding line | `KEEP_ACTIVE` | Dirty and separate purpose. Not a cleanup target. |
| `C:/Users/larsh/Desktop/Business/outreach` | independent repo | `0.2 MB` | `master`, clean | Separate outreach utility repo | Last commit: `feat: add CSV import tab for Apollo.io manual exports` | No direct evidence it affects live Loep runtime | `KEEP_FOR_NOW` | Tiny and separate. No space benefit worth the risk right now. |
| `C:/Users/larsh/Desktop/Business/verisight-insight-hub-review` | independent repo | `1.3 MB` | `main`, clean | Separate review/publish repo | Last commit: `Update site info for publish` | Unclear relation to current live setup | `KEEP_FOR_NOW` | Clean, but purpose not yet clear enough to archive. |
| `C:/Users/larsh/Desktop/Business/Verisight_enps_main_release` | registered worktree copy | `582 MB` | `codex/enps-main-release`, clean | eNPS release line for Exit/Retention | Created to carry the standalone eNPS rollout | Head `9c017dd` is already contained by `main`, but recency and release-role still matter | `KEEP_FOR_NOW` | Git-topology alone is not enough. If this worktree was created very recently as a release/validation line, it should not be archived until its operational role is explicitly closed. |
| `C:/Users/larsh/Desktop/Business/Verisight_enps_publish` | registered worktree copy | `13.6 MB` | `codex/add-enps-exit-retention-clean`, clean | Clean publish-oriented eNPS line | Created as a cleaner version of the eNPS work | Same last commit subject as `Verisight_enps_main_release`, but head `73b1bdc` is not contained by `main` | `KEEP_FOR_NOW` | Likely related duplicate, but not safe enough to assume obsolete. |
| `C:/Users/larsh/Desktop/Business/Verisight-action-center-teams` | registered worktree copy | `573.8 MB` | `feat/action-center-teams-page`, clean | Action Center teams scope branch | Created for teams page / scope view work | Head `07e87e6` is not contained by `main` | `KEEP_FOR_NOW` | Unique feature branch, not obviously superseded. |
| `C:/Users/larsh/Desktop/Business/Verisight-pr-action-center-manager` | registered worktree copy | `1020.4 MB` | `codex/action-center-manager-notify-hotfix`, dirty tracked `2` | Manager notification hotfix line | Created for Action Center manager notify fix | Head not shown as contained by `main`; still dirty | `KEEP_ACTIVE` | Dirty tracked worktree copy. Must be resolved, not cleaned. |
| `C:/Users/larsh/Desktop/Business/wt-rescopy` | registered worktree copy | `1094.2 MB` | `feat/results-copy-map-rollout`, clean | Results copy rollout branch | Created for copy-map / results wording rollout | Head `9b60b2f` is contained by `main` | `ARCHIVE_CANDIDATE` | Good candidate to archive because main already contains that head. |
| `C:/Users/larsh/Desktop/Business/tmp/review-3685c49` | registered temp worktree | `11.7 MB` | detached HEAD, clean | Review workspace | Created for review/fix cycle; last commit `Finalize Action Center action-card contract` | Head `3685c49` is contained by `main` | `LOW_PRIORITY_DELETE_CANDIDATE` | Small, detached, clean, and represented in main. Safe later, but low urgency. |
| `C:/Users/larsh/Desktop/Business/tmp/review-task1-22d8990` | registered temp worktree | `11.7 MB` | detached HEAD, clean | Review task workspace | Created for review findings pass; last commit `Address Task 1 code review findings` | Head `22d8990` is contained by `main` | `LOW_PRIORITY_DELETE_CANDIDATE` | Same reasoning as above. Small and low-risk, but no hurry. |
| `C:/Users/larsh/Desktop/Business/Worktrees/Verisight_insights_seo_structure` | registered worktree copy | `896.8 MB` | `codex/insights-seo-structure`, clean | SEO / insights structure branch | Created for insights page lead-qualification work | Head `35704d8` is not contained by `main` | `KEEP_FOR_NOW` | Large, but unique. Do not archive until value is understood. |
| `C:/Users/larsh/Desktop/Business/Worktrees/Verisight_motion_graphic_split` | registered worktree copy | `8.5 MB` | `codex/motion-graphic-split`, clean | Motion-graphic / homepage animation split line | Created to split homepage motion into phases | Head `2d111e0` is contained by `main` and many later branches | `ARCHIVE_CANDIDATE` | Strong evidence of superseding branches and a main-contained head. Good archive candidate. |
| `C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation` | registered worktree copy | `630.6 MB` | `codex/mto-track-foundation`, clean | MTO/engagement foundation branch | Created for MTO track groundwork | Head `ed7a55a` is not contained by `main` | `KEEP_FOR_NOW` | Unique and background-track oriented. Not safe to collapse yet. |

## Dirty set that blocks cleanup

These are not cleanup candidates. They must be resolved into one of: commit, export patch, merge, or intentional discard.

- `C:/Users/larsh/Desktop/Business/Verisight` - dirty tracked `98`
- `C:/Users/larsh/Desktop/Business/Verisight-pr-action-center-manager` - dirty tracked `2`
- `C:/Users/larsh/Desktop/Business/content-machine` - dirty tracked `2`

There are also multiple dirty worktrees inside `Verisight/.worktrees`, including:
- `onboarding-route-readiness`
- `homepage-offwhite-onboarding`
- `pulse-shell-correction`
- `loveable-homepage-clone`
- `homepage-visual-refinement-pass`
- `leadership-shell-correction`
- `pulse-pdf-open`

Those should be triaged later, but not touched during disk cleanup.

## Dirty worktree triage - pass 1

This section exists because a filename alone is not enough. For each dirty candidate below:
- what kind of work is inside
- why it likely exists
- whether it looks like a focused product slice or a broad mixed workspace
- what the safest next move is

| Path | Dirty count | What it appears to be | Evidence from changed files | Safe interpretation | Next action |
| --- | ---: | --- | --- | --- | --- |
| `C:/Users/larsh/Desktop/Business/Verisight` | 99 | The current central Stream A workspace with mixed eNPS + report + product-copy work | Exit/Retention definitions, scoring, schemas, reports, plus many sales/reference docs all changed together | This is the current gravity well. It is too broad to clean and too broad to understand as one unit. | Split by theme before any cleanup: eNPS/data, report output, commercial docs. Treat as priority stabilization target. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/onboarding-route-readiness` | 43 | A mixed onboarding route + commercial site positioning workspace | Onboarding report content, schemas, many active strategy docs, homepage, aanpak, product pages | Not a narrow codefix. This looks like a hybrid of onboarding product work and site/commercial reframing. | Keep. Later decide whether this should be collapsed into a docs-only branch plus a separate frontend branch. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/homepage-offwhite-onboarding` | 36 | A broad shell/marketing/dashboard polish workspace | Auth pages, dashboard pages, contact flow, globals, kennismaking, API routes all changed | High blast radius. This is not a single feature; it is a visual/shell pass crossing public + dashboard + auth. | Keep. Needs explicit “is this still active?” decision before any cleanup. If not active, export patch before archiving. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/pulse-shell-correction` | 14 | Pulse product/detail/dashboard correction workspace | Pulse definition, Pulse dashboard, product pages, tests, e2e | Focused and product-specific. This is a coherent technical slice, not random leftovers. | Keep for now. Candidate for “finish or freeze,” not cleanup. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/loveable-homepage-clone` | 12 | Homepage / pricing / approach redesign experiment | Homepage, tarieven, aanpak, marketing components, site content, wordmarks | This looks like a public-site concept branch, likely exploratory. | Keep for now. Good candidate later for patch export + archive if superseded by newer homepage work. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/homepage-visual-refinement-pass` | 8 | Narrower homepage visual refinement pass | Homepage, aanpak, globals, marketing shell/components | More focused than the previous two homepage branches. Likely one of several overlapping marketing passes. | Keep for now. Later compare against `loveable-homepage-clone` and current live site; likely only one should survive. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/leadership-shell-correction` | 8 | Leadership route/report/dashboard correction | Leadership report content, dashboard helpers, specialist page, tests | Focused product branch. | Keep for now. Not a cleanup target until product scope is decided. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester` | 7 | Strategy/docs branch, not runtime code | Only active/strategy docs changed | Low live risk, but still unique thinking work. | Keep for now. Later archive to `D:` once strategy conclusions are absorbed elsewhere. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/onboarding-shell-correction` | 7 | Onboarding product correction workspace | Onboarding definition, report content, dashboard and tests | Focused product branch. | Keep for now. This pairs conceptually with `onboarding-route-readiness`; likely those two need relationship review later. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/pulse-pdf-open` | 7 | Pulse reporting/export branch | `backend/main.py`, `report.py`, PDF button, report tests | Focused reporting branch. | Keep for now. Strongly technical and likely still useful if Pulse reporting matters. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-ops-observation-round` | 5 | Public navigation/access-control adjustment branch | Public header, dropdown, middleware, access tests | Small and focused, probably observational follow-up from customer ops findings. | Keep for now. Could become an archive candidate later if already reflected in live public navigation. |
| `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/real-usage-proof-wave` | 4 | Proof/telemetry runtime registry branch | Billing/proof/telemetry JSON registries and an e2e artifact | Focused support/instrumentation branch. | Keep for now. Small, but not yet obviously superseded. |
| `C:/Users/larsh/Desktop/Business/Verisight-pr-action-center-manager` | 2 | Manager notify hotfix worktree copy | Only `frontend/package.json` and `frontend/package-lock.json` changed | Probably dependency/tooling residue after a hotfix branch. | Keep active until explicitly resolved. This is a good later candidate for “commit or discard tiny tail changes,” not for archive now. |
| `C:/Users/larsh/Desktop/Business/content-machine` | 2 | Separate blog/content repo with minor dependency/history drift | Only `history.json` and `requirements.txt` changed | Small independent repo, not a Verisight runtime workspace. | Keep active if blog tooling still matters; otherwise later archive as separate repo. |

### Key interpretation

The dirty set is not one thing. It splits into four very different classes:

1. **Central mixed workspace**
   - `Verisight`

2. **Homepage / shell / marketing overlap**
   - `homepage-offwhite-onboarding`
   - `loveable-homepage-clone`
   - `homepage-visual-refinement-pass`

3. **Focused product branches**
   - `pulse-shell-correction`
   - `leadership-shell-correction`
   - `onboarding-shell-correction`
   - `pulse-pdf-open`
   - `onboarding-route-readiness`

4. **Docs / strategy / ops support**
   - `customer-expansion-suggester`
   - `customer-ops-observation-round`
   - `real-usage-proof-wave`
   - `content-machine`

This matters because the cleanup plan should not treat all dirty worktrees the same.

## Recommended stabilization order

Before any further archive/delete work:

1. Reduce the central mixed workspace in `Verisight`
2. Untangle the overlapping homepage branches
3. Decide which focused product branches are still active bets
4. Only then revisit archive/delete for clean worktree copies

## Main repo dirty-state triage

The main repo is not one dirty change-set. It is several overlapping work blocks collapsed into one place.

Summary from `git status` / `git diff --stat`:
- total tracked changes: `99`
- top-level spread:
  - `frontend`: `62`
  - `docs`: `12`
  - `backend`: `11`
  - `templates`: `9`
  - `tests`: `3`
  - repo policy / infra files: `3`
- last commit on the branch: `fix: rapport v5b — rendering bugs en copy fixes`

### Main repo clusters

| Cluster | Approx. count | What it is | Evidence | Interpretation | Safe next move |
| --- | ---: | --- | --- | --- | --- |
| `A_eNPS_and_reporting` | `18` | eNPS survey-model + reporting pipeline work | Exit/Retention definitions and scoring, `backend/schemas.py`, `backend/report.py`, campaign detail helpers, reporting tests, survey context templates | This is a coherent technical slice and likely the most “real feature” inside the main repo. | Keep together as one candidate branch or patch. Do not mix with homepage or docs work. |
| `B_dashboard_and_admin_shell` | `31` | Dashboard / beheer / reports / shell restructuring | Large edits in `frontend/app/(dashboard)/beheer/page.tsx`, dashboard pages, reports pages, dashboard shell components, checklist and shell-nav files | This is a broad UI/system pass. It touches admin, cockpit, reports, and launch controls together. | Treat as one stabilization project. Needs its own branch or explicit freeze decision. |
| `C_public_site_and_branding` | `23` | Public site and Loep/Verisight brand transition work | `globals.css`, `kennismaking`, `producten`, marketing components, wordmark assets deleted or changed, route-access and preview copy files | This overlaps strongly with the separate homepage/shell worktrees. It is a major overlap hotspot. | Compare against the homepage worktrees before keeping in main. High chance of duplication / branch drift. |
| `D_sales_and_positioning_docs` | `11` | Sales, packaging, proposal, objection, decision-tree docs | `docs/reference/*` one-pagers and commercial playbooks changed together | This is pure document work and should not live entangled with runtime code. | Split into docs-only patch or docs branch. Low live risk, high clutter risk. |
| `E_email_survey_templates_and_examples` | `8` | Email templates, survey shell templates, example PDF removal | `templates/*`, `docs/examples/voorbeeldrapport_verisight.pdf` deleted | Mixed operational presentation layer. Some of this is likely part of the Loep renaming / example cleanup. | Keep separate from product logic. Review deletions carefully before cleanup. |
| `F_tooling_and_repo_policy` | `6` | Ignore rules, frontend scripts, repo setup, Railway tweak | `.gitignore`, `frontend/package.json`, `frontend/README.md`, `frontend/.env.local.example`, `railway.toml` | Mostly operational scaffolding around acceptance/bootstrap and local cleanup hygiene. | Keep separate. Good candidate for a small infra commit once verified. |
| `Z_other` | `2` | Stray items that belong elsewhere | `backend/products/onboarding/definition.py` only changes a `Verisight` -> `Loep` methodiek string; `frontend/app/(dashboard)/action-center/page.route-shell.test.ts` adds bounded overview assertions | These are not a real cluster; they are small tails of larger themes. | Fold onboarding wording into branding/public copy work and fold Action Center test into dashboard/admin shell work. |

### What the main repo really contains

In practice the main repo is carrying at least five different efforts at once:

1. **eNPS + reporting implementation**
2. **dashboard / beheer / reports shell restructuring**
3. **public site / brand / marketing adjustments**
4. **sales and positioning documentation**
5. **tooling / acceptance / local repo hygiene**

That is why it feels impossible to clean: it is not a messy branch in one domain; it is a stack of half-separated projects.

### Most likely overlap with existing worktrees

High overlap risk with separate dirty worktrees exists for:
- public site / homepage work
  - `homepage-offwhite-onboarding`
  - `loveable-homepage-clone`
  - `homepage-visual-refinement-pass`
- onboarding wording / bounded route work
  - `onboarding-route-readiness`
  - `onboarding-shell-correction`
- product-specific shells
  - `pulse-shell-correction`
  - `leadership-shell-correction`

This is why the main repo should not simply be “cleaned up” in place. It needs untangling.

### Conservative recommendation for the main repo

Do **not** try to decide file-by-file. Treat the main repo as a bundle of work blocks:

1. `eNPS + reporting`
2. `dashboard/admin shell`
3. `public site + branding`
4. `sales docs`
5. `tooling/infra`

Any future stabilization should work block by work block, not file by file.

## Homepage / public-site overlap analysis

Compared branches:
- `main` public-site slice
- `homepage-offwhite-onboarding`
- `loveable-homepage-clone`
- `homepage-visual-refinement-pass`

### What overlaps with what

| Pair | Overlap summary | Interpretation |
| --- | --- | --- |
| `homepage-offwhite-onboarding` <> `homepage-visual-refinement-pass` | `7 / 7` public-site files overlap | `homepage-visual-refinement-pass` is effectively a narrow subset of `homepage-offwhite-onboarding` on the public-site layer. |
| `homepage-offwhite-onboarding` <> `loveable-homepage-clone` | `5` overlapping public-site files | These share a homepage/aanpak/contact/site-content core, but `loveable-homepage-clone` also carries tarieven/logo choices that are not in the offwhite branch. |
| `loveable-homepage-clone` <> `homepage-visual-refinement-pass` | `4` overlapping public-site files | `loveable` partially overlaps with the visual refinement pass, but is not a pure subset. |
| `main` <> `homepage-offwhite-onboarding` | `6` overlapping public-site files | Main contains some active public-site work, but not the full homepage stack from `offwhite`. |
| `main` <> `homepage-visual-refinement-pass` | `2` overlapping public-site files | Very limited overlap. This branch is mostly separate from the current main public-site edits. |
| `main` <> `loveable-homepage-clone` | `4` overlapping public-site files | Moderate overlap, mainly around branding assets and shared copy files. |

### Meaning per branch

#### `homepage-offwhite-onboarding`

What it is:
- the broadest public-site branch of the three
- not just homepage visuals, but also auth, dashboard touchpoints, contact flow, API routes, DPA/privacy/not-found pages

Why it exists:
- likely a larger shell and brand pass around onboarding/public experience, not just a cosmetic homepage tweak

What it means:
- this is the dominant branch in the public-site cluster
- if a future survivor branch must be chosen, this is the strongest candidate to review first

Current label:
- `KEEP_FOR_NOW`

#### `homepage-visual-refinement-pass`

What it is:
- a very focused refinement of homepage/aanpak/site shell

Why it exists:
- likely a narrower polish pass after or alongside broader homepage work

What it means:
- because all 7 public-site files overlap with `homepage-offwhite-onboarding`, this branch looks structurally redundant unless its exact diffs are preferred

Current label:
- change from “generic keep” to **`ARCHIVE_CANDIDATE_AFTER_DIFF_REVIEW`**

Interpretation:
- do not delete
- but this is the first public-site dirty branch that looks like it could be superseded by a broader sibling branch

#### `loveable-homepage-clone`

What it is:
- a public-site concept branch with homepage, aanpak, tarieven, contact form, preview slider, site content and logo assets

Why it exists:
- likely an exploratory or concept-driven homepage/pricing direction

What it means:
- not a pure duplicate of `offwhite`
- it carries unique work in `producten/page.tsx`, `tarieven/page.tsx`, `section-heading.tsx`, and logo/wordmark files

Current label:
- `KEEP_FOR_NOW`

Interpretation:
- this may be a concept branch that should later become either:
  - a patch/export-and-archive candidate
  - or the chosen source for a specific pricing/homepage direction

#### `main` public-site slice

What it is:
- not a full homepage branch, but a partial branding/public-site layer mixed into the main repo

Why it matters:
- it overlaps with all three homepage/public branches, but only partially
- this strongly suggests branch drift rather than one clean canonical public-site line

What it means:
- the main repo should not be treated as the canonical public-site truth until the homepage branch overlap is resolved

### Conservative recommendation for the homepage cluster

1. Treat `homepage-offwhite-onboarding` as the broadest current candidate branch.
2. Treat `homepage-visual-refinement-pass` as the first likely redundancy candidate.
3. Treat `loveable-homepage-clone` as a concept branch with some unique pricing/branding value.
4. Treat the main repo public-site slice as mixed spillover, not as the authoritative marketing branch.

## Main repo stabilization order

The goal is not “clean every file.” The goal is to turn the main repo from one dangerous mixed state into a few understandable work blocks.

### Core rule

Sanitize the main repo in this order:

1. **lowest live risk, highest clarity**
2. **most coherent technical feature**
3. **highest overlap / highest confusion**
4. **broadest operational shell changes**

That leads to this order.

### Phase 1 - Split out sales and positioning docs

Cluster:
- `D_sales_and_positioning_docs`

Why first:
- zero runtime impact
- easiest to reason about
- pure clutter inside the current mixed repo
- strongly separate from product behavior

Files involved:
- `docs/reference/COMBINATIE_PORTFOLIO_MEMO.md`
- `docs/reference/CONTENT_OPERATING_SYSTEM.md`
- `docs/reference/EXITSCAN_SALES_ONE_PAGER.md`
- `docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md`
- `docs/reference/PRICING_AND_PACKAGING_ACCEPTANCE_CHECKLIST.md`
- `docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md`
- `docs/reference/SALES_COMPARISON_MATRIX.md`
- `docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md`
- `docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md`
- `docs/reference/SALES_PRODUCT_DECISION_TREE.md`
- `docs/reference/SALES_PROPOSAL_SPINES.md`

Interpretation:
- this is not “repo state”; this is a docs branch hiding inside a code branch

Safest outcome:
- extract to docs-only branch, patch, or archive bucket

### Phase 2 - Split out tooling and repo policy

Cluster:
- `F_tooling_and_repo_policy`

Why second:
- still low runtime risk
- small surface
- removes background noise from the real product work

Files involved:
- `.gitignore`
- `frontend/.env.local.example`
- `frontend/.gitignore`
- `frontend/README.md`
- `frontend/package.json`
- `railway.toml`

Interpretation:
- this is operational scaffolding, not the product itself
- likely related to local hygiene and acceptance/bootstrap work

Safest outcome:
- keep together as infra/tooling slice
- separate from product branches before touching larger UI work

### Phase 3 - Preserve the coherent eNPS and reporting slice

Cluster:
- `A_eNPS_and_reporting`

Why third:
- this is the clearest real feature block in the main repo
- it spans backend, schema, report output, dashboard surface, and tests in a coherent way
- high business value, relatively high internal coherence

Files involved:
- Exit/Retention definitions, scoring, report content
- `backend/schemas.py`
- `backend/report.py`
- `backend/report_html.py`
- campaign detail helpers/pages
- reporting and scoring tests
- survey context templates

Interpretation:
- this looks like real implementation work that should survive
- it should not remain buried inside a mixed branch with homepage and sales-doc work

Safest outcome:
- isolate and preserve as one feature slice

### Phase 4 - Resolve public-site spillover in the main repo

Cluster:
- `C_public_site_and_branding`

Why fourth:
- this is where branch confusion starts
- the main repo overlaps with multiple homepage/public-site worktrees
- it is not safe to treat main as the canonical public-site truth

Files involved:
- `frontend/app/globals.css`
- `frontend/app/kennismaking/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/app/vertrouwen/page.tsx`
- `frontend/app/voorwaarden/page.tsx`
- multiple `frontend/components/marketing/*`
- public logo/example/template assets

Interpretation:
- mixed spillover from several marketing directions
- especially dangerous because it looks “frontend-only” but is actually branch-governance confusion

Safest outcome:
- do not keep this as an orphan block in main
- compare against:
  - `homepage-offwhite-onboarding`
  - `loveable-homepage-clone`
  - `homepage-visual-refinement-pass`
- then decide whether main keeps only the truly unique leftovers

### Phase 5 - Triage the dashboard/admin shell block last

Cluster:
- `B_dashboard_and_admin_shell`

Why last:
- biggest cluster
- widest runtime surface
- highest chance of hidden coupling
- mixes cockpit/admin/reports/launch controls

Files involved:
- `frontend/app/(dashboard)/beheer/*`
- `frontend/app/(dashboard)/dashboard/*`
- `frontend/app/(dashboard)/reports/*`
- dashboard shell components
- launch control and audit helpers

Interpretation:
- this is a real subsystem reshaping pass
- it should be handled as its own project, not as residue during cleanup

Safest outcome:
- keep intact until the lower-risk blocks are split away
- then reassess whether this is one coherent branch or multiple partial efforts

### Phase 6 - Fold the strays into parent slices

Cluster:
- `Z_other`

Files:
- `backend/products/onboarding/definition.py`
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

Interpretation:
- these are tails, not standalone work
- onboarding definition wording belongs with branding / naming normalization
- the Action Center shell test belongs with dashboard/admin shell work

Safest outcome:
- never treat these as separate work items
- assign them into the closest parent slice during stabilization

## Recommended decision sequence

If this were executed carefully, the decision order should be:

1. mark `D_sales_and_positioning_docs` as separate docs work
2. mark `F_tooling_and_repo_policy` as separate infra work
3. preserve `A_eNPS_and_reporting` as the main feature slice
4. resolve `C_public_site_and_branding` against the homepage branches
5. only then judge `B_dashboard_and_admin_shell`
6. fold `Z_other` into the nearest parent slice

## Why this order is safe

Because it peels away low-risk and high-clarity noise first:
- docs
- tooling
- coherent feature work

Only after that does it ask hard questions about:
- marketing overlap
- dashboard subsystem reshaping

That is the difference between “cleanup” and “controlled stabilization.”

## Exact batch inventory for Phase 1 and Phase 2

This section turns the high-level order into exact batches.

### Phase 1 exact batch - sales and positioning docs

These are the files that form the Phase 1 docs-only slice:

- `docs/reference/COMBINATIE_PORTFOLIO_MEMO.md`
- `docs/reference/CONTENT_OPERATING_SYSTEM.md`
- `docs/reference/EXITSCAN_SALES_ONE_PAGER.md`
- `docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md`
- `docs/reference/PRICING_AND_PACKAGING_ACCEPTANCE_CHECKLIST.md`
- `docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md`
- `docs/reference/SALES_COMPARISON_MATRIX.md`
- `docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md`
- `docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md`
- `docs/reference/SALES_PRODUCT_DECISION_TREE.md`
- `docs/reference/SALES_PROPOSAL_SPINES.md`

What this batch means:
- pure commercial and sales positioning work
- no runtime behavior
- no dashboard, backend, or survey logic

Why it is the best first extraction:
- lowest live risk
- highest clarity
- easiest to reason about as a self-contained work item

### Phase 2 exact batch - tooling and repo policy

These are the files that form the Phase 2 infra/tooling slice:

- `.gitignore`
- `frontend/.env.local.example`
- `frontend/.gitignore`
- `frontend/README.md`
- `frontend/package.json`
- `railway.toml`

What this batch means:
- local/runtime hygiene
- acceptance/bootstrap scripts
- ignore rules and environment scaffolding
- Railway deployment behavior

Why this is the second extraction:
- still low business risk
- separate from product truth
- removes noise before judging product/UI clusters

## What remains in the main repo after Phase 1 and 2 are mentally peeled away

If Phase 1 and Phase 2 are treated as separate work blocks, the remaining main-repo dirty state is:

- `B_dashboard_and_admin_shell` - `31`
- `C_public_site_and_branding` - `23`
- `A_eNPS_and_reporting` - `18`
- `E_email_survey_templates_and_examples` - `8`
- `Z_other` - `2`

This is a much better shape than the original undifferentiated `99`.

### Why this matters

After removing docs and tooling from your mental model:
- the main repo becomes mostly a product/UI problem
- the public-site overlap becomes easier to isolate
- the eNPS/reporting feature becomes easier to preserve cleanly
- the dashboard/admin shell can be judged on its own merits

## Practical stabilization program after Phase 1 and 2

### Step A - Freeze the docs batch as its own thing

Outcome:
- “these 11 files are commercial docs work, not repo noise”

Meaning:
- they should later live as a docs-only branch, patch, or archival review unit

### Step B - Freeze the tooling batch as its own thing

Outcome:
- “these 6 files are infra/tooling hygiene, not product intent”

Meaning:
- they should later live as a small infra slice, not mixed with eNPS or marketing decisions

### Step C - Protect the eNPS/reporting core

Outcome:
- the most coherent technical feature slice is preserved before broader cleanup decisions

Meaning:
- do not let this disappear into homepage or dashboard confusion

### Step D - Resolve the public-site conflict set

Outcome:
- decide what survives between:
  - main repo public-site spillover
  - `homepage-offwhite-onboarding`
  - `loveable-homepage-clone`
  - `homepage-visual-refinement-pass`

Meaning:
- this is the key branch-governance problem, not just a frontend problem

### Step E - Triage the dashboard/admin shell after the above

Outcome:
- only once the easier noise is removed can the largest subsystem pass be judged clearly

Meaning:
- this becomes a real product/system decision, not part of a general cleanup panic

## What I would do next if continuing this autonomously

1. prepare a dedicated “public-site conflict matrix”:
   - which files are unique to each homepage branch
   - which are overlapping
   - which likely represent the strongest candidate line

2. prepare a dedicated “dashboard/admin shell matrix”:
   - what changed in beheer
   - what changed in dashboard
   - what changed in reports
   - whether this is one coherent pass or multiple buried efforts

3. only after that, decide which clean root-level worktree copies can be archived to `D:`

## Public-site conflict matrix

### Unique file contribution per branch

This is the most useful view for deciding whether a branch is merely overlapping or still carries unique value.

#### `homepage-offwhite-onboarding`

Unique public-site files found:
- none on the filtered public-site layer

Interpretation:
- its value is breadth, not uniqueness
- it acts more like the broad superset branch across homepage/shell/public flow work

#### `homepage-visual-refinement-pass`

Unique public-site files found:
- none on the filtered public-site layer

Interpretation:
- this branch looks entirely subsumed by broader public-site work
- its value is likely only in exact diff preference, not unique scope

#### `loveable-homepage-clone`

Unique public-site files found:
- `frontend/app/producten/page.tsx`
- `frontend/app/tarieven/page.tsx`
- `frontend/components/marketing/section-heading.tsx`

Interpretation:
- this branch still carries unique commercial/page-structure value
- especially relevant if pricing and products framing are still in play

#### `main` public-site slice

Unique public-site files found:
- `frontend/app/producten/[slug]/page.tsx`
- `frontend/components/marketing/aanpak-content.tsx`
- `frontend/components/marketing/design-tokens.tsx`
- `frontend/components/marketing/home-page-content.tsx`
- `frontend/components/marketing/tarieven-content.tsx`
- `frontend/components/marketing/wordmark.tsx`
- `frontend/lib/marketing-flow.test.ts`
- `frontend/lib/marketing-products.ts`
- `frontend/lib/public-route-access.test.ts`
- `frontend/lib/report-preview-copy.test.ts`
- `frontend/public/brand/verisight-pulse-logo.svg`
- `frontend/public/examples/voorbeeldrapport_verisight.pdf`
- `frontend/public/templates/verisight-respondenten-template.csv`
- `frontend/public/templates/verisight-respondenten-template.xlsx`

Interpretation:
- the main repo still carries a real amount of unique public-site and asset work
- this is why the main repo cannot simply discard all public-site changes in favor of one homepage branch

### Public-site branch reading

Most likely current roles:

- `homepage-offwhite-onboarding`
  - broad candidate line
  - best for reviewing general shell/public direction

- `homepage-visual-refinement-pass`
  - likely redundant refinement subset
  - strongest later archive/freeze candidate among the dirty homepage branches

- `loveable-homepage-clone`
  - concept/value branch with pricing/products uniqueness
  - not safe to collapse into “duplicate” yet

- `main public-site slice`
  - spillover carrier of unique assets/copy/components
  - must be reconciled, not ignored

## Dashboard / admin shell matrix

The `B_dashboard_and_admin_shell` block is also not one thing. It breaks down as follows:

### Subgroups and sizes

- `dashboard_components` - `10`
- `beheer` - `7`
- `dashboard_lib` - `4`
- `dashboard_support_lib` - `3`
- `reports_page` - `3`
- `dashboard_page` - `2`
- `qa_login` - `1`
- `app_layout` - `1`

### Exact subgroup contents

#### `dashboard_components`

- `frontend/components/dashboard/add-respondents-form.tsx`
- `frontend/components/dashboard/customer-launch-control.tsx`
- `frontend/components/dashboard/dashboard-primitives.tsx`
- `frontend/components/dashboard/dashboard-shell.tsx`
- `frontend/components/dashboard/exit-dashboard-visuals.tsx`
- `frontend/components/dashboard/guided-self-serve-panel.tsx`
- `frontend/components/dashboard/invite-client-user-form.tsx`
- `frontend/components/dashboard/new-campaign-form.tsx`
- `frontend/components/dashboard/onboarding-panels.tsx`
- `frontend/components/dashboard/preflight-checklist.tsx`

Interpretation:
- shared dashboard surface and forms
- probably the most structural part of the admin/dashboard pass

#### `beheer`

- `frontend/app/(dashboard)/beheer/billing/page.tsx`
- `frontend/app/(dashboard)/beheer/color-semantics.test.ts`
- `frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx`
- `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- `frontend/app/(dashboard)/beheer/page.test.ts`
- `frontend/app/(dashboard)/beheer/page.tsx`
- `frontend/app/(dashboard)/beheer/proof/page.tsx`

Interpretation:
- admin setup and beheer restructuring
- this is likely its own coherent subproject

#### `dashboard_lib`

- `frontend/lib/dashboard/dashboard-shell-config.ts`
- `frontend/lib/dashboard/dashboard-shell.test.ts`
- `frontend/lib/dashboard/shell-navigation.test.ts`
- `frontend/lib/dashboard/shell-navigation.ts`

Interpretation:
- shell/navigation policy
- likely architectural glue rather than endpoint behavior

#### `dashboard_support_lib`

- `frontend/lib/campaign-audit.test.ts`
- `frontend/lib/campaign-audit.ts`
- `frontend/lib/launch-controls.ts`

Interpretation:
- launch/readiness/support logic
- operational support layer, not merely presentation

#### `reports_page`

- `frontend/app/(dashboard)/reports/page.route-shell.test.ts`
- `frontend/app/(dashboard)/reports/page.test.ts`
- `frontend/app/(dashboard)/reports/page.tsx`

Interpretation:
- standalone reports-surface work
- could later be treated separately if needed

#### `dashboard_page`

- `frontend/app/(dashboard)/dashboard/page.test.ts`
- `frontend/app/(dashboard)/dashboard/page.tsx`

Interpretation:
- cockpit/landing work

#### `qa_login`

- `frontend/app/dev/qa-login/route.ts`

#### `app_layout`

- `frontend/app/layout.tsx`

### What this means for stabilization

The dashboard/admin shell cluster likely breaks into at least three meaningful internal efforts:

1. **beheer/admin surface**
2. **shared dashboard shell + components**
3. **reports/cockpit support logic**

That means the `B` cluster should later be stabilized as a mini-program, not one giant undifferentiated frontend pass.

## Action program per cluster

This section translates the analysis into a concrete sequence of safe actions.

Action labels:
- `STABILIZE_FIRST`: do not archive or delete; first reduce ambiguity and preserve intent
- `COMPARE_THEN_DECIDE`: do not move yet; compare against sibling branches or main
- `ARCHIVE_LATER`: likely movable to `D:` after one more verification step
- `LEAVE_ALONE`: not worth touching now

## Program 1 - Root-level and clean copy candidates

### `Verisight_enps_main_release`
- Current label: `KEEP_FOR_NOW`
- Action: `COMPARE_THEN_DECIDE`
- Why:
  - clean
  - large enough to matter
  - head already contained by `main`
  - but “contained by main” only proves commit reachability, not that its release/validation role is over
- Safe next step:
  - first verify whether this was a temporary release-validation worktree that is still operationally meaningful
  - only archive after explicit “no longer needed” confirmation

### `wt-rescopy`
- Current label: `ARCHIVE_CANDIDATE`
- Action: `ARCHIVE_LATER`
- Why:
  - clean
  - large enough to matter
  - head already contained by `main`
- Safe next step:
  - archive to `D:` first

### `Worktrees/Verisight_motion_graphic_split`
- Current label: `ARCHIVE_CANDIDATE`
- Action: `ARCHIVE_LATER`
- Why:
  - head is already contained by many later branches and `main`
  - very small relative risk
- Safe next step:
  - archive to `D:` first

### `Verisight_enps_publish`
- Current label: `KEEP_FOR_NOW`
- Action: `COMPARE_THEN_DECIDE`
- Why:
  - clearly related to the eNPS rollout
  - but not obviously absorbed by `main`
- Safe next step:
  - compare only against the preserved eNPS/reporting slice
  - then decide keep vs archive

### `Verisight-action-center-teams`
- Current label: `KEEP_FOR_NOW`
- Action: `LEAVE_ALONE`
- Why:
  - unique feature branch
  - not clearly superseded
- Safe next step:
  - none until Action Center scope decisions are clearer

### `Worktrees/Verisight_insights_seo_structure`
- Current label: `KEEP_FOR_NOW`
- Action: `LEAVE_ALONE`
- Why:
  - large and unique
  - not shown as merged into main
- Safe next step:
  - none for cleanup purposes

### `Worktrees/Verisight_mto_track_foundation`
- Current label: `KEEP_FOR_NOW`
- Action: `LEAVE_ALONE`
- Why:
  - background-track branch with unique head
- Safe next step:
  - none until MTO-track strategy is revisited

### `tmp/review-3685c49` and `tmp/review-task1-22d8990`
- Current label: `LOW_PRIORITY_DELETE_CANDIDATE`
- Action: `ARCHIVE_LATER`
- Why:
  - tiny
  - detached but clean
  - heads already contained by `main`
- Safe next step:
  - low urgency
  - remove only after the broader worktree program is calmer

## Program 2 - Dirty main repo

### `D_sales_and_positioning_docs`
- Action: `STABILIZE_FIRST`
- Goal:
  - recognize this as a separate docs effort
- Why first:
  - lowest runtime risk
  - easiest mental cleanup
- Practical meaning:
  - from now on, treat these 11 files as one docs batch, not as “noise in main”

### `F_tooling_and_repo_policy`
- Action: `STABILIZE_FIRST`
- Goal:
  - isolate tooling/infra intent from product behavior
- Why second:
  - small batch
  - improves clarity quickly
- Practical meaning:
  - these files should not influence product-triage decisions

### `A_eNPS_and_reporting`
- Action: `STABILIZE_FIRST`
- Goal:
  - preserve the most coherent feature work before touching overlapping UI branches
- Why third:
  - it is the clearest implementation slice
  - likely business-relevant and reusable
- Practical meaning:
  - this is the core slice to protect if the main repo is later split, patched, or archived

### `C_public_site_and_branding`
- Action: `COMPARE_THEN_DECIDE`
- Goal:
  - reconcile main against the homepage branch family
- Why fourth:
  - this is the biggest branch-overlap hotspot
- Practical meaning:
  - do not bless or discard the main public-site changes until compared against:
    - `homepage-offwhite-onboarding`
    - `loveable-homepage-clone`
    - `homepage-visual-refinement-pass`

### `B_dashboard_and_admin_shell`
- Action: `STABILIZE_FIRST`
- Goal:
  - treat it as a mini-program, not residue
- Why fifth:
  - it is broad and runtime-sensitive
  - but becomes much easier to reason about once docs/tooling/public-site confusion is separated
- Practical meaning:
  - later split mentally into:
    - beheer/admin surface
    - shared dashboard shell
    - reports/cockpit support logic

### `Z_other`
- Action: `LEAVE_ALONE`
- Why:
  - too small to matter alone
  - should be folded into parent clusters later

## Program 3 - Dirty homepage/public-site worktrees

### `homepage-offwhite-onboarding`
- Action: `COMPARE_THEN_DECIDE`
- Role:
  - broad candidate branch for public-site and shell direction
- Practical next step:
  - use as the reference branch when comparing the homepage family

### `homepage-visual-refinement-pass`
- Action: `ARCHIVE_LATER`
- Role:
  - likely redundant subset of `homepage-offwhite-onboarding`
- Practical next step:
  - one diff review against `homepage-offwhite-onboarding`
  - if no preferred nuance is hiding there, freeze/archive later

### `loveable-homepage-clone`
- Action: `COMPARE_THEN_DECIDE`
- Role:
  - concept branch with unique pricing/products value
- Practical next step:
  - keep until a conscious choice is made about pricing/products framing

## Program 4 - Focused dirty product worktrees

### Keep as active product slices for now
- `pulse-shell-correction`
- `leadership-shell-correction`
- `onboarding-shell-correction`
- `pulse-pdf-open`
- `onboarding-route-readiness`

Action:
- `LEAVE_ALONE`

Why:
- these are coherent product-focused branches
- they are not cleanup wins; they are unresolved product work

## Program 5 - Small dirty support/doc branches

### `customer-expansion-suggester`
- Action: `LEAVE_ALONE`
- Why:
  - strategy/docs branch, low storage impact

### `customer-ops-observation-round`
- Action: `COMPARE_THEN_DECIDE`
- Why:
  - focused enough that it may later be superseded by live public-nav work

### `real-usage-proof-wave`
- Action: `LEAVE_ALONE`
- Why:
  - small and specific, not worth forcing now

### `content-machine`
- Action: `LEAVE_ALONE`
- Why:
  - separate repo with its own lifecycle

### `Verisight-pr-action-center-manager`
- Action: `STABILIZE_FIRST`
- Why:
  - small dirty tail on a hotfix branch
  - likely easy to resolve later, but still active until explicitly handled

## Recommended next three safe operational moves

1. Use this ledger as the only decision source for cleanup status.
2. Treat the main repo as five work blocks, not 99 files.
3. Next actual storage move should be archive-only, for the strongest clean candidates:
   - `wt-rescopy`
   - `Worktrees/Verisight_motion_graphic_split`

## Recommended next three stabilization moves

1. Keep the `D` and `F` batches mentally separate from product work.
2. Preserve the `A_eNPS_and_reporting` slice as the main feature core.
3. Resolve the homepage branch family before making any public-site cleanup decisions in the main repo.

## Fast operating summary

### What to do now

- use this ledger instead of folder names or intuition
- treat the main repo as five separate work blocks
- only prepare archive actions for the strongest clean candidates

### What to do later

- archive the clean candidate copies to `D:`
- review whether `homepage-visual-refinement-pass` is fully superseded
- revisit the clean-but-unique branches only after the dirty set is calmer

### What never to do blindly

- delete a dirty worktree
- delete anything under `Verisight/.worktrees` just because the name looks old
- assume main is the canonical public-site truth
- collapse `loveable-homepage-clone` into redundancy without reviewing its pricing/products differences
- mix docs/tooling/product/public-site decisions into one cleanup action

## What this means operationally

### Safe next actions

1. Archive, do not delete, the strongest `ARCHIVE_CANDIDATE` items first:
   - `Verisight_enps_main_release`
   - `wt-rescopy`
   - `Worktrees/Verisight_motion_graphic_split`

2. Leave these alone for now:
   - `Verisight_enps_publish`
   - `Verisight-action-center-teams`
   - `Worktrees/Verisight_insights_seo_structure`
   - `Worktrees/Verisight_mto_track_foundation`
   - `outreach`
   - `verisight-insight-hub-review`

3. Do not attempt bulk cleanup under:
   - `Verisight/.worktrees`
   - `Worktrees`
   - `tmp` worktrees

### Why archive before delete

For root-level worktree copies, archiving to `D:` is safer than deletion because:
- it preserves branch context while we simplify `C:`
- it reduces storage pressure without forcing irreversible decisions
- it gives a rollback path if a branch turns out to matter

## Suggested next ledger pass

Next pass should cover:
- the top dirty worktrees inside `Verisight/.worktrees`
- whether `Verisight_enps_publish` is superseded by the `main`-contained eNPS line
- whether `verisight-insight-hub-review` is still needed for any publication flow
- whether the two detached `tmp` review worktrees can be removed from git registration after archive or confirmation
