# ExitScan Dashboard — Stitch Visual Integration Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate the Stitch/Loveable ExitScan dashboard visual into the existing Verisight app — replacing the current flat card layout with the 11-section information architecture from `stitch_verisight_pebl_style_transformation.zip`, while keeping all existing data bindings intact.

**Architecture:** New Tailwind CSS design tokens are added to `globals.css`. Existing data-fetching in `campaigns/[id]/page.tsx` and helper functions in `page-helpers.tsx` are untouched. Each of the 11 sections maps to a new or refactored client component under `components/dashboard/exit-scan/`. The existing `ManagementRead*` primitives are replaced or wrapped section-by-section.

**Tech stack:** Next.js 15 App Router, Tailwind v4, CSS custom properties, existing Supabase data layer, SVG for donut/gauge charts.

---

## Product Canon (enforce throughout every task)

| Rule | Detail |
|------|--------|
| Deep Navy | `#1B2B3A` — primary background for hero cards and dark sections |
| Action Teal | `#2DD4BF` — accent color, progress fills, teal left-borders |
| Slate Blue | `#94A3B8` — secondary text, labels, subdued values |
| Display font | Plus Jakarta Sans 700 — all section headings and large numerals |
| Body font | Inter — all body copy and table text |
| Spacing unit | 4px base; section gaps = 64px; card padding = 40px |
| Forbidden terms | "respondenten", "medewerkers" → use **"vertrekkers"**; "werkgerelateerde factoren" → **"werkfrictie"**; "pull factors" → **"trekfactoren"** |
| Forbidden patterns | No placeholder/mock data rendered in production paths; no silent fallbacks; no hardcoded scores |
| Copy language | NL throughout; tense = voltooid tegenwoordige tijd for factual observations |

---

## Design Token Mapping

| Token name | Value | Usage |
|-----------|-------|-------|
| `--color-navy` | `#1B2B3A` | Hero card backgrounds |
| `--color-teal` | `#2DD4BF` | Accent fills, progress bars, borders |
| `--color-slate` | `#94A3B8` | Secondary text |
| `--color-surface` | `#F8FAFC` | Page background |
| `--color-card` | `#FFFFFF` | Default card background |
| `--radius-card` | `16px` | Standard card border-radius |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` | Card elevation |
| `--font-display` | `'Plus Jakarta Sans', sans-serif` | Display headings |
| `--font-body` | `'Inter', sans-serif` | Body text |

---

## Data Mapping Checklist

Before writing any component, verify the binding exists in `page-helpers.tsx` or `page.tsx`:

| Visual element | Data source | Helper/field |
|---------------|-------------|-------------|
| Frictiescore (0–100) | `stats.friction_score` | Direct field |
| Respons teller | `stats.total_responses` | Direct field |
| Uitnodigingen verstuurd | `stats.total_invited` | Direct field |
| Responspercentage | `stats.response_rate` | Computed in stats view |
| Werkfrictie / Trekfactoren / Situationeel | `buildExitPictureDistribution(responses)` | `page-helpers.tsx` |
| Dominante vertrekreden | Highest segment from `exitDistribution.segments` | Derived |
| STERK_WERKSIGNAAL rate | `computeStrongWorkSignalRate(responses)` | `page-helpers.tsx` |
| Factor scores (lijst) | `stats.factor_scores` or `responses` aggregation | Existing aggregation |
| SDT subcategories (Autonomie/Verbondenheid/Competentie) | `responses` filtered by `exit_reason_code` prefix | New helper needed |
| Toetsvragen per factor | Static copy map keyed on `exit_reason_code` | Constant in helpers |
| Open quotes | `responses[].open_answer` | Direct field |

---

## 11-Section Information Architecture

```
1.  Hero — Frictiescore + responsoverzicht
2.  Context — "Waarom dit telt" drie-kaartenblok
3.  Dominante vertrekreden — donut + uitleg
4.  Factorkaarten hoog/midden — 4-koloms grid
5.  Responsstats — 4 stat-tegels + leescontext
6.  Horizontale progressbars — factoren + toetsvragen
7.  Vertrekbeeldverdeling — gestapelde balk + categorie-kaarten
8.  Driverkaarten — 2×2 met score + subtags
9.  SDT-gauges — Autonomie / Verbondenheid / Competentie
10. Factortabel — volledig overzicht
11. Methodische leesgrenzen — dark navy footer card
```

---

## File Structure

```
frontend/
├── app/(dashboard)/campaigns/[id]/
│   ├── page.tsx                        MODIFY — replace ExitScan section rendering
│   └── page-helpers.tsx                MODIFY — add SDT helper + toetsvragen map
├── components/dashboard/exit-scan/
│   ├── index.ts                        CREATE — barrel export
│   ├── ExitScanHero.tsx                CREATE — Section 1
│   ├── ExitScanContext.tsx             CREATE — Section 2
│   ├── ExitScanDominantReason.tsx      CREATE — Section 3
│   ├── ExitScanFactorCards.tsx         CREATE — Section 4
│   ├── ExitScanResponseStats.tsx       CREATE — Section 5
│   ├── ExitScanProgressBars.tsx        CREATE — Section 6
│   ├── ExitScanDistribution.tsx        CREATE — Section 7
│   ├── ExitScanDriverCards.tsx         CREATE — Section 8
│   ├── ExitScanSDTGauges.tsx           CREATE — Section 9
│   ├── ExitScanFactorTable.tsx         CREATE — Section 10
│   ├── ExitScanMethodNote.tsx          CREATE — Section 11
│   └── DonutGauge.tsx                  CREATE — reusable SVG donut
└── app/globals.css                     MODIFY — add design tokens + font imports
```

---

## Task 1: Design tokens + fonts

**Files:**
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Add Google Fonts import at top of globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&family=Inter:wght@400;500;600&display=swap');
```

