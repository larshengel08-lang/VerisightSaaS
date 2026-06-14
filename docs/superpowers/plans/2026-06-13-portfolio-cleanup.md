# Portfolio Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the public marketing site to the concierge offer — three equal scans (ExitScan, RetentieScan, Onboarding 30-60-90) at €4.500, each "baseline + rapport + begeleide bespreking" — and strip every public reference to removed products and self-serve/ritme language.

**Architecture:** Pure content/presentation changes in the Next.js marketing layer (`frontend/`). We edit the rendered marketing components and one shared content file; we do **not** touch the `marketing-products.ts` data model, and we do **not** delete the standalone product-detail page functions (separate technical-removal track per spec line 172). "Nowhere visible" is achieved at the link/render layer: remove the follow-on accordion and links from `/producten`, the Action Center / follow-on / Cultuurbeeld blocks from `/tarieven`, and neutralize the Action Center label on the homepage. A new file-content regression test pins the cleanup invariants.

**Tech Stack:** Next.js (App Router), React, TypeScript, inline-style marketing components, Vitest.

---

## Decisions baked into this plan (from pre-planning Q&A)

- **Pre-existing red tests:** The suite is already red (9 failures) before any change. Where a failing assertion contradicts this spec we **update the test to match the spec**. The product-page *card-redesign* failures in `app/producten/[slug]/page.test.ts` (expecting `borderRadius: 28`, `cardShadow`, `page: '#FFFFFF'`) belong to a **separate visual-redesign workstream and are explicitly out of scope** — we leave them red and document them.
- **Onboarding classification:** **Copy + visuals only.** `frontend/lib/marketing-products.ts` status/role stay `secondary_live` / `secondary_first_buy_route`. We only raise Onboarding's public price, page structure and presentation to parity with ExitScan/RetentieScan.
- **Removed products** (Pulse, Leadership Scan, Combinatie, Action Center): removed from every **browsable** surface (nav, `/producten`, `/tarieven`, footer, homepage). Their standalone `/producten/[slug]` page functions stay in code, simply unlinked.
- **Cultuurbeeld:** silent availability — `/producten/cultuurbeeld` keeps working and is left untouched; only removed from nav/overzicht/tarieven (it is already absent from nav and footer; we remove its `/tarieven` traces).

## File map (what changes and why)

- `frontend/components/marketing/producten-content.tsx` — Routekiezer: 3 simple cards, remove accordion + per-card bullets + "primary routes" CTA, fix closing CTA.
- `frontend/app/producten/[slug]/page.tsx` — `ExitScanPage`, `RetentionScanPage`, `OnboardingModernPage`: remove the baseline/ritme choice section, replace "Wat u ontvangt" with the 6 service bullets, fix CTA language, sharpen RetentieScan h1, set Onboarding price to €4.500, drop the extra Onboarding comparison section for structural parity.
- `frontend/components/marketing/site-content.ts` — add an `Onboarding 30-60-90 Baseline` entry to `pricingCards` at `vanaf €4.500`.
- `frontend/components/marketing/tarieven-content.tsx` — three equal Baseline cards (incl. Onboarding), remove Action Center card, follow-on table, Cultuurbeeld/ritme traces, fix CTA.
- `frontend/components/marketing/home-page-content.tsx` — relabel the suite-motion "Action Center" phase eyebrow to a neutral "Eerste actie".
- `frontend/lib/marketing-positioning.test.ts` — update the spec-conflicting ExitScan price assertion.
- `frontend/lib/marketing-portfolio-cleanup.test.ts` — **new** regression test for the cleanup invariants.

All commands below run from `frontend/`:

```bash
cd C:/Users/larsh/Desktop/Business/Verisight/frontend
```

---

## Task 1: Regression test for the cleanup invariants (red first)

This file-content test encodes the spec's public-surface invariants. It will be **red** after this task and each later task turns one slice green. It reads source files directly (the existing tests in this repo use the `fs.readFileSync` pattern — see `app/producten/[slug]/page.test.ts`).

