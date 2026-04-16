# REPO_STRUCTURE_REVIEW

Gerichte structuurreview voor Verisight.

Laatste update: 2026-04-16

## 1. Doel

Beoordelen of de huidige mapstructuur nog logisch genoeg is en waar kleine, veilige verbeteringen winst opleveren.

Belangrijke regel:

- geen big-bang herstructurering
- alleen wijzigingen die dubbele waarheid, zoekfrictie of herstelrisico verminderen

## 2. Huidig oordeel

### Wat al goed is

- [docs](C:\Users\larsh\Desktop\Business\Verisight\docs) is logisch gesplitst in:
  - `active`
  - `archive`
  - `examples`
  - `ops`
  - `prompts`
  - `reference`
  - `strategy`
- [frontend](C:\Users\larsh\Desktop\Business\Verisight\frontend) en [backend](C:\Users\larsh\Desktop\Business\Verisight\backend) zijn duidelijk
- prompt-, roadmap- en auditlaag zijn nu beter geborgd dan eerder

### Wat nog rommelig is

- er staan veel losse scripts op repo-root
- er stond nog path-drift rond `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`
- root bevat operationele hulpmiddelen, scripts en enkele historische reststukken door elkaar

## 3. Veilige eerste cleanup uitgevoerd

Uitgevoerd op 2026-04-16:

- `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md` verplaatst van repo-root naar:
  - [docs/active/IMPLEMENTATION_READINESS_PROGRAM_PLAN.md](C:\Users\larsh\Desktop\Business\Verisight\docs\active\IMPLEMENTATION_READINESS_PROGRAM_PLAN.md)

Waarom dit veilig en wenselijk is:

- het is een actief source-of-truth planbestand
- zulke bestanden horen inhoudelijk in `docs/active`
- dit vermindert dubbele interpretatie tussen root en docsstructuur

## 4. Aanbevolen volgende structuurstappen

### Kortetermijn, veilig

- update verwijzingen zodat actieve planbestanden consequent naar `docs/active` wijzen
- houd nieuwe ops-documenten in `docs/ops`
- houd tijdelijke artifacts en browseroutput buiten git

### Middellang, alleen als de repo rustig is

- groepeer losse root-scripts naar een `scripts`-structuur, bijvoorbeeld:
  - `scripts/demo`
  - `scripts/validation`
  - `scripts/seeding`
  - `scripts/planning`

### Nu bewust niet doen

- geen brede verplaatsing van backend/frontend/app-structuren
- geen massa-archivering zonder eerst referenties te controleren
- geen scriptmigratie terwijl er nog actieve deploy- of run-instructies op rootpaden leunen

## 5. Best Practices

- één actieve truthlocatie per planbestand
- docs onder `docs/*`, niet op root tenzij er een sterke reden is
- root alleen voor echte entrypoints, tooling, config en scripts die daar functioneel horen
- eerst referentie- en padcontrole, dan pas verplaatsen

## 6. Huidige conclusie

Ja, een lichte structuurverbetering is zinvol.

Nee, een grote mapmigratie is nu niet nodig.

De juiste lijn is:

1. kleine drift repareren
2. root ordelijker maken
3. pas later eventueel scripts groeperen
