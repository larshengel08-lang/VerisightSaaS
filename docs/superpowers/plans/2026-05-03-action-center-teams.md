# Action Center Teams — Implementatieplan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Implement **niets** buiten de expliciete taken hieronder.

**Goal:** Vervang de bestaande rudimentaire "Mijn teams"-tab in `ActionCenterPreview` door een volledig teams-overzichtspagina (tabel + detailpaneel + summarybar) die de scope- en teamstructuur voor opvolging expliciet maakt, zonder nieuwe productlogica toe te voegen of bestaande dataflow te breken.

**Architecture:** Verrijking van de bestaande `activeView === 'teams'`-branch in `action-center-preview.tsx` via een nieuwe sub-component `ActionCenterTeamsView`. Data komt volledig van de reeds berekende `teamRows` (via `buildTeamRows`) en `items` (via `ActionCenterPreviewItem[]`) — geen nieuwe Supabase-queries. De Stitch-visual dient uitsluitend als visuele referentie; bestaande datacontracten zijn leidend.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Vitest, bestaande design tokens uit `action-center-preview.tsx`.

---

## Korte samenvatting

De `teams`-view in het Action Center toont momenteel alleen de detailweergave van één geselecteerd team. De Stitch-visual toont een volwaardig tabeloverzicht van alle teams in scope, met summarystatistieken, een tabelrij per team en een klikbaar detailpaneel rechts. Dit plan beschrijft stap voor stap hoe Codex dit bouwt op basis van bestaande data — geen nieuwe data, geen nieuwe productclaims.

---

## Doel

Een `ActionCenterTeamsView`-component bouwen die:
1. Alle teams in scope toont in een tabel (label, scope-afleiding, manager, open acties, review-indicator);
2. Bovenaan vier summarystatistieken toont (teams in scope, zonder manager, met open opvolging, review eerstvolgt);
3. Bij klik op een teamrij een detailpaneel rechts opent met open acties en reviewmomenten voor dat team;
4. Naadloos integreert in de bestaande `activeView === 'teams'`-branch van `action-center-preview.tsx`.

---

## Niet-doelen

- Geen scananalyse of factorvisualisatie
- Geen performanceclaim of teamperformance-dashboard
- Geen dashboard/report-toegang voor managers
- Geen generieke teamperformance-tool
- Geen nieuwe Supabase-tabellen of API-routes
- Geen mockdata in productie
- Geen nieuwe productclaims over teamstatus
- Geen navigatiewijzigingen buiten de bestaande Action Center-tab

---

## Bronnen en inputs

| Bron | Inhoud |
|------|--------|
| `frontend/components/dashboard/action-center-preview.tsx` | Bestaande `buildTeamRows`, `activeView === 'teams'`-branch, herbruikbare primitieven (StatusPill, OverviewStat, DarkMetric, EmptyBlock, MiniTag, EmptySection) |
| `frontend/lib/action-center-preview-model.ts` | `ActionCenterPreviewItem`, `ActionCenterPreviewView`, `ActionCenterPreviewStatus` |
| `frontend/lib/action-center-live.ts` | `buildLiveActionCenterItems`, `getLiveActionCenterSummary` |
| `frontend/lib/suite-access.ts` | `SuiteAccessContext`, `ActionCenterWorkspaceMember` |
| `frontend/app/(dashboard)/action-center/page.tsx` | Server component, data-fetching, props naar `ActionCenterPreview` |
| `C:\Users\larsh\Downloads\action_center_teams_ref\screen.png` | Stitch-visual (visuele referentie, géén productcanon) |
| `C:\Users\larsh\Downloads\action_center_teams_ref\DESIGN.md` | Design tokens (kleuren, typografie, spacing) |

---

## Product- en canonregels

- **Multi-tenancy**: Teamdata is altijd orgId-gebonden. Nooit data van org A tonen in context van org B.
- **RLS is leidend**: Teamdata wordt afgeleid van `ActionCenterPreviewItem[]` die al gefilterd zijn op `isScopeVisibleToActionCenterContext`.
- **Fail loud, never fake**: Ontbrekende data toont `"Niet beschikbaar"` of wordt niet gerenderd — nooit silent 0-fallback voor betekenisvolle velden.
- **Bestaande dataflow is leidend**: `buildTeamRows` en `ActionCenterPreviewItem[]` zijn de enige databronnen. Geen eigen aggregaties die dit dupliceren of tegenspreken.

