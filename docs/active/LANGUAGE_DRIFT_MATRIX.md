# LANGUAGE_DRIFT_MATRIX

Last updated: 2026-04-18  
Status: active  
Source of truth: ExitScan embedded runtime truth is leading for this review; shared report grammar follows the current canon, buyer-facing pages are mirrors, and working maturity labels remain internal program labels.

## Titel

Language And Truth Parity Flow - Reviewfase

## Korte samenvatting

Deze reviewfase maakt expliciet waar taal nu al klopt tussen embedded productdefinities, rapportgrammar en buyer-facing lagen, en waar drift zit. De grootste drift zit niet in de embedded productkern, maar in oudere detailpagina-copy, voorbeeldrapporten die deels achterlopen op de nieuwere report grammar, en statuswoorden in de portfolio-overzichtslaag die harder klinken dan de huidige hardeningstatus draagt.

## Wat is geaudit

- [PRODUCT_TRUTH_HARDENING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_TRUTH_HARDENING_PROGRAM_PLAN.md)
- [REPORT_TRUTH_BASELINE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TRUTH_BASELINE.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [LANGUAGE_PARITY_INVENTORY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_PARITY_INVENTORY.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)
- [REPORTING_SYSTEM_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORTING_SYSTEM_SHARPENING_PLAN.md)
- [REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md)
- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)
- [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf)
- [voorbeeldrapport_retentiescan.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_retentiescan.pdf)
- `C:/Users/larsh/Downloads/verisight_spec_v3.html`
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/report_content.py)
- [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/definition.ts)
- [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts)
- [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)

## Belangrijkste bevindingen

- ExitScan heeft de scherpste embedded producttaal en is daarom de leidende baseline voor taal- en truthbeslissingen.
- RetentieScan is inhoudelijk sterk en al duidelijk als kernroute geformuleerd, maar buyer-facing detailcopy gebruikt nog headline-taal die deels afwijkt van de embedded kernterm.
- De gedeelde report grammar is al zichtbaar in [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md), [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) en `verisight_spec_v3.html`.
- De grootste buyer-facing drift zit in detailpagina-copy en in de portfolio-overzichtslaag, niet in de embedded runtime-definities.
- Working maturity labels zijn nuttig voor interne hardening, maar nog niet geschikt als repo-brede publieke statuslaag.

## Belangrijkste inconsistenties of risico's

- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) gebruikt voor ExitScan en RetentieScan nog oudere marketingformuleringen die te generiek of te delivery-gedreven zijn.
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) markeert follow-on routes als `live`, terwijl dit harder klinkt dan de huidige hardening- en paritystatus ondersteunt.
- [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf) laat een oudere hoofdstuktaal zien dan de huidige gedeelde grammar.
- Zonder expliciete laagvolgorde kunnen operators of redesignthreads oudere buyer-facing copy onterecht behandelen als canon.

## Driftmatrix

