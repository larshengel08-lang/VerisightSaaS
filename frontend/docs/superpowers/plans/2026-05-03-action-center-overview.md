# Action Center Overview — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vertaal de Stitch visuele referentie naar een verbeterde overview-laag van de bestaande Action Center pagina, zonder productlogica, datamodel of IA te wijzigen.

**Architecture:** De bestaande `ActionCenterPreview` client-component (2000+ regels) bevat al een 'overview' view. Dit plan verbetert de visuele laag van die overview-view door een isolatieslag: eerst fixture-data, daarna koppeling aan bestaande items en summary data. De detail-weergave wordt pas zichtbaar na selectie van een item vanuit de list.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v3 (Verisight kleurentokens), bestaande Supabase/action-center data via page.tsx server component.

---

## Korte samenvatting

De Action Center overview pagina bestaat al en werkt. De visuele presentatie van de overview-laag (statuscounters, itemlijst, attentie-sidebar, detailpanel bij item-selectie) sluit nog niet aan op het design system zoals beschreven in DESIGN.md en uitgewerkt in de Stitch referentiebeelden. Dit plan stuurt Codex om, inspect-first, de visuele laag te verbeteren: countertiles, item-rij-structuur, attentie-sidebar, en het detail-side-panel — zonder nieuwe productlogica, nieuwe statussen of nieuwe datastromen te introduceren.

---

## Doel

1. De overview-view van Action Center visueel aansluiten op het Stitch referentiepatroon (layout, spacing, hiërarchie, statusbadges, detailpanel).
2. Bestaande data en dataflow intact houden.
3. Alle datagaps expliciet benoemen in het uitvoerrapport.
4. Een kleine, reviewbare PR opleveren.

---

## Niet-doelen

- Geen nieuwe productlogica, statussen of workflowstappen.
- Geen analytics-dashboard, geen surveyconsumptie, geen rapportduiding.
- Geen brede workflow-suite op deze pagina.
- Geen mockdata in productie.
- Geen wijziging aan de IA of paginarol.
- Geen nieuwe modules (RetentieScan, QuickScan, MTO) toevoegen op basis van Stitch.
- Geen herstructurering van de `ActionCenterPreview` buiten de overview-view.
- Geen push naar main.

---

## Bronnen en inputs

| Bron | Type | Gebruik |
|---|---|---|
| Stitch list view (`action_list_view/screen.png` + `code.html`) | Visuele referentie | Itemlijst layout, card-structuur, spacing, badges |
| Stitch detail view (`action_detail_view/screen.png` + `code.html`) | Visuele referentie | Detail-side-panel structuur, header, quick-info grid |
| Stitch overview (`action_center_overview/screen.png` + `code.html`) | Visuele referentie | Statuscounters, filter-bar positionering, twee-kolom grid |
| `DESIGN.md` (Verisight) | Design system | Kleurentokens, typografie, spacing, componentstijl |
| `app/(dashboard)/action-center/page.tsx` | Productie code | Server component, data aggregatie |
| `components/dashboard/action-center-preview.tsx` | Productie code | Client component, view-rendering (2000+ regels) |
| `lib/action-center-preview-model.ts` | Types | `ActionCenterPreviewItem`, statuses, priorities |
| `lib/action-center-live.ts` | Data builders | `buildLiveActionCenterItems`, `getLiveActionCenterSummary` |
| `lib/action-center-route-contract.ts` | Types | Route statuses, outcomes |
| `lib/action-center-core-semantics.ts` | Types | `ActionCenterCoreSemantics` |

---

## Product- en canonregels

- **Bestaande statussen (canon):** `'open-verzoek' | 'te-bespreken' | 'reviewbaar' | 'in-uitvoering' | 'geblokkeerd' | 'afgerond' | 'gestopt'`
- **Bestaande prioriteiten (canon):** `'hoog' | 'midden' | 'laag'`
- **Summary-velden (canon):** `routeCount`, `productCount`, `organizationCount`, `actionCount`, `blockedCount`, `reviewCount`, `nextReviewDate`, `activeRouteCount`, `closedRouteCount`, `decisionRouteCount`, `reopenedRouteCount`, `followUpVisibleRouteCount`, `continuationVisibleRouteCount` — uit `getLiveActionCenterSummary()`
- **Item-velden (canon):** `id`, `code`, `title`, `summary`, `sourceLabel`, `scopeType`, `teamLabel`, `ownerName`, `priority`, `status`, `reviewDate`, `peopleCount`, `coreSemantics` — uit `ActionCenterPreviewItem`
- Paginarol: opvolgingscockpit / bounded follow-through overview. Niet: rapport, dashboard, survey, brede workflow-suite.
- Geen fallback-nullen voor betekenisvolle data zonder zichtbare indicatie.
- Detail-view mag pas zichtbaar worden na selectie van een item.

---

## Gewenste informatiearchitectuur

```
Action Center Overview
├── PageHeader
│   ├── Titel: "Action Center"
│   └── Subtitel: "Overzicht van managementopvolging en acties"
├── StatusCounterBar (5 tiles)
│   ├── Actieve routes
│   ├── Te bespreken / Reviewbaar
│   ├── Geblokkeerd
│   ├── [Datagap: zie tabel]
│   └── Afgerond
├── FilterBar (bestaande filters, Stitch positionering)
└── TweeKolomGrid (8 + 4)
    ├── ItemList (col-span-8)
    │   ├── ItemRow per ActionCenterPreviewItem
    │   │   ├── Titel + sourceLabel + scopeLabel
    │   │   ├── Prioriteitsbadge
    │   │   ├── TeamLabel
    │   │   ├── OwnerAvatar + OwnerName
    │   │   ├── Statusbadge
    │   │   └── ReviewDate
    │   └── [Geblokkeerde rij: rode linkerborder]
    └── AttentieSidebar (col-span-4)
        ├── "Wat vraagt nu aandacht?" — geblokkeerde items
        └── "Komende reviews" — items met reviewDate (eerstvolgende)
```

