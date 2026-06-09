# Dashboard Admin Setup — Herontwerp van `/beheer`

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## Korte samenvatting

De bestaande `app/(dashboard)/beheer/page.tsx` wordt herontworpen van een 4-staps wizardlayout naar een gestructureerd admin-setup-dashboard met vijf duidelijk gescheiden secties: header, statussamenvatting, open blokkades, setupkern-grid en secundaire adminmodules. De bestaande dataflow, componenten en functionaliteit blijven intact; alleen de presentatielaag wordt herzien aan de hand van de Stitch-visual als visuele referentie. Een aparte footer-actiebalk valt buiten deze eerste Codex-run.

---

## Doel

Een interne admin-configuratiepagina bouwen die:
- In één oogopslag de setup-readiness van organisaties, toegang, campagnes en data-import toont;
- Blokkades proactief zichtbaar maakt (met impact-label en directe actielink);
- Bestaande beheerfuncties (org aanmaken, campagne aanmaken, respondenten importeren, klanttoegang activeren) behoudt in een compacte 2×2-setupkern-grid;
- Secundaire adminmodules als snelkoppelingen aanbiedt;
- Scherp gescheiden blijft van het analytische klantdashboard (`/dashboard`) en het Action Center (`/action-center`).

---

## Niet-doelen

- Geen operationele routehub voor klanten.
- Geen analytische output (risicoscores, factoranalyses, trendvisualisaties).
- Geen Action Center-logica of -componenten.
- Geen managementduiding of HR-inzichten voor klanten.
- Geen self-service onboarding flow.
- Geen nieuwe productclaims of mockdata als productwaarheid.
- Geen pagina-redesign van de sub-routes (`/beheer/billing`, `/beheer/health`, enz.).

---

## Bronnen en inputs

| Bron | Pad | Doel |
|------|-----|------|
| Bestaande admin-pagina | `app/(dashboard)/beheer/page.tsx` | Leidende dataflow en functionaliteit |
| Stitch visual (HTML) | `dashboard admin setup.zip → code.html` | Visuele referentie layout |
| Stitch visual (screenshot) | `dashboard admin setup.zip → screen.png` | Visuele referentie pixel-level |
| Design system spec | `dashboard admin setup.zip → DESIGN.md` | Kleurpalet, typografie, spacing |
| Dashboard primitieven | `components/dashboard/dashboard-primitives.tsx` | Herbruikbare UI-bouwstenen |
| Ops-delivery types | `lib/ops-delivery.ts` | DeliveryLifecycleStage, DeliveryExceptionStatus, labels |
| Core types | `lib/types.ts` | Organization, Campaign, CampaignStats, OrgInvite |
| Shell config | `lib/dashboard/dashboard-shell-config.ts` | Admin vs. buyer mode |

---

## Product- en canonregels

1. **`is_verisight_admin === true`** is de enige poort tot deze pagina — redirect naar `/dashboard` bij false.
2. **RLS in Supabase** is leidend; admin-client (`lib/supabase/admin.ts`) alleen gebruiken voor expliciet gedocumenteerde overrides.
3. **Fail loud**: geen silent 0-fallbacks voor betekenisvolle data. Toon "Niet beschikbaar" of een zichtbare foutmelding.
4. **Multi-tenancy**: data altijd scopen op `org_ids` die bij de ingelogde admin horen.
5. **Geen productlogica breken**: bestaande exports, server actions en form submissions uit het huidige `beheer/page.tsx` blijven functioneel.
6. **Stitch is geen productcanon**: Stitch/Loveable levert alleen layout- en sfeerreferentie. Labels, productgrenzen en datakeuzes in dit document zijn leidend.
7. **Eerste Codex-run blijft op `/beheer`**: geen redesign van sub-routes, geen nieuwe auditlog-route, geen nieuwe adminmodule-logica buiten deze pagina.

---

## Gewenste informatiearchitectuur

```
/beheer
├── [1] PageHeader
│     ├── Paginatitel + subtitel
│     └── StatusBadge (amber warning bij open blokkades)
│
├── [2] SetupStatusBar  (4 metric-cards)
│     ├── ORGANISATIES   — actief-count + kwalificatiestatus
│     ├── TOEGANG & ROLLEN — pending-invite-count + kwalificatiestatus
│     ├── CAMPAGNES      — campaign-count + kwalificatiestatus
│     └── DATA & IMPORT  — blokkade-count + kwalificatiestatus
│
├── [3] OpenBlokkades  (conditioneel, toon alleen als er > 0 zijn)
│     └── BlokkadeCard × n  (amber-bordered, met impact-label + actielink)
│
├── [4] SetupKernGrid  (2×2)
│     ├── OrganisatiesPanel   (org-lijst + NewOrgForm)
│     ├── ToegangenPanel      (user-count + invites + InviteClientUserForm)
│     ├── CampagnesPanel      (campaign-lijst + NewCampaignForm)
│     └── DataImportPanel     (import-status + AddRespondentsForm)
│
└── [5] SecundaireAdminmodules  (5 icon-links)
      └── Billing | Health | Proof | Klantlearnings | Aanvragen
```

