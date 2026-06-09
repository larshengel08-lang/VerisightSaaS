# Action Center — Reviewmomenten: Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een nieuwe pagina `app/(dashboard)/action-center/reviewmomenten/page.tsx` bouwen die geplande reviewmomenten, status, uitkomsten en herweging per scope/route toont, strikt afgebakend tot reviewritme en opvolging — geen dashboardduiding, geen automatische reviewadviezen.

**Architecture:** Server Component page die dezelfde data-laag hergebruikt als `app/(dashboard)/action-center/page.tsx` (zelfde Supabase-queries, zelfde helper-functies). De viewlogica voor urgentie-lanes (achterstallig / deze week / binnenkort / afgerond) wordt in een geïsoleerde helper `lib/action-center-review-moments.ts` geplaatst. Visuele componenten worden gebouwd als geïsoleerde Client Components in `components/dashboard/` die de bestaande design tokens volgen.

**Tech Stack:** Next.js 15 App Router, React 19, Supabase (admin client), TypeScript strict, Tailwind v4 CSS custom properties, Vitest voor unit tests, Playwright voor route-shelltest.

---

## Korte samenvatting

De pagina `/action-center/reviewmomenten` bestaat als nav-item in `ACTION_CENTER_NAV` (shell-navigation.ts:268) maar heeft geen bijbehorende page.tsx. Dit plan beschrijft hoe Codex de pagina van nul bouwt: inspecteren, datacontract vaststellen, geïsoleerde visual slice bouwen, echte data koppelen, integreren, testen.

---

## Doel

Een bruikbare, mobile-ready pagina die reviewritme en opvolging toont per scope/route. HR-manager of Verisight admin ziet in één oogopslag welke reviewmomenten achterstallig zijn, welke deze week komen, welke er aan zitten te komen en welke zijn afgerond — inclusief scopekoppeling, managereigenaar en laatste bekende uitkomst.

---

## Niet-doelen

- Geen dashboardinterpretatie of rapportduiding.
- Geen automatische reviewadviezen of AI-gegenereerde reviewagenda.
- Geen recurring automation of planningstool.
- Geen generieke workflowautomatisering.
- Geen nieuwe productclaims die niet door bestaande data worden gedekt.
- Geen mockdata in productie.
- Geen silent 0-fallbacks voor betekenisvolle ontbrekende data.
- Geen paginarol-drift: de pagina gaat uitsluitend over reviewritme en opvolging.

---

## Bronnen en inputs

| Bron | Doel |
|------|------|
| `app/(dashboard)/action-center/page.tsx` | Bestaande data-fetch laag en access-checks — leidend |
| `lib/action-center-preview-model.ts` | `ActionCenterPreviewItem` type — primaire data-unit |
| `lib/action-center-live.ts` + `lib/action-center-live-context.ts` | `buildLiveActionCenterItems()` en `getLiveActionCenterSummary()` |
| `lib/action-center-review-decisions.ts` + `lib/pilot-learning.ts` | `ActionCenterReviewDecision`, `AuthoredActionCenterDecision` |
| `lib/action-center-route-contract.ts` | `ActionCenterReviewOutcome`, `ActionCenterRouteStatus` |
| `lib/dashboard/shell-navigation.ts:265-271` | `ACTION_CENTER_NAV` — route `/action-center/reviewmomenten` al aanwezig |
| `components/dashboard/dashboard-shell.tsx` | Shell-wrapper — geen aanpassing vereist |
| `components/dashboard/action-center-preview.tsx` | Bestaand component — Codex mag patronen overnemen, niet breken |
| Stitch visual (`code.html` + `screen.png`) | Uitsluitend visuele referentie voor layout en copy |
| `DESIGN.md` | Design-systeem tokens (kleuren, typografie, spacing) |

---

## Product- en canonregels

1. **Fail loud, never fake** — geen silent fallback die ontbrekende data als 0 toont als 0 inhoudelijk misleidend is. Toon "Niet beschikbaar" of laat de sectie weg.
2. **Multi-tenant** — data altijd gefilterd op `orgIds` afgeleid van `loadSuiteAccessContext`. Nooit org-globale queries.
3. **RLS leidend** — adminClient bypast RLS alleen waar dat al zo was in de bestaande page. Geen nieuwe RLS-bypasses introduceren buiten het bestaande patroon.
4. **Reviewmomenten ≠ scheduling tool** — de pagina toont wat er is, niet wat er zou moeten zijn.
5. **Teams en Managers moeten helder zijn voor reviews logisch landen** — als `assignedManager` ontbreekt of `teamLabel` leeg is, is dat een zichtbare data-gap, geen silent null.
6. **Geen push naar main** in dit plan.

---

## Gewenste informatiearchitectuur

```
Paginakoptekst
  ├── Broodkruimel: [Tenant naam] · Action Center · HR scope
  ├── Paginatitel: "Reviewmomenten"
  ├── Subtitel: "Bewaak geplande opvolgmomenten, gekoppelde scopes en bekende uitkomsten."
  └── Contextbanner: "Deze pagina toont reviewritme. Geen scananalyse, rapportduiding of generieke planning."

Filterrij (client-side)
  ├── Status-dropdown
  ├── Scope-dropdown
  └── Manager-dropdown

Tellerrij (4 kaarten)
  ├── Achterstallig (rood accent)
  ├── Deze week (amber accent)
  ├── Binnenkort (teal accent)
  └── Afgerond (grijs accent)

Reviewlanes (gesorteerd op urgentie)
  ├── Lane: Achterstallig
  │     └── ReviewMomentCard × n (grid 2 col md)
  ├── Lane: Deze week
  │     └── ReviewMomentCard × n
  ├── Lane: Binnenkort
  │     └── ReviewMomentCard × n
  └── (Afgeronde items verschijnen alleen via "Bekijk afgeronde reviews"-knop of status-filter)

Detailpaneel (sticky rechts, 4-col op lg)
  └── Toont scope, reviewstatus, manager, route-info en laatste uitkomst van geselecteerde kaart

Governance-sectie (onder de fold)
  ├── Achterstallig (>48u verstreken, geen statusupdate)
  ├── Uitkomst ontbreekt (review geopend, geen decision/outcome)
  ├── Scope ontbreekt (geen dept of org scope)
  └── Manager ontbreekt (geen manager_assignee)

Footerbalk
  └── "Reviewmomenten tonen ritme en discipline. Acties, dashboardduiding en rapportinhoud staan op aparte pagina's."
```