Bij selectie van een item:
```
DetailPanel (slide-in / side-panel)
├── DetailHeader
│   ├── StatusBadge + ItemCode
│   ├── Titel
│   └── QuickInfoGrid (Owner, Team, ReviewDate, [eventueel peopleCount])
├── DetailContentBlocks (bestaande coreSemantics)
└── DetailActions (bestaande editor-integratie, GEEN nieuwe knoppen)
```

---

## Visuele target uit Stitch

De Stitch-output legt twee scherpen neer:

1. **Overview / list view:** een tabel- of card-based lijstweergave met een statuscounterbalk erboven en een attentie-sidebar ernaast.
2. **Detail view:** een zijpaneel of volledige detailpagina die opent na item-selectie, met header, quick-info grid, en een inhoudsgrid (rationale + review log).

Beide zijn **uitsluitend visuele referenties** — zie de secties "Wat uit Stitch wordt overgenomen" en "Wat niet".

---

## Stitch visual inputs

### List view — visuele inventaris

**Hoofdstructuur:** Volledige pagina met sidebar-nav, sticky topbar, pageheader, metrics-balk (4 tiles), card-based itemlijst (space-y-4), en een onderste sectie met een breed inzichtblok + smal reviewblok.

**Kaart/rij-opbouw:** Elke item is een `rounded-xl` card met:
- Linksboven: gevuld icoon in donkere container (icon type per actie)
- Titel (20px, Plus Jakarta Sans) + prioriteitsbadge (hoog/middel/laag, rounded, uppercase)
- Secundaire rij: route-icoon + scanlabel, scheidingspunt, scope/afdeling, scheidingspunt, owner avatar (20px, rounded-full) + naam
- Rechtsboven: statusbadge (rounded-full) + "Next Review: [datum]" label
- Onderregel (border-t): Due Date | Last Update | link "View Insight Deep-dive"

**Statusgroepering:** Geen expliciete statuslanes in de list view. Items worden op volgorde getoond. Geblokkeerde items onderscheiden zich via een rode border-left in de overview-tabelvariant.

**CTA-positionering:** Rechtsboven in de pageheader: "Initiate New Action" (primary button). Niet op itemniveau.

**Informatiehiërarchie:** Titel > prioriteitsbadge > route+scope+owner > status+reviewdate > secundaire metadata.

**Visuele sterktes:**
- Duidelijke hiërarchie binnen de card
- Priority badge direct naast de titel
- Owner als persoon zichtbaar (avatar + naam)
- Hover-state: border-secondary + shadow-md
- Statusbadge onderscheidt zich door kleur (teal = actief, primary/donker = afgerond)

**Visuele risico's:**
- "View Insight Deep-dive" link — niet Verisight IA, mag niet worden overgenomen
- Mockdata (percentages, "88% completion rate", "12d lead time") — geen productwaarheid
- Statussen "Nieuw" en "Discovery" — niet canon, mogen niet worden overgenomen
- Onderste sectie "Strategic Trend" — rapport/analytics inhoud, niet op deze pagina
- FAB (floating action button) rechtsboven — behoort niet tot de Action Center overview IA

---

### Detail view — visuele inventaris

**Detailcontainer / side panel / drawer-opbouw:** Volledige pagina met sticky topbar (tab-nav: Directives / Review Cycle / History), geen sidebar-drawer. Inhoud start onder de topbar met een 12-kolom grid: col-span-8 voor de inhoud, col-span-4 voor de actiepaneel.

**Bovenaan:**
- Status-badge ("Active Action") + referentie-code ("Ref: ACT-2024-082")
- H2 titel (headline-xl, 32px)
- Quick-info grid (4 kolommen): Owner, Team, Due Date, Next Review

**Secundaire informatie:**
- Actiepaneel col-4: 4 knoppen (Status wijzigen, Update toevoegen, Review plannen, Eigenaar aanpassen)
- Content-grid col-7: "Waarom deze actie?" (linked signal), Rationale, Contextual Notes
- Content-grid col-5: Review Log & History (verticale tijdlijn met datum/tijd items)

**Hoe gekoppelde context wordt getoond:**
- "Linked Signal" blok: icoon + signaaltype + beschrijving + link
- Review log: verticale tijdlijn met datum, cirkelindicator (kleur per event-type), titel + beschrijving

**Visuele sterktes:**
- Duidelijke scheiding primaire actie (knoppen) vs. inhoud
- Quick-info grid geeft in één oogopslag wie, wanneer, wat
- Tijdlijn geeft audittrail visueel compact weer
- Teal/accent-action linker-border accent op "Waarom deze actie?" blok

**Visuele risico's:**
- 4 action-knoppen als nieuwe productfeatures — moeten mappen op bestaande editor-flows, niet als losse knoppen
- "Rationale" als vrij-tekstveld — niet in bestaand datamodel, DATAGAP
- "Contextual Notes" als vrij-tekstveld — niet in bestaand datamodel, DATAGAP
- "Linked Signal: High Churn Risk" als product-concept — mockdata, niet IA
- "View full Insight Layer details" link — verwijst naar een laag die niet bestaat in Action Center IA
- Review log entries zijn mockdata — moeten uit bestaande `decisionHistory` of `actionReviews` komen
- Tab-nav "Directives / Review Cycle / History" — niet de bestaande `ActionCenterPreviewView` waarden

---

## Wat uit Stitch wordt overgenomen