---

## Gewenste informatiearchitectuur

```
Action Center — teams-tab
│
├── SummaryBar (4 statistieken)
│   ├── Teams in scope (count teamRows)
│   ├── Zonder manager (count teamRows waar !currentManagerId)
│   ├── Met open opvolging (count teamRows waar openActions > 0)
│   └── Review eerstvolgt (count teamRows waar reviewSoonCount > 0)
│
├── TeamsTable (tabel van alle teamRows)
│   └── Rij per team:
│       ├── Team/Afdeling (label)
│       ├── Status-afleiding (zie datacontract)
│       ├── Manager (currentManagerName of "Niet gekoppeld")
│       ├── Open opvolging (openActions count)
│       └── Review indicator (reviewSoonCount)
│
└── TeamDetailPanel (rechts, verschijnt bij klik op een rij)
    ├── Teamhoofd (label + peopleCount)
    ├── Manager (currentManagerName)
    ├── Open acties (gefilterde items van dit team)
    └── Reviewmomenten (items met review < 7 dagen)
```

---

## Visuele target uit Stitch

De Stitch (`screen.png`) toont:
- **Links**: donkerblauwe zijbalk (bestaand dashboard-sidebar — ongewijzigd)
- **Hoofd**: paginatitel "Teams in scope" met vier metric-blokken in een rij (oranje border-left accent)
- **Filtertags**: kleurcoded statuschips bovenaan — alleen visuele referentie, geen productlogica
- **Tabel**: vijf kolommen (TEAM/AFDELING, SCOPE STATUS, MANAGER, OPVOLGING, ETA); rij per team; statuschip in elke rij
- **Rechterpaneel**: detailkaart voor geselecteerd team (naam, org, people count, actieoverzicht, metrics, knoppen)
- **Legenda onderaan**: vier legenda-items met uitleg van statuschips

**Vertaling naar codebase:**
- De vier metrics bovenaan → `ActionCenterTeamsSummaryBar`
- De tabel → `ActionCenterTeamsTable` met `ActionCenterTeamRow` per rij
- Het rechterpaneel → bestaande teamdetail-logica, licht herstructureerd in `ActionCenterTeamsDetailPanel`
- De legenda → statische copy-sectie onderaan, géén interactie
- De filtertags uit de Stitch → **buiten scope** (geen productlogica voor filtering op deze pagina)
- De knoppen "Beëindig manager" / "Beëindig review" → **buiten scope** (geen basis in bestaande datamodel)

---

## Bestaande code die Codex eerst moet inspecteren

| Bestand | Wat inspecteren |
|---------|-----------------|
| `frontend/components/dashboard/action-center-preview.tsx:627–681` | `buildTeamRows()` — returntype, velden, sortering |
| `frontend/components/dashboard/action-center-preview.tsx:2958–3079` | Bestaande `activeView === 'teams'` branch — wat er al is |
| `frontend/components/dashboard/action-center-preview.tsx:855–900` | `teamRows`, `selectedTeam`, `selectedTeamId`, `teamOpenItems`, `teamReviewItems` state |
| `frontend/components/dashboard/action-center-preview.tsx:80–1800` | Alle herbruikbare primitieven: `StatusPill`, `OverviewStat`, `DarkMetric`, `EmptyBlock`, `MiniTag`, `EmptySection` — exacte signaturen |
| `frontend/lib/action-center-preview-model.ts` | `ActionCenterPreviewItem` — volledig type |
| `frontend/lib/action-center-preview-model.ts:5` | `ActionCenterPreviewView` — bevat al `'teams'` |
| `frontend/components/dashboard/action-center-preview.tsx:1402–1428` | `navigationCounts.teams` berekening — hoe de badge-count nu werkt |
| `frontend/app/(dashboard)/action-center/page.tsx:511–536` | Welke props `ActionCenterPreview` ontvangt — geen nieuwe props nodig |
| `frontend/tests/` en `frontend/components/dashboard/*.test.*` | Welke tests al bestaan voor action-center |

---

## Pre-implementation audit en datacontract

