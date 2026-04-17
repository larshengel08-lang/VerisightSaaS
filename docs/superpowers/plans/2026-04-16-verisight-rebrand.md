# Verisight Rebrand — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visuele en tekstuele rebrand van de Verisight marketinglaag — nieuwe designtokens, IBM Plex Sans typografie, verbeterde compositie en scherpe Nederlandse B2B-copy op alle marketingpagina's.

**Architecture:** Hybride aanpak — tokens en kritische componenten herbouwen, pagina's bijwerken. Geen wijzigingen aan auth-flow, dashboard, survey, API-routes of backend. De bestaande component-architectuur (marketing-page-shell, marketing-section, site-content.ts) blijft intact; alleen visuele tokens, kleuren, typografie en copy worden vervangen.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, `next/font/google` (IBM Plex Sans), TypeScript

**Spec:** `docs/superpowers/specs/2026-04-16-verisight-rebrand-design.md`

---

## Bestandsoverzicht

| Bestand | Actie | Verantwoordelijkheid |
|---------|-------|----------------------|
| `frontend/app/globals.css` | Modify | Design tokens, kleurvariabelen, Tailwind theme, component-classes |
| `frontend/app/layout.tsx` | Modify | Font-swap: Inter+Sora → IBM Plex Sans |
| `frontend/components/marketing/section-heading.tsx` | Modify | Nieuwe heading-stijl (teal eyebrow, 400-gewicht, ink kleuren) |
| `frontend/components/marketing/public-header.tsx` | Modify | Badge verwijderen, blur weg, CTA teal, warme border |
| `frontend/components/marketing/solutions-dropdown.tsx` | Modify | Blue-600 → teal kleuraccenten |
| `frontend/components/marketing/public-footer.tsx` | Modify | Donkere footer (ink achtergrond), nieuwe structuur |
| `frontend/components/marketing/site-content.ts` | Modify | Alle marketing-copy bijwerken |
| `frontend/app/page.tsx` | Modify | Homepage herschrijven — 9 secties |
| `frontend/app/producten/page.tsx` | Modify | Productoverzicht bijwerken |
| `frontend/app/producten/[slug]/page.tsx` | Modify | ExitScan + RetentieScan detailpagina's |
| `frontend/app/tarieven/page.tsx` | Modify | Tarieven bijwerken — productgroepen |
| `frontend/app/aanpak/page.tsx` | Modify | Aanpakpagina bijwerken |
| `frontend/app/vertrouwen/page.tsx` | Modify | Vertrouwenpagina bijwerken |

**Ongewijzigd:** `app/(auth)/*`, `app/(dashboard)/*`, `app/api/*`, `app/privacy/*`, `app/voorwaarden/*`, `app/dpa/*`, backend, Supabase

---

## Task 1: Design tokens — globals.css

**Files:**
- Modify: `frontend/app/globals.css`

Vervang de huidige `:root` en `@theme inline` blokken, en update de marketing component-classes.

- [ ] **Stap 1: Lees de huidige globals.css**

  ```bash
  # Bevestig de huidige structuur
  head -70 frontend/app/globals.css
  ```

- [ ] **Stap 2: Vervang het `:root` blok**

  Vervang:
  ```css
  :root {
    --background: #ffffff;
    --foreground: #0f172a;
    --marketing-shell: 84rem;
    --marketing-section-space: clamp(3.75rem, 5vw, 5.75rem);
    --marketing-hero-space: clamp(3.25rem, 5vw, 5.5rem);
    --marketing-surface: #ffffff;
    --marketing-surface-soft: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    --marketing-surface-tint: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
    --marketing-surface-dark: linear-gradient(180deg, #12233a 0%, #0f172a 100%);
    --marketing-border: rgba(148, 163, 184, 0.22);
    --marketing-shadow-soft: 0 20px 48px rgba(15, 23, 42, 0.07);
    --marketing-shadow-strong: 0 28px 72px rgba(15, 23, 42, 0.13);
  }
  ```

  Met:
  ```css
  :root {
    /* Brand tokens */
    --ink:        #132033;
    --navy:       #1B2E45;
    --petrol:     #234B57;
    --bg:         #F7F5F1;
    --surface:    #FFFFFF;
    --teal:       #3C8D8A;
    --teal-light: #DCEFEA;
    --text:       #4A5563;
    --muted:      #9CA3AF;
    --border:     #E5E0D6;

    /* Legacy compat */
    --background: var(--surface);
    --foreground: var(--ink);

    /* Layout */
    --marketing-shell: 84rem;
    --marketing-section-space: clamp(4rem, 6vw, 6.5rem);
    --marketing-hero-space: clamp(3.5rem, 5.5vw, 5.75rem);

    /* Shadows */
    --marketing-shadow-soft: 0 20px 48px rgba(19, 32, 51, 0.06);
    --marketing-shadow-strong: 0 28px 72px rgba(19, 32, 51, 0.11);
  }
  ```

- [ ] **Stap 3: Vervang het `@theme inline` blok**

  Vervang:
  ```css
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --font-display: var(--font-display);
  }
  ```

  Met:
  ```css
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-ink: var(--ink);
    --color-navy: var(--navy);
    --color-petrol: var(--petrol);
    --color-bg-warm: var(--bg);
    --color-teal-brand: var(--teal);
    --color-teal-light: var(--teal-light);
    --color-text-body: var(--text);
    --color-muted: var(--muted);
    --color-border-warm: var(--border);
    --font-sans: var(--font-ibm-plex-sans), system-ui, sans-serif;
  }
  ```

- [ ] **Stap 4: Update de `.font-display` class**

  Vervang:
  ```css
  .font-display {
    font-family: var(--font-display), var(--font-inter), sans-serif;
    font-weight: 600;
    letter-spacing: -0.03em;
  }
  ```

  Met:
  ```css
  .font-display {
    font-family: var(--font-ibm-plex-sans), system-ui, sans-serif;
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  ```