| Element | Wat wordt overgenomen |
|---|---|
| **Statuscountertiles** | 5-tile grid, `label-caps` label boven, `metric-value` getal, kleuraccent (secondary=actief, error=geblokkeerd, accent-warm=te-bespreken), linkerborder-accent op de "te-bespreken" tile |
| **Filterbar positionering** | Horizontale balk met dropdown-pills, "Nieuwe Actie" CTA rechts uitgelijnd |
| **Itemrij tabelstructuur** | Kolommen: Titel & Route, Team, Eigenaar, Status, Next Review |
| **Prioriteitsbadge op itemrij** | Inline badge naast de titel, kleurgecodeerd: hoog=error, midden=on-tertiary-container, laag=surface-container |
| **Owner avatar + naam** | 24px cirkel met initialen of kleur, naam naast |
| **Statusbadge** | `rounded-sm` pill, uppercase, kleurgecodeerd per bestaande status |
| **Geblokkeerde rij accentuering** | `border-l-4 border-l-error` op de tabelrij |
| **Hover-state itemrij** | `hover:bg-background` (overview) of `hover:border-secondary hover:shadow-md` (card) |
| **Attentie-sidebar "Wat vraagt nu aandacht?"** | Paneel met donkere header, geblokkeerde items bovenaan met rode border-left, urgente reviews als amber-accent items |
| **"Komende reviews" sidebar-paneel** | Datum+tijd per item, titel, eigenaar, "Alle bekijken" link indien relevant |
| **Detail-panel header** | Statusbadge + code, h2 titel, 4-kolom quick-info grid |
| **Detail left-accent border** | `border-l-4 border-l-secondary` op het detail-content blok |
| **Review-tijdlijn layout** | Verticale lijn, cirkeliconen per event, datum links, beschrijving rechts |
| **Spacing en typografie** | `label-caps` voor sectieheaders boven tabellen, `metric-value` voor counters, `Plus Jakarta Sans` voor koppen, `Inter` voor bodytekst |
| **Tonal layering en lage schaduw** | `bg-surface-container-lowest` voor cards, `border border-outline-variant`, subtiele `shadow-sm` |

---

## Wat uit Stitch niet wordt overgenomen

| Element | Reden |
|---|---|
| Mockdata (namen, datums, percentages, counts) | Geen productwaarheid; mag nooit in productie |
| Branding "InsightFlow", "Analytical Authority" | Stitch-artefact, niet Verisight |
| Tekst "Strategic Action Directives", "Operational Intelligence" | Niet Verisight-taal, botst met paginatitel IA |
| Statussen "Nieuw", "Discovery" | Niet canoniek; canon is `'open-verzoek' | 'te-bespreken' | ... | 'gestopt'` |
| Metriek "Completion Rate 88%" | Geen datamodel-equivalent, zou een false claim zijn |
| Metriek "Average Lead Time 12d" | Geen datamodel-equivalent, DATAGAP |
| "Urgent Priority 06" als aparte counter | Urgentie is priority='hoog', geen aparte summary-waarde; gebruik `items.filter(i => i.priority === 'hoog').length` alleen indien gedekt |
| "View Insight Deep-dive" / "View Post-Mortem Insight" links | Verwijst naar rapport/analytics laag, niet Action Center IA |
| "Strategic Trend: Marketing Werkdruk" sectie onderaan list | Rapport-/dashboardinhoud; verboden op deze pagina |
| "Upcoming Review" kaart met "PREPARE BRIEFING" | Niet in Action Center IA |
| Tab-nav "Directives / Review Cycle / History" | Niet de bestaande `ActionCenterPreviewView`-waarden |
| Action-knoppen detail "Status wijzigen / Update toevoegen / Review plannen / Eigenaar aanpassen" als netto-nieuwe knoppen | Mogen alleen mappen op bestaande editor-flows in `ActionCenterPreview`; geen nieuwe productlogica |
| "Waarom deze actie?" → "Linked Signal" als nieuwe productlaag | Stitch-mockdata; de bestaande `coreSemantics.reason` kan worden getoond, maar niet als nieuwe "Linked Signal" productclaim |
| "Rationale" als vrij-tekstveld in detail | Niet in bestaand datamodel; DATAGAP, niet implementeren |
| "Contextual Notes" als vrij-tekstveld in detail | Niet in bestaand datamodel; DATAGAP, niet implementeren |
| "RetentieScan", "QuickScan" als scan-types in mockdata | Verisight heeft momenteel alleen ExitScan als actieve module |
| Manager-performance / team-performance metrics | Verboden op deze pagina (geen dashboard/rapportlaag) |
| Externe kalenderlink "Alle afspraken bekijken" | Geen externe kalenderintegratie in huidig platform |
| Floating Action Button (FAB) rechtsonder | Niet in Verisight design system, IA wijzigt pagina naar workflow-suite |
| Footer met "Data Security / Methodology / Export Logs" links | Niet in bestaand platform |
| Progress bar "88% completion rate" | Generieke performance claim, niet data-gebonden |

---

## Componentmapping vanuit Stitch

> Codex **moet eerst bestaande componenten opzoeken** voor hergebruik. Onderstaande namen zijn voorgesteld; bestaande componenten hebben prioriteit.

| Voorgestelde componentnaam | Beschrijving | Hergebruik of nieuw |
|---|---|---|
| `ActionCenterOverviewPage` | Wrapper voor de overview-view in `ActionCenterPreview` | Hergebruik: bestaand in `action-center-preview.tsx` overview-branch |
| `ActionCenterStatusCounters` | 5-tile statuscounterbalk | Mogelijk nieuw of extractie uit bestaand |
| `ActionCenterItemTable` | Tabelcontainer met headers en itemrijen | Mogelijk al aanwezig, visuele polish |
| `ActionCenterItemRow` | Eén tabelrij: titel/bron, team, owner, status, reviewdate | Mogelijk al aanwezig, visuele polish |
| `ActionCenterPriorityBadge` | Inline badge: hoog/midden/laag + kleurcodering | Nieuw of extractie |
| `ActionCenterStatusBadge` | Status-pill: statuswaarde + kleurcodering | Mogelijk al aanwezig |
| `ActionCenterOwnerCell` | Avatar-cirkel (initialen) + naam | Mogelijk al aanwezig |
| `ActionCenterAttentionSidebar` | Paneel "Wat vraagt nu aandacht?" + "Komende reviews" | Mogelijk al aanwezig als sidebar-variant |
| `ActionCenterAttentionItem` | Eén attentie-item (geblokkeerd/review) met border-accent | Nieuw of extractie |
| `ActionCenterUpcomingReviewItem` | Eén review-item in de sidebar: datum + titel + owner | Nieuw of extractie |
| `ActionCenterDetailPanel` | Side-panel of inlinepaneel bij geselecteerd item | Hergebruik: bestaand detail-view in `ActionCenterPreview` |
| `ActionCenterDetailHeader` | StatusBadge + code + h2-titel + quick-info grid | Mogelijk al aanwezig, visuele polish |
| `ActionCenterDetailQuickInfo` | 4-kolom grid: owner, team, reviewdate, [peopleCount] | Mogelijk al aanwezig, visuele polish |
| `ActionCenterDetailTimeline` | Verticale tijdlijn: event-datum, icoon, beschrijving | Hergebruik indien al aanwezig; anders nieuw |