| UI-element | Benodigde data | Bestaande bron/helper | Schaal/betekenis | Fallback als ontbreekt | Mag in productie tonen | Open vraag / datagap |
|---|---|---|---|---|---|---|
| Teams in scope (stat) | `teamRows.length` | `buildTeamRows(items)` | Totaal zichtbare teams | `"0"` | Ja | — |
| Zonder manager (stat) | `teamRows.filter(!currentManagerId).length` | `buildTeamRows(items)` | Teams zonder manager-koppeling | `"0"` | Ja | — |
| Met open opvolging (stat) | `teamRows.filter(openActions > 0).length` | `buildTeamRows(items)` | Teams met ≥1 open actie | `"0"` | Ja | — |
| Review eerstvolgt (stat) | `teamRows.filter(reviewSoonCount > 0).length` | `buildTeamRows(items)` | Teams met review < 7 dagen | `"0"` | Ja | — |
| Team label (tabelrij) | `team.label` | `buildTeamRows(items)` | Afdelings- of teamnaam | `"Naamloos scope"` | Ja | — |
| Scope type (tabelrij) | `team.scopeType` | `buildTeamRows(items)` | `department \| item \| org` | verberg chip | Ja | — |
| Scope status chip (tabelrij) | Afgeleid: `openActions`, `hasOwnerGap` | `buildTeamRows(items)` | "Actief" / "Geen opvolging" / "Zonder manager" | Geen chip renderen | Ja | **Vaste implementatieregel**: Er bestaat geen bronveld `scopeStatus`. Gebruik altijd deze UI-afleiding: `hasOwnerGap && openActions > 0 → "Zonder manager"`, `openActions > 0 && !hasOwnerGap → "Actief"`, `openActions === 0 → "Geen opvolging"`. Dit is een view-helper, geen nieuwe productstatus. |
| Manager naam (tabelrij) | `team.currentManagerName` | `buildTeamRows(items)` | Displaynaam toegewezen manager | `"Niet gekoppeld"` | Ja | — |
| Open acties count (tabelrij) | `team.openActions` | `buildTeamRows(items)` | Aantal niet-gesloten routes | `"0"` | Ja | — |
| Review indicator (tabelrij) | `team.reviewSoonCount` | `buildTeamRows(items)` | Reviews binnen 7 dagen | `"0"` | Ja | — |
| Mensen in scope (detailpaneel) | `team.peopleCount` | `buildTeamRows(items)` | Aantal respondenten | Niet renderen als `0` | Ja | **Vaste implementatieregel**: toon `peopleCount` alleen als `> 0`. Geen `"0 mensen"`-label en geen extra fallbacktekst. |
| Open acties lijst (detailpaneel) | `items.filter(i => i.teamId === team.id && !isClosedStatus)` | bestaande state `teamOpenItems` in `action-center-preview.tsx` | Array `ActionCenterPreviewItem` | Empty state tonen | Ja | — |
| Reviewmomenten (detailpaneel) | `teamReviewItems` (review < 7 dagen) | bestaande state in `action-center-preview.tsx` | Array `ActionCenterPreviewItem` | Empty state tonen | Ja | — |
| Geblokkeerde acties count (detailpaneel) | `items.filter(i => i.teamId === team.id && i.status === 'geblokkeerd').length` | Afleiding op `teamOpenItems` | Aantal | `"0"` | Ja | — |
| Legenda statuschips | Statische copy | — | Uitleg bij afgeleidde chips | — | Ja | Legenda-items zijn visuele referentie; copy bewaken via copy-regels |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

**Doel:** Codex mag nog niets aanpassen. Alleen lezen en rapporteren.

- [ ] **Stap 1.1** — Lees `action-center-preview.tsx` volledig; noteer regelnummers van:
  - `buildTeamRows` definitie en returntype
  - `teamRows`, `selectedTeam`, `selectedTeamId`, `teamOpenItems`, `teamReviewItems` state
  - `activeView === 'teams'` branch (begin- en eindregel)
  - Alle herbruikbare primitieven: exacte namen en prop-signaturen van `StatusPill`, `OverviewStat`, `DarkMetric`, `EmptyBlock`, `MiniTag`, `EmptySection`, `LabelValue`, `DarkMetric`

- [ ] **Stap 1.2** — Lees `action-center-preview-model.ts`; bevestig dat `ActionCenterPreviewView` al `'teams'` bevat.

- [ ] **Stap 1.3** — Lees `action-center-preview.tsx:855–900`; noteer hoe `selectedTeamId` en `selectedTeam` worden beheerd en hoe `setSelectedTeamId` werkt.

- [ ] **Stap 1.4** — Lees bestaande tests in `frontend/tests/` en `frontend/components/dashboard/`; noteer welke testbestanden al action-center-preview raken.

