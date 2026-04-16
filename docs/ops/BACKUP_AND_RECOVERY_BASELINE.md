# BACKUP_AND_RECOVERY_BASELINE

Praktische baseline voor Verisight-backups en herstel.

Laatste update: 2026-04-16

## Doel

Zorg dat Verisight herstelbaar blijft zonder onnodige chaos, dubbele waarheden of te zware backup-routines.

Deze baseline onderscheidt drie lagen:

1. repo-backup
2. externe document-backup
3. remote platform- en databackup

## 1. Wat standaard gebackupt moet worden

### A. Repo

Gebruik de git-repo als primaire technische bron.

Wat je wilt veiligstellen:

- volledige git-history
- actuele `main`-state
- strategie- en checklistbron
- ops- en auditdocumentatie

Beste vorm:

- een `git bundle` van de hele repo
- plus een kleine manifest/metadata-export

Waarom:

- betrouwbaarder dan een losse zip van de worktree
- volledige history blijft herstelbaar
- branch- en commitinformatie blijft intact

### B. Externe docs

Gebruik [Docs_External](C:\Users\larsh\Desktop\Business\Docs_External) als aparte referentie- en assetlaag.

Wat je wilt veiligstellen:

- strategie-uitwerkingen
- operationele documenten
- CRM- en onboarding-assets
- commerciële docs
- gevoelige referentiebestanden die niet in de repo horen

Beste vorm:

- aparte zip/snapshot buiten de repo

### C. Remote systemen

Deze vallen niet automatisch onder git en moeten bewust worden meegenomen:

- Supabase data / schema
- Railway env en deploy-context
- Vercel productie- en projectcontext
- mail / domeininstellingen waar relevant

## 2. Wat je juist niet als hoofdbackup moet zien

Niet vertrouwen op alleen:

- een lokale worktree-kopie
- een zip van heel [Business](C:\Users\larsh\Desktop\Business) inclusief `node_modules`, `.next`, `.venv`, logs en cache
- alleen GitHub zonder bewuste herstelroutine
- alleen screenshots of losse exports zonder commitreferentie

## 3. Aanbevolen ritme

### Standaard

Maak een baseline-backup:

- na grote checklistmijlpalen
- na een brede audit- of cleanup-ronde
- vóór grotere mapherstructurering
- vóór ingrepen in deployment-, auth- of datalagen

### Concreet nu

Verisight zit nu na de checklistaudit op een logisch backupmoment.

## 4. Recovery-prioriteit

Als herstel nodig is, herstel in deze volgorde:

1. repo-basis
2. checklist / roadmap / strategiebron
3. externe docs
4. remote env en data
5. live deploy

## 5. Best Practices

### Repo

- houd `main` schoon voor een baseline-backup
- noteer altijd de commit hash in de backupmanifest
- gebruik `git bundle` voor herstelbare repo-snapshots

### Docs

- houd externe docs apart van de codebackup
- vermijd dat `Docs_External` een tweede roadmap wordt
- behandel externe docs als referentie en assets, niet als leidende technische bron

### Remote

- exporteer of documenteer remote afhankelijkheden bewust
- vertrouw niet op geheugen voor Railway/Vercel/Supabase-config
- leg per backup minimaal vast welke remote checks nog handmatig moeten gebeuren

### Ops

- test periodiek of een backup ook echt herstelbaar is
- houd tijdelijke artifacts buiten git
- maak liever meerdere kleine, begrijpelijke backups dan één grote ondoorzichtige dump

## 6. Baseline-artefacten

Een goede baseline bevat minimaal:

- repo bundle
- repo manifest met commit en datum
- kopie van:
  - [PROMPT_CHECKLIST.xlsx](C:\Users\larsh\Desktop\Business\Verisight\docs\prompts\PROMPT_CHECKLIST.xlsx)
  - [ROADMAP.md](C:\Users\larsh\Desktop\Business\Verisight\docs\strategy\ROADMAP.md)
  - [STRATEGY.md](C:\Users\larsh\Desktop\Business\Verisight\docs\strategy\STRATEGY.md)
  - [CHECKLIST_AUDIT_TRACKER.md](C:\Users\larsh\Desktop\Business\Verisight\docs\ops\CHECKLIST_AUDIT_TRACKER.md)
- aparte snapshot van [Docs_External](C:\Users\larsh\Desktop\Business\Docs_External)

## 7. Handmatige Remote Checklist

Deze stap is nog steeds nodig naast de lokale baseline:

- [ ] Supabase backup/export bevestigd
- [ ] Railway env / serviceconfig vastgelegd
- [ ] Vercel productieproject en relevante deploystatus bevestigd
- [ ] Belangrijke domein- en mailinstellingen vastgelegd indien gewijzigd

## 8. Scriptgebruik

Gebruik voor een lokale baseline:

- [create_backup_baseline.ps1](C:\Users\larsh\Desktop\Business\Verisight\create_backup_baseline.ps1)
- [REMOTE_PLATFORM_BACKUP_CHECKLIST.md](C:\Users\larsh\Desktop\Business\Verisight\docs\ops\REMOTE_PLATFORM_BACKUP_CHECKLIST.md) voor de remote laag

Standaard outputlocatie:

- `C:\Users\larsh\Desktop\Business\Notes\Backups\Verisight\<timestamp>`

Output bevat:

- repo bundle
- repo manifest
- kopie van kern-documenten
- zip van `Docs_External`

## 9. Huidige conclusie

Voor Verisight is de juiste backupvorm nu:

- licht genoeg om vaak te doen
- sterk genoeg om echt te herstellen
- gescheiden voor code, externe docs en remote afhankelijkheden
