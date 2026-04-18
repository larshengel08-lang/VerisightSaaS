# REPORT_GENERATOR_RUNTIME_BOUNDARY.md

Last updated: 2026-04-18
Status: active
Source of truth: dit document beschrijft welke runtimepaden in [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) actief zijn en welke niet als canonieke bron gelezen mogen worden.

## Titel

Report Generator Runtime Boundary

## Korte samenvatting

De actieve rapportgenerator heeft nu een expliciete runtimegrens: `ExitScan` loopt via een eigen embedded story builder, terwijl niet-ExitScan routes voorlopig via een gedeeld runtimepad lopen. Oude code onder de eerste `return buf.getvalue()` in `generate_campaign_report` is historisch en niet bepalend voor runtime of canon.

## Wat is geaudit

- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [EXITSCAN_IMPLEMENTATION_PARITY_CHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/EXITSCAN_IMPLEMENTATION_PARITY_CHECK.md)

## Belangrijkste bevindingen

- `generate_campaign_report` kiest voor `ExitScan` expliciet `_build_exit_embedded_story`.
- Niet-ExitScan routes gebruiken momenteel een gedeeld runtimepad dat nu expliciet `_build_non_exit_runtime_story` heet.
- In [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) staat nog een grote historische codeblok onder de eerste `return buf.getvalue()`. Die code is unreachable en bepaalt de runtime niet.

## Belangrijkste inconsistenties of risico’s

- De aanwezigheid van unreachable historische code in dezelfde module blijft een onderhoudsrisico.
- Zonder expliciete boundary is het te makkelijk om oude comments, paginatitels of structuurlogica foutief als actuele truthlaag te lezen.
- RetentieScan gebruikt nog een gedeelde buildernaam en runtimepad dat niet dezelfde expliciete hard-freeze heeft als ExitScan.

## Beslissingen / canonvoorstellen

- Voor `ExitScan` geldt: alleen `_build_exit_embedded_story` telt als runtime-structuurdrager.
- Voor niet-ExitScan routes geldt: `_build_non_exit_runtime_story` is het actieve runtime-ingangspunt totdat een latere split-cleanup volgt.
- Historische code onder de eerste `return buf.getvalue()` in `generate_campaign_report` geldt niet als canon, niet als reviewbasis en niet als argument om ExitScan-architectuur te heropenen.

## Concrete wijzigingen

- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) voorzien van expliciete runtime-boundary comments.
- Nieuwe runtime-wrapper toegevoegd: `_build_non_exit_runtime_story`.
- Dit boundary-document toegevoegd om de actieve versus historische generatorpaden vast te leggen.

## Validatie

- De runtimekeuze in `generate_campaign_report` is nu tekstueel en technisch explicieter leesbaar.
- Bestaande smoke/paritytests voor reportgeneratie blijven de actieve route verifiëren.

## Assumptions / defaults

- Deze stap verwijdert nog geen historische code.
- Een latere cleanup mag pas grote dode blokken verwijderen als alle relevante tests en text-based expectations daarop zijn voorbereid.

## Next gate

De beste volgende stap is `remaining buyer-facing parity sweep`, gevolgd door `dashboard status and parity cleanup follow-up`, zodat de zichtbare lagen geen oudere reportlezing of diagnose-taal meer doorgeven.