---

## Visuele target uit Stitch

De Stitch HTML (`code.html`) toont:
- **Sidebar-nav**: Deep Navy achtergrond, actief item "Review Moments" met teal left-border en teal-kleur tekst.
- **Topbalk**: `Action Center` als h1, subtabs (Dashboard / Analytics / Reviews / Governance), "Create Review"-knop in teal.
- **Pagina-header**: broodkruimel, h2 "Reviewmomenten", subtitel, contextbanner (info-icon, blauw tint).
- **Filterrij**: drie secondary buttons (Status / Scope / Manager), "Laatste update" timestamp rechts.
- **Tellerrij**: 4 kaarten, elk met `border-l-4`, icon rechts, groot `metric-value` getal, kleine toelichting.
- **Review lanes**: elke lane heeft een h3 + badge-counter, cards in grid-2. Card bevat: datum, status-chip, scope-naam, campagne-naam, manager-naam of "Geen manager gekoppeld", laatste uitkomst in italic quote-box, actieknop.
- **Detail panel** (4 col, sticky): "Reviewdetail"-label, h3 scope+campagne, 3 info-blokken (Reviewstatus / Scope / Route), dark-navy quote-blok met CTA.
- **Governance-sectie**: 4 kaarten met icon, naam en omschrijving van het governance-type.
- **Footer**: links "Bekijk afgeronde reviews", rechts "Bekijk gekoppelde opvolging".

> Stitch is uitsluitend visuele referentie. Alle labels, logica en data komen uit de Verisight-codebase.

**Afwijkingen van Stitch die Codex moet respecteren:**
- Geen "Create Review"-knop: Verisight heeft geen self-service review-aanmaakmechanisme.
- Geen "Analytics"-tab in topbalk: niet in `ACTION_CENTER_NAV`.
- Avatar/profielfoto in topbalk: niet in scope.
- Governance-sectie: alleen tonen als data daartoe aanleiding geeft, niet altijd hardcoded.

---

## Bestaande code die Codex eerst moet inspecteren

| Bestand | Wat te inspecteren |
|---------|-------------------|
| `app/(dashboard)/action-center/page.tsx` | Volledige data-fetch flow, access-checks, `buildLiveActionCenterItems()`, hoe `items` worden opgebouwd |
| `lib/action-center-preview-model.ts` | Volledig `ActionCenterPreviewItem` interface — alle velden en typen |
| `lib/action-center-live.ts` | `buildLiveActionCenterItems()` return type en logic |
| `lib/action-center-route-contract.ts` | `ActionCenterReviewOutcome`, `ActionCenterRouteStatus`, `ActionCenterRouteContract` |
| `lib/action-center-review-decisions.ts` | `sortActionCenterReviewDecisions()`, `AuthoredActionCenterDecision` waarden |
| `lib/pilot-learning.ts` | `ActionCenterReviewDecision` interface velden incl. `next_check`, `decision_recorded_at` |
| `lib/dashboard/shell-navigation.ts:265-271` | `ACTION_CENTER_NAV` — bevestig dat `/action-center/reviewmomenten` al aanwezig is |
| `components/dashboard/dashboard-shell.tsx` | Hoe `ActionCenterSidebarNav` en `ACTION_CENTER_NAV` worden gebruikt |
| `components/dashboard/action-center-preview.tsx` | Bestaande component-patronen, CSS custom properties, design token gebruik |
| `components/dashboard/dashboard-primitives.tsx` | Herbruikbare primitives (indien aanwezig) |
| `app/(dashboard)/action-center/page.entry-shell.test.ts` | Testpatroon voor route-shell tests |
| `app/(dashboard)/action-center/page.route-shell.test.ts` | Testpatroon voor route-render zonder crash |

---

## Pre-implementation audit en datacontract

Codex **moet** deze tabel volledig invullen vóór implementatie. Kolommen "bestaande bron" en "open vraag/datagap" moeten op basis van code-inspectie worden ingevuld.

