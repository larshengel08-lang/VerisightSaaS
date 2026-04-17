# Verisight Rebrand — Design Spec
**Datum:** 2026-04-16  
**Scope:** Visuele en tekstuele rebrand van de Verisight marketinglaag  
**Aanpak:** Hybride — kritische componenten herbouwen, overige bijwerken  
**Functionaliteit:** Behouden. Geen wijzigingen aan routes, auth, surveys, dashboard of backend.

---

## 1. Design Tokens

### Kleurpalet

```css
--ink:        #132033   /* primaire tekst, donkere achtergronden */
--navy:       #1B2E45   /* tweede donker vlak */
--petrol:     #234B57   /* donker accent, hover-states */
--bg:         #F7F5F1   /* warme lichte basis */
--surface:    #FFFFFF   /* kaarten, modals */
--teal:       #3C8D8A   /* CTA's, accenten, tags, focuspunten */
--teal-light: #DCEFEA   /* teal-achtergrond chips, highlights */
--text:       #4A5563   /* body copy */
--muted:      #9CA3AF   /* metadata, labels, trust-tekst */
--border:     #E5E0D6   /* warme border */
```

Gebruik:
- 70% lichte basis (`--bg` / `--surface`)
- 20% donker draagvlak (`--ink` / `--navy` / `--petrol`)
- 10% accent (`--teal` / `--teal-light`)

### Typografie

**Font:** IBM Plex Sans (Google Fonts) — vervangt Sora + Inter

| Rol | Gewicht | Grootte |
|-----|---------|---------|
| H1 standaard | 400 | clamp(2rem, 5vw, 3rem) |
| H1 groot (hero desktop) | 300 | clamp(2.4rem, 6vw, 3.6rem) |
| Nadruk binnen koptekst | 600 | — |
| H2 | 400 | clamp(1.6rem, 3.5vw, 2.2rem) |
| Body / subkoppen | 400 | 1rem / line-height 1.75 |
| Labels / eyebrows | 500 | 0.6rem, letter-spacing 0.14em, uppercase |
| CTA buttons | 500 | 0.82rem |

### CTA-systeem (één vaste regel)

| Context | Primair | Secundair |
|---------|---------|-----------|
| Lichte achtergrond | teal achtergrond, wit tekst | ink tekst-link of ink outline |
| Donkere achtergrond | wit achtergrond, ink tekst | wit tekst-link |

Nooit per sectie ad hoc afwijken van dit systeem.

### Sectiebases (tone-systeem)

| Tone | Achtergrond | Gebruik |
|------|-------------|---------|
| `warm` | `#F7F5F1` | Hero, afwisselende content-secties |
| `plain` | `#FFFFFF` | Default content-secties |
| `dark` | `#132033` | Productkeuze, leveringsbeloften, AVG-blok |
| `navy` | `#1B2E45` | Secundaire donkere secties |

### Sectionele spacing

```css
padding-block: clamp(4rem, 6vw, 6.5rem);
max-width: 84rem;
padding-inline: clamp(1.25rem, 3vw, 2.5rem);
```

### Section heading patroon (consistent op alle pagina's)

```
[eyebrow — teal, uppercase, 0.6rem, letter-spaced]
[H2 — IBM Plex Sans 400, 1.6–2.2rem, ink]
[Subtekst — IBM Plex Sans 400, 1rem, --text, max 52ch]
```

Altijd links uitgelijnd in contentzones. Gecentreerd alleen in standalone CTA-blokken.

---

## 2. Globale Shell

### Header (`public-header.tsx`)

- Achtergrond: `#FFFFFF`, `border-bottom: 1px solid var(--border)` — geen schaduw
- Logo/wordmark links — IBM Plex Sans Semibold, ink
- Nav links midden: **Producten** (dropdown), Aanpak, Tarieven, Vertrouwen
  - "Oplossingen" → vervangen door **"Producten"**
  - Stijl: IBM Plex Sans Regular, `--text`, hover → `--ink`
- Rechts: Login (text-only, muted) + "Plan kennismaking" (teal primaire button, compact)
- "Vanaf circa 200 medewerkers" badge: verwijderd uit header — hoort in de hero
- Sticky, geen blur/glassmorphism

### Footer (`public-footer.tsx`)

- Achtergrond: `#132033`
- 3 kolommen:
  - Verisight (wordmark + korte tagline)
  - Producten (ExitScan, RetentieScan) + Navigatie (Aanpak, Tarieven, Vertrouwen)
  - Legal (Privacy, Voorwaarden, DPA) + contact