- [ ] **Stap 5: Update de `::selection` en `a:focus-visible`**

  Vervang:
  ```css
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  summary:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 3px;
  }

  ::selection {
    background: #dbeafe;
    color: #0f172a;
  }
  ```

  Met:
  ```css
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--teal);
    outline-offset: 3px;
  }

  ::selection {
    background: var(--teal-light);
    color: var(--ink);
  }
  ```

- [ ] **Stap 6: Update marketing-section component classes**

  Vervang de section-tone classes in `@layer components`:
  ```css
  .marketing-section-surface {
    background: var(--bg);
  }

  .marketing-section-tint {
    background: var(--surface);
  }

  .marketing-section-dark {
    background: var(--ink);
    color: var(--bg);
  }

  .marketing-section-navy {
    background: var(--navy);
    color: var(--bg);
  }
  ```

- [ ] **Stap 7: Update `.marketing-panel` border en shadow**

  Vervang de drie panel-classes zodat ze `--border` en `--ink` gebruiken in plaats van `slate` waarden. Voorbeeld:
  ```css
  .marketing-panel {
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: var(--marketing-shadow-soft);
    border-radius: 1rem;
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .marketing-panel-soft {
    border: 1px solid var(--border);
    background: var(--bg);
    box-shadow: var(--marketing-shadow-soft);
    border-radius: 1rem;
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .marketing-panel-dark {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: var(--navy);
    box-shadow: var(--marketing-shadow-strong);
    border-radius: 1rem;
    color: var(--bg);
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  ```

- [ ] **Stap 8: Update `.marketing-stage`**

  Vervang het gradient met flat ink kleur:
  ```css
  .marketing-stage {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: var(--navy);
    box-shadow: var(--marketing-shadow-strong);
    border-radius: 1rem;
    color: var(--bg);
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .marketing-stage::before {
    content: "";
    position: absolute;
    inset: 1px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: calc(1rem - 1px);
    pointer-events: none;
  }

  /* Verwijder het ::after gradient radial-gradient blok volledig */
  ```

- [ ] **Stap 9: Update `padding-inline` voor `.marketing-shell`**

  Vervang:
  ```css
  .marketing-shell {
    margin-inline: auto;
    width: min(100%, var(--marketing-shell));
    padding-inline: clamp(1rem, 2.4vw, 2rem);
  }
  ```

  Met:
  ```css
  .marketing-shell {
    margin-inline: auto;
    width: min(100%, var(--marketing-shell));
    padding-inline: clamp(1.25rem, 3vw, 2.5rem);
  }
  ```

- [ ] **Stap 10: Commit**

  ```bash
  git add frontend/app/globals.css
  git commit -m "rebrand: update design tokens, colours, and section tones in globals.css"
  ```

---

## Task 2: Font-swap — layout.tsx

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Stap 1: Vervang font-imports**

  Vervang:
  ```typescript
  import { Inter, Sora } from 'next/font/google'

  const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
  const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-display' })
  ```

  Met:
  ```typescript
  import { IBM_Plex_Sans } from 'next/font/google'

  const ibmPlexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    display: 'swap',
    variable: '--font-ibm-plex-sans',
  })
  ```

- [ ] **Stap 2: Vervang body className**

  Vervang:
  ```tsx
  <body className={`${inter.variable} ${sora.variable} font-[family-name:var(--font-inter)] bg-white antialiased`}>
  ```

  Met:
  ```tsx
  <body className={`${ibmPlexSans.variable} font-[family-name:var(--font-ibm-plex-sans)] bg-[--bg] antialiased`}>
  ```

- [ ] **Stap 3: Start dev server en verifieer font-laden**

  ```bash
  # Vanuit frontend/
  npm run dev
  ```

  Open http://localhost:3000 in browser. Controleer in DevTools → Network dat IBM Plex Sans wordt geladen (geen Inter of Sora meer).

- [ ] **Stap 4: Commit**

  ```bash
  git add frontend/app/layout.tsx
  git commit -m "rebrand: swap fonts to IBM Plex Sans (300/400/500/600)"
  ```

---

## Task 3: Section Heading component

**Files:**
- Modify: `frontend/components/marketing/section-heading.tsx`

- [ ] **Stap 1: Vervang de volledige component**

  ```tsx
  interface SectionHeadingProps {
    eyebrow: string
    title: string
    description?: string
    align?: 'left' | 'center'
    light?: boolean
  }

  export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    light = false,
  }: SectionHeadingProps) {
    const wrapper = align === 'center' ? 'mx-auto max-w-4xl text-center' : 'max-w-[56rem] text-left'
    const eyebrowColor = light ? 'text-[#DCEFEA]' : 'text-[#3C8D8A]'
    const titleColor = light ? 'text-[#F7F5F1]' : 'text-[#132033]'
    const descriptionColor = light ? 'text-[rgba(247,245,241,0.65)]' : 'text-[#4A5563]'

    return (
      <div className={wrapper}>
        <p className={`text-[0.6rem] font-medium uppercase tracking-[0.14em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
        <h2
          className={`mt-3 max-w-[18ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] leading-[1.15] ${
            align === 'center' ? 'mx-auto' : ''
          } ${titleColor}`}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={`mt-4 max-w-[52ch] text-base leading-relaxed ${
              align === 'center' ? 'mx-auto' : ''
            } ${descriptionColor}`}
          >
            {description}
          </p>
        ) : null}
      </div>
    )
  }
  ```

- [ ] **Stap 2: Verifieer in browser**

  Navigeer naar een pagina die `SectionHeading` gebruikt (bijv. `/aanpak`). Controleer:
  - Eyebrow is teal, klein, spaced
  - H2 is IBM Plex Sans, niet te groot, ink kleur
  - Geen blauwe accenten meer

- [ ] **Stap 3: Commit**

  ```bash
  git add frontend/components/marketing/section-heading.tsx
  git commit -m "rebrand: update SectionHeading to teal eyebrow, ink title, new weights"
  ```

---

## Task 4: Header

**Files:**
- Modify: `frontend/components/marketing/public-header.tsx`

- [ ] **Stap 1: Vervang de header className**

  Vervang:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
  ```

  Met:
  ```tsx
  <header className="sticky top-0 z-50 border-b border-[#E5E0D6] bg-white">
  ```

