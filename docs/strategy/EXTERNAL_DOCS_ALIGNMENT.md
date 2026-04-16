# External Docs Alignment

Dit document beschrijft hoe [Docs_External](C:/Users/larsh/Desktop/Business/Docs_External) zich verhoudt tot de repo-documentatie.

## Hoofdregel

De repo bevat de leidende strategische en operationele waarheid:

- [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx)
- [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
- [ROADMAP_WORKBOOK.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP_WORKBOOK.xlsx)
- [CEO_GROWTH_SYSTEM_2026.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/CEO_GROWTH_SYSTEM_2026.md)
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)

`Docs_External` blijft waardevol voor:
- externe documentpakketten
- branding en salesassets
- research en audits
- operations/CRM-uitwerking
- archief

Maar `Docs_External` mag niet zelfstandig een afwijkende roadmap of prioriteitsvolgorde bepalen.

Gebruik daarnaast:

- [EXTERNAL_DOCS_REGISTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/EXTERNAL_DOCS_REGISTER.md)
  - als index, classificatie- en synclaag voor waardevolle externe documenten

## Classificatie-defaults

Voor de hele map [Docs_External](C:/Users/larsh/Desktop/Business/Docs_External) gelden deze standaardclassificaties:

- `01_Strategie_En_Planning`
  - standaard: `reference`
  - alleen `leading now` als expliciet gemarkeerd
- `02_Branding`
  - standaard: `reference`
- `03_Sales_En_Marketing`
  - standaard: `reference`
- `04_Research_En_Audits`
  - standaard: `reference`
- `05_Operations_En_CRM`
  - standaard: `sensitive operational`
- `99_Archief`
  - standaard: `archive`

## Belangrijkste synchronisaties

- commerciële claims moeten terugkomen in trust-, sales- en websitewerk
- Baseline versus Live moet terugkomen in pricing, onboarding, sales en website
- website-wireframes en redesignvoorstellen zijn input voor websiteplannen, geen aparte roadmap
- ops- en CRM-documenten zijn input voor onboarding, implementation readiness en pilot delivery

## Securityregel

Planning- en strategiedocumenten mogen geen live credentials, API keys of wachtwoorden bevatten.

Als externe documenten gevoelige data bevatten:
- verwijder die uit het document
- vervang met een neutrale verwijzing naar secure storage
- behandel het document daarna als `reference` of `sensitive operational`, afhankelijk van de inhoud
