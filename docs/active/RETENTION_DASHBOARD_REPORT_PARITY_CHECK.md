# RetentieScan Dashboard Report Parity Check

## Titel

`RetentieScan dashboard/report parity check`

## Korte samenvatting

De parity-check laat zien dat RetentieScan inhoudelijk al sterk aligned was, maar dat preview en dashboard de reportvolgorde net te compact samenvatten. Die verhaallijn is nu aangescherpt zodat cover, bestuurlijke handoff, drivers, actie en eerste managementsessie in alle lagen dezelfde managementlijn volgen.

## Wat is geaudit

- `backend/report.py`
- `backend/products/retention/definition.py`
- `backend/products/retention/report_content.py`
- `frontend/lib/products/retention/definition.ts`
- `frontend/lib/report-preview-copy.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`

## Belangrijkste bevindingen

- De runtime volgt voor RetentieScan al een duidelijke lijn: cover met executive context, daarna bestuurlijke handoff, vervolgens drivers, actie en eerste managementsessie.
- De preview-intro comprimeerde die volgorde te sterk tot één gecombineerde sponsorlaag.
- De dashboard-handofflaag benoemde dezelfde inhoud, maar met net andere labels dan rapport en preview.

## Belangrijkste inconsistenties of risico’s

- Als preview en dashboard de eerste leeslaag anders labelen dan het rapport, ontstaat opnieuw drift in hoe buyers en klanten de route begrijpen.
- Te compacte samenvatting van de openingslaag kan later redesign- of salescopy opnieuw naar een tweede waarheid trekken.

## Beslissingen / canonvoorstellen

- Voor RetentieScan geldt nu expliciet deze gedeelde managementlijn:
  `cover met executive context -> bestuurlijke handoff -> signaalbeeld/drivers -> eerste actie -> eerste managementsessie`
- `Bestuurlijke handoff` blijft de leidende naam voor de executive leeslaag na de cover.
- Dashboard en preview mogen compacter formuleren, maar niet de volgorde of betekenis van die leeslaag vervormen.

## Concrete wijzigingen

- `frontend/lib/report-preview-copy.ts`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/lib/report-preview-copy.test.ts`

## Validatie

- Gerichte preview-tests.
- Frontend build voor dashboard- en previewmutaties.

## Assumptions / defaults

- Deze parityfix verandert de RetentieScan-runtime niet; hij brengt alleen preview- en dashboardtaal terug naar de huidige reportrealiteit.
- `managementspoor` blijft hier een toegestane ondersteunende term onder de hoofdlijn `bestuurlijke handoff`.

## Next gate

`RetentieScan method/read parity review follow-up`
