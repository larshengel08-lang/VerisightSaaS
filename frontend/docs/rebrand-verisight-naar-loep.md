# Rebrand Spec: Verisight → Loep

**Scope:** visuele tokens + naming in display-tekst  
**Uitvoerder:** Codex  
**Raak niet aan:** variabelenamen in CSS/TS, classnames, API-routes, databasevelden, technische identifiers

---

## 1. Naamgeving

### Wat wijzigt
Vervang de merknaam "Verisight" door "Loep" uitsluitend in **display-tekst**:
- `<title>` en `metadata.title` in layout-bestanden
- `metadata.description`
- `metadataBase` URL: `https://www.verisight.nl` → `https://www.loepco.nl`
- Zichtbare tekst in UI-componenten (`<h1>`, `<p>`, `<span>`, JSX-strings, alt-attributen)
- E-mailadressen in display: `@verisight.nl` → `@loepco.nl`

### Wat je NIET aanpast
- Variabelenamen (`verisightClient`, `verisightApi`, etc.)
- CSS-classnames (`.verisight-*` indien aanwezig)
- Importpaden, bestandsnamen, mapnamen
- Database-veldnamen of API-routes
- Comments in code
- Environment variable keys (`VERISIGHT_*`)

### Bestanden met "Verisight" in display-tekst (54 bestanden)
Gebruik een gerichte search-and-replace: zoek op `>Verisight<`, `"Verisight"` in JSX-context, en `Verisight` in metadata-objecten. Niet blindelings globaal replace.

---

## 2. Kleur-tokens

Pas aan in `app/globals.css` — alleen de **waarden**, niet de variabelenamen.

### Primaire token-mapping

| Variabele | Huidig (Verisight) | Nieuw (Loep) |
|---|---|---|
| `--teal` | `#3a7f7d` | `#E8A020` |
| `--teal-light` | `#e4f0ed` | `rgba(232,160,32,0.12)` |
| `--navy` | `#0a192f` | `#0D1B2A` |
| `--ink` | `#1b1c19` | `#0D1B2A` |
| `--bg` | `#fbf9f4` | `#F4F1EA` |
| `--surface` | `#ffffff` | `#ffffff` *(ongewijzigd)* |
| `--text` | `#44474d` | `#4A6070` |
| `--muted` | `#75777e` | `#4A6070` |
| `--border` | `#ded6ca` | `rgba(13,27,42,0.15)` |
| `--brand-accent-deep` | `#6b3a12` | `#B07A10` |
| `--brand-accent-mid` | `#904d10` | `#E8A020` |
| `--brand-accent-soft` | `#fff3e6` | `rgba(232,160,32,0.08)` |

### Dashboard-tokens

| Variabele | Huidig | Nieuw |
|---|---|---|
| `--dashboard-canvas` | `#fbf9f4` | `#F4F1EA` |
| `--dashboard-rail` | `#0a192f` | `#0D1B2A` |
| `--dashboard-ink` | `#1b1c19` | `#0D1B2A` |
| `--dashboard-text` | `#44474d` | `#4A6070` |
| `--dashboard-muted` | `#75777e` | `#4A6070` |
| `--dashboard-accent-soft` | `#fff3e6` | `rgba(232,160,32,0.08)` |
| `--dashboard-accent-soft-border` | `#e8c9a0` | `rgba(232,160,32,0.3)` |
| `--dashboard-accent-strong` | `#904d10` | `#E8A020` |

### Inline hardcoded kleuren in globals.css (ook aanpassen)

| Locatie | Huidig | Nieuw |
|---|---|---|
| `body { background }` | `#FFFCF8` | `#F4F1EA` |
| `.marketing-section-surface` | `#FFFCF8` | `#F4F1EA` |
| `.marketing-section-tint` | `#FFFCF8` | `#F4F1EA` |
| `.marketing-detail-hero` | `#FFFCF8` | `#F4F1EA` |
| `.marketing-footer` border-top | `#20344d` | `rgba(13,27,42,0.4)` |
| `.marketing-button-primary` background | `var(--teal)` | *(volgt teal-token, al gedekt)* |
| `.marketing-button-primary` box-shadow | `rgba(60,141,138,0.18)` | `rgba(232,160,32,0.2)` |
| `.marketing-button-primary:hover` box-shadow | `rgba(60,141,138,0.24)` | `rgba(232,160,32,0.28)` |
| `.marketing-button-primary:hover` background | `#2d6e6b` | `#C88A18` |
| `.marketing-process-card::before` gradient | `var(--teal) … rgba(60,141,138,0.16)` | `#E8A020 … rgba(232,160,32,0.16)` |
| `.dash-nav-item-active` background | `rgba(212,149,106,0.16)` | `rgba(232,160,32,0.16)` |
| `.dash-nav-item-active:hover` background | `rgba(212,149,106,0.22)` | `rgba(232,160,32,0.22)` |
| `.dash-nav-badge-active` background | `rgba(212,149,106,0.28)` | `rgba(232,160,32,0.22)` |
| `.shimmer-text` color | `var(--brand-accent-deep)` | *(volgt token, al gedekt)* |
| `.marketing-text-kicker` color | `var(--teal)` | *(volgt token)* |
| `a:focus-visible` outline | `var(--teal)` | `#E8A020` |
| `::selection` background | `var(--teal-light)` | `rgba(232,160,32,0.15)` |