| UI-element | Benodigde data | Bestaande bron/helper | Schaal/betekenis | Fallbackgedrag als ontbreekt | Mag in productie tonen | Open vraag / datagap |
|---|---|---|---|---|---|---|
| Paginatitel "Reviewmomenten" | — | Hardcoded | — | n.v.t. | ja | — |
| Broodkruimel tenant-naam | `organizationName` per item | `ActionCenterPreviewItem.coreSemantics.meta.organizationName` of `organizationById.get(orgId)?.name` | String | "Verisight organisatie" | ja | Controleer welk veld leidend is als er meerdere orgs zijn |
| Tellerrij: Achterstallig | Aantal items waarvan `reviewDate < now - 48h` én `reviewOutcome === 'geen-uitkomst'` | `ActionCenterPreviewItem.reviewDate`, `reviewOutcome` | Integer ≥ 0 | Toon 0 alleen als berekening zeker 0 oplevert; toon anders "—" | ja | Definitie "48u" is afgeleid van governance-sectie in Stitch — **vraag Lars te bevestigen of dit de juiste cutoff is** |
| Tellerrij: Deze week | Aantal items met `reviewDate` binnen huidige ISO-week | `ActionCenterPreviewItem.reviewDate` | Integer ≥ 0 | 0 als geen items | ja | Definitie "deze week" = ISO-week of kalenderweek? Controleer bij Lars |
| Tellerrij: Binnenkort | Aantal items met `reviewDate` tussen nu+1d en nu+30d | `ActionCenterPreviewItem.reviewDate` | Integer ≥ 0 | 0 als geen items | ja | — |
| Tellerrij: Afgerond | Aantal items met `reviewOutcome !== 'geen-uitkomst'` én `status === 'afgerond'` of `'gestopt'` | `ActionCenterPreviewItem.reviewOutcome`, `status` | Integer ≥ 0 | 0 | ja | Controleer of `gestopt` ook als "afgerond" moet tellen |
| Lane-indeling (Achterstallig / Deze week / Binnenkort) | Urgentie-classificatie per item | Nieuw te bouwen helper `classifyReviewMoment(item, now)` | Enum `'overdue' \| 'this-week' \| 'upcoming' \| 'completed'` | Item valt in geen lane → niet tonen tenzij filter actief | ja | — |
| ReviewMomentCard: datum | `ActionCenterPreviewItem.reviewDate` | `reviewDate` (ISO string) | Datum | "Niet gepland" | ja | — |
| ReviewMomentCard: status-chip | `ActionCenterPreviewItem.status` | `ActionCenterPreviewStatus` enum | Zie enum waarden | Geen chip tonen | ja | — |
| ReviewMomentCard: scope/team-naam | `ActionCenterPreviewItem.teamLabel` | `teamLabel` | String | "Geen scope" — zichtbaar, niet silent | ja | Leeg teamLabel = datagap, expliciet melden |
| ReviewMomentCard: campagne-naam | `ActionCenterPreviewItem.title` of `coreSemantics.meta` | `title` | String | "Onbekende campagne" | ja | — |
| ReviewMomentCard: manager-naam | `ActionCenterPreviewItem.ownerName` | `ownerName` | String of null | "Geen manager gekoppeld" — zichtbaar icoon, niet silent | ja | — |
| ReviewMomentCard: laatste uitkomst (quote) | `ActionCenterPreviewItem.reviewOutcome`, `reviewReason` | `reviewOutcome`, `reviewReason` | Enum + vrije tekst | "Nog geen reviewuitkomst vastgelegd." | ja | `reviewReason` kan null zijn; fallback-tekst per `reviewOutcome` nodig |
| ReviewMomentCard: actieknop label | Afhankelijk van status en uitkomst | `reviewOutcome`, `status` | Conditioneel | "Open reviewmoment" als generieke fallback | ja | — |
| Detail panel: Reviewstatus | `status`, `reviewDate`, uitkomst, type | `ActionCenterPreviewItem.status`, `reviewDate`, `reviewOutcome` | Zie types | "Niet beschikbaar" | nee (toon pas als item geselecteerd) | "Type review" veld bestaat niet in het model — **datagap: geen `review_type` veld in `ActionCenterPreviewItem`; toon veld niet of hardcode eerste opvolgreview als enig type** |
| Detail panel: Scope-blok | `teamLabel`, `scopeType`, `peopleCount`, manager | `teamLabel`, `scopeType`, `peopleCount`, `ownerName` | Zie types | Veld "Niet beschikbaar" per ontbrekend sub-veld | nee | `privacy` en `zichtbaarheid` velden uit Stitch bestaan niet in het model — **datagap: weglaten** |
| Detail panel: Route-blok | Route-naam, follow-up, open acties | `ActionCenterPreviewItem.coreSemantics.route`, `openSignals` | Zie types | "Niet beschikbaar" per veld | nee | `openSignals` bevat `'decision_due'`, `'owner_missing'`, `'review_due'` — gebruik dit voor "open acties" teller |
| Detail panel: quote-blok | `reviewReason` of `nextStep` | `reviewReason`, `nextStep` | Vrije tekst | "Nog geen reviewuitkomst vastgelegd. Laatste status: open." | nee | — |
| Governance-sectie: achterstallig | Overdue items | Berekend uit tellerrij | Integer | Verberg sectie als alles 0 is | ja | — |
| Governance-sectie: uitkomst ontbreekt | Items met status open maar geen `reviewOutcome !== 'geen-uitkomst'` | `reviewOutcome === 'geen-uitkomst'` && `status !== 'afgerond'` && `status !== 'gestopt'` | Integer | Verberg als 0 | ja | — |
| Governance-sectie: scope ontbreekt | Items zonder `teamLabel` of met lege `scopeType` | `teamLabel`, `scopeType` | Integer | Verberg als 0 | ja | — |
| Governance-sectie: manager ontbreekt | Items met `ownerName === null` | `ownerName` | Integer | Verberg als 0 | ja | — |
| Filterdropdowns (Status / Scope / Manager) | Client-side filter over `items` | `status`, `teamLabel`, `ownerName` | Enum / string | Toon "Alles" als standaard; geen server-roundtrip | ja | — |
| Footerbalk: "Bekijk afgeronde reviews" | Toggle afgeronde lane | Client state | Boolean | n.v.t. | ja | — |
| Footerbalk: "Bekijk gekoppelde opvolging" | Link naar `/action-center` | Hardcoded href | — | n.v.t. | ja | — |
| Timestamp "Laatste update" | Server render tijd | `new Date().toISOString()` in Server Component | ISO string → nl-NL format | Weglaten als niet beschikbaar | ja | — |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

- [ ] Lees `app/(dashboard)/action-center/page.tsx` volledig en noteer:
  - Alle Supabase-tabellen die worden bevraagd.
  - Hoe `buildLiveActionCenterItems()` wordt aangeroepen.
  - Access-guard logica (`canViewActionCenter`, `redirect`).
