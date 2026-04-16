# External Docs Register

Last updated: 2026-04-16
Status: active

## Purpose

Dit document is de nette brug tussen de repo en [Docs_External](C:/Users/larsh/Desktop/Business/Docs_External).

Doel:

- waardevolle externe documenten zichtbaar maken
- dubbele waarheden voorkomen
- expliciet maken wat alleen referentie is en wat actief moet doorwerken in de repo

Belangrijke regel:

- `Docs_External` wordt niet blind gekopieerd naar de repo
- alleen duurzame, leidende of herbruikbare waarheid wordt samengevat, gespiegeld of doorvertaald

## Source-of-truth rule

De leidende volgorde blijft:

1. [PROMPT_CHECKLIST.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/prompts/PROMPT_CHECKLIST.xlsx)
2. [ROADMAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP.md)
3. [ROADMAP_WORKBOOK.xlsx](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP_WORKBOOK.xlsx)
4. [CEO_GROWTH_SYSTEM_2026.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/CEO_GROWTH_SYSTEM_2026.md)
5. [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
6. [Docs_External](C:/Users/larsh/Desktop/Business/Docs_External) als referentie- en assetlaag

## Register by external domain

### 01_Strategie_En_Planning

Default class:
- reference

Typical contents:
- businessplan
- baseline versus live-notities
- claimsversies
- next steps
- oude roadmaps

Representative files:
- [Verisight_Businessplan_2026-04-10_v1.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Businessplan_2026-04-10_v1.docx)
- [Verisight_Baseline_vs_Live_Voorstel_2026-04-10.md](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Baseline_vs_Live_Voorstel_2026-04-10.md)
- [Verisight_Commerciele_Claims_2026-04-10.md](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Commerciele_Claims_2026-04-10.md)
- [Verisight_Roadmap_2026-04-10_v1.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/01_Strategie_En_Planning/Verisight_Roadmap_2026-04-10_v1.xlsx)

Repo target:
- [STRATEGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/STRATEGY.md)
- [CEO_GROWTH_SYSTEM_2026.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/CEO_GROWTH_SYSTEM_2026.md)
- [ROADMAP_DATA.yaml](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/ROADMAP_DATA.yaml)

Sync rule:
- strategische inzichten samenvatten en expliciet doorvertalen
- oude externe roadmaps nooit leidend maken boven repo-roadmap

### 02_Branding

Default class:
- reference

Repo target:
- website, sales one-pagers, brand-led copy en visual direction docs

Sync rule:
- assets en moodboards extern laten
- alleen duurzame merkkeuzes samenvatten in repo-copy of designrichting

### 03_Sales_En_Marketing

Default class:
- reference

Typical contents:
- outbound processen
- sales one-pagers
- marketing- en demopakketten
- salespakketversies

Representative examples:
- [Verisight_Outbound_Proces_2026-04-10.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/03_Sales_En_Marketing/Verisight_Outbound_Proces_2026-04-10.docx)
- [Verisight_Sales_Onepager_2026-04-10_v1.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/03_Sales_En_Marketing/Verisight_Sales_Onepager_2026-04-10_v1.docx)

Repo target:
- [FOUNDER_LED_SALES_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md)
- sales reference docs in `docs/reference`
- website and pricing copy

Sync rule:
- commerciële formats mogen extern blijven
- canonieke route, bezwaren en kerncopy moeten in de repo landen

### 04_Research_En_Audits

Default class:
- reference

Repo target:
- product-, trust- en reportingbesluiten
- audittracks waar een uitkomst structureel relevant is

Sync rule:
- bevindingen samenvatten
- ruwe auditoutput extern houden tenzij het een blijvende operatingregel wordt

### 05_Operations_En_CRM

Default class:
- sensitive operational

Typical contents:
- CRM-bestanden
- onboardingprocesflows
- klantaanlevering specs
- prospectlijsten
- testprofielen

Representative files:
- [Verisight_CRM.xlsx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_CRM.xlsx)
- [Verisight_Onboarding_Procesflow_2026-04-10.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_Onboarding_Procesflow_2026-04-10.docx)
- [Verisight_Klantaanlevering_Spec_2026-04-10.docx](C:/Users/larsh/Desktop/Business/Docs_External/Verisight_Docs/05_Operations_En_CRM/Verisight_Klantaanlevering_Spec_2026-04-10.docx)

Repo target:
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [OPS_DELIVERY_FAILURE_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OPS_DELIVERY_FAILURE_MATRIX.md)
- implementation and ops plans

Sync rule:
- geen gevoelige klantdata of CRM-export in de repo
- wel structurele proceslogica, acceptance criteria en handoffregels naar repo-playbooks vertalen

### 99_Archief

Default class:
- archive

Sync rule:
- alleen raadplegen als context of historisch bewijs nodig is
- niet terug naar actief systeem brengen zonder expliciete reden

## Recommended merge model

Gebruik voortaan dit model:

### 1. Register

Houd dit document actueel als index op externe waardevolle documenten.

### 2. Translate

Breng alleen duurzame waarheid over naar de repo:

- strategie
- playbooks
- acceptance regels
- decision logs
- pricing- en salescanon

### 3. Link

Gebruik links naar externe bronbestanden wanneer de volledige asset of het volledige procesdocument extern mag blijven.

### 4. Guard

Laat externe documenten nooit zelfstandig de roadmap of actieve prioriteit bepalen.

## Practical next use

Wanneer je in `Docs_External` iets waardevols ziet:

1. bepaal de class: reference, sensitive operational of archive
2. bepaal het repo-target
3. vat de duurzame waarheid samen in de repo
4. voeg of houd de bronlink in dit register