---

## Visuele target uit Stitch

De Stitch-visual (`screen.png` / `code.html`) toont:

**Sectie 1 — Header**
- H1: `"Dashboard admin setup"` (font-headline-xl, color: primary)
- Subtitel: `"Configureer organisaties, toegang, campagnes en data-readiness"` (body-md, on-surface-variant)
- Amber badge rechts: `"Setup aandacht nodig"` + `"N open blokkades"` — alleen zichtbaar als `blockedCount > 0`

**Sectie 2 — Status Bar (4 cards)**
- Card-layout: `grid-cols-4`, witte achtergrond, `border-outline-variant`, `rounded-xl`, ambient-shadow
- Elke card: `LABEL` (font-label-caps) → metric-waarde (font-metric-value, color primary) → statustekst met icoon en kleur (emerald/amber/red/slate)

**Sectie 3 — Open Setupblokkades**
- Amber `border-left: 4px solid #f59e0b` per kaart
- Categorie-tag (bijv. `DATA EN IMPORT`) + impact-tag (bijv. `IMPACT: KAN NIET LIVE`) in caps
- Titel (headline-md) + beschrijving (body-md) + CTA-knop (action-teal)

**Sectie 4 — Setupkern Grid**
- `grid-cols-2`, witte kaarten, `rounded-xl`, `border-outline-variant`
- Elke kaart heeft een icon + sectietitel + compacte datarij + actieknoppen onderaan
- Campagnekaart toont max 3 campagnenamen met status-icon (✓ / ⚠ / ○)
- Data-import kaart toont importblokkade-status in rood alert-blok als aanwezig

**Sectie 5 — Secundaire Adminmodules**
- `grid-cols-5`, compacte icon-cards, hover → `border-action-teal`
- Icoon + label + subtekst "Naar [modulenaam]"

> **Let op:** Stitch gebruikt "Routebeheer" als productnaam en toont een sidebar met items als "Survey Routes" en "Participants" — dit is Stitch-context, NIET Verisight. Gebruik de bestaande Verisight-navigatie (`dashboard-shell.tsx`). De paginatitel blijft `"Dashboard admin setup"` of de Verisight-equivalente term.

---

## Bestaande code die Codex eerst moet inspecteren

### Pagina's en routes
- `app/(dashboard)/beheer/page.tsx` — volledige huidige implementatie lezen
- `app/(dashboard)/beheer/contact-aanvragen/page.tsx` — bestaande sub-route
- `app/(dashboard)/beheer/billing/page.tsx` — bestaande sub-route
- `app/(dashboard)/beheer/health/page.tsx` — bestaande sub-route
- `app/(dashboard)/beheer/proof/page.tsx` — bestaande sub-route
- `app/(dashboard)/beheer/klantlearnings/page.tsx` — bestaande sub-route
- `app/(dashboard)/layout.tsx` — shared dashboard shell

### Componenten
- `components/dashboard/dashboard-primitives.tsx` — volledig lezen (DashboardSection, DashboardPanel, DashboardChip, DashboardHero, DashboardSummaryBar)
- `components/dashboard/dashboard-shell.tsx` — nav-structuur en admin-mode
- `components/dashboard/new-org-form.tsx`
- `components/dashboard/new-campaign-form.tsx`
- `components/dashboard/add-respondents-form.tsx`
- `components/dashboard/invite-client-user-form.tsx`
- `components/dashboard/client-access-list.tsx`
- `components/dashboard/archive-org-button.tsx`
- `components/dashboard/delete-org-button.tsx`
- `components/dashboard/preflight-checklist.tsx` — checken of dit admin-specifiek is
- `components/dashboard/onboarding-panels.tsx` — `OperatorOnboardingBlueprint` checken of dit op deze pagina thuishoort

### Lib / helpers
- `lib/ops-delivery.ts` — `getDeliveryExceptionLabel()`, `getDeliveryLifecycleLabel()`, `getDeliveryCheckpointTitle()`, alle types
- `lib/implementation-readiness.ts` — `getDeliveryModeLabel()`
- `lib/types.ts` — Organization, Campaign, CampaignStats, OrgInvite, OrgMember
- `lib/dashboard/dashboard-shell-config.ts` — admin-mode flags
- `lib/suite-access.ts` / `lib/suite-access-server.ts` — toegangscontrole