**Files:**
- Create: `frontend/lib/marketing-portfolio-cleanup.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
}

// The browsable marketing surface a visitor can navigate to. The standalone
// /producten/[removed-slug] page functions are intentionally excluded — their
// technical removal is a separate track (spec "Buiten scope" line 172).
const BROWSABLE_SURFACE = [
  'components/marketing/producten-content.tsx',
  'components/marketing/tarieven-content.tsx',
  'components/marketing/home-page-content.tsx',
  'components/marketing/public-header.tsx',
  'components/marketing/public-footer.tsx',
  'components/marketing/solutions-dropdown.tsx',
]

const FORBIDDEN_ON_SURFACE = [
  'Pulse',
  'Leadership',
  'Combinatie',
  'Action Center',
  'primary routes',
  'Start scan',
  'Ontdek platform',
  'ritmeroute',
  'reviewcadans',
  'route-inschatting',
]

describe('Portfolio cleanup — browsable surface is free of removed products and self-serve language', () => {
  for (const file of BROWSABLE_SURFACE) {
    it(`${file} contains no forbidden portfolio terms`, () => {
      const source = read(file)
      for (const term of FORBIDDEN_ON_SURFACE) {
        expect(source, `${term} found in ${file}`).not.toContain(term)
      }
    })
  }

  it('Cultuurbeeld is not referenced on /tarieven', () => {
    expect(read('components/marketing/tarieven-content.tsx')).not.toContain('Cultuurbeeld')
  })
})

describe('Portfolio cleanup — /producten routekiezer', () => {
  const source = () => read('components/marketing/producten-content.tsx')

  it('keeps the three scans and drops the follow-on accordion', () => {
    expect(source()).toContain("title: 'ExitScan'")
    expect(source()).toContain("title: 'RetentieScan'")
    expect(source()).toContain("title: 'Onboarding 30-60-90'")
    expect(source()).not.toContain('FollowOnRoutesAccordion')
    expect(source()).not.toContain('UtilityRoutesSection')
  })

  it('uses the kennismaking CTA, not the internal route-inschatting CTA', () => {
    expect(source()).toContain('Plan een kennismaking')
  })
})

describe('Portfolio cleanup — three equal product pages', () => {
  const page = () => read('app/producten/[slug]/page.tsx')

  function slice(from: string, to: string) {
    return page().split(from)[1].split(to)[0]
  }

  it('ExitScan ships the six service bullets and no ritme choice section', () => {
    const exit = page().split('function RetentionScanPage()')[0]
    expect(exit).toContain('Intake en scopebepaling')
    expect(exit).toContain('Survey klaarzetten en launchpakket leveren')
    expect(exit).toContain('Begeleide managementbespreking (60–90 min)')
    expect(exit).toContain('Eerste vervolgrichting vastgelegd')
    expect(exit).not.toContain('Kies baseline of ritmeroute')
    expect(exit).toContain('Bespreek of deze scan past')
  })

  it('RetentieScan ships the six bullets, no ritme section, and a sharpened h1', () => {
    const retention = slice('function RetentionScanPage()', 'function PulsePage()')
    expect(retention).toContain('Intake en scopebepaling')
    expect(retention).toContain('Eerste vervolgrichting vastgelegd')
    expect(retention).not.toContain('Kies baseline of ritmeroute')
    expect(retention).toContain('Bespreek of deze scan past')
    // Sharpened opener: forward-looking behoudsdruk, distinct from Exit's terugblik.
    expect(retention).toContain('voordat uitstroom zichtbaar wordt')
  })

  it('Onboarding is a €4.500 baseline with the six bullets and no ritme/hercheck section', () => {
    const onboarding = slice('function OnboardingModernPage()', 'function OnboardingPage()')
    expect(onboarding).toContain('vanaf €4.500')
    expect(onboarding).not.toContain('op aanvraag')
    expect(onboarding).toContain('Intake en scopebepaling')
    expect(onboarding).toContain('Eerste vervolgrichting vastgelegd')
    expect(onboarding).not.toContain('Kies baseline of hercheckmoment')
    expect(onboarding).toContain('Bespreek of deze scan past')
  })
})

describe('Portfolio cleanup — /tarieven shows three equal baselines', () => {
  const source = () => read('components/marketing/tarieven-content.tsx')

  it('renders Onboarding as a third €4.500 baseline card', () => {
    expect(source()).toContain('Onboarding 30-60-90 Baseline')
    expect(source()).not.toContain('Action Center Start')
    expect(source()).not.toContain('Rest op aanvraag')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts`