- [ ] **Stap 1.5** — Schrijf in het uitvoerrapport: welke velden van `buildTeamRows` beschikbaar zijn, en bevestig dat de view-helper voor `scopeStatus` volledig op bestaande velden leunt.

---

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

**Doel:** Vertaal de visuele referentie naar een componentstrategie zonder productlogica over te nemen.

- [ ] **Stap 2.1** — Open `screen.png`; identificeer de volgende UI-secties en map ze op de informatiearhitectuur uit dit plan:
  - SummaryBar (vier metric-blokken)
  - Tabelkop en tabelrijen
  - Rechterpaneel
  - Legenda

- [ ] **Stap 2.2** — Bevestig welke Stitch-elementen **buiten scope** zijn (filtertags, "Beëindig"-knoppen, exacte statuswaarden die niet afleidbaar zijn). Noteer dit in het uitvoerrapport.

- [ ] **Stap 2.3** — Bepaal welke bestaande primitieven hergebruikt worden (zie componentstrategie hieronder). Schrijf geen nieuwe primitieve als een bestaande past.

---

### Fase 3 — Vul datacontract en vaste afleidingen in

**Doel:** Codex implementeert de al vastgelegde view-afleidingen op basis van bestaande velden, zonder nieuwe productlogica toe te voegen.

- [ ] **Stap 3.1** — Schrijf helper `deriveScopeStatusChip(team: ReturnType<typeof buildTeamRows>[number]): 'actief' | 'zonder-manager' | 'geen-opvolging'` in `action-center-teams-view.ts` (nieuw bestand). Regels:
  - `hasOwnerGap && openActions > 0` → `'zonder-manager'`
  - `openActions > 0 && !hasOwnerGap` → `'actief'`
  - `openActions === 0` → `'geen-opvolging'`

- [ ] **Stap 3.2** — Schrijf unit-test voor `deriveScopeStatusChip` in `action-center-teams-view.test.ts` (nieuw bestand). Minimaal: 3 gevallen (actief, zonder-manager, geen-opvolging).

- [ ] **Stap 3.3** — Leg in code en tests vast: `peopleCount === 0` rendert niet in het detailpaneel.

---

### Fase 4 — Bouw de teams-view direct op bestaande data

**Doel:** Bouw de view direct op `items` en `teamRows`, zodat geen tijdelijke fixture-file of sampledata nodig is.

- [ ] **Stap 4.1** — Maak `frontend/components/dashboard/action-center-teams-view.tsx` aan als `'use client'` component. Exporteer `ActionCenterTeamsView` met props:
  ```ts
  interface ActionCenterTeamsViewProps {
    items: ActionCenterPreviewItem[]
    selectedTeamId: string | null
    onSelectTeam: (teamId: string) => void
    onNavigateToActions: (itemId: string) => void
    canAssignManagers: boolean
  }
  ```

- [ ] **Stap 4.2** — Bouw `ActionCenterTeamsSummaryBar` als interne sub-component (geen eigen bestand, export via `action-center-teams-view.tsx`). Toont de vier stats. Hergebruik `OverviewStat` of bouw een equivalente inline versie met de bestaande Tailwind-tokens.

- [ ] **Stap 4.3** — Bouw `ActionCenterTeamsTable` als interne sub-component. Render een `<table>` (of `<div>`-gebaseerde tabel) met kolommen: Team/Afdeling, Status, Manager, Open opvolging, Review < 7d. Elke rij is klikbaar (`onSelectTeam`).

- [ ] **Stap 4.4** — Bouw `ActionCenterTeamsDetailPanel` als interne sub-component. Toont: teamheader, manager, peopleCount (alleen als > 0), open acties (klikbaar via `onNavigateToActions`), reviewmomenten.

- [ ] **Stap 4.5** — Bouw `ActionCenterTeamsLegend` als interne sub-component. Statische copy van vier legenda-items (zie copy-regels hieronder).

- [ ] **Stap 4.6** — Schrijf `action-center-teams-view.test.tsx` met minimaal:
  - render zonder crash bij lege `items`
  - render met twee items in hetzelfde team
  - `onSelectTeam` wordt aangeroepen bij klik op tabelrij

- [ ] **Stap 4.7** — Draai `npx vitest run` voor de nieuwe tests. Verwacht: alle tests groen.

