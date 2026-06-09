# Routebeheer — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vervang de Open uitvoerflow op `/campaigns/[id]` door een nieuwe, losstaande operationele hub op `/campaigns/[id]/beheer` die livegang, respons, dashboard-leesbaarheid, blokkades en de eerstvolgende stap toont — zonder analytische inhoud.

**Architecture:** Nieuwe Next.js App Router server component op `app/(dashboard)/campaigns/[id]/beheer/page.tsx`. Data wordt opgehaald via dezelfde Supabase-queries als de bestaande campaign page, maar in een slanke helper binnen de nieuwe route-directory. De bestaande `/campaigns/[id]` pagina blijft inhoudelijk onaangeraakt; alleen één additionele navigatielink naar `/beheer` is toegestaan. Componentlager bestaat uit geïsoleerde presentatiecomponenten die de bestaande `dashboard-primitives`, `CampaignActions` en `PdfDownloadButton` hergebruiken.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase (server client + admin client), `lib/ops-delivery.ts`, `lib/customer-permissions.ts`, `lib/campaign-audit.ts`, `lib/types.ts`, Vitest, Playwright.

**Codex run scope:** één nieuwe route (`/campaigns/[id]/beheer`) plus één additionele link vanuit de bestaande campaign page. Geen refactor van gedeelde libs buiten wat strikt nodig is voor deze route.

---

## Korte samenvatting

Een nieuwe route `/campaigns/[id]/beheer` wordt toegevoegd als operationele routebeheer-hub. De pagina toont: routestatus (live/gesloten), responscijfers, dashboard-leesbaarheid, eerstvolgende stap, open blokkades, een lifecycle voortgangsbalk en vijf "Beheer onderdelen" kaarten. De bestaande analytische dashboard-route blijft volledig gescheiden en onaangeraakt. De uitvoerflow-sectie op de huidige campaign page krijgt een "Ga naar Routebeheer"-link als navigatiebrug.

---

## Doel

Een Verisight-operator of klant owner kan via `/campaigns/[id]/beheer` in één oogopslag zien:
- Of de route live is en sinds wanneer
- Hoeveel respons er is en hoeveel uitnodigingen openstaan
- Of het dashboard leesbaar is
- Wat de eerstvolgende operationele actie is
- Welke blokkades open staan
- Waar de route staat in de lifecycle (Setup → Afgerond)
- Snelle toegang tot doelgroep, uitnodigingen, instellingen, output en logboek

---

## Niet-doelen

- Geen frictiescore, factoren, SDT, rapportduiding, eigenaar, eerste actie, reviewmoment, manager assignment of Action Center-acties op deze pagina.
- Geen wijziging aan de bestaande `/campaigns/[id]` pagina (behalve een navigatielink naar `/beheer`).
- Geen nieuwe productclaims of inzichten die niet direct uit bestaande data komen.
- Geen mockdata in productie.
- Geen silent 0-fallbacks voor betekenisvolle data.
- Geen paginarol-drift naar analytisch dashboard.
- Geen self-service onboarding, betalingslogica of nieuwe modules.

---

## Bronnen en inputs

| Bron | Doel |
|------|------|
| `app/(dashboard)/campaigns/[id]/page.tsx` | Bestaande data-fetching patronen, variabelenamen, auth-checks |
| `lib/ops-delivery.ts` | `CampaignDeliveryRecord`, `CampaignDeliveryCheckpoint`, `DeliveryLifecycleStage`, `buildDeliveryGovernanceSnapshot`, `buildDeliveryDisciplineWarnings`, `buildDeliveryOpsSummary`, `getDeliveryLifecycleLabel`, lifecycle-labels |
| `lib/guided-self-serve.ts` | `GuidedSelfServeState`, `deriveGuidedSelfServeDiscipline` — hergebruik voor eerstvolgende stap |
| `lib/customer-permissions.ts` | `getCustomerActionPermission`, `MemberRole` |
| `lib/campaign-audit.ts` | `CampaignAuditEventRecord`, `campaign_action_audit_events` query |
| `lib/types.ts` | `CampaignStats`, `Campaign`, `ScanType`, `DeliveryMode`, `SCAN_TYPE_LABELS` |
| `lib/implementation-readiness.ts` | `getDeliveryModeLabel` |
| `components/dashboard/dashboard-primitives.tsx` | `DashboardChip`, `DashboardSection`, `DashboardPanel` — hergebruiken |
| `components/dashboard/campaign-actions.tsx` | Herinnering + archiveer acties |
| `components/dashboard/respondent-table.tsx` | Optioneel hergebruik voor doelgroep-sectie |
| `components/dashboard/preflight-checklist.tsx` | Optioneel hergebruik voor blokkades |
| `routebeheer_extracted/screen.png` | Visuele referentie (Stitch) — niet als productclaim |
| `routebeheer_extracted/code.html` | HTML-schets van layout en labels — alleen als structuurhint |
| `routebeheer_extracted/DESIGN.md` | Design tokens, typografie, kleurenpalet |

---

## Product- en canonregels

- **Fail loud, never fake** — geen silent fallbacks. Toon een "Niet beschikbaar" banner als data ontbreekt.
- **Multi-tenant** — alle Supabase-queries gaan via RLS of expliciete `organization_id` filter.
- **Modulair** — de beheer-route is volledig losstaand van de analytische dashboard-route.
- **Paginarol bewaken** — deze pagina is operationeel: livegang, respons, dashboard-leesbaarheid, blokkades, eerstvolgende stap. Geen analytische inhoud.
- **Data-first** — alles wat getoond wordt moet uit de bestaande Supabase-tabellen komen of expliciet als datagap worden gemarkeerd.
- **Geen nieuwe productclaims** — toon alleen wat al bestaat in de data.