---

## Data-contract voor list view en detail view

| UI-element | Veldnaam | Used in | Bestaande bron | Schaal/betekenis | Fallback | Productie tonen | Open vraag / datagap |
|---|---|---|---|---|---|---|---|
| Counter: Actieve routes | `summary.activeRouteCount` | List | `getLiveActionCenterSummary(items)` in `lib/action-center-live.ts` | Aantal routes met status ≠ afgerond/gestopt | "—" | Ja | Klopt de definitie van 'actief' met de UI-intentie? |
| Counter: Te bespreken | `summary.reviewCount` | List | `getLiveActionCenterSummary(items)` | Items met status `te-bespreken` of `reviewbaar` | "—" | Ja | Bevestig definitie reviewCount in live.ts |
| Counter: Geblokkeerd | `summary.blockedCount` | List | `getLiveActionCenterSummary(items)` | Items met status `geblokkeerd` | "—" | Ja | — |
| Counter: [4e tile] | TBD | List | DATAGAP | "Scopes met aandacht" of "Afdelingen actief" | "Niet beschikbaar" | Nee tot datagap gevuld | Datagap: welk summary-veld dekt "afdelingen met aandacht"? |
| Counter: Afgerond | `summary.closedRouteCount` | List | `getLiveActionCenterSummary(items)` | Routes met status `afgerond` of `gestopt` | "—" | Ja | Geldt `gestopt` ook als "afgerond" visueel? |
| Itemrij: Titel | `item.title` | List + Detail | `ActionCenterPreviewItem` | Naam van de actie/route | "Onbekende actie" | Ja | — |
| Itemrij: Bronlabel | `item.sourceLabel` | List | `ActionCenterPreviewItem` | Scan-type label (bijv. "ExitScan") | "—" | Ja | — |
| Itemrij: Scopelabel | `item.teamLabel` | List | `ActionCenterPreviewItem` | Afdeling of scope-label | "Onbekend team" | Ja | Is teamLabel altijd de scope of de toegewezen manager-groep? |
| Itemrij: Owner naam | `item.ownerName` | List + Detail | `ActionCenterPreviewItem` | Naam van de eigenaar | "Niet toegewezen" | Ja | — |
| Itemrij: Owner avatar | Initialen van `item.ownerName` | List + Detail | Afgeleid | 2-letterige initialen in gekleurde cirkel | Lege cirkel met grijstint | Ja | — |
| Itemrij: Status | `item.status` | List + Detail | `ActionCenterPreviewItem` | Een van 7 canonieke statuswaarden | "—" | Ja | — |
| Itemrij: Prioriteit | `item.priority` | List | `ActionCenterPreviewItem` | `hoog` / `midden` / `laag` | Niet tonen indien null | Ja | — |
| Itemrij: Reviewdatum | `item.reviewDate` | List + Detail | `ActionCenterPreviewItem` | ISO-datum string of null | "—" (geen datum) | Ja | — |
| Itemrij: Geblokkeerde border | `item.status === 'geblokkeerd'` | List | Afgeleid | Booleaanse UI-conditie | n.v.t. | Ja | — |
| Attentiesidebar: geblokkeerde items | `items.filter(i => i.status === 'geblokkeerd')` | Sidebar | `ActionCenterPreviewItem[]` | Max. 3 tonen, rest tellen | "Geen geblokkeerde routes" | Ja | — |
| Attentiesidebar: komende reviews | `items.filter(i => i.reviewDate !== null)` gesorteerd oplopend | Sidebar | `ActionCenterPreviewItem[]` | Reviews binnen komende 14 dagen | "Geen geplande reviews" | Ja | Wat is de tijdshorizon? 7 of 14 dagen? |
| Detail: Item code | `item.code` | Detail | `ActionCenterPreviewItem` | Referentiecode van de route | Niet tonen indien null | Ja | — |
| Detail: Scope context | `item.scopeType`, `item.scopeLabel` (via teamLabel) | Detail | `ActionCenterPreviewItem` | Type scope (department/item) + label | "—" | Ja | `scopeLabel` vs `teamLabel` — welke te tonen? |
| Detail: People count | `item.peopleCount` | Detail | `ActionCenterPreviewItem` | Aantal betrokkenen in de scope | Niet tonen indien 0 of null | Nee — tonen als "n respondenten" pas na governance-check | Mag dit getal altijd zichtbaar? RLS/governance check vereist |
| Detail: Core semantics | `item.coreSemantics` | Detail | `ActionCenterPreviewItem` | Semantisch blok (reason, review, actions, result loop) | Niet tonen indien leeg | Ja — alleen bestaande velden | Welke velden van coreSemantics zijn veilig zichtbaar in overview-context? |
| Detail: Review tijdlijn | Via `actionReviews` + `reviewDecisions` | Detail | Bestaande editor-flows + API routes | Historisch auditspoor | "Nog geen reviewhistorie" | Ja | Zijn deze al opvraagbaar vanuit de preview-item context? |
| Detail: "Waarom deze actie?" | `item.coreSemantics.reason` of equivalent | Detail | `ActionCenterCoreSemantics` | Reden voor de actie op basis van scan-uitkomsten | Niet tonen indien null | Ja — geen product-claims toevoegen | DATAGAP: Heeft `coreSemantics` een `reason`-veld? Codex moet inspecteren. |
| Detail: Rationale vrij-tekst | — | Detail | DATAGAP — niet in datamodel | — | Sectie niet renderen | Nee | DATAGAP: bestaat niet; niet implementeren |
| Detail: Contextual Notes | — | Detail | DATAGAP — niet in datamodel | — | Sectie niet renderen | Nee | DATAGAP: bestaat niet; niet implementeren |

---

## Bestaande code die Codex eerst moet inspecteren

