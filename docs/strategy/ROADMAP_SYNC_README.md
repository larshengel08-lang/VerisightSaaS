# Roadmap Sync Gebruik

Dit kleine systeem koppelt de checklist en de roadmap aan elkaar zonder dat de `.xlsx` zelf de enige hoofdbron hoeft te zijn.

## Wat nu de rollen zijn

- [ROADMAP_DATA.yaml](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP_DATA.yaml)
  - structuurbron
  - bevat de volgorde, fases, deliverables en standaard-notities

- [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx)
  - operationele voortgang
  - hier werk je status, datum, notities en repo/main/deploy/live-status bij

- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
  - gegenereerde strategische roadmap
  - wordt opnieuw opgebouwd op basis van `ROADMAP_DATA.yaml` en de actuele checkliststatus
- [CEO_GROWTH_SYSTEM_2026.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/CEO_GROWTH_SYSTEM_2026.md)
  - forward-looking bedrijfsbesturingssysteem na afronding van de checklistfases
  - wordt niet automatisch gegenereerd; dit document beheer je bewust handmatig

## Hoe je het gebruikt

### Alleen status bijwerken

Als je een prompt hebt uitgevoerd:

1. werk [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx) bij
2. run:

```bat
C:\Users\larsh\Desktop\Business\Verisight\sync_planning_artifacts.bat
```

Dan wordt:
- de checklist netjes geharmoniseerd
- de roadmap opnieuw opgebouwd met de nieuwste status

Je kunt hiervoor ook gewoon dubbelklikken op:

```bat
C:\Users\larsh\Desktop\Business\UPDATE_VERISIGHT_PLANNING.bat
```

### Volgorde of fases aanpassen

Als je de prioriteitsvolgorde of fase-indeling wilt wijzigen:

1. pas [ROADMAP_DATA.yaml](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP_DATA.yaml) aan
2. run:

```bat
C:\Users\larsh\Desktop\Business\Verisight\sync_planning_artifacts.bat
```

Dan wordt:
- de checklist opnieuw geordend
- de roadmap opnieuw gegenereerd

## Automatische sync bij commit

Er is nu ook een Git-hook toegevoegd:

- [pre-commit](/C:/Users/larsh/Desktop/Business/Verisight/.githooks/pre-commit)

Die doet automatisch een sync vlak voor een commit als je staged wijzigingen hebt in:
- `docs/prompts/PROMPT_CHECKLIST.xlsx`
- `docs/strategy/ROADMAP_DATA.yaml`

Dat betekent:
- wijzig je de checklist en commit je daarna, dan wordt `ROADMAP.md` vanzelf bijgewerkt
- wijzig je de YAML-structuur en commit je daarna, dan worden checklist en roadmap nog een keer rechtgetrokken voor de commit doorgaat

De hook draait bewust alleen op deze planningsbestanden, zodat normale codecommits niet onnodig worden vertraagd.

## Praktische regels

- pas de volgorde **niet alleen** handmatig in Excel aan als het structureel is; gebruik dan `ROADMAP_DATA.yaml`
- gebruik Excel voor voortgang en korte statusnotities
- gebruik YAML voor structuur, volgorde en fase-architectuur
- commit bij voorkeur zowel de checklist als de roadmap nadat je hebt gesynchroniseerd
- gebruik het CEO Growth System voor de vraag "waar sturen we nu het bedrijf op?"
- zet `Status = Voldaan` voor live-impactvolle wijzigingen pas als het relevante eindstation bereikt is:
  - code op `main`
  - relevante deploy geslaagd
  - live bevestigd waar nodig
- gebruik voor repo-only trajecten expliciet een formulering als:
  - `Naar main gepusht op YYYY-MM-DD (commit); live-status niet lokaal geverifieerd.`
- gebruik voor live bevestigde trajecten expliciet een formulering als:
  - `Live bevestigd op YYYY-MM-DD via productie-URL('s'); commit <hash>.`
- behandel oude korte formuleringen zoals `Live via main` of `Live op main` als legacy en vervang ze bij voorkeur bij de eerstvolgende checklist-update

## Wat dit niet doet

- het script pusht niets automatisch
- het script maakt geen nieuwe promptbestanden
- het script past `STRATEGY.md` niet automatisch aan

Dat is bewust: roadmap-sync moet veilig en voorspelbaar blijven