Expected: FAIL — multiple assertions fail (forbidden terms still present, accordion still present, Onboarding still `op aanvraag`, etc.).

- [ ] **Step 3: Commit**

```bash
git add lib/marketing-portfolio-cleanup.test.ts
git commit -m "test: add portfolio cleanup regression invariants (red)"
```

---

## Task 2: Simplify `/producten` routekiezer

Rewrite `producten-content.tsx` to three simple cards + a kennismaking closing CTA. Remove the per-card bullets, the follow-on accordion section, and the "Bekijk de primary routes" CTA.

**Files:**
- Modify: `frontend/components/marketing/producten-content.tsx`

- [ ] **Step 1: Replace the imports + `primaryRoutes` data (drop accordion + bullets)**

Replace the top of the file (current lines 1–58) with:

```tsx
'use client'

import Link from 'next/link'
import { AC, Arrow, FF, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'

const primaryRoutes = [
  {
    title: 'ExitScan',
    eyebrow: 'Vertrek begrijpen',
    body: 'Wij brengen vertrekpatronen in beeld en leveren een managementrapport met prioriteiten en een begeleide bespreking.',
    href: '/producten/exitscan',
    accent: AC.deep,
    accentSoft: AC.faint,
  },
  {
    title: 'RetentieScan',
    eyebrow: 'Behoud versterken',
    body: 'Wij laten zien waar behoud onder druk komt te staan voordat uitstroom zichtbaar wordt — met rapport en bespreking.',
    href: '/producten/retentiescan',
    accent: 'oklch(0.50 0.12 188)' as string,
    accentSoft: 'oklch(0.972 0.018 185)' as string,
  },
  {
    title: 'Onboarding 30-60-90',
    eyebrow: 'Goed landen',
    body: 'Wij meten vroeg hoe nieuwe medewerkers landen en leveren een groepsbeeld met een eerste vervolgrichting.',
    href: '/producten/onboarding-30-60-90',
    accent: '#9b5f1e' as string,
    accentSoft: 'oklch(0.97 0.03 70)' as string,
  },
] as const
```

- [ ] **Step 2: Fix the hero CTAs (current lines 139–172)**

Replace the hero's CTA `<div>` block (the `display: 'flex', flexWrap: 'wrap'` row containing the two `<Link>`s) with a single kennismaking CTA:

```tsx
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link
              href={primaryHref}
              style={{
                alignItems: 'center',
                background: T.ink,
                color: '#fff',
                display: 'inline-flex',
                fontSize: 14.5,
                fontWeight: 600,
                gap: 8,
                padding: '12px 28px',
                textDecoration: 'none',
              }}
            >
              Plan een kennismaking <Arrow />
            </Link>
          </div>
```

Also change `ctaSource: 'products_hero_primary'`'s `routeInterest` is fine as-is; leave `primaryHref` definition unchanged.

- [ ] **Step 3: Rewrite `PrimaryRoutesSection` to drop bullets (current lines 179–278)**

Replace the whole `PrimaryRoutesSection` function with:

```tsx
function PrimaryRoutesSection() {
  return (
    <section
      id="route-vergelijking"
      style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0' }}
    >
      <div style={SHELL}>
        <div style={{ marginBottom: 30, textAlign: 'center' }}>
          <h2
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(28px,3.2vw,40px)',
              fontWeight: 700,
              letterSpacing: '-.024em',
              lineHeight: 1.06,
              marginBottom: 14,
              maxWidth: '14ch',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Welke scan past bij uw vraag?
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.74, maxWidth: '58ch', margin: '0 auto' }}>
            ExitScan als vertrek de vraag is. RetentieScan als behoud eerder zichtbaar moet zijn. Onboarding 30-60-90
            als de vroege landing van nieuwe medewerkers aandacht vraagt.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {primaryRoutes.map((route) => (
            <article
              key={route.title}
              style={{
                background: T.white,
                border: `1px solid ${T.rule}`,
                borderTop: `3px solid ${route.accent}`,
                padding: 'clamp(24px,3vw,34px)',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'inline-flex',
                  gap: 8,
                  marginBottom: 18,
                  padding: '4px 10px',
                  background: route.accentSoft,
                  color: route.accent,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                }}
              >
                {route.eyebrow}
              </div>
              <h2
                style={{
                  color: T.ink,
                  fontFamily: FF,
                  fontSize: 'clamp(28px,3vw,38px)',
                  fontWeight: 700,
                  letterSpacing: '-.022em',
                  lineHeight: 1.06,
                  marginBottom: 14,
                }}
              >
                {route.title}
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, marginBottom: 24 }}>{route.body}</p>
              <Link
                href={route.href}
                style={{
                  alignItems: 'center',
                  color: route.accent,
                  display: 'inline-flex',
                  fontSize: 13,
                  fontWeight: 600,
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                Bekijk {route.title} <Arrow />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Delete `UtilityRoutesSection` entirely (current lines 280–309)**

Remove the whole `function UtilityRoutesSection() { ... }` block.

- [ ] **Step 5: Rewrite `ContactSection` closing CTA (current lines 311–330)**

```tsx
function ContactSection() {
  const href = buildContactHref({
    routeInterest: 'exitscan',
    ctaSource: 'products_closing_cta',
  })

  return (
    <MarketingClosingCta
      href={href}
      accentTitle="scan nu past?"
      backdropNumber={null}
      body="In een eerste kennismaking toetsen we welke scan nu de juiste eerste stap is en wat u als eerste terugkrijgt."
      buttonLabel="Plan een kennismaking"
      sectionIndex=""
      sectionLabel=""
      showSectionMark={false}
      title="Twijfelt u welke"
    />
  )
}
```

- [ ] **Step 6: Update the page composition (current lines 332–341)**

Remove `<UtilityRoutesSection />` from the returned JSX:

```tsx
export function ProductenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <PrimaryRoutesSection />
      <ContactSection />
    </div>
  )
}
```

- [ ] **Step 7: Run the `/producten` slice green**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "routekiezer"`
Expected: PASS for the "/producten routekiezer" describe block.

Also run the surface-term test for this file:
Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "producten-content.tsx contains no forbidden"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/marketing/producten-content.tsx
git commit -m "feat: simplify /producten to three-scan routekiezer"
```

---

## Task 3: ExitScan & RetentieScan product pages — drop ritme section, six service bullets, CTA + h1

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx`

The 6 service bullets (identical on all three pages, per spec):

```
Intake en scopebepaling
Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)
Respons monitoren op campagneniveau
Managementrapport met patronen en prioriteiten
Begeleide managementbespreking (60–90 min)
Eerste vervolgrichting vastgelegd
```

- [ ] **Step 1: ExitScan — replace all `Plan een eerste route-inschatting` strings**

In `ExitScanPage` (current lines 398–577) there are four occurrences of `Plan een eerste route-inschatting` (PublicHeader `ctaLabel`, hero `<a>`, "Wat u ontvangt" `<a>`, MarketingClosingCta `buttonLabel`). Replace each with `Bespreek of deze scan past`.

Also replace the closing CTA `note` (current line 571):
```tsx
          note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."
```

- [ ] **Step 2: ExitScan — delete the "Kies baseline of ritmeroute" sub-block**

