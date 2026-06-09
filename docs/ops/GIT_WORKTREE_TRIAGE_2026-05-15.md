# Git Worktree Triage — 2026-05-15

## Inventarisbestanden
- branches: [git-branch-inventory-2026-05-15.csv](./git-branch-inventory-2026-05-15.csv)
- worktrees: [git-worktree-inventory-2026-05-15.csv](./git-worktree-inventory-2026-05-15.csv)

## Samenvatting
- totale worktrees: `219`
- clean: `179`
- dirty: `40`
- detached: `18`

## Betekenis

### Clean + detached
Dit zijn meestal de eerste kandidaten voor gecontroleerde verwijdering, **mits**:

- de commit al veilig op een branch of origin terug te vinden is
- er geen reden is om de worktree als tijdelijke release-snapshot te bewaren

Voorbeelden uit deze groep:

- `.worktrees/homepage-onboarding-pass`
- `.worktrees/homepage-review-card-height`
- `.worktrees/homepage-remove-insights-live`
- `.worktrees/homepage-action-center-optional-label`
- `.worktrees/testrevisie-live-release`
- `.worktrees/aanpak-live-release`
- `.worktrees/tarieven-label-pass`
- `.worktrees/dashboard-loep-branding-baseline`
- `.worktrees/live-promote-product-pages-v2`
- `.worktrees/live-promote-homepage-colors`
- `.worktrees/live-promote-homepage-polish`
- `.worktrees/motion-reveal-release`
- `.worktrees/insights-live-release`
- `.worktrees/live-dashboard-filter-qa`

### Dirty + detached
Dit zijn de hoogste risicokandidaten, omdat ze:

- geen branchlabel hebben
- en wel lokale wijzigingen kunnen bevatten

Voorbeelden:

- `.worktrees/live-deploy-36ee0d4`
- `.worktrees/homepage-optional-action-center-release`
- `.worktrees/live-deploy-8d6eb55`
- `.worktrees/products-live-deploy`

Deze **niet verwijderen** voordat per worktree is vastgesteld:

- wat de wijziging is
- of die al ergens anders gecommit is
- of het alleen build-/runtime-ruis is

### Dirty + branchgebonden
Dit zijn actieve of half-vergeten werkplekken. Hier zit waarschijnlijk echt werk in of onopgeruimde repo-ruis.

Voorbeelden:

- `codex/action-center-adapter-readiness`
- `codex/action-center-follow-up-route-trigger`
- `codex/action-center-route-closeout`
- `codex/hero-motion-preview`
- `codex/loep-visual-rebrand`
- `codex/products-live-hotfix`
- `content-machine/effectief-coaching-begint-bij-luisteren-waarom-leidinggevenden-beter-zwijgen-2026-05-08`
- `feat/action-center-managers-page`
- `feat/dashboard-overview-cockpit`
- `feat/home-hero-preview-premium`
- `spec/hr-routebeheer-structure`
- `wip-dashboard-category-nav`

Hier eerst per worktree bepalen:

- actief werk
- alleen stale ruis
- lokaal-only patch

## Aanbevolen opruimvolgorde

### Groep A — eerst beoordelen
1. dirty + detached
2. branches zonder upstream
3. ahead branches

### Groep B — daarna waarschijnlijk veilig opruimen
4. clean + detached release/promote worktrees
5. oude review/promote snapshots die duidelijk geen actieve rol meer hebben

### Groep C — pas als laatste
6. dirty branchgebonden worktrees
7. branches met ahead-status waar nog inhoudelijke commits op staan

## Werkmethode per worktree
Gebruik eerst:

```powershell
git -C <worktree-pad> status --short --branch
git -C <worktree-pad> log --oneline -n 5
```

Als clean en aantoonbaar redundant:

```powershell
git worktree remove <worktree-pad>
```

Alleen daarna eventueel de branch verwijderen.

## Nog niet doen
- geen bulk `git worktree remove`
- geen bulk branch delete
- geen detached worktrees weggooien zonder commitcontrole
- geen cleanup op basis van naam alleen