---

## Gewenste informatiearchitectuur

```
/campaigns/[id]/beheer
├── Route Header
│   ├── Titel: "Routebeheer"
│   ├── Subtitel: "Beheer livegang, respons en output-readiness voor deze route."
│   ├── Metadata: [org.name] · [SCAN_TYPE_LABELS[scan_type]] [delivery_mode_label] · [periode]
│   ├── Status badge: LIVE | GESLOTEN
│   └── Laatste activiteit: meest recente audit event created_at (of deliveryRecord.updated_at)
│
├── Status cards (4x)
│   ├── Livegang — launch_date, is_active
│   ├── Respons — total_completed / total_invited, pending count
│   ├── Dashboard leesbaarheid — hasMinDisplay / hasEnoughData
│   └── Eerstvolgende stap — dynamisch uit governance snapshot / GuidedSelfServeState
│
├── Actie nodig panel (conditioneel)
│   ├── Toon alleen als er open blockers zijn
│   └── Primaire actieknop + secundaire link
│
├── Navigatieknoppen
│   ├── "Open dashboard" → /campaigns/[id]
│   └── "Open rapport" → /api/campaigns/[id]/report (of download button)
│
├── Lifecycle voortgangsbalk (6 stappen)
│   ├── Setup
│   ├── Doelgroep
│   ├── Uitnodigingen
│   ├── Respons
│   ├── Output
│   └── Afgerond
│
└── Beheer onderdelen (5 cards)
    ├── Doelgroep controleren → /campaigns/[id]#operatie
    ├── Uitnodigingen beheren → CampaignActions inline of link
    ├── Route-instellingen → read-only Campaign + DeliveryRecord metadata
    ├── Output openen → /campaigns/[id] + rapport download
    └── Logboek bekijken → audit events inline of /campaigns/[id]#operatie
```

---

## Visuele target uit Stitch

De Stitch visual (`screen.png`) toont:

1. **Route Header**: "Routebeheer" (headline-xl), subtitel in on-surface-variant, metadata-rij met org/scan/periode, LIVE-badge (secondary-container kleur, groen), "Laatste activiteit" rechts.

2. **4 Status cards**: Wit, border `#E2E8F0`, `rounded-xl`, `p-lg`. Label in `label-caps`, waarde in `headline-md`, subtekst in `text-sm on-surface-variant`, status-chip onderaan. Vierde kaart (Eerstvolgende stap) heeft `border-l-4 border-l-[#2DD4BF]` en een teal CTA-knop.

3. **Actie nodig panel**: Amber achtergrond (`bg-amber-50 border-amber-200`), warning-icoon, `headline-md` in `text-amber-900`, tekst in `text-amber-800`, primaire knop (`bg-amber-800 text-white`), secundaire link.

4. **Lifecycle balk**: 6 cirkels met lijn, voltooid = secondary (groen), actief = teal `#2DD4BF`, toekomstig = surface-container. Labels in `label-caps`.

5. **Beheer onderdelen**: Grid 2 kolommen, cards met icoon (surface-container-low achtergrond), titel in `font-bold text-primary`, subtekst, statuslabel, secondary-knop rechts. Logboek-card is `col-span-2`.

**Vertaalregel**: Implementeer de layout en kleurstrategie op basis van de Stitch visual. De DESIGN.md tokens zijn bindend. Code uit `code.html` is alleen structuurhint, geen implementatievoorschrift.

---

## Bestaande code die Codex eerst moet inspecteren

| Bestand | Wat inspecteren |
|---------|----------------|
| `app/(dashboard)/campaigns/[id]/page.tsx` | Volledige data-fetching sectie (regels 530–700+), auth-checks, variabelenamen `invitesNotSent`, `pendingCount`, `importReady`, `incompleteScores`, `activeClientAccessCount`, `pendingClientInviteCount`, `deliveryRecord`, `deliveryCheckpoints`, `auditEvents` |
| `lib/ops-delivery.ts` | `DeliveryLifecycleStage`, `buildDeliveryOpsSummary`, `buildDeliveryGovernanceSnapshot`, `DELIVERY_LIFECYCLE_OPTIONS` |
| `lib/guided-self-serve.ts` | `GuidedSelfServeState`, `deriveGuidedSelfServeDiscipline`, exports |
| `lib/implementation-readiness.ts` | `getDeliveryModeLabel`, `buildCampaignReadinessState` |
| `lib/campaign-audit.ts` | `CampaignAuditEventRecord`, query-patroon voor `campaign_action_audit_events` |
| `lib/types.ts` | `CampaignStats`, `Campaign`, `SCAN_TYPE_LABELS`, `DeliveryMode` |
| `lib/customer-permissions.ts` | `getCustomerActionPermission`, permissie-guards |
| `components/dashboard/dashboard-primitives.tsx` | Beschikbare exports: `DashboardChip`, `DashboardSection`, `DashboardPanel`, `DashboardSummaryBar` |
| `components/dashboard/campaign-actions.tsx` | Props interface, wat het rendert, wanneer het null returnt |
| `components/dashboard/preflight-checklist.tsx` | Props interface — beoordeel of hergebruik mogelijk is voor blokkades |
| `app/(dashboard)/layout.tsx` | Dashboard shell en navigatiepatroon |
| `app/(dashboard)/campaigns/[id]/page.tsx` regelomgeving r.3577–3700 | Bestaande "operatie/uitvoering" sectie — begrijp wat wordt verplaatst vs. wat blijft |

