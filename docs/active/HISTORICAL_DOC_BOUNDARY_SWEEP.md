# HISTORICAL_DOC_BOUNDARY_SWEEP.md

Last updated: 2026-04-26
Status: active
Source of truth: dit document begrenst oudere plan-, archive- en referentiedocs die nog pre-hardening taal of routewoorden dragen, zodat ze geen tweede waarheid terug de actieve laag in brengen.

## Titel

Historical Doc Boundary Sweep

## Korte samenvatting

Deze sweep labelt oudere documenten die nog historische termen dragen zoals `ExitScan Live`, `RetentieScan ritme` of oudere executive framing. Doel is niet om alle historische documenten volledig te herschrijven, maar om expliciet te maken dat zulke termen niet langer de actieve canon bepalen.

## Wat is geaudit

- [README.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/archive/README.md)
- [ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md)
- [CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
- [PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md)
- [CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md)
- [DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md)
- [SALES_ENABLEMENT_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md)
- [PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md)
- [FOUNDER_LED_SALES_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md)
- [SALES_PROPOSAL_SPINES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PROPOSAL_SPINES.md)
- [PRODUCT_TERMINOLOGY_AND_TAXONOMY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md)
- actieve canonbronnen zoals [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md) en [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)

## Belangrijkste bevindingen

- de grootste restdrift zat niet meer in de actieve kerncanon, maar in oudere plan- en referentiedocs die nog vaak worden geraadpleegd
- termen zoals `ExitScan Live` en `RetentieScan ritme` functioneren daar vooral als historische labels, niet als gewenste huidige buyer-facing of paritytaal
- zonder expliciete boundarynotes kunnen zulke docs opnieuw route- en statusdrift veroorzaken
- na PR `#28` en `#29` bleek vooral de documentautoriteit nog te breed: oudere trancheplannen en subsystem-docs moesten explicieter onder de huidige first-buy canon worden gehangen

## Belangrijkste inconsistenties of risico's

- oudere docs blijven nuttig als audit- of structuurlagen, maar kunnen onbedoeld als actuele copycanon worden gelezen
- sommige historische termen blijven bewust in inhoudelijke context staan om de oorspronkelijke tranche of besluitvorming leesbaar te houden
- deze sweep vervangt daarom niet alle oude termen, maar begrenst hun gezag
- volledige tekstuele normalisatie van alle oudere plannen zou nu te breed worden en hoort alleen thuis in een expliciete archive- of rewrite-sweep

## Beslissingen / canonvoorstellen

- archiefdocs zijn nooit leidend voor actuele producttaal, reportstructuur of buyer-facing routewoorden
- oudere plan- en referentiedocs mogen historische termen blijven dragen, mits expliciet wordt verwezen naar de actieve canon
- oudere trancheplannen in `docs/active` mogen subsystemen blijven uitleggen, maar niet meer zelfstandig first-buy, wedge- of routehiërarchie claimen
- de actieve conflictvolgorde voor taal- en rapportvragen blijft:
  1. embedded truth
  2. actieve canon- en paritydocs
  3. oudere plan- en referentiedocs
  4. archive

## Concrete wijzigingen

- boundarynote toegevoegd aan [README.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/archive/README.md)
- boundarynotes toegevoegd aan:
  - [ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ACCOUNT_AND_BILLING_MODEL_READINESS_PLAN.md)
  - [CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
  - [PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PORTFOLIO_ARCHITECTURE_PROGRAM_PLAN.md)
  - [CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md)
  - [DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md)
  - [SALES_ENABLEMENT_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md)
  - [PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md)
  - [FOUNDER_LED_SALES_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md)
  - [SALES_PROPOSAL_SPINES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PROPOSAL_SPINES.md)
  - [PRODUCT_TERMINOLOGY_AND_TAXONOMY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md)

## Validatie

- boundarydocs verwijzen nu expliciet naar de actuele canon in plaats van zelfstandig taalgezag te claimen
- de sweep verandert geen productstatus, pricingbesluit of ExitScan-architectuur
- de cleanup blijft daarmee binnen documentaire scope en opent geen dashboard-, runtime- of bredere productpromotie opnieuw

## Assumptions / defaults

- oudere docs blijven beschikbaar als audit trail en structuurnaslag
- volledige historische herschrijving is nu niet proportioneel zolang de boundarylaag helder staat

## Next gate

Alleen nog expliciete archive/move cleanup voor overgebleven oudere plannen die nog teveel als live truth ogen.