- [ ] **Stap 2: Verwijder de "Vanaf circa 200 medewerkers" badge**

  Verwijder uit de desktop header:
  ```tsx
  <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 xl:inline-flex">
    Vanaf circa 200 medewerkers
  </span>
  ```

  Verwijder ook uit het mobile menu:
  ```tsx
  <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
    Vanaf circa 200 medewerkers
  </p>
  ```

- [ ] **Stap 3: Update nav-link stijl (desktop)**

  Vervang de nav-wrapper className:
  ```tsx
  <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex">
  ```

  Met:
  ```tsx
  <nav className="hidden items-center gap-1 lg:flex">
  ```

  En update de link-stijlen:
  ```tsx
  className={`rounded-md px-3 py-2 text-sm transition-colors ${
    pathname === link.href
      ? 'text-[#132033] font-medium'
      : 'text-[#4A5563] hover:text-[#132033]'
  }`}
  ```

- [ ] **Stap 4: Update de primaire CTA button (desktop)**

  Vervang:
  ```tsx
  <Link
    href={ctaHref}
    className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
  >
    {ctaLabel}
  </Link>
  ```

  Met:
  ```tsx
  <Link
    href={ctaHref}
    className="inline-flex rounded-md bg-[#3C8D8A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
  >
    {ctaLabel}
  </Link>
  ```

- [ ] **Stap 5: Update de mobile menu stijlen**

  Vervang de mobile menu container:
  ```tsx
  <div
    id="public-mobile-menu"
    className="mt-4 rounded-xl border border-[#E5E0D6] bg-white p-4 shadow-[0_24px_60px_rgba(19,32,51,0.08)] lg:hidden"
  >
  ```

  Update mobile CTA button:
  ```tsx
  <Link
    href={ctaHref}
    onClick={closeMenu}
    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
  >
    {ctaLabel}
  </Link>
  ```

  Verwijder het mobile badge item dat nu ook de `sl:inline-flex` badge vermeldt.

- [ ] **Stap 6: Update mobile hamburger border**

  ```tsx
  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E0D6] bg-white text-[#4A5563] transition-colors hover:text-[#132033] lg:hidden"
  ```

- [ ] **Stap 7: Verifieer in browser**

  Open http://localhost:3000. Controleer:
  - Geen badge naast logo
  - Geen blur-effect
  - Warme border onderaan header
  - Teal CTA button (geen blauw)
  - Nav-links zijn vlak (geen pill-nav)

- [ ] **Stap 8: Commit**

  ```bash
  git add frontend/components/marketing/public-header.tsx
  git commit -m "rebrand: header — remove badge, no backdrop-blur, teal CTA, flat nav"
  ```

---

## Task 5: Solutions dropdown kleuraccenten

**Files:**
- Modify: `frontend/components/marketing/solutions-dropdown.tsx`

- [ ] **Stap 1: Update hover-kleur van product-links**

  Vervang in beide `CORE_MARKETING_PRODUCTS` en `PORTFOLIO_ROUTE_MARKETING_PRODUCTS` maps:
  ```tsx
  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
  ```
  Met:
  ```tsx
  className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F7F5F1]"
  ```

  Vervang product-naam hover-kleur:
  ```tsx
  className="text-sm font-medium text-slate-900 transition-colors group-hover:text-blue-600"
  ```
  Met:
  ```tsx
  className="text-sm font-medium text-[#132033] transition-colors group-hover:text-[#3C8D8A]"
  ```

  Vervang product-description kleur:
  ```tsx
  className="mt-0.5 text-xs leading-snug text-slate-500"
  ```
  Met:
  ```tsx
  className="mt-0.5 text-xs leading-snug text-[#4A5563]"
  ```

- [ ] **Stap 2: Update badge chips (Kern / Route)**

  Vervang `bg-emerald-50 text-emerald-700` en `bg-sky-50 text-sky-700` chips:
  ```tsx
  <span className="inline-flex items-center rounded-full bg-[#DCEFEA] px-2 py-0.5 text-[10px] font-medium text-[#3C8D8A]">
    Kern
  </span>
  ```
  ```tsx
  <span className="inline-flex items-center rounded-full bg-[#E5E0D6] px-2 py-0.5 text-[10px] font-medium text-[#4A5563]">
    Route
  </span>
  ```

- [ ] **Stap 3: Update footer-link in dropdown**

  ```tsx
  <div className="mx-2 mt-2 rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] px-3 py-3">
    <Link
      href="/producten"
      onClick={() => setOpen(false)}
      className="text-sm font-medium text-[#132033] transition-colors hover:text-[#3C8D8A]"
    >
      Bekijk alle producten →
    </Link>
  </div>
  ```

- [ ] **Stap 4: Update section labels in dropdown**

  ```tsx
  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">Kernproducten</p>
  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9CA3AF]">Portfolioroute</p>
  ```

- [ ] **Stap 5: Verifieer dropdown in browser**

  Hover over "Producten" in de header. Controleer: teal hover, geen blauwe accenten, warme achtergrondkleur.

- [ ] **Stap 6: Commit**

  ```bash
  git add frontend/components/marketing/solutions-dropdown.tsx
  git commit -m "rebrand: solutions dropdown — teal accents, warm colours, no blue"
  ```

---

## Task 6: Footer

**Files:**
- Modify: `frontend/components/marketing/public-footer.tsx`