---

## Pre-implementation audit en datacontract

| UI-element | Benodigde data | Bestaande bron/helper/component | Schaal/betekenis | Fallbackgedrag als ontbreekt | Mag in productie tonen | Open vraag / datagap |
|------------|----------------|--------------------------------|-----------------|------------------------------|----------------------|----------------------|
| Paginatitel "Routebeheer" | — | Statische string | — | — | Ja | — |
| Org-naam | `organization.name` | `supabase.from('organizations').select('name')` | Tenantnaam | "Niet beschikbaar" | Ja | — |
| Scan type label | `stats.scan_type` → `SCAN_TYPE_LABELS` | `lib/types.ts` | b.v. "ExitScan" | "Onbekend scantype" | Ja | — |
| Delivery mode label | `campaignMeta.delivery_mode` → `getDeliveryModeLabel` | `lib/implementation-readiness.ts` | "Baseline" of "Live" | weglaten | Ja | Controleer of `getDeliveryModeLabel` bestaat en wat de exacte exports zijn |
| Periode (b.v. Q1 2026) | `stats.campaign_name` + `stats.created_at` | `formatRoutePeriodLabel` (privé in page.tsx, r.243–251) | Kwartaal of maand/jaar | `created_at` geformatteerd | Ja | **Vaste implementatieregel**: dupliceer deze formatter lokaal in `beheer-data.ts`. Geen extractie naar gedeelde lib in deze run. |
| LIVE / GESLOTEN badge | `stats.is_active` | `CampaignStats.is_active` | Boolean | — | Ja | — |
| Laatste activiteit timestamp | Nieuwste van audit event `created_at` en `deliveryRecord.updated_at` | `campaign_action_audit_events` query + `CampaignDeliveryRecord.updated_at` | Tijdstip laatste mutatie | "Onbekend" als beide null | Ja | **Vaste implementatieregel**: neem de meest recente beschikbare timestamp. Auditlog is dus niet exclusief leidend. |
| Livegang — datum | `deliveryRecord.launch_date` of `deliveryRecord.launch_confirmed_at` | `CampaignDeliveryRecord` | ISO datumstring | "Nog niet gestart" | Ja | Controleer welk veld de operationele startdatum is |
| Livegang — badge tekst | `stats.is_active` + `launch_date` | Combinatie | "Live" / "Nog niet live" / "Gesloten" | Toon "Onbekend" | Ja | — |
| Respons — absolute aantallen | `stats.total_completed`, `stats.total_invited` | `CampaignStats` | Aantal ingevulde / totale uitnodigingen | "Niet beschikbaar" | Ja | — |
| Respons — openstaand | `pendingCount = total_invited - total_completed` | Berekening, zie page.tsx r.813 | Aantal nog te ontvangen | 0 weergeven, maar annoteer als "geen openstaande data" als total_invited = 0 | Ja | — |
| Respons — percentage | `stats.completion_rate_pct` | `CampaignStats` | 0–100% | "Niet beschikbaar" | Ja | — |
| Dashboard leesbaarheid | `hasMinDisplay` (≥5 responses), `hasEnoughData` (≥10 responses) | `FIRST_DASHBOARD_THRESHOLD` en `FIRST_INSIGHT_THRESHOLD` uit `lib/response-activation.ts` | Leesbaar / Indicatief / Nog niet leesbaar | "Nog onvoldoende data" | Ja | Geen extra drempels toevoegen buiten deze bestaande constants. |
| Eerstvolgende stap | `GuidedSelfServeState.nextAction.title` + `nextAction.body` | `buildGuidedSelfServeState` in `lib/guided-self-serve.ts` | Eerste operationele actie | "Niet beschikbaar" | Ja | **Vaste implementatieregel**: routebeheer gebruikt altijd de guided self-serve next action als primaire bron. `buildDeliveryOpsSummary` is hier niet leidend. |
| Actie nodig panel | `buildDeliveryGovernanceSnapshot` | `lib/ops-delivery.ts` | Lijst van open operationele blockers | Panel niet renderen als lijst leeg is | Ja | **Vaste implementatieregel**: toon alleen blockers uit `global`, `intake`, `import`, `invite`, `launchControl`, `activation`, `firstValue` en `reportDelivery`. Laat `managementUse`, `followUp` en `learningCloseout` weg in deze pagina. |
| Lifecycle voortgangsbalk | `deliveryRecord.lifecycle_stage` → vaste 6-staps mapping | `lib/ops-delivery.ts` | 9 stages → 6 visuele stappen (samenvoegen) | Toon "Setup" als ontbreekt | Ja | Mapping staat vast in dit plan; geen alternatieve grouping bedenken tijdens implementatie. |
| Doelgroep controleren — aantal | `respondents.length` of `stats.total_invited` | `CampaignStats` of respondenten-query | Aantal geïmporteerde deelnemers | "0 deelnemers" | Ja | — |
| Doelgroep controleren — link | `/campaigns/[id]#operatie` of `#respondenten` | Bestaande anchor in page.tsx | Navigatie naar respondentensectie | — | Ja | Verifieer anchor-id in page.tsx |
| Uitnodigingen beheren — status | `invitesNotSent`, `pendingCount` | Bestaande berekeningen in page.tsx | Operationele invitestatus | "Niet beschikbaar" | Ja | — |
| Uitnodigingen beheren — actie | `CampaignActions` component | `components/dashboard/campaign-actions.tsx` | Herinnering / archiveer | Niet renderen als !isActive | Ja | — |
| Route-instellingen — scan + mode | `stats.scan_type`, `campaignMeta.delivery_mode` | `CampaignStats`, `Campaign` | Read-only weergave | "Onbekend" | Ja | Geen aparte instellingenpagina; read-only weergave inline |
| Route-instellingen — startdatum | `deliveryRecord.launch_date` of `stats.created_at` | `CampaignDeliveryRecord`, `CampaignStats` | Datum campagnestart | `created_at` als fallback | Ja | — |
| Output openen — dashboard link | `/campaigns/[id]` | Next.js Link | Analytisch dashboard | — | Ja | — |
| Output openen — rapport | `PdfDownloadButton` | `app/(dashboard)/campaigns/[id]/pdf-download-button.tsx` | Rapport downloaden | niet renderen als `!hasMinDisplay` | Ja | **Vaste implementatieregel**: hergebruik `PdfDownloadButton` met props `campaignId`, `campaignName`, `scanType`. Geen tweede downloadhelper bouwen. |
| Logboek bekijken — laatste activiteit | Meest recente `auditEvents[0].created_at` | `campaign_action_audit_events` query | Tijdstip laatste logboekregel | "Geen activiteit" | Ja | Controleer of de query in beheer-page opnieuw nodig is of hergebruikt kan worden |
| Logboek bekijken — link | `/campaigns/[id]#operatie` | Bestaande anchor | Navigatie naar logboeksectie | — | Ja | — |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

