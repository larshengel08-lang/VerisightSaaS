# Verisight — Design Spec

## Typografie

| Rol | Font | Gebruik |
|-----|------|---------|
| Display / serif | **Fraunces** (variable, optical) | Headlines, grote getallen, accenten |
| Body / UI | **IBM Plex Sans** | Broodtekst, labels, UI-elementen |

CSS-variabelen: `var(--font-fraunces)`, `var(--font-ibm-plex-sans)`

---

## Kleurpalet

### Accent — Oranje/Rust (primair merkkleur)

| Token | OKLCH | Hex (benadering) | Gebruik |
|-------|-------|-----------------|---------|
| `AC.deep` | `oklch(0.45 0.18 50)` | **`#8c4a00`** | CTA's, actieve states, primaire accenten |
| `AC.mid` | `oklch(0.76 0.14 53)` | `#d4956a` | Secundaire highlights, trend-charts |
| `AC.light` | `oklch(0.86 0.10 55)` | `#e8c09a` | Lichte accenten, rapportage-labels |
| `AC.soft` | `oklch(0.95 0.045 50)` | `#f5e8dc` | Subtiele tintachtergronden |
| `AC.faint` | `oklch(0.976 0.018 50)` | `#fdf6f0` | Hover-states, tag-achtergronden |

> **Primaire merkkleur = `#8c4a00` / `oklch(0.45 0.18 50)`**  
> Ook gebruikt in favicon (oranje V op transparante achtergrond).

---

### Papier & Inkttonen (neutraal fundament)

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `T.white` | `#FFFCF8` | Kaartachtergronden, hero-surface |
| `T.paper` | `oklch(0.978 0.01 62)` | Pagina-achtergrond |
| `T.paperSoft` | `oklch(0.956 0.018 60)` | Sectieachtergrond, tab-headers |
| `T.ink` | `oklch(0.16 0.012 250)` | Primaire tekst, headings |
| `T.inkSoft` | `oklch(0.32 0.01 250)` | Broodtekst |
| `T.inkMuted` | `oklch(0.52 0.008 250)` | Labels, metadata |
| `T.inkFaint` | `oklch(0.70 0.006 250)` | Placeholder, subtiele details |
| `T.rule` | `oklch(0.875 0.012 62)` | Borders, scheidingslijnen |

---

### Teal (secundaire kleur — vertrouwen/status)

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `T.teal` | `oklch(0.50 0.12 188)` | Statusindicatoren, focus-states |
| `T.tealMid` | `oklch(0.62 0.10 185)` | Grafieken, trend-indicators |
| `T.tealFaint` | `oklch(0.972 0.018 185)` | Tag-achtergronden (aandacht-labels) |

---

### SURFACE tokens (hex — niet-hero secties)

| Token | Hex | Gebruik |
|-------|-----|---------|
| `SURFACE.surface` | `#fffdf9` | Kaartachtergrond |
| `SURFACE.paper` | `#f5f0e8` | Sectie-achtergrond |
| `SURFACE.soft` | `#f2ece2` | Subtiele achtergrond |
| `SURFACE.border` | `#ddd6ca` | Borders |
| `SURFACE.ink` | `#132033` | Primaire tekst |
| `SURFACE.text` | `#4d5a66` | Broodtekst |
| `SURFACE.muted` | `#7d887f` | Labels, meta |
| `SURFACE.amber` | `#b95b1f` | Amber-accenten (alternatief voor AC.deep) |
| `SURFACE.amberSoft` | `#f6e4d8` | Amber-tintachtergrond |
| `SURFACE.teal` | `#3a7f7d` | Teal-accenten |
| `SURFACE.tealSoft` | `#e7f0ec` | Teal-tintachtergrond |

---

## Animaties (globals.css keyframes)

| Naam | Effect |
|------|--------|
| `slideUpFade` | Omhoog + fade-in |
| `slideDownFade` | Omlaag + fade-in |
| `scaleIn` | Scale 0.95→1 + fade-in (tab-wissels) |
| `scaleXIn` | Horizontaal uitklappen (accentlijn) |
| `fadeIn` | Simpele fade |
| `marqueeScroll` | Horizontale marquee-loop |
| `shimmer` | Glanzend gradient-sweep (heading-accenten) |
| `ctaPulse` | Zachte pulse (ambient glow-elementen) |

---

## Layout

- **Max-breedte:** `1200–1220px` gecentreerd
- **Horizontale padding:** `clamp(20px, 4vw, 44–48px)`
- **Hero grid:** `1fr` mobiel → `[1fr_520–560px]` desktop (tekst links, preview rechts)
- **Radius:** `0` (vierkante hoeken) in T-token secties; `14–18px` in SURFACE secties

---

## Statusindicatoren (in rapporten)

| Status | Kleur |
|--------|-------|
| Hoog / Direct | `AC.deep` (#8c4a00) op `AC.faint` achtergrond |
| Verhoogd | amber `oklch(.40 .12 65)` op `oklch(.88 .06 75 / .32)` |
| Aandacht | `T.teal` op `T.tealFaint` |
