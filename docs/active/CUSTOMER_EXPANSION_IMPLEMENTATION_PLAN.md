# Implementation Plan

## Titel

Customer Expansion Suggester Implementation Plan

## Korte samenvatting

De MVP landt als een pure frontend decision engine die bestaande campaign-, delivery- en learningdata vertaalt naar buyer-safe vervolgsuggesties. De engine rendert automatisch in het campaign-dashboard en in de learning-workbench, zonder nieuwe databasekolommen of pricingarchitectuur. Persistente handoff blijft in v1 lopen via bestaande velden zoals `next_route` en `follow_up_decided_at`.

## Wat is ontworpen

- trigger moment
- input schema
- decision rules
- output schema
- render/storage strategy
- handoff naar sales/onboarding/delivery
- testplan

## Belangrijkste bevindingen

- De beste technische plek is een gedeelde helper in `frontend/lib`, niet een backend service of migration-first oplossing.
- Het dashboard en de workbench vragen dezelfde logica, maar een andere presentatie:
  - dashboard: automatische routecards en summary
  - workbench: systemsuggesties + snelle overname naar `next_route`
- Delivery en learning hoeven niet fundamenteel te worden herbouwd om bruikbaar te zijn; de feature kan op bestaande primitives landen.

## Belangrijkste risico’s

- Te veel logica in `page.tsx` of de workbenchcomponent zou onderhoudbaarheidsrisico geven.
- Een nieuwe storage-laag zou disproportioneel zijn voor deze tranche.
- Zonder TDD is het risico groot dat routecanon en suppressie subtiel regressies krijgen.

## Beslissingen / canonvoorstellen

- Geen databasewijziging in MVP.
- Geen nieuwe API-route in MVP.
- Gedeelde engine in `frontend/lib/customer-expansion-suggester.ts`.
- Dashboard en workbench hergebruiken dezelfde outputstructuur.
- `next_route` blijft handmatig opslaan, maar kan vanuit de suggestie-UI snel ingevuld worden.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: `docs/active/CUSTOMER_EXPANSION_IMPLEMENTATION_PLAN.md`

## Trigger moment

- Primair triggermoment:
  - zodra de campaign lifecycle minstens `first_management_use` heeft bereikt
- Secundair previewmoment:
  - vanaf `first_value_reached`, maar dan alleen als readiness-uitleg en niet als echte vervolgbeslissing
- Follow-up refresh:
  - wanneer learningdossier-signalen zoals `review_moment`, `first_action_taken`, `management_action_outcome` of `next_route` veranderen

## Input schema

```ts
type CustomerExpansionInput = {
  scanType: ScanType
  deliveryMode: DeliveryMode | null
  responsesLength: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  firstManagementUseConfirmed: boolean
  followUpAlreadyDecided: boolean
  reviewMoment: string | null
  firstActionTaken: string | null
  managementActionOutcome: string | null
  nextRouteRecorded: string | null
  hasSegmentDeepDive: boolean
  eligibleDepartmentGroupCount: number
}
```

## Decision rules

1. Als `firstManagementUseConfirmed` false is:
   - return readiness summary
   - geen primary suggestion
2. Als huidige route `retention` is:
   - `retention_rhythm` eerst evalueren
   - daarna `compact_follow_up`
   - daarna `pulse`
3. `segment_deep_dive` alleen positief bij voldoende respons en segmentgrond.
4. `teamscan` alleen positief bij lokale verificatiegrond via `eligibleDepartmentGroupCount`.
5. Niet-gedragen routes blijven suppressed of `nu niet`.

## Output schema

```ts
type CustomerExpansionSuggestion = {
  routeKey: 'retention_rhythm' | 'compact_follow_up' | 'pulse' | 'segment_deep_dive' | 'teamscan'
  label: string
  status: 'aanbevolen' | 'te_overwegen' | 'nu_niet'
  confidence: 'hoog' | 'middel' | 'laag'
  rationale: string
  guardrail: string
  applyLabel: string
}

type CustomerExpansionResult = {
  readiness: 'not_ready' | 'ready' | 'already_decided'
  title: string
  summary: string
  blockers: string[]
  primaryRouteKey: CustomerExpansionSuggestion['routeKey'] | null
  suggestions: CustomerExpansionSuggestion[]
}
```

## Render/storage strategy

- Render 1: campaign-dashboard
  - nieuwe “Customer expansion suggester”-kaart in de sectie `30–90 dagenroute`
  - toont summary + routecards + guardrails
- Render 2: pilot-learning-workbench
  - nieuwe suggestiekaart bij `follow_up_review`
  - optionele quick-apply knop om een voorgestelde `applyLabel` in `next_route` te zetten
- Storage:
  - geen nieuwe persistente decision record in MVP
  - bestaande velden blijven leidend:
    - `pilot_learning_dossiers.next_route`
    - `campaign_delivery_records.follow_up_decided_at`

## Handoff naar sales / onboarding / delivery

- Sales:
  - leest geen nieuwe buyer-facing output, maar kan de workbenchsuggestie gebruiken als interne vervolgdiscipline
- Onboarding / delivery:
  - ziet de suggestie direct in het campaign-dashboard
  - kan pas naar `follow_up_decided` bewegen als handoff en eerste managementgebruik staan
- Learning:
  - kan suggesties vergelijken met de uiteindelijk gekozen `next_route`

## Geplande codewijzigingen

- Nieuw:
  - `frontend/lib/customer-expansion-suggester.ts`
  - `frontend/lib/customer-expansion-suggester.test.ts`
- Wijzigen:
  - `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
  - `frontend/components/dashboard/pilot-learning-workbench.tsx`
  - mogelijk `frontend/lib/pilot-learning.ts` voor presentatieteksten of helpergebruik

## Gepland testpad

- RED:
  - nieuwe unit-tests voor readiness, retention-prioriteit, bounded suppressie, segmentgates en teamgates
- GREEN:
  - minimale engine implementeren
  - dashboard/workbench render integreren
- VERIFY:
  - `npm.cmd test -- --run "lib/customer-expansion-suggester.test.ts" "lib/pilot-learning.test.ts" "app/(dashboard)/campaigns/[id]/page-helpers.test.ts" "lib/client-onboarding.test.ts"`
  - optioneel gerichte lint op aangepaste frontendbestanden

## Validatie

- Plan gebruikt alleen bestaande runtime surfaces en bestaande lifecycleprimitieven.
- Plan introduceert geen pricingwijziging, productstatuswijziging of nieuwe routepromotie.
- Plan houdt storage bewust klein en deferreert persistente decision logging.

## Assumptions / defaults

- Dashboard en workbench zijn voldoende operationele surfaces voor v1-adoptie.
- `eligibleDepartmentGroupCount` is een verdedigbare proxy voor lokale verificatiegrond in v1.
- Een quick-apply naar `next_route` is genoeg; automatische persistence zonder operatorhandeling is niet nodig.

## Next gate

MVP Implementation: tests eerst, engine bouwen, renderen in dashboard en workbench, daarna signoff schrijven.