- [ ] **1.1** Lees `app/(dashboard)/campaigns/[id]/page.tsx` volledig en noteer exact:
  - Alle Supabase-queries en hun variabelenamen
  - Berekeningsvolgorde van `pendingCount`, `invitesNotSent`, `importReady`, `incompleteScores`, `hasMinDisplay`, `hasEnoughData`
  - Auth-checks en permission-guards
  - Import van `formatRoutePeriodLabel` (is privé in page.tsx, niet geëxporteerd)
  - Import van `FIRST_DASHBOARD_THRESHOLD`, `FIRST_INSIGHT_THRESHOLD` uit `lib/response-activation.ts`
- [ ] **1.2** Lees `lib/ops-delivery.ts` volledig. Noteer exact de exports die nodig zijn voor routebeheer.
- [ ] **1.3** Lees `lib/guided-self-serve.ts` volledig. Noteer welke functie de "eerstvolgende stap" berekent.
- [ ] **1.4** Lees `lib/implementation-readiness.ts`. Verifieer of `getDeliveryModeLabel` bestaat en wat het retourneert.
- [ ] **1.5** Lees `lib/campaign-audit.ts`. Noteer de query-structuur voor `campaign_action_audit_events`.
- [ ] **1.6** Lees `components/dashboard/dashboard-primitives.tsx`. Noteer alle exports en hun props.
- [ ] **1.7** Lees `components/dashboard/campaign-actions.tsx`. Noteer de props interface en wanneer het null returnt.
- [ ] **1.8** Lees `app/(dashboard)/campaigns/[id]/pdf-download-button.tsx`. Noteer props en bevestig het hergebruik met `campaignId`, `campaignName`, `scanType`.
- [ ] **1.9** Controleer op anchor-ids in page.tsx voor `#operatie`, `#respondenten` etc.

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

- [ ] **2.1** Bekijk `screen.png` zorgvuldig. Noteer per sectie:
  - Klassen en kleuren die afwijken van bestaand design system
  - Exacte labels in Nederlands
  - Welke secties conditioneel zijn (b.v. "Actie nodig" alleen bij blockers)
  - Hoe de lifecycle balk 6 visuele stappen toont terwijl de data 9 stages heeft
- [ ] **2.2** Lees `code.html`. Noteer de grid-structuur, card-structuur en CTA-logica.
- [ ] **2.3** Stel vast welke bestaande componenten direct hergebruikt kunnen worden:
  - `DashboardChip` voor status-badges
  - `DashboardSection` voor secties
  - `CampaignActions` voor uitnodigingen-kaart

### Fase 3 — Leg de vaste routebeheer-regels vast

- [ ] **3.1** Neem `formatRoutePeriodLabel` lokaal over in `beheer-data.ts`. Geen extractie naar een gedeelde lib in deze run.
- [ ] **3.2** Bereken `laatsteActiviteitAt` als de nieuwste waarde van `auditEvents[0]?.created_at` en `deliveryRecord?.updated_at`.
- [ ] **3.3** Gebruik voor de statuskaart "Eerstvolgende stap" uitsluitend `buildGuidedSelfServeState(...).nextAction`.
- [ ] **3.4** Gebruik voor het blockerpanel uitsluitend `buildDeliveryGovernanceSnapshot(...)` en filter daaruit alle blockers voor `managementUse`, `followUp` en `learningCloseout`.
- [ ] **3.5** Leg het datacontract vast als TypeScript-interface `RouteBeeheerPageData` in `app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts`.

### Fase 4 — Bouw de route direct op echte data