---

### Fase 5 — Koppel echte data per sectie/component

**Doel:** Vervang de bestaande `activeView === 'teams'` branch door de nieuwe component, gevoed met echte `items` en bestaande state.

- [ ] **Stap 5.1** — Open `action-center-preview.tsx`. Lokaliseer de `activeView === 'teams'` branch (eerder geïnspecteerd in Fase 1). Vervang de volledige branch door:
  ```tsx
  {activeView === 'teams' ? (
    <ActionCenterTeamsView
      items={filteredItems}
      selectedTeamId={selectedTeamId}
      onSelectTeam={setSelectedTeamId}
      onNavigateToActions={(itemId) => {
        setSelectedItemId(itemId)
        setActiveView('actions')
      }}
      canAssignManagers={canAssignManagers}
    />
  ) : null}
  ```

- [ ] **Stap 5.2** — Verifieer dat `filteredItems` (of de juiste variabele naam uit de inspectie) de correcte gefilterde `ActionCenterPreviewItem[]` is. Als de variabele naam anders is, gebruik de juiste naam.

- [ ] **Stap 5.3** — Draai TypeScript-check: `npx tsc --noEmit`. Verwacht: geen nieuwe fouten.

---

### Fase 6 — Integreer in bestaande route

**Doel:** Verifieer dat de teams-tab correct werkt in de live route zonder regressie.

- [ ] **Stap 6.1** — Start de dev-server (`npm run dev` vanuit `frontend/`).

- [ ] **Stap 6.2** — Navigeer naar `/action-center` en klik de "Mijn teams"-tab. Verifieer:
  - SummaryBar toont correcte aantallen
  - Tabel rendert alle teamRows
  - Klik op een rij opent het detailpaneel
  - Klik op een actie in het detailpaneel navigeert naar de actions-view van dat item

- [ ] **Stap 6.3** — Verifieer dat de andere tabs (Overzicht, Acties, Reviewmomenten, Managers toewijzen) ongewijzigd werken.

- [ ] **Stap 6.4** — Verifieer dat de badge-count op de "Mijn teams"-tab correct blijft (via `navigationCounts.teams` — deze berekening is ongewijzigd).

---

### Fase 7 — Responsiveness en visual polish

**Doel:** Mobile-bruikbaar, design tokens correct, geen visuele drift van het design system.

- [ ] **Stap 7.1** — Test op 375px viewport (mobile). Verifieer:
  - SummaryBar stackt verticaal of scrollt horizontaal
  - Tabel is bruikbaar (eventueel horizontaal scrollbaar)
  - Detailpaneel toont onder de tabel (niet naast)

- [ ] **Stap 7.2** — Verifieer dat alle kleuren, border-radius-waarden en spacing-waarden consistent zijn met de bestaande design tokens in `action-center-preview.tsx` (gebruik `--dashboard-surface`, `--dashboard-frame-border`, `--dashboard-ink` etc. — exact dezelfde tokens, geen nieuwe hardcoded hex-waarden).

- [ ] **Stap 7.3** — Verifieer dat de legenda onderaan niet `screen.png`-specifieke termen bevat die productclaims zijn (zie verboden termen en patronen).

---

### Fase 8 — Tests en regressiechecks

**Doel:** Alle tests groen, geen regressie op bestaande routes en exports.

- [ ] **Stap 8.1** — Draai alle bestaande action-center-tests: `npx vitest run --reporter=verbose`. Verwacht: alle bestaande tests nog groen.

- [ ] **Stap 8.2** — Draai TypeScript full check: `npx tsc --noEmit`. Verwacht: geen fouten.

- [ ] **Stap 8.3** — Controleer dat `/action-center` route rendert zonder crash (route-shell test of handmatige verify).

- [ ] **Stap 8.4** — Controleer dat alle bestaande exports van `action-center-preview.tsx` ongewijzigd zijn (geen verwijderde of hernoemde exports).

- [ ] **Stap 8.5** — Grep op verboden termen in nieuwe bestanden (zie verboden patronen). Verwacht: geen hits.

- [ ] **Stap 8.6** — Noteer alle datagaps, afwijkingen van het plan, en open restpunten in het uitvoerrapport.

---

## Componentstrategie

### Nieuwe bestanden