---

## Pre-implementation audit en datacontract

| UI-element | Benodigde data | Bestaande bron/helper/component | Schaal/betekenis | Fallbackgedrag als ontbreekt | Mag in productie tonen | Open vraag / datagap |
|---|---|---|---|---|---|---|
| StatusCard ORGANISATIES — metric | `orgs.filter(o => o.is_active).length` | `org_members` + `organizations(*)` JOIN, bestaande query in `beheer/page.tsx` | Aantal actieve tenants voor deze admin | Toon `0` met status "Geen organisaties" | Ja | — |
| StatusCard ORGANISATIES — status | metric > 0 ? "Geconfigureerd" : "Ontbreekt" | Afgeleid van bovenstaande | Binaire readiness | "Ontbreekt" met amber kleur | Ja | — |
| StatusCard TOEGANG & ROLLEN — metric | `invites.filter(i => !i.accepted_at).length` | `org_invites` query, bestaand in `beheer/page.tsx` als `pendingInviteCount` | Aantal uitnodigingen zonder activatiebevestiging | `0` → status "OK" | Ja | — |
| StatusCard TOEGANG & ROLLEN — status | pendingInviteCount > 0 ? "Aandacht nodig" : "OK" | Afgeleid | — | "OK" (geen aandacht als 0) | Ja | — |
| StatusCard CAMPAGNES — metric | `campaigns.length` | `campaigns` query, bestaand | Totaal campaigns (actief + archief) | `0` → "Geen campaigns" | Ja | **Vaste implementatieregel**: metric toont totaal aantal campaigns, niet alleen actieve. |
| StatusCard CAMPAGNES — status | Afgeleid van actieve-campaign-count | `campaigns.filter(c => c.is_active).length` | "Actief" / "Geen actieve campaigns" / "Geen campaigns" | "Geen campaigns" | Ja | **Vaste implementatieregel**: `activeCampaignCount > 0 → "Actief"`, `campaigns.length > 0 && activeCampaignCount === 0 → "Geen actieve campaigns"`, `campaigns.length === 0 → "Geen campaigns"`. Geen status `"Deels klaar"` in deze run. |
| StatusCard DATA & IMPORT — metric | `blockedDeliveries.length` | `deliveryRecords.filter(r => r.exception_status !== 'none')`, bestaand | Aantal actieve blokkades in delivery lifecycle | `0` → status "OK" | Ja | — |
| BlokkadeCard — categorie-tag | Afgeleid van `checkpoint_key` | `checkpoint_key` → vaste admincategorie | Setupdomein van de blokkade | Toon `"Onbekend"` alleen als checkpoint ontbreekt | Ja | **Vaste implementatieregel**: `implementation_intake` en `invite_readiness` → `CAMPAGNES`; `import_qa` → `DATA & IMPORT`; `client_activation` → `TOEGANG & ROLLEN`. Checkpoints na `client_activation` renderen niet in deze admin-setup blokkerlijst. |
| BlokkadeCard — impact-tag | Afgeleid van `exception_status` | `exception_status` → vaste impactcopy | Impact-niveau voor operator | Geen impact-tag tonen als status ontbreekt | Ja | **Vaste implementatieregel**: `blocked` → `KAN NIET VERDER`; `needs_operator_recovery` → `OPERATOR INGREEP NODIG`; `awaiting_client_input` → `WACHT OP KLANTINPUT`; `awaiting_external_delivery` → `WACHT OP EXTERNE STAP`. |
| BlokkadeCard — beschrijving | `delivery_record.next_step` of `checkpoint.last_auto_summary` | `next_step: string | null`, `last_auto_summary: string | null` | Operatorinstructie per blokkade | Body weglaten als beide ontbreken | Ja | Geen fallbacktekst genereren buiten bestaande bronvelden. |
| BlokkadeCard — actieknop href | Afgeleid van `checkpoint_key` | `checkpoint_key` → in-page anchor | Directe link naar setupzone | Geen knop tonen als mapping ontbreekt | Ja | **Vaste implementatieregel**: `implementation_intake` en `invite_readiness` → `/beheer#campagnes`; `import_qa` → `/beheer#data-import`; `client_activation` → `/beheer#toegang`. Geen links naar dashboard, rapport of Action Center. |
| OrganisatiesPanel — org-lijst | `activeOrgs`, `archivedOrgs` | Bestaand in `beheer/page.tsx` | Actieve en gearchiveerde orgs | "Nog geen organisaties" leegstaatmelding | Ja | — |
| OrganisatiesPanel — NewOrgForm | Bestaand component | `components/dashboard/new-org-form.tsx` | Formulier voor aanmaken org | n.v.t. | Ja | Hergebruiken 1:1 |
| ToegangenPanel — user-count | `clientAccessCount` (bestaand) | `org_members` count excl. self | Aantal gekoppelde client-gebruikers | `0` → "Geen klantgebruikers" | Ja | — |
| ToegangenPanel — pending-count | `pendingInviteCount` (bestaand) | `org_invites` where `accepted_at IS NULL` | Uitnodigingen zonder activatie | `0` → geen badge | Ja | — |
| ToegangenPanel — InviteClientUserForm | Bestaand component | `components/dashboard/invite-client-user-form.tsx` | Formulier voor uitnodigen | Alleen tonen als `activeOrgs.length > 0` | Ja | Hergebruiken 1:1 |
| CampagnesPanel — campaign-lijst | `campaigns` (top 3, gesorteerd op created_at desc) | `campaigns` query | Naam + scan_type + is_active | "Geen campagnes aangemaakt" | Ja | Stitch toont max 3 items + "Bekijk campagnes" link. Codex moet cutoff-logica implementeren |
| CampagnesPanel — NewCampaignForm | Bestaand component | `components/dashboard/new-campaign-form.tsx` | Formulier campagne aanmaken | Locked als `activeOrgs.length === 0` | Ja | Hergebruiken 1:1 |
| DataImportPanel — blokkade-alert | `blockedDeliveries[0]` (eerste/meest kritieke) | `deliveryRecords.filter(exception_status !== 'none')` | Compact foutblok | Geen alert als `blockedDeliveries.length === 0` | Ja | Toont slechts 1 record compact; rest via BlokkadeCards sectie 3 |
| DataImportPanel — AddRespondentsForm | Bestaand component | `components/dashboard/add-respondents-form.tsx` | Respondenten importeren | Locked als `campaigns.length === 0` | Ja | Hergebruiken 1:1 |
| SecundaireAdminmodules | Statische routes | `/beheer/billing`, `/beheer/health`, `/beheer/proof`, `/beheer/klantlearnings`, `/beheer/contact-aanvragen` | Quick-links naar sub-pages | Altijd tonen (links zijn statisch) | Ja | Alle 5 sub-routes bestaan reeds |
| AdminFooter — auditlog-link | Geen bestaande route | — | Toekomstige link | Niet tonen | Nee | Buiten scope van deze eerste Codex-run |
| AdminFooter — beheerlogboek-link | Geen bestaande route | — | Toekomstige link | Niet tonen | Nee | Buiten scope van deze eerste Codex-run |