```
Verisight/frontend/
├── app/(dashboard)/action-center/
│   └── page.tsx                                    ← server component, data aggregatie (~538 regels)
├── components/dashboard/
│   ├── action-center-preview.tsx                   ← hoofd-UI-component (~2000+ regels)
│   ├── action-center-action-review-editor.tsx      ← editor-flow
│   ├── action-center-review-decision-editor.tsx    ← editor-flow
│   └── action-center-route-action-editor.tsx       ← editor-flow
├── lib/
│   ├── action-center-preview-model.ts              ← types: Item, Status, Priority, View
│   ├── action-center-live.ts                       ← builders + summary (~763 regels)
│   ├── action-center-route-contract.ts             ← RouteContract types
│   ├── action-center-core-semantics.ts             ← CoreSemantics type
│   ├── action-center-live-context.ts               ← LiveActionCenterCampaignContext
│   ├── action-center-shared-core.ts                ← gedeelde utilities
│   ├── action-center-governance.ts                 ← permissie/governance checks
│   ├── action-center-decision-history.ts           ← beslissinghistorie
│   ├── action-center-action-reviews.ts             ← action reviews
│   └── action-center-manager-responses.ts          ← manager responses
└── tests/e2e/
    ├── action-center-hr-happy-path.spec.ts
    ├── action-center-manager-access.spec.ts
    ├── action-center-route-closeout.spec.ts
    ├── action-center-route-reopen.spec.ts
    └── action-center-route-action-cards.spec.ts
```

**Codex inspecteert minimaal:**
1. In `action-center-preview.tsx`: Hoe is de `overview` view-branch gerenderd? Welke sub-componenten worden gebruikt? Welke staat regelt de geselecteerde item?
2. In `action-center-preview-model.ts`: Volledige `ActionCenterPreviewItem` interface — met name `code`, `scopeLabel`, `coreSemantics`.
3. In `action-center-live.ts`: Definitie van `ActionCenterWorkspaceReadbackSummary` en wat elk veld telt.
4. In `action-center-core-semantics.ts`: Heeft `ActionCenterCoreSemantics` een `reason`-veld? Wat is veilig zichtbaar?
5. In `action-center-governance.ts`: Zijn er zichtbaarheidschecks op `peopleCount` of andere detailvelden?

---

## Pre-implementation audit en datacontract

| UI-element | Benodigde data | Bestaande bron/helper | Schaal/betekenis | Fallback | Productie tonen | Open vraag / datagap |
|---|---|---|---|---|---|---|
| Statuscounterbalk tile 1 | `summary.activeRouteCount` | `getLiveActionCenterSummary()` | Routes in actieve status | "—" | Ja | Definitie 'actief' bevestigen |
| Statuscounterbalk tile 2 | `summary.reviewCount` | `getLiveActionCenterSummary()` | `te-bespreken` + `reviewbaar` | "—" | Ja | Bevestig veldinhoud |
| Statuscounterbalk tile 3 | `summary.blockedCount` | `getLiveActionCenterSummary()` | `geblokkeerd` | "—" | Ja | — |
| Statuscounterbalk tile 4 | DATAGAP | — | "Afdelingen met aandacht" | "Niet beschikbaar" | Nee | Codex moet bepalen welk summary-veld past |
| Statuscounterbalk tile 5 | `summary.closedRouteCount` | `getLiveActionCenterSummary()` | `afgerond` + evt. `gestopt` | "—" | Ja | Geldt `gestopt` mee? |
| Itemrij: Titel + bron | `item.title`, `item.sourceLabel` | `ActionCenterPreviewItem` | Actienaam + scan-type | "Onbekende actie" | Ja | — |
| Itemrij: Scope/Team | `item.teamLabel` | `ActionCenterPreviewItem` | Afdeling of scope-label | "Onbekend" | Ja | Scope vs team — bevestigen |
| Itemrij: Owner | `item.ownerName` | `ActionCenterPreviewItem` | Naam eigenaar | "Niet toegewezen" | Ja | — |
| Itemrij: Status badge | `item.status` | `ActionCenterPreviewItem` | 1 van 7 canonieke waarden | Niet renderen indien null | Ja | — |
| Itemrij: Prioriteit badge | `item.priority` | `ActionCenterPreviewItem` | hoog/midden/laag | Niet tonen indien null | Ja | — |
| Itemrij: Review datum | `item.reviewDate` | `ActionCenterPreviewItem` | ISO-datum of null | "—" | Ja | — |
| Geblokkeerde row-accent | `item.status === 'geblokkeerd'` | Afgeleid | Boolean UI-conditie | n.v.t. | Ja | — |
| Attentie-sidebar geblokkeerd | `items.filter(i => i.status === 'geblokkeerd')` | `ActionCenterPreviewItem[]` | Max. 3 items | "Geen geblokkeerde routes" | Ja | — |
| Attentie-sidebar reviews | `items` met `reviewDate != null` gesorteerd ASC | `ActionCenterPreviewItem[]` | Eerstvolgende reviews | "Geen geplande reviews" | Ja | Tijdshorizon: 7 of 14 dagen? DATAGAP |
| Detail: code | `item.code` | `ActionCenterPreviewItem` | Routereferentie | Niet tonen indien null | Ja | — |
| Detail: coreSemantics.reason | `item.coreSemantics.reason` (of equivalent veld) | `ActionCenterCoreSemantics` | Reden voor de actie | Sectie niet renderen | Ja — alleen bestaand veld | DATAGAP: veld bestaat of niet? Codex inspecteert |
| Detail: peopleCount | `item.peopleCount` | `ActionCenterPreviewItem` | Aantal betrokkenen | Niet tonen bij 0 of null | Governance-check vereist | RLS/governance check eerst |
| Detail: review tijdlijn | `actionReviews`, `reviewDecisions` | Bestaande API-routes + editor-flows | Auditspoor | "Nog geen reviewhistorie" | Ja | Zijn deze beschikbaar in preview-context? |
| Detail: Rationale | — | DATAGAP | n.v.t. | Sectie niet renderen | Nee | DATAGAP: niet implementeren |
| Detail: Contextual Notes | — | DATAGAP | n.v.t. | Sectie niet renderen | Nee | DATAGAP: niet implementeren |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