| Bestand | Verantwoordelijkheid |
|---------|----------------------|
| `frontend/components/dashboard/action-center-teams-view.tsx` | Hoofd-component `ActionCenterTeamsView` met interne sub-componenten `ActionCenterTeamsSummaryBar`, `ActionCenterTeamsTable`, `ActionCenterTeamsDetailPanel`, `ActionCenterTeamsLegend` |
| `frontend/lib/action-center-teams-view.ts` | Pure helper-functies: `deriveScopeStatusChip`, `buildTeamsSummaryStats` |
| `frontend/lib/action-center-teams-view.test.ts` | Unit-tests voor helpers |
| `frontend/components/dashboard/action-center-teams-view.test.tsx` | Component-tests voor `ActionCenterTeamsView` |

### Gewijzigde bestanden

| Bestand | Wijziging |
|---------|-----------|
| `frontend/components/dashboard/action-center-preview.tsx` | Vervang `activeView === 'teams'` branch door `<ActionCenterTeamsView>` |

### Hergebruikverplichtingen

Codex **moet** deze bestaande primitieven hergebruiken als ze passen:
- `StatusPill` → voor opvolgingsstatus per actie in detailpaneel
- `OverviewStat` → voor summarybar (of inline equivalent met dezelfde tokens)
- `DarkMetric` → voor metrics in donkere detailkaart
- `EmptyBlock` → voor lege lijsten
- `EmptySection` → voor volledig lege teamstaat
- `MiniTag` → voor brontag in actierijen
- `LabelValue` → voor key-value pairs in detailpaneel

Geen nieuwe primitieven bouwen als een bestaande past.

---

## Copy- en labelregels

Alle zichtbare labels zijn **Nederlands**. Gebruik exact de onderstaande teksten:

### Paginakop
- Breadcrumb: `Action Center / Teams in scope`
- Eyebrow: `ACTION CENTER`
- Titel: `Teams in scope`
- Beschrijving: `Bekijk welke teams of afdelingen aan opvolging, managers en reviews zijn gekoppeld.`

### SummaryBar metrics
| Metric | Label | Detail-label |
|--------|-------|--------------|
| Totaal teams | `Teams in scope` | `zichtbaar voor jou` |
| Zonder manager | `Zonder manager` | `nog niet gekoppeld` |
| Met open opvolging | `Met open opvolging` | `actieve routes` |
| Review eerstvolgt | `Review eerstvolgt` | `binnen 7 dagen` |

### Tabelkolommen
`TEAM / AFDELING` · `STATUS` · `MANAGER` · `OPEN OPVOLGING` · `REVIEW < 7D`

### Status-chip labels (afgeleid van `deriveScopeStatusChip`)
- `actief` → `"Actief"`
- `zonder-manager` → `"Zonder manager"`
- `geen-opvolging` → `"Geen opvolging"`

### Manager fallback
- `"Niet gekoppeld"` (niet: "Geen manager", "N/A", "–")

### Detailpaneel
- Eyebrow: `"Teamcontext"`
- Mensen: `"${n} mensen in scope"` — alleen renderen als `n > 0`
- Open acties header: `"Open acties"`
- Lege open acties: `"Geen open acties voor dit team."`
- Reviewmomenten header: `"Review deze week"`
- Lege reviewmomenten: `"Geen reviews gepland voor dit team in de komende 7 dagen."`

### Legenda
```
● Actief — Scope heeft ten minste één open opvolgingsroute
● Zonder manager — Scope heeft een open route maar geen toegewezen manager
● Geen opvolging — Alle routes zijn afgerond of gestopt
● Review < 7 dagen — Minstens één route vraagt deze week aandacht
```

---

## Verboden termen en patronen

### Verboden in UI-tekst en componentcode

| Verboden | Reden |
|----------|-------|
| "Scananalyse" | Paginarol is scope/teamstructuur, niet analyse |
| "Factoranalyse" | Hetzelfde |
| "Performancescore" of "teamperformance" | Geen performanceclaim |
| "Dashboard" of "rapport" voor managers | Geen dashboard/report-toegang voor managers op deze pagina |
| "Beëindig manager" / "Beëindig review" | Buiten scope, geen datamodel-basis |
| Elke tekst die impliceert dat een team "goed" of "slecht" presteert | Geen performanceclaim |

### Verboden in code