---

## Gefaseerde implementatie

### Fase 1 — Inspecteer bestaande code en data

- [ ] Lees `app/(dashboard)/beheer/page.tsx` volledig (alle queries, computed variables, JSX-structuur)
- [ ] Noteer welke server actions en form submissions erin zitten (method, endpoint, revalidation)
- [ ] Lees `components/dashboard/dashboard-primitives.tsx` volledig; noteer alle exporteerde componenten en hun props
- [ ] Controleer of `OperatorOnboardingBlueprint` (uit `onboarding-panels.tsx`) op de beheer-pagina staat — zo ja, noteer of dit in de redesign blijft of verdwijnt
- [ ] Controleer `lib/dashboard/dashboard-shell-config.ts` voor admin-specifieke flags die de nav of layout beïnvloeden
- [ ] Controleer `lib/ops-delivery.ts` op: `getDeliveryExceptionLabel()`, `getDeliveryLifecycleLabel()`, `getDeliveryCheckpointTitle()` — noteer signatures en retourwaarden
- [ ] Verifieer dat alle 5 sub-routes (`/beheer/billing` etc.) bestaan en niet worden geraakt door deze wijziging

### Fase 2 — Inspecteer Stitch visual en componentbehoefte

- [ ] Inspecteer `screen.png` (visuele referentie) en `code.html` (implementatiereferentie) voor alle 5 secties
- [ ] Maak een inventarisatie: welke Stitch-componenten zijn direct vertaalbaar naar bestaande Verisight-primitieven?
- [ ] Markeer Stitch-specifieke elementen die **niet** in Verisight thuishoren (Routebeheer-branding, sidebar-items, auditlog-footer)
- [ ] Noteer welke nieuwe kleine componenten nodig zijn (bijv. `SetupStatusCard`, `BlokkadeCard`, `AdminModuleLink`)

### Fase 3 — Leg de admin-setup mappings vast