- [ ] **4.1** Maak `app/(dashboard)/campaigns/[id]/beheer/page.tsx` aan als server component met `notFound()` placeholder en correcte mapstructuur.
- [ ] **4.2** Implementeer `fetchRouteBeeheerData(id, supabase)` in `beheer-data.ts` voordat de UI-secties worden opgebouwd.
- [ ] **4.3** Bouw `RouteBeeheerHeader` component: paginatitel, subtitel, metadata-rij, status-badge, laatste activiteit.
- [ ] **4.4** Bouw `RouteBeeheerStatusCards` component direct op echte page-data.
- [ ] **4.5** Bouw `RouteBeeheerBlockerPanel` component: amber panel, conditioneel.
- [ ] **4.6** Bouw `RouteBeeheerLifecycleBar` component: 6-staps balk.
- [ ] **4.7** Bouw `RouteBeeheerSectionCards` component: 5 beheer-kaarten.
- [ ] **4.8** Integreer alle componenten in page.tsx met echte data en lege-staatdata. Verifieer visueel.

### Fase 5 — Rond koppelingen en integratie af

- [ ] **5.1** Hergebruik query-patronen uit `campaigns/[id]/page.tsx`. Geen duplicatie van queries buiten wat lokaal nodig is voor `fetchRouteBeeheerData`.
- [ ] **5.2** Koppel `RouteBeeheerHeader` aan echte data: org.name, scan_type, delivery_mode, periode, is_active, laatste activiteit.
- [ ] **5.3** Koppel `RouteBeeheerStatusCards` aan echte data: launch_date, respons-cijfers, hasMinDisplay/hasEnoughData, nextAction.
- [ ] **5.4** Koppel `RouteBeeheerBlockerPanel` aan `buildDeliveryGovernanceSnapshot` en filter daaruit alleen de operationele blockerclusters die in dit plan zijn toegestaan.
- [ ] **5.5** Koppel `RouteBeeheerLifecycleBar` aan `deliveryRecord.lifecycle_stage`.
- [ ] **5.6** Koppel `RouteBeeheerSectionCards` aan echte data per kaart. Hergebruik `CampaignActions` voor uitnodigingen-kaart.
- [ ] **5.7** Controleer dat geen fixture- of sampledata in de productiecode is achtergebleven.

### Fase 6 — Integreer in bestaande route

- [ ] **6.1** Voeg een navigatielink toe in de uitvoering-sectie van `campaigns/[id]/page.tsx`:
  - Zoek de sectie met id `"uitvoering"` of `"operatie"` (r.~3579)
  - Voeg toe: `<Link href={`/campaigns/${id}/beheer`}>Routebeheer openen</Link>` naast of boven bestaande content
  - **Verwijder niets** uit de bestaande sectie — de link is additioneel
- [ ] **6.2** Voeg `loading.tsx` toe in `app/(dashboard)/campaigns/[id]/beheer/` met een skeletonweergave.
- [ ] **6.3** Verifieer dat de bestaande `/campaigns/[id]` route nog werkt en de uitvoerflow onaangeraakt is.

### Fase 7 — Responsiveness en visual polish

- [ ] **7.1** Controleer mobile (375px): status cards stacked, beheer-kaarten single column, lifecycle balk scrollable of compact.
- [ ] **7.2** Controleer tablet (768px): 2-koloms cards.
- [ ] **7.3** Controleer desktop (1280px): 4-koloms status cards, 2-koloms beheer-kaarten.
- [ ] **7.4** Verifieer DESIGN.md tokens: `rounded-xl` → `rounded-lg` (0.25rem = de `lg` uit DESIGN.md), spacing `p-lg` = 2.5rem.
- [ ] **7.5** Controleer dat geen verboden termen in de UI staan (zie Verboden termen).

### Fase 8 — Tests en regressiechecks

Zie Testplan voor details.

- [ ] **8.1** TypeScript check: `tsc --noEmit` — geen type errors.
- [ ] **8.2** Unit tests voor `fetchRouteBeeheerData` en lifecycle mapping.
- [ ] **8.3** Component test: route rendert zonder crash met representatieve testdata in testbestanden.
- [ ] **8.4** Regressietest: `/campaigns/[id]` pagina rendert nog en alle bestaande anchors werken.
- [ ] **8.5** Responsive check via Playwright.
- [ ] **8.6** Verboden termen scan.

---

## Componentstrategie

### Nieuwe componenten (in `app/(dashboard)/campaigns/[id]/beheer/`)

| Component | Bestand | Verantwoordelijkheid |
|-----------|---------|---------------------|
| `RouteBeeheerHeader` | `route-beheer-header.tsx` | Paginatitel, subtitel, metadata, status-badge, laatste activiteit |
| `RouteBeeheerStatusCards` | `route-beheer-status-cards.tsx` | 4 status kaarten: livegang, respons, leesbaarheid, eerstvolgende stap |
| `RouteBeeheerBlockerPanel` | `route-beheer-blocker-panel.tsx` | Conditioneel amber panel met blockers en primaire CTA |
| `RouteBeeheerLifecycleBar` | `route-beheer-lifecycle-bar.tsx` | 6-staps lifecycle voortgangsbalk |
| `RouteBeeheerSectionCards` | `route-beheer-section-cards.tsx` | 5 beheer onderdelen kaarten |
| Data helper | `beheer-data.ts` | `fetchRouteBeeheerData`, `RouteBeeheerPageData` interface, lifecycle mapping |

### Hergebruik verplicht (controleer eerst)

