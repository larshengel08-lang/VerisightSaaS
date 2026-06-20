# HR Onboarding Wizard — Design Spec

**Datum:** 2026-06-20
**Status:** Goedgekeurd, klaar voor implementatieplan

---

## Doel

Het proces van eerste login tot eerste survey-uitstuur drastisch vereenvoudigen voor HR-managers (klanten). De bestaande 5-fasen Routefasen-pagina is intern-logisch maar niet klantgericht. De wizard vervangt die view voor klanten met een lineaire 3-stappen-kaart.

---

## Probleemstelling

Een nieuwe klant logt in en ziet "Je campagne staat klaar" met de CTA "Campagne klaarzetten". Beide teksten zijn vaag. De Routefasen-pagina achter die knop toont 5 abstracte fasen met "WACHT"-badges. Een HR-manager zonder platformervaring weet niet waar te beginnen.

---

## Scope

**In scope:**
- 3-stappen-wizard als nieuwe dashboard-state (`setup`) voor klanten
- Stap 1: startdatum + aantal deelnemers + testlink
- Stap 2: uitnodigingstekst kopiëren + bevestigen (hergebruikt bestaande self-send panel)
- Stap 3: bestaande dashboard-view (respons, herinnering, afsluiten)
- Redirect `/campaigns/[id]/beheer` → `/campaigns/[id]` voor niet-admin gebruikers
- Stap 3 eindigt met expliciete "Rapport via Loep" CTA (geen zelfstandige download-suggestie)

**Buiten scope:**
- Wijzigingen aan backend, database of RLS
- Einddatum instellen door HR (wordt door Loep-admin ingesteld in offerte-traject)
- E-mail versturen door het platform (self-send blijft standaard)
- Managed flow (platform verstuurt) — default blijft `self_send`

---

## Architectuur

### State-logica

De wizard is een nieuwe state `setup` in `resolveDashboardState`:

```
launch_confirmed_at = null  →  state = 'setup'  (wizard actief)
launch_confirmed_at = gezet →  state = bestaande states (live, waiting_for_responses, etc.)
```

### Stap-unlocking

| Stap | Unlock-conditie |
|------|----------------|
| Stap 1 | Altijd open bij `state = 'setup'` |
| Stap 2 | `launch_date` + `invited_count` beide ingevuld |
| Stap 3 | `launch_confirmed_at` gezet — wizard verdwijnt, normale dashboard-view |

### Componentstructuur

```
DashboardStateCard (state = 'setup')
  └── SetupWizardCard
        ├── WizardStep1 (startdatum, deelnemers, testlink, checkbox)
        ├── WizardStep2 (self-send kopieerblok — hergebruikt SelfSendSetupPanel)
        └── WizardStep3 (informatief: "na lancering monitor je hier de respons")
```

### Data-schrijfacties

- **Stap 1 opslaan:** Server action → `delivery_records.launch_date` + `delivery_records.invited_count`
- **Stap 2 bevestigen:** Bestaande `confirmReminderSentAction` of nieuwe `confirmLaunchAction` → `delivery_records.launch_confirmed_at`
- **Beheer-redirect:** Server-side in `campaigns/[id]/beheer/page.tsx` — check `isVerisightAdmin`, redirect naar `/campaigns/[id]` als false

---

## Stap 1 — Startdatum instellen

### Velden

| Veld | Type | Verplicht | Validatie |
|------|------|-----------|-----------|
| Startdatum | date picker | Ja | Niet in het verleden |
| Aantal deelnemers | number input | Ja | Min. 1 |

### Testlink-blok

- Survey-link zichtbaar als monospace tekst (kopieerbaar)
- "Test link" knop opent link in nieuw tabblad
- Checkbox: "Ik heb de link getest en hij werkt"
- Checkbox is niet-blokkerend (HR kan ook zonder doorgaan)

### Opslaan

- Knop "Opslaan en verder" → server action
- Bij fout: zichtbare inline foutmelding, geen stille fallback
- Bij succes: stap 2 unlocked

---

## Stap 2 — Uitnodiging versturen

Hergebruikt de bestaande `SelfSendSetupPanel` component. Geen nieuwe bouwblokken nodig.

Eindigt met bevestigingsknop "Ik heb de uitnodiging verstuurd" → zet `launch_confirmed_at` → wizard klaar.

---

## Stap 3 — Volgen & afronden (na wizard)

Na `launch_confirmed_at` schakelt het dashboard over naar de normale state-view. Geen apart bouwwerk.

**Toegevoegd t.o.v. huidige view:** onderaan de campagnedetailpagina, zodra campagne gesloten is en rapport gereed, verschijnt een CTA-blok:

> "Je rapport is in voorbereiding. Loep neemt contact met je op om de volgende stap te bespreken."

Dit vervangt de huidige PDF-downloadknop voor klanten in de self-send flow (admins zien de downloadknop wel).

---

## Einddatum (`closes_at`)

- Wordt door Loep-admin ingesteld in het offerte-traject, niet door HR
- Als `closes_at` gevuld: zichtbaar in stap 3 als "Campagne loopt tot: [datum]" (informatief)
- Als `closes_at` null: gewoon weglaten, geen foutmelding

---

## Randgevallen

| Situatie | Gedrag |
|----------|--------|
| Browser gesloten halverwege stap 1 | State in DB — HR ziet bij terugkeer dezelfde wizardstap |
| `invited_count` = 0 of leeg | Inline validatiefout, submit geblokkeerd |
| Testlink werkt niet | Geen blocker — checkbox is informatief, niet verplicht |
| `closes_at` niet ingevuld | Einddatum stilzwijgend weggelaten |
| Klant navigeert naar `/campaigns/[id]/beheer` | Server-side redirect naar `/campaigns/[id]` |
| Opslaan stap 1 mislukt | Zichtbare foutmelding in wizard (fail-loud) |

---

## Wat niet verandert

- Backend routes, database schema, RLS policies
- Admin-view van Routefasen (5 fasen blijft intact voor `isVerisightAdmin = true`)
- Self-send kopieer-sjablonen en `SelfSendSetupPanel`
- Herinnering-flow en campagne-afsluiting
- `comms_mode = 'self_send'` als default (al geïmplementeerd)

---

## Succescriteria

- Een nieuwe klant kan van eerste login tot "uitnodiging verstuurd" komen zonder hulp van Loep
- Geen abstracte fase-termen zichtbaar voor klanten
- Dashboard toont responspercentage zodra `invited_count` ingevuld is
- Admins verliezen geen bestaande functionaliteit