- [ ] **Step 2: Add CSS custom properties inside `:root`**

```css
:root {
  --color-navy: #1B2B3A;
  --color-teal: #2DD4BF;
  --color-slate: #94A3B8;
  --color-surface: #F8FAFC;
  --color-card: #FFFFFF;
  --radius-card: 16px;
  --shadow-card: 0 2px 12px rgba(0,0,0,0.06);
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

- [ ] **Step 3: Add Tailwind utility extensions in @layer utilities**

```css
@layer utilities {
  .font-display { font-family: var(--font-display); }
  .font-body { font-family: var(--font-body); }
  .bg-navy { background-color: var(--color-navy); }
  .bg-teal { background-color: var(--color-teal); }
  .text-slate { color: var(--color-slate); }
  .text-teal { color: var(--color-teal); }
  .border-teal { border-color: var(--color-teal); }
  .rounded-card { border-radius: var(--radius-card); }
  .shadow-card { box-shadow: var(--shadow-card); }
}
```

- [ ] **Step 4: Verify no existing globals.css rules are removed**

Open `frontend/app/globals.css` and confirm all pre-existing `@theme inline`, `@layer base`, dashboard tokens are still present above the new additions.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/globals.css
git commit -m "feat(design): add Stitch design tokens and font imports to globals.css"
```

---

## Task 2: Reusable DonutGauge component

**Files:**
- Create: `frontend/components/dashboard/exit-scan/DonutGauge.tsx`

- [ ] **Step 1: Create the component**

```tsx
// DonutGauge.tsx
interface DonutGaugeProps {
  score: number        // 0–100
  size?: number        // px, default 120
  strokeWidth?: number // default 10
  label?: string
  sublabel?: string
}

export function DonutGauge({ score, size = 120, strokeWidth = 10, label, sublabel }: DonutGaugeProps) {
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-teal)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <div className="text-center -mt-1">
          <div className="font-display text-2xl text-[var(--color-navy)]">{label}</div>
          {sublabel && <div className="text-xs text-slate">{sublabel}</div>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify SVG renders correctly at score=0, 50, 100**

No automated test needed for SVG — visual check in Step 3 of Task 12.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/exit-scan/DonutGauge.tsx
git commit -m "feat(exit-scan): add reusable DonutGauge SVG component"
```

---

## Task 3: Section 1 — ExitScanHero

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanHero.tsx`

**Data bindings:** `frictionScore: number`, `totalResponses: number`, `totalInvited: number`, `responseRate: number`

- [ ] **Step 1: Create ExitScanHero**

```tsx
interface ExitScanHeroProps {
  frictionScore: number
  totalResponses: number
  totalInvited: number
  responseRate: number
  campaignName: string
}

