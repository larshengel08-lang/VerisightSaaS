# Dashboard Overview → Cockpit/triagepagina

## Korte samenvatting

De Dashboard overview (`app/(dashboard)/dashboard/page.tsx`) wordt omgebouwd van een platte routelijst naar een cockpit/triagepagina. De HR-manager ziet direct welke routes actie vragen, bijna klaar zijn, live en leesbaar zijn, of geblokkeerd zijn. Navigatie gaat naar Beheer route, Open dashboard, Open rapport of Action Center. De Stitch visual is visuele referentie; de bestaande dataflow en state machine in de codebase zijn leidend.

---

## Doel

- Vervang de generieke routelijst door vier triage-buckets met statustelkaarten.
- Maak de "Nu eerst"-sectie visueel dominant: cards met linkse gekleurde border, WAAROM/VOLGENDE STAP-kolom, expliciete CTA-knop per route.
- Voeg een "Geblokkeerd / niet gestart"-sectie toe voor routes in setup/running-state.
- Voeg een "Recente afgeronde routes"-sectie toe voor gesloten campagnes.
- Voeg een cockpit-header toe met paginatitel, subtitel en filterrij (Product, Status).
- Alle wijzigingen vallen binnen de bestaande route `/dashboard`; geen nieuwe paginaroute nodig.

---

## Niet-doelen

- Geen diepgaande scananalyse op deze pagina.
- Geen setupdetails (respondentimport, launch control, preflight checklist).
- Geen Action Center-detailacties (accepteren, afwijzen, toewijzen).
- Geen rapportinhoud.
- Geen nieuwe productclaims of scores die niet bestaan in `CampaignStats`.
- Geen mockdata in productiebuild.
- Geen silent 0-fallbacks voor betekenisvolle data.
- Geen paginarol-drift: deze pagina is cockpit/triage, niet operationele detaillaag.

---

## Bronnen en inputs

| Bron | Rol |
|------|-----|
| `app/(dashboard)/dashboard/page.tsx` | Bestaande pagina — leidend voor dataflow, state machine en render |
| `lib/dashboard/dashboard-state-composition.ts` | `CampaignCompositionState` en `getCampaignCompositionState()` — canon voor statusklassificatie |
| `lib/types.ts` → `CampaignStats` | Datacontract voor campagnedata vanuit Supabase view `campaign_stats` |
| `components/dashboard/dashboard-primitives.tsx` | Bestaande design-primitieven (`DashboardSection`, toon-classes) — hergebruiken waar logisch |
| `components/dashboard/dashboard-shell.tsx` | Shell/nav — niet aanraken |
| `app/(dashboard)/dashboard/page.test.ts` | Bestaande guardrail-tests — role-boundaries behouden, oude IA-copy gericht herschrijven |
| `app/(dashboard)/dashboard/home-launcher.ts` | Bestaande launchhulper — alleen inspecteren, niet hergebruiken of wijzigen in deze run |
| `lib/dashboard/shell-navigation.ts` | `normalizeDashboardModuleFilter`, `getDashboardModuleLabel`, `getScanTypeForDashboardModule` |
| `lib/scan-definitions.ts` → `getScanDefinition()` | `productName`, `signalLabel` per scan_type |
| Downloads/dashboard_overview_extract/code.html | Stitch visual — visuele referentie, geen productcanon |
| Downloads/dashboard_overview_extract/DESIGN.md | Design system tokens (kleuren, typografie, spacing) |
| Downloads/dashboard_overview_extract/screen.png | Screenshot van de Stitch visual |

---

## Product- en canonregels

1. **Statusklassificatie** gebeurt uitsluitend via `getCampaignCompositionState()` uit `dashboard-state-composition.ts`. Codex mag geen eigen statuslogica introduceren.
2. **Triage-mapping** ligt in dit plan vast en wordt niet door Codex bedacht of bijgesteld:
   - `setup` -> `Geblokkeerd / niet gestart`
   - `ready_to_launch` -> `Actie nodig`
   - `running` -> `Geblokkeerd / niet gestart`
   - `sparse` -> `Actie nodig`
   - `partial` -> `Bijna klaar`
   - `full` -> `Live en leesbaar`
   - `closed` -> `Recente afgeronde routes`
