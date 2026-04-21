# RETENTION_REPORT_GRAMMAR_PARITY_REVIEW.md

Last updated: 2026-04-18
Status: active derived review
Authoritative inputs: deze review toetst de huidige RetentieScan-runtime en mirrors aan de gedeelde report grammar, zonder RetentieScan ten onrechte als vaste ExitScan-architectuur te behandelen. De canonieke reporting truth lives in `docs/reporting/*`.

## Titel

RetentieScan Report Grammar Parity Review

## Korte samenvatting

RetentieScan blijkt inhoudelijk dicht op de gedeelde report grammar te zitten, maar niet in exact dezelfde vorm als ExitScan. De belangrijkste parityfix is daarom niet een architectuurfreeze, maar een eerlijkere beschrijving: RetentieScan gebruikt nu een cover gevolgd door een compacte bestuurslaag waarin respons, bestuurlijke handoff en eerste verificatiesporen samenkomen.

## Wat is geaudit

- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [test_report_generation_smoke.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_report_generation_smoke.py)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>)

## Belangrijkste bevindingen

- De RetentieScan-smoketest laat nu deze runtimevolgorde zien:
  - cover
  - gecombineerde bestuurslaag met respons + bestuurlijke handoff
  - drivers & prioriteitenbeeld
  - kernsignalen in samenhang
  - eerste route & managementactie
  - compacte methodiek / leeswijzer
  - optionele segmentanalyse
  - technische verantwoording
- Buyer-facing copy liep nog iets vooruit door te spreken alsof `managementsamenvatting` een losse openingspagina is.
- De gedeelde report grammar draagt deze compactere Retentie-lezing al, zolang we die niet verwarren met de harde ExitScan-architectuur.

## Belangrijkste inconsistenties of risico’s

- Zonder expliciete notitie kan RetentieScan onterecht gelezen worden alsof het exact hetzelfde openingspatroon heeft als ExitScan.
- Te veel copy kan nog steeds impliceren dat respons en handoff gescheiden pagina’s zijn, terwijl de huidige runtime ze bundelt.

## Beslissingen / canonvoorstellen

- RetentieScan blijft `shared grammar aligned`, niet `ExitScan-architectuur aligned`.
- De huidige RetentieScan-runtime mag buyer-facing worden samengevat als:
  - cover
  - compacte bestuurlijke read
  - verificatie en prioritering
  - eerste route en review
- Dit is een huidige runtimebeschrijving, geen harde architectuurfreeze.

## Concrete wijzigingen

- RetentieScan previewcopy aangepast in [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- RetentieScan productdetailcopy aangepast in [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>)
- Canonnotities toegevoegd in [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md) en [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- Previewtest geactualiseerd in [report-preview-copy.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.test.ts)

## Validatie

- De bestaande RetentieScan-smoketest blijft leidend voor de huidige runtimevolgorde.
- Frontend previewtests moeten nu bevestigen dat de mirrorcopy dezelfde compactere bestuurslaag weerspiegelt.

## Assumptions / defaults

- Deze review verandert geen RetentieScan-runtime in het rapport zelf.
- `Managementsamenvatting` blijft als ondersteunende term bruikbaar, zolang niet wordt gesuggereerd dat dit een losse openingspagina is.

## Precedence rule

Deze review beschrijft een actuele paritylezing, maar is geen zelfstandige structuurcanon. Als deze review botst met `docs/reporting/REPORT_STRUCTURE_CANON.md`, `docs/reporting/REPORT_TRUTH_BASELINE.md` of `docs/reporting/REPORT_METHODOLOGY_CANON.md`, dan wint de reporting canon.
