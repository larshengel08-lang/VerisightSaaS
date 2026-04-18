# EXITSCAN_IMPLEMENTATION_PARITY_CHECK.md

Last updated: 2026-04-18
Status: active
Source of truth: deze check toetst de actieve ExitScan-implementatielaag aan de vastgezette `P1-P10 + Appendix` canon in [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md).

## Titel

ExitScan Implementation Parity Check

## Korte samenvatting

De actieve ExitScan-rendering volgt de nieuwe hoofdstructuur grotendeels al correct. De grootste zichtbare drift zat niet in de embedded paginavolgorde zelf, maar in begeleidende mirror-uitleg en in een verouderde header in `backend/report.py` die nog een oude 7-pagina-opbouw noemde.

## Wat is geaudit

- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/report_content.py)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/definition.ts)
- [test_report_generation_smoke.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_report_generation_smoke.py)
- [test_reporting_system_parity.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_reporting_system_parity.py)

## Belangrijkste bevindingen

- Het actieve embedded ExitScan-pad in [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) bouwt al de vaste hoofdflow op:
  - cover
  - respons
  - bestuurlijke handoff
  - frictiescore & verdeling
  - signalensynthese
  - drivers
  - SDT
  - organisatiefactoren
  - eerste route & actie
  - methodiek / leeswijzer
  - technische appendix
- De smoke tests bevestigen deze volgorde al met `11` pagina's voor ExitScan.
- De technische appendix bevat al de drie gewenste subblokken:
  - onderliggende psychologische laag
  - item- en factorbasis
  - samengestelde werkfactorsignaal-logica

## Belangrijkste inconsistenties of risico’s

- De moduleheader van [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) noemde nog een oude 7-pagina-opbouw en was daarmee misleidend als technische truthlaag.
- De ExitScan-previewcopy zei nog dat het rapport “opent met een managementsamenvatting”, terwijl de canon nu expliciet `Cover -> Respons -> Bestuurlijke handoff` is.
- In dezelfde reportmodule bestaan nog oudere legacy-sectieblokken verderop in het bestand. Die lijken niet het actieve ExitScan-pad te sturen, maar blijven wel een onderhoudsrisico zolang ze in hetzelfde bestand leven.

## Beslissingen / canonvoorstellen

- Voor implementatieparity geldt het embedded pad `_build_exit_embedded_story` als actieve ExitScan-structuurdrager.
- Mirrorcopy moet de vaste openingsvolgorde van ExitScan benoemen als:
  - cover
  - respons
  - bestuurlijke handoff
- Verouderde beschrijvende headers of comments die nog een oudere hoofdopbouw noemen, tellen als truth-drift en moeten worden aangepast of later opgeschoond.

## Concrete wijzigingen

- Truth-fix in [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py): header nu gelijkgetrokken met de vaste ExitScan `P1-P10 + Appendix` opbouw.
- Mirror-fix in [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts): ExitScan-intro en bewijsuitleg benoemen nu eerst cover en respons, daarna bestuurlijke handoff.
- Regressiecheck aangescherpt in [test_reporting_system_parity.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_reporting_system_parity.py).

## Validatie

- De actieve smoke tests voor ExitScan ondersteunen al de vaste 11-pagina-structuur.
- De paritytest controleert nu expliciet dat previewcopy de nieuwe openingsvolgorde weerspiegelt en dat `backend/report.py` niet meer claimt dat ExitScan een 7-pagina-rapport is.

## Assumptions / defaults

- Deze stap verandert geen visuele rapportlayout en herschrijft geen renderlogica buiten duidelijke truth-fixes.
- De bestaande appendix-implementatie is inhoudelijk voldoende dicht op de canon om nu als `parity-aligned` te gelden.
- Legacyblokken in `backend/report.py` worden in deze stap niet verwijderd zolang niet is bewezen dat ze volledig buiten runtimepad liggen.

## Next gate

De beste volgende stap is een gerichte `legacy report path isolation` of `report generator cleanup`, zodat oude niet-actieve paginacommentaren en parallelle renderblokken niet opnieuw truth-drift veroorzaken.