- [ ] Schrijf een `mapExceptionToCategory(checkpointKey: DeliveryCheckpointKey): string | null` helper volgens de vaste mapping uit dit plan. Checkpoints na `client_activation` geven `null` terug en renderen niet in de blokkadelijst.
- [ ] Schrijf een `mapCheckpointToActionHref(checkpointKey: DeliveryCheckpointKey): string | null` helper die alleen naar bestaande `/beheer`-anchors wijst.
- [ ] Schrijf een `mapExceptionToImpactLabel(exceptionStatus: DeliveryExceptionStatus): string | null` helper volgens de vaste impactcopy uit dit plan.
- [ ] Leg `campaignStatusLabel` vast als pure helper met exact drie toestanden: `"Actief"`, `"Geen actieve campaigns"`, `"Geen campaigns"`.

### Fase 4 — Bouw direct op bestaande data

- [ ] Bouw de nieuwe paginalaag direct op de bestaande queries en server actions in `beheer/page.tsx`.
- [ ] Gebruik testfixtures alleen in testbestanden; maak geen tijdelijke `_fixture.ts` of andere sampledata-file in de productiecode.
- [ ] Verifieer dat alle 5 secties renderen zonder runtime-errors met echte data en lege-staatdata.

### Fase 5 — Koppel en structureer echte data per sectie/component

- [ ] Herstructureer de bestaande queries uit het huidige `beheer/page.tsx` naar de nieuwe sectievolgorde zonder sampledata of tussenliggende fixturelaag
- [ ] Voeg nieuwe afgeleide berekeningen toe:
  - `blockedDeliveries` (reeds bestaand)
  - `campaignStatusLabel` op basis van de vaste drie toestanden uit Fase 3
  - `blokkadeCategories` via `mapExceptionToCategory`
  - `blokkadeActionHrefs` via `mapCheckpointToActionHref`
  - `blokkadeImpactLabels` via `mapExceptionToImpactLabel`
- [ ] Elke sectie die `null`-data kan ontvangen: implementeer het fallbackgedrag conform de tabel in "Pre-implementation audit"

### Fase 6 — Integreer in bestaande route

- [ ] Vervang de JSX-body van `app/(dashboard)/beheer/page.tsx` door de nieuwe layout
- [ ] Behoud alle bestaande `import`-statements voor forms en buttons; verwijder alleen ongebruikte
- [ ] Verifieer dat de admin-gate (`is_verisight_admin !== true → redirect('/dashboard')`) intact is
- [ ] Verifieer dat alle bestaande server actions (nieuwe org, campagne, respondenten, invite) nog steeds aangeroepen worden door de juiste forms
- [ ] Verifieer dat alle sub-routes (`/beheer/billing` etc.) bereikbaar blijven vanuit de SecundaireAdminmodules-sectie

### Fase 7 — Responsiveness en visual polish

- [ ] Test op 1280px (max-container), 1024px, 768px (tablet), 375px (mobile)
- [ ] Op ≤768px: `grid-cols-2` → `grid-cols-1` voor SetupKernGrid en SetupStatusBar
- [ ] Op ≤768px: `grid-cols-5` → `grid-cols-3` (of scroll) voor SecundaireAdminmodules
- [ ] Controleer dat alle kleuren uit het Verisight-design-systeem komen (slate, emerald, amber, error) — geen nieuwe Stitch-kleuren introduceren tenzij ze al in het systeem zitten
- [ ] Controleer typografie: gebruik `text-sm`/`text-xs` + Tailwind-klassen consistent met `dashboard-primitives.tsx`-patronen

### Fase 8 — Tests en regressiechecks

- [ ] TypeScript-compilatie: `cd Verisight/frontend && npx tsc --noEmit` — nul errors
- [ ] Lint: `npx next lint` — nul errors
- [ ] Route-rendertest: start dev server, navigeer naar `/beheer` als admin-user — geen crash
- [ ] Verifieer dat `/dashboard` ongewijzigd is (geen import-overlap, geen gedeelde state)
- [ ] Verifieer dat `/action-center` ongewijzigd is
- [ ] Verifieer dat alle 5 sub-routes (`/beheer/billing` etc.) nog bereikbaar zijn
- [ ] Responsive check: devtools 375px, 768px, 1280px — geen overflow, geen hidden content
- [ ] Grep op verboden termen: `git grep -i "action center\|managementduiding\|mockdata\|FIXTURE"` in de gewijzigde bestanden — nul hits

---

## Componentstrategie

### Hergebruiken — verplicht eerst controleren