- Onderste balk: `#1B2E45`, copyright links, `hallo@verisight.nl` rechts

### Sectiecomponent (`marketing-section.tsx`)

- Vervang gradient-achtergronden door platte kleuren per tone
- Spacing zoals boven gedefinieerd
- Tone-systeem behouden, tokens vervangen

### Section Heading (`section-heading.tsx`)

- Patroon als boven gedefinieerd, consistent toegepast

---

## 3. Homepage (`app/page.tsx`)

9 secties. Elk met één functie. Geen overlap in boodschap.

### 1. Hero — `warm`

**Links:**
- Eyebrow: *(geen, of product-neutraal)*
- H1: *"Krijg scherp zicht op vertrek- en retentiesignalen"*
- Subkop: *"Verisight helpt HR en management scherp zien welke patronen spelen en waar gerichte actie nodig is."*
- Primaire CTA: "Plan een kennismaking" (teal)
- Secundaire CTA: "Bekijk voorbeeldrapport" (text-link)
- Trust-meta: AVG-conform · Vertrouwelijk · Voor organisaties met 200+ medewerkers

**Rechts:** één rustig visueel element — rapport- of dashboardframe (statisch, geen interactie)

> Hero = begrijpen. Sectie 3 = kiezen.

### 2. Herkenbaar probleem — `plain`

- Eyebrow: "Herkent u dit?"
- 4 kaarten in 2×2 grid:
  - Exitsignalen komen versnipperd binnen
  - Retentierisico's worden te laat zichtbaar
  - Er zijn signalen, maar geen patroon
  - Stuurinformatie voor MT ontbreekt
- Geen CTA — puur herkenning

### 3. Productkeuze — `dark`

- Eyebrow: "Twee scans, één richting"
- Twee blokken naast elkaar:
  - **ExitScan** — Begrijp waarom medewerkers vertrekken → /producten/exitscan
  - **RetentieScan** — Zie waar behoud onder druk staat → /producten/retentiescan
- Per blok: 2–3 bullets (retrospectief / live / add-on vs. live / momentopname)
- CTA per blok: witte button (donkere achtergrond) — 1 per kaart, compact, geen badges eronder

### 4. Wat het oplevert — `warm`

- Eyebrow: "Wat u terugkrijgt"
- 3 outcome-blokken in een rij:
  - Patronen zichtbaar — geen losse signalen meer
  - Beïnvloedbare factoren — waar actie zinvol is
  - Stuurinformatie voor MT — direct deelbaar
- Per blok: koptekst + 1 zin, geen bullets

### 5. Hoe het werkt — `plain`

- Eyebrow: "Drie stappen"
- Genummerd 1–3, horizontaal op desktop:
  1. Scan kiezen en inrichten
  2. De juiste doelgroep uitnodigen
  3. Dashboard en rapport ontvangen
- Onderschrift: "Gemiddeld binnen 3 weken operationeel."

### 6. Rapport- en dashboardpreview — `warm`

- Eyebrow: "Wat u ziet"
- PreviewSlider — functionaliteit behouden, visueel bijgewerkt naar nieuwe kleurentaal
- Label boven slider: "Voorbeeld van rapportopbouw"
- Onder slider: 4 teal-chips — management summary · signaalthema's · segmentatie · focusvragen

### 7. Voor wie — `plain`

- Eyebrow: "Voor wie is dit bedoeld"
- 3 kolommen: HR-manager · MT-lid · Directeur
- Per kolom: functie + 1 concrete zin
- Onderaan: "Voor organisaties vanaf circa 200 medewerkers."

### 8. Methodiek & vertrouwen — `warm`

- Eyebrow: "Hoe we werken"
- 5 staccato-punten:
  - Signalen, geen schijnzekerheid
  - Geaggregeerde rapportage
  - Methodische basis
  - AVG-conform
  - Vertrouwelijke verwerking
- Vervolglink: → *"Meer over methodiek en vertrouwelijkheid"* (/vertrouwen)

### 9. Afsluitende CTA — `plain`

- Gecentreerd blok
- Koptekst: *"Benieuwd welke signalen in uw organisatie zichtbaar worden?"*
- Primaire CTA: "Plan een kennismaking" (teal — lichte achtergrond)
- Secundaire CTA: "Bekijk voorbeeldrapport" (text-link)

---

## 4. Productpagina's

### Producten-overzicht (`/producten`)