- [ ] Open `action-center-preview.tsx` en lokaliseer de `view === 'overview'` render-branch
- [ ] Noteer alle sub-componenten die in de overview-branch worden gebruikt (namen + regelnummers)
- [ ] Noteer welke state-variabelen de geselecteerde item bijhouden
- [ ] Open `action-center-preview-model.ts` en noteer de volledige `ActionCenterPreviewItem` interface
- [ ] Open `action-center-live.ts` en noteer de volledige `ActionCenterWorkspaceReadbackSummary` interface en hoe elk veld wordt berekend
- [ ] Open `action-center-core-semantics.ts` en noteer of er een `reason`-veld bestaat
- [ ] Open `action-center-governance.ts` en noteer of `peopleCount` een zichtbaarheidscheck heeft
- [ ] Open `page.tsx` en noteer welke props worden doorgegeven aan `ActionCenterPreview`
- [ ] Rapporteer bevindingen in het uitvoerrapport (bestaande componenten, exacte regel-ranges, datagaps bevestigd of geopend)

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

- [ ] Vergelijk de Stitch list view met de huidige overview-render: welke visuele elementen ontbreken?
- [ ] Vergelijk de Stitch detail view met de huidige detail-render: welke visuele elementen ontbreken?
- [ ] Maak een shortlist van max. 8–10 concrete visuele gaps (bijv. "prioriteitsbadge ontbreekt", "statusbadge mist kleurcodering", "attentie-sidebar ontbreekt")
- [ ] Bepaal per gap: hergebruik bestaande component (polish) of nieuw sub-component nodig?
- [ ] Rapporteer shortlist in uitvoerrapport

### Fase 3 — Vul datacontract en datagaps in

- [ ] Bevestig of weerleg elke DATAGAP uit de tabel hierboven (op basis van Fase 1 bevindingen)
- [ ] Bepaal definitie van tile 4 ("Afdelingen met aandacht") op basis van beschikbare summary-velden — of markeer als "Niet beschikbaar" in productie
- [ ] Bepaal tijdshorizon voor "Komende reviews" sidebar (7 of 14 dagen — leg keuze vast)
- [ ] Controleer governance-check voor `peopleCount` in detail view
- [ ] Rapporteer definitief datacontract in uitvoerrapport

### Fase 4 — Bouw geïsoleerde visual slice met fixture data

- [ ] Maak een fixture-bestand: `Verisight/frontend/tests/fixtures/action-center-overview-fixture.ts`
  - Bevat minimaal 5 `ActionCenterPreviewItem` objecten met variatie in status, priority, reviewDate (incl. null), ownerName, geblokkeerde item
  - Bevat één `ActionCenterWorkspaceReadbackSummary` object met ingevulde velden
  - Fixture gebruikt uitsluitend canonieke statuswaarden en prioriteiten
  - Geen mockdata als productwaarheid: fixture is alleen voor visual slice
- [ ] Bouw `ActionCenterStatusCounters` als geïsoleerd component op basis van fixture summary
  - 5 tiles, `label-caps` label, `metric-value` getal, kleuraccent per tile
  - Tile 4 conditie: render "Niet beschikbaar" tenzij datagap is gevuld
- [ ] Bouw `ActionCenterItemRow` visueel op basis van fixture items
  - Kolommen: Titel+bron, Team, Owner (initialen+naam), Status badge, Prioriteit badge, Review datum
  - Geblokkeerde row: `border-l-4 border-l-error`
  - Hover: `hover:bg-background`
- [ ] Bouw `ActionCenterAttentionSidebar` op basis van fixture items
  - "Wat vraagt nu aandacht?": geblokkeerde items, max. 3
  - "Komende reviews": items met reviewDate gesorteerd ASC
- [ ] Commit: `feat: visual slice action center overview with fixture data`

### Fase 5 — Koppel echte data per sectie/component

- [ ] Vervang fixture summary door de echte `summary` prop (uit `getLiveActionCenterSummary(items)`)
- [ ] Vervang fixture items door de echte `items` prop (uit `buildLiveActionCenterItems(contexts)`)
- [ ] Zorg dat tile 4 niet zichtbaar is als datagap niet gevuld is (conditie: render alleen als veld bestaat)
- [ ] Zorg dat "Komende reviews" alleen items toont met `reviewDate` binnen de vastgestelde tijdshorizon
- [ ] Verwijder het fixture-bestand niet — het blijft als testfixture
- [ ] Commit: `feat: connect action center overview to real data`

### Fase 6 — Integreer in bestaande route

- [ ] Controleer dat de verbeterde overview-view correct wordt geladen op de bestaande route `/action-center`
- [ ] Controleer dat de bestaande `ActionCenterPreviewView` switching (overview / actions / reviews / managers / teams) intact is
- [ ] Controleer dat item-selectie de detail-view triggert (geen pagina-navigatie, tenzij al zo geïmplementeerd)
- [ ] Controleer dat de detail-view pas zichtbaar wordt na selectie (niet standaard open)
- [ ] Controleer dat bestaande editor-flows (action review, review decision, route action) niet geraakt zijn
- [ ] Commit: `feat: integrate action center overview improvements into route`

### Fase 7 — Responsiveness en visual polish

- [ ] Test op viewport 1280px (desktop): layout klopt, twee-kolom grid correct
- [ ] Test op viewport 768px (tablet): tabel scrollt horizontaal of collapset correct
- [ ] Test op viewport 375px (mobile): overview bruikbaar, detail-panel bruikbaar
- [ ] Controleer dat Verisight kleurentokens correct zijn gebruikt (geen hardcoded hex-waarden buiten design system)
- [ ] Controleer typography-tokens: `label-caps` voor sectionheaders, `metric-value` voor counters, `Plus Jakarta Sans` voor koppen, `Inter` voor body
- [ ] Commit: `chore: responsive polish action center overview`

### Fase 8 — Tests en regressiechecks