- [ ] **Stap 1: Vervang de volledige footer**

  ```tsx
  import Link from 'next/link'
  import { marketingLegalLinks } from '@/components/marketing/site-content'
  import { Wordmark } from '@/components/marketing/wordmark'

  export function PublicFooter() {
    const productLinks = [
      { href: '/producten/exitscan', label: 'ExitScan' },
      { href: '/producten/retentiescan', label: 'RetentieScan' },
    ]

    const navLinks = [
      { href: '/aanpak', label: 'Aanpak' },
      { href: '/tarieven', label: 'Tarieven' },
      { href: '/vertrouwen', label: 'Vertrouwen' },
    ]

    return (
      <footer className="bg-[#132033] text-[#F7F5F1]">
        <div className="marketing-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">

          {/* Kolom 1 — merk */}
          <div>
            <Wordmark size="sm" light />
            <p className="mt-4 max-w-sm text-sm leading-7 text-[rgba(247,245,241,0.6)]">
              Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen
              aandacht vragen — zodat prioriteiten duidelijk worden.
            </p>
            <p className="mt-5 text-xs text-[rgba(247,245,241,0.35)] uppercase tracking-[0.12em]">
              Voor organisaties met 200+ medewerkers
            </p>
          </div>

          {/* Kolom 2 — producten + navigatie */}
          <div>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] mb-4">
              Producten
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-[#F7F5F1]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] mb-4">
              Navigatie
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-[#F7F5F1]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kolom 3 — legal + contact */}
          <div>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] mb-4">
              Legal &amp; contact
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
              {marketingLegalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={link.href === '/login' ? false : undefined}
                  className="transition-colors hover:text-[#F7F5F1]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <a
              href="mailto:hallo@verisight.nl"
              className="mt-6 block text-sm text-[rgba(247,245,241,0.65)] transition-colors hover:text-[#F7F5F1]"
            >
              hallo@verisight.nl
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(247,245,241,0.08)]">
          <div className="marketing-shell flex flex-col gap-2 py-5 text-xs text-[rgba(247,245,241,0.3)] sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Verisight. Alle rechten voorbehouden.</p>
            <p>Geen trackingcookies op de marketing-site.</p>
          </div>
        </div>
      </footer>
    )
  }
  ```

  > **Let op:** De `Wordmark` component heeft mogelijk een `light` prop nodig voor witte tekst op donkere achtergrond. Controleer `components/marketing/wordmark.tsx` — als er geen `light` prop is, verwijder die dan uit de footer en controleer of de wordmark zichtbaar is op donkere achtergrond. Pas indien nodig de wordmark-component aan.