In the second section (`background: T.paperSoft`, the "Dit is het juiste moment" section), delete the `<div style={{ borderTop: \`1px solid ${T.rule}\`, paddingTop: 28 }}>` block that starts at the "Kies baseline of ritmeroute" eyebrow (current lines 479–518) — i.e. remove from `<div style={{ borderTop: ... paddingTop: 28 }}>` through its closing `</div>` just before the section's closing `</div></div></section>`. Keep the "juiste moment" cards grid above it.

- [ ] **Step 3: ExitScan — replace the 3-item "Wat u ontvangt" list with the 6 service bullets**

In the "Wat u ontvangt" section, replace the array passed to `.map` (current lines 533–537, the three-item list) with the six bullets:

```tsx
                  {[
                    'Intake en scopebepaling',
                    'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',
                    'Respons monitoren op campagneniveau',
                    'Managementrapport met patronen en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste vervolgrichting vastgelegd',
                  ].map((item, i) => (
```

Leave the `segment-deep-dive` annotation box below it unchanged.

- [ ] **Step 4: RetentieScan — sharpen the h1**

In `RetentionScanPage` (current line 607–609), replace the h1 text:

```tsx
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Wij laten vooraf zien waar behoud onder druk komt te staan, voordat uitstroom zichtbaar wordt. U weet wat u als eerste kunt aanpakken.
                </h1>
```

- [ ] **Step 5: RetentieScan — replace CTA strings, delete ritme block, six bullets**

Same three edits as ExitScan, inside `RetentionScanPage` (current lines 579–757):
- Replace the four `Plan een eerste route-inschatting` occurrences with `Bespreek of deze scan past`.
- Replace the closing CTA `note` (current line 752) with `note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."`
- Delete the "Kies baseline of ritmeroute" sub-block (current lines 660–699).
- Replace the 3-item "Wat u ontvangt" list (current lines 714–718) with the same six bullets array from Step 3.

- [ ] **Step 6: Run the product-page slices green**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "ExitScan ships"`
Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "RetentieScan ships"`
Expected: PASS for both.

- [ ] **Step 7: Commit**

```bash
git add app/producten/[slug]/page.tsx
git commit -m "feat: ExitScan + RetentieScan to concierge service structure"
```

---

## Task 4: Onboarding page — €4.500 parity, drop ritme + comparison sections, six bullets

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx` (function `OnboardingModernPage`, current lines 1179–1409)

- [ ] **Step 1: Set the price to €4.500**

Current line 1223:
```tsx
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.amber, marginBottom: 16 }}>op aanvraag {'•'} Baseline</div>
```
Replace with:
```tsx
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.amber, marginBottom: 16 }}>vanaf €4.500 {'•'} Baseline</div>
```

- [ ] **Step 2: Replace CTA strings**

Replace the three `Plan een eerste route-inschatting` occurrences in `OnboardingModernPage` (PublicHeader `ctaLabel` line 1193, hero `<a>` line 1214, "Wat u ontvangt" `<a>` line 1333) with `Bespreek of deze scan past`.

Replace the MarketingClosingCta `buttonLabel` (line 1402) with `buttonLabel="Bespreek of deze scan past"` and the `note` (line 1403) with `note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."`

Change the "Wat u ontvangt" secondary link (current lines 1335–1337) from `/producten/retentiescan` / `Bekijk RetentieScan` to `/tarieven` / `Bekijk tarieven` for parity:
```tsx
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
```

- [ ] **Step 3: Delete the "Kies baseline of hercheckmoment" sub-block**

In the "Wanneer Onboarding 30-60-90 nu de juiste eerste stap is" section, delete the `<div style={{ borderTop: ... paddingTop: 28 }}>` block starting at the "Kies baseline of hercheckmoment" eyebrow (current lines 1259–1298).

- [ ] **Step 4: Replace the 3-item "Wat u ontvangt" list with the six bullets**

Current lines 1313–1316 (the three-item array) → the six-bullet array from Task 3 Step 3.

- [ ] **Step 5: Delete the extra "Onboarding naast RetentieScan" comparison section (structural parity)**