3. **CampaignStats-velden** zijn de enige beschikbare data. Codex voert geen nieuwe Supabase-queries in zonder dit als datagap te noteren.
4. **Scores en drempelwaarden** (`avg_risk_score`, `total_completed >= 5`, `>= 10`) zijn canon; Codex leest ze uit de bestaande logica, wijzigt ze niet.
5. **Routing in deze run** gebruikt alleen bestaande live routes:
   - routegebonden CTA's gebruiken `/campaigns/[id]`
   - sectie- of bibliotheeklink naar rapporten gebruikt `/reports`
   - Action Center-bridge gebruikt `/action-center`
   - geen nieuwe deep-links, tabs of routevarianten introduceren
6. **CTA-label per state** ligt in dit plan vast:
   - `setup` -> `Beheer route`
   - `ready_to_launch` -> `Beheer route`
   - `running` -> `Beheer route`
   - `sparse` -> `Beheer route`
   - `partial` -> `Open dashboard`
   - `full` -> `Open dashboard`
   - `closed` -> `Open rapport`
7. **Action Center-CTA** mag alleen verschijnen als bestaande guard `canOpenActionCenterRoute(...)` dat nu al toestaat. Geen nieuwe eligibilitylogica bouwen.
8. **`home-launcher.ts` is geen implementatiebron voor deze pagina**. Codex inspecteert het bestand alleen om te bevestigen dat de cockpit-run er niet op hoeft te leunen en wijzigt het niet in deze run.
9. **`page.test.ts` is deels guardrail, deels meeveranderende spec**:
   - behouden: role-boundaries, Action Center-guards, verboden patronen
   - meeveranderen: oude overview-copy die expliciet de vorige IA afdwingt (`Ook aandacht`, `Actieve routes`, `Wat nu leesbaar is`, `Wat blokkeert`)

---

## Gewenste informatiearchitectuur

```
Dashboard overview (cockpit)
├── Cockpit-header
│   ├── Badge "Cockpit" + organisatienaam
│   ├── Paginatitel "Dashboard overview"
│   ├── Subtitel "Bekijk welke routes aandacht vragen..."
│   └── Filterrij: Product | Status
│
├── Statustelkaarten (4 kolommen)
│   ├── Actie nodig      [amber]
│   ├── Bijna klaar      [slate/blue]
│   ├── Live en leesbaar [teal/emerald]
│   └── Geblokkeerd / niet gestart [slate + amber dot]
│
├── "Nu eerst" — prioritaire routes (cards met linkse border + WAAROM + VOLGENDE STAP + CTA)
│   ├── [Live en leesbaar] → CTA: "Open dashboard"
│   ├── [Actie nodig]      → CTA: "Beheer route"
│   └── [Bijna klaar]      → CTA: "Open dashboard"
│
├── "Geblokkeerd / niet gestart" — compacte rijen
│   └── [setup, running]  → CTA: "Beheer route"
│
└── "Recente afgeronde routes" — gedimde rijen
    └── [closed]          → CTA: "Open rapport"
```

**Wat er NIET op staat:** segmentanalyse, factor-breakdown, aanbevelingen, setupwizard, Action Center-detail.

---

## Visuele target uit Stitch

Gebaseerd op `code.html` en `screen.png` (visuele referentie, niet productcanon):

### Cockpit-header
- `label-caps` badge "COCKPIT" in secondary/teal tint.
- `display-lg` paginatitel "Dashboard overview".
- `body-lg` subtitel in `on-surface-variant`.
- Rechtsboven twee filter-dropdowns (Product, Status).

### Statustelkaarten
- 4-koloms grid (responsive: 1→2→4 kolommen).
- Elke kaart: witte achtergrond, 1px border, `rounded-lg`, linkse gekleurde 4px accent-bar.
- Label in `label-caps` stijl, getal in `metric-value` stijl.
- Kleuren accent-bar:
  - Actie nodig: `amber-400`
  - Bijna klaar: `#8292a5` (slate blue uit DESIGN.md `on-primary-container`)
  - Live en leesbaar: `secondary` (teal `#006b5f`)
  - Geblokkeerd / niet gestart: `slate-300` + amber dot rechtsbovenin

### "Nu eerst" cards
- Volledige breedte, witte achtergrond, 1px border, linkse 4px gekleurde border.
- Links: routenaam + statusbadge + productnaam + WAAROM + VOLGENDE STAP.
- Rechts: primaire CTA-knop (vullend, niet link-tekst).
- Hover: `shadow-lg` en lichte transitie.

### "Geblokkeerd / niet gestart" rijen
- Compacte horizontale rij: icoontje + naam + productnaam + Reden + Next + CTA-link.

### "Recente afgeronde routes" rijen
- Gedimde rijen (`opacity-60` → `hover:opacity-100`), `check_circle` icoon, naam + afrond-datum + "Open rapport"-link.