- [ ] Lees `lib/action-center-preview-model.ts` volledig. Noteer alle velden van `ActionCenterPreviewItem` en hun typen.
- [ ] Lees `lib/action-center-review-decisions.ts` volledig. Noteer `AuthoredActionCenterDecision` waarden en `sortActionCenterReviewDecisions()`.
- [ ] Lees `lib/action-center-route-contract.ts`. Noteer `ActionCenterReviewOutcome` en `ActionCenterRouteStatus` enum-waarden.
- [ ] Bevestig dat `lib/dashboard/shell-navigation.ts:268` het item `{ href: '/action-center/reviewmomenten', label: 'Reviewmomenten' }` bevat.
- [ ] Check `app/(dashboard)/action-center/page.entry-shell.test.ts` en `page.route-shell.test.ts` voor testpatronen.
- [ ] Controleer `components/dashboard/dashboard-shell.tsx` op hoe `ActionCenterSidebarNav` `ACTION_CENTER_NAV` verwerkt — geen aanpassing nodig, maar Codex moet bevestigen dat de nieuwe route automatisch actief wordt via `pathname === item.href`.

**Uitvoerrapport Fase 1:** Lijst van alle bevraagde tabellen, volledig `ActionCenterPreviewItem` veld-overzicht, bevestiging dat nav-item al aanwezig is.

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

- [ ] Open `code.html` (uit ZIP, pad: `C:\Users\larsh\Downloads\action_center_review\code.html`) en noteer:
  - Alle Nederlandse labels die letterlijk worden overgenomen (zie Copy- en labelregels-sectie hieronder).
  - Alle kleur-tokens die Stitch gebruikt — verifieer elk token tegen `DESIGN.md` en de bestaande Tailwind-config.
  - Welke componenten in Stitch **geen** equivalent hebben in de bestaande codebase (nieuw te bouwen).
  - Welke Stitch-elementen product-claims bevatten die niet door data worden gedekt (datagap noteren).
- [ ] Identificeer herbruikbare bestaande componenten in `components/dashboard/` die patronen bieden voor:
  - Tellerkaart met `border-l-4` accent (check `management-read-primitives.tsx`, `dashboard-primitives.tsx`).
  - Status-chip / badge.
  - Detail-panel structuur.

**Uitvoerrapport Fase 2:** Lijst nieuwe componenten + lijst herbruikbare patronen + lijst afwijkingen van Stitch.

### Fase 3 — Vul datacontract en datagaps in

- [ ] Bevestig per rij in de Pre-implementation audit tabel of de "bestaande bron" klopt na code-inspectie.
- [ ] Noteer alle **datagaps** (cellen met "datagap" label) in het uitvoerrapport.
- [ ] Beslissingen bij datagaps:
  - `review_type` veld: **niet tonen** in detail panel — veld bestaat niet in het model.
  - `privacy` en `zichtbaarheid` velden in Scope-blok: **niet tonen** — niet in model.
  - "48u overdue"-cutoff: gebruik 48 uur tenzij Lars anders aangeeft; document de keuze in code-commentaar.
  - "Deze week" definitie: gebruik ISO-week (maandag–zondag).
- [ ] Leg alle beslissingen vast als inline-commentaar in de nieuwe helper, niet in dit plan.

### Fase 4 — Bouw geïsoleerde visual slice met fixture data

Bouw alle nieuwe componenten en de helper-logica met fixture data **zonder** enige Supabase-aanroep.

- [ ] **Maak `lib/action-center-review-moments.ts`** — helper met:
  ```ts
  export type ReviewMomentUrgency = 'overdue' | 'this-week' | 'upcoming' | 'completed'

  export function classifyReviewMoment(
    item: ActionCenterPreviewItem,
    now: Date,
  ): ReviewMomentUrgency

  export function groupReviewMomentsByUrgency(
    items: ActionCenterPreviewItem[],
    now: Date,
  ): Record<ReviewMomentUrgency, ActionCenterPreviewItem[]>

  export interface ReviewMomentGovernanceCounts {
    overdue: number
    missingOutcome: number
    missingScope: number
    missingManager: number
  }

  export function computeReviewMomentGovernanceCounts(
    items: ActionCenterPreviewItem[],
    now: Date,
  ): ReviewMomentGovernanceCounts
  ```
  - `classifyReviewMoment`: overdue = `reviewDate` verstreken >48u én `reviewOutcome === 'geen-uitkomst'`; this-week = `reviewDate` binnen huidige ISO-week; upcoming = `reviewDate` tussen nu+1d en nu+30d; completed = `status === 'afgerond'` of `status === 'gestopt'`.
  - `groupReviewMomentsByUrgency`: reduceert `items` naar een `Record<ReviewMomentUrgency, ActionCenterPreviewItem[]>`.
  - `computeReviewMomentGovernanceCounts`: telt per governance-categorie.

- [ ] **Schrijf Vitest unit tests** in `lib/action-center-review-moments.test.ts`:
  ```ts
  // Test: item met reviewDate = 3 dagen geleden + geen uitkomst → 'overdue'
  // Test: item met reviewDate = overmorgen → 'upcoming'
  // Test: item met reviewDate = gisteren maar status = 'afgerond' → 'completed'
  // Test: item zonder reviewDate → 'upcoming' (geen lane) of apart geval — beslissing vast in test
  // Test: groupReviewMomentsByUrgency geeft correcte verdeling voor mixed array
  // Test: computeReviewMomentGovernanceCounts telt correct per categorie
  ```
  Gebruik fixture data gebouwd met `Partial<ActionCenterPreviewItem>` casts. Documenteer fixture-origin in test-comment.