- [ ] Draai TypeScript check: `cd Verisight/frontend && npx tsc --noEmit`; verwacht: geen nieuwe fouten
- [ ] Draai bestaande unit tests: `npx vitest run` (of equivalent); verwacht: geen regressies
- [ ] Draai e2e tests: `npx playwright test tests/e2e/action-center-hr-happy-path.spec.ts`; verwacht: PASS
- [ ] Draai: `npx playwright test tests/e2e/action-center-manager-access.spec.ts`; verwacht: PASS
- [ ] Controleer handmatig in browser: overview rendert zonder crash bij lege items-array
- [ ] Controleer handmatig in browser: detail-panel opent niet bij page load, wel na item-klik
- [ ] Controleer dat geen mockdata-waarden in productie verschijnen (grep op fixture-waarden in component output)
- [ ] Commit: `test: verify action center overview regression checks`

---

## Componentstrategie

**Principe:** Codex hergebruikt altijd bestaande componenten waar logisch. Nieuwe componenten worden alleen aangemaakt als een visueel element aantoonbaar ontbreekt én niet als variant in bestaande componenten kan worden opgenomen.

**Volgorde van beslissing:**
1. Bestaat het element al in `action-center-preview.tsx`? → Pas visueel aan, maak geen nieuwe component.
2. Is het element een geïsoleerde, herbruikbare eenheid (badge, row, tile)? → Extracteer als sub-component in `components/dashboard/`.
3. Is het element groot genoeg voor een eigen bestand (>50 regels, eigen state)? → Eigen bestand met duidelijke naam.

**Verbod:** Codex maakt geen nieuwe top-level pagina's, nieuwe API routes of nieuwe lib-bestanden voor productlogica. Alle nieuwe code is visuele laag.

---

## Copy- en labelregels

| Element | Nederlands label | Toelichting |
|---|---|---|
| Paginatitel | "Action Center" | Niet wijzigen |
| Pagina-subtitel | "Overzicht van managementopvolging en acties" | Niet wijzigen |
| Counter tile 1 label | "Actieve routes" | Gebaseerd op `activeRouteCount` |
| Counter tile 2 label | "Te bespreken" | Gebaseerd op `reviewCount` |
| Counter tile 3 label | "Geblokkeerd" | Gebaseerd op `blockedCount` |
| Counter tile 4 label | "Niet beschikbaar" (tijdelijk) | Totdat datagap is gevuld |
| Counter tile 5 label | "Afgerond" | Gebaseerd op `closedRouteCount` |
| Attentie-sidebar header | "Wat vraagt nu aandacht?" | Letterlijk uit Stitch overview; mag worden overgenomen |
| Komende reviews header | "Komende reviews" | Letterlijk uit Stitch overview; mag worden overgenomen |
| Owner fallback | "Niet toegewezen" | Wanneer `ownerName === null` |
| Review datum fallback | "—" | Wanneer `reviewDate === null` |
| Detail: code prefix | "Ref:" of niets | Afhankelijk van wat `item.code` bevat; geen nieuwe prefix toevoegen |
| Detail: sectieheader reden | "Waarom deze actie?" | Alleen tonen als `coreSemantics.reason` bestaat |
| Geblokkeerde attentie-prefix | "Geblokkeerd:" | Kort, geen uitleg toevoegen die niet uit data komt |
| Upcoming reviews lege staat | "Geen geplande reviews" | Lege staat, niet weglaten |
| Geblokkeerde lege staat | "Geen geblokkeerde routes" | Lege staat, niet weglaten |

**Verboden labels:**
- "Strategic Action Directives"
- "Operational Intelligence"
- "Completion Rate"
- "Average Lead Time"
- "Urgent Priority"
- "InsightFlow"
- "Analytical Authority"
- "View Insight Deep-dive"
- "PREPARE BRIEFING"
- "Linked Signal"
- Enige Engelse productterm die niet al in de bestaande codebase staat

---

## Verboden termen en patronen

**Verboden inhoud op deze pagina:**
- Analytics-dashboard (aggregaatgrafieken, trend-analyses)
- Surveyconsumptie (vragenlijst-resultaten, scores, percentages)
- Rapportduiding (inzichten, aanbevelingen, benchmarks)
- Brede workflow-suite (taken buiten bounded follow-through)
- Manager-performance of team-performance metrics
- Mockdata in productie
- Silent 0-fallbacks voor betekenisvolle data (gebruik "Niet beschikbaar" of render het element niet)
- Nieuwe productclaims (percentages, trends, "High Churn Risk", "Growth Gap")
- Paginarol-drift (de pagina mag niet lijken op een rapport, dashboard of onboarding-flow)
- Nieuwe statussen buiten de canon
- Nieuwe workflowstappen of knoppen zonder koppeling aan bestaande editor-flows

---

## Fallback- en datagapbeleid

| Situatie | Gedrag |
|---|---|
| `items` array is leeg | Render lege staat per sectie: "Geen acties gevonden" in de itemlijst; sidebar toont lege staat |
| Counter-veld is null of undefined | Render "—" in de tile, niet "0" |
| Tile 4 datagap niet gevuld | Render tile niet, of render met label "Niet beschikbaar" en geen getal |
| `item.reviewDate` is null | Toon "—" in reviewdatum-kolom; item verschijnt niet in "Komende reviews" sidebar |
| `item.ownerName` is null | Toon "Niet toegewezen" + lege cirkel |
| `item.priority` is null | Toon geen prioriteitsbadge |
| `coreSemantics.reason` ontbreekt of is null | Render de "Waarom deze actie?" sectie niet |
| `peopleCount` governance-check faalt | Render people count niet; geen fallback-getal |
| Detail-view: `actionReviews`/`reviewDecisions` leeg | Render tijdlijn met lege staat "Nog geen reviewhistorie" |
| Detail-view: `rationale`-veld bestaat niet | Sectie niet renderen |
| Detail-view: `contextualNotes`-veld bestaat niet | Sectie niet renderen |
| Codex vindt een datagap die niet in dit plan staat | Noteer in uitvoerrapport als "Nieuwe datagap", render sectie niet, stop niet met implementeren |

---

## Testplan

