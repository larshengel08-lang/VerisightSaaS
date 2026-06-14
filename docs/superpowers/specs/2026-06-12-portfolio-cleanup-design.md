# Portfolio Cleanup — Design Spec
**Datum:** 2026-06-12  
**Status:** Goedgekeurd door gebruiker  
**Subsysteem:** 4 van 5 (volgorde: Portfolio → PDF → Email → Dashboard → Site)

---

## Context

GetLoep is een week geleden gepivot naar een volledig begeleide (concierge) variant. De techniek van alle producten is gebouwd. Dit spec beschrijft de portfoliostrategie en de bijbehorende wijzigingen op de marketingsite — niet de onderliggende productfunctionaliteit.

Het aanbod is: **baseline scan + managementrapport + begeleide managementbespreking**. Geen ritmeroutes, geen reviewcadans, geen follow-on producten in de publieke communicatie.

---

## Productportfolio

### Core producten (drie gelijkwaardig)

| Product | Kleur | Vraag | Prijs |
|---------|-------|-------|-------|
| ExitScan | Amber `#b8873a` | Waarom vertrekken onze medewerkers? | vanaf €4.500 |
| RetentieScan | Teal `#3a8a88` | Waar staat behoud nu onder druk? | vanaf €4.500 |
| Onboarding 30-60-90 | Bruin `#7a5c3a` | Hoe landen onze nieuwe medewerkers? | vanaf €4.500 |

**Vereiste voor Onboarding:** moet qua productpagina, PDF-rapport en dashboard-weergave naar hetzelfde niveau als ExitScan en RetentieScan. Dit is een expliciete vereiste die in de specs voor PDF (subsysteem 3) en Dashboard (subsysteem 1) wordt uitgewerkt.

Elk product heeft:
- Een eigen productpagina (`/producten/[slug]`) met identieke secties: Hero + prijssignaal · Wanneer logisch · Wat u ontvangt · Closing CTA
- Een eigen PDF-rapport (uitgewerkt in subsysteem 3)
- Een eigen weergave in het HR-dashboard (uitgewerkt in subsysteem 1)

### Stille beschikbaarheid

**Cultuurbeeld** — technisch en inhoudelijk gebouwd, maar niet actief gepromoot.

- URL `/producten/cultuurbeeld` blijft werken en vindbaar via directe link
- **Niet** in de navigatie
- **Niet** op `/producten` overzicht
- **Niet** op `/tarieven`
- Geen prijsvermelding op de publieke site
- Alleen bereikbaar via directe link in een verkoopgesprek

Reden: andere koper (directie/board), hoger prijspunt (€6.500), meer salesbegeleiding nodig. Niet de kortste weg naar eerste betalende klant.

### Volledig van de site af

De volgende producten en features worden verwijderd uit alle publieke pagina's — geen accordion, geen verwijzingen, nergens zichtbaar:

- Pulse
- Leadership Scan
- Combinatie
- Action Center

Ze hoeven niet uit de codebase te worden verwijderd (dat is een apart technisch opruimtraject), maar mogen nergens meer zichtbaar zijn voor bezoekers.

---

## Pagina-wijzigingen

### `/producten` — Routekiezer

**Doel:** bezoeker helpt zichzelf in maximaal 10 seconden naar de juiste scan.

**Structuur:**
1. Hero — h1: "Welke vraag speelt nu het sterkst?" + korte subkop
2. Drie gelijke productkaarten (grid, 3 kolommen desktop / 1 kolom mobiel)
3. Closing CTA — "Twijfelt u welke scan nu past?" → kennismaking

**Kaartopbouw (per product):**
- Kleur-eyebrow label (bijv. "Vertrek begrijpen")
- Productnaam
- Één zin wat Loep doet
- Link naar productpagina