---

## Bestaande code die Codex eerst moet inspecteren

| Bestand | Wat inspecteren |
|---------|----------------|
| `app/(dashboard)/dashboard/page.tsx` | Volledige logica: queries, state-berekeningen, render-secties, huidige labels |
| `app/(dashboard)/dashboard/page.test.ts` | Scheid harde guardrails (rolgrenzen) van oude copy-assertions die bewust vervangen mogen worden |
| `app/(dashboard)/dashboard/home-launcher.ts` | Alleen bevestigen dat deze pagina er niet op hoeft te leunen; bestand niet aanpassen |
| `lib/dashboard/dashboard-state-composition.ts` | `CampaignCompositionState`-waarden, `getCampaignCompositionState()`, `HOME_STATE_ORDER` |
| `lib/types.ts` | `CampaignStats`-interface: alle beschikbare velden en types |
| `lib/dashboard/shell-navigation.ts` | `normalizeDashboardModuleFilter`, `getDashboardModuleLabel`, `DashboardPortfolioView` |
| `lib/scan-definitions.ts` | `getScanDefinition()` returntype: welke labels beschikbaar per scantype |
| `components/dashboard/dashboard-primitives.tsx` | Beschikbare primitieven: `DashboardSection`, toon-klasses, surface-klasses |
| `components/dashboard/dashboard-shell.tsx` | Shell-layout: hoe children worden gewrapped, welke CSS-variabelen beschikbaar zijn |
| `app/(dashboard)/layout.tsx` | Hoe `portfolioCounts` worden opgebouwd — relevant voor statustelkaarten |
| `app/(dashboard)/campaigns/[id]/page.tsx` (header) | Welke URL-structuur voor "Beheer route" en "Open dashboard" |

---

## Pre-implementation audit en datacontract

Codex **verifieert deze tabel tijdens Fase 1** op basis van inspectie. De productkeuzes hieronder liggen vast; alleen feitelijke bestands- of veldnamen mogen worden gecorrigeerd.

