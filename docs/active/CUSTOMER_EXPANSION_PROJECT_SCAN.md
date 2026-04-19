# Project Scan And Expansion Boundary Audit

## Titel

Project Scan And Expansion Boundary Audit

## Korte samenvatting

De repo heeft al een duidelijke lifecycle-, onboarding- en follow-upstructuur, maar nog geen canonieke expansion-suggester. De huidige flow bevat wel statische vervolgkaarten in het campaign-dashboard, een delivery stage `follow_up_decided` en een vrije `next_route` in pilot learning. Daardoor bestaat de lifecycle-haak al, maar ontbreekt nog een begrensde, producttruth-first beslislaag die consequent bepaalt welk vervolg nu wel, nog niet of alleen handmatig voorstelbaar is.

## Wat is geaudit

- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_STATUS_BOARD.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/NON_CORE_OUTPUT_PARITY_REVIEW.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/NON_CORE_DASHBOARD_PARITY_MATRIX.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ROUTE_SELECTION_FLOW.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_FIRST_VALUE_FLOW.md`
- `C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/backend/models.py`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/backend/schemas.py`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/client-onboarding.ts`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/pilot-learning.ts`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/lib/ops-delivery.ts`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/customer-expansion-suggester/frontend/components/dashboard/pilot-learning-workbench.tsx`

## Belangrijkste bevindingen

- De commerciële default is expliciet `dual-core`: alleen `ExitScan` en `RetentieScan` zijn first-buy kernroutes; al het andere blijft verdieping, bounded vervolg of portfoliokader.
- De onboardingcanon staat al strak: routekeuze -> implementation intake -> setup -> first value -> eerste managementgebruik -> follow-up. Een expansion-besluit hoort dus pas ná first value en first action te komen.
- De productstatus is asymmetrisch en moet leidend blijven:
  - `ExitScan`, `RetentieScan`: `core_proven`
  - `TeamScan`, `Onboarding 30-60-90`: `parity_build`
  - `Pulse`, `Leadership Scan`: `bounded_support_route`
  - `Combinatie`: `portfolio_route`
- Het campaign-dashboard heeft al statische `getLifecycleDecisionCards(scanType)`-copy, maar die is niet data-driven en houdt geen rekening met actuele delivery gates, reviewmomenten of metadata-geschiktheid.
- De deliverylaag kent al de lifecycle stage `follow_up_decided`, maar bewaart nog geen gestructureerde suggestie of decision result.
- De learninglaag bewaart al relevante signalen zoals `first_management_value`, `first_action_taken`, `review_moment`, `management_action_outcome` en een vrije `next_route`, maar geeft nog geen canonieke voorstelvolgorde terug.
- De codebase heeft al twee natuurlijke renderpunten voor een MVP:
  - het campaign-dashboard in de sectie `30–90 dagenroute`
  - de learning-workbench bij checkpoint `follow_up_review`

## Belangrijkste risico’s

- Een te brede suggester zou bounded of parity-build routes te vroeg laten voelen als suite-default, wat botst met de commercial canon.
- Een te agressieve suggester zou `next_route` vullen op basis van opportunistische upsell in plaats van op basis van first value, eigenaar en route-fit.
- Een te losse suggester zou core-routewissels impliciet normaliseren zonder expliciete nieuwe managementvraag.
- `COMMERCIAL_ARCHITECTURE_CANON.md` is op dit moment wel aanwezig in de bronworkspace, maar niet git-tracked op `main`; de feature moet dus de inhoud volgen zonder te veronderstellen dat alle truth-docs al op deze branch zitten.
- De baseline in deze worktree is niet volledig schoon:
  - `python -m pytest tests/test_customer_lifecycle_and_expansion_model.py -q` faalt al vooraf op een bestaande copy-assertie in `frontend/app/tarieven/page.tsx`
  - relevante frontend-baselinetests slagen wel

## Beslissingen / canonvoorstellen

- De suggester mag alleen routes voorstellen die productmatig en commercieel vandaag al verdedigbaar zijn.
- De suggester moet prioriteren, niet verkopen: de uitkomst is `aanbevolen`, `te overwegen` of `nu niet`, nooit een harde upsell.
- Auto-proposals moeten lifecycle-gated zijn:
  - geen besluitniveau vóór first management use
  - geen vervolgpromotie zonder first action of reviewlogica
  - geen TeamScan zonder lokale verificatiegrond
  - geen Segment Deep Dive zonder voldoende metadata- of segmentbasis
- Core-routeverschuivingen blijven voorlopig buiten auto-suggestie en vragen expliciete menselijke bevestiging van een nieuwe managementvraag.
- `Pulse` blijft bounded reviewroute; `RetentieScan ritme` blijft de sterkste buyer-safe vervolglaag binnen RetentieScan; `compacte vervolgmeting` blijft smaller dan een vol ritmebesluit.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_PROJECT_SCAN.md`

## Bestaande vervolgroutes in repo-truth

| Vervolgvorm | Huidige repo-status | Bestaande haak in code of canon | Auto-suggestiepotentieel v1 |
| --- | --- | --- | --- |
| RetentieScan ritme | buyer-safe vervolgvorm binnen core route | lifecycle canon, onboarding copy, dashboard copy | ja, sterk |
| Compacte vervolgmeting | bounded repeat binnen bestaande route | lifecycle canon, bounded reviewlogica | ja, maar alleen begrensd |
| Pulse | bounded support route | product definition, dashboard snapshotlogica | ja, voorzichtig |
| Segment Deep Dive | add-on / verdieping | `enabled_modules`, metadata- en n-logica | ja, alleen met bewijs |
| TeamScan | parity-build lokale verificatie | TeamScan dashboard en canon | ja, alleen als lokale verificatie |
| Onboarding 30-60-90 | parity-build lifecycle-check | canon en productstatusboard | niet automatisch in v1 |
| Leadership Scan | bounded support route | canon en non-core parity docs | niet automatisch in v1 |
| Combinatie | portfolio route | canon en lifecycleplan | niet automatisch |

## Validatie

- De scan is herleidbaar naar de actieve commercial canon, packaginglogica, productstatus en onboardingflow.
- De scan sluit aan op de huidige codehaak in dashboard, delivery en pilot learning.
- Baseline-checks:
  - `python -m pytest tests/test_customer_lifecycle_and_expansion_model.py -q` -> 1 bestaande failure, geen featuregerelateerde regressieanalyse mogelijk op dit moment
  - `npm.cmd test -- --run "app/(dashboard)/campaigns/[id]/page-helpers.test.ts" "lib/client-onboarding.test.ts" "lib/pilot-learning.test.ts"` -> geslaagd

## Assumptions / defaults

- De feature landt in deze tranche zonder nieuwe pricing-, billing- of CRM-laag.
- `first_management_use` en `follow_up_decided` blijven de bestaande operationele lifecycle-ankers.
- `next_route` in pilot learning blijft voorlopig vrije tekst; de MVP hoeft geen nieuwe databasekolom te introduceren om waarde te leveren.
- Niet alle follow-on routes hoeven in v1 automatisch voorgesteld te worden om de feature commercieel bruikbaar te maken.

## Next gate

Expansion Logic Design: expliciet vastleggen welke inputs mogen sturen, welke routes wel of niet automatisch voorstelbaar zijn en hoe confidence/claims begrensd worden.