- Geen `mockData`, `MOCK_`, `FIXTURE_` constanten buiten testbestanden
- Geen `?? 0` op velden die semantisch betekenisvol zijn als ze ontbreken (bijv. `peopleCount`)
- Geen nieuwe hardcoded hex-waarden (gebruik bestaande design tokens)
- Geen nieuwe Supabase-queries of API-routes
- Geen `console.log` in productiecontent
- Geen silent catch zonder logging

### Verboden patronen in planuitvoering

- Geen push naar `main`
- Geen wijzigingen aan andere tabs dan `teams`
- Geen nieuwe productclaims in component-descriptions of comments
- Geen paginarol-drift: deze pagina gaat over teamscope en opvolgingskoppeling, niet over analyse of performance

---

## Fallback- en datagapbeleid

| Situatie | Gedrag |
|----------|--------|
| `items` is leeg | Render `EmptySection` met tekst: `"Nog geen teams zichtbaar. Zodra opvolgingsroutes aan teamscopes zijn gekoppeld, verschijnt hier het teamoverzicht."` |
| `teamRows` is leeg maar `items` niet | Render `EmptySection` (teamRows kan leeg zijn als scope-koppeling ontbreekt) |
| Geen team geselecteerd | Detailpaneel niet renderen; tabel toont alle rijen |
| `team.currentManagerName` is `null` | Toon `"Niet gekoppeld"` |
| `team.peopleCount === 0` | Niet renderen in detailpaneel; niet tonen als `"0 mensen"` |
| `deriveScopeStatusChip` geeft onverwachte waarde | Geen chip renderen (geen fallback-label) |
| `teamOpenItems` leeg | Toon `EmptyBlock` met tekst: `"Geen open acties voor dit team."` |
| `teamReviewItems` leeg | Toon `EmptyBlock` met tekst: `"Geen reviews gepland voor dit team in de komende 7 dagen."` |
| Datagap in uitvoerrapport | Alleen noteren als een bestaand veld of bestaand componentcontract echt ontbreekt |
| Sectie rendert niet door ontbrekende data | Sectie wordt volledig weggelaten; geen placeholder met `"0"` voor betekenisvolle data |

**Wanneer "Niet beschikbaar" verschijnt:** Alleen voor velden die bestaan in het datamodel maar geen waarde hebben (bijv. manager niet gekoppeld).

**Wanneer "Nog onvoldoende data" verschijnt:** Nooit automatisch — alleen als Codex zeker weet dat het datamodel expliciet een "onvoldoende data"-staat kent.

**Wanneer Codex een datagap in het uitvoerrapport zet:** Alleen wanneer een bestaand veld of bestaand componentcontract echt ontbreekt. De `scopeStatus`-afleiding en `peopleCount > 0`-regel gelden niet als open datagap.

---

## Testplan

### TypeScript
- [ ] `npx tsc --noEmit` geeft geen nieuwe fouten na wijzigingen

### Unit-tests (`action-center-teams-view.test.ts`)
- [ ] `deriveScopeStatusChip` geeft `'actief'` als `openActions > 0 && !hasOwnerGap`
- [ ] `deriveScopeStatusChip` geeft `'zonder-manager'` als `openActions > 0 && hasOwnerGap`
- [ ] `deriveScopeStatusChip` geeft `'geen-opvolging'` als `openActions === 0`
- [ ] `buildTeamsSummaryStats` telt correctly voor elk van de vier statistieken

### Component-tests (`action-center-teams-view.test.tsx`)
- [ ] Rendert zonder crash bij `items = []`
- [ ] Rendert zonder crash bij `items` met twee items in hetzelfde team
- [ ] Rendert `EmptySection` als `items = []`
- [ ] `onSelectTeam` wordt aangeroepen bij klik op een tabelrij
- [ ] `onNavigateToActions` wordt aangeroepen bij klik op een actie in het detailpaneel
- [ ] Toon `"Niet gekoppeld"` als `currentManagerName === null`
- [ ] Toon `peopleCount` niet als `=== 0`

### Route render
- [ ] `/action-center` laadt zonder crash (server component + client hydration)
- [ ] Teams-tab is selecteerbaar en toont de `ActionCenterTeamsView`
- [ ] Alle andere tabs werken ongewijzigd (Overzicht, Acties, Reviewmomenten, Managers)

### Responsive checks
- [ ] 375px viewport: tabel horizontaal scrollbaar, detailpaneel onder tabel
- [ ] 1280px viewport: tabel en detailpaneel naast elkaar