| UI-element | Benodigde data | Bestaande bron/helper | Schaal/betekenis | Fallback als ontbreekt | Mag in productie | Open vraag / datagap |
|---|---|---|---|---|---|---|
| Paginatitel "Dashboard overview" | Statische string | — | — | — | Ja | — |
| Badge "Cockpit" + organisatienaam | `organization.name` of `user.email` | `loadSuiteAccessContext()` levert `profile` | Organisatienaam of e-mail als fallback | Toon "Alle routes" | Ja | Inspecteren: levert `context` een `organizationName`? |
| Timestamp "Laatste update" | `max(created_at)` of `now()` | Niet in `CampaignStats` | Indicatief — wanneer data geladen | Weglaten (geen silent fallback) | **Nee** — tenzij beschikbaar uit query | **DATAGAP**: `CampaignStats` bevat geen `updated_at`. Weglaten of verwijderen uit design. |
| Filter: Product | `scan_type` / `?module=` param | `normalizeDashboardModuleFilter()`, `getScanTypeForDashboardModule()` | Filtert op scan_type | Toon alles (geen filter) | Ja | Bestaande logica hergebruiken |
| Filter: Status | Bucket-filter op vastgelegde triagegroep | Client-side in `page.tsx` | Filtert op `Actie nodig` / `Bijna klaar` / `Live en leesbaar` / `Geblokkeerd / niet gestart` | Toon alles | Ja | Geen URL-param toevoegen in deze run |
| Filter: Periode | n.v.t. in MVP | n.v.t. | Niet bouwen in deze run | Element weglaten | Nee | Bewuste scopesnede: geen betrouwbare periode-semantiek in bestaande data |
| Telkaart "Actie nodig" | `CampaignCompositionState` ∈ {`ready_to_launch`, `sparse`} | `buildInvitesNotSentByCampaign()` + `getCampaignCompositionState()` | Aantal routes dat actie van HR vraagt | 0 tonen | Ja | Geen extra sublogica toevoegen |
| Telkaart "Bijna klaar" | `state === 'partial'` | `getCampaignCompositionState()` | Eerste read beschikbaar | 0 tonen | Ja | — |
| Telkaart "Live en leesbaar" | `state === 'full'` | `getCampaignCompositionState()` | Dashboard volledig leesbaar | 0 tonen | Ja | — |
| Telkaart "Geblokkeerd / niet gestart" | `state ∈ {setup, running}` | `getCampaignCompositionState()` | Geen live respondentlaag of nog geen eerste veilige respons | 0 tonen | Ja | Mapping ligt vast |
| Route-naam | `campaign.campaign_name` | `CampaignStats.campaign_name` | Naam van de campagne | — | Ja | — |
| Productnaam (label onder naam) | `scanDefinition.productName` | `getScanDefinition(scan_type)` | ExitScan, RetentieScan, etc. | `scan_type` raw tonen | Ja | — |
| Statusbadge per route | `stateLabel` afgeleid van `state` | `getHomeStateMeta(state).label` | Leesbaar label | — | Ja | Bestaande labels hergebruiken; Stitch-labels zijn visuele referentie |
| WAAROM-kolom | `stateMeta.body` | `getHomeStateMeta(state).body` | Korte toelichting op status | "Status onbekend" | Ja | Alleen compacter herschrijven, niet inhoudelijk uitbreiden met nieuwe productclaims |
| VOLGENDE STAP-kolom | Vastgelegde CTA-logica per state | `getHomeStateMeta(state).nextStepLabel` als copybron | Concrete volgende actie | Niet tonen als onduidelijk | Ja | CTA-volgorde uit dit plan is leidend, niet de oude helpertekst |
| CTA "Beheer route" | `/campaigns/${campaign_id}` | `CampaignStats.campaign_id` | Operationele beheer-URL | — | Ja | Zichtbaar voor: `setup`, `ready_to_launch`, `running`, `sparse` |
| CTA "Open dashboard" | `/campaigns/${campaign_id}` | `CampaignStats.campaign_id` | Routegebonden dashboard-landing | — | Ja | Zichtbaar voor: `partial`, `full` |
| CTA "Open rapport" | `/campaigns/${campaign_id}` voor rij-CTA, `/reports` voor sectielink | `CampaignStats.campaign_id` | Rapport-first landing via bestaande route | — | Ja | Geen nieuwe rapportroute maken |
| CTA "Open Action Center" | `/action-center` | Bestaand; `canOpenActionCenterRoute` check | Navigeert naar Action Center | Verbergen als niet toegestaan | Ja | `canOpenActionCenterRoute` en `first_management_use_confirmed_at` inspecteren |
| "Geblokkeerd / niet gestart"-sectie reden | `getOverviewBlockerCopy(entry)` | Bestaande helper in `page.tsx` | Beschrijft blocker | — | Ja | Hergebruiken |
| "Recente afgeronde routes" | `state === 'closed'` | `buildRecentOutputEntries()` | Gesloten campagnes | Sectie weglaten als leeg | Ja | Hergebruiken |
| Responsie-metric | `campaign.completion_rate_pct` | `CampaignStats.completion_rate_pct` | % completed respondenten | "—" tonen | Ja | — |
| Signaal-metric | `campaign.avg_risk_score` of `avg_signal_score` | `CampaignStats` + `getScanDefinition().signalLabel` | Score 0–10 schaal | "Nog niet vrij" | Ja | Bestaande logica: `Nog niet vrij` als null |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

**Doel:** Codex begrijpt wat er is vóór hij iets wijzigt.

1. Lees volledig: `app/(dashboard)/dashboard/page.tsx` — noteer alle secties, helpers, types, queries.
2. Lees volledig: `app/(dashboard)/dashboard/page.test.ts` — noteer alle assertions die niet mogen breken.
3. Lees volledig: `lib/dashboard/dashboard-state-composition.ts` — noteer alle `CampaignCompositionState`-waarden en de state-machine.
4. Lees volledig: `lib/types.ts` → `CampaignStats` — noteer alle beschikbare velden.
5. Lees volledig: `app/(dashboard)/dashboard/home-launcher.ts` — bevestig dat het geen bron of dependency hoeft te zijn voor deze cockpit-run.
6. Lees `lib/dashboard/shell-navigation.ts` — noteer `normalizeDashboardModuleFilter`, `getDashboardModuleLabel`, `DashboardPortfolioView`.
7. Lees `lib/scan-definitions.ts` — noteer `getScanDefinition()` returntype.
8. Lees `components/dashboard/dashboard-primitives.tsx` — noteer beschikbare primitieven en CSS-variabelen.
9. Lees header van `app/(dashboard)/campaigns/[id]/page.tsx` — noteer URL-structuur.

**Output Fase 1:** Codex noteert in uitvoerrapport:
- Welke secties er nu zijn en hun correspondentie met de Stitch-secties.
- Bevestiging van de triage-bucket-mapping (`CampaignCompositionState` → Stitch-bucket).
- Geconfirmeerde of herziene datagap-tabel (zie Pre-implementation audit).
- Welke guardrail-tests NIET geraakt mogen worden.

