# REPORT_GENERATOR_RUNTIME_BOUNDARY.md

Last updated: 2026-04-18
Status: active derived boundary note
Authoritative inputs: de canonieke reporting truth lives in [REPORT_TRUTH_BASELINE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_TRUTH_BASELINE.md), [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md) en [REPORT_METHODOLOGY_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_METHODOLOGY_CANON.md). Dit document beschrijft alleen welke runtimepaden in [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) actief zijn en welke niet als canonieke bron gelezen mogen worden.

## Titel

Report Generator Runtime Boundary

## Korte samenvatting

De actieve rapportgenerator heeft nu een expliciete runtimegrens: `ExitScan` loopt via een eigen embedded story builder, `RetentieScan` via een benoemd runtime-ingangspunt binnen de gedeelde grammarlaag, en andere niet-Exit-routes vallen voorlopig terug op een gedeeld non-exit runtimepad. De grote historische codeblok onder de eerste `return buf.getvalue()` in `generate_campaign_report` is verwijderd en telt niet meer mee als onderhoudsrisico of pseudo-owner-document.

## Wat is geaudit

- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md)
- [EXITSCAN_IMPLEMENTATION_PARITY_CHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_IMPLEMENTATION_PARITY_CHECK.md)

## Belangrijkste bevindingen

- `generate_campaign_report` kiest voor `ExitScan` expliciet `_build_exit_embedded_story`.
- Niet-Exit-routes gebruiken `_build_non_exit_runtime_story` als actief runtime-ingangspunt.
- `RetentieScan` enters through `_build_retention_runtime_story` binnen die gedeelde grammarlaag.
- De gedeelde builder heet nu eerlijker `_build_shared_non_exit_runtime_story`.
- De oude unreachable code onder de eerste `return buf.getvalue()` is verwijderd.

## Belangrijkste inconsistenties of risico's

- `RetentieScan` heeft nu wel een expliciet runtime-ingangspunt, maar nog geen ExitScan-achtige hard-frozen architectuur.
- Andere niet-Exit-routes delen voorlopig nog dezelfde grammarbuilder en vragen later productspecifieke hardening.
- Oudere plan- of referentiedocs buiten de canonlaag kunnen nog naar `_build_rebrand_story` verwijzen.

## Beslissingen / canonvoorstellen

- Voor `ExitScan` geldt: alleen `_build_exit_embedded_story` telt als runtime-structuurdrager.
- Voor `RetentieScan` geldt: `_build_retention_runtime_story` is het expliciete runtime-ingangspunt binnen de gedeelde grammarlaag.
- Voor andere niet-Exit-routes geldt: `_build_non_exit_runtime_story` blijft het actieve runtime-ingangspunt totdat productspecifieke splitsing nodig is.
- Historische code onder de eerste `return buf.getvalue()` in `generate_campaign_report` is verwijderd en kan niet langer foutief als reviewbasis of pseudo-canon worden gelezen.

## Concrete wijzigingen

- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) voorzien van expliciete runtime-boundary comments en benoemde runtime-ingangspunten voor `ExitScan`, `RetentieScan` en gedeelde non-exit-routes.
- Nieuwe expliciete retention-wrapper toegevoegd: `_build_retention_runtime_story`.
- De gedeelde non-exit builder hernoemd naar `_build_shared_non_exit_runtime_story`.
- De grote historische unreachable codeblok onder de eerste `return buf.getvalue()` verwijderd.
- Dit boundary-document geactualiseerd op de nieuwe runtimegrens.

## Validatie

- De runtimekeuze in `generate_campaign_report` is nu tekstueel en technisch explicieter leesbaar.
- Tekstuele paritytests kunnen nu expliciet controleren op `ExitScan`-, `RetentieScan`- en gedeelde non-exit runtimepaden.
- Bestaande smoke/paritytests voor reportgeneratie blijven de actieve route verifiëren zonder nog op dode code in dezelfde functie te leunen.

## Assumptions / defaults

- Deze stap verandert geen runtimevolgorde of rapportarchitectuur van `ExitScan` of `RetentieScan`; hij maakt alleen de codepaden explicieter en schoner.
- Verdere productspecifieke splitsing voor andere niet-Exit-routes blijft later werk en valt buiten deze cleanup.

## Precedence rule

Dit document beschrijft runtime-boundaries, maar bepaalt niet zelfstandig:

- report truth
- report structure
- methodology
- terminology governance

Als dit document botst met `docs/reporting/*`, dan wint `docs/reporting/*`.