- [ ] **Maak `components/dashboard/review-moment-card.tsx`** — Client Component:
  Props:
  ```ts
  interface ReviewMomentCardProps {
    item: ActionCenterPreviewItem
    urgency: ReviewMomentUrgency
    isSelected?: boolean
    onSelect?: (id: string) => void
  }
  ```
  Toont: datum, status-chip, scope-naam, campagne-naam, manager of "Geen manager gekoppeld", laatste uitkomst quote, actieknop. Geen hardcoded mockdata.

- [ ] **Maak `components/dashboard/review-moment-counter-row.tsx`** — Client Component:
  Props:
  ```ts
  interface ReviewMomentCounterRowProps {
    counts: {
      overdue: number
      thisWeek: number
      upcoming: number
      completed: number
    }
  }
  ```
  Vier `border-l-4` kaarten zoals Stitch. Kleuren: error (rood), amber-500, secondary (teal), outline-variant (grijs).

- [ ] **Maak `components/dashboard/review-moment-detail-panel.tsx`** — Client Component:
  Props:
  ```ts
  interface ReviewMomentDetailPanelProps {
    item: ActionCenterPreviewItem | null
  }
  ```
  Toont drie info-blokken: Reviewstatus, Scope, Route. Toont "Geen reviewmoment geselecteerd" als `item === null`.

- [ ] **Maak `components/dashboard/review-moment-governance-section.tsx`** — Client Component:
  Props:
  ```ts
  interface ReviewMomentGovernanceSectionProps {
    counts: ReviewMomentGovernanceCounts
  }
  ```
  Verbergt sectie volledig als `counts.overdue + counts.missingOutcome + counts.missingScope + counts.missingManager === 0`.

- [ ] **Maak `components/dashboard/review-moment-lane.tsx`** — Client Component:
  Props:
  ```ts
  interface ReviewMomentLaneProps {
    urgency: ReviewMomentUrgency
    items: ActionCenterPreviewItem[]
    selectedItemId: string | null
    onSelect: (id: string) => void
  }
  ```
  Verbergt lane als `items.length === 0`.

- [ ] Draai alle nieuwe unit tests: `npx vitest run lib/action-center-review-moments.test.ts`
  Verwacht: alle tests groen.

- [ ] Commit: `git add lib/action-center-review-moments.ts lib/action-center-review-moments.test.ts components/dashboard/review-moment-*.tsx && git commit -m "feat(action-center): add review moments helper and isolated visual components"`

### Fase 5 — Koppel echte data per sectie/component

- [ ] **Maak `app/(dashboard)/action-center/reviewmomenten/page.tsx`** als Server Component.

  De pagina hergebruikt **dezelfde data-fetch logica** als `app/(dashboard)/action-center/page.tsx`. Kopieer de volledige Supabase-fetch flow niet — importeer in plaats daarvan de gedeelde helpers. Als die helpers nog niet geëxporteerd zijn, exporteer ze dan eerst vanuit `action-center/page.tsx` naar een gedeelde module (zie hieronder).

  **Stap 5a: Check of data-fetch kan worden gedeeld**
  - Controleer of `app/(dashboard)/action-center/page.tsx` zijn data-logica exporteert of alleen intern gebruikt.
  - Als intern: maak `lib/action-center-page-data.ts` die de fetch-logica isoleert en door beide pages kan worden geïmporteerd.
  - Als al geëxporteerd: gebruik de bestaande export.

  **Stap 5b: Bouw de page.tsx**
  ```tsx
  // app/(dashboard)/action-center/reviewmomenten/page.tsx
  import { redirect } from 'next/navigation'
  import { createClient } from '@/lib/supabase/server'
  import { loadSuiteAccessContext } from '@/lib/suite-access-server'
  // ... zelfde imports als action-center/page.tsx
  import { groupReviewMomentsByUrgency, computeReviewMomentGovernanceCounts } from '@/lib/action-center-review-moments'
  import { ReviewMomentPageClient } from '@/components/dashboard/review-moment-page-client'

  export default async function ReviewMomentenPage() {
    // Access-check: zelfde guard als action-center/page.tsx
    // Data-fetch: zelfde patroon
    // buildLiveActionCenterItems → items
    const now = new Date()
    const grouped = groupReviewMomentsByUrgency(items, now)
    const governanceCounts = computeReviewMomentGovernanceCounts(items, now)
    const organizationName = /* eerste org name uit items */ '...'

    return (
      <ReviewMomentPageClient
        grouped={grouped}
        governanceCounts={governanceCounts}
        organizationName={organizationName}
        lastUpdated={now.toISOString()}
      />
    )
  }
  ```

- [ ] **Maak `components/dashboard/review-moment-page-client.tsx`** — Client Component die de volledige pagina-structuur omvat (paginakoptekst, filterrij, tellerrij, lanes, detail panel, governance-sectie, footerbalk). Beheert `selectedItemId` state en `showCompleted` toggle.

  Props:
  ```ts
  interface ReviewMomentPageClientProps {
    grouped: Record<ReviewMomentUrgency, ActionCenterPreviewItem[]>
    governanceCounts: ReviewMomentGovernanceCounts
    organizationName: string
    lastUpdated: string
  }
  ```

- [ ] Draai TypeScript check: `npx tsc --noEmit`
  Verwacht: geen nieuwe errors.

- [ ] Commit: `git add app/(dashboard)/action-center/reviewmomenten/ components/dashboard/review-moment-page-client.tsx && git commit -m "feat(action-center): add reviewmomenten page with real data"`

### Fase 6 — Integreer in bestaande route

- [ ] Bevestig dat `lib/dashboard/shell-navigation.ts` **geen wijziging nodig heeft** — het nav-item staat er al.
- [ ] Bevestig dat `components/dashboard/dashboard-shell.tsx` **geen wijziging nodig heeft** — `ActionCenterSidebarNav` rendert alle `ACTION_CENTER_NAV` items automatisch.
- [ ] Navigeer handmatig (of via preview) naar `/action-center/reviewmomenten` en bevestig:
  - Sidebar toont het item als actief.
  - Pagina rendert zonder crash.
  - Geen 404 of redirect.