- **`DashboardChip`** — voor status-badges (LIVE, Loopt, Beschikbaar, etc.)
- **`DashboardSection`** — voor de "Beheer onderdelen" wrapper indien van toepassing
- **`CampaignActions`** — voor de uitnodigingen-kaart (herinnering + archiveer)
- **`PdfDownloadButton`** — voor de rapport-knop in Output-kaart met props `campaignId`, `campaignName`, `scanType`

### Lifecycle mapping (6 visuele stappen uit 9 data stages)

```
Setup           = 'setup_in_progress'
Doelgroep       = 'import_cleared'
Uitnodigingen   = 'invites_live' | 'client_activation_pending'
Respons         = 'client_activation_confirmed' | 'first_value_reached'
Output          = 'first_management_use' | 'follow_up_decided'
Afgerond        = 'learning_closed'
```

Status per stap:
- `done` = lifecycle index ≥ stap-index
- `current` = lifecycle index === stap-index
- `pending` = lifecycle index < stap-index
- Als `deliveryRecord === null`: alle stappen `pending`, eerste stap `current`

---

## Copy- en labelregels

Alle zichtbare labels op de pagina in Nederlands, gebonden aan hun databron:

| Label | Waarde | Bron |
|-------|--------|------|
| Paginatitel | "Routebeheer" | Statisch |
| Subtitel | "Beheer livegang, respons en output-readiness voor deze route." | Statisch |
| Badge: actief | "Live" | `stats.is_active === true && invitesNotSent === 0` |
| Badge: uitnodigingen nog niet verstuurd | "Uitnodigingen nog niet gestart" | `invitesNotSent > 0` |
| Badge: gesloten | "Gesloten" | `stats.is_active === false` |
| Status card label 1 | "Livegang" | Statisch |
| Status card label 2 | "Respons" | Statisch |
| Status card label 3 | "Dashboard leesbaarheid" | Statisch |
| Status card label 4 | "Eerstvolgende stap" | Statisch |
| Leesbaarheid: voldoende | "Leesbaar" | `hasEnoughData === true` |
| Leesbaarheid: indicatief | "Indicatief beeld" | `hasMinDisplay && !hasEnoughData` |
| Leesbaarheid: onvoldoende | "Nog niet leesbaar" | `!hasMinDisplay` |
| Chip: respons loopt | "Loopt" | `stats.is_active && total_completed > 0` |
| Chip: gesloten | "Gesloten" | `!stats.is_active` |
| Knop: open dashboard | "Open dashboard" | Statisch, link → `/campaigns/[id]` |
| Knop: open rapport | "Open rapport" | Statisch, via `PdfDownloadButton` of `/api/campaigns/[id]/report` |
| Kaart 1 titel | "Doelgroep controleren" | Statisch |
| Kaart 1 subtekst | "Bekijk importstatus en geïmporteerde deelnemers." | Statisch |
| Kaart 1 statuslabel | `{total_invited} deelnemers geïmporteerd` | `stats.total_invited` |
| Kaart 1 CTA | "Open doelgroep" | Statisch, link → `/campaigns/[id]#operatie` |
| Kaart 2 titel | "Uitnodigingen beheren" | Statisch |
| Kaart 2 subtekst | "Stuur uitnodigingen of herinnering naar deelnemers." | Statisch |
| Kaart 2 statuslabel | `{total_completed} ingevuld · {pendingCount} openstaand` | Berekening |
| Kaart 2 CTA | Ingebouwd via `CampaignActions` | Hergebruik component |
| Kaart 3 titel | "Route-instellingen" | Statisch |
| Kaart 3 subtekst | "Bekijk startdatum, scantype en uitvoermodus." | Statisch |
| Kaart 3 statuslabel | `{SCAN_TYPE_LABELS[scan_type]} {delivery_mode_label} · {periode}` | Berekening |
| Kaart 3 CTA | "Bekijk instellingen" | Statisch (scroll naar top of modal — **geen nieuwe pagina**) |
| Kaart 4 titel | "Output openen" | Statisch |
| Kaart 4 subtekst | "Ga naar dashboard of download het rapport." | Statisch |
| Kaart 4 statuslabel | `Dashboard leesbaar · Rapport beschikbaar` of `Nog niet beschikbaar` | `hasMinDisplay` |
| Kaart 4 CTA 1 | "Open dashboard" | Link → `/campaigns/[id]` |
| Kaart 4 CTA 2 | "Open rapport" | Via `PdfDownloadButton` of download-link |
| Kaart 5 titel | "Logboek bekijken" | Statisch |
| Kaart 5 subtekst | "Bekijk imports, uitnodigingen en lifecycle-mutaties." | Statisch |
| Kaart 5 statuslabel | `Laatste update {formattedTimestamp}` | `auditEvents[0]?.created_at` |
| Kaart 5 CTA | "Bekijk logboek" | Link → `/campaigns/[id]#operatie` |
| Lifecycle stap 1 | "Setup" | Statisch |
| Lifecycle stap 2 | "Doelgroep" | Statisch |
| Lifecycle stap 3 | "Uitnodigingen" | Statisch |
| Lifecycle stap 4 | "Respons" | Statisch |
| Lifecycle stap 5 | "Output" | Statisch |
| Lifecycle stap 6 | "Afgerond" | Statisch |
| Lifecycle sublabel: voltooid | "Voltooid" | Statisch |
| Lifecycle sublabel: actief | Stap-specifiek (b.v. "Loopt", "Live", "Leesbaar") | Zie lifecycle mapping |
| Lifecycle sublabel: toekomstig | "Nog niet" | Statisch |
| Actie nodig panel titel | "Actie nodig" | Statisch |
| Fallback: data ontbreekt | "Niet beschikbaar" | Statisch |
| Fallback: onvoldoende data | "Nog onvoldoende data" | Statisch |
| Navigatielink in campaign page | "Routebeheer openen" | Statisch, link → `/campaigns/[id]/beheer` |
| Laatste activiteit | `"Laatste activiteit: vandaag om {HH:mm}"` of `"Laatste activiteit: {dd MMM}"` | `auditEvents[0]?.created_at ?? deliveryRecord?.updated_at` |

