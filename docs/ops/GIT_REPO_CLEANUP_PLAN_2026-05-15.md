# Git Repo Cleanup Plan — 2026-05-15

## Doel
Deze cleanupfase volgt op de audit van 2026-05-15 en is bewust opgesplitst in:

1. veilige repo-hygiëne
2. branch/worktree-governance
3. pas daarna gecontroleerde opschoning

## Al uitgevoerd
- backup branch: `backup/repo-audit-2026-05-15`
- tag: `repo-audit-2026-05-15`
- auditrapport vastgelegd
- repo-health script toegevoegd
- `.gitignore` aangescherpt voor:
  - `.tmp/`
  - `tmp/`
  - `frontend/tmp/`
  - `.acceptance-runtime/`
  - `supabase/.temp/`
  - `frontend/.env.vercel.production`
  - `frontend/.env.production.inspect`
  - root-level `*.png`

## Waarom deze ignore-update veilig was
Op auditmoment stonden er geen bewust getrackte bestanden in:

- `.tmp/`
- `tmp/`
- `frontend/tmp/`
- `.acceptance-runtime/`
- `supabase/.temp/`

Ook de genoemde env-/inspectiebestanden waren niet getrackt.

## Nog niet uitvoeren zonder review
De volgende acties zijn bewust nog niet automatisch uitgevoerd:

- geen branch deletes
- geen worktree removes
- geen `git clean`
- geen archivering van documenten

## Praktische cleanup-volgorde

### Fase 1 — status opnieuw lezen na ignore-hardening
Run:

```powershell
git status --short --branch
powershell -ExecutionPolicy Bypass -File scripts\git-repo-health.ps1
```

Doel:
- zien hoeveel ruis al uit `git status` verdwenen is
- beter onderscheid maken tussen echte codewijzigingen en repo-noise

### Fase 2 — branches zonder upstream nalopen
Werk vanuit deze vraag:

- is deze branch nog actief?
- hoort deze branch bewust alleen lokaal te bestaan?
- moet deze alsnog naar origin?
- of kan deze weg nadat de worktree is opgeruimd?

Voorbeelden van branchtypes die meestal review vragen:

- `backup/*`
- `codex/*` zonder upstream
- oude `wip/*`
- detached-release-afsplitsingen

Gebruik:

```powershell
git for-each-ref --format='%(refname:short)|%(upstream:short)|%(committerdate:short)|%(subject)' refs/heads
```

### Fase 3 — ahead branches labelen
Voor iedere branch met ahead-status:

- `merge-kandidaat`
- `bewust lokaal`
- `obsolete`

Begin met:

- `feat/dashboard-overview-cockpit`
- `dashboard-overview-reconstruct-step-1`
- `dashboard-redesign`
- `fix/blog-public-live`
- `content-machine/effectiever-coachen-door-vooral-te-luisteren-2026-05-08`

Gebruik:

```powershell
git log --oneline origin/<branch>..<branch>
```

### Fase 4 — worktrees rationaliseren
219 worktrees is te veel om veilig mentaal te beheren.

Doel:
- alleen actieve worktrees houden
- stale worktrees verwijderen
- detached HEAD worktrees eerst inhoudelijk checken

Gebruik per verdachte worktree:

```powershell
git -C <worktree-pad> status --short --branch
```

Daarna pas:

```powershell
git worktree remove <worktree-pad>
```

Nooit bulk-removen zonder statuscheck.

### Fase 5 — repo-inhoud hergrenzen
Hanteer deze regel:

#### In repo houden
- code
- tests
- structurele docs
- bewuste voorbeelden
- scripts

#### Buiten standaard repo-stroom houden
- reviewexports
- screenshots
- QA sweeps
- deploy snapshots
- acceptance artefacten
- tijdelijke video/frame captures

## Aanbevolen eindmodel

### Branchmodel
- `main` als enige trunk
- korte featurebranches
- geen lange doorlopende `codex/*`-stapeling zonder closeout

### Worktreemodel
- één worktree per actieve taak
- worktree sluiten zodra taak klaar is
- geen naamloze of vergeten worktrees

### Repo-health cadence
Wekelijks:

```powershell
git fetch --all --prune
git status --short
git branch -vv
git worktree list
powershell -ExecutionPolicy Bypass -File scripts\git-repo-health.ps1
```

## Beste volgende inhoudelijke stap
Na deze cleanup-hardening is de beste volgende stap:

1. de huidige branch `feat/dashboard-overview-cockpit` opsplitsen in:
   - echte product/codewijzigingen
   - docs
   - rebrand/assets
2. de ahead branches met echte inhoud één voor één beoordelen
3. vervolgens pas stale worktrees verwijderen