- [ ] Bevestig dat bestaande `/action-center`-route onaangetast is.
- [ ] Bevestig dat alle andere `ACTION_CENTER_NAV`-routes (`/action-center/acties`, `/action-center/managers`, `/action-center/mijn-teams`) nog steeds laden.

### Fase 7 — Responsiveness en visual polish

- [ ] Check op viewport 375px (mobiel): lanes worden single-column, filterbalk is scrollbaar, detailpaneel verbergt of wordt modal.
- [ ] Check op viewport 1280px (desktop): 8-col lanes + 4-col sticky detail panel.
- [ ] Check design tokens: alle kleuren zijn CSS custom properties of Tailwind-klassen die in de bestaande config zijn gedefinieerd. Geen hardcoded hex-waarden tenzij ze overeenkomen met een DESIGN.md-token.
- [ ] Check typografie: kopregels gebruiken `font-headline-xl` / `font-headline-md`; labels gebruiken `font-label-caps`; bodytekst gebruikt `font-body-md`.
- [ ] Check spacing: alle margin/padding zijn multiples van 4px (Tailwind spacing schaal of `spacing.unit`).
- [ ] Verwijder alle `console.log`, `TODO`-commentaar en debug-code.
- [ ] Commit: `git add -p && git commit -m "polish(action-center/reviewmomenten): responsive layout and design token alignment"`

### Fase 8 — Tests en regressiechecks

- [ ] **Draai bestaande testsuites:**
  ```bash
  npx vitest run
  ```
  Verwacht: alle bestaande tests groen. Als tests breken, fix de root cause — voeg geen `// @ts-ignore` of test-skips toe.

- [ ] **Maak route-shell test** `app/(dashboard)/action-center/reviewmomenten/page.route-shell.test.ts` gebaseerd op het patroon van `app/(dashboard)/action-center/page.route-shell.test.ts`:
  ```ts
  // Test: pagina importeert zonder TypeScript-fouten
  // Test: geen verboden termen in gerenderde output
  ```

- [ ] **Maak entry-shell test** `app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts` gebaseerd op het patroon van de bestaande entry-shell test.

- [ ] **Draai TypeScript full check:**
  ```bash
  npx tsc --noEmit
  ```
  Verwacht: 0 errors.

- [ ] **Draai alle nieuwe tests:**
  ```bash
  npx vitest run lib/action-center-review-moments.test.ts app/(dashboard)/action-center/reviewmomenten/
  ```
  Verwacht: alle groen.

- [ ] **Regressiecheck bestaande Action Center routes:**
  Controleer dat `app/(dashboard)/action-center/page.tsx` en bijbehorende tests nog steeds groen zijn.

- [ ] Final commit: `git add . && git commit -m "test(action-center/reviewmomenten): add route-shell and entry-shell tests"`

---

## Componentstrategie

### Nieuwe componenten (alleen bouwen als bestaand component niet voldoet)

| Component | Pad | Type | Verantwoordelijkheid |
|---|---|---|---|
| `ReviewMomentCard` | `components/dashboard/review-moment-card.tsx` | Client | Toont één reviewmoment als kaart in een lane |
| `ReviewMomentCounterRow` | `components/dashboard/review-moment-counter-row.tsx` | Client | Vier tellerkaarten met urgentie-kleuren |
| `ReviewMomentDetailPanel` | `components/dashboard/review-moment-detail-panel.tsx` | Client | Sticky detail view voor geselecteerde kaart |
| `ReviewMomentGovernanceSection` | `components/dashboard/review-moment-governance-section.tsx` | Client | Governance-overzicht met 4 typen, verborgen als alles 0 |
| `ReviewMomentLane` | `components/dashboard/review-moment-lane.tsx` | Client | Één urgentie-groep met h3 + kaarten grid |
| `ReviewMomentPageClient` | `components/dashboard/review-moment-page-client.tsx` | Client | Volledige pagina-structuur met state (selectedItemId, filters) |

### Hergebruik verplicht

- **Design tokens**: CSS custom properties uit `app/globals.css` en Tailwind-klassen uit de bestaande config. Controleer in `action-center-preview.tsx` welke `var(--dashboard-*)` tokens worden gebruikt en hergebruik dezelfde.
- **Toegangspatroon**: identiek aan `action-center/page.tsx` — `createClient()` → `loadSuiteAccessContext()` → redirect als geen toegang.
- **`buildLiveActionCenterItems()`**: niet herschrijven, importeer als-is.

### Verbod

- Codex mag `action-center-preview.tsx` **niet aanpassen** tenzij een bug wordt gevonden die los staat van dit plan.
- Codex mag `shell-navigation.ts` **niet aanpassen** tenzij een bug wordt gevonden.
- Codex mag **geen nieuwe Supabase-tabellen** aanspreken die niet in het bestaande data-contract zitten.

---

## Copy- en labelregels

Alle zichtbare tekst is Nederlands. Labels letterlijk overnemen uit onderstaande lijst. Geen Engelse termen in de UI.