---

## Verboden termen en patronen

Op deze pagina zijn de volgende termen en patronen **expliciet verboden**:

### Verboden content
- Frictiescore, factoren (organisatiefactoren), SDT (zelfbeschikkingstheorie / autonomie/competentie/verbondenheid), rapportduiding
- Eerste eigenaar, reviewmoment, eerste actie, manager assignment
- Action Center-acties, Action Playbooks, route-acties
- Werkbelasting, retentiesignaal, vertrekintentie, bevlogenheid, risicoband
- "Sterkste factor", "Drivers", "Signals", "Eerste managementread"

### Verboden technische patronen
- **Geen mockdata in productie** — fixture of sampledata mag alleen in test-bestanden bestaan
- **Geen silent 0-fallbacks** voor betekenisvolle data (b.v. `total_invited` mag niet als 0 worden getoond als de query mislukt — toon "Niet beschikbaar")
- **Geen nieuwe productclaims** die niet uit bestaande data komen
- **Geen paginarol-drift** — dit is een operationele hub, niet een analytisch dashboard
- **Geen imports van analytische helpers** zoals `buildExitNarratives`, `computeFactorAverages`, `buildRetentionSignalSegments`, `SdtGauge`, etc.
- **Geen hardcoded tenant-data** buiten test-context

---

## Fallback- en datagapbeleid

### Wanneer een sectie niet rendert
- `RouteBeeheerBlockerPanel`: rendert niet als `disciplineWarnings.length === 0`
- Lifecycle sublabel "Afgerond": rendert alleen als `lifecycle_stage === 'learning_closed'`
- Rapport-knop in Output-kaart: rendert niet als `!hasMinDisplay`
- `CampaignActions` in Uitnodigingen-kaart: rendert niet als `!stats.is_active`

### Wanneer "Niet beschikbaar" verschijnt
- `deliveryRecord === null` en het UI-element veronderstelt een leveringsrecord (b.v. launch_date)
- `organization === null` (Supabase-fout of tenant niet gevonden)
- `auditEvents` query mislukt
- `PdfDownloadButton` props incomplete of rapport-endpoint niet bereikbaar

### Wanneer "Nog onvoldoende data" verschijnt
- Dashboard leesbaarheid kaart: `!hasMinDisplay` (< 5 responses)
- Output-kaart statuslabel: `!hasMinDisplay`

### Wanneer Codex een datagap in het uitvoerrapport moet zetten
Als na inspectie blijkt dat:
- `getDeliveryModeLabel` niet bestaat in `lib/implementation-readiness.ts`
- De auditlog-query niet beschikbaar is én `deliveryRecord.updated_at` ook ontbreekt
- `PdfDownloadButton` importeerbaar is maar de route `/api/campaigns/[id]/report` in deze omgeving faalt

Dan noteert Codex dit expliciet in het uitvoerrapport als open datagap en implementeert een "Niet beschikbaar"-fallback.

---

## Testplan

### TypeScript
- [ ] `npx tsc --noEmit` geeft 0 errors na implementatie
- [ ] Alle nieuwe componenten hebben expliciete prop types (geen `any`)

### Unit / component tests (Vitest)

Locatie: `app/(dashboard)/campaigns/[id]/beheer/` — testbestanden als `*.test.ts`

- [ ] **`beheer-data.test.ts`**: Test `fetchRouteBeeheerData` met gemockte Supabase-client — verifieer dat alle velden correct worden gemapped
- [ ] **`lifecycle-mapping.test.ts`**: Test voor elke `DeliveryLifecycleStage` waarde wat de visuele stap-status is (done/current/pending)
- [ ] **`route-beheer-header.test.ts`**: Rendert correct met volledige data; toont "Niet beschikbaar" als org.name null is
- [ ] **`route-beheer-status-cards.test.ts`**: Toont "Leesbaar" bij `hasEnoughData`; toont "Indicatief beeld" bij `hasMinDisplay && !hasEnoughData`; toont "Nog niet leesbaar" bij `!hasMinDisplay`
- [ ] **`route-beheer-blocker-panel.test.ts`**: Rendert niet als `disciplineWarnings` leeg; rendert met correcte tekst als er blockers zijn

### Route render test
- [ ] `GET /campaigns/[id]/beheer` rendert zonder crash met een bestaand campaignId uit de testsetup
- [ ] `GET /campaigns/[id]/beheer` met niet-bestaand id geeft `notFound()`
- [ ] `GET /campaigns/[id]/beheer` zonder auth redirecteert naar login

### Regressietests bestaande routes
- [ ] `GET /campaigns/[id]` rendert nog volledig zonder crash
- [ ] Anchors `#uitvoering`, `#operatie`, `#methodiek` zijn nog aanwezig in DOM
- [ ] `CampaignActions`-component op de bestaande campaign page werkt nog
- [ ] Link "Routebeheer openen" in uitvoerflow navigeert naar `/campaigns/[id]/beheer`