Spec requires all three pages to share the structure Hero → Wanneer logisch → Wat u ontvangt → Closing CTA. Delete the entire fourth `<section style={{ background: T.paperSoft ...}}>` block (current lines 1343–1393) that contains the "Onboarding naast RetentieScan" comparison table and the "Wat onboarding wel belooft" panel. The page then flows Hero → Wanneer → Wat u ontvangt → `MarketingClosingCta`.

- [ ] **Step 6: Run the Onboarding slice green**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "Onboarding is a"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/producten/[slug]/page.tsx
git commit -m "feat: Onboarding page to €4.500 baseline parity"
```

---

## Task 5: `/tarieven` — three equal baselines, remove Action Center / follow-on / Cultuurbeeld / ritme

**Files:**
- Modify: `frontend/components/marketing/site-content.ts`
- Modify: `frontend/components/marketing/tarieven-content.tsx`

- [ ] **Step 1: Add an Onboarding baseline card to `pricingCards`**

In `site-content.ts`, the `pricingCards` array (current lines 539–575) ends after the `Loep Culture Assessment Baseline` object. Insert a new entry **after** the RetentieScan object and before the Culture object (order doesn't matter for `.find`, but keep the three baselines grouped). Add:

```ts
  {
    eyebrow: 'Onboarding 30-60-90 Baseline',
    price: 'vanaf €4.500',
    description:
      'De gerichte eerste instap voor organisaties die vroeg willen zien hoe nieuwe medewerkers landen, met een groepsbeeld op de eerste 30, 60 en 90 dagen en een begeleide managementbespreking.',
    bullets: [
      'Scan uitsturen en bewaken door Loep',
      'Managementrapport met patronen en prioriteiten',
      'Begeleide managementbespreking (60–90 min)',
      'Eerste vervolgrichting vastgelegd',
    ],
  },
```

- [ ] **Step 2: Rebuild the tarieven data selectors (current lines 8–44)**

Replace the top-of-file data block in `tarieven-content.tsx` (current lines 8–44, from `const primaryPricingCards = ...` through the `formatFollowOnTitle` helper) with a three-card selector and no follow-on/Action Center data:

```tsx
const primaryPricingCards = pricingCards.filter(
  (item) =>
    item.eyebrow === 'ExitScan Baseline' ||
    item.eyebrow === 'RetentieScan Baseline' ||
    item.eyebrow === 'Onboarding 30-60-90 Baseline',
)

function formatPricingPrice(price: string) {
  return price
}
```

Remove the now-unused imports `pricingAddOns` and `pricingFollowOnRoutes` from the import on current line 6 (keep `pricingCards`):

```tsx
import { pricingCards } from '@/components/marketing/site-content'
```

- [ ] **Step 3: Make the hero pricing rail and FirstBuySection 3-up**

`HeroSection` and `FirstBuySection` already `.map(primaryPricingCards)`, so they pick up the third card automatically. Change the `FirstBuySection` grid (current line 180) from two to three columns:

```tsx
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" style={{ marginBottom: 24 }}>
```

In `FirstBuySection`, the per-card "Meer over …" link currently branches Exit vs Retention (current lines 206–217). Replace with an Onboarding-aware mapping:

```tsx
              <Link
                href={
                  item.eyebrow.startsWith('ExitScan')
                    ? '/producten/exitscan'
                    : item.eyebrow.startsWith('RetentieScan')
                      ? '/producten/retentiescan'
                      : '/producten/onboarding-30-60-90'
                }
                style={{ fontSize: 13, fontWeight: 600, color: AC.deep, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {item.eyebrow.startsWith('ExitScan')
                  ? 'Meer over ExitScan'
                  : item.eyebrow.startsWith('RetentieScan')
                    ? 'Meer over RetentieScan'
                    : 'Meer over Onboarding 30-60-90'} <Arrow />
              </Link>
```

Update the hero subcopy line and the `FirstBuySection` intro paragraph that say "vertrek of behoud" to include onboarding. Current line 173–176 (`FirstBuySection` intro `<p>`):

```tsx
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '56ch' }}>
            U kiest eerst of de managementvraag over vertrek, behoud of de vroege landing van nieuwe medewerkers gaat.
            Loep vertaalt die vraag naar een Baseline met managementrapport, prioriteiten en een begeleide
            managementbespreking.
          </p>