---

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

**Doel:** Codex vertaalt de Stitch visual naar een componentstrategie zonder productwaarheid te overschrijven.

1. Lees `Downloads/dashboard_overview_extract/code.html` — noteer secties, classes, copy, CTA-labels.
2. Lees `Downloads/dashboard_overview_extract/DESIGN.md` — noteer kleurvariabelen, typografie-schaal, spacing-eenheden.
3. Vergelijk Stitch-labels met bestaande copy in `page.tsx` — noteer conflicten of afwijkingen.
4. Identificeer welke Stitch-elementen al bestaan (hergebruikbaar) vs. nieuw te bouwen.
5. Identificeer welke Stitch-copy productclaims zou introduceert die niet in bestaande data staan.

**Output Fase 2:** Codex noteert in uitvoerrapport:
- Welke Stitch-elementen direct hergebruikbaar zijn.
- Welke elementen nieuwe productclaims bevatten en daarom NIET worden overgenomen.
- Definitieve componentlijst (zie Componentstrategie).

---

### Fase 3 — Vul datacontract en datagaps in

**Doel:** Codex beslist per datagap wat hij doet — nooit stilzwijgend nulfallback.

Per datagap uit de Pre-implementation audit:
- Bevestig of het veld beschikbaar is (of afgeleid kan worden).
- Kies expliciete behandeling: tonen met "Niet beschikbaar", weglaten, of als knelpunt in uitvoerrapport noteren.
- Voer alleen de al vastgelegde MVP-filterset uit: `Product` en `Status`.

**Beslisregel:**
- Timestamp "Laatste update": als niet beschikbaar → element weglaten.
- Status-filter: MVP -> client-side filter op vastgelegde state-buckets; geen nieuwe query.
- Periode-filter: MVP-out. Niet bouwen en niet als disabled control tonen.

---

### Fase 4 — Bouw geïsoleerde visual slice zonder productiefixtures

**Doel:** Componenten bouwen en testen zonder productiecode te raken.

1. Werk direct in `page.tsx` met lokale presentational helpers of pagina-specifieke componenten — geen extra productiefile zoals `page.cockpit.tsx`.
2. Bouw eerst de visuele slice (`CockpitHeader`, statustelkaarten, `Nu eerst`, geblokkeerde rijen, recente afgeronde rijen) als pure presentational laag.
3. Eventuele sampledata mag alleen in tests voorkomen; nooit in productiecode of tijdelijke routefiles.
4. Verifieer visuele output tegen Stitch target.
5. Pas design-tokens toe uit `DESIGN.md` (kleuren, spacing, typografie).

---

### Fase 5 — Koppel echte data per sectie/component

**Doel:** Fixture vervangen door bestaande queries en helpers.

1. Hergebruik de bestaande queries uit `page.tsx` — geen nieuwe Supabase-queries in deze run.
2. Koppel per sectie:
   - Statustelkaarten → bestaande `fullCount`, `partialCount`, etc. of herziene berekening.
   - "Nu eerst" cards → bestaande `activeRouteItems` lijst.
   - "Geblokkeerd / niet gestart" rijen → bestaande `blockerItems`.
   - "Recente afgeronde routes" rijen → bestaande `recentOutputEntries`.
3. Verifieer dat alle koppelingen TypeScript-correct zijn (geen `any`).

---

### Fase 6 — Integreer in bestaande route

**Doel:** Nieuwe implementatie vervangt `page.tsx`-content, bestaande exports en routing blijven intact.

1. Vervang de return-waarde van `DashboardHomePage` door de nieuwe cockpit-layout.
2. Behoud alle bestaande server-side data-fetching en state-berekeningen — refactor alleen als nodig voor leesbaarheid.
3. Behoud lege states (`AdminEmptyState`, `ViewerEmptyState`).
4. Vervang oude sectielogica gericht; verwijder geen bestaande exports tenzij ze aantoonbaar ongebruikt zijn.
5. Behoud de Action Center-bridge en de guard rond `canOpenActionCenterRoute` en `first_management_use_confirmed_at`.
6. Laat `home-launcher.ts` ongemoeid.

---

### Fase 7 — Responsiveness en visual polish

**Doel:** Cockpit werkt op mobile, tablet en desktop.