---

## 3. Typografie

### layout.tsx aanpassen

**Verwijder:**
```tsx
import { IBM_Plex_Sans, Fraunces, Newsreader } from 'next/font/google'
```

**Vervang door:**
```tsx
import { Inter, Inter_Tight } from 'next/font/google'
import localFont from 'next/font/local'
```

**Vervang font-definities:**
```tsx
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-inter-tight',
})
```

JetBrains Mono wordt via Google Fonts geladen in globals.css (zie stap 3b).

**Pas className in `<html>` of `<body>` aan:**
```tsx
// was: className={`${ibmPlexSans.variable} ${newsreader.variable} ${fraunces.variable}`}
// wordt:
className={`${inter.variable} ${interTight.variable}`}
```

### globals.css typografie-tokens aanpassen

In `@theme inline`:
```css
--font-sans:    var(--font-inter), system-ui, sans-serif;
--font-body:    var(--font-inter), system-ui, sans-serif;
--font-display: var(--font-inter-tight), 'Inter', sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

Voeg Google Fonts import toe bovenaan globals.css (na de bestaande `@import "tailwindcss"`):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
```

---

## 4. Border radius

Loep gebruikt scherpe hoeken. Pas de volgende waarden aan in globals.css:

| Component-class | Huidig | Nieuw |
|---|---|---|
| `.marketing-panel` | `0.875rem` | `0` |
| `.marketing-panel-soft` | `0.875rem` | `0` |
| `.marketing-panel-dark` | `0.875rem` | `0` |
| `.marketing-stage` | `0.875rem` | `0` |
| `.marketing-feature-card` | `1.35rem` | `0` |
| `.marketing-stat-card` | `1.35rem` | `0` |
| `.marketing-route-card` | `1.5rem` | `0` |
| `.marketing-route-card-dark` | `1.5rem` | `0` |
| `.marketing-support-note` | `1rem` | `0` |
| `.marketing-link-card` | `1rem` | `0` |
| `.marketing-proof-frame` | `1.75rem` | `0` |
| `.marketing-process-card` | `1.5rem` | `0` |
| `.marketing-process-card::before` border-radius | `1.5rem 1.5rem 0 0` | `0` |
| `.marketing-detail-panel` | `1rem` | `0` |
| `.marketing-detail-panel-soft` | `1rem` | `0` |
| `.marketing-detail-dark-card` | `1rem` | `0` |
| `.marketing-mobile-menu` | `1rem` | `0` |
| `.marketing-mobile-nav-link` | `1rem` | `0` |
| `--dashboard-radius-card` | `0.5rem` | `0` |
| `--dashboard-radius-hero` | `0.5rem` | `0` |

**Behoud pill-radius (9999px)** voor:
- `.marketing-button-primary`
- `.marketing-button-secondary`
- `.marketing-chip`
- `.marketing-chip-dark`
- `.marketing-pill`
- `.dash-nav-item` (0.625rem — behouden)
- `--dashboard-radius-chip: 9999px` (behouden)

---

## 5. Metadata in app/layout.tsx

```tsx
export const metadata: Metadata = {
  title: {
    default: 'Loep',
    template: '%s | Loep',
  },
  description:
    'Loep helpt HR-teams bij organisaties met 200 tot 1.000 medewerkers om vertrek te duiden met ExitScan en behoud eerder zichtbaar te maken met RetentieScan.',
  metadataBase: new URL('https://www.loepco.nl'),
  // overige velden ongewijzigd
}
```

---

## 6. Buiten scope voor Codex

De volgende zaken vereisen handmatige beslissing of aparte taak:
- Logo/wordmark SVG-component (Verisight → Loep wordmark)
- OG-images en favicon
- E-mailsjablonen (Supabase Auth mails)
- Eventuele hardcoded brand-kleuren in afzonderlijke component-bestanden (scan apart na uitvoering)
- Inhoudelijke copy-aanpassingen (positionering, USP's — dit is redactioneel werk)

---

## Checklist voor Codex

- [ ] globals.css: alle token-waarden bijgewerkt (tabel 2)
- [ ] globals.css: alle hardcoded kleuren bijgewerkt (tabel 2b)
- [ ] globals.css: border-radius aangescherpt (tabel 4)
- [ ] globals.css: font-imports en font-variabelen bijgewerkt
- [ ] app/layout.tsx: font-imports vervangen
- [ ] app/layout.tsx: metadata.title, description, metadataBase bijgewerkt
- [ ] 54 bestanden: "Verisight" in display-tekst vervangen door "Loep" (alleen JSX-tekst, metadata-strings, alt-attributen)
- [ ] Geen variabelenamen, classnames, routes of technische identifiers aangeraakt