| Component | Pad | Hergebruik in sectie |
|---|---|---|
| `DashboardSection` | `components/dashboard/dashboard-primitives.tsx` | Alle secties als wrapper |
| `DashboardPanel` | `components/dashboard/dashboard-primitives.tsx` | Blokkade-fallback, lege-state berichten |
| `DashboardChip` | `components/dashboard/dashboard-primitives.tsx` | Status-badges in SetupKernGrid |
| `DashboardSummaryBar` | `components/dashboard/dashboard-primitives.tsx` | Eventueel voor SetupStatusBar als props matchen |
| `NewOrgForm` | `components/dashboard/new-org-form.tsx` | OrganisatiesPanel |
| `NewCampaignForm` | `components/dashboard/new-campaign-form.tsx` | CampagnesPanel |
| `AddRespondentsForm` | `components/dashboard/add-respondents-form.tsx` | DataImportPanel |
| `InviteClientUserForm` | `components/dashboard/invite-client-user-form.tsx` | ToegangenPanel |
| `ClientAccessList` | `components/dashboard/client-access-list.tsx` | ToegangenPanel |
| `ArchiveOrgButton` | `components/dashboard/archive-org-button.tsx` | OrganisatiesPanel |
| `DeleteOrgButton` | `components/dashboard/delete-org-button.tsx` | OrganisatiesPanel |

### Nieuwe kleine componenten (alleen indien hergebruik niet volstaat)

Codex mag **alleen** nieuwe componenten schrijven als geen bestaand component de behoefte dekt. Elke nieuwe component moet klein, gefocust en testbaar zijn.

| Voorstel | Props-schets | Locatie |
|---|---|---|
| `SetupStatusCard` | `label: string`, `metric: string`, `statusText: string`, `statusTone: 'ok' \| 'warning' \| 'error' \| 'neutral'` | `components/dashboard/beheer-status-card.tsx` |
| `BlokkadeCard` | `category: string`, `impact: string`, `title: string`, `description: string \| null`, `actionLabel: string \| null`, `actionHref: string \| null` | `components/dashboard/beheer-blokkade-card.tsx` |
| `AdminModuleLink` | `icon: string`, `label: string`, `subLabel: string`, `href: string` | inline in beheer/page.tsx of `components/dashboard/beheer-module-link.tsx` |

> **Regel**: Als een bestaand primitief (bijv. `DashboardPanel`) met minimale prop-aanpassing de BlokkadeCard kan vervangen, gebruik dat. Schrijf geen nieuw component dan.

---

## Copy- en labelregels

Alle zichtbare teksten zijn in **Nederlands**. Gebruik exact de labels uit onderstaande tabel.

| Element | Label (NL) |
|---|---|
| Paginatitel | `Dashboard admin setup` |
| Paginasubtitel | `Configureer organisaties, toegang, campagnes en data-readiness` |
| StatusCard label 1 | `ORGANISATIES` |
| StatusCard label 2 | `TOEGANG & ROLLEN` |
| StatusCard label 3 | `CAMPAGNES` |
| StatusCard label 4 | `DATA & IMPORT` |
| Status: alles ok | `Geconfigureerd` |
| Status: aandacht nodig | `Aandacht nodig` |
| Status: blokkade | `Blokkade` |
| Status: geen data | `Niet beschikbaar` |
| Sectietitel blokkades | `Open setupblokkades` |
| Sectietitel secundair | `SECUNDAIRE ADMINMODULES` (label-caps) |
| Module Billing | Label: `Billing` / subtekst: `Naar billingmodule` |
| Module Health | Label: `Health` / subtekst: `Naar healthmodule` |
| Module Proof | Label: `Proof` / subtekst: `Naar proofmodule` |
| Module Klantlearnings | Label: `Klantlearnings` / subtekst: `Naar learnings` |
| Module Aanvragen | Label: `Aanvragen` / subtekst: `Naar contact` |
| Amber waarschuwingsbadge | `Setup aandacht nodig` + `{n} open blokkade(s)` |
| Setupkern: Organisaties | `Organisaties` |
| Setupkern: Toegang | `Toegang en rollen` |
| Setupkern: Campagnes | `Campagnes` |
| Setupkern: Data | `Data en import` |
| Lege staat org | `Nog geen organisaties. Maak hieronder de eerste organisatie aan.` |
| Lege staat campagne | `Geen campagnes gevonden.` |
| Lege staat import | `Geen importblokkades gevonden.` |
| Lege staat toegang | `Geen openstaande uitnodigingen.` |