1. Statustelkaarten: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
2. "Nu eerst" cards: op mobile stacked layout (CTA-knop onder content).
3. "Geblokkeerd" rijen: op mobile verticaal gestacked.
4. Typografie-schaal consistent: `label-caps`, `metric-value`, `headline-md`, `body-md` zoals in DESIGN.md.
5. Hover-states en transitie-effecten conform design system.
6. Dark mode: alleen als bestaande codebase dit al ondersteunt — niet introduceren.

---

### Fase 8 — Tests en regressiechecks

**Doel:** Alle bestaande tests slagen; nieuwe gedragsgaranties worden toegevoegd.

1. Draai bestaande testsuite: `vitest run` (of equivalent).
2. Herschrijf `page.test.ts` gericht mee zodat oude IA-copy wordt vervangen door cockpit-guardrails, terwijl role-boundaries behouden blijven.
3. Voeg minimaal toe:
   - Test dat pagina rendert zonder crash met lege campagnelijst.
   - Test dat statustelkaarten correct tellen per state-bucket.
   - Test dat "Nu eerst" geen items toont wanneer alle campagnes `closed` zijn.
   - Test dat geen verboden labels verschijnen (zie Verboden termen).
4. Voer TypeScript-check uit: `npx tsc --noEmit`.
5. Controleer alleen bestaande dashboardtests; introduceer geen nieuwe afhankelijkheid op ontbrekende route-render tests.

---

## Componentstrategie

Codex hergebruikt eerst bestaande componenten. Nieuwe componenten alleen als bestaand niet volstaat.

| Component | Nieuw of hergebruik | Bestand | Verantwoordelijkheid |
|---|---|---|---|
| `CockpitHeader` | Nieuw | `page.tsx` (inline) of `components/dashboard/cockpit-header.tsx` | Paginatitel, badge, subtitel, filterrij |
| `StatusCounterGrid` | Nieuw | `page.tsx` (inline) | 4 statustelkaarten met triage-buckets |
| `StatusCounterCard` | Nieuw | `page.tsx` (inline) | Één telkaart: accent-bar + label + getal |
| `TriageRouteCard` | Aanpassing van `OverviewRouteRow` | `page.tsx` (inline) | Card met linkse border + WAAROM/VOLGENDE STAP + CTA-knop |
| `BlockerRouteRow` | Aanpassing van bestaande blocker-render | `page.tsx` (inline) | Compacte rij voor geblokkeerde routes |
| `ClosedRouteRow` | Aanpassing van bestaande output-render | `page.tsx` (inline) | Gedimde rij voor afgeronde routes |
| `DashboardSection` | Hergebruik | `components/dashboard/dashboard-primitives.tsx` | Sectie-wrapper met eyebrow + titel |
| `OverviewSummaryCard` | Vervangen door `StatusCounterCard` | `page.tsx` | Wordt vervangen — verwijder na integratie |

**Regel:** Codex introduceert GEEN nieuwe gedeelde component in `components/` tenzij het element op meer dan één pagina verschijnt. Pagina-specifieke componenten blijven inline in `page.tsx`. `home-launcher.ts` blijft buiten scope.

---

## Copy- en labelregels

Alle zichtbare labels in het Nederlands. Paginatitel en secties bewaken de cockpit-rol.

| Element | Label |
|---|---|
| Paginatitel | Dashboard overview |
| Badge | Cockpit |
| Subtitel | Bekijk welke routes aandacht vragen en ga direct naar de juiste vervolglaag. |
| Sectie "Nu eerst" | Nu eerst |
| Sectie-ondertitel | Deze routes vragen als eerste aandacht op basis van status, volgende stap of beschikbare output. |
| Telkaart Actie nodig | ACTIE NODIG |
| Telkaart Bijna klaar | BIJNA KLAAR |
| Telkaart Live en leesbaar | LIVE EN LEESBAAR |
| Telkaart Geblokkeerd | GEBLOKKEERD / NIET GESTART |
| Kolom WAAROM | WAAROM |
| Kolom VOLGENDE STAP | VOLGENDE STAP |
| CTA beheer | Beheer route |
| CTA dashboard | Open dashboard |
| CTA rapport | Open rapport |
| CTA action center | Open Action Center |
| Sectie geblokkeerd | Geblokkeerd / niet gestart |
| Sectie afgerond | Recente afgeronde routes |
| Lege state | (behoud bestaande `AdminEmptyState` en `ViewerEmptyState`) |

**Statuslabels** (afgeleid uit bestaande `getHomeStateMeta()`):