```

- [ ] **Step 4: Delete `OptionalExpansionSection` and `FollowOnSection`**

Delete the entire `function OptionalExpansionSection()` (current lines 227–304) and `function FollowOnSection()` (current lines 306–356). These hold the Action Center Start card, the "Rest op aanvraag" follow-on table, and the ritme/Cultuurbeeld references.

- [ ] **Step 5: Fix the `CtaBand` CTA label**

Current line 382: replace `Plan een eerste route-inschatting` with `Plan een kennismaking`.

- [ ] **Step 6: Update `TarievenContent` composition (current lines 395–405)**

Remove the deleted sections from the render:

```tsx
export function TarievenContent() {
  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <FirstBuySection />
      <CtaBand />
    </div>
  )
}
```

- [ ] **Step 7: Run the tarieven slice green**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "three equal baselines"`
Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "tarieven-content.tsx contains no forbidden"`
Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "Cultuurbeeld is not referenced"`
Expected: PASS for all three.

- [ ] **Step 8: Commit**

```bash
git add components/marketing/site-content.ts components/marketing/tarieven-content.tsx
git commit -m "feat: /tarieven shows three equal €4.500 baselines, drops follow-on layers"
```

---

## Task 6: Homepage — neutralize the Action Center phase label

The homepage suite-motion demo labels its third phase "Action Center" (`home-page-content.tsx:1208`). Relabel to the neutral phase name "Eerste actie" so no removed product is named publicly. The animation and content are otherwise untouched.

**Files:**
- Modify: `frontend/components/marketing/home-page-content.tsx`

- [ ] **Step 1: Replace the eyebrow text**

Current line 1208:
```tsx
                            <p className="suite-phase-eyebrow">Action Center</p>
```
Replace with:
```tsx
                            <p className="suite-phase-eyebrow">Eerste actie</p>
```

- [ ] **Step 2: Confirm no other forbidden term remains on the homepage**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts -t "home-page-content.tsx contains no forbidden"`
Expected: PASS. (If it still fails, grep the file for the reported term and neutralize that public string too — none other is expected from the pre-planning grep, which found only line 1208.)

- [ ] **Step 3: Commit**

```bash
git add components/marketing/home-page-content.tsx
git commit -m "feat: drop Action Center label from public homepage suite demo"
```

---

## Task 7: Update the spec-conflicting price test + final QA gate

**Files:**
- Modify: `frontend/lib/marketing-positioning.test.ts`

- [ ] **Step 1: Update the ExitScan price assertion to match the spec**

Current `marketing-positioning.test.ts:101`:
```ts
    expect(exitBaselineCard?.price).toBe('EUR 2.950')
```
Replace with:
```ts
    expect(exitBaselineCard?.price).toBe('vanaf €4.500')