### Verboden patronen controle
- [ ] Grep op verboden termen in alle nieuwe bestanden: `frictiescore|factoren|SDT|rapportduiding|reviewmoment|Action Center|action-center` — geeft 0 hits
- [ ] Geen import van `ExitDriversPriorityChart`, `ExitOrgFactorsChart`, `ExitSdtNeedsChart`, `SdtGauge`, `computeFactorAverages`, `buildExitNarratives`, `buildRetentionNarratives`
- [ ] Geen fixture/mockdata in productie-render-pad: grep op `FIXTURE|fixture|mockdata|mock_` in de nieuwe routebestanden — geeft 0 hits

### Responsive checks
- [ ] 375px: status cards gestacked (1 kolom), beheer-kaarten gestacked, lifecycle balk past in viewport
- [ ] 768px: beheer-kaarten 2 kolommen
- [ ] 1280px: status cards 4 kolommen, beheer-kaarten 2 kolommen

### Mockdata in productie
- [ ] Grep op `FIXTURE|fixture|mockdata|mock_` in productiecode (buiten test-bestanden) — geeft 0 hits

---

## Acceptatiecriteria

1. **Informatiearchitectuur gevolgd**: Route Header, Status cards (4x), Actie nodig panel (conditioneel), Navigatieknoppen, Lifecycle balk, Beheer onderdelen (5x) zijn aanwezig in de juiste volgorde.
2. **Stitch target visueel herkenbaar vertaald**: De kleurstrategie (LIVE-badge groen, teal CTA, amber blocker, lifecycle-stap teal/groen/grijs), card-layout en typografie zijn herkenbaar uit de Stitch visual. DESIGN.md tokens zijn gebruikt.
3. **Bestaande dataflow blijft leidend**: Geen nieuwe productlogica of berekeningen die niet terug te leiden zijn tot bestaande lib-functies.
4. **Datagaps expliciet**: Elke gevonden datagap is gedocumenteerd in het uitvoerrapport met fallbackgedrag.
5. **Geen productlogica gebroken**: Bestaande `/campaigns/[id]` route, Action Center, en uitvoerflow werken nog volledig.
6. **Geen verboden content**: Geen frictiescore, factoren, SDT, rapportduiding, eigenaar, eerste actie, reviewmoment, manager assignment, Action Center-acties op de pagina.
7. **Mobile bruikbaar**: Pagina is functioneel op 375px zonder horizontale scroll.
8. **Kleine, reviewbare PR**: Maximaal 8 bestanden gewijzigd of aangemaakt. Geen refactoring buiten scope.

---

## Risico's en mitigaties

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Te grote PR | Code moeilijk reviewbaar | Strict scope: alleen beheer-route + 1 link in campaign page. Geen refactoring elders. |
| Mockdata wordt productie | Verkeerde data voor eindgebruiker | Fixture of sampledata alleen in test-bestanden. Grep-check in testplan. |
| Visuele drift van design system | Inconsistentie met rest dashboard | Verplicht hergebruik van `DashboardChip`, `DashboardSection`. Geen eigen klassen voor bestaande patronen. |
| Paginarol-drift | Analytische content op operationele pagina | Verboden-termen-grep in testplan. Code review focust op imports. |
| Ontbrekende data (`deliveryRecord === null`) | Pagina crasht of toont lege UI | Expliciete null-checks per sectie. Fallback naar "Niet beschikbaar". |
| Regressie op bestaande flows | Uitvoerflow of Action Center breekt | `campaigns/[id]` wordt alleen aangeraakt met één link toevoeging. Regressietest verplicht. |
| Lokale periodeformatter wijkt af van campaign page | Inconsistente periodeweergave | Kopieer de bestaande formatter 1:1 uit `page.tsx` naar `beheer-data.ts`; geen creatieve variant schrijven. |
| Lifecycle mapping incorrect | Verkeerde stap-status in balk | Gebruik exact de 9 bestaande `DeliveryLifecycleStage` values uit `lib/ops-delivery.ts` en test alle 9 tegen de vaste 6-staps mapping. |
| Access/rol fouten | Klant ziet admin-data of vice versa | Hergebruik exact dezelfde auth-guards als in `campaigns/[id]/page.tsx`. RLS blijft leidend. |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Na voltooiing van alle fases levert Codex een rapport met:

### 1. Gewijzigde bestanden
Lijst van alle gewijzigde bestanden met een zin over wat er is veranderd.

### 2. Nieuwe componenten
Naam, bestandspad en één zin verantwoordelijkheid per component.

### 3. Hergebruikte componenten
Naam en hoe het hergebruikt is (welke props, welke context).

### 4. Datamapping-resultaat
Per UI-element: welke databron is gebruikt, hoe berekend, of de mapping overeenkomt met het datacontract.

### 5. Datagaps
Per gevonden datagap: wat ontbrak, welke keuze is gemaakt, welke fallback is geïmplementeerd.

### 6. Tests gedraaid
Output van `tsc --noEmit`, Vitest en regressietests. Exacte testresultaten.

### 7. Screenshots of preview notes
Screenshot van de beheer-pagina op desktop en mobile, of beschrijving van wat zichtbaar is.

### 8. Afwijkingen van plan
Beschrijf elke bewuste afwijking van dit plan met reden.

### 9. Open restpunten
Wat is nog niet opgelost of vereist een vervolgstap buiten dit plan.