**Verboden copy op deze pagina:**
- Geen "Action Center", "Actiepunten", "Prioriteiten", "Inzichten", "Aanbevelingen", "Risicoscore"
- Geen zinnen die klanten aanspreken ("Uw resultaten", "Uw medewerkers")
- Geen Stitch-specifieke branding: geen "Routebeheer", "HR Operations", "Analytical Authority Portal"

---

## Verboden termen en patronen

**Verboden op pagina- en componentniveau:**

- Geen klantverwarrende operationele routehub
- Geen analytische output (risicoscores, factoranalyses, bandverdelingen, trendgrafieken)
- Geen Action Center-logica of -componenten (geen imports uit `lib/action-center-*`)
- Geen managementduiding of HR-inzichten voor klanten
- Geen mockdata in productie (geen hardcoded namen, scores of aantallen als productiedisplay)
- Geen silent 0-fallbacks voor betekenisvolle data (bijv. niet `total_completed ?? 0` tonen als data ontbreekt; toon "Niet beschikbaar")
- Geen nieuwe productclaims die niet door bestaande data worden gedekt
- Geen paginarol-drift: de pagina dient interne admin-configuratie, niet klantinzage

**Code-niveau verboden:**
```
// Verboden imports op deze pagina:
import * from '@/lib/action-center-*'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { RecommendationList } from '@/components/dashboard/recommendation-list'
import { FactorTable } from '@/components/dashboard/factor-table'

// Verboden patterns:
someValue ?? 0  // alleen als 0 een geldige waarde is; anders: undefined → "Niet beschikbaar"
```

---

## Fallback- en datagapbeleid

| Situatie | Gedrag |
|---|---|
| Een sectie-query faalt of retourneert `null` | Sectie toont `DashboardPanel` met `tone="amber"`, tekst: `"Niet beschikbaar — data kon niet worden geladen"` |
| Een metric-waarde is `null` of `undefined` | Toon `"—"` (em-dash), niet `0` |
| `blockedDeliveries.length === 0` | Sectie "Open setupblokkades" wordt niet gerenderd (conditioneel) |
| `orgs.length === 0` | OrganisatiesPanel toont leegstaat-bericht + NewOrgForm |
| `campaigns.length === 0` | CampagnesPanel toont leegstaat-bericht + NewCampaignForm (locked als geen actieve org) |
| `delivery_record.next_step === null` | BlokkadeCard-beschrijving: toon `"Geen omschrijving beschikbaar"` — geen fallback-tekst genereren |
| `mapCheckpointToActionHref()` returnt `null` | BlokkadeCard toont geen actieknop |
| Footer-links (auditlog, beheerlogboek) — routes bestaan niet | Niet renderen in deze run |
| Codex ontdekt een datagap die niet in dit plan staat | Noteer expliciet in uitvoerrapport onder "Datagaps"; implementeer niet om de gap heen |
| `is_verisight_admin !== true` | `redirect('/dashboard')` — altijd vóór enige query |

---

## Testplan

- [ ] **TypeScript**: `npx tsc --noEmit` — nul errors in `app/(dashboard)/beheer/**` en `components/dashboard/beheer-*.tsx`
- [ ] **Lint**: `npx next lint` — nul errors/warnings in gewijzigde bestanden
- [ ] **Unit tests nieuwe helpers**:
  - `mapExceptionToCategory()` — test alle `DeliveryCheckpointKey`-waarden; verwacht correcte categorie-string
  - `mapCheckpointToActionHref()` — test alle keys; verwacht `string` of `null`
  - `campaignStatusLabel()` — test: active campaigns aanwezig, alleen inactieve campaigns, lege array
- [ ] **Route-rendertest**: `GET /beheer` als `is_verisight_admin=true` → status 200, geen React crash
- [ ] **Redirect-test**: `GET /beheer` als `is_verisight_admin=false` → redirect naar `/dashboard`
- [ ] **Responsive**: devtools 375px en 768px → geen horizontale overflow, alle secties zichtbaar
- [ ] **Regressie: `/dashboard`**: laad `/dashboard` na wijziging — geen import-errors, geen crash
- [ ] **Regressie: `/action-center`**: laad `/action-center` na wijziging — geen impact
- [ ] **Regressie: sub-routes**: alle 5 `/beheer/*`-sub-routes laden zonder crash
- [ ] **Regressie: forms**: dien `NewOrgForm`, `NewCampaignForm`, `InviteClientUserForm` in dev in — server actions werken nog
- [ ] **Mockdata-check**: `git grep -rn "FIXTURE\|TechBouw\|testorg"` in gewijzigde bestanden → nul hits
- [ ] **Verboden-termen-check**: `git grep -rn "action-center\|RiskCharts\|RecommendationList\|FactorTable"` in `beheer/page.tsx` → nul hits

