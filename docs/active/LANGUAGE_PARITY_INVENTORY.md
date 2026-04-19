# LANGUAGE_PARITY_INVENTORY.md

## Titel

Language And Truth Parity Flow — Fase 1: Inventory

## Korte samenvatting

Deze inventory legt vast welke repo- en productbronnen momenteel feitelijk de taal van Verisight bepalen voor productdefinitie, rapporten, dashboards, previews en buyer-facing routes. Voor deze flow geldt `ExitScan` als belangrijkste embedded source of truth, met product truth boven marketing convenience en met productverbreding alleen als begrensde auditlaag.

De uitkomst van deze fase is geen definitieve canon, maar wel een gecontroleerde startset voor de reviewfase. De grootste opbrengst is dat de taalbronnen nu als lagen in kaart staan en dat de belangrijkste driftbronnen al zichtbaar zijn.

## Wat is geaudit

### 1. Governance- en canonbronnen

- `docs/ops/SOURCE_OF_TRUTH_CHARTER.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md`
- `docs/reference/METHODOLOGY.md`
- `docs/reporting/REPORT_ARCHITECTURE_POLICY.md`
- `docs/strategy/EXTERNAL_DOCS_ALIGNMENT.md`

### 2. ExitScan embedded truth-bronnen

- `backend/products/exit/definition.py`
- `backend/products/exit/report_content.py`
- `frontend/lib/products/exit/definition.ts`
- `frontend/lib/products/exit/dashboard.ts`
- `backend/report.py`

### 3. RetentieScan embedded truth-bronnen

- `backend/products/retention/definition.py`
- `frontend/lib/products/retention/definition.ts`
- `backend/report.py`
- `frontend/lib/report-preview-copy.ts`

### 4. Productverbreding en follow-on bronnen

- `backend/products/team/definition.py`
- `backend/products/onboarding/definition.py`
- `backend/products/pulse/definition.py`
- `backend/products/leadership/definition.py`
- `frontend/lib/products/shared/registry.ts`
- `docs/strategy/WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md`
- `docs/strategy/WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md`
- `docs/strategy/WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md`
- `docs/strategy/WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md`
- `docs/active/PRODUCT_PARITY_PROGRAM_PLAN.md`
- `docs/active/WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md`
- `docs/active/WAVE_01_ONBOARDING_METHOD_AND_INTERPRETATION_PARITY.md`
- `docs/active/WAVE_01_LEADERSHIP_METHOD_AND_INTERPRETATION_PARITY.md`

### 5. Buyer-facing en previewbronnen

- `frontend/lib/marketing-products.ts`
- `frontend/lib/report-preview-copy.ts`
- `frontend/app/page.tsx`
- `frontend/app/producten/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`

### 6. Secundaire of audit-only lagen

- `docs/reference/EXITSCAN_SALES_ONE_PAGER.md`
- `docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md`
- `Docs_External` via `docs/strategy/EXTERNAL_DOCS_ALIGNMENT.md`

### 7. Expliciet buiten primaire scope van deze fase

- website-redesign- en dashboard-redesigndocumenten
- pricing- en packagingbesluiten
- portfolio-promotie buiten taal- en truthaudit

## Belangrijkste bevindingen

1. De taal van Verisight wordt momenteel door vijf verschillende lagen geproduceerd: governance docs, backend productdefinitions, frontend productdefinitions/dashboardcopy, buyer-facing marketingcopy en parity/strategy docs.
2. `ExitScan` is vandaag de meest coherente embedded productketen. Productdefinitie, rapportinhoud en dashboardduiding sluiten redelijk op elkaar aan en worden bovendien in de report architecture expliciet als leidende embedded baseline benoemd.
3. `RetentieScan` heeft een sterke productspecifieke definitie, maar de rapportlaag is nog structureel minder hard dan `ExitScan`. De reporting policy noemt `ExitScan` expliciet de eerste volledig gemigreerde v3-referentie en houdt `RetentieScan` tijdelijk op een oudere flow.
4. De follow-on producten `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` hebben inmiddels runtime- en paritydocumentatie die inhoudelijk begrensd en relatief scherp is.
5. Buyer-facing marketingcode zet dezelfde follow-on producten tegelijk al als `live` en publiek navigeerbaar neer. Daardoor is de publieke taal verder naar voren geschoven dan sommige strategy- en foundation-wave-documenten oorspronkelijk als veilige grens beschreven.
6. De dynamische productpagina bevat voor `ExitScan` en `RetentieScan` nog duidelijk oudere, minder geharde copy dan de nieuwere canon in productdefinitions, taxonomy en previewcopy.
7. De repo kent meerdere concurrerende “source-of-truth” formuleringen. Voor deze thread is daarom extra belangrijk dat de inventory expliciet onderscheid maakt tussen embedded truth, governance truth en buyer-facing mirrors.