- [ ] **Stap 2: Verifieer in browser**

  Scroll naar de footer op http://localhost:3000. Controleer:
  - Donkere achtergrond (#132033)
  - Drie kolommen
  - Teal eyebrows boven kolommen
  - Onderbalk iets donkerder

- [ ] **Stap 3: Commit**

  ```bash
  git add frontend/components/marketing/public-footer.tsx
  git commit -m "rebrand: footer — dark ink background, three-column layout, teal labels"
  ```

---

## Task 7: Copy-laag — site-content.ts

**Files:**
- Modify: `frontend/components/marketing/site-content.ts`

- [ ] **Stap 1: Lees het volledige bestand**

  ```bash
  cat frontend/components/marketing/site-content.ts
  ```

- [ ] **Stap 2: Update `marketingPrimaryCta`**

  Vervang:
  ```typescript
  export const marketingPrimaryCta = {
    href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
    label: 'Plan kennismaking',
  } as const
  ```

  Met:
  ```typescript
  export const marketingPrimaryCta = {
    href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
    label: 'Plan een kennismaking',
  } as const
  ```

- [ ] **Stap 3: Update `marketingSecondaryCta`**

  Vervang:
  ```typescript
  export const marketingSecondaryCta = {
    href: '/producten',
    label: 'Bekijk de routes',
  } as const
  ```

  Met:
  ```typescript
  export const marketingSecondaryCta = {
    href: '/producten',
    label: 'Bekijk de producten',
  } as const
  ```

- [ ] **Stap 4: Update `homepageProductRoutes`**

  Vervang de drie entries volledig:
  ```typescript
  export const homepageProductRoutes = [
    {
      name: 'ExitScan',
      title: 'Begrijp waarom medewerkers vertrekken',
      body: 'Breng vertrekpatronen in beeld. Beschikbaar als retrospectieve analyse of live scan.',
      href: '/producten/exitscan',
      accent: 'border-[#E5E0D6] bg-[#F7F5F1]',
      chip: 'Uitstroom',
    },
    {
      name: 'RetentieScan',
      title: 'Zie waar behoud onder druk staat',
      body: 'Vroegtijdig inzicht in retentiesignalen. Beschikbaar als live meting of momentopname.',
      href: '/producten/retentiescan',
      accent: 'border-[#DCEFEA] bg-[#F7F5F1]',
      chip: 'Behoud',
    },
    {
      name: 'Combinatie',
      title: 'Verbind vertrek- en retentieanalyse',
      body: 'Voor organisaties die beide managementvragen hebben en bewust willen combineren.',
      href: '/producten/combinatie',
      accent: 'border-[#E5E0D6] bg-[#F7F5F1]',
      chip: 'Portfolioroute',
    },
  ] as const
  ```

- [ ] **Stap 5: Update `trustItems`**

  Vervang:
  ```typescript
  export const trustItems = [
    'Nederlandse dienst met publieke trust- en legal routes',
    'Primaire dataopslag in EU-regio',
    'Groepsinzichten met minimale n-grenzen',
    'Dashboard en managementrapport in dezelfde leeslijn',
    'Methodische basis vanuit A&O-psychologie',
  ] as const
  ```

  Met:
  ```typescript
  export const trustItems = [
    'Signalen, geen schijnzekerheid',
    'Rapportage op geaggregeerd niveau',
    'Vraagblokken gebaseerd op relevante literatuur',
    'AVG-conform, primaire dataopslag in EU',
    'Vertrouwelijke verwerking — geen koppeling aan individuen in rapportage',
  ] as const
  ```

- [ ] **Stap 6: Update `comparisonCards`**

  Vervang:
  ```typescript
  export const comparisonCards = [
    {
      title: 'Geen generieke survey',
      description: 'Verisight verkoopt geen brede vragenlijst die later nog betekenis moet krijgen, maar een gerichte route voor een concrete managementvraag.',
      outcome: 'De site moet daarom routekeuze en besluitrelevantie sneller duidelijk maken dan een klassieke SaaS-landing of onderzoeksbureau-pagina.',
    },
    {
      title: 'Output die intern doorverteld kan worden',
      description: 'De waarde zit in wat HR, MT en directie straks echt lezen: managementsamenvatting, bestuurlijke handoff, topfactoren en vervolgvraag.',
      outcome: 'Preview en voorbeeldrapporten moeten voelen als echte deliverable-proof, niet als losse demo-UI of feature-illustratie.',
    },
    {
      title: 'Trust als reassurance',
      description: 'Methodiek, privacy en claimsgrenzen zijn belangrijk, maar horen de eerste pitch niet te verdringen.',
      outcome: 'Trust moet compact meebewegen in de flow en pas verdiepen wanneer een buyer wil controleren of doorvragen.',
    },
  ] as const
  ```

  Met:
  ```typescript
  export const comparisonCards = [
    {
      title: 'Gerichte scan, geen brede vragenlijst',
      description: 'Verisight is opgebouwd rondom een specifieke managementvraag — niet een generieke tool die achteraf betekenis moet krijgen.',
      outcome: 'U koopt een gerichte route, geen open instrument.',
    },
    {
      title: 'Output die u intern kunt gebruiken',
      description: 'Dashboard, managementsamenvatting en factoranalyse zijn direct deelbaar met HR, MT en directie.',
      outcome: 'Geen losse datadump — een leesbaar rapport dat intern doorverteld kan worden.',
    },
    {
      title: 'Methodisch onderbouwd, heldere grenzen',
      description: 'Uitkomsten tonen patronen, geen absolute waarheden. We benoemen bewust wat we niet claimen.',
      outcome: 'Bruikbare stuurinformatie zonder schijnzekerheid.',
    },
  ] as const
  ```

- [ ] **Stap 7: Update `trustQuickLinks` in footer**

  Vervang de body-teksten zodat ze korter en zakelijker zijn:
  ```typescript
  export const trustQuickLinks = [
    {
      href: '/vertrouwen',
      label: 'Methodiek en vertrouwelijkheid',
      body: 'Hoe Verisight is opgebouwd en wat u ervan kunt verwachten.',
    },
    {
      href: '/privacy',
      label: 'Privacybeleid',
      body: 'Dataverwerking, bewaartermijnen en AVG-rechten.',
    },
    {
      href: '/dpa',
      label: 'Verwerkersovereenkomst',
      body: 'Standaardtemplate voor formele afstemming.',
    },
  ] as const
  ```

- [ ] **Stap 8: Commit**

  ```bash
  git add frontend/components/marketing/site-content.ts
  git commit -m "rebrand: update copy in site-content.ts — clearer, more direct NL B2B language"
  ```

---

## Task 8: Homepage (`app/page.tsx`)

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Stap 1: Lees de huidige homepage volledig**

  ```bash
  cat frontend/app/page.tsx
  ```

- [ ] **Stap 2: Update Hero-sectie**

  Zoek de hero H1 (huidige tagline) en vervang de copy:

  **H1:** `"Krijg scherp zicht op vertrek- en retentiesignalen"`

  **Subkop:** `"Verisight helpt HR en management scherp zien welke patronen spelen en waar gerichte actie nodig is."`

  **Trust-meta regel:** `"Voor organisaties met 200+ medewerkers"` (verwijder "Vanaf circa 200")

  De hero-achtergrond moet `warm` zijn (gebruik `bg-[#F7F5F1]` of de `marketing-section-surface` class).

  Het rechter hero-element moet één rustig visueel element zijn (rapport/dashboard preview), geen productkeuzkaarten. Verwijder eventuele interactieve productblokken uit de hero.

  Voeg boven de preview een subtiel label toe:
  ```tsx
  <p className="text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">
    Voorbeeld van rapportopbouw
  </p>
  ```

- [ ] **Stap 3: Voeg "Herkenbaar probleem" sectie toe (na hero)**

  Voeg na de hero een nieuwe sectie toe met `bg-white` achtergrond:

  ```tsx
  <section className="bg-white">
    <div className="marketing-shell marketing-section">
      <SectionHeading
        eyebrow="Herkent u dit?"
        title="Signalen zijn er — het patroon nog niet"
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          'Exitsignalen komen versnipperd binnen',
          'Retentierisico\'s worden te laat zichtbaar',
          'Er zijn signalen, maar geen patroon',
          'Stuurinformatie voor MT ontbreekt',
        ].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-5"
          >
            <p className="text-sm leading-relaxed text-[#132033]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  ```

- [ ] **Stap 4: Update de Productkeuze-sectie (sectie 3)**

  De productkeuze-sectie krijgt `bg-[#132033]` achtergrond. Zorg dat:
  - Eyebrow: "Twee scans, één richting" — `text-[#3C8D8A]`
  - Twee productblokken naast elkaar op lichte kaarten
  - CTA-buttons per blok: witte achtergrond, ink tekst (`bg-white text-[#132033]`)
  - 1 CTA per kaart, compact
  - Geen badges of microcopy eronder tenzij variant-info

  Verwijder het Combinatie-blok van de homepage productkeuze — die route is behouden maar niet hoofdprominent op homepage.

- [ ] **Stap 5: Update "Wat het oplevert" sectie (sectie 4)**

  Achtergrond: `bg-[#F7F5F1]`. Drie outcome-blokken:

  ```tsx
  {[
    { title: 'Patronen zichtbaar', body: 'Geen losse signalen meer, maar een herkenbaar beeld van terugkerende thema\'s.' },
    { title: 'Beïnvloedbare factoren', body: 'Zicht op waar actie waarschijnlijk het meeste effect heeft.' },
    { title: 'Stuurinformatie voor MT', body: 'Direct deelbare inzichten voor bespreking met management en directie.' },
  ].map(({ title, body }) => (
    <div key={title} className="flex flex-col gap-2">
      <h3 className="text-base font-medium text-[#132033]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
    </div>
  ))}
  ```

- [ ] **Stap 6: Update "Hoe het werkt" sectie (sectie 5)**

  Achtergrond: `bg-white`. Drie stappen:
  1. "Scan kiezen en inrichten"
  2. "De juiste doelgroep uitnodigen"
  3. "Dashboard en rapport ontvangen"

  Onderschrift: `"Gemiddeld binnen 3 weken operationeel."`

  Stijl per stap: nummer in teal (`text-[#3C8D8A]`), stap-naam in ink.

- [ ] **Stap 7: Update preview-sectie (sectie 6)**

  Voeg label toe boven de PreviewSlider: `"Voorbeeld van rapportopbouw"`.
  Chips onderaan: teal-light achtergrond `bg-[#DCEFEA] text-[#3C8D8A]`.

- [ ] **Stap 8: Update "Voor wie" sectie (sectie 7)**

  Achtergrond: `bg-white` (was donker — nu licht). Drie kolommen HR / MT / Directeur.

- [ ] **Stap 9: Update "Methodiek & vertrouwen" sectie (sectie 8)**

  Achtergrond: `bg-[#F7F5F1]`. Vijf staccato-punten uit `trustItems`.
  Voeg onderaan toe:
  ```tsx
  <Link href="/vertrouwen" className="mt-6 block text-sm text-[#3C8D8A] hover:underline">
    Meer over methodiek en vertrouwelijkheid →
  </Link>
  ```

- [ ] **Stap 10: Update afsluitende CTA (sectie 9)**

  Achtergrond: `bg-white`.
  Koptekst: `"Benieuwd welke signalen in uw organisatie zichtbaar worden?"`
  Primaire CTA: `bg-[#3C8D8A] text-white` — "Plan een kennismaking"
  Secundaire CTA: text-link — "Bekijk voorbeeldrapport"

- [ ] **Stap 11: Verifieer homepage in browser**

  Controleer de volledige homepage volgorde:
  1. Hero — warm achtergrond, H1 correct, preview rechts
  2. Herkenbaar probleem — wit, 4 kaarten
  3. Productkeuze — donker, 2 blokken
  4. Wat het oplevert — warm, 3 outcomes
  5. Hoe het werkt — wit, 3 stappen
  6. Preview — warm, label aanwezig
  7. Voor wie — wit, 3 kolommen
  8. Methodiek — warm, 5 punten + link
  9. CTA — wit, teal button

- [ ] **Stap 12: Commit**

  ```bash
  git add frontend/app/page.tsx
  git commit -m "rebrand: homepage — 9 sections, warm base hero, teal CTAs, correct copy"
  ```

---

## Task 9: Producten-overzicht (`/producten`)

**Files:**
- Modify: `frontend/app/producten/page.tsx`

- [ ] **Stap 1: Lees de huidige pagina**

  ```bash
  cat frontend/app/producten/page.tsx
  ```

- [ ] **Stap 2: Update hero-copy**

  - Eyebrow: "Twee scans, één richting"
  - H1: "Kies de scan die past bij uw vraagstuk"
  - Hero-achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 3: Update de productblokken**

  Twee gelijke blokken naast elkaar (`grid-cols-2`):

  **ExitScan-blok:**
  - Naam + kernvraag: "Begrijp waarom medewerkers vertrekken"
  - 3 bullets: Retrospectief · Live · Segment Deep Dive add-on
  - CTA: "Meer over ExitScan" → `/producten/exitscan` (teal, lichte achtergrond)

  **RetentieScan-blok:**
  - Naam + kernvraag: "Zie waar behoud onder druk staat"
  - 3 bullets: Live meting · Momentopname
  - CTA: "Meer over RetentieScan" → `/producten/retentiescan` (teal)

- [ ] **Stap 4: Update de keuzehulp onderaan**

  Vervang eventuele link naar `/aanpak` door:
  ```tsx
  <div className="mt-12 text-center">
    <p className="text-sm text-[#4A5563]">Twijfelt u welke scan past? Wij helpen u kiezen.</p>
    <Link
      href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_overview_help' })}
      className="mt-3 inline-flex rounded-md bg-[#3C8D8A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
    >
      Plan een kennismaking
    </Link>
  </div>
  ```

- [ ] **Stap 5: Commit**

  ```bash
  git add frontend/app/producten/page.tsx
  git commit -m "rebrand: producten-overzicht — concrete H1, two product blocks, teal CTA"
  ```

---

## Task 10: ExitScan detailpagina

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx`

- [ ] **Stap 1: Lees de huidige detailpagina**

  ```bash
  cat "frontend/app/producten/[slug]/page.tsx"
  ```

- [ ] **Stap 2: Update ExitScan hero-copy**

  Voor slug `exitscan`:
  - H1: "Begrijp waarom medewerkers vertrekken"
  - Subkop vermeldt: "Beschikbaar als retrospectieve analyse of live scan."
  - Achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 3: Zet "Retrospectief vs. live" als tweede sectie**

  Direct na hero, achtergrond `bg-white`, twee kolommen:

  | Retrospectief | Live |
  |---|---|
  | Analyse van vertrek in de afgelopen 12 maanden | Real-time inzicht bij lopend verloop |
  | Geschikt als er al vertrek heeft plaatsgevonden | Geschikt als u patroonvorming vroeg wilt signaleren |
  | Geen actieve respondenten nodig | Respondenten vullen in op moment van vertrek |

- [ ] **Stap 4: Update "Wanneer relevant" sectie (sectie 3)**

  Achtergrond: `bg-[#F7F5F1]`. 4 situaties:
  - Bij structureel verloop
  - Bij voorbereiding op MT-bespreking
  - Bij behoefte aan scherpere stuurinformatie
  - Na reorganisatie of fusie

- [ ] **Stap 5: Update "Wat zichtbaar wordt" sectie (sectie 4)**

  Achtergrond: `bg-white`. Klantentaal (geen onderzoeksjargon):
  - "Waar signalen terugkomen"
  - "Waar frictie zichtbaar is"
  - "Waar actie waarschijnlijk het meeste effect heeft"

- [ ] **Stap 6: Voeg "Uitkomsten" toe als sectie 5**

  Achtergrond: `bg-[#F7F5F1]`. 3 korte business-value punten:
  - Patronen zichtbaar maken
  - Focus aanbrengen in vervolg
  - Gesprekken met HR en MT onderbouwen

- [ ] **Stap 7: Update "Wat u ontvangt" sectie (sectie 6)**

  Achtergrond: `bg-[#132033]`, witte tekst.
  Inhoud: dashboard + managementrapport + toelichting op de uitkomsten.
  CTA: `bg-white text-[#132033]` — "Plan een kennismaking"

- [ ] **Stap 8: Update Segment Deep Dive (sectie 7)**

  Visueel subordinaat: kleiner blok, duidelijk gelabeld als add-on.
  ```tsx
  <div className="mt-4 rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-5">
    <span className="text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">Add-on</span>
    <h3 className="mt-1 text-base font-medium text-[#132033]">Segment Deep Dive</h3>
    <p className="mt-1 text-sm text-[#4A5563]">Verdieping op een specifieke afdeling, functiegroep of locatie.</p>
  </div>
  ```

- [ ] **Stap 9: Commit**

  ```bash
  git add "frontend/app/producten/[slug]/page.tsx"
  git commit -m "rebrand: ExitScan detail — retrospectief/live early, klantentaal, uitkomsten sectie"
  ```

---

## Task 11: RetentieScan detailpagina

**Files:**
- Modify: `frontend/app/producten/[slug]/page.tsx` (RetentieScan slug)

- [ ] **Stap 1: Update RetentieScan hero-copy**

  Voor slug `retentiescan`:
  - H1: "Zie waar behoud en werkfrictie onder druk staan"
  - Subkop: "Beschikbaar als live meting of gerichte momentopname."
  - Achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 2: Update "Wanneer relevant" (sectie 2)**

  Achtergrond: `bg-white`. 3 situaties:
  - Vroeg signaleren voor er sprake is van verloop
  - Na een verandertraject of reorganisatie
  - Bij behoefte aan MT-rapportage over retentierisico's

- [ ] **Stap 3: Update "Wat de scan meet" (sectie 3)**

  Achtergrond: `bg-[#F7F5F1]`. Klantentaal:
  - "Waar frictie zichtbaar wordt"
  - "Welke factoren behoud beïnvloeden"
  - "Waar risico's het grootst zijn"

- [ ] **Stap 4: Voeg "Uitkomsten" toe (sectie 4)**

  Zelfde patroon als ExitScan. 3 business-value punten.

- [ ] **Stap 5: Update "Live vs. momentopname" (sectie 5)**

  Achtergrond: `bg-[#F7F5F1]`. Twee kolommen met helder onderscheid.

- [ ] **Stap 6: Update "Wat u ontvangt" (sectie 6)**

  Zelfde patroon als ExitScan: `bg-[#132033]`, witte tekst, `bg-white text-[#132033]` CTA.

- [ ] **Stap 7: Commit**

  ```bash
  git add "frontend/app/producten/[slug]/page.tsx"
  git commit -m "rebrand: RetentieScan detail — live/momentopname early, klantentaal, uitkomsten"
  ```

---

## Task 12: Tarieven (`/tarieven`)

**Files:**
- Modify: `frontend/app/tarieven/page.tsx`

- [ ] **Stap 1: Lees de huidige pagina**

  ```bash
  cat frontend/app/tarieven/page.tsx
  ```

- [ ] **Stap 2: Update hero-copy**

  - H1: "Transparante tarieven, heldere scope"
  - Subkop: "Vaste tarieven per scanvorm. Geen licenties, heldere scope per traject."
  - Achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 3: Herstructureer de prijskaarten in twee productgroepen**

  Vervang één platte lijst van 5 kaarten door twee groepen:

  ```tsx
  {/* ExitScan groep */}
  <div>
    <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] mb-5">ExitScan</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Retrospectief kaart */}
      {/* Live kaart */}
    </div>
    {/* Segment Deep Dive — kleiner, add-on stijl */}
    <div className="mt-4 rounded-lg border border-dashed border-[#E5E0D6] bg-[#F7F5F1] p-5">
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">Add-on</span>
      <h4 className="mt-1 text-sm font-medium text-[#132033]">Segment Deep Dive</h4>
      {/* prijs + bullets */}
    </div>
  </div>

  {/* RetentieScan groep */}
  <div className="mt-10">
    <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] mb-5">RetentieScan</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Momentopname kaart */}
      {/* Live kaart */}
    </div>
  </div>
  ```

- [ ] **Stap 4: Update "Wat altijd inbegrepen is"**

  Vervang "bespreking" door "toelichting op de uitkomsten":
  ```
  ✓ Dashboard
  ✓ Managementrapport
  ✓ Toelichting op de uitkomsten
  ✓ AVG-conforme dataverwerking
  ```

- [ ] **Stap 5: Update afsluitende CTA**

  "Benieuwd welke variant past?" → "Plan een kennismaking" (teal)

- [ ] **Stap 6: Commit**

  ```bash
  git add frontend/app/tarieven/page.tsx
  git commit -m "rebrand: tarieven — two product groups, add-on subordinate, correct inclusions"
  ```

---

## Task 13: Aanpak (`/aanpak`)

**Files:**
- Modify: `frontend/app/aanpak/page.tsx`

- [ ] **Stap 1: Lees de huidige pagina**

  ```bash
  cat frontend/app/aanpak/page.tsx
  ```

- [ ] **Stap 2: Update hero-copy**

  - H1: "Van eerste contact tot bruikbaar inzicht"
  - Subkop: "Een gestructureerd traject in vijf stappen — zonder onnodige overhead."
  - Achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 3: Update de 5 stappen met nieuwe copy**

  De exacte stapteksten:
  1. **Intake en afstemming** — "We bespreken uw vraagstuk, kiezen de juiste scanvorm en stemmen de scope af."
  2. **Inrichting scan** — "We richten de scan zorgvuldig in en stemmen de opzet af op uw organisatiecontext."
  3. **Dataverzameling** — "We monitoren de respons en houden u op de hoogte van de voortgang."
  4. **Analyse en rapportage** — "We analyseren de uitkomsten en leveren een dashboard en managementrapport."
  5. **Toelichting en vervolgstappen** — "U ontvangt een heldere toelichting op de hoofdlijnen en de meest logische vervolgrichting."

- [ ] **Stap 4: Voeg "Wat u zelf doet" sectie toe**

  Na de stappen, achtergrond `bg-[#F7F5F1]`:
  ```
  Wat van u wordt gevraagd:
  • Intern communiceren over de scan
  • Uitnodigingen versturen naar respondenten
  • Tijdstip voor toelichting inplannen
  ```

- [ ] **Stap 5: Voeg tijdlijn toe**

  Onderschrift in de stappensectie of apart: "Gemiddeld 3 tot 5 weken van intake tot rapport."

- [ ] **Stap 6: Commit**

  ```bash
  git add frontend/app/aanpak/page.tsx
  git commit -m "rebrand: aanpak — 5 steps with careful copy, what client does, timeline"
  ```

---

## Task 14: Vertrouwen (`/vertrouwen`)

**Files:**
- Modify: `frontend/app/vertrouwen/page.tsx`

- [ ] **Stap 1: Lees de huidige pagina**

  ```bash
  cat frontend/app/vertrouwen/page.tsx
  ```

- [ ] **Stap 2: Update hero-copy**

  - H1: "Methodisch zorgvuldig, praktisch bruikbaar"
  - Subkop: "Methodische onderbouwing, heldere grenzen, vertrouwelijke verwerking."
  - Achtergrond: `bg-[#F7F5F1]`

- [ ] **Stap 3: Update Methodiek-sectie copy**

  Vervang "gevalideerde vragen" door:
  > "Vraagblokken gebaseerd op relevante literatuur en bestaande meetrichtingen, inhoudelijk geïnspireerd door arbeids- en organisatiepsychologie."

- [ ] **Stap 4: Voeg "Interpretatie en grenzen" sectie toe**

  Koptekst: "Signalen, geen schijnzekerheid"
  Body: resultaten tonen patronen op groepsniveau, geen absolute waarheden en geen individuele voorspellingen.

- [ ] **Stap 5: Update AVG-sectie — achtergrond `bg-[#132033]`, drie expliciete zinnen**

  ```
  • Rapportage vindt plaats op geaggregeerd niveau.
  • Individuele antwoorden worden niet op naam gerapporteerd.
  • Resultaten zijn bedoeld voor patroonherkenning, niet voor beoordeling van individuen.
  • Primaire dataopslag in EU-regio. Verwerkersovereenkomst beschikbaar.
  ```

- [ ] **Stap 6: Update afsluitende CTA**

  "Vragen over verwerking of methodiek?" → "Neem contact op" (link naar contact/kennismaking)

- [ ] **Stap 7: Commit**

  ```bash
  git add frontend/app/vertrouwen/page.tsx
  git commit -m "rebrand: vertrouwen — clear methodology copy, AVG section dark, no overclaiming"
  ```

---

## Task 15: Toegankelijkheidschecks

**Files:** geen code-wijzigingen — verificatie en correctie indien nodig.

- [ ] **Stap 1: Controleer teal-contrast op wit**

  Gebruik een contrast-checker (bijv. https://webaim.org/resources/contrastchecker/):
  - Foreground: `#3C8D8A` (teal)
  - Background: `#FFFFFF` (wit) — voor CTA-buttons

  Vereiste: minimaal 3:1 voor grote tekst/buttons (WCAG AA Large).

  Als de ratio onder 3:1 valt, gebruik dan `#2d6e6b` als button-kleur op witte achtergrond.

- [ ] **Stap 2: Controleer muted-contrast op warm achtergrond**

  - Foreground: `#9CA3AF` (muted)
  - Background: `#F7F5F1` (bg-warm)

  Vereiste: minimaal 3:1. Als onvoldoende, stel `--muted` in op `#7A8490` in globals.css.

- [ ] **Stap 3: Verifieer IBM Plex Sans 300 alleen op grote desktop koppen**

  Controleer in browser (verklein viewport naar 768px):
  - H1 in de hero mag op mobiel geen font-weight 300 hebben
  - Voeg indien nodig toe aan globals.css:

  ```css
  @media (max-width: 1023px) {
    .marketing-hero-title,
    .marketing-hero-title-home,
    .marketing-hero-title-page,
    .marketing-hero-title-detail {
      font-weight: 400;
    }
  }
  ```

- [ ] **Stap 4: Commit correcties (alleen indien stap 1–3 aanpassingen vereisen)**

  ```bash
  git add frontend/app/globals.css
  git commit -m "rebrand: a11y — adjust contrast values and responsive font-weight for IBM Plex Sans 300"
  ```

---

## Verificatie-checklist (na alle taken)

- [ ] Homepage-volgorde klopt: hero → probleem → productkeuze → uitkomsten → stappen → preview → voor wie → methodiek → CTA
- [ ] Geen blauwe kleuren meer zichtbaar op marketingpagina's (Tailwind blue-* klassen)
- [ ] CTA-systeem consistent: teal op licht, wit op donker
- [ ] Footer is donker (ink achtergrond)
- [ ] Header heeft geen badge, geen blur
- [ ] IBM Plex Sans laadt correct (DevTools → Network → Fonts)
- [ ] Alle Tailwind `slate-*` klassen in marketingcomponenten vervangen door de nieuwe tokens
- [ ] Mobiele weergave is getest op 375px viewport
- [ ] Alle pagina's bevatten nog geldige `<title>` en `<meta description>` (niet geraakt door rebrand)