```

This is the one assertion in that file that contradicts the spec (and the existing source). Do **not** change the other assertions in this file — the `Portfolio architecture marketing model` block (onboarding `bounded_peer`, follow-on slugs, length 7) and the card-redesign-era expectations belong to the parallel visual-redesign workstream and are out of scope (decision: leave red, document).

- [ ] **Step 2: Run the price test**

Run: `npx vitest run lib/marketing-positioning.test.ts -t "keeps ExitScan framed as the default first route"`
Expected: PASS (the price assertion now matches the `vanaf €4.500` source).

- [ ] **Step 3: Run the full cleanup regression suite green**

Run: `npx vitest run lib/marketing-portfolio-cleanup.test.ts`
Expected: PASS — all describe blocks green.

- [ ] **Step 4: Document the remaining pre-existing failures**

Run the two files that carry the out-of-scope workstream's expectations and capture the count:

Run: `npx vitest run "app/producten/[slug]/page.test.ts" lib/marketing-positioning.test.ts`
Expected: the **card-redesign** assertions in `page.test.ts` (`borderRadius: 28`, `cardShadow`, `page: '#FFFFFF'`, no `T.paperSoft` sections) and the `Portfolio architecture marketing model` block in `marketing-positioning.test.ts` remain RED. Confirm the count has **not increased** versus the pre-implementation baseline (was 9 failing). Record the remaining failing test names in the PR description as "pre-existing, owned by the product-page visual-redesign workstream (subsystem out of scope here)."

- [ ] **Step 5: Manual browse QA (preview)**

Start the dev server and verify the three browsable surfaces render and contain no removed-product references:
- `/producten` — three cards (ExitScan, RetentieScan, Onboarding), no accordion, "Plan een kennismaking" CTA.
- `/producten/onboarding-30-60-90` — "vanaf €4.500", six service bullets, "Bespreek of deze scan past", no ritme/comparison section.
- `/tarieven` — three €4.500 baseline cards, no Action Center, no follow-on table.
- Homepage suite demo third phase reads "Eerste actie".
- `/producten/cultuurbeeld` — still loads (silent availability).

- [ ] **Step 6: Commit**

```bash
git add lib/marketing-positioning.test.ts
git commit -m "test: align ExitScan baseline price assertion with €4.500 spec"
```

---

## Self-Review

**Spec coverage:**
- Three equal core products at €4.500 → Tasks 3, 4, 5 (pages + tarieven cards). ✓
- Onboarding raised to parity (page, PDF, dashboard) → page + price + tarieven here; **PDF (subsystem 3) and dashboard (subsystem 1) are explicitly out of scope of this spec** and handled by their own plans. ✓ (noted)
- Cultuurbeeld silent availability → left untouched, removed from tarieven; absent from nav/footer already. ✓
- Pulse / Leadership / Combinatie / Action Center off all public pages → `/producten` accordion removed (Task 2), `/tarieven` sections removed (Task 5), homepage label neutralized (Task 6); standalone pages left in code per spec line 172. ✓
- `/producten` routekiezer (hero + 3 cards + closing CTA, no bullets/accordion/"primary routes") → Task 2. ✓
- Product pages structure Hero → Wanneer → Wat u ontvangt (≥6 bullets) → Closing; ritme section removed; RetentieScan h1 sharpened → Tasks 3, 4. ✓
- `/tarieven` three cards, no Action Center / follow-on / Cultuurbeeld / ritme → Task 5. ✓
- Navigation: Solutions dropdown keeps ExitScan/RetentieScan (+Onboarding) and excludes Cultuurbeeld → already the case in `solutions-dropdown.tsx:8-10`; no change needed, covered by the surface-term regression test. ✓
- CTA standard (kennismaking on home/producten/tarieven; "Bespreek of deze scan past" + "Bekijk tarieven" on product pages; forbidden phrases removed) → Tasks 2–6. ✓
- QA grep over the browsable surface → encoded as the regression test in Task 1 + Task 7 gate. ✓
- Naming workstream, branding, and codebase technical removal → explicitly out of scope. ✓

**Placeholder scan:** No TBD/TODO; every code step shows concrete code and exact run commands. ✓

**Type/string consistency:** `primaryPricingCards` selector key `'Onboarding 30-60-90 Baseline'` matches the new `pricingCards` eyebrow added in Task 5 Step 1. The six service bullets string is identical across Tasks 3 and 4. CTA replacement string `Bespreek of deze scan past` is uniform across all product pages. The regression test's `slice('function OnboardingModernPage()', 'function OnboardingPage()')` relies on the still-present (unused, out-of-scope) `OnboardingPage` function as the upper bound — that function is intentionally left in the file. ✓

---

**Note on `€` and `–` characters:** the source files use the literal `€` glyph (`'vanaf €4.500'` already exists in `site-content.ts`) and the literal en-dash `–` in `(60–90 min)`. Use these literal glyphs verbatim in every edit and in the regression test so `toContain` comparisons match exactly — do not substitute `-` for `–` or `€` for `€`.
