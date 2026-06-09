# Detached Dirty Worktree Review — 2026-05-15

## Doel
Deze review behandelt de hoogste risicogroep uit de worktree-triage:

- detached HEAD
- dirty status

Op auditmoment waren dit vier worktrees.

## Resultaat in het kort
De vier worktrees lijken **niet inhoudelijk dirty door codewijzigingen**, maar vooral door lokale Vercel-bestanden.

## 1. `.worktrees/live-deploy-36ee0d4`
- head commit: `36ee0d4`
- status: dirty
- oorzaak:
  - `?? .vercel/`
- inhoudelijke codewijzigingen: niet zichtbaar

### Advies
- behandelen als lokaal deploy-artefact
- geen inhoudelijke branchwaarde zichtbaar
- na extra controle waarschijnlijk kandidaat voor opruimen

## 2. `.worktrees/homepage-optional-action-center-release`
- head commit: `15c7e82`
- status: dirty
- oorzaak:
  - `?? .vercel/`
  - `?? .vercelignore`

### Advies
- eerst handmatig controleren of `.vercelignore` bewust is of alleen een lokale deployhulp
- als `.vercelignore` geen unieke inhoudelijke rol meer heeft:
  - worktree verschuift naar cleanup-kandidaat
- dit is de enige van de vier die nog een kleine extra check vraagt

### Opmerking
De gevonden `.vercelignore` bevat een deploymentgerichte uitsluitlijst en lijkt geen standaard productbestand in de hoofdrepo.

## 3. `.worktrees/live-deploy-8d6eb55`
- head commit: `8d6eb55`
- status: dirty
- oorzaak:
  - `?? .vercel/`
- inhoudelijke codewijzigingen: niet zichtbaar

### Advies
- behandelen als lokaal deploy-artefact
- waarschijnlijk veilige cleanup-kandidaat na laatste confirmatie

## 4. `.worktrees/products-live-deploy`
- head commit: `e15a0b2`
- status: dirty
- oorzaak:
  - `?? .vercel/`
- inhoudelijke codewijzigingen: niet zichtbaar

### Advies
- behandelen als lokaal deploy-artefact
- waarschijnlijk veilige cleanup-kandidaat na laatste confirmatie

## Conclusie
Van de vier detached dirty worktrees lijken er:

- `3` direct vervuild door alleen `.vercel/`
- `1` vervuild door `.vercel/` plus een losse `.vercelignore`

Dat betekent:
- deze groep is waarschijnlijk veel minder risicovol dan eerst gedacht
- eerst de `.vercelignore`-worktree apart beoordelen
- daarna kunnen de detached deploy-worktrees waarschijnlijk naar de cleanup-batch voor `clean/redundant release snapshots`

## Beste volgende stap
1. check of `.worktrees/homepage-optional-action-center-release/.vercelignore` nog echt nodig is
2. label daarna deze vier worktrees als:
   - `cleanup-kandidaat`
   - of `nog kort bewaren`
3. pak vervolgens de grotere risicogroep:
   - dirty branchgebonden worktrees
