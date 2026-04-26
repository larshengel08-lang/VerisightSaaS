# HISTORICAL_CANON_BOUNDARY_REGISTER

Last updated: 2026-04-26
Status: active  
Source of truth: product language canon, commercial language parity recheck and current active hardening docs.

## Titel

Historical Canon Boundary Cleanup - Register

## Korte samenvatting

Dit register markeert welke oudere reference- of toekomstdocs nog bruikbaar zijn als context, maar niet meer als actieve canon voor producttaal, routewoorden of statuslezing.

## Wat is geaudit

- [FOUNDER_LED_SALES_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/FOUNDER_LED_SALES_PLAYBOOK.md)
- [SALES_PROPOSAL_SPINES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/SALES_PROPOSAL_SPINES.md)
- [PLATFORM_BLUEPRINT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/PLATFORM_BLUEPRINT.md)
- [CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md)
- [DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md)
- [SALES_ENABLEMENT_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md)
- [PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [COMMERCIAL_LANGUAGE_PARITY_RECHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_LANGUAGE_PARITY_RECHECK.md)

## Belangrijkste bevindingen

- Meerdere oudere referentiedocs zijn nog nuttig als denkkader of verkoopreferentie, maar dragen oudere labels zoals `ExitScan Live`, `ritme` of een bredere platformsuite-lezing.
- De meeste actieve drift kan worden opgevangen met duidelijke boundarynotes en een centraal register in plaats van grootschalige herschrijving.
- Een tweede driftlaag zat in oudere uitgevoerde trancheplannen die nog als zelfstandige commerciële waarheid konden worden gelezen, terwijl de first-buy canon later is aangescherpt in strategy, pricing en signoff-docs.

## Belangrijkste inconsistenties of risico's

- Zonder expliciete boundary kunnen oudere referentiedocs opnieuw als actieve waarheid worden gelezen.
- Vooral future-vision documenten kunnen sneller portfolio- of maturitydrift introduceren dan de huidige hardeninglaag draagt.
- Oudere trancheplannen in `docs/active` ogen extra canoniek door hun `Source of truth` headers en moeten daarom expliciet downstream worden gemaakt aan de huidige commerciële canon.

## Beslissingen / canonvoorstellen

| Document | Status | Boundary |
| --- | --- | --- |
| `FOUNDER_LED_SALES_PLAYBOOK.md` | historical-but-usable | salesreferentie, maar ondergeschikt aan actieve canon |
| `SALES_PROPOSAL_SPINES.md` | historical-but-usable | structuurreferentie, maar routewoorden kunnen pre-normalisatie zijn |
| `PLATFORM_BLUEPRINT.md` | future-vision non-canon | geen actieve productcanon, geen maturity- of routewaarheid |
| `CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md` | tranche-locked downstream | bewijsarchitectuur blijft bruikbaar, maar first-buy en routehiërarchie volgen de actieve commerciële canon |
| `DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md` | tranche-locked downstream | demo- en showcase-architectuur blijft bruikbaar, maar bepaalt geen zelfstandige commerciële routewaarheid |
| `SALES_ENABLEMENT_SYSTEM_PLAN.md` | tranche-locked downstream | rolloutplan blijft context; actuele saleswaarheid zit in de playbook/decision-tree laag en de actieve commerciële canon |
| `PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md` | tranche-locked downstream | rolloutplan blijft context; actuele producttaal zit in de huidige canon- en paritydocs |

## Concrete wijzigingen

- Register aangemaakt: [HISTORICAL_CANON_BOUNDARY_REGISTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/HISTORICAL_CANON_BOUNDARY_REGISTER.md)
- Future-vision boundary aangescherpt in [PLATFORM_BLUEPRINT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/PLATFORM_BLUEPRINT.md)
- Boundarynotes toegevoegd aan:
  - [CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md)
  - [DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/DEMO_AND_SAMPLE_ENVIRONMENT_PROGRAM_PLAN.md)
  - [SALES_ENABLEMENT_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md)
  - [PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_TERMINOLOGY_AND_TAXONOMY_SYSTEM_PLAN.md)

## Validatie

- De aangewezen docs hebben nu expliciete boundarycontext of staan in dit register als non-canon bron.
- De aangewezen trancheplannen kunnen nu niet langer zelfstandig een oudere commerciële hiërarchie terug de live referentielaag in trekken.

## Assumptions / defaults

- Historical of future-vision status maakt een document niet waardeloos; het verlaagt alleen de canonrang.

## Next gate

Verdere cleanup alleen nog als expliciete archive- of move-sweep, niet als stille inhoudelijke herpromotie.