**Wat verdwijnt:**
- Accordion met follow-on routes (Pulse, Leadership, Combinatie)
- Huidige bullet-lijsten per kaart (4 bullets per product — te veel overlap met productpagina's)
- "Bekijk de primary routes" CTA-tekst

### `/producten/exitscan`, `/producten/retentiescan`, `/producten/onboarding-30-60-90`

**Gedeelde structuur (alle drie identiek):**

Hero → Wanneer logisch → Wat u ontvangt → Closing CTA

**Wat verdwijnt van alle drie pagina's:**
- "Kies baseline of ritmeroute" sectie — volledig verwijderd. Loep verkoopt nu één ding: baseline + rapport + bespreking. Geen keuzemenu over ritmeroutes, reviewcadans of vervolgstappen.

**"Wat u ontvangt" — dienstgericht, minimaal 6 bullets:**
1. Intake en scopebepaling
2. Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)
3. Respons monitoren op campagneniveau
4. Managementrapport met patronen en prioriteiten
5. Begeleide managementbespreking (60–90 min)
6. Eerste vervolgrichting vastgelegd

**Onboarding-specifiek:** herschrijven naar exact dezelfde visuele template als ExitScan en RetentieScan (inline styles, niet MarketingPageShell). Prijs: vanaf €4.500.

**RetentieScan h1:** eerste helft scherper onderscheiden van ExitScan. Het slot mag als merkpatroon hetzelfde blijven. Richting: terugkijken op vertrek (Exit) vs. vooruitkijken op behoudsdruk (Retentie).

### `/tarieven`

**Toont (drie gelijke kaarten):**
- ExitScan Baseline — vanaf €4.500
- RetentieScan Baseline — vanaf €4.500
- Onboarding 30-60-90 Baseline — vanaf €4.500

**Verdwijnt:**
- Action Center Start pricing-kaart
- Follow-on routes tabel
- Alle verwijzingen naar Cultuurbeeld
- Ritmeroutes en reviewcadans

### Navigatie

- Solutions/Oplossingen dropdown: behouden voor ExitScan en RetentieScan SEO-routes
- Producten-link in nav: blijft, verwijst naar versimpelde `/producten`
- Cultuurbeeld verdwijnt uit dropdown indien aanwezig

---

## CTA-standaard

| Context | CTA-tekst |
|---------|-----------|
| Homepage, /producten, /tarieven (primair) | **Plan een kennismaking** |
| Productpagina's (primair) | **Bespreek of deze scan past** |
| Productpagina's (secundair) | **Bekijk tarieven** |

**Verboden taal** (overal vervangen of verwijderen):
- "Plan een eerste route-inschatting" (route = intern)
- "Bekijk de primary routes" (intern)
- "Start scan" (self-serve)
- "Ontdek platform" (SaaS-taal)
- "Bekijk dashboard" (self-serve)
- "Demo aanvragen" (SaaS-taal)

---

## Naamgeving (aparte workstream)

ExitScan · RetentieScan · Onboarding 30-60-90 zijn intern bruikbare namen maar mogelijk te technisch voor commerciële communicatie. Een afzonderlijk branding-traject bepaalt de definitieve productnamen. Tot die tijd blijven huidige namen staan als placeholder.

---

## QA-vereiste bij implementatie

De implementatie omvat een verplichte grep-check over de volledige frontend-codebase op de volgende termen. Elk gevonden resultaat op publiek-zichtbare pagina's is een blocker:

```
Pulse
Leadership
Combinatie
Action Center
Cultuurbeeld          ← alleen in nav/overzicht/tarieven, niet in /producten/cultuurbeeld zelf
primary routes
platform
dashboard beheren
Start scan
Ontdek platform
ritmeroute
reviewcadans
```

De grep loopt over: `frontend/app/`, `frontend/components/marketing/`, `frontend/lib/` (voor content die in de UI terechtkomt).

---

## Buiten scope van deze spec

- Technische verwijdering van Pulse/Leadership/Combinatie/Action Center uit codebase
- PDF-redesign (subsysteem 3)
- E-mail/deelnemerbeheer (subsysteem 2)
- Dashboard redesign (subsysteem 1)
- Marketingsite overige pagina's — aanpak, vertrouwen, kennismaking (subsysteem 5)
- Branding / naamgeving producten