| Test | Type | Verwachte uitkomst |
|---|---|---|
| `npx tsc --noEmit` | TypeScript | Geen nieuwe typefouten |
| Unit tests op `action-center-live.ts` | Unit | PASS, geen regressie |
| Unit tests op `action-center-preview-model.ts` | Unit | PASS, geen regressie |
| `ActionCenterStatusCounters` met fixture summary | Component test | Rendert 5 tiles, tile 4 toont "Niet beschikbaar" indien datagap |
| `ActionCenterItemRow` met geblokkeerd item | Component test | Rendert `border-l-error` klasse |
| `ActionCenterItemRow` met prioriteit hoog | Component test | Rendert error-tint badge |
| Overview rendert zonder crash bij lege `items` | Route render | Geen crash, lege staat zichtbaar |
| Detail-panel niet zichtbaar bij page load | Render | `selectedItem === null` → geen detail-panel |
| Detail-panel zichtbaar na item-klik | Interaction | Na klik op item → detail-panel zichtbaar |
| E2E: `action-center-hr-happy-path.spec.ts` | E2E | PASS |
| E2E: `action-center-manager-access.spec.ts` | E2E | PASS |
| E2E: `action-center-route-closeout.spec.ts` | E2E | PASS |
| Geen mockdata in productie output | Grep/runtime | Geen fixture-namen of percentages zichtbaar |
| Geen verboden termen in rendered HTML | Grep | Geen "Strategic Action Directives", "Completion Rate", etc. |
| Bestaande routing `/action-center` werkt | Route check | 200 OK, geen crash |
| View-switching overview/actions/reviews/managers/teams | Interaction | Alle views wisselen correct |
| Responsive 1280px | Visual | Twee-kolom layout correct |
| Responsive 768px | Visual | Tabel scrollt of collapset correct |
| Responsive 375px | Visual | Bruikbaar, geen overflow |

---

## Acceptatiecriteria

- [ ] De gewenste IA (statuscounters, filterbar, 8+4 twee-kolom grid, attentie-sidebar) is visueel herkenbaar geïmplementeerd
- [ ] De Stitch list view is herkenbaar vertaald: itemrij-structuur, prioriteitsbadge, statusbadge, owner-cel, review-datum, geblokkeerde border-accent
- [ ] De Stitch detail view is herkenbaar vertaald: detail-header, quick-info grid, content-blok, timeline (indien data beschikbaar)
- [ ] Alle datagaps zijn expliciet gerapporteerd in het uitvoerrapport
- [ ] Geen sectie toont mockdata of fixture-waarden in productie
- [ ] Geen nieuwe productlogica, nieuwe statussen of nieuwe workflowstappen zijn geïntroduceerd
- [ ] Geen verboden termen of patronen verschijnen in de rendered pagina
- [ ] Detail-view opent pas na item-selectie
- [ ] Bestaande view-switching, editor-flows en API-routes zijn onaangetast
- [ ] TypeScript check passeert zonder nieuwe fouten
- [ ] Alle bestaande e2e tests passen
- [ ] Mobile (375px) is bruikbaar
- [ ] De PR bevat alleen de wijzigingen die in dit plan zijn beschreven — geen scope-creep

---

## Risico's en mitigaties

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Te grote PR door onbedoelde scope-creep | Middel | Hoog | Codex werkt per fase; commit na elke fase; review na Fase 4 en Fase 6 |
| Mockdata lekt naar productie | Laag | Hoog | Fixture-bestand staat in `tests/fixtures/`, nooit importeerd in productiecode; grep-check in Fase 8 |
| Visuele drift van design system (hardcoded hex) | Middel | Middel | Codex gebruikt uitsluitend Verisight kleurentokens uit DESIGN.md; reviewer checkt Tailwind classes |
| Paginarol-drift (pagina wordt rapport of dashboard) | Laag | Hoog | Verboden patronen zijn expliciet gedocumenteerd; reviewer checkt against "Verboden termen" sectie |
| Ontbrekende data (tile 4, coreSemantics.reason) | Hoog | Middel | Datagap-beleid: niet renderen indien ontbreekt; expliciet rapporteren in uitvoerrapport |
| Regressie op bestaande editor-flows | Middel | Hoog | E2E tests draaien na elke fase; Codex raakt geen API-routes of lib-bestanden aan |
| Detail-view opent standaard (UX-fout) | Laag | Middel | Expliciete acceptatiecriterium: detail-view pas zichtbaar na selectie |
| Access/role-fouten bij `peopleCount` zichtbaarheid | Middel | Middel | Governance-check in Fase 1; `peopleCount` niet tonen totdat check is bevestigd |
| Stitch-terminologie sluipt in labels | Middel | Middel | Copy- en labelregels zijn exhaustief gedocumenteerd; reviewer checkt rendered HTML |
| `ActionCenterPreview` component te groot voor focused edits | Hoog | Middel | Codex maakt gerichte extracties van sub-componenten; geen full-file rewrites |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Codex rapporteert na afronding:

### Gewijzigde bestanden
Lijst van alle gewijzigde bestanden met regelbereik.

### Nieuwe componenten
Lijst van alle nieuwe sub-componenten aangemaakt, met bestandspad.

### Hergebruikte componenten
Lijst van bestaande componenten die visueel zijn bijgewerkt zonder extractie.

### Datamapping-resultaat
Voor elk UI-element in het datacontract: welke databron is daadwerkelijk gebruikt, of is er een afwijking?

### Datagaps
Lijst van alle bevestigde en nieuwe datagaps, per item:
- Omschrijving
- Hoe is het weergegeven (niet renderen / "Niet beschikbaar" / andere keuze)
- Aanbeveling voor vervolgstap

### Tests gedraaid
Resultaat van TypeScript check, unit tests en e2e tests (PASS/FAIL + eventuele uitvoer).

### Screenshots of preview notes
Screenshots van de overview-view en detail-view in desktop- en mobile-viewport, of een link naar een preview-omgeving.

### Afwijkingen van plan
Lijst van stappen die afwijken van dit plan, met reden.

### Open restpunten
Alles wat Codex niet heeft kunnen afronden, met duidelijke volgende stap.
