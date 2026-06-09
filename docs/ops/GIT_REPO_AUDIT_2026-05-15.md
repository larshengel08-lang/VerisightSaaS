# Git Repo Audit — 2026-05-15

## Doel
Deze audit legt de huidige git-staat van de `Verisight`-repo vast, zonder destructieve opschoning. De focus ligt op:

- veiligstellen van de huidige staat
- zichtbaar maken wat alleen lokaal leeft
- repo-vervuiling scheiden van echte productwijzigingen
- een future-proof werkmodel voorstellen

## Veilige momentopname
Op 2026-05-15 zijn de volgende veilige ankers gezet:

- branch: `backup/repo-audit-2026-05-15`
- tag: `repo-audit-2026-05-15`

Deze wijzen allebei naar:

- commit: `ba9eb92`
- branch op auditmoment: `feat/dashboard-overview-cockpit`

## Huidige repo-status

### Branchstatus
- huidige branch: `feat/dashboard-overview-cockpit`
- upstream: `origin/feat/dashboard-overview-cockpit`
- status: `ahead 1`

### Wijzigingen in de worktree
- modified: `82`
- deleted: `7`
- untracked: `55`

### Branches en worktrees
- lokale branches: `240`
- actieve worktrees: `219`
- branches zonder upstream: `34`
- branches met ahead-status: `20`

## Hoofdbevindingen

### 1. De repo is niet alleen "dirty", maar structureel vermengd
Er staat nu tegelijk in dezelfde repo:

- productcode
- marketing/contentwerk
- reviewartefacten
- screenshots
- video/frame exports
- tijdelijke Vercel-kopieen
- lokale inspectie-envs
- acceptance-output

Daardoor is `git status` geen betrouwbaar werksignaal meer.

### 2. Tijdelijke output wordt niet hard genoeg afgevangen
De grootste untracked clusters zitten in:

- `.tmp/`: `433`
- `frontend/tmp/`: `116`
- `tmp/`: `162`
- `docs/`: `18`
- `frontend/docs/`: `5`
- `.png`-artefacten: `240`

Dit is de grootste repo-hygiënelek.

### 3. Gevoelige of deployment-gerelateerde lokale bestanden zijn nu niet genegeerd
De volgende paden zijn op auditmoment **niet genegeerd**:

- `frontend/.env.vercel.production`
- `frontend/.env.production.inspect`
- `.tmp/vercel-homepage-optional-action-center/.vercel/.env.production.local`
- `.acceptance-runtime/guided-self-serve.json`
- `supabase/.temp/cli-latest`

Dit is geen bewijs dat ze al gecommit zijn, maar wel een duidelijk governance-risico.

### 4. Branch- en worktree-governance is veel te los geworden
Er zijn extreem veel parallelle branches en worktrees, waaronder:

- lange `codex/*`-reeksen
- `wip/*`
- `release/*`
- `spec/*`
- `content-machine/*`
- meerdere detached HEAD worktrees

Dit maakt het moeilijk om nog snel te zien:

- wat actief is
- wat verlaten is
- wat merge-kandidaat is
- wat alleen lokaal leeft

### 5. De huidige `.gitignore` is te smal voor jullie echte werkwijze
De root `.gitignore` en `frontend/.gitignore` vangen wel standaard build- en env-ruis af, maar niet jullie huidige praktijk met:

- reviewexports
- dashboard screenshots
- QA-runs
- acceptance artefacten
- tmp work copies
- lokale deploy-inspecties

## Specifieke risico's

### Hoog
- lokale env/deploybestanden kunnen per ongeluk in commitstroom komen
- tijdelijke `.tmp/`-kopieën van complete appdelen vervuilen de repo
- branch/worktree-hoeveelheid maakt opruimen risicovol zonder centrale inventaris

### Middel
- reviewbestanden en screenshots maken echte codewijzigingen slecht zichtbaar
- lokale-only branches zonder upstream kunnen vergeten werk bevatten
- ahead-branches zonder actief mergepad kunnen inhoudelijk wegdrijven

### Laag, maar structureel
- docs, specs en plannen staan nu deels tussen tijdelijke reviewoutput
- screenshots en QA-assets leven te dicht op productcode

## Aanbevolen beslisstructuur

### Bak 1 — moet in git blijven
Alleen:

- productcode
- tests
- migrations/schema
- structurele docs en runbooks
- voorbeeldbestanden die bewust onderdeel van het product zijn

### Bak 2 — moet uit standaard repo-status blijven
Verplaatsen of negeren:

- `tmp/`
- `frontend/tmp/`
- `.tmp/`
- losse screenshots
- QA-exportbeelden
- reviewspreadsheets
- acceptance-run output
- lokale inspectiebestanden

### Bak 3 — alleen bewust en tijdelijk lokaal
Nooit standaard committen:

- `.env`-afgeleiden
- `.vercel`-inhoud
- `.temp/`
- deploy-inspectiebestanden
- debug snapshots

## Future-proof werkmodel

### 1. Een branch mag maar één onderwerp hebben
Gebruik alleen korte branches zoals:

- `feat/getloep-rebrand`
- `fix/dashboard-filter-state`
- `docs/repo-governance`

### 2. Eén taak = één worktree
Geen doorlopende worktrees zonder eigenaar of einddatum.

### 3. Werk alleen vanuit een schone status
Voor start:

```powershell
git status --short
```

Als dit niet schoon is:

- commit
- stash bewust
- of werk in een aparte worktree

### 4. Maak `.gitignore` expliciet passend op jullie echte workflow
Niet alleen Node/Python-standaarden, maar ook:

- tijdelijke reviewmappen
- screenshotartefacten
- acceptance-output
- deployinspecties
- tool-runtime mappen

### 5. Houd `main` of één trunk heilig
- geen direct pushen
- alleen merge via PR
- oude branches wekelijks nalopen

### 6. Wekelijkse repo-health check
Draai minimaal:

```powershell
git fetch --all --prune
git status --short
git branch -vv
git worktree list
```

## Concrete volgende stappen

### Fase A — zonder risico
1. Behoud `backup/repo-audit-2026-05-15` en `repo-audit-2026-05-15`
2. Draai het script `scripts/git-repo-health.ps1`
3. Label alle untracked paden in:
   - `houden`
   - `ignoren`
   - `verplaatsen`

### Fase B — governance aanscherpen
4. Maak een expliciete `.gitignore`-update voor tmp/review/runtime output
5. Maak een branch-/worktree-opruimlijst
6. Beslis welke branches zonder upstream nog echt bestaan mogen houden

### Fase C — structurele discipline
7. Stel PR-only merges in voor trunk
8. Werk voortaan taak-voor-taak via korte branch + schone worktree
9. Gebruik een vaste wekelijkse repo-health routine

## Nog niet gedaan in deze audit
Deze audit heeft bewust **niet** gedaan:

- geen reset
- geen clean
- geen branch delete
- geen worktree prune
- geen `.gitignore`-wijziging

Dat is expres: eerst zichtbaarheid, dan pas opschoning.