export function ExitScanHero({ frictionScore, totalResponses, totalInvited, responseRate, campaignName }: ExitScanHeroProps) {
  return (
    <div className="bg-navy rounded-card p-10 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 text-white">
        <p className="text-xs uppercase tracking-widest text-teal mb-2">ExitScan rapport</p>
        <h1 className="font-display text-3xl mb-1">{campaignName}</h1>
        <p className="text-slate text-sm mb-6">Gebaseerd op {totalResponses} ingevulde vragenlijsten</p>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="font-display text-2xl text-white">{totalResponses}</div>
            <div className="text-slate">ingevuld</div>
          </div>
          <div>
            <div className="font-display text-2xl text-white">{totalInvited}</div>
            <div className="text-slate">uitgenodigd</div>
          </div>
          <div>
            <div className="font-display text-2xl text-teal">{responseRate}%</div>
            <div className="text-slate">respons</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <DonutGauge score={frictionScore} size={160} strokeWidth={14} label={`${frictionScore}`} sublabel="frictiescore" />
        <p className="text-slate text-xs mt-2">0 = geen frictie · 100 = maximale frictie</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add DonutGauge import**

```tsx
import { DonutGauge } from './DonutGauge'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanHero.tsx
git commit -m "feat(exit-scan): Section 1 — ExitScanHero with frictiescore gauge"
```

---

## Task 4: Section 2 — ExitScanContext

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanContext.tsx`

**Data bindings:** None — static copy per campaign type (always ExitScan)

- [ ] **Step 1: Create ExitScanContext**

```tsx
const CONTEXT_CARDS = [
  {
    title: 'Wat meet de frictiescore?',
    body: 'De frictiescore geeft aan in welke mate vertrekkers werkgerelateerde belemmeringen ervoeren. Een hogere score betekent meer structurele werkfrictie, niet meer ontevredenheid.',
  },
  {
    title: 'Hoe lees je de factoren?',
    body: 'Factoren met een hoge score en een sterk werksignaal verdienen prioriteit. Een hoge score zonder sterk signaal kan toeval zijn — kijk naar het aantal vertrekkers per factor.',
  },
  {
    title: 'Wat is een representatieve respons?',
    body: 'Bij minder dan 8 ingevulde vragenlijsten zijn uitspraken per factor statistisch kwetsbaar. Gebruik de totaalscore dan als richtlijn, niet de factordetails.',
  },
]

export function ExitScanContext() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CONTEXT_CARDS.map((card) => (
        <div key={card.title} className="border-l-4 border-teal bg-card rounded-card p-6 shadow-card">
          <h3 className="font-display text-sm text-[var(--color-navy)] mb-2">{card.title}</h3>
          <p className="text-sm text-slate leading-relaxed">{card.body}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanContext.tsx
git commit -m "feat(exit-scan): Section 2 — ExitScanContext 'waarom dit telt' cards"
```

---

## Task 5: Section 3 — ExitScanDominantReason

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanDominantReason.tsx`

**Data bindings:** `exitDistribution` from `buildExitPictureDistribution(responses)`

```ts
// Shape expected from buildExitPictureDistribution
interface ExitSegment {
  label: string       // 'Werkfrictie' | 'Trekfactoren' | 'Situationeel'
  count: number
  percentage: number
}
interface ExitDistribution {
  segments: ExitSegment[]
}
```

- [ ] **Step 1: Create ExitScanDominantReason**

```tsx
interface ExitScanDominantReasonProps {
  segments: ExitSegment[]
  totalResponses: number
}

export function ExitScanDominantReason({ segments, totalResponses }: ExitScanDominantReasonProps) {
  const dominant = [...segments].sort((a, b) => b.percentage - a.percentage)[0]
  if (!dominant) return null

  const donutData = segments.map((s, i) => ({
    ...s,
    color: i === 0 ? 'var(--color-teal)' : i === 1 ? '#60A5FA' : '#F472B6',
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="bg-card rounded-card shadow-card p-8 flex justify-center">
        <DonutGauge score={dominant.percentage} size={180} strokeWidth={16} label={`${dominant.percentage}%`} sublabel={dominant.label} />
      </div>
      <div className="bg-navy rounded-card p-8 text-white">
        <p className="text-xs uppercase tracking-widest text-teal mb-3">Dominante vertrekreden</p>
        <h2 className="font-display text-2xl mb-4">{dominant.label}</h2>
        <p className="text-slate text-sm leading-relaxed mb-6">
          {dominant.percentage}% van de vertrekkers noemde {dominant.label.toLowerCase()} als primaire reden. Dit is de grootste categorie van de {totalResponses} ingevulde vragenlijsten.
        </p>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex justify-between text-sm">
              <span className="text-slate">{s.label}</span>
              <span className="font-display text-white">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add imports**

```tsx
import { DonutGauge } from './DonutGauge'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanDominantReason.tsx
git commit -m "feat(exit-scan): Section 3 — ExitScanDominantReason donut + dark card"
```

---

## Task 6: Section 4 — ExitScanFactorCards

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanFactorCards.tsx`

**Data bindings:** `factorScores: FactorScore[]` from existing aggregation in `page.tsx`

```ts
interface FactorScore {
  factor_key: string
  label: string
  score: number          // 0–100
  signal: 'STERK_WERKSIGNAAL' | 'GEMENGD_WERKSIGNAAL' | 'BEPERKT_WERKSIGNAAL'
  count: number
}
```

- [ ] **Step 1: Create ExitScanFactorCards**

```tsx
const SIGNAL_LABEL: Record<string, string> = {
  STERK_WERKSIGNAAL: 'Sterk signaal',
  GEMENGD_WERKSIGNAAL: 'Gemengd signaal',
  BEPERKT_WERKSIGNAAL: 'Beperkt signaal',
}

const SIGNAL_COLOR: Record<string, string> = {
  STERK_WERKSIGNAAL: 'bg-red-100 text-red-700',
  GEMENGD_WERKSIGNAAL: 'bg-yellow-100 text-yellow-700',
  BEPERKT_WERKSIGNAAL: 'bg-green-100 text-green-700',
}

interface ExitScanFactorCardsProps {
  factorScores: FactorScore[]
}

export function ExitScanFactorCards({ factorScores }: ExitScanFactorCardsProps) {
  const top = [...factorScores].sort((a, b) => b.score - a.score).slice(0, 8)
  const high = top.filter((f) => f.score >= 60)
  const mid = top.filter((f) => f.score < 60)

  const renderGroup = (title: string, items: FactorScore[]) => (
    items.length > 0 && (
      <div>
        <h3 className="font-display text-xs uppercase tracking-widest text-slate mb-3">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((f) => (
            <div key={f.factor_key} className="bg-card rounded-card shadow-card p-5">
              <div className="font-display text-2xl text-[var(--color-navy)] mb-1">{f.score}</div>
              <div className="text-sm font-medium text-[var(--color-navy)] mb-2">{f.label}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${SIGNAL_COLOR[f.signal]}`}>
                {SIGNAL_LABEL[f.signal]}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  )

  return (
    <div className="space-y-6">
      {renderGroup('Hoog risico', high)}
      {renderGroup('Middelhoog risico', mid)}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanFactorCards.tsx
git commit -m "feat(exit-scan): Section 4 — ExitScanFactorCards hoog/midden grid"
```

---

## Task 7: Section 5 — ExitScanResponseStats

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanResponseStats.tsx`

**Data bindings:** `stats` object from Supabase `campaign_stats` view

- [ ] **Step 1: Create ExitScanResponseStats**

```tsx
interface ExitScanResponseStatsProps {
  totalResponses: number
  totalInvited: number
  responseRate: number
  strongWorkSignalRate: number   // from computeStrongWorkSignalRate
  scanType: string               // 'exit_baseline' | 'exit_live'
}

export function ExitScanResponseStats({ totalResponses, totalInvited, responseRate, strongWorkSignalRate, scanType }: ExitScanResponseStatsProps) {
  const tiles = [
    { label: 'Ingevuld', value: String(totalResponses) },
    { label: 'Uitgenodigd', value: String(totalInvited) },
    { label: 'Respons', value: `${responseRate}%` },
    { label: 'Sterk werksignaal', value: `${Math.round(strongWorkSignalRate * 100)}%` },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-card rounded-card shadow-card p-6 text-center">
            <div className="font-display text-3xl text-[var(--color-navy)]">{t.value}</div>
            <div className="text-xs text-slate mt-1">{t.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#F0FDF9] border border-teal/30 rounded-card p-4 text-sm text-[var(--color-navy)]">
        {totalResponses < 8
          ? `Let op: met ${totalResponses} ingevulde vragenlijsten zijn factordetails statistisch kwetsbaar. Gebruik de totaalscore als richtlijn.`
          : `Gebaseerd op ${totalResponses} van de ${totalInvited} uitgenodigde vertrekkers (${responseRate}% respons). ${scanType === 'exit_baseline' ? 'Baseline meting.' : 'Live meting.'}`
        }
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanResponseStats.tsx
git commit -m "feat(exit-scan): Section 5 — ExitScanResponseStats 4 stat-tegels"
```

---

## Task 8: Section 6 — ExitScanProgressBars

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanProgressBars.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx` — add `TOETSVRAGEN_MAP`

**Data bindings:** `factorScores`, toetsvragen per factor (static map)

- [ ] **Step 1: Add TOETSVRAGEN_MAP to page-helpers.tsx**

Append at the end of the file:

```ts
export const TOETSVRAGEN_MAP: Record<string, string> = {
  // Werkfrictie
  WF_MANAGEMENT: 'Werd leidinggevend gedrag als belemmering ervaren?',
  WF_WORKLOAD: 'Was de werkdruk structureel te hoog?',
  WF_AUTONOMY: 'Had de vertrekker voldoende zelfstandigheid?',
  WF_COLLABORATION: 'Waren er conflicten of spanningen in het team?',
  WF_GROWTH: 'Was er voldoende doorgroeimogelijkheid?',
  // Trekfactoren
  PL_COMPENSATION: 'Was het salaris marktconform?',
  PL_CULTURE: 'Paste de organisatiecultuur bij de vertrekker?',
  PL_NEWROLE: 'Was de nieuwe functie een bewuste keuze of vlucht?',
  // Situationeel
  S_PERSONAL: 'Speelde een persoonlijke levensgebeurtenis mee?',
  S_RELOCATION: 'Was afstand of locatie een factor?',
  S_CONTRACT: 'Was het contracttype een bepalende factor?',
}
```

- [ ] **Step 2: Create ExitScanProgressBars**

```tsx
import { TOETSVRAGEN_MAP } from '@/app/(dashboard)/campaigns/[id]/page-helpers'

interface ExitScanProgressBarsProps {
  factorScores: FactorScore[]
}

export function ExitScanProgressBars({ factorScores }: ExitScanProgressBarsProps) {
  const sorted = [...factorScores].sort((a, b) => b.score - a.score)

  return (
    <div className="bg-card rounded-card shadow-card p-8 space-y-5">
      <h2 className="font-display text-lg text-[var(--color-navy)]">Factordetail</h2>
      {sorted.map((f) => (
        <div key={f.factor_key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-[var(--color-navy)]">{f.label}</span>
            <span className="font-display text-[var(--color-navy)]">{f.score}</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-1.5">
            <div
              className="bg-teal h-2 rounded-full"
              style={{ width: `${f.score}%` }}
            />
          </div>
          {TOETSVRAGEN_MAP[f.factor_key] && (
            <p className="text-xs text-slate italic">{TOETSVRAGEN_MAP[f.factor_key]}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanProgressBars.tsx \
        frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx
git commit -m "feat(exit-scan): Section 6 — ExitScanProgressBars + TOETSVRAGEN_MAP"
```

---

## Task 9: Section 7 — ExitScanDistribution

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanDistribution.tsx`

**Data bindings:** `exitDistribution.segments` from `buildExitPictureDistribution(responses)`

- [ ] **Step 1: Create ExitScanDistribution**

```tsx
interface ExitScanDistributionProps {
  segments: ExitSegment[]
}

const CATEGORY_COLORS = ['var(--color-teal)', '#60A5FA', '#F472B6']

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Werkfrictie: 'Factoren die direct verband houden met werkinhoud, werkdruk, leidinggevenden of teamdynamiek.',
  Trekfactoren: 'Externe aantrekkingskrachten zoals een beter aanbod, hogere beloning of cultuurfit elders.',
  Situationeel: 'Persoonlijke omstandigheden of levensgebeurtenissen buiten de werksituatie om.',
}

export function ExitScanDistribution({ segments }: ExitScanDistributionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg text-[var(--color-navy)]">Vertrekbeeldverdeling</h2>
      <div className="flex w-full h-6 rounded-full overflow-hidden">
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{ width: `${s.percentage}%`, backgroundColor: CATEGORY_COLORS[i] }}
            title={`${s.label}: ${s.percentage}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {segments.map((s, i) => (
          <div key={s.label} className="bg-card rounded-card shadow-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
              <span className="font-display text-sm text-[var(--color-navy)]">{s.label}</span>
            </div>
            <div className="font-display text-3xl text-[var(--color-navy)] mb-1">{s.percentage}%</div>
            <div className="text-xs text-slate mb-3">{s.count} vertrekkers</div>
            <p className="text-xs text-slate leading-relaxed">{CATEGORY_DESCRIPTIONS[s.label] ?? ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanDistribution.tsx
git commit -m "feat(exit-scan): Section 7 — ExitScanDistribution gestapelde balk + categorie-kaarten"
```

---

## Task 10: Section 8 — ExitScanDriverCards

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanDriverCards.tsx`

**Data bindings:** Top 4 factorScores with subtags derived from `exit_reason_code`

- [ ] **Step 1: Create ExitScanDriverCards**

```tsx
// Subtag map — second-level descriptions per factor
const SUBTAG_MAP: Record<string, string[]> = {
  WF_MANAGEMENT: ['Leiderschapsstijl', 'Feedback', 'Ondersteuning'],
  WF_WORKLOAD: ['Werkdruk', 'Prioriteiten', 'Bezetting'],
  WF_AUTONOMY: ['Beslissingsruimte', 'Micromanagement'],
  WF_GROWTH: ['Doorgroei', 'Leermogelijkheden', 'Perspectief'],
  PL_COMPENSATION: ['Salaris', 'Secundaire voorwaarden'],
  PL_CULTURE: ['Teamdynamiek', 'Waarden', 'Inclusie'],
}

interface ExitScanDriverCardsProps {
  factorScores: FactorScore[]
}

export function ExitScanDriverCards({ factorScores }: ExitScanDriverCardsProps) {
  const top4 = [...factorScores].sort((a, b) => b.score - a.score).slice(0, 4)

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-[var(--color-navy)]">Belangrijkste drijfveren</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {top4.map((f) => (
          <div key={f.factor_key} className="bg-card rounded-card shadow-card p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display text-base text-[var(--color-navy)]">{f.label}</h3>
              <span className="font-display text-2xl text-teal">{f.score}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(SUBTAG_MAP[f.factor_key] ?? []).map((tag) => (
                <span key={tag} className="text-xs bg-[#F1F5F9] text-slate px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanDriverCards.tsx
git commit -m "feat(exit-scan): Section 8 — ExitScanDriverCards 2×2 met subtags"
```

---

## Task 11: Section 9 — ExitScanSDTGauges

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanSDTGauges.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx` — add `computeSDTScores`

**Data bindings:** new `computeSDTScores(responses)` helper

SDT = Self-Determination Theory subcategories derived from `exit_reason_code` prefix mapping.

- [ ] **Step 1: Add computeSDTScores to page-helpers.tsx**

```ts
// SDT mapping: which exit_reason_codes map to which SDT dimension
const SDT_MAP: Record<string, 'autonomie' | 'verbondenheid' | 'competentie'> = {
  WF_AUTONOMY: 'autonomie',
  WF_MANAGEMENT: 'verbondenheid',
  WF_COLLABORATION: 'verbondenheid',
  WF_GROWTH: 'competentie',
  WF_WORKLOAD: 'competentie',
}

export function computeSDTScores(responses: SurveyResponse[]): {
  autonomie: number
  verbondenheid: number
  competentie: number
} {
  const counts = { autonomie: 0, verbondenheid: 0, competentie: 0 }
  const totals = { autonomie: 0, verbondenheid: 0, competentie: 0 }

  for (const r of responses) {
    const dim = SDT_MAP[r.exit_reason_code ?? '']
    if (!dim) continue
    totals[dim] += 1
    // Treat STERK_WERKSIGNAAL as high friction (score 100), GEMENGD as 50, BEPERKT as 0
    const val =
      r.preventability === 'STERK_WERKSIGNAAL' ? 100
      : r.preventability === 'GEMENGD_WERKSIGNAAL' ? 50
      : 0
    counts[dim] += val
  }

  return {
    autonomie: totals.autonomie > 0 ? Math.round(counts.autonomie / totals.autonomie) : 0,
    verbondenheid: totals.verbondenheid > 0 ? Math.round(counts.verbondenheid / totals.verbondenheid) : 0,
    competentie: totals.competentie > 0 ? Math.round(counts.competentie / totals.competentie) : 0,
  }
}
```

- [ ] **Step 2: Create ExitScanSDTGauges**

```tsx
import { DonutGauge } from './DonutGauge'

interface ExitScanSDTGaugesProps {
  autonomie: number
  verbondenheid: number
  competentie: number
}

export function ExitScanSDTGauges({ autonomie, verbondenheid, competentie }: ExitScanSDTGaugesProps) {
  const gauges = [
    { label: 'Autonomie', score: autonomie, desc: 'Mate van zelfstandigheid en beslissingsruimte' },
    { label: 'Verbondenheid', score: verbondenheid, desc: 'Kwaliteit van relaties met leidinggevende en team' },
    { label: 'Competentie', score: competentie, desc: 'Ruimte voor groei en het gebruiken van talenten' },
  ]

  return (
    <div className="bg-card rounded-card shadow-card p-8">
      <h2 className="font-display text-lg text-[var(--color-navy)] mb-6">Basisbehoeften (SDT)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {gauges.map((g) => (
          <div key={g.label} className="flex flex-col items-center text-center">
            <DonutGauge score={g.score} size={120} strokeWidth={10} label={`${g.score}`} sublabel={g.label} />
            <p className="text-xs text-slate mt-3 max-w-[160px]">{g.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanSDTGauges.tsx \
        frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx
git commit -m "feat(exit-scan): Section 9 — SDT gauges + computeSDTScores helper"
```

---

## Task 12: Section 10 — ExitScanFactorTable

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanFactorTable.tsx`

**Data bindings:** full `factorScores` array

- [ ] **Step 1: Create ExitScanFactorTable**

```tsx
import { TOETSVRAGEN_MAP } from '@/app/(dashboard)/campaigns/[id]/page-helpers'

const SIGNAL_BADGE: Record<string, { label: string; cls: string }> = {
  STERK_WERKSIGNAAL: { label: 'Sterk', cls: 'bg-red-100 text-red-700' },
  GEMENGD_WERKSIGNAAL: { label: 'Gemengd', cls: 'bg-yellow-100 text-yellow-700' },
  BEPERKT_WERKSIGNAAL: { label: 'Beperkt', cls: 'bg-green-100 text-green-700' },
}

interface ExitScanFactorTableProps {
  factorScores: FactorScore[]
  totalResponses: number
}

export function ExitScanFactorTable({ factorScores, totalResponses }: ExitScanFactorTableProps) {
  const sorted = [...factorScores].sort((a, b) => b.score - a.score)

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0]">
        <h2 className="font-display text-lg text-[var(--color-navy)]">Volledig factoroverzicht</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="text-left p-4 font-medium text-slate">Factor</th>
              <th className="text-left p-4 font-medium text-slate">Score</th>
              <th className="text-left p-4 font-medium text-slate">Relatief gewicht</th>
              <th className="text-left p-4 font-medium text-slate">Signaalsterkte</th>
              <th className="text-left p-4 font-medium text-slate">Toetsvraag</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const badge = SIGNAL_BADGE[f.signal]
              const weight = totalResponses > 0 ? Math.round((f.count / totalResponses) * 100) : 0
              return (
                <tr key={f.factor_key} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                  <td className="p-4 font-medium text-[var(--color-navy)]">{f.label}</td>
                  <td className="p-4 font-display text-[var(--color-navy)]">{f.score}</td>
                  <td className="p-4 text-slate">{weight}%</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="p-4 text-slate italic text-xs">{TOETSVRAGEN_MAP[f.factor_key] ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanFactorTable.tsx
git commit -m "feat(exit-scan): Section 10 — ExitScanFactorTable volledig factoroverzicht"
```

---

## Task 13: Section 11 — ExitScanMethodNote

**Files:**
- Create: `frontend/components/dashboard/exit-scan/ExitScanMethodNote.tsx`

- [ ] **Step 1: Create ExitScanMethodNote**

```tsx
export function ExitScanMethodNote() {
  return (
    <div className="bg-navy rounded-card p-8 text-white">
      <h3 className="font-display text-base text-teal mb-3 uppercase tracking-widest text-xs">Methodische leesgrenzen</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate leading-relaxed">
        <div>
          <strong className="text-white block mb-1">Causaliteit</strong>
          De frictiescore en factorscores beschrijven patronen — ze verklaren geen individuele vertrekbeslissing en zijn geen bewijs van wanbeleid.
        </div>
        <div>
          <strong className="text-white block mb-1">Representativiteit</strong>
          Vragenlijsten die zijn ingevuld door minder dan 8 vertrekkers hebben beperkte statistische waarde per factor. Gebruik de totaalscore als richtlijn.
        </div>
        <div>
          <strong className="text-white block mb-1">Vertrouwelijkheid</strong>
          Individuele antwoorden zijn nooit herleidbaar. Scores worden alleen getoond bij voldoende anonimiteit (minimaal 3 respondenten per subgroep).
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/ExitScanMethodNote.tsx
git commit -m "feat(exit-scan): Section 11 — ExitScanMethodNote methodische leesgrenzen"
```

---

## Task 14: Barrel export

**Files:**
- Create: `frontend/components/dashboard/exit-scan/index.ts`

- [ ] **Step 1: Create index.ts**

```ts
export { ExitScanHero } from './ExitScanHero'
export { ExitScanContext } from './ExitScanContext'
export { ExitScanDominantReason } from './ExitScanDominantReason'
export { ExitScanFactorCards } from './ExitScanFactorCards'
export { ExitScanResponseStats } from './ExitScanResponseStats'
export { ExitScanProgressBars } from './ExitScanProgressBars'
export { ExitScanDistribution } from './ExitScanDistribution'
export { ExitScanDriverCards } from './ExitScanDriverCards'
export { ExitScanSDTGauges } from './ExitScanSDTGauges'
export { ExitScanFactorTable } from './ExitScanFactorTable'
export { ExitScanMethodNote } from './ExitScanMethodNote'
export { DonutGauge } from './DonutGauge'
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/dashboard/exit-scan/index.ts
git commit -m "feat(exit-scan): barrel export for all exit-scan components"
```

---

## Task 15: Wire all 11 sections into campaigns/[id]/page.tsx

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`

This task replaces the existing ExitScan section rendering (starting at `if (stats.scan_type === "exit")`) with the 11 new components.

- [ ] **Step 1: Add imports at the top of page.tsx**

```tsx
import {
  ExitScanHero,
  ExitScanContext,
  ExitScanDominantReason,
  ExitScanFactorCards,
  ExitScanResponseStats,
  ExitScanProgressBars,
  ExitScanDistribution,
  ExitScanDriverCards,
  ExitScanSDTGauges,
  ExitScanFactorTable,
  ExitScanMethodNote,
} from '@/components/dashboard/exit-scan'
import { computeSDTScores } from './page-helpers'
```

- [ ] **Step 2: Add SDT computation after existing buildExitPictureDistribution call**

Find the line where `buildExitPictureDistribution(responses)` is called and add directly after:

```tsx
const sdtScores = computeSDTScores(responses)
```

- [ ] **Step 3: Replace existing ExitScan JSX block**

Locate the existing `if (stats.scan_type === "exit")` block and replace its inner JSX content with:

```tsx
<div className="space-y-16 py-8">
  <ExitScanHero
    frictionScore={stats.friction_score ?? 0}
    totalResponses={stats.total_responses ?? 0}
    totalInvited={stats.total_invited ?? 0}
    responseRate={stats.response_rate ?? 0}
    campaignName={campaign.name}
  />
  <ExitScanContext />
  <ExitScanDominantReason
    segments={exitDistribution.segments}
    totalResponses={stats.total_responses ?? 0}
  />
  <ExitScanFactorCards factorScores={factorScores} />
  <ExitScanResponseStats
    totalResponses={stats.total_responses ?? 0}
    totalInvited={stats.total_invited ?? 0}
    responseRate={stats.response_rate ?? 0}
    strongWorkSignalRate={strongWorkSignalRate}
    scanType={campaign.scan_type ?? 'exit'}
  />
  <ExitScanProgressBars factorScores={factorScores} />
  <ExitScanDistribution segments={exitDistribution.segments} />
  <ExitScanDriverCards factorScores={factorScores} />
  <ExitScanSDTGauges
    autonomie={sdtScores.autonomie}
    verbondenheid={sdtScores.verbondenheid}
    competentie={sdtScores.competentie}
  />
  <ExitScanFactorTable
    factorScores={factorScores}
    totalResponses={stats.total_responses ?? 0}
  />
  <ExitScanMethodNote />
</div>
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: zero errors in new files. Pre-existing test file errors in `action-center/*.test.ts` are unrelated and can be ignored.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/(dashboard)/campaigns/[id]/page.tsx
git commit -m "feat(exit-scan): wire all 11 Stitch sections into campaign detail page"
```

---

## Task 16: Final verification

- [ ] **Step 1: Start dev server and open a campaign with exit scan data**

```bash
cd frontend && npm run dev
```

Navigate to `http://localhost:3000/dashboard/campaigns/[id]` for a campaign with `scan_type = exit`.

- [ ] **Step 2: Verify each section renders with real data**

Check in order:
1. Section 1: Hero card shows frictiescore gauge with real `friction_score` value (not 0)
2. Section 2: Three "Waarom dit telt" cards visible with teal left border
3. Section 3: Dominant reason donut shows highest segment from real `exitDistribution.segments`
4. Section 4: Factor cards show scores from real `factorScores`, grouped HOOG / MIDDEN
5. Section 5: 4 stat tiles show real values; reading context note shows below tiles
6. Section 6: Progress bars with real scores and toetsvragen labels
7. Section 7: Stacked color bar showing proportions; 3 category cards
8. Section 8: Top 4 driver cards with subtags
9. Section 9: 3 donut gauges from computeSDTScores (may be 0 if no matching codes)
10. Section 10: Full factor table with all columns populated
11. Section 11: Dark navy footer card with 3 methodology paragraphs

- [ ] **Step 3: Verify no placeholder data appears**

No section should show hardcoded scores (e.g., "68", "31", "48") from the Stitch mock — all values must come from real Supabase data.

- [ ] **Step 4: Verify no forbidden terms appear**

Search rendered HTML for:
- "respondenten" → must be "vertrekkers"
- "werkgerelateerde factoren" → must be "werkfrictie"
- "pull factors" → must be "trekfactoren"

- [ ] **Step 5: Verify mobile layout at 375px**

Resize browser to 375px width. All grids should stack to single column. No horizontal scroll.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat(exit-scan): Stitch visual integration complete — all 11 sections live"
git push origin main
```

---

## Acceptance Criteria

| # | Criterium | Verificatie |
|---|-----------|-------------|
| 1 | Alle 11 secties renderen met echte data | Visueel in dev + prod |
| 2 | Geen hardcoded mock-waarden | Grep op `68`, `31`, `48` in gerenderde HTML |
| 3 | TypeScript: zero errors in nieuwe bestanden | `npx tsc --noEmit` |
| 4 | Verboden termen afwezig | Grep op "respondenten", "pull factor", "werkgerelateerde" |
| 5 | Deep Navy `#1B2B3A` voor alle hero cards | DevTools color inspector |
| 6 | Action Teal `#2DD4BF` voor alle accents | DevTools color inspector |
| 7 | Plus Jakarta Sans voor alle font-display elementen | DevTools font inspector |
| 8 | Mobile layout intact op 375px | Chrome DevTools responsive mode |
| 9 | Bestaande data-laag ongewijzigd | Git diff op `page-helpers.tsx` — alleen additions |
| 10 | `computeSDTScores` geëxporteerd en getest | TypeScript check + visuele check Section 9 |

---

## Risk Register

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| `factorScores` shape verschilt van aanname | Midden | Hoog | Lees de actuele shape in `page.tsx` voor Task 4/6/8/10; pas interface aan |
| `computeSDTScores` geeft altijd 0 terug | Hoog | Laag | SDT-mapping werkt alleen als `exit_reason_code` de exacte keys bevat; voeg console.warn toe bij mismatches |
| `friction_score` null in stats | Midden | Midden | `?? 0` fallback aanwezig in alle props; toon lege gauge, niet crash |
| Tailwind v4 herkent geen `var(--color-teal)` in className | Laag | Midden | Gebruik `style={{ backgroundColor: 'var(--color-teal)' }}` als fallback |
| `page.tsx` is te groot voor één edit | Laag | Laag | Split in twee edits: eerst imports + computation, dan JSX swap |
| Font import blokkeert CSP | Midden | Midden | Voeg `fonts.googleapis.com` toe aan CSP `style-src` in `next.config.ts` als fonts niet laden |

---

## Output Report (na voltooiing)

Geef na het uitvoeren van dit plan de volgende samenvatting:

```markdown
## ExitScan Stitch Integration — Afgerond

**Secties geïmplementeerd:** [1–11 of subset]
**Nieuwe bestanden:** [lijst]
**Gewijzigde bestanden:** [lijst]
**TypeScript errors:** [aantal]
**Verboden termen gevonden:** [ja/nee]
**Aanpassingen t.o.v. plan:** [beschrijf afwijkingen]
**Open punten:** [eventueel]
```