1. **Hero** `warm` — Eyebrow: "Twee scans, één richting" | H1: *"Kies de scan die past bij uw vraagstuk"*
2. Twee blokken naast elkaar (`plain`):
   - Per blok: naam → kernvraag → 3 bullets (varianten) → CTA "Meer over [product]"
3. Onderaan: *"Twijfelt u welke scan past? Wij helpen u kiezen."* → "Plan een kennismaking" (niet naar /aanpak)

### ExitScan (`/producten/exitscan`)

1. **Hero** `warm` — H1: *"Begrijp waarom medewerkers vertrekken"* | Subkop vermeldt: "Beschikbaar als retrospectieve analyse of live scan."
2. **Retrospectief vs. live** `plain` — twee kolommen — hoofdkoopkeuze, vroeg in de pagina
3. **Wanneer relevant** `warm` — 4 situaties in zakelijke taal:
   - Bij structureel verloop
   - Bij voorbereiding op MT-bespreking
   - Bij behoefte aan scherpere stuurinformatie
   - Na reorganisatie of fusie
4. **Wat zichtbaar wordt** `plain` — klantentaal: *"waar signalen terugkomen"*, *"waar frictie zichtbaar is"*, *"waar actie waarschijnlijk het meeste effect heeft"*
5. **Uitkomsten** `warm` — 3 business-value bullets:
   - Patronen zichtbaar maken
   - Focus aanbrengen in vervolg
   - Gesprekken met HR en MT onderbouwen
6. **Wat u ontvangt** `dark` — dashboard + managementrapport, witte tekst
7. **Segment Deep Dive add-on** `plain` — visueel klein, duidelijk als add-on onder ExitScan
8. **Rapportpreview + CTA** `plain`

### RetentieScan (`/producten/retentiescan`)

1. **Hero** `warm` — H1: *"Zie waar behoud en werkfrictie onder druk staan"* | Subkop: "Beschikbaar als live meting of gerichte momentopname."
2. **Wanneer relevant** `plain` — situaties: vroeg signaleren · na verandertraject · bij behoefte aan MT-rapportage over retentierisico's
3. **Wat de scan meet** `warm` — klantentaal: *"waar frictie zichtbaar wordt"*, *"welke factoren behoud beïnvloeden"*, *"waar risico's het grootst zijn"*
4. **Uitkomsten** `plain` — 3 business-value bullets (zelfde principe als ExitScan)
5. **Live vs. momentopname** `warm` — twee kolommen
6. **Wat u ontvangt** `dark`
7. **Preview + CTA** `plain`

---

## 5. Tarieven (`/tarieven`)

1. **Hero** `warm` — H1: *"Transparante tarieven, heldere scope"* | Subkop: *"Vaste tarieven per scanvorm. Geen licenties, heldere scope per traject."*

2. **Productgroepen** `plain` — twee groepen, niet één platte lijst:

   **ExitScan**
   - Retrospectief — prijs + 3–4 bullets
   - Live — prijs + 3–4 bullets
   - Segment Deep Dive *(add-on — visueel kleiner, subordinaat aan ExitScan)*

   **RetentieScan**
   - Momentopname — prijs + 3–4 bullets
   - Live — prijs + 3–4 bullets

3. **Wat altijd inbegrepen is** `warm` — dashboard, managementrapport, toelichting op de uitkomsten, AVG-verwerking

4. **FAQ tarieven** `plain` — 4–5 vragen accordion: doorlopende kosten · meerdere scans · minimum looptijd

5. **CTA** `plain` — "Benieuwd welke variant past?" → "Plan een kennismaking"

**Designregel tarieven:** Prijzen prominent maar niet schreeuwerig — geen grote kleurblokken rondom bedragen.

---

## 6. Aanpak (`/aanpak`)

1. **Hero** `warm` — H1: *"Van eerste contact tot bruikbaar inzicht"* | Subkop: *"Een gestructureerd traject in vijf stappen — zonder onnodige overhead."*

2. **De 5 stappen** `plain` — genummerd, horizontaal op desktop:
   1. *"We bespreken uw vraagstuk, kiezen de juiste scanvorm en stemmen de scope af."*
   2. *"We richten de scan zorgvuldig in en stemmen de opzet af op uw organisatiecontext."*
   3. *"We monitoren de respons en houden u op de hoogte van de voortgang."*
   4. *"We analyseren de uitkomsten en leveren een dashboard en managementrapport."*
   5. *"U ontvangt een heldere toelichting op de hoofdlijnen en de meest logische vervolgrichting."*

3. **Wat u zelf doet** `warm` — transparant over taakverdeling: uitnodigingen versturen, intern communiceren