| Element | Label |
|---|---|
| Paginatitel | Reviewmomenten |
| Subtitel | Bewaak geplande opvolgmomenten, gekoppelde scopes en bekende uitkomsten. |
| Contextbanner | Deze pagina toont reviewritme. Geen scananalyse, rapportduiding of generieke planning. |
| Tellerkaart 1 label | Achterstallig |
| Tellerkaart 1 toelichting | Reviewmomenten waarvan de datum is verstreken. |
| Tellerkaart 2 label | Deze week |
| Tellerkaart 2 toelichting | Reviewmomenten die deze week aandacht vragen. |
| Tellerkaart 3 label | Binnenkort |
| Tellerkaart 3 toelichting | Geplande reviewmomenten binnen 30 dagen. |
| Tellerkaart 4 label | Afgerond |
| Tellerkaart 4 toelichting | Reviewmomenten met vastgelegde uitkomst. |
| Lane kop: overdue | Achterstallig |
| Lane kop: this-week | Deze week |
| Lane kop: upcoming | Binnenkort |
| Geen manager | Geen manager gekoppeld |
| Geen uitkomst quote | Nog geen reviewuitkomst vastgelegd. |
| Detail panel sectielabel | Reviewdetail |
| Detail blok: status | Reviewstatus |
| Detail blok: scope | Scope |
| Detail blok: route | Route |
| Status chip: overdue | Achterstallig |
| Status chip: gepland | Gepland |
| Status chip: in uitvoering | In uitvoering |
| Status chip: afgerond | Afgerond |
| Status chip: gestopt | Gestopt |
| Knop: open | Open reviewmoment |
| Knop: leg vast | Leg uitkomst vast |
| Knop: bekijk opvolging | Bekijk gekoppelde opvolging |
| Knop: bekijk afgerond | Bekijk afgeronde reviews |
| Governance sectie kop | Reviewgovernance |
| Governance sectie subtitel | Reviewmomenten blijven alleen bruikbaar als ze gekoppeld zijn aan een scope, manager of eigenaar en geldige opvolging. |
| Governance kaart 1 | Achterstallig — Momenten zonder actuele status-update die de geplande datum met meer dan 48 uur hebben overschreden. |
| Governance kaart 2 | Uitkomst ontbreekt — Reviews die wel geopend zijn maar waar geen definitieve uitkomstvlag is gezet. |
| Governance kaart 3 | Scope ontbreekt — Momenten zonder koppeling aan een organisatorische eenheid of cluster. |
| Governance kaart 4 | Manager ontbreekt — Reviewmomenten zonder actieve eigenaar. |
| Footer | Reviewmomenten tonen ritme en discipline. Acties, dashboardduiding en rapportinhoud staan op aparte pagina's. |
| Timestamp | Laatste update [datum] om [tijd] |
| Filterdropdown 1 | Status |
| Filterdropdown 2 | Scope |
| Filterdropdown 3 | Manager |

---

## Verboden termen en patronen

### Inhoud
- Geen dashboardinterpretatie of rapportduiding op deze pagina.
- Geen automatische reviewadviezen (bijv. "Je zou dit reviewmoment eerder moeten plannen").
- Geen recurring automation of planningstool.
- Geen generieke planningstool-UI (kalenders, drag-and-drop scheduling, etc.).
- Geen nieuwe productclaims die niet direct door `ActionCenterPreviewItem`-data worden gedekt.
- Geen paginarol-drift: als een component begint te lijken op een campagne-analyse of rapport, is het buiten scope.

### Code
- Geen mockdata in productie. Fixture data uitsluitend in testbestanden.
- Geen silent 0-fallbacks voor betekenisvolle data (bijv. toon niet "0 managers" als managers simpelweg niet zijn geladen).
- Geen `// TODO: real data later` in productiecode.
- Geen hardcoded tenant-namen, campagne-namen of manager-namen.
- Geen nieuwe Supabase RLS-bypasses buiten het bestaande `createAdminClient()` patroon.
- Geen `any` types tenzij het bestaande code was.

---

## Fallback- en datagapbeleid

| Situatie | Gedrag |
|---|---|
| `items.length === 0` na data-fetch | Toon lege-state bericht: "Nog geen reviewmomenten beschikbaar. Zodra er actieve opvolging is met een geplande reviewdatum, verschijnen die hier." Geen counters, geen lanes. |
| `reviewDate === null` op item | Item valt in geen urgentie-lane. Niet tonen tenzij status-filter "Alles" actief is. Kaart toont "Niet gepland" als datum. |
| `ownerName === null` | Toon "Geen manager gekoppeld" met icoon. Telt mee in governance-teller "Manager ontbreekt". |
| `teamLabel` leeg of null | Toon "Geen scope" op kaart. Telt mee in governance-teller "Scope ontbreekt". |
| `reviewOutcome === 'geen-uitkomst'` | Toon quote: "Nog geen reviewuitkomst vastgelegd." |
| Detail panel: geen item geselecteerd | Toon placeholder: "Selecteer een reviewmoment om details te bekijken." |
| Governance tellers alle 0 | Verberg governance-sectie volledig. |
| TypeScript-compilatiefout bij import | Stop — fix de fout. Geen `@ts-ignore`. |
| Datagap (veld bestaat niet in model) | Verberg het UI-element volledig. Noteer in uitvoerrapport. Toon nooit "—" of "n.v.t." als vervanging voor een structureel ontbrekend veld. |
| Wanneer "Niet beschikbaar" verschijnt | Uitsluitend als het veld in het model bestaat maar `null` retourneert en de context vereist dat het veld zichtbaar is. |
| Wanneer "Nog onvoldoende data" verschijnt | Niet gebruiken op deze pagina — data is ofwel beschikbaar of afwezig; geen kwaliteitsoordeel. |
| Wanneer Codex een datagap in uitvoerrapport zet | Altijd als een Stitch UI-element structureel niet door `ActionCenterPreviewItem` kan worden gevuld. |

---

## Testplan

### Unit tests (`npx vitest run`)

- [ ] `lib/action-center-review-moments.test.ts`: alle classificatie- en groepeer-logica getest met fixture data, inclusief edge cases (geen datum, afgerond item, exact aan 48u-grens).
- [ ] Bestaande Action Center tests blijven groen.

### Route-shell tests

- [ ] `app/(dashboard)/action-center/reviewmomenten/page.route-shell.test.ts`: importeert zonder crash.
- [ ] `app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts`: entry-shell patroon zoals bestaande tests.