| Domein | Artefact / laag | Huidige term of formulering | Gewenste canon | Laagtype | Drift / risico | Prioriteit |
| --- | --- | --- | --- | --- | --- | --- |
| ExitScan | [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py) en [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/exit/definition.ts) | `begeleide exitscan`, `terugkijkende vertrekduiding op groepsniveau`, `Frictiescore` | Bevestigen als hoofdtaal voor ExitScan | Embedded truth | Geen inhoudelijke drift; dit is de baseline | Laag |
| ExitScan | [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) | `Begrijp waarom medewerkers vertrekken` | `Terugkijkende vertrekduiding op groepsniveau` als hoofdpositie; verklarende copy mag ondersteunend zijn | Buyer-facing mirror | Generieke why-copy vervaagt het verschil tussen duiding en diagnose | Hoog |
| ExitScan | [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) | `Beschikbaar als retrospectieve analyse of live scan.` | Leveringsvorm alleen secundair benoemen, niet als hoofdidentiteit | Buyer-facing mirror | Delivery mode wordt belangrijker gemaakt dan productkern | Hoog |
| ExitScan | [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/report_content.py) en [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) | `Bestuurlijke handoff`, `Drivers & prioriteitenbeeld`, `Kernsignalen in samenhang`, `Eerste route & managementactie`, `Compacte methodiek / leeswijzer` | Bevestigen als gedeelde report grammar | Shared grammar | Geen; dit is de huidige grammar | Laag |
| ExitScan | [voorbeeldrapport_verisight.pdf](/C:/Users/larsh/Desktop/Business/Verisight/docs/examples/voorbeeldrapport_verisight.pdf) | oudere hoofdstuklabels zoals `RESPONS` en `Frictiescore & verdeling van het vertrekbeeld` | Nieuwe buyer-facing mirrors moeten de gedeelde grammar volgen | Buyer-facing mirror | Voorbeeldrapport loopt deels achter op canon en kan oude taal legitimeren | Hoog |
| RetentieScan | [definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py) en [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts) | `compacte scan`, `vroegsignalering op behoud`, `Retentiesignaal` | Bevestigen als hoofdtaal voor RetentieScan | Embedded truth | Geen materiële drift; wel deels target-architectuur voor bredere keten | Laag |
| RetentieScan | [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) | `Zie waar behoud en werkfrictie onder druk staan` | `Vroegsignalering op behoud op groeps- en segmentniveau` als headline; werkfrictie alleen contextueel | Buyer-facing mirror | `werkfrictie` schuift van ondersteunend signaal naar headline en vertroebelt de productvraag | Hoog |
| RetentieScan | [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) | `Beschikbaar als live meting of gerichte momentopname.` | Leveringsvorm alleen ondersteunend; productkern blijft vroegsignalering | Buyer-facing mirror | Delivery framing verdringt managementvraag | Hoog |
| RetentieScan | [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts) | `Retentiesignaal` met `stay-intent`, `vertrekintentie`, `bevlogenheid` aanvullend | Bevestigen als metrichiërarchie in taal | Embedded truth | Geen; taal ondersteunt al een hoofdmetric met aanvullende signalen | Laag |
| Shared report grammar | [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md), `verisight_spec_v3.html`, [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) | `Executive cover`, `Bestuurlijke handoff`, `Drivers & prioriteitenbeeld`, `Kernsignalen in samenhang`, `Eerste route & managementactie`, `Compacte methodiek / leeswijzer` | Bevestigen als gedeelde grammar, niet als rigide identieke structuur | Shared grammar | Risico zit vooral in te rigide interpretatie, niet in terminologie | Middel |
| Portfolio-overzicht | [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) | `status: 'live'` voor follow-on routes | Interne working labels of neutrale publieke routewoorden; geen harde live-status als parity nog loopt | Buyer-facing mirror / working labels | Productstatus klinkt verder uitgekristalliseerd dan current hardening ondersteunt | Hoog |
| Product maturity | hardening-programma en reviewdocs | `core_proven`, `parity_build`, `bounded_support_route`, `portfolio_route` | Intern gebruiken als working labels, nog niet repo-breed canoniseren | Working maturity labels | Te vroege canonisering kan productpromotie of roadmapclaims impliciet vastzetten | Middel |
| Combinatie | [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md) en buyer-facing productlaag | combinatie als portfolioroute | Bevestigen als route, niet als derde kernproduct | Shared grammar / buyer-facing mirror | Geen grote drift, wel bewaken tegen suite-taal | Laag |
| Follow-on routes | [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx) | `Bounded follow-on route`, `geen derde kernproduct`, `geen 360-tool` | Bevestigen als begrenzende taal voor TeamScan, Pulse, Leadership | Buyer-facing mirror | Deze laag is inhoudelijk bruikbaar en beschermt tegen suite drift | Laag |
| Onboarding / action layer | [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md) en [report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts) | `eerste managementsessie`, `eerste route`, `first value`, `report-to-action` | Management- en handofftaal op elkaar houden | Shared grammar | Beperkte drift; vooral consolideren in canon | Laag |

## Beslissingen / canonvoorstellen

- Laagvolgorde voor taalbesluiten in deze hardeningstap is: embedded truth -> shared grammar -> buyer-facing mirror -> working maturity labels.
- ExitScan embedded definities zijn leidend wanneer buyer-facing copy of voorbeeldrapporten afwijken.
- RetentieScan embedded definities zijn leidend voor producttaal, met de nuance dat de bredere keten deels nog target-architectuur volgt.
- De gedeelde report grammar is verplicht als lees- en benoemingsgrammar, maar niet als sjabloon voor identieke rapportstructuren.
- Working maturity labels blijven intern programmagereedschap en mogen niet automatisch doorsijpelen naar buyer-facing copy, dashboardlabels of rapporttitels.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [LANGUAGE_DRIFT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_DRIFT_MATRIX.md)
- Drift bevindingen gegroepeerd per laagtype zodat vervolgfixes later zonder redesign-discussie geprioriteerd kunnen worden

## Validatie

- Elke genoemde drift is getoetst tegen minimaal een embedded bron en een mirrorbron.
- De matrix maakt expliciet onderscheid tussen confirmed canon, buyer-facing drift en interne working labels.
- De review blijft binnen hardening-scope en zet geen nieuwe commerciële status hard.

## Assumptions / defaults

- Voorbeeldrapporten gelden als mirror-output en niet als leidende canon zodra ze afwijken van embedded truth of vastgestelde report grammar.
- Buyer-facing productpagina's mogen ondersteunende marketingtaal gebruiken, zolang die niet de hoofdvraag, metric of methodische grens van het product overschrijft.
- `live`, `momentopname` en vergelijkbare termen worden behandeld als leverings- of activatietaal, niet als productkern.

## Next gate

Product Language Canon finaliseren op basis van deze driftmatrix, daarna pas gerichte copy- of parity-fixes doorvoeren.