### Verboden patronen check
- [ ] Grep op `mockData|MOCK_|FIXTURE_` in productiecode: geen hits
- [ ] Grep op verboden termen uit copy-regels: geen hits in UI-tekst
- [ ] Grep op nieuwe hardcoded hex-waarden: geen hits

### Bestaande routing
- [ ] `/action-center` route-shell test slaagt
- [ ] Andere dashboard-routes zijn onaangeraakt
- [ ] Bestaande exports van `action-center-preview.tsx` zijn ongewijzigd

### Bestaande Action Center logica
- [ ] `navigationCounts.teams` berekening ongewijzigd
- [ ] `buildTeamRows` ongewijzigd
- [ ] `selectedTeamId` state-beheer werkt nog correct na tab-wissel

---

## Acceptatiecriteria

- [ ] **Informatiearchitectuur gevolgd**: SummaryBar met vier stats, tabel van alle teams, detailpaneel bij selectie, legenda onderaan
- [ ] **Stitch target visueel herkenbaar vertaald**: Metrics-rij, tabelstructuur, rechterpaneel herkenbaar; Stitch-elementen buiten scope zijn expliciet weggelaten
- [ ] **Bestaande dataflow blijft leidend**: Geen nieuwe Supabase-queries; alle data van `ActionCenterPreviewItem[]` via `buildTeamRows`
- [ ] **Afleidingsregels gevolgd**: `deriveScopeStatusChip` en `peopleCount > 0` volgen exact de vaste regels uit dit plan
- [ ] **Geen productlogica gebroken**: Andere tabs, bestaande state, bestaande exports ongewijzigd
- [ ] **Geen verboden content**: Geen verboden termen, geen mockdata in productie, geen performanceclaims
- [ ] **Mobile bruikbaar**: Werkt op 375px viewport
- [ ] **Kleine, reviewbare PR**: Maximaal 3 bestanden nieuw, 1 bestand gewijzigd; geen andere wijzigingen dan de teams-view

---

## Risico's en mitigaties

| Risico | Mitigatie |
|--------|-----------|
| Te grote PR door scope-drift | Maximaal 4 bestanden (3 nieuw + 1 gewijzigd); Codex stopt als meer bestanden nodig zijn en rapporteert |
| Mockdata wordt productie | Verbod op `mockData`-constanten buiten testbestanden; grep-check in testplan |
| Visuele drift van design system | Verplicht hergebruik van bestaande primitieven; geen nieuwe hardcoded hex-waarden |
| Paginarol drift | Copy-regels en verboden termen staan expliciet in plan; Codex checkt ze vóór commit |
| Ontbrekende data leidt tot crash | Alle velden hebben expliciete fallbacks; geen `!` op nullable velden |
| Regressie op bestaande Action Center logica | `buildTeamRows`, `navigationCounts.teams`, en andere tabs zijn read-only voor dit plan |
| `scopeStatus`-afleiding klopt niet met productbedoeling | Afleidingslogica staat vast in dit plan en leeft in één pure helper → unit-testbaar en reviewbaar |
| `peopleCount === 0` verwarring | Expliciete regel: niet renderen als 0; geen `"0 mensen"` fallback |
| Hergebruikte primitieven hebben andere signatuur dan verwacht | Verplichte inspectie in Fase 1 vóór bouwen |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Codex rapporteert na implementatie:

```markdown
## Uitvoerrapport — Action Center Teams

### Gewijzigde bestanden
- (lijst)

### Nieuwe componenten
- (lijst met bestandspad en verantwoordelijkheid)

### Hergebruikte componenten
- (lijst met exact welke primitieven hergebruikt zijn)

### Datamapping-resultaat
- (voor elk UI-element: welke databron gebruikt, of verwacht)

### Vastgelegde afleidingen
- `scopeStatus`: `hasOwnerGap && openActions > 0 → zonder-manager`, `openActions > 0 && !hasOwnerGap → actief`, `openActions === 0 → geen-opvolging`
- `peopleCount`: alleen renderen als `> 0`
- Overige datagaps: alleen noteren als een bestaand veld of bestaand componentcontract echt ontbreekt

### Tests gedraaid
- npx tsc --noEmit: [resultaat]
- npx vitest run: [resultaat, aantal geslaagd/gefaald]

### Screenshots of preview notes
- (beschrijving van wat zichtbaar is in dev)

### Afwijkingen van plan
- (lijst of "geen")

### Open restpunten
- (lijst of "geen")
```