| State | Visueel label | Toon |
|---|---|---|
| full | Leesbaar | emerald |
| partial | Deels zichtbaar | amber |
| sparse | Nog in opbouw | amber |
| running | Nog in opbouw | amber |
| ready_to_launch | Nog in opbouw | amber |
| setup | Nog niet live | amber |
| closed | Afgerond | slate |

Codex gebruikt de bucketlabels uit dit plan exact zoals hierboven. Geen extra statusnamen introduceren.

---

## Verboden termen en patronen

### Inhoudelijk verboden op deze pagina
- Diepgaande scananalyse (factor-breakdown, segmentanalyse, aanbevelingen).
- Setupdetails (respondentimport, launch control, preflight checklist, invite-flow).
- Action Center-detailacties (accepteren, afwijzen, toewijzen, escaleren).
- Rapportinhoud (samenvatting, citaten, aanbevelingen uit rapport).

### Technisch verboden
- Mockdata in productiebuild.
- Silent 0-fallbacks voor betekenisvolle metrics (gebruik `"—"` of verberg element).
- Nieuwe productclaims (scores, labels, drempelwaarden) die niet uit bestaande state-machine volgen.
- Paginarol-drift (geen setupwizard, geen diep analyseonderdeel op deze pagina).
- `any` als TypeScript-type.
- Inline stijlen die design-tokens omzeilen.
- Nieuwe Supabase-queries die niet als datagap zijn genoteerd.
- Verwijderen van guardrail-assertions of omzeilen via commentaar.

### Verboden component-namen (conform bestaande guardrail-tests)
- `OverviewLeadCard`
- `Overige actieve routes`
- `Portfolio samenvatting`
- `Aanbevolen focus`

---

## Fallback- en datagapbeleid

| Situatie | Gedrag |
|---|---|
| Campagnelijst leeg (admin) | Toon `AdminEmptyState` — geen statustelkaarten |
| Campagnelijst leeg (viewer) | Toon `ViewerEmptyState` — geen statustelkaarten |
| `avg_risk_score === null` | Toon `"Nog niet vrij"` — niet `0` of `"—"` |
| `completion_rate_pct` ontbreekt | Toon `"—"` |
| Organisatienaam niet beschikbaar | Toon `"Alle routes"` als contextlabel |
| "Laatste update"-timestamp niet beschikbaar | Element weglaten — geen vervanger tonen |
| Filter "Status" client-side leeg resultaat | Toon "Geen routes met deze status" — geen verborgen lege staat |
| Filter "Periode" niet beschikbaar | Niet tonen |
| Sectie "Geblokkeerd / niet gestart" leeg | Sectie volledig weglaten (`null`) |
| Sectie "Recente afgeronde routes" leeg | Sectie volledig weglaten (`null`) |
| Sectie "Nu eerst" leeg | Toon informatieve lege staat: "Geen routes vragen op dit moment actie." |
| `canOpenActionCenterRoute === false` | Verberg CTA "Open Action Center" — geen fallback-link |
| Onbekende `scan_type` in `getScanDefinition()` | Toon `scan_type` raw als productnaam — nooit crash |

**Wanneer Codex een datagap in uitvoerrapport moet zetten:**
- Elk veld dat de Stitch visual vraagt maar niet in `CampaignStats` bestaat.
- Elk filter dat niet met bestaande data gebouwd kan worden.
- Elke CTA die een flow verwacht die niet bestaat in de huidige routing.

---

## Testplan

Codex voert alle checks uit en rapporteert de resultaten.

| Check | Commando / methode |
|---|---|
| TypeScript typecheck | `npx tsc --noEmit` vanuit `Verisight/frontend/` |
| Bestaande unit/component tests | `npx vitest run` of equivalent |
| Guardrail-test `page.test.ts` | Alle assertions slagen — zie lijst in Fase 8 |
| Route render zonder crash | Route `/dashboard` laadt zonder error boundary; empty-state rendert correct |
| Responsive check | Visuele inspectie op 375px (mobile), 768px (tablet), 1280px (desktop) |
| Geen mockdata in productie | Grep op `fixture`, `mock`, `TODO: real data` in gewijzigde bestanden |
| Geen verboden termen | Grep op `OverviewLeadCard`, `Portfolio samenvatting`, `Aanbevolen focus`, `Overige actieve routes` |
| Bestaande routing intact | `/campaigns/[id]`, `/reports`, `/action-center` links werken |
| Bestaande exports intact | Geen bestaande exports verwijderd tenzij aantoonbaar ongebruikt |
| Action Center-logica onaangeraakt | `action-center/` routes en `action-center-*.tsx` componenten niet gewijzigd |
| Dashboard-architectuur test slaagt | `app/(dashboard)/campaigns/[id]/dashboard-architecture.test.ts` indien bestaat |