### TypeScript

- [ ] `npx tsc --noEmit` → 0 errors na implementatie.

### Visuele / functionele checks (handmatig of via preview)

- [ ] Route laadt op `/action-center/reviewmomenten` zonder crash.
- [ ] Sidebar toont "Reviewmomenten" als actief nav-item.
- [ ] Bestaande `/action-center`-route laadt nog steeds.
- [ ] Alle andere `ACTION_CENTER_NAV`-routes laden nog steeds.
- [ ] Geen mockdata zichtbaar in productie-build.
- [ ] Geen verboden termen of patronen zichtbaar in UI.
- [ ] Responsive: single-column op 375px mobiel, twee-koloms layout op ≥768px, detail-panel zichtbaar op ≥1024px.
- [ ] Lege-state bericht verschijnt als `items.length === 0`.
- [ ] Governance-sectie verborgen als alle tellers 0 zijn.

### Regressie

- [ ] Bestaande exports uit `lib/action-center-preview-model.ts` zijn niet veranderd.
- [ ] Bestaande exports uit `lib/action-center-live.ts` zijn niet veranderd.
- [ ] `lib/dashboard/shell-navigation.ts` is niet gewijzigd.
- [ ] `components/dashboard/action-center-preview.tsx` is niet gewijzigd.
- [ ] `app/(dashboard)/action-center/page.tsx` is niet gewijzigd (tenzij gedeelde data-helper is geëxtraheerd — documenteer dan de extractie).

---

## Acceptatiecriteria

1. **Informatiearchitectuur**: paginakoptekst, tellerrij, review lanes, detail panel, governance-sectie en footerbalk zijn aanwezig en gevuld met echte data.
2. **Stitch target herkenbaar**: layout, kleuraccenten, typografie en component-structuur zijn visueel herkenbaar vertaald vanuit de Stitch referentie.
3. **Bestaande dataflow leidend**: alle data is afgeleid van `ActionCenterPreviewItem` via `buildLiveActionCenterItems()`. Geen nieuwe Supabase-tabellen, geen nieuwe RLS-bypasses.
4. **Datagaps expliciet**: elk Stitch-element dat structureel niet door het model kan worden gevuld, is weggelaten en gedocumenteerd in het uitvoerrapport.
5. **Geen productlogica gebroken**: bestaande Action Center pagina en alle andere dashboard-routes werken ongewijzigd.
6. **Geen verboden content**: geen dashboardinterpretatie, geen automatische reviewadviezen, geen recurring automation, geen generieke planningstool, geen mockdata in productie, geen silent fallbacks.
7. **Mobile bruikbaar**: de pagina is functioneel op 375px schermdiepte.
8. **Kleine, reviewbare PR**: elk commit is atomair en beschrijvend. De totale PR omvat alleen de bestanden die in dit plan worden geraakt.
9. **TypeScript schoon**: `npx tsc --noEmit` → 0 errors.
10. **Tests groen**: alle nieuwe en bestaande tests slagen.

---

## Risico's en mitigaties

| Risico | Kans | Mitigatie |
|---|---|---|
| Te grote PR door scope-creep | Middel | Strikt beperken tot bestanden in dit plan. Als Codex een bug ontdekt in aangrenzende code, rapporteer maar fix niet in dezelfde PR. |
| Mockdata wordt productie | Middel | Fixture data uitsluitend in testbestanden. Lint-check op hardcoded namen in componenten. |
| Visuele drift van design system | Laag | Controleer elke kleur tegen DESIGN.md en bestaande Tailwind-config. Geen hardcoded hex. |
| Paginarol-drift (wordt toch planningstool) | Middel | Contextbanner in UI én verboden-patronen sectie. Code-review op forbidden terms. |
| Ontbrekende data veroorzaakt runtime error | Middel | Alle velden van `ActionCenterPreviewItem` zijn nullable behandelen. TypeScript strict mode. |
| Regressie op bestaande Action Center flows | Laag | Expliciete regressiechecklist in testplan. Bestaande page.tsx niet aanraken tenzij noodzakelijk. |
| Data-fetch duplicatie (copy-paste van page.tsx) | Hoog | Stap 5a verplicht: eerst checken of extractie nodig is. Geen duplicatie accepteren. |
| Access/role fouten | Laag | Zelfde access-guard kopiëren uit bestaande page.tsx. Geen nieuwe role-logica introduceren. |
| Governance-sectie altijd zichtbaar (leeg) | Laag | Verberg sectie als alle tellers 0 zijn — geregeld in `ReviewMomentGovernanceSection`. |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Codex rapporteert na voltooiing:

1. **Gewijzigde bestanden**: volledig pad per bestand, type wijziging (nieuw / aangepast).
2. **Nieuwe componenten**: naam, pad, verantwoordelijkheid.
3. **Hergebruikte componenten**: welke bestaande componenten zijn gebruikt of als referentie gediend.
4. **Datamapping-resultaat**: voor elk UI-element in de pre-implementation audit tabel: welk veld is gebruikt, wat de werkelijke waarde was tijdens handmatige test.
5. **Datagaps**: volledig overzicht van elementen die niet konden worden gevuld. Per element: wat Stitch toonde, wat het model biedt, hoe het is opgelost (weggelaten / fallback tekst).
6. **Tests gedraaid**: welke test-commando's zijn uitgevoerd, hoeveel tests slaagden/faalden.
7. **Screenshots of preview notes**: bewijs dat de pagina laadt op desktop en mobiel (indien preview beschikbaar).
8. **Afwijkingen van plan**: wat is er anders gedaan dan beschreven, en waarom.
9. **Open restpunten**: wat vereist nog actie van Lars of Verisight-team (bijv. bevestiging "48u overdue" definitie, beslissing over afgerond-lane zichtbaarheid).