## Belangrijkste inconsistenties of risico’s

1. `docs/DOCUMENT_INDEX.md` noemt nog een algemene source-of-truth volgorde met prompt- en strategiedocs boven de embedded productlaag, terwijl deze hardening-thread `ExitScan` juist als belangrijkste embedded source of truth behandelt.
2. `docs/reporting/REPORT_ARCHITECTURE_POLICY.md` zegt dat `ExitScan` de leidende embedded rapportreferentie is, maar die prioriteit is nog niet duidelijk terug te zien in de bredere documentindex en governance-uitleg.
3. `frontend/lib/marketing-products.ts` markeert `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` als `live`, terwijl meerdere foundation-wave-documenten buyer-facing activatie of pricing juist nog buiten scope hielden. Dat is geen direct codebug, maar wel truth-drift tussen strategiegeschiedenis en huidige publieke positie.
4. `frontend/app/producten/[slug]/page.tsx` bevat voor `ExitScan` nog oudere taal zoals `Begrijp waarom medewerkers vertrekken`, `Beschikbaar als retrospectieve analyse of live scan` en enkele meer generieke managementclaims. Dat schuurt met de latere canon die nadrukkelijk spreekt over vertrekduiding, managementverhaal en niet-causale lezing.
5. `frontend/app/page.tsx` en `frontend/app/producten/page.tsx` houden de portfoliohierarchie vrij strak, maar de detailpagina’s zijn inhoudelijk niet volledig op hetzelfde truth-niveau. Er is dus drift tussen overview-layer en product-detail-layer.
6. De report architecture is suitebreed als herbruikbare grammar vastgelegd, maar `RetentieScan` staat volgens policy nog niet op die embedded baseline. Daardoor is taalparity tussen ExitScan en RetentieScan nog niet volledig structureel geborgd.
7. `PRODUCT_PARITY_PROGRAM_PLAN.md` benoemt follow-on routes als buyer-facing actief, terwijl deze hardening-thread expliciet waarschuwt tegen te vroege portfolio-promotie. Dat vraagt in de reviewfase een scherpe lezing: wat is runtime-realiteit, wat is portfolio-ambitie, en wat mag buyer-facing al als product truth gelden.

## Beslissingen / canonvoorstellen

1. Voor `Language And Truth Parity Flow` geldt voorlopig deze audit-hiërarchie:
   `ExitScan` embedded runtime sources -> product governance docs -> parity docs -> buyer-facing mirrors -> external docs.
2. Buyer-facing marketingpagina’s en productoverzichten worden in deze flow behandeld als te auditen mirrorlaag, niet als canonieke bron.
3. Follow-on producten blijven in deze flow inhoudelijk in scope, maar alleen als bounded productlijnen. Hun publieke positionering telt mee als driftbron en niet als automatische canon.
4. De reviewfase moet expliciet beoordelen of de publieke status van `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` al proportioneel is ten opzichte van hun methodische en rapportmatige volwassenheid.
5. Geen pricing-, packaging- of portfolio-promotiebesluiten in deze flow zonder escalatie.

## Concrete wijzigingen

1. Dit inventory-document is toegevoegd als nieuwe actieve hardening-output:
   `docs/active/LANGUAGE_PARITY_INVENTORY.md`
2. `docs/DOCUMENT_INDEX.md` is bijgewerkt zodat deze fase-output vindbaar is in de actieve documentlaag.

## Validatie

1. De inventory is gebaseerd op daadwerkelijk gelezen repo-bronnen in governance, backend, frontend, reporting en strategy.
2. De audit heeft expliciet zowel embedded truth-bronnen als buyer-facing spiegellagen meegenomen.
3. De inventory houdt redesign-, pricing- en portfolioverbreding buiten de primaire beslisruimte van deze fase.
4. De deliverable sluit aan op bestaande parity- en hardeningdocs in `docs/active`.

## Assumptions / defaults

1. Nieuwe deliverables voor dit programma landen in `docs/active` zolang ze actieve hardening-output zijn.
2. `ExitScan` geldt in deze thread als leidende embedded referentie wanneer documenten elkaar tegenspreken.
3. `Docs_External` blijft audit- en referentielaag en krijgt in deze flow geen truth-bepalende status.
4. Bestaande ongerelateerde worktree-wijzigingen buiten deze docs worden ongemoeid gelaten.

## Next gate

De beste volgende stap is:

`Language And Truth Parity Flow — Fase 2: Review`

Reviewdoel voor de volgende fase:

- per bronlaag expliciet vaststellen waar taal semantisch gelijk is
- drift tussen rapport, dashboard, preview en buyer-facing pages concreet uitwerken
- bepalen welke inconsistenties direct canonfixes vragen en welke eerst escalatie vragen