---

## Acceptatiecriteria

- [ ] **Informatiearchitectuur gevolgd**: cockpit-header, 4 statustelkaarten, "Nu eerst"-sectie, "Geblokkeerd"-sectie, "Recente afgeronde routes"-sectie aanwezig in correcte volgorde.
- [ ] **Stitch target visueel herkenbaar**: linkse gekleurde border per card, WAAROM/VOLGENDE STAP kolommen, expliciete CTA-knoppen, accent-bars op telkaarten.
- [ ] **Bestaande dataflow leidend**: geen nieuwe Supabase-queries die niet als datagap zijn gemeld; state-machine onaangeraakt.
- [ ] **Triage-mapping gevolgd**: elke `CampaignCompositionState` landt in exact één vooraf vastgelegde cockpitbucket.
- [ ] **Datagaps expliciet**: alle elementen die niet gebouwd konden worden staan in uitvoerrapport.
- [ ] **Geen productlogica gebroken**: alle guardrail-tests slagen; routing onaangeraakt.
- [ ] **Geen verboden content**: geen setupdetails, scananalyse, Action Center-acties, rapportinhoud op deze pagina.
- [ ] **Geen mockdata in productie**: fixture-data uitsluitend in test-context.
- [ ] **Geen `home-launcher`-drift**: `home-launcher.ts` is niet aangepast en niet als nieuwe source of truth gebruikt.
- [ ] **Mobile bruikbaar**: pagina bruikbaar op 375px zonder horizontale scroll of content-overflow.
- [ ] **Kleine, reviewbare PR**: maximaal één logisch gewijzigd domein per commit; geen grote refactors buiten scope.
- [ ] **TypeScript zonder fouten**: `tsc --noEmit` slaagt.

---

## Risico's en mitigaties

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Te grote PR (scope-drift) | Hoog | Hoog | Fase 4 introduceert componenten als slice vóór integratie; Fase 6 is zuivere koppeling — geen refactors buiten scope |
| Mockdata wordt productie | Hoog | Hoog | Fixture-data uitsluitend in Fase 4, niet in `page.tsx`; grep-check in testplan |
| Visuele drift van design system | Middel | Middel | Gebruik uitsluitend bestaande CSS-variabelen en Tailwind-tokens uit `globals.css`; geen inline kleur-overrides |
| Paginarol-drift | Middel | Hoog | Verboden termen gedefinieerd; guardrail-tests bewaken labels; Codex noteert bij twijfel als datagap |
| Ontbrekende data voor triage-buckets | Hoog | Middel | Pre-implementation audit dwingt expliciete beslissing per element; fallback-beleid duidelijk |
| Regressie op bestaande flows | Middel | Hoog | Bestaande guardrail-tests runnen; routing en exports expliciet bewaakt |
| `home-launcher.ts` onbekend in context | Middel | Middel | Inspectie verplicht in Fase 1 vóór aanpassing |
| Statuslabel-mapping conflicteert met bestaande copy | Middel | Middel | Codex documenteert mapping-tabel in uitvoerrapport; geen labels wijzigen zonder mapping |
| Action Center-koppelingen breken | Laag | Hoog | `canOpenActionCenterRoute` en `first_management_use_confirmed_at` bewaakt in guardrail-tests; Codex raakt `action-center/` niet aan |
| Access/role fouten | Laag | Middel | `loadSuiteAccessContext()` blijft ongewijzigd; `managerOnly → redirect` guard behouden |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Codex levert na voltooiing een uitvoerrapport met:

1. **Gewijzigde bestanden**: volledig pad + korte beschrijving van wijziging.
2. **Nieuwe componenten**: naam, bestand, verantwoordelijkheid.
3. **Hergebruikte componenten**: naam, bestand, hoe hergebruikt.
4. **Datamapping-resultaat**: definitieve tabel van UI-element → databron per sectie (bevestiging of correctie van Pre-implementation audit).
5. **Datagaps**: lijst van elementen die NIET gebouwd zijn met reden en hoe fallback eruit ziet.
6. **Tests gedraaid**: welke suites, resultaat (pass/fail), eventuele failures.
7. **Screenshots of preview notes**: visuele bevestiging van de vier secties op 375px en 1280px.
8. **Afwijkingen van plan**: wat Codex anders heeft gedaan dan dit plan beschrijft, en waarom.
9. **Open restpunten**: wat niet gerealiseerd is en aanbeveling voor vervolgstap.