4. **Tijdlijn** `plain` — "Gemiddeld 3 tot 5 weken van intake tot rapport"

5. **Vertrouwelijkheid in het proces** `warm` — hoe data verwerkt wordt, wie toegang heeft

6. **CTA** `plain` — "Klaar om te starten?" → "Plan een kennismaking"

---

## 7. Vertrouwen (`/vertrouwen`)

1. **Hero** `warm` — H1: *"Methodisch zorgvuldig, praktisch bruikbaar"* | Subkop: *"Methodische onderbouwing, heldere grenzen, vertrouwelijke verwerking."*

2. **Methodiek** `plain` — factorbenadering, vraagblokken gebaseerd op relevante literatuur en bestaande meetrichtingen, inhoudelijk geïnspireerd door arbeids- en organisatiepsychologie

3. **Interpretatie en grenzen** `warm` — *"Signalen, geen schijnzekerheid"* — resultaten tonen patronen, geen absolute waarheden

4. **Aggregatie en anonimiteit** `plain` — groepsdata, minimale n-grenzen, wat zichtbaar is en wat niet

5. **AVG en vertrouwelijkheid** `dark`:
   - *"Rapportage vindt plaats op geaggregeerd niveau."*
   - *"Individuele antwoorden worden niet op naam gerapporteerd."*
   - *"Resultaten zijn bedoeld voor patroonherkenning, niet voor beoordeling van individuen."*
   - Dataopslag EU, verwerkersovereenkomst beschikbaar

6. **Waarom bruikbaar voor HR en MT** `plain` — 3 punten: direct deelbaar · methodisch onderbouwd · geen academische drempel

7. **CTA** `plain` — "Vragen over verwerking of methodiek?" → "Neem contact op"

---

## 8. Implementatieaanpak (Hybride)

### Herbouwen (kritische impact)
- Design tokens in `globals.css` — volledige tokenvervanging
- Font-import: IBM Plex Sans vervangt Sora + Inter in `layout.tsx`
- `public-header.tsx` — nav-label "Producten", badge-verwijdering, nieuwe stijl
- `public-footer.tsx` — nieuwe structuur en kleurentaal
- `section-heading.tsx` — nieuw patroon, consistent toegepast
- `marketing-hero.tsx` — lichte basis, nieuwe compositie
- `app/page.tsx` — homepage volledig herschreven (9 secties)

### Bijwerken (visueel + copy)
- `marketing-section.tsx` — gradient → platte tones, nieuwe spacing
- `app/producten/page.tsx` — overzichtspagina
- `app/producten/[slug]/page.tsx` — ExitScan en RetentieScan detailpagina's
- `app/tarieven/page.tsx` — productgroepering, add-on subordinaat
- `app/aanpak/page.tsx` — copy en stappenstructuur
- `app/vertrouwen/page.tsx` — methodiek-copy, AVG-copy aangescherpt
- `components/marketing/site-content.ts` — alle copy bijgewerkt

### Ongewijzigd
- Auth-flow, dashboard, survey-proxy, API-routes
- `app/privacy/page.tsx`, `app/voorwaarden/page.tsx`, `app/dpa/page.tsx`
- Backend, Supabase-configuratie, RLS

---

## 9. Openstaande checks vóór implementatie

- [ ] Bevestig of klant live respons kan volgen via dashboard (bepaalt Aanpak stap 3)
- [ ] Bevestig of "toelichting op de uitkomsten" standaard inbegrepen is bij alle varianten
- [ ] IBM Plex Sans beschikbaar via Google Fonts — bevestig laadperformance in productie
- [ ] PreviewSlider: welk rapport toont het voorbeeld — label als "Voorbeeld van rapportopbouw"
- [ ] Combinatie-route (`/producten/combinatie`): behouden maar niet prominent — geen aanpassing nodig tenzij rebrand inconsistentie oplevert

### Toegankelijkheidschecks
- [ ] Contrastcheck `--teal` (#3C8D8A) met witte CTA-tekst — minimaal WCAG AA (4.5:1 voor kleine tekst, 3:1 voor grote tekst/buttons)
- [ ] Contrastcheck `--muted` (#9CA3AF) op `--bg` (#F7F5F1) — minimaal 3:1; indien onvoldoende `--muted` iets donkerder bijstellen
- [ ] IBM Plex Sans 300 alleen op grote desktop-headlines: responsive font-weight via clamp of breakpoint — op viewports onder ~1024px automatisch naar 400