---

## Acceptatiecriteria

1. **Informatiearchitectuur gevolgd**: alle 5 secties zijn aanwezig in de volgorde uit het plan (Header → StatusBar → OpenBlokkades → SetupKernGrid → SecundaireModules)
2. **Stitch target visueel herkenbaar vertaald**: de 4 status-metric-cards, amber blokkade-kaarten en 5 module-links zijn herkenbaar; Verisight design-systeem (kleuren, typografie, rounding) is leidend
3. **Bestaande dataflow blijft leidend**: alle queries zijn ongewijzigd of alleen additief uitgebreid; geen data verwijderd of omzeild
4. **Datagaps expliciet**: alle datagaps die Codex ontdekt zijn gedocumenteerd in het uitvoerrapport
5. **Geen productlogica gebroken**: alle bestaande server actions, forms en navigatielinks werken na de wijziging
6. **Geen verboden content**: geen analytische output, geen Action Center-imports, geen mockdata, geen Stitch-branding
7. **Mobile bruikbaar**: op 375px is de pagina functioneel bruikbaar (geen overflow, geen verborgen knoppen)
8. **Kleine, reviewbare PR**: maximaal 1 nieuwe helper-file en maximaal 3 nieuwe component-files; geen grote refactors van ongewijzigde componenten

---

## Risico's en mitigaties

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Te grote PR — meerdere pagina's raken meegetrokken | Midden | Hoog | Scope strikt beperken tot `beheer/page.tsx` en maximaal 3 nieuwe componenten; geen refactor van sub-routes |
| Mockdata wordt productie | Laag | Hoog | Geen fixturefase in productiecode; testdata alleen in testbestanden |
| Visuele drift van design system — Stitch-kleuren direct overnemen | Midden | Midden | Stitch-kleuren (`#2DD4BF`, `#1B2B3A`) alleen gebruiken als ze al in Tailwind-config of CSS-vars voorkomen; anders huidige Verisight-tokens |
| Paginarol-drift — analytische output sluipt erin | Laag | Hoog | Verboden-imports-check in testplan; codereview-criteria checkt op `risk-charts`, `recommendation-list`, `factor-table` |
| Ontbrekende data — `next_step` is null, `exception_status` heeft geen menselijke beschrijving | Hoog | Midden | Fallback "Geen omschrijving beschikbaar", datagap documenteren; geen gegenereerde tekst |
| Regressie op bestaande forms — server actions breken door JSX-herstructurering | Midden | Hoog | Alle form-componenten 1:1 hergebruiken, geen prop-wijzigingen; end-to-end form-test in testplan |
| Access/role fouten — admin-gate weggerefactord | Laag | Kritiek | Admin-gate (`is_verisight_admin !== true → redirect`) is eerste check in server component; aanwezig vóór enige query |
| BlokkadeCard-actionHref wijst naar verkeerde route | Midden | Midden | `mapCheckpointToActionHref()` mag alleen bestaande `/beheer`-anchors teruggeven; bij twijfel `null` en geen knop tonen |

---

## Uitvoerrapport dat Codex na implementatie moet teruggeven

Codex levert na voltooiing een gestructureerd uitvoerrapport met:

```
## Uitvoerrapport — Dashboard Admin Setup Redesign

### Gewijzigde bestanden
- [ lijst van bestanden met pad ]

### Nieuwe componenten
- [ naam, pad, verantwoordelijkheid ]

### Hergebruikte componenten (1:1)
- [ naam, pad ]

### Datamapping-resultaat
- Voor elk UI-element in de datacontracttabel: bevestig of data correct gemapped is, of noteer afwijking

### Datagaps (open)
- [ datagap, reden, aanbeveling ]

### Tests gedraaid
- TypeScript: [ PASS / FAIL + output ]
- Lint: [ PASS / FAIL + output ]
- Unit tests nieuwe helpers: [ PASS / FAIL ]
- Route-rendertest: [ PASS / FAIL ]
- Responsive checks: [ PASS / FAIL ]
- Regressie /dashboard: [ PASS / FAIL ]
- Regressie /action-center: [ PASS / FAIL ]
- Regressie sub-routes: [ PASS / FAIL ]
- Mockdata-check: [ PASS / FAIL ]
- Verboden-termen-check: [ PASS / FAIL ]

### Screenshots of preview notes
- [ Screenshot URL of beschrijving van visuele staat per breakpoint ]

### Afwijkingen van plan
- [ Beschrijf elke afwijking en de reden ]

### Open restpunten
- [ Resterende datagaps of vervolgwerk buiten deze eerste `/beheer`-run ]
```
